// Variante C: canvas 2D OPTIMIZADO (copia de laboratorio de js/render.js: dibujar). Mismo resultado visual, sin cambiar de tecnología:
//  · capa fija (mar, tierra, fronteras, rutas) en un lienzo aparte: se redibuja solo si cambia la cámara o una ruta;
//  · aviones con drawImage desde un atlas (sin trazar vectores ni shadowBlur por avión y por cuadro);
//  · balizas y luces de navegación en 2 trazados por color (en vez de un fill por punto); medidas de texto en caché.
import { TIERRA, FRONTERAS } from '../../js/mapa.js';
import { AEROPUERTOS } from '../../js/datos.js';
import * as M from '../../js/modelo.js';
import { proyectar, curva, puntoCurva, aPantalla, posAvion } from '../../js/render.js';
import { CFG, prepararEscena, montar } from './comun.js';
import { PALETAS, crearAtlas } from './atlas.js';

const escena = prepararEscena();
const { s, cam, vis } = escena;
const pal = PALETAS[s.cap] ?? PALETAS[3];
const { W, H, dpr } = CFG;
const lienzo = document.getElementById('mapa');
lienzo.width = W * dpr; lienzo.height = H * dpr; lienzo.style.width = W + 'px'; lienzo.style.height = H + 'px';
const ctx = lienzo.getContext('2d');
const fijo = document.createElement('canvas'); fijo.width = W * dpr; fijo.height = H * dpr; const cf = fijo.getContext('2d');
const atlas = crearAtlas(pal, Math.max(2, Math.ceil(dpr))); const SC = atlas.sc;
const ESC = 1 / SC;

const caminos = (() => {
  const tierra = new Path2D(), fronteras = new Path2D();
  for (const anillo of TIERRA) { anillo.forEach(([x, y], i) => { const [px, py] = proyectar(x / 100, y / 100); i ? tierra.lineTo(px, py) : tierra.moveTo(px, py); }); tierra.closePath(); }
  for (const l of FRONTERAS) l.forEach(([x, y], i) => { const [px, py] = proyectar(x / 100, y / 100); i ? fronteras.lineTo(px, py) : fronteras.moveTo(px, py); });
  return { tierra, fronteras };
})();
const oscuridad = (h) => (h >= 7 && h < 19 ? 0 : h >= 19 && h < 21 ? (h - 19) / 2 : h >= 5 && h < 7 ? 1 - (h - 5) / 2 : 1);
const colorRuta = (r) => (r.vuelos > 3 && r.ingresos - r.costos < 0 ? '#c0392b' : pal.ruta);
const firmaRutas = () => s.rutas.map((r) => r.id + colorRuta(r) + (vis.sel?.tipo === 'ruta' && vis.sel.id === r.id ? 's' : '')).join();

let firmaCapa = '', rutasPantalla = [], msCapa = 0;
function capaFija() {
  const f = `${cam.x}|${cam.y}|${cam.z}|${firmaRutas()}`;
  if (f === firmaCapa) return; firmaCapa = f;
  const t0 = performance.now();
  cf.setTransform(1, 0, 0, 1, 0, 0);
  const g = cf.createLinearGradient(0, 0, 0, H * dpr); g.addColorStop(0, pal.mar); g.addColorStop(1, pal.mar2);
  cf.fillStyle = g; cf.fillRect(0, 0, W * dpr, H * dpr);
  cf.setTransform(cam.z * dpr, 0, 0, cam.z * dpr, (W / 2 - cam.x * cam.z) * dpr, (H / 2 - cam.y * cam.z) * dpr);
  cf.fillStyle = pal.tierra; cf.fill(caminos.tierra);
  cf.lineWidth = 1.2 / cam.z; cf.strokeStyle = pal.costa; cf.stroke(caminos.tierra);
  cf.setLineDash([4 / cam.z, 3 / cam.z]); cf.lineWidth = 0.8 / cam.z; cf.strokeStyle = pal.borde; cf.stroke(caminos.fronteras); cf.setLineDash([]);
  cf.setTransform(dpr, 0, 0, dpr, 0, 0);
  rutasPantalla = [];
  for (const r of s.rutas) {
    const c = curva(r.a, r.b).map((v, i) => (i % 2 ? (v - cam.y) * cam.z + H / 2 : (v - cam.x) * cam.z + W / 2));
    rutasPantalla.push({ r, c });
    const sel = vis.sel?.tipo === 'ruta' && vis.sel.id === r.id;
    cf.beginPath(); cf.moveTo(c[0], c[1]); cf.quadraticCurveTo(c[2], c[3], c[4], c[5]);
    cf.lineWidth = sel ? 4 : 2.2; cf.strokeStyle = colorRuta(r); cf.globalAlpha = sel ? 1 : 0.75; cf.stroke(); cf.globalAlpha = 1;
  }
  msCapa = performance.now() - t0;
}

const anchoTexto = new Map();
function ancho(fuente, texto) { const k = fuente + texto; let w = anchoTexto.get(k); if (w === undefined) { ctx.font = fuente; w = ctx.measureText(texto).width; anchoTexto.set(k, w); } return w; }
const marcoDe = (m) => atlas.marcos[m];

