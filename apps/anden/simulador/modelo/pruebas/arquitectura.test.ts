// pruebas/arquitectura.test.ts · P3 · Lo que `modelo/` no puede hacer (diseno-maestro.md §4.3), verificado sobre el texto de los archivos:
// usar azar o el reloj, depender de otro paquete, tocar el DOM o ejecutar texto como código. Corre en el Worker y en la interfaz.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const CARPETA = new URL('../', import.meta.url);
const FUENTES = readdirSync(CARPETA).filter((f) => f.endsWith('.ts')).sort();

/** Quita comentarios y el contenido de los textos entre comillas, para buscar tokens solo en el código. */
function soloCodigo(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      out += q;
      i++;
      while (i < n && src[i] !== q) { if (src[i] === '\\') i++; if (q !== '`' && src[i] === '\n') break; i++; }
      out += q;
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

test('el paquete tiene los archivos que pide corte-1.md §2 (más ayudas propias) y los textos', () => {
  for (const f of ['esquema', 'normalizar', 'chequeos', 'f0', 'presupuesto', 'compilar', 'variante', 'canonico', 'huella', 'parches', 'enlace', 'anonimizar', 'indice']) {
    assert.ok(FUENTES.includes(`${f}.ts`), `falta modelo/${f}.ts`);
  }
  const todos = readdirSync(CARPETA);
  for (const f of ['textos.es.json', 'textos.en.json', 'NOTAS-CONTRATO.md']) assert.ok(todos.includes(f), `falta modelo/${f}`);
});

test('solo importa de sí mismo y de contratos/ (ningún otro paquete)', () => {
  for (const f of FUENTES) {
    const src = readFileSync(new URL(f, CARPETA), 'utf8');
    for (const m of src.matchAll(/^\s*(?:import|export)\b[^'"`;]*?from\s*['"]([^'"]+)['"]/gms)) {
      const ruta = m[1];
      const ok = /^\.\/[a-z0-9-]+\.ts$/.test(ruta) || /^\.\.\/contratos\/[a-z0-9-]+\.ts$/.test(ruta);
      assert.ok(ok, `modelo/${f} importa «${ruta}»: solo se permiten ./archivo.ts y ../contratos/archivo.ts`);
    }
    assert.ok(!/\brequire\s*\(/.test(soloCodigo(src)), `modelo/${f} usa require`);
    assert.ok(!/\bimport\s*\(/.test(soloCodigo(src)), `modelo/${f} usa import() dinámico`);
  }
});

test('los imports llevan la extensión .ts y no hay imports de «node:» en el código que corre en el navegador', () => {
  for (const f of FUENTES) {
    const src = readFileSync(new URL(f, CARPETA), 'utf8');
    assert.ok(!/from\s*['"]node:/.test(src), `modelo/${f} importa de node:`);
    for (const m of src.matchAll(/from\s*['"](\.[^'"]*)['"]/g)) assert.ok(m[1].endsWith('.ts'), `modelo/${f}: el import «${m[1]}» no lleva .ts`);
  }
});

test('determinismo: nada de Math.random, log, exp, pow, sin, cos…, Date, performance ni el operador ** (corte-1.md §1.4)', () => {
  const prohibidos = /\bMath\.(random|log|exp|pow|sin|cos|tan|atan2|log1p|expm1|cbrt|hypot|log2|log10|sinh|cosh|tanh|asin|acos|atan|fround)\b|\bDate\b|\bperformance\b|\*\*/;
  for (const f of FUENTES) {
    const codigo = soloCodigo(readFileSync(new URL(f, CARPETA), 'utf8'));
    const m = prohibidos.exec(codigo);
    assert.ok(!m, `modelo/${f} usa «${m?.[0]}»: F0, el presupuesto y la huella tienen que dar lo mismo en cualquier motor de JavaScript`);
  }
});

test('sin DOM, sin red, sin Node, sin ejecución de texto como código y sin almacenamiento', () => {
  const prohibidos = /\b(document|window|navigator|localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocket|Worker|eval|Function|Buffer|process|innerHTML|outerHTML|insertAdjacentHTML|setTimeout|setInterval|__dirname|__filename)\b/;
  for (const f of FUENTES) {
    const codigo = soloCodigo(readFileSync(new URL(f, CARPETA), 'utf8'));
    const m = prohibidos.exec(codigo);
    assert.ok(!m, `modelo/${f} usa «${m?.[0]}»: el paquete corre en un Worker y no toca nada fuera de sus argumentos`);
  }
});

test('la única API de plataforma que usa es la que pide el diseño: crypto.subtle, CompressionStream, DecompressionStream, Blob, TextEncoder, TextDecoder', () => {
  const permitidas = new Set(['crypto', 'CompressionStream', 'DecompressionStream', 'Blob', 'TextEncoder', 'TextDecoder', 'ReadableStream']);
  const usadas = new Set<string>();
  for (const f of FUENTES) {
    const codigo = soloCodigo(readFileSync(new URL(f, CARPETA), 'utf8'));
    for (const n of ['crypto', 'CompressionStream', 'DecompressionStream', 'Blob', 'TextEncoder', 'TextDecoder', 'ReadableStream', 'globalThis']) {
      if (new RegExp(`\\b${n}\\b`).test(codigo)) usadas.add(n);
    }
  }
  for (const u of usadas) assert.ok(permitidas.has(u) || u === 'globalThis', `usa ${u}`);
  for (const esperada of ['crypto', 'CompressionStream', 'DecompressionStream']) assert.ok(usadas.has(esperada), `debería usar ${esperada}`);
});

test('ningún archivo del paquete asigna a innerHTML ni evalúa texto (búsqueda en el texto crudo, también en pruebas)', () => {
  for (const f of FUENTES) {
    const src = readFileSync(new URL(f, CARPETA), 'utf8');
    assert.ok(!/\.innerHTML\s*=|new Function\(|\beval\(/.test(src), `modelo/${f}`);
  }
});

test('las claves prohibidas de contaminación de prototipo están en una sola lista, usada por la copia segura y los parches', () => {
  const src = readFileSync(new URL('parches.ts', CARPETA), 'utf8');
  assert.match(src, /new Set\(\['__proto__', 'constructor', 'prototype'\]\)/);
  const esquema = readFileSync(new URL('esquema.ts', CARPETA), 'utf8');
  assert.match(esquema, /CLAVES_PROHIBIDAS\.has\(k\)/);
});
