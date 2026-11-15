// Hub Nocturno v2 · arranque, bucle, guía del primer minuto, acciones del jugador y puente entre el modelo (../../js) y la
// presentación (mundo 3D, interfaz y sonido). El modelo no se toca: acá solo se lo consulta y se le piden acciones.
import { Vector3 } from 'three';
import * as M from '../../js/modelo.js';
import { AEROPUERTOS, AVIONES, CAPITULOS, MISIONES, TRANSBORDO } from '../../js/datos.js';
import { Mundo } from './mundo/mundo.js';
import { RADIO_CIUDAD } from './mundo/ciudades.js';
import * as U from './ui/ui.js';
import { icono } from './ui/iconos.js';
import { t, hay, plata, plataSigno, numero, cambiarLengua, fijarTactil, GLOSARIO } from './ui/textos.js';
import * as A from './audio/audio.js';
import urlAlturas from '../activos/alturas.webp';
import urlSuelo from '../activos/suelo.webp';
import urlCosta from '../activos/costa.webp';
import './ui/estilo.css';

const q = new URLSearchParams(location.search);
const CLAVE = 'hubnocturno.v2.partida', CLAVE_EXTRA = 'hubnocturno.v2.extra';
const almacen = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } },
};
const $ = U.$, esc = U.esc;
const nom = (id) => esc(M.AP[id]?.nombre ?? id);

let mundo, s, retratos = {};
let escena = 'carga';                 // carga → portada → intro → juego
let vel = 1, acc = 0, ultimo = performance.now();
let sel = null;                       // { tipo: 'ciudad'|'ruta'|'avion'|'hangar', id, desde?, ruta? }
let marcaBoton = null;                // selector del botón que hay que tocar (late y lleva el dedo)
let guia = { paso: null, hecha: false, t: 0 };
let vistos = {};                      // momentos ya mostrados (cada concepto se explica una vez)
let premiosPendientes = 0;            // premios ya acreditados en el modelo pero todavía no festejados
let sug = null, ultimaSug = 0, ultimaUI = 0, ultimoGuardado = 0, guardarPronto = false;
let eraNoche = false, ocultoDesde = null, errores = 0;
const cola = [];                      // festejos en fila (uno por vez)

// ───────────── guardado ─────────────
function guardar() {
  guardarPronto = false; ultimoGuardado = performance.now();
  if (!s || escena !== 'juego') return;
  try { almacen.set(CLAVE, M.guardar(s)); almacen.set(CLAVE_EXTRA, JSON.stringify({ guia: guia.hecha, vistos, vel: vel || 1 })); } catch { /* sin almacenamiento */ }
}
function leerGuardado() {
  const x = almacen.get(CLAVE);
  if (!x) return null;
  try { const r = M.restaurar(x); return r?.error ? null : r; } catch { return null; }
}

