import { echarts } from '../entradas/echarts-scatter.js';
import { cargarPaquetes, pintado, heapMB, mediana, redondear } from './comun.js';
const d = await cargarPaquetes();
const el = document.getElementById('app');
const PROG = new URL(location.href).searchParams.get('prog'); // 'defecto' = pacing progresivo de ECharts; si no, progressive:0
const h0 = heapMB();
const t0 = performance.now();
const chart = echarts.init(el, null, { renderer: 'canvas', width: 1200, height: 600 });
const buf = new Float32Array(d.n * 2);                       // formato plano [x0,y0,x1,y1,...] (el que usa el modo large sin copiar)
for (let i = 0; i < d.n; i++) { buf[2 * i] = d.x[i]; buf[2 * i + 1] = d.y[i]; }
const tPrep = performance.now();
const finished = () => new Promise((r) => chart.one('finished', r));
const f = finished();
chart.setOption({
  animation: false, grid: { left: 60, right: 20, top: 20, bottom: 50 },
  xAxis: { type: 'value', min: 0, max: 300, name: 'min desde 22:00' }, yAxis: { type: 'value', min: 0, max: 60, name: 'espera (min)' },
  dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none' }],
  series: [{ type: 'scatter', large: true, largeThreshold: 2000, ...(PROG === 'defecto' ? {} : { progressive: 0, progressiveThreshold: 1e9 }),
    symbolSize: 2, itemStyle: { color: 'rgba(30,80,200,0.25)' }, data: buf }],
});
await f; await pintado();
const tPrimero = performance.now();
const azules = (cv) => { const px = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 0 && px[i + 2] > px[i] + 25) n++; return n; };
const azulesInicial = azules(chart.getRenderedCanvas({ backgroundColor: '#fff' }));
const zooms = [];
if (PROG !== 'defecto') for (let k = 0; k < 8; k++) {
  const a = 20 + k * 15, g = finished(), s = performance.now();
  chart.dispatchAction({ type: 'dataZoom', startValue: a, endValue: a + 60 });
  await g; await pintado(); zooms.push(performance.now() - s);
}
const azulesFinal = azules(chart.getRenderedCanvas({ backgroundColor: '#fff' }));
window.__resultado = { lib: 'echarts 6.1.0 (scatter large, canvas, Float32Array plano)' + (PROG === 'defecto' ? ' progresivo por defecto' : ' progressive:0'), puntos: d.n,
  msCargaArrow: redondear(d.msFetch + d.msParse), msPrepararDatos: redondear(tPrep - t0), msPrimerPintado: redondear(tPrimero - t0),
  msZoomMediana: zooms.length ? redondear(mediana(zooms)) : null, msZoomMax: zooms.length ? redondear(Math.max(...zooms)) : null,
  pixelesAzulesVistaCompleta: azulesInicial, pixelesAzulesTrasZoom: azulesFinal, heapMB: heapMB(), heapAntesMB: h0 };
