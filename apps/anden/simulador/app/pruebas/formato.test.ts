// app/pruebas/formato.test.ts · P8 · números, porcentajes, moneda, horas y duraciones (es-AR primero, inglés con la misma forma).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearFormato, decimalesAuto, MENOS } from '../i18n/formato.ts';

const es = crearFormato('es'), en = crearFormato('en');

test('números es-AR: punto de miles y coma decimal (1.234,5)', () => {
  assert.equal(es.numero(1234.5, 1), '1.234,5');
  assert.equal(es.numero(1234567, 0), '1.234.567');
  assert.equal(es.numero(999, 0), '999');
  assert.equal(es.numero(0.5, 2), '0,50');
  assert.equal(es.numero(-1234.56, 1), `${MENOS}1.234,6`);
  assert.equal(es.numero(-0.04, 1), '0,0', 'un negativo que redondea a cero no lleva signo');
  assert.equal(en.numero(1234.5, 1), '1,234.5');
});

test('números con decimales automáticos: tres cifras significativas, sin ceros de más', () => {
  assert.equal(es.numero(2.4), '2,4');
  assert.equal(es.numero(0.05), '0,05');
  assert.equal(es.numero(0.0123), '0,0123');
  assert.equal(es.numero(12.345), '12,3');
  assert.equal(es.numero(3937.5), '3.938');
  assert.equal(es.numero(8000), '8.000');
  assert.equal(decimalesAuto(0), 0);
  assert.equal(decimalesAuto(7), 0);
});

test('valores no finitos se escriben sin romper la frase', () => {
  assert.equal(es.numero(Number.NaN), '—');
  assert.equal(es.numero(Infinity), '∞');
  assert.equal(es.numero(-Infinity), `${MENOS}∞`);
  assert.equal(es.porcentaje(Number.NaN), '—');
  assert.equal(es.moneda(Number.NaN, 'ARS'), '—');
  assert.equal(es.hora(Number.NaN), '—');
  assert.equal(es.duracion(Infinity), '—');
});

test('porcentajes: x en 0–1 → 12,5%', () => {
  assert.equal(es.porcentaje(0.125, 1), '12,5%');
  assert.equal(es.porcentaje(0.9), '90%');
  assert.equal(es.porcentaje(1), '100%');
  assert.equal(en.porcentaje(0.125, 1), '12.5%');
});

test('moneda: «$ 1.234» en pesos; centavos solo en montos chicos', () => {
  assert.equal(es.moneda(1234, 'ARS'), '$ 1.234');
  assert.equal(es.moneda(1234.4, 'ARS'), '$ 1.234');
  assert.equal(es.moneda(41.27, 'ARS'), '$ 41,27');
  assert.equal(es.moneda(1500, 'USD'), 'US$ 1.500');
  assert.equal(es.moneda(-7.24, 'ARS'), `${MENOS}$ 7,24`);
  assert.equal(en.moneda(1234, 'ARS'), 'ARS 1,234');
  assert.equal(en.moneda(1234, 'USD'), 'US$1,234');
});

test('hora: HH:MM módulo 24 (las 24:30 del modelo son las 00:30)', () => {
  assert.equal(es.hora(88_200_000), '00:30');
  assert.equal(es.hora(79_200_000), '22:00');
  assert.equal(es.hora(79_259_999), '22:00', 'redondea hacia abajo, como segAHora');
  assert.equal(es.hora(108_000_000), '06:00');
  assert.equal(es.hora(0), '00:00');
  assert.equal(es.hora(-60_000), '23:59');
});

test('duración: «1 h 05 min», «12 min», «45 s»', () => {
  assert.equal(es.duracion(3_900_000), '1 h 05 min');
  assert.equal(es.duracion(45_000), '45 s');
  assert.equal(es.duracion(720_000), '12 min');
  assert.equal(es.duracion(7_200_000), '2 h 00 min');
  assert.equal(es.duracion(0), '0 s');
  assert.equal(es.duracion(59_400), '59 s');
  assert.equal(es.duracion(59_600), '1 min', '59,6 s se dice «1 min», no «60 s»');
  assert.equal(es.duracion(-45_000), `${MENOS}45 s`);
  assert.equal(en.duracion(3_900_000), '1 h 05 min');
});

test('el formato dice su idioma', () => {
  assert.equal(es.idioma, 'es');
  assert.equal(en.idioma, 'en');
});
