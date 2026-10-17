// contratos/escena.ts · CONGELADO. La escena viaja en el fragmento (#) del enlace: nunca llega a un servidor.
import type { Modelo, OpParche } from './modelo.ts';
import type { Receta } from './experimentos.ts';

/** Límites de toda entrada que llega por enlace, QR o galería (entrada no confiable). */
export const LIMITES_ENLACE = {
  maxCaracteres: 16000,
  maxBytesDescomprimidos: 262144,
  maxProfundidadJson: 32,
  maxNodosJson: 20000,
  maxLargoTexto: 1000,
  maxPaquetesEstimados: 2000000,
  maxEventosEstimados: 50000000,
} as const;

export type Enlace =
  | { tipo: 'modelo'; modelo: Modelo; receta?: Receta }
  | { tipo: 'plantilla'; plantilla: { id: string; version: string }; parche: OpParche[]; receta?: Receta }
  | { tipo: 'receta'; receta: Receta };

export type ErrorEnlace =
  | 'formato' | 'muy-largo' | 'bomba' | 'json-invalido' | 'json-profundo' | 'esquema' | 'presupuesto'
  | 'plantilla-desconocida' | 'version-motor';

/** Devuelve la plantilla publicada (inmutable) o null si no existe. La inyecta la integración (plantillas del paquete del hub). */
export type ResolverPlantilla = (id: string, version: string) => Modelo | null;
export interface CodecEnlace {
  /** Fragmento sin '#': 'm=<deflate-raw base64url>&r=<receta>' · 't=<id>@<versión>&p=<parche>&r=…' · 'r=<receta>'. */
  codificar(e: Enlace): Promise<string>;
  decodificar(fragmento: string): Promise<{ ok: true; enlace: Enlace } | { ok: false; error: ErrorEnlace; detalle?: string }>;
}
export type CrearCodec = (resolver: ResolverPlantilla) => CodecEnlace;
/** JSON canónico: claves ordenadas por código de unidad UTF-16, sin espacios, números con JSON.stringify. */
export type JsonCanonico = (x: unknown) => string;
/** SHA-256 (crypto.subtle) del JSON canónico, primeros 16 caracteres hex. */
export type HuellaModelo = (m: Modelo) => Promise<string>;
/** Aplica un parche RFC 6902 (add, remove, replace, test) sin modificar el original; lanza si un 'test' falla. */
export type AplicarParche = (doc: Modelo, ops: OpParche[]) => Modelo;
