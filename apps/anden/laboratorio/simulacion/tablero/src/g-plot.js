import { Plot } from '../entradas/plot.js';
import { cargarPaquetes, pintado, heapMB, redondear } from './comun.js';
const d = await cargarPaquetes();
const el = document.getElementById('app');
const h0 = heapMB();
const escalera = [];
for (const n of [10000, 50000, 100000, 250000]) {
  if (n > d.n) continue;
  el.replaceChildren();
  const s = performance.now();
  const g = Plot.plot({ width: 1200, height: 600, x: { domain: [0, 300] }, y: { domain: [0, 60] },
    marks: [Plot.dot({ length: n }, { x: d.x.subarray(0, n), y: d.y.subarray(0, n), r: 1, fill: 'rgba(30,80,200,0.25)', stroke: null })] });
  el.appendChild(g); await pintado();
  escalera.push({ puntos: n, nodosSvg: g.querySelectorAll('circle').length, ms: redondear(performance.now() - s) });
}
// 1 M como mapa de calor (se agrupa antes de dibujar): lo que Plot sí puede hacer con volumen
el.replaceChildren();
const s2 = performance.now();
const g2 = Plot.plot({ width: 1200, height: 600, color: { scheme: 'blues', type: 'log' },
  marks: [Plot.rect({ length: d.n }, Plot.bin({ fill: 'count' }, { x: d.x, y: d.y, thresholds: 150, interval: undefined, inset: 0 }))] });
el.appendChild(g2); await pintado();
const msMapa = redondear(performance.now() - s2);
window.__resultado = { lib: 'Observable Plot 0.6.17 (SVG)', puntos: d.n, puntosSvg: escalera, mapaDeCalor1M: { ms: msMapa, rectangulos: g2.querySelectorAll('rect').length }, heapMB: heapMB(), heapAntesMB: h0 };
