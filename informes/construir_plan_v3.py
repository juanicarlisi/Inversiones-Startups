#!/usr/bin/env python3
"""Informe 3 v3 — "El holding": 9 proyectos definidos, difusión sin costo, lo que funciona hoy, plan a 2030 y caso de negocio a 2031.

Uso:
  python3 informes/construir_plan_v3.py              # gráficos + HTML + PDF (dos pasadas) + HTML autocontenido
  python3 informes/construir_plan_v3.py --solo-html  # solo el HTML de trabajo

Datos: oportunidades/proyectos/*.yaml, oportunidades/backlog.yaml, oportunidades/catalogo.yaml; modelo: herramientas/holding.py.
Texto: informes/fuente-plan-v3/capitulos/*.md (las fichas de proyecto se generan desde los datos).
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
import yaml

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "informes" / "fuente-plan-v3"
CAPITULOS = FUENTE / "capitulos"
GRAF = FUENTE / "graficos"
TIPO = RAIZ / "informes" / "tipografia"
DIR_PROY = RAIZ / "oportunidades" / "proyectos"
sys.path.insert(0, str(RAIZ / "herramientas"))

import catalogo  # noqa: E402
import holding as H  # noqa: E402

TITULO = "El holding: 9 proyectos y el plan a 2030"
SALIDA_PDF = RAIZ / "informes" / "2026-09-el-holding-v3.pdf"
SALIDA_HTML_AUTO = RAIZ / "informes" / "2026-09-el-holding-v3.html"
SALIDA_HTML = FUENTE / "informe.html"

S1, S2, S3, S4 = "#2a78d6", "#eb6834", "#1baf7a", "#eda100"
TINTA, TINTA2, MUTED, GRILLA, SUP = "#0b0b0b", "#52514e", "#898781", "#e1e0d9", "#fcfcfb"
QUIEN_COLOR = {"claude": S1, "vos": S2, "ambos": S3}
QUIEN_NOMBRE = {"claude": "Claude", "vos": "Vos", "ambos": "Juntos"}
VERED_CLASE = {"hacer_ya": "v-ya", "plan": "v-plan", "segunda_ola": "v-2", "solo_si": "v-si", "no": "v-no", "palanca": "v-pal",
               "pausa": "v-pau"}
ANIOS = H.ANIOS
ANIO_ETQ = {2026: "2026 (oct–dic)", 2027: "2027", 2028: "2028", 2029: "2029", 2030: "2030", 2031: "2031 (ene–sep)"}
FIN_GANTT = H.idx("2030-12")  # 51 meses en la hoja grande


def _u(x: float) -> str:
    return f"{x:,.0f}".replace(",", ".")


def _usd(x: float) -> str:
    return ("−" if x < -0.5 else "") + "USD " + _u(abs(x))


def _dec(x: float, n: int = 1) -> str:
    return f"{x:.{n}f}".replace(".", ",")


def _num(x: float) -> str:
    """Número de tabla: guion si es casi cero, signo menos tipográfico si es negativo."""
    if abs(x) < 0.5:
        return "—"
    return ("−" if x < 0 else "") + _u(abs(x))


def esc(t) -> str:
    return html.escape(str(t))


def mes_txt(ym: str) -> str:
    a, m = (int(x) for x in ym.split("-"))
    return f"{H.MESES_ES[m-1]}-{str(a)[2:]}"


def mes_largo(ym: str) -> str:
    nombres = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre",
               "diciembre"]
    a, m = (int(x) for x in ym.split("-"))
    return f"{nombres[m-1]} de {a}"


# ─────────────────────────────────────────────── carga ───────────────────────────────────────────────
def cargar_todo() -> dict:
    datos = H.cargar()
    r = H.resumen(datos)
    cat = catalogo.cargar()
    extra = {k: yaml.safe_load((DIR_PROY / f"_{k}.yaml").read_text(encoding="utf-8")) for k in ("plan_mensual", "ideas_nuevas", "difusion")}
    return {"datos": datos, "r": r, "cat": cat, "extra": extra, "por_cat": {a["id"]: a for a in cat["alternativas"]},
            "pr": {p["id"]: p for p in r["proyectos"]}}


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
    import matplotlib.pyplot as plt
    plt.close(fig)


def _fmt_usd(x, _=None):
    if abs(x) >= 1000:
        return f"{x/1000:.1f}k".replace(".", ",").replace(",0k", "k")
    return f"{x:.0f}"


def _eje_meses(ax, hasta=H.N_MESES):
    ticks = [H.idx(f"{a}-01") for a in range(2027, 2032) if H.idx(f"{a}-01") < hasta]
    ax.set_xticks(ticks)
    ax.set_xticklabels([f"ene-{str(a)[2:]}" for a in range(2027, 2032)][:len(ticks)])
    ax.set_xlim(0, hasta - 1)


def graf_apilado(T):
    plt = _estilo()
    from matplotlib.ticker import FuncFormatter
    r = T["r"]
    x = np.arange(H.N_MESES)
    fig, ax = plt.subplots(figsize=(9.2, 3.6))
    base = np.zeros(H.N_MESES)
    for pr in r["proyectos"]:
        y = np.clip(pr["esperado"], 0, None)
        ax.fill_between(x, base, base + y, color=pr["p"]["color"], alpha=0.88, linewidth=0,
                        label=pr['nombre'])
        base = base + y
    ax.plot(x, r["total"]["media"], color=TINTA, linewidth=1.6, linestyle="--", label="Total esperado (neto de costos fijos)")
    _eje_meses(ax)
    ax.yaxis.set_major_formatter(FuncFormatter(_fmt_usd))
    ax.set_ylabel("USD por mes")
    ax.set_title("Ingreso esperado por proyecto, mes a mes (con chances)")
    ax.legend(loc="upper left", ncol=2, fontsize=7.4)
    fig.tight_layout()
    _guardar(fig, "apilado")


def graf_abanico(T):
    plt = _estilo()
    from matplotlib.ticker import FuncFormatter
    r = T["r"]
    x = np.arange(H.N_MESES)
    t = r["total"]
    fig, ax = plt.subplots(figsize=(9.2, 3.3))
    ax.fill_between(x, t["p10"], t["p90"], color=S1, alpha=0.14, linewidth=0, label="Rango probable (8 de cada 10 futuros)")
    ax.plot(x, t["p50"], color=S1, label="Mediana (la mitad queda arriba)")
    ax.plot(x, t["media"], color=TINTA, linestyle="--", linewidth=1.5, label="Promedio esperado")
    ax.plot(x, t["media"] + r.get("sec_esperado", 0), color=S2, linestyle=":", linewidth=1.8, label="Promedio con secundarios")
    ax.axhline(0, color="#c3c2b7", linewidth=1)
    for m in (H.idx("2027-12"), H.idx("2028-12"), H.idx("2030-12")):
        ax.annotate(_fmt_usd(t["p50"][m]), (m, t["p50"][m]), xytext=(0, 8), textcoords="offset points", ha="center",
                    fontsize=7.6, color=S1, fontweight="bold")
    _eje_meses(ax)
    ax.yaxis.set_major_formatter(FuncFormatter(_fmt_usd))
    ax.set_ylabel("USD por mes (neto del holding)")
    ax.set_title("Cuánto deja el holding por mes: rango de 4.000 futuros simulados")
    ax.legend(loc="upper left", fontsize=7.6)
    fig.tight_layout()
    _guardar(fig, "abanico")


def graf_horas(T):
    plt = _estilo()
    r = T["r"]
    hasta = FIN_GANTT + 1
    x = np.arange(hasta)
    fig, ax = plt.subplots(figsize=(9.2, 3.0))
    base = np.zeros(hasta)
    for pr in r["proyectos"]:
        h = r["horas"][pr["id"]][:hasta]
        if h.sum() == 0:
            continue
        ax.bar(x, h, bottom=base, color=pr["p"]["color"], width=0.82, edgecolor=SUP, linewidth=0.5, label=pr["nombre"])
        base += h
    ax.axhline(10, color=TINTA2, linewidth=1)
    ax.text(hasta - 0.5, 10.15, "tope habitual: 10 h", fontsize=7.4, color=TINTA2, ha="right", va="bottom")
    _eje_meses(ax, hasta)
    ax.set_ylabel("Horas por semana")
    ax.set_ylim(0, 12)
    ax.grid(axis="x", visible=False)
    ax.set_title("Tus horas por semana, mes a mes (plan base, si todo sigue)")
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.14), ncol=5, fontsize=7.2)
    fig.tight_layout()
    _guardar(fig, "horas")


def graf_caso(T, pr):
    plt = _estilo()
    from matplotlib.ticker import FuncFormatter
    r = T["r"]
    x = np.arange(H.N_MESES)
    p = pr["p"]
    col = p["color"]
    fig, ax = plt.subplots(figsize=(9.2, 2.5))
    if pr["tipo"] == "renta":
        cap = r["sim"]["capital"]
        ax.fill_between(x, np.percentile(cap, 10, axis=0), np.percentile(cap, 90, axis=0), color=col, alpha=0.15, linewidth=0,
                        label="Capital: rango probable")
        ax.plot(x, np.median(cap, axis=0), color=col, label="Capital en renta (mediana)")
        ax.set_ylabel("USD")
        ax.set_title("Capital en renta en dólares: aporte + mitad de las ganancias + interés compuesto")
    else:
        comps = H.componentes(p)
        if len(comps) == 1:
            c = comps[0]
            malo, bueno = c["malo"], c["bueno"]
            ax.fill_between(x, H.escalar(c, malo), H.escalar(c, bueno), color=col, alpha=0.13, linewidth=0,
                            label="Si funciona: de malo a muy bueno")
        ax.plot(x, pr["normal"], color=col, label="Si funciona (normal)")
        ax.plot(x, pr["esperado"], color=TINTA, linestyle="--", linewidth=1.5, label="Esperado (con chances)")
        ax.axhline(0, color="#c3c2b7", linewidth=1)
        ax.set_ylabel("USD por mes (neto)")
        ax.set_title(f"{p['nombre']}: ingreso neto por mes · chances de que funcione: {pr['chances']*100:.0f}%")
    _eje_meses(ax)
    ax.yaxis.set_major_formatter(FuncFormatter(_fmt_usd))
    ax.legend(loc="upper left", fontsize=7.6)
    fig.tight_layout()
    _guardar(fig, f"caso_{p['id']}")


def graf_publicidad():
    plt = _estilo()
    formatos = ["Banner", "Intersticial", "Video recompensado"]
    ee_uu, global_, latam = [1.0, 6.5, 22.0], [0.5, 3.75, 13.0], [0.10, 0.75, 2.5]
    x = np.arange(3)
    w = 0.26
    fig, (ax, ax2) = plt.subplots(1, 2, figsize=(9.2, 2.9), gridspec_kw={"width_ratios": [1.35, 1]})
    for i, (vals, col, nom) in enumerate(((ee_uu, S1, "EE.UU. y países ricos"), (global_, S2, "Promedio mundial"),
                                          (latam, S3, "Argentina (estimación)"))):
        ax.bar(x + (i - 1) * w, vals, width=w - 0.02, color=col, label=nom, edgecolor=SUP, linewidth=1.2)
    ax.set_xticks(x)
    ax.set_xticklabels(formatos)
    ax.set_ylabel("USD cada 1.000 anuncios vistos")
    ax.grid(axis="x", visible=False)
    ax.set_title("Cuánto paga la publicidad en apps (2026)")
    ax.legend(loc="upper left")
    cats = ["Lo que deja una\ninstalación (Arg.)", "Lo que deja una\ninstalación (EE.UU.)", "Lo que cuesta comprar\nuna instalación (LatAm)"]
    for i, (a_, b_) in enumerate(zip([0.05, 0.40, 0.50], [0.30, 1.00, 2.00])):
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


def graficos(T):
    graf_apilado(T)
    graf_abanico(T)
    graf_horas(T)
    graf_publicidad()
    for pr in T["r"]["proyectos"]:
        graf_caso(T, pr)


# ─────────────────────────────────────────────── piezas comunes ───────────────────────────────────────────────
def lista(items, clase="") -> str:
    return f'<ul class="{clase}">' + "".join(f"<li>{esc(i)}</li>" for i in items) + "</ul>"


def pill(ver: str, fam: str = "") -> str:
    if fam == "trampa":
        return '<span class="pill v-no">Trampa</span>'
    return f'<span class="pill {VERED_CLASE.get(ver, "v-pau")}">{esc(catalogo.VEREDICTOS.get(ver, ver))}</span>'


def horas_2027(T, pid) -> float:
    return float(np.mean(T["r"]["horas"][pid][H.meses_del_anio(2027)]))


def primer_mes(T, pid) -> str:
    h = T["r"]["horas"][pid]
    nz = np.nonzero(h)[0]
    return H.MESES[int(nz[0])] if len(nz) else "2026-10"


def inversion(p) -> float:
    c = p.get("caso", {})
    return float(c.get("inversion", 0) + c.get("precio_compra", 0))


# ─────────────────────────────────────────────── valores del texto ───────────────────────────────────────────────
def valores(T) -> dict:
    r = T["r"]
    k = r["kpi"]
    ta = r["total_anual"]["media"]
    v = {
        "n_proyectos": str(len(r["proyectos"])),
        "n_backlog": str(len(T["datos"]["backlog"]["items"])),
        "n_alternativas": str(len(T["cat"]["alternativas"])),
        "p_alguno": f"{k['p_alguno']*100:.0f}%",
        "p_cubre27": f"{k['p_cubre_fijos_dic27']*100:.0f}%",
        "p_cubre28": f"{k['p_cubre_fijos_dic28']*100:.0f}%",
        "p1000_28": f"{k['p_1000_dic28']*100:.0f}%",
        "p3000_30": f"{k['p_3000_dic30']*100:.0f}%",
        "esp_dic27": _usd(k["media_dic27"]), "p50_dic27": _usd(k["p50_dic27"]),
        "esp_dic28": _usd(k["media_dic28"]), "p50_dic28": _usd(k["p50_dic28"]),
        "esp_dic30": _usd(k["media_dic30"]), "p50_dic30": _usd(k["p50_dic30"]),
        "p10_dic30": _usd(k["p10_dic30"]), "p90_dic30": _usd(k["p90_dic30"]),
        "esp_2027": _usd(ta[2027]), "esp_2028": _usd(ta[2028]), "esp_2030": _usd(ta[2030]),
        "capital_dic30_p50": _usd(k["capital_dic30_p50"]), "capital_dic30_p10": _usd(k["capital_dic30_p10"]),
        "acum36_p10": _usd(abs(k["acum_36_p10"])),
        "inversion_total": _usd(k["inversion_total"]),
        "horas_2027": f"{k['horas_prom_2027']:.1f}".replace(".", ","),
        "horas_sec_2030": _dec(float(np.mean(r["horas_sec"][H.meses_del_anio(2030)]))),
        "horas_base_2030": _dec(float(np.mean(r["horas_total"][H.meses_del_anio(2030)]))),
    }
    return v


def llenar(texto: str, T) -> str:
    """Reemplaza {{esp:AAAA-MM}}, {{p50:…}}, {{p10:…}}, {{p90:…}} y atajos de probabilidad en textos del plan mensual."""
    t = T["r"]["total"]
    k = T["r"]["kpi"]

    def rep(m):
        clave, ym = m.group(1), m.group(2)
        i = H.idx(ym)
        serie = {"esp": t["media"], "p50": t["p50"], "p10": t["p10"], "p90": t["p90"]}[clave]
        return _usd(serie[i])
    texto = re.sub(r"\{\{(esp|p50|p10|p90):(\d{4}-\d{2})\}\}", rep, texto)
    texto = texto.replace("{{p_cubre27}}", f"{k['p_cubre_fijos_dic27']*100:.0f}%").replace("{{p1000_28}}", f"{k['p_1000_dic28']*100:.0f}%")
    return texto


# ─────────────────────────────────────────────── portada y resumen ───────────────────────────────────────────────
def portada(T, v) -> str:
    r = T["r"]
    tiles = []
    for pr in r["proyectos"]:
        p = pr["p"]
        tiles.append(f'<div class="pt2" style="--fc:{p["color"]}"><div class="pt2-i">{p["icono"]}</div><div><b>{esc(p["nombre"])}</b>'
                     f'<span>{esc(p["nombre_trabajo"])}</span></div></div>')
    return f"""
