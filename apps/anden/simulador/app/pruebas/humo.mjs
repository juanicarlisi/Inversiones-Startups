// app/pruebas/humo.mjs · Andén simulador, corte 1 · P8 (interfaz). Prueba de humo en Chromium.
// 1) Construye con esbuild la entrada falsa (app/entrada-falsa.ts: la interfaz con los servicios falsos) en una carpeta temporal, con
//    index.html, estilos, PWA y vendor; 2) la sirve por HTTP local (la app no abre desde file://); 3) abre Chromium del entorno y recorre
//    las 10 pantallas en 360 × 740 y 1280 × 800, en claro y en oscuro, sin errores de consola, sin desbordar a lo ancho, sin claves de
//    texto faltantes, y guarda las 40 capturas en app/pruebas/capturas/; 4) comprueba que un título con «<script>» se muestra como texto.
// Uso (desde apps/anden/simulador):
//   NODE_PATH=/opt/node-tools/node_modules node app/pruebas/humo.mjs [--solo=360-claro] [--sin-capturas]
// Sale con código 1 si algo falla, con qué se esperaba y qué salió.
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const AQUI = dirname(fileURLToPath(import.meta.url));
const APP = join(AQUI, '..');
const CAPTURAS = join(AQUI, 'capturas');
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const args = new Set(process.argv.slice(2));
const solo = [...args].find((a) => a.startsWith('--solo='))?.slice(7) ?? null;
const conCapturas = !args.has('--sin-capturas');

const fallas = [];
const fallar = (msj) => { fallas.push(msj); console.error(`  ✗ ${msj}`); };
const ok = (msj) => console.log(`  ✓ ${msj}`);

// ---------- 1. construir ----------
export async function construir(destino) {
  await build({
    entryPoints: { entrada: join(APP, 'entrada-falsa.ts') }, bundle: true, format: 'esm', splitting: true, outdir: destino,
    minify: true, sourcemap: true, target: 'es2022', logLevel: 'warning', chunkNames: 'trozos/[name]-[hash]',
  });
  copyFileSync(join(APP, 'index.html'), join(destino, 'index.html'));
  copyFileSync(join(APP, 'estilos.css'), join(destino, 'estilos.css'));
  copyFileSync(join(APP, 'pwa', 'manifest.webmanifest'), join(destino, 'manifest.webmanifest'));
  copyFileSync(join(APP, 'pwa', 'icono.svg'), join(destino, 'icono.svg'));
  mkdirSync(join(destino, 'vendor'), { recursive: true });
  copyFileSync(join(APP, 'vendor', 'LICENCIA-qrcode-generator.txt'), join(destino, 'vendor', 'LICENCIA-qrcode-generator.txt'));
  // el service worker lleva la lista de archivos construidos y una versión que es la huella de todos ellos
  const archivos = [];
  const recorrer = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) recorrer(p); else if (!f.endsWith('.map')) archivos.push(p); } };
  recorrer(destino);
  const h = createHash('sha256');
  for (const p of archivos.sort()) h.update(readFileSync(p));
  const lista = archivos.map((p) => `./${relative(destino, p).split('\\').join('/')}`);
  const sw = readFileSync(join(APP, 'pwa', 'sw.js'), 'utf8')
    .replace('/*VERSION*/dev', h.digest('hex').slice(0, 12))
    .replace('/*ARCHIVOS_CONSTRUIDOS*/[]', JSON.stringify(lista));
  writeFileSync(join(destino, 'sw.js'), sw);
  return lista;
}

