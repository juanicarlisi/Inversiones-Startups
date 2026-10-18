// experimentos/estadistica/mser.ts · Andén simulador, corte 1, P5.
// MSER-5 (White 1997) para elegir cuántas observaciones iniciales descartar como calentamiento. Definición de corte-1.md §7:
// lotes de 5 sobre la SERIE PROMEDIO entre réplicas; para d = 0…⌊m/2⌋ lotes, MSER(d) = Σ_{j>d}(Y_j − Ȳ_d)² ÷ (m − d)²; se elige el mínimo.
// Sobre una sola corrida el sesgo empeora (MEDIDO, diseno-maestro.md §3.1 / A3): por eso `serieMedia` existe y se usa primero.

export const TAMANO_LOTE_MSER = 5;

export interface DetalleMser {
  /** Observaciones a descartar (d* · 5): el valor que se usa. */
  corte: number;
  /** Lotes completos de 5 que se formaron (m). Las observaciones sobrantes del final se ignoran. */
  lotes: number;
  /** Lotes descartados (d*). */
  d: number;
  /** MSER(d) para d = 0…⌊m/2⌋ (el que se minimizó). */
  estadistico: number[];
  /** true si el mínimo cayó en el último d permitido (⌊m/2⌋): no se encontró una zona estable, la corrida es corta para este modelo. */
  tocaElLimite: boolean;
}

/** Promedio por posición de varias series de igual largo (en el orden dado: el resultado no depende de nada más). */
export function serieMedia(series: ArrayLike<number>[]): number[] {
  if (series.length === 0) throw new Error('serieMedia: se esperaba al menos una serie');
  const largo = series[0].length;
  const salida = new Array<number>(largo).fill(0);
  for (let s = 0; s < series.length; s++) {
    if (series[s].length !== largo) {
      throw new Error(`serieMedia: todas las series deben tener el mismo largo; la 0 tiene ${largo} y la ${s} tiene ${series[s].length}`);
    }
    for (let i = 0; i < largo; i++) salida[i] += series[s][i];
  }
  for (let i = 0; i < largo; i++) salida[i] /= series.length;
  return salida;
}

export function mser5Detalle(serie: ArrayLike<number>): DetalleMser {
  const B = TAMANO_LOTE_MSER;
  const m = Math.floor(serie.length / B);
  if (m < 1) throw new Error(`mser5: se necesitan al menos ${B} observaciones y llegaron ${serie.length}`);
  const Y = new Array<number>(m);
  for (let j = 0; j < m; j++) {
    let s = 0;
    for (let i = 0; i < B; i++) {
      const v = serie[j * B + i];
      if (!Number.isFinite(v)) throw new Error(`mser5: la observación ${j * B + i} no es un número finito (${v})`);
      s += v;
    }
    Y[j] = s / B;
  }
  // Sumas de cola de los lotes centrados en su media global (evita la cancelación cuando la media es enorme frente al ruido).
  let mediaGlobal = 0;
  for (let j = 0; j < m; j++) mediaGlobal += Y[j];
  mediaGlobal /= m;
  const S1 = new Array<number>(m + 1).fill(0), S2 = new Array<number>(m + 1).fill(0);
  for (let j = m - 1; j >= 0; j--) {
    const c = Y[j] - mediaGlobal;
    S1[j] = S1[j + 1] + c;
    S2[j] = S2[j + 1] + c * c;
  }
  const dMax = Math.floor(m / 2);
  const estadistico: number[] = [];
  let mejor = Infinity, dMejor = 0;
  for (let d = 0; d <= dMax; d++) {
    const resto = m - d;
    const suma = Math.max(0, S2[d] - (S1[d] * S1[d]) / resto);   // Σ (Y_j − Ȳ_d)²
    const mser = suma / (resto * resto);
    estadistico.push(mser);
    if (mser < mejor) { mejor = mser; dMejor = d; }                // en empate gana el d menor
  }
  return { corte: dMejor * B, lotes: m, d: dMejor, estadistico, tocaElLimite: dMejor === dMax && dMax > 0 };
}

/** Cuántas observaciones descartar al comienzo de la serie (múltiplo de 5). */
export function mser5(serie: ArrayLike<number>): number {
  return mser5Detalle(serie).corte;
}
