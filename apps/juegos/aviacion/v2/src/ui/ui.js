// Piezas de la interfaz: barra, misión, siguiente paso, panel, burbuja de la guía, momentos, avisos, cartel, ventanas,
// etiquetas del mundo y cosas que vuelan (monedas y cifras). No decide nada: main.js le dice qué mostrar.
import { animate, utils } from 'animejs';
import { icono, logo } from './iconos.js';
import { t, plata, plataSigno, numero, fechaTexto, horaTexto } from './textos.js';

export const $ = (sel) => document.querySelector(sel);
export const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const raiz = () => $('#ui');

export function montar() {
  raiz().innerHTML = `
    <header id="barra">
      <button class="pastilla caja" data-accion="glosario"><span id="i-moneda">${icono('moneda')}</span><span><b id="plata">$ 0</b><small id="hoy"></small></span></button>
      <div class="pastilla reloj"><span id="astro">${icono('sol')}</span><span id="fecha"></span><b id="hora"></b></div>
      <div class="pastilla vel" role="group">
        <button data-accion="pausar" class="solo-movil" id="b-pausa">${icono('pausa')}</button>
        <button data-accion="vel" data-v="0">${icono('pausa')}</button>
        <button data-accion="vel" data-v="1">${icono('play')}</button>
        <button data-accion="vel" data-v="3">${icono('rapido')}</button>
      </div>
      <button class="ib redonda" data-accion="centrar" id="b-red">${icono('red')}</button>
      <button class="ib redonda" data-accion="menu" id="b-menu">${icono('menu')}</button>
    </header>
    <section id="mision" aria-live="polite"></section>
    <div id="avisos" aria-live="polite"></div>
    <button id="paso" data-accion="paso" hidden></button>
    <aside id="panel" hidden></aside>
    <div id="momento" hidden></div>
    <div id="burbuja" hidden></div>
    <div id="cartel" hidden></div>
    <div id="volantes"></div>
    <div id="dedo" hidden>${icono('mano')}</div>
    <div id="cine" hidden><div class="franja a"></div><div class="franja b"></div><p class="leyenda"></p><button class="saltar" data-accion="saltarCine"></button></div>
    <div id="portada" hidden></div>
    <div id="velo" hidden data-accion="cerrarVentana"></div>
    <div id="ventana" hidden role="dialog" aria-modal="true"></div>`;
  textosFijos();
}
export function textosFijos() {
  const ar = (sel, k) => { const e = $(sel); if (e) { e.setAttribute('aria-label', t(k)); e.title = t(k); } };
  ar('#b-menu', 'menu'); ar('#b-red', 'centrar');
  ar('.vel [data-v="0"]', 'pausa'); ar('#b-pausa', 'pausa'); ar('.vel [data-v="1"]', 'normal'); ar('.vel [data-v="3"]', 'rapido');
  $('#cine .saltar').textContent = t('saltar');
}

// Reemplaza el contenido solo si cambió (así un botón no desaparece debajo del dedo).
export function pintar(el, html) {
  if (el._html === html) return false;
  el._html = html; el.innerHTML = html;
  return true;
}
export function escuchar(fn) {
  let ultimo = 0;
  const manejar = (e) => {
    const b = e.target.closest?.('[data-accion]');
    if (!b || b.disabled) return;
    if (b.id === 'velo' && e.target !== b) return;
    const ahora = performance.now();
    if (ahora - ultimo < 120) return; ultimo = ahora;
    fn(b.dataset.accion, b.dataset, b);
  };
  raiz().addEventListener('click', manejar);
}

