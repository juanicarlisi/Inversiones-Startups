// integracion/navegador.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.7 y §10.9). Lo común a R04 y al banco:
//   · Playwright 1.56.1 y Chromium 141 del entorno (/opt/node-tools, /opt/pw-browsers): se usan desde ahí, NUNCA se instalan;
//   · qué navegadores hay de verdad (Firefox y WebKit no están en el entorno: quedan pendientes con el motivo);
//   · empaquetar una página de pruebas (no la app) con esbuild en una carpeta temporal, para servirla por HTTP local.
// Nada de esto se publica: las páginas viven en una carpeta temporal y el servidor escucha solo en 127.0.0.1.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RAIZ = resolve(AQUI, '..');                      // apps/anden/simulador
export const MODULOS_PLAYWRIGHT = process.env.NODE_PATH ?? '/opt/node-tools/node_modules';
export const CHROMIUM = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** Playwright del entorno (no se instala: corte-1.md §1.3). */
export function playwright() {
  const requerir = createRequire(join(MODULOS_PLAYWRIGHT, 'x.js'));
  try { return requerir('playwright'); } catch (e) {
    throw new Error(`no encontré Playwright en ${MODULOS_PLAYWRIGHT} (se esperaba la 1.56.1 del entorno; correr con NODE_PATH=/opt/node-tools/node_modules): ${e instanceof Error ? e.message : e}`);
  }
}

/** Motivo por el que Firefox y WebKit no se corren en esta máquina (corte-1.md §10.7; la instalación no está permitida acá). */
export const MOTIVO_SIN_INSTALAR = 'no está instalado en el entorno (Playwright 1.56.1 trae solo Chromium 141 en /opt/pw-browsers) y en esta ' +
  'corrida no se permite instalar navegadores (`npx playwright install firefox webkit` no se intentó). Queda pendiente; corte-1.md §13 lo ' +
  'pasa al corte 2 junto con los teléfonos reales.';

/**
 * Navegadores disponibles: Chromium (el ejecutable fijo del entorno) y, si estuvieran instalados donde Playwright los busca, Firefox y
 * WebKit. Devuelve para cada uno { nombre, tipo, ejecutable } o { nombre, pendiente: motivo }.
 */
export function navegadores() {
  const pw = playwright();
  const out = [];
  out.push(existsSync(CHROMIUM) ? { nombre: 'chromium', tipo: pw.chromium, ejecutable: CHROMIUM } : { nombre: 'chromium', pendiente: `no existe ${CHROMIUM}` });
  for (const nombre of ['firefox', 'webkit']) {
    let ruta = '';
    try { ruta = pw[nombre].executablePath(); } catch { ruta = ''; }
    out.push(ruta && existsSync(ruta) ? { nombre, tipo: pw[nombre], ejecutable: ruta } : { nombre, pendiente: MOTIVO_SIN_INSTALAR });
  }
  return out;
}

/** Módulos de Node que verificacion/bateria.ts importa (para escribir el informe): en el navegador quedan vacíos y, si se llaman, lanzan. */
const NODO_VACIO = {
  'node:fs': ['existsSync', 'mkdirSync', 'readFileSync', 'rmSync', 'statSync', 'writeFileSync'],
  'node:path': ['resolve', 'join', 'dirname'],
  'node:url': ['pathToFileURL'],
};
const pluginNodoVacio = {
  name: 'nodo-vacio',
  setup(b) {
    b.onResolve({ filter: /^node:/ }, (a) => ({ path: a.path, namespace: 'nodo-vacio' }));
    b.onLoad({ filter: /.*/, namespace: 'nodo-vacio' }, (a) => {
      const nombres = NODO_VACIO[a.path];
      if (!nombres) return { errors: [{ text: `la página de pruebas no puede usar ${a.path} en el navegador` }] };
      const lineas = nombres.map((n) => `export const ${n} = () => { throw new Error('${a.path} ${n}: no existe en el navegador (página de pruebas)'); };`);
      // fileURLToPath se llama al cargar verificacion/bateria.ts (rutas del informe): devuelve el texto de la URL
      if (a.path === 'node:url') lineas.push('export const fileURLToPath = (u) => String(u);');
      return { contents: lineas.join('\n'), loader: 'js' };
    });
  },
};

/**
 * Empaqueta una página de pruebas (`entrada`, un .ts) en `destino` con su index.html (CSP estricta, como la app). Devuelve `destino`.
 * `process.argv` se define vacío: verificacion/bateria.ts lo mira al cargarse para saber si es la línea de comandos.
 */
export async function construirPagina({ entrada, destino, titulo }) {
  const esbuild = createRequire(join(RAIZ, 'package.json'))('esbuild');
  mkdirSync(destino, { recursive: true });
  await esbuild.build({
    entryPoints: { pagina: entrada }, bundle: true, format: 'esm', platform: 'browser', target: 'es2022', outdir: destino,
    sourcemap: false, minify: false, logLevel: 'silent', absWorkingDir: RAIZ, define: { 'process.argv': '[]' }, plugins: [pluginNodoVacio],
  });
  // el navegador pide /favicon.ico por su cuenta: un ícono vacío evita un 404 en la consola (que la página contaría como error)
  writeFileSync(join(destino, 'favicon.ico'), '');
  writeFileSync(join(destino, 'index.html'), `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; worker-src 'self' blob:">
<title>${titulo}</title>
</head>
<body>
<p id="estado">Cargando…</p>
<script type="module" src="./pagina.js"></script>
</body>
</html>
`);
  return destino;
}

/** Mediana (la de §11: con 5 corridas, la del medio). */
export function mediana(xs) {
  const o = [...xs].sort((a, b) => a - b);
  return o.length ? o[Math.floor(o.length / 2)] : NaN;
}
