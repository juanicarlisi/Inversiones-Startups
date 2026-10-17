// Arranque, bucle, entrada (tocar, arrastrar, zoom), guardado y ausencia.
import * as M from './modelo.js';
import { CAPITULOS, AVIONES } from './datos.js';
import * as R from './render.js';
import * as U from './ui.js';
import { t, plata, cambiarLengua, numero } from './i18n.js';
import { portal } from './portal.js';
import { sonar, alternarSonido, sonidoActivo, silenciar } from './sonido.js';

const CLAVE = 'hubnocturno.partida.v1';
const lienzo = document.getElementById('mapa');
const ctx = lienzo.getContext('2d');
let W = 0, H = 0, dpr = 1;
let s = null, cam = null, vel = 1, acc = 0, ultimo = performance.now(), ocultoDesde = null;
const vis = { sel: null, modo: null, origen: null, destino: null, puntero: null, flotan: [], frac: 0, dpr: 1, ultimoFlota: {} };

// ───────────── guardado ─────────────
function leer() { try { const x = localStorage.getItem(CLAVE); return x ? M.restaurar(x) : null; } catch { return null; } }
function guardar() { try { if (s) localStorage.setItem(CLAVE, M.guardar(s)); } catch { /* sin almacenamiento (incógnito, portal) */ } }

// ───────────── tamaño ─────────────
function medir() {
  dpr = Math.min(2, window.devicePixelRatio || 1); vis.dpr = dpr;
  const r = lienzo.getBoundingClientRect();
  W = r.width; H = r.height;
  lienzo.width = Math.round(W * dpr); lienzo.height = Math.round(H * dpr);
}
function margenes() { // lo que tapan el panel y la misión
  return W < 760 ? { arriba: 96, abajo: H * 0.42 + 8, izq: 0, der: 0 } : { arriba: 0, abajo: 0, izq: 0, der: 364 };
}
function centrar() { cam = R.crearCamara(CAPITULOS[s.cap - 1].vista, W, H, margenes()); }

// ───────────── eventos del modelo ─────────────
function atender(eventos) {
  const ahora = performance.now();
  for (const e of eventos) {
    if (e.tipo === 'cobro') {
      if (ahora - (vis.ultimoFlota[e.ap] ?? 0) > 700) {
        vis.flotan.push({ ap: e.ap, txt: `+${plata(e.monto)}`, t0: ahora }); vis.ultimoFlota[e.ap] = ahora;
        if (Math.random() < 0.35) sonar('cobro');
      }
    } else if (e.tipo === 'mision') {
      sonar('mision');
      if (e.premio) U.aviso(t('misionHecha', { premio: plata(e.premio) }), 'bueno');
      for (const a of AVIONES) if (a.desbloquea === e.id) U.aviso(t('nuevoAvion', { avion: a.nombre }), 'bueno');
    } else if (e.tipo === 'tormenta') {
      sonar('tormenta');
      U.aviso(t('tormentaAviso', { lista: e.zona.map((z) => M.AP[z].nombre).join(', ') }), 'malo');
    } else if (e.tipo === 'capitulo') {
      finCapitulo();
    }
  }
}

function finCapitulo() {
  guardar();
  if (s.cap >= CAPITULOS.length) {
    U.ventana({ titulo: t('finTitulo'), texto: t('finTexto'), botones: [{ txt: t('seguir'), principal: true }] });
    return;
  }
  U.ventana({ titulo: t('capituloListo'), texto: '', botones: [{ txt: t('siguienteCapitulo', { n: s.cap + 1 }), principal: true, accion: irAlSiguiente }] });
}
function irAlSiguiente() {
  if (!M.avanzarCapitulo(s).ok) return;
  centrar(); guardar();
  U.ventana({ titulo: t(`cap${s.cap}Titulo`), texto: t(`cap${s.cap}Texto`), botones: [{ txt: t('seguir'), principal: true }] });
}

// ───────────── ausencia ─────────────
function volver(segundos) {
  if (segundos < 60) return;
  const r = M.simularAusencia(s, segundos);
  if (!r.minutos) return;
  const horas = numero(r.minutos / 60);
  const botones = [{ txt: t('cobrar'), principal: r.neto <= 0 }];
  if (r.extra > 0) botones.unshift({ txt: `${t('duplicar')} (+${plata(r.extra)})`, principal: true, accion: async () => {
    if (await portal.videoConPremio(silenciar)) { s.dinero += r.extra; U.aviso(`+${plata(r.extra)}`, 'bueno'); guardar(); }
  } });
  U.ventana({ titulo: t('ausenteTitulo'), texto: t(r.neto >= 0 ? 'ausenteTexto' : 'ausentePerdio', { horas, neto: plata(Math.abs(r.neto)) }), botones });
  for (const e of r.eventos) if (e.tipo === 'capitulo') setTimeout(finCapitulo, 50);
}

