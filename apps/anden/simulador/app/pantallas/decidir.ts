// app/pantallas/decidir.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 6: decidir.
// La pregunta de la decisión, la evaluación por valor (probabilidad de cumplir con su IC de Wilson, estado y costo medio), la
// recomendación con su semáforo, y el formulario por decisión: solo las preguntas cuyo supuesto cambia la respuesta, en orden de pérdida
// esperada, con por qué, la referencia con su insignia, el rango y cómo medirlo. Contestar una pregunta cambia el modelo (dato propio) y
// vuelve a decidir. Todo es cancelable; cancelar no es un error.
import type { Contexto, Montar } from '../contexto.ts';
import type { EvaluacionDecision } from '../../contratos/experimentos.ts';
import type { Pregunta, ResultadoTamizado } from '../../contratos/decision.ts';
import type { Etiqueta } from '../../contratos/tipos-base.ts';
import { el, limpiezas, poner, reconciliar } from '../ui/dom.ts';
import { cabecera, progreso, tarjeta } from '../ui/tarjeta.ts';
import { tabla } from '../ui/tabla.ts';
import { detalleSemaforo } from '../ui/semaforo.ts';
import { insignia } from '../ui/insignia.ts';
import { botonVolver } from './comun.ts';
import { porcentajeContraMeta } from '../ui/resumen.ts';

function textoRecomendacion(ctx: Contexto, ev: EvaluacionDecision): string {
  // con el semáforo en rojo («no usar») no se recomienda nada, aunque la cuenta dé un valor
  if (ev.semaforo.color === 'rojo') return ctx.t('app.decidir.sinRecomendacionRojo');
  if (ev.recomendacion !== null) return ctx.t('experimentos.recomendacion.valor', { valor: ev.recomendacion });
  return ctx.t(ev.semaforo.motivo === 'decision-en-duda' ? 'experimentos.recomendacion.en-duda' : 'experimentos.recomendacion.ninguna-cumple');
}

/**
 * Mensaje de cierre del formulario cuando no queda ninguna pregunta que cambie la respuesta (explicacion/NOTAS-CONTRATO.md §11).
 * «Lo que falta no cambia la respuesta» solo es cierto si ningún supuesto del tamizado la cambia. El formulario deja afuera lo que
 * cuesta menos que la zona de indiferencia aunque mueva la recomendación (`cambiaDecision`): en ese caso el cierre lo dice así, con la
 * zona de indiferencia, y no promete que la respuesta no cambia (hallazgo EST-08 de la revisión del 30-10-2026).
 */
export function claveCierreFormulario(ev: EvaluacionDecision | null, ranking: readonly ResultadoTamizado[] | null = null): string {
  if (ev && ev.semaforo.color === 'rojo') return 'app.decidir.formularioRojo';
  if (ev && ev.recomendacion !== null) return ranking?.some((r) => r.cambiaDecision) ? 'app.decidir.formularioListoIndiferencia' : 'explicacion.formulario.listo';
  if (ev && ev.semaforo.motivo === 'decision-en-duda') return 'explicacion.formulario.en_duda';
  return 'explicacion.formulario.ninguna_cumple';
}

/**
 * Cuando ninguna opción probada cumple, la pantalla no termina en un callejón (hallazgo UX-03): ofrece probar más opciones (hasta el
 * máximo físico si la variable son puestos de inducción) o una meta menos exigente. Cada salida cambia la decisión del modelo con un
 * parche y vuelve a decidir.
 */
