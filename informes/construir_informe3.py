#!/usr/bin/env python3
"""Informe 3 — "El plan": todas las alternativas evaluadas, las que conviene hacer ya y el paso a paso.

Uso:
  python3 informes/construir_informe3.py              # gráficos + HTML + PDF + HTML autocontenido
  python3 informes/construir_informe3.py --solo-html  # solo el HTML de trabajo

Datos: oportunidades/catalogo.yaml (vía herramientas/catalogo.py). Texto: informes/fuente-informe3/capitulos/*.md.
Los bloques visuales (tarjetas, cronogramas, tablas) se generan desde el catálogo para que todo sea coherente y regenerable.
"""
from __future__ import annotations

import argparse
import base64
import html
import os
import re
import subprocess
import sys
from pathlib import Path

import markdown
import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "informes" / "fuente-informe3"
CAPITULOS = FUENTE / "capitulos"
GRAF = FUENTE / "graficos"
TIPO = RAIZ / "informes" / "tipografia"
sys.path.insert(0, str(RAIZ / "herramientas"))

import catalogo  # noqa: E402

TITULO = "El plan: ingresos con IA en 6–10 horas por semana"
SALIDA_PDF = RAIZ / "informes" / "2026-09-el-plan.pdf"
SALIDA_HTML_AUTO = RAIZ / "informes" / "2026-09-el-plan.html"
SALIDA_HTML = FUENTE / "informe.html"

# Paleta validada (skill dataviz, orden fijo) y tintas
S1, S2, S3, S4 = "#2a78d6", "#eb6834", "#1baf7a", "#eda100"
TINTA, TINTA2, MUTED, GRILLA, SUP = "#0b0b0b", "#52514e", "#898781", "#e1e0d9", "#fcfcfb"
QUIEN_COLOR = {"claude": S1, "vos": S2, "ambos": S3}
COMP_COLOR = {"G1": "#008300", "A1": S1, "C1": S3, "F1": S4, "A10": "#e87ba4", "H1": "#898781"}
QUIEN_NOMBRE = {"claude": "Claude", "vos": "Vos", "ambos": "Juntos"}
VERED_CLASE = {"hacer_ya": "v-ya", "segunda_ola": "v-2", "solo_si": "v-si", "no": "v-no", "palanca": "v-pal", "pausa": "v-pau"}


def _u(x: float) -> str:
    return f"{x:,.0f}".replace(",", ".")


def _usd(x: float) -> str:
    return ("−" if x < 0 else "") + "USD " + _u(abs(x))


def esc(t: str) -> str:
    return html.escape(str(t))


# ─────────────────────────────────────────────── gráficos ───────────────────────────────────────────────
def _estilo():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib import font_manager

    for f in sorted(TIPO.glob("*.ttf")):
        font_manager.fontManager.addfont(str(f))
    plt.rcParams.update({
        "figure.facecolor": SUP, "axes.facecolor": SUP, "savefig.facecolor": SUP,
        "font.family": "Inter", "font.size": 9, "axes.edgecolor": "#c3c2b7", "axes.labelcolor": TINTA2,
        "axes.titlecolor": TINTA, "axes.titlesize": 10.5, "axes.titleweight": "bold", "axes.titlelocation": "left",
        "xtick.color": MUTED, "ytick.color": MUTED, "xtick.labelcolor": TINTA2, "ytick.labelcolor": TINTA2,
        "axes.grid": True, "grid.color": GRILLA, "grid.linewidth": 0.8, "axes.axisbelow": True,
        "axes.spines.top": False, "axes.spines.right": False, "legend.frameon": False, "legend.fontsize": 8.2,
        "lines.linewidth": 2, "lines.solid_capstyle": "round", "svg.fonttype": "path",
    })
    return plt


def _guardar(fig, nombre):
    GRAF.mkdir(parents=True, exist_ok=True)
    fig.savefig(GRAF / f"{nombre}.svg", metadata={"Date": None})
    fig.savefig(GRAF / f"{nombre}.png", dpi=160)
    import matplotlib.pyplot as plt
    plt.close(fig)


def _fmt_usd(x, _=None):
    if abs(x) >= 1000:
        return f"{x/1000:.1f}k".replace(".", ",").replace(",0k", "k")
    return f"{x:.0f}"


