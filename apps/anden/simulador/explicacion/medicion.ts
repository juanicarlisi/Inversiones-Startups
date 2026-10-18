// explicacion/medicion.ts · Andén simulador, corte 1, P7 · Plan de medición (corte-1.md §9, P7, «Formulario»).
// Cuando el usuario no sabe un valor, se le ofrece medirlo: n = ⌈(1,96 · cv ÷ ε)²⌉ observaciones para estimar la media con error
// relativo ε al 95%, y minutos = ⌈n · segundos por observación ÷ 60⌉ con el cronómetro del teléfono.
// Con cv = 0,6 y ε = 0,15 da 62 observaciones.
import type { Frase } from '../contratos/explicacion.ts';
import type { PlanDeMedicion, PlanMedicion } from '../contratos/decision.ts';
import { crearFrase } from './frases.ts';
import { redondear } from './unidades.ts';

/** Cuantil normal del 97,5% redondeado como en la especificación. */
export const Z_95 = 1.96;
/** Error relativo con que se pide medir (15% de la media). */
export const ERROR_RELATIVO_POR_DEFECTO = 0.15;
/** Coeficiente de variación que se supone si la distribución del parámetro no trae uno. */
export const CV_POR_DEFECTO = 0.5;
// el techo de un entero exacto no puede subir por el error de la coma flotante: 61,00000000001 no pide 62
const TOLERANCIA = 1e-9;

export const planDeMedicion: PlanDeMedicion = (parametro, cv, errorRelativo, segundosPorObservacion): PlanMedicion => {
  if (!Number.isFinite(cv) || cv < 0) throw new Error(`planDeMedicion(${parametro}): se esperaba un coeficiente de variación finito y no negativo y llegó ${cv}`);
  if (!Number.isFinite(errorRelativo) || !(errorRelativo > 0)) throw new Error(`planDeMedicion(${parametro}): se esperaba un error relativo mayor que 0 y llegó ${errorRelativo}`);
  if (!Number.isFinite(segundosPorObservacion) || !(segundosPorObservacion > 0)) {
    throw new Error(`planDeMedicion(${parametro}): se esperaban segundos por observación mayores que 0 y llegó ${segundosPorObservacion}`);
  }
  const x = (Z_95 * cv) / errorRelativo;
  const observaciones = Math.max(1, Math.ceil(x * x - TOLERANCIA));
  const minutos = Math.ceil((observaciones * segundosPorObservacion) / 60 - TOLERANCIA);
  return { parametro, cv, errorRelativo, observaciones, minutos };
};

/** «Medí N veces (unos M min con el cronómetro del teléfono)…» como frase de texto traducible. */
export function fraseDeMedicion(plan: PlanMedicion): Frase {
  return crearFrase('explicacion.medicion.resumen', {
    observaciones: plan.observaciones, minutos: plan.minutos, error: redondear(plan.errorRelativo * 100, 1),
  }, []);
}
