// El trabajador en proceso: habla el protocolo de mensajes-worker.ts (correr → resultado… → fin, error, cancelar, sonda).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trabajadorEnProceso, trabajadorEnProcesoCon } from '../en-proceso.ts';
import type { PuertoTrabajador, Simulador } from '../../contratos/experimentos.ts';
import type { MensajeDelTrabajador } from '../../contratos/mensajes-worker.ts';
import type { Traza } from '../../contratos/traza.ts';
import { esperar, esperarHasta, resultadoFalso, validadoEjemplo } from './ayudas.ts';

const mv = validadoEjemplo();
const sim: Simulador = (m, semilla, replica, o) => ({
  resultado: resultadoFalso({ semilla, replica, modelo: m.huella, kpi: { paquetes: replica } }),
  ...(o.traza === 'completa' ? { traza: { marca: 'traza' } as unknown as Traza } : {}),
});
function conectar(puerto: PuertoTrabajador): MensajeDelTrabajador[] {
  const recibidos: MensajeDelTrabajador[] = [];
  puerto.alRecibir((m) => recibidos.push(m));
  return recibidos;
}

test('correr: un resultado por réplica del rango, en orden, y al final «fin» con la cantidad', async () => {
  const puerto = trabajadorEnProceso(sim, 'prueba')();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'correr', id: 'k', mv, semilla: 5, desde: 3, hasta: 7, traza: 'no' });
  assert.equal(recibidos.length, 0, 'nunca responde en el mismo instante: como un Worker de verdad');
  await esperarHasta(() => recibidos.some((m) => m.tipo === 'fin'), 'llegue el fin');
  assert.deepEqual(recibidos.map((m) => m.tipo), ['resultado', 'resultado', 'resultado', 'resultado', 'fin']);
  const rs = recibidos.filter((m) => m.tipo === 'resultado');
  assert.deepEqual(rs.map((m) => m.tipo === 'resultado' && m.resultado.replica), [3, 4, 5, 6]);
  assert.ok(rs.every((m) => m.id === 'k' && !('traza' in m)));
  assert.deepEqual(recibidos[4], { tipo: 'fin', id: 'k', completadas: 4 });
  puerto.terminar();
});

test('la traza viaja con el resultado solo si el simulador la entregó', async () => {
  const puerto = trabajadorEnProceso(sim, 'prueba')();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'correr', id: 'k', mv, semilla: 5, desde: 0, hasta: 1, traza: 'completa' });
  await esperarHasta(() => recibidos.some((m) => m.tipo === 'fin'), 'llegue el fin');
  const r = recibidos[0];
  assert.ok(r.tipo === 'resultado' && (r.traza as unknown as { marca: string }).marca === 'traza');
  puerto.terminar();
});

test('sonda: responde «listo» con la versión del motor', async () => {
  const puerto = trabajadorEnProceso(sim, 'motor-7.7')();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'sonda' });
  await esperarHasta(() => recibidos.length === 1, 'llegue el listo');
  assert.deepEqual(recibidos[0], { tipo: 'listo', motor: 'motor-7.7' });
  puerto.terminar();
});

test('un simulador que lanza produce un mensaje «error» con el mensaje original y no sigue con las demás réplicas', async () => {
  const roto: Simulador = (m, s, r) => { if (r === 2) throw new Error('modelo inválido en la noche 2'); return sim(m, s, r, { traza: 'no' }); };
  const puerto = trabajadorEnProceso(roto, 'prueba')();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'correr', id: 'k', mv, semilla: 5, desde: 0, hasta: 10, traza: 'no' });
  await esperarHasta(() => recibidos.some((m) => m.tipo === 'error'), 'llegue el error');
  await esperar(15);
  assert.deepEqual(recibidos.map((m) => m.tipo), ['resultado', 'resultado', 'error']);
  assert.deepEqual(recibidos[2], { tipo: 'error', id: 'k', mensaje: 'modelo inválido en la noche 2' });
  puerto.terminar();
});

