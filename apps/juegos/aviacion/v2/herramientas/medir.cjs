// Mide cuadros por segundo de cada nivel de calidad con una red de 4 rutas y 8 aviones volando.
//   node herramientas/medir.cjs [segundos = 16]
// Necesita dist/ servido en http://localhost:8812 (npm run servir). En este entorno la GPU es por software (SwiftShader):
// las cifras son un piso, no lo que da un equipo real.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const seg = +(process.argv[2] ?? 16);
  const url = process.env.URL_JUEGO ?? 'http://localhost:8812/index.html';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const filas = [];
  for (const [ancho, alto] of [[1280, 720], [390, 844]]) {
    for (const calidad of (process.env.NIVELES ?? 'bajo,medio,alto,auto').split(',')) {
      const p = await (await b.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 })).newPage();
      const t0 = Date.now();
      await p.goto(`${url}?${calidad === 'auto' ? '' : `calidad=${calidad}&`}nuevo=1&saltar=guia&lang=es`);
      await p.waitForFunction(() => window.__hn?.estado?.escena === 'juego', null, { timeout: 120000 });
      const carga = (Date.now() - t0) / 1000;
      await p.evaluate(() => {
        const h = window.__hn, M = h.M, s = h.s; s.dinero = 500000;
        for (const [a, b2] of [['BUE', 'MVD'], ['BUE', 'BHI'], ['BUE', 'ROS'], ['BUE', 'MDQ']]) { M.abrirRuta(s, a, b2); M.comprarAvion(s, 'golondrina', M.idRuta(a, b2)); M.comprarAvion(s, 'golondrina', M.idRuta(a, b2)); }
        h.avanzar(8); h.mundo.ultimoManual = performance.now() + 1e9; h.verRed(false);
        h.mundo.medidor.historia.length = 0;
      });
      await p.waitForTimeout(seg * 1000);
      const r = await p.evaluate(() => { const m = window.__hn.mundo, hs = m.medidor.historia.slice(1); return { fps: hs.length ? hs.reduce((a, x) => a + x, 0) / hs.length : m.medidor.fps, min: hs.length ? Math.min(...hs) : m.medidor.fps, nivel: m.calidad.nombre, pos: !!m.compositor, escala: m.escalaRes, dpr: m.dprReal, tri: m.r.info.render.triangles, llamadas: m.r.info.render.calls, gpu: (() => { const gl = m.r.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : ''; })() }; });
      filas.push({ pantalla: `${ancho}×${alto}`, pedido: calidad, ...r, carga });
      console.log(`${ancho}×${alto} ${calidad.padEnd(5)} → ${r.fps.toFixed(1)} fps (mín ${r.min.toFixed(1)}) · nivel ${r.nivel} · posproceso ${r.pos ? 'sí' : 'no'} · escala ${r.escala} · carga ${carga.toFixed(1)} s`);
      await p.close();
    }
  }
  console.log('GPU:', filas[0]?.gpu);
  await b.close();
})();
