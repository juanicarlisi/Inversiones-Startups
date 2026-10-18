// Contrafactual dirigido: la misma noche (misma semilla y réplica) con el cambio de una causa, mirando al mismo paquete por (camión, índice).
// Con un simulador falso que rescata al paquete → confirma; con uno que no → no confirma. Sin azar nativo ni reloj.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ClaseEntidad } from '../../contratos/traza.ts';
import type { Contrafactual } from '../../contratos/explicacion.ts';
import type { Simulador } from '../../contratos/experimentos.ts';
import type { ModeloValidado, OpParche } from '../../contratos/modelo.ts';
import { crearContrafactual, MARGEN_DE_ADELANTO_MS } from '../contrafactual.ts';
import { ConstructorTraza, H22, MIN, crearSimuladorFalso, crearVarianteFalsa, hm, validadoEjemplo } from './ayudas.ts';

const CORTE = H22 + 150 * MIN;      // 00:30
const CAMBIO_PAUSAS: Contrafactual['cambio'] = {
  clave: 'explicacion.cambio.pausa', vars: {}, parche: [{ op: 'replace', path: '/personas/rampa/pausas/duracion', value: 0 }],
};
const sinPausas = (mv: ModeloValidado) => mv.modelo.personas.rampa.pausas.duracion === 0;

test('el paquete tarde que el cambio rescata: confirma = true, con la misma semilla y réplica', async () => {
  // con pausas llega a las 00:50 (20 min tarde); sin pausas, a las 00:12
  const { sim, llamadas, log } = crearSimuladorFalso((mv) => (sinPausas(mv) ? hm(24, 12) : hm(24, 50)), { corte: CORTE });
  const { variante, llamadas: llamadasVariante } = crearVarianteFalsa();
  const cf = crearContrafactual(sim);
  const r = await cf(sim, validadoEjemplo(), 20261017, 7, 0, 0, CAMBIO_PAUSAS, variante);
  assert.equal(r.confirma, true);
  assert.equal(r.clase, ClaseEntidad.PAQUETE);
  assert.deepEqual([r.camion, r.indice, r.semilla, r.replica], [0, 0, 20261017, 7]);
  assert.deepEqual(r.antes, { listo: hm(24, 50), antesDelCorte: false });
  assert.deepEqual(r.despues, { listo: hm(24, 12), antesDelCorte: true });
  assert.equal(r.cambio, CAMBIO_PAUSAS);
  assert.equal(llamadas(), 2, 'dos noches: la base y la variante');
  assert.equal(llamadasVariante(), 1);
  assert.deepEqual(log, ['20261017:7:completa', '20261017:7:completa'], 'las dos noches con la misma semilla y réplica, con traza completa');
});

test('un simulador que no rescata al paquete: confirma = false', async () => {
  const { sim } = crearSimuladorFalso(() => hm(24, 50), { corte: CORTE });
  const { variante } = crearVarianteFalsa();
  const r = await crearContrafactual()(sim, validadoEjemplo(), 1, 0, 0, 0, CAMBIO_PAUSAS, variante);
  assert.equal(r.confirma, false);
  assert.equal(r.antes.antesDelCorte, false);
  assert.equal(r.despues.antesDelCorte, false);
});

test('mejora que sigue tarde: no confirma (llegar menos tarde no es llegar al corte)', async () => {
  const { sim } = crearSimuladorFalso((mv) => (sinPausas(mv) ? hm(24, 45) : hm(25, 30)), { corte: CORTE });
  const r = await crearContrafactual(sim)(sim, validadoEjemplo(), 1, 0, 0, 0, CAMBIO_PAUSAS, crearVarianteFalsa().variante);
  assert.equal(r.confirma, false);
  assert.equal(r.despues.listo, hm(24, 45));
});

test('el paquete que no llegaba a terminar y ahora termina antes del corte: confirma', async () => {
  const { sim } = crearSimuladorFalso((mv) => (sinPausas(mv) ? hm(24, 20) : -1), { corte: CORTE });
  const r = await crearContrafactual(sim)(sim, validadoEjemplo(), 1, 0, 0, 0, CAMBIO_PAUSAS, crearVarianteFalsa().variante);
  assert.equal(r.antes.listo, null);
  assert.equal(r.antes.antesDelCorte, false);
  assert.equal(r.confirma, true);
});

