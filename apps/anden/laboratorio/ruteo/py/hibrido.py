"""Arranque en caliente: una heuristica rapida (VROOM, OR-Tools) construye una solucion y PyVRP la mejora. Mide si el hibrido supera a cada pieza sola con el mismo
tiempo total. Uso: python3 hibrido.py <n> <segundos_totales>"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, evaluar, RAIZ
from resolutores import resolver_pyvrp, resolver_ortools, resolver_vroom, solucion_pyvrp
n, total = int(sys.argv[1]), float(sys.argv[2])
inst = Instancia(n); out = {"n": n, "total_s": total, "corridas": []}
def reg(nombre, rutas, seg, extra=None):
    ev = evaluar(inst, rutas); out["corridas"].append({"nombre": nombre, "seg": round(seg, 1), "factible": ev["factible"], "costo_USD": ev["costo_USD"], "vehiculos": ev["vehiculos"], "por_tipo": ev["por_tipo"], "errores": ev["errores"][:2], "carga": round(os.getloadavg()[0], 1), **(extra or {})})
    print(out["corridas"][-1], flush=True)
# H1: VROOM (nivel 5) -> PyVRP
t0 = time.time(); v = resolver_vroom(inst, 5); tv = time.time() - t0
reg("vroom_nivel5_solo", v["rutas"], tv)
m = resolver_pyvrp(inst, 1)["modelo"]            # solo para tener el modelo con la misma definicion
ini = solucion_pyvrp(m, v["rutas"])
rest = max(total - tv, 5)
h = resolver_pyvrp(inst, rest, semilla=1, inicial=ini); reg("vroom5 + pyvrp", h["rutas"], tv + rest, {"pyvrp_seg": round(rest, 1)})
# H2: OR-Tools 10 s -> PyVRP
t0 = time.time(); o = resolver_ortools(inst, 10, primera="PATH_CHEAPEST_ARC"); to = time.time() - t0
reg("ortools_pca_10s_solo", o["rutas"], to)
ini2 = solucion_pyvrp(m, o["rutas"])
h2 = resolver_pyvrp(inst, total - to, semilla=1, inicial=ini2); reg("ortools10 + pyvrp", h2["rutas"], total)
# referencia: PyVRP solo con el mismo total
p = resolver_pyvrp(inst, total, semilla=1); reg("pyvrp_solo_s1", p["rutas"], total)
p = resolver_pyvrp(inst, total, semilla=2); reg("pyvrp_solo_s2", p["rutas"], total)
json.dump(out, open(os.path.join(RAIZ, "resultados", f"hibrido_{n}_{int(total)}s.json"), "w"), default=lambda o: o.item() if hasattr(o, "item") else str(o), indent=1)
