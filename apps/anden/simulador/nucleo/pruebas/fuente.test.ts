// Fuente de azar por dirección (corte-1.md §6.6): rango de uniforme, dorados, disposición de clave y contador, orden indiferente.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearFuenteAzar, UNIFORME_MAX } from '../azar/fuente.ts';
import { claveDe } from '../azar/clave.ts';
import { philox4x32_10 } from '../azar/philox.ts';
import { crearFuenteAzarReferencia } from '../../contratos/referencia/motor-referencia.ts';
import type { Direccion } from '../../contratos/azar.ts';

test('uniforme() siempre en (0, 1): 1.000.000 de sorteos en direcciones e índices variados', () => {
  const f = crearFuenteAzar(20261017, 5);
  const d: Direccion = { clave: claveDe('prueba', 'rango'), a: 0, b: 0, c: 0 };
  let min = 1, max = 0, fuera = 0;
  for (let n = 0; n < 1_000_000; n++) {
    d.a = n >>> 3; d.b = n % 977; d.c = n % 5;
    const u = f.uniforme(d, n & 7);
    if (!(u > 0 && u < 1)) fuera++;
    if (u < min) min = u;
    if (u > max) max = u;
  }
  assert.equal(fuera, 0, `se esperaban 0 uniformes fuera de (0, 1) y hubo ${fuera} (mín ${min}, máx ${max})`);
  // Los extremos teóricos son 2^-54 y 1 − 2^-54 (aprox.); con 10^6 sorteos tienen que acercarse a 0 y a 1.
  assert.ok(min < 1e-5 && max > 1 - 1e-5, `rango observado sospechoso: [${min}, ${max}]`);
});

test('valores dorados de una dirección fija (semilla 20261017, réplica 3, hub.sorter/lectura, a 7, b 11, c 1)', () => {
  const f = crearFuenteAzar(20261017, 3);
  const d: Direccion = { clave: claveDe('hub.sorter', 'lectura'), a: 7, b: 11, c: 1 };
  assert.equal(d.clave, 0x796fe3bc, `claveDe('hub.sorter', 'lectura'): se esperaba 796fe3bc y salió ${d.clave.toString(16)}`);
  const dorados = [0.19035872536741966, 0.5495133338650409, 0.14533974482448236, 0.9562260601925281,
    0.02677599965870009, 0.578191463376253, 0.3173158766031314, 0.7351883956486993];
  for (let i = 0; i < dorados.length; i++) {
    assert.equal(f.uniforme(d, i), dorados[i], `uniforme(d, ${i}): se esperaba ${dorados[i]} y salió ${f.uniforme(d, i)}`);
  }
  const o = new Uint32Array(4), hex = () => Array.from(o, (x) => x.toString(16).padStart(8, '0')).join(' ');
  f.bloque(d, 0, o); assert.equal(hex(), '30bb597f 9fb0c4c3 8cace7f7 2d548a48');
  f.bloque(d, 3, o); assert.equal(hex(), '513b9d19 04189e53 bc354e8e 1dadd158');
});

test('disposición exacta: clave (semilla, d.clave), contador (réplica, a, b, (c & 0xffffff)·256 + sub), par → (x0, x1), impar → (x2, x3)', () => {
  const semilla = 0xdeadbeef, replica = 0x12345678;
  const f = crearFuenteAzar(semilla, replica);
  const o = new Uint32Array(4);
  const aUniforme = (hi: number, lo: number) => ((hi >>> 5) * 67108864 + (lo >>> 6) + 0.5) / 9007199254740992;
  for (let n = 0; n < 2000; n++) {
    const d: Direccion = { clave: Math.imul(n, 0x9e3779b1) >>> 0, a: (n * 7919) >>> 0, b: n % 13, c: (n * 31) % 0xffffff };
    const i = n % (UNIFORME_MAX + 1);
    philox4x32_10(replica, d.a, d.b, (d.c * 256 + (i >> 1)) >>> 0, semilla, d.clave, o);
    const esperado = (i & 1) === 0 ? aUniforme(o[0], o[1]) : aUniforme(o[2], o[3]);
    assert.equal(f.uniforme(d, i), esperado, `uniforme(${JSON.stringify(d)}, ${i})`);
  }
  // c se toma módulo 2^24 (el contrato fija c ≤ 2^24 − 1).
  const d1: Direccion = { clave: 1, a: 2, b: 3, c: 5 }, d2: Direccion = { clave: 1, a: 2, b: 3, c: 16777216 + 5 };
  assert.equal(f.uniforme(d1, 3), f.uniforme(d2, 3));
});

