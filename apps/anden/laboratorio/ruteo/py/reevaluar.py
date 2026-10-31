"""Re-evalua con modelo.evaluar las rutas guardadas en resultados/caba*.json y actualiza el campo 'evaluacion'."""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, evaluar, RAIZ
cache = {}
for f in sorted(glob.glob(os.path.join(RAIZ, "resultados", "caba*_*.json"))):
    d = json.load(open(f))
    if not d.get("rutas"): continue
    n = d["n"]; ff = d.get("fijo_factor", 1.0); inst = cache.setdefault((n, ff), Instancia(n, fijo_factor=ff))
    ev = evaluar(inst, [(t, r) for t, r in d["rutas"]])
    ant = d["evaluacion"]
    cambio = "" if (ant.get("costo_USD") == ev["costo_USD"] and ant.get("factible") == ev["factible"]) else "  <-- CAMBIO"
    d["evaluacion"] = ev
    json.dump(d, open(f, "w"), default=lambda o: o.item() if hasattr(o, "item") else str(o))
    print(os.path.basename(f)[:70], "factible" if ev["factible"] else ev["errores"][:2], ev["costo_USD"], cambio)
