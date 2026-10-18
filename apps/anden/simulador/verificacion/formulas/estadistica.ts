// verificacion/formulas/estadistica.ts · Andén simulador, corte 1, P2.
// Estadística mínima que necesita la batería para juzgar cada prueba: media, desvío, error estándar, semiancho con t de Student.
// No importa experimentos/ (regla §14.3): la t se calcula acá con la beta incompleta regularizada (fracción continua de Lentz) y
// bisección, usando la matemática determinista del motor (nada de logaritmo ni exponencial nativos: §1.4).
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';

export interface Intervalo {
  n: number;
  media: number;
  desvio: number;   // desviación muestral (n − 1)
  ee: number;       // error estándar = desvío / √n
  semiancho: number;
  confianza: number;
}

export function media(xs: ArrayLike<number>): number {
  if (xs.length === 0) throw new Error('media: se esperaba al menos un dato y llegó una lista vacía');
  let s = 0;
  for (let i = 0; i < xs.length; i++) s += xs[i];
  return s / xs.length;
}

/** Desviación muestral con n − 1 (algoritmo de dos pasadas, estable). */
export function desvio(xs: ArrayLike<number>): number {
  if (xs.length < 2) throw new Error(`desvio: se esperaban al menos 2 datos y llegaron ${xs.length}`);
  const m = media(xs);
  let s = 0;
  for (let i = 0; i < xs.length; i++) { const d = xs[i] - m; s += d * d; }
  return Math.sqrt(s / (xs.length - 1));
}

// ---- t de Student ----

const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

/** log Γ(x) para x ≥ 0,5 (Lanczos, g = 7). */
export function logGamma(x: number, mat: MatematicaDeterminista): number {
  if (!(x >= 0.5)) throw new Error(`logGamma: solo para x ≥ 0,5 y llegó ${x}`);
  const y = x - 1;
  let a = LANCZOS[0];
  const t = y + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (y + i);
  return 0.5 * mat.log(2 * Math.PI) + (y + 0.5) * mat.log(t) - t + mat.log(a);
}

function fraccionBeta(a: number, b: number, x: number): number {
  const MIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < MIN) d = MIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < MIN) d = MIN;
    c = 1 + aa / c; if (Math.abs(c) < MIN) c = MIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < MIN) d = MIN;
    c = 1 + aa / c; if (Math.abs(c) < MIN) c = MIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-15) break;
  }
  return h;
}

/** Beta incompleta regularizada I_x(a, b). */
export function betaIncompleta(a: number, b: number, x: number, mat: MatematicaDeterminista): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = mat.exp(logGamma(a + b, mat) - logGamma(a, mat) - logGamma(b, mat) + a * mat.log(x) + b * mat.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * fraccionBeta(a, b, x)) / a : 1 - (bt * fraccionBeta(b, a, 1 - x)) / b;
}

/** Función de distribución de la t de Student con ν grados de libertad. */
export function distribucionT(t: number, nu: number, mat: MatematicaDeterminista): number {
  const p = 0.5 * betaIncompleta(nu / 2, 0.5, nu / (nu + t * t), mat);
  return t > 0 ? 1 - p : p;
}

const cacheT = new Map<string, number>();

/** Cuantiles normales de las tres confianzas de §7 (0,90 · 0,95 · 0,99), por la probabilidad acumulada. */
export const CUANTIL_NORMAL: Readonly<Record<string, number>> = { '0.95': 1.6448536269514722, '0.975': 1.959963984540054, '0.995': 2.5758293035489004 };

/**
 * Cuantil p de la t de Student (p > 0,5). Hasta ν = 200, bisección sobre la distribución (200 pasos, error < 1e-12); con ν > 200
 * y las confianzas de §7, Cornish-Fisher como manda el corte: t ≈ z + (z³ + z)/(4ν) + (5z⁵ + 16z³ + 3z)/(96ν²).
 */
export function cuantilT(p: number, nu: number, mat: MatematicaDeterminista): number {
  if (!(p > 0.5 && p < 1)) throw new Error(`cuantilT: se esperaba 0,5 < p < 1 y llegó ${p}`);
  if (!(nu >= 1)) throw new Error(`cuantilT: se esperaban grados de libertad ≥ 1 y llegó ${nu}`);
  const zt = CUANTIL_NORMAL[String(p)];
  if (nu > 200 && zt !== undefined) {
    const z = zt, z3 = z * z * z, z5 = z3 * z * z;
    return z + (z3 + z) / (4 * nu) + (5 * z5 + 16 * z3 + 3 * z) / (96 * nu * nu);
  }
  const k = `${p}|${nu}`;
  const c = cacheT.get(k);
  if (c !== undefined) return c;
  let lo = 0, hi = 1000;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (distribucionT(m, nu, mat) < p) lo = m; else hi = m;
  }
  const r = (lo + hi) / 2;
  cacheT.set(k, r);
  return r;
}

/** Intervalo de t para la media de réplicas independientes (n ≥ 2). */
export function intervaloMedia(xs: ArrayLike<number>, mat: MatematicaDeterminista, confianza = 0.95): Intervalo {
  const n = xs.length;
  if (n < 2) throw new Error(`intervaloMedia: hacen falta al menos 2 réplicas y llegaron ${n}`);
  const m = media(xs);
  const s = desvio(xs);
  const ee = s / Math.sqrt(n);
  const t = cuantilT(1 - (1 - confianza) / 2, n - 1, mat);
  return { n, media: m, desvio: s, ee, semiancho: t * ee, confianza };
}