test('la fuente coincide con la referencia: 200.000 uniformes y bloques en direcciones al azar', () => {
  const f = crearFuenteAzar(42, 9), g = crearFuenteAzarReferencia(42, 9);
  const a = new Uint32Array(4), b = new Uint32Array(4);
  let distintos = 0;
  for (let n = 0; n < 200_000; n++) {
    const d: Direccion = { clave: Math.imul(n, 0x85ebca6b) >>> 0, a: n % 1000, b: (n * 17) % 4096, c: n % 3 };
    const i = (n * 13) % 64;
    if (f.uniforme(d, i) !== g.uniforme(d, i)) distintos++;
    if (n % 10 === 0) { f.bloque(d, n % 300, a); g.bloque(d, n % 300, b); for (let j = 0; j < 4; j++) if (a[j] !== b[j]) distintos++; }
  }
  assert.equal(distintos, 0, `se esperaban 0 diferencias con la referencia y hubo ${distintos}`);
});

test('el orden en que se piden los sorteos no cambia ningún valor (azar por dirección, caché del bloque invisible)', () => {
  const pedidos: [Direccion, number][] = [];
  for (let n = 0; n < 5000; n++) pedidos.push([{ clave: n % 7, a: n % 11, b: n % 5, c: n % 2 }, n % 6]);
  const f1 = crearFuenteAzar(1, 1), en1 = pedidos.map(([d, i]) => f1.uniforme(d, i));
  // Otro orden (mezclado de forma fija) en otra fuente con la misma semilla.
  const orden = pedidos.map((_, k) => k).sort((x, y) => (Math.imul(x, 0x9e3779b1) >>> 0) - (Math.imul(y, 0x9e3779b1) >>> 0));
  const f2 = crearFuenteAzar(1, 1), en2 = new Array<number>(pedidos.length);
  for (const k of orden) en2[k] = f2.uniforme(pedidos[k][0], pedidos[k][1]);
  assert.deepEqual(en2, en1);
  // Mutar el mismo objeto Direccion entre llamadas (lo que hacen los bloques para no reservar memoria) tampoco cambia nada.
  const d: Direccion = { clave: 0, a: 0, b: 0, c: 0 }, f3 = crearFuenteAzar(1, 1);
  const en3 = pedidos.map(([p, i]) => { d.clave = p.clave; d.a = p.a; d.b = p.b; d.c = p.c; return f3.uniforme(d, i); });
  assert.deepEqual(en3, en1);
});

test('otra semilla u otra réplica → otros uniformes; misma → los mismos', () => {
  const d: Direccion = { clave: 3, a: 1, b: 2, c: 0 };
  assert.equal(crearFuenteAzar(7, 1).uniforme(d), crearFuenteAzar(7, 1).uniforme(d));
  assert.notEqual(crearFuenteAzar(7, 1).uniforme(d), crearFuenteAzar(7, 2).uniforme(d));
  assert.notEqual(crearFuenteAzar(7, 1).uniforme(d), crearFuenteAzar(8, 1).uniforme(d));
});

test('errores claros: índice fuera de [0, 511], semilla o réplica que no son uint32', () => {
  const f = crearFuenteAzar(1, 1);
  const d: Direccion = { clave: 1, a: 0, b: 0, c: 0 };
  assert.throws(() => f.uniforme(d, 512), /se esperaba un índice entero entre 0 y 511 y se recibió 512/);
  assert.throws(() => f.uniforme(d, -1), RangeError);
  assert.throws(() => f.uniforme(d, 1.5), RangeError);
  assert.throws(() => crearFuenteAzar(-1, 0), /se esperaba la semilla entero entre 0 y 4\.294\.967\.295/);
  assert.throws(() => crearFuenteAzar(0, 4294967296), /la réplica/);
  assert.throws(() => crearFuenteAzar(0.5, 0), RangeError);
  assert.equal(f.uniforme(d, UNIFORME_MAX) > 0, true, 'el índice 511 es válido');
});
