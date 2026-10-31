// Referencia, NO candidata: densidad rasterizada a mano (acumula puntos en una grilla de píxeles y pinta con ImageData).
import { cargarPaquetes, pintado, heapMB, mediana, redondear } from './comun.js';
const d = await cargarPaquetes();
const el = document.getElementById('app');
const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 600; el.appendChild(cv);
const ctx = cv.getContext('2d');
function dibujar(x0, x1) {
  const W = 1200, H = 600, acc = new Uint16Array(W * H), sx = W / (x1 - x0), sy = H / 60;
  for (let i = 0; i < d.n; i++) { const X = ((d.x[i] - x0) * sx) | 0, Y = H - 1 - ((d.y[i] * sy) | 0); if (X >= 0 && X < W && Y >= 0 && Y < H) acc[Y * W + X]++; }
  const img = ctx.createImageData(W, H), u32 = new Uint32Array(img.data.buffer);
  for (let i = 0; i < acc.length; i++) { const a = acc[i]; if (a) { const v = Math.min(255, 60 + Math.log2(a + 1) * 40); u32[i] = (255 << 24) | ((255 - v) << 16) | ((255 - v * 0.6) << 8) | 255 - v * 0.3; } else u32[i] = 0xffffffff; }
  ctx.putImageData(img, 0, 0);
}
const h0 = heapMB(), t0 = performance.now();
dibujar(0, 300); await pintado();
const tPrimero = performance.now();
const zooms = [];
for (let k = 0; k < 8; k++) { const a = 20 + k * 15, s = performance.now(); dibujar(a, a + 60); await pintado(); zooms.push(performance.now() - s); }
window.__resultado = { lib: 'referencia: raster de densidad a mano (ImageData)', puntos: d.n, msCargaArrow: redondear(d.msFetch + d.msParse), msPrepararDatos: 0,
  msPrimerPintado: redondear(tPrimero - t0), msZoomMediana: redondear(mediana(zooms)), msZoomMax: redondear(Math.max(...zooms)), heapMB: heapMB(), heapAntesMB: h0 };
