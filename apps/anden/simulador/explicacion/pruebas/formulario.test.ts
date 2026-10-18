// Formulario por decisión: preguntas en orden de pérdida esperada, solo las que pierden al menos la zona de indiferencia; cuando no queda
// ninguna, «Ya está: lo que falta no cambia la respuesta». Cada pregunta trae la referencia con su fuente, el rango y el plan de medición.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { AlmacenResultados } from '../../contratos/explicacion.ts';
import type { ResultadoTamizado } from '../../contratos/decision.ts';
import type { EstadoConfiguracion, EvaluacionDecision } from '../../contratos/experimentos.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import {
  MENSAJE_FORMULARIO_EN_DUDA, MENSAJE_FORMULARIO_LISTO, MENSAJE_FORMULARIO_NINGUNA_CUMPLE, SEGUNDOS_DE_ANOTACION, armarFormulario, cierreDelFormulario,
  segundosPorObservacion,
} from '../formulario.ts';
import { verificarFrases } from '../verificador.ts';
import { modeloEjemplo, validadoEjemplo } from './ayudas.ts';

/** Una fila del ranking sin las evaluaciones (el formulario no las mira). */
function fila(parametro: string, perdida: number, decisiones: [number | null, number | null, number | null] = [2, 2, 4]): ResultadoTamizado {
  return {
    parametro, decisiones, cambiaDecision: decisiones.some((d) => d !== decisiones[1]), perdidaEsperada: perdida, corrimientoObjetivo: 0, replicas: 120,
    evaluaciones: [null, null, null] as never,
  };
}
const es: Record<string, string> = JSON.parse(readFileSync(new URL('../textos.es.json', import.meta.url), 'utf8'));
const texto = (clave: string, vars: Record<string, string | number>) => es[clave].replace(/\{(\w+)\}/g, (_, n: string) => String(vars[n]).replace('.', ','));

const INDIFERENCIA = 20000;   // del ejemplo: $ 20.000 por noche

test('la zona de indiferencia del ejemplo es de $ 20.000 por noche', () => {
  assert.equal(validadoEjemplo().modelo.decision!.indiferencia.valor, INDIFERENCIA);
});

test('preguntas en orden de pérdida esperada (de mayor a menor), solo las que pierden al menos la zona de indiferencia', () => {
  const mv = validadoEjemplo();
  const ranking = [fila('ausentismo', 15000), fila('induccionBase', 80000), fila('ritmoDescarga', 20000), fila('manejoRampa', 45000), fila('noLeido', 0, [2, 2, 2])];
  const q = armarFormulario(mv, ranking);
  assert.deepEqual(q.map((x) => x.parametro), ['induccionBase', 'manejoRampa', 'ritmoDescarga'], '20.000 justos entra (≥), 15.000 no');
  assert.deepEqual(q.map((x) => x.orden), [1, 2, 3]);
  assert.deepEqual(q.map((x) => x.perdidaEsperada), [80000, 45000, 20000]);
});

test('cuando nada supera la zona de indiferencia no queda ninguna pregunta: el mensaje es «Ya está: lo que falta no cambia la respuesta»', () => {
  const mv = validadoEjemplo();
  const ranking = [fila('ausentismo', 19999), fila('induccionBase', 5000), fila('noLeido', 0, [2, 2, 2])];
  assert.deepEqual(armarFormulario(mv, ranking), []);
  assert.deepEqual(armarFormulario(mv, []), []);
  assert.equal(MENSAJE_FORMULARIO_LISTO, 'explicacion.formulario.listo');
  assert.equal(es[MENSAJE_FORMULARIO_LISTO], 'Ya está: lo que falta no cambia la respuesta.');
});

test('con indiferencia 0 igual no se pregunta lo que no pierde nada', () => {
  const m = modeloEjemplo();
  m.decision!.indiferencia.valor = 0;
  const q = armarFormulario(validadoSinChequeos(m), [fila('induccionBase', 10), fila('noLeido', 0, [2, 2, 2])]);
  assert.deepEqual(q.map((x) => x.parametro), ['induccionBase']);
});

