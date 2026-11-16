// Arma la página de demostración de la oficina (sin el juego) en tmp/demo-oficina/.
//   node herramientas/demo-oficina.mjs             → tmp/demo-oficina/ (index.html + archivos relativos)
//   node herramientas/demo-oficina.mjs --servir    → además la sirve en http://localhost:8813
//   node herramientas/demo-oficina.mjs --peso      → además mide cuánto le suma la oficina al paquete del juego
// Parámetros de la página: ?hora=18.8 · ?lang=es|en · ?primera=1 · ?calidad=alto|medio|bajo · ?hoja=mapa · ?manual=1
import { build } from 'esbuild';
import { cp, mkdir, rm, writeFile, readdir, stat, access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { dirname, join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const salida = join(raiz, 'tmp/demo-oficina');
const comunes = {
  bundle: true, format: 'esm', target: 'es2022', minify: true, legalComments: 'none',
  loader: { '.woff2': 'file', '.webp': 'file', '.svg': 'text', '.glsl': 'text' }, assetNames: 'activos/[name]',
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning',
};

await rm(salida, { recursive: true, force: true });
await mkdir(salida, { recursive: true });
await build({ ...comunes, entryPoints: { demo: join(raiz, 'src/oficina/demo/demo.js') }, outdir: salida });
await writeFile(join(salida, 'index.html'), `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark"><title>Hub Nocturno · la oficina (demostración)</title>
<link rel="stylesheet" href="demo.css"></head>
<body>
<div id="juego"><h1>Acá iría el mapa del juego</h1><p>La oficina le pidió esto al juego:</p><code>—</code><button>Entrar a la oficina</button></div>
<div id="oficina"></div>
<script type="module" src="demo.js"></script>
</body></html>
`);
// si el juego dejó su ejemplo real, la demostración lo usa
const real = join(raiz, 'src/oficina-datos-ejemplo.json');
try { await access(real); await cp(real, join(salida, 'oficina-datos-ejemplo.json')); console.log('  con el ejemplo real del juego (src/oficina-datos-ejemplo.json)'); } catch { console.log('  con el ejemplo propio (src/oficina/ejemplo.js)'); }

async function listar(d, base = d, filas = []) {
  for (const n of await readdir(d)) { const p = join(d, n), s = await stat(p); if (s.isDirectory()) await listar(p, base, filas); else filas.push([p.slice(base.length + 1), s.size]); }
  return filas;
}
for (const [n, t] of (await listar(salida)).sort((a, b) => b[1] - a[1])) console.log(`  ${(t / 1024).toFixed(0).padStart(6)} KB  ${n}`);

if (process.argv.includes('--peso')) {
  // el juego solo contra el juego con la oficina: la diferencia es lo que suma (three y los demás ya están en el juego)
  const tmp = join(raiz, 'tmp/peso-oficina');
  await rm(tmp, { recursive: true, force: true }); await mkdir(tmp, { recursive: true });
  await writeFile(join(tmp, 'con.js'), `import '../../src/main.js';\nimport { crearOficina } from '../../src/oficina/oficina.js';\nwindow.__crearOficina = crearOficina;\n`);
  await build({ ...comunes, target: 'es2021', entryPoints: { solo: join(raiz, 'src/main.js'), con: join(tmp, 'con.js') }, outdir: join(tmp, 'salida') });
  const peso = (f) => { const b = readFileSync(join(tmp, 'salida', f)); return [b.length, gzipSync(b).length]; };
  const fila = (n, a, b) => console.log(`  ${n.padEnd(12)} ${(a[0] / 1024).toFixed(0).padStart(6)} KB → ${(b[0] / 1024).toFixed(0).padStart(6)} KB   (+${((b[0] - a[0]) / 1024).toFixed(0)} KB; con gzip +${((b[1] - a[1]) / 1024).toFixed(0)} KB)`);
  console.log('peso que suma la oficina al paquete del juego:');
  fila('juego.js', peso('solo.js'), peso('con.js')); fila('juego.css', peso('solo.css'), peso('con.css'));
  await rm(tmp, { recursive: true, force: true });
}

if (process.argv.includes('--servir')) {
  const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.woff2': 'font/woff2' };
  const puerto = +(process.env.PUERTO ?? 8813);
  createServer((req, res) => {
    const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    const archivo = join(salida, ruta || 'index.html');
    if (!archivo.startsWith(salida)) { res.writeHead(403).end(); return; }
    stat(archivo).then((s) => { if (!s.isFile()) throw 0; res.writeHead(200, { 'content-type': tipos[extname(archivo)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); createReadStream(archivo).pipe(res); })
      .catch(() => { res.writeHead(404).end('no está'); });
  }).listen(puerto, () => console.log(`http://localhost:${puerto}/  (Ctrl+C para apagar)`));
}