function salidasSinRespuesta(ctx: Contexto): HTMLElement | null {
  const s = ctx.sesion, m = s.mv?.modelo, d = m?.decision;
  if (!m || !d) return null;
  const botones: HTMLElement[] = [];
  const fisicos = d.variable.ruta === '/personas/induccion/puestosActivos' ? m.hub.induccion.puestos.length : Infinity;
  const nuevoMax = Math.min(fisicos, d.variable.max + 3);
  if (nuevoMax > d.variable.max) {
    botones.push(el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'decidir-mas-opciones',
      onclick: () => void s.cambiarDecision([{ op: 'replace', path: '/decision/variable/max', value: nuevoMax }]) },
    ctx.t('app.decidir.masOpciones', { max: nuevoMax })));
  }
  const meta = d.restriccion.probabilidadMinima;
  const otra = meta > 0.8 + 1e-9 ? 0.8 : meta > 0.5 + 1e-9 ? 0.5 : null;
  if (otra !== null) {
    const cada = Math.round(1 / (1 - otra));
    botones.push(el('button', { type: 'button', class: 'boton', 'data-accion': 'decidir-otra-meta',
      onclick: () => void s.cambiarDecision([
        { op: 'replace', path: '/decision/restriccion/probabilidadMinima', value: otra },
        { op: 'replace', path: '/decision/restriccion/dichoComo', value: ctx.t('app.decidir.metaDicha', { cada }) },
      ]) }, ctx.t('app.decidir.otraMeta', { cada })));
  }
  if (!botones.length) return el('p', { class: 'nota' }, ctx.t('app.decidir.sinSalida'));
  return el('div', { class: 'decidir__salidas', 'data-decidir': 'salidas' }, el('p', null, ctx.t('app.decidir.salidas')), ...botones);
}

/**
 * Tope de noches por opción que ofrece «Seguir simulando»: hasta acá la regla secuencial sigue calibrada con la distribución exacta
 * (experimentos/estadistica/secuencial.ts › MAX_REPLICAS_CALIBRACION; la interfaz no importa ese paquete, por eso se repite el número).
 */
export const TOPE_NOCHES_SEGUIR = 2000;

/**
 * Cuántas noches por opción pedir al «Seguir simulando» (hallazgo EST-04): el doble de las de hoy, o las que el semáforo dice que
 * faltan o que hacen falta como mínimo para la meta, si son más; en múltiplos de 20 (una tanda) y como mucho `TOPE_NOCHES_SEGUIR`.
 * `null` si ya no hay margen (el máximo ya está en el tope, o la meta pide más noches que el tope aunque todas cumplieran).
 */
export function maximoParaSeguir(actual: number, vars: Record<string, string | number> | undefined): number | null {
  const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
  const minimas = vars?.minimas === undefined ? null : num(vars.minimas) ?? Infinity;
  if (minimas !== null && minimas > TOPE_NOCHES_SEGUIR) return null;
  const faltan = num(vars?.faltan);
  const pedido = Math.max(2 * actual, minimas ?? 0, faltan !== null ? actual + faltan : 0);
  const nuevo = Math.min(TOPE_NOCHES_SEGUIR, Math.ceil(pedido / 20) * 20);
  return nuevo > actual ? nuevo : null;
}

/**
 * Con la decisión en duda al llegar al máximo de noches, la pantalla no termina en «faltarían unas N noches» sin forma de pedirlas
 * (hallazgo EST-04): ofrece seguir simulando con un máximo mayor. Cambia `experimento.replicasMax` con un parche y vuelve a decidir
 * (con la misma suerte: las noches 0…N de cada opción son las mismas).
 */
function seguirSimulando(ctx: Contexto, ev: EvaluacionDecision): HTMLElement | null {
  const s = ctx.sesion, m = s.mv?.modelo;
  if (!m || ev.semaforo.color === 'rojo' || ev.semaforo.motivo !== 'decision-en-duda') return null;
  const actual = m.experimento.replicasMax;
  const nuevo = maximoParaSeguir(actual, ev.semaforo.vars);
  if (nuevo === null) return null;
  return el('div', { class: 'decidir__salidas', 'data-decidir': 'seguir' },
    el('p', null, ctx.t('app.decidir.seguirNota', { actual })),
    el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'decidir-seguir',
      onclick: () => void s.cambiarDecision([{ op: 'replace', path: '/experimento/replicasMax', value: nuevo }]) },
    ctx.t('app.decidir.seguir', { max: nuevo })));
}

