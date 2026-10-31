"""Exporta la instancia al formato 'pragmatic' del solucionador Rust vrp-cli (reinterpretcat/vrp, Apache-2.0).
Costo: fijo + distancia (mUSD por metro = por_km/1000) + tiempo 0. Un perfil de matriz por tipo de vehiculo. Uso: python3 exportar_vrp_rs.py <n>"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, RAIZ
n = int(sys.argv[1]) if len(sys.argv) > 1 else 200
FF = float(os.environ.get('FIJO_FACTOR', '1')); suf = '' if FF == 1.0 else f'_ff{FF:g}'
I = Instancia(n, fijo_factor=FF)
def hora(s): s = int(s); return f"2026-10-30T{s//3600:02d}:{(s%3600)//60:02d}:{s%60:02d}Z"
jobs = [{"id": f"c{c}", "deliveries": [{"places": [{"location": {"index": c}, "duration": int(I.servicio[c]), "times": [[hora(I.tw_ini[c]), hora(I.tw_fin[c])]]}],
         "demand": [int(I.demanda[c])]}]} for c in range(1, n + 1)]
vehiculos = [{"typeId": T["tipo"], "vehicleIds": [f"{T['tipo']}_{k}" for k in range(T["cantidad"])], "profile": {"matrix": T["tipo"]},
              "costs": {"fixed": float(T["fijo_mUSD"]), "distance": T["por_km_mUSD"] / 1000.0, "time": 0.0},
              "shifts": [{"start": {"earliest": hora(I.tw_ini[0]), "location": {"index": 0}}, "end": {"latest": hora(I.tw_fin[0]), "location": {"index": 0}}}],
              "capacity": [int(T["capacidad"])], "limits": {"maxDuration": int(T["jornada_max_s"])}} for T in I.flota]
problema = {"plan": {"jobs": jobs}, "objectives": [{"type": "minimize-unassigned"}, {"type": "minimize-cost"}], "fleet": {"vehicles": vehiculos, "profiles": [{"name": T["tipo"]} for T in I.flota]}}
matrices = [{"profile": T["tipo"], "travelTimes": I.dur[T["tipo"]].ravel().tolist(), "distances": I.dist.ravel().tolist()} for T in I.flota]
p = os.path.join(RAIZ, "web", "datos", f"vrp_rs_{n}{suf}.json")
json.dump({"problem": problema, "matrices": matrices}, open(p, "w"), separators=(",", ":"))
print(p, os.path.getsize(p) // 1024, "KB")
