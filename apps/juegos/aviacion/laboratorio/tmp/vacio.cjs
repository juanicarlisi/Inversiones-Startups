// Pixi con una escena casi vacía (solo el mar) para separar el costo fijo de SwiftShader del costo de la escena.
const { chromium } = require('playwright');
(async () => {
  const srv = await (await import('/home/user/Inversiones-Startups/apps/juegos/aviacion/laboratorio/servidor.mjs')).servir();
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await br.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto(srv.url + '/laboratorio/escena/vacio.html');
  await p.waitForFunction(() => window.__r, null, { timeout: 60000 });
  console.log(JSON.stringify(await p.evaluate(() => window.__r)));
  await br.close(); await srv.cerrar();
})();
