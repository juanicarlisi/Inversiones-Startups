// app/i18n/diccionario-es.ts · Andén simulador, corte 1 · P8 (interfaz).
// Los textos en español de todos los paquetes con interfaz: son los que baja la primera carga. El inglés va en diccionario-en.ts, en un
// trozo aparte que se baja al elegirlo (cargar.ts). Solo lee datos (JSON de textos), nunca código (NOTAS-CONTRATO.md §2).
import type { Diccionario } from '../../contratos/i18n.ts';
import type { ParteDiccionario } from './traducir.ts';
import appEs from './textos.es.json' with { type: 'json' };
import escenaEs from '../../escena/textos.es.json' with { type: 'json' };
import explicacionEs from '../../explicacion/textos.es.json' with { type: 'json' };
import modeloEs from '../../modelo/textos.es.json' with { type: 'json' };
import experimentosEs from '../../experimentos/textos.es.json' with { type: 'json' };

/** Las partes en español, en orden fijo (la interfaz primero). */
export const PARTES_ES: ParteDiccionario[] = [
  { paquete: 'app', prefijo: 'app.', textos: appEs as Diccionario },
  { paquete: 'escena', prefijo: 'escena.', textos: escenaEs as Diccionario },
  { paquete: 'explicacion', prefijo: 'explicacion.', textos: explicacionEs as Diccionario },
  { paquete: 'modelo', prefijo: 'modelo.', textos: modeloEs as Diccionario },
  { paquete: 'experimentos', prefijo: 'experimentos.', textos: experimentosEs as Diccionario },
];
