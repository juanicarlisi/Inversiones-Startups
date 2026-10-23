// Interfaz en el DOM: barra, panel contextual, avisos, ventanas, menú y selector de ciudades.
//
// Sin clics perdidos (HN-11): cada zona se arma con innerHTML solo cuando cambia su estructura (selección, rutas, aviones, modo).
// Los valores que cambian solos (plata, estados, contadores, botones habilitados) van en nodos con data-campo y se actualizan sin
// reemplazar nada. Nunca se reemplaza un botón mientras hay un puntero apretado sobre la interfaz o el foco de teclado está adentro.
// Las acciones se resuelven en pointerup sobre el mismo data-accion (así un clic largo o un toque que se arrastra no se pierden ni
// se disparan dos veces); el teclado (Enter o espacio sobre un botón) llega como click con detail 0.
import * as M from './modelo.js';
import { AVIONES, TRANSBORDO, MISIONES } from './datos.js';
import { t, plata, plataSigno, numero, fechaCorta, horaTexto } from './i18n.js';
import { icono } from './iconos.js';
import { focoDeTeclado } from './compat.js';

export const $ = (sel) => document.querySelector(sel);
export const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const nom = (id) => esc(M.AP[id]?.nombre ?? id);
const n1 = (x) => numero(x, 1);
export const unidadFlujo = (s) => t(s.cap === 1 ? 'u_flujo1' : 'u_flujo');

// ───────── campos vivos ─────────
// v.t(k, texto, clase) deja un <span data-campo> que se llena aparte; v.e(k, estado) marca un elemento cuyo estado cambia
// (d: deshabilitado, p: presionado, w: ancho, l: izquierda, o: oculto, c: clase extra, titulo). El HTML que queda es la estructura:
// si no cambió, no se toca el DOM.
export function vista() {
  const campos = {};
  return {
    campos,
    t(k, texto, clase) { campos[k] = clase === undefined ? { t: String(texto ?? '') } : { t: String(texto ?? ''), c: clase }; return `<span data-campo="${k}"></span>`; },
    e(k, estado) { campos[k] = estado; return `data-campo="${k}"`; },
  };
}
function aplicarCampos(raiz, campos) {
  for (const el of raiz.querySelectorAll('[data-campo]')) {
    const x = campos[el.dataset.campo];
    if (!x) continue;
    if ('t' in x && el.textContent !== x.t) el.textContent = x.t;
    if ('c' in x && el.dataset.c !== x.c) {
      for (const c of (el.dataset.c ?? '').split(' ')) if (c) el.classList.remove(c);
      for (const c of (x.c ?? '').split(' ')) if (c) el.classList.add(c);
      el.dataset.c = x.c;
    }
    if ('d' in x && el.disabled !== !!x.d) el.disabled = !!x.d;
    if ('p' in x) { const v = String(!!x.p); if (el.getAttribute('aria-pressed') !== v) el.setAttribute('aria-pressed', v); }
    if ('w' in x && el.style.width !== x.w) el.style.width = x.w;
    if ('l' in x && el.style.left !== x.l) el.style.left = x.l;
    if ('o' in x && el.hidden !== !!x.o) el.hidden = !!x.o;
    if ('titulo' in x && el.title !== x.titulo) el.title = x.titulo;
  }
}
// Arma una zona. Si la estructura cambió y la zona está bloqueada (puntero apretado o foco de teclado adentro), solo actualiza los
// campos y devuelve false: el armado queda pendiente para cuando se suelte. forzar: después de una acción del jugador.
export function pintar(el, html, campos, forzar = false) {
  if (el._html !== html) {
    if (!forzar && bloqueada(el)) { aplicarCampos(el, campos); return false; }
    const foco = el.contains(document.activeElement) && focoDeTeclado(document.activeElement) ? document.activeElement.dataset.k : null;
    el.innerHTML = html; el._html = html;
    if (foco) el.querySelector(`[data-k="${CSS.escape(foco)}"]`)?.focus({ preventScroll: true });
  }
  aplicarCampos(el, campos);
  return true;
}
export function boton(v, accion, { id = '', val = '', clase = 'boton', html = '', dis, aria, k, extra = '' } = {}) {
  const key = k ?? [accion, id, val].filter((x) => x !== '').join('-');
  return `<button class="${clase}" data-accion="${accion}"${id !== '' ? ` data-id="${esc(id)}"` : ''}${val !== '' ? ` data-v="${esc(val)}"` : ''} data-k="${esc(key)}"`
    + `${dis !== undefined ? ' ' + v.e('d:' + key, { d: dis }) : ''}${aria ? ` aria-label="${esc(aria)}" title="${esc(aria)}"` : ''}${extra}>${html}</button>`;
}

// ───────── acciones: pointerup sobre el mismo data-accion ─────────
let apretado = null, uiApretada = false;
const internos = {};
const alSoltar = [];
let manejador = () => {};
export function escucharAcciones(fn) { manejador = fn; }
export function alDesbloquear(fn) { alSoltar.push(fn); }
export const claveDe = (b) => b.dataset.k || `${b.dataset.accion}|${b.dataset.id ?? ''}|${b.dataset.v ?? ''}`;
function bloqueada(el) {
  if (uiApretada) return true;
  const f = document.activeElement;
  return !!f && f !== document.body && el.contains(f) && focoDeTeclado(f);
}
function disparar(b, ev) {
  if (b.disabled || b.getAttribute('aria-disabled') === 'true') return;
  const a = b.dataset.accion;
  if (internos[a]) internos[a](b, ev); else manejador(a, b, ev);
}
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (ev) => {
    if (ev.button > 0) return;
    const lienzo = document.getElementById('mapa');
    uiApretada = ev.target !== lienzo;
    const b = ev.target.closest?.('[data-accion]');
    apretado = b && !b.disabled ? { k: claveDe(b), id: ev.pointerId } : null;
  }, true);
  document.addEventListener('pointerup', (ev) => {
    const a = apretado;
    apretado = null; uiApretada = false;
    if (a && a.id === ev.pointerId) {
      const b = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('[data-accion]');
      if (b && claveDe(b) === a.k) disparar(b, ev);
    }
    for (const f of alSoltar) f();
  }, true);
  document.addEventListener('pointercancel', () => { apretado = null; uiApretada = false; for (const f of alSoltar) f(); }, true);
  // Teclado (Enter o espacio sobre un botón) o click() programático: llegan como click con detail 0.
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest?.('[data-accion]');
    if (b && ev.detail === 0) disparar(b, ev);
  }, true);
  // Un toque largo no abre el menú del navegador ni la lupa.
  document.addEventListener('contextmenu', (ev) => ev.preventDefault());
  // El foco queda atrapado en las ventanas (y en la ronda).
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Tab') return;
    const capa = !$('#ventana').hidden ? $('#ventana') : !$('#ronda').hidden ? $('#ronda') : !$('#menu').hidden ? $('#menu') : null;
    if (!capa) return;
    const f = [...capa.querySelectorAll('button:not(:disabled)')].filter((e) => e.offsetParent !== null);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    if (ev.shiftKey && i <= 0) { ev.preventDefault(); f[f.length - 1].focus(); }
    else if (!ev.shiftKey && (i === -1 || i === f.length - 1)) { ev.preventDefault(); f[0].focus(); }
  });
}

