// experimentos/estadistica/wilson.ts · Andén simulador, corte 1, P5.
// Intervalo de Wilson para una proporción (corte-1.md §7). Es el que decide si una configuración «cumple», «no cumple» o está «en duda».
import type { EstadoConfiguracion } from '../../contratos/experimentos.ts';
import { cuantilNormal } from './t-student.ts';

/** Wilson desde la proporción observada p̂ (no hace falta que n·p̂ sea entero). */
function wilsonDeP(p: number, n: number, z: number): [number, number] {
  const z2 = z * z;
  const den = 1 + z2 / n;
  const centro = (p + z2 / (2 * n)) / den;
  const semiancho = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / den;
  // Cuando p̂ = 0 o p̂ = 1 el extremo exacto es 0 o 1 (la cuenta da 1 ± 2e-16 por redondeo).
  const lo = p === 0 ? 0 : Math.max(0, centro - semiancho);
  const hi = p === 1 ? 1 : Math.min(1, centro + semiancho);
  return [lo, hi];
}

/**
 * IC de Wilson de `exitos` aciertos en `n` pruebas. Controles de §7: 19 de 20 → [0,7639; 0,9911]; 97 de 100 → [0,9155; 0,9897].
 * Devuelve [inferior, superior].
 */
export function wilson(exitos: number, n: number, confianza: number): [number, number] {
  if (!Number.isInteger(n) || n < 1) throw new Error(`wilson: n tiene que ser un entero ≥ 1 y llegó ${n}`);
  if (!Number.isInteger(exitos) || exitos < 0 || exitos > n) {
    throw new Error(`wilson: los éxitos tienen que ser un entero entre 0 y n=${n} y llegaron ${exitos}`);
  }
  return wilsonDeP(exitos / n, n, cuantilNormal(confianza));
}

/** Wilson con un z cualquiera (el de cada mirada de la decisión secuencial, que corrige por mirar varias veces: normal.ts). */
export function wilsonZ(exitos: number, n: number, z: number): [number, number] {
  if (!Number.isInteger(n) || n < 1) throw new Error(`wilson: n tiene que ser un entero ≥ 1 y llegó ${n}`);
  if (!Number.isInteger(exitos) || exitos < 0 || exitos > n) {
    throw new Error(`wilson: los éxitos tienen que ser un entero entre 0 y n=${n} y llegaron ${exitos}`);
  }
  if (!(z > 0) || !Number.isFinite(z)) throw new Error(`wilson: z tiene que ser un número finito > 0 y llegó ${z}`);
  return wilsonDeP(exitos / n, n, z);
}

/** cumple: el extremo inferior ya alcanza la meta · no-cumple: el superior no la alcanza · en-duda: el intervalo la cruza. */
export function estadoPorWilson(ic: readonly [number, number], meta: number): EstadoConfiguracion {
  if (ic[0] >= meta) return 'cumple';
  if (ic[1] < meta) return 'no-cumple';
  return 'en-duda';
}

/**
 * ESTIMACIÓN de cuántas noches MÁS harían falta para sacar de la duda a una configuración, suponiendo que la proporción observada
 * se mantenga: la menor n' tal que el Wilson de p̂ con n' noches ya no cruza la meta. null si p̂ = meta (nunca se resuelve) o si
 * harían falta más de `tope` noches. Es un cálculo de planificación, no un resultado: la usa el semáforo para decir «faltarían unas N».
 */
export function nochesQueFaltan(exitos: number, n: number, meta: number, confianza: number, tope = 1_000_000): number | null {
  return nochesQueFaltanZ(exitos, n, meta, cuantilNormal(confianza), tope);
}

/** Lo mismo que `nochesQueFaltan` con el z de cada mirada (la decisión secuencial corrige por mirar varias veces). */
export function nochesQueFaltanZ(exitos: number, n: number, meta: number, z: number, tope = 1_000_000): number | null {
  const p = exitos / n;
  if (p === meta) return null;
  const resuelto = (m: number): boolean => estadoPorWilson(wilsonDeP(p, m, z), meta) !== 'en-duda';
  if (resuelto(n)) return 0;
  let hi = n * 2;
  while (!resuelto(hi)) {
    if (hi >= tope) return null;
    hi *= 2;
  }
  let lo = hi / 2;                    // lo no resuelve, hi sí
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (resuelto(mid)) hi = mid; else lo = mid;
  }
  return Math.ceil(hi) - n;
}
