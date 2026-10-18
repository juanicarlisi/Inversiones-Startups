// hub/pruebas/estructuras.test.ts · P4 · El anillo (cola FIFO de Int32) y la rueda de tiempos del lazo, solos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearAnillo, Anillo } from '../estructuras/anillo.ts';
import { crearRueda, Rueda } from '../estructuras/rueda.ts';

test('anillo: FIFO, crece duplicando y conserva el orden al dar la vuelta', () => {
  const a = crearAnillo(2);
  const esperado: number[] = [];
  let siguiente = 0;
  // mezcla de poner y sacar para que el frente dé varias vueltas al arreglo mientras crece
  for (let ronda = 0; ronda < 50; ronda++) {
    for (let i = 0; i < 7; i++) { a.poner(siguiente); esperado.push(siguiente++); }
    for (let i = 0; i < 5; i++) assert.equal(a.sacar(), esperado.shift(), `ronda ${ronda}: se esperaba sacar en orden de llegada`);
    assert.equal(a.largo, esperado.length, 'el largo tiene que contar lo que queda');
  }
  for (let i = 0; i < esperado.length; i++) assert.equal(a.mirar(i), esperado[i], `mirar(${i})`);
  a.vaciar();
  assert.equal(a.largo, 0);
  assert.throws(() => a.sacar(), /vacía/);
});

test('anillo: rechaza lo que no es un entero de 32 bits y los índices fuera de rango', () => {
  const a = crearAnillo();
  assert.throws(() => a.poner(1.5), /entero de 32 bits/);
  assert.throws(() => a.poner(2 ** 31), /entero de 32 bits/);
  a.poner(-7);
  assert.equal(a.mirar(), -7);
  assert.throws(() => a.mirar(1), /entre 0 y 0/);
  assert.throws(() => crearAnillo(-1), /capacidad/);
});

test('anillo: estado y restaurar dan una copia independiente con el mismo contenido', () => {
  const a = new Anillo(8);
  for (let i = 0; i < 20; i++) a.poner(i * 3);
  for (let i = 0; i < 6; i++) a.sacar();
  const e = a.estado();
  const b = new Anillo();
  b.restaurar(e);
  a.poner(999); // el original sigue; la copia no se entera
  assert.equal(b.largo, 14);
  for (let i = 0; i < 14; i++) assert.equal(b.sacar(), (i + 6) * 3);
  assert.throws(() => b.restaurar({ buf: new Int32Array(10), ini: 0, n: 0 }), /potencia de dos/);
  assert.throws(() => b.restaurar({ buf: new Int32Array(8), ini: 0, n: 9 }), /«n»/);
});

test('rueda: entrega en el paso agendado, en orden de llegada, y vacía la ranura antes de llamar', () => {
  const r = crearRueda(5);
  r.agendar(2, 10); r.agendar(2, 11); r.agendar(4, 20); r.agendar(2, 12);
  const vistos: [number, number][] = [];
  const f = (paso: number) => (x: number) => vistos.push([paso, x]);
  assert.equal(r.tomar(0, f(0)), 0);
  r.agendar(5, 30); // con pasoActual = 0 ya entra el paso 5
  assert.equal(r.tomar(1, f(1)), 0);
  // en el paso 2, lo que se agenda para 2 + 5 = 7 cae en la misma ranura pero queda para la vuelta siguiente
  assert.equal(r.tomar(2, (x) => { vistos.push([2, x]); if (x === 10) r.agendar(7, 70); }), 3);
  assert.equal(r.tomar(3, f(3)), 0);
  assert.equal(r.tomar(4, f(4)), 1);
  assert.equal(r.tomar(5, f(5)), 1);
  assert.equal(r.tomar(6, f(6)), 0);
  assert.equal(r.tomar(7, f(7)), 1);
  assert.deepEqual(vistos, [[2, 10], [2, 11], [2, 12], [4, 20], [5, 30], [7, 70]]);
});

test('rueda: exige pasoActual < paso ≤ pasoActual + ranuras y no deja saltear pasos con elementos', () => {
  const r = new Rueda(4);
  assert.throws(() => r.agendar(4, 1), /\(-1, 3\]/);
  r.agendar(3, 1);
  assert.throws(() => r.tomar(-1, () => {}), /mayor que el último/);
  assert.throws(() => r.tomar(5, () => {}), /se salteó el paso 3/);
  r.tomar(3, () => {});
  assert.throws(() => r.agendar(3, 2), /\(3, 7\]/);
  // sin nada agendado, saltear pasos vale (el lazo sin actividad)
  assert.equal(r.tomar(100, () => {}), 0);
  r.agendar(104, 5);
  assert.throws(() => r.agendar(105, 5), /\(100, 104\]/);
  assert.throws(() => r.agendar(101, 0.5), /entero/);
});

test('rueda: reutiliza nodos, crece y su estado se restaura en otra rueda', () => {
  const r = new Rueda(7, 1);
  let total = 0, siguiente = 0;
  for (let paso = 0; paso < 200; paso++) {
    total += r.tomar(paso, () => {});
    for (let j = 0; j < 3; j++) r.agendar(paso + 1 + ((paso + j) % 7), siguiente++);
  }
  assert.equal(r.pendientes + total, siguiente, 'nada se pierde: tomados + pendientes = agendados');
  const copia = new Rueda(7);
  copia.restaurar(r.estado());
  const a: number[] = [], b: number[] = [];
  for (let paso = 200; paso < 210; paso++) { r.tomar(paso, (x) => a.push(x)); copia.tomar(paso, (x) => b.push(x)); }
  assert.deepEqual(b, a, 'la rueda restaurada entrega lo mismo en el mismo orden');
  assert.throws(() => new Rueda(8).restaurar(r.estado()), /largo 8/);
});
