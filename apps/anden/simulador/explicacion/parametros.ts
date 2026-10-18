// explicacion/parametros.ts · Andén simulador, corte 1, P7 · Lo que el tamizado, el formulario y el verificador necesitan saber de un parámetro.
import type { Distribucion } from '../contratos/azar.ts';
import type { OpParche, Parametro } from '../contratos/modelo.ts';

/** Valor central de un parámetro (el número, o la media / la probabilidad de su distribución). NaN si la distribución no tiene uno simple. */
export function valorCentral(v: number | Distribucion): number {
  if (typeof v === 'number') return v;
  switch (v.tipo) {
    case 'fija': return v.valor;
    case 'uniforme': return (v.min + v.max) / 2;
    case 'triangular': return (v.min + v.moda + v.max) / 3;
    case 'exponencial': case 'lognormal': case 'normal': case 'erlang': return v.media;
    case 'bernoulli': return v.p;
    default: return NaN;   // weibull, discreta y empírica: la media pide funciones que no están en el corte 1
  }
}

/**
 * Coeficiente de variación de un parámetro, para el plan de medición. Las distribuciones que lo traen o lo tienen en una fórmula
 * cerrada lo dan; el resto (números, probabilidades, fijas, weibull, discretas, empíricas) devuelve `null`: el plan usa 0,5.
 */
export function cvDe(v: number | Distribucion): number | null {
  if (typeof v === 'number') return null;
  switch (v.tipo) {
    case 'lognormal': return v.cv;
    case 'exponencial': return 1;
    case 'erlang': return v.k > 0 ? 1 / Math.sqrt(v.k) : null;
    case 'normal': return v.media !== 0 ? Math.abs(v.desvio / v.media) : null;
    case 'uniforme': {
      const media = (v.min + v.max) / 2;
      return media !== 0 ? Math.abs((v.max - v.min) / (Math.sqrt(12) * media)) : null;
    }
    case 'triangular': {
      const media = (v.min + v.moda + v.max) / 3;
      const varianza = (v.min * v.min + v.moda * v.moda + v.max * v.max - v.min * v.moda - v.min * v.max - v.moda * v.max) / 18;
      return media !== 0 && varianza >= 0 ? Math.sqrt(varianza) / Math.abs(media) : null;
    }
    default: return null;
  }
}

/** Token de JSON Pointer (RFC 6901): «~» → «~0» y «/» → «~1». */
export function escaparToken(s: string): string {
  return s.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Parche que lleva el valor central de un parámetro a `nuevo` (para las variantes baja y alta del tamizado). Un número se reemplaza; de una
 * distribución se mueve su media (o su probabilidad); la uniforme y la triangular se escalan conservando la forma; la weibull escala la
 * escala tomando `incierto.medio` como referencia. Las discretas y empíricas no tienen un valor central que mover: `null`.
 */
export function parcheDeValor(nombre: string, p: Parametro, nuevo: number): OpParche[] | null {
  const base = `/parametros/${escaparToken(nombre)}/valor`;
  const v = p.valor;
  if (typeof v === 'number') return [{ op: 'replace', path: base, value: nuevo }];
  switch (v.tipo) {
    case 'fija': return [{ op: 'replace', path: `${base}/valor`, value: nuevo }];
    case 'lognormal': case 'normal': case 'exponencial': case 'erlang': return [{ op: 'replace', path: `${base}/media`, value: nuevo }];
    case 'bernoulli': return [{ op: 'replace', path: `${base}/p`, value: nuevo }];
    case 'uniforme': {
      const media = (v.min + v.max) / 2;
      if (media === 0) return [{ op: 'replace', path: `${base}/min`, value: v.min + nuevo }, { op: 'replace', path: `${base}/max`, value: v.max + nuevo }];
      const r = nuevo / media;
      return [{ op: 'replace', path: `${base}/min`, value: v.min * r }, { op: 'replace', path: `${base}/max`, value: v.max * r }];
    }
    case 'triangular': {
      const media = (v.min + v.moda + v.max) / 3;
      if (media === 0) return null;
      const r = nuevo / media;
      return [
        { op: 'replace', path: `${base}/min`, value: v.min * r }, { op: 'replace', path: `${base}/moda`, value: v.moda * r },
        { op: 'replace', path: `${base}/max`, value: v.max * r },
      ];
    }
    case 'weibull': {
      const ref = p.incierto?.medio;
      if (!ref) return null;
      return [{ op: 'replace', path: `${base}/escala`, value: v.escala * (nuevo / ref) }];
    }
    default: return null;
  }
}
