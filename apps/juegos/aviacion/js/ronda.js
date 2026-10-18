// La ronda nocturna del hub: la mecánica propia de Hub Nocturno. Pura (sin DOM): la usan la escena aislada (ronda.html), el modelo
// del juego (noches de ronda en Buenos Aires), la ronda del día y las herramientas de medición.
//
// La noche va de las 22:00 (corte) a las 07:00 (la promesa «a primera hora»). Lo que hay en el centro de transbordo a las 22:00 se
// clasifica a un ritmo fijo por hora. Cada destino tiene un avión que está listo a cierta hora y sale una sola vez. El jugador decide
// dos cosas, a toques y sin trazar nada: el orden de la cinta (qué destino se clasifica primero) y la hora de salida de cada avión
// (de a 15 minutos). El automático clasifica por orden de llegada y saca cada avión apenas está listo y junta la carga mínima.
//
// Tiempos en minutos desde las 22:00.

export const VENTANA = 540;           // de 22:00 a 07:00
export const GRILLA = 15;             // las salidas se mueven de a 15 minutos
export const PAGA_TARDE = 0.4;        // lo que llega tarde cobra el 40%, igual que el correo del juego
export const CARGA_MINIMA_AUTO = 0.3; // el automático sale apenas junta el 30% del avión
export const MEDALLAS = [['oro', 1], ['plata', 0.9], ['bronce', 0.7]];

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
export function escenaReferencia(semilla = 1, { centro = 40, radios = 6, sacas = 30, cap = 30 } = {}) {
  const r = azar(semilla * 7919 + 13);
  const elegidos = [...DESTINOS].sort(() => r() - 0.5).slice(0, radios);
  const lista = elegidos.map((d) => {
    const vuelo = alGrilla(entre(r, 120, 420));
    const limite = VENTANA - vuelo;                       // última salida que llega a primera hora
    const listo = alGrilla(entre(r, 90, Math.max(105, Math.min(270, limite - 30))));
    return { id: d.id, nombre: d.nombre, vuelo, listo, cap, sacas, yaListas: 0, tarifa: 100 };
  });
  return conOrden({ semilla, centro, radios: lista }, r);
}

// Orden en que las sacas llegaron a la cinta (por orden de llegada): una mezcla de todos los destinos.
export function conOrden(escena, r = azar(escena.semilla ?? 1)) {
  const orden = [];
  escena.radios.forEach((x, i) => { for (let k = 0; k < x.sacas - (x.yaListas ?? 0); k++) orden.push(i); });
  for (let i = orden.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [orden[i], orden[j]] = [orden[j], orden[i]]; }
  return { ...escena, orden };
}

export const limite = (x) => VENTANA - x.vuelo;

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
  const orden = [...e.radios].sort((a, b) => limite(a) - limite(b) || a.listo - b.listo).map((x) => x.id);
  const tiempos = tiemposClasificacion(e, orden);
  const salidas = {};
  e.radios.forEach((x, i) => {
    const fin = tiempos[i].length ? tiempos[i][Math.min(x.cap, tiempos[i].length) - 1] : 0;
    const tope = Math.floor(limite(x) / GRILLA) * GRILLA;
    salidas[x.id] = Math.max(Math.ceil(x.listo / GRILLA) * GRILLA, Math.min(Math.ceil(fin / GRILLA) * GRILLA, tope));
  });
  return { prioridad: orden, salidas };
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
    const ok = llega <= VENTANA ? llevadas : 0;
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
export function rondaDelDia(fechaUTC) { return escenaReferencia(semillaFecha(fechaUTC)); }
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
