// Servidor estático mínimo para las pruebas (sirve web/ en localhost, que cuenta como contexto seguro para el service worker).
// `reemplazos` permite simular una versión nueva sin tocar los archivos (prueba de actualización).
const http = require('http'), fs = require('fs'), path = require('path');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.csv': 'text/csv' };
function servir(raiz, puerto = 0) {
  const estado = { reemplazos: {}, pedidos: [] };
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x'); let rel = decodeURIComponent(u.pathname); if (rel.endsWith('/')) rel += 'index.html';
    estado.pedidos.push(rel);
    const archivo = path.join(raiz, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
    if (!archivo.startsWith(raiz) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); res.end('no'); return; }
    let cuerpo = fs.readFileSync(archivo);
    const r = estado.reemplazos[rel]; if (r) cuerpo = Buffer.from(r(cuerpo.toString()));
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(cuerpo);
  });
  return new Promise(ok => srv.listen(puerto, '127.0.0.1', () => ok({ srv, estado, url: `http://localhost:${srv.address().port}/` })));
}
module.exports = { servir };
if (require.main === module) servir(path.join(__dirname, '..', 'web'), +process.argv[2] || 8765).then(s => console.log('Sirviendo', s.url));
