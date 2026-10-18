// nucleo/motor/huella.ts · Huella de 64 bits de una corrida (corte-1.md §6.4).
// Por cada evento procesado, en orden, se mezclan cinco palabras de 32 bits: t mod 2³², ⌊t / 2³²⌋, bloque, tipo y arg.
// Dos carriles independientes: FNV-1a (h1) y una multiplicación de Murmur3 con corrimiento (h2). Huella = hex8(h1) + hex8(h2).
import type { Ms } from '../../contratos/tipos-base.ts';

export const H1_INICIO = 0x811c9dc5;
export const H2_INICIO = 0xc2b2ae35;
const PRIMO_1 = 0x01000193;
const PRIMO_2 = 0x85ebca6b;
const DOS_32 = 4294967296;

/** Carril 1: h1 = imul(h1 ^ w, 0x01000193) >>> 0. */
export function carril1(h: number, w: number): number {
  return Math.imul(h ^ w, PRIMO_1) >>> 0;
}
/** Carril 2: h2 = imul(h2 ^ w, 0x85ebca6b) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0. */
export function carril2(h: number, w: number): number {
  const x = Math.imul(h ^ w, PRIMO_2) >>> 0;
  return (x ^ (x >>> 13)) >>> 0;
}

/** Estado de los dos carriles (mutable: el motor lo actualiza por evento sin reservar memoria). */
export interface Carriles {
  h1: number;
  h2: number;
}

/** Mezcla un evento procesado en los dos carriles. */
export function mezclarEvento(h: Carriles, t: Ms, bloque: number, tipo: number, arg: number): void {
  const w0 = t % DOS_32, w1 = Math.floor(t / DOS_32), w2 = bloque >>> 0, w3 = tipo >>> 0, w4 = arg >>> 0;
  h.h1 = carril1(carril1(carril1(carril1(carril1(h.h1, w0), w1), w2), w3), w4);
  h.h2 = carril2(carril2(carril2(carril2(carril2(h.h2, w0), w1), w2), w3), w4);
}

/** 8 caracteres hexadecimales en minúscula de un uint32. */
export function hex8(x: number): string {
  return (x >>> 0).toString(16).padStart(8, '0');
}

/** La huella de 16 caracteres de los dos carriles. */
export function hex16(h1: number, h2: number): string {
  return hex8(h1) + hex8(h2);
}

/**
 * Huella agregada de varias réplicas (para el comprobante): los mismos dos carriles sobre los códigos de los caracteres de las
 * huellas, en orden de índice de réplica.
 */
export function huellaAgregada(huellas: readonly string[]): string {
  let h1 = H1_INICIO, h2 = H2_INICIO;
  for (const huella of huellas) {
    for (let i = 0; i < huella.length; i++) {
      const w = huella.charCodeAt(i);
      h1 = carril1(h1, w);
      h2 = carril2(h2, w);
    }
  }
  return hex16(h1, h2);
}
