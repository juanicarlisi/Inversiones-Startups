// Ronda nocturna dentro del juego (HN-16) y parte de la mañana.
// En las noches de ronda aparece un chip («La ronda empieza a las 22:00»): nunca interrumpe ni abre nada solo. Si el jugador la
// acepta, se abre la vista de la noche y el tiempo baja a 3 minutos de juego por segundo real (unos 140 s de 22:00 a 05:00). Si no,
// corre el automático sin castigo. Se juega solo con toques: subir o bajar destinos en la cinta, mover cada salida de a 15 minutos
// y «Plan sugerido». Nada de trazar.
import * as M from './modelo.js';
import * as RONDA from './ronda.js';
import { MISIONES } from './datos.js';
import { t, plata, plataSigno, numero, horaTexto } from './i18n.js';
import { icono } from './iconos.js';
import { vista, pintar, esc, $, ventana } from './ui.js';

export const MIN_JUEGO_POR_SEG = 3;          // ritmo de la ronda aceptada
const CLAVE_TUT = 'hubnocturno.rondaJuego.guia';
const leer = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const escribir = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };

let abierta = false, aceptada = null, tut = 0, escenaCache = { t: -1, e: null };
export const rondaAbierta = () => abierta;
export const aceptadaEsta = (s) => aceptada != null && s.ronda?.noche?.id === aceptada;

// Texto del chip (o null si esta noche no hay ronda o ya pasó).
export function chipRonda(s) {
  const n = s.ronda?.noche;
  if (!n) return null;
  if (n.estado === 'previa') return t('rondaChip');
  if (n.estado === 'corriendo' && s.t < n.fin) return t('rondaChipCorre', { hora: horaTexto(M.fecha(s)) });
  return null;
}
// ¿El tiempo va lento? Solo con la vista abierta, una ronda aceptada y antes de las 05:00.
export function lenta(s) {
  if (!abierta || !aceptadaEsta(s)) return false;
  const h = M.hora(s);
  return !(h >= 5 && h < 20);
}

export function abrir(s) {
  if (!s.ronda?.noche) return false;
  aceptada = s.ronda.noche.id; abierta = true;
  $('#ronda').hidden = false;
  if (leer(CLAVE_TUT) !== 'hecha') tut = 1;
  pintarRonda(s, true);
  $('#ronda').querySelector('.rj-pie .boton.principal')?.focus({ preventScroll: true });
  return true;
}
export function cerrar() { abierta = false; tut = 0; const r = $('#ronda'); r.hidden = true; r.innerHTML = ''; r._html = null; }

