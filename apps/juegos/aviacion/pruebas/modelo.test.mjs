// Pruebas del modelo: reglas de compra, ruteo por el hub (solo rutas con avión), factores de demanda, noche y balizas,
// primer minuto, promesa por tipo de carga, costos en tierra, tope del centro, pronóstico y lecturas para la interfaz.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';

const pasos = (s, n) => { const ev = []; for (let i = 0; i < n; i++) ev.push(...M.paso(s)); return ev; };
const dias = (s, n) => pasos(s, n * 1440 / M.PASO);
// Capítulo 1 con todas sus ciudades abiertas y plata de sobra (para armar redes de prueba).
function abierto(semilla = 3) {
  const s = M.nuevoEstado(semilla);
  M.tomarEventos(s);
  s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos'];
  s.colas = {}; s.dinero = 1e8;
  return s;
}

test('la primera ruta sale del hub y respeta alcance, existencia y ciudades bloqueadas', () => {
  const s = M.nuevoEstado();
  assert.equal(M.abrirRuta(s, 'MVD', 'ROS').error, 'desconectada');
  assert.equal(M.abrirRuta(s, 'BUE', 'SAO').error, 'bloqueada', 'San Antonio Oeste se abre con la misión del sur');
  assert.ok(M.abrirRuta(s, 'BUE', 'BHI').ok);
  assert.equal(M.abrirRuta(s, 'BUE', 'BHI').error, 'existe');
  assert.equal(M.abrirRuta(s, 'BUE', 'SCL').error, 'bloqueada');
  assert.equal(M.abrirRuta(s, 'BUE', 'ASU').error, 'bloqueada');
});

test('nuevoEstado arranca a las 09:00 con correo esperando para la primera misión', () => {
  const s = M.nuevoEstado(1);
  assert.equal(M.hora(s), 9);
  assert.ok(M.enEspera(s, 'BUE', 'correo') >= 20);
  assert.equal(M.misionActual(s).id, 'm1_primera');
  assert.ok(M.km('BUE', M.misionActual(s).b) <= 300, 'la primera ruta es corta');
});

test('el primer avión despega enseguida y el primer viaje deja neto positivo, en menos de 10 s reales', () => {
  const s = M.nuevoEstado(1);
  M.abrirRuta(s, 'BUE', 'MVD');
  const r = M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  assert.ok(r.ok);
  let despegue = null, aterrizaje = null, n = 0;
  while (!aterrizaje && n < 100) {
    for (const e of M.paso(s)) {
      if (e.tipo === 'despegue' && despegue === null) { despegue = n + 1; assert.ok(e.costo > 0 && e.ruta === 'BUE-MVD'); }
      if (e.tipo === 'aterrizaje' && !aterrizaje) aterrizaje = { paso: n + 1, ...e };
    }
    n++;
  }
  const seg = (p) => p * M.PASO / M.MIN_POR_SEG;
  assert.ok(seg(despegue) <= 3, `despega en ${seg(despegue)} s`);
  assert.ok(seg(aterrizaje.paso) <= 8, `el primer cobro llega ${seg(aterrizaje.paso)} s después de comprar`);
  assert.ok(aterrizaje.netoViaje > 0 && aterrizaje.ingreso > aterrizaje.netoViaje, 'el primer viaje gana plata');
  assert.equal(s.stats.ultimoVuelo, aterrizaje.netoViaje);
  assert.ok(M.gananciaDia(s) >= 0 || s.horaIdx < 2, 'la barra no muestra una pérdida por el primer vuelo');
});

test('listoParaCargar cuenta lo que espera a ese avión', () => {
  const s = M.nuevoEstado(1);
  M.abrirRuta(s, 'BUE', 'MVD');
  const av = M.comprarAvion(s, 'golondrina', 'BUE-MVD').avion;
  const r = M.resumenRuta(s, 'BUE-MVD');
  assert.equal(M.listoParaCargar(s, av.id), Math.min(30, r.esperan.ida));
  assert.ok(r.esperan.ida >= 20, 'el correo de la primera misión espera ese avión');
});

