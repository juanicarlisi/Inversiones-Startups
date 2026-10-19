// app/pantallas/compartir.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 8: compartir.
// El enlace (plantilla + parche si se puede; si no, el modelo completo), su QR (qrcode-generator 2.0.4 vendorizado, dibujado en un
// lienzo: sin innerHTML), «anonimizar» activado por defecto, el aviso de QUÉ viaja en el enlace y copiar. Todo va después del # del enlace:
// no pasa por ningún servidor. Nada se publica ni se envía: la persona decide con quién compartirlo.
import type { Montar } from '../contexto.ts';
import { el, limpiezas, poner } from '../ui/dom.ts';
import { cabecera, tarjeta } from '../ui/tarjeta.ts';
import { botonVolver } from './comun.ts';

/** Un QR de tipo 40 con corrección L lleva hasta 2.953 bytes; con margen, a partir de 2.000 caracteres se ofrece solo copiar. */
export const MAX_QR = 2000;

/** Dibuja el QR del texto en un lienzo (módulos oscuros sobre blanco, con el margen de 4 módulos que pide la norma). */
export async function dibujarQR(lienzo: HTMLCanvasElement, texto: string, lado = 232): Promise<boolean> {
  const { default: qrcode } = await import('../vendor/qrcode-generator-2.0.4.js');
  const q = qrcode(0, 'L');
  q.addData(texto, 'Byte');
  q.make();
  const n = q.getModuleCount(), margen = 4, celda = Math.max(1, Math.floor(lado / (n + 2 * margen)));
  const tam = celda * (n + 2 * margen);
  lienzo.width = tam; lienzo.height = tam;
  const c = lienzo.getContext('2d');
  if (!c) return false;
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, tam, tam);
  c.fillStyle = '#000000';
  for (let f = 0; f < n; f++) for (let k = 0; k < n; k++) if (q.isDark(f, k)) c.fillRect((k + margen) * celda, (f + margen) * celda, celda, celda);
  return true;
}

function base(): string {
  return `${location.origin}${location.pathname}`;
}

export const montarCompartir: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  if (!s.mv) { ctx.ir('inicio'); return () => {}; }
  const anon = el('input', { type: 'checkbox', id: 'anonimizar', 'data-accion': 'anonimizar', checked: ctx.almacen.estado.anonimizar });
  anon.addEventListener('change', () => ctx.almacen.despachar({ tipo: 'anonimizar', activo: anon.checked }));
  const campo = el('input', { type: 'text', class: 'campo campo--enlace', readonly: true, 'aria-label': ctx.t('app.compartir.enlace'), 'data-enlace': '' });
  const largo = el('p', { class: 'nota', 'data-largo': '' });
  const copiar = el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'copiar', onclick: async () => {
    try { await navigator.clipboard.writeText(campo.value); ctx.avisar('app.compartir.copiado'); }
    catch { campo.select(); ctx.avisar('app.compartir.copiaManual'); }
  } }, ctx.t('app.compartir.copiar'));
  const probar = el('a', { class: 'boton', target: '_blank', rel: 'noopener', 'data-accion': 'probar-enlace' }, ctx.t('app.compartir.probar'));
  const qr = el('canvas', { class: 'qr', role: 'img', 'aria-label': ctx.t('app.compartir.qrAria'), 'data-qr': '' });
  const qrNota = el('p', { class: 'nota' });
  const viaja = el('ul', { class: 'viaja', 'data-viaja': '' });
  const estado = el('p', { class: 'nota', role: 'status' });
  raiz.append(cabecera(ctx.t('app.compartir.titulo'), botonVolver(ctx)),
    tarjeta(null, 'compartir__opciones', el('label', { class: 'interruptor', for: 'anonimizar' }, anon, el('span', null, ctx.t('app.compartir.anonimizar'))),
      el('p', { class: 'nota' }, ctx.t('app.compartir.anonimizarNota'))),
    tarjeta(ctx.t('app.compartir.enlace'), 'compartir__enlace', campo, largo, el('div', { class: 'fila-botones' }, copiar, probar), estado),
    tarjeta(ctx.t('app.compartir.qr'), 'compartir__qr', qr, qrNota),
    tarjeta(ctx.t('app.compartir.queViaja'), 'compartir__viaja', viaja, el('p', { class: 'nota' }, ctx.t('app.compartir.sinServidor'))));

  let token = 0;
  const armar = async () => {
    const mio = ++token;
    raiz.dataset.listo = '0';
    estado.textContent = ctx.t('app.compartir.armando');
    try {
      const r = await s.enlace(ctx.almacen.estado.anonimizar);
      if (mio !== token) return;
      const url = `${base()}#${r.fragmento}`;
      campo.value = url; probar.setAttribute('href', url);
      largo.textContent = ctx.t('app.compartir.largo', { n: ctx.f.numero(url.length, 0) });
      estado.textContent = '';
      const items: string[] = [];
      const e = r.enlace;
      if (e.tipo === 'plantilla') {
        items.push(ctx.t('app.compartir.viaja.plantilla', { plantilla: `${e.plantilla.id}@${e.plantilla.version}`, cambios: e.parche.length }));
      } else {
        items.push(ctx.t(r.anonimizado ? 'app.compartir.viaja.modeloAnonimo' : 'app.compartir.viaja.modelo'));
        if (r.anonimizado) items.push(ctx.t('app.compartir.viaja.textosLibres'), ctx.t('app.compartir.viaja.numerosAnonimos'));
      }
      if (e.receta) items.push(ctx.t('app.compartir.viaja.receta', { semilla: String(e.receta.semilla), replicas: e.receta.replicas, noche: (e.receta.noche ?? 0) + 1 }));
      items.push(ctx.t('app.compartir.viaja.nada'));
      poner(viaja, ...items.map((x) => el('li', null, x)));
      if (url.length <= MAX_QR) {
        qr.hidden = false;
        const ok = await dibujarQR(qr, url);
        if (mio !== token) return;
        qrNota.textContent = ok ? ctx.t('app.compartir.qrNota') : ctx.t('app.compartir.qrNo');
      } else {
        qr.hidden = true;
        qrNota.textContent = ctx.t('app.compartir.qrLargo', { n: ctx.f.numero(url.length, 0), max: ctx.f.numero(MAX_QR, 0) });
      }
      raiz.dataset.listo = '1';
    } catch (err) {
      if (mio !== token) return;
      const msj = err instanceof Error ? err.message : String(err);
      estado.textContent = msj.includes('muy-largo') ? ctx.t('modelo.enlace.muy-largo') : ctx.t('app.compartir.error', { detalle: msj });
      raiz.dataset.listo = '1';
    }
  };
  void armar();
  L.sumar(ctx.almacen.suscribir((n, a) => { if (n.anonimizar !== a.anonimizar) { anon.checked = n.anonimizar; void armar(); } }));
  return () => { token++; L.correr(); };
};
