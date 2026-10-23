// Flota de los capítulos 1 y 2 (HN-09): cada avión con su nicho, el desbloqueo como premio y el costo por ciclo según el tamaño.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';
import { AVIONES } from '../js/datos.js';
import { tabla, metas } from '../herramientas/flota.mjs';
import { correr } from '../herramientas/jugadores.mjs';

const C12 = AVIONES.filter((a) => a.cap <= 2);

test('cada avión de los capítulos 1 y 2 declara su nicho (tramo y carga)', () => {
  assert.deepEqual(C12.map((a) => a.id), ['golondrina', 'tero', 'chaja', 'cauquen']);
  for (const a of C12) {
    assert.ok(['corto', 'largo'].includes(a.nicho?.tramo), a.id);
    assert.ok(['correo', 'pasajeros'].includes(a.nicho?.carga), a.id);
  }
});

test('flota.mjs: el Tero y el Cauquén rinden entre 1,3 y 1,8 veces por $1.000 en su nicho; el Cauquén pierde en tramos cortos', () => {
  const t = tabla();
  for (const r of t) for (const k of ['por1000', 'repagoDias', 'repagoMin', 'equilibrio']) assert.ok(k in r, `${r.avion}/${r.ruta}: ${k}`);
  const m = metas(t);
  assert.ok(m.teroGolondrina >= 1.3 && m.teroGolondrina <= 1.8, `Tero/Golondrina ${m.teroGolondrina}`);
  assert.ok(m.cauquenChaja >= 1.3 && m.cauquenChaja <= 1.8, `Cauquén/Chajá ${m.cauquenChaja}`);
  assert.ok(m.golondrinaGanaCorto && m.chajaGanaCorto, 'fuera de su nicho, el grande no conviene');
  assert.ok(m.cauquenPierdeCorto, 'el Cauquén pierde plata en tramos de menos de 300 km');
  for (const [a, e] of Object.entries(m.equilibrioEnNicho)) assert.ok(e >= 0.45 && e <= 0.70, `${a}: equilibrio ${e}`);
});

test('el costo por ciclo crece con el tamaño (tasa de aterrizaje por tonelada)', () => {
  const orden = [...C12].sort((a, b) => a.ton - b.ton);
  for (let i = 1; i < orden.length; i++) assert.ok(M.costoCiclo(orden[i]) > M.costoCiclo(orden[i - 1]), orden[i].id);
});

test('Golondrina y Tero tienen ventana de venta y no se ofrecen en el capítulo 3', () => {
  for (const id of ['golondrina', 'tero']) {
    const a = M.AV[id];
    assert.deepEqual(a.venta, { desde: 1, hasta: 2 });
    const s = M.nuevoEstado(1);
    s.misiones = ['m1_noche']; s.cap = 3;
    assert.equal(M.avionDisponible(s, id), false, `${id} en el capítulo 3`);
    s.cap = 2;
    assert.equal(M.avionDisponible(s, id), true, `${id} en el capítulo 2`);
  }
});

test('el perfil listo compra al menos 2 tipos de avión distintos en el capítulo 2', () => {
  const r = correr('listo', { semilla: 1, minutos: 22 });
  const tipos = Object.keys(r.compras[2] ?? {});
  assert.ok(tipos.length >= 2, `capítulo 2: ${JSON.stringify(r.compras[2])}`);
});
