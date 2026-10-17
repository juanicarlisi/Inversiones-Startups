// Andén · visión «Experiencia» · medición propia (17-10-2026)
// Tres vistas del MISMO reproductor de traza: plano 2D (Canvas), 2,5D isométrica (Canvas, sin GPU, con sprites horneados)
// y 3D (three.js, instancias). Maqueta de medición: lo que importa es cuánto cuesta cada cuadro, no la terminación visual.
import { ESTADO } from './reproductor.mjs';

const COLOR = ['#c8955a', '#d49f5f', '#e6b450', '#c8955a', '#ff6a3d', '#c8955a', '#9a6bff'];
const limites = (G) => ({ x0: -34, x1: G.Lr + G.R + 8, y0: -24, y1: 2 * G.R + 10 });

// ---------------------------------------------------------------- 2D
export class Vista2D {
  constructor(canvas, rep) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.rep = rep; const G = rep.G; const b = limites(G);
    this.k = Math.min(canvas.width / (b.x1 - b.x0), canvas.height / (b.y1 - b.y0)); this.ox = -b.x0 * this.k; this.oy = canvas.height + b.y0 * this.k;
    this.fondo = document.createElement('canvas'); this.fondo.width = canvas.width; this.fondo.height = canvas.height; this.hornear();
  }
  X(x) { return this.ox + x * this.k; } Y(y) { return this.oy - y * this.k; }
  hornear() {
    const g = this.fondo.getContext('2d'), G = this.rep.G, k = this.k;
    g.fillStyle = '#f4f2ee'; g.fillRect(0, 0, this.fondo.width, this.fondo.height);
    g.strokeStyle = '#e4e0d8'; g.lineWidth = 1; for (let x = -34; x < 90; x += 5) { g.beginPath(); g.moveTo(this.X(x), 0); g.lineTo(this.X(x), this.fondo.height); g.stroke(); }
    g.strokeStyle = '#9aa3ad'; g.lineWidth = 1.1 * k; g.beginPath();
    for (let s = 0; s <= G.L; s += 0.5) { const p = G.enLazo(s); s === 0 ? g.moveTo(this.X(p[0]), this.Y(p[1])) : g.lineTo(this.X(p[0]), this.Y(p[1])); } g.closePath(); g.stroke();
    g.strokeStyle = '#b9b2a6'; g.lineWidth = 0.6 * k; for (const c of this.rep.cintas) { g.beginPath(); c.pts.forEach((p, i) => i ? g.lineTo(this.X(p[0]), this.Y(p[1])) : g.moveTo(this.X(p[0]), this.Y(p[1]))); g.stroke(); }
    g.fillStyle = '#5b6470'; for (const a of G.andenes) g.fillRect(this.X(a.x - 1.5), this.Y(a.y), 3 * k, 3 * k);
  }
  dibujar(t) {
    const rep = this.rep, G = rep.G, ctx = this.ctx, k = this.k; rep.ir(t); const n = rep.posiciones(t);
    ctx.drawImage(this.fondo, 0, 0);
    const NR = G.rampas.length;
    for (let r = 0; r <= NR; r++) { const R = r < NR ? G.rampas[r] : G.excepcion, o = rep.ocupRampa[r];
      ctx.fillStyle = o > 0.95 ? '#e0483c' : o > 0.6 ? '#f0a742' : '#7fb77e'; const y0 = R.lado > 0 ? R.y + 0.8 : R.y - 0.8 - 2.6;
      ctx.fillRect(this.X(R.x - 0.7), this.Y(y0 + 2.6), 1.4 * k, 2.6 * k); }
    for (let r = 0; r < NR; r++) { const R = G.rampas[r], h = 1.2 * rep.nivelJaula[r]; const y0 = R.lado > 0 ? R.y + 4 : R.y - 4 - 1.2;
      ctx.strokeStyle = '#8c8c8c'; ctx.strokeRect(this.X(R.x - 0.6), this.Y(y0 + 1.2), 1.2 * k, 1.2 * k); ctx.fillStyle = '#b07a43'; ctx.fillRect(this.X(R.x - 0.6), this.Y(y0 + h), 1.2 * k, h * k); }
    ctx.fillStyle = '#d3d8de'; const tb = 0.5 * k; for (let j = 0; j < G.T; j++) ctx.fillRect(this.X(rep.bx[j]) - tb / 2, this.Y(rep.by[j]) - tb / 2, tb, tb);
    const tp = 0.42 * k; for (let i = 0; i < n; i++) { ctx.fillStyle = COLOR[rep.est[i]]; ctx.fillRect(this.X(rep.x[i]) - tp / 2, this.Y(rep.y[i]) - tp / 2, tp, tp); }
    ctx.fillStyle = '#2f3a48'; for (const s of G.estaciones) { ctx.beginPath(); ctx.arc(this.X(s.x), this.Y(-2.2), 0.45 * k, 0, 6.283); ctx.fill(); }
    return n;
  }
}

