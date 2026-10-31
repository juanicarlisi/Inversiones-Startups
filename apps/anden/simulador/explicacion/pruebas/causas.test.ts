// Causas confirmadas: una espera larga NO es una causa hasta que el contrafactual la confirma.
//  · el cambio fijo de cada causa de la taxonomía (y cuándo no hay cambio);
//  · las candidatas (≥ 5 min o ≥ 20% del tiempo en el hub) y cómo se agrupan;
//  · solo las confirmadas se muestran; la conjunta solo si el contrafactual conjunto la confirma;
//  · E01 y E02 en versión sintética (la versión con el hub real la corre la integración).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Causa, ClaseEntidad, TipoTramo, refDe } from '../../contratos/traza.ts';
import type { Traza } from '../../contratos/traza.ts';
import type { AlmacenResultados, Contrafactual, Frase } from '../../contratos/explicacion.ts';
import type { Simulador } from '../../contratos/experimentos.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import {
  MAX_CANDIDATAS, UMBRAL_ESPERA_MS, UMBRAL_FRACCION_EN_HUB, cambioDeCausa, candidatasDe, causasConfirmadas, esperaEnCamion, fraseDeCausa,
} from '../causas.ts';
import { crearContrafactual } from '../contrafactual.ts';
import { verificarFrases } from '../verificador.ts';
import {
  ConstructorTraza, H22, MIN, PERSONA, crearVarianteFalsa, modeloEjemplo, validadoEjemplo, viaje,
} from './ayudas.ts';

const CORTE = H22 + 150 * MIN;   // 00:30
const T0 = H22 + 10 * MIN;

// ------------------------------------------------------------------------------------------------------------- cambio de cada causa

test('el cambio fijo de cada causa (corte-1.md §9, P7): pausa, ausencia, rampa llena, falla, fila y bloqueo, no leído, cierre de jaula', () => {
  const mv = validadoEjemplo();
  const t = new ConstructorTraza().construir();
  const rampa = (id: number) => refDe(ClaseEntidad.RAMPA, id);
  const persona = (id: number) => refDe(ClaseEntidad.PERSONA, id);

  const pausaRampa = cambioDeCausa(mv, t, 'pausa', persona(PERSONA.R1));
  assert.deepEqual(pausaRampa?.parche, [{ op: 'replace', path: '/personas/rampa/pausas/duracion', value: 0 }]);
  assert.equal(pausaRampa?.clave, 'explicacion.cambio.pausa');
  const pausaInduccion = cambioDeCausa(mv, t, 'pausa', persona(PERSONA.I2));
  assert.deepEqual(pausaInduccion?.parche, [{ op: 'replace', path: '/personas/induccion/pausas/duracion', value: 0 }]);
  const pausaReten = cambioDeCausa(mv, t, 'pausa', persona(PERSONA.T1));
  assert.equal(pausaReten?.parche[0].path, '/personas/induccion/pausas/duracion', 'el retén toma el horario del puesto que cubre');

  assert.deepEqual(cambioDeCausa(mv, t, 'ausencia', -1), {
    clave: 'explicacion.cambio.ausencia', vars: { reten: 1 }, parche: [{ op: 'replace', path: '/personas/induccion/reten', value: 1 }],
  });
  assert.deepEqual(cambioDeCausa(mv, t, 'rampa_llena', rampa(1)), {
    clave: 'explicacion.cambio.rampa_llena', vars: { rampa: 'R02', capacidad: 40 }, parche: [{ op: 'replace', path: '/hub/rampas/1/capacidad', value: 40 }],
  });
  assert.deepEqual(cambioDeCausa(mv, t, 'falla', -1)?.parche, [{ op: 'replace', path: '/hub/sorter/paradas/activas', value: false }]);
  const fila = cambioDeCausa(mv, t, 'fila', -1);
  assert.deepEqual(fila?.parche, [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }]);
  assert.deepEqual(fila?.vars, { puestos: 4 });
  assert.deepEqual(cambioDeCausa(mv, t, 'bloqueo', -1)?.parche, fila?.parche, 'fila y bloqueo piden el mismo cambio');
  assert.deepEqual(cambioDeCausa(mv, t, 'no_leido', -1)?.parche, [{ op: 'replace', path: '/hub/sorter/lector/noLeido', value: 0 }]);
  assert.deepEqual(cambioDeCausa(mv, t, 'cierre_jaula', persona(PERSONA.R1))?.parche, [{ op: 'replace', path: '/hub/jaulas/cierre', value: 0 }]);
});

