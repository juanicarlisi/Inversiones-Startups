// Empaqueta Hub Nocturno v2 en dist/ (index.html + archivos relativos, sin CDN ni servidor).
//   node herramientas/construir.mjs            → dist/ minificado
//   node herramientas/construir.mjs --vigilar  → reconstruye al guardar (sin minificar)
import { build, context } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');
const vigilar = process.argv.includes('--vigilar');

const opciones = {
  entryPoints: { juego: join(raiz, 'src/main.js') },
  outdir: dist,
  bundle: true,
  format: 'esm',
  target: ['es2020', 'safari14'],
  minify: !vigilar,
  sourcemap: vigilar ? 'inline' : false,
  legalComments: 'none',
  loader: { '.woff2': 'file', '.webp': 'file', '.svg': 'text', '.glsl': 'text' },
  assetNames: 'activos/[name]',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
};

async function copiar() {
  await mkdir(join(dist, 'activos'), { recursive: true });
  for (const a of ['alturas.webp', 'suelo.webp']) await cp(join(raiz, 'activos', a), join(dist, 'activos', a));
  const mundo = JSON.parse(await readFile(join(raiz, 'activos/mundo.json'), 'utf8'));
  delete mundo.fuentes;
  await writeFile(join(dist, 'activos/mundo.json'), JSON.stringify(mundo));
  await cp(join(raiz, 'src/index.html'), join(dist, 'index.html'));
}

async function pesos() {
  let total = 0;
  const filas = [];
  async function andar(d) {
    for (const n of await readdir(d)) {
      const p = join(d, n), s = await stat(p);
      if (s.isDirectory()) await andar(p); else { total += s.size; filas.push([p.slice(dist.length + 1), s.size]); }
    }
  }
  await andar(dist);
  filas.sort((a, b) => b[1] - a[1]);
  for (const [n, t] of filas) console.log(`  ${(t / 1024).toFixed(0).padStart(6)} KB  ${n}`);
  console.log(`  total ${(total / 1048576).toFixed(2)} MB`);
}

if (vigilar) {
  await copiar();
  const ctx = await context(opciones);
  await ctx.watch();
  console.log('vigilando…');
} else {
  await rm(dist, { recursive: true, force: true });
  await build(opciones);
  await copiar();
  await pesos();
}
