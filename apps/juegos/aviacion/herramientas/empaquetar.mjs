// Arma la carpeta que se sube a cada portal (sin herramientas, pruebas, capturas ni README).
//  - crazygames (lanzamiento básico, el candidato de diciembre): index.html = crazygames.html; SIN js/anuncios.js ni las páginas
//    del lanzamiento completo. Así el candidato no lleva código de anuncios.
//  - crazygames-completo y poki (HN-27, v1.1): con js/anuncios.js.
// Revisa: solo rutas relativas, menos de 1.500 archivos y el peso total.
//   node herramientas/empaquetar.mjs [crazygames|crazygames-completo|poki] [carpeta-salida]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { todos } from './destinos.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = ['css/estilo.css', 'css/ronda.css', 'ronda.html'];
const PAQUETES = {
  crazygames: { entrada: 'crazygames.html', sinAnuncios: true },
  'crazygames-completo': { entrada: 'crazygames-completo.html', sinAnuncios: false },
  poki: { entrada: 'poki.html', sinAnuncios: false },
};

export function archivosDe(nombre) {
  const p = PAQUETES[nombre];
  if (!p) throw new Error(`paquete desconocido: ${nombre}`);
  const js = readdirSync(path.join(RAIZ, 'js')).filter((f) => f.endsWith('.js') && !(p.sinAnuncios && f === 'anuncios.js')).map((f) => `js/${f}`);
  const html = todos();
  const out = { 'index.html': html[p.entrada] };
  for (const f of [...BASE, ...js]) out[f] = readFileSync(path.join(RAIZ, f));
  return out;
}

// Rutas absolutas en HTML, CSS o JS (src="/…", href="/…", url(/…), import '/…'). Las URLs del SDK del portal son la única excepción.
export function rutasAbsolutas(archivos) {
  const malas = [];
  for (const [f, c] of Object.entries(archivos)) {
    const txt = String(c);
    for (const m of txt.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']|url\(\s*['"]?([^'")]+)|(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)) {
      const u = m[1] ?? m[2] ?? m[3];
      if (!u || u.startsWith('data:') || u.startsWith('#') || /^https:\/\/(sdk\.crazygames\.com|game-cdn\.poki\.com)\//.test(u)) continue;
      if (u.startsWith('/') || /^[a-z]+:\/\//i.test(u)) malas.push(`${f}: ${u}`);
    }
  }
  return malas;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const nombre = process.argv[2] ?? 'crazygames';
  const salida = path.resolve(process.argv[3] ?? path.join(RAIZ, 'dist', nombre));
  const archivos = archivosDe(nombre);
  const malas = rutasAbsolutas(archivos);
  if (malas.length) { console.error('rutas absolutas:', malas); process.exit(1); }
  rmSync(salida, { recursive: true, force: true });
  let bytes = 0;
  for (const [f, c] of Object.entries(archivos)) {
    mkdirSync(path.dirname(path.join(salida, f)), { recursive: true });
    writeFileSync(path.join(salida, f), c);
    bytes += statSync(path.join(salida, f)).size;
  }
  const n = Object.keys(archivos).length;
  console.log(JSON.stringify({ paquete: nombre, salida, archivos: n, kb: Math.round(bytes / 1024), anuncios: 'js/anuncios.js' in archivos, limiteArchivos: n < 1500 }));
}
