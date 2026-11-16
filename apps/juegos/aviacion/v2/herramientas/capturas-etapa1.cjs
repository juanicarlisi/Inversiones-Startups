// Capturas de la etapa 1 «decidir sabiendo»: cada tarjeta de decisión, el reloj frenado, el parte de la mañana, el resultado contra
// lo prometido, el zoom de cerca y de lejos y el color de la empresa, en escritorio (1280×720) y en celular (390×844).
//   node herramientas/capturas-etapa1.cjs [escritorio|celular|todo]
// Necesita dist/ servido en http://localhost:8812 (npm run servir). Por defecto saca JPEG a capturas/etapa1/ con calidad alta
// (sin placa de video tarda unos 25 minutos). Variables: URL_JUEGO, CARPETA, CALIDAD=alto|medio|bajo, RAPIDO=1 (menos píxeles),
// SOLO=07,parte (solo las capturas cuyo nombre lleve alguno de esos textos).
// La red se arma jugando de verdad (dos rutas, la primera noche, faros, el Tero a la venta): nada está dibujado a mano.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const BASE = process.env.URL_JUEGO ?? 'http://localhost:8812/index.html';
const CARPETA = path.resolve(process.env.CARPETA ?? path.join(__dirname, '..', 'capturas', 'etapa1'));
const RAPIDO = process.env.RAPIDO === '1', SOLO = process.env.SOLO ? process.env.SOLO.split(',') : null;
fs.mkdirSync(CARPETA, { recursive: true });

async function abrir({ ancho = 1280, alto = 720, tactil = false } = {}) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, hasTouch: tactil, isMobile: tactil });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(String(e).slice(0, 400)));
  await p.goto(`${BASE}?lang=es&nuevo=1&calidad=${process.env.CALIDAD ?? (RAPIDO ? 'bajo' : 'alto')}&semilla=7&saltar=guia`);
  await p.waitForFunction(() => window.__hn?.estado?.escena, null, { timeout: 120000 });
  if (RAPIDO) await p.evaluate(() => { const m = window.__hn.mundo; m.escalaRes = 0.4; m.medir(); });
  return { b, ctx, p, errores };
}
const foto = async (p, nombre, espera = 1500) => {
  if (SOLO && !SOLO.some((x) => nombre.includes(x))) return;
  const destino = path.join(CARPETA, nombre.replace(/\.png$/, '.jpg'));
  await p.waitForTimeout(espera * (RAPIDO ? 1 : 3));
  await p.screenshot({ path: destino, type: 'jpeg', quality: 84 });
  console.log('  ✓', path.basename(destino));
};
const cual = process.argv[2] ?? 'todo';

// Juega con el modelo hasta tener una red de verdad: 3 rutas, faros en una, la primera noche pasada y el Tero a la venta.
async function armarRed(p) {
  return p.evaluate(async () => {
    const h = window.__hn, s = h.s, M = h.M;
    const cerrar = () => { const v = document.querySelector('#ventana:not([hidden]) [data-accion="cerrarVentana"]'); if (v) v.click(); const e = document.querySelector('#momento:not([hidden]) .elige button'); if (e) e.click(); };
    // los carteles van en tiempo real: se los despeja para no esperar (acá solo se arma la red)
    const hasta = async (cond, max = 4000) => { for (let i = 0; i < max && !cond(); i++) { h.cuentas(); cerrar(); if (h.estado.sel) h.accion('cerrarPanel', {}, null); if (h.fila.enPantalla && h.fila.enPantalla !== 'parte') h.limpiar(); h.avanzar(1); if (i % 10 === 0) await new Promise((r) => setTimeout(r, 130)); } };
    h.fijarVel(3);
    h.accion('abrirRuta', { a: 'BUE', b: 'MVD' }, null); h.cuentas(); h.accion('comprar', { id: 'golondrina', ruta: 'BUE-MVD' }, null);
    await hasta(() => s.t > 120);
    await new Promise((r) => setTimeout(r, 150));
    h.accion('abrirRuta', { a: 'BUE', b: 'BHI' }, null); h.cuentas(); h.accion('comprar', { id: 'golondrina', ruta: 'BHI-BUE' }, null);
    await hasta(() => M.esNoche(s));
    await new Promise((r) => setTimeout(r, 150));
    h.elegir({ tipo: 'ruta', id: 'BUE-MVD' }, { camara: false }); h.cuentas();
    h.accion('faros', { id: 'BUE-MVD' }, null);
    await hasta(() => M.avionDisponible(s, 'tero') && M.hora(s) > 10 && M.hora(s) < 12);
    h.limpiar(); h.fijarVel(0.5);
    return { ...h.estado, misiones: s.misiones, tero: M.avionDisponible(s, 'tero'), dias: h.libro.dias.length, promesas: h.libro.promesas.length, t: s.t };
  });
}
const listo = (p) => p.evaluate(() => { const h = window.__hn; h.cuentas(); h.avanzar(0.1); });

