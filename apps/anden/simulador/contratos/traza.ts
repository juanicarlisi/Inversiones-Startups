// contratos/traza.ts · CONGELADO.
// La traza es la única fuente de las vistas, de la biografía, del explicador y del narrador: lo que se ve es lo que se calculó.
// Formato columnar por tramos (quién, qué, dónde, desde, hasta, por qué). Las posiciones se calculan con fórmulas cerradas.
import type { Ms } from './tipos-base.ts';
import type { GeometriaHub } from './geometria.ts';

export type NivelTraza = 'no' | 'kpi' | 'completa';

export const ClaseEntidad = { PAQUETE: 0, PERSONA: 1, CAMION: 2, EQUIPO: 3, RAMPA: 4, PUESTO: 5 } as const;
export type ClaseEntidad = (typeof ClaseEntidad)[keyof typeof ClaseEntidad];

/** Referencia a una entidad de cualquier clase en un Int32: clase · 2^24 + id. -1 = nadie. */
export function refDe(clase: ClaseEntidad, id: number): number { return clase * 16777216 + id; }
export function claseDeRef(q: number): ClaseEntidad { return Math.floor(q / 16777216) as ClaseEntidad; }
export function idDeRef(q: number): number { return q % 16777216; }

/**
 * Tipos de tramo. Significado de las columnas por tipo (e = entidad, r = recurso, a = auxiliar):
 * CAMION_PLAYA     e camión · r -1 · a 0 · c ANDEN_OCUPADO si esperó
 * CAMION_ANDEN     e camión · r andén · a paquetes del camión
 * DESCARGA         e paquete · r andén · a camión
 * CINTA            e paquete · r cinta · a 0 (posición lineal entre t0 y t1 sobre la polilínea de la cinta)
 * ACUMULACION      e paquete · r 0 · a secuencia de entrada (lugar en la fila = a − salidas hasta t) · c FILA
 * INDUCCION        e paquete · r puesto · a persona
 * ESPERA_BANDEJA   e paquete · r puesto · a bandejas que necesita (1 o 2) · c FALTA_BANDEJA
 * BANDEJA          e paquete · r bandeja (0..T−1) · a vuelta (0 = primera) · c RAMPA_LLENA y q = ref(RAMPA, r) si es una vuelta extra
 * RAMPA            e paquete · r rampa · a secuencia en la rampa (lugar = a − tomados hasta t) · q = ref(PERSONA, persona asignada)
 * MANO             e paquete · r persona · a rampa
 * JAULA            e paquete · r rampa · a jaula·1000 + posición
 * COLA_MANUAL      e paquete · r 0 · a secuencia · c motivo (NO_LEIDO | RAMPA_LLENA por vueltas máximas | NO_TRANSPORTABLE)
 * MANUAL           e paquete · r persona · a 0
 * PERSONA_*        e persona · r puesto, rampa o andén según el rol · a paquete (si trabaja) o 0
 * LAZO_MARCHA      e -1 · r 0 · a paso del lazo al inicio del tramo (k0); en marcha k(t) = k0 + floor((t − t0) / tickLazo)
 * LAZO_DETENIDO    e -1 · r 0 · a paso del lazo (constante) · c FALLA
 */
export const TipoTramo = {
  CAMION_PLAYA: 1, CAMION_ANDEN: 2,
  DESCARGA: 10, CINTA: 11, ACUMULACION: 12, INDUCCION: 13, ESPERA_BANDEJA: 14, BANDEJA: 15, RAMPA: 16, MANO: 17, JAULA: 18,
  COLA_MANUAL: 19, MANUAL: 20,
  PERSONA_TRABAJA: 30, PERSONA_LIBRE: 31, PERSONA_PAUSA: 32, PERSONA_CAMINA: 33, PERSONA_AUSENTE: 34, PERSONA_CIERRA_JAULA: 35,
  LAZO_MARCHA: 40, LAZO_DETENIDO: 41,
  COLA: 50, SERVICIO: 51,
} as const;
export type TipoTramo = (typeof TipoTramo)[keyof typeof TipoTramo];

