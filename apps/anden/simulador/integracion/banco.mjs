// integracion/banco.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.9 y §11). El banco de presupuestos.
// Mide cada presupuesto de §11 con la MEDIANA de 5 corridas (`--corridas=N` para otra cantidad) en el contenedor del entorno, con la CPU
// sin frenar y, para los cuadros, frenada 4× por CDP. Cada presupuesto sale con su estado: «cumple» (mediana ≤ meta), «cumple con
// margen» (≤ meta + 30%: §11 admite ±30% entre corridas del contenedor) o «no cumple». Los que dependen de la máquina también se
// reportan como cociente contra una referencia medida en la misma corrida: los eventos por segundo de una M/M/1 sintética con el núcleo
// (integracion/bateria/mm1.ts), en Node y en el hilo principal de Chromium («equivale a X millones de eventos de la referencia»).
//
// Qué mide y cómo (la app es la construida en dist/, con los servicios reales y sus Workers; Chromium 141 del entorno con Playwright):
//   Node     · noche del hub de 24.000 con traza completa · noche del hub chico con traza (ensamblar.ts, el núcleo de producción)
//   Chromium · primer cuadro desde el enlace sin red: del comienzo de la navegación al cuadro en que la película está lista (rAF), con el
//              enlace de portada (hub de 24.000); también el chico y la primera pintura (FCP), informativos
//            · primer cuadro con red 4G emulada (perfil «Fast 4G» de DevTools: 165 ms de latencia, 8,1 Mbit/s de bajada, 1,35 de subida),
//              con los archivos comprimidos como los serviría el alojamiento; «Slow 4G» (562,5 ms; 1,44 Mbit/s), informativo
//            · cien noches del hub de 24.000 sin traza con los Workers de la app (núcleos − 1 = 3 en el contenedor), con progreso visible
//            · vista previa del deslizador: «¿y si…?» con un puesto más, hasta que llega la noche B completa
//            · cuadro 2,5D y 2D del hub de 24.000 (1280 × 800, dpr 1, 120 instantes de la noche): el tiempo de `dibujar` y, aparte, con
//              el rasterizado forzado (getImageData de un píxel), sin frenar y con CPU 4×
//            · tamizado del hub chico (cancelable) y evaluación de su decisión, con los Workers de la app
//            · memoria de la pestaña con la noche de 24.000 y su par de la pantalla dividida (measureUserAgentSpecificMemory, que
//              incluye los Workers y los ArrayBuffer; la página se sirve aislada con COOP y COEP)
//   Archivos · JavaScript de la primera carga sin vendor, brotli calidad 11: los .js que pidió la página al abrir el enlace
//
// El freno de CPU de CDP frena el JavaScript, no la rasterización: no es un teléfono (§11). Escribe integracion/salida/banco.json.
// Uso (desde apps/anden/simulador):  npm run banco  ·  node integracion/banco.mjs [--corridas=5] [--sin-construir] [--solo=node,app,chico]
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { cpus, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { brotliCompressSync, constants as zlib } from 'node:zlib';
import { construir, DIST } from './construir.mjs';
import { servir } from './servir.mjs';
import { CHROMIUM, construirPagina, mediana, playwright } from './navegador.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
export const SALIDA_BANCO = join(AQUI, 'salida', 'banco.json');
const GRANDE = 'hub-lazo-noche@1.0.0', CHICO = 'hub-chico@1.0.0';
const MARGEN = 0.3;
/** Perfiles de red de DevTools (Chromium 141): «Fast 4G» es el que DevTools llama 4G; «Slow 4G», el de Lighthouse en teléfono. */
export const RED_4G = { nombre: 'Fast 4G (DevTools)', offline: false, latency: 165, downloadThroughput: (9 * 1e6 * 0.9) / 8, uploadThroughput: (1.5 * 1e6 * 0.9) / 8 };
export const RED_4G_LENTA = { nombre: 'Slow 4G (DevTools)', offline: false, latency: 562.5, downloadThroughput: (1.6 * 1e6 * 0.9) / 8, uploadThroughput: (750 * 1e3 * 0.9) / 8 };

/** Los presupuestos de §11 (meta y unidad). */
export const PRESUPUESTOS = {
  nocheGrandeNode: { nombre: 'Noche del hub de 24.000 con traza completa, Node', meta: 400, unidad: 'ms', entorno: 'node' },
  nocheChicoNode: { nombre: 'Noche del hub chico con traza, Node', meta: 150, unidad: 'ms', entorno: 'node' },
  cienNoches: { nombre: 'Cien noches del hub de 24.000 sin traza, Workers en Chromium, con progreso visible', meta: 20_000, unidad: 'ms', entorno: 'chromium' },
  vistaPrevia: { nombre: 'Vista previa del deslizador (una noche completa del hub de 24.000)', meta: 600, unidad: 'ms', entorno: 'chromium' },
  primerCuadro: { nombre: 'Primer cuadro desde el enlace, sin red (enlace de portada: hub de 24.000)', meta: 150, unidad: 'ms', entorno: 'chromium' },
  primerCuadro4g: { nombre: 'Primer cuadro con red 4G emulada (Fast 4G de DevTools)', meta: 1500, unidad: 'ms', entorno: 'chromium' },
  cuadroIso: { nombre: 'Cuadro 2,5D del hub de 24.000, sin frenar', meta: 4, unidad: 'ms', entorno: 'chromium' },
  cuadroIso4x: { nombre: 'Cuadro 2,5D del hub de 24.000, CPU frenada 4×', meta: 16.7, unidad: 'ms', entorno: 'chromium' },
  cuadro2d: { nombre: 'Cuadro 2D del hub de 24.000, sin frenar', meta: 3, unidad: 'ms', entorno: 'chromium' },
  cuadro2d4x: { nombre: 'Cuadro 2D del hub de 24.000, CPU frenada 4×', meta: 10, unidad: 'ms', entorno: 'chromium' },
  tamizado: { nombre: 'Tamizado del hub chico con los Workers de la app, cancelable', meta: 60_000, unidad: 'ms', entorno: 'chromium' },
  decision: { nombre: 'Evaluación de la decisión del hub chico', meta: 20_000, unidad: 'ms', entorno: 'chromium' },
  memoria: { nombre: 'Memoria de la pestaña con la noche de 24.000 y su par de la pantalla dividida', meta: 150, unidad: 'MB', entorno: 'chromium' },
  primeraCarga: { nombre: 'JavaScript de la primera carga (sin vendor), brotli', meta: 150, unidad: 'KB', entorno: 'archivos' },
};

const ahora = () => Number(process.hrtime.bigint()) / 1e6;

/** Estado de un presupuesto con la mediana: cumple, cumple con margen (±30% de §11) o no cumple. */
export function estadoDe(mediana, meta) {
  if (!Number.isFinite(mediana)) return 'sin-medir';
  if (mediana <= meta) return 'cumple';
  if (mediana <= meta * (1 + MARGEN)) return 'cumple-con-margen';
  return 'no-cumple';
}

// ------------------------------------------------------------------------------------------------ Node

async function medirNode(corridas, log) {
  const { ensamblar, crearMotorProduccion } = await import('./ensamblar.ts');
  const { correrMM1 } = await import('./bateria/mm1.ts');
  const E = ensamblar();
  // Referencia: M/M/1 con ρ = 0,8 y 10⁶ unidades de tiempo (~1,6 millones de eventos), con el núcleo
  const ref = [];
  correrMM1(crearMotorProduccion, { id: 'banco', lambda: 0.8, mu: 1, horizonte: 100_000 }, 20261017, 99); // calentar
  for (let i = 0; i < corridas; i++) {
    const t0 = ahora();
    const r = correrMM1(crearMotorProduccion, { id: 'banco', lambda: 0.8, mu: 1, horizonte: 1_000_000 }, 20261017, i);
    ref.push(r.eventos / ((ahora() - t0) / 1000));
  }
  const eps = mediana(ref);
  log(`  referencia M/M/1 en Node: ${(eps / 1e6).toFixed(2)} M eventos/s (${ref.map((x) => (x / 1e6).toFixed(2)).join(' · ')})`);
  const noche = async (plantilla) => {
    const c = await E.compilar(E.plantillas[plantilla]);
    if (!c.ok) throw new Error(`banco: ${plantilla} no compila`);
    for (let i = 0; i < 2; i++) E.simularNoche(c.mv, c.mv.modelo.experimento.semilla, 90 + i, { traza: 'completa' }); // calentar
    const ms = [], eventos = [], tramos = [];
    for (let i = 0; i < corridas; i++) {
      const t0 = ahora();
      const s = E.simularNoche(c.mv, c.mv.modelo.experimento.semilla, i, { traza: 'completa' });
      ms.push(ahora() - t0); eventos.push(s.resultado.eventos); tramos.push(s.traza?.tramos.n ?? 0);
    }
    return { ms, eventos: mediana(eventos), tramos: mediana(tramos) };
  };
  const grande = await noche(GRANDE), chico = await noche(CHICO);
  log(`  noche de 24.000 con traza: ${grande.ms.map((x) => x.toFixed(0)).join(' · ')} ms · chica: ${chico.ms.map((x) => x.toFixed(0)).join(' · ')} ms`);
  return { eps, ref, grande, chico, version: process.version };
}

// ------------------------------------------------------------------------------------------------ Chromium

async function medirReferenciaChromium(browser, corridas, log) {
  const dir = mkdtempSync(join(tmpdir(), 'anden-banco-'));
  try {
    await construirPagina({ entrada: join(AQUI, 'banco', 'pagina.ts'), destino: dir, titulo: 'Andén · banco' });
    const s = await servir({ raiz: dir });
    try {
      const page = await browser.newPage();
      await page.goto(s.url);
      await page.waitForFunction(() => document.body.dataset.listo === '1');
      await page.evaluate(() => window.__referencia(100_000, 99));
      const eps = [];
      let huella = '';
      for (let i = 0; i < corridas; i++) {
        const r = await page.evaluate((i) => window.__referencia(1_000_000, i), i);
        eps.push(r.eventos / (r.ms / 1000)); huella ||= r.huella;
      }
      await page.close();
      log(`  referencia M/M/1 en Chromium: ${(mediana(eps) / 1e6).toFixed(2)} M eventos/s (${eps.map((x) => (x / 1e6).toFixed(2)).join(' · ')})`);
      return { eps: mediana(eps), corridas: eps };
    } finally { await s.cerrar(); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

/** Registra en la página, antes de que arranque la app, cada cambio del texto de progreso de las cien noches. */
function scriptProgreso() {
  window.__progreso = [];
  const mirar = () => {
    const e = document.querySelector('[data-resumen="calculando"]');
    if (!e) return;
    const u = window.__progreso, t = e.textContent;
    if (!u.length || u[u.length - 1][1] !== t) u.push([performance.now(), t]);
  };
  new MutationObserver(mirar).observe(document, { subtree: true, childList: true, characterData: true });
}

/**
 * Registra, antes de que arranque la app, el primer instante en que un lienzo muestra el plano vacío del hub (`data-plano="1"`, que la
 * interfaz pone mientras simula la noche: app/ui/lienzo.ts). Es un hito informativo (app/NOTAS-CONTRATO.md §13.2 b): el presupuesto de
 * §11 sigue midiendo la película. Si la película llega antes que el plano (el hub chico), queda en null.
 */
function scriptPlano() {
  window.__planoVisible = null;
  const obs = new MutationObserver(() => {
    if (window.__planoVisible === null && document.querySelector('[data-plano="1"]')) { window.__planoVisible = performance.now(); obs.disconnect(); }
  });
  obs.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-plano'] });
}

/** Abre el enlace de una plantilla y espera la película (rAF): devuelve ms desde el comienzo de la navegación y la primera pintura. */
async function abrirEnlace(page, base, plantilla, timeout = 60_000) {
  const respuestas = [];
  const alResponder = (r) => { if (r.url().endsWith('.js')) respuestas.push({ url: r.url(), codificacion: r.headers()['content-encoding'] ?? '' }); };
  page.on('response', alResponder);
  await page.addInitScript(scriptPlano);
  await page.goto(`${base}?depuracion=1#t=${plantilla}`, { waitUntil: 'commit' });
  // hitos: el modelo compilado y abierto en la sesión, y la película lista (la noche simulada en un Worker, con su traza)
  const hm = await page.waitForFunction(() => (window.__anden?.sesion?.mv ? performance.now() : false), null, { polling: 'raf', timeout });
  const modelo = await hm.jsonValue();
  const h = await page.waitForFunction(() => (window.__anden?.sesion?.noche ? performance.now() : false), null, { polling: 'raf', timeout });
  const pelicula = await h.jsonValue();
  const otros = await page.evaluate(() => {
    const fin = (n) => performance.getEntriesByType('resource').find((e) => e.name.endsWith(n))?.responseEnd ?? null;
    const nav = performance.getEntriesByType('navigation')[0];
    return { fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null, dcl: nav?.domContentLoadedEventEnd ?? null,
      entrada: fin('/entrada.js'), worker: fin('/worker.js'), plano: window.__planoVisible ?? null };
  });
  page.off('response', alResponder);
  return { pelicula, fcp: otros.fcp, hitos: { dcl: otros.dcl, entradaJs: otros.entrada, workerJs: otros.worker, modelo, plano: otros.plano, pelicula }, respuestas };
}

/** Cuadros de una vista sobre la noche que se ve: mediana por cuadro de `dibujar` y, aparte, con el rasterizado forzado. */
async function medirCuadros(page, piso) {
  return page.evaluate(async (piso) => {
    const a = window.__anden, rep = a.sesion.noche.reproductor;
    const lienzo = document.createElement('canvas');
    lienzo.width = 1280; lienzo.height = 800;
    const vista = a.servicios.crearVista(lienzo, rep, a.servicios.estilos.claro, piso);
    vista.redimensionar(1280, 800, 1);
    const c2d = lienzo.getContext('2d');
    const N = 120, desde = rep.inicio + 30 * 60_000, paso = (3 * 3_600_000) / N;
    for (let i = 0; i < 20; i++) vista.dibujar(desde + i * paso); // calentar (JIT y sprites)
    const solo = [], conRaster = [];
    for (let i = 0; i < N; i++) {
      const t = desde + i * paso;
      let t0 = performance.now(); vista.dibujar(t); solo.push(performance.now() - t0);
      t0 = performance.now(); vista.dibujar(t); c2d.getImageData(0, 0, 1, 1); conRaster.push(performance.now() - t0);
    }
    vista.destruir();
    const med = (x) => { const o = [...x].sort((p, q) => p - q); return o[Math.floor(o.length / 2)]; };
    const p90 = (x) => { const o = [...x].sort((p, q) => p - q); return o[Math.min(o.length - 1, Math.floor(0.9 * o.length))]; };
    return { mediana: med(solo), p90: p90(solo), medianaConRaster: med(conRaster), p90ConRaster: p90(conRaster), visibles: rep.maxVisibles };
  }, piso);
}

/** El recorrido de la plantilla grande: película, cien noches, cuadros (sin frenar y 4×), vista previa y memoria. */
async function corridaGrande(browser, base, i, log) {
  const contexto = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await contexto.addInitScript(scriptProgreso);
  const page = await contexto.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  const cdp = await contexto.newCDPSession(page);
  try {
    const abierto = await abrirEnlace(page, base, GRANDE);
    const hn = await page.waitForFunction(() => (window.__anden?.sesion?.nochesListas ? performance.now() : false), null, { polling: 100, timeout: 180_000 });
    const nochesListas = await hn.jsonValue();
    const info = await page.evaluate(() => {
      const p = window.__progreso, s = window.__anden.sesion;
      return { trabajadores: window.__anden.servicios.trabajadores, noches: s.nochesLlegadas.length, progreso: p.length, primerProgreso: p[0]?.[0] ?? null,
        textos: p.slice(0, 3).map((x) => x[1]) };
    });
    const iso = await medirCuadros(page, 'iso'), plano = await medirCuadros(page, '2d');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const iso4 = await medirCuadros(page, 'iso'), plano4 = await medirCuadros(page, '2d');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    // vista previa del deslizador: un puesto más, hasta que llega la noche B con traza completa
    const previa = await page.evaluate(() => new Promise((resolver, rechazar) => {
      const s = window.__anden.sesion, antes = s.ultimoError, t0 = performance.now();
      const fuera = s.suscribir(() => {
        if (s.ysi.nocheB) { fuera(); resolver(performance.now() - t0); }
        else if (s.ultimoError !== antes) { fuera(); rechazar(new Error(JSON.stringify(s.ultimoError))); }
      });
      void s.previsualizar({ puestos: 5, personasRampa: null, reten: null, plan: null, balanceado: false });
    }));
    // memoria: la pantalla dividida con la noche A y la B (escritorio: sincronizada)
    await page.evaluate(() => window.__anden.ctx.ir('ysi'));
    await page.waitForTimeout(1500);
    const memoria = await page.evaluate(async () => {
      const aislada = self.crossOriginIsolated === true;
      const m = aislada && performance.measureUserAgentSpecificMemory ? await performance.measureUserAgentSpecificMemory() : null;
      return { aislada, bytes: m?.bytes ?? null, partes: m ? m.breakdown.filter((b) => b.bytes > 0).map((b) => ({ bytes: b.bytes, tipos: b.types, de: b.attribution.map((x) => x.scope ?? x.url).join(', ') })) : [] };
    });
    await cdp.send('Performance.enable').catch(() => {});
    const { metrics } = await cdp.send('Performance.getMetrics').catch(() => ({ metrics: [] }));
    const heap = metrics.find((x) => x.name === 'JSHeapUsedSize')?.value ?? null;
    const r = { pelicula: abierto.pelicula, fcp: abierto.fcp, hitos: abierto.hitos, nochesListas, ...info, iso, plano, iso4, plano4, previa, memoria, heapPrincipal: heap,
      js: abierto.respuestas, errores };
    log(`  corrida ${i + 1}: película ${abierto.pelicula.toFixed(0)} ms (FCP ${abierto.fcp?.toFixed(0)}) · cien noches ${(nochesListas / 1000).toFixed(1)} s con ` +
      `${info.trabajadores} Workers (${info.progreso} avances) · 2,5D ${iso.mediana.toFixed(2)}/${iso4.mediana.toFixed(2)} ms · 2D ${plano.mediana.toFixed(2)}/${plano4.mediana.toFixed(2)} ms · ` +
      `hitos ${JSON.stringify(Object.fromEntries(Object.entries(abierto.hitos).map(([k, v]) => [k, v === null ? null : Math.round(v)])))} · vista previa ${previa.toFixed(0)} ms · memoria ${memoria.bytes ? (memoria.bytes / 1048576).toFixed(1) : '—'} MB · ${errores.length} errores`);
    return r;
  } finally { await contexto.close(); }
}

/** Primer cuadro con red emulada (o sin red, si `red` es null), en un contexto nuevo (sin caché). */
export async function corridaPrimerCuadro(browser, base, plantilla, red) {
  const contexto = await browser.newContext({ viewport: { width: 360, height: 740 } });
  const page = await contexto.newPage();
  try {
    if (red) {
      const cdp = await contexto.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: red.latency, downloadThroughput: red.downloadThroughput, uploadThroughput: red.uploadThroughput });
    }
    const r = await abrirEnlace(page, base, plantilla, 120_000);
    return { pelicula: r.pelicula, fcp: r.fcp, hitos: r.hitos, codificaciones: [...new Set(r.respuestas.map((x) => x.codificacion || 'ninguna'))] };
  } finally { await contexto.close(); }
}

/** Decisión y tamizado del hub chico con los servicios de la app (sus Workers). */
async function corridaChico(browser, base, i, log, conCancelacion) {
  const contexto = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await contexto.newPage();
  try {
    await page.goto(`${base}?depuracion=1`);
    await page.waitForFunction(() => !!window.__anden?.servicios);
    const r = await page.evaluate(async ({ chico, conCancelacion }) => {
      const S = window.__anden.servicios;
      const c = await S.compilar(S.plantillas[chico]);
      if (!c.ok) throw new Error('el hub chico no compila');
      let t0 = performance.now();
      const ev = await S.evaluarDecision(c.mv);
      const decision = performance.now() - t0;
      t0 = performance.now();
      let pasos = 0;
      const ranking = await S.tamizar(c.mv, () => { pasos++; });
      const tamizado = performance.now() - t0;
      let cancelacion = null;
      if (conCancelacion) {
        // cancelable: se pide el tamizado y a los 2 s se cancela (prioridad TAMIZADO = 4); se mide cuánto tarda en soltar
        const p = S.tamizar(c.mv).then(() => 'terminó', (e) => (e && e.name) || 'rechazado');
        await new Promise((r) => setTimeout(r, 2000));
        const t1 = performance.now();
        S.cancelarDesde(4);
        const como = await p;
        cancelacion = { ms: performance.now() - t1, como };
      }
      return { decision, tamizado, pasos, recomendacion: ev.recomendacion, replicasUsadas: ev.replicasUsadas ?? null, supuestos: ranking.length, cancelacion };
    }, { chico: CHICO, conCancelacion });
    log(`  corrida ${i + 1}: decisión ${(r.decision / 1000).toFixed(1)} s (recomienda ${r.recomendacion}) · tamizado ${(r.tamizado / 1000).toFixed(1)} s (${r.supuestos} supuestos, ` +
      `${r.pasos} avances)${r.cancelacion ? ` · cancelado en ${r.cancelacion.ms.toFixed(0)} ms (${r.cancelacion.como})` : ''}`);
    return r;
  } finally { await contexto.close(); }
}

// ------------------------------------------------------------------------------------------------ armado

function presupuesto(id, valores, eps, extra = {}) {
  const p = PRESUPUESTOS[id];
  const med = mediana(valores.filter((x) => Number.isFinite(x)));
  const out = { id, ...p, corridas: valores.map((x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null)), mediana: Math.round(med * 1000) / 1000,
    estado: estadoDe(med, p.meta), ...extra };
  // cociente contra la referencia de la misma corrida: cuántos eventos de la M/M/1 se procesan en ese tiempo (independiente de la máquina)
  if (eps && p.unidad === 'ms') { out.enEventosReferencia = Math.round((med / 1000) * eps); out.referenciaEventosPorSegundo = Math.round(eps); }
  return out;
}

export async function correrBanco({ corridas = 5, construirAntes = true, solo = null, log = (s) => console.log(s) } = {}) {
  const t0 = ahora();
  const quiere = (x) => !solo || solo.includes(x);
  const res = { version: 1, corridas, maquina: { nucleos: cpus().length, cpu: cpus()[0]?.model ?? '?', node: process.version }, presupuestos: [], detalle: {} };
  let refNode = null;
  if (quiere('node')) {
    log('Node');
    const n = await medirNode(corridas, log);
    refNode = n.eps;
    res.detalle.node = { referenciaEventosPorSegundo: n.ref, grande: n.grande, chico: n.chico };
    res.presupuestos.push(presupuesto('nocheGrandeNode', n.grande.ms, n.eps, { eventos: n.grande.eventos, tramos: n.grande.tramos }));
    res.presupuestos.push(presupuesto('nocheChicoNode', n.chico.ms, n.eps, { eventos: n.chico.eventos, tramos: n.chico.tramos }));
  }
  if (quiere('app') || quiere('chico')) {
    if (construirAntes) { const c = await construir(); log(`dist/ construido con ${c.plan} (motor del comprobante: ${c.motor ? `${c.motor.pasaron} de ${c.motor.pruebasExigibles}` : 'sin verificar'})`); }
    const pw = playwright();
    const browser = await pw.chromium.launch({ executablePath: CHROMIUM, args: ['--enable-blink-features=ForceEagerMeasureMemory'] });
    res.maquina.chromium = browser.version();
    // la app servida con compresión y aislada entre orígenes (para poder medir la memoria)
    const s = await servir({ raiz: DIST, brotli: true, aislado: true });
    try {
      log(`Chromium ${browser.version()}`);
      const ref = await medirReferenciaChromium(browser, corridas, log);
      res.detalle.referenciaChromium = ref;
      const eps = ref.eps;
      if (quiere('app')) {
        log('Plantilla grande (enlace de portada)');
        await corridaPrimerCuadro(browser, s.url, GRANDE, null); // calentamiento sin medir (disco, servidor, procesos de Chromium)
        const g = [];
        for (let i = 0; i < corridas; i++) g.push(await corridaGrande(browser, s.url, i, log));
        res.detalle.grande = g.map(({ js, ...x }) => x);
        // mediana de cada hito entre las corridas que lo tienen (el plano falta si la película llegó antes); null si ninguna lo tiene
        const hitos = (xs) => Object.fromEntries(Object.keys(xs[0]?.hitos ?? {}).map((k) => {
          const v = xs.map((x) => x.hitos[k]).filter((y) => Number.isFinite(y));
          return [k, v.length ? Math.round(mediana(v)) : null];
        }));
        res.presupuestos.push(presupuesto('primerCuadro', g.map((x) => x.pelicula), eps, { fcpMediana: mediana(g.map((x) => x.fcp)), hitosMediana: hitos(g),
          nota: 'del comienzo de la navegación al cuadro en que la película de la noche está lista; incluye cargar la app, compilar el modelo, simular la noche entera en un Worker y transferir su traza' }));
        res.presupuestos.push(presupuesto('cienNoches', g.map((x) => x.nochesListas), eps, { trabajadores: g[0]?.trabajadores,
          avancesDeProgresoMediana: mediana(g.map((x) => x.progreso)), primerAvanceMsMediana: mediana(g.map((x) => x.primerProgreso ?? NaN)),
          progresoVisible: g.every((x) => x.progreso >= 10), nota: 'desde el comienzo de la navegación (la película compite por los Workers al principio)' }));
        res.presupuestos.push(presupuesto('vistaPrevia', g.map((x) => x.previa), eps));
        res.presupuestos.push(presupuesto('cuadroIso', g.map((x) => x.iso.mediana), eps, { conRasterizadoMediana: mediana(g.map((x) => x.iso.medianaConRaster)), p90Mediana: mediana(g.map((x) => x.iso.p90)) }));
        res.presupuestos.push(presupuesto('cuadroIso4x', g.map((x) => x.iso4.mediana), eps, { conRasterizadoMediana: mediana(g.map((x) => x.iso4.medianaConRaster)), p90Mediana: mediana(g.map((x) => x.iso4.p90)) }));
        res.presupuestos.push(presupuesto('cuadro2d', g.map((x) => x.plano.mediana), eps, { conRasterizadoMediana: mediana(g.map((x) => x.plano.medianaConRaster)), p90Mediana: mediana(g.map((x) => x.plano.p90)) }));
        res.presupuestos.push(presupuesto('cuadro2d4x', g.map((x) => x.plano4.mediana), eps, { conRasterizadoMediana: mediana(g.map((x) => x.plano4.medianaConRaster)), p90Mediana: mediana(g.map((x) => x.plano4.p90)) }));
        res.presupuestos.push(presupuesto('memoria', g.map((x) => (x.memoria.bytes ?? NaN) / 1048576), null, { aislada: g.every((x) => x.memoria.aislada),
          heapPrincipalMBMediana: mediana(g.map((x) => (x.heapPrincipal ?? NaN) / 1048576)), partes: g[0]?.memoria.partes ?? [],
          nota: 'measureUserAgentSpecificMemory: la página y sus Workers, con los ArrayBuffer de las trazas' }));
        // JavaScript de la primera carga: los .js que pidió la página al abrir el enlace, comprimidos con brotli 11 (sin vendor)
        const pedidos = [...new Set(g[0]?.js.map((x) => new URL(x.url).pathname.slice(1)) ?? [])].filter((p) => !p.startsWith('vendor/'));
        const archivos = pedidos.map((p) => {
          const b = readFileSync(join(DIST, p));
          return { archivo: p, bytes: b.length, brotli: brotliCompressSync(b, { params: { [zlib.BROTLI_PARAM_QUALITY]: 11 } }).length };
        });
        const kb = archivos.reduce((x, a) => x + a.brotli, 0) / 1024;
        res.presupuestos.push({ ...presupuesto('primeraCarga', [kb], null), archivos, codificacionServida: [...new Set(g[0]?.js.map((x) => x.codificacion || 'ninguna'))] });
        res.detalle.erroresDeConsola = g.flatMap((x) => x.errores);

        log('Primer cuadro sin red (chico) y con red 4G emulada (grande)');
        const chicoSinRed = [], f4g = [], s4g = [];
        for (let i = 0; i < corridas; i++) chicoSinRed.push(await corridaPrimerCuadro(browser, s.url, CHICO, null));
        for (let i = 0; i < corridas; i++) f4g.push(await corridaPrimerCuadro(browser, s.url, GRANDE, RED_4G));
        for (let i = 0; i < Math.min(3, corridas); i++) s4g.push(await corridaPrimerCuadro(browser, s.url, GRANDE, RED_4G_LENTA));
        log(`  chico sin red: ${chicoSinRed.map((x) => x.pelicula.toFixed(0)).join(' · ')} ms · grande con ${RED_4G.nombre}: ${f4g.map((x) => x.pelicula.toFixed(0)).join(' · ')} ms ` +
          `(${f4g[0]?.codificaciones.join(', ')}) · con ${RED_4G_LENTA.nombre}: ${s4g.map((x) => x.pelicula.toFixed(0)).join(' · ')} ms`);
        res.presupuestos.push(presupuesto('primerCuadro4g', f4g.map((x) => x.pelicula), eps, { red: RED_4G, fcpMediana: mediana(f4g.map((x) => x.fcp)), hitosMediana: hitos(f4g),
          codificacion: f4g[0]?.codificaciones, lenta: { red: RED_4G_LENTA, corridas: s4g.map((x) => Math.round(x.pelicula)), mediana: mediana(s4g.map((x) => x.pelicula)),
            fcpMediana: mediana(s4g.map((x) => x.fcp)) } }));
        res.detalle.primerCuadroChicoSinRed = { corridas: chicoSinRed.map((x) => Math.round(x.pelicula)), mediana: mediana(chicoSinRed.map((x) => x.pelicula)), hitosMediana: hitos(chicoSinRed),
          fcpMediana: mediana(chicoSinRed.map((x) => x.fcp)), meta: PRESUPUESTOS.primerCuadro.meta, estado: estadoDe(mediana(chicoSinRed.map((x) => x.pelicula)), PRESUPUESTOS.primerCuadro.meta) };
      }
      if (quiere('chico')) {
        log('Hub chico: decisión y tamizado');
        const c = [];
        for (let i = 0; i < corridas; i++) c.push(await corridaChico(browser, s.url, i, log, i === 0));
        res.detalle.chico = c;
        res.presupuestos.push(presupuesto('decision', c.map((x) => x.decision), eps, { recomendacion: c[0]?.recomendacion }));
        res.presupuestos.push(presupuesto('tamizado', c.map((x) => x.tamizado), eps, { supuestos: c[0]?.supuestos, cancelacion: c[0]?.cancelacion }));
      }
    } finally { await s.cerrar(); await browser.close(); }
  }
  // el orden de §11
  const orden = Object.keys(PRESUPUESTOS);
  res.presupuestos.sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id));
  res.resumen = {
    cumplen: res.presupuestos.filter((p) => p.estado === 'cumple').length,
    conMargen: res.presupuestos.filter((p) => p.estado === 'cumple-con-margen').length,
    noCumplen: res.presupuestos.filter((p) => p.estado === 'no-cumple').map((p) => p.id),
    sinMedir: res.presupuestos.filter((p) => p.estado === 'sin-medir').map((p) => p.id),
    referenciaNodeMEps: refNode ? Math.round(refNode / 1e4) / 100 : null,
    referenciaChromiumMEps: res.detalle.referenciaChromium ? Math.round(res.detalle.referenciaChromium.eps / 1e4) / 100 : null,
  };
  res.segundos = (ahora() - t0) / 1000;
  return res;
}

