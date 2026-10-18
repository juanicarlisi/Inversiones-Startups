// hub/costos.ts · Andén simulador, corte 1 · P4 (el hub).
// Costos de la noche (corte-1.md §6.7 regla 1 y §6.9; diseño maestro §3.10). Se usa la hora PAGADA: las pausas y las faltas las
// modela el simulador, y la hora productiva las contaría dos veces. Las horas pagadas son max(fin − inicio, último paquete − inicio)
// por persona presente (con el retén presente, cubra o no a alguien).
import type { Ms } from '../contratos/tipos-base.ts';

const MS_POR_HORA = 3_600_000;

/** Horas-persona pagadas de la noche. `ultimoListo` < 0 si no se clasificó nada. */
export function horasPersonaPagadas(presentes: number, inicio: Ms, fin: Ms, ultimoListo: Ms): number {
  const jornada = Math.max(fin - inicio, ultimoListo >= 0 ? ultimoListo - inicio : 0);
  return (presentes * jornada) / MS_POR_HORA;
}

/** costoNoche = horasPersonaPagadas · horaPersona + fijoNoche. */
export function costoNoche(horas: number, horaPersona: number, fijoNoche: number): number {
  return horas * horaPersona + fijoNoche;
}

/** costoPorPaquete = costoNoche ÷ max(1, clasificados). */
export function costoPorPaquete(costo: number, clasificados: number): number {
  return costo / Math.max(1, clasificados);
}
