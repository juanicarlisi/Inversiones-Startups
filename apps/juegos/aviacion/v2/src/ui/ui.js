// Piezas de la interfaz: barra, misión, siguiente paso, panel, burbuja de la guía, momentos, avisos, cartel, ventanas,
// etiquetas del mundo y cosas que vuelan (monedas y cifras). No decide nada: main.js le dice qué mostrar.
import { animate, utils } from 'animejs';
import { icono, logo } from './iconos.js';
import { t, plata, plataSigno, numero, fechaTexto, horaTexto } from './textos.js';
import { colocar } from './rotulos.js';

export const $ = (sel) => document.querySelector(sel);
// Las tres velocidades del reloj (minutos de juego por segundo real: 5, 10 y 30). La partida nueva arranca en la tranquila.
export const VELOCIDADES = [{ v: 0.5, clave: 'vTranquila', ico: 'vel1' }, { v: 1, clave: 'vNormal', ico: 'vel2' }, { v: 3, clave: 'vRapida', ico: 'vel3' }];
export const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const raiz = () => $('#ui');

export function montar() {
  // #volantes va primero: las monedas, los sobres y las cifras pasan por detrás de los paneles fijos, nunca por encima
  raiz().innerHTML = `
    <div id="volantes"></div>
    <header id="barra">
      <button class="pastilla caja" data-accion="glosario"><span id="i-moneda">${icono('moneda')}</span><span><b id="plata">$ 0</b><small id="hoy"></small></span></button>
      <button class="pastilla marca" data-accion="empresa" id="marca"><i class="banderin"></i><span id="marca-nombre"></span></button>
      <div class="pastilla reloj" id="reloj"><span id="astro">${icono('sol')}</span><span id="fecha"></span><b id="hora"></b></div>
      <div class="pastilla vel" role="group">
        <button data-accion="pausar" id="b-pausa">${icono('pausa')}</button>
        ${VELOCIDADES.map((v) => `<button data-accion="vel" data-v="${v.v}" class="con-nombre">${icono(v.ico)}<span></span></button>`).join('')}
        <button data-accion="velSig" class="solo-movil" id="b-vel">${icono('vel1')}</button>
      </div>
      <button class="ib redonda" data-accion="oficina" id="b-oficina" hidden>${icono('oficina')}</button>
      <button class="ib redonda" data-accion="menu" id="b-menu">${icono('menu')}</button>
    </header>
    <div id="zoom" role="group">
      <button class="ib redonda" data-accion="alejar" id="b-alejar">${icono('menos')}</button>
      <button class="ib redonda" data-accion="acercar" id="b-acercar">${icono('mas')}</button>
      <button class="ib redonda" data-accion="centrar" id="b-red">${icono('red')}</button>
    </div>
    <section id="mision" aria-live="polite"></section>
    <div id="avisos" aria-live="polite"></div>
    <button id="paso" data-accion="paso" hidden></button>
    <aside id="panel" hidden></aside>
    <div id="momento" hidden></div>
    <div id="burbuja" hidden></div>
    <div id="cartel" hidden></div>
    <div id="dedo" hidden>${icono('mano')}</div>
    <div id="cine" hidden><div class="franja a"></div><div class="franja b"></div><p class="leyenda"></p><button class="saltar" data-accion="saltarCine"></button></div>
    <div id="portada" hidden></div>
    <div id="velo" hidden data-accion="cerrarVentana"></div>
    <div id="ventana" hidden role="dialog" aria-modal="true"></div>`;
  textosFijos();
}
export function textosFijos() {
  const ar = (sel, k) => { const e = $(sel); if (e) { e.setAttribute('aria-label', t(k)); e.title = t(k); } };
  ar('#b-menu', 'menu'); ar('#b-red', 'centrar'); ar('#b-acercar', 'acercar'); ar('#b-alejar', 'alejar'); ar('#b-oficina', 'oficina'); ar('#marca', 'tuEmpresa');
  ar('#b-pausa', 'pausa');
  for (const v of VELOCIDADES) { ar(`.vel [data-v="${v.v}"]`, v.clave); $(`.vel [data-v="${v.v}"] span`).textContent = t(v.clave); }
  $('#cine .saltar').textContent = t('saltar');
}

