// integracion/huella-fuentes.mjs · Andén simulador, corte 1 · Integración (hallazgo H5 de la revisión del 19-10-2026).
// La huella SHA-256 del código que corre la batería «Andén Verificado»: todos los archivos que importa `integracion/verificar.ts`
// (siguiendo los imports relativos, .ts, .mjs y .json) más los que lee del disco (las doradas). `npm run verificar` la guarda en
// `salida/bateria-nucleo.json` y la construcción la recalcula: si no coincide, el sello dice «sin verificar» en lugar de «85 de 85»,
// aunque la versión del motor sea la misma (antes bastaba con que coincidiera el texto de la versión).
//
// Uso: import { huellaFuentes } from './huella-fuentes.mjs'; huellaFuentes() → { sha256, archivos }
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');

/** Punto de entrada de la batería y archivos que lee del disco (no son imports). */
export const ENTRADA_BATERIA = 'integracion/verificar.ts';
export const LEIDOS_POR_LA_BATERIA = ['verificacion/doradas.json'];

/** Imports relativos de un archivo fuente (estáticos, dinámicos con texto fijo y `export … from`). */
function importsDe(texto) {
  const out = [];
  const re = /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g;
  for (const m of texto.matchAll(re)) {
    const ruta = m[1] ?? m[2] ?? m[3];
    if (ruta && (ruta.startsWith('./') || ruta.startsWith('../'))) out.push(ruta);
  }
  return out;
}

/** Los archivos (relativos a la raíz del simulador, con «/») que alcanza la batería, ordenados. */
export function fuentesDeLaBateria() {
  const vistos = new Set();
  const pendientes = [resolve(RAIZ, ENTRADA_BATERIA)];
  while (pendientes.length) {
    const p = pendientes.pop();
    if (vistos.has(p) || !existsSync(p)) continue;
    vistos.add(p);
    if (!/\.(ts|mjs|js)$/.test(p)) continue;
    for (const r of importsDe(readFileSync(p, 'utf8'))) pendientes.push(resolve(dirname(p), r));
  }
  for (const f of LEIDOS_POR_LA_BATERIA) { const p = resolve(RAIZ, f); if (existsSync(p)) vistos.add(p); }
  return [...vistos].map((p) => relative(RAIZ, p).split(sep).join('/')).sort();
}

/** SHA-256 de (ruta, contenido) de cada archivo, en orden: cambia si cambia cualquier archivo que corre la batería. */
export function huellaFuentes() {
  const archivos = fuentesDeLaBateria();
  const h = createHash('sha256');
  for (const f of archivos) { h.update(f); h.update('\0'); h.update(readFileSync(join(RAIZ, f))); h.update('\0'); }
  return { sha256: h.digest('hex'), archivos: archivos.length };
}
