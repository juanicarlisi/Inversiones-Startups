// integracion/r04.mjs · Andén simulador, corte 1 · Integración (corte-1.md §8 R04 y §10.7).
// R04: la misma huella en Node y en el navegador. Empaqueta integracion/r04/pagina.ts (que corre integracion/r04/huellas.ts: la suite
// rápida de la batería, sus 66 doradas, el hub chico con 5 semillas y el grande con 1, con traza completa, y las 1.000 doradas de
// matemática por función) en una carpeta temporal, la sirve por HTTP local, la abre en Chromium 141 del entorno con Playwright y compara
// clave por clave con lo que da Node con el mismo código.
//
// Firefox y WebKit: si Playwright los encuentra instalados, se corren igual; en este entorno no están y no se instalan (instrucción de la
// corrida: el entorno no lo permite), así que quedan PENDIENTES con el motivo (corte-1.md §10.7 y §13).
//
// Node y Chromium usan el mismo motor de JavaScript (V8): comparar solo esos dos no puede detectar una diferencia ENTRE motores (hallazgo
// REV-D5 de la revisión del 30-10-2026). Por eso, si el entorno tiene Bun (JavaScriptCore, el motor de Safari), R04 corre también las
// huellas ahí (integracion/r04/cli.ts) y el alcance lo dice: «Node (V8) = chromium (V8) = bun (JavaScriptCore)». Bun no reemplaza a
// Safari ni a WebKit (otro DOM, otro Worker), pero su matemática nativa sí discrepa de V8 y nuestra matemática propia no.
//
// Escribe integracion/salida/r04.json (lo lee el informe de salida y la batería en `npm run verificar`). Nada se publica.
// Uso (desde apps/anden/simulador):  NODE_PATH=/opt/node-tools/node_modules npm run r04
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
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

/** Motor de JavaScript de cada entorno (para que el alcance diga qué se comparó de verdad). */
export const MOTOR_JS = { node: 'V8', chromium: 'V8', firefox: 'SpiderMonkey', webkit: 'JavaScriptCore', bun: 'JavaScriptCore' };

/** Bun del entorno, si está: $BUN, ~/.bun/bin/bun o el PATH. No se instala nunca (corte-1.md §1.3). */
export function buscarBun() {
  for (const c of [process.env.BUN, join(homedir(), '.bun', 'bin', 'bun')]) if (c && existsSync(c)) return c;
  const w = spawnSync('sh', ['-c', 'command -v bun'], { encoding: 'utf8' });
  return w.status === 0 && w.stdout.trim() ? w.stdout.trim() : null;
}

/** Corre las huellas de R04 con Bun (JavaScriptCore) y las compara con las de Node. Devuelve el resultado con la forma de un navegador. */
function correrEnBun(enNode, log) {
  const bun = buscarBun();
  if (!bun) {
    const motivo = 'Bun no está en el entorno (se busca en $BUN, ~/.bun/bin y el PATH; no se instala): R04 queda V8 contra V8.';
    log(`  bun: pendiente (${motivo})`);
    return { nombre: 'bun', estado: 'pendiente', motivo };
  }
  const t1 = performance.now();
  const version = spawnSync(bun, ['--version'], { encoding: 'utf8' }).stdout.trim();
  const p = spawnSync(bun, [join(AQUI, 'r04', 'cli.ts')], { cwd: resolve(AQUI, '..'), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 600_000 });
  const errores = [];
  let r = null;
  if (p.error) errores.push(`no se pudo correr ${bun}: ${p.error.message}`);
  else if (p.status !== 0) errores.push(`bun salió con código ${p.status}: ${(p.stderr || '').trim().split('\n').slice(-3).join(' · ')}`);
  else {
    try { r = JSON.parse(p.stdout); } catch (e) { errores.push(`bun no devolvió JSON (se esperaba {huellas, matDistintas}): ${e instanceof Error ? e.message : e}`); }
  }
  const cmp = compararHuellas(enNode.huellas, r?.huellas ?? {});
  const ok = r !== null && cmp.nDistintas === 0 && cmp.nFaltan === 0 && cmp.nSobran === 0 && r.matDistintas === 0 && errores.length === 0;
  log(`  bun ${version} (JavaScriptCore): ${cmp.iguales} de ${Object.keys(enNode.huellas).length} claves iguales a Node, ${cmp.nDistintas} distintas, ` +
    `${cmp.nFaltan} faltan, ${cmp.nSobran} sobran; matemática ${r?.matDistintas ?? '—'} distintas; ${errores.length} errores → ${ok ? 'PASA' : 'FALLA'}`);
  for (const d of [...cmp.distintas, ...errores].slice(0, 10)) log(`    ✗ ${d}`);
  return { nombre: 'bun', version, agente: r?.agente ?? `Bun ${version}`, estado: ok ? 'pasa' : 'falla', ...cmp, matDistintas: r?.matDistintas ?? null,
    errores, msEnPagina: r ? Math.round(r.ms) : null, segundos: (performance.now() - t1) / 1000 };
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
  resultados.push(correrEnBun(enNode, log));

  const corridos = resultados.filter((x) => x.estado !== 'pendiente');
  const medicion = {
    version: 1,
    prueba: 'R04',
    descripcion: 'La misma huella en Node y en los navegadores (y en Bun, con JavaScriptCore, si está): suite rápida de la batería, sus doradas, ' +
      'el hub chico (5 semillas) y el grande (1) con traza completa y las doradas de matemática (corte-1.md §8 y §10.7).',
    node: process.version,
    claves: Object.keys(enNode.huellas).length,
    grupos: enNode.grupos,
    matDistintasNode: enNode.matDistintas,
    navegadores: resultados,
    estado: corridos.length > 0 && corridos.every((x) => x.estado === 'pasa') ? 'pasa' : 'falla',
    alcance: corridos.length ? `Node (V8) = ${corridos.map((x) => `${x.nombre} (${MOTOR_JS[x.nombre] ?? '?'})`).join(' = ')}` : 'ningún navegador',
    motores: [...new Set(['V8', ...corridos.map((x) => MOTOR_JS[x.nombre] ?? x.nombre)])],
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
