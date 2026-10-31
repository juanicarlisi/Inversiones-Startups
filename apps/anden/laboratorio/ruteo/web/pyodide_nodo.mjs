// PyVRP corriendo en WebAssembly (Pyodide 314.0.7 + rueda pyemscripten de PyPI) dentro de Node. Mismo codigo Python que la prueba nativa.
// Uso: node pyodide_nodo.mjs <n> <segundos> <semilla>
import { loadPyodide } from "pyodide";
import fs from "node:fs"; import http from "node:http"; import path from "node:path"; import { fileURLToPath } from "node:url";
const aqui = path.dirname(fileURLToPath(import.meta.url));
const n = +process.argv[2] || 200, seg = +process.argv[3] || 10, semilla = +process.argv[4] || 1, iter = +process.argv[5] || 0;
const srv = http.createServer((q, r) => { const f = path.join(aqui, "vendor/pyodide-paquetes", path.basename(q.url)); fs.existsSync(f) ? (r.writeHead(200), r.end(fs.readFileSync(f))) : (r.writeHead(404), r.end()); });
await new Promise(ok => srv.listen(0, "127.0.0.1", ok)); const puerto = srv.address().port;
const t0 = performance.now();
const py = await loadPyodide();
const t1 = performance.now();
const ruedas = ["numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl", "vrplib-2.1.0-py3-none-any.whl", "pyvrp-0.14.1-cp314-cp314-pyemscripten_2026_0_wasm32.whl"];
for (const w of ruedas) await py.loadPackage(`http://127.0.0.1:${puerto}/${w}`);
const t2 = performance.now();
py.FS.mkdirTree("/lab");
for (const f of ["modelo.py", "resolutores.py"]) py.FS.writeFile("/lab/" + f, fs.readFileSync(path.join(aqui, "../py", f)));
py.FS.writeFile("/lab/instancia.json", fs.readFileSync(path.join(aqui, `datos/caba${n}.json`)));
const salida = await py.runPythonAsync(`
import sys, json, time
sys.path.insert(0, "/lab")
from modelo import Instancia, evaluar
from resolutores import resolver_pyvrp
import pyvrp, platform
t=time.time(); inst = Instancia.desde_dict(json.load(open("/lab/instancia.json"))); tcarga=time.time()-t
r = resolver_pyvrp(inst, ${seg}, semilla=${semilla}, max_iter=${iter || 'None'})
ev = evaluar(inst, r["rutas"])
json.dumps({"python": platform.python_version(), "factible": ev["factible"], "costo_USD": ev["costo_USD"], "veh": ev["vehiculos"], "km": float(ev["km"]),
            "iteraciones": r["iteraciones"], "segundos": r["segundos"], "curva_ult": r["curva"][-1] if r["curva"] else None, "t_carga_inst_s": tcarga})
`);
const t3 = performance.now();
console.log(JSON.stringify({ n, limite_s: seg, iter_fijas: iter, semilla, arranque_pyodide_ms: Math.round(t1 - t0), carga_paquetes_ms: Math.round(t2 - t1), total_ms: Math.round(t3 - t0), ...JSON.parse(salida) }));
srv.close();
