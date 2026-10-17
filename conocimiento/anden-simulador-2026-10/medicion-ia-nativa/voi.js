// Medicion propia del 17-10-2026 para oportunidades/proyectos/anden/visiones/ia-nativa.md
// Pregunta: ¿se puede calcular en el navegador, mientras dura una entrevista, QUE supuesto cambia la DECISION
// (y no solo el resultado), para que el "ingeniero" de Andén pregunte primero lo que importa?
// Modelo de juguete (no es un hub real): turno de un hub con induccion manual, NO-READ que vuelve a induccion
// tras codificacion manual, pausas escalonadas, ausentismo, temporarios que rinden menos y fatiga.
// Decision: cantidad minima de puestos de induccion c tal que P(terminar todo antes del corte) >= 0,90.
// Uso: node voi.js [replicas=60] [supuesto1,supuesto2,...]  ->  imprime JSON con la tabla y el tiempo de computo.
'use strict';

// ---------- azar con semilla, un flujo por fuente (numeros aleatorios comunes) ----------
function splitmix32(a) { return function () { a |= 0; a = a + 0x9e3779b9 | 0; let z = a; z = Math.imul(z ^ z >>> 16, 0x85ebca6b); z = Math.imul(z ^ z >>> 13, 0xc2b2ae35); return (z ^ z >>> 16) >>> 0; }; }
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function xoshiro(seed) { // xoshiro128** sembrado con splitmix32
  const sm = splitmix32(seed); let a = sm(), b = sm(), c = sm(), d = sm();
  return function () {
    const r = Math.imul(((Math.imul(b, 5) << 7) | (Math.imul(b, 5) >>> 25)), 9) >>> 0;
    const t = b << 9; c ^= a; d ^= b; b ^= c; a ^= d; c ^= t; d = (d << 11) | (d >>> 21);
    return (r + 0.5) / 4294967296; // (0,1)
  };
}
const stream = (name, rep) => xoshiro(hash(name + ':' + rep) ^ 20261017);

// ---------- parametros ----------
const BASE = {
  V: 24000,            // paquetes por turno (dato que el usuario sabe)
  ventana: 360,        // minutos en que llegan los paquetes
  corte: 450,          // minuto de corte (todo inducido y resuelto)
  manual: 2,           // personas en codificacion manual (fijo en este ejercicio)
  efTemp: 0.6,         // eficiencia relativa de un temporario (Loske y Klumpp 2020: 0,46-0,61 vs 0,80-0,95 al inicio)
  // supuestos que el usuario NO sabe (valor medio = lo que pondria la IA por defecto)
  tasa: 1200,          // paquetes/h por puesto de induccion
  cv: 0.6,             // coeficiente de variacion del tiempo de induccion
  pico: 0.45,          // fraccion del volumen que llega en las 2 h pico (0,333 = llegada pareja)
  atraso: 20,          // minutos de atraso de las troncales (corre la curva)
  pausas: 40,          // minutos de pausa por persona en el turno (2 pausas escalonadas)
  ausentismo: 0.05,    // probabilidad de que falte cada puesto
  noRead: 0.02,        // fraccion de NO-READ (van a manual y vuelven a induccion)
  tasaManual: 150,     // paquetes/h por persona en codificacion manual
  temporarios: 0.25,   // fraccion de puestos con temporarios
  fatiga: 0.05,        // caida de ritmo a las 4 h sin pausa
};
const RANGOS = { // bajo, medio (=BASE), alto: lo que una entrevista no resolvio todavia
  tasa: [800, 1600], cv: [0.3, 1.0], pico: [0.333, 0.6], atraso: [0, 45], pausas: [20, 60],
  ausentismo: [0, 0.10], noRead: [0.005, 0.05], tasaManual: [100, 250], temporarios: [0, 0.5], fatiga: [0, 0.10],
};

