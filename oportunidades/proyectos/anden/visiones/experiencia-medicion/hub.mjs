// Andén · visión «Experiencia» · medición propia (17-10-2026)
// Hub de clasificación de última milla (turno noche) con sorter de bandejas, simulado como MECANISMO (no como tasas):
// camiones con turno y desvío, andenes, cintas con acumulación (contrapresión), personas que inducen con fatiga y pausas,
// bandejas con paso fijo que giran, NO-READ, rampas con capacidad que se llenan, recirculación, personas de rampa,
// jaulas que se cierran y un puesto manual de excepciones.
// La salida es una TRAZA DE TRAMOS en columnas (qué entidad, en qué recurso, desde cuándo y hasta cuándo): la vista 2D, la 2,5D,
// la 3D y el video se dibujan desde ahí, sin pedirle nada al motor por cuadro.
// Módulo ES sin APIs de Node: corre igual en Node y en el navegador.
// Es una maqueta de medición: los parámetros son SUPUESTOS de ejemplo (fuentes en realismo-logistico.md), no un hub real,
// y usa Math.log/exp/sqrt/cos nativos (el producto usaría matemática propia; ver tecnologia-web.md §3).

export const HUB_BASE = {
  nombre: 'Hub de clasificación de última milla, turno noche (maqueta de medición)',
  camiones: { n: 26, desde: 22 * 3600, cada: 15 * 60, desvioMin: -5 * 60, desvioMax: 10 * 60, paqMedio: 923, papeleo: 5 * 60 },
  andenes: { n: 4, personas: 2, paqPorHoraPersona: 600, cv: 0.5, descarga: 3, cintaLargo: 40, cintaVel: 1.0 },
  buffer: 160, // paquetes que entran entre las cintas y la inducción antes de que las cintas se detengan
  induccion: { puestos: 4, medio: 2.4, cv: 0.35, fatiga: 0.15, tauFatiga: 90 * 60, pausa: 15 * 60, cadaPausa: 2 * 3600,
    escalonPausa: 10 * 60, ausentismo: 0.05, temporarios: 0, eficienciaTemporario: 0.61 },
  sorter: { recta: 70, radio: 40 / (2 * Math.PI), paso: 0.6, vel: 2.0, maxVueltas: 3, noRead: 0.015 },
  rampas: { abajo: 25, arriba: 35, capacidad: 25, zipf: 0.7, personas: 15, manejo: 4.0, cvManejo: 0.4, caminar: 2.0, jaula: 60, cierreJaula: 90 },
  manual: { personas: 2, tiempo: 20 },
  turno: { inicio: 22 * 3600, fin: 30 * 3600 },
  corte: 30 * 3600, // 06:00 del día siguiente: sale la primera ola de rutas
};

// ---------- azar con semilla: xoshiro128** sembrado con splitmix32, un flujo por fuente ----------
function splitmix32(a) {
  return () => { a = (a + 0x9e3779b9) | 0; let t = a ^ (a >>> 16); t = Math.imul(t, 0x21f0aaad); t ^= t >>> 15;
    t = Math.imul(t, 0x735a2d97); return (t ^ (t >>> 15)) >>> 0; };
}
export function flujo(semilla, fuente) {
  const sm = splitmix32(Math.imul(semilla | 0, 0x9e3779b1) ^ Math.imul(fuente + 1, 0x85ebca77));
  let a = sm(), b = sm(), c = sm(), d = sm(); if ((a | b | c | d) === 0) a = 1;
  return () => { const t = b << 9; let r = Math.imul(b, 5); r = Math.imul((r << 7) | (r >>> 25), 9);
    c ^= a; d ^= b; b ^= c; a ^= d; c ^= t; d = (d << 11) | (d >>> 21); return ((r >>> 0) + 0.5) / 4294967296; };
}
// lognormal con media m y coeficiente de variación cv; consume siempre 2 números (consumo fijo: números aleatorios comunes)
function lognormal(u, m, cv) {
  const s2 = Math.log(1 + cv * cv), mu = Math.log(m) - s2 / 2;
  const z = Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u());
  return Math.exp(mu + Math.sqrt(s2) * z);
}

