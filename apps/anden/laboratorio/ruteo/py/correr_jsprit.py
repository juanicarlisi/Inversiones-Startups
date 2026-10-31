"""Corre jsprit 2.0.0 (Java 21) sobre la instancia CABA y evalua con el evaluador independiente. Uso: python3 correr_jsprit.py <n> <segundos>"""
import json, os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, evaluar, RAIZ
n, seg = int(sys.argv[1]), float(sys.argv[2])
txt = os.path.join(RAIZ, "datos", f"caba{n}.txt")
if not os.path.exists(txt): subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "exportar_texto.py"), str(n), txt], check=True)
J = os.path.join(RAIZ, "jsprit")
t0 = time.time(); cpu0 = os.times()
p = subprocess.run(["java", "-Xmx2g", "-cp", f"{J}/classes:{J}/lib/*", "Prueba", txt, str(seg)], capture_output=True, text=True)
el = time.time() - t0
lines = [l for l in p.stdout.splitlines() if l.startswith(("RESULT", "R "))]
if not lines: print("fallo", p.stderr[-800:]); sys.exit(1)
res = lines[0].split(); rutas = [(l.split()[1], [int(x) for x in l.split()[2:]]) for l in lines[1:]]
inst = Instancia(n); ev = evaluar(inst, rutas)
out = {"n": n, "limite_s": seg, "solver": "jsprit_2.0.0", "pared_s": round(el, 1), "jsprit_costo": float(res[2]), "sin_asignar": int(res[3]), "evaluacion": ev, "carga": os.getloadavg()[0], "rutas": rutas}
json.dump(out, open(os.path.join(RAIZ, "resultados", f"caba{n}_{int(seg)}s_jsprit.json"), "w"), default=lambda o: o.item() if hasattr(o, "item") else str(o))
print("jsprit", n, seg, "s ->", ev["factible"], ev["costo_USD"], ev["vehiculos"], ev["por_tipo"], ev["errores"][:2], "sin asignar", res[3])
