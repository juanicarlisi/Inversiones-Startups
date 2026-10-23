// Cámara y entrada del mapa (HN-11): tocar, arrastrar, pellizcar, rueda y touchpad, teclado y selector de ciudades cercanas.
//  - Rueda con ctrlKey (el pellizco del touchpad en Chrome): zoom ×exp(−deltaY × 0,01), anclado en el puntero.
//  - Rueda sin ctrlKey, en píxeles (deltaMode 0) y con |deltaY| < 100: dos dedos en el touchpad mueven el mapa (deltaX y deltaY).
//  - Rueda de mouse con muescas (deltaMode 1 o |deltaY| ≥ 100): zoom de a ×1,15.
//  - Safari en Mac manda el pellizco como gesturechange (con scale): se usa como alternativa.
//  - Los botones + y − acercan hacia el centro del área visible (sin panel ni misión) o hacia la selección, en 250 ms.
//  - Al redimensionar se conserva el punto central del área útil.
//  - Teclado con e.key (anda en AZERTY y QWERTZ): espacio pausa, 1/2/3 velocidad, + y − zoom, flechas mueven el mapa. Escape es
//    solo un atajo extra: nada depende de esa tecla (en el portal saca de la pantalla completa).
import * as R from './render.js';
import { focoDeTeclado } from './compat.js';

export const Z_MIN = 2.5, Z_MAX = 160;
export const RADIO_SELECTOR = 22;          // con 2 ciudades o más a menos de 22 px del toque aparece el selector
const RADIO_TOQUE = { puntero: 18, tactil: 28 };

let lienzo = null, W = 0, H = 0, dpr = 1;
let cam = { x: 0, y: 0, z: 10 };
let anim = null;                 // transición en curso { de, a, t0, ms, ancla? }
let ultimoManual = -1e9;         // la última vez que el jugador movió la cámara (la cámara automática lo respeta)
let tactil = false;
const cb = { tocar: () => {}, tecla: () => {}, puntero: () => {}, cambioTactil: () => {} };

export const camara = () => cam;
export const medidas = () => ({ W, H, dpr });
export const esTactil = () => tactil;
export const movidaHace = (ahora = performance.now()) => ahora - ultimoManual;
export function fijarCamara(c) { cam = { ...c }; anim = null; }

// ───────── área útil: lo que no tapan el panel ni la tarjeta de objetivos ─────────
export function areaUtil() {
  const r = lienzo.getBoundingClientRect();
  let izq = 0, der = W, arr = 0, aba = H;
  const app = document.getElementById('app');
  const vertical = app.classList.contains('vertical');
  if (app.classList.contains('con-panel')) { // posición de diseño (sin la transformación de la transición)
    const p = document.getElementById('panel');
    if (vertical) aba = Math.min(aba, p.offsetTop); else der = Math.min(der, p.offsetLeft);
  }
  if (vertical) { // en vertical el zoom es una columna a la derecha
    const z = document.getElementById('zoom');
    if (z.offsetHeight > 0) der = Math.min(der, z.offsetLeft - 4);
  }
  const a = document.getElementById('arriba').getBoundingClientRect();
  if (a.height > 0) {
    // la tarjeta está arriba a la izquierda: se descuenta por arriba o por la izquierda, lo que deje más mapa
    const porArriba = (der - izq) * (aba - Math.max(arr, a.bottom - r.top));
    const porIzq = (der - Math.max(izq, a.right - r.left)) * (aba - arr);
    if (porArriba >= porIzq) arr = Math.max(arr, a.bottom - r.top); else izq = Math.max(izq, a.right - r.left);
  }
  if (der - izq < 80) { izq = 0; der = W; }
  if (aba - arr < 80) { arr = 0; aba = H; }
  return { izq, der, arr, aba, w: der - izq, h: aba - arr, cx: (izq + der) / 2, cy: (arr + aba) / 2 };
}

