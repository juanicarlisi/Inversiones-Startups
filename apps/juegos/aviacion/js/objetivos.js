// Objetivos a la vista (HN-13), mejor próxima acción y guía de 3 pasos (HN-12).
//  - Tarjeta compacta: la misión de historia en una línea con barra de avance real («sacas 18/40») y hasta 2 contratos como chips.
//    Tocarla centra el mapa en el objetivo. La pista aparece cuando no hay avance.
//  - Misión cumplida: la tarjeta se llena, cae un sello postal, el premio vuela en arco hasta la caja y la caja cuenta hacia arriba.
//  - Chip de mejor próxima acción (sugerencia del modelo): al tocarlo selecciona el objeto y marca el botón que hay que tocar.
//  - Guía de 3 pasos (destino → Conectar → Comprar) con una mano animada; no bloquea, se puede saltear y no pasa de 6 palabras.
import * as M from './modelo.js';
import { MISIONES } from './datos.js';
import { t, plata, plataSigno, numero } from './i18n.js';
import { icono } from './iconos.js';
import { vista, pintar, esc, $, contarCaja } from './ui.js';
import * as E from './entrada.js';
import * as R from './render.js';

const CLAVE_GUIA = 'hubnocturno.guia';
const leerGuia = () => { try { return localStorage.getItem(CLAVE_GUIA) === 'hecha'; } catch { return false; } };
let guiaHecha = leerGuia();
export const guiaTerminada = () => guiaHecha;
export function terminarGuia() { guiaHecha = true; try { localStorage.setItem(CLAVE_GUIA, 'hecha'); } catch { /* sin almacenamiento */ } }
export function reiniciarGuia() { guiaHecha = false; try { localStorage.removeItem(CLAVE_GUIA); } catch { /* sin almacenamiento */ } }

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const textoMision = (m) => t(m.id, { meta: m.tipo === 'mejorDia' ? plata(m.meta) : numero(m.meta), n: numero(m.n ?? 0) });
const quedan = (min) => { const h = Math.max(0, Math.round(min / 60)); return h >= 24 ? t('quedanDH', { d: Math.floor(h / 24), h: h % 24 }) : t('quedanH', { h }); };