// ───────── barra ─────────
let cajaMostrada = null, cajaAnim = null;
// La caja cuenta hacia arriba (300 a 600 ms) cuando entra un premio; si no, muestra el valor al instante.
export function contarCaja(desde, hasta, retraso = 0) {
  const ms = Math.min(600, Math.max(300, Math.log10(Math.max(10, Math.abs(hasta - desde))) * 110));
  cajaAnim = { desde, hasta, t0: performance.now() + retraso, ms };
}
export function barra(s, vel, { lenta = false } = {}) {
  let v = s.dinero;
  if (cajaAnim) {
    const u = Math.max(0, Math.min(1, (performance.now() - cajaAnim.t0) / cajaAnim.ms));
    v = cajaAnim.desde + (cajaAnim.hasta - cajaAnim.desde) * (1 - Math.pow(1 - u, 2)) + (s.dinero - cajaAnim.hasta);
    if (u >= 1) cajaAnim = null;
  }
  const caja = $('#caja');
  const txt = plata(v);
  if (caja.textContent !== txt) caja.textContent = txt;
  caja.classList.toggle('rojo', s.dinero < 0);
  caja.classList.toggle('sube', !!cajaAnim);
  cajaMostrada = v;
  // Hasta completar el primer día de juego se muestra el último vuelo (un «por día» negativo al empezar se lee como pérdida).
  const ritmo = $('#ritmo');
  let r;
  if (s.t < 1440) {
    const u = s.stats.ultimoVuelo;
    r = u == null ? `<span>${esc(t('sinVuelos'))}</span>` : `<span class="${u < 0 ? 'rojo' : 'verde'}">${esc(t('ultimoVuelo', { monto: plataSigno(u) }))}</span>`;
  } else {
    const gd = M.gananciaDia(s);
    r = `<span class="${gd < 0 ? 'rojo' : 'verde'}">${esc(t('porDiaTxt', { monto: plataSigno(gd) }))}</span>`;
  }
  if (ritmo._html !== r) { ritmo.innerHTML = r; ritmo._html = r; }
  const f = M.fecha(s), noche = M.esNoche(s);
  const ico = noche ? 'luna' : 'sol';
  const ri = $('#reloj-ico');
  if (ri.dataset.i !== ico) { ri.innerHTML = icono(ico); ri.dataset.i = ico; }
  const fe = fechaCorta(f), ho = horaTexto(f);
  if ($('#reloj-fecha').textContent !== fe) $('#reloj-fecha').textContent = fe;
  if ($('#reloj-hora').textContent !== ho) $('#reloj-hora').textContent = ho;
  for (const b of document.querySelectorAll('[data-accion="vel"]')) {
    const p = String(Number(b.dataset.v) === vel && !lenta);
    if (b.getAttribute('aria-pressed') !== p) b.setAttribute('aria-pressed', p);
  }
  const bp = $('#b-pausa'), pausado = vel === 0;
  if (bp.dataset.i !== String(pausado)) { bp.innerHTML = icono(pausado ? 'play' : 'pausa'); bp.dataset.i = String(pausado); bp.setAttribute('aria-label', t(pausado ? 'reanudar' : 'pausa')); bp.title = t(pausado ? 'reanudar' : 'pausa'); }
  const rt = lenta ? t('rondaLenta') : `×${vel || 1}`;
  if ($('#b-ritmo-txt').textContent !== rt) $('#b-ritmo-txt').textContent = rt;
  $('#b-ritmo').classList.toggle('lenta', lenta);
  const conRutas = s.rutas.length > 0;
  $('#b-rutas').hidden = !conRutas; $('#b-rutas2').hidden = !conRutas;
}

// ───────── panel ─────────
// Devuelve { html, campos } de lo que corresponde a la selección (vis.sel) y el modo (vis.modo).
export function armarPanel(s, vis) {
  const v = vista();
  let html;
  if (vis.modo === 'nuevaRuta') html = panelNuevaRuta(s, vis, v);
  else if (vis.sel?.tipo === 'ap') html = panelAeropuerto(s, vis, v);
  else if (vis.sel?.tipo === 'ruta' && s.rutas.some((r) => r.id === vis.sel.id)) html = panelRuta(s, vis, v);
  else if (vis.sel?.tipo === 'avion' && s.aviones.some((a) => a.id === vis.sel.id)) html = panelAvion(s, vis, v);
  else html = panelGeneral(s, vis, v);
  return { html, campos: v.campos };
}
const cabecera = (titulo, sub = '') => `<div class="p-cab"><h2>${titulo}${sub ? `<span class="sub">${sub}</span>` : ''}</h2>`
  + `<button class="cerrar" data-accion="cerrarPanel" data-k="cerrarPanel" aria-label="${esc(t('cerrarPanel'))}" title="${esc(t('cerrarPanel'))}">${icono('cerrar')}</button></div>`;

