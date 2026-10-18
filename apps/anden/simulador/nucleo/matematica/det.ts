// nucleo/matematica/det.ts · Matemática determinista del núcleo (contrato: contratos/matematica.ts).
//
// Por qué existe: `log`, `exp`, `sin` y `cos` nativos no están fijados por el estándar de JavaScript (cada motor usa su biblioteca),
// así que la misma simulación podría dar otra huella en Firefox o en Safari. Estas funciones usan solo + − × ÷ (exactas por
// IEEE 754) y lectura de bits, así que dan el mismo resultado bit a bit en cualquier motor. Son adaptaciones de fdlibm (Sun, 1993)
// tal como las compila V8 (src/base/ieee754.cc): e_log.c, e_exp.c, k_cos.c, k_sin.c, s_cos.c, s_sin.c y la reducción de argumento de
// e_rem_pio2.c para |x| ≤ 1.000. Por eso coinciden con Math.* de V8 (lo prueba nucleo/pruebas/det.test.ts).
// Fuentes: oportunidades/proyectos/anden/medicion-sintesis/detmath.mjs y
// conocimiento/anden-simulador-2026-10/medicion-tecnologia/detlog.mjs (mediciones del 17-10-2026).
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';

// ---- Lectura y escritura de bits de un double ----
// F e I comparten memoria: I[ALTO] es la palabra alta (signo, exponente y 20 bits de mantisa) y I[BAJO] la baja.
const F = new Float64Array(1);
const I = new Int32Array(F.buffer);
/** En una máquina little-endian (todas las que corren navegadores hoy) la palabra alta es I[1]. Se detecta por las dudas. */
const ALTO = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1 ? 1 : 0;
const BAJO = 1 - ALTO;

function palabraAlta(x: number): number {
  F[0] = x;
  return I[ALTO];
}
function conPalabras(alta: number, baja: number): number {
  I[ALTO] = alta;
  I[BAJO] = baja;
  return F[0];
}

// ---- log (fdlibm e_log.c) ----
const LN2_HI = 6.93147180369123816490e-01; // 0x3fe62e42 fee00000
const LN2_LO = 1.90821492927058770002e-10; // 0x3dea39ef 35793c76
const DOS54 = 1.80143985094819840000e+16; // 2^54
const LG1 = 6.666666666666735130e-01, LG2 = 3.999999999940941908e-01, LG3 = 2.857142874366239149e-01,
  LG4 = 2.222219843214978396e-01, LG5 = 1.818357216161805012e-01, LG6 = 1.531383769920937332e-01,
  LG7 = 1.479819860511658591e-01;

function log(x: number): number {
  F[0] = x;
  let hx = I[ALTO];
  const lx = I[BAJO];
  let k = 0;
  if (hx < 0x00100000) { // x < 2^-1022: cero, negativo o subnormal
    if (((hx & 0x7fffffff) | lx) === 0) return -Infinity; // log(±0) = −∞
    if (hx < 0) return NaN; // log(negativo) = NaN
    k -= 54;
    x *= DOS54; // subnormal: se escala
    F[0] = x;
    hx = I[ALTO];
  }
  if (hx >= 0x7ff00000) return x + x; // +∞ o NaN
  k += (hx >> 20) - 1023;
  hx &= 0x000fffff;
  let i = (hx + 0x95f64) & 0x100000;
  F[0] = x;
  I[ALTO] = hx | (i ^ 0x3ff00000); // normaliza x o x/2
  x = F[0];
  k += i >> 20;
  const f = x - 1.0;
  if ((0x000fffff & (2 + hx)) < 3) { // −2^-20 ≤ f < 2^-20
    if (f === 0) {
      if (k === 0) return 0;
      const dk = k;
      return dk * LN2_HI + dk * LN2_LO;
    }
    const R = f * f * (0.5 - 0.33333333333333333 * f);
    if (k === 0) return f - R;
    const dk = k;
    return dk * LN2_HI - ((R - dk * LN2_LO) - f);
  }
  const s = f / (2.0 + f);
  const dk = k;
  const z = s * s;
  i = hx - 0x6147a;
  const w = z * z;
  const j = 0x6b851 - hx;
  const t1 = w * (LG2 + w * (LG4 + w * LG6));
  const t2 = z * (LG1 + w * (LG3 + w * (LG5 + w * LG7)));
  i |= j;
  const R = t2 + t1;
  if (i > 0) {
    const hfsq = 0.5 * f * f;
    if (k === 0) return f - (hfsq - s * (hfsq + R));
    return dk * LN2_HI - ((hfsq - (s * (hfsq + R) + dk * LN2_LO)) - f);
  }
  if (k === 0) return f - s * (f - R);
  return dk * LN2_HI - ((s * (f - R) - dk * LN2_LO) - f);
}

// ---- exp (fdlibm e_exp.c en la versión de V8) ----
const O_UMBRAL = 7.09782712893383973096e+02; // por encima: +∞
const U_UMBRAL = -7.45133219101941108420e+02; // por debajo: 0
const INV_LN2 = 1.44269504088896338700e+00;
const P1 = 1.66666666666666019037e-01, P2 = -2.77777777770155933842e-03, P3 = 6.61375632143793436117e-05,
  P4 = -1.65339022054652515390e-06, P5 = 4.13813679705723846039e-08;
