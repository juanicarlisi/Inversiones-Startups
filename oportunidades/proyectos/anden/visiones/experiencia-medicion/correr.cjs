// Andén · visión «Experiencia» · corre el banco del navegador con Playwright (Chromium sin interfaz, gráficos por software).
// Uso: DEPS=<carpeta con node_modules de three y mediabunny> node correr.cjs
// Sirve esta carpeta y, en /node_modules/, la de DEPS. Guarda resultados-navegador.json y capturas PNG.
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const AQUI = __dirname, DEPS = process.env.DEPS;
const tipos = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = u.startsWith('/node_modules/') ? path.join(DEPS, u) : path.join(AQUI, u === '/' ? 'banco.html' : u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise((ok) => srv.listen(9873, ok));
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); p.on('pageerror', (e) => console.error('error:', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.error('consola:', m.text()); });
  await p.goto('http://localhost:9873/'); await p.waitForFunction('window.listo === true');
  const cdp = await p.context().newCDPSession(p);
  const ev = (x) => p.evaluate(x); const out = { fecha: '2026-10-17', entorno: await ev('T.entorno()') };
  console.log(JSON.stringify(out.entorno));
  const enlace = JSON.parse(fs.readFileSync(path.join(AQUI, 'resultados-enlace.json'))); // para el tamaño; el fragmento se rehace acá
  const { deflateRawSync } = require('zlib'); const doc = fs.readFileSync(path.join(AQUI, 'modelo-ejemplo.json'), 'utf8');
  const frag = deflateRawSync(Buffer.from(JSON.stringify(JSON.parse(doc))), { level: 9 }).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  for (const cual of ['base', 'grande']) {
    const r = { escena: await ev(`T.simular('${cual}', 2)`) }; console.log(cual, JSON.stringify(r.escena));
    r.worker = await ev(`T.simularWorker('${cual}', 6)`);
    await ev('T.vista2d(60)'); await ev('T.vistaIso(30)'); // corrida descartada: el primer lienzo paga el cambio de modo de lectura de Chromium (medido: 34 ms → 0,9 ms)
    r.soloJS = await ev('T.soloJS(120)');
    r.plano2d = await ev('T.vista2d(120)');
    r.iso = await ev('T.vistaIso(120)');
    r.tresD = await ev('T.vista3d(40, 1)');
    r.tresDmitad = await ev('T.vista3d(40, 0.5)');
    for (const tasa of [4, 6]) { await cdp.send('Emulation.setCPUThrottlingRate', { rate: tasa });
      r['cpu' + tasa + 'x'] = { soloJS: await ev('T.soloJS(60)'), plano2d: await ev('T.vista2d(60)'), iso: await ev('T.vistaIso(60)') };
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }); }
    if (cual === 'base') {
      for (const m of ['2d', 'iso', '3d']) { const url = await ev(`T.captura('${m}')`); fs.writeFileSync(path.join(AQUI, `captura-${m}.png`), Buffer.from(url.split(',')[1], 'base64')); }
      r.video = await ev('T.video(10, 30)');
      r.primerCuadro = await ev(`T.primerCuadro(${JSON.stringify(frag)})`);
      r.fragmentoCaracteres = frag.length; r.enlaceNode = enlace.modeloCompleto.fragmentoDeflate;
    }
    out[cual] = r; console.log(cual, JSON.stringify(r));
  }
  fs.writeFileSync(path.join(AQUI, 'resultados-navegador.json'), JSON.stringify(out, null, 1));
  await b.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
