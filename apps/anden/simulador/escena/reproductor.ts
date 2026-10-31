// escena/reproductor.ts · Andén simulador, corte 1 · P6 (escena).
// Reproductor de tramos (contratos/vistas.ts): dado un instante t, dónde está cada cosa SIN volver a simular y sin motor de física.
// Todo sale de fórmulas cerradas sobre la traza (corte-1.md §9 P6):
// - cinta: interpolación lineal sobre la polilínea entre t0 y t1;
// - fila de la acumulación, de cada rampa y de la excepción: lugar = secuencia (a) − salidas hasta t (búsqueda binaria en los t1
//   ordenados);
// - bandeja: ranura (j + k(t)) con k(t) con fracción desde los tramos LAZO_MARCHA y LAZO_DETENIDO (escena/lazo.ts);
// - personas: en su puesto, en su rampa, en su andén o en su mesa; caminando de una rampa a otra, por el pasillo que rodea el lazo y
//   por el lado más corto, parejo en s (el mismo camino con el que el hub calcula cuánto tarda: disposicion.ts › enPasillo).
// Lo que se ve es lo que se calculó: ninguna entidad se mueve si no hay un tramo que lo diga.
//
// Estados visuales (EstadoVisual): DANDO_VUELTA (BANDEJA con a > 0), EXCEPCION (rumbo a, en o saliendo del puesto manual),
// ATRASADO (paquete con listo > corte o −1), ESPERANDO (en una fila hace ≥ 5 min, o persona en pausa, o camión en la playa),
// EN_CAMION (en descarga). Precedencia: EXCEPCION > DANDO_VUELTA > ATRASADO > ESPERANDO > EN_CAMION > NORMAL.
// SELECCIONADO no lo pone el reproductor: lo agrega la vista con OpcionesDibujo.seleccion.
//
// El instante que se dibuja se acota a [inicio, fin − 1 ms]: en `fin` el escritor cerró todos los tramos abiertos (contratos/traza.ts),
// así que el último cuadro muestra el último milisegundo con algo adentro.
// Supuesto (NOTAS-CONTRATO.md §4): los tramos de una misma entidad están escritos en orden cronológico (así los escribe el hub:
// cada tramo nuevo empieza donde termina el anterior).
import type { Ms } from '../contratos/tipos-base.ts';
import { ClaseEntidad, TipoMomento, TipoTramo, type Traza } from '../contratos/traza.ts';
import { EstadoVisual, type EstadoRecursos, type Posiciones, type Reproductor } from '../contratos/vistas.ts';
import { posEnLazo } from '../contratos/geometria.ts';
import {
  acotar, ALTURA_CAPA_PILA, ALTURA_CAPA_RAMPA, CAPACIDAD_PILA, crearDisposicion, grillaRampa, enCinta, enPasillo, lugarEnFila, lugarEnPlaya, lugarEnRampa, type Disposicion, type V2,
} from './disposicion.ts';
import {
  crearIndiceTiempo, cuantosHasta, entradasHasta, ordenarFilas, salidasHasta, type IndiceTiempo,
} from './indice-tiempo.ts';
import { crearRelojLazo, modulo, posBandeja, type RelojLazo } from './lazo.ts';
import { CLAVE_ESTADO } from './estilo.ts';

/** Un paquete que espera en una fila desde hace al menos esto se ve «esperando» (el mismo umbral que usa el explicador). */
export const UMBRAL_ESPERA_MS = 5 * 60_000;

/** Estado de un puesto de inducción en EstadoRecursos.puestoEstado. */
export const EstadoPuesto = { LIBRE: 0, INDUCE: 1, ESPERA_BANDEJA: 2, PAUSA: 3, SIN_PERSONA: 4 } as const;
/** Estado de una persona en EstadoRecursos.personaEstado. */
export const EstadoPersona = { LIBRE: 0, TRABAJA: 1, PAUSA: 2, CAMINA: 3, AUSENTE: 4, CIERRA_JAULA: 5 } as const;

/** Texto (clave i18n y variables) del estado visual de una entidad, para la leyenda y los lectores de pantalla. */
export function textoEstado(estado: number): { clave: string; vars: Record<string, string | number> } {
  const e = (estado in CLAVE_ESTADO ? estado : EstadoVisual.NORMAL) as EstadoVisual;
  return { clave: CLAVE_ESTADO[e], vars: e === EstadoVisual.ESPERANDO ? { minutos: UMBRAL_ESPERA_MS / 60_000 } : {} };
}

/** Clave i18n de cada estado de puesto (índice = código de EstadoPuesto). El texto lleva la variable {puesto}. */
export const CLAVE_PUESTO: readonly string[] = [
  'escena.puesto.libre', 'escena.puesto.induce', 'escena.puesto.esperaBandeja', 'escena.puesto.pausa', 'escena.puesto.sinPersona',
];
/** Clave i18n de cada estado de persona (índice = código de EstadoPersona). */
export const CLAVE_PERSONA: readonly string[] = [
  'escena.persona.libre', 'escena.persona.trabaja', 'escena.persona.pausa', 'escena.persona.camina', 'escena.persona.ausente',
  'escena.persona.cierraJaula',
];
/** Clave i18n del nombre de cada clase de entidad (índice = ClaseEntidad). */
export const CLAVE_CLASE: readonly string[] = [
  'escena.clase.paquete', 'escena.clase.persona', 'escena.clase.camion', 'escena.clase.equipo', 'escena.clase.rampa', 'escena.clase.puesto',
];

