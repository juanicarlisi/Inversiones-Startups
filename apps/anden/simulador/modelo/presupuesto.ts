// modelo/presupuesto.ts · P3 · Presupuesto de cómputo estimado ANTES de correr (§9, P3): para rechazar un enlace que colgaría el
// teléfono de quien lo abre. paquetes = Σ nominales × (1 + 4 · cv del pronóstico) (el factor del día a 4 desvíos);
// eventos ≈ paquetes × 14 + (horizonte ÷ tick), con horizonte = fin + 8 h − inicio (§6.7, regla 1) y tick el paso del lazo.
import type { EstimarPresupuesto, Modelo } from '../contratos/modelo.ts';
import { aMs, horaASeg } from '../contratos/tipos-base.ts';
import { numeroDe, paquetesNominales, tickMs } from './f0.ts';

export const EVENTOS_POR_PAQUETE = 14;
export const HORAS_DE_GRACIA = 8;

/** Redondeo hacia arriba que no se deja engañar por el ruido de punto flotante (10560,000000000002 → 10560). */
function techo(x: number): number {
  return Math.ceil(x - 1e-9 * Math.max(1, Math.abs(x)));
}

export const estimarPresupuesto: EstimarPresupuesto = (m: Modelo): { paquetes: number; eventos: number } => {
  const cv = numeroDe(m, m.demanda.errorPronostico.cv);
  const paquetes = techo(paquetesNominales(m) * (1 + 4 * cv));
  const inicio = horaASeg(m.calendario.inicio);
  const fin = horaASeg(m.calendario.fin);
  const horizonteMs = aMs(fin + HORAS_DE_GRACIA * 3600 - inicio);
  const tick = tickMs(m.hub.sorter);
  const pasos = tick > 0 ? techo(horizonteMs / tick) : Infinity;
  return { paquetes, eventos: paquetes * EVENTOS_POR_PAQUETE + pasos };
};
