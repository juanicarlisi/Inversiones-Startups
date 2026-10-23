// hub/config.ts · Andén simulador, corte 1 · P4 (el hub).
// Lo que el hub necesita del modelo anden.modelo/1, resuelto UNA vez por noche a números, distribuciones y arreglos con índices.
// No sortea nada ni depende del motor: dos noches del mismo modelo arman la misma configuración.
// Las cuentas de geometría del lazo (largo, bandejas, ranuras, tick) son las de corte-1.md §6.2 y §6.7 regla 8.
import { aMs, horaASeg, type Ms } from '../contratos/tipos-base.ts';
import type { Distribucion } from '../contratos/azar.ts';
import type { Modelo, Num, Pausas, Sorter } from '../contratos/modelo.ts';
import { distribucion, esRef, numero, parametro } from '../contratos/referencias.ts';
import type { Catalogo } from '../contratos/traza.ts';

export type Fidelidad = 'F2' | 'F3';

/** Reglas de la persona de rampa (corte-1.md §6.7 regla 11). */
export const Regla = { LA_MAS_LLENA: 0, LA_QUE_SE_LLENA_ANTES: 1, EN_ORDEN: 2 } as const;
export type Regla = (typeof Regla)[keyof typeof Regla];

/** Horizonte de la noche: fin del turno + 8 h (corte-1.md §6.7 regla 1). */
export const HORIZONTE_EXTRA_S = 8 * 3600;
/** Medición cada cuarto de hora (regla 15). */
export const MEDICION_MS = 15 * 60 * 1000;
/**
 * Velocidad de marcha de una persona de rampa entre dos rampas (m/s), motor 1.1.0. SUPUESTO: 1,2 m/s es la velocidad de marcha
 * habitual de un adulto que camina sin carga (a medir en la planta). El esquema anden.modelo/1 no tiene un campo para esto: queda como
 * regla del motor, igual que el horizonte (integracion/CAMBIOS-CONTRATO.md §2).
 */
export const VELOCIDAD_CAMINAR_MPS = 1.2;

export interface PausasCfg { duracion: number; cada: number; primera: number; escalon: number } // segundos

export interface ConfigHub {
  fidelidad: Fidelidad;
  // calendario (ms del motor, salvo inicioS)
  inicioS: number; inicio: Ms; fin: Ms; corte: Ms; horizonte: Ms;
  // demanda
  nCam: number; camionIds: string[]; turnoS: Float64Array; nominal: Float64Array;
  desvio: Distribucion; cvPronostico: number; probAtraso: number; demoraAtraso: Distribucion; papeleoMs: Ms;
  // andenes y cintas (una cinta por andén)
  nA: number; andenIds: string[]; andenPersonas: Int32Array; desOff: Int32Array;
  cintaDeAnden: Int32Array; cintaIds: string[]; transitoMs: Float64Array; espaciadoMs: Float64Array;
  ritmoDescarga: Distribucion;
  acumCap: number;
  // inducción
  NI: number; puestoIds: string[]; activos: number; temporarios: number; eficienciaTemporario: number; tiempoInduccion: Distribucion;
  pausasInduccion: PausasCfg; ausentismoInduccion: number;
  fatigaActiva: boolean; fatigaMaximo: number; fatigaTauMs: number;
  // sorter
  T: number; tick: Ms; largoLazo: number; slotEstacion: Int32Array; slotRampa: Int32Array; slotExcepcion: number; maxVueltas: number;
  pNoLeido: number; paradasActivas: boolean; paradaEntre: Distribucion; paradaDuracion: Distribucion;
  // rutas, rampas y clases de tamaño
  nRutas: number; rutaIds: string[]; rutaPesos: number[]; rutaOff: Int32Array; rutaRampas: Int32Array; multiMenosLlena: boolean;
  distRuta: Distribucion;
  NR: number; rampaIds: string[]; rampaCap: Int32Array; rampaRuta: Int32Array; rampaPeso: Float64Array;
  nClases: number; claseBandejas: Uint8Array; claseTransportable: Uint8Array; distClase: Distribucion;
  jaulaCap: number; cierreMs: Ms;
  // personas de rampa
  nW: number; asignacion: 'por-volumen' | 'contiguas' | string[][]; regla: Regla; manejo: Distribucion; caminarMs: Ms;
  /** Posición de cada rampa sobre el lazo, en [0, largoLazo) (m): para la distancia de la caminata y el plan por volumen. */
  rampaS: Float64Array;
  pausasRampa: PausasCfg; ausentismoRampa: number;
  // excepción (puesto manual)
  nX: number; tiempoManual: Distribucion; excepcionId: string;
  // retén y numeración global de personas (catálogo): inducción, retén, rampa, descarga, excepción
  nRet: number; offInd: number; offRet: number; offRam: number; offDes: number; offExc: number; nPersonas: number;
  // costos
  horaPersona: number; fijoNoche: number;
  catalogo: Catalogo;
}

