"""Compara la DISTRIBUCIÓN de los KPI del oráculo SimPy contra el motor de Andén (F2 y F3) en N noches por lado.
Criterio propuesto para las pruebas: diferencia de medias de Welch con |z| <= 3,5 en cada KPI (Bonferroni sobre 20 KPI, FWER ~ 1 %) y
Kolmogorov-Smirnov con p > 0,001 en finClasificacionMin, esperaMediaMin y esperaP90Min.
Uso: python3 -I oraculo/estadistico.py C1-estocastico --n 300 [--mutantes]"""
import argparse, json, math, os, subprocess, sys, time
import numpy as np
from scipy import stats
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hub_simpy import Noche, compilar, KPIS, una_noche
from concurrent.futures import ProcessPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(AQUI)
SOLO_F3 = {"recirculacionPct", "vueltasExtra", "paradasLazo", "minutosLazoDetenido"}
KS_KPIS = ["finClasificacionMin", "esperaMediaMin", "esperaP90Min"]
Z_MAX = 3.5

def motor(modelo, fid, n, semilla):
    out = os.path.join(RAIZ, "resultados", f"motor-{os.path.basename(modelo)[:-5]}-{fid}-n{n}.json")
    t0 = time.time()
    r = subprocess.run(["node", os.path.join(AQUI, "correr-motor.mjs"), f"--modelo={modelo}", f"--fid={fid}", f"--n={n}", f"--semilla={semilla}", "--series=no", f"--out={out}"],
                       check=True, capture_output=True, text=True, cwd=RAIZ)
    d = json.load(open(out))
    return {k: np.array([r["kpi"][k] for r in d["replicas"]], float) for k in KPIS}, d["motor"], sum(len(r["alertas"]) for r in d["replicas"])

def simpy_n(modelo_json, n, semilla, jobs, mutante=None, lazo="F2"):
    if mutante is None:
        with ProcessPoolExecutor(max_workers=jobs) as ex:
            reps = list(ex.map(una_noche, [(modelo_json, semilla, r, lazo) for r in range(n)], chunksize=4))
        return {k: np.array([r["kpi"][k] for r in reps], float) for k in KPIS}, int(np.mean([r["ms"] for r in reps]))
    cfg = compilar(modelo_json)
    ks = [Noche(cfg, semilla, r, mutante=mutante).correr() for r in range(n)]
    return {k: np.array([x[k] for x in ks], float) for k in KPIS}, 0

def comparar(a, b, claves):
    filas = {}
    for k in claves:
        x, y = a[k], b[k]
        ma, mb = x.mean(), y.mean()
        se = math.sqrt(x.var(ddof=1) / len(x) + y.var(ddof=1) / len(y))
        z = 0.0 if se == 0 and ma == mb else (math.inf if se == 0 else (ma - mb) / se)
        rel = 0.0 if ma == mb else abs(ma - mb) / max(abs(ma), abs(mb), 1e-12)
        fila = {"simpy": float(ma), "motor": float(mb), "z": float(z), "relPct": float(100 * rel), "ok": bool(abs(z) <= Z_MAX)}
        if k in KS_KPIS:
            fila["ks_p"] = float(stats.ks_2samp(x, y).pvalue)
            fila["ok"] = bool(fila["ok"] and fila["ks_p"] > 0.001)
        filas[k] = fila
    return filas

def tabla(titulo, filas):
    print(f"\n{titulo}")
    print(f"{'KPI':24s} {'SimPy':>12s} {'motor':>12s} {'dif %':>7s} {'z':>7s} {'KS p':>8s}")
    for k, f in filas.items():
        print(f"{k:24s} {f['simpy']:12.4f} {f['motor']:12.4f} {f['relPct']:7.2f} {f['z']:7.2f} {f.get('ks_p', float('nan')):8.3f}  {'ok' if f['ok'] else 'FALLA'}")
    print(f"   -> {sum(f['ok'] for f in filas.values())} de {len(filas)} KPI dentro del criterio")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("escenario"); ap.add_argument("--n", type=int, default=300); ap.add_argument("--semilla", type=int, default=20261030)
    ap.add_argument("--jobs", type=int, default=3); ap.add_argument("--mutantes", action="store_true"); ap.add_argument("--lazo", default="F2", choices=["F2", "F3-lite"]); ap.add_argument("--nm", type=int, default=100)
    a = ap.parse_args()
    ruta = os.path.join(AQUI, "modelos", a.escenario + ".json")
    m = json.load(open(ruta, encoding="utf8"))
    t0 = time.time()
    f2, i2, al2 = motor(ruta, "F2", a.n, a.semilla)
    f3, i3, al3 = motor(ruta, "F3", a.n, a.semilla)
    sp, ms_sp = simpy_n(m, a.n, a.semilla, a.jobs, lazo=a.lazo)
    claves2 = [k for k in KPIS if k not in SOLO_F3]
    if a.lazo == "F2":
        r2, r3 = comparar(sp, f2, claves2), comparar(sp, f3, claves2)
        tabla(f"{a.escenario}: SimPy[F2] vs motor F2 (n={a.n} por lado)", r2)
        tabla(f"{a.escenario}: SimPy[F2] vs motor F3 (n={a.n} por lado)", r3)
    else:
        r2, r3 = comparar(sp, f2, claves2), comparar(sp, f3, list(KPIS))
        tabla(f"{a.escenario}: SimPy[F3-lite] vs motor F2 (n={a.n} por lado)", r2)
        tabla(f"{a.escenario}: SimPy[F3-lite] vs motor F3 (n={a.n} por lado), los 24 KPI", r3)
    print(f"\nmotor F2 {i2['msPorNoche']} ms/noche, F3 {i3['msPorNoche']} ms/noche, SimPy {ms_sp} ms/noche; alertas del motor: F2 {al2}, F3 {al3}; total {time.time()-t0:.0f} s")
    salida = {"escenario": a.escenario, "lazo": a.lazo, "n": a.n, "semilla": a.semilla, "motorF2": r2, "motorF3": r3, "ms_por_noche": {"F2": i2["msPorNoche"], "F3": i3["msPorNoche"], "simpy": ms_sp}}
    if a.mutantes:
        pot = {}
        f2m, _, _ = motor(ruta, "F2", a.nm, a.semilla + 1)
        for mut in Noche.MUTANTES:
            spm, _ = simpy_n(m, a.nm, a.semilla + 2, 1, mutante=mut, lazo=a.lazo)
            rm = comparar(spm, f2m, claves2)
            malos = {k: round(float(f["z"]), 1) for k, f in rm.items() if not f["ok"]}
            pot[mut] = {"detectado": bool(malos), "kpi_que_fallan": malos}
            print(f"mutante {mut:32s} {'DETECTADO' if malos else 'no detectado':14s} {malos}")
        salida["mutantes"] = {"n": a.nm, "resultado": pot}
    json.dump(salida, open(os.path.join(RAIZ, "resultados", f"estadistico-{a.escenario}{'' if a.lazo == 'F2' else '-f3lite'}.json"), "w"), indent=1)

main()
