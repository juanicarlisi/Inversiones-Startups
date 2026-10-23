// Simulación pura del juego (sin DOM): demanda, ruteo por el hub, transbordo, aviones, plata, misiones, contratos, ronda nocturna,
// ausencia y guardado. Se prueba con node --test (pruebas/*.test.mjs) y la miden los jugadores automáticos de herramientas/.
// El tiempo se mide en minutos de juego: s.t nunca retrocede (al pasar de capítulo se corre la fecha con s.t0).
import { AEROPUERTOS, AVIONES, CARGAS, TRANSBORDO, DEMANDA, CAPITULOS, MISIONES, ECONOMIA } from './datos.js';
import * as RONDA from './ronda.js';

export const VERSION = 2;
export const MIN_POR_SEG = 10;   // minutos de juego por segundo real a velocidad 1 (un día de juego = 144 s)
export const PASO = 5;           // minutos de juego por paso de simulación
export const HUB = 'BUE';
// Banderas de producto: la consulta legal puede pedir apagar la ganancia por ausencia; la ronda tiene compuerta propia.
export const CONFIG = { ausencia: true, ronda: true };

// Promesa por tipo de carga. Correo: a tiempo si llega en 8 h + km/150; tarde paga el 40%. Carga: 24 h + km/300; tarde, 60%.
// Pasajeros: si esperan más de 3 h en el origen o en una conexión, se van (y se cuentan como perdidos en esa ciudad).
export const PROMESA = {
  correo: { horas: 8, kmPorHora: 150, tarde: 0.4 },
  pasajeros: { esperaMax: 180 },
  carga: { horas: 24, kmPorHora: 300, tarde: 0.6 },
};
// Lo que la red le hace a la demanda: cada escala la baja y los rodeos también (por eso existen los hubs).
//  correo y carga × 1/(1 + escala × (tramos − 1)); pasajeros × conexionPax por cada conexión y nada con más de maxTramosPax tramos;
//  todas las cargas × (km directo / km recorrido)².
export const RED = { escala: 0.5, conexionPax: 0.5, maxTramosPax: 3 };
export const COLA_TB_HORAS = 6;      // la cola del centro de transbordo admite 6 horas de su capacidad
// Servicio del tramo (linaje: la calificación de estaciones de Transport Tycoon, 1994): la gente espera un vuelo cada tanto. Si por
// el primer tramo de un viaje no sale un avión hace más que el intervalo natural de esa ruta (lo que tardan sus aviones en ir y
// volver, repartido entre ellos, × ciclo) o que la gracia mínima, la gente manda menos: baja de a poco hasta la mitad en «caida»
// minutos. Así quedarse en tierra esperando llenar el avión cuesta demanda (frecuencia contra ocupación), y una ruta larga no se
// castiga por ser larga: se castiga si sus aviones esperan de más.
export const SERVICIO = { gracia: 60, ciclo: 1, caida: 240, piso: 0.5 };
const factorEspera = (sinSalir, gracia) => {
  const h = sinSalir - gracia;
  return h <= 0 ? 1 : Math.max(SERVICIO.piso, 1 - (1 - SERVICIO.piso) * h / SERVICIO.caida);
};
// Gracia de cada ruta con aviones (minutos): el intervalo natural entre salidas por sentido, nunca menos que SERVICIO.gracia.
const cacheGracia = new WeakMap();
function graciaRutas(s) {
  const R = red(s), c = cacheGracia.get(s);
  if (c && c.R === R && c.v === s.verRed) return c.g;
  const frec = {};
  for (const av of s.aviones) {
    const r = R.porId[av.ruta], t = AV[av.tipo];
    if (r) frec[r.id] = (frec[r.id] ?? 0) + 1 / (2 * (r.km / t.vel * 60 + t.giro));
  }
  const g = {};
  for (const id in frec) g[id] = Math.max(SERVICIO.gracia, SERVICIO.ciclo / frec[id]);
  cacheGracia.set(s, { R, v: s.verRed, g });
  return g;
}
export function factorServicio(s, a, b) {
  const t = s.ultSalida?.[`${a}>${b}`];
  return t === undefined ? 1 : factorEspera(s.t - t, graciaRutas(s)[idRuta(a, b)] ?? SERVICIO.gracia);
}
export const ESPERA_MAX = 240;       // minutos que un avión espera la carga mínima antes de salir igual
// Ganancia por ausencia decreciente: rinde el 50% durante las primeras 2 h, el 20% hasta las 24 h y nada después, sobre lo que la
// red gana por hora a ritmo de ausencia (un décimo de la velocidad normal: 1 h afuera = 2,5 días de juego). Así una noche afuera
// (14 h) acredita unos 8,5 días de ganancia de la red, un día entero unos 13,5, y nunca más que jugar el mismo tiempo.
// (Leída sobre la velocidad normal, la misma curva daría hasta 135 días de ganancia por 24 h y salteaba la historia.)
export const AUSENCIA = { tramos: [[2, 0.5], [24, 0.2]], ritmo: 0.1, muestraMin: 360, muestraMax: 1440, paso: 15 }; // pasos de 15 min: la vuelta no congela la página
export const RONDA_CADA = 3;         // como máximo una noche de ronda cada 3 noches de juego
export const PISTA_MIN = 200;        // minutos de juego sin avanzar antes de mostrar una pista
const VENTA = ECONOMIA.venta;

export const AP = Object.fromEntries(AEROPUERTOS.map((a) => [a.id, a]));
const MIS = Object.fromEntries(MISIONES.map((m) => [m.id, m]));
export const AV = Object.fromEntries(AVIONES.map((a) => [a.id, a]));
const AP_IDX = Object.fromEntries(AEROPUERTOS.map((a, i) => [a.id, i]));
const CARGA_IDS = Object.keys(CARGAS);

