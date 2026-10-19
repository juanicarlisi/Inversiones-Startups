// integracion/construir.d.mts · Tipos de construir.mjs (para las pruebas en TypeScript que construyen en una carpeta temporal).
import type { Comprobante } from '../contratos/experimentos.ts';

export declare const RAIZ: string;
export declare const DIST: string;
export declare const OBJETIVO: string;

export interface MetaArchivo { inputs: Record<string, { bytesInOutput: number }>; bytes?: number }
export interface Metafile {
  inputs: Record<string, { bytes: number; imports: { path: string; kind: string; external?: boolean }[] }>;
  outputs: Record<string, MetaArchivo>;
}
export interface Construido {
  destino: string;
  archivos: string[];
  version: string;
  /** null en el plan B (sin esbuild). */
  metafile: Metafile | null;
  advertencias: string[];
  motor: Comprobante['motor'] | null;
  plan: 'esbuild' | 'strip-types';
}

export declare function motorVerificado(): Comprobante['motor'] | null;
export declare function construir(o?: { destino?: string; sinEsbuildForzado?: boolean }): Promise<Construido>;
