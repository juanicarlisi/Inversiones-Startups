// Misiones honestas: miden servicio real desde que se activan, no traban, muestran avance y pista, y se premian en el mismo paso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';
import { MISIONES, AEROPUERTOS } from '../js/datos.js';
import { TEXTOS } from '../js/i18n.js';
import { correr } from '../herramientas/jugadores.mjs';

const dias = (s, n) => { for (let i = 0; i < n * 1440 / M.PASO; i++) M.paso(s); };

test('la cadena del capítulo 1 es la del diseño', () => {
  const c1 = MISIONES.filter((m) => m.cap === 1);
  assert.deepEqual(c1.map((m) => m.id), ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos', 'm1_caja']);
  const [p, seg, tb, no, sur, gal] = c1;
  assert.equal(p.tipo, 'ruta'); assert.ok(['MVD', 'ROS'].includes(p.b) && M.km(p.a, p.b) <= 300);
  assert.deepEqual([seg.tipo, seg.a, seg.b], ['ruta', 'BUE', 'BHI']);
  assert.equal(tb.tipo, 'transbordos'); assert.ok(tb.meta >= 15 && tb.meta <= 25, 'HN-30: 25 sacas o menos'); // y con correo en conexión esperando
  assert.ok(tb.conexion?.length >= 2 && tb.conexion.every(([o, d, n]) => o !== 'BUE' && d !== 'BUE' && n > 0));
  assert.ok(no.trasNoche, 'm1_noche espera la primera noche');
  assert.equal(no.tipo, 'despeguesNoche'); assert.ok(no.meta >= 3 && no.meta <= 5);
  assert.deepEqual([sur.tipo, sur.ciudad], ['entregasEn', 'CRD']); assert.ok(sur.meta >= 30 && sur.meta <= 60);
  assert.deepEqual([gal.tipo, gal.ciudad], ['entregasEn', 'RGL']);
});

// Estado con la misión «id» activa (todas las anteriores hechas) y sin aviones.
function conMision(id, cap = 1) {
  const s = M.nuevoEstado(5);
  M.tomarEventos(s);
  s.cap = cap; s.colas = {}; s.dinero = 1e9;
  s.misiones = MISIONES.slice(0, MISIONES.findIndex((m) => m.id === id)).map((m) => m.id);
  if (cap === 3) s.t0 = Date.UTC(1970, 0, 1, 9, 0) - s.t * 60000;
  M.paso(s); M.tomarEventos(s);
  assert.equal(M.misionActual(s).id, id);
  return s;
}

test('atajo prohibido: rutas sin aviones y balizas en una ruta vacía dejan en 0 las misiones que no son de ruta', () => {
  for (const m of MISIONES.filter((x) => x.cap === 1 && x.tipo !== 'ruta')) {
    const s = conMision(m.id);
    for (const [a, b] of [['BUE', 'BHI'], ['BHI', 'SAO'], ['SAO', 'REL'], ['REL', 'CRD']]) assert.ok(M.abrirRuta(s, a, b).ok, `${a}-${b}`);
    assert.ok(M.ponerBalizas(s, M.idRuta('REL', 'CRD')).ok);
    dias(s, 1);
    assert.equal(M.progreso(s, m), 0, `${m.id} no avanza sin servicio`);
    assert.ok(!M.misionHecha(s, m.id));
  }
  // capítulo 3: rutas vacías hacia Lima, La Paz, Quito y Bogotá no conectan el continente
  const s = conMision('m3_continente', 3);
  for (const [a, b] of [['BUE', 'LIM'], ['LIM', 'LPB'], ['LIM', 'UIO'], ['BOG', 'UIO'], ['BUE', 'SPA']]) assert.ok(M.abrirRuta(s, a, b).ok, `${a}-${b}`);
  dias(s, 1);
  assert.equal(M.progreso(s, MISIONES.find((m) => m.id === 'm3_continente')), 0);
});

test('m2_red cuenta ciudades con vuelos en el último día; m3_continente cuenta entregas reales', () => {
  const s = conMision('m2_red', 2);
  s.t0 = Date.UTC(1946, 2, 1, 9, 0) - s.t * 60000;
  M.abrirRuta(s, 'BUE', 'MVD'); M.abrirRuta(s, 'BUE', 'ROS');
  const red = MISIONES.find((m) => m.id === 'm2_red');
  assert.equal(M.progreso(s, red), 0);
  M.comprarAvion(s, 'chaja', 'BUE-MVD');
  dias(s, 0.5);
  assert.equal(M.progreso(s, red), 2, 'Buenos Aires y Montevideo tienen vuelos; Rosario no');
  const c = conMision('m3_continente', 3);
  const mc = MISIONES.find((m) => m.id === 'm3_continente');
  M.abrirRuta(c, 'BUE', 'SPA'); M.comprarAvion(c, 'halcon', 'BUE-SPA'); M.ponerBalizas(c, 'BUE-SPA');
  dias(c, 1);
  assert.ok(M.progreso(c, mc) > 0 && M.progreso(c, mc) <= mc.n, 'cuentan las entregas en São Paulo, hasta n por ciudad');
});

test('misionesActivas: historia y contratos, con progreso, avance y pista', () => {
  const s = M.nuevoEstado(2);
  let objs = M.misionesActivas(s);
  assert.equal(objs.length, 1);
  assert.equal(objs[0].tipo, 'historia'); assert.equal(objs[0].progreso, 0);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  M.paso(s);
  objs = M.misionesActivas(s);
  assert.ok(objs.length <= 3 && objs.length >= 2, 'con dos radios aparecen contratos');
  assert.equal(objs[0].id, 'm1_transbordo');
  for (const o of objs) {
    assert.ok(o.progreso >= 0 && o.progreso <= 1);
    assert.ok(o.avance && typeof o.avance.meta === 'number');
    assert.ok(typeof o.avanceTxt === 'string');
  }
  assert.equal(objs[0].pista, null);
  for (const av of s.aviones) av.resta = 1e9; // nada vuela: la misión no avanza
  for (let i = 0; i < 210 / M.PASO; i++) M.paso(s);
  assert.equal(M.misionesActivas(s)[0].pista, 'pista_m1_transbordo', 'después de 200 min sin avanzar hay pista');
});

test('ninguna misión queda cumplida sin premiarse en el mismo paso (perfil novato, semillas 1 a 3)', () => {
  for (const semilla of [1, 2, 3]) assert.equal(correr('novato', { semilla, minutos: 20 }).atrasoPremio, 0, `semilla ${semilla}`);
});

test('una acción que cumple una misión la premia en el acto', () => {
  const s = M.nuevoEstado(1);
  M.abrirRuta(s, 'BUE', 'MVD');
  const d0 = s.dinero;
  M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  assert.ok(M.misionHecha(s, 'm1_primera'));
  assert.equal(s.dinero, d0 - M.AV.golondrina.precio + MISIONES[0].premio);
  assert.ok(M.tomarEventos(s).some((e) => e.tipo === 'mision' && e.id === 'm1_primera'));
});

test('las metas de ganancia usan el mejor día, que no retrocede, y m3_caja tiene al menos 3 hitos', () => {
  const s = M.nuevoEstado(4);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  let max = 0;
  for (let i = 0; i < 3 * 1440 / M.PASO; i++) { M.paso(s); assert.ok(s.stats.mejorDia >= max); max = s.stats.mejorDia; }
  assert.ok(max >= M.gananciaDia(s));
  const hitos = MISIONES.filter((m) => m.cap === 3 && m.tipo === 'mejorDia');
  assert.ok(hitos.length >= 3);
  assert.ok(hitos.slice(0, -1).every((m) => m.premio > 0), 'cada hito con premio');
});

test('perfil literal, 15 min reales, semillas 1 y 2: ninguna misión del capítulo 1 se traba 5 minutos', () => {
  for (const semilla of [1, 2]) {
    const r = correr('literal', { semilla, minutos: 15 });
    const trabadas = r.trabadas.filter((t) => t.id.startsWith('m1_'));
    assert.deepEqual(trabadas, [], `semilla ${semilla}: ${JSON.stringify(trabadas)}`);
  }
});

test('perfil literal: el primer transbordo en Buenos Aires ocurre antes del minuto 3', () => {
  const r = correr('literal', { semilla: 1, minutos: 4 });
  assert.ok(r.primerTransbordo !== null && r.primerTransbordo < 180, `primer transbordo a los ${r.primerTransbordo} s`);
});

test('los textos y las pistas de todas las misiones existen en español y en inglés', () => {
  for (const m of MISIONES) for (const l of ['es', 'en']) {
    assert.ok(TEXTOS[l][m.id], `${l}: ${m.id}`);
    assert.ok(TEXTOS[l][`pista_${m.id}`], `${l}: pista_${m.id}`);
  }
  for (const k of ['contrato', 'contratoNavidad', 'primeraNoche', 'ventaForzada', 'pronostico', 'e_reserva', 'estado_ronda', 'parteTitulo', 'pista_ronda_centro', 'pista_noche', 'finHistoria', 'sug_ahorrar'])
    for (const l of ['es', 'en']) assert.ok(TEXTOS[l][k], `${l}: ${k}`);
  // las ciudades que se abren con una misión apuntan a misiones que existen
  for (const a of AEROPUERTOS) if (a.abre) assert.ok(MISIONES.some((m) => m.id === a.abre), a.id);
});