def graf_escenarios(a: dict):
    plt = _estilo()
    from matplotlib.ticker import FuncFormatter
    c = a["_sim"]["curvas"]
    nombres = a.get("nombres_escenarios", {})
    x = np.arange(0, 37)
    fig, ax = plt.subplots(figsize=(8.6, 2.75))
    ax.plot(x, c["muy_bien"][:37], color=S3, label=nombres.get("muy_bien", "Funciona muy bien"))
    ax.plot(x, c["normal"][:37], color=S1, label=nombres.get("normal", "Funciona normal"))
    ax.plot(x, c["no_funciona"][:37], color=MUTED, label=nombres.get("no_funciona", "No funciona (se corta)"))
    ax.axhline(0, color="#c3c2b7", linewidth=1)
    for serie, col in (("muy_bien", S3), ("normal", S1)):
        v = c[serie][36]
        ax.annotate(_fmt_usd(v), (36, v), xytext=(4, 0), textcoords="offset points", va="center", fontsize=8, color=TINTA2)
    ax.set_xlim(0, 39)
    ax.set_xticks([0, 6, 12, 18, 24, 30, 36])
    ax.set_xlabel("Mes")
    ax.set_ylabel("USD por mes (neto)")
    ax.yaxis.set_major_formatter(FuncFormatter(_fmt_usd))
    ax.set_title(f"Plata por mes según cómo le vaya · chances de que funcione: {a['p_exito']*100:.0f}%", fontsize=9.5)
    ax.legend(loc="upper left", ncol=3, bbox_to_anchor=(0, 1.0))
    ymax = max(c["muy_bien"][:37].max(), 50)
    ax.set_ylim(min(c["no_funciona"][:37].min(), -10) * 1.3, ymax * 1.28)
    fig.tight_layout()
    _guardar(fig, f"esc_{a['id']}")


def graf_mapa(datos: dict):
    plt = _estilo()
    alts = [a for a in datos["alternativas"] if a["_sim"] is not None]
    grupos = [("Hacer ya", ("hacer_ya",), S1), ("Segunda ola", ("segunda_ola",), S2),
              ("Solo si… / No / otras", ("solo_si", "no", "palanca"), "#b9b8b0")]
    fig, ax = plt.subplots(figsize=(9.2, 4.9))
    for nombre, vs, col in grupos[::-1]:
        sel = [a for a in alts if a["veredicto"] in vs]
        xs = [a["_h"] for a in sel]
        ys = [max(a["_sim"]["esperado"][36], 5) for a in sel]
        ax.scatter(xs, ys, s=[40 + 0.9 * np.sqrt(max(a["inversion"][1], 1)) * 6 for a in sel], color=col, alpha=0.9,
                   edgecolor=SUP, linewidth=1.6, label=nombre, zorder=3 if col != "#b9b8b0" else 2)
    desp = {"A1": (-9, 6), "C1": (9, 4), "A10": (-9, -2), "A2": (9, 0), "F1": (-8, 8), "G1": (9, -3), "H1": (9, -7),
            "D1": (-8, -9), "H3": (9, 2), "A13": (9, -6), "B2": (-8, 6), "C3": (-8, 4), "C5": (9, 2), "A11": (9, 5),
            "D3": (9, -8), "C2": (9, 6), "F2": (-8, 6)}
    for a in alts:
        cortos = {"A1": "Suite cristiana", "C1": "Logistic Lab", "F1": "Comprar app", "G1": "Renta", "H1": "Entrenar IA"}
        if a["veredicto"] == "hacer_ya":
            txt = f"{a['id']} · {cortos.get(a['id'], a['corto'])}"
        elif a["veredicto"] in ("segunda_ola", "palanca"):
            txt = a["id"]
        else:
            continue
        dx, dy = desp.get(a["id"], (8, 2))
        ax.annotate(txt, (a["_h"], max(a["_sim"]["esperado"][36], 5)), xytext=(dx, dy), textcoords="offset points",
                    fontsize=7.6 if a["veredicto"] == "hacer_ya" else 7.0, fontweight="bold" if a["veredicto"] == "hacer_ya" else "normal",
                    color=TINTA if a["veredicto"] == "hacer_ya" else TINTA2, ha="left" if dx >= 0 else "right", va="center")
    ax.set_yscale("log")
    ax.set_ylim(4, 3500)
    ax.set_xlim(0, 9.5)
    from matplotlib.ticker import FuncFormatter
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: _fmt_usd(v)))
    ax.set_xlabel("Horas por semana que te pide (promedio arranque/régimen)")
    ax.set_ylabel("Plata esperada al mes 36 (USD/mes, escala log)")
    ax.set_title("El mapa: cuánto deja cada alternativa y cuánto tiempo te pide")
    ax.axvspan(6, 10, color="#f3f2ee", zorder=0)
    ax.text(6.1, 3000, "todo tu tiempo disponible\n(6–10 h/sem para todo el plan)", fontsize=7.2, color=MUTED, va="top")
    ax.legend(loc="lower right", title="Veredicto", title_fontsize=8)
    fig.tight_layout()
    _guardar(fig, "mapa")


def graf_plan(datos: dict, r: dict):
    plt = _estilo()
    from matplotlib.ticker import FuncFormatter
    g = r["grupos"]
    x = np.arange(0, 61)
    fig, ax = plt.subplots(figsize=(9.2, 3.9))
    ax.plot(x, g["dos_o_mas"]["mediana"], color=S3, label=f"Funcionan 2 o más motores ({g['dos_o_mas']['prob']*100:.0f}% de chances)")
    ax.plot(x, g["uno"]["mediana"], color=S1, label=f"Funciona 1 motor ({g['uno']['prob']*100:.0f}%)")
    ax.plot(x, g["ninguno"]["mediana"], color=MUTED, label=f"No funciona ninguno ({g['ninguno']['prob']*100:.0f}%)")
    ax.plot(x, r["solo_renta"], color=S2, linewidth=1.6, label="Referencia: los USD 400/mes solo a renta")
    ax.axhline(0, color="#c3c2b7", linewidth=1)
    for k, col in (("dos_o_mas", S3), ("uno", S1)):
        v = g[k]["mediana"][60]
        ax.annotate(_usd(v) + "/mes", (60, v), xytext=(4, 0), textcoords="offset points", va="center", fontsize=8, color=TINTA2)
    ax.set_xlim(0, 69)
    ax.set_xticks([0, 6, 12, 24, 36, 48, 60])
    ax.set_xlabel("Mes (0 = octubre 2026)")
    ax.set_ylabel("Ingreso mensual neto (USD)")
    ax.yaxis.set_major_formatter(FuncFormatter(_fmt_usd))
    ax.set_title("Tu plan en tres escenarios (mediana de cada uno)")
    ax.legend(loc="upper left")
    fig.tight_layout()
    _guardar(fig, "plan")