function panelGeneral(s, vis, v) {
  if (!s.rutas.length) return `${cabecera(esc(t('tusRutas')))}<p class="explica">${esc(t('ayudaInicio'))}</p>`;
  const ordenable = s.rutas.length >= 8;
  const orden = ordenable ? (vis.orden ?? 'neto') : null;
  const filas = ordenRutas(s, vis, orden).map((r) => {
    const avs = s.aviones.filter((a) => a.ruta === r.id).length;
    const f = M.flujoTramo(s, r.id);
    const perd = f ? f.ida.perdidas + f.vuelta.perdidas : 0;
    const neto = r.ingresos - r.costos;
    return `<button class="ruta" data-accion="verRuta" data-id="${esc(r.id)}" data-k="lr-${esc(r.id)}"><b>${nom(r.a)} ⇄ ${nom(r.b)}</b>`
      + `<span class="v">${v.t('rn:' + r.id, plata(neto), neto < 0 ? 'rojo' : 'verde')}</span>`
      + `<small style="grid-column:1/-1">${v.t('rs:' + r.id, t(avs === 1 ? 'rutaFilaSub1' : avs ? 'rutaFilaSub' : 'rutaFilaSub0', { n: avs, ocup: numero(r.ocup * 100), perdida: n1(perd) }))}</small></button>`;
  }).join('');
  const segs = ordenable ? `<div class="segs ordenar" role="group" aria-label="${esc(t('ordenarPor'))}">${['neto', 'ocup', 'perdida'].map((o) =>
    `<button data-accion="ordenar" data-v="${o}" data-k="ord-${o}" ${v.e('op:' + o, { p: orden === o })}>${esc(t('ord' + o[0].toUpperCase() + o.slice(1)))}</button>`).join('')}</div>` : '';
  return `${cabecera(esc(t('tusRutas')), esc(numero(s.rutas.length)))}${segs}<div class="lista-rutas">${filas}</div>`;
}
// El orden de la lista cambia solo cuando el jugador elige otro criterio, cambian las rutas o pasan 15 s (no salta bajo el dedo).
let ordenCache = { clave: '', t: 0, ids: [] };
function ordenRutas(s, vis, orden) {
  if (!orden) return s.rutas;
  const clave = `${orden}|${s.rutas.map((r) => r.id).join(',')}`;
  const ahora = performance.now();
  if (ordenCache.clave !== clave || ahora - ordenCache.t > 15000) {
    const val = (r) => {
      if (orden === 'ocup') return r.ocup;
      if (orden === 'perdida') { const f = M.flujoTramo(s, r.id); return f ? f.ida.perdidas + f.vuelta.perdidas : 0; }
      return r.ingresos - r.costos;
    };
    ordenCache = { clave, t: ahora, ids: [...s.rutas].sort((a, b) => val(b) - val(a)).map((r) => r.id) };
  }
  const porId = Object.fromEntries(s.rutas.map((r) => [r.id, r]));
  return ordenCache.ids.map((id) => porId[id]).filter(Boolean);
}

// Para una ciudad fuera de la red: con quién conectarla. La ciudad de la red más cercana que algún avión disponible alcanza (o la
// que propone la mejor próxima acción, si vino de ahí). Si ningún avión llega, por qué ciudad hacer escala.
export function conexionPara(s, id, desde = null) {
  const red = M.nodosRed(s);
  const nodos = red.length ? red : [M.HUB];
  const alc = Math.max(0, ...M.avionesDisponibles(s).map((x) => x.alcance));
  if (desde && nodos.includes(desde) && M.km(desde, id) <= alc) return { desde, costo: M.costoRuta(desde, id), km: M.km(desde, id) };
  const llegan = nodos.filter((n) => n !== id && M.km(n, id) <= alc).sort((a, b) => M.km(a, id) - M.km(b, id));
  if (llegan.length) return { desde: llegan[0], costo: M.costoRuta(llegan[0], id), km: M.km(llegan[0], id) };
  // escala: una ciudad disponible que un avión alcanza desde la red y que acerca al destino (mejor si desde ahí ya llega)
  let mejor = null;
  for (const id2 in M.AP) {
    if (id2 === id || nodos.includes(id2) || !M.ciudadDisponible(s, id2)) continue;
    const n = nodos.filter((x) => M.km(x, id2) <= alc).sort((a, b) => M.km(a, id2) - M.km(b, id2))[0];
    if (!n || M.km(id2, id) >= M.km(n, id)) continue;
    const v = (M.km(id2, id) <= alc ? 0 : 1e6) + M.km(n, id2) + M.km(id2, id);
    if (!mejor || v < mejor.v) mejor = { escala: id2, desde: n, v };
  }
  return mejor ? { escala: mejor.escala, desde: mejor.desde } : { nada: true };
}

