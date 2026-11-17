// Prueba de punta a punta (Chromium con Playwright) y capturas. Uso: python3 build.py && node pruebas/e2e.cjs
// 1) primer uso → 3 gastos (uno en cuotas) → cierre de mes → respaldo → recarga SIN RED: todo sigue;
// 2) versión nueva del service worker → «Actualizar» → los datos siguen;
// 3) importar la copia de la app anterior desde el primer uso;
// 4) capturas en 390×844 y 1280×800, claro y oscuro, en capturas/.
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { servir } = require('./servidor.cjs');
const WEB = path.join(__dirname, '..', 'web'), CAP = path.join(__dirname, '..', 'capturas');
const COPIA = path.join(__dirname, 'datos', 'app-anterior-copia.json');
let fallas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) fallas++; };
const MOVIL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const ESCRITORIO = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 };

async function nuevaPagina(b, opciones, errores) {
  const ctx = await b.newContext({ locale: 'es-AR', acceptDownloads: true, ...opciones });
  const p = await ctx.newPage();
  p.on('pageerror', e => errores.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  return { ctx, p };
}
async function gastoRapido(p, texto, despues) {
  await p.click('.fab'); await p.waitForSelector('[data-act="cp-quick"]');
  if (!(await p.$('#quick'))) await p.click('[data-act="cp-quick"]');
  await p.fill('#quick', texto); await p.press('#quick', 'Enter');
  if (despues) await despues();
  await p.click('#btn-save'); await p.waitForFunction(() => !document.querySelector('.scrim'));
  await p.waitForTimeout(150);
}
const cerrarCelebracion = async p => { await p.evaluate(() => { const c = document.getElementById('cele'); if (c) c.remove(); document.querySelectorAll('.toast').forEach(t => t.remove()); }); };

(async () => {
  const srv = await servir(WEB);
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const errores = [];
  fs.mkdirSync(CAP, { recursive: true });

  console.log('1) Primer uso, tres gastos, cierre y recarga sin red');
  const { ctx, p } = await nuevaPagina(b, { ...MOVIL, colorScheme: 'light' }, errores);
  const t0 = Date.now();
  await p.goto(srv.url); await p.waitForSelector('.ob');
  await p.click('[data-act="ob-sig"]'); await p.fill('#ob-n0', 'Sol'); await p.fill('#ob-n1', 'Tomi');
  await p.click('[data-act="ob-sig"]'); await p.click('[data-act="ob-tj"][data-k="visa"]');
  await p.click('[data-act="ob-fin"]'); await p.waitForSelector('#quick');
  await p.fill('#quick', '1500 verdu'); await p.press('#quick', 'Enter'); await p.click('#btn-save');
  await p.waitForFunction(() => S.movs.length === 1);
  const seg = (Date.now() - t0) / 1000;
  ok(seg < 60, `de cero a un primer gasto: ${seg.toFixed(1)} s (automatizado; la métrica de la app dice ${await p.evaluate(() => (S.met || {}).segundosHastaPrimerGasto)} s)`);
  await cerrarCelebracion(p);
  await gastoRapido(p, '23400 carrefour debito');
  await gastoRapido(p, '90 mil zapatillas visa', async () => { await p.click('[data-act="cp-cuotas"][data-k="3"]'); });
  const n = await p.evaluate(() => ({ movs: S.movs.length, cuotas: S.movs.filter(m => m.cuota).length, ver: S.movs.find(m => m.com === 'Verdu'), deb: S.movs.find(m => m.medio === 'deb') }));
  ok(n.movs === 5 && n.cuotas === 3, `3 gastos cargados (5 movimientos: uno en 3 cuotas) → ${n.movs} / ${n.cuotas}`);
  ok(n.ver && n.ver.items[0].cat === 'alim' && n.deb && n.deb.total === 23400, '«1500 verdu» va a Alimentos y «23400 carrefour debito» queda con débito');
  await cerrarCelebracion(p);
  const ym = await p.evaluate(() => ymNow());
  await p.click(`[data-act="cerrar"][data-ym="${ym}"]`); await p.waitForSelector('[data-act="w-ok"]'); await p.waitForTimeout(450);
  await p.screenshot({ path: path.join(CAP, 'movil-claro-4-cierre.png') });
  await p.click('[data-act="w-ok"]'); await p.waitForFunction(m => !!S.cierres[m], ym);
  ok(true, `mes ${ym} cerrado`);
  await cerrarCelebracion(p);
  // respaldo descargado desde Ajustes
  await p.click('[data-act="go"][data-v="ajustes"]');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act="respaldo"]')]);
  const resp = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(resp.formato === 'nido-respaldo' && Object.keys(resp.datos.mov).length === 5 && resp.datos.cfg['cierre_' + ym], `respaldo descargado (${dl.suggestedFilename()}) con los 5 movimientos y el cierre`);
  await p.click('[data-act="go"][data-v="inicio"]');
  // service worker controlando la página
  await p.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!(await p.evaluate(() => !!navigator.serviceWorker.controller))) await p.reload();
  await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  const fallidos = []; p.on('requestfailed', r => fallidos.push(r.url()));
  await ctx.setOffline(true);
  await p.reload(); await p.waitForSelector('.top');
  const off = await p.evaluate(m => ({ movs: S.movs.length, cierre: !!S.cierres[m], fuente: document.fonts.check('700 16px Manrope'), online: navigator.onLine, verdu: document.body.innerText.includes('Verdu') }), ym);
  ok(!off.online, 'sin red de verdad (navigator.onLine = false)');
  ok(off.movs === 5 && off.cierre && off.verdu, 'después de recargar sin red siguen los 5 movimientos, el cierre y la lista');
  ok(off.fuente, 'la tipografía sale de la caché propia (sin Google Fonts)');
  ok(fallidos.length === 0, 'ningún pedido falló sin red' + (fallidos.length ? ': ' + fallidos.join(', ') : ''));
  await ctx.setOffline(false);

  console.log('2) Versión nueva: se avisa, se actualiza con un toque y los datos siguen');
  srv.estado.reemplazos['/sw.js'] = t => t.replace(/const VERSION = '([^']+)'/, "const VERSION = '$1-b'");
  srv.estado.reemplazos['/index.html'] = t => t.replace(/const NIDO_BUILD = "([^"]+)"/, 'const NIDO_BUILD = "$1 · nueva"');
  await p.evaluate(() => S.pwa.reg.update());
  await p.waitForSelector('[data-act="pwa-actualizar"]', { timeout: 15000 });
  ok(true, 'aparece «Hay una versión nueva»');
  await Promise.all([p.waitForEvent('load'), p.click('.aviso [data-act="pwa-actualizar"]')]);
  await p.waitForSelector('.top');
  const tras = await p.evaluate(m => ({ build: APP_BUILD, movs: S.movs.length, cierre: !!S.cierres[m] }), ym);
  ok(/nueva/.test(tras.build), 'corre la versión nueva: ' + tras.build);
  ok(tras.movs === 5 && tras.cierre, 'la actualización no tocó los datos');
  delete srv.estado.reemplazos['/sw.js']; delete srv.estado.reemplazos['/index.html'];
  await ctx.close();

  console.log('3) Importar la copia de la app anterior desde el primer uso');
  const B = await nuevaPagina(b, { ...MOVIL, colorScheme: 'light' }, errores);
  await B.p.goto(srv.url); await B.p.waitForSelector('.ob');
  await B.p.screenshot({ path: path.join(CAP, 'movil-claro-1-bienvenida.png') });
  await B.p.setInputFiles('#file-import', COPIA);
  await B.p.waitForSelector('[data-act="import-ok"]'); await B.p.waitForTimeout(450);
  await B.p.screenshot({ path: path.join(CAP, 'movil-claro-8-importar.png') });
  await B.p.click('[data-act="import-ok"]'); await B.p.waitForSelector('.top');
  const imp = await B.p.evaluate(() => ({ movs: S.movs.length, plan: S.plan.items.length, may: !!cfg().mayordomia }));
  ok(imp.movs === 38 && imp.plan === 3 && imp.may, `importados ${imp.movs} movimientos y ${imp.plan} ítems del plan; mayordomía encendida porque la copia la usaba`);
  await B.ctx.close();

  console.log('4) Capturas');
  const datos = fs.readFileSync(COPIA, 'utf8');
  for (const [nombre, opc] of [['movil', MOVIL], ['escritorio', ESCRITORIO]]) for (const tema of ['light', 'dark']) {
    const T = tema === 'light' ? 'claro' : 'oscuro', pre = path.join(CAP, `${nombre}-${T}-`);
    const C = await nuevaPagina(b, { ...opc, colorScheme: tema }, errores); const q = C.p;
    await q.goto(srv.url); await q.waitForSelector('.ob'); await q.evaluate(() => document.fonts.ready);
    if (!(nombre === 'movil' && tema === 'light')) await q.screenshot({ path: pre + '1-bienvenida.png' });
    await q.evaluate(async t => { const r = leerRespaldo(t); r.datos.cfg.main.tc = 1500; await Store.reemplazar(r.datos); S.mes = '2026-10'; S.vista = 'inicio'; render(); }, datos);
    await q.waitForSelector('.top'); await q.waitForTimeout(500);
    await q.screenshot({ path: pre + '2-inicio.png' });
    await q.click('.fab'); await q.waitForSelector('[data-act="cp-quick"]'); await q.click('[data-act="cp-quick"]'); await q.fill('#quick', '15 lucas super visa'); await q.press('#quick', 'Enter'); await q.waitForTimeout(450);
    await q.screenshot({ path: pre + '3-nuevo-gasto.png' });
    await q.click('.sheet [data-act="sheet-close"]');
    if (!(nombre === 'movil' && tema === 'light')) { await q.click('[data-act="cerrar"][data-ym="2026-09"]'); await q.waitForSelector('[data-act="w-ok"]'); await q.waitForTimeout(450); await q.screenshot({ path: pre + '4-cierre.png' }); await q.click('.sheet [data-act="sheet-close"]'); }
    await q.click('[data-act="go"][data-v="analisis"]'); await q.waitForTimeout(250); await q.screenshot({ path: pre + '5-analisis.png' });
    await q.click('[data-act="go"][data-v="fondos"]'); await q.waitForTimeout(250); await q.screenshot({ path: pre + '6-fondos.png' });
    await q.click('[data-act="go"][data-v="ajustes"]'); await q.waitForTimeout(400); await q.screenshot({ path: pre + '7-ajustes.png' });
    await q.evaluate(() => { const h = [...document.querySelectorAll('.card h2')].find(x => x.textContent.startsWith('Tarjetas')); h.scrollIntoView(); window.scrollBy(0, -70); }); await q.waitForTimeout(150); await q.screenshot({ path: pre + '7b-ajustes-tarjetas.png' });
    await q.evaluate(() => { const h = [...document.querySelectorAll('.card h2')].find(x => x.textContent.startsWith('Tus datos')); h.scrollIntoView(); window.scrollBy(0, -70); }); await q.waitForTimeout(150); await q.screenshot({ path: pre + '7c-ajustes-datos.png' });
    await C.ctx.close();
  }
  console.log('  capturas en', CAP);
  ok(errores.length === 0, 'sin errores de JavaScript en la consola' + (errores.length ? ':\n    ' + errores.join('\n    ') : ''));
  await b.close(); srv.srv.close();
  console.log(fallas ? `\n${fallas} FALLA(S)` : '\nTodo bien.'); process.exit(fallas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
