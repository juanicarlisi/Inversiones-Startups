// app/ui/insignia.ts · Andén simulador, corte 1 · P8 (interfaz).
// Insignia de procedencia de un dato (diseño maestro §3.11): dato tuyo > medido > hecho con fuente > estimación > hipótesis > supuesto.
// Cada etiqueta tiene su clase CSS (color) y un símbolo distinto (forma), y su texto sale de app.etiqueta.*.
import type { Etiqueta } from '../../contratos/tipos-base.ts';
import type { Contexto } from '../contexto.ts';
import { el } from './dom.ts';

export const ETIQUETAS: readonly Etiqueta[] = ['DATO_USUARIO', 'MEDIDO', 'HECHO', 'ESTIMACION', 'HIPOTESIS', 'SUPUESTO'];
const SIMBOLO: Record<Etiqueta, string> = { DATO_USUARIO: '★', MEDIDO: '◆', HECHO: '✓', ESTIMACION: '≈', HIPOTESIS: '?', SUPUESTO: '!' };

export function insignia(ctx: Contexto, e: Etiqueta, cantidad?: number): HTMLElement {
  const nombre = ctx.t(`app.etiqueta.${e}`);
  return el('span', { class: `insignia insignia--${e.toLowerCase()}`, title: ctx.t(`app.etiqueta.${e}.ayuda`), 'data-etiqueta': e },
    el('span', { class: 'insignia__simbolo', 'aria-hidden': 'true' }, SIMBOLO[e]),
    cantidad === undefined ? nombre : `${nombre}: ${ctx.f.numero(cantidad, 0)}`);
}
