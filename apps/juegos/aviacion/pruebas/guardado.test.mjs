// Guardado a prueba de todo y vuelta: validación y migración, formato compacto, ausencia decreciente y parte de la mañana.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';
import { redGrande } from '../herramientas/rendimiento.mjs';
import { correr } from '../herramientas/jugadores.mjs';

// El guardado v1 «bueno» del QA del prototipo (formato viejo) y sus 6 variantes rotas.
const V1 = { v: 1, cap: 1, semilla: 5, t0: Date.UTC(1929, 10, 1, 6), t: 600, dinero: 12345, niveles: {},
  rutas: [{ id: 'BHI-BUE', a: 'BUE', b: 'BHI', km: 553, balizas: false, minCarga: 0.3, esperaMax: 240, vuelos: 3, ingresos: 100, costos: 50, ocup: 0.5 }],
  aviones: [{ id: 1, tipo: 'golondrina', ruta: 'BHI-BUE', en: 'BUE', hacia: 'BHI', fase: 'tierra', resta: 15, dur: 15, carga: [], espera: null }],
  colas: { BUE: { 'BHI>correo': { d: 'BHI', c: 'correo', n: 12, tc: 500, p: 0, km: 575 } } }, transbordo: {}, acum: {}, tbAcum: {},
  stats: { entregas: { correo: 0, pasajeros: 0, carga: 0 }, transbordos: {}, perdidas: 0, ingresos: 0, gastos: 0 },
  hora24: Array(24).fill(0), horaIdx: 10, netoHora: 0, misiones: ['m1_primera'], clima: { combustible: 1, tormenta: null, ultimoDia: 0 }, sigId: 2, guardado: Date.now() };

test('restaurar valida, migra de v1 a v2 y nunca tira excepción con los 6 guardados rotos del QA', () => {
  const rotos = {
    soloVersion: '{"v":1}',
    sinAviones: JSON.stringify({ ...V1, aviones: undefined }),
    capitulo4: JSON.stringify({ ...V1, cap: 4 }),
    avionDesconocido: JSON.stringify({ ...V1, aviones: [{ ...V1.aviones[0], tipo: 'golondrina2' }] }),
    v0: JSON.stringify({ ...V1, v: 0 }),
    v2ConFormatoViejo: JSON.stringify({ ...V1, v: 2 }),
  };
  for (const [nombre, txt] of Object.entries(rotos)) {
    let r;
    assert.doesNotThrow(() => { r = M.restaurar(txt); }, nombre);
    assert.ok(r && r.error, `${nombre} devuelve { error }: ${JSON.stringify(r)?.slice(0, 80)}`);
  }
  for (const txt of ['{"v":1,"cap":1,"dinero":', 'hola', 'null', '[]', '{"v":1,"dinero":"12345"}']) assert.ok(M.restaurar(txt).error);
  // el v1 bueno se migra y sigue jugándose
  const s = M.restaurar(JSON.stringify(V1));
  assert.ok(!s.error, JSON.stringify(s));
  assert.equal(s.v, 2); assert.equal(s.dinero, 12345); assert.equal(s.aviones.length, 1); assert.equal(M.enEspera(s, 'BUE'), 12);
  for (let i = 0; i < 300; i++) M.paso(s);
  assert.ok(Number.isFinite(s.dinero) && s.stats.vuelos > 0);
});

test('un guardado de una versión mayor se rechaza sin modificarlo', () => {
  const txt = JSON.stringify({ ...JSON.parse(M.guardar(M.nuevoEstado(1))), v: 3 });
  const copia = txt.slice();
  const r = M.restaurar(txt);
  assert.equal(r.error, 'version');
  assert.equal(txt, copia);
});

// Sin las fracciones de demanda (no se guardan), un avión puede salir un paso antes o después y la partida diverge un poco: por
// eso la meta se mide en promedio, en partidas reales de 3 semillas, en dos momentos (capítulo 2 y capítulo 3).
test('guardar y restaurar conserva el estado y, en promedio, el mismo dinero ±1% tras un día de juego', () => {
  let suma = 0, n = 0;
  for (const semilla of [1, 2, 3]) for (const minutos of [12, 20]) {
    const s = correr('novato', { semilla, minutos }).estado;
    const t = M.restaurar(M.guardar(s));
    assert.ok(!t.error);
    assert.equal(t.rutas.length, s.rutas.length); assert.equal(t.aviones.length, s.aviones.length); assert.equal(t.t, s.t);
    assert.ok(Math.abs(t.dinero - s.dinero) < 1);
    assert.deepEqual(t.misiones, s.misiones);
    for (let i = 0; i < 1440 / M.PASO; i++) { M.paso(s); M.paso(t); }
    suma += Math.abs(t.dinero - s.dinero) / Math.abs(s.dinero); n++;
  }
  assert.ok(suma / n <= 0.01, `diferencia media ${(suma / n * 100).toFixed(2)}%`);
});