test('el formulario ordena por sí mismo, aunque el ranking le llegue desordenado', () => {
  const q = armarFormulario(validadoEjemplo(), [fila('ritmoDescarga', 30000), fila('induccionBase', 90000), fila('manejoRampa', 60000)]);
  assert.deepEqual(q.map((x) => x.parametro), ['induccionBase', 'manejoRampa', 'ritmoDescarga']);
});

test('cada pregunta: el texto en criollo de la ficha, la referencia con su fuente y etiqueta, el rango y el plan de medición', () => {
  const mv = validadoEjemplo();
  const [q] = armarFormulario(mv, [fila('induccionBase', 80000)]);
  const p = mv.modelo.parametros.induccionBase;
  assert.equal(q.texto, '¿Cuántos paquetes por hora mete una persona en un puesto de inducción?');
  assert.deepEqual(q.referencia, { valor: 2.4, fuente: p.fuente, etiqueta: 'ESTIMACION' });
  assert.deepEqual(q.rango, [2.25, 4.5]);
  // lognormal con cv 0,35: (1,96 · 0,35 ÷ 0,15)² = 20,9 → 21 observaciones; 2,4 s + 10 s de anotación = 12,4 s → 21 · 12,4 = 260 s → 5 min
  assert.equal(q.medir.parametro, 'induccionBase');
  assert.equal(q.medir.cv, 0.35);
  assert.equal(q.medir.errorRelativo, 0.15);
  assert.equal(q.medir.observaciones, 21);
  assert.equal(q.medir.minutos, 5);
});

test('un parámetro sin `pregunta` usa su nombre y su unidad; el cv que no trae la distribución es 0,5 (62 observaciones se ven en medicion.test.ts)', () => {
  const m = modeloEjemplo();
  m.parametros.errorPronosticoCv.pregunta = undefined;
  const [q] = armarFormulario(validadoSinChequeos(m), [fila('errorPronosticoCv', 50000)]);
  assert.equal(q.texto, '«errorPronosticoCv» (coeficiente de variación del volumen del día)');
  assert.equal(q.medir.cv, 0.5, 'un número no trae cv');
  assert.equal(q.medir.observaciones, 43);   // (1,96 · 0,5 ÷ 0,15)² = 42,68
  // el ausentismo es una probabilidad por persona y noche: cada observación es anotar una noche
  assert.equal(segundosPorObservacion(m.parametros.ausentismo), SEGUNDOS_DE_ANOTACION);
});

test('segundos por observación: lo que dura lo medido más la anotación, solo si la unidad es un tiempo', () => {
  const m = modeloEjemplo();
  assert.equal(segundosPorObservacion(m.parametros.induccionBase), 2.4 + SEGUNDOS_DE_ANOTACION);
  assert.equal(segundosPorObservacion(m.parametros.ritmoDescarga), 5 + SEGUNDOS_DE_ANOTACION);
  assert.equal(segundosPorObservacion(m.parametros.noLeido), SEGUNDOS_DE_ANOTACION, 'una probabilidad: solo anotar');
  assert.equal(segundosPorObservacion(m.parametros.costoHoraPersona), SEGUNDOS_DE_ANOTACION, '«ARS por hora pagada» no es un tiempo');
});

