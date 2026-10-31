// Candidato: three.js 0.187.0 con globo 3D (esfera con la tierra del juego, luces de ciudad, rutas en arco, 300 aviones como puntos, atmósfera).
import { WebGLRenderer, Scene, PerspectiveCamera, SphereGeometry, Mesh, MeshBasicMaterial, CanvasTexture, SRGBColorSpace, BufferGeometry, BufferAttribute, Points, PointsMaterial, LineSegments, LineBasicMaterial, ShaderMaterial, BackSide, AdditiveBlending, Vector3 } from 'three';
import { TIERRA, FRONTERAS } from '../../js/mapa.js';
import { CFG, prepararEscena, montar } from './comun.js';
import { AP, aVec as aVecZ, slerp, lonLatAvion, rutasLonLat, AEROPUERTOS } from './globo-datos.js';
// three usa Y arriba y su esfera mapea u = (lon + 180) / 360 alrededor de Y: (x, y, z) del juego → (x, z, -y)
const aVec = (lon, lat) => { const v = aVecZ(lon, lat); return [v[0], v[2], -v[1]]; };
const sl = (a, b, t) => slerp(a, b, t);

const escena = prepararEscena(); const { s, vis } = escena; const { W, H, dpr } = CFG;
const lienzo = document.getElementById('mapa');
const r = new WebGLRenderer({ canvas: lienzo, antialias: CFG.aa, powerPreference: 'high-performance' }); r.setPixelRatio(dpr); r.setSize(W, H, false); lienzo.style.width = W + 'px'; lienzo.style.height = H + 'px';
const scene = new Scene(); const cam = new PerspectiveCamera(30, W / H, 0.1, 50);
const dir = new Vector3(...aVec(-60, -22)); cam.position.copy(dir.clone().multiplyScalar(4.2)); cam.lookAt(0, 0, 0); cam.up.set(0, 1, 0);

// textura equirectangular de 2048×1024 dibujada con los polígonos del juego
const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 1024; const g = cv.getContext('2d');
g.fillStyle = '#0a1a38'; g.fillRect(0, 0, 2048, 1024);
const X = (lon) => (lon + 180) / 360 * 2048, Y = (lat) => (90 - lat) / 180 * 1024;
g.fillStyle = '#1c3358'; g.strokeStyle = '#4f78a8'; g.lineWidth = 1.2;
for (const a of TIERRA) { g.beginPath(); a.forEach(([x, y], i) => (i ? g.lineTo(X(x / 100), Y(y / 100)) : g.moveTo(X(x / 100), Y(y / 100)))); g.closePath(); g.fill(); g.stroke(); }
g.strokeStyle = 'rgba(120,160,210,0.45)'; g.lineWidth = 0.7; for (const l of FRONTERAS) { g.beginPath(); l.forEach(([x, y], i) => (i ? g.lineTo(X(x / 100), Y(y / 100)) : g.moveTo(X(x / 100), Y(y / 100)))); g.stroke(); }
for (const a of AEROPUERTOS) { const gr = g.createRadialGradient(X(a.lon), Y(a.lat), 0, X(a.lon), Y(a.lat), 14 + a.peso * 0.12); gr.addColorStop(0, 'rgba(255,220,140,0.95)'); gr.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gr; g.fillRect(X(a.lon) - 40, Y(a.lat) - 40, 80, 80); }
const tex = new CanvasTexture(cv); tex.colorSpace = SRGBColorSpace; tex.anisotropy = 4;
scene.add(new Mesh(new SphereGeometry(1, 96, 64), new MeshBasicMaterial({ map: tex })));
// atmósfera (resplandor de borde)
scene.add(new Mesh(new SphereGeometry(1.06, 64, 48), new ShaderMaterial({ side: BackSide, transparent: true, blending: AdditiveBlending, depthWrite: false,
  vertexShader: 'varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'varying vec3 n; void main(){ float i = pow(0.72 - dot(n, vec3(0,0,1.0)), 3.0); gl_FragColor = vec4(0.35,0.6,1.0,1.0) * i; }' })));
// rutas: arcos sobre el círculo máximo, levantados según la distancia (un solo LineSegments)
const seg = []; for (const { a, b } of rutasLonLat(s)) { const va = aVec(...a), vb = aVec(...b); let ant = null; for (let i = 0; i <= 40; i++) { const t = i / 40, p = slerp(va, vb, t), h = 1 + 0.12 * Math.sin(Math.PI * t) * Math.min(1, Math.acos(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]) * 1.3); const q = [p[0] * h, p[1] * h, p[2] * h]; if (ant) seg.push(...ant, ...q); ant = q; } }
const gl = new BufferGeometry(); gl.setAttribute('position', new BufferAttribute(new Float32Array(seg), 3)); scene.add(new LineSegments(gl, new LineBasicMaterial({ color: 0xffc457, transparent: true, opacity: 0.7 })));
// aviones
const pos = new Float32Array(s.aviones.length * 3), gp = new BufferGeometry(); gp.setAttribute('position', new BufferAttribute(pos, 3));
const pts = new Points(gp, new PointsMaterial({ color: 0xffffff, size: 5, sizeAttenuation: false })); pts.frustumCulled = false; scene.add(pts);
function dibujar() {
  const f = vis.frac ?? 0; let i = 0;
  for (const av of s.aviones) {
    const [lon, lat, , u] = lonLatAvion(av, f), v = aVec(lon, lat), h = 1.01 + 0.12 * Math.sin(Math.PI * u);
    pos[i++] = v[0] * h; pos[i++] = v[1] * h; pos[i++] = v[2] * h;
  }
  gp.attributes.position.needsUpdate = true;
  r.render(scene, cam);
}
const glc = r.getContext();
montar({ nombre: 'three-globo', escena, dibujar, sincronizar: () => { glc.readPixels(0, 0, 1, 1, glc.RGBA, glc.UNSIGNED_BYTE, new Uint8Array(4)); }, extra: { renderer: () => 'three/webgl' } });
