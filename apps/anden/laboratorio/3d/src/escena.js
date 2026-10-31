// Laboratorio 3D · escena del centro de distribución con sorter y miles de paquetes animados por instancias.
// Dos modos de animación: 'gpu' (el vertex shader evalúa trayectos desde una textura; la CPU solo sube un uniforme por cuadro)
// y 'cpu' (referencia: se recalculan las matrices de instancia en JS cada cuadro). Misma escena, mismo azar (semilla fija).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ToneMappingEffect, ToneMappingMode, SMAAEffect, VignetteEffect } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';

const PATH_W = 1024;
const rng = (() => { let s = 123456789; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
const rr = (a, b) => a + (b - a) * rng();

// ---------- trayectos (filas de la textura) ----------
const L_STRAIGHT = 36, R_LOOP = 6, SORT_Y = 0.98;
const SORT_LEN = 2 * L_STRAIGHT + 2 * Math.PI * R_LOOP;
function stadium(s) { // 0..SORT_LEN, sentido antihorario visto desde arriba; recta norte hacia +x... (z = -R es «norte» visual)
  const a = L_STRAIGHT, r = R_LOOP, arc = Math.PI * r;
  s = ((s % SORT_LEN) + SORT_LEN) % SORT_LEN;
  if (s < a) return [-a / 2 + s, SORT_Y, r];
  s -= a; if (s < arc) { const th = Math.PI / 2 - s / r; return [a / 2 + Math.cos(th) * r, SORT_Y, Math.sin(th) * r]; }
  s -= arc; if (s < a) return [a / 2 - s, SORT_Y, -r];
  s -= a; const th = -Math.PI / 2 - s / r; return [-a / 2 + Math.cos(th) * r, SORT_Y, Math.sin(th) * r];
}
const BELT_Y = 0.78;
const lineFn = (p, q) => (s, L) => [p[0] + (q[0] - p[0]) * s / L, p[1] + (q[1] - p[1]) * s / L, p[2] + (q[2] - p[2]) * s / L];
function rectLoop(x0, x1, z0, z1, y = 0) { // caminata de operarios en rectángulo
  const w = x1 - x0, h = z1 - z0, L = 2 * (w + h);
  return { len: L, fn: (s) => { s = ((s % L) + L) % L; if (s < w) return [x0 + s, y, z0]; s -= w; if (s < h) return [x1, y, z0 + s]; s -= h; if (s < w) return [x1 - s, y, z1]; s -= w; return [x0, y, z1 - s]; } };
}
export function construirTrayectos() {
  const rows = [{ len: SORT_LEN, fn: (s) => stadium(s) }]; // fila 0
  for (let i = 0; i < 12; i++) { const z = -11 + i * 2; rows.push({ len: 12, fn: (s) => [-34 + s, BELT_Y, z] }); } // 1..12 entradas
  for (let i = 0; i < 8; i++) { const z = -17.5 + i * 5; rows.push({ len: 11, fn: (s) => [25 + s, BELT_Y, z] }); } // 13..20 salidas
  rows.push({ ...rectLoop(-31, 31, 12.4, 14.2) }, { ...rectLoop(-31, 31, -14.2, -12.4) }, { ...rectLoop(-20.5, 20.5, -3.3, 3.3) }, { ...rectLoop(-34, -23, -13, 13) }); // 21..24
  const data = new Float32Array(PATH_W * rows.length * 4);
  rows.forEach((r, j) => { for (let i = 0; i < PATH_W; i++) { const p = r.fn(r.len * i / (PATH_W - 1), r.len); const o = (j * PATH_W + i) * 4; data[o] = p[0]; data[o + 1] = p[1]; data[o + 2] = p[2]; data[o + 3] = 1; } });
  return { rows, data };
}

// ---------- generación de instancias de paquete ----------
const TAMANOS = [[0.40, 0.25, 0.30], [0.30, 0.20, 0.25], [0.50, 0.30, 0.34], [0.26, 0.26, 0.26], [0.55, 0.12, 0.38], [0.34, 0.30, 0.32]];
function colorPaquete(i) { const r = rng(); const k = 0.88 + rng() * 0.22; if (r < 0.80) return [k, k * 0.98, k * 0.95]; if (r < 0.92) return [1.85, 1.85, 1.9]; if (r < 0.97) return [0.5, 0.58, 0.8]; return [0.8, 0.45, 0.4]; }
export function generarParcelas(N) {
  const P = []; // {row,s0,speed,len, t0,dur,cycle,lift, A,B, size, yaw, color}
  const push = (o) => P.push({ row: -1, s0: 0, speed: 0, len: 1, t0: 0, dur: 0, cycle: 1, lift: 0, A: [0, 0, 0], B: [0, 0, 0], yaw: 0, ...o, size: o.size || TAMANOS[(rng() * TAMANOS.length) | 0], color: colorPaquete() });
  // sobre las bandejas del sorter (una de cada 6 vacía)
  const nTray = 176, pitch = SORT_LEN / nTray;
  for (let k = 0; k < nTray; k++) if (rng() > 0.15) { const sz = TAMANOS[(rng() * 3) | 0]; push({ row: 0, s0: k * pitch, speed: 2.0, len: SORT_LEN, lift: 1, size: [Math.min(sz[0], 0.46), sz[1], Math.min(sz[2], 0.38)], yaw: 0 }); }
  // cintas de entrada y de salida
  for (let i = 0; i < 12; i++) for (let s = rng() * 0.4; s < 11.6; s += rr(0.55, 0.85)) push({ row: 1 + i, s0: s, speed: 0.9, len: 12, lift: 1, size: TAMANOS[(rng() * 6) | 0] });
  for (let i = 0; i < 8; i++) for (let s = rng() * 0.4; s < 10.6; s += rr(0.55, 0.85)) push({ row: 13 + i, s0: s, speed: 1.1, len: 11, lift: 1, size: TAMANOS[(rng() * 6) | 0] });
  // jaulas: 40 (20 al norte, 20 al sur); cada paquete se desliza por la tolva y cae a su lugar, con ciclo de 120 s
  const nJaulas = 40, pallets = 56;
  const base = P.length; const restan = N - base;
  const porPallet = Math.min(46, Math.floor(restan * 0.55 / pallets)); const porJaula = Math.floor((restan - porPallet * pallets) / nJaulas);
  const jaulas = []; for (let j = 0; j < nJaulas; j++) { const lado = j < 20 ? 1 : -1; const k = j % 20; jaulas.push({ x: -17.1 + k * 1.8, z: lado * 9.15, lado }); }
  for (const j of jaulas) {
    for (let n = 0; n < porJaula; n++) {
      const layer = (n / 4) | 0, cx = (n % 2) - 0.5, cz = ((n >> 1) % 2) - 0.5; const sz = [0.34, 0.12 + rng() * 0.08, 0.30];
      const B = [j.x + cx * 0.36 + rr(-0.02, 0.02), 0.2 + layer * 0.16 + sz[1] / 2, j.z + cz * 0.31 + rr(-0.02, 0.02)];
      push({ A: [j.x, SORT_Y + 0.06 + sz[1] / 2, j.lado * 6.55], B, t0: rng() * 118, dur: 1.5, cycle: 120, size: sz, yaw: rr(-0.12, 0.12) });
    }
  }
  // pallets en la zona de preparación (sudoeste), cargados en capas
  const pal = []; for (let r = 0; r < 7; r++) for (let c = 0; c < 8; c++) pal.push({ x: -33 + c * 1.55, z: 15 + r * 1.0 });
  for (let n = 0; n < pallets; n++) {
    const p = pal[n]; for (let q = 0; q < porPallet && P.length < N; q++) { const layer = (q / 9) | 0, i = q % 9; const gx = (i % 3) - 1, gz = ((i / 3) | 0) - 1; const sz = [0.38, 0.22 + rng() * 0.04, 0.24];
      push({ B: [p.x + gx * 0.38 + rr(-0.01, 0.01), 0.16 + layer * 0.25 + sz[1] / 2, p.z + gz * 0.25], size: sz, yaw: rr(-0.05, 0.05) }); }
  }
  while (P.length < N) { const j = jaulas[(rng() * nJaulas) | 0]; push({ B: [j.x + rr(-0.3, 0.3), 1.45, j.z + rr(-0.25, 0.25)], size: [0.3, 0.2, 0.25] }); }
  return { P: P.slice(0, N), jaulas, pal: pal.slice(0, pallets) };
}

// ---------- shader común ----------
const U = { uTime: { value: 0 }, uPath: { value: null }, uPathSize: { value: new THREE.Vector2() } };
const GLSL_HEAD = `
attribute vec4 aP0; attribute vec4 aT0; attribute vec3 aA; attribute vec3 aB; attribute vec4 aS;
uniform float uTime; uniform highp sampler2D uPath; uniform vec2 uPathSize; uniform float uLeg; uniform vec3 uPivot;
vec3 gP; float gYaw; float gSc; float gWalk;
vec3 pathAt(float row, float s, float len){ float u=clamp(s/len,0.,1.)*(uPathSize.x-1.); float i0=min(floor(u),uPathSize.x-2.); float f=u-i0;
  vec3 a=texelFetch(uPath,ivec2(int(i0),int(row)),0).xyz; vec3 b=texelFetch(uPath,ivec2(int(i0)+1,int(row)),0).xyz; return mix(a,b,f); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
void pose(){
  gSc=1.; gWalk=0.;
  if (aP0.x >= 0.) {
    float len=aP0.w; float s=mod(aP0.y+aP0.z*uTime,len); gP=pathAt(aP0.x,s,len); vec3 q=pathAt(aP0.x,min(s+0.12,len),len); vec3 d=q-gP;
    gYaw = dot(d.xz,d.xz) > 1e-6 ? atan(-d.z,d.x) : aS.w; if (aT0.w > .5) gP.y += 0.5*aS.y; gWalk=s;
  } else if (aT0.y <= 0.) { gP=aB; gYaw=aS.w; }
  else {
    float tt=mod(uTime,aT0.z); float u=clamp((tt-aT0.x)/aT0.y,0.,1.); gSc = tt>=aT0.x ? 1. : 0.;
    vec3 C=vec3(aA.x, aA.y-0.28, aA.z+sign(aB.z-aA.z)*2.15);
    if (u<0.72) { float k=u/0.72; gP=mix(aA,C,k*k*0.65+k*0.35); } else { float k=(u-0.72)/0.28; gP=vec3(mix(C.x,aB.x,k), mix(C.y,aB.y,k*k), mix(C.z,aB.z,k)); }
    gYaw=aS.w + (1.-u)*0.35;
  }
}
`;
const GLSL_LP = `
  vec3 lp = position * aS.xyz;
  #ifdef LEG
    float ang = sin(gWalk*2.4)*0.6*uLeg; { vec3 q=lp-uPivot; float c=cos(ang), s=sin(ang); q.xy=vec2(c*q.x-s*q.y, s*q.x+c*q.y); lp=q+uPivot; }
  #endif
  #ifdef WALK
    lp.y += abs(sin(gWalk*2.4))*0.025;
  #endif
`;
function inyectar(mat, { depth = false, leg = 0, pivot = [0, 0, 0], walk = false } = {}) {
  mat.defines = { ...(mat.defines || {}) }; if (leg) mat.defines.LEG = ''; if (walk) mat.defines.WALK = '';
  const uLeg = { value: leg }, uPivot = { value: new THREE.Vector3(...pivot) };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U, { uLeg, uPivot });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + GLSL_HEAD);
    if (!depth) {
      sh.vertexShader = sh.vertexShader.replace('#include <beginnormal_vertex>', `pose(); vec3 objectNormal = rotY(gYaw) * vec3(normal);
        #ifdef LEG
          { float ang = sin(gWalk*2.4)*0.6*uLeg; float c=cos(ang), s=sin(ang); objectNormal.xy=vec2(c*objectNormal.x-s*objectNormal.y, s*objectNormal.x+c*objectNormal.y); }
        #endif
        #ifdef USE_TANGENT\n vec3 objectTangent = vec3( tangent.xyz );\n#endif`);
      sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', GLSL_LP + '\nvec3 transformed = rotY(gYaw) * lp * gSc + gP;');
    } else {
      sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'pose();\n' + GLSL_LP + '\nvec3 transformed = rotY(gYaw) * lp * gSc + gP;');
    }
  };
  mat.customProgramCacheKey = () => `anden-inst-${depth}-${leg}-${walk}`;
  return mat;
}