// ───────── tarjeta de objetivos ─────────
let celebrando = null; // { m, hasta, premio }
export function celebrar(m, premio) {
  celebrando = { m, hasta: performance.now() + (reducido() ? 900 : 1700), premio };
}
export function armarObjetivos(s) {
  const v = vista();
  const obj = M.misionesActivas(s);
  const ahora = performance.now();
  if (celebrando && ahora > celebrando.hasta) celebrando = null;
  let html = '';
  if (celebrando) {
    const m = celebrando.m;
    html += `<button class="obj lleno" data-accion="irObjetivo" data-id="${esc(m.id)}" data-k="obj-h"><span class="obj-txt">${esc(textoMision(m))}</span>
      <span class="obj-pie"><span class="obj-barra"><i></i></span><span class="obj-num" style="margin-right:52px">${celebrando.premio ? plataSigno(celebrando.premio) : ''}</span></span>
      <span class="sello">${esc(t('sello'))}</span></button>`;
  } else {
    const h = obj.find((o) => o.tipo === 'historia');
    if (h) {
      const m = h.mision;
      const total = MISIONES.filter((x) => x.cap === s.cap).length, n = Math.min(total, MISIONES.filter((x) => x.cap === s.cap && M.misionHecha(s, x.id)).length + 1);
      let num;
      if (m.tipo === 'ruta') num = h.progreso >= 1 ? '1/1' : h.progreso > 0 ? t('avionFalta') : t('rutaFalta');
      else if (m.tipo === 'mejorDia') num = `${plata(h.avance.n)} / ${plata(m.meta)}`;
      else if (m.tipo === 'rondaPct') num = `${numero(h.avance.n)}% / ${numero(m.meta)}%`;
      else num = `${h.avance.unidad ? t(h.avance.unidad) + ' ' : ''}${numero(h.avance.n)}/${numero(m.meta)}`;
      const txt = h.espera ? t(h.texto) : textoMision(m); // la misión que espera la primera noche no pide nada todavía
      html += `<button class="obj" data-accion="irObjetivo" data-id="${esc(m.id)}" data-k="obj-h" title="${esc(txt)}"><span class="obj-txt">${esc(txt)}</span>
        <span class="obj-pie"><span class="obj-barra"><i ${v.e('obw', { w: `${(h.progreso * 100).toFixed(1)}%` })}></i></span>${v.t('obn', num, 'obj-num')}
        <span class="tenue">${n}/${total}</span>${m.premio ? `<span class="obj-premio">${plata(m.premio)}</span>` : ''}</span></button>`;
      if (h.pista) html += `<div class="obj-pista">${esc(t(h.pista))}</div>`;
    } else if (M.capituloTerminado(s) && !M.historiaTerminada(s)) {
      html += `<button class="obj lleno" data-accion="siguienteCapitulo" data-k="obj-cap"><span class="obj-txt">${esc(t('capituloListo'))}</span>
        <span class="obj-pie"><span class="obj-num ambar">${esc(t('siguienteCapitulo', { n: s.cap + 1 }))}</span></span></button>`;
    }
  }
  const contratos = obj.filter((o) => o.tipo === 'contrato').slice(0, 2);
  if (contratos.length) {
    html += `<div class="contratos">${contratos.map((c) => {
      const titulo = t('contratoChip', { n: numero(c.avance.meta), u: t(c.avance.unidad), b: M.AP[c.d].nombre });
      const sub = `${M.AP[c.o].nombre} · ${c.oferta ? t('contratoOferta', { dias: c.dias, premio: plata(c.premio) }) : t('contratoSub', { quedan: quedan(c.quedan), premio: plata(c.premio) })}`;
      return `<div class="ct ${c.texto === 'contratoNavidad' ? 'navidad' : ''}"><button class="ct-info" data-accion="irContrato" data-id="${c.contrato}" data-k="ct-${c.contrato}" title="${esc(t(c.texto, { n: c.avance.meta, u: t(c.avance.unidad), a: M.AP[c.o].nombre, b: M.AP[c.d].nombre, dias: c.dias }))}">`
        + `<b>${esc(titulo)}</b><small>${v.t('cs:' + c.contrato, sub)}</small>${c.oferta ? '' : `<span class="ct-barra"><i ${v.e('cb:' + c.contrato, { w: `${(c.progreso * 100).toFixed(1)}%` })}></i></span>`}</button>`
        + `${c.oferta ? `<button class="ct-aceptar" data-accion="aceptarContrato" data-id="${c.contrato}" data-k="acc-${c.contrato}">${esc(t('aceptar'))}</button>` : ''}</div>`;
    }).join('')}</div>`;
  }
  return { html, campos: v.campos };
}
// Puntos del mundo de un objetivo (para centrar el mapa al tocar la tarjeta).
export function puntosObjetivo(s, m) {
  if (!m) return [];
  if (m.a && m.b) return [R.POS[m.a], R.POS[m.b]];
  if (m.ciudad) return [R.POS[m.ciudad]];
  if (m.ciudades) return m.ciudades.map((c) => R.POS[c]);
  return M.nodosRed(s).map((id) => R.POS[id]);
}

// ───────── vuelo del premio hasta la caja ─────────
export function volarPremio(desdeEl, premio, dineroFinal) {
  const caja = $('#caja');
  if (!premio) return;
  if (reducido() || !desdeEl || !caja || !Element.prototype.animate) { contarCaja(dineroFinal, dineroFinal); return; }
  const a = desdeEl.getBoundingClientRect(), b = caja.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'vuela'; el.textContent = plataSigno(premio);
  document.body.appendChild(el);
  const x0 = a.left + a.width * 0.7, y0 = a.top + a.height / 2, x1 = b.left + 8, y1 = b.top + b.height / 2;
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 60;
  const anim = el.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
    { transform: `translate(${mx}px, ${my}px) scale(1.25)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${x1}px, ${y1}px) scale(0.8)`, opacity: 0.9 },
  ], { duration: 750, easing: 'cubic-bezier(.4,0,.2,1)', delay: 350 });
  contarCaja(dineroFinal - premio, dineroFinal, 1100);
  anim.onfinish = () => el.remove();
  anim.oncancel = () => el.remove();
}