<section class="portada">
  <div class="p-marca">Informe 3 · versión 3 · Opportunity Intelligence &amp; Venture Portfolio · 28 de septiembre de 2026</div>
  <h1>El holding: 9 proyectos<br>y el plan hasta 2030</h1>
  <p class="p-sub">Cada proyecto definido de verdad (misión, alcance, versiones, difusión sin costo y sin cara, roadmap, nombres y caso
  de negocio a 5 años), lo que funciona hoy y conviene copiar o fusionar, un campo nuevo (Municipio y Estado), patentes y marcas, el
  plan mes a mes y un backlog de {v['n_backlog']} ideas en su versión viable.</p>
  <div class="p-grid9">{''.join(tiles)}</div>
  <div class="p-hero">
    <div><b>{v['p_alguno']}</b><span>chances de que al menos uno de los proyectos principales funcione</span></div>
    <div><b>{v['esp_dic28']}</b><span>por mes esperado a fin de 2028 (mediana {v['p50_dic28']})</span></div>
    <div><b>{v['esp_dic30']}</b><span>por mes esperado a fin de 2030 (mediana {v['p50_dic30']})</span></div>
  </div>
  <img class="p-graf" src="graficos/apilado.svg" alt="Ingreso esperado por proyecto">
  <p class="p-pie">Uso privado. Todas las cifras son estimaciones con fuentes fechadas; no es asesoramiento financiero ni legal.
  Se generan desde el repositorio (<code>oportunidades/proyectos/</code>, <code>herramientas/holding.py</code>) y se pueden recalcular.</p>
