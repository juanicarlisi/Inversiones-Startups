// app/pantallas/comun.ts · Andén simulador, corte 1 · P8 (interfaz).
// Piezas que comparten varias pantallas: botón de volver, leyenda de estados (con la misma forma que en el dibujo), textos de un frase.
import type { Contexto } from '../contexto.ts';
import type { Frase } from '../../contratos/explicacion.ts';
import type { Modelo } from '../../contratos/modelo.ts';
import { el } from '../ui/dom.ts';

export function botonVolver(ctx: Contexto): HTMLElement {
  return el('button', { type: 'button', class: 'boton boton--volver', 'data-accion': 'volver', onclick: () => ctx.almacen.despachar({ tipo: 'volver' }) },
    ctx.t('app.volver.atras'));
}

/** «HH:MM» del modelo (HH de 00 a 47, contratos/tipos-base.ts) como hora del reloj: las «28:30» de un turno noche son las 04:30. */
export function horaDelDia(hhmm: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  return m ? `${String(Number(m[1]) % 24).padStart(2, '0')}:${m[2]}` : hhmm;
}

/**
 * Título del modelo en el idioma de la interfaz (hallazgo EXP-13 de la revisión del 30-10-2026). Las plantillas públicas son JSON
 * inmutables con el título en español (y el de la grande decía «24.000 paquetes» aunque cada noche trae otra cantidad): si el modelo es
 * una de ellas y conserva el título con que se publicó, va `app.plantilla.<id>.titulo` del idioma actual. Un título que cambió quien
 * armó el modelo, o un modelo propio, se muestra tal cual (no se traduce lo que escribió una persona).
 */
export function tituloModelo(ctx: Contexto, m: Pick<Modelo, 'titulo' | 'plantilla'>): string {
  const p = m.plantilla;
  if (!p) return m.titulo;
  const publicada = ctx.servicios.plantillas[`${p.id}@${p.version}`];
  const clave = `app.plantilla.${p.id}.titulo`;
  return publicada && publicada.titulo === m.titulo && ctx.traductor.tiene(clave) ? ctx.t(clave) : m.titulo;
}

/** Texto de una frase (clave + variables). */
export function textoFrase(ctx: Contexto, f: Frase): string {
  return ctx.t(f.clave, f.vars);
}

/** Minutos desde los que un paquete en una fila se dibuja «esperando» (el umbral de la escena: UMBRAL_ESPERA_MS = 5 min). */
export const MINUTOS_ESPERA = 5;
const ESTADOS: [string, string, string][] = [
  ['normal', 'escena.estado.normal', '■'], ['vuelta', 'escena.estado.dandoVuelta', '●'], ['excepcion', 'escena.estado.excepcion', '▲'],
  ['esperando', 'escena.estado.esperando', '◆'], ['atrasado', 'escena.estado.atrasado', '◩'],
];
/** Leyenda de los estados de los paquetes: color y forma, igual que en la vista. */
export function leyendaEstados(ctx: Contexto): HTMLElement {
  return el('ul', { class: 'leyenda', 'aria-label': ctx.t('app.escena.leyenda') },
    ...ESTADOS.map(([c, clave, forma]) => el('li', { class: `leyenda__item leyenda__item--${c}` },
      el('span', { class: 'leyenda__forma', 'aria-hidden': 'true' }, forma), ctx.t(clave, { minutos: MINUTOS_ESPERA }))));
}

/** Contenedor estándar de una pantalla. */
export function marcoPantalla(raiz: HTMLElement, nombre: string): void {
  raiz.dataset.pantalla = nombre;
}
