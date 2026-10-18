// K01a–K01d (corte-1.md §8): tiempo trapezoidal con vmáx 2 m/s y a 0,5 m/s² para 5, 8, 30 y 100 m.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tiempoTrapezoidal } from '../cinematica/trapezoidal.ts';

test('K01a–K01d: 5 m → 6,3246 s · 8 m → 8 s · 30 m → 19 s · 100 m → 54 s', () => {
  const casos: [string, number, number][] = [['K01a', 5, 6.3246], ['K01b', 8, 8.0], ['K01c', 30, 19.0], ['K01d', 100, 54.0]];
  for (const [id, d, esperado] of casos) {
    const t = tiempoTrapezoidal(d, 2, 0.5);
    // Los valores publicados tienen 4 decimales: la tolerancia es media unidad del último.
    assert.ok(Math.abs(t - esperado) <= 5e-5, `${id}: ${d} m: se esperaban ${esperado} s y salieron ${t} s`);
  }
  // K01a exacto: perfil triangular con pico √(2,5) m/s → 4·√2,5 s.
  assert.equal(tiempoTrapezoidal(5, 2, 0.5), 4 * Math.sqrt(2.5));
  // En el borde (8 m) y en los trapecios, el resultado es exacto.
  assert.equal(tiempoTrapezoidal(8, 2, 0.5), 8);
  assert.equal(tiempoTrapezoidal(30, 2, 0.5), 19);
  assert.equal(tiempoTrapezoidal(100, 2, 0.5), 54);
});

test('frenado distinto de la aceleración: trapecio y triángulo', () => {
  // a = 1, f = 0,5, vmáx 2: acelera 2 m en 2 s, frena 4 m en 4 s.
  assert.equal(tiempoTrapezoidal(10, 2, 1, 0.5), 2 + 4 + 4 / 2);
  // 3 m < 6 m: triángulo con v² = 2·3·1·0,5 / 1,5 = 2.
  const v = Math.sqrt(2);
  assert.ok(Math.abs(tiempoTrapezoidal(3, 2, 1, 0.5) - (v / 1 + v / 0.5)) < 1e-15);
  assert.equal(tiempoTrapezoidal(0, 2, 1), 0);
  // Continuidad en el borde trapecio–triángulo.
  const borde = 6, eps = 1e-9;
  assert.ok(Math.abs(tiempoTrapezoidal(borde - eps, 2, 1, 0.5) - tiempoTrapezoidal(borde, 2, 1, 0.5)) < 1e-6);
});

test('el tiempo crece con la distancia (monótono) en 10.000 distancias', () => {
  let anterior = 0;
  for (let i = 1; i <= 10_000; i++) {
    const t = tiempoTrapezoidal(i * 0.01, 2, 0.5, 0.8);
    assert.ok(t > anterior, `no monótono en ${i * 0.01} m: ${t} ≤ ${anterior}`);
    anterior = t;
  }
});

test('errores claros con entradas inválidas', () => {
  assert.throws(() => tiempoTrapezoidal(-1, 2, 0.5), /se esperaba una distancia finita ≥ 0 \(m\) y llegó -1/);
  assert.throws(() => tiempoTrapezoidal(NaN, 2, 0.5), RangeError);
  assert.throws(() => tiempoTrapezoidal(5, 0, 0.5), /se esperaba la velocidad máxima \(m\/s\) finita y > 0 y llegó 0/);
  assert.throws(() => tiempoTrapezoidal(5, 2, -0.5), /la aceleración/);
  assert.throws(() => tiempoTrapezoidal(5, 2, 0.5, 0), /el frenado/);
  assert.throws(() => tiempoTrapezoidal(Infinity, 2, 0.5), RangeError);
});