// Reemplaza el contenido solo si cambió (así un botón no desaparece debajo del dedo).
export function pintar(el, html) {
  if (el._html === html) return false;
  el._html = html; el.innerHTML = html;
  return true;
}
// La rueda nunca mueve la página que contiene al juego (un portal lo muestra dentro de un marco): sobre un panel solo se deja
// pasar si ese panel tiene para dónde correrse; en cualquier otro lugar de la interfaz se frena. (El mundo 3D atiende la suya.)
export function frenarRueda() {
  addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.target?.id === 'mundo') return;
    for (let el = e.target; el && el !== document.body; el = el.parentElement) {
      if (!(el instanceof HTMLElement) || el.scrollHeight <= el.clientHeight + 1) continue;
      const o = getComputedStyle(el).overflowY;
      if (o !== 'auto' && o !== 'scroll') continue;
      if ((e.deltaY < 0 && el.scrollTop > 0) || (e.deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1)) return;
    }
    e.preventDefault();
  }, { passive: false, capture: true });
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
// sinRojo: en los primeros minutos (antes del primer cobro) una pérdida no se muestra; después, el dato va como es, y en rojo solo
// cuando pesa (menos de $ 100 no asusta a nadie).
// frenado: null (el reloj corre), 'decide' (espera mientras se decide) o 'pausa' (lo frenó el jugador).
export function barra({ dinero, gananciaHoy, fecha, noche, vel, velElegida = vel, frenado = null, sinRojo = false }) {
  const el = $('#plata');
  if (plataMostrada == null) { plataMostrada = dinero; el.textContent = plata(dinero); }
  else if (Math.round(dinero) !== Math.round(plataMostrada.meta ?? plataMostrada)) contarPlata(dinero);
  const h = $('#hoy');
  const g = sinRojo ? Math.max(0, Math.round(gananciaHoy)) : Math.round(gananciaHoy);
  h.textContent = `${plataSigno(g)} ${t('hoy')}`; h.className = g > 0 ? 'mas' : g <= -100 ? 'menos' : '';
  // el reloj frenado se ve en el reloj mismo: el astro pasa a ser el signo de pausa y la fecha dice «Reloj frenado»
  const reloj = $('#reloj');
  reloj.classList.toggle('frenado', !!frenado);
  $('#fecha').textContent = frenado ? t(frenado === 'pausa' ? 'enPausa' : 'frenado') : fechaTexto(fecha); $('#hora').textContent = horaTexto(fecha);
  reloj.title = frenado === 'decide' ? t('frenadoPorque') : '';
  pintar($('#astro'), icono(frenado ? 'pausa' : noche ? 'luna' : 'sol'));
  for (const b of document.querySelectorAll('.vel button[data-v]')) b.classList.toggle('activa', +b.dataset.v === velElegida);
  const bp = $('#b-pausa'); pintar(bp, icono(vel === 0 ? 'vel1' : 'pausa')); bp.classList.toggle('activa', vel === 0);
  pintar($('#b-vel'), icono(VELOCIDADES.find((x) => x.v === velElegida)?.ico ?? 'vel1'));
}
// El nombre y el color de la empresa en la barra (el color también va a la interfaz como --empresa).
export function empresa(nombre, color) {
  $('#marca-nombre').textContent = nombre;
  document.documentElement.style.setProperty('--empresa', color);
}
export function botonOficina(ver) { $('#b-oficina').hidden = !ver; }
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
  // el encargo dice, antes de aceptarlo, si ya se puede cumplir (camino.ok) o qué falta
  const html = objetivos.map((o) => o.tipo === 'encargo'
    ? `<div class="obj encargo${o.camino && !o.camino.ok ? ' falta' : ''}">${icono('encargo')}<span><span class="txt">${o.texto}</span><span class="chico">${o.detalle}</span></span>${o.boton ?? '<i></i>'}${o.camino ? `<span class="cam ${o.camino.ok ? 'ok' : 'no'}">${icono(o.camino.ok ? 'check' : 'ruta')}<span>${o.camino.texto}</span></span>` : ''}</div>`
    : `<button class="obj${o.cumplida ? ' hecha' : ''}" data-accion="verMision">${icono('mision')}<span class="rot">${esc(t('mision'))} ${o.orden}</span><span class="txt">${o.texto}</span>
        <span class="pie"><span class="barrita"><i style="width:${Math.round(o.progreso * 100)}%"></i></span>${o.cumplida ? `<span class="num si">${icono('check')}${esc(t('cumplida'))}</span>` : o.avance ? `<span class="num">${o.avance}</span>` : ''}${o.premio ? `<span class="prm"><small>${esc(t('premio'))}</small>${icono('moneda')}${plata(o.premio)}</span>` : ''}</span>
        ${o.pista ? `<span class="pista">${o.pista}</span>` : ''}</button>`).join('');
  pintar($('#mision'), html);
}