def graf_horas(datos: dict, r: dict):
    plt = _estilo()
    por_id = {a["id"]: a for a in datos["alternativas"]}
    meses = np.arange(0, 13)
    etiquetas_mes = ["oct", "nov", "dic", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct"]
    fig, ax = plt.subplots(figsize=(9.2, 3.1))
    base = np.zeros(len(meses))
    for c in r["componentes"]:
        h = r["horas"][c["id"]][: len(meses)]
        ax.bar(meses, h, bottom=base, color=COMP_COLOR[c["id"]], width=0.72, edgecolor=SUP, linewidth=1.2,
               label=f"{por_id[c['id']]['corto']}")
        base += h
    ax.axhspan(6, 10, color="#f3f2ee", zorder=0)
    ax.axhline(10, color=MUTED, linewidth=0.9)
    ax.text(12.45, 10.15, "tope 10 h", fontsize=7.4, color=MUTED, ha="right", va="bottom")
    ax.set_xticks(meses)
    ax.set_xticklabels(etiquetas_mes)
    ax.set_ylabel("Horas por semana")
    ax.set_ylim(0, 12)
    ax.grid(axis="x", visible=False)
    ax.set_title("Tus horas por semana, mes a mes (plan base, si todo sigue)")
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.16), ncol=5, fontsize=7.6)
    fig.tight_layout()
    _guardar(fig, "horas")


def graf_publicidad():
    plt = _estilo()
    formatos = ["Banner", "Intersticial", "Video recompensado"]
    ee_uu = [1.0, 6.5, 22.0]
    global_ = [0.5, 3.75, 13.0]
    latam = [0.10, 0.75, 2.5]
    x = np.arange(3)
    w = 0.26
    fig, (ax, ax2) = plt.subplots(1, 2, figsize=(9.2, 3.1), gridspec_kw={"width_ratios": [1.35, 1]})
    for i, (vals, col, nom) in enumerate(((ee_uu, S1, "EE.UU. y países ricos"), (global_, S2, "Promedio mundial"),
                                          (latam, S3, "Argentina (estimación)"))):
        ax.bar(x + (i - 1) * w, vals, width=w - 0.02, color=col, label=nom, edgecolor=SUP, linewidth=1.2)
    ax.set_xticks(x)
    ax.set_xticklabels(formatos)
    ax.set_ylabel("USD por cada 1.000 anuncios vistos")
    ax.grid(axis="x", visible=False)
    ax.set_title("Cuánto paga la publicidad en apps (2026)")
    ax.legend(loc="upper left")
    # panel 2: plata por instalación vs costo de comprar una instalación
    cats = ["Lo que deja una\ninstalación (Arg.)", "Lo que deja una\ninstalación (EE.UU.)", "Lo que cuesta comprar\nuna instalación (LatAm)"]
    lo = [0.05, 0.40, 0.50]
    hi = [0.30, 1.00, 2.00]
    for i, (a_, b_) in enumerate(zip(lo, hi)):
        ax2.plot([a_, b_], [i, i], color=[S3, S1, S2][i], linewidth=7, solid_capstyle="butt")
        ax2.text(b_ + 0.06, i, f"USD {a_:.2f}–{b_:.2f}".replace(".", ","), va="center", fontsize=8, color=TINTA2)
    ax2.set_yticks(range(3))
    ax2.set_yticklabels(cats, fontsize=7.8)
    ax2.set_xlim(0, 2.9)
    ax2.set_ylim(-0.6, 2.6)
    ax2.invert_yaxis()
    ax2.grid(axis="y", visible=False)
    ax2.set_xlabel("USD")
    ax2.set_title("Por qué no conviene comprar descargas")
    fig.tight_layout()
    _guardar(fig, "publicidad")


def graficos(datos: dict, r: dict):
    graf_mapa(datos)
    graf_plan(datos, r)
    graf_horas(datos, r)
    graf_publicidad()
    for a in datos["alternativas"]:
        if a.get("detalle"):
            graf_escenarios(a)


# ─────────────────────────────────────────────── bloques HTML ───────────────────────────────────────────────
def pill_veredicto(a: dict) -> str:
    return f'<span class="pill {VERED_CLASE[a["veredicto"]]}">{esc(catalogo.VEREDICTOS[a["veredicto"]])}</span>'