// ---- Geometría del lazo (la comparten el motor del hub y geometria.ts) ----

export function largoLazo(s: Sorter): number {
  return 2 * s.recta + 2 * Math.PI * s.radio;
}
export function bandejasLazo(s: Sorter): number {
  return Math.round(largoLazo(s) / s.paso);
}
/** Ranura de un punto a distancia s del origen del lazo: round(s ÷ paso) mod T. */
export function ranuraDe(s: Sorter, T: number, pos: number): number {
  return (((Math.round(pos / s.paso)) % T) + T) % T;
}
/** Paso del lazo en ms: aMs(paso ÷ velocidad). */
export function tickLazo(s: Sorter): Ms {
  return aMs(s.paso / s.velocidad);
}
/** Lugares de la acumulación: floor(largo ÷ paso + 1e-9). */
export function capacidadAcumulacion(a: { largo: number; paso: number }): number {
  return Math.floor(a.largo / a.paso + 1e-9);
}
export function largoPolilinea(puntos: [number, number][]): number {
  let l = 0;
  for (let i = 1; i < puntos.length; i++) {
    const dx = puntos[i][0] - puntos[i - 1][0], dy = puntos[i][1] - puntos[i - 1][1];
    l += Math.sqrt(dx * dx + dy * dy);
  }
  return l;
}

/** Probabilidad de un campo Num: acepta un número, un parámetro numérico o un parámetro con bernoulli(p) o fija (ver NOTAS-CONTRATO §2). */
export function probabilidad(m: Modelo, x: Num, donde: string): number {
  let p: number;
  if (esRef(x)) {
    const v = parametro(m, x).valor;
    if (typeof v === 'number') p = v;
    else if (v.tipo === 'bernoulli') p = v.p;
    else if (v.tipo === 'fija') p = v.valor;
    else throw new Error(`hub: ${donde} tiene que ser una probabilidad (número o bernoulli) y ${x} es una distribución ${v.tipo}.`);
  } else p = x;
  if (!(p >= 0 && p <= 1)) throw new RangeError(`hub: ${donde} tiene que estar entre 0 y 1 y vino ${p}.`);
  return p;
}

function positivo(x: number, donde: string): number {
  if (!(x > 0) || !Number.isFinite(x)) throw new RangeError(`hub: ${donde} tiene que ser un número finito > 0 y vino ${x}.`);
  return x;
}
function noNegativo(x: number, donde: string): number {
  if (!(x >= 0) || !Number.isFinite(x)) throw new RangeError(`hub: ${donde} tiene que ser un número finito ≥ 0 y vino ${x}.`);
  return x;
}
function entero(x: number, donde: string, min = 0): number {
  if (!Number.isInteger(x) || x < min) throw new RangeError(`hub: ${donde} tiene que ser un entero ≥ ${min} y vino ${x}.`);
  return x;
}
function pausas(p: Pausas, donde: string): PausasCfg {
  return {
    duracion: noNegativo(p.duracion, `${donde}.duracion`), cada: noNegativo(p.cada, `${donde}.cada`),
    primera: noNegativo(p.primera, `${donde}.primera`), escalon: noNegativo(p.escalon, `${donde}.escalon`),
  };
}
const dos = (n: number) => String(n).padStart(2, '0');

