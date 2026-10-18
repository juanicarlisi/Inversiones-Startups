// nucleo/azar/distribuciones.ts · Las 11 distribuciones de contratos/azar.ts con las fórmulas exactas de corte-1.md §6.6.
//
// Regla de oro: cada distribución consume SIEMPRE los mismos uniformes de su dirección (CONSUMO): 0, 1, …, consumo − 1. Es lo que
// hace que dos escenarios compartan la suerte (números aleatorios comunes). Las operaciones de punto flotante van en el mismo orden
// que la referencia de contratos/ (Anexo B), para que el núcleo dé la misma huella bit a bit (prueba R08).
import type { Direccion, Distribucion } from '../../contratos/azar.ts';
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';

/** El i-ésimo uniforme en (0, 1) de una dirección. */
export type FuenteUniformes = (d: Direccion, i: number) => number;
export type Sorteador = (dist: Distribucion, d: Direccion) => number;

/** Erlang k usa los uniformes 0…k−1; el sub-bloque de Philox tiene 8 bits (256 bloques de 2 uniformes por dirección). */
export const ERLANG_K_MAX = 512;

const DOS_PI = 2 * Math.PI;

/** Arma el sorteador sobre una fuente de uniformes y una matemática (en el núcleo: la de Philox y `det`). */
export function crearSorteador(uniforme: FuenteUniformes, mat: MatematicaDeterminista): Sorteador {
  const { log, exp, sqrt, cos } = mat;
  // Box-Muller sin caché: siempre los uniformes 0 y 1.
  const normalEstandar = (d: Direccion): number => sqrt(-2 * log(uniforme(d, 0))) * cos(DOS_PI * uniforme(d, 1));
  // La lognormal es la distribución más usada del hub: se recuerdan sus dos constantes para la última (media, cv).
  // Es una caché por valor, no por objeto: con los mismos números da exactamente las mismas constantes.
  let lnMedia = NaN, lnCv = NaN, lnBase = 0, lnRaiz = 0;

  return (x: Distribucion, d: Direccion): number => {
    switch (x.tipo) {
      case 'fija':
        return x.valor;
      case 'uniforme':
        return x.min + (x.max - x.min) * uniforme(d, 0);
      case 'exponencial':
        return -x.media * log(uniforme(d, 0));
      case 'triangular': {
        const u = uniforme(d, 0), f = (x.moda - x.min) / (x.max - x.min);
        return u < f
          ? x.min + sqrt(u * (x.max - x.min) * (x.moda - x.min))
          : x.max - sqrt((1 - u) * (x.max - x.min) * (x.max - x.moda));
      }
      case 'normal': {
        const v = x.media + x.desvio * normalEstandar(d);
        return Math.min(x.max ?? Infinity, Math.max(x.min ?? -Infinity, v));
      }
      case 'lognormal': {
        if (x.media !== lnMedia || x.cv !== lnCv) {
          const s2 = log(1 + x.cv * x.cv);
          lnBase = log(x.media) - s2 / 2;
          lnRaiz = sqrt(s2);
          lnMedia = x.media;
          lnCv = x.cv;
        }
        return exp(lnBase + lnRaiz * normalEstandar(d));
      }
      case 'erlang': {
        const k = x.k;
        if (!Number.isInteger(k) || k < 1 || k > ERLANG_K_MAX) {
          throw new RangeError(`erlang: se esperaba k entero entre 1 y ${ERLANG_K_MAX} y se recibió ${k}`);
        }
        let s = 0;
        for (let i = 0; i < k; i++) s += log(uniforme(d, i));
        return -(x.media / k) * s;
      }
      case 'weibull':
        return x.escala * exp(log(-log(uniforme(d, 0))) / x.forma);
      case 'bernoulli':
        return uniforme(d, 0) < x.p ? 1 : 0;
      case 'discreta': {
        const valores = x.valores, pesos = x.pesos, n = valores.length;
        if (n === 0 || pesos.length !== n) {
          throw new RangeError(`discreta: se esperaban valores y pesos del mismo largo (≥ 1) y llegaron ${n} valores y ${pesos.length} pesos`);
        }
        const u = uniforme(d, 0);
        let total = 0;
        for (let i = 0; i < n; i++) total += pesos[i];
        // Búsqueda lineal con la suma acumulada en el mismo orden que la referencia (Σ pesoⱼ/total, término a término).
        let acumulada = 0;
        for (let i = 0; i < n; i++) {
          acumulada += pesos[i] / total;
          if (u <= acumulada) return valores[i];
        }
        return valores[n - 1];
      }
      case 'empirica': {
        const v = x.valores, n = v.length;
        if (n === 0) throw new RangeError('empirica: se esperaba al menos un valor y llegó una lista vacía');
        const pos = uniforme(d, 0) * (n - 1), i = Math.floor(pos);
        return i >= n - 1 ? v[n - 1] : v[i] + (pos - i) * (v[i + 1] - v[i]);
      }
      default: {
        const tipo = (x as { tipo: unknown }).tipo;
        throw new TypeError(`distribución desconocida: se esperaba uno de los 11 tipos de contratos/azar.ts y llegó «${String(tipo)}»`);
      }
    }
  };
}
