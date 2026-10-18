// pruebas/parches.test.ts · P3 · JSON Pointer (RFC 6901) y JSON Patch (RFC 6902): add, remove, replace y test, sin tocar el original.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aplicarParche, aplicarParcheJson, ErrorParche, esPunteroValido, escaparToken, leerPuntero, tokensDe, punteroDe, igualJson } from '../parches.ts';
import type { OpParche } from '../../contratos/modelo.ts';
import { congelar, ejemploModelo } from './ayudas.ts';

const parche = (ops: unknown[]) => ops as OpParche[];

test('add: miembro de objeto, elemento de lista en un índice y al final con «-» (RFC 6902, A.1 y A.2)', () => {
  assert.deepEqual(aplicarParcheJson({ foo: 'bar' }, parche([{ op: 'add', path: '/baz', value: 'qux' }])), { foo: 'bar', baz: 'qux' });
  assert.deepEqual(aplicarParcheJson({ foo: ['bar', 'baz'] }, parche([{ op: 'add', path: '/foo/1', value: 'qux' }])), { foo: ['bar', 'qux', 'baz'] });
  assert.deepEqual(aplicarParcheJson({ foo: ['bar'] }, parche([{ op: 'add', path: '/foo/-', value: 'c' }])), { foo: ['bar', 'c'] });
  assert.deepEqual(aplicarParcheJson({ foo: ['bar'] }, parche([{ op: 'add', path: '/foo/1', value: 'c' }])), { foo: ['bar', 'c'] }, 'un índice igual al largo agrega al final');
  assert.deepEqual(aplicarParcheJson({ foo: 'bar' }, parche([{ op: 'add', path: '/foo', value: 'otro' }])), { foo: 'otro' }, 'add sobre un miembro existente lo reemplaza');
  assert.deepEqual(aplicarParcheJson({ a: 1 }, parche([{ op: 'add', path: '/b', value: { c: [1, 2] } }])), { a: 1, b: { c: [1, 2] } });
});

test('remove: miembro de objeto y elemento de lista (RFC 6902, A.3 y A.4)', () => {
  assert.deepEqual(aplicarParcheJson({ baz: 'qux', foo: 'bar' }, parche([{ op: 'remove', path: '/baz' }])), { foo: 'bar' });
  assert.deepEqual(aplicarParcheJson({ foo: ['bar', 'qux', 'baz'] }, parche([{ op: 'remove', path: '/foo/1' }])), { foo: ['bar', 'baz'] });
});

test('replace: valor de un miembro y de un elemento (RFC 6902, A.5)', () => {
  assert.deepEqual(aplicarParcheJson({ baz: 'qux', foo: 'bar' }, parche([{ op: 'replace', path: '/baz', value: 'boo' }])), { baz: 'boo', foo: 'bar' });
  assert.deepEqual(aplicarParcheJson({ a: [1, 2, 3] }, parche([{ op: 'replace', path: '/a/2', value: 9 }])), { a: [1, 2, 9] });
});

test('test: un test que pasa deja el documento igual; uno que falla lanza diciendo qué se esperaba y qué había (A.8 y A.9)', () => {
  assert.deepEqual(aplicarParcheJson({ baz: 'qux', foo: ['a', 2, 'c'] }, parche([{ op: 'test', path: '/baz', value: 'qux' }, { op: 'test', path: '/foo/1', value: 2 }])), { baz: 'qux', foo: ['a', 2, 'c'] });
  assert.throws(
    () => aplicarParcheJson({ baz: 'qux' }, parche([{ op: 'test', path: '/baz', value: 'bar' }])),
    (e: Error) => e instanceof ErrorParche && e.operacion === 0 && /operación 0 \(test "\/baz"\)/.test(e.message) && /se esperaba "bar" y hay "qux"/.test(e.message),
  );
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'test', path: '/b', value: 1 }])), /el test falló: no existe \/b/);
  assert.throws(() => aplicarParcheJson({ a: [1, 2] }, parche([{ op: 'test', path: '/a', value: [1, 3] }])), /el test falló/);
  assert.deepEqual(aplicarParcheJson({ a: { x: 1, y: [1, { z: null }] } }, parche([{ op: 'test', path: '/a', value: { y: [1, { z: null }], x: 1 } }])), { a: { x: 1, y: [1, { z: null }] } }, 'el test compara objetos sin importar el orden de claves');
});

