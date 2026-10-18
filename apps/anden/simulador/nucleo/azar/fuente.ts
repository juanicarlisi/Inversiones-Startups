// nucleo/azar/fuente.ts · Fuente de azar por dirección semántica (contratos/azar.ts, corte-1.md §6.6).
//
// uniforme(d, i): bloque Philox `sub = i >> 1` con clave (semilla, d.clave) y contador (réplica, d.a, d.b, (d.c & 0xffffff)·256 + sub);
// de la salida (x₀, x₁, x₂, x₃) se usa (x₀, x₁) si i es par y (x₂, x₃) si es impar: u = ((hi >>> 5)·2²⁶ + (lo >>> 6) + 0,5) / 2⁵³.
// Ningún sorteo depende del orden en que se piden: la fuente no tiene estado (salvo una caché del último bloque, que no cambia nada).
import type { Direccion, Distribucion, FuenteAzar } from '../../contratos/azar.ts';
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';
import { det } from '../matematica/det.ts';
import { philox4x32_10 } from './philox.ts';
import { crearSorteador } from './distribuciones.ts';

const DOS_26 = 67108864;
const DOS_53 = 9007199254740992;
/** Índice máximo de uniforme por dirección: 256 sub-bloques × 2 uniformes. */
export const UNIFORME_MAX = 511;

/** La fuente del núcleo, con un contador informativo de bloques Philox calculados (para las pruebas de consumo). */
export interface FuenteAzarNucleo extends FuenteAzar {
  readonly bloquesCalculados: number;
}

function exigirUint32(nombre: string, x: number): void {
  if (!Number.isInteger(x) || x < 0 || x > 0xffffffff) {
    throw new RangeError(`crearFuenteAzar: se esperaba ${nombre} entero entre 0 y 4.294.967.295 (uint32) y se recibió ${x}`);
  }
}

/** Crea la fuente de azar de una corrida. `mat` es para pruebas; el motor usa siempre `det`. */
export function crearFuenteAzar(semilla: number, replica: number, mat: MatematicaDeterminista = det): FuenteAzarNucleo {
  exigirUint32('la semilla', semilla);
  exigirUint32('la réplica', replica);
  const s = semilla >>> 0, r = replica >>> 0;
  let bloquesCalculados = 0;

  const bloque = (d: Direccion, sub: number, out: Uint32Array): void => {
    bloquesCalculados++;
    philox4x32_10(r, d.a >>> 0, d.b >>> 0, ((d.c & 0xffffff) * 256 + (sub & 0xff)) >>> 0, s, d.clave >>> 0, out);
  };

  // Caché del último bloque calculado por uniforme(): lognormal y normal piden los uniformes 0 y 1, que salen del mismo bloque.
  // La dirección del bloque en caché va en un arreglo tipado (los uint32 grandes en variables de la clausura obligan a V8 a
  // reservar memoria en cada escritura). −1 = vacía (ninguna dirección real vale −1).
  const ultimo = new Uint32Array(4);
  const enCache = new Float64Array([-1, -1, -1, -1]); // clave, a, b, c·256 + sub

  const uniforme = (d: Direccion, i = 0): number => {
    if (!(i >= 0 && i <= UNIFORME_MAX && (i | 0) === i)) {
      throw new RangeError(`uniforme: se esperaba un índice entero entre 0 y ${UNIFORME_MAX} y se recibió ${i}`);
    }
    const clave = d.clave >>> 0, a = d.a >>> 0, b = d.b >>> 0, c = ((d.c & 0xffffff) * 256 + (i >> 1)) >>> 0;
    if (c !== enCache[3] || a !== enCache[1] || b !== enCache[2] || clave !== enCache[0]) {
      philox4x32_10(r, a, b, c, s, clave, ultimo);
      bloquesCalculados++;
      enCache[0] = clave; enCache[1] = a; enCache[2] = b; enCache[3] = c;
    }
    const par = (i & 1) === 0;
    const hi = par ? ultimo[0] : ultimo[2], lo = par ? ultimo[1] : ultimo[3];
    return ((hi >>> 5) * DOS_26 + (lo >>> 6) + 0.5) / DOS_53;
  };

  const sortear: (dist: Distribucion, d: Direccion) => number = crearSorteador(uniforme, mat);

  return {
    semilla,
    replica,
    bloque,
    uniforme,
    sortear,
    get bloquesCalculados() { return bloquesCalculados; },
  };
}
