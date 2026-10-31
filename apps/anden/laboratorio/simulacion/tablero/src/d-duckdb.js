// DuckDB-WASM sobre los resultados de 100 noches (800 k paquetes) + las 24 KPI por noche: arranque, carga y consultas, en Chromium.
import * as duckdb from '@duckdb/duckdb-wasm';
import { tableFromIPC } from 'apache-arrow';
import { redondear, mediana } from './comun.js';
const B = new URL(location.href).searchParams.get('b') ?? 'eh';
const bundles = {
  mvp: { mainModule: '/wasm/duckdb-mvp.wasm', mainWorker: '/wasm/duckdb-browser-mvp.worker.js' },
  eh: { mainModule: '/wasm/duckdb-eh.wasm', mainWorker: '/wasm/duckdb-browser-eh.worker.js' },
  coi: { mainModule: '/wasm/duckdb-coi.wasm', mainWorker: '/wasm/duckdb-browser-coi.worker.js', pthreadWorker: '/wasm/duckdb-browser-coi.pthread.worker.js' },
};
const t0 = performance.now();
const [bufP, bufK, bufPs, bufKs] = await Promise.all(['paquetes.arrow', 'noches.arrow', 'paquetes.stream.arrow', 'noches.stream.arrow'].map((f) => fetch('/datos/' + f).then((r) => r.arrayBuffer())));
const tFetch = performance.now();
const worker = new Worker(bundles[B].mainWorker);
const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
await db.instantiate(bundles[B].mainModule, bundles[B].pthreadWorker);
const tInst = performance.now();
const conn = await db.connect();
await conn.query('SELECT 1');
const tListo = performance.now();
const tp = tableFromIPC(bufP), tk = tableFromIPC(bufK);
await conn.insertArrowFromIPCStream(new Uint8Array(bufPs), { name: 'paquetes', create: true });
await conn.insertArrowFromIPCStream(new Uint8Array(bufKs), { name: 'noches', create: true });
const tCarga = performance.now();
const filas = Number((await conn.query('SELECT count(*) c FROM paquetes WHERE noche < 100')).toArray()[0].c);

const Q = {
  'Q1 por noche: n, media, P90, max (100 grupos)': 'SELECT noche, count(*)::INT n, avg(espera_min) media, quantile_cont(espera_min, 0.9) p90, max(espera_min) mx FROM paquetes WHERE noche < 100 GROUP BY noche ORDER BY noche',
  'Q2 distribución del P90 entre las 100 noches': 'SELECT quantile_cont(p90, [0.1, 0.5, 0.9]) q FROM (SELECT quantile_cont(espera_min, 0.9) p90 FROM paquetes WHERE noche < 100 GROUP BY noche)',
  'Q3 mapa de calor 5 min x 2 min (cuenta)': 'SELECT floor(creado_min / 5)::INT bx, floor(espera_min / 2)::INT "by", count(*)::INT c FROM paquetes WHERE noche < 100 GROUP BY 1, 2',
  'Q4 unión con KPI: espera media de las noches del 10% peor fin': 'SELECT avg(p.espera_min) m, count(*)::INT n FROM paquetes p JOIN noches k USING (noche) WHERE p.noche < 100 AND k.finClasificacionMin >= (SELECT quantile_cont(finClasificacionMin, 0.9) FROM noches WHERE noche < 100)',
  'Q5 espera P99 por camión y ruta (80 grupos)': 'SELECT camion, ruta, quantile_cont(espera_min, 0.99) p99 FROM paquetes WHERE noche < 100 GROUP BY camion, ruta',
};
const res = {};
let q1 = null;
for (const [nombre, sql] of Object.entries(Q)) {
  const ts = [];
  let out;
  for (let i = 0; i < 6; i++) { const s = performance.now(); out = await conn.query(sql); const a = out.toArray(); ts.push(performance.now() - s); if (i === 0 && nombre.startsWith('Q1')) q1 = a.map((r) => ({ noche: r.noche, media: r.media, p90: r.p90 })); }
  res[nombre] = { filasResultado: out.numRows, msPrimera: redondear(ts[0]), msMediana5: redondear(mediana(ts.slice(1))) };
}
// referencia en JS puro (typed arrays) para Q1: media y P90 por noche; sirve también para comprobar que DuckDB da lo mismo
const xs = tp.getChild('espera_min').toArray(), nh = tp.getChild('noche').toArray();
const tj = [];
let jsQ1;
for (let rep = 0; rep < 5; rep++) {
  const s = performance.now();
  jsQ1 = []; let i = 0;
  while (i < nh.length && nh[i] < 100) { let j = i; const nn = nh[i]; let suma = 0; while (j < nh.length && nh[j] === nn) { suma += xs[j]; j++; }
    const sl = xs.slice(i, j).sort(); const pos = 0.9 * (sl.length - 1), lo = Math.floor(pos); const p90 = sl[lo] + (pos - lo) * ((sl[lo + 1] ?? sl[lo]) - sl[lo]);
    jsQ1.push({ noche: nn, media: suma / (j - i), p90 }); i = j; }
  tj.push(performance.now() - s);
}
let dMax = 0; for (let k = 0; k < jsQ1.length; k++) dMax = Math.max(dMax, Math.abs(jsQ1[k].p90 - q1[k].p90), Math.abs(jsQ1[k].media - q1[k].media));
const mem = (await conn.query('SELECT sum(memory_usage_bytes)::DOUBLE b FROM duckdb_memory()')).toArray()[0].b;
const ver = (await conn.query('SELECT version() v')).toArray()[0].v;
window.__resultado = { lib: `@duckdb/duckdb-wasm 1.32.0 (bundle ${B}), DuckDB ${ver}`, crossOriginIsolated, filasPaquetes100Noches: filas, bytesArrowPaquetes: bufP.byteLength,
  msFetchArrow: redondear(tFetch - t0), msInstanciarWasm: redondear(tInst - tFetch), msPrimeraConsulta: redondear(tListo - tInst), msCargarTablas: redondear(tCarga - tListo),
  consultas: res, jsPuroQ1: { msMediana: redondear(mediana(tj)), maxDifVsDuckDB: dMax }, memoriaDuckDBMB: redondear(mem / 1048576), heapJSMB: redondear(performance.memory.usedJSHeapSize / 1048576) };
