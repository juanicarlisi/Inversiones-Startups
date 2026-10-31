// experimentos/estadistica/secuencial.ts · Andén simulador, corte 1, P5.
// Calibración EXACTA de la regla secuencial de la decisión (hallazgo EST-04 de la revisión del 30-10-2026).
//
// La decisión mira el Wilson de cada opción después de cada tanda (20, 40, …, 400 noches: 20 miradas) y se detiene en el primer
// «cumple» o «no cumple». Mirar muchas veces infla el error; el arreglo del 20-10 (Bonferroni: z = Φ⁻¹(1 − α/2K) = 3,02) lo acotaba,
// pero de más: la probabilidad EXACTA de declarar «cumple» con p real = meta daba 0,22% (meta 0,9), 0,08% (0,95) y 0% (0,99), no el
// 2,5% que se promete, y la opción buena quedaba «en duda» (meta 0,9 y p = 0,94: 61% en duda a 400 noches).
//
// Ahora el z de cada mirada se calibra con la distribución exacta del proceso: una programación dinámica sobre la binomial que sigue,
// tanda por tanda, la probabilidad de cada cantidad de éxitos entre los caminos que todavía no se detuvieron, con la MISMA regla que
// usa la decisión (wilsonZ + estadoPorWilson). Se busca por bisección el menor z con el que, siendo p = meta exactamente (el peor caso:
// la probabilidad de «cumple» crece con p y la de «no cumple» decrece), ninguno de los dos errores pasa de (1 − confianza) ÷ 2. Es el
// mismo criterio que Bonferroni, pero sin la desigualdad de la unión: lo que se promete es lo que pasa (es la idea de los límites de
// grupo secuencial de Pocock, calculados exactamente para un ensayo binomial en lugar de con la aproximación normal).
//
// Todo es aritmética (sumas, productos, cocientes y raíz cuadrada): el mismo z en cualquier motor de JavaScript (corte-1.md §1.4).
import type { EstadoConfiguracion } from '../../contratos/experimentos.ts';
import { wilsonZ } from './wilson.ts';
import { colaNormal, miradasSecuenciales, zDeCola } from './normal.ts';

/** Tope de noches por opción para calibrar exacto (la programación dinámica cuesta ≈ máximo² ÷ 2 operaciones por cada z probado). */
export const MAX_REPLICAS_CALIBRACION = 2000;
/** Tope de miradas para calibrar exacto. Más allá, Bonferroni (conservador). */
export const MAX_MIRADAS_CALIBRACION = 200;

/** Probabilidades de la binomial(n, p) calculadas desde la moda, sin exp ni log (las colas que no se pueden representar quedan en 0). */
export function binomial(n: number, p: number): Float64Array {
  const w = new Float64Array(n + 1);
  if (p <= 0) { w[0] = 1; return w; }
  if (p >= 1) { w[n] = 1; return w; }
  const r = p / (1 - p), m = Math.min(n, Math.floor((n + 1) * p));
  w[m] = 1;
  for (let k = m; k < n; k++) w[k + 1] = w[k] * ((n - k) / (k + 1)) * r;
  for (let k = m; k > 0; k--) w[k - 1] = (w[k] * (k / (n - k + 1))) / r;
  let s = 0;
  for (let k = 0; k <= n; k++) s += w[k];
  for (let k = 0; k <= n; k++) w[k] /= s;
  return w;
}

/** Las n de cada mirada: iniciales, iniciales + tanda, … hasta el máximo (igual que el bucle de decision.ts). */
export function puntosDeMirada(iniciales: number, tanda: number, maximo: number): number[] {
  const ns = [iniciales];
  while (ns[ns.length - 1] < maximo) ns.push(Math.min(ns[ns.length - 1] + tanda, maximo));
  return ns;
}

export interface Errores { cumple: number; noCumple: number; enDuda: number }

