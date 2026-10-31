import { posicionesAMatrices } from './adaptador.js';
for (const n of [5000, 20000, 100000]) {
  const pos = { n, x: new Float32Array(n), y: new Float32Array(n), ang: new Float32Array(n), estado: new Uint8Array(n) }; for (let i = 0; i < n; i++) { pos.x[i] = (i % 400) * 0.2; pos.y[i] = (i / 400) | 0; pos.ang[i] = i * 0.01; pos.estado[i] = i % 7; }
  const out = new Float32Array(n * 16), col = new Float32Array(n * 3), paleta = [0x9b6f43, 0xe8b21a, 0xb3222a, 0x888888, 0xff7a00, 0x00a0ff, 0x555555];
  for (let i = 0; i < 50; i++) posicionesAMatrices(pos, out, [0.4, 0.25, 0.3], 0.8, col, paleta);
  const reps = 400, t0 = performance.now(); for (let i = 0; i < reps; i++) posicionesAMatrices(pos, out, [0.4, 0.25, 0.3], 0.8, col, paleta); const ms = (performance.now() - t0) / reps;
  console.log(JSON.stringify({ entidades: n, ms_por_cuadro: +ms.toFixed(3), MB_subidos_por_cuadro: +((n * 16 * 4 + n * 3 * 4) / 1048576).toFixed(2) }));
}