// ───────────── bucle ─────────────
let ultimaUI = 0, ultimoPanel = 0, ultimoGuardado = performance.now();
function cuadro(ahora) {
  const dt = Math.min(0.25, (ahora - ultimo) / 1000); ultimo = ahora;
  if (document.getElementById('ventana').hidden) {
    acc += dt * M.MIN_POR_SEG * vel;
    let pasos = 0;
    while (acc >= M.PASO && pasos < 40) { atender(M.paso(s)); acc -= M.PASO; pasos++; }
  }
  vis.frac = acc;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  R.dibujar(ctx, W, H, s, cam, vis, ahora);
  if (ahora - ultimaUI > 250) { U.barra(s, vel); U.mision(s); ultimaUI = ahora; }
  if (ahora - ultimoPanel > 1000) { U.panel(s, vis); ultimoPanel = ahora; }
  if (ahora - ultimoGuardado > 15000) { guardar(); ultimoGuardado = ahora; }
  requestAnimationFrame(cuadro);
}
const refrescar = () => { U.panel(s, vis); U.barra(s, vel); U.mision(s); ultimoPanel = performance.now(); };

// ───────────── acciones del panel ─────────────
function error(res) {
  sonar('error');
  U.aviso(t('e_' + (res.error ?? 'invalida'), { precio: plata(res.costo ?? 0), km: numero(res.km ?? 0) }), 'malo');
}
const acciones = {
  verRuta: (b) => { vis.sel = { tipo: 'ruta', id: b.dataset.id }; },
  nuevaRuta: (b) => { vis.modo = 'nuevaRuta'; vis.origen = b.dataset.id; vis.destino = null; },
  cancelar: () => { vis.modo = null; vis.origen = vis.destino = null; },
  abrirRuta: () => {
    const res = M.abrirRuta(s, vis.origen, vis.destino);
    if (!res.ok) return error(res);
    sonar('compra'); U.aviso(t('rutaAbierta', { a: M.AP[res.ruta.a].nombre, b: M.AP[res.ruta.b].nombre }), 'bueno');
    vis.modo = null; vis.sel = { tipo: 'ruta', id: res.ruta.id }; vis.origen = vis.destino = null;
  },
  comprar: (b) => {
    const res = M.comprarAvion(s, b.dataset.id, vis.sel.tipo === 'ruta' ? vis.sel.id : s.aviones.find((a) => a.id === vis.sel.id)?.ruta);
    if (!res.ok) return error(res);
    sonar('compra'); U.aviso(t('avionComprado', { avion: M.AV[b.dataset.id].nombre }));
  },
  vender: (b) => { const res = M.venderAvion(s, Number(b.dataset.id)); if (res.ok) { sonar('compra'); U.aviso(`+${plata(res.monto)}`); } },
  balizas: () => { const res = M.ponerBalizas(s, rutaSel()); if (!res.ok) return error(res); sonar('compra'); },
  cargaMin: (b) => { M.fijarCargaMinima(s, rutaSel(), Number(b.dataset.v)); },
  transbordo: (b) => { const res = M.mejorarTransbordo(s, b.dataset.id); if (!res.ok) return error(res); sonar('compra'); },
  cerrarRuta: (b) => { M.cerrarRuta(s, b.dataset.id); vis.sel = null; },
  capitulo: () => irAlSiguiente(),
};
const rutaSel = () => (vis.sel?.tipo === 'ruta' ? vis.sel.id : s.aviones.find((a) => a.id === vis.sel?.id)?.ruta);
document.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-accion]');
  if (!b || b.disabled) return;
  acciones[b.dataset.accion]?.(b);
  refrescar(); guardar();
});

