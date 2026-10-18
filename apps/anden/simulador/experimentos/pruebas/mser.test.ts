// MSER-5 sobre la serie promedio entre réplicas (corte-1.md §7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mser5, mser5Detalle, serieMedia } from '../estadistica/mser.ts';
import { generadorUniformes, normalEstandar } from './ayudas.ts';

/** Serie con un transitorio lineal conocido: baja de `amp` a 0 en los primeros 200 puntos y después queda estable, más ruido normal. */
function serieConTransitorio(semilla: number, largo = 1000, amp = 10, sd = 1): number[] {
  const u = generadorUniformes(semilla, 5);
  return Array.from({ length: largo }, (_, i) => (i < 200 ? amp * (1 - i / 200) : 0) + sd * normalEstandar(u));
}

test('MSER-5 encuentra el corte de una serie con transitorio lineal en los primeros 200 puntos: entre 150 y 300', () => {
  const cortes: number[] = [];
  for (let s = 1; s <= 30; s++) {
    const corte = mser5(serieConTransitorio(1000 + s));
    cortes.push(corte);
    assert.ok(corte >= 150 && corte <= 300, `semilla ${1000 + s}: el corte salió en ${corte} y se esperaba entre 150 y 300`);
    assert.equal(corte % 5, 0, 'el corte es múltiplo del lote (5)');
  }
  cortes.sort((a, b) => a - b);
  assert.ok(cortes[15] >= 170 && cortes[15] <= 230, `corte mediano ${cortes[15]}: se esperaba cerca de 200`);
});

test('sobre una serie estacionaria el corte es casi nulo (no inventa un calentamiento)', () => {
  const cortes: number[] = [];
  for (let s = 1; s <= 30; s++) {
    const u = generadorUniformes(500 + s, 5);
    cortes.push(mser5(Array.from({ length: 1000 }, () => normalEstandar(u))));
  }
  cortes.sort((a, b) => a - b);
  assert.ok(cortes[15] <= 25, `corte mediano ${cortes[15]} en una serie sin transitorio: se esperaba ≤ 25`);
});

test('promediar réplicas primero: el corte de la serie promedio de 10 réplicas ruidosas también cae en 150–300', () => {
  const reps = Array.from({ length: 10 }, (_, r) => serieConTransitorio(77 + r, 1000, 10, 3));
  const promedio = serieMedia(reps);
  const corte = mser5(promedio);
  assert.ok(corte >= 150 && corte <= 300, `corte sobre el promedio de 10 réplicas = ${corte}: se esperaba entre 150 y 300`);
});

test('caso armado a mano: lotes [10, 1, 1, 1] → MSER = [3,796875; 0; 0] → corte 5 (en empate gana el d menor)', () => {
  const serie = [10, 10, 10, 10, 10, ...Array<number>(15).fill(1)];
  const d = mser5Detalle(serie);
  assert.deepEqual(d.estadistico, [3.796875, 0, 0]);
  assert.equal(d.d, 1); assert.equal(d.corte, 5); assert.equal(d.lotes, 4); assert.equal(d.tocaElLimite, false);
  assert.equal(mser5(serie), 5);
});

test('las observaciones sobrantes (menos de un lote) se ignoran; la serie no se modifica', () => {
  const serie = [10, 10, 10, 10, 10, ...Array<number>(10).fill(1), 999, 999];   // 17 observaciones → 3 lotes
  const copia = [...serie];
  const d = mser5Detalle(serie);
  assert.equal(d.lotes, 3);
  assert.deepEqual(serie, copia);
  assert.equal(d.corte, 5);
});

test('una tendencia sin zona estable toca el límite (⌊m/2⌋ lotes) y se avisa con tocaElLimite', () => {
  const rampa = Array.from({ length: 100 }, (_, i) => i);
  const d = mser5Detalle(rampa);
  assert.equal(d.d, 10); assert.equal(d.corte, 50); assert.equal(d.tocaElLimite, true);
});

test('es invariante a un corrimiento enorme de la media (sin cancelación numérica) y a la escala', () => {
  const base = serieConTransitorio(1001);
  assert.equal(mser5(base.map((x) => x + 1e9)), mser5(base), 'sumar 1e9 a todos los puntos no cambia el corte');
  assert.equal(mser5(base.map((x) => x * 1000)), mser5(base), 'multiplicar por 1000 tampoco');
});

test('serieMedia: promedio por posición, en el orden dado; series de distinto largo lanzan error', () => {
  assert.deepEqual(serieMedia([[1, 2, 3], [3, 4, 5]]), [2, 3, 4]);
  assert.deepEqual(serieMedia([[7, 8]]), [7, 8]);
  assert.throws(() => serieMedia([]), /al menos una serie/);
  assert.throws(() => serieMedia([[1, 2], [1, 2, 3]]), /mismo largo; la 0 tiene 2 y la 1 tiene 3/);
});

test('entradas inválidas: menos de 5 observaciones y valores no finitos', () => {
  assert.throws(() => mser5([1, 2, 3, 4]), /al menos 5 observaciones y llegaron 4/);
  assert.throws(() => mser5([1, 2, 3, 4, Number.NaN]), /observación 4 no es un número finito/);
});

test('una serie de un solo lote devuelve corte 0', () => {
  assert.equal(mser5([1, 2, 3, 4, 5]), 0);
});
