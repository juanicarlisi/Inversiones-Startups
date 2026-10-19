// app/pruebas/tablero.test.ts · P8 (lo sumó la integración, I-3) · el tablero en vivo cuenta lo mismo que dice la traza: paquetes en
// jaula y adentro en cada instante, rampas llenas, personas en pausa, lazo detenido y, desde el corte, cuántos no llegaron.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { EstadoRecursos, Reproductor } from '../../contratos/vistas.ts';
import { contarHasta, datosDeNoche, instanteDe } from '../ui/tablero.ts';

/** Una noche mínima: 5 paquetes (uno nunca nació: creado −1; uno no llega a jaula: listo −1), corte a los 100 s. */
function reproductorFalso(): Reproductor {
  const paquetes = {
    n: 5,
    creado: Float64Array.of(10_000, 20_000, -1, 30_000, 40_000),
    listo: Float64Array.of(50_000, 120_000, -1, -1, 90_000),
  };
  return { traza: { paquetes, corte: 100_000 } } as unknown as Reproductor;
}
const recursos = (o: Partial<EstadoRecursos> = {}): EstadoRecursos => ({
  pasoLazo: 0, lazoDetenido: false, rampaOcupacion: new Float32Array(3), rampaLlena: Uint8Array.of(0, 1, 1), filaAcumulacion: 7,
  puestoEstado: new Uint8Array(2), personaEstado: Uint8Array.of(0, 2, 1, 2), ...o,
});

test('contarHasta: cuántos valores de un arreglo ordenado son ≤ t (bordes incluidos)', () => {
  const xs = Float64Array.of(1, 2, 2, 5);
  assert.deepEqual([0, 1, 2, 3, 5, 9].map((t) => contarHasta(xs, t)), [0, 1, 3, 3, 4, 4]);
  assert.equal(contarHasta(new Float64Array(0), 10), 0);
});

test('datosDeNoche: solo los paquetes que nacieron, ordenados, y los pendientes al corte como en §6.9', () => {
  const d = datosDeNoche(reproductorFalso());
  assert.equal(d.total, 4, 'el paquete con creado −1 no cuenta');
  assert.deepEqual([...d.creados], [10_000, 20_000, 30_000, 40_000]);
  assert.deepEqual([...d.listos], [50_000, 90_000, 120_000]);
  // no llegan antes del corte: el que llega a los 120 s y el que nunca llega
  assert.equal(d.pendientesAlCorte, 2);
});

test('instanteDe: en jaula, adentro, fila, rampas llenas, personas en pausa y, desde el corte, cuántos no llegaron', () => {
  const d = datosDeNoche(reproductorFalso());
  const a = instanteDe(d, recursos(), 60_000);
  assert.deepEqual(a, { enJaula: 1, adentro: 3, fila: 7, rampasLlenas: 2, enPausa: 2, lazoDetenido: false, noLlegaron: null });
  const b = instanteDe(d, recursos({ lazoDetenido: true }), 100_000);
  assert.equal(b.enJaula, 2); assert.equal(b.adentro, 2); assert.equal(b.lazoDetenido, true);
  assert.equal(b.noLlegaron, 2, 'a la hora del corte ya se sabe cuántos no llegaron');
  const c = instanteDe(d, recursos(), 200_000);
  assert.equal(c.enJaula, 3); assert.equal(c.adentro, 1, 'el que nunca llega sigue adentro');
});
