// Servidor estático mínimo para el laboratorio: raíz = apps/juegos/aviacion/ (así /js/ del juego y /laboratorio/ conviven; solo lectura).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.wasm': 'application/wasm', '.map': 'application/json' };
const CACHE = new Map();
export function servir(puerto = 0, host = '127.0.0.1') {
  return new Promise((ok) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const archivo = path.join(RAIZ, u);
      if (!archivo.startsWith(RAIZ)) { res.writeHead(403); res.end(); return; }
      fs.readFile(archivo, (e, d) => {
        if (e) { res.writeHead(404); res.end('no'); return; }
        const tipo = TIPOS[path.extname(archivo)] ?? 'application/octet-stream', cab = { 'content-type': tipo, 'cache-control': 'no-store' };
        // como un CDN: brotli para texto (calidad 6 en caché de memoria) si el navegador lo acepta
        if (/\b(js|html|css|json)\b/.test(tipo.replace('javascript', 'js')) && String(req.headers['accept-encoding']).includes('br') && d.length > 1024) {
          let z = CACHE.get(archivo + d.length); if (!z) { z = zlib.brotliCompressSync(d, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 6 } }); CACHE.set(archivo + d.length, z); }
          res.writeHead(200, { ...cab, 'content-encoding': 'br', 'content-length': z.length }); res.end(z); return;
        }
        res.writeHead(200, cab); res.end(d);
      });
    });
    srv.listen(puerto, host, () => ok({ url: `http://127.0.0.1:${srv.address().port}`, cerrar: () => new Promise((r) => srv.close(r)) }));
  });
}

// Uso directo: node laboratorio/servidor.mjs [puerto] [--lan]  → sirve apps/juegos/aviacion/ para abrir /laboratorio/autoprueba.html en otro dispositivo de la red local.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const puerto = +(process.argv[2] ?? 8080), lan = process.argv.includes('--lan');
  const srv = http.createServer(); // se reutiliza servir() con host configurable
  srv.close();
  const { url } = await servir(puerto, lan ? '0.0.0.0' : '127.0.0.1');
  console.log('Servidor del laboratorio en', url, lan ? '(accesible desde la red local)' : '(solo esta máquina)', '→ /laboratorio/autoprueba.html');
}