// Escena de la noche: la congelada a las 22:00 o, antes del corte, la que se armaría con lo que hay ahora (cada 2 s de reloj).
function escena(s) {
  const n = s.ronda.noche;
  if (n.escena) return n.escena;
  const ahora = performance.now();
  if (!escenaCache.e || ahora - escenaCache.t > 2000 || escenaCache.id !== n.id) escenaCache = { t: ahora, id: n.id, e: M.escenaRonda(s) };
  return escenaCache.e;
}
const ordenActual = (s, e) => s.banco?.[M.HUB]?.prioridad?.filter((id) => e.radios.some((x) => x.id === id)) ?? e.radios.map((x) => x.id);
const hhmm = (m) => { const x = ((22 * 60 + Math.round(m)) % 1440 + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };
const dur = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
const pct = (m) => `${Math.max(0, Math.min(100, m / RONDA.VENTANA * 100)).toFixed(2)}%`;

export function pintarRonda(s, forzar = false) {
  if (!abierta) return;
  const n = s.ronda?.noche;
  if (!n) { cerrar(); return; }
  const e = escena(s);
  const orden = ordenActual(s, e);
  const b = s.banco?.[M.HUB] ?? {};
  const plan = { prioridad: orden, salidas: b.salidas ?? null };
  const sim = RONDA.simular({ ...e, radios: e.radios }, plan);
  const porId = Object.fromEntries(sim.radios.map((x) => [x.id, x]));
  // fin de clasificación de cada destino con el orden de la cinta
  const rango = Object.fromEntries(orden.map((id, i) => [id, i]));
  const cinta = e.orden.map((i, j) => [i, j]).sort((x, y) => (rango[e.radios[x[0]].id] ?? 99) - (rango[e.radios[y[0]].id] ?? 99) || x[1] - y[1]);
  const fin = {};
  cinta.forEach(([i], j) => { fin[e.radios[i].id] = ((j + 1) * 60) / e.centro; });
  const ahoraMin = s.t - n.corte; // minutos desde las 22:00 (negativo antes del corte)
  const v = vista();
  const filas = orden.map((id, i) => {
    const x = e.radios.find((r) => r.id === id), r = porId[id];
    const lim = RONDA.limite(x);
    return `<div class="rj-fila" data-ruta="${esc(id)}">
      <span class="n">${i + 1}</span>
      <span ${v.e('luz:' + id, { c: r.semaforo, titulo: t('semaforo_' + r.semaforo) })} class="rj-luz" role="img"></span>
      <span class="rj-nom"><b>${esc(x.nombre)}</b><small>${v.t('fi:' + id, t('rondaFilaInfo', { n: numero(x.sacas), v: dur(x.vuelo) }))}</small></span>
      <span class="rj-mueve">
        <button class="rj-mini" data-accion="rondaSubir" data-id="${esc(id)}" data-k="rs-${esc(id)}" aria-label="${esc(t('rondaSubir'))}" title="${esc(t('rondaSubir'))}" ${i === 0 ? 'disabled' : ''}>${icono('arriba')}</button>
        <button class="rj-mini" data-accion="rondaBajar" data-id="${esc(id)}" data-k="rb-${esc(id)}" aria-label="${esc(t('rondaBajar'))}" title="${esc(t('rondaBajar'))}" ${i === orden.length - 1 ? 'disabled' : ''}>${icono('abajo')}</button></span>
      <div class="rj-linea" aria-hidden="true">
        <span class="clasif" ${v.e('lc:' + id, { w: pct(Math.min(fin[id] ?? 0, ahoraMin < 0 ? RONDA.VENTANA : Math.max(0, ahoraMin))) })}></span>
        <span class="vuelo" ${v.e('lv:' + id, { l: pct(r.salida), w: pct(Math.min(RONDA.VENTANA, r.llega) - r.salida) })}></span>
        <span class="limite" style="left:${pct(lim)}"></span>
        <span class="sale" ${v.e('ls:' + id, { l: pct(r.salida) })}></span>
        <span class="ahora" ${v.e('la:' + id, { l: pct(Math.max(0, ahoraMin)), o: ahoraMin < 0 })}></span></div>
      <div class="rj-salida">
        <button class="rj-mini" data-accion="rondaAntes" data-id="${esc(id)}" data-k="ra-${esc(id)}" aria-label="${esc(t('rondaAntes'))}" title="${esc(t('rondaAntes'))}">${icono('menos')}</button>
        ${v.t('hs:' + id, hhmm(r.salida))}
        <button class="rj-mini" data-accion="rondaDespues" data-id="${esc(id)}" data-k="rd-${esc(id)}" aria-label="${esc(t('rondaDespues'))}" title="${esc(t('rondaDespues'))}">${icono('mas')}</button></div></div>`;
  }).join('');
  const guia = tut ? `<div class="rj-guia" role="note"><div class="paso">${esc(t('rondaGuia'))} ${tut}/2</div><p>${esc(t(tut === 1 ? 'rondaTut1' : 'rondaTut2'))}</p>
    <div class="botones"><button class="boton" data-accion="rondaTutSaltear" data-k="rts">${esc(t('rondaSaltear'))}</button>
    <button class="boton principal" data-accion="rondaTutSig" data-k="rtn">${esc(t(tut === 1 ? 'rondaSiguiente' : 'rondaEntendido'))}</button></div></div>` : '';
  const html = `<header class="rj-cab"><div class="rj-tit"><h2>${esc(t('rondaTitulo'))}</h2><small>${esc(t('rondaCorteTxt'))}</small></div>
      ${v.t('pred', `${numero(sim.pct * 100)}%`, `rj-pred ${sim.pct >= 1 ? 'verde' : sim.pct >= 0.7 ? 'amarillo' : 'rojo'}`)}
      ${v.t('reloj', horaTexto(M.fecha(s)), 'rj-reloj')}
      <button class="cerrar" data-accion="rondaCerrar" data-k="rondaCerrar" aria-label="${esc(t('rondaVolverMapa'))}" title="${esc(t('rondaVolverMapa'))}">${icono('cerrar')}</button></header>
    <div class="rj-cuerpo">
      <p class="rj-ley"><span><i class="l-c"></i>${esc(t('rondaLeyClasif'))}</span><span><i class="l-s"></i>${esc(t('rondaLeySalida'))}</span><span><i class="l-l"></i>${esc(t('rondaLeyLimite'))}</span>
        <span>${v.t('predTxt', t('rondaResultado', { n: numero(sim.aTiempo), m: numero(sim.sacas) }))}</span></p>
      <div class="rj-escala" aria-hidden="true"><span class="marcas"><span>22:00</span><span>01:00</span><span>04:00</span><span>07:00</span></span></div>
      ${filas}</div>
    <footer class="rj-pie"><button class="boton" data-accion="rondaSugerido" data-k="rondaSugerido">${icono('estrella')}<span>${esc(t('rondaSugerido'))}</span></button>
      <button class="boton principal" data-accion="rondaCerrar" data-k="rondaVolver">${esc(t('rondaVolverMapa'))}</button></footer>${guia}`;
  const el = $('#ronda');
  pintar(el, html, v.campos, forzar);
  // la guía de la primera ronda marca los controles del primer destino
  for (const x of el.querySelectorAll('.marcado')) x.classList.remove('marcado');
  if (tut === 1) el.querySelector('.rj-fila .rj-mueve')?.classList.add('marcado');
  if (tut === 2) el.querySelector('.rj-fila .rj-salida')?.classList.add('marcado');
}

// Acciones de la vista (las llama main.js; devuelven true si cambiaron algo).
export function accion(s, nombre, id) {
  const n = s.ronda?.noche;
  if (!n && nombre !== 'rondaCerrar') return false;
  const e = n ? escena(s) : null;
  if (nombre === 'rondaSubir' || nombre === 'rondaBajar') {
    const orden = ordenActual(s, e), i = orden.indexOf(id), j = nombre === 'rondaSubir' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= orden.length) return false;
    [orden[i], orden[j]] = [orden[j], orden[i]];
    return M.fijarPrioridad(s, M.HUB, orden).ok;
  }
  if (nombre === 'rondaAntes' || nombre === 'rondaDespues') return M.moverSalida(s, id, nombre === 'rondaAntes' ? -1 : 1).ok;
  if (nombre === 'rondaSugerido') { const p = M.planSugerido(s, M.HUB); return p ? M.aplicarPlan(s, p).ok : false; }
  if (nombre === 'rondaTutSig') { tut = tut >= 2 ? 0 : tut + 1; if (!tut) escribir(CLAVE_TUT, 'hecha'); return true; }
  if (nombre === 'rondaTutSaltear') { tut = 0; escribir(CLAVE_TUT, 'hecha'); return true; }
  if (nombre === 'rondaCerrar') { cerrar(); return true; }
  return false;
}

