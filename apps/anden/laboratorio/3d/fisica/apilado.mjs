// Rapier (física rígida, WebAssembly) horneada fuera de línea: deja caer paquetes dentro de una jaula y guarda sus poses de reposo.
// Así las pilas se ven físicas (apoyadas, sin solapes) y en el navegador no cuesta nada: son datos. Semilla fija = resultado repetible.
import RAPIER from '@dimforge/rapier3d-compat'; import fs from 'node:fs';
await RAPIER.init();
let s = 987654321; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); const rr = (a, b) => a + (b - a) * rnd();
const N = Number(process.argv[2] || 40), PILAS = Number(process.argv[3] || 8);
const t0 = performance.now(); const pilas = []; let pasos = 0;
for (let p = 0; p < PILAS; p++) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 }); world.timestep = 1 / 120;
  const fijo = (hx, hy, hz, x, y, z) => world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(x, y, z).setFriction(0.7));
  fijo(0.4, 0.02, 0.35, 0, 0.16, 0); // base de la jaula (y=0.16 es su cara superior - 0.02)
  fijo(0.01, 0.8, 0.35, -0.385, 0.95, 0); fijo(0.01, 0.8, 0.35, 0.385, 0.95, 0); fijo(0.4, 0.8, 0.01, 0, 0.95, -0.335); fijo(0.4, 0.8, 0.01, 0, 0.95, 0.335); // paredes de malla
  const cuerpos = [];
  for (let i = 0; i < N; i++) {
    const sz = [rr(0.22, 0.36), rr(0.10, 0.22), rr(0.2, 0.3)]; const rb = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(rr(-0.2, 0.2), 0.5 + i * 0.07, rr(-0.18, 0.18)).setRotation((() => { const a = rr(-Math.PI, Math.PI); return { x: 0, y: Math.sin(a / 2), z: 0, w: Math.cos(a / 2) }; })()).setCanSleep(true));
    world.createCollider(RAPIER.ColliderDesc.cuboid(sz[0] / 2, sz[1] / 2, sz[2] / 2).setFriction(0.6).setRestitution(0.04).setDensity(120), rb); cuerpos.push({ rb, sz });
    for (let k = 0; k < 18; k++) { world.step(); pasos++; } // se sueltan escalonados
  }
  for (let k = 0; k < 480; k++) { world.step(); pasos++; if (cuerpos.every((c) => c.rb.isSleeping())) break; }
  pilas.push(cuerpos.map(({ rb, sz }) => { const t = rb.translation(), q = rb.rotation(); const yaw = Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z)); const inclin = Math.acos(Math.min(1, Math.max(-1, 1 - 2 * (q.x * q.x + q.z * q.z)))) * 180 / Math.PI; return { p: [+t.x.toFixed(3), +t.y.toFixed(3), +t.z.toFixed(3)], yaw: +yaw.toFixed(3), tam: sz.map((v) => +v.toFixed(3)), inclinacion_grados: +inclin.toFixed(1) }; }));
  world.free();
}
const ms = performance.now() - t0;
const todas = pilas.flat(); const inclinadas = todas.filter((c) => c.inclinacion_grados > 8).length; const altura = pilas.map((pl) => Math.max(...pl.map((c) => c.p[1] + c.tam[1] / 2)));
fs.mkdirSync('salida', { recursive: true }); fs.writeFileSync('salida/apilado-jaula.json', JSON.stringify({ rapier: RAPIER.version(), paquetes_por_pila: N, pilas }));
console.log(JSON.stringify({ rapier: RAPIER.version(), pilas: PILAS, paquetes: todas.length, pasos, ms_total: Math.round(ms), ms_por_paquete: +(ms / todas.length).toFixed(2), inclinados_mas_de_8_grados: inclinadas, altura_pila_m: { min: +Math.min(...altura).toFixed(2), max: +Math.max(...altura).toFixed(2) } }));
