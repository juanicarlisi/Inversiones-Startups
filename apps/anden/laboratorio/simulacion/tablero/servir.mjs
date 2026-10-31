// Servidor estático mínimo del laboratorio (solo 127.0.0.1): dist/, datos/, wasm y node_modules, con los encabezados de aislamiento
// que piden los WASM con hilos. Uso: node tablero/servir.mjs [puerto]
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('..', import.meta.url)));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.wasm': 'application/wasm', '.arrow': 'application/octet-stream', '.map': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const RUTAS = { '/dist/': 'tablero/dist/', '/datos/': 'datos/', '/nm/': 'node_modules/', '/wasm/': 'node_modules/@duckdb/duckdb-wasm/dist/', '/resultados/': 'resultados/', '/': 'tablero/' };
export function servir(puerto = 8765) {
  const srv = createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const pref = Object.keys(RUTAS).filter((p) => url.startsWith(p)).sort((a, b) => b.length - a.length)[0];
    if (!pref) { res.writeHead(404).end(); return; }
    const f = normalize(join(RAIZ, RUTAS[pref], url.slice(pref.length) || 'index.html'));
    if (!f.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
    try { statSync(f); } catch { res.writeHead(404).end('no existe ' + url); return; }
    res.writeHead(200, { 'Content-Type': MIME[extname(f)] ?? 'application/octet-stream', 'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp', 'Cache-Control': 'no-store' });
    createReadStream(f).pipe(res);
  });
  return new Promise((ok) => srv.listen(puerto, '127.0.0.1', () => ok(srv)));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { await servir(Number(process.argv[2] ?? 8765)); console.log('http://127.0.0.1:' + (process.argv[2] ?? 8765)); }
