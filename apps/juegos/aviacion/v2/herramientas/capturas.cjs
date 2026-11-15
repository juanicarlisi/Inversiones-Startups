// Saca las 8 capturas del README jugando de verdad el primer minuto (y armando la noche y la base).
//   node herramientas/capturas.cjs [carpeta = capturas] [calidad = alto]
// Necesita dist/ servido en http://localhost:8812 (npm run servir). Con GPU por software tarda unos minutos.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const carpeta = path.resolve(process.argv[2] ?? path.join(__dirname, '..', 'capturas'));
const calidad = process.argv[3] ?? 'alto';
const url = process.env.URL_JUEGO ?? 'http://localhost:8812/index.html';
const solo = process.env.SOLO ? process.env.SOLO.split(',') : null;
fs.mkdirSync(carpeta, { recursive: true });

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const abrir = async (ancho, alto, extra = '') => {
    const ctx = await b.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, hasTouch: ancho < 600, isMobile: ancho < 600 });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('[error]', String(e).slice(0, 300)));
    await p.goto(`${url}?calidad=${calidad}&nuevo=1&lang=es${extra}`);
    await p.waitForFunction(() => window.__hn?.estado, null, { timeout: 120000 });
    await p.waitForTimeout(3000);
    return p;
  };
  const foto = async (p, nombre, espera = 3500) => { await p.waitForTimeout(espera); await p.screenshot({ path: path.join(carpeta, nombre), type: 'jpeg', quality: 84 }); console.log('  ✓', nombre); };
  const clic = async (p, sel) => { await p.waitForSelector(sel, { state: 'attached', timeout: 60000 }); await p.waitForTimeout(400); await p.evaluate((s) => document.querySelector(s)?.click(), sel); };
  const hasta = (p, fn, arg) => p.waitForFunction(fn, arg, { timeout: 240000, polling: 400 });
  const quiere = (n) => !solo || solo.includes(n);

  // El primer minuto, en escritorio o en celular: devuelve la página en el paso pedido.
  async function primerMinuto(p, fotos) {
    if (fotos.portada) await foto(p, fotos.portada, 5000);
    await clic(p, '[data-accion="nuevaPartida"]');
    await p.waitForTimeout(1500);
    if (fotos.entrada) { await p.evaluate(() => { const m = window.__hn.mundo; m.cine.t = 0.9; m.avanzarCine(0); }); await foto(p, fotos.entrada, 4000); }
    await p.evaluate(() => { const h = window.__hn; h.mundo.cortarCine(); h.avanzar(2.5); });
    await hasta(p, () => window.__hn.estado.guia === 'tocar');
    if (fotos.guia) await foto(p, fotos.guia, 5000); else await p.waitForTimeout(6000); // que la cámara termine de llegar
    const pos = await p.evaluate(() => { const m = window.__hn.mundo, o = m.aPantalla(m.ciudades.get('MVD').pos, {}); return [o.x, o.y]; });
    await p.mouse.click(pos[0], pos[1]);
    await hasta(p, () => window.__hn.estado.guia === 'ruta');
    if (fotos.panel) await foto(p, fotos.panel, 4000);
    await clic(p, '[data-accion="abrirRuta"]');
    await hasta(p, () => window.__hn.estado.guia === 'avion');
    if (fotos.hangar) await foto(p, fotos.hangar, 6000);
    await clic(p, '[data-accion="comprar"]');
    // el vuelo corre en tiempo real (con GPU por software va en cámara lenta): se espera a que el avión esté a mitad de camino
    await hasta(p, () => { const h = window.__hn, a = h.s.aviones[0]; return a && a.fase === 'vuelo' && (1 - a.resta / a.dur) > 0.42; });
    if (fotos.vuelo) await foto(p, fotos.vuelo, 300);
    // el cartel de misión cumplida dura 3 s: se lo espera a él (no al paso de la guía) para no llegar tarde
    if (fotos.cobro) { await p.waitForSelector('#cartel:not([hidden]) .prm', { timeout: 240000 }); await foto(p, fotos.cobro, 900); }
    else await hasta(p, () => window.__hn.estado.guia === 'cobro');
  }

  if (quiere('escritorio')) {
    console.log('escritorio 1280×720');
    const p = await abrir(1280, 720);
    await primerMinuto(p, { portada: '01-portada.jpg', entrada: '02-entrada.jpg', guia: '03-guia-primer-toque.jpg', vuelo: '04-primer-vuelo.jpg', cobro: '05-primer-cobro.jpg' });
    await p.close();
  }
  if (quiere('noche')) {
    console.log('noche con faros y vista de la base');
    const p = await abrir(1280, 720, '&saltar=guia');
    await p.evaluate(() => { const h = window.__hn, M = h.M, s = h.s; s.dinero = 300000;
      for (const [a, b2, n] of [['BUE', 'MVD', 2], ['BUE', 'BHI', 2], ['BUE', 'ROS', 1], ['BUE', 'MDQ', 1]]) { M.abrirRuta(s, a, b2); for (let i = 0; i < n; i++) M.comprarAvion(s, 'golondrina', M.idRuta(a, b2)); }
      for (const k of ['base', 'tarde', 'noche', 'encargo', 'faros', 'despegueNoche', 'ciudades', 'perdio']) h.ver(k);
      h.avanzar(52);
      for (let i = 0; i < 600 && !(M.hora(s) >= 17.9 && M.hora(s) < 18.3); i++) h.avanzar(0.25);
      s.dinero = 86400; h.mundo.ultimoManual = performance.now() + 1e9; h.limpiar(); h.elegir({ tipo: 'ciudad', id: 'BUE' });
    });
    await foto(p, '07-base-atardecer.jpg', 9000);
    await p.evaluate(() => { const h = window.__hn, M = h.M, s = h.s; h.accion('cerrarPanel', {}, null);
      for (let i = 0; i < 600 && !(M.hora(s) >= 20.5 && M.hora(s) < 21); i++) h.avanzar(0.25);
      for (const r of s.rutas.slice(0, 3)) M.ponerBalizas(s, r.id);
      s.flags.despNoche1 = true; // sin la tarjeta del primer vuelo nocturno: la captura muestra la red
      h.limpiar(); h.accion('cerrarPanel', {}, null); h.verRed();
    });
    await foto(p, '06-noche-faros.jpg', 12000);
    await p.close();
  }
  if (quiere('celular')) {
    console.log('celular 390×844');
    const p = await abrir(390, 844);
    await primerMinuto(p, { hangar: '08-celular-avion.jpg' });
    await p.close();
  }
  await b.close();
  const total = fs.readdirSync(carpeta).reduce((a, f) => a + fs.statSync(path.join(carpeta, f)).size, 0);
  console.log(`total ${(total / 1048576).toFixed(2)} MB en ${carpeta}`);
})();