</section>"""


def bloque_resumen(T, v) -> str:
    r = T["r"]
    h = T["datos"]["holding"]
    k = r["kpi"]
    tiles = [
        ("Proyectos", f"{v['n_proyectos']} + {v['n_backlog']}", "principales + ideas en backlog"),
        ("Inversión total", v["inversion_total"], "incluye la app comprada, la empresa y las marcas"),
        ("Tus horas", "6–10 h/sem", f"promedio 2027: {v['horas_2027']} h"),
        ("Chances", v["p_alguno"], "de que al menos un proyecto principal funcione"),
        ("Esperado por mes", f"{_usd(k['media_dic27'])} → {_usd(k['media_dic28'])} → {_usd(k['media_dic30'])}", "fin de 2027 → 2028 → 2030"),
        ("Peor caso razonable", f"−{v['acum36_p10']}", "puesto de más en 3 años, con la compra de la app (1 de cada 10 futuros)"),
    ]
    th = "".join(f'<div class="kt"><div class="kl">{esc(a)}</div><div class="kv">{b}</div><div class="ks">{esc(c)}</div></div>' for a, b, c in tiles)
    filas = []
    for pr in r["proyectos"]:
        p = pr["p"]
        ea = pr["esp_anual"]
        na = pr["norm_anual"]
        filas.append(
            f'<tr><td class="c-proy"><span class="dot" style="background:{p["color"]}"></span><b>{esc(p["nombre"])}</b>'
            f'<br><small>{esc(p["nombre_trabajo"])} · {esc(p["rol"].lower())}</small></td><td>{mes_txt(primer_mes(T, p["id"]))}</td>'
            f'<td class="num">{_dec(horas_2027(T, p["id"]))}</td><td class="num">{_u(inversion(p))}</td><td class="num">{pr["chances"]*100:.0f}%</td>'
            f'<td class="num">{_num(ea[2027])}</td><td class="num">{_num(ea[2028])}</td><td class="num"><b>{_num(ea[2030])}</b></td>'
            f'<td class="num">{_num(na[2030])}</td></tr>')
    fijos = r["fijos"]
    filas.append('<tr class="sub"><td colspan="5">Costos fijos del holding (Claude, empresa, herramientas)</td>'
                 + "".join(f'<td class="num">{_num(-np.mean(fijos[H.meses_del_anio(a)]))}</td>' for a in (2027, 2028, 2030)) + '<td></td></tr>')
    ta = r["total_anual"]["media"]
    filas.append('<tr class="tot"><td colspan="5">Total esperado del holding</td>'
                 + "".join(f'<td class="num">{_num(ta[a])}</td>' for a in (2027, 2028, 2030)) + '<td></td></tr>')
    tabla = ('<table class="tabla res"><thead><tr><th>Proyecto</th><th>Arranca</th><th class="num">h/sem 2027</th>'
             '<th class="num">Inversión USD</th><th class="num">Chances</th><th class="num">Esperado 2027</th><th class="num">2028</th>'
             '<th class="num">2030</th><th class="num">Si funciona 2030</th></tr></thead><tbody>' + "".join(filas) + "</tbody></table>")
    back = [it for it in T["datos"]["backlog"]["items"] if it.get("secundario")]
    back.sort(key=lambda i: i["prioridad"])
    bfilas = "".join(f'<tr><td class="c-n">{i["prioridad"]}</td><td><b>{esc(i["nombre"])}</b></td><td>{mes_txt(i["desde"])}</td>'
                     f'<td>{esc(destino_txt(T, i["destino"]))}</td></tr>' for i in back)
    return f"""
<p class="lead-h"><b>{esc(h['nombre'])}</b> (nombre recomendado del holding) · {esc(h['mision'])}</p>
<div class="kpis">{th}</div>
<h2>Los nueve proyectos</h2>
<p class="nota">USD por mes, promedio de cada año. «Esperado» cuenta las chances de que funcione o no; «si funciona» es su escenario normal.</p>
{tabla}
<div class="duo res2">
<div><h3>Del backlog, lo que conviene trabajar después</h3>
<table class="tabla mini-t"><thead><tr><th>#</th><th>Idea</th><th>Desde</th><th>Con</th></tr></thead><tbody>{bfilas}</tbody></table></div>
<div><h3>Lo que tenés que saber</h3><ul class="apretada">
<li><b>2027 es de construcción:</b> esperado a fin de año {v['esp_dic27']} por mes (mediana {v['p50_dic27']}); {v['p_cubre27']} de chances de que los proyectos ya cubran los costos fijos.</li>
<li><b>2028 es la bisagra:</b> {v['p1000_28']} de chances de pasar USD 1.000 por mes a fin de año.</li>
<li><b>2030:</b> mediana {v['p50_dic30']} por mes; rango probable de {v['p10_dic30']} a {v['p90_dic30']}.</li>
<li><b>La renta</b> junta tu aporte y la mitad de las ganancias: {v['capital_dic30_p50']} a fin de 2030 (mediana).</li>
<li><b>Hitos que deciden:</b> abril de 2027 (Senda), septiembre de 2027 (Andén), cada producto a los 90 días, comité cada diciembre.</li>
</ul></div>
</div>
<h2>El rango: lo que puede dejar el holding por mes</h2>
<img src="graficos/abanico.svg" alt="Rango del ingreso del holding">
<p class="nota">Cada mes, la banda muestra dónde cae el ingreso neto del holding en 8 de cada 10 futuros simulados. La línea punteada
naranja suma los 7 secundarios del backlog. Detalle año por año en el capítulo {{{{cap:18}}}}.</p>"""


def destino_txt(T, dest: str) -> str:
    if dest in T["pr"]:
        p = T["pr"][dest]["p"]
        return f"{p['nombre']}"
    return {"propio": "Proyecto propio", "canal": "Canal extra", "pausa": "En pausa", "trampa": "Trampa"}.get(dest, dest)


def bloque_pedido(T) -> str:
    filas = "".join(f'<tr><td>{esc(x["que"])}</td><td>{esc(x["donde"])}</td></tr>' for x in T["extra"]["ideas_nuevas"]["pedido"])
    return f'<table class="tabla"><thead><tr><th>Lo que pediste</th><th>Dónde está</th></tr></thead><tbody>{filas}</tbody></table>'


def bloque_matriz(T) -> str:
    filas = []
    for pr in T["r"]["proyectos"]:
        p = pr["p"]
        de = " · ".join(b["de"] for b in p.get("benchmark", []))
        dif = p.get("diferencial", [])[:2]
        filas.append(f'<tr><td><b>{p["icono"]} {esc(p["nombre"])}</b></td><td>{esc(de)}</td><td>{lista(dif, "apretada")}</td></tr>')
    return ('<table class="tabla matriz"><thead><tr><th>Proyecto</th><th>Qué miramos</th><th>Qué incorporamos / nuestro diferencial</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>')


def bloque_ideas_nuevas(T) -> str:
    filas = "".join(f'<tr><td class="c-id">{x["n"]}</td><td><b>{esc(x["idea"])}</b></td><td>{esc(x["viene"])}</td><td>{esc(x["va"])}</td></tr>'
                    for x in T["extra"]["ideas_nuevas"]["nuevas"])
    return ('<table class="tabla"><thead><tr><th>#</th><th>Idea nueva</th><th>De dónde sale</th><th>Dónde va</th></tr></thead>'
            f'<tbody>{filas}</tbody></table>')


def bloque_difusion(T) -> str:
    out = []
    for g in T["extra"]["difusion"]["grupos"]:
        items = "".join(f'<li><span class="dn">{i["n"]}</span>{esc(i["f"])}<em>{esc(i["usa"])}</em></li>' for i in g["items"])
        out.append(f'<div class="dg"><h4>{g["icono"]} {esc(g["g"])}</h4><ul>{items}</ul></div>')
    return f'<div class="dif-grid">{"".join(out)}</div>'


def bloque_mapa(T) -> str:
    cards = []
    for pr in T["r"]["proyectos"]:
        p = pr["p"]
        cards.append(f"""<div class="mp" style="--fc:{p['color']}">
