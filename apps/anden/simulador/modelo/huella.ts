// modelo/huella.ts · P3 · Huella del modelo: SHA-256 del JSON canónico, primeros 16 caracteres hex.
// Usa crypto.subtle (Node y navegadores). crypto.subtle solo existe en contextos seguros (https o localhost): si alguien abre la app
// por http en una IP de la red local, se usa una implementación propia de SHA-256 (FIPS 180-4) que da los mismos bytes; una prueba
// compara las dos en entradas de todos los largos.
import type { HuellaModelo } from '../contratos/escena.ts';
import type { Modelo } from '../contratos/modelo.ts';
import { jsonCanonico } from './canonico.ts';

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

/** SHA-256 en JavaScript puro (solo enteros de 32 bits). Respaldo de crypto.subtle; mismo resultado bit a bit. */
export function sha256Propio(m: Uint8Array): Uint8Array {
  const l = m.length;
  const n = (((l + 9 + 63) / 64) | 0) * 64;
  const buf = new Uint8Array(n);
  buf.set(m);
  buf[l] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(n - 8, Math.floor(l / 0x20000000)); // bits altos de l·8
  dv.setUint32(n - 4, (l * 8) >>> 0);              // bits bajos de l·8
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  for (let i = 0; i < n; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = dv.getUint32(i + 4 * t);
    for (let t = 16; t < 64; t++) {
      const a = W[t - 15], b = W[t - 2];
      const s0 = rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3);
      const s1 = rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  const out = new Uint8Array(32);
  const dvo = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) dvo.setUint32(4 * i, H[i]);
  return out;
}

/** SHA-256 con crypto.subtle si está disponible; si no (contexto no seguro), con la implementación propia. */
export async function sha256(datos: Uint8Array): Promise<Uint8Array> {
  const sutil = (globalThis as { crypto?: Crypto }).crypto?.subtle;
  if (sutil) {
    try {
      const copia = new Uint8Array(datos.length);
      copia.set(datos);
      return new Uint8Array(await sutil.digest('SHA-256', copia));
    } catch {
      // Algunos navegadores exponen crypto.subtle pero rechazan digest fuera de un contexto seguro: seguimos con la propia.
    }
  }
  return sha256Propio(datos);
}

export function aHex(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
  return s;
}

const UTF8 = new TextEncoder();

/** SHA-256 (crypto.subtle) del JSON canónico, primeros 16 caracteres hex. */
export const huellaModelo: HuellaModelo = async (m: Modelo): Promise<string> =>
  aHex(await sha256(UTF8.encode(jsonCanonico(m)))).slice(0, 16);
