// HN-11: 0 clics perdidos con el juego corriendo (los aviones aterrizan, cambian los estados y la plata, el panel se actualiza).
//  - Serie 1: 60 clics de 150 ms, con pausas de 0,7 a 1,3 s, alternando «Sale con 30%» y «Sale con 60%».
//  - Serie 2: 30 clics de 1,1 s sobre Comprar.
// En escritorio (mouse, 1280×720) y en celular (dedo, 390×844: toques por CDP con la duración pedida).
//   node pruebas/navegador/clics.cjs [carpeta-capturas]
const C = require('./comun.cjs');
const OUT = C.carpeta(process.argv[2]);
const azar = (a, b) => a + Math.random() * (b - a);

async function preparar(p) {
  await C.empezar(p);
  await p.evaluate(() => {
    const { estado, M } = window.__juego, s = estado();
    s.dinero = 5e7;
    M.abrirRuta(s, 'BUE', 'MVD'); M.abrirRuta(s, 'BUE', 'ROS'); M.abrirRuta(s, 'BUE', 'BHI');
    for (const r of ['BUE-MVD', 'BUE-ROS', 'BHI-BUE']) for (let i = 0; i < 3; i++) M.comprarAvion(s, 'golondrina', r);
    window.__juego.fijarVel(6); // a toda velocidad: más aterrizajes y más cambios en el panel mientras se hace clic
    window.__juego.seleccionar({ tipo: 'ruta', id: 'BUE-MVD' });
  });
  await C.esperar(600);
}
// Mantiene apretado el centro del elemento (mouse o dedo) durante ms.
async function apretar(p, cdp, sel, ms, tactil) {
  await p.locator(sel).first().scrollIntoViewIfNeeded(); // como una persona: si el botón quedó abajo, primero desplaza el panel
  const caja = await p.locator(sel).first().boundingBox();
  if (!caja) return false;
  const x = caja.x + caja.width / 2, y = caja.y + caja.height / 2;
  if (tactil) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    await C.esperar(ms);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await p.mouse.move(x, y); await p.mouse.down(); await C.esperar(ms); await p.mouse.up();
  }
  return true;
}

async function correr(b, url, { nombre, ancho, alto, tactil }) {
  const p = await C.abrir(b, url + '/index.html', { ancho, alto, tactil });
  const cdp = tactil ? await p.ctx.newCDPSession(p) : null;
  await preparar(p);
  // serie 1: «Sale con» 30% / 60%
  let perdidos1 = 0;
  for (let i = 0; i < 60; i++) {
    const v = i % 2 ? '0.6' : '0.3';
    const sel = `#panel-cuerpo [data-accion="cargaMin"][data-v="${v}"]`;
    if (!(await apretar(p, cdp, sel, 150, tactil))) { perdidos1++; continue; }
    await C.esperar(60);
    const ok = await p.evaluate((v) => window.__juego.estado().rutas.find((r) => r.id === 'BUE-MVD').minCarga === Number(v), v);
    if (!ok) perdidos1++;
    await C.esperar(azar(700, 1300));
  }
  // serie 2: 30 clics de 1,1 s sobre Comprar
  let perdidos2 = 0, reemplazos = 0;
  for (let i = 0; i < 30; i++) {
    const sel = '#panel-cuerpo [data-accion="comprar"][data-id="golondrina"]';
    const antes = await p.evaluate(() => window.__juego.estado().aviones.filter((a) => a.ruta === 'BUE-MVD').length);
    await p.evaluate((sel) => { const el = document.querySelector(sel); if (el) el.__marca = true; }, sel);
    await p.locator(sel).first().scrollIntoViewIfNeeded();
    const caja = await p.locator(sel).first().boundingBox();
    const x = caja.x + caja.width / 2, y = caja.y + caja.height / 2;
    if (tactil) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    else { await p.mouse.move(x, y); await p.mouse.down(); }
    await C.esperar(1100);
    // mientras está apretado, el botón no se reemplazó (el nodo es el mismo)
    if (!(await p.evaluate((sel) => !!document.querySelector(sel)?.__marca, sel))) reemplazos++;
    if (tactil) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    else await p.mouse.up();
    await C.esperar(80);
    const despues = await p.evaluate(() => window.__juego.estado().aviones.filter((a) => a.ruta === 'BUE-MVD').length);
    if (despues !== antes + 1) perdidos2++;
    await C.esperar(azar(300, 600));
  }
  if (OUT) await p.screenshot({ path: `${OUT}/clics-${nombre}.png` });
  C.verificar(perdidos1 === 0, `${nombre}: serie 1 (60 clics de 150 ms sobre Sale con 30%/60%): 0 perdidos`, perdidos1);
  C.verificar(perdidos2 === 0, `${nombre}: serie 2 (30 clics de 1,1 s sobre Comprar): 0 perdidos`, perdidos2);
  C.verificar(reemplazos === 0, `${nombre}: ningún botón reemplazado mientras estaba apretado`, reemplazos);
  C.verificar(p.errores.length === 0, `${nombre}: 0 errores de consola`, p.errores);
  await p.ctx.close();
}

(async () => {
  const srv = await C.servir();
  const b = await C.navegador();
  await Promise.all([
    correr(b, srv.url, { nombre: 'escritorio-1280x720', ancho: 1280, alto: 720, tactil: false }),
    correr(b, srv.url, { nombre: 'celular-390x844', ancho: 390, alto: 844, tactil: true }),
  ]);
  await b.close(); await srv.cerrar();
  C.terminar();
})();
