// El mapa de pared: un mapa de papel de época dibujado con la costa, el relieve y los ríos de verdad (los mismos archivos
// del juego: NOAA ETOPO 2022 y Natural Earth, dominio público), con un alfiler por ciudad de la red y un hilo por ruta.
import * as THREE from 'three';
import { AEROPUERTOS } from '../../../js/datos.js';
import mundo from '../../activos/mundo.json';
import urlCosta from '../../activos/costa.webp';
import urlAlturas from '../../activos/alturas.webp';
import { Lote, cilindro, esfera, barra, torno, pos, rot, tr, V, col, azar, lienzo, textura, limitar, suave, TAU, material } from './kit.js';

const RAD = Math.PI / 180;
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) / RAD;
const AP = Object.fromEntries(AEROPUERTOS.map((a) => [a.id, a]));
// Qué parte del continente muestra el mapa según la época (en 1929, el sur).
export function limitesDe(epoca = 1929) {
  const cap = epoca >= 1970 ? 3 : epoca >= 1936 ? 2 : 1;
  const L = cap === 1 ? { o: -80, e: -46, n: -20.5, s: -55.6 } : cap === 2 ? { o: -82, e: -38, n: -18, s: -56.5 } : { o: -84, e: -32, n: 13, s: -56.5 };
  return { ...L, cap, mN: merc(L.n), mS: merc(L.s), aspecto: (merc(L.n) - merc(L.s)) / (L.e - L.o) };
}
const aUV = (L, lon, lat) => [(lon - L.o) / (L.e - L.o), (L.mN - merc(lat)) / (L.mN - L.mS)];

// Los extremos de una ruta: el contrato trae el id «AAA-BBB» (y, si el juego los manda, a y b).
export function extremos(r) {
  const [a, b] = r.a && r.b ? [r.a, r.b] : String(r.id ?? '').split('-');
  return AP[a] && AP[b] ? [AP[a], AP[b]] : null;
}

// Lee un recorte de una imagen del juego como píxeles crudos.
async function recorte(url, sx, sy, sw, sh) {
  const blob = await (await fetch(url)).blob();
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const [c, g] = lienzo(sw, sh);
  g.drawImage(bmp, sx, sy, sw, sh, 0, 0, sw, sh);
  bmp.close?.();
  return g.getImageData(0, 0, sw, sh).data;
}
let cache = null;   // los píxeles se leen una vez por sesión (pesan poco y no tocan la GPU)
async function leerGeografia(L) {
  if (cache && cache.cap === L.cap) return cache;
  const sx = Math.max(0, Math.floor((L.o - mundo.oeste) / (mundo.este - mundo.oeste) * mundo.ancho) - 2), ex = Math.min(mundo.ancho, Math.ceil((L.e - mundo.oeste) / (mundo.este - mundo.oeste) * mundo.ancho) + 2);
  const sy = Math.max(0, Math.floor((mundo.yNorte - L.mN) / (mundo.yNorte - mundo.ySur) * mundo.alto) - 2), ey = Math.min(mundo.alto, Math.ceil((mundo.yNorte - L.mS) / (mundo.yNorte - mundo.ySur) * mundo.alto) + 2);
  const [costa, alturas] = await Promise.all([recorte(urlCosta, sx, sy, ex - sx, ey - sy), recorte(urlAlturas, sx, sy, ex - sx, ey - sy)]);
  cache = { cap: L.cap, sx, sy, w: ex - sx, h: ey - sy, costa, alturas };
  return cache;
}

