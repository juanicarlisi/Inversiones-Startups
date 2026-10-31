import { build } from 'esbuild';
const base = { bundle: true, format: 'esm', minify: true, target: 'es2022', logLevel: 'warning', legalComments: 'none', metafile: true };
const r1 = await build({ ...base, entryPoints: ['src/principal.js'], outfile: 'salida/lab.js' });
const tam = { escena_laboratorio: r1 };
const solo = process.argv[2] === 'motores';
for (const m of ['three', 'babylon', 'playcanvas']) { try { tam[m] = await build({ ...base, entryPoints: [`src/motor-${m}.js`], outfile: `salida/motor-${m}.js`, splitting: false }); } catch (e) { console.error('motor', m, 'no se pudo construir:', String(e).slice(0, 300)); } }
import { statSync } from 'node:fs'; import { gzipSync, brotliCompressSync } from 'node:zlib'; import { readFileSync } from 'node:fs';
const fila = (n, f) => { const b = readFileSync(f); return { n, KB: +(b.length / 1024).toFixed(0), gzip_KB: +(gzipSync(b).length / 1024).toFixed(0), brotli_KB: +(brotliCompressSync(b).length / 1024).toFixed(0) }; };
const out = [fila('escena del laboratorio (three + pmndrs + N8AO + escena)', 'salida/lab.js')]; for (const m of ['three', 'babylon', 'playcanvas']) { try { out.push(fila('motor mínimo ' + m, `salida/motor-${m}.js`)); } catch {} }
console.log(JSON.stringify(out)); void statSync; void solo;