/**
 * Posiciones con la altura (m) de cada entidad sobre el piso, para la vista 2,5D, y `tapado`: 1 si la entidad queda exactamente debajo de
 * otra (los paquetes de la pila del puesto manual más allá de su última capa). Las vistas no dibujan las tapadas, salvo la seleccionada:
 * con 2.455 paquetes en la cola manual, dibujarlos todos llevaba el cuadro 2,5D a 21,6 ms y el piso caía a 2D (revisión de I-3).
 * `celda`: el lado (m) del lugar de la grilla en que está la entidad (los paquetes en el tobogán de una rampa) o 0 si no tiene lugar fijo;
 * la planta 2D achica el glifo para que entre en su lugar y los paquetes de una rampa llena no se enciman (revisión de I-3, 30-10-2026).
 */
export interface PosicionesEscena extends Posiciones { z: Float32Array; tapado: Uint8Array; celda: Float32Array }

/** Altura (m) a la que se dibuja un paquete según su tramo (0 si no es un paquete). */
export function alturaDeTramo(k: number): number {
  switch (k) {
    case TipoTramo.BANDEJA: return 1.15;
    case TipoTramo.CINTA: case TipoTramo.ACUMULACION: return 0.8;
    case TipoTramo.DESCARGA: case TipoTramo.INDUCCION: case TipoTramo.ESPERA_BANDEJA: case TipoTramo.MANO: return 1.0;
    case TipoTramo.RAMPA: case TipoTramo.COLA_MANUAL: return 0.6;
    case TipoTramo.MANUAL: return 0.9;
    default: return 0;
  }
}

/** Lo que agrega el reproductor de la escena al del contrato (lo usan las vistas de este paquete; nadie más lo necesita). */
export interface ReproductorEscena extends Reproductor {
  crearPosiciones(): PosicionesEscena;
  readonly disposicion: Disposicion;
  readonly reloj: RelojLazo;
  /** Capacidad de jaula deducida de la traza (null si ninguna jaula llegó a completarse). */
  readonly capacidadJaula: number | null;
  /** Instante que se dibuja para t: acotado a [inicio, fin − 1 ms]. Lanza si t no es un número finito. */
  instante(t: Ms): number;
  /** Bandejas que ocupa el paquete: 2 si esperó dos bandejas (paquete grande), si no 1. */
  bandejasDe(paquete: number): number;
  /** Nivel de la jaula en curso de cada rampa (0–1) y su número, en t. */
  jaulas(t: Ms, nivel: Float32Array, numero: Int32Array): void;
  /** Paquetes esperando el puesto manual en t. */
  colaExcepcion(t: Ms): number;
  /**
   * Cuántas posiciones calculadas cayeron fuera de `limites` y se recortaron al borde desde que se creó el reproductor (red de seguridad
   * del dibujo). Con una disposición bien hecha es 0: las pruebas lo exigen para que el recorte no tape un error de las fórmulas.
   */
  readonly recortes: number;
}

export function esReproductorEscena(r: Reproductor): r is ReproductorEscena {
  return typeof (r as ReproductorEscena).bandejasDe === 'function' && (r as ReproductorEscena).disposicion !== undefined;
}

/** Clase de entidad de un tipo de tramo (−1 si no se dibuja como entidad: lazo, colas genéricas de la batería). */
export function claseDeTramo(k: number): number {
  if (k === TipoTramo.CAMION_PLAYA || k === TipoTramo.CAMION_ANDEN) return ClaseEntidad.CAMION;
  if (k >= TipoTramo.DESCARGA && k <= TipoTramo.MANUAL) return ClaseEntidad.PAQUETE;
  if (k >= TipoTramo.PERSONA_TRABAJA && k <= TipoTramo.PERSONA_CIERRA_JAULA) return ClaseEntidad.PERSONA;
  return -1;
}

/** Tramos en los que se espera (para el estado «esperando» a partir de UMBRAL_ESPERA_MS). */
function esFila(k: number): boolean {
  return k === TipoTramo.ACUMULACION || k === TipoTramo.ESPERA_BANDEJA || k === TipoTramo.RAMPA;
}

type Rol = 'induccion' | 'reten' | 'descarga' | 'rampa' | 'excepcion';

function validar(tr: Traza): void {
  if (!tr || tr.version !== 1) throw new Error(`escena: se esperaba una traza versión 1 y vino ${tr ? tr.version : tr}.`);
  const T = tr.tramos;
  for (const c of ['e', 'k', 'r', 'a', 't0', 't1', 'c', 'q'] as const) {
    if (!T[c] || T[c].length !== T.n) {
      throw new Error(`escena: la columna de tramos «${c}» tiene ${T[c] ? T[c].length : 'ningún'} elemento(s) y la traza dice n = ${T.n}.`);
    }
  }
  if (!Number.isFinite(tr.inicio) || !Number.isFinite(tr.fin)) {
    throw new Error(`escena: inicio y fin de la traza tienen que ser finitos (vinieron ${tr.inicio} y ${tr.fin}).`);
  }
  if (!tr.geometria || !tr.geometria.lazo) throw new Error('escena: la traza no trae la geometría del hub.');
  if (tr.geometria.estaciones.length === 0) throw new Error('escena: la geometría no tiene estaciones de inducción (se esperaba al menos una).');
}

