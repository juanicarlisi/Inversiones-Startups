// HN-32: un chip confiable. Nunca compra para vender, no cambia de idea bajo el dedo, pide primero lo de la misión, avisa del cuello
// de botella, como mucho un consejo económico por día y, si no hay nada que se pague en 2 días, «×3 hasta juntar $X».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';
import { correr } from '../herramientas/jugadores.mjs';

const dias = (s, n) => { for (let i = 0; i < n * 1440 / M.PASO; i++) M.paso(s); };
const CAP1 = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos'];
function red(semilla = 1) {
  const s = M.nuevoEstado(semilla);
  M.tomarEventos(s);
  s.dinero = 1e6; s.misiones = [...CAP1]; s.flags.primeraNoche = true;
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  dias(s, 2);
  return s;
}

test('comprar y vender salen de la misma cuenta: el aporte de un avión recién comprado es lo que se estimó (±5%)', () => {
  for (const semilla of [1, 2, 3]) {
    const s = red(semilla);
    const casos = [['golondrina', 'BUE', 'ROS', true], ['golondrina', 'BUE', 'MVD', false], ['tero', 'BHI', 'CRD', true]];
    for (const [tipo, a, b, abrir] of casos) {
      if (abrir) M.abrirRuta(s, a, b);
      const id = M.idRuta(a, b), e = M.estimarAvion(s, tipo, id);
      const av = M.comprarAvion(s, tipo, id).avion;
      const p = M.aporteAvion(s, av);
      assert.ok(Math.abs(p - e) <= 0.05 * Math.abs(e) + 1, `semilla ${semilla}, ${tipo} en ${id}: estimado ${e}, aporte ${p}`);
    }
  }
});

test('histéresis: nunca sugiere vender un avión con menos de 2 días ni comprar donde se vendió uno el último día', () => {
  const s = red(4);
  for (let i = 0; i < 4; i++) M.comprarAvion(s, 'golondrina', 'BUE-MVD'); // de más: sobran
  const nuevos = new Set(s.aviones.slice(-4).map((a) => a.id));
  for (let i = 0; i < 1.9 * 1440 / M.PASO; i += 6) {
    for (let k = 0; k < 6; k++) M.paso(s);
    for (const d of M.decisiones(s)) if (d.tipo === 'vender') assert.ok(!nuevos.has(d.id), `sugiere vender el avión ${d.id} con ${((s.t - s.aviones.find((a) => a.id === d.id).desde) / 1440).toFixed(2)} días`);
  }
  // después de 2 días ya se puede juzgar
  dias(s, 0.3);
  const v = M.decisiones(s).find((d) => d.tipo === 'vender' && d.sobra);
  assert.ok(v, 'con 2 días, lo que sobra se puede vender');
  M.venderAvion(s, v.id);
  for (let i = 0; i < 0.9 * 1440 / M.PASO; i += 12) {
    for (let k = 0; k < 12; k++) M.paso(s);
    assert.ok(!M.decisiones(s).some((d) => d.tipo === 'avion' && d.ruta === 'BUE-MVD'), 'no se recompra en el día');
  }
});

test('la sugerencia económica se paga en 2 días o menos; nunca tiene efecto negativo ni deja la caja sin 2 vuelos', () => {
  let vistas = 0;
  for (const minutos of [3, 5, 7, 9, 12, 18, 24]) {
    const s = correr('soloChip', { semilla: 2, minutos, velMax: 1 }).estado;
    for (let i = 0; i < 60; i++) {
      s.chip = null; // qué elegiría como consejo del día en cada momento
      for (const c of [...s.contratos.tablero]) M.aceptarContrato(s, c.id); // sin contratos que ofrecer, aparece lo económico
      const x = M.sugerencia(s);
      if (x && !x.mision && !x.seguridad && !x.cuello && x.costo > 0 && x.tipo !== 'acelerar') {
        vistas++;
        assert.ok(x.costo <= 2 * x.efectoDia, `se paga en ${(x.costo / x.efectoDia).toFixed(1)} días: ${JSON.stringify(x)}`);
      }
      if (x) { assert.ok(x.efectoDia >= 0); if (x.costo > 0) assert.ok(s.dinero - x.costo >= M.reserva(s, null, 2, 0)); }
      M.paso(s);
    }
  }
  assert.ok(vistas > 0, 'hubo consejos económicos para revisar');
});

