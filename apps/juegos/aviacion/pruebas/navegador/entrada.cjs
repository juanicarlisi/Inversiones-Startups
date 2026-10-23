// HN-11 y HN-17: rueda y touchpad, teclado, Escape y foco atrapado, selector de ciudades cercanas, zoom hacia el área visible,
// redimensionar y la página que nunca se agranda.
//   node pruebas/navegador/entrada.cjs [carpeta-capturas]
const C = require('./comun.cjs');
const OUT = C.carpeta(process.argv[2]);

const cam = (p) => p.evaluate(() => ({ ...window.__juego.camara() }));
// Rueda sintética sobre el centro del mapa (deltaMode 0 = píxeles, como el touchpad).
const rueda = (p, ev, n = 1) => p.evaluate(([ev, n]) => {
  const c = document.getElementById('mapa'), r = c.getBoundingClientRect();
  for (let i = 0; i < n; i++) c.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, deltaMode: 0, ...ev }));
}, [ev, n]);
// Punto del mundo que está en el centro del área útil.
const centroUtil = (p) => p.evaluate(() => {
  const a = window.__juego.area(), c = window.__juego.camara(), { W, H } = window.__juego.medidas();
  return { wx: (a.cx - W / 2) / c.z + c.x, wy: (a.cy - H / 2) / c.z + c.y, a };
});

async function touchpadYTeclado(b, url) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 1280, alto: 720 });
  await C.empezar(p);
  await p.evaluate(() => window.__juego.fijarVel(1));
  // dos dedos en horizontal: mueven el mapa sin cambiar el zoom más de ±2 %
  let a = await cam(p);
  await rueda(p, { deltaX: 24, deltaY: 0 }, 20);
  let d = await cam(p);
  C.verificar(Math.abs(d.z / a.z - 1) <= 0.02 && Math.abs(d.x - a.x) * a.z > 300, 'touchpad: dos dedos en horizontal mueven el mapa sin zoom', { zoom: +(d.z / a.z).toFixed(3), movio: Math.round((d.x - a.x) * a.z) });
  // dos dedos en vertical: también mueven
  a = await cam(p);
  await rueda(p, { deltaX: 0, deltaY: 18 }, 10);
  d = await cam(p);
  C.verificar(Math.abs(d.z / a.z - 1) <= 0.02 && (d.y - a.y) * a.z > 100, 'touchpad: dos dedos en vertical mueven el mapa', { zoom: +(d.z / a.z).toFixed(3) });
  // pellizco del touchpad (ctrlKey): 30 eventos de deltaY −3 con zoom exp(−deltaY × 0,01) (desde un zoom medio, sin topes)
  await p.evaluate(() => { const c = window.__juego.camara(); c.z = 30; });
  a = await cam(p);
  await rueda(p, { deltaY: -3, ctrlKey: true }, 30);
  d = await cam(p);
  const f = d.z / a.z;
  C.verificar(Math.abs(f - Math.exp(0.9)) < 0.02, 'pellizco: 30 eventos de deltaY −3 dan exp(0,9) (la escala del pellizco de Chrome: el mapa sigue a los dedos)', { factor: +f.toFixed(3) });
  console.log(`     nota: el rango ×1,2–×2 del criterio no es compatible con la fórmula pedida (30 × 3 × 0,01 = 0,9 → ×${f.toFixed(2)}).`);
  // rueda del mouse con muescas (|deltaY| ≥ 100): zoom de a ×1,15
  a = await cam(p);
  await rueda(p, { deltaY: -100 }, 1);
  d = await cam(p);
  C.verificar(Math.abs(d.z / a.z - 1.15) < 0.01, 'rueda del mouse: una muesca acerca ×1,15', +(d.z / a.z).toFixed(3));

  // teclado
  await p.evaluate(() => { window.addEventListener('keydown', (e) => { window.__dp = e.defaultPrevented; }); });
  await p.keyboard.press(' ');
  C.verificar(await p.evaluate(() => window.__juego.velocidad() === 0 && window.__dp === true), 'espacio pausa (con preventDefault)');
  await p.keyboard.press(' ');
  C.verificar(await p.evaluate(() => window.__juego.velocidad() > 0), 'espacio de nuevo reanuda');
  for (const [k, v] of [['2', 3], ['3', 6], ['1', 1], ['é', 3], ['&', 1]]) {
    // las de AZERTY sin mayúscula llegan con su e.key (Playwright no tiene esas teclas: se despacha el evento)
    if (/^[0-9]$/.test(k)) await p.keyboard.press(k);
    else await p.evaluate((k) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })), k);
    C.verificar(await p.evaluate((v) => window.__juego.velocidad() === v, v), `tecla «${k}» → velocidad ×${v}`);
  }
  a = await cam(p);
  await p.keyboard.press('+'); await C.esperar(320);
  d = await cam(p);
  C.verificar(d.z > a.z * 1.3, 'tecla + acerca', +(d.z / a.z).toFixed(2));
  await p.keyboard.press('-'); await C.esperar(320);
  C.verificar(Math.abs((await cam(p)).z / a.z - 1) < 0.02, 'tecla − aleja');
  a = await cam(p);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowDown');
  d = await cam(p);
  C.verificar(d.x > a.x && d.y > a.y && await p.evaluate(() => window.__dp === true), 'las flechas mueven el mapa (sin mover la página)');

  // Escape es solo un atajo: toda ventana tiene botón de cierre visible y el foco queda adentro
  await p.locator('#b-menu').click();
  await p.locator('[data-accion="mCreditos"]').click();
  const cierre = await p.locator('#ventana .tarjeta > .cerrar').boundingBox();
  C.verificar(!!cierre && cierre.width >= 44 && cierre.height >= 44, 'la ventana tiene botón de cierre visible (≥ 44 px)', cierre && [Math.round(cierre.width), Math.round(cierre.height)]);
  let dentro = true;
  for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); dentro = dentro && await p.evaluate(() => document.getElementById('ventana').contains(document.activeElement)); }
  C.verificar(dentro, 'Tab no saca el foco de la ventana (foco atrapado)');
  await p.locator('#ventana .tarjeta > .cerrar').click();
  C.verificar(await p.evaluate(() => document.getElementById('ventana').hidden), 'el botón de cierre cierra la ventana');
  await p.locator('#b-menu').click(); await p.locator('[data-accion="mCreditos"]').click();
  await p.keyboard.press('Escape');
  C.verificar(await p.evaluate(() => document.getElementById('ventana').hidden), 'Escape también la cierra (atajo extra)');
  // la ruta nueva se cancela con un botón
  await p.evaluate(() => { const { estado, M } = window.__juego; M.abrirRuta(estado(), 'BUE', 'MVD'); window.__juego.seleccionar({ tipo: 'ap', id: 'BUE' }); });
  await p.locator('#panel-cuerpo [data-accion="nuevaRuta"]').click();
  C.verificar(await p.locator('#panel-cuerpo [data-accion="cancelar"]').isVisible(), 'la ruta nueva tiene un botón Cancelar');
  await p.locator('#panel-cuerpo [data-accion="cancelar"]').click();
  C.verificar(await p.evaluate(() => window.__juego.vis.modo === null), 'Cancelar sale del modo ruta nueva sin Escape');
  C.verificar(p.errores.length === 0, 'touchpad y teclado: 0 errores', p.errores);
  await p.ctx.close();
}

