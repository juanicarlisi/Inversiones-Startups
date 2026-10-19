// integracion/pruebas/s-estadistica-whitt.test.ts · Andén simulador, corte 1 · Integración: S08, S09 y S11 (corte-1.md §8).
// Va aparte de s-estadistica.test.ts solo para que las dos tandas corran en paralelo.
//   S08 · Whitt (1989): T · Var(L̄) en una M/M/1 con ρ = 0,8 (μ = 1) tiende a 2ρ(1 + ρ)/(1 − ρ)⁴ = 1.800. 200 réplicas de T = 200.000
//         con arranque estacionario: 1.800 tiene que caer en el intervalo del 95% de la varianza (χ² con 199 grados de libertad, por
//         Wilson-Hilferty). Es lo que dice cuánto tiempo hace falta simular para una precisión dada;
//   S09 · las mismas réplicas: L = ρ/(1 − ρ) = 4 dentro de 3,29 errores estándar (con arranque estacionario no hace falta calentar);
//   S11 · MSER-5 (experimentos/) sobre la serie PROMEDIO de 10 réplicas con arranque cargado (100 en el sistema, ρ = 0,9, L = 9): después
//         del corte, el sesgo de L en 40 macro-experimentos queda dentro de 3,29 errores estándar (maqueta: +0,017 ± 0,144).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cuantilNormal, mser5, resumirNumeros, serieMedia } from '../../experimentos/indice.ts';
import { crearMotorProduccion } from '../ensamblar.ts';
import { correrMM1 } from '../bateria/mm1.ts';

function media(xs: readonly number[]): number { let s = 0; for (const x of xs) s += x; return s / xs.length; }

test('S08 · S09: Whitt (T·Var(L̄) = 1.800) y L = 4 con arranque estacionario, M/M/1 ρ = 0,8, 200 réplicas de 200.000', () => {
  const R = 200, T = 200_000, rho = 0.8;
  const Ls: number[] = [];
  let iniciales = 0;
  for (let r = 0; r < R; r++) {
    const x = correrMM1(crearMotorProduccion, { id: 'whitt', lambda: rho, mu: 1, horizonte: T, inicial: 'estacionario' }, 20261061, r);
    Ls.push(x.L);
    iniciales += x.inicial;
  }
  const res = resumirNumeros(Ls, 0.95);
  const s2 = T * res.desvio * res.desvio;
  const teorico = (2 * rho * (1 + rho)) / ((1 - rho) * (1 - rho) * (1 - rho) * (1 - rho));
  // χ²(ν) por Wilson-Hilferty: ν (1 − 2/(9ν) + z √(2/(9ν)))³
  const nu = R - 1, z = cuantilNormal(0.95);
  const chi2 = (zz: number) => { const b = 1 - 2 / (9 * nu) + zz * Math.sqrt(2 / (9 * nu)); return nu * b * b * b; };
  const lo = (s2 * nu) / chi2(z), hi = (s2 * nu) / chi2(-z);
  const ee = res.desvio / Math.sqrt(R), zL = (res.media - rho / (1 - rho)) / ee;
  console.log(`S08 T·Var(L̄) = ${s2.toFixed(0)} con IC 95% [${lo.toFixed(0)}; ${hi.toFixed(0)}] (teórico ${teorico.toFixed(0)}) · ` +
    `S09 L = ${res.media.toFixed(4)} ± ${res.semiancho.toFixed(4)} (z = ${zL.toFixed(2)}) · media de la cantidad inicial ${(iniciales / R).toFixed(2)} (teórica 4)`);
  assert.ok(Math.abs(teorico - 1800) < 1e-9, `el valor teórico de Whitt tenía que ser 1.800 y dio ${teorico}`);
  assert.ok(lo <= teorico && teorico <= hi, `S08: 1.800 tiene que caer en el intervalo del 95% de T·Var(L̄) y el intervalo fue [${lo.toFixed(0)}; ${hi.toFixed(0)}]`);
  assert.ok(Math.abs(zL) <= 3.29, `S09: L tiene que estar a ≤ 3,29 errores estándar de 4 y dio ${res.media.toFixed(4)} (z = ${zL.toFixed(2)})`);
});

test('S11 · MSER-5 sobre la serie promedio de 10 réplicas con arranque cargado: sesgo de L dentro de 3,29 ee', () => {
  const MACRO = 40, REPLICAS = 10, L_REAL = 9, DT = 10, TN = 20_000;
  const sesgos: number[] = [], sinCorte: number[] = [], cortes: number[] = [];
  for (let k = 0; k < MACRO; k++) {
    const series: number[][] = [];
    for (let j = 0; j < REPLICAS; j++) {
      const x = correrMM1(crearMotorProduccion, { id: 'mser', lambda: 0.9, mu: 1, horizonte: TN, inicial: 100, serie: DT }, 20261071, k * REPLICAS + j);
      assert.equal(x.serie!.length, TN / DT, `la serie tenía que tener ${TN / DT} puntos`);
      series.push(x.serie!);
    }
    const d = mser5(serieMedia(series));                   // observaciones a descartar (múltiplo de 5)
    cortes.push(d);
    sesgos.push(media(series.map((y) => media(y.slice(d)))) - L_REAL);
    sinCorte.push(media(series.map((y) => media(y))) - L_REAL);
  }
  const con = resumirNumeros(sesgos, 0.95), sin = resumirNumeros(sinCorte, 0.95);
  const ee = con.desvio / Math.sqrt(MACRO);
  const orden = [...cortes].sort((a, b) => a - b);
  console.log(`S11 sesgo con MSER-5 ${con.media.toFixed(3)} ± ${con.semiancho.toFixed(3)} (ee ${ee.toFixed(3)}); sin corte ${sin.media.toFixed(3)} ± ` +
    `${sin.semiancho.toFixed(3)}; corte mediano ${orden[MACRO >> 1] * DT} (de ${orden[0] * DT} a ${orden[MACRO - 1] * DT}) unidades`);
  assert.ok(Math.abs(con.media) <= 3.29 * ee, `S11: el sesgo de L después de MSER-5 tiene que estar dentro de 3,29 ee y dio ${con.media.toFixed(3)} (ee ${ee.toFixed(3)})`);
  assert.ok(sin.media > con.media, `sin el corte el sesgo tendría que ser mayor (arranque con 100 en el sistema) y dio ${sin.media.toFixed(3)} contra ${con.media.toFixed(3)}`);
});
