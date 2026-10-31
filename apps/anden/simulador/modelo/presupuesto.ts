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
 * Tramos de traza por paquete, para estimar la película antes de correr (hallazgo SEG-01 de la revisión del 19-10-2026). MEDIDO el
 * 20-10-2026 con el motor 1.1.0 en 20 noches: 11,5 en hub-chico@1.0.0 y 11,6 en hub-lazo-noche@1.0.0, 11,9 la noche más cargada
 * (descarga, cinta, acumulación, inducción, bandeja, rampa, mano, jaula y las tareas de las personas); 11,0 en el enlace del hallazgo.
 * Los paquetes estimados ya van a 4 desvíos del pronóstico, así que 12 queda del lado seguro.
 */
export const TRAMOS_POR_PAQUETE = 12;
/**
 * Tope de tramos de la película de una noche (≈ 35 bytes por tramo: ~70 MB; con la pantalla dividida de «¿y si…?» son dos noches,
 * dentro de los 150 MB de §11). La plantilla grande estima ~380.000. Un enlace de 7.950 caracteres que pedía 11,5 millones de tramos
 * (400 MB por noche) pasaba los topes de paquetes y eventos y llevaba la pestaña a 1,2 GB; con este tope se rechaza antes de correr.
 */
export const MAX_TRAMOS_ESTIMADOS = 2_000_000;

/**
 * Tramos de la película por persona de andén y por camión (hallazgo SEG-R3 de la revisión del 30-10-2026). Las personas de descarga
 * abren tramos por camión que no dependen de los paquetes: con `andenes[0].personas = 1.900.000` el modelo estimaba 126.720 tramos y la
 * película tenía 11,5 millones. MEDIDO el 30-10-2026 (hub-chico@1.0.0, motor 1.1.0, todas las personas en un andén): 6 tramos por
 * persona con 4 camiones en ese andén, o sea 1,5 por persona y camión; 2 queda del lado seguro, y se cuentan TODOS los camiones de la
 * noche (no se sabe de antemano a qué andén va cada uno).
 */
export const TRAMOS_POR_PERSONA_ANDEN_Y_CAMION = 2;
/** Tramos fijos por persona de inducción, rampa y excepción (llegar, trabajar, terminar), además de los de sus pausas. */
export const TRAMOS_POR_PERSONA = 4;

/** Tramos que no dependen de los paquetes: personas de descarga por camión, el resto de las personas y sus pausas. */
export function tramosDePersonas(m: Modelo): number {
  const c = m.demanda.camiones;
  const camiones = Array.isArray(c) ? c.length : c.cantidad;
  let deAnden = 0;
  for (const a of m.hub.andenes) deAnden += a.personas;
  const pi = m.personas.induccion, pr = m.personas.rampa;
  const otras = pi.puestosActivos + pi.temporarios + pi.reten + pr.cantidad + m.personas.excepcion.cantidad;
  const turno = Math.max(0, horaASeg(m.calendario.fin) - horaASeg(m.calendario.inicio));
  const pausas = (personas: number, cada: number, primera: number) => (cada > 0 ? personas * Math.max(0, techo((turno - primera) / cada)) : 0);
  return deAnden * camiones * TRAMOS_POR_PERSONA_ANDEN_Y_CAMION + otras * TRAMOS_POR_PERSONA
    + pausas(pi.puestosActivos + pi.reten, pi.pausas.cada, pi.pausas.primera) + pausas(pr.cantidad, pr.pausas.cada, pr.pausas.primera);
}

/** Tramos estimados de la película de una noche: paquetes estimados × TRAMOS_POR_PAQUETE más los de las personas (tramosDePersonas). */
export function tramosEstimados(m: Modelo): number {
  return estimarPresupuesto(m).paquetes * TRAMOS_POR_PAQUETE + tramosDePersonas(m);
}

/**
 * Bandejas del lazo que la escena puede dibujar en cada cuadro (hallazgo SEG-R2 de la revisión del 30-10-2026). La memoria aceptaba
 * hasta 2 millones de lugares y cada bandeja es una figura por cuadro: `recta = 300.000` (un millón de bandejas) pasaba el presupuesto
 * y dejaba la película a menos de 1 cuadro por segundo. Las plantillas tienen 142 y 300 bandejas; un sorter real grande, 1.000 a 3.000.
 */
export const MAX_BANDEJAS_DIBUJO = 5000;

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
