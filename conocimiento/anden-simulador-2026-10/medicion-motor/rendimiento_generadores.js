'use strict';
// Medicion propia del 17-10-2026. Mismo modelo que des.js (hub de 3 etapas en serie, servidores [4,6,5], servicio medio 0,9 min,
// 4 paquetes/min), escrito con la API de procesos (generadores) de motor_ref.js, para comparar el costo de la expresividad.
// Uso: node rendimiento_generadores.js <horizonte_min>
const { Sim, Resource, Tally } = require('./motor_ref.js');
const { performance } = require('perf_hooks');
const H = +process.argv[2] || 500000;
function correr(seed) {
  const sim = new Sim({ seed }); const etapas = [4, 6, 5].map(c => new Resource(sim, c)); const ra = sim.stream('llegadas'); const rs = [0, 1, 2].map(i => sim.stream('serv' + i));
  const T = new Tally();
  function* paquete(sim) { const t0 = sim.now; for (let s = 0; s < 3; s++) { const r = etapas[s].request(); yield r; yield sim.timeout(rs[s].exp(0.9)); etapas[s].release(r); } T.add(sim.now - t0); }
  function* fuente(sim) { for (;;) { yield sim.timeout(ra.exp(0.25)); sim.process(paquete); } }
  sim.process(fuente); sim.run(H); return { paquetes: T.n, meanT: T.mean(), eventos: sim.events };
}
const t0 = performance.now(); const r = correr(42); const dt = (performance.now() - t0) / 1000;
const raw = require('./des.js'); const t1 = performance.now(); const q = raw.run(42, H); const dt2 = (performance.now() - t1) / 1000;
console.log(JSON.stringify({ horizonte_min: H, generadores: { ...r, segundos: +dt.toFixed(3), paquetes_por_s: Math.round(r.paquetes / dt), eventos_por_s: Math.round(r.eventos / dt) },
  callbacks_des_js: { paquetes: q.done, meanT: q.meanT, eventos: q.ev, segundos: +dt2.toFixed(3), paquetes_por_s: Math.round(q.done / dt2), eventos_por_s: Math.round(q.ev / dt2) },
  costo_relativo_generadores: +((dt / r.paquetes) / (dt2 / q.done)).toFixed(2) }));