test('el «por qué» es una frase verificable: dice cuánto cambia la respuesta y sus tres valores salen de la ficha del parámetro', () => {
  const mv = validadoEjemplo();
  const almacen: AlmacenResultados = { experimentos: {}, trazas: {}, modelo: mv.modelo };
  const q = armarFormulario(mv, [fila('induccionBase', 80000, [2, 2, 4])])[0];
  assert.equal(q.porQue.clave, 'explicacion.pregunta.porque.puestos');
  assert.deepEqual(q.porQue.vars, { medio: 2.4, bajo: 2.25, alto: 4.5, n: 2 });
  assert.equal(texto(q.porQue.clave, q.porQue.vars), 'Hoy suponemos 2,4; con 2,25 o con 4,5 la respuesta cambia en hasta 2 puestos.');
  assert.deepEqual(q.porQue.afirmaciones.map((a) => a.fuente), [
    { tipo: 'parametro', nombre: 'induccionBase.medio' }, { tipo: 'parametro', nombre: 'induccionBase.bajo' }, { tipo: 'parametro', nombre: 'induccionBase.alto' },
  ]);
  assert.deepEqual(verificarFrases([q.porQue], almacen).fallas, []);
  // si alguien toca un valor de la frase, el verificador lo atrapa
  const tocada = { ...q.porQue, afirmaciones: q.porQue.afirmaciones.map((a, i) => (i === 2 ? { ...a, valor: 4.6 } : a)) };
  assert.deepEqual(verificarFrases([tocada], almacen).fallas, [{ frase: 0, afirmacion: 2, motivo: 'valor-distinto' }]);
});

test('el «por qué» según la variable de la decisión; y cuando en algún valor ninguna opción probada alcanza, lo dice', () => {
  const clave = (ruta: string, d: [number | null, number | null, number | null] = [2, 3, 5]) => {
    const m = modeloEjemplo();
    m.decision!.variable.ruta = ruta;
    return armarFormulario(validadoSinChequeos(m), [fila('induccionBase', 80000, d)])[0].porQue;
  };
  assert.equal(clave('/personas/induccion/puestosActivos').clave, 'explicacion.pregunta.porque.puestos');
  assert.equal(clave('/personas/rampa/cantidad').clave, 'explicacion.pregunta.porque.rampa');
  assert.equal(clave('/personas/induccion/reten').clave, 'explicacion.pregunta.porque.reten');
  assert.equal(clave('/hub/sorter/maxVueltas').clave, 'explicacion.pregunta.porque.generica');
  assert.equal(clave('/personas/induccion/puestosActivos', [2, 3, 5]).vars.n, 3, 'del 2 al 5');
  const sinRespuesta = clave('/personas/induccion/puestosActivos', [2, 2, null]);
  assert.equal(sinRespuesta.clave, 'explicacion.pregunta.porque.sin_respuesta');
  assert.equal('n' in sinRespuesta.vars, false);
});

test('errores: modelo sin decisión, parámetro del ranking que no está o sin `incierto`', () => {
  const m = modeloEjemplo();
  delete m.decision;
  assert.throws(() => armarFormulario(validadoSinChequeos(m), []), /el modelo no tiene `decision`/);
  assert.throws(() => armarFormulario(validadoEjemplo(), [fila('noExiste', 90000)]), /el parámetro «noExiste» del ranking no está en el modelo/);
  assert.throws(() => armarFormulario(validadoEjemplo(), [fila('costoHoraPersona', 90000)]), /el parámetro «costoHoraPersona» no tiene `incierto`/);
  // lo que no pasa el umbral no se mira: un parámetro raro con pérdida 0 no rompe nada
  assert.deepEqual(armarFormulario(validadoEjemplo(), [fila('noExiste', 0, [2, 2, 2])]), []);
});

// ------------------------------------------------------------------------------------------------- con qué mensaje se cierra

/** Una fila cuyo valor medio fue evaluado con estos estados por configuración (2, 3, 4 y 5 puestos) y esta recomendación. */
function filaEvaluada(recomendacion: number | null, estados: EstadoConfiguracion[]): ResultadoTamizado {
  const medio = {
    decision: 'dotacion-induccion', recomendacion, replicasUsadas: 40, semaforo: { color: 'verde', motivo: 'ok', vars: {} },
    configuraciones: estados.map((estado, i) => ({ valor: i + 2, estado })),
  } as unknown as EvaluacionDecision;
  const r = fila('induccionBase', 0, [recomendacion, recomendacion, recomendacion]);
  return { ...r, evaluaciones: [medio, medio, medio] };
}

