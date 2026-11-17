// Servidor estático mínimo para probar dist/ en http://localhost (el service worker exige https o localhost).
// Uso: node pruebas/servidor.mjs [puerto]   ·   también lo usa pruebas/navegador.mjs.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};

export function servir(puerto = 0) {
  const srv = http.createServer(async (req, res) => {
    try {
      let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (ruta.endsWith('/')) ruta += 'index.html';
      const archivo = normalize(join(DIST, ruta));
      if (!archivo.startsWith(DIST)) throw new Error('fuera');
      await stat(archivo);
      res.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(await readFile(archivo));
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No existe');
    }
  });
  return new Promise((ok) => srv.listen(puerto, '127.0.0.1', () => ok({ srv, url: `http://localhost:${srv.address().port}/` })));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { url } = await servir(Number(process.argv[2]) || 8787);
  console.log('Telar en ' + url + ' (Ctrl+C para cortar)');
}