// ───────────── utilidades del modelo ─────────────
const rutaDe = (id) => s.rutas.find((r) => r.id === id);
const otraPunta = (r, id) => (r.a === id ? r.b : r.a);
function nombreRuta(r) {
  if (r.a === M.HUB || r.b === M.HUB) return t('rutaA', { ciudad: M.AP[otraPunta(r, M.HUB)].nombre });
  return t('rutaEntre', { a: M.AP[r.a].nombre, b: M.AP[r.b].nombre });
}
const tituloRuta = (r) => `${M.AP[r.a].nombre} – ${M.AP[r.b].nombre}`;
// Con quién conectar una ciudad que todavía no está en la red (la más cercana a la que llega algún avión).
function conexionPara(id, desde = null) {
  const red = M.nodosRed(s), nodos = red.length ? red : [M.HUB];
  const alc = Math.max(0, ...M.avionesDisponibles(s).map((x) => x.alcance));
  if (desde && nodos.includes(desde) && M.km(desde, id) <= alc) return { desde, costo: M.costoRuta(desde, id), km: M.km(desde, id) };
  const llegan = nodos.filter((n) => n !== id && M.km(n, id) <= alc).sort((a, b) => M.km(a, id) - M.km(b, id));
  if (llegan.length) return { desde: llegan[0], costo: M.costoRuta(llegan[0], id), km: M.km(llegan[0], id) };
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
const esperanPara = (id) => { let n = 0; for (const ap in s.colas) for (const g of Object.values(s.colas[ap])) if (g.d === id) n += g.n; return Math.round(n); };
const unidad = (c, n = 2) => (c === 'correo' ? t(n === 1 ? 'carta' : 'cartas') : t(`u_${c}`));
const icoCarga = (c) => (c === 'pasajeros' ? 'pasajero' : c === 'carga' ? 'carga' : 'cartas');
const dineroVisible = () => s.dinero - premiosPendientes;
const guiando = () => escena === 'juego' && !guia.hecha && guia.paso;
const enPausaGuia = () => guiando() && ['tocar', 'ruta', 'avion'].includes(guia.paso);

// ───────────── arranque ─────────────
function avance(p) { const b = $('#carga-avance'); if (b) b.style.width = `${p}%`; }
async function arrancar() {
  avance(15);
  fijarTactil(matchMedia('(pointer: coarse)').matches);
  U.montar();
  U.escuchar(accion);
  const mundoJson = await (await fetch('activos/mundo.json')).json();
  avance(35);
  mundo = new Mundo(document.querySelector('#mundo'));
  await mundo.iniciar({ alturas: urlAlturas, suelo: urlSuelo, costa: urlCosta }, mundoJson, AEROPUERTOS, M.HUB);
  avance(80);
  retratos = mundo.retratos(AVIONES.map((a) => a.id));
  avance(95);
  mundo.alEvento = eventoMundo;
  mundo.alPing = (ruta, i) => { A.sonar('faro', i); };
  entrada();
  addEventListener('resize', () => mundo.medir());
  document.addEventListener('visibilitychange', visibilidad);
  addEventListener('pagehide', guardar);
  addEventListener('keydown', tecla);
  const extra = (() => { try { return JSON.parse(almacen.get(CLAVE_EXTRA) ?? 'null') ?? {}; } catch { return {}; } })();
  const guardado = q.get('nuevo') ? null : leerGuardado();
  s = guardado ?? M.nuevoEstado(Date.now() % 1e9);
  M.tomarEventos(s);
  if (guardado) { guia.hecha = !!extra.guia || s.rutas.length > 0; vistos = extra.vistos ?? {}; }
  window.__hn = depuracion();
  sincronizar(0);
  if (q.get('saltar')) { escena = 'juego'; if (q.get('saltar') === 'guia') guia.hecha = true; else if (!guia.hecha) pasoGuia('tocar'); camaraJuego(false); }
  else irPortada(!!guardado);
  if (q.get('hora')) mundo.horaFija = +q.get('hora'); // para mirar una luz del día en particular
  $('#carga').classList.add('fuera');
  setTimeout(() => $('#carga')?.remove(), 800);
  requestAnimationFrame(cuadro);
}

// ───────────── portada y entrada ─────────────
function irPortada(haySeguir) {
  escena = 'portada';
  U.ocultarJuego(true);
  U.portada({ haySeguir });
  mundo.horaFija = 21.6;
  mundo.orbita = { x: 0.6, z: 0.2, dist: 8.5, polar: 1.02, az: -0.5, vel: 0.035 };
}
function empezar(nueva) {
  A.iniciarAudio();
  if (nueva) {
    almacen.del(CLAVE); almacen.del(CLAVE_EXTRA);
    s = M.nuevoEstado(Date.now() % 1e9); M.tomarEventos(s);
    guia = { paso: null, hecha: false, t: 0 }; vistos = {}; sel = null; premiosPendientes = 0; U.reiniciarPlata();
    for (const v of mundo.rutas.values()) { mundo.escena.remove(v.grupo); v.liberar(); } mundo.rutas.clear();
  }
  U.portada(null);
  mundo.orbita = null;
  if (nueva && !q.get('sinintro')) intro();
  else { mundo.horaFija = null; escena = 'juego'; U.ocultarJuego(false); camaraJuego(true); if (!guia.hecha) pasoGuia('tocar'); }
}
// Diez segundos: de la noche sobre la cordillera al amanecer en Buenos Aires, con dos frases.
function intro() {
  escena = 'intro';
  U.cine(true);
  const fin = camaraInicial();
  mundo.rodar([
    { t: 0, pos: [-17.2, 2.3, 0.4], obj: [-11.4, 0.75, -1.5], hora: 5.5 },
    { t: 3.4, pos: [-12.8, 2.6, -0.7], obj: [-8.0, 0.4, -0.5], hora: 6.3 },
    { t: 6.8, pos: [-5.2, 2.7, 1.5], obj: [-0.6, 0.1, 0.2], hora: 7.6 },
    { t: 10.2, pos: fin.pos, obj: fin.obj, hora: 9 },
  ], finIntro);
  leyendaIntro = 0;
}
// Las dos frases van atadas al tiempo de la toma (no al reloj): si el equipo va lento, igual llegan a leerse.
let leyendaIntro = 0;
function leyendasIntro() {
  const tc = mundo.cine?.t ?? 99, cual = tc < 0.4 ? 0 : tc < 4.5 ? 1 : tc < 4.9 ? 0 : tc < 9.6 ? 2 : 0;
  if (cual === leyendaIntro) return;
  leyendaIntro = cual;
  U.leyenda(cual ? t(`intro${cual}`) : null);
}
function finIntro() {
  if (escena !== 'intro') return;
  escena = 'juego';
  U.cine(false);
  mundo.horaFija = null;
  pasoGuia('tocar');
  guardarPronto = true;
}
// La cámara del primer minuto: Buenos Aires y Montevideo llenan la pantalla.
function camaraInicial() {
  const a = mundo.ciudades.get(M.HUB).pos, b = mundo.ciudades.get('MVD').pos;
  const cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2, angosto = innerWidth < 640;
  const d = angosto ? 9.6 : 5.6, pol = 0.88, corr = angosto ? 1.2 : 0.25;
  return { pos: [cx, Math.cos(pol) * d, cz + corr + Math.sin(pol) * d], obj: [cx, 0, cz + corr] };
}
function camaraJuego(suave) {
  if (!s.rutas.length) { const c = camaraInicial(); mundo.controles.setLookAt(...c.pos, ...c.obj, suave); return; }
  verRed(suave);
}
function puntosRed() {
  const ps = M.nodosRed(s).map((id) => mundo.ciudades.get(id)?.pos).filter(Boolean);
  const m = M.misionActual(s);
  for (const id of [m?.a, m?.b, m?.ciudad, ...(m?.ciudades ?? [])]) { const c = id && mundo.ciudades.get(id); if (c) ps.push(c.pos); }
  if (!ps.length) ps.push(mundo.ciudades.get(M.HUB).pos);
  return ps;
}
function verRed(suave = true) {
  mundo.seguir(null);
  mundo.encuadrar(puntosRed(), { suave, margen: 1.5, azimut: 0, abajo: innerWidth < 640 ? 0.12 : 0, distMin: 5.4 });
}

// ───────────── guía del primer minuto ─────────────
function pasoGuia(p) {
  guia.paso = p; guia.t = performance.now();
  const base = M.HUB, destino = 'MVD';
  switch (p) {
    case 'tocar':
      sel = null; marcaBoton = null;
      mundo.enfocar([base, destino]); mundo.marcar({ tipo: 'ciudad', id: destino });
      U.burbuja(t('g_tocar', { n: numero(M.enEspera(s, base)) }), 'cartas');
      break;
    case 'ruta':
      mundo.marcar(null); marcaBoton = '[data-accion="abrirRuta"]';
      U.burbuja(t('g_ruta'), 'ruta');
      break;
    case 'avion':
      marcaBoton = '[data-accion="comprar"]';
      U.burbuja(t('g_avion'), 'avion');
      break;
    case 'vuela':
      marcaBoton = null; mundo.enfocar(null, false); mundo.marcar(null);
      U.burbuja(t('g_vuela'), 'cartas');
      break;
    case 'cobro':
      U.burbuja(t('g_cobro'), 'moneda');
      setTimeout(() => guia.paso === 'cobro' && pasoGuia('sigue'), 5200);
      break;
    case 'sigue':
      mundo.seguir(null);
      U.burbuja(t('g_sigue'), 'mision');
      verRed();
      setTimeout(() => guia.paso === 'sigue' && terminarGuia(), 9000);
      break;
    default: break;
  }
  A.sonar('momento');
}
function terminarGuia() {
  guia.hecha = true; guia.paso = null; marcaBoton = null;
  mundo.enfocar(null, false); mundo.marcar(null); U.burbuja(null);
  guardarPronto = true;
}

// ───────────── momentos (cada concepto, una vez) ─────────────
function momento(clave, m, siempre = false) {
  if (!siempre && vistos[clave]) return false;
  if (guiando() && !['sigue'].includes(guia.paso)) return false;
  vistos[clave] = 1;
  U.momento(m); A.sonar('momento');
  return true;
}

// ───────────── eventos del modelo ─────────────
const _tmp = new Vector3();
function pantallaDe(idCiudad, alto = 0.55) {
  const c = mundo.ciudades.get(idCiudad);
  if (!c) return null;
  const p = mundo.aPantalla(_tmp.copy(c.pos).setY(c.pos.y + RADIO_CIUDAD * mundo.S * alto), {});
  return p.visible ? p : null;
}
let ultimoCobro = 0;
function atender(eventos) {
  if (!eventos?.length) return;
  const ahora = performance.now();
  const pocos = s.aviones.length <= 14;
  for (const e of eventos) {
    switch (e.tipo) {
      case 'aterrizaje': {
        const p = pantallaDe(e.ap);
        if (e.ingreso > 0 && p && (pocos || ahora - ultimoCobro > 500)) {
          ultimoCobro = ahora;
          U.cifra({ x: p.x, y: p.y - 26 }, `+${plata(e.ingreso)}`, 'bueno');
          U.monedas(p, Math.max(3, Math.min(8, Math.round(e.ingreso / 500))));
          A.sonar('cobro');
          const c = mundo.ciudades.get(e.ap); if (c) mundo.chispas(c.pos.clone().setY(c.pos.y + 0.12 * mundo.S), 14);
        } else if (e.netoViaje < -50 && p && pocos && e.ingreso === 0 && s.stats.vuelos > 3) {
          U.cifra({ x: p.x, y: p.y - 26 }, plata(e.netoViaje), 'malo');
          momento('perdio', { ico: 'moneda', titulo: t('c_ganancia_t'), texto: t('mo_perdio') });
        }
        if (guia.paso === 'vuela' && e.ingreso > 0) pasoGuia('cobro');
        break;
      }
      case 'despegue': {
        const av = s.aviones.find((a) => a.id === e.avion), n = mundo.vuelos.naves.get(e.avion);
        if (av && n && e.carga > 0 && pocos) { const d = pantallaDe(av.en, 0.5), h = mundo.aPantalla(n.pos); if (d && h.visible) U.sobres(d, h, Math.min(5, Math.ceil(e.carga / 6))); }
        break;
      }
      case 'mision': premiosPendientes += e.premio ?? 0; cola.push({ tipo: 'mision', id: e.id, premio: e.premio ?? 0 }); break;
      case 'avionNuevo': cola.push({ tipo: 'avionNuevo', avion: e.avion }); break;
      case 'ciudadesNuevas': cola.push({ tipo: 'ciudades', ciudades: e.ciudades }); break;
      case 'capitulo': cola.push({ tipo: 'capitulo' }); break;
      case 'contrato': premiosPendientes += e.premio ?? 0; cola.push({ tipo: 'encargo', premio: e.premio ?? 0 }); break;
      case 'contratoVencido': U.aviso(t('encargoVencido'), { ico: 'encargo', tono: 'malo' }); break;
      case 'contratosNuevos': momento('encargo', { ico: 'encargo', titulo: t('mo_encargo_t'), texto: t('mo_encargo') }); break;
      case 'pronostico': momento('tormenta', { ico: 'tormenta', titulo: t('mo_tormenta_t'), texto: t('mo_tormenta', { lista: (e.zona ?? []).slice(0, 3).map((z) => M.AP[z].nombre).join(', ') }) }, true); break;
      case 'tormentaFin': U.aviso(t('mo_tormentaFin'), { ico: 'sol', tono: 'bueno' }); break;
      case 'avisoNoche': momento('tarde', { ico: 'luna', titulo: t('mo_tarde_t'), texto: t('mo_tarde') }); break;
      case 'primeraNoche': momento('noche', { ico: 'dormido', titulo: t('mo_noche_t'), texto: t('mo_noche'), dura: 8000 }, true); break;
      case 'primerasBalizas': { momento('faros', { ico: 'faro', titulo: t('mo_faros_t'), texto: t('mo_faros'), dura: 7000 }, true); const r = rutaDe(e.ruta); if (r) verCiudades([r.a, r.b]); break; }
      case 'primerDespegueNoche': momento('despegueNoche', { ico: 'luna', titulo: t('mo_despegueNoche_t'), texto: t('mo_despegueNoche') }, true); mundo.seguir(e.avion); break;
      case 'ventaForzada': U.aviso(t('mo_venta', { monto: plata(e.monto ?? 0) }), { ico: 'moneda', tono: 'malo', dura: 6000 }); A.sonar('error'); break;
      case 'clasificacion': ofrecerOrden(); break;
      case 'clasificacionHecha': U.aviso(t('mo_ordenado', { pct: `${numero(e.pct * 100)}%`, monto: plata(e.ingreso) }), { ico: 'base', tono: 'bueno', dura: 6000 }); break;
      case 'rondaDisponible': U.aviso(t('mo_ronda'), { ico: 'luna', tono: 'noche' }); break;
      case 'resultadoNoche': U.aviso(t('mo_rondaFin', { pct: `${numero((e.pctPrimeraHora ?? 0) * 100)}%` }), { ico: 'base', tono: 'noche', dura: 6000 }); break;
      default: break;
    }
  }
  if (!vistos.base && (s.stats.transbordos[M.HUB] ?? 0) > 0) momento('base', { ico: 'base', titulo: t('mo_base_t'), texto: t('mo_base'), dura: 8000 });
}
function ofrecerOrden() {
  const c = M.clasificacionActual(s);
  if (!c || c.estado !== 'oferta') return;
  U.momento({ ico: 'base', titulo: t('mo_ordenar_t'), texto: t('mo_ordenar'),
    elige: c.opciones.map((o) => `<button class="boton" data-accion="ordenar" data-id="${o.id}">${esc(o.nombre)}</button>`).join('') });
  A.sonar('momento');
}

// Festejos en fila: uno por vez, para que cada uno se vea.
let festejando = false, enFestejo = null;
function avanzarCola() {
  if (festejando || !cola.length || U.ventanaAbierta()) return;
  if (guia.paso === 'vuela' || enPausaGuia()) return; // la primera misión se festeja cuando llega el primer cobro
  if (U.momentoAbierto() && ['mision', 'encargo'].includes(cola[0].tipo) && !U.eligiendo()) return; // el cartel espera a que se vaya la tarjeta de arriba
  const f = cola.shift();
  festejando = true; enFestejo = f.tipo === 'mision' ? f : null;
  const listo = (ms) => setTimeout(() => { festejando = false; enFestejo = null; }, ms);
  switch (f.tipo) {
    case 'mision': {
      const m = MISIONES.find((x) => x.id === f.id);
      A.sonar('mision');
      const ciudad = mundo.ciudades.get(m.b ?? m.ciudad ?? M.HUB) ?? mundo.ciudades.get(M.HUB);
      mundo.papelitos(ciudad.pos, 70);
      U.cartel(t('misionCumplida'), textoMision(m), f.premio, () => { premiosPendientes = Math.max(0, premiosPendientes - f.premio); A.sonar('cobro'); });
      if (!f.premio) premiosPendientes = Math.max(0, premiosPendientes);
      listo(3300);
      setTimeout(() => { if (performance.now() - (mundo.ultimoManual ?? 0) > 4000 && guia.hecha && !sel) verRed(); }, 3000);
      break;
    }
    case 'encargo':
      A.sonar('mision');
      U.cartel(t('encargoCumplido'), '', f.premio, () => { premiosPendientes = Math.max(0, premiosPendientes - f.premio); A.sonar('cobro'); });
      listo(3300); break;
    case 'avionNuevo': {
      const a = M.AV[f.avion];
      momento(`avion_${a.id}`, { img: retratos[a.id], titulo: t('avionNuevo'), texto: `<b>${esc(a.nombre)}.</b> ${esc(t(`a_${a.id}`))}`, dura: 7000 }, true);
      listo(2500); break;
    }
    case 'ciudades': {
      const ids = [...new Set(f.ciudades)];
      momento('ciudades', { ico: 'ruta', titulo: t('mo_ciudades_t'), texto: t('mo_ciudades', { lista: ids.map((c) => M.AP[c].nombre).join(', ') }), dura: 7000 }, true);
      if (performance.now() - (mundo.ultimoManual ?? 0) > 3000) verCiudades([...M.nodosRed(s), ...ids]);
      listo(2800); break;
    }
    case 'capitulo': finCapitulo(); listo(600); break;
    default: festejando = false;
  }
}
function verCiudades(ids) {
  const ps = ids.map((id) => mundo.ciudades.get(id)?.pos).filter(Boolean);
  if (ps.length) { mundo.seguir(null); mundo.encuadrar(ps, { margen: 1.5, azimut: 0, abajo: innerWidth < 640 ? 0.12 : 0, distMin: 5.4 }); }
}

// Eventos que nacen en el mundo 3D (para el sonido).
function eventoMundo(e) {
  if (escena !== 'juego') return;
  const pocos = s.aviones.length <= 10;
  if (e.tipo === 'despegue' && (pocos || mundo.siguiendo === e.nave.id)) A.sonar('despegue');
  else if (e.tipo === 'toque' && (pocos || mundo.siguiendo === e.nave.id)) A.sonar('aterriza');
  else if (e.tipo === 'rutaNueva') A.sonar('ruta');
  else if (e.tipo === 'ciudadNueva') { A.sonar('ciudad'); mundo.chispas(e.ciudad.pos.clone().setY(e.ciudad.pos.y + 0.1), 24); }
  else if (e.tipo === 'nuevo') A.sonar('compra');
}

// ───────────── fin de capítulo ─────────────
function finCapitulo() {
  guardar();
  const r = M.resumenCapitulo(s), ultimoCap = s.cap >= CAPITULOS.length;
  const c = (n, k) => `<div><b>${n}</b><span>${esc(t(k))}</span></div>`;
  const cifras = [c(numero(r.entregas.correo), 'st_cartas')];
  if (r.entregas.pasajeros) cifras.push(c(numero(r.entregas.pasajeros), 'st_pax'));
  if (r.entregas.carga) cifras.push(c(numero(r.entregas.carga), 'st_ton'));
  cifras.push(c(numero(r.km), 'st_km'), c(r.aTiempo == null ? '—' : `${numero(r.aTiempo * 100)}%`, 'st_tiempo'));
  const mr = r.mejorRuta;
  A.sonar('mision');
  mundo.papelitos(mundo.ciudades.get(M.HUB).pos, 120);
  U.ventana({ titulo: ultimoCap ? t('finHistoria') : t('finCap'), cerrable: false,
    html: `<p>${esc(t(`cap${s.cap}`))}</p><div class="cifras">${cifras.join('')}</div>${mr && mr.neto > 0 ? `<p>${esc(t('mejorRuta', { ruta: `${M.AP[mr.a].nombre} – ${M.AP[mr.b].nombre}`, monto: plataSigno(mr.neto) }))}</p>` : ''}
      <p class="chica">${esc(t(`dato${s.cap}`))}</p>${ultimoCap ? `<p>${esc(t('finHistoriaTxt'))}</p>` : ''}`,
    botones: ultimoCap ? [{ txt: t('seguirAca'), accion: 'cerrarVentana' }] : [{ txt: t('irCap', { n: s.cap + 1 }), accion: 'siguienteCapitulo', ico: 'flecha' }, { txt: t('seguirAca'), accion: 'cerrarVentana', clase: 'suave' }] });
}
function siguienteCapitulo() {
  U.ventana(null);
  if (!M.avanzarCapitulo(s).ok) return;
  atender(M.tomarEventos(s));
  sel = null;
  guardar();
  U.ventana({ titulo: t(`cap${s.cap}`), html: `<p>${esc(t(`cap${s.cap}Texto`))}</p>`, botones: [{ txt: t('jugar'), accion: 'cerrarVentana', ico: 'play' }] });
  setTimeout(() => verCiudades(AEROPUERTOS.filter((a) => M.ciudadDisponible(s, a.id)).map((a) => a.id)), 300);
}

// ───────────── vuelta (pestaña oculta) ─────────────
function visibilidad() {
  if (document.hidden) { ocultoDesde = Date.now(); guardar(); A.silenciar(true); return; }
  A.silenciar(false);
  const seg = ocultoDesde ? (Date.now() - ocultoDesde) / 1000 : 0; ocultoDesde = null;
  ultimo = performance.now();
  if (escena !== 'juego' || seg < 60 || !guia.hecha) return;
  try {
    const r = M.simularAusencia(s, seg);
    if (!r?.minutos) return;
    atender((r.eventos ?? []).filter((e) => ['mision', 'capitulo', 'avionNuevo', 'ciudadesNuevas'].includes(e.tipo)));
    U.ventana({ titulo: t('ausente_t'), html: `<p>${esc(t('ausente'))}</p><div class="cifras"><div><b>${plataSigno(r.neto ?? 0)}</b><span>${icono('moneda')}</span></div></div>`, botones: [{ txt: t('cobrar'), accion: 'cerrarVentana', ico: 'moneda' }] });
    guardar();
  } catch { /* la vuelta nunca rompe el juego */ }
}

// ───────────── bucle ─────────────
function cuadro(ahora) {
  try { pasoCuadro(ahora); errores = 0; } catch (e) {
    errores++; console.warn('Hub Nocturno: error en un cuadro', e);
    if (errores === 3) U.ventana({ titulo: t('errorTitulo'), cerrable: false, html: `<p>${esc(t('errorTexto'))}</p>`, botones: [{ txt: t('errorSeguir'), accion: 'recargar' }, { txt: t('reiniciar'), accion: 'reiniciarYa', clase: 'suave' }] });
  }
  requestAnimationFrame(cuadro);
}
const corriendo = () => escena === 'juego' && vel > 0 && !U.ventanaAbierta() && !enPausaGuia();
function sincronizar(dt) {
  mundo.sincronizar(s, acc, dt, { disponible: (id) => M.ciudadDisponible(s, id), hora: M.hora(s) + acc / 60, minPorSeg: M.MIN_POR_SEG * Math.max(vel, 1), corriendo: corriendo() });
}
function simular(dt) {
  if (!corriendo()) return;
  acc += dt * M.MIN_POR_SEG * vel;
  let pasos = 0;
  while (acc >= M.PASO && pasos < 30) { atender(M.paso(s)); acc -= M.PASO; pasos++; }
  if (acc > M.PASO * 30) acc = 0;
}
function pasoCuadro(ahora) {
  const dt = Math.min(0.25, (ahora - ultimo) / 1000); ultimo = ahora;
  simular(dt);
  if (mundo.orbita) orbitar(dt);
  if (escena === 'intro') leyendasIntro();
  sincronizar(dt);
  mundo.cuadro(ahora);
  etiquetas();
  if (ahora - ultimaUI > 220) { refrescar(ahora); ultimaUI = ahora; }
  avanzarCola();
  if (ahora - ultimoGuardado > 15000 || (guardarPronto && ahora - ultimoGuardado > 1500)) guardar();
}
function orbitar(dt) {
  const o = mundo.orbita; o.az += o.vel * dt;
  mundo.controles.setLookAt(o.x + Math.sin(o.az) * Math.sin(o.polar) * o.dist, Math.cos(o.polar) * o.dist, o.z + Math.cos(o.az) * Math.sin(o.polar) * o.dist, o.x, 0, o.z, false);
}

// ───────────── etiquetas del mundo (cada cuadro) ─────────────
const _et = {};
function etiquetas() {
  if (escena === 'portada' || escena === 'intro') { U.etiquetas([]); return; }
  const lista = [], S = mundo.S;
  const m = M.misionActual(s), metas = new Set([m?.b, m?.ciudad, ...(m?.ciudades ?? [])].filter(Boolean));
  const lejos = mundo.dist > 34;
  for (const c of mundo.ciudades.values()) {
    const enRed = M.enRed(s, c.id) || c.id === M.HUB;
    if (lejos && !enRed && !metas.has(c.id) && c.ap.peso < 20) continue;
    const p = mundo.aPantalla(_tmp.copy(c.pos).setY(c.pos.y + RADIO_CIUDAD * S * 0.62), _et);
    if (!p.visible) continue;
    const n = Math.round(M.enEspera(s, c.id));
    const clase = `etq${c.esBase ? ' base' : ''}${enRed ? '' : ' lejos'}${metas.has(c.id) && !M.servido(s, c.id) ? ' meta' : ''}`;
    lista.push({ id: `c-${c.id}`, x: p.x, y: p.y, clase, html: `${n > 0 && enRed ? `<span class="cta">${icono(s.cap === 1 ? 'carta' : 'cartas')}${numero(n)}</span>` : ''}<span>${nom(c.id)}</span>` });
  }
  for (const n of mundo.vuelos.naves.values()) {
    const elegido = (sel?.tipo === 'avion' && sel.id === n.id) || mundo.siguiendo === n.id;
    const duerme = n.espera === 'noche' || n.espera === 'tormenta';
    if (!elegido && !duerme) continue;
    const p = mundo.aPantalla(_tmp.copy(n.pos).setY(n.pos.y + 0.16 * S), _et);
    if (!p.visible) continue;
    const av = s.aviones.find((a) => a.id === n.id); if (!av) continue;
    const carga = av.carga.reduce((a, x) => a + x.n, 0);
    lista.push({ id: `a-${n.id}`, x: p.x, y: p.y, clase: 'etq-avion', html: duerme ? icono(n.espera === 'noche' ? 'dormido' : 'tormenta') : `${icono('carta')}${numero(carga)}` });
  }
  U.etiquetas(lista);
  // el dedo de la guía sobre la ciudad que hay que tocar
  if (guia.paso === 'tocar') { const p = pantallaDe('MVD', 0.1); U.dedoEn(p ? { x: p.x + 6, y: p.y + 6 } : null); }
}

// ───────────── refresco de la interfaz (4 veces por segundo) ─────────────
function textoMision(m) {
  const meta = m.tipo === 'mejorDia' ? plata(m.meta) : numero(m.meta);
  return t(m.id, { meta, n: numero(m.n ?? 0) });
}
function objetivos() {
  const out = [];
  // una misión cumplida que todavía no se festejó se sigue mostrando, completa, hasta su cartel
  const pend = enFestejo ?? cola.find((f) => f.tipo === 'mision');
  const mp = pend && MISIONES.find((x) => x.id === pend.id);
  if (mp) return [{ tipo: 'mision', orden: MISIONES.filter((x) => x.cap === mp.cap).indexOf(mp) + 1, texto: esc(textoMision(mp)), progreso: 1, avance: '', premio: mp.premio, pista: '' }];
  for (const o of M.misionesActivas(s)) {
    if (o.tipo === 'historia') {
      const m = o.mision, orden = MISIONES.filter((x) => x.cap === m.cap).indexOf(m) + 1;
      let texto = esc(o.espera ? t(`${m.id}_espera`) : textoMision(m)), avance = o.avanceTxt;
      if (m.tipo === 'ruta') avance = esc(t(o.progreso < 0.5 ? 'paso_ruta' : 'paso_avion'));
      if (m.tipo === 'mejorDia') avance = `${plata(o.avance.n)}`;
      const pista = o.pista ? esc(t(o.pista === 'pista_noche' ? 'pista_noche' : hay(o.pista) ? o.pista : 'pista_generica')) : '';
      out.push({ tipo: 'mision', orden, texto, progreso: o.espera ? 0 : o.progreso, avance: o.espera ? '' : avance, premio: m.premio, pista });
    } else {
      const u = unidad(o.carga);
      const horas = Math.max(1, Math.round(o.quedan / 60));
      const quedan = horas >= 48 ? `${Math.round(horas / 24)} d` : `${horas} h`;
      out.push({ tipo: 'encargo', texto: esc(t('encargoTxt', { n: numero(o.avance.meta), u, a: M.AP[o.o].nombre, b: M.AP[o.d].nombre })),
        detalle: `${o.oferta ? '' : `${o.avanceTxt} · `}${esc(t('quedan', { t: quedan }))} · ${plata(o.premio)}`,
        boton: o.oferta ? `<button class="mini" data-accion="aceptarEncargo" data-id="${o.contrato}">${esc(t('aceptar'))}</button>` : '' });
    }
  }
  return out;
}
function pasoSugerido() {
  if (!sug) return { ico: 'check', texto: esc(t('s_esperar')) };
  const d = sug, r = d.ruta ? rutaDe(d.ruta) : d.tipo !== 'ruta' && typeof d.id === 'string' ? rutaDe(d.id) : null;
  const ruta = r ? esc(nombreRuta(r)) : '';
  switch (d.tipo) {
    case 'ruta': { const afuera = M.enRed(s, d.a) || (!M.nodosRed(s).length && d.a === M.HUB) ? d.b : d.a; return { ico: 'ruta', texto: esc(t('s_ruta', { b: M.AP[afuera].nombre })), costo: d.costo }; }
    case 'avion': return { ico: 'avion', texto: t('s_avion', { ruta }), costo: d.costo };
    case 'balizas': return { ico: 'faro', texto: t('s_faros', { ruta }), costo: d.costo };
    case 'transbordo': return { ico: 'base', texto: esc(t('s_base', { ap: M.AP[d.id].nombre })), costo: d.costo };
    case 'cargaMin': return { ico: 'cartas', texto: t('s_salida', { ruta }) };
    case 'contrato': return { ico: 'encargo', texto: esc(t('s_encargo')) };
    case 'vender': { const av = s.aviones.find((a) => a.id === d.id), rr = av && rutaDe(av.ruta); return { ico: 'moneda', texto: d.seguridad || !rr ? esc(t('s_vender')) : t('s_vender2', { ruta: esc(nombreRuta(rr)) }) }; }
    case 'clasificar': return { ico: 'base', texto: esc(t('s_ordenar')) };
    case 'ahorrar': case 'acelerar': {
      if (d.falta == null) return { ico: 'rapido', texto: esc(t('s_acelerar')) };
      const que = d.que === 'avion' ? t('que_avion', { avion: M.AV[d.id]?.nombre ?? '' }) : d.que === 'balizas' ? t('que_faros') : d.que === 'transbordo' ? t('que_base')
        : t('que_ruta', { ciudad: (() => { const [a, b] = String(d.id).split('-'); return M.AP[M.enRed(s, a) ? b : a]?.nombre ?? ''; })() });
      return { ico: 'rapido', texto: esc(t('s_juntar', { falta: plata(d.falta), que })) };
    }
    default: return { ico: 'check', texto: esc(t('s_esperar')) };
  }
}
function refrescar(ahora) {
  if (escena !== 'juego') return;
  const noche = M.esNoche(s);
  if (noche !== eraNoche) { eraNoche = noche; if (s.t > 30) A.sonar(noche ? 'noche' : 'dia'); }
  A.fijarNoche(mundo.cielo.noche);
  U.barra({ dinero: dineroVisible(), gananciaHoy: M.gananciaDia(s), fecha: M.fecha(s), noche, vel });
  U.mision(guia.hecha || guia.paso === 'sigue' || guia.paso === 'cobro' ? objetivos() : objetivos().slice(0, 1));
  // siguiente paso
  if (ahora - ultimaSug > (s.aviones.length > 100 ? 2500 : 900)) { sug = guiando() && guia.paso !== 'sigue' ? null : M.sugerencia(s); ultimaSug = ahora; }
  const mostrarPaso = (guia.hecha || guia.paso === 'sigue') && !U.panelAbierto();
  U.paso(mostrarPaso ? { ...pasoSugerido(), pulso: guia.paso === 'sigue' } : null);
  $('#ui').classList.toggle('con-burbuja', !!guiando());
  // panel
  U.panel(armarPanel());
  mundo.elegir(sel && sel.tipo !== 'hangar' ? sel : sel?.tipo === 'hangar' ? { tipo: 'ruta', id: sel.ruta } : null);
  U.marcar(marcaBoton);
  if (marcaBoton && guia.hecha && ahora > (marcaBoton_hasta ?? 0)) marcaBoton = null;
}
let marcaBoton_hasta = 0;

// ───────────── paneles ─────────────
const cab = (ico, titulo, sub = '', atras = null) => `<div class="p-cab">${atras ? `<button class="ib" data-accion="${atras}" aria-label="${esc(t('volver'))}">${icono('atras')}</button>` : icono(ico)}<h2>${sub ? `<span class="sub">${sub}</span>` : ''}${titulo}</h2><button class="ib" data-accion="cerrarPanel" aria-label="${esc(t('cerrar'))}">${icono('cerrar')}</button></div>`;
const botonPrecio = (accion, datos, texto, precio, puede, ico = null) => `<button class="boton ancho${puede ? '' : ' no'}" data-accion="${accion}" ${datos}>${ico ? icono(ico) : ''}<span>${texto}</span>${precio != null ? `<span class="precio">${icono('moneda')}${plata(precio)}</span>` : ''}</button>`;

function armarPanel() {
  if (!sel) return null;
  if (sel.tipo === 'ciudad') return panelCiudad(sel.id);
  if (sel.tipo === 'ruta') return rutaDe(sel.id) ? panelRuta(sel.id) : (sel = null);
  if (sel.tipo === 'hangar') return rutaDe(sel.ruta) ? panelHangar(sel.ruta) : (sel = null);
  if (sel.tipo === 'avion') return s.aviones.some((a) => a.id === sel.id) ? panelAvion(sel.id) : (sel = null);
  return null;
}
function panelCiudad(id) {
  const esBase = id === M.HUB, enRed = M.enRed(s, id) || (esBase && !M.nodosRed(s).length);
  let h = cab(esBase ? 'base' : 'ruta', nom(id), esBase ? esc(t('tuBase')) : '');
  if (!enRed) {
    const c = conexionPara(id, sel.desde), n = esperanPara(id);
    if (n > 0) h += `<div class="dato">${icono('cartas')}<span><b>${numero(n)}</b> ${esc(unidad('correo', n))} ${esc(t('esperan'))}</span></div>`;
    if (c.desde && !c.escala) {
      const p = M.puedeAbrirRuta(s, c.desde, id);
      h += `<p class="nota">${icono('ruta')} ${esc(t('desde', { ciudad: M.AP[c.desde].nombre }))} · ${esc(t('kmVuelo', { km: numero(c.km) }))}</p>`;
      h += `<div class="acciones">${botonPrecio('abrirRuta', `data-a="${c.desde}" data-b="${id}"`, esc(t('abrirRuta')), c.costo, p.ok, 'ruta')}</div>`;
      if (!p.ok) h += `<p class="nota">${esc(p.error === 'plata' ? t('faltaPlata', { monto: plata(c.costo - s.dinero) }) : p.error === 'alcance' ? t('muyLejos', { km: numero(c.km) }) : t('sinConexion'))}</p>`;
    } else if (c.escala) h += `<p class="nota">${esc(t('escala', { ciudad: M.AP[c.escala].nombre }))}</p><div class="acciones"><button class="boton ancho suave" data-accion="verCiudad" data-id="${c.escala}">${icono('flecha')}${nom(c.escala)}</button></div>`;
    else h += `<p class="nota">${esc(t('sinConexion'))}</p>`;
    return h;
  }
  const n = Math.round(M.enEspera(s, id));
  h += `<div class="dato">${icono(s.cap === 1 ? 'cartas' : 'cartas')}<span>${n > 0 ? `<b>${numero(n)}</b> ${esc(s.cap === 1 ? unidad('correo', n) : t('cartasYpaquetes'))} ${esc(t('esperan'))}` : esc(t('nadaEspera'))}</span></div>`;
  const rutas = s.rutas.filter((r) => r.a === id || r.b === id);
  const conecta = esBase || rutas.filter((r) => s.aviones.some((a) => a.ruta === r.id)).length >= 2;
  if (conecta) {
    const nivel = s.niveles[id] ?? 0, costo = M.costoTransbordo(s, id), enCola = Math.round(M.enTransbordo(s, id));
    h += `<p class="nota">${esc(t('baseExplica'))} ${t('baseRitmo', { n: numero(TRANSBORDO[nivel].u) })}${enCola > 0 ? ` ${esc(t('baseCola', { n: numero(enCola) }))}.` : ''}</p>`;
    h += costo != null ? `<div class="acciones">${botonPrecio('agrandar', `data-id="${id}"`, esc(t('agrandar')), costo, s.dinero >= costo, 'base')}</div>` : `<p class="nota">${esc(t('baseMax'))}</p>`;
  }
  if (rutas.length) {
    h += `<div class="h3">${esc(t('rutasDeAca'))}</div>`;
    for (const r of rutas) {
      const k = s.aviones.filter((a) => a.ruta === r.id).length;
      h += `<button class="fila" data-accion="verRuta" data-id="${r.id}">${icono('ruta')}<span>${nom(otraPunta(r, id))}<small>${esc(k === 0 ? t('sinAvion') : k === 1 ? t('aviones1') : t('avionesN', { n: k }))}</small></span>${icono('flecha', 'fl')}</button>`;
    }
  }
  return h;
}
function estadoAvion(av) {
  const en = M.AP[av.en].nombre, hacia = M.AP[av.hacia].nombre;
  if (av.fase === 'vuelo') { const n = av.carga.reduce((a, x) => a + x.n, 0), c = av.carga[0]?.c ?? 'correo'; return `${t('volando', { ciudad: hacia })} ${n ? t('conCarga', { n: numero(n), u: unidad(c, n) }) : `(${t('vacio')})`}`; }
  if (av.espera === 'noche') return t('esperaNoche', { ciudad: en });
  if (av.espera === 'tormenta') return t('esperaTormenta', { ciudad: en });
  if (av.espera === 'carga' || av.espera === 'ronda') return t('esperaCarga', { ciudad: en });
  if (av.espera === 'vacio') return t('esperaVacio', { ciudad: en });
  return t('cargando', { ciudad: en });
}
function panelRuta(id) {
  const r = rutaDe(id), res = M.resumenRuta(s, id), neto = Math.round(res.neto);
  let h = cab('ruta', esc(tituloRuta(r)), esc(t('kmVuelo', { km: numero(r.km) })));
  if (r.vuelos > 0) h += `<div class="dato ${neto >= 0 ? 'bien' : 'mal'}">${icono('moneda')}<span>${esc(t(neto >= 0 ? 'ganoRuta' : 'perdioRuta'))} <b>${plata(Math.abs(neto))}</b></span></div>`;
  for (const av of res.aviones) h += `<button class="fila" data-accion="verAvion" data-id="${av.id}"><img src="${retratos[av.tipo]}" alt=""><span>${esc(M.AV[av.tipo].nombre)}<small>${esc(estadoAvion(av))}</small></span>${icono('flecha', 'fl')}</button>`;
  h += `<div class="acciones"><button class="boton ancho${res.aviones.length ? ' suave' : ''}" data-accion="verHangar" data-id="${id}">${icono('mas')}${esc(t('sumarAvion'))}</button>`;
  if (s.cap === 1 && !r.balizas) { const c = M.costoBalizas(r, s); h += botonPrecio('faros', `data-id="${id}"`, esc(t('ponerFaros')), c, s.dinero >= c, 'faro'); }
  h += '</div>';
  if (s.cap === 1) h += r.balizas ? `<div class="dato bien">${icono('faro')}<span>${esc(t('conFaros'))}</span></div>` : `<p class="nota">${esc(t('farosExplica'))} ${esc(t('sinFaros'))}.</p>`;
  if (res.aviones.length) {
    h += `<div class="h3">${esc(t('cuandoSale'))}</div><div class="segm">${M.CARGA_MINIMA.map((v) => `<button class="${r.minCarga === v ? 'activa' : ''}" data-accion="salida" data-id="${id}" data-v="${v}">${esc(t(`sale${Math.round(v * 100)}`))}</button>`).join('')}</div>
      <p class="nota">${esc(t(`salePista${Math.round((r.minCarga ?? 0.6) * 100)}`))}</p>`;
  }
  h += `<div class="sep"></div><button class="boton ancho peligro" data-accion="cerrarRuta" data-id="${id}">${esc(t('cerrarRuta'))}</button>`;
  return h;
}
function tarjetaAvion(tp, rutaId) {
  const r = rutaDe(rutaId), p = M.puedeComprar(s, tp.id, rutaId);
  const lleva = Object.entries(tp.lleva).map(([c, n]) => `${icono(icoCarga(c))} <b>${numero(n)}</b>`).join(' &nbsp; ');
  const maxVel = 900, maxAlc = 6500;
  const mal = p.ok ? '' : p.error === 'alcance' ? t('noLlega', { km: numero(r.km) }) : p.error === 'plata' ? t('faltaPlata', { monto: plata(tp.precio - s.dinero) }) : p.error === 'reserva' ? t('reservaTxt') : t('bloqueado');
  return `<div class="avion${p.ok ? '' : ' bloq'}"><img src="${retratos[tp.id]}" alt=""><h3>${esc(tp.nombre)}</h3><p>${esc(t(`a_${tp.id}`))}</p>
    <div class="stats">
      <div class="stat">${icono('cartas')}<span>${esc(t('lleva'))}</span><span>${lleva}</span><span></span></div>
      <div class="stat">${icono('rapido')}<span>${esc(t('velocidad'))}</span><span class="bar"><i style="width:${Math.round(Math.sqrt(tp.vel / maxVel) * 100)}%"></i></span><b>${numero(tp.vel)} km/h</b></div>
      <div class="stat">${icono('ruta')}<span>${esc(t('alcance'))}</span><span class="bar"><i style="width:${Math.round(Math.sqrt(tp.alcance / maxAlc) * 100)}%"></i></span><b>${numero(tp.alcance)} km</b></div>
    </div>${mal ? `<p class="mal">${esc(mal)}</p>` : ''}
    ${botonPrecio('comprar', `data-id="${tp.id}" data-ruta="${rutaId}"`, esc(t('comprar')), tp.precio, p.ok)}</div>`;
}
function panelHangar(rutaId) {
  const r = rutaDe(rutaId);
  let h = cab('avion', esc(t('elegiAvion')), esc(t('paraRuta', { ruta: nombreRuta(r) })), guiando() ? null : 'volverRuta');
  const tipos = M.avionesDisponibles(s).slice().sort((a, b) => (M.puedeComprar(s, b.id, rutaId).ok ? 1 : 0) - (M.puedeComprar(s, a.id, rutaId).ok ? 1 : 0) || a.precio - b.precio);
  for (const tp of tipos) h += tarjetaAvion(tp, rutaId);
  return h;
}
function panelAvion(id) {
  const av = s.aviones.find((a) => a.id === id), tp = M.AV[av.tipo], f = M.fichaAvion(s, id);
  let h = cab('avion', esc(tp.nombre), esc(nombreRuta(rutaDe(av.ruta))), 'volverRuta');
  h += `<div class="avion"><img src="${retratos[tp.id]}" alt=""><p>${esc(estadoAvion(av))}</p>
    <div class="dato ${f.neto >= 0 ? 'bien' : 'mal'}">${icono('moneda')}<span>${esc(t('gano'))} <b>${plataSigno(f.neto)}</b> · ${esc(t('viajes', { n: numero(f.viajes) }))}</span></div></div>`;
  h += `<div class="acciones"><button class="boton ancho suave" data-accion="seguirAvion" data-id="${id}">${icono('ojo')}${esc(t('seguirCam'))}</button>
    <button class="boton ancho peligro" data-accion="vender" data-id="${id}">${esc(t('vender'))} · +${plata(Math.round(tp.precio * 0.6))}</button></div>`;
  return h;
}

// ───────────── acciones ─────────────
function elegir(x, { camara = true } = {}) {
  sel = x; marcaBoton = guiando() ? marcaBoton : null;
  if (!x) return;
  A.sonar('abrir');
  if (!camara) return;
  const angosto = innerWidth < 640;
  if (x.tipo === 'ciudad') {
    const c = mundo.ciudades.get(x.id); if (!c) return;
    const enRed = M.enRed(s, x.id) || x.id === M.HUB;
    if (enRed) { mundo.seguir(null); mundo.encuadrar([c.pos], { margen: 1, abajo: angosto ? 0.42 : 0, distMin: x.id === M.HUB ? 3.6 : 4.6, distMax: 8 }); }
    else { const con = conexionPara(x.id, x.desde); const d = con.desde && mundo.ciudades.get(con.desde); mundo.seguir(null); mundo.encuadrar(d ? [c.pos, d.pos] : [c.pos], { margen: 1.7, abajo: angosto ? 0.42 : 0, distMin: 5.4 }); }
  } else if (x.tipo === 'ruta' || x.tipo === 'hangar') {
    const r = rutaDe(x.id ?? x.ruta); if (!r) return;
    mundo.seguir(null); mundo.encuadrar([mundo.ciudades.get(r.a).pos, mundo.ciudades.get(r.b).pos], { margen: 1.7, abajo: angosto ? 0.45 : 0, distMin: 5.4 });
  }
}
function marcarBoton(selector, ms = 7000) { marcaBoton = selector; marcaBoton_hasta = performance.now() + ms; }
function negar(el) { A.sonar('error'); if (el?.animate) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(0)' }], { duration: 260 }); }
function fijarVel(v) { vel = v; A.sonar('clic'); }

function accion(nombre, d, el) {
  A.iniciarAudio();
  switch (nombre) {
    case 'nuevaPartida': empezar(true); break;
    case 'seguirPartida': empezar(false); break;
    case 'idioma': cambiarLengua(); U.textosFijos(); if (escena === 'portada') U.portada({ haySeguir: !!leerGuardado() }); else { abrirMenu(); if (guiando()) pasoGuia(guia.paso); } A.sonar('clic'); break;
    case 'saltarCine': mundo.cortarCine(); break;
    case 'vel': fijarVel(+d.v); break;
    case 'pausar': fijarVel(vel === 0 ? 1 : 0); break;
    case 'centrar': A.sonar('paso'); verRed(); break;
    case 'menu': A.sonar('abrir'); abrirMenu(); break;
    case 'glosario': A.sonar('abrir'); abrirGlosario(); break;
    case 'cerrarVentana': if ($('#velo').dataset.cerrable === '0' && el?.id === 'velo') break; A.sonar('cerrar'); U.ventana(null); break;
    case 'cerrarPanel': A.sonar('cerrar'); sel = null; if (guia.paso === 'ruta' || guia.paso === 'avion') pasoGuia(s.rutas.length ? 'avion' : 'tocar'); if (guia.paso === 'avion' && s.rutas.length) sel = { tipo: 'hangar', ruta: s.rutas[0].id }; break;
    case 'verMision': { const m = M.misionActual(s); if (m && guia.hecha) { A.sonar('paso'); verRed(); } break; }
    case 'paso': tocarPaso(); break;
    case 'verCiudad': elegir({ tipo: 'ciudad', id: d.id }); break;
    case 'verRuta': elegir({ tipo: 'ruta', id: d.id }); break;
    case 'verHangar': elegir({ tipo: 'hangar', ruta: d.id }, { camara: false }); break;
    case 'verAvion': elegir({ tipo: 'avion', id: +d.id }, { camara: false }); break;
    case 'volverRuta': { const r = sel?.ruta ?? s.aviones.find((a) => a.id === sel?.id)?.ruta; if (r) elegir({ tipo: 'ruta', id: r }, { camara: false }); else sel = null; break; }
    case 'abrirRuta': {
      const r = M.abrirRuta(s, d.a, d.b);
      if (!r.ok) { negar(el); break; }
      atender(M.tomarEventos(s));
      sel = { tipo: 'hangar', ruta: r.ruta.id };
      if (guia.paso === 'ruta') pasoGuia('avion'); else marcarBoton('[data-accion="comprar"]:not(.no)', 6000);
      guardarPronto = true; ultimaSug = 0;
      break;
    }
    case 'comprar': {
      const r = M.comprarAvion(s, d.id, d.ruta);
      if (!r.ok) { negar(el); break; }
      atender(M.tomarEventos(s));
      const ru = rutaDe(d.ruta);
      if (guia.paso === 'avion') { sel = null; pasoGuia('vuela'); setTimeout(() => { mundo.seguir(r.avion.id); mundo.controles.dollyTo(innerWidth < 640 ? 5.2 : 3.6, true); mundo.controles.rotatePolarTo(1.02, true); }, 500); }
      else { sel = { tipo: 'ruta', id: d.ruta }; marcaBoton = null; if (ru) mundo.encuadrar([mundo.ciudades.get(ru.a).pos, mundo.ciudades.get(ru.b).pos], { margen: 1.7, abajo: innerWidth < 640 ? 0.45 : 0, distMin: 5.4 }); }
      guardarPronto = true; ultimaSug = 0;
      break;
    }
    case 'faros': {
      const r = M.ponerBalizas(s, d.id);
      if (!r.ok) { negar(el); break; }
      atender(M.tomarEventos(s)); sel = null; guardarPronto = true; ultimaSug = 0;
      break;
    }
    case 'agrandar': { const r = M.mejorarTransbordo(s, d.id); if (!r.ok) { negar(el); break; } A.sonar('compra'); atender(M.tomarEventos(s)); const c = mundo.ciudades.get(d.id); if (c) mundo.chispas(c.pos.clone().setY(c.pos.y + 0.15), 30); guardarPronto = true; ultimaSug = 0; break; }
    case 'salida': M.fijarCargaMinima(s, d.id, +d.v); A.sonar('clic'); ultimaSug = 0; break;
    case 'cerrarRuta': U.ventana({ titulo: t('cerrarRuta'), html: `<p>${esc(t('cerrarRutaPregunta'))}</p>`, botones: [{ txt: t('cerrarRuta'), accion: 'cerrarRutaSi', clase: 'peligro', datos: `data-id="${d.id}"` }, { txt: t('no'), accion: 'cerrarVentana', clase: 'suave' }] }); break;
    case 'cerrarRutaSi': M.cerrarRuta(s, d.id); atender(M.tomarEventos(s)); sel = null; U.ventana(null); guardarPronto = true; break;
    case 'vender': { const r = M.venderAvion(s, +d.id); if (r.ok) { A.sonar('cobro'); atender(M.tomarEventos(s)); sel = null; guardarPronto = true; } break; }
    case 'seguirAvion': mundo.seguir(+d.id); mundo.controles.dollyTo(Math.min(mundo.dist, 6), true); A.sonar('paso'); break;
    case 'aceptarEncargo': { const r = M.aceptarContrato(s, +d.id); if (r?.ok) { A.sonar('abrir'); atender(M.tomarEventos(s)); } else negar(el); break; }
    case 'ordenar': M.elegirClasificacion(s, d.id); U.momento(null); A.sonar('clic'); break;
    case 'sonido': A.alternarSonido(); abrirMenu(); A.sonar('clic'); break;
    case 'musica': A.alternarMusica(); abrirMenu(); break;
    case 'calidad': cambiarCalidad(); abrirMenu(); break;
    case 'reiniciar': U.ventana({ titulo: t('reiniciar'), html: `<p>${esc(t('reiniciarPregunta'))}</p>`, botones: [{ txt: t('si'), accion: 'reiniciarYa', clase: 'peligro' }, { txt: t('no'), accion: 'cerrarVentana', clase: 'suave' }] }); break;
    case 'reiniciarYa': almacen.del(CLAVE); almacen.del(CLAVE_EXTRA); location.href = location.pathname + (q.get('calidad') ? `?calidad=${q.get('calidad')}` : ''); break;
    case 'recargar': location.reload(); break;
    case 'siguienteCapitulo': siguienteCapitulo(); break;
    default: break;
  }
  if (escena === 'juego') refrescar(performance.now()); // la respuesta a un toque se ve en el acto, no en el próximo refresco
}
// «Siguiente paso»: lleva al lugar y marca el botón que hay que tocar.
function tocarPaso() {
  A.sonar('paso');
  if (guia.paso === 'sigue') terminarGuia();
  const d = sug ?? M.sugerencia(s);
  if (!d) { verRed(); return; }
  switch (d.tipo) {
    case 'ruta': { const afuera = M.enRed(s, d.a) || (!M.nodosRed(s).length && d.a === M.HUB) ? d.b : d.a; elegir({ tipo: 'ciudad', id: afuera, desde: afuera === d.b ? d.a : d.b }); marcarBoton('[data-accion="abrirRuta"]'); break; }
    case 'avion': elegir({ tipo: 'hangar', ruta: d.ruta, id: d.ruta }); marcarBoton(`[data-accion="comprar"][data-id="${d.id}"]`); break;
    case 'balizas': elegir({ tipo: 'ruta', id: d.id }); marcarBoton('[data-accion="faros"]'); break;
    case 'transbordo': elegir({ tipo: 'ciudad', id: d.id }); marcarBoton('[data-accion="agrandar"]'); break;
    case 'cargaMin': elegir({ tipo: 'ruta', id: d.id }); marcarBoton(`[data-accion="salida"][data-v="${d.v}"]`); break;
    case 'contrato': marcarBoton(`[data-accion="aceptarEncargo"][data-id="${d.id}"]`); if (innerWidth < 640) { const r = M.aceptarContrato(s, d.id); if (r?.ok) atender(M.tomarEventos(s)); } break;
    case 'vender': { const av = s.aviones.find((a) => a.id === d.id); if (av) { elegir({ tipo: 'avion', id: av.id }); marcarBoton('[data-accion="vender"]'); } break; }
    case 'clasificar': ofrecerOrden(); break;
    case 'ahorrar': case 'acelerar': fijarVel(3); break;
    default: verRed();
  }
  ultimaSug = 0;
}

function abrirMenu() {
  const fila = (acc, ico, txt, est = '') => `<button class="fila" data-accion="${acc}">${icono(ico)}<span>${esc(txt)}</span>${est ? `<span class="est">${esc(est)}</span>` : ''}</button>`;
  const cal = mundo.calidad.fijo ? t(`q_${mundo.calidad.nombre}`) : t('q_auto');
  U.ventana({ titulo: t('menu'), html: `<div class="lista-menu">
    ${fila('glosario', 'libro', t('glosario'))}
    ${fila('sonido', A.sonidoActivo() ? 'sonido' : 'mudo', t('sonido'), A.sonidoActivo() ? '✓' : '—')}
    ${fila('musica', 'musica', t('musica'), A.musicaActiva() ? '✓' : '—')}
    ${fila('idioma', 'idioma', t('idioma'))}
    ${fila('calidad', 'graficos', t('calidad'), cal)}
    ${fila('reiniciar', 'reinicio', t('reiniciar'))}</div><p class="chica">${esc(t('creditos'))} · ${Math.round(mundo.medidor.fps)} fps</p>` });
}
function cambiarCalidad() {
  const orden = ['auto', 'alto', 'medio', 'bajo'], actual = mundo.calidad.fijo ? mundo.calidad.nombre : 'auto';
  const sig = orden[(orden.indexOf(actual) + 1) % orden.length];
  const u = new URL(location.href); if (sig === 'auto') u.searchParams.delete('calidad'); else u.searchParams.set('calidad', sig);
  guardar(); location.href = u.toString();
}
function abrirGlosario() {
  U.ventana({ titulo: t('glosario'), html: `<div class="glos">${GLOSARIO.map(([i, k]) => `<div>${icono(i)}<b>${esc(t(`${k}_t`))}</b><span>${esc(t(k))}</span></div>`).join('')}</div>` });
}

// ───────────── toques en el mundo ─────────────
function entrada() {
  const lienzo = document.querySelector('#mundo');
  let abajo = null;
  lienzo.addEventListener('pointerdown', (e) => { abajo = { x: e.clientX, y: e.clientY, t: e.timeStamp }; A.iniciarAudio(); });
  lienzo.addEventListener('pointerup', (e) => {
    if (!abajo) return;
    const mov = Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y), dt = e.timeStamp - abajo.t; abajo = null; // la hora del evento, no la de atenderlo: un equipo lento no convierte un toque en «apretar largo»
    if (mov > 9 || dt > 600 || escena !== 'juego') return;
    tocarMundo(e.clientX, e.clientY);
  });
  lienzo.addEventListener('contextmenu', (e) => e.preventDefault());
}
function tocarMundo(x, y) {
  const h = mundo.queHay(x, y);
  if (guiando() && guia.paso !== 'sigue') {
    if (guia.paso === 'tocar' && h?.tipo === 'ciudad' && h.id === 'MVD') { elegir({ tipo: 'ciudad', id: 'MVD', desde: M.HUB }, { camara: innerWidth < 640 }); pasoGuia('ruta'); refrescar(performance.now()); }
    return;
  }
  if (!h) { if (sel) { sel = null; A.sonar('cerrar'); } return; }
  if (h.tipo === 'ciudad') elegir({ tipo: 'ciudad', id: h.id });
  else if (h.tipo === 'avion') { elegir({ tipo: 'avion', id: h.id }, { camara: false }); }
  else elegir({ tipo: 'ruta', id: h.id });
  refrescar(performance.now());
}
function tecla(e) {
  if (escena !== 'juego' || e.target.tagName === 'INPUT') return;
  if (e.key === ' ') { fijarVel(vel ? 0 : 1); e.preventDefault(); }
  else if (e.key === '1') fijarVel(1); else if (e.key === '2') fijarVel(3);
  else if (e.key === 'Escape') { if (U.ventanaAbierta()) accion('cerrarVentana', {}, null); else if (sel) accion('cerrarPanel', {}, null); }
}

// ───────────── para las pruebas y las capturas ─────────────
function depuracion() {
  return {
    get mundo() { return mundo; }, get s() { return s; }, M, A,
    get estado() { return { escena, guia: guia.paso, hecha: guia.hecha, sel, vel, dinero: s.dinero, rutas: s.rutas.length, aviones: s.aviones.length, hora: M.hora(s), fps: mundo.medidor.fps, calidad: mundo.calidad.nombre, escalaRes: mundo.escalaRes, mision: M.misionActual(s)?.id }; },
    // adelanta el juego «seg» segundos reales sin dibujar (las capturas con GPU por software van lentas)
    avanzar(seg, paso = 1 / 30) { for (let i = 0; i < seg / paso; i++) { simular(paso); sincronizar(paso); mundo.controles.update(paso); mundo.tiempo += paso; if (mundo.cine) mundo.avanzarCine(paso); avanzarCola(); } refrescar(performance.now()); },
    accion, elegir, tocarPaso, verRed, pasoGuia, terminarGuia, fijarVel, empezar,
    saltarGuia() { terminarGuia(); },
    ver(k) { vistos[k] = 1; },
    limpiar() { cola.length = 0; festejando = false; enFestejo = null; premiosPendientes = 0; U.momento(null); },
  };
}

arrancar().catch((e) => { console.error(e); const c = $('#carga'); if (c) c.insertAdjacentHTML('beforeend', `<p style="max-width:80vw;text-align:center">${esc(String(e?.message ?? e))}</p>`); });