test('un test que falla a mitad del parche lo anula entero y nombra la operación', () => {
  const doc = { a: 1, b: 2 };
  assert.throws(
    () => aplicarParcheJson(doc, parche([{ op: 'replace', path: '/a', value: 10 }, { op: 'test', path: '/b', value: 99 }, { op: 'replace', path: '/b', value: 20 }])),
    (e: Error) => e instanceof ErrorParche && e.operacion === 1,
  );
  assert.deepEqual(doc, { a: 1, b: 2 }, 'el original queda intacto');
});

test('escapes de JSON Pointer: «~0» es «~» y «~1» es «/» (RFC 6901 y RFC 6902 A.14)', () => {
  const doc = { '/': 9, '~1': 10, 'a~b': 1, 'c/d': 2 };
  assert.deepEqual(aplicarParcheJson(doc, parche([{ op: 'test', path: '/~01', value: 10 }])), doc);
  assert.deepEqual(aplicarParcheJson(doc, parche([{ op: 'test', path: '/~1', value: 9 }])), doc);
  assert.deepEqual(aplicarParcheJson(doc, parche([{ op: 'replace', path: '/a~0b', value: 7 }])), { '/': 9, '~1': 10, 'a~b': 7, 'c/d': 2 });
  assert.deepEqual(aplicarParcheJson(doc, parche([{ op: 'remove', path: '/c~1d' }])), { '/': 9, '~1': 10, 'a~b': 1 });
  assert.equal(escaparToken('a/b~c'), 'a~1b~0c');
  assert.deepEqual(tokensDe('/a~1b/c~0d/'), ['a/b', 'c~d', '']);
  assert.equal(punteroDe(['hub', 'a/b', 0]), '/hub/a~1b/0');
  // En el modelo real: las claves de «procedencia» son punteros y llevan barras.
  const m = ejemploModelo();
  const r = aplicarParche(m, parche([{ op: 'replace', path: '/procedencia/~1hub~1rampas/etiqueta', value: 'MEDIDO' }]));
  assert.equal(r.procedencia!['/hub/rampas'].etiqueta, 'MEDIDO');
  assert.equal(m.procedencia!['/hub/rampas'].etiqueta, 'SUPUESTO');
});

test('«~» mal escapado y punteros sin barra inicial se rechazan', () => {
  for (const p of ['a', 'a/b', '/a~', '/a~2', '/a~b']) {
    assert.equal(esPunteroValido(p), false, `«${p}» no es un puntero válido`);
    assert.throws(() => tokensDe(p), /puntero inválido/);
  }
  for (const p of ['', '/', '/a', '/a/b', '/~0', '/~1']) assert.equal(esPunteroValido(p), true, `«${p}» es un puntero válido`);
  assert.throws(() => aplicarParcheJson({}, parche([{ op: 'add', path: 'sin-barra', value: 1 }])), /puntero inválido/);
});

test('el original queda intacto, también si está congelado; el resultado no comparte estructura con el valor del parche', () => {
  const m = congelar(ejemploModelo());
  const antes = JSON.stringify(m);
  const valor = { tipo: 'fija', valor: 5 };
  const r = aplicarParche(m, parche([
    { op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 },
    { op: 'add', path: '/escenarios/-', value: { id: 'nuevo', titulo: 'Nuevo', parche: [] } },
    { op: 'replace', path: '/parametros/ritmoDescarga/valor', value: valor },
    { op: 'remove', path: '/escenarios/0' },
  ]));
  assert.equal(JSON.stringify(m), antes, 'el modelo original cambió');
  assert.equal(r.personas.induccion.puestosActivos, 4);
  assert.equal(r.escenarios!.length, 5);
  assert.equal(r.escenarios![0].id, 'mas-un-puesto');
  assert.equal(r.escenarios![4].id, 'nuevo');
  valor.valor = 99;
  assert.deepEqual(r.parametros.ritmoDescarga.valor, { tipo: 'fija', valor: 5 }, 'el valor del parche se copia, no se comparte');
});

test('reemplazar la raíz con path vacío; no se puede quitar la raíz', () => {
  assert.deepEqual(aplicarParcheJson({ a: 1 }, parche([{ op: 'replace', path: '', value: { b: 2 } }])), { b: 2 });
  assert.deepEqual(aplicarParcheJson({ a: 1 }, parche([{ op: 'add', path: '', value: [1] }])), [1]);
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'remove', path: '' }])), /no se puede quitar la raíz/);
  assert.deepEqual(aplicarParcheJson({ a: 1 }, parche([{ op: 'test', path: '', value: { a: 1 } }])), { a: 1 });
});

