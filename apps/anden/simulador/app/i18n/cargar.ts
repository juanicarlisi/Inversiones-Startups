// app/i18n/cargar.ts · Andén simulador, corte 1 · P8 (interfaz).
// Los diccionarios como los usa la página: el español va en la primera carga y el inglés (≈ 63 KB de textos, ≈ 16 KB comprimido) se
// baja en un trozo aparte la primera vez que hace falta. La primera carga estaba en el 98% de su tope de §11 (hallazgo SEG-R6 de la
// revisión del 30-10-2026) y los arreglos de esa revisión la pasaron por encima: el idioma que no se usa no tiene por qué viajar.
import type { Diccionario } from '../../contratos/i18n.ts';
import { juntarDiccionarios } from './traducir.ts';
import { PARTES_ES } from './diccionario-es.ts';

/** El diccionario en español, completo (todas las claves de todos los paquetes). */
export function diccionarioEspanol(): Diccionario {
  return juntarDiccionarios(PARTES_ES);
}

/** El diccionario en inglés, desde su trozo (import dinámico: esbuild lo separa de la entrada). */
export async function cargarIngles(): Promise<Diccionario> {
  const { PARTES_EN } = await import('./diccionario-en.ts');
  return juntarDiccionarios(PARTES_EN);
}
