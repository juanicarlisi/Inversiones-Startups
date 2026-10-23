// Matemática determinista (contratos/matematica.ts): 0 diferencias de bits con Math.* de V8 en 10^6 valores por función y rango,
// coincidencia exacta con doradas-mat.json, casos especiales y rango del contrato para sin y cos.
// La matemática nativa se toma de la referencia de contratos/ (matNativa): así el núcleo no nombra ninguna función prohibida.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { det, tablaNpio2 } from '../matematica/det.ts';
import { generarDoradas, type Doradas } from '../matematica/generar-doradas.ts';
import { crearFuenteAzar } from '../azar/fuente.ts';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';
import type { Direccion } from '../../contratos/azar.ts';

const N = 1_000_000;
const F = new Float64Array(2), U = new Uint32Array(F.buffer);
/** Igualdad de bits (dos NaN cuentan como iguales: JavaScript no fija los bits de un NaN). */
function mismosBits(x: number, y: number): boolean {
  if (x !== x && y !== y) return true;
  F[0] = x; F[1] = y;
  return U[0] === U[2] && U[1] === U[3];
}

// Entradas deterministas con Philox (semilla fija).
const fuente = crearFuenteAzar(20261018, 0);
const dir: Direccion = { clave: 0x6d617468, a: 0, b: 0, c: 0 };
function u(n: number, i = 0): number { dir.a = n; return fuente.uniforme(dir, i); }
const G = new Float64Array(1), GU = new Uint32Array(G.buffer);
const ALTO = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1 ? 1 : 0;
/** Double positivo con exponente sin sesgo en [emin, emax] y mantisa al azar. */
function conExponente(n: number, emin: number, emax: number): number {
  const e = emin + Math.floor(u(n, 0) * (emax - emin + 1));
  GU[ALTO] = (((e + 1023) << 20) | (Math.floor(u(n, 1) * 1048576) & 0xfffff)) >>> 0;
  GU[1 - ALTO] = Math.floor(u(n, 2) * 4294967296) >>> 0;
  return G[0];
}

function contarDiferencias(f: (x: number) => number, g: (x: number) => number, gen: (n: number) => number): { n: number; ejemplo: string } {
  let n = 0, ejemplo = '';
  for (let k = 0; k < N; k++) {
    const x = gen(k), a = f(x), b = g(x);
    if (!mismosBits(a, b)) { n++; if (!ejemplo) ejemplo = `x = ${x}: det ${a} · V8 ${b}`; }
  }
  return { n, ejemplo };
}

const RANGOS: [string, (x: number) => number, (x: number) => number, (n: number) => number][] = [
  ['log en (0, 1)', det.log, matNativa.log, (n) => u(n)],
  ['log en 10^±300', det.log, matNativa.log, (n) => conExponente(n, -996, 996)],
  ['exp en (−700, 700)', det.exp, matNativa.exp, (n) => (u(n) - 0.5) * 1400],
  ['cos en [0, 2π]', det.cos, matNativa.cos, (n) => 2 * Math.PI * u(n)],
  ['sin en [0, 2π]', det.sin, matNativa.sin, (n) => 2 * Math.PI * u(n)],
  ['sqrt en 10^±300', det.sqrt, matNativa.sqrt, (n) => conExponente(n, -996, 996)],
];
for (const [nombre, f, g, gen] of RANGOS) {
  test(`det: 0 diferencias de bits con V8 en 10^6 valores · ${nombre}`, () => {
    const r = contarDiferencias(f, g, gen);
    assert.equal(r.n, 0, `${nombre}: se esperaban 0 diferencias con Math.* de V8 y hubo ${r.n} (primera: ${r.ejemplo})`);
  });
}

test('det: 0 diferencias de bits con V8 en 10^6 valores · pow con x en (0, 1.000) e y en (−10, 10) (exp(y·log x) nativo)', () => {
  let n = 0, ejemplo = '';
  for (let k = 0; k < N; k++) {
    const x = u(k, 0) * 1000, y = (u(k, 1) - 0.5) * 20;
    const a = det.pow(x, y), b = matNativa.pow(x, y);
    if (!mismosBits(a, b)) { n++; if (!ejemplo) ejemplo = `pow(${x}, ${y}): det ${a} · V8 ${b}`; }
  }
  assert.equal(n, 0, `pow: se esperaban 0 diferencias y hubo ${n} (primera: ${ejemplo})`);
});