async function serie(pref, opciones) {
  const { b, p, errores } = await abrir(opciones);
  const movil = !!opciones.tactil;
  await p.waitForTimeout(1500);
  console.log(pref, 'red:', JSON.stringify(await armarRed(p)));
  await p.evaluate(() => window.__hn.accion('centrar', {}, null));
  await foto(p, `${pref}-00-juego.png`, 3500);

  // 1) abrir ruta (ciudad fuera de la red)
  await p.evaluate(() => { const h = window.__hn; h.elegir({ tipo: 'ciudad', id: 'ROS' }); }); await listo(p);
  await foto(p, `${pref}-01-tarjeta-ruta.png`, 2500);
  // 2) comprar avión: comparación lado a lado
  await p.evaluate(() => { const h = window.__hn; h.accion('cerrarPanel', {}, null); h.elegir({ tipo: 'hangar', ruta: 'BHI-BUE' }, { camara: 'justa' }); }); await listo(p);
  console.log(pref, 'hangar:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.modelo')].map((m) => m.innerText.replace(/\n+/g, ' | ')))));
  await foto(p, `${pref}-02-hangar-comparar.png`, 2500);
  // 3) faros
  await p.evaluate(() => { const h = window.__hn; h.accion('cerrarPanel', {}, null); h.elegir({ tipo: 'ruta', id: 'BHI-BUE' }); }); await listo(p);
  console.log(pref, 'faros:', JSON.stringify(await p.evaluate(() => [document.querySelector('.tarjeta')?.innerText.replace(/\n+/g, ' | '), document.querySelector('.tarjeta + .porque')?.innerText])));
  await foto(p, `${pref}-03-faros-reloj-frenado.png`, 2500);
  // 4) agrandar el correo de la base
  await p.evaluate(() => { const h = window.__hn; h.accion('cerrarPanel', {}, null); h.elegir({ tipo: 'ciudad', id: 'BUE' }); }); await listo(p);
  console.log(pref, 'correo:', JSON.stringify(await p.evaluate(() => [document.querySelector('.tarjeta')?.innerText.replace(/\n+/g, ' | '), document.querySelector('.tarjeta + .porque')?.innerText])));
  await foto(p, `${pref}-04-correo.png`, 2500);
  // 5) una compra que pierde plata: otro avión en la ruta a Montevideo
  await p.evaluate(() => { const h = window.__hn; h.accion('cerrarPanel', {}, null); h.s.dinero = 90000; h.elegir({ tipo: 'hangar', ruta: 'BUE-MVD' }, { camara: 'justa' }); }); await listo(p);
  console.log(pref, 'hangar MVD:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.modelo')].map((m) => m.innerText.replace(/\n+/g, ' | ')))));
  await foto(p, `${pref}-05-hangar-mvd.png`, 2500);
  await p.evaluate(() => window.__hn.accion('cerrarPanel', {}, null));

  // 6) parte de la mañana: se corre hasta las 6:00
  const parte = await p.evaluate(async () => {
    const h = window.__hn; h.fijarVel(3);
    for (let i = 0; i < 200 && !document.querySelector('#ventana:not([hidden]) .consejo'); i++) { h.cuentas(); const e = document.querySelector('#momento:not([hidden]) .elige button'); if (e) e.click(); h.avanzar(1); await new Promise((r) => setTimeout(r, 30)); }
    h.fijarVel(0.5);
    return { abierto: !!document.querySelector('#ventana:not([hidden]) .consejo'), texto: document.querySelector('#ventana')?.innerText.replace(/\n+/g, ' | '), estado: h.estado };
  });
  console.log(pref, 'parte:', JSON.stringify(parte));
  await foto(p, `${pref}-06-parte.png`, 2500);
  await p.evaluate(() => document.querySelector('#ventana [data-accion="cerrarVentana"]').click());

  // 7) resultado contra lo prometido: se corre hasta que llega la primera nota
  const res = await p.evaluate(async () => {
    const h = window.__hn; h.fijarVel(3);
    for (let i = 0; i < 400 && !document.querySelector('#momento.res:not([hidden])'); i++) { h.cuentas(); const v = document.querySelector('#ventana:not([hidden]) [data-accion="cerrarVentana"]'); if (v) v.click(); const e = document.querySelector('#momento:not([hidden]) .elige button'); if (e) e.click(); h.avanzar(1); await new Promise((r) => setTimeout(r, 30)); }
    h.fijarVel(0.5);
    return { abierto: !!document.querySelector('#momento.res:not([hidden])'), texto: document.querySelector('#momento')?.innerText.replace(/\n+/g, ' | '), notas: h.libro.notas.length, fila: h.fila };
  });
  console.log(pref, 'resultado:', JSON.stringify(res));
  await p.evaluate(() => window.__hn.verResultado(120000));   // el cartel dura 9 s: para la captura se lo deja quieto
  await foto(p, `${pref}-07-resultado.png`, 1200);
  await p.evaluate(() => { const h = window.__hn; h.limpiar(); h.fijarVel(0); });

  // 8) zoom: de cerca (un avión en vuelo y la base) y de lejos (toda la época)
  await p.evaluate(() => { const h = window.__hn; h.fijarVel(0.5); for (let i = 0; i < 60 && !h.s.aviones.some((a) => a.fase === 'vuelo' && a.resta / a.dur > 0.3 && a.resta / a.dur < 0.7); i++) h.avanzar(0.5); h.fijarVel(0); const av = h.s.aviones.find((a) => a.fase === 'vuelo'); h.mundo.pedida(); h.mundo.seguir(av.id); h.mundo.controles.dollyTo(1.0, false); h.mundo.controles.rotatePolarTo(1.05, false); });
  await foto(p, `${pref}-08-zoom-cerca-avion.png`, 5000);
  await p.evaluate(() => { const h = window.__hn, m = h.mundo; m.seguir(null); const c = m.ciudades.get('BUE').pos; m.controles.setLookAt(c.x, Math.cos(0.95) * 1.15, c.z + Math.sin(0.95) * 1.15, c.x, 0, c.z, false); });
  await foto(p, `${pref}-09-zoom-cerca-base.png`, 5000);
  await p.evaluate(() => { const h = window.__hn, m = h.mundo; m.controles.dollyTo(m.controles.maxDistance, false); const c = m.controles; c.moveTo(-3, 0, 12, false); });
  console.log(pref, 'lejos:', JSON.stringify(await p.evaluate(() => { const m = window.__hn.mundo; return { max: +m.controles.maxDistance.toFixed(1), visibles: [...m.ciudades.values()].filter((x) => m.aPantalla(x.pos, {}).visible).length, total: m.ciudades.size }; })));
  await foto(p, `${pref}-10-zoom-lejos.png`, 5000);
  await p.evaluate(() => window.__hn.accion('centrar', {}, null));

  // 9) tu empresa: nombre y color
  if (!movil) {
    await p.evaluate(() => { const h = window.__hn; h.accion('empresa', {}, null); });
    await foto(p, `${pref}-11-empresa.png`, 1500);
    await p.evaluate(() => { const h = window.__hn; h.accionOficina({ tipo: 'nombre', nombre: '  Alas <b>del</b> Sur  ', color: '#27457f' }); document.querySelector('#ventana [data-accion="cerrarVentana"]')?.click(); h.fijarVel(0.5); for (let i = 0; i < 30 && !h.s.aviones.some((a) => a.fase === 'vuelo'); i++) h.avanzar(0.5); h.fijarVel(0); const av = h.s.aviones.find((a) => a.fase === 'vuelo') ?? h.s.aviones[0]; h.mundo.seguir(av.id); h.mundo.controles.dollyTo(1.6, false); });
    console.log(pref, 'empresa:', JSON.stringify(await p.evaluate(() => window.__hn.datosOficina().empresa)));
    await foto(p, `${pref}-12-color-empresa.png`, 5000);
  }
  console.log(pref, 'errores:', JSON.stringify(errores));
  await b.close();
}

(async () => {
  if (cual === 'todo' || cual === 'escritorio') await serie('e', {});
  if (cual === 'todo' || cual === 'celular') await serie('c', { ancho: 390, alto: 844, tactil: true });
})().catch((e) => { console.error(e); process.exit(1); });
