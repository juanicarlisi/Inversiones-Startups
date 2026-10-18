// nucleo/azar/philox.ts · Philox4x32-10 (Salmon, Moraes, Dror y Shaw, «Parallel random numbers: as easy as 1, 2, 3», SC11).
// Generador basado en contador: la salida es una función pura de (contador de 128 bits, clave de 64 bits), así que cualquier sorteo
// se calcula directo desde su dirección, sin estado que guardar y sin depender del orden de los eventos.
// Solo aritmética entera exacta de 32 bits: el mismo resultado en cualquier motor de JavaScript.
// Vectores de prueba: Random123, tests/kat_vectors (los 3 de philox4x32_10; nucleo/pruebas/philox.test.ts).

const M0 = 0xd2511f53, M1 = 0xcd9e8d57; // multiplicadores de la ronda
const W0 = 0x9e3779b9, W1 = 0xbb67ae85; // incrementos de la clave (constante áurea y √3 − 1)
// Mitades de 16 bits de los multiplicadores, precalculadas para la parte alta del producto.
const M0_BAJO = M0 & 0xffff, M0_ALTO = M0 >>> 16, M1_BAJO = M1 & 0xffff, M1_ALTO = M1 >>> 16;

/** Parte alta (32 bits) del producto de 64 bits de dos uint32, con productos parciales de 16 × 16 bits (exactos en double). */
function mulhi(a0: number, a1: number, b: number): number {
  const b0 = b & 0xffff, b1 = b >>> 16;
  const p00 = a0 * b0, p01 = a0 * b1, p10 = a1 * b0, p11 = a1 * b1;
  const medio = (p00 >>> 16) + (p01 & 0xffff) + (p10 & 0xffff);
  return (p11 + (p01 >>> 16) + (p10 >>> 16) + (medio >>> 16)) >>> 0;
}

/**
 * Un bloque Philox4x32-10: contador (c0, c1, c2, c3) y clave (k0, k1), todos uint32. Escribe los 4 uint32 de salida en `out`.
 * Misma firma y mismo resultado que `philox4x32_10` de contratos/referencia/motor-referencia.ts.
 */
export function philox4x32_10(c0: number, c1: number, c2: number, c3: number, k0: number, k1: number, out: Uint32Array): void {
  c0 >>>= 0; c1 >>>= 0; c2 >>>= 0; c3 >>>= 0; k0 >>>= 0; k1 >>>= 0;
  for (let r = 0; r < 10; r++) {
    const h0 = mulhi(M0_BAJO, M0_ALTO, c0), l0 = Math.imul(M0, c0) >>> 0;
    const h1 = mulhi(M1_BAJO, M1_ALTO, c2), l1 = Math.imul(M1, c2) >>> 0;
    const n0 = (h1 ^ c1 ^ k0) >>> 0, n2 = (h0 ^ c3 ^ k1) >>> 0;
    c0 = n0; c1 = l1; c2 = n2; c3 = l0;
    k0 = (k0 + W0) >>> 0; k1 = (k1 + W1) >>> 0;
  }
  out[0] = c0; out[1] = c1; out[2] = c2; out[3] = c3;
}