test('el paquete que ya llegaba: confirma solo si ahora llega al menos 5 minutos antes (justo 5 sí, 4:59 no)', async () => {
  const caso = async (adelanto: number) => {
    const { sim } = crearSimuladorFalso((mv) => (sinPausas(mv) ? hm(24, 10) - adelanto + MARGEN_DE_ADELANTO_MS : hm(24, 10) + MARGEN_DE_ADELANTO_MS), { corte: CORTE });
    return crearContrafactual(sim)(sim, validadoEjemplo(), 1, 0, 0, 0, CAMBIO_PAUSAS, crearVarianteFalsa().variante);
  };
  assert.equal(MARGEN_DE_ADELANTO_MS, 5 * MIN);
  const justo = await caso(5 * MIN);
  assert.equal(justo.antes.antesDelCorte, true);
  assert.equal(justo.confirma, true, 'llega justo 5 minutos antes');
  assert.equal((await caso(5 * MIN - 1)).confirma, false, 'llega 5 minutos menos 1 ms antes');
  assert.equal((await caso(0)).confirma, false, 'llega igual');
  assert.equal((await caso(-10 * MIN)).confirma, false, 'llega más tarde (aunque todavía antes del corte)');
});

test('el paquete que llega justo en el corte llega antes del corte (listo ≤ corte, como cuenta el KPI)', async () => {
  const { sim } = crearSimuladorFalso((mv) => (sinPausas(mv) ? CORTE : CORTE + 1), { corte: CORTE });
  const r = await crearContrafactual(sim)(sim, validadoEjemplo(), 1, 0, 0, 0, CAMBIO_PAUSAS, crearVarianteFalsa().variante);
  assert.equal(r.despues.antesDelCorte, true);
  assert.equal(r.antes.antesDelCorte, false);
  assert.equal(r.confirma, true);
});

test('busca al MISMO paquete por (camión, índice) aunque cambie su id en la traza', async () => {
  // simulador: el paquete (3, 5) es el id 0 en la noche base y el id 2 en la variante (llegó otro antes); solo el (3, 5) se rescata
  const sim: Simulador = (mv) => {
    const c = new ConstructorTraza();
    const variante = sinPausas(mv);
    const orden: [number, number, number][] = variante
      ? [[1, 0, hm(24, 5)], [2, 9, hm(24, 6)], [3, 5, hm(24, 7)]]
      : [[3, 5, hm(24, 50)], [1, 0, hm(24, 5)], [2, 9, hm(24, 6)]];
    for (const [camion, indice, listo] of orden) { const p = c.paquete(camion, indice, H22); c.listo(p, listo); }
    return { resultado: undefined as never, traza: c.construir({ corte: CORTE }) };
  };
  const r = await crearContrafactual(sim)(sim, validadoEjemplo(), 1, 0, 3, 5, CAMBIO_PAUSAS, crearVarianteFalsa().variante);
  assert.deepEqual(r.antes, { listo: hm(24, 50), antesDelCorte: false });
  assert.deepEqual(r.despues, { listo: hm(24, 7), antesDelCorte: true });
  assert.equal(r.confirma, true);
  // el (2, 9) no cambia de resultado: no se confunde con otro
  const otro = await crearContrafactual(sim)(sim, validadoEjemplo(), 1, 0, 2, 9, CAMBIO_PAUSAS, crearVarianteFalsa().variante);
  assert.equal(otro.confirma, false);
});

test('las noches se recuerdan: cincuenta contrafactuales de la misma noche y el mismo cambio simulan dos veces, no cien', async () => {
  const { sim, llamadas } = crearSimuladorFalso((mv) => (sinPausas(mv) ? hm(24, 12) : hm(24, 50)), { corte: CORTE });
  const { variante, llamadas: llamadasVariante } = crearVarianteFalsa();
  const cf = crearContrafactual(sim);
  const mv = validadoEjemplo();
  for (let i = 0; i < 50; i++) await cf(sim, mv, 5, 1, 0, 0, CAMBIO_PAUSAS, variante);
  assert.equal(llamadas(), 2);
  assert.equal(llamadasVariante(), 1);
  // otra réplica, o otro cambio, es otra noche
  await cf(sim, mv, 5, 2, 0, 0, CAMBIO_PAUSAS, variante);
  assert.equal(llamadas(), 4);
  const otroCambio: Contrafactual['cambio'] = { clave: 'explicacion.cambio.falla', vars: {}, parche: [{ op: 'replace', path: '/hub/sorter/paradas/activas', value: false }] };
  await cf(sim, mv, 5, 1, 0, 0, otroCambio, variante);
  assert.equal(llamadas(), 5, 'la base de la réplica 1 ya estaba; solo la variante nueva se simula');
  // otro modelo es otra noche
  await cf(sim, validadoEjemplo(), 5, 1, 0, 0, CAMBIO_PAUSAS, variante);
  assert.equal(llamadas(), 7);
});

