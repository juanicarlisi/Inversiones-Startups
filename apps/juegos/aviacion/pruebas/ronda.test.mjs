// Ronda nocturna: la escena aislada (metas del paso 1), la integración en el hub (paso 2) y la ronda del día.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../js/ronda.js';
import * as M from '../js/modelo.js';

test('escena de referencia: 6 radios de 30 sacas y un centro de 40/h; metas del paso 1 en 200 noches', () => {
  const e = R.escenaReferencia(1);
  assert.equal(e.radios.length, 6); assert.equal(e.centro, 40);
  assert.ok(e.radios.every((x) => x.sacas === 30)); assert.equal(e.orden.length, 180);
  let sacas = 0, auto = 0, plan = 0, ingA = 0, ingP = 0, auto120 = 0;
  for (let n = 1; n <= 200; n++) {
    const x = R.escenaReferencia(n);
    const a = R.simular(x), p = R.simular(x, R.planSugerido(x)), a120 = R.simular(R.escenaReferencia(n, { centro: 120 }));
    sacas += a.sacas; auto += a.aTiempo; plan += p.aTiempo; ingA += a.ingreso; ingP += p.ingreso; auto120 += a120.aTiempo;
    assert.ok(p.ingreso >= a.ingreso, 'el plan sugerido nunca rinde menos que el automático');
  }
  assert.ok(auto / sacas <= 0.70, `automático ${(auto / sacas * 100).toFixed(1)}%`);
  assert.ok(plan / sacas >= 0.95, `sugerido ${(plan / sacas * 100).toFixed(1)}%`);
  const dif = ingP / ingA - 1;
  assert.ok(dif >= 0.25 && dif <= 0.45, `diferencia de ingreso ${(dif * 100).toFixed(1)}%`);
  assert.ok(auto120 / sacas >= 0.85, `automático con centro de 120/h ${(auto120 / sacas * 100).toFixed(1)}%`);
});

test('dos controles a toques y un resultado que se lee sin texto', () => {
  const e = R.escenaReferencia(9);
  const r = R.nuevaRonda(e);
  assert.equal(R.resultado(r).pct, R.simular(e).pct, 'sin tocar, es el automático');
  const id = e.radios[3].id;
  R.alFrente(r, id);
  assert.equal(R.ordenVisible(r)[0], id);
  const antes = R.salidasActuales(r)[id];
  R.mover(r, id, +1); assert.equal(r.salidas[id], antes + R.GRILLA);
  R.mover(r, id, -1); R.mover(r, id, -1);
  assert.ok(r.salidas[id] >= Math.ceil(e.radios[3].listo / R.GRILLA) * R.GRILLA, 'nunca antes de que el avión esté listo');
  for (let i = 0; i < 80; i++) R.mover(r, id, +1);
  assert.equal(r.salidas[id], R.VENTANA, 'nunca después de las 07:00');
  for (const x of R.resultado(r).radios) assert.ok(['verde', 'amarillo', 'rojo'].includes(x.semaforo));
  assert.equal(R.medallaDe(1), 'oro'); assert.equal(R.medallaDe(0.9), 'plata'); assert.equal(R.medallaDe(0.7), 'bronce'); assert.equal(R.medallaDe(0.69), null);
});

// Estado con el banco del hub listo (capítulo 2, 3 rutas desde Buenos Aires) para probar la integración.
function conBanco(semilla = 2) {
  const s = M.nuevoEstado(semilla);
  M.tomarEventos(s);
  s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos', 'm1_caja'];
  s.cap = 2; s.t0 = Date.UTC(1946, 2, 1, 9, 0) - s.t * 60000; s.dia = M.diaCalendario(s); s.colas = {}; s.dinero = 1e7;
  for (const d of ['MVD', 'ROS', 'BHI', 'COR']) { M.abrirRuta(s, 'BUE', d); for (let i = 0; i < 2; i++) M.comprarAvion(s, d === 'BHI' || d === 'COR' ? 'tero' : 'golondrina', M.idRuta('BUE', d)); }
  return s;
}
const correrDias = (s, n, alAnunciar) => {
  const ev = [];
  for (let i = 0; i < n * 1440 / M.PASO; i++) for (const e of M.paso(s)) { ev.push({ ...e, t: s.t }); if (e.tipo === 'rondaDisponible' && alAnunciar) alAnunciar(s); }
  return ev;
};

