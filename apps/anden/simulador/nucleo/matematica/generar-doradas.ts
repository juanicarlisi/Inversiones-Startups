// nucleo/matematica/generar-doradas.ts · Genera doradas-mat.json: 1.000 entradas por función de `det` (log, exp, cos, sin, pow, sqrt).
// Uso (una sola vez; el resultado se commitea): node nucleo/matematica/generar-doradas.ts [--fecha=AAAA-MM-DD]
//
// Las entradas salen de Philox (deterministas) más casos especiales (bordes, ceros con signo, infinitos, subnormales, cerca de
// múltiplos de π/2). Antes de escribir, cada salida se compara con la matemática nativa de V8 (matNativa de la referencia de
// contratos/): si una sola difiere, no se escribe nada. Así las doradas fijan la matemática del núcleo Y su coincidencia con V8 al día
// de hoy; la prueba R04 de la integración las usa para comparar Node con los navegadores.
// Formato: cada número es el patrón de bits IEEE 754 en hexadecimal (16 caracteres, palabra alta primero); un NaN de salida se
// guarda como "nan" (JavaScript no fija los bits de un NaN).
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { det } from './det.ts';
import { philox4x32_10 } from '../azar/philox.ts';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';

const POR_FUNCION = 1000;
const F = new Float64Array(1), U = new Uint32Array(F.buffer);
const ALTO = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1 ? 1 : 0, BAJO = 1 - ALTO;

export function aHex(x: number): string {
  F[0] = x;
  return U[ALTO].toString(16).padStart(8, '0') + U[BAJO].toString(16).padStart(8, '0');
}
export function deHex(h: string): number {
  if (!/^[0-9a-f]{16}$/.test(h)) throw new Error(`doradas: se esperaban 16 dígitos hexadecimales y llegó «${h}»`);
  U[ALTO] = Number.parseInt(h.slice(0, 8), 16);
  U[BAJO] = Number.parseInt(h.slice(8), 16);
  return F[0];
}
function salida(x: number): string {
  return x !== x ? 'nan' : aHex(x);
}

// Azar de las entradas: Philox con clave fija, un contador por sorteo.
const out = new Uint32Array(4);
let contador = 0;
function u01(): number {
  philox4x32_10(contador++, 0x616e6465, 0x6e000000, 0, 20261017, 0x646f7261, out);
  return ((out[0] >>> 5) * 67108864 + (out[1] >>> 6) + 0.5) / 9007199254740992;
}
function bits32(): number {
  philox4x32_10(contador++, 0x62697473, 0, 0, 20261017, 0x646f7261, out);
  return out[0];
}
/** Un double positivo con exponente sin sesgo en [emin, emax] y mantisa al azar (cubre décadas enteras de forma pareja). */
function conExponente(emin: number, emax: number): number {
  const e = emin + Math.floor(u01() * (emax - emin + 1));
  U[ALTO] = (((e + 1023) << 20) | (bits32() & 0xfffff)) >>> 0;
  U[BAJO] = bits32();
  return F[0];
}
function subnormal(): number {
  U[ALTO] = bits32() & 0xfffff;
  U[BAJO] = bits32() | 1;
  return F[0];
}

const PI = Math.PI;
function completar(especiales: number[], generar: () => number): number[] {
  const x = especiales.slice(0, POR_FUNCION);
  while (x.length < POR_FUNCION) x.push(generar());
  return x;
}

function entradas1(): Record<'log' | 'exp' | 'cos' | 'sin' | 'sqrt', number[]> {
  const log = completar([
    0, -0, 1, -1, Infinity, -Infinity, NaN, 5e-324, 2.2250738585072014e-308, 2.225073858507201e-308, 1.7976931348623157e308,
    0.5, 2, 2.718281828459045, 10, 1.0000000000000002, 0.9999999999999999, 0.9999999, 1.0000001, 1e-300, 1e300, 0.1, 3, 7.5, 1024,
  ], (() => {
    let i = 0;
    return () => {
      const r = i++ % 10;
      if (r < 5) return u01(); // (0, 1)
      if (r < 8) return conExponente(-996, 996); // 10^±300
      if (r < 9) return subnormal();
      return 1 + (u01() - 0.5) * 2e-5; // cerca de 1 (rama |f| < 2^-20 y vecinas)
    };
  })());
  const exp = completar([
    0, -0, 1, -1, 0.5, -0.5, 0.34657359027997264, 1.0397207708399179, 709.782712893384, 709.7827128933841, -745.1332191019411,
    -745.1332191019412, -708.3964185322641, -708.4, 1e-300, -1e-300, 3.725290298461914e-9, -3.725290298461914e-9, Infinity, -Infinity, NaN, 700, -700,
    709.7827128933839, 2, 10, -10, 0.6931471805599453,
  ], (() => {
    let i = 0;
    return () => {
      const r = i++ % 10;
      if (r < 6) return (u01() - 0.5) * 1400; // (−700, 700)
      if (r < 8) return (u01() - 0.5) * 2; // (−1, 1)
      if (r < 9) return -708.4 - u01() * 36.7; // resultados subnormales
      return (u01() - 0.5) * 1e-6;
    };
  })());
  const trigEspeciales = [
    0, -0, NaN, 1e-9, -1e-9, 7.450580596923828e-9, -7.450580596923828e-9, 0.7853981633974483, -0.7853981633974483, 0.7853981633974484, 2.356194490192345,
    PI / 2, PI, 3 * PI / 2, 2 * PI, -PI / 2, -PI, 1000, -1000, 999.9999999999999, 1.5707963267948966, 1.5707963267948968,
    4.71238898038469, 3.141592653589793, 6.283185307179586, 0.3, 0.30000000000000004, 0.78125, 1, -1, 500, 314.1592653589793,
  ];
  const trig = (() => {
    let i = 0;
    return () => {
      const r = i++ % 10;
      if (r < 5) return 2 * PI * u01(); // [0, 2π)
      if (r < 8) return (u01() - 0.5) * 2000; // ±1.000
      return Math.round((u01() - 0.5) * 1200) * (PI / 2) + (u01() - 0.5) * 1e-7; // cerca de kπ/2 (reducción con 3 y 4 términos)
    };
  })();
  const cos = completar(trigEspeciales, trig);
  const sin = completar(trigEspeciales, trig);
  const sqrt = completar([0, -0, -1, Infinity, NaN, 2, 4, 5e-324, 1.7976931348623157e308, 0.25, 1e-300], () => conExponente(-1000, 1000));
  return { log, exp, cos, sin, sqrt };
}

