#!/usr/bin/env node
/*
 * Revisión del sitio en un navegador real (Chromium con Playwright):
 *   - cada página en 360 px y en escritorio, tema claro y oscuro;
 *   - sin errores de JavaScript, sin scroll horizontal, sin «NaN» ni «undefined» en pantalla;
 *   - interacción: editar, guardar en el navegador, compartir por enlace, importar entre calculadoras,
 *     validar números, cambiar el tema e imprimir a PDF;
 *   - capturas en capturas/.
 * Uso:  node pruebas/revisar-sitio.js        (necesita Playwright y Chromium instalados)
 */
'use strict';
const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');

let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const RAIZ = path.join(__dirname, '..');
const CAPTURAS = path.join(RAIZ, 'capturas');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png' };
const PAGINAS = ['index.html', 'tarifa-transportista.html', 'costo-por-recorrido.html', 'costo-laboral.html',
  'costo-clasificacion.html', 'costo-almacenamiento.html', 'peso-volumetrico.html', 'referencias.html'];
const VISTAS = [
  { nombre: '360-claro', viewport: { width: 360, height: 780 }, colorScheme: 'light' },
  { nombre: '360-oscuro', viewport: { width: 360, height: 780 }, colorScheme: 'dark' },
  { nombre: 'escritorio-claro', viewport: { width: 1280, height: 900 }, colorScheme: 'light' },
  { nombre: 'escritorio-oscuro', viewport: { width: 1280, height: 900 }, colorScheme: 'dark' }
];

function servidor() {
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      let u = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (u.endsWith('/')) { u += 'index.html'; }
      const f = path.join(RAIZ, path.normalize(u));
      if (!f.startsWith(RAIZ)) { res.writeHead(403); res.end(); return; }
      fs.readFile(f, (e, d) => {
        if (e) { res.writeHead(404); res.end('no encontrado'); return; }
        res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' });
        res.end(d);
      });
    }).listen(0, '127.0.0.1', () => resolve(s));
  });
}

const fallas = [];
function verificar(condicion, mensaje) {
  if (!condicion) { fallas.push(mensaje); console.log('  FALLA:', mensaje); }
}

async function esperarPagina(page, archivo) {
  if (archivo === 'index.html') { await page.waitForSelector('#indices table'); }
  else if (archivo === 'referencias.html') { await page.waitForSelector('#todas-las-referencias li'); }
  else { await page.waitForSelector('.principal-valor'); }
}

async function revisarVista(browser, base, vista) {
  const ctx = await browser.newContext({ viewport: vista.viewport, colorScheme: vista.colorScheme, locale: 'es-AR' });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  page.on('console', m => { if (m.type() === 'error') { errores.push(m.text()); } });
  for (const archivo of PAGINAS) {
    await page.goto(base + archivo);
    await esperarPagina(page, archivo);
    const datos = await page.evaluate(() => {
      const ancho = window.innerWidth;
      const anchos = [];
      document.querySelectorAll('body *').forEach(el => {
        if (el.closest('.tabla-envoltura') || el.closest('.menu ul') || el.closest('.aviso')) { return; }
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > ancho + 1) { anchos.push((el.className || el.tagName) + ' ' + Math.round(r.right)); }
      });
      return {
        scroll: document.documentElement.scrollWidth, ancho,
        texto: document.body.innerText,
        anchos: anchos.slice(0, 5),
        tema: getComputedStyle(document.body).backgroundColor
      };
    });
    verificar(datos.scroll <= datos.ancho, `${vista.nombre} ${archivo}: scroll horizontal (${datos.scroll} > ${datos.ancho}) ${datos.anchos.join(', ')}`);
    verificar(!/\bNaN\b|undefined|Infinity/.test(datos.texto), `${vista.nombre} ${archivo}: aparece NaN/undefined en pantalla`);
    if (vista.colorScheme === 'dark') { verificar(datos.tema !== 'rgb(246, 247, 245)', `${vista.nombre} ${archivo}: no tomó el tema oscuro`); }
  }
  verificar(errores.length === 0, `${vista.nombre}: errores de JavaScript: ${errores.join(' | ')}`);
  await ctx.close();
}