// Fin de la noche: si se jugó, una pantalla con la medalla, el % a primera hora y el ingreso contra el automático.
export function resultado(s, e, alCerrar) {
  if (abierta) cerrar();
  const pctTxt = numero(e.pctPrimeraHora * 100);
  if (!e.jugada) return { aviso: t('rondaAutoAviso', { pct: pctTxt }) };
  const dif = e.ingreso - e.ingresoAutomatico;
  const vs = Math.abs(dif) < 1 ? t('rondaVsAutoIgual') : dif > 0 ? t('rondaVsAutoMas', { monto: plata(dif) }) : t('rondaVsAutoMenos', { monto: plata(-dif) });
  const med = e.medalla ?? 'nada';
  ventana({ titulo: t('rondaResTitulo', { m: t('medalla_' + med) }), clase: 'portada',
    arriba: `<div class="medalla-grande ${med}" role="img" aria-label="${esc(t('medalla_' + med))}"></div>`,
    html: `<div class="stats"><div class="stat"><b>${pctTxt}%</b><span>${esc(t('aPrimeraHora'))}</span></div>
      <div class="stat"><b>${plata(e.ingreso)}</b><span>${esc(vs)}</span></div></div>`,
    botones: [{ txt: t('seguir'), principal: true, accion: alCerrar }], alCerrar });
  return { ventana: true };
}

