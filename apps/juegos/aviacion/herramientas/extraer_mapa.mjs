// Extrae costas y fronteras terrestres de Sudamérica (Natural Earth 1:50m, dominio público) para el juego.
// Uso: node herramientas/extraer_mapa.mjs <dir world-atlas> <dir topojson-client> <salida.js>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const [atlasDir, tcDir, salida] = process.argv.slice(2);
const require = createRequire(import.meta.url);
const topojson = require(path.resolve(tcDir));
const land = JSON.parse(fs.readFileSync(path.join(atlasDir, 'land-50m.json')));
const countries = JSON.parse(fs.readFileSync(path.join(atlasDir, 'countries-50m.json')));
const BB = { lon0: -95, lon1: -28, lat0: -58, lat1: 15 };
const TOL = 0.06;
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b]; const dx = bx - ax, dy = by - ay; const L = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / L; if (d > md) { md = d; mi = i; } }
    if (md > tol && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const enCaja = (ring) => ring.some(([x, y]) => x >= BB.lon0 && x <= BB.lon1 && y >= BB.lat0 && y <= BB.lat1);
const q = (ring) => ring.map(([x, y]) => [Math.round(x * 100), Math.round(y * 100)]);
const tierra = topojson.feature(land, land.objects.land);
const anillos = [];
for (const f of tierra.features ?? [tierra]) {
  const g = f.geometry; const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const p of polys) { const r = p[0]; if (!enCaja(r)) continue; const s = dp(r.slice(0, -1), TOL); if (s.length >= 3) anillos.push(q(s)); }
}
const malla = topojson.mesh(countries, countries.objects.countries, (a, b) => a !== b);
const fronteras = [];
for (const l of malla.coordinates) { if (!enCaja(l)) continue; const s = dp(l, TOL / 2); if (s.length >= 2) fronteras.push(q(s)); }
const out = `// Generado por herramientas/extraer_mapa.mjs desde Natural Earth 1:50m (dominio público, naturalearthdata.com) vía world-atlas 2.0.2.\n` +
  `// Coordenadas en centésimas de grado [lon, lat]. Solo costas y fronteras terrestres compartidas; sin nombres de territorios.\n` +
  `export const TIERRA = ${JSON.stringify(anillos)};\nexport const FRONTERAS = ${JSON.stringify(fronteras)};\n`;
fs.writeFileSync(salida, out);
console.log('anillos', anillos.length, 'puntos', anillos.reduce((s, r) => s + r.length, 0), 'fronteras', fronteras.length, 'bytes', out.length);