test('la primera noche avisa qué aviones se quedan parados y las primeras balizas cuestan la mitad', () => {
  const s = M.nuevoEstado(1);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  const r = s.rutas[0];
  const entera = M.costoBalizas(r), primera = M.costoBalizas(r, s);
  assert.equal(primera, Math.round(entera / 200) * 100);
  let ev = null;
  for (let i = 0; i < 400 && !ev; i++) ev = M.paso(s).find((e) => e.tipo === 'primeraNoche');
  assert.ok(ev, 'hubo evento de primera noche');
  assert.deepEqual(ev.aviones, [s.aviones[0].id]);
  M.ponerBalizas(s, r.id);
  M.abrirRuta(s, 'BUE', 'BHI');
  assert.equal(M.costoBalizas(s.rutas[1], s), M.costoBalizas(s.rutas[1]), 'el descuento es una sola vez');
});

test('la primera noche llega después de 2 viajes de ida y vuelta del primer avión', () => {
  const s = M.nuevoEstado(1);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  let aterrizajes = 0;
  for (let i = 0; i < 400; i++) {
    const ev = M.paso(s);
    aterrizajes += ev.filter((e) => e.tipo === 'aterrizaje').length;
    if (ev.some((e) => e.tipo === 'primeraNoche')) break;
  }
  assert.ok(aterrizajes >= 4, `aterrizajes antes de la noche: ${aterrizajes}`);
});

test('red() usa solo rutas con avión: una ruta vacía no se traga el tráfico', () => {
  const s = abierto();
  M.abrirRuta(s, 'BUE', 'MVD'); M.abrirRuta(s, 'BUE', 'ROS'); M.abrirRuta(s, 'MVD', 'ROS');
  M.comprarAvion(s, 'golondrina', 'BUE-MVD'); M.comprarAvion(s, 'golondrina', 'BUE-ROS');
  assert.equal(M.red(s).sig.MVD.ROS, 'BUE', 'MVD→ROS va por el hub porque MVD-ROS no tiene avión');
  M.comprarAvion(s, 'golondrina', 'MVD-ROS');
  assert.equal(M.red(s).sig.MVD.ROS, 'ROS', 'con avión, la ruta directa');
  const v = s.verRed;
  M.fijarCargaMinima(s, 'MVD-ROS', 0.3);
  assert.equal(s.verRed, v, 'cambiar la carga mínima no invalida la red');
  M.venderAvion(s, s.aviones.at(-1).id);
  assert.ok(s.verRed > v);
  assert.equal(M.red(s).sig.MVD.ROS, 'BUE');
});

test('a igual cantidad de escalas, el ruteo elige menos km', () => {
  const s = abierto();
  for (const [a, b] of [['BUE', 'ROS'], ['BUE', 'MVD'], ['ROS', 'COR'], ['MVD', 'COR']]) { M.abrirRuta(s, a, b); M.comprarAvion(s, 'tero', M.idRuta(a, b)); }
  assert.equal(M.red(s).sig.BUE.COR, 'ROS');
});

test('factores de demanda: escalas, conexiones de pasajeros y rodeos', () => {
  assert.equal(M.factorRed('correo', 1, 500, 500), 1);
  assert.ok(Math.abs(M.factorRed('correo', 2, 500, 500) - 1 / (1 + M.RED.escala)) < 1e-9);
  assert.ok(Math.abs(M.factorRed('carga', 3, 500, 500) - 1 / (1 + 2 * M.RED.escala)) < 1e-9);
  assert.equal(M.factorRed('pasajeros', 2, 500, 500), M.RED.conexionPax);
  assert.equal(M.factorRed('pasajeros', 4, 500, 500), 0, 'más de 3 tramos: ningún pasajero');
  assert.ok(Math.abs(M.factorRed('correo', 1, 500, 1000) - 0.25) < 1e-9, '(km directo / km recorrido)²');
});