async function zoomYRedimensionar(b, url) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 1280, alto: 720 });
  await C.empezar(p);
  await p.evaluate(() => window.__juego.fijarVel(0));
  // sin selección: + acerca hacia el centro del área útil (sin panel ni misión), con transición de 250 ms
  let c0 = await centroUtil(p);
  const z0 = (await cam(p)).z;
  await p.locator('#b-mas').click();
  await C.esperar(110);
  const zMedio = (await cam(p)).z;
  await C.esperar(260);
  let c1 = await centroUtil(p);
  const z1 = (await cam(p)).z;
  C.verificar(zMedio > z0 && zMedio < z1, 'el zoom de los botones tiene transición (a mitad de camino a los 110 ms)', { z0: +z0.toFixed(1), medio: +zMedio.toFixed(1), z1: +z1.toFixed(1) });
  const dx = Math.hypot(c1.wx - c0.wx, c1.wy - c0.wy) * z1;
  C.verificar(dx < 2, '+ acerca hacia el centro del área visible', +dx.toFixed(2));
  // con una ciudad seleccionada a la vista: acerca hacia ella (la ciudad no se mueve en la pantalla)
  await p.evaluate(() => window.__juego.seleccionar({ tipo: 'ap', id: 'BUE' }));
  await C.esperar(400);
  const s0 = await p.evaluate(() => window.__juego.pantalla('BUE'));
  await p.locator('#b-mas').click(); await C.esperar(350);
  const s1 = await p.evaluate(() => window.__juego.pantalla('BUE'));
  C.verificar(Math.hypot(s1[0] - s0[0], s1[1] - s0[1]) < 2, '+ con selección acerca hacia la selección', s0.map(Math.round).concat(s1.map(Math.round)));
  await p.locator('#b-menos').click(); await C.esperar(350);
  // al redimensionar se conserva el punto central del área útil
  await p.evaluate(() => window.__juego.seleccionar(null));
  await C.esperar(300);
  c0 = await centroUtil(p);
  await p.setViewportSize({ width: 960, height: 540 }); await C.esperar(400);
  c1 = await centroUtil(p);
  const z = (await cam(p)).z;
  C.verificar(Math.hypot(c1.wx - c0.wx, c1.wy - c0.wy) * z < 3, 'al redimensionar se conserva el punto central del área útil', +(Math.hypot(c1.wx - c0.wx, c1.wy - c0.wy) * z).toFixed(2));
  C.verificar(p.errores.length === 0, 'zoom: 0 errores', p.errores);
  await p.ctx.close();
}

