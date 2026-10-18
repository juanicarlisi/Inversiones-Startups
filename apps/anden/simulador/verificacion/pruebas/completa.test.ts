// La batería completa con el motor de referencia (≈ 4 min). No entra en npm test: corre con VERIFICAR=1 (corte-1.md §9, P2).
//   VERIFICAR=1 node --test verificacion/pruebas/completa.test.ts
// Hecho cuando: las 59 exigibles de P2 pasan, S01 y S02 fallan como deben y las doradas coinciden.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { crearBateria, DEBEN_FALLAR_P2, EXIGIBLES_P2, INFORMATIVAS_P2, leerDoradas } from '../bateria.ts';

const activa = process.env.VERIFICAR === '1';

test('suite completa con el motor de referencia: 59 de 59 exigibles, S01 y S02 fallan como deben', { skip: activa ? false : 'solo con VERIFICAR=1' }, () => {
  const inf = crearBateria(crearMotorReferencia).correr({ suite: 'completa', doradas: leerDoradas(), motor: 'referencia' });
  const fallas = inf.resultados.filter((r) => r.tipo === 'exigible' && r.estado !== 'pasa');
  assert.deepEqual(fallas.map((r) => `${r.id}: ${r.motivo}`), [], 'exigibles que no pasaron');
  assert.deepEqual(inf.resultados.filter((r) => r.tipo === 'exigible').map((r) => r.id).sort(), [...EXIGIBLES_P2].sort());
  for (const id of DEBEN_FALLAR_P2) assert.equal(inf.resultados.find((r) => r.id === id)!.estado, 'debe-fallar-ok', `${id} tenía que fallar`);
  for (const id of INFORMATIVAS_P2) assert.equal(inf.resultados.find((r) => r.id === id)!.estado, 'informativa');
  assert.notEqual(inf.doradas.estado, 'falla', inf.doradas.distintas.join(' | '));
  assert.equal(inf.conservacion.violaciones, 0);
  assert.equal(inf.resumen.aprobada, true);
});
