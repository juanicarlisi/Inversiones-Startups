// app/pantallas/decidir.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 6: decidir.
// La pregunta de la decisión, la evaluación por valor (probabilidad de cumplir con su IC de Wilson, estado y costo medio), la
// recomendación con su semáforo, y el formulario por decisión: solo las preguntas cuyo supuesto cambia la respuesta, en orden de pérdida
// esperada, con por qué, la referencia con su insignia, el rango y cómo medirlo. Contestar una pregunta cambia el modelo (dato propio) y
// vuelve a decidir. Todo es cancelable; cancelar no es un error.
import type { Contexto, Montar } from '../contexto.ts';
import type { EvaluacionDecision } from '../../contratos/experimentos.ts';
import type { Pregunta } from '../../contratos/decision.ts';
import type { Etiqueta } from '../../contratos/tipos-base.ts';
import { el, limpiezas, poner } from '../ui/dom.ts';
import { cabecera, progreso, tarjeta } from '../ui/tarjeta.ts';
import { tabla } from '../ui/tabla.ts';
import { detalleSemaforo } from '../ui/semaforo.ts';
import { insignia } from '../ui/insignia.ts';
import { botonVolver } from './comun.ts';

function textoRecomendacion(ctx: Contexto, ev: EvaluacionDecision): string {
  if (ev.recomendacion !== null) return ctx.t('experimentos.recomendacion.valor', { valor: ev.recomendacion });
  return ctx.t(ev.semaforo.motivo === 'decision-en-duda' ? 'experimentos.recomendacion.en-duda' : 'experimentos.recomendacion.ninguna-cumple');
}