function tarjetaPregunta(ctx: Contexto, p: Pregunta): HTMLElement {
  const unidad = ctx.sesion.mv?.modelo.parametros[p.parametro]?.unidad ?? '';
  const id = `respuesta-${p.parametro}`;
  const entrada = el('input', { type: 'text', id, class: 'campo', inputmode: 'decimal', autocomplete: 'off', placeholder: ctx.f.numero(p.referencia.valor), 'data-accion': `respuesta-${p.parametro}` });
  const error = el('p', { class: 'campo__error', role: 'alert' });
  const usar = el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': `usar-${p.parametro}`, onclick: () => {
    const v = Number(String(entrada.value).replace(',', '.'));
    if (!Number.isFinite(v) || entrada.value.trim() === '') { error.textContent = ctx.t('app.decidir.numeroInvalido'); return; }
    // el rango de validez del parámetro (el del compilador), no el de «incierto»: un dato propio puede salirse de lo que suponíamos
    const r = ctx.sesion.mv?.modelo.parametros[p.parametro]?.rango;
    if (r && (v < r[0] || v > r[1])) {
      error.textContent = ctx.t('app.decidir.fueraDeRango', { min: ctx.f.numero(r[0]), max: ctx.f.numero(r[1]), unidad });
      return;
    }
    error.textContent = '';
    void ctx.sesion.responder(p.parametro, v);
  } }, ctx.t('app.decidir.usar'));
  // si el parámetro no trae su pregunta en criollo, se pregunta por lo que mide (su unidad), nunca por su nombre interno
  const conPregunta = !!ctx.sesion.mv?.modelo.parametros[p.parametro]?.pregunta;
  const textoPregunta = el('h3', { class: 'pregunta__texto' });
  textoPregunta.textContent = conPregunta || !unidad ? p.texto : ctx.t('app.decidir.preguntaPorUnidad', { unidad });
  const fuente = el('span', { class: 'pregunta__fuente' }); fuente.textContent = p.referencia.fuente;
  // la pregunta en criollo suele hablar de paquetes por hora y el parámetro está en segundos por paquete: se muestran los dos, para
  // que nadie tenga que hacer la cuenta (revisión de la experiencia, I-3: «¿cuántos paquetes por hora…?» y «Referencia: 2,4 s»)
  const porHora = /^s por paquete\b/.test(unidad) && p.referencia.valor > 0 && p.rango[0] > 0;
  const h = (seg: number) => ctx.f.numero(3600 / seg, 0);
  return el('li', { class: 'pregunta', 'data-pregunta': p.parametro },
    el('span', { class: 'pregunta__orden', 'aria-hidden': 'true' }, String(p.orden)), textoPregunta,
    el('p', { class: 'pregunta__porque' }, ctx.t(p.porQue.clave, p.porQue.vars)),
    el('p', { class: 'pregunta__referencia' }, ctx.t('app.decidir.referencia', { valor: ctx.f.numero(p.referencia.valor), unidad }),
      porHora ? ` ${ctx.t('app.decidir.equivalePorHora', { n: h(p.referencia.valor) })}` : '', ' ',
      insignia(ctx, p.referencia.etiqueta as Etiqueta), ' ', fuente),
    el('p', { class: 'pregunta__rango' }, porHora
      ? ctx.t('app.decidir.rangoPorHora', { bajo: ctx.f.numero(p.rango[0]), alto: ctx.f.numero(p.rango[1]), unidad, hBajo: h(p.rango[1]), hAlto: h(p.rango[0]) })
      : ctx.t('app.decidir.rango', { bajo: ctx.f.numero(p.rango[0]), alto: ctx.f.numero(p.rango[1]), unidad })),
    el('p', { class: 'pregunta__medir' }, ctx.t('app.decidir.medilo', { observaciones: p.medir.observaciones, minutos: p.medir.minutos,
      error: ctx.f.numero(p.medir.errorRelativo * 100, 0) })),
    el('div', { class: 'pregunta__respuesta' }, el('label', { for: id, class: 'campo__etiqueta' }, ctx.t('app.decidir.tuDato', { unidad })), entrada, usar), error);
}

/** Estimación del tiempo que falta de una tarea con progreso (hechas de total), a partir de lo que tardó hasta ahora (hallazgo UX-16). */
function estimarRestante(inicio: number, hechas: number, total: number): number | null {
  if (!(hechas >= 1) || !(total > hechas)) return null;
  const transcurrido = performance.now() - inicio;
  return (transcurrido / hechas) * (total - hechas);
}

