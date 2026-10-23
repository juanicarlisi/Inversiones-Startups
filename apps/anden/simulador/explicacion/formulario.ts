// explicacion/formulario.ts · Andén simulador, corte 1, P7 · Formulario por decisión (corte-1.md §9, P7, «Formulario»).
// Sin IA: sale de las fichas de parámetro y del ranking del tamizado. Pregunta en orden de pérdida esperada, solo lo que puede costar
// al menos la zona de indiferencia (`decision.indiferencia.valor`, en la moneda del modelo por noche), y cuando no queda nada por
// preguntar la interfaz muestra «Ya está: lo que falta no cambia la respuesta» (`MENSAJE_FORMULARIO_LISTO`).
// Si el usuario no sabe un valor, cada pregunta trae la referencia con su fuente, el rango razonable y un plan de medición.
import type { Frase } from '../contratos/explicacion.ts';
import type { ArmarFormulario, Pregunta, ResultadoTamizado } from '../contratos/decision.ts';
import type { Afirmacion } from '../contratos/explicacion.ts';
import type { Parametro } from '../contratos/modelo.ts';
import { crearFrase } from './frases.ts';
import { CV_POR_DEFECTO, ERROR_RELATIVO_POR_DEFECTO, planDeMedicion } from './medicion.ts';
import { cvDe, valorCentral } from './parametros.ts';
import { redondear } from './unidades.ts';
import type { ResultadoTamizadoConDuda } from './tamizado.ts';

/** Clave del mensaje con que termina el formulario cuando nada de lo que falta cambia la respuesta. */
export const MENSAJE_FORMULARIO_LISTO = 'explicacion.formulario.listo';
/** Cuando no quedan preguntas pero la decisión NO tiene respuesta (ninguna opción probada cumple): «Ya está» sería mentira. */
export const MENSAJE_FORMULARIO_NINGUNA_CUMPLE = 'explicacion.formulario.ninguna_cumple';
/** Cuando no quedan preguntas pero la decisión sigue en duda por el azar de las noches (faltan réplicas, no datos). */
export const MENSAJE_FORMULARIO_EN_DUDA = 'explicacion.formulario.en_duda';
/** SUPUESTO: lo que lleva anotar una observación con el cronómetro del teléfono, además de lo que dura lo medido. */
export const SEGUNDOS_DE_ANOTACION = 10;

/** Segundos por observación: si el parámetro es un tiempo («s por paquete»), lo que dura más la anotación; si no, solo la anotación. */
export function segundosPorObservacion(p: Parametro): number {
  const esTiempo = /^s(\s|$)/.test(p.unidad.trim().toLowerCase());
  const v = valorCentral(p.valor);
  return esTiempo && Number.isFinite(v) && v > 0 ? v + SEGUNDOS_DE_ANOTACION : SEGUNDOS_DE_ANOTACION;
}

function variableDe(ruta: string): 'puestos' | 'rampa' | 'reten' | 'generica' {
  if (ruta === '/personas/induccion/puestosActivos') return 'puestos';
  if (ruta === '/personas/rampa/cantidad') return 'rampa';
  if (ruta === '/personas/induccion/reten') return 'reten';
  return 'generica';
}

/** Menor cantidad de decimales (0 a 4) con que se escribe `x` sin perder nada. */
function decimalesDe(x: number): number {
  for (let d = 0; d <= 4; d++) if (Math.abs(redondear(x, d) - x) < 1e-9) return d;
  return 4;
}

function afirmarParametro(nombre: string, sufijo: 'bajo' | 'medio' | 'alto', valor: number, unidad: string): Afirmacion {
  const decimales = decimalesDe(valor);
  return { valor: redondear(valor, decimales), unidad, decimales, fuente: { tipo: 'parametro', nombre: `${nombre}.${sufijo}` } };
}

function fraseDelPorQue(r: ResultadoTamizado, nombre: string, p: Parametro, ruta: string): Frase {
  const inc = p.incierto;
  if (!inc) throw new Error(`armarFormulario: el parámetro «${nombre}» no tiene \`incierto\` y el ranking dice que importa`);
  const bajo = afirmarParametro(nombre, 'bajo', inc.bajo, p.unidad);
  const medio = afirmarParametro(nombre, 'medio', inc.medio, p.unidad);
  const alto = afirmarParametro(nombre, 'alto', inc.alto, p.unidad);
  const vars = { medio: medio.valor, bajo: bajo.valor, alto: alto.valor };
  const afirmaciones = [medio, bajo, alto];
  const [dB, dM, dA] = r.decisiones;
  if (dB === null || dM === null || dA === null) {
    // null por «ninguna opción cumple» o por «quedó en duda» (faltan noches): son frases distintas (hallazgo E-05)
    const duda = (r as Partial<ResultadoTamizadoConDuda>).enDuda;
    const ningunaCumple = ([dB, dM, dA] as (number | null)[]).some((d, i) => d === null && !(duda?.[i] ?? false));
    return crearFrase(ningunaCumple ? 'explicacion.pregunta.porque.sin_respuesta' : 'explicacion.pregunta.porque.en_duda', vars, afirmaciones);
  }
  const n = Math.max(dB, dM, dA) - Math.min(dB, dM, dA);
  // Singular con n = 1 («en 1 puesto», no «en hasta 1 puestos»): integracion/NOTAS-CONTRATO.md §1 (lo encontró P8).
  return crearFrase(`explicacion.pregunta.porque.${variableDe(ruta)}${n === 1 ? '.uno' : ''}`, { ...vars, n }, afirmaciones);
}

