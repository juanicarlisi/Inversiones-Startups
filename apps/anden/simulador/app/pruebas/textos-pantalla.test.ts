// app/pruebas/textos-pantalla.test.ts · P8 · las piezas de texto que deciden qué se le dice a quien mira, probadas en Node: la etiqueta de
// noche, «perder el corte: 1 noche de cada N» con su IC, el cierre del formulario, los cambios del «¿y si…?» de la biografía y la traza en
// CSV del modo ingeniero.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Contexto } from '../contexto.ts';
import { crearTraductor } from '../i18n/traducir.ts';
import { crearFormato } from '../i18n/formato.ts';
import { diccionariosDeTodos } from '../i18n/diccionarios.ts';
import { textoEtiquetaNoche } from '../ui/etiqueta-noche.ts';
import { textoPerderCorte } from '../ui/resumen.ts';
import { claveCierreFormulario } from '../pantallas/decidir.ts';
import { cambiosDe } from '../pantallas/biografia.ts';
import { trazaACsv } from '../pantallas/ingeniero.ts';
import { textoContrafactual } from '../pantallas/biografia.ts';
import { Causa, ClaseEntidad, TipoTramo, refDe, type Traza } from '../../contratos/traza.ts';
import type { Biografia, Contrafactual } from '../../contratos/explicacion.ts';
import type { EvaluacionDecision, Proporcion } from '../../contratos/experimentos.ts';
import type { NocheVista } from '../sesion.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { plantillaChica } from '../falsos/plantillas.ts';

function ctxDe(idioma: 'es' | 'en' = 'es'): Contexto {
  const f = crearFormato(idioma), tr = crearTraductor(diccionariosDeTodos(), idioma, f);
  return { t: tr.t, f, traductor: tr, sesion: { kpiNoche: 'finClasificacionMin' } } as unknown as Contexto;
}
const prop = (exitos: number, n: number, ic: [number, number]): Proporcion => ({ exitos, n, p: exitos / n, ic, metodo: 'wilson', confianza: 0.95 });

test('etiqueta de noche: siempre dice cuál es y por qué', () => {
  const ctx = ctxDe();
  const noche = { replica: 36 } as NocheVista;
  assert.equal(textoEtiquetaNoche(ctx, noche, 'mediana', 100), 'Noche 37 de 100 · la mediana por hora de fin');
  assert.equal(textoEtiquetaNoche(ctx, noche, 'peor', 100), 'Noche 37 de 100 · la peor por hora de fin');
  assert.equal(textoEtiquetaNoche(ctx, noche, 'provisoria', 100), 'Noche 37 de 100 · provisoria: todavía se están calculando las demás');
  assert.equal(textoEtiquetaNoche(ctx, noche, 'mediana', 100, true), 'Noche 37 de 100 con los cambios · provisoria (1 noche)');
  assert.equal(textoEtiquetaNoche(ctx, null, 'mediana', 100), 'Calculando la noche…');
  assert.equal(textoEtiquetaNoche(ctxDe('en'), noche, 'mejor', 100), 'Night 37 of 100 · the best by end time');
});

test('perder el corte: «1 noche de cada N», «k de cada 10», «ninguna» y «casi todas», con el IC de Wilson invertido', () => {
  const ctx = ctxDe();
  assert.deepEqual(textoPerderCorte(ctx, prop(90, 100, [0.8256, 0.9448])), { texto: '1 noche de cada 10', ic: '(entre 6% y 17%)' });
  assert.equal(textoPerderCorte(ctx, prop(60, 100, [0.5, 0.69])).texto, '4 de cada 10 noches');
  assert.equal(textoPerderCorte(ctx, prop(100, 100, [0.963, 1])).texto, 'ninguna de 100 noches');
  assert.equal(textoPerderCorte(ctx, prop(2, 100, [0.005, 0.07])).texto, 'casi todas las noches');
  assert.equal(textoPerderCorte(ctx, prop(97, 100, [0.9155, 0.9897])).texto, '1 noche de cada 33');
});