// ── siguiente paso ──
export function paso(p) {
  const el = $('#paso');
  raiz().classList.toggle('con-paso', !!p);
  if (!p) { el.hidden = true; return; }
  el.hidden = false;
  // pasivo: no hay nada que tocar ahora (la red trabaja sola); si no, es un botón con su flecha
  pintar(el, `<span class="circ">${icono(p.ico ?? 'flecha')}</span><span class="cuerpo">${p.pasivo ? '' : `<span class="rot">${esc(t('siguiente'))}</span>`}<span class="txt">${p.texto}${p.costo ? ` <span class="precio">${plata(p.costo)}</span>` : ''}</span></span>${p.pasivo ? '' : `<span class="ir">${icono('flecha')}</span>`}`);
  el.classList.toggle('pulso', !!p.pulso); el.classList.toggle('pasivo', !!p.pasivo);
}

// ── panel ──
export function panel(html, ancho = false) {
  const el = $('#panel'), habia = !el.hidden;
  if (html == null) { if (!el.hidden || el._html != null) { el.hidden = true; el._html = null; el.innerHTML = ''; } raiz().classList.remove('con-panel'); return; }   // cerrado y vacío: no quedan botones viejos escondidos
  el.hidden = false; raiz().classList.add('con-panel'); el.classList.toggle('ancho', ancho);
  if (pintar(el, html) && !habia) { el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra'); el.scrollTop = 0; }
}
export const panelAbierto = () => !$('#panel').hidden;

// ── burbuja de la guía y dedo ──
export function burbuja(html, ico = 'cartas') {
  const el = $('#burbuja');
  raiz().classList.toggle('con-burbuja', !!html);
  if (!html) { el.hidden = true; el._html = null; return; }
  const nuevo = pintar(el, `${icono(ico)}<span>${html}</span>`);
  el.hidden = false;
  if (nuevo) { el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra'); }
}
// Marca un botón: lo hace latir y le apoya el dedo.
// dedoAparte: el dedo está señalando algo del mundo (dedoEn) y no hay que esconderlo desde acá.
export function marcar(selector, dedoAparte = false) {
  for (const e of document.querySelectorAll('.late')) if (!selector || !e.matches(selector)) e.classList.remove('late');
  const dedo = $('#dedo');
  const el = selector ? $(selector) : null;
  if (!el || el.offsetParent === null) { if (!dedoAparte) dedo.hidden = true; return null; }
  el.classList.add('late');
  const r = el.getBoundingClientRect();
  // en «Siguiente paso» el dedo se apoya en la flecha, sin tapar el texto
  dedo.hidden = false; dedo.style.transform = `translate(${r.left + r.width * (el.id === 'paso' ? 0.9 : 0.72)}px, ${r.top + r.height * 0.55}px)`;
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
  el.classList.toggle('res', m.clase === 'res');
  el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra');
  if (!m.elige) relojMomento = setTimeout(() => momento(null), m.dura ?? 6500);
}
export const eligiendo = () => !!$('#momento:not([hidden]) .elige'); // una tarjeta con botones no se va sola

// ── avisos ──
export function aviso(texto, { ico = null, tono = '', dura = 4200 } = {}) {
  const caja = $('#avisos');
  const el = document.createElement('div');
  el.className = `aviso ${tono}`; el.innerHTML = `${ico ? icono(ico) : ''}<span>${texto}</span>`;
  caja.replaceChildren(el);        // un aviso por vez (los carteles van en fila: main.js)
  setTimeout(() => { el.classList.add('fuera'); setTimeout(() => el.remove(), 320); }, dura);
}

export function limpiarAvisos() { $('#avisos').replaceChildren(); }

// ── cartel de misión cumplida ──
let relojCartel = null;
export function cartel(titulo, sub, premio, alCobrar, dura = 3400) {
  const el = $('#cartel');
  if (titulo == null) { clearTimeout(relojCartel); el.hidden = true; el.style.opacity = ''; return; }   // fuera ya: le toca al siguiente de la fila
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
  clearTimeout(relojCartel);
  relojCartel = setTimeout(() => { animate(el, { opacity: [1, 0], duration: 400, onComplete: () => { el.hidden = true; el.style.opacity = ''; } }); }, dura - 400);
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
// La frase de la entrada. Al cambiar de frase la anterior se va rápido y la nueva entra enseguida: nunca queda la toma sin texto
// (antes había un segundo y medio de pasto sin nada escrito entre una frase y la otra).
let relojLeyenda = null;
export function leyenda(texto) {
  const el = $('#cine .leyenda');
  clearTimeout(relojLeyenda);
  if (!texto) { el.classList.remove('ver'); return; }
  if (el.textContent === texto) { el.classList.add('ver'); return; }
  const habia = el.classList.contains('ver');
  el.classList.remove('ver');
  relojLeyenda = setTimeout(() => { el.textContent = texto; el.classList.add('ver'); }, habia ? 230 : 20);
}
export function ocultarJuego(si) { raiz().classList.toggle('oculta-ui', si); document.querySelector('#etiquetas').classList.toggle('oculta-etq', si); }

// ── etiquetas del mundo ──
// Cada rótulo llega con su ancla (x, y: el punto de arriba de su objeto), el centro y el radio del objeto en pantalla y su
// prioridad. rotulos.js decide dónde va cada uno para que no se pisen entre sí ni con los paneles fijos; el que no entra, no se ve.
const etiquetasVivas = new Map(), memoriaRotulos = new Map();
let obstaculos = [], obstaculosT = 0, genMedida = 0;
const FIJOS = '#barra > *, #mision > *, #panel, #paso, #momento, #burbuja, #avisos > *, #zoom';
function leerObstaculos() {
  const out = [];
  for (const el of document.querySelectorAll(FIJOS)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) out.push({ x0: r.left, y0: r.top, x1: r.right, y1: r.bottom });
  }
  // el cartel de festejo: cada pieza por su lugar final (entran creciendo desde cero; con su tamaño del momento no taparían nada)
  const c = $('#cartel');
  if (c && !c.hidden) {
    const r = c.getBoundingClientRect();
    for (const h of c.children) if (h.offsetWidth > 0) out.push({ x0: r.left + h.offsetLeft, y0: r.top + h.offsetTop, x1: r.left + h.offsetLeft + h.offsetWidth, y1: r.top + h.offsetTop + h.offsetHeight });
  }
  return out;
}
if (typeof document !== 'undefined') {
  addEventListener('resize', () => { genMedida++; obstaculosT = 0; });
  document.fonts?.ready?.then(() => { genMedida++; });
}
export function etiquetas(lista) {
  const capa = document.querySelector('#etiquetas'), vistas = new Set(), ahora = performance.now();
  if (lista.length && ahora - obstaculosT > 150) { obstaculos = leerObstaculos(); obstaculosT = ahora; }
  for (const e of lista) {
    vistas.add(e.id);
    let el = etiquetasVivas.get(e.id);
    if (!el) { el = document.createElement('div'); el._oculta = true; el.style.opacity = '0'; capa.appendChild(el); etiquetasVivas.set(e.id, el); }
    if (el._html !== e.html) { el._html = e.html; el.innerHTML = e.html; }
    if (el._clase !== e.clase) { el._clase = e.clase; el.className = e.clase; }
    const firma = `${e.html}|${e.clase}|${genMedida}`;
    if (el._firma !== firma) { el._firma = firma; el._w = el.offsetWidth; el._h = el.offsetHeight; }
    e.w = el._w; e.h = el._h;
  }
  const puestos = colocar(lista, obstaculos, { W: innerWidth, H: innerHeight }, memoriaRotulos, { ahora });
  for (const e of lista) {
    const el = etiquetasVivas.get(e.id), p = puestos.get(e.id);
    if (!p) { if (!el._oculta) { el._oculta = true; el.style.opacity = '0'; } continue; }
    // el corrimiento respecto del lugar de siempre (arriba, centrado) se mueve suave; el rótulo sigue a su objeto sin retraso
    const bx = e.x - e.w / 2, by = e.y - e.h, dx = p.x - bx, dy = p.y - by;
    // (suavizado por tiempo, no por cuadro: con pocos cuadros por segundo el rótulo no queda a mitad de camino)
    const k = 1 - Math.exp(-(ahora - (el._t ?? ahora)) / 70); el._t = ahora;
    if (el._oculta || el._dx == null) { el._dx = dx; el._dy = dy; } else { el._dx += (dx - el._dx) * k; el._dy += (dy - el._dy) * k; }
    el.style.transform = `translate(${(bx + el._dx).toFixed(1)}px, ${(by + el._dy).toFixed(1)}px)`;
    el.style.zIndex = String(Math.round(e.y));
    if (el._oculta) { el._oculta = false; el.style.opacity = ''; }
  }
  for (const [id, el] of etiquetasVivas) if (!vistas.has(id)) { el.remove(); etiquetasVivas.delete(id); }
}
