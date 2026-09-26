#!/usr/bin/env python3
"""Genera los gráficos del informe (SVG + PNG) en informes/fuente/graficos/.

Lee los datos vivos del repositorio (fichas, modelos, proyección) para que el informe se regenere sin editar a mano.
"""
from __future__ import annotations

import datetime as dt
import sys
from pathlib import Path

import numpy as np
import yaml

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "herramientas"))

import cartera as cartera_mod  # noqa: E402
import escenarios  # noqa: E402
import estilo_graficos as eg  # noqa: E402
import oportunidades  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.ticker import FuncFormatter  # noqa: E402

SALIDA = RAIZ / "informes" / "fuente" / "graficos"


def guardar(fig, nombre):
    SALIDA.mkdir(parents=True, exist_ok=True)
    fig.savefig(SALIDA / f"{nombre}.svg")
    fig.savefig(SALIDA / f"{nombre}.png", dpi=170)
    plt.close(fig)


# ------------------------------------------------------------------ mapa de oportunidades
def mapa_oportunidades():
    ops = [o for o in oportunidades.cargar() if not o["_errores"]]
    grupos = {
        "Validar ahora": ("validar",),
        "Explorar / en espera": ("explorar",),
        "Radar e inversión": ("radar", "inversion"),
    }
    fig, ax = plt.subplots(figsize=(9, 5.2))
    for (nombre, estados), color in zip(grupos.items(), eg.SERIES[:3]):
        sel = [o for o in ops if o["estado"] in estados]
        if not sel:
            continue
        x = [o["_puntaje"] for o in sel]
        y = [o["_ivr"] for o in sel]
        s = [40 + 9 * np.sqrt(float(o["capital"]["optimo_usd"])) for o in sel]
        ax.scatter(x, y, s=s, color=color, alpha=0.85, edgecolor=eg.SUPERFICIE, linewidth=2, label=nombre, zorder=3)
        for o, xi, yi in zip(sel, x, y):
            ax.annotate(o["id"], (xi, yi), xytext=(7, 5), textcoords="offset points", fontsize=8, color=eg.TINTA)
    ax.axhline(1.0, color=eg.TINTA_MUTED, linewidth=1)
    ax.text(47.5, 1.03, "IVR = 1 (vara de unidades operativas)", color=eg.TINTA_2, fontsize=7.5, va="bottom")
    tes = next((o for o in ops if o["id"] == "OP-09"), None)
    if tes:
        ax.axhline(tes["_ivr"], color=eg.GRILLA, linewidth=1)
        ax.text(47.5, tes["_ivr"] + 0.03, "piso: tesorería en USD", color=eg.TINTA_MUTED, fontsize=7.5, va="bottom")
    ax.axvline(55, color=eg.GRILLA, linewidth=1)
    ax.set_xlim(47, 82)
    ax.set_ylim(-0.1, 2.6)
    ax.set_xlabel("Puntaje del scorecard (0–100)")
    ax.set_ylabel("IVR: valor neto esperado / recurso")
    ax.set_title("Mapa de oportunidades (tamaño del círculo = capital óptimo)")
    from matplotlib.lines import Line2D
    handles = [Line2D([0], [0], marker="o", color="w", markerfacecolor=c, markersize=9, label=n)
               for n, c in zip(grupos.keys(), eg.SERIES[:3])]
    ax.legend(handles=handles, loc="upper left")
    fig.tight_layout()
    guardar(fig, "mapa_oportunidades")


