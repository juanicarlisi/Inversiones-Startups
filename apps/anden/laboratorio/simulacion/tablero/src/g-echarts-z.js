// ¿Por qué el zoom de ECharts tarda segundos con 1 M? Tres maneras de hacer zoom sobre el mismo gráfico (modo large, progressive:0).
import { echarts } from '../entradas/echarts-scatter.js';
import { cargarPaquetes, pintado, redondear } from './comun.js';
const d = await cargarPaquetes();
const buf = new Float32Array(d.n * 2); for (let i = 0; i < d.n; i++) { buf[2 * i] = d.x[i]; buf[2 * i + 1] = d.y[i]; }
const salida = [];
async function caso(nombre, filterMode, via) {
  const el = document.createElement('div'); el.style.cssText = 'width:1200px;height:600px'; document.getElementById('app').replaceChildren(el);
  const chart = echarts.init(el, null, { renderer: 'canvas', width: 1200, height: 600 });
  const fin = () => new Promise((r) => chart.one('finished', r));
  let f = fin();
  chart.setOption({ animation: false, grid: { left: 60, right: 20, top: 20, bottom: 50 }, xAxis: { type: 'value', min: 0, max: 300 }, yAxis: { type: 'value', min: 0, max: 60 },
    dataZoom: via === 'dataZoom' ? [{ type: 'inside', xAxisIndex: 0, filterMode }] : [],
    series: [{ type: 'scatter', large: true, largeThreshold: 2000, progressive: 0, progressiveThreshold: 1e9, symbolSize: 2, itemStyle: { color: 'rgba(30,80,200,0.25)' }, data: buf }] });
  await f; await pintado();
  const pasos = [];
  for (let k = 0; k < 3; k++) {
    const a = 20 + k * 15; f = fin(); const s = performance.now();
    if (via === 'dataZoom') chart.dispatchAction({ type: 'dataZoom', startValue: a, endValue: a + 60 });
    else chart.setOption({ xAxis: { min: a, max: a + 60 } });
    await f; await pintado(); pasos.push(redondear(performance.now() - s));
  }
  salida.push({ nombre, msPorPaso: pasos });
  chart.dispose();
}
await caso('dataZoom filterMode none', 'none', 'dataZoom');
await caso('dataZoom filterMode filter', 'filter', 'dataZoom');
await caso('setOption xAxis min/max', 'none', 'setOption');
window.__resultado = { lib: 'echarts zoom', puntos: d.n, casos: salida };
