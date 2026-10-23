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
import { balanceDeB } from '../pantallas/ysi.ts';
import { textoConfirmado, textoContrafactual } from '../pantallas/biografia.ts';
import { Causa, ClaseEntidad, TipoTramo, refDe, type Traza } from '../../contratos/traza.ts';
import type { Biografia, Contrafactual } from '../../contratos/explicacion.ts';
import type { Comparacion, EvaluacionDecision, Proporcion } from '../../contratos/experimentos.ts';
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
  assert.equal(textoContrafactual(ctx, cf), 'Repetida la noche sin pausas, llegaría a las 01:20 (tal como está, llega a las 01:50). Con el cambio llega antes del corte.');
  // con el cambio no llega: «tampoco» solo si tal como está tampoco llega
  const no = { ...cf, despues: { listo: null, antesDelCorte: false } } as Contrafactual;
  assert.equal(textoContrafactual(ctx, no), 'Repetida la noche sin pausas, no llegaría a una jaula esta noche (tal como está, llega a las 01:50).');
  const ninguna = { ...cf, antes: { listo: null, antesDelCorte: false }, despues: { listo: null, antesDelCorte: false } } as Contrafactual;
  assert.match(textoContrafactual(ctx, ninguna), /tampoco llegaría a una jaula esta noche \(tal como está: no llega\)/);
  // tal como está no llega y con el cambio sí (antes salía «llega a las no llega»)
  const rescata = { ...cf, antes: { listo: null, antesDelCorte: false } } as Contrafactual;
  assert.equal(textoContrafactual(ctx, rescata), 'Repetida la noche sin pausas, llegaría a las 01:20 (tal como está, no llega a una jaula esta noche). Con el cambio llega antes del corte.');
  assert.equal(textoConfirmado(ctx, rescata), 'Repetida sin pausas: llegaba a las 01:20; tal como está, no llega a una jaula esta noche.');
  assert.equal(textoConfirmado(ctx, cf), 'Repetida sin pausas: llegaba a las 01:20, no a las 01:50.');
  // si ya llegaba antes del corte, el corte no se menciona; a la misma hora, se dice que el cambio no lo adelanta (integración, I-3)
  const yaLlegaba = { ...cf, antes: { listo: 93_000_000, antesDelCorte: true }, despues: { listo: 91_200_000, antesDelCorte: true } } as Contrafactual;
  assert.equal(textoContrafactual(ctx, yaLlegaba), 'Repetida la noche sin pausas, llegaría a las 01:20 (tal como está, llega a las 01:50).');
  const igual = { ...cf, antes: { listo: 93_000_000, antesDelCorte: true }, despues: { listo: 93_010_000, antesDelCorte: true } } as Contrafactual;
  assert.equal(textoContrafactual(ctx, igual), 'Repetida la noche sin pausas, llega a la misma hora (01:50): a este paquete ese cambio no lo adelanta.');
});

test('traza en CSV: encabezado del contrato y una fila por tramo', () => {
  const t = { tramos: { n: 2, e: Int32Array.of(5, -1), k: Uint8Array.of(TipoTramo.CINTA, TipoTramo.LAZO_MARCHA), r: Int32Array.of(1, 0), a: Int32Array.of(0, 7),
    t0: Float64Array.of(1000, 0), t1: Float64Array.of(2500, 9000), c: Uint8Array.of(0, 0), q: Int32Array.of(-1, -1) } } as unknown as Traza;
  assert.equal(trazaACsv(t), 'e,k,r,a,t0,t1,c,q\n5,11,1,0,1000,2500,0,-1\n-1,40,0,7,0,9000,0,-1\n');
});

test('«¿y si…?»: si B no mejora ningún indicador y empeora alguno, se dice (y «Quedarme con B» deja de ser lo principal)', () => {
  const base = ctxDe();
  const ctx = { ...base, sesion: { kpiNoche: 'finClasificacionMin', mv: validadoSinChequeos(plantillaChica()), nochesListas: false, nochesLlegadas: [] } } as unknown as Contexto;
  const comp = (kpi: Comparacion['kpi'], media: number, ic: [number, number], veredicto: Comparacion['veredicto']): Comparacion =>
    ({ kpi, n: 40, pareada: true, media, ic, veredicto, replicasSugeridas: null });
  // el costo por paquete sube $ 7,24 (más que la indiferencia: $ 20.000 por noche ÷ 8.000 paquetes = $ 2,50): A es mejor
  const peorCosto = comp('costoPorPaquete', 7.24, [7.17, 7.31], 'a-mejor');
  // la hora de fin se corre 0,3 min: «a-mejor» para la estadística, pero igual en la práctica (menos de 1 min)
  const finIgual = comp('finClasificacionMin', 0.3, [0.1, 0.5], 'a-mejor');
  const menosPerdidos = comp('pendientesAlCorte', -50, [-60, -40], 'b-mejor');
  assert.deepEqual(balanceDeB(ctx, [peorCosto, finIgual]), { mejoran: 0, empeoran: 1 }, 'lo igual en la práctica no cuenta como empeorar');
  assert.deepEqual(balanceDeB(ctx, [peorCosto, finIgual, menosPerdidos]), { mejoran: 1, empeoran: 1 });
  assert.match(base.t('app.ysi.bPeor'), /A es mejor/);
});
