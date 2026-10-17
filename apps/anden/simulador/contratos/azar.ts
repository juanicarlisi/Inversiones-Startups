// contratos/azar.ts · CONGELADO.
// Azar por dirección semántica con Philox4x32-10 (Random123). Clave = (semilla, clave de la dirección).
// Contador = (réplica, a, b, (c << 8) | sub). Un sorteo nunca depende del orden de los eventos ni del índice de un servidor.

/**
 * Dirección de un sorteo. Convención obligatoria (corte-1.md §6.3):
 * - clave: claveDe(rutaDelBloque, proposito), p. ej. claveDe('demanda.camiones', 'desvio');
 * - a: ordinal estable de la entidad en su fuente (camión, persona, falla n-ésima);
 * - b: segundo índice estable (paquete dentro del camión) o 0;
 * - c: intento o vuelta (lectura número c del paquete) o 0. Máximo 2^24 − 1.
 */
export interface Direccion {
  clave: number;
  a: number;
  b: number;
  c: number;
}

export type Distribucion =
  | { tipo: 'fija'; valor: number }
  | { tipo: 'uniforme'; min: number; max: number }
  | { tipo: 'exponencial'; media: number }
  | { tipo: 'triangular'; min: number; moda: number; max: number }
  | { tipo: 'lognormal'; media: number; cv: number }
  | { tipo: 'normal'; media: number; desvio: number; min?: number; max?: number }
  | { tipo: 'erlang'; k: number; media: number }
  | { tipo: 'weibull'; forma: number; escala: number }
  | { tipo: 'bernoulli'; p: number }
  | { tipo: 'discreta'; valores: number[]; pesos: number[] }
  | { tipo: 'empirica'; valores: number[] };

/** Uniformes que consume cada distribución. Fijo: es la base de los números aleatorios comunes. 'k' = k uniformes. */
export const CONSUMO: Record<Distribucion['tipo'], number | 'k'> = {
  fija: 0, uniforme: 1, exponencial: 1, triangular: 1, lognormal: 2, normal: 2,
  erlang: 'k', weibull: 1, bernoulli: 1, discreta: 1, empirica: 1,
};

export interface FuenteAzar {
  readonly semilla: number;
  readonly replica: number;
  /** Los 4 uint32 del bloque Philox número `sub` (0–255) de la dirección. */
  bloque(d: Direccion, sub: number, out: Uint32Array): void;
  /** El i-ésimo uniforme en (0, 1), 53 bits, de la dirección: i = 2·sub + (0 | 1). */
  uniforme(d: Direccion, i?: number): number;
  /** Sorteo con consumo fijo. Usa los uniformes 0, 1, 2… de la dirección. */
  sortear(dist: Distribucion, d: Direccion): number;
}

/** FNV-1a de 32 bits sobre los bytes UTF-8 de `${ruta}/${proposito}`. La implementa el núcleo; la firma es contrato. */
export type ClaveDe = (ruta: string, proposito: string) => number;