test('formato compacto: un capítulo 3 con 300 aviones pesa menos de 50 KB y no guarda las fracciones de demanda', () => {
  const s = redGrande();
  for (let i = 0; i < 288; i++) M.paso(s);
  const txt = M.guardar(s);
  assert.ok(txt.length < 50 * 1024, `${(txt.length / 1024).toFixed(1)} KB`);
  const o = JSON.parse(txt);
  assert.equal(o.acum, undefined); assert.equal(o.tbAcum, undefined);
  const t = M.restaurar(txt);
  assert.ok(!t.error);
  assert.equal(t.aviones.length, 300);
  let n1 = 0, n2 = 0;
  for (const ap in s.colas) n1 += M.enEspera(s, ap);
  for (const ap in t.colas) n2 += M.enEspera(t, ap);
  assert.equal(n1, n2, 'las colas no pierden unidades');
});

test('empaquetado de enteros: ida y vuelta exacta, con negativos y números grandes', () => {
  const nums = [0, 1, -1, 31, 32, -33, 1023, 123456789, -987654321, 5, 0];
  assert.deepEqual(M.desempacar(M.empacar(nums)), nums);
  assert.throws(() => M.desempacar('$$'));
});

test('la ausencia rinde menos cada vez, nunca más que jugar el mismo tiempo, y nada después de 24 h', () => {
  assert.equal(M.rindeAusencia(3600), 1800);
  assert.equal(M.rindeAusencia(2 * 3600), 3600);
  assert.equal(M.rindeAusencia(14 * 3600), 3600 + 12 * 3600 * 0.2);
  assert.equal(M.rindeAusencia(30 * 3600), M.rindeAusencia(24 * 3600));
  const base = correr('novato', { semilla: 1, minutos: 10 }).estado;
  const txt = M.guardar(base);
  const j = M.restaurar(txt), d0 = j.dinero;
  for (let i = 0; i < 2 * 1440 / M.PASO; i++) M.paso(j);
  const porDiaJugando = (j.dinero - d0) / 2;
  let antes = 0, ritmoAntes = Infinity;
  for (const h of [1, 6, 14, 30]) {
    const s = M.restaurar(txt);
    const r = M.simularAusencia(s, h * 3600);
    const jugando = porDiaJugando * h * 3600 * M.MIN_POR_SEG / 1440;
    assert.ok(r.neto <= jugando, `${h} h: ausente ${r.neto} contra jugando ${Math.round(jugando)}`);
    assert.ok(r.neto >= antes, 'más tiempo afuera no da menos');
    const ritmo = r.neto / h;
    assert.ok(ritmo <= ritmoAntes + 1, 'cada hora afuera rinde igual o menos que la anterior');
    antes = r.neto; ritmoAntes = ritmo;
    for (const k of ['entregas', 'aTiempo', 'perdidas', 'mejorRuta', 'misiones', 'noches']) assert.ok(k in r.parte, `parte.${k}`);
  }
});

test('una noche afuera (14 h) deja al menos un hito de misión al alcance del novato (semillas 1 a 3)', () => {
  for (const semilla of [1, 2, 3]) {
    const r = correr('novato', { semilla, minutos: 16, ausencias: [{ min: 10, horas: 14 }] });
    const despues = r.misiones.filter((m) => m.min >= 10);
    assert.ok(despues.length >= 1, `semilla ${semilla}: ninguna misión en la ausencia ni en los 6 minutos siguientes`);
  }
});

test('la ausencia se apaga con una bandera sin romper guardados', () => {
  const s = correr('novato', { semilla: 1, minutos: 5 }).estado;
  const txt = M.guardar(s);
  M.CONFIG.ausencia = false;
  try {
    const t = M.restaurar(txt);
    const d = t.dinero, tt = t.t;
    const r = M.simularAusencia(t, 6 * 3600);
    assert.equal(r.apagada, true); assert.equal(t.dinero, d); assert.equal(t.t, tt);
  } finally { M.CONFIG.ausencia = true; }
  assert.ok(M.simularAusencia(M.restaurar(txt), 6 * 3600).minutos > 0);
});
