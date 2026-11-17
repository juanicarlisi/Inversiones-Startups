// Métrica norte medida en el dispositivo, sin rastreo (producto.md §11): «semanas con plan vivo» = semanas en que
// la persona abrió su plan 3 días o más. Se guardan solo fechas (sin contenido) en el documento local.
// Sirve también para el criterio de salida del corte 0: «el fundador lo usa 4 semanas seguidas».

import { dn, isoDe, inicioSemana } from './fechas.js';

const TOPE_DIAS = 120;

/** Suma el día de hoy a la lista (sin repetir) y guarda solo los últimos 120 días distintos. */
export function registrarDia(dias = [], hoy) {
  const h = isoDe(hoy);
  if (dias.includes(h)) return dias;
  return [...dias, h].sort().slice(-TOPE_DIAS);
}

/**
 * Semanas (lunes a domingo) con 3 días de uso o más entre las últimas n, contando la actual.
 * Devuelve { vivas, de: n, seguidas } (seguidas = racha de semanas vivas que termina en la última semana cerrada
 * o en la actual si ya llegó a 3 días).
 */
export function semanasVivas(dias = [], hoy, n = 4) {
  const lunesHoy = inicioSemana(hoy);
  const porSemana = new Map();
  for (const d of dias) {
    const l = inicioSemana(dn(d));
    porSemana.set(l, (porSemana.get(l) || 0) + 1);
  }
  let vivas = 0;
  for (let i = 0; i < n; i++) if ((porSemana.get(lunesHoy - 7 * i) || 0) >= 3) vivas++;
  let seguidas = 0;
  let l = (porSemana.get(lunesHoy) || 0) >= 3 ? lunesHoy : lunesHoy - 7;
  while ((porSemana.get(l) || 0) >= 3) {
    seguidas++;
    l -= 7;
  }
  return { vivas, de: n, seguidas };
}
