"""Exporta la instancia a texto plano (para jsprit/Java). Uso: python3 exportar_texto.py <n> <salida.txt>"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia
n, out = int(sys.argv[1]), sys.argv[2]
I = Instancia(n)
with open(out, "w") as f:
    f.write(f"{n} {len(I.flota)}\n")
    for T in I.flota:
        f.write(f"{T['tipo']} {T['cantidad']} {T['capacidad']} {T['fijo_mUSD']} {T['jornada_max_s']}\n")
    f.write(f"{I.tw_ini[0]} {I.tw_fin[0]}\n")
    for c in range(1, n + 1):
        f.write(f"{c} {I.demanda[c]} {I.servicio[c]} {I.tw_ini[c]} {I.tw_fin[c]}\n")
    for T in I.flota:
        for M in (I.dur[T["tipo"]], I.costo[T["tipo"]]):
            for row in M: f.write(" ".join(map(str, row)) + "\n")