test('cada contrafactual recibe el parche de SU cambio y no toca el modelo original', async () => {
  const vistos: OpParche[][] = [];
  const { sim } = crearSimuladorFalso((mv) => (mv.modelo.personas.rampa.pausas.duracion === 0 ? hm(24, 12) : hm(24, 50)), { corte: CORTE });
  const { variante: varianteFalsa } = crearVarianteFalsa();
  const variante = async (mv: ModeloValidado, parche: OpParche[]) => { vistos.push(parche); return varianteFalsa(mv, parche); };
  const mv = validadoEjemplo();
  const antes = JSON.stringify(mv.modelo);
  await crearContrafactual(sim)(sim, mv, 1, 0, 0, 0, CAMBIO_PAUSAS, variante);
  assert.deepEqual(vistos, [CAMBIO_PAUSAS.parche]);
  assert.equal(JSON.stringify(mv.modelo), antes, 'el modelo original queda intacto');
});

test('errores que dicen qué se esperaba y qué llegó', async () => {
  const { sim } = crearSimuladorFalso(() => hm(24, 50), { corte: CORTE });
  const { variante } = crearVarianteFalsa();
  const mv = validadoEjemplo();
  const cf = crearContrafactual(sim);
  await assert.rejects(cf(sim, mv, 1, 0, 9, 9, CAMBIO_PAUSAS, variante), /el paquete \(camión 9, índice 9\) no existe en la noche base \(semilla 1, réplica 0\); se esperaba uno de los 1 paquetes/);
  await assert.rejects(cf(sim, mv, 1.5, 0, 0, 0, CAMBIO_PAUSAS, variante), /se esperaba semilla entero y no negativo y llegó 1.5/);
  await assert.rejects(cf(sim, mv, 1, -1, 0, 0, CAMBIO_PAUSAS, variante), /se esperaba réplica entero y no negativo y llegó -1/);
  await assert.rejects(cf(sim, mv, 1, 0, 0, 0, { clave: 'x', vars: {}, parche: 'no' as unknown as OpParche[] }, variante), /se esperaba un cambio con su parche/);
  await assert.rejects(cf(sim, mv, 1, 0, 0, 0, CAMBIO_PAUSAS, undefined as never), /se esperaba la función `variante`/);
  await assert.rejects(crearContrafactual()(undefined as never, mv, 1, 0, 0, 0, CAMBIO_PAUSAS, variante), /se esperaba un simulador/);
  const sinTraza: Simulador = () => ({ resultado: undefined as never });
  await assert.rejects(crearContrafactual()(sinTraza, mv, 1, 0, 0, 0, CAMBIO_PAUSAS, variante), /el simulador no devolvió traza/);
});

test('un simulador que falla una vez no deja el error recordado: la siguiente llamada vuelve a intentar', async () => {
  let intentos = 0;
  const base = crearSimuladorFalso(() => hm(24, 50), { corte: CORTE }).sim;
  const raro: Simulador = (mv, s, r, o) => { intentos++; if (intentos === 1) throw new Error('falla pasajera'); return base(mv, s, r, o); };
  const cf = crearContrafactual(raro);
  const mv = validadoEjemplo();
  const { variante } = crearVarianteFalsa();
  await assert.rejects(cf(raro, mv, 1, 0, 0, 0, CAMBIO_PAUSAS, variante), /falla pasajera/);
  const r = await cf(raro, mv, 1, 0, 0, 0, CAMBIO_PAUSAS, variante);
  assert.equal(r.confirma, false);
});

test('acepta un simulador asíncrono (el que corre en un Worker devuelve una promesa)', async () => {
  const base = crearSimuladorFalso((mv) => (sinPausas(mv) ? hm(24, 12) : hm(24, 50)), { corte: CORTE }).sim;
  const asincrono = (async (mv: ModeloValidado, s: number, r: number, o: { traza: 'no' | 'kpi' | 'completa' }) => base(mv, s, r, o)) as unknown as Simulador;
  const r = await crearContrafactual(asincrono)(asincrono, validadoEjemplo(), 1, 0, 0, 0, CAMBIO_PAUSAS, crearVarianteFalsa().variante);
  assert.equal(r.confirma, true);
});
