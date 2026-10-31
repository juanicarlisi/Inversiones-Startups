// Mide en Chromium (el del entorno, sin GPU: dibuja por software) cada página de tablero. Uso:
//   NODE_PATH=/opt/node-tools/node_modules node tablero/medir.mjs g-echarts g-uplot g-raster g-plot --rep=3
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { servir } from './servir.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const args = process.argv.slice(2);
const rep = Number((args.find((a) => a.startsWith('--rep=')) ?? '--rep=3').split('=')[1]);
const extra = (args.find((a) => a.startsWith('--q=')) ?? '--q=').slice(4);
const paginas = args.filter((a) => !a.startsWith('--'));
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const srv = await servir(8765);
const br = await chromium.launch({ executablePath: CHROME, args: ['--enable-precise-memory-info', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
mkdirSync('resultados/capturas', { recursive: true });
const todo = existsSync('resultados/graficos.json') ? JSON.parse(readFileSync('resultados/graficos.json', 'utf8')) : {};
for (const p of paginas) {
  const corridas = [];
  for (let i = 0; i < rep; i++) {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    const errores = [];
    page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => errores.push(String(e).slice(0, 200)));
    const t0 = Date.now();
    try { await page.goto(`http://127.0.0.1:8765/pagina.html?p=${p}${extra ? '&' + extra : ''}`, { waitUntil: 'domcontentloaded', timeout: 120000 }); } catch (e) { errores.push('goto: ' + String(e).slice(0, 100)); }
    try {
      await page.waitForFunction('window.__resultado', null, { timeout: 240000 });
      const r = await page.evaluate('window.__resultado');
      r.msTotalPagina = Date.now() - t0; r.errores = errores;
      corridas.push(r);
      if (i === 0) { try { await page.screenshot({ path: `resultados/capturas/${p.replace('.mjs', '')}${extra ? '-' + extra.replace(/[=&]/g, '_') : ''}.png`, timeout: 90000 }); } catch {} }
    } catch (e) { corridas.push({ error: String(e).slice(0, 200), errores }); }
    try { await ctx.close(); } catch {}
  }
  todo[p + (extra ? '?' + extra : '')] = corridas;
  writeFileSync('resultados/graficos.json', JSON.stringify(todo, null, 1));
  console.log(p, JSON.stringify(corridas.map((c) => c.error ? c.error : { primer: c.msPrimerPintado, zoom: c.msZoomMediana, heap: c.heapMB })));
}
writeFileSync('resultados/graficos.json', JSON.stringify(todo, null, 1));
await br.close(); srv.close();
