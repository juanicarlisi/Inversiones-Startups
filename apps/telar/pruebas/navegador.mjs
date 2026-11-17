// Prueba de punta a punta en Chromium (Playwright del entorno, sin descargar navegadores) y capturas.
// Uso: python3 build.py && node pruebas/navegador.mjs
//
// Recorre: primer minuto con el ejemplo → borrarlo → crear área y proyecto → tres tareas → arrastrar una fila y una
// barra con el dedo en 390×844 → recargar sin red (service worker) → todo sigue. Además: mudanza desde una copia
// de Plan Maestro (datos inventados), copia en archivo de ida y vuelta, actualización de la app sin perder datos,
// y capturas en 390×844 y 1280×800, claro y oscuro, en capturas/.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { servir } from './servidor.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const CAP = RAIZ + 'capturas/';
mkdirSync(CAP, { recursive: true });

const resultados = [];
async function paso(nombre, fn) {
  const t0 = Date.now();
  try {
    await fn();
    resultados.push(['ok', nombre, Date.now() - t0]);
    console.log(`ok   ${nombre} (${Date.now() - t0} ms)`);
  } catch (e) {
    resultados.push(['MAL', nombre, Date.now() - t0]);
    console.log(`MAL  ${nombre}\n     ${(e && e.stack) || e}`);
    throw e;
  }
}

const { srv, url } = await servir();
const nav = await chromium.launch({ args: ['--no-sandbox'] });
const errores = [];

