// explicacion/frases.ts · Andén simulador, corte 1, P7 · Registro de claves de texto y constructores de frases con afirmaciones.
// Toda cifra que dice el explicador sale de acá con su fuente: `afirmarTramo` lee el valor de la traza, lo redondea con la misma función
// que usa el verificador y devuelve la afirmación; la variable de la frase es ese mismo valor. Las claves y sus variables están en un
// único registro (`VARIABLES_POR_CLAVE`): `crearFrase` lanza si una frase no cumple con él, y las pruebas lo cruzan con textos.es/en.json.
import { Causa } from '../contratos/traza.ts';
import type { Traza } from '../contratos/traza.ts';
import type { Afirmacion, Frase } from '../contratos/explicacion.ts';
import { segAHora } from '../contratos/tipos-base.ts';
import { enUnidad, redondear } from './unidades.ts';

// 'descarga': la espera dentro del camión (andenes ocupados o cola de descarga, HUB-R01). No sale de una Causa de un tramo del paquete
// (el paquete nace al empezar su descarga): la arma causas.ts › esperaEnCamion con los tramos del camión.
export const TIPOS_DE_CAUSA = ['pausa', 'ausencia', 'rampa_llena', 'falla', 'fila', 'bloqueo', 'no_leido', 'cierre_jaula', 'descarga'] as const;
export type TipoDeCausa = (typeof TIPOS_DE_CAUSA)[number];

const TIPO_DE_CAUSA: Partial<Record<number, TipoDeCausa>> = {
  [Causa.PAUSA]: 'pausa', [Causa.AUSENCIA]: 'ausencia', [Causa.RAMPA_LLENA]: 'rampa_llena', [Causa.FALLA]: 'falla',
  [Causa.FILA]: 'fila', [Causa.BLOQUEO]: 'bloqueo', [Causa.NO_LEIDO]: 'no_leido', [Causa.CIERRE_JAULA]: 'cierre_jaula',
};
/** Nombre del tipo de una causa afirmable; `null` para las que solo se describen (falta de bandeja, persona ocupada, andén ocupado…). */
export function tipoDeCausa(c: number): TipoDeCausa | null {
  return TIPO_DE_CAUSA[c] ?? null;
}

const VARS_CAUSA: Record<TipoDeCausa, readonly string[]> = {
  pausa: ['espera', 'rampa', 'persona'], ausencia: ['espera', 'rampa', 'persona'], cierre_jaula: ['espera', 'rampa', 'persona'],
  rampa_llena: ['vueltas', 'rampa'], falla: ['espera'], fila: ['espera'], bloqueo: ['espera'], no_leido: ['espera'],
  descarga: ['camion', 'llegada', 'inicio'],
};
const VARS_CAMBIO: Record<TipoDeCausa, readonly string[]> = {
  pausa: [], ausencia: ['reten'], rampa_llena: ['rampa', 'capacidad'], falla: [], fila: ['puestos'], bloqueo: ['puestos'], no_leido: [], cierre_jaula: [],
  descarga: [],
};

