// pruebas/huella.test.ts · P3 · SHA-256 del JSON canónico, primeros 16 hex; crypto.subtle y el respaldo propio dan lo mismo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { aHex, huellaModelo, sha256, sha256Propio } from '../huella.ts';
import { jsonCanonico } from '../canonico.ts';
import { Lcg, ejemploModelo } from './ayudas.ts';

const hex = (b: Uint8Array) => aHex(b);
const enc = new TextEncoder();

test('SHA-256 propio: vectores de FIPS 180-4 / NIST', () => {
  assert.equal(hex(sha256Propio(enc.encode(''))), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(hex(sha256Propio(enc.encode('abc'))), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(hex(sha256Propio(enc.encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  assert.equal(hex(sha256Propio(new Uint8Array(1_000_000).fill(0x61))), 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0');
});

test('SHA-256 propio coincide con node:crypto para todos los largos de 0 a 300 y para bloques grandes', () => {
  const lcg = new Lcg(7);
  for (let n = 0; n <= 300; n++) {
    const b = new Uint8Array(n);
    for (let i = 0; i < n; i++) b[i] = lcg.hasta(256);
    assert.equal(hex(sha256Propio(b)), createHash('sha256').update(b).digest('hex'), `largo ${n}`);
  }
  for (const n of [4095, 4096, 65535, 65536, 300001]) {
    const b = new Uint8Array(n);
    for (let i = 0; i < n; i++) b[i] = lcg.hasta(256);
    assert.equal(hex(sha256Propio(b)), createHash('sha256').update(b).digest('hex'), `largo ${n}`);
  }
});

test('sha256 (crypto.subtle si está) y el respaldo propio dan los mismos bytes; sin crypto.subtle usa el propio', async () => {
  const datos = enc.encode(jsonCanonico(ejemploModelo()));
  const a = await sha256(datos);
  assert.equal(hex(a), hex(sha256Propio(datos)));
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  try {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    assert.equal(hex(await sha256(datos)), hex(a), 'sin crypto.subtle tiene que dar lo mismo con la implementación propia');
    Object.defineProperty(globalThis, 'crypto', { value: { subtle: { digest: async () => { throw new Error('contexto no seguro'); } } }, configurable: true });
    assert.equal(hex(await sha256(datos)), hex(a), 'si digest lanza (contexto no seguro) tiene que seguir con la propia');
  } finally {
    if (original) Object.defineProperty(globalThis, 'crypto', original);
  }
});

test('huellaModelo: 16 hex, igual con las claves en otro orden, distinta si cambia un valor', async () => {
  const m = ejemploModelo();
  const h = await huellaModelo(m);
  assert.match(h, /^[0-9a-f]{16}$/);
  const claves = Object.keys(m).reverse();
  const otro = {} as Record<string, unknown>;
  for (const k of claves) otro[k] = (m as unknown as Record<string, unknown>)[k];
  assert.equal(await huellaModelo(otro as unknown as typeof m), h);
  const m2 = ejemploModelo();
  m2.personas.induccion.puestosActivos = 4;
  assert.notEqual(await huellaModelo(m2), h);
  const m3 = ejemploModelo();
  m3.titulo += ' ';
  assert.notEqual(await huellaModelo(m3), h, 'hasta un espacio de más en un texto cambia la huella');
});

test('huellaModelo no tiene colisiones en 2.000 variantes del ejemplo', async () => {
  const vistos = new Set<string>();
  for (let i = 0; i < 2000; i++) {
    const m = ejemploModelo();
    m.demanda.camiones = { serie: true, cantidad: 10, primero: '22:00', cada: 900, paquetes: 100 + i };
    vistos.add(await huellaModelo(m));
  }
  assert.equal(vistos.size, 2000);
});
