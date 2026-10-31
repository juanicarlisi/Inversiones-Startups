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
import { accionConB, balanceDeB, textoVeredicto } from '../pantallas/ysi.ts';
import { porcentajeContraMeta } from '../ui/resumen.ts';
import { textoMotivo } from '../ui/semaforo.ts';
import { KPIS } from '../../contratos/resultados.ts';
import { textoConfirmado, textoContrafactual } from '../pantallas/biografia.ts';
import { Causa, ClaseEntidad, TipoTramo, refDe, type Traza } from '../../contratos/traza.ts';
import type { Biografia, Contrafactual } from '../../contratos/explicacion.ts';
import type { Comparacion, EvaluacionDecision, Proporcion } from '../../contratos/experimentos.ts';
import type { ResultadoTamizado } from '../../contratos/decision.ts';
import type { NocheVista } from '../sesion.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { plantillaChica, plantillasFalsas } from '../falsos/plantillas.ts';
import { tituloModelo } from '../pantallas/comun.ts';

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
  // un supuesto que mueve la recomendación pero cuesta menos que la zona de indiferencia: «Ya está», sin prometer que nada la cambia
  // (hallazgo EST-08 de la revisión del 30-10-2026)
  const fila = (cambiaDecision: boolean) => ({ parametro: 'x', decisiones: [3, 3, cambiaDecision ? 4 : 3], cambiaDecision, perdidaEsperada: 10 }) as unknown as ResultadoTamizado;
  assert.equal(claveCierreFormulario(ev(4, 'ok'), [fila(false)]), 'explicacion.formulario.listo');
  assert.equal(claveCierreFormulario(ev(4, 'ok'), [fila(false), fila(true)]), 'app.decidir.formularioListoIndiferencia');
  assert.match(ctxDe().t('app.decidir.formularioListoIndiferencia', { indiferencia: '$ 20.000' }), /^Ya está: .*zona de indiferencia del modelo \(\$ 20\.000\)/);
  assert.equal(claveCierreFormulario(ev(null, 'decision-en-duda'), [fila(true)]), 'explicacion.formulario.en_duda');
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

test('«¿y si…?» con el semáforo (EST-01 y EST-05): B en rojo o peor en lo que decide nunca es la acción principal', () => {
  const base = ctxDe();
  const ctx = { ...base, sesion: { kpiNoche: 'finClasificacionMin', mv: validadoSinChequeos(plantillaChica()), nochesListas: false, nochesLlegadas: [] } } as unknown as Contexto;
  const comp = (kpi: Comparacion['kpi'], media: number, ic: [number, number], veredicto: Comparacion['veredicto']): Comparacion =>
    ({ kpi, n: 100, pareada: true, media, ic, veredicto, replicasSugeridas: null });
  const verde = { color: 'verde', motivo: 'ok', vars: {} } as const, rojo = { color: 'rojo', motivo: 'inestable', vars: { n: 4 } } as const;
  // B mejora la recirculación (lo único que «mejora», por noches que no terminan) y empeora el costo: antes era la acción principal
  const cs = [comp('recirculacionPct', -5, [-8, -2], 'b-mejor'), comp('finClasificacionMin', 30, [20, 40], 'a-mejor')];
  assert.deepEqual(accionConB(ctx, cs, verde, rojo), { principal: false, motivo: 'app.ysi.bRojo', vars: {} }, 'B en rojo: secundaria y se dice por qué');
  assert.equal(accionConB(ctx, cs, rojo, verde).motivo, 'app.ysi.aRojo');
  // peor en un indicador principal (el de la restricción de la decisión: paquetes que pierden el corte), aunque mejore otros dos
  const principal = [comp('pendientesAlCorte', 40, [30, 50], 'a-mejor'), comp('recirculacionPct', -5, [-8, -2], 'b-mejor'), comp('esperaP90Min', -3, [-4, -2], 'b-mejor')];
  const a = accionConB(ctx, principal, verde, verde);
  assert.equal(a.principal, false); assert.equal(a.motivo, 'app.ysi.bPeorPrincipal');
  assert.match(base.t(a.motivo!, a.vars), /paquetes que pierden el corte/);
  // mejora sin empeorar lo principal: principal
  assert.equal(accionConB(ctx, [comp('pendientesAlCorte', -40, [-50, -30], 'b-mejor')], verde, verde).principal, true);
});

