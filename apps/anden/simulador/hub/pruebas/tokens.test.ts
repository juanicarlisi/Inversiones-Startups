// hub/pruebas/tokens.test.ts · P4 · Determinismo por texto (corte-1.md §1.4): en hub/ no hay Math.random, ni matemática trascendente
// nativa, ni Date, ni performance, ni acceso indirecto a Math[…], fuera de comentarios. La matemática va por m.mat (o por la
// referencia de contratos/ en las herramientas que generan archivos fijos). Lo repite la prueba de arquitectura de la integración.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const M = 'Math' + '.';
const PROHIBIDOS = [
  ...['random', 'log', 'exp', 'pow', 'sin', 'cos', 'tan', 'atan2', 'log1p', 'expm1', 'cbrt', 'hypot',
    'log10', 'log2', 'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh', 'fround'].map((f) => new RegExp(`\\b${M.replace('.', '\\.')}${f}\\b`)),
  new RegExp('\\b' + 'Date' + '\\b'), new RegExp('\\b' + 'performance' + '\\b'), new RegExp('\\bMath\\s*\\['),
];

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : /\.(ts|mjs|js)$/.test(n) ? [p] : [];
  });
}

/** Saca comentarios y textos entre comillas (los mensajes pueden nombrar cosas sin usarlas). */
function codigo(texto: string): string {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''");
}

test('ningún token prohibido en hub/ (fuera de comentarios y textos)', () => {
  const lista = archivos(RAIZ);
  assert.ok(lista.length >= 30, `se revisaron ${lista.length} archivos`);
  const hallazgos: string[] = [];
  for (const a of lista) {
    const lineas = codigo(readFileSync(a, 'utf8')).split('\n');
    lineas.forEach((l, i) => { for (const p of PROHIBIDOS) if (p.test(l)) hallazgos.push(`${relative(RAIZ, a)}:${i + 1} ${p}`); });
  }
  assert.deepEqual(hallazgos, [], `tokens prohibidos:\n${hallazgos.join('\n')}`);
});

test('la búsqueda detecta lo que tiene que detectar', () => {
  const sembrado = codigo(`const x = ${M}log(2); // ${M}exp(1) en un comentario no cuenta\nconst d = new ${'Date'}();\nconst q = 'Math.cos en un texto';`);
  const encontrados = PROHIBIDOS.filter((p) => p.test(sembrado)).length;
  assert.equal(encontrados, 2, 'Math.log en código y Date; no el comentario ni el texto');
});
