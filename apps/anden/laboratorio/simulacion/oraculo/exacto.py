"""Compara, KPI por KPI y al milisegundo, el oráculo SimPy contra el motor de Andén en los modelos EXACTOS (sin azar).
Uso: python3 -I oraculo/exacto.py A1-exacto-base [A2-... ...]"""
import json, subprocess, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hub_simpy import Noche, compilar, KPIS

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)

def motor(modelo, fid):
    out = os.path.join(RAIZ, "resultados", f"motor-{os.path.basename(modelo)[:-5]}-{fid}.json")
    subprocess.run(["node", os.path.join(AQUI, "correr-motor.mjs"), f"--modelo={modelo}", f"--fid={fid}", "--n=3", f"--out={out}"],
                   check=True, capture_output=True, cwd=RAIZ)
    d = json.load(open(out))
    return d["replicas"]

def main():
    nombres = sys.argv[1:]
    resumen = {}
    for nom in nombres:
        ruta = os.path.join(AQUI, "modelos", nom + ".json")
        m = json.load(open(ruta, encoding="utf8"))
        sp = Noche(compilar(m), 1, 0).correr()
        sp2 = Noche(compilar(m), 999, 7).correr()   # otra semilla: no debe cambiar nada si no hay azar
        f2 = motor(ruta, "F2"); f3 = motor(ruta, "F3")
        invariantes = all(r["kpi"] == f2[0]["kpi"] for r in f2) and all(sp[k] == sp2[k] for k in KPIS)
        print(f"\n== {nom}   (sin azar: las 3 réplicas del motor F2 son idénticas y SimPy con otra semilla da lo mismo: {invariantes})")
        print(f"{'KPI':24s} {'SimPy':>14s} {'motor F2':>14s} {'dif. F2':>12s} {'motor F3':>14s} {'dif. F3':>12s}")
        peor = 0.0; filas = {}
        for k in KPIS:
            a, b, c = sp[k], f2[0]["kpi"][k], f3[0]["kpi"][k]
            filas[k] = {"simpy": a, "motorF2": b, "motorF3": c}
            marca = "" if abs(a - b) < 1e-9 else "  <-- difiere"
            print(f"{k:24s} {a:14.4f} {b:14.4f} {a-b:12.4f} {c:14.4f} {a-c:12.4f}{marca}")
        resumen[nom] = {"invariante_sin_azar": invariantes, "kpi": filas}
    json.dump(resumen, open(os.path.join(RAIZ, "resultados", "exacto.json"), "w"), indent=1)

main()
