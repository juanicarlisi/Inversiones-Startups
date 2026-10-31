// Streamlit (servidor Python) en Chromium: tiempo hasta ver la tabla, bytes del frontend, memoria del servidor con 1 y con 5 sesiones.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const pid = readFileSync('resultados/streamlit.pid', 'utf8').trim();
const rss = () => Number(execSync(`ps -o rss= -p ${pid}`).toString().trim()) / 1024;
const hijos = () => { try { return execSync(`ps --ppid ${pid} -o rss= | awk '{s+=$1} END {print s+0}'`).toString().trim() / 1024; } catch { return 0; } };
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const salida = { rssServidorAntesMB: +rss().toFixed(1) };
const tiempos = [];
const paginas = [];
for (let i = 0; i < 5; i++) {
  const ctx = await br.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  let bytes = 0; page.on('requestfinished', async (rq) => { try { const z = await rq.sizes(); bytes += z.responseBodySize + z.responseHeadersSize; } catch {} });
  const t0 = Date.now();
  await page.goto('http://127.0.0.1:8601/');
  await page.waitForSelector('[data-testid="stDataFrame"]', { timeout: 120000 });
  await page.waitForTimeout(500);
  tiempos.push({ msHastaTabla: Date.now() - t0, MBfrontend: +(bytes / 1048576).toFixed(2) });
  if (i === 0) { await page.screenshot({ path: 'resultados/capturas/streamlit.png' }); salida.rssServidor1SesionMB = +rss().toFixed(1); }
  paginas.push(ctx);
}
salida.rssServidor5SesionesMB = +rss().toFixed(1);
salida.sesiones = tiempos;
console.log(JSON.stringify(salida, null, 1));
writeFileSync('resultados/streamlit.json', JSON.stringify(salida, null, 1));
await br.close();
