import { logDet, expDet, cosDet } from './detmath.mjs';
let a = 7; const u = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const A = new Float64Array(1), B = new Float64Array(1), AI = new BigInt64Array(A.buffer), BI = new BigInt64Array(B.buffer);
for (const [nom, f, g, gen] of [['exp', Math.exp, expDet, () => (u() - 0.5) * 60], ['cos(2πu)', Math.cos, cosDet, () => 2 * Math.PI * u()], ['log', Math.log, logDet, () => u()]]) {
  let dist = 0, maxUlp = 0n; const N = 2e6;
  for (let i = 0; i < N; i++) { const x = gen(); A[0] = f(x); B[0] = g(x); if (AI[0] !== BI[0]) { dist++; const d = AI[0] > BI[0] ? AI[0] - BI[0] : BI[0] - AI[0]; if (d > maxUlp) maxUlp = d; } }
  console.log(`${nom.padEnd(9)} distintos de Math.* ${(100 * dist / N).toFixed(3)}%  máx ${maxUlp} ulp`);
}