test('cuando el modelo ya tiene el cambio, o la causa no lo permite, no hay cambio (null): el contrafactual no cambiaría nada', () => {
  const t = new ConstructorTraza().construir();
  const con = (f: (m: ReturnType<typeof modeloEjemplo>) => void): ModeloValidado => { const m = modeloEjemplo(); f(m); return validadoSinChequeos(m); };
  assert.equal(cambioDeCausa(con((m) => { m.personas.rampa.pausas.duracion = 0; }), t, 'pausa', refDe(ClaseEntidad.PERSONA, PERSONA.R1)), null);
  assert.equal(cambioDeCausa(con((m) => { m.personas.induccion.pausas.duracion = 0; }), t, 'pausa', refDe(ClaseEntidad.PERSONA, PERSONA.I1)), null);
  assert.equal(cambioDeCausa(con((m) => { m.hub.sorter.paradas.activas = false; }), t, 'falla', -1), null);
  assert.equal(cambioDeCausa(con((m) => { m.personas.induccion.puestosActivos = 5; }), t, 'fila', -1), null, 'no hay un sexto puesto físico');
  assert.equal(cambioDeCausa(con((m) => { m.hub.sorter.lector.noLeido = 0; }), t, 'no_leido', -1), null);
  assert.equal(cambioDeCausa(con((m) => { m.hub.jaulas.cierre = 0; }), t, 'cierre_jaula', -1), null);
  assert.equal(cambioDeCausa(validadoEjemplo(), t, 'rampa_llena', -1), null, 'sin rampa causante no hay qué ampliar');
  assert.equal(cambioDeCausa(validadoEjemplo(), t, 'rampa_llena', refDe(ClaseEntidad.PERSONA, 0)), null, 'el causante tiene que ser una rampa');
  assert.equal(cambioDeCausa(validadoEjemplo(), t, 'rampa_llena', refDe(ClaseEntidad.RAMPA, 99)), null, 'una rampa que el modelo no tiene');
  // capacidad 0 → 1 (el doble de 0 no ampliaría nada, se pasa a 1)
  const cero = con((m) => { m.hub.rampas[0].capacidad = 0; });
  assert.deepEqual(cambioDeCausa(cero, t, 'rampa_llena', refDe(ClaseEntidad.RAMPA, 0))?.parche, [{ op: 'replace', path: '/hub/rampas/0/capacidad', value: 1 }]);
});

test('con un retén ya cargado, la causa AUSENCIA pide uno más', () => {
  const m = modeloEjemplo();
  m.personas.induccion.reten = 2;
  const c = cambioDeCausa(validadoSinChequeos(m), new ConstructorTraza().construir(), 'ausencia', -1);
  assert.deepEqual(c?.parche, [{ op: 'replace', path: '/personas/induccion/reten', value: 3 }]);
  assert.deepEqual(c?.vars, { reten: 3 });
});

// ----------------------------------------------------------------------------------------------------------------------- candidatas

/** Un paquete con una espera en rampa (con la persona R1 en pausa durante toda la espera) de `espera` ms. */
function paqueteConPausa(c: ConstructorTraza, espera: number, t0 = T0, o: { camion?: number; indice?: number } = {}) {
  const v = viaje(c, t0, o).descarga(2000).cinta(40000).fila(1000).induccion(3000).bandeja(30000);
  const desde = v.t;
  v.rampa(espera, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const pausa = c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, desde - MIN, desde + espera + MIN);
  return { id: v.id, pausa, desde };
}

test('la umbral: 5 minutos justos son candidata, 4:59 no (si es menos del 20% del tiempo en el hub)', () => {
  assert.equal(UMBRAL_ESPERA_MS, 5 * MIN);
  assert.equal(UMBRAL_FRACCION_EN_HUB, 0.2);
  const mv = validadoEjemplo();
  const justo = new ConstructorTraza();
  const a = paqueteConPausa(justo, 5 * MIN);
  const noTanto = new ConstructorTraza();
  const b = paqueteConPausa(noTanto, 5 * MIN - 1);
  // con 4:59 de espera dentro de un viaje que dura mucho más (la fila de 30 minutos) la fracción no llega al 20%
  const largo = new ConstructorTraza();
  const l = viaje(largo, T0).descarga(2000).cinta(40000).fila(30 * MIN).induccion(3000).bandeja(30000);
  const desdeL = l.t;
  l.rampa(5 * MIN - 1, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  largo.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, desdeL - MIN, desdeL + 6 * MIN);
  assert.equal(candidatasDe(justo.construir(), mv, a.id).length, 1);
  assert.equal(candidatasDe(largo.construir(), mv, l.id).length, 1, 'la fila de 30 min es candidata (FILA): la rampa de 4:59 sola no lo sería');
  const soloRampa = candidatasDe(largo.construir(), mv, l.id)[0];
  assert.equal(soloRampa.items.length, 1);
  assert.equal(soloRampa.items[0].tipo, 'fila', 'la candidata del viaje largo es la fila, no la pausa de 4:59');
  void b;
});