/**
 * El estado de una opción con `exitos` de `n` en una mirada: «cumple» si el extremo inferior del Wilson con `zCumple` alcanza la meta,
 * «no-cumple» si el superior del Wilson con `zNoCumple` no la alcanza, y si no, «en-duda». Los dos z pueden ser distintos: el Wilson es
 * asimétrico cerca de 0 y de 1, y cada lado se calibra con su propio error (con un z común, el lado de «no cumple» obligaba a un z alto
 * que dejaba el «cumple» casi imposible). Con `null` ese lado no decide (para calibrar el otro por separado).
 */
export function estadoSecuencial(exitos: number, n: number, meta: number, zCumple: number | null, zNoCumple: number | null): EstadoConfiguracion {
  if (zCumple !== null && wilsonZ(exitos, n, zCumple)[0] >= meta) return 'cumple';
  if (zNoCumple !== null && wilsonZ(exitos, n, zNoCumple)[1] < meta) return 'no-cumple';
  return 'en-duda';
}

/** El intervalo que decide: [inferior con zCumple, superior con zNoCumple]. */
export function icSecuencial(exitos: number, n: number, zCumple: number, zNoCumple: number): [number, number] {
  return [wilsonZ(exitos, n, zCumple)[0], wilsonZ(exitos, n, zNoCumple)[1]];
}

/**
 * Probabilidad EXACTA de que la regla secuencial termine en «cumple», en «no cumple» o siga en duda al máximo, si la probabilidad real de
 * cumplir en una noche es `p`. Una sola opción, con las miradas de `puntosDeMirada`.
 */
export function erroresSecuenciales(
  p: number, meta: number, zCumple: number | null, zNoCumple: number | null, iniciales: number, tanda: number, maximo: number,
): Errores {
  const ns = puntosDeMirada(iniciales, tanda, maximo);
  let dist = binomial(ns[0], p);
  let cumple = 0, noCumple = 0;
  for (let j = 0; j < ns.length; j++) {
    const n = ns[j];
    for (let k = 0; k <= n; k++) {
      if (dist[k] === 0) continue;
      const e = estadoSecuencial(k, n, meta, zCumple, zNoCumple);
      if (e === 'cumple') { cumple += dist[k]; dist[k] = 0; } else if (e === 'no-cumple') { noCumple += dist[k]; dist[k] = 0; }
    }
    if (j === ns.length - 1) break;
    const paso = ns[j + 1] - n, b = binomial(paso, p), sig = new Float64Array(ns[j + 1] + 1);
    for (let k = 0; k <= n; k++) {
      const d = dist[k];
      if (d === 0) continue;
      for (let i = 0; i <= paso; i++) sig[k + i] += d * b[i];
    }
    dist = sig;
  }
  let enDuda = 0;
  for (let k = 0; k < dist.length; k++) enDuda += dist[k];
  return { cumple, noCumple, enDuda };
}

export interface ZSecuencial {
  /** z del extremo inferior (el que declara «cumple») y del superior (el que declara «no cumple») en cada mirada. */
  zCumple: number;
  zNoCumple: number;
  /** Confianza equivalente de cada mirada: 1 − Q(zCumple) − Q(zNoCumple). */
  confianza: number;
  miradas: number;
  /** 'exacto': calibrado con la distribución del proceso; 'bonferroni': demasiadas miradas o noches para calibrar, se usa la cota. */
  metodo: 'exacto' | 'bonferroni';
  /** Errores exactos con p = meta y las dos reglas juntas (con Bonferroni, la cota (1 − confianza) ÷ 2). */
  errorCumple: number;
  errorNoCumple: number;
}

const memo = new Map<string, ZSecuencial>();