/** Taxonomía tipada de esperas (no hay «causas» libres: el explicador solo puede afirmar una de estas). */
export const Causa = {
  NINGUNA: 0, FILA: 1, BLOQUEO: 2, FALTA_BANDEJA: 3, RAMPA_LLENA: 4, PAUSA: 5, AUSENCIA: 6, FALLA: 7, CIERRE_JAULA: 8,
  NO_LEIDO: 9, PERSONA_OCUPADA: 10, ANDEN_OCUPADO: 11, NO_TRANSPORTABLE: 12,
} as const;
export type Causa = (typeof Causa)[keyof typeof Causa];

export const TipoMomento = {
  CAMION_LLEGA: 1, CAMION_ATRASADO: 2, ATRASO_COMUN: 3,
  RAMPA_LLENA: 10, RAMPA_LIBERA: 11,
  LAZO_PARA: 20, LAZO_ARRANCA: 21,
  PAUSA_INICIO: 30, PAUSA_FIN: 31, AUSENCIA: 32, REEMPLAZO: 33,
  JAULA_CERRADA: 40,
  CORTE: 50, PRIMER_PAQUETE: 51, ULTIMO_CLASIFICADO: 52,
  ACUMULACION_LLENA: 60, ACUMULACION_LIBERA: 61,
} as const;
export type TipoMomento = (typeof TipoMomento)[keyof typeof TipoMomento];

/** Columnas de tramos. Cada arreglo tiene largo exacto n (sin capacidad sobrante: se transfiere entre hilos). */
export interface ColumnasTramos {
  n: number;
  e: Int32Array; k: Uint8Array; r: Int32Array; a: Int32Array;
  t0: Float64Array; t1: Float64Array;
  c: Uint8Array;   // Causa
  q: Int32Array;   // causante: refDe(clase, id) o -1
}
/** Momentos puntuales: r = recurso o persona según el tipo; v = valor (minutos de atraso, persona cubierta, etc.). */
export interface ColumnasMomentos {
  n: number;
  t: Float64Array; tipo: Uint8Array; r: Int32Array; v: Float64Array;
}
/** Resumen por paquete, indexado por el id de la traza. Clave estable entre escenarios: (camion, indice). */
export interface ColumnasPaquetes {
  n: number;
  camion: Int32Array; indice: Int32Array; ruta: Int16Array; clase: Uint8Array;
  creado: Float64Array; listo: Float64Array; // listo = entró a la jaula; -1 si no terminó
  vueltas: Uint8Array;
}
export interface Catalogo {
  personas: { id: string; rol: 'induccion' | 'reten' | 'descarga' | 'rampa' | 'excepcion' }[];
  camiones: { id: string; turno: Ms }[];
  rutas: string[];
  rampas: string[];
  puestos: string[];
  andenes: string[];
}

export interface Traza {
  version: 1;
  modelo: string;      // huella del modelo
  semilla: number;
  replica: number;
  tickLazo: Ms;        // ms que tarda una bandeja en avanzar un paso
  bandejas: number;    // T
  inicio: Ms;
  fin: Ms;
  corte: Ms;
  tramos: ColumnasTramos;
  momentos: ColumnasMomentos;
  paquetes: ColumnasPaquetes;
  catalogo: Catalogo;
  geometria: GeometriaHub;
  huella: string;      // huella de la corrida (la del motor)
}

export interface EscritorTraza {
  readonly nivel: NivelTraza;
  /** Abre un tramo con t1 = Infinity y devuelve su índice (−1 si nivel ≠ 'completa'). */
  abrir(e: number, k: TipoTramo, r: number, a: number, t0: Ms, c?: Causa, q?: number): number;
  cerrar(i: number, t1: Ms, a?: number): void;
  tramo(e: number, k: TipoTramo, r: number, a: number, t0: Ms, t1: Ms, c?: Causa, q?: number): number;
  momento(t: Ms, tipo: TipoMomento, r: number, v: number): void;
  paquete(id: number, camion: number, indice: number, ruta: number, clase: number, creado: Ms): void;
  paqueteListo(id: number, listo: Ms, vueltas: number): void;
  /** Cierra los tramos abiertos en `fin` y devuelve la traza con columnas de largo exacto. */
  terminar(datos: Omit<Traza, 'tramos' | 'momentos' | 'paquetes' | 'version'>): Traza;
}