function panelAeropuerto(s, vis, v) {
  const id = vis.sel.id, a = M.AP[id];
  if (!M.ciudadDisponible(s, id)) {
    const m = a.abre && MISIONES.find((x) => x.id === a.abre);
    const porMision = m && m.cap <= s.cap && a.cap <= s.cap;
    const txt = porMision ? t('bloqueadaMision', { mision: t(m.id, { meta: numero(m.meta), n: numero(m.n ?? 0) }) }) : t('bloqueadaCap', { n: a.cap });
    return `${cabecera(nom(id))}<p class="explica">${esc(txt)}</p>`;
  }
  const enRed = M.enRed(s, id);
  if (!enRed) {
    if (!M.nodosRed(s).length && id === M.HUB) return `${cabecera(`${nom(id)} <span class="etiqueta">hub</span>`)}<p class="explica">${esc(t('esLaRed'))}</p>`;
    const c = conexionPara(s, id, vis.sel.desde);
    const u = s.cap === 1 ? t('u_correo') : t('u_flujo');
    const pot = `<p class="explica">${v.t('pot', t('potencialTxt', { n: n1(M.potencial(s, id)), u }))}</p>`;
    if (c.desde && !c.escala) {
      const p = M.puedeAbrirRuta(s, c.desde, id);
      const falta = !p.ok && p.error === 'plata' ? t('faltaPlata', { monto: plata(c.costo - s.dinero) }) : !p.ok ? t('e_' + p.error, { precio: plata(c.costo), km: numero(c.km) }) : '';
      return `${cabecera(nom(id), esc(t('sinConectar')))}`
        + boton(v, 'conectar', { id, val: c.desde, clase: 'boton principal', dis: !p.ok, html: `${icono('ruta')}<span>${esc(t('conectarCon', { ciudad: M.AP[c.desde].nombre, precio: plata(c.costo) }))}</span>`, k: `conectar-${id}` })
        + `<p class="explica">${esc(t('conectarExplica', { a: M.AP[c.desde].nombre, b: a.nombre, km: numero(c.km) }))} ${v.t('falta', falta, 'rojo')}</p>${pot}`;
    }
    if (c.escala) {
      return `${cabecera(nom(id), esc(t('sinConectar')))}<p class="alerta">${icono('info')}<span>${esc(t('escalaEn', { ciudad: M.AP[c.escala].nombre }))}</span></p>`
        + boton(v, 'verCiudad', { id: c.escala, val: c.desde, html: esc(t('irA', { ciudad: M.AP[c.escala].nombre })) }) + pot;
    }
    return `${cabecera(nom(id), esc(t('sinConectar')))}<p class="explica">${esc(t('sinAlcance'))}</p>${pot}`;
  }
  // en la red
  const esHub = id === M.HUB || (s.niveles[id] ?? 0) > 0;
  const caps = Object.keys(M.capitulo(s).cargas);
  const cargas = caps.map((c) => `<span class="ficha">${v.t(`es:${c}`, `${numero(M.enEspera(s, id, c))} ${t('u_' + c)}`)}</span>`).join('');
  const rutasDe = s.rutas.filter((r) => r.a === id || r.b === id);
  const conexiones = rutasDe.filter((r) => s.aviones.some((x) => x.ruta === r.id)).length;
  let centro = '';
  if (esHub || conexiones >= 2 || M.enTransbordo(s, id) > 0) {
    const ind = M.indicadoresHub(s, id);
    const cap = M.capacidadTransbordo(s, id), costo = M.costoTransbordo(s, id), sig = TRANSBORDO[(s.niveles[id] ?? 0) + 1];
    const linea = ind.aTiempo7d == null ? t('hubSinDatos') : t('hubLinea', { pct: `${numero(ind.aTiempo7d * 100)}%`, h: n1(ind.horasAtraso) });
    const detalle = vis.detalle === 'ap' ? `<div class="detalle">
        <div class="fila-dato"><span>${esc(t('hubOcupacion'))}</span><span>${v.t('hd1', `${numero(ind.ocupacion * 100)}%`)}</span></div>
        <div class="fila-dato"><span>${esc(t('hubPerdida'))}</span><span>${v.t('hd2', `${numero(ind.perdidaDia)} ${unidadFlujo(s)}`)}</span></div>
        <div class="fila-dato"><span>${esc(t('hubCostoU'))}</span><span>${v.t('hd3', ind.costoUnidad == null ? '—' : plata(ind.costoUnidad))}</span></div>
        <div class="fila-dato"><span>${esc(t('hubEntregas7'))}</span><span>${v.t('hd4', numero(ind.entregas7d))}</span></div></div>` : '';
    centro = `<div class="bloque"><h3>${esc(t('transbordo'))}</h3>
      <div class="flujo"><b>${v.t('hl', linea, ind.aTiempo7d != null && ind.aTiempo7d < 0.8 ? 'rojo' : '')}</b><br>${v.t('hc', t('hubCapacidad', { u: numero(cap), n: numero(M.enTransbordo(s, id)) }))}</div>
      ${sig ? boton(v, 'transbordo', { id, dis: s.dinero < costo, html: esc(t('mejorar', { u: numero(sig.u), precio: plata(sig.precio) })) }) : `<p class="explica">${esc(t('maximo'))}</p>`}
      <button class="detalle-btn" data-accion="detalle" data-v="ap" data-k="det-ap" aria-expanded="${vis.detalle === 'ap'}">${esc(t('detalle'))}${icono('abajo')}</button>${detalle}</div>`;
  }
  const clasif = id === M.HUB ? bloqueClasificacion(s, v) : '';
  const lista = rutasDe.map((r) => {
    const otro = r.a === id ? r.b : r.a;
    return `<button class="ruta" data-accion="verRuta" data-id="${esc(r.id)}" data-k="ar-${esc(r.id)}"><b>⇄ ${nom(otro)}</b><span class="v">${esc(t('km', { n: numero(r.km) }))}</span></button>`;
  }).join('');
  return `${cabecera(`${nom(id)}${esHub ? ' <span class="etiqueta">hub</span>' : ''}`, esc(t('enRed')))}
    <div class="bloque" style="border:0;margin-top:0"><h3>${esc(t('esperan'))}</h3><div class="cargas">${cargas}</div></div>
    ${clasif}${centro}
    ${boton(v, 'nuevaRuta', { id, clase: 'boton principal', html: `${icono('ruta')}<span>${esc(t('nuevaRuta'))}</span>` })}
    ${lista ? `<div class="bloque lista-rutas"><h3>${esc(t('tusRutas'))}</h3>${lista}</div>` : ''}`;
}

