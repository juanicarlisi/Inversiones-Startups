"""Robustez del hibrido VROOM -> PyVRP: niveles de exploracion 1, 2 y 3 de VROOM y dos semillas de PyVRP, mismo total de 60 s por corrida. Uso: python3 hibrido2.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, evaluar, RAIZ
from resolutores import resolver_pyvrp, resolver_vroom, solucion_pyvrp
inst = Instancia(200); total = 60.0; out = []
m = resolver_pyvrp(inst, 1)["modelo"]
for nivel in (1, 2, 3):
    t0 = time.time(); v = resolver_vroom(inst, nivel); tv = time.time() - t0
    ev0 = evaluar(inst, v["rutas"])
    for semilla in (1, 2):
        ini = solucion_pyvrp(m, v["rutas"]); rest = max(total - tv, 5)
        h = resolver_pyvrp(inst, rest, semilla=semilla, inicial=ini); ev = evaluar(inst, h["rutas"])
        out.append({"vroom_nivel": nivel, "vroom_seg": round(tv, 1), "vroom_costo_USD": ev0["costo_USD"], "vroom_factible": ev0["factible"], "semilla": semilla, "pyvrp_seg": round(rest, 1),
                    "total_s": round(tv + rest, 1), "factible": ev["factible"], "costo_USD": ev["costo_USD"], "veh": ev["vehiculos"], "por_tipo": ev["por_tipo"], "carga": round(os.getloadavg()[0], 1)})
        print(out[-1], flush=True)
json.dump(out, open(os.path.join(RAIZ, "resultados", "hibrido2_200_60s.json"), "w"), default=lambda o: o.item() if hasattr(o, "item") else str(o), indent=1)
