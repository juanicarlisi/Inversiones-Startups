// Arranque, bucle, eventos del modelo, acciones del jugador, guardado con respaldo, vuelta y capa de portal.
import { focoDeTeclado } from './compat.js';
import * as M from './modelo.js';
import { CAPITULOS, MISIONES } from './datos.js';
import * as R from './render.js';
import * as U from './ui.js';
import * as O from './objetivos.js';
import * as RJ from './ronda-juego.js';
import * as E from './entrada.js';
import { t, plata, plataSigno, numero, cambiarLengua, lengua, fijarDispositivo, fijarLocalePortal } from './i18n.js';
import { crearPortal, detectarSdk } from './portal.js';
import { sonar, alternarSonido, sonidoActivo, silenciar } from './sonido.js';
import { icono, logoSvg } from './iconos.js';

const CLAVE = 'hubnocturno.partida.v1', RESPALDO = 'hubnocturno.partida.respaldo';
// Lanzamiento: «basico» (el candidato de diciembre: sin anuncios) o «completo» (v1.1: carga js/anuncios.js). Lo fija cada HTML.
const LANZAMIENTO = document.querySelector('meta[name="hn-lanzamiento"]')?.content === 'completo' ? 'completo' : 'basico';
let anuncios = null;
// Dónde se guarda: localStorage (siempre con try/catch); en el lanzamiento completo, el módulo de datos del portal con respaldo local.
let almacen = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  remove(k) { try { localStorage.removeItem(k); } catch { /* nada */ } },
};
const q = new URLSearchParams(location.search);
const DEPURAR = q.get('debug') === '1';
const $ = (x) => document.querySelector(x);
const lienzo = $('#mapa'), ctx = lienzo.getContext('2d');
const app = $('#app');

let s = null, vel = 1, velAntes = 1, acc = 0, ultimo = performance.now(), ocultoDesde = null;
let portal = crearPortal();
const vis = { sel: null, modo: null, origen: null, destino: null, puntero: null, flotan: [], frac: 0, dpr: 1, ultimoFlota: {},
  escena: 'carga', marca: null, detalle: null, orden: null, primeraClasif: false };

// ───────────── carga ─────────────
function avance(p) {
  const b = $('#carga-avance');
  if (b) b.style.width = `${p}%`;
  $('#carga')?.setAttribute('aria-valuenow', String(p));
}