async function capturas(browser, base) {
  fs.mkdirSync(CAPTURAS, { recursive: true });
  const lista = [
    { archivo: 'tarifa-transportista.html', vista: VISTAS[0], salida: 'tarifa-360-claro.png', completa: false },
    { archivo: 'costo-laboral.html', vista: VISTAS[1], salida: 'laboral-360-oscuro.png', completa: false },
    { archivo: 'costo-por-recorrido.html', vista: VISTAS[2], salida: 'recorrido-escritorio-claro.png', completa: false },
    { archivo: 'costo-clasificacion.html', vista: VISTAS[3], salida: 'hub-escritorio-oscuro.png', completa: false }
  ];
  for (const c of lista) {
    const ctx = await browser.newContext({ viewport: c.vista.viewport, colorScheme: c.vista.colorScheme, locale: 'es-AR', deviceScaleFactor: c.vista.viewport.width < 500 ? 2 : 1 });
    const page = await ctx.newPage();
    await page.goto(base + c.archivo);
    await esperarPagina(page, c.archivo);
    if (c.vista.viewport.width >= 960) {
      // En escritorio, mostrar también el desglose: bajar hasta los resultados
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await page.screenshot({ path: path.join(CAPTURAS, c.salida), fullPage: c.completa });
    console.log('  captura', c.salida);
    await ctx.close();
  }
}

async function interaccion(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'es-AR' });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  await page.goto(base + 'tarifa-transportista.html');
  await page.waitForSelector('.principal-valor');
  const antes = await page.textContent('.principal-valor');
  verificar(antes.replace(/\s/g, ' ').trim() === '$ 69.900', `tarifa: el margen con valores de referencia debería ser $ 69.900 y es ${antes}`);

  // Editar un campo recalcula
  await page.fill('#c-paradas', '80');
  await page.waitForFunction(a => document.querySelector('.principal-valor').textContent !== a, antes);
  const despues = await page.textContent('.principal-valor');
  verificar(despues.replace(/\s/g, ' ').trim() === '$ 93.200', `tarifa: con 80 paquetes el margen debería ser $ 93.200 y es ${despues}`);
  const hash = await page.evaluate(() => window.location.hash);
  verificar(/paradas=80/.test(hash), 'tarifa: el enlace (hash) no guardó paradas=80');

  // Se guarda en el navegador
  await page.goto(base + 'tarifa-transportista.html');
  await page.waitForSelector('.principal-valor');
  verificar((await page.inputValue('#c-paradas')) === '80', 'tarifa: el valor no quedó guardado en el navegador');

  // Número inválido
  await page.fill('#c-paradas', 'abc');
  verificar(await page.$eval('#c-paradas', el => el.classList.contains('invalido')), 'tarifa: no marcó como inválido «abc»');
  verificar((await page.textContent('.principal-valor')).replace(/\s/g, ' ').trim() === '$ 93.200', 'tarifa: un dato inválido cambió el resultado');
  await page.fill('#c-paradas', '80');

  // Cambiar la modalidad muestra el campo correcto
  await page.selectOption('#c-modalidad', 'jornada');
  verificar(await page.isVisible('#c-tarifaJornada'), 'tarifa: no apareció el pago por jornada');
  verificar(!(await page.isVisible('#c-tarifaPaquete')), 'tarifa: sigue visible el pago por paquete');

  // Importar desde la calculadora 4
  await page.click('[data-campo="costoPropio"] button.importar');
  const importado = await page.inputValue('#c-costoPropio');
  verificar(importado !== '450', `tarifa: no trajo el costo de la calculadora 4 (quedó ${importado})`);

  // Compartir: un contexto nuevo (sin nada guardado) abre el mismo escenario
  const url = page.url();
  const ctx2 = await browser.newContext({ viewport: { width: 360, height: 780 }, locale: 'es-AR' });
  const p2 = await ctx2.newPage();
  await p2.goto(url);
  await p2.waitForSelector('.principal-valor');
  verificar((await p2.inputValue('#c-paradas')) === '80', 'enlace compartido: no abrió con 80 paquetes');
  verificar((await p2.inputValue('#c-modalidad')) === 'jornada', 'enlace compartido: no abrió con la modalidad por jornada');
  verificar((await p2.textContent('.principal-valor')) === (await page.textContent('.principal-valor')), 'enlace compartido: resultado distinto');
  await ctx2.close();

  // Volver a los valores de referencia
  await page.click('[data-accion="restablecer"]');
  verificar((await page.textContent('.principal-valor')).replace(/\s/g, ' ').trim() === '$ 69.900', 'tarifa: «valores de referencia» no volvió a $ 69.900');

  // Tema
  await page.click('#boton-tema');
  verificar((await page.getAttribute('html', 'data-tema')) === 'claro', 'tema: el primer clic debería pasar a claro');
  await page.click('#boton-tema');
  verificar((await page.getAttribute('html', 'data-tema')) === 'oscuro', 'tema: el segundo clic debería pasar a oscuro');
  await page.click('#boton-tema');

  // Ejemplo de la calculadora 2 y cambio del tipo de cambio
  await page.goto(base + 'costo-por-recorrido.html');
  await page.waitForSelector('.principal-valor');
  await page.selectOption('#preset', 'camion');
  verificar((await page.inputValue('#c-kmRecorrido')) === '640', 'recorrido: el ejemplo de camión no cargó 640 km');
  await page.fill('#tc-valor', '1.600');
  verificar(/1600/.test(await page.evaluate(() => window.location.hash)), 'recorrido: el tipo de cambio no pasó al enlace');

  // Calculadora 3 → 4: el costo hora se trae
  await page.goto(base + 'costo-laboral.html');
  await page.waitForSelector('.principal-valor');
  await page.selectOption('#preset', 'c130_maestranza');
  await page.goto(base + 'costo-clasificacion.html');
  await page.waitForSelector('.principal-valor');
  await page.click('[data-campo="costoHora"] button.importar');
  const hora = await page.inputValue('#c-costoHora');
  verificar(hora !== '9.400', `hub: no trajo el costo hora de Maestranza A (quedó ${hora})`);

  // Impresión a PDF (fuera del repositorio)
  await page.emulateMedia({ media: 'print' });
  const pdf = path.join(os.tmpdir(), 'anden-prueba-impresion.pdf');
  await page.pdf({ path: pdf, format: 'A4', printBackground: true });
  verificar(fs.statSync(pdf).size > 20000, 'impresión: el PDF salió vacío');
  console.log('  PDF de prueba:', pdf, Math.round(fs.statSync(pdf).size / 1024), 'KB');

  verificar(errores.length === 0, 'interacción: errores de JavaScript: ' + errores.join(' | '));
  await ctx.close();
}

(async () => {
  const s = await servidor();
  const base = `http://127.0.0.1:${s.address().port}/`;
  const browser = await playwright.chromium.launch();
  try {
    for (const v of VISTAS) { console.log('Vista', v.nombre); await revisarVista(browser, base, v); }
    console.log('Interacción'); await interaccion(browser, base);
    console.log('Capturas'); await capturas(browser, base);
  } finally {
    await browser.close();
    s.close();
  }
  if (fallas.length) { console.log(`\n${fallas.length} fallas`); process.exit(1); }
  console.log('\nTodo bien: 8 páginas × 4 vistas, interacción e impresión.');
})().catch(e => { console.error(e); process.exit(1); });