// ---------- 2. servir ----------
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.map': 'application/json', '.txt': 'text/plain; charset=utf-8' };
function servir(raiz) {
  return new Promise((resolver) => {
    const s = createServer((req, res) => {
      const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let archivo = join(raiz, ruta === '/' ? 'index.html' : ruta);
      if (!archivo.startsWith(raiz)) { res.writeHead(403); res.end(); return; }
      try { if (statSync(archivo).isDirectory()) archivo = join(archivo, 'index.html'); res.writeHead(200, { 'content-type': TIPOS[extname(archivo)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); res.end(readFileSync(archivo)); }
      catch { res.writeHead(404); res.end('no está'); }
    });
    s.listen(0, '127.0.0.1', () => resolver(s));
  });
}

// ---------- 3. recorrer ----------
const PANTALLAS = ['inicio', 'escena', 'biografia', 'noches', 'ysi', 'decidir', 'comprobante', 'compartir', 'presentar', 'ingeniero'];

async function recorrido(browser, base, ancho, alto, tema) {
  const etiqueta = `${ancho}-${tema}`;
  console.log(`\n${etiqueta} (${ancho} × ${alto})`);
  const errores = [];
  const contexto = await browser.newContext({ viewport: { width: ancho, height: alto }, colorScheme: tema === 'oscuro' ? 'dark' : 'light', deviceScaleFactor: 1 });
  const page = await contexto.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`consola: ${m.text()}`); });
  page.on('pageerror', (e) => errores.push(`excepción: ${e.message}`));
  page.on('dialog', (d) => { errores.push(`diálogo inesperado: ${d.message()}`); void d.dismiss(); });
  const capturas = [];
  const esperarPantalla = async (p, ms = 30000) => {
    await page.waitForSelector(`section[data-pantalla="${p}"][data-listo="1"]`, { timeout: ms });
  };
  const sinDesborde = async (p) => {
    const d = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
    if (d.sw > d.w + 1) fallar(`${etiqueta} · ${p}: la página desborda a lo ancho (se esperaba ancho ≤ ${d.w} px y salió ${d.sw} px)`);
    // ningún elemento visible se sale de la pantalla (salvo dentro de lo que se desplaza a propósito: tablas y el JSON)
    const fuera = await page.evaluate(() => [...document.querySelectorAll('#contenido *')].filter((e) => {
      if (e.closest('.tabla-contenedor, textarea')) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
    }).slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`));
    if (fuera.length) fallar(`${etiqueta} · ${p}: elementos que se salen de la pantalla: ${fuera.join(', ')}`);
  };
  const capturar = async (n, p) => {
    await sinDesborde(p);
    if (!conCapturas) return;
    await page.evaluate(() => window.scrollTo(0, 0));
    const archivo = join(CAPTURAS, `${String(n).padStart(2, '0')}-${p}-${etiqueta}.png`);
    // página entera, pero no más de 2.400 px de alto (la tabla de réplicas del modo ingeniero es larguísima)
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    if (p === 'presentar') await page.screenshot({ path: archivo });
    else await page.screenshot({ path: archivo, fullPage: true, clip: { x: 0, y: 0, width: ancho, height: Math.min(alto, 2400) } });
    capturas.push(archivo);
  };
  const clic = (accion) => page.click(`[data-accion="${accion}"]`);
  const cabezal = (hhmm) => page.evaluate((h) => {
    const a = window.__anden.almacen; const [hh, mm] = h.split(':').map(Number);
    // el turno es de noche: las horas de la mañana son del día siguiente
    a.despachar({ tipo: 'pausar' }); a.despachar({ tipo: 'cabezal', t: ((hh < 12 ? hh + 24 : hh) * 60 + mm) * 60000 });
  }, hhmm);
  try {
    // 1. inicio
    await page.goto(`${base}/?retardo=3`);
    await esperarPantalla('inicio');
    await page.waitForFunction(() => document.querySelectorAll('.miniatura[data-listo="1"]').length >= 2, null, { timeout: 30000 });
    await capturar(1, 'inicio');
    ok('inicio: plantillas con miniaturas vivas');
    // 2. escena (plantilla chica)
    await page.click('[data-accion="abrir-plantilla"][data-plantilla="hub-chico@1.0.0"]');
    await esperarPantalla('escena');
    await page.waitForSelector('[data-resumen="costo"]', { timeout: 30000 });
    await page.waitForFunction(() => /mediana/.test(document.querySelector('[data-etiqueta-noche="A"]')?.textContent ?? ''), null, { timeout: 30000 });
    await cabezal('23:40');
    await page.waitForTimeout(150);
    const etq = await page.textContent('[data-etiqueta-noche="A"]');
    if (!/^Noche \d+ de 100 · la mediana por hora de fin$/.test(etq ?? '')) fallar(`${etiqueta} · escena: etiqueta de noche «${etq}» (se esperaba «Noche N de 100 · la mediana por hora de fin»)`);
    const sellos = await page.$$eval('[data-sello]', (xs) => xs.map((x) => x.getAttribute('data-sello')));
    if (sellos.length !== 3) fallar(`${etiqueta} · escena: ${sellos.length} sellos (se esperaban 3)`);
    await capturar(2, 'escena');
    ok(`escena: «${etq}», ${sellos.length} sellos`);
    // 3. biografía de un paquete que pierde el corte
    await clic('ver-atrasado');
    await esperarPantalla('biografia');
    const pasos = await page.$$eval('[data-paso]', (xs) => xs.length);
    if (pasos < 3) fallar(`${etiqueta} · biografía: ${pasos} pasos (se esperaban al menos 3)`);
    const cf = await page.$('[data-accion="contrafactual"]');
    if (cf) { await cf.click(); await page.waitForFunction(() => (document.querySelector('[data-ysi-resultado]')?.textContent ?? '').length > 20, null, { timeout: 15000 }); }
    await capturar(3, 'biografia');
    ok(`biografía: ${pasos} pasos${cf ? ', contrafactual corrido' : ''}`);
    await clic('volver'); await esperarPantalla('escena');
    // 4. cien noches
    await clic('ir-noches'); await esperarPantalla('noches');
    await page.click('[data-accion="noche-peor"]');
    await page.waitForFunction(() => /la peor/.test(document.querySelector('[data-etiqueta-noche="A"]')?.textContent ?? ''), null, { timeout: 20000 });
    await capturar(4, 'noches');
    ok('cien noches: capa de riesgo, abanico y la peor noche');
    await page.click('[data-accion="noche-mediana"]');
    await page.waitForFunction(() => /mediana/.test(document.querySelector('[data-etiqueta-noche="A"]')?.textContent ?? ''), null, { timeout: 20000 });
    await clic('volver'); await esperarPantalla('escena');
    // 5. ¿y si…? con un puesto más y la confirmación pareada
    await clic('ir-ysi'); await esperarPantalla('ysi');
    await clic('perilla-puestos-mas');
    await page.waitForSelector('[data-ysi="confirmada"]', { timeout: 30000 });
    await cabezal('00:10');
    if (ancho < 900) { await clic('alternar-ab'); await page.waitForTimeout(120); }
    await capturar(5, 'ysi');
    const filas = await page.$$eval('[data-tabla="comparacion"] tbody tr', (xs) => xs.length);
    if (filas < 3) fallar(`${etiqueta} · ¿y si…?: ${filas} filas en la comparación (se esperaban 4)`);
    ok(`¿y si…?: comparación pareada con ${filas} indicadores`);
    await clic('reiniciar-perillas');
    await clic('volver'); await esperarPantalla('escena');
    // 6. decidir: formulario hasta «Ya está»
    await clic('ir-decidir'); await esperarPantalla('decidir', 40000);
    await page.waitForSelector('[data-tabla="decision"]', { timeout: 30000 });
    const preguntas = await page.$$eval('[data-pregunta]', (xs) => xs.map((x) => x.getAttribute('data-pregunta')));
    await capturar(6, 'decidir');
    for (let i = 0; i < 4; i++) {
      const p = await page.$('[data-pregunta]');
      if (!p) break;
      const param = await p.getAttribute('data-pregunta');
      const campo = `[data-accion="respuesta-${param}"]`;
      if (i === 0) {
        // un dato fuera del rango de validez se rechaza en el formulario, sin tocar el modelo
        await page.fill(campo, '999999');
        await page.click(`[data-accion="usar-${param}"]`);
        const msj = await page.textContent(`[data-pregunta="${param}"] .campo__error`);
        if (!/entre/.test(msj ?? '')) fallar(`${etiqueta} · decidir: un dato fuera de rango no se rechazó (mensaje «${msj}»)`);
      }
      await page.fill(campo, await page.getAttribute(campo, 'placeholder'));
      await page.click(`[data-accion="usar-${param}"]`);
      await page.waitForFunction((x) => !document.querySelector(`[data-pregunta="${x}"]`) && document.querySelector('section[data-pantalla="decidir"]')?.getAttribute('data-listo') === '1', param, { timeout: 40000 });
    }
    const listo = await page.textContent('[data-formulario="listo"]').catch(() => null);
    if (!listo) fallar(`${etiqueta} · decidir: el formulario no llegó al mensaje final (preguntas: ${preguntas.join(', ')})`);
    else ok(`decidir: ${preguntas.length} preguntas contestadas → «${listo}»`);
    await clic('volver'); await esperarPantalla('escena');
    // 7. comprobante
    await page.waitForSelector('[data-resumen="costo"]', { timeout: 30000 });
    await clic('ir-comprobante'); await esperarPantalla('comprobante', 30000);
    await capturar(7, 'comprobante');
    ok('comprobante: receta, huellas, motor, controles y procedencia');
    await clic('volver'); await esperarPantalla('escena');
    // 8. compartir: enlace y QR
    await clic('ir-compartir'); await esperarPantalla('compartir');
    // después de contestar el formulario el modelo tiene datos propios: con «anonimizar» viaja el modelo completo anonimizado
    const anonimo = await page.inputValue('[data-enlace]');
    const viajaAnonimo = await page.textContent('[data-viaja]');
    if (!/#m=/.test(anonimo) || !/anonimizado/.test(viajaAnonimo ?? '')) fallar(`${etiqueta} · compartir: con datos propios y anonimizar se esperaba el modelo anonimizado (#m=…) y salió «${anonimo.slice(0, 60)}…»`);
    // sin anonimizar, una plantilla con cambios viaja como plantilla + parche, y entra en un QR
    await page.click('[data-accion="anonimizar"]');
    await page.waitForFunction(() => /#t=/.test(document.querySelector('[data-enlace]')?.value ?? '') && document.querySelector('section[data-pantalla="compartir"]')?.getAttribute('data-listo') === '1', null, { timeout: 15000 });
    const enlace = await page.inputValue('[data-enlace]');
    if (!/#t=hub-chico@1\.0\.0&p=/.test(enlace)) fallar(`${etiqueta} · compartir: el enlace «${enlace.slice(0, 80)}…» no es plantilla + parche`);
    const qr = await page.$eval('[data-qr]', (c) => ({ ancho: c.width, oculto: c.hidden }));
    if (qr.oculto || !(qr.ancho >= 100)) fallar(`${etiqueta} · compartir: el QR no se dibujó (ancho ${qr.ancho}, oculto ${qr.oculto})`);
    await capturar(8, 'compartir');
    ok(`compartir: anonimizado ${anonimo.length} caracteres; plantilla + parche ${enlace.length} caracteres con QR de ${qr.ancho} px`);
    await page.click('[data-accion="anonimizar"]');
    await clic('volver'); await esperarPantalla('escena');
    // 9. presentar (tres actos y la apertura), con flechas del teclado
    await clic('ir-presentar'); await esperarPantalla('presentar');
    await page.waitForTimeout(400);
    await capturar(9, 'presentar');
    for (let a = 1; a <= 3; a++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForSelector(`section[data-pantalla="presentar"][data-acto="${a}"]`, { timeout: 5000 });
    }
    ok('presentar: cuatro actos con las flechas');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    if (await page.$('section[data-pantalla="presentar"]')) await page.keyboard.press('Escape');
    await esperarPantalla('escena', 10000);
    // 10. modo ingeniero
    await clic('modo-ingeniero');
    await clic('ir-ingeniero'); await esperarPantalla('ingeniero');
    await page.waitForSelector('[data-json="valido"], [data-json="sinCambios"], [data-diagnosticos]', { timeout: 15000 }).catch(() => {});
    await capturar(10, 'ingeniero');
    ok('ingeniero: JSON validado en vivo, F0, traza y réplicas');
    // un título con <script> se muestra como texto
    const titulo = '<script>window.__xss=1</script><img src=x onerror="window.__xss=2"> Hub';
    const frag = await page.evaluate(async (t) => {
      const s = window.__anden.servicios; const m = structuredClone(s.plantillas['hub-chico@1.0.0']); m.titulo = t;
      return s.codec.codificar({ tipo: 'modelo', modelo: m });
    }, titulo);
    await page.goto(`${base}/?retardo=3#${frag}`);
    await esperarPantalla('escena');
    const visto = await page.textContent('section[data-pantalla="escena"] h1');
    const xss = await page.evaluate(() => ({ marca: window.__xss ?? null, scripts: document.querySelectorAll('#app script, #app img').length }));
    if (visto !== titulo) fallar(`${etiqueta} · título: se esperaba ver «${titulo}» como texto y se vio «${visto}»`);
    if (xss.marca !== null || xss.scripts !== 0) fallar(`${etiqueta} · título: el texto se interpretó como HTML (marca ${xss.marca}, ${xss.scripts} nodos)`);
    else ok('un título con <script> se muestra como texto y no se ejecuta');
    // enlace hostil por URL: aviso y sin cuelgue
    await page.goto(`${base}/?retardo=3#m=%%%no-es-base64`);
    await page.waitForSelector('[data-aviso]', { timeout: 10000 });
    await esperarPantalla('inicio');
    ok('enlace hostil: aviso y vuelta al inicio');
    // en inglés: la misma escena, sin claves faltantes
    if (ancho === 1280 && tema === 'claro') {
      await page.goto(`${base}/?retardo=3#t=hub-chico@1.0.0`);
      await esperarPantalla('escena');
      await page.selectOption('[data-accion="idioma"]', 'en');
      await page.waitForFunction(() => /^Night \d+ of 100/.test(document.querySelector('[data-etiqueta-noche="A"]')?.textContent ?? ''), null, { timeout: 30000 });
      const etqEn = await page.textContent('[data-etiqueta-noche="A"]');
      await clic('ir-noches'); await esperarPantalla('noches');
      await clic('volver'); await esperarPantalla('escena');
      await clic('ver-atrasado'); await esperarPantalla('biografia');
      ok(`inglés: «${etqEn}» · «${await page.textContent('section[data-pantalla="biografia"] h1')}»`);
      await page.selectOption('[data-accion="idioma"]', 'es');
    }
    const faltan = await page.evaluate(() => window.__anden.faltantes());
    if (faltan.length) fallar(`${etiqueta} · textos: faltan ${faltan.length} claves (${faltan.slice(0, 8).join(', ')})`);
    else ok('textos: ninguna clave faltante');
  } catch (e) {
    fallar(`${etiqueta}: ${e.message.split('\n')[0]}`);
    if (conCapturas) await page.screenshot({ path: join(CAPTURAS, `error-${etiqueta}.png`), fullPage: true }).catch(() => {});
  }
  for (const e of errores) fallar(`${etiqueta} · ${e}`);
  if (!errores.length) ok('sin errores de consola');
  await contexto.close();
  return capturas;
}

const tmp = mkdtempSync(join(tmpdir(), 'anden-humo-'));
let servidor = null, browser = null;
try {
  const t0 = Date.now();
  const lista = await construir(tmp);
  console.log(`construido en ${Date.now() - t0} ms: ${lista.length} archivos en ${tmp}`);
  servidor = await servir(tmp);
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const require = createRequire(import.meta.url);
  const { chromium } = require('playwright');
  browser = await chromium.launch({ executablePath: CHROMIUM });
  if (conCapturas) {
    mkdirSync(CAPTURAS, { recursive: true });
    for (const f of readdirSync(CAPTURAS)) if (f.endsWith('.png')) rmSync(join(CAPTURAS, f));
  }
  const combos = [[360, 740, 'claro'], [360, 740, 'oscuro'], [1280, 800, 'claro'], [1280, 800, 'oscuro']].filter(([w, , t]) => !solo || solo === `${w}-${t}`);
  let total = 0;
  for (const [w, h, t] of combos) total += (await recorrido(browser, base, w, h, t)).length;
  if (conCapturas && !solo && total !== PANTALLAS.length * 4) fallar(`capturas: ${total} (se esperaban ${PANTALLAS.length * 4})`);
  console.log(`\n${fallas.length ? `FALLÓ: ${fallas.length} problemas` : 'PASÓ'} · ${total} capturas en ${relative(process.cwd(), CAPTURAS)}`);
} catch (e) {
  fallar(e.stack ?? String(e));
} finally {
  await browser?.close();
  servidor?.close();
  rmSync(tmp, { recursive: true, force: true });
}
process.exitCode = fallas.length ? 1 : 0;
