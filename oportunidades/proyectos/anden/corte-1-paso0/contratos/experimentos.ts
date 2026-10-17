// contratos/experimentos.ts · CONGELADO. Réplicas, estadística por defecto, decisión, semáforo y comprobante.
import type { Ms } from './tipos-base.ts';
import type { ModeloValidado, Variante } from './modelo.ts';
import type { KpiId, ResultadoReplica } from './resultados.ts';
import type { NivelTraza, Traza } from './traza.ts';
import type { MensajeAlTrabajador, MensajeDelTrabajador } from './mensajes-worker.ts';

/** Una noche: función pura de (modelo, semilla, réplica). La implementa el paquete del hub. */
export type Simulador = (mv: ModeloValidado, semilla: number, replica: number, o: { traza: NivelTraza }) => SalidaSimulacion;
export interface SalidaSimulacion { resultado: ResultadoReplica; traza?: Traza }

export interface Resumen {
  kpi: KpiId;
  n: number;
  media: number;
  desvio: number;
  confianza: number;
  ic: [number, number];          // t de Student sobre réplicas independientes; nunca sobre una sola corrida
  semiancho: number;
  p50: number;
  p90: number;
  icP90: [number, number] | null; // estadísticos de orden (binomial); null si n < 20
  min: number;
  max: number;
}
export interface Proporcion { exitos: number; n: number; p: number; ic: [number, number]; metodo: 'wilson'; confianza: number }
export interface Comparacion {
  kpi: KpiId;
  n: number;
  pareada: true;                 // misma semilla y réplica en A y B (números aleatorios comunes)
  media: number;                 // media de B − A
  ic: [number, number];
  veredicto: 'b-mejor' | 'a-mejor' | 'no-se-distingue';
  /** Si no se distingue: réplicas que harían falta para que el semiancho sea la mitad de |media| (null si media = 0). */
  replicasSugeridas: number | null;
}

export type EstadoConfiguracion = 'cumple' | 'no-cumple' | 'en-duda';
export interface EvaluacionConfiguracion {
  valor: number;                 // valor de la variable de decisión
  prop: Proporcion;              // P(restricción) con su IC de Wilson
  estado: EstadoConfiguracion;   // cumple: IC inferior ≥ meta · no-cumple: IC superior < meta · en-duda: el IC cruza la meta
  objetivo: Resumen;             // KPI a minimizar
}
export interface EvaluacionDecision {
  decision: string;
  configuraciones: EvaluacionConfiguracion[];
  recomendacion: number | null;  // el menor valor que «cumple», si todos los menores «no cumplen»; si no, null
  semaforo: Semaforo;
  replicasUsadas: number;
}

export type MotivoSemaforo =
  | 'ok' | 'precision-no-lograda' | 'decision-en-duda' | 'pocas-replicas' | 'inestable' | 'conservacion' | 'invariante'
  | 'fuera-de-dominio' | 'modelo-con-errores';
export interface Semaforo { color: 'verde' | 'amarillo' | 'rojo'; motivo: MotivoSemaforo; vars: Record<string, string | number> }

export interface Receta {
  v: 1;
  modelo: string;               // huella del modelo
  motor: string;                // versión del motor, p. ej. '1.0.0'
  semilla: number;
  replicas: number;
  noche?: number;               // réplica que se muestra en la escena
  t?: Ms;                       // instante del cabezal
  vel?: number;                 // velocidad de reproducción
  esc?: string[];               // escenarios (ids) en pantalla dividida
}
export interface Comprobante {
  receta: Receta;
  huellaAgregada: string;       // huella de las huellas por réplica, en orden de índice
  motor: { version: string; pruebasExigibles: number; pasaron: number; fecha: string };
  modelo: { controles: number; pasaron: number; avisos: number };
  semaforo: Semaforo;
  procedencia: { hecho: number; medido: number; estimacion: number; hipotesis: number; supuesto: number; datoUsuario: number };
  validacion: { estado: 'sin-validar' } | { estado: 'validado'; dias: number; dentroDelIntervalo: number };
}

export const Prioridad = { VISTA_PREVIA: 0, CONFIRMACION: 1, NOCHES: 2, DECISION: 3, TAMIZADO: 4 } as const;
export type Prioridad = (typeof Prioridad)[keyof typeof Prioridad];

export interface Trabajo {
  id: string;
  prioridad: Prioridad;
  mv: ModeloValidado;
  semilla: number;
  replicas: [number, number];    // [desde, hasta)
  traza: NivelTraza;
}
/** Planificador de réplicas: prioridades, cancelación inmediata, agregación por índice (nunca por orden de llegada). */
export interface Planificador {
  readonly trabajadores: number;
  enviar(t: Trabajo, alResultado: (r: ResultadoReplica, traza?: Traza) => void): Promise<{ completadas: number; cancelado: boolean }>;
  cancelar(id: string): void;
  cancelarDesde(p: Prioridad): void;   // cancela todo lo de prioridad ≥ p (p. ej. al mover el deslizador)
  cerrar(): void;
}
/** Abstracción de un Worker (Web Worker en el navegador; en proceso o worker_threads en Node). */
export interface PuertoTrabajador {
  enviar(m: MensajeAlTrabajador, transferir?: Transferable[]): void;
  alRecibir(f: (m: MensajeDelTrabajador) => void): void;
  terminar(): void;
}
export type FabricaTrabajador = () => PuertoTrabajador;

// ---- Funciones (firmas congeladas; las implementa experimentos/) ----
export type Resumir = (rs: ResultadoReplica[], kpi: KpiId, confianza: number) => Resumen;
export type Proporcionar = (rs: ResultadoReplica[], kpi: KpiId, comparador: '<=' | '>=', umbral: number, confianza: number) => Proporcion;
/** Pareado por índice de réplica: a[i] y b[i] tienen que tener la misma semilla y réplica (lanza si no). */
export type CompararPareado = (a: ResultadoReplica[], b: ResultadoReplica[], kpi: KpiId, confianza: number) => Comparacion;
/** Réplicas secuenciales: replicasIniciales por valor de la variable y después tandas solo para los valores «en duda». */
export type EvaluarDecision = (mv: ModeloValidado, p: Planificador, variante: Variante,
  o: { replicasIniciales: number; tanda: number; replicasMax: number; alProgreso?: (hechas: number, maximo: number) => void }) => Promise<EvaluacionDecision>;
export type ArmarComprobante = (mv: ModeloValidado, rs: ResultadoReplica[], semaforo: Semaforo,
  motor: Comprobante['motor'], receta: Omit<Receta, 'v' | 'modelo' | 'motor'>) => Promise<Comprobante>;
export type CrearPlanificador = (fabrica: FabricaTrabajador, trabajadores: number) => Planificador;
/** Trabajador en el mismo hilo (Node y pruebas): corre el simulador al recibir 'correr'. */
export type TrabajadorEnProceso = (sim: Simulador, motor: string) => FabricaTrabajador;
