// pruebas/canonico.test.ts · P3 · JSON canónico (contratos/escena.ts): claves ordenadas por unidad UTF-16, sin espacios.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jsonCanonico } from '../canonico.ts';
import { Lcg, ejemploJson } from './ayudas.ts';

test('el ejemplo de la especificación: {"b":1,"a":[2,{"d":3,"c":4}]} → {"a":[2,{"c":4,"d":3}],"b":1}', () => {
  assert.equal(jsonCanonico({ b: 1, a: [2, { d: 3, c: 4 }] }), '{"a":[2,{"c":4,"d":3}],"b":1}');
});

test('sin espacios, listas en su orden, escalares con JSON.stringify', () => {
  assert.equal(jsonCanonico(null), 'null');
  assert.equal(jsonCanonico(true), 'true');
  assert.equal(jsonCanonico('a"b\\c\n'), '"a\\"b\\\\c\\n"');
  assert.equal(jsonCanonico([]), '[]');
  assert.equal(jsonCanonico({}), '{}');
  assert.equal(jsonCanonico([3, 1, 2]), '[3,1,2]');
  assert.equal(jsonCanonico({ a: [], b: {} }), '{"a":[],"b":{}}');
});

test('números como JSON.stringify: -0 → 0, 1e21 → 1e+21, 0,1 + 0,2 sin redondear', () => {
  assert.equal(jsonCanonico(-0), '0');
  assert.equal(jsonCanonico(1e21), '1e+21');
  assert.equal(jsonCanonico(1e-7), '1e-7');
  assert.equal(jsonCanonico(0.1 + 0.2), '0.30000000000000004');
  assert.equal(jsonCanonico(123456789012345680000), '123456789012345680000');
  assert.equal(jsonCanonico(2 ** 53), '9007199254740992');
});

test('el orden es por unidad de código UTF-16, no por punto de código ni por idioma', () => {
  // U+1F600 es el par sustituto D83D DE00; U+FF5E es un solo código FF5E: por unidad UTF-16 va primero el emoji.
  assert.equal(jsonCanonico({ '～': 1, '\u{1f600}': 2 }), '{"\u{1f600}":2,"～":1}');
  assert.equal(jsonCanonico({ b: 1, B: 2, a: 3, A: 4, '10': 5, '9': 6, '': 7 }), '{"":7,"10":5,"9":6,"A":4,"B":2,"a":3,"b":1}');
  assert.equal(jsonCanonico({ z: 1, é: 2, e: 3 }), '{"e":3,"z":1,"é":2}');
});

test('las claves que parecen enteros no se reordenan numéricamente (no depende del orden de iteración de V8)', () => {
  const a = jsonCanonico({ 2: 'b', 1: 'a', 10: 'c', x: 'd' });
  const b = jsonCanonico({ x: 'd', 10: 'c', 1: 'a', 2: 'b' });
  assert.equal(a, b);
  assert.equal(a, '{"1":"a","10":"c","2":"b","x":"d"}');
});

test('una propiedad con valor undefined cuenta como ausente; en una lista, es un error', () => {
  assert.equal(jsonCanonico({ a: 1, b: undefined }), '{"a":1}');
  assert.throws(() => jsonCanonico([1, undefined, 3]), /hueco o undefined en \/1/);
});

test('rechaza lo que no tiene representación JSON, diciendo dónde', () => {
  assert.throws(() => jsonCanonico({ a: { b: NaN } }), /número finito en \/a\/b y llegó NaN/);
  assert.throws(() => jsonCanonico([Infinity]), /número finito en \/0 y llegó Infinity/);
  assert.throws(() => jsonCanonico(() => 1), /sin representación JSON \(function\)/);
  assert.throws(() => jsonCanonico(Symbol('x')), /sin representación JSON \(symbol\)/);
  assert.throws(() => jsonCanonico(10n), /sin representación JSON \(bigint\)/);
  assert.throws(() => jsonCanonico(undefined), /sin representación JSON \(undefined\)/);
  assert.throws(() => jsonCanonico(new Date(0)), /objeto plano/);
  assert.throws(() => jsonCanonico(new Map()), /objeto plano/);
  assert.throws(() => jsonCanonico(new (class A { x = 1; })()), /objeto plano/);
});

test('acepta objetos sin prototipo (Object.create(null))', () => {
  const o = Object.create(null) as Record<string, number>;
  o.b = 1; o.a = 2;
  assert.equal(jsonCanonico(o), '{"a":2,"b":1}');
});

test('más de 1.000 niveles lanza un error en lugar de agotar la pila', () => {
  let x: unknown = 1;
  for (let i = 0; i < 1100; i++) x = [x];
  assert.throws(() => jsonCanonico(x), /más de 1000 niveles/);
});

test('el texto canónico del ejemplo es JSON válido, se reparsea al mismo valor y es estable', () => {
  const m = ejemploJson();
  const c = jsonCanonico(m);
  assert.deepEqual(JSON.parse(c), m);
  assert.equal(jsonCanonico(JSON.parse(c)), c, 'canonizar dos veces tiene que dar lo mismo');
  assert.equal(c.length, 12763, 'largo canónico del ejemplo (dorada: si cambia, cambió el ejemplo o el formato)');
});

test('propiedad: para documentos JSON al azar, canónico(x) reparsea a x y no depende del orden de inserción', () => {
  const lcg = new Lcg(20261018);
  const gen = (prof: number): unknown => {
    const t = lcg.hasta(prof > 3 ? 4 : 7);
    switch (t) {
      case 0: return lcg.hasta(2) === 0;
      case 1: return (lcg.hasta(2000) - 1000) / 8;
      case 2: return ['', 'a', 'é', '\u{1f600}', 'x"y', 'línea\n2', '/~'][lcg.hasta(7)];
      case 3: return null;
      case 4: return Array.from({ length: lcg.hasta(4) }, () => gen(prof + 1));
      default: {
        const o: Record<string, unknown> = {};
        for (let i = lcg.hasta(5); i > 0; i--) o[['k', 'b', 'a', '1', '10', '2', 'é', '\u{1f600}', '～'][lcg.hasta(9)]] = gen(prof + 1);
        return o;
      }
    }
  };
  const invertir = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(invertir);
    if (x !== null && typeof x === 'object') {
      const o: Record<string, unknown> = {};
      for (const k of Object.keys(x).reverse()) o[k] = invertir((x as Record<string, unknown>)[k]);
      return o;
    }
    return x;
  };
  for (let i = 0; i < 400; i++) {
    const x = gen(0);
    const c = jsonCanonico(x);
    assert.deepEqual(JSON.parse(c), x, `el canónico no reparsea al mismo valor: ${c}`);
    assert.equal(jsonCanonico(invertir(x)), c, `el orden de inserción cambia el canónico: ${c}`);
  }
});
