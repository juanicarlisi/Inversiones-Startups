// contratos/referencias.ts · CONGELADO (código literal, lo usan todos los paquetes).
import type { Distribucion } from './azar.ts';
import type { Dist, Modelo, ModeloValidado, Num, Parametro, Ref } from './modelo.ts';

export function esRef(x: unknown): x is Ref {
  return typeof x === 'string' && x.startsWith('@');
}
export function parametro(m: Modelo, r: Ref): Parametro {
  const p = m.parametros[r.slice(1)];
  if (!p) throw new Error(`parámetro inexistente: ${r}`);
  return p;
}
/** Valor numérico de un campo Num. Un parámetro con distribución 'fija' cuenta como número. */
export function numero(m: Modelo, x: Num): number {
  if (!esRef(x)) return x;
  const v = parametro(m, x).valor;
  if (typeof v === 'number') return v;
  if (v.tipo === 'fija') return v.valor;
  throw new Error(`${x} es una distribución y se pidió un número`);
}
/** Distribución de un campo Dist. Un parámetro numérico cuenta como distribución 'fija'. */
export function distribucion(m: Modelo, x: Dist): Distribucion {
  if (!esRef(x)) return x;
  const v = parametro(m, x).valor;
  return typeof v === 'number' ? { tipo: 'fija', valor: v } : v;
}
/** SOLO PARA PRUEBAS: envuelve un modelo sin pasar por el compilador (huella '0000000000000000', sin diagnósticos). */
export function validadoSinChequeos(m: Modelo): ModeloValidado {
  return {
    modelo: m, huella: '0000000000000000', diagnosticos: [],
    f0: { llegadaMediaPorHora: 0, capacidadDescargaPorHora: 0, capacidadInduccionPorHora: 0, capacidadSorterTeoricaPorHora: 0,
      capacidadRampasPorHora: 0, cuello: 'induccion', utilizacion: { descarga: 0, induccion: 0, sorter: 0, rampas: 0 }, finEstimado: '00:00' },
  };
}
