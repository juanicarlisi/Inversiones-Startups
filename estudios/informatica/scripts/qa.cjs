// Control de calidad automático: abre cada día escrito en un navegador real, busca bloques que no se dibujan y ejecuta todo el código de ejemplo.
// Uso: python3 construir.py /tmp/x.html && node scripts/qa.cjs /tmp/x.html
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForFunction(() => window.DATOS && document.querySelector('#main') && document.querySelector('#main').innerText.length > 50, null, { timeout: 15000 }); await p.waitForTimeout(300);
  const ids = await p.evaluate(() => DATOS.orden.filter(i => DATOS.dias[i]));
  let runs = 0, bad = [];
  for (const id of ids) {
    await p.evaluate(h => { location.hash = '#dia-' + h; }, id); await p.waitForTimeout(250);
    const txt = await p.evaluate(() => document.querySelector('#main').innerText);
    const m = txt.match(/\[(bloque|diagrama|widget)[^\]]*\]|no soportado|no disponible|No se pudo cargar|diagrama no válido/i); if (m) bad.push(id + ': ' + m[0]);
    const nrun = await p.locator('[data-acc="js-run"]').count();
    for (let i = 0; i < nrun; i++) {
      await p.locator('[data-acc="js-run"]').nth(i).click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(350);
      const s = await p.locator('.codigo .salida').nth(i).evaluate(e => ({ t: e.textContent, err: e.classList.contains('err') }));
      runs++; if (s.err || /Error:/.test(s.t) && !/a propósito|esperado/.test(s.t)) bad.push(`${id} código #${i + 1}: ${s.t.slice(0, 90).replace(/\n/g, ' ')}`);
    }
    const svgs = await p.evaluate(() => [...document.querySelectorAll('.diag svg')].filter(s => s.getBBox && (s.getBoundingClientRect().width < 50)).length); if (svgs) bad.push(id + ': svg colapsado');
  }
  console.log(`${ids.length} días revisados, ${runs} bloques de código ejecutados`);
  console.log(bad.length ? 'PROBLEMAS:\n' + bad.join('\n') : 'sin problemas de render ni de ejecución'); console.log(errs.length ? errs.slice(0, 5).join('\n') : 'sin errores de JavaScript'); await b.close();
})();