test('el 20% del tiempo en el hub alcanza aunque la espera dure menos de 5 minutos', () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  // el paquete está en el hub unos 4 minutos y espera 3 en la rampa: 75% del tiempo
  const v = viaje(c, T0).descarga(2000).cinta(10000).fila(1000).induccion(3000).bandeja(20000);
  const desde = v.t;
  v.rampa(3 * MIN, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, desde - 1000, desde + 4 * MIN);
  const cand = candidatasDe(c.construir(), mv, v.id);
  assert.equal(cand.length, 1);
  assert.equal(cand[0].items[0].tipo, 'pausa');
  // una espera de 20 s en un viaje de unos 2,6 minutos (12,6%) no llega al 20%
  const c2 = new ConstructorTraza();
  const w = viaje(c2, T0).descarga(2000).cinta(10000).fila(1000).induccion(3000).bandeja(120000);
  const d2 = w.t;
  w.rampa(20000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  c2.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, d2 - 1000, d2 + 4 * MIN);
  assert.equal(candidatasDe(c2.construir(), mv, w.id).length, 0);
});

test('solo las esperas con causa afirmable son candidatas: falta de bandeja, persona ocupada y no transportable se describen, no se afirman', () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(2000).cinta(40000).induccion(3000).esperaBandeja(20 * MIN).bandeja(30000).rampa(20 * MIN, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const n = viaje(c, T0).descarga(2000).cinta(1000).fila(0).colaManual(20 * MIN, Causa.NO_TRANSPORTABLE).manual(20000).jaula(0);
  const camion = c.tramo(0, TipoTramo.CAMION_PLAYA, -1, 0, T0, T0 + 20 * MIN, Causa.ANDEN_OCUPADO);
  void camion;
  const t = c.construir();
  assert.deepEqual(candidatasDe(t, mv, v.id), [], 'falta de bandeja y persona ocupada: sin cambio fijo');
  assert.deepEqual(candidatasDe(t, mv, n.id), [], 'no transportable: sin cambio fijo');
});

test('fila y bloqueo piden el mismo cambio: una sola candidata con las dos causas (se simula una vez)', () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(8 * MIN, 0, true).cinta(40000).fila(9 * MIN).induccion(3000).bandeja(30000).rampa(1000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const cand = candidatasDe(c.construir(), mv, v.id);
  assert.equal(cand.length, 1);
  assert.deepEqual(cand[0].items.map((i) => i.tipo).sort(), ['bloqueo', 'fila']);
  assert.ok(['explicacion.cambio.fila', 'explicacion.cambio.bloqueo'].includes(cand[0].cambio.clave), 'el cambio es el de uno de los dos (el texto es el mismo)');
  assert.equal(cand[0].peso, 9 * MIN, 'el peso es la espera más larga del grupo');
});

test('varias vueltas por la misma rampa suman en un solo grupo; rampas distintas son candidatas distintas, de mayor a menor espera', () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(2000).cinta(40000).fila(1000).induccion(3000).bandeja(30000)
    .vuelta(2 * MIN, 1, 0).vuelta(2 * MIN, 2, 0).vuelta(2 * MIN, 3, 0)       // 6 min por la rampa R01
    .vuelta(7 * MIN, 4, 2)                                                    // 7 min por la rampa R03
    .rampa(1000, 2, PERSONA.R3).mano(3000, PERSONA.R3, 2).jaula(2);
  const t = c.construir();
  const cand = candidatasDe(t, mv, v.id);
  assert.equal(cand.length, 2);
  assert.deepEqual(cand.map((x) => x.cambio.vars.rampa), ['R03', 'R01'], 'ordenadas por la espera más larga del grupo');
  const r01 = cand[1].items[0];
  assert.equal(r01.total, 6 * MIN, 'las tres vueltas de la rampa R01 suman 6 minutos y pasan el umbral juntas');
  assert.equal(t.tramos.a[r01.tramoVuelta], 3, 'las vueltas que se cuentan son hasta la número 3');
});

test('como mucho MAX_CANDIDATAS candidatas por paquete: cada una cuesta una noche simulada', () => {
  assert.ok(MAX_CANDIDATAS >= 4);
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  // 8 rampas llenas distintas (una vuelta de 6 min cada una) → 8 grupos, 8 cambios distintos
  const v = viaje(c, T0).descarga(2000).cinta(1000).fila(1000).induccion(1000).bandeja(1000);
  for (let r = 0; r < 8; r++) v.vuelta(6 * MIN, r + 1, r);
  v.rampa(1000, 0, PERSONA.R1).mano(1000, PERSONA.R1).jaula(0);
  const cand = candidatasDe(c.construir(), mv, v.id);
  assert.equal(cand.length, MAX_CANDIDATAS);
});