// ---------- geometría (metros) ----------
export function geometria(p = HUB_BASE) {
  const S = p.sorter, R = S.radio, Lr = S.recta, L = 2 * Lr + 2 * Math.PI * R;
  const T = Math.round(L / S.paso);
  // lazo tipo estadio: recta de abajo (y=0) hacia +x, curva derecha, recta de arriba (y=2R) hacia −x, curva izquierda
  const enLazo = (s) => {
    s = ((s % L) + L) % L;
    if (s < Lr) return [s, 0, 0];
    s -= Lr; if (s < Math.PI * R) { const a = -Math.PI / 2 + s / R; return [Lr + R * Math.cos(a), R + R * Math.sin(a), a + Math.PI / 2]; }
    s -= Math.PI * R; if (s < Lr) return [Lr - s, 2 * R, Math.PI];
    s -= Lr; const a = Math.PI / 2 + s / R; return [R * Math.cos(a), R + R * Math.sin(a), a + Math.PI / 2];
  };
  const estaciones = []; for (let i = 0; i < p.induccion.puestos; i++) estaciones.push({ s: 2 + i * 2.4 });
  const rampas = [], inicioAbajo = Math.max(18, estaciones[estaciones.length - 1].s + 6);
  for (let i = 0; i < p.rampas.abajo; i++) rampas.push({ s: inicioAbajo + i * 2.0, lado: -1 });
  for (let i = 0; i < p.rampas.arriba; i++) rampas.push({ s: Lr + Math.PI * R + 1 + i * 1.95, lado: 1 });
  const excepcion = { s: 2 * Lr + Math.PI * R - 0.5, lado: 1 };
  for (const o of [...estaciones, ...rampas, excepcion]) { o.slot = Math.round(o.s / S.paso) % T; const [x, y] = enLazo(o.s); o.x = x; o.y = y; }
  const andenes = []; for (let d = 0; d < p.andenes.n; d++) andenes.push({ x: -30 + d * 6, y: -20 });
  return { L, T, R, Lr, enLazo, estaciones, rampas, excepcion, andenes, bufferFin: { x: 2, y: -3 } };
}

// tipos de tramo de la traza
export const K = { DESCARGA: 0, CINTA: 1, COLA: 2, INDUCCION: 3, BANDEJA: 4, RAMPA: 5, MANO: 6, JAULA: 7, MANUAL: 8 };

// ---------- montículo de eventos: tiempo entero en ms, desempate por número de secuencia ----------
class Monticulo {
  constructor(cap = 1 << 12) { this.t = new Float64Array(cap); this.q = new Float64Array(cap); this.k = new Int32Array(cap); this.a = new Int32Array(cap); this.n = 0; this.seq = 0; }
  crecer() { const c = this.t.length * 2; for (const f of ['t', 'q', 'k', 'a']) { const v = new this[f].constructor(c); v.set(this[f]); this[f] = v; } }
  menor(i, j) { return this.t[i] < this.t[j] || (this.t[i] === this.t[j] && this.q[i] < this.q[j]); }
  cambiar(i, j) { for (const f of ['t', 'q', 'k', 'a']) { const x = this[f][i]; this[f][i] = this[f][j]; this[f][j] = x; } }
  poner(t, k, a) {
    if (this.n === this.t.length) this.crecer();
    let i = this.n++; this.t[i] = t; this.q[i] = this.seq++; this.k[i] = k; this.a[i] = a;
    while (i > 0) { const p = (i - 1) >> 1; if (!this.menor(i, p)) break; this.cambiar(i, p); i = p; }
  }
  sacar(out) {
    out.t = this.t[0]; out.k = this.k[0]; out.a = this.a[0];
    this.n--; if (this.n > 0) { this.cambiar(0, this.n); let i = 0;
      for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < this.n && this.menor(l, m)) m = l; if (r < this.n && this.menor(r, m)) m = r; if (m === i) break; this.cambiar(i, m); i = m; } }
  }
}