test('det (informativa): sin y cos en ±1.000 y cerca de múltiplos de π/2 contra V8', (t) => {
  // El contrato solo exige [0, 2π); la reducción de fdlibm completa (2 a 4 términos) coincide también en todo el rango.
  const cerca = (n: number) => Math.round((u(n, 0) - 0.5) * 1200) * (Math.PI / 2) + (u(n, 1) - 0.5) * 1e-6;
  const resultados = {
    cosMil: contarDiferencias(det.cos, matNativa.cos, (n) => (u(n) - 0.5) * 2000).n,
    sinMil: contarDiferencias(det.sin, matNativa.sin, (n) => (u(n) - 0.5) * 2000).n,
    cosCercaDeKPiMedios: contarDiferencias(det.cos, matNativa.cos, cerca).n,
    sinCercaDeKPiMedios: contarDiferencias(det.sin, matNativa.sin, cerca).n,
  };
  t.diagnostic(`diferencias con V8 en 10^6 valores cada una: ${JSON.stringify(resultados)}`);
});

test('det coincide exactamente con doradas-mat.json (1.000 entradas por función)', () => {
  const doc = JSON.parse(readFileSync(new URL('../matematica/doradas-mat.json', import.meta.url), 'utf8')) as
    { version: number; funciones: Record<string, string[][]> };
  assert.equal(doc.version, 1);
  const deHex = (h: string): number => {
    assert.match(h, /^[0-9a-f]{16}$/, `doradas: hex inválido «${h}»`);
    GU[ALTO] = Number.parseInt(h.slice(0, 8), 16); GU[1 - ALTO] = Number.parseInt(h.slice(8), 16);
    return G[0];
  };
  const comparar = (nombre: string, y: number, esperado: string, entrada: string) => {
    if (esperado === 'nan') assert.ok(y !== y, `${nombre}(${entrada}): se esperaba NaN y salió ${y}`);
    else assert.ok(mismosBits(y, deHex(esperado)), `${nombre}(${entrada}): se esperaba ${deHex(esperado)} y salió ${y}`);
  };
  for (const nombre of ['log', 'exp', 'cos', 'sin', 'sqrt'] as const) {
    const filas = doc.funciones[nombre];
    assert.equal(filas.length, 1000, `${nombre}: se esperaban 1.000 entradas y hay ${filas.length}`);
    for (const [x, y] of filas) comparar(nombre, det[nombre](deHex(x)), y, String(deHex(x)));
  }
  const pow = doc.funciones.pow;
  assert.equal(pow.length, 1000);
  for (const [x, y, z] of pow) comparar('pow', det.pow(deHex(x), deHex(y)), z, `${deHex(x)}, ${deHex(y)}`);
});

test('doradas-mat.json es exactamente lo que genera generar-doradas.ts (sin escribir nada) y det sigue igual a V8 en esas entradas', () => {
  const archivo = readFileSync(new URL('../matematica/doradas-mat.json', import.meta.url), 'utf8');
  const guardadas = JSON.parse(archivo) as Doradas['doc'];
  const generadas = generarDoradas(guardadas.fecha);
  assert.deepEqual(generadas.difieren, [], `al regenerar, det difiere de V8 en: ${generadas.difieren.slice(0, 5).join(' · ')}`);
  for (const nombre of Object.keys(guardadas.funciones)) {
    const a = guardadas.funciones[nombre], b = generadas.doc.funciones[nombre];
    assert.equal(b.length, a.length, `${nombre}: se esperaban ${a.length} entradas regeneradas y salieron ${b.length}`);
    const primera = a.findIndex((fila, i) => fila.join() !== b[i].join());
    assert.equal(primera, -1, primera < 0 ? '' :
      `${nombre}, fila ${primera}: el archivo tiene ${JSON.stringify(a[primera])} y el generador da ${JSON.stringify(b[primera])}`);
  }
  assert.deepEqual(Object.keys(generadas.doc.funciones), Object.keys(guardadas.funciones));
  // Con el mismo Node y el mismo V8 que las generaron, el texto es idéntico byte a byte (cabecera incluida).
  if (guardadas.node === process.version && guardadas.v8 === process.versions.v8) {
    assert.equal(generadas.texto, archivo, 'el texto regenerado tiene que ser idéntico al archivo commiteado');
  }
  // Dos generaciones seguidas dan lo mismo: el generador no arrastra estado entre llamadas.
  assert.equal(generarDoradas(guardadas.fecha).texto, generadas.texto);
});

