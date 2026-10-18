// Philox4x32-10 del núcleo: vectores oficiales de Random123 y coincidencia con la referencia de contratos/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { philox4x32_10 } from '../azar/philox.ts';
import { philox4x32_10 as philoxReferencia } from '../../contratos/referencia/motor-referencia.ts';

const hex = (o: Uint32Array) => Array.from(o, (x) => x.toString(16).padStart(8, '0')).join(' ');

test('Philox4x32-10 reproduce los 3 vectores de Random123 (tests/kat_vectors)', () => {
  const o = new Uint32Array(4);
  const vectores: [number[], number[], string][] = [
    [[0, 0, 0, 0], [0, 0], '6627e8d5 e169c58d bc57ac4c 9b00dbd8'],
    [[0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff], [0xffffffff, 0xffffffff], '408f276d 41c83b0e a20bc7c6 6d5451fd'],
    [[0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344], [0xa4093822, 0x299f31d0], 'd16cfe09 94fdcceb 5001e420 24126ea1'],
  ];
  for (const [c, k, esperado] of vectores) {
    philox4x32_10(c[0], c[1], c[2], c[3], k[0], k[1], o);
    assert.equal(hex(o), esperado, `contador ${c.map((x) => x.toString(16)).join(',')}: se esperaba ${esperado} y salió ${hex(o)}`);
  }
});

test('Philox4x32-10 coincide con la referencia en 200.000 contadores y claves', () => {
  const a = new Uint32Array(4), b = new Uint32Array(4);
  let distintos = 0, primero = '';
  for (let i = 0; i < 200_000; i++) {
    // Entradas variadas y deterministas (incluye valores con el bit alto prendido).
    const c0 = Math.imul(i, 0x9e3779b1) >>> 0, c1 = Math.imul(i ^ 0x5bd1e995, 0x85ebca77) >>> 0;
    const c2 = (i * 2654435761) >>> 0, c3 = ~i >>> 0, k0 = Math.imul(i, 0xc2b2ae35) >>> 0, k1 = (i << 7) >>> 0;
    philox4x32_10(c0, c1, c2, c3, k0, k1, a);
    philoxReferencia(c0, c1, c2, c3, k0, k1, b);
    if (hex(a) !== hex(b)) { distintos++; if (!primero) primero = `${i}: núcleo ${hex(a)} · referencia ${hex(b)}`; }
  }
  assert.equal(distintos, 0, `se esperaba 0 bloques distintos y hubo ${distintos} (primero: ${primero})`);
});

test('Philox interpreta las entradas como uint32 (negativos y mayores que 2^32 − 1), igual que la referencia', () => {
  const a = new Uint32Array(4), b = new Uint32Array(4);
  philox4x32_10(-1, -2, 4294967301, 7, -3, 0x1_0000_0001, a);
  philox4x32_10(0xffffffff, 0xfffffffe, 5, 7, 0xfffffffd, 1, b);
  assert.equal(hex(a), hex(b));
});
