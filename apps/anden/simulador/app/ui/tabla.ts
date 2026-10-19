// app/ui/tabla.ts · Andén simulador, corte 1 · P8 (interfaz).
// Tabla accesible (caption, th con scope) que se desplaza sola en pantallas angostas sin mover la página.
import { el, type Hijo } from './dom.ts';

export interface OpcionesTabla {
  titulo?: string; clase?: string; numericas?: number[]; accion?: string;
  /** En pantallas angostas cada fila se apila (cada celda con su encabezado al lado), en vez de desplazarse a lo ancho. */
  apilable?: boolean;
  /** Índice de una fila para destacar (por ejemplo, la opción recomendada); -1 o sin dar, ninguna. */
  destacada?: number;
}

export function tabla(cabeceras: string[], filas: Hijo[][], o: OpcionesTabla = {}): HTMLElement {
  const num = new Set(o.numericas ?? []);
  const t = el('table', { class: `tabla${o.apilable ? ' tabla--apilable' : ''} ${o.clase ?? ''}`.trim(), 'data-tabla': o.accion },
    o.titulo ? el('caption', null, o.titulo) : null,
    el('thead', null, el('tr', null, ...cabeceras.map((c, i) => el('th', { scope: 'col', class: num.has(i) ? 'num' : undefined }, c)))),
    el('tbody', null, ...filas.map((f, k) => el('tr', k === o.destacada ? { class: 'tabla__fila--destacada', 'aria-current': 'true' } : null, ...f.map((c, i) => (i === 0
      ? el('th', { scope: 'row' }, c)
      : el('td', { class: num.has(i) ? 'num' : undefined, 'data-etiqueta': o.apilable ? cabeceras[i] : undefined }, c)))))));
  return el('div', { class: 'tabla-contenedor', tabindex: 0, role: 'region', 'aria-label': o.titulo ?? cabeceras.join(', ') }, t);
}
