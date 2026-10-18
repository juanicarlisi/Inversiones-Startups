// modelo/f0.ts · P3 · Borrador analítico F0 (corte-1.md §6.10) y las cuentas del modelo que usan los chequeos y el presupuesto.
// Solo + − × ÷ (y Math.PI, Math.round, Math.floor): el mismo resultado bit a bit en cualquier motor de JavaScript, sin azar.
// F0 es una alarma, nunca una respuesta: capacidades medias, sin colas ni variabilidad.
import type { Distribucion } from '../contratos/azar.ts';
import type { CalcularF0, Dist, EstimacionF0, Modelo, Num, Parametro, Sorter } from '../contratos/modelo.ts';
import { aMs, horaASeg, segAHoraLarga } from '../contratos/tipos-base.ts';

const RE_REF = /^@[A-Za-z][A-Za-z0-9_]{0,63}$/;

/** Parámetro al que apunta una referencia «@nombre», solo si es propiedad propia (nunca «@toString» ni «@constructor»). */
export function parametroDe(m: Modelo, ref: string): Parametro | undefined {
  if (!RE_REF.test(ref)) return undefined;
  const nombre = ref.slice(1);
  return Object.hasOwn(m.parametros, nombre) ? m.parametros[nombre] : undefined;
}

/**
 * Valor numérico de un campo Num. Un parámetro con distribución 'fija' vale su valor y uno 'bernoulli' vale su probabilidad p
 * (así está escrito `noLeido` en el ejemplo; ver NOTAS-CONTRATO.md §1). Devuelve null si la referencia no existe o no es numérica.
 */
export function numeroEfectivo(m: Modelo, x: Num): number | null {
  if (typeof x === 'number') return x;
  const p = parametroDe(m, x);
  if (!p) return null;
  const v = p.valor;
  if (typeof v === 'number') return v;
  if (v.tipo === 'fija') return v.valor;
  if (v.tipo === 'bernoulli') return v.p;
  return null;
}

/** Como numeroEfectivo, pero lanza con un mensaje claro (para usar sobre modelos ya compilados). */
export function numeroDe(m: Modelo, x: Num): number {
  const v = numeroEfectivo(m, x);
  if (v === null) throw new Error(`se esperaba un número o un parámetro numérico y llegó ${JSON.stringify(x)}`);
  return v;
}

/** Distribución de un campo Dist (un parámetro numérico cuenta como 'fija'). null si la referencia no existe. */
export function distribucionEfectiva(m: Modelo, x: Dist): Distribucion | null {
  if (typeof x !== 'string') return x;
  const p = parametroDe(m, x);
  if (!p) return null;
  return typeof p.valor === 'number' ? { tipo: 'fija', valor: p.valor } : p.valor;
}

export function distribucionDe(m: Modelo, x: Dist): Distribucion {
  const d = distribucionEfectiva(m, x);
  if (!d) throw new Error(`parámetro inexistente: ${JSON.stringify(x)}`);
  return d;
}

// Γ(1 + x) para x en [0, 1]: Abramowitz y Stegun 6.1.36 (error ≤ 3·10⁻⁷), solo con sumas y productos.
const B_GAMMA = [-0.577191652, 0.988205891, -0.897056937, 0.918206857, -0.756704078, 0.482199394, -0.193527818, 0.035868343];
/** Γ(1 + a) para a ≥ 0 con la recurrencia Γ(1 + a) = Γ(1 + f) · Π (f + j). Infinity si a > 170. */
export function gammaUnoMas(a: number): number {
  if (!(a >= 0)) return NaN;
  if (a > 170) return Infinity;
  const n = Math.floor(a);
  const f = a - n;
  let g = 1, xp = 1;
  for (let i = 0; i < 8; i++) { xp *= f; g += B_GAMMA[i] * xp; }
  for (let j = 1; j <= n; j++) g *= f + j;
  return g;
}

/**
 * Media analítica de una distribución (§6.10): lognormal, exponencial, erlang y normal → media; uniforme → (min + max)/2;
 * triangular → (min + moda + max)/3; fija → valor. Además: bernoulli → p; weibull → escala·Γ(1 + 1/forma) (aproximada, 3·10⁻⁷);
 * discreta → Σ v·w / Σ w; empírica → la media exacta de la interpolación lineal de §6.6.
 */
