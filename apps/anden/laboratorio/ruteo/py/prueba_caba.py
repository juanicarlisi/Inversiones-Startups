"""Corre un solucionador sobre la instancia CABA de n paradas y guarda resultados/<archivo>.json.
Uso: python3 prueba_caba.py <n> <segundos> pyvrp <semilla>   |   python3 prueba_caba.py <n> <segundos> ortools <primera_estrategia> [metaheuristica]"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, evaluar, RAIZ
from resolutores import resolver_pyvrp, resolver_ortools, costo_en

n, seg, quien = int(sys.argv[1]), float(sys.argv[2]), sys.argv[3]
FF = float(os.environ.get('FIJO_FACTOR', '1'))
inst = Instancia(n, fijo_factor=FF)
sufijo = '' if FF == 1.0 else f'_ff{FF:g}'
carga0 = os.getloadavg()[0]; cpu0 = time.process_time(); pared0 = time.time()
if quien == "pyvrp":
    etiqueta = f"pyvrp_s{sys.argv[4]}"
    r = resolver_pyvrp(inst, seg, semilla=int(sys.argv[4]))
else:
    meta = sys.argv[5] if len(sys.argv) > 5 else "GUIDED_LOCAL_SEARCH"
    etiqueta = f"ortools_{sys.argv[4]}_{meta}"
    r = resolver_ortools(inst, seg, primera=sys.argv[4], meta=meta)
carga1 = os.getloadavg()[0]; cpu_ratio = (time.process_time() - cpu0) / (time.time() - pared0)
ev = evaluar(inst, r["rutas"]) if r.get("rutas") else {"factible": False, "errores": ["sin solucion"]}
checks = [2, 5, 10, 20, 30, 60, 120]
out = {"fijo_factor": FF, "n": n, "limite_s": seg, "solver": etiqueta, "evaluacion": ev, "curva": r["curva"], "iteraciones": r.get("iteraciones"),
       "en_t": {str(t): costo_en(r["curva"], t) for t in checks if t <= seg}, "carga_cpu_ini_fin": [carga0, carga1], "cpu_sobre_pared": round(cpu_ratio, 2), "rutas": r.get("rutas")}
os.makedirs(os.path.join(RAIZ, "resultados"), exist_ok=True)
json.dump(out, open(os.path.join(RAIZ, "resultados", f"caba{n}_{int(seg)}s_{etiqueta}{sufijo}.json"), "w"), default=lambda o: o.item() if hasattr(o, "item") else str(o))
print(etiqueta, n, seg, "factible" if ev["factible"] else ev["errores"], ev.get("costo_USD"), "USD", ev.get("vehiculos"), "veh", ev.get("km"), "km", "carga", round(carga0, 1), round(carga1, 1), "cpu/pared", round(cpu_ratio, 2), flush=True)
