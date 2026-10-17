// Philox4x32-10 en JS puro (Salmon y otros, SC11). Solo aritmética entera exacta de 32 bits.
const M0 = 0xD2511F53, M1 = 0xCD9E8D57, W0 = 0x9E3779B9, W1 = 0xBB67AE85;
function mulhi(a, b) { // parte alta de a*b, ambos uint32
  const a0 = a & 0xffff, a1 = a >>> 16, b0 = b & 0xffff, b1 = b >>> 16;
  const p00 = a0 * b0, p01 = a0 * b1, p10 = a1 * b0, p11 = a1 * b1;
  const mid = (p00 >>> 16) + (p01 & 0xffff) + (p10 & 0xffff);
  return (p11 + (p01 >>> 16) + (p10 >>> 16) + (mid >>> 16)) >>> 0;
}
export function philox(c0, c1, c2, c3, k0, k1, out) {
  for (let r = 0; r < 10; r++) {
    const h0 = mulhi(M0, c0), l0 = Math.imul(M0, c0) >>> 0;
    const h1 = mulhi(M1, c2), l1 = Math.imul(M1, c2) >>> 0;
    const n0 = (h1 ^ c1 ^ k0) >>> 0, n2 = (h0 ^ c3 ^ k1) >>> 0;
    c0 = n0; c1 = l1; c2 = n2; c3 = l0;
    k0 = (k0 + W0) >>> 0; k1 = (k1 + W1) >>> 0;
  }
  out[0] = c0; out[1] = c1; out[2] = c2; out[3] = c3;
}
const o = new Uint32Array(4); const hex = (a) => Array.from(a, (x) => x.toString(16).padStart(8, '0')).join(' ');
const kat = [
  [[0,0,0,0],[0,0],'6627e8d5 e169c58d bc57ac4c 9b00dbd8'],
  [[0xffffffff,0xffffffff,0xffffffff,0xffffffff],[0xffffffff,0xffffffff],'408f276d 41c83b0e a20bc7c6 6d5451fd'],
  [[0x243f6a88,0x85a308d3,0x13198a2e,0x03707344],[0xa4093822,0x299f31d0],'d16cfe09 94fdcceb 5001e420 24126ea1'],
];
for (const [c,k,esp] of kat) { philox(c[0],c[1],c[2],c[3],k[0],k[1],o); console.log(hex(o) === esp ? 'KAT ok ' : 'KAT FALLA', hex(o)); }
// velocidad: uniformes de 53 bits por segundo (2 por llamada)
for (let rep = 0; rep < 3; rep++) {
  let s = 0; const N = 5e6; const t0 = performance.now();
  for (let i = 0; i < N; i++) { philox(i, 7, 0, 0, 12345, 678, o); s += ((o[0] >>> 5) * 67108864 + (o[1] >>> 6)) / 9007199254740992 + ((o[2] >>> 5) * 67108864 + (o[3] >>> 6)) / 9007199254740992; }
  const dt = performance.now() - t0; console.log(`llamadas/s ${(N / dt / 1e3).toFixed(1)} M · uniformes53/s ${(2 * N / dt / 1e3).toFixed(1)} M`, s > 0 ? '' : '');
}
