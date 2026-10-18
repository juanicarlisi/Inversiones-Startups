// Reglas de arquitectura sobre el texto de verificacion/ (las mismas que controla la integración, para enterarse antes):
// sin los tokens prohibidos de corte-1.md §1.4 fuera de comentarios, y sin importar otros paquetes (solo contratos/, verificacion/ y node:).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SIMULADOR = resolve(RAIZ, '..');

function archivosTs(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'informe') out.push(...archivosTs(p)); } else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}

/** Saca comentarios respetando cadenas y plantillas (lo justo para estos archivos). */
function sinComentarios(src: string): string {
  let out = '', i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') {
      const q = c; out += c; i++;
      while (i < src.length && src[i] !== q) { if (src[i] === '\\') { out += src[i++]; } out += src[i++]; }
      out += src[i++] ?? '';
      continue;
    }
    out += c; i++;
  }
  return out;
}

// Los tokens se arman por partes para que este archivo no los contenga literalmente.
const PROHIBIDOS = ['random', 'log', 'exp', 'pow', 'sin', 'cos', 'tan', 'atan2', 'log1p', 'expm1', 'cbrt', 'hypot'].map((f) => `Math.${f}`)
  .concat(['Da' + 'te', 'perfor' + 'mance']);

/** El operador de potencia es la potencia nativa con otra sintaxis. */
const POTENCIA = new RegExp('\\*' + '\\*');

const archivos = archivosTs(RAIZ);

test('verificacion/ tiene archivos para revisar', () => { assert.ok(archivos.length >= 20, `solo ${archivos.length} archivos`); });

test('ningún token prohibido de §1.4 fuera de comentarios (azar y matemática nativos, reloj)', () => {
  const hallazgos: string[] = [];
  for (const a of archivos) {
    const txt = sinComentarios(readFileSync(a, 'utf8'));
    for (const t of PROHIBIDOS) {
      const re = new RegExp(`(?<![\\w.])${t.replace('.', '\\.')}(?![\\w])`);
      if (re.test(txt)) hallazgos.push(`${relative(SIMULADOR, a)}: ${t}`);
    }
    if (POTENCIA.test(txt)) hallazgos.push(`${relative(SIMULADOR, a)}: operador de potencia nativa`);
  }
  assert.deepEqual(hallazgos, []);
});

test('imports: solo contratos/, la propia verificacion/ y módulos node:', () => {
  const malos: string[] = [];
  for (const a of archivos) {
    const txt = readFileSync(a, 'utf8');
    const re = new RegExp('(?:from\\s+|import\\s*\\(\\s*)[\\u0027\\u0022]([^\\u0027\\u0022]+)[\\u0027\\u0022]', 'g');
    for (let m = re.exec(txt); m; m = re.exec(txt)) {
      const ruta = m[1];
      if (ruta.startsWith('node:')) continue;
      if (!ruta.startsWith('.')) { malos.push(`${relative(SIMULADOR, a)}: «${ruta}» (dependencia externa)`); continue; }
      if (!ruta.endsWith('.ts')) malos.push(`${relative(SIMULADOR, a)}: «${ruta}» sin extensión .ts`);
      const destino = relative(SIMULADOR, resolve(dirname(a), ruta));
      if (!destino.startsWith('contratos/') && !destino.startsWith('verificacion/')) malos.push(`${relative(SIMULADOR, a)}: importa ${destino}`);
    }
  }
  assert.deepEqual(malos, []);
});

test('TypeScript borrable: sin enum ni namespace', () => {
  for (const a of archivos) {
    const txt = sinComentarios(readFileSync(a, 'utf8'));
    assert.ok(!/\benum\s+\w+\s*\{/.test(txt) && !/\bnamespace\s+\w+\s*\{/.test(txt), `${relative(SIMULADOR, a)} usa enum o namespace`);
  }
});
