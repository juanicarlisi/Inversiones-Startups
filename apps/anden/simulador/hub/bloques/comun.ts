// hub/bloques/comun.ts · Andén simulador, corte 1 · P4 (el hub).
// Piezas que comparten los bloques del hub: la numeración de los eventos (entra en la huella; ver hub/README.md), los lugares por
// los que pasa un paquete, las banderas de alerta y el patrón de estado: TODO el estado de un bloque vive en un objeto plano de
// arreglos tipados y números (`S`), que estado() vuelca y restaurar() reemplaza por copias (foto y restauración, corte-1.md §6.5).
import { aMs } from '../../contratos/tipos-base.ts';
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import type { ConfigHub } from '../config.ts';
import type { Paquetes } from './paquetes.ts';
import type { BloqueDemanda } from './demanda.ts';
import type { BloqueAndenes } from './andenes.ts';
import type { BloqueAcumulacion } from './acumulacion.ts';
import type { BloqueInduccion } from './induccion.ts';
import type { BloqueRampas } from './rampas.ts';
import type { BloqueExcepcion } from './excepcion.ts';
import type { BloquePersonas } from './personas.ts';
import type { BloqueMedicion } from './medicion.ts';

/** Tipos de evento del hub, por bloque (rangos separados para leer la traza del motor a simple vista). */
export const EV = {
  LLEGADA_CAMION: 1,
  ABRIR_ANDENES: 10, FIN_DESCARGA: 11, ANDEN_LIBRE: 12,
  LLEGA_ACUMULACION: 20,
  FIN_INDUCCION: 30, PAUSA_INICIO_INDUCCION: 31, PAUSA_FIN_INDUCCION: 32,
  PASO: 40, PARADA_INICIO: 41, PARADA_FIN: 42, LLEGA_RAMPA_F2: 43,
  FIN_CAMINATA: 50, FIN_MANEJO: 51, FIN_CIERRE: 52, PAUSA_INICIO_RAMPA: 53, PAUSA_FIN_RAMPA: 54,
  FIN_MANUAL: 60,
  INICIO_TURNO: 70,
  MEDICION: 80, CORTE: 81,
} as const;

/** Prioridad del paso del lazo: después de los demás eventos NORMAL del mismo instante (corte-1.md §6.8). */
export const PRIORIDAD_PASO = 9;

/** Dónde está cada paquete (para la conservación por bloque). */
export const Lugar = {
  NADA: 0, CINTA: 1, ACUMULACION: 2, INDUCCION: 3, ESPERA: 4, BANDEJA: 5, RAMPA: 6, MANO: 7, COLA_MANUAL: 8, MANUAL: 9, JAULA: 10,
} as const;
export type Lugar = (typeof Lugar)[keyof typeof Lugar];
export const LUGARES = 11;

/** Banderas de invariantes que fallaron (§6.7 regla 16), en un número del estado. */
export const ALERTA = { RAMPA_CAPACIDAD: 1, BANDEJA_UNICA: 2, TIEMPO: 4, PAUSA: 8 } as const;

/** Lo que el hub necesita del sorter, sea el de bandejas (F3) o la demora fija (F2). */
export interface Lazo extends Bloque {
  readonly S: {
    enBandejas: number; esperando: number; colocaciones: number; noLeidos: number; vueltasExtra: number;
    paradas: number; msDetenido: number; parado: number; tParada: number; enCamino: Int32Array; rampaVueltas: Int32Array;
  };
  /** El puesto s terminó de inducir su paquete: que espere bandeja (F3) o que salga ya (F2). */
  esperar(s: number, t: number): void;
  /** Bandejas ocupadas (para la conservación; 0 en F2). */
  bandejasOcupadas(): number;
  agendarInicial(): void;
}

/** El hub de una noche: la configuración, el motor, el almacén de paquetes y los bloques, que se llaman entre sí. */
export interface Hub {
  readonly cfg: ConfigHub;
  readonly m: Motor;
  P: Paquetes;
  demanda: BloqueDemanda;
  personas: BloquePersonas;
  andenes: BloqueAndenes;
  acum: BloqueAcumulacion;
  ind: BloqueInduccion;
  sorter: Lazo;
  rampas: BloqueRampas;
  exc: BloqueExcepcion;
  medicion: BloqueMedicion;
  /** Instante del último evento procesado por el hub (transitorio: no es estado, se recalcula en cada evento). */
  tUltimo: number;
  /** Ya no queda trabajo: todos los camiones descargados y todo paquete en su jaula. */
  terminado(): boolean;
}

// ---- Estado plano ----

export type Arreglo = Float64Array | Int32Array | Uint32Array | Int16Array | Uint16Array | Uint8Array;
export type EstadoPlano = Record<string, Arreglo | number>;

function describir(v: unknown): string {
  if (typeof v === 'number') return 'un número';
  if (v === undefined) return 'nada';
  return (v as object).constructor?.name ?? typeof v;
}

/** Copia las claves de S en `out` con un prefijo (referencias vivas: el motor copia al fotografiar). */
export function volcar(S: EstadoPlano, prefijo: string, out: EstadoBloque): EstadoBloque {
  for (const k of Object.keys(S)) out[prefijo + k] = S[k];
  return out;
}

/** Reemplaza cada clave de S por una COPIA de lo que trae el estado, con el mismo tipo; si falta algo, lo dice. */
export function cargar(S: EstadoPlano, e: EstadoBloque, prefijo: string, quien: string): void {
  for (const k of Object.keys(S)) {
    const clave = prefijo + k, v = e[clave], actual = S[k];
    if (v === undefined) throw new Error(`${quien}: al restaurar falta «${clave}» (se esperaba ${describir(actual)}).`);
    if (typeof actual === 'number') {
      if (typeof v !== 'number') throw new TypeError(`${quien}: «${clave}» tiene que ser un número y vino ${describir(v)}.`);
      S[k] = v;
    } else {
      if (typeof v === 'number' || v.constructor !== actual.constructor) {
        throw new TypeError(`${quien}: «${clave}» tiene que ser ${describir(actual)} y vino ${describir(v)}.`);
      }
      S[k] = v.slice();
    }
  }
}

export function mod(x: number, n: number): number {
  return ((x % n) + n) % n;
}
/** ⌈a ÷ b⌉ para enteros a ≥ 0 y b > 0, sin Math.ceil. */
export function divTecho(a: number, b: number): number {
  return Math.floor((a + b - 1) / b);
}
/** Duración sorteada (s) → ms del motor, en el momento de agendar (§6.2). Negativas valen 0 (ver NOTAS-CONTRATO §5). */
export function duracionMs(s: number, donde: string): number {
  if (Number.isNaN(s)) throw new RangeError(`hub: ${donde} sorteó NaN (se esperaba una duración en segundos).`);
  return s > 0 ? aMs(s) : 0;
}

/** Agrega el estado de una estructura (anillo, rueda) con un prefijo. */
export function anidar(out: EstadoBloque, prefijo: string, sub: EstadoBloque): EstadoBloque {
  for (const k of Object.keys(sub)) out[prefijo + k] = sub[k];
  return out;
}
/** Extrae el estado de una estructura guardada con `anidar`. */
export function desanidar(e: EstadoBloque, prefijo: string): EstadoBloque {
  const out: EstadoBloque = {};
  for (const k of Object.keys(e)) if (k.startsWith(prefijo)) out[k.slice(prefijo.length)] = e[k];
  return out;
}