// ---------------------------------------------------------------- 2,5D isométrica (Canvas 2D, sin GPU)
export class VistaIso {
  constructor(canvas, rep, { yaw = 24, elev = 38 } = {}) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.rep = rep; const G = rep.G;
    const a = yaw * Math.PI / 180, e = elev * Math.PI / 180; this.ca = Math.cos(a); this.sa = Math.sin(a); this.se = Math.sin(e); this.ce = Math.cos(e);
    const b = limites(G); let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
    for (const [x, y] of [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]]) { const u = x * this.ca - y * this.sa, w = x * this.sa + y * this.ca; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, w * this.se); v1 = Math.max(v1, w * this.se + 4 * this.ce); }
    this.k = Math.min(canvas.width / (u1 - u0), canvas.height / (v1 - v0)) * 0.98; this.ox = -u0 * this.k + (canvas.width - (u1 - u0) * this.k) / 2; this.oy = canvas.height - (-v0 * this.k) - 8;
    this.sprites = COLOR.map((c) => this.spriteCaja(0.42, 0.34, 0.28, c));
    this.spritePersona = this.spriteCaja(0.5, 0.5, 1.7, '#2f3a48');
    this.fondo = document.createElement('canvas'); this.fondo.width = canvas.width; this.fondo.height = canvas.height; this.hornear();
    this.orden = new Int32Array(1 << 16); this.clave = new Float32Array(1 << 16);
  }
  P(x, y, z, out) { const u = x * this.ca - y * this.sa, w = x * this.sa + y * this.ca; out[0] = this.ox + u * this.k; out[1] = this.oy - (w * this.se + z * this.ce) * this.k; }
  prof(x, y) { return x * this.sa + y * this.ca; }
  caja(g, x, y, z, sx, sy, sz, color) {
    const o = [0, 0], q = (pts, f) => { g.beginPath(); pts.forEach(([px, py, pz], i) => { this.P(px, py, pz, o); i ? g.lineTo(o[0], o[1]) : g.moveTo(o[0], o[1]); }); g.closePath(); g.fillStyle = f; g.fill(); };
    const x0 = x - sx / 2, x1 = x + sx / 2, y0 = y - sy / 2, y1 = y + sy / 2, z1 = z + sz;
    q([[x0, y0, z], [x1, y0, z], [x1, y0, z1], [x0, y0, z1]], sombra(color, 0.78));
    q([[x0, y0, z], [x0, y1, z], [x0, y1, z1], [x0, y0, z1]], sombra(color, 0.62));
    q([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], color);
  }
  spriteCaja(sx, sy, sz, color) {
    const pad = 2, w = Math.ceil((sx + sy) * this.k) + 2 * pad, h = Math.ceil((sx + sy + sz) * this.k) + 2 * pad;
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const save = [this.ox, this.oy]; const o = [0, 0]; this.ox = 0; this.oy = 0; this.P(0, 0, 0, o); this.ox = w / 2 - o[0]; this.oy = h - pad - (sx + sy) * 0.25 * this.k - o[1];
    this.caja(g, 0, 0, 0, sx, sy, sz, color); const ax = this.ox, ay = this.oy; [this.ox, this.oy] = save; return { c, ax, ay };
  }
  hornear() {
    const g = this.fondo.getContext('2d'), G = this.rep.G, o = [0, 0];
    const grad = g.createLinearGradient(0, 0, 0, this.fondo.height); grad.addColorStop(0, '#e9edf1'); grad.addColorStop(1, '#d9dee4'); g.fillStyle = grad; g.fillRect(0, 0, this.fondo.width, this.fondo.height);
    const b = limites(G); g.strokeStyle = 'rgba(120,130,140,0.18)'; g.lineWidth = 1;
    for (let x = Math.ceil(b.x0 / 4) * 4; x <= b.x1; x += 4) { g.beginPath(); this.P(x, b.y0, 0, o); g.moveTo(o[0], o[1]); this.P(x, b.y1, 0, o); g.lineTo(o[0], o[1]); g.stroke(); }
    for (let y = Math.ceil(b.y0 / 4) * 4; y <= b.y1; y += 4) { g.beginPath(); this.P(b.x0, y, 0, o); g.moveTo(o[0], o[1]); this.P(b.x1, y, 0, o); g.lineTo(o[0], o[1]); g.stroke(); }
    // objetos estáticos ordenados por profundidad: andenes con camión, cintas, lazo, rampas, jaulas
    const est = [];
    for (const a of G.andenes) { est.push([this.prof(a.x, a.y - 4), () => { this.caja(g, a.x, a.y - 4, 0, 2.6, 7, 2.8, '#dfe3e8'); this.caja(g, a.x, a.y - 0.2, 0, 2.6, 1.4, 1.2, '#7b8794'); }]); }
    for (const c of this.rep.cintas) for (let i = 1; i < c.pts.length; i++) { const [xa, ya] = c.pts[i - 1], [xb, yb] = c.pts[i], n = Math.ceil(Math.hypot(xb - xa, yb - ya) / 1);
      for (let s = 0; s < n; s++) { const x = xa + (xb - xa) * (s + 0.5) / n, y = ya + (yb - ya) * (s + 0.5) / n; est.push([this.prof(x, y), () => this.caja(g, x, y, 0.55, 1.05, 1.05, 0.12, '#a9b0b8')]); } }
    for (let s = 0; s < G.L; s += 0.6) { const p = G.enLazo(s); est.push([this.prof(p[0], p[1]), () => this.caja(g, p[0], p[1], 0.85, 1.1, 1.1, 0.22, '#7f8b98')]); }
    const NR = G.rampas.length;
    for (let r = 0; r <= NR; r++) { const R = r < NR ? G.rampas[r] : G.excepcion; for (let q = 0; q < 3; q++) { const y = R.y + R.lado * (1.2 + q * 0.9); est.push([this.prof(R.x, y), () => this.caja(g, R.x, y, 0.75 - q * 0.18, 1.3, 0.9, 0.06, '#c3cad2')]); } }
    for (let r = 0; r < NR; r++) { const R = G.rampas[r], y = R.y + R.lado * 4.6; est.push([this.prof(R.x, y) + 0.01, () => this.caja(g, R.x, y, 0, 1.3, 1.1, 0.08, '#9aa4ae')]); }
    est.sort((p, q) => q[0] - p[0]); for (const [, f] of est) f();
  }
  dibujar(t) {
    const rep = this.rep, G = rep.G, ctx = this.ctx, o = [0, 0]; rep.ir(t); const n = rep.posiciones(t);
    ctx.drawImage(this.fondo, 0, 0);
    const NR = G.rampas.length;
    // ocupación de rampas (pintura sobre la rampa) y nivel de jaulas
    for (let r = 0; r <= NR; r++) { const v = rep.ocupRampa[r]; if (v <= 0.02) continue; const R = r < NR ? G.rampas[r] : G.excepcion;
      ctx.fillStyle = v > 0.95 ? 'rgba(224,72,60,0.85)' : v > 0.6 ? 'rgba(240,167,66,0.8)' : 'rgba(127,183,126,0.7)';
      ctx.beginPath(); const y0 = R.y + R.lado * 0.8, y1 = R.y + R.lado * (0.8 + 2.6 * v);
      this.P(R.x - 0.6, y0, 0.8, o); ctx.moveTo(o[0], o[1]); this.P(R.x + 0.6, y0, 0.8, o); ctx.lineTo(o[0], o[1]); this.P(R.x + 0.6, y1, 0.8 - 0.4 * v, o); ctx.lineTo(o[0], o[1]); this.P(R.x - 0.6, y1, 0.8 - 0.4 * v, o); ctx.lineTo(o[0], o[1]); ctx.fill(); }
    for (let r = 0; r < NR; r++) { const h = 1.1 * rep.nivelJaula[r]; if (h <= 0.01) continue; const R = G.rampas[r]; this.caja(ctx, R.x, R.y + R.lado * 4.6, 0.08, 1.1, 0.95, h, '#b8864f'); }
    // bandejas
    ctx.fillStyle = '#d7dde3'; for (let j = 0; j < G.T; j++) { this.P(rep.bx[j], rep.by[j], 1.08, o); ctx.fillRect(o[0] - 0.24 * this.k, o[1] - 0.12 * this.k, 0.48 * this.k, 0.24 * this.k); }
    // paquetes y personas: orden por profundidad y sprites horneados
    let m = 0; for (let i = 0; i < n; i++) { this.orden[m] = i; this.clave[i] = -this.prof(rep.x[i], rep.y[i]) * 4 + rep.z[i]; m++; }
    const ord = this.orden.subarray(0, m), cl = this.clave; ord.sort((a, b) => cl[a] - cl[b]);
    for (let q = 0; q < m; q++) { const i = ord[q], s = this.sprites[rep.est[i]]; this.P(rep.x[i], rep.y[i], rep.z[i], o); ctx.drawImage(s.c, Math.round(o[0] - s.ax), Math.round(o[1] - s.ay)); }
    for (const s of G.estaciones) { this.P(s.x, -2.3, 0, o); ctx.drawImage(this.spritePersona.c, Math.round(o[0] - this.spritePersona.ax), Math.round(o[1] - this.spritePersona.ay)); }
    return n;
  }
}
function sombra(hex, f) { const n = parseInt(hex.slice(1), 16); const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f); return `rgb(${r},${g},${b})`; }