// ───────────── guardado con respaldo ─────────────
// El guardado principal se escribe cada 15 s (y 2 s después de una acción). El respaldo solo recibe un guardado verificado (que
// se puede restaurar entero), como mucho una vez por minuto: si un error deja la partida rara, el respaldo es de antes. Al
// arrancar, si el principal no se puede leer, se usa el respaldo. Si localStorage no se puede escribir, un aviso discreto lo dice.
let puedeGuardar = true, noGuardar = false, ultimoKB = 0, ultimoRespaldo = 0, pendienteGuardar = false;
function probarAlmacenamiento() {
  try { const k = 'hubnocturno.prueba'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch { return false; }
}
function leerGuardado(clave) {
  try {
    const x = almacen.get(clave);
    if (!x) return null;
    const r = M.restaurar(x);
    if (r?.error) { if (r.error === 'version') noGuardar = true; return null; }
    return r;
  } catch { return null; }
}
function guardar() {
  pendienteGuardar = false;
  if (!s || noGuardar || !puedeGuardar) return false;
  try {
    const txt = M.guardar(s);
    if (!almacen.set(CLAVE, txt)) return false;
    // el respaldo solo recibe un guardado verificado (se restaura entero): como mucho una vez por minuto, porque verificar una
    // red grande cuesta unos 30 ms (en un Chromebook, unos 120)
    const ahora = performance.now();
    if ((ahora - ultimoRespaldo > 60000 || !almacen.get(RESPALDO)) && !M.restaurar(txt)?.error) { almacen.set(RESPALDO, txt); ultimoRespaldo = ahora; }
    ultimoKB = txt.length / 1024;
    return true;
  } catch { return false; }
}
// Premio de «La ronda del día» (se juega en ronda.html?dia y deja el premio pendiente acá).
function cobrarRondaDelDia() {
  try {
    const k = 'hubnocturno.rondaDia', o = JSON.parse(localStorage.getItem(k) ?? 'null');
    if (!o?.premioPendiente || !s) return;
    const r = M.premioRondaDelDia(s, o.premioPendiente);
    localStorage.setItem(k, JSON.stringify({ ...o, premioPendiente: 0 }));
    if (r.ok) U.aviso(`+${plata(r.monto)}`, 'bueno');
  } catch { /* sin almacenamiento */ }
}

// ───────────── orientación, dispositivo y cámara ─────────────
function orientacion() {
  const h = innerWidth >= innerHeight;
  app.classList.toggle('horizontal', h); app.classList.toggle('vertical', !h);
}
const POS = (id) => R.POS[id];
function puntosRed() { return M.nodosRed(s).map(POS); }
function puntosMision() {
  const m = M.misionActual(s);
  return O.puntosObjetivo(s, m);
}
function vistaCapitulo() {
  const v = CAPITULOS[s.cap - 1].vista;
  return [R.proyectar(v.lon0, v.lat0), R.proyectar(v.lon1, v.lat1)];
}
// Cámara inicial: cerca de Buenos Aires y del destino de la misión 1. La ruta mide al menos 180 px en escritorio y 120 px en celular.
function camaraInicial() {
  const m = MISIONES[0], [ax, ay] = POS(m.a), [bx, by] = POS(m.b);
  const a = E.areaUtil(), { W, H } = E.medidas();
  const largo = Math.max(W >= 1000 ? 190 : 125, 0.34 * Math.min(a.w, a.h));
  const z = largo / Math.hypot(bx - ax, by - ay);
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  E.fijarCamara({ x: mx - (a.cx - W / 2) / z, y: my - (a.cy - H / 2) / z, z });
}
// La cámara se aleja sola a medida que crece la red (si el jugador no la movió hace poco).
function seguirRed(forzar = false) {
  const pts = [...puntosRed(), ...puntosMision()].filter(Boolean);
  if (!pts.length) return;
  if (!forzar && (E.seVen(pts) || E.movidaHace() < 4000)) return;
  E.encuadrar(pts, { soloAlejar: !forzar, ms: 700 });
}
function centrarTodo() {
  const pts = [...puntosRed(), ...puntosMision()].filter(Boolean);
  E.encuadrar(pts.length >= 2 ? pts : vistaCapitulo(), { ms: 450 });
}
function puntoSeleccion() {
  const x = vis.sel;
  if (!x) return null;
  if (x.tipo === 'ap') return POS(x.id);
  if (x.tipo === 'ruta') { const r = s.rutas.find((y) => y.id === x.id); if (r) { const [a, b] = [POS(r.a), POS(r.b)]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; } }
  if (x.tipo === 'avion') { const av = s.aviones.find((y) => y.id === x.id); if (av) return POS(av.en); }
  return null;
}

// ───────────── eventos del modelo ─────────────
let ultimoSonidoCobro = 0;
function flotar(ap, txt, tono, ahora) {
  if (s.aviones.length > 40) return; // con flotas grandes los textos flotantes serían ruido
  const k = `${ap}|${tono}`;
  if (ahora - (vis.ultimoFlota[k] ?? 0) < 700) return;
  vis.ultimoFlota[k] = ahora;
  vis.flotan.push({ ap, txt, t0: ahora, tono, dy: tono === 'malo' ? 14 : 0 });
}
function atender(eventos) {
  if (!eventos?.length) return;
  const ahora = performance.now();
  let misiones = [], premioMisiones = 0;
  const ciudades = [];
  for (const e of eventos) {
    switch (e.tipo) {
      case 'despegue': {
        const av = s.aviones.find((a) => a.id === e.avion);
        if (av && e.costo > 0) flotar(av.en, `−${plata(e.costo).replace('$ ', '$')} ${t('combustible')}`, 'malo', ahora);
        break;
      }
      case 'aterrizaje':
        if (e.ingreso > 0 || e.netoViaje !== 0) flotar(e.ap, `${e.netoViaje >= 0 ? '+' : '−'}${plata(Math.abs(e.netoViaje)).replace('$ ', '$')} ${t('netoTxt')}`, e.netoViaje >= 0 ? 'bueno' : 'malo', ahora + 1);
        if (e.ingreso > 0 && ahora - ultimoSonidoCobro > 90) { sonar('cobro'); ultimoSonidoCobro = ahora; }
        break;
      case 'mision': misiones.push(e); premioMisiones += e.premio ?? 0; break;
      case 'avionNuevo': U.tarjetaHangar(e.avion); break;
      case 'ciudadesNuevas': ciudades.push(...e.ciudades); break;
      case 'capitulo': setTimeout(finCapitulo, misiones.length ? 1800 : 50); break;
      case 'contrato': sonar('mision'); U.aviso('', 'bueno', { grupo: 'contrato', monto: e.premio ?? 0, ico: 'contrato' }); U.contarCaja(s.dinero - (e.premio ?? 0), s.dinero); break;
      case 'contratoVencido': U.aviso(t('contratoVencido'), 'malo', { ico: 'contrato' }); break;
      case 'tormenta': sonar('tormenta'); U.aviso(t('tormentaAviso', { lista: e.zona.map((z) => M.AP[z].nombre).join(', ') }), 'malo'); break;
      case 'tormentaFin': U.aviso(t('tormentaFin')); break;
      case 'pronostico': U.aviso(t('pronostico', { lista: (e.zona ?? []).map((z) => M.AP[z].nombre).join(', ') }), 'malo'); break;
      case 'avisoNoche': U.aviso(t('avisoNoche'), 'noche'); break;
      case 'primeraNoche': U.aviso(t('primeraNoche', { n: e.aviones?.length ?? 0 }), 'noche', { dura: 5000 }); break;
      case 'ventaForzada': U.aviso(t('ventaForzada', { monto: plata(e.monto ?? 0) }), 'malo'); break;
      case 'bancoListo': U.aviso(t('bancoListo'), 'noche', { dura: 5000 }); break;
      case 'primerasBalizas': U.aviso(t('primerasBalizas'), 'noche'); break;
      case 'primerDespegueNoche': U.aviso(t('primerDespegueNoche'), 'noche'); break;
      case 'clasificacion': U.aviso(t('clasifAviso'), 'bueno', { ico: 'hub', dura: 5000 }); break;
      case 'clasificacionHecha': sonar('mision'); U.aviso(t('clasifHechaAviso', { pct: `${numero(e.pct * 100)}%`, monto: plata(e.ingreso) }), 'bueno', { ico: 'hub' }); U.contarCaja(s.dinero - (e.ingreso ?? 0), s.dinero); break;
      case 'rondaDisponible': U.aviso(t('rondaDisponible'), 'noche', { dura: 5000 }); break;
      case 'resultadoNoche': { const r = RJ.resultado(s, e, refrescarFuerte); if (r.aviso) U.aviso(r.aviso, 'noche', { ico: 'medalla' }); break; }
      default: break;
    }
  }
  // lo que llega junto se avisa junto: un aviso por las misiones (agrupadas) y uno por las ciudades nuevas
  if (misiones.length) {
    sonar('mision');
    const ultima = MISIONES.find((m) => m.id === misiones[misiones.length - 1].id);
    O.celebrar(ultima, premioMisiones);
    U.aviso('', 'bueno', { grupo: 'mision', monto: premioMisiones, n: misiones.length, ico: 'estrella' });
    vis.vuelo = { premio: premioMisiones, dinero: s.dinero };
    setTimeout(() => seguirRed(), 1900);
  }
  if (ciudades.length) setTimeout(() => U.aviso(t('ciudadesNuevas', { lista: [...new Set(ciudades)].map((c) => M.AP[c].nombre).join(', ') }), '', { ico: 'ruta', dura: 4500 }), misiones.length ? 1800 : 0);
}

// ───────────── fin de capítulo ─────────────
function finCapitulo() {
  guardar();
  const r = M.resumenCapitulo(s);
  const ultimo = s.cap >= CAPITULOS.length;
  const st = (n, k) => `<div class="stat"><b>${n}</b><span>${U.esc(t(k))}</span></div>`;
  const stats = [st(numero(r.entregas.correo), 'statSacas')];
  if (r.entregas.pasajeros) stats.push(st(numero(r.entregas.pasajeros), 'statPax'));
  if (r.entregas.carga) stats.push(st(numero(r.entregas.carga), 'statTon'));
  stats.push(st(numero(r.km), 'statKm'), st(r.aTiempo == null ? '—' : `${numero(r.aTiempo * 100)}%`, 'statATiempo'));
  const mr = r.mejorRuta;
  const sig = ultimo ? null : MISIONES.find((m) => m.cap === s.cap + 1);
  const sigue = ultimo ? t('sigueFin') : `${t('sigueCap' + (s.cap + 1))} ${t('primeraMision', { mision: t(sig.id, { meta: sig.tipo === 'mejorDia' ? plata(sig.meta) : numero(sig.meta), n: numero(sig.n ?? 0) }) })}`;
  const html = `<div class="stats">${stats.join('')}</div>
    ${mr && mr.neto > 0 ? `<p>${U.esc(t('statMejor', { ruta: `${M.AP[mr.a].nombre} ⇄ ${M.AP[mr.b].nombre}`, monto: plataSigno(mr.neto) }))}</p>` : ''}
    <p class="nota">${U.esc(t('datoCap' + s.cap))}<small>${U.esc(t('datoTit'))}</small></p>
    <p><b class="ambar">${U.esc(t('loQueSigue'))}:</b> ${U.esc(sigue)}</p>`;
  anuncios?.happytime();
  U.ventana({ titulo: ultimo ? t('finTitulo') : t('resumenTitulo', { n: s.cap }), html, clase: 'resumen',
    botones: ultimo ? [{ txt: t('seguirJugando'), principal: true }] : [{ txt: t('siguienteCapitulo', { n: s.cap + 1 }), principal: true, accion: seguirCapitulo }, { txt: t('seguir'), clase: 'suave' }] });
}
// En el lanzamiento completo, el único corte publicitario va acá: al cerrar el capítulo y antes de seguir.
async function seguirCapitulo() {
  if (anuncios) await anuncios.corteCapitulo();
  irAlSiguiente();
}
function irAlSiguiente() {
  if (!M.avanzarCapitulo(s).ok) return;
  atender(M.tomarEventos(s));
  vis.sel = null; vis.modo = null;
  E.encuadrar(vistaCapitulo(), { ms: 600 });
  guardar();
  U.ventana({ titulo: t(`cap${s.cap}Titulo`), texto: t(`cap${s.cap}Texto`), botones: [{ txt: t('seguir'), principal: true }] });
}

// ───────────── vuelta (pestaña oculta o juego cerrado) ─────────────
async function volver(segundos) {
  if (!s || segundos < 60) return false;
  const r = M.simularAusencia(s, segundos);
  if (!r.minutos) return false;
  const cap = r.eventos.some((e) => e.tipo === 'capitulo');
  // video con premio: solo en el lanzamiento completo, con la bandera legal encendida y si el portal puede mostrarlo
  const video = anuncios && r.extra > 0 && await anuncios.puedeOfrecerVideo(segundos) ? {
    txt: `${t('duplicar')} (+${plata(r.extra)})`, accion: async () => {
      if (await anuncios.videoConPremio()) { s.dinero += r.extra; U.aviso(`+${plata(r.extra)}`, 'bueno'); guardar(); }
    } } : null;
  if (segundos >= 1800) RJ.parteManana(s, r, refrescarFuerte, video);
  else U.aviso(`${t('ausenteTitulo')}: ${plataSigno(r.neto)}`, r.neto >= 0 ? 'bueno' : 'malo', { dura: 5000 });
  if (cap) setTimeout(finCapitulo, 60);
  guardar();
  return true;
}

// ───────────── bucle que no muere ─────────────
// cuadro() siempre agenda el próximo cuadro. Con 3 errores seguidos ofrece restaurar el respaldo o empezar de nuevo.
let errores = 0, recuperando = false, romper = 0, ultimoError = null;
let ultimaUI = 0, ultimoPanel = 0, ultimoGuardado = performance.now(), ultimaSug = 0, sug = null;
let fps = 0, cuadros = 0, segFps = performance.now(), msPaso = 0;
function cuadro(ahora) {
  try {
    if (romper > 0) { romper--; throw new Error('prueba: cuadro roto a propósito'); }
    pasoCuadro(ahora);
    errores = 0;
  } catch (e) {
    errores++; ultimoError = e;
    console.warn('Hub Nocturno: error en un cuadro', e);
    if (errores >= 3 && !recuperando) abrirRecuperacion();
  }
  requestAnimationFrame(cuadro);
}
function abrirRecuperacion() {
  recuperando = true;
  const hay = !!(leerGuardadoTexto(RESPALDO) || leerGuardadoTexto(CLAVE));
  U.ventana({ titulo: t('errorTitulo'), texto: t('errorTexto'), cerrable: false, prioridad: true,
    botones: [...(hay ? [{ txt: t('restaurarRespaldo'), principal: true, accion: () => recuperar(true) }] : []), { txt: t('reiniciar'), principal: !hay, accion: () => recuperar(false) }] });
}
function leerGuardadoTexto(k) { return almacen.get(k); }
function recuperar(conRespaldo) {
  const r = conRespaldo ? leerGuardado(RESPALDO) ?? leerGuardado(CLAVE) : null;
  s = r ?? M.nuevoEstado(Date.now() % 1e9);
  M.tomarEventos(s);
  vis.sel = null; vis.modo = null; vis.flotan = []; vis.marca = null;
  errores = 0; recuperando = false; acc = 0;
  if (!r) { vis.escena = 'titulo'; portada(); } else { vis.escena = 'juego'; centrarTodo(); }
  guardar(); refrescarFuerte();
}

function pasoCuadro(ahora) {
  const dt = Math.min(0.25, (ahora - ultimo) / 1000); ultimo = ahora;
  const lenta = RJ.lenta(s);
  const corre = !U.ventanaAbierta() && $('#menu').hidden && vis.escena === 'juego' && !recuperando && !anuncios?.enAnuncio;
  if (corre && vel > 0) {
    acc += dt * (lenta ? RJ.MIN_JUEGO_POR_SEG : M.MIN_POR_SEG * vel);
    let pasos = 0;
    const t0 = performance.now();
    while (acc >= M.PASO && pasos < 40) { atender(M.paso(s)); acc -= M.PASO; pasos++; }
    if (pasos) msPaso = msPaso * 0.9 + 0.1 * (performance.now() - t0) / pasos;
    if (acc > M.PASO * 40) acc = 0; // no se acumula deuda si la pestaña tardó
  }
  vis.frac = acc;
  E.animar(ahora);
  const { W, H, dpr } = E.medidas();
  vis.dpr = dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  R.dibujar(ctx, W, H, s, E.camara(), vis, ahora);
  if (ahora - ultimaUI > 250) { refrescarRapido(ahora, lenta); ultimaUI = ahora; }
  if (ahora - ultimoPanel > 1000) { refrescarPanel(false); ultimoPanel = ahora; }
  if (ahora - ultimoGuardado > 15000 || (pendienteGuardar && ahora - ultimoGuardado > 2000)) { guardar(); ultimoGuardado = ahora; }
  portal.situacion({ jugable: corre && vel > 0 });
  cuadros++;
  if (ahora - segFps >= 1000) { fps = cuadros * 1000 / (ahora - segFps); cuadros = 0; segFps = ahora; if (DEPURAR) pintarDepuracion(); }
}

// ───────────── refresco de la interfaz ─────────────
function refrescarRapido(ahora, lenta = RJ.lenta(s)) {
  if (vis.acelerar && (vel !== 3 || (vis.acelerar.meta != null ? s.dinero >= vis.acelerar.meta : s.t >= vis.acelerar.hasta))) { if (vel === 3) fijarVel(1); vis.acelerar = null; }
  U.barra(s, vel, { lenta });
  const obj = O.armarObjetivos(s);
  U.pintar($('#objetivos'), obj.html, obj.campos);
  if (vis.vuelo) { O.volarPremio($('#objetivos .obj'), vis.vuelo.premio, vis.vuelo.dinero); vis.vuelo = null; }
  // primera clasificación del hub: el momento en que el jugador ve que el correo cambia de avión
  if (!vis.primeraClasif && (s.stats.transbordos[M.HUB] ?? 0) > 0) {
    vis.primeraClasif = true;
    if (!M.misionHecha(s, 'm1_transbordo')) U.aviso(t('primeraClasificacion'), 'bueno', { ico: 'hub', dura: 5000 });
  }
  const guia = vis.escena === 'juego' ? O.pasoGuia(s, vis) : null;
  // la mejor próxima acción cuesta unos 8 ms con 300 aviones: cada 1 s con redes chicas, cada 2,5 s con las grandes
  if (ahora - ultimaSug > (s.aviones.length > 100 ? 2500 : 1000)) { sug = guia ? null : M.sugerencia(s) ?? O.respaldoSugerencia(s); ultimaSug = ahora; }
  const ch = O.armarChips(s, vis, { guia, sug, ronda: RJ.chipRonda(s) });
  U.pintar($('#chips'), ch.html, ch.campos);
  // marcas: la guía manda; si no, el botón que señaló la mejor próxima acción
  if (guia?.marca) { const el = O.marcar(guia.marca); if (el) O.manoSobre(el, guia.texto); else O.manoEn(null); }
  else if (guia?.punto) { O.marcar(null); O.manoEn(guia.punto, guia.texto); }
  else { O.manoEn(null); O.marcar(vis.marca && vis.marca.hasta > ahora ? vis.marca.k : null); }
  if (RJ.rondaAbierta()) RJ.pintarRonda(s);
  panelVisible();
}
function refrescarPanel(forzar) {
  const p = U.armarPanel(s, vis);
  U.pintar($('#panel-cuerpo'), p.html, p.campos, forzar);
}
function refrescarFuerte() { refrescarPanel(true); refrescarRapido(performance.now()); ultimoPanel = performance.now(); }
U.alDesbloquear(() => { if (s) setTimeout(() => refrescarPanel(false), 0); });
let panelAntes = false;
function panelVisible() {
  const abierto = !!(vis.sel || vis.modo) && vis.escena === 'juego';
  if (abierto !== panelAntes) {
    app.classList.toggle('con-panel', abierto);
    if (!abierto) app.classList.remove('hoja-completa');
    panelAntes = abierto;
  }
}
// En vertical, la hoja de abajo recentra la cámara en la selección si quedó tapada.
function mostrarSeleccion() {
  panelVisible();
  const p = puntoSeleccion();
  if (p && !E.seVen([p], 30)) E.centrarEn(p, 300);
}

// ───────────── acciones ─────────────
function error(res) {
  sonar('error');
  U.aviso(t('e_' + (res.error ?? 'invalida'), { precio: plata(res.costo ?? 0), km: numero(res.km ?? 0) }), 'malo');
}
const rutaSel = () => (vis.sel?.tipo === 'ruta' ? vis.sel.id : vis.sel?.tipo === 'avion' ? s.aviones.find((a) => a.id === vis.sel.id)?.ruta : null);
function fijarVel(v) {
  if (v > 0) velAntes = v;
  vel = v;
  U.barra(s, vel);
}
function abrirRutaDesde(a, b) {
  const res = M.abrirRuta(s, a, b);
  if (!res.ok) { error(res); return false; }
  sonar('compra');
  U.aviso(t('rutaAbierta', { a: M.AP[res.ruta.a].nombre, b: M.AP[res.ruta.b].nombre }), 'bueno', { ico: 'ruta' });
  vis.modo = null; vis.origen = vis.destino = null;
  vis.sel = { tipo: 'ruta', id: res.ruta.id };
  setTimeout(() => seguirRed(), 50);
  return true;
}
function confirmar(titulo, texto, si, accion) {
  U.ventana({ titulo, texto, fila: true, botones: [{ txt: t('cancelar') }, { txt: si, principal: true, clase: 'peligro', accion }] });
}
function vender(id) {
  const av = s.aviones.find((a) => a.id === id);
  if (!av) return;
  const hecho = () => {
    const res = M.venderAvion(s, id);
    if (res.ok) { sonar('compra'); U.aviso(t('avionVendido', { monto: plata(res.monto) })); if (vis.sel?.tipo === 'avion' && vis.sel.id === id) vis.sel = { tipo: 'ruta', id: av.ruta }; }
    atender(M.tomarEventos(s)); refrescarFuerte(); pendienteGuardar = true;
  };
  const ultimoDeRuta = s.aviones.filter((a) => a.ruta === av.ruta).length === 1;
  if (ultimoDeRuta) confirmar(t('venderUltimoTitulo'), t('venderUltimoTexto'), t('vender'), hecho); else hecho();
}

const ACCIONES = {
  vel: (b) => fijarVel(Number(b.dataset.v)),
  pausar: () => fijarVel(vel === 0 ? velAntes || 1 : 0),
  acelerar: () => fijarVel(vel === 0 ? 1 : vel === 1 ? 3 : vel === 3 ? 6 : 1),
  menu: (b) => alternarMenu(b),
  zoom: (b) => E.zoomBoton(Number(b.dataset.v), puntoSeleccion()),
  centrar: () => centrarTodo(),
  verRutas: () => { vis.sel = { tipo: 'rutas' }; vis.modo = null; },
  cerrarPanel: () => { vis.sel = null; vis.modo = null; vis.marca = null; },
  hoja: () => { if (!arrastroHoja) app.classList.toggle('hoja-completa'); arrastroHoja = false; requestAnimationFrame(() => E.medir()); },
  verRuta: (b) => { vis.sel = { tipo: 'ruta', id: b.dataset.id }; mostrarSeleccion(); },
  verAvion: (b) => { vis.sel = { tipo: 'avion', id: Number(b.dataset.id) }; },
  verCiudad: (b) => { vis.sel = { tipo: 'ap', id: b.dataset.id, desde: b.dataset.v }; mostrarSeleccion(); },
  conectar: (b) => abrirRutaDesde(b.dataset.v, b.dataset.id),
  nuevaRuta: (b) => { vis.modo = 'nuevaRuta'; vis.origen = b.dataset.id; vis.destino = null; },
  cancelar: () => { vis.modo = null; vis.origen = vis.destino = null; },
  abrirRuta: () => abrirRutaDesde(vis.origen, vis.destino),
  comprar: (b) => {
    const ruta = rutaSel();
    const res = M.comprarAvion(s, b.dataset.id, ruta);
    if (!res.ok) return error(res);
    sonar('compra'); U.aviso(t('avionComprado', { avion: M.AV[b.dataset.id].nombre }), 'bueno', { ico: 'avion' });
  },
  vender: (b) => vender(Number(b.dataset.id)),
  balizas: (b) => { const res = M.ponerBalizas(s, b.dataset.id ?? rutaSel()); if (!res.ok) return error(res); sonar('compra'); },
  cargaMin: (b) => { M.fijarCargaMinima(s, b.dataset.id ?? rutaSel(), Number(b.dataset.v)); },
  transbordo: (b) => { const res = M.mejorarTransbordo(s, b.dataset.id); if (!res.ok) return error(res); sonar('compra'); },
  cerrarRuta: (b) => {
    const id = b.dataset.id, n = s.aviones.filter((a) => a.ruta === id).length;
    confirmar(t('cerrarRutaTitulo'), t('cerrarRutaTexto', { n }), t('cerrarRuta').split(' (')[0], () => { M.cerrarRuta(s, id); vis.sel = null; refrescarFuerte(); pendienteGuardar = true; });
  },
  detalle: (b) => { vis.detalle = vis.detalle === b.dataset.v ? null : b.dataset.v; },
  ordenar: (b) => { vis.orden = b.dataset.v; },
  irObjetivo: (b) => { const m = MISIONES.find((x) => x.id === b.dataset.id); const pts = O.puntosObjetivo(s, m).filter(Boolean); if (pts.length) E.encuadrar(pts.length === 1 ? [pts[0], ...puntosRed().slice(0, 1)] : pts, { ms: 450, zMax: 70 }); },
  irContrato: (b) => {
    const id = Number(b.dataset.id), c = [...s.contratos.activos, ...s.contratos.tablero].find((x) => x.id === id);
    if (c) E.encuadrar([POS(c.o), POS(c.d)], { ms: 450, zMax: 70 });
  },
  aceptarContrato: (b) => { const res = M.aceptarContrato(s, Number(b.dataset.id)); if (!res.ok) return error(res); sonar('compra'); },
  clasificar: (b) => { const res = M.elegirClasificacion(s, b.dataset.id || null); if (!res.ok) return error(res); sonar('compra'); },
  siguienteCapitulo: () => finCapitulo(),
  sugerencia: () => {
    const d = sug ?? M.sugerencia(s);
    if (!d) return;
    // «×3 hasta juntar $X» (HN-32; la interfaz de HN-33 lo puede mejorar): acelera y vuelve a ×1 al llegar a la meta o a la hora
    if (d.tipo === 'acelerar') { fijarVel(3); vis.acelerar = { meta: d.meta ?? null, hasta: d.hasta ?? null }; return; }
    const dest = O.destinoSugerencia(s, d);
    if (!dest) { const pts = puntosMision(); if (pts.length) E.encuadrar(pts.filter(Boolean), { ms: 450, soloAlejar: true }); return; }
    if (dest.sel) { vis.sel = dest.sel; vis.modo = null; }
    vis.marca = { k: dest.marca, hasta: performance.now() + 15000 };
    refrescarFuerte(); mostrarSeleccion();
  },
  saltearGuia: () => { O.terminarGuia(); },
  abrirRonda: () => { if (vel === 0) fijarVel(velAntes || 1); if (RJ.abrir(s)) portal.situacion({ jugable: true }); }, // la noche corre (lenta) mientras se juega
  empezar: () => empezar(),
  cambiarLengua: () => { cambiarLengua(); document.documentElement.lang = lengua(); U.textosFijos(); U.cerrarVentana(); portada(); },
  // menú
  mIdioma: () => { cambiarLengua(); document.documentElement.lang = lengua(); U.textosFijos(); },
  mSonido: () => alternarSonido(),
  mRondaDia: () => { guardar(); location.href = 'ronda.html?dia'; },
  mGuia: () => { O.reiniciarGuia(); },
  mCreditos: () => U.ventana({ titulo: t('creditos'), texto: t('creditosTexto'), botones: [{ txt: t('cerrar'), principal: true }] }),
  mReiniciar: () => confirmar(t('reiniciar'), t('confirmarReinicio'), t('reiniciar'), () => {
    almacen.remove(CLAVE); almacen.remove(RESPALDO);
    s = M.nuevoEstado(Date.now() % 1e9); M.tomarEventos(s); vis.sel = null; vis.modo = null; O.reiniciarGuia(); portada();
  }),
};
const RONDA_ACCIONES = new Set(['rondaSubir', 'rondaBajar', 'rondaAntes', 'rondaDespues', 'rondaSugerido', 'rondaTutSig', 'rondaTutSaltear', 'rondaCerrar']);
U.escucharAcciones((nombre, b) => {
  if (!s) return;
  if (nombre.startsWith('m') && nombre.length > 1 && nombre[1] === nombre[1].toUpperCase() && ACCIONES[nombre]) cerrarMenu();
  if (RONDA_ACCIONES.has(nombre)) {
    if (RJ.accion(s, nombre, b.dataset.id)) pendienteGuardar = true;
    if (RJ.rondaAbierta()) RJ.pintarRonda(s, true);
    return;
  }
  const f = ACCIONES[nombre];
  if (!f) return;
  const marca = vis.marca;
  f(b);
  if (marca && vis.marca === marca && nombre !== 'sugerencia') vis.marca = null; // la marca se va con la acción
  atender(M.tomarEventos(s));
  refrescarFuerte();
  pendienteGuardar = true;
});

// ───────────── menú ─────────────
function alternarMenu(b) {
  const m = $('#menu');
  if (!m.hidden) { cerrarMenu(); return; }
  const items = [['mIdioma', 'idioma', t('idioma')], ['mSonido', sonidoActivo() ? 'sonido' : 'mudo', sonidoActivo() ? t('sonidoSi') : t('sonidoNo')],
    ['mRondaDia', 'luna', t('rondaDia')], ['mGuia', 'ayuda', t('guiaOtraVez')], ['mCreditos', 'info', t('creditos')], ['mReiniciar', 'reiniciar', t('reiniciar')]];
  m.innerHTML = items.map(([a, ic, txt]) => `<button role="menuitem" data-accion="${a}" data-k="${a}">${icono(ic)}<span>${U.esc(txt)}</span></button>`).join('');
  m.hidden = false; b?.setAttribute('aria-expanded', 'true');
  m.querySelector('button')?.focus({ preventScroll: true });
}
function cerrarMenu() { const m = $('#menu'); m.hidden = true; m.innerHTML = ''; $('#b-menu').setAttribute('aria-expanded', 'false'); }
document.addEventListener('pointerdown', (ev) => { if (!$('#menu').hidden && !ev.target.closest('#menu') && !ev.target.closest('#b-menu')) cerrarMenu(); }, true);

// ───────────── hoja de abajo (vertical): tocar el asa la agranda o la achica; arrastrarla también ─────────────
let arrastroHoja = false;
(function asa() {
  const el = $('#b-hoja');
  let ini = null;
  el.addEventListener('pointerdown', (ev) => { ini = { y: ev.clientY, h: $('#panel').getBoundingClientRect().height }; arrastroHoja = false; });
  window.addEventListener('pointermove', (ev) => {
    if (!ini) return;
    const dy = ev.clientY - ini.y;
    if (Math.abs(dy) > 8) arrastroHoja = true;
    if (arrastroHoja) app.style.setProperty('--hoja', `${Math.max(15, Math.min(90, (ini.h - dy) / innerHeight * 100))}%`);
  });
  window.addEventListener('pointerup', (ev) => {
    if (!ini) return;
    const dy = ev.clientY - ini.y, h = (ini.h - dy) / innerHeight;
    ini = null;
    if (!arrastroHoja) return;
    app.style.removeProperty('--hoja');
    if (h < 0.25) { vis.sel = null; vis.modo = null; } else app.classList.toggle('hoja-completa', h > 0.6);
    requestAnimationFrame(() => { E.medir(); refrescarFuerte(); });
  });
})();

// ───────────── tocar el mapa ─────────────
function elegir(h) {
  if (vis.modo === 'nuevaRuta') {
    if (h?.tipo === 'ap' && h.id !== vis.origen) { vis.destino = h.id; vis.previaOk = M.puedeAbrirRuta(s, vis.origen, h.id).ok; }
  } else vis.sel = h ?? null;
  if (vis.marca && (!h || vis.sel !== h)) vis.marca = null;
  refrescarFuerte();
  if (vis.sel) mostrarSeleccion();
}
function tocarMapa(x, y) {
  if (!s || vis.escena !== 'juego') return;
  const h = E.queHay(s, x, y, (id) => M.ciudadDisponible(s, id), vis.frac);
  if (h?.tipo === 'selector') { U.selector(h.ids, x, y, (id) => elegir({ tipo: 'ap', id })); return; }
  elegir(h);
}
function tecla(que, v) {
  if (que === 'escape') {
    if (U.ventanaAbierta()) { U.cerrarVentanaConTecla(); return; }
    if (!$('#menu').hidden) { cerrarMenu(); return; }
    if (U.selectorAbierto()) { U.cerrarSelector(); return; }
    if (RJ.rondaAbierta()) { RJ.cerrar(); return; }
    if (vis.modo) { vis.modo = null; vis.origen = vis.destino = null; } else vis.sel = null;
    refrescarFuerte(); return;
  }
  if (vis.escena !== 'juego') return;
  if (que === 'pausa') fijarVel(vel === 0 ? velAntes || 1 : 0);
  if (que === 'velocidad') fijarVel([0, 1, 3, 6][v]);
}

// ───────────── pestaña oculta = ausencia (al portal no se le avisa: lo maneja él) ─────────────
document.addEventListener('visibilitychange', () => {
  if (!s) return;
  if (document.hidden) { ocultoDesde = Date.now(); guardar(); }
  else if (ocultoDesde) { const seg = (Date.now() - ocultoDesde) / 1000; ocultoDesde = null; ultimo = performance.now(); if (vis.escena === 'juego') volver(seg); refrescarFuerte(); }
});
window.addEventListener('pagehide', () => guardar());
window.addEventListener('resize', () => { orientacion(); E.medir(); if (s) refrescarFuerte(); });

// ───────────── portada (un solo clic para jugar) ─────────────
function portada() {
  vis.escena = 'titulo';
  U.ventana({ clase: 'portada', cerrable: false, tituloHtml: U.esc(t('titulo')),
    arriba: `${logoSvg(88)}<button class="lengua" data-accion="cambiarLengua" data-k="cambiarLengua">${icono('idioma').replace('class="ico"', 'class="ico" style="display:inline;width:16px;height:16px;vertical-align:-3px;margin-right:4px"')}${U.esc(t('lenguaOtra'))}</button>`,
    sub: t('portadaSub'), texto: t('inicioTexto'), botones: [{ txt: t('empezar'), principal: true, accion: empezar }] });
}
function empezar() {
  vis.escena = 'juego'; vis.sel = null; vis.modo = null;
  camaraInicial();
  fijarVel(1);
  refrescarFuerte();
}

// ───────────── depuración (?debug=1) ─────────────
function pintarDepuracion() {
  const d = $('#depurar');
  d.hidden = false;
  const ev = portal.registro.slice(-6).map((x) => `${x.evento}${x.local ? '·' : ''}`).join(' ');
  d.textContent = `fps ${fps.toFixed(0)} · ${msPaso.toFixed(2)} ms/paso · aviones ${s?.aviones.length ?? 0}\nguardado ${ultimoKB.toFixed(1)} KB · portal ${portal.nombre} (${portal.estado})\nSDK: ${ev || '—'}${ultimoError ? `\nerror: ${String(ultimoError.message ?? ultimoError).slice(0, 80)}` : ''}`;
}

// ───────────── arranque ─────────────
(async function arrancar() {
  try {
    avance(25);
    orientacion();
    E.iniciar(lienzo, {
      tocar: tocarMapa, tecla,
      puntero: (p) => { if (vis.modo === 'nuevaRuta') vis.puntero = p; },
      cambioTactil: (si) => { document.documentElement.classList.toggle('tactil', si); fijarDispositivo(si ? 'tactil' : 'puntero'); if (s) refrescarFuerte(); },
    });
    const det = detectarSdk(window);
    portal = crearPortal(det);
    avance(45);
    await portal.iniciar();
    if (LANZAMIENTO === 'completo') {
      const A = await import('./anuncios.js');
      almacen = A.crearAlmacen(portal);
      almacen.migrar([CLAVE, RESPALDO]);
      anuncios = A.crearAnuncios({ portal, silenciar, almacen });
    }
    fijarLocalePortal(portal.locale());
    document.documentElement.lang = lengua();
    avance(70);
    M.fijarFechaDispositivo(Date.now());
    puedeGuardar = probarAlmacenamiento() || !!almacen.conModulo;
    U.textosFijos();
    $('#b-logo').innerHTML = logoSvg(32);
    const guardada = leerGuardado(CLAVE) ?? leerGuardado(RESPALDO);
    s = guardada ?? M.nuevoEstado(Date.now() % 1e9);
    M.tomarEventos(s);
    vis.primeraClasif = (s.stats.transbordos[M.HUB] ?? 0) > 0;
    avance(100);
    app.hidden = false;
    E.medir();
    $('#carga').classList.add('fuera');
    setTimeout(() => $('#carga')?.remove(), 400);
    portal.cargaTermino();
    if (guardada) {
      vis.escena = 'juego';
      if (M.nodosRed(s).length) centrarTodo(); else camaraInicial();
      E.animar(performance.now() + 1e4);
      if (guardada.guardado) volver((Date.now() - guardada.guardado) / 1000);
    } else { camaraInicial(); portada(); }
    if (!puedeGuardar) { const sg = $('#sin-guardar'); sg.textContent = t('sinGuardado'); sg.hidden = false; }
    cobrarRondaDelDia();
    refrescarFuerte();
    requestAnimationFrame(cuadro);
    // Para las pruebas de interfaz (Playwright): el estado, el modelo y algunos ganchos.
    window.__juego = {
      estado: () => s, M, vis, portal: () => portal, camara: () => E.camara(), area: () => E.areaUtil(), medidas: () => E.medidas(),
      cargar: (nuevo) => { s = nuevo; M.tomarEventos(s); vis.sel = null; vis.modo = null; vis.escena = 'juego'; U.cerrarVentana(); centrarTodo(); refrescarFuerte(); },
      romper: (n = 3) => { romper = n; }, velocidad: () => vel, sugerencia: () => sug, guardar, lanzamiento: LANZAMIENTO, anuncios: () => anuncios, volver,
      pantalla: (x, y) => R.aPantalla(E.camara(), E.medidas().W, E.medidas().H, R.POS[x] ? R.POS[x] : [x, y]),
      empezar, tocar: tocarMapa, enfocar: (el) => focoDeTeclado(el),
      seleccionar: (sel) => { vis.sel = sel; vis.modo = null; refrescarFuerte(); }, refrescar: () => refrescarFuerte(), fijarVel,
    };
  } catch (e) {
    console.error('Hub Nocturno: no pudo arrancar', e);
    const c = $('#carga');
    if (c) {
      c.innerHTML += `<p style="color:#eef1f6;font:14px system-ui;text-align:center;max-width:280px">${U.esc(t('errorTexto'))}</p><button style="font:600 15px system-ui;padding:12px 18px;border-radius:12px;border:0;background:#f2b84b;min-height:48px" id="carga-reiniciar">${U.esc(t('reiniciar'))}</button>`;
      $('#carga-reiniciar').onclick = () => { try { localStorage.removeItem(CLAVE); } catch { /* nada */ } location.reload(); };
    }
  }
})();
