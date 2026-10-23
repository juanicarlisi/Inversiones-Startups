// Un HTML por destino, generado desde index.html (la fuente: web propia y pruebas, sin SDK).
//  - crazygames.html: el SDK v3 de CrazyGames, lanzamiento básico (sin anuncios).
//  - Lanzamiento completo (HN-27, v1.1, fuera del candidato de diciembre): crazygames-completo.html y poki.html cargan además
//    js/anuncios.js. herramientas/empaquetar.mjs los deja afuera del paquete del candidato.
// Solo rutas relativas (CrazyGames rechaza las absolutas). Uso: node herramientas/destinos.mjs [--revisar]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SDK = {
  crazygames: 'https://sdk.crazygames.com/crazygames-sdk-v3.js',
  poki: 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js',
};
export const DESTINOS = {
  'crazygames.html': { portal: 'crazygames', lanzamiento: 'basico' },
  'crazygames-completo.html': { portal: 'crazygames', lanzamiento: 'completo' },
  'poki.html': { portal: 'poki', lanzamiento: 'completo' },
};
const MARCA = '<!-- SDK del portal: index.html no carga ninguno (web propia y pruebas). crazygames.html se genera con herramientas/destinos.mjs. -->';

export function generar(fuente, { portal, lanzamiento }) {
  if (!fuente.includes(MARCA)) throw new Error('index.html perdió la marca del SDK');
  return fuente
    .replace('<meta name="hn-portal" content="ninguno">', `<meta name="hn-portal" content="${portal}">`)
    .replace('<meta name="hn-lanzamiento" content="basico">', `<meta name="hn-lanzamiento" content="${lanzamiento}">`)
    .replace(MARCA, `<!-- Generado por herramientas/destinos.mjs desde index.html: no editar a mano. -->\n  <script src="${SDK[portal]}"></script>`);
}

export function todos() {
  const fuente = readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  return Object.fromEntries(Object.entries(DESTINOS).map(([archivo, d]) => [archivo, generar(fuente, d)]));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const revisar = process.argv.includes('--revisar');
  let distintos = 0;
  for (const [archivo, html] of Object.entries(todos())) {
    const ruta = path.join(RAIZ, archivo);
    let actual = null;
    try { actual = readFileSync(ruta, 'utf8'); } catch { /* no existe */ }
    if (actual === html) continue;
    distintos++;
    if (revisar) console.log(`desactualizado: ${archivo}`);
    else { writeFileSync(ruta, html); console.log(`escrito: ${archivo}`); }
  }
  if (revisar) process.exitCode = distintos ? 1 : 0;
  else if (!distintos) console.log('todo al día');
}
