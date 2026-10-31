// Variantes de ECharts para entender el costo: ¿datos? ¿dataZoom? ¿modo large? ¿render?
import { echarts } from '../entradas/echarts-scatter.js';
import { cargarPaquetes, pintado, redondear } from './comun.js';
const d = await cargarPaquetes();
const salida = [];
async function variante(nombre, { large = true, zoom = true, formato = 'pairs', prog = undefined, simbolo = 2 }) {
  const el = document.createElement('div'); el.style.cssText = 'width:1200px;height:600px;position:absolute;left:0;top:0'; document.getElementById('app').replaceChildren(el);
  const chart = echarts.init(el, null, { renderer: 'canvas', width: 1200, height: 600 });
  const t0 = performance.now();
  let datos;
  if (formato === 'pairs') { datos = new Array(d.n); for (let i = 0; i < d.n; i++) datos[i] = [d.x[i], d.y[i]]; }
  else { datos = new Float32Array(d.n * 2); for (let i = 0; i < d.n; i++) { datos[2 * i] = d.x[i]; datos[2 * i + 1] = d.y[i]; } }
  const t1 = performance.now();
  const fin = new Promise((r) => chart.one('finished', r));
  chart.setOption({ animation: false, grid: { left: 60, right: 20, top: 20, bottom: 50 }, xAxis: { type: 'value', min: 0, max: 300 }, yAxis: { type: 'value', min: 0, max: 60 },
    ...(zoom ? { dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none' }] } : {}),
    series: [{ type: 'scatter', large, ...(large ? { largeThreshold: 2000 } : {}), ...(prog !== undefined ? { progressive: prog, progressiveThreshold: 1e9 } : {}), symbolSize: simbolo, itemStyle: { color: 'rgba(30,80,200,0.25)' }, data: datos }] });
  const t2 = performance.now();
  await fin; await pintado();
  const t3 = performance.now();
  const cv = chart.getRenderedCanvas({ backgroundColor: '#fff' }); const px = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let az = 0; for (let i = 0; i < px.length; i += 4) if (px[i + 2] > px[i] + 25) az++;
  salida.push({ nombre, n: d.n, msDatos: redondear(t1 - t0), msSetOption: redondear(t2 - t1), msHastaFinished: redondear(t3 - t2), pixelesAzules: az });
  chart.dispose();
}
await variante('large + Float32Array plano, progresivo por defecto', { formato: 'f32', zoom: false });
await variante('large + Float32Array plano, progressive:0', { formato: 'f32', zoom: false, prog: 0 });
await variante('large + Float32Array + dataZoom, progressive:0', { formato: 'f32', zoom: true, prog: 0 });
await variante('large + pares, progressive:0', { formato: 'pairs', zoom: false, prog: 0 });
window.__resultado = { lib: 'echarts 6.1.0 variantes', variantes: salida };