async function selector(b, url) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 360, alto: 640, tactil: true });
  await p.touchscreen.tap(180, 400); // «Empezar» está en el medio
  await C.empezar(p);
  await p.evaluate(() => window.__juego.fijarVel(0));
  if (OUT) await p.screenshot({ path: `${OUT}/selector-0.png` });
  // el momento real: la misión 1 está hecha y la 2 pide Bahía Blanca (la cámara la muestra)
  await p.evaluate(() => { const { estado, M } = window.__juego, s = estado(); M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD'); window.__juego.seleccionar(null); });
  await C.esperar(300);
  await p.touchscreen.tap(...(await p.locator('#b-centrar').boundingBox().then((c) => [c.x + c.width / 2, c.y + c.height / 2])));
  await C.esperar(700);
  if (OUT) await p.screenshot({ path: `${OUT}/selector-bhi.png` });
  // 400 toques simulados alrededor de Bahía Blanca (a menos de 20 px de su centro, al azar)
  const r = await p.evaluate(() => {
    const { W, H } = window.__juego.medidas();
    const [cx, cy] = window.__juego.pantalla('BHI');
    let bien = 0, directo = 0, conSelector = 0, fuera = 0;
    for (let i = 0; i < 400; i++) {
      const ang = Math.random() * Math.PI * 2, rad = Math.sqrt(Math.random()) * 20;
      const x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad;
      if (x < 0 || y < 0 || x > W || y > H) { fuera++; continue; }
      window.__juego.seleccionar(null);
      window.__juego.tocar(x, y);
      const sel = window.__juego.vis.sel, lista = document.getElementById('selector');
      if (sel?.tipo === 'ap' && sel.id === 'BHI') { bien++; directo++; }
      else if (!lista.hidden && lista.querySelector('[data-id="BHI"]')) { bien++; conSelector++; }
      lista.hidden = true;
    }
    return { bien, directo, conSelector, fuera, enPantalla: [Math.round(cx), Math.round(cy)] };
  });
  C.verificar(r.bien / (400 - r.fuera) >= 0.98, '400 toques sobre Bahía Blanca en 360×640: al menos 98 % correctos', r);
  // 20 toques reales con el dedo
  let reales = 0;
  for (let i = 0; i < 20; i++) {
    await p.evaluate(() => window.__juego.seleccionar(null));
    const [x, y] = await C.ciudad(p, 'BHI');
    const ang = Math.random() * Math.PI * 2, rad = Math.random() * 16;
    await p.touchscreen.tap(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
    await C.esperar(80);
    if (await p.evaluate(() => window.__juego.vis.sel?.id === 'BHI' || !!document.querySelector('#selector:not([hidden]) [data-id="BHI"]'))) reales++;
    await p.evaluate(() => { document.getElementById('selector').hidden = true; });
  }
  C.verificar(reales >= 19, '20 toques reales con el dedo sobre Bahía Blanca', reales);
  // muy lejos, las ciudades se amontonan: aparece el selector con los nombres y elegir uno lo selecciona
  await p.evaluate(() => { const c = window.__juego.camara(); c.z = 3; window.__juego.seleccionar(null); });
  await C.esperar(100);
  const [bx, by] = await C.ciudad(p, 'BUE');
  await p.touchscreen.tap(bx, by); await C.esperar(150);
  const opciones = await p.$$eval('#selector:not([hidden]) button', (bs) => bs.map((b) => b.dataset.id));
  C.verificar(opciones.length >= 2 && opciones.includes('BUE'), 'con 2 ciudades o más a menos de 22 px aparece el selector con los nombres', opciones);
  if (OUT) await p.screenshot({ path: `${OUT}/selector-1.png` });
  if (opciones.includes('MVD')) {
    await p.locator('#selector [data-id="MVD"]').tap(); await C.esperar(150);
    C.verificar(await p.evaluate(() => window.__juego.vis.sel?.id === 'MVD'), 'elegir un nombre del selector selecciona esa ciudad');
  }
  C.verificar(p.errores.length === 0, 'selector: 0 errores', p.errores);
  await p.ctx.close();
}

async function paginaQuieta(b, url) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 390, alto: 844, tactil: true });
  await p.touchscreen.tap(195, 520);
  await C.empezar(p);
  await p.evaluate(() => window.__juego.seleccionar({ tipo: 'ap', id: 'BUE' }));
  await C.esperar(400);
  const caja = await p.locator('#panel').boundingBox();
  const cdp = await p.ctx.newCDPSession(p);
  await cdp.send('Input.synthesizePinchGesture', { x: caja.x + caja.width / 2, y: caja.y + 120, scaleFactor: 2.2, relativeSpeed: 600, gestureSourceType: 'touch' });
  await C.esperar(300);
  const escala = await p.evaluate(() => window.visualViewport?.scale ?? 1);
  C.verificar(Math.abs(escala - 1) < 0.005, 'después de un pellizco sobre el panel la escala de la página sigue en 1,00', +escala.toFixed(2));
  const estilos = await p.evaluate(() => {
    const b = getComputedStyle(document.body), pc = getComputedStyle(document.getElementById('panel-cuerpo'));
    const vp = document.querySelector('meta[name=viewport]').content;
    return { userSelect: b.userSelect || b.webkitUserSelect, touchAction: b.touchAction, panel: pc.touchAction, viewport: vp };
  });
  C.verificar(estilos.userSelect === 'none' && estilos.touchAction === 'manipulation' && estilos.panel === 'pan-y' && /maximum-scale=1/.test(estilos.viewport),
    'body con user-select none y touch-action manipulation, panel con pan-y, viewport con maximum-scale=1', estilos);
  const menu = await p.evaluate(() => { const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.getElementById('mapa').dispatchEvent(ev); return ev.defaultPrevented; });
  C.verificar(menu, 'el menú contextual se cancela en el mapa');
  C.verificar(p.errores.length === 0, 'página quieta: 0 errores', p.errores);
  await p.ctx.close();
}

