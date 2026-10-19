// integracion/e2e/humo.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.4 y §12.8). Prueba de humo de lo construido.
// Construye dist/ (npm run construir), lo sirve por HTTP local y lo abre en el Chromium del entorno (Playwright de /opt/node-tools, sin
// instalar nada) con los servicios REALES (Workers con el núcleo de producción): en 1280 × 800 y 360 × 740, claro y oscuro, abre el
// inicio, el enlace de la plantilla grande (la de portada) y el de la chica, espera la película y las cien noches, y exige:
//   · 0 errores ni avisos de consola, 0 errores de página, 0 pedidos fallidos y 0 claves de texto faltantes;
//   · la huella agregada de las cien noches del hub chico igual a la que da Node con el mismo motor (adelanto de R04, §10.7);
//   · que la página no desborde a lo ancho.
// Guarda capturas en integracion/e2e/capturas/humo-*.png. Los recorridos completos de §10.8 son e2e/correr.mjs.
// Uso (desde apps/anden/simulador):  NODE_PATH=/opt/node-tools/node_modules node integracion/e2e/humo.mjs [--sin-construir]
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { construir, DIST } from '../construir.mjs';
import { servir } from '../servir.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CAPTURAS = join(AQUI, 'capturas');
const CHROMIUM = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const requerir = createRequire(join(process.env.NODE_PATH ?? '/opt/node-tools/node_modules', 'x.js'));
const { chromium } = requerir('playwright');