// ---------- simulacion de un turno (eventos discretos) ----------
// tipos de evento: 0 llegada, 1 fin induccion (servidor s), 2 inicio pausa (s), 3 fin pausa (s), 4 fin manual (m)
function turno(p, c, rep) {
  const rA = stream('llegadas', rep), rW = stream('trabajo', rep), rL = stream('lectura', rep), rM = stream('manual', rep), rS = stream('ausencias', rep);
  // llegadas: Poisson no homogeneo por inversion de la intensidad acumulada (pico de 120 min centrado en el min 150)
  const V = p.V, W = p.ventana, t0 = p.atraso, pk0 = t0 + 90, pk1 = t0 + 210;
  const lamPico = p.pico * V / 120, lamResto = (1 - p.pico) * V / (W - 120);
  const Lam = (t) => { // intensidad acumulada desde t0
    const x = t - t0; if (x <= 0) return 0;
    const a = Math.min(x, 90) * lamResto, b = Math.max(0, Math.min(x, 210) - 90) * lamPico, d = Math.max(0, Math.min(x, W) - 210) * lamResto;
    return a + b + d;
  };
  const LamInv = (y) => { const y1 = 90 * lamResto, y2 = y1 + 120 * lamPico; if (y <= y1) return t0 + y / lamResto; if (y <= y2) return pk0 + (y - y1) / lamPico; return pk1 + (y - y2) / lamResto; };
  const Ltot = Lam(t0 + W);
  const arr = []; let y = 0;
  for (;;) { y += -Math.log(rA()); if (y > Ltot) break; arr.push(LamInv(y)); }
  const n = arr.length;
  // atributos sorteados al nacer (consumo fijo: 6 uniformes por paquete)
  const sig2 = Math.log(1 + p.cv * p.cv), sig = Math.sqrt(sig2), mu = -sig2 / 2;
  const w1 = new Float64Array(n), w2 = new Float64Array(n), wm = new Float64Array(n), nr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const u1 = rW(), u2 = rW(), u3 = rW(), u4 = rW();
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2), z2 = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);
    w1[i] = Math.exp(mu + sig * z1); w2[i] = Math.exp(mu + sig * z2);
    nr[i] = rL() < p.noRead ? 1 : 0; wm[i] = -Math.log(rM());
  }
  // puestos: 16 posiciones sorteadas una vez por replica (las mismas para cualquier c)
  const ua = new Float64Array(16); for (let i = 0; i < 16; i++) ua[i] = rS();
  const nTemp = Math.round(p.temporarios * c);
  const presentes = []; for (let s = 0; s < c; s++) if (ua[s] >= p.ausentismo) presentes.push(s);
  const eff = new Float64Array(16), estado = new Uint8Array(16), pend = new Uint8Array(16), ultPausa = new Float64Array(16), tarea = new Int32Array(16);
  for (let s = 0; s < c; s++) eff[s] = s >= c - nTemp ? p.efTemp : 1;
  // calendario: monticulo binario (tiempo, secuencia) con tipo y dato
  const cap = 2 * c + 8 * 16 + 64; const HT = new Float64Array(cap), HK = new Int32Array(cap), HD = new Int32Array(cap), HS = new Int32Array(cap); let hn = 0, seq = 0;
  const less = (i, j) => HT[i] < HT[j] || (HT[i] === HT[j] && HS[i] < HS[j]);
  const swap = (i, j) => { let t = HT[i]; HT[i] = HT[j]; HT[j] = t; t = HK[i]; HK[i] = HK[j]; HK[j] = t; t = HD[i]; HD[i] = HD[j]; HD[j] = t; t = HS[i]; HS[i] = HS[j]; HS[j] = t; };
  const push = (t, k, d) => { let i = hn++; HT[i] = t; HK[i] = k; HD[i] = d; HS[i] = seq++; while (i > 0) { const q = (i - 1) >> 1; if (!less(i, q)) break; swap(i, q); i = q; } };
  const pop = () => { swap(0, --hn); let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < hn && less(l, m)) m = l; if (r < hn && less(r, m)) m = r; if (m === i) break; swap(i, m); i = m; } };
  // colas (anillo) de induccion (paquete, vuelta) y manual
  const Q = new Int32Array(2 * n + 8); let qh = 0, qt = 0; const vuelta = new Uint8Array(n);
  const QM = new Int32Array(n + 8); let mh = 0, mt = 0; const mOcup = new Uint8Array(8), mTarea = new Int32Array(8);
  let pendientes = n, eventos = 0, ultimo = 0;
  let ai = 0; // las llegadas ya estan ordenadas: se mezclan con el calendario sin pasar por el monticulo
  const mitad = p.pausas / 2;
  for (const s of presentes) { const a = (s % 2 === 0) ? [120, 300] : [150, 330]; for (const tb of a) { push(tb, 2, s); push(tb + mitad, 3, s); } }
  const ritmo = (s, t) => p.tasa / 60 * eff[s] * (1 - p.fatiga * Math.min(1, (t - ultPausa[s]) / 240));
  const arrancar = (s, t) => { if (qh === qt) return; const pq = Q[qh++]; tarea[s] = pq; estado[s] = 1; const w = vuelta[pq] ? w2[pq] : w1[pq]; push(t + w / ritmo(s, t), 1, s); };
  const arrancarM = (m, t) => { if (mh === mt) return; const pq = QM[mh++]; mTarea[m] = pq; mOcup[m] = 1; push(t + wm[pq] / (p.tasaManual / 60), 4, m); };
  while (pendientes > 0 && (ai < n || hn > 0)) {
    let t, k, d;
    if (ai < n && (hn === 0 || arr[ai] <= HT[0])) { t = arr[ai]; k = 0; d = ai++; } else { t = HT[0]; k = HK[0]; d = HD[0]; pop(); }
    eventos++;
    if (k === 0) { Q[qt++] = d; for (const s of presentes) if (estado[s] === 0) { arrancar(s, t); break; } }
    else if (k === 1) {
      const s = d, pq = tarea[s]; estado[s] = 0;
      if (nr[pq] && !vuelta[pq]) { QM[mt++] = pq; for (let m = 0; m < p.manual; m++) if (!mOcup[m]) { arrancarM(m, t); break; } }
      else { pendientes--; ultimo = t; }
      if (pend[s]) { pend[s] = 0; estado[s] = 2; } else arrancar(s, t);
    } else if (k === 2) { const s = d; if (estado[s] === 0) estado[s] = 2; else pend[s] = 1; }
    else if (k === 3) { const s = d; if (pend[s]) { pend[s] = 0; continue; } /* la pausa no llego a empezar: se pierde (raro: el servicio dura segundos) */ if (estado[s] === 2) { estado[s] = 0; ultPausa[s] = t; arrancar(s, t); } }
    else if (k === 4) { const m = d, pq = mTarea[m]; mOcup[m] = 0; vuelta[pq] = 1; Q[qt++] = pq; for (const s of presentes) if (estado[s] === 0) { arrancar(s, t); break; } arrancarM(m, t); }
  }
  return { ok: pendientes === 0 && ultimo <= p.corte, fin: pendientes === 0 ? ultimo : Infinity, eventos };
}

