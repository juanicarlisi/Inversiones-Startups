// Hub Nocturno v2 · arranque, bucle, guía del primer minuto, acciones del jugador y puente entre el modelo (../../js) y la
// presentación (mundo 3D, interfaz y sonido). El modelo no se toca: acá solo se lo consulta y se le piden acciones.
// Etapa 1 «decidir sabiendo» (16-11-2026): cada compra muestra qué cuesta, qué deja por día y en cuánto se paga (estimador.js); el
// reloj se frena mientras se decide; los carteles van de a uno; a las 6:00 sale el parte de la mañana; a los 3 días de cada compra,
// el resultado contra lo prometido (libro.js). Los datos de la oficina salen por puente-oficina.js.
import { Vector3 } from 'three';
import * as M from '../../js/modelo.js';
import { AEROPUERTOS, AVIONES, CAPITULOS, ECONOMIA, MISIONES, TRANSBORDO } from '../../js/datos.js';
import { resolverClasificacion } from '../../js/ronda.js';
import { Mundo, aMundo } from './mundo/mundo.js';
import { RADIO_CIUDAD } from './mundo/ciudades.js';
import { COLOR_EMPRESA } from './mundo/aviones.js';
import * as U from './ui/ui.js';
import { icono } from './ui/iconos.js';
import { t, hay, plata, plataSigno, numero, cambiarLengua, fijarTactil, fechaTexto, horaTexto, GLOSARIO } from './ui/textos.js';
import * as A from './audio/audio.js';
import { Tandas, avionMasBarato, costoDecision, firmaEstado, claveDecision, redondo } from './estimador.js';
import * as Libro from './libro.js';
import * as Puente from './puente-oficina.js';
import './oficina/conectar.js';
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
// vel: 0 (pausa), 0,5 (tranquila: la de una partida nueva), 1 (normal) o 3 (rápida). velElegida: la que vuelve al sacar la pausa.
let vel = 0.5, velElegida = 0.5, acc = 0, ultimo = performance.now();
let libro = null;                     // el libro de la empresa (historia, promesas, notas): va en el guardado «extra»
// null = el de fábrica (el nombre sale del idioma). estrenada: el jugador ya eligió nombre y color (la oficina lo pide la primera vez)
let empresa = { nombre: null, color: null, estrenada: false };
const COLORES = [['rojo', COLOR_EMPRESA], ['azul', '#27457f'], ['verde', '#2f7d4f'], ['naranja', '#e2762b'], ['celeste', '#3b8fc4'], ['violeta', '#6a4fa3'], ['oro', '#c9982b'], ['gris', '#6d7887']];
// las cuentas de las tarjetas, de a ratitos: una tanda por cuadro (pasoCuadro) y otra cada tanto entre cuadros (no traban la pantalla)
const tandas = new Tandas({ programar: (f) => setTimeout(f, 12) });
let partePend = null;                 // el parte de la mañana que espera su turno: { n, candidatos }
let oficinaAbierta = false;
const cobros = new Map();             // ciudad → { monto, hasta }: las cifras de cobro, una por ciudad cada tanto
let sel = null;                       // { tipo: 'ciudad'|'ruta'|'avion'|'hangar', id, desde?, ruta? }
let marcaBoton = null;                // selector del botón que hay que tocar (late y lleva el dedo)
let guia = { paso: null, hecha: false, t: 0 };
let vistos = {};                      // momentos ya mostrados (cada concepto se explica una vez)
let premiosPendientes = 0;            // premios ya acreditados en el modelo pero todavía no festejados
let sug = null, pasoMision = null, ultimaSug = 0, ultimaUI = 0, ultimoGuardado = 0, guardarPronto = false;   // sug: lo que aconseja el modelo; pasoMision: lo que pide la misión
let eraNoche = false, ocultoDesde = null, errores = 0;
const cola = [];                      // carteles en fila: uno por vez (ver «carteles en fila»)
let enPantalla = null;                // el cartel que se ve ahora: { tipo, hasta } (la decisión no tiene «hasta»: espera la respuesta)
let ayudaNoche = null;                // la guía de la primera noche: { ruta, hasta }

// ───────────── guardado ─────────────
function guardar() {
  guardarPronto = false; ultimoGuardado = performance.now();
  if (!s || escena !== 'juego') return;
  try { almacen.set(CLAVE, M.guardar(s)); almacen.set(CLAVE_EXTRA, JSON.stringify({ v: 3, guia: guia.hecha, vistos, vel: velElegida, empresa, libro })); } catch { /* sin almacenamiento */ }
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
// Decidir sin apuro: con un panel abierto o con la pregunta de la base en pantalla, el reloj espera.
const decidiendo = () => !!sel || enPantalla?.tipo === 'decision';
const empresaActual = () => ({ nombre: empresa.nombre ?? t('empresaDef'), color: empresa.color ?? COLOR_EMPRESA, estrenada: !!empresa.estrenada });

// ───────────── arranque ─────────────
function avance(p) { const b = $('#carga-avance'); if (b) b.style.width = `${p}%`; }
async function arrancar() {
  avance(15);
  fijarTactil(matchMedia('(pointer: coarse)').matches);
  U.montar();
  U.escuchar(accion);
  U.frenarRueda();
  const mundoJson = await (await fetch('activos/mundo.json')).json();
  avance(35);
  mundo = new Mundo(document.querySelector('#mundo'));
  await mundo.iniciar({ alturas: urlAlturas, suelo: urlSuelo, costa: urlCosta }, mundoJson, AEROPUERTOS, M.HUB);
  avance(80);
  avance(95);
  mundo.alEvento = eventoMundo;
  mundo.alPing = (ruta, i) => { A.sonar('faro', i); };
  entrada();
  addEventListener('resize', () => mundo.medir());
  document.addEventListener('visibilitychange', visibilidad);
  addEventListener('pagehide', guardar);
  addEventListener('keydown', tecla);
  const guardado = q.get('nuevo') ? null : leerGuardado();
  const extra = guardado ? (() => { try { return JSON.parse(almacen.get(CLAVE_EXTRA) ?? 'null') ?? {}; } catch { return {}; } })() : {};
  s = guardado ?? M.nuevoEstado(q.get('semilla') ? +q.get('semilla') : Date.now() % 1e9);
  M.tomarEventos(s);
  if (guardado) { guia.hecha = !!extra.guia || s.rutas.length > 0; vistos = extra.vistos ?? {}; }
  // una partida guardada vuelve con la velocidad que eligió el jugador; una nueva (o una de antes de las tres velocidades, que
  // no guardaba una elección de verdad) arranca tranquila
  velElegida = vel = extra.v >= 2 && [0.5, 1, 3].includes(extra.vel) ? extra.vel : 0.5;
  // el libro y la empresa viven en el guardado «extra»: si faltan (partida de antes) o no sirven, se empieza de hoy sin romper nada
  libro = (() => { try { return Libro.abrir(extra.libro, s); } catch { return Libro.nuevo(s); } })();
  fijarEmpresa(extra.empresa && typeof extra.empresa === 'object' ? extra.empresa : {}, false);
  empresa.estrenada = !!extra.empresa?.estrenada;
  tandas.alTerminar = cuentaLista;
  Puente.conectarJuego({ datos: datosOficina, accion: accionOficina, alAbrir: () => { oficinaAbierta = true; guardar(); }, alCerrar: () => { oficinaAbierta = false; ultimo = performance.now(); }, alConectar: () => { ultimaUI = 0; } });
  if (empresa.estrenada) vistos.oficina = 1;            // quien ya entró a su oficina no necesita que se la presenten
  mundo.limites(ciudadesDeLaEpoca());
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
    s = M.nuevoEstado(q.get('semilla') ? +q.get('semilla') : Date.now() % 1e9); M.tomarEventos(s);
    guia = { paso: null, hecha: false, t: 0 }; vistos = {}; sel = null; premiosPendientes = 0; U.reiniciarPlata();
    libro = Libro.nuevo(s); empresa = { nombre: null, color: null, estrenada: false }; fijarEmpresa({}, false); vel = velElegida = 0.5; partePend = null; cola.length = 0; enPantalla = null; cobros.clear(); U.cartel(null); U.momento(null); pasoFijo = null; ayudaNoche = null;
    mundo.limites(ciudadesDeLaEpoca()); mundo.pedida();
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
  // la primera frase hasta la mitad y la segunda hasta el final de la toma, sin hueco en el medio
  const tc = mundo.cine?.t ?? 99, cual = tc < 0.25 ? 0 : tc < 4.7 ? 1 : tc < 10.05 ? 2 : 0;
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
// «Ver mi red»: la pide el jugador (o el juego mientras la cámara todavía es suya). Siempre deja la cámara sana: sin giro, sin
// zoom de lente, con toda la red adentro.
function verRed(suave = true) {
  mundo.seguir(null);
  mundo.encuadrar(puntosRed(), { suave, margen: 1.5, azimut: 0, abajo: innerWidth < 640 ? 0.12 : 0, distMin: 5.4 });
}
// Todas las ciudades de la época (también las que todavía no se abrieron): hasta ahí se puede alejar la cámara.
function ciudadesDeLaEpoca() { return AEROPUERTOS.filter((a) => a.cap <= s.cap).map((a) => { const [x, z] = aMundo(a.lon, a.lat); return { x, z }; }); }
// Lo que el juego quiere mostrar por su cuenta (una misión cumplida, ciudades nuevas, el primer vuelo de noche): solo si el
// jugador no tomó la cámara. Desde que la mueve o acerca, es suya hasta que pida «Ver mi red» o «Siguiente paso».
const camaraLibre = () => !mundo.propia;

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
      // el primer cobro: primero el festejo de la misión y recién después esta frase (van en fila: nunca dos carteles a la vez)
      U.burbuja(null);
      if (!cola.some((f) => f.tipo === 'guia')) cola.push({ tipo: 'guia', paso: 'cobro' });
      return;
    case 'sigue':
      mundo.seguir(null); marcaBoton = '#paso'; // el dedo se apoya en «Siguiente paso»: la primera vez se ve que es un botón
      U.burbuja(t('g_sigue'), 'mision');
      if (camaraLibre()) verRed();
      break;
    default: break;
  }
  A.sonar('momento');
}
function terminarGuia() {
  guia.hecha = true; guia.paso = null; marcaBoton = null;
  mundo.enfocar(null, false); mundo.marcar(null); U.burbuja(null);
  if (enPantalla?.tipo === 'guia') enPantalla = null;
  for (let i = cola.length - 1; i >= 0; i--) if (cola[i].tipo === 'guia') cola.splice(i, 1);
  guardarPronto = true;
}

// ───────────── momentos (cada concepto, una vez) ─────────────
// No se muestran en el acto: esperan su turno en la fila (nunca tapan ni reemplazan una decisión o un festejo).
// firme: una novedad que no se pierde aunque espere (avión nuevo, ciudades nuevas); las demás caducan si esperan mucho.
// urgente: es la respuesta a algo que la persona acaba de tocar (pasa antes que los demás avisos). vale(): si deja de ser cierto
// mientras espera, no se muestra.
function momento(clave, m, siempre = false, { firme = false, urgente = false, vale = null } = {}) {
  if (!siempre && vistos[clave]) return false;
  if (guiando() && !['sigue'].includes(guia.paso)) return false;
  vistos[clave] = 1;
  if (cola.some((f) => f.tipo === 'momento' && f.clave === clave)) return false;
  cola.push({ tipo: 'momento', clave, m, firme, urgente, vale, t: performance.now() });
  return true;
}

