// Simulación pura del juego (sin DOM): demanda, rutas, aviones, transbordo, plata, misiones y ausencia.
// Se prueba con node --test (pruebas/modelo.test.mjs). El tiempo se mide en minutos de juego.
import { AEROPUERTOS, AVIONES, CARGAS, TRANSBORDO, DEMANDA, CAPITULOS, MISIONES } from './datos.js';

export const MIN_POR_SEG = 10;   // minutos de juego por segundo real a velocidad 1
export const PASO = 5;           // minutos de juego por paso de simulación
export const AUSENCIA_MAX_H = 2; // horas reales de ausencia que cuentan
export const AUSENCIA_FACTOR = 0.5; // lo que se gana ausente rinde la mitad (el anuncio lo duplica)
export const AUSENCIA_RITMO = 0.25; // ausente, el tiempo del juego corre a un cuarto (1 hora real = 6 días de juego)
const VENTA = 0.6;               // un avión usado se vende al 60%

export const AP = Object.fromEntries(AEROPUERTOS.map((a) => [a.id, a]));
export const AV = Object.fromEntries(AVIONES.map((a) => [a.id, a]));
const HUB = 'BUE';

// ───────────────────────── utilidades ─────────────────────────
const cacheKm = new Map();
export function km(a, b) {
  const llave = a < b ? a + b : b + a;
  let v = cacheKm.get(llave);
  if (v === undefined) { v = kmReal(a, b); cacheKm.set(llave, v); }
  return v;
}
function kmReal(a, b) {
  const A = AP[a], B = AP[b];
  const r = Math.PI / 180;
  const dlat = (B.lat - A.lat) * r, dlon = (B.lon - A.lon) * r;
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(A.lat * r) * Math.cos(B.lat * r) * Math.sin(dlon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

function rng(s) { // mulberry32 sobre el estado, para que las pruebas sean repetibles
  s.semilla = (s.semilla + 0x6d2b79f5) >>> 0;
  let t = s.semilla;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const idRuta = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const clave = (o, d, c) => `${o}>${d}>${c}`;

export function tarifa(c, kmOD) { return CARGAS[c].base + CARGAS[c].porKm * kmOD; }

export function fecha(s) { return new Date(s.t0 + s.t * 60000); }
export function hora(s) { const f = fecha(s); return f.getUTCHours() + f.getUTCMinutes() / 60; }
export function esNoche(s) { const h = hora(s); return h >= 20 || h < 6; }

export function capitulo(s) { return CAPITULOS[s.cap - 1]; }

// ───────────────────────── estado ─────────────────────────
export function nuevoEstado(semilla = 20291101) {
  const c = CAPITULOS[0];
  return {
    v: 1, cap: 1, semilla,
    t0: Date.UTC(c.inicio.a, c.inicio.m - 1, c.inicio.d, 6, 0), t: 0,
    dinero: c.dineroInicial,
    niveles: {},              // nivel del centro de transbordo por aeropuerto
    rutas: [],
    aviones: [],
    colas: {},                // aeropuerto → clave o>d>c → { n, tc }
    transbordo: {},           // aeropuerto → clave → { n, tc }
    acum: {},                 // fracciones de demanda pendientes por clave
    tbAcum: {},               // fracciones de capacidad de transbordo por aeropuerto
    stats: { entregas: { correo: 0, pasajeros: 0, carga: 0 }, transbordos: {}, perdidas: 0, ingresos: 0, gastos: 0 },
    hora24: Array(24).fill(0), horaIdx: 0, netoHora: 0,
    misiones: [],
    clima: { combustible: 1, tormenta: null, ultimoDia: 0 },
    sigId: 1,
  };
}

// ───────────────────────── red y ruteo ─────────────────────────
const cacheRed = new WeakMap();
export function red(s) {
  const firma = s.rutas.map((r) => r.id).join(',');
  const c = cacheRed.get(s);
  if (c && c.firma === firma) return c;
  const adj = {};
  for (const r of s.rutas) { (adj[r.a] ??= []).push(r.b); (adj[r.b] ??= []).push(r.a); }
  const nodos = Object.keys(adj);
  const sig = {}; // sig[o][d] = próximo aeropuerto
  for (const o of nodos) { // BFS por escalas; a igual escalas, menos km
    const dist = { [o]: 0 }, kmAc = { [o]: 0 }, prim = {};
    let frente = [o];
    while (frente.length) {
      const nuevo = [];
      for (const u of frente) for (const v of adj[u]) {
        const k = kmAc[u] + km(u, v);
        if (dist[v] === undefined) { dist[v] = dist[u] + 1; kmAc[v] = k; prim[v] = u === o ? v : prim[u]; nuevo.push(v); }
        else if (dist[v] === dist[u] + 1 && k < kmAc[v]) { kmAc[v] = k; prim[v] = u === o ? v : prim[u]; }
      }
      frente = nuevo;
    }
    sig[o] = prim;
  }
  const res = { firma, adj, nodos, sig };
  cacheRed.set(s, res);
  return res;
}

export function enRed(s, ap) { return !!red(s).adj[ap]; }

// ───────────────────────── reglas de compra ─────────────────────────
export function costoRuta(a, b) { return Math.round((2000 + 5 * km(a, b)) / 100) * 100; }
export function costoBalizas(ruta) { return Math.round(30 * ruta.km / 100) * 100; }
export function misionHecha(s, id) { return s.misiones.includes(id); }

export function avionDisponible(s, tipo) {
  const t = typeof tipo === 'string' ? AV[tipo] : tipo;
  return t.cap <= s.cap && (!t.desbloquea || misionHecha(s, t.desbloquea));
}
export function avionesDisponibles(s) { return AVIONES.filter((t) => avionDisponible(s, t)); }

export function puedeAbrirRuta(s, a, b) {
  if (a === b || !AP[a] || !AP[b]) return { ok: false, error: 'invalida' };
  if (AP[a].cap > s.cap || AP[b].cap > s.cap) return { ok: false, error: 'bloqueada' };
  const id = idRuta(a, b);
  if (s.rutas.some((r) => r.id === id)) return { ok: false, error: 'existe' };
  const nodos = red(s).nodos;
  if (nodos.length === 0 ? a !== HUB && b !== HUB : !enRed(s, a) && !enRed(s, b)) return { ok: false, error: 'desconectada' };
  const d = km(a, b);
  if (!avionesDisponibles(s).some((t) => t.alcance >= d)) return { ok: false, error: 'alcance', km: d };
  const costo = costoRuta(a, b);
  if (s.dinero < costo) return { ok: false, error: 'plata', costo };
  return { ok: true, costo, km: d };
}

export function abrirRuta(s, a, b) {
  const p = puedeAbrirRuta(s, a, b);
  if (!p.ok) return p;
  s.dinero -= p.costo; s.stats.gastos += p.costo;
  const ruta = { id: idRuta(a, b), a, b, km: p.km, balizas: false, minCarga: 0.3, esperaMax: 240, vuelos: 0, ingresos: 0, costos: 0, ocup: 0 };
  s.rutas.push(ruta);
  return { ok: true, ruta };
}

export function cerrarRuta(s, id) {
  const r = s.rutas.find((x) => x.id === id);
  if (!r) return { ok: false };
  for (const av of s.aviones.filter((x) => x.ruta === id)) venderAvion(s, av.id);
  s.rutas = s.rutas.filter((x) => x.id !== id);
  return { ok: true };
}

export function comprarAvion(s, tipoId, rutaId) {
  const t = AV[tipoId], r = s.rutas.find((x) => x.id === rutaId);
  if (!t || !r) return { ok: false, error: 'invalida' };
  if (!avionDisponible(s, t)) return { ok: false, error: 'bloqueado' };
  if (t.alcance < r.km) return { ok: false, error: 'alcance' };
  if (s.dinero < t.precio) return { ok: false, error: 'plata', costo: t.precio };
  s.dinero -= t.precio; s.stats.gastos += t.precio;
  const base = enRed(s, HUB) && (r.a === HUB || r.b === HUB) ? HUB : r.a;
  const av = { id: s.sigId++, tipo: tipoId, ruta: rutaId, en: base, hacia: base === r.a ? r.b : r.a,
    fase: 'tierra', resta: 15, dur: 15, carga: [], espera: null };
  s.aviones.push(av);
  return { ok: true, avion: av };
}

export function venderAvion(s, avionId) {
  const av = s.aviones.find((x) => x.id === avionId);
  if (!av) return { ok: false };
  const monto = Math.round(AV[av.tipo].precio * VENTA);
  s.dinero += monto;
  s.aviones = s.aviones.filter((x) => x.id !== avionId);
  return { ok: true, monto };
}

export function ponerBalizas(s, rutaId) {
  const r = s.rutas.find((x) => x.id === rutaId);
  if (!r || r.balizas) return { ok: false };
  const costo = costoBalizas(r);
  if (s.dinero < costo) return { ok: false, error: 'plata', costo };
  s.dinero -= costo; s.stats.gastos += costo; r.balizas = true;
  return { ok: true };
}

export const CARGA_MINIMA = [0, 0.3, 0.6, 0.9];
export function fijarCargaMinima(s, rutaId, v) {
  const r = s.rutas.find((x) => x.id === rutaId);
  if (!r || !CARGA_MINIMA.includes(v)) return { ok: false };
  r.minCarga = v; return { ok: true };
}

export function capacidadTransbordo(s, ap) { return TRANSBORDO[s.niveles[ap] ?? 0].u; }
export function mejorarTransbordo(s, ap) {
  const n = (s.niveles[ap] ?? 0) + 1;
  if (n >= TRANSBORDO.length) return { ok: false, error: 'maximo' };
  const costo = TRANSBORDO[n].precio;
  if (s.dinero < costo) return { ok: false, error: 'plata', costo };
  s.dinero -= costo; s.stats.gastos += costo; s.niveles[ap] = n;
  return { ok: true };
}

// ───────────────────────── demanda ─────────────────────────
function factorDistancia(c, d) {
  if (c === 'correo') return 0.7 + 0.3 * Math.min(1, d / 400);
  return (0.5 + 0.5 * Math.min(1, d / 500)) / (1 + d / 5000);
}

function factorTemporada(s, c) {
  const f = fecha(s);
  return c === 'correo' && f.getUTCMonth() === 11 && f.getUTCDate() >= 10 && f.getUTCDate() <= 24 ? 1.8 : 1;
}

export function demandaHora(s, o, d, c) {
  const era = capitulo(s).cargas[c];
  if (!era) return 0;
  return DEMANDA[c].k * era * Math.sqrt(AP[o].peso * AP[d].peso) * factorDistancia(c, km(o, d)) * factorTemporada(s, c);
}

const topeGrupo = (porHora) => Math.ceil(4 * porHora + 20);

// Cada aeropuerto tiene sus colas agrupadas por destino final y tipo de carga (clave «destino>carga»).
// Grupo: n = unidades, tc = minuto de creación (promedio), p = fracción de la tarifa ya cobrada en tramos anteriores,
// km = distancia del origen al destino final (promedio; la tarifa es lineal en km, así que el promedio cobra exacto).
function sumar(cola, d, c, n, tc, p, kmOD) {
  const k = `${d}>${c}`;
  const g = cola[k];
  if (!g) { cola[k] = { d, c, n, tc, p, km: kmOD }; return; }
  const tot = g.n + n;
  g.tc = (g.tc * g.n + tc * n) / tot;
  g.p = (g.p * g.n + p * n) / tot;
  g.km = (g.km * g.n + kmOD * n) / tot;
  g.n = tot;
}

// Pares origen-destino con su demanda por hora; se recalcula solo si cambia la red, el capítulo o la temporada.
const cachePares = new WeakMap();
function pares(s) {
  const { firma, nodos, sig } = red(s);
  const llave = `${firma}|${s.cap}|${factorTemporada(s, 'correo')}`;
  const c = cachePares.get(s);
  if (c && c.llave === llave) return c.lista;
  const lista = [];
  for (const o of nodos) for (const d of nodos) {
    if (o === d || !sig[o][d]) continue;
    for (const cg of Object.keys(capitulo(s).cargas)) {
      const porHora = demandaHora(s, o, d, cg);
      lista.push({ o, d, c: cg, k: clave(o, d, cg), km: km(o, d), porHora, tope: topeGrupo(porHora) });
    }
  }
  cachePares.set(s, { llave, lista });
  return lista;
}

function generarDemanda(s, dt) {
  for (const x of pares(s)) {
    const ac = (s.acum[x.k] ?? 0) + x.porHora * dt / 60;
    const n = Math.floor(ac);
    s.acum[x.k] = ac - n;
    if (!n) continue;
    const cola = (s.colas[x.o] ??= {});
    const libre = x.tope - (cola[`${x.d}>${x.c}`]?.n ?? 0);
    const entra = Math.max(0, Math.min(n, libre));
    if (entra) sumar(cola, x.d, x.c, entra, s.t, 0, x.km);
    s.stats.perdidas += n - entra;
  }
}

// ───────────────────────── transbordo ─────────────────────────
function procesarTransbordo(s, dt) {
  const { sig } = red(s);
  for (const ap of Object.keys(s.transbordo)) {
    const tb = s.transbordo[ap];
    const grupos = Object.entries(tb);
    if (!grupos.length) { s.tbAcum[ap] = 0; continue; }
    grupos.sort((x, y) => x[1].tc - y[1].tc);
    let presup = (s.tbAcum[ap] ?? 0) + capacidadTransbordo(s, ap) * dt / 60;
    for (const [k, g] of grupos) {
      if (!sig[ap]?.[g.d]) { s.stats.perdidas += g.n; delete tb[k]; continue; } // ya no hay camino
      const n = Math.min(g.n, Math.floor(presup));
      if (n <= 0) break;
      presup -= n; g.n -= n;
      sumar((s.colas[ap] ??= {}), g.d, g.c, n, g.tc, g.p, g.km);
      s.stats.transbordos[ap] = (s.stats.transbordos[ap] ?? 0) + n;
      if (g.n <= 0) delete tb[k];
    }
    s.tbAcum[ap] = Math.min(presup, 1);
  }
}

export function enTransbordo(s, ap) { let n = 0; for (const g of Object.values(s.transbordo[ap] ?? {})) n += g.n; return n; }
export function enEspera(s, ap, c) { let n = 0; for (const g of Object.values(s.colas[ap] ?? {})) if (!c || g.c === c) n += g.n; return n; }

// ───────────────────────── aviones ─────────────────────────
function cerrado(s, ap) {
  const tm = s.clima.tormenta;
  return tm && s.t < tm.hasta && tm.zona.includes(ap);
}

// Unidades que esperan en «desde» para seguir hacia «hacia», hasta la capacidad del avión.
function paraLlevar(s, desde, hacia, t) {
  const sig = red(s).sig[desde];
  if (!sig) return 0;
  const libre = { ...t.lleva };
  let n = 0;
  for (const g of Object.values(s.colas[desde] ?? {})) {
    if (!libre[g.c] || sig[g.d] !== hacia) continue;
    const x = Math.min(g.n, libre[g.c]); libre[g.c] -= x; n += x;
  }
  return n;
}
const capTotal = (t) => Object.values(t.lleva).reduce((a, b) => a + b, 0);

function cargar(s, av, t) {
  const sig = red(s).sig[av.en] ?? {};
  const cola = s.colas[av.en] ?? {};
  const grupos = Object.entries(cola).filter(([, g]) => t.lleva[g.c] && sig[g.d] === av.hacia).sort((x, y) => x[1].tc - y[1].tc);
  const libre = { ...t.lleva };
  const carga = [];
  for (const [k, g] of grupos) {
    const n = Math.min(g.n, libre[g.c]);
    if (n <= 0) continue;
    libre[g.c] -= n; g.n -= n;
    carga.push({ d: g.d, c: g.c, n, tc: g.tc, p: g.p, km: g.km });
    if (g.n <= 0) delete cola[k];
  }
  return carga;
}

export function ocupacion(carga, t) { return carga.reduce((a, x) => a + x.n, 0) / capTotal(t); }

// El cliente paga completo si llega dentro de lo prometido; después, cada vez menos (hasta la mitad a los 6 días de atraso).
export function puntualidad(edadMin, kmOD) {
  const promesa = 12 + kmOD / 100; // horas
  const h = edadMin / 60;
  return h <= promesa ? 1 : Math.max(0.5, 1 - (h - promesa) / 288);
}

function moverAviones(s, dt, eventos) {
  const rutas = Object.fromEntries(s.rutas.map((r) => [r.id, r]));
  for (const av of s.aviones) {
    const t = AV[av.tipo];
    const r = rutas[av.ruta];
    if (!r) continue;
    av.resta -= dt;
    if (av.resta > 0) continue;
    if (av.fase === 'tierra') {
      if (!t.nocturno && !r.balizas && esNoche(s)) { av.espera = 'noche'; av.resta = PASO; continue; }
      if (cerrado(s, av.en) || cerrado(s, av.hacia)) { av.espera = 'tormenta'; av.resta = PASO; continue; }
      // Sale cuando junta la carga mínima de la ruta o cuando se cumple la espera máxima (si hay algo para llevar en algún sentido).
      const aca = paraLlevar(s, av.en, av.hacia, t);
      if (aca / capTotal(t) < (r.minCarga ?? 0.3) && (av.esperado ?? 0) < (r.esperaMax ?? 240)) {
        av.espera = 'carga'; av.esperado = (av.esperado ?? 0) + PASO; av.resta = PASO; continue;
      }
      if (!aca && !paraLlevar(s, av.hacia, av.en, t)) { av.espera = 'vacio'; av.resta = 3 * PASO; continue; }
      av.esperado = 0;
      av.carga = cargar(s, av, t);
      const horas = r.km / t.vel;
      const costo = Math.round(r.km * t.costoKm * s.clima.combustible + t.tripHora * horas + t.aterrizaje);
      s.dinero -= costo; s.stats.gastos += costo; s.netoHora -= costo; r.costos += costo; r.vuelos++;
      r.ocup = r.vuelos === 1 ? ocupacion(av.carga, t) : r.ocup * 0.85 + 0.15 * ocupacion(av.carga, t);
      av.fase = 'vuelo'; av.dur = Math.max(PASO, Math.round(horas * 60)); av.resta += av.dur; av.espera = null;
    } else {
      let cobro = 0;
      const tb = (s.transbordo[av.hacia] ??= {});
      // Se cobra por tramo: cada ruta cobra la parte de la tarifa que corresponde a sus km (así cada ruta muestra lo que deja)
      // y el destino final cobra lo que falte.
      for (const x of av.carga) {
        const fin = x.d === av.hacia;
        const parte = fin ? 1 - x.p : Math.min(1 - x.p, r.km / x.km);
        cobro += x.n * tarifa(x.c, x.km) * parte * puntualidad(s.t - x.tc, x.km);
        if (fin) s.stats.entregas[x.c] += x.n;
        else sumar(tb, x.d, x.c, x.n, x.tc, x.p + parte, x.km);
      }
      cobro = Math.round(cobro);
      if (cobro) { s.dinero += cobro; s.stats.ingresos += cobro; s.netoHora += cobro; r.ingresos += cobro; eventos.push({ tipo: 'cobro', ap: av.hacia, monto: cobro }); }
      av.carga = []; av.fase = 'tierra';
      [av.en, av.hacia] = [av.hacia, av.en];
      av.dur = t.giro; av.resta += t.giro;
    }
  }
}

// ───────────────────────── clima y calendario ─────────────────────────
function clima(s, eventos) {
  const dia = Math.floor(s.t / 1440);
  if (dia === s.clima.ultimoDia) return;
  s.clima.ultimoDia = dia;
  s.clima.combustible = Math.min(1.5, Math.max(0.7, s.clima.combustible * (1 + (rng(s) - 0.5) * 0.08)));
  if (s.clima.tormenta && s.t >= s.clima.tormenta.hasta) s.clima.tormenta = null;
  const nodos = red(s).nodos;
  if (!s.clima.tormenta && nodos.length > 2 && rng(s) < 0.12) {
    const sur = nodos.filter((a) => AP[a].lat < -40);
    const zona = sur.length >= 2 && rng(s) < 0.7 ? sur : nodos.filter(() => rng(s) < 0.25);
    if (zona.length) {
      s.clima.tormenta = { zona, hasta: s.t + 240 + Math.floor(rng(s) * 360) };
      eventos.push({ tipo: 'tormenta', zona });
    }
  }
}

function cerrarHora(s) {
  const h = Math.floor(s.t / 60);
  while (s.horaIdx < h) {
    s.hora24[s.horaIdx % 24] = s.netoHora;
    s.netoHora = 0;
    s.horaIdx++;
  }
}
export function gananciaDia(s) { return s.hora24.reduce((a, b) => a + b, 0); }

// ───────────────────────── misiones ─────────────────────────
export function misionActual(s) { return MISIONES.find((m) => m.cap === s.cap && !misionHecha(s, m.id)) ?? null; }

export function progreso(s, m) {
  switch (m.tipo) {
    case 'ruta': return s.rutas.some((r) => r.id === idRuta(m.a, m.b)) ? 1 : 0;
    case 'conectada': return enRed(s, m.ciudad) ? 1 : 0;
    case 'balizas': return s.rutas.filter((r) => r.balizas).length;
    case 'transbordos': return s.stats.transbordos[m.ciudad] ?? 0;
    case 'gananciaDia': return Math.max(0, gananciaDia(s));
    case 'entregas': return s.stats.entregas[m.carga];
    case 'ciudades': return red(s).nodos.length;
    case 'avion': return s.aviones.filter((a) => a.tipo === m.avion).length;
    case 'conectadas': return m.ciudades.filter((c) => enRed(s, c)).length;
    default: return 0;
  }
}

function revisarMisiones(s, eventos) {
  let m = misionActual(s);
  while (m && progreso(s, m) >= m.meta) {
    s.misiones.push(m.id);
    s.dinero += m.premio;
    eventos.push({ tipo: 'mision', id: m.id, premio: m.premio });
    if (m.cierra) { eventos.push({ tipo: 'capitulo', cap: s.cap }); break; }
    m = misionActual(s);
  }
}

export function capituloTerminado(s) {
  const fin = MISIONES.find((m) => m.cap === s.cap && m.cierra);
  return fin ? misionHecha(s, fin.id) : false;
}

export function avanzarCapitulo(s) {
  if (!capituloTerminado(s) || s.cap >= CAPITULOS.length) return { ok: false };
  s.cap++;
  const c = capitulo(s);
  s.t0 = Date.UTC(c.inicio.a, c.inicio.m - 1, c.inicio.d, 6, 0); s.t = 0;
  s.horaIdx = 0; s.hora24 = Array(24).fill(0); s.netoHora = 0; s.clima.ultimoDia = 0; s.clima.tormenta = null;
  s.dinero += c.premio ?? 0;
  return { ok: true };
}

// ───────────────────────── paso y ausencia ─────────────────────────
export function paso(s, dt = PASO) {
  const eventos = [];
  s.t += dt;
  clima(s, eventos);
  generarDemanda(s, dt);
  procesarTransbordo(s, dt);
  moverAviones(s, dt, eventos);
  cerrarHora(s);
  revisarMisiones(s, eventos);
  return eventos;
}

// Simula el tiempo que el jugador no estuvo (pestaña cerrada u oculta). Devuelve lo ganado neto.
export function simularAusencia(s, segundosReales) {
  const seg = Math.min(segundosReales, AUSENCIA_MAX_H * 3600);
  const minutos = Math.floor(seg * MIN_POR_SEG * AUSENCIA_RITMO / PASO) * PASO;
  if (minutos < 60) return { minutos: 0, neto: 0, eventos: [] };
  const antes = s.dinero;
  const eventos = [];
  for (let m = 0; m < minutos; m += PASO * 2) for (const e of paso(s, PASO * 2)) if (e.tipo !== 'cobro') eventos.push(e);
  const bruto = s.dinero - antes;
  const neto = bruto > 0 ? Math.round(bruto * AUSENCIA_FACTOR) : bruto;
  s.dinero = antes + neto;
  return { minutos, neto, extra: bruto > 0 ? bruto - neto : 0, eventos };
}

// ───────────────────────── resúmenes para la interfaz ─────────────────────────
export function resumenRuta(s, id) {
  const r = s.rutas.find((x) => x.id === id);
  if (!r) return null;
  const aviones = s.aviones.filter((a) => a.ruta === id);
  const caps = Object.keys(capitulo(s).cargas);
  const demanda = caps.map((c) => ({ c, ida: demandaHora(s, r.a, r.b, c), vuelta: demandaHora(s, r.b, r.a, c) }));
  return { ...r, aviones, demanda, neto: r.ingresos - r.costos };
}

export function potencial(s, ap) { // demanda por hora que traería conectar este aeropuerto a la red actual (o al hub)
  const nodos = red(s).nodos.length ? red(s).nodos : [HUB];
  let total = 0;
  for (const n of nodos) if (n !== ap) for (const c of Object.keys(capitulo(s).cargas)) total += demandaHora(s, ap, n, c) + demandaHora(s, n, ap, c);
  return total;
}

export function guardar(s) { return JSON.stringify({ ...s, guardado: Date.now() }); }
export function restaurar(texto) {
  const s = JSON.parse(texto);
  if (s?.v !== 1) return null;
  return s;
}
