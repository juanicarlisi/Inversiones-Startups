// Uso: node captura.cjs <archivo.html> <salida-prefijo> "<hash1>,<hash2>" [tema=light|dark] [movil=1]
const { chromium } = require('playwright');
(async () => {
  const [, , file, pref, hashes = '', tema = 'light', movil = ''] = process.argv;
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext(movil ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
  await p.emulateMedia({ colorScheme: tema });
  await p.goto('file://' + file); await p.waitForTimeout(400);
  let i = 0;
  for (const h of (hashes || '#/').split(',')) {
    await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(500);
    await p.screenshot({ path: `${pref}-${i++}.png`, fullPage: !!process.env.FULL });
  }
  console.log(errs.length ? errs.join('\n') : 'sin errores de consola');
  await b.close();
})();