// ───────── transiciones ─────────
const suave = (u) => 1 - Math.pow(1 - u, 3);
function animarA(destino, ms, ancla = null) {
  destino.z = Math.min(Z_MAX, Math.max(Z_MIN, destino.z));
  if (ms <= 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) { cam = destino; anim = null; return; }
  anim = { de: { ...cam }, a: destino, t0: performance.now(), ms, ancla };
}
// Avanza la transición (lo llama el bucle en cada cuadro).
export function animar(ahora) {
  if (!anim) return;
  const u = Math.min(1, (ahora - anim.t0) / anim.ms), e = suave(u);
  const z = anim.de.z * Math.pow(anim.a.z / anim.de.z, e);
  if (anim.ancla) { // el punto del mundo bajo el ancla queda quieto en la pantalla
    const { sx, sy, wx, wy } = anim.ancla;
    cam = { x: wx - (sx - W / 2) / z, y: wy - (sy - H / 2) / z, z };
  } else cam = { x: anim.de.x + (anim.a.x - anim.de.x) * e, y: anim.de.y + (anim.a.y - anim.de.y) * e, z };
  if (u >= 1) { cam = { ...anim.a }; anim = null; }
}

export function zoomEn(sx, sy, f, ms = 0) {
  const base = anim ? anim.a : cam;
  const [wx, wy] = R.aMundo(base, W, H, sx, sy);
  const z = Math.min(Z_MAX, Math.max(Z_MIN, base.z * f));
  const destino = { x: wx - (sx - W / 2) / z, y: wy - (sy - H / 2) / z, z };
  if (ms > 0) { if (anim) cam = { ...anim.a }; const [ax, ay] = R.aMundo(cam, W, H, sx, sy); animarA(destino, ms, { sx, sy, wx: ax, wy: ay }); }
  else { anim = null; cam = destino; }
}
// Botones + y −: hacia la selección (si se ve en el área útil) o hacia el centro del área útil, con 250 ms de transición.
export function zoomBoton(sentido, puntoSeleccion = null) {
  const a = areaUtil();
  let [sx, sy] = [a.cx, a.cy];
  if (puntoSeleccion) {
    const [px, py] = R.aPantalla(anim ? anim.a : cam, W, H, puntoSeleccion);
    if (px >= a.izq && px <= a.der && py >= a.arr && py <= a.aba) [sx, sy] = [px, py];
  }
  zoomEn(sx, sy, sentido > 0 ? 1.4 : 1 / 1.4, 250);
}
export function mover(dx, dy) { anim = null; cam = { ...cam, x: cam.x + dx / cam.z, y: cam.y + dy / cam.z }; }

// Encuadra puntos del mundo en el área útil. soloAlejar: nunca acerca (la cámara automática solo se aleja con la red).
export function encuadrar(puntos, { ms = 600, soloAlejar = false, margen = 40, zMax = 90 } = {}) {
  if (!puntos.length) return;
  const a = areaUtil();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of puntos) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const aw = Math.max(60, a.w - 2 * margen), ah = Math.max(60, a.h - 2 * margen);
  let z = Math.min(zMax, aw / Math.max(0.01, x1 - x0), ah / Math.max(0.01, y1 - y0));
  if (soloAlejar) z = Math.min(z, (anim ? anim.a : cam).z);
  z = Math.min(Z_MAX, Math.max(Z_MIN, z));
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  animarA({ x: mx - (a.cx - W / 2) / z, y: my - (a.cy - H / 2) / z, z }, ms);
}
// ¿Se ven estos puntos en el área útil (con un margen)?
export function seVen(puntos, margen = 24) {
  const a = areaUtil(), c = anim ? anim.a : cam;
  return puntos.every((p) => { const [x, y] = R.aPantalla(c, W, H, p); return x >= a.izq + margen && x <= a.der - margen && y >= a.arr + margen && y <= a.aba - margen; });
}
// Lleva un punto al centro del área útil sin cambiar el zoom (la hoja de abajo recentra la cámara en la selección).
export function centrarEn(p, ms = 300) {
  const a = areaUtil(), z = (anim ? anim.a : cam).z;
  animarA({ x: p[0] - (a.cx - W / 2) / z, y: p[1] - (a.cy - H / 2) / z, z }, ms);
}

