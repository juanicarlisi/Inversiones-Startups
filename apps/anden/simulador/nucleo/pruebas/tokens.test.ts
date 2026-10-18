// «Hecho cuando» de P1 (corte-1.md §9 y regla técnica §1.4): una búsqueda de los tokens prohibidos en nucleo/, fuera de
// comentarios, da cero. Los tokens se arman por partes para que este archivo tampoco los contenga.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url)); // nucleo/
const M = 'Ma' + 'th';
// §1.4 más las demás funciones trascendentes de Math, que tampoco están fijadas por el estándar.
const FUNCIONES = ['random', 'log', 'exp', 'pow', 'sin', 'cos', 'tan', 'atan2', 'log1p', 'expm1', 'cbrt', 'hypot',
  'log10', 'log2', 'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh', 'fround'];
const PROHIBIDOS: [string, RegExp][] = [
  [`${M}.<trascendente>`, new RegExp(`\\b${M}\\s*\\.\\s*(${FUNCIONES.join('|')})\\b`)],
  [`${M}[…] (acceso indirecto)`, new RegExp(`\\b${M}\\s*\\[`)],
  ['Da' + 'te', new RegExp(`\\b${'Da' + 'te'}\\b`)],
  ['perfor' + 'mance', new RegExp(`\\b${'perfor' + 'mance'}\\b`)],
];

/** Quita comentarios // y /* *\/ respetando textos '…', "…" y plantillas `…${…}…` (con anidamiento). Mantiene los saltos de línea. */
export function sinComentarios(fuente: string): string {
  let salida = '';
  const pila: ('codigo' | 'plantilla')[] = ['codigo'];
  const llaves: number[] = [0];
  let i = 0;
  const n = fuente.length;
  while (i < n) {
    const c = fuente[i], d = fuente[i + 1];
    const modo = pila[pila.length - 1];
    if (modo === 'plantilla') {
      if (c === '\\') { salida += c + (d ?? ''); i += 2; continue; }
      if (c === '`') { salida += c; pila.pop(); i++; continue; }
      if (c === '$' && d === '{') { salida += '${'; pila.push('codigo'); llaves.push(0); i += 2; continue; }
      salida += c; i++; continue;
    }
    if (c === '/' && d === '/') { while (i < n && fuente[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') {
      i += 2;
      while (i < n && !(fuente[i] === '*' && fuente[i + 1] === '/')) { if (fuente[i] === '\n') salida += '\n'; i++; }
      i += 2;
      continue;
    }
    if (c === "'" || c === '"') {
      const cierre = c;
      salida += c; i++;
      while (i < n && fuente[i] !== cierre && fuente[i] !== '\n') {
        if (fuente[i] === '\\') { salida += fuente[i] + (fuente[i + 1] ?? ''); i += 2; continue; }
        salida += fuente[i]; i++;
      }
      if (i < n) { salida += fuente[i]; i++; }
      continue;
    }
    if (c === '`') { salida += c; pila.push('plantilla'); i++; continue; }
    if (c === '{') llaves[llaves.length - 1]++;
    if (c === '}') {
      if (llaves[llaves.length - 1] === 0 && pila.length > 1) { salida += c; pila.pop(); llaves.pop(); i++; continue; }
      llaves[llaves.length - 1]--;
    }
    salida += c; i++;
  }
  return salida;
}

function archivos(dir: string): string[] {
  const todos: string[] = [];
  for (const nombre of readdirSync(dir)) {
    const p = join(dir, nombre);
    if (statSync(p).isDirectory()) todos.push(...archivos(p));
    else if (/\.(ts|mts|js|mjs)$/.test(nombre)) todos.push(p);
  }
  return todos;
}

test('el quitador de comentarios no se deja engañar por textos ni plantillas', () => {
  const ejemplo = [
    `const a = 'https://x.y/z'; // ${M}.log(1)`,
    `/* ${M}.exp(2) */ const b = "/* no es comentario */";`,
    'const c = `${1 + 2} // sigue siendo texto ${`anidada ${3}`}`; // pero esto sí es comentario',
  ].join('\n');
  const limpio = sinComentarios(ejemplo);
  assert.ok(!limpio.includes(`${M}.log`) && !limpio.includes(`${M}.exp`), 'los comentarios se tienen que borrar');
  assert.ok(limpio.includes("'https://x.y/z'") && limpio.includes('"/* no es comentario */"'), 'los textos se tienen que conservar');
  assert.ok(limpio.includes('// sigue siendo texto') && !limpio.includes('pero esto sí'), 'las plantillas se tienen que respetar');
  assert.equal(limpio.split('\n').length, 3, 'se conservan los saltos de línea (para informar la línea)');
});

test('ningún token prohibido de la regla §1.4 en nucleo/ (fuera de comentarios): 0 apariciones', () => {
  const lista = archivos(RAIZ);
  assert.ok(lista.length >= 15, `se esperaban los archivos del núcleo y se encontraron ${lista.length}`);
  const hallazgos: string[] = [];
  for (const archivo of lista) {
    const lineas = sinComentarios(readFileSync(archivo, 'utf8')).split('\n');
    lineas.forEach((linea, k) => {
      for (const [nombre, re] of PROHIBIDOS) if (re.test(linea)) hallazgos.push(`${relative(RAIZ, archivo)}:${k + 1} · ${nombre} · ${linea.trim()}`);
    });
  }
  assert.equal(hallazgos.length, 0, `se esperaban 0 tokens prohibidos y hay ${hallazgos.length}:\n${hallazgos.join('\n')}`);
});

test('la búsqueda sí encuentra un token prohibido cuando está (control de la prueba)', () => {
  const sembrado = `const x = ${M}.cos(1);\nconst y = new ${'Da' + 'te'}();\nconst z = ${'perfor' + 'mance'}.now();\nconst w = ${M}['log'];`;
  const lineas = sinComentarios(sembrado).split('\n');
  const encontrados = lineas.filter((l) => PROHIBIDOS.some(([, re]) => re.test(l)));
  assert.equal(encontrados.length, 4);
  // Y las permitidas no cuentan.
  const permitidas = `${M}.sqrt(2) + ${M}.floor(1.5) + ${M}.round(2) + ${M}.imul(3, 4) + ${M}.trunc(5) + ${M}.PI + ${M}.abs(-1) + ${M}.max(1, 2)`;
  assert.ok(!PROHIBIDOS.some(([, re]) => re.test(permitidas)));
});
