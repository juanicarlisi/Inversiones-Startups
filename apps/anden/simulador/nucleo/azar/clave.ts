// nucleo/azar/clave.ts · Clave de una dirección del azar: FNV-1a de 32 bits sobre los bytes UTF-8 de `${ruta}/${proposito}`
// (contratos/azar.ts, tipo ClaveDe). La clave depende solo del nombre: renombrar un bloque cambia sus sorteos; reordenar, no.
import type { ClaveDe } from '../../contratos/azar.ts';

const FNV_INICIO = 0x811c9dc5;
const FNV_PRIMO = 0x01000193;

/** Mezcla un byte en el hash FNV-1a. */
function mezclar(h: number, byte: number): number {
  return Math.imul(h ^ byte, FNV_PRIMO) >>> 0;
}

/**
 * FNV-1a de 32 bits de un texto codificado en UTF-8 (como TextEncoder: un sustituto suelto se codifica como U+FFFD).
 * Se codifica a mano para no reservar memoria y no depender de TextEncoder en ningún entorno.
 */
export function fnv1a32(texto: string): number {
  let h = FNV_INICIO;
  const n = texto.length;
  for (let i = 0; i < n; i++) {
    let cp = texto.charCodeAt(i);
    if (cp >= 0xd800 && cp <= 0xdfff) {
      // Par sustituto alto + bajo → un punto de código fuera del plano básico; suelto → U+FFFD.
      const sig = i + 1 < n ? texto.charCodeAt(i + 1) : 0;
      if (cp <= 0xdbff && sig >= 0xdc00 && sig <= 0xdfff) {
        cp = 0x10000 + ((cp - 0xd800) << 10) + (sig - 0xdc00);
        i++;
      } else {
        cp = 0xfffd;
      }
    }
    if (cp < 0x80) {
      h = mezclar(h, cp);
    } else if (cp < 0x800) {
      h = mezclar(h, 0xc0 | (cp >> 6));
      h = mezclar(h, 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      h = mezclar(h, 0xe0 | (cp >> 12));
      h = mezclar(h, 0x80 | ((cp >> 6) & 0x3f));
      h = mezclar(h, 0x80 | (cp & 0x3f));
    } else {
      h = mezclar(h, 0xf0 | (cp >> 18));
      h = mezclar(h, 0x80 | ((cp >> 12) & 0x3f));
      h = mezclar(h, 0x80 | ((cp >> 6) & 0x3f));
      h = mezclar(h, 0x80 | (cp & 0x3f));
    }
  }
  return h >>> 0;
}

/** Clave de la dirección: claveDe('hub.sorter', 'lectura') = FNV-1a('hub.sorter/lectura'). */
export const claveDe: ClaveDe = (ruta, proposito) => fnv1a32(`${ruta}/${proposito}`);
