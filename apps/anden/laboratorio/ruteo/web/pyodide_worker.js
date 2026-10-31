// Worker: Pyodide 314.0.7 + PyVRP (rueda WebAssembly de PyPI) resolviendo la instancia CABA fuera del hilo de la interfaz.
import { loadPyodide } from "./node_modules/pyodide/pyodide.mjs";
const RUEDAS = ["numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl", "vrplib-2.1.0-py3-none-any.whl", "pyvrp-0.14.1-cp314-cp314-pyemscripten_2026_0_wasm32.whl"];
self.onmessage = async (e) => {
  const { n, seg, semilla, rebanada, iter, suf } = e.data; const marcas = {}; const t0 = performance.now(); const lap = (k) => (marcas[k] = Math.round(performance.now() - t0));
  try {
    const py = await loadPyodide({ indexURL: new URL("./node_modules/pyodide/", import.meta.url).href }); lap("pyodide_listo_ms");
    for (const w of RUEDAS) await py.loadPackage(new URL("./vendor/pyodide-paquetes/" + w, import.meta.url).href); lap("paquetes_listos_ms");
    py.FS.mkdirTree("/lab");
    for (const f of ["modelo.py", "resolutores.py"]) py.FS.writeFile("/lab/" + f, new Uint8Array(await (await fetch(new URL("../py/" + f, import.meta.url))).arrayBuffer()));
    py.FS.writeFile("/lab/instancia.json", new Uint8Array(await (await fetch(new URL(`./datos/caba${n}${suf || ""}.json`, import.meta.url))).arrayBuffer())); lap("archivos_listos_ms");
    py.globals.set("PARAM", py.toPy({ seg, semilla, rebanada: rebanada || 0, iter: iter || 0 }));
    const salida = await py.runPythonAsync(`
import sys, json, time
sys.path.insert(0, "/lab")
from modelo import Instancia, evaluar
from resolutores import resolver_pyvrp
P = dict(PARAM) if isinstance(PARAM, dict) else PARAM.to_py()
inst = Instancia.desde_dict(json.load(open("/lab/instancia.json")))
t = time.time()
if P["rebanada"] > 0:
    # solucion por rebanadas: cada una arranca de la mejor anterior (permite mostrar progreso en vivo); registra el costo tras cada rebanada
    best = None; it = 0; trazas = []; resto = P["seg"]
    while resto > 1e-6:
        dt = min(P["rebanada"], resto); r = resolver_pyvrp(inst, dt, semilla=P["semilla"] + int(it), inicial=best); best = r["best"]; it += 1; resto -= dt
        trazas.append([round(time.time() - t, 2), r["costo_pyvrp"]])
    r["trazas"] = trazas
else:
    r = resolver_pyvrp(inst, P["seg"], semilla=P["semilla"], max_iter=(P["iter"] or None))
ev = evaluar(inst, r["rutas"])
json.dumps({"factible": ev["factible"], "costo_USD": ev["costo_USD"], "veh": ev["vehiculos"], "km": float(ev["km"]), "iteraciones": r["iteraciones"], "segundos": round(time.time() - t, 2), "trazas": r.get("trazas")})
`); lap("resuelto_ms");
    postMessage({ ok: true, marcas, resultado: JSON.parse(salida) });
  } catch (err) { postMessage({ ok: false, error: String(err), marcas }); }
};