test('un rango inválido responde «error» en vez de colgarse', async () => {
  const puerto = trabajadorEnProceso(sim, 'prueba')();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'correr', id: 'k', mv, semilla: 5, desde: 7, hasta: 3, traza: 'no' });
  await esperarHasta(() => recibidos.length === 1, 'llegue el error');
  assert.deepEqual(recibidos[0], { tipo: 'error', id: 'k', mensaje: 'rango de réplicas inválido [7, 3)' });
  puerto.terminar();
});

test('cancelar entre réplicas: termina con «fin» parcial y no corre las que faltaban', async () => {
  let llamadas = 0;
  const contando: Simulador = (m, s, r) => { llamadas++; return sim(m, s, r, { traza: 'no' }); };
  const puerto = trabajadorEnProceso(contando, 'prueba')();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'correr', id: 'k', mv, semilla: 5, desde: 0, hasta: 500, traza: 'no' });
  await esperarHasta(() => recibidos.length >= 2, 'lleguen 2 resultados');
  puerto.enviar({ tipo: 'cancelar', id: 'k' });
  await esperarHasta(() => recibidos.some((m) => m.tipo === 'fin'), 'llegue el fin parcial');
  const fin = recibidos[recibidos.length - 1];
  assert.ok(fin.tipo === 'fin' && fin.completadas < 500 && fin.completadas === recibidos.length - 1, `fin parcial: ${JSON.stringify(fin)}`);
  const n = llamadas;
  await esperar(20);
  assert.equal(llamadas, n, 'no se corrió ninguna réplica más');
  puerto.terminar();
});

test('terminar silencia todo: no se llama más al simulador ni se envía más nada', async () => {
  let llamadas = 0;
  const contando: Simulador = (m, s, r) => { llamadas++; return sim(m, s, r, { traza: 'no' }); };
  const puerto = trabajadorEnProceso(contando, 'prueba')();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'correr', id: 'k', mv, semilla: 5, desde: 0, hasta: 500, traza: 'no' });
  await esperarHasta(() => recibidos.length >= 2, 'lleguen 2 resultados');
  puerto.terminar();
  const n = recibidos.length, l = llamadas;
  await esperar(30);
  assert.equal(recibidos.length, n); assert.equal(llamadas, l);
  puerto.enviar({ tipo: 'sonda' });                   // después de terminar: se ignora
  await esperar(10);
  assert.equal(recibidos.length, n);
});

test('dos «correr» seguidos se atienden uno después del otro, sin mezclarse', async () => {
  const puerto = trabajadorEnProceso(sim, 'prueba')();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'correr', id: 'a', mv, semilla: 5, desde: 0, hasta: 2, traza: 'no' });
  puerto.enviar({ tipo: 'correr', id: 'b', mv, semilla: 5, desde: 10, hasta: 12, traza: 'no' });
  await esperarHasta(() => recibidos.filter((m) => m.tipo === 'fin').length === 2, 'lleguen los dos fines');
  assert.deepEqual(recibidos.map((m) => (m.tipo === 'resultado' ? `${m.id}${m.resultado.replica}` : `${m.tipo}:${m.tipo === 'fin' ? m.id : ''}`)),
    ['a0', 'a1', 'fin:a', 'b10', 'b11', 'fin:b']);
  puerto.terminar();
});

test('cederCada permite correr varias réplicas por turno del hilo (mismos resultados, menos esperas)', async () => {
  const puerto = trabajadorEnProcesoCon(sim, 'prueba', { cederCada: 100 })();
  const recibidos = conectar(puerto);
  puerto.enviar({ tipo: 'correr', id: 'k', mv, semilla: 5, desde: 0, hasta: 30, traza: 'no' });
  await esperarHasta(() => recibidos.some((m) => m.tipo === 'fin'), 'llegue el fin');
  assert.equal(recibidos.filter((m) => m.tipo === 'resultado').length, 30);
  puerto.terminar();
});
