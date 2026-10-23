// La cola de la normal y su inversa con solo aritmética (experimentos/estadistica/normal.ts) y la corrección por mirar varias veces
// de la decisión secuencial (hallazgos H2 y E-03 de la revisión del 19-10-2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colaNormal, confianzaPorMirada, expAritmetica, miradasSecuenciales, zDeCola } from '../estadistica/normal.ts';
import { estadoPorWilson, wilsonZ } from '../estadistica/wilson.ts';
import { evaluarDecision } from '../decision.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { modeloEjemplo, planificadorSincrono, simuladorPorValor, varianteFalsa } from './ayudas.ts';

test('expAritmetica: e^0 = 1, e^1 = e, e^−20 y e^−700 con error relativo < 1e-14', () => {
  assert.equal(expAritmetica(0), 1);
  const casos: [number, number][] = [[1, 2.718281828459045], [-1, 0.36787944117144233], [-20, 2.061153622438558e-9],
    [-700, 9.85967654375977e-305], [10, 22026.465794806718]];
  for (const [x, esperado] of casos) {
    const v = expAritmetica(x);
    assert.ok(Math.abs(v - esperado) <= 1e-14 * esperado, `e^${x}: se esperaba ${esperado} y salió ${v}`);
  }
});

test('zDeCola reproduce los z de §7 y los de la corrección (valores de control de Python statistics.NormalDist)', () => {
  const casos: [number, number][] = [
    [0.025, 1.959963984540054], [0.005, 2.5758293035489004], [0.05, 1.6448536269514722],
    [0.00125, 3.0233414397391534], [0.000125, 3.662259930887615], [1e-7, 5.199337582290662],
  ];
  for (const [q, z] of casos) {
    const v = zDeCola(q);
    assert.ok(Math.abs(v - z) < 1e-9, `cola ${q}: se esperaba z = ${z} y salió ${v}`);
  }
  assert.ok(Math.abs(colaNormal(3.5) - 0.0002326290790355401) < 1e-15);
  assert.ok(Math.abs(colaNormal(5) - 2.866515718125129e-7) / 2.866515718125129e-7 < 1e-9);
  assert.equal(zDeCola(0.5), 0);
  assert.throws(() => zDeCola(0), /la cola tiene que estar en \(0; 0,5\] y llegó 0/);
});

test('miradas y confianza por mirada: 20 iniciales, tandas de 20 hasta 400 → 20 miradas y z = 3,0233 (Bonferroni)', () => {
  assert.equal(miradasSecuenciales(20, 20, 400), 20);
  assert.equal(miradasSecuenciales(20, 20, 100), 5);
  assert.equal(miradasSecuenciales(20, 20, 20), 1);
  const c = confianzaPorMirada(0.95, 20);
  assert.ok(Math.abs(c.confianza - 0.9975) < 1e-15);
  assert.ok(Math.abs(c.z - 3.0233414397391534) < 1e-9);
  assert.ok(Math.abs(confianzaPorMirada(0.95, 1).z - 1.959963984540054) < 1e-9, 'con una sola mirada es el z de siempre');
});

/**
 * Probabilidad EXACTA (programación dinámica sobre la binomial) de que la regla secuencial declare «cumple» a una opción con
 * probabilidad real p: mira en n = inicial, inicial + tanda, …, máximo con el Wilson de cada mirada y se queda con la primera decisión.
 */
function probCumpleSecuencial(p: number, meta: number, inicial: number, tanda: number, maximo: number, confianza: number): number {
  const z = confianzaPorMirada(confianza, miradasSecuenciales(inicial, tanda, maximo)).z;
  // binomial(m, j) · p^j · (1−p)^(m−j) sin potencias nativas
  const binomial = (m: number): number[] => {
    let fila = [1];
    for (let i = 0; i < m; i++) {
      const sig = new Array<number>(fila.length + 1).fill(0);
      for (let j = 0; j < fila.length; j++) { sig[j] += fila[j] * (1 - p); sig[j + 1] += fila[j] * p; }
      fila = sig;
    }
    return fila;
  };
  let vivos = binomial(inicial); // vivos[k] = P(k éxitos y todavía en duda)
  let n = inicial, cumple = 0;
  const paso = binomial(tanda);
  for (;;) {
    for (let k = 0; k < vivos.length; k++) {
      if (vivos[k] === 0) continue;
      const e = estadoPorWilson(wilsonZ(k, n, z), meta);
      if (e === 'cumple') { cumple += vivos[k]; vivos[k] = 0; } else if (e === 'no-cumple') vivos[k] = 0;
    }
    if (n >= maximo) break;
    const m = Math.min(tanda, maximo - n), inc = m === tanda ? paso : binomial(m);
    const sig = new Array<number>(vivos.length + m).fill(0);
    for (let k = 0; k < vivos.length; k++) if (vivos[k] > 0) for (let j = 0; j < inc.length; j++) sig[k + j] += vivos[k] * inc[j];
    vivos = sig; n += m;
  }
  return cumple;
}

test('calibración exacta: con p = meta (o 0,01 menos) la regla secuencial declara «cumple» en ≤ 2,5% (antes: 9,2% y 4,0%)', () => {
  for (const meta of [0.8, 0.9, 0.95]) {
    for (const p of [meta, meta - 0.01]) {
      const c = probCumpleSecuencial(p, meta, 20, 20, 400, 0.95);
      assert.ok(c <= 0.025, `meta ${meta}, p real ${p}: «cumple» falso en ${(c * 100).toFixed(2)}% (tiene que ser ≤ 2,5%)`);
    }
  }
  // y no se volvió inútil: con p = 0,97 y meta 0,9 casi siempre llega a «cumple»
  assert.ok(probCumpleSecuencial(0.97, 0.9, 20, 20, 400, 0.95) > 0.99, 'con p = 0,97 tiene que declarar «cumple» casi siempre');
});

test('calibración con la evaluarDecision real: 2.000 decisiones con semilla fija, p₃ = meta → recomendar 3 en ≤ 2,5% + 3 errores estándar', async () => {
  // 2 nunca cumple, 4 y 5 cumplen siempre: la recomendación es 3 solo si la regla declara «cumple» a una opción que está justo en la meta
  const probas = { 2: 0, 3: 0.9, 4: 1, 5: 1 };
  const plan = planificadorSincrono(simuladorPorValor(probas));
  let recomendo3 = 0;
  const N = 2000;
  for (let i = 0; i < N; i++) {
    const m = modeloEjemplo();
    m.experimento.semilla = 50_000 + i;
    const ev = await evaluarDecision(validadoSinChequeos(m), plan, varianteFalsa, { replicasIniciales: 20, tanda: 20, replicasMax: 400 });
    if (ev.recomendacion === 3) recomendo3++;
  }
  const tasa = recomendo3 / N, ee = Math.sqrt((0.025 * 0.975) / N);
  assert.ok(tasa <= 0.025 + 3 * ee, `recomendó 3 (que está justo en la meta) en ${(tasa * 100).toFixed(2)}% de ${N} decisiones; el máximo es 2,5% (+ 3 ee = ${((0.025 + 3 * ee) * 100).toFixed(2)}%)`);
});
