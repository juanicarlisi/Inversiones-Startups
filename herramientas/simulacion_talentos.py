#!/usr/bin/env python3
"""Simulación de la economía de Talentos de Senda (18-11-2026; docs/ECONOMIA.md §5 de la app).

ESTIMACIÓN, no medición: tres tipos de usuario inventados (casual, regular, intenso) durante 20 semanas desde el lanzamiento (SEMANAS=52 para un año),
300 corridas por tipo, medianas. Compara las reglas de hasta el 18-11 («antes») con el diseño elegido («ahora»).
Cuando haya datos reales (métrica «talentos_semana»), se reemplazan los supuestos de TIPOS por lo medido.

Uso: python3 herramientas/simulacion_talentos.py [ruta/a/senda-app]
"""
import json
import random
import statistics as st
import sys
from pathlib import Path

APP = Path(sys.argv[1] if len(sys.argv) > 1 else "/home/user/senda-app")
TRAV = json.loads((APP / "contenido/travesia.json").read_text())
LIB = json.loads((APP / "contenido/liberacion.json").read_text())
ENTRADA = set(LIB["rutas_entrada"])
SEMANAS = int(__import__("os").environ.get("SEMANAS", "20"))


def lecciones(r):
    return sum(1 for s in r["secciones"] for n in s["niveles"] if n.get("tipo", "leccion") == "leccion")


RUTAS_ENTRADA = [lecciones(r) for r in TRAV["rutas"] if r["id"] in ENTRADA]
RUTAS_LLAVE = [lecciones(r) for r in TRAV["rutas"] if r["id"] not in ENTRADA]

# supuestos de uso (HIPÓTESIS hasta medir): días por semana, lecciones por día, repasos, misiones (de 3), partidas ganadas,
# desafío del día, pregunta de oro, lecciones perfectas, videos que duplican (si hay), luces compradas en la práctica
TIPOS = {
    "casual": dict(dias=3, lec=1.2, rep=0.1, mis=1.5, gana=0.3, des=0.4, oro=0.05, perf=0.4, video=0.3, luz=0.0),
    "regular": dict(dias=5, lec=2.5, rep=0.3, mis=2.6, gana=1.0, des=0.8, oro=0.15, perf=0.5, video=1.0, luz=0.6),
    "intenso": dict(dias=7, lec=5.0, rep=1.0, mis=3.0, gana=3.0, des=1.0, oro=0.4, perf=0.6, video=2.0, luz=1.5),
}
ESTRELLAS = [3] * 9 + [2] * 15 + [1] * 24  # 48 figuritas del álbum 2026; 9 gratis (la primera de cada página)

ANTES = dict(mision=15, leccion=10, perfecta=15, repaso=10, gana=20, video=0, fin_ruta=0, regalo=False, llaves=False,
             sobre={1: 40, 2: 40, 3: 40}, luz=0)
AHORA = dict(mision=10, leccion=10, perfecta=15, repaso=5, gana=15, video=10, fin_ruta=50, regalo=True, llaves=True,
             sobre={1: 80, 2: 120, 3: 160}, luz=20)


def llave(n):
    return 200 if n <= 10 else 300 if n <= 20 else 400 if n <= 40 else 600


def simular(p, R, rnd):
    t = ganado = 0
    gasto = {"llaves": 0, "sobres": 0, "luces": 0, "protector": 0}
    entrada = RUTAS_ENTRADA[:]
    rnd.shuffle(entrada)
    cola = RUTAS_LLAVE[:]
    rnd.shuffle(cola)
    quedan = entrada.pop()
    sobres = [R["sobre"][e] for e in ESTRELLAS[9:]]
    rnd.shuffle(sobres)
    regalo = R["regalo"]
    esperas = 0
    for _sem in range(SEMANAS):
        for _dia in range(p["dias"]):
            g = round(p["mis"]) * R["mision"]
            for _ in range(max(0, round(rnd.gauss(p["lec"], 0.6)))):
                if quedan <= 0:
                    g += R["fin_ruta"]
                    if entrada and rnd.random() < 0.6:
                        quedan = entrada.pop()
                    else:
                        tam = cola.pop() if cola else 16
                        precio = 0 if (regalo or not R["llaves"]) else llave(tam)
                        if t + g >= precio:
                            g -= precio
                            gasto["llaves"] += precio
                            quedan = tam
                            regalo = False if R["llaves"] else regalo
                        else:
                            esperas += 1
                            cola.append(tam)
                            break
                quedan -= 1
                g += R["perfecta"] if rnd.random() < p["perf"] else R["leccion"]
                if rnd.random() < 3.75 / 16:  # la prueba del capítulo
                    g += R["leccion"]
                if rnd.random() < 3.6 / 16:  # el cofre
                    g += 10
                    if R["video"] and rnd.random() < min(1, p["video"] / 2):
                        g += R["video"]
            g += max(0, round(rnd.gauss(p["rep"], 0.4))) * R["repaso"]
            g += max(0, round(rnd.gauss(p["gana"], 0.5))) * R["gana"]
            g += 5 if rnd.random() < p["des"] else 0
            g += 15 if rnd.random() < p["oro"] else 0
            t += g
            ganado += max(g, 0)
            if sobres and t >= sobres[-1] and rnd.random() < 0.5:
                t -= sobres[-1]
                gasto["sobres"] += sobres.pop()
            if R["luz"]:
                for _ in range(max(0, round(rnd.gauss(p["luz"], 0.5)))):
                    if t >= R["luz"]:
                        t -= R["luz"]
                        gasto["luces"] += R["luz"]
        if rnd.random() < 0.15 and t >= 50:
            t -= 50
            gasto["protector"] += 50
    total = sum(gasto.values()) + sum(0 for _ in [])
    return dict(ganado=ganado, saldo=t, uso=total / max(1, ganado), esperas=esperas, **gasto)


def main():
    print(f"Rutas de entrada: {len(RUTAS_ENTRADA)} ({sum(RUTAS_ENTRADA)} lecciones) · con llave: {len(RUTAS_LLAVE)}")
    print("Rutas por precio de llave:", {k: sum(1 for n in RUTAS_LLAVE if llave(n) == k) for k in (200, 300, 400, 600)})
    for nombre, R in (("antes", ANTES), ("ahora", AHORA)):
        print(f"\n## {nombre}")
        for tipo, p in TIPOS.items():
            rnd = random.Random(7)
            rs = [simular(p, R, rnd) for _ in range(300)]
            m = lambda k: st.median(r[k] for r in rs)  # noqa: E731
            dias = m("ganado") / (SEMANAS * p["dias"])
            print(f"  {tipo:8s} ganó {m('ganado'):6.0f} · usó {100 * m('uso'):3.0f} % · saldo {m('saldo'):6.0f} "
                  f"(≈ {m('saldo') / max(1, dias):3.0f} días de uso) · llaves {m('llaves'):5.0f} · sobres {m('sobres'):5.0f} "
                  f"· luces {m('luces'):4.0f} · veces que tuvo que juntar {m('esperas'):.0f}")


if __name__ == "__main__":
    main()
