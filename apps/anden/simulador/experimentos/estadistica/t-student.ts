// experimentos/estadistica/t-student.ts · Andén simulador, corte 1, P5.
// Cuantiles que usa todo intervalo del simulador (corte-1.md §7). Nada de logaritmos ni exponenciales nativos: la t sale de una
// tabla precalculada (`tabla-t.json`, generada por `generar-tabla-t.ts`) y, para ν > 200, de la expansión de Cornish-Fisher.
import tablaJson from './tabla-t.json' with { type: 'json' };

/** Confianzas admitidas (bilaterales). Cualquier otra lanza error: así nadie pide un 97% que no está verificado. */
export const CONFIANZAS_ADMITIDAS: readonly number[] = [0.9, 0.95, 0.99];

/** Cuantil normal bilateral z(1 − α/2): 1,6448536269514722 · 1,959963984540054 · 2,5758293035489004 (§7). */
const Z_NORMAL: Record<string, number> = {
  '0.9': 1.6448536269514722,
  '0.95': 1.959963984540054,
  '0.99': 2.5758293035489004,
};

interface FormatoTabla { nuMax: number; t: Record<string, number[]> }
const TABLA = tablaJson as unknown as FormatoTabla;

/** Lanza si la confianza no es una de las tres admitidas. Devuelve la clave de texto ('0.95') para buscar en las tablas. */
export function claveConfianza(confianza: number): string {
  if (!CONFIANZAS_ADMITIDAS.includes(confianza)) {
    throw new Error(`confianza no admitida: se esperaba 0,90, 0,95 o 0,99 y llegó ${confianza}`);
  }
  return String(confianza);
}

/** z = cuantil de la normal estándar para el intervalo bilateral de esa confianza (z = 1,96 para 0,95). */
export function cuantilNormal(confianza: number): number {
  return Z_NORMAL[claveConfianza(confianza)];
}

/**
 * Cuantil t(1 − α/2; ν) del intervalo bilateral con esa confianza (t = 2,2281 para 0,95 y ν = 10).
 * ν = 1…200: tabla (error < 1e-10). ν > 200: Cornish-Fisher t ≈ z + (z³ + z)/(4ν) + (5z⁵ + 16z³ + 3z)/(96ν²) (error < 1e-6).
 */
export function cuantilT(confianza: number, nu: number): number {
  const clave = claveConfianza(confianza);
  if (!Number.isInteger(nu) || nu < 1) throw new Error(`cuantilT: los grados de libertad tienen que ser un entero ≥ 1 y llegó ${nu}`);
  if (nu <= TABLA.nuMax) return TABLA.t[clave][nu - 1];
  const z = Z_NORMAL[clave];
  const z2 = z * z, z3 = z2 * z, z5 = z3 * z2;
  return z + (z3 + z) / (4 * nu) + (5 * z5 + 16 * z3 + 3 * z) / (96 * nu * nu);
}
