// Mide una página que carga recursos de la red (stlite + Pyodide por el proxy del entorno): tiempo hasta «listo», bytes por origen.
//   NODE_PATH=/opt/node-tools/node_modules node tablero/medir-red.mjs stlite.html [--rep=2]
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { servir } from './servir.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const pagina = process.argv[2], rep = Number((process.argv.find((a) => a.startsWith('--rep=')) ?? '--rep=1').split('=')[1]);
const srv = await servir(8765);
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--enable-precise-memory-info', '--proxy-server=' + process.env.HTTPS_PROXY, '--proxy-bypass-list=127.0.0.1;localhost'] });
const salida = [];
for (let i = 0; i < rep; i++) {
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const urls = new Map(), bytes = {}; let total = 0;
  cdp.on('Network.requestWillBeSent', (e) => urls.set(e.requestId, e.request.url));
  cdp.on('Network.loadingFinished', (e) => { const u = urls.get(e.requestId) ?? '?'; const o = (() => { try { return new URL(u).host; } catch { return '?'; } })(); bytes[o] = (bytes[o] ?? 0) + e.encodedDataLength; total += e.encodedDataLength; });
  const porHost = {}; let comprimidos = 0;
  page.on('requestfinished', async (rq) => { try { const z = await rq.sizes(); const h = new URL(rq.url()).host; porHost[h] = (porHost[h] ?? 0) + z.responseBodySize + z.responseHeadersSize; comprimidos += z.responseBodySize + z.responseHeadersSize; } catch {} });
  const errores = []; page.on('pageerror', (e) => errores.push(String(e).slice(0, 200))); page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text().slice(0, 160)); });
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:8765/${pagina}`);
  let r;
  try { await page.waitForFunction('window.__resultado', null, { timeout: 280000 }); r = await page.evaluate('window.__resultado'); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  r.msTotal = Date.now() - t0; r.MBtransferidos = +(comprimidos / 1048576).toFixed(1); r.MBporOrigen = Object.fromEntries(Object.entries(porHost).map(([k, v]) => [k, +(v / 1048576).toFixed(2)])); r.errores = errores.slice(0, 5);
  r.heapMB = await page.evaluate('performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576) : null');
  if (i === 0) await page.screenshot({ path: `resultados/capturas/${pagina.replace('.html', '')}.png` });
  salida.push(r); await ctx.close();
}
console.log(JSON.stringify(salida, null, 1));
writeFileSync(`resultados/${pagina.replace('.html', '')}.json`, JSON.stringify(salida, null, 1));
await br.close(); srv.close();
