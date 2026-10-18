// modelo/presupuesto.ts · P3 · Presupuesto de cómputo estimado ANTES de correr (§9, P3): para rechazar un enlace que colgaría el
// teléfono de quien lo abre. paquetes = Σ nominales × (1 + 4 · cv del pronóstico) (el factor del día a 4 desvíos);
// eventos ≈ paquetes × 14 + (horizonte ÷ tick), con horizonte = fin + 8 h − inicio (§6.7, regla 1) y tick el paso del lazo.
//
// Además de esos dos números (que son los de la especificación y no cambian), el compilador pone dos cotas de seguridad que la
// especificación no nombra y que el paquete del hub necesita para no reventar (NOTAS-CONTRATO.md §8):
//   · lugaresDeMemoria: cuántos lugares de arreglo tipado pide el modelo (bandejas del lazo, lugares de la acumulación, capacidad de las
//     rampas, playa, personas). Un `acumulacion.largo` de 1e12 es un número válido y pediría terabytes.
//   · eventosRecurrentes: pausas y micro-paradas, que no dependen de los paquetes (una pausa «cada 0,002 s» son millones de eventos).
import type { EstimarPresupuesto, Modelo } from '../contratos/modelo.ts';
import { aMs, horaASeg } from '../contratos/tipos-base.ts';
import { bandejasLazo, distribucionDe, media, numeroDe, paquetesNominales, tickMs } from './f0.ts';

export const EVENTOS_POR_PAQUETE = 14;
export const HORAS_DE_GRACIA = 8;
/** Tope de lugares de memoria que puede pedir un modelo (cotas de seguridad; el hub grande de la especificación pide ~2.000). */
export const MAX_LUGARES_MEMORIA = 2_000_000;

/**
 * Redondeo hacia arriba que no se deja engañar por el ruido de punto flotante (10560,000000000002 → 10560). Un valor que ya no
 * es finito se devuelve tal cual: Infinity − Infinity es NaN, y un NaN pasaría por debajo de cualquier tope (`NaN > max` es falso).
 */
function techo(x: number): number {
  if (!Number.isFinite(x)) return x;
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

/**
 * Lugares de arreglo tipado que pide el modelo: bandejas del lazo (T = round(largo ÷ paso)), lugares de la acumulación
 * (floor(largo ÷ paso)), capacidad de todas las rampas, playa y personas de todos los roles.
 */
export function lugaresDeMemoria(m: Modelo): number {
  const h = m.hub;
  let n = bandejasLazo(h.sorter) + Math.floor(h.acumulacion.largo / h.acumulacion.paso + 1e-9) + h.playa.capacidad;
  for (const r of h.rampas) n += r.capacidad;
  for (const a of h.andenes) n += a.personas;
  const p = m.personas;
  n += h.induccion.puestos.length + p.induccion.reten + p.rampa.cantidad + p.excepcion.cantidad;
  return n;
}

/**
 * Eventos que no dependen de los paquetes: el inicio y el fin de cada pausa de cada persona de inducción (activas + retén) y de
 * rampa, y el inicio y el fin de cada micro-parada del lazo. Infinity si el ciclo de paradas no avanza.
 */
export function eventosRecurrentes(m: Modelo): number {
  const inicio = horaASeg(m.calendario.inicio);
  const fin = horaASeg(m.calendario.fin);
  const turno = Math.max(0, fin - inicio);
  let n = 0;
  const pi = m.personas.induccion;
  const pr = m.personas.rampa;
  const pausas = (personas: number, cada: number, primera: number) => personas * 2 * Math.max(0, techo((turno - primera) / cada));
  n += pausas(pi.puestosActivos + pi.reten, pi.pausas.cada, pi.pausas.primera);
  n += pausas(pr.cantidad, pr.pausas.cada, pr.pausas.primera);
  if (m.hub.sorter.paradas.activas) {
    const ciclo = media(distribucionDe(m, m.hub.sorter.paradas.entre)) + media(distribucionDe(m, m.hub.sorter.paradas.duracion));
    const horizonte = turno + HORAS_DE_GRACIA * 3600;
    n += ciclo > 0 ? 2 * techo(horizonte / ciclo) : Infinity;
  }
  return n;
}
