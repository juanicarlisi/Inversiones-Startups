"""Tabla de todas las corridas CABA (resultados/caba*_*.json) con costo verificado por el evaluador independiente."""
import glob, json, os, re, statistics as st
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
filas = []
for f in sorted(glob.glob(os.path.join(RAIZ, "resultados", "caba*_*.json"))):
    d = json.load(open(f)); e = d["evaluacion"]
    m = re.match(r"caba(\d+)_(\d+)s_(.*)\.json", os.path.basename(f))
    n, t, nom = int(m.group(1)), int(m.group(2)), m.group(3)
    filas.append((n, t, nom, e.get("costo_USD"), e.get("factible"), e.get("vehiculos"), e.get("km"), d.get("cpu_sobre_pared"), (e.get("errores") or [""])[0][:40], d.get("en_t")))
print(f"{'n':>4}{'s':>4}  {'solucionador':58s}{'USD':>9}{'fact':>6}{'veh':>4}{'km':>7}{'cpu/pared':>10}")
for r in filas:
    print(f"{r[0]:4d}{r[1]:4d}  {r[2][:58]:58s}{r[3]:9.1f}{str(r[4])[0]:>6}{r[5]:4d}{r[6]:7.1f}{(r[7] if r[7] is not None else float('nan')):10.2f} {r[8]}")