function armarRegistro(): Record<string, readonly string[]> {
  const r: Record<string, readonly string[]> = {
    // títulos de biografía
    'explicacion.titulo.paquete': ['indice', 'camion', 'ruta', 'tamano'],
    'explicacion.titulo.camion': ['camion'],
    'explicacion.titulo.persona.induccion': ['persona'],
    'explicacion.titulo.persona.reten': ['persona'],
    'explicacion.titulo.persona.descarga': ['persona'],
    'explicacion.titulo.persona.rampa': ['persona'],
    'explicacion.titulo.persona.excepcion': ['persona'],
    'explicacion.titulo.rampa': ['rampa', 'ruta'],
    'explicacion.titulo.equipo': [],
    'explicacion.titulo.puesto': ['puesto'],
    // pasos de un paquete
    'explicacion.paso.descarga': ['camion', 'anden', 'hora'],
    'explicacion.paso.llego': ['camion', 'hora'],
    'explicacion.paso.llego.playa': ['camion', 'hora', 'min'],
    'explicacion.paso.descarga.bloqueo': ['anden', 'min'],
    'explicacion.paso.cinta': ['cinta'],
    'explicacion.paso.acumulacion': ['min'],
    'explicacion.paso.induccion': ['persona', 'puesto'],
    'explicacion.paso.espera_bandeja': ['min'],
    'explicacion.paso.espera_bandeja.falla': ['min'],
    'explicacion.paso.bandeja': ['min'],
    'explicacion.paso.vuelta': ['vuelta', 'rampa'],
    'explicacion.paso.vuelta.sin_rampa': ['vuelta'],
    'explicacion.paso.rampa.ocupada': ['min', 'rampa', 'persona'],
    'explicacion.paso.rampa.pausa': ['min', 'rampa', 'persona'],
    'explicacion.paso.rampa.ausencia': ['min', 'rampa', 'persona'],
    'explicacion.paso.rampa.cierre_jaula': ['min', 'rampa', 'persona'],
    'explicacion.paso.rampa.sin_persona': ['min', 'rampa'],
    'explicacion.paso.mano': ['persona'],
    'explicacion.paso.jaula.antes_del_corte': ['rampa', 'hora'],
    'explicacion.paso.jaula.despues_del_corte': ['rampa', 'hora'],
    'explicacion.paso.cola_manual.no_leido': ['min'],
    'explicacion.paso.cola_manual.rampa_llena': ['min'],
    'explicacion.paso.cola_manual.no_transportable': ['min'],
    'explicacion.paso.manual': ['persona', 'min'],
    'explicacion.paso.no_termino': [],
    // pasos de un camión, una persona, una rampa, el lazo
    'explicacion.paso.camion_espera': ['min'],
    'explicacion.paso.camion_anden': ['paquetes', 'anden', 'desde', 'hasta'],
    'explicacion.paso.persona_activa': ['desde', 'hasta'],
    'explicacion.paso.persona_pausa': ['min', 'hora'],
    'explicacion.paso.persona_ausente': [],
    'explicacion.paso.persona_libre': ['desde', 'hasta'],
    'explicacion.paso.rampa_llena': ['desde', 'hasta'],
    'explicacion.paso.rampa_llena.instante': ['desde'],
    'explicacion.paso.rampa_cierra_jaula': ['persona', 'hora', 'min'],
    'explicacion.paso.lazo_detenido': ['min', 'hora'],
    // causas confirmadas
    'explicacion.causa.conjunta': [],
    'explicacion.causa.conjunta.adelanto': [],
    'explicacion.cambio.conjunta': [],
    // formulario por decisión y plan de medición
    'explicacion.formulario.listo': [],
    'explicacion.formulario.ninguna_cumple': [],
    'explicacion.formulario.en_duda': [],
    'explicacion.pregunta.porque.puestos': ['medio', 'bajo', 'alto', 'n'],
    'explicacion.pregunta.porque.rampa': ['medio', 'bajo', 'alto', 'n'],
    'explicacion.pregunta.porque.reten': ['medio', 'bajo', 'alto', 'n'],
    'explicacion.pregunta.porque.generica': ['medio', 'bajo', 'alto', 'n'],
    'explicacion.pregunta.porque.puestos.uno': ['medio', 'bajo', 'alto', 'n'],
    'explicacion.pregunta.porque.rampa.uno': ['medio', 'bajo', 'alto', 'n'],
    'explicacion.pregunta.porque.reten.uno': ['medio', 'bajo', 'alto', 'n'],
    'explicacion.pregunta.porque.generica.uno': ['medio', 'bajo', 'alto', 'n'],
    'explicacion.pregunta.porque.sin_respuesta': ['medio', 'bajo', 'alto'],
    'explicacion.pregunta.porque.en_duda': ['medio', 'bajo', 'alto'],
    'explicacion.medicion.resumen': ['observaciones', 'minutos', 'error'],
    // motivos del verificador (modo ingeniero)
    'explicacion.verificador.motivo.sin-fuente': [],
    'explicacion.verificador.motivo.valor-distinto': [],
    'explicacion.verificador.motivo.signo-invertido': [],
    'explicacion.verificador.motivo.diferencia-no-real': [],
    'explicacion.verificador.motivo.fuente-inexistente': [],
  };
  for (const tipo of TIPOS_DE_CAUSA) {
    r[`explicacion.causa.${tipo}`] = VARS_CAUSA[tipo];
    r[`explicacion.causa.${tipo}.adelanto`] = VARS_CAUSA[tipo];
    r[`explicacion.causa.conjunta.${tipo}`] = VARS_CAUSA[tipo];
    r[`explicacion.cambio.${tipo}`] = VARS_CAMBIO[tipo];
  }
  return r;
}

