// hub/costos.ts · Andén simulador, corte 1 · P4 (el hub).
// Costos de la noche (corte-1.md §6.7 regla 1 y §6.9; diseño maestro §3.10). Se usa la hora PAGADA: las pausas y las faltas las
// modela el simulador, y la hora productiva las contaría dos veces. Las horas pagadas son max(fin − inicio, último paquete − inicio)
// por persona presente (con el retén presente, cubra o no a alguien).
//
// Motor 1.2.0 (hallazgo HUB-R02 de la revisión del 30-10-2026): dos cosas que abarataban la noche mala.
//  · Las faltas: el ausente no cobraba, así que con 25% de faltas la noche costaba 10% MENOS aunque terminaba 95 min más tarde. Ahora
//    cada ausente cobra FRACCION_AUSENTE_PAGADA del turno. SUPUESTO con fuente: el 49% de las ausencias es por enfermedad no laboral
//    (IDESA, 3.er trimestre de 2025; conocimiento/anden-simulador-2026-10/realismo-logistico.md §6.3), que en la Argentina se paga (Ley
//    de Contrato de Trabajo 20.744, art. 208, A VERIFICAR en la fuente primaria): 0,5 redondea hacia arriba esa mitad pagada.
//  · Las horas de más: lo que pasa del fin del turno se pagaba como hora simple. Ahora lleva RECARGO_HORA_EXTRA. SUPUESTO con fuente:
//    LCT art. 201, recargo del 50% en días comunes (100% sábados después de las 13, domingos y feriados), A VERIFICAR. El recargo
//    nocturno del art. 200 ya está en la hora de la plantilla (es costo total del mes ÷ horas contractuales, calculadora 3).
// Los dos son constantes del motor y no campos del modelo: el esquema anden.modelo/1 está congelado (integracion/CAMBIOS-CONTRATO.md
// §12 propone `costos.fraccionAusentePagada` y `costos.recargoHoraExtra` para el esquema siguiente).
import type { Ms } from '../contratos/tipos-base.ts';

const MS_POR_HORA = 3_600_000;

/** Fracción del turno que cobra una persona ausente (SUPUESTO; ver arriba). */
export const FRACCION_AUSENTE_PAGADA = 0.5;
/** Factor de la hora extra sobre la hora normal (SUPUESTO; ver arriba). */
export const RECARGO_HORA_EXTRA = 1.5;

/** Las horas pagadas de la noche, separadas: las del turno, las de más (con recargo) y las de los ausentes. */
export interface HorasPagadas {
  /** Horas-persona del turno (presentes × (fin − inicio)). */
  normales: number;
  /** Horas-persona después del fin del turno (presentes × (último paquete − fin)), que se pagan con recargo. */
  extra: number;
  /** Horas-persona pagadas a los ausentes (ausentes × turno × FRACCION_AUSENTE_PAGADA). */
  ausentes: number;
  /** El KPI horasPersonaPagadas: normales + extra + ausentes. */
  total: number;
}

/** Horas pagadas de la noche. `ultimoListo` < 0 si no se clasificó nada. */
export function horasPagadas(presentes: number, ausentes: number, inicio: Ms, fin: Ms, ultimoListo: Ms): HorasPagadas {
  const turno = Math.max(0, fin - inicio);
  const deMas = ultimoListo >= 0 ? Math.max(0, ultimoListo - Math.max(fin, inicio)) : 0;
  const normales = (presentes * turno) / MS_POR_HORA, extra = (presentes * deMas) / MS_POR_HORA;
  const aus = (ausentes * turno * FRACCION_AUSENTE_PAGADA) / MS_POR_HORA;
  return { normales, extra, ausentes: aus, total: normales + extra + aus };
}

/** Horas-persona pagadas de la noche (el KPI). `ultimoListo` < 0 si no se clasificó nada. */
export function horasPersonaPagadas(presentes: number, inicio: Ms, fin: Ms, ultimoListo: Ms, ausentes = 0): number {
  return horasPagadas(presentes, ausentes, inicio, fin, ultimoListo).total;
}

/** costoNoche = (normales + extra · RECARGO_HORA_EXTRA + ausentes) · horaPersona + fijoNoche. Con un número: horas a tarifa simple. */
export function costoNoche(horas: number | HorasPagadas, horaPersona: number, fijoNoche: number): number {
  const equivalentes = typeof horas === 'number' ? horas : horas.normales + horas.extra * RECARGO_HORA_EXTRA + horas.ausentes;
  return equivalentes * horaPersona + fijoNoche;
}

/** costoPorPaquete = costoNoche ÷ max(1, clasificados). */
export function costoPorPaquete(costo: number, clasificados: number): number {
  return costo / Math.max(1, clasificados);
}
