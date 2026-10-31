// Prueba integrada: DuckDB-WASM consulta 100 noches (809.800 paquetes) y ECharts dibuja el resultado agregado (mapa de calor + abanico P10/P50/P90).
import * as duckdb from '@duckdb/duckdb-wasm';
import { echarts } from '../entradas/echarts-scatter.js';
import * as echartsFull from 'echarts';
import { pintado, redondear } from './comun.js';
const t0 = performance.now();
const [bufP, bufK] = await Promise.all(['paquetes.stream.arrow', 'noches.stream.arrow'].map((f) => fetch('/datos/' + f).then((r) => r.arrayBuffer())));
const worker = new Worker('/wasm/duckdb-browser-eh.worker.js');
const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
await db.instantiate('/wasm/duckdb-eh.wasm');
const conn = await db.connect();
await conn.insertArrowFromIPCStream(new Uint8Array(bufP), { name: 'paquetes', create: true });
await conn.insertArrowFromIPCStream(new Uint8Array(bufK), { name: 'noches', create: true });
const tListo = performance.now();
const calor = (await conn.query("SELECT floor(creado_min / 5)::INT bx, floor(espera_min / 1)::INT \"by\", count(*)::INT c FROM paquetes WHERE noche < 100 AND espera_min < 40 GROUP BY 1, 2")).toArray().map((r) => [r.bx, r.by, r.c]);
const abanico = (await conn.query("SELECT floor(creado_min / 5)::INT bx, quantile_cont(espera_min, [0.1, 0.5, 0.9]) q FROM paquetes WHERE noche < 100 GROUP BY 1 ORDER BY 1")).toArray().map((r) => ({ bx: r.bx, q: Array.from(r.q) }));
const tConsultas = performance.now();
const el = document.getElementById('app'); el.style.cssText = 'width:1200px;height:700px';
const a = document.createElement('div'); a.style.cssText = 'width:1200px;height:380px'; const b = document.createElement('div'); b.style.cssText = 'width:1200px;height:320px'; el.append(a, b);
const c1 = echartsFull.init(a, null, { renderer: 'canvas', width: 1200, height: 380 }), c2 = echartsFull.init(b, null, { renderer: 'canvas', width: 1200, height: 320 });
const max = Math.max(...calor.map((x) => x[2]));
c1.setOption({ animation: false, title: { text: 'Cuánto esperan los paquetes · 100 noches', textStyle: { fontSize: 13 } }, grid: { left: 50, right: 90, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: Array.from({ length: 60 }, (_, i) => i * 5), name: 'min desde las 22:00' }, yAxis: { type: 'category', data: Array.from({ length: 40 }, (_, i) => i), name: 'espera (min)' },
  visualMap: { min: 1, max, type: 'piecewise', splitNumber: 5, right: 0, top: 'middle', inRange: { color: ['#dbe8ff', '#1f4fd8', '#0b1f66'] }, formatter: (a, b) => `${Math.round(a)}–${Math.round(b)}` },
  series: [{ type: 'heatmap', data: calor, progressive: 0 }] });
c2.setOption({ animation: false, title: { text: 'Abanico P10 / P50 / P90 de la espera', textStyle: { fontSize: 13 } }, grid: { left: 50, right: 20, top: 30, bottom: 30 }, xAxis: { type: 'category', data: abanico.map((x) => x.bx * 5) }, yAxis: { type: 'value', name: 'min' },
  series: [0, 1, 2].map((i) => ({ type: 'line', symbol: 'none', data: abanico.map((x) => x.q[i]), name: ['P10', 'P50', 'P90'][i], lineStyle: { width: i === 1 ? 2.5 : 1.2 } })), legend: { right: 10, top: 0 } });
await new Promise((r) => setTimeout(r, 50)); await pintado();
const tFin = performance.now();
window.__resultado = { lib: 'DuckDB-WASM 1.32.0 + ECharts 6.1.0 (completo)', filas: 809800, celdasCalor: calor.length, puntosAbanico: abanico.length, msCargaYConsultas: redondear(tConsultas - t0), msArranqueMasCarga: redondear(tListo - t0),
  msSoloConsultas: redondear(tConsultas - tListo), msDibujar: redondear(tFin - tConsultas), msTotalHastaVerElTablero: redondear(tFin - t0) };
