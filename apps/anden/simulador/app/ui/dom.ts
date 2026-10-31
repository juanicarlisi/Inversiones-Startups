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
      if (typeof v === 'function') { escucharYAnotar(e, kl.slice(2), v as EventListener); continue; }
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

/** Manejadores puestos por `el` en cada elemento: `reconciliar` los pasa al nodo que se conserva. */
const MANEJADORES = new WeakMap<Element, [string, EventListener][]>();
function escucharYAnotar(e: Element, tipo: string, f: EventListener): void {
  e.addEventListener(tipo, f);
  const l = MANEJADORES.get(e);
  if (l) l.push([tipo, f]); else MANEJADORES.set(e, [[tipo, f]]);
}

/**
 * Como `poner`, pero conserva los nodos que no cambiaron de forma (hallazgo EXP-01 de la revisión del 30-10-2026). `poner` reconstruye
 * todo: en la escena, la línea de resumen se repinta con cada noche que llega y el botón «Comprobante» con foco se destruía una vez por
 * segundo durante el primer minuto (el foco volvía al <body> y Enter no hacía nada). Acá se compara el árbol nuevo con el que hay, hijo
 * por hijo: un elemento con la misma etiqueta y el mismo `data-accion` se conserva (con su foco) y se le actualizan atributos, texto y
 * manejadores; lo demás se reemplaza. Es la técnica de las bibliotecas de «morphing» del DOM (idiomorph, morphdom), reducida a lo que
 * arma esta interfaz (sin innerHTML, sin listas con clave).
 */
export function reconciliar(padre: Element, ...hijos: Hijo[]): void {
  const nuevo = document.createDocumentFragment();
  agregar(nuevo, hijos);
  reconciliarHijos(padre, nuevo);
}

function compatibles(a: Node, b: Node): boolean {
  if (a.nodeType !== b.nodeType) return false;
  if (a.nodeType !== 1) return a.nodeType === 3;
  const x = a as Element, y = b as Element;
  return x.tagName === y.tagName && x.getAttribute('data-accion') === y.getAttribute('data-accion');
}

function reconciliarHijos(viejo: Node, nuevo: Node): void {
  const nuevos = Array.from(nuevo.childNodes);
  for (let i = 0; i < nuevos.length; i++) {
    const n = nuevos[i], v = viejo.childNodes[i];
    if (!v) viejo.appendChild(n);
    else if (compatibles(v, n)) reconciliarNodo(v, n);
    else viejo.replaceChild(n, v);
  }
  while (viejo.childNodes.length > nuevos.length) viejo.removeChild(viejo.lastChild!);
}

function reconciliarNodo(v: Node, n: Node): void {
  if (v.nodeType === 3) { if (v.nodeValue !== n.nodeValue) v.nodeValue = n.nodeValue; return; }
  const ve = v as Element, ne = n as Element;
  // `style` se copia por CSSOM: la CSP (sin 'unsafe-inline') bloquea setAttribute('style', …) pero no el.style (así lo pone la interfaz)
  for (const a of Array.from(ve.attributes)) if (a.name !== 'style' && !ne.hasAttribute(a.name)) ve.removeAttribute(a.name);
  for (const a of Array.from(ne.attributes)) if (a.name !== 'style' && ve.getAttribute(a.name) !== a.value) ve.setAttribute(a.name, a.value);
  const sv = (ve as HTMLElement).style, sn = (ne as HTMLElement).style;
  if (sv && sn && sv.cssText !== sn.cssText) sv.cssText = sn.cssText;
  for (const [tipo, f] of MANEJADORES.get(ve) ?? []) ve.removeEventListener(tipo, f);
  const nuevos = MANEJADORES.get(ne) ?? [];
  for (const [tipo, f] of nuevos) ve.addEventListener(tipo, f);
  MANEJADORES.set(ve, nuevos.slice());
  if ('disabled' in ve && 'disabled' in ne) (ve as HTMLButtonElement).disabled = (ne as HTMLButtonElement).disabled;
  reconciliarHijos(ve, ne);
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