/** Mensaje de cierre del formulario cuando no queda ninguna pregunta que cambie la respuesta (explicacion/NOTAS-CONTRATO.md §11). */
export function claveCierreFormulario(ev: EvaluacionDecision | null): string {
  if (ev && ev.recomendacion !== null) return 'explicacion.formulario.listo';
  if (ev && ev.semaforo.motivo === 'decision-en-duda') return 'explicacion.formulario.en_duda';
  return 'explicacion.formulario.ninguna_cumple';
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
  const textoPregunta = el('h3', { class: 'pregunta__texto' }); textoPregunta.textContent = p.texto;
  const fuente = el('span', { class: 'pregunta__fuente' }); fuente.textContent = p.referencia.fuente;
  return el('li', { class: 'pregunta', 'data-pregunta': p.parametro },
    el('span', { class: 'pregunta__orden', 'aria-hidden': 'true' }, String(p.orden)), textoPregunta,
    el('p', { class: 'pregunta__porque' }, ctx.t(p.porQue.clave, p.porQue.vars)),
    el('p', { class: 'pregunta__referencia' }, ctx.t('app.decidir.referencia', { valor: ctx.f.numero(p.referencia.valor), unidad }), ' ',
      insignia(ctx, p.referencia.etiqueta as Etiqueta), ' ', fuente),
    el('p', { class: 'pregunta__rango' }, ctx.t('app.decidir.rango', { bajo: ctx.f.numero(p.rango[0]), alto: ctx.f.numero(p.rango[1]), unidad })),
    el('p', { class: 'pregunta__medir' }, ctx.t('app.decidir.medilo', { observaciones: p.medir.observaciones, minutos: p.medir.minutos,
      error: ctx.f.numero(p.medir.errorRelativo * 100, 0) })),
    el('div', { class: 'pregunta__respuesta' }, el('label', { for: id, class: 'campo__etiqueta' }, ctx.t('app.decidir.tuDato', { unidad })), entrada, usar), error);
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

  const pintar = () => {
    const x = s.decision;
    const cancelar = el('button', { type: 'button', class: 'boton', 'data-accion': 'cancelar-decision', onclick: () => s.cancelarDecision() }, ctx.t('app.decidir.cancelar'));
    if (x.fase === 'evaluando') {
      poner(progresoCaja, progreso(x.maximo ? x.hechas / x.maximo : null, ctx.t('app.decidir.evaluando', { hechas: x.hechas })), cancelar);
    } else if (x.fase === 'tamizando') {
      poner(progresoCaja, progreso(x.maximo ? x.hechas / x.maximo : null, ctx.t('app.decidir.tamizando', { hechas: x.hechas, total: x.maximo })), cancelar);
    } else if (x.fase === 'cancelado') {
      poner(progresoCaja, el('p', { class: 'nota' }, ctx.t('app.decidir.cancelado')),
        el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'reanudar-decision', onclick: () => void s.decidir() }, ctx.t('app.decidir.reanudar')));
    } else if (x.fase === 'nada') {
      poner(progresoCaja, el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'evaluar-decision', onclick: () => void s.decidir() }, ctx.t('app.decidir.evaluar')));
    } else progresoCaja.replaceChildren();
    const ev = x.evaluacion;
    if (ev) {
      const moneda = mv.modelo.costos.moneda;
      poner(evaluacion,
        tabla([ctx.t('app.decidir.col.valor'), ctx.t('app.decidir.col.prob'), ctx.t('app.decidir.col.estado'), ctx.t('app.decidir.col.costo'), ctx.t('app.decidir.col.noches')],
          ev.configuraciones.map((c) => [String(c.valor),
            ctx.t('app.decidir.prob', { p: ctx.f.porcentaje(c.prop.p, 0), bajo: ctx.f.porcentaje(c.prop.ic[0], 0), alto: ctx.f.porcentaje(c.prop.ic[1], 0) }),
            el('span', { class: `estado-config estado-config--${c.estado}` }, ctx.t(`experimentos.estado.${c.estado}`)),
            ctx.t('app.decidir.costo', { media: ctx.f.moneda(c.objetivo.media, moneda), mas: ctx.f.moneda(c.objetivo.semiancho, moneda) }),
            ctx.f.numero(c.prop.n, 0)]),
          { titulo: ctx.t('app.decidir.tablaTitulo', { variable: ctx.t('app.decidir.variable') }), numericas: [1, 3, 4], accion: 'decision', apilable: true }),
        el('div', { class: 'decidir__recomendacion', 'data-recomendacion': ev.recomendacion ?? 'ninguna' },
          el('p', { class: 'decidir__recomendacion-texto' }, textoRecomendacion(ctx, ev)), detalleSemaforo(ctx, ev.semaforo)),
        el('p', { class: 'nota' }, ctx.t('app.decidir.noches', { n: ev.replicasUsadas })));
    } else poner(evaluacion, el('p', { class: 'nota' }, ctx.t('app.decidir.sinEvaluacion')));
    const dadas = Object.entries(x.respuestas);
    poner(respuestas, dadas.length ? el('p', { class: 'decidir__dadas' }, ctx.t('app.decidir.tusDatos', { lista: dadas.map(([k, v]) => `${k} = ${ctx.f.numero(v)}`).join(' · ') })) : null);
    if (x.preguntas) {
      poner(formulario, x.preguntas.length
        ? el('ol', { class: 'preguntas' }, ...x.preguntas.map((p) => tarjetaPregunta(ctx, p)))
        : el('p', { class: 'decidir__listo', 'data-formulario': 'listo' }, ctx.t(claveCierreFormulario(x.evaluacion))));
    } else poner(formulario, el('p', { class: 'nota' }, ctx.t(x.fase === 'tamizando' ? 'app.decidir.armandoFormulario' : 'app.decidir.formularioDespues')));
    raiz.dataset.listo = x.fase === 'listo' || x.fase === 'cancelado' ? '1' : '0';
  };
  pintar();
  L.sumar(s.suscribir((tema) => { if (tema === 'decision' || tema === 'modelo') pintar(); }));
  if (s.decision.fase === 'nada') void s.decidir();
  return () => L.correr();
};
