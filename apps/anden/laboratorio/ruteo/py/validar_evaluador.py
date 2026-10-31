"""Valida el evaluador independiente contra las propias cuentas de PyVRP (duracion minima por ruta y costo) en una solucion de 100 paradas."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, evaluar, duracion_minima
from resolutores import resolver_pyvrp
inst = Instancia(100)
r = resolver_pyvrp(inst, 5, semilla=7)
ev = evaluar(inst, r["rutas"])
print("costo PyVRP", r["costo_pyvrp"], "| costo evaluador", ev["costo_mUSD"], "| factible evaluador", ev["factible"])
dif = []
for rr, (t, ruta) in zip(r["best"].routes(), r["rutas"]):
    mi = duracion_minima(inst, t, ruta)
    dif.append(abs(rr.duration() - mi[0]))
print("rutas", len(dif), "| diferencia maxima de duracion minima (s) entre PyVRP y el evaluador:", max(dif))
