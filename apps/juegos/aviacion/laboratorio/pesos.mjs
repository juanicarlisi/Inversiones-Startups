// Peso de cada candidato como lo enviaría el juego: esbuild minificado (ESM, es2022), solo lo que usa la prueba; bytes crudos, gzip -9 y brotli -q11.
// Uso: node pesos.mjs  → resultados/pesos.json
import { build } from 'esbuild';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const juego = path.resolve(aqui, '..');
const E = {
  'juego actual: js/main.js + modelo + render (sin librerías)': { entry: path.join(juego, 'js/main.js') },
  'pixi.js 8.22.0': { stdin: "export { Application, Graphics, Text, Sprite, Container, ParticleContainer, Particle, Texture, Rectangle } from 'pixi.js';" },
  'phaser 4.2.1': { stdin: "import Phaser from 'phaser'; globalThis.Phaser = Phaser;" },
  'three 0.187.0 (solo lo que usa el globo)': { stdin: "export { WebGLRenderer, Scene, PerspectiveCamera, SphereGeometry, Mesh, MeshBasicMaterial, CanvasTexture, BufferGeometry, BufferAttribute, Points, PointsMaterial, LineSegments, LineBasicMaterial, ShaderMaterial, Vector3 } from 'three';" },
  'maplibre-gl 6.16.0 (js)': { stdin: "import * as m from 'maplibre-gl'; globalThis.m = m;" },
  'deck.gl 9.4.1 (core + layers)': { stdin: "export { Deck, _GlobeView } from '@deck.gl/core'; export { GeoJsonLayer, ArcLayer, IconLayer, SolidPolygonLayer, ScatterplotLayer } from '@deck.gl/layers';" },
};
const out = {};
for (const [k, v] of Object.entries(E)) {
  const r = await build({ ...(v.entry ? { entryPoints: [v.entry] } : { stdin: { contents: v.stdin, resolveDir: aqui, loader: 'js' } }), bundle: true, minify: true, format: 'esm', target: 'es2022', write: false, logLevel: 'error', loader: { '.css': 'empty' } });
  const buf = Buffer.from(r.outputFiles[0].contents);
  out[k] = { crudoKB: +(buf.length / 1024).toFixed(0), gzipKB: +(zlib.gzipSync(buf, { level: 9 }).length / 1024).toFixed(0), brotliKB: +(zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length / 1024).toFixed(0) };
  console.log(k.padEnd(62), JSON.stringify(out[k]));
}
const css = fs.readFileSync(path.join(aqui, 'node_modules/maplibre-gl/dist/maplibre-gl.css'));
out['maplibre-gl 6.16.0 (css)'] = { crudoKB: +(css.length / 1024).toFixed(0), brotliKB: +(zlib.brotliCompressSync(css).length / 1024).toFixed(0) };
fs.mkdirSync(path.join(aqui, 'resultados'), { recursive: true });
fs.writeFileSync(path.join(aqui, 'resultados/pesos.json'), JSON.stringify(out, null, 1));
