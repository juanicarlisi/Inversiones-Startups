// escena/pruebas/textos.test.ts · P6. Textos de la escena (corte-1.md §1.6 y §1.7): las mismas claves en español y en inglés, todas con
// prefijo `escena.`, las mismas variables en los dos idiomas, toda clave que el código puede emitir existe, y ningún nombre de empresa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CLAVE_ESTADO, claveRiesgo } from '../estilo.ts';
import { DEF_MOMENTO, claveMomento } from '../momentos.ts';
import { CLAVE_CLASE, CLAVE_PERSONA, CLAVE_PUESTO, EstadoPersona, EstadoPuesto, textoEstado } from '../reproductor.ts';
import { ClaseEntidad } from '../../contratos/traza.ts';
import { EstadoVisual } from '../../contratos/vistas.ts';

const leer = (f: string): Record<string, string> => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const ES = leer('textos.es.json'), EN = leer('textos.en.json');
const variables = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

/** Lista negra de §1.7 (las empresas solo pueden aparecer en campos `fuente` de los modelos). */
const MARCAS = ['Andreani', 'Mercado Libre', 'MercadoLibre', 'Correo Argentino', 'OCA', 'DHL', 'FedEx', 'UPS', 'Amazon', 'Loginter', 'Urbano', 'Rappi', 'PedidosYa'];

test('las mismas claves en español y en inglés, todas con prefijo escena. y con texto', () => {
  assert.deepEqual(Object.keys(EN).sort(), Object.keys(ES).sort(), 'textos.es.json y textos.en.json tienen que tener las mismas claves');
  for (const [k, v] of Object.entries(ES)) {
    assert.match(k, /^escena\.[a-zA-Z0-9.]+$/, `clave fuera del prefijo del paquete: ${k}`);
    assert.ok(typeof v === 'string' && v.trim().length > 0, `${k} está vacía en español`);
    assert.ok(typeof EN[k] === 'string' && EN[k].trim().length > 0, `${k} está vacía en inglés`);
  }
});

test('cada clave usa las mismas variables en los dos idiomas', () => {
  for (const k of Object.keys(ES)) assert.deepEqual(variables(EN[k]), variables(ES[k]), `${k}: variables distintas entre es y en`);
});

test('toda clave que el código puede emitir existe', () => {
  const emitidas = [
    ...Object.values(CLAVE_ESTADO),
    ...Object.keys(DEF_MOMENTO).map((t) => claveMomento(Number(t))), claveMomento(-1),
    ...Object.values(EstadoPuesto).map((c) => CLAVE_PUESTO[c]),
    ...Object.values(EstadoPersona).map((c) => CLAVE_PERSONA[c]),
    ...Object.values(ClaseEntidad).map((c) => CLAVE_CLASE[c]),
    ...[0, 0.05, 0.2, 0.5, 0.9].map(claveRiesgo),
    'escena.narracion.instante', 'escena.narracion.lazoDetenido', 'escena.piso.2d', 'escena.piso.iso',
    'escena.riesgo.titulo', 'escena.riesgo.nota', 'escena.riesgo.noche.mediana', 'escena.riesgo.noche.peor', 'escena.riesgo.noche.mejor',
  ];
  for (const k of emitidas) assert.ok(k && k in ES, `el código puede emitir «${k}» y no está en los textos`);
});

test('el texto de cada estado visual trae todas sus variables (el de «esperando», los minutos del umbral)', () => {
  for (const e of Object.values(EstadoVisual)) {
    const { clave, vars } = textoEstado(e);
    assert.ok(clave in ES, `falta ${clave}`);
    for (const v of variables(ES[clave])) assert.ok(v in vars, `${clave}: el texto usa {${v}} y vars trae ${JSON.stringify(vars)}`);
  }
  assert.deepEqual(textoEstado(EstadoVisual.ESPERANDO).vars, { minutos: 5 });
  assert.equal(textoEstado(99).clave, 'escena.estado.normal', 'un código desconocido no rompe');
});

test('ningún nombre de empresa de la lista negra en los textos', () => {
  for (const [idioma, d] of [['es', ES], ['en', EN]] as const) {
    for (const [k, v] of Object.entries(d)) {
      for (const m of MARCAS) {
        const re = new RegExp(`\\b${m.replace(/ /g, '\\s+')}\\b`, 'i');
        assert.ok(!re.test(v), `${idioma} · ${k}: aparece «${m}»`);
      }
    }
  }
});
