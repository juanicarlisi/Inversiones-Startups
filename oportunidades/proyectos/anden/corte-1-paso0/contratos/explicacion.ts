// contratos/explicacion.ts · CONGELADO. Esperas tipadas, biografías, contrafactuales y frases verificables.
import type { Ms } from './tipos-base.ts';
import type { Causa, ClaseEntidad, TipoTramo, Traza } from './traza.ts';
import type { KpiId } from './resultados.ts';
import type { Comparacion, Proporcion, Resumen, Simulador } from './experimentos.ts';
import type { Modelo, ModeloValidado, OpParche, Variante } from './modelo.ts';

export interface Espera {
  desde: Ms;
  hasta: Ms;
  donde: TipoTramo;
  recurso: number;
  causa: Causa;
  causante: number;              // refDe(clase, id) o -1
  evidencia: number[];           // índices de tramos de la traza que sostienen la causa
}

/** Una cifra dentro de una frase, con de dónde sale. Ninguna frase se muestra con una cifra sin fuente. */
export interface Afirmacion {
  valor: number;
  unidad: string;
  decimales: number;
  fuente:
    | { tipo: 'traza'; tramo: number; campo: 'duracion' | 't0' | 't1' | 'a' }
    | { tipo: 'experimento'; id: string; kpi: KpiId; campo: 'media' | 'p90' | 'diferencia' | 'prob' }
    | { tipo: 'parametro'; nombre: string };
  sentido?: 'sube' | 'baja' | 'igual';
  diferenciaReal?: boolean;      // solo puede ser true si el IC de la comparación excluye el cero
}
export interface Frase { clave: string; vars: Record<string, string | number>; afirmaciones: Afirmacion[] }

export interface PasoBiografia { desde: Ms; hasta: Ms; frase: Frase; espera: Espera | null }
export interface Biografia {
  clase: ClaseEntidad;
  id: number;
  titulo: Frase;
  pasos: PasoBiografia[];
  /** Percentil del tiempo en el hub de este paquete entre los de su noche (0–100), si es un paquete. */
  percentil: number | null;
  /** Siempre vacío al salir de ArmarBiografia (que es síncrona y no simula): lo llena CausasConfirmadas. */
  causas: Frase[];
}
export type ArmarBiografia = (t: Traza, m: Modelo, clase: ClaseEntidad, id: number) => Biografia;
export type EsperasDe = (t: Traza, clase: ClaseEntidad, id: number) => Espera[];

export interface Contrafactual {
  clase: ClaseEntidad;
  /** Clave estable del paquete (camion, indice): sobrevive al cambio de escenario. */
  camion: number;
  indice: number;
  cambio: { clave: string; vars: Record<string, string | number>; parche: OpParche[] };
  semilla: number;
  replica: number;
  antes: { listo: Ms | null; antesDelCorte: boolean };
  despues: { listo: Ms | null; antesDelCorte: boolean };
  /** El cambio movió el resultado de ESTE paquete en el sentido que afirma la causa. */
  confirma: boolean;
}
export type ContrafactualDirigido = (
  sim: Simulador, mv: ModeloValidado, semilla: number, replica: number, camion: number, indice: number,
  cambio: Contrafactual['cambio'], variante: Variante,
) => Promise<Contrafactual>;

/**
 * Candidatas = esperas largas del paquete; para cada una corre su contrafactual (cambio fijo por causa, corte-1.md §9 P7) con la misma
 * semilla y réplica, y devuelve como causa solo las confirmadas (más la conjunta si ninguna sola confirma y la conjunta sí).
 */
export type CausasConfirmadas = (t: Traza, mv: ModeloValidado, semilla: number, replica: number, camion: number, indice: number,
  contrafactual: (cambio: Contrafactual['cambio']) => Promise<Contrafactual>) => Promise<{ causas: Frase[]; contrafactuales: Contrafactual[] }>;

export interface AlmacenResultados {
  experimentos: Record<string, { resumen?: Partial<Record<KpiId, Resumen>>; comparacion?: Partial<Record<KpiId, Comparacion>>; prop?: Proporcion }>;
  trazas: Record<string, Traza>;
  modelo: Modelo;
}
export type MotivoFalla = 'sin-fuente' | 'valor-distinto' | 'signo-invertido' | 'diferencia-no-real' | 'fuente-inexistente';
export interface Verificacion { ok: boolean; fallas: { frase: number; afirmacion: number; motivo: MotivoFalla }[] }
export type VerificarFrases = (frases: Frase[], almacen: AlmacenResultados, trazaId?: string) => Verificacion;
