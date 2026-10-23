// integracion/pruebas/huella-fuentes.test.ts · Andén simulador, corte 1 · Integración (hallazgo H5 de la revisión del 19-10-2026).
// El sello «Motor x.y.z: pasó 85 de 85» depende del CÓDIGO que corrió la batería, no solo del texto de la versión: la construcción
// recalcula la huella de los archivos que corre la batería y, si no es la guardada por `npm run verificar`, dice «sin verificar».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fuentesDeLaBateria, huellaFuentes } from '../huella-fuentes.mjs';
import { motorVerificado, RAIZ } from '../construir.mjs';

test('la huella de la batería abarca lo que corre: núcleo, hub, verificación, estadística, la batería de la integración y las doradas', () => {
  const f = fuentesDeLaBateria();
  for (const x of ['integracion/verificar.ts', 'nucleo/motor/motor.ts', 'hub/bloques/rampas.ts', 'verificacion/bateria.ts',
    'experimentos/estadistica/wilson.ts', 'integracion/bateria/casos-estadistica.ts', 'verificacion/doradas.json', 'nucleo/version.ts']) {
    assert.ok(f.includes(x), `la huella de la batería tiene que incluir ${x}`);
  }
  assert.ok(!f.some((x) => x.includes('/pruebas/') && x.endsWith('.test.ts')), 'las pruebas de npm test no corren en la batería');
  assert.ok(!f.some((x) => x.startsWith('app/')), 'la interfaz no corre en la batería');
  const h = huellaFuentes();
  assert.match(h.sha256, /^[0-9a-f]{64}$/);
  assert.equal(h, h, 'determinista');
  assert.deepEqual(huellaFuentes(), h);
});

test('el sello del motor solo dice «pasó N de 85» si la batería se corrió con ESTE código (si no, «sin verificar»)', () => {
  const archivo = join(RAIZ, 'integracion', 'salida', 'bateria-nucleo.json');
  const guardada = existsSync(archivo) ? (JSON.parse(readFileSync(archivo, 'utf8')) as { fuentes?: { sha256?: string } }).fuentes?.sha256 : undefined;
  const coincide = guardada === huellaFuentes().sha256;
  const m = motorVerificado();
  assert.equal(m !== null, coincide, coincide ? 'misma huella: el sello tiene el resultado de la batería'
    : 'otra huella (o ninguna guardada): el sello tiene que decir «sin verificar» (null) aunque la versión coincida');
});
