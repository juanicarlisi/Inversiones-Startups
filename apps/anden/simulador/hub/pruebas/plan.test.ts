// hub/pruebas/plan.test.ts · P4 · Plan de clasificación y personas de rampa (corte-1.md §6.7 regla 7) y su efecto medido.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compilarConfig } from '../config.ts';
import { asignarRampas, planBalanceado } from '../plan.ts';
import { percentil } from '../kpi.ts';
import { chico, grande, noche } from './modelos.ts';

function asignacion(m: ReturnType<typeof chico>, presentes: number[]): number[] {
  const cfg = compilarConfig(m, 'F3'), out = new Int32Array(cfg.NR);
  asignarRampas(cfg, Uint8Array.from(presentes), out);
  return Array.from(out);
}

test("'por-volumen': de la rampa más pesada a la más liviana, cada una a la persona presente con menos carga", () => {
  // pesos esperados (ruta ÷ rampas de la ruta): R01 .10 R02 .075 R03 .12 R04 .10 R05 .09 R06 .08 R07 .10 R08 .075 R09 .08 R10 .07 R11 .06 R12 .05
  assert.deepEqual(asignacion(chico(), [1, 1, 1, 1, 1, 1]), [1, 4, 0, 2, 4, 5, 3, 1, 5, 2, 3, 0]);
  // con la persona 0 ausente sin cubrir, se reparte entre las presentes
  const sin0 = asignacion(chico(), [0, 1, 1, 1, 1, 1]);
  assert.ok(sin0.every((w) => w >= 1), 'nadie le asigna rampas a una ausente');
  assert.equal(sin0[2], 1, 'R03, la más pesada, a la primera presente');
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

test("30 noches de la plantilla grande: el P90 de recirculación con 'por-volumen' ≤ con 'contiguas'", () => {
  const recirculacion = (asignacion: 'por-volumen' | 'contiguas') => {
    const m = grande();
    m.personas.rampa.asignacion = asignacion;
    const x = Float64Array.from({ length: 30 }, (_, r) => noche(m, r).resultado.kpi.recirculacionPct);
    return percentil(x.sort(), 0.9);
  };
  const volumen = recirculacion('por-volumen'), contiguas = recirculacion('contiguas');
  assert.ok(volumen <= contiguas, `P90 de recirculación: por volumen ${volumen.toFixed(3)}% contra contiguas ${contiguas.toFixed(3)}%`);
  assert.ok(contiguas > 0, 'con rampas contiguas hay recirculación que ahorrar');
});
