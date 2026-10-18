// pruebas/textos.test.ts · P3 · Los textos de los diagnósticos y del enlace: mismas claves en es y en, mismas variables,
// ninguna clave que el compilador pueda emitir sin texto, ningún texto que nadie emite, y ningún nombre de empresa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compilar } from '../compilar.ts';
import { CONTROLES } from '../chequeos.ts';
import { claveDiag } from '../esquema.ts';
import type { Diagnostico } from '../../contratos/modelo.ts';
import type { ErrorEnlace } from '../../contratos/escena.ts';
import { CASOS } from './mutaciones.ts';
import { ejemploJson, variablesDe } from './ayudas.ts';

const leer = (n: string): Record<string, string> => JSON.parse(readFileSync(new URL(`../${n}`, import.meta.url), 'utf8'));
const ES = leer('textos.es.json');
const EN = leer('textos.en.json');

/** Claves que existen como respaldo (el texto genérico de cada código) o por precaución, y que ningún caso emite hoy. */
const RESERVADAS = new Set([
  'modelo.diag.E-ESQUEMA', 'modelo.diag.E-REF', 'modelo.diag.E-RANGO', 'modelo.diag.E-HORAS', 'modelo.diag.E-RAMPA-SIN-PERSONA',
  'modelo.diag.E-PRESUPUESTO', 'modelo.diag.A-RHO', 'modelo.diag.E-ESCENARIO', 'modelo.diag.E-DECISION',
  'modelo.diag.E-ESQUEMA.formato',
]);

test('es y en tienen exactamente las mismas claves, todas con prefijo «modelo.» y con texto', () => {
  const ke = Object.keys(ES).sort(), kn = Object.keys(EN).sort();
  assert.deepEqual(kn.filter((k) => !(k in ES)), [], 'claves que están en en y faltan en es');
  assert.deepEqual(ke.filter((k) => !(k in EN)), [], 'claves que están en es y faltan en en');
  for (const k of ke) {
    assert.ok(k.startsWith('modelo.'), `la clave «${k}» no empieza con «modelo.»`);
    assert.ok(typeof ES[k] === 'string' && ES[k].trim().length > 0, `el texto en español de «${k}» está vacío`);
    assert.ok(typeof EN[k] === 'string' && EN[k].trim().length > 0, `el texto en inglés de «${k}» está vacío`);
  }
});

test('las mismas variables {nombre} en es y en, para cada clave', () => {
  for (const k of Object.keys(ES)) {
    assert.deepEqual(variablesDe(EN[k]), variablesDe(ES[k]), `«${k}»: variables distintas entre es (${ES[k]}) y en (${EN[k]})`);
  }
});

test('ningún texto lleva HTML ni llaves sueltas que se confundan con variables', () => {
  for (const [k, t] of [...Object.entries(ES), ...Object.entries(EN)]) {
    assert.ok(!/[<>]/.test(t), `«${k}» tiene < o >: los textos de interfaz se ponen con textContent y no llevan HTML`);
    const sinVars = t.replace(/\{[A-Za-z0-9_]+\}/g, '');
    assert.ok(!/[{}]/.test(sinVars), `«${k}» tiene llaves que no son una variable: ${t}`);
  }
});