// ───────── mejor próxima acción ─────────
// Texto del chip según el tipo de sugerencia.
export function textoSugerencia(s, d) {
  const ruta = (id) => s.rutas.find((r) => r.id === id);
  const par = (id) => { const r = ruta(id); return r ? { a: M.AP[r.a].nombre, b: M.AP[r.b].nombre, ruta: nombreRuta(r) } : { a: '', b: '', ruta: '' }; };
  switch (d.tipo) {
    case 'ruta': return d.avion ? t('sug_rutaAvion', { a: M.AP[d.a].nombre, b: M.AP[d.b].nombre, avion: M.AV[d.avion].nombre, un: articulo(d.avion) }) : t('sug_ruta', { a: M.AP[d.a].nombre, b: M.AP[d.b].nombre });
    case 'avion': return t('sug_avion', { avion: M.AV[d.id].nombre, un: articulo(d.id), ...par(d.ruta) });
    case 'balizas': return t('sug_balizas', par(d.id));
    case 'transbordo': return t(d.cuello ? 'sug_cuello' : 'sug_transbordo', { ap: M.AP[d.id].nombre });
    case 'acelerar': return d.meta != null ? t('sug_acelerar', { meta: plata(d.meta), min: numero(d.minutos, 1) }) : t('sug_acelerarHasta', { min: numero(d.minutos, 1) });
    case 'cargaMin': return t('sug_cargaMin', { ...par(d.id), v: t('cm' + Math.round(d.v * 100)) });
    case 'contrato': { const c = s.contratos.tablero.find((x) => x.id === d.id); return c ? t('sug_contrato', { a: M.AP[c.o].nombre, b: M.AP[c.d].nombre }) : ''; }
    case 'vender': { const av = s.aviones.find((a) => a.id === d.id); return av ? (d.seguridad ? t('sug_venderSeg', { avion: M.AV[av.tipo].nombre, el: articulo(av.tipo, true) }) : t('sug_vender', { avion: M.AV[av.tipo].nombre, un: articulo(av.tipo), ...par(av.ruta) })) : ''; }
    case 'esperar': return d.texto;
    case 'clasificar': return t('sug_clasificar');
    case 'ahorrar': {
      const que = d.que === 'avion' ? M.AV[d.id]?.nombre ?? '' : d.que === 'balizas' ? t('que_balizas') : d.que === 'transbordo' ? t('que_transbordo', { ap: M.AP[d.id]?.nombre ?? '' })
        : t('que_ruta', { ciudad: (() => { const [a, b] = String(d.id).split('-'); return M.AP[M.enRed(s, a) ? b : a]?.nombre ?? ''; })() });
      return t('sug_ahorrar', { falta: plata(d.falta), que, min: numero(d.minutos, 1) });
    }
    default: return '';
  }
}
// «la ruta a Bahía Blanca» si una punta es el hub; si no, «Comodoro Rivadavia ⇄ Río Gallegos».
export function nombreRuta(r) {
  if (r.a === M.HUB || r.b === M.HUB) return t('rutaA_hub', { ciudad: M.AP[r.a === M.HUB ? r.b : r.a].nombre });
  return `${M.AP[r.a].nombre} ⇄ ${M.AP[r.b].nombre}`;
}
// Artículo del avión (la Golondrina es femenina; los demás, masculinos).
export const articulo = (tipo, definido = false) => t(`${definido ? 'el' : 'un'}_${tipo === 'golondrina' ? 'f' : 'm'}`);
// Si el modelo no tiene una mejor próxima acción, el chip igual dice algo útil: qué pide la misión (y al tocarlo, dónde).
export function respaldoSugerencia(s) {
  const m = M.misionActual(s);
  if (!m) return null;
  return { tipo: 'esperar', id: m.id, costo: 0, efectoDia: 0, texto: t('sug_esperar', { mision: t(m.id, { meta: m.tipo === 'mejorDia' ? plata(m.meta) : numero(m.meta), n: numero(m.n ?? 0) }) }) };
}
// Qué seleccionar y qué botón marcar al tocar el chip.
export function destinoSugerencia(s, d) {
  switch (d.tipo) {
    case 'ruta': {
      const afuera = M.enRed(s, d.a) || !M.nodosRed(s).length && d.a === M.HUB ? d.b : d.a, desde = afuera === d.b ? d.a : d.b;
      return { sel: { tipo: 'ap', id: afuera, desde }, marca: `conectar-${afuera}` };
    }
    case 'avion': return { sel: { tipo: 'ruta', id: d.ruta }, marca: `comprar-${d.id}` };
    case 'balizas': return { sel: { tipo: 'ruta', id: d.id }, marca: `balizas-${d.id}` };
    case 'transbordo': return { sel: { tipo: 'ap', id: d.id }, marca: `transbordo-${d.id}` };
    case 'cargaMin': return { sel: { tipo: 'ruta', id: d.id }, marca: `cm-${d.v}` };
    case 'contrato': return { sel: null, marca: `acc-${d.id}` };
    case 'vender': { const av = s.aviones.find((a) => a.id === d.id); return av ? { sel: { tipo: 'ruta', id: av.ruta }, marca: `vender-${d.id}` } : null; }
    case 'clasificar': return { sel: { tipo: 'ap', id: M.HUB }, marca: `clasif-${d.id}` };
    case 'ahorrar': case 'acelerar': return null;
    default: return null;
  }
}

