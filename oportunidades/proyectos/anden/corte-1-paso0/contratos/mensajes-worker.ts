// contratos/mensajes-worker.ts · CONGELADO. Protocolo entre la interfaz (o el planificador) y cada Worker de simulación.
import type { ModeloValidado } from './modelo.ts';
import type { ResultadoReplica } from './resultados.ts';
import type { NivelTraza, Traza } from './traza.ts';

export type MensajeAlTrabajador =
  | { tipo: 'correr'; id: string; mv: ModeloValidado; semilla: number; desde: number; hasta: number; traza: NivelTraza }
  | { tipo: 'cancelar'; id: string }
  | { tipo: 'sonda' };   // pide { tipo: 'listo' } con la versión del motor

export type MensajeDelTrabajador =
  | { tipo: 'listo'; motor: string }
  | { tipo: 'resultado'; id: string; resultado: ResultadoReplica; traza?: Traza }   // las columnas de la traza viajan transferidas
  | { tipo: 'fin'; id: string; completadas: number }
  | { tipo: 'error'; id: string; mensaje: string };
