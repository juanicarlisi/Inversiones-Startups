// explicacion/consulta.ts · Andén simulador, corte 1, P7 · Consultas sobre la traza (índices por entidad, solapes, búsquedas).
// La traza es columnar y viene en el orden en que se cerraron los tramos, no en el orden en que empezaron. Para recorrer «los tramos de
// este paquete en orden» hay que agrupar por entidad y ordenar; se hace una vez por traza (WeakMap) y se reutiliza.
import { ClaseEntidad, TipoTramo, claseDeRef, idDeRef } from '../contratos/traza.ts';
import type { Traza } from '../contratos/traza.ts';

export type FamiliaDeEntidad = 'paquete' | 'camion' | 'persona';

/** Tramos agrupados por entidad: los de la entidad e son `tramos[inicio[e] .. inicio[e + 1])`, ordenados por (t0, índice). */
export interface ListaPorEntidad {
  readonly inicio: Int32Array;
  readonly tramos: Int32Array;
  /** Duración máxima de un tramo de cada entidad (acota la búsqueda hacia atrás en los solapes). */
  readonly maxDuracion: Float64Array;
}

const FAMILIAS: Record<FamiliaDeEntidad, (k: number) => boolean> = {
  paquete: (k) => k >= TipoTramo.DESCARGA && k <= TipoTramo.MANUAL,
  camion: (k) => k === TipoTramo.CAMION_PLAYA || k === TipoTramo.CAMION_ANDEN,
  persona: (k) => k >= TipoTramo.PERSONA_TRABAJA && k <= TipoTramo.PERSONA_CIERRA_JAULA,
};

interface CacheDeTraza {
  listas: Partial<Record<FamiliaDeEntidad, ListaPorEntidad>>;
  detenidos?: { tramos: Int32Array; maxDuracion: number };
  paquetePorClave?: Map<number, number>;
  vueltasPorRampa?: Map<number, number[]>;
}
const CACHE = new WeakMap<Traza, CacheDeTraza>();
function cacheDe(t: Traza): CacheDeTraza {
  let c = CACHE.get(t);
  if (!c) { c = { listas: {} }; CACHE.set(t, c); }
  return c;
}

/** Fin efectivo de un tramo: los abiertos (t1 = Infinity) se cierran en el fin de la traza. */
export function finDeTramo(t: Traza, i: number): number {
  const f = t.tramos.t1[i];
  return f === Infinity ? t.fin : f;
}

export function listaDe(t: Traza, familia: FamiliaDeEntidad): ListaPorEntidad {
  const cache = cacheDe(t);
  const hecha = cache.listas[familia];
  if (hecha) return hecha;
  const acepta = FAMILIAS[familia];
  const { n, e, k, t0 } = t.tramos;
  let maxE = -1;
  for (let i = 0; i < n; i++) if (e[i] >= 0 && acepta(k[i]) && e[i] > maxE) maxE = e[i];
  const cantidad = maxE + 1;
  const inicio = new Int32Array(cantidad + 1);
  for (let i = 0; i < n; i++) if (e[i] >= 0 && acepta(k[i])) inicio[e[i] + 1]++;
  for (let c = 0; c < cantidad; c++) inicio[c + 1] += inicio[c];
  const tramos = new Int32Array(inicio[cantidad]);
  const pos = inicio.slice(0, cantidad);
  for (let i = 0; i < n; i++) if (e[i] >= 0 && acepta(k[i])) tramos[pos[e[i]]++] = i;
  const maxDuracion = new Float64Array(cantidad);
  for (let c = 0; c < cantidad; c++) {
    const trozo = tramos.subarray(inicio[c], inicio[c + 1]);
    trozo.sort((x, y) => (t0[x] - t0[y]) || (x - y));
    let m = 0;
    for (const i of trozo) { const d = finDeTramo(t, i) - t0[i]; if (d > m) m = d; }
    maxDuracion[c] = m;
  }
  const lista: ListaPorEntidad = { inicio, tramos, maxDuracion };
  cache.listas[familia] = lista;
  return lista;
}

const VACIO = new Int32Array(0);
/** Índices de tramo de una entidad, ordenados por (t0, índice). Vacío si la entidad no tiene tramos. */
export function tramosDe(t: Traza, familia: FamiliaDeEntidad, id: number): Int32Array {
  const l = listaDe(t, familia);
  if (!Number.isInteger(id) || id < 0 || id >= l.inicio.length - 1) return VACIO;
  return l.tramos.subarray(l.inicio[id], l.inicio[id + 1]);
}

export interface ActividadDePersona {
  pausa: number; ausente: number; cierre: number;   // ms de solape con [desde, hasta)
  tramosPausa: number[]; tramosAusente: number[]; tramosCierre: number[];   // a lo sumo 4 de cada una
}