// ---------- decision por simulacion y por formula fluida ----------
let EVENTOS = 0, TURNOS = 0;
function pExito(p, c, R) { let ok = 0, sumFin = 0; for (let r = 0; r < R; r++) { const x = turno(p, c, r); EVENTOS += x.eventos; TURNOS++; if (x.ok) ok++; sumFin += Math.min(x.fin, 900); } return { p: ok / R, fin: sumFin / R }; }
function fluida(p) { // capacidad media por puesto (paq/min) contra llegadas acumuladas; minimo c que vacia antes del corte
  const rmed = p.tasa / 60 * (1 - p.temporarios * (1 - p.efTemp)) * (1 - p.fatiga / 2) * (1 - p.ausentismo) * (1 - p.pausas / p.corte);
  if (p.V * p.noRead / (p.manual * p.tasaManual / 60) > p.corte - p.atraso - 60) return Infinity; // manual no da
  for (let c = 1; c <= 40; c++) {
    let q = 0; const mu = c * rmed; let fin = 0;
    for (let t = 0; t < 900; t++) {
      const x = t - p.atraso, a = (x < 0 || x >= p.ventana) ? 0 : ((x >= 90 && x < 210) ? p.pico * p.V / 120 : (1 - p.pico) * p.V / (p.ventana - 120));
      q = Math.max(0, q + a * (1 + p.noRead) - mu); if (q > 0 || x < p.ventana) fin = t + 1;
    }
    if (fin <= p.corte) return c;
  }
  return Infinity;
}
function decidir(p, R, objetivo = 0.9) {
  let c = Math.min(16, Math.max(2, fluida(p) === Infinity ? 8 : fluida(p)));
  const cache = new Map(); const ev = (c) => { if (!cache.has(c)) cache.set(c, pExito(p, c, R)); return cache.get(c); };
  if (ev(c).p >= objetivo) { while (c > 2 && ev(c - 1).p >= objetivo) c--; return { c, pc: ev(c).p }; }
  while (c < 16 && ev(c).p < objetivo) c++;
  return ev(c).p >= objetivo ? { c, pc: ev(c).p } : { c: Infinity, pc: ev(16).p };
}

