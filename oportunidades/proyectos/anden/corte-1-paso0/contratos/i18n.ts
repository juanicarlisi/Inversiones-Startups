// contratos/i18n.ts · CONGELADO. Español primero; inglés con la misma estructura de claves. Ningún texto de interfaz va fijo en el código.
import type { Idioma } from './tipos-base.ts';
/** 'pantalla.elemento.detalle' → 'Texto con {variable}'. Las claves son las mismas en todos los idiomas (una prueba lo verifica). */
export type Diccionario = Record<string, string>;
export type Traducir = (clave: string, vars?: Record<string, string | number>) => string;
export interface Formato {
  idioma: Idioma;
  numero(x: number, decimales?: number): string;       // es-AR: 1.234,5
  porcentaje(x: number, decimales?: number): string;   // x en 0–1
  moneda(x: number, moneda: 'ARS' | 'USD'): string;
  hora(ms: number): string;                            // HH:MM, módulo 24
  duracion(ms: number): string;                        // «1 h 05 min», «45 s»
}
