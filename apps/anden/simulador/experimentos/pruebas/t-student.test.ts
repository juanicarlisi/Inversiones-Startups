// Cuantiles de la t y de la normal (corte-1.md §7): valores de control, tabla contra valores publicados y contra el generador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cuantilNormal, cuantilT } from '../estadistica/t-student.ts';
import { cuantilTExacto, generarTablaT, lnGammaMedios } from '../estadistica/generar-tabla-t.ts';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';

const cerca = (real: number, esperado: number, tol: number, que: string) =>
  assert.ok(Math.abs(real - esperado) <= tol, `${que}: se esperaba ${esperado} (±${tol}) y salió ${real}`);

test('t(0,975; ν) para ν = 1, 2, 5, 10, 19, 30, 100 coincide con los controles de §7', () => {
  const controles: [number, number][] = [[1, 12.7062], [2, 4.3027], [5, 2.5706], [10, 2.2281], [19, 2.093], [30, 2.0423], [100, 1.984]];
  for (const [nu, esperado] of controles) cerca(cuantilT(0.95, nu), esperado, 5e-5, `t(0,975; ${nu})`);
});

test('la tabla coincide con los valores publicados (tablas de manual) a 4–6 decimales', () => {
  const publicados: [number, number, number][] = [
    // [confianza, ν, valor]
    [0.95, 1, 12.7062047362], [0.95, 2, 4.3026527297], [0.95, 3, 3.1824463053], [0.95, 4, 2.7764451052], [0.95, 5, 2.5705818356],
    [0.95, 10, 2.2281388520], [0.95, 19, 2.0930240544], [0.95, 20, 2.0859634473], [0.95, 30, 2.0422724563], [0.95, 50, 2.0085591121],
    [0.95, 100, 1.9839715185], [0.95, 200, 1.9718962236],
    [0.9, 1, 6.3137515147], [0.9, 2, 2.9199855804], [0.9, 10, 1.8124611228], [0.9, 30, 1.6972608866], [0.9, 100, 1.6602343261],
    [0.99, 1, 63.6567411629], [0.99, 2, 9.9248432009], [0.99, 10, 3.1692726726], [0.99, 30, 2.7499956536], [0.99, 100, 2.6258905214],
  ];
  for (const [c, nu, v] of publicados) cerca(cuantilT(c, nu), v, 5e-9, `t(${c}; ${nu})`);
});

test('ν = 2 tiene forma cerrada: t = (2p − 1) / √(2p(1 − p)) con p = 1 − α/2 (control independiente de la tabla)', () => {
  for (const c of [0.9, 0.95, 0.99]) {
    const p = 1 - (1 - c) / 2;
    cerca(cuantilT(c, 2), (2 * p - 1) / Math.sqrt(2 * p * (1 - p)), 1e-9, `t(${c}; 2) por la fórmula cerrada`);
  }
});

test('cuantiles normales exactos de §7', () => {
  assert.equal(cuantilNormal(0.9), 1.6448536269514722);
  assert.equal(cuantilNormal(0.95), 1.959963984540054);
  assert.equal(cuantilNormal(0.99), 2.5758293035489004);
});

test('la tabla es monótona decreciente en ν y tiende a z; las confianzas más altas dan t más grande', () => {
  for (const c of [0.9, 0.95, 0.99]) {
    for (let nu = 1; nu < 200; nu++) assert.ok(cuantilT(c, nu) > cuantilT(c, nu + 1), `t(${c}; ν) tiene que bajar entre ${nu} y ${nu + 1}`);
    assert.ok(cuantilT(c, 200) > cuantilNormal(c), 'la t con 200 grados todavía es mayor que z');
  }
  for (let nu = 1; nu <= 250; nu += 7) assert.ok(cuantilT(0.9, nu) < cuantilT(0.95, nu) && cuantilT(0.95, nu) < cuantilT(0.99, nu), `ν = ${nu}`);
});

test('para ν > 200 (Cornish-Fisher) la curva continúa la tabla sin saltos y coincide con el cuantil exacto', () => {
  for (const c of [0.9, 0.95, 0.99]) {
    const salto = cuantilT(c, 200) - cuantilT(c, 201);
    assert.ok(salto > 0 && salto < 2e-4, `t(${c}; 200) − t(${c}; 201) = ${salto}: se esperaba un escalón positivo y chico`);
    for (const nu of [201, 300, 500, 1000, 5000]) {
      cerca(cuantilT(c, nu), cuantilTExacto(c, nu, matNativa), 2e-6, `Cornish-Fisher t(${c}; ${nu}) contra el cuantil exacto`);
    }
  }
});

test('confianza no admitida y grados de libertad inválidos lanzan error con qué se esperaba y qué llegó', () => {
  assert.throws(() => cuantilT(0.97, 10), /0,90, 0,95 o 0,99 y llegó 0.97/);
  assert.throws(() => cuantilNormal(0.5), /confianza no admitida/);
  assert.throws(() => cuantilT(0.95, 0), /entero ≥ 1 y llegó 0/);
  assert.throws(() => cuantilT(0.95, 2.5), /entero ≥ 1 y llegó 2.5/);
  assert.throws(() => cuantilT(0.95, Number.NaN), /entero ≥ 1/);
});

test('tabla-t.json está al día: regenerarla con el generador da los mismos números (1e-9)', () => {
  const guardada = JSON.parse(readFileSync(new URL('../estadistica/tabla-t.json', import.meta.url), 'utf8')) as { t: Record<string, number[]>; nuMax: number };
  const nueva = generarTablaT(matNativa);
  assert.equal(guardada.nuMax, 200);
  for (const c of ['0.9', '0.95', '0.99']) {
    assert.equal(guardada.t[c].length, 200, `la columna ${c} tiene que tener 200 filas`);
    for (let i = 0; i < 200; i++) cerca(guardada.t[c][i], nueva.t[c][i], 1e-9, `tabla[${c}][ν=${i + 1}]`);
  }
});

test('ln Γ de enteros y semienteros del generador: Γ(5) = 24, Γ(1/2) = √π, Γ(5/2) = 3√π/4', () => {
  cerca(lnGammaMedios(10, matNativa), matNativa.log(24), 1e-13, 'ln Γ(5)');
  cerca(lnGammaMedios(1, matNativa), 0.5 * matNativa.log(Math.PI), 1e-13, 'ln Γ(1/2)');
  cerca(lnGammaMedios(5, matNativa), matNativa.log((3 * Math.sqrt(Math.PI)) / 4), 1e-13, 'ln Γ(5/2)');
  assert.throws(() => lnGammaMedios(0, matNativa), /entero ≥ 1/);
});