def pill_origen(a: dict) -> str:
    if a.get("familia") == "pausa":
        return ""
    return '<span class="tag tag-lista">Tu idea</span>' if a.get("origen") == "lista" else '<span class="tag">Nueva</span>'


def fam_badge(datos, a) -> str:
    f = datos["familias"][a["familia"]]
    return f'<span class="fam" style="--fc:{f["color"]}">{f["icono"]} {esc(f["nombre"])}</span>'


def tiles(a: dict) -> str:
    s = a["_sim"]
    ns = s["normal_si_sale"]
    inv = a["inversion"]
    inv_txt = "USD 0" if inv[1] == 0 else f"USD {_u(inv[1])}"
    items = [
        ("Inversión inicial", inv_txt, f"rango {_u(inv[0])}–{_u(inv[2])}" if inv[2] > inv[0] else ""),
        ("Tus horas", f"{a['horas_arranque']:g} → {a['horas_regimen']:g} h/sem", "arranque → después"),
        ("Primer ingreso", f"mes {a['meses_primer_ingreso']}", ""),
        ("Chances", f"{a['p_exito']*100:.0f}%", esc(a.get("exito_es", ""))),
        ("Si funciona (normal)", f"{_u(ns[12])} → {_u(ns[36])}", "USD/mes al mes 12 → 36"),
    ]
    return '<div class="tiles">' + "".join(
        f'<div class="tile"><div class="tl">{esc(t)}</div><div class="tv">{v}</div><div class="ts">{sub}</div></div>' for t, v, sub in items
    ) + "</div>"


def lista(items, clase="") -> str:
    return f'<ul class="{clase}">' + "".join(f"<li>{esc(i)}</li>" for i in items) + "</ul>"


def mini_gantt(a: dict, semanas: int = 26) -> str:
    filas = []
    for tarea, quien, desde, hasta in a.get("gantt", []):
        izq = (desde - 1) / semanas * 100
        ancho = max((min(hasta, semanas) - desde + 1) / semanas * 100, 2.5)
        filas.append(
            f'<div class="g-fila"><div class="g-tarea">{esc(tarea)}</div><div class="g-pista">'
            f'<div class="g-barra" style="left:{izq:.2f}%;width:{ancho:.2f}%;background:{QUIEN_COLOR[quien]}"></div></div></div>'
        )
    marcas = "".join(f'<span style="left:{(w-1)/semanas*100:.2f}%">S{w}</span>' for w in (1, 5, 9, 13, 17, 21, 25))
    leyenda = "".join(f'<span class="g-ley"><i style="background:{QUIEN_COLOR[k]}"></i>{QUIEN_NOMBRE[k]}</span>' for k in QUIEN_COLOR)
    return (f'<div class="gantt"><div class="g-cab"><div class="g-tarea">Primeras 26 semanas</div><div class="g-escala">{marcas}</div></div>'
            + "".join(filas) + f'<div class="g-leyendas">{leyenda}</div></div>')


def tarjeta_detalle(datos: dict, a: dict, primera: bool = False) -> str:
    f = datos["familias"][a["familia"]]
    ev = ""
    if a.get("evidencia"):
        ev = '<div class="evid"><b>Datos que la sostienen:</b> ' + " · ".join(esc(e) for e in a["evidencia"]) + "</div>"
    return f"""
<section class="det{' primera' if primera else ''}" style="--fc:{f['color']}">
  <div class="det-cab">
    <div class="det-id">{a['id']}</div>
    <div class="det-tit"><div class="det-meta">{fam_badge(datos, a)} {pill_origen(a)} {pill_veredicto(a)}
      <span class="score">Puntaje {a['_puntaje']:.0f}/100</span></div>
      <h2>{esc(a['nombre'])}</h2></div>
  </div>
  <p class="lead">{esc(a['que_es'])}</p>
  <p class="quien"><b>Quién vende por vos:</b> {esc(a['quien_vende'])}</p>
  {tiles(a)}
  <img class="esc" src="graficos/esc_{a['id']}.svg" alt="Escenarios {esc(a['corto'])}">
  <div class="cols3">
    <div><h4>💰 Cómo gana plata</h4>{lista(a.get('como_gana', []))}</div>
    <div><h4>🤖 Qué hace Claude</h4>{lista(a.get('claude_hace', []))}</div>
    <div><h4>🙋 Qué hacés vos</h4>{lista(a.get('vos_haces', []))}</div>
  </div>
  <div class="cols2">
    <div><h4>🧾 Qué necesitamos para arrancar</h4>{lista(a.get('necesitamos', []), 'check')}</div>
    <div><h4>⚠️ Riesgos y cómo los bajamos</h4>{lista(a.get('riesgos', []))}</div>
  </div>
  {mini_gantt(a)}
  <div class="corte"><b>✂️ Regla de corte:</b> {esc(a.get('corte', ''))}</div>
  {ev}
</section>"""


