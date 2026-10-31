import { build } from 'esbuild';
import { readdirSync, copyFileSync, mkdirSync } from 'node:fs';
const aqui = new URL('.', import.meta.url).pathname;
const entradas = readdirSync(aqui + 'src').filter((f) => /^(g|d|r|i)-.*\.js$/.test(f)).map((f) => aqui + 'src/' + f);
await build({ entryPoints: entradas, bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022', outdir: aqui + 'dist', sourcemap: false,
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'info', external: [] });
