// Contratos del día (linaje: subsidios de Transport Tycoon, 1994) y Correo de Navidad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';
import { correr } from '../herramientas/jugadores.mjs';

function conHub(semilla = 1) {
  const s = M.nuevoEstado(semilla);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  M.paso(s);
  return s;
}

test('tablero de 3 contratos, determinista por semilla, con al menos uno que pasa por el transbordo del hub', () => {
  const a = conHub(7), b = conHub(7), c = conHub(8);
  assert.equal(a.contratos.tablero.length, 3);
  assert.deepEqual(a.contratos.tablero, b.contratos.tablero, 'misma semilla, mismo tablero');
  assert.notDeepEqual(a.contratos.tablero.map((x) => [x.o, x.d, x.n]), c.contratos.tablero.map((x) => [x.o, x.d, x.n]));
  assert.ok(a.contratos.tablero.some((x) => x.hub && M.red(a).sig[x.o]?.[x.d] === 'BUE'));
  for (const x of a.contratos.tablero) assert.ok(x.n > 0 && x.dias > 0 && x.premio > 0);
});

test('el tablero se renueva cada día de juego, nunca por reloj real', () => {
  const s = conHub(3);
  const antes = JSON.stringify(s.contratos.tablero), dia = s.dia;
  let renovado = false;
  for (let i = 0; i < 1440 / M.PASO && !renovado; i++) if (M.paso(s).some((e) => e.tipo === 'contratosNuevos')) renovado = true;
  assert.ok(renovado); assert.ok(s.dia > dia); assert.notEqual(JSON.stringify(s.contratos.tablero), antes);
});

test('se aceptan hasta 2; solo cuentan las entregas reales del par pedido; cumplir paga en el mismo paso; vencer pierde el premio', () => {
  const s = conHub(5);
  const [x, y, z] = s.contratos.tablero;
  assert.ok(M.aceptarContrato(s, x.id).ok); assert.ok(M.aceptarContrato(s, y.id).ok);
  assert.equal(M.aceptarContrato(s, z.id).error, 'contratos');
  const objs = M.misionesActivas(s);
  assert.equal(objs.filter((o) => o.tipo === 'contrato' && !o.oferta).length, 2, 'misionesActivas los devuelve como secundarios');
  const c = s.contratos.activos[0];
  const entregasAntes = s.stats.entregasEn[c.d] ?? 0;
  let pagado = null;
  for (let i = 0; i < 3 * 1440 / M.PASO && !pagado; i++) {
    const d0 = s.dinero;
    const ev = M.paso(s);
    const e = ev.find((v) => v.tipo === 'contrato' && v.id === c.id);
    if (e) pagado = { e, d0, d1: s.dinero };
    const vivo = s.contratos.activos.find((v) => v.id === c.id);
    if (vivo) assert.ok(vivo.hechas <= (s.stats.entregasEn[c.d] ?? 0) - entregasAntes, 'nunca cuenta más que lo que llegó a destino');
  }
  if (pagado) assert.ok(pagado.d1 - pagado.d0 >= pagado.e.premio - 50000, 'el premio entra en el mismo paso');
  // vencimiento
  const t = conHub(9);
  const k = t.contratos.tablero[0];
  M.aceptarContrato(t, k.id);
  for (const av of t.aviones) av.resta = 1e9; // no vuela nada: no se puede cumplir
  let vencido = false;
  for (let i = 0; i < (k.dias + 1) * 1440 / M.PASO && !vencido; i++) if (M.paso(t).some((e) => e.tipo === 'contratoVencido' && e.id === k.id)) vencido = true;
  assert.ok(vencido);
  assert.ok(!t.contratos.activos.some((v) => v.id === k.id));
});

test('el Correo de Navidad aparece del 10 al 24 de diciembre (fecha del juego o del dispositivo) y paga ×1,8', () => {
  M.fijarFechaDispositivo(Date.UTC(2026, 11, 15));
  try {
    const s = conHub(4);
    const nav = s.contratos.tablero.find((x) => x.navidad);
    assert.ok(nav, 'hay un Correo de Navidad');
    assert.equal(nav.c, 'correo');
    assert.equal(M.factorTemporada(s, 'correo', true), 1.8);
    assert.equal(M.factorTemporada(s, 'correo'), 1, 'la demanda del juego sigue su propia fecha');
  } finally { M.fijarFechaDispositivo(null); }
  const t = conHub(4);
  assert.ok(!t.contratos.tablero.some((x) => x.navidad));
  t.t0 = Date.UTC(1929, 11, 12, 9, 0) - t.t * 60000; t.contratos.dia = null; t.dia = null;
  M.paso(t);
  assert.ok(t.contratos.tablero.some((x) => x.navidad), 'en el juego también');
});

// Los contratos cortos del comienzo (1 día, capítulo 1) se miden aparte: se cumplen en menos de 1,5 min (enseñan la mecánica).
test('perfil novato con contratos: cada contrato del día pide entre 2 y 5 minutos reales (mediana, semillas 1 a 3); los cortos, menos de 1,5', () => {
  const tiempos = [], cortos = [];
  for (const semilla of [1, 2, 3]) { const r = correr('novato', { semilla, minutos: 30 }); tiempos.push(...r.contratosMin); cortos.push(...r.contratosCortosMin); }
  tiempos.sort((a, b) => a - b); cortos.sort((a, b) => a - b);
  assert.ok(tiempos.length >= 5, `contratos cumplidos: ${tiempos.length}`);
  const mediana = tiempos[Math.floor(tiempos.length / 2)];
  assert.ok(mediana >= 2 && mediana <= 5, `mediana ${mediana} min (${tiempos.join(', ')})`);
  assert.ok(cortos.length >= 6, `contratos cortos cumplidos: ${cortos.length}`);
  assert.ok(cortos[Math.floor(cortos.length / 2)] <= 1.5, `cortos: ${cortos.join(', ')}`);
});
