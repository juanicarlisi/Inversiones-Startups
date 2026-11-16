#!/usr/bin/env python3
"""Prototipo del ícono chico de avisos de Senda (15-11-2026). Dibuja en una grilla de 24 (= 24 dp): el camino como discos a lo largo
de curvas de Bézier (igual que scripts/marca/marca_camino.py) y la cruz con rectángulos redondeados. Sale un SVG por variante."""
import math, sys, json
from pathlib import Path

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0], u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1])

def camino(tramos, w_cerca, w_lejos, curva=1.0, n=160):
    pts = []
    for k, s in enumerate(tramos):
        for i in range(n + (1 if k == len(tramos) - 1 else 0)):
            pts.append(bez(*s, i / n))
    largo = [0.0]
    for a, b in zip(pts, pts[1:]):
        largo.append(largo[-1] + math.dist(a, b))
    tot = largo[-1]
    out = []
    for p, l in zip(pts, largo):
        w = w_lejos + (w_cerca - w_lejos) * (1 - l / tot) ** curva
        out.append((p[0], p[1], w / 2))
    return out

def cruz(cx, top, alto, ancho, g, barra_y):
    r = g * 0.22
    return (f'<rect x="{cx - g/2:.3f}" y="{top:.3f}" width="{g:.3f}" height="{alto:.3f}" rx="{r:.3f}"/>'
            f'<rect x="{cx - ancho/2:.3f}" y="{barra_y - g/2:.3f}" width="{ancho:.3f}" height="{g:.3f}" rx="{r:.3f}"/>')

def svg(discos, cruz_svg, color="#FFFFFF"):
    c = "".join(f'<circle cx="{x:.3f}" cy="{y:.3f}" r="{r:.3f}"/>' for x, y, r in discos)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="{color}">{c}{cruz_svg}</g></svg>'

V = {}
# A · «senda y cruz»: la S entera adentro del cuadro (sin corte), se angosta 1,6 a 1 hacia la cruz; cruz de 2,3 dp; aire de 1,9 dp
tA = [((3.9, 21.2), (10.5, 21.6), (20.6, 21.4), (18.6, 18.3)),
      ((18.6, 18.3), (16.6, 15.3), (5.6, 17.6), (6.4, 14.2)),
      ((6.4, 14.2), (7.0, 11.9), (11.0, 12.5), (13.4, 12.15))]
V["A_senda_y_cruz"] = svg(camino(tA, 3.5, 2.2), cruz(13.4, 1.4, 7.6, 6.6, 2.3, 4.25))
# B · igual, con más perspectiva (2,2 a 1): más parecida al logo, hueco más justo
V["B_mas_perspectiva"] = svg(camino(tA, 4.2, 1.9, 0.9), cruz(13.4, 1.4, 7.6, 6.6, 2.2, 4.25))
# C · solo la senda (sin cruz), más alta y gruesa: la de respaldo si los huecos se cierran
tC = [((3.6, 20.6), (11.0, 21.4), (21.6, 20.6), (19.0, 16.2)),
      ((19.0, 16.2), (16.2, 11.6), (4.4, 14.2), (5.6, 8.6)),
      ((5.6, 8.6), (6.4, 4.6), (12.5, 4.3), (17.6, 3.6))]
V["C_solo_senda"] = svg(camino(tC, 4.4, 2.6), "")
# D · S más alta y cruz más chica arriba a la derecha de la punta (cruz 5,4 × 6,4)
tD = [((3.9, 21.1), (10.5, 21.6), (20.8, 21.2), (18.8, 17.6)),
      ((18.8, 17.6), (16.6, 14.0), (5.2, 16.4), (6.2, 12.4)),
      ((6.2, 12.4), (6.9, 9.9), (11.2, 10.5), (13.6, 10.2))]
V["D_cruz_chica"] = svg(camino(tD, 3.7, 2.2), cruz(13.6, 1.3, 6.4, 5.6, 2.1, 3.7))

# E · la S manda y la cruz es chica (5,6 × 4,6 dp, trazo 2 dp), arriba de la punta: la proporción del logo
tE = [((3.8, 21.15), (10.5, 21.7), (21.2, 21.3), (19.0, 17.5)),
      ((19.0, 17.5), (16.6, 13.5), (4.9, 15.9), (6.0, 11.7)),
      ((6.0, 11.7), (6.8, 9.0), (11.6, 9.9), (14.4, 9.65))]
V["E_s_manda"] = svg(camino(tE, 3.7, 2.1), cruz(14.4, 1.2, 5.6, 4.7, 2.0, 3.25))
# F · como E, con la punta que sube hacia la cruz (el camino «va» a la cruz) y un poco más de perspectiva
tF = [((3.8, 21.1), (10.5, 21.7), (21.4, 21.4), (19.2, 17.4)),
      ((19.2, 17.4), (16.8, 13.2), (4.6, 15.6), (5.9, 11.6)),
      ((5.9, 11.6), (6.9, 8.6), (12.2, 10.6), (14.6, 9.5))]
V["F_punta_sube"] = svg(camino(tF, 3.9, 2.0, 0.9), cruz(14.6, 1.2, 5.6, 4.7, 2.0, 3.25))
# G · E con la cruz un poco más grande (6,2 × 5,2)
V["G_cruz_media"] = svg(camino(tE, 3.7, 2.1), cruz(14.4, 1.1, 6.0, 5.2, 2.05, 3.3))

out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
for k, s in V.items():
    (out / f"{k}.svg").write_text(s)
print(json.dumps(list(V)))
