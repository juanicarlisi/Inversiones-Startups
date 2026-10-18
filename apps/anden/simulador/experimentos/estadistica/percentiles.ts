// experimentos/estadistica/percentiles.ts · Andén simulador, corte 1, P5.
// Percentil y su intervalo por estadísticos de orden (binomial). Definiciones exactas de corte-1.md §7.
import { cuantilNormal } from './t-student.ts';

/** Copia ordenada de menor a mayor. Lanza si hay algún valor no finito (un NaN corrompería el orden sin avisar). */
export function ordenar(xs: ArrayLike<number>): Float64Array {
  const v = Float64Array.from(xs as ArrayLike<number>);
  for (let i = 0; i < v.length; i++) {
    if (!Number.isFinite(v[i])) throw new Error(`se esperaban solo números finitos y el valor ${i} es ${v[i]}`);
  }
  return v.sort();
}

function validarQ(q: number): void {
  if (!(q >= 0 && q <= 1)) throw new Error(`el cuantil q tiene que estar entre 0 y 1 y llegó ${q}`);
}

/** P_q = x₍min(n−1, ⌊q·n⌋)₎ con x ordenado de menor a mayor (índice desde 0). El P90 de 10 datos es el máximo. */
export function percentilOrdenado(x: ArrayLike<number>, q: number): number {
  validarQ(q);
  const n = x.length;
  if (n === 0) throw new Error('percentil: se esperaba al menos un dato y llegó una lista vacía');
  return x[Math.min(n - 1, Math.floor(q * n))];
}

export function percentil(xs: ArrayLike<number>, q: number): number {
  return percentilOrdenado(ordenar(xs), q);
}

/**
 * IC del percentil P_q por rangos: l = ⌊nq − z√(nq(1−q))⌋ y u = ⌈nq + z√(nq(1−q))⌉, recortados a [0, n−1]; el intervalo es
 * [x₍l₎, x₍u₎]. null si n < 20 (con menos datos los rangos de la normal no valen).
 */
export function icPercentilOrdenado(x: ArrayLike<number>, q: number, confianza: number): [number, number] | null {
  validarQ(q);
  const n = x.length;
  if (n < 20) return null;
  const z = cuantilNormal(confianza);
  const medio = n * q;
  const amplitud = z * Math.sqrt(n * q * (1 - q));
  const l = Math.max(0, Math.floor(medio - amplitud));
  const u = Math.min(n - 1, Math.ceil(medio + amplitud));
  return [x[l], x[u]];
}

export function icPercentil(xs: ArrayLike<number>, q: number, confianza: number): [number, number] | null {
  validarQ(q);
  if (xs.length < 20) return null;
  return icPercentilOrdenado(ordenar(xs), q, confianza);
}