async function contexto({ ancho, alto, tema = 'light', movil = false }) {
  const ctx = await nav.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: movil ? 2 : 1,
    isMobile: movil,
    hasTouch: movil,
    colorScheme: tema,
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    acceptDownloads: true,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errores.push(`[${ancho}] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errores.push(`[${ancho}] consola: ${m.text()}`);
  });
  return { ctx, page };
}

const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__telar.E.plan)));
const esperarGuardado = (page) => page.waitForFunction(() => window.__telar.repo() && window.__telar.repo().estado === 'guardado' && !document.querySelector('#save[data-s="pendiente"]'));
const leerBase = (page) =>
  page.evaluate(
    () =>
      new Promise((ok, mal) => {
        const r = indexedDB.open('telar');
        r.onsuccess = () => {
          const g = r.result.transaction('documentos').objectStore('documentos').get('principal');
          g.onsuccess = () => ok(g.result);
          g.onerror = () => mal(g.error);
        };
        r.onerror = () => mal(r.error);
      }),
  );
async function listaParaSinRed(page) {
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 });
}
const centro = async (loc) => {
  const b = await loc.boundingBox();
  assert.ok(b, 'no se ve el elemento');
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b };
};

/** Gesto táctil real (CDP): apoyar, esperar (pulsación larga), deslizar y soltar. */
async function deslizarConDedo(page, cdp, desde, hasta, { espera = 0, pasos = 14, alMedio = null } = {}) {
  const t = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y, id: 1 }] : [] });
  await t('touchStart', desde);
  await page.waitForTimeout(espera || 30);
  for (let i = 1; i <= pasos; i++) {
    await t('touchMove', { x: desde.x + ((hasta.x - desde.x) * i) / pasos, y: desde.y + ((hasta.y - desde.y) * i) / pasos });
    await page.waitForTimeout(18);
  }
  await page.waitForTimeout(80);
  if (alMedio) await alMedio();
  await t('touchEnd', null);
  await page.waitForTimeout(150);
}

const tareasDe = (p, nombreProyecto) => {
  const pr = p.projects.find((x) => x.n === nombreProyecto);
  return p.tasks.filter((t) => t.p === pr.id);
};

try {
  /* ═════════ 1. Celular 390×844: el recorrido completo ═════════ */
  const { ctx, page } = await contexto({ ancho: 390, alto: 844, movil: true });
  const cdp = await ctx.newCDPSession(page);
  let antesDeRecargar;

  await paso('primer minuto: abre con el ejemplo «Tu 2027», no en blanco', async () => {
    await page.goto(url);
    await page.waitForSelector('#aviso:not([hidden])');
    assert.match(await page.textContent('#aviso'), /Tu 20\d\d/);
    assert.ok((await page.locator('#canvas .row').count()) > 8);
    await listaParaSinRed(page);
    await page.screenshot({ path: CAP + 'telar-390-claro-1-ejemplo.png' });
  });

  await paso('el ejemplo se borra con un toque y aparece «Armá tu primer proyecto»', async () => {
    await page.tap('#borrarEjemplo');
    await page.waitForSelector('#formPrimero');
    assert.equal((await plan(page)).areas.length, 0);
    assert.ok(await page.isHidden('#aviso'));
    await page.screenshot({ path: CAP + 'telar-390-claro-2-primer-proyecto.png' });
  });

  await paso('crear un área y un proyecto (camino corto)', async () => {
    await page.tap('#pp-nombre');
    await page.fill('#pp-nombre', 'Mudarme antes de marzo');
    await page.tap('label.chipr:has-text("Casa")');
    const fecha = await page.evaluate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 90);
      return d.toISOString().slice(0, 10);
    });
    await page.fill('#pp-fecha', fecha);
    await page.tap('#formPrimero button[type="submit"]');
    await page.waitForSelector('#panel:not([hidden])');
    const p = await plan(page);
    assert.deepEqual(p.areas.map((a) => a.n), ['Casa']);
    assert.deepEqual(p.projects.map((x) => x.n), ['Mudarme antes de marzo']);
    assert.equal(p.tasks.length, 1); // la fecha meta
    assert.equal(p.tasks[0].ty, 'hito');
  });

  await paso('sumar tres tareas desde el detalle', async () => {
    await page.tap('#panel [data-act="add"]');
    for (const [i, nombre] of ['Buscar departamento', 'Pedir presupuestos de flete', 'Embalar la cocina'].entries()) {
      if (i > 0) await page.tap('#panel [data-act="otra"]');
      await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'f-name');
      await page.fill('#f-name', nombre);
      await page.press('#f-name', 'Enter');
    }
    const ts = tareasDe(await plan(page), 'Mudarme antes de marzo').filter((t) => t.ty === 'tarea');
    assert.deepEqual(ts.map((t) => t.n), ['Buscar departamento', 'Pedir presupuestos de flete', 'Embalar la cocina']);
    await page.screenshot({ path: CAP + 'telar-390-claro-3-detalle.png' });
    await page.tap('#panel [data-act="close"]');
    await page.tap('#segLevel button[data-v="tareas"]');
    await page.screenshot({ path: CAP + 'telar-390-claro-4-mi-plan.png' });
  });

  await paso('arrastrar una fila con el dedo cambia la prioridad', async () => {
    const asa = await centro(page.locator('.row.task:has-text("Embalar la cocina") .grip'));
    const destino = await centro(page.locator('.row.task:has-text("Buscar departamento")'));
    await deslizarConDedo(page, cdp, asa, { x: asa.x, y: destino.b.y + 6 }, {
      alMedio: () => page.screenshot({ path: CAP + 'telar-390-claro-5-arrastrando.png' }),
    });
    const ts = tareasDe(await plan(page), 'Mudarme antes de marzo').filter((t) => t.ty === 'tarea');
    assert.deepEqual(ts.map((t) => t.n), ['Embalar la cocina', 'Buscar departamento', 'Pedir presupuestos de flete']);
  });

  await paso('deslizar sobre una barra sin pulsación larga desplaza (no la mueve)', async () => {
    const antes = tareasDe(await plan(page), 'Mudarme antes de marzo').find((t) => t.n === 'Pedir presupuestos de flete');
    const bar = await centro(page.locator(`.bar[data-id="${antes.id}"]`));
    await deslizarConDedo(page, cdp, bar, { x: bar.x - 120, y: bar.y }, { espera: 0, pasos: 8 });
    const despues = tareasDe(await plan(page), 'Mudarme antes de marzo').find((t) => t.n === 'Pedir presupuestos de flete');
    assert.deepEqual([despues.s, despues.e], [antes.s, antes.e]);
  });

  await paso('pulsación larga sobre una barra y arrastrar la corre de fecha', async () => {
    await page.click('#today');
    await page.waitForTimeout(500);
    const antes = tareasDe(await plan(page), 'Mudarme antes de marzo').find((t) => t.n === 'Pedir presupuestos de flete');
    const loc = page.locator(`.bar[data-id="${antes.id}"]`);
    await loc.scrollIntoViewIfNeeded();
    const bar = await centro(loc);
    await deslizarConDedo(page, cdp, bar, { x: bar.x + 6 * 10, y: bar.y }, { espera: 520, pasos: 12 }); // 10 días a 6 px por día
    const despues = tareasDe(await plan(page), 'Mudarme antes de marzo').find((t) => t.n === 'Pedir presupuestos de flete');
    const corrio = (Date.parse(despues.s) - Date.parse(antes.s)) / 864e5;
    assert.ok(corrio >= 8 && corrio <= 12, `corrió ${corrio} días`);
    assert.equal(Date.parse(despues.e) - Date.parse(despues.s), Date.parse(antes.e) - Date.parse(antes.s));
  });

  await paso('tocar una barra la elige (píldora, sin tapar) y su punta se estira enseguida con el dedo', async () => {
    const antes = tareasDe(await plan(page), 'Mudarme antes de marzo').find((t) => t.n === 'Embalar la cocina');
    const loc = page.locator(`.bar[data-id="${antes.id}"]`);
    await loc.tap();
    await page.waitForSelector('#pildora:not([hidden])');
    assert.ok(await page.isHidden('#panel'), 'la hoja de detalle no se abre al tocar la barra');
    const b = await loc.boundingBox();
    const punta = { x: b.x + b.width + 4, y: b.y + b.height / 2 };
    await deslizarConDedo(page, cdp, punta, { x: punta.x + 6 * 5, y: punta.y }, { pasos: 8 }); // 5 días
    const despues = tareasDe(await plan(page), 'Mudarme antes de marzo').find((t) => t.n === 'Embalar la cocina');
    assert.equal(despues.s, antes.s);
    const estiro = (Date.parse(despues.e) - Date.parse(antes.e)) / 864e5;
    assert.ok(estiro >= 4 && estiro <= 6, `se estiró ${estiro} días`);
    await page.screenshot({ path: CAP + 'telar-390-claro-5b-barra-estirada.png' });
    await page.tap('#pildora [data-pil="cerrar"]');
  });

  await paso('lo guardado en IndexedDB es lo que se ve', async () => {
    await esperarGuardado(page);
    const doc = await leerBase(page);
    antesDeRecargar = await plan(page);
    assert.equal(doc.formato, 1);
    assert.deepEqual(doc.plan.tasks.map((t) => [t.n, t.s, t.e]), antesDeRecargar.tasks.map((t) => [t.n, t.s, t.e]));
  });

  await paso('sin red, recargar abre la app con todo igual', async () => {
    await ctx.setOffline(true);
    await page.reload();
    await page.waitForSelector('#canvas .row.area');
    const p = await plan(page);
    assert.deepEqual(p, antesDeRecargar);
    assert.ok(await page.isHidden('#aviso'));
    await page.screenshot({ path: CAP + 'telar-390-claro-6-sin-conexion.png' });
    await ctx.setOffline(false);
  });

  await paso('la vista del tablero en el celular (arrastrar una tarjeta con pulsación larga)', async () => {
    await page.tap('#segView button[data-v="board"]');
    await page.waitForSelector('#board .card');
    const card = await centro(page.locator('#board .card:has-text("Buscar departamento")'));
    const t = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p.x, y: p.y, id: 1 }] : [] });
    // Como una persona: pulsación larga, llevar la tarjeta al borde derecho, esperar a que aparezca «En curso»,
    // volver hacia el centro de esa columna y soltar.
    await t('touchStart', card);
    await page.waitForTimeout(420);
    for (let i = 1; i <= 10; i++) {
      await t('touchMove', { x: card.x + ((372 - card.x) * i) / 10, y: card.y + 20 });
      await page.waitForTimeout(18);
    }
    await page.waitForFunction(() => {
      const c = document.querySelector('#board .col[data-key="doing"]').getBoundingClientRect();
      return c.left < 80;
    });
    const col = await centro(page.locator('#board .col[data-key="doing"] .colb'));
    for (let i = 1; i <= 6; i++) {
      await t('touchMove', { x: 372 + ((col.x - 372) * i) / 6, y: card.y + 20 });
      await page.waitForTimeout(18);
    }
    await page.waitForTimeout(60);
    await t('touchEnd', null);
    await page.waitForTimeout(250);
    const tarea = (await plan(page)).tasks.find((x) => x.n === 'Buscar departamento');
    assert.equal(tarea.st, 'doing');
    await page.screenshot({ path: CAP + 'telar-390-claro-7-tablero.png' });
  });

  await paso('actualizar la app (versión nueva del service worker) no pierde datos', async () => {
    await esperarGuardado(page);
    const antes = await plan(page);
    const swRuta = RAIZ + 'dist/sw.js';
    const sw = readFileSync(swRuta, 'utf8');
    writeFileSync(swRuta, sw.replace(/const VERSION = '([^']+)'/, "const VERSION = '$1-nueva'"));
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    await page.waitForSelector('.toast:has-text("versión nueva")', { timeout: 15000 });
    await Promise.all([page.waitForEvent('load'), page.click('.toast button')]);
    await page.waitForSelector('#canvas .row, #board .col');
    assert.deepEqual(await plan(page), antes);
    const cache = await page.evaluate(() => caches.keys());
    assert.ok(cache.some((k) => k.endsWith('-nueva')) && cache.length === 1, 'quedó solo la caché nueva: ' + cache);
  });
  await ctx.close();
  execFileSync('python3', [RAIZ + 'build.py']); // dist/ vuelve a quedar como lo arma build.py

  /* ═════════ 2. Mudanza desde Plan Maestro y copia en archivo (1280×800) ═════════ */
  {
    const { ctx: c2, page: p2 } = await contexto({ ancho: 1280, alto: 800 });
    await paso('mudanza: restaurar una copia de Plan Maestro (datos inventados)', async () => {
      await p2.goto(url);
      await p2.waitForSelector('#canvas .row');
      const copiaPM = {
        areas: [{ id: 'a1', n: 'Facultad', color: '#7c4dff' }, { id: 'a2', n: 'Trabajo', color: '#2f6fed' }],
        projects: [
          { id: 'p1', a: 'a1', n: 'Tesis de maestría', dept: 'Posgrado' },
          { id: 'p2', a: 'a2', n: 'Cliente nuevo' },
        ],
        tasks: [
          { id: 'k1', p: 'p1', n: 'Marco teórico', s: '2026-11-02', e: '2026-12-04', ty: 'tarea', st: 'doing', star: true, note: 'Leer cinco artículos', links: [{ t: 'Carpeta', u: 'https://ejemplo.org/tesis' }] },
          { id: 'k2', p: 'p1', n: 'Entrega del borrador', s: '2026-12-18', e: '2026-12-18', ty: 'hito', st: 'todo', star: false },
          { id: 'k3', p: 'p2', n: 'Propuesta', s: '2026-11-10', e: '2026-11-14', ty: 'tarea', st: 'done', star: false },
          { id: 'k4', p: 'p2', n: 'Reunión semanal', s: '2026-11-03', e: '2027-02-23', ty: 'habito', st: 'todo', star: false },
        ],
      };
      await p2.setInputFiles('#file', { name: 'plan-maestro-2026-11-17.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(copiaPM, null, 1)) });
      await p2.waitForSelector('.modal:has-text("Plan Maestro")');
      await p2.screenshot({ path: CAP + 'telar-1280-claro-mudanza.png' });
      await p2.click('.modal button:has-text("Reemplazar")');
      const p = await plan(p2);
      assert.deepEqual(p.tasks.map((t) => t.n), copiaPM.tasks.map((t) => t.n));
      assert.equal(p.projects[0].dept, 'Posgrado');
      assert.equal(p.tasks[0].links[0].u, 'https://ejemplo.org/tesis');
      assert.equal(p.ejemplo, undefined);
    });
    await paso('copia de seguridad: exportar y volver a importar da lo mismo', async () => {
      await p2.click('#menuBtn');
      const [descarga] = await Promise.all([p2.waitForEvent('download'), p2.click('#pop [data-m="json"]')]);
      const doc = JSON.parse(readFileSync(await descarga.path(), 'utf8'));
      assert.equal(doc.app, 'telar');
      assert.equal(doc.formato, 1);
      const antes = await plan(p2);
      assert.deepEqual(doc.plan, antes);
      await p2.evaluate(() => document.querySelector('#borrarEjemplo, .row') && null);
      await p2.setInputFiles('#file', { name: 'telar.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(doc)) });
      await p2.click('.modal button:has-text("Reemplazar")');
      assert.deepEqual(await plan(p2), antes);
      assert.ok(await p2.isHidden('#menuPunto'));
    });
    await paso('teclado: Alt+↓ baja la prioridad, Alt+→ corre un día y Ctrl+Z deshace', async () => {
      await p2.click('#segLevel button[data-v="tareas"]');
      await p2.click('#canvas .row.task:has-text("Marco teórico") .nm');
      const antes = await plan(p2);
      await p2.keyboard.press('Alt+ArrowDown');
      let p = await plan(p2);
      assert.deepEqual(p.tasks.slice(0, 2).map((t) => t.n), ['Entrega del borrador', 'Marco teórico']);
      await p2.keyboard.press('Alt+ArrowRight');
      p = await plan(p2);
      assert.equal(p.tasks[1].s, '2026-11-03');
      await p2.keyboard.press('Control+z');
      await p2.keyboard.press('Control+z');
      assert.deepEqual(await plan(p2), antes);
      await p2.keyboard.press('Control+Shift+z');
      assert.equal((await plan(p2)).tasks[0].n, 'Entrega del borrador');
      for (const z of ['pan', 'dia']) {
        await p2.click(`#segZoom button[data-v="${z}"]`);
        await p2.screenshot({ path: `${CAP}telar-1280-claro-escala-${z === 'pan' ? 'panorama' : 'dias'}.png` });
      }
      await p2.click('#segZoom button[data-v="mes"]');
    });
    await c2.close();
  }

  /* ═════════ 3. Capturas ═════════ */
  await paso('capturas en 1280×800 y 390×844, claro y oscuro', async () => {
    for (const tema of ['light', 'dark']) {
      const nombre = tema === 'light' ? 'claro' : 'oscuro';
      {
        const { ctx: c, page: p } = await contexto({ ancho: 1280, alto: 800, tema });
        await p.goto(url);
        await p.waitForSelector('#canvas .row');
        await p.waitForTimeout(400);
        await p.screenshot({ path: `${CAP}telar-1280-${nombre}-cronograma.png` });
        await p.click('#segLevel button[data-v="tareas"]');
        await p.click('#canvas .row.task:has-text("Fotos de los productos") .nm');
        await p.waitForSelector('#panel:not([hidden])');
        await p.screenshot({ path: `${CAP}telar-1280-${nombre}-detalle.png` });
        await p.keyboard.press('Escape');
        await p.click('#segView button[data-v="board"]');
        await p.waitForSelector('#board .card');
        await p.screenshot({ path: `${CAP}telar-1280-${nombre}-tablero.png` });
        await p.click('#segView button[data-v="gantt"]');
        await p.click('#menuBtn');
        await p.screenshot({ path: `${CAP}telar-1280-${nombre}-menu.png` });
        await c.close();
      }
      {
        const { ctx: c, page: p } = await contexto({ ancho: 390, alto: 844, tema, movil: true });
        await p.goto(url);
        await p.waitForSelector('#canvas .row');
        await p.waitForTimeout(400);
        if (tema === 'dark') await p.screenshot({ path: `${CAP}telar-390-oscuro-1-ejemplo.png` });
        await p.tap('#segLevel button[data-v="tareas"]');
        await p.tap('#canvas .row.task:has-text("Fotos de los productos") .bar');
        await p.waitForSelector('#pildora:not([hidden])');
        await p.screenshot({ path: `${CAP}telar-390-${nombre}-barra-elegida.png` });
        await p.tap('#pildora [data-pil="detalle"]');
        await p.waitForSelector('#panel:not([hidden])');
        await p.screenshot({ path: `${CAP}telar-390-${nombre}-detalle-hoja.png` });
        if (tema === 'dark') {
          await p.tap('#panel [data-act="close"]');
          await p.tap('#segView button[data-v="board"]');
          await p.waitForSelector('#board .card');
          await p.screenshot({ path: `${CAP}telar-390-oscuro-tablero.png` });
          await p.tap('#segView button[data-v="gantt"]');
          await p.tap('#borrarEjemplo');
          await p.waitForSelector('#formPrimero');
          await p.screenshot({ path: `${CAP}telar-390-oscuro-primer-proyecto.png` });
        }
        await c.close();
      }
    }
  });

  await paso('sin errores en la consola', async () => {
    assert.deepEqual(errores, []);
  });
} finally {
  await nav.close();
  srv.close();
  const mal = resultados.filter((r) => r[0] !== 'ok').length;
  console.log(`\n${resultados.length - mal} de ${resultados.length} pasos bien${mal ? ' · ' + mal + ' mal' : ''}`);
  if (mal || errores.length) {
    if (errores.length) console.log('Errores:\n  ' + errores.join('\n  '));
    process.exitCode = 1;
  }
}