// La primera clasificación (HN-30, capítulo 1): la pregunta con un botón por destino y «por orden de llegada»; mientras corre, el
// semáforo de cada avión; al terminar, el resultado (y, si no fue la mejor, cuál era). Bloque mínimo del área «modelo»: el área
// «interfaz» lo puede rediseñar.
function bloqueClasificacion(s, v) {
  const c = M.clasificacionActual(s);
  if (!c) return '';
  const [a, b] = c.opciones;
  if (c.estado === 'oferta') {
    const hora = horaJuego(s, c.limite);
    return `<div class="bloque bloque-clasif"><h3>${esc(t('clasifTitulo'))}</h3><p><b>${esc(t('clasifPregunta', { a: a.nombre, b: b.nombre }))}</b></p>
      <p class="explica">${esc(t('clasifTexto', { n: numero(a.sacas), c: numero(c.centro), hora }))}</p>
      ${c.opciones.map((o) => boton(v, 'clasificar', { id: o.id, clase: 'boton principal', html: esc(t('clasifPrimero', { ciudad: o.nombre })), k: `clasif-${o.id}` })).join('')}
      ${boton(v, 'clasificar', { id: '', html: esc(t('clasifSaltear')), k: 'clasif-saltear' })}</div>`;
  }
  const r = c.res, nombre = (id) => c.opciones.find((o) => o.id === id)?.nombre ?? '';
  const luces = r.radios.map((x) => `<span class="ficha"><span class="rj-luz ${esc(c.estado === 'hecha' || (c.minuto ?? 0) >= x.llega ? x.semaforo : '')}" role="img"></span>${esc(nombre(x.id))} ${numero(x.aTiempo)}/${numero(x.sacas)}</span>`).join('');
  if (c.estado === 'corriendo') {
    return `<div class="bloque bloque-clasif"><h3>${esc(t('clasifTitulo'))}</h3><p>${esc(c.primero ? t('clasifCorre', { ciudad: nombre(c.primero) }) : t('clasifCorreAuto'))}</p><div class="cargas">${luces}</div></div>`;
  }
  // hecha: el resultado queda a la vista un día de juego
  if (s.t - (s.clasif?.fin ?? 0) > 1440) return '';
  const pista = c.primero === c.mejor.primero ? t('clasifBien') : t('clasifMejor', { ciudad: nombre(c.mejor.primero) });
  return `<div class="bloque bloque-clasif"><h3>${esc(t('clasifTitulo'))}</h3><p><b>${esc(t('clasifRes', { pct: `${numero(r.pct * 100)}%`, monto: plata(r.ingreso) }))}</b></p>
    <div class="cargas">${luces}</div><p class="explica">${esc(pista)}</p></div>`;
}
const horaJuego = (s, enMin) => { const f = new Date(M.fecha(s).getTime() + enMin * 60000); return `${String(f.getUTCHours()).padStart(2, '0')}:${String(f.getUTCMinutes()).padStart(2, '0')}`; };

function panelNuevaRuta(s, vis, v) {
  const o = vis.origen;
  if (!vis.destino) {
    return `${cabecera(`${nom(o)} ⇄ …`)}<p class="explica">${esc(t('elegiDestino'))}</p>${boton(v, 'cancelar', { html: esc(t('cancelar')) })}`;
  }
  const d = vis.destino, p = M.puedeAbrirRuta(s, o, d), dist = M.km(o, d);
  const llegan = M.avionesDisponibles(s).filter((x) => x.alcance >= dist).map((x) => x.nombre).join(', ') || t('ninguno');
  const err = p.ok ? '' : t('e_' + p.error, { precio: plata(p.costo ?? M.costoRuta(o, d)), km: numero(dist) });
  return `${cabecera(`${nom(o)} ⇄ ${nom(d)}`, esc(t('km', { n: numero(dist) })))}<p class="explica">${esc(t('alcanzan', { lista: llegan }))}</p>
    <p class="explica">${v.t('err', err, 'rojo')}</p>
    ${boton(v, 'abrirRuta', { clase: 'boton principal', dis: !p.ok, html: esc(t('abrirRutaPor', { precio: plata(M.costoRuta(o, d)) })) })}
    ${boton(v, 'cancelar', { html: esc(t('cancelar')) })}`;
}

export function estadoAvion(s, av) {
  if (av.fase === 'vuelo') return t('estado_vuelo', { a: M.AP[av.hacia].nombre });
  if (av.espera === 'carga') return `${t('estado_carga')} · ${numero(M.listoParaCargar(s, av.id))}/${numero(Object.values(M.AV[av.tipo].lleva).reduce((a, b) => a + b, 0))}`;
  if (av.espera) return t('estado_' + av.espera);
  return t('estado_tierra', { a: M.AP[av.en].nombre });
}

