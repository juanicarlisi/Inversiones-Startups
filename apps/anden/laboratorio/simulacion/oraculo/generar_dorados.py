"""Genera los DORADOS del oráculo SimPy que usan las pruebas de Node (sin Python en el momento de probar).
  exactos:      KPI de A1..A5 (modelos sin azar), oráculo en modo F2.
  estadisticos: media, desvío y n de cada KPI en N noches de C1 y C2, en modo F2 y en modo F3-lite.
Regenerar solo si cambia el oráculo (hub_simpy.py) o los modelos. Uso: python3 -I oraculo/generar_dorados.py [--n 300] [--jobs 3]"""
import argparse, datetime, json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import simpy
from concurrent.futures import ProcessPoolExecutor
from hub_simpy import Noche, compilar, KPIS, una_noche, VERSION_ORACULO

AQUI = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument("--n", type=int, default=300); ap.add_argument("--jobs", type=int, default=3); ap.add_argument("--semilla", type=int, default=20261030)
a = ap.parse_args()
cargar = lambda nom: json.load(open(os.path.join(AQUI, "modelos", nom + ".json"), encoding="utf8"))
out = {"meta": {"oraculo": VERSION_ORACULO, "simpy": simpy.__version__, "numpy": np.__version__, "n": a.n, "semilla": a.semilla,
                "generado": datetime.date.today().isoformat(), "nota": "SimPy y el motor usan azar distinto: se compara la distribución (Welch), no la corrida."},
       "exactos": {}, "estadisticos": {}}
for nom in ["A1-exacto-base", "A2-exacto-pausas-atraso", "A3-exacto-estres", "A4-exacto-contiguas-en-orden", "A5-exacto-cinta-limita"]:
    out["exactos"][nom] = Noche(compilar(cargar(nom)), 1, 0).correr()
with ProcessPoolExecutor(max_workers=a.jobs) as ex:
    for nom in ["C1-estocastico", "C2-dominio-F2"]:
        m = cargar(nom)
        for lazo in ["F2", "F3-lite"]:
            reps = list(ex.map(una_noche, [(m, a.semilla, r, lazo) for r in range(a.n)], chunksize=4))
            kp = {k: np.array([r["kpi"][k] for r in reps], float) for k in KPIS}
            out["estadisticos"][f"{nom}|{lazo}"] = {"n": a.n, "kpi": {k: {"media": float(v.mean()), "desvio": float(v.std(ddof=1))} for k, v in kp.items()}}
            print(nom, lazo, "listo", flush=True)
os.makedirs(os.path.join(AQUI, "dorados"), exist_ok=True)
json.dump(out, open(os.path.join(AQUI, "dorados", f"simpy-{VERSION_ORACULO}.json"), "w"), indent=1)