test('cierre del formulario: «Ya está» solo cuando hay respuesta; si ninguna opción cumple, o sigue en duda, el mensaje lo dice', () => {
  assert.deepEqual(cierreDelFormulario([]), { motivo: 'listo', clave: MENSAJE_FORMULARIO_LISTO }, 'sin supuestos no hay nada que preguntar');
  assert.equal(cierreDelFormulario([filaEvaluada(3, ['no-cumple', 'cumple', 'cumple', 'cumple'])]).motivo, 'listo');
  const ninguna = cierreDelFormulario([filaEvaluada(null, ['no-cumple', 'no-cumple', 'no-cumple', 'no-cumple'])]);
  assert.deepEqual(ninguna, { motivo: 'ninguna-cumple', clave: MENSAJE_FORMULARIO_NINGUNA_CUMPLE });
  const duda = cierreDelFormulario([filaEvaluada(null, ['no-cumple', 'no-cumple', 'en-duda', 'cumple'])]);
  assert.deepEqual(duda, { motivo: 'en-duda', clave: MENSAJE_FORMULARIO_EN_DUDA });
  assert.match(es[ninguna.clave], /ninguna de las opciones probadas cumple lo que pediste/);
  assert.match(es[duda.clave], /sigue en duda/);
  assert.doesNotMatch(es[ninguna.clave] + es[duda.clave], /Ya está/, 'estos mensajes no prometen que está todo dicho');
  // sin las evaluaciones a mano (filas armadas a mano) y sin recomendación: no se afirma "en duda", se dice que no hay opción que cumpla
  assert.equal(cierreDelFormulario([fila('induccionBase', 0, [null, null, null])]).motivo, 'ninguna-cumple');
});

test('el ranking real de un modelo donde ninguna opción cumple no termina en «Ya está»: lista vacía de preguntas y mensaje «ninguna cumple»', () => {
  const mv = validadoEjemplo();
  const ranking = [filaEvaluada(null, ['no-cumple', 'no-cumple', 'no-cumple', 'no-cumple']), { ...filaEvaluada(null, ['no-cumple', 'no-cumple', 'no-cumple', 'no-cumple']), parametro: 'ausentismo' }];
  assert.deepEqual(armarFormulario(mv, ranking), []);
  assert.equal(cierreDelFormulario(ranking).clave, 'explicacion.formulario.ninguna_cumple');
});

test('con la decisión EN DUDA al valor supuesto no se pregunta nada (la pérdida saldría del ruido): primero hacen falta más noches', () => {
  const mv = validadoEjemplo();
  const enDuda = filaEvaluada(null, ['no-cumple', 'no-cumple', 'en-duda', 'cumple']);
  // con el valor bajo alcanzaban 3 puestos: contra «decidir hoy» (que no existe) la pérdida parece enorme, pero es un artefacto de la duda
  const ranking = [{ ...enDuda, decisiones: [3, null, null] as ResultadoTamizado['decisiones'], perdidaEsperada: 90000 }];
  assert.deepEqual(armarFormulario(mv, ranking), []);
  assert.equal(cierreDelFormulario(ranking).motivo, 'en-duda');
});

test('con la decisión sin opción que cumpla (no hay duda) sí se pregunta lo que puede cambiarla: con un valor más favorable alcanzan 3 puestos', () => {
  const mv = validadoEjemplo();
  const ninguna = filaEvaluada(null, ['no-cumple', 'no-cumple', 'no-cumple', 'no-cumple']);
  const ranking = [{ ...ninguna, parametro: 'ausentismo', decisiones: [3, null, null] as ResultadoTamizado['decisiones'], perdidaEsperada: 90000 }];
  const q = armarFormulario(mv, ranking);
  assert.deepEqual(q.map((x) => x.parametro), ['ausentismo']);
  assert.equal(q[0].porQue.clave, 'explicacion.pregunta.porque.sin_respuesta');
});