function panelRuta(s, vis, v) {
  const id = vis.sel.tipo === 'ruta' ? vis.sel.id : null;
  const r = M.resumenRuta(s, id), f = M.flujoTramo(s, id);
  const u = unidadFlujo(s);
  const avs = r.aviones;
  // el sentido con más tráfico manda en la línea; los dos van en el detalle
  const sen = f.ida.pasan >= f.vuelta.pasan ? f.ida : f.vuelta;
  const esc1 = Math.max(sen.pasan, sen.capacidad, 0.1) * 1.1;
  // avisos que dicen qué hacer
  const sobran = avs.length >= 2 && sen.capacidad > 1.5 * Math.max(sen.pasan, 0.01);
  const trabadas = avs.length ? 0 : Math.round(r.directo.ida + r.directo.vuelta + r.esperan.ida + r.esperan.vuelta) || f.trabadas;
  const alertas = `<div ${v.e('al1', { o: !sobran })} class="alerta">${icono('alerta')}<span>${esc(t('alertaSobran'))}</span></div>`
    + `<div ${v.e('al2', { o: !trabadas })} class="alerta mala">${icono('alerta')}${v.t('al2t', t('alertaTrabadas', { n: numero(trabadas), u: t(s.cap === 1 ? 'u_correo' : 'u_flujo') }))}</div>`;
  // sin aviones la ruta no está en la red: se muestra la demanda directa del par
  const directa = r.demanda.reduce((a, x) => a + Math.max(x.ida, x.vuelta), 0);
  const linea = avs.length ? t('flujoLinea', { pasan: n1(sen.pasan), ofreces: n1(sen.capacidad), pierden: n1(sen.perdidas), u }) : t('flujoSinAviones', { n: n1(directa), u });
  const flujo = `<div class="bloque"><div class="flujo">${v.t('fl', linea)}</div>
    <div class="medidor" aria-hidden="true"><i ${v.e('mc', { w: `${Math.min(100, sen.capacidad / esc1 * 100).toFixed(1)}%` })}></i><em ${v.e('mp', { l: `${Math.min(100, sen.pasan / esc1 * 100).toFixed(1)}%` })}></em></div>
    <div class="leyenda"><span>▬ ${esc(t('flujoCap'))}</span><span><span class="ambar">▮</span> ${esc(t('flujoPasa'))}</span></div>
    <button class="detalle-btn" data-accion="detalle" data-v="ruta" data-k="det-ruta" aria-expanded="${vis.detalle === 'ruta'}">${esc(t('detalle'))}${icono('abajo')}</button>
    ${vis.detalle === 'ruta' ? `<div class="detalle">
      <p class="flujo">${v.t('d1', t('flujoSentido', { a: M.AP[f.ida.de].nombre, b: M.AP[f.ida.a].nombre, loc: n1(f.ida.locales), con: n1(f.ida.conexion), u }))}</p>
      <p class="flujo">${v.t('d2', t('flujoSentido', { a: M.AP[f.vuelta.de].nombre, b: M.AP[f.vuelta.a].nombre, loc: n1(f.vuelta.locales), con: n1(f.vuelta.conexion), u }))}</p>
      <div class="fila-dato"><span>${esc(t('perdidasSentido', { a: M.AP[f.ida.de].nombre, b: M.AP[f.ida.a].nombre }))}</span><span>${v.t('d3', `${n1(f.ida.perdidas)} ${u}/h`)}</span></div>
      <div class="fila-dato"><span>${esc(t('perdidasSentido', { a: M.AP[f.vuelta.de].nombre, b: M.AP[f.vuelta.a].nombre }))}</span><span>${v.t('d4', `${n1(f.vuelta.perdidas)} ${u}/h`)}</span></div>
      <div class="fila-dato"><span>${esc(t('costoDespegue'))}</span><span>${v.t('d5', r.costoDespegue == null ? '—' : plata(r.costoDespegue))}</span></div>
      <div class="fila-dato"><span>${esc(t('ingresoVuelo'))}</span><span>${v.t('d6', plata(r.ingresoMedio))}</span></div>
      <div class="fila-dato"><span>${esc(t('costoParado'))}</span><span>${v.t('d7', plata(r.costoHoraParado))}</span></div></div>` : ''}</div>`;
  // comprar: arriba de la lista de aviones, así sumar uno no corre los botones bajo el dedo
  const sobraCap = avs.length > 0 && sen.capacidad >= sen.pasan;
  const tipos = AVIONES.filter((x) => M.avionDisponible(s, x) && x.alcance >= r.km).map((x) => {
    const ok = M.puedeComprar(s, x.id, r.id);
    const e = M.estimarAvion(s, x.id, r.id) ?? 0;
    const efecto = sobraCap ? t('efectoSobra', { monto: plataSigno(e) }) : e > 0 ? t('efectoDia', { monto: plataSigno(e) }) : t('efectoCero');
    const cls = sobraCap || e < 0 ? 'rojo' : e > 0 ? 'verde' : 'tenue';
    const porQue = ok.ok ? '' : ` · ${t('e_' + ok.error, { precio: plata(ok.costo ?? x.precio), km: numero(r.km) })}`;
    return boton(v, 'comprar', { id: x.id, clase: 'compra', dis: !ok.ok, k: `comprar-${x.id}`,
      html: `<b>${esc(x.nombre)}</b><span class="precio">${plata(x.precio)}</span><small>${esc(capacidadTxt(x))}</small>${v.t('ef:' + x.id, efecto + porQue, `efecto ${cls}`)}` });
  }).join('');
  const necesitaBalizas = !M.iluminada(s, r) && (s.cap === 1 || avs.some((av) => !M.AV[av.tipo].nocturno));
  const balizas = r.balizas && s.cap === 1 ? `<div class="bloque"><p class="verde">${esc(t('balizasSi'))}</p></div>`
    : necesitaBalizas ? `<div class="bloque"><h3>${esc(t('balizas'))}</h3><p class="explica">${esc(t('balizasAyuda'))}</p>`
      + boton(v, 'balizas', { id: r.id, dis: s.dinero < M.costoBalizas(r, s), html: `${icono('baliza')}<span>${esc(t('balizasPoner', { precio: plata(M.costoBalizas(r, s)) }))}</span>` }) + '</div>' : '';
  const cm = M.CARGA_MINIMA.map((x) => `<button data-accion="cargaMin" data-id="${esc(r.id)}" data-v="${x}" data-k="cm-${x}" ${v.e('cm:' + x, { p: r.minCarga === x })}>${esc(t('cm' + Math.round(x * 100)))}</button>`).join('');
  const lista = avs.map((av) => `<div class="avion-fila ${vis.sel.avion === av.id ? 'marcada' : ''}">`
    + `<button class="ver" data-accion="verAvion" data-id="${av.id}" data-k="va-${av.id}"><b>${esc(M.AV[av.tipo].nombre)}</b><small>${v.t('ae:' + av.id, estadoAvion(s, av))}</small></button>`
    + boton(v, 'vender', { id: av.id, clase: 'vender', html: esc(t('vender')), aria: t('venderPor', { precio: plata(M.AV[av.tipo].precio * 0.6) }) }) + '</div>').join('');
  // sin aviones, comprar va primero: queda donde estaba «Conectar» (el dedo o el puntero ya está ahí)
  const compra = avs.length ? `<div class="bloque"><h3>${esc(t('comprarAvion'))}</h3>${tipos}</div>` : `<div class="bloque" style="border:0;margin-top:0">${tipos}</div>`;
  return `${cabecera(`${nom(r.a)} ⇄ ${nom(r.b)}`, v.t('km', t('rutaKm', { km: numero(r.km), vuelos: numero(r.vuelos) })))}
    ${avs.length ? `${alertas}${flujo}${compra}` : `${compra}${alertas}${flujo}`}
    <div class="bloque"><h3>${esc(t('cargaMinima'))}</h3><div class="segs" role="group">${cm}</div><p class="explica">${esc(t('cargaMinimaAyuda'))}</p></div>
    ${balizas}
    <div class="bloque"><h3>${esc(t('aviones'))} · ${numero(avs.length)}</h3>${lista || `<p class="explica">${esc(t('sinAviones'))}</p>`}</div>
    <div class="bloque"><h3>${esc(t('resultado'))}</h3>
      <div class="fila-dato"><span>${esc(t('ocupacion'))}</span><span>${v.t('oc', `${numero(r.ocup * 100)}%`)}</span></div>
      <div class="fila-dato"><span>${esc(t('ingresos'))}</span><span>${v.t('in', plata(r.ingresos))}</span></div>
      <div class="fila-dato"><span>${esc(t('costos'))}</span><span>${v.t('co', plata(r.costos))}</span></div>
      <div class="fila-dato"><b>${esc(t('neto'))}</b><b>${v.t('ne', plata(r.neto), r.neto < 0 ? 'rojo' : 'verde')}</b></div></div>
    ${boton(v, 'cerrarRuta', { id: r.id, clase: 'boton peligro', html: esc(t('cerrarRuta')) })}`;
}
export function capacidadTxt(tipo) {
  const cap = Object.entries(tipo.lleva).map(([c, n]) => `${n} ${t('u_' + c)}`).join(' + ');
  return t('capacidadAvion', { cap, vel: tipo.vel, alc: numero(tipo.alcance) });
}

