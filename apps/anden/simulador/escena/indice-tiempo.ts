// escena/indice-tiempo.ts · Andén simulador, corte 1 · P6 (escena).
// Índice de tramos por intervalos de 60 s (corte-1.md §9 P6): encuentra los tramos activos en un instante t sin recorrer la traza
// entera. Cada intervalo b = [base + b·60 s, base + (b+1)·60 s) guarda, en formato CSR (desplazamientos + lista):
//   - «arrastre»: los tramos que empezaron ANTES del intervalo y siguen activos al empezar el intervalo;
//   - «inicios»: los tramos que empiezan dentro del intervalo.
// Un instante t del intervalo b tiene como candidatos el arrastre de b y los inicios de b: son los activos al empezar el intervalo
// más los que nacieron en ese minuto, así que el costo es O(visibles + recambio de un minuto), no O(traza).
// Activo en t quiere decir t0 ≤ t < t1 (un tramo de largo cero nunca está activo).

/** Ancho de cada intervalo del índice (ms). */
export const INTERVALO_INDICE_MS = 60_000;

export interface IndiceTiempo {
  /** Inicio del primer intervalo (ms). */
  readonly base: number;
  /** Instante máximo que cubre el índice (los instantes posteriores se consultan como `fin`). */
  readonly fin: number;
  readonly intervalos: number;
  /** Cota superior de los activos de cualquier instante (para dimensionar el arreglo de salida). */
  readonly maxCandidatos: number;
  /** Cantidad de tramos indexados. */
  readonly indexados: number;
  /**
   * Escribe en `out` los índices de los tramos activos en t (primero el arrastre y después los inicios, cada grupo en orden de
   * índice) y devuelve cuántos son. `out` tiene que tener al menos `maxCandidatos` lugares.
   */
  activos(t: number, out: Int32Array): number;
}

/**
 * Arma el índice sobre las columnas t0 y t1 de una traza, solo con los tramos marcados en `incluir` (las vistas excluyen, por ejemplo,
 * las jaulas: un paquete en la jaula no se dibuja, se cuenta). `base` y `fin` acotan el tiempo que se puede consultar.
 */
export function crearIndiceTiempo(
  t0: Float64Array, t1: Float64Array, incluir: Uint8Array, base: number, fin: number, intervalo = INTERVALO_INDICE_MS,
): IndiceTiempo {
  if (!(intervalo > 0)) throw new RangeError(`índice de tiempo: el intervalo tiene que ser > 0 ms y vino ${intervalo}.`);
  if (!Number.isFinite(base) || !Number.isFinite(fin)) {
    throw new RangeError(`índice de tiempo: base y fin tienen que ser finitos (vinieron ${base} y ${fin}).`);
  }
  if (t0.length !== t1.length || incluir.length < t0.length) {
    throw new RangeError(`índice de tiempo: t0 tiene ${t0.length} elementos, t1 ${t1.length} e incluir ${incluir.length}.`);
  }
  const n = t0.length;
  const finEf = Math.max(base, fin);
  const nb = Math.floor((finEf - base) / intervalo) + 1;
  // Intervalo de inicio y último intervalo activo de cada tramo (−1 si no se indexa).
  const bIni = new Int32Array(n), bFin = new Int32Array(n);
  const cuentaIni = new Int32Array(nb), cuentaArr = new Int32Array(nb + 1);
  let indexados = 0;
  for (let i = 0; i < n; i++) {
    const a = t0[i], z = t1[i];
    if (!incluir[i] || !(z > a)) { bIni[i] = -1; continue; }
    indexados++;
    let b0 = Math.floor((a - base) / intervalo);
    if (b0 < 0) b0 = 0; else if (b0 >= nb) b0 = nb - 1;
    // Último intervalo activo: el del último instante antes de z (o el último, si z queda más allá del fin).
    let b1 = z > finEf ? nb - 1 : Math.ceil((z - base) / intervalo) - 1;
    if (b1 >= nb) b1 = nb - 1;
    if (b1 < b0) b1 = b0;
    bIni[i] = b0;
    bFin[i] = b1;
    cuentaIni[b0]++;
    // arrastre en (b0, b1]: diferencias acumuladas para no recorrer cada intervalo dos veces
    if (b1 > b0) { cuentaArr[b0 + 1]++; cuentaArr[b1 + 1]--; }
  }
  const offIni = new Int32Array(nb + 1), offArr = new Int32Array(nb + 1);
  let arrastre = 0, maxCand = 0;
  for (let b = 0; b < nb; b++) {
    arrastre += cuentaArr[b];
    offIni[b + 1] = offIni[b] + cuentaIni[b];
    offArr[b + 1] = offArr[b] + arrastre;
    const c = cuentaIni[b] + arrastre;
    if (c > maxCand) maxCand = c;
  }
  const ini = new Int32Array(offIni[nb]), arr = new Int32Array(offArr[nb]);
  const pIni = offIni.slice(0, nb), pArr = offArr.slice(0, nb);
  for (let i = 0; i < n; i++) {
    const b0 = bIni[i];
    if (b0 < 0) continue;
    ini[pIni[b0]++] = i;
    for (let b = b0 + 1, b1 = bFin[i]; b <= b1; b++) arr[pArr[b]++] = i;
  }

  return {
    base, fin: finEf, intervalos: nb, maxCandidatos: maxCand, indexados,
    activos(t: number, out: Int32Array): number {
      const tt = t < base ? base : t > finEf ? finEf : t;
      let b = Math.floor((tt - base) / intervalo);
      if (b >= nb) b = nb - 1;
      let k = 0;
      for (let q = offArr[b], h = offArr[b + 1]; q < h; q++) {
        const i = arr[q];
        if (tt < t1[i]) out[k++] = i;
      }
      for (let q = offIni[b], h = offIni[b + 1]; q < h; q++) {
        const i = ini[q];
        if (t0[i] <= tt && tt < t1[i]) out[k++] = i;
      }
      return k;
    },
  };
}

