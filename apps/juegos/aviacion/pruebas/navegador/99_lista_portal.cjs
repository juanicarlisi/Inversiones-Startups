// Lista del portal (HN-14 y HN-27) con los SDK simulados: los controles del lanzamiento básico de CrazyGames y, aparte, los del
// lanzamiento completo (anuncios y módulo de datos), marcados como tales. El SDK real se reemplaza con uno simulado que registra
// cada llamada (la URL del SDK se intercepta).
//   node pruebas/navegador/99_lista_portal.cjs [carpeta-capturas]
const C = require('./comun.cjs');
const OUT = C.carpeta(process.argv[2]);

// SDK simulado de CrazyGames: se configura con window.__sdk = { initMs, locale, adblock, adError }.
const SDK_CRAZY = `(() => {
  const cfg = window.__sdk || {};
  const L = (window.__sdkLlamadas = []);
  const r = (x) => L.push(x);
  const datos = new Map();
  window.CrazyGames = { SDK: {
    environment: 'crazygames',
    init: () => new Promise((ok) => { if (cfg.initMs !== Infinity) setTimeout(ok, cfg.initMs ?? 40); }),
    game: { gameplayStart: () => r('gameplayStart'), gameplayStop: () => r('gameplayStop'), loadingStart: () => r('loadingStart'), loadingStop: () => r('loadingStop'), happytime: () => r('happytime') },
    user: { systemInfo: { locale: cfg.locale ?? 'en-US', countryCode: 'AR', device: { type: 'desktop' } } },
    ad: { requestAd: (t, cb) => { r('ad:' + t); cb.adStarted && cb.adStarted(); setTimeout(() => (cfg.adError ? cb.adError('nofill') : cb.adFinished && cb.adFinished()), 300); }, hasAdblock: async () => !!cfg.adblock },
    data: { getItem: (k) => (datos.has(k) ? datos.get(k) : null), setItem: (k, v) => { r('data:set'); datos.set(k, String(v)); }, removeItem: (k) => datos.delete(k), clear: () => datos.clear() },
  } };
})();`;
const SDK_POKI = `(() => {
  const L = (window.__sdkLlamadas = []);
  const r = (x) => L.push(x);
  window.PokiSDK = { init: () => Promise.resolve(), gameLoadingFinished: () => r('loadingStop'), gameplayStart: () => r('gameplayStart'), gameplayStop: () => r('gameplayStop'),
    commercialBreak: (f) => { r('ad:commercialBreak'); f && f(); return new Promise((ok) => setTimeout(ok, 300)); }, rewardedBreak: (f) => { r('ad:rewardedBreak'); f && f(); return new Promise((ok) => setTimeout(() => ok(true), 300)); } };
})();`;