<div class="mp-k">{p['id']} · {esc(p['rol'])}</div><div class="mp-n">{p['icono']} {esc(p['nombre'])}</div>
<div class="mp-t">{esc(p['nombre_trabajo'])}</div><p>{esc(p['lema'])}</p>
<div class="mp-d"><span>Arranca <b>{mes_txt(primer_mes(T, p['id']))}</b></span><span>Chances <b>{pr['chances']*100:.0f}%</b></span>
<span>Esperado 2030 <b>{_usd(pr['esp_anual'][2030])}</b>/mes</span></div></div>""")
    return f'<div class="mapa9">{"".join(cards)}</div>'


# ─────────────────────────────────────────────── fichas de proyecto ───────────────────────────────────────────────
CORTES_TABLA = ["2026-12", "2027-12", "2028-12", "2029-12", "2030-12", "2031-09"]


def gantt_proyecto(p) -> str:
    n = FIN_GANTT + 1
    cab = []
    for a in range(2026, 2031):
        ms = [i for i in range(n) if H.MESES[i].startswith(str(a))]
        cab.append(f'<span style="left:{ms[0]/n*100:.2f}%;width:{len(ms)/n*100:.2f}%">{a}</span>')
    lineas = "".join(f'<i style="left:{H.idx(f"{a}-01")/n*100:.2f}%"></i>' for a in range(2027, 2031))
    filas = []
    for fase, d, hta, q in p.get("gantt", []):
        i0, i1 = H.idx(d), min(H.idx(hta), n - 1)
        izq, ancho = i0 / n * 100, max((i1 - i0 + 1) / n * 100, 1.2)
        filas.append(f'<div class="rg-f"><div class="rg-t">{esc(fase)}</div><div class="rg-p">{lineas}'
                     f'<b style="left:{izq:.2f}%;width:{ancho:.2f}%;background:{QUIEN_COLOR[q]}"></b></div></div>')
    hs = [(m, t) for m, t in p.get("hitos", []) if H.idx(m) < n]
    hitos = "".join(f'<span class="rg-h" style="left:{(H.idx(m) + 0.5)/n*100:.2f}%">{k}</span>' for k, (m, t) in enumerate(hs, 1))
    ley_h = "".join(f'<span><b class="rg-hn">{k}</b><b>{mes_txt(m)}</b> {esc(t)}</span>' for k, (m, t) in enumerate(hs, 1))
    ley = "".join(f'<span><i style="background:{QUIEN_COLOR[k]}"></i>{QUIEN_NOMBRE[k]}</span>' for k in QUIEN_COLOR)
    return (f'<div class="rg"><div class="rg-f rg-cab"><div class="rg-t">Oct-2026 → dic-2030</div><div class="rg-p rg-anios">{"".join(cab)}</div></div>'
            + "".join(filas)
            + f'<div class="rg-f rg-hitos"><div class="rg-t">Hitos</div><div class="rg-p">{lineas}{hitos}</div></div>'
            + f'<div class="rg-hl">{ley_h}</div><div class="rg-ley">{ley}</div></div>')


def tabla_caso(T, pr) -> str:
    p = pr["p"]
    c = p.get("caso", {})
    cols = CORTES_TABLA
    idxs = [H.idx(m) for m in cols]
    cab = "".join(f'<th class="num">{mes_txt(m)}</th>' for m in cols)
    filas = []
    if pr["tipo"] == "renta":
        cap = T["r"]["sim"]["capital"]
        ren = T["r"]["sim"]["renta"]
        filas.append('<tr><td>Capital en renta (mediana, USD)</td>' + "".join(f'<td class="num">{_u(np.median(cap[:, i]))}</td>' for i in idxs) + "</tr>")
        filas.append('<tr><td>Interés del mes (mediana, USD)</td>' + "".join(f'<td class="num">{_u(np.median(ren[:, i]))}</td>' for i in idxs) + "</tr>")
        filas.append('<tr><td>Capital en el peor caso razonable (1 de cada 10)</td>'
                     + "".join(f'<td class="num">{_u(np.percentile(cap[:, i], 10))}</td>' for i in idxs) + "</tr>")
    elif pr["tipo"] == "cartera":
        comps = H.componentes(p)
        plantillas = {prod["id"]: prod for prod in p["productos"] if prod.get("tipo") == "plantilla"}
        for k in comps:
            if any(k["id"].startswith(pid) and k["id"] != pid for pid in plantillas):
                continue
            filas.append(f'<tr><td>{esc(k["nombre"])} <small>(lanza {mes_txt(k["lanzamiento"])}, {k["p_exito"]*100:.0f}%)</small> · si funciona</td>'
                         + "".join(f'<td class="num">{_num(k["neto"][i]) if i >= H.idx(k["lanzamiento"]) else "·"}</td>' for i in idxs) + "</tr>")
        for pid, prod in plantillas.items():
            grupo = [k for k in comps if k["id"].startswith(pid) and k["id"] != pid]
            aporte = sum(k["p_exito"] * k["neto"] for k in grupo)
            filas.append(f'<tr><td>{esc(prod["nombre"])} <small>({len(grupo)} lanzamientos, {prod["p_exito"]*100:.0f}% cada uno)</small> · aporte esperado</td>'
                         + "".join(f'<td class="num">{_num(aporte[i]) if i >= H.idx(prod["lanzamientos"][0]) else "·"}</td>' for i in idxs) + "</tr>")
        filas.append('<tr class="sub"><td>Si al menos uno pega (promedio condicionado)</td>'
                     + "".join(f'<td class="num">{_num(pr["normal"][i])}</td>' for i in idxs) + "</tr>")
    else:
        comp = H.componentes(p)[0]
        uni = c.get("unidades", {})
        for dname, etq in uni.items():
            serie = H._interp(c["fechas"], c["drivers"][dname])
            filas.append(f'<tr class="drv"><td>{esc(etq)}</td>' + "".join(f'<td class="num">{_u(serie[i])}</td>' for i in idxs) + "</tr>")
        for nombre, serie in comp["lineas"].items():
            filas.append(f'<tr><td>{esc(nombre)} (USD/mes)</td>' + "".join(f'<td class="num">{_num(serie[i])}</td>' for i in idxs) + "</tr>")
        filas.append('<tr><td>Costos (USD/mes)</td>' + "".join(f'<td class="num">{_num(-comp["costo"][i])}</td>' for i in idxs) + "</tr>")
        filas.append('<tr class="sub"><td>Neto del mes, si funciona</td>' + "".join(f'<td class="num">{_num(comp["neto"][i])}</td>' for i in idxs) + "</tr>")
    filas.append('<tr class="tot"><td>Promedio del año · si funciona (normal)</td>' + "".join(f'<td class="num">{_num(pr["norm_anual"][a])}</td>' for a in ANIOS) + "</tr>")
    filas.append('<tr class="tot esp"><td>Promedio del año · esperado (con chances)</td>' + "".join(f'<td class="num">{_num(pr["esp_anual"][a])}</td>' for a in ANIOS) + "</tr>")
    nota = ("Columnas: valor a fin de cada año (septiembre en 2031). Las dos últimas filas son promedios del año "
            "(2026: octubre a diciembre; 2031: enero a septiembre).")
    return (f'<table class="tabla caso"><thead><tr><th>Supuesto o resultado</th>{cab}</tr></thead><tbody>{"".join(filas)}</tbody></table>'
            f'<p class="nota">{nota}</p>')


def productos_html(T, p) -> str:
    if not p.get("productos"):
        return ""
    cards = []
    for prod in p["productos"]:
        if prod.get("tipo") == "plantilla":
            lz = ", ".join(mes_txt(x) for x in prod["lanzamientos"])
            cards.append(f'<div class="prod suave"><div class="prod-n">{esc(prod["nombre"])}</div><p>{esc(prod["que_es"])}</p>'
                         f'<div class="prod-d"><span>Lanzamientos: <b>{lz}</b></span><span>Chances de cada uno: <b>{prod["p_exito"]*100:.0f}%</b></span></div></div>')
            continue
        noms = " · ".join(f'<b>{esc(n["n"])}</b>' if i == 0 else esc(n["n"]) for i, n in enumerate(prod.get("nombres", [])))
        estado = prod.get("nombres", [{}])[0].get("estado", "")
        comp = next(k for k in H.componentes(p) if k["id"] == prod["id"])
        vals = " · ".join(f'<span class="nw">{mes_txt(m)}: <b>{_usd(comp["neto"][H.idx(m)])}</b></span>' for m in ("2028-12", "2029-12", "2030-12"))
        cards.append(f"""<div class="prod"><div class="prod-n">{esc(prod['nombre'])}</div>
<div class="prod-nom">Nombres: {noms}<br><small>{esc(estado)}</small></div>
<p>{esc(prod['que_es'])}</p><p class="prod-pq"><b>Por qué:</b> {esc(prod.get('por_que', ''))}</p>
<div class="prod-d"><span>Lanza <b>{mes_txt(prod['lanzamiento'])}</b></span><span>Chances <b>{prod['p_exito']*100:.0f}%</b></span></div>
<div class="prod-d">Si funciona, por mes: {vals}</div></div>""")
    titulo = "Los productos, uno por uno" if p["id"] == "P5" else "Los juegos, uno por uno"
    return f'<h2>{titulo}</h2><div class="prod-grid">{"".join(cards)}</div>'


def ficha_proyecto(T, pr) -> tuple[str, str]:
    p = pr["p"]
    r = T["r"]
    titulo = f"{p['nombre']} · {p['nombre_trabajo']}"
    tiles = [
        ("Chances", f"{pr['chances']*100:.0f}%", esc(p.get("caso", {}).get("exito_es", "de que al menos uno pegue") if pr["tipo"] != "cartera" else "de que al menos un producto pegue")),
        ("Tus horas 2027", f"{_dec(horas_2027(T, p['id']))} h/sem", "promedio del año"),
        ("Inversión inicial", _usd(inversion(p)), "además de los costos mensuales"),
        ("Esperado 2030", _usd(pr["esp_anual"][2030]), "USD/mes promedio, con chances"),
        ("Si funciona 2030", _usd(pr["norm_anual"][2030]) if pr["tipo"] != "renta" else _usd(np.median(r["sim"]["capital"][:, H.idx("2030-12")])),
         "USD/mes, escenario normal" if pr["tipo"] != "renta" else "capital a fin de 2030 (mediana)"),
    ]
    th = "".join(f'<div class="tile"><div class="tl">{a}</div><div class="tv">{b}</div><div class="ts">{c}</div></div>' for a, b, c in tiles)
    # nombres
    nfilas = []
    for i, n in enumerate(p.get("nombres", [])):
        star = "★ " if n["n"] == p["nombre"] or (i == 0 and p["nombre"] not in [x["n"] for x in p["nombres"]]) else ""
        nfilas.append(f'<tr class="{"elegido" if star else ""}"><td><b>{star}{esc(n["n"])}</b></td><td>{esc(n["por_que"])}</td><td>{esc(n["estado"])}</td></tr>')
    sub = f'<p class="nota"><b>Submarcas:</b> {esc(" · ".join(p["submarcas"]))}</p>' if p.get("submarcas") else ""
    nombres = (f'<table class="tabla nom"><thead><tr><th>Nombre</th><th>Por qué pega</th><th>Verificación (28-09-2026)</th></tr></thead>'
               f'<tbody>{"".join(nfilas)}</tbody></table>{sub}')
    objetivos = "".join(f'<div class="obj"><span>{esc(o["cuando"])}</span>{esc(o["que"])}</div>' for o in p.get("objetivos", []))
    versiones = "".join(f'<div class="ver"><div class="ver-t">{esc(vv["v"])}</div>{lista(vv["funciones"])}</div>' for vv in p.get("versiones", []))
    bench = "".join(f'<tr><td><b>{esc(b["de"])}</b></td><td>{esc(b["tomamos"])}</td></tr>' for b in p.get("benchmark", []))
    contenido = f'<h2>Contenido y licencias</h2>{lista(p["contenido"])}' if p.get("contenido") else ""
    d = p.get("difusion", {})
    difusion = ""
    if d.get("principal") and d.get("principal") != "No aplica.":
        difusion = f"""<h2>Cómo lo damos a conocer (sin pagar publicidad y sin tu cara)</h2>