export function horizonteMs(m: Modelo): Ms {
  return aMs(horaASeg(m.calendario.fin) + HORIZONTE_EXTRA_S);
}

export function compilarConfig(m: Modelo, fidelidad: Fidelidad): ConfigHub {
  const h = m.hub, pe = m.personas, cal = m.calendario, s = h.sorter;
  const inicioS = horaASeg(cal.inicio), finS = horaASeg(cal.fin), corteS = horaASeg(cal.corte);
  if (!(finS > inicioS)) throw new RangeError(`hub: el turno tiene que terminar después de empezar (inicio ${cal.inicio}, fin ${cal.fin}).`);

  // ---- demanda ----
  const cam = m.demanda.camiones;
  let camionIds: string[], turnos: number[], nominales: number[];
  if (Array.isArray(cam)) {
    camionIds = cam.map((c) => c.id);
    turnos = cam.map((c) => horaASeg(c.turno));
    nominales = cam.map((c, i) => noNegativo(c.paquetes, `demanda.camiones[${i}].paquetes`));
  } else {
    const n = entero(cam.cantidad, 'demanda.camiones.cantidad');
    const primero = horaASeg(cam.primero), cada = noNegativo(cam.cada, 'demanda.camiones.cada');
    camionIds = Array.from({ length: n }, (_, i) => `T${dos(i + 1)}`);
    turnos = Array.from({ length: n }, (_, i) => primero + i * cada);
    nominales = Array.from({ length: n }, () => noNegativo(cam.paquetes, 'demanda.camiones.paquetes'));
  }

  // ---- andenes y cintas ----
  const nA = h.andenes.length;
  const andenPersonas = Int32Array.from(h.andenes, (a, i) => entero(a.personas, `hub.andenes[${i}].personas`));
  const desOff = new Int32Array(nA + 1);
  for (let i = 0; i < nA; i++) desOff[i + 1] = desOff[i] + andenPersonas[i];
  const cintaDeAnden = new Int32Array(nA).fill(-1), transitoMs = new Float64Array(nA), espaciadoMs = new Float64Array(nA);
  h.andenes.forEach((a, i) => {
    const c = h.cintas.findIndex((x) => x.desde === a.id);
    if (c < 0) throw new Error(`hub: el andén ${a.id} no tiene cinta (se esperaba una cinta con desde = «${a.id}»).`);
    const ci = h.cintas[c], v = positivo(ci.velocidad, `hub.cintas[${c}].velocidad`);
    cintaDeAnden[i] = c;
    transitoMs[i] = aMs(largoPolilinea(ci.puntos) / v);
    espaciadoMs[i] = aMs(noNegativo(ci.paso, `hub.cintas[${c}].paso`) / v);
  });

  // ---- sorter ----
  positivo(s.paso, 'hub.sorter.paso');
  positivo(s.velocidad, 'hub.sorter.velocidad');
  const T = bandejasLazo(s), tick = tickLazo(s);
  if (T < 2) throw new RangeError(`hub: el lazo tiene que tener al menos 2 bandejas y tiene ${T}.`);
  if (tick < 1) throw new RangeError(`hub: el paso del lazo tiene que durar al menos 1 ms y dura ${s.paso / s.velocidad} s.`);
  const NI = h.induccion.puestos.length;
  const slotEstacion = Int32Array.from(h.induccion.puestos, (p) => ranuraDe(s, T, p.s));
  const NR = h.rampas.length;
  const slotRampa = new Int32Array(NR + 1);
  h.rampas.forEach((r, i) => { slotRampa[i] = ranuraDe(s, T, r.s); });
  slotRampa[NR] = ranuraDe(s, T, h.excepcion.s);

  // ---- rutas y rampas ----
  const idxRampa = new Map<string, number>();
  h.rampas.forEach((r, i) => idxRampa.set(r.id, i));
  const rutas = h.planClasificacion.rutas, nRutas = rutas.length;
  if (nRutas === 0) throw new Error('hub: el plan de clasificación no tiene rutas (se esperaba al menos una).');
  const rutaOff = new Int32Array(nRutas + 1), lista: number[] = [];
  const rampaRuta = new Int32Array(NR).fill(-1), rampaPeso = new Float64Array(NR);
  rutas.forEach((ru, i) => {
    if (ru.rampas.length === 0) throw new Error(`hub: la ruta ${ru.id} no tiene rampas.`);
    for (const id of ru.rampas) {
      const r = idxRampa.get(id);
      if (r === undefined) throw new Error(`hub: la ruta ${ru.id} nombra la rampa ${id}, que no existe.`);
      lista.push(r);
      if (rampaRuta[r] < 0) { rampaRuta[r] = i; rampaPeso[r] = ru.peso / ru.rampas.length; }
    }
    rutaOff[i + 1] = lista.length;
  });
  const rutaPesos = rutas.map((r, i) => noNegativo(r.peso, `hub.planClasificacion.rutas[${i}].peso`));

  // ---- clases de tamaño ----
  const clases = h.perfilPaquete.clases;
  if (clases.length === 0) throw new Error('hub: el perfil de paquetes no tiene clases (se esperaba al menos una).');
  const claseBandejas = Uint8Array.from(clases, (c) => (c.bandejas === 2 ? 2 : 1));
  const claseTransportable = Uint8Array.from(clases, (c) => (c.transportable ? 1 : 0));

  // ---- personas ----
  const pi = pe.induccion;
  const activos = Math.min(entero(pi.puestosActivos, 'personas.induccion.puestosActivos'), NI);
  const temporarios = Math.min(entero(pi.temporarios, 'personas.induccion.temporarios'), activos);
  const nRet = entero(pi.reten, 'personas.induccion.reten');
  const nW = entero(pe.rampa.cantidad, 'personas.rampa.cantidad');
  const nX = entero(pe.excepcion.cantidad, 'personas.excepcion.cantidad');
  const nDes = desOff[nA];
  const offInd = 0, offRet = activos, offRam = offRet + nRet, offDes = offRam + nW, offExc = offDes + nDes, nPersonas = offExc + nX;
  const reglas = { 'la-mas-llena': Regla.LA_MAS_LLENA, 'la-que-se-llena-antes': Regla.LA_QUE_SE_LLENA_ANTES, 'en-orden': Regla.EN_ORDEN } as const;
  const regla = reglas[pe.rampa.regla];
  if (regla === undefined) throw new Error(`hub: regla de rampa desconocida «${String(pe.rampa.regla)}».`);

  const catalogo: Catalogo = {
    personas: [
      ...Array.from({ length: activos }, (_, i) => ({ id: `P-I${i + 1}`, rol: 'induccion' as const })),
      ...Array.from({ length: nRet }, (_, i) => ({ id: `P-T${i + 1}`, rol: 'reten' as const })),
      ...Array.from({ length: nW }, (_, i) => ({ id: `P-R${i + 1}`, rol: 'rampa' as const })),
      ...Array.from({ length: nDes }, (_, i) => ({ id: `P-D${i + 1}`, rol: 'descarga' as const })),
      ...Array.from({ length: nX }, (_, i) => ({ id: `P-X${i + 1}`, rol: 'excepcion' as const })),
    ],
    camiones: camionIds.map((id, i) => ({ id, turno: aMs(turnos[i]) })),
    rutas: rutas.map((r) => r.id),
    rampas: h.rampas.map((r) => r.id),
    puestos: h.induccion.puestos.map((p) => p.id),
    andenes: h.andenes.map((a) => a.id),
  };

  const jaulaCap = entero(h.jaulas.capacidad, 'hub.jaulas.capacidad', 1);
  return {
    fidelidad,
    inicioS, inicio: aMs(inicioS), fin: aMs(finS), corte: aMs(corteS), horizonte: aMs(finS + HORIZONTE_EXTRA_S),
    nCam: camionIds.length, camionIds, turnoS: Float64Array.from(turnos), nominal: Float64Array.from(nominales),
    desvio: distribucion(m, m.demanda.desvio),
    cvPronostico: noNegativo(numero(m, m.demanda.errorPronostico.cv), 'demanda.errorPronostico.cv'),
    probAtraso: probabilidad(m, m.demanda.atrasoComun.probabilidad, 'demanda.atrasoComun.probabilidad'),
    demoraAtraso: distribucion(m, m.demanda.atrasoComun.demora),
    papeleoMs: aMs(noNegativo(numero(m, m.demanda.papeleo), 'demanda.papeleo')),
    nA, andenIds: h.andenes.map((a) => a.id), andenPersonas, desOff, cintaDeAnden, cintaIds: h.cintas.map((c) => c.id),
    transitoMs, espaciadoMs, ritmoDescarga: distribucion(m, pe.descarga.ritmo),
    acumCap: capacidadAcumulacion(h.acumulacion),
    NI, puestoIds: h.induccion.puestos.map((p) => p.id), activos, temporarios,
    eficienciaTemporario: positivo(numero(m, pi.eficienciaTemporario), 'personas.induccion.eficienciaTemporario'),
    tiempoInduccion: distribucion(m, h.induccion.tiempo),
    pausasInduccion: pausas(pi.pausas, 'personas.induccion.pausas'),
    ausentismoInduccion: probabilidad(m, pi.ausentismo, 'personas.induccion.ausentismo'),
    fatigaActiva: pe.fatiga.activa === true,
    fatigaMaximo: pe.fatiga.activa ? noNegativo(numero(m, pe.fatiga.maximo), 'personas.fatiga.maximo') : 0,
    fatigaTauMs: pe.fatiga.activa ? aMs(positivo(numero(m, pe.fatiga.tau), 'personas.fatiga.tau')) : 1,
    T, tick, largoLazo: largoLazo(s), slotEstacion, slotRampa, slotExcepcion: slotRampa[NR],
    maxVueltas: Math.min(entero(s.maxVueltas, 'hub.sorter.maxVueltas'), 254),
    pNoLeido: probabilidad(m, s.lector.noLeido, 'hub.sorter.lector.noLeido'),
    paradasActivas: fidelidad === 'F3' && s.paradas.activas === true,
    paradaEntre: distribucion(m, s.paradas.entre), paradaDuracion: distribucion(m, s.paradas.duracion),
    nRutas, rutaIds: rutas.map((r) => r.id), rutaPesos, rutaOff, rutaRampas: Int32Array.from(lista),
    multiMenosLlena: h.planClasificacion.multiRampa !== 'alternar',
    distRuta: { tipo: 'discreta', valores: rutas.map((_, i) => i), pesos: rutaPesos },
    NR, rampaIds: h.rampas.map((r) => r.id), rampaCap: Int32Array.from(h.rampas, (r, i) => entero(r.capacidad, `hub.rampas[${i}].capacidad`)),
    rampaRuta, rampaPeso,
    nClases: clases.length, claseBandejas, claseTransportable,
    distClase: { tipo: 'discreta', valores: clases.map((_, i) => i), pesos: clases.map((c, i) => noNegativo(c.fraccion, `hub.perfilPaquete.clases[${i}].fraccion`)) },
    jaulaCap, cierreMs: aMs(noNegativo(numero(m, h.jaulas.cierre), 'hub.jaulas.cierre')),
    nW, asignacion: pe.rampa.asignacion, regla, manejo: distribucion(m, pe.rampa.manejo),
    caminarMs: aMs(noNegativo(numero(m, pe.rampa.caminar), 'personas.rampa.caminar')),
    rampaS: Float64Array.from(h.rampas, (r) => { const L = largoLazo(s); return ((r.s % L) + L) % L; }),
    pausasRampa: pausas(pe.rampa.pausas, 'personas.rampa.pausas'),
    ausentismoRampa: probabilidad(m, pe.rampa.ausentismo, 'personas.rampa.ausentismo'),
    nX, tiempoManual: distribucion(m, pe.excepcion.tiempo), excepcionId: h.excepcion.id,
    nRet, offInd, offRet, offRam, offDes, offExc, nPersonas,
    horaPersona: noNegativo(numero(m, m.costos.horaPersona), 'costos.horaPersona'),
    fijoNoche: noNegativo(numero(m, m.costos.fijoNoche), 'costos.fijoNoche'),
    catalogo,
  };
}

