// contratos/decision.ts · CONGELADO. Preguntar lo que cambia la decisión (sin IA en el corte 1: formularios).
import type { Frase } from './explicacion.ts';
import type { EvaluacionDecision } from './experimentos.ts';
import type { ModeloValidado, Variante } from './modelo.ts';

export interface SupuestoTamizable {
  parametro: string;             // nombre en modelo.parametros (tiene que tener `incierto`)
  valores: [number, number, number];
  pesos: [number, number, number];
  golpeDiscreto: boolean;
}
export interface ResultadoTamizado {
  parametro: string;
  decisiones: [number | null, number | null, number | null];   // recomendación con el valor bajo, medio y alto
  cambiaDecision: boolean;
  /** Pérdida esperada de decidir hoy con el valor medio: Σ pesoᵢ · |costo(dᵢ) − costo(d_medio)|, en moneda del modelo por noche. */
  perdidaEsperada: number;
  /** Cuánto se corre el KPI objetivo entre los extremos con la decisión del valor medio (ranking clásico, secundario). */
  corrimientoObjetivo: number;
  replicas: number;
  evaluaciones: [EvaluacionDecision, EvaluacionDecision, EvaluacionDecision];
}
/** Cancelable: el planificador corre las evaluaciones con prioridad TAMIZADO y las cancela si el usuario cambia algo. */
export type Tamizar = (mv: ModeloValidado, supuestos: SupuestoTamizable[], evaluar: (mv: ModeloValidado) => Promise<EvaluacionDecision>,
  variante: Variante, o: { alProgreso?: (hechos: number, total: number) => void }) => Promise<ResultadoTamizado[]>;
/** Los supuestos tamizables salen de los parámetros con `incierto`. */
export type SupuestosDe = (mv: ModeloValidado) => SupuestoTamizable[];

/** n ≈ (1,96 · cv / ε)²: observaciones para estimar la media con error relativo ε al 95%. */
export interface PlanMedicion { parametro: string; cv: number; errorRelativo: number; observaciones: number; minutos: number }
export interface Pregunta {
  parametro: string;
  orden: number;
  texto: string;                 // la pregunta en criollo (de Parametro.pregunta)
  porQue: Frase;                 // «cambia la respuesta en hasta N puestos»
  referencia: { valor: number; fuente: string; etiqueta: string };
  rango: [number, number];
  medir: PlanMedicion;
  perdidaEsperada: number;
}
export type ArmarFormulario = (mv: ModeloValidado, ranking: ResultadoTamizado[]) => Pregunta[];
export type PlanDeMedicion = (parametro: string, cv: number, errorRelativo: number, segundosPorObservacion: number) => PlanMedicion;
