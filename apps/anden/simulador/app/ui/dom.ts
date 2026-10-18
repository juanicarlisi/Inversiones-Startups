// app/ui/dom.ts · Andén simulador, corte 1 · P8 (interfaz).
// Ayudas mínimas para armar el DOM sin innerHTML (corte-1.md §1.8): todo texto entra como nodo de texto, así un título del modelo con
// «<script>» se ve como texto y nunca se ejecuta. Lo prueba pruebas/seguridad.test.ts (búsqueda en el código) y humo.mjs (en Chromium).

export type Hijo = Node | string | number | null | undefined | false;
export type Props = Record<string, string | number | boolean | null | undefined | ((e: Event) => void)>;

/** Atributos que nunca se aceptan por esta vía (inyectarían HTML o estilos en línea, que la CSP bloquea). */
const PROHIBIDOS = new Set(['innerhtml', 'outerhtml', 'style', 'srcdoc']);

/**
 * Crea un elemento. `props`: `class`, `on<evento>` (función), booleanos (presente si true) y el resto como atributos. Los hijos de texto
 * se agregan como nodos de texto.
 */
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props | null = null, ...hijos: Hijo[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      const kl = k.toLowerCase();
      if (PROHIBIDOS.has(kl)) throw new Error(`dom: el atributo «${k}» no se usa (sin innerHTML ni estilos en línea).`);
      if (typeof v === 'function') { e.addEventListener(kl.slice(2), v as EventListener); continue; }
      if (k === 'class') { e.className = String(v); continue; }
      e.setAttribute(k, v === true ? '' : String(v));
    }
  }
  agregar(e, hijos);
  return e;
}

export function agregar(padre: Node, hijos: Hijo[]): void {
  for (const h of hijos) {
    if (h === null || h === undefined || h === false) continue;
    padre.appendChild(typeof h === 'string' || typeof h === 'number' ? document.createTextNode(String(h)) : h);
  }
}

/** Reemplaza el contenido de un nodo (sin innerHTML). */
export function poner(padre: Element, ...hijos: Hijo[]): void {
  padre.replaceChildren();
  agregar(padre, hijos);
}

/** Pone un texto con textContent (nunca HTML). */
export function texto(e: Element, t: string): void {
  if (e.textContent !== t) e.textContent = t;
}

/** Botón con texto, acción para las pruebas (data-accion) y manejador. */
export function boton(etiqueta: string, accion: string, al: (e: Event) => void, extra: Props = {}): HTMLButtonElement {
  return el('button', { type: 'button', class: 'boton', 'data-accion': accion, onclick: al, ...extra }, etiqueta);
}

/** Escucha un evento y devuelve cómo dejar de escucharlo. */
export function escuchar<K extends keyof WindowEventMap>(destino: Window, tipo: K, f: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions): () => void;
export function escuchar<K extends keyof DocumentEventMap>(destino: Document, tipo: K, f: (e: DocumentEventMap[K]) => void, o?: AddEventListenerOptions): () => void;
export function escuchar<K extends keyof HTMLElementEventMap>(destino: HTMLElement, tipo: K, f: (e: HTMLElementEventMap[K]) => void, o?: AddEventListenerOptions): () => void;
export function escuchar(destino: EventTarget, tipo: string, f: (e: Event) => void, o?: AddEventListenerOptions): () => void {
  destino.addEventListener(tipo, f, o);
  return () => destino.removeEventListener(tipo, f, o);
}

/** Junta funciones de limpieza en una. */
export function limpiezas(): { sumar(f: (() => void) | undefined): void; correr(): void } {
  const fs: (() => void)[] = [];
  return {
    sumar(f) { if (f) fs.push(f); },
    correr() { while (fs.length) { try { fs.pop()!(); } catch (e) { console.warn('limpieza', e); } } },
  };
}