test('lo que esperaba por una ruta que se queda sin aviones se re-rutea o se cuenta como trabado', () => {
  const s = abierto();
  M.abrirRuta(s, 'BUE', 'MVD'); M.abrirRuta(s, 'BUE', 'BHI');
  M.comprarAvion(s, 'golondrina', 'BUE-MVD'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  dias(s, 1);
  const enBHI = M.enEspera(s, 'BUE') + M.enEspera(s, 'MVD');
  assert.ok(enBHI > 0);
  const perd0 = s.stats.perdidas;
  M.venderAvion(s, s.aviones.find((a) => a.ruta === 'BHI-BUE').id);
  assert.ok((s.stats.trabadas['BHI-BUE'] ?? 0) > 0, 'lo que iba a Bahía Blanca quedó trabado');
  assert.equal(s.stats.perdidas - perd0, s.stats.trabadas['BHI-BUE']);
  for (const ap in s.colas) for (const g of Object.values(s.colas[ap])) assert.notEqual(g.d, 'BHI');
});

test('el correo de Montevideo a Bahía Blanca pasa por el transbordo de Buenos Aires', () => {
  const s = abierto();
  M.abrirRuta(s, 'BUE', 'BHI'); M.abrirRuta(s, 'BUE', 'MVD');
  M.comprarAvion(s, 'golondrina', 'BHI-BUE'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  assert.equal(M.red(s).sig.MVD.BHI, 'BUE');
  dias(s, 3);
  assert.ok((s.stats.transbordos.BUE ?? 0) > 0, 'hubo transbordos en BUE');
  assert.ok(s.stats.entregas.correo > 0);
});

test('sin balizas el biplano no despega de noche; con balizas sí (y cuenta despegues nocturnos)', () => {
  const s = abierto();
  M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  let nocturnos = 0, despegues = 0;
  const contar = () => { for (let i = 0; i < 3 * 1440 / M.PASO; i++) for (const e of M.paso(s)) if (e.tipo === 'despegue') { despegues++; if (M.esNoche(s)) nocturnos++; } };
  contar();
  assert.ok(despegues > 0); assert.equal(nocturnos, 0); assert.equal(s.stats.despNoche, 0);
  M.ponerBalizas(s, 'BHI-BUE'); nocturnos = 0; contar();
  assert.ok(nocturnos > 0); assert.ok(s.stats.despNoche > 0);
});

test('promesa por tipo de carga: el correo tarde paga el 40%, la carga el 60%; los pasajeros no tienen promesa de llegada', () => {
  assert.equal(M.puntualidad('correo', 60 * (8 + 300 / 150), 300), 1);
  assert.equal(M.puntualidad('correo', 60 * (8 + 300 / 150) + 1, 300), 0.4);
  assert.equal(M.puntualidad('correo', 48 * 60, 300), 0.4, '48 h de atraso ya no cobran el 83%');
  assert.equal(M.puntualidad('carga', 60 * (24 + 600 / 300), 600), 1);
  assert.equal(M.puntualidad('carga', 60 * (24 + 600 / 300) + 1, 600), 0.6);
  assert.equal(M.puntualidad('pasajeros', 99999, 300), 1);
});

test('los pasajeros que esperan más de 3 h se pierden y se cuentan por ciudad', () => {
  const s = abierto();
  s.cap = 2; s.t0 = Date.UTC(1946, 2, 1, 9, 0) - s.t * 60000;
  M.abrirRuta(s, 'BUE', 'SCL');
  M.comprarAvion(s, 'chaja', 'BUE-SCL');
  s.aviones[0].resta = 1e9; // el avión no sale: los pasajeros esperan
  dias(s, 1);
  assert.ok((s.stats.perdidasAp.BUE ?? 0) > 0 && (s.stats.perdidasAp.SCL ?? 0) > 0);
  for (const ap of ['BUE', 'SCL']) for (const g of Object.values(s.colas[ap] ?? {})) if (g.c === 'pasajeros') assert.ok(s.t - g.tl <= M.PROMESA.pasajeros.esperaMax);
});

test('costo en tierra: un avión parado cuesta por hora y resumenRuta lo expone', () => {
  const s = abierto();
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  s.aviones[0].resta = 1e9;
  const d0 = s.dinero;
  pasos(s, 12); // una hora
  assert.ok(Math.abs((d0 - s.dinero) - M.AV.golondrina.tierraHora) < 1e-6);
  const r = M.resumenRuta(s, 'BUE-MVD');
  assert.equal(r.costoHoraParado, M.AV.golondrina.tierraHora);
  assert.ok(r.costoDespegue > 0);
  assert.equal(r.ingresoMedio, 0);
  assert.ok(typeof r.esperan.ida === 'number' && typeof r.capacidadHora === 'number');
});

test('la cola del centro de transbordo admite 6 h de su capacidad: lo demás se pierde', () => {
  const s = abierto();
  for (const d of ['MVD', 'ROS', 'MDQ', 'BHI']) { M.abrirRuta(s, 'BUE', d); for (let i = 0; i < 3; i++) M.comprarAvion(s, d === 'BHI' ? 'tero' : 'golondrina', M.idRuta('BUE', d)); M.ponerBalizas(s, M.idRuta('BUE', d)); }
  let max = 0;
  for (let i = 0; i < 3 * 1440 / M.PASO; i++) { M.paso(s); max = Math.max(max, M.enTransbordo(s, 'BUE')); }
  assert.ok(max <= M.COLA_TB_HORAS * M.capacidadTransbordo(s, 'BUE'), `máximo en el centro: ${max}`);
  assert.ok((s.stats.perdidasAp.BUE ?? 0) > 0);
});

test('el pronóstico aparece al menos 5 h antes de que la tormenta cierre aeropuertos', () => {
  let vistas = 0;
  for (let semilla = 1; semilla <= 6; semilla++) {
    const s = abierto(semilla);
    for (const [a, b] of [['BUE', 'BHI'], ['BHI', 'SAO'], ['SAO', 'REL'], ['REL', 'CRD'], ['BUE', 'MVD']]) { M.abrirRuta(s, a, b); M.comprarAvion(s, b === 'CRD' ? 'tero' : 'golondrina', M.idRuta(a, b)); }
    const vistos = new Map();
    for (let i = 0; i < 20 * 1440 / M.PASO; i++) for (const e of M.paso(s)) {
      if (e.tipo === 'pronostico') vistos.set(e.desde, s.t);
      if (e.tipo === 'tormenta') { vistas++; const t = [...vistos.entries()].find(([d]) => d <= s.t)?.[1]; assert.ok(t !== undefined && s.t - t >= 300, 'pronóstico con 5 h'); }
    }
  }
  assert.ok(vistas > 0, 'hubo tormentas para probar');
});

test('flujoTramo e indicadoresHub devuelven lo que la interfaz necesita', () => {
  const s = abierto();
  for (const d of ['MVD', 'ROS', 'BHI']) { M.abrirRuta(s, 'BUE', d); M.comprarAvion(s, d === 'BHI' ? 'tero' : 'golondrina', M.idRuta('BUE', d)); M.ponerBalizas(s, M.idRuta('BUE', d)); }
  dias(s, 3);
  const f = M.flujoTramo(s, 'BUE-MVD');
  for (const k of ['ida', 'vuelta']) {
    const x = f[k];
    assert.ok(x.locales > 0 && x.conexion > 0, 'pasan unidades locales y en conexión');
    assert.ok(Math.abs(x.pasan - x.locales - x.conexion) < 1e-9);
    assert.ok(x.capacidad > 0 && x.perdidas >= 0);
  }
  assert.equal(typeof f.trabadas, 'number');
  const h = M.indicadoresHub(s, 'BUE');
  assert.ok(h.aTiempo7d > 0 && h.aTiempo7d <= 1);
  assert.ok(h.ocupacion > 0 && h.ocupacion <= 1);
  assert.ok(h.perdidaDia >= 0 && h.horasAtraso >= 0 && h.costoUnidad > 0);
});

test('un jugador simple gana plata en el capítulo 1 y la simulación queda acotada', () => {
  const s = M.nuevoEstado(7);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  const dinero0 = s.dinero;
  dias(s, 5);
  assert.ok(s.dinero > dinero0, `ganó plata (${dinero0} → ${s.dinero})`);
  for (const ap of Object.keys(s.colas)) for (const g of Object.values(s.colas[ap])) assert.ok(Number.isFinite(g.n) && g.n >= 0 && g.n < 1000);
  assert.ok(Number.isFinite(s.dinero));
});

test('comprar exige dejar en la caja el combustible de un vuelo y una noche de la flota parada', () => {
  const s = M.nuevoEstado(1);
  M.abrirRuta(s, 'BUE', 'MVD');
  s.dinero = M.AV.golondrina.precio + 10;
  assert.equal(M.puedeComprar(s, 'golondrina', 'BUE-MVD').error, 'reserva');
  s.dinero = M.AV.golondrina.precio + M.reserva(s, { t: M.AV.golondrina, r: s.rutas[0] });
  assert.ok(M.puedeComprar(s, 'golondrina', 'BUE-MVD').ok);
});
