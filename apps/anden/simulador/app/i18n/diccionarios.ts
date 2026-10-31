// app/i18n/diccionarios.ts · Andén simulador, corte 1 · P8 (interfaz).
// Junta los textos.<idioma>.json de todos los paquetes con interfaz (corte-1.md §1.6 y §9 P8): las partes de cada idioma están en
// diccionario-es.ts y diccionario-en.ts (solo datos, nunca código: NOTAS-CONTRATO.md §2). Este módulo trae los dos idiomas a la vez y es
// el de las pruebas; la página arranca con cargar.ts, que baja el inglés recién cuando hace falta. Si un paquete agrega un idioma o un
// prefijo, se suma en esos dos archivos.
import type { Diccionario } from '../../contratos/i18n.ts';
import type { Idioma } from '../../contratos/tipos-base.ts';
import { juntarDiccionarios, type ParteDiccionario } from './traducir.ts';
import { PARTES_ES } from './diccionario-es.ts';
import { PARTES_EN } from './diccionario-en.ts';

/** Las partes de cada idioma, en orden fijo (la interfaz primero). */
export const PARTES: Record<Idioma, ParteDiccionario[]> = { es: PARTES_ES, en: PARTES_EN };

/** Diccionario completo de cada idioma. Lanza si dos paquetes comparten una clave o una clave no lleva su prefijo. */
export function diccionariosDeTodos(): Record<Idioma, Diccionario> {
  return { es: juntarDiccionarios(PARTES.es), en: juntarDiccionarios(PARTES.en) };
}

/** Solo los textos propios de la interfaz (para las pruebas de claves de app/). */
export const TEXTOS_APP: Record<Idioma, Diccionario> = { es: PARTES_ES[0].textos, en: PARTES_EN[0].textos };