// ---------------------------------------------------------------------------------------------------- causasConfirmadas con un veredicto fijo

/** Un contrafactual "ya resuelto" para una lista de cambios: `confirman` dice cuáles confirman (por clave de cambio). */
function contrafactualFijo(confirman: (c: Contrafactual['cambio']) => boolean, antesDelCorte = false) {
  const llamados: Contrafactual['cambio'][] = [];
  const f = async (cambio: Contrafactual['cambio']): Promise<Contrafactual> => {
    llamados.push(cambio);
    const confirma = confirman(cambio);
    return {
      clase: ClaseEntidad.PAQUETE, camion: 0, indice: 0, cambio, semilla: 1, replica: 0,
      antes: { listo: antesDelCorte ? CORTE - 1 * MIN : CORTE + 20 * MIN, antesDelCorte },
      despues: { listo: confirma ? CORTE - 10 * MIN : antesDelCorte ? CORTE - 2 * MIN : CORTE + 5 * MIN, antesDelCorte: confirma },
      confirma,
    };
  };
  return { f, llamados };
}

function almacenDe(t: Traza, mv: ModeloValidado): AlmacenResultados {
  return { experimentos: {}, trazas: { noche: t }, modelo: mv.modelo };
}

test('una causa confirmada se muestra, con sus cifras atadas a la traza; el veredicto "confirma" viaja en el contrafactual', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const p = paqueteConPausa(c, 12 * MIN);
  const t = c.construir();
  const { f, llamados } = contrafactualFijo(() => true);
  const r = await causasConfirmadas(t, mv, 1, 0, 0, 0, f);
  assert.equal(llamados.length, 1, 'una candidata, un contrafactual');
  assert.equal(r.causas.length, 1);
  assert.equal(r.causas[0].clave, 'explicacion.causa.pausa');
  assert.deepEqual(r.causas[0].vars, { espera: 12, rampa: 'R01', persona: 'P-R1' });
  assert.equal(r.contrafactuales.length, 1);
  assert.equal(r.contrafactuales[0].confirma, true);
  assert.deepEqual(llamados[0].parche, [{ op: 'replace', path: '/personas/rampa/pausas/duracion', value: 0 }]);
  const v = verificarFrases(r.causas, almacenDe(t, mv), 'noche');
  assert.deepEqual(v.fallas, [], 'la cifra de la causa sale de la traza y el verificador la reconoce');
  void p;
});

test('una causa que el contrafactual NO confirma no se muestra: la espera larga no es una causa', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  paqueteConPausa(c, 12 * MIN);
  const { f, llamados } = contrafactualFijo(() => false);
  const r = await causasConfirmadas(c.construir(), mv, 1, 0, 0, 0, f);
  assert.deepEqual(r.causas, []);
  assert.equal(llamados.length, 1);
  assert.equal(r.contrafactuales.length, 1, 'el que no confirmó igual se devuelve, para que se vea que se probó');
  assert.equal(r.contrafactuales[0].confirma, false);
});

test('un paquete que ya llegaba antes del corte y mejora 5 min o más lleva la frase de adelanto, no la de corte', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  paqueteConPausa(c, 12 * MIN);
  const r = await causasConfirmadas(c.construir(), mv, 1, 0, 0, 0, contrafactualFijo(() => true, true).f);
  assert.equal(r.causas[0].clave, 'explicacion.causa.pausa.adelanto');
});

test('sin candidatas no se simula nada', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(2000).cinta(40000).fila(5000).induccion(3000).bandeja(30000).rampa(8000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  const { f, llamados } = contrafactualFijo(() => true);
  const r = await causasConfirmadas(c.construir(), mv, 1, 0, 0, v.id, f);
  assert.deepEqual(r, { causas: [], contrafactuales: [] });
  assert.equal(llamados.length, 0);
});

test('el paquete que no está en la traza: error que dice cuál se buscó y cuántos hay', async () => {
  const c = new ConstructorTraza();
  paqueteConPausa(c, 12 * MIN);
  await assert.rejects(
    causasConfirmadas(c.construir(), validadoEjemplo(), 1, 0, 7, 7, contrafactualFijo(() => true).f),
    /el paquete \(camión 7, índice 7\) no está en la traza \(hay 1 paquetes en esa noche\)/,
  );
});

