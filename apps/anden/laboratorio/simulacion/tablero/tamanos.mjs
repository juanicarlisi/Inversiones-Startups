// Tamaño real (minificado, gzip y brotli) de cada candidata, con esbuild 0.28.2 y las importaciones que usaría el producto.
import { build } from 'esbuild';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
const dir = new URL('./entradas/', import.meta.url).pathname;
const filas = [];
mkdirSync(new URL('../resultados/bundles/', import.meta.url).pathname, { recursive: true });
for (const f of readdirSync(dir).filter((x) => x.endsWith('.js'))) {
  try {
    const r = await build({
      entryPoints: [dir + f], bundle: true, minify: true, format: 'esm', write: false, platform: 'browser', target: 'es2022',
      outdir: 'out', define: { 'process.env.NODE_ENV': '"production"' }, loader: { '.wasm': 'file', '.css': 'text' }, logLevel: 'silent',
      metafile: true, splitting: false,
    });
    const js = r.outputFiles.filter((o) => o.path.endsWith('.js')).map((o) => o.contents);
    const total = js.reduce((s, b) => s + b.length, 0);
    const gz = js.reduce((s, b) => s + gzipSync(b, { level: 9 }).length, 0);
    const br = js.reduce((s, b) => s + brotliCompressSync(b, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length, 0);
    const otros = r.outputFiles.filter((o) => !o.path.endsWith('.js')).map((o) => ({ archivo: o.path.split('/').pop(), bytes: o.contents.length, brotli: brotliCompressSync(o.contents).length }));
    filas.push({ entrada: f.replace('.js', ''), jsKB: +(total / 1024).toFixed(1), gzipKB: +(gz / 1024).toFixed(1), brotliKB: +(br / 1024).toFixed(1), otros });
  } catch (e) { filas.push({ entrada: f, error: String(e.message).slice(0, 200) }); }
}
console.table(filas.map(({ otros, ...x }) => x));
for (const f of filas) if (f.otros?.length) console.log(f.entrada, 'archivos aparte:', f.otros.map((o) => `${o.archivo} ${(o.bytes / 1048576).toFixed(1)} MB (brotli ${(o.brotli / 1048576).toFixed(1)} MB)`).join('; '));
writeFileSync(new URL('../resultados/tamanos.json', import.meta.url).pathname, JSON.stringify(filas, null, 1));
