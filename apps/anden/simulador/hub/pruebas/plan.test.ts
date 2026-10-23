// hub/pruebas/plan.test.ts · P4 · Plan de clasificación y personas de rampa (corte-1.md §6.7 regla 7) y su efecto medido.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compilarConfig } from '../config.ts';
import { asignarRampas, particionPareja, planBalanceado } from '../plan.ts';
import type { Modelo } from '../../contratos/modelo.ts';
import { chico, recirculacionP90 } from './modelos.ts';

function asignacion(m: Modelo, presentes: number[]): number[] {
  const cfg = compilarConfig(m, 'F3'), out = new Int32Array(cfg.NR);
  asignarRampas(cfg, Uint8Array.from(presentes), out);
  return Array.from(out);
}

test("'por-volumen' (motor 1.1.0): bloques de rampas vecinas en el orden del lazo, con la carga del más cargado lo menor posible", () => {
  // pesos esperados (ruta ÷ rampas de la ruta), en el orden del lazo (= orden del modelo en la chica):
  // R01 .10 R02 .075 R03 .12 R04 .10 R05 .09 R06 .08 R07 .10 R08 .075 R09 .08 R10 .07 R11 .06 R12 .05
  assert.deepEqual(asignacion(chico(), [1, 1, 1, 1, 1, 1]), [0, 0, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5]);
  // la partición es óptima: ninguna otra partición en 6 bloques contiguos tiene un bloque más liviano como máximo (fuerza bruta)
  const cfg = compilarConfig(chico(), 'F3'), pesos = Array.from(cfg.rampaPeso);
  const maximoDe = (cortes: number[]) => {
    let mx = 0;
    for (let k = 0; k + 1 < cortes.length; k++) { let c = 0; for (let i = cortes[k]; i < cortes[k + 1]; i++) c += pesos[i]; mx = Math.max(mx, c); }
    return mx;
  };
  let mejor = Infinity;
  const recorrer = (cortes: number[]) => {
    if (cortes.length === 6) { mejor = Math.min(mejor, maximoDe([...cortes, 12])); return; }
    for (let i = cortes[cortes.length - 1] + 1; i <= 12 - (6 - cortes.length); i++) recorrer([...cortes, i]);
  };
  recorrer([0]);
  assert.ok(Math.abs(maximoDe(particionPareja(pesos, 6)) - mejor) < 1e-12, `la carga máxima tiene que ser la óptima (${mejor})`);
  // con la persona 0 ausente sin cubrir, se reparte entre las presentes y cada bloque sigue siendo de rampas vecinas
  const sin0 = asignacion(chico(), [0, 1, 1, 1, 1, 1]);
  assert.ok(sin0.every((w) => w >= 1), 'nadie le asigna rampas a una ausente');
  for (let r = 1; r < 12; r++) assert.ok(sin0[r] >= sin0[r - 1], `bloques contiguos en el orden del lazo: ${sin0.join(',')}`);
  assert.equal(new Set(sin0).size, 5, 'cada presente tiene su bloque');
});

test('particionPareja: más bloques que pesos deja bloques vacíos al final; un bloque es todo', () => {
  assert.deepEqual(particionPareja([1, 2], 4), [0, 1, 2, 2, 2]);
  assert.deepEqual(particionPareja([1, 2, 3], 1), [0, 3]);
  assert.deepEqual(particionPareja([5, 1, 1, 1, 1, 1], 2), [0, 1, 6], 'el más cargado solo, el resto junto');
});

test("'contiguas': la rampa r a floor(r·n ÷ R); las de una ausente sin cubrir, a la siguiente presente", () => {
  const m = chico();
  m.personas.rampa.asignacion = 'contiguas';
  assert.deepEqual(asignacion(m, [1, 1, 1, 1, 1, 1]), [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  assert.deepEqual(asignacion(m, [1, 1, 0, 1, 1, 1]), [0, 0, 1, 1, 3, 3, 3, 3, 4, 4, 5, 5]);
  assert.deepEqual(asignacion(m, [1, 1, 1, 1, 1, 0]), [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0], 'la siguiente presente, en ronda');
  assert.deepEqual(asignacion(m, [0, 0, 0, 0, 0, 0]), Array(12).fill(-1), 'sin nadie presente, ninguna rampa tiene persona');
});

test('lista explícita: como dice, y las de una ausente a la siguiente presente', () => {
  const m = chico();
  m.personas.rampa.asignacion = [['R01', 'R02', 'R03'], ['R04', 'R05', 'R06'], ['R07', 'R08'], ['R09'], ['R10', 'R11'], ['R12']];
  assert.deepEqual(asignacion(m, [1, 1, 1, 1, 1, 1]), [0, 0, 0, 1, 1, 1, 2, 2, 3, 4, 4, 5]);
  assert.deepEqual(asignacion(m, [1, 0, 1, 1, 1, 1]), [0, 0, 0, 2, 2, 2, 2, 2, 3, 4, 4, 5]);
});

test('planBalanceado devuelve el parche que pone «por-volumen»', () => {
  assert.deepEqual(planBalanceado(chico()), [{ op: 'replace', path: '/personas/rampa/asignacion', value: 'por-volumen' }]);
});

test("30 noches de la plantilla chica: el P90 de recirculación con 'por-volumen' ≤ con 'contiguas'", () => {
  // En la chica las rampas sí son el cuello con la dotación de la plantilla (MEDIDO: 5,3% contra 12,0% de recirculación media).
  const volumen = recirculacionP90(chico, 'por-volumen'), contiguas = recirculacionP90(chico, 'contiguas');
  assert.ok(volumen <= contiguas, `P90 de recirculación: por volumen ${volumen.toFixed(3)}% contra contiguas ${contiguas.toFixed(3)}%`);
  assert.ok(contiguas > 0, 'con rampas contiguas hay recirculación que ahorrar');
});
