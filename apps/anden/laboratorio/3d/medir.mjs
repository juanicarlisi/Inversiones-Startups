// Mide la escena en Chromium con WebGL por software (SwiftShader) y saca capturas. Uso: node medir.mjs <config.json|nombre> ...
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const RAIZ = path.dirname(new URL(import.meta.url).pathname);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.hdr': 'application/octet-stream', '.png': 'image/png', '.json': 'application/json' };
const srv = http.createServer((req, res) => { const f = path.join(RAIZ, decodeURIComponent(req.url.split('?')[0])); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
const args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--disable-frame-rate-limit'];
export async function correr(trabajos) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args, headless: true });
  const salida = [];
  for (const j of trabajos) {
    const page = await browser.newPage({ viewport: { width: j.w || 1280, height: j.h || 720 } }); const logs = [];
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(m.text().slice(0, 200)); }); page.on('response', (r) => { if (r.status() >= 400) logs.push('HTTP ' + r.status() + ' ' + r.url().slice(-60)); }); page.on('pageerror', (e) => logs.push('pageerror ' + String(e).slice(0, 300)));
    const qs = new URLSearchParams({ w: j.w || 1280, h: j.h || 720, ...j.q }).toString(); const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${port}/${j.pagina || 'index.html'}?${qs}`);
    try { await page.waitForFunction(() => window.__lab && (window.__lab.listo || window.__lab.error), null, { timeout: 240000 }); } catch (e) { salida.push({ nombre: j.nombre, error: 'timeout de carga', logs }); await page.close(); continue; }
    const err = await page.evaluate(() => window.__lab.error); if (err) { salida.push({ nombre: j.nombre, error: err.slice(0, 600), logs }); await page.close(); continue; }
    const carga_s = (Date.now() - t0) / 1000; let med = null; const comp = await page.evaluate(() => window.__lab.composicion || null);
    if (j.frames) med = await page.evaluate((f) => window.__lab.medir(f.n, f.cal, f.dt), { n: j.frames, cal: j.calentar ?? 2, dt: 1 / 60 });
    if (j.captura) { const url = await page.evaluate(() => { window.__lab.dibujar(); return document.getElementById('c').toDataURL('image/png'); }); fs.mkdirSync(path.join(RAIZ, 'salida/capturas'), { recursive: true }); fs.writeFileSync(path.join(RAIZ, 'salida/capturas', j.captura), Buffer.from(url.split(',')[1], 'base64')); }
    const r = { nombre: j.nombre, ...j.q, w: j.w || 1280, h: j.h || 720, carga_s, ...(comp ? { composicion: comp } : {}), ...(med || {}), logs: logs.slice(0, 4) }; salida.push(r); console.log(JSON.stringify(r)); await page.close();
  }
  await browser.close(); srv.close(); return salida;
}
if (process.argv[1].endsWith('medir.mjs')) { const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const r = await correr(jobs); fs.mkdirSync(path.join(RAIZ, 'salida'), { recursive: true }); fs.writeFileSync(path.join(RAIZ, 'salida', (process.argv[3] || 'medicion') + '.json'), JSON.stringify(r, null, 1)); }
