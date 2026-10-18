// Pruebas de verificacion/flujo/monitores.ts: promedios ponderados por tiempo y conteos, exactos sobre secuencias hechas a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Conteos, PromediosTiempo } from '../flujo/monitores.ts';

test('promedio ponderado por tiempo: 0 en [0,10), 2 en [10,30), 1 en [30,40] → 50/40', () => {
  const p = new PromediosTiempo(1);
  p.poner(0, 2, 10); p.poner(0, 1, 30);
  assert.equal(p.media(0, 40), (0 * 10 + 2 * 20 + 1 * 10) / 40);
  assert.equal(p.areaHasta(0, 40), 50);
});

test('sumar acumula sobre el valor actual y reiniciar empieza otra ventana sin perder el valor', () => {
  const p = new PromediosTiempo(2);
  p.sumar(1, 1, 0); p.sumar(1, 1, 5); p.sumar(1, -1, 15);
  assert.equal(p.media(1, 20), (1 * 5 + 2 * 10 + 1 * 5) / 20);
  p.reiniciar(20);
  assert.equal(p.valor[1], 1);
  assert.equal(p.media(1, 30), 1);
  assert.ok(Number.isNaN(p.media(1, 20)), 'ventana de largo 0 → NaN');
  p.reiniciarIndice(0, 25);
  assert.equal(p.desde[0], 25);
  assert.equal(p.desde[1], 20);
});

test('conteos: media y suma de cuadrados', () => {
  const c = new Conteos(2);
  for (const x of [1, 2, 3, 6]) c.agregar(1, x);
  assert.equal(c.media(1), 3);
  assert.equal(c.suma2[1], 1 + 4 + 9 + 36);
  assert.ok(Number.isNaN(c.media(0)));
  c.reiniciar();
  assert.equal(c.cantidad[1], 0);
});

test('estado y restaurar: ida y vuelta exacta, sin compartir memoria', () => {
  const p = new PromediosTiempo(3);
  p.poner(2, 4, 7);
  const e = p.estado('x');
  const q = new PromediosTiempo(3);
  q.restaurar(e, 'x');
  assert.deepEqual(q.estado('x'), e);
  p.poner(2, 9, 8);
  assert.equal(q.valor[2], 4, 'la restauración copió los arreglos');
  const c = new Conteos(1); c.agregar(0, 5);
  const d = new Conteos(1); d.restaurar(c.estado('c'), 'c');
  assert.equal(d.media(0), 5);
});

test('restaurar rechaza estados mal formados diciendo qué esperaba', () => {
  const p = new PromediosTiempo(2);
  assert.throws(() => p.restaurar({ 'x.valor': new Float64Array(3) }, 'x'), /«x.valor» como Float64Array de largo 2 y llegó Float64Array/);
  assert.throws(() => p.restaurar({}, 'x'), /«x.valor» como Float64Array de largo 2 y llegó nada/);
});
