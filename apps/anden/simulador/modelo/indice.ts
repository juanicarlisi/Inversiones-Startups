// modelo/indice.ts · P3 · Modelo y enlace: la entrega del paquete (corte-1.md §9, P3).
// Objetivo del paquete: que ningún número se calcule con un modelo inválido y que ningún enlace hostil cuelgue un teléfono.
//
//   compilar          valida (esquema, referencias, rangos, geometría del lazo, dotación, horas, presupuesto), normaliza y calcula
//                     el borrador F0 y la huella; nunca lanza: devuelve diagnósticos con su JSON Pointer y su clave de texto.
//   crearVariante     parche RFC 6902 + compilación nueva: escenarios, valores de la decisión y contrafactuales.
//   calcularF0        borrador analítico (capacidades medias, sin azar): una alarma, nunca una respuesta.
//   estimarPresupuesto  paquetes y eventos estimados ANTES de correr.
//   jsonCanonico / huellaModelo / aplicarParche   las tres piezas del contrato de la escena (contratos/escena.ts).
//   crearCodec        el enlace endurecido (fragmento #): modelo completo, plantilla + parche, o solo receta.
//   anonimizar        para compartir sin filtrar nombres, volúmenes ni costos exactos.
//
// Los textos de los diagnósticos (`modelo.diag.*`) y de los errores del enlace (`modelo.enlace.*`) están en textos.es.json y
// textos.en.json, con las mismas claves (lo verifica pruebas/textos.test.ts).
export { compilar, revisar } from './compilar.ts';
export type { Revision } from './compilar.ts';
export { crearVariante, esErrorVariante } from './variante.ts';
export type { ErrorVariante } from './variante.ts';
export { calcularF0 } from './f0.ts';
export { estimarPresupuesto, EVENTOS_POR_PAQUETE, HORAS_DE_GRACIA } from './presupuesto.ts';
export { jsonCanonico } from './canonico.ts';
export { huellaModelo } from './huella.ts';
export { aplicarParche, aplicarParcheJson, ErrorParche } from './parches.ts';
export { crearCodec, codificarReceta, decodificarReceta, MAX_ESCENARIOS_RECETA } from './enlace.ts';
export type { OpcionesCodec } from './enlace.ts';
export { anonimizar, factorVolumen, redondear2Cifras } from './anonimizar.ts';
// Para el modo ingeniero (JSON escrito a mano con validación en vivo) y para quien lea un archivo: parseo con los mismos límites que el enlace.
export { parsearJsonSeguro, claveDiag, MAX_DIAGNOSTICOS, MAX_ESCENARIOS } from './esquema.ts';
export { CONTROLES, MAX_VALORES_DECISION } from './chequeos.ts';