// HN-12: cámara inicial cerca de Buenos Aires y del destino de la misión 1 (la ruta mide ≥ 120 px en 390×844 y ≥ 180 px en
// 1280×720) y que se aleja sola cuando crece la red (la misión 2 pide Bahía Blanca: queda a la vista sin tocar nada).
async function camara(b, url) {
  for (const [w, h, tactil, minimo] of [[390, 844, true, 120], [1280, 720, false, 180]]) {
    const p = await C.abrir(b, url + '/index.html', { ancho: w, alto: h, tactil });
    await C.empezar(p);
    await C.esperar(300);
    const largo = await p.evaluate(() => { const a = window.__juego.pantalla('BUE'), b = window.__juego.pantalla('MVD'); return Math.hypot(b[0] - a[0], b[1] - a[1]); });
    C.verificar(largo >= minimo, `${w}×${h}: cámara inicial cerca: la primera ruta mide al menos ${minimo} px`, `${Math.round(largo)} px`);
    const guia = await p.locator('#marca .marca-txt').textContent();
    C.verificar(tactil ? /^Tocá/.test(guia) : /^Hacé clic/.test(guia), `${w}×${h}: el verbo según el dispositivo («Tocá» con dedo, «Hacé clic» con mouse)`, guia);
    C.verificar(/todavía sin vuelos|no flights/.test(await p.locator('#ritmo').textContent()), `${w}×${h}: antes del primer vuelo la barra no muestra un «por día»`);
    await p.evaluate(() => { const { estado, M } = window.__juego, s = estado(); M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD'); });
    await C.esperar(3200);
    const ve = await p.evaluate(() => {
      const a = window.__juego.area(), [x, y] = window.__juego.pantalla('BHI');
      return x >= a.izq && x <= a.der && y >= a.arr && y <= a.aba;
    });
    C.verificar(ve, `${w}×${h}: la cámara se aleja sola y muestra Bahía Blanca (misión 2)`);
    await p.waitForFunction(() => window.__juego.estado().stats.ultimoVuelo != null, null, { timeout: 15000 });
    await C.esperar(300);
    const ritmo = await p.locator('#ritmo').textContent();
    C.verificar(/último vuelo: [+−]\$/.test(ritmo) && !/por día/.test(ritmo), `${w}×${h}: hasta las 24 h la barra muestra «último vuelo: +$X»`, ritmo);
    C.verificar(p.errores.length === 0, `${w}×${h}: cámara sin errores`, p.errores);
    await p.ctx.close();
  }
}

(async () => {
  const srv = await C.servir();
  const b = await C.navegador();
  await camara(b, srv.url);
  await touchpadYTeclado(b, srv.url);
  await zoomYRedimensionar(b, srv.url);
  await selector(b, srv.url);
  await paginaQuieta(b, srv.url);
  await b.close(); await srv.cerrar();
  C.terminar();
})();
