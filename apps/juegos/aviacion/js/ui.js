// Interfaz en el DOM: barra superior, misión, panel contextual, avisos y ventanas.
import * as M from './modelo.js';
import { AVIONES, TRANSBORDO, MISIONES, CAPITULOS } from './datos.js';
import { t, plata, numero, fechaTexto, lengua } from './i18n.js';

const $ = (sel) => document.querySelector(sel);
const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nom = (id) => esc(M.AP[id].nombre);

export function barra(s, vel) {
  $('#caja').textContent = plata(s.dinero);
  $('#caja').classList.toggle('rojo', s.dinero < 0);
  const gd = M.gananciaDia(s);
  $('#dia').textContent = `${gd >= 0 ? '+' : ''}${plata(gd)} ${t('porDia')}`;
  $('#dia').classList.toggle('rojo', gd < 0);
  $('#reloj').textContent = `${M.esNoche(s) ? '☾' : '☀'} ${fechaTexto(M.fecha(s))}`;
  for (const b of document.querySelectorAll('[data-vel]')) b.setAttribute('aria-pressed', String(Number(b.dataset.vel) === vel));
}

export function mision(s) {
  const m = M.misionActual(s);
  const el = $('#mision');
  if (!m) {
    if (M.capituloTerminado(s) && s.cap < CAPITULOS.length) {
      el.innerHTML = `<b>${esc(t('capituloListo'))}</b><button class="boton chico" data-accion="capitulo">${esc(t('siguienteCapitulo', { n: s.cap + 1 }))}</button>`;
    } else el.innerHTML = `<b>${esc(t('finTitulo'))}</b>`;
    return;
  }
  const meta = m.tipo === 'mejorDia' ? plata(m.meta) : numero(m.meta);
  const p = Math.min(1, M.progreso(s, m) / m.meta);
  const total = MISIONES.filter((x) => x.cap === s.cap).length, n = MISIONES.filter((x) => x.cap === s.cap && M.misionHecha(s, x.id)).length + 1;
  el.innerHTML = `<div class="mision-cab">${esc(t('mision'))} ${n}/${total}${m.premio ? ` · ${esc(t('premio', { premio: plata(m.premio) }))}` : ''}</div>
    <div class="mision-txt">${esc(t(m.id, { meta, n: numero(m.n ?? 0) }))}</div><div class="progreso"><span style="width:${(p * 100).toFixed(1)}%"></span></div>`;
}

function filaCargas(s, ap) {
  const caps = Object.keys(M.capitulo(s).cargas);
  return caps.map((c) => `<span class="ficha">${numero(M.enEspera(s, ap, c))} ${esc(t('u_' + c))}</span>`).join(' ');
}

function capacidadTxt(tipo) {
  const cap = Object.entries(tipo.lleva).map(([c, n]) => `${n} ${t('u_' + c)}`).join(' + ');
  return t('capacidadAvion', { cap, vel: tipo.vel, alc: numero(tipo.alcance) });
}

export function panel(s, vis) {
  const el = $('#panel-cuerpo');
  const sel = vis.sel;
  if (vis.modo === 'nuevaRuta') return panelNuevaRuta(s, vis, el);
  if (!sel) return panelGeneral(s, el);
  if (sel.tipo === 'ap') return panelAeropuerto(s, sel.id, el);
  if (sel.tipo === 'ruta') return panelRuta(s, sel.id, el, null);
  if (sel.tipo === 'avion') { const av = s.aviones.find((a) => a.id === sel.id); if (av) return panelRuta(s, av.ruta, el, av.id); }
  return panelGeneral(s, el);
}

function panelGeneral(s, el) {
  const filas = s.rutas.map((r) => {
    const n = r.ingresos - r.costos, avs = s.aviones.filter((a) => a.ruta === r.id).length;
    return `<button class="fila" data-accion="verRuta" data-id="${esc(r.id)}"><span>${nom(r.a)} ⇄ ${nom(r.b)}</span><span class="${n < 0 ? 'rojo' : 'verde'}">${plata(n)}</span><small>${avs} ✈</small></button>`;
  }).join('');
  el.innerHTML = `${s.rutas.length ? '' : `<p class="ayuda">${esc(t('ayudaInicio'))}</p>`}
    <h3>${esc(t('tusRutas'))}</h3>${filas || `<p class="tenue">${esc(t('sinRutas'))}</p>`}`;
}

