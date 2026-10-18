// escena/lazo.ts · Andén simulador, corte 1 · P6 (escena).
// El reloj del lazo de bandejas visto desde la traza: k(t) con fracción a partir de los tramos LAZO_MARCHA y LAZO_DETENIDO
// (contratos/traza.ts), y la posición de cada bandeja con posEnLazo (contratos/geometria.ts).
//
// Semántica (corte-1.md §6.7 reglas 8 y 13, y lo que escribe el hub):
// - LAZO_MARCHA desde t0 con a = k0: el paso k0 + i ocurre en t0 + i·tick; entre dos pasos la bandeja avanza en forma continua.
// - LAZO_DETENIDO desde t_s con a = kp: kp es el primer paso que NO llegó a ocurrir (el hub lo calcula como kRef + ⌈(t_s − tRef)/tick⌉);
//   al volver, LAZO_MARCHA arranca en t′ con a = kp, es decir, el paso kp ocurre en t′.
// - Para que el dibujo sea continuo y en los bordes de cada paso caiga EXACTO en la ranura calculada, el tramo de marcha que termina en
//   una parada recorre su último medio paso (de kp − 1 a kp) comprimido en [t(kp − 1), t_s]: las bandejas llegan a la ranura kp justo
//   cuando el lazo se detiene y se quedan ahí toda la parada. Los paquetes que la rueda hace caer en el paso kp se ven detenidos frente a
//   su rampa, que es lo que pasa en el modelo (caen al volver la marcha).
// - Antes del primer tramo, k = a del primero (el lazo todavía no arrancó). Sin tramos de lazo (F2 o una traza de otra familia), k = 0.
// Sin GPU ni física: todo son cuentas cerradas.
import { posEnLazo, type LazoEstadio } from '../contratos/geometria.ts';
import { TipoTramo, type Traza } from '../contratos/traza.ts';

export interface RelojLazo {
  /** Cantidad de tramos de lazo en la traza (0 en F2). */
  readonly tramos: number;
  readonly tick: number;
  /** k(t) con fracción. */
  pasoEn(t: number): number;
  /** ¿El lazo está detenido (micro-parada) en t? */
  detenidoEn(t: number): boolean;
}

export function crearRelojLazo(tr: Traza): RelojLazo {
  const T = tr.tramos, tick = tr.tickLazo;
  const idx: number[] = [];
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.LAZO_MARCHA || T.k[i] === TipoTramo.LAZO_DETENIDO) idx.push(i);
  idx.sort((x, y) => T.t0[x] - T.t0[y] || x - y);
  const n = idx.length;
  const t0 = new Float64Array(n), t1 = new Float64Array(n), a = new Float64Array(n), marcha = new Uint8Array(n);
  for (let q = 0; q < n; q++) {
    const i = idx[q];
    t0[q] = T.t0[i];
    t1[q] = T.t1[i];
    a[q] = T.a[i];
    marcha[q] = T.k[i] === TipoTramo.LAZO_MARCHA ? 1 : 0;
  }
  if (n > 0 && !(tick > 0)) throw new RangeError(`escena: la traza tiene tramos de lazo y tickLazo = ${tick} (se esperaba > 0 ms).`);

  /** Último tramo con t0 ≤ t (−1 si t es anterior al primero). Ante tramos de largo cero en el mismo t0 gana el último. */
  const tramoEn = (t: number): number => {
    let lo = 0, hi = n;
    while (lo < hi) {
      const m = (lo + hi) >>> 1;
      if (t0[m] <= t) lo = m + 1;
      else hi = m;
    }
    return lo - 1;
  };

  return {
    tramos: n,
    tick,
    pasoEn(t: number): number {
      if (n === 0) return 0;
      const q = tramoEn(t);
      if (q < 0) return a[0];
      if (!marcha[q]) return a[q];
      const k0 = a[q], desde = t0[q];
      const tt = t > t1[q] && q === n - 1 ? t1[q] : t; // después del último tramo, quieto donde quedó
      const natural = k0 + (tt - desde) / tick;
      if (q + 1 >= n) return natural;
      // Hay un tramo siguiente: el lazo tiene que llegar a su paso inicial (a del siguiente) justo en t1.
      const destino = a[q + 1], fin = t1[q];
      const ultimo = destino - 1; // último paso entero que ocurre en este tramo de marcha
      const tUlt = desde + (ultimo - k0) * tick;
      if (ultimo < k0 || !(tUlt < fin)) return Math.min(natural, destino); // datos raros: nunca pasarse del destino
      if (tt <= tUlt) return natural;
      return ultimo + (Math.min(tt, fin) - tUlt) / (fin - tUlt);
    },
    detenidoEn(t: number): boolean {
      if (n === 0) return false;
      const q = tramoEn(t);
      return q >= 0 && !marcha[q] && t < t1[q];
    },
  };
}

/** Módulo positivo (también para fracciones). */
export function modulo(x: number, m: number): number {
  const r = x % m;
  return r < 0 ? r + m : r;
}

/**
 * Distancia s (m) sobre el lazo de una ranura con fracción. Se usa el paso efectivo largo ÷ T para que la vuelta cierre sin salto
 * (T = round(largo ÷ paso), así que T·paso no es exactamente el largo).
 */
export function sDeRanura(l: LazoEstadio, ranura: number): number {
  const T = l.bandejas > 0 ? l.bandejas : 1;
  return modulo(ranura, T) * (l.largo / T);
}

/** Ranura (con fracción) en la que está la bandeja j cuando el lazo va por el paso k: (j + k) mod T. */
export function ranuraDeBandeja(l: LazoEstadio, j: number, k: number): number {
  return modulo(j + k, l.bandejas > 0 ? l.bandejas : 1);
}

/** Posición [x, y, ángulo] de la bandeja j en el paso k (con fracción). */
export function posBandeja(l: LazoEstadio, j: number, k: number, out: Float64Array | number[]): void {
  posEnLazo(l, sDeRanura(l, ranuraDeBandeja(l, j, k)), out);
}

/** Normal hacia afuera del estadio en s (el lazo va en sentido antihorario: el interior queda a la izquierda). */
export function normalAfuera(l: LazoEstadio, s: number, out: Float64Array | number[]): void {
  const p = [0, 0, 0];
  posEnLazo(l, s, p);
  out[0] = Math.sin(p[2]);
  out[1] = -Math.cos(p[2]);
}