test('errores con detalle: contenedor inexistente, índice fuera de rango, miembro que no existe', () => {
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'add', path: '/x/y', value: 1 }])), /no existe el contenedor \/x/);
  assert.throws(() => aplicarParcheJson({ a: [1] }, parche([{ op: 'add', path: '/a/5', value: 1 }])), /se esperaba un índice entre 0 y 1 \(o «-»\) y llegó «5»/);
  assert.throws(() => aplicarParcheJson({ a: [1] }, parche([{ op: 'remove', path: '/a/1' }])), /se esperaba un índice existente entre 0 y 0 y llegó «1»/);
  assert.throws(() => aplicarParcheJson({ a: [1] }, parche([{ op: 'replace', path: '/a/-', value: 1 }])), /índice existente/);
  assert.throws(() => aplicarParcheJson({ a: [1] }, parche([{ op: 'add', path: '/a/01', value: 1 }])), /índice entre 0 y 1/);
  assert.throws(() => aplicarParcheJson({ a: [1] }, parche([{ op: 'add', path: '/a/-1', value: 1 }])), /índice entre 0 y 1/);
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'remove', path: '/b' }])), /no existe \/b/);
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'replace', path: '/b', value: 1 }])), /no existe \/b/);
  assert.throws(() => aplicarParcheJson({ a: 5 }, parche([{ op: 'add', path: '/a/b', value: 1 }])), /no es un objeto ni una lista/);
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'add', path: '/b' }])), /falta «value»/);
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'mover', path: '/b', value: 1 }])), /operación desconocida: se esperaba add, remove, replace o test/);
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'replace', value: 1 }])), /se esperaba «path» de texto/);
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([null])), /no es un objeto/);
  assert.throws(() => aplicarParcheJson({ a: 1 }, 'x' as unknown as OpParche[]), /se esperaba una lista de operaciones/);
});

test('claves prohibidas: __proto__, constructor y prototype no se tocan ni se leen, y el prototipo de Object no se contamina', () => {
  for (const clave of ['__proto__', 'constructor', 'prototype']) {
    assert.throws(() => aplicarParcheJson({}, parche([{ op: 'add', path: `/${clave}`, value: { polluted: true } }])), new RegExp(`la clave «${clave}» está prohibida`));
    assert.throws(() => aplicarParcheJson({}, parche([{ op: 'add', path: `/${clave}/polluted`, value: true }])), /prohibida/);
    assert.throws(() => aplicarParcheJson({ a: {} }, parche([{ op: 'test', path: `/a/${clave}`, value: 1 }])), /prohibida/);
  }
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted'), false);
  // Un valor que trae __proto__ como propiedad propia (JSON.parse) tampoco pasa a la copia.
  const valor = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.throws(() => aplicarParcheJson({}, parche([{ op: 'add', path: '/x', value: valor }])), /prohibida/);
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
});

test('no se leen propiedades heredadas: «toString», «hasOwnProperty» y «length» no existen', () => {
  assert.equal(leerPuntero({ a: 1 }, '/toString').ok, false);
  assert.equal(leerPuntero({ a: 1 }, '/hasOwnProperty').ok, false);
  assert.equal(leerPuntero([1, 2], '/length').ok, false);
  assert.equal(leerPuntero({ a: [10, 20] }, '/a/1').ok, true);
  assert.deepEqual(leerPuntero({ a: [10, 20] }, '/a/1'), { ok: true, valor: 20 });
  assert.throws(() => aplicarParcheJson({ a: 1 }, parche([{ op: 'test', path: '/toString', value: 1 }])), /no existe/);
});

test('un parche vacío devuelve una copia igual; las operaciones se aplican en orden', () => {
  const doc = { a: [1, 2, 3] };
  const r = aplicarParcheJson(doc, []);
  assert.deepEqual(r, doc);
  assert.notEqual(r, doc);
  assert.deepEqual(aplicarParcheJson(doc, parche([{ op: 'add', path: '/a/-', value: 4 }, { op: 'remove', path: '/a/0' }, { op: 'replace', path: '/a/0', value: 'dos' }])), { a: ['dos', 3, 4] });
});

test('igualJson distingue tipos y orden de listas, no de claves', () => {
  assert.equal(igualJson(1, '1'), false);
  assert.equal(igualJson(null, 0), false);
  assert.equal(igualJson([1, 2], [2, 1]), false);
  assert.equal(igualJson({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
  assert.equal(igualJson({ a: 1 }, { a: 1, b: undefined }), true);
  assert.equal(igualJson({ a: undefined }, { b: undefined }), true);
  assert.equal(igualJson([], {}), false);
  assert.equal(igualJson({}, []), false);
});