/** Un paquete con DOS causas largas de tipos distintos: una pausa de rampa y un lazo detenido. */
function paqueteConPausaYFalla(c: ConstructorTraza, o: { camion?: number; indice?: number } = {}, espera = 40 * MIN) {
  const v = viaje(c, T0, o).descarga(2000).cinta(40000).fila(1000).induccion(3000);
  const desdeBandeja = v.t;
  v.esperaBandeja(espera).bandeja(30000);
  c.tramo(-1, TipoTramo.LAZO_DETENIDO, 0, 100, desdeBandeja - MIN, desdeBandeja + espera + MIN, Causa.FALLA);
  const desdeRampa = v.t;
  v.rampa(espera, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
  c.tramo(PERSONA.R1, TipoTramo.PERSONA_PAUSA, 0, 0, desdeRampa - MIN, desdeRampa + espera + MIN);
  return v.id;
}

test('dos causas que no confirman solas: se prueba el cambio conjunto, y si confirma sale la causa conjunta con sus dos partes', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const id = paqueteConPausaYFalla(c);
  const t = c.construir();
  // solo confirma el cambio conjunto (el que trae las dos operaciones)
  const { f, llamados } = contrafactualFijo((cambio) => cambio.parche.length === 2);
  const r = await causasConfirmadas(t, mv, 1, 0, 0, id, f);
  assert.equal(llamados.length, 3, 'dos candidatas de a una y el conjunto');
  assert.equal(llamados[2].clave, 'explicacion.cambio.conjunta');
  assert.deepEqual(r.causas.map((x) => x.clave).sort(), ['explicacion.causa.conjunta', 'explicacion.causa.conjunta.falla', 'explicacion.causa.conjunta.pausa']);
  assert.equal(r.causas.some((x) => /^explicacion\.causa\.(pausa|falla)/.test(x.clave)), false, 'ninguna frase de causa única');
  assert.equal(r.contrafactuales.length, 3);
  assert.equal(r.contrafactuales[2].confirma, true);
  assert.deepEqual(verificarFrases(r.causas, almacenDe(t, mv), 'noche').fallas, []);
});

test('dos causas que no confirman solas ni juntas: no se muestra ninguna frase causal', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const id = paqueteConPausaYFalla(c);
  const { f, llamados } = contrafactualFijo(() => false);
  const r = await causasConfirmadas(c.construir(), mv, 1, 0, 0, id, f);
  assert.deepEqual(r.causas, []);
  assert.equal(llamados.length, 3);
  assert.equal(r.contrafactuales.every((x) => !x.confirma), true);
});

test('una causa que confirma sola y dos que no: salen la confirmada y, si confirma, el conjunto de las otras dos', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const id = paqueteConPausaYFalla(c);
  // una tercera causa: la fila de 8 min (cambio: un puesto más)
  c.tramo(id, TipoTramo.ACUMULACION, 0, 1, T0 + 1, T0 + 1 + 8 * MIN, Causa.FILA);
  const t = c.construir();
  const { f, llamados } = contrafactualFijo((cambio) => cambio.clave === 'explicacion.cambio.fila' || cambio.parche.length === 2);
  const r = await causasConfirmadas(t, mv, 1, 0, 0, id, f);
  assert.equal(llamados.length, 4, 'tres candidatas y el conjunto de las dos que no confirmaron');
  const claves = r.causas.map((x) => x.clave).sort();
  assert.deepEqual(claves, ['explicacion.causa.conjunta', 'explicacion.causa.conjunta.falla', 'explicacion.causa.conjunta.pausa', 'explicacion.causa.fila'].sort());
});

test('con más de 3 causas sin confirmar de a una no se prueba el conjunto (2^k experimentos): solo contrafactuales de un factor', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(2000).cinta(1000).fila(1000).induccion(1000).bandeja(1000);
  for (let r = 0; r < 4; r++) v.vuelta(6 * MIN, r + 1, r);
  v.rampa(1000, 0, PERSONA.R1).mano(1000, PERSONA.R1).jaula(0);
  const { f, llamados } = contrafactualFijo(() => false);
  const r = await causasConfirmadas(c.construir(), mv, 1, 0, 0, v.id, f);
  assert.equal(llamados.length, 4);
  assert.equal(llamados.some((x) => x.clave === 'explicacion.cambio.conjunta'), false);
  assert.deepEqual(r.causas, []);
});

test('una sola candidata sin confirmar no genera "conjunta": el conjunto de una causa sería ella misma', async () => {
  const mv = validadoEjemplo();
  const c = new ConstructorTraza();
  paqueteConPausa(c, 12 * MIN);
  const { llamados } = await (async () => { const x = contrafactualFijo(() => false); await causasConfirmadas(c.construir(), mv, 1, 0, 0, 0, x.f); return x; })();
  assert.equal(llamados.length, 1);
});