function entradasPow(): [number, number][] {
  const esp: [number, number][] = [
    [2, 0.5], [0, 3], [0, -1], [3, 0], [0, 0], [-2, 2], [1, 1e300], [Infinity, 1], [2, 10], [10, -3], [1e-300, 0.5], [2.4, 1.5],
    [0.5, -2], [7, 1 / 3], [1.0000001, 1e6], [NaN, 2], [2, NaN], [-0, 2],
  ];
  const x = esp.slice();
  while (x.length < POR_FUNCION) x.push([u01() * 1000, (u01() - 0.5) * 20]);
  return x;
}

/** Lo que produce una generación: el documento, su texto tal como se escribe y las salidas de `det` que difieren de V8. */
export interface Doradas {
  doc: { version: 1; descripcion: string; generadoCon: string; fecha: string; node: string; v8: string; funciones: Record<string, string[][]> };
  texto: string;
  difieren: string[];
}

/**
 * Genera las doradas en memoria, sin escribir nada. Es una función pura de `det`, de la matemática nativa y de la fecha: el contador
 * de Philox arranca de cero en cada llamada, así que dos llamadas dan el mismo texto (lo prueba det.test.ts contra el archivo).
 */
export function generarDoradas(fecha = '2026-10-18'): Doradas {
  contador = 0;
  const e = entradas1();
  const funciones: Record<string, string[][]> = {};
  const difieren: string[] = [];
  for (const nombre of ['log', 'exp', 'cos', 'sin', 'sqrt'] as const) {
    const f = det[nombre], g = matNativa[nombre];
    funciones[nombre] = e[nombre].map((x) => {
      const y = f(x), z = g(x);
      if (salida(y) !== salida(z)) difieren.push(`${nombre}(${x}) = ${y} con det y ${z} con V8`);
      return [aHex(x), salida(y)];
    });
  }
  funciones.pow = entradasPow().map(([x, y]) => {
    const a = det.pow(x, y), b = matNativa.pow(x, y);
    if (salida(a) !== salida(b)) difieren.push(`pow(${x}, ${y}) = ${a} con det y ${b} con V8`);
    return [aHex(x), aHex(y), salida(a)];
  });
  const doc: Doradas['doc'] = {
    version: 1,
    descripcion: 'Doradas de la matemática determinista del núcleo (nucleo/matematica/det.ts): 1.000 entradas por función. ' +
      'Cada número es el patrón de bits IEEE 754 en hexadecimal (palabra alta primero); un NaN de salida es "nan". ' +
      'Al generarlas, todas coincidieron bit a bit con Math.* de V8 (pow: exp(y·log x) nativo, como la referencia).',
    generadoCon: 'node nucleo/matematica/generar-doradas.ts',
    fecha,
    node: process.version,
    v8: process.versions.v8,
    funciones,
  };
  // Una entrada por línea: legible y con diferencias de git útiles si alguna vez se regeneran.
  const cuerpo = Object.entries(doc.funciones)
    .map(([nombre, filas]) => `    ${JSON.stringify(nombre)}: [\n${filas.map((f) => `      ${JSON.stringify(f)}`).join(',\n')}\n    ]`)
    .join(',\n');
  const { funciones: _f, ...cabecera } = doc;
  void _f;
  const texto = JSON.stringify(cabecera, null, 2).replace(/\n}$/, `,\n  "funciones": {\n${cuerpo}\n  }\n}\n`);
  return { doc, texto, difieren };
}

function principal(): void {
  const fechaArg = process.argv.find((a) => a.startsWith('--fecha='));
  const { doc, texto, difieren } = generarDoradas(fechaArg ? fechaArg.slice(8) : undefined);
  if (difieren.length > 0) {
    console.error(`No se escriben las doradas: ${difieren.length} salidas de det difieren de V8:\n${difieren.slice(0, 20).join('\n')}`);
    process.exit(1);
  }
  writeFileSync(new URL('./doradas-mat.json', import.meta.url), texto);
  console.log(`doradas-mat.json escrito: ${Object.keys(doc.funciones).length} funciones × ${POR_FUNCION} entradas, 0 diferencias con V8`);
}

// Solo escribe si se lo corre directo (importarlo desde una prueba no toca el archivo).
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) principal();