const EV = { CAMION: 1, DESCARGA: 2, BUFFER: 3, INDUCIDO: 4, PAUSA_INI: 5, PAUSA_FIN: 6, TOMA: 7, ANDEN_LIBRE: 8, MANUAL: 9, CIERRE: 10 };

export function simular(p = HUB_BASE, semilla = 1, opciones = {}) {
  const conTraza = opciones.traza !== false, hasta = opciones.hasta ?? Infinity; let cortado = false;
  const G = geometria(p), T = G.T, TICK = Math.round(p.sorter.paso / p.sorter.vel * 1000);
  const NR = G.rampas.length, EXC = NR; // la rampa de excepciones es la NR
  const uCam = flujo(semilla, 1), uDes = flujo(semilla, 2), uDest = flujo(semilla, 3), uRead = flujo(semilla, 4), uAus = flujo(semilla, 5);
  const uInd = G.estaciones.map((_, i) => flujo(semilla, 100 + i)), uRam = Array.from({ length: p.rampas.personas }, (_, i) => flujo(semilla, 200 + i));
  const uMan = Array.from({ length: p.manual.personas }, (_, i) => flujo(semilla, 300 + i));
  const ms = (s) => Math.round(s * 1000);

  // destinos con pesos tipo Zipf (unas rutas reciben mucho más que otras)
  const pesos = []; let suma = 0; for (let r = 0; r < NR; r++) { const w = 1 / Math.pow(r + 1, p.rampas.zipf); pesos.push(w); suma += w; }
  const acum = []; let ac = 0; const orden = Array.from({ length: NR }, (_, i) => (i * 37) % NR); // rutas grandes repartidas por el lazo
  for (let r = 0; r < NR; r++) { ac += pesos[r] / suma; acum.push(ac); }
  const sortearDestino = () => { const u = uDest(); let r = 0; while (r < NR - 1 && acum[r] < u) r++; return orden[r]; };

  // camiones
  const C = p.camiones, nCam = C.n, llegada = [], paqs = [];
  for (let i = 0; i < nCam; i++) { llegada.push(ms(C.desde + i * C.cada + C.desvioMin + (C.desvioMax - C.desvioMin) * uCam()));
    paqs.push(Math.round(C.paqMedio * (0.85 + 0.3 * uCam()))); }
  const N = paqs.reduce((a, b) => a + b, 0);

  // paquetes (atributos sorteados al nacer)
  const creado = new Float64Array(N), destino = new Int16Array(N), noRead = new Uint8Array(N), vueltas = new Uint8Array(N),
    objetivo = new Int16Array(N), listo = new Float64Array(N).fill(-1), seqCola = new Int32Array(N), seqRampa = new Int32Array(N);
  let creados = 0;

  // traza en columnas
  let cap = conTraza ? N * 8 + 1024 : 1;
  let trE = new Int32Array(cap), trK = new Uint8Array(cap), trR = new Int32Array(cap), trA = new Int32Array(cap), trT0 = new Float64Array(cap), trT1 = new Float64Array(cap);
  let nTr = 0; const abierto = new Int32Array(N).fill(-1);
  const crecerTraza = () => { cap *= 2; const f = (v) => { const w = new v.constructor(cap); w.set(v); return w; };
    trE = f(trE); trK = f(trK); trR = f(trR); trA = f(trA); trT0 = f(trT0); trT1 = f(trT1); };
  const tramo = (e, k, r, a, t0, t1) => { if (!conTraza) return -1; if (nTr === cap) crecerTraza(); trE[nTr] = e; trK[nTr] = k; trR[nTr] = r; trA[nTr] = a; trT0[nTr] = t0; trT1[nTr] = t1; return nTr++; };
  const abrir = (e, k, r, a, t0) => { abierto[e] = tramo(e, k, r, a, t0, Infinity); };
  const cerrar = (e, t1, a) => { const i = abierto[e]; if (i >= 0) { trT1[i] = t1; if (a !== undefined) trA[i] = a; } abierto[e] = -1; };

  const H = new Monticulo(); const ev = { t: 0, k: 0, a: 0 };
  for (let i = 0; i < nCam; i++) H.poner(llegada[i], EV.CAMION, i);

  // andenes y playa
  const A = p.andenes, nA = A.n, camionEn = new Int32Array(nA).fill(-1), resta = new Int32Array(nA), bloqueado = new Uint8Array(nA);
  const playa = []; let enTransito = 0, esperaPlaya = 0;
  const intervaloDescarga = () => ms(lognormal(uDes, 3600 / (A.personas * A.paqPorHoraPersona), A.cv));
  const iniciarDescarga = (d, c, now) => { camionEn[d] = c; resta[d] = paqs[c]; esperaPlaya += now - llegada[c]; H.poner(now + intervaloDescarga(), EV.DESCARGA, d); };

  // cola FIFO de inducción (con número de secuencia para que la vista calcule el lugar en la fila con una fórmula)
  const cola = new Int32Array(N * 2); let cIni = 0, cFin = 0, seqEntra = 0;
  const encolar = (e, now) => { cola[cFin++] = e; seqCola[e] = seqEntra++; abrir(e, K.COLA, 0, seqCola[e], now); };

  // inducción
  const I = p.induccion, nI = G.estaciones.length;
  const LIBRE = 0, MANEJA = 1, ESPERA = 2, PAUSA = 3, AUSENTE = 4;
  const estado = new Uint8Array(nI), item = new Int32Array(nI).fill(-1), descanso = new Float64Array(nI).fill(ms(p.turno.inicio)),
    pausaPend = new Uint8Array(nI), efic = new Float64Array(nI).fill(1), ocupadoInd = new Float64Array(nI);
  for (let s = 0; s < nI; s++) { if (uAus() < I.ausentismo) estado[s] = AUSENTE; if (s < I.temporarios) efic[s] = I.eficienciaTemporario; }
  for (let s = 0; s < nI; s++) for (let m = 1; ms(p.turno.inicio + m * I.cadaPausa + s * I.escalonPausa) < ms(p.turno.fin); m++)
    H.poner(ms(p.turno.inicio + m * I.cadaPausa + s * I.escalonPausa), EV.PAUSA_INI, s);
  let esperandoBandeja = 0, enBandejas = 0, proxTick = 0;
  const desbloquear = (now) => { for (let d = 0; d < nA; d++) if (bloqueado[d] && enTransito + (cFin - cIni) < p.buffer) { bloqueado[d] = 0; H.poner(now, EV.DESCARGA, d); } };
  const inducir = (now) => {
    for (let s = 0; s < nI; s++) {
      if (estado[s] !== LIBRE || cIni === cFin) continue;
      const e = cola[cIni++]; cerrar(e, now); item[s] = e; estado[s] = MANEJA;
      const fat = 1 + I.fatiga * (1 - Math.exp(-(now - descanso[s]) / ms(I.tauFatiga)));
      const dt = ms(lognormal(uInd[s], I.medio * fat / efic[s], I.cv)); ocupadoInd[s] += dt;
      abrir(e, K.INDUCCION, s, 0, now); H.poner(now + dt, EV.INDUCIDO, s);
    }
    desbloquear(now);
  };

  // sorter
  const S = p.sorter, enBandeja = new Int32Array(T).fill(-1);
  const slotEst = G.estaciones.map((o) => o.slot), slotRam = [...G.rampas.map((o) => o.slot), G.excepcion.slot];
  const capRampa = new Int32Array(NR + 1).fill(p.rampas.capacidad); capRampa[EXC] = 1 << 30;
  const enRampa = new Int32Array(NR + 1), seqRam = new Int32Array(NR + 1), filaRampa = Array.from({ length: NR + 1 }, () => []), iniFila = new Int32Array(NR + 1);
  let recirculaciones = 0, llenadas = 0, colocados = 0, ticks = 0, eventos = 0;
  const porHora = new Int32Array(48);

  // personas de rampa (cada una cubre un grupo de rampas contiguas) y jaulas
  const RP = p.rampas, nW = RP.personas, grupoDe = Int32Array.from({ length: NR }, (_, r) => Math.floor(r * nW / NR)),
    rampasDe = Array.from({ length: nW }, (_, w) => Array.from({ length: NR }, (_, r) => r).filter((r) => grupoDe[r] === w)), wOcup = new Uint8Array(nW), wUlt = new Int32Array(nW).fill(-1), wItem = new Int32Array(nW).fill(-1);
  const llenoJaula = new Int32Array(NR), nroJaula = new Int32Array(NR); let terminados = 0;
  const atender = (w, now) => {
    if (wOcup[w]) return; let mejor = -1, mx = 0;
    for (const r of rampasDe[w]) if (enRampa[r] > mx) { mx = enRampa[r]; mejor = r; }
    if (mejor < 0) return;
    const r = mejor, e = filaRampa[r][iniFila[r]++]; enRampa[r]--; cerrar(e, now); marcarRampa(r, now);
    const dt = ms((wUlt[w] !== r ? RP.caminar : 0) + lognormal(uRam[w], RP.manejo, RP.cvManejo)); wUlt[w] = r; wOcup[w] = 1; wItem[w] = e;
    tramo(e, K.MANO, w, r, now, now + dt); H.poner(now + dt, EV.TOMA, w);
  };
  // puesto manual de excepciones
  const M = p.manual, mOcup = new Uint8Array(M.personas), mItem = new Int32Array(M.personas).fill(-1);
  const atenderManual = (now) => { for (let m = 0; m < M.personas; m++) { if (mOcup[m] || enRampa[EXC] === 0) continue;
    const e = filaRampa[EXC][iniFila[EXC]++]; enRampa[EXC]--; cerrar(e, now); const dt = ms(lognormal(uMan[m], M.tiempo, 0.5));
    mOcup[m] = 1; mItem[m] = e; tramo(e, K.MANUAL, m, 0, now, now + dt); H.poner(now + dt, EV.MANUAL, m); } };

  // rueda de tiempos: cada paquete en bandeja se agenda para el tick en que su bandeja pasa por su rampa (O(1) por paso)
  const rueda = Array.from({ length: T }, () => []);
  const agendar = (e, kLlega) => { rueda[kLlega % T].push(e); };
  const llenaDesde = new Float64Array(NR + 1).fill(-1); let tiempoLlena = 0;
  const marcarRampa = (r, now) => { const llena = enRampa[r] >= capRampa[r];
    if (llena && llenaDesde[r] < 0) { llenaDesde[r] = now; llenadas++; } else if (!llena && llenaDesde[r] >= 0) { tiempoLlena += now - llenaDesde[r]; llenaDesde[r] = -1; } };
  const posBandeja = new Int32Array(N); // bandeja de cada paquete
  const tick = (k) => {
    const now = k * TICK; ticks++; let coloco = false;
    if (esperandoBandeja > 0) for (let s = 0; s < nI; s++) {
      if (estado[s] !== ESPERA) continue;
      const j = (((slotEst[s] - k) % T) + T) % T; if (enBandeja[j] !== -1) continue;
      const e = item[s]; enBandeja[j] = e; posBandeja[e] = j; item[s] = -1; esperandoBandeja--; enBandejas++; colocados++; coloco = true;
      porHora[Math.floor(now / 3600000) % 48]++;
      cerrar(e, now); abrir(e, K.BANDEJA, j, 0, now); objetivo[e] = noRead[e] ? EXC : destino[e]; vueltas[e] = 0;
      agendar(e, k + (((slotRam[objetivo[e]] - slotEst[s]) % T) + T) % T);
      if (pausaPend[s]) { pausaPend[s] = 0; estado[s] = PAUSA; H.poner(now + ms(I.pausa), EV.PAUSA_FIN, s); } else estado[s] = LIBRE;
    }
    const balde = rueda[k % T]; if (balde.length) { rueda[k % T] = [];
      for (const e of balde) {
        const r = objetivo[e];
        if (enRampa[r] < capRampa[r]) {
          enBandeja[posBandeja[e]] = -1; enBandejas--; cerrar(e, now, vueltas[e]);
          filaRampa[r].push(e); seqRampa[e] = seqRam[r]++; enRampa[r]++; abrir(e, K.RAMPA, r, seqRampa[e], now); marcarRampa(r, now);
          if (r === EXC) atenderManual(now); else atender(grupoDe[r], now);
        } else {
          vueltas[e]++; recirculaciones++;
          if (vueltas[e] > S.maxVueltas) { objetivo[e] = EXC; agendar(e, k + (((slotRam[EXC] - slotRam[r]) % T) + T) % T); }
          else agendar(e, k + T);
        }
      } }
    if (coloco) inducir(now);
  };

  for (;;) {
    const te = H.n ? H.t[0] : Infinity;
    const activo = enBandejas > 0 || esperandoBandeja > 0;
    const tt = activo ? proxTick * TICK : Infinity;
    if (te === Infinity && tt === Infinity) break;
    if (Math.min(te, tt) > hasta) { cortado = true; break; }
    if (tt < te) { tick(proxTick); proxTick++; continue; }
    H.sacar(ev); eventos++; const now = ev.t, a = ev.a;
    switch (ev.k) {
      case EV.CAMION: { let d = -1; for (let x = 0; x < nA; x++) if (camionEn[x] < 0) { d = x; break; }
        if (d >= 0) iniciarDescarga(d, a, now); else playa.push(a); break; }
      case EV.DESCARGA: { const d = a; if (camionEn[d] < 0 || resta[d] === 0) break;
        if (enTransito + (cFin - cIni) >= p.buffer) { bloqueado[d] = 1; break; }
        const e = creados++; creado[e] = now; destino[e] = sortearDestino(); noRead[e] = uRead() < S.noRead ? 1 : 0;
        const t1 = now + ms(A.descarga), t2 = t1 + ms(A.cintaLargo / A.cintaVel);
        tramo(e, K.DESCARGA, d, 0, now, t1); tramo(e, K.CINTA, d, 0, t1, t2); enTransito++; H.poner(t2, EV.BUFFER, e);
        if (--resta[d] > 0) H.poner(now + intervaloDescarga(), EV.DESCARGA, d); else H.poner(now + ms(C.papeleo), EV.ANDEN_LIBRE, d);
        break; }
      case EV.ANDEN_LIBRE: { camionEn[a] = -1; if (playa.length) iniciarDescarga(a, playa.shift(), now); break; }
      case EV.BUFFER: { enTransito--; encolar(a, now); inducir(now); break; }
      case EV.INDUCIDO: { const s = a; if (enBandejas === 0 && esperandoBandeja === 0) proxTick = Math.max(proxTick, Math.ceil(now / TICK));
        estado[s] = ESPERA; esperandoBandeja++; break; }
      case EV.PAUSA_INI: { const s = a; if (estado[s] === AUSENTE) break;
        if (estado[s] === LIBRE) { estado[s] = PAUSA; H.poner(now + ms(I.pausa), EV.PAUSA_FIN, s); } else pausaPend[s] = 1; break; }
      case EV.PAUSA_FIN: { estado[a] = LIBRE; descanso[a] = now; inducir(now); break; }
      case EV.TOMA: { const w = a, e = wItem[w], r = destino[e]; wItem[w] = -1;
        tramo(e, K.JAULA, r, nroJaula[r] * 1000 + llenoJaula[r], now, Infinity); listo[e] = now; terminados++;
        if (++llenoJaula[r] === RP.jaula) { llenoJaula[r] = 0; nroJaula[r]++; H.poner(now + ms(RP.cierreJaula), EV.CIERRE, w); }
        else { wOcup[w] = 0; atender(w, now); } break; }
      case EV.CIERRE: { wOcup[a] = 0; atender(a, now); break; }
      case EV.MANUAL: { const m = a, e = mItem[m]; mItem[m] = -1; mOcup[m] = 0; noRead[e] = 0; encolar(e, now); inducir(now); atenderManual(now); break; }
    }
  }

  // ---------- indicadores ----------
  const corte = ms(p.corte); let antesCorte = 0, maxListo = 0; const espera = [];
  for (let e = 0; e < creados; e++) if (listo[e] > maxListo) maxListo = listo[e];
  for (let e = 0; e < creados; e++) { if (listo[e] >= 0) { espera.push((listo[e] - creado[e]) / 60000); if (listo[e] <= corte) antesCorte++; } }
  espera.sort((x, y) => x - y); const pct = (q) => espera.length ? espera[Math.min(espera.length - 1, Math.floor(q * espera.length))] : NaN;
  const horas = []; for (let h = 0; h < 48; h++) if (porHora[h]) horas.push([h % 24, porHora[h]]);
  const presentes = Array.from(estado).filter((x) => x !== AUSENTE).length;
  const kpi = {
    paquetes: creados, clasificados: terminados, antesDelCorte: antesCorte, pendientesAlCorte: creados - antesCorte,
    pctAlCorte: +(100 * antesCorte / creados).toFixed(2), recirculacionPct: +(100 * recirculaciones / Math.max(1, colocados)).toFixed(2),
    vecesQueUnaRampaSeLleno: llenadas, horasRampaLlena: +(tiempoLlena / 3600000).toFixed(1), inductoresPresentes: presentes,
    utilInduccionPct: +(100 * ocupadoInd.reduce((x, y) => x + y, 0) / (presentes * ms(p.turno.fin - p.turno.inicio))).toFixed(1),
    esperaP50min: +pct(0.5).toFixed(1), esperaP90min: +pct(0.9).toFixed(1), esperaPlayaMinProm: +(esperaPlaya / nCam / 60000).toFixed(1),
    ultimoClasificado: hhmm(maxListo), porHora: horas,
    eventos, ticks, tramos: nTr, bandejas: T, tickMs: TICK, cortado,
  };
  // los tramos que siguen abiertos (jaulas) se cierran al final del horizonte
  const fin = Math.max(maxListo, corte);
  if (conTraza) for (let i = 0; i < nTr; i++) if (trT1[i] === Infinity) trT1[i] = fin;
  const traza = conTraza ? { n: nTr, e: trE.subarray(0, nTr), k: trK.subarray(0, nTr), r: trR.subarray(0, nTr), a: trA.subarray(0, nTr),
    t0: trT0.subarray(0, nTr), t1: trT1.subarray(0, nTr), tick: TICK, T, inicio: llegada.reduce((x, y) => Math.min(x, y), Infinity), fin } : null;
  return { kpi, traza, geo: G };
}

export function hhmm(msT) { const m = Math.round(msT / 60000); return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }

// Variante grande: el mismo mecanismo a escala de un hub de ~90.000 paquetes por día (supuestos de ejemplo).
export function hubGrande() {
  const p = structuredClone(HUB_BASE);
  p.camiones = { ...p.camiones, n: 60, cada: 7 * 60, paqMedio: 1500 };
  p.andenes = { ...p.andenes, n: 10, personas: 3 };
  p.buffer = 400; p.induccion = { ...p.induccion, puestos: 14 };
  p.sorter = { ...p.sorter, recta: 160, radio: 60 / (2 * Math.PI), paso: 0.5, vel: 2.5 };
  p.rampas = { ...p.rampas, abajo: 60, arriba: 78, personas: 42, zipf: 0.4 };
  p.manual = { ...p.manual, personas: 4 };
  return p;
}