test('fraseDeCausa: la causa de rampa llena cuenta las vueltas desde la traza; las demás los minutos de su espera', () => {
  const c = new ConstructorTraza();
  const v = viaje(c, T0).descarga(2000).cinta(1000).fila(1000).induccion(1000).bandeja(1000).vuelta(3 * MIN, 1, 1).vuelta(3 * MIN, 2, 1).rampa(1000, 1, PERSONA.R2).mano(1000, PERSONA.R2, 1).jaula(1);
  const t = c.construir();
  const [cand] = candidatasDe(t, validadoEjemplo(), v.id);
  const f = fraseDeCausa(t, cand.items[0], 'corte', false);
  assert.equal(f.clave, 'explicacion.causa.rampa_llena');
  assert.deepEqual(f.vars, { vueltas: 2, rampa: 'R02' });
  assert.deepEqual(f.afirmaciones[0].fuente, { tipo: 'traza', tramo: cand.items[0].tramoVuelta, campo: 'a' });
  assert.equal(fraseDeCausa(t, cand.items[0], 'adelanto', false).clave, 'explicacion.causa.rampa_llena.adelanto');
  assert.equal(fraseDeCausa(t, cand.items[0], 'corte', true).clave, 'explicacion.causa.conjunta.rampa_llena');
  assert.equal(fraseDeCausa(t, cand.items[0], 'adelanto', true).clave, 'explicacion.causa.conjunta.rampa_llena', 'un componente de la conjunta no lleva sufijo');
});

// --------------------------------------------------------------------------- E01 y E02 sintéticas (la versión con el hub real: integración)

/**
 * Una noche sintética con un conjunto de paquetes. Cada paquete tiene un "mundo" que decide cuándo llega según el modelo: `listo(mv)`.
 * El simulador falso devuelve una traza con esos paquetes y esos `listo`, así el contrafactual real (crearContrafactual) corre sobre un
 * mundo cuyo comportamiento conocemos: qué cambio rescata a cuál paquete.
 */
interface Mundo { camion: number; indice: number; listo: (mv: ModeloValidado) => number }
function simuladorDeMundos(mundos: Mundo[]): Simulador {
  return (mv) => {
    const c = new ConstructorTraza();
    for (const m of mundos) { const p = c.paquete(m.camion, m.indice, H22); c.listo(p, m.listo(mv)); }
    return { resultado: undefined as never, traza: c.construir({ corte: CORTE }) };
  };
}
const sinPausasRampa = (mv: ModeloValidado) => mv.modelo.personas.rampa.pausas.duracion === 0;
const sinParadas = (mv: ModeloValidado) => !mv.modelo.hub.sorter.paradas.activas;

/** Frases causales de una sola causa sin su contrafactual confirmado, o conjuntas sin su conjunto confirmado. */
function frasesCausalesSinConfirmar(causas: Frase[], cfs: Contrafactual[]): string[] {
  const malas: string[] = [];
  for (const f of causas) {
    const m = /^explicacion\.causa\.(?!conjunta)(\w+?)(\.adelanto)?$/.exec(f.clave);
    if (m) {
      const tipo = m[1];
      const par = (tipo === 'fila' || tipo === 'bloqueo') ? ['fila', 'bloqueo'] : [tipo];
      if (!cfs.some((c) => c.confirma && par.some((p) => c.cambio.clave === `explicacion.cambio.${p}`))) malas.push(f.clave);
    } else if (/^explicacion\.causa\.conjunta/.test(f.clave)) {
      if (!cfs.some((c) => c.confirma && c.cambio.clave === 'explicacion.cambio.conjunta')) malas.push(f.clave);
    }
  }
  return malas;
}

test('E01 sintética: todo paquete tarde con una espera en rampa ≥ 5 min sobre una pausa tiene la causa PAUSA confirmada por «sin pausas de rampa»', async () => {
  const mv = validadoEjemplo();
  const { variante } = crearVarianteFalsa();
  const cantidad = 50;
  const c = new ConstructorTraza();
  const mundos: Mundo[] = [];
  const ids: number[] = [];
  for (let i = 0; i < cantidad; i++) {
    // espera de 5 a 25 min en la rampa sobre la pausa de la persona; llega tarde con pausas y a tiempo sin ellas
    const espera = (5 + (i % 21)) * MIN;
    const p = paqueteConPausa(c, espera, T0 + i * 1000, { camion: i % 5, indice: i });
    ids.push(p.id);
    mundos.push({ camion: i % 5, indice: i, listo: (m) => (sinPausasRampa(m) ? CORTE - 20 * MIN : CORTE + 15 * MIN) });
  }
  const t = c.construir({ corte: CORTE });
  const sim = simuladorDeMundos(mundos);
  const cf = crearContrafactual(sim);
  for (let i = 0; i < cantidad; i++) {
    const r = await causasConfirmadas(t, mv, 20261017, 3, i % 5, i, (cambio) => cf(sim, mv, 20261017, 3, i % 5, i, cambio, variante));
    assert.equal(r.causas.length, 1, `paquete ${i}: se esperaba la causa PAUSA y llegaron ${JSON.stringify(r.causas.map((x) => x.clave))}`);
    assert.equal(r.causas[0].clave, 'explicacion.causa.pausa');
    assert.equal(r.contrafactuales.length, 1);
    assert.equal(r.contrafactuales[0].confirma, true);
    assert.equal(r.contrafactuales[0].antes.antesDelCorte, false);
    assert.equal(r.contrafactuales[0].despues.antesDelCorte, true);
    assert.deepEqual(frasesCausalesSinConfirmar(r.causas, r.contrafactuales), []);
  }
});