function dibujar(ahoraMs) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const h = M.hora(s), osc = oscuridad(h), frac = vis.frac ?? 0, zoomLejos = cam.z < 9;
  capaFija();
  ctx.drawImage(fijo, 0, 0, W, H);
  // balizas de noche: dos trazados (encendidas / apagadas)
  let nOn = 0;
  const on = new Path2D(), off = new Path2D();
  for (const { r, c } of rutasPantalla) {
    if (!r.balizas) continue;
    const n = Math.max(3, Math.round(r.km / 70));
    for (let i = 1; i < n; i++) {
      const [x, y] = puntoCurva(c, i / n), prende = osc > 0.2 && (Math.floor(ahoraMs / 400) + i) % 3 !== 0;
      const p = prende ? on : off; p.moveTo(x + (prende ? 2.4 : 1.4), y); p.arc(x, y, prende ? 2.4 : 1.4, 0, 7); nOn += prende;
    }
  }
  ctx.fillStyle = `rgba(255, 214, 102, ${0.5 + osc * 0.5})`; ctx.fill(on);
  ctx.fillStyle = 'rgba(255, 214, 102, 0.35)'; ctx.fill(off);
  if (osc > 0) { ctx.fillStyle = 'rgba(8, 16, 40, ' + (0.55 * osc) + ')'; ctx.fillRect(0, 0, W, H); }
  // aviones desde el atlas
  const esc = ESC * (zoomLejos ? 8 : 10) / 10, rojo = new Path2D(), verde = new Path2D(), noche = osc > 0.5;
  for (const av of s.aviones) {
    const [x, y, ang] = posAvion(cam, W, H, av, frac);
    const sel = vis.sel?.tipo === 'avion' && vis.sel.id === av.id;
    const m = marcoDe(`${M.AV[av.tipo].forma}.${sel ? 'sel' : noche ? 'noche' : 'dia'}`), cs = Math.cos(ang) * esc, sn = Math.sin(ang) * esc;
    ctx.setTransform(cs * dpr, sn * dpr, -sn * dpr, cs * dpr, x * dpr, y * dpr);
    ctx.drawImage(atlas.canvas, m.x, m.y, m.w, m.h, -m.w / 2, -m.h / 2, m.w, m.h);
    if (osc > 0.3 && av.fase === 'vuelo' && Math.floor(ahoraMs / 600 + av.id) % 2) {
      const c1 = Math.cos(ang), s1 = Math.sin(ang);
      rojo.moveTo(x + 9 * s1 + 1.6, y - 9 * c1); rojo.arc(x + 9 * s1, y - 9 * c1, 1.6, 0, 7);
      verde.moveTo(x - 9 * s1 + 1.6, y + 9 * c1); verde.arc(x - 9 * s1, y + 9 * c1, 1.6, 0, 7);
    }
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#ff5252'; ctx.fill(rojo); ctx.fillStyle = '#69f0ae'; ctx.fill(verde);
  // aeropuertos
  const enRed = new Set(M.nodosRed(s)), ocupado = [], pisa = (r) => ocupado.some((o) => r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1]);
  ctx.lineJoin = 'round';
  for (const a of [...AEROPUERTOS].sort((x, y) => (y.id === 'BUE') - (x.id === 'BUE') || y.peso - x.peso)) {
    if (!M.ciudadDisponible(s, a.id)) continue;
    const [x, y] = aPantalla(cam, W, H, proyectar(a.lon, a.lat));
    if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue;
    const enLaRed = enRed.has(a.id), rad = 3 + Math.sqrt(a.peso) * 0.55, sel = vis.sel?.tipo === 'ap' && vis.sel.id === a.id;
    if (osc > 0.2 && enLaRed) { const b = marcoDe('brillo'), R = rad * 4; ctx.globalAlpha = 0.55 * osc; ctx.drawImage(atlas.canvas, b.x, b.y, b.w, b.h, x - R, y - R, R * 2, R * 2); ctx.globalAlpha = 1; }
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 7);
    ctx.fillStyle = enLaRed ? (a.id === 'BUE' ? pal.hub : pal.ruta) : 'rgba(255,255,255,0.85)'; ctx.fill();
    ctx.lineWidth = sel ? 3 : 1.5; ctx.strokeStyle = sel ? '#ffb300' : (noche ? '#dfe6f0' : pal.texto); ctx.stroke();
    if (enLaRed) {
      const tb = M.enTransbordo(s, a.id), cap = M.capacidadTransbordo(s, a.id);
      if (tb > 0) { const f = Math.min(1, tb / (cap * 3)); ctx.beginPath(); ctx.arc(x, y, rad + 4, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = f > 0.66 ? '#e53935' : '#fb8c00'; ctx.stroke(); }
    }
    if (sel || enLaRed || !zoomLejos || a.peso >= 25 || vis.modo === 'nuevaRuta') {
      const fuente = `${enLaRed ? 600 : 500} ${zoomLejos ? 11 : 12}px system-ui, sans-serif`;
      const [tx, ty, al] = a.etq === 'der' ? [x + rad + 4, y - 7, 'left'] : a.etq === 'izq' ? [x - rad - 4, y - 7, 'right'] : a.etq === 'arr' ? [x, y - rad - 16, 'center'] : [x, y + rad + 3, 'center'];
      const w = ancho(fuente, a.nombre), x0 = al === 'left' ? tx : al === 'right' ? tx - w : tx - w / 2, caja = [x0 - 2, ty - 1, x0 + w + 2, ty + 14];
      if (!sel && pisa(caja)) continue;
      ocupado.push(caja); ctx.font = fuente; ctx.textAlign = al; ctx.textBaseline = 'top';
      ctx.lineWidth = 3; ctx.strokeStyle = noche ? 'rgba(8,16,40,0.8)' : 'rgba(255,255,255,0.85)'; ctx.strokeText(a.nombre, tx, ty);
      ctx.fillStyle = noche ? '#f1f4f9' : pal.texto; ctx.fillText(a.nombre, tx, ty);
    }
  }
}

montar({ nombre: 'canvas2d-optimizado', escena, dibujar, sincronizar: () => {}, extra: { msCapaFija: () => msCapa } });