<div class="dprin"><b>Canal principal:</b> {esc(d['principal'])}</div>
<div class="duo"><div><h4>De apoyo</h4>{lista(d.get('apoyo', []))}</div><div><h4>Tácticas</h4>{lista(d.get('tacticas', []))}</div></div>"""
    hs = r["horas"][p["id"]]
    horas_anio = " · ".join(f'{a}: <b>{np.mean(hs[H.meses_del_anio(a)]):.1f} h</b>'.replace(".", ",") for a in (2026, 2027, 2028, 2029, 2030))
    q = p.get("quien", {})
    metricas = p.get("metricas", {})
    recordatorios = f'<div class="caja rec"><h4>🗓️ Recordatorios</h4>{lista(p["recordatorios"])}</div>' if p.get("recordatorios") else ""
    pi = f'<div class="caja"><h4>🛡️ Protección</h4>{lista(p["pi"])}</div>' if p.get("pi") else ""
    sup = list(p.get("caso", {}).get("supuestos", []))
    for prod in p.get("productos", []):
        sup += [f'{prod["nombre"]}: {s}' for s in prod.get("supuestos", [])]
    html_ = f"""
<section class="proy" style="--pc:{p['color']}">
<div class="pr-band"><div class="pr-ico">{p['icono']}</div><div class="pr-tit"><div class="pr-k">{p['id']} · {esc(p['rol'])}</div>
<div class="pr-lema">«{esc(p['lema'])}»</div></div></div>
<p class="pr-frase">{esc(p['una_frase'])}</p>
<div class="tiles">{th}</div>
<div class="duo"><div class="caja"><h4>🧩 El problema</h4><p>{esc(p['problema'])}</p></div>
<div class="caja"><h4>👥 Para quién</h4>{lista(p.get('para_quien', []))}</div></div>
<div class="misvis"><div><span>Misión</span>{esc(p['mision'])}</div><div><span>Visión</span>{esc(p['vision'])}</div></div>
<h2>Objetivos</h2><div class="obj-grid">{objetivos}</div>
<h2>Nombres posibles</h2>{nombres}
<h2>Qué incluye y qué no</h2>
<div class="duo"><div class="caja si"><h4>Incluye</h4>{lista(p['alcance']['incluye'])}</div>
<div class="caja no"><h4>No incluye</h4>{lista(p['alcance']['no_incluye'])}</div></div>
{f'<h2>Las versiones</h2><div class="ver-grid">{versiones}</div>' if versiones else ""}
{productos_html(T, p)}
<h2>Lo que tomamos de otros y nuestro diferencial</h2>
<table class="tabla bench"><thead><tr><th>Miramos</th><th>Qué tomamos</th></tr></thead><tbody>{bench}</tbody></table>
<div class="caja si"><h4>⭐ Nuestro diferencial</h4>{lista(p.get('diferencial', []))}</div>
{contenido}
{difusion}
<h2>Cómo lo trabajamos</h2>
{lista(p.get('metodologia', []))}
<div class="duo quienes"><div><h4 style="color:{S1}">🤖 Claude</h4>{lista(q.get('claude', []))}</div>
<div><h4 style="color:{S2}">🙋 Vos</h4>{lista(q.get('vos', []))}</div></div>
<p class="nota"><b>Tus horas por semana (promedio de cada año):</b> {horas_anio}</p>
<h2>Roadmap 2026–2030</h2>
{gantt_proyecto(p)}
<h2>Cómo medimos, cuándo cortamos y qué puede salir mal</h2>
<div class="tres-c"><div><h4>📏 Métrica que manda</h4><p><b>{esc(metricas.get('norte', ''))}</b></p>{lista(metricas.get('otras', []))}</div>
<div><h4>✂️ Reglas de corte</h4>{lista(p.get('cortes', []))}</div>
<div><h4>⚠️ Riesgos y cómo los bajamos</h4>{lista(p.get('riesgos', []))}</div></div>
<div class="duo">{pi}{recordatorios}</div>
<div class="caso-bloque"><h2>Caso de negocio</h2>
{tabla_caso(T, pr)}</div>
<img class="esc" src="graficos/caso_{p['id']}.svg" alt="Caso de negocio {esc(p['nombre'])}">
{f'<div class="sup"><b>Supuestos:</b>{lista(sup)}</div>' if sup else ""}
</section>"""
    return titulo, html_


# ─────────────────────────────────────────────── gantt grande (A3 apaisada) ───────────────────────────────────────────────
A3_PISTA_MM = 396 - 52          # ancho útil de la pista (A3 apaisada menos márgenes y columna de nombres)
A3_MM_CHAR = 1.06               # ancho medio de un carácter a 5,8 pt (Inter)


def _empacar(items: list[dict], n: int) -> list[list[dict]]:
    """Reparte barras en carriles sin que se pisen (cuenta el largo del texto, que puede salir de la barra)."""
    mm_mes = A3_PISTA_MM / n
    carriles: list[list[dict]] = []
    fines: list[float] = []
    for it in items:
        ancho_txt = (len(it["t"]) * A3_MM_CHAR + 3.5) / mm_mes
        it["der"] = it["i0"] + ancho_txt > n          # el texto no entra hacia la derecha: se alinea al final de la barra
        it["ini"] = it["i0"] - ancho_txt if it["der"] else it["i0"]
        it["fin"] = it["i1"] + 1 if it["der"] else max(it["i1"] + 1, it["i0"] + ancho_txt)
    for it in sorted(items, key=lambda x: (x["ini"], -(x["i1"] - x["i0"]))):
        fin = it["fin"] + 0.25
        for k, f in enumerate(fines):
            if f <= it["ini"]:
                carriles[k].append(it)
                fines[k] = fin
                break
        else:
            carriles.append([it])
            fines.append(fin)
    return carriles


def gantt_a3(T) -> str:
    r = T["r"]
    n = FIN_GANTT + 1
    pct = lambda i: f"{i / n * 100:.3f}%"  # noqa: E731
    # cabecera: años y meses
    anios, meses = [], []
    for a in range(2026, 2031):
        ms = [i for i in range(n) if H.MESES[i].startswith(str(a))]
        anios.append(f'<span class="a3-anio{" par" if a % 2 == 0 else ""}" style="left:{pct(ms[0])};width:{pct(len(ms))}">{a}</span>')
    for i in range(n):
        m = int(H.MESES[i][5:])
        meses.append(f'<span style="left:{pct(i)};width:{pct(1)}">{"EFMAMJJASOND"[m-1]}</span>')
    fondo = "".join(f'<i class="a3-bg" style="left:{pct(H.idx(f"{a}-01"))};width:{pct(12)}"></i>' for a in (2027, 2029))
    fondo += "".join(f'<i class="a3-q" style="left:{pct(i)}"></i>' for i in range(n) if int(H.MESES[i][5:]) in (1, 4, 7, 10) and i > 0)
    filas = []
    for pr in r["proyectos"]:
        p = pr["p"]
        items = []
        for fase, d, hta, _q in p.get("gantt", []):
            i0, i1 = H.idx(d), min(H.idx(hta), n - 1)
            if i0 >= n:
                continue
            items.append({"t": fase, "i0": i0, "i1": i1, "tipo": "barra"})
        for m, t in p.get("hitos", []):
            i = H.idx(m)
            if i < n:
                items.append({"t": t, "i0": i, "i1": i, "tipo": "hito"})
        carriles = _empacar(items, n)
        pistas = []
        for carril in carriles:
            cosas = []
            for it in carril:
                if it["tipo"] == "barra":
                    pos = f'right:{pct(n - it["i0"])};padding-right:1mm' if it["der"] else f'left:{pct(it["i0"])}'
                    cosas.append(f'<b class="a3-b" style="left:{pct(it["i0"])};width:{pct(it["i1"] - it["i0"] + 1)}"></b>'
                                 f'<em class="a3-t" style="{pos}">{esc(it["t"])}</em>')
                else:
                    cosas.append(f'<b class="a3-h" style="left:{pct(it["i0"] + 0.5)}"></b>'
                                 f'<em class="a3-t a3-th" style="left:calc({pct(it["i0"] + 0.5)} + 2.2mm)">{esc(it["t"])}</em>')
            pistas.append(f'<div class="a3-pista">{"".join(cosas)}</div>')
        ch = f'{pr["chances"]*100:.0f}%'
        filas.append(f"""<div class="a3-proy" style="--pc:{p['color']}">
