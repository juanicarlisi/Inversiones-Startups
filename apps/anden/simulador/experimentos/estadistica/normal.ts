// experimentos/estadistica/normal.ts · Andén simulador, corte 1, P5.
// La cola de la normal estándar y su inversa para CUALQUIER probabilidad, con solo sumas, productos, divisiones y Math.round (sin
// Math.log ni Math.exp: corte-1.md §1.4). La usa la decisión secuencial para repartir el error entre las miradas (Bonferroni): con K
// miradas, cada una decide con z = Φ⁻¹(1 − α/(2K)) en lugar de 1,96 (hallazgos H2 y E-03 de la revisión del 19-10-2026).
// Las tres confianzas de §7 (0,90 · 0,95 · 0,99) siguen saliendo de la tabla fija de t-student.ts; esto es solo para los z corregidos.

const LN2 = 0.6931471805599453;
// ln 2 partido en dos (Cody y Waite, como fdlibm): k · LN2_ALTO es exacto para |k| < 2²⁰, así la reducción no pierde precisión.
const LN2_ALTO = 6.93147180369123816490e-01, LN2_BAJO = 1.90821492927058770002e-10;
/** 1 ÷ √(2π). */
const INV_RAIZ_2PI = 0.3989422804014327;

/** e^x con reducción a [−ln2/2, ln2/2] y Taylor de 24 términos (error relativo < 1e-15 para |x| ≤ 700). Solo aritmética. */
export function expAritmetica(x: number): number {
  if (!Number.isFinite(x)) {
    if (x === Infinity) return Infinity;
    if (x === -Infinity) return 0;
    return Number.NaN;
  }
  if (x === 0) return 1;
  const k = Math.round(x / LN2);
  const r = (x - k * LN2_ALTO) - k * LN2_BAJO;
  let termino = 1, suma = 1;
  for (let i = 1; i <= 24; i++) {
    termino *= r / i;
    suma += termino;
  }
  // × 2^k exacto (multiplicar o dividir por 2 no redondea mientras no haya desborde ni subdesborde)
  let f = suma;
  for (let j = k; j > 0; j--) f *= 2;
  for (let j = k; j < 0; j++) f /= 2;
  return f;
}

/** Densidad de la normal estándar φ(z) = e^(−z²/2) ÷ √(2π). */
export function densidadNormal(z: number): number {
  return INV_RAIZ_2PI * expAritmetica(-0.5 * z * z);
}

/**
 * Cola superior de la normal estándar Q(z) = 1 − Φ(z) para z ≥ 0.
 * z < 3: serie de Marsaglia, Φ(z) = ½ + φ(z)·(z + z³/3 + z⁵/15 + …) (todos los términos positivos).
 * z ≥ 3: fracción continua de Laplace, Q(z) = φ(z) ÷ (z + 1/(z + 2/(z + 3/(z + …)))), evaluada de atrás para adelante.
 */
export function colaNormal(z: number): number {
  if (Number.isNaN(z)) return Number.NaN;
  if (z < 0) return 1 - colaNormal(-z);
  if (z === Infinity) return 0;
  const fi = densidadNormal(z);
  if (z < 3) {
    let termino = z, suma = z;
    const z2 = z * z;
    for (let n = 1; n < 500; n++) {
      termino *= z2 / (2 * n + 1);
      suma += termino;
      if (termino < 1e-17 * suma) break;
    }
    return 0.5 - fi * suma;
  }
  let f = z;
  for (let n = 80; n >= 1; n--) f = z + n / f;
  return fi / f;
}

/**
 * z tal que Q(z) = q, para q en (0, ½]: el cuantil 1 − q de la normal estándar. Bisección hasta que el intervalo ya no se achica
 * (determinista: el mismo q da el mismo z en cualquier motor de JavaScript). Control: q = 0,025 → 1,959963984540054.
 */
export function zDeCola(q: number): number {
  if (!(q > 0 && q <= 0.5)) throw new Error(`zDeCola: la cola tiene que estar en (0; 0,5] y llegó ${q}`);
  if (q === 0.5) return 0;
  let lo = 0, hi = 40;
  for (let i = 0; i < 200; i++) {
    const medio = 0.5 * (lo + hi);
    if (medio === lo || medio === hi) break;
    if (colaNormal(medio) > q) lo = medio; else hi = medio;
  }
  return 0.5 * (lo + hi);
}

/**
 * Cuántas veces mira la decisión secuencial a una misma opción: la primera con `replicasIniciales` y después una por tanda hasta
 * `replicasMax` (corte-1.md §7). Con 20, 20 y 400 son 20 miradas.
 */
export function miradasSecuenciales(replicasIniciales: number, tanda: number, replicasMax: number): number {
  return 1 + Math.max(0, Math.ceil((replicasMax - replicasIniciales) / tanda));
}

/**
 * Confianza y z de CADA mirada para que, sumando las K miradas, la probabilidad de declarar «cumple» (o «no cumple») por azar no pase de
 * (1 − confianza) ÷ 2 (Bonferroni: cada mirada gasta 1/K del error). Con K = 1 es el z de siempre.
 */
export function confianzaPorMirada(confianza: number, miradas: number): { confianza: number; z: number } {
  if (!(confianza > 0 && confianza < 1)) throw new Error(`confianzaPorMirada: la confianza tiene que estar en (0, 1) y llegó ${confianza}`);
  if (!Number.isInteger(miradas) || miradas < 1) throw new Error(`confianzaPorMirada: las miradas tienen que ser un entero ≥ 1 y llegó ${miradas}`);
  const alfa = (1 - confianza) / miradas;
  return { confianza: 1 - alfa, z: zDeCola(alfa / 2) };
}