export const montarDecidir: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  const mv = s.mv;
  if (!mv) { ctx.ir('inicio'); return () => {}; }
  const d = mv.modelo.decision;
  if (!d) {
    raiz.append(cabecera(ctx.t('app.decidir.titulo'), botonVolver(ctx)), el('p', null, ctx.t('app.decidir.sinDecision')));
    raiz.dataset.listo = '1';
    return () => L.correr();
  }
  const pregunta = el('p', { class: 'decidir__pregunta' }); pregunta.textContent = d.pregunta;
  const meta = el('p', { class: 'decidir__meta' }); meta.textContent = ctx.t('app.decidir.meta', { meta: d.restriccion.dichoComo });
  const progresoCaja = el('div', { class: 'decidir__progreso', 'aria-live': 'polite' });
  const evaluacion = el('div', { class: 'decidir__evaluacion' });
  const formulario = el('div', { class: 'decidir__formulario' });
  const respuestas = el('div', { class: 'decidir__respuestas' });
  raiz.append(cabecera(ctx.t('app.decidir.titulo'), botonVolver(ctx)), tarjeta(null, 'decidir__cabeza', pregunta, meta), progresoCaja,
    tarjeta(ctx.t('app.decidir.evaluacion'), '', evaluacion), tarjeta(ctx.t('app.decidir.formulario'), '', respuestas, formulario));

  // cuándo empezó cada fase, para estimar cuánto falta
  let fasePrevia = '', inicioFase = performance.now();
  const pintar = () => {
    const x = s.decision;
    if (x.fase !== fasePrevia) { fasePrevia = x.fase; inicioFase = performance.now(); }
    const cancelar = el('button', { type: 'button', class: 'boton', 'data-accion': 'cancelar-decision', onclick: () => s.cancelarDecision() }, ctx.t('app.decidir.cancelar'));
    const falta = (hechas: number, total: number) => {
      const ms = estimarRestante(inicioFase, hechas, total);
      return ms === null ? '' : ` ${ctx.t('app.decidir.falta', { tiempo: ctx.f.duracion(Math.max(1000, ms)) })}`;
    };
    if (x.fase === 'evaluando') {
      // reconciliar: el botón «Cancelar» con foco sobrevive a cada noche que llega (hallazgo EXP-01)
      reconciliar(progresoCaja, progreso(x.maximo ? x.hechas / x.maximo : null, ctx.t('app.decidir.evaluando', { hechas: x.hechas })), cancelar);
    } else if (x.fase === 'tamizando') {
      // hasta saber cuántos supuestos hay, progreso indeterminado (nunca «0 de 0»); la recomendación ya está arriba y se puede usar
      reconciliar(progresoCaja, progreso(x.maximo ? x.hechas / x.maximo : null,
        x.maximo ? ctx.t('app.decidir.tamizando', { hechas: x.hechas, total: x.maximo }) + falta(x.hechas, x.maximo) : ctx.t('app.decidir.tamizandoEmpieza')), cancelar);
    } else if (x.fase === 'cancelado') {
      poner(progresoCaja, el('p', { class: 'nota' }, ctx.t('app.decidir.cancelado')),
        el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'reanudar-decision', onclick: () => void s.decidir() }, ctx.t('app.decidir.reanudar')));
    } else if (x.fase === 'nada') {
      poner(progresoCaja, el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'evaluar-decision', onclick: () => void s.decidir() }, ctx.t('app.decidir.evaluar')));
    } else progresoCaja.replaceChildren();
    const ev = x.evaluacion;
    if (ev) {
      const moneda = mv.modelo.costos.moneda;
      const rojo = ev.semaforo.color === 'rojo';
      // con el semáforo en rojo («No usar») la tabla no muestra números (hallazgo E-02): solo las opciones y su estado
      const conf = ev.configuraciones[0]?.prop.confianza;
      const ninguna = !rojo && ev.recomendacion === null && ev.semaforo.motivo !== 'decision-en-duda';
      const enElBorde = !rojo && ev.recomendacion !== null && ev.recomendacion === d.variable.min;
      poner(evaluacion,
        // la probabilidad va con el intervalo por mirada (la nota de abajo) y el costo con el de la decisión: cada uno dice el suyo (EST-07)
        tabla([ctx.t('app.decidir.col.valor'), ctx.t('app.decidir.col.prob'), ctx.t('app.decidir.col.estado'),
          ctx.t('app.decidir.col.costo', { conf: ctx.f.porcentaje(ev.configuraciones[0]?.objetivo.confianza ?? d.confianza, 0) }), ctx.t('app.decidir.col.noches')],
          ev.configuraciones.map((c) => [String(c.valor),
            // 199 de 200 no es «100%» y 0,8996 contra la meta 0,90 no es «90%» (hallazgo EST-06)
            rojo ? '—' : ctx.t('app.decidir.prob', { p: porcentajeContraMeta(ctx, c.prop.p, d.restriccion.probabilidadMinima), bajo: porcentajeContraMeta(ctx, c.prop.ic[0], d.restriccion.probabilidadMinima), alto: porcentajeContraMeta(ctx, c.prop.ic[1], d.restriccion.probabilidadMinima) }),
            el('span', { class: `estado-config estado-config--${c.estado}` }, ctx.t(`experimentos.estado.${c.estado}`)),
            rojo ? '—' : ctx.t('app.decidir.costo', { media: ctx.f.moneda(c.objetivo.media, moneda), mas: ctx.f.moneda(c.objetivo.semiancho, moneda) }),
            ctx.f.numero(c.prop.n, 0)]),
          { titulo: ctx.t('app.decidir.tablaTitulo', { variable: ctx.t('app.decidir.variable') }), numericas: [1, 3, 4], accion: 'decision', apilable: true,
            // la opción recomendada se ve en la tabla (salvo con el semáforo en rojo, que no recomienda nada)
            destacada: rojo ? -1 : ev.configuraciones.findIndex((c) => c.valor === ev.recomendacion) }),
        // el intervalo que decide corrige por mirar varias veces (experimentos/decision.ts): se dice con cuánta confianza
        conf !== undefined && !rojo ? el('p', { class: 'nota', 'data-decidir': 'confianza' }, ctx.t('app.decidir.confianzaPorMirada', { confianza: ctx.f.porcentaje(conf, 2) })) : null,
        el('div', { class: `decidir__recomendacion${ninguna ? ' decidir__recomendacion--ninguna' : ''}`, 'data-recomendacion': rojo ? 'ninguna' : ev.recomendacion ?? 'ninguna' },
          el('p', { class: 'decidir__recomendacion-texto' }, textoRecomendacion(ctx, ev)),
          enElBorde ? el('p', { class: 'nota', 'data-decidir': 'borde' }, ctx.t('app.decidir.enElBorde', { valor: d.variable.min })) : null,
          detalleSemaforo(ctx, ev.semaforo),
          ninguna ? salidasSinRespuesta(ctx) : seguirSimulando(ctx, ev)),
        el('p', { class: 'nota' }, ctx.t('app.decidir.noches', { n: ev.replicasUsadas })));
    } else poner(evaluacion, el('p', { class: 'nota' }, ctx.t('app.decidir.sinEvaluacion')));
    const dadas = Object.entries(x.respuestas);
    // cada dato con su unidad («2,4 s por paquete»), no con el nombre interno del parámetro
    const conUnidad = ([k, v]: [string, number]) => { const u = mv.modelo.parametros[k]?.unidad; return u ? `${ctx.f.numero(v)} ${u}` : `${k} = ${ctx.f.numero(v)}`; };
    poner(respuestas, dadas.length ? el('p', { class: 'decidir__dadas' }, ctx.t('app.decidir.tusDatos', { lista: dadas.map(conUnidad).join(' · ') })) : null);
    if (x.preguntas) {
      const cierre = claveCierreFormulario(x.evaluacion, x.ranking);
      // la zona de indiferencia en la unidad de su indicador (moneda si es un costo)
      const ind = d.indiferencia, enMoneda = ind.kpi.startsWith('costo');
      const indiferencia = enMoneda ? ctx.f.moneda(ind.valor, mv.modelo.costos.moneda) : ctx.f.numero(ind.valor);
      poner(formulario, x.preguntas.length
        ? el('ol', { class: 'preguntas' }, ...x.preguntas.map((p) => tarjetaPregunta(ctx, p)))
        : el('p', { class: `decidir__listo decidir__listo--${cierre.split('.').pop()}`, 'data-formulario': 'listo' }, ctx.t(cierre, { indiferencia })));
    } else poner(formulario, el('p', { class: 'nota' }, ctx.t(x.fase === 'tamizando' ? 'app.decidir.armandoFormulario' : 'app.decidir.formularioDespues')));
    raiz.dataset.listo = x.fase === 'listo' || x.fase === 'cancelado' ? '1' : '0';
  };
  pintar();
  L.sumar(s.suscribir((tema) => { if (tema === 'decision' || tema === 'modelo') pintar(); }));
  if (s.decision.fase === 'nada') void s.decidir();
  return () => L.correr();
};
