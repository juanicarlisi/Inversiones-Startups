"""Evalua con el evaluador independiente un JSON {n, rutas:[[tipo,[ids]]...], ...} de un solucionador externo (WASM/JS/Java) y guarda resultados/caba<n>_<T>s_<etiqueta>.json.
Uso: python3 evaluar_externo.py <entrada.json> <etiqueta>"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, evaluar, RAIZ
d = json.load(open(sys.argv[1])); et = sys.argv[2]
ff = d.get("fijo_factor", 1.0); inst = Instancia(d["n"], fijo_factor=ff); ev = evaluar(inst, [(t, r) for t, r in d["rutas"]])
out = {"fijo_factor": ff, "n": d["n"], "limite_s": d.get("limite_s"), "solver": et, "evaluacion": ev, "pared_ms": d.get("pared_ms"), "carga": os.getloadavg()[0], "rutas": d["rutas"], "sin_asignar": d.get("sin_asignar")}
f = os.path.join(RAIZ, "resultados", f"caba{d['n']}_{int(d['limite_s'])}s_{et}{'' if ff == 1.0 else f'_ff{ff:g}'}.json")
json.dump(out, open(f, "w"), default=lambda o: o.item() if hasattr(o, "item") else str(o))
print(et, d["n"], d.get("limite_s"), "s ->", "factible" if ev["factible"] else ev["errores"][:2], ev["costo_USD"], "USD", ev["vehiculos"], "veh", ev["por_tipo"], "sin asignar", d.get("sin_asignar"), "carga", round(os.getloadavg()[0], 1), flush=True)
