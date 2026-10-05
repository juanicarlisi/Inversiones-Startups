#!/usr/bin/env python3
"""Genera src/arte/generado.ts con los SVG de Senda (Lani, piezas, vehículos, logo, escenas e íconos).

Uso: python3 scripts/generar_arte.py
La fuente de los dibujos es scripts/arte/senda_visual.py (bocetos de dirección; el arte final lo hacen especialistas).
"""
import json
import math
import re
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI / "arte"))
import senda_visual as V  # noqa: E402

SALIDA = AQUI.parent / "src" / "arte" / "generado.ts"


def limpiar(svg: str) -> str:
    svg = re.sub(r'\s(class|role|aria-label)="[^"]*"', "", svg)
    svg = re.sub(r'\sstyle="filter:[^"]*"', "", svg)
    svg = re.sub(r"\s+", " ", svg).strip()
    return svg


def ruleta() -> str:
    segs = []
    cols = [c[3] for c in V.CATS] + [V.ORO]
    n = 7
    for k in range(n):
        a0, a1 = 2 * math.pi * k / n - math.pi / 2, 2 * math.pi * (k + 1) / n - math.pi / 2
        x0, y0 = 50 + 46 * math.cos(a0), 50 + 46 * math.sin(a0)
        x1, y1 = 50 + 46 * math.cos(a1), 50 + 46 * math.sin(a1)
        segs.append(f'<path d="M50 50 L{x0:.2f} {y0:.2f} A46 46 0 0 1 {x1:.2f} {y1:.2f}Z" fill="{cols[k]}" stroke="#1C1446" stroke-width="1.2"/>')
        segs.append(f'<path d="M50 50 L{x0:.2f} {y0:.2f} A46 46 0 0 1 {x1:.2f} {y1:.2f}Z" fill="url(#rb)" opacity=".35"/>')
        am = (a0 + a1) / 2
        cx, cy = 50 + 31 * math.cos(am), 50 + 31 * math.sin(am)
        if k < 6:
            pieza = re.sub(r"^<svg[^>]*>|</svg>$", "", limpiar(V.pieza_svg(V.CATS[k][0], 16)))
            segs.append(f'<g transform="translate({cx - 8:.1f} {cy - 8:.1f}) scale(.25)">{pieza}</g>')
        else:
            segs.append(f'<g transform="translate({cx - 7:.1f} {cy - 7:.1f}) scale(.5833)"><path d="M3 8l4.4 3.8L12 5l4.6 6.8L21 8l-2 10.5H5z" fill="#7a4f00"/></g>')
    luces = "".join(f'<circle cx="{50 + 48.5 * math.cos(2 * math.pi * k / 21):.1f}" cy="{50 + 48.5 * math.sin(2 * math.pi * k / 21):.1f}" r="1.3" fill="{"#FFF4D6" if k % 2 else V.ORO}"/>' for k in range(21))
    return (f'<svg viewBox="0 0 100 100"><defs><radialGradient id="rb" cx=".5" cy=".5" r=".5"><stop offset=".3" stop-color="#fff" stop-opacity="0"/>'
            f'<stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs>'
            f'<circle cx="50" cy="50" r="49.5" fill="#120c30" stroke="{V.ORO}" stroke-width="1.4"/>{"".join(segs)}{luces}</svg>')


def main():
    poses = ["reposo", "festejo", "saludo", "pensando", "uff", "guardia", "corriendo", "armadura", "dormida", "desmayo", "baile"]
    lani = {p: limpiar(V.lani(p, 200, sombra=False)) for p in poses}
    lani["reposo_parpadeo"] = limpiar(V.lani("reposo", 200, sombra=False, ojos_cerrados=True))
    lani["saludo_parpadeo"] = limpiar(V.lani("saludo", 200, sombra=False, ojos_cerrados=True))
    tu = {p: limpiar(V.lani(p, 200, sombra=False, buzo=V.VIOLETA, gorra=V.AMBAR)) for p in ("reposo", "saludo", "festejo", "uff", "pensando", "corriendo")}
    tu["reposo_parpadeo"] = limpiar(V.lani("reposo", 200, sombra=False, buzo=V.VIOLETA, gorra=V.AMBAR, ojos_cerrados=True))
    tu["saludo_parpadeo"] = limpiar(V.lani("saludo", 200, sombra=False, buzo=V.VIOLETA, gorra=V.AMBAR, ojos_cerrados=True))
    piezas = {c[0]: limpiar(V.pieza_svg(c[0], 64)) for c in V.CATS}
    vehiculos = {t: limpiar(V.vehiculo(t, 100)) for t in ("moto", "auto", "skate", "bici", "carro")}
    nombres = ["vida", "racha", "talento", "perla", "inicio", "biblia", "travesia", "jugar", "comunidad", "calendario", "cofre", "trofeo",
               "play", "tri", "candado", "estrella", "campana", "rayo", "corona", "flecha", "check", "cruz", "lupa", "reloj", "luz", "pista",
               "doble", "cambio", "tribuna", "compartir", "parlante", "mas", "qr", "grafico", "oracion", "pdf", "mapa", "lampara"]
    iconos = {}
    for n in nombres:
        svg = limpiar(V.icono(n, 24, "#C0L0R0"))
        iconos[n] = svg.replace("#C0L0R0", "{c}")
    datos = {
        "LANI": lani, "TU_LANI": tu, "PIEZAS": piezas, "VEHICULOS": vehiculos, "ICONOS": iconos,
        "RULETA": limpiar(ruleta()), "LOGO": limpiar(V.logo_simbolo(120)), "LOGO_CLARO": limpiar(V.logo_simbolo(120, claro=True)),
        "ESCENA_MAR": limpiar(V.escena_mar(200, 120)), "MAPA_TRAVESIA": limpiar(V.mapa_travesia(220, 380)),
    }
    out = ["// Generado por scripts/generar_arte.py. No editar a mano.", ""]
    for k, v in datos.items():
        out.append(f"export const {k} = {json.dumps(v, ensure_ascii=False, indent=1)} as const;")
        out.append("")
    SALIDA.write_text("\n".join(out), encoding="utf-8")
    print("escrito", SALIDA, f"{SALIDA.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
