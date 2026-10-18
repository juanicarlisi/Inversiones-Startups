// Reglas de arquitectura sobre el texto de experimentos/ (las mismas que controla la integración, para enterarse antes):
//  · §1.4: sin Math.random/log/exp/pow/sin/cos/tan/atan2/log1p/expm1/cbrt/hypot, sin Date ni performance, sin el operador de
//    potencia (es la potencia nativa con otra sintaxis), fuera de comentarios. Tampoco en las pruebas.
//  · §14.3: ningún import de otro paquete: solo contratos/, archivos de experimentos/ y módulos node:.
//  · §1.2: TypeScript borrable (sin enum, namespace con código, propiedades en parámetros).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');       // experimentos/
const SIMULADOR = resolve(RAIZ, '..');

function archivos(dir: string): string[] {
  const salida: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) salida.push(...archivos(p));
    else if (/\.(ts|mts|js|mjs)$/.test(e.name)) salida.push(p);
  }
  return salida;
}

/** Saca comentarios respetando textos y plantillas (lo justo para estos archivos). */
function sinComentarios(src: string): string {
  let out = '', i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') {
      const q = c; out += c; i++;
      while (i < src.length && src[i] !== q) { if (src[i] === '\\') out += src[i++]; out += src[i++]; }
      out += src[i++] ?? '';
      continue;
    }
    out += c; i++;
  }
  return out;
}

// Los tokens se arman por partes para que este archivo no los contenga literalmente.
const M = 'Ma' + 'th';
const FUNCIONES = ['random', 'log', 'exp', 'pow', 'sin', 'cos', 'tan', 'atan2', 'log1p', 'expm1', 'cbrt', 'hypot'];
const TODOS = archivos(RAIZ);

test('experimentos/ tiene archivos para revisar', () => {
  assert.ok(TODOS.length >= 25, `solo ${TODOS.length} archivos`);
});

test('ningún token prohibido de §1.4 fuera de comentarios (azar y matemática nativos, reloj, potencia nativa), ni en las pruebas', () => {
  const hallazgos: string[] = [];
  for (const a of TODOS) {
    const txt = sinComentarios(readFileSync(a, 'utf8'));
    for (const f of FUNCIONES) if (new RegExp(`(?<![\\w.])${M}\\s*\\.\\s*${f}(?![\\w])`).test(txt)) hallazgos.push(`${relative(SIMULADOR, a)}: ${M}.${f}`);
    if (new RegExp(`(?<![\\w.])${M}\\s*\\[`).test(txt)) hallazgos.push(`${relative(SIMULADOR, a)}: acceso indirecto ${M}[…]`);
    for (const t of ['Da' + 'te', 'perfor' + 'mance']) if (new RegExp(`(?<![\\w.])${t}(?![\\w])`).test(txt)) hallazgos.push(`${relative(SIMULADOR, a)}: ${t}`);
    if (new RegExp('\\*' + '\\*').test(txt)) hallazgos.push(`${relative(SIMULADOR, a)}: operador de potencia nativa`);
  }
  assert.deepEqual(hallazgos, []);
});

test('el detector de tokens no es ciego: encuentra los prohibidos en un texto que los usa y respeta los comentarios y los textos', () => {
  const malo = `const a = ${M}.log(2); const b = x ${'*' + '*'} 2; const c = new ${'Da' + 'te'}();`;
  const txt = sinComentarios(malo);
  assert.ok(new RegExp(`${M}\\s*\\.\\s*log`).test(txt));
  assert.ok(new RegExp('\\*' + '\\*').test(txt));
  const limpio = sinComentarios(`// ${M}.log(2)\n/* ${M}.exp(1) */ const s = "${M}.sin(1)"; const t = 'y ${'*' + '*'} z';`);
  assert.ok(!new RegExp(`(?<![\\w.])${M}\\s*\\.\\s*(log|exp)`).test(limpio.replace(/"[^"]*"|'[^']*'/g, '""')));
});

test('ningún import sale de contratos/ o de experimentos/ (nada de nucleo/, hub/, modelo/, explicacion/…)', () => {
  const malos: string[] = [];
  const especificador = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
  for (const a of TODOS) {
    const txt = readFileSync(a, 'utf8');
    for (const m of txt.matchAll(especificador)) {
      const quien = m[1];
      if (quien.startsWith('node:')) continue;
      if (!quien.startsWith('.')) { malos.push(`${relative(SIMULADOR, a)} importa el módulo externo «${quien}»`); continue; }
      const destino = resolve(dirname(a), quien);
      const rel = relative(SIMULADOR, destino).replace(/\\/g, '/');
      if (!(rel.startsWith('experimentos/') || rel.startsWith('contratos/'))) malos.push(`${relative(SIMULADOR, a)} importa «${quien}» (${rel})`);
    }
  }
  assert.deepEqual(malos, []);
});

test('todos los imports locales llevan la extensión .ts o .json (regla §1.2)', () => {
  const malos: string[] = [];
  for (const a of TODOS.filter((f) => f.endsWith('.ts'))) {
    const txt = readFileSync(a, 'utf8');
    for (const m of txt.matchAll(/(?:from\s+|import\s*\(\s*)['"](\.[^'"]+)['"]/g)) {
      if (!/\.(ts|json)$/.test(m[1])) malos.push(`${relative(SIMULADOR, a)}: «${m[1]}»`);
    }
  }
  assert.deepEqual(malos, []);
});

test('TypeScript borrable: sin enum, sin namespace con código y sin propiedades en parámetros del constructor', () => {
  const malos: string[] = [];
  for (const a of TODOS.filter((f) => f.endsWith('.ts'))) {
    const txt = sinComentarios(readFileSync(a, 'utf8'));
    if (/(^|\n)\s*(export\s+)?(const\s+)?enum\s+\w+/.test(txt)) malos.push(`${relative(SIMULADOR, a)}: enum`);
    if (/(^|\n)\s*(export\s+)?namespace\s+\w+/.test(txt)) malos.push(`${relative(SIMULADOR, a)}: namespace`);
    if (/constructor\s*\([^)]*\b(public|private|protected|readonly)\s+\w+/.test(txt)) malos.push(`${relative(SIMULADOR, a)}: propiedad en parámetro`);
  }
  assert.deepEqual(malos, []);
});

test('sin nombres de empresas (lista negra de §1.7) en el código, los textos ni las pruebas', () => {
  const lista = ['Andreani', 'Mercado Libre', 'MercadoLibre', 'Correo Argentino', 'OCA', 'DHL', 'FedEx', 'UPS', 'Amazon', 'Loginter', 'Urbano', 'Rappi', 'PedidosYa'];
  const hallazgos: string[] = [];
  for (const a of [...TODOS.filter((f) => !f.endsWith('arquitectura.test.ts')), join(RAIZ, 'textos.es.json'), join(RAIZ, 'textos.en.json')]) {   // este archivo es el que tiene la lista
    const txt = readFileSync(a, 'utf8');
    for (const n of lista) if (new RegExp(`(?<![A-Za-zÁ-ú])${n}(?![A-Za-zÁ-ú])`).test(txt)) hallazgos.push(`${relative(SIMULADOR, a)}: ${n}`);
  }
  assert.deepEqual(hallazgos, []);
});
