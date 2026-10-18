// Dibujo en canvas: mapa (Mercator), rutas, aviones, aeropuertos, noche y textos que flotan.
import { TIERRA, FRONTERAS } from './mapa.js';
import { AEROPUERTOS } from './datos.js';
import * as M from './modelo.js';

const RAD = Math.PI / 180;
export const proyectar = (lon, lat) => [lon, -Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) / RAD];

// Paleta por capítulo: carta antigua (1929), mitad de siglo (1946) y moderna (1970).
const PALETAS = {
  1: { mar: '#a9c7c9', mar2: '#8fb3b8', tierra: '#efe3c2', borde: '#b9a57a', costa: '#8c7a55', ruta: '#7a4b2a', texto: '#3d2c1c', hub: '#a2361d', avion: '#3d2c1c' },
  2: { mar: '#9cc3d6', mar2: '#7eabc4', tierra: '#e8e4d2', borde: '#a9a58c', costa: '#6f7d74', ruta: '#24527a', texto: '#1f2b33', hub: '#c0392b', avion: '#1f2b33' },
  3: { mar: '#a6cfe6', mar2: '#86b8d8', tierra: '#f2f1ec', borde: '#c5c3b8', costa: '#8e9aa3', ruta: '#1565c0', texto: '#1b2430', hub: '#e04f2a', avion: '#1b2430' },
};
const NOCHE = 'rgba(8, 16, 40, ';

const caminos = (() => {
  const tierra = new Path2D(), fronteras = new Path2D();
  for (const anillo of TIERRA) {
    anillo.forEach(([x, y], i) => { const [px, py] = proyectar(x / 100, y / 100); i ? tierra.lineTo(px, py) : tierra.moveTo(px, py); });
    tierra.closePath();
  }
  for (const l of FRONTERAS) l.forEach(([x, y], i) => { const [px, py] = proyectar(x / 100, y / 100); i ? fronteras.lineTo(px, py) : fronteras.moveTo(px, py); });
  return { tierra, fronteras };
})();

export const POS = Object.fromEntries(AEROPUERTOS.map((a) => [a.id, proyectar(a.lon, a.lat)]));

// Encuadra la vista del capítulo en el área que no tapan el panel ni la misión (márgenes en píxeles).
export function crearCamara(vista, W, H, m = { arriba: 0, abajo: 0, izq: 0, der: 0 }) {
  const [x0, y1] = proyectar(vista.lon0, vista.lat0), [x1, y0] = proyectar(vista.lon1, vista.lat1);
  const aw = Math.max(120, W - m.izq - m.der), ah = Math.max(120, H - m.arriba - m.abajo);
  const z = Math.min(aw / (x1 - x0), ah / (y1 - y0)) * 0.92;
  const cx = m.izq + aw / 2 - W / 2, cy = m.arriba + ah / 2 - H / 2; // corrimiento del centro útil
  return { x: (x0 + x1) / 2 - cx / z, y: (y0 + y1) / 2 - cy / z, z };
}
export const aPantalla = (cam, W, H, [x, y]) => [(x - cam.x) * cam.z + W / 2, (y - cam.y) * cam.z + H / 2];
export const aMundo = (cam, W, H, sx, sy) => [(sx - W / 2) / cam.z + cam.x, (sy - H / 2) / cam.z + cam.y];

// Curva suave de cada ruta (control desplazado al costado), para que no se pisen las líneas.
export function curva(a, b) {
  const [x0, y0] = POS[a], [x1, y1] = POS[b];
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0;
  const f = a < b ? 0.12 : -0.12;
  return [x0, y0, mx - dy * f, my + dx * f, x1, y1];
}
export function puntoCurva([x0, y0, cx, cy, x1, y1], u) {
  const v = 1 - u;
  return [v * v * x0 + 2 * v * u * cx + u * u * x1, v * v * y0 + 2 * v * u * cy + u * u * y1, 2 * v * (cx - x0) + 2 * u * (x1 - cx), 2 * v * (cy - y0) + 2 * u * (y1 - cy)];
}

