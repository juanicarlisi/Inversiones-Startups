// La colocación de rótulos del mundo (ui/rotulos.js) es una función pura: se prueba sin navegador.
//   cd apps/juegos/aviacion/v2 && node --test pruebas/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { colocar, LUGARES } from '../src/ui/rotulos.js';

const vista = { W: 1280, H: 720 };
const pisa = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const ciudad = (id, cx, cy, w, prio, extra = {}) => ({ id, x: cx, y: cy - 30, cx, cy, rx: 40, ry: 22, w, h: 28, prio, solido: true, ...extra });
const cajas = (rotulos, salida) => rotulos.filter((r) => salida.has(r.id)).map((r) => ({ id: r.id, ...salida.get(r.id), w: r.w, h: r.h }));

test('dos ciudades pegadas: los rótulos no se pisan y la base se queda con su lugar', () => {
  const rotulos = [ciudad('c-MVD', 860, 300, 150, 720, { pref: 'der' }), ciudad('c-BUE', 780, 300, 160, 1000)];
  const s = colocar(rotulos, [], vista);
  assert.equal(s.size, 2, 'entran los dos');
  assert.equal(s.get('c-BUE').lugar, 0, 'la base va arriba, centrada');
  const [a, b] = cajas(rotulos, s);
  assert.ok(!pisa(a, b), 'no se pisan');
});

test('ningún rótulo queda debajo de un panel fijo ni fuera de la pantalla', () => {
  const panel = { x0: 12, y0: 68, x1: 342, y1: 400 }, barra = { x0: 770, y0: 10, x1: 1268, y1: 58 };
  const rotulos = [ciudad('c-ROS', 100, 90, 70, 30), ciudad('c-COR', 360, 120, 80, 32), ciudad('c-X', 1000, 80, 120, 40), ciudad('c-Y', 1270, 400, 120, 40), ciudad('c-Z', 640, 14, 90, 40)];
  const s = colocar(rotulos, [panel, barra], vista);
  assert.ok(!s.has('c-ROS'), 'la ciudad tapada por el panel no lleva rótulo');
  for (const c of cajas(rotulos, s)) {
    for (const o of [panel, barra]) assert.ok(!pisa(c, { x: o.x0, y: o.y0, w: o.x1 - o.x0, h: o.y1 - o.y0 }), `${c.id} pisa un panel`);
    assert.ok(c.x >= 0 && c.y >= 0 && c.x + c.w <= vista.W && c.y + c.h <= vista.H, `${c.id} se sale de la pantalla`);
  }
  assert.ok(s.has('c-COR'), 'la ciudad que asoma al lado del panel conserva su rótulo, corrido');
});

test('muchas ciudades amontonadas: gana la prioridad y nunca hay dos rótulos encimados', () => {
  const rotulos = [];
  for (let i = 0; i < 14; i++) rotulos.push(ciudad(`c-${i}`, 500 + (i % 5) * 46, 300 + Math.floor(i / 5) * 34, 110 + (i % 3) * 20, i === 0 ? 1000 : i === 1 ? 900 : 100 - i));
  const s = colocar(rotulos, [], vista);
  assert.ok(s.has('c-0') && s.has('c-1'), 'la base y la ciudad de la misión siempre se ven');
  const cs = cajas(rotulos, s);
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) assert.ok(!pisa(cs[i], cs[j]), `${cs[i].id} pisa a ${cs[j].id}`);
});

test('un rótulo no tapa la ciudad de otro si tiene otro lugar', () => {
  // la base queda justo abajo y a la derecha de Rosario: su rótulo de arriba taparía la ciudad
  const rotulos = [ciudad('c-BUE', 780, 163, 150, 1000), ciudad('c-ROS', 700, 122, 66, 30)];
  const s = colocar(rotulos, [], vista);
  const b = { ...s.get('c-BUE'), w: 150, h: 28 }, ros = { x: 660, y: 122 - 22 * 1.3, w: 80, h: 22 * 2.3 };
  assert.ok(!pisa(b, ros), 'el rótulo de la base no tapa a Rosario');
});

test('con memoria, un rótulo no cambia de lugar por un cuadro libre (no titila)', () => {
  const memoria = new Map();
  const dos = () => [ciudad('c-A', 780, 300, 160, 1000), ciudad('c-B', 860, 300, 150, 700)];
  const lugar1 = colocar(dos(), [], vista, memoria, { ahora: 0 }).get('c-B').lugar;
  assert.notEqual(lugar1, 0);
  // se separan: el lugar de arriba queda libre, pero el rótulo espera antes de volver
  const lejos = () => [ciudad('c-A', 500, 300, 160, 1000), ciudad('c-B', 860, 300, 150, 700)];
  assert.equal(colocar(lejos(), [], vista, memoria, { ahora: 16 }).get('c-B').lugar, lugar1, 'no salta en el acto');
  assert.equal(colocar(lejos(), [], vista, memoria, { ahora: 300 }).get('c-B').lugar, lugar1, 'ni a los 300 ms');
  assert.equal(colocar(lejos(), [], vista, memoria, { ahora: 700 }).get('c-B').lugar, 0, 'vuelve arriba cuando el lugar lleva un rato libre');
  assert.ok(LUGARES.length >= 6);
});
