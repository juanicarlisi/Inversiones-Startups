// exp y cos deterministas (adaptación de fdlibm e_exp.c, k_cos.c, k_sin.c): solo + - * / exactos de IEEE 754.
import { logDet } from '../../../../conocimiento/anden-simulador-2026-10/medicion-tecnologia/detlog.mjs';
export { logDet };
const F = new Float64Array(1), I = new Int32Array(F.buffer);
const ln2HI = 6.93147180369123816490e-01, ln2LO = 1.90821492927058770002e-10, invln2 = 1.44269504088896338700e+00,
  P1 = 1.66666666666666019037e-01, P2 = -2.77777777770155933842e-03, P3 = 6.61375632143793436117e-05,
  P4 = -1.65339022054652515390e-06, P5 = 4.13813679705723846039e-08, twom1000 = 9.33263618503218878990e-302;
export function expDet(x) {
  F[0] = x; let hx = I[1]; const xsb = (hx >>> 31) & 1; hx &= 0x7fffffff;
  if (hx >= 0x40862E42) { if (hx >= 0x7ff00000) { if (((hx & 0xfffff) | I[0]) !== 0) return x + x; return xsb === 0 ? x : 0; }
    if (x > 7.09782712893383973096e+02) return Infinity; if (x < -7.45133219101941108420e+02) return 0; }
  let hi = 0, lo = 0, k = 0;
  if (hx > 0x3fd62e42) {
    if (hx < 0x3FF0A2B2) { hi = xsb ? x + ln2HI : x - ln2HI; lo = xsb ? -ln2LO : ln2LO; k = 1 - xsb - xsb; }
    else { k = Math.trunc(invln2 * x + (xsb ? -0.5 : 0.5)); const t = k; hi = x - t * ln2HI; lo = t * ln2LO; }
    x = hi - lo;
  } else if (hx < 0x3e300000) return 1 + x;
  const t = x * x, c = x - t * (P1 + t * (P2 + t * (P3 + t * (P4 + t * P5))));
  if (k === 0) return 1 - ((x * c) / (c - 2.0) - x);
  const y = 1 - ((lo - (x * c) / (2.0 - c)) - hi);
  F[0] = y; if (k >= -1021) { I[1] += (k << 20); return F[0]; } I[1] += ((k + 1000) << 20); return F[0] * twom1000;
}
const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05,
  C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04,
  S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
function kcos(x, y) { const z = x * x, r = z * (C1 + z * (C2 + z * (C3 + z * (C4 + z * (C5 + z * C6))))); F[0] = x; const ix = I[1] & 0x7fffffff;
  if (ix < 0x3FD33333) return 1 - (0.5 * z - (z * r - x * y));
  let qx; if (ix > 0x3fe90000) qx = 0.28125; else { I[1] = ix - 0x00200000; I[0] = 0; qx = F[0]; }
  const hz = 0.5 * z - qx, a = 1 - qx; return a - (hz - (z * r - x * y)); }
function ksin(x, y) { const z = x * x, v = z * x, r = S2 + z * (S3 + z * (S4 + z * (S5 + z * S6))); return x - ((z * (0.5 * y - v * r) - y) - v * S1); }
const PIO2_1 = 1.57079632673412561417e+00, PIO2_1T = 6.07710050650619224932e-11, INVPIO2 = 6.36619772367581382433e-01;
// cos para |x| < ~1e5 (alcanza para 2πu); reducción de Cody-Waite con dos términos
export function cosDet(x) { const n = Math.round(x * INVPIO2); const fn = n; const r = x - fn * PIO2_1; const w = fn * PIO2_1T; const y0 = r - w; const y1 = (r - y0) - w;
  switch (((n % 4) + 4) % 4) { case 0: return kcos(y0, y1); case 1: return -ksin(y0, y1); case 2: return -kcos(y0, y1); default: return ksin(y0, y1); } }