// ───────── tamaño ─────────
export function medir() {
  const antes = W && H ? areaUtil() : null;
  const centro = antes ? R.aMundo(cam, W, H, antes.cx, antes.cy) : null;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = lienzo.getBoundingClientRect();
  W = r.width; H = r.height;
  lienzo.width = Math.max(1, Math.round(W * dpr)); lienzo.height = Math.max(1, Math.round(H * dpr));
  if (centro && W && H) { // se conserva el punto central del área útil
    const a = areaUtil();
    if (anim) { cam = { ...anim.a }; anim = null; }
    cam = { x: centro[0] - (a.cx - W / 2) / cam.z, y: centro[1] - (a.cy - H / 2) / cam.z, z: cam.z };
  }
}

// ───────── ciudades cerca de un toque ─────────
export function ciudadesCerca(s, x, y, radio, disponible) {
  const out = [];
  for (const id in R.POS) {
    if (!disponible(id)) continue;
    const [px, py] = R.aPantalla(cam, W, H, R.POS[id]);
    const d = Math.hypot(px - x, py - y);
    if (d <= radio) out.push({ id, d });
  }
  return out.sort((a, b) => a.d - b.d);
}
// Qué hay bajo un toque: { tipo: 'selector', ids } si hay 2 ciudades o más a menos de 22 px; si no, la ciudad, el avión o la ruta.
export function queHay(s, x, y, disponible, frac = 0) {
  const cerca = ciudadesCerca(s, x, y, Math.max(RADIO_SELECTOR, RADIO_TOQUE[tactil ? 'tactil' : 'puntero']), disponible);
  const muyCerca = cerca.filter((c) => c.d <= RADIO_SELECTOR);
  if (muyCerca.length >= 2) return { tipo: 'selector', ids: muyCerca.map((c) => c.id) };
  if (cerca.length) return { tipo: 'ap', id: cerca[0].id };
  return R.tocar(s, cam, W, H, x, y, frac, tactil ? 16 : 10);
}

// ───────── eventos ─────────
const punteros = new Map();
let arrastre = null, pellizco = null, gesto = null;
const local = (ev) => { const r = lienzo.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };

function marcarTactil(ev) {
  const t = ev.pointerType === 'touch' || ev.pointerType === 'pen';
  if (ev.pointerType && t !== tactil) { tactil = t; cb.cambioTactil(tactil); }
}