/** Cada clave de texto que el paquete puede emitir y las variables exactas que lleva su frase. */
export const VARIABLES_POR_CLAVE: Readonly<Record<string, readonly string[]>> = armarRegistro();
export function todasLasClaves(): string[] {
  return Object.keys(VARIABLES_POR_CLAVE).sort();
}

/** Frase con su registro controlado: la clave tiene que existir y las variables tienen que ser exactamente las del registro. */
export function crearFrase(clave: string, vars: Record<string, string | number>, afirmaciones: Afirmacion[]): Frase {
  const esperadas = VARIABLES_POR_CLAVE[clave];
  if (!esperadas) throw new Error(`crearFrase: la clave «${clave}» no está en el registro de textos de explicacion/ (frases.ts)`);
  const llegaron = Object.keys(vars).sort();
  const debian = [...esperadas].sort();
  if (llegaron.join('|') !== debian.join('|')) {
    throw new Error(`crearFrase: «${clave}» se esperaba con las variables [${debian.join(', ')}] y llegaron [${llegaron.join(', ')}]`);
  }
  return { clave, vars, afirmaciones };
}

/** «HH:MM» (módulo 24) de un instante de la traza, en ms. */
export function horaDe(ms: number): string {
  return segAHora(Math.floor(ms / 1000));
}

export type CampoDeTraza = 'duracion' | 't0' | 't1' | 'a';

/** Valor (sin redondear) de un campo de un tramo, en la unidad pedida; `null` si la unidad no es de tiempo. */
export function valorDeTramo(t: Traza, tramo: number, campo: CampoDeTraza, unidad: string): number | null {
  if (campo === 'a') return t.tramos.a[tramo];
  const t0 = t.tramos.t0[tramo];
  const t1 = t.tramos.t1[tramo] === Infinity ? t.fin : t.tramos.t1[tramo];
  const ms = campo === 'duracion' ? t1 - t0 : campo === 't0' ? t0 : t1;
  return enUnidad(ms, unidad);
}

/** Afirmación sobre un campo de un tramo de la traza: el valor ya viene redondeado a `decimales`. */
export function afirmarTramo(t: Traza, tramo: number, campo: CampoDeTraza, unidad: string, decimales: number): Afirmacion {
  const bruto = valorDeTramo(t, tramo, campo, unidad);
  if (bruto === null) throw new Error(`afirmarTramo: la unidad «${unidad}» no es de tiempo (se esperaba ms, s, min, h u hora)`);
  return { valor: redondear(bruto, decimales), unidad, decimales, fuente: { tipo: 'traza', tramo, campo } };
}

/** Minutos de un tramo con un decimal (la unidad de casi todas las esperas). */
export function afirmarMinutos(t: Traza, tramo: number): Afirmacion {
  return afirmarTramo(t, tramo, 'duracion', 'min', 1);
}

/** Hora del día (minuto entero) de t0 o t1 de un tramo; la variable de la frase es `horaDe` del mismo instante. */
export function afirmarHora(t: Traza, tramo: number, campo: 't0' | 't1'): Afirmacion {
  return afirmarTramo(t, tramo, campo, 'hora', 0);
}

/** Texto de un elemento de una lista del catálogo, o un nombre de respaldo («P12») si la traza no lo trae. */
export function nombreDe(lista: readonly (string | { id: string })[] | undefined, i: number, respaldo: string): string {
  const x = lista?.[i];
  if (x === undefined) return `${respaldo}${i}`;
  return typeof x === 'string' ? x : x.id;
}
