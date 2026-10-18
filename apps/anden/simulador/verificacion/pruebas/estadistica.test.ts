// Pruebas de verificacion/formulas/estadistica.ts: cuantiles de t con los valores de control de corte-1.md §7.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';
import { cuantilT, desvio, distribucionT, intervaloMedia, media } from '../formulas/estadistica.ts';

test('t(0,975; ν) reproduce los valores de control de §7', () => {
  const control: [number, number][] = [[1, 12.7062], [2, 4.3027], [5, 2.5706], [10, 2.2281], [19, 2.093], [30, 2.0423], [100, 1.984]];
  for (const [nu, t] of control) {
    const v = cuantilT(0.975, nu, matNativa);
    assert.ok(Math.abs(v - t) <= 5e-5, `ν = ${nu}: se esperaba ${t} y salió ${v}`);
  }
});

test('t de 0,95 y 0,995 con ν = 10 (tablas clásicas: 1,8125 y 3,1693)', () => {
  assert.ok(Math.abs(cuantilT(0.95, 10, matNativa) - 1.8125) <= 5e-5);
  assert.ok(Math.abs(cuantilT(0.995, 10, matNativa) - 3.1693) <= 5e-5);
});

test('con ν > 200 se usa Cornish-Fisher: la distribución exacta en ese cuantil da p con error < 1e-6', () => {
  for (const p of [0.95, 0.975, 0.995]) for (const nu of [201, 500, 10_000]) {
    const t = cuantilT(p, nu, matNativa);
    const F = distribucionT(t, nu, matNativa);
    assert.ok(Math.abs(F - p) < 1e-6, `p = ${p}, ν = ${nu}: F(${t}) = ${F}`);
  }
  for (const p of [0.95, 0.975, 0.995]) assert.ok(cuantilT(p, 201, matNativa) < cuantilT(p, 200, matNativa), 'la t baja con más grados de libertad');
  assert.ok(Math.abs(cuantilT(0.975, 1e9, matNativa) - 1.959963984540054) < 1e-8);
});

test('la distribución de t es simétrica y vale 0,5 en 0', () => {
  assert.ok(Math.abs(distribucionT(0, 7, matNativa) - 0.5) < 1e-15);
  assert.ok(Math.abs(distribucionT(1.3, 7, matNativa) + distribucionT(-1.3, 7, matNativa) - 1) < 1e-12);
});

test('media, desvío e intervalo de t sobre datos conocidos', () => {
  const xs = [2, 4, 4, 4, 5, 5, 7, 9];
  assert.equal(media(xs), 5);
  assert.ok(Math.abs(desvio(xs) - Math.sqrt(32 / 7)) < 1e-15);
  const iv = intervaloMedia(xs, matNativa);
  assert.ok(Math.abs(iv.semiancho - cuantilT(0.975, 7, matNativa) * Math.sqrt(32 / 7) / Math.sqrt(8)) < 1e-12);
  assert.equal(iv.n, 8);
});

test('errores con mensaje claro', () => {
  assert.throws(() => intervaloMedia([1], matNativa), /al menos 2 réplicas y llegaron 1/);
  assert.throws(() => media([]), /al menos un dato/);
  assert.throws(() => cuantilT(0.4, 3, matNativa), /0,5 < p < 1 y llegó 0.4/);
});