function panelAvion(s, vis, v) {
  const f = M.fichaAvion(s, vis.sel.id);
  const tipo = M.AV[f.tipo], r = s.rutas.find((x) => x.id === f.ruta);
  const lleva = f.fase === 'vuelo'
    ? (f.carga.length ? f.carga.map((x) => t('fichaLleva', { n: numero(x.n), u: t('u_' + x.c), ciudad: M.AP[x.d].nombre })).join(' · ') : t('fichaVacio'))
    : t('fichaListo', { n: numero(f.listo), m: numero(f.capacidad) });
  const donde = f.fase === 'vuelo'
    ? t('fichaLlega', { ciudad: M.AP[f.hacia].nombre, hora: horaTexto(new Date(M.fecha(s).getTime() + f.llegaEn * 60000)) })
    : t('fichaEnTierra', { ciudad: M.AP[f.en].nombre, estado: estadoAvion(s, s.aviones.find((a) => a.id === f.id)) });
  const viaje = f.netoEst == null ? '' : t('fichaViaje', { monto: plataSigno(f.netoEst) });
  return `${cabecera(`${icono('avion').replace('class="ico"', 'class="ico" style="display:inline;vertical-align:-3px;margin-right:6px"')}${esc(tipo.nombre)}`, `${nom(r.a)} ⇄ ${nom(r.b)}`)}
    <div class="bloque" style="border:0;margin-top:0">
      <p class="flujo">${v.t('fd', donde)}</p><p class="flujo">${v.t('fl', lleva)}</p>
      <p class="flujo"><b>${v.t('fv', viaje, f.netoEst != null && f.netoEst < 0 ? 'rojo' : 'verde')}</b></p>
      <p class="explica">${v.t('ft', t('fichaTotal', { monto: plataSigno(f.neto), n: numero(f.viajes) }))}</p>
      <p class="explica">${esc(capacidadTxt(tipo))}</p></div>
    ${boton(v, 'verRuta', { id: r.id, html: esc(t('verRuta')), k: `fr-${r.id}` })}
    ${boton(v, 'vender', { id: f.id, clase: 'boton peligro', html: esc(t('venderPor', { precio: plata(tipo.precio * 0.6) })), k: `fv-${f.id}` })}`;
}

// ───────── avisos: un solo carril; los iguales que llegan juntos se agrupan ─────────
const AGRUPAR = {
  mision: (n, m) => (n > 1 ? t('misionesAgrupadas', { n, premio: plata(m) }) : m ? t('misionHecha', { premio: plata(m) }) : t('misionHechaSin')),
  contrato: (n, m) => (n > 1 ? t('contratosAgrupados', { n, premio: plata(m) }) : t('contratoCumplido', { premio: plata(m) })),
};
const MAX_AVISOS = 3;
export function aviso(txt, tipo = '', { ico, grupo, monto = 0, n = 1, dura = 3600 } = {}) {
  const carril = $('#avisos');
  const ahora = performance.now();
  if (grupo) {
    const prev = [...carril.children].find((d) => d.dataset.grupo === grupo && !d.classList.contains('sale') && ahora - d._t0 < 2500);
    if (prev) { prev._n += n; prev._monto += monto; prev.querySelector('span').textContent = AGRUPAR[grupo](prev._n, prev._monto); programarSalida(prev, dura); return prev; }
  }
  const d = document.createElement('div');
  d.className = `aviso ${tipo} entra`;
  d.innerHTML = `${icono(ico ?? (tipo === 'bueno' ? 'chequeo' : tipo === 'malo' ? 'alerta' : tipo === 'noche' ? 'luna' : 'info'))}<span></span>`;
  d.querySelector('span').textContent = grupo ? AGRUPAR[grupo](n, monto) : txt;
  if (grupo) { d.dataset.grupo = grupo; d._n = n; d._monto = monto; }
  d._t0 = ahora;
  carril.appendChild(d);
  requestAnimationFrame(() => d.classList.remove('entra'));
  // en horizontal bajo con el panel abierto el carril es angosto: un aviso por vez
  const bajo = matchMedia('(max-height: 480px) and (orientation: landscape)').matches;
  const max = bajo ? (document.getElementById('app').classList.contains('con-panel') ? 1 : 2) : MAX_AVISOS;
  const vivos = [...carril.children].filter((x) => !x.classList.contains('sale'));
  while (vivos.length > max) vivos.shift().remove();
  programarSalida(d, dura);
  return d;
}
function programarSalida(d, dura) {
  clearTimeout(d._sale); clearTimeout(d._quita);
  d._sale = setTimeout(() => d.classList.add('sale'), dura);
  d._quita = setTimeout(() => d.remove(), dura + 400);
}
// Avión desbloqueado: una tarjeta de hangar con su ficha, no solo un texto.
export function tarjetaHangar(tipoId) {
  const x = M.AV[tipoId];
  if (!x) return;
  const d = document.createElement('div');
  d.className = 'hangar';
  const cap = Object.entries(x.lleva).map(([c, n]) => `${n} ${t('u_' + c)}`).join(' + ');
  d.innerHTML = `<span class="sil">${icono('avion')}</span><h4><small>${esc(t('hangarNuevo'))}</small>${esc(x.nombre)}</h4>
    <button class="cerrar" data-accion="cerrarHangar" data-k="cerrarHangar-${tipoId}" aria-label="${esc(t('cerrar'))}">${icono('cerrar')}</button>
    <dl><div><dt>${esc(t('velocidad'))}</dt><dd>${x.vel} km/h</dd></div><div><dt>${esc(t('alcance'))}</dt><dd>${numero(x.alcance)} km</dd></div>
    <div><dt>${esc(t('capacidadTit'))}</dt><dd>${esc(cap)}</dd></div><div><dt>${esc(t('precio'))}</dt><dd>${plata(x.precio)}</dd></div></dl>`;
  $('#avisos').appendChild(d);
  programarSalida(d, 8000);
}
internos.cerrarHangar = (b) => b.closest('.hangar')?.remove();

