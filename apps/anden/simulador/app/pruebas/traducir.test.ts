// app/pruebas/traducir.test.ts · P8 · diccionarios y traductor: mismas claves app.* en es y en, con las mismas variables; juntar los
// textos de todos los paquetes sin pisarse; interpolación con formato; claves faltantes a la vista.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearTraductor, interpolar, juntarDiccionarios, variablesDe } from '../i18n/traducir.ts';
import { diccionariosDeTodos, PARTES, TEXTOS_APP } from '../i18n/diccionarios.ts';
import { crearFormato } from '../i18n/formato.ts';

test('textos de la interfaz: las mismas claves app.* en español y en inglés', () => {
  const es = Object.keys(TEXTOS_APP.es).sort(), en = Object.keys(TEXTOS_APP.en).sort();
  const soloEs = es.filter((k) => !(k in TEXTOS_APP.en)), soloEn = en.filter((k) => !(k in TEXTOS_APP.es));
  assert.deepEqual(soloEs, [], `claves que están en español y faltan en inglés: ${soloEs.join(', ')}`);
  assert.deepEqual(soloEn, [], `claves que están en inglés y faltan en español: ${soloEn.join(', ')}`);
  assert.ok(es.length > 300, `se esperaban más de 300 claves y hay ${es.length}`);
  for (const k of es) assert.ok(k.startsWith('app.'), `la clave «${k}» no lleva el prefijo app.`);
});

test('textos de la interfaz: cada clave tiene las mismas variables en los dos idiomas y ningún texto vacío', () => {
  for (const k of Object.keys(TEXTOS_APP.es)) {
    const ve = variablesDe(TEXTOS_APP.es[k]).sort(), vi = variablesDe(TEXTOS_APP.en[k]).sort();
    assert.deepEqual(vi, ve, `«${k}»: en español usa {${ve.join('}, {')}} y en inglés {${vi.join('}, {')}}`);
    assert.ok(TEXTOS_APP.es[k].trim() && TEXTOS_APP.en[k].trim(), `«${k}» tiene un texto vacío`);
  }
});

test('juntar los textos de todos los paquetes: sin claves repetidas y cada una con su prefijo', () => {
  const d = diccionariosDeTodos();
  for (const idioma of ['es', 'en'] as const) {
    const total = PARTES[idioma].reduce((a, p) => a + Object.keys(p.textos).length, 0);
    assert.equal(Object.keys(d[idioma]).length, total, `${idioma}: se juntaron ${Object.keys(d[idioma]).length} claves de ${total}`);
  }
  for (const p of PARTES.es) assert.ok(Object.keys(p.textos).length > 0, `los textos de ${p.paquete} están vacíos`);
});

test('juntarDiccionarios lanza con una clave en dos paquetes, con un prefijo ajeno o con un texto que no es cadena', () => {
  assert.throws(() => juntarDiccionarios([{ paquete: 'a', prefijo: 'a.', textos: { 'a.x': '1' } }, { paquete: 'b', prefijo: 'a.', textos: { 'a.x': '2' } }]),
    /está en a y en b/);
  assert.throws(() => juntarDiccionarios([{ paquete: 'app', prefijo: 'app.', textos: { 'escena.x': 'y' } }]), /no empieza con «app\.»/);
  assert.throws(() => juntarDiccionarios([{ paquete: 'app', prefijo: 'app.', textos: { 'app.x': 3 as unknown as string } }]), /tiene que ser una cadena/);
});

test('interpolar: variables de texto tal cual, números con el formato del idioma, faltantes a la vista', () => {
  const es = crearFormato('es');
  const faltan: string[] = [];
  assert.equal(interpolar('Noche {n} de {N} · {criterio}', { n: 37, N: 100, criterio: 'hora de fin' }, es), 'Noche 37 de 100 · hora de fin');
  assert.equal(interpolar('{x} paquetes', { x: 24000 }, es), '24.000 paquetes');
  assert.equal(interpolar('{x}', { x: 2.4 }, crearFormato('en')), '2.4');
  assert.equal(interpolar('Hola {nombre}', {}, es, (n) => faltan.push(n)), 'Hola {nombre}');
  assert.deepEqual(faltan, ['nombre']);
  assert.equal(interpolar('<script>{t}</script>', { t: '<b>' }, es), '<script><b></script>', 'interpolar no escapa ni interpreta: el DOM lo pone como texto');
});

test('traductor: idioma pedido, respaldo en el otro y clave faltante entre ⟦ ⟧ anotada', () => {
  const f = crearFormato('en');
  const t = crearTraductor({ es: { 'app.a': 'Hola {n}', 'app.b': 'Solo español' }, en: { 'app.a': 'Hi {n}' } }, 'en', f);
  assert.equal(t.t('app.a', { n: 1234 }), 'Hi 1,234');
  assert.equal(t.t('app.b'), 'Solo español');
  assert.equal(t.t('app.c'), '⟦app.c⟧');
  assert.equal(t.t('app.a'), 'Hi {n}');
  assert.deepEqual(t.faltantes(), ['en:app.a{n}', 'en:app.b', 'en:app.c']);
  assert.equal(t.tiene('app.a'), true);
  assert.equal(t.tiene('app.b'), false);
  assert.equal(t.idioma, 'en');
});

test('traductor con los diccionarios reales: una clave de cada paquete', () => {
  const d = diccionariosDeTodos(), f = crearFormato('es');
  const t = crearTraductor(d, 'es', f);
  assert.equal(t.t('app.noche.etiqueta.mediana', { n: 37, N: 100, criterio: t.t('app.kpi.finClasificacionMin') }), 'Noche 37 de 100 · la mediana por hora de fin');
  for (const k of ['escena.riesgo.titulo', 'explicacion.formulario.listo', 'experimentos.semaforo.ok', 'modelo.enlace.bomba']) {
    assert.ok(t.tiene(k), `falta la clave «${k}» del diccionario junto`);
  }
  assert.deepEqual(t.faltantes(), []);
});
