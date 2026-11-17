// Pasa el ícono SVG a PNG con Chromium (Playwright). Uso: node arte/render.cjs
// Salida en web/iconos/. Se corre solo cuando cambia el dibujo.
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const ARTE = __dirname, OUT = path.join(__dirname, '..', 'web', 'iconos');
const TAREAS = [
  ['icono.svg', 'icono-512.png', 512], ['icono.svg', 'icono-192.png', 192], ['icono.svg', 'apple-touch-icon.png', 180],
  ['icono.svg', 'favicon-32.png', 32], ['icono-maskable.svg', 'icono-maskable-512.png', 512], ['icono-maskable.svg', 'icono-maskable-192.png', 192]
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage();
  for (const [src, dst, tam] of TAREAS) {
    const svg = fs.readFileSync(path.join(ARTE, src), 'utf8');
    await p.setViewportSize({ width: tam, height: tam });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${tam}" height="${tam}" `)}</body></html>`);
    await p.screenshot({ path: path.join(OUT, dst), omitBackground: true, clip: { x: 0, y: 0, width: tam, height: tam } });
  }
  fs.copyFileSync(path.join(ARTE, 'icono.svg'), path.join(OUT, 'icono.svg'));
  await b.close(); console.log('íconos listos en', OUT);
})();