def tarjeta_compacta(datos: dict, a: dict) -> str:
    f = datos["familias"][a["familia"]]
    num = ""
    if a["_sim"] is not None:
        ns = a["_sim"]["normal_si_sale"]
        inv = "0" if a["inversion"][1] == 0 else _u(a["inversion"][1])
        num = (f'<div class="mini"><span><b>USD {inv}</b> inversión</span><span><b>{a["_h"]:.1f} h</b>/sem</span>'
               f'<span><b>mes {a["meses_primer_ingreso"]}</b> 1er ingreso</span><span><b>{a["p_exito"]*100:.0f}%</b> chances</span>'
               f'<span>si funciona: <b>{_u(ns[12])} → {_u(ns[36])}</b> USD/mes (m12→m36)</span>'
               f'<span>puntaje <b>{a["_puntaje"]:.0f}</b></span></div>')
    que = f'<p class="cq">{esc(a["que_es"])}</p>' if a.get("que_es") else ""
    pq = f'<p><b>Por qué:</b> {esc(a.get("por_que", ""))}</p>' if a.get("por_que") else ""
    mv = f'<p class="mv"><b>Mejor versión:</b> {esc(a["mejor_version"])}</p>' if a.get("mejor_version") else ""
    return f"""
<div class="cc" style="--fc:{f['color']}">
  <div class="cc-cab"><span class="cc-id">{a['id']}</span> {pill_origen(a)} {pill_veredicto(a)}</div>
  <div class="cc-tit">{f['icono']} {esc(a['nombre'])}</div>
  {que}{num}{pq}{mv}
</div>"""


def bloque_resto(datos: dict) -> str:
    detallados = {a["id"] for a in datos["alternativas"] if a.get("detalle")}
    out = []
    for fk, fam in datos["familias"].items():
        if fk in ("trampa", "pausa"):
            continue
        alts = [a for a in datos["alternativas"] if a["familia"] == fk and a["id"] not in detallados]
        if not alts:
            continue
        alts.sort(key=lambda a: -a["_puntaje"])
        clase = "fam-bloque chica" if len(alts) <= 4 else "fam-bloque"
        out.append(f'<div class="{clase}"><h2 class="fam-h" style="--fc:{fam["color"]}">{fam["icono"]} {esc(fam["nombre"])}'
                   f'<small>{esc(fam["quien"])}</small></h2><div class="grid-cc">'
                   + "".join(tarjeta_compacta(datos, a) for a in alts) + "</div></div>")
    return "\n".join(out)


def bloque_trampas(datos: dict) -> str:
    filas = []
    for a in datos["alternativas"]:
        if a["familia"] in ("trampa", "pausa"):
            filas.append(f'<tr><td class="c-id">{a["id"]}</td><td><b>{esc(a["nombre"])}</b> {pill_origen(a)}</td>'
                         f'<td>{pill_veredicto(a)}</td><td>{esc(a.get("por_que", ""))}</td>'
                         f'<td>{esc(a.get("mejor_version", ""))}</td></tr>')
    return ('<table class="tabla"><thead><tr><th>ID</th><th>Alternativa</th><th>Veredicto</th><th>Por qué</th><th>Mejor alternativa</th>'
            '</tr></thead><tbody>' + "".join(filas) + "</tbody></table>")


def bloque_ranking(datos: dict) -> str:
    alts = [a for a in datos["alternativas"] if a["_sim"] is not None]
    alts.sort(key=lambda a: -a["_puntaje"])
    filas = []
    for i, a in enumerate(alts, 1):
        f = datos["familias"][a["familia"]]
        s = a["_sim"]
        filas.append(
            f'<tr><td class="c-n">{i}</td><td class="c-id">{a["id"]}</td>'
            f'<td><span class="dot" style="background:{f["color"]}"></span>{esc(a["corto"])} {pill_origen(a)}</td>'
            f'<td>{pill_veredicto(a)}</td>'
            f'<td class="c-bar"><div class="bar"><i style="width:{a["_puntaje"]:.0f}%"></i></div><b>{a["_puntaje"]:.0f}</b></td>'
            f'<td class="num">{a["_h"]:.1f}</td><td class="num">{_u(a["inversion"][1])}</td>'
            f'<td class="num">{a["p_exito"]*100:.0f}%</td><td class="num">{_u(s["normal_si_sale"][36])}</td>'
            f'<td class="num">{_u(s["esperado"][36])}</td></tr>')
    return ('<table class="tabla rank"><thead><tr><th>#</th><th>ID</th><th>Alternativa</th><th>Veredicto</th><th>Puntaje</th>'
            '<th>h/sem</th><th>Inversión USD</th><th>Chances</th><th>Si funciona: USD/mes al mes 36</th>'
            '<th>Promedio ponderado por chances, mes 36</th></tr></thead><tbody>' + "".join(filas) + "</tbody></table>")


def bloque_criterios() -> str:
    filas = "".join(f'<tr><td><b>{esc(c["nombre"])}</b></td><td class="num">{c["peso"]}%</td><td>{esc(c["guia"])}</td></tr>'
                    for c in catalogo.CRITERIOS.values())
    return f'<table class="tabla"><thead><tr><th>Criterio</th><th>Peso</th><th>Qué mide</th></tr></thead><tbody>{filas}</tbody></table>'