// Pinta el papel: mar con líneas de agua, tierra con relieve sombreado, ríos, costa a tinta.
function pintarGeografia(g, W, H, L, geo) {
  const img = g.getImageData(0, 0, W, H), px = img.data, r = azar(3);
  const { sx, sy, w, h, costa, alturas } = geo;
  const kx = mundo.ancho / (mundo.este - mundo.oeste), ky = mundo.alto / (mundo.yNorte - mundo.ySur);
  const rango = (mundo.altMax - mundo.altMin) / 1000;
  const leer = (u, v) => {
    const i = limitar(Math.floor(u), 0, w - 2), j = limitar(Math.floor(v), 0, h - 2), fu = limitar(u - i), fv = limitar(v - j), k = (j * w + i) * 4, k2 = k + w * 4;
    const b = (c, o) => (c[k + o] * (1 - fu) + c[k + 4 + o] * fu) * (1 - fv) + (c[k2 + o] * (1 - fu) + c[k2 + 4 + o] * fu) * fv;
    return { d: (b(costa, 0) / 255 - 0.50196) * 1.00394, km: (b(alturas, 0) * 256 + b(alturas, 1)) / 65535 * rango + mundo.altMin / 1000, agua: b(alturas, 2) / 255 };
  };
  const alt = new Float32Array(W * H), dist = new Float32Array(W * H), agua = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const lon = L.o + (x + 0.5) / W * (L.e - L.o), my = L.mN - (y + 0.5) / H * (L.mN - L.mS);
    const s = leer((lon - mundo.oeste) * kx - sx - 0.5, (mundo.yNorte - my) * ky - sy - 0.5);
    alt[y * W + x] = Math.max(0, s.km); dist[y * W + x] = s.d; agua[y * W + x] = s.agua;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x, d = dist[k];
    let R, G, B;
    if (d > 0) {
      // tierra: crema que se vuelve ocre con la altura, con sombra del lado sudeste (la luz viene del noroeste)
      const t = limitar(alt[k] / 3.6) ** 0.65;
      R = 236 - 38 * t; G = 219 - 62 * t; B = 178 - 70 * t;
      const s = limitar((alt[Math.max(0, k - W - 1)] - alt[Math.min(W * H - 1, k + W + 1)]) * 1.4, -1, 1);
      const f = 1 + s * 0.2; R *= f; G *= f; B *= f;
      const a = suave(0.2, 0.75, agua[k]) * 0.85;      // ríos y lagos
      R += (104 - R) * a; G += (146 - G) * a; B += (168 - B) * a;
      const orilla = 1 - suave(0, 0.035, d);
      R += (84 - R) * orilla * 0.85; G += (62 - G) * orilla * 0.85; B += (40 - B) * orilla * 0.85;
    } else {
      R = 199; G = 214; B = 205;
      const t = -d;
      for (const [c, a] of [[0.05, 0.55], [0.13, 0.4], [0.23, 0.28], [0.35, 0.18]]) {
        const m = (1 - suave(0.006, 0.02, Math.abs(t - c))) * a;
        R += (112 - R) * m; G += (146 - G) * m; B += (156 - B) * m;
      }
      const orilla = 1 - suave(0, 0.02, t);
      R += (84 - R) * orilla * 0.85; G += (62 - G) * orilla * 0.85; B += (40 - B) * orilla * 0.85;
    }
    const grano = 0.97 + r() * 0.05;
    px[k * 4] = R * grano; px[k * 4 + 1] = G * grano; px[k * 4 + 2] = B * grano; px[k * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}

// Dibuja el mapa entero en el lienzo. fondo: lienzo con la geografía ya pintada; puede faltar (todavía cargando) y queda
// el papel con la cuadrícula.
export function dibujarMapa(g, W, H, L, fondo, { titulo, sub, pie, fuente, ciudades, red }) {
  g.fillStyle = '#e9dcb6'; g.fillRect(0, 0, W, H);
  if (fondo) g.drawImage(fondo, 0, 0);
  const X = (lon) => (lon - L.o) / (L.e - L.o) * W, Y = (lat) => (L.mN - merc(lat)) / (L.mN - L.mS) * H;
  // cuadrícula cada 5°
  g.strokeStyle = 'rgba(92,70,48,.28)'; g.lineWidth = 1; g.fillStyle = 'rgba(72,54,36,.8)'; g.font = `600 ${W * 0.0165}px ${fuente}`; g.textBaseline = 'middle';
  for (let lon = Math.ceil(L.o / 5) * 5; lon < L.e; lon += 5) { g.beginPath(); g.moveTo(X(lon), 0); g.lineTo(X(lon), H); g.stroke(); }
  for (let lat = Math.ceil(L.s / 5) * 5; lat < L.n; lat += 5) { g.beginPath(); g.moveTo(0, Y(lat)); g.lineTo(W, Y(lat)); g.stroke(); }
  // ciudades de la época
  g.textBaseline = 'middle';
  for (const c of ciudades) {
    const x = X(c.lon), y = Y(c.lat), enRed = red.has(c.id);
    g.fillStyle = '#fbf3da'; g.beginPath(); g.arc(x, y, W * 0.0062, 0, TAU); g.fill();
    g.strokeStyle = '#3c2c1c'; g.lineWidth = W * 0.0022; g.stroke();
    g.fillStyle = '#3c2c1c'; g.beginPath(); g.arc(x, y, W * 0.002, 0, TAU); g.fill();
    g.font = `${enRed ? 700 : 500} ${W * (enRed ? 0.0215 : 0.019)}px ${fuente}`;
    const dx = W * 0.016, izq = c.etq === 'izq';
    g.textAlign = c.etq === 'arr' ? 'center' : izq ? 'right' : 'left';
    const tx = c.etq === 'arr' ? x : x + (izq ? -dx : dx), ty = c.etq === 'arr' ? y - W * 0.022 : y + 1;
    g.lineWidth = W * 0.006; g.strokeStyle = 'rgba(240,226,188,.85)'; g.lineJoin = 'round'; g.strokeText(c.nombre, tx, ty);
    g.fillStyle = enRed ? '#2a1c10' : 'rgba(60,44,28,.82)'; g.fillText(c.nombre, tx, ty);
  }
  // marco: doble filete con escala blanca y negra
  const m = W * 0.022;
  g.fillStyle = '#e9dcb6'; g.fillRect(0, 0, W, m); g.fillRect(0, H - m, W, m); g.fillRect(0, 0, m, H); g.fillRect(W - m, 0, m, H);
  g.strokeStyle = '#3c2c1c'; g.lineWidth = 2; g.strokeRect(m, m, W - 2 * m, H - 2 * m); g.lineWidth = 1; g.strokeRect(m * 0.36, m * 0.36, W - m * 0.72, H - m * 0.72);
  g.fillStyle = '#3c2c1c';
  let k = 0;
  for (let lon = Math.ceil(L.o); lon < L.e; lon++, k++) if (k % 2) { g.fillRect(X(lon), m * 0.36, X(lon + 1) - X(lon), m * 0.64); g.fillRect(X(lon), H - m, X(lon + 1) - X(lon), m * 0.64); }
  k = 0;
  for (let lat = Math.ceil(L.s); lat < L.n; lat++, k++) if (k % 2) { g.fillRect(m * 0.36, Y(lat + 1), m * 0.64, Y(lat) - Y(lat + 1)); g.fillRect(W - m, Y(lat + 1), m * 0.64, Y(lat) - Y(lat + 1)); }
  g.fillStyle = '#3c2c1c'; g.font = `700 ${W * 0.017}px ${fuente}`; g.textAlign = 'left'; g.textBaseline = 'middle';
  for (let lat = Math.ceil(L.s / 5) * 5; lat < L.n; lat += 5) { g.lineWidth = 3; g.strokeStyle = '#e9dcb6'; g.strokeText(`${-lat}°`, m * 1.3, Y(lat) - W * 0.012); g.fillText(`${-lat}°`, m * 1.3, Y(lat) - W * 0.012); }
  // cartela con el título, abajo a la derecha (sobre el Atlántico)
  const cw = W * 0.4, chh = W * 0.21, cx = W - m - cw - W * 0.03, cy = H - m - chh - W * 0.035;
  g.fillStyle = 'rgba(241,231,200,.94)'; g.fillRect(cx, cy, cw, chh);
  g.strokeStyle = '#3c2c1c'; g.lineWidth = 2.5; g.strokeRect(cx, cy, cw, chh); g.lineWidth = 1; g.strokeRect(cx + 6, cy + 6, cw - 12, chh - 12);
  g.textAlign = 'center'; g.fillStyle = '#2a1c10';
  const ajustar = (txt, peso, tam, ancho) => { let s = tam; do { g.font = `${peso} ${s}px ${fuente}`; s -= 1; } while (g.measureText(txt).width > ancho && s > 8); };
  ajustar(titulo, 800, W * 0.04, cw - 30); g.fillText(titulo, cx + cw / 2, cy + chh * 0.3);
  g.strokeStyle = '#a8392c'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + cw * 0.2, cy + chh * 0.47); g.lineTo(cx + cw * 0.8, cy + chh * 0.47); g.stroke();
  ajustar(sub, 600, W * 0.027, cw - 34); g.fillStyle = '#3c2c1c'; g.fillText(sub, cx + cw / 2, cy + chh * 0.64);
  ajustar(pie, 500, W * 0.019, cw - 34); g.fillStyle = 'rgba(60,44,28,.85)'; g.fillText(pie, cx + cw / 2, cy + chh * 0.84);
  // rosa de los vientos, arriba a la derecha
  const rx = W - m - W * 0.13, ry = m + W * 0.17, rr = W * 0.085;
  g.save(); g.translate(rx, ry);
  g.strokeStyle = '#3c2c1c'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, rr * 0.62, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, rr * 0.7, 0, TAU); g.stroke();
  for (let i = 0; i < 8; i++) {
    const largo = i % 2 ? rr * 0.55 : rr;
    g.rotate(TAU / 8 * (i ? 1 : 0));
    g.fillStyle = '#3c2c1c'; g.beginPath(); g.moveTo(0, -largo); g.lineTo(rr * 0.11, 0); g.lineTo(0, 0); g.closePath(); g.fill();
    g.fillStyle = i % 2 ? '#d9c79c' : '#a8392c'; g.beginPath(); g.moveTo(0, -largo); g.lineTo(-rr * 0.11, 0); g.lineTo(0, 0); g.closePath(); g.fill(); g.stroke();
  }
  g.restore();
  g.fillStyle = '#2a1c10'; g.font = `800 ${W * 0.03}px ${fuente}`; g.textAlign = 'center'; g.fillText('N', rx, ry - rr - W * 0.022);
  // el papel envejece hacia los bordes y tiene los dobleces de haber viajado plegado
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.56);
  vg.addColorStop(0, 'rgba(120,84,40,0)'); vg.addColorStop(1, 'rgba(120,84,40,.3)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  for (const fx of [1 / 3, 2 / 3]) { const gr = g.createLinearGradient(W * fx - 5, 0, W * fx + 5, 0); gr.addColorStop(0, 'rgba(90,64,34,0)'); gr.addColorStop(0.45, 'rgba(90,64,34,.2)'); gr.addColorStop(0.55, 'rgba(255,250,230,.22)'); gr.addColorStop(1, 'rgba(255,250,230,0)'); g.fillStyle = gr; g.fillRect(W * fx - 5, 0, 10, H); }
  for (const fy of [0.25, 0.5, 0.75]) { const gr = g.createLinearGradient(0, H * fy - 5, 0, H * fy + 5); gr.addColorStop(0, 'rgba(90,64,34,0)'); gr.addColorStop(0.45, 'rgba(90,64,34,.2)'); gr.addColorStop(0.55, 'rgba(255,250,230,.22)'); gr.addColorStop(1, 'rgba(255,250,230,0)'); g.fillStyle = gr; g.fillRect(0, H * fy - 5, W, 10); }
}

