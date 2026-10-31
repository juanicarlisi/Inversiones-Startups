const { chromium } = require('playwright');
(async () => {
  const srv = await (await import('/home/user/Inversiones-Startups/apps/juegos/aviacion/laboratorio/servidor.mjs')).servir();
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await br.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto(srv.url + '/laboratorio/escena/pagina.html?v=dist/canvas2d-opt.js&modo=enjambre&w=1366&h=768');
  await p.waitForFunction(() => window.__listo, null, { timeout: 120000 });
  const cdp = await p.context().newCDPSession(p);
  for (const rate of [1, 4]) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    const r = await p.evaluate(async () => {
      const R = await import('/js/render.js'); const { s, cam } = window.__hn_est ?? {};
      return null;
    }).catch(() => null);
  }
  // el estado no está expuesto: se arma uno igual con el módulo del laboratorio
  const r = await p.evaluate(async () => {
    const R = await import('/js/render.js'); const E = await import('/laboratorio/escena/estado.js'); const D = await import('/js/datos.js');
    const s = E.escenaNoche(); const cam = R.crearCamara(D.CAPITULOS[2].vista, 1366, 768, { arriba: 0, abajo: 0, izq: 0, der: 0 });
    for (const a of s.aviones) { const rt = s.rutas.find((x) => x.id === a.ruta); a.fase = 'vuelo'; a.en = rt.a; a.hacia = rt.b; a.dur = 60; a.resta = 20; }
    const t = (n) => { const a = performance.now(); let acc = 0; for (let k = 0; k < n; k++) for (const av of s.aviones) acc += R.posAvion(cam, 1366, 768, av, 0.5)[0]; return (performance.now() - a) / n; };
    t(50); return +t(400).toFixed(3);
  });
  console.log('posAvion x300 aviones, ms por cuadro (1×):', r);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const r4 = await p.evaluate(async () => { const R = await import('/js/render.js'); const E = await import('/laboratorio/escena/estado.js'); const D = await import('/js/datos.js'); const s = E.escenaNoche(); const cam = R.crearCamara(D.CAPITULOS[2].vista, 1366, 768, { arriba: 0, abajo: 0, izq: 0, der: 0 }); for (const a of s.aviones) { const rt = s.rutas.find((x) => x.id === a.ruta); a.fase = 'vuelo'; a.en = rt.a; a.hacia = rt.b; a.dur = 60; a.resta = 20; } const t = (n) => { const a = performance.now(); let acc = 0; for (let k = 0; k < n; k++) for (const av of s.aviones) acc += R.posAvion(cam, 1366, 768, av, 0.5)[0]; return (performance.now() - a) / n; }; t(20); return +t(100).toFixed(3); });
  console.log('posAvion x300, 4×:', r4);
  await br.close(); await srv.cerrar();
})();
