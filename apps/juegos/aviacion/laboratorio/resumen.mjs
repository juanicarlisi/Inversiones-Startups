// Resume resultados/<nombre>.json en una tabla (media de repeticiones). Uso: node resumen.mjs matriz
import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync(new URL(`./resultados/${process.argv[2] ?? 'matriz'}.json`, import.meta.url)));
const g = {};
for (const r of d.corridas) { if (r.error) { console.log('ERROR', r.config.v, r.error.slice(0, 80)); continue; } const c = r.config; const k = [c.id ?? c.v, c.modo, 'x' + (c.rate ?? 1), c.w + 'x' + c.h].join(' | '); (g[k] ??= []).push(r); }
const m = (a) => a.reduce((x, y) => x + y, 0) / a.length, f = (x, n = 1) => (x === undefined || Number.isNaN(x) ? '-' : x.toFixed(n));
console.log('variante | modo | CPU | res | n | fps (rep) | iv p50 | iv p95 | JS ms | hiloPrincipal ms | renderer ms | GPU ms | sync ms | partes | heap MB | RSS renderer/gpu MB');
for (const [k, rs] of Object.entries(g)) {
  console.log(k, '|', rs.length, '|', rs.map((r) => r.raf.fps).join('/'), '|', f(m(rs.map((r) => r.raf.intervaloP50))), '|', f(m(rs.map((r) => r.raf.intervaloP95))), '|', f(m(rs.map((r) => r.raf.jsMedia))), '|', f(m(rs.map((r) => r.porCuadro.hiloPrincipalMs))), '|',
    f(m(rs.map((r) => r.porCuadro.cpuProcesoMs.renderer))), '|', f(m(rs.map((r) => r.porCuadro.cpuProcesoMs.GPU))), '|', f(m(rs.map((r) => r.sync.msMediana))), '|', JSON.stringify(rs[0].partes), '|', f(m(rs.map((r) => r.heapMB))), '|', rs.map((r) => (r.rssMB?.renderer ?? '-') + '/' + (r.rssMB?.['gpu-process'] ?? '-')).join(','), '| en vuelo', rs[0].raf.enVuelo);
}
