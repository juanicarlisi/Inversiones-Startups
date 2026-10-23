// La ronda nocturna del hub: la mecánica propia de Hub Nocturno. Pura (sin DOM): la usan la escena aislada (ronda.html), el modelo
// del juego (noches de ronda en Buenos Aires), la ronda del día y las herramientas de medición.
//
// La noche va de las 22:00 (corte) a las 07:00 (la promesa «a primera hora»). Lo que hay en el centro de transbordo a las 22:00 se
// clasifica a un ritmo fijo por hora. Cada destino tiene un avión que está listo a cierta hora y sale una sola vez. El jugador decide
// dos cosas, a toques y sin trazar nada: el orden de la cinta (qué destino se clasifica primero) y la hora de salida de cada avión
// (de a 15 minutos). El automático clasifica por orden de llegada y saca cada avión apenas está listo y junta la carga mínima.
//
// Tiempos en minutos desde las 22:00. Una escena puede traer su propia ventana y su propia grilla (la primera clasificación del
// capítulo 1 corre de día, con la noche como raya: ver primeraClasificacion).
import { AEROPUERTOS, AVIONES } from './datos.js';

export const VENTANA = 540;           // de 22:00 a 07:00
export const GRILLA = 15;             // las salidas se mueven de a 15 minutos
export const PAGA_TARDE = 0.4;        // lo que llega tarde cobra el 40%, igual que el correo del juego
export const CARGA_MINIMA_AUTO = 0.3; // el automático sale apenas junta el 30% del avión
// Medallas: oro con el 98% a primera hora, plata con el 85% y bronce con el 70% (con el 100% como oro, el automático de un hub
// holgado sacaba oro sin jugar; con el 98% el oro pide clasificar bien cuando el hub está justo).
export const MEDALLAS = [['oro', 0.98], ['plata', 0.85], ['bronce', 0.7]];
const ventanaDe = (e) => e?.ventana ?? VENTANA;
const grillaDe = (e) => e?.grilla ?? GRILLA;

const DESTINOS = [
  { id: 'MVD', nombre: 'Montevideo' }, { id: 'ROS', nombre: 'Rosario' }, { id: 'MDQ', nombre: 'Mar del Plata' },
  { id: 'BHI', nombre: 'Bahía Blanca' }, { id: 'COR', nombre: 'Córdoba' }, { id: 'ASU', nombre: 'Asunción' },
  { id: 'MDZ', nombre: 'Mendoza' }, { id: 'TUC', nombre: 'Tucumán' }, { id: 'CRD', nombre: 'Comodoro Rivadavia' },
  { id: 'NQN', nombre: 'Neuquén' },
];

// Generador determinista (mulberry32) para que cada escena se repita igual con la misma semilla.
export function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const entre = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const alGrilla = (m) => Math.round(m / GRILLA) * GRILLA;

// Escena de referencia: 6 radios de 30 sacas y un centro de 40 sacas por hora (lo pide el diseño). Cada noche cambia el vuelo de
// cada radio (de 2 a 7 horas, como los tramos largos del correo de los años 30), la hora a la que su avión está listo y el orden en
// que llegaron las sacas a la cinta.
// real: el vuelo sale de la distancia de verdad desde Buenos Aires y de la velocidad del avión de la época (lo usa la ronda del día).
export function escenaReferencia(semilla = 1, { centro = 40, radios = 6, sacas = 30, cap = 30, real = false } = {}) {
  const r = azar(semilla * 7919 + 13);
  const elegidos = [...DESTINOS].sort(() => r() - 0.5).slice(0, radios);
  const lista = elegidos.map((d) => {
    const azarVuelo = entre(r, 120, 420); // se sortea igual (así el resto de la escena no cambia con «real»)
    const vuelo = real ? vueloReal(d.id) : alGrilla(azarVuelo);
    const limite = VENTANA - vuelo;                       // última salida que llega a primera hora
    const listo = alGrilla(entre(r, 90, Math.max(105, Math.min(270, limite - 30))));
    return { id: d.id, nombre: d.nombre, vuelo, listo, cap, sacas, yaListas: 0, tarifa: 100 };
  });
  return conOrden({ semilla, centro, radios: lista }, r);
}