test('E01 sintética, el lado contrario: si las pausas NO eran la razón (llega tarde igual sin ellas), la frase no sale', async () => {
  const mv = validadoEjemplo();
  const { variante } = crearVarianteFalsa();
  const c = new ConstructorTraza();
  const p = paqueteConPausa(c, 20 * MIN, T0, { camion: 0, indice: 0 });
  const t = c.construir({ corte: CORTE });
  const sim = simuladorDeMundos([{ camion: 0, indice: 0, listo: () => CORTE + 30 * MIN }]);
  const cf = crearContrafactual(sim);
  const r = await causasConfirmadas(t, mv, 1, 0, 0, 0, (cambio) => cf(sim, mv, 1, 0, 0, 0, cambio, variante));
  assert.deepEqual(r.causas, [], 'esperó 20 min sobre una pausa, pero sin pausas llega igual de tarde: no es la causa');
  assert.equal(r.contrafactuales[0].confirma, false);
  void p;
});

test('E02 sintética: dos causas que se sobredeterminan (micro-parada de 40 min y pausas de 40 min, cada una suficiente) — 0 frases causales sin confirmar en 50 paquetes × 10 réplicas', async () => {
  const mv = validadoEjemplo();
  const { variante } = crearVarianteFalsa();
  let conjuntas = 0, unicas = 0, total = 0;
  for (let replica = 0; replica < 10; replica++) {
    const c = new ConstructorTraza();
    const mundos: Mundo[] = [];
    for (let i = 0; i < 50; i++) {
      paqueteConPausaYFalla(c, { camion: i % 5, indice: i });
      // tarde si falla CUALQUIERA de las dos causas; a tiempo solo sin las dos
      mundos.push({ camion: i % 5, indice: i, listo: (m) => (sinPausasRampa(m) && sinParadas(m) ? CORTE - 30 * MIN : CORTE + 40 * MIN) });
    }
    const t = c.construir({ corte: CORTE });
    const sim = simuladorDeMundos(mundos);
    const cf = crearContrafactual(sim);
    for (let i = 0; i < 50; i++) {
      const r = await causasConfirmadas(t, mv, 77, replica, i % 5, i, (cambio) => cf(sim, mv, 77, replica, i % 5, i, cambio, variante));
      total++;
      assert.deepEqual(frasesCausalesSinConfirmar(r.causas, r.contrafactuales), [], `réplica ${replica}, paquete ${i}`);
      const claves = r.causas.map((x) => x.clave);
      assert.equal(claves.includes('explicacion.causa.pausa'), false, 'la pausa sola no confirma: con la falla sigue tarde');
      assert.equal(claves.includes('explicacion.causa.falla'), false, 'la falla sola no confirma: con las pausas sigue tarde');
      if (claves.includes('explicacion.causa.conjunta')) {
        conjuntas++;
        assert.ok(claves.includes('explicacion.causa.conjunta.pausa') && claves.includes('explicacion.causa.conjunta.falla'));
      }
      unicas += claves.filter((k) => /^explicacion\.causa\.(pausa|falla)/.test(k)).length;
    }
  }
  assert.equal(total, 500);
  assert.equal(unicas, 0);
  assert.equal(conjuntas, 500, 'el contrafactual conjunto confirma en los 500 casos: aparece la causa conjunta');
});

test('E02 sintética, con una tercera causa que el modelo no puede mover: ni las únicas ni la conjunta se confirman, y no se muestra ninguna causa', async () => {
  const mv = validadoEjemplo();
  const { variante } = crearVarianteFalsa();
  const c = new ConstructorTraza();
  const id = paqueteConPausaYFalla(c, { camion: 0, indice: 0 });
  const t = c.construir({ corte: CORTE });
  const sim = simuladorDeMundos([{ camion: 0, indice: 0, listo: () => CORTE + 60 * MIN }]);
  const cf = crearContrafactual(sim);
  const r = await causasConfirmadas(t, mv, 1, 0, 0, id, (cambio) => cf(sim, mv, 1, 0, 0, 0, cambio, variante));
  assert.deepEqual(r.causas, []);
  assert.equal(r.contrafactuales.length, 3);
  assert.equal(r.contrafactuales.some((x) => x.confirma), false);
});