export function iniciar(elLienzo, callbacks) {
  lienzo = elLienzo;
  Object.assign(cb, callbacks);
  tactil = matchMedia('(pointer: coarse)').matches;
  cb.cambioTactil(tactil);
  window.addEventListener('pointerdown', marcarTactil, true);

  lienzo.addEventListener('contextmenu', (ev) => ev.preventDefault());
  lienzo.addEventListener('pointerdown', (ev) => {
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur?.();
    try { lienzo.setPointerCapture(ev.pointerId); } catch { /* puntero ya liberado */ }
    const p = local(ev);
    punteros.set(ev.pointerId, p);
    if (punteros.size === 1) arrastre = { inicio: p, cam: { ...cam }, movio: false };
    if (punteros.size === 2) {
      const [a, b] = [...punteros.values()];
      pellizco = { d: Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1])), z: cam.z, c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], cam: { ...cam } };
      arrastre = null;
    }
    anim = null;
  });
  lienzo.addEventListener('pointermove', (ev) => {
    const p = local(ev);
    cb.puntero(p);
    if (!punteros.has(ev.pointerId)) return;
    punteros.set(ev.pointerId, p);
    if (pellizco && punteros.size === 2) {
      const [a, b] = [...punteros.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const z = Math.min(Z_MAX, Math.max(Z_MIN, pellizco.z * d / pellizco.d));
      const [wx, wy] = R.aMundo(pellizco.cam, W, H, pellizco.c[0], pellizco.c[1]);
      cam = { x: wx - (c[0] - W / 2) / z, y: wy - (c[1] - H / 2) / z, z };
      ultimoManual = performance.now();
    } else if (arrastre) {
      const dx = p[0] - arrastre.inicio[0], dy = p[1] - arrastre.inicio[1];
      if (Math.hypot(dx, dy) > (tactil ? 10 : 6)) arrastre.movio = true;
      if (arrastre.movio) { cam = { ...cam, x: arrastre.cam.x - dx / cam.z, y: arrastre.cam.y - dy / cam.z }; ultimoManual = performance.now(); }
    }
  });
  const soltar = (ev, cancelado) => {
    const p = local(ev);
    const toque = !cancelado && arrastre && !arrastre.movio && punteros.size === 1;
    punteros.delete(ev.pointerId);
    if (punteros.size < 2) pellizco = null;
    if (punteros.size === 1) { const [q] = [...punteros.values()]; arrastre = { inicio: q, cam: { ...cam }, movio: true }; }
    if (!punteros.size) arrastre = null;
    if (toque) cb.tocar(p[0], p[1], ev);
  };
  lienzo.addEventListener('pointerup', (ev) => soltar(ev, false));
  lienzo.addEventListener('pointercancel', (ev) => soltar(ev, true));
  lienzo.addEventListener('lostpointercapture', (ev) => { if (punteros.has(ev.pointerId)) soltar(ev, true); });

  lienzo.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const [x, y] = local(ev);
    anim = null; ultimoManual = performance.now();
    if (ev.ctrlKey) { zoomEn(x, y, Math.exp(-ev.deltaY * 0.01)); return; }           // pellizco del touchpad
    if (ev.deltaMode === 0 && Math.abs(ev.deltaY) < 100) { mover(ev.deltaX, ev.deltaY); return; } // dos dedos: mover
    const muescas = ev.deltaMode === 1 ? ev.deltaY / 3 : ev.deltaY / 100;               // rueda del mouse
    zoomEn(x, y, Math.pow(1.15, -Math.sign(muescas) * Math.min(3, Math.max(1, Math.abs(muescas)))));
  }, { passive: false });
  // Safari (Mac): el pellizco llega como gesto con escala, no como rueda con ctrlKey.
  lienzo.addEventListener('gesturestart', (ev) => { ev.preventDefault(); gesto = { z: cam.z }; });
  lienzo.addEventListener('gesturechange', (ev) => {
    ev.preventDefault();
    if (!gesto) return;
    const [x, y] = local(ev);
    zoomEn(x, y, (gesto.z * ev.scale) / cam.z); ultimoManual = performance.now();
  });
  lienzo.addEventListener('gestureend', (ev) => { ev.preventDefault(); gesto = null; });
  // Fuera del lienzo los gestos del navegador no agrandan la página (iOS ignora maximum-scale).
  for (const tipo of ['gesturestart', 'gesturechange']) document.addEventListener(tipo, (ev) => ev.preventDefault(), { passive: false });

  window.addEventListener('keydown', teclado);
}

// Teclas con e.key: así anda en cualquier distribución. Las de AZERTY sin mayúscula (& é ") también cambian la velocidad.
const VELOCIDAD = { 1: 1, 2: 2, 3: 3, '&': 1, 'é': 2, '"': 3 };
function teclado(ev) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const enVentana = !document.getElementById('ventana').hidden || !document.getElementById('ronda').hidden;
  const k = ev.key;
  if (k === 'Escape') { cb.tecla('escape'); return; } // atajo extra; nunca obligatorio
  if (enVentana) return;                                // en una ventana, el teclado es de sus botones
  const foco = document.activeElement;
  const enBoton = foco && foco !== document.body && foco.matches?.('button, [tabindex]') && focoDeTeclado(foco);
  if (k === ' ' || k === 'Spacebar') {
    if (enBoton) return;                                // espacio en un botón con foco de teclado: lo aprieta
    ev.preventDefault(); cb.tecla('pausa'); return;    // sin preventDefault, el espacio movería la página del portal
  }
  if (k in VELOCIDAD) { cb.tecla('velocidad', VELOCIDAD[k]); return; }
  if (k === '+' || k === '=' || k === 'Add') { ev.preventDefault(); zoomBoton(1); return; }
  if (k === '-' || k === '_' || k === 'Subtract') { ev.preventDefault(); zoomBoton(-1); return; }
  const paso = Math.max(40, Math.min(W, H) * 0.12);
  const flecha = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] }[k];
  if (flecha) { ev.preventDefault(); mover(...flecha); ultimoManual = performance.now(); }
}
