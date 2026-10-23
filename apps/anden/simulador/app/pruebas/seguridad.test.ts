// app/pruebas/seguridad.test.ts · P8 · reglas de corte-1.md §1.7 y §1.8 sobre el texto de app/: ninguna asignación de HTML (innerHTML y
// parientes), ningún estilo en línea, CSP estricta en index.html y ningún nombre de empresa de la lista negra en los textos ni en el código.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { APP, archivosApp, leer, sinComentarios } from './ayudas.ts';

// La de §1.8 endurecida (hallazgo SEG-06): sin blob: en worker-src y con base-uri y form-action cerrados (frame-ancestors va en la cabecera).
const CSP = "default-src 'self'; script-src 'self'; worker-src 'self'; img-src 'self' data: blob:; style-src 'self'; base-uri 'none'; form-action 'none'";
const LISTA_NEGRA = ['Andreani', 'Mercado Libre', 'MercadoLibre', 'Correo Argentino', 'Loginter', 'Urbano', 'Rappi', 'PedidosYa', 'FedEx', 'Amazon'];
/** Siglas: se buscan en mayúsculas y como palabra («toca» u «oca» no son la empresa). */
const SIGLAS = ['OCA', 'DHL', 'UPS'];

/** Esta prueba nombra los patrones que busca: se excluye a sí misma. */
const ESTA = 'seguridad.test.ts';
const revisables = (ext: string[]) => archivosApp(ext).filter((p) => !p.endsWith(ESTA));

function buscarMarcas(texto: string): string[] {
  const vistas: string[] = [];
  for (const m of LISTA_NEGRA) if (new RegExp(`\\b${m.replace(/\s+/g, '\\s*')}\\b`, 'i').test(texto)) vistas.push(m);
  for (const s of SIGLAS) if (new RegExp(`\\b${s}\\b`).test(texto)) vistas.push(s);
  return vistas;
}

test('ninguna asignación a innerHTML, outerHTML, insertAdjacentHTML ni document.write en app/ (fuera de comentarios)', () => {
  const malos: string[] = [];
  for (const p of revisables(['.ts', '.mjs', '.js'])) {
    const c = sinComentarios(leer(p));
    for (const re of [/\.innerHTML\s*[+]?=/, /\.outerHTML\s*[+]?=/, /insertAdjacentHTML\s*\(/, /document\.write(ln)?\s*\(/, /createContextualFragment/, /DOMParser/]) {
      if (re.test(c)) malos.push(`${p.slice(APP.length + 1)}: ${re}`);
    }
  }
  assert.deepEqual(malos, [], `se esperaba ninguna inserción de HTML y se encontró: ${malos.join('; ')}`);
});

test('sin estilos ni manejadores en línea: ni setAttribute("style"), ni style= ni on…= en el HTML', () => {
  const malos: string[] = [];
  for (const p of revisables(['.ts'])) if (/setAttribute\(\s*['"]style['"]/.test(sinComentarios(leer(p)))) malos.push(p);
  const html = leer(join(APP, 'index.html'));
  if (/\sstyle\s*=/.test(html)) malos.push('index.html: style=');
  if (/\son[a-z]+\s*=/.test(html)) malos.push('index.html: on…=');
  if (/<script(?![^>]*\bsrc=)[^>]*>/.test(html)) malos.push('index.html: <script> en línea');
  assert.deepEqual(malos, []);
});

test('index.html declara la CSP estricta de corte-1.md §1.8, sin «unsafe»', () => {
  const html = leer(join(APP, 'index.html'));
  const m = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(html);
  assert.ok(m, 'index.html no tiene la meta Content-Security-Policy');
  assert.equal(m[1], CSP);
  assert.ok(!/unsafe/.test(html), 'la página no puede pedir unsafe-inline ni unsafe-eval');
  assert.match(html, /<script type="module" src="\.\/entrada\.js"><\/script>/);
  assert.match(html, /<div id="app">/);
});

test('ningún nombre de empresa de la lista negra en los textos de app/i18n', () => {
  for (const p of archivosApp(['.json'], join(APP, 'i18n'))) {
    const vistas = buscarMarcas(leer(p));
    assert.deepEqual(vistas, [], `${p.slice(APP.length + 1)} nombra a: ${vistas.join(', ')}`);
  }
});

test('ningún nombre de empresa de la lista negra en el código, el HTML, los estilos ni la PWA de app/', () => {
  const malos: string[] = [];
  // las pruebas quedan afuera: tienen que nombrar la lista para buscarla
  for (const p of archivosApp(['.ts', '.mjs', '.js', '.html', '.css', '.webmanifest', '.svg']).filter((x) => !x.includes('/pruebas/'))) {
    const vistas = buscarMarcas(leer(p));
    if (vistas.length) malos.push(`${p.slice(APP.length + 1)}: ${vistas.join(', ')}`);
  }
  assert.deepEqual(malos, []);
});

test('la búsqueda de marcas funciona (control)', () => {
  assert.deepEqual(buscarMarcas('un envío de Mercado  Libre y otro de DHL'), ['Mercado Libre', 'DHL']);
  assert.deepEqual(buscarMarcas('la persona toca la oca; ups, perdón'), []);
});