def bloque_tu_lista(datos: dict) -> str:
    filas = []
    for a in datos["alternativas"]:
        if a.get("origen") != "lista":
            continue
        filas.append(f'<tr><td class="c-id">{a["id"]}</td><td>{esc(a.get("corto", a["nombre"]))}</td><td>{pill_veredicto(a)}</td>'
                     f'<td>{esc(a.get("mejor_version", "Es una de las recomendadas: ver su ficha."))}</td></tr>')
    return ('<table class="tabla"><thead><tr><th>ID</th><th>Alternativa</th><th>Veredicto</th><th>Qué hacemos con ella</th></tr></thead>'
            '<tbody>' + "".join(filas) + "</tbody></table>")


def bloque_supuestos(datos: dict) -> str:
    def r(x):
        return " / ".join(_u(v) for v in x)
    filas = []
    for a in datos["alternativas"]:
        if a["_sim"] is None:
            continue
        ss = a["si_sale"]
        filas.append(f'<tr><td class="c-id">{a["id"]}</td><td>{esc(a["corto"])}</td><td class="num">{r(a["inversion"])}</td>'
                     f'<td class="num">{r(a["costo_mensual"])}</td><td class="num">{a["horas_arranque"]:g} → {a["horas_regimen"]:g}</td>'
                     f'<td class="num">{a["meses_primer_ingreso"]}</td><td class="num">{a["p_exito"]*100:.0f}%</td>'
                     f'<td class="num">{r(ss["m12"])}</td><td class="num">{r(ss["m36"])}</td><td class="num">{r(a["si_no"])}</td>'
                     f'<td class="num">{a["mes_corte"]}</td></tr>')
    return ('<table class="tabla"><thead><tr><th>ID</th><th>Alternativa</th><th>Inversión USD</th><th>Costo USD/mes</th><th>h/sem</th>'
            '<th>1er ingreso (mes)</th><th>Chances</th><th>Si funciona, USD/mes mes 12</th><th>Mes 36</th><th>Si no funciona, USD/mes</th>'
            '<th>Corte (mes)</th></tr></thead><tbody>' + "".join(filas) + "</tbody></table>")


def bloque_gantt_plan() -> str:
    meses = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"]
    carriles = [
        ("🙋 Arranque", "#eb6834", [(0, 1, "Cuentas")]),
        ("💵 Renta (G1)", COMP_COLOR["G1"], [(0, 12, "Un tramo por mes · 10 minutos")]),
        ("📱 Motor 1: Suite cristiana (A1)", COMP_COLOR["A1"], [(0, 2, "Construir"), (2, 3, "Testers"),
                                                               (3, 12, "Publicada · versículo diario · IA · eventos")]),
        ("🧰 Motor 2: Logistic Lab (C1)", COMP_COLOR["C1"], [(2, 5, "5 calculadoras"), (5, 12, "Simulador 2D · cátedra · plan Pro")]),
        ("🏷️ Compra chica (F1)", COMP_COLOR["F1"], [(3, 6, "Buscar y practicar"), (6, 12, "Comprar · traspaso · mejoras")]),
        ("📱 Segunda ola (A10)", COMP_COLOR["A10"], [(9, 12, "Radar de nichos → app nueva")]),
    ]
    hitos = [(3, "Mes 3", "primera app publicada"), (6, "Mes 6", "¿sigue el motor 1?"), (9, "Mes 9", "cortar lo que no funciona"),
             (12, "Mes 12", "comité anual")]
    cab = "".join(f"<span>{m}</span>" for m in meses)
    cuerpo = []
    for etq, col, tramos in carriles:
        barras = "".join(
            f'<div class="pg-barra" style="left:{d/12*100:.2f}%;width:{(h-d)/12*100:.2f}%;background:{col}"><span>{esc(t)}</span></div>'
            for d, h, t in tramos)
        cuerpo.append(f'<div class="pg-fila"><div class="pg-etq">{etq}</div><div class="pg-pista">{barras}</div></div>')
    marcas = "".join(
        f'<div class="pg-hito{" ult" if m == 12 else ""}" style="left:{m/12*100:.2f}%"><span><b>{esc(t)}</b><br>{esc(d)}</span></div>'
        for m, t, d in hitos)
    return (f'<div class="pg"><div class="pg-fila pg-cab"><div class="pg-etq">Oct-2026 → Sep-2027</div><div class="pg-meses">{cab}</div></div>'
            + "".join(cuerpo) + f'<div class="pg-fila pg-hitos"><div class="pg-etq">Decisiones</div><div class="pg-pista">{marcas}</div></div></div>')


def bloque_tabla_plan(r: dict) -> str:
    g = r["grupos"]
    filas = []
    for k, nombre in (("ninguno", "No funciona ninguno"), ("uno", "Funciona 1 motor"), ("dos_o_mas", "Funcionan 2 o más")):
        v = g[k]
        filas.append(f'<tr><td><b>{nombre}</b></td><td class="num">{v["prob"]*100:.0f}%</td>'
                     + "".join(f'<td class="num">{_usd(v["mediana"][m])}</td>' for m in (6, 12, 24, 36, 60))
                     + f'<td class="num">{_usd(v["acumulado_36"])}</td></tr>')
    filas.append('<tr class="ref"><td>Referencia: todo a renta</td><td class="num">—</td>'
                 + "".join(f'<td class="num">{_usd(r["solo_renta"][m])}</td>' for m in (6, 12, 24, 36, 60)) + '<td class="num">—</td></tr>')
    return ('<table class="tabla"><thead><tr><th>Escenario</th><th>Chances</th><th>Mes 6</th><th>Mes 12</th><th>Mes 24</th>'
            '<th>Mes 36</th><th>Mes 60</th><th>Plata acumulada a 3 años</th></tr></thead><tbody>' + "".join(filas) + "</tbody></table>")