// ───────────── eventos del modelo ─────────────
// Lo que deja una acción del jugador (no un paso del reloj): se atiende y también se anota en el libro. Un premio que entra en el
// mismo instante de una compra (el avión que cumple la misión) es un premio: no se descuenta de lo comprado.
function trasAccion() { const ev = M.tomarEventos(s); Libro.anotarEventos(libro, s, ev); atender(ev); }
const _tmp = new Vector3();
function pantallaDe(idCiudad, alto = 0.55) {
  const c = mundo.ciudades.get(idCiudad);
  if (!c) return null;
  const p = mundo.aPantalla(_tmp.copy(c.pos).setY(c.pos.y + RADIO_CIUDAD * mundo.S * alto), {});
  return p.visible ? p : null;
}
// Un aviso corto (abajo a la izquierda). No se muestra en el acto: espera su turno en la fila, como todos los carteles.
function aviso(html, opciones = {}) { cola.push({ tipo: 'aviso', html, ...opciones, t: performance.now() }); }
// Las cifras de cobro se agrupan por ciudad: la primera sale en el acto y las que llegan a la misma ciudad en los segundos
// siguientes se suman en una sola (con muchos aviones no se pierde plata de vista: se ve el total).
const VENTANA_COBRO = 2600;
function cobrar(ap, monto, ahora = performance.now()) {
  const c = cobros.get(ap);
  if (c && ahora < c.hasta) { c.monto += monto; return; }
  cobros.set(ap, { monto: 0, hasta: ahora + VENTANA_COBRO });
  mostrarCobro(ap, monto);
}
function mostrarCobro(ap, monto) {
  const p = pantallaDe(ap);
  if (!p) return;
  U.cifra({ x: Math.max(64, Math.min(innerWidth - 64, p.x)), y: Math.max(90, p.y - 26) }, `+${plata(monto)}`, 'bueno');   // entera, aunque la ciudad esté en el borde
  U.monedas(p, Math.max(3, Math.min(8, Math.round(monto / 500))));
  A.sonar('cobro');
  const c = mundo.ciudades.get(ap); if (c) mundo.chispas(c.pos.clone().setY(c.pos.y + 0.12 * mundo.S), 14);
}
function cobrosPendientes(ahora) {
  for (const [ap, c] of cobros) {
    if (ahora < c.hasta) continue;
    if (c.monto > 0) { const m = c.monto; c.monto = 0; c.hasta = ahora + VENTANA_COBRO; mostrarCobro(ap, m); } else cobros.delete(ap);
  }
}
function atender(eventos) {
  if (!eventos?.length) return;
  const pocos = s.aviones.length <= 14;
  for (const e of eventos) {
    switch (e.tipo) {
      case 'aterrizaje': {
        const p = pantallaDe(e.ap);
        if (e.ingreso > 0) cobrar(e.ap, e.ingreso);
        else if (e.netoViaje < -50 && p && pocos && e.ingreso === 0 && s.stats.vuelos > 3) {
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
      case 'contrato': premiosPendientes += e.premio ?? 0; cola.push({ tipo: 'encargo', premio: e.premio ?? 0, o: e.o, d: e.d }); break;
      case 'contratoVencido': aviso(t('encargoVencido'), { ico: 'encargo', tono: 'malo' }); break;
      case 'contratosNuevos': momento('encargo', { ico: 'encargo', titulo: t('mo_encargo_t'), texto: t('mo_encargo') }); break;
      case 'pronostico': momento('tormenta', { ico: 'tormenta', titulo: t('mo_tormenta_t'), texto: t('mo_tormenta', { lista: (e.zona ?? []).slice(0, 3).map((z) => M.AP[z].nombre).join(', ') }) }, true); break;
      case 'tormentaFin': aviso(t('mo_tormentaFin'), { ico: 'sol', tono: 'bueno' }); break;
      case 'avisoNoche': momento('tarde', { ico: 'luna', titulo: t('mo_tarde_t'), texto: t('mo_tarde') }, false, { vale: () => !M.esNoche(s) }); break;
      case 'primeraNoche': primeraNoche(e); break;
      case 'primerasBalizas': { momento('faros', { ico: 'faro', titulo: t('mo_faros_t'), texto: t('mo_faros'), dura: 7000 }, true, { firme: true, urgente: true }); const r = rutaDe(e.ruta); if (r && camaraLibre()) verCiudades([r.a, r.b]); break; }
      case 'primerDespegueNoche': momento('despegueNoche', { ico: 'luna', titulo: t('mo_despegueNoche_t'), texto: t('mo_despegueNoche') }, true); if (camaraLibre()) mundo.seguir(e.avion); break;
      case 'ventaForzada': aviso(t('mo_venta', { monto: plata(e.monto ?? 0) }), { ico: 'moneda', tono: 'malo', dura: 6000, firme: true }); A.sonar('error'); break;
      case 'clasificacion': ofrecerOrden(); break;
      case 'clasificacionHecha': aviso(esc(t(e.sola ? 'mo_ordenadoSola' : 'mo_ordenado', { pct: `${numero(e.pct * 100)}%`, monto: plata(e.ingreso) })), { ico: 'base', tono: 'bueno', dura: 7000, firme: true }); break;
      case 'rondaDisponible': aviso(t('mo_ronda'), { ico: 'luna', tono: 'noche' }); break;
      case 'resultadoNoche': aviso(t('mo_rondaFin', { pct: `${numero((e.pctPrimeraHora ?? 0) * 100)}%` }), { ico: 'base', tono: 'noche', dura: 6000 }); break;
      default: break;
    }
  }
  if (!vistos.base && (s.stats.transbordos[M.HUB] ?? 0) > 0) momento('base', { ico: 'base', titulo: t('mo_base_t'), texto: t('mo_base'), dura: 8000 });
}
// La pregunta de la base. Cada opción dice qué pasa si se la elige (lo calcula el modelo: es lo mismo que va a pasar).
function ofrecerOrden(yaMismo = false) {
  if (M.clasificacionActual(s)?.estado !== 'oferta') return;
  if (enPantalla?.tipo === 'decision') return;
  if (!cola.some((f) => f.tipo === 'decision')) cola.push({ tipo: 'decision' });
  // si la pidió el jugador («Siguiente paso»), una tarjeta de aviso no la hace esperar
  if (yaMismo && (enPantalla?.tipo === 'momento' || enPantalla?.tipo === 'aviso')) { U.momento(null); U.limpiarAvisos(); enPantalla = null; }
}
function mostrarOrden() {
  const c = M.clasificacionActual(s), e = s.clasif.escena;
  const opcion = (o) => {
    const r = resolverClasificacion(e, o.id);
    const tarde = r.radios.filter((x) => x.aTiempo < x.sacas).map((x) => M.AP[x.id].nombre);
    return `<button class="opcion" data-accion="ordenar" data-id="${o.id}"><b>${esc(t('ord_primero', { ciudad: o.nombre }))}</b><small>${esc(tarde.length ? t('ord_tarde', { ciudad: tarde.join(` ${t('y')} `) }) : t('ord_todas'))}</small>${icono('flecha', 'fl')}</button>`;
  };
  U.momento({ ico: 'base', titulo: t('mo_ordenar_t'), texto: esc(t('mo_ordenar')), elige: c.opciones.map(opcion).join('') });
  A.sonar('momento');
}

// La primera noche con aviones dormidos lleva a la acción con el patrón de la guía: una frase y el dedo sobre «Siguiente paso»,
// que propone los faros de esa ruta. El juego no abre el panel por su cuenta (en la prueba a ciegas del 16-11-2026 se abrió justo
// cuando la persona tocaba «−» para alejar): lo abre el jugador al tocar el paso, y ahí el dedo pasa a «Poner faros». Si la plata
// no alcanza para los faros, queda la tarjeta que explica qué pasa.
function rutaParaFaros(aviones = null) {
  const dormidas = new Set((aviones ?? s.aviones.map((a) => a.id)).map((id) => s.aviones.find((a) => a.id === id)?.ruta).filter(Boolean));
  return s.rutas.filter((r) => !r.balizas && dormidas.has(r.id)).sort((a, b) => M.costoBalizas(a, s) - M.costoBalizas(b, s))[0] ?? null;
}
function primeraNoche(e) {
  if (guiando() && guia.paso !== 'sigue') return;
  vistos.noche = 1;
  const r = rutaParaFaros(e.aviones);
  if (!r) return;
  const costo = M.costoBalizas(r, s);
  if (s.dinero >= costo) cola.push({ tipo: 'guiaNoche', ruta: r.id });
  else cola.push({ tipo: 'momento', clave: 'noche', firme: true, t: performance.now(), m: { ico: 'dormido', titulo: t('mo_noche_t'), texto: esc(t('mo_nocheFalta', { monto: plata(costo - s.dinero) })), dura: 8000 } });
}
function guiaNocheVale(id) { const r = rutaDe(id); return !!r && !r.balizas && M.esNoche(s) && s.aviones.some((a) => a.ruta === id) && s.dinero >= M.costoBalizas(r, s); }
function abrirGuiaNoche(f) {
  if (guia.paso === 'sigue') terminarGuia();
  // (la frase se queda 25 s: el reloj sigue corriendo y los demás carteles esperan detrás; si el jugador toca el paso, 40 s más)
  ayudaNoche = { ruta: f.ruta, hasta: performance.now() + 25000 };
  marcarBoton('#paso', 25000);
  U.burbuja(t('g_noche'), 'faro');
  ultimaSug = 0; pasoFijo = null;
  A.sonar('momento');
}
// sigue mientras los faros sigan haciendo falta y el jugador no se haya ido a mirar otra cosa (otro panel)
const guiaNocheSigue = () => !!ayudaNoche && guiaNocheVale(ayudaNoche.ruta) && (!sel || (sel.tipo === 'ruta' && sel.id === ayudaNoche.ruta)) && performance.now() < ayudaNoche.hasta;
function cerrarGuiaNoche() {
  if (!ayudaNoche) return;
  ayudaNoche = null; U.burbuja(null); pasoFijo = null;
  if (marcaBoton === '[data-accion="faros"]' || marcaBoton === '#paso') marcaBoton = null;
}

// ───────────── carteles en fila ─────────────
// Nunca dos carteles importantes a la vez. Hay cuatro clases y cada una espera a que la anterior termine:
//   · el festejo de una misión o de un encargo (el cartel grande);
//   · la decisión de la base (se queda hasta que se responde: nada la tapa ni la reemplaza);
//   · la guía de la primera noche;
//   · las tarjetas de «momento» (una imagen y una frase).
// Pasa primero lo que más importa: una misión cumplida no espera detrás de un aviso, y siempre se queda su tiempo entero en
// pantalla, a cualquier velocidad del juego (el reloj de los carteles es el de la persona, no el del juego).
// Desde la etapa 1 la fila es una sola para todo lo que tiene texto: también los avisos cortos, las frases de la guía, el parte de
// la mañana y el resultado de una compra. Nunca hay dos a la vez en pantalla (medido el 15-11-2026: había dos o más durante 87 s
// de cada 10 minutos).
const TURNO = { mision: 0, encargo: 0, guia: 0.5, capitulo: 1, parte: 1.5, decision: 2, guiaNoche: 3, avionNuevo: 4, ciudades: 4, momento: 4, resultado: 4.5, aviso: 5 };
// Una misión cumplida no se pierde: su cartel se queda hasta que se lo toca («Seguir») o, si nadie lo toca, 9 segundos (alcanza
// para leerlo; en la prueba a ciegas del 16-11-2026 duraba 3,6 s y pasó sin verse). Lo que sigue espera su turno.
const DURA_MISION = 9000, TOQUE_MIN = 900, DURA_ENCARGO = 5200, CADUCA = 30000;
const RESPIRO = 420;                  // entre un cartel y el siguiente: lo que tarda el que se va en apagarse, y un aire
let respiro = 0;
const enFestejo = () => (enPantalla?.tipo === 'mision' ? enPantalla.f : null);
function avanzarCola() {
  const ahora = performance.now();
  if (enPantalla) {
    if (enPantalla.tipo === 'decision') {
      // sigue abierta mientras el modelo espere la respuesta (si pasan 6 horas de juego, la base resuelve sola y la tarjeta se va)
      if (M.clasificacionActual(s)?.estado === 'oferta') { if (!U.eligiendo()) mostrarOrden(); return; }
      if (U.eligiendo()) U.momento(null);
      enPantalla = null; ultimaSug = 0;
    } else if (enPantalla.tipo === 'guiaNoche') {
      if (guiaNocheSigue()) return;
      cerrarGuiaNoche(); enPantalla = null;
    } else if (enPantalla.tipo === 'parte') {
      if (U.ventanaAbierta()) return;
      enPantalla = null;
    } else {
      // un festejo o una decisión que esperan acortan la tarjeta de aviso que está en pantalla (después de 2,5 s)
      // (el resultado de una compra no: lleva dos números para leer y se queda su tiempo entero)
      const apuro = (enPantalla.tipo === 'momento' || enPantalla.tipo === 'aviso') && !enPantalla.firme && ahora - enPantalla.desde > 2500 && cola.some((f) => TURNO[f.tipo] < TURNO.guiaNoche);
      if (ahora < enPantalla.hasta && !apuro) return;
      respiro = ahora + RESPIRO;
      if (enPantalla.tipo === 'momento') U.momento(null);
      if (enPantalla.tipo === 'aviso') U.limpiarAvisos();
      if (enPantalla.tipo === 'mision') U.cartel(null);
      if (enPantalla.tipo === 'encargo') { enPantalla.cobrar?.(); U.momento(null); }
      if (enPantalla.tipo === 'guia') {
        // la frase del primer cobro deja paso a la que señala «Siguiente paso»; esa, a la guía terminada
        if (enPantalla.paso === 'cobro' && guia.paso === 'cobro') { pasoGuia('sigue'); enPantalla = { tipo: 'guia', paso: 'sigue', desde: ahora, hasta: ahora + 9000 }; return; }
        if (guia.paso === 'sigue') terminarGuia();
        U.burbuja(null);
      }
      enPantalla = null;
    }
  }
  if (!cola.length || U.ventanaAbierta() || oficinaAbierta) return;
  if (guia.paso === 'vuela' || enPausaGuia()) return; // la primera misión se festeja cuando llega el primer cobro
  if (ahora < respiro) return;                         // el cartel anterior todavía se está yendo
  const turnoDe = (f) => f.turno ?? (f.urgente ? 2.5 : TURNO[f.tipo]);
  let i = 0;
  for (let k = 1; k < cola.length; k++) if (turnoDe(cola[k]) < turnoDe(cola[i])) i = k;
  const f = cola[i];
  if (f.tipo === 'guiaNoche') {
    if (!guiaNocheVale(f.ruta)) { cola.splice(i, 1); return; }
    if (sel) return; // hay un panel abierto: espera a que se cierre (no se le saca de la mano lo que está mirando)
  }
  // el parte de la mañana espera a que estén hechas las cuentas de su consejo (unos instantes; como mucho 5 s)
  if (f.tipo === 'parte' && !parteListo(f, ahora)) return;
  // con un panel abierto se está decidiendo: lo que no es urgente espera a que se cierre (el reloj está frenado: no se pierde nada)
  if (sel && ['aviso', 'resultado', 'momento', 'avionNuevo', 'ciudades', 'parte'].includes(f.tipo) && !f.urgente) return;
  cola.splice(i, 1);
  const turno = (tipo, ms, extra = {}) => { enPantalla = { tipo, desde: ahora, hasta: ahora + ms, ...extra }; };
  switch (f.tipo) {
    case 'mision': {
      const m = MISIONES.find((x) => x.id === f.id), orden = MISIONES.filter((x) => x.cap === m.cap).indexOf(m) + 1;
      A.sonar('mision');
      const ciudad = mundo.ciudades.get(m.b ?? m.ciudad ?? M.HUB) ?? mundo.ciudades.get(M.HUB);
      mundo.papelitos(ciudad.pos, 70);
      U.cartel(t('misionCumplida'), `${t('mision')} ${orden} · ${textoMision(m)}`, f.premio, () => { premiosPendientes = Math.max(0, premiosPendientes - f.premio); A.sonar('cobro'); }, { seguir: t('seguirJugando') });
      turno('mision', DURA_MISION, { f });
      // la red creció: se muestra entera, salvo que el jugador tenga la cámara donde la quiere
      setTimeout(() => { if (camaraLibre() && guia.hecha && !sel) verRed(); }, 3000);
      break;
    }
    case 'encargo': {
      // si se juntaron varios encargos cumplidos (al volver de una ausencia), se festejan en un solo cartel
      const otros = cola.filter((x) => x.tipo === 'encargo');
      for (const x of otros) cola.splice(cola.indexOf(x), 1);
      const n = 1 + otros.length, premio = f.premio + otros.reduce((a, x) => a + x.premio, 0);
      A.sonar('mision');
      // el encargo cumplido va en su tarjeta, arriba y con fondo: no pisa los rótulos de las ciudades ni las cifras que flotan
      // (antes era un cartel sin fondo en el medio del mapa)
      const cual = n === 1 && M.AP[f.o] && M.AP[f.d] ? `<span class="de">${esc(t('encargoDe', { a: M.AP[f.o].nombre, b: M.AP[f.d].nombre }))}</span>` : '';
      U.momento({ ico: 'encargo', clase: 'premio', titulo: n > 1 ? t('encargosCumplidos', { n }) : t('encargoCumplido'), texto: `${cual}<b class="prm">${icono('moneda')}+${plata(premio)}</b>`, dura: DURA_ENCARGO + 600 });
      let cobrado = false;
      const cobrar = () => { if (cobrado) return; cobrado = true; premiosPendientes = Math.max(0, premiosPendientes - premio); A.sonar('cobro'); };
      setTimeout(() => { const r = $('#momento .prm')?.getBoundingClientRect(); if (cobrado || !r || !r.width) { cobrar(); return; } U.monedas({ x: r.left + 14, y: r.top + r.height / 2 }, Math.max(4, Math.min(8, Math.round(premio / 400))), cobrar); }, 900);
      turno('encargo', DURA_ENCARGO, { cobrar }); break;
    }
    case 'decision':
      if (M.clasificacionActual(s)?.estado !== 'oferta') break;
      mostrarOrden(); enPantalla = { tipo: 'decision', desde: ahora }; ultimaSug = 0; break;
    case 'guiaNoche': abrirGuiaNoche(f); enPantalla = { tipo: 'guiaNoche', desde: ahora }; break;
    case 'guia':
      if (guia.paso !== f.paso) break;
      U.burbuja(t('g_cobro'), 'moneda'); A.sonar('momento');
      turno('guia', 5200, { paso: 'cobro' }); break;
    case 'parte': mostrarParte(f); enPantalla = { tipo: 'parte', desde: ahora }; break;
    case 'resultado':
      if (ahora - f.t > CADUCA * 2) break;                 // esperó demasiado: queda en la bandeja de la oficina
      mostrarResultado(f.nota); turno('momento', 9250, { firme: true }); break;
    case 'aviso':
      if (!f.firme && ahora - f.t > CADUCA) break;
      U.aviso(f.html, { ico: f.ico, tono: f.tono, dura: f.dura ?? 4200 });
      turno('aviso', (f.dura ?? 4200) + 350, { clave: f.clave }); break;
    case 'momento':
      if ((!f.firme && ahora - f.t > CADUCA) || (f.vale && !f.vale())) break; // esperó tanto que ya no viene a cuento
      U.momento(f.m); A.sonar('momento'); f.alMostrar?.();
      turno('momento', (f.m.dura ?? 6500) + 250, { firme: !!f.quieto }); break;       // quieto: un festejo que espera no la acorta
    case 'avionNuevo': {
      const a = M.AV[f.avion];
      U.momento({ img: retratos[a.id], titulo: t('avionNuevo'), texto: `<b>${esc(a.nombre)}.</b> ${esc(t(`a_${a.id}`))}`, dura: 7000 }); A.sonar('momento');
      turno('momento', 7250); break;
    }
    case 'ciudades': {
      const ids = [...new Set(f.ciudades)];
      U.momento({ ico: 'ruta', titulo: t('mo_ciudades_t'), texto: esc(t('mo_ciudades', { lista: ids.map((c) => M.AP[c].nombre).join(', ') })), dura: 7000 }); A.sonar('momento');
      if (camaraLibre() && !sel) verCiudades([...M.nodosRed(s), ...ids]);
      turno('momento', 7250); break;
    }
    case 'capitulo': finCapitulo(); turno('capitulo', 600); break;
    default: break;
  }
}
function verCiudades(ids) {
  const ps = ids.map((id) => mundo.ciudades.get(id)?.pos).filter(Boolean);
  if (ps.length) { mundo.seguir(null); mundo.encuadrar(ps, { margen: 1.5, azimut: 0, abajo: innerWidth < 640 ? 0.12 : 0, distMin: 5.4 }); }
}

// ───────────── el libro: jornada, parte de la mañana y resultado contra lo prometido ─────────────
const uiLibro = { t, plata, numero, fecha: (ms) => fechaTexto(new Date(ms)), hora: (ms) => horaTexto(new Date(ms)) };
// Después de cada paso del modelo: el libro anota lo que pasó; a las 6:00 cierra el día y arma el parte; a los 3 días de cada
// compra deja la nota con lo prometido y lo que pasó.
function anotarPaso(eventos) {
  const c = Libro.alPaso(libro, s, eventos);
  if (c?.cerro != null) prepararParte(c.cerro);
  for (const nota of Libro.revisarPromesas(libro, s)) llegoResultado(nota);
}
// El parte sale a las 6:00 de cada día, pero nunca antes del primer vuelo ni en medio del primer minuto guiado.
function prepararParte(n) {
  if (!(s.stats.vuelos > 0) || !guia.hecha) return;
  const p = Libro.parte(libro, s, n);
  if (!p) return;
  // el consejo: los que proponen una compra se comprueban con la cuenta verdadera antes de decirse (los demás son un dato de ayer)
  const candidatos = [p.consejo, ...consejosConCuenta(p)];
  for (const c of candidatos) if (c.decision) tandas.pedir(s, c.decision, { urgente: true });
  partePend = { n, p, candidatos, t: performance.now(), firma: firmaEstado(s) };
  cola.push({ tipo: 'parte', n });
}
// Consejos que llevan una compra detrás, en orden: se dice el primero cuya cuenta da bien (deja plata y se paga en 10 días o menos).
function consejosConCuenta(p) {
  const out = [], conAvion = p.rutas.filter((f) => f.aviones > 0);
  if (s.cap === 1 && s.flags?.primeraNoche) {
    const dormidas = conAvion.filter((f) => !f.luces && s.aviones.some((a) => a.ruta === f.id && !M.AV[a.tipo].nocturno)).sort((x, y) => y.deja - x.deja);
    if (dormidas.length) out.push({ clave: 'cj_duermen', ruta: dormidas[0].id, n: s.aviones.filter((a) => !M.AV[a.tipo].nocturno && dormidas.some((f) => f.id === a.ruta)).length, decision: { tipo: 'faros', ruta: dormidas[0].id } });
  }
  const total = p.dia.aTiempo + p.dia.tarde;
  if (total >= 20 && p.dia.tarde / total >= 0.15 && M.costoTransbordo(s, M.HUB) != null) out.push({ clave: 'cj_tardeCola', de: Math.max(2, Math.round(total / Math.max(1, p.dia.tarde))), decision: { tipo: 'correo', ap: M.HUB } });
  for (const f of [...conAvion].filter((x) => x.llenado >= 0.85 && x.vuelos >= 3).sort((x, y) => y.deja - x.deja).slice(0, 2)) {
    const r = rutaDe(f.id), tp = r && avionMasBarato(s, r.km);
    if (tp) out.push({ clave: 'cj_llena', ruta: f.id, pct: Math.round(f.llenado * 100), decision: { tipo: 'avion', id: tp.id, ruta: f.id } });
  }
  return out;
}
function parteListo(f, ahora) {
  if (!partePend || partePend.n !== f.n) return true;
  if (ahora - partePend.t > 5000) return true;
  return partePend.candidatos.every((c) => !c.decision || tandas.listo(s, c.decision));
}
// Lo que deja una compra, dicho como consejo: «unos $ 14.000» (o el rango, si la cuenta es incierta). Es la misma cuenta que
// muestra la tarjeta, hecha a la hora del parte; la tarjeta la muestra al peso.
const dejaEnRedondo = (e) => (e.incierto ? t('entre', { a: plata(redondo(e.min)), b: plata(redondo(e.max)) }) : t('unos', { monto: plata(redondo(e.dejaDia)) }));
function elegirConsejo() {
  const [base, ...conCuenta] = partePend.candidatos;
  // lo que hay que arreglar va primero (una ruta sin avión o que pierde); después, la mejor compra comprobada; si no, el dato del día
  if (['cj_sinAvion', 'cj_sobraAvion', 'cj_saleVacio', 'cj_pierde', 'cj_empezar'].includes(base.clave)) return base;
  let mejor = null;
  for (const c of conCuenta) {
    const e = tandas.listo(s, c.decision, partePend.firma);    // la cuenta hecha a las 6:00, con el estado de ese momento
    if (!e || e.imposible || !(e.dejaDia >= 300) || e.recuperoDias == null || e.recuperoDias > 10) continue;
    if (!mejor || e.recuperoDias < mejor.e.recuperoDias) mejor = { c, e };
  }
  if (mejor) return { ...mejor.c, deja: dejaEnRedondo(mejor.e), dejaExacto: mejor.e.dejaDia, costo: mejor.e.costo };
  return ['cj_duermen', 'cj_tardeCola', 'cj_llena'].includes(base.clave) ? { clave: partePend.p.quedo > 0 ? (partePend.p.rutas.filter((f) => f.aviones > 0).length === 1 ? 'cj_bien1' : 'cj_bien') : 'cj_flojo', n: partePend.p.rutas.filter((f) => f.aviones > 0).length } : base;
}
function textoConsejo(c) {
  const r = c.ruta ? rutaDe(c.ruta) : null;
  const clave = c.clave === 'cj_bien' && c.n === 1 ? 'cj_bien1' : c.clave === 'cj_duermen' && c.n === 1 ? 'cj_duerme1' : c.clave;
  return t(clave, { ruta: r ? tituloRuta(r) : '', pct: c.pct ?? '', monto: c.monto != null ? plata(c.monto) : '', n: c.n ?? '', de: c.de ?? '', costo: c.costo != null ? plata(c.costo) : '', deja: c.deja ?? '' });
}
// La caja del parte, a la vista y en palabras: lo que había, lo que quedó de operar, lo comprado, los premios y lo que hay. La suma
// da exacto (Libro.cierreCaja); lo que no hubo (compras, premios, ventas) no aparece.
function cajaDelParte(p) {
  const c = p.cierre;
  if (!c) return '';                                   // un día de un guardado de antes: no se sabe con cuánto empezó
  const paso = (k, v, clase = '') => `<span class="${clase}"><small>${esc(t(k))}</small><b>${v}</b></span>`;
  // (si se compró algo después de las 6:00, la caja de ahora ya es otra: se dice «a las 6»)
  const ahora = Math.round(s.dinero) === c.caja;
  return `<div class="parte-caja">${paso(p.dia.n === 1 ? 'pc_empezaste' : 'pc_ayer', plata(c.antes))}${paso('pc_quedo', plataSigno(c.quedo), c.quedo >= 0 ? 'mas' : 'menos')}${c.compras ? paso('pc_compraste', plata(-c.compras), 'menos') : ''}${c.premios ? paso('pc_premios', plataSigno(c.premios), 'mas') : ''}${c.ventas ? paso('pc_vendiste', plataSigno(c.ventas), 'mas') : ''}${c.otros ? paso('pc_otros', plataSigno(c.otros), c.otros >= 0 ? 'mas' : 'menos') : ''}${paso(ahora ? 'pc_hoy' : 'pc_alas6', plata(c.caja), 'fin')}</div>`;
}
let consejoParte = null;                               // el consejo que mostró el último parte (para «Ver la cuenta»)
function mostrarParte(f) {
  if (!partePend || partePend.n !== f.n) return;
  const { p } = partePend, d = p.dia, consejo = consejoParte = elegirConsejo();
  guardar();                                   // el parte es también el punto de guardado
  const cifra = (k, v, clase) => `<div class="${clase}"><b>${plata(v)}</b><span>${esc(t(k))}</span></div>`;
  const linea = (ico, rot, r, clase) => `<div class="parte-linea">${icono(ico)}<span><small>${esc(t(rot))}</small>${esc(`${M.AP[r.a].nombre} – ${M.AP[r.b].nombre}`)}</span><b class="${clase}">${plataSigno(r.deja)}</b></div>`;
  const total = d.aTiempo + d.tarde;
  A.sonar('dia');
  // el consejo que propone una compra lleva a su tarjeta: con el reloj frenado, la tarjeta muestra la misma cuenta, al peso
  const ver = consejo.decision ? `<button class="mini" data-accion="verConsejo">${esc(t('parte_verCuenta'))}</button>` : '';
  U.ventana({ titulo: t('parte_t', { n: d.n }), clase: 'parte',
    html: `<p class="parte-sub">${esc(fechaTexto(new Date(d.f)))} · ${esc(t('parte_entregas', { n: numero(d.cartas), pct: total ? `${numero(d.aTiempo / total * 100)}%` : '—' }))}</p>
      <div class="cifras tres">${cifra('parte_entro', d.entro, 'gris')}${cifra('parte_salio', d.salio, 'gris')}${cifra('parte_quedo', p.quedo, p.quedo >= 0 ? 'bien' : 'mal')}</div>
      ${cajaDelParte(p)}
      ${p.mejor ? linea('mision', 'parte_mejor', p.mejor, p.mejor.deja >= 0 ? 'bien' : 'mal') : ''}${p.peor ? linea('ruta', 'parte_peor', p.peor, p.peor.deja >= 0 ? '' : 'mal') : ''}
      <div class="consejo${ver ? ' con-boton' : ''}">${icono('ganancia')}<small>${esc(t('parte_consejo'))}</small><span>${esc(textoConsejo(consejo))}</span>${ver}</div>
      <p class="parte-pie"><span>${icono('check')} ${esc(t('parte_guardado'))}</span></p>`,
    botones: [{ txt: t('parte_seguir'), accion: 'cerrarVentana', ico: 'vel1' }, ...(Puente.hayOficina() ? [{ txt: t('parte_oficina'), accion: 'oficina', clase: 'suave', ico: 'oficina' }] : [])],
    alCerrar: () => { partePend = null; ultimo = performance.now(); } });
}
// «Ver la cuenta» del consejo del parte: cierra el parte y abre la tarjeta de esa compra. El reloj no llegó a correr: el estado
// es el de las 6:00 y la tarjeta muestra la misma cuenta que dio el consejo (al peso; el consejo la dice en redondo).
function verConsejo() {
  const c = consejoParte, d = c?.decision;
  U.ventana(null);
  if (!d) return;
  const pedida = { camara: 'pedida' };
  if (d.tipo === 'avion' && rutaDe(d.ruta)) { elegir({ tipo: 'hangar', ruta: d.ruta, id: d.ruta }, pedida); marcarBoton(`[data-accion="comprar"][data-id="${d.id}"]`, 12000); }
  else if (d.tipo === 'faros' && rutaDe(d.ruta)) { elegir({ tipo: 'ruta', id: d.ruta }, pedida); marcarBoton('[data-accion="faros"]', 12000); }
  else if (d.tipo === 'correo') { elegir({ tipo: 'ciudad', id: d.ap }, pedida); marcarBoton('[data-accion="agrandar"]', 12000); }
}
// El resultado de una compra, a los 3 días. Mientras la oficina no esté, va como un cartel de la fila; con la oficina, queda en su
// bandeja y acá solo se avisa.
function llegoResultado(nota) {
  if (Puente.hayOficina()) aviso(esc(t('s_oficina')), { ico: 'oficina', tono: nota.veredicto === 'menos' ? 'malo' : 'bueno', dura: 5000 });
  else cola.push({ tipo: 'resultado', nota, t: performance.now() });
}
function mostrarResultado(nota, dura = 9000) {
  const x = Libro.textoResultado(nota, s, uiLibro);
  U.momento({ ico: 'ganancia', clase: 'res', titulo: x.titulo, dura,
    texto: `<span class="dos"><span><small>${esc(t('res_prometido'))}</small><b>${esc(x.prometido)}</b><i>${esc(t('porDia'))}</i></span><span><small>${esc(t('res_paso'))}</small><b>${esc(x.paso)}</b><i>${esc(t('porDia'))}</i></span></span>
      <span class="veredicto ${nota.veredicto}"><b>${esc(x.veredicto)}</b> ${esc(x.porque)}</span>` });
  A.sonar('momento');
}

// ───────────── la oficina: datos y acciones (puente-oficina.js) ─────────────
function datosOficina() {
  if (!s || !libro) return null;
  return Libro.datosOficina(libro, s, { ui: uiLibro, empresa: empresaActual(), caja: dineroVisible(), camino: (o, d) => Libro.caminoEncargo(s, o, d, t) });
}
// Lo que la oficina le pide al juego. Devuelve { ok } y, si hay que salir de la oficina para verlo, { salir: true }.
function accionOficina(a) {
  switch (a.tipo) {
    case 'nombre': fijarEmpresa({ nombre: a.nombre, color: a.color }); guardar(); return { ok: true, empresa: empresaActual() };
    case 'ir': {
      if (a.a === 'ruta' && rutaDe(a.id)) { elegir({ tipo: 'ruta', id: a.id }, { camara: 'pedida' }); return { ok: true, salir: true }; }
      const av = a.a === 'avion' ? s.aviones.find((x) => x.id === +a.id) : null;
      if (av) { sel = null; mundo.pedida(); mundo.seguir(av.id); mundo.controles.dollyTo(Math.min(mundo.distFinal(), 4), true); return { ok: true, salir: true }; }
      return { ok: false };
    }
    case 'bandeja': {
      Libro.marcarLeido(libro, a.id);
      if (a.accion === 'aceptar' && String(a.id).startsWith('enc-')) { const r = M.aceptarContrato(s, +String(a.id).slice(4)); if (r?.ok) { trasAccion(); guardarPronto = true; } return { ok: !!r?.ok }; }
      if (a.accion === 'ver') { const n = libro.notas.find((x) => x.id === a.id); if (n?.ruta && rutaDe(n.ruta)) { elegir({ tipo: 'ruta', id: n.ruta }, { camara: 'pedida' }); return { ok: true, salir: true }; } }
      return { ok: false };
    }
    case 'leido': Libro.marcarLeido(libro, a.id); guardarPronto = true; return { ok: true };
    default: return { ok: false };
  }
}
// Nombre y color de la empresa. El nombre se limpia (sin signos raros, 24 letras como mucho); el color tiene que ser #rrggbb.
function fijarEmpresa({ nombre, color } = {}, guardarYa = true) {
  if (nombre !== undefined) { const n = String(nombre ?? '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24); empresa.nombre = n && n !== t('empresaDef') ? n : null; }
  // un color que no se entiende no cambia nada; null vuelve al de fábrica
  if (color === null) empresa.color = null;
  else if (typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) empresa.color = color.toLowerCase() !== COLOR_EMPRESA ? color.toLowerCase() : null;
  const e = empresaActual();
  mundo.colorEmpresa(e.color);
  retratos = mundo.retratos(AVIONES.map((a) => a.id));
  U.empresa(e.nombre, e.color);
  if (guardarYa) { empresa.estrenada = true; guardarPronto = true; ultimaUI = 0; }   // lo eligió el jugador (en la oficina o en el menú)
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
  const antes = s.dinero;
  if (!M.avanzarCapitulo(s).ok) return;
  Libro.anotarPremio(libro, s.dinero - antes);          // el premio de pasar de época entra a la caja sin evento: se anota acá
  trasAccion();
  sel = null;
  guardar();
  Libro.alPaso(libro, s, []);                           // la época nueva empieza un día nuevo en el libro
  mundo.limites(ciudadesDeLaEpoca()); mundo.pedida();    // el mapa se agranda: la cámara puede alejarse hasta que entre todo
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
    Libro.alPaso(libro, s, r.eventos ?? []);              // el libro se pone al día (sin parte: ya se muestra «Mientras no estabas»)
    for (const n of Libro.revisarPromesas(libro, s)) llegoResultado(n);
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
// El reloj corre solo si nadie está decidiendo: se frena con un panel abierto, con la pregunta de la base, con una ventana (el
// menú, el parte de la mañana), en la oficina y mientras el parte de la mañana espera su turno.
const corriendo = () => escena === 'juego' && vel > 0 && !U.ventanaAbierta() && !enPausaGuia() && !decidiendo() && !oficinaAbierta && !partePend;
// Lo que se ve en el reloj: 'pausa' (lo frenó el jugador), 'decide' (espera mientras decide) o nada.
const freno = () => (escena !== 'juego' || guia.paso === 'tocar' ? null : vel === 0 ? 'pausa' : decidiendo() || partePend ? 'decide' : null);
function sincronizar(dt) {
  mundo.sincronizar(s, acc, dt, { disponible: (id) => M.ciudadDisponible(s, id), hora: M.hora(s) + acc / 60, minPorSeg: M.MIN_POR_SEG * (velElegida || 1), corriendo: corriendo() });
}
function simular(dt) {
  if (!corriendo()) return;
  acc += dt * M.MIN_POR_SEG * vel;
  let pasos = 0;
  while (acc >= M.PASO && pasos < 30) {
    const ev = M.paso(s);
    atender(ev); anotarPaso(ev);
    acc -= M.PASO; pasos++;
    if (!corriendo()) { acc = 0; break; }            // algo frenó el reloj en este paso (el parte de las 6:00): no se pasa de largo
  }
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
  cobrosPendientes(ahora);
  // las cuentas de las tarjetas: una tanda por cuadro además de las que corren entre cuadros. Con pocos cuadros por segundo las
  // tandas son más largas (hasta la mitad del cuadro): así la tarjeta no tarda más en un equipo lento
  tandas.presupuesto = Math.max(8, Math.min(120, dt * 500));
  if (tandas.pendientes()) tandas.tanda();
  if (ahora - ultimaUI > 220) { refrescar(ahora); ultimaUI = ahora; }
  avanzarCola();
  if (ahora - ultimoGuardado > 15000 || (guardarPronto && ahora - ultimoGuardado > 1500)) guardar();
}
function orbitar(dt) {
  const o = mundo.orbita; o.az += o.vel * dt;
  mundo.controles.setLookAt(o.x + Math.sin(o.az) * Math.sin(o.polar) * o.dist, Math.cos(o.polar) * o.dist, o.z + Math.cos(o.az) * Math.sin(o.polar) * o.dist, o.x, 0, o.z, false);
}

// ───────────── etiquetas del mundo (cada cuadro) ─────────────
// Cada rótulo va con su prioridad: la base primero, después las ciudades de la misión, la elegida, las que tienen cartas esperando,
// las de la red y el resto según su tamaño. ui/rotulos.js los ubica para que no se pisen ni queden debajo de un panel.
const _et = {}, _ec = {};
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
    const centro = mundo.aPantalla(c.pos, _ec), rx = mundo.pxPorUnidad(c.pos) * RADIO_CIUDAD * S;
    const n = Math.round(M.enEspera(s, c.id)), meta = metas.has(c.id) && !M.servido(s, c.id);
    const clase = `etq${c.esBase ? ' base' : ''}${enRed ? '' : ' lejos'}${meta ? ' meta' : ''}`;
    const prio = c.esBase ? 1000 : meta ? 900 : sel?.tipo === 'ciudad' && sel.id === c.id ? 850 : enRed ? (n > 0 ? 700 + Math.min(99, n) : 600) : c.ap.peso;
    lista.push({ id: `c-${c.id}`, x: p.x, y: p.y, cx: centro.x, cy: centro.y, rx, ry: rx * 0.55, prio, pref: c.ap.etq, solido: true, clase,
      html: `${n > 0 && enRed ? `<span class="cta">${icono(s.cap === 1 ? 'carta' : 'cartas')}${numero(n)}</span>` : ''}<span>${nom(c.id)}</span>` });
  }
  for (const n of mundo.vuelos.naves.values()) {
    const elegido = (sel?.tipo === 'avion' && sel.id === n.id) || mundo.siguiendo === n.id;
    const duerme = n.espera === 'noche' || n.espera === 'tormenta';
    if (!elegido && !duerme) continue;
    const p = mundo.aPantalla(_tmp.copy(n.pos).setY(n.pos.y + 0.16 * S), _et);
    if (!p.visible) continue;
    const av = s.aviones.find((a) => a.id === n.id); if (!av) continue;
    const carga = av.carga.reduce((a, x) => a + x.n, 0);
    const centro = mundo.aPantalla(n.pos, _ec), rx = Math.max(10, mundo.pxPorUnidad(n.pos) * 0.12 * S);
    lista.push({ id: `a-${n.id}`, x: p.x, y: p.y, cx: centro.x, cy: centro.y, rx, ry: rx * 0.6, prio: elegido ? 800 : 500, lugares: [0, 3, 4, 6], clase: 'etq-avion',
      html: duerme ? icono(n.espera === 'noche' ? 'dormido' : 'tormenta') : `${icono('carta')}${numero(carga)}` });
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
const caminoEncargo = (o, d) => Libro.caminoEncargo(s, o, d, t);
function objetivos() {
  const out = [];
  // una misión cumplida que todavía no se festejó se sigue mostrando, completa, hasta su cartel
  const pend = enFestejo() ?? cola.find((f) => f.tipo === 'mision');
  const mp = pend && MISIONES.find((x) => x.id === pend.id);
  // (los encargos siguen en su lugar: la columna no cambia de alto durante el festejo)
  // (en el primer vuelo de la guía todavía no: se cumple a la vista cuando el avión llega y cobra)
  const enVuelo = guia.paso === 'vuela' || enPausaGuia();
  if (mp) out.push({ tipo: 'mision', orden: MISIONES.filter((x) => x.cap === mp.cap).indexOf(mp) + 1, texto: esc(textoMision(mp)), progreso: enVuelo ? 0.8 : 1, avance: enVuelo ? esc(t('pasoDe', { n: 2, m: 2 })) : '', cumplida: !enVuelo, premio: mp.premio, pista: '' });
  for (const o of M.misionesActivas(s)) {
    if (o.tipo === 'historia') {
      if (mp) continue;
      const m = o.mision, orden = MISIONES.filter((x) => x.cap === m.cap).indexOf(m) + 1;
      let texto = esc(o.espera ? t(`${m.id}_espera`) : textoMision(m)), avance = o.avanceTxt;
      // la misión dice la meta y cuánto falta; qué tocar ahora lo dice «Siguiente paso» (no se repite acá)
      if (m.tipo === 'ruta') avance = esc(t('pasoDe', { n: o.progreso < 0.5 ? 1 : 2, m: 2 }));
      if (m.tipo === 'mejorDia') avance = `${plata(o.avance.n)}`;
      // debajo: la pista si lleva rato sin avanzar; si no, la frase que explica la misión (cuando hace falta)
      // (la pista genérica «tocá Siguiente paso» no va mientras la guía está diciendo eso mismo)
      const clavePista = o.pista ? (o.pista === 'pista_noche' || hay(o.pista) ? o.pista : guia.paso === 'sigue' ? null : 'pista_generica') : null;
      const pista = o.espera ? '' : clavePista ? esc(t(clavePista)) : hay(`ayuda_${m.id}`) ? esc(t(`ayuda_${m.id}`)) : '';
      out.push({ tipo: 'mision', orden, texto, progreso: o.espera ? 0 : o.progreso, avance: o.espera ? '' : avance, premio: m.premio, pista });
    } else {
      const u = unidad(o.carga);
      const horas = Math.max(1, Math.round(o.quedan / 60));
      const quedan = horas >= 48 ? `${Math.round(horas / 24)} d` : `${horas} h`;
      const camino = caminoEncargo(o.o, o.d);
      out.push({ tipo: 'encargo', texto: esc(t('encargoTxt', { n: numero(o.avance.meta), u, a: M.AP[o.o].nombre, b: M.AP[o.d].nombre })),
        detalle: `${o.oferta ? '' : `${o.avanceTxt} · `}${esc(t('quedan', { t: quedan }))} · ${plata(o.premio)}`, camino: { ok: camino.ok, texto: esc(camino.texto) },
        boton: o.oferta ? `<button class="mini${camino.ok ? '' : ' suave'}" data-accion="aceptarEncargo" data-id="${o.contrato}">${esc(t(camino.ok ? 'aceptar' : 'aceptarIgual'))}</button>` : '' });
    }
  }
  return out;
}
// En el celular los encargos no entran en la columna de la misión (taparían el mapa): van en una pastilla, «Encargos» con su
// cantidad, que abre la lista con las mismas tarjetas (qué piden, si ya se puede cumplir y el botón de aceptar).
function pastillaEncargos(objs) {
  const enc = objs.filter((o) => o.tipo === 'encargo');
  return enc.length && guia.hecha ? { n: enc.length, nuevos: enc.some((o) => o.boton) } : null;
}
const encargosAbiertos = () => U.ventanaAbierta() && $('#ventana').dataset.clase === 'encargos';
function abrirEncargos() {
  const enc = objetivos().filter((o) => o.tipo === 'encargo');
  U.ventana({ titulo: t('encargos'), clase: 'encargos',
    html: `<p class="parte-sub">${esc(t('c_encargo'))}</p>${enc.length ? `<div class="lista-enc">${U.tarjetasEncargo(enc)}</div>` : `<p>${esc(t('encNinguno'))}</p>`}`,
    botones: [{ txt: t('volverMapa'), accion: 'cerrarVentana', clase: 'suave' }],
    alCerrar: () => { ultimo = performance.now(); } });
}

// ───────────── «Siguiente paso» ─────────────
// Dice siempre lo que conviene hacer ahora y qué pasa al tocarlo. El orden (prueba a ciegas del 16-11-2026: repetía «seguí a un
// avión» aunque la misión pedía otra cosa, y alternaba sola entre dos consejos):
//   0. lo urgente: la red de seguridad del modelo (vender el avión que hunde la caja);
//   1. la pregunta de la base, si espera respuesta;
//   2. lo que pide la misión activa, si se puede pagar;
//   3. si no se puede y la red lo junta pronto: cuánto falta y por qué, con la cuenta a la vista (lo que cuesta y lo que hay que
//      guardar para la nafta);
//   4. lo demás que aconseja el modelo y se puede pagar, solo si la cuenta verdadera lo confirma;
//   5. lo que falta para la misión cuando todavía está lejos;   6. juntar para otra cosa que conviene;
//   9. si de verdad no hay nada que decidir ni que juntar: seguir a un avión con la cámara (o pasar por la oficina).
// Nunca pide apurar el reloj (medido el 15-11-2026: «Acelerá el tiempo» era el consejo el 47% del tiempo).
const COMPRAS = new Set(['ruta', 'avion', 'balizas', 'transbordo']);
const reservaSuave = () => M.reserva(s, null, ECONOMIA.reservaSugerencia, 0);   // la que el modelo deja en la caja antes de aconsejar una compra
// Lo que pide la misión activa aunque hoy no alcance la plata: las decisiones «de la historia» que da el modelo con la caja sin
// fondo (el mismo recurso que usa el modelo en acelerarPara). Una vez por estado.
let _pedido = { firma: null, lista: [] };
function pedidoMision() {
  const firma = `${s.t}|${s.verRed}|${s.misiones.length}|${s.cap}|${s.rutas.map((r) => (r.balizas ? 1 : 0)).join('')}|${JSON.stringify(s.niveles)}`;
  if (_pedido.firma === firma) return _pedido.lista;
  const caja = s.dinero; let ds = [];
  try { s.dinero = 1e12; ds = M.decisiones(s); } catch { ds = []; } finally { s.dinero = caja; }
  _pedido = { firma, lista: ds.filter((d) => d.mision && COMPRAS.has(d.tipo)) };
  return _pedido.lista;
}
// ¿La misión activa pide esta compra? (d: una decisión del estimador). Devuelve la misión o null.
function pideMision(d) {
  const m = M.misionActual(s);
  if (!m || !(m.premio > 0) || !s.mision) return null;
  const hay = pedidoMision().some((x) => (d.tipo === 'ruta' ? x.tipo === 'ruta' && x.id === M.idRuta(d.a, d.b)
    : d.tipo === 'avion' ? x.tipo === 'avion' && x.ruta === d.ruta
    : d.tipo === 'faros' ? x.tipo === 'balizas' && x.id === d.ruta
    : x.tipo === 'transbordo' && x.id === d.ap));
  return hay ? m : null;
}
// El paso de la misión: { paga: true, d } si se puede pagar ya; { paga: false, d, costo, reserva, falta, dura } si hay que juntar
// (dura: la reserva es una regla del modelo, la de los aviones; si no, es el margen que el modelo aconseja dejar).
function calcularPasoMision() {
  if (!M.misionActual(s)) return null;
  const suave = reservaSuave();
  let reales = [];
  try { reales = M.decisiones(s); } catch { reales = []; }
  const d = reales.find((x) => x.mision && (COMPRAS.has(x.tipo) || x.tipo === 'contrato') && x.efectoDia >= 0 && (x.costo <= 0 || s.dinero - x.costo >= suave));
  if (d) return { paga: true, d };
  const o = pedidoMision()[0];
  if (!o) return null;
  // (si alcanza y el modelo igual no lo propone es porque espera otra cosa, como el avión de apoyo que ya se compró hace poco: no se insiste)
  const j = juntaDe(o);
  return j.falta > 0 ? { paga: false, d: o, ...j } : null;
}
// La cuenta de lo que falta para una compra: lo que cuesta, lo que hay que guardar para volar y lo que falta hoy.
// dura: la reserva es una regla del modelo (la de los aviones); si no, es el margen que el modelo aconseja dejar.
function juntaDe(o) {
  const tp = o.tipo === 'avion' ? M.AV[o.id] : null, r = tp ? rutaDe(o.ruta) : null;
  const reserva = Math.ceil(tp && r ? M.reserva(s, { t: tp, r }) : reservaSuave());
  return { costo: o.costo, reserva, falta: Math.ceil(o.costo + reserva - s.dinero), dura: !!tp };
}
// Cuando no hay nada que decidir, el juego invita a mirar: seguir a un avión con la cámara (o pasar por la oficina, si llegó algo).
function invitarAMirar() {
  if (oficinaLista() && !mundo.siguiendo && novedadesOficina().resultados > 0) return { clase: 9, clave: 'oficina', ico: 'oficina', texto: esc(t('s_oficina')), mirar: 'oficina' };
  const volando = s.aviones.filter((a) => a.fase === 'vuelo');
  const noche = s.aviones.length && M.esNoche(s);
  if (!volando.length) return { clase: 9, clave: 'espera', ico: noche ? 'dormido' : 'check', texto: esc(t(noche ? 's_duermen' : 's_esperar')), pasivo: true };
  return { clase: 9, clave: 'mirar', ico: 'ojo', texto: esc(t(mundo.siguiendo != null ? 's_mirarOtro' : 's_mirar')), mirar: 'avion' };
}
// Sigue con la cámara a un avión que está volando (cada toque, a otro): el que más camino tiene por delante.
function mirarAvion() {
  const volando = s.aviones.filter((a) => a.fase === 'vuelo' && a.id !== mundo.siguiendo).sort((a, b) => b.resta - a.resta);
  const av = volando[0] ?? s.aviones.find((a) => a.fase === 'vuelo');
  if (!av) { verRed(); return; }
  sel = null; mundo.pedida(); mundo.seguir(av.id);
  mundo.controles.dollyTo(innerWidth < 640 ? 4.2 : 3.2, true); mundo.controles.rotatePolarTo(1.0, true);
}
// La decisión del modelo, en las palabras del estimador.
function decisionDe(d) {
  if (!d) return null;
  if (d.tipo === 'avion') return { tipo: 'avion', id: d.id, ruta: d.ruta };
  if (d.tipo === 'balizas') return { tipo: 'faros', ruta: d.id };
  if (d.tipo === 'transbordo') return { tipo: 'correo', ap: d.id };
  if (d.tipo === 'ruta') return { tipo: 'ruta', a: d.a, b: d.b };
  return null;
}
// Un consejo de compra que no pide la historia se dice solo si la cuenta verdadera da bien: deja plata y se paga en 8 días o menos.
// (Medido el 16-11-2026: la cuenta rápida del modelo recomendaba rutas que perdían plata.) Mientras la cuenta no está, no se dice.
// Devuelve true, false o null (la cuenta todavía se está haciendo).
function consejoVale(d) {
  const dec = decisionDe(d);
  if (!dec || d.mision || d.seguridad) return true;
  const e = tandas.pedir(s, dec, { llave: `sug|${s.verRed}|${Math.floor(s.t / 720)}` });
  if (!e) return null;
  return !e.imposible && e.dejaDia >= 300 && e.recuperoDias != null && e.recuperoDias <= 8;
}
const ESPERA = Symbol('espera');
const ciudadNueva = (d) => (M.enRed(s, d.a) || (!M.nodosRed(s).length && d.a === M.HUB) ? d.b : d.a);
// Para qué se junta, con nombre y lugar: «un Tero para la ruta a Bahía Blanca» (antes decía «el Tero», sin decir para dónde).
function paraQue(o) {
  if (o.tipo === 'avion') { const r = rutaDe(o.ruta); return r ? t('que_avionRuta', { avion: M.AV[o.id]?.nombre ?? '', ruta: nombreRuta(r) }) : t('que_avion', { avion: M.AV[o.id]?.nombre ?? '' }); }
  if (o.tipo === 'balizas') { const r = rutaDe(o.id); return r ? t('que_farosRuta', { ruta: nombreRuta(r) }) : t('que_faros'); }
  if (o.tipo === 'transbordo') return t('que_base');
  const [a, b] = o.a ? [o.a, o.b] : String(o.id).split('-');
  return t(o.costo > M.costoRuta(a, b) ? 'que_rutaAvion' : 'que_ruta', { ciudad: M.AP[M.enRed(s, a) ? b : a]?.nombre ?? '' });
}
// «Te faltan $ X»: con la cuenta a la vista (lo que cuesta y lo que hay que guardar para volar). Al tocarlo se abre el lugar.
function pasoJunta(o, { costo, reserva, falta, dura }, clase) {
  return { clase, clave: `junta|${o.tipo}|${o.id}|${o.ruta ?? ''}`, ico: 'moneda', d: { tipo: 'junta', obj: o },
    texto: esc(t('s_junta', { que: paraQue(o), falta: plata(falta) })),
    detalle: reserva > 0 ? esc(t(dura ? 's_juntaCuenta' : 's_juntaCuentaSuave', { costo: plata(costo), reserva: plata(reserva) })) : '' };
}
// Una decisión del modelo dicha como paso: { clase, clave, ico, texto, costo?, d }. null si no hay nada que decir de ella.
function pasoDe(d, clase) {
  const r = d.ruta ? rutaDe(d.ruta) : d.tipo !== 'ruta' && typeof d.id === 'string' ? rutaDe(d.id) : null;
  const ruta = r ? esc(nombreRuta(r)) : '';
  if (COMPRAS.has(d.tipo)) { const v = consejoVale(d); if (v == null) return ESPERA; if (!v) return null; }
  const base = { clase, d, clave: `${d.tipo}|${d.id ?? ''}|${d.ruta ?? ''}` };
  switch (d.tipo) {
    case 'ruta': return { ...base, ico: 'ruta', texto: esc(t('s_ruta', { b: M.AP[ciudadNueva(d)].nombre })), costo: M.costoRuta(d.a, d.b) };   // lo que se paga ahora: la ruta (el modelo a veces suma el avión)
    case 'avion': return { ...base, ico: 'avion', texto: t('s_avion', { ruta }), costo: d.costo };
    case 'balizas': return { ...base, ico: 'faro', texto: t('s_faros', { ruta }), costo: d.costo };
    case 'transbordo': return { ...base, ico: 'base', texto: esc(t('s_base', { ap: M.AP[d.id].nombre })), costo: d.costo };
    case 'cargaMin': return { ...base, ico: 'cartas', texto: t('s_salida', { ruta }) };
    case 'contrato': {
      // dice cuál es (en el celular la lista de encargos está a un toque, en su pastilla)
      const c = s.contratos.tablero.find((x) => x.id === d.id);
      if (!c) return null;
      return { ...base, ico: 'encargo', texto: esc(t('s_encargo2', { n: numero(c.n), u: unidad(c.c, c.n), a: M.AP[c.o].nombre, b: M.AP[c.d].nombre })) };
    }
    case 'vender': { const av = s.aviones.find((a) => a.id === d.id), rr = av && rutaDe(av.ruta); return av ? { ...base, ico: 'moneda', texto: d.seguridad || !rr ? esc(t('s_vender')) : t('s_vender2', { ruta: esc(nombreRuta(rr)) }) } : null; }
    case 'clasificar': return { ...base, ico: 'base', texto: esc(t('s_ordenar')) };
    case 'ahorrar': case 'acelerar': {
      // juntar para algo que no pide la misión: se nombra solo si la cuenta verdadera dice que conviene
      if (d.falta == null || !d.para || !COMPRAS.has(d.para.tipo)) return null;
      const v = consejoVale({ ...d.para, mision: false });
      if (v == null) return ESPERA; if (!v) return null;
      const j = juntaDe(d.para);
      return j.falta > 0 ? pasoJunta(d.para, j, clase) : null;
    }
    default: return null;
  }
}
function pasoSugerido() {
  if (sug?.seguridad) { const p = pasoDe(sug, 0); if (p) return p; }
  if (s.clasif?.estado === 'oferta') return pasoDe({ tipo: 'clasificar' }, 1);
  // la primera noche el juego propone los faros acá, con la burbuja al lado: no abre ningún panel por su cuenta
  if (ayudaNoche && guiaNocheVale(ayudaNoche.ruta)) { const r = rutaDe(ayudaNoche.ruta); return pasoDe({ tipo: 'balizas', id: r.id, costo: M.costoBalizas(r, s), mision: true }, 2); }
  let espera = false;                // hay una cuenta haciéndose: todavía no se sabe si ese consejo vale
  if (pasoMision?.paga) { const p = pasoDe(pasoMision.d, 2); if (p === ESPERA) espera = true; else if (p) return p; }
  // lo que falta para la misión: si la red lo junta pronto (en un día y medio, la vara del modelo) va antes que cualquier otro
  // consejo; si falta mucho, primero lo que convenga comprar mientras tanto
  const junta = pasoMision && !pasoMision.paga ? pasoMision : null;
  const pronto = junta && junta.falta <= 1.5 * Math.max(0, M.gananciaDia(s));
  if (junta && pronto) return pasoJunta(junta.d, junta, 3);
  let otraJunta = null;              // juntar para algo que no pide la misión: va después de juntar para la misión
  if (sug && !sug.seguridad) { const p = pasoDe(sug, 4); if (p === ESPERA) espera = true; else if (p?.d?.tipo === 'junta') otraJunta = { ...p, clase: 6 }; else if (p) return p; }
  if (junta) return pasoJunta(junta.d, junta, 5);
  if (otraJunta) return otraJunta;
  const p = invitarAMirar();
  return espera ? { ...p, espera: true } : p;
}
// Una propuesta no cambia sola cada pocos segundos. Se queda mientras siga en pie; la reemplaza enseguida solo algo más importante
// (una clase menor), un toque del jugador (accion() la suelta) o que deje de valer; si no, aguanta 45 segundos. Los «te faltan»
// se sostienen igual (con la cuenta al día). Los rellenos («seguí a un avión») no: apenas hay algo para decidir, se van.
const AGUANTE = 45000;
let pasoFijo = null;
function sigueEnPie(p) {
  const d = p?.d;
  if (!d || p.clase >= 9) return false;
  switch (d.tipo) {
    case 'ruta': return !rutaDe(M.idRuta(d.a, d.b)) && M.puedeAbrirRuta(s, d.a, d.b).ok;
    case 'avion': return !!rutaDe(d.ruta) && M.puedeComprar(s, d.id, d.ruta).ok;
    case 'balizas': { const r = rutaDe(d.id); return !!r && !r.balizas && s.dinero >= M.costoBalizas(r, s); }
    case 'transbordo': { const c = M.costoTransbordo(s, d.id); return c != null && s.dinero >= c; }
    case 'contrato': return s.contratos.tablero.some((c) => c.id === d.id) && s.contratos.activos.length < M.CONTRATO.maxActivos;
    case 'cargaMin': { const r = rutaDe(d.id); return !!r && (r.minCarga ?? 0.6) !== d.v; }
    case 'vender': return s.aviones.some((a) => a.id === d.id);
    case 'clasificar': return s.clasif?.estado === 'oferta';
    case 'junta': {           // todavía no existe lo que se quería comprar y sigue faltando plata
      const o = d.obj;
      const pendiente = o.tipo === 'ruta' ? !rutaDe(o.id ?? M.idRuta(o.a, o.b)) : o.tipo === 'avion' ? !!rutaDe(o.ruta) : o.tipo === 'balizas' ? !!rutaDe(o.id) && !rutaDe(o.id).balizas : M.costoTransbordo(s, o.id) === o.costo;
      return pendiente && juntaDe(o).falta > 0;
    }
    default: return false;
  }
}
let esperaDesde = 0;
function estabilizar(p, ahora) {
  const f = pasoFijo;
  if (f && p.clave !== f.p.clave && ahora - f.t < AGUANTE && sigueEnPie(f.p)) {
    // cede solo ante algo más importante (y ya resuelto), o un consejo de compra frente a «juntá para algo lejano» (clase 5)
    const cede = (p.clase < f.p.clase && !p.espera) || (f.p.clase === 5 && p.clase === 4);
    if (!cede) return f.p.d?.tipo === 'junta' ? (f.p = pasoJunta(f.p.d.obj, juntaDe(f.p.d.obj), f.p.clase)) : f.p;
  }
  // Se juntó lo que faltaba para un consejo (clase 6): lo que sigue es comprarlo, no pasar a juntar para otra cosa. (Lo de la
  // misión ya llega solo como paso de clase 2.)
  if (f && f.p.clase === 6 && p.clave !== f.p.clave && p.clase >= 4 && ahora - f.t < AGUANTE * 2) {
    const o = f.p.d.obj, compra = juntaDe(o).falta <= 0 ? pasoDe({ ...o, mision: false }, 4) : null;
    if (compra && compra !== ESPERA && sigueEnPie(compra)) { pasoFijo = { p: compra, t: ahora }; return compra; }
  }
  // Se está haciendo la cuenta de un consejo y no hay un relleno ya a la vista: un instante sin paso, en vez de mostrar «seguí a
  // un avión» y cambiarlo al segundo (como mucho 2,5 s; después se muestra lo que haya).
  if (p.espera && !(f && f.p.clase >= 9)) {
    esperaDesde ||= ahora;
    if (ahora - esperaDesde < 2500) { pasoFijo = null; return null; }
  } else esperaDesde = 0;
  if (!f || p.clave !== f.p.clave) pasoFijo = { p, t: ahora }; else f.p = p;
  return p;
}
// La oficina está disponible después del primer vuelo y del primer minuto guiado (nunca antes).
const oficinaLista = () => Puente.hayOficina() && !!s && s.stats.vuelos > 0 && guia.hecha;
// Lo que hay sin leer en la bandeja de la oficina (para el globito del botón y para «Llegó algo a tu oficina»). Una vez por estado.
let _novedades = { firma: null, n: 0, resultados: 0 };
function novedadesOficina() {
  const firma = `${Math.floor(s.t / 30)}|${libro.leidos.length}|${libro.leidos.at(-1) ?? ''}|${libro.notas.length}|${libro.dias.length}|${s.contratos.tablero.map((c) => c.id).join(',')}|${s.contratos.activos.length}`;
  if (_novedades.firma === firma) return _novedades;
  const b = datosOficina()?.bandeja ?? [];
  return (_novedades = { firma, n: b.filter((x) => !x.leido).length, resultados: b.filter((x) => !x.leido && x.tipo === 'resultado').length });
}
function refrescar(ahora) {
  if (escena !== 'juego') return;
  const noche = M.esNoche(s);
  if (noche !== eraNoche) { eraNoche = noche; if (s.t > 30) A.sonar(noche ? 'noche' : 'dia'); }
  A.fijarNoche(mundo.cielo.noche);
  U.barra({ dinero: dineroVisible(), gananciaHoy: Libro.hoyDe(libro, s).quedo, fecha: M.fecha(s), noche, vel, velElegida, frenado: freno(), sinRojo: !(s.stats.ingresos > 0) });
  const objs = guia.hecha || guia.paso === 'sigue' || guia.paso === 'cobro' ? objetivos() : objetivos().slice(0, 1);
  // la oficina: su botón (con el globito de lo que hay sin leer) y, la primera vez que queda disponible, su cartel
  const of = oficinaLista(), nov = of ? novedadesOficina().n : 0, nueva = of && !empresa.estrenada;
  U.mision(objs, { encargos: pastillaEncargos(objs), oficina: of ? { n: nov, nueva } : null });
  U.botonOficina(of, nov, nueva);
  if (of && !vistos.oficina) { vistos.oficina = 1; if (!empresa.estrenada) cola.push({ tipo: 'momento', clave: 'oficina', firme: true, quieto: true, turno: 4.8, t: ahora, alMostrar: () => marcarBoton('[data-accion="oficina"]', 9000), m: { ico: 'oficina', titulo: t('mo_oficina_t'), texto: esc(t('mo_oficina')), dura: 9000 } }); guardarPronto = true; }
  // siguiente paso
  if (ahora - ultimaSug > (s.aviones.length > 100 ? 2500 : 900)) {
    const callado = guiando() && guia.paso !== 'sigue';
    sug = callado ? null : M.sugerencia(s); pasoMision = callado ? null : calcularPasoMision(); ultimaSug = ahora;
  }
  // una pregunta de la base que espera respuesta siempre tiene su tarjeta (también al volver a una partida guardada)
  if (guia.hecha && s.clasif?.estado === 'oferta') ofrecerOrden();
  // no se muestra con un panel abierto ni con la pregunta de la base abierta: en ese momento el paso es contestarla
  const repetido = enPantalla?.tipo === 'decision';
  const mostrarPaso = (guia.hecha || guia.paso === 'sigue') && !U.panelAbierto() && !repetido;
  pasoAhora = mostrarPaso ? estabilizar(pasoSugerido(), ahora) : null;
  U.paso(pasoAhora ? { ...pasoAhora, pulso: guia.paso === 'sigue' || (!!ayudaNoche && pasoAhora.d?.tipo === 'balizas') } : null);
  // panel
  U.panel(armarPanel(), sel?.tipo === 'hangar' && M.avionesDisponibles(s).length > 1);
  if (verEnPanel && sel) { U.verEnPanel(verEnPanel); verEnPanel = null; }        // lo que se vino a ver (por qué falta plata) queda a la vista
  mundo.elegir(sel && sel.tipo !== 'hangar' ? sel : sel?.tipo === 'hangar' ? { tipo: 'ruta', id: sel.ruta } : null);
  U.marcar(marcaBoton, guia.paso === 'tocar'); // en el primer paso el dedo señala una ciudad del mundo: no se esconde desde acá
  if (marcaBoton && guia.hecha && ahora > (marcaBoton_hasta ?? 0)) marcaBoton = null;
}
let marcaBoton_hasta = 0, pasoAhora = null, verEnPanel = null;

// ───────────── paneles ─────────────
const cab = (ico, titulo, sub = '', atras = null) => `<div class="p-cab">${atras ? `<button class="ib" data-accion="${atras}" aria-label="${esc(t('volver'))}">${icono('atras')}</button>` : icono(ico)}<h2>${sub ? `<span class="sub">${sub}</span>` : ''}${titulo}</h2><button class="ib" data-accion="cerrarPanel" aria-label="${esc(t('cerrar'))}">${icono('cerrar')}</button></div>`;

// ── la tarjeta de decisión: cuesta, deja por día, se paga en ──
// Los números salen del estimador verdadero (estimador.js): tu red simulada 3 días con la compra y sin ella. Mientras la cuenta
// se hace (un instante), el lugar queda reservado para que nada salte debajo del dedo.
const cuenta = (d) => tandas.pedir(s, d, { urgente: true });
function textoDias(e) {
  if (e.recuperoDias == null) return t('tj_noSePaga');
  if (e.recuperoDias < 0.9) return t('diasMenos');
  const n = Math.max(1, Math.ceil(e.recuperoDias - 0.1));      // 1,05 días se dice «1 día» (no «2 días»)
  return n > 99 ? t('diasMas', { n: 99 }) : e.incierto ? t('diasUnos', { n }) : n === 1 ? t('dias1') : t('diasN', { n });
}
// Las tres cifras de una estimación, listas para mostrar: { deja, paga, clase, largo }.
function cifrasDe(e) {
  if (!e) return { deja: t('tj_calculando'), paga: '…', clase: 'espera' };
  if (e.imposible) return { deja: '—', paga: '—', clase: 'espera' };
  const deja = e.incierto ? t('entre', { a: plata(e.min), b: plata(e.max) }) : e.casiNada ? t('tj_casiNada') : plata(e.dejaDia);
  // verde solo si deja plata seguro (un rango que cruza el cero va sin color)
  return { deja, paga: textoDias(e), clase: e.pierde ? 'pierde' : e.casiNada || e.dejaDia < 0 || (e.incierto && e.min < 0) ? '' : 'gana', largo: e.incierto };
}
// El renglón de abajo: si pierde (y por qué), si casi no cambia, si tarda mucho en pagarse o si la cuenta es incierta.
// avisarLenta: una compra que deja plata pero tarda más de una semana en pagarse lo dice (salvo que ya lo diga la línea de la misión).
const esLenta = (e) => !!e && !e.imposible && !e.pierde && !e.casiNada && e.recuperoDias != null && e.recuperoDias > 8;
function porqueDe(e, avisarLenta = true) {
  if (!e || e.imposible) return '';
  const partes = [];
  if (e.pierde) partes.push(`<b>${esc(t('tj_pierde'))}</b>`); else if (e.casiNada) partes.push(esc(t('tj_nada'))); else if (avisarLenta && esLenta(e)) partes.push(esc(t('tj_lenta')));
  if (e.motivo && (e.pierde || e.casiNada || e.tipo !== 'ruta')) partes.push(esc(t(e.motivo.clave)));
  if (e.incierto) partes.push(esc(t('tj_incierto')));
  return partes.length ? `<p class="porque${e.pierde ? ' mal' : ''}">${partes.join(' ')}</p>` : '';
}
// Cuando la misión activa pide esta compra, la tarjeta lo dice con el premio a la vista. Si sola es mal negocio (tarda más de
// 4 días en pagarse, o no se paga), no se esconde: dice cuánto tarda sola y en cuánto se paga contando el premio.
const LENTA = 4;
function lineaMision(d, e, costo) {
  const m = pideMision(d);
  if (!m) return '';
  const premio = plata(m.premio), partes = [];
  if (e && !e.imposible) {
    const lenta = e.recuperoDias == null || e.recuperoDias > LENTA;
    if (e.recuperoDias == null) partes.push(esc(t('tj_solaNo')));
    else if (lenta) partes.push(esc(t('tj_solaTarda', { dias: textoDias(e) })));
    if (lenta && e.dejaDia > 0 && costo != null) {
      const resto = costo - m.premio;
      partes.push(esc(resto <= 0 ? t('tj_premioPaga', { premio }) : t('tj_conPremio', { premio, dias: textoDias({ recuperoDias: resto / e.dejaDia, incierto: e.incierto }) })));
    } else partes.push(esc(t('tj_mision', { premio })));
  } else partes.push(esc(t('tj_mision', { premio })));
  return `<p class="porque mision">${icono('mision')}<span>${partes.join(' ')}</span></p>`;
}
// partes: el desglose de «Cuesta» a la vista ([[rótulo, monto], …]): la ruta y su avión, sin letra chica.
function tarjeta(d, costo = null, partes = null) {
  const e = cuenta(d), precio = costo ?? e?.costo ?? costoDecision(s, d)?.costo, c = cifrasDe(e);
  const desglose = partes ? `<em>${partes.map(([k, v], i) => `<span>${i ? '+ ' : ''}${esc(k)} ${plata(v)}</span>`).join('')}</em>` : '';
  const mision = lineaMision(d, e, precio);
  return `<div class="tarjeta${partes ? ' con-partes' : ''}"><div><small>${esc(t('tj_cuesta'))}</small><b>${precio != null ? plata(precio) : '—'}</b>${desglose}</div>
    <div class="${c.clase}"><small>${esc(t('tj_deja'))}</small><b class="${c.largo ? 'largo' : ''}">${esc(c.deja)}</b></div>
    <div class="${c.clase === 'espera' ? 'espera' : esLenta(e) ? 'lenta' : ''}"><small>${esc(t('tj_paga'))}</small><b class="${c.paga.length > 9 ? 'largo' : ''}">${esc(c.paga)}</b></div></div>${porqueDe(e, !mision)}${mision}`;
}
// Un botón bloqueado dice su cuenta: cuánto cuesta, cuánto hay que guardar para volar (si hay reserva) y cuánto falta.
const faltaTxt = (costo, reserva = 0) => {
  const falta = Math.ceil(costo + reserva - s.dinero);
  return reserva > 0 ? t('reservaCuenta', { costo: plata(costo), reserva: plata(Math.ceil(reserva)), falta: plata(falta) }) : t('faltaPlata', { monto: plata(falta) });
};
const notaFreno = () => `<p class="freno-nota">${icono('pausa')}${esc(t('frenadoPorque'))}</p>`;
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
  let h = cab(esBase ? 'base' : 'ruta', nom(id), esBase ? esc(t('tuBase')) : '') + notaFreno();
  if (!enRed) {
    const c = conexionPara(id, sel.desde), n = esperanPara(id);
    if (n > 0) h += `<div class="dato">${icono('cartas')}<span><b>${numero(n)}</b> ${esc(unidad('correo', n))} ${esc(t('esperan'))}</span></div>`;
    if (c.desde && !c.escala) {
      const p = M.puedeAbrirRuta(s, c.desde, id);
      h += `<p class="nota">${icono('ruta')} ${esc(t('desde', { ciudad: M.AP[c.desde].nombre }))} · ${esc(t('kmVuelo', { km: numero(c.km) }))}</p>`;
      // la ruta sola no deja nada: la cuenta va con el avión más barato que llega, y se dice
      const d = { tipo: 'ruta', a: c.desde, b: id }, precio = costoDecision(s, d), tp = precio?.avion ? M.AV[precio.avion] : null;
      if (tp) {
        h += tarjeta(d, precio.costo, [[t('tj_pRuta'), c.costo], [t('tj_pAvion'), tp.precio]]);
        h += `<p class="porque">${esc(t('tj_rutaSola', { avion: tp.nombre }))}</p>`;
      }
      h += `<div class="acciones">${botonPrecio('abrirRuta', `data-a="${c.desde}" data-b="${id}"`, esc(t('abrirRuta')), c.costo, p.ok, 'ruta')}</div>`;
      if (!p.ok) h += `<p class="nota mal">${esc(p.error === 'plata' ? faltaTxt(c.costo) : p.error === 'alcance' ? t('muyLejos', { km: numero(c.km) }) : t('sinConexion'))}</p>`;
      else if (tp) h += `<p class="despues">${esc(t('tj_despues', { avion: tp.nombre, precio: plata(tp.precio) }))}</p>`;
    } else if (c.escala) h += `<p class="nota">${esc(t('escala', { ciudad: M.AP[c.escala].nombre }))}</p><div class="acciones"><button class="boton ancho suave" data-accion="verCiudad" data-id="${c.escala}">${icono('flecha')}${nom(c.escala)}</button></div>`;
    else h += `<p class="nota">${esc(t('sinConexion'))}</p>`;
    return h;
  }
  const n = Math.round(M.enEspera(s, id));
  h += `<div class="dato">${icono(s.cap === 1 ? 'cartas' : 'cartas')}<span>${n > 0 ? `<b>${numero(n)}</b> ${esc(s.cap === 1 ? unidad('correo', n) : t('cartasYpaquetes'))} ${esc(t('esperan'))}` : esc(t('nadaEspera'))}</span></div>`;
  const rutas = s.rutas.filter((r) => r.a === id || r.b === id);
  const conecta = esBase || rutas.filter((r) => s.aviones.some((a) => a.ruta === r.id)).length >= 2;
  if (conecta) {
    const nivel = s.niveles[id] ?? 0, costo = M.costoTransbordo(s, id), enCola = Math.round(M.enTransbordo(s, id)), u = esc(t(s.cap === 1 ? 'cartas' : 'u_todo'));
    h += `<p class="nota">${esc(t('baseExplica'))} ${t('baseRitmo', { n: numero(TRANSBORDO[nivel].u), u })}${enCola > 0 ? ` ${esc(t('baseCola', { n: numero(enCola) }))}.` : ''}</p>`;
    h += costo != null ? `${tarjeta({ tipo: 'correo', ap: id }, costo)}<div class="acciones">${botonPrecio('agrandar', `data-id="${id}"`, esc(t('agrandar')), costo, s.dinero >= costo, 'base')}</div>${s.dinero < costo ? `<p class="nota mal">${esc(faltaTxt(costo))}</p>` : ''}<p class="nota">${t('agrandarExplica', { n: numero(TRANSBORDO[nivel + 1].u), u })}</p>`
      : `<p class="nota">${esc(t('baseMax'))}</p>`;
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
  let h = cab('ruta', esc(tituloRuta(r)), esc(t('kmVuelo', { km: numero(r.km) }))) + notaFreno();
  // el resultado de la ruta: hasta su primer cobro no se habla de pérdida (el primer vuelo sale antes de cobrar) y una diferencia
  // de monedas no se pinta de rojo; después, el dato va como es
  if (r.vuelos > 0) {
    if (!(r.ingresos > 0) && r.vuelos < 4) h += `<div class="dato">${icono('moneda')}<span>${esc(t('rutaSinCobro'))}</span></div>`;
    else h += `<div class="dato ${neto >= 0 ? 'bien' : neto > -100 ? '' : 'mal'}">${icono('moneda')}<span>${esc(t(neto >= 0 ? 'ganoRuta' : 'perdioRuta'))} <b>${plata(Math.abs(neto))}</b></span></div>`;
  }
  for (const av of res.aviones) h += `<button class="fila" data-accion="verAvion" data-id="${av.id}"><img src="${retratos[av.tipo]}" alt=""><span>${esc(M.AV[av.tipo].nombre)}<small>${esc(estadoAvion(av))}</small></span>${icono('flecha', 'fl')}</button>`;
  h += `<div class="acciones"><button class="boton ancho${res.aviones.length ? ' suave' : ''}" data-accion="verHangar" data-id="${id}">${icono('mas')}${esc(t('sumarAvion'))}</button></div>`;
  if (s.cap === 1 && !r.balizas) {
    const c = M.costoBalizas(r, s);
    h += `<div class="h3">${esc(t('c_faros_t'))}</div><p class="nota">${esc(t('farosExplica'))} ${esc(t('sinFaros'))}.</p>${tarjeta({ tipo: 'faros', ruta: id }, c)}<div class="acciones">${botonPrecio('faros', `data-id="${id}"`, esc(t('ponerFaros')), c, s.dinero >= c, 'faro')}</div>${s.dinero < c ? `<p class="nota mal">${esc(faltaTxt(c))}</p>` : ''}`;
  } else if (s.cap === 1) h += `<div class="dato bien">${icono('faro')}<span>${esc(t('conFaros'))}</span></div>`;
  if (res.aviones.length) {
    // cada opción dice qué pasa si se la elige (antes solo se leía la explicación de la que ya estaba elegida)
    h += `<div class="h3">${esc(t('cuandoSale'))}</div><div class="opciones">${M.CARGA_MINIMA.map((v) => `<button class="opc${(r.minCarga ?? 0.6) === v ? ' activa' : ''}" data-accion="salida" data-id="${id}" data-v="${v}"><i class="punto"></i><span><b>${esc(t(`sale${Math.round(v * 100)}`))}</b><small>${esc(t(`salePista${Math.round(v * 100)}`))}</small></span></button>`).join('')}</div>`;
  }
  h += `<div class="sep"></div><button class="boton ancho peligro" data-accion="cerrarRuta" data-id="${id}">${esc(t('cerrarRuta'))}</button>`;
  return h;
}
// El hangar: los modelos en venta lado a lado, cada uno con los mismos renglones (cuesta, deja por día, se paga en) para comparar.
function tarjetaAvion(tp, rutaId, mejor) {
  const r = rutaDe(rutaId), p = M.puedeComprar(s, tp.id, rutaId), llega = tp.alcance >= r.km;
  const lleva = Object.entries(tp.lleva).map(([c, n]) => `${icono(icoCarga(c))} ${numero(n)} ${esc(unidad(c, n))}`).join(' + ');
  // (el modelo pide que después de comprar quede en la caja para la nafta de los próximos vuelos: se dice cuánto)
  const mal = p.ok ? '' : p.error === 'alcance' ? t('noLlega', { km: numero(r.km) }) : p.error === 'plata' || p.error === 'reserva' ? faltaTxt(tp.precio, M.reserva(s, { t: tp, r })) : t('bloqueado');
  const e = llega ? cuenta({ tipo: 'avion', id: tp.id, ruta: rutaId }) : null, c = llega ? cifrasDe(e) : { deja: '—', paga: '—', clase: 'espera' };
  const mision = llega ? lineaMision({ tipo: 'avion', id: tp.id, ruta: rutaId }, e, tp.precio) : '';
  return `<div class="modelo${p.ok ? '' : ' bloq'}${mejor ? ' mejor' : ''}"><img src="${retratos[tp.id]}" alt=""><h3>${esc(tp.nombre)}${mejor ? `<span class="antes">${esc(t('tj_antes'))}</span>` : ''}</h3><p class="desc">${esc(t(`a_${tp.id}`))}</p>
    <div class="nums"><div><span>${esc(t('tj_cuesta'))}</span><b>${plata(tp.precio)}</b></div>
      <div class="${c.clase}"><span>${esc(t('tj_deja'))}</span><b class="${c.largo ? 'largo' : ''}">${esc(c.deja)}</b></div>
      <div class="${c.clase === 'espera' ? 'espera' : esLenta(e) ? 'lenta' : ''}"><span>${esc(t('tj_paga'))}</span><b class="${c.paga.length > 9 ? 'largo' : ''}">${esc(c.paga)}</b></div></div>
    <p class="ficha">${lleva} · ${esc(t('kmh', { n: numero(tp.vel) }))} · ${esc(t('llegaA', { n: numero(tp.alcance) }))}</p>
    ${llega ? porqueDe(e, !mision) : ''}${mal ? `<p class="mal">${esc(mal)}</p>` : ''}${mision}
    ${botonPrecio('comprar', `data-id="${tp.id}" data-ruta="${rutaId}"`, esc(t('comprar')), tp.precio, p.ok)}</div>`;
}
function panelHangar(rutaId) {
  const r = rutaDe(rutaId);
  let h = cab('avion', esc(t('elegiAvion')), esc(t('paraRuta', { ruta: nombreRuta(r) })), guiando() ? null : 'volverRuta') + notaFreno();
  const tipos = M.avionesDisponibles(s).slice().sort((a, b) => (b.alcance >= r.km ? 1 : 0) - (a.alcance >= r.km ? 1 : 0) || a.precio - b.precio);
  // el que se paga antes lleva la cinta (solo si hay con qué comparar y las cuentas ya están)
  const cuentas = tipos.filter((tp) => tp.alcance >= r.km).map((tp) => [tp.id, tandas.listo(s, { tipo: 'avion', id: tp.id, ruta: rutaId })]);
  const buenas = cuentas.filter(([, e]) => e && !e.imposible && e.recuperoDias != null).sort((a, b) => a[1].recuperoDias - b[1].recuperoDias);
  const mejor = cuentas.length >= 2 && cuentas.every(([, e]) => e) && buenas.length ? buenas[0][0] : null;
  h += `<div class="hangar${tipos.length === 1 ? ' uno' : ''}">${tipos.map((tp) => tarjetaAvion(tp, rutaId, tp.id === mejor)).join('')}</div>`;
  h += `<p class="pie-cuenta">${esc(t('tj_pie'))}</p>`;
  return h;
}
function panelAvion(id) {
  const av = s.aviones.find((a) => a.id === id), tp = M.AV[av.tipo], f = M.fichaAvion(s, id);
  let h = cab('avion', esc(tp.nombre), esc(nombreRuta(rutaDe(av.ruta))), 'volverRuta') + notaFreno();
  h += `<div class="avion"><img src="${retratos[tp.id]}" alt=""><p>${esc(estadoAvion(av))}</p>
    ${!(av.ing > 0) && f.viajes < 4 ? `<div class="dato">${icono('moneda')}<span>${esc(t('avionSinCobro'))}</span></div>`
    : `<div class="dato ${f.neto >= 0 ? 'bien' : f.neto > -100 ? '' : 'mal'}">${icono('moneda')}<span>${esc(t('gano'))} <b>${plataSigno(f.neto)}</b> · ${esc(t('viajes', { n: numero(f.viajes) }))}</span></div>`}</div>`;
  h += `<div class="acciones"><button class="boton ancho suave" data-accion="seguirAvion" data-id="${id}">${icono('ojo')}${esc(t('seguirCam'))}</button>
    <button class="boton ancho peligro" data-accion="vender" data-id="${id}">${esc(t('vender'))} · +${plata(Math.round(tp.precio * 0.6))}</button></div>`;
  return h;
}

// ───────────── acciones ─────────────
// Elegir algo abre su panel (y frena el reloj). La cámara:
//   'justa' (un toque en el mundo o en una lista): se mueve lo mínimo para que lo elegido no quede tapado por el panel. No acerca
//           ni cambia el zoom que eligió el jugador; se aleja solo si hace falta para que entre.
//   'pedida' («Siguiente paso», la guía, la oficina): encuadra de lleno, porque el jugador pidió que lo lleven.
//   false: no se toca.
function elegir(x, { camara = 'justa' } = {}) {
  sel = x; marcaBoton = guiando() ? marcaBoton : null;
  if (!x) return;
  A.sonar('abrir');
  if (!camara) return;
  const angosto = innerWidth < 640, derecha = ladoPanel(x), izquierda = angosto ? 0 : ladoMision(), abajo = angosto ? 0.46 : 0;
  let puntos = [], cerca = false;
  if (x.tipo === 'ciudad') {
    const c = mundo.ciudades.get(x.id); if (!c) return;
    cerca = M.enRed(s, x.id) || x.id === M.HUB;
    if (cerca) puntos = [c.pos];
    else { const con = conexionPara(x.id, x.desde); const d = con.desde && mundo.ciudades.get(con.desde); puntos = d ? [c.pos, d.pos] : [c.pos]; }
  } else if (x.tipo === 'ruta' || x.tipo === 'hangar') {
    const r = rutaDe(x.id ?? x.ruta); if (!r) return;
    puntos = [mundo.ciudades.get(r.a).pos, mundo.ciudades.get(r.b).pos];
  }
  if (!puntos.length) return;
  if (camara === 'pedida') {
    mundo.pedida(); mundo.seguir(null);
    if (cerca) mundo.encuadrar(puntos, { margen: 1, abajo: angosto ? 0.42 : 0, derecha, izquierda, distMin: x.id === M.HUB ? 3.6 : 4.6, distMax: 8 });
    else mundo.encuadrar(puntos, { margen: 1.7, abajo: angosto ? 0.45 : 0, derecha, izquierda, distMin: 5.4 });
  } else mundo.asegurarVisible(puntos, { izquierda, derecha, abajo, arriba: 0.1 });
}
// En escritorio el panel tapa la derecha de la pantalla: lo que se encuadra queda a su izquierda, no debajo.
const ladoPanel = (x = sel) => (innerWidth < 640 ? 0 : Math.min(0.46, (x?.tipo === 'hangar' && M.avionesDisponibles(s).length > 1 ? 492 : 364) / innerWidth));
// Y a la izquierda está la columna de la misión y los encargos: cuenta cuando baja hasta el medio de la pantalla.
function ladoMision() {
  if (innerWidth < 640) return 0;
  const r = $('#mision')?.getBoundingClientRect();
  return r && r.bottom > innerHeight * 0.4 ? Math.min(0.3, (r.right + 12) / innerWidth) : 0;
}
function marcarBoton(selector, ms = 7000) { marcaBoton = selector; marcaBoton_hasta = performance.now() + ms; }
function negar(el) { A.sonar('error'); if (el?.animate) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(0)' }], { duration: 260 }); }
// Velocidad del reloj: 0 pausa; 0,5 tranquila; 1 normal; 3 rápida. La pausa recuerda a qué velocidad volver.
function fijarVel(v, avisar = false) {
  if (v > 0) {
    vel = velElegida = v;
    if (avisar) {     // en el celular el botón no lleva el nombre escrito: se avisa cuál quedó (un solo aviso, el último)
      const x = U.VELOCIDADES.find((y) => y.v === v);
      for (let i = cola.length - 1; i >= 0; i--) if (cola[i].clave === 'vel') cola.splice(i, 1);
      if (enPantalla?.clave === 'vel') { U.limpiarAvisos(); enPantalla = null; }
      cola.push({ tipo: 'aviso', clave: 'vel', html: esc(t('velAhora', { v: t(x?.clave ?? 'vNormal').toLowerCase() })), ico: x?.ico, dura: 1800, urgente: true, t: performance.now() });
    }
  } else vel = 0;
  ultimo = performance.now(); guardarPronto = true;
  A.sonar('clic');
}

// Una compra con su promesa: se toma la cuenta que mostró la tarjeta, se compra y se anota en el libro. Si la cuenta todavía no
// terminó (se compró muy rápido), se termina aparte con la foto del estado de antes de comprar y la promesa se completa después.
const cuentasPend = new Map();
function comprarCon(d, comprar, info) {
  const e = tandas.pedir(s, d, { urgente: true }), k = `${firmaEstado(s)}#${claveDecision(d)}`;
  const marca = Libro.marcaGastos(s);
  const r = comprar();
  if (!r?.ok) return r;
  const p = Libro.anotarCompra(libro, s, d, e, { costo: Libro.costoDesde(s, marca), ...info(r) });
  if (!e && p) cuentasPend.set(k, p);
  return r;
}
function cuentaLista(k, v) {
  ultimaUI = 0;                                  // terminó una cuenta: la interfaz se vuelve a dibujar ya
  const p = cuentasPend.get(k);
  if (p) { cuentasPend.delete(k); Libro.completarPromesa(libro, s, p, v); }
}

let colorTmp = null;
function accion(nombre, d, el) {
  A.iniciarAudio();
  switch (nombre) {
    case 'nuevaPartida': empezar(true); break;
    case 'seguirPartida': empezar(false); break;
    case 'idioma':
      cambiarLengua(); U.textosFijos(); { const e = empresaActual(); U.empresa(e.nombre, e.color); }
      if (escena === 'portada') U.portada({ haySeguir: !!leerGuardado() });
      else {
        abrirMenu();
        if (guiando() && ['tocar', 'ruta', 'avion', 'vuela'].includes(guia.paso)) pasoGuia(guia.paso);
        else if (enPantalla?.tipo === 'guia') U.burbuja(t(enPantalla.paso === 'cobro' ? 'g_cobro' : 'g_sigue'), enPantalla.paso === 'cobro' ? 'moneda' : 'mision');
        if (enPantalla?.tipo === 'decision') mostrarOrden();
        if (ayudaNoche) U.burbuja(t(sel ? 'g_noche2' : 'g_noche'), 'faro');
      }
      A.sonar('clic'); break;
    case 'saltarCine': mundo.cortarCine(); break;
    case 'vel': fijarVel(+d.v); break;
    case 'velSig': { const i = U.VELOCIDADES.findIndex((x) => x.v === velElegida); fijarVel(U.VELOCIDADES[(i + 1) % U.VELOCIDADES.length].v, true); break; }   // en el celular: un botón que pasa por las tres
    case 'pausar': fijarVel(vel === 0 ? velElegida : 0); break;
    case 'centrar': A.sonar('paso'); mundo.pedida(); verRed(); break;
    case 'acercar': A.sonar('clic'); mundo.pasoZoom(1); break;
    case 'alejar': A.sonar('clic'); mundo.pasoZoom(-1); break;
    case 'menu': A.sonar('abrir'); abrirMenu(); break;
    case 'glosario': A.sonar('abrir'); abrirGlosario(); break;
    case 'empresa': A.sonar('abrir'); abrirEmpresa(); break;
    case 'empColor': colorTmp = d.v; for (const b of document.querySelectorAll('.colores button')) b.classList.toggle('activa', b === el); A.sonar('clic'); break;
    case 'empGuardar': fijarEmpresa({ nombre: $('#emp-nombre')?.value ?? '', color: colorTmp }); U.ventana(null); A.sonar('compra'); break;
    case 'verConsejo': verConsejo(); break;
    case 'cerrarCartel': if (enPantalla?.tipo === 'mision' && performance.now() - enPantalla.desde > TOQUE_MIN) { enPantalla.hasta = 0; A.sonar('clic'); } break;
    case 'encargos': A.sonar('abrir'); abrirEncargos(); break;
    case 'oficina': if (U.ventanaAbierta()) U.ventana(null); if (Puente.abrirOficina()) A.sonar('abrir'); break;
    case 'cerrarVentana': if ($('#velo').dataset.cerrable === '0' && el?.id === 'velo') break; A.sonar('cerrar'); U.ventana(null); break;
    case 'cerrarPanel': A.sonar('cerrar'); sel = null; if (guia.paso === 'ruta' || guia.paso === 'avion') pasoGuia(s.rutas.length ? 'avion' : 'tocar'); if (guia.paso === 'avion' && s.rutas.length) sel = { tipo: 'hangar', ruta: s.rutas[0].id }; break;
    case 'verMision': { const m = M.misionActual(s); if (m && guia.hecha) { A.sonar('paso'); mundo.pedida(); verRed(); } break; }
    case 'paso': tocarPaso(); break;
    case 'verCiudad': elegir({ tipo: 'ciudad', id: d.id }); break;
    case 'verRuta': elegir({ tipo: 'ruta', id: d.id }); break;
    case 'verHangar': elegir({ tipo: 'hangar', ruta: d.id }, { camara: false }); break;
    case 'verAvion': elegir({ tipo: 'avion', id: +d.id }, { camara: false }); break;
    case 'volverRuta': { const r = sel?.ruta ?? s.aviones.find((a) => a.id === sel?.id)?.ruta; if (r) elegir({ tipo: 'ruta', id: r }, { camara: false }); else sel = null; break; }
    case 'abrirRuta': {
      const marca = Libro.marcaGastos(s), r = M.abrirRuta(s, d.a, d.b);
      if (!r.ok) { negar(el); break; }
      Libro.anotarCompra(libro, s, { tipo: 'ruta', a: d.a, b: d.b }, null, { costo: Libro.costoDesde(s, marca), ruta: r.ruta.id });
      trasAccion();
      sel = { tipo: 'hangar', ruta: r.ruta.id };
      if (guia.paso === 'ruta') pasoGuia('avion'); else marcarBoton('[data-accion="comprar"]:not(.no)', 6000);
      guardarPronto = true; ultimaSug = 0;
      break;
    }
    case 'comprar': {
      const r = comprarCon({ tipo: 'avion', id: d.id, ruta: d.ruta }, () => M.comprarAvion(s, d.id, d.ruta), (x) => ({ ruta: d.ruta, avion: x.avion.id, tipoAvion: d.id }));
      if (!r.ok) { negar(el); break; }
      trasAccion();
      // comprado: el panel se cierra y el reloj vuelve a correr, así se ve al avión salir
      sel = null; marcaBoton = null;
      if (guia.paso === 'avion') { pasoGuia('vuela'); setTimeout(() => { mundo.seguir(r.avion.id); mundo.controles.dollyTo(innerWidth < 640 ? 5.2 : 3.6, true); mundo.controles.rotatePolarTo(1.02, true); }, 500); }
      else { const ru = rutaDe(d.ruta); if (ru) mundo.asegurarVisible([mundo.ciudades.get(ru.a).pos, mundo.ciudades.get(ru.b).pos], { izquierda: ladoMision(), abajo: innerWidth < 640 ? 0.14 : 0 }); }
      guardarPronto = true; ultimaSug = 0;
      break;
    }
    case 'faros': {
      const r = comprarCon({ tipo: 'faros', ruta: d.id }, () => M.ponerBalizas(s, d.id), () => ({ ruta: d.id }));
      if (!r.ok) { negar(el); break; }
      trasAccion(); sel = null; marcaBoton = null; guardarPronto = true; ultimaSug = 0;
      break;
    }
    case 'agrandar': {
      const r = comprarCon({ tipo: 'correo', ap: d.id }, () => M.mejorarTransbordo(s, d.id), () => ({ ap: d.id }));
      if (!r.ok) { negar(el); break; }
      A.sonar('compra'); trasAccion(); sel = null; marcaBoton = null;
      const c = mundo.ciudades.get(d.id); if (c) mundo.chispas(c.pos.clone().setY(c.pos.y + 0.15), 30);
      guardarPronto = true; ultimaSug = 0; break;
    }
    case 'salida': M.fijarCargaMinima(s, d.id, +d.v); Libro.anotarCambio(libro, s, 'salida', d.id); A.sonar('clic'); ultimaSug = 0; break;
    case 'cerrarRuta': U.ventana({ titulo: t('cerrarRuta'), html: `<p>${esc(t('cerrarRutaPregunta'))}</p>`, botones: [{ txt: t('cerrarRuta'), accion: 'cerrarRutaSi', clase: 'peligro', datos: `data-id="${d.id}"` }, { txt: t('no'), accion: 'cerrarVentana', clase: 'suave' }] }); break;
    case 'cerrarRutaSi': { const monto = s.aviones.filter((a) => a.ruta === d.id).reduce((a, av) => a + Math.round(M.AV[av.tipo].precio * ECONOMIA.venta), 0); M.cerrarRuta(s, d.id); Libro.anotarVenta(libro, s, monto, d.id); Libro.anotarCambio(libro, s, 'cierre', d.id); trasAccion(); sel = null; U.ventana(null); guardarPronto = true; break; }
    case 'vender': { const av = s.aviones.find((a) => a.id === +d.id), r = M.venderAvion(s, +d.id); if (r.ok) { Libro.anotarVenta(libro, s, r.monto, av?.ruta ?? null); A.sonar('cobro'); trasAccion(); sel = null; guardarPronto = true; } break; }
    // seguir a un avión: el panel se cierra (con el panel abierto el reloj está frenado y el avión no se movería)
    case 'seguirAvion': sel = null; mundo.pedida(); mundo.seguir(+d.id); mundo.controles.dollyTo(Math.min(mundo.distFinal(), 4), true); A.sonar('paso'); break;
    case 'aceptarEncargo': { const r = M.aceptarContrato(s, +d.id); if (r?.ok) { A.sonar('abrir'); trasAccion(); if (encargosAbiertos()) abrirEncargos(); } else negar(el); break; }
    case 'ordenar': M.elegirClasificacion(s, d.id); trasAccion(); A.sonar('clic'); break; // la tarjeta la cierra la fila, al ver que ya hay respuesta
    case 'sonido': A.alternarSonido(); abrirMenu(); A.sonar('clic'); break;
    case 'musica': A.alternarMusica(); abrirMenu(); break;
    case 'calidad': cambiarCalidad(); abrirMenu(); break;
    case 'reiniciar': U.ventana({ titulo: t('reiniciar'), html: `<p>${esc(t('reiniciarPregunta'))}</p>`, botones: [{ txt: t('si'), accion: 'reiniciarYa', clase: 'peligro' }, { txt: t('no'), accion: 'cerrarVentana', clase: 'suave' }] }); break;
    case 'reiniciarYa': almacen.del(CLAVE); almacen.del(CLAVE_EXTRA); location.href = location.pathname + (q.get('calidad') ? `?calidad=${q.get('calidad')}` : ''); break;
    case 'recargar': location.reload(); break;
    case 'siguienteCapitulo': siguienteCapitulo(); break;
    default: break;
  }
  // la respuesta a un toque se ve en el acto, no en el próximo refresco; y «Siguiente paso» se vuelve a calcular con el estado nuevo
  if (escena === 'juego') { ultimaSug = 0; pasoFijo = null; avanzarCola(); refrescar(performance.now()); }
}
// «Siguiente paso»: hace lo que dice el botón (el que se ve, no uno vuelto a calcular). Si es una compra, lleva al lugar y marca el
// botón que hay que tocar; si falta plata, abre el lugar para ver la cuenta; si no hay nada que decidir, sigue a un avión con la
// cámara (o abre la oficina).
function tocarPaso() {
  A.sonar('paso');
  if (guia.paso === 'sigue') terminarGuia();
  if (!pasoAhora) { if (!sug) { sug = M.sugerencia(s); pasoMision = calcularPasoMision(); } pasoAhora = pasoSugerido(); }
  const p = pasoAhora;
  ultimaSug = 0;
  if (p.mirar === 'avion') { mirarAvion(); return; }
  if (p.mirar === 'oficina') { Puente.abrirOficina(); return; }
  if (p.pasivo) return;
  const d = p.d;
  if (!d) { mundo.pedida(); verRed(); return; }
  const pedida = { camara: 'pedida' };
  const abrirRuta = (x) => { const afuera = ciudadNueva(x); elegir({ tipo: 'ciudad', id: afuera, desde: afuera === x.b ? x.a : x.b }, pedida); };
  switch (d.tipo) {
    case 'ruta': abrirRuta(d); marcarBoton('[data-accion="abrirRuta"]'); break;
    case 'avion': elegir({ tipo: 'hangar', ruta: d.ruta, id: d.ruta }, pedida); marcarBoton(`[data-accion="comprar"][data-id="${d.id}"]`); break;
    case 'balizas':
      elegir({ tipo: 'ruta', id: d.id }, pedida); marcarBoton('[data-accion="faros"]', ayudaNoche ? 40000 : 7000);
      if (ayudaNoche) { ayudaNoche.hasta = performance.now() + 40000; U.burbuja(t('g_noche2'), 'faro'); }
      break;
    case 'transbordo': elegir({ tipo: 'ciudad', id: d.id }, pedida); marcarBoton('[data-accion="agrandar"]'); break;
    case 'cargaMin': elegir({ tipo: 'ruta', id: d.id }, pedida); marcarBoton(`[data-accion="salida"][data-v="${d.v}"]`); break;
    case 'contrato': if (innerWidth < 640) abrirEncargos(); marcarBoton(`[data-accion="aceptarEncargo"][data-id="${d.id}"]`); break;   // en el celular la lista se abre desde su pastilla
    case 'vender': { const av = s.aviones.find((a) => a.id === d.id); if (av) { elegir({ tipo: 'avion', id: av.id }, pedida); marcarBoton('[data-accion="vender"]'); } break; }
    case 'clasificar': ofrecerOrden(true); break;
    case 'junta': {           // falta plata: se abre el lugar, donde está la misma cuenta al lado del botón
      const o = d.obj; verEnPanel = '.mal';
      if (o.tipo === 'ruta') abrirRuta(o.a ? o : { a: String(o.id).split('-')[0], b: String(o.id).split('-')[1] });
      else if (o.tipo === 'avion' && rutaDe(o.ruta)) elegir({ tipo: 'hangar', ruta: o.ruta, id: o.ruta }, pedida);
      else if (o.tipo === 'balizas' && rutaDe(o.id)) elegir({ tipo: 'ruta', id: o.id }, pedida);
      else if (o.tipo === 'transbordo') elegir({ tipo: 'ciudad', id: o.id }, pedida);
      break;
    }
    default: mundo.pedida(); verRed();
  }
}

function abrirMenu() {
  const fila = (acc, ico, txt, est = '') => `<button class="fila" data-accion="${acc}">${icono(ico)}<span>${esc(txt)}</span>${est ? `<span class="est">${esc(est)}</span>` : ''}</button>`;
  const cal = mundo.calidad.fijo ? t(`q_${mundo.calidad.nombre}`) : t('q_auto');
  U.ventana({ titulo: t('menu'), html: `<div class="lista-menu">
    ${fila('empresa', 'base', t('tuEmpresa'), empresaActual().nombre)}
    ${oficinaLista() ? fila('oficina', 'oficina', t('oficina')) : ''}
    ${fila('glosario', 'libro', t('glosario'))}
    ${fila('sonido', A.sonidoActivo() ? 'sonido' : 'mudo', t('sonido'), A.sonidoActivo() ? '✓' : '—')}
    ${fila('musica', 'musica', t('musica'), A.musicaActiva() ? '✓' : '—')}
    ${fila('idioma', 'idioma', t('idioma'))}
    ${fila('calidad', 'graficos', t('calidad'), cal)}
    ${fila('reiniciar', 'reinicio', t('reiniciar'))}</div><p class="chica">${esc(t('creditos'))} · ${Math.round(mundo.medidor.fps)} fps</p>` });
}
// El lugar mínimo para cambiar el nombre y el color de la empresa (la pantalla linda la hace la oficina, con accionOficina).
function abrirEmpresa() {
  const e = empresaActual(); colorTmp = e.color;
  U.ventana({ titulo: t('tuEmpresa'), html: `<label class="campo" for="emp-nombre">${esc(t('empNombre'))}</label><input id="emp-nombre" maxlength="24" autocomplete="off" spellcheck="false" value="${esc(e.nombre)}">
    <span class="campo">${esc(t('empColor'))}</span><div class="colores">${COLORES.map(([k, c]) => `<button data-accion="empColor" data-v="${c}" style="--c:${c}" class="${c === e.color ? 'activa' : ''}" aria-label="${esc(t(`col_${k}`))}" title="${esc(t(`col_${k}`))}"></button>`).join('')}</div>`,
    botones: [{ txt: t('empGuardar'), accion: 'empGuardar', ico: 'check' }] });
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
// (arrastrar, la rueda, el pellizco y el doble toque los atiende el mundo: mundo.gestos())
function entrada() {
  const lienzo = document.querySelector('#mundo');
  let abajo = null;
  lienzo.addEventListener('pointerdown', (e) => { abajo = e.isPrimary === false ? null : { x: e.clientX, y: e.clientY, t: e.timeStamp }; A.iniciarAudio(); });
  lienzo.addEventListener('pointerup', (e) => {
    if (!abajo) return;
    const mov = Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y), dt = e.timeStamp - abajo.t; abajo = null; // la hora del evento, no la de atenderlo: un equipo lento no convierte un toque en «apretar largo»
    if (mov > 9 || dt > 600 || escena !== 'juego' || e.button === 2) return;
    tocarMundo(e.clientX, e.clientY);
  });
  lienzo.addEventListener('contextmenu', (e) => e.preventDefault());
}
function tocarMundo(x, y) {
  const h = mundo.queHay(x, y);
  if (guiando() && guia.paso !== 'sigue') {
    if (guia.paso === 'tocar' && h?.tipo === 'ciudad' && h.id === 'MVD') { elegir({ tipo: 'ciudad', id: 'MVD', desde: M.HUB }, { camara: innerWidth < 640 ? 'pedida' : false }); pasoGuia('ruta'); refrescar(performance.now()); }
    return;
  }
  if (!h) { if (sel) { sel = null; A.sonar('cerrar'); refrescar(performance.now()); } return; }
  if (h.tipo === 'ciudad') elegir({ tipo: 'ciudad', id: h.id });
  else if (h.tipo === 'avion') { elegir({ tipo: 'avion', id: h.id }, { camara: false }); }
  else elegir({ tipo: 'ruta', id: h.id });
  refrescar(performance.now());
}
function tecla(e) {
  // con la oficina abierta el teclado es de ella (su campo de nombre vive en un árbol aparte: e.target es el contenedor)
  const donde = e.composedPath?.()[0] ?? e.target;
  if (escena !== 'juego' || oficinaAbierta || /^(INPUT|TEXTAREA|SELECT)$/.test(donde?.tagName ?? '') || e.ctrlKey || e.metaKey) return;
  if (e.key === ' ') { fijarVel(vel === 0 ? velElegida : 0); e.preventDefault(); }
  else if (e.key === '1') fijarVel(0.5); else if (e.key === '2') fijarVel(1); else if (e.key === '3') fijarVel(3);
  else if (e.key === '+' || e.key === '=') mundo.pasoZoom(1); else if (e.key === '-' || e.key === '_') mundo.pasoZoom(-1);
  else if (e.key === 'Enter' && enPantalla?.tipo === 'mision') accion('cerrarCartel', {}, null);       // «Seguir» en la misión cumplida
  else if (e.key === 'Escape') { if (U.ventanaAbierta()) accion('cerrarVentana', {}, null); else if (enPantalla?.tipo === 'mision') accion('cerrarCartel', {}, null); else if (sel) accion('cerrarPanel', {}, null); }
}

// ───────────── para las pruebas y las capturas ─────────────
function depuracion() {
  return {
    get mundo() { return mundo; }, get s() { return s; }, M, A, Libro, Puente, tandas,
    get libro() { return libro; },
    get estado() { return { escena, guia: guia.paso, hecha: guia.hecha, sel, vel, velElegida, corriendo: corriendo(), frenado: freno(), propia: mundo.propia, parte: partePend?.n ?? null, dinero: s.dinero, rutas: s.rutas.length, aviones: s.aviones.length, hora: M.hora(s), fps: mundo.medidor.fps, calidad: mundo.calidad.nombre, escalaRes: mundo.escalaRes, mision: M.misionActual(s)?.id }; },
    // adelanta el juego «seg» segundos reales sin dibujar (las capturas con GPU por software van lentas)
    avanzar(seg, paso = 1 / 30) { for (let i = 0; i < seg / paso; i++) { simular(paso); sincronizar(paso); mundo.controles.update(paso); mundo.tiempo += paso; if (mundo.cine) mundo.avanzarCine(paso); avanzarCola(); } refrescar(performance.now()); },
    // termina ya las cuentas de las tarjetas que estén en la fila (en el juego avanzan de a ratitos)
    cuentas() { let n = 0; while (tandas.pendientes() && n++ < 100000) tandas.tanda(); refrescar(performance.now()); return n; },
    accion, elegir, tocarPaso, verRed, pasoGuia, terminarGuia, fijarVel, empezar, datosOficina, accionOficina, fijarEmpresa, guardar,
    saltarGuia() { terminarGuia(); },
    ver(k) { vistos[k] = 1; },
    limpiar() { Libro.anotarEventos(libro, s, M.tomarEventos(s)); cola.length = 0; enPantalla = null; partePend = null; if (ayudaNoche) sel = null; cerrarGuiaNoche(); premiosPendientes = 0; U.cartel(null); U.momento(null); U.limpiarAvisos(); U.burbuja(null); },
    get fila() { return { enPantalla: enPantalla?.tipo ?? null, cola: cola.map((f) => f.tipo) }; },
    // el consejo del último parte, con su cuenta al peso (para medir consejo contra tarjeta)
    consejoParte() { const c = consejoParte; return c ? { clave: c.clave, texto: textoConsejo(c), decision: c.decision ?? null, dejaExacto: c.dejaExacto ?? null, costo: c.costo ?? null } : null; },
    get paso() { return pasoAhora ? { clave: pasoAhora.clave, clase: pasoAhora.clase, texto: pasoAhora.texto, detalle: pasoAhora.detalle ?? '' } : null; },
    // muestra el cartel de la última misión cumplida y lo deja quieto (para las capturas)
    verCartel() { const m = MISIONES.find((x) => x.id === s.misiones.at(-1)); if (!m) return false; U.cartel(t('misionCumplida'), `${t('mision')} ${MISIONES.filter((x) => x.cap === m.cap).indexOf(m) + 1} · ${textoMision(m)}`, m.premio, null, { seguir: t('seguirJugando') }); enPantalla = { tipo: 'mision', desde: performance.now(), hasta: performance.now() + 600000, f: { id: m.id, premio: 0 } }; return true; },
    // vuelve a mostrar el último resultado contra lo prometido y lo deja «ms» en pantalla (para las capturas)
    verResultado(ms = 60000) { const n = libro.notas.at(-1); if (!n) return false; mostrarResultado(n, ms); enPantalla = { tipo: 'momento', firme: true, desde: performance.now(), hasta: performance.now() + ms }; return true; },
  };
}

// Para la oficina (y para quien importe este módulo): las mismas funciones que puente-oficina.js.
export const { abrirOficina } = Puente;
export { datosOficina, accionOficina };

arrancar().catch((e) => { console.error(e); const c = $('#carga'); if (c) c.insertAdjacentHTML('beforeend', `<p style="max-width:80vw;text-align:center">${esc(String(e?.message ?? e))}</p>`); });