/** Cantidad de valores ≤ t en un arreglo ordenado de menor a mayor, entre [desde, hasta) (búsqueda binaria). */
export function cuantosHasta(a: Float64Array, t: number, desde = 0, hasta = a.length): number {
  let lo = desde, hi = hasta;
  while (lo < hi) {
    const m = (lo + hi) >>> 1;
    if (a[m] <= t) lo = m + 1;
    else hi = m;
  }
  return lo - desde;
}

/**
 * Filas FIFO en formato CSR: para cada grupo g (0…grupos−1) los t0 (entradas) y t1 (salidas) de sus tramos, cada uno ordenado de menor a
 * mayor. `grupo[i]` es el grupo del tramo i o −1. Con eso, en t: adentro = entradas ≤ t − salidas ≤ t, y el lugar de un tramo de la
 * fila es su secuencia menos las salidas ≤ t.
 */
export interface FilasOrdenadas { readonly grupos: number; readonly off: Int32Array; readonly ent: Float64Array; readonly sal: Float64Array }

export function ordenarFilas(t0: Float64Array, t1: Float64Array, grupo: Int32Array, grupos: number): FilasOrdenadas {
  const off = new Int32Array(grupos + 1);
  for (let i = 0; i < grupo.length; i++) if (grupo[i] >= 0) off[grupo[i] + 1]++;
  for (let g = 0; g < grupos; g++) off[g + 1] += off[g];
  const ent = new Float64Array(off[grupos]), sal = new Float64Array(off[grupos]), p = off.slice(0, grupos);
  for (let i = 0; i < grupo.length; i++) {
    const g = grupo[i];
    if (g < 0) continue;
    ent[p[g]] = t0[i];
    sal[p[g]] = t1[i];
    p[g]++;
  }
  for (let g = 0; g < grupos; g++) {
    if (off[g + 1] - off[g] > 1) {
      ent.subarray(off[g], off[g + 1]).sort();
      sal.subarray(off[g], off[g + 1]).sort();
    }
  }
  return { grupos, off, ent, sal };
}

/** Entradas ≤ t del grupo g. */
export function entradasHasta(f: FilasOrdenadas, g: number, t: number): number {
  return cuantosHasta(f.ent, t, f.off[g], f.off[g + 1]);
}
/** Salidas ≤ t del grupo g. */
export function salidasHasta(f: FilasOrdenadas, g: number, t: number): number {
  return cuantosHasta(f.sal, t, f.off[g], f.off[g + 1]);
}