/** Menor z (por bisección entre `lo` y `hi`) con el que `error(z)` ≤ `tope`; `hi` tiene que cumplirlo (si no, se agranda). */
function calibrar(error: (z: number) => number, tope: number, lo: number, hi: number): number {
  for (let i = 0; i < 20 && !(error(hi) <= tope); i++) hi *= 1.1;
  lo = Math.min(lo, hi);
  for (let i = 0; i < 40 && hi - lo > 1e-6; i++) {
    const medio = 0.5 * (lo + hi);
    if (error(medio) <= tope) hi = medio; else lo = medio;
  }
  return hi;
}

/**
 * Los z de cada mirada de la decisión secuencial, calibrados para que ninguno de los dos errores (declarar «cumple» o «no cumple» cuando la
 * probabilidad real es justo la meta) pase de (1 − confianza) ÷ 2. Cada lado se calibra con el otro apagado: detenerse también por el
 * otro lado solo puede bajar el error, así que con los dos juntos la promesa se sigue cumpliendo (y se mide: errorCumple, errorNoCumple).
 * Se memoriza por (confianza, meta, iniciales, tanda, máximo).
 */
export function zSecuencial(confianza: number, meta: number, iniciales: number, tanda: number, maximo: number): ZSecuencial {
  if (!(confianza > 0 && confianza < 1)) throw new Error(`zSecuencial: la confianza tiene que estar en (0, 1) y llegó ${confianza}`);
  if (!(meta > 0 && meta <= 1)) throw new Error(`zSecuencial: la meta tiene que estar en (0, 1] y llegó ${meta}`);
  if (!Number.isInteger(iniciales) || iniciales < 1 || !Number.isInteger(tanda) || tanda < 1 || !Number.isInteger(maximo) || maximo < iniciales) {
    throw new Error(`zSecuencial: se esperaban enteros iniciales ≥ 1, tanda ≥ 1 y máximo ≥ iniciales, y llegaron ${iniciales}, ${tanda} y ${maximo}`);
  }
  const clave = `${confianza}|${meta}|${iniciales}|${tanda}|${maximo}`;
  const hecho = memo.get(clave);
  if (hecho) return hecho;
  const alfa2 = (1 - confianza) / 2, K = miradasSecuenciales(iniciales, tanda, maximo);
  const zBonf = zDeCola(alfa2 / K);
  let r: ZSecuencial;
  if (maximo > MAX_REPLICAS_CALIBRACION || K > MAX_MIRADAS_CALIBRACION || meta >= 1) {
    r = { zCumple: zBonf, zNoCumple: zBonf, confianza: 1 - (1 - confianza) / K, miradas: K, metodo: 'bonferroni', errorCumple: alfa2, errorNoCumple: alfa2 };
  } else {
    const zUna = zDeCola(alfa2);
    const zC = calibrar((z) => erroresSecuenciales(meta, meta, z, null, iniciales, tanda, maximo).cumple, alfa2, zUna, zBonf);
    const zN = calibrar((z) => erroresSecuenciales(meta, meta, null, z, iniciales, tanda, maximo).noCumple, alfa2, zUna, zBonf);
    const e = erroresSecuenciales(meta, meta, zC, zN, iniciales, tanda, maximo);
    r = { zCumple: zC, zNoCumple: zN, confianza: 1 - colaNormal(zC) - colaNormal(zN), miradas: K, metodo: 'exacto', errorCumple: e.cumple, errorNoCumple: e.noCumple };
  }
  memo.set(clave, r);
  return r;
}

/**
 * Noches mínimas para poder declarar «cumple» aunque TODAS las noches cumplan: el extremo inferior del Wilson con k = n es n ÷ (n + z²),
 * que alcanza la meta recién con n ≥ z²·meta ÷ (1 − meta). Si pasa el máximo de noches, la meta es inalcanzable con ese presupuesto
 * (meta 0,99 con 400 noches, por ejemplo) y se avisa.
 */
export function nochesMinimasParaCumplir(meta: number, z: number): number {
  if (meta >= 1) return Infinity;
  return Math.ceil((z * z * meta) / (1 - meta) - 1e-9);
}