function oscuridad(h) { // 0 de día, 1 de noche, con amanecer y atardecer suaves
  if (h >= 7 && h < 19) return 0;
  if (h >= 19 && h < 21) return (h - 19) / 2;
  if (h >= 5 && h < 7) return 1 - (h - 5) / 2;
  return 1;
}

// Silueta vista desde arriba, mirando hacia +x. Las de hélice tienen alas rectas; los jets, alas en flecha.
function silueta(ctx, forma, L) {
  const flecha = forma === 'jet' || forma === 'carguero';
  ctx.beginPath(); ctx.ellipse(0, 0, L, L * 0.16, 0, 0, Math.PI * 2); ctx.fill(); // fuselaje
  ctx.beginPath();
  if (flecha) { ctx.moveTo(L * 0.25, 0); ctx.lineTo(-L * 0.3, -L * 0.95); ctx.lineTo(-L * 0.5, -L * 0.95); ctx.lineTo(-L * 0.2, 0); ctx.lineTo(-L * 0.5, L * 0.95); ctx.lineTo(-L * 0.3, L * 0.95); ctx.closePath(); }
  else { ctx.rect(L * 0.02, -L * 1.0, L * 0.3, L * 2.0); if (forma === 'biplano') ctx.rect(-L * 0.18, -L * 0.9, L * 0.22, L * 1.8); }
  ctx.moveTo(-L * 0.7, 0); ctx.lineTo(-L * 0.95, -L * 0.38); ctx.lineTo(-L * 1.02, -L * 0.38); ctx.lineTo(-L * 0.92, 0);
  ctx.lineTo(-L * 1.02, L * 0.38); ctx.lineTo(-L * 0.95, L * 0.38); ctx.closePath(); // cola
  ctx.fill();
  if (forma === 'bimotor' || forma === 'cuatrimotor') { // motores
    for (const y of forma === 'bimotor' ? [-0.45, 0.45] : [-0.35, -0.7, 0.35, 0.7]) { ctx.beginPath(); ctx.ellipse(L * 0.3, L * y, L * 0.14, L * 0.07, 0, 0, 7); ctx.fill(); }
  }
}