// ── barra ──
let plataMostrada = null, animPlata = null;
export function barra({ dinero, gananciaHoy, fecha, noche, vel }) {
  const el = $('#plata');
  if (plataMostrada == null) { plataMostrada = dinero; el.textContent = plata(dinero); }
  else if (Math.round(dinero) !== Math.round(plataMostrada.meta ?? plataMostrada)) contarPlata(dinero);
  const h = $('#hoy');
  const g = Math.round(gananciaHoy);
  h.textContent = `${plataSigno(g)} ${t('hoy')}`; h.className = g > 0 ? 'mas' : g < 0 ? 'menos' : '';
  $('#fecha').textContent = fechaTexto(fecha); $('#hora').textContent = horaTexto(fecha);
  pintar($('#astro'), icono(noche ? 'luna' : 'sol'));
  for (const b of document.querySelectorAll('.vel button[data-v]')) b.classList.toggle('activa', +b.dataset.v === vel);
  const bp = $('#b-pausa'); pintar(bp, icono(vel === 0 ? 'play' : 'pausa')); bp.classList.toggle('activa', vel === 0);
}
function contarPlata(hasta) {
  const el = $('#plata');
  const desde = typeof plataMostrada === 'object' ? plataMostrada.v : plataMostrada;
  animPlata?.pause();
  const o = plataMostrada = { v: desde, meta: hasta };
  animPlata = animate(o, { v: hasta, duration: Math.min(900, 250 + Math.abs(hasta - desde) / 20), ease: 'outCubic',
    onUpdate: () => { el.textContent = plata(o.v); }, onComplete: () => { plataMostrada = hasta; el.textContent = plata(hasta); } });
  if (hasta > desde) { const c = $('.caja'); c.classList.remove('salta'); void c.offsetWidth; c.classList.add('salta'); }
}
export function reiniciarPlata() { plataMostrada = null; animPlata?.pause(); }
export const posCaja = () => { const r = $('#i-moneda').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

// ── misión y encargos ──
export function mision(objetivos) {
  const html = objetivos.map((o) => o.tipo === 'encargo'
    ? `<div class="obj encargo">${icono('encargo')}<span><span class="txt">${o.texto}</span><br><span class="chico">${o.detalle}</span></span>${o.boton ?? ''}</div>`
    : `<button class="obj" data-accion="verMision">${icono('mision')}<span class="rot">${esc(t('mision'))} ${o.orden}</span><span class="txt">${o.texto}</span>
        <span class="pie"><span class="barrita"><i style="width:${Math.round(o.progreso * 100)}%"></i></span>${o.avance ? `<span class="num">${o.avance}</span>` : ''}${o.premio ? `<span class="prm"><small>${esc(t('premio'))}</small>${icono('moneda')}${plata(o.premio)}</span>` : ''}</span>
        ${o.pista ? `<span class="pista">${o.pista}</span>` : ''}</button>`).join('');
  pintar($('#mision'), html);
}

// ── siguiente paso ──
export function paso(p) {
  const el = $('#paso');
  if (!p) { el.hidden = true; return; }
  el.hidden = false;
  pintar(el, `<span class="circ">${icono(p.ico ?? 'flecha')}</span><span><span class="rot">${esc(t('siguiente'))}</span><span class="txt">${p.texto}${p.costo ? ` <span class="precio">${plata(p.costo)}</span>` : ''}</span></span>`);
  el.classList.toggle('pulso', !!p.pulso);
}

// ── panel ──
export function panel(html) {
  const el = $('#panel'), habia = !el.hidden;
  if (html == null) { el.hidden = true; el._html = null; raiz().classList.remove('con-panel'); return; }
  el.hidden = false; raiz().classList.add('con-panel');
  if (pintar(el, html) && !habia) { el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra'); el.scrollTop = 0; }
}
export const panelAbierto = () => !$('#panel').hidden;

// ── burbuja de la guía y dedo ──
export function burbuja(html, ico = 'cartas') {
  const el = $('#burbuja');
  if (!html) { el.hidden = true; el._html = null; return; }
  const nuevo = pintar(el, `${icono(ico)}<span>${html}</span>`);
  el.hidden = false;
  if (nuevo) { el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra'); }
}
// Marca un botón: lo hace latir y le apoya el dedo.
export function marcar(selector) {
  for (const e of document.querySelectorAll('.late')) if (!selector || !e.matches(selector)) e.classList.remove('late');
  const dedo = $('#dedo');
  const el = selector ? $(selector) : null;
  if (!el || el.offsetParent === null) { dedo.hidden = true; return null; }
  el.classList.add('late');
  const r = el.getBoundingClientRect();
  dedo.hidden = false; dedo.style.transform = `translate(${r.left + r.width * 0.72}px, ${r.top + r.height * 0.55}px)`;
  return el;
}
export function dedoEn(p) {
  const dedo = $('#dedo');
  if (!p) { dedo.hidden = true; return; }
  dedo.hidden = false; dedo.style.transform = `translate(${p.x}px, ${p.y}px)`;
}

// ── momentos: una imagen y una frase ──
let relojMomento = null;
export function momento(m) {
  const el = $('#momento');
  clearTimeout(relojMomento);
  if (!m) { el.hidden = true; raiz().classList.remove('con-momento'); return; }
  el.innerHTML = `${m.img ? `<img src="${m.img}" alt="">` : icono(m.ico ?? 'mision')}<h3>${esc(m.titulo)}</h3><p>${m.texto}</p>${m.elige ? `<div class="elige">${m.elige}</div>` : ''}`;
  el.hidden = false; raiz().classList.add('con-momento');
  el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra');
  if (!m.elige) relojMomento = setTimeout(() => momento(null), m.dura ?? 6500);
}
export const momentoAbierto = () => !$('#momento').hidden;
export const eligiendo = () => !!$('#momento:not([hidden]) .elige'); // una tarjeta con botones no se va sola

// ── avisos ──
export function aviso(texto, { ico = null, tono = '', dura = 4200 } = {}) {
  const caja = $('#avisos');
  const el = document.createElement('div');
  el.className = `aviso ${tono}`; el.innerHTML = `${ico ? icono(ico) : ''}<span>${texto}</span>`;
  caja.appendChild(el);
  while (caja.children.length > 3) caja.firstChild.remove();
  setTimeout(() => { el.classList.add('fuera'); setTimeout(() => el.remove(), 320); }, dura);
}

// ── cartel de misión cumplida ──
export function cartel(titulo, sub, premio, alCobrar) {
  const el = $('#cartel');
  el.innerHTML = `<div class="estrella">${icono('mision').replace('class="ico "', 'class="ico" style="width:100%;height:100%"')}</div><h2>${esc(titulo)}</h2><p>${esc(sub)}</p>${premio ? `<span class="prm">${icono('moneda')}+${plata(premio)}</span>` : ''}`;
  el.hidden = false;
  animate(el.querySelector('.estrella'), { scale: [0, 1], rotate: [-140, 0], duration: 700, ease: 'outBack' });
  animate(el.querySelector('h2'), { opacity: [0, 1], y: [24, 0], duration: 450, delay: 150, ease: 'outCubic' });
  animate(el.querySelector('p'), { opacity: [0, 1], duration: 400, delay: 350 });
  const prm = el.querySelector('.prm');
  if (prm) animate(prm, { scale: [0, 1], duration: 500, delay: 500, ease: 'outBack' });
  setTimeout(() => {
    if (prm) { const r = prm.getBoundingClientRect(); monedas({ x: r.left + 20, y: r.top + r.height / 2 }, 10, alCobrar); } else alCobrar?.();
  }, 1500);
  setTimeout(() => { animate(el, { opacity: [1, 0], duration: 400, onComplete: () => { el.hidden = true; el.style.opacity = ''; } }); }, 2900);
}

// ── monedas que vuelan a la caja y cifras que flotan ──
export function monedas(desde, n, alLlegar) {
  const capa = $('#volantes'), hasta = posCaja();
  n = Math.min(n, 12);
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div'); el.className = 'mon'; el.innerHTML = icono('moneda').replace('class="ico "', 'class="ico" style="width:100%;height:100%"');
    capa.appendChild(el);
    const dx = (Math.random() - 0.5) * 90, dy = -30 - Math.random() * 60;
    const ultima = i === n - 1;
    animate(el, {
      x: [desde.x, desde.x + dx, hasta.x], y: [desde.y, desde.y + dy, hasta.y], scale: [0.3, 1.1, 0.6], rotate: [0, 180 + Math.random() * 180],
      duration: 760 + i * 28, delay: i * 38, ease: 'inOutQuad',
      onComplete: () => { el.remove(); if (ultima) alLlegar?.(); },
    });
  }
  if (!n) alLlegar?.();
}
export function cifra(p, texto, tono = 'bueno') {
  const el = document.createElement('div'); el.className = `cifra ${tono}`; el.textContent = texto;
  $('#volantes').appendChild(el);
  animate(el, { x: [p.x, p.x], y: [p.y, p.y - 64], opacity: [{ to: 1, duration: 150 }, { to: 1, duration: 900 }, { to: 0, duration: 350 }], scale: [{ from: 0.5, to: 1.15, duration: 220, ease: 'outBack' }, { to: 1, duration: 200 }],
    duration: 1400, ease: 'outCubic', onComplete: () => el.remove() });
}
// Sobres que saltan de la ciudad al avión cuando carga.
export function sobres(desde, hasta, n = 4) {
  const capa = $('#volantes');
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div'); el.className = 'mon'; el.innerHTML = icono('carta').replace('class="ico "', 'class="ico" style="width:100%;height:100%"');
    capa.appendChild(el);
    animate(el, { x: [desde.x + (Math.random() - 0.5) * 20, hasta.x], y: [desde.y, Math.min(desde.y, hasta.y) - 46, hasta.y], scale: [0.4, 1, 0.5], opacity: [{ to: 1, duration: 100 }, { to: 1, duration: 420 }, { to: 0, duration: 120 }],
      duration: 640, delay: i * 90, ease: 'inOutQuad', onComplete: () => el.remove() });
  }
}

// ── ventanas ──
let alCerrar = null;
export function ventana(v) {
  const el = $('#ventana'), velo = $('#velo');
  if (!v) { el.hidden = true; velo.hidden = true; const f = alCerrar; alCerrar = null; f?.(); return; }
  alCerrar = v.alCerrar ?? null;
  el.innerHTML = `${v.cerrable === false ? '' : `<button class="ib x" data-accion="cerrarVentana" aria-label="${esc(t('cerrar'))}">${icono('cerrar')}</button>`}<h2>${esc(v.titulo)}</h2>${v.html ?? ''}
    ${v.botones?.length ? `<div class="botones">${v.botones.map((b) => `<button class="boton ${b.clase ?? ''}" data-accion="${b.accion}" ${b.datos ?? ''}>${b.ico ? icono(b.ico) : ''}${esc(b.txt)}</button>`).join('')}</div>` : ''}`;
  el.hidden = false; velo.hidden = false; velo.dataset.cerrable = v.cerrable === false ? '0' : '1';
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
}
export const ventanaAbierta = () => !$('#ventana').hidden;

// ── portada y cine ──
export function portada(p) {
  const el = $('#portada');
  if (!p) { el.classList.add('fuera'); setTimeout(() => { el.hidden = true; el.classList.remove('fuera'); }, 720); return; }
  el.innerHTML = `${logo(120)}<h1>Hub <em>Nocturno</em></h1><p>${esc(t('lema'))}</p>
    <div class="fila-b">${p.haySeguir ? `<button class="boton" data-accion="seguirPartida">${icono('play')}${esc(t('seguir'))}</button><button class="boton suave" data-accion="nuevaPartida">${esc(t('nueva'))}</button>`
      : `<button class="boton late" data-accion="nuevaPartida">${icono('play')}${esc(t('jugar'))}</button>`}</div>
    <div class="abajo"><button class="ib redonda" data-accion="idioma">${icono('idioma')}${esc(t('idioma'))}</button></div>`;
  el.hidden = false;
  animate(el.querySelector('.logo'), { scale: [0.6, 1], opacity: [0, 1], duration: 900, ease: 'outBack' });
  animate(el.querySelector('h1'), { opacity: [0, 1], y: [30, 0], duration: 800, delay: 200, ease: 'outCubic' });
  animate(el.querySelectorAll('p, .fila-b'), { opacity: [0, 1], y: [20, 0], duration: 700, delay: utils.stagger ? 500 : 500, ease: 'outCubic' });
}
export function cine(activo) {
  const el = $('#cine');
  if (activo) { el.hidden = false; void el.offsetWidth; el.classList.add('dentro'); raiz().classList.add('oculta-ui'); document.querySelector('#etiquetas').classList.add('oculta-etq'); }
  else { el.classList.remove('dentro'); leyenda(null); setTimeout(() => { el.hidden = true; }, 720); raiz().classList.remove('oculta-ui'); document.querySelector('#etiquetas').classList.remove('oculta-etq'); }
}
export function leyenda(texto) {
  const el = $('#cine .leyenda');
  if (!texto) { el.classList.remove('ver'); return; }
  el.classList.remove('ver');
  setTimeout(() => { el.textContent = texto; el.classList.add('ver'); }, el.textContent ? 450 : 30);
}
export function ocultarJuego(si) { raiz().classList.toggle('oculta-ui', si); document.querySelector('#etiquetas').classList.toggle('oculta-etq', si); }

// ── etiquetas del mundo ──
const etiquetasVivas = new Map();
export function etiquetas(lista) {
  const capa = document.querySelector('#etiquetas'), vistas = new Set();
  for (const e of lista) {
    vistas.add(e.id);
    let el = etiquetasVivas.get(e.id);
    if (!el) { el = document.createElement('div'); capa.appendChild(el); etiquetasVivas.set(e.id, el); }
    if (el._html !== e.html) { el._html = e.html; el.innerHTML = e.html; }
    if (el._clase !== e.clase) { el._clase = e.clase; el.className = e.clase; }
    el.style.transform = `translate(${e.x.toFixed(1)}px, ${e.y.toFixed(1)}px) translate(-50%, -100%)`;
    el.style.zIndex = String(Math.round(e.y));
  }
  for (const [id, el] of etiquetasVivas) if (!vistas.has(id)) { el.remove(); etiquetasVivas.delete(id); }
}