function panelAeropuerto(s, id, el) {
  const a = M.AP[id];
  if (!M.ciudadDisponible(s, id)) { el.innerHTML = `<h2>${nom(id)}</h2><p class="tenue">${esc(t('bloqueadaCap', { n: a.cap }))}</p>`; return; }
  const enRed = M.enRed(s, id);
  const niv = s.niveles[id] ?? 0, cap = M.capacidadTransbordo(s, id), sig = TRANSBORDO[niv + 1];
  const rutas = s.rutas.filter((r) => r.a === id || r.b === id).map((r) => {
    const otro = r.a === id ? r.b : r.a;
    return `<button class="fila" data-accion="verRuta" data-id="${esc(r.id)}"><span>⇄ ${nom(otro)}</span><span>${t('km', { n: numero(r.km) })}</span></button>`;
  }).join('');
  const puede = enRed || (M.nodosRed(s).length === 0 && id === 'BUE');
  el.innerHTML = `<h2>${nom(id)}${id === 'BUE' ? ' <span class="etiqueta">hub</span>' : ''}</h2>
    <p class="${enRed ? 'verde' : 'tenue'}">${esc(enRed ? t('enRed') : t('sinConectar'))}</p>
    ${enRed ? `<div class="bloque"><div class="tenue">${esc(t('esperan'))}</div>${filaCargas(s, id)}</div>
      <div class="bloque"><h3>${esc(t('transbordo'))}</h3><p class="ayuda">${esc(t('transbordoAyuda'))}</p>
        <p>${esc(t('capacidad', { u: numero(cap) }))} · ${esc(t('enTransbordoTxt'))}: <b class="${M.enTransbordo(s, id) > cap * 2 ? 'rojo' : ''}">${numero(M.enTransbordo(s, id))}</b></p>
        ${sig ? `<button class="boton" data-accion="transbordo" data-id="${id}" ${s.dinero < sig.precio ? 'disabled' : ''}>${esc(t('mejorar', { u: numero(sig.u), precio: plata(sig.precio) }))}</button>` : `<p class="tenue">${esc(t('maximo'))}</p>`}
      </div>` : id === 'BUE' ? `<p class="ayuda">${esc(t('ayudaInicio'))}</p>` : `<p>${esc(t('potencial', { n: numero(M.potencial(s, id), 1) }))}</p>`}
    ${puede ? `<button class="boton principal" data-accion="nuevaRuta" data-id="${id}">${esc(t('nuevaRuta'))}</button>` : ''}
    ${rutas ? `<h3>${esc(t('tusRutas'))}</h3>${rutas}` : ''}`;
}

function panelNuevaRuta(s, vis, el) {
  const o = vis.origen;
  if (!vis.destino) {
    el.innerHTML = `<h2>${nom(o)} ⇄ …</h2><p class="ayuda">${esc(t('elegiDestino'))}</p><button class="boton" data-accion="cancelar">${esc(t('cancelar'))}</button>`;
    return;
  }
  const d = vis.destino, p = M.puedeAbrirRuta(s, o, d), dist = M.km(o, d);
  const llegan = M.avionesDisponibles(s).filter((x) => x.alcance >= dist).map((x) => x.nombre).join(', ') || t('ninguno');
  const error = p.ok ? '' : `<p class="rojo">${esc(t('e_' + p.error, { precio: plata(p.costo ?? M.costoRuta(o, d)), km: numero(dist) }))}</p>`;
  el.innerHTML = `<h2>${nom(o)} ⇄ ${nom(d)}</h2><p>${esc(t('km', { n: numero(dist) }))} · ${esc(t('alcanzan', { lista: llegan }))}</p>${error}
    <button class="boton principal" data-accion="abrirRuta" ${p.ok ? '' : 'disabled'}>${esc(t('abrirRutaPor', { precio: plata(M.costoRuta(o, d)) }))}</button>
    <button class="boton" data-accion="cancelar">${esc(t('cancelar'))}</button>`;
}

function estadoAvion(av) {
  if (av.fase === 'vuelo') return t('estado_vuelo', { a: M.AP[av.hacia].nombre });
  if (av.espera) return t('estado_' + av.espera);
  return t('estado_tierra', { a: M.AP[av.en].nombre });
}

