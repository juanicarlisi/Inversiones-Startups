// Ayudas comunes de las pruebas de navegador (Playwright). Cada prueba levanta su propio servidor estático en un puerto libre (o usa
// HN_URL si está), así no depende de nada externo. Rutas de Playwright y Chromium por variables de entorno, con las del entorno
// de Claude como respaldo (no se corre «playwright install»).
//   node pruebas/navegador/clics.cjs [carpeta-de-capturas]
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function servir(raiz = RAIZ) {
  if (process.env.HN_URL) return Promise.resolve({ url: process.env.HN_URL.replace(/\/$/, ''), cerrar: async () => {} });
  return new Promise((ok) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const archivo = path.join(raiz, u === '/' ? 'index.html' : u);
      if (!archivo.startsWith(raiz)) { res.writeHead(403); res.end(); return; }
      fs.readFile(archivo, (e, datos) => {
        if (e) { res.writeHead(404); res.end('no'); return; }
        res.writeHead(200, { 'content-type': TIPOS[path.extname(archivo)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
        res.end(datos);
      });
    });
    srv.listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${srv.address().port}`, cerrar: () => new Promise((r) => srv.close(r)) }));
  });
}

function playwright() {
  for (const p of [process.env.PLAYWRIGHT, '/opt/node22/lib/node_modules/playwright', 'playwright']) {
    if (!p) continue;
    try { return require(p); } catch { /* sigue */ }
  }
  throw new Error('No encuentro Playwright (PLAYWRIGHT=ruta)');
}
async function navegador() {
  const { chromium } = playwright();
  const exe = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  return chromium.launch({ executablePath: fs.existsSync(exe) ? exe : undefined });
}

// Una página nueva con su contexto. errores: los de la página y los console.error.
async function abrir(b, url, { ancho = 1280, alto = 720, tactil = false, locale = 'es-AR', init = null, reducido = false, sinAlmacenamiento = false, guardado = null } = {}) {
  const ctx = await b.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, hasTouch: tactil, isMobile: tactil, locale,
    reducedMotion: reducido ? 'reduce' : 'no-preference' });
  if (sinAlmacenamiento) await ctx.addInitScript(() => { const roto = () => { throw new DOMException('bloqueado', 'SecurityError'); }; Object.defineProperty(window, 'localStorage', { get: roto }); });
  if (guardado) await ctx.addInitScript(([k, v]) => { try { if (!sessionStorage.getItem('hn-sembrado')) { localStorage.setItem(k, v); sessionStorage.setItem('hn-sembrado', '1'); } } catch { /* nada */ } }, ['hubnocturno.partida.v1', guardado]);
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(`console: ${m.text()}`); });
  p.errores = errores;
  p.ctx = ctx;
  p.tactil = tactil;
  await p.goto(url);
  await p.waitForFunction(() => window.__juego && document.getElementById('app') && !document.getElementById('app').hidden, null, { timeout: 15000 });
  return p;
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
// Toca «Empezar» en la portada (si está).
async function empezar(p) {
  const b = p.locator('#ventana .portada .boton.principal');
  if (await b.count()) { if (p.tactil) await b.tap(); else await b.click(); }
  await p.waitForFunction(() => window.__juego.vis.escena === 'juego');
}
// Coordenadas de página de una ciudad del mapa.
async function ciudad(p, id) {
  return p.evaluate((id) => { const [x, y] = window.__juego.pantalla(id); const r = document.getElementById('mapa').getBoundingClientRect(); return [r.left + x, r.top + y]; }, id);
}
// Toca o hace clic en un elemento según el contexto de la página (táctil o mouse).
async function pulsar(p, loc) { if (p.tactil) await loc.tap(); else await loc.click(); }
// Toque o clic según el contexto.
async function tocar(p, x, y, tactil) { if (tactil) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); }

let fallas = 0;
function verificar(ok, msj, datos) {
  if (!ok) fallas++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${msj}${datos !== undefined ? ` ${typeof datos === 'string' ? datos : JSON.stringify(datos)}` : ''}`);
  return ok;
}
function terminar() { console.log(fallas ? `\n${fallas} fallas` : '\ntodo bien'); process.exitCode = fallas ? 1 : 0; }
const carpeta = (def) => { const c = process.argv[2] || def; if (c) fs.mkdirSync(c, { recursive: true }); return c; };

module.exports = { RAIZ, servir, navegador, abrir, esperar, empezar, ciudad, tocar, pulsar, verificar, terminar, carpeta, playwright };