# ─────────────────────────────────────────────── armado ───────────────────────────────────────────────
def css() -> str:
    return (FUENTE / "estilo.css").read_text(encoding="utf-8")


def fuentes_css(incrustar: bool) -> str:
    reglas = []
    for peso in (400, 500, 600, 700, 800):
        f = TIPO / f"inter-latin-{peso}-normal.woff2"
        src = ("data:font/woff2;base64," + base64.b64encode(f.read_bytes()).decode()) if incrustar else f"../tipografia/{f.name}"
        reglas.append(f"@font-face{{font-family:'Inter';font-style:normal;font-weight:{peso};font-display:block;"
                      f"src:url('{src}') format('woff2');}}")
    return "\n".join(reglas)


def valores(datos: dict, r: dict, r_turbo: dict) -> dict:
    por = {a["id"]: a for a in datos["alternativas"]}
    g, gt = r["grupos"], r_turbo["grupos"]
    v = {
        "n_alternativas": str(len(datos["alternativas"])),
        "n_con_numeros": str(sum(1 for a in datos["alternativas"] if a["_sim"] is not None)),
        "n_lista": str(sum(1 for a in datos["alternativas"] if a.get("origen") == "lista")),
        "p_alguno": f"{(1 - g['ninguno']['prob'])*100:.0f}%",
        "p_ninguno": f"{g['ninguno']['prob']*100:.0f}%",
        "p_uno": f"{g['uno']['prob']*100:.0f}%",
        "p_dos": f"{g['dos_o_mas']['prob']*100:.0f}%",
        "uno_m12": _usd(g["uno"]["mediana"][12]), "uno_m24": _usd(g["uno"]["mediana"][24]),
        "uno_m36": _usd(g["uno"]["mediana"][36]), "uno_m60": _usd(g["uno"]["mediana"][60]),
        "dos_m36": _usd(g["dos_o_mas"]["mediana"][36]), "dos_m60": _usd(g["dos_o_mas"]["mediana"][60]),
        "ninguno_acum": _usd(g["ninguno"]["acumulado_36"]), "uno_acum": _usd(g["uno"]["acumulado_36"]),
        "turbo_ninguno_acum": _usd(gt["ninguno"]["acumulado_36"]),
        "renta_m36": _usd(r["solo_renta"][36]), "renta_m60": _usd(r["solo_renta"][60]),
        "p400_m36": f"{r['p_supera_400'][36]*100:.0f}%",
    }
    for k in ("A1", "C1", "F1", "G1", "H1", "A10", "A2", "D1"):
        a = por[k]
        v[f"{k}_p"] = f"{a['p_exito']*100:.0f}%"
        v[f"{k}_m12"] = _u(a["_sim"]["normal_si_sale"][12])
        v[f"{k}_m36"] = _u(a["_sim"]["normal_si_sale"][36])
        v[f"{k}_puntaje"] = f"{a['_puntaje']:.0f}"
    return v


def portada(v: dict) -> str:
    return f"""
<section class="portada">
  <div class="p-marca">Informe 3 · Opportunity Intelligence &amp; Venture Portfolio · 26 de septiembre de 2026</div>
  <h1>El plan: ingresos con IA<br>en 6–10 horas por semana</h1>
  <p class="p-sub">{v['n_alternativas']} alternativas evaluadas una por una. Cuáles conviene hacer ya, cuáles después y cuáles nunca,
  con la plata a 6, 12 y 36 meses, las horas que te piden y el paso a paso para arrancar.</p>
  <div class="p-tiles">
    <div class="p-tile" style="--fc:{S1}"><div class="pt-k">Motor 1</div><div class="pt-v">📱 Suite cristiana</div>
      <div class="pt-s">Trivia bíblica + versículo del día + IA. Tu comunidad la difunde.</div></div>
    <div class="p-tile" style="--fc:{S3}"><div class="pt-k">Motor 2</div><div class="pt-v">🧰 Logistic Lab</div>
      <div class="pt-s">Calculadoras y simuladores logísticos. Tu conocimiento, con Claude programando.</div></div>
    <div class="p-tile" style="--fc:#008300"><div class="pt-k">Base</div><div class="pt-v">💵 Renta + 🏷️ una app que ya factura</div>
      <div class="pt-s">La plata trabaja sola y aprendés el negocio de las apps con un activo real.</div></div>
  </div>
  <div class="p-hero">
    <div><b>{v['p_alguno']}</b><span>chances de que al menos un motor funcione</span></div>
    <div><b>{v['uno_m36']}</b><span>por mes al año 3 si funciona uno (escenario normal)</span></div>
    <div><b>7–10 h</b><span>por semana; Claude hace el 80–90% del trabajo técnico</span></div>
  </div>
  <img class="p-graf" src="graficos/plan.svg" alt="Escenarios del plan">
  <p class="p-pie">Uso privado. Todas las cifras son estimaciones con fuentes fechadas; no es asesoramiento financiero regulado.
  Se generan desde el repositorio (<code>oportunidades/catalogo.yaml</code>) y se pueden recalcular.</p>
</section>"""


