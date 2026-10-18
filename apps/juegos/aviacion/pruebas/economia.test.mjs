// La mejor próxima acción y la red de seguridad: nunca sugiere algo que pierda ni algo que deje la caja sin 2 vuelos; nadie
// queda atrapado en la espiral (el novato nunca baja de 0; el que compra todo no queda en rojo más de 2 días seguidos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';
import { correr } from '../herramientas/jugadores.mjs';

const dias = (s, n) => { for (let i = 0; i < n * 1440 / M.PASO; i++) M.paso(s); };
const dosVuelos = (s) => M.reserva(s, null, 2, 0);

test('sugerencia en 3 estados fijos: abrir la ruta de la misión, ponerle avión y vender el avión que más pierde', () => {
  // 1) al arrancar: la ruta de la primera misión
  const s = M.nuevoEstado(1);
  let x = M.sugerencia(s);
  assert.deepEqual([x.tipo, x.a, x.b], ['ruta', 'BUE', 'MVD']);
  // 2) con la ruta abierta: su avión
  M.abrirRuta(s, 'BUE', 'MVD');
  x = M.sugerencia(s);
  assert.deepEqual([x.tipo, x.id, x.ruta], ['avion', 'golondrina', 'BUE-MVD']);
  assert.ok(x.efectoDia > 0 && x.costo === M.AV.golondrina.precio);
  // 3) caja por debajo de 2 vuelos y un día entero con neto negativo: vender el avión que más pierde
  const t = M.nuevoEstado(1);
  M.tomarEventos(t);
  t.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos']; t.dinero = 1e6;
  M.abrirRuta(t, 'BUE', 'MVD'); M.comprarAvion(t, 'golondrina', 'BUE-MVD');
  M.abrirRuta(t, 'BUE', 'MDQ');
  for (let i = 0; i < 4; i++) M.comprarAvion(t, 'golondrina', 'BUE-MDQ'); // demasiados aviones para Mar del Plata
  dias(t, 1);
  t.dinero = 500; t.flags.negDesde = t.t - 1500;
  x = M.sugerencia(t);
  assert.equal(x.tipo, 'vender');
  const av = t.aviones.find((a) => a.id === x.id);
  assert.equal(av.ruta, 'BUE-MDQ', 'el que más pierde está en la ruta con aviones de más');
  assert.ok(x.efectoDia > 0 && x.costo < 0);
});

test('la sugerencia nunca tiene efecto negativo ni deja la caja por debajo del costo de 2 vuelos', () => {
  const r = correr('listo', { semilla: 2, minutos: 12 });
  const s = r.estado;
  for (let i = 0; i < 200; i++) {
    const x = M.sugerencia(s);
    if (x) {
      assert.ok(x.efectoDia >= 0, JSON.stringify(x));
      if (x.costo > 0) assert.ok(s.dinero - x.costo >= dosVuelos(s), JSON.stringify(x));
    }
    M.paso(s);
  }
});

test('red de seguridad: un día entero en rojo vende los aviones que más pierden hasta volver a cero', () => {
  const s = M.nuevoEstado(1);
  M.tomarEventos(s);
  s.misiones = ['m1_primera', 'm1_segunda']; s.dinero = 1e6;
  M.abrirRuta(s, 'BUE', 'MDQ');
  for (let i = 0; i < 6; i++) M.comprarAvion(s, 'golondrina', 'BUE-MDQ');
  s.dinero = -20000;
  let ventas = 0;
  for (let i = 0; i < 2 * 1440 / M.PASO; i++) for (const e of M.paso(s)) if (e.tipo === 'ventaForzada') ventas++;
  assert.ok(ventas > 0);
  assert.ok(s.dinero >= 0 || s.aviones.length === 0);
});

test('piso del novato: semillas 1 a 3, en 30 minutos la caja nunca baja de 0 ni el neto es negativo más de 1 día seguido', () => {
  for (const semilla of [1, 2, 3]) {
    const r = correr('novato', { semilla, minutos: 30 });
    assert.ok(r.cajaMin30 >= 0, `semilla ${semilla}: caja mínima ${r.cajaMin30}`);
    assert.ok(r.negMaxDias30 <= 1, `semilla ${semilla}: ${r.negMaxDias30} días seguidos con neto negativo`);
  }
});

test('el que compra todo: en 30 minutos la caja nunca queda en rojo más de 2 días de juego seguidos', () => {
  const r = correr('compraTodo', { semilla: 1, minutos: 30 });
  assert.ok(r.rojoMaxDias30 <= 2, `${r.rojoMaxDias30} días en rojo`);
});

test('el primer avión del capítulo 1 se paga solo en 3 minutos reales o menos (perfil literal)', () => {
  const r = correr('literal', { semilla: 1, minutos: 5 });
  assert.ok(r.primerAvionRepago !== null && r.primerAvionRepago <= 3, `repago a los ${r.primerAvionRepago} min`);
});

test('primer minuto (perfil literal, velocidad 1): primer despegue y primer cobro en menos de 10 s desde «Empezar»', () => {
  for (const semilla of [1, 2, 3]) {
    const r = correr('literal', { semilla, minutos: 1 });
    assert.ok(r.primerCobro <= 10, `semilla ${semilla}: cobro a los ${r.primerCobro} s`);
    assert.ok(r.primerViajeNeto > 0);
  }
});