/**
 * Distancia (m) que camina una persona de rampa entre las rampas a y b: por el pasillo que rodea el lazo, medida sobre el lazo y por
 * el lado más corto (las rampas salen hacia afuera del lazo, así que para pasar de una recta a la otra se rodea la curva). Motor 1.1.0.
 */
export function distanciaRampas(cfg: Pick<ConfigHub, 'rampaS' | 'largoLazo'>, a: number, b: number): number {
  const d = Math.abs(cfg.rampaS[a] - cfg.rampaS[b]);
  return Math.min(d, cfg.largoLazo - d);
}

/**
 * Lo que tarda en ms una persona de rampa en pasar de la rampa `de` a la rampa `a` (motor 1.1.0, corrige el hallazgo R1 de la
 * revisión): la distancia ÷ la velocidad de marcha, con `caminar` (el parámetro del modelo) como mínimo por cambio de rampa
 * (arrancar, girar, frenar). 0 si no cambia de rampa o si todavía no estaba en ninguna.
 */
export function caminataMs(cfg: Pick<ConfigHub, 'rampaS' | 'largoLazo' | 'caminarMs'>, de: number, a: number): Ms {
  if (de < 0 || de === a) return 0;
  return Math.max(cfg.caminarMs, aMs(distanciaRampas(cfg, de, a) / VELOCIDAD_CAMINAR_MPS));
}