export function crearReproductor(tr: Traza): ReproductorEscena {
  validar(tr);
  const T = tr.tramos, n = T.n, G = tr.geometria, P = tr.paquetes, cat = tr.catalogo;
  const K = T.k, E = T.e, R = T.r, A = T.a, T0 = T.t0, T1 = T.t1;
  const NR = G.rampas.length, NI = G.estaciones.length, NA = G.andenes.length, NC = G.cintas.length;
  const personas = cat.personas, NP = personas.length;
  const rolCat: Rol[] = personas.map((p) => p.rol);
  const ordinal = new Int32Array(NP); // ordinal de la persona dentro de su rol
  {
    const c: Record<string, number> = {};
    for (let g = 0; g < NP; g++) { ordinal[g] = c[rolCat[g]] ?? 0; c[rolCat[g]] = ordinal[g] + 1; }
  }
  const cuantasDe = (rol: Rol) => rolCat.reduce((s, r) => s + (r === rol ? 1 : 0), 0);
  const nExc = cuantasDe('excepcion'), nRam = cuantasDe('rampa'), nDes = cuantasDe('descarga');
  const D = crearDisposicion(G, nExc);
  const reloj = crearRelojLazo(tr);
  const L = G.lazo;
  const inicio = tr.inicio, fin = Math.max(tr.inicio, tr.fin);
  const ultimoInstante = Math.max(inicio, fin - 1);

  // Grupos de las filas FIFO: 0 acumulación · 1…NR rampas · NR+1 COLA_MANUAL · NR+2 rampa de excepción de la maqueta (r ≥ NR).
  const G_ACUM = 0, G_EXC = NR + 1, G_EXC_RAMPA = NR + 2, GRUPOS = NR + 3;
  const grupo = new Int32Array(n).fill(-1);
  const indexar = new Uint8Array(n);
  const ant = new Int32Array(n).fill(-1), sig = new Int32Array(n).fill(-1);
  const dosBandejas = new Uint8Array(Math.max(P.n, 1));
  const puestoConPersona = new Uint8Array(NI);
  const ausente = new Uint8Array(NP);
  const cuentaPer = new Int32Array(NP + 1);
  const jaulaCuenta = new Int32Array(NR + 1);
  let maxPos = 0, jaulaCompleta = false, base = inicio;
  const rolEf: Rol[] = rolCat.slice();
  for (let q = 0; q < tr.momentos.n; q++) {
    // El retén hace el rol de quien cubre (REEMPLAZO: r = retén, v = persona cubierta).
    if (tr.momentos.tipo[q] !== TipoMomento.REEMPLAZO) continue;
    const ret = tr.momentos.r[q], cubierta = tr.momentos.v[q];
    if (ret >= 0 && ret < NP && cubierta >= 0 && cubierta < NP) rolEf[ret] = rolCat[cubierta];
  }

  // ---- Una pasada: clase, índice, filas, encadenado por entidad, jaulas, personas ----
  {
    let maxP = P.n, maxCam = cat.camiones.length;
    for (let i = 0; i < n; i++) {
      const c = claseDeTramo(K[i]);
      if (c === ClaseEntidad.PAQUETE) { if (E[i] >= maxP) maxP = E[i] + 1; }
      else if (c === ClaseEntidad.CAMION) { if (E[i] >= maxCam) maxCam = E[i] + 1; }
    }
    const ultP = new Int32Array(maxP).fill(-1), ultPer = new Int32Array(NP).fill(-1), ultCam = new Int32Array(maxCam).fill(-1);
    for (let i = 0; i < n; i++) {
      const k = K[i], e = E[i], r = R[i], c = claseDeTramo(k);
      if (c < 0) continue;
      if (T0[i] < base) base = T0[i];
      indexar[i] = k === TipoTramo.JAULA ? 0 : 1;
      // filas
      if (k === TipoTramo.ACUMULACION) grupo[i] = G_ACUM;
      else if (k === TipoTramo.RAMPA) grupo[i] = r >= 0 && r < NR ? 1 + r : G_EXC_RAMPA;
      else if (k === TipoTramo.COLA_MANUAL) grupo[i] = G_EXC;
      else if (k === TipoTramo.JAULA && r >= 0 && r < NR) {
        jaulaCuenta[r + 1]++;
        const pos = A[i] % 1000;
        if (pos > maxPos) maxPos = pos;
        if (A[i] >= 1000) jaulaCompleta = true;
      } else if (k === TipoTramo.ESPERA_BANDEJA && A[i] === 2 && e >= 0 && e < P.n) dosBandejas[e] = 1;
      if ((k === TipoTramo.INDUCCION || k === TipoTramo.ESPERA_BANDEJA) && r >= 0 && r < NI) puestoConPersona[r] = 1;
      if (k === TipoTramo.MANO && r >= 0 && r < NP && rolEf[r] === 'reten') rolEf[r] = 'rampa';
      if (k === TipoTramo.INDUCCION && A[i] >= 0 && A[i] < NP && rolEf[A[i]] === 'reten') rolEf[A[i]] = 'induccion';
      // encadenado
      if (e < 0) continue;
      let u: Int32Array;
      if (c === ClaseEntidad.PAQUETE) u = ultP;
      else if (c === ClaseEntidad.CAMION) u = ultCam;
      else {
        if (e >= NP) continue;
        u = ultPer;
        if (k === TipoTramo.PERSONA_AUSENTE) ausente[e] = 1;
        else cuentaPer[e + 1]++;
      }
      const j = u[e];
      if (j >= 0) { ant[i] = j; sig[j] = i; }
      u[e] = i;
    }
  }
  const filas = ordenarFilas(T0, T1, grupo, GRUPOS);

  // Jaulas por rampa: (t0, a) en orden de t0, para el nivel de la jaula en curso.
  for (let r = 0; r < NR; r++) jaulaCuenta[r + 1] += jaulaCuenta[r];
  const jaulaOff = jaulaCuenta;
  const jaulaIdx = new Int32Array(jaulaOff[NR]);
  {
    const p = jaulaOff.slice(0, NR);
    for (let i = 0; i < n; i++) if (K[i] === TipoTramo.JAULA && R[i] >= 0 && R[i] < NR) jaulaIdx[p[R[i]]++] = i;
    for (let r = 0; r < NR; r++) {
      const sub = jaulaIdx.subarray(jaulaOff[r], jaulaOff[r + 1]);
      if (!estaOrdenado(sub, T0)) sub.set(Array.from(sub).sort((x, y) => T0[x] - T0[y] || A[x] - A[y] || x - y));
    }
  }
  const jaulaT0 = new Float64Array(jaulaIdx.length), jaulaA = new Int32Array(jaulaIdx.length);
  for (let q = 0; q < jaulaIdx.length; q++) { jaulaT0[q] = T0[jaulaIdx[q]]; jaulaA[q] = A[jaulaIdx[q]]; }
  const capacidadJaula = jaulaCompleta ? maxPos + 1 : null;
  const capJ = Math.max(1, maxPos + 1);

  // Personas: sus tramos (sin la ausencia) en orden de t0.
  for (let g = 0; g < NP; g++) cuentaPer[g + 1] += cuentaPer[g];
  const perOff = cuentaPer;
  const perIdx = new Int32Array(perOff[NP]);
  {
    const p = perOff.slice(0, NP);
    for (let i = 0; i < n; i++) {
      const k = K[i], g = E[i];
      if (claseDeTramo(k) === ClaseEntidad.PERSONA && g >= 0 && g < NP && k !== TipoTramo.PERSONA_AUSENTE) perIdx[p[g]++] = i;
    }
    for (let g = 0; g < NP; g++) {
      const sub = perIdx.subarray(perOff[g], perOff[g + 1]);
      if (!estaOrdenado(sub, T0)) sub.set(Array.from(sub).sort((x, y) => T0[x] - T0[y] || x - y));
      if (rolEf[g] === 'induccion') for (let q = perOff[g]; q < perOff[g + 1]; q++) {
        const r = R[perIdx[q]];
        if (r >= 0 && r < NI) puestoConPersona[r] = 1;
      }
    }
  }
  // Personas de descarga: andén de base (el primero en el que trabajan) y su lugar al costado del andén.
  const andenBase = new Int32Array(NP).fill(-1), lateral = new Float32Array(NP);
  {
    const porAnden: number[][] = Array.from({ length: Math.max(1, NA) }, () => []);
    for (let g = 0; g < NP; g++) {
      if (rolEf[g] !== 'descarga') continue;
      let a = -1;
      for (let q = perOff[g]; q < perOff[g + 1] && a < 0; q++) if (R[perIdx[q]] >= 0 && R[perIdx[q]] < NA) a = R[perIdx[q]];
      if (a < 0) a = NA > 0 ? Math.min(NA - 1, Math.floor((ordinal[g] * NA) / Math.max(1, nDes))) : 0;
      andenBase[g] = a;
      porAnden[a].push(g);
    }
    for (const lista of porAnden) lista.forEach((g, k) => { lateral[g] = (k - (lista.length - 1) / 2) * 0.9; });
  }

  // ---- Índice de tramos dibujables (paquetes salvo la jaula, personas y camiones) ----
  const indice: IndiceTiempo = crearIndiceTiempo(T0, T1, indexar, base, fin);
  const maxVisibles = indice.maxCandidatos + NP;

  // ---- Memoria de trabajo (sin asignar por cuadro) ----
  const act = new Int32Array(Math.max(1, indice.maxCandidatos));
  let nAct = 0, tAct = NaN, cuadro = 0, salAcum = 0, salExc = 0, salExcRampa = 0, recortes = 0;
  /** Altura extra (m) del último paquete ubicado por `paquete`: la capa de la pila del puesto manual (0 en cualquier otro lugar). */
  let alturaPila = 0;
  /** 1 si el último paquete ubicado por `paquete` cayó en un lugar repetido de la pila (queda tapado por otro idéntico). */
  let tapadoPila = 0;
  /** Lado (m) del lugar de la grilla del último paquete ubicado por `paquete` (en el tobogán de una rampa; 0 en cualquier otro lugar). */
  let celdaPila = 0;
  /** Lado del lugar de cada rampa: el menor entre el paso a lo largo y el paso a lo ancho de su grilla (disposicion.ts, grillaRampa). */
  const celdaRampa = Float64Array.from(D.rampas, (Rr) => {
    const [f, c] = grillaRampa(Rr);
    return Math.min(Math.hypot(Rr.fin[0] - Rr.ini[0], Rr.fin[1] - Rr.ini[1]) / f, Rr.ancho / c);
  });
  const tramoPersona = new Int32Array(NP);
  const playa: number[] = [];
  const marcaRampa = new Int32Array(NR).fill(-1), tomadasRampa = new Int32Array(NR);
  const o3 = new Float64Array(3);
  const tmp: V2 = [0, 0];

  const instante = (t: Ms): number => {
    if (typeof t !== 'number' || !Number.isFinite(t)) throw new RangeError(`escena: el instante tiene que ser un número finito de ms (vino ${t}).`);
    return t < inicio ? inicio : t > ultimoInstante ? ultimoInstante : t;
  };
  const preparar = (tq: number) => {
    if (tq === tAct) return;
    tAct = tq;
    cuadro++;
    nAct = indice.activos(tq, act);
    salAcum = salidasHasta(filas, G_ACUM, tq);
    salExc = salidasHasta(filas, G_EXC, tq);
    salExcRampa = salidasHasta(filas, G_EXC_RAMPA, tq);
  };
  const tomadas = (r: number, tq: number): number => {
    if (marcaRampa[r] !== cuadro) {
      marcaRampa[r] = cuadro;
      tomadasRampa[r] = salidasHasta(filas, 1 + r, tq);
    }
    return tomadasRampa[r];
  };
  const fraccion = (i: number, tq: number) => {
    const d = T1[i] - T0[i];
    return d > 0 ? Math.min(1, Math.max(0, (tq - T0[i]) / d)) : 1;
  };
  const atrasado = (e: number) => e >= 0 && e < P.n && (P.listo[e] < 0 || P.listo[e] > tr.corte);
  const estacion = (r: number) => D.estaciones[r < 0 ? 0 : r >= NI ? NI - 1 : r];
  const rampaDe = (r: number) => (NR ? D.rampas[r < 0 ? 0 : r >= NR ? NR - 1 : r] : D.excepcion);
  const mesaDe = (r: number) => {
    const k = r >= 0 && r < NP && rolCat[r] === 'excepcion' ? ordinal[r] : Math.max(0, r);
    return D.mesas[k % D.mesas.length];
  };
  const esExcRampa = (j: number) => K[j] === TipoTramo.RAMPA && (R[j] >= NR || R[j] < 0);
  /** ¿El siguiente tramo del paquete va a la excepción? */
  const vaAExcepcion = (i: number) => {
    const j = sig[i];
    return j >= 0 && (K[j] === TipoTramo.COLA_MANUAL || esExcRampa(j));
  };
  /** s sobre el lazo del recurso de un tramo vecino (para una BANDEJA sin bandeja, en F2). */
  const sDeVecino = (j: number, desde: boolean): number => {
    if (j >= 0) {
      const k = K[j], r = R[j];
      if ((k === TipoTramo.INDUCCION || k === TipoTramo.ESPERA_BANDEJA) && r >= 0 && r < NI) return G.estaciones[r].s;
      if (k === TipoTramo.RAMPA && r >= 0 && r < NR) return G.rampas[r].s;
      if (k === TipoTramo.COLA_MANUAL || esExcRampa(j)) return G.excepcion.s;
    }
    return desde ? G.estaciones[0].s : G.excepcion.s;
  };

  /** Posición [x, y, ángulo] de un paquete en el tramo i; devuelve su estado visual. */
  const paquete = (i: number, tq: number, out: Float64Array): number => {
    const k = K[i], r = R[i], e = E[i];
    let est: number = EstadoVisual.NORMAL;
    out[2] = 0;
    alturaPila = 0; tapadoPila = 0; celdaPila = 0;
    switch (k) {
      case TipoTramo.DESCARGA: {
        const a = NA ? D.andenes[r < 0 ? 0 : r >= NA ? NA - 1 : r] : null;
        const f = fraccion(i, tq);
        if (a) { out[0] = a.camion[0] + (a.salida[0] - a.camion[0]) * f; out[1] = a.camion[1] + (a.salida[1] - a.camion[1]) * f; }
        else { out[0] = D.fila.cabeza[0]; out[1] = D.fila.cabeza[1]; }
        est = EstadoVisual.EN_CAMION;
        break;
      }
      case TipoTramo.CINTA:
        if (r >= 0 && r < NC) enCinta(D.cintas[r], fraccion(i, tq), out);
        else { out[0] = D.fila.cabeza[0]; out[1] = D.fila.cabeza[1]; }
        break;
      case TipoTramo.ACUMULACION:
        lugarEnFila(D.fila, Math.max(0, A[i] - salAcum), out);
        break;
      case TipoTramo.INDUCCION: {
        const s = estacion(r);
        out[0] = s.mano[0]; out[1] = s.mano[1];
        break;
      }
      case TipoTramo.ESPERA_BANDEJA: {
        const s = estacion(r);
        out[0] = s.borde[0]; out[1] = s.borde[1];
        break;
      }
      case TipoTramo.BANDEJA: {
        if (r >= 0) {
          // un paquete de dos bandejas va entre la suya (j) y la que viene detrás (j − 1)
          posBandeja(L, r, reloj.pasoEn(tq) - (dosBandejas[e] ? 0.5 : 0), out);
        } else {
          // F2: sin bandejas, demora fija de la estación a la rampa: se recorre el lazo en forma pareja.
          const s0 = sDeVecino(ant[i], true), s1 = sDeVecino(sig[i], false);
          const d = modulo(s1 - s0, L.largo) || L.largo;
          posEnLazo(L, s0 + d * fraccion(i, tq), out);
        }
        if (vaAExcepcion(i)) est = EstadoVisual.EXCEPCION;
        else if (A[i] > 0) est = EstadoVisual.DANDO_VUELTA;
        break;
      }
      case TipoTramo.RAMPA:
        // el tobogán se llena como una pila: cada capa, una caja más arriba (disposicion.ts, grillaRampa)
        if (r >= 0 && r < NR) {
          alturaPila = lugarEnRampa(D.rampas[r], Math.max(0, A[i] - tomadas(r, tq)), false, out) * ALTURA_CAPA_RAMPA;
          celdaPila = celdaRampa[r];
        }
        else {
          const l = Math.max(0, A[i] - salExcRampa);
          alturaPila = lugarEnRampa(D.excepcion, l, true, out) * ALTURA_CAPA_PILA; tapadoPila = l >= CAPACIDAD_PILA ? 1 : 0;
          est = EstadoVisual.EXCEPCION;
        }
        break;
      case TipoTramo.MANO: {
        const Rr = rampaDe(A[i]), f = fraccion(i, tq);
        out[0] = Rr.fin[0] + (Rr.jaula[0] - Rr.fin[0]) * f; out[1] = Rr.fin[1] + (Rr.jaula[1] - Rr.fin[1]) * f;
        break;
      }
      case TipoTramo.COLA_MANUAL:
        { const l = Math.max(0, A[i] - salExc); alturaPila = lugarEnRampa(D.excepcion, l, true, out) * ALTURA_CAPA_PILA; tapadoPila = l >= CAPACIDAD_PILA ? 1 : 0; }
        est = EstadoVisual.EXCEPCION;
        break;
      case TipoTramo.MANUAL: {
        const m = mesaDe(r), d = D.excepcion.dir;
        out[0] = m[0] - d[0] * 0.35; out[1] = m[1] - d[1] * 0.35;
        est = EstadoVisual.EXCEPCION;
        break;
      }
      default:
        out[0] = D.fila.cabeza[0]; out[1] = D.fila.cabeza[1];
    }
    if (est === EstadoVisual.NORMAL || est === EstadoVisual.EN_CAMION) {
      if (atrasado(e)) est = EstadoVisual.ATRASADO;
      else if (esFila(k) && tq - T0[i] >= UMBRAL_ESPERA_MS) est = EstadoVisual.ESPERANDO;
    }
    return est;
  };

  /** Lugar de una persona según un tramo suyo (false si el tramo no dice dónde: r = −1 o fuera de rango). */
  const lugarPersona = (g: number, i: number, out: V2): boolean => {
    const r = R[i];
    if (r < 0) return false;
    switch (rolEf[g]) {
      case 'induccion': if (r >= NI) return false; out[0] = D.estaciones[r].operador[0]; out[1] = D.estaciones[r].operador[1]; return true;
      case 'rampa': if (r >= NR) return false; out[0] = D.rampas[r].persona[0]; out[1] = D.rampas[r].persona[1]; return true;
      case 'descarga': {
        if (r >= NA) return false;
        const a = D.andenes[r];
        out[0] = a.base[0] + a.lat[0] * lateral[g]; out[1] = a.base[1] + a.lat[1] * lateral[g];
        return true;
      }
      case 'excepcion': {
        const m = D.mesas[r % D.mesas.length], d = D.excepcion.dir;
        out[0] = m[0] + d[0] * 0.35; out[1] = m[1] + d[1] * 0.35;
        return true;
      }
      default: return false;
    }
  };
  /** Lugar de la persona cuando ningún tramo dice dónde está. */
  const casa = (g: number, out: V2): void => {
    const o = ordinal[g];
    switch (rolEf[g]) {
      case 'induccion': { const s = estacion(o); out[0] = s.operador[0]; out[1] = s.operador[1]; return; }
      case 'rampa': {
        const Rr = rampaDe(Math.floor((o * NR) / Math.max(1, nRam)));
        out[0] = Rr.persona[0]; out[1] = Rr.persona[1]; return;
      }
      case 'descarga': {
        const a = D.andenes[Math.max(0, andenBase[g])];
        if (a) { out[0] = a.base[0] + a.lat[0] * lateral[g]; out[1] = a.base[1] + a.lat[1] * lateral[g]; return; }
        break;
      }
      case 'excepcion': {
        const m = D.mesas[o % D.mesas.length], d = D.excepcion.dir;
        out[0] = m[0] + d[0] * 0.35; out[1] = m[1] + d[1] * 0.35; return;
      }
      default: break;
    }
    // retén que no cubre a nadie: al costado de la última estación
    const s = D.estaciones[NI - 1];
    out[0] = s.operador[0] + s.dir[0] * 0.9; out[1] = s.operador[1] + s.dir[1] * 0.9;
  };
  /** Posición en la lista de tramos de la persona del último con t0 ≤ t (−1 si ninguno). */
  const ultimoTramo = (g: number, tq: number): number => {
    let lo = perOff[g], hi = perOff[g + 1];
    while (lo < hi) {
      const m = (lo + hi) >>> 1;
      if (T0[perIdx[m]] <= tq) lo = m + 1;
      else hi = m;
    }
    return lo - 1 >= perOff[g] ? lo - 1 : -1;
  };
  /** Lugar de la persona g según el tramo q de su lista: hacia atrás hasta uno con lugar; si no, el primero que venga; si no, su casa. */
  const lugarHasta = (g: number, q: number, out: V2): void => {
    for (let p = q; p >= perOff[g]; p--) if (lugarPersona(g, perIdx[p], out)) return;
    for (let p = Math.max(q + 1, perOff[g]); p < perOff[g + 1]; p++) if (lugarPersona(g, perIdx[p], out)) return;
    casa(g, out);
  };
  /** Rampa de la que salió la persona g en la caminata i: la del último tramo suyo anterior que dice una rampa (−1 si ninguno). */
  const rampaDeSalida = (g: number, i: number): number => {
    for (let p = ultimoTramo(g, T0[i] - 1e-6); p >= perOff[g]; p--) {
      const r = R[perIdx[p]];
      if (perIdx[p] !== i && r >= 0 && r < NR) return r;
    }
    return -1;
  };
  const persona = (g: number, tq: number, out: Float64Array): number => {
    const i = tramoPersona[g];
    out[2] = 0;
    if (i >= 0 && K[i] === TipoTramo.PERSONA_CAMINA) {
      // Persona de rampa entre dos rampas: por el pasillo que rodea el lazo, por el lado más corto (como lo mide el hub).
      const rb = R[i], ra = rolEf[g] === 'rampa' && rb >= 0 && rb < NR ? rampaDeSalida(g, i) : -1;
      if (ra >= 0 && ra !== rb) {
        enPasillo(L, D.limites, D.rampas[ra], D.rampas[rb], fraccion(i, tq), out);
        out[2] = 0;
        return EstadoVisual.NORMAL;
      }
      // Cualquier otra caminata: en línea recta desde donde estaba.
      lugarHasta(g, ultimoTramo(g, T0[i] - 1e-6), tmp); // de dónde salió
      const x0 = tmp[0], y0 = tmp[1];
      if (!lugarPersona(g, i, tmp)) { tmp[0] = x0; tmp[1] = y0; }
      const f = fraccion(i, tq);
      out[0] = x0 + (tmp[0] - x0) * f; out[1] = y0 + (tmp[1] - y0) * f;
      return EstadoVisual.NORMAL;
    }
    if (i < 0 || !lugarPersona(g, i, tmp)) lugarHasta(g, ultimoTramo(g, tq), tmp);
    out[0] = tmp[0]; out[1] = tmp[1];
    return i >= 0 && K[i] === TipoTramo.PERSONA_PAUSA ? EstadoVisual.ESPERANDO : EstadoVisual.NORMAL;
  };

  const lim = D.limites;
  const posiciones = (t: Ms, out: Posiciones): void => {
    const tq = instante(t);
    preparar(tq);
    tramoPersona.fill(-1);
    playa.length = 0;
    const cap = out.x.length;
    const z = (out as Partial<PosicionesEscena>).z, tapado = (out as Partial<PosicionesEscena>).tapado, celda = (out as Partial<PosicionesEscena>).celda;
    let v = 0;
    const poner = (clase: number, id: number, est: number, h: number, tap = 0, cel = 0) => {
      if (v >= cap) throw new RangeError(`escena: Posiciones tiene lugar para ${cap} entidades y hay más (usar reproductor.crearPosiciones()).`);
      if (o3[0] < lim.xmin || o3[0] > lim.xmax || o3[1] < lim.ymin || o3[1] > lim.ymax) recortes++;
      acotar(lim, o3);
      out.x[v] = o3[0]; out.y[v] = o3[1]; out.ang[v] = o3[2];
      out.estado[v] = est; out.clase[v] = clase; out.id[v] = id;
      if (z) z[v] = h;
      if (tapado) tapado[v] = tap;
      if (celda) celda[v] = cel;
      v++;
    };
    for (let q = 0; q < nAct; q++) {
      const i = act[q], k = K[i];
      if (k >= TipoTramo.PERSONA_TRABAJA) { // personas: se dibujan una vez cada una, al final
        const g = E[i];
        if (g >= 0 && g < NP && (tramoPersona[g] < 0 || k !== TipoTramo.PERSONA_PAUSA)) tramoPersona[g] = i;
        continue;
      }
      if (k === TipoTramo.CAMION_PLAYA) { playa.push(i); continue; }
      if (k === TipoTramo.CAMION_ANDEN) {
        if (!NA) continue;
        const a = D.andenes[R[i] < 0 ? 0 : R[i] >= NA ? NA - 1 : R[i]];
        o3[0] = a.camion[0]; o3[1] = a.camion[1]; o3[2] = Math.atan2(a.dirCamion[1], a.dirCamion[0]);
        poner(ClaseEntidad.CAMION, E[i], EstadoVisual.NORMAL, 0);
        continue;
      }
      // `paquete` se evalúa antes que la altura: deja en alturaPila la capa de la pila del puesto manual
      poner(ClaseEntidad.PAQUETE, E[i], paquete(i, tq, o3), alturaDeTramo(k) + alturaPila, tapadoPila, celdaPila);
    }
    if (playa.length) {
      playa.sort((x, y) => T0[x] - T0[y] || E[x] - E[y]);
      const ang = NA ? Math.atan2(D.andenes[0].dirCamion[1], D.andenes[0].dirCamion[0]) : 0;
      for (let k = 0; k < playa.length; k++) {
        lugarEnPlaya(D.playa, k, o3);
        o3[2] = ang;
        poner(ClaseEntidad.CAMION, E[playa[k]], EstadoVisual.ESPERANDO, 0);
      }
    }
    for (let g = 0; g < NP; g++) {
      if (ausente[g]) continue;
      poner(ClaseEntidad.PERSONA, g, persona(g, tq, o3), 0);
    }
    out.n = v;
  };

  const recursos = (t: Ms, out: EstadoRecursos): void => {
    const tq = instante(t);
    preparar(tq);
    out.pasoLazo = reloj.pasoEn(tq);
    out.lazoDetenido = reloj.detenidoEn(tq);
    const nr = Math.min(NR, out.rampaOcupacion.length, out.rampaLlena.length);
    for (let r = 0; r < nr; r++) {
      const ocup = entradasHasta(filas, 1 + r, tq) - tomadas(r, tq);
      out.rampaOcupacion[r] = ocup;
      out.rampaLlena[r] = ocup >= G.rampas[r].capacidad ? 1 : 0;
    }
    out.filaAcumulacion = entradasHasta(filas, G_ACUM, tq) - salAcum;
    const ni = Math.min(NI, out.puestoEstado.length);
    for (let s = 0; s < ni; s++) out.puestoEstado[s] = puestoConPersona[s] ? EstadoPuesto.LIBRE : EstadoPuesto.SIN_PERSONA;
    const np = Math.min(NP, out.personaEstado.length);
    for (let g = 0; g < np; g++) out.personaEstado[g] = ausente[g] ? EstadoPersona.AUSENTE : EstadoPersona.LIBRE;
    for (let q = 0; q < nAct; q++) {
      const i = act[q], k = K[i], r = R[i];
      if (k === TipoTramo.INDUCCION && r >= 0 && r < ni) {
        if (out.puestoEstado[r] !== EstadoPuesto.ESPERA_BANDEJA) out.puestoEstado[r] = EstadoPuesto.INDUCE;
      } else if (k === TipoTramo.ESPERA_BANDEJA && r >= 0 && r < ni) {
        out.puestoEstado[r] = EstadoPuesto.ESPERA_BANDEJA;
      } else if (k >= TipoTramo.PERSONA_TRABAJA) {
        const g = E[i];
        if (g < 0 || g >= np || ausente[g]) continue;
        const pe = k === TipoTramo.PERSONA_TRABAJA ? EstadoPersona.TRABAJA : k === TipoTramo.PERSONA_PAUSA ? EstadoPersona.PAUSA
          : k === TipoTramo.PERSONA_CAMINA ? EstadoPersona.CAMINA : k === TipoTramo.PERSONA_CIERRA_JAULA ? EstadoPersona.CIERRA_JAULA
          : EstadoPersona.LIBRE;
        if (out.personaEstado[g] === EstadoPersona.LIBRE || pe !== EstadoPersona.PAUSA) out.personaEstado[g] = pe;
        if (k === TipoTramo.PERSONA_PAUSA && rolEf[g] === 'induccion' && r >= 0 && r < ni && out.puestoEstado[r] === EstadoPuesto.LIBRE) {
          out.puestoEstado[r] = EstadoPuesto.PAUSA;
        }
      }
    }
  };

  const crearPosiciones = (): PosicionesEscena => ({
    n: 0, x: new Float32Array(maxVisibles), y: new Float32Array(maxVisibles), ang: new Float32Array(maxVisibles),
    estado: new Uint8Array(maxVisibles), clase: new Uint8Array(maxVisibles), id: new Int32Array(maxVisibles),
    z: new Float32Array(maxVisibles), tapado: new Uint8Array(maxVisibles), celda: new Float32Array(maxVisibles),
  });
  const crearEstadoRecursos = (): EstadoRecursos => ({
    pasoLazo: 0, lazoDetenido: false, rampaOcupacion: new Float32Array(NR), rampaLlena: new Uint8Array(NR), filaAcumulacion: 0,
    puestoEstado: new Uint8Array(NI), personaEstado: new Uint8Array(NP),
  });

  let posTocar: Posiciones | null = null;
  /** Lo más cercano a (x, y) dentro del radio: primero lo que se mueve; si no hay, rampas y puestos; si no, el lazo. */
  const tocar = (x: number, y: number, t: Ms, radio: number): { clase: ClaseEntidad; id: number } | null => {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !(radio >= 0)) return null;
    posTocar ??= crearPosiciones();
    posiciones(t, posTocar);
    const p = posTocar, r2 = radio * radio;
    let mejor = -1, dMejor = Infinity;
    for (let i = 0; i < p.n; i++) {
      const dx = p.x[i] - x, dy = p.y[i] - y, d = dx * dx + dy * dy;
      if (d <= r2 && d < dMejor) { dMejor = d; mejor = i; }
    }
    if (mejor >= 0) return { clase: p.clase[mejor] as ClaseEntidad, id: p.id[mejor] };
    let clase = -1, id = -1;
    const probar = (px: number, py: number, c: number, k: number) => {
      const dx = px - x, dy = py - y, d = dx * dx + dy * dy;
      if (d <= r2 && d < dMejor) { dMejor = d; clase = c; id = k; }
    };
    for (let r = 0; r < NR; r++) {
      const Rr = D.rampas[r];
      probar((Rr.ini[0] + Rr.fin[0]) / 2, (Rr.ini[1] + Rr.fin[1]) / 2, ClaseEntidad.RAMPA, r);
      probar(Rr.jaula[0], Rr.jaula[1], ClaseEntidad.RAMPA, r);
    }
    for (let s = 0; s < NI; s++) {
      probar(D.estaciones[s].base[0], D.estaciones[s].base[1], ClaseEntidad.PUESTO, s);
      probar(D.estaciones[s].operador[0], D.estaciones[s].operador[1], ClaseEntidad.PUESTO, s);
    }
    if (clase >= 0) return { clase: clase as ClaseEntidad, id };
    for (let s = 0; s < L.largo; s += 0.25) { // el lazo es el equipo 0
      posEnLazo(L, s, o3);
      probar(o3[0], o3[1], ClaseEntidad.EQUIPO, 0);
    }
    return clase >= 0 ? { clase: clase as ClaseEntidad, id } : null;
  };

  return {
    traza: tr, inicio, fin, maxVisibles, disposicion: D, reloj, capacidadJaula,
    get recortes() { return recortes; },
    crearPosiciones, crearEstadoRecursos, posiciones, recursos, tocar, instante,
    bandejasDe: (e: number) => (e >= 0 && e < dosBandejas.length && dosBandejas[e] ? 2 : 1),
    jaulas(t: Ms, nivel: Float32Array, numero: Int32Array): void {
      const tq = instante(t);
      const m = Math.min(NR, nivel.length, numero.length);
      for (let r = 0; r < m; r++) {
        const c = cuantosHasta(jaulaT0, tq, jaulaOff[r], jaulaOff[r + 1]);
        if (c === 0) { nivel[r] = 0; numero[r] = 0; continue; }
        const a = jaulaA[jaulaOff[r] + c - 1];
        nivel[r] = Math.min(1, ((a % 1000) + 1) / capJ);
        numero[r] = Math.floor(a / 1000);
      }
    },
    colaExcepcion(t: Ms): number {
      const tq = instante(t);
      return entradasHasta(filas, G_EXC, tq) - salidasHasta(filas, G_EXC, tq)
        + entradasHasta(filas, G_EXC_RAMPA, tq) - salidasHasta(filas, G_EXC_RAMPA, tq);
    },
  };
}

/** ¿Los índices están en orden no decreciente de t? (el hub los escribe así; si no, se ordenan). */
function estaOrdenado(idx: Int32Array, t: Float64Array): boolean {
  for (let q = 1; q < idx.length; q++) if (t[idx[q]] < t[idx[q - 1]]) return false;
  return true;
}
