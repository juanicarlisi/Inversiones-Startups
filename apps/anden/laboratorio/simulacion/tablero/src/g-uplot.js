import { uPlot } from '../entradas/uplot.js';
import { cargarPaquetes, pintado, heapMB, mediana, redondear } from './comun.js';
const d = await cargarPaquetes();
const el = document.getElementById('app');
const h0 = heapMB();
const t0 = performance.now();
// uPlot necesita x ascendente: se ordena (cuenta en el tiempo de preparación)
const idx = new Uint32Array(d.n); for (let i = 0; i < d.n; i++) idx[i] = i;
idx.sort((a, b) => d.x[a] - d.x[b]);
const xs = new Float32Array(d.n), ys = new Float32Array(d.n);
for (let i = 0; i < d.n; i++) { xs[i] = d.x[idx[i]]; ys[i] = d.y[idx[i]]; }
const tPrep = performance.now();
const u = new uPlot({
  width: 1200, height: 600, scales: { x: { time: false }, y: { range: [0, 60] } },
  axes: [{ label: 'min desde 22:00' }, { label: 'espera (min)' }], legend: { show: false }, cursor: { show: false },
  series: [{}, { paths: () => null, points: { show: () => true, size: 2, width: 0, fill: 'rgba(30,80,200,0.25)' } }],
}, [xs, ys], el);
u.setScale('x', { min: 0, max: 300 });
await pintado();
const azulesDe = () => { const px = el.querySelector('canvas').getContext('2d').getImageData(0, 0, 1200, 600).data; let n = 0; for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 0 && px[i + 2] > px[i] + 25) n++; return n; };
const azulesInicial = azulesDe();
const tPrimero = performance.now();
const zooms = [];
for (let k = 0; k < 8; k++) {
  const a = 20 + k * 15, s = performance.now();
  u.setScale('x', { min: a, max: a + 60 });
  await pintado(); zooms.push(performance.now() - s);
}
const azules = azulesDe();
window.__resultado = { lib: 'uPlot 1.6.32 (puntos, canvas)', puntos: d.n, msCargaArrow: redondear(d.msFetch + d.msParse), msPrepararDatos: redondear(tPrep - t0),
  msPrimerPintado: redondear(tPrimero - t0), msZoomMediana: redondear(mediana(zooms)), msZoomMax: redondear(Math.max(...zooms)), pixelesAzulesVistaCompleta: azulesInicial, pixelesAzulesTrasZoom: azules,
  heapMB: heapMB(), heapAntesMB: h0 };
