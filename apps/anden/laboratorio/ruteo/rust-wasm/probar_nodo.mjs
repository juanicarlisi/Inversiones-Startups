// vrp-cli 1.25.0 (Rust -> WebAssembly) en Node sobre la instancia CABA. Uso: node probar_nodo.mjs <n> <segundos> [salida.json]
import { createRequire } from "node:module"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const aqui = path.dirname(fileURLToPath(import.meta.url)); const vrp = createRequire(import.meta.url)("./pkg-node/vrp_wasm_prueba.js");
const n = +process.argv[2] || 200, seg = +process.argv[3] || 10, salida = process.argv[4], suf = process.argv[5] || "";
const { problem, matrices } = JSON.parse(fs.readFileSync(path.join(aqui, `../web/datos/vrp_rs_${n}${suf}.json`), "utf8"));
const t0 = performance.now(); let sol;
try { sol = vrp.solve_pragmatic(problem, matrices, { termination: { maxTime: seg } }); } catch (e) { console.log(JSON.stringify({ n, seg, error: String(e.message || e).slice(0, 600) })); process.exit(1); }
const ms = performance.now() - t0; if (typeof sol === "string") sol = JSON.parse(sol);
const rutas = sol.tours.map(t => [t.typeId, t.stops.flatMap(s => s.activities.filter(a => a.type === "delivery").map(a => +a.jobId.slice(1)))]);
const res = { fijo_factor: suf ? +suf.replace('_ff', '') : 1, n, limite_s: seg, pared_ms: Math.round(ms), costo_rs: sol.statistic.cost, vehiculos: sol.tours.length, sin_asignar: (sol.unassigned || []).length, rutas };
if (salida) fs.writeFileSync(salida, JSON.stringify(res)); console.log(JSON.stringify({ ...res, rutas: undefined }));
