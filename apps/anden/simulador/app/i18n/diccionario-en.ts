// app/i18n/diccionario-en.ts · Andén simulador, corte 1 · P8 (interfaz).
// Los textos en inglés de todos los paquetes con interfaz. No entran en la primera carga: la página los baja en un trozo aparte cuando
// el idioma es inglés (cargar.ts). Solo lee datos (JSON de textos), nunca código (NOTAS-CONTRATO.md §2).
import type { Diccionario } from '../../contratos/i18n.ts';
import type { ParteDiccionario } from './traducir.ts';
import appEn from './textos.en.json' with { type: 'json' };
import escenaEn from '../../escena/textos.en.json' with { type: 'json' };
import explicacionEn from '../../explicacion/textos.en.json' with { type: 'json' };
import modeloEn from '../../modelo/textos.en.json' with { type: 'json' };
import experimentosEn from '../../experimentos/textos.en.json' with { type: 'json' };

/** Las partes en inglés, en el mismo orden que las del español. */
export const PARTES_EN: ParteDiccionario[] = [
  { paquete: 'app', prefijo: 'app.', textos: appEn as Diccionario },
  { paquete: 'escena', prefijo: 'escena.', textos: escenaEn as Diccionario },
  { paquete: 'explicacion', prefijo: 'explicacion.', textos: explicacionEn as Diccionario },
  { paquete: 'modelo', prefijo: 'modelo.', textos: modeloEn as Diccionario },
  { paquete: 'experimentos', prefijo: 'experimentos.', textos: experimentosEn as Diccionario },
];
