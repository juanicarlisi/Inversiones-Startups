// Auditoría de accesibilidad con axe-core (WCAG 2.1 A y AA + buenas prácticas) en 8 pantallas: cronograma, detalle,
// tablero y primer proyecto, en claro y oscuro. Uso: npm install && python3 build.py && node pruebas/accesibilidad.mjs
// Elección (regla 10, 17-11-2026): axe-core 4.14.1 (Deque, MPL-2.0; github.com/dequelabs/axe-core), el motor de
// auditoría de accesibilidad de referencia; versión fija en package.json. Regla de corte: si deja de mantenerse, Lighthouse.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { servir } from './servidor.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const { srv, url } = await servir();
const nav = await chromium.launch({ args: ['--no-sandbox'] });
let problemas = 0;

async function auditar(nombre, prep, opts) {
  const ctx = await nav.newContext({ ...opts, bypassCSP: true }); // bypassCSP solo para inyectar axe en la prueba
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForSelector('#canvas .row');
  if (prep) await prep(p);
  await p.waitForTimeout(400);
  await p.addScriptTag({ content: AXE });
  const v = await p.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] });
    return r.violations.map((x) => `${x.impact} ${x.id}: ${x.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  });
  problemas += v.length;
  console.log(`${v.length ? 'MAL' : 'ok '}  ${nombre}${v.length ? '\n     ' + v.join('\n     ') : ''}`);
  await ctx.close();
}

const ancho = { viewport: { width: 1280, height: 800 } };
const celu = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
try {
  for (const colorScheme of ['light', 'dark']) {
    await auditar(`cronograma 1280 ${colorScheme}`, (p) => p.click('#segLevel button[data-v="tareas"]'), { ...ancho, colorScheme });
    await auditar(`detalle 1280 ${colorScheme}`, async (p) => {
      await p.click('#segLevel button[data-v="tareas"]');
      await p.click('.row.task .nm');
    }, { ...ancho, colorScheme });
    await auditar(`tablero 390 ${colorScheme}`, (p) => p.tap('#segView button[data-v="board"]'), { ...celu, colorScheme });
    await auditar(`primer proyecto 390 ${colorScheme}`, async (p) => {
      await p.tap('#borrarEjemplo');
      await p.waitForSelector('#formPrimero');
      await p.waitForTimeout(3000); // que se vaya el aviso
    }, { ...celu, colorScheme });
  }
} finally {
  await nav.close();
  srv.close();
  console.log(problemas ? `\n${problemas} problemas de accesibilidad` : '\nSin problemas de accesibilidad');
  if (problemas) process.exitCode = 1;
}
