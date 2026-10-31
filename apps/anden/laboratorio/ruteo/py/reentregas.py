"""Re-entregas: 12% de las 200 paradas fallan ('ausente'), vuelven al deposito y se reprograman el mismo dia en una SEGUNDA OLA (16-20 h) junto con pedidos nuevos
de ultima hora. Mide cuanto tardan PyVRP y OR-Tools en re-planificar y a que costo. Flota de la 2da ola: 6 van_s + 2 van_l disponibles de 15 a 21 h (jornada 6 h).
Uso: python3 reentregas.py <semilla_fallas> <segundos>"""
import json, os, sys, time
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, evaluar, RAIZ
from resolutores import resolver_pyvrp, resolver_ortools, resolver_vroom

semilla, seg = int(sys.argv[1]), float(sys.argv[2])
rng = np.random.default_rng(semilla)
fallidos = sorted(int(x) for x in rng.choice(np.arange(1, 201), size=24, replace=False))
nuevos = sorted(int(x) for x in rng.choice(np.arange(201, 401), size=16, replace=False))   # pedidos de ultima hora (clientes 201..400 de la instancia)
ids = fallidos + nuevos
H = 3600
tw = {i: (16 * H, 20 * H) for i in fallidos}
tw.update({i: (16 * H, 21 * H) for i in nuevos})
flota = [t for t in json.load(open(os.path.join(RAIZ, "datos", "flota.json"))) if t["tipo"] != "moto"]
for t in flota:
    t["cantidad"] = 6 if t["tipo"] == "van_s" else 2; t["jornada_max_s"] = 6 * H
inst = Instancia(clientes_ids=ids, tw_override=tw, flota=flota, deposito_ventana=(15 * H, 21 * H))
out = {"semilla": semilla, "fallidos": len(fallidos), "nuevos": len(nuevos), "n": inst.n, "limite_s": seg, "carga": os.getloadavg()[0]}
res = {}
for s in (1, 2, 3):
    r = resolver_pyvrp(inst, seg, semilla=s); res[f"pyvrp_s{s}"] = (r, evaluar(inst, r["rutas"]))
for f in ("PATH_CHEAPEST_ARC", "PARALLEL_CHEAPEST_INSERTION", "SAVINGS"):
    r = resolver_ortools(inst, seg, primera=f); res[f"ortools_{f}"] = (r, evaluar(inst, r["rutas"]) if r.get("rutas") else {"factible": False, "errores": ["sin solucion"]})
r = resolver_vroom(inst, 5); res["vroom_5"] = (r, evaluar(inst, r["rutas"]) if r["rutas"] else {"factible": False})
out["resultados"] = {k: {"seg": round(v[0]["segundos"], 2), **{a: v[1].get(a) for a in ("factible", "costo_USD", "vehiculos", "km", "por_tipo", "errores")}} for k, v in res.items()}
json.dump(out, open(os.path.join(RAIZ, "resultados", f"reentregas_s{semilla}_{int(seg)}s.json"), "w"), default=lambda o: o.item() if hasattr(o, "item") else str(o), indent=1)
for k, v in out["resultados"].items(): print(k, v["seg"], "s", v["factible"], v["costo_USD"], v["vehiculos"], v["por_tipo"], v["errores"])
