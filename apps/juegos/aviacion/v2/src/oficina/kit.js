// Caja de herramientas de la oficina: piezas fundidas por material con color por vértice, texturas hechas por código
// (madera, piso, yeso, alfombra) y materiales. Todo liviano: ninguna imagen se descarga para los muebles.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const col = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);
export const M4 = () => new THREE.Matrix4();
export const pos = (x, y, z) => M4().makeTranslation(x, y, z);
export const rot = (x, y, z) => M4().makeRotationFromEuler(new THREE.Euler(x, y, z));
export const esc = (x, y, z) => M4().makeScale(x, y ?? x, z ?? x);
export const tr = (...ms) => ms.reduce((a, b) => a.multiply(b), M4());
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const limitar = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const mezclar = (a, b, t) => a + (b - a) * t;
export const suave = (a, b, x) => { const t = limitar((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const TAU = Math.PI * 2;

// Azar con semilla: la oficina sale siempre igual.
export function azar(semilla) {
  let a = (semilla >>> 0) || 1;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── formas ──
// Caja con cantos redondeados (los cantos agarran la luz: nada de cajas planas). seg = 1 es un chaflán; 2 o más, redondo.
export const caja = (w, h, d, r = 0.006, seg = 1) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
// Pieza torneada: perfil = [[radio, altura], …] de abajo hacia arriba.
export const torno = (perfil, seg = 20) => new THREE.LatheGeometry(perfil.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), seg);
export const cilindro = (r, h, seg = 14, r2 = r) => new THREE.CylinderGeometry(r2, r, h, seg);
export const esfera = (r, a = 14, b = 10) => new THREE.SphereGeometry(r, a, b);
// Barra entre dos puntos.
export function barra(a, b, r, seg = 6) {
  const d = new THREE.Vector3().subVectors(b, a), l = d.length();
  const g = new THREE.CylinderGeometry(r, r, l, seg, 1, false);
  g.applyMatrix4(M4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())));
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
}
// Alambre o caño que sigue una curva suave por varios puntos.
export function cano(puntos, r, seg = 24, lados = 6, cerrado = false) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(puntos, cerrado, 'catmullrom', 0.5), seg, r, lados, cerrado);
}
// Placa plana con esquinas redondeadas (en el plano XY, con espesor en Z) y canto biselado.
export function placa(w, h, radio, espesor, bisel = 0) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2, r = Math.min(radio, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: espesor, bevelEnabled: bisel > 0, bevelThickness: bisel, bevelSize: bisel, bevelSegments: 2, curveSegments: 5 });
  g.translate(0, 0, -espesor / 2);
  return g;
}