test('det: casos especiales (ceros con signo, infinitos, NaN, subnormales, bordes de desborde)', () => {
  const es = (a: number, b: number, que: string) => assert.ok(Object.is(a, b), `${que}: se esperaba ${Object.is(b, -0) ? '-0' : b} y salió ${Object.is(a, -0) ? '-0' : a}`);
  es(det.log(0), -Infinity, 'log(0)'); es(det.log(-0), -Infinity, 'log(−0)'); es(det.log(1), 0, 'log(1)');
  es(det.log(Infinity), Infinity, 'log(∞)');
  assert.ok(Number.isNaN(det.log(-1)) && Number.isNaN(det.log(NaN)) && Number.isNaN(det.log(-Infinity)), 'log de negativos y NaN da NaN');
  es(det.log(5e-324), matNativa.log(5e-324), 'log(menor subnormal)');
  es(det.exp(0), 1, 'exp(0)'); es(det.exp(-0), 1, 'exp(−0)'); es(det.exp(1), 2.718281828459045, 'exp(1)');
  es(det.exp(Infinity), Infinity, 'exp(∞)'); es(det.exp(-Infinity), 0, 'exp(−∞)'); es(det.exp(710), Infinity, 'exp(710)');
  es(det.exp(-746), 0, 'exp(−746)'); es(det.exp(709.782712893384), matNativa.exp(709.782712893384), 'exp(máximo finito)');
  es(det.exp(-745.1332191019411), 5e-324, 'exp(−745,133…)');
  assert.ok(Number.isNaN(det.exp(NaN)));
  es(det.sin(0), 0, 'sin(0)'); es(det.sin(-0), -0, 'sin(−0)'); es(det.cos(0), 1, 'cos(0)'); es(det.cos(-0), 1, 'cos(−0)');
  assert.ok(Number.isNaN(det.sin(NaN)) && Number.isNaN(det.cos(NaN)), 'sin y cos de NaN dan NaN');
  es(det.pow(5, 0), 1, 'pow(5, 0)'); es(det.pow(NaN, 0), 1, 'pow(NaN, 0)'); es(det.pow(0, 3), 0, 'pow(0, 3)');
  es(det.pow(0, -1), 0, 'pow(0, −1) (como la referencia; ver NOTAS-CONTRATO.md)');
  assert.ok(Number.isNaN(det.pow(-2, 0.5)), 'pow(−2, 0,5) da NaN');
  es(det.pow(2, 10), matNativa.pow(2, 10), 'pow(2, 10)');
  es(det.sqrt(2), Math.sqrt(2), 'sqrt(2)');
});

test('sin y cos: válidas en |x| ≤ 1.000 y error claro fuera (contrato)', () => {
  assert.doesNotThrow(() => det.cos(1000));
  assert.doesNotThrow(() => det.sin(-1000));
  assert.throws(() => det.cos(1000.0000000000001), /det\.cos: se esperaba \|x\| ≤ 1000 .* y se recibió 1000\.0000000000001/);
  assert.throws(() => det.sin(-1001), /det\.sin: se esperaba \|x\| ≤ 1000/);
  assert.throws(() => det.cos(Infinity), RangeError);
  assert.throws(() => det.sin(-Infinity), RangeError);
});

test('la tabla npio2_hw calculada es la de fdlibm (palabras altas de n·π/2, n = 1…32)', () => {
  const fdlibm = [0x3FF921FB, 0x400921FB, 0x4012D97C, 0x401921FB, 0x401F6A7A, 0x4022D97C, 0x4025FDBB, 0x402921FB, 0x402C463A,
    0x402F6A7A, 0x4031475C, 0x4032D97C, 0x40346B9C, 0x4035FDBB, 0x40378FDB, 0x403921FB, 0x403AB41B, 0x403C463A, 0x403DD85A,
    0x403F6A7A, 0x40407E4C, 0x4041475C, 0x4042106C, 0x4042D97C, 0x4043A28C, 0x40446B9C, 0x404534AC, 0x4045FDBB, 0x4046C6CB,
    0x40478FDB, 0x404858EB, 0x404921FB];
  assert.deepEqual(Array.from(tablaNpio2()), fdlibm);
});

test('det es inmutable', () => {
  assert.ok(Object.isFrozen(det));
  assert.throws(() => { (det as { log: unknown }).log = () => 0; }, TypeError);
});
