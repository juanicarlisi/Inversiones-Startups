"""Sensibilidad de las pruebas exactas: rompe una regla del oráculo a propósito (mutante) y mide si los modelos A1..A5 lo detectan.
Un mutante «detectado» = algún KPI se aparta del motor F2 (que da lo mismo que el oráculo sano, ver exacto.py).
Uso: python3 -I oraculo/sensibilidad.py"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hub_simpy import Noche, compilar, KPIS

AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(AQUI)
ESC = ["A1-exacto-base", "A2-exacto-pausas-atraso", "A3-exacto-estres", "A4-exacto-contiguas-en-orden", "A5-exacto-cinta-limita"]
sano = {}
for e in ESC:
    m = json.load(open(os.path.join(AQUI, "modelos", e + ".json"), encoding="utf8"))
    sano[e] = Noche(compilar(m), 1, 0).correr()
    # el oráculo sano coincide con el motor F2 (resultados/motor-<e>-F2.json, ver exacto.py)
    f2 = json.load(open(os.path.join(RAIZ, "resultados", f"motor-{e}-F2.json")))["replicas"][0]["kpi"]
    assert all(abs(sano[e][k] - f2[k]) < 1e-6 for k in KPIS), e
res = {}
print(f"{'mutante':32s} " + " ".join(f"{e[:2]:>22s}" for e in ESC))
for mut in Noche.MUTANTES:
    fila = {}
    celdas = []
    for e in ESC:
        m = json.load(open(os.path.join(AQUI, "modelos", e + ".json"), encoding="utf8"))
        k = Noche(compilar(m), 1, 0, mutante=mut).correr()
        dif = [x for x in KPIS if abs(k[x] - sano[e][x]) > 1e-6]
        fila[e] = {"detectado": bool(dif), "kpi_distintos": len(dif), "dFinMin": round(k["finClasificacionMin"] - sano[e]["finClasificacionMin"], 4)}
        celdas.append(f"{'SI' if dif else 'no'} {len(dif):2d} KPI Δfin {fila[e]['dFinMin']:+8.3f}")
    res[mut] = fila
    print(f"{mut:32s} " + " ".join(f"{c:>22s}" for c in celdas))
json.dump(res, open(os.path.join(RAIZ, "resultados", "sensibilidad.json"), "w"), indent=1)
print("\nmutantes detectados por al menos un modelo exacto:", sum(any(v['detectado'] for v in f.values()) for f in res.values()), "de", len(res))