// Vuelo desde Buenos Aires con el avión de la época que llega (el más lento de 1929 que tiene alcance: la Golondrina hasta 700 km,
// el Tero hasta 950; más lejos, el bimotor de 1936), en minutos y en la grilla de 15.
const AP = Object.fromEntries(AEROPUERTOS.map((a) => [a.id, a]));
export function kmEntre(a, b) {
  const A = AP[a], B = AP[b], rad = Math.PI / 180;
  const dlat = (B.lat - A.lat) * rad, dlon = (B.lon - A.lon) * rad;
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(A.lat * rad) * Math.cos(B.lat * rad) * Math.sin(dlon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}
export function avionDeEpoca(km) {
  const porVel = [...AVIONES].sort((a, b) => a.cap - b.cap || a.vel - b.vel);
  return porVel.find((t) => t.cap === 1 && t.alcance >= km) ?? porVel.find((t) => t.alcance >= km) ?? porVel.at(-1);
}
export function vueloReal(destino, desde = 'BUE') {
  const d = kmEntre(desde, destino);
  return Math.max(GRILLA, alGrilla(d / avionDeEpoca(d).vel * 60));
}

// Orden en que las sacas llegaron a la cinta (por orden de llegada): una mezcla de todos los destinos.
export function conOrden(escena, r = azar(escena.semilla ?? 1)) {
  const orden = [];
  escena.radios.forEach((x, i) => { for (let k = 0; k < x.sacas - (x.yaListas ?? 0); k++) orden.push(i); });
  for (let i = orden.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [orden[i], orden[j]] = [orden[j], orden[i]]; }
  return { ...escena, orden };
}

export const limite = (x, e = null) => ventanaDe(e) - x.vuelo;

// Minuto en que queda clasificada cada saca de cada radio, según el orden de la cinta.
function tiemposClasificacion(e, prioridad) {
  const rango = prioridad ? Object.fromEntries(prioridad.map((id, i) => [id, i])) : null;
  const cinta = rango
    ? e.orden.map((i, j) => [i, j]).sort((a, b) => (rango[e.radios[a[0]].id] ?? 99) - (rango[e.radios[b[0]].id] ?? 99) || a[1] - b[1]).map((x) => x[0])
    : e.orden;
  const listas = e.radios.map((x) => Array(x.yaListas ?? 0).fill(0));
  cinta.forEach((i, j) => listas[i].push(((j + 1) * 60) / e.centro));
  return listas;
}

// Automático: cinta por orden de llegada; cada avión sale apenas está listo y tiene la carga mínima.
export function automatico() { return { prioridad: null, salidas: null }; }

function salidaAutomatica(x, tiempos) {
  const necesita = Math.max(1, Math.ceil(CARGA_MINIMA_AUTO * Math.min(x.cap, x.sacas)));
  const t = tiempos[Math.min(necesita, tiempos.length) - 1] ?? 0;
  return Math.ceil(Math.max(x.listo, t) / 5) * 5;
}

// Plan sugerido: la cinta clasifica primero lo que tiene que salir antes (el destino con la salida límite más temprana) y cada
// avión sale cuando termina su clasificación, sin pasarse de su límite.
export function planSugerido(e) {
  const orden = [...e.radios].sort((a, b) => limite(a, e) - limite(b, e) || a.listo - b.listo).map((x) => x.id);
  return { prioridad: orden, salidas: retener(e, orden) };
}
// Cada avión sale cuando termina de clasificarse su correo (hasta lo que entra), sin pasarse de su raya ni salir antes de estar listo.
export function retener(e, prioridad) {
  const G = grillaDe(e), tiempos = tiemposClasificacion(e, prioridad);
  const salidas = {};
  e.radios.forEach((x, i) => {
    const fin = tiempos[i].length ? tiempos[i][Math.min(x.cap, tiempos[i].length) - 1] : 0;
    const tope = Math.floor(limite(x, e) / G) * G;
    salidas[x.id] = Math.max(Math.ceil(x.listo / G) * G, Math.min(Math.ceil(fin / G) * G, tope));
  });
  return salidas;
}

export function medallaDe(pct) { for (const [m, v] of MEDALLAS) if (pct >= v - 1e-9) return m; return null; }
export function semaforo(aTiempo, sacas) { return aTiempo >= sacas ? 'verde' : aTiempo >= 0.7 * sacas ? 'amarillo' : 'rojo'; }

// Simula la noche con un plan (o el automático) y devuelve el resultado por radio y total.
export function simular(e, plan = automatico()) {
  const tiempos = tiemposClasificacion(e, plan.prioridad);
  let sacas = 0, aTiempo = 0, ingreso = 0;
  const radios = e.radios.map((x, i) => {
    const elegida = plan.salidas?.[x.id];
    const salida = elegida != null ? Math.max(x.listo, elegida) : salidaAutomatica(x, tiempos[i]);
    const clasificadas = tiempos[i].filter((m) => m <= salida + 1e-9).length;
    const llevadas = Math.min(x.cap, clasificadas);
    const llega = salida + x.vuelo;
    const ok = llega <= ventanaDe(e) ? llevadas : 0;
    sacas += x.sacas; aTiempo += ok;
    ingreso += x.tarifa * (ok + PAGA_TARDE * (x.sacas - ok));
    return { id: x.id, salida, llega, llevadas, aTiempo: ok, sacas: x.sacas, semaforo: semaforo(ok, x.sacas),
      clasificadoA: (m) => tiempos[i].filter((v) => v <= m).length };
  });
  const pct = sacas ? aTiempo / sacas : 1;
  return { sacas, aTiempo, pct, ingreso: Math.round(ingreso), medalla: medallaDe(pct), radios };
}

// ───────── estado de una ronda jugada a toques (lo usan ronda.html y el juego) ─────────
// Empieza como el automático (cinta por orden de llegada, salidas automáticas): cada toque muestra la diferencia.
// prioridad null = por orden de llegada; salidas null = automáticas.
export function nuevaRonda(e) { return { escena: e, prioridad: null, salidas: null, tocada: false }; }
const alGrillaArriba = (m) => Math.ceil(m / GRILLA) * GRILLA;
export function ordenVisible(ronda) { return ronda.prioridad ?? ronda.escena.radios.map((x) => x.id); }
// Salidas que rigen ahora (las elegidas o, si no, las que haría el automático con la cinta actual), en la grilla de 15 minutos.
export function salidasActuales(ronda) {
  if (ronda.salidas) return { ...ronda.salidas };
  const r = simular(ronda.escena, { prioridad: ronda.prioridad, salidas: null });
  return Object.fromEntries(r.radios.map((x) => [x.id, alGrillaArriba(x.salida)]));
}

// Control 1: tocar un destino lo manda al frente de la cinta.
export function alFrente(ronda, id) {
  const base = ordenVisible(ronda);
  if (!base.includes(id)) return ronda;
  ronda.prioridad = [id, ...base.filter((x) => x !== id)];
  ronda.tocada = true;
  return ronda;
}
// Control 2: mover la salida de un avión de a 15 minutos (nunca antes de que esté listo ni después de las 07:00).
export function mover(ronda, id, delta) {
  const x = ronda.escena.radios.find((r) => r.id === id);
  if (!x) return ronda;
  ronda.salidas = salidasActuales(ronda);
  const v = ronda.salidas[id] + Math.sign(delta) * GRILLA;
  ronda.salidas[id] = Math.min(VENTANA, Math.max(alGrillaArriba(x.listo), v));
  ronda.tocada = true;
  return ronda;
}
export function aplicarSugerido(ronda) {
  const p = planSugerido(ronda.escena);
  ronda.prioridad = p.prioridad; ronda.salidas = { ...p.salidas }; ronda.tocada = true;
  return ronda;
}
export function resultado(ronda) { return simular(ronda.escena, { prioridad: ronda.prioridad, salidas: ronda.salidas }); }

// ───────── la ronda del día: la misma noche para todos, una por fecha (la semilla es la fecha UTC) ─────────
export function semillaFecha(fechaUTC) {
  const f = new Date(fechaUTC);
  return f.getUTCFullYear() * 10000 + (f.getUTCMonth() + 1) * 100 + f.getUTCDate();
}
export function rondaDelDia(fechaUTC) { return escenaReferencia(semillaFecha(fechaUTC), { real: true }); }
export const PREMIO_DIA = { oro: 3000, plata: 2000, bronce: 1000 };

// Racha de días seguidos con medalla. registro = { fechas: { 'AAAA-MM-DD': medalla } }. Puro: quien llama guarda el registro.
export function claveFecha(fechaUTC) { return new Date(fechaUTC).toISOString().slice(0, 10); }
export function registrarDia(registro, fechaUTC, medalla) {
  const r = { fechas: { ...(registro?.fechas ?? {}) } };
  const k = claveFecha(fechaUTC);
  const nueva = !(k in r.fechas);
  if (nueva) r.fechas[k] = medalla ?? null; // los reintentos no cambian la medalla del día
  return { registro: r, nueva, medalla: r.fechas[k] };
}
export function racha(registro, fechaUTC) {
  let n = 0;
  for (let d = new Date(claveFecha(fechaUTC) + 'T00:00:00Z'); ; d = new Date(d.getTime() - 86400000)) {
    if (registro?.fechas?.[claveFecha(d)]) n++; else break;
  }
  return n;
}

// ───────── la primera clasificación (capítulo 1) ─────────
// Una sola decisión y un toque, antes del minuto 3: llegaron juntas las sacas de dos destinos (primero las del tramo corto) y el centro
// clasifica de a una. ¿Qué sale primero? Cada avión sale cuando termina su correo, sin pasarse de su raya (la última salida que
// llega a tiempo). Por orden de llegada sale el corto primero y el largo pierde su vuelo: cerca del 50% a tiempo; eligiendo el largo
// primero (lo que vence antes), el 100%. La resuelve el mismo motor que la ronda (simular), con una ventana propia: la del correo
// del día, que vence cuando aterrizaría a tiempo el largo clasificado primero.
// radios: [{ id, nombre, vuelo (minutos), tarifa }] (dos destinos); centro: sacas por hora del centro de verdad.
export const CLASIFICACION = { sacas: 12, grilla: 5 };
export function primeraClasificacion({ centro, radios, semilla = 1, sacas = CLASIFICACION.sacas }) {
  const G = CLASIFICACION.grilla;
  const [corto, largo] = [...radios].sort((a, b) => a.vuelo - b.vuelo);
  // si el corto, clasificado segundo, no llegaría a tiempo, se achica el lote (con un centro de 8/h y 12 sacas, sobra)
  let n = sacas;
  while (n > 2 && 2 * n * 60 / centro + corto.vuelo > largo.vuelo + Math.ceil(n * 60 / centro / G) * G) n--;
  const T1 = n * 60 / centro;                                  // lo que tarda el centro en clasificar un destino
  const ventana = largo.vuelo + Math.ceil(T1 / G) * G;
  const r = (x) => ({ id: x.id, nombre: x.nombre, vuelo: x.vuelo, listo: 0, cap: n, sacas: n, yaListas: 0, tarifa: x.tarifa });
  const lista = [r(corto), r(largo)];
  return { semilla, centro, ventana, grilla: G, radios: lista, orden: [...Array(n).fill(0), ...Array(n).fill(1)], clasificacion: true };
}
// Resultado con «primero» clasificado primero (o por orden de llegada si es null): el de simular, con lo que dura la escena.
export function resolverClasificacion(e, primero = null) {
  const prioridad = primero ? [primero, ...e.radios.map((x) => x.id).filter((id) => id !== primero)] : null;
  const r = simular(e, { prioridad, salidas: retener(e, prioridad) });
  return { ...r, prioridad, primero, duracion: Math.max(...r.radios.map((x) => x.llega)) };
}
// La opción que más paga (la que hay que clasificar primero).
export function mejorClasificacion(e) {
  let mejor = null;
  for (const x of e.radios) { const r = resolverClasificacion(e, x.id); if (!mejor || r.ingreso > mejor.ingreso) mejor = r; }
  return mejor;
}
