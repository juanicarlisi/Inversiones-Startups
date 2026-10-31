const { chromium } = require('playwright');
(async () => {
  const srv = await (await import('/home/user/Inversiones-Startups/apps/juegos/aviacion/laboratorio/servidor.mjs')).servir();
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await br.newPage({ viewport: { width: 1366, height: 768 } });
  p.on('console', (m) => console.log('[consola]', m.type(), m.text().slice(0, 300))); p.on('pageerror', (e) => console.log('[error]', String(e).slice(0, 400)));
  await p.goto(srv.url + '/laboratorio/escena/pagina.html?v=dist/globo-maplibre.js&modo=enjambre&w=1366&h=768');
  await p.waitForTimeout(25000);
  console.log('listo', await p.evaluate(() => window.__listo));
  await br.close(); await srv.cerrar();
})();
