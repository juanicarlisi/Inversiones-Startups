// integracion/pruebas/marcas.test.ts · Andén simulador, corte 1 · Integración (corte-1.md §1.7, §10.5 y §12.10).
// Sin nombres de empresas en plantillas, textos ni pantallas. Las empresas solo pueden aparecer en los campos `fuente` (y `url`) de los
// parámetros y la procedencia. Se controla en:
//  1. las plantillas publicadas y las propuestas (todo texto que no sea `fuente` ni `url`);
//  2. los textos de los cinco paquetes (es y en);
//  3. lo que se construye para el navegador (dist/, construido aparte en una carpeta temporal): JavaScript, HTML, CSS, manifiesto y
//     service worker. Como las plantillas viajan enteras dentro del paquete, ahí se exige que no aparezca ningún nombre, ni en `fuente`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLANTILLAS, PROPUESTAS } from '../../hub/indice.ts';
import { construir } from '../construir.mjs';

const RAIZ = resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** La lista negra de §1.7. Los nombres cortos o que son palabras comunes (OCA, UPS, Urbano) se buscan con mayúsculas exactas. */
const LISTA_NEGRA: { nombre: string; re: RegExp }[] = [
  ...['Andreani', 'Mercado Libre', 'MercadoLibre', 'Correo Argentino', 'DHL', 'FedEx', 'Amazon', 'Loginter', 'Rappi', 'PedidosYa']
    .map((nombre) => ({ nombre, re: new RegExp(`(?<![\\p{L}\\p{N}])${nombre.replace(' ', '\\s*')}(?![\\p{L}\\p{N}])`, 'iu') })),
  ...['OCA', 'UPS', 'Urbano'].map((nombre) => ({ nombre, re: new RegExp(`(?<![\\p{L}\\p{N}])${nombre}(?![\\p{L}\\p{N}])`, 'u') })),
];
const marcasEn = (texto: string) => LISTA_NEGRA.filter((x) => x.re.test(texto)).map((x) => x.nombre);

test('marcas · la búsqueda encuentra los nombres y no confunde palabras comunes', () => {
  assert.deepEqual(marcasEn('Un hub de mercadolibre y otro de Correo  Argentino'), ['Mercado Libre', 'MercadoLibre', 'Correo Argentino']);
  assert.deepEqual(marcasEn('La caja coloca la oca; ¡ups!, el transporte urbano'), []);
  assert.deepEqual(marcasEn('Envíos por OCA y UPS desde Urbano'), ['OCA', 'UPS', 'Urbano']);
});

/** Todos los textos de un objeto con su JSON Pointer, salvo los campos `fuente` y `url` (donde se permite citar a una empresa). */
function textos(x: unknown, ruta = ''): [string, string][] {
  if (typeof x === 'string') return [[ruta, x]];
  if (Array.isArray(x)) return x.flatMap((v, i) => textos(v, `${ruta}/${i}`));
  if (x && typeof x === 'object') {
    return Object.entries(x).flatMap(([k, v]) => (k === 'fuente' || k === 'url' ? [] : [[`${ruta}/${k}`, k] as [string, string], ...textos(v, `${ruta}/${k}`)]));
  }
  return [];
}

test('marcas · plantillas publicadas y propuestas: ningún nombre fuera de `fuente` y `url`', () => {
  const malos: string[] = [];
  const registros = { ...PLANTILLAS, ...PROPUESTAS };
  for (const [clave, m] of Object.entries(registros)) {
    for (const [ruta, t] of textos(m)) for (const n of marcasEn(t)) malos.push(`${clave}${ruta}: «${n}»`);
  }
  assert.ok(Object.keys(registros).length >= 2, 'se esperaban al menos las dos plantillas publicadas');
  assert.deepEqual(malos, [], `nombres de empresas en las plantillas:\n${malos.join('\n')}`);
});

test('marcas · textos de los cinco paquetes (es y en): ningún nombre', () => {
  const malos: string[] = [];
  for (const carpeta of ['app/i18n', 'escena', 'explicacion', 'modelo', 'experimentos']) {
    for (const idioma of ['es', 'en']) {
      const dic = JSON.parse(readFileSync(join(RAIZ, carpeta, `textos.${idioma}.json`), 'utf8')) as Record<string, string>;
      for (const [k, t] of Object.entries(dic)) for (const n of marcasEn(`${k} ${t}`)) malos.push(`${carpeta}/textos.${idioma}.json «${k}»: «${n}»`);
    }
  }
  assert.deepEqual(malos, [], `nombres de empresas en los textos:\n${malos.join('\n')}`);
});

test('marcas · lo que se construye para el navegador (dist/): ningún nombre en ningún archivo', async () => {
  const destino = mkdtempSync(join(tmpdir(), 'anden-marcas-'));
  try {
    await construir({ destino });
    const malos: string[] = [];
    let archivos = 0;
    const recorrer = (d: string) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) { recorrer(p); continue; }
        if (n.endsWith('.map')) continue;                       // los mapas llevan el código fuente con sus comentarios: no se sirven al usuario
        archivos++;
        for (const m of marcasEn(readFileSync(p, 'utf8'))) malos.push(`${relative(destino, p)}: «${m}»`);
      }
    };
    recorrer(destino);
    assert.ok(archivos >= 9, `se esperaban al menos 9 archivos construidos y hubo ${archivos}`);
    assert.deepEqual(malos, [], `nombres de empresas en lo construido:\n${malos.join('\n')}`);
  } finally {
    rmSync(destino, { recursive: true, force: true });
  }
});