const fallas = [];
const fallar = (m) => { fallas.push(m); console.error(`  ✗ ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);

/** Huella agregada de las cien noches del hub chico en Node, con el mismo ensamblado que los Workers. */
async function huellaEnNode() {
  const { ensamblar } = await import('../ensamblar.ts');
  const { huellaAgregada } = await import('../../experimentos/indice.ts');
  const E = ensamblar();
  const c = await E.compilar(E.plantillas['hub-chico@1.0.0']);
  if (!c.ok) throw new Error('hub-chico@1.0.0 no compila');
  const n = c.mv.modelo.experimento.nochesEscena, s = c.mv.modelo.experimento.semilla;
  const huellas = [];
  for (let r = 0; r < n; r++) huellas.push(E.simularNoche(c.mv, s, r, { traza: 'no' }).resultado.huella);
  return huellaAgregada(huellas);
}

async function abrir(browser, base, { ancho, alto, tema }) {
  const etiqueta = `${ancho}-${tema}`;
  console.log(`\n${etiqueta} (${ancho} × ${alto})`);
  const contexto = await browser.newContext({ viewport: { width: ancho, height: alto }, colorScheme: tema === 'oscuro' ? 'dark' : 'light' });
  const page = await contexto.newPage();
  const errores = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errores.push(`consola ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errores.push(`error de página: ${e.message}`));
  page.on('requestfailed', (r) => errores.push(`pedido fallido: ${r.url()} (${r.failure()?.errorText})`));
  const sesion = (expr) => page.evaluate(expr);
  const esperar = (cond, ms, que) => page.waitForFunction(cond, null, { timeout: ms }).catch(() => fallar(`${etiqueta}: ${que} no llegó en ${ms / 1000} s`));
  const resultado = {};
  try {
    await page.goto(`${base}?depuracion=1`);
    await page.waitForSelector('#app main', { timeout: 15_000 });
    await page.screenshot({ path: join(CAPTURAS, `humo-${etiqueta}-inicio.png`) });
    for (const plantilla of ['hub-lazo-noche@1.0.0', 'hub-chico@1.0.0']) {
      await page.goto(`${base}?depuracion=1#t=${plantilla}`);
      const t0 = Date.now();
      await esperar(() => !!window.__anden?.sesion?.noche, 30_000, `la película de ${plantilla}`);
      const tNoche = Date.now() - t0;
      await esperar(() => !!window.__anden?.sesion?.nochesListas && !!window.__anden?.sesion?.comprobante, 120_000, `las cien noches de ${plantilla}`);
      const tNoches = Date.now() - t0;
      const info = await sesion(() => {
        const a = window.__anden;
        return { trabajadores: a.servicios.trabajadores, semaforo: a.sesion.semaforo?.motivo, huella: a.sesion.comprobante?.huellaAgregada,
          noches: a.sesion.nochesLlegadas.length, faltantes: a.faltantes(), ancho: document.documentElement.scrollWidth, vista: innerWidth };
      });
      resultado[plantilla] = info.huella;
      ok(`${plantilla}: película en ${tNoche} ms, ${info.noches} noches en ${(tNoches / 1000).toFixed(1)} s con ${info.trabajadores} Workers, semáforo ${info.semaforo}, huella agregada ${info.huella}`);
      if (info.faltantes.length) fallar(`${etiqueta}: claves de texto faltantes: ${info.faltantes.join(', ')}`);
      if (info.ancho > info.vista + 1) fallar(`${etiqueta}: la página desborda a lo ancho (${info.ancho} px en una ventana de ${info.vista})`);
      await page.waitForTimeout(400);
      await page.screenshot({ path: join(CAPTURAS, `humo-${etiqueta}-${plantilla.split('@')[0]}.png`) });
    }
    // El enlace en el navegador: CompressionStream('deflate-raw') de ida y vuelta (modelo/NOTAS-CONTRATO.md §11: solo se había probado en Node)
    const enlace = await sesion(async () => {
      const S = window.__anden.servicios, m = S.plantillas['hub-chico@1.0.0'];
      const c0 = await S.compilar(m);
      const fm = await S.codec.codificar({ tipo: 'modelo', modelo: m });
      const dm = await S.codec.decodificar(fm);
      const cm = dm.ok ? await S.compilar(dm.enlace.modelo) : null;
      const parche = [['/personas/induccion/puestosActivos', 4], ['/personas/induccion/reten', 1], ['/personas/rampa/cantidad', 7],
        ['/personas/rampa/asignacion', 'contiguas'], ['/demanda/camiones/paquetes', 900]].map(([path, value]) => ({ op: 'replace', path, value }));
      const fp = await S.codec.codificar({ tipo: 'plantilla', plantilla: { id: 'hub-chico', version: '1.0.0' }, parche });
      const dp = await S.codec.decodificar(fp);
      return { largoModelo: fm.length, largoParche: fp.length, mismaHuella: !!cm?.ok && cm.mv.huella === c0.mv.huella,
        parcheIgual: dp.ok && JSON.stringify(dp.enlace.parche) === JSON.stringify(parche) };
    });
    if (!enlace.mismaHuella || !enlace.parcheIgual) fallar(`${etiqueta}: el enlace no vuelve igual en el navegador: ${JSON.stringify(enlace)}`);
    else if (enlace.largoModelo > 8000 || enlace.largoParche > 400) fallar(`${etiqueta}: enlaces demasiado largos: ${JSON.stringify(enlace)}`);
    else ok(`enlace en el navegador: modelo completo ${enlace.largoModelo} caracteres (≤ 8.000), plantilla + 5 cambios ${enlace.largoParche} (≤ 400), ida y vuelta exacta`);
  } catch (e) {
    fallar(`${etiqueta}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (errores.length) for (const e of errores) fallar(`${etiqueta}: ${e}`);
  else ok('0 errores ni avisos de consola, 0 pedidos fallidos');
  await contexto.close();
  return resultado;
}

async function principal() {
  mkdirSync(CAPTURAS, { recursive: true });
  if (!process.argv.includes('--sin-construir')) {
    const r = await construir();
    console.log(`construido con ${r.plan}: ${r.archivos.length} archivos en dist/`);
  }
  const s = await servir({ raiz: DIST });
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  try {
    const node = huellaEnNode();
    const combos = [
      { ancho: 1280, alto: 800, tema: 'claro' }, { ancho: 1280, alto: 800, tema: 'oscuro' },
      { ancho: 360, alto: 740, tema: 'claro' }, { ancho: 360, alto: 740, tema: 'oscuro' },
    ];
    const huellas = [];
    for (const c of combos) huellas.push(await abrir(browser, s.url, c));
    const enNode = await node;
    for (const h of huellas) {
      if (h['hub-chico@1.0.0'] === undefined) continue;
      if (h['hub-chico@1.0.0'] !== enNode) fallar(`la huella agregada del hub chico en Chromium (${h['hub-chico@1.0.0']}) no es la de Node (${enNode})`);
    }
    if (!fallas.length) ok(`\nhuella agregada de las 100 noches del hub chico: Chromium = Node = ${enNode}`);
  } finally {
    await browser.close();
    await s.cerrar();
  }
  console.log(fallas.length ? `\n${fallas.length} fallas` : '\nhumo: todo en orden');
  process.exitCode = fallas.length ? 1 : 0;
}

principal().catch((e) => { console.error(e); process.exitCode = 1; });