async function abrirPortal(b, url, archivo, { ancho = 1280, alto = 720, locale = 'en-US', sdk = {}, guardado = null, sinAlmacenamiento = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: ancho, height: alto }, locale });
  await ctx.route('https://sdk.crazygames.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: SDK_CRAZY }));
  await ctx.route('https://game-cdn.poki.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: SDK_POKI }));
  await ctx.addInitScript((cfg) => { window.__sdk = cfg; if (cfg.initMs === 'nunca') window.__sdk.initMs = Infinity; }, sdk);
  if (sinAlmacenamiento) await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('bloqueado', 'SecurityError'); } }); });
  if (guardado) await ctx.addInitScript(([k, v]) => { try { if (!sessionStorage.getItem('hn-s')) { localStorage.setItem(k, v); sessionStorage.setItem('hn-s', '1'); } } catch { /* nada */ } }, ['hubnocturno.partida.v1', guardado]);
  const p = await ctx.newPage();
  p.errores = [];
  p.on('pageerror', (e) => p.errores.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') p.errores.push(m.text()); });
  p.ctx = ctx;
  const t0 = Date.now();
  await p.goto(`${url}/${archivo}`);
  await p.waitForFunction(() => window.__juego && !document.getElementById('app').hidden, null, { timeout: 15000 });
  p.cargaMs = Date.now() - t0;
  return p;
}
const llamadas = (p) => p.evaluate(() => window.__sdkLlamadas ?? []);
const sinRepetidos = (l) => l.every((x, i) => i === 0 || x !== l[i - 1]);
// Un guardado con 2 horas de ausencia (para la ventana de vuelta).
async function guardadoViejo(b, url) {
  const p = await C.abrir(b, url + '/index.html');
  await C.empezar(p);
  const g = await p.evaluate(() => { const { estado, M } = window.__juego, s = estado(); M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD'); for (let i = 0; i < 100; i++) M.paso(s); const o = JSON.parse(M.guardar(s)); o.guardado = Date.now() - 2 * 3600 * 1000; return JSON.stringify(o); });
  await p.ctx.close();
  return g;
}

async function basico(b, url) {
  console.log('— Lanzamiento básico (crazygames.html, sin anuncios) —');
  // carga, eventos de juego, ventanas, pausa y visibilidad
  let p = await abrirPortal(b, url, 'crazygames.html', { locale: 'en-US', sdk: { locale: 'en-US' } });
  C.verificar(p.cargaMs < 10000, 'carga hasta la portada en menos de 10 s', `${p.cargaMs} ms`);
  let l = await llamadas(p);
  C.verificar(!l.includes('gameplayStart'), 'en la portada todavía no hay gameplayStart', l);
  await p.locator('#ventana .boton.principal').click();
  await C.esperar(300);
  l = await llamadas(p);
  C.verificar(l.filter((x) => x === 'gameplayStart').length === 1 && l.at(-1) === 'gameplayStart', 'gameplayStart sale al tocar «Empezar»', l);
  await p.locator('#b-menu').click(); await p.locator('[data-accion="mCreditos"]').click(); await C.esperar(200);
  C.verificar((await llamadas(p)).at(-1) === 'gameplayStop', 'gameplayStop al abrir una ventana');
  await p.locator('#ventana .tarjeta > .cerrar').click(); await C.esperar(200);
  C.verificar((await llamadas(p)).at(-1) === 'gameplayStart', 'gameplayStart al cerrarla');
  await p.keyboard.press(' '); await C.esperar(200);
  C.verificar((await llamadas(p)).at(-1) === 'gameplayStop', 'gameplayStop al pausar');
  await p.keyboard.press(' '); await C.esperar(200);
  const antesVis = (await llamadas(p)).length;
  await p.evaluate(async () => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 300));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange'));
  });
  await C.esperar(300);
  l = await llamadas(p);
  C.verificar(l.length === antesVis, 'ninguna llamada al SDK en visibilitychange', l.slice(antesVis));
  C.verificar(sinRepetidos(l), '0 eventos repetidos seguidos', l);
  C.verificar(!l.some((x) => x.startsWith('ad:')) && !(await p.$('.video-simulado')), 'sin anuncios ni video simulado en el candidato');
  C.verificar(await p.evaluate(() => document.querySelector('meta[name=hn-lanzamiento]').content === 'basico' && !window.__juego.anuncios()), 'el candidato no carga la capa de anuncios');
  C.verificar(p.errores.length === 0, 'básico: 0 errores de consola', p.errores);
  await p.ctx.close();

  // init que no responde: el juego arranca igual en ~3 s
  p = await abrirPortal(b, url, 'crazygames.html', { sdk: { initMs: 'nunca' } });
  C.verificar(p.cargaMs < 5000, 'init del SDK sin respuesta: el juego arranca igual (Promise.race de 3 s)', `${p.cargaMs} ms`);
  await p.ctx.close();

  // idioma: el locale del SDK manda sobre el del navegador; el respaldo es inglés
  p = await abrirPortal(b, url, 'crazygames.html', { locale: 'en-US', sdk: { locale: 'es-ES' } });
  C.verificar(await p.evaluate(() => document.documentElement.lang === 'es' && /Empezar/.test(document.getElementById('ventana').textContent)), 'locale del SDK (es-ES) manda sobre el navegador (en-US)');
  await p.ctx.close();
  p = await abrirPortal(b, url, 'crazygames.html', { locale: 'es-AR', sdk: { locale: 'en-US' } });
  C.verificar(await p.evaluate(() => document.documentElement.lang === 'en' && /Start/.test(document.getElementById('ventana').textContent)), 'locale del SDK (en-US) manda sobre el navegador (es-AR): inglés');
  await p.ctx.close();

  // vuelta: solo «Cobrar»
  const g = await guardadoViejo(b, url);
  p = await abrirPortal(b, url, 'crazygames.html', { guardado: g });
  await C.esperar(400);
  const botones = await p.$$eval('#ventana .botones button', (x) => x.map((y) => y.textContent.trim()));
  C.verificar(botones.length === 1 && /Collect|Cobrar/.test(botones[0]), 'la ventana de vuelta muestra solo «Cobrar» (video con premio apagado)', botones);
  const antes = (await llamadas(p)).filter((x) => x === 'gameplayStart').length;
  await p.locator('#ventana .boton.principal').click(); await C.esperar(250);
  C.verificar((await llamadas(p)).filter((x) => x === 'gameplayStart').length === antes + 1, 'gameplayStart al cerrar la ventana de vuelta');
  if (OUT) await p.screenshot({ path: `${OUT}/portal-vuelta.png` });
  await p.ctx.close();

  // sin almacenamiento: arranca y avisa
  p = await abrirPortal(b, url, 'crazygames.html', { sinAlmacenamiento: true });
  await p.locator('#ventana .boton.principal').click(); await C.esperar(300);
  const aviso = await p.evaluate(() => { const e = document.getElementById('sin-guardar'); return !e.hidden && e.textContent; });
  C.verificar(!!aviso && p.errores.length === 0, 'localStorage bloqueado: el juego arranca y avisa «no se guarda el progreso»', aviso);
  await p.ctx.close();

  // guardado que sobrevive a la recarga, y bucle que no muere
  p = await abrirPortal(b, url, 'crazygames.html');
  await p.locator('#ventana .boton.principal').click();
  await p.evaluate(() => { const { estado, M } = window.__juego, s = estado(); M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD'); window.__juego.guardar(); });
  await p.reload(); await p.waitForFunction(() => window.__juego && !document.getElementById('app').hidden);
  C.verificar(await p.evaluate(() => window.__juego.estado().rutas.length === 1), 'el guardado sobrevive a la recarga');
  const t1 = await p.evaluate(() => window.__juego.estado().t);
  await p.evaluate(() => window.__juego.romper(1)); await C.esperar(1200);
  const t2 = await p.evaluate(() => window.__juego.estado().t);
  C.verificar(t2 > t1, 'un error en un cuadro no detiene el bucle (el tiempo sigue)', { t1, t2 });
  await p.evaluate(() => window.__juego.romper(3)); await C.esperar(400);
  const rec = await p.$$eval('#ventana .botones button', (x) => x.map((y) => y.textContent.trim()));
  C.verificar(rec.length === 2 && /Restore|Restaurar/.test(rec[0]), 'con 3 errores seguidos: «Restaurar respaldo / Empezar de nuevo»', rec);
  await p.locator('#ventana .boton.principal').click(); await C.esperar(800);
  const t3 = await p.evaluate(() => ({ t: window.__juego.estado().t, rutas: window.__juego.estado().rutas.length, respaldo: !!localStorage.getItem('hubnocturno.partida.respaldo') }));
  C.verificar(t3.rutas === 1 && t3.respaldo, 'restaurar el respaldo vuelve a la partida guardada y el juego sigue', t3);
  C.verificar(p.errores.length === 0, 'robustez: 0 errores de consola (los cuadros rotos van a console.warn)', p.errores);
  await p.ctx.close();

  // ?debug=1
  p = await abrirPortal(b, url, 'crazygames.html?debug=1');
  await p.locator('#ventana .boton.principal').click(); await C.esperar(2300);
  const dbg = await p.evaluate(() => document.getElementById('depurar').textContent);
  C.verificar(/fps/.test(dbg) && /ms\/paso/.test(dbg) && /KB/.test(dbg) && /gameplayStart/.test(dbg), '?debug=1 muestra fps, ms por paso, tamaño del guardado y eventos del SDK', dbg.replace(/\n/g, ' | '));
  await p.ctx.close();

  // horizontal 16:9 sin desplazamiento, estilos que evitan la lupa y el menú, Chromebook lento
  for (const [w, h] of [[1280, 720], [960, 540], [800, 450], [640, 360]]) {
    p = await abrirPortal(b, url, 'crazygames.html', { ancho: w, alto: h });
    await p.locator('#ventana .boton.principal').click(); await C.esperar(200);
    const r = await p.evaluate(() => ({ sx: document.documentElement.scrollWidth <= innerWidth, sy: document.documentElement.scrollHeight <= innerHeight, us: getComputedStyle(document.body).userSelect }));
    C.verificar(r.sx && r.sy && r.us === 'none', `${w}×${h}: entra sin desplazar la página y con user-select none`, r);
    await p.ctx.close();
  }
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.route('https://sdk.crazygames.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: SDK_CRAZY }));
  p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const t0 = Date.now();
  await p.goto(`${url}/crazygames.html`);
  await p.waitForFunction(() => window.__juego && !document.getElementById('app').hidden, null, { timeout: 20000 });
  C.verificar(Date.now() - t0 < 10000, 'Chromebook simulado (CPU ×4 más lenta): carga en menos de 10 s', `${Date.now() - t0} ms`);
  await ctx.close();

  // paquete: rutas relativas y menos de 1.500 archivos
  const { archivosDe, rutasAbsolutas } = await import('../../herramientas/empaquetar.mjs');
  const paq = archivosDe('crazygames');
  C.verificar(rutasAbsolutas(paq).length === 0 && Object.keys(paq).length < 1500 && !('js/anuncios.js' in paq), 'paquete del candidato: solo rutas relativas, menos de 1.500 archivos y sin js/anuncios.js', { archivos: Object.keys(paq).length });
}

async function completo(b, url) {
  console.log('— Lanzamiento completo (HN-27, v1.1: crazygames-completo.html y poki.html) —');
  let p = await abrirPortal(b, url, 'crazygames-completo.html');
  await p.locator('#ventana .boton.principal').click();
  await p.evaluate(() => { const { estado, M } = window.__juego, s = estado(); M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD'); window.__juego.fijarVel(6); });
  await C.esperar(4000);
  await p.evaluate(() => window.__juego.guardar());
  C.verificar(!(await llamadas(p)).some((x) => x.startsWith('ad:')), '[completo] ningún anuncio durante el juego activo');
  C.verificar((await llamadas(p)).includes('data:set'), '[completo] el guardado va al módulo de datos del SDK');
  // fin del capítulo 1 → happytime → «Ir al capítulo 2» → un corte, con la simulación quieta
  await p.evaluate(() => { const s = window.__juego.estado(); s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos']; s.mision = null; });
  await C.esperar(400);
  await p.evaluate(() => { const s = window.__juego.estado(); if (s.mision) s.mision.mejor = 60000; });
  await p.waitForSelector('#ventana .tarjeta.resumen', { timeout: 6000 });
  C.verificar((await llamadas(p)).includes('happytime'), '[completo] happytime al terminar un capítulo');
  await p.locator('#ventana .boton.principal').click();
  await C.esperar(120);
  const durante = await p.evaluate(() => ({ en: window.__juego.anuncios().enAnuncio, t: window.__juego.estado().t }));
  await C.esperar(120);
  const t2 = await p.evaluate(() => window.__juego.estado().t);
  C.verificar(durante.en && t2 === durante.t, '[completo] durante el corte la simulación no avanza', { ...durante, t2 });
  await C.esperar(500);
  C.verificar((await llamadas(p)).filter((x) => x === 'ad:midgame').length === 1 && await p.evaluate(() => window.__juego.estado().cap === 2), '[completo] un solo corte al cerrar el capítulo, antes de seguir');
  const r = await p.evaluate(() => window.__juego.anuncios().corteCapitulo());
  C.verificar(r === 'espera', '[completo] nunca más de un corte cada 3 minutos', r);
  await p.ctx.close();
  // video con premio: apagado por la bandera legal; con la bandera, aparece con foco en «Cobrar» y no paga si el anuncio falla
  const g = await guardadoViejo(b, url);
  p = await abrirPortal(b, url, 'crazygames-completo.html', { guardado: g });
  await C.esperar(400);
  C.verificar((await p.$$('#ventana .botones button')).length === 1, '[completo] con la bandera legal apagada, la vuelta muestra solo «Cobrar»');
  await p.ctx.close();
  for (const adError of [false, true]) {
    p = await abrirPortal(b, url, 'crazygames-completo.html', { guardado: g, sdk: { adError } });
    await C.esperar(300);
    await p.locator('#ventana .boton.principal').click(); // se cobra la vuelta original (bandera apagada) …
    await p.evaluate(async () => { (await import('./js/anuncios.js')).BANDERAS.videoConPremio = true; });
    await p.evaluate(() => window.__juego.volver(3600)); // … y se vuelve de otra ausencia con la bandera encendida
    await C.esperar(400);
    const bot = await p.$$eval('#ventana .botones button', (x) => x.map((y) => y.textContent.trim()));
    const foco = await p.evaluate(() => document.activeElement?.textContent?.trim());
    if (!adError) C.verificar(bot.length === 2 && /Collect|Cobrar/.test(foco ?? ''), '[completo] con la bandera: el botón de video aparece y el foco inicial va a «Cobrar»', { bot, foco });
    const antes = await p.evaluate(() => window.__juego.estado().dinero);
    await p.locator('#ventana .botones button').nth(1).click();
    await C.esperar(900);
    const despues = await p.evaluate(() => window.__juego.estado().dinero);
    if (adError) C.verificar(Math.abs(despues - antes) < 1, '[completo] con adError nunca se paga el premio', { antes, despues });
    else C.verificar(despues > antes, '[completo] con el anuncio visto se paga el premio', { antes, despues });
    await p.ctx.close();
  }
  // Poki
  p = await abrirPortal(b, url, 'poki.html');
  await p.locator('#ventana .boton.principal').click(); await C.esperar(300);
  await p.keyboard.press(' '); await C.esperar(200); await p.keyboard.press(' '); await C.esperar(200);
  const lp = await llamadas(p);
  C.verificar(lp.includes('loadingStop') && sinRepetidos(lp) && lp.filter((x) => x === 'gameplayStart').length === 2, '[completo] Poki: gameLoadingFinished y gameplayStart/Stop sin repetir', lp);
  C.verificar(p.errores.length === 0, '[completo] Poki: 0 errores', p.errores);
  await p.ctx.close();
}

(async () => {
  const srv = await C.servir();
  const b = await C.navegador();
  await basico(b, srv.url);
  await completo(b, srv.url);
  await b.close(); await srv.cerrar();
  C.terminar();
})();