// ───────── guía de 3 pasos ─────────
// Devuelve el paso actual: { paso, marca (data-k de un botón) | punto (del mundo), texto } o null si no hay guía.
export function pasoGuia(s, vis) {
  if (guiaHecha) return null;
  const m = MISIONES[0];
  if (M.misionHecha(s, m.id)) { terminarGuia(); return null; }
  const id = M.idRuta(m.a, m.b), r = s.rutas.find((x) => x.id === id);
  const destino = M.enRed(s, m.b) && !M.enRed(s, m.a) ? m.a : m.b;
  if (!r) {
    if (vis.sel?.tipo === 'ap' && vis.sel.id === destino && !vis.modo) return { paso: 2, marca: `conectar-${destino}`, texto: t('guia2') };
    return { paso: 1, punto: R.POS[destino], texto: t('guia1', { ciudad: M.AP[destino].nombre }) };
  }
  if (!s.aviones.some((a) => a.ruta === id)) {
    if (vis.sel?.tipo === 'ruta' && vis.sel.id === id) {
      const barato = M.avionesDisponibles(s).filter((x) => x.alcance >= r.km).sort((a, b) => a.precio - b.precio)[0];
      return { paso: 3, marca: `comprar-${barato?.id ?? 'golondrina'}`, texto: t('guia3') };
    }
    const [x0, y0] = R.POS[r.a], [x1, y1] = R.POS[r.b];
    return { paso: 3, punto: [(x0 + x1) / 2, (y0 + y1) / 2], texto: t('guiaRuta'), ruta: id };
  }
  return null;
}

// ───────── chips (guía, mejor próxima acción, ronda) ─────────
export function armarChips(s, vis, { guia, sug, ronda }) {
  const v = vista();
  let html = '';
  if (ronda) html += `<button class="chip noche" data-accion="abrirRonda" data-k="chip-ronda">${icono('luna')}${v.t('rch', ronda)}</button>`;
  if (guia) html += `<button class="chip chico info" data-accion="saltearGuia" data-k="saltearGuia">${esc(t('guiaSaltear'))}</button>`;
  else if (sug) {
    const txt = textoSugerencia(s, sug);
    if (txt) html += `<button class="chip ${sug.tipo === 'esperar' ? 'info' : ''}" data-accion="sugerencia" data-k="chip-sug" ${v.e('sgtt', { titulo: `${t('sugTitulo')}: ${txt}` })}>${icono(sug.tipo === 'ahorrar' || sug.tipo === 'esperar' || sug.tipo === 'acelerar' ? 'reloj' : 'estrella')}`
      + `${v.t('sgt', txt, 'chip-txt')}${sug.efectoDia > 0 && sug.tipo !== 'ahorrar' ? v.t('sge', t('sugEfecto', { monto: plata(sug.efectoDia) }), 'chip-efecto') : ''}</button>`;
  }
  return { html, campos: v.campos };
}