// ───────── ventanas: todas con botón de cierre visible; el foco queda adentro; una a la vez (las demás esperan) ─────────
let ventanaActual = null;
const cola = [];
const alCambiar = [];
export const ventanaAbierta = () => ventanaActual;
export function alCambiarVentana(fn) { alCambiar.push(fn); }
export function ventana(op) {
  if (ventanaActual) { if (op.prioridad) cola.unshift(op); else cola.push(op); return; }
  abrir(op);
}
function abrir(op) {
  ventanaActual = op;
  const v = $('#ventana');
  const bots = op.botones ?? [];
  v.innerHTML = `<div class="tarjeta ${op.clase ?? ''}" role="dialog" aria-modal="true" aria-labelledby="v-titulo">
    ${op.cerrable === false ? '' : `<button class="cerrar" data-accion="ventanaCerrar" data-k="ventanaCerrar" aria-label="${esc(t('cerrar'))}" title="${esc(t('cerrar'))}">${icono('cerrar')}</button>`}
    ${op.arriba ?? ''}${op.sub ? `<p class="sub">${esc(op.sub)}</p>` : ''}
    <h2 id="v-titulo">${op.tituloHtml ?? esc(op.titulo)}</h2>
    ${op.texto ? `<p>${esc(op.texto)}</p>` : ''}${op.html ?? ''}${op.nota ? `<p class="nota">${esc(op.nota)}</p>` : ''}
    <div class="botones ${op.fila ? 'fila' : ''}">${bots.map((b, i) => `<button class="boton ${b.principal ? 'principal' : ''} ${b.clase ?? ''}" data-accion="ventanaBoton" data-v="${i}" data-k="vb-${i}">${b.icono ? icono(b.icono) : ''}<span>${esc(b.txt)}</span></button>`).join('')}</div></div>`;
  v.hidden = false;
  const foco = op.foco != null ? v.querySelector(`[data-v="${op.foco}"]`) : v.querySelector('.boton.principal') ?? v.querySelector('.botones button') ?? v.querySelector('.cerrar');
  foco?.focus({ preventScroll: true });
  op.alAbrir?.(v);
  for (const f of alCambiar) f();
}
export function cerrarVentana() {
  const v = $('#ventana');
  v.hidden = true; v.innerHTML = ''; ventanaActual = null;
  if (cola.length) abrir(cola.shift());
  for (const f of alCambiar) f();
}
internos.ventanaBoton = (b) => {
  const op = ventanaActual;
  const bt = op?.botones?.[Number(b.dataset.v)];
  if (!bt) return;
  if (bt.cierra !== false) cerrarVentana();
  bt.accion?.();
};
internos.ventanaCerrar = () => {
  const op = ventanaActual;
  if (!op || op.cerrable === false) return;
  cerrarVentana();
  op.alCerrar?.();
};
export const cerrarVentanaConTecla = () => internos.ventanaCerrar();

// ───────── selector de ciudades cercanas ─────────
let alElegir = null;
export function selector(ids, x, y, fn) {
  const el = $('#selector');
  alElegir = fn;
  el.setAttribute('aria-label', t('selectorTitulo'));
  el.innerHTML = ids.map((id) => `<button role="option" data-accion="elegirCiudad" data-id="${esc(id)}" data-k="sel-${esc(id)}">${nom(id)}</button>`).join('');
  el.hidden = false;
  const juego = $('#juego').getBoundingClientRect(), r = el.getBoundingClientRect();
  el.style.left = `${Math.max(8, Math.min(juego.width - r.width - 8, x - r.width / 2))}px`;
  el.style.top = `${Math.max(8, Math.min(juego.height - r.height - 8, y + 14))}px`;
}
export function cerrarSelector() { $('#selector').hidden = true; alElegir = null; }
export const selectorAbierto = () => !$('#selector').hidden;
internos.elegirCiudad = (b) => { const fn = alElegir; cerrarSelector(); fn?.(b.dataset.id); };
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (ev) => { if (selectorAbierto() && !ev.target.closest('#selector')) cerrarSelector(); }, true);
}

// ───────── textos fijos e íconos de la barra ─────────
export function textosFijos() {
  document.title = t('titulo');
  const pon = (sel, ico, k) => { const el = $(sel); if (!el) return; if (ico) el.innerHTML = icono(ico); el.setAttribute('aria-label', t(k)); el.title = t(k); };
  pon('[data-accion="vel"][data-v="0"]', 'pausa', 'pausa'); pon('[data-accion="vel"][data-v="1"]', 'play', 'vel1');
  pon('[data-accion="vel"][data-v="3"]', 'rapido', 'vel3'); pon('[data-accion="vel"][data-v="6"]', 'muyRapido', 'vel6');
  pon('#b-mas', 'mas', 'acercar'); pon('#b-menos', 'menos', 'alejar'); pon('#b-centrar', 'centrar', 'centrar');
  pon('#b-menu', 'menu', 'menu'); pon('#b-rutas', 'rutas', 'verRutas'); pon('#b-rutas2', 'rutas', 'verRutas');
  pon('#b-ritmo', null, 'acelerar'); $('#b-hoja')?.setAttribute('aria-label', t('hojaAlto'));
  $('#panel').setAttribute('aria-label', t('tusRutas'));
  $('#b-pausa').dataset.i = '';
}
