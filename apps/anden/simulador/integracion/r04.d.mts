// integracion/r04.d.mts · Tipos de r04.mjs (para integracion/verificar.ts, que corre R04 antes de la batería).
import type { MedicionR04 } from './bateria/casos-r04.ts';

export declare const SALIDA_R04: string;
export declare function compararHuellas(node: Record<string, string>, otro: Record<string, string>): {
  comparadas: number; iguales: number; faltan: string[]; sobran: string[]; distintas: string[]; nDistintas: number; nFaltan: number; nSobran: number;
};
export declare function correrR04(o?: { salida?: string | null; log?: (s: string) => void }): Promise<MedicionR04>;