test('los diagnósticos en español son oraciones: empiezan con mayúscula, «{» o ««» y terminan en punto', () => {
  for (const k of Object.keys(ES).filter((x) => x.startsWith('modelo.diag.') || x.startsWith('modelo.enlace.'))) {
    const t = ES[k];
    assert.match(t, /^[A-ZÁÉÍÓÚÑ{«]/, `«${k}» no empieza con mayúscula: ${t}`);
    assert.match(t, /[.?]$/, `«${k}» no termina en punto: ${t}`);
  }
});

test('toda clave que emite el compilador tiene texto en es y en, y usa solo variables que el diagnóstico trae', async () => {
  const emitidas = new Map<string, Diagnostico[]>();
  const anotar = (ds: readonly Diagnostico[]) => { for (const d of ds) emitidas.set(d.clave, [...(emitidas.get(d.clave) ?? []), d]); };
  for (const c of CASOS) {
    const r = await compilar(c.entrada());
    anotar(r.ok ? r.mv.diagnosticos : r.diagnosticos);
  }
  const limpio = await compilar(ejemploJson());
  assert.ok(limpio.ok);
  anotar(limpio.mv.diagnosticos);
  assert.ok(emitidas.size >= 90, `los casos emiten ${emitidas.size} claves distintas`);
  for (const [clave, ds] of emitidas) {
    assert.ok(clave in ES, `el compilador emite «${clave}» y no tiene texto en español`);
    assert.ok(clave in EN, `el compilador emite «${clave}» y no tiene texto en inglés`);
    for (const v of variablesDe(ES[clave])) {
      for (const d of ds) assert.ok(d.vars && v in d.vars, `«${clave}» usa {${v}} y el diagnóstico en ${d.ruta || '/'} trae solo ${JSON.stringify(d.vars ?? {})}`);
    }
  }
  // Y al revés: ningún texto del diccionario es letra muerta (salvo los de respaldo).
  const muertas = Object.keys(ES).filter((k) => k.startsWith('modelo.diag.') && !emitidas.has(k) && !RESERVADAS.has(k));
  assert.deepEqual(muertas, [], 'textos que ningún caso de mutaciones.ts emite: agregar el caso o quitar el texto');
});

test('cada código del catálogo de controles tiene texto genérico o por caso', () => {
  for (const codigo of CONTROLES) {
    const base = claveDiag(codigo);
    assert.ok(base in ES || Object.keys(ES).some((k) => k.startsWith(base + '.')), `el control ${codigo} no tiene ningún texto`);
  }
  for (const extra of ['I-SUPUESTOS', 'I-CONTROLES']) assert.ok(claveDiag(extra) in ES, `falta ${extra}`);
});

test('los códigos de los diagnósticos con casos tienen además su texto genérico (respaldo para claves nuevas)', () => {
  const conCasos = new Set(Object.keys(ES).filter((k) => k.startsWith('modelo.diag.')).map((k) => k.split('.')[2]).filter((c, _, a) => a.filter((x) => x === c).length > 1));
  for (const codigo of conCasos) assert.ok(claveDiag(codigo) in ES, `${codigo} tiene textos por caso y le falta el genérico «${claveDiag(codigo)}»`);
});

test('los errores del enlace tienen su texto: uno por cada ErrorEnlace del contrato', () => {
  // Si el contrato agrega un error, este Record deja de compilar (tsc) y obliga a agregar su texto.
  const todos: Record<ErrorEnlace, true> = {
    'formato': true, 'muy-largo': true, 'bomba': true, 'json-invalido': true, 'json-profundo': true, 'esquema': true,
    'presupuesto': true, 'plantilla-desconocida': true, 'version-motor': true,
  };
  for (const e of Object.keys(todos)) {
    assert.ok(`modelo.enlace.${e}` in ES, `falta el texto en español de modelo.enlace.${e}`);
    assert.ok(`modelo.enlace.${e}` in EN, `falta el texto en inglés de modelo.enlace.${e}`);
  }
  assert.equal(Object.keys(ES).filter((k) => k.startsWith('modelo.enlace.')).length, Object.keys(todos).length, 'hay textos de errores de enlace que no existen en el contrato');
});

test('hay una etiqueta por cada etapa de F0 y por cada nivel de diagnóstico', () => {
  for (const k of ['etapa.descarga', 'etapa.induccion', 'etapa.sorter', 'etapa.rampas', 'nivel.error', 'nivel.aviso', 'nivel.info']) {
    assert.ok(`modelo.${k}` in ES && `modelo.${k}` in EN, `falta modelo.${k}`);
  }
});

test('lista negra de marcas (corte-1.md §1.7): ningún nombre de empresa en los textos', () => {
  const CS = ['OCA', 'DHL', 'UPS']; // siglas: se buscan en mayúsculas y como palabra
  const CI = ['Andreani', 'Mercado Libre', 'MercadoLibre', 'Correo Argentino', 'FedEx', 'Amazon', 'Loginter', 'Urbano', 'Rappi', 'PedidosYa'];
  for (const [k, t] of [...Object.entries(ES), ...Object.entries(EN)]) {
    for (const n of CI) assert.ok(!t.toLowerCase().includes(n.toLowerCase()), `«${k}» nombra a ${n}`);
    for (const n of CS) assert.ok(!new RegExp(`\\b${n}\\b`).test(t), `«${k}» nombra a ${n}`);
  }
});