<div class="a3-nom"><div class="a3-n">{p['icono']} {esc(p['nombre'])}</div><div class="a3-s">{esc(p['nombre_trabajo'])}</div>
<div class="a3-s">Chances {ch} · 2030: {_usd(pr['esp_anual'][2030])}/mes</div></div>
<div class="a3-pistas">{fondo}{"".join(pistas)}</div></div>""")
    # hitos del holding (numerados)
    hh = T["datos"]["holding"]["hitos"]
    marcas = "".join(f'<span class="a3-hn" style="left:{pct(H.idx(x["cuando"]) + 0.5)}">{k}</span>' for k, x in enumerate(hh, 1))
    ley_h = "".join(f'<div><span class="a3-hn st">{k}</span><span><b>{mes_txt(x["cuando"])}</b> {esc(x["que"])}</span></div>' for k, x in enumerate(hh, 1))
    # filas de números: ingreso esperado, mediana y horas por mes
    t = r["total"]
    sec = r.get("sec_esperado", np.zeros(H.N_MESES))
    horas = r["horas_total"]

    def fila_num(titulo, sub, serie, fmt, clase=""):
        celdas = []
        for i in range(n):
            val = serie[i]
            neg = " neg" if val < -0.5 else ""
            celdas.append(f'<span class="{neg.strip()}" style="left:{pct(i)};width:{pct(1)}">{fmt(val)}</span>')
        return (f'<div class="a3-fn {clase}"><div class="a3-nom"><div class="a3-n2">{titulo}</div><div class="a3-s">{sub}</div></div>'
                f'<div class="a3-cel">{fondo}{"".join(celdas)}</div></div>')

    def k_(x):
        if abs(x) < 0.5:
            return "0"
        s = "−" if x < 0 else ""
        x = abs(x)
        return s + (f"{x/1000:.1f}k".replace(".", ",") if x >= 1000 else f"{x:.0f}")

    def h_(x):
        return f"{x:.1f}".replace(".", ",").replace(",0", "")
    numeros = (fila_num("Ingreso esperado", "USD/mes, neto del holding", t["media"], k_)
               + fila_num("Mediana", "la mitad de los futuros queda arriba", t["p50"], k_, "suave")
               + fila_num("Con secundarios", "esperado + ideas del backlog", t["media"] + sec, k_, "suave")
               + fila_num("Tus horas", "por semana, plan base (si todo sigue)", horas, h_, "horas"))
    ley_col = "".join(f'<span><i style="background:{pr["p"]["color"]}"></i>{esc(pr["nombre"])}</span>' for pr in r["proyectos"])
    return f"""
<section class="a3">
<div class="a3-cab"><div><div class="a3-k">Hoja grande · plan completo</div><div class="a3-h1">El plan del holding, mes a mes, de octubre de 2026 a diciembre de 2030</div></div>
<div class="a3-ley">{ley_col}<span><i class="rombo"></i>Hito del proyecto</span></div></div>
<div class="a3-g">
<div class="a3-fila a3-top"><div class="a3-nom"></div><div class="a3-escala">{"".join(anios)}</div></div>
<div class="a3-fila a3-top"><div class="a3-nom"></div><div class="a3-escala meses">{"".join(meses)}</div></div>
{"".join(filas)}
<div class="a3-proy a3-hold" style="--pc:#0b0b0b"><div class="a3-nom"><div class="a3-n">🏛️ Hitos del holding</div><div class="a3-s">decisiones de comité (ver abajo)</div></div>
<div class="a3-pistas">{fondo}<div class="a3-pista">{marcas}</div></div></div>
{numeros}
</div>
<div class="a3-pie"><div class="a3-hitos">{ley_h}</div>
<div class="a3-nota"><b>Cómo leerla.</b> Cada franja es un proyecto; las barras son fases de trabajo y los rombos, sus hitos (muchos son reglas de corte).
Abajo, lo que se espera que deje el holding cada mes (promedio de 4.000 futuros simulados, neto de Claude, empresa y herramientas;
no incluye tu aporte) y tus horas por semana. Si un proyecto se corta, sus horas pasan al siguiente del backlog. Las fases de 2029–2030
son intención, no compromiso: se reordenan en cada comité anual.</div></div>
</section>"""


# ─────────────────────────────────────────────── plan mes a mes, trimestres, hitos ───────────────────────────────────────────────
def bloque_mes_a_mes(T) -> str:
    r = T["r"]
    filas = []
    for m in T["extra"]["plan_mensual"]["meses"]:
        i = H.idx(m["mes"])
        h = r["horas_total"][i]
        activos = [pr["p"] for pr in r["proyectos"] if r["horas"][pr["id"]][i] > 0]
        chips = "".join(f'<i title="{esc(p["nombre"])}" style="background:{p["color"]}"></i>' for p in activos)
        esp = "".join(f"<li>{esc(llenar(x, T))}</li>" for x in m["esperamos"])
        filas.append(f"""<tr><td class="mm-mes"><b>{mes_txt(m['mes'])}</b><div class="mm-foco">{esc(m['foco'])}</div>
<div class="mm-chips">{chips}</div></td>
<td>{lista(m['hacemos'], 'apretada')}</td><td><ul class="apretada">{esp}</ul></td>
<td class="num"><b>{f"{h:.1f}".replace(".", ",")}</b></td><td class="num">{_num(r['total']['media'][i])}</td></tr>""")
    return ('<table class="tabla mm"><thead><tr><th style="width:17%">Mes y foco</th><th style="width:42%">Qué hacemos</th>'
            '<th style="width:27%">Qué esperamos</th><th class="num">h/sem</th><th class="num">USD/mes esperado</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>'
            '<p class="nota">Los puntos de color muestran qué proyectos tienen horas ese mes. «USD/mes esperado»: ingreso neto del holding ese mes '
            '(promedio de la simulación, ya descontados Claude, empresa y herramientas).</p>')


def bloque_trimestres(T) -> str:
    r = T["r"]
    filas = []
    for q in T["extra"]["plan_mensual"]["trimestres"]:
        i = H.idx(q["fin"])
        filas.append(f"""<tr><td class="c-n">{esc(q['t'])}</td><td>{lista(q['hacemos'], 'apretada')}</td><td>{esc(llenar(q['esperamos'], T))}</td>