const esPrincipal = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (esPrincipal) {
  const args = process.argv.slice(2);
  const corridas = Number(args.find((a) => a.startsWith('--corridas='))?.slice(11) ?? 5);
  const solo = args.find((a) => a.startsWith('--solo='))?.slice(7).split(',') ?? null;
  correrBanco({ corridas, construirAntes: !args.includes('--sin-construir'), solo }).then((r) => {
    mkdirSync(dirname(SALIDA_BANCO), { recursive: true });
    writeFileSync(SALIDA_BANCO, `${JSON.stringify(r, null, 2)}\n`);
    console.log('\nPresupuestos (§11), mediana de', r.corridas, 'corridas:');
    for (const p of r.presupuestos) {
      console.log(`  ${p.estado.padEnd(18)} ${p.nombre}: ${p.mediana} ${p.unidad} (meta ${p.meta})${p.enEventosReferencia !== undefined ? ` · ≈ ${p.enEventosReferencia.toLocaleString('es-AR')} eventos de la M/M/1 de referencia` : ''}`);
    }
    console.log(`${r.resumen.cumplen} cumplen, ${r.resumen.conMargen} con margen, ${r.resumen.noCumplen.length} no cumplen; ${r.segundos.toFixed(0)} s · integracion/salida/banco.json`);
    process.exitCode = r.resumen.noCumplen.length ? 1 : 0;
  }, (e) => { console.error(e instanceof Error ? e.stack : String(e)); process.exitCode = 2; });
}