export function media(d: Distribucion): number {
  switch (d.tipo) {
    case 'fija': return d.valor;
    case 'uniforme': return (d.min + d.max) / 2;
    case 'exponencial': return d.media;
    case 'triangular': return (d.min + d.moda + d.max) / 3;
    case 'lognormal': return d.media;
    case 'normal': return d.media;
    case 'erlang': return d.media;
    case 'weibull': return d.escala * gammaUnoMas(1 / d.forma);
    case 'bernoulli': return d.p;
    case 'discreta': {
      let s = 0, w = 0;
      for (let i = 0; i < d.valores.length; i++) { s += d.valores[i] * d.pesos[i]; w += d.pesos[i]; }
      return s / w;
    }
    case 'empirica': {
      const v = d.valores;
      if (v.length === 1) return v[0];
      let s = 0;
      for (let i = 0; i + 1 < v.length; i++) s += (v[i] + v[i + 1]) / 2;
      return s / (v.length - 1);
    }
  }
}

/** El menor valor que puede salir de la distribución (para exigir duraciones no negativas). */
export function soporteMinimo(d: Distribucion): number {
  switch (d.tipo) {
    case 'fija': return d.valor;
    case 'uniforme': return d.min;
    case 'triangular': return d.min;
    case 'normal': return d.min ?? -Infinity;
    case 'discreta': {
      let m = Infinity;
      for (let i = 0; i < d.valores.length; i++) if (d.pesos[i] > 0 && d.valores[i] < m) m = d.valores[i];
      return m;
    }
    case 'empirica': return d.valores[0];
    case 'exponencial': case 'lognormal': case 'erlang': case 'weibull': case 'bernoulli': return 0;
  }
}

/** El número que representa a un parámetro para su rango y su `incierto`: el valor, la media de la distribución o la p. */
export function escalarDeParametro(p: Parametro): number {
  return typeof p.valor === 'number' ? p.valor : media(p.valor);
}

// ---- Cuentas del modelo ----

/** Paquetes nominales de la noche (sin el factor del día). */
export function paquetesNominales(m: Modelo): number {
  const c = m.demanda.camiones;
  if (Array.isArray(c)) { let s = 0; for (const x of c) s += x.paquetes; return s; }
  return c.cantidad * c.paquetes;
}

/** Turno del primer camión, en segundos. */
export function primerTurnoSeg(m: Modelo): number {
  const c = m.demanda.camiones;
  if (Array.isArray(c)) { let t = Infinity; for (const x of c) t = Math.min(t, horaASeg(x.turno)); return t; }
  return horaASeg(c.primero);
}

/** Ventana de llegadas (§6.10): cantidad × cada en una serie; último − primero + mediana de los intervalos en una lista. */
export function ventanaSeg(m: Modelo): number {
  const c = m.demanda.camiones;
  if (!Array.isArray(c)) return c.cantidad * c.cada;
  const t = c.map((x) => horaASeg(x.turno)).sort((a, b) => a - b);
  if (t.length < 2) return 0;
  const iv: number[] = [];
  for (let i = 1; i < t.length; i++) iv.push(t[i] - t[i - 1]);
  iv.sort((a, b) => a - b);
  const k = iv.length >> 1;
  const mediana = iv.length % 2 === 1 ? iv[k] : (iv[k - 1] + iv[k]) / 2;
  return t[t.length - 1] - t[0] + mediana;
}

/** Largo del lazo tipo estadio: 2·recta + 2π·radio (metros). */
export function largoLazo(s: Pick<Sorter, 'recta' | 'radio'>): number {
  return 2 * s.recta + 2 * Math.PI * s.radio;
}
/** Bandejas del lazo: T = round(largo ÷ paso) (§6.7, regla 8). */
export function bandejasLazo(s: Pick<Sorter, 'recta' | 'radio' | 'paso'>): number {
  return Math.round(largoLazo(s) / s.paso);
}
/** Paso del lazo en ms: tick = aMs(paso ÷ velocidad) (§6.2). */
export function tickMs(s: Pick<Sorter, 'paso' | 'velocidad'>): number {
  return aMs(s.paso / s.velocidad);
}
/** Ranura de un punto a distancia s: round(s ÷ paso) mod T (§6.7, regla 8). */
export function ranuraDe(s: Pick<Sorter, 'recta' | 'radio' | 'paso'>, distancia: number): number {
  const T = bandejasLazo(s);
  return ((Math.round(distancia / s.paso) % T) + T) % T;
}

