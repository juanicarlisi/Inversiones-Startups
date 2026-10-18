// app/ui/semaforo.ts · Andén simulador, corte 1 · P8 (interfaz).
// El semáforo de confianza: color Y forma (círculo verde, triángulo amarillo, cuadrado rojo) para que se lea en escala de grises y sin
// color, con el texto del motivo (claves experimentos.semaforo.*) a la vista o en el detalle.
import type { Semaforo } from '../../contratos/experimentos.ts';
import type { Contexto } from '../contexto.ts';
import { el } from './dom.ts';

const FORMA: Record<Semaforo['color'], string> = { verde: '●', amarillo: '▲', rojo: '■' };

/** Ficha compacta: forma + «Confiable / Con reservas / No usar». El motivo va en el título y para lectores de pantalla. */
export function fichaSemaforo(ctx: Contexto, s: Semaforo | null): HTMLElement {
  if (!s) return el('span', { class: 'semaforo semaforo--pendiente', 'data-semaforo': 'pendiente' }, ctx.t('app.semaforo.pendiente'));
  const motivo = ctx.t(`experimentos.semaforo.${s.motivo}`, s.vars);
  return el('span', { class: `semaforo semaforo--${s.color}`, 'data-semaforo': s.color, title: motivo, 'aria-label': `${ctx.t(`experimentos.semaforo.color.${s.color}`)}. ${motivo}` },
    el('span', { class: 'semaforo__forma', 'aria-hidden': 'true' }, FORMA[s.color]),
    el('span', { class: 'semaforo__texto' }, ctx.t(`experimentos.semaforo.color.${s.color}`)));
}

/** Bloque con la ficha y el motivo escrito. */
export function detalleSemaforo(ctx: Contexto, s: Semaforo | null): HTMLElement {
  return el('div', { class: 'semaforo-detalle' }, fichaSemaforo(ctx, s),
    s ? el('p', { class: 'semaforo-detalle__motivo' }, ctx.t(`experimentos.semaforo.${s.motivo}`, s.vars)) : null);
}