test('cierre del formulario: «Ya está» solo si hay recomendación; si no, dice por qué', () => {
  const ev = (recomendacion: number | null, motivo: 'ok' | 'decision-en-duda') =>
    ({ recomendacion, semaforo: { color: motivo === 'ok' ? 'verde' : 'amarillo', motivo, vars: {} } }) as unknown as EvaluacionDecision;
  assert.equal(claveCierreFormulario(ev(4, 'ok')), 'explicacion.formulario.listo');
  assert.equal(claveCierreFormulario(ev(null, 'decision-en-duda')), 'explicacion.formulario.en_duda');
  assert.equal(claveCierreFormulario(ev(null, 'ok')), 'explicacion.formulario.ninguna_cumple');
  assert.equal(claveCierreFormulario(null), 'explicacion.formulario.ninguna_cumple');
});

test('«¿y si…?» de la biografía: un cambio fijo por causa, sin repetir, y solo si tiene sentido en el modelo', () => {
  const mv = validadoSinChequeos(plantillaChica());
  const tr = { catalogo: { rampas: mv.modelo.hub.rampas.map((r) => r.id) } } as unknown as Traza;
  const espera = (causa: number, causante = -1) => ({ desde: 0, hasta: 1, donde: TipoTramo.RAMPA, recurso: 0, causa, causante, evidencia: [] }) as never;
  const bio = { clase: ClaseEntidad.PAQUETE, id: 1, titulo: { clave: 'x', vars: {}, afirmaciones: [] }, percentil: null, causas: [],
    pasos: [Causa.FILA, Causa.BLOQUEO, Causa.PAUSA, Causa.PERSONA_OCUPADA, Causa.NO_LEIDO, Causa.FALTA_BANDEJA].map((c) => ({ desde: 0, hasta: 1, frase: { clave: 'x', vars: {}, afirmaciones: [] }, espera: espera(c) }))
      .concat([{ desde: 0, hasta: 1, frase: { clave: 'x', vars: {}, afirmaciones: [] }, espera: espera(Causa.RAMPA_LLENA, refDe(ClaseEntidad.RAMPA, 6)) }]) } as Biografia;
  const cs = cambiosDe(bio, mv, tr);
  assert.deepEqual(cs.map((c) => c.clave), ['explicacion.cambio.fila', 'explicacion.cambio.pausa', 'explicacion.cambio.no_leido', 'explicacion.cambio.rampa_llena']);
  assert.deepEqual(cs[0].parche, [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }]);
  assert.deepEqual(cs[2].parche, [{ op: 'replace', path: '/parametros/noLeido/valor', value: { tipo: 'bernoulli', p: 0 } }]);
  assert.deepEqual(cs[3], { clave: 'explicacion.cambio.rampa_llena', vars: { rampa: 'R07', capacidad: 40 }, parche: [{ op: 'replace', path: '/hub/rampas/6/capacidad', value: 40 }] });
  // sin puestos físicos libres no se ofrece «un puesto más»
  const lleno = validadoSinChequeos({ ...plantillaChica(), personas: { ...plantillaChica().personas, induccion: { ...plantillaChica().personas.induccion, puestosActivos: 5 } } });
  assert.ok(!cambiosDe(bio, lleno, tr).some((c) => c.clave === 'explicacion.cambio.fila'));
});

test('resultado del contrafactual en palabras: hora con y sin el cambio, y si llega al corte', () => {
  const ctx = ctxDe();
  const cf = { cambio: { clave: 'explicacion.cambio.pausa', vars: {}, parche: [] }, antes: { listo: 93_000_000, antesDelCorte: false },
    despues: { listo: 91_200_000, antesDelCorte: true } } as unknown as Contrafactual;
  assert.equal(textoContrafactual(ctx, cf), 'Con el cambio (sin pausas) llegaría a las 01:20; sin el cambio llega a las 01:50. Llegaría antes del corte.');
  const no = { ...cf, despues: { listo: null, antesDelCorte: false } } as Contrafactual;
  assert.match(textoContrafactual(ctx, no), /tampoco llegaría/);
});

test('traza en CSV: encabezado del contrato y una fila por tramo', () => {
  const t = { tramos: { n: 2, e: Int32Array.of(5, -1), k: Uint8Array.of(TipoTramo.CINTA, TipoTramo.LAZO_MARCHA), r: Int32Array.of(1, 0), a: Int32Array.of(0, 7),
    t0: Float64Array.of(1000, 0), t1: Float64Array.of(2500, 9000), c: Uint8Array.of(0, 0), q: Int32Array.of(-1, -1) } } as unknown as Traza;
  assert.equal(trazaACsv(t), 'e,k,r,a,t0,t1,c,q\n5,11,1,0,1000,2500,0,-1\n-1,40,0,7,0,9000,0,-1\n');
});