// ---------------------------------------------------------------- 3D (three.js, instancias, sin sombras)
export class Vista3D {
  constructor(THREE, canvas, rep, { escala = 1, antialias = false } = {}) {
    this.THREE = THREE; this.rep = rep; const G = rep.G;
    const r = new THREE.WebGLRenderer({ canvas, antialias }); r.setPixelRatio(escala); r.setSize(canvas.width, canvas.height, false); this.r = r;
    const s = new THREE.Scene(); s.background = new THREE.Color('#e3e8ed'); this.s = s;
    const cx = (G.Lr) / 2 - 8, cam = new THREE.PerspectiveCamera(32, canvas.width / canvas.height, 0.5, 600); cam.up.set(0, 0, 1); cam.position.set(cx - 30, -95, 70); cam.lookAt(cx, -2, 0); this.cam = cam;
    s.add(new THREE.HemisphereLight(0xffffff, 0x8a8f96, 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 1.4); dl.position.set(-40, -60, 120); s.add(dl);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(260, 140), new THREE.MeshLambertMaterial({ color: 0xd9dee4 })); piso.position.set(cx, 0, 0); s.add(piso);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sc = new THREE.Vector3(1, 1, 1), Z = new THREE.Vector3(0, 0, 1);
    const fijo = (geo, color, lista) => { const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color }), lista.length);
      lista.forEach(([x, y, z, ang, sx, sy, sz], i) => { Q.setFromAxisAngle(Z, ang || 0); V.set(x, y, z); Sc.set(sx || 1, sy || 1, sz || 1); M.compose(V, Q, Sc); m.setMatrixAt(i, M); }); s.add(m); return m; };
    const lazo = []; for (let q = 0; q < G.L; q += 0.6) { const p = G.enLazo(q); lazo.push([p[0], p[1], 0.95, p[2]]); }
    fijo(new THREE.BoxGeometry(0.62, 1.15, 0.22), 0x7f8b98, lazo);
    const cintas = []; for (const c of rep.cintas) for (let i = 1; i < c.pts.length; i++) { const [xa, ya] = c.pts[i - 1], [xb, yb] = c.pts[i], L = Math.hypot(xb - xa, yb - ya);
      cintas.push([(xa + xb) / 2, (ya + yb) / 2, 0.6, Math.atan2(yb - ya, xb - xa), L, 1, 1]); }
    fijo(new THREE.BoxGeometry(1, 1.0, 0.12), 0xa9b0b8, cintas);
    fijo(new THREE.BoxGeometry(2.6, 7, 2.8), 0xdfe3e8, G.andenes.map((a) => [a.x, a.y - 4, 1.4]));
    const NR = G.rampas.length, rampasPos = [...G.rampas, G.excepcion].map((R) => [R.x, R.y + R.lado * 2.1, 0.55, 0]);
    this.rampas = fijo(new THREE.BoxGeometry(1.3, 2.6, 0.08), 0xffffff, rampasPos); this.rampas.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array((NR + 1) * 3), 3);
    this.jaulasPos = G.rampas.map((R) => [R.x, R.y + R.lado * 4.6]);
    this.jaulas = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 0.95, 1), new THREE.MeshLambertMaterial({ color: 0xb8864f }), NR); s.add(this.jaulas);
    this.bandejas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.95, 0.05), new THREE.MeshLambertMaterial({ color: 0xd7dde3 }), G.T); s.add(this.bandejas);
    this.cap = 1 << 15; this.paq = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.34, 0.28), new THREE.MeshLambertMaterial({ color: 0xffffff }), this.cap); s.add(this.paq);
    this.paq.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.cap * 3), 3);
    const pers = G.estaciones.map((e) => [e.x, -2.3, 0.85, 0, 1, 1, 1]);
    const cil = new THREE.CylinderGeometry(0.25, 0.25, 1.7, 10); cil.rotateX(Math.PI / 2); fijo(cil, 0x2f3a48, pers);
    this.col = COLOR.map((c) => new THREE.Color(c)); this.M = M; this.Q = Q; this.V = V; this.Sc = Sc; this.Z = Z;
    this.gl = r.getContext();
  }
  dibujar(t) {
    const rep = this.rep, G = rep.G, { M, Q, V, Sc, Z } = this; rep.ir(t); const n = Math.min(rep.posiciones(t), this.cap);
    Sc.set(1, 1, 1);
    for (let j = 0; j < G.T; j++) { Q.setFromAxisAngle(Z, rep.bang[j]); V.set(rep.bx[j], rep.by[j], 1.1); M.compose(V, Q, Sc); this.bandejas.setMatrixAt(j, M); }
    this.bandejas.instanceMatrix.needsUpdate = true;
    Q.identity(); for (let i = 0; i < n; i++) { V.set(rep.x[i], rep.y[i], rep.z[i] + 0.14); M.compose(V, Q, Sc); this.paq.setMatrixAt(i, M); this.paq.setColorAt(i, this.col[rep.est[i]]); }
    this.paq.count = n; this.paq.instanceMatrix.needsUpdate = true; this.paq.instanceColor.needsUpdate = true;
    const NR = G.rampas.length, c = new this.THREE.Color();
    for (let r = 0; r <= NR; r++) { const v = rep.ocupRampa[r]; c.set(v > 0.95 ? 0xe0483c : v > 0.6 ? 0xf0a742 : v > 0.02 ? 0x7fb77e : 0xc3cad2); this.rampas.setColorAt(r, c); }
    this.rampas.instanceColor.needsUpdate = true;
    for (let r = 0; r < NR; r++) { const h = Math.max(0.001, 1.1 * rep.nivelJaula[r]); V.set(this.jaulasPos[r][0], this.jaulasPos[r][1], h / 2); Sc.set(1, 1, h); M.compose(V, Q, Sc); this.jaulas.setMatrixAt(r, M); }
    this.jaulas.instanceMatrix.needsUpdate = true; Sc.set(1, 1, 1);
    this.r.render(this.s, this.cam); return n;
  }
  sincronizar() { this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array(4)); }
  liberar() { this.r.dispose(); }
}
