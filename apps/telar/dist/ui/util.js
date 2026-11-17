// Utilidades de pantalla: escapar texto, avisos, diálogos y descargas.

export const $ = (s, raiz = document) => raiz.querySelector(s);
export const $$ = (s, raiz = document) => [...raiz.querySelectorAll(s)];

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

let toastT;
/** Aviso abajo; con acción opcional { texto, fn } (por ejemplo, «Deshacer»). */
export function toast(msg, accion = null, ms = accion ? 5000 : 2600) {
  let t = $('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
  }
  t.innerHTML = `<span>${esc(msg)}</span>${accion ? `<button type="button">${esc(accion.texto)}</button>` : ''}`;
  if (accion)
    t.querySelector('button').addEventListener('click', () => {
      t.remove();
      accion.fn();
    });
  clearTimeout(toastT);
  toastT = setTimeout(() => t.remove(), ms);
}

/**
 * Diálogo modal accesible. contenido: HTML ya escapado. botones: [{ texto, valor, primario, peligro }].
 * Devuelve una promesa con el valor del botón (o null si se cierra).
 */
export function dialogo(titulo, contenido, botones = [{ texto: 'Cerrar', valor: null }], alAbrir = null) {
  return new Promise((ok) => {
    const previo = document.activeElement;
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `<div class="box" role="dialog" aria-modal="true" aria-labelledby="dlg-t"><h3 id="dlg-t">${esc(titulo)}</h3>${contenido}<div class="sbx">${botones
      .map((b, i) => `<button type="button" class="btn${b.primario ? ' primary' : ''}${b.peligro ? ' danger' : ''}" data-i="${i}">${esc(b.texto)}</button>`)
      .join('')}</div></div>`;
    const cerrar = (v) => {
      m.remove();
      document.removeEventListener('keydown', tecla, true);
      if (previo && previo.focus) previo.focus();
      ok(v);
    };
    const tecla = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        cerrar(null);
      } else if (e.key === 'Tab') {
        // Foco atrapado dentro del diálogo.
        const f = [...m.querySelectorAll('button,input,select,textarea,a[href]')].filter((x) => !x.disabled);
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b && b.closest('.sbx')) cerrar(botones[+b.dataset.i].valor);
      else if (e.target === m) cerrar(null);
    });
    document.addEventListener('keydown', tecla, true);
    document.body.appendChild(m);
    if (alAbrir) alAbrir(m, cerrar);
    const pri = m.querySelector('.sbx .primary') || m.querySelector('.sbx button');
    (m.querySelector('[autofocus]') || pri).focus();
  });
}

/** Descarga un archivo generado en el dispositivo (sin pasar por ningún servidor). */
export function descargar(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** «hace 3 días», «hoy», «ayer». */
export function haceCuanto(isoFecha, hoyNum) {
  if (!isoFecha) return null;
  const d = Math.floor((Date.parse(isoFecha.slice(0, 10)) / 864e5) | 0);
  const k = hoyNum - d;
  if (k <= 0) return 'hoy';
  if (k === 1) return 'ayer';
  return `hace ${k} días`;
}