test('EST-03 · ruido no es «igual»: sin veredicto y con un intervalo 16 veces el mínimo práctico se dice el rango, no «prácticamente nula»', () => {
  const base = ctxDe();
  const ctx = { ...base, sesion: { kpiNoche: 'finClasificacionMin', mv: validadoSinChequeos(plantillaChica()), nochesListas: false, nochesLlegadas: [] } } as unknown as Contexto;
  // el caso del hallazgo: recirculación −0,37 pp, IC [−1,59; +0,84], mínimo práctico 0,1 pp, 1.701 noches sugeridas
  const c = { kpi: 'recirculacionPct', n: 40, pareada: true, media: -0.374, ic: [-1.59, 0.84], veredicto: 'no-se-distingue', replicasSugeridas: 1701 } as Comparacion;
  const v = textoVeredicto(ctx, c);
  assert.equal(v.clase, 'no-se-distingue');
  assert.doesNotMatch(v.texto, /nula|igual/i);
  assert.match(v.texto, /No alcanza para saber: con 40 noches/);
  // y dentro del mínimo práctico (intervalo y promedio), sí es «iguales en la práctica»
  const chica = { ...c, media: 0.02, ic: [-0.05, 0.08] as [number, number] };
  assert.equal(textoVeredicto(ctx, chica).clase, 'igual');
});

test('EST-06 y EST-09: 199 de 200 no es «100%», el redondeo no cruza la meta y 26% no es «3 de cada 10»', () => {
  const ctx = ctxDe();
  assert.notEqual(porcentajeContraMeta(ctx, 199 / 200, 0.9), ctx.f.porcentaje(1, 0));
  assert.equal(porcentajeContraMeta(ctx, 0.8996, 0.9), ctx.f.porcentaje(0.8996, 1), 'por debajo de la meta, con un decimal');
  assert.equal(porcentajeContraMeta(ctx, 0.75, 0.9), ctx.f.porcentaje(0.75, 0));
  const prop = (exitos: number, n: number) => ({ exitos, n, p: exitos / n, ic: [exitos / n - 0.08, exitos / n + 0.08] as [number, number], metodo: 'wilson' as const, confianza: 0.95 });
  assert.match(textoPerderCorte(ctx, prop(74, 100)).texto, /1 .*cada 4/, '26% de noches que pierden el corte: «1 de cada 4»');
  assert.match(textoPerderCorte(ctx, prop(60, 100)).texto, /4 de cada 10/);
});

test('EXP-06 · ningún texto del semáforo muestra un identificador interno: el KPI va con su etiqueta en palabras', () => {
  const ctx = ctxDe();
  for (const kpi of KPIS) {
    const t = textoMotivo(ctx, { motivo: 'precision-no-lograda', vars: { kpi, pedida: 5, lograda: 59.5, replicas: 100 } });
    assert.doesNotMatch(t, /«[a-z]+[A-Z0-9][A-Za-z0-9]*»/, `el texto muestra un id crudo: ${t}`);
    assert.ok(t.includes(ctx.t(`app.kpi.${kpi}`)), `se esperaba la etiqueta de ${kpi} en: ${t}`);
  }
});

test('título del modelo: el de la plantilla pública en el idioma de la interfaz; el que escribió una persona, tal cual (hallazgo EXP-13)', () => {
  const plantillas = plantillasFalsas();
  const conPlantillas = (idioma: 'es' | 'en') => ({ ...ctxDe(idioma), servicios: { plantillas } }) as unknown as Contexto;
  const chica = plantillas['hub-chico@1.0.0'], grande = plantillas['hub-lazo-noche@1.0.0'];
  assert.equal(tituloModelo(conPlantillas('en'), chica), 'Small sorting hub, night shift');
  assert.equal(tituloModelo(conPlantillas('es'), chica), 'Hub de clasificación chico, turno noche');
  // la grande ya no promete «24.000 paquetes» exactos: cada noche trae otra cantidad
  assert.match(tituloModelo(conPlantillas('es'), grande), /≈ 24\.000 paquetes por noche/);
  assert.match(tituloModelo(conPlantillas('en'), grande), /≈ 24,000 parcels a night/);
  // un título cambiado, un modelo sin plantilla o una versión que no está en el registro: el título del modelo
  assert.equal(tituloModelo(conPlantillas('en'), { ...chica, titulo: 'Mi hub de Ezeiza' }), 'Mi hub de Ezeiza');
  assert.equal(tituloModelo(conPlantillas('en'), { titulo: 'Propio', plantilla: undefined }), 'Propio');
  assert.equal(tituloModelo(conPlantillas('en'), { ...chica, plantilla: { id: 'hub-chico', version: '1.1.0' } }), chica.titulo);
});