// ---------- tamizado de valor de la informacion: un supuesto por vez ----------
module.exports = { turno, pExito, fluida, decidir, BASE, RANGOS };
if (require.main === module) {
const R = +process.argv[2] || 60;
const tIni = performance.now();
const dMed = decidir(BASE, R);
const filas = [];
const SOLO = process.argv[3] ? process.argv[3].split(',') : null; // subconjunto opcional (para repartir en hilos)
for (const [k, [lo, hi]] of Object.entries(RANGOS)) {
  if (SOLO && !SOLO.includes(k)) continue;
  const pLo = { ...BASE, [k]: lo }, pHi = { ...BASE, [k]: hi };
  const dLo = decidir(pLo, R), dHi = decidir(pHi, R);
  // que pasa si decido con el valor medio y la verdad es otra
  const conMedLo = pExito(pLo, Math.min(16, dMed.c), R), conMedHi = pExito(pHi, Math.min(16, dMed.c), R);
  const finMed = pExito(BASE, Math.min(16, dMed.c), R).fin;
  filas.push({
    supuesto: k, bajo: lo, medio: BASE[k], alto: hi,
    c_bajo: dLo.c, c_medio: dMed.c, c_alto: dHi.c,
    fluida_bajo: fluida(pLo), fluida_medio: fluida(BASE), fluida_alto: fluida(pHi),
    p_exito_con_c_medio_si_bajo: conMedLo.p, p_exito_con_c_medio_si_alto: conMedHi.p,
    delta_fin_min_con_c_medio: +(conMedHi.fin - conMedLo.fin).toFixed(1),
    swing_puestos: (isFinite(dHi.c) && isFinite(dLo.c)) ? Math.abs(dHi.c - dLo.c) : 'inviable en un extremo',
  });
  void finMed;
}
const seg = (performance.now() - tIni) / 1000;
// ranking por decision (cuantos puestos mueve) vs ranking por resultado (cuanto mueve el minuto de fin con c fijo)
const porDecision = [...filas].sort((a, b) => (typeof b.swing_puestos === 'string' ? 99 : b.swing_puestos) - (typeof a.swing_puestos === 'string' ? 99 : a.swing_puestos)).map(f => f.supuesto);
const porResultado = [...filas].sort((a, b) => Math.abs(b.delta_fin_min_con_c_medio) - Math.abs(a.delta_fin_min_con_c_medio)).map(f => f.supuesto);
console.log(JSON.stringify({
  fecha: '2026-10-17', replicas_por_configuracion: R, objetivo: 'P(terminar antes del corte) >= 0,90',
  decision_con_valores_medios: dMed, fluida_con_valores_medios: fluida(BASE),
  filas, ranking_por_decision: porDecision, ranking_por_resultado: porResultado,
  computo: { segundos_un_hilo: +seg.toFixed(2), turnos_simulados: TURNOS, eventos: EVENTOS, eventos_por_segundo: Math.round(EVENTOS / seg) },
  entorno: `Node ${process.version}, ${require('os').cpus()[0].model}, ${require('os').cpus().length} nucleos`,
}, null, 1));
}
