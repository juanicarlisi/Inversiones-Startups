// explicacion/indice.ts · Andén simulador, corte 1, P7 · Explicación y decisión.
// El porqué de cada paquete sin causas falsas, y las preguntas que cambian la decisión (corte-1.md §9, P7).
//
// Entrega del contrato (contratos/explicacion.ts y contratos/decision.ts):
//   esperasDe · armarBiografia · crearContrafactual(sim) · causasConfirmadas · verificarFrases · supuestosDe · tamizar · armarFormulario · planDeMedicion
// Extras (opcionales para quien integra):
//   candidatasDe · cambioDeCausa · fraseDeCausa · verificarAfirmacion · cifrasSinRespaldo · fraseDeMedicion · MENSAJE_FORMULARIO_LISTO · cierreDelFormulario ·
//   segundosPorObservacion · decisionesPosibles · ResultadoTamizadoConDuda (los campos que el tamizado agrega al contrato: enDuda, perdidaRango, peorCaso) ·
//   todasLasClaves · VARIABLES_POR_CLAVE · CAUSAS_AFIRMABLES · constantes de umbrales
// Textos: textos.es.json y textos.en.json (claves `explicacion.*`).
// Todo es determinista: sin azar, sin reloj. Las simulaciones las corre quien llama (simulador y variante se inyectan).
export { esperasDe, CAUSAS_AFIRMABLES, CAUSAS_DE_LA_TAXONOMIA } from './esperas.ts';
export { armarBiografia, ESPERA_MINIMA_MS } from './biografia.ts';
export { crearContrafactual, MARGEN_DE_ADELANTO_MS } from './contrafactual.ts';
export {
  causasConfirmadas, candidatasDe, cambioDeCausa, fraseDeCausa, UMBRAL_ESPERA_MS, UMBRAL_FRACCION_EN_HUB, MAX_CANDIDATAS, MAX_CAUSAS_CONJUNTAS,
} from './causas.ts';
export type { Candidata, ItemDeCausa } from './causas.ts';
export { verificarFrases, verificarAfirmacion, cifrasSinRespaldo, esFraseControlada, PREFIJOS_CONTROLADOS } from './verificador.ts';
export { supuestosDe, tamizar, decisionesPosibles } from './tamizado.ts';
export type { ResultadoTamizadoConDuda } from './tamizado.ts';
export {
  armarFormulario, cierreDelFormulario, segundosPorObservacion, MENSAJE_FORMULARIO_LISTO, MENSAJE_FORMULARIO_NINGUNA_CUMPLE, MENSAJE_FORMULARIO_EN_DUDA,
  SEGUNDOS_DE_ANOTACION,
} from './formulario.ts';
export type { CierreDelFormulario } from './formulario.ts';
export { planDeMedicion, fraseDeMedicion, Z_95, ERROR_RELATIVO_POR_DEFECTO, CV_POR_DEFECTO } from './medicion.ts';
export { todasLasClaves, VARIABLES_POR_CLAVE, tipoDeCausa, TIPOS_DE_CAUSA } from './frases.ts';
export type { TipoDeCausa } from './frases.ts';
export { valorCentral, cvDe, parcheDeValor } from './parametros.ts';
