// Pruebas del modelo: reglas, ruteo por el hub, noche y balizas, economía de un jugador simple y ausencia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';

const dias = (s, n) => { const ev = []; for (let i = 0; i < n * 1440 / M.PASO; i++) ev.push(...M.paso(s)); return ev; };

test('la primera ruta sale del hub y respeta el alcance', () => {
  const s = M.nuevoEstado();
  assert.equal(M.abrirRuta(s, 'BHI', 'SAO').error, 'desconectada');
  assert.equal(M.abrirRuta(s, 'BUE', 'RGL').error, 'alcance');
  assert.ok(M.abrirRuta(s, 'BUE', 'BHI').ok);
  assert.equal(M.abrirRuta(s, 'BUE', 'BHI').error, 'existe');
  assert.equal(M.abrirRuta(s, 'BUE', 'SCL').error, 'bloqueada');
});

test('el correo de Montevideo a Bahía Blanca pasa por el transbordo de Buenos Aires', () => {
  const s = M.nuevoEstado();
  M.abrirRuta(s, 'BUE', 'BHI'); M.abrirRuta(s, 'BUE', 'MVD');
  s.dinero = 1e6;
  M.comprarAvion(s, 'golondrina', 'BHI-BUE'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  assert.equal(M.red(s).sig.MVD.BHI, 'BUE');
  dias(s, 3);
  assert.ok((s.stats.transbordos.BUE ?? 0) > 0, 'hubo transbordos en BUE');
  assert.ok(s.stats.entregas.correo > 0);
});

test('sin balizas el biplano no despega de noche; con balizas sí', () => {
  const s = M.nuevoEstado();
  M.abrirRuta(s, 'BUE', 'BHI'); s.dinero = 1e6; M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  let despegues = 0, nocturnos = 0;
  const contar = () => { for (let i = 0; i < 3 * 1440 / M.PASO; i++) { const antes = s.rutas[0].vuelos; M.paso(s); if (s.rutas[0].vuelos > antes) { despegues++; if (M.esNoche(s)) nocturnos++; } } };
  contar();
  assert.ok(despegues > 0); assert.equal(nocturnos, 0);
  M.ponerBalizas(s, 'BHI-BUE'); despegues = 0; nocturnos = 0; contar();
  assert.ok(nocturnos > 0);
});

test('un jugador simple gana plata en el capítulo 1 y la simulación queda acotada', () => {
  const s = M.nuevoEstado(7);
  M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
  const dinero0 = s.dinero;
  dias(s, 5);
  assert.ok(s.dinero > dinero0, `ganó plata (${dinero0} → ${s.dinero})`);
  for (const ap of Object.keys(s.colas)) for (const g of Object.values(s.colas[ap])) assert.ok(Number.isFinite(g.n) && g.n >= 0 && g.n < 1000);
  assert.ok(Number.isFinite(s.dinero));
});

test('la ausencia rinde la mitad y nunca más de 2 horas reales', () => {
  const a = M.nuevoEstado(3), b = M.nuevoEstado(3);
  for (const s of [a, b]) { M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE'); M.ponerBalizas(s, 'BHI-BUE'); }
  const r = M.simularAusencia(a, 10 * 3600);
  assert.equal(r.minutos, M.AUSENCIA_MAX_H * 3600 * M.MIN_POR_SEG * M.AUSENCIA_RITMO);
  assert.ok(r.neto > 0 && r.extra > 0);
});

test('guardar y restaurar conserva el estado', () => {
  const s = M.nuevoEstado(); M.abrirRuta(s, 'BUE', 'BHI'); dias(s, 1);
  const r = M.restaurar(M.guardar(s));
  assert.equal(r.rutas.length, 1); assert.equal(r.t, s.t); assert.equal(r.dinero, s.dinero);
});