// Marca un botón (por data-k) con el resaltado pulsante y data-marca (lo que toca el bot de pruebas). Quita las marcas viejas.
export function marcar(k) {
  for (const el of document.querySelectorAll('[data-marca]')) if (el.dataset.k !== k) { el.classList.remove('marcado'); el.removeAttribute('data-marca'); }
  if (!k) return null;
  const el = [...document.querySelectorAll(`[data-k="${CSS.escape(k)}"]`)].find((x) => x.offsetParent !== null);
  if (el && !el.hasAttribute('data-marca')) { el.classList.add('marcado'); el.setAttribute('data-marca', ''); }
  if (el) aLaVista(el);
  return el ?? null;
}
// Un botón marcado dentro del panel tiene que verse: si quedó abajo del borde, el panel se desplaza (y en vertical, la hoja
// pasa a la altura completa si con la asomada no alcanza).
function aLaVista(el) {
  const cuerpo = el.closest('.panel-cuerpo');
  if (!cuerpo) return;
  const c = cuerpo.getBoundingClientRect(), r = el.getBoundingClientRect();
  if (r.top >= c.top + 4 && r.bottom <= c.bottom - 4) return;
  const app = document.getElementById('app');
  if (app.classList.contains('vertical') && !app.classList.contains('hoja-completa') && r.top - c.top + r.height > cuerpo.clientHeight) app.classList.add('hoja-completa');
  cuerpo.scrollTop += r.top - c.top - Math.max(8, (cuerpo.clientHeight - r.height) / 2);
}
// La mano animada: sobre un punto del mapa (pasos que se tocan en el mapa) o sobre un botón marcado del panel.
function ponerMano(x, y, texto, xPagina, yPagina) {
  const m = $('#marca');
  m.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  m.dataset.x = String(Math.round(xPagina)); m.dataset.y = String(Math.round(yPagina));
  if (!m._ok) { m.querySelector('.marca-mano').innerHTML = icono('mano'); m._ok = true; }
  const txt = m.querySelector('.marca-txt');
  if (txt.textContent !== texto) txt.textContent = texto;
  if (m.hidden) m.hidden = false;
  // el cartel nunca se sale del juego: se corre a un costado o pasa arriba de la mano
  const j = $('#juego').getBoundingClientRect();
  m.classList.toggle('txt-arriba', yPagina + 100 > j.bottom);
  txt.style.marginLeft = '0px';
  const r = txt.getBoundingClientRect();
  let dx = 0;
  if (r.right > j.right - 8) dx = j.right - 8 - r.right;
  if (r.left + dx < j.left + 8) dx = j.left + 8 - r.left;
  if (dx) txt.style.marginLeft = `${Math.round(dx)}px`;
}
export function manoEn(punto, texto) {
  const m = $('#marca');
  if (!punto) { if (!m.hidden) { m.hidden = true; delete m.dataset.x; } m.toggleAttribute('data-marca', false); return; }
  const { W, H } = E.medidas();
  const a = E.areaUtil();
  let [x, y] = R.aPantalla(E.camara(), W, H, punto);
  x = Math.max(a.izq + 24, Math.min(a.der - 24, x)); y = Math.max(a.arr + 24, Math.min(a.aba - 60, y));
  const r = $('#mapa').getBoundingClientRect();
  ponerMano(x, y, texto, r.left + x, r.top + y);
  m.toggleAttribute('data-marca', true);
}
export function manoSobre(el, texto) {
  if (!el) { manoEn(null); return; }
  const j = $('#juego').getBoundingClientRect(), b = el.getBoundingClientRect();
  ponerMano(b.left - j.left + Math.min(b.width - 18, b.width * 0.7), b.top - j.top + b.height * 0.6, texto, b.left + b.width / 2, b.top + b.height / 2);
  $('#marca').toggleAttribute('data-marca', false); // lo marcado es el botón; la mano solo lo señala
}
export { pintar };