// ───────── parte de la mañana (al volver de una ausencia de 30 min o más) ─────────
export function tiempoTexto(minutos) {
  const dias = minutos / 1440;
  if (dias >= 1.5) return t('tiempoDias', { n: numero(dias, dias < 10 ? 1 : 0) });
  if (dias >= 1) return t('tiempoUnDia');
  return t('tiempoHoras', { n: numero(Math.round(minutos / 60)) });
}
// video: { txt, accion } solo en el lanzamiento completo (con la bandera legal); el foco inicial va siempre a «Cobrar».
export function parteManana(s, r, alCerrar, video = null) {
  const p = r.parte ?? { entregas: 0, aTiempo: 0, perdidas: 0, mejorRuta: null, misiones: [], noches: [] };
  const mr = p.mejorRuta && s.rutas.find((x) => x.id === p.mejorRuta.id);
  const extra = (p.noches ?? []).reduce((a, x) => a + (x.extraJugando ?? 0), 0);
  const prox = M.misionActual(s);
  const textoM = (id) => { const m = MISIONES.find((x) => x.id === id); return m ? t(m.id, { meta: m.tipo === 'mejorDia' ? plata(m.meta) : numero(m.meta), n: numero(m.n ?? 0) }) : id; };
  const html = `<p class="ambar" style="font-size:20px;font-weight:750;margin:2px 0 8px">${esc(r.neto >= 0 ? t('parteGano', { monto: plataSigno(r.neto) }) : t('partePerdio', { monto: plata(-r.neto) }))}</p>
    <div class="stats"><div class="stat"><b>${numero(p.entregas)}</b><span>${esc(t('parteEntregas'))}</span></div>
      <div class="stat"><b>${p.entregas ? numero(p.aTiempo / Math.max(1, p.entregas) * 100) : 0}%</b><span>${esc(t('parteATiempo'))}</span></div>
      <div class="stat"><b>${numero(p.perdidas)}</b><span>${esc(t('partePerdidas'))}</span></div></div>
    ${mr ? `<p>${esc(t('parteMejor', { ruta: `${M.AP[mr.a].nombre} ⇄ ${M.AP[mr.b].nombre}`, monto: plataSigno(p.mejorRuta.neto) }))}</p>` : ''}
    ${p.misiones?.length ? `<p class="verde">${esc(t('parteMisiones', { lista: p.misiones.map(textoM).join(' · ') }))}</p>` : ''}
    ${p.noches?.length ? `<p class="nota">${esc(t('parteRondas', { n: p.noches.length, monto: plata(extra) }))}</p>` : ''}
    ${prox ? `<p class="nota">${esc(t('proximaMeta', { mision: textoM(prox.id) }))}</p>` : ''}`;
  ventana({ titulo: t('parteTitulo'), sub: t('pasaron', { tiempo: tiempoTexto(r.minutos) }), html,
    botones: [{ txt: t('cobrar'), principal: true, accion: alCerrar }, ...(video ? [{ txt: video.txt, accion: async () => { await video.accion(); alCerrar?.(); } }] : [])],
    foco: 0, alCerrar, prioridad: true });
}