// ───────────────────────── utilidades ─────────────────────────
// Distancias entre todos los aeropuertos, calculadas una vez (una tabla por índice: es la consulta más frecuente del modelo).
const N_AP = AEROPUERTOS.length;
const tablaKm = new Float64Array(N_AP * N_AP).fill(-1);
export function km(a, b) {
  const i = AP_IDX[a], j = AP_IDX[b];
  if (i === undefined || j === undefined) return kmReal(a, b);
  let v = tablaKm[i * N_AP + j];
  if (v < 0) { v = kmReal(a, b); tablaKm[i * N_AP + j] = tablaKm[j * N_AP + i] = v; }
  return v;
}
function kmReal(a, b) {
  const A = AP[a], B = AP[b];
  const r = Math.PI / 180;
  const dlat = (B.lat - A.lat) * r, dlon = (B.lon - A.lon) * r;
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(A.lat * r) * Math.cos(B.lat * r) * Math.sin(dlon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

function rng(s) { // mulberry32 sobre el estado, para que las pruebas sean repetibles
  s.semilla = (s.semilla + 0x6d2b79f5) >>> 0;
  let t = s.semilla;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const idRuta = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
export function tarifa(c, kmOD) { return CARGAS[c].base + CARGAS[c].porKm * kmOD; }
export const capTotal = (t) => Object.values(t.lleva).reduce((a, b) => a + b, 0);
export const costoCiclo = (t) => ECONOMIA.despegue + ECONOMIA.tasaTon * t.ton;

export function fecha(s) { return new Date(s.t0 + s.t * 60000); }
export function hora(s) { const f = fecha(s); return f.getUTCHours() + f.getUTCMinutes() / 60; }
export function esNoche(s) { const h = hora(s); return h >= 20 || h < 6; }
const minutoDelDia = (s) => { const f = fecha(s); return f.getUTCHours() * 60 + f.getUTCMinutes(); };
export const diaCalendario = (s) => Math.floor((s.t0 + s.t * 60000) / 86400000);
export function capitulo(s) { return CAPITULOS[s.cap - 1]; }
const inicioCapitulo = (c, t) => Date.UTC(c.inicio.a, c.inicio.m - 1, c.inicio.d, 9, 0) - t * 60000; // arranca a las 09:00

// Eventos que producen las acciones del jugador (abrir, comprar, aceptar…): se entregan en el próximo paso() o con tomarEventos().
const pendientes = new WeakMap();
const emitir = (s, e) => { let l = pendientes.get(s); if (!l) pendientes.set(s, (l = [])); l.push(e); };
export function tomarEventos(s) { const l = pendientes.get(s) ?? []; pendientes.set(s, []); return l; }

// Fecha del dispositivo (la fija la interfaz): solo la usa el Correo de Navidad.
let fechaDispositivo = null;
export function fijarFechaDispositivo(ms) { fechaDispositivo = ms; }

// ───────────────────────── estado ─────────────────────────
const statsVacias = () => ({
  entregas: { correo: 0, pasajeros: 0, carga: 0 }, entregasEn: {}, transbordos: {}, perdidas: 0, perdidasAp: {},
  ingresos: 0, gastos: 0, despNoche: 0, aTiempo: 0, tarde: 0, mejorDia: 0, ultimoVuelo: null, trabadas: {}, vuelos: 0,
  perdTramo: {}, perdTramo0: {}, perdTramoAyer: {}, ventasForzadas: 0,
  km: 0,            // km volados con carga (para el resumen del capítulo)
  inicioCap: null,  // totales al empezar el capítulo (el resumen de fin de capítulo resta esto)
});

export function nuevoEstado(semilla = 20291101) {
  const c = CAPITULOS[0];
  const s = {
    v: VERSION, cap: 1, semilla,
    sem0: semilla,            // la semilla con que empezó la partida (las fases de la demanda no cambian con el azar del clima)
    t0: inicioCapitulo(c, 0), t: 0,
    dinero: c.dineroInicial,
    niveles: {},              // nivel del centro de transbordo por aeropuerto
    rutas: [],
    aviones: [],
    colas: {},                // aeropuerto → «destino>carga[>contrato]» → grupo { d, c, n, tc, p, km, tl?, k? }
    transbordo: {},           // aeropuerto → grupos que esperan clasificación
    stats: statsVacias(),
    hora24: Array(24).fill(0), horaIdx: 0, netoHora: 0,
    misiones: [], mision: null,
    contratos: { tablero: [], activos: [], dia: null, sig: 1, cumplidos: 0 },
    banco: {},
    ronda: { listo: false, ultima: null, noche: null, historial: [] },
    clima: { combustible: 1, tormenta: null, pronostico: null },
    flags: {},
    diario: { hoy: {}, dias: [] },
    ultVuelo: {}, ultSalida: {},
    dia: null,
    sigId: 1, verRed: 0, verTopo: 0,
  };
  s.dia = diaCalendario(s);
  activarMision(s); // el correo de la primera misión ya espera en Buenos Aires: sale apenas la ruta tiene avión
  return s;
}

// ───────────────────────── red y ruteo ─────────────────────────
// La red para rutear usa solo rutas con al menos un avión: una ruta vacía no se traga el tráfico. BFS por escalas; a igual
// cantidad de escalas, menos km. Dos contadores de versión, sin join en cada llamada:
//  - s.verRed sube al abrir o cerrar rutas y al comprar o vender aviones (lo usan las cachés que dependen de la flota: capacidad
//    por ruta, frecuencia, costo medio de la flota);
//  - s.verTopo sube solo cuando cambia el dibujo de la red (una ruta abierta o cerrada, una ruta que gana su primer avión o pierde
//    el último): la red, los pares con su demanda y los flujos dependen solo de eso. Sumar el quinto avión a una ruta no rehace el
//    ruteo de todo el continente.
const cacheRed = new WeakMap();
export function red(s) {
  const c = cacheRed.get(s);
  if (c && c.ver === (s.verTopo ?? 0) && c.nr === s.rutas.length) return c;
  const conAvion = new Set();
  for (const av of s.aviones) conAvion.add(av.ruta);
  const adj = {}, tocados = new Set(), porId = {};
  for (const r of s.rutas) {
    porId[r.id] = r; tocados.add(r.a); tocados.add(r.b);
    if (!conAvion.has(r.id)) continue;
    (adj[r.a] ??= []).push(r.b); (adj[r.b] ??= []).push(r.a);
  }
  const nodos = Object.keys(adj);
  const sig = {}, tramos = {}, kmRec = {};
  for (const o of nodos) {
    const dist = { [o]: 0 }, kmAc = { [o]: 0 }, prim = {};
    let frente = [o];
    while (frente.length) {
      const nuevo = [];
      for (const u of frente) for (const v of adj[u]) {
        const k = kmAc[u] + km(u, v);
        if (dist[v] === undefined) { dist[v] = dist[u] + 1; kmAc[v] = k; prim[v] = u === o ? v : prim[u]; nuevo.push(v); }
        else if (dist[v] === dist[u] + 1 && k < kmAc[v]) { kmAc[v] = k; prim[v] = u === o ? v : prim[u]; }
      }
      frente = nuevo;
    }
    delete dist[o]; delete kmAc[o];
    sig[o] = prim; tramos[o] = dist; kmRec[o] = kmAc;
  }
  const res = { ver: s.verTopo ?? 0, nr: s.rutas.length, adj, nodos, sig, tramos, kmRec, tocados, porId };
  cacheRed.set(s, res);
  return res;
}
// topo: el cambio altera el dibujo de la red (no solo la flota).
const cambioRed = (s, topo = true) => { s.verRed = (s.verRed ?? 0) + 1; if (topo) s.verTopo = (s.verTopo ?? 0) + 1; };
const conAvion = (s, rutaId) => s.aviones.some((a) => a.ruta === rutaId);

export function enRed(s, ap) { return red(s).tocados.has(ap); }   // tocada por alguna ruta (para abrir rutas desde ahí)
export function servido(s, ap) { return !!red(s).adj[ap]; }        // con al menos una ruta con avión
export function nodosRed(s) { return [...red(s).tocados]; }
export function iluminada(s, r) { return !!r.balizas || s.cap >= 2; } // desde 1946 se vuela de noche con instrumentos

// Factor de demanda de un itinerario: escalas y rodeo.
export function factorRed(c, tramos, kmDirecto, kmRecorrido) {
  const rodeo = (kmDirecto / Math.max(kmDirecto, kmRecorrido)) ** 2;
  if (c === 'pasajeros') return tramos > RED.maxTramosPax ? 0 : RED.conexionPax ** (tramos - 1) * rodeo;
  return rodeo / (1 + RED.escala * (tramos - 1));
}

// ───────────────────────── reglas de compra ─────────────────────────
// Balizas: $20 por km de ruta (las primeras, a mitad de precio una sola vez).
export const BALIZAS_KM = 20;
export function costoRuta(a, b) { return Math.round((2000 + 5 * km(a, b)) / 100) * 100; }
export function costoBalizas(ruta, s = null) {
  const base = Math.round(BALIZAS_KM * ruta.km / 100) * 100;
  return s && !s.flags.balizas ? Math.round(base / 200) * 100 : base; // las primeras balizas cuestan la mitad, una sola vez
}
export function misionHecha(s, id) { return s.misiones.includes(id); }

export function ciudadDisponible(s, ap) {
  const a = AP[ap];
  return !!a && a.cap <= s.cap && (!a.abre || misionHecha(s, a.abre) || MISIONES.find((m) => m.id === a.abre)?.cap < s.cap);
}
export function avionDisponible(s, tipo) {
  const t = typeof tipo === 'string' ? AV[tipo] : tipo;
  if (!t || t.cap > s.cap || (t.venta && (s.cap < t.venta.desde || s.cap > t.venta.hasta))) return false;
  return !t.desbloquea || misionHecha(s, t.desbloquea);
}
export function avionesDisponibles(s) { return AVIONES.filter((t) => avionDisponible(s, t)); }

export function costoVuelo(s, t, r) {
  return Math.round(r.km * t.costoKm * s.clima.combustible + t.tripHora * r.km / t.vel + costoCiclo(t));
}
// Lo que tiene que quedar en la caja después de un gasto: el combustible de N vuelos (el promedio de la flota, o el del avión que
// se compra si es más caro) más 12 horas de la flota parada (una noche sin volar).
// Totales de la flota (costo medio de un vuelo y costo por hora parada): cambian solo al comprar o vender (versión de la red) o
// cuando se mueve el precio del combustible, así que se guardan en caché.
const cacheFlota = new WeakMap();
function totalesFlota(s) {
  const R = red(s), c = cacheFlota.get(s);
  if (c && c.R === R && c.v === s.verRed && c.comb === s.clima.combustible) return c;
  let suma = 0, n = 0, tierra = 0;
  for (const av of s.aviones) { const r = R.porId[av.ruta]; tierra += AV[av.tipo].tierraHora; if (r) { suma += costoVuelo(s, AV[av.tipo], r); n++; } }
  const x = { R, v: s.verRed, comb: s.clima.combustible, medio: n ? suma / n : 0, tierra };
  cacheFlota.set(s, x);
  return x;
}
export function reserva(s, extra = null, vuelos = ECONOMIA.reservaVuelos, horas = ECONOMIA.horasReserva) {
  const f = totalesFlota(s);
  const tierra = f.tierra + (extra ? extra.t.tierraHora : 0);
  return vuelos * Math.max(f.medio, extra ? costoVuelo(s, extra.t, extra.r) : 0) + horas * tierra;
}
// La mejor próxima acción nunca deja la caja por debajo del costo de 2 vuelos (promedio de la flota).
const reservaSugerencia = (s) => reserva(s, null, ECONOMIA.reservaSugerencia, 0);

export function puedeAbrirRuta(s, a, b) {
  if (a === b || !AP[a] || !AP[b]) return { ok: false, error: 'invalida' };
  if (!ciudadDisponible(s, a) || !ciudadDisponible(s, b)) return { ok: false, error: 'bloqueada' };
  const id = idRuta(a, b);
  if (s.rutas.some((r) => r.id === id)) return { ok: false, error: 'existe' };
  const R = red(s);
  if (R.tocados.size === 0 ? a !== HUB && b !== HUB : !R.tocados.has(a) && !R.tocados.has(b)) return { ok: false, error: 'desconectada' };
  const d = km(a, b);
  if (!avionesDisponibles(s).some((t) => t.alcance >= d)) return { ok: false, error: 'alcance', km: d };
  const costo = costoRuta(a, b);
  if (s.dinero < costo) return { ok: false, error: 'plata', costo };
  return { ok: true, costo, km: d };
}

export function abrirRuta(s, a, b) {
  const p = puedeAbrirRuta(s, a, b);
  if (!p.ok) return p;
  gastar(s, p.costo);
  const ruta = { id: idRuta(a, b), a, b, km: p.km, balizas: false, minCarga: 0.6, esperaMax: ESPERA_MAX, vuelos: 0, ingresos: 0, costos: 0, ocup: 0, unidades: 0 };
  s.rutas.push(ruta);
  cambioRed(s);
  revisarYEmitir(s);
  return { ok: true, ruta };
}

export function cerrarRuta(s, id) {
  const r = s.rutas.find((x) => x.id === id);
  if (!r) return { ok: false };
  for (const av of s.aviones.filter((x) => x.ruta === id)) venderAvion(s, av.id);
  s.rutas = s.rutas.filter((x) => x.id !== id);
  cambioRed(s);
  return { ok: true };
}

export function puedeComprar(s, tipoId, rutaId) {
  const t = AV[tipoId], r = s.rutas.find((x) => x.id === rutaId);
  if (!t || !r) return { ok: false, error: 'invalida' };
  if (!avionDisponible(s, t)) return { ok: false, error: 'bloqueado' };
  if (t.alcance < r.km) return { ok: false, error: 'alcance', km: r.km };
  if (s.dinero < t.precio) return { ok: false, error: 'plata', costo: t.precio };
  const res = reserva(s, { t, r });
  if (s.dinero - t.precio < res) return { ok: false, error: 'reserva', costo: t.precio + res };
  return { ok: true, costo: t.precio };
}

export function comprarAvion(s, tipoId, rutaId) {
  const p = puedeComprar(s, tipoId, rutaId);
  if (!p.ok) return p;
  const t = AV[tipoId], r = s.rutas.find((x) => x.id === rutaId);
  gastar(s, t.precio);
  const base = r.a === HUB || r.b === HUB ? HUB : r.a;
  const primero = !conAvion(s, rutaId);
  // Sale enseguida: el primer control de carga es en el próximo paso, y el vuelo cuenta desde el comienzo de ese paso (así el primer
  // cobro de la partida llega antes de los 10 s también con los 3 toques de la interfaz).
  const av = { id: s.sigId++, tipo: tipoId, ruta: rutaId, en: base, hacia: base === r.a ? r.b : r.a,
    fase: 'tierra', resta: 0, dur: PASO, carga: [], espera: null, v: 0, ing: 0, cos: 0, desde: s.t };
  s.aviones.push(av);
  cambioRed(s, primero);
  revisarYEmitir(s);
  return { ok: true, avion: av };
}

export function venderAvion(s, avionId) {
  const av = s.aviones.find((x) => x.id === avionId);
  if (!av) return { ok: false };
  const monto = Math.round(AV[av.tipo].precio * VENTA);
  s.dinero += monto;
  s.aviones = s.aviones.filter((x) => x.id !== avionId);
  // Si estaba en vuelo, su carga vuelve al aeropuerto de salida (no se pierde por vender).
  for (const x of av.carga) sumarCola(s, av.en, x.d, x.c, x.n, x.tc, x.p, x.km, x.k);
  const ultimo = !conAvion(s, av.ruta);
  cambioRed(s, ultimo);
  if (ultimo) barrerSinCamino(s, av.ruta);
  revisarYEmitir(s);
  return { ok: true, monto };
}

export function ponerBalizas(s, rutaId) {
  const r = s.rutas.find((x) => x.id === rutaId);
  if (!r || r.balizas) return { ok: false };
  const costo = costoBalizas(r, s);
  if (s.dinero < costo) return { ok: false, error: 'plata', costo };
  gastar(s, costo); r.balizas = true; s.flags.balizas = true;
  revisarYEmitir(s);
  return { ok: true, costo };
}

// Carga mínima: el avión sale cuando junta esa parte de su capacidad o cuando cumple la espera máxima de esa opción
// (lo que haya: sale enseguida; 30%: hasta 2 h; 60%: hasta 4 h; lleno: hasta llenarse, 12 h como mucho). Frecuencia contra
// ocupación contra puntualidad: en los tramos cargados conviene llenar; en los flacos, esperar a llenar hace llegar tarde.
export const CARGA_MINIMA = [0, 0.3, 0.6, 0.9];
export const ESPERA_CARGA = { 0: 0, 0.3: 120, 0.6: 240, 0.9: 720 };
export function fijarCargaMinima(s, rutaId, v) {
  const r = s.rutas.find((x) => x.id === rutaId);
  if (!r || !CARGA_MINIMA.includes(v)) return { ok: false };
  r.minCarga = v; r.esperaMax = ESPERA_CARGA[v]; return { ok: true };
}

export function capacidadTransbordo(s, ap) { return TRANSBORDO[s.niveles[ap] ?? 0].u; }
// Precio del próximo nivel del centro de transbordo (null si ya está al máximo): lo muestra el botón de mejorar.
export function costoTransbordo(s, ap) { return TRANSBORDO[(s.niveles[ap] ?? 0) + 1]?.precio ?? null; }
export function mejorarTransbordo(s, ap) {
  const n = (s.niveles[ap] ?? 0) + 1;
  if (n >= TRANSBORDO.length) return { ok: false, error: 'maximo' };
  const costo = TRANSBORDO[n].precio;
  if (s.dinero < costo) return { ok: false, error: 'plata', costo };
  gastar(s, costo); s.niveles[ap] = n;
  revisarYEmitir(s);
  return { ok: true, costo };
}

function gastar(s, monto) { s.dinero -= monto; s.stats.gastos += monto; }

// ───────────────────────── colas e índice de unidades listas ─────────────────────────
// Índice de unidades listas para cargar por [aeropuerto][próximo salto][carga] (y las llaves de sus grupos), mantenido en
// sumarCola() y quitarCola(). No se guarda: se rehace cuando cambia la red.
const indices = new WeakMap();
function indice(s) {
  const R = red(s);
  let x = indices.get(s);
  if (x && x.R === R) return x;
  x = { R, n: {}, k: {} };
  for (const ap in s.colas) {
    const cola = s.colas[ap], sig = R.sig[ap];
    if (!sig) continue;
    for (const k in cola) { const g = cola[k], h = sig[g.d]; if (h) idxSumar(x, ap, h, g.c, k, g.n); }
  }
  indices.set(s, x);
  return x;
}
function idxSumar(x, ap, h, c, k, n) {
  const a = (x.n[ap] ??= {}), b = (a[h] ??= {});
  b[c] = (b[c] ?? 0) + n;
  if (k) ((x.k[ap] ??= {})[h] ??= new Set()).add(k);
}
function idxVigente(s) { const x = indices.get(s); return x && x.R === red(s) ? x : null; }

const llaveGrupo = (d, c, k) => (k ? `${d}>${c}>${k}` : `${d}>${c}`);
// Al fundir dos grupos, los promedios se redondean a lo que guarda el guardado (minutos enteros, centésimos de lo cobrado, km
// enteros): así guardar y restaurar deja la partida exactamente igual, sin que un redondeo cambie la hora de salida de un avión.
function fundir(g, n, tc, p, kmOD, tl) {
  const tot = g.n + n;
  g.tc = Math.round((g.tc * g.n + tc * n) / tot);
  g.p = r2((g.p * g.n + p * n) / tot);
  g.km = Math.round((g.km * g.n + kmOD * n) / tot);
  if (g.tl !== undefined) g.tl = Math.round((g.tl * g.n + (tl ?? tc) * n) / tot);
  g.n = tot;
}
function nuevoGrupo(d, c, n, tc, p, kmOD, k, tl) {
  const g = { d, c, n, tc, p, km: kmOD };
  if (c === 'pasajeros') g.tl = tl ?? tc;
  if (k) g.k = k;
  return g;
}
// Suma unidades a la cola de salida de un aeropuerto. tl = minuto en que llegaron a este aeropuerto (solo pasajeros).
function sumarCola(s, ap, d, c, n, tc, p, kmOD, k = 0, tl = undefined) {
  if (n <= 0) return;
  const cola = (s.colas[ap] ??= {});
  const llave = llaveGrupo(d, c, k);
  const g = cola[llave];
  if (g) fundir(g, n, tc, p, kmOD, tl ?? s.t);
  else cola[llave] = nuevoGrupo(d, c, n, tc, p, kmOD, k, tl ?? s.t);
  const x = idxVigente(s);
  if (x) { const h = x.R.sig[ap]?.[d]; if (h) idxSumar(x, ap, h, c, llave, n); }
}
function quitarCola(s, ap, llave, n) {
  const cola = s.colas[ap], g = cola?.[llave];
  if (!g) return;
  const x = idxVigente(s);
  if (x) {
    const h = x.R.sig[ap]?.[g.d];
    if (h) { x.n[ap][h][g.c] -= n; if (g.n - n <= 0) x.k[ap]?.[h]?.delete(llave); }
  }
  g.n -= n;
  if (g.n <= 0) delete cola[llave];
}
function sumarTb(s, ap, x, tl) {
  const tb = (s.transbordo[ap] ??= {});
  const llave = llaveGrupo(x.d, x.c, x.k);
  const g = tb[llave];
  if (g) fundir(g, x.n, x.tc, x.p, x.km, tl);
  else tb[llave] = nuevoGrupo(x.d, x.c, x.n, x.tc, x.p, x.km, x.k, tl);
}

// Lo que se pierde: se cuenta en total, por ciudad, por tramo (para flujoTramo) y en el diario (para los indicadores del hub).
function perder(s, ap, n, hacia = null, k = 0) {
  if (n <= 0) return;
  s.stats.perdidas += n;
  s.stats.perdidasAp[ap] = (s.stats.perdidasAp[ap] ?? 0) + n;
  diarioDe(s, ap).perd += n;
  if (hacia) { const t = `${ap}>${hacia}`; s.stats.perdTramo[t] = (s.stats.perdTramo[t] ?? 0) + n; }
  if (k) { const c = s.contratos.activos.find((x) => x.id === k); if (c) c.vivas = Math.max(0, c.vivas - n); }
}

// Cuando una ruta se queda sin aviones, lo que esperaba seguir por ella se re-rutea solo (las colas van por destino final);
// lo que ya no tiene camino se pierde y se cuenta en s.stats.trabadas[rutaId].
function barrerSinCamino(s, rutaId) {
  const R = red(s);
  let n = 0;
  for (const ap in s.colas) for (const llave of Object.keys(s.colas[ap])) {
    const g = s.colas[ap][llave];
    if (R.sig[ap]?.[g.d]) continue;
    n += g.n; perder(s, ap, g.n, null, g.k); delete s.colas[ap][llave];
  }
  for (const ap in s.transbordo) for (const llave of Object.keys(s.transbordo[ap])) {
    const g = s.transbordo[ap][llave];
    if (R.sig[ap]?.[g.d]) continue;
    n += g.n; perder(s, ap, g.n, null, g.k); delete s.transbordo[ap][llave];
  }
  if (n) s.stats.trabadas[rutaId] = (s.stats.trabadas[rutaId] ?? 0) + n;
}

export function enTransbordo(s, ap) { let n = 0; for (const g of Object.values(s.transbordo[ap] ?? {})) n += g.n; return n; }
export function enEspera(s, ap, c) { let n = 0; for (const g of Object.values(s.colas[ap] ?? {})) if (!c || g.c === c) n += g.n; return n; }

// ───────────────────────── demanda ─────────────────────────
function factorDistancia(c, d) {
  if (c === 'correo') return 0.7 + 0.3 * Math.min(1, d / 400);
  return (0.5 + 0.5 * Math.min(1, d / 500)) / (1 + d / 5000);
}
const enVentanaNavidad = (f) => f.getUTCMonth() === 11 && f.getUTCDate() >= 10 && f.getUTCDate() <= 24;
// Temporada: del 10 al 24 de diciembre el correo pesa ×1,8. La demanda mira solo la fecha del juego; el Correo de Navidad
// (un contrato) también mira la del dispositivo, para que aparezca en diciembre de verdad.
export function factorTemporada(s, c, conDispositivo = false) {
  if (c !== 'correo') return 1;
  if (enVentanaNavidad(fecha(s))) return 1.8;
  if (conDispositivo && fechaDispositivo != null && enVentanaNavidad(new Date(fechaDispositivo))) return 1.8;
  return 1;
}

export function demandaHora(s, o, d, c) {
  const era = capitulo(s).cargas[c];
  if (!era) return 0;
  return DEMANDA[c].k * era * Math.sqrt(AP[o].peso * AP[d].peso) * factorDistancia(c, km(o, d)) * factorTemporada(s, c);
}
// Demanda que de verdad usa la red: la de demandaHora por el factor de escalas y rodeo del itinerario actual.
export function demandaRed(s, o, d, c) {
  const R = red(s);
  const tr = R.tramos[o]?.[d];
  if (!tr) return 0;
  return demandaHora(s, o, d, c) * factorRed(c, tr, km(o, d), R.kmRec[o][d]);
}

const topeGrupo = (porHora) => Math.ceil(4 * porHora + 20); // 4 horas de demanda (y un piso para las rutas flacas)

// Pares origen-destino con su demanda por hora; se recalcula solo si cambia la red, el capítulo o la temporada.
const cachePares = new WeakMap();
function pares(s) {
  const R = red(s);
  const llave = `${R.ver}|${R.nr}|${s.cap}|${factorTemporada(s, 'correo')}`;
  const c = cachePares.get(s);
  if (c && c.llave === llave) return c.lista;
  const lista = [];
  const cargas = Object.keys(capitulo(s).cargas);
  for (const o of R.nodos) for (const d of R.nodos) {
    if (o === d || !R.sig[o][d]) continue;
    for (const cg of cargas) {
      const porHora = demandaRed(s, o, d, cg);
      if (porHora <= 0) continue;
      lista.push({ o, d, c: cg, k: `${o}>${d}>${cg}`, fase: hash32(`${s.sem0 ?? s.semilla}|${o}>${d}>${cg}`) / 4294967296, kc: `${d}>${cg}`, kh: `${o}>${R.sig[o][d]}`, rh: idRuta(o, R.sig[o][d]), km: km(o, d), porHora, tope: topeGrupo(porHora), h: R.sig[o][d] });
    }
  }
  cachePares.set(s, { llave, lista });
  return lista;
}

// Redondeo de la demanda sin estado: en cada paso, un par genera floor(esperado + u) unidades, con u la secuencia de Weyl del par
// (u = fracción de fase + paso × 0,618…; la fase sale de un hash del par). La secuencia reparte parejo, así que en pocos pasos el
// total es el esperado (como un acumulador), pero no hay fracciones que guardar: una partida restaurada sigue igual que la original.
function hash32(txt) { let h = 2166136261; for (let i = 0; i < txt.length; i++) h = Math.imul(h ^ txt.charCodeAt(i), 16777619); return h >>> 0; }
const AUREO = 0.6180339887498949;
function azarPaso(fase, paso) { const u = fase + paso * AUREO; return u - Math.floor(u); }
// Cada grupo de salida admite hasta 4 horas de su demanda (+20). Si está lleno, se descarta lo más viejo (que ya no llegaría a
// tiempo) y entra lo nuevo: así una ruta corta de aviones pierde demanda pero lo que lleva llega a tiempo, en vez de llevar
// siempre lo atrasado. Con llegadas parejas, sacar los k más viejos de n deja la edad promedio en (n − k) / n de la que era.
function generarDemanda(s, dt) {
  const fr = dt / 60, us = s.ultSalida, gr = graciaRutas(s), paso = Math.round(s.t / PASO);
  const tm = s.clima.tormenta && s.t < s.clima.tormenta.hasta ? new Set(s.clima.tormenta.zona) : null;
  for (const x of pares(s)) {
    if (tm && (tm.has(x.o) || tm.has(x.d))) continue; // con el aeropuerto cerrado por tormenta, nadie despacha correo aéreo hacia ahí
    const az = azarPaso(x.fase, paso);
    if (x.porHora * fr + az < 1) continue; // ni con el servicio completo llega a una unidad en este paso (la mayoría de los pares chicos)
    const u = us[x.kh];
    const f = u === undefined ? 1 : factorEspera(s.t - u, gr[x.rh] ?? SERVICIO.gracia);
    const n = Math.floor(x.porHora * f * fr + az);
    if (!n) continue;
    const g = s.colas[x.o]?.[x.kc];
    const sobra = (g?.n ?? 0) + n - x.tope;
    if (sobra > 0) {
      const viejos = Math.min(sobra, g?.n ?? 0);
      if (viejos > 0) {
        const quedan = g.n - viejos;
        g.tc = Math.round(s.t - (s.t - g.tc) * quedan / g.n);
        if (g.tl !== undefined) g.tl = Math.round(s.t - (s.t - g.tl) * quedan / g.n);
        quitarCola(s, x.o, x.kc, viejos);
      }
      perder(s, x.o, sobra, x.h);
    }
    const entra = Math.min(n, x.tope);
    if (entra > 0) sumarCola(s, x.o, x.d, x.c, entra, s.t, 0, x.km);
  }
  generarContratos(s, dt);
}

// ───────────────────────── transbordo ─────────────────────────
const urgente = (g) => (g.k ? 1 : 0); // lo de un contrato tiene prioridad en el centro y al cargar (es correo con plazo y premio)
function procesarTransbordo(s, dt) {
  const R = red(s);
  const noche = rondaEnCurso(s);
  for (const ap in s.transbordo) {
    const tb = s.transbordo[ap];
    const llaves = Object.keys(tb);
    if (!llaves.length) continue;
    // Por orden de llegada; en la noche de ronda, el hub clasifica según la prioridad que eligió el jugador.
    const prio = noche && ap === HUB ? s.banco[HUB]?.prioridad : null;
    if (prio) {
      const rango = Object.fromEntries(prio.map((id, i) => [id, i]));
      const rangoDe = (g) => { const h = R.sig[ap]?.[g.d]; return h ? rango[idRuta(ap, h)] ?? 99 : 99; };
      llaves.sort((x, y) => rangoDe(tb[x]) - rangoDe(tb[y]) || urgente(tb[y]) - urgente(tb[x]) || tb[x].tc - tb[y].tc);
    } else llaves.sort((x, y) => urgente(tb[y]) - urgente(tb[x]) || tb[x].tc - tb[y].tc); // el correo de contrato va primero
    // lo que el centro clasifica en este paso, sin fracciones guardadas: la capacidad repartida minuto a minuto
    const cap = capacidadTransbordo(s, ap);
    let presup = Math.floor(cap * s.t / 60) - Math.floor(cap * (s.t - dt) / 60);
    for (const llave of llaves) {
      const g = tb[llave];
      const h = R.sig[ap]?.[g.d];
      if (!h) { perder(s, ap, g.n, null, g.k); delete tb[llave]; continue; } // ya no hay camino
      const n = Math.min(g.n, Math.floor(presup));
      if (n <= 0) break;
      presup -= n; g.n -= n;
      sumarCola(s, ap, g.d, g.c, n, g.tc, g.p, g.km, g.k, g.tl);
      s.stats.transbordos[ap] = (s.stats.transbordos[ap] ?? 0) + n;
      if (g.n <= 0) delete tb[llave];
    }
  }
}

// Pasajeros que esperan más de 3 h se van. Las colas guardan el promedio de llegada (tl); con llegadas parejas, la edad va de 0 a
// 2 × promedio, así que se pierde la parte que pasa de 3 h y lo que queda tiene en promedio la mitad de la espera máxima.
function vencerPasajeros(s) {
  const max = PROMESA.pasajeros.esperaMax;
  const R = red(s);
  for (const ap in s.colas) for (const llave of Object.keys(s.colas[ap])) {
    const g = s.colas[ap][llave];
    if (g.c !== 'pasajeros') continue;
    const A = 2 * (s.t - g.tl);
    if (A <= max) continue;
    const n = Math.min(g.n, Math.round(g.n * (A - max) / A));
    g.tl = s.t - max / 2;
    if (n > 0) { const k = g.k; quitarCola(s, ap, llave, n); perder(s, ap, n, R.sig[ap]?.[g.d], k); }
  }
  for (const ap in s.transbordo) for (const llave of Object.keys(s.transbordo[ap])) {
    const g = s.transbordo[ap][llave];
    if (g.c !== 'pasajeros') continue;
    const A = 2 * (s.t - g.tl);
    if (A <= max) continue;
    const n = Math.min(g.n, Math.round(g.n * (A - max) / A));
    g.tl = s.t - max / 2; g.n -= n;
    perder(s, ap, n, null, g.k);
    if (g.n <= 0) delete s.transbordo[ap][llave];
  }
}

// ───────────────────────── aviones ─────────────────────────
function cerrado(s, ap) {
  const tm = s.clima.tormenta;
  return tm && s.t < tm.hasta && tm.zona.includes(ap);
}

// Unidades que esperan en «desde» para seguir hacia «hacia», hasta la capacidad del avión (lee el índice: no recorre colas).
function paraLlevar(s, desde, hacia, t) {
  const b = indice(s).n[desde]?.[hacia];
  if (!b) return 0;
  let n = 0;
  for (const c in t.lleva) n += Math.min(b[c] ?? 0, t.lleva[c]);
  return n;
}
// Para el contador «9/30» de la interfaz: lo que espera a ese avión en el aeropuerto donde está.
export function listoParaCargar(s, avionId) {
  const av = s.aviones.find((a) => a.id === avionId);
  if (!av || av.fase !== 'tierra') return 0;
  return paraLlevar(s, av.en, av.hacia, AV[av.tipo]);
}

// Ficha de un avión para la interfaz: lo que lleva (por destino), adónde va, en cuántos minutos de juego llega y cuánto deja el
// viaje (estimado como lo liquida el aterrizaje: tarifa × parte del tramo × puntualidad a la hora de llegada, menos el vuelo).
export function fichaAvion(s, avionId) {
  const av = s.aviones.find((a) => a.id === avionId);
  const r = av && s.rutas.find((x) => x.id === av.ruta);
  if (!r) return null;
  const t = AV[av.tipo], R = red(s), vuela = av.fase === 'vuelo';
  const llegaEn = vuela ? Math.max(0, av.resta) : null;
  let ingreso = 0, unidades = 0;
  const porDestino = {};
  for (const x of vuela ? av.carga : []) {
    const resto = x.d === av.hacia ? 0 : (R.kmRec[av.hacia]?.[x.d] ?? km(av.hacia, x.d));
    const parte = (1 - x.p) * r.km / (r.km + resto);
    ingreso += x.n * tarifa(x.c, x.km) * parte * puntualidad(x.c, s.t + llegaEn - x.tc, x.km);
    unidades += x.n;
    (porDestino[`${x.d}>${x.c}`] ??= { d: x.d, c: x.c, n: 0 }).n += x.n;
  }
  const costo = vuela ? (av.costoVuelo ?? 0) : costoVuelo(s, t, r);
  return { id: av.id, tipo: av.tipo, ruta: av.ruta, fase: av.fase, en: av.en, hacia: av.hacia, espera: av.espera ?? null,
    carga: Object.values(porDestino).sort((a, b) => b.n - a.n), unidades, capacidad: capTotal(t), llegaEn,
    ingresoEst: Math.round(ingreso), costo: Math.round(costo), netoEst: vuela ? Math.round(ingreso - costo) : null,
    listo: vuela ? 0 : listoParaCargar(s, av.id), neto: Math.round((av.ing ?? 0) - (av.cos ?? 0)), viajes: av.v ?? 0 };
}

// Totales que resume el fin de capítulo (entregas por carga, a tiempo, tarde, km e ingresos).
function totalesCapitulo(s) {
  const st = s.stats;
  return { entregas: { ...st.entregas }, aTiempo: st.aTiempo, tarde: st.tarde, km: st.km ?? 0, ingresos: Math.round(st.ingresos),
    rutas: Object.fromEntries(s.rutas.map((r) => [r.id, Math.round(r.ingresos - r.costos)])) };
}
// Resumen del capítulo en curso (desde que empezó): sacas, pasajeros, toneladas, km volados, % a tiempo y la ruta que más dejó.
export function resumenCapitulo(s) {
  const a = totalesCapitulo(s), b = s.stats.inicioCap ?? { entregas: { correo: 0, pasajeros: 0, carga: 0 }, aTiempo: 0, tarde: 0, km: 0, ingresos: 0, rutas: {} };
  const entregas = Object.fromEntries(Object.keys(a.entregas).map((c) => [c, a.entregas[c] - (b.entregas[c] ?? 0)]));
  const ok = a.aTiempo - b.aTiempo, tarde = a.tarde - b.tarde;
  let mejorRuta = null;
  for (const r of s.rutas) { const v = (a.rutas[r.id] ?? 0) - (b.rutas?.[r.id] ?? 0); if (!mejorRuta || v > mejorRuta.neto) mejorRuta = { id: r.id, a: r.a, b: r.b, neto: v }; }
  return { cap: s.cap, entregas, km: a.km - b.km, aTiempo: ok + tarde ? ok / (ok + tarde) : null, ingresos: a.ingresos - b.ingresos, mejorRuta };
}

function cargar(s, av, t) {
  const llaves = indice(s).k[av.en]?.[av.hacia];
  if (!llaves?.size) return [];
  const cola = s.colas[av.en];
  const grupos = [...llaves].map((k) => [k, cola[k]]).filter(([, g]) => g && t.lleva[g.c]).sort((x, y) => urgente(y[1]) - urgente(x[1]) || x[1].tc - y[1].tc);
  const libre = { ...t.lleva };
  const carga = [];
  for (const [k, g] of grupos) {
    const n = Math.min(g.n, libre[g.c]);
    if (n <= 0) continue;
    libre[g.c] -= n;
    const x = { d: g.d, c: g.c, n, tc: g.tc, p: g.p, km: g.km };
    if (g.k) x.k = g.k;
    carga.push(x);
    quitarCola(s, av.en, k, n);
  }
  return carga;
}

export function ocupacion(carga, t) { return carga.reduce((a, x) => a + x.n, 0) / capTotal(t); }

// 1 si llega dentro de lo prometido; si no, lo que paga tarde. Los pasajeros no tienen promesa de llegada (se van si esperan).
export function puntualidad(c, edadMin, kmOD) {
  const p = PROMESA[c];
  if (!p?.horas) return 1;
  return edadMin / 60 <= p.horas + kmOD / p.kmPorHora ? 1 : p.tarde;
}

const diarioDe = (s, ap) => (s.diario.hoy[ap] ??= { ok: 0, tot: 0, perd: 0, perdTb: 0 });
function cargo(s, r, av, monto) { s.dinero -= monto; s.stats.gastos += monto; s.netoHora -= monto; r.costos += monto; av.cos += monto; }
function abono(s, r, av, monto) { s.dinero += monto; s.stats.ingresos += monto; s.netoHora += monto; r.ingresos += monto; av.ing += monto; }

function moverAviones(s, dt, ev) {
  const R = red(s);
  const noche = esNoche(s);
  const ronda = rondaEnCurso(s);
  for (const av of s.aviones) {
    const t = AV[av.tipo], r = R.porId[av.ruta];
    if (!r) continue;
    if (av.fase === 'tierra') cargo(s, r, av, t.tierraHora * dt / 60); // tripulación y propiedad mientras está parado
    av.resta -= dt;
    if (av.resta > 0) continue;
    if (av.fase === 'tierra') despegar(s, av, t, r, noche, ronda, ev);
    else aterrizar(s, av, t, r, ronda, ev);
  }
}

function despegar(s, av, t, r, noche, ronda, ev) {
  if (!t.nocturno && !iluminada(s, r) && noche) { av.espera = 'noche'; av.resta = PASO; return; }
  if (cerrado(s, av.en) || cerrado(s, av.hacia)) { av.espera = 'tormenta'; av.resta = PASO; return; }
  // Noche de ronda en el hub: si el jugador programó la salida, el avión espera su correo hasta esa hora (salvo que ya esté
  // lleno: un avión lleno nunca queda parado) y a esa hora sale con lo que tenga.
  const aca = paraLlevar(s, av.en, av.hacia, t);
  let programada = false;
  if (ronda && av.en === HUB && s.banco[HUB]?.salidas) {
    const m = s.banco[HUB].salidas[r.id];
    if (m != null && !ronda.salio[r.id]) {
      if (minutoRonda(s, ronda) < m && aca < capTotal(t)) { av.espera = 'ronda'; av.resta = PASO; return; }
      programada = true;
    }
  }
  if (!programada) {
    if (aca / capTotal(t) < (r.minCarga ?? 0.6) && (av.esperado ?? 0) < (r.esperaMax ?? ESPERA_MAX)) {
      av.espera = 'carga'; av.esperado = (av.esperado ?? 0) + PASO; av.resta = PASO; return;
    }
    if (!aca && !paraLlevar(s, av.hacia, av.en, t)) { av.espera = 'vacio'; av.resta = 3 * PASO; return; }
  }
  av.esperado = 0;
  av.carga = cargar(s, av, t);
  const costo = costoVuelo(s, t, r); // se liquida al aterrizar, junto con lo que cobra el vuelo
  r.vuelos++; s.stats.vuelos++;
  const oc = ocupacion(av.carga, t), uni = av.carga.reduce((a, x) => a + x.n, 0);
  r.ocup = r.vuelos === 1 ? oc : r.ocup * 0.85 + 0.15 * oc;
  r.unidades = (r.unidades ?? 0) + uni;
  av.costoVuelo = costo;
  if (noche && iluminada(s, r)) s.stats.despNoche++;
  s.ultVuelo[av.en] = s.t; s.ultSalida[`${av.en}>${av.hacia}`] = s.t;
  if (ronda && av.en === HUB) { ronda.salio[r.id] = true; av.ronda = ronda.id; }
  const horas = r.km / t.vel;
  av.fase = 'vuelo'; av.dur = Math.max(PASO, Math.round(horas * 60)); av.resta += av.dur; av.espera = null;
  ev.push({ tipo: 'despegue', avion: av.id, ruta: r.id, costo, carga: uni });
}

function aterrizar(s, av, t, r, ronda, ev) {
  const llega = av.hacia, sale = av.en;
  let cobro = 0, aTiempoVuelo = 0, unidades = 0;
  const cap = capacidadTransbordo(s, llega);
  let libreTb = COLA_TB_HORAS * cap - enTransbordo(s, llega);
  // Se cobra por tramo: la tarifa (que el cliente paga por la distancia directa) se reparte entre los tramos según los km de cada
  // uno sobre el camino que de verdad recorre. Un rodeo cobra menos por km, pero ningún tramo vuela gratis; el último cobra lo que
  // falte.
  const R = red(s);
  for (const x of av.carga) {
    const fin = x.d === llega;
    const resto = fin ? 0 : (R.kmRec[llega]?.[x.d] ?? km(llega, x.d));
    const parte = (1 - x.p) * r.km / (r.km + resto);
    const pun = puntualidad(x.c, s.t - x.tc, x.km);
    cobro += x.n * tarifa(x.c, x.km) * parte * pun;
    unidades += x.n;
    if (fin) {
      s.stats.entregas[x.c] += x.n;
      s.stats.entregasEn[llega] = (s.stats.entregasEn[llega] ?? 0) + x.n;
      if (pun >= 1) { s.stats.aTiempo += x.n; aTiempoVuelo += x.n; } else s.stats.tarde += x.n;
      for (const ap of sale === llega ? [llega] : [llega, sale]) { const d = diarioDe(s, ap); d.tot += x.n; if (pun >= 1) d.ok += x.n; }
      if (x.k) { const c = s.contratos.activos.find((y) => y.id === x.k); if (c) { c.hechas += x.n; c.vivas = Math.max(0, c.vivas - x.n); } }
    } else {
      // Conexión: entra al centro de transbordo, que admite como mucho 6 h de su capacidad. Lo que no entra se pierde (salvo el
      // correo de un contrato, que tiene prioridad y entra siempre).
      const entra = x.k ? x.n : Math.max(0, Math.min(x.n, Math.floor(libreTb)));
      libreTb -= entra;
      if (entra) sumarTb(s, llega, { ...x, n: entra, p: r2(x.p + parte) }, s.t);
      if (x.n > entra) { perder(s, llega, x.n - entra, null, x.k); diarioDe(s, llega).perdTb += x.n - entra; }
    }
  }
  cobro = Math.round(cobro);
  // Cada vuelo se liquida al aterrizar: lo que cobró menos lo que costó (así la caja no se vacía cuando despegan todos juntos).
  cargo(s, r, av, av.costoVuelo ?? 0);
  if (cobro) { abono(s, r, av, cobro); ev.push({ tipo: 'cobro', ap: llega, monto: cobro }); }
  const netoViaje = cobro - (av.costoVuelo ?? 0);
  av.costoVuelo = 0;
  s.stats.ultimoVuelo = netoViaje;
  if (unidades) s.stats.km = (s.stats.km ?? 0) + Math.round(r.km);
  av.v = (av.v ?? 0) + 1;
  ev.push({ tipo: 'aterrizaje', avion: av.id, ruta: r.id, ingreso: cobro, netoViaje, ap: llega });
  if (av.ronda != null) {
    const n = s.ronda.noche;
    if (n && n.id === av.ronda && sale === HUB) { const k = r.id; n.llegadas[k] = (n.llegadas[k] ?? 0) + (s.t <= n.fin ? unidades : 0); }
    av.ronda = null;
  }
  s.ultVuelo[llega] = s.t;
  av.carga = []; av.fase = 'tierra';
  av.en = llega; av.hacia = sale;
  av.dur = t.giro; av.resta += t.giro;
}

// ───────────────────────── clima y calendario ─────────────────────────
// Una vez por día de calendario: el combustible se mueve un poco (vuelve hacia 1) y a veces se anuncia una tormenta. El pronóstico
// aparece al menos 5 h de juego antes de que la tormenta cierre aeropuertos.
// Tormentas: probabilidad por día de calendario, duración (minutos de juego: dur + hasta «rango» más) y radio del frente (km).
// Las primeras tormentas llegan después de «desde» días de juego (unos 10 minutos): el arranque se aprende sin clima.
export const CLIMA = { prob: 0.2, dur: 300, rango: 420, desde: 4, radio: 600 };
function climaDelDia(s, ev) {
  if (s.opciones?.sinClima) { s.clima.combustible = 1; return; }
  const c = s.clima.combustible;
  s.clima.combustible = Math.round(1e4 * Math.min(1.25, Math.max(0.8, c + (1 - c) * 0.15 + (rng(s) - 0.5) * 0.06))) / 1e4;
  const nodos = red(s).nodos;
  if (!s.clima.tormenta && !s.clima.pronostico && nodos.length > 2 && s.t >= CLIMA.desde * 1440 && rng(s) < CLIMA.prob) {
    // un frente de tormenta: una ciudad de la red al azar y las vecinas a menos de CLIMA.radio km (el hub queda afuera)
    const fuera = nodos.filter((a) => a !== HUB);
    const centro = fuera[Math.floor(rng(s) * fuera.length)];
    const zona = fuera.filter((a) => km(a, centro) <= CLIMA.radio);
    if (zona.length) {
      const desde = s.t + 300 + Math.floor(rng(s) * 360);
      s.clima.pronostico = { zona, desde, hasta: desde + CLIMA.dur + Math.floor(rng(s) * CLIMA.rango) };
      ev.push({ tipo: 'pronostico', ...s.clima.pronostico });
    }
  }
}
function climaDelPaso(s, ev) {
  const p = s.clima.pronostico;
  if (p && s.t >= p.desde) { s.clima.tormenta = p; s.clima.pronostico = null; ev.push({ tipo: 'tormenta', zona: p.zona, hasta: p.hasta }); }
  const tm = s.clima.tormenta;
  if (tm && s.t >= tm.hasta) { s.clima.tormenta = null; ev.push({ tipo: 'tormentaFin', zona: tm.zona }); }
}

function cerrarHora(s, ev) {
  const h = Math.floor(s.t / 60);
  if (s.horaIdx >= h) return;
  while (s.horaIdx < h) {
    s.hora24[s.horaIdx % 24] = s.netoHora;
    s.netoHora = 0;
    s.horaIdx++;
  }
  const gd = gananciaDia(s);
  if (gd > s.stats.mejorDia) s.stats.mejorDia = gd;
  // metas de ganancia: el mejor día desde que se activó la misión (las horas de antes no cuentan, así una meta no se cumple sola
  // al activarse: hay que ganarla de nuevo, en un día que empieza con ella)
  if (s.mision && MIS[s.mision.id]?.tipo === 'mejorDia') { const g = gananciaDesde(s, s.mision.h0 ?? 0); if (g > (s.mision.mejor ?? 0)) s.mision.mejor = g; }
  // Red de seguridad: se registra desde cuándo el neto del día es negativo y desde cuándo la caja está en rojo.
  if (gd < 0) s.flags.negDesde ??= s.t; else delete s.flags.negDesde;
  if (s.dinero < 0) {
    s.flags.rojoDesde ??= s.t;
    if (s.t - s.flags.rojoDesde >= 1440 && s.aviones.length) {
      // Un día entero en rojo: se venden los aviones que más pierden hasta volver a cero (nadie queda atrapado en la espiral).
      for (let i = 0; i < 20 && s.dinero < 0 && s.aviones.length; i++) {
        const peor = peorAvion(s);
        const r = venderAvion(s, peor.id);
        s.stats.ventasForzadas++;
        ev.push({ tipo: 'ventaForzada', avion: peor.id, avionTipo: peor.tipo, monto: r.monto });
      }
      if (s.dinero < 0) s.flags.rojoDesde = s.t; else delete s.flags.rojoDesde;
    }
  } else delete s.flags.rojoDesde;
  vencerPasajeros(s);
}
// Neto de las últimas 24 horas de juego: las 23 horas cerradas más la que corre (el casillero de la hora actual todavía guarda la
// de hace 24 horas, que ya no cuenta). Así el primer vuelo se ve enseguida en la barra.
export function gananciaDia(s) { return s.hora24.reduce((a, b) => a + b, 0) - s.hora24[s.horaIdx % 24] + s.netoHora; }
// Neto de las últimas 24 horas contando solo desde la hora h0 (entera): la hora que corre más las cerradas desde h0.
function gananciaDesde(s, h0) {
  let g = s.horaIdx >= h0 ? s.netoHora : 0;
  for (let h = Math.max(h0, s.horaIdx - 23); h < s.horaIdx; h++) g += s.hora24[h % 24];
  return g;
}

function cerrarDia(s, ev) {
  const d = diaCalendario(s);
  if (s.dia === d) return;
  s.dia = d;
  // diario de 7 días por aeropuerto (para los indicadores del hub) y pérdidas por tramo del día anterior
  s.diario.dias.unshift(s.diario.hoy);
  s.diario.dias.length = Math.min(s.diario.dias.length, 6);
  s.diario.hoy = {};
  const ayer = {};
  for (const k in s.stats.perdTramo) ayer[k] = s.stats.perdTramo[k] - (s.stats.perdTramo0[k] ?? 0);
  s.stats.perdTramoAyer = ayer; s.stats.perdTramo0 = { ...s.stats.perdTramo };
  climaDelDia(s, ev);
  renovarContratos(s, ev);
}

// ───────────────────────── misiones ─────────────────────────
export function misionActual(s) { return MISIONES.find((m) => m.cap === s.cap && !misionHecha(s, m.id)) ?? null; }

function baseDe(s, m) {
  const st = s.stats;
  switch (m.tipo) {
    case 'transbordos': return st.transbordos[m.ciudad] ?? 0;
    case 'despeguesNoche': return st.despNoche;
    case 'entregasEn': return st.entregasEn[m.ciudad] ?? 0;
    case 'entregas': return st.entregas[m.carga];
    case 'entregasEnTodas': return Object.fromEntries(m.ciudades.map((c) => [c, st.entregasEn[c] ?? 0]));
    case 'contratos': return s.contratos.cumplidos;
    default: return 0;
  }
}
function activarMision(s) {
  const m = misionActual(s);
  s.mision = m ? { id: m.id, base: baseDe(s, m), tAv: s.t, ult: 0, t0: s.t } : null;
  if (m?.tipo === 'mejorDia') { s.mision.h0 = Math.ceil(s.t / 60); s.mision.mejor = 0; }
  if (m?.sacas) sumarCola(s, m.a, m.b, 'correo', m.sacas, s.t, 0, km(m.a, m.b));
}

// Avance real de una misión desde que se activó (las misiones miden servicio, no compras).
export function progreso(s, m) {
  const st = s.stats;
  const base = s.mision?.id === m.id ? s.mision.base : baseDe(s, m);
  switch (m.tipo) {
    case 'ruta': {
      const r = s.rutas.find((x) => x.id === idRuta(m.a, m.b));
      return !r ? 0 : s.aviones.some((a) => a.ruta === r.id) ? 1 : 0.5;
    }
    case 'transbordos': return (st.transbordos[m.ciudad] ?? 0) - base;
    case 'despeguesNoche': return st.despNoche - base;
    case 'entregasEn': return (st.entregasEn[m.ciudad] ?? 0) - base;
    case 'entregas': return st.entregas[m.carga] - base;
    case 'ciudadesActivas': return Object.values(s.ultVuelo).filter((t) => s.t - t <= 1440).length;
    case 'enServicio': return s.aviones.filter((a) => a.tipo === m.avion && a.v >= 1).length;
    case 'entregasEnTodas': return m.ciudades.reduce((a, c) => a + Math.min(m.n, (st.entregasEn[c] ?? 0) - (base[c] ?? 0)), 0);
    case 'mejorDia': return Math.max(0, s.mision?.id === m.id ? s.mision.mejor ?? st.mejorDia : st.mejorDia);
    case 'contratos': return s.contratos.cumplidos - base;
    case 'rondaPct': { const desde = s.mision?.id === m.id ? s.mision.t0 : s.t; return Math.round(100 * Math.max(0, ...(s.ronda?.historial ?? []).filter((r) => r.t >= desde).map((r) => r.pctPrimeraHora))); }
    default: return 0;
  }
}

const UNIDAD = { ruta: null, transbordos: 'u_correo', despeguesNoche: 'u_despegues', entregasEn: 'u_correo', entregas: null,
  ciudadesActivas: 'u_ciudades', enServicio: 'u_aviones', entregasEnTodas: 'u_entregas', mejorDia: 'u_plata', rondaPct: 'u_pct',
  contratos: 'u_contratos' };

// Objetivos a la vista: la misión de historia y hasta 2 contratos (aceptados o, si faltan, ofrecidos). Cada uno trae su
// progreso (0 a 1), un avance en números para la interfaz y, si lleva 200 min de juego sin avanzar, una clave de pista.
export function misionesActivas(s) {
  const out = [];
  const m = misionActual(s);
  if (m) {
    const v = progreso(s, m);
    out.push({ id: m.id, tipo: 'historia', texto: m.id, mision: m, progreso: Math.min(1, Math.max(0, v / m.meta)),
      avance: { n: Math.floor(Math.max(0, v)), meta: m.meta, unidad: m.tipo === 'entregas' ? `u_${m.carga}` : UNIDAD[m.tipo] },
      avanceTxt: m.tipo === 'ruta' ? null : `${Math.floor(Math.max(0, v))}/${m.meta}`,
      premio: m.premio, pista: s.mision && s.t - s.mision.tAv >= PISTA_MIN ? pistaDe(s, m) : null });
  }
  const { activos, tablero } = s.contratos;
  for (const c of activos) out.push(objetivoContrato(s, c, false));
  for (const c of tablero) { if (out.length >= 3) break; out.push(objetivoContrato(s, c, true)); }
  return out.slice(0, 3);
}
// La pista depende de lo que pasa: si es de noche y la mayoría de los aviones está parada por falta de balizas, la pista es esa; si
// la última ronda no llegó a la meta porque el centro del hub tardaba horas en clasificar, la pista es mejorar el centro.
function pistaDe(s, m) {
  if (m.tipo === 'rondaPct') {
    const u = s.ronda?.historial?.[0];
    if (u && u.pctPrimeraHora * 100 < m.meta && (u.horasCentro ?? 0) >= 2 && costoTransbordo(s, HUB) != null) return 'pista_ronda_centro';
  }
  if (esNoche(s) && s.aviones.length) {
    const R = red(s);
    const parados = s.aviones.filter((a) => !AV[a.tipo].nocturno && !iluminada(s, R.porId[a.ruta] ?? {})).length;
    if (parados * 2 > s.aviones.length) return 'pista_noche';
  }
  return `pista_${m.id}`;
}
function objetivoContrato(s, c, oferta) {
  return { id: `c${c.id}`, contrato: c.id, tipo: 'contrato', texto: c.navidad ? 'contratoNavidad' : 'contrato', oferta,
    o: c.o, d: c.d, carga: c.c, premio: c.premio, dias: c.dias, hub: c.hub,
    progreso: oferta ? 0 : Math.min(1, c.hechas / c.n), avance: { n: oferta ? 0 : c.hechas, meta: c.n, unidad: `u_${c.c}` },
    avanceTxt: `${oferta ? 0 : c.hechas}/${c.n}`, quedan: oferta ? c.dias * 1440 : Math.max(0, c.vence - s.t), pista: null };
}

function revisarObjetivos(s, ev) {
  // historia: cumplir y premiar en el mismo paso; la siguiente misión arranca a medir desde cero
  let m = misionActual(s);
  if (m && s.mision?.id !== m.id) activarMision(s);
  while (m && progreso(s, m) >= m.meta) {
    s.misiones.push(m.id);
    s.dinero += m.premio;
    ev.push({ tipo: 'mision', id: m.id, premio: m.premio, grande: true });
    for (const a of AVIONES) if (a.desbloquea === m.id) ev.push({ tipo: 'avionNuevo', avion: a.id });
    const ciudades = AEROPUERTOS.filter((a) => a.abre === m.id && a.cap <= s.cap).map((a) => a.id);
    if (ciudades.length) ev.push({ tipo: 'ciudadesNuevas', ciudades });
    if (m.cierra) {
      s.mision = null; ev.push({ tipo: 'capitulo', cap: s.cap });
      // fin de la historia: el juego sigue con los contratos del día y las rondas con medalla (no con un «Seguir» vacío)
      if (s.cap >= CAPITULOS.length) ev.push({ tipo: 'finHistoria' });
      break;
    }
    activarMision(s);
    m = misionActual(s);
  }
  // Para la pista solo cuenta un avance real: al menos el 3% de la meta (una meta que se arrastra de a poquito también la muestra).
  if (m && s.mision) { const v = progreso(s, m); if (v >= s.mision.ult + Math.max(1e-9, 0.03 * m.meta) || (m.tipo === 'ruta' && v > s.mision.ult)) { s.mision.ult = v; s.mision.tAv = s.t; } }
  // contratos
  for (const c of [...s.contratos.activos]) {
    if (c.hechas >= c.n) {
      s.dinero += c.premio; s.contratos.cumplidos++;
      s.contratos.activos = s.contratos.activos.filter((x) => x !== c);
      ev.push({ tipo: 'contrato', id: c.id, premio: c.premio, o: c.o, d: c.d, navidad: c.navidad });
    } else if (s.t > c.vence) {
      s.contratos.activos = s.contratos.activos.filter((x) => x !== c);
      ev.push({ tipo: 'contratoVencido', id: c.id });
    }
  }
  if (s.contratos.dia == null && contratosHabilitados(s)) renovarContratos(s, ev, true);
  revisarBanco(s, ev);
}
function revisarYEmitir(s) { const ev = []; revisarObjetivos(s, ev); for (const e of ev) emitir(s, e); }

export function historiaTerminada(s) { return s.cap >= CAPITULOS.length && capituloTerminado(s); }
export function capituloTerminado(s) {
  const fin = MISIONES.find((m) => m.cap === s.cap && m.cierra);
  return fin ? misionHecha(s, fin.id) : false;
}

export function avanzarCapitulo(s) {
  if (!capituloTerminado(s) || s.cap >= CAPITULOS.length) return { ok: false };
  s.cap++;
  const c = capitulo(s);
  s.t0 = inicioCapitulo(c, s.t);
  s.horaIdx = Math.floor(s.t / 60); s.hora24 = Array(24).fill(0); s.netoHora = 0;
  s.clima.tormenta = null; s.clima.pronostico = null;
  s.dia = diaCalendario(s);
  s.dinero += c.premio ?? 0;
  s.stats.inicioCap = totalesCapitulo(s);
  s.ronda.ultima = null; s.ronda.noche = null; delete s.banco[HUB];
  activarMision(s);
  const ev = [{ tipo: 'capituloNuevo', cap: s.cap }];
  const nuevas = AEROPUERTOS.filter((a) => a.cap === s.cap && ciudadDisponible(s, a.id)).map((a) => a.id);
  if (nuevas.length) ev.push({ tipo: 'ciudadesNuevas', ciudades: nuevas });
  for (const a of AVIONES) if (a.cap === s.cap && !a.desbloquea) ev.push({ tipo: 'avionNuevo', avion: a.id });
  renovarContratos(s, ev, true);
  revisarObjetivos(s, ev);
  for (const e of ev) emitir(s, e);
  return { ok: true };
}

// ───────────────────────── contratos del día ─────────────────────────
// Linaje: los subsidios de Transport Tycoon (1994). Un tablero de 3 contratos («N unidades de A→B en D días: $X») que se renueva
// cada día de juego, determinista por semilla, entre ciudades de la red o a una ruta de distancia. Al menos uno pasa por un
// transbordo en el hub. El jugador acepta hasta 2. Solo cuentan las entregas reales del par pedido: las unidades del contrato
// viajan marcadas. No automatizan nada ni dan multiplicadores permanentes.
export const CONTRATO = { maxActivos: 2, ofertas: 3, dias: [2, 3], parteCapacidad: 0.25, horasCapacidad: 30, minN: 8, maxN: 300, premioPorTarifa: 0.6, navidad: 1.8 };

function contratosHabilitados(s) { return (red(s).adj[HUB]?.length ?? 0) >= 2; }
function azarDia(s) { return RONDA.azar(((s.semilla ^ 0x5bd1e995) + (s.dia ?? 0) * 2654435761) >>> 0); }

// Capacidad ofrecida por hora en cada sentido de una ruta, para la carga c (los aviones hacen ida y vuelta). Se calcula una vez por
// versión de la red (cambia solo al abrir o cerrar rutas y al comprar o vender aviones): antes se recorría toda la flota en cada
// consulta, y con 500 aviones la mejor próxima acción tardaba segundos.
const cacheCapacidad = new WeakMap();
function capacidades(s) {
  const R = red(s), c = cacheCapacidad.get(s);
  if (c && c.R === R && c.v === s.verRed) return c.m;
  const m = {};
  for (const av of s.aviones) {
    const t = AV[av.tipo], r = R.porId[av.ruta];
    if (!r) continue;
    const x = (m[r.id] ??= {}), ciclo = 2 * (r.km / t.vel + t.giro / 60);
    for (const cg in t.lleva) x[cg] = (x[cg] ?? 0) + t.lleva[cg] / ciclo;
  }
  cacheCapacidad.set(s, { R, v: s.verRed, m });
  return m;
}
function capacidadHora(s, rutaId, c) { return capacidades(s)[rutaId]?.[c] ?? 0; }
// Lo que puede pasar por hora de o a d: el tramo más flaco del camino y, en cada escala, la mitad de lo que clasifica su centro de
// transbordo (la otra mitad es para el resto del correo).
function capacidadCamino(s, o, d, c) {
  const R = red(s);
  let a = o, min = Infinity;
  for (let i = 0; i < 8 && a !== d; i++) {
    const h = R.sig[a]?.[d];
    if (!h) return 0;
    if (a !== o) min = Math.min(min, capacidadTransbordo(s, a) / 2);
    min = Math.min(min, capacidadHora(s, idRuta(a, h), c)); a = h;
  }
  return a === d ? min : 0;
}

function renovarContratos(s, ev, inicial = false) {
  if (!contratosHabilitados(s)) return;
  const R = red(s);
  const r = azarDia(s);
  const cargas = Object.keys(capitulo(s).cargas);
  const navidad = factorTemporada(s, 'correo', true) > 1;
  const ofertas = [];
  const usado = new Set(s.contratos.activos.map((c) => `${c.o}>${c.d}`));
  const elegir = (lista) => lista.length ? lista[Math.floor(r() * lista.length)] : null;
  // solo cargas que los aviones del camino pueden llevar (un contrato de pasajeros por una ruta de correo no se cumple nunca)
  const posibles = (o, d) => cargas.filter((c) => capacidadCamino(s, o, d, c) > 0);
  const crear = (o, d, c, extra = {}) => {
    if (R.sig[o]?.[d]) { const p = posibles(o, d); if (!p.includes(c)) c = p.length ? p[Math.floor(r() * p.length)] : null; }
    // caminos cortos: hasta 3 tramos (2 para pasajeros, que se van si la conexión demora)
    if (c && R.tramos[o]?.[d] > (c === 'pasajeros' ? 2 : 3)) return;
    if (!c || !o || !d || o === d || usado.has(`${o}>${d}`)) return;
    usado.add(`${o}>${d}`);
    const dist = km(o, d);
    const cap = capacidadCamino(s, o, d, c) || capTotal(AV.golondrina) / (2 * (dist / 180 + 1));
    const n = Math.max(CONTRATO.minN, Math.min(CONTRATO.maxN, Math.round(cap * CONTRATO.horasCapacidad * CONTRATO.parteCapacidad)));
    const dias = CONTRATO.dias[Math.floor(r() * CONTRATO.dias.length)];
    const fNav = extra.navidad ? CONTRATO.navidad : 1;
    ofertas.push({ id: s.contratos.sig++, o, d, c, n, dias, premio: Math.round(n * tarifa(c, dist) * CONTRATO.premioPorTarifa * fNav / 100) * 100,
      hub: R.sig[o]?.[d] === HUB || (extra.hub ?? false), navidad: !!extra.navidad });
  };
  // 1) uno que pasa por el transbordo del hub: de un radio a otro
  const radios = R.adj[HUB] ?? [];
  if (radios.length >= 2) {
    const o = elegir(radios), d = elegir(radios.filter((x) => x !== o));
    crear(o, d, navidad ? 'correo' : elegir(cargas), { hub: true, navidad });
  }
  // 2) uno dentro de la red
  const nodos = R.nodos;
  for (let i = 0; i < 6 && ofertas.length < 2; i++) { const o = elegir(nodos), d = elegir(nodos.filter((x) => x !== o)); crear(o, d, elegir(cargas)); }
  // 3) uno a una ruta de distancia: un destino que todavía no está en la red y que se puede conectar con un avión disponible
  const alcance = Math.max(...avionesDisponibles(s).map((t) => t.alcance), 0);
  const afuera = AEROPUERTOS.filter((a) => ciudadDisponible(s, a.id) && !R.adj[a.id] && nodos.some((n) => km(n, a.id) <= alcance)).map((a) => a.id);
  if (afuera.length) crear(HUB, elegir(afuera), elegir(cargas));
  for (let i = 0; i < 6 && ofertas.length < CONTRATO.ofertas; i++) { const o = elegir(nodos), d = elegir(nodos.filter((x) => x !== o)); crear(o, d, elegir(cargas)); }
  s.contratos.tablero = ofertas.slice(0, CONTRATO.ofertas);
  s.contratos.dia = s.dia;
  if (!inicial || ofertas.length) ev.push({ tipo: 'contratosNuevos', n: s.contratos.tablero.length });
}

export function aceptarContrato(s, id) {
  const c = s.contratos.tablero.find((x) => x.id === id);
  if (!c) return { ok: false, error: 'invalida' };
  if (s.contratos.activos.length >= CONTRATO.maxActivos) return { ok: false, error: 'contratos' };
  s.contratos.tablero = s.contratos.tablero.filter((x) => x !== c);
  s.contratos.activos.push({ ...c, vence: s.t + c.dias * 1440, desde: s.t, hechas: 0, vivas: 0, acum: 0 });
  revisarYEmitir(s);
  return { ok: true };
}

// Las unidades del contrato salen parejas durante la primera mitad del plazo, mientras haya camino, hasta completar N.
function generarContratos(s, dt) {
  const R = red(s);
  for (const c of s.contratos.activos) {
    if (!R.sig[c.o]?.[c.d] || c.hechas + c.vivas >= c.n) continue;
    c.acum += c.n / (c.dias * 12) * dt / 60;
    const n = Math.min(Math.floor(c.acum), c.n - c.hechas - c.vivas);
    if (n <= 0) continue;
    c.acum -= n; c.vivas += n;
    sumarCola(s, c.o, c.d, c.c, n, s.t, 0, km(c.o, c.d), c.id);
  }
}

// ───────────────────────── ronda nocturna en el hub ─────────────────────────
// Se habilita después de m1_noche, con al menos 3 rutas iluminadas desde el hub. Como máximo una noche de cada RONDA_CADA. A las
// 20:00 se anuncia; a las 22:00 se corta: lo que está en el hub es la promesa «a primera hora» (antes de las 07:00). Si el
// jugador no la juega, corre el automático (el modelo general: FIFO y salida al juntar la carga mínima), sin castigo.
function rutasIluminadasHub(s) {
  const R = red(s);
  return (R.adj[HUB] ?? []).filter((d) => { const r = R.porId[idRuta(HUB, d)]; return r && iluminada(s, r); }).length;
}
function revisarBanco(s, ev) {
  if (!CONFIG.ronda || s.ronda.listo) return;
  const hecha = misionHecha(s, 'm1_noche') || s.cap >= 2;
  if (hecha && rutasIluminadasHub(s) >= 3) { s.ronda.listo = true; ev.push({ tipo: 'bancoListo' }); }
}
export function rondaEnCurso(s) { const n = s.ronda?.noche; return n && n.estado === 'corriendo' ? n : null; }
const minutoRonda = (s, n) => s.t - n.corte;

function cicloRonda(s, ev) {
  if (!CONFIG.ronda || !s.ronda.listo) return;
  const md = minutoDelDia(s), n = s.ronda.noche;
  if (!n && md >= 20 * 60 && md < 22 * 60 && (s.ronda.ultima == null || s.dia - s.ronda.ultima >= RONDA_CADA)) {
    s.ronda.noche = { id: s.dia, estado: 'previa', corte: s.t + (22 * 60 - md), fin: s.t + (22 * 60 - md) + RONDA.VENTANA, salio: {}, llegadas: {}, jugada: false };
    ev.push({ tipo: 'rondaDisponible', id: s.dia, corte: s.ronda.noche.corte });
    return;
  }
  if (n?.estado === 'previa' && s.t >= n.corte) {
    n.estado = 'corriendo';
    n.horasCentro = +(enTransbordo(s, HUB) / capacidadTransbordo(s, HUB)).toFixed(2); // lo que tarda el centro en vaciarse a las 22:00
    n.escena = escenaRonda(s);
    n.prometidas = Object.fromEntries(n.escena.radios.map((x) => [x.id, x.sacas]));
    n.tarifas = Object.fromEntries(n.escena.radios.map((x) => [x.id, x.tarifa]));
    ev.push({ tipo: 'rondaCorte', id: n.id });
    return;
  }
  if (n?.estado === 'corriendo' && s.t >= n.fin) {
    const res = resultadoRonda(s, n);
    s.ronda.historial.unshift(res); s.ronda.historial.length = Math.min(s.ronda.historial.length, 10);
    s.ronda.ultima = n.id; s.ronda.noche = null; delete s.banco[HUB];
    ev.push({ tipo: 'resultadoNoche', ...res });
  }
}

function resultadoRonda(s, n) {
  let sacas = 0, ok = 0, ingreso = 0;
  for (const id in n.prometidas) {
    const p = n.prometidas[id], llego = Math.min(p, n.llegadas[id] ?? 0);
    sacas += p; ok += llego; ingreso += n.tarifas[id] * (llego + RONDA.PAGA_TARDE * (p - llego));
  }
  const pct = sacas ? ok / sacas : 1;
  let ingresoAutomatico = ingreso;
  if (n.jugada && n.escena) {
    const auto = RONDA.simular(n.escena), plan = RONDA.simular(n.escena, { prioridad: s.banco[HUB]?.prioridad, salidas: s.banco[HUB]?.salidas });
    ingresoAutomatico = plan.ingreso ? ingreso * auto.ingreso / plan.ingreso : ingreso;
  }
  const sugerido = n.escena ? RONDA.simular(n.escena, RONDA.planSugerido(n.escena)) : null;
  const auto = n.escena ? RONDA.simular(n.escena) : null;
  const ingresoSugerido = sugerido && auto?.ingreso ? (n.jugada ? ingresoAutomatico : ingreso) * sugerido.ingreso / auto.ingreso : ingreso;
  return { id: n.id, t: s.t, sacas, pctPrimeraHora: +pct.toFixed(3), ingreso: Math.round(ingreso), ingresoAutomatico: Math.round(ingresoAutomatico),
    ingresoSugerido: Math.round(ingresoSugerido), medalla: RONDA.medallaDe(pct), jugada: n.jugada, horasCentro: n.horasCentro ?? 0 };
}

// Escena de la noche armada con lo que hay en el hub: un radio por ruta iluminada con avión, lo que espera salir por él (en el
// centro y en la cola), el vuelo, cuándo estará listo su avión y el ritmo del centro.
export function escenaRonda(s) {
  const R = red(s);
  const corte = s.ronda?.noche?.corte ?? s.t;
  const idx = indice(s);
  const radios = [];
  for (const d of R.adj[HUB] ?? []) {
    const r = R.porId[idRuta(HUB, d)];
    if (!r || !iluminada(s, r)) continue;
    const avs = s.aviones.filter((a) => a.ruta === r.id);
    if (!avs.length) continue;
    const ya = Object.values(idx.n[HUB]?.[d] ?? {}).reduce((a, b) => a + b, 0);
    let enCentro = 0;
    for (const g of Object.values(s.transbordo[HUB] ?? {})) if (R.sig[HUB]?.[g.d] === d) enCentro += g.n;
    const t = AV[avs[0].tipo];
    const listo = Math.max(0, Math.min(...avs.map((a) => listoEnHub(a, r, AV[a.tipo]) - (corte - s.t))));
    const vuelo = Math.round(r.km / t.vel * 60);
    // La promesa de la noche es lo que entra en los vuelos de esta ruta que pueden llegar antes de las 07:00 (todos sus aviones,
    // con todas las vueltas que les da la noche): lo que no entra en ningún avión no se promete.
    let plazas = 0;
    for (const a of avs) {
      const ta = AV[a.tipo], v = r.km / ta.vel * 60;
      for (let L = Math.max(0, listoEnHub(a, r, ta) - (corte - s.t)); L + v <= RONDA.VENTANA; L += 2 * (v + ta.giro)) plazas += capTotal(ta);
    }
    if (!plazas) continue;
    const sacas = Math.min(Math.round(ya + enCentro), plazas);
    radios.push({ id: r.id, destino: d, nombre: AP[d].nombre, vuelo, listo: Math.ceil(listo / 5) * 5, cap: plazas,
      sacas, yaListas: Math.min(Math.round(ya), sacas), tarifa: Math.round(tarifa('correo', r.km)) });
  }
  return RONDA.conOrden({ semilla: s.dia ?? 1, centro: capacidadTransbordo(s, HUB), radios });
}
// Minutos desde ahora hasta que el avión estará en el hub listo para salir.
function listoEnHub(av, r, t) {
  const vuelo = Math.round(r.km / t.vel * 60);
  if (av.fase === 'tierra' && av.en === HUB) return Math.max(0, av.resta);
  if (av.fase === 'vuelo' && av.hacia === HUB) return av.resta + t.giro;
  if (av.fase === 'tierra') return Math.max(0, av.resta) + vuelo + t.giro;
  return av.resta + t.giro + vuelo + t.giro;
}

// API pura del banco del hub. s.banco[ap] = { prioridad: [rutaId…], salidas: { rutaId: minuto desde las 22:00 } }.
export function fijarPrioridad(s, ap, lista) {
  if (ap !== HUB || !s.ronda?.noche) return { ok: false, error: 'sinRonda' };
  const b = (s.banco[ap] ??= { prioridad: null, salidas: null });
  b.prioridad = [...lista]; s.ronda.noche.jugada = true;
  return { ok: true };
}
export function moverSalida(s, rutaId, delta) {
  const n = s.ronda?.noche;
  if (!n) return { ok: false, error: 'sinRonda' };
  const e = n.escena ?? escenaRonda(s);
  const x = e.radios.find((r) => r.id === rutaId);
  if (!x) return { ok: false, error: 'invalida' };
  const b = (s.banco[HUB] ??= { prioridad: null, salidas: null });
  b.salidas ??= {};
  const base = b.salidas[rutaId] ?? RONDA.salidasActuales({ escena: e, prioridad: b.prioridad, salidas: null })[rutaId];
  b.salidas[rutaId] = Math.min(RONDA.VENTANA, Math.max(Math.ceil(x.listo / RONDA.GRILLA) * RONDA.GRILLA, base + Math.sign(delta) * RONDA.GRILLA));
  n.jugada = true;
  return { ok: true, minuto: b.salidas[rutaId] };
}
// En el juego, el plan sugerido ordena la cinta (lo que sale antes se clasifica primero) y deja las salidas en automático: con
// varios aviones por ruta y varias vueltas por noche, retener aviones resta más de lo que suma. Las salidas solo se programan
// si el jugador las mueve (moverSalida). En la escena aislada (ronda.js) el plan sugerido también mueve las salidas.
export function planSugerido(s, ap = HUB) {
  if (ap !== HUB) return null;
  const e = s.ronda?.noche?.escena ?? escenaRonda(s);
  return { prioridad: RONDA.planSugerido(e).prioridad, salidas: null };
}
export function aplicarPlan(s, plan) {
  if (!s.ronda?.noche) return { ok: false, error: 'sinRonda' };
  s.banco[HUB] = { prioridad: plan.prioridad ? [...plan.prioridad] : null, salidas: plan.salidas ? { ...plan.salidas } : null };
  s.ronda.noche.jugada = true;
  return { ok: true };
}

// Premio chico de «La ronda del día» (se juega fuera de la partida): plata del juego, nunca multiplicadores ni aceleraciones.
export function premioRondaDelDia(s, monto) {
  const m = Math.max(0, Math.min(Math.round(monto), 3 * RONDA.PREMIO_DIA.oro));
  if (!m) return { ok: false };
  s.dinero += m;
  return { ok: true, monto: m };
}

// ───────────────────────── sugerencia (mejor próxima acción) ─────────────────────────
// Estimación del neto por día que agrega un avión en una ruta: lo que lleva de la demanda que hoy no se atiende, menos sus
// vuelos y sus horas parado.
// Flujo por tramo dirigido «a>b»: unidades por hora que la red quiere mandar por ahí (locales y en conexión) y lo que vale cada
// una en ese tramo. Se calcula una vez por versión de la red (cada par recorre su camino).
const cacheFlujos = new WeakMap();
function flujos(s) {
  const lista = pares(s);
  const c = cacheFlujos.get(s);
  if (c && c.lista === lista) return c.mapa;
  const R = red(s), mapa = {};
  for (const x of lista) {
    let n = x.o;
    for (let i = 0; i < 8 && n !== x.d; i++) {
      const h = R.sig[n]?.[x.d];
      if (!h) break;
      const f = (mapa[`${n}>${h}`] ??= { locales: 0, conexion: 0, u: 0, valor: 0, porCarga: {} });
      if (x.o === n && x.d === h) f.locales += x.porHora; else f.conexion += x.porHora;
      const v = x.porHora * tarifa(x.c, x.km) * km(n, h) / Math.max(km(n, h), R.kmRec[x.o][x.d] ?? x.km);
      f.u += x.porHora; f.valor += v;
      const pc = (f.porCarga[x.c] ??= { u: 0, valor: 0 }); pc.u += x.porHora; pc.valor += v;
      n = h;
    }
  }
  cacheFlujos.set(s, { lista, mapa });
  return mapa;
}
function demandaTramo(s, a, b, c = null) {
  const f0 = flujos(s)[`${a}>${b}`];
  const f = c ? f0?.porCarga[c] : f0;
  return f ? { u: f.u, valor: f.u ? f.valor / f.u : 0 } : { u: 0, valor: 0 };
}
export function estimarAvion(s, tipoId, rutaId) {
  const t = AV[tipoId], r = s.rutas.find((x) => x.id === rutaId);
  if (!t || !r) return null;
  const sinRed = !s.aviones.some((a) => a.ruta === rutaId);
  // si la ruta todavía no tiene avión, la red no la usa: se estima con la demanda directa del par
  const demanda = sinRed ? (x, y, c) => ({ u: demandaHora(s, x, y, c), valor: tarifa(c, r.km) }) : (x, y, c) => demandaTramo(s, x, y, c);
  const ofrecida = sinRed ? () => 0 : (c) => capacidadHora(s, rutaId, c);
  return estimarTramo(s, t, r.a, r.b, r.km, iluminada(s, r), ofrecida, r.minCarga ?? 0.6, demanda);
}
// Lo que aporta hoy un avión que ya vuela en su ruta (lo mismo que estimarAvion, como si fuera el último en llegar). Si es negativo,
// sobra: venderlo mejora el neto por día.
function aporteAvion(s, av) {
  const t = AV[av.tipo], r = red(s).porId[av.ruta];
  if (!r) return 0;
  const cicloH = 2 * (r.km / t.vel + t.giro / 60);
  return estimarTramo(s, t, r.a, r.b, r.km, iluminada(s, r), (c) => Math.max(0, capacidadHora(s, r.id, c) - (t.lleva[c] ?? 0) / cicloH),
    r.minCarga ?? 0.6, (x, y, c) => demandaTramo(s, x, y, c));
}
// Lo que agrega por día un avión de tipo t en el tramo a⇄b: las unidades por hora que lleva de la demanda que hoy no se atiende
// (hasta su capacidad), a lo que vale cada una, menos sus vuelos y sus horas parado. Los vuelos son los que hacen falta para llevar
// eso saliendo con la carga mínima de la ruta (un avión de más en una ruta que ya está servida vuela poco), sin pasar de los que da
// su ciclo.
function estimarTramo(s, t, a, b, kmR, luz, ofrecidaDe, minCarga, demanda) {
  const cicloH = 2 * (kmR / t.vel + t.giro / 60);
  const horasOp = t.nocturno || luz ? 24 : 14;
  // sin vuelos de noche, lo que llega de noche espera a la mañana (la cola guarda hasta 4 h de demanda): de día hay más para llevar
  const fNoche = (horasOp + Math.min(24 - horasOp, 4)) / horasOp;
  const u = [0, 0];
  let ingreso = 0;
  for (const c of Object.keys(t.lleva)) {
    if (!capitulo(s).cargas[c]) continue;
    const capH = t.lleva[c] / cicloH;                    // lo que el avión lleva por hora y por sentido
    const ofrecida = ofrecidaDe(c);
    [[a, b], [b, a]].forEach(([x, y], i) => {
      const d = demanda(x, y, c);
      const lleva = Math.max(0, Math.min(capH, d.u * fNoche * 0.9 - ofrecida));
      ingreso += lleva * d.valor * horasOp;
      u[i] += lleva;
    });
  }
  const porVuelo = Math.max(0.3, minCarga) * capTotal(t);
  const vuelos = Math.min(2 * horasOp / cicloH, 2 * Math.max(u[0], u[1]) * horasOp / porVuelo);
  const costos = vuelos * costoVuelo(s, t, { km: kmR }) + t.tierraHora * Math.max(0, 24 - vuelos * kmR / t.vel);
  return Math.round(ingreso - costos);
}
// Una ruta nueva desde «n» (en la red) a «c» (afuera): la demanda del par más la que llega en conexión desde el resto de la red
// pasando por «n», con sus factores de escalas y rodeo, y la parte de la tarifa que le toca a este tramo.
function demandaRutaNueva(s, n, c) {
  const R = red(s), kmNC = km(n, c);
  return (x, y, cg) => {
    const haciaC = y === c;
    let u = 0, valor = 0;
    for (const m of [n, ...R.nodos]) {
      if (m === c || (m !== n && !R.tramos[m]?.[n])) continue;
      if (m === n && u > 0) continue;
      const tr = m === n ? 1 : R.tramos[m][n] + 1;
      const kmRec = (m === n ? 0 : R.kmRec[m][n]) + kmNC;
      const dir = haciaC ? demandaHora(s, m, c, cg) : demandaHora(s, c, m, cg);
      const f = factorRed(cg, tr, km(m, c), kmRec);
      if (!dir || !f) continue;
      u += dir * f; valor += dir * f * tarifa(cg, km(m, c)) * kmNC / Math.max(kmNC, kmRec);
    }
    return { u, valor: u ? valor / u : 0 };
  };
}
// La mejor ruta nueva con su primer avión: hacia cada ciudad disponible que todavía no está en la red, desde el hub si algún avión
// llega y si no desde la ciudad servida más cercana; el avión que más rinde por peso. Se ofrece solo si alcanza la plata para las dos
// cosas y la reserva.
function expansiones(s) {
  const R = red(s), out = [];
  const origenes = R.nodos.length ? R.nodos : [];
  if (!origenes.length) return out;
  const tipos = avionesDisponibles(s);
  for (const a of AEROPUERTOS) {
    if (R.tocados.has(a.id) || !ciudadDisponible(s, a.id)) continue;
    const n = R.adj[HUB] && tipos.some((t) => t.alcance >= km(HUB, a.id)) ? HUB : origenes.reduce((x, y) => (km(y, a.id) < km(x, a.id) ? y : x));
    const p = puedeAbrirRuta(s, n, a.id);
    if (!p.ok) continue;
    const demanda = demandaRutaNueva(s, n, a.id);
    let mejor = null;
    for (const t of tipos) {
      if (t.alcance < p.km) continue;
      const costo = p.costo + t.precio;
      if (s.dinero - costo < reserva(s, { t, r: { km: p.km } })) continue;
      const e = estimarTramo(s, t, n, a.id, p.km, s.cap >= 2, () => 0, 0.6, demanda);
      if (e > 0 && (!mejor || e / costo > mejor.v)) mejor = { tipo: 'ruta', id: idRuta(n, a.id), a: n, b: a.id, avion: t.id, costo, efectoDia: e, v: e / costo };
    }
    if (mejor) { delete mejor.v; out.push(mejor); }
  }
  return out;
}

function peorAvion(s) {
  let peor = null, v = Infinity;
  for (const av of s.aviones) {
    const horas = Math.max(1, (s.t - (av.desde ?? 0)) / 60);
    const x = (av.ing - av.cos) / horas;
    if (x < v) { v = x; peor = av; }
  }
  return peor;
}

// Todas las decisiones posibles ahora, con su costo y su efecto estimado en el neto por día.
export function decisiones(s) {
  const out = [];
  const res = (costo) => s.dinero - costo >= reservaSugerencia(s);
  const m = misionActual(s);
  // aviones por ruta y estimaciones de compra, una vez por llamada (con cientos de aviones, recorrer la flota por cada ruta pesa)
  const porRuta = {};
  for (const av of s.aviones) (porRuta[av.ruta] ??= []).push(av);
  const tiene = (id) => !!porRuta[id];
  const memo = new Map();
  const est = (tid, rid) => { const k = `${tid}|${rid}`; let v = memo.get(k); if (v === undefined) memo.set(k, (v = estimarAvion(s, tid, rid))); return v; };
  const mejorTipo = (r) => mejorTipoPara(s, r, est);
  // Si lo que pide la historia todavía no alcanza pero la red lo junta pronto (en 1,5 días de juego o menos), la mejor próxima
  // acción es juntar para eso en vez de gastar en otra cosa: «Juntá $X para el Halcón». No cuesta nada ni suma por día; trae lo
  // que falta y en cuántos minutos reales se junta a este ritmo.
  const ahorrar = (total, que, id) => {
    const falta = Math.ceil(total - s.dinero), gd = gananciaDia(s);
    if (falta > 0 && gd > 0 && falta <= 1.5 * gd) out.push({ tipo: 'ahorrar', id, que, costo: 0, meta: Math.round(total), falta, efectoDia: 0, mision: true, minutos: +(falta / gd * 1440 / MIN_POR_SEG / 60).toFixed(1) });
  };
  const masBaratoPara = (r) => avionesDisponibles(s).filter((t) => t.alcance >= r.km).sort((x, y) => x.precio - y.precio)[0];
  // de la historia
  if (m?.tipo === 'ruta') {
    const id = idRuta(m.a, m.b), r = s.rutas.find((x) => x.id === id);
    if (!r) {
      const p = puedeAbrirRuta(s, m.a, m.b);
      if (p.ok && res(p.costo)) out.push({ tipo: 'ruta', id, a: m.a, b: m.b, costo: p.costo, efectoDia: 0, mision: true });
      else if (p.error === 'desconectada') { const d = pasoHacia(s, km(HUB, m.a) < km(HUB, m.b) ? m.a : m.b, true); if (d) out.push({ ...d, mision: true }); }
      else if (p.ok || p.error === 'plata') ahorrar(p.costo + reservaSugerencia(s), 'ruta', id);
    }
    else if (!tiene(id)) {
      const t = mejorTipo(r);
      if (t) out.push({ tipo: 'avion', id: t.id, ruta: id, costo: t.precio, efectoDia: Math.max(0, est(t.id, id)), mision: true });
      else { const b = masBaratoPara(r); if (b) ahorrar(b.precio + reserva(s, { t: b, r }), 'avion', b.id); }
    }
  }
  if (m?.tipo === 'despeguesNoche' && !s.rutas.some((r) => r.balizas && tiene(r.id))) {
    const r = [...s.rutas].filter((x) => tiene(x.id)).sort((x, y) => costoBalizas(x, s) - costoBalizas(y, s))[0];
    if (r && s.dinero >= costoBalizas(r, s) && res(costoBalizas(r, s))) out.push({ tipo: 'balizas', id: r.id, costo: costoBalizas(r, s), efectoDia: estimarBalizas(s, r), mision: true });
    else if (r) ahorrar(costoBalizas(r, s) + reservaSugerencia(s), 'balizas', r.id);
  }
  if ((m?.tipo === 'entregasEn' || m?.tipo === 'entregasEnTodas') ) {
    const metas = m.tipo === 'entregasEn' ? [m.ciudad] : m.ciudades;
    for (const c of metas) {
      const d = pasoHacia(s, c);
      if (d) { out.push({ ...d, mision: true }); break; }
      // la ruta hacia la ciudad ya está abierta pero su avión no alcanza: juntar para él (si la red lo junta pronto)
      const sinAv = !red(s).adj[c] && s.rutas.find((r) => (r.a === c || r.b === c) && !tiene(r.id));
      const b = sinAv && masBaratoPara(sinAv);
      if (b) { ahorrar(b.precio + reserva(s, { t: b, r: sinAv }), 'avion', b.id); break; }
    }
  }
  if (m?.tipo === 'entregas') { // un avión que lleve esa carga donde más demanda de esa carga queda sin atender
    let mejor = null;
    for (const r of s.rutas) for (const t of avionesDisponibles(s)) {
      if (!t.lleva[m.carga] || t.alcance < r.km || !puedeComprar(s, t.id, r.id).ok) continue;
      const e = est(t.id, r.id);
      if (e > 0 && (!mejor || e / t.precio > mejor.v)) mejor = { tipo: 'avion', id: t.id, ruta: r.id, costo: t.precio, efectoDia: e, mision: true, v: e / t.precio };
    }
    if (mejor) { delete mejor.v; out.push(mejor); }
  }
  if (m?.tipo === 'ciudadesActivas' && progreso(s, m) < m.meta) {
    const sinAvion = s.rutas.find((r) => !tiene(r.id));
    const t = sinAvion && mejorTipo(sinAvion);
    if (t) out.push({ tipo: 'avion', id: t.id, ruta: sinAvion.id, costo: t.precio, efectoDia: Math.max(0, est(t.id, sinAvion.id)), mision: true });
    else if (!sinAvion) {
      let mejor = null;
      // desde el hub si algún avión llega (una sola escala para todo el resto de la red); si no, desde la ciudad más cercana
      for (const a of AEROPUERTOS) {
        if (!ciudadDisponible(s, a.id) || red(s).tocados.has(a.id)) continue;
        for (const n of red(s).tocados) {
          const p = puedeAbrirRuta(s, n, a.id);
          const v = n === HUB ? p.km * 0.5 : p.km * 1.5;
          if (p.ok && res(p.costo) && (!mejor || v < mejor.km)) mejor = { tipo: 'ruta', id: idRuta(n, a.id), a: n, b: a.id, costo: p.costo, efectoDia: 0, mision: true, km: v };
        }
      }
      if (mejor) { delete mejor.km; out.push(mejor); }
    }
  }
  if (m?.tipo === 'enServicio' && !s.aviones.some((a) => a.tipo === m.avion)) {
    const r = [...s.rutas].filter((x) => AV[m.avion].alcance >= x.km).sort((x, y) => y.km - x.km)[0];
    if (r && puedeComprar(s, m.avion, r.id).ok) out.push({ tipo: 'avion', id: m.avion, ruta: r.id, costo: AV[m.avion].precio, efectoDia: Math.max(0, est(m.avion, r.id)), mision: true });
    else if (r && avionDisponible(s, m.avion)) ahorrar(AV[m.avion].precio + reserva(s, { t: AV[m.avion], r }), 'avion', m.avion);
  }
  // contratos: aceptar es gratis y suma el premio (si hay camino para cumplirlo)
  if (s.contratos.activos.length < CONTRATO.maxActivos) for (const c of s.contratos.tablero) {
    if (red(s).sig[c.o]?.[c.d]) out.push({ tipo: 'contrato', id: c.id, costo: 0, efectoDia: Math.round(c.premio / c.dias), objetivo: true, ...(m?.tipo === 'contratos' ? { mision: true } : {}) });
  }
  // red de seguridad: si la caja no alcanza para 2 vuelos y el neto lleva un día negativo, vender el avión que más pierde
  if (s.aviones.length > 1 && s.dinero < reservaSugerencia(s) && s.flags.negDesde != null && s.t - s.flags.negDesde >= 1440) {
    const p = peorAvion(s);
    const perdidaDia = Math.round(-(p.ing - p.cos) / Math.max(1, (s.t - p.desde) / 1440));
    out.push({ tipo: 'vender', id: p.id, costo: -Math.round(AV[p.tipo].precio * VENTA), efectoDia: Math.max(1, perdidaDia), seguridad: true });
  }
  // aviones de más: en una ruta con 2 o más, el que no aporta (la ruta lleva lo mismo sin él) se vende
  if (!out.some((d) => d.seguridad)) {
    for (const id in porRuta) {
      const avs = porRuta[id];
      if (avs.length < 2) continue;
      let peor = null;
      const porTipo = {}; // dos aviones del mismo tipo en la misma ruta aportan lo mismo: se estima una vez por tipo
      for (const av of [...avs].reverse()) { const v = (porTipo[av.tipo] ??= aporteAvion(s, av)); if (v < 0 && (!peor || v < peor.v)) peor = { av, v }; } // a igual aporte, el más nuevo
      if (peor) out.push({ tipo: 'vender', id: peor.av.id, ruta: id, costo: -Math.round(AV[peor.av.tipo].precio * VENTA), efectoDia: -peor.v, sobra: true });
    }
  }
  // economía: un avión más donde sobra demanda, balizas, centro de transbordo
  for (const r of s.rutas) {
    const t = mejorTipo(r); // ya filtra lo que se puede comprar
    if (t) { const e = est(t.id, r.id); if (e > 0) out.push({ tipo: 'avion', id: t.id, ruta: r.id, costo: t.precio, efectoDia: e }); }
    if (!iluminada(s, r) && (porRuta[r.id] ?? []).some((a) => !AV[a.tipo].nocturno)) {
      const c = costoBalizas(r, s);
      if (s.dinero >= c && res(c)) { const e = estimarBalizas(s, r); if (e > 0) out.push({ tipo: 'balizas', id: r.id, costo: c, efectoDia: e }); }
    }
  }
  // carga mínima (gratis): si los vuelos de una ruta salen por debajo del equilibrio, esperar un escalón más de carga
  for (const r of s.rutas) {
    const avs = porRuta[r.id] ?? [];
    if (!avs.length || r.vuelos < 4) continue;
    const t = AV[avs[0].tipo];
    const lleno = Object.entries(t.lleva).reduce((a2, [c, n]) => a2 + (capitulo(s).cargas[c] ? n * tarifa(c, r.km) : 0), 0);
    const equilibrio = lleno ? (costoVuelo(s, t, r) + t.tierraHora * t.giro / 60) / lleno : 1;
    const i = CARGA_MINIMA.indexOf(r.minCarga);
    if (r.ocup < equilibrio && i >= 0 && i < CARGA_MINIMA.length - 1) {
      const vuelosDia = avs.length * 24 / (2 * (r.km / t.vel + t.giro / 60));
      out.push({ tipo: 'cargaMin', id: r.id, v: CARGA_MINIMA[i + 1], costo: 0, efectoDia: Math.max(1, Math.round((equilibrio - r.ocup) * lleno * vuelosDia * 0.3)) });
    }
  }
  for (const d of expansiones(s)) if (res(d.costo)) out.push(d);
  for (const ap of red(s).nodos) {
    const n = (s.niveles[ap] ?? 0) + 1;
    if (n >= TRANSBORDO.length) continue;
    const costo = TRANSBORDO[n].precio;
    const e = estimarTransbordo(s, ap);
    if (e > 0 && s.dinero >= costo && res(costo)) out.push({ tipo: 'transbordo', id: ap, costo, efectoDia: e });
  }
  return out;
}
function mejorTipoPara(s, r, est = (tid, rid) => estimarAvion(s, tid, rid)) {
  const tipos = avionesDisponibles(s).filter((t) => t.alcance >= r.km && puedeComprar(s, t.id, r.id).ok);
  let mejor = null, v = -Infinity;
  for (const t of tipos) { const e = est(t.id, r.id) / t.precio; if (e > v) { v = e; mejor = t; } }
  return mejor;
}
// Iluminar una ruta deja volar las 10 horas de noche: lo que la red manda por ahí en esas horas (hasta lo que pueden llevar sus
// aviones) llega a tiempo en vez de tarde o perderse. Se estima con el 35% de su valor.
function estimarBalizas(s, r) {
  const ida = demandaTramo(s, r.a, r.b), vuelta = demandaTramo(s, r.b, r.a);
  const cap = capacidadHora(s, r.id, 'correo') + capacidadHora(s, r.id, 'pasajeros');
  const u = Math.min(cap, ida.u) * ida.valor + Math.min(cap, vuelta.u) * vuelta.valor;
  return Math.round(u * 10 * 0.35);
}
function estimarTransbordo(s, ap) {
  const cap = capacidadTransbordo(s, ap), cola = enTransbordo(s, ap);
  const perdAyer = s.diario.dias[0]?.[ap]?.perdTb ?? 0, perdHoy = s.diario.hoy[ap]?.perdTb ?? 0;
  const atraso = cola / cap; // horas que tarda el centro en vaciarse
  if (atraso < 2 && perdAyer + perdHoy < 5) return 0;
  // lo que se pierde por día más lo que llega tarde por la demora, a una tarifa de conexión típica
  return Math.round((perdAyer + perdHoy + Math.max(0, cola - 2 * cap)) * tarifa('correo', 600) * 0.4);
}
// La acción más barata que acerca una ciudad que todavía no recibe vuelos.
function pasoHacia(s, ciudad, aunqueTocada = false) {
  const R = red(s);
  if (R.adj[ciudad] || (aunqueTocada && R.tocados.has(ciudad))) return null;
  const tipos = avionesDisponibles(s);
  const alc = Math.max(...tipos.map((t) => t.alcance));
  // si ya existe una ruta hacia la ciudad pero sin avión, comprar
  const sinAvion = s.rutas.find((r) => (r.a === ciudad || r.b === ciudad) && !s.aviones.some((a) => a.ruta === r.id));
  if (sinAvion) { const t = mejorTipoPara(s, sinAvion); return t ? { tipo: 'avion', id: t.id, ruta: sinAvion.id, costo: t.precio, efectoDia: Math.max(0, estimarAvion(s, t.id, sinAvion.id)) } : null; }
  let mejor = null;
  for (const n of R.tocados.size ? [...R.tocados] : [HUB]) for (const a of AEROPUERTOS) {
    if (!ciudadDisponible(s, a.id) || R.tocados.has(a.id) && a.id !== ciudad) continue;
    const d = km(n, a.id);
    if (d > alc) continue;
    const resto = km(a.id, ciudad);
    if (resto >= km(n, ciudad)) continue;
    const p = puedeAbrirRuta(s, n, a.id);
    if (!p.ok) continue;
    const v = resto * 3 + d;
    if (!mejor || v < mejor.v) mejor = { tipo: 'ruta', id: idRuta(n, a.id), a: n, b: a.id, costo: p.costo, efectoDia: 0, v };
  }
  if (mejor) delete mejor.v;
  return mejor;
}

// La mejor próxima acción: primero la red de seguridad, después lo que pide la historia (o juntar para eso, tipo 'ahorrar', si la
// red lo junta pronto), después lo que más rinde por peso. Nunca sugiere algo con efecto negativo ni algo que deje la caja por
// debajo del costo de 2 vuelos.
export function sugerencia(s) {
  const ds = decisiones(s).filter((d) => d.efectoDia >= 0 && (d.costo <= 0 || s.dinero - d.costo >= reservaSugerencia(s)));
  const seg = ds.find((d) => d.seguridad);
  if (seg) return seg;
  const hist = ds.find((d) => d.mision);
  if (hist) return hist;
  // rinde por peso, pero con una escala: medio día de la ganancia actual (así una acción gratis que suma poco no le gana a una que
  // cuesta y suma mucho, y vender lo que sobra no tapa lo que hace crecer la red)
  const escala = Math.max(5000, Math.abs(gananciaDia(s)) / 2);
  const puntaje = (d) => d.efectoDia / Math.max(escala / 4, d.costo + escala);
  const eco = ds.filter((d) => d.efectoDia > 0).sort((a, b) => puntaje(b) - puntaje(a))[0];
  return eco ?? null;
}

// ───────────────────────── lecturas para la interfaz ─────────────────────────
export function resumenRuta(s, id) {
  const r = s.rutas.find((x) => x.id === id);
  if (!r) return null;
  const aviones = s.aviones.filter((a) => a.ruta === id);
  const caps = Object.keys(capitulo(s).cargas);
  const demanda = caps.map((c) => ({ c, ida: demandaHora(s, r.a, r.b, c), vuelta: demandaHora(s, r.b, r.a, c) }));
  const t = aviones[0] ? AV[aviones[0].tipo] : null;
  const x = indice(s).n, suma = (o) => Object.values(o ?? {}).reduce((a, b) => a + b, 0);
  const F = flujos(s), fi = F[`${r.a}>${r.b}`], fv = F[`${r.b}>${r.a}`];
  return { ...r, aviones, demanda, neto: r.ingresos - r.costos,
    costoDespegue: t ? costoVuelo(s, t, r) : null, ingresoMedio: r.vuelos ? Math.round(r.ingresos / r.vuelos) : 0,
    costoHoraParado: aviones.reduce((a, av) => a + AV[av.tipo].tierraHora, 0),
    esperan: { ida: suma(x[r.a]?.[r.b]), vuelta: suma(x[r.b]?.[r.a]) },          // lo que espera salir por esta ruta, por sentido
    // lo que espera en una punta con destino final en la otra (aunque la ruta no tenga aviones y la red no lo rutee por acá)
    directo: { ida: esperaHacia(s, r.a, r.b), vuelta: esperaHacia(s, r.b, r.a) },
    porHora: { ida: fi?.u ?? 0, vuelta: fv?.u ?? 0 },                            // lo que la red quiere mandar por acá
    capacidadHora: Object.keys(capitulo(s).cargas).reduce((a, c) => a + capacidadHora(s, r.id, c), 0) };
}

function esperaHacia(s, ap, d) { let n = 0; for (const g of Object.values(s.colas[ap] ?? {})) if (g.d === d) n += g.n; return n; }

// Por sentido: unidades por hora que pasan (locales y en conexión), capacidad ofrecida por hora, perdidas por hora y trabadas.
export function flujoTramo(s, rutaId) {
  const r = s.rutas.find((x) => x.id === rutaId);
  if (!r) return null;
  const F = flujos(s);
  const sentido = (a, b) => {
    const f = F[`${a}>${b}`] ?? { locales: 0, conexion: 0 };
    const locales = f.locales, conexion = f.conexion;
    const capacidad = Object.keys(capitulo(s).cargas).reduce((acc, c) => acc + capacidadHora(s, rutaId, c), 0);
    const clave = `${a}>${b}`;
    const ayer = s.stats.perdTramoAyer[clave];
    const hoy = (s.stats.perdTramo[clave] ?? 0) - (s.stats.perdTramo0[clave] ?? 0);
    const horasHoy = Math.max(1, minutoDelDia(s) / 60);
    return { de: a, a: b, locales, conexion, pasan: locales + conexion, capacidad, perdidas: ayer != null ? ayer / 24 : hoy / horasHoy };
  };
  return { ruta: rutaId, ida: sentido(r.a, r.b), vuelta: sentido(r.b, r.a), trabadas: s.stats.trabadas[rutaId] ?? 0 };
}

// Indicadores del hub: % a tiempo en 7 días, ocupación media, demanda perdida por día, horas de atraso del centro y costo por unidad.
export function indicadoresHub(s, ap = HUB) {
  const dias = [s.diario.hoy, ...s.diario.dias];
  let ok = 0, tot = 0;
  for (const d of dias) { ok += d[ap]?.ok ?? 0; tot += d[ap]?.tot ?? 0; }
  const rutas = s.rutas.filter((r) => r.a === ap || r.b === ap);
  const vuelos = rutas.reduce((a, r) => a + r.vuelos, 0);
  const ocup = vuelos ? rutas.reduce((a, r) => a + r.ocup * r.vuelos, 0) / vuelos : 0;
  const costos = rutas.reduce((a, r) => a + r.costos, 0), unidades = rutas.reduce((a, r) => a + (r.unidades ?? 0), 0);
  const perdAyer = s.diario.dias[0]?.[ap]?.perd;
  const perdHoy = s.diario.hoy[ap]?.perd ?? 0;
  return {
    ap, aTiempo7d: tot ? ok / tot : null, entregas7d: tot, ocupacion: ocup,
    perdidaDia: perdAyer ?? Math.round(perdHoy * 24 / Math.max(1, minutoDelDia(s) / 60)),
    horasAtraso: enTransbordo(s, ap) / capacidadTransbordo(s, ap), costoUnidad: unidades ? costos / unidades : null,
  };
}

export function potencial(s, ap) { // demanda por hora que traería conectar este aeropuerto a la red actual (o al hub)
  const nodos = red(s).nodos.length ? red(s).nodos : [HUB];
  let total = 0;
  for (const n of nodos) if (n !== ap) for (const c of Object.keys(capitulo(s).cargas)) total += demandaHora(s, ap, n, c) + demandaHora(s, n, ap, c);
  return total;
}

// ───────────────────────── paso ─────────────────────────
export function paso(s, dt = PASO) {
  const ev = tomarEventos(s);
  s.t += dt;
  climaDelPaso(s, ev);
  cerrarDia(s, ev);
  generarDemanda(s, dt);
  procesarTransbordo(s, dt);
  moverAviones(s, dt, ev);
  avisosDeNoche(s, ev);
  cicloRonda(s, ev);
  cerrarHora(s, ev);
  revisarObjetivos(s, ev);
  return ev;
}

// La primera noche avisa qué aviones se van a quedar parados por falta de balizas (y dos horas antes, que se viene).
function avisosDeNoche(s, ev) {
  if (s.flags.primeraNoche) return;
  const h = hora(s);
  const parados = () => { const R = red(s); return s.aviones.filter((a) => !AV[a.tipo].nocturno && !iluminada(s, R.porId[a.ruta] ?? {})).map((a) => a.id); };
  if (!s.flags.avisoNoche && h >= 18 && h < 20 && s.aviones.length) { s.flags.avisoNoche = true; ev.push({ tipo: 'avisoNoche', aviones: parados() }); }
  if (esNoche(s) && s.aviones.length) { s.flags.primeraNoche = true; ev.push({ tipo: 'primeraNoche', aviones: parados() }); }
}

// ───────────────────────── ausencia ─────────────────────────
// Segundos de juego equivalentes a una ausencia: el 50% de las primeras 2 h, el 20% hasta las 24 h, nada después.
export function rindeAusencia(segundos) {
  let eq = 0, desde = 0;
  for (const [hasta, f] of AUSENCIA.tramos) { const h = Math.min(segundos, hasta * 3600); if (h > desde) eq += (h - desde) * f; desde = hasta * 3600; }
  return eq;
}

// Simula la ausencia (pestaña cerrada u oculta): la red trabaja de verdad hasta la mañana siguiente (de 6 a 24 h de juego, con
// pasos de 15 min) y con eso arma el parte de la mañana; las misiones y los contratos avanzan con lo que de verdad se entrega.
// Lo acreditado sigue la curva decreciente (rindeAusencia) sobre lo que la red ganó por día en esa muestra. Si el neto es
// negativo se cobra lo que pasó, sin dejar la caja por debajo de cero. Con CONFIG.ausencia = false no pasa nada (los guardados
// siguen sirviendo).
export function simularAusencia(s, segundosReales) {
  if (!CONFIG.ausencia) return { minutos: 0, neto: 0, extra: 0, eventos: [], apagada: true };
  if (!(segundosReales >= 60)) return { minutos: 0, neto: 0, extra: 0, eventos: [] };
  const seg = Math.min(segundosReales, AUSENCIA.tramos.at(-1)[0] * 3600);
  const eq = rindeAusencia(seg);
  const hastaManiana = ((7 * 60 - minutoDelDia(s)) + 1440) % 1440 || 1440;
  const minutos = Math.floor(Math.min(eq * MIN_POR_SEG * AUSENCIA.ritmo * 4, Math.max(AUSENCIA.muestraMin, Math.min(AUSENCIA.muestraMax, hastaManiana))) / AUSENCIA.paso) * AUSENCIA.paso;
  if (minutos < 60) return { minutos: 0, neto: 0, extra: 0, eventos: [] };
  const antes = { dinero: s.dinero, entregas: totalEntregas(s), aTiempo: s.stats.aTiempo, perdidas: s.stats.perdidas,
    rutas: Object.fromEntries(s.rutas.map((r) => [r.id, r.ingresos - r.costos])), misiones: s.misiones.length };
  const eventos = [];
  for (let m = 0; m < minutos; m += AUSENCIA.paso) for (const e of paso(s, AUSENCIA.paso)) if (e.tipo !== 'cobro' && e.tipo !== 'despegue' && e.tipo !== 'aterrizaje') eventos.push(e);
  const operado = s.dinero - antes.dinero - premiosDe(eventos);
  // Lo que la red gana por día medido en la muestra, llevado a la curva de ausencia y al techo.
  const porDia = operado / (minutos / 1440);
  const dias = eq * MIN_POR_SEG * AUSENCIA.ritmo / 1440;
  const bruto = porDia > 0 ? Math.round(porDia * dias) : Math.round(operado);
  let neto = bruto;
  s.dinero = antes.dinero + premiosDe(eventos) + neto;
  if (neto < 0 && s.dinero < 0 && antes.dinero >= 0) { neto -= s.dinero; s.dinero = 0; }
  let mejorRuta = null;
  for (const r of s.rutas) { const v = r.ingresos - r.costos - (antes.rutas[r.id] ?? 0); if (!mejorRuta || v > mejorRuta.neto) mejorRuta = { id: r.id, neto: Math.round(v) }; }
  const noches = eventos.filter((e) => e.tipo === 'resultadoNoche').map((e) => ({ id: e.id, ingreso: e.ingreso, ingresoSugerido: e.ingresoSugerido, extraJugando: Math.max(0, e.ingresoSugerido - e.ingreso) }));
  const parte = { entregas: totalEntregas(s) - antes.entregas, aTiempo: s.stats.aTiempo - antes.aTiempo, perdidas: s.stats.perdidas - antes.perdidas,
    mejorRuta, misiones: eventos.filter((e) => e.tipo === 'mision').map((e) => e.id), noches };
  return { minutos, neto, extra: neto > 0 ? neto : 0, eventos, parte, dias: +dias.toFixed(2) };
}
const totalEntregas = (s) => s.stats.entregas.correo + s.stats.entregas.pasajeros + s.stats.entregas.carga;
// Plata que no sale de operar (premios y ventas forzadas): no se extrapola con la curva de ausencia.
const premiosDe = (ev) => ev.reduce((a, e) => a + ((e.tipo === 'mision' || e.tipo === 'contrato') ? e.premio ?? 0 : e.tipo === 'ventaForzada' ? e.monto ?? 0 : 0), 0);

// ───────────────────────── guardado ─────────────────────────
// Formato compacto (v2): las colas y los aviones van como enteros empaquetados en texto (5 bits por carácter, base 64 sin
// escapes), con la misma precisión que usa el modelo (edades en minutos enteros, fracción cobrada en centésimos, km enteros: ver
// fundir), así guardar y restaurar deja la partida exactamente igual. Un grupo que espera en su origen (nada cobrado, distancia =
// la del par) ocupa 3 enteros. Un capítulo 3 con 300 aviones pesa menos de 50 KB.
const r2 = (x) => Math.round(x * 100) / 100;
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const B64_IDX = Object.fromEntries([...B64].map((c, i) => [c, i]));
export function empacar(nums) {
  let out = '';
  for (const x of nums) {
    const v = Math.round(x);
    let z = v < 0 ? -2 * v - 1 : 2 * v;  // zigzag: los negativos también
    do { const d = z % 32; z = Math.floor(z / 32); out += B64[d + (z > 0 ? 32 : 0)]; } while (z > 0);
  }
  return out;
}
export function desempacar(txt) {
  const out = [];
  let z = 0, f = 1;
  for (const ch of txt) {
    const d = B64_IDX[ch];
    if (d === undefined) throw new Error('empaquetado inválido');
    z += (d & 31) * f; f *= 32;
    if (d < 32) { out.push(z % 2 ? -(z + 1) / 2 : z / 2); z = 0; f = 1; }
  }
  if (f !== 1) throw new Error('empaquetado cortado');
  return out;
}
// grupo → enteros. código = ((destino × 3 + carga) × 8) + banderas (1: en origen, 2: contrato, 4: hora de llegada propia).
function grupoInts(g, ap, t, out) {
  const enOrigen = ap && g.p === 0 && Math.round(g.km) === km(ap, g.d);
  const conTl = g.tl !== undefined && g.tl !== g.tc;
  out.push((AP_IDX[g.d] * 3 + CARGA_IDS.indexOf(g.c)) * 8 + (enOrigen ? 1 : 0) + (g.k ? 2 : 0) + (conTl ? 4 : 0), g.n, t - g.tc);
  if (!enOrigen) out.push(g.p * 100, g.km);
  if (g.k) out.push(g.k);
  if (conTl) out.push(t - g.tl);
}
function grupoDeInts(a, i, ap, t) {
  const cod = a[i++], f = cod % 8, base = Math.floor(cod / 8);
  const d = AEROPUERTOS[Math.floor(base / 3)]?.id, c = CARGA_IDS[base % 3];
  if (!d || !c) throw new Error('grupo inválido');
  const n = a[i++], tc = t - a[i++];
  let p = 0, kmOD = ap ? km(ap, d) : 0;
  if (!(f & 1)) { p = a[i++] / 100; kmOD = a[i++]; }
  const k = f & 2 ? a[i++] : 0;
  const tl = f & 4 ? t - a[i++] : tc;
  return [nuevoGrupo(d, c, n, tc, p, kmOD, k, tl), i];
}
function colasTxt(colas, t) {
  const o = {};
  for (const ap in colas) { const ints = []; for (const g of Object.values(colas[ap])) if (g.n > 0) grupoInts(g, ap, t, ints); if (ints.length) o[ap] = empacar(ints); }
  return o;
}
function colasDeTxt(o, t) {
  const c = {};
  for (const ap in o) {
    if (!AP[ap]) throw new Error('aeropuerto desconocido');
    c[ap] = {};
    const a = desempacar(o[ap]);
    for (let i = 0; i < a.length;) { const [g, j] = grupoDeInts(a, i, ap, t); i = j; c[ap][llaveGrupo(g.d, g.c, g.k)] = g; }
  }
  return c;
}
const TIPO_IDX = Object.fromEntries(AVIONES.map((a, i) => [a.id, i]));
const ESPERAS = [null, 'noche', 'tormenta', 'carga', 'vacio', 'ronda'];
function avionesTxt(s) {
  const rutaIdx = Object.fromEntries(s.rutas.map((r, i) => [r.id, i]));
  const ints = [];
  for (const a of s.aviones) {
    const r = s.rutas[rutaIdx[a.ruta]];
    ints.push(a.id, TIPO_IDX[a.tipo], rutaIdx[a.ruta], a.en === r.a ? 0 : 1, a.fase === 'vuelo' ? 1 : 0, a.resta, a.dur, a.esperado ?? 0,
      a.v ?? 0, (a.ing ?? 0) - (a.cos ?? 0), a.costoVuelo ?? 0, (s.t - (a.desde ?? 0)) / 10, a.ronda == null ? 0 : a.ronda - s.dia + 1000,
      Math.max(0, ESPERAS.indexOf(a.espera ?? null)), a.carga.length);
    for (const x of a.carga) grupoInts(x, null, s.t, ints);
  }
  return empacar(ints);
}
function avionesDeTxt(txt, rutas, t, dia) {
  const a = desempacar(txt), out = [];
  for (let i = 0; i < a.length;) {
    const [id, ti, ri, lado, fase, resta, dur, esperado, v, neto, costoVuelo, edad, ronda, espera, ng] = a.slice(i, i + 15);
    i += 15;
    const r = rutas[ri], tipo = AVIONES[ti]?.id;
    if (!r || !tipo) throw new Error('avión inválido');
    const carga = [];
    for (let k = 0; k < ng; k++) { const [g, j] = grupoDeInts(a, i, null, t); i = j; delete g.tl; carga.push(g); }
    out.push({ id, tipo, ruta: r.id, en: lado ? r.b : r.a, hacia: lado ? r.a : r.b, fase: fase ? 'vuelo' : 'tierra', resta, dur, esperado,
      carga, v, ing: Math.max(0, neto), cos: Math.max(0, -neto), costoVuelo, desde: t - edad * 10, ronda: ronda ? ronda - 1000 + dia : null, espera: ESPERAS[espera] ?? null });
  }
  return out;
}

export function guardar(s) {
  const diario = (d) => Object.fromEntries(Object.entries(d).map(([ap, x]) => [ap, [x.ok, x.tot, x.perd, x.perdTb ?? 0]]));
  const o = {
    v: VERSION, cap: s.cap, semilla: s.semilla, sem0: s.sem0, t0: s.t0, t: s.t, dinero: r2(s.dinero), niveles: s.niveles, sigId: s.sigId, verRed: s.verRed,
    rutas: s.rutas.map((r) => [r.a, r.b, r.balizas ? 1 : 0, r.minCarga, r.esperaMax, r.vuelos, Math.round(r.ingresos), Math.round(r.costos), r2(r.ocup), r.unidades ?? 0]),
    aviones: avionesTxt(s), colas: colasTxt(s.colas, s.t), transbordo: colasTxt(s.transbordo, s.t),
    stats: { ...s.stats, ingresos: Math.round(s.stats.ingresos), gastos: Math.round(s.stats.gastos), mejorDia: Math.round(s.stats.mejorDia) },
    hora24: s.hora24.map(r2), horaIdx: s.horaIdx, netoHora: r2(s.netoHora),
    misiones: s.misiones, mision: s.mision, contratos: s.contratos, banco: s.banco,
    ronda: { ...s.ronda, noche: s.ronda.noche ? { ...s.ronda.noche, escena: undefined } : null },
    clima: { ...s.clima, combustible: Math.round(s.clima.combustible * 1e4) / 1e4 }, flags: s.flags,
    diario: { hoy: diario(s.diario.hoy), dias: s.diario.dias.map(diario) }, ultVuelo: s.ultVuelo, ultSalida: s.ultSalida, dia: s.dia,
    opciones: s.opciones, guardado: Date.now(),
  };
  return JSON.stringify(o);
}

const finito = (x) => typeof x === 'number' && Number.isFinite(x);
// Lee un guardado: valida la estructura, migra de v1 a v2 y nunca tira excepción. Ante un guardado inválido devuelve { error };
// los de una versión mayor se rechazan sin tocarlos ({ error: 'version' }).
export function restaurar(texto) {
  let o;
  try { o = typeof texto === 'string' ? JSON.parse(texto) : texto; } catch { return { error: 'json' }; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return { error: 'formato' };
  if (!finito(o.v)) return { error: 'version' };
  if (o.v > VERSION) return { error: 'version', v: o.v };
  try {
    const s = o.v === 1 ? deV1(o) : o.v === 2 ? deV2(o) : null;
    if (!s) return { error: 'version', v: o.v };
    const e = validar(s);
    if (e) return { error: e };
    return s;
  } catch { return { error: 'invalido' }; }
}

function base(o) {
  const s = nuevoEstado(finito(o.semilla) ? o.semilla : 1);
  tomarEventos(s);
  s.colas = {}; s.misiones = []; s.mision = null;
  return s;
}
function deV2(o) {
  const s = base(o);
  if (!Array.isArray(o.rutas) || typeof o.aviones !== 'string' || !finito(o.t)) return null;
  Object.assign(s, { cap: o.cap, semilla: o.semilla, sem0: finito(o.sem0) ? o.sem0 : o.semilla, t0: o.t0, t: o.t, dinero: o.dinero, niveles: o.niveles ?? {}, sigId: o.sigId, verRed: o.verRed ?? 0 });
  s.rutas = o.rutas.map((x) => ({ id: idRuta(x[0], x[1]), a: x[0], b: x[1], km: AP[x[0]] && AP[x[1]] ? km(x[0], x[1]) : NaN, balizas: !!x[2], minCarga: x[3], esperaMax: x[4],
    vuelos: x[5], ingresos: x[6], costos: x[7], ocup: x[8], unidades: x[9] ?? 0 }));
  s.dia = o.dia ?? diaCalendario(s);
  s.aviones = avionesDeTxt(o.aviones, s.rutas, s.t, s.dia);
  s.colas = colasDeTxt(o.colas ?? {}, s.t); s.transbordo = colasDeTxt(o.transbordo ?? {}, s.t);
  s.stats = { ...statsVacias(), ...(o.stats ?? {}) };
  s.hora24 = o.hora24; s.horaIdx = o.horaIdx; s.netoHora = o.netoHora ?? 0;
  s.misiones = o.misiones ?? []; s.mision = o.mision ?? null;
  s.contratos = { ...s.contratos, ...(o.contratos ?? {}) };
  s.banco = o.banco ?? {}; s.ronda = { ...s.ronda, ...(o.ronda ?? {}) };
  s.clima = { ...s.clima, ...(o.clima ?? {}) }; s.flags = o.flags ?? {};
  const diario = (d) => Object.fromEntries(Object.entries(d ?? {}).map(([ap, x]) => [ap, { ok: x[0], tot: x[1], perd: x[2], perdTb: x[3] ?? 0 }]));
  s.diario = { hoy: diario(o.diario?.hoy), dias: (o.diario?.dias ?? []).map(diario) };
  s.ultVuelo = o.ultVuelo ?? {}; s.ultSalida = o.ultSalida ?? {}; s.opciones = o.opciones;
  if (o.guardado) s.guardado = o.guardado;
  if (s.ronda.noche?.estado === 'corriendo') s.ronda.noche.escena = null;
  return s;
}
// v1: el formato del prototipo (objetos completos). Las colas ya eran grupos; se completan los campos nuevos.
function deV1(o) {
  const s = base(o);
  if (!Array.isArray(o.rutas) || !Array.isArray(o.aviones)) return null;
  Object.assign(s, { cap: o.cap, semilla: o.semilla, sem0: o.semilla, t0: o.t0, t: o.t, dinero: o.dinero, niveles: o.niveles ?? {}, sigId: o.sigId });
  s.rutas = o.rutas.map((r) => ({ unidades: 0, esperaMax: ESPERA_MAX, ...r }));
  s.aviones = o.aviones.map((a) => ({ v: 0, ing: 0, cos: 0, desde: o.t, ...a, carga: a.carga ?? [] }));
  const grupos = (c) => { const out = {}; for (const ap in c ?? {}) { out[ap] = {}; for (const g of Object.values(c[ap])) { const x = nuevoGrupo(g.d, g.c, g.n, g.tc, g.p ?? 0, g.km, 0, g.tc); out[ap][llaveGrupo(x.d, x.c)] = x; } } return out; };
  s.colas = grupos(o.colas); s.transbordo = grupos(o.transbordo);
  s.stats = { ...statsVacias(), ...(o.stats ?? {}), perdidasAp: {}, entregasEn: {} };
  if (typeof s.stats.perdidas !== 'number') s.stats.perdidas = 0;
  s.hora24 = o.hora24; s.horaIdx = o.horaIdx; s.netoHora = o.netoHora ?? 0;
  s.misiones = (o.misiones ?? []).filter((id) => MISIONES.some((m) => m.id === id));
  s.clima = { combustible: o.clima?.combustible ?? 1, tormenta: o.clima?.tormenta ?? null, pronostico: null };
  s.dia = diaCalendario(s);
  if (o.guardado) s.guardado = o.guardado;
  return s;
}
function validar(s) {
  if (!Number.isInteger(s.cap) || s.cap < 1 || s.cap > CAPITULOS.length) return 'capitulo';
  for (const k of ['t0', 't', 'dinero', 'sigId', 'horaIdx']) if (!finito(s[k])) return 'numero';
  if (!Array.isArray(s.hora24) || s.hora24.length !== 24 || !s.hora24.every(finito)) return 'numero';
  if (!Array.isArray(s.rutas) || !Array.isArray(s.aviones) || !Array.isArray(s.misiones)) return 'estructura';
  for (const r of s.rutas) if (!AP[r.a] || !AP[r.b] || !finito(r.km) || !finito(r.minCarga) || !finito(r.vuelos)) return 'ruta';
  const ids = new Set(s.rutas.map((r) => r.id));
  for (const a of s.aviones) {
    if (!AV[a.tipo]) return 'avion';
    if (!ids.has(a.ruta) || !AP[a.en] || !AP[a.hacia] || !finito(a.resta) || !Array.isArray(a.carga)) return 'avion';
    for (const x of a.carga) if (!AP[x.d] || !CARGAS[x.c] || !finito(x.n)) return 'avion';
  }
  for (const c of [s.colas, s.transbordo]) for (const ap in c) { if (!AP[ap]) return 'cola'; for (const g of Object.values(c[ap])) if (!AP[g.d] || !CARGAS[g.c] || !finito(g.n) || !finito(g.tc)) return 'cola'; }
  for (const id in s.niveles) if (!AP[id] || !Number.isInteger(s.niveles[id]) || s.niveles[id] < 0 || s.niveles[id] >= TRANSBORDO.length) return 'nivel';
  return null;
}

// Lo que puede usar la interfaz (y, por eso, los jugadores automáticos). Una prueba falla si un perfil usa algo fuera de esta lista.
export const API_INTERFAZ = [
  'MIN_POR_SEG', 'PASO', 'HUB', 'AP', 'AV', 'CARGA_MINIMA', 'paso', 'tomarEventos', 'nuevoEstado', 'avanzarCapitulo', 'capituloTerminado', 'historiaTerminada',
  'abrirRuta', 'puedeAbrirRuta', 'cerrarRuta', 'comprarAvion', 'puedeComprar', 'venderAvion', 'ponerBalizas', 'costoBalizas', 'fijarCargaMinima',
  'mejorarTransbordo', 'capacidadTransbordo', 'costoTransbordo', 'costoRuta', 'gananciaDia', 'esNoche', 'fecha', 'hora', 'misionActual', 'misionesActivas',
  'progreso', 'misionHecha', 'capitulo', 'enEspera', 'enTransbordo', 'enRed', 'servido', 'nodosRed', 'potencial', 'km', 'avionesDisponibles',
  'avionDisponible', 'ciudadDisponible', 'iluminada', 'resumenRuta', 'sugerencia', 'decisiones', 'listoParaCargar', 'flujoTramo', 'indicadoresHub',
  'aceptarContrato', 'premioRondaDelDia', 'escenaRonda', 'rondaEnCurso', 'fijarPrioridad', 'moverSalida', 'planSugerido', 'aplicarPlan', 'simularAusencia', 'guardar', 'restaurar',
  // lecturas que agregó la interfaz v1 (ficha de avión, resumen de capítulo, efecto de comprar en el botón)
  'fichaAvion', 'resumenCapitulo', 'estimarAvion', 'idRuta', 'fijarFechaDispositivo', 'CONFIG', 'RONDA_CADA',
];