// ---------- utilidades de geometría / carga ----------
function aFloat(geo) { // dequantiza a Float32 (KHR_mesh_quantization) y fusiona la matriz del nodo
  const g = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'uv']) { const a = geo.getAttribute(name); if (!a) continue; const f = new Float32Array(a.count * a.itemSize); for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) f[i * a.itemSize + k] = a.array && [a.getX, a.getY, a.getZ, a.getW][k].call(a, i); g.setAttribute(name, new THREE.BufferAttribute(f, a.itemSize)); }
  if (geo.index) g.setIndex(Array.from(geo.index.array)); return g;
}
async function cargarActivos(url) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder); const gltf = await loader.loadAsync(url);
  const out = {}; gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => { if (!o.isMesh) return; let n = o; while (n.parent && n.parent !== gltf.scene) n = n.parent; const nombre = (n.name || o.name).replace(/_\d+$/, '').replace(/\.\d+$/, '');
    const g = aFloat(o.geometry); g.applyMatrix4(o.matrixWorld); (out[nombre] ||= []).push({ geo: g, mat: o.material }); });
  return out;
}
function texCarton() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, '#b08c64'); gr.addColorStop(1, '#9d7a52'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${rng() < .5 ? 60 : 200},${rng() < .5 ? 40 : 160},${rng() < .5 ? 20 : 110},${rng() * 0.07})`; g.fillRect(rng() * 256, rng() * 256, rr(1, 5), rr(1, 2)); }
  g.fillStyle = 'rgba(205,190,160,0.55)'; g.fillRect(0, 112, 256, 34); g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 112, 256, 2); g.fillRect(0, 144, 256, 2);
  g.fillStyle = '#eee9e0'; g.fillRect(24, 170, 104, 66); g.fillStyle = '#222'; for (let i = 0; i < 26; i++) g.fillRect(30 + i * 3.6, 214, rr(1, 2.6), 16); g.fillRect(30, 180, 70, 4); g.fillRect(30, 190, 52, 3); g.fillRect(30, 198, 60, 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function texBisel() { // mapa de normales (espacio tangente) que redondea las aristas de un cubo de 12 triángulos
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S); const w = 0.085;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const u = (x + 0.5) / S, v = 1 - (y + 0.5) / S; const du = Math.min(u, 1 - u), dv = Math.min(v, 1 - v); let nx = 0, ny = 0;
    if (du < w) nx = (u < 0.5 ? -1 : 1) * (1 - du / w); if (dv < w) ny = (v < 0.5 ? -1 : 1) * (1 - dv / w); const k = 0.95; nx *= k; ny *= k; const nz = Math.sqrt(Math.max(0.0, 1 - nx * nx - ny * ny)); const i = (y * S + x) * 4;
    im.data[i] = (nx * 0.5 + 0.5) * 255; im.data[i + 1] = (ny * 0.5 + 0.5) * 255; im.data[i + 2] = (nz * 0.5 + 0.5) * 255; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
function texMarcas() { // pintura de piso: perímetro del sorter, pasillos, numeración de destinos
  const W = 2048, H = 1280, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const X = (x) => (x + 40) / 80 * W, Z = (z) => (z + 25) / 50 * H;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = '#e8b21a'; g.lineWidth = 7;
  const off = 1.6; g.beginPath(); // estadio exterior e interior de seguridad
  for (const sg of [1, -1]) { g.moveTo(X(-18), Z(sg * (6 + off))); g.lineTo(X(18), Z(sg * (6 + off))); }
  g.arc(X(18), Z(0), (6 + off) / 80 * W, -Math.PI / 2, Math.PI / 2); g.moveTo(X(-18), Z(-(6 + off))); g.arc(X(-18), Z(0), (6 + off) / 80 * W, Math.PI / 2, 1.5 * Math.PI); g.stroke();
  g.strokeStyle = '#2f9e5f'; g.lineWidth = 9; g.setLineDash([]); for (const z of [12.4, 14.2, -12.4, -14.2]) { g.beginPath(); g.moveTo(X(-31), Z(z)); g.lineTo(X(31), Z(z)); g.stroke(); }
  g.strokeStyle = 'rgba(232,178,26,.9)'; g.lineWidth = 5; for (let k = 0; k < 20; k++) for (const s of [1, -1]) { const x = -17.1 + k * 1.8; g.strokeRect(X(x - .45), Z(s * 9.15 - .4), .9 / 80 * W, .8 / 50 * H); }
  g.fillStyle = 'rgba(245,245,245,.92)'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; for (let k = 0; k < 20; k++) for (const s of [1, -1]) { g.save(); g.translate(X(-17.1 + k * 1.8), Z(s * 10.2)); g.fillText(String((s > 0 ? 0 : 20) + k + 1), 0, 8); g.restore(); }
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 4; for (let i = 0; i < 8; i++) { const z = -17.5 + i * 5; g.strokeRect(X(24.6), Z(z - 1.1), 11.5 / 80 * W, 2.2 / 50 * H); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function texPared() { const c = document.createElement('canvas'); c.width = 512; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#9aa2a9'; g.fillRect(0, 0, 512, 64); for (let i = 0; i < 512; i += 16) { g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(i, 0, 2, 64); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(i + 2, 0, 2, 64); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }

// ---------- escena ----------
export async function crearEscena(canvas, opt) {
  const o = { techo: 'si', paquete: 'plano', w: 1280, h: 720, N: 5000, anim: 'gpu', sombras: 2048, ibl: 'hdr', ao: 'ninguno', post: false, aa: 'ninguno', material: 'standard', glb: 'activos/activos.glb', fog: true, ...opt };
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: o.aa === 'msaa', preserveDrawingBuffer: true, powerPreference: 'high-performance', stencil: false, alpha: false });
  renderer.setPixelRatio(1); renderer.setSize(o.w, o.h, false);
  renderer.shadowMap.enabled = !!o.sombras; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = o.post ? THREE.NoToneMapping : THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0d1015'); if (o.fog) scene.fog = new THREE.FogExp2('#0d1015', 0.0042);
  const camera = new THREE.PerspectiveCamera(38, o.w / o.h, 0.3, 400);
  const gltf = await cargarActivos(o.glb);
  const cargas = []; const tex = new THREE.TextureLoader(); const ld = (u, srgb) => { const t = tex.load(u); cargas.push(new Promise((ok, no) => { if (t.image) ok(); else { const h = setInterval(() => { if (t.image) { clearInterval(h); ok(); } }, 10); setTimeout(() => { clearInterval(h); no(new Error('textura sin cargar: ' + u)); }, 20000); } })); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };

  // trayectos
  const { rows, data } = construirTrayectos(); const pathTex = new THREE.DataTexture(data, PATH_W, rows.length, THREE.RGBAFormat, THREE.FloatType); pathTex.needsUpdate = true; pathTex.minFilter = pathTex.magFilter = THREE.NearestFilter;
  U.uPath.value = pathTex; U.uPathSize.value.set(PATH_W, rows.length);

  // entorno (IBL)
  if (o.ibl === 'hdr') { const hdr = await new HDRLoader().loadAsync('activos/cc0/empty_warehouse_01_1k.hdr'); const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(hdr).texture; scene.environmentIntensity = 0.55; hdr.dispose(); pm.dispose(); }
  if (o.ibl === 'sh') { const hdr = await new HDRLoader().loadAsync('activos/cc0/empty_warehouse_01_1k.hdr'); const rt = new THREE.WebGLCubeRenderTarget(128, { type: THREE.HalfFloatType }); rt.fromEquirectangularTexture(renderer, hdr); const probe = await LightProbeGenerator.fromCubeRenderTarget(renderer, rt); probe.intensity = 1.35; scene.add(probe); hdr.dispose(); rt.dispose(); }
  const sol = new THREE.DirectionalLight('#fff1dc', 2.4); sol.position.set(-22, 38, 26); sol.target.position.set(0, 0, 0); scene.add(sol, sol.target);
  if (o.sombras) { sol.castShadow = true; sol.shadow.mapSize.set(o.sombras, o.sombras); const c = sol.shadow.camera; c.left = -42; c.right = 42; c.top = 28; c.bottom = -28; c.near = 5; c.far = 90; sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03; sol.shadow.radius = 2; }
  scene.add(new THREE.HemisphereLight('#c8d8ff', '#6a6256', 0.9));

  const conv = (m) => { if (o.material === 'lambert') { const l = new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, map: m.map }); return l; } const n = m.clone(); n.envMapIntensity = 1.0; return n; };
  const estaticos = []; // {nombre, matrices[]}
  const colocar = (nombre, mats, { sombra = true, recibe = true } = {}) => {
    const partes = gltf[nombre]; if (!partes) throw new Error('falta activo ' + nombre); const res = [];
    for (const p of partes) { const m = conv(p.mat); const im = new THREE.InstancedMesh(p.geo, m, mats.length); mats.forEach((mm, i) => im.setMatrixAt(i, mm)); im.instanceMatrix.needsUpdate = true; im.castShadow = sombra && !!o.sombras; im.receiveShadow = recibe; im.computeBoundingSphere(); scene.add(im); res.push(im); }
    return res;
  };
  const M = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz));

  // piso con concreto PBR + pintura
  const cd = ld('activos/cc0/concrete_diff.jpg', true), cr = ld('activos/cc0/concrete_rough.jpg'), cn = ld('activos/cc0/concrete_nor_gl.jpg');
  for (const t of [cd, cr, cn]) t.repeat.set(27, 17);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.MeshStandardMaterial({ map: cd, roughnessMap: cr, normalMap: cn, roughness: 1.0, metalness: 0, color: '#ffffff' })); piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; scene.add(piso);
  const marcas = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.MeshStandardMaterial({ map: texMarcas(), transparent: true, roughness: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); marcas.rotation.x = -Math.PI / 2; marcas.position.y = 0.002; marcas.receiveShadow = true; scene.add(marcas);

  // cascarón: paredes (norte, oeste, este con vanos de muelle simplificados), columnas y cerchas
  const tp = texPared(); tp.repeat.set(20, 1);
  const paredMat = new THREE.MeshStandardMaterial({ map: tp, roughness: 0.75, metalness: 0.15 });
  const pared = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), paredMat); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; m.castShadow = true; scene.add(m); };
  pared(72, 11, 0, 5.5, -22, 0); pared(44, 11, -36, 5.5, 0, Math.PI / 2);
  const colM = [], vigaM = [], lumM = [];
  for (let x = -36; x <= 36; x += 9) { colM.push(M(x, 5.1, -21.6, 0, 1, 1, 1, Math.PI / 2)); colM.push(M(x, 5.1, 21.6, 0, 1, 1, 1, Math.PI / 2)); if (x > -30 && x < 30) { colM.push(M(x, 5.1, -16.8, 0, 1, 1, 1, Math.PI / 2)); colM.push(M(x, 5.1, 16.8, 0, 1, 1, 1, Math.PI / 2)); } }
  const colGeo = gltf['viga_I']; // la viga unitaria (1 m) se escala en su eje para ser columna (rotada 90° en z) o cercha
  const colS = colM.map((m) => { const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s); return M(p.x, 0, p.z, 0, 1, 1, 1, Math.PI / 2).multiply(new THREE.Matrix4().makeScale(10.2, 1, 1)); });
  void colGeo; colocar('viga_I', colS, { recibe: true });
  if (o.techo !== 'no') {
  for (let x = -36; x <= 36; x += 6) vigaM.push(M(x, 10.4, -22, -Math.PI / 2, 44, 1, 1));  // cerchas transversales
  for (const z of [-17, -8.5, 0, 8.5, 17]) vigaM.push(M(-36, 10.9, z, 0, 72, 0.6, 0.7));  // correas
  colocar('viga_I', vigaM, { sombra: true }); }
  for (let x = -33; x <= 33; x += 4.5) for (const z of [-14, -7, 0, 7, 14]) lumM.push(M(x, 9.2, z, 0));
  if (o.techo !== 'no') colocar('luminaria', lumM, { sombra: false });

  // sorter: carril, patas, bandejas
  class Estadio extends THREE.Curve { getPoint(t, tg = new THREE.Vector3()) { const p = stadium(t * SORT_LEN); return tg.set(p[0], p[1] - 0.28, p[2]); } }
  const carril = new THREE.Mesh(new THREE.TubeGeometry(new Estadio(), 400, 0.05, 8, true), new THREE.MeshStandardMaterial({ color: '#22262b', metalness: 0.8, roughness: 0.4 })); carril.castShadow = true; carril.receiveShadow = true; scene.add(carril);
  const carril2 = carril.clone(); carril2.scale.set(1, 1, 1); carril2.position.y = -0.15; scene.add(carril2);
  const patas = []; for (let s = 0; s < SORT_LEN; s += 2.6) { const p = stadium(s); patas.push(M(p[0], 0.31, p[2], 0, 0.1, 0.62, 0.1)); } // patas de caja
  { const g = new THREE.BoxGeometry(1, 1, 1); const im = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: '#2d3238', metalness: 0.7, roughness: 0.45 }), patas.length); patas.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = true; im.receiveShadow = true; scene.add(im); }

  // cintas, tolvas, jaulas, pallets, acoplados (estáticos instanciados)
  const cintaM = []; for (let i = 0; i < 12; i++) for (let k = 0; k < 12; k++) cintaM.push(M(-33.5 + k, BELT_Y, -11 + i * 2, 0));
  for (let i = 0; i < 8; i++) for (let k = 0; k < 11; k++) cintaM.push(M(25.5 + k, BELT_Y, -17.5 + i * 5, 0));
  colocar('cinta', cintaM);
  const { P, jaulas, pal } = generarParcelas(o.N);
  const composicion = { sobre_bandejas: P.filter((p) => p.row === 0).length, en_cintas: P.filter((p) => p.row > 0).length, cayendo_a_jaulas_en_ciclo: P.filter((p) => p.row < 0 && p.dur > 0).length, en_pallets_fijos: P.filter((p) => p.row < 0 && p.dur <= 0).length, jaulas: jaulas.length, pallets: pal.length, bandejas: 176, operarios: 24 };
  const tolvaM = [], jaulaM = []; const a = 0.19;
  for (const j of jaulas) { tolvaM.push(M(j.x, SORT_Y + 0.02, j.lado * 6.4, j.lado > 0 ? -Math.PI / 2 : Math.PI / 2, 1.5, 1, 1, -a)); jaulaM.push(M(j.x, 0, j.z, j.lado > 0 ? 0 : Math.PI)); }
  colocar('tolva', tolvaM); colocar('jaula', jaulaM);
  colocar('pallet', pal.map((p) => M(p.x, 0, p.z, 0)));
  const acopM = [], cabM = []; for (let i = 0; i < 8; i++) { const z = -17.5 + i * 5; acopM.push(M(36.3, 0, z, 0)); if (i % 3 !== 1) cabM.push(M(36.3 + 13.6 + 0.4, 0, z, 0)); }
  colocar('acoplado', acopM); colocar('cabina', cabM);

  // paquetes: InstancedMesh con atributos de trayecto (GPU) o matrices (CPU)
  const n = P.length; const cartonTex = texCarton();
  const mkAttr = (f, s) => { const a = new Float32Array(n * s); P.forEach((p, i) => f(p, a, i * s)); return new THREE.InstancedBufferAttribute(a, s); };
  const pg = gltf[o.paquete === 'hd' ? 'paquete_hd' : 'paquete'][0]; const bisel = o.paquete === 'hd' ? null : texBisel(); const geoP = pg.geo.clone();
  const matP = o.material === 'lambert' ? new THREE.MeshLambertMaterial({ map: cartonTex }) : new THREE.MeshStandardMaterial({ map: cartonTex, normalMap: bisel, roughness: 0.82, metalness: 0 });
  const parcels = new THREE.InstancedMesh(geoP, matP, n); parcels.frustumCulled = false; parcels.castShadow = !!o.sombras; parcels.receiveShadow = true;
  const col = new THREE.Color(); P.forEach((p, i) => { col.setRGB(p.color[0], p.color[1], p.color[2], THREE.LinearSRGBColorSpace); parcels.setColorAt(i, col); });
  const ident = new THREE.Matrix4(); for (let i = 0; i < n; i++) parcels.setMatrixAt(i, ident);
  let cpuPose = null;
  const tiny = [];
  if (o.anim === 'gpu') {
    geoP.setAttribute('aP0', mkAttr((p, a, k) => { a[k] = p.row; a[k + 1] = p.s0; a[k + 2] = p.speed; a[k + 3] = p.len; }, 4));
    geoP.setAttribute('aT0', mkAttr((p, a, k) => { a[k] = p.t0; a[k + 1] = p.dur; a[k + 2] = p.cycle; a[k + 3] = p.lift; }, 4));
    geoP.setAttribute('aA', mkAttr((p, a, k) => { a[k] = p.A[0]; a[k + 1] = p.A[1]; a[k + 2] = p.A[2]; }, 3));
    geoP.setAttribute('aB', mkAttr((p, a, k) => { a[k] = p.B[0]; a[k + 1] = p.B[1]; a[k + 2] = p.B[2]; }, 3));
    geoP.setAttribute('aS', mkAttr((p, a, k) => { a[k] = p.size[0]; a[k + 1] = p.size[1]; a[k + 2] = p.size[2]; a[k + 3] = p.yaw; }, 4));
    inyectar(matP); parcels.customDepthMaterial = inyectar(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), { depth: true });
  } else { // CPU: misma cinemática en JS, una matriz por instancia y cuadro
    const pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), e = new THREE.Euler(), mm = new THREE.Matrix4();
    const at = (row, s, len) => { const u = Math.min(Math.max(s / len, 0), 1) * (PATH_W - 1); const i0 = Math.min(Math.floor(u), PATH_W - 2), f = u - i0; const b = (row * PATH_W + i0) * 4; return [data[b] + (data[b + 4] - data[b]) * f, data[b + 1] + (data[b + 5] - data[b + 1]) * f, data[b + 2] + (data[b + 6] - data[b + 2]) * f]; };
    cpuPose = (t) => {
      for (let i = 0; i < n; i++) { const p = P[i]; let x, y, z, yaw = p.yaw, s1 = 1;
        if (p.row >= 0) { const s = (p.s0 + p.speed * t) % p.len; const A = at(p.row, s, p.len), B = at(p.row, Math.min(s + 0.12, p.len), p.len); x = A[0]; y = A[1] + (p.lift ? 0.5 * p.size[1] : 0); z = A[2]; const dx = B[0] - A[0], dz = B[2] - A[2]; if (dx * dx + dz * dz > 1e-6) yaw = Math.atan2(-dz, dx); }
        else if (p.dur <= 0) { [x, y, z] = p.B; }
        else { const tt = t % p.cycle; const u = Math.min(Math.max((tt - p.t0) / p.dur, 0), 1); s1 = tt >= p.t0 ? 1 : 0; const C = [p.A[0], p.A[1] - 0.28, p.A[2] + Math.sign(p.B[2] - p.A[2]) * 2.15];
          if (u < 0.72) { const k = u / 0.72, w = k * k * 0.65 + k * 0.35; x = p.A[0] + (C[0] - p.A[0]) * w; y = p.A[1] + (C[1] - p.A[1]) * w; z = p.A[2] + (C[2] - p.A[2]) * w; } else { const k = (u - 0.72) / 0.28; x = C[0] + (p.B[0] - C[0]) * k; y = C[1] + (p.B[1] - C[1]) * k * k; z = C[2] + (p.B[2] - C[2]) * k; }
          yaw = p.yaw + (1 - u) * 0.35; }
        pos.set(x, y, z); e.set(0, yaw, 0); q.setFromEuler(e); sc.set(p.size[0] * s1, p.size[1] * s1, p.size[2] * s1); mm.compose(pos, q, sc); parcels.setMatrixAt(i, mm); }
      parcels.instanceMatrix.needsUpdate = true;
    };
  }
  scene.add(parcels);

  // bandejas del sorter (176) y operarios (24) con el mismo núcleo GPU
  const gpuMesh = (nombre, count, setter, opts = {}) => {
    const out = [];
    for (const p of gltf[nombre]) {
      const g = p.geo.clone(); const mk = (s, f) => { const a = new Float32Array(count * s); for (let i = 0; i < count; i++) f(a, i * s, i); return new THREE.InstancedBufferAttribute(a, s); };
      g.setAttribute('aP0', mk(4, (a, k, i) => { const d = setter(i); a[k] = d.row; a[k + 1] = d.s0; a[k + 2] = d.speed; a[k + 3] = d.len; }));
      g.setAttribute('aT0', mk(4, () => { })); g.setAttribute('aA', mk(3, () => { })); g.setAttribute('aB', mk(3, () => { }));
      g.setAttribute('aS', mk(4, (a, k) => { a[k] = 1; a[k + 1] = 1; a[k + 2] = 1; a[k + 3] = 0; }));
      const m = inyectar(conv(p.mat), opts); const im = new THREE.InstancedMesh(g, m, count); for (let i = 0; i < count; i++) im.setMatrixAt(i, ident);
      im.customDepthMaterial = inyectar(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), { ...opts, depth: true }); im.frustumCulled = false; im.castShadow = !!o.sombras; im.receiveShadow = true; scene.add(im); out.push(im);
    }
    return out;
  };
  const nTray = 176; gpuMesh('bandeja', nTray, (i) => ({ row: 0, s0: i * SORT_LEN / nTray, speed: 2.0, len: SORT_LEN }));
  const nOp = 24; const filasOp = [21, 22, 23, 24];
  const opSetter = (i) => { const r = filasOp[i % 4]; const L = rows[r].len; return { row: r, s0: (i / nOp) * L * 3.17 % L, speed: 1.15 + (i % 5) * 0.05, len: L }; };
  gpuMesh('operario_torso', nOp, opSetter, { walk: true });
  gpuMesh('operario_pierna_i', nOp, opSetter, { leg: 1, pivot: [0, 0.93, -0.11] }); gpuMesh('operario_pierna_d', nOp, opSetter, { leg: -1, pivot: [0, 0.93, 0.11] });
  // manchas de luz en el piso bajo las luminarias (barato, da lectura de nave iluminada)
  { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,215,.22)'); gr.addColorStop(1, 'rgba(255,240,215,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const mt = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(6.5, 6.5), mt, lumM.length); lumM.forEach((m, i) => { const p = new THREE.Vector3().setFromMatrixPosition(m); im.setMatrixAt(i, M(p.x, 0.012, p.z, 0).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2))); }); im.frustumCulled = false; scene.add(im); }

  await Promise.all(cargas); // las texturas del piso se cargan en segundo plano: sin esperarlas, el primer cuadro sale con el piso negro
  // posproceso (pmndrs/postprocessing): AO (N8AO), bloom, mapeo tonal, antialias
  let composer = null;
  if (o.post) {
    composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 0 }); composer.setSize(o.w, o.h, false);
    composer.addPass(new RenderPass(scene, camera));
    if (o.ao === 'n8ao') { const ao = new N8AOPostPass(scene, camera, o.w, o.h); ao.configuration.aoRadius = 1.2; ao.configuration.distanceFalloff = 0.6; ao.configuration.intensity = 3.0; ao.configuration.aoSamples = o.aoSamples || 12; ao.configuration.denoiseSamples = 6; ao.configuration.halfRes = !!o.aoHalf; ao.configuration.color = new THREE.Color(0, 0, 0); composer.addPass(ao); }
    const efectos = [new BloomEffect({ intensity: 0.55, luminanceThreshold: 1.25, luminanceSmoothing: 0.2, mipmapBlur: true, radius: 0.7 }), new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), new VignetteEffect({ offset: 0.32, darkness: 0.45 })];
    composer.addPass(new EffectPass(camera, ...efectos));
    if (o.aa === 'smaa') composer.addPass(new EffectPass(camera, new SMAAEffect()));
  }

  // cámaras: tomas fijas y recorrido cinemático (CatmullRom sobre posición y blanco; sin librerías de línea de tiempo)
  const tomas = {
    general: { p: [-44, 30, 40], t: [2, 0, 2], fov: 38 }, sorter: { p: [-14, 3.2, 12.5], t: [4, 1.0, 2], fov: 42 }, jaulas: { p: [-6, 2.6, 15.5], t: [-6, 1.0, 9.1], fov: 40 },
    muelle: { p: [29, 5.5, 16], t: [38, 1.5, 2], fov: 40 }, alto: { p: [0, 46, 0.01], t: [0, 0, 0], fov: 46 }, entrada: { p: [-26, 4.0, 22], t: [-30, 0.8, 0], fov: 42 }, cinta: { p: [-26.8, 1.55, -6.6], t: [-29.5, 0.85, -9.5], fov: 38 },
  };
  const ruta = { p: new THREE.CatmullRomCurve3([[-42, 22, 34], [-24, 9, 24], [-6, 4.2, 14], [10, 3.0, 14.5], [24, 6.0, 15], [34, 8, 10]].map((v) => new THREE.Vector3(...v)), false, 'centripetal'),
    t: new THREE.CatmullRomCurve3([[2, 0, 2], [-6, 1, 9], [4, 1, 7], [14, 1, 6.5], [28, 1.2, 2], [38, 1, 0]].map((v) => new THREE.Vector3(...v)), false, 'centripetal') };
  const api = {
    renderer, scene, camera, parcels, composicion, info: renderer.info, N: n, opts: o, composer,
    toma(nombre) { const t = tomas[nombre]; camera.position.set(...t.p); camera.fov = t.fov; camera.updateProjectionMatrix(); camera.lookAt(...t.t); },
    recorrido(u) { camera.position.copy(ruta.p.getPointAt(u)); camera.lookAt(ruta.t.getPointAt(u)); camera.fov = 40; camera.updateProjectionMatrix(); },
    tiempo(t) { U.uTime.value = t; if (cpuPose) cpuPose(t); },
    dibujar() { if (composer) composer.render(); else renderer.render(scene, camera); },
  };
  api.toma('general');
  return api;
}
