// integracion/construir.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.4).
// Construye la aplicación en dist/ para abrirla en un navegador (servida por HTTP local: integracion/servir.mjs; desde file:// no abre).
//
//   dist/index.html · estilos.css · manifest.webmanifest · icono.svg     copiados de app/ (la PWA queda en la raíz: app/NOTAS-CONTRATO §1)
//   dist/entrada.js (+ trozos/)                                        la interfaz con los servicios reales (integracion/entrada.ts)
//   dist/worker.js                                                     el Worker de simulación (integracion/worker.ts), un solo archivo
//   dist/sw.js                                                         el service worker con la lista de archivos y su versión (huella)
//   dist/vendor/LICENCIA-qrcode-generator.txt                          la licencia del QR (el código va en un trozo aparte, a demanda)
//
// Con esbuild 0.28.2 (fijado en package-lock.json): ESM, minificado, con mapas; la entrada con `splitting` para que el QR baje solo al
// abrir «Compartir». Si esbuild no está, plan B: `module.stripTypeScriptTypes` de Node (22.22) archivo por archivo, con los imports
// reescritos de .ts a .js (diseño maestro §4.13). Nada de esto se publica: dist/ es local.
//
// Uso (desde apps/anden/simulador):  npm run construir  ·  node integracion/construir.mjs [--destino=<carpeta>] [--sin-esbuild]
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RAIZ = resolve(AQUI, '..');                       // apps/anden/simulador
export const DIST = join(RAIZ, 'dist');
const APP = join(RAIZ, 'app');
const ENTRADAS = { entrada: join(AQUI, 'entrada.ts'), worker: join(AQUI, 'worker.ts') };
/** Navegadores de referencia: Chromium 141 del entorno; es2022 cubre los de 2023 en adelante (módulos en Workers, import.meta). */
export const OBJETIVO = 'es2022';

/** Lo que dice el comprobante del motor (Comprobante['motor']): el resultado de la batería con el motor de producción, si se corrió. */
export function motorVerificado() {
  const version = /VERSION_MOTOR\s*=\s*'([^']+)'/.exec(readFileSync(join(RAIZ, 'nucleo', 'version.ts'), 'utf8'))?.[1] ?? '?';
  const archivo = join(AQUI, 'salida', 'bateria-nucleo.json');
  if (existsSync(archivo)) {
    try {
      const b = JSON.parse(readFileSync(archivo, 'utf8'));
      if (b && b.version === version && Number.isInteger(b.pasaron) && Number.isInteger(b.pruebasExigibles) && typeof b.fecha === 'string') {
        return { version, pruebasExigibles: b.pruebasExigibles, pasaron: b.pasaron, fecha: b.fecha };
      }
    } catch { /* un archivo roto cuenta como «sin verificar» */ }
  }
  return null;
}

function archivosDe(d) {
  const out = [];
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) out.push(...archivosDe(p)); else out.push(p);
  }
  return out;
}

/** Copia la cáscara (HTML, estilos, PWA, licencia) y escribe sw.js con la lista de archivos construidos y la huella de todos. */
function terminar(destino) {
  copyFileSync(join(APP, 'index.html'), join(destino, 'index.html'));
  copyFileSync(join(APP, 'estilos.css'), join(destino, 'estilos.css'));
  copyFileSync(join(APP, 'pwa', 'manifest.webmanifest'), join(destino, 'manifest.webmanifest'));
  copyFileSync(join(APP, 'pwa', 'icono.svg'), join(destino, 'icono.svg'));
  mkdirSync(join(destino, 'vendor'), { recursive: true });
  copyFileSync(join(APP, 'vendor', 'LICENCIA-qrcode-generator.txt'), join(destino, 'vendor', 'LICENCIA-qrcode-generator.txt'));
  const archivos = archivosDe(destino).filter((p) => !p.endsWith('.map') && !p.endsWith(`${sep}sw.js`)).sort();
  const h = createHash('sha256');
  for (const p of archivos) { h.update(relative(destino, p)); h.update(readFileSync(p)); }
  const lista = archivos.map((p) => `./${relative(destino, p).split(sep).join('/')}`);
  const sw = readFileSync(join(APP, 'pwa', 'sw.js'), 'utf8');
  if (!sw.includes('/*VERSION*/dev') || !sw.includes('/*ARCHIVOS_CONSTRUIDOS*/[]')) {
    throw new Error('construir: app/pwa/sw.js tiene que tener las marcas /*VERSION*/dev y /*ARCHIVOS_CONSTRUIDOS*/[] y no las encontré');
  }
  const version = h.digest('hex').slice(0, 12);
  writeFileSync(join(destino, 'sw.js'), sw.replace('/*VERSION*/dev', version).replace('/*ARCHIVOS_CONSTRUIDOS*/[]', JSON.stringify(lista)));
  return { archivos: [...lista, './sw.js'], version };
}

