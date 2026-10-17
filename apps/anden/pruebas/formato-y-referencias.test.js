'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../js/formato.js');
const { REFERENCIAS } = require('../js/referencias.js');

test('leerNumero entiende cómo se escriben los números en Argentina', () => {
  assert.equal(F.leerNumero('1.126.149,40'), 1126149.4);
  assert.equal(F.leerNumero('1.535'), 1535);
  assert.equal(F.leerNumero('$ 3.900'), 3900);
  assert.equal(F.leerNumero('2,5'), 2.5);
  assert.equal(F.leerNumero('2.5'), 2.5);
  assert.equal(F.leerNumero('0.125'), 0.125);
  assert.equal(F.leerNumero('12,5 %'), 12.5);
  assert.equal(F.leerNumero('-355'), -355);
  assert.ok(Number.isNaN(F.leerNumero('abc')));
  assert.ok(Number.isNaN(F.leerNumero('')));
  assert.ok(Number.isNaN(F.leerNumero('1,2,3')));
});

test('formato en pesos, dólares y porcentaje', () => {
  const e = '\u00a0'; // espacio que no se corta
  assert.equal(F.pesos(1126149.4), `$${e}1.126.149`);
  assert.equal(F.pesos(27.62), `$${e}27,62`);
  assert.equal(F.pesos(0), `$${e}0`);
  assert.equal(F.pesos(-355), `−$${e}355`);
  assert.equal(F.usd(733.4, 0), `USD${e}733`);
  assert.equal(F.porcentaje(31.444), `31,4${e}%`);
  assert.equal(F.paraCampo(1126149.4), '1.126.149,4');
  assert.equal(F.fecha('2026-10-16'), '16-10-2026');
  assert.equal(F.fecha('2026-09'), 'sep-2026');
});

test('cada referencia tiene valor, unidad, fecha, tipo y fuente o método', () => {
  const claves = Object.keys(REFERENCIAS);
  assert.ok(claves.length > 30);
  for (const k of claves) {
    const r = REFERENCIAS[k];
    assert.equal(typeof r.valor, 'number', `${k}: valor`);
    assert.ok(r.unidad, `${k}: unidad`);
    assert.match(String(r.fecha), /^\d{4}(-\d{2}){0,2}$/, `${k}: fecha`);
    assert.ok(['HECHO', 'ESTIMACIÓN'].includes(r.tipo), `${k}: tipo`);
    if (r.tipo === 'HECHO') { assert.match(String(r.fuente), /^https:\/\//, `${k}: un HECHO necesita fuente`); }
    if (r.tipo === 'ESTIMACIÓN') { assert.ok(r.metodo, `${k}: una ESTIMACIÓN necesita método`); }
    if (r.fuente !== null) { assert.match(String(r.fuente), /^https:\/\//, `${k}: fuente`); }
  }
});
