"""Resumen de puntajes de la ronda 2 por estilo y forma de pedir: python ronda2_resumen.py puntajes.jsonl"""
import json, sys
from collections import defaultdict
filas = [json.loads(l) for l in open(sys.argv[1])]
por = defaultdict(list)
for f in filas:
    por[(f["estilo"], f["forma"])].append(f)
estilos = sorted({f["estilo"] for f in filas}, key=lambda e: [f["estilo"] for f in filas].index(e))
for e in estilos:
    print(f"\n{e}")
    for (ee, forma), fs in sorted(por.items()):
        if ee != e:
            continue
        m = lambda k: sum(x[k] for x in fs) / len(fs)
        print(f"  {forma:3} n={len(fs)} puntaje {m('puntaje'):.2f}  PQ {m('PQ'):.2f}  CE {m('CE'):.2f}  CU {m('CU'):.2f}  "
              f"clap# {m('clap_rango'):.1f}  corr {m('corr_lr'):.2f}  planitud {m('planitud_agudo'):.2f}")
    mejores = sorted([f for f in filas if f["estilo"] == e], key=lambda f: -f["puntaje"])[:3]
    for f in mejores:
        print(f"    * {f['id']:32} {f['puntaje']:.3f} (PQ {f['PQ']:.2f} CE {f['CE']:.2f} peor {f['PQ_peor10s']:.2f} clap {f['clap_top']})")