# ------------------------------------------------------------------ rangos de flujo por oportunidad
def rangos_flujo():
    modelos = [
        ("op01-consorcios.yaml", "OP-01 Consorcios con IA"),
        ("op02-transporte.yaml", "OP-02 Oficina IA transportistas"),
        ("op03-maquinaria.yaml", "OP-03 Maquinaria usada"),
        ("op04-lab-logistico.yaml", "OP-04 Lab. logístico"),
        ("op07-radar-medio.yaml", "OP-07 Medio vertical"),
        ("op06-compre-local.yaml", "OP-06 Compre local minero"),
        ("op05-marca-matera-exportable.yaml", "OP-05 Marca matera exportable"),
        ("op08-microadquisicion.yaml", "OP-08 Micro-adquisición (USD 20k)"),
    ]
    filas = []
    for archivo, etiqueta in modelos:
        m = escenarios.cargar_modelo(RAIZ / "herramientas" / "modelos" / archivo)
        r = escenarios.correr(m)
        filas.append((etiqueta, r["percentiles"][10], r["percentiles"][50], r["percentiles"][90], r["media_inc"], m.get("exito")))
    filas = filas[::-1]
    fig, ax = plt.subplots(figsize=(9, 4.6))
    for i, (et, p10, p50, p90, media_inc, exito) in enumerate(filas):
        ax.plot([p10, p90], [i, i], color=eg.SERIES[0], linewidth=2, solid_capstyle="round", zorder=2)
        ax.scatter([p50], [i], s=55, color=eg.SERIES[0], edgecolor=eg.SUPERFICIE, linewidth=2, zorder=3,
                   label="Si funciona: P50 y rango P10–P90" if i == 0 else None)
        ax.scatter([media_inc], [i], s=55, marker="D", color=eg.SERIES[1], edgecolor=eg.SUPERFICIE, linewidth=2, zorder=4,
                   label="Valor esperado incluyendo el fracaso" if i == 0 else None)
        txt = f"éxito {exito*100:.0f}%" if exito is not None else "colapso 12%"
        ax.text(max(p90, media_inc) + 180, i, txt, fontsize=7.5, color=eg.TINTA_2, va="center")
    ax.set_yticks(range(len(filas)))
    ax.set_yticklabels([f[0] for f in filas], fontsize=8.5)
    ax.grid(axis="y", visible=False)
    ax.axvline(0, color=eg.EJE, linewidth=1)
    ax.xaxis.set_major_formatter(FuncFormatter(eg.usd))
    ax.set_xlabel("Flujo neto mensual en régimen (USD/mes)")
    ax.set_title("Flujo en régimen: rango si funciona vs valor esperado con el fracaso")
    ax.legend(loc="lower right")
    fig.tight_layout()
    guardar(fig, "rangos_flujo")


# ------------------------------------------------------------------ presupuesto mensual
def presupuesto():
    tramos = ["USD 400/mes", "USD 600/mes", "USD 1.000/mes"]
    partes = {
        "IA (Claude Max)": [100, 100, 200],
        "Otras herramientas": [20, 30, 50],
        "Experimentos": [180, 320, 550],
        "Tesorería": [100, 150, 200],
    }
    fig, ax = plt.subplots(figsize=(9, 2.8))
    izquierda = np.zeros(len(tramos))
    for (nombre, vals), color in zip(partes.items(), eg.SERIES[:4]):
        vals = np.array(vals, dtype=float)
        ax.barh(tramos, vals - 3, left=izquierda + 1.5, height=0.5, color=color, label=nombre)
        for y, (v, l) in enumerate(zip(vals, izquierda)):
            if v >= 60:
                ax.text(l + v / 2, y, f"{v:.0f}", ha="center", va="center", fontsize=8,
                        color="white" if color in (eg.SERIES[0], eg.SERIES[1]) else eg.TINTA)
        izquierda += vals
    ax.invert_yaxis()
    ax.set_xlim(0, 1040)
    ax.grid(axis="y", visible=False)
    ax.set_xlabel("USD por mes")
    ax.set_title("Asignación mensual de referencia por tramo de aporte (fase 0)")
    ax.legend(ncol=4, loc="upper center", bbox_to_anchor=(0.5, -0.32))
    fig.tight_layout()
    guardar(fig, "presupuesto")