<td class="num">{_num(r['total']['p50'][i])}</td><td class="num">{_num(r['total']['p10'][i])} a {_num(r['total']['p90'][i])}</td></tr>""")
    return ('<table class="tabla mm"><thead><tr><th style="width:11%">Trimestre</th><th style="width:47%">Qué hacemos</th>'
            '<th style="width:22%">Qué esperamos</th><th class="num">Mediana</th><th class="num">Rango probable</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>'
            '<p class="nota">Mediana y rango probable (8 de cada 10 futuros) del ingreso neto del holding en el último mes del trimestre, USD/mes.</p>')


def bloque_hitos(T) -> str:
    r = T["r"]
    filas = []
    for k, x in enumerate(T["datos"]["holding"]["hitos"], 1):
        i = H.idx(x["cuando"])
        filas.append(f'<tr><td class="c-n">{k}</td><td><b>{mes_largo(x["cuando"]).capitalize()}</b></td><td>{esc(x["que"])}</td>'
                     f'<td class="num">{_num(r["total"]["media"][i])}</td></tr>')
    return ('<table class="tabla hitos"><thead><tr><th>#</th><th>Cuándo</th><th>Qué se decide</th><th class="num">USD/mes esperado ese mes</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>')


# ─────────────────────────────────────────────── tablas del caso de negocio ───────────────────────────────────────────────
def _cab_anios(primera: str) -> str:
    return f'<thead><tr><th>{primera}</th>' + "".join(f'<th class="num">{ANIO_ETQ[a]}</th>' for a in ANIOS) + "</tr></thead>"


def _fila_proy(p, vals, extra="") -> str:
    return (f'<tr><td><span class="dot" style="background:{p["color"]}"></span><b>{esc(p["nombre"])}</b> <small>{esc(p["nombre_trabajo"])}</small>{extra}</td>'
            + "".join(f'<td class="num">{_num(vals[a])}</td>' for a in ANIOS) + "</tr>")


def tabla_esperado(T) -> str:
    r = T["r"]
    filas = [_fila_proy(pr["p"], pr["esp_anual"]) for pr in r["proyectos"]]
    fijos = {a: -float(np.mean(r["fijos"][H.meses_del_anio(a)])) for a in ANIOS}
    filas.append('<tr class="sub"><td>Costos fijos del holding <small>(Claude, empresa y contador, herramientas, cuenta de Apple)</small></td>'
                 + "".join(f'<td class="num">{_num(fijos[a])}</td>' for a in ANIOS) + "</tr>")
    ta = r["total_anual"]["media"]
    filas.append('<tr class="tot"><td>Total del holding · proyectos principales</td>' + "".join(f'<td class="num">{_num(ta[a])}</td>' for a in ANIOS) + "</tr>")
    sec = r.get("sec_esp_anual", {a: 0 for a in ANIOS})
    filas.append('<tr><td>Secundarios del backlog <small>(7 ideas, de a una desde sep-2028)</small></td>'
                 + "".join(f'<td class="num">{_num(sec[a])}</td>' for a in ANIOS) + "</tr>")
    filas.append('<tr class="tot esp"><td>Total del holding · principales + secundarios</td>'
                 + "".join(f'<td class="num">{_num(ta[a] + sec[a])}</td>' for a in ANIOS) + "</tr>")
    acum = sum(ta[a] * len(H.meses_del_anio(a)) for a in ANIOS)
    acum2 = acum + sum(sec[a] * len(H.meses_del_anio(a)) for a in ANIOS)
    return (f'<table class="tabla anual">{_cab_anios("USD por mes, promedio del año")}<tbody>{"".join(filas)}</tbody></table>'
            f'<p class="nota">Suma de los 60 meses (oct-2026 a sep-2031): <b>{_usd(acum)}</b> con los principales y <b>{_usd(acum2)}</b> con los secundarios, '
            'sin contar tu aporte mensual ni el capital acumulado en la renta. En Cimiento (renta) se muestra el interés del mes.</p>')


def tabla_normal(T) -> str:
    r = T["r"]
    filas = []
    for pr in r["proyectos"]:
        extra = f' <span class="pill v-pau">{pr["chances"]*100:.0f}%</span>'
        filas.append(_fila_proy(pr["p"], pr["norm_anual"], extra))
    return (f'<table class="tabla anual">{_cab_anios("USD por mes si funciona · chances")}<tbody>{"".join(filas)}</tbody></table>'
            '<p class="nota">En la fábrica y los juegos, «si funciona» es lo que dejan los productos cuando al menos uno pega (promedio condicionado). '
            'En Cimiento, el interés mediano del mes. En Adopción, la app comprada una vez pagada.</p>')


def tabla_rango(T) -> str:
    r = T["r"]
    sim = r["sim"]
    fechas = ["2026-12", "2027-12", "2028-12", "2029-12", "2030-12", "2031-09"]
    t = r["total"]
    sec = r.get("sec_esperado", np.zeros(H.N_MESES))
    filas = [
        ("Peor caso razonable (1 de cada 10 queda abajo)", [t["p10"][H.idx(f)] for f in fechas], ""),
        ("Mediana (la mitad queda arriba)", [t["p50"][H.idx(f)] for f in fechas], "sub"),
        ("Promedio esperado", [t["media"][H.idx(f)] for f in fechas], ""),
        ("Muy bueno (1 de cada 10 queda arriba)", [t["p90"][H.idx(f)] for f in fechas], ""),
        ("Promedio con secundarios", [t["media"][H.idx(f)] + sec[H.idx(f)] for f in fechas], ""),
    ]
    html_f = []
    for tit, vals, cl in filas:
        html_f.append(f'<tr class="{cl}"><td>{tit}</td>' + "".join(f'<td class="num">{_num(v)}</td>' for v in vals) + "</tr>")
    cubre = [float((sim["total_proy"][:, H.idx(f)] >= sim["fijos_path"][:, H.idx(f)]).mean()) for f in fechas]
    html_f.append('<tr><td>Chances de que los proyectos ya paguen los costos fijos</td>' + "".join(f'<td class="num">{c*100:.0f}%</td>' for c in cubre) + "</tr>")
    capm = [float(np.median(sim["capital"][:, H.idx(f)])) for f in fechas]
    html_f.append('<tr class="tot"><td>Capital en la renta (mediana, USD)</td>' + "".join(f'<td class="num">{_u(c)}</td>' for c in capm) + "</tr>")
    cab = "".join(f'<th class="num">{mes_txt(f)}</th>' for f in fechas)
    return (f'<table class="tabla anual"><thead><tr><th>Ingreso neto del holding en ese mes (USD/mes)</th>{cab}</tr></thead>'
            f'<tbody>{"".join(html_f)}</tbody></table>')


def tabla_secundarios(T) -> str:
    r = T["r"]
    back = {i["id"]: i for i in T["datos"]["backlog"]["items"]}
    filas = []
    for s in r["secundarios"]:
        b = back.get(s["id"], {})
        filas.append(f'<tr><td class="c-id">{s["id"]}</td><td><b>{esc(s["nombre"])}</b><br><small>con {esc(destino_txt(T, b.get("destino", "")))}</small></td>'
                     f'<td>{mes_txt(s["desde"])}</td><td class="num">{s["p"]*100:.0f}%</td>'
                     + "".join(f'<td class="num">{_num(s["esperado"][a])}</td>' for a in (2029, 2030, 2031))
                     + f'<td class="num">{_num(s["normal"][2031])}</td></tr>')
    sec = r.get("sec_esp_anual", {})
    filas.append('<tr class="tot"><td colspan="4">Los 7 juntos (esperado, simulación)</td>'
                 + "".join(f'<td class="num">{_num(sec.get(a, 0))}</td>' for a in (2029, 2030, 2031)) + '<td></td></tr>')
    return ('<table class="tabla"><thead><tr><th>ID</th><th>Secundario</th><th>Desde</th><th class="num">Chances</th>'
            '<th class="num">Esperado 2029</th><th class="num">2030</th><th class="num">2031</th><th class="num">Si funciona 2031</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>'
            '<p class="nota">USD por mes, promedio del año. Los números de cada secundario salen del catálogo (inversión, horas, chances e '
            'ingreso si funciona a 6, 12 y 36 meses).</p>')


# ─────────────────────────────────────────────── backlog, pausa y trampas, Estado ───────────────────────────────────────────────
def bloque_backlog(T) -> str:
    items = sorted(T["datos"]["backlog"]["items"], key=lambda i: i["prioridad"])
    por = T["por_cat"]
    grupos = [
        ("Secundarios: entran en el plan cuando se liberan horas", lambda i: i.get("secundario")),
        ("Se funden con un proyecto vivo", lambda i: not i.get("secundario") and i["destino"] in T["pr"]),
        ("Proyectos propios, más adelante", lambda i: not i.get("secundario") and i["destino"] == "propio"),
        ("Canales extra (salen casi solos de lo que ya hacemos)", lambda i: not i.get("secundario") and i["destino"] == "canal"),
        ("En pausa hasta que cambie algo", lambda i: not i.get("secundario") and i["destino"] == "pausa"),
    ]
    filas = []
    usados = set()
    for tit, cond in grupos:
        sel = [i for i in items if cond(i) and i["id"] not in usados]
        if not sel:
            continue
        filas.append(f'<tr class="grupo"><td colspan="5">{tit} <small>({len(sel)})</small></td></tr>')
        for i in sel:
            usados.add(i["id"])
            a = por.get(i["id"], {})
            fam = T["cat"]["familias"].get(a.get("familia", ""), {})
            dest = T["pr"].get(i["destino"])
            con = (f'<span class="dot" style="background:{dest["p"]["color"]}"></span>{esc(dest["p"]["nombre"])}' if dest
                   else esc(destino_txt(T, i["destino"])))
            filas.append(f"""<tr><td class="c-n">{i['prioridad']}</td>
<td><b>{esc(i['nombre'])}</b><br><span class="fam" style="--fc:{fam.get('color', '#c3c2b7')}">{i['id']} · {esc(fam.get('nombre', ''))}</span></td>
<td>{esc(i['viable'])}</td><td>{con}<br><small>desde {mes_txt(i['desde'])}</small></td><td>{esc(i['activa'])}</td></tr>""")
    return ('<table class="tabla back"><thead><tr><th>#</th><th style="width:19%">Idea</th><th style="width:43%">Versión viable</th>'
            '<th style="width:12%">Va con</th><th>Se activa si</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>')


def bloque_pausa_trampas(T) -> str:
    por = T["por_cat"]
    filas = []
    for fam, tit in (("trampa", "Trampas conocidas"), ("pausa", "Requieren salir a vender (en pausa)")):
        filas.append(f'<tr class="grupo"><td colspan="3">{tit}</td></tr>')
        for a in T["cat"]["alternativas"]:
            if a["familia"] != fam:
                continue
            partes = []
            if a.get("en_su_lugar") and a["en_su_lugar"] in por:
                o = por[a["en_su_lugar"]]
                partes.append(f'<b>En su lugar:</b> {esc(a.get("mejor_version", o["corto"]))}')
            elif a.get("mejor_version"):
                partes.append(f'<b>En su lugar:</b> {esc(a["mejor_version"])}')
            if a.get("revive"):
                partes.append(f'<b>Se reactiva si:</b> {esc(a["revive"])}')
            filas.append(f'<tr><td><b>{esc(a["nombre"])}</b></td><td>{esc(a.get("por_que", ""))}</td><td>{"<br>".join(partes)}</td></tr>')
    return ('<table class="tabla back"><thead><tr><th style="width:24%">Idea</th><th style="width:40%">Por qué no (hoy)</th>'
            '<th>Qué hacer en su lugar o qué la reactivaría</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>')


def bloque_estado(T) -> str:
    cards = []
    for a in T["cat"]["alternativas"]:
        if a["familia"] != "estado":
            continue
        dest = T["pr"].get(a.get("proyecto", ""))
        donde = f'Va en <b>{esc(dest["p"]["nombre"])}</b>' if dest else ""
        numeros = ""
        if a.get("p_exito") is not None and a.get("si_sale"):
            ss = a["si_sale"]
            numeros = (f'<div class="mini"><span>Chances <b>{a["p_exito"]*100:.0f}%</b></span>'
                       f'<span>Si funciona, a 3 años: <b>{_usd(ss["m36"][1])}</b>/mes</span>'
                       f'<span>Horas: <b>{a.get("horas_arranque", "?")} → {a.get("horas_regimen", "?")}</b> h/sem</span></div>')
        mejor = f'<p class="cq"><b>Mejor versión:</b> {esc(a["mejor_version"])}</p>' if a.get("mejor_version") else ""
        revive = f'<p class="cq"><b>Se reactiva si:</b> {esc(a["revive"])}</p>' if a.get("revive") else ""
        cards.append(f"""<div class="cc" style="--fc:#8a5a2b"><div class="cc-cab"><span class="cc-id">{a['id']}</span>{pill(a['veredicto'])}</div>