test('causas de una noche real de la maqueta: ninguna causa sin su contrafactual, y las cifras de cada frase pasan el verificador', async () => {
  const { trazaDeMaqueta } = await import('../../contratos/fixtures/traza-maqueta.ts');
  const original = trazaDeMaqueta(2);
  // la fixture de la maqueta no trae el camión de cada paquete (queda en −1): se le pone el camión 0 y el índice ya es el id
  const t: Traza = { ...original, paquetes: { ...original.paquetes, camion: new Int32Array(original.paquetes.n) } };
  const mv = validadoEjemplo();
  // contrafactual falso: confirma los cambios de pausa y fila, no los demás
  const { f, llamados } = contrafactualFijo((cambio) => cambio.clave === 'explicacion.cambio.fila');
  let frases = 0, conCandidata = 0;
  const almacen = almacenDe(t, mv);
  for (let id = 0; id < t.paquetes.n; id += 97) {
    if (t.paquetes.creado[id] < 0) continue;   // la maqueta tiene ids sin paquete nacido
    const r = await causasConfirmadas(t, mv, 2, 0, t.paquetes.camion[id], t.paquetes.indice[id], f);
    if (r.contrafactuales.length > 0) conCandidata++;
    assert.deepEqual(frasesCausalesSinConfirmar(r.causas, r.contrafactuales), [], `paquete ${id}`);
    frases += r.causas.length;
    assert.deepEqual(verificarFrases(r.causas, almacen, 'noche').fallas, [], `paquete ${id}: las cifras de las causas`);
  }
  assert.ok(conCandidata > 0, 'la maqueta tiene paquetes con esperas largas');
  assert.ok(llamados.length >= conCandidata);
  void frases;
});


test('HUB-R01 · la espera dentro del camión (andenes ocupados, cola de descarga) es candidata, con «una persona más en cada andén»', () => {
  const mv = validadoEjemplo();
  const armar = (conCamion: boolean) => {
    const c = new ConstructorTraza();
    if (conCamion) {
      // el camión T01 llega 21:50 (antes del turno: la espera cuenta desde las 22:00), espera la playa hasta 22:05 y baja hasta 22:40
      c.tramo(0, TipoTramo.CAMION_PLAYA, -1, 0, H22 - 10 * MIN, H22 + 5 * MIN, Causa.ANDEN_OCUPADO);
      c.tramo(0, TipoTramo.CAMION_ANDEN, 0, 800, H22 + 5 * MIN, H22 + 40 * MIN);
    }
    // a este paquete lo empiezan a bajar a las 22:10 (T0): 10 min adentro del camión desde el inicio del turno
    const v = viaje(c, T0).descarga(2000).cinta(10000).fila(1000).induccion(3000).bandeja(20000).rampa(8000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
    return { t: c.construir({ corte: CORTE }), id: v.id };
  };
  const { t, id } = armar(true);
  const e = esperaEnCamion(t, id);
  assert.ok(e, 'el paquete tiene una espera dentro del camión');
  assert.equal(e.desde, H22, 'antes del turno no se descarga: la espera cuenta desde las 22:00, no desde la llegada');
  assert.equal(e.hasta, T0, 'hasta que empieza su descarga');
  assert.equal(e.causa, Causa.ANDEN_OCUPADO);
  assert.deepEqual(e.causante, refDe(ClaseEntidad.CAMION, 0));
  const cand = candidatasDe(t, mv, id);
  assert.equal(cand.length, 1, 'la única espera larga es la del camión');
  assert.equal(cand[0].items[0].tipo, 'descarga');
  const andenes = mv.modelo.hub.andenes;
  assert.deepEqual(cand[0].cambio.parche, andenes.map((a, i) => ({ op: 'replace', path: `/hub/andenes/${i}/personas`, value: a.personas + 1 })));
  const f = fraseDeCausa(t, cand[0].items[0], 'corte', false);
  assert.equal(f.clave, 'explicacion.causa.descarga');
  assert.deepEqual(f.vars, { camion: 'T01', llegada: '21:50', inicio: '22:10' });
  assert.deepEqual(verificarFrases([f], almacenDe(t, mv), 'noche').fallas, [], 'las dos horas salen de la traza y el verificador las reconoce');
  // sin los tramos del camión en la traza no hay espera que contar (ni candidata)
  const sin = armar(false);
  assert.equal(esperaEnCamion(sin.t, sin.id), null);
  assert.equal(candidatasDe(sin.t, mv, sin.id).length, 0);
  // con el tope de personas por andén ya alcanzado, no hay cambio que probar
  const lleno = validadoSinChequeos({ ...mv.modelo, hub: { ...mv.modelo.hub, andenes: andenes.map((a) => ({ ...a, personas: 50 })) } });
  assert.equal(cambioDeCausa(lleno, t, 'descarga', -1), null);
});
