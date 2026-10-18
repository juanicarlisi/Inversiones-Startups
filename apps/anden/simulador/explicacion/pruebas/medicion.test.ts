// Plan de medición: n = ⌈(1,96 · cv ÷ ε)²⌉ observaciones y minutos = ⌈n · segundos por observación ÷ 60⌉ (corte-1.md §9, P7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CV_POR_DEFECTO, ERROR_RELATIVO_POR_DEFECTO, Z_95, fraseDeMedicion, planDeMedicion } from '../medicion.ts';

test('cv 0,6 con error del 15% pide 62 observaciones (cuenta del diseño maestro §7.7)', () => {
  const p = planDeMedicion('induccionBase', 0.6, 0.15, 12);
  assert.equal(p.observaciones, 62, `se esperaban 62 observaciones y llegaron ${p.observaciones} ((1,96 · 0,6 ÷ 0,15)² = 61,47)`);
  assert.equal(p.minutos, 13, '62 observaciones de 12 s = 744 s = 12,4 min → 13');
  assert.equal(p.parametro, 'induccionBase');
  assert.equal(p.cv, 0.6);
  assert.equal(p.errorRelativo, 0.15);
});

test('otros valores de la fórmula, con el techo exacto en los enteros', () => {
  const caso = (cv: number, eps: number, n: number) => assert.equal(planDeMedicion('x', cv, eps, 10).observaciones, n, `cv ${cv}, ε ${eps}`);
  caso(0.35, 0.15, 21);    // (1,96·0,35/0,15)² = 20,9
  caso(1, 0.15, 171);      // 170,7
  caso(0.5, 0.15, 43);     // 42,68
  caso(0.5, 0.05, 385);    // 384,16
  caso(0.3, 0.1, 35);      // 34,57
  // exactamente entero: (1,96 · 0,75 ÷ 0,21)² = 49 (sin que la coma flotante lo suba a 50)
  caso(0.75, 0.21, 49);
  // cv 0 (no varía): una observación alcanza
  caso(0, 0.15, 1);
});

test('los minutos redondean para arriba y no se suben por el error de coma flotante', () => {
  assert.equal(planDeMedicion('x', 0.6, 0.15, 10).minutos, 11, '62 · 10 s = 620 s = 10,33 min');
  assert.equal(planDeMedicion('x', 0.75, 0.21, 60).minutos, 49, '49 · 60 s = 49 min justos');
  assert.equal(planDeMedicion('x', 0.6, 0.15, 1).minutos, 2, '62 s = 1,03 min');
});

test('constantes y mensajes: z = 1,96, error por defecto 15%, cv por defecto 0,5', () => {
  assert.equal(Z_95, 1.96);
  assert.equal(ERROR_RELATIVO_POR_DEFECTO, 0.15);
  assert.equal(CV_POR_DEFECTO, 0.5);
  const f = fraseDeMedicion(planDeMedicion('induccionBase', 0.6, 0.15, 12));
  assert.equal(f.clave, 'explicacion.medicion.resumen');
  assert.deepEqual(f.vars, { observaciones: 62, minutos: 13, error: 15 });
});

test('entradas inválidas: el error dice qué se esperaba y qué llegó', () => {
  assert.throws(() => planDeMedicion('x', -0.1, 0.15, 10), /se esperaba un coeficiente de variación finito y no negativo y llegó -0.1/);
  assert.throws(() => planDeMedicion('x', NaN, 0.15, 10), /coeficiente de variación/);
  assert.throws(() => planDeMedicion('x', 0.5, 0, 10), /se esperaba un error relativo mayor que 0 y llegó 0/);
  assert.throws(() => planDeMedicion('x', 0.5, 0.15, 0), /segundos por observación mayores que 0/);
  assert.throws(() => planDeMedicion('x', Infinity, 0.15, 10), /coeficiente de variación/);
});
