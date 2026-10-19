// integracion/r04.mjs · Andén simulador, corte 1 · Integración (corte-1.md §8 R04 y §10.7).
// R04: la misma huella en Node y en el navegador. Empaqueta integracion/r04/pagina.ts (que corre integracion/r04/huellas.ts: la suite
// rápida de la batería, sus 66 doradas, el hub chico con 5 semillas y el grande con 1, con traza completa, y las 1.000 doradas de
// matemática por función) en una carpeta temporal, la sirve por HTTP local, la abre en Chromium 141 del entorno con Playwright y compara
// clave por clave con lo que da Node con el mismo código.
//
// Firefox y WebKit: si Playwright los encuentra instalados, se corren igual; en este entorno no están y no se instalan (instrucción de la
// corrida: el entorno no lo permite), así que quedan PENDIENTES con el motivo y R04 queda «Node = Chromium» (corte-1.md §10.7 y §13).
//
// Escribe integracion/salida/r04.json (lo lee el informe de salida y la batería en `npm run verificar`). Nada se publica.
// Uso (desde apps/anden/simulador):  NODE_PATH=/opt/node-tools/node_modules npm run r04
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { construirPagina, navegadores } from './navegador.mjs';
import { servir } from './servir.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
export const SALIDA_R04 = join(AQUI, 'salida', 'r04.json');

/** Compara dos mapas de huellas: claves que faltan, que sobran y valores distintos (los primeros 20 de cada uno). */
export function compararHuellas(node, otro) {
  const faltan = Object.keys(node).filter((k) => !(k in otro));
  const sobran = Object.keys(otro).filter((k) => !(k in node));
  const distintas = Object.keys(node).filter((k) => k in otro && node[k] !== otro[k]);
  return {
    comparadas: Object.keys(node).length - faltan.length,
    iguales: Object.keys(node).length - faltan.length - distintas.length,
    faltan: faltan.slice(0, 20), sobran: sobran.slice(0, 20),
    distintas: distintas.slice(0, 20).map((k) => `${k}: Node «${node[k]}» y navegador «${otro[k]}»`),
    nDistintas: distintas.length, nFaltan: faltan.length, nSobran: sobran.length,
  };
}

/**
 * Corre R04. Devuelve la medición (y la escribe en `salida` si se pasa). `log` recibe líneas de progreso.
 * Devuelve una MedicionR04 (integracion/bateria/casos-r04.ts; tipos en r04.d.mts).
 */
export async function correrR04({ salida = SALIDA_R04, log = (s) => console.log(s) } = {}) {
  const t0 = performance.now();
  const { calcularHuellas } = await import('./r04/huellas.ts');
  log('R04 · huellas en Node…');
  const enNode = await calcularHuellas();
  log(`  Node ${process.version}: ${Object.keys(enNode.huellas).length} claves (${JSON.stringify(enNode.grupos)}), ${enNode.matDistintas} doradas de matemática distintas, ${((performance.now() - t0) / 1000).toFixed(1)} s`);

  const dir = mkdtempSync(join(tmpdir(), 'anden-r04-'));
  const resultados = [];
  try {
    await construirPagina({ entrada: join(AQUI, 'r04', 'pagina.ts'), destino: dir, titulo: 'Andén · R04' });
    const s = await servir({ raiz: dir });
    try {
      for (const nav of navegadores()) {
        if (nav.pendiente) { resultados.push({ nombre: nav.nombre, estado: 'pendiente', motivo: nav.pendiente }); log(`  ${nav.nombre}: pendiente (${nav.pendiente})`); continue; }
        const t1 = performance.now();
        const browser = await nav.tipo.launch({ executablePath: nav.ejecutable });
        try {
          const page = await browser.newPage();
          const errores = [];
          page.on('pageerror', (e) => errores.push(`error de página: ${e.message}`));
          page.on('console', (m) => { if (m.type() === 'error') errores.push(`consola: ${m.text()}`); });
          await page.goto(s.url);
          await page.waitForFunction(() => document.body.dataset.listo === '1', null, { timeout: 30_000 });
          const r = await page.evaluate(() => window.__r04());
          const cmp = compararHuellas(enNode.huellas, r.huellas);
          const ok = cmp.nDistintas === 0 && cmp.nFaltan === 0 && cmp.nSobran === 0 && r.matDistintas === 0 && enNode.matDistintas === 0 && errores.length === 0;
          resultados.push({ nombre: nav.nombre, version: browser.version(), agente: r.agente, estado: ok ? 'pasa' : 'falla', ...cmp,
            matDistintas: r.matDistintas, errores, msEnPagina: Math.round(r.ms), segundos: (performance.now() - t1) / 1000 });
          log(`  ${nav.nombre} ${browser.version()}: ${cmp.iguales} de ${Object.keys(enNode.huellas).length} claves iguales a Node, ${cmp.nDistintas} distintas, ` +
            `${cmp.nFaltan} faltan, ${cmp.nSobran} sobran; matemática ${r.matDistintas} distintas; ${errores.length} errores → ${ok ? 'PASA' : 'FALLA'} (${(r.ms / 1000).toFixed(1)} s en la página)`);
          for (const d of [...cmp.distintas, ...errores].slice(0, 10)) log(`    ✗ ${d}`);
        } finally { await browser.close(); }
      }
    } finally { await s.cerrar(); }
  } finally { rmSync(dir, { recursive: true, force: true }); }

  const corridos = resultados.filter((x) => x.estado !== 'pendiente');
  const medicion = {
    version: 1,
    prueba: 'R04',
    descripcion: 'La misma huella en Node y en los navegadores: suite rápida de la batería, sus doradas, el hub chico (5 semillas) y el grande ' +
      '(1) con traza completa y las doradas de matemática (corte-1.md §8 y §10.7).',
    node: process.version,
    claves: Object.keys(enNode.huellas).length,
    grupos: enNode.grupos,
    matDistintasNode: enNode.matDistintas,
    navegadores: resultados,
    estado: corridos.length > 0 && corridos.every((x) => x.estado === 'pasa') ? 'pasa' : 'falla',
    alcance: corridos.map((x) => x.nombre).join(' = ') ? `Node = ${corridos.map((x) => x.nombre).join(' = ')}` : 'ningún navegador',
    pendientes: resultados.filter((x) => x.estado === 'pendiente').map((x) => ({ nombre: x.nombre, motivo: x.motivo })),
    huellasNode: enNode.huellas,
    segundos: (performance.now() - t0) / 1000,
  };
  if (salida) { mkdirSync(dirname(salida), { recursive: true }); writeFileSync(salida, `${JSON.stringify(medicion, null, 2)}\n`); }
  return medicion;
}

const esPrincipal = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (esPrincipal) {
  correrR04().then((m) => {
    console.log(`\nR04 ${m.estado === 'pasa' ? 'PASA' : 'FALLA'}: ${m.alcance} en ${m.claves} claves` +
      `${m.pendientes.length ? `; pendientes: ${m.pendientes.map((p) => p.nombre).join(' y ')}` : ''} · ${relativo(SALIDA_R04)}`);
    process.exitCode = m.estado === 'pasa' ? 0 : 1;
  }, (e) => { console.error(e instanceof Error ? e.stack : String(e)); process.exitCode = 2; });
}

function relativo(p) { return p.replace(`${resolve(AQUI, '..')}/`, ''); }