// UV según la posición (en metros): la veta corre por el eje más largo de la pieza y tiene la misma densidad en todo el cuarto.
function uvMundo(g, escU, escV, eje, r) {
  g.computeBoundingBox();
  const t = g.boundingBox.getSize(new THREE.Vector3()), dims = [t.x, t.y, t.z];
  const veta = eje ?? dims.indexOf(Math.max(...dims));
  const p = g.attributes.position.array, n = g.attributes.normal.array;
  const uv = new Float32Array(p.length / 3 * 2);
  const du = r(), dv = r();
  for (let i = 0; i < p.length; i += 9) {
    const nx = Math.abs(n[i] + n[i + 3] + n[i + 6]), ny = Math.abs(n[i + 1] + n[i + 4] + n[i + 7]), nz = Math.abs(n[i + 2] + n[i + 5] + n[i + 8]);
    const a = nx >= ny && nx >= nz ? 0 : ny >= nz ? 1 : 2;
    const otros = [0, 1, 2].filter((k) => k !== a);
    const ku = otros.includes(veta) ? veta : otros[0], kv = otros.find((k) => k !== ku);
    for (let k = 0; k < 3; k++) { uv[(i / 3 + k) * 2] = p[i + k * 3 + ku] * escU + du; uv[(i / 3 + k) * 2 + 1] = p[i + k * 3 + kv] * escV + dv; }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// Junta piezas por material; el color va por vértice (un material sirve para muchos colores) y todo queda en pocas mallas.
export class Lote {
  constructor(mats, semilla = 7) { this.mats = mats; this.porMat = new Map(); this.r = azar(semilla); }
  // geo: geometría · mat: nombre del material · color: hex · m: matriz · op: { veta: eje 0|1|2, uv: false para dejar los UV de la geometría }
  mas(geo, mat, color = '#ffffff', m = null, op = {}) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    geo.dispose();
    if (m) g.applyMatrix4(m);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    const def = this.mats[mat];
    if (!def) throw new Error(`material desconocido: ${mat}`);
    if (def.userData.uvMundo && op.uv !== false) uvMundo(g, def.userData.uvMundo[0], def.userData.uvMundo[1], op.veta, this.r);
    else if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    const c = color.isColor ? color : col(color), n = g.attributes.position.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    g.morphAttributes = {};
    if (!this.porMat.has(mat)) this.porMat.set(mat, []);
    this.porMat.get(mat).push(g);
    return this;
  }
  // Devuelve un grupo con una malla por material.
  armar({ sombra = true, recibe = true, nombre = '' } = {}) {
    const grupo = new THREE.Group(); grupo.name = nombre;
    for (const [mat, gs] of this.porMat) {
      const g = gs.length === 1 ? gs[0] : mergeGeometries(gs, false);
      if (gs.length > 1) for (const x of gs) x.dispose();
      const def = this.mats[mat], malla = new THREE.Mesh(g, def);
      malla.castShadow = sombra && !def.userData.sinSombra; malla.receiveShadow = recibe && !def.userData.sinSombra;
      malla.name = `${nombre}:${mat}`;
      grupo.add(malla);
    }
    this.porMat.clear();
    return grupo;
  }
}

// ── texturas hechas por código ──
function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function textura(c, { repetir = true, color = true, aniso = 4 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}
export { lienzo, textura };

// Veta de madera clara (el tono lo da el color del vértice). Se repite sin costuras: las vetas cierran con ondas de período entero.
export function texturaMadera(tam = 512) {
  const [c, g] = lienzo(tam, tam), r = azar(31);
  g.fillStyle = '#e9dccb'; g.fillRect(0, 0, tam, tam);
  // manchas anchas de tono
  for (let i = 0; i < 26; i++) {
    const y = r() * tam, h = 10 + r() * 60;
    g.fillStyle = `rgba(${r() < 0.5 ? '120,84,52' : '255,246,230'},${0.05 + r() * 0.09})`;
    for (const dy of [-tam, 0, tam]) g.fillRect(0, y + dy, tam, h);
  }
  // vetas
  for (let i = 0; i < 230; i++) {
    const y0 = r() * tam, amp = 1 + r() * 5, k = 1 + Math.floor(r() * 3), fase = r() * TAU, amp2 = r() * 1.6, k2 = 4 + Math.floor(r() * 5), fase2 = r() * TAU;
    g.strokeStyle = `rgba(${70 + r() * 50},${44 + r() * 30},${22 + r() * 20},${0.06 + r() * 0.3})`;
    g.lineWidth = 0.5 + r() * r() * 3;
    for (const dy of [-tam, 0, tam]) {
      g.beginPath();
      for (let x = 0; x <= tam; x += 8) { const y = y0 + dy + amp * Math.sin(k * x / tam * TAU + fase) + amp2 * Math.sin(k2 * x / tam * TAU + fase2); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
  }
  // poros
  for (let i = 0; i < 1500; i++) { const x = r() * tam, y = r() * tam, l = 3 + r() * 12; g.fillStyle = `rgba(60,36,18,${0.06 + r() * 0.14})`; g.fillRect(x, y, l, 0.8); }
  return textura(c, { aniso: 8 });
}

// Piso de tablas: hileras con juntas alternadas; cada tabla con su tono.
export function texturaPiso(tam = 512) {
  const [c, g] = lienzo(tam, tam), r = azar(57), filas = 6, alto = tam / filas;
  for (let f = 0; f < filas; f++) {
    const y = f * alto;
    let x = -r() * tam * 0.5;
    while (x < tam) {
      const largo = tam * (0.42 + r() * 0.3), v = 205 + r() * 42;
      g.fillStyle = `rgb(${v},${v * 0.93},${v * 0.84})`;
      g.fillRect(x, y, largo, alto);
      for (let i = 0; i < 26; i++) {
        const yy = y + r() * alto, a = 1 + r() * 2.2, fase = r() * TAU;
        g.strokeStyle = `rgba(84,52,28,${0.05 + r() * 0.2})`; g.lineWidth = 0.5 + r() * 1.6;
        g.beginPath();
        for (let xx = x; xx <= x + largo; xx += 10) { const yv = Math.min(y + alto - 1, Math.max(y + 1, yy + a * Math.sin(xx * 0.02 + fase))); xx === x ? g.moveTo(xx, yv) : g.lineTo(xx, yv); }
        g.stroke();
      }
      g.fillStyle = 'rgba(30,18,10,.55)'; g.fillRect(x + largo - 1.5, y, 1.5, alto);
      x += largo;
    }
    g.fillStyle = 'rgba(26,15,8,.6)'; g.fillRect(0, y, tam, 1.6);
    g.fillStyle = 'rgba(255,240,215,.16)'; g.fillRect(0, y + 1.6, tam, 1.2);
  }
  return textura(c, { aniso: 8 });
}

// Revoque: manchas muy suaves para que la pared no sea un color plano.
export function texturaYeso(tam = 256) {
  const [c, g] = lienzo(tam, tam), r = azar(91);
  g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, tam, tam);
  for (let i = 0; i < 260; i++) {
    const x = r() * tam, y = r() * tam, rad = 16 + r() * 50, a = 0.012 + r() * 0.022;
    for (const dx of [-tam, 0, tam]) for (const dy of [-tam, 0, tam]) {
      if (x + dx < -rad || x + dx > tam + rad || y + dy < -rad || y + dy > tam + rad) continue;
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad);
      gr.addColorStop(0, `rgba(${r() < 0.55 ? '140,128,108' : '255,255,255'},${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x + dx - rad, y + dy - rad, rad * 2, rad * 2);
    }
  }
  for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(110,100,84,${r() * 0.035})`; g.fillRect(r() * tam, r() * tam, 1.2, 1.2); }
  return textura(c);
}

// Alfombra con guarda geométrica propia (rombos escalonados), en los colores del juego. No se repite: es una pieza.
export function texturaAlfombra(colorEmpresa = '#cf3f2c') {
  const w = 384, h = 256, [c, g] = lienzo(w, h), r = azar(13);
  g.fillStyle = '#1f2c4f'; g.fillRect(0, 0, w, h);
  const marco = (m, color, ancho) => { g.strokeStyle = color; g.lineWidth = ancho; g.strokeRect(m, m, w - 2 * m, h - 2 * m); };
  marco(8, '#e9d9b4', 6); marco(20, colorEmpresa, 5); marco(31, '#e9d9b4', 2);
  // rombos escalonados en la guarda
  const rombo = (x, y, t, a, b) => { for (let k = 3; k >= 1; k--) { g.fillStyle = k % 2 ? a : b; const s = t * k / 3; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath(); g.fill(); } };
  for (let x = 58; x < w - 40; x += 30) { rombo(x, 50, 9, '#e9d9b4', '#1f2c4f'); rombo(x, h - 50, 9, '#e9d9b4', '#1f2c4f'); }
  for (let y = 80; y < h - 70; y += 30) { rombo(50, y, 9, '#e9d9b4', '#1f2c4f'); rombo(w - 50, y, 9, '#e9d9b4', '#1f2c4f'); }
  // campo central con un gran rombo y cruces
  g.fillStyle = '#263763'; g.fillRect(70, 70, w - 140, h - 140);
  rombo(w / 2, h / 2, 44, colorEmpresa, '#e9d9b4');
  for (const [x, y] of [[112, h / 2], [w - 112, h / 2]]) rombo(x, y, 16, '#e9d9b4', '#263763');
  // trama del tejido
  for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.07})`; g.fillRect(0, y, w, 1); }
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 1, 2); }
  return textura(c, { repetir: false });
}

// Mancha blanda (sombras de apoyo, resplandores, rebanadas del rayo de luz).
export function texturaMancha(tam = 64, forma = 'redonda') {
  const [c, g] = lienzo(tam, tam);
  if (forma === 'redonda') {
    const gr = g.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, tam, tam);
  } else {
    // rectángulo de borde blando
    const px = g.createImageData(tam, tam);
    for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
      const u = Math.min(x, tam - 1 - x) / (tam * 0.2), v = Math.min(y, tam - 1 - y) / (tam * 0.2);
      const a = suave(0, 1, u) * suave(0, 1, v);
      px.data.set([255, 255, 255, a * 255], (y * tam + x) * 4);
    }
    g.putImageData(px, 0, 0);
  }
  return textura(c, { repetir: false, color: false, aniso: 1 });
}

// ── materiales ──
// Materiales sueltos (páginas, mapa, pantalla de la lámpara…): en el nivel bajo salen simples, sin brillos ni reflejos.
let nivelActual = 'alto';
export function material(op = {}) {
  if (nivelActual !== 'bajo') return new THREE.MeshStandardMaterial(op);
  const { roughness, metalness, envMapIntensity, ...resto } = op;
  if (metalness > 0.5 && resto.color) resto.color = resto.color.clone().multiplyScalar(0.8);     // sin reflejos, el metal se pinta con su color
  return new THREE.MeshLambertMaterial(resto);
}
// Todos con color por vértice. userData.uvMundo = [veta, través]: repeticiones por metro.
// El material completo (brillos y reflejos) cuesta por píxel: se usa donde se nota. Lo mate (revoque, papel, tela) va siempre
// con el material simple, que se ve igual; en el nivel medio también la boiserie y el piso; en el bajo, todo menos el metal.
export function crearMateriales(nivel = 'alto') {
  nivelActual = nivel;
  const madera = texturaMadera(), yeso = texturaYeso(), piso = texturaPiso();
  const completo = (o, ud = {}) => { const m = new THREE.MeshStandardMaterial({ vertexColors: true, ...o }); Object.assign(m.userData, ud); return m; };
  const simple = (o, ud = {}) => { const { roughness, metalness, ...resto } = o; const m = new THREE.MeshLambertMaterial({ vertexColors: true, ...resto }); Object.assign(m.userData, ud); return m; };
  const std = nivel === 'bajo' ? simple : completo, grande = nivel === 'alto' ? completo : simple;
  const m = {
    madera: grande({ map: madera, roughness: 0.6, metalness: 0 }, { uvMundo: [0.75, 2.4] }),
    barniz: std({ map: madera, roughness: 0.46, metalness: 0 }, { uvMundo: [0.75, 2.4] }),   // tapa del escritorio: lustrada
    piso: grande({ map: piso, roughness: 0.5, metalness: 0 }, { uvMundo: [0.42, 0.9] }),
    yeso: simple({ map: yeso }, { uvMundo: [0.42, 0.42] }),
    mate: simple({}),
    satin: std({ roughness: 0.42, metalness: 0 }),
    esmalte: std({ roughness: 0.22, metalness: 0 }),
    cuero: std({ roughness: 0.55, metalness: 0 }),
    metal: completo({ roughness: 0.3, metalness: 1 }),
    hierro: completo({ roughness: 0.55, metalness: 0.7 }),
    vidrio: completo({ roughness: 0.04, metalness: 0, transparent: true, opacity: 0.05, depthWrite: false }, { sinSombra: true }),
    luz: Object.assign(new THREE.MeshBasicMaterial({ vertexColors: true }), { userData: { sinSombra: true } }),
  };
  m.texturas = [madera, yeso, piso];
  return m;
}

// Suelta todo lo que cuelga de un objeto (geometrías, materiales y texturas).
export function soltar(obj) {
  const vistos = new Set();
  obj.traverse((o) => {
    if (o.geometry && !vistos.has(o.geometry)) { vistos.add(o.geometry); o.geometry.dispose(); }
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of ms) {
      if (vistos.has(m)) continue; vistos.add(m);
      for (const k of Object.keys(m)) { const v = m[k]; if (v && v.isTexture && !vistos.has(v)) { vistos.add(v); v.dispose(); } }
      if (m.uniforms) for (const u of Object.values(m.uniforms)) { const v = u?.value; if (v && v.isTexture && !vistos.has(v)) { vistos.add(v); v.dispose(); } }
      m.dispose();
    }
    if (o.isLight && o.shadow?.map) o.shadow.map.dispose();
  });
}
