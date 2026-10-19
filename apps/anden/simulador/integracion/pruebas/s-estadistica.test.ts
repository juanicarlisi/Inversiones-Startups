// integracion/pruebas/s-estadistica.test.ts · Andén simulador, corte 1 · Integración: S01, S02 y S03 (corte-1.md §8).
// La estadística de experimentos/ (P5) sobre corridas del motor de producción (P1): por qué Andén nunca calcula un intervalo con una
// sola corrida. Law (WSC 2023, §5.2): M/M/1 con λ = 1 y μ = 10/9 (W = 9 min), 15.000 min por corrida con 5.000 de calentamiento.
//   S01 · intervalo «ingenuo» con las estancias de UNA corrida tratadas como independientes → cobertura < 90% (tiene que fallar);
//   S02 · medias de 20 lotes de UNA corrida → cobertura < 90% (tiene que fallar);
//   S03 · 10 réplicas independientes con borrado del calentamiento → cobertura en [91,4%; 95,9%]: la real del IC de t con 10 réplicas
//         (93,6%, no el 95% nominal, porque las medias de réplica son asimétricas) ± 1,96 ee con 500 macro (integracion/bateria/
//         casos-estadistica.ts y NOTAS-CONTRATO.md §6; §8 pedía [93,1%; 96,9%]).
// Cada macro-experimento m corre 10 réplicas (semilla fija, réplicas 10m…10m+9). S01 y S02 usan la primera réplica de cada macro: son
// 500 corridas independientes entre sí, como en la maqueta (validacion.js), sin correrlas dos veces. S08, S09 y S11 están en
// s-estadistica-whitt.test.ts (archivo aparte para que corran en paralelo: las dos tandas juntas pasan los 100 millones de eventos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cuantilT, resumirNumeros } from '../../experimentos/indice.ts';
import { crearMotorProduccion } from '../ensamblar.ts';
import { correrMM1, type ConfigMM1 } from '../bateria/mm1.ts';
import { BANDA_S03 } from '../bateria/casos-estadistica.ts';

const SEMILLA = 20261019;
const MACRO = 500;
const REPLICAS = 10;
const W = 9;                                             // W = 1 / (μ − λ) = 1 / (10/9 − 1)
const LAW: ConfigMM1 = { id: 'law-cobertura', lambda: 1, mu: 10 / 9, horizonte: 15000, calentamiento: 5000, estancias: true };

function media(xs: readonly number[]): number { let s = 0; for (const x of xs) s += x; return s / xs.length; }
/** ¿El intervalo de t al 95% sobre `xs` (tratadas como independientes) cubre `valor`? Con el cuantil de experimentos/. */
function cubre(xs: readonly number[], valor: number): boolean {
  const n = xs.length, m = media(xs);
  let ss = 0; for (const x of xs) { const d = x - m; ss += d * d; }
  const semiancho = cuantilT(0.95, n - 1) * Math.sqrt(ss / (n - 1)) / Math.sqrt(n);
  return Math.abs(m - valor) <= semiancho;
}

test('S01 · S02 · S03: coberturas del intervalo del 95% (Law 2023 §5.2) con el motor de producción', () => {
  let ingenuo = 0, lotes = 0, replicacion = 0, observaciones = 0;
  for (let k = 0; k < MACRO; k++) {
    const medias: number[] = [];
    for (let j = 0; j < REPLICAS; j++) {
      const r = correrMM1(crearMotorProduccion, LAW, SEMILLA, k * REPLICAS + j);
      const ws = r.estancias!;
      assert.ok(ws.length > 8000, `la corrida ${k * REPLICAS + j} midió solo ${ws.length} estancias y se esperaban unas 10.000`);
      medias.push(media(ws));
      if (j === 0) {
        observaciones += ws.length;
        if (cubre(ws, W)) ingenuo++;
        const B = 20, b = Math.floor(ws.length / B), porLote: number[] = [];
        for (let i = 0; i < B; i++) porLote.push(media(ws.slice(i * b, (i + 1) * b)));
        if (cubre(porLote, W)) lotes++;
      }
    }
    // S03 con la función de resumen de experimentos/ (la misma que usa la interfaz)
    const r = resumirNumeros(medias, 0.95);
    if (r.ic[0] <= W && W <= r.ic[1]) replicacion++;
  }
  const c1 = ingenuo / MACRO, c2 = lotes / MACRO, c3 = replicacion / MACRO;
  console.log(`S01 cobertura ingenua ${(100 * c1).toFixed(1)}% · S02 lotes ${(100 * c2).toFixed(1)}% · S03 replicación ${(100 * c3).toFixed(1)}% ` +
    `(banda ${(100 * BANDA_S03.min).toFixed(1)}–${(100 * BANDA_S03.max).toFixed(1)}%; ${MACRO} macro, ${observaciones} estancias en S01)`);
  assert.ok(c1 < 0.9, `S01 tiene que FALLAR (cobertura < 90%: una sola corrida no da un intervalo) y dio ${(100 * c1).toFixed(1)}%`);
  assert.ok(c2 < 0.9, `S02 tiene que FALLAR (cobertura < 90% con 20 lotes de una corrida) y dio ${(100 * c2).toFixed(1)}%`);
  assert.ok(c3 >= BANDA_S03.min && c3 <= BANDA_S03.max, `S03: la cobertura con 10 réplicas independientes tiene que estar entre ${100 * BANDA_S03.min}% y ${100 * BANDA_S03.max}% y dio ${(100 * c3).toFixed(1)}%`);
});