/**
 * Preguntas en orden de pérdida esperada (de mayor a menor), solo las que pierden al menos la zona de indiferencia. Una lista vacía
 * significa que no hay nada más que preguntar: la interfaz muestra el mensaje de `cierreDelFormulario` (`MENSAJE_FORMULARIO_LISTO` cuando
 * la decisión tiene respuesta).
 */
export const armarFormulario: ArmarFormulario = (mv, ranking) => {
  const decision = mv.modelo.decision;
  if (!decision) throw new Error('armarFormulario: el modelo no tiene `decision` y se esperaba una (con su zona de indiferencia)');
  const indiferencia = decision.indiferencia.valor;
  // Si con los valores supuestos la decisión sigue EN DUDA por el azar de las noches, «decidir hoy» no existe y la pérdida esperada (que
  // compara contra esa decisión) saldría del ruido, no de lo que no se sabe: antes de preguntar hacen falta más noches. Cuando ninguna
  // opción cumple (no hay duda, hay una respuesta: «no alcanza») sí se pregunta, porque un valor más favorable puede cambiarla.
  if (cierreDelFormulario(ranking).motivo === 'en-duda') return [];
  // se ordena una copia (el orden del tamizado ya es este, pero el formulario no depende de que se lo hayan respetado)
  const ordenado = ranking.map((r, i) => ({ r, i })).sort((a, b) => b.r.perdidaEsperada - a.r.perdidaEsperada || a.i - b.i);
  const preguntas: Pregunta[] = [];
  for (const { r } of ordenado) {
    if (!(r.perdidaEsperada >= indiferencia) || !(r.perdidaEsperada > 0)) continue;
    const p = mv.modelo.parametros[r.parametro];
    if (!p) throw new Error(`armarFormulario: el parámetro «${r.parametro}» del ranking no está en el modelo`);
    if (!p.incierto) throw new Error(`armarFormulario: el parámetro «${r.parametro}» no tiene \`incierto\` y el ranking dice que importa`);
    const central = valorCentral(p.valor);
    preguntas.push({
      parametro: r.parametro,
      orden: preguntas.length + 1,
      texto: p.pregunta ?? `«${r.parametro}» (${p.unidad})`,
      porQue: fraseDelPorQue(r, r.parametro, p, decision.variable.ruta),
      referencia: { valor: Number.isFinite(central) ? central : p.incierto.medio, fuente: p.fuente, etiqueta: p.etiqueta },
      rango: [Math.min(p.incierto.bajo, p.incierto.alto), Math.max(p.incierto.bajo, p.incierto.alto)],
      medir: planDeMedicion(r.parametro, cvDe(p.valor) ?? CV_POR_DEFECTO, ERROR_RELATIVO_POR_DEFECTO, segundosPorObservacion(p)),
      perdidaEsperada: r.perdidaEsperada,
    });
  }
  return preguntas;
};

export type CierreDelFormulario = 'listo' | 'ninguna-cumple' | 'en-duda';

/**
 * Con qué mensaje cierra el formulario cuando `armarFormulario` devuelve una lista vacía. «Ya está: lo que falta no cambia la respuesta»
 * solo es cierto si hay respuesta (una recomendación con los valores supuestos). Si la decisión con los valores supuestos no tiene
 * recomendación, se dice por qué: porque ninguna de las opciones probadas cumple (hay respuesta: «no alcanza»), o porque sigue en duda
 * por el azar de las noches (todavía no hay respuesta, y lo que falta saber no la va a dar). Mira el valor medio, que es común a todas
 * las filas del ranking; sin ranking no hay nada que mirar y vale «listo».
 */
export function cierreDelFormulario(ranking: readonly ResultadoTamizado[]): { motivo: CierreDelFormulario; clave: string } {
  if (ranking.length === 0 || ranking[0].decisiones[1] !== null) return { motivo: 'listo', clave: MENSAJE_FORMULARIO_LISTO };
  const configuraciones = ranking[0].evaluaciones?.[1]?.configuraciones ?? [];
  if (configuraciones.some((c) => c.estado === 'en-duda')) return { motivo: 'en-duda', clave: MENSAJE_FORMULARIO_EN_DUDA };
  return { motivo: 'ninguna-cumple', clave: MENSAJE_FORMULARIO_NINGUNA_CUMPLE };
}
