// Prueba de viabilidad: three.js WebGPURenderer (TSL/nodos) con 5000 cajas instanciadas, sombra y PBR, sobre el adaptador WebGPU por software.
import * as THREE from 'three/webgpu';
const W = 960, H = 540, N = 5000; const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
try {
  const r = new THREE.WebGPURenderer({ canvas, antialias: false, forceWebGL: new URLSearchParams(location.search).get('gl') === '1' }); await r.init(); r.setSize(W, H, false); r.shadowMap.enabled = true;
  const sc = new THREE.Scene(); sc.background = new THREE.Color('#0d1015'); const cam = new THREE.PerspectiveCamera(38, W / H, 0.3, 400); cam.position.set(-44, 30, 40); cam.lookAt(2, 0, 2);
  sc.add(new THREE.HemisphereLight('#c8d8ff', '#6a6256', 0.9)); const sol = new THREE.DirectionalLight('#fff1dc', 2.4); sol.position.set(-22, 38, 26); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); const c = sol.shadow.camera; c.left = -42; c.right = 42; c.top = 28; c.bottom = -28; c.near = 5; c.far = 90; sc.add(sol);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.MeshStandardNodeMaterial({ color: '#8a8a8a', roughness: 0.9 })); piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; sc.add(piso);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.2, 0.25), new THREE.MeshStandardNodeMaterial({ color: '#a87c50', roughness: 0.8 }), N); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; sc.add(im);
  let s = 1; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); const m = new THREE.Matrix4();
  for (let i = 0; i < N; i++) { m.makeTranslation(-34 + rnd() * 68, 0.1, -20 + rnd() * 40); im.setMatrixAt(i, m); }
  const dev = r.backend?.device; const ms = []; const t00 = performance.now();
  await r.renderAsync(sc, cam); if (dev) await dev.queue.onSubmittedWorkDone(); const primer = performance.now() - t00;
  for (let k = 0; k < 6; k++) { const a = performance.now(); r.render(sc, cam); if (dev) await dev.queue.onSubmittedWorkDone(); ms.push(performance.now() - a); }
  ms.sort((x, y) => x - y); window.__res = { backend: r.backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL2 (respaldo)', primer_cuadro_ms: Math.round(primer), ms_mediana: Math.round(ms[3]), ms_min: Math.round(ms[0]) };
} catch (e) { window.__res = { error: String(e && e.stack || e).slice(0, 500) }; }
