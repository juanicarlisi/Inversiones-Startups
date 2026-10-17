// contratos/motor.ts · CONGELADO.
// Motor de eventos discretos determinista. Todo lo que hay en el calendario y en los bloques es numérico y vive en arreglos
// tipados: por eso se puede fotografiar, restaurar, clonar y portar a WebAssembly sin reescribir los bloques.
import type { Fase, Ms } from './tipos-base.ts';
import type { ClaveDe, FuenteAzar } from './azar.ts';
import type { EscritorTraza, NivelTraza } from './traza.ts';
import type { MatematicaDeterminista } from './matematica.ts';

export interface OpcionesMotor {
  semilla: number;               // uint32
  replica: number;               // uint32
  hasta: Ms;                     // horizonte: no se procesan eventos con t > hasta
  traza: NivelTraza;
  /** Guardián contra modelos que no terminan. Por defecto 50.000.000. */
  maxEventos?: number;
  /** Guardián contra lazos de tiempo cero: eventos seguidos en el mismo instante. Por defecto 1.000.000. */
  maxMismoInstante?: number;
}

/** Estado completo de un bloque, sin closures ni objetos: solo arreglos tipados y números. */
export type EstadoBloque = Record<string, Float64Array | Int32Array | Uint32Array | Int16Array | Uint16Array | Uint8Array | number>;

export interface Bloque {
  /** Ruta estable en el esquema (p. ej. 'hub.sorter'): identifica el bloque en la foto y alimenta las claves del azar. */
  readonly ruta: string;
  /** El motor lo llama con cada evento agendado para este bloque. `m.seq` es el número de secuencia de ese evento. */
  manejar(m: Motor, tipo: number, arg: number): void;
  estado(): EstadoBloque;
  restaurar(e: EstadoBloque): void;
  /** Al final de la corrida: cierra tramos abiertos y calcula indicadores. */
  finalizar?(m: Motor): void;
}

export type EstadoCorrida = 'sin-eventos' | 'horizonte' | 'pausa' | 'tope-eventos' | 'lazo-tiempo-cero';

export interface ResultadoCorrida {
  estado: EstadoCorrida;
  ahora: Ms;
  eventos: number;
  huella: string;
}

export interface Foto {
  version: 1;
  ahora: Ms;
  seq: number;
  eventos: number;
  huella: [number, number];
  /** Calendario serializado (columnas del montículo). */
  calendario: Record<string, Float64Array | Int32Array | Uint8Array | number>;
  bloques: Record<string, EstadoBloque>;
}

export interface Motor {
  readonly ahora: Ms;
  /** Secuencia del evento que se está procesando (para descartar eventos viejos: no hay cancelación en el calendario). */
  readonly seq: number;
  readonly eventos: number;
  readonly opciones: Readonly<OpcionesMotor>;
  readonly azar: FuenteAzar;
  readonly mat: MatematicaDeterminista;
  readonly traza: EscritorTraza;
  readonly claveDe: ClaveDe;
  /** Registra un bloque y devuelve su índice. El orden de registro es parte del modelo (y de la huella). */
  registrar(b: Bloque): number;
  /**
   * Agenda un evento. Orden total del calendario: (t, fase, prioridad, seq). Lanza error si t no es entero o si t < ahora.
   * Devuelve el seq asignado (creciente).
   */
  agendar(t: Ms, bloque: number, tipo: number, arg: number, fase?: Fase, prioridad?: number): number;
  /** Procesa eventos hasta el horizonte o hasta que no queden. */
  correr(): ResultadoCorrida;
  /** Procesa eventos con t ≤ hasta y deja ahora = hasta (para fotos y para tramos de escena). */
  correrHasta(hasta: Ms): ResultadoCorrida;
  foto(): Foto;
  restaurar(f: Foto): void;
  /** Huella de 64 bits en 16 caracteres hex sobre todos los eventos procesados (corte-1.md §6.4). */
  huella(): string;
  /** Llama a finalizar() de cada bloque en orden de registro. */
  finalizar(): void;
}

export type CrearMotor = (o: OpcionesMotor) => Motor;

/** Cola FIFO de enteros en un arreglo tipado que se agranda duplicando. Serializable. La implementa hub/estructuras/ (P4). */
export interface AnilloI32 {
  readonly largo: number;
  poner(x: number): void;
  sacar(): number;          // lanza si está vacía
  mirar(i?: number): number; // i-ésimo desde el frente (0 = el primero)
  vaciar(): void;
  estado(): EstadoBloque;
  restaurar(e: EstadoBloque): void;
}

/**
 * Rueda de tiempos para equipos con reloj propio (el lazo del sorter): `ranuras` = cantidad de pasos de una vuelta.
 * agendar(paso, x) exige pasoActual < paso ≤ pasoActual + ranuras. tomar(paso, f) llama f(x) en orden de llegada (FIFO)
 * para todo lo agendado en ese paso, y vacía la ranura ANTES de llamar a f (lo que f agende para paso + ranuras queda para
 * la próxima vuelta). Serializable. La implementa hub/estructuras/ (P4).
 */
export interface RuedaTiempos {
  readonly ranuras: number;
  agendar(paso: number, x: number): void;
  tomar(paso: number, f: (x: number) => void): number;
  estado(): EstadoBloque;
  restaurar(e: EstadoBloque): void;
}

/** Tiempo de un recorrido con perfil trapezoidal (o triangular si no llega a la velocidad máxima). Segundos. */
export type TiempoTrapezoidal = (distancia: number, velocidadMax: number, aceleracion: number, frenado?: number) => number;
