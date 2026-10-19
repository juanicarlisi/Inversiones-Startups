// integracion/pruebas/bateria-extra.test.ts · Andén simulador, corte 1 · Integración (corte-1.md §8 y §10.6).
// Que `npm run verificar` arme exactamente las 85 exigibles del corte (59 de P2 + 26 que suma la integración), sin ids repetidos y cada una
// con su dueño, y que los casos instantáneos (K01, S13) y R04 sin medir den lo que tienen que dar. La batería completa no entra acá: tarda
// unos 9 minutos y corre con `npm run verificar`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearBateria, EXIGIBLES_P2 } from '../../verificacion/bateria.ts';
import { crearMotorProduccion } from '../ensamblar.ts';
import { crearCasosExtra, EXIGIBLES_DEL_CORTE, EXIGIBLES_EXTRA } from '../bateria/indice.ts';
import { BANDA_S03 } from '../bateria/casos-estadistica.ts';
import { compararHuellas } from '../r04.mjs';

test('batería del corte: 59 exigibles de P2 + 26 de la integración = 85, sin repetidos (§8: V 50 + C 3 + D/M 3 + R 8 + K 7 + L 7 + P 1 + S 6)', () => {
  assert.equal(EXIGIBLES_P2.length, 59);
  assert.equal(EXIGIBLES_EXTRA.length, 26);
  assert.equal(new Set(EXIGIBLES_DEL_CORTE).size, 85, 'las 85 ids tienen que ser distintas');
  const b = crearBateria(crearMotorProduccion, { casosExtra: crearCasosExtra({ r04: null, r07: null }) });
  const exigibles = b.casos.flatMap((c) => c.pruebas.filter((p) => p.tipo === 'exigible').map((p) => p.id));
  assert.deepEqual([...exigibles].sort(), [...EXIGIBLES_DEL_CORTE].sort(), 'las exigibles declaradas tienen que ser las 85 del corte');
  const porFamilia: Record<string, number> = {};
  for (const c of b.casos) for (const p of c.pruebas) if (p.tipo === 'exigible') porFamilia[p.familia] = (porFamilia[p.familia] ?? 0) + 1;
  assert.deepEqual(porFamilia, { V: 50, C: 3, D: 1, M: 2, R: 8, K: 7, L: 7, P: 1, S: 6 });
  // el hub chico entra en R01 y R03 de P2
  assert.ok(b.casos.some((c) => (c.reproducibles ?? []).some((r) => r.etiqueta.includes('hub chico'))), 'el hub chico tiene que estar en R01 y R03');
});

test('K01 y S13 con el núcleo de producción: exactos; R04 y R07 sin medir fallan diciendo por qué', () => {
  const b = crearBateria(crearMotorProduccion, { casosExtra: crearCasosExtra({ r04: null, r07: null, motivoR04: 'no se midió en esta prueba' }) });
  const inf = b.correr({ suite: 'completa', ids: ['K01a', 'S13', 'R04', 'R07'] });
  const de = (id: string) => inf.resultados.find((r) => r.id === id)!;
  for (const id of ['K01a', 'K01b', 'K01c', 'K01d', 'S13']) assert.equal(de(id).estado, 'pasa', `${id}: ${de(id).motivo ?? ''}`);
  assert.equal(de('K01a').dueno, 'P1');
  assert.equal(de('S13').dueno, 'P5');
  assert.equal(de('R04').estado, 'falla');
  assert.match(de('R04').motivo ?? '', /no se midió en esta prueba/);
  assert.equal(de('R07').estado, 'falla');
  assert.match(de('R07').motivo ?? '', /worker_threads/);
});

test('S03: la banda corregida está centrada en la cobertura real del método (93,6%) con ± 1,96 ee de 500 macro-experimentos', () => {
  const ee = Math.sqrt((0.936 * 0.064) / 500);
  assert.ok(Math.abs((BANDA_S03.min + BANDA_S03.max) / 2 - 0.9365) < 0.001);
  assert.ok(BANDA_S03.max - 0.936 >= 1.96 * ee && 0.936 - BANDA_S03.min >= 1.96 * ee, 'la banda no puede ser más angosta que ± 1,96 ee');
});

test('R04: comparar huellas detecta claves distintas, faltantes y sobrantes', () => {
  const a = { x: '1', y: '2', z: '3' };
  assert.deepEqual(compararHuellas(a, { ...a }).nDistintas, 0);
  const c = compararHuellas(a, { x: '1', y: '9', w: '4' });
  assert.equal(c.nDistintas, 1);
  assert.equal(c.nFaltan, 1);
  assert.equal(c.nSobran, 1);
  assert.match(c.distintas[0], /^y: Node «2» y navegador «9»$/);
});
