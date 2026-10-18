// Escena aislada de la ronda nocturna (ronda.html): se juega solo con toques y botones, sin trazar nada.
// Control 1: tocar un destino de la cinta lo manda al frente. Control 2: mover la salida de cada avión de a 15 minutos.
// Más «Plan sugerido». El resultado se lee sin texto: un semáforo por avión y una medalla.
// Con ?dia en la dirección es «La ronda del día»: la misma noche para todos (semilla = fecha UTC), una medalla por fecha y racha.
import * as R from './ronda.js';
import { t, lengua } from './i18n.js';

const $ = (s) => document.querySelector(s);
const q = new URLSearchParams(location.search);
const delDia = q.has('dia');
let semilla = Number(q.get('semilla')) || 1 + Math.floor(Math.random() * 200);
let ronda = null, vuelo = null;
const CLAVE_GUIA = 'hubnocturno.ronda.guia', CLAVE_DIA = 'hubnocturno.rondaDia';
const leer = (k) => { try { return JSON.parse(localStorage.getItem(k) ?? 'null'); } catch { return null; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

const hhmm = (m) => { const x = (22 * 60 + Math.round(m)) % 1440; return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };
const duracion = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
const pct = (m) => `${Math.max(0, Math.min(100, m / R.VENTANA * 100)).toFixed(2)}%`;
const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function nueva() {
  const e = delDia ? R.rondaDelDia(Date.now()) : R.escenaReferencia(semilla);
  ronda = R.nuevaRonda(e);
  vuelo = null;
  pintar();
}

// Minuto en que termina de clasificarse lo de cada destino con el orden actual de la cinta.
function finClasificacion() {
  const e = ronda.escena, rango = ronda.prioridad ? Object.fromEntries(ronda.prioridad.map((id, i) => [id, i])) : null;
  const cinta = e.orden.map((i, j) => [i, j]);
  if (rango) cinta.sort((a, b) => rango[e.radios[a[0]].id] - rango[e.radios[b[0]].id] || a[1] - b[1]);
  const fin = {};
  cinta.forEach(([i], j) => { fin[e.radios[i].id] = ((j + 1) * 60) / e.centro; });
  return fin;
}

function pintar(ahora = null) {
  const e = ronda.escena;
  const res = R.resultado(ronda);
  const porId = Object.fromEntries(res.radios.map((x) => [x.id, x]));
  const fin = finClasificacion();
  document.documentElement.lang = lengua();
  $('#r-titulo').textContent = delDia ? t('rondaDia') : t('rondaTitulo');
  $('#r-sub').textContent = delDia ? `${new Date().toISOString().slice(0, 10)} · ${t('rondaSub')}` : t('rondaSub');
  $('#r-cinta-t').textContent = t('rondaCinta');
  $('#r-aviones-t').textContent = t('rondaAviones');
  $('#r-leyenda').innerHTML = `<span><i class="l-clasif"></i>${esc(t('rondaLeyClasif'))}</span><span><i class="l-salida"></i>${esc(t('rondaLeySalida'))}</span>`
    + `<span><i class="l-vuelo"></i>${esc(t('rondaLeyVuelo'))}</span><span><i class="l-limite"></i>${esc(t('rondaLeyLimite'))}</span>`;
  $('#r-sugerido').textContent = t('rondaSugerido');
  $('#r-volar').textContent = vuelo?.terminado ? t('rondaRepetir') : t('rondaVolar');
  $('#r-otra').textContent = delDia ? t('rondaVolverJuego') : t('rondaOtra');
  $('#r-reloj').textContent = hhmm(ahora ?? 0);
  // cinta: el orden de clasificación
  $('#r-chips').innerHTML = R.ordenVisible(ronda).map((id, i) => {
    const x = e.radios.find((r) => r.id === id);
    const n = ronda.prioridad ? i + 1 : '·';
    return `<button class="r-chip ${porId[id].semaforo}" data-frente="${esc(id)}" aria-label="${esc(t('rondaAlFrente', { c: x.nombre }))}"><span class="n">${n}</span>${esc(x.nombre)}</button>`;
  }).join('');
  $('#r-centro').textContent = `${t('rondaCentro', { n: e.centro })} · ${t(ronda.prioridad ? 'rondaOrdenTuyo' : 'rondaOrdenLlegada')}`;
  // aviones: una línea de 22:00 a 07:00 con clasificación, listo, salida y límite
  $('#r-lista').innerHTML = e.radios.map((x) => {
    const r = porId[x.id], lim = R.limite(x), luz = ahora === null || ahora >= r.llega || vuelo?.terminado ? r.semaforo : '';
    const enVuelo = `left:${pct(r.salida)};width:${pct(Math.min(R.VENTANA, r.llega) - r.salida)}`;
    return `<div class="r-avion">
      <span class="r-luz ${luz}" role="img" aria-label="${esc(t('semaforo_' + r.semaforo))}"></span>
      <div class="r-info"><b>${esc(x.nombre)}</b><small>${esc(t('rondaVueloInfo', { v: duracion(x.vuelo), n: r.llevadas, m: x.sacas }))}</small></div>
      <div class="r-linea" aria-hidden="true">
        <span class="r-clasif" style="width:${pct(Math.min(fin[x.id] ?? 0, ahora ?? R.VENTANA))}"></span>
        <span class="r-clasif vuelo" style="${enVuelo}"></span>
        <span class="r-listo" style="left:${pct(x.listo)}"></span>
        <span class="r-limite" style="left:${pct(lim)}"></span>
        <span class="r-salida" style="left:${pct(r.salida)}"></span>
        <span class="r-ahora" style="left:${pct(ahora ?? 0)}"></span>
      </div>
      <div class="r-ctrl"><button data-mover="-1" data-id="${esc(x.id)}" aria-label="${esc(t('rondaAntes'))}">−</button><span>${hhmm(r.salida)}</span><button data-mover="1" data-id="${esc(x.id)}" aria-label="${esc(t('rondaDespues'))}">+</button></div>
    </div>`;
  }).join('');
  document.body.classList.toggle('volando', ahora !== null && !vuelo?.terminado);
  const med = $('#r-medalla');
  if (vuelo?.terminado) {
    const auto = R.simular(e);
    med.innerHTML = `<span class="disco ${res.medalla ?? 'nada'}" role="img" aria-label="${esc(t('medalla_' + (res.medalla ?? 'nada')))}"></span>
      <div><b>${esc(t('rondaResultado', { n: res.aTiempo, m: res.sacas }))}</b><br><small class="tenue">${esc(t('rondaAuto', { p: Math.round(auto.pct * 100) }))}${vuelo.dia ? ' · ' + esc(vuelo.dia) : ''}</small></div>`;
    med.classList.add('ver');
  } else med.classList.remove('ver');
}

// «Volar la noche»: el reloj corre de 22:00 a 07:00 en 4 segundos y se encienden los semáforos.
function volar() {
  if (vuelo && !vuelo.terminado) return;
  vuelo = { t0: performance.now(), terminado: false };
  const paso = (ahora) => {
    const m = Math.min(R.VENTANA, (ahora - vuelo.t0) / 4000 * R.VENTANA);
    pintar(m);
    if (m < R.VENTANA) requestAnimationFrame(paso);
    else { vuelo.terminado = true; if (delDia) registrarDelDia(); pintar(R.VENTANA); }
  };
  requestAnimationFrame(paso);
}

// La ronda del día: una medalla por fecha (los reintentos no la cambian), racha y un premio chico para el juego.
function registrarDelDia() {
  const res = R.resultado(ronda);
  const guardado = leer(CLAVE_DIA) ?? {};
  const { registro, nueva, medalla } = R.registrarDia(guardado.registro, Date.now(), res.medalla);
  const premio = nueva && medalla ? R.PREMIO_DIA[medalla] : 0;
  escribir(CLAVE_DIA, { registro, premioPendiente: (guardado.premioPendiente ?? 0) + premio });
  vuelo.dia = `${t('rondaMedallaHoy', { m: t('medalla_' + (medalla ?? 'nada')) })} · ${t('rondaRacha', { n: R.racha(registro, Date.now()) })}`;
}

// Guía de 2 pasos (se puede saltear; se muestra una sola vez).
function guia(paso = 1) {
  const g = $('#r-guia');
  document.querySelectorAll('.resalta').forEach((el) => el.classList.remove('resalta'));
  if (paso > 2) { g.hidden = true; escribir(CLAVE_GUIA, true); return; }
  (paso === 1 ? $('#r-chips') : $('.r-avion .r-ctrl'))?.classList.add('resalta');
  g.innerHTML = `<div class="tarjeta" role="dialog" aria-modal="true"><div class="paso">${paso}/2</div><p>${esc(t(paso === 1 ? 'rondaGuia1' : 'rondaGuia2'))}</p>
    <div class="botones"><button class="boton" id="g-saltear">${esc(t('rondaSaltear'))}</button><button class="boton principal" id="g-sig">${esc(t(paso === 1 ? 'rondaSiguiente' : 'rondaEntendido'))}</button></div></div>`;
  g.hidden = false;
  $('#g-sig').onclick = () => guia(paso + 1);
  $('#g-saltear').onclick = () => guia(3);
}

document.addEventListener('click', (ev) => {
  const f = ev.target.closest('[data-frente]');
  if (f && !(vuelo && !vuelo.terminado)) { R.alFrente(ronda, f.dataset.frente); vuelo = null; pintar(); return; }
  const m = ev.target.closest('[data-mover]');
  if (m && !(vuelo && !vuelo.terminado)) { R.mover(ronda, m.dataset.id, Number(m.dataset.mover)); vuelo = null; pintar(); }
});
$('#r-sugerido').onclick = () => { if (vuelo && !vuelo.terminado) return; R.aplicarSugerido(ronda); vuelo = null; pintar(); };
$('#r-volar').onclick = () => { if (vuelo?.terminado) { vuelo = null; pintar(); } volar(); };
$('#r-otra').onclick = () => { if (delDia) { location.href = 'index.html'; return; } semilla = 1 + Math.floor(Math.random() * 200); nueva(); };

nueva();
if (!leer(CLAVE_GUIA) && !q.has('singuia')) guia(1);
window.__ronda = { estado: () => ronda, R };
