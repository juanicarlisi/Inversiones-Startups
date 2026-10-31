"""Resume resultados/literatura_<s>s.json: brecha (%) contra la mejor solucion conocida por instancia y solucionador. Uso: python3 resumen_literatura.py <segundos>"""
import json, os, sys, statistics as st
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(RAIZ, "resultados", f"literatura_{sys.argv[1]}s.json")))
por = {}
for r in d["resultados"]: por.setdefault(r["instancia"], []).append(r)
print(f"limite {d['segundos']} s, {d['procesos']} procesos en paralelo, carga CPU {d['carga_ini_fin']}")
print(f"{'instancia':16s}{'BKS':>9s} | {'PyVRP prom':>11s}{'mejor':>8s}{'veh':>5s} | {'OR-T mejor cfg':>14s}{'cfg':>8s}{'prom factibles':>16s}{'infact.':>8s} | cpu/seg")
gp, gb, go, go_prom = [], [], [], []
for nom, rs in por.items():
    b = d["bks"][nom]
    py = [r for r in rs if r["solver"].startswith("pyvrp") and r["factible"]]
    ot = [r for r in rs if r["solver"].startswith("ortools") and r["factible"]]
    inf = sum(1 for r in rs if r["solver"].startswith("ortools") and not r["factible"])
    gap = lambda c: (c - b) / b * 100
    pm = st.mean(gap(r["costo"]) for r in py); pb = min(gap(r["costo"]) for r in py)
    ob = min(ot, key=lambda r: r["costo"]); op = st.mean(gap(r["costo"]) for r in ot) if ot else float("nan")
    cpu = st.mean(r["cpu"] / r["seg"] for r in rs if r.get("cpu") and r["seg"])
    gp.append(pm); gb.append(pb); go.append(gap(ob["costo"])); go_prom.append(op)
    print(f"{nom:16s}{b:9.1f} | {pm:10.2f}%{pb:7.2f}%{min(r['veh'] for r in py):5d} | {gap(ob['costo']):13.2f}%{ob['solver'].split('_',1)[1][:7]:>8s}{op:15.2f}%{inf:8d} | {cpu:.2f}")
print(f"{'MEDIA':16s}{'':9s} | {st.mean(gp):10.2f}%{st.mean(gb):7.2f}%{'':5s} | {st.mean(go):13.2f}%{'':8s}{st.mean(go_prom):15.2f}%")