const DOS_M1000 = 9.33263618503218878990e-302; // 2^-1000
const DOS_1023 = 8.98846567431157953865e+307; // 2^1023
/** V8 devuelve el valor correcto de e para exp(1) (el algoritmo erraría el último bit). Literal de Math.E. */
const E = 2.718281828459045;

function exp(x: number): number {
  F[0] = x;
  let hx = I[ALTO];
  const xsb = (hx >>> 31) & 1; // signo de x
  hx &= 0x7fffffff; // palabra alta de |x|
  if (hx >= 0x40862e42) { // |x| ≥ 709,78…: no finitos, desborde y subdesborde
    if (hx >= 0x7ff00000) {
      if (((hx & 0xfffff) | I[BAJO]) !== 0) return x + x; // NaN
      return xsb === 0 ? x : 0; // exp(+∞) = +∞, exp(−∞) = 0
    }
    if (x > O_UMBRAL) return Infinity;
    if (x < U_UMBRAL) return 0;
  }
  // Reducción: x = k·ln2 + r con |r| ≤ ln2/2
  let hi = 0, lo = 0, k = 0;
  if (hx > 0x3fd62e42) { // |x| > ln2/2
    if (hx < 0x3ff0a2b2) { // y |x| < 1,5·ln2
      if (x === 1) return E;
      if (xsb === 0) { hi = x - LN2_HI; lo = LN2_LO; k = 1; } else { hi = x + LN2_HI; lo = -LN2_LO; k = -1; }
    } else {
      k = Math.trunc(INV_LN2 * x + (xsb === 0 ? 0.5 : -0.5)); // el (int) de C trunca hacia cero
      const t = k;
      hi = x - t * LN2_HI; // t·LN2_HI es exacto acá
      lo = t * LN2_LO;
    }
    x = hi - lo;
  } else if (hx < 0x3e300000) { // |x| < 2^-28
    return 1 + x;
  }
  const t = x * x;
  const dosAlaK = k >= -1021 ? conPalabras((0x3ff00000 + (k << 20)) | 0, 0) : conPalabras((0x3ff00000 + ((k + 1000) << 20)) | 0, 0);
  const c = x - t * (P1 + t * (P2 + t * (P3 + t * (P4 + t * P5))));
  if (k === 0) return 1 - ((x * c) / (c - 2.0) - x);
  const y = 1 - ((lo - (x * c) / (2.0 - c)) - hi);
  if (k >= -1021) {
    if (k === 1024) return y * 2.0 * DOS_1023;
    return y * dosAlaK;
  }
  return y * dosAlaK * DOS_M1000;
}

// ---- Núcleos de sin y cos en [−π/4, π/4] (fdlibm k_cos.c y k_sin.c) ----
const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05,
  C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04,
  S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;

/** cos(x + y) con |x| ≤ π/4 e y la cola de x. */
function nucleoCos(x: number, y: number): number {
  const ix = palabraAlta(x) & 0x7fffffff;
  if (ix < 0x3e400000) return 1; // |x| < 2^-27
  const z = x * x;
  const r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6)))));
  if (ix < 0x3fd33333) return 1 - (0.5 * z - (z * r - x * y)); // |x| < 0,3
  const qx = ix > 0x3fe90000 ? 0.28125 : conPalabras(ix - 0x00200000, 0); // x/4
  const hz = 0.5 * z - qx;
  const a = 1 - qx;
  return a - (hz - (z * r - x * y));
}

/** sin(x + y) con |x| ≤ π/4; conCola = false cuando y es exactamente 0 (como el iy = 0 de fdlibm). */
function nucleoSin(x: number, y: number, conCola: boolean): number {
  const ix = palabraAlta(x) & 0x7fffffff;
  if (ix < 0x3e400000) return x; // |x| < 2^-27
  const z = x * x;
  const v = z * x;
  const r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6)));
  if (!conCola) return x + v * (S1 + z * r);
  return x - ((z * (0.5 * y - v * r) - y) - v * S1);
}

// ---- Reducción de argumento (fdlibm e_rem_pio2.c, rango medio) ----
// Cody-Waite con π/2 partido en tramos de 33 bits: 2 términos (85 bits) alcanzan salvo cancelación cerca de un múltiplo de π/2,
// donde se agrega un tercero (118 bits) o un cuarto (151 bits), igual que fdlibm. Vale para |x| ≤ 2^19·π/2; el contrato la limita a 1.000.
const INV_PIO2 = 6.36619772367581382433e-01;
const PIO2_1 = 1.57079632673412561417e+00; // primeros 33 bits de π/2
const PIO2_1T = 6.07710050650619224932e-11; // π/2 − PIO2_1
const PIO2_2 = 6.07710050630396597660e-11; // segundos 33 bits
const PIO2_2T = 2.02226624879595063154e-21;
const PIO2_3 = 2.02226624871116645580e-21; // terceros 33 bits
const PIO2_3T = 8.47842766036889956997e-32;
/** Palabras altas de n·π/2 para n = 1…32 (la tabla npio2_hw de fdlibm), calculadas con una multiplicación exacta por IEEE 754. */
const NPIO2_ALTA = new Int32Array(32);
for (let n = 1; n <= 32; n++) NPIO2_ALTA[n - 1] = palabraAlta(n * 1.5707963267948966);
/** Límite del contrato (contratos/matematica.ts). */
const LIMITE_TRIG = 1000;