test('el banco se habilita con 3 rutas iluminadas desde el hub y la ronda sale como mucho una noche de cada 3', () => {
  const s = conBanco();
  const ev = correrDias(s, 10);
  assert.ok(ev.some((e) => e.tipo === 'bancoListo'));
  const rondas = ev.filter((e) => e.tipo === 'rondaDisponible').map((e) => e.id);
  assert.ok(rondas.length >= 3);
  for (let i = 1; i < rondas.length; i++) assert.ok(rondas[i] - rondas[i - 1] >= M.RONDA_CADA, `noches ${rondas[i - 1]} y ${rondas[i]}`);
  const res = ev.filter((e) => e.tipo === 'resultadoNoche');
  assert.equal(res.length, rondas.length - (s.ronda.noche ? 1 : 0));
  for (const r of res) {
    for (const k of ['sacas', 'pctPrimeraHora', 'ingreso', 'ingresoAutomatico', 'medalla']) assert.ok(k in r, k);
    assert.equal(r.medalla, R.medallaDe(r.pctPrimeraHora));
  }
});

test('saltear la ronda nunca rinde menos que el automático (es el automático), y la API del banco es pura', () => {
  const a = conBanco(4), b = conBanco(4);
  correrDias(a, 6);
  correrDias(b, 6, (s) => { /* «saltear»: no se toca nada */ });
  assert.equal(Math.round(a.dinero), Math.round(b.dinero));
  // fuera de una noche de ronda, la API no hace nada
  const c = conBanco(5);
  assert.equal(M.fijarPrioridad(c, 'BUE', ['BUE-MVD']).error, 'sinRonda');
  assert.equal(M.moverSalida(c, 'BUE-MVD', 15).error, 'sinRonda');
  // en la noche, el plan sugerido se aplica y la noche se marca como jugada
  let jugada = null;
  correrDias(c, 4, (s) => { const p = M.planSugerido(s, 'BUE'); assert.ok(p.prioridad.length >= 3); assert.ok(M.aplicarPlan(s, p).ok); assert.ok(M.moverSalida(s, p.prioridad[0], 15).ok); });
  for (const r of c.ronda.historial) if (r.jugada) jugada = r;
  assert.ok(jugada, 'hubo una noche jugada');
});

test('la ronda del día: misma fecha, misma noche; fechas seguidas, noches distintas; medalla una vez por fecha y racha', () => {
  const hoy = Date.UTC(2026, 11, 3, 15), ayer = hoy - 86400000;
  assert.deepEqual(R.rondaDelDia(hoy), R.rondaDelDia(Date.UTC(2026, 11, 3, 1)));
  assert.notDeepEqual(R.rondaDelDia(hoy).radios.map((x) => [x.id, x.vuelo, x.listo]), R.rondaDelDia(ayer).radios.map((x) => [x.id, x.vuelo, x.listo]));
  let reg = R.registrarDia(null, ayer, 'plata').registro;
  const r1 = R.registrarDia(reg, hoy, 'bronce');
  assert.ok(r1.nueva); assert.equal(r1.medalla, 'bronce');
  const r2 = R.registrarDia(r1.registro, hoy, 'oro');
  assert.equal(r2.nueva, false); assert.equal(r2.medalla, 'bronce', 'los reintentos no cambian la medalla');
  assert.equal(R.racha(r2.registro, hoy), 2);
  assert.equal(R.racha(r2.registro, hoy + 2 * 86400000), 0);
  assert.ok(R.PREMIO_DIA.oro > 0 && R.PREMIO_DIA.oro < 10000, 'premio chico');
});