<div class="cc-tit">{esc(a['nombre'])}</div><p>{esc(a.get('que_es', ''))}</p><p class="cq"><b>Por qué:</b> {esc(a.get('por_que', ''))}</p>
{mejor}{revive}{numeros}<p class="mv">{donde}</p></div>""")
    return f'<div class="grid-cc">{"".join(cards)}</div>'


def bloque_recordatorios(T) -> str:
    filas = []
    for pr in T["r"]["proyectos"]:
        p = pr["p"]
        for rec in p.get("recordatorios", []):
            filas.append(f'<tr><td><span class="dot" style="background:{p["color"]}"></span><b>{esc(p["nombre"])}</b></td><td>{esc(rec)}</td></tr>')
    return ('<table class="tabla"><thead><tr><th style="width:18%">Proyecto</th><th>Qué y cuándo</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>')


def bloque_supuestos(T) -> str:
    out = []
    for pr in T["r"]["proyectos"]:
        p = pr["p"]
        c = p.get("caso", {})
        sup = list(c.get("supuestos", []))
        for prod in p.get("productos", []):
            sup += [f'{prod["nombre"]}: {s}' for s in prod.get("supuestos", [])]
        cab = []
        if c.get("lanzamiento"):
            cab.append(f"lanza {mes_txt(c['lanzamiento'])}")
        if c.get("p_exito") is not None and pr["tipo"] != "cartera":
            cab.append(f"chances {c['p_exito']*100:.0f}% ({esc(c.get('exito_es', ''))})")
        if c.get("si_no", {}).get("corte"):
            cab.append(f"si no funciona se corta en {mes_txt(c['si_no']['corte'])}")
        if c.get("malo") is not None:
            cab.append(f"escenario malo ×{c['malo']:.2f} y bueno ×{c['bueno']:.1f} del normal".replace(".", ","))
        out.append(f'<div class="sup-b"><h4><span class="dot" style="background:{p["color"]}"></span>{esc(p["nombre"])} · {esc(p["nombre_trabajo"])}</h4>'
                   f'<p class="nota">{" · ".join(cab)}</p>{lista(sup) if sup else "<p class=nota>Sin supuestos adicionales (ver la ficha).</p>"}</div>')
    return "".join(out)


# ─────────────────────────────────────────────── armado del HTML ───────────────────────────────────────────────
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


def construir_html(T, incrustar: bool = False, paginas: dict | None = None) -> str:
    v = valores(T)
    bloques = {
        "{{RESUMEN}}": lambda: bloque_resumen(T, v),
        "{{PEDIDO}}": lambda: bloque_pedido(T),
        "{{MATRIZ}}": lambda: bloque_matriz(T),
        "{{IDEAS_NUEVAS}}": lambda: bloque_ideas_nuevas(T),
        "{{CATALOGO_DIFUSION}}": lambda: bloque_difusion(T),
        "{{MAPA_PROYECTOS}}": lambda: bloque_mapa(T),
        "{{ESTADO}}": lambda: bloque_estado(T),
        "{{GANTT_A3}}": lambda: gantt_a3(T),
        "{{MES_A_MES}}": lambda: bloque_mes_a_mes(T),
        "{{TRIMESTRES}}": lambda: bloque_trimestres(T),
        "{{HITOS}}": lambda: bloque_hitos(T),
        "{{TABLA_ESPERADO}}": lambda: tabla_esperado(T),
        "{{TABLA_NORMAL}}": lambda: tabla_normal(T),
        "{{TABLA_RANGO}}": lambda: tabla_rango(T),
        "{{TABLA_SECUNDARIOS}}": lambda: tabla_secundarios(T),
        "{{BACKLOG}}": lambda: bloque_backlog(T),
        "{{PAUSA_TRAMPAS}}": lambda: bloque_pausa_trampas(T),
        "{{RECORDATORIOS}}": lambda: bloque_recordatorios(T),
        "{{SUPUESTOS}}": lambda: bloque_supuestos(T),
    }
    md = markdown.Markdown(extensions=["tables", "sane_lists", "md_in_html"])
    cuerpo, indice = [], []
    n = 0
    caps, k_ = {}, 0
    for ruta in sorted(CAPITULOS.glob("*.md")):
        pref = ruta.name[:2]
        if pref.startswith("9"):
            caps[pref] = "A"
            continue
        k_ += 1
        caps[pref] = str(k_)
        if pref == "06":
            for pr in T["r"]["proyectos"]:
                k_ += 1
                caps[pr["id"]] = str(k_)

    def agregar_capitulo(h: str, clase: str, es_anexo: bool = False, color: str = ""):
        nonlocal n
        for t in re.findall(r"<h1>(.*?)</h1>", h):
            if not es_anexo:
                n += 1
                indice.append((str(n), t, color))
                h = h.replace(f"<h1>{t}</h1>", f'<h1><span class="num"{f" style=background:{color}" if color else ""}>{n}</span>{t}</h1>', 1)
            else:
                indice.append(("A", t, ""))
        cuerpo.append(f'<section class="{clase}">{h}</section>')

    for ruta in sorted(CAPITULOS.glob("*.md")):
        texto = ruta.read_text(encoding="utf-8")
        for k, val in v.items():
            texto = texto.replace("{{v:" + k + "}}", val)
        marcadores = {}
        for i, (k, fn) in enumerate(bloques.items()):
            if k in texto:
                token = f"BLOQUE{i}XYZ"
                texto = texto.replace(k, token)
                marcadores[token] = fn()
        faltan = [x for x in re.findall(r"\{\{[^}]+\}\}", texto) if not x.startswith("{{cap:")]
        if faltan:
            raise SystemExit(f"{ruta.name}: marcadores sin reemplazar {faltan}")
        h = md.reset().convert(texto)
        for token, val in marcadores.items():
            h = h.replace(f"<p>{token}</p>", val).replace(token, val)
        agregar_capitulo(h, "anexo" if ruta.name.startswith("9") else "capitulo", es_anexo=ruta.name.startswith("9"))
        if ruta.name.startswith("06"):
            for pr in T["r"]["proyectos"]:
                titulo, cuerpo_p = ficha_proyecto(T, pr)
                agregar_capitulo(f"<h1>{esc(titulo)}</h1>{cuerpo_p}", "capitulo", color=pr["p"]["color"])
    paginas = paginas or {}
    items = []
    for k, t, color in indice:
        dot = f'<span class="dot" style="background:{color}"></span>' if color else ""
        items.append(f'<li class="{"sub" if color else ""}"><span class="in">{k}</span><span class="it">{dot}{t}</span><span class="dots"></span>'
                     f'<span class="pag">{paginas.get(t, "")}</span></li>')
    doc = f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(TITULO)}</title>
<style>{fuentes_css(incrustar)}\n{css()}</style></head><body>
{portada(T, v)}
<section class="indice"><h2>Contenido</h2><ol>{"".join(items)}</ol>
<div class="como-leer"><b>Cómo leer esto.</b> En 10 minutos: el capítulo 1 (el holding en una hoja), el 2 (qué cambió y qué decidimos)
y la hoja grande del plan (capítulo {{cap:17}}). Cada proyecto tiene su ficha completa (capítulos {{cap:P1}} a {{cap:P9}}): qué es, nombres, alcance,
versiones, difusión sin costo y sin cara, roadmap a 2030 y caso de negocio a 5 años. El resto es para consultar: lo que funciona hoy,
las 40 formas de difusión, el campo Municipio y Estado, patentes y marcas, cuánta plata año por año y el backlog con todas las demás ideas.
<br><br><b>Colores de los roadmaps:</b> <span style="color:{S1};font-weight:700">Claude</span>,
<span style="color:{S2};font-weight:700">vos</span>, <span style="color:{S3};font-weight:700">juntos</span>.
<b>Glosario:</b> <i>esperado</i> = promedio con las chances de que funcione o no; <i>si funciona</i> = escenario normal cuando funciona;
<i>mediana</i> = la mitad de los futuros simulados queda arriba; <i>regla de corte</i> = la condición, escrita antes, para dejar algo.</div>
</section>
{''.join(cuerpo)}
</body></html>"""
    doc = re.sub(r"\{\{cap:(\w+)\}\}", lambda m: caps[m.group(1)], doc)
    if "{{" in doc:
        raise SystemExit("quedaron marcadores sin reemplazar: " + ", ".join(sorted(set(re.findall(r"\{\{[^}]*\}\}", doc)))))
    return doc


def paginas_capitulos(T, pdf: Path) -> dict:
    """Busca en el PDF impreso en qué página empieza cada capítulo (para el índice)."""
    import pymupdf
    doc = pymupdf.open(str(pdf))
    textos = [re.sub(r"\s+", " ", doc[i].get_text()) for i in range(doc.page_count)]
    html_idx = construir_html(T, incrustar=False)
    res = {}
    desde = 2
    for t in re.findall(r'<span class="it">(?:<span class="dot"[^>]*></span>)?(.*?)</span><span class="dots">', html_idx):
        limpio = html.unescape(re.sub(r"<.*?>", "", t)).strip()
        clave = re.sub(r"\s+", " ", limpio)[:34]
        for i in range(desde, len(textos)):
            if clave in textos[i][:320]:
                res[t] = i + 1
                desde = i
                break
        else:
            print("  (índice) no encontré la página de:", limpio)
    return res


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
    T = cargar_todo()
    if not args.sin_graficos:
        graficos(T)
    SALIDA_HTML.write_text(construir_html(T, incrustar=False), encoding="utf-8")
    print("HTML de trabajo:", SALIDA_HTML)
    if args.solo_html:
        return 0
    env = dict(os.environ)
    env.setdefault("NODE_PATH", "/opt/node22/lib/node_modules")

    def imprimir():
        subprocess.run(["node", str(RAIZ / "informes" / "imprimir_pdf.cjs"), str(SALIDA_HTML), str(SALIDA_PDF), "El holding · Informe 3 v3", "css"],
                       check=True, env=env)
    imprimir()
    paginas = paginas_capitulos(T, SALIDA_PDF)
    SALIDA_HTML.write_text(construir_html(T, incrustar=False, paginas=paginas), encoding="utf-8")
    imprimir()
    SALIDA_HTML_AUTO.write_text(autocontenido(construir_html(T, incrustar=True, paginas=paginas)), encoding="utf-8")
    print("HTML autocontenido:", SALIDA_HTML_AUTO)
    return 0


if __name__ == "__main__":
    sys.exit(main())