test('como mucho un consejo económico nuevo por día de juego (con el soloChip siguiéndolo)', () => {
  const r = correr('soloChip', { semilla: 1, minutos: 20, velMax: 1 });
  const s = r.estado;
  const consejos = [];
  let antes = null;
  for (let i = 0; i < 6 * 1440 / M.PASO; i++) {
    M.paso(s);
    if (i % 3) continue;
    const x = M.sugerencia(s);
    if (s.chip && s.chip.k !== antes) { consejos.push(s.chip.t); antes = s.chip.k; }
    if (x?.tipo === 'avion' && !x.mision && !x.seguridad) M.comprarAvion(s, x.id, x.ruta); // lo sigue
  }
  for (let i = 1; i < consejos.length; i++) assert.ok(consejos[i] - consejos[i - 1] >= 1440, `dos consejos a ${consejos[i] - consejos[i - 1]} min`);
});

test('si nada se paga en 2 días o no alcanza, el chip dice «×3 hasta juntar $X» (y nunca un consejo que no se paga)', () => {
  const s = red(5);
  s.dinero = 4000; // no alcanza para nada
  dias(s, 0.2);
  const x = M.sugerencia(s);
  assert.ok(x, 'el chip dice algo');
  if (x.tipo === 'acelerar') {
    assert.equal(x.vel, 3);
    assert.ok((x.meta != null && x.meta > s.dinero && x.falta > 0) || x.hasta > s.t, JSON.stringify(x));
    assert.ok(x.minutos > 0);
  } else assert.ok(x.mision || x.costo <= 0 || x.costo <= 2 * x.efectoDia, JSON.stringify(x));
});

test('misiones de transbordo: primero el centro de la ciudad de la misión, después rutas desde ahí', () => {
  // capítulo 2, «m2_conexiones» (transbordos en Buenos Aires) con el centro en 8/h y una cola que no da abasto
  const s = M.nuevoEstado(6);
  M.tomarEventos(s);
  s.misiones = [...CAP1, 'm1_caja', 'm2_pax', 'm2_andes', 'm2_red', 'm2_cauquen'];
  s.cap = 2; s.t0 = Date.UTC(1946, 2, 1, 9, 0) - s.t * 60000; s.dia = M.diaCalendario(s); s.colas = {}; s.dinero = 1e7;
  for (const d of ['MVD', 'ROS', 'COR', 'BHI']) { M.abrirRuta(s, 'BUE', d); for (let i = 0; i < 3; i++) M.comprarAvion(s, 'chaja', M.idRuta('BUE', d)); }
  dias(s, 1.5);
  assert.equal(M.misionActual(s).id, 'm2_conexiones');
  const x = M.sugerencia(s);
  assert.equal(x.tipo, 'transbordo'); assert.equal(x.id, 'BUE');
  // con el centro al máximo de lo que conviene, la sugerencia es abrir rutas desde Buenos Aires
  while (M.capacidadTransbordo(s, 'BUE') < 1000 && M.mejorarTransbordo(s, 'BUE').ok);
  dias(s, 0.5);
  const y = M.decisiones(s).find((d) => d.mision);
  assert.ok(y && (y.tipo === 'ruta' ? y.a === 'BUE' || y.b === 'BUE' : y.tipo === 'avion' || y.tipo === 'transbordo'), JSON.stringify(y));
});

test('el cuello de botella va primero cuando el centro del hub pierde más de lo que suma la misión', () => {
  const s = red(7);
  s.misiones = [...CAP1];
  for (const d of ['ROS', 'MDQ', 'COR']) { M.abrirRuta(s, 'BUE', d); for (let i = 0; i < 3; i++) M.comprarAvion(s, 'golondrina', M.idRuta('BUE', d)); }
  for (const r of s.rutas) M.ponerBalizas(s, r.id);
  for (let i = 0; i < 2; i++) M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  dias(s, 3); // el centro de 8/h no da abasto con 5 radios
  const x = M.sugerencia(s);
  assert.equal(x?.tipo, 'transbordo', JSON.stringify(x));
  assert.ok(x.cuello && x.id === 'BUE' && x.costo < M.gananciaDia(s));
});