# ------------------------------------------------------------------ ventanas temporales
def ventanas():
    D = dt.date
    eventos = [
        # (etiqueta, inicio, fin, tipo)
        ("FAL obligatorio (Ley 27.802)", D(2026, 11, 1), None, "Regulación"),
        ("EUDR: grandes/medianos → pymes", D(2026, 12, 30), D(2027, 6, 30), "Regulación"),
        ("Decreto 483/2026: líneas usadas (ventana)", D(2026, 6, 23), D(2027, 12, 10), "Regulación"),
        ("Exportación postal sin límite (Dec. 604/2026)", D(2026, 7, 17), D(2028, 12, 31), "Regulación"),
        ("Sandbox de tokenización CNV", D(2025, 6, 13), D(2027, 12, 31), "Regulación"),
        ("Baja de retenciones (Dec. 423/2026)", D(2026, 6, 3), D(2028, 12, 31), "Regulación"),
        ("San Juan: compre local 60% (Ley 2827-M)", D(2026, 7, 2), D(2030, 12, 31), "Regulación"),
        ("VMOS: exportaciones por Punta Colorada", D(2026, 12, 1), D(2030, 12, 31), "Proyecto"),
        ("GNL SESA: contrato con Alemania", D(2027, 12, 1), D(2030, 12, 31), "Proyecto"),
        ("Vicuña: construcción etapa 1", D(2027, 1, 1), D(2030, 12, 31), "Proyecto"),
        ("UE–Mercosur: desgravación (vino a 0 en año 8)", D(2026, 5, 1), D(2030, 12, 31), "Proyecto"),
        ("Elecciones presidenciales", D(2027, 10, 24), None, "Política"),
    ]
    colores = {"Regulación": eg.SERIES[0], "Proyecto": eg.SERIES[1], "Política": eg.SERIES[2]}
    fig, ax = plt.subplots(figsize=(9.5, 4.6))
    x0, x1 = D(2026, 1, 1), D(2030, 12, 31)
    for i, (et, ini, fin, tipo) in enumerate(eventos[::-1]):
        c = colores[tipo]
        ini_c = max(ini, x0)
        if fin:
            ax.barh(i, (fin - ini_c).days, left=ini_c, height=0.45, color=c, alpha=0.9)
        else:
            ax.scatter([ini], [i], s=70, marker="D", color=c, edgecolor=eg.SUPERFICIE, linewidth=2, zorder=3)
        ax.text(x0 - dt.timedelta(days=15), i, et, ha="right", va="center", fontsize=8, color=eg.TINTA)
    hoy = D(2026, 9, 26)
    ax.axvline(hoy, color=eg.TINTA, linewidth=1)
    ax.text(hoy, len(eventos) - 0.3, " hoy (26-09-2026)", fontsize=7.5, color=eg.TINTA_2, va="bottom")
    ax.set_yticks([])
    ax.set_xlim(x0, x1)
    ax.set_ylim(-0.8, len(eventos))
    ax.grid(axis="y", visible=False)
    import matplotlib.dates as mdates

    ax.xaxis.set_major_locator(mdates.YearLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
    from matplotlib.patches import Patch
    from matplotlib.lines import Line2D

    handles = [Patch(color=colores[k], label=k) for k in ("Regulación", "Proyecto")] + [
        Line2D([0], [0], marker="D", color="w", markerfacecolor=colores["Política"], markersize=8, label="Política"),
        Line2D([0], [0], marker="D", color="w", markerfacecolor=eg.TINTA_MUTED, markersize=8, label="◆ = fecha puntual")]
    ax.legend(handles=handles, loc="lower right")
    ax.set_title("Ventanas: qué abre y qué cierra, y cuándo")
    fig.subplots_adjust(left=0.36, right=0.98, top=0.92, bottom=0.08)
    guardar(fig, "ventanas")


# ------------------------------------------------------------------ proyección de cartera
def proyeccion():
    cfg = yaml.safe_load((RAIZ / "cartera" / "proyeccion.yaml").read_text(encoding="utf-8"))
    r = cartera_mod.proyectar(cfg)
    cartera_mod.grafico_proyeccion(cfg, r, SALIDA / "proyeccion.png")


def escenarios_clave():
    for archivo in ("op01-consorcios", "op02-transporte", "op03-maquinaria", "op04-lab-logistico",
                    "op05b-penetracion-mercadolibre", "op05-marca-matera-exportable"):
        m = escenarios.cargar_modelo(RAIZ / "herramientas" / "modelos" / f"{archivo}.yaml")
        r = escenarios.correr(m)
        escenarios.grafico(m, r, SALIDA / f"esc_{archivo}.png")


def main():
    eg.aplicar()
    mapa_oportunidades()
    rangos_flujo()
    presupuesto()
    ventanas()
    proyeccion()
    escenarios_clave()
    print("gráficos en", SALIDA)


if __name__ == "__main__":
    main()
