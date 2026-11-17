// Dibuja los PNG del ícono a partir de los SVG (una sola vez; los PNG quedan en src/iconos/).
// Uso: node herramientas/iconos.mjs   (usa el Playwright instalado en el entorno, sin descargar nada)
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const dir = fileURLToPath(new URL('../src/iconos/', import.meta.url));
const salidas = [
  ['telar.svg', 'icono-192.png', 192],
  ['telar.svg', 'icono-512.png', 512],
  ['telar-maskable.svg', 'icono-maskable-512.png', 512],
  ['telar-maskable.svg', 'icono-maskable-192.png', 192],
  ['telar-maskable.svg', 'apple-touch-icon.png', 180],
];
const nav = await chromium.launch({ args: ['--no-sandbox'] });
const pag = await nav.newPage();
for (const [svg, png, lado] of salidas) {
  const fuente = readFileSync(dir + svg, 'utf8');
  await pag.setViewportSize({ width: lado, height: lado });
  await pag.setContent(`<style>html,body{margin:0;background:transparent}svg{width:${lado}px;height:${lado}px;display:block}</style>${fuente}`);
  await pag.screenshot({ path: dir + png, omitBackground: true });
  console.log('listo', png);
}
await nav.close();
