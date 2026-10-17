// contratos/vistas.ts · CONGELADO. Reproductor de tramos y vistas 2D / 2,5D. La vista nunca le pide nada al motor.
import type { Ms } from './tipos-base.ts';
import type { ClaseEntidad, Traza } from './traza.ts';
import type { KpiId, ResultadoReplica } from './resultados.ts';

/** Estado visual de una entidad móvil (el color sale del estilo, la forma distingue en escala de grises). */
export const EstadoVisual = {
  NORMAL: 0, DANDO_VUELTA: 1, EXCEPCION: 2, ESPERANDO: 3, ATRASADO: 4, SELECCIONADO: 5, EN_CAMION: 6,
} as const;
export type EstadoVisual = (typeof EstadoVisual)[keyof typeof EstadoVisual];

/** Salida reutilizable del reproductor (sin asignar memoria por cuadro). Coordenadas en metros. */
export interface Posiciones {
  n: number;
  x: Float32Array; y: Float32Array; ang: Float32Array;
  estado: Uint8Array;      // EstadoVisual
  clase: Uint8Array;       // ClaseEntidad
  id: Int32Array;
}
export interface EstadoRecursos {
  pasoLazo: number;                // k(t) con fracción (para animar bandejas)
  lazoDetenido: boolean;
  rampaOcupacion: Float32Array;    // paquetes en cada rampa
  rampaLlena: Uint8Array;
  filaAcumulacion: number;
  puestoEstado: Uint8Array;        // 0 libre · 1 induce · 2 espera bandeja · 3 pausa · 4 sin persona
  personaEstado: Uint8Array;       // 0 libre · 1 trabaja · 2 pausa · 3 camina · 4 ausente · 5 cierra jaula
}
export interface Reproductor {
  readonly traza: Traza;
  readonly inicio: Ms;
  readonly fin: Ms;
  /** Capacidad máxima de entidades visibles a la vez (para dimensionar Posiciones). */
  readonly maxVisibles: number;
  crearPosiciones(): Posiciones;
  crearEstadoRecursos(): EstadoRecursos;
  posiciones(t: Ms, out: Posiciones): void;
  recursos(t: Ms, out: EstadoRecursos): void;
  /** Entidad más cercana a (x, y) en metros dentro del radio, en el instante t. */
  tocar(x: number, y: number, t: Ms, radio: number): { clase: ClaseEntidad; id: number } | null;
}
export type CrearReproductor = (t: Traza) => Reproductor;

export type Piso = '2d' | 'iso';
export interface Camara { cx: number; cy: number; zoom: number; giro: number }
export interface Estilo { tema: 'claro' | 'oscuro'; colores: Record<string, string>; reducirMovimiento: boolean }
export interface OpcionesDibujo { seleccion?: { clase: ClaseEntidad; id: number } | null; riesgo?: MapaRiesgo | null; fantasma?: Reproductor | null }
export interface Vista {
  readonly piso: Piso;
  camara: Camara;
  dibujar(t: Ms, o?: OpcionesDibujo): void;
  redimensionar(ancho: number, alto: number, dpr: number): void;
  /** Pantalla (px) → mundo (m), para tocar. */
  aMundo(px: number, py: number): [number, number];
  destruir(): void;
}
export type CrearVista = (lienzo: HTMLCanvasElement | OffscreenCanvas, r: Reproductor, estilo: Estilo, piso: Piso) => Vista;
/** Mide el primer segundo y elige: 'iso' si el cuadro 2,5D tarda ≤ 10 ms; si no, '2d'. El 3D (corte 2) se suma con su regla. */
export type ElegirPiso = (medirCuadroIsoMs: () => number) => Piso;

/** Cien noches pintadas sobre el plano (se arma con ResultadoReplica, sin trazas completas). */
export interface MapaRiesgo {
  noches: number;
  rampaProbLlena: Float32Array;        // fracción de noches en que la rampa se llenó al menos una vez
  rampaMinutosLlenaP90: Float32Array;
  filaP50: Float32Array;               // por cuarto de hora
  filaP90: Float32Array;
  finClasificacionMin: { p10: number; p50: number; p90: number };
  nocheMediana: number;                // réplica que es la mediana según kpiNoche
  nochePeor: number;                   // réplica que es la peor según kpiNoche
}
export type AgregarRiesgo = (resultados: ResultadoReplica[], kpiNoche: KpiId) => MapaRiesgo;

/** Marca de la línea de tiempo. titulo es una clave i18n con variables. */
export interface MomentoEscena { t: Ms; tipo: number; r: number; importancia: number; clave: string; vars: Record<string, string | number> }
export type DetectarMomentos = (t: Traza) => MomentoEscena[];