/** Cuánto de [desde, hasta) estuvo la persona de pausa, ausente o cerrando una jaula (con los tramos que lo prueban). */
export function actividadDePersona(t: Traza, persona: number, desde: number, hasta: number): ActividadDePersona {
  const r: ActividadDePersona = { pausa: 0, ausente: 0, cierre: 0, tramosPausa: [], tramosAusente: [], tramosCierre: [] };
  const l = listaDe(t, 'persona');
  if (!Number.isInteger(persona) || persona < 0 || persona >= l.inicio.length - 1) return r;
  const a = l.inicio[persona], b = l.inicio[persona + 1];
  const { t0, k } = t.tramos;
  // primer tramo que podría tocar el intervalo: empieza a más tardar `maxDuracion` antes de `desde`
  const piso = desde - l.maxDuracion[persona];
  let lo = a, hi = b;
  while (lo < hi) { const mid = (lo + hi) >>> 1; if (t0[l.tramos[mid]] < piso) lo = mid + 1; else hi = mid; }
  for (let j = lo; j < b; j++) {
    const i = l.tramos[j];
    if (t0[i] >= hasta) break;
    const ov = Math.min(finDeTramo(t, i), hasta) - Math.max(t0[i], desde);
    if (!(ov > 0)) continue;
    if (k[i] === TipoTramo.PERSONA_PAUSA) { r.pausa += ov; if (r.tramosPausa.length < 4) r.tramosPausa.push(i); }
    else if (k[i] === TipoTramo.PERSONA_AUSENTE) { r.ausente += ov; if (r.tramosAusente.length < 4) r.tramosAusente.push(i); }
    else if (k[i] === TipoTramo.PERSONA_CIERRA_JAULA) { r.cierre += ov; if (r.tramosCierre.length < 4) r.tramosCierre.push(i); }
  }
  return r;
}

function detenidosDe(t: Traza): { tramos: Int32Array; maxDuracion: number } {
  const cache = cacheDe(t);
  if (cache.detenidos) return cache.detenidos;
  const { n, k, t0 } = t.tramos;
  let c = 0;
  for (let i = 0; i < n; i++) if (k[i] === TipoTramo.LAZO_DETENIDO) c++;
  const tramos = new Int32Array(c);
  c = 0;
  for (let i = 0; i < n; i++) if (k[i] === TipoTramo.LAZO_DETENIDO) tramos[c++] = i;
  tramos.sort((x, y) => (t0[x] - t0[y]) || (x - y));
  let maxDuracion = 0;
  for (const i of tramos) { const d = finDeTramo(t, i) - t0[i]; if (d > maxDuracion) maxDuracion = d; }
  cache.detenidos = { tramos, maxDuracion };
  return cache.detenidos;
}

/** Tramos LAZO_DETENIDO (ordenados por inicio). */
export function tramosDetenidos(t: Traza): Int32Array {
  return detenidosDe(t).tramos;
}

/** Cuánto de [desde, hasta) estuvo el lazo detenido, y qué tramos lo prueban (a lo sumo 4). */
export function solapeDetenido(t: Traza, desde: number, hasta: number): { ms: number; tramos: number[] } {
  const d = detenidosDe(t);
  const { t0 } = t.tramos;
  const piso = desde - d.maxDuracion;
  let lo = 0, hi = d.tramos.length;
  while (lo < hi) { const mid = (lo + hi) >>> 1; if (t0[d.tramos[mid]] < piso) lo = mid + 1; else hi = mid; }
  let ms = 0;
  const tramos: number[] = [];
  for (let j = lo; j < d.tramos.length; j++) {
    const i = d.tramos[j];
    if (t0[i] >= hasta) break;
    const ov = Math.min(finDeTramo(t, i), hasta) - Math.max(t0[i], desde);
    if (ov > 0) { ms += ov; if (tramos.length < 4) tramos.push(i); }
  }
  return { ms, tramos };
}

const BASE_CLAVE = 4194304;   // 2^22: tope de paquetes por camión para la clave estable (camión, índice)
function claveDePaquete(camion: number, indice: number): number {
  return camion * BASE_CLAVE + indice;
}

/** Id (en la traza) del paquete con la clave estable (camión, índice), o −1 si no está en esa noche. */
export function encontrarPaquete(t: Traza, camion: number, indice: number): number {
  const cache = cacheDe(t);
  if (!cache.paquetePorClave) {
    const m = new Map<number, number>();
    const { n, camion: cs, indice: ix } = t.paquetes;
    for (let i = 0; i < n; i++) if (cs[i] >= 0) m.set(claveDePaquete(cs[i], ix[i]), i);
    cache.paquetePorClave = m;
  }
  return cache.paquetePorClave.get(claveDePaquete(camion, indice)) ?? -1;
}

/** Tramos BANDEJA de vuelta extra (a > 0) cuyo causante es cada rampa: rampa → índices de tramo en orden de traza. */
export function vueltasPorRampa(t: Traza): Map<number, number[]> {
  const cache = cacheDe(t);
  if (cache.vueltasPorRampa) return cache.vueltasPorRampa;
  const m = new Map<number, number[]>();
  const { n, k, a, q } = t.tramos;
  for (let i = 0; i < n; i++) {
    if (k[i] !== TipoTramo.BANDEJA || a[i] <= 0 || q[i] < 0 || claseDeRef(q[i]) !== ClaseEntidad.RAMPA) continue;
    const rampa = idDeRef(q[i]);
    const lista = m.get(rampa);
    if (lista) lista.push(i); else m.set(rampa, [i]);
  }
  cache.vueltasPorRampa = m;
  return m;
}

/** Tiempo del paquete en el hub: de que lo descargan a que entra a la jaula (o al fin de la traza si no terminó). */
export function tiempoEnHub(t: Traza, paquete: number): number {
  const listo = t.paquetes.listo[paquete];
  const fin = listo >= 0 ? listo : t.fin;
  return Math.max(0, fin - t.paquetes.creado[paquete]);
}
