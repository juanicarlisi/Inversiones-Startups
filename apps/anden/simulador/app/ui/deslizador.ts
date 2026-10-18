// app/ui/deslizador.ts · Andén simulador, corte 1 · P8 (interfaz).
// Perilla numérica: un input range nativo (teclado y lectores de pantalla gratis) con su valor escrito al lado y botones − / + grandes
// para el dedo en 360 px. Avisa el cambio con un pequeño retardo para no recalcular en cada píxel del arrastre.
import { el } from './dom.ts';

export interface OpcionesDeslizador {
  etiqueta: string;
  min: number;
  max: number;
  valor: number;
  paso?: number;
  accion: string;
  /** Texto del valor (por defecto, el número). */
  mostrar?: (v: number) => string;
  /** Se llama al soltar o a los 250 ms sin moverse. */
  alCambiar: (v: number) => void;
  /** Valor del modelo (se marca como «hoy»). */
  original?: number;
  menos: string;
  mas: string;
}

export function deslizador(o: OpcionesDeslizador): { nodo: HTMLElement; poner(v: number): void } {
  const id = `perilla-${o.accion}`;
  const salida = el('output', { class: 'perilla__valor', for: id });
  const entrada = el('input', { type: 'range', id, min: o.min, max: o.max, step: o.paso ?? 1, value: o.valor, 'data-accion': o.accion,
    class: 'perilla__rango' });
  const mostrar = (v: number) => { salida.textContent = o.mostrar ? o.mostrar(v) : String(v); entrada.setAttribute('aria-valuetext', salida.textContent); };
  let espera: ReturnType<typeof setTimeout> | null = null;
  const avisar = (inmediato: boolean) => {
    if (espera) clearTimeout(espera);
    const v = Number(entrada.value);
    if (inmediato) o.alCambiar(v); else espera = setTimeout(() => o.alCambiar(v), 250);
  };
  entrada.addEventListener('input', () => { mostrar(Number(entrada.value)); avisar(false); });
  entrada.addEventListener('change', () => avisar(true));
  const mover = (d: number) => {
    const v = Math.min(o.max, Math.max(o.min, Number(entrada.value) + d * (o.paso ?? 1)));
    entrada.value = String(v); mostrar(v); avisar(true);
  };
  mostrar(o.valor);
  const nodo = el('div', { class: 'perilla' },
    el('label', { class: 'perilla__etiqueta', for: id }, o.etiqueta),
    el('div', { class: 'perilla__fila' },
      el('button', { type: 'button', class: 'boton boton--icono', 'aria-label': o.menos, 'data-accion': `${o.accion}-menos`, onclick: () => mover(-1) }, '−'),
      entrada,
      el('button', { type: 'button', class: 'boton boton--icono', 'aria-label': o.mas, 'data-accion': `${o.accion}-mas`, onclick: () => mover(1) }, '+'),
      salida));
  return { nodo, poner(v) { entrada.value = String(v); mostrar(v); } };
}