/** Plan A: esbuild. Devuelve el metafile (qué archivos fuente entraron en cada salida) para las pruebas de arquitectura. */
async function conEsbuild(esbuild, destino, motor) {
  const comun = {
    bundle: true, format: 'esm', platform: 'browser', target: OBJETIVO, minify: true, sourcemap: true, logLevel: 'silent',
    metafile: true, legalComments: 'eof', define: { __ANDEN_MOTOR__: JSON.stringify(motor) }, absWorkingDir: RAIZ,
  };
  const a = await esbuild.build({
    ...comun, entryPoints: { entrada: ENTRADAS.entrada }, splitting: true, outdir: destino, chunkNames: 'trozos/[name]-[hash]',
  });
  const b = await esbuild.build({ ...comun, entryPoints: { worker: ENTRADAS.worker }, outdir: destino });
  const metafile = { inputs: { ...a.metafile.inputs, ...b.metafile.inputs }, outputs: { ...a.metafile.outputs, ...b.metafile.outputs } };
  return { metafile, advertencias: [...a.warnings, ...b.warnings].map((w) => w.text) };
}

/** Plan B: sin esbuild. Recorre los imports desde las dos entradas, borra los tipos con Node y copia cada módulo a su lugar. */
async function sinEsbuild(destino, motor) {
  const { stripTypeScriptTypes } = await import('node:module');
  if (typeof stripTypeScriptTypes !== 'function') throw new Error('construir: no hay esbuild ni module.stripTypeScriptTypes (hace falta Node ≥ 22.13)');
  const pendientes = [...Object.values(ENTRADAS), join(APP, 'vendor', 'qrcode-generator-2.0.4.js')];
  const hechos = new Set();
  const RE = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+)\2/g;
  while (pendientes.length) {
    const p = pendientes.pop();
    if (hechos.has(p)) continue;
    hechos.add(p);
    const rel = relative(RAIZ, p);
    if (rel.startsWith('..')) throw new Error(`construir: ${p} queda fuera de ${RAIZ}`);
    let texto = readFileSync(p, 'utf8');
    if (p.endsWith('.ts')) texto = stripTypeScriptTypes(texto, { mode: 'strip' });
    if (/\.(ts|js|mjs)$/.test(p)) {
      texto = texto.replace(RE, (_, antes, comilla, esp) => {
        pendientes.push(resolve(dirname(p), esp));
        return `${antes}${comilla}${esp.replace(/\.ts$/, '.js')}${comilla}`;
      });
    }
    if (p === ENTRADAS.entrada) texto = `const __ANDEN_MOTOR__ = ${JSON.stringify(motor)};\n${texto}`;
    const salida = join(destino, rel.replace(/\.ts$/, '.js'));
    mkdirSync(dirname(salida), { recursive: true });
    writeFileSync(salida, texto);
  }
  // index.html carga ./entrada.js y la app registra ./sw.js en la raíz: un módulo puente lleva a la entrada real.
  writeFileSync(join(destino, 'entrada.js'), "import './integracion/entrada.js';\n");
  return { metafile: null, advertencias: ['construido sin esbuild (plan B): módulos sueltos, sin minificar'] };
}

/**
 * Construye en `destino` (por defecto dist/, que se borra antes). Devuelve la lista de archivos, la versión del service worker, el
 * metafile de esbuild (null en el plan B) y el motor que quedó en el comprobante.
 */
export async function construir({ destino = DIST, sinEsbuildForzado = false } = {}) {
  // Se borra el destino antes de construir: solo si es dist/, está vacío o ya es una construcción (tiene index.html y sw.js).
  if (resolve(destino) !== DIST && existsSync(destino) && readdirSync(destino).length > 0 &&
    !(existsSync(join(destino, 'index.html')) && existsSync(join(destino, 'sw.js')))) {
    throw new Error(`construir: ${destino} no está vacío y no es una construcción anterior; no lo borro (elegí otra carpeta)`);
  }
  rmSync(destino, { recursive: true, force: true });
  mkdirSync(destino, { recursive: true });
  const motor = motorVerificado();
  let esbuild = null;
  if (!sinEsbuildForzado) {
    try { esbuild = createRequire(join(RAIZ, 'package.json'))('esbuild'); } catch { esbuild = null; }
  }
  const r = esbuild ? await conEsbuild(esbuild, destino, motor) : await sinEsbuild(destino, motor);
  const { archivos, version } = terminar(destino);
  return { destino, archivos, version, metafile: r.metafile, advertencias: r.advertencias, motor, plan: esbuild ? 'esbuild' : 'strip-types' };
}

const esPrincipal = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (esPrincipal) {
  const args = process.argv.slice(2);
  const destino = args.find((a) => a.startsWith('--destino='))?.slice(10);
  const inicio = process.hrtime.bigint();
  construir({ destino: destino ? resolve(destino) : DIST, sinEsbuildForzado: args.includes('--sin-esbuild') }).then((r) => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    const peso = (f) => statSync(join(r.destino, f)).size;
    console.log(`Andén: construido en ${relative(process.cwd(), r.destino) || '.'} con ${r.plan} en ${ms.toFixed(0)} ms (service worker ${r.version}).`);
    for (const f of ['entrada.js', 'worker.js']) if (existsSync(join(r.destino, f))) console.log(`  ${f.padEnd(12)} ${(peso(f) / 1024).toFixed(1)} KB`);
    console.log(`  ${r.archivos.length} archivos · motor: ${r.motor ? `${r.motor.pasaron} de ${r.motor.pruebasExigibles} (${r.motor.fecha})` : 'sin verificar (falta integracion/salida/bateria-nucleo.json)'}`);
    for (const a of r.advertencias) console.log(`  aviso: ${a}`);
  }, (e) => {
    console.error(`Andén: la construcción falló: ${e instanceof Error ? (process.env.DEPURAR ? e.stack : e.message) : String(e)}`);
    process.exitCode = 1;
  });
}
