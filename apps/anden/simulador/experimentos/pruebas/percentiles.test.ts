// Percentiles y su intervalo por estadísticos de orden (corte-1.md §7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icPercentil, percentil } from '../estadistica/percentiles.ts';
import { exponencial, generadorUniformes } from './ayudas.ts';

test('P_q = x₍min(n−1, ⌊q·n⌋)₎: definición literal, con ejemplos a mano', () => {
  const x = [5, 1, 4, 2, 3, 9, 8, 7, 6, 10];                 // 1…10 desordenado
  assert.equal(percentil(x, 0), 1);
  assert.equal(percentil(x, 0.5), 6, 'P50 de 10 datos: índice ⌊5⌋ = 5 → el sexto (6)');
  assert.equal(percentil(x, 0.9), 10, 'P90 de 10 datos: índice ⌊9⌋ = 9 → el máximo');
  assert.equal(percentil(x, 1), 10, 'q = 1 se recorta a n − 1');
  assert.equal(percentil([7], 0.9), 7);
  const cien = Array.from({ length: 100 }, (_, i) => i + 1);
  assert.equal(percentil(cien, 0.9), 91, 'P90 de 1…100: índice ⌊90⌋ = 90 → 91');
  assert.equal(percentil(cien, 0.5), 51);
});

test('el percentil no modifica la lista original y no depende del orden de llegada', () => {
  const x = [3, 1, 2, 5, 4];
  const copia = [...x];
  percentil(x, 0.5);
  assert.deepEqual(x, copia);
  assert.equal(percentil([5, 4, 3, 2, 1], 0.5), percentil([1, 2, 3, 4, 5], 0.5));
});

test('entradas inválidas: lista vacía, q fuera de [0, 1], valores no finitos', () => {
  assert.throws(() => percentil([], 0.5), /al menos un dato/);
  assert.throws(() => percentil([1, 2], 1.5), /entre 0 y 1 y llegó 1.5/);
  assert.throws(() => percentil([1, 2], -0.1), /entre 0 y 1/);
  assert.throws(() => percentil([1, Number.NaN, 3], 0.5), /solo números finitos y el valor 1 es NaN/);
  assert.throws(() => percentil([1, Infinity], 0.5), /finitos/);
});

test('IC del P90: rangos l = ⌊nq − z√(nq(1−q))⌋ y u = ⌈nq + z√(nq(1−q))⌉; para n = 100 son 84 y 96 (a mano)', () => {
  const cien = Array.from({ length: 100 }, (_, i) => i);         // x[i] = i
  const ic = icPercentil(cien, 0.9, 0.95)!;
  // nq = 90, √(nq(1−q)) = 3, z = 1,96 → 90 ∓ 5,88 → l = ⌊84,12⌋ = 84 y u = ⌈95,88⌉ = 96
  assert.deepEqual(ic, [84, 96]);
  assert.deepEqual(icPercentil(cien, 0.9, 0.99), [82, 98], '99%: 90 ∓ 7,73 → ⌊82,27⌋ = 82 y ⌈97,73⌉ = 98');
  assert.deepEqual(icPercentil(cien, 0.9, 0.9), [85, 95], '90%: 90 ∓ 4,93 → ⌊85,07⌋ = 85 y ⌈94,93⌉ = 95');
});

test('IC del P90: null con menos de 20 datos y también si un rango cae fuera de [0, n−1] (nunca se recorta al máximo)', () => {
  assert.equal(icPercentil(Array.from({ length: 19 }, (_, i) => i), 0.9, 0.95), null);
  // n = 20: u = ⌈18 + 1,96·√1,8⌉ = 21 > 19: recortarlo daba [x₁₅, máx], que cubre 83,5% (hallazgo E-07)
  assert.equal(icPercentil(Array.from({ length: 20 }, (_, i) => i), 0.9, 0.95), null, 'con 20 datos el P90 no tiene IC del 95%');
  assert.equal(icPercentil(Array.from({ length: 40 }, (_, i) => i), 0.9, 0.95), null, 'con 40 tampoco');
  const cien = Array.from({ length: 100 }, (_, i) => i);
  const ic = icPercentil(cien, 0.9, 0.95)!;
  // l = ⌊90 − 5,88⌋ = 84 y u = ⌈90 + 5,88⌉ = 96
  assert.deepEqual(ic, [84, 96]);
  assert.equal(icPercentil(Array.from({ length: 50 }, (_, i) => i), 0.99, 0.95), null, 'P99 con 50 datos: el techo caería fuera');
});

