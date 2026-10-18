// app/ui/tarjeta.ts · Andén simulador, corte 1 · P8 (interfaz).
// Tarjeta: una sección con título, para agrupar un tema de una pantalla.
import { el, type Hijo } from './dom.ts';

export function tarjeta(titulo: string | null, clase = '', ...contenido: Hijo[]): HTMLElement {
  return el('section', { class: `tarjeta ${clase}`.trim() }, titulo ? el('h2', { class: 'tarjeta__titulo' }, titulo) : null, ...contenido);
}

/** Cabecera de pantalla: «volver», título y acciones a la derecha. */
export function cabecera(titulo: string, volver: HTMLElement | null, ...acciones: Hijo[]): HTMLElement {
  return el('header', { class: 'pantalla__cabecera' }, volver, el('h1', { class: 'pantalla__titulo' }, titulo),
    acciones.length ? el('div', { class: 'pantalla__acciones' }, ...acciones) : null);
}

/** Barra de progreso accesible (role=progressbar). `valor` en 0–1, o null para «sin saber cuánto falta». */
export function progreso(valor: number | null, etiqueta: string): HTMLElement {
  const barra = el('div', { class: 'progreso', role: 'progressbar', 'aria-label': etiqueta, 'aria-valuemin': 0, 'aria-valuemax': 100,
    'aria-valuenow': valor === null ? undefined : Math.round(valor * 100) });
  const relleno = el('div', { class: valor === null ? 'progreso__relleno progreso__relleno--indeterminado' : 'progreso__relleno' });
  if (valor !== null) relleno.style.width = `${Math.max(0, Math.min(100, valor * 100)).toFixed(1)}%`;
  barra.appendChild(relleno);
  return el('div', { class: 'progreso-con-texto' }, barra, el('span', { class: 'progreso__texto' }, etiqueta));
}
