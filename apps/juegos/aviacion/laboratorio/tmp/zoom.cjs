const { chromium } = require('playwright');
(async () => {
  const srv = await (await import('/home/user/Inversiones-Startups/apps/juegos/aviacion/laboratorio/servidor.mjs')).servir();
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [v, q] of [['dist/canvas2d-opt.js', ''], ['dist/pixi.js', '&pref=canvas']]) {
    const p = await br.newPage({ viewport: { width: 1366, height: 768 } });
    await p.goto(srv.url + `/laboratorio/escena/pagina.html?v=${v}&modo=real&w=1366&h=768${q}`);
    await p.waitForFunction(() => window.__listo, null, { timeout: 120000 });
    const cdp = await p.context().newCDPSession(p);
    for (const rate of [1, 4]) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate });
      const ms = await p.evaluate(async () => {
        const h = window.__hn, out = [];
        for (let i = 0; i < 12; i++) { h.escena.cam.z *= 1.003; const a = performance.now(); h.dibujarUno(); out.push(performance.now() - a); await new Promise((r) => setTimeout(r, 0)); }
        out.sort((x, y) => x - y); return { dibujoConCamaraNueva: +out[6].toFixed(1), capaFija: h.msCapaFija?.() ?? null, reconstruccion: h.msReconstruir?.() ?? null };
      });
      console.log(v, q, 'x' + rate, JSON.stringify(ms));
    }
    await p.close();
  }
  await br.close(); await srv.cerrar();
})();