// ───────────── tocar, arrastrar y zoom ─────────────
const punteros = new Map();
let arrastre = null, pellizco = null;
const zoomEn = (sx, sy, f) => {
  const [wx, wy] = R.aMundo(cam, W, H, sx, sy);
  cam.z = Math.min(90, Math.max(2.5, cam.z * f));
  cam.x = wx - (sx - W / 2) / cam.z; cam.y = wy - (sy - H / 2) / cam.z;
};
const local = (ev) => { const r = lienzo.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
lienzo.addEventListener('pointerdown', (ev) => {
  lienzo.setPointerCapture(ev.pointerId);
  punteros.set(ev.pointerId, local(ev));
  if (punteros.size === 1) arrastre = { inicio: local(ev), cam: { ...cam }, movio: false };
  if (punteros.size === 2) { const [a, b] = [...punteros.values()]; pellizco = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: cam.z }; arrastre = null; }
});
lienzo.addEventListener('pointermove', (ev) => {
  const p = local(ev);
  if (vis.modo === 'nuevaRuta') vis.puntero = p;
  if (!punteros.has(ev.pointerId)) return;
  punteros.set(ev.pointerId, p);
  if (pellizco && punteros.size === 2) {
    const [a, b] = [...punteros.values()];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    zoomEn((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (pellizco.z * d / pellizco.d) / cam.z);
  } else if (arrastre) {
    const dx = p[0] - arrastre.inicio[0], dy = p[1] - arrastre.inicio[1];
    if (Math.hypot(dx, dy) > 6) arrastre.movio = true;
    if (arrastre.movio) { cam.x = arrastre.cam.x - dx / cam.z; cam.y = arrastre.cam.y - dy / cam.z; }
  }
});
lienzo.addEventListener('pointerup', (ev) => {
  const p = local(ev);
  if (arrastre && !arrastre.movio && punteros.size === 1) tocarEn(p);
  punteros.delete(ev.pointerId);
  if (punteros.size < 2) pellizco = null;
  if (!punteros.size) arrastre = null;
});
lienzo.addEventListener('pointercancel', (ev) => { punteros.delete(ev.pointerId); arrastre = pellizco = null; });
lienzo.addEventListener('wheel', (ev) => { ev.preventDefault(); const [x, y] = local(ev); zoomEn(x, y, ev.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });

function tocarEn([x, y]) {
  const h = R.tocar(s, cam, W, H, x, y);
  if (vis.modo === 'nuevaRuta') {
    if (h?.tipo === 'ap' && h.id !== vis.origen) {
      vis.destino = h.id;
      const p = M.puedeAbrirRuta(s, vis.origen, h.id); vis.previaOk = p.ok;
    }
  } else vis.sel = h;
  refrescar();
}

document.getElementById('b-mas').onclick = () => zoomEn(W / 2, H / 2, 1.3);
document.getElementById('b-menos').onclick = () => zoomEn(W / 2, H / 2, 1 / 1.3);
document.getElementById('b-centrar').onclick = () => centrar();
for (const b of document.querySelectorAll('[data-vel]')) b.onclick = () => { vel = Number(b.dataset.vel); portal.jugando(vel > 0); U.barra(s, vel); };

// ───────────── menú ─────────────
const menu = document.getElementById('menu');
function pintarMenu() {
  menu.innerHTML = '';
  const items = [
    [t('idioma'), () => { cambiarLengua(); U.textosFijos(); refrescar(); }],
    [sonidoActivo() ? t('sonidoSi') : t('sonidoNo'), () => { alternarSonido(); }],
    [t('creditos'), () => U.ventana({ titulo: t('creditos'), texto: t('creditosTexto'), botones: [{ txt: t('cerrar'), principal: true }] })],
    [t('reiniciar'), () => { if (confirm(t('confirmarReinicio'))) { try { localStorage.removeItem(CLAVE); } catch { /* nada */ } s = M.nuevoEstado(Date.now() % 1e9); vis.sel = null; centrar(); intro(); } }],
  ];
  for (const [txt, fn] of items) { const b = document.createElement('button'); b.textContent = txt; b.onclick = () => { menu.hidden = true; fn(); }; menu.appendChild(b); }
}
document.getElementById('b-menu').onclick = (ev) => { ev.stopPropagation(); pintarMenu(); menu.hidden = !menu.hidden; };
document.addEventListener('pointerdown', (ev) => { if (!menu.hidden && !menu.contains(ev.target) && ev.target.id !== 'b-menu') menu.hidden = true; });

// ───────────── pestaña oculta = ausencia ─────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { ocultoDesde = Date.now(); guardar(); portal.jugando(false); }
  else if (ocultoDesde) { const seg = (Date.now() - ocultoDesde) / 1000; ocultoDesde = null; ultimo = performance.now(); volver(seg); portal.jugando(true); }
});
window.addEventListener('pagehide', guardar);
window.addEventListener('resize', () => { medir(); });

function intro() {
  U.ventana({ titulo: t('inicioTitulo'), texto: t('inicioTexto', { dinero: plata(s.dinero) }), nota: t('inicioSabias'),
    botones: [{ txt: t('empezar'), principal: true, accion: () => { vis.sel = { tipo: 'ap', id: 'BUE' }; refrescar(); } }] });
}

// ───────────── arranque ─────────────
(async function arrancar() {
  await portal.iniciar();
  U.textosFijos();
  medir();
  const guardada = leer();
  s = guardada ?? M.nuevoEstado(Date.now() % 1e9);
  centrar();
  if (guardada?.guardado) volver((Date.now() - guardada.guardado) / 1000);
  else if (!guardada) intro();
  portal.cargaTermino(); portal.jugando(true);
  refrescar();
  requestAnimationFrame(cuadro);
  window.__juego = { estado: () => s, M }; // para las pruebas de interfaz
})();
