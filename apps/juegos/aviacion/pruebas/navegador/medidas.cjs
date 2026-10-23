// HN-11 y HN-17: medidas de la interfaz en muchos tamaños.
//  - Todo control mide al menos 44×44 px (48 con pantalla táctil) en 360×640, 390×844, 800×450, 960×540 y 1280×720.
//  - Con nada seleccionado, el mapa visible ocupa al menos el 65 % en 1280×720, 960×540, 800×450, 640×360, 844×390 y 390×844.
//  - Zonas seguras: en 390×844 con una muesca de 47 px (y 34 abajo) nada se superpone con la muesca ni con lo demás.
//  - Capturas en 12 tamaños, sin controles superpuestos ni texto cortado (los recortes con «…» a propósito se listan aparte).
//   node pruebas/navegador/medidas.cjs [carpeta-capturas]
const C = require('./comun.cjs');
const OUT = C.carpeta(process.argv[2]);

// Una partida de media hora: 4 rutas desde el hub, aviones, contratos en el tablero y la misión 3 activa.
async function partida(p) {
  await p.evaluate(() => {
    const { estado, M } = window.__juego, s = estado();
    M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
    s.dinero += 60000;
    M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE');
    M.abrirRuta(s, 'BUE', 'ROS'); M.comprarAvion(s, 'golondrina', 'BUE-ROS'); M.comprarAvion(s, 'golondrina', 'BUE-ROS');
    for (let i = 0; i < 300; i++) M.paso(s);
    M.tomarEventos(s);
    s.dinero += 20000;
    window.__juego.fijarVel(0);
    window.__juego.seleccionar(null);
  });
  await C.esperar(600);
}
// Controles visibles más chicos que el mínimo.
async function chicos(p, minimo) {
  return p.evaluate((minimo) => {
    const out = [];
    for (const el of document.querySelectorAll('#app button, #app [data-accion], #app [role="button"], #app a[href]')) {
      if (el.offsetParent === null || el.closest('[hidden]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue; // fuera de la vista (panel desplazable)
      if (r.width < minimo - 0.5 || r.height < minimo - 0.5) out.push(`${el.dataset.k || el.id || el.className} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    return out;
  }, minimo);
}
// Parte de la pantalla donde se ve el mapa (muestreo en una grilla).
async function mapaVisible(p) {
  return p.evaluate(() => {
    let si = 0, n = 0;
    for (let y = 2; y < innerHeight; y += 6) for (let x = 2; x < innerWidth; x += 6) { n++; if (document.elementFromPoint(x, y)?.id === 'mapa') si++; }
    return si / n;
  });
}
// Pares de controles que se pisan (barra, objetivos, chips, zoom, panel, avisos).
async function superpuestos(p) {
  return p.evaluate(() => {
    const els = [...document.querySelectorAll('#barra .b-cifras, #barra .reloj, #barra .b-ctrl, #objetivos > *, #chips > *, #zoom > button, #panel, #avisos > *, #sin-guardar')]
      .filter((e) => e.offsetParent !== null && !e.hidden && getComputedStyle(e).visibility !== 'hidden');
    const r = els.map((e) => [e, e.getBoundingClientRect()]).filter(([, b]) => b.width > 0 && b.height > 0);
    const out = [];
    const nombre = (e) => e.id || e.dataset.k || e.className.split(' ')[0];
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
      const [a, ra] = r[i], [b, rb] = r[j];
      if (a.contains(b) || b.contains(a)) continue;
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (w > 1 && h > 1) out.push(`${nombre(a)} × ${nombre(b)}`);
    }
    // el panel no tapa nada del carril de arriba ni del zoom (en horizontal está a la derecha)
    return out;
  });
}
// Texto cortado sin «…» (los recortes con «…» se listan aparte: son a propósito, con el texto completo en el título).
async function cortados(p) {
  return p.evaluate(() => {
    const cortes = [], puntos = [];
    for (const el of document.querySelectorAll('#app *')) {
      if (el.offsetParent === null || !el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'inline') continue;
      const corta = el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible';
      const cortaV = el.scrollHeight > el.clientHeight + 2 && cs.overflowY === 'hidden' && cs.webkitLineClamp === 'none';
      if (!corta && !cortaV) continue;
      if (cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none') puntos.push(el.textContent.trim().slice(0, 40)); else cortes.push(`${el.className || el.tagName}: ${el.textContent.trim().slice(0, 40)}`);
    }
    // nada se sale de la pantalla
    const fuera = [...document.querySelectorAll('#barra *, #arriba *, #zoom *')].filter((e) => { const r = e.getBoundingClientRect(); return e.offsetParent !== null && r.width > 0 && (r.right > innerWidth + 1 || r.left < -1); }).length;
    return { cortes, puntos, fuera, scroll: document.documentElement.scrollWidth > innerWidth };
  });
}

async function tamanos(b, url) {
  // objetivos táctiles
  for (const [w, h, tactil] of [[360, 640, true], [390, 844, true], [800, 450, false], [960, 540, false], [1280, 720, false]]) {
    const p = await C.abrir(b, url + '/index.html', { ancho: w, alto: h, tactil });
    const minimo = tactil ? 48 : 44;
    const malos = new Set();
    const anotar = async (que) => { for (const x of await chicos(p, minimo)) malos.add(`${que}: ${x}`); };
    await anotar('portada');
    await C.empezar(p);
    await partida(p);
    await anotar('mapa');
    for (const sel of [{ tipo: 'ruta', id: 'BUE-ROS' }, { tipo: 'ap', id: 'BUE' }, { tipo: 'ap', id: 'COR' }, { tipo: 'rutas' }]) {
      await p.evaluate((sel) => window.__juego.seleccionar(sel), sel);
      await C.esperar(350);
      // recorrer el panel entero (lo de abajo también se mide)
      for (let y = 0; y < 6; y++) { await anotar(`${sel.tipo}:${sel.id ?? ''}`); await p.evaluate(() => { const c = document.getElementById('panel-cuerpo'); c.scrollTop += c.clientHeight * 0.8; }); await C.esperar(60); }
    }
    await p.evaluate(() => window.__juego.seleccionar({ tipo: 'ruta', id: 'BUE-ROS' }));
    await C.pulsar(p, p.locator('#panel-cuerpo [data-accion="detalle"]').first()).catch(() => {});
    await C.esperar(200); await anotar('detalle');
    await p.evaluate(() => window.__juego.seleccionar(null));
    await C.pulsar(p, p.locator('#b-menu')); await C.esperar(150); await anotar('menu');
    await C.pulsar(p, p.locator('[data-accion="mCreditos"]')); await C.esperar(150); await anotar('ventana');
    await p.keyboard.press('Escape');
    C.verificar(malos.size === 0, `${w}×${h}: todo control mide al menos ${minimo}×${minimo} px`, [...malos].slice(0, 8));
    C.verificar(p.errores.length === 0, `${w}×${h}: 0 errores`, p.errores);
    await p.ctx.close();
  }
  // mapa visible con nada seleccionado
  for (const [w, h, tactil] of [[1280, 720, false], [960, 540, false], [800, 450, false], [640, 360, false], [844, 390, true], [390, 844, true]]) {
    const p = await C.abrir(b, url + '/index.html', { ancho: w, alto: h, tactil });
    await C.empezar(p);
    await partida(p);
    // los avisos duran 3,6 s: se mide el estado estable (y se informa también con un aviso en pantalla)
    const conAviso = await mapaVisible(p);
    await p.evaluate(() => document.getElementById('avisos').replaceChildren());
    const f = await mapaVisible(p);
    C.verificar(f >= 0.65, `${w}×${h}: con nada seleccionado el mapa visible ocupa al menos 65 %`, `${(f * 100).toFixed(1)} % (con un aviso pasajero: ${(conAviso * 100).toFixed(1)} %)`);
    await p.ctx.close();
  }
}

async function muesca(b, url) {
  const p = await C.abrir(b, url + '/index.html', { ancho: 390, alto: 844, tactil: true });
  const cdp = await p.ctx.newCDPSession(p);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 47, bottom: 34, left: 0, right: 0 } });
  await C.esperar(200);
  await p.touchscreen.tap(195, 520);
  await C.empezar(p);
  await partida(p);
  await p.evaluate(() => window.__juego.seleccionar({ tipo: 'ruta', id: 'BUE-ROS' }));
  await C.esperar(500);
  const r = await p.evaluate(() => {
    const malos = [];
    for (const el of document.querySelectorAll('#barra > *, #barra .ib, #objetivos > *, #chips > *, #zoom > button')) {
      if (el.offsetParent === null) continue;
      const b = el.getBoundingClientRect();
      if (b.top < 47) malos.push(`${el.id || el.className} arriba ${Math.round(b.top)}`);
    }
    const panel = document.getElementById('panel-cuerpo').getBoundingClientRect();
    if (panel.bottom > 844 - 34 + 1) malos.push(`panel ${Math.round(panel.bottom)}`);
    return malos;
  });
  C.verificar(r.length === 0, '390×844 con muesca de 47 px: la barra, la misión y el zoom quedan debajo; el panel, arriba de la zona de abajo', r);
  const sup = await superpuestos(p);
  C.verificar(sup.length === 0, '390×844 con muesca: sin controles superpuestos', sup);
  if (OUT) await p.screenshot({ path: `${OUT}/muesca-390x844.png` });
  await p.ctx.close();
}

async function capturas(b, url) {
  const TAM = [[1920, 1080, false], [1366, 768, false], [1280, 720, false], [1024, 768, false], [960, 540, false], [800, 450, false], [640, 360, false],
    [844, 390, true], [768, 1024, true], [412, 915, true], [390, 844, true], [360, 640, true]];
  for (const [w, h, tactil] of TAM) {
    for (const lengua of ['es-AR', 'en-US']) {
      const p = await C.abrir(b, url + '/index.html', { ancho: w, alto: h, tactil, locale: lengua });
      await C.empezar(p);
      await partida(p);
      await p.evaluate(() => window.__juego.seleccionar({ tipo: 'ruta', id: 'BUE-ROS' }));
      await C.esperar(500);
      const sup = await superpuestos(p), cor = await cortados(p);
      C.verificar(sup.length === 0 && cor.cortes.length === 0 && !cor.fuera && !cor.scroll, `${w}×${h} ${lengua}: sin controles superpuestos ni texto cortado`, { sup, cortes: cor.cortes, fuera: cor.fuera, scroll: cor.scroll });
      if (cor.puntos.length && lengua === 'es-AR') console.log(`     recortes con «…» a propósito: ${cor.puntos.join(' | ')}`);
      if (OUT && lengua === 'es-AR') {
        await p.screenshot({ path: `${OUT}/tam-${w}x${h}-ruta.png` });
        await p.evaluate(() => window.__juego.seleccionar(null)); await C.esperar(350);
        await p.screenshot({ path: `${OUT}/tam-${w}x${h}-mapa.png` });
      }
      C.verificar(p.errores.length === 0, `${w}×${h} ${lengua}: 0 errores`, p.errores);
      await p.ctx.close();
    }
  }
}

(async () => {
  const srv = await C.servir();
  const b = await C.navegador();
  await tamanos(b, srv.url);
  await muesca(b, srv.url);
  await capturas(b, srv.url);
  await b.close(); await srv.cerrar();
  C.terminar();
})();
