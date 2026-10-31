// Worker: vrp-cli 1.25.0 (Rust -> WebAssembly) resolviendo la instancia CABA fuera del hilo de la interfaz.
import init, { solve_pragmatic } from "./pkg-web/vrp_wasm_prueba.js";
self.onmessage = async (e) => {
  const { n, seg, suf } = e.data; const t0 = performance.now(); const marcas = {};
  try {
    await init(); marcas.wasm_listo_ms = Math.round(performance.now() - t0);
    const { problem, matrices } = await (await fetch(new URL(`../web/datos/vrp_rs_${n}${suf || ""}.json`, import.meta.url))).json(); marcas.datos_ms = Math.round(performance.now() - t0);
    const t1 = performance.now(); let sol = solve_pragmatic(problem, matrices, { termination: { maxTime: seg } }); const resuelto = performance.now() - t1;
    if (typeof sol === "string") sol = JSON.parse(sol);
    const rutas = sol.tours.map(t => [t.typeId, t.stops.flatMap(s => s.activities.filter(a => a.type === "delivery").map(a => +a.jobId.slice(1)))]);
    postMessage({ ok: true, marcas, resuelto_ms: Math.round(resuelto), costo_rs: sol.statistic.cost, veh: sol.tours.length, sin_asignar: (sol.unassigned || []).length, rutas });
  } catch (err) { postMessage({ ok: false, error: String(err).slice(0, 500), marcas }); }
};
