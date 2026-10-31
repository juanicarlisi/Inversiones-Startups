// Perspective 5.6.1 (cliente WASM + visor + datagrid + gráficos WebGL) sobre 1 M de paquetes: carga, agrupación y vistas, en Chromium.
const nm = '/nm/@perspective-dev/';
const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = nm + 'viewer/dist/css/themes.css'; document.head.appendChild(link);
const t0 = performance.now();
const { default: perspective } = await import(nm + 'client/dist/cdn/perspective.js');
await import(nm + 'viewer/dist/cdn/perspective-viewer.js');
await import(nm + 'viewer-datagrid/dist/cdn/perspective-viewer-datagrid.js');
await import(nm + 'viewer-charts/dist/cdn/perspective-viewer-charts.js');
const tImport = performance.now();
const buf = await (await fetch('/datos/paquetes.arrow')).arrayBuffer();
const tFetch = performance.now();
const r = { lib: '@perspective-dev 5.6.1 (client+viewer+datagrid+charts)' };
const worker = await perspective.worker();
const tabla = await worker.table(buf);
const tTabla = performance.now();
r.filas = await tabla.size();
const vista = await tabla.view({ group_by: ['noche'], columns: ['espera_min'], aggregates: { espera_min: 'avg' } });
const cols = await vista.to_columns();
const tAgrupar = performance.now();
r.gruposPorNoche = cols['espera_min'].length;
const vista2 = await tabla.view({ group_by: ['camion', 'ruta'], columns: ['espera_min'], aggregates: { espera_min: 'avg' } });
await vista2.to_columns();
const tAgrupar2 = performance.now();
const viewer = document.createElement('perspective-viewer'); viewer.style.cssText = 'width:1200px;height:600px;display:block'; document.getElementById('app').appendChild(viewer);
const pl = await viewer.getAllPlugins?.() ?? [];
r.plugins = pl.map((p) => p.name);
const tV0 = performance.now();
await viewer.load(tabla);
await viewer.restore({ plugin: 'Datagrid', columns: ['noche', 'camion', 'ruta', 'clase', 'creado_min', 'espera_min', 'vueltas'] });
await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
const tGrid = performance.now();
const candidatos = ['X/Y Scatter', 'Scatter', 'Heatmap'];
const conTope = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('tope de ' + ms + ' ms')), ms))]);
const intentos = [];
for (const nombre of candidatos) {
  const s = performance.now();
  try { await conTope(viewer.restore({ plugin: nombre, columns: ['creado_min', 'espera_min'] }), 45000); await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))); intentos.push({ nombre, ms: Math.round(performance.now() - s), plugin: (await viewer.save()).plugin }); }
  catch (e) { intentos.push({ nombre, error: String(e).slice(0, 120) }); }
}
const scatter = intentos;
const gl = (() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2') || c.getContext('webgl'); return g ? g.getParameter(g.VERSION) : null; })();
r.webgl = gl;
Object.assign(r, { msImportarModulos: Math.round(tImport - t0), msFetchArrow: Math.round(tFetch - tImport), msCrearTabla1M: Math.round(tTabla - tFetch),
  msAgruparPorNoche: Math.round(tAgrupar - tTabla), msAgrupar80: Math.round(tAgrupar2 - tAgrupar), msDatagrid1M: Math.round(tGrid - tV0), scatterWebGL: scatter, heapJSMB: Math.round(performance.memory.usedJSHeapSize / 1048576) });
window.__resultado = r;