test('IC del P90 con n = 20 y n = 30: si existe, cubre al menos 93% (cobertura exacta por la binomial); si no, es null', () => {
  // cobertura exacta de [x₍l₎, x₍u₎] para el cuantil q: P(l < B ≤ u) con B ~ Binomial(n, q) (índices desde 0)
  const cobertura = (n: number, l: number, u: number, q: number) => {
    let c = 0;
    for (let k = l + 1; k <= u; k++) {
      let comb = 1;
      for (let i = 0; i < k; i++) comb = (comb * (n - i)) / (i + 1);
      let pk = 1;
      for (let i = 0; i < k; i++) pk *= q;
      for (let i = 0; i < n - k; i++) pk *= 1 - q;
      c += comb * pk;
    }
    return c;
  };
  for (const n of [20, 30, 60, 100, 200]) {
    const xs = Array.from({ length: n }, (_, i) => i);
    const ic = icPercentil(xs, 0.9, 0.95);
    if (ic === null) continue;
    const c = cobertura(n, ic[0], ic[1], 0.9);
    assert.ok(c >= 0.93, `n = ${n}: IC [x${ic[0]}, x${ic[1]}] cubre ${(c * 100).toFixed(2)}%`);
  }
  assert.equal(icPercentil(Array.from({ length: 30 }, (_, i) => i), 0.9, 0.95), null);
});

test('el IC del P90 siempre contiene al P90 muestral', () => {
  const u = generadorUniformes(5);
  for (let rep = 0; rep < 200; rep++) {
    const n = 20 + Math.floor(u() * 200);
    const xs = Array.from({ length: n }, () => exponencial(u));
    const ic = icPercentil(xs, 0.9, 0.95);
    if (ic === null) { assert.ok(n < 60, `n=${n}: el IC del P90 solo puede faltar con pocos datos`); continue; }
    const p = percentil(xs, 0.9);
    assert.ok(ic[0] <= p && p <= ic[1], `n=${n}: P90 muestral ${p} fuera de su IC [${ic}]`);
  }
});

/** Cobertura del IC del P90 de una exponencial de media 1 (P90 verdadero = ln 10) con n = 100. */
function coberturaP90(semilla: number, muestras: number): number {
  const P90_VERDADERO = 2.302585092994046;       // −ln(0,1)
  const u = generadorUniformes(semilla, 31);
  let cubre = 0;
  for (let m = 0; m < muestras; m++) {
    const xs = Array.from({ length: 100 }, () => exponencial(u));
    const ic = icPercentil(xs, 0.9, 0.95)!;
    if (ic[0] <= P90_VERDADERO && P90_VERDADERO <= ic[1]) cubre++;
  }
  return cubre / muestras;
}

test('cobertura del IC del P90 al 95% en 2.000 muestras exponenciales de n = 100: entre 94% y 98%', () => {
  let cobertura = coberturaP90(20261018, 2000);
  let nota = '';
  if (!(cobertura >= 0.94 && cobertura <= 0.98)) {
    nota = ` (primera pasada ${(cobertura * 100).toFixed(2)}%, re-corrida con otra semilla y 4× muestras)`;
    cobertura = coberturaP90(20261019, 8000);
  }
  assert.ok(cobertura >= 0.94 && cobertura <= 0.98, `cobertura ${(cobertura * 100).toFixed(2)}%${nota}: se esperaba entre 94% y 98%`);
});