export function crearMapaPared(mats, C, { ancho, altoMax = 1.42, epoca = 1929, resolucion = 896 }) {
  const L = limitesDe(epoca);
  let w = ancho, h = w * L.aspecto;
  if (h > altoMax) { h = altoMax; w = h / L.aspecto; }
  const l = new Lote(mats, 501);
  // varillas con perillas torneadas, cordón y clavo
  for (const sy of [1, -1]) {
    l.mas(cilindro(0.015, w + 0.07, 10).rotateZ(Math.PI / 2), 'barniz', C.nogalOscuro, pos(0, sy * (h / 2 + 0.006), 0.02), { veta: 0 });
    for (const sx of [-1, 1]) l.mas(torno([[0, 0], [0.012, 0.002], [0.019, 0.012], [0.014, 0.024], [0.008, 0.028], [0.013, 0.036], [0, 0.044]], 10).rotateZ(-sx * Math.PI / 2), 'barniz', C.nogalOscuro, pos(sx * (w / 2 + 0.035), sy * (h / 2 + 0.006), 0.02));
  }
  const clavo = V(0, h / 2 + 0.2, 0.012);
  for (const sx of [-1, 1]) l.mas(barra(V(sx * (w / 2 - 0.06), h / 2 + 0.018, 0.02), clavo, 0.0028, 5), 'mate', '#cdb98a');
  l.mas(esfera(0.011, 10, 8), 'metal', '#c9a04e', pos(clavo.x, clavo.y, clavo.z + 0.006));
  const grupo = l.armar({ nombre: 'mapa' });
  const W = resolucion, H = Math.round(resolucion * h / w), [lz, ctx] = lienzo(W, H);
  const tex = textura(lz, { repetir: false, aniso: 8 });
  const matPapel = material({ map: tex, roughness: 0.93 });
  // el papel, apenas combado (cuelga de la varilla)
  const gp = new THREE.PlaneGeometry(w, h, 12, 8), P = gp.attributes.position;
  for (let i = 0; i < P.count; i++) { const u = P.getX(i) / (w / 2), v = P.getY(i) / (h / 2); P.setZ(i, 0.012 + 0.006 * (1 - u * u) * (0.4 + 0.6 * (1 - v * v))); }
  gp.computeVertexNormals();
  const papel = new THREE.Mesh(gp, matPapel); papel.receiveShadow = true; papel.castShadow = true; grupo.add(papel);
  const zPapel = (x, y) => 0.012 + 0.006 * (1 - (x / (w / 2)) ** 2) * (0.4 + 0.6 * (1 - (y / (h / 2)) ** 2));
  const red = new THREE.Group(); grupo.add(red);
  const geoCabeza = esfera(0.0115, 12, 10), geoAguja = cilindro(0.0012, 0.026, 5).rotateX(Math.PI / 2), geoBase = torno([[0, 0], [0.014, 0.002], [0.0175, 0.008], [0.014, 0.015], [0, 0.018]], 14).rotateX(Math.PI / 2), geoCuenta = esfera(0.0052, 8, 6);
  const matCabeza = material({ color: col('#f3ead2'), roughness: 0.22 });
  const matBase = material({ color: col('#e7b84a'), roughness: 0.28, metalness: 1 });
  const matAguja = material({ color: col('#b9b9b0'), roughness: 0.3, metalness: 1 });
  const matCuenta = material({ color: col('#f0c865'), roughness: 0.3, metalness: 1, emissive: col('#ffb84a'), emissiveIntensity: 0 });
  let fondo = null, ultimo = null, hilos = new Map(), vivo = true, colorHilos = null;
  const lugar = (ap) => { const [u, v] = aUV(L, ap.lon, ap.lat), x = (u - 0.5) * w, y = (0.5 - v) * h; return V(x, y, zPapel(x, y)); };

  function dibujar(d) {
    ultimo = d;
    const enRed = new Set();
    for (const r of d.rutas ?? []) { const e = extremos(r); if (e) { enRed.add(e[0].id); enRed.add(e[1].id); } }
    dibujarMapa(ctx, W, H, L, fondo, { titulo: d.titulo, sub: d.sub, pie: d.pie, fuente: d.fuente, ciudades: AEROPUERTOS.filter((a) => a.cap <= L.cap), red: enRed });
    tex.needsUpdate = true;
  }
  // Alfileres e hilos según las rutas de verdad. base: id de la ciudad base (lleva el alfiler dorado).
  function ponerRed(rutas, colorEmpresa, base = 'BUE') {
    for (const o of [...red.children]) { red.remove(o); if (o.userData.propio) { o.geometry.dispose(); o.material.dispose(); } }
    hilos = new Map();
    const puestas = new Map(), r = azar(9);
    const alfiler = (ap) => {
      if (puestas.has(ap.id)) return puestas.get(ap.id);
      const p = lugar(ap), esBase = ap.id === base, punta = p.clone().add(V((r() - 0.5) * 0.005, 0.003 + r() * 0.003, 0.028));
      const a = new THREE.Mesh(geoAguja, matAguja); a.position.copy(p).lerp(punta, 0.5); a.quaternion.setFromUnitVectors(V(0, 0, 1), punta.clone().sub(p).normalize()); red.add(a);
      const c = new THREE.Mesh(esBase ? geoBase : geoCabeza, esBase ? matBase : matCabeza); c.position.copy(punta); c.castShadow = true; red.add(c);
      puestas.set(ap.id, punta);
      return punta;
    };
    for (const ruta of rutas ?? []) {
      const e = extremos(ruta); if (!e) continue;
      const a = alfiler(e[0]), b = alfiler(e[1]);
      const mat = material({ color: col(colorEmpresa), roughness: 0.75, emissive: col(colorEmpresa), emissiveIntensity: 0 });
      const hilo = new THREE.Mesh(barra(a, b, 0.0032, 6), mat); hilo.castShadow = true; hilo.userData.propio = true; red.add(hilo);
      hilos.set(ruta.id, { mat, a, b, luces: !!ruta.luces, fuerza: 0, meta: 0 });
      if (ruta.luces) {
        // ruta con luces: cuentas doradas a lo largo del hilo
        const n = Math.max(2, Math.round(a.distanceTo(b) / 0.045));
        for (let i = 1; i < n; i++) { const q = new THREE.Mesh(geoCuenta, matCuenta); q.position.copy(a).lerp(b, i / n); red.add(q); }
      }
    }
    if (!puestas.size && AP[base]) alfiler(AP[base]);
  }
  function resaltar(id) { for (const [k, hh] of hilos) hh.meta = k === id ? 1 : 0; }
  function pintarHilos(color) { for (const hh of hilos.values()) { hh.mat.color.set(color); hh.mat.emissive.set(color); } }
  function actualizar(dt, tiempo, noche) {
    for (const hh of hilos.values()) { hh.fuerza += (hh.meta - hh.fuerza) * Math.min(1, dt * 8); hh.mat.emissiveIntensity = hh.fuerza * (0.9 + 0.5 * Math.sin(tiempo * 6)); }
    matCuenta.emissiveIntensity = noche * (0.7 + 0.3 * Math.sin(tiempo * 2.2));
  }
  // la costa y el relieve llegan después (ya están en la caché del navegador: son los archivos del juego)
  const listo = leerGeografia(L).then((x) => {
    if (!vivo) return;
    const [lf, gf] = lienzo(W, H); pintarGeografia(gf, W, H, L, x); fondo = lf;      // se pinta una vez; después solo se copia
    if (ultimo) dibujar(ultimo);
  }).catch(() => { /* sin geografía: queda el papel con la cuadrícula */ });
  function liberar() { vivo = false; for (const x of [geoCabeza, geoAguja, geoBase, geoCuenta, matCabeza, matBase, matAguja, matCuenta]) x.dispose(); }
  return { grupo, w, h, dibujar, ponerRed, resaltar, pintarHilos, actualizar, lugar, listo, liberar };
}
