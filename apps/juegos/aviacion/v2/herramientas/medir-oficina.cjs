// Mide cuánto tarda un cuadro de la oficina en cada nivel de calidad y, al lado, uno del mapa del juego.
//   node herramientas/medir-oficina.cjs [muestras = 9]
// Cómo mide: abre el mapa y la oficina (de día y de noche) a la vez, frena el bucle del mapa y va dibujando UN cuadro de
// cada uno por turno, esperando a que la GPU termine (lee un píxel). Así la carga de la máquina pesa igual en los tres.
// Informa la mediana. En este entorno la GPU es por software (SwiftShader): las cifras son un piso; vale la comparación.
// Necesita la demostración servida (node herramientas/demo-oficina.mjs --servir → :8813) y dist/ servido en :8812
// (cualquier servidor de archivos). NIVELES=bajo,medio,alto.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const muestras = +(process.argv[2] ?? 9);
  const urlOficina = process.env.URL_OFICINA ?? 'http://localhost:8813/index.html', urlJuego = process.env.URL_JUEGO ?? 'http://localhost:8812/index.html';
  const niveles = (process.env.NIVELES ?? 'bajo,medio,alto').split(',');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const mediana = (xs) => { const o = [...xs].sort((a, c) => a - c); return o[Math.floor(o.length / 2)]; };
  const f = (ms) => `${ms.toFixed(0).padStart(5)} ms (${(1000 / ms).toFixed(1).padStart(4)} cps)`;
  console.log('pantalla   nivel    mapa                 oficina de día       oficina de noche     oficina ÷ mapa (en cuadros por segundo)');
  for (const [ancho, alto] of [[1280, 720], [390, 844]]) for (const calidad of niveles) {
    const ctx = await b.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, hasTouch: ancho < 600, isMobile: ancho < 600 });
    const abrir = async (url) => { const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('[error]', String(e).slice(0, 200))); await p.goto(url); return p; };
    const pm = await abrir(`${urlJuego}?calidad=${calidad}&nuevo=1&saltar=guia&lang=es`);
    await pm.waitForFunction(() => window.__hn?.estado?.escena === 'juego', null, { timeout: 180000 });
    await pm.evaluate(() => {      // la misma red que mide herramientas/medir.cjs: 4 rutas y 8 aviones volando; después se frena su bucle
      const h = window.__hn, M = h.M, s = h.s; s.dinero = 500000;
      for (const [a, b2] of [['BUE', 'MVD'], ['BUE', 'BHI'], ['BUE', 'ROS'], ['BUE', 'MDQ']]) { M.abrirRuta(s, a, b2); M.comprarAvion(s, 'golondrina', M.idRuta(a, b2)); M.comprarAvion(s, 'golondrina', M.idRuta(a, b2)); }
      h.avanzar(8); h.mundo.ultimoManual = performance.now() + 1e9; h.verRed?.(false); h.avanzar(3);
      window.requestAnimationFrame = () => 0;
    });
    const oficinas = [];
    for (const hora of [10, 22]) { const p = await abrir(`${urlOficina}?manual=1&calidad=${calidad}&hora=${hora}&lang=es`); await p.waitForFunction(() => window.__lista === true, null, { timeout: 180000 }); await p.evaluate(() => window.__oficina.depurar.avanzar(3)); oficinas.push(p); }
    const delMapa = () => pm.evaluate(() => { const m = window.__hn.mundo, gl = m.r.getContext(), px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t = performance.now(); m.cuadro(performance.now()); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return performance.now() - t; });
    const deOficina = (p) => p.evaluate(() => { const o = window.__oficina.depurar, gl = o.escena.r.getContext(), px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t = performance.now(); o.paso(0.033); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return performance.now() - t; });
    const M = [], D = [], N = [];
    for (let i = 0; i < muestras + 2; i++) { const a = await delMapa(), c = await deOficina(oficinas[0]), e = await deOficina(oficinas[1]); if (i >= 2) { M.push(a); D.push(c); N.push(e); } }
    const m = mediana(M), d = mediana(D), n = mediana(N);
    console.log(`${`${ancho}×${alto}`.padEnd(10)} ${calidad.padEnd(7)}  ${f(m)}   ${f(d)}   ${f(n)}   ${(m / d).toFixed(2)} de día · ${(m / n).toFixed(2)} de noche`);
    await ctx.close();
  }
  await b.close();
})().catch((e) => { console.error('FALLO', String(e).slice(0, 400)); process.exit(1); });