// Salida de la reducción: x = n·π/2 + (y0 + y1), con |y0 + y1| ≤ π/4 aproximadamente.
let red0 = 0, red1 = 0;
function reducir(x: number, hx: number, ix: number): number {
  if (ix < 0x4002d97c) { // |x| < 3π/4: n = ±1
    if (hx > 0) {
      let z = x - PIO2_1;
      if (ix !== 0x3ff921fb) { red0 = z - PIO2_1T; red1 = (z - red0) - PIO2_1T; } else {
        z -= PIO2_2; red0 = z - PIO2_2T; red1 = (z - red0) - PIO2_2T; // cerca de π/2
      }
      return 1;
    }
    let z = x + PIO2_1;
    if (ix !== 0x3ff921fb) { red0 = z + PIO2_1T; red1 = (z - red0) + PIO2_1T; } else {
      z += PIO2_2; red0 = z + PIO2_2T; red1 = (z - red0) + PIO2_2T;
    }
    return -1;
  }
  let t = Math.abs(x);
  const n = Math.trunc(t * INV_PIO2 + 0.5);
  const fn = n;
  let r = t - fn * PIO2_1;
  let w = fn * PIO2_1T; // primera vuelta: 85 bits
  if (n < 32 && ix !== NPIO2_ALTA[n - 1]) {
    red0 = r - w; // sin cancelación posible
  } else {
    const j = ix >> 20;
    red0 = r - w;
    let i = j - ((palabraAlta(red0) >> 20) & 0x7ff);
    if (i > 16) { // segunda vuelta: 118 bits
      t = r;
      w = fn * PIO2_2;
      r = t - w;
      w = fn * PIO2_2T - ((t - r) - w);
      red0 = r - w;
      i = j - ((palabraAlta(red0) >> 20) & 0x7ff);
      if (i > 49) { // tercera vuelta: 151 bits
        t = r;
        w = fn * PIO2_3;
        r = t - w;
        w = fn * PIO2_3T - ((t - r) - w);
        red0 = r - w;
      }
    }
  }
  red1 = (r - red0) - w;
  if (hx < 0) { red0 = -red0; red1 = -red1; return -n; }
  return n;
}

function fueraDeRango(nombre: string, x: number): Error {
  return new RangeError(`det.${nombre}: se esperaba |x| ≤ ${LIMITE_TRIG} (contratos/matematica.ts) y se recibió ${x}`);
}

function cos(x: number): number {
  const hx = palabraAlta(x);
  const ix = hx & 0x7fffffff;
  if (ix <= 0x3fe921fb) return nucleoCos(x, 0); // |x| ≤ π/4
  if (x !== x) return NaN;
  if (!(Math.abs(x) <= LIMITE_TRIG)) throw fueraDeRango('cos', x);
  const n = reducir(x, hx, ix);
  switch (n & 3) {
    case 0: return nucleoCos(red0, red1);
    case 1: return -nucleoSin(red0, red1, true);
    case 2: return -nucleoCos(red0, red1);
    default: return nucleoSin(red0, red1, true);
  }
}

function sin(x: number): number {
  const hx = palabraAlta(x);
  const ix = hx & 0x7fffffff;
  if (ix <= 0x3fe921fb) return nucleoSin(x, 0, false); // |x| ≤ π/4
  if (x !== x) return NaN;
  if (!(Math.abs(x) <= LIMITE_TRIG)) throw fueraDeRango('sin', x);
  const n = reducir(x, hx, ix);
  switch (n & 3) {
    case 0: return nucleoSin(red0, red1, true);
    case 1: return nucleoCos(red0, red1);
    case 2: return -nucleoSin(red0, red1, true);
    default: return -nucleoCos(red0, red1);
  }
}

/**
 * exp(y·log(x)). Igual que la referencia de contratos/: pow(x, 0) = 1 y pow(0, y) = 0 para todo y ≠ 0 (también y < 0, donde el
 * valor matemático sería +∞; ver nucleo/NOTAS-CONTRATO.md). Con x < 0 da NaN.
 */
function pow(x: number, y: number): number {
  if (y === 0) return 1;
  if (x === 0) return 0;
  return exp(y * log(x));
}

/** La matemática determinista del núcleo. sqrt es la nativa: IEEE 754 la exige correctamente redondeada. */
export const det: MatematicaDeterminista = Object.freeze({ log, exp, cos, sin, pow, sqrt: Math.sqrt });

/** Para las pruebas: la tabla npio2_hw calculada (fdlibm la trae escrita a mano). */
export function tablaNpio2(): Int32Array {
  return NPIO2_ALTA.slice();
}
