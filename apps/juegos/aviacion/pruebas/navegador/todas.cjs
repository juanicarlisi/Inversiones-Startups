// Corre todas las pruebas de navegador, una detrás de otra, y resume. Uso: node pruebas/navegador/todas.cjs [carpeta-capturas]
const { spawnSync } = require('child_process');
const path = require('path');
const PRUEBAS = ['clics', 'entrada', 'medidas', 'misiones', 'logistica', 'ronda', '99_lista_portal', 'jugador_pantalla'];
const out = process.argv[2];
const res = [];
for (const n of PRUEBAS) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(__dirname, `${n}.cjs`), ...(out ? [path.join(out, n)] : [])], { encoding: 'utf8', timeout: 15 * 60 * 1000 });
  const fallas = (r.stdout.match(/^FALLA/gm) ?? []).length, oks = (r.stdout.match(/^ok/gm) ?? []).length;
  res.push({ prueba: n, ok: oks, fallas, segundos: Math.round((Date.now() - t0) / 1000), codigo: r.status });
  process.stdout.write(r.stdout.split('\n').filter((l) => l.startsWith('FALLA')).map((l) => `  ${n}: ${l}\n`).join(''));
}
console.table(res);
process.exitCode = res.some((x) => x.fallas || x.codigo) ? 1 : 0;