export function dibujar(ctx, W, H, s, cam, vis, ahoraMs) {
  const pal = PALETAS[s.cap] ?? PALETAS[3];
  const h = M.hora(s), osc = oscuridad(h);
  ctx.save();
  // mar
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, pal.mar); g.addColorStop(1, pal.mar2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // tierra y fronteras
  ctx.setTransform(cam.z * vis.dpr, 0, 0, cam.z * vis.dpr, (W / 2 - cam.x * cam.z) * vis.dpr, (H / 2 - cam.y * cam.z) * vis.dpr);
  ctx.fillStyle = pal.tierra; ctx.fill(caminos.tierra);
  ctx.lineWidth = 1.2 / cam.z; ctx.strokeStyle = pal.costa; ctx.stroke(caminos.tierra);
  ctx.setLineDash([4 / cam.z, 3 / cam.z]); ctx.lineWidth = 0.8 / cam.z; ctx.strokeStyle = pal.borde; ctx.stroke(caminos.fronteras); ctx.setLineDash([]);
  ctx.setTransform(vis.dpr, 0, 0, vis.dpr, 0, 0);

  const P = (id) => aPantalla(cam, W, H, POS[id]);
  const enRed = new Set(M.nodosRed(s));
  const zoomLejos = cam.z < 9;

  // rutas
  for (const r of s.rutas) {
    const c = curva(r.a, r.b).map((v, i) => (i % 2 ? (v - cam.y) * cam.z + H / 2 : (v - cam.x) * cam.z + W / 2));
    const sel = vis.sel?.tipo === 'ruta' && vis.sel.id === r.id;
    const neto = r.ingresos - r.costos;
    ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.quadraticCurveTo(c[2], c[3], c[4], c[5]);
    ctx.lineWidth = sel ? 4 : 2.2;
    ctx.strokeStyle = r.vuelos > 3 && neto < 0 ? '#c0392b' : pal.ruta;
    ctx.globalAlpha = sel ? 1 : 0.75; ctx.stroke(); ctx.globalAlpha = 1;
    if (r.balizas) { // luces a lo largo de la ruta, que se ven de noche
      const n = Math.max(3, Math.round(r.km / 70));
      for (let i = 1; i < n; i++) {
        const [x, y] = puntoCurva(c, i / n);
        const prende = osc > 0.2 && (Math.floor(ahoraMs / 400) + i) % 3 !== 0;
        ctx.fillStyle = prende ? `rgba(255, 214, 102, ${0.5 + osc * 0.5})` : 'rgba(255, 214, 102, 0.35)';
        ctx.beginPath(); ctx.arc(x, y, prende ? 2.4 : 1.4, 0, 7); ctx.fill();
      }
    }
  }
  // vista previa de una ruta nueva
  if (vis.modo === 'nuevaRuta' && vis.origen) {
    const [x0, y0] = P(vis.origen);
    const [x1, y1] = vis.destino ? P(vis.destino) : (vis.puntero ?? [x0, y0]);
    ctx.setLineDash([7, 6]); ctx.lineWidth = 2.5; ctx.strokeStyle = vis.previaOk === false ? '#c0392b' : pal.hub;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
  }

  // noche (antes de las luces)
  if (osc > 0) { ctx.fillStyle = NOCHE + (0.55 * osc) + ')'; ctx.fillRect(0, 0, W, H); }

  // aviones
  const frac = vis.frac ?? 0;
  for (const av of s.aviones) {
    const r = s.rutas.find((x) => x.id === av.ruta);
    if (!r) continue;
    const tipo = M.AV[av.tipo];
    let x, y, ang;
    if (av.fase === 'vuelo') {
      const u = Math.min(1, Math.max(0, 1 - (av.resta - frac) / av.dur));
      const base = curva(av.en, av.hacia).map((v, i) => (i % 2 ? (v - cam.y) * cam.z + H / 2 : (v - cam.x) * cam.z + W / 2));
      const p = puntoCurva(base, u);
      [x, y] = p; ang = Math.atan2(p[3], p[2]);
    } else {
      const [ax, ay] = P(av.en), [bx, by] = P(av.hacia);
      ang = Math.atan2(by - ay, bx - ax);
      const lado = (av.id % 5) - 2;
      x = ax + Math.cos(ang) * 9 - Math.sin(ang) * lado * 4; y = ay + Math.sin(ang) * 9 + Math.cos(ang) * lado * 4;
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.shadowColor = osc > 0.5 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 3;
    ctx.fillStyle = vis.sel?.tipo === 'avion' && vis.sel.id === av.id ? pal.hub : (osc > 0.5 ? '#e8edf5' : pal.avion);
    silueta(ctx, tipo.forma, zoomLejos ? 8 : 10);
    ctx.shadowBlur = 0;
    if (osc > 0.3 && av.fase === 'vuelo' && Math.floor(ahoraMs / 600 + av.id) % 2) {
      ctx.fillStyle = '#ff5252'; ctx.beginPath(); ctx.arc(0, -9, 1.6, 0, 7); ctx.fill();
      ctx.fillStyle = '#69f0ae'; ctx.beginPath(); ctx.arc(0, 9, 1.6, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  // aeropuertos (los nombres se dibujan de la ciudad más grande a la más chica y se saltean si pisan otro)
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const ocupado = [];
  const pisa = (r) => ocupado.some((o) => r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1]);
  for (const a of [...AEROPUERTOS].sort((x, y) => (y.id === 'BUE') - (x.id === 'BUE') || y.peso - x.peso)) {
    if (!M.ciudadDisponible(s, a.id)) continue; // las ciudades aparecen con su capítulo o su misión
    const [x, y] = P(a.id);
    if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue;
    const enLaRed = enRed.has(a.id);
    const rad = 3 + Math.sqrt(a.peso) * 0.55;
    const sel = vis.sel?.tipo === 'ap' && vis.sel.id === a.id;
    if (osc > 0.2 && enLaRed) { // luces de la ciudad
      const gl = ctx.createRadialGradient(x, y, 0, x, y, rad * 4);
      gl.addColorStop(0, `rgba(255, 220, 140, ${0.55 * osc})`); gl.addColorStop(1, 'rgba(255, 220, 140, 0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, rad * 4, 0, 7); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 7);
    ctx.fillStyle = enLaRed ? (a.id === 'BUE' ? pal.hub : pal.ruta) : 'rgba(255,255,255,0.85)';
    ctx.fill(); ctx.lineWidth = sel ? 3 : 1.5; ctx.strokeStyle = sel ? '#ffb300' : (osc > 0.5 ? '#dfe6f0' : pal.texto); ctx.stroke();
    if (enLaRed) { // carga en transbordo (arco naranja) respecto de la capacidad por hora
      const tb = M.enTransbordo(s, a.id), cap = M.capacidadTransbordo(s, a.id);
      if (tb > 0) {
        const f = Math.min(1, tb / (cap * 3));
        ctx.beginPath(); ctx.arc(x, y, rad + 4, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2);
        ctx.lineWidth = 3; ctx.strokeStyle = f > 0.66 ? '#e53935' : '#fb8c00'; ctx.stroke();
      }
    }
    const mostrar = sel || enLaRed || !zoomLejos || a.peso >= 25 || vis.modo === 'nuevaRuta';
    if (mostrar) {
      ctx.font = `${enLaRed ? 600 : 500} ${zoomLejos ? 11 : 12}px system-ui, sans-serif`;
      const [tx, ty, al] = a.etq === 'der' ? [x + rad + 4, y - 7, 'left'] : a.etq === 'izq' ? [x - rad - 4, y - 7, 'right'] : a.etq === 'arr' ? [x, y - rad - 16, 'center'] : [x, y + rad + 3, 'center'];
      const w = ctx.measureText(a.nombre).width, x0 = al === 'left' ? tx : al === 'right' ? tx - w : tx - w / 2;
      const caja = [x0 - 2, ty - 1, x0 + w + 2, ty + 14];
      if (!sel && pisa(caja)) continue;
      ocupado.push(caja);
      ctx.textAlign = al; ctx.lineJoin = 'round';
      ctx.lineWidth = 3; ctx.strokeStyle = osc > 0.5 ? 'rgba(8,16,40,0.8)' : 'rgba(255,255,255,0.85)';
      ctx.strokeText(a.nombre, tx, ty);
      ctx.fillStyle = osc > 0.5 ? '#f1f4f9' : pal.texto; ctx.fillText(a.nombre, tx, ty);
    }
  }

  // textos que flotan (cobros)
  ctx.font = '700 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  for (const f of vis.flotan) {
    const edad = (ahoraMs - f.t0) / 1400;
    if (edad >= 1) continue;
    const [x, y] = P(f.ap);
    ctx.globalAlpha = 1 - edad; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.strokeText(f.txt, x, y - 18 - edad * 22); ctx.fillStyle = f.color ?? '#2e7d32';
    if (osc > 0.5 && !f.color) ctx.fillStyle = '#9cff9c';
    ctx.fillText(f.txt, x, y - 18 - edad * 22); ctx.globalAlpha = 1;
  }
  vis.flotan = vis.flotan.filter((f) => ahoraMs - f.t0 < 1400);
  ctx.restore();
}

// Qué hay bajo el puntero: aeropuerto, avión o ruta.
export function tocar(s, cam, W, H, sx, sy) {
  let mejor = null, dmin = 18;
  for (const a of AEROPUERTOS) {
    if (!M.ciudadDisponible(s, a.id)) continue;
    const [x, y] = aPantalla(cam, W, H, POS[a.id]);
    const d = Math.hypot(x - sx, y - sy);
    if (d < dmin) { dmin = d; mejor = { tipo: 'ap', id: a.id }; }
  }
  if (mejor) return mejor;
  for (const r of s.rutas) {
    const c = curva(r.a, r.b).map((v, i) => (i % 2 ? (v - cam.y) * cam.z + H / 2 : (v - cam.x) * cam.z + W / 2));
    for (let i = 0; i <= 24; i++) {
      const [x, y] = puntoCurva(c, i / 24);
      if (Math.hypot(x - sx, y - sy) < 9) return { tipo: 'ruta', id: r.id };
    }
  }
  return null;
}