def construir_html(incrustar: bool = False) -> str:
    datos = catalogo.cargar()
    r = catalogo.simular_plan(datos)
    r_turbo = catalogo.simular_plan(datos, opcionales=True)
    v = valores(datos, r, r_turbo)
    por = {a["id"]: a for a in datos["alternativas"]}
    bloques = {
        "{{GANTT_PLAN}}": bloque_gantt_plan(),
        "{{TABLA_PLAN}}": bloque_tabla_plan(r),
        "{{RANKING}}": bloque_ranking(datos),
        "{{CRITERIOS}}": bloque_criterios(),
        "{{RESTO}}": bloque_resto(datos),
        "{{TRAMPAS}}": bloque_trampas(datos),
        "{{TU_LISTA}}": bloque_tu_lista(datos),
        "{{SUPUESTOS}}": bloque_supuestos(datos),
    }
    md = markdown.Markdown(extensions=["tables", "sane_lists", "md_in_html"])
    cuerpo, indice = [], []
    n = 0
    for ruta in sorted(CAPITULOS.glob("*.md")):
        texto = ruta.read_text(encoding="utf-8")
        for k, val in v.items():
            texto = texto.replace("{{v:" + k + "}}", val)
        marcadores = {}
        for i, (k, val) in enumerate(bloques.items()):
            if k in texto:
                token = f"BLOQUE{i}XYZ"
                texto = texto.replace(k, token)
                marcadores[token] = val
        for j, m_id in enumerate(re.findall(r"\{\{DETALLE:(\w+)\}\}", texto)):
            token = f"DETALLE{m_id}XYZ"
            texto = texto.replace("{{DETALLE:" + m_id + "}}", token)
            marcadores[token] = tarjeta_detalle(datos, por[m_id], primera=(j == 0))
        h = md.reset().convert(texto)
        for token, val in marcadores.items():
            h = h.replace(f"<p>{token}</p>", val).replace(token, val)
        es_anexo = ruta.name.startswith("9")
        for t in re.findall(r"<h1>(.*?)</h1>", h):
            if not es_anexo:
                n += 1
                indice.append(t)
                h = h.replace(f"<h1>{t}</h1>", f'<h1><span class="num">{n}</span>{t}</h1>', 1)
            else:
                indice.append(t)
        cuerpo.append(f'<section class="{"anexo" if es_anexo else "capitulo"}">{h}</section>')
    idx = "".join(f"<li>{t}</li>" for t in indice)
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(TITULO)}</title>
<style>{fuentes_css(incrustar)}\n{css()}</style></head><body>
{portada(v)}
<section class="indice"><h2>Contenido</h2><ol>{idx}</ol>
<div class="como-leer"><b>Cómo leer esto en 5 minutos.</b> Leé el capítulo 1 (la recomendación), mirá el calendario del capítulo 2 y
la plata del capítulo 3. Todo lo demás es para consultar: cada alternativa tiene su ficha con números, horas, riesgos y próximos pasos.
<br><br><b>Glosario mínimo.</b> <i>Funciona normal / muy bien</i>: el resultado típico y uno bueno si la alternativa funciona.
<i>Chances</i>: probabilidad estimada de que funcione. <i>Promedio ponderado por chances</i>: mezcla de lo que pasa si funciona y si no,
según sus probabilidades. <i>Regla de corte</i>: la condición, escrita antes de empezar, para dejar algo que no funciona.</div>
</section>
{''.join(cuerpo)}
</body></html>"""


def autocontenido(doc: str) -> str:
    def repl(m):
        datos = base64.b64encode((FUENTE / m.group(1)).read_bytes()).decode("ascii")
        return f'src="data:image/svg+xml;base64,{datos}"'
    return re.sub(r'src="(graficos/[^"]+\.svg)"', repl, doc)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--solo-html", action="store_true")
    ap.add_argument("--sin-graficos", action="store_true")
    args = ap.parse_args()
    if not args.sin_graficos:
        datos = catalogo.cargar()
        graficos(datos, catalogo.simular_plan(datos))
    SALIDA_HTML.write_text(construir_html(incrustar=False), encoding="utf-8")
    print("HTML de trabajo:", SALIDA_HTML)
    if args.solo_html:
        return 0
    SALIDA_HTML_AUTO.write_text(autocontenido(construir_html(incrustar=True)), encoding="utf-8")
    print("HTML autocontenido:", SALIDA_HTML_AUTO)
    env = dict(os.environ)
    env.setdefault("NODE_PATH", "/opt/node22/lib/node_modules")
    subprocess.run(["node", str(RAIZ / "informes" / "imprimir_pdf.cjs"), str(SALIDA_HTML), str(SALIDA_PDF), "El plan · Informe 3"],
                   check=True, env=env)
    return 0


if __name__ == "__main__":
    sys.exit(main())