/**
 * Pausas después del fin del turno (motor 1.1.0, hallazgo R4): si la noche se alarga, la persona sigue con su ritmo de pausas
 * (inicio + primera + i·escalón + m·cada) mientras quede trabajo y antes del horizonte. Devuelve el primer instante del ritmo que es
 * ≥ max(fin, después de t) y < horizonte, o −1 si no hay. Quien la recibe la descarta si ya no queda trabajo.
 */
export function pausaTrasFin(cfg: ConfigHub, p: PausasCfg, i: number, t: number): number {
  if (!(p.cada > 0)) return -1;
  for (let k = 0; ; k++) {
    const ms = aMs(cfg.inicioS + p.primera + i * p.escalon + k * p.cada);
    if (ms >= cfg.horizonte) return -1;
    if (ms >= cfg.fin && ms > t) return ms;
  }
}

/** Instantes de pausa de la persona i de un rol: inicio + primera + i·escalón + m·cada, mientras sean < fin (regla 6). En ms. */
export function instantesDePausa(cfg: ConfigHub, p: PausasCfg, i: number): number[] {
  const t: number[] = [];
  for (let k = 0; ; k++) {
    const ms = aMs(cfg.inicioS + p.primera + i * p.escalon + k * p.cada);
    if (ms >= cfg.fin) break;
    t.push(ms);
    if (!(p.cada > 0)) break;
  }
  return t;
}
