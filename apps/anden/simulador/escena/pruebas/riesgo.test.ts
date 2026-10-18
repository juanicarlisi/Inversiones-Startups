// escena/pruebas/riesgo.test.ts · P6. Las cien noches sobre el plano (AgregarRiesgo) con resultados sintéticos (corte-1.md §9 P6):
// probabilidad de que cada rampa se llene, percentiles (P_q = x₍min(n−1, ⌊q·n⌋)₎, §7), noche mediana y peor según el sentido del KPI, y
// rechazo de entradas que mezclan modelos. Se arma solo con ResultadoReplica: nunca con trazas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agregarRiesgo, elegirNoche, percentilOrdenado } from '../riesgo.ts';
import { resultado } from './ayudas.ts';

/** 20 noches: fin = 200 + (7·i mod 20) (una permutación de 200…219); la rampa 1 se llena en 4 noches y la 2 en 14. */
function veinte() {
  return Array.from({ length: 20 }, (_, i) => resultado(i, {
    kpi: { finClasificacionMin: 200 + ((7 * i) % 20), pctAlCorte: 100 - ((3 * i) % 20) },
    minutosLlena: [0, i < 4 ? 5 + i : 0, i < 14 ? i + 1 : 0],
  }));
}

test('probabilidad de llenarse: fracción de noches con minutos de rampa llena > 0', () => {
  const m = agregarRiesgo(veinte(), 'finClasificacionMin');
  assert.equal(m.noches, 20);
  assert.deepEqual(Array.from(m.rampaProbLlena), [0, Math.fround(0.2), Math.fround(0.7)], 'Float32: 0, 4/20 y 14/20');
});

test('percentiles con la definición de §7: P90 de minutos llena y P10, P50 y P90 de la hora de fin', () => {
  const m = agregarRiesgo(veinte(), 'finClasificacionMin');
  // rampa 1: [0×16, 5, 6, 7, 8] → x[18] = 7 · rampa 2: [0×6, 1…14] → x[18] = 13
  assert.deepEqual(Array.from(m.rampaMinutosLlenaP90), [0, 7, 13], 'P90 = x[⌊0,9·20⌋] = x[18]');
  assert.deepEqual(m.finClasificacionMin, { p10: 202, p50: 210, p90: 218 });
});

test('fila por cuarto de hora: P50 y P90 entre noches; un cuarto que una noche no tuvo cuenta como fila vacía', () => {
  const rs = [
    resultado(0, { fila: [3, 2] }), resultado(1, { fila: [1, 7] }), resultado(2, { fila: [4, 1] }), resultado(3, { fila: [1, 8] }),
    resultado(4, { fila: [5] }),
  ];
  const m = agregarRiesgo(rs, 'finClasificacionMin');
  // cuarto 0: [1, 1, 3, 4, 5] → P50 = x[2] = 3, P90 = x[4] = 5 · cuarto 1: [0, 1, 2, 7, 8] → P50 = 2, P90 = 8
  assert.deepEqual(Array.from(m.filaP50), [3, 2]);
  assert.deepEqual(Array.from(m.filaP90), [5, 8]);
});

test('noche mediana y peor según kpiNoche y el sentido del KPI (menos es mejor · más es mejor), con empate a la menor réplica', () => {
  const rs = veinte();
  const m = agregarRiesgo(rs, 'finClasificacionMin');
  assert.equal(m.nocheMediana, 10, 'la mediana (posición ⌊20/2⌋ = 10 al ordenar) es la del fin 210: réplica 10');
  assert.equal(m.nochePeor, 17, 'terminar tarde es peor: la del fin 219 es la réplica 17');
  assert.equal(elegirNoche(rs, 'finClasificacionMin', 'mejor'), 0, 'la mejor termina a los 200: réplica 0');
  // pctAlCorte: más es mejor; 100 − (3·i mod 20) vale 81 en la réplica 13 (39 mod 20 = 19)
  assert.equal(agregarRiesgo(rs, 'pctAlCorte').nochePeor, 13);
  const empate = [resultado(4, { kpi: { finClasificacionMin: 300 } }), resultado(2, { kpi: { finClasificacionMin: 300 } }), resultado(9, { kpi: { finClasificacionMin: 100 } })];
  assert.equal(agregarRiesgo(empate, 'finClasificacionMin').nochePeor, 2, 'empate en la peor: la menor réplica');
});

test('el orden de llegada de las noches no cambia el mapa', () => {
  const rs = veinte(), mezcladas = rs.slice().reverse();
  [mezcladas[3], mezcladas[11]] = [mezcladas[11], mezcladas[3]];
  assert.deepEqual(agregarRiesgo(mezcladas, 'finClasificacionMin'), agregarRiesgo(rs, 'finClasificacionMin'));
});

test('sin noches (mientras llegan): mapa vacío con réplicas −1 y percentiles NaN', () => {
  const m = agregarRiesgo([], 'finClasificacionMin');
  assert.equal(m.noches, 0);
  assert.equal(m.nocheMediana, -1);
  assert.equal(m.nochePeor, -1);
  assert.ok(Number.isNaN(m.finClasificacionMin.p50));
  assert.equal(m.rampaProbLlena.length, 0);
});

test('entradas inválidas se rechazan diciendo qué se esperaba', () => {
  assert.throws(() => agregarRiesgo([resultado(0, {}), resultado(1, { modelo: 'otro' })], 'finClasificacionMin'), /no se mezclan modelos/);
  assert.throws(() => agregarRiesgo([resultado(0, { minutosLlena: [1, 2] }), resultado(1, { minutosLlena: [1] })], 'finClasificacionMin'), /trae 1 rampas y la primera 2/);
  assert.throws(() => agregarRiesgo([resultado(0, {})], 'noExiste' as 'paquetes'), /«noExiste» no es un KPI/);
  assert.throws(() => agregarRiesgo([resultado(0, { kpi: { finClasificacionMin: Number.NaN } })], 'finClasificacionMin'), /no tiene un número en finClasificacionMin/);
});

test('percentilOrdenado: P_q = x₍min(n−1, ⌊q·n⌋)₎', () => {
  const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  assert.equal(percentilOrdenado(x, 0.5), 6);
  assert.equal(percentilOrdenado(x, 0.9), 10);
  assert.equal(percentilOrdenado(x, 1), 10);
  assert.equal(percentilOrdenado(x, 0), 1);
  assert.ok(Number.isNaN(percentilOrdenado([], 0.5)));
});
