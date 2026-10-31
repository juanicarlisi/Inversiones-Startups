// Arnés de medición (Playwright + CDP). Uso: NODE_PATH=/opt/node-tools/node_modules node bench.cjs <config.json|nombre-de-matriz>
// Por corrida: abre la variante, estrangula la CPU del hilo principal (CDP Emulation.setCPUThrottlingRate), mide rAF (fps reales),
// cuadros sincrónicos (dibujo + fin del trabajo de GPU), CPU por proceso (SystemInfo.getProcessInfo) y toma una captura.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const EXE = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
// Sin banderas de GPU: forzar --use-angle=swiftshader pasa la composición por SwiftShader y hunde todo a ~17 fps (medido: relleno plano de pantalla completa).
const BASE_FLAGS = ['--autoplay-policy=no-user-gesture-required'];
async function rssPropio(bcdp) { // MB de RSS por tipo de proceso de ESTE navegador (pids de SystemInfo.getProcessInfo; no suma navegadores ajenos)
  const o = {}; try { const r = await bcdp.send('SystemInfo.getProcessInfo'); for (const p of r.processInfo) { const kb = +fs.readFileSync(`/proc/${p.id}/statm`, 'utf8').split(' ')[1] * 4; o[p.type] = (o[p.type] ?? 0) + kb / 1024; } } catch {} for (const k of Object.keys(o)) o[k] = Math.round(o[k]); return o; }
const os = require('os');
async function servidor() { const m = await import('./servidor.mjs'); return m.servir(); }

async function infoProcesos(browserCdp) {
  const r = await browserCdp.send('SystemInfo.getProcessInfo');
  const out = {};
  for (const p of r.processInfo) out[p.type] = (out[p.type] ?? 0) + p.cpuTime;
  return out;
}

async function corrida(br, base, c) {
  let out0 = null;
  const ctx = await br.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: c.dpr ?? 1 });
  const page = await ctx.newPage();
  const logs = []; page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(m.text().slice(0, 200)); }); page.on('pageerror', (e) => logs.push('pageerror ' + String(e).slice(0, 300)));
  const cdp = await ctx.newCDPSession(page); await cdp.send('Performance.enable');
  const bcdp = await br.newBrowserCDPSession();
  const q = new URLSearchParams({ v: c.v, modo: c.modo ?? 'real', w: c.w, h: c.h, dpr: c.dpr ?? 1, ...(c.q ?? {}) });
  if (c.red) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: c.red.rtt, downloadThroughput: c.red.kbps * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  if (c.cargaRate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: c.cargaRate });
  const t0 = Date.now();
  await page.goto(`${base}/laboratorio/escena/pagina.html?${q}`);
  await page.waitForFunction(() => window.__listo === true, null, { timeout: 180000 });
  const msCarga = Date.now() - t0;
  out0 = await page.evaluate(() => ({ marcas: window.__hn.marcas(), recursos: performance.getEntriesByType('resource').map((r) => ({ n: r.name.split('/').pop().slice(0, 30), enviado: r.transferSize, crudo: r.decodedBodySize })) }));
  if (c.red) { await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }); }
  if (c.cargaRate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const out = { config: c, msCarga, carga: out0, loadavgInicio: os.loadavg()[0] };
  if (c.soloCarga) { await ctx.close(); return { ...out, logs }; }
  if (c.contar) { out.llamadas = await page.evaluate(() => window.__hn.contarLlamadas(30)); await ctx.close(); return { ...out, logs }; }
  if (c.captura) { await page.evaluate(() => window.__hn.dibujarUno()); await page.waitForTimeout(400); await page.screenshot({ path: path.join(__dirname, 'capturas', c.captura) }); }
  if ((c.rate ?? 1) > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: c.rate });
  const m = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
  const m0 = await m(), p0 = await infoProcesos(bcdp);
  await page.evaluate(() => window.__hn.partes?.());
  out.raf = await page.evaluate((s) => window.__hn.medirRaf(s), c.seg ?? 8);
  out.partes = await page.evaluate(() => window.__hn.partes?.() ?? null);
  const m1 = await m(), p1 = await infoProcesos(bcdp);
  const n = out.raf.cuadrosTotal;
  out.porCuadro = { hiloPrincipalMs: +((m1.TaskDuration - m0.TaskDuration) * 1000 / n).toFixed(2), scriptMs: +((m1.ScriptDuration - m0.ScriptDuration) * 1000 / n).toFixed(2),
    cpuProcesoMs: Object.fromEntries(Object.keys(p1).map((k) => [k, +(((p1[k] - (p0[k] ?? 0)) * 1000) / n).toFixed(2)])) };
  out.sync = await page.evaluate((n) => window.__hn.medirSync(n), c.nSync ?? 30);
  out.rssMB = await rssPropio(bcdp);
  out.loadavg = os.loadavg().map((x) => +x.toFixed(1));
  out.heapMB = +(((await m()).JSHeapUsedSize) / 1048576).toFixed(1);
  out.extra = await page.evaluate(() => ({ renderer: window.__hn.renderer?.(), msInit: window.__hn.msInit?.(), nombre: window.__hn.nombre, hora: window.__hn.hora() })).catch(() => ({}));
  await ctx.close();
  return { ...out, logs };
}

(async () => {
  const arg = path.join(__dirname, 'configs', process.argv[2] + '.json');
  const cfgs = JSON.parse(fs.readFileSync(arg, 'utf8'));
  const srv = await servidor();
  const salida = {};
  const porFlags = {};
  for (const c of cfgs.corridas) { const k = JSON.stringify(c.flags ?? []); (porFlags[k] ??= []).push(c); }
  const res = [];
  for (const [k, lista] of Object.entries(porFlags)) {
    const br = await chromium.launch({ executablePath: EXE, args: [...BASE_FLAGS, ...JSON.parse(k)] });
    if (cfgs.gpu) { const p = await br.newPage(); await p.goto('chrome://gpu'); await p.waitForTimeout(1500); salida.gpu = (await p.evaluate(() => document.body.innerText)).split('\n').filter((l) => /Canvas|WebGL|Rasterization|Compositing|GL_RENDERER|ANGLE|WebGPU/.test(l)).slice(0, 14); await p.close(); }
    for (const c of lista) {
      for (let r = 0; r < (c.reps ?? 1); r++) {
        const cc = { ...c, captura: r === 0 ? c.captura : undefined };
        try { const o = await corrida(br, srv.url, cc); o.rep = r; res.push(o); console.log(`${c.v} ${c.modo} x${c.rate ?? 1} ${c.w}x${c.h} rep${r}: fps ${o.raf?.fps} iv50 ${o.raf?.intervaloP50} js ${o.raf?.jsMedia} sync ${o.sync?.msMediana} proc ${JSON.stringify(o.porCuadro?.cpuProcesoMs)}`); }
        catch (e) { console.log('FALLÓ', c.v, e.message.slice(0, 300)); res.push({ config: c, error: e.message.slice(0, 500) }); }
      }
    }
    await br.close();
  }
  salida.corridas = res;
  fs.writeFileSync(path.join(__dirname, 'resultados', cfgs.nombre + '.json'), JSON.stringify(salida, null, 1));
  await srv.cerrar();
})();
