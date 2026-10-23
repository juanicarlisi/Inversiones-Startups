// integracion/servir.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.4).
// Sirve dist/ por HTTP local (127.0.0.1): el simulador no abre desde file:// (módulos ES, Workers de módulo y service worker; MEDIDO en
// tecnologia-web.md). Solo para probar en esta máquina: no escucha en la red ni publica nada.
//
// Uso (desde apps/anden/simulador):  npm run construir && npm run servir  ·  node integracion/servir.mjs [--puerto=8080] [--raiz=dist]
// Desde código (e2e, r04, banco):     const s = await servir({ raiz, puerto: 0 }); … s.url … await s.cerrar();
// El banco (§11) usa dos opciones más: `brotli` (manda los textos comprimidos con brotli si el navegador lo acepta, como lo haría el
// alojamiento estático: así la red 4G emulada baja los bytes reales) y `aislado` (cabeceras COOP y COEP: la página queda aislada entre
// orígenes y puede medir su memoria con performance.measureUserAgentSpecificMemory).
import { createServer } from 'node:http';
import { brotliCompressSync, constants as zlib, gzipSync } from 'node:zlib';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = fileURLToPath(new URL('.', import.meta.url));
export const DIST = resolve(AQUI, '..', 'dist');

export const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.map': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};
/** La misma política que app/index.html (corte-1.md §1.8), también como cabecera. */
// La CSP de §1.8 endurecida (hallazgo SEG-06; integracion/CAMBIOS-CONTRATO.md §3): sin `blob:` en worker-src (los Workers salen de
// ./worker.js), con base-uri y form-action cerrados y, como cabecera (en <meta> se ignora), frame-ancestors 'none': nadie la enmarca.
export const CSP = "default-src 'self'; script-src 'self'; worker-src 'self'; img-src 'self' data: blob:; style-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

const COMPRIMIBLES = new Set(['.html', '.js', '.mjs', '.css', '.json', '.webmanifest', '.svg', '.map', '.txt']);

/** Sirve `raiz` en 127.0.0.1:`puerto` (0 = uno libre). Devuelve la URL base y cómo cerrarlo. */
export function servir({ raiz = DIST, puerto = 0, silencioso = true, brotli = false, aislado = false } = {}) {
  const comprimidos = new Map();
  // Con `brotli`, todo se comprime ANTES de escuchar (calidad 11 tarda ~1 s con entrada.js): si no, el primer pedido mediría la
  // compresión del servidor y no la página (el alojamiento estático sirve archivos ya comprimidos).
  if (brotli && existsSync(join(resolve(raiz), 'index.html'))) {
    const recorrer = (d) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) recorrer(p);
        else if (COMPRIMIBLES.has(extname(p))) comprimidos.set(`br:${p}`, brotliCompressSync(readFileSync(p), { params: { [zlib.BROTLI_PARAM_QUALITY]: 11 } }));
      }
    };
    recorrer(resolve(raiz));
  }
  const base = resolve(raiz);
  if (!existsSync(join(base, 'index.html'))) {
    return Promise.reject(new Error(`servir: no encontré ${join(base, 'index.html')}; primero hay que construir (npm run construir)`));
  }
  const servidor = createServer((req, res) => {
    let ruta;
    try { ruta = decodeURIComponent(new URL(req.url ?? '/', 'http://local').pathname); } catch { res.writeHead(400); res.end(); return; }
    let archivo = resolve(base, `.${ruta}`);
    if (archivo !== base && !archivo.startsWith(base + sep)) { res.writeHead(403); res.end('fuera de la carpeta'); return; }
    try {
      if (statSync(archivo).isDirectory()) archivo = join(archivo, 'index.html');
      let cuerpo = readFileSync(archivo);
      const cabeceras = {
        'content-type': TIPOS[extname(archivo)] ?? 'application/octet-stream',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-security-policy': CSP,
        'referrer-policy': 'no-referrer',
      };
      if (aislado) { cabeceras['cross-origin-opener-policy'] = 'same-origin'; cabeceras['cross-origin-embedder-policy'] = 'require-corp'; }
      // Chromium anuncia brotli solo en orígenes seguros; si no lo acepta, gzip (lo que haría el alojamiento con un navegador viejo)
      const acepta = String(req.headers['accept-encoding'] ?? '');
      const codificacion = /\bbr\b/.test(acepta) ? 'br' : /\bgzip\b/.test(acepta) ? 'gzip' : '';
      if (brotli && codificacion && COMPRIMIBLES.has(extname(archivo))) {
        const clave = `${codificacion}:${archivo}`;
        if (!comprimidos.has(clave)) {
          comprimidos.set(clave, codificacion === 'br' ? brotliCompressSync(cuerpo, { params: { [zlib.BROTLI_PARAM_QUALITY]: 11 } }) : gzipSync(cuerpo, { level: 9 }));
        }
        cuerpo = comprimidos.get(clave);
        cabeceras['content-encoding'] = codificacion;
        cabeceras.vary = 'accept-encoding';
      }
      res.writeHead(200, cabeceras);
      res.end(req.method === 'HEAD' ? undefined : cuerpo);
      if (!silencioso) console.log(`200 ${ruta}`);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('no está');
      if (!silencioso) console.log(`404 ${ruta}`);
    }
  });
  return new Promise((resolver, rechazar) => {
    servidor.once('error', rechazar);
    servidor.listen(puerto, '127.0.0.1', () => {
      const { port } = servidor.address();
      resolver({ url: `http://127.0.0.1:${port}/`, puerto: port, cerrar: () => new Promise((r) => servidor.close(() => r())) });
    });
  });
}

const esPrincipal = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (esPrincipal) {
  const args = process.argv.slice(2);
  const puerto = Number(args.find((a) => a.startsWith('--puerto='))?.slice(9) ?? 8080);
  const raiz = args.find((a) => a.startsWith('--raiz='))?.slice(7) ?? DIST;
  servir({ raiz, puerto, silencioso: false }).then((s) => {
    console.log(`Andén: sirviendo ${raiz} en ${s.url} (solo esta máquina; Ctrl+C para cortar)`);
  }, (e) => { console.error(e instanceof Error ? e.message : String(e)); process.exitCode = 1; });
}
