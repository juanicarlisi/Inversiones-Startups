// Compatibilidad con Safari viejo (el entorno no tiene WebKit: la lista de APIs y su soporte está en el README).
// Se importa primero desde main.js. Solo agrega lo que falta; nunca pisa lo nativo.
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', { configurable: true, writable: true, value(i) { const n = Math.trunc(i) || 0; return this[n < 0 ? this.length + n : n]; } });
}
if (!Object.hasOwn) Object.hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
if (!String.prototype.replaceAll) {
  Object.defineProperty(String.prototype, 'replaceAll', { configurable: true, writable: true, value(a, b) { return this.split(a).join(b); } });
}
if (typeof Element !== 'undefined' && !Element.prototype.toggleAttribute) {
  Element.prototype.toggleAttribute = function (n, f) { const si = f === undefined ? !this.hasAttribute(n) : !!f; if (si) this.setAttribute(n, ''); else this.removeAttribute(n); return si; };
}
// :focus-visible no existe antes de Safari 15.4 y matches() tiraría una excepción: se usa :focus como respaldo.
export function focoDeTeclado(el) {
  if (!el || el === document.body) return false;
  try { return el.matches(':focus-visible'); } catch { return el.matches(':focus'); }
}