function panelRuta(s, id, el, avionSel) {
  const r = M.resumenRuta(s, id);
  if (!r) return panelGeneral(s, el);
  const dem = r.demanda.map((x) => `<div class="fila-dato"><span>${esc(t(x.c))}</span><span>${esc(t('porHora', { n: numero(x.ida, 1) }))} → · ← ${esc(t('porHora', { n: numero(x.vuelta, 1) }))}</span></div>`).join('');
  const avs = r.aviones.map((av) => `<div class="fila ${av.id === avionSel ? 'marcada' : ''}"><span>✈ ${esc(M.AV[av.tipo].nombre)}</span><small>${esc(estadoAvion(av))}</small>
      <button class="boton chico" data-accion="vender" data-id="${av.id}" title="${esc(t('venderPor', { precio: plata(M.AV[av.tipo].precio * 0.6) }))}">${esc(t('vender'))}</button></div>`).join('');
  const tipos = AVIONES.filter((x) => M.avionDisponible(s, x) && x.alcance >= r.km).map((x) =>
    `<button class="fila compra" data-accion="comprar" data-id="${x.id}" ${M.puedeComprar(s, x.id, r.id).ok ? '' : 'disabled'}><span><b>${esc(x.nombre)}</b> <small>${esc(capacidadTxt(x))}</small></span><span>${plata(x.precio)}</span></button>`).join('');
  const necesitaBalizas = r.aviones.some((av) => !M.AV[av.tipo].nocturno) || (s.cap === 1);
  const balizas = !necesitaBalizas ? '' : r.balizas ? `<p class="verde">✦ ${esc(t('balizasSi'))}</p>` :
    `<p class="ayuda">${esc(t('balizasAyuda'))}</p><button class="boton" data-accion="balizas" ${s.dinero < M.costoBalizas(r, s) ? 'disabled' : ''}>✦ ${esc(t('balizasPoner', { precio: plata(M.costoBalizas(r, s)) }))}</button>`;
  const cm = M.CARGA_MINIMA.map((v) => `<button class="seg" data-accion="cargaMin" data-v="${v}" aria-pressed="${r.minCarga === v}">${esc(t('cm' + Math.round(v * 100)))}</button>`).join('');
  el.innerHTML = `<h2>${nom(r.a)} ⇄ ${nom(r.b)}</h2><p class="tenue">${esc(t('km', { n: numero(r.km) }))}</p>
    <div class="bloque">${dem}</div>
    <div class="bloque"><h3>${esc(t('aviones'))}</h3>${avs || `<p class="ayuda">${esc(t('sinAviones'))}</p>`}${tipos}</div>
    ${balizas ? `<div class="bloque"><h3>${esc(t('balizas'))}</h3>${balizas}</div>` : ''}
    <div class="bloque"><h3>${esc(t('cargaMinima'))}</h3><div class="segmentos">${cm}</div><p class="ayuda">${esc(t('cargaMinimaAyuda'))}</p></div>
    <div class="bloque"><h3>${esc(t('resultado'))}</h3>
      <div class="fila-dato"><span>${esc(t('vuelos'))}</span><span>${numero(r.vuelos)}</span></div>
      <div class="fila-dato"><span>${esc(t('ocupacion'))}</span><span>${numero(r.ocup * 100)}%</span></div>
      <div class="fila-dato"><span>${esc(t('ingresos'))}</span><span>${plata(r.ingresos)}</span></div>
      <div class="fila-dato"><span>${esc(t('costos'))}</span><span>${plata(r.costos)}</span></div>
      <div class="fila-dato"><b>${esc(t('neto'))}</b><b class="${r.neto < 0 ? 'rojo' : 'verde'}">${plata(r.neto)}</b></div></div>
    <button class="boton peligro" data-accion="cerrarRuta" data-id="${esc(id)}">${esc(t('cerrarRuta'))}</button>`;
}

export function aviso(txt, tipo = '') {
  const d = document.createElement('div');
  d.className = `aviso ${tipo}`; d.textContent = txt;
  $('#avisos').appendChild(d);
  setTimeout(() => d.classList.add('sale'), 3200);
  setTimeout(() => d.remove(), 3700);
}

export function ventana({ titulo, texto, nota, botones }) {
  const v = $('#ventana');
  v.innerHTML = `<div class="tarjeta" role="dialog" aria-modal="true" aria-labelledby="v-titulo"><h2 id="v-titulo">${esc(titulo)}</h2><p>${esc(texto)}</p>
    ${nota ? `<p class="nota">${esc(nota)}</p>` : ''}<div class="botones"></div></div>`;
  for (const b of botones) {
    const el = document.createElement('button');
    el.className = `boton ${b.principal ? 'principal' : ''}`; el.textContent = b.txt;
    el.onclick = () => { v.hidden = true; b.accion?.(); };
    v.querySelector('.botones').appendChild(el);
  }
  v.hidden = false;
  v.querySelector('.botones button')?.focus();
}

export function textosFijos() {
  document.documentElement.lang = lengua();
  document.title = `${t('titulo')} · ${t('subtitulo')}`;
  $('#titulo').textContent = t('titulo');
  for (const [sel, k] of [['[data-vel="0"]', 'pausa'], ['[data-vel="1"]', 'vel1'], ['[data-vel="3"]', 'vel3'], ['#b-mas', 'acercar'], ['#b-menos', 'alejar'], ['#b-centrar', 'centrar'], ['#b-menu', 'menu']]) {
    const el = $(sel); if (el) { el.setAttribute('aria-label', t(k)); el.title = t(k); }
  }
}