/** Hora más tarde que se puede escribir en el formato del modelo («47:59»). */
export const HORA_MAXIMA_SEG = 47 * 3600 + 59 * 60;

function cociente(a: number, b: number): number {
  if (b === 0) return a === 0 ? 0 : Infinity;
  if (b === Infinity) return a === Infinity ? 1 : 0;
  return a / b;
}

/**
 * Borrador analítico F0 (§6.10) con las fórmulas literales de la especificación. Dos casos de borde (NOTAS-CONTRATO.md §6):
 * si todos los camiones llegan en el mismo instante (ventana 0), la llegada efectiva la pone la descarga; y si el fin estimado no
 * es finito o pasa de «47:59», se informa «47:59» (A-CORTE-IMPOSIBLE lo marca).
 */
export const calcularF0: CalcularF0 = (m: Modelo): EstimacionF0 => {
  const paquetes = paquetesNominales(m);
  const ventana = ventanaSeg(m);
  let personasAnden = 0;
  for (const a of m.hub.andenes) personasAnden += a.personas;
  const capacidadDescargaPorHora = cociente(personasAnden * 3600, media(distribucionDe(m, m.personas.descarga.ritmo)));
  const pi = m.personas.induccion.pausas;
  const capacidadInduccionPorHora =
    cociente(m.personas.induccion.puestosActivos * 3600, media(distribucionDe(m, m.hub.induccion.tiempo))) * (1 - pi.duracion / pi.cada);
  let bandejasPorPaquete = 0;
  for (const c of m.hub.perfilPaquete.clases) bandejasPorPaquete += c.fraccion * c.bandejas;
  const capacidadSorterTeoricaPorHora = cociente((m.hub.sorter.velocidad / m.hub.sorter.paso) * 3600, bandejasPorPaquete);
  const pr = m.personas.rampa.pausas;
  const porPaquete = media(distribucionDe(m, m.personas.rampa.manejo)) + numeroDe(m, m.hub.jaulas.cierre) / m.hub.jaulas.capacidad;
  const capacidadRampasPorHora = cociente(m.personas.rampa.cantidad * 3600, porPaquete) * (1 - pr.duracion / pr.cada);

  let llegadaMediaPorHora: number;
  if (ventana > 0) llegadaMediaPorHora = (paquetes / ventana) * 3600;
  else llegadaMediaPorHora = Number.isFinite(capacidadDescargaPorHora) ? capacidadDescargaPorHora : paquetes * 3600;

  const capacidades = {
    descarga: capacidadDescargaPorHora,
    induccion: capacidadInduccionPorHora,
    sorter: capacidadSorterTeoricaPorHora,
    rampas: capacidadRampasPorHora,
  };
  let cuello: EstimacionF0['cuello'] = 'descarga';
  for (const k of ['induccion', 'sorter', 'rampas'] as const) if (capacidades[k] < capacidades[cuello]) cuello = k;
  const utilizacion = {
    descarga: cociente(llegadaMediaPorHora, capacidadDescargaPorHora),
    induccion: cociente(llegadaMediaPorHora, capacidadInduccionPorHora),
    sorter: cociente(llegadaMediaPorHora, capacidadSorterTeoricaPorHora),
    rampas: cociente(llegadaMediaPorHora, capacidadRampasPorHora),
  };
  const durCuello = cociente(paquetes, capacidades[cuello]) * 3600;
  let fin = primerTurnoSeg(m) + Math.max(ventana, durCuello);
  if (!(fin <= HORA_MAXIMA_SEG)) fin = HORA_MAXIMA_SEG;
  return {
    llegadaMediaPorHora,
    capacidadDescargaPorHora,
    capacidadInduccionPorHora,
    capacidadSorterTeoricaPorHora,
    capacidadRampasPorHora,
    cuello,
    utilizacion,
    finEstimado: segAHoraLarga(fin),
  };
};
