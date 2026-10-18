// app/i18n/diccionarios.ts · Andén simulador, corte 1 · P8 (interfaz).
// Junta los textos.<idioma>.json de todos los paquetes con interfaz (corte-1.md §1.6 y §9 P8). Es el único archivo de app/ que lee algo
// de otras carpetas, y solo lee datos (JSON de textos), nunca código (ver NOTAS-CONTRATO.md §2). Si un paquete agrega un idioma o un
// prefijo, se suma acá.
import type { Diccionario } from '../../contratos/i18n.ts';
import type { Idioma } from '../../contratos/tipos-base.ts';
import { juntarDiccionarios, type ParteDiccionario } from './traducir.ts';
import appEs from './textos.es.json' with { type: 'json' };
import appEn from './textos.en.json' with { type: 'json' };
import escenaEs from '../../escena/textos.es.json' with { type: 'json' };
import escenaEn from '../../escena/textos.en.json' with { type: 'json' };
import explicacionEs from '../../explicacion/textos.es.json' with { type: 'json' };
import explicacionEn from '../../explicacion/textos.en.json' with { type: 'json' };
import modeloEs from '../../modelo/textos.es.json' with { type: 'json' };
import modeloEn from '../../modelo/textos.en.json' with { type: 'json' };
import experimentosEs from '../../experimentos/textos.es.json' with { type: 'json' };
import experimentosEn from '../../experimentos/textos.en.json' with { type: 'json' };

/** Las partes de cada idioma, en orden fijo (la interfaz primero). */
export const PARTES: Record<Idioma, ParteDiccionario[]> = {
  es: [
    { paquete: 'app', prefijo: 'app.', textos: appEs as Diccionario },
    { paquete: 'escena', prefijo: 'escena.', textos: escenaEs as Diccionario },
    { paquete: 'explicacion', prefijo: 'explicacion.', textos: explicacionEs as Diccionario },
    { paquete: 'modelo', prefijo: 'modelo.', textos: modeloEs as Diccionario },
    { paquete: 'experimentos', prefijo: 'experimentos.', textos: experimentosEs as Diccionario },
  ],
  en: [
    { paquete: 'app', prefijo: 'app.', textos: appEn as Diccionario },
    { paquete: 'escena', prefijo: 'escena.', textos: escenaEn as Diccionario },
    { paquete: 'explicacion', prefijo: 'explicacion.', textos: explicacionEn as Diccionario },
    { paquete: 'modelo', prefijo: 'modelo.', textos: modeloEn as Diccionario },
    { paquete: 'experimentos', prefijo: 'experimentos.', textos: experimentosEn as Diccionario },
  ],
};

/** Diccionario completo de cada idioma. Lanza al importar si dos paquetes comparten una clave o una clave no lleva su prefijo. */
export function diccionariosDeTodos(): Record<Idioma, Diccionario> {
  return { es: juntarDiccionarios(PARTES.es), en: juntarDiccionarios(PARTES.en) };
}

/** Solo los textos propios de la interfaz (para las pruebas de claves de app/). */
export const TEXTOS_APP: Record<Idioma, Diccionario> = { es: appEs as Diccionario, en: appEn as Diccionario };
