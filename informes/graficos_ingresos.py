#!/usr/bin/env python3
"""Gráficos del informe "Ingresos sin salir a vender" (SVG + PNG) en informes/fuente-ingresos/graficos/.

Lee los modelos y la simulación del plan para que el informe se regenere sin editar a mano.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import yaml

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "herramientas"))

import escenarios  # noqa: E402
import estilo_graficos as eg  # noqa: E402
import plan_sin_venta  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.ticker import FuncFormatter  # noqa: E402

SALIDA = RAIZ / "informes" / "fuente-ingresos" / "graficos"
MODELOS = RAIZ / "herramientas" / "modelos"


def guardar(fig, nombre):
    SALIDA.mkdir(parents=True, exist_ok=True)
    fig.savefig(SALIDA / f"{nombre}.svg", metadata={"Date": None})
    fig.savefig(SALIDA / f"{nombre}.png", dpi=170)
    plt.close(fig)


def muestras(ruta: Path, n: int = 20000, semilla: int = 42) -> dict:
    """Muestrea un modelo y devuelve todas las variables (supuestos y cálculos) como arreglos."""
    m = escenarios.cargar_modelo(ruta)
    rng = np.random.default_rng(semilla)
    mu = {k: escenarios._muestrear(v, n, rng) for k, v in m["supuestos"].items()}
    r = escenarios.evaluar(m, mu)
    return {k: np.broadcast_to(v, (n,)) for k, v in r.items() if isinstance(v, np.ndarray)}


def rendimiento_anual():
    """Rendimiento anual sobre el capital: opciones vs trampas, P10–P90 con mediana y media."""
    cfg = yaml.safe_load((RAIZ / "cartera" / "plan-sin-venta.yaml").read_text(encoding="utf-8"))
    rng = np.random.default_rng(3)
    n = 20000
    t = cfg["tesoreria"]
    tasa = rng.triangular(*t["tasa_anual"], n) * 100
    golpe = (rng.random(n) < t["shock"]["prob"]) * rng.triangular(*t["shock"]["perdida"], n) * 100 / 5
    tesoreria = tasa - golpe

    adq = muestras(MODELOS / "op08b-microadquisicion-chica.yaml")["retorno_anual_pct"]
    motos = muestras(MODELOS / "op13-motos-operador.yaml")["retorno_anual_pct"]
    g = muestras(MODELOS / "descartes" / "k20-alquiler-gpu-casa.yaml")
    gpu = g["margen"] * 12 / g["precio_equipo"] * 100
    b = muestras(MODELOS / "descartes" / "k19-mineria-btc-casa.yaml")
    mineria = b["margen"] * 12 / b["precio_equipo"] * 100

    filas = [
        ("Motor de renta en USD (OP-09)", tesoreria, "opcion"),
        ("Micro-negocio digital que ya vende (OP-08)", adq, "opcion"),
        ("Motos con operador (OP-13)", motos, "opcion"),
        ("Alquilar una GPU desde casa (K20)", gpu, "trampa"),
        ("Minería de bitcoin en casa (K19)", mineria, "trampa"),
    ][::-1]
    xmin, xmax = -60, 60
    fig, ax = plt.subplots(figsize=(9, 3.9))
    for i, (nombre, v, tipo) in enumerate(filas):
        color = eg.SERIES[0] if tipo == "opcion" else eg.SERIES[1]
        p10, p50, p90 = np.percentile(v, [10, 50, 90])
        media = float(np.mean(v))
        lo, hi = max(p10, xmin), min(p90, xmax)
        if hi > xmin:
            ax.plot([lo, hi], [i, i], color=color, linewidth=6, alpha=0.35, solid_capstyle="butt")
        if p50 >= xmin:
            ax.plot([p50], [i], "o", color=color, markersize=8, zorder=3)
            ax.plot([media], [i], "D", color=eg.TINTA, markersize=4.5, zorder=4)
            etiqueta = f"P50 {p50:.0f}%  ·  media {media:.0f}%"
            ax.text(min(hi, xmax) + 1.5, i, etiqueta, va="center", fontsize=7.8, color=eg.TINTA_2)
        else:
            ax.annotate("", xy=(xmin + 0.5, i), xytext=(xmin + 9, i),
                        arrowprops=dict(arrowstyle="->", color=color, lw=1.8))
            ax.text(xmin + 10, i, f"P50 {p50:.0f}% por año (fuera de escala): pierde antes de pagar el equipo",
                    va="center", fontsize=7.8, color=eg.TINTA_2)
    ax.axvline(0, color=eg.EJE, linewidth=1)
    ref = float(np.median(tesoreria))
    ax.axvline(ref, color=eg.TINTA_MUTED, linewidth=1, linestyle=(0, (3, 3)))
    ax.text(ref + 0.8, len(filas) - 0.45, "vara: renta", color=eg.TINTA_2, fontsize=7.5, va="bottom")
    ax.set_yticks(range(len(filas)))
    ax.set_yticklabels([f[0] for f in filas], fontsize=8.3)
    ax.set_xlim(xmin, xmax + 32)
    ax.set_ylim(-0.6, len(filas) - 0.2)
    ax.set_xticks(range(-60, 61, 20))
    ax.xaxis.set_major_formatter(FuncFormatter(lambda x, _: f"{x:.0f}%"))
    ax.grid(axis="y", visible=False)
    ax.set_xlabel("Rendimiento anual sobre el capital (barra: P10–P90; círculo: mediana; rombo: media)")
    ax.set_title("Con el mismo dólar: qué rinde cada opción que pide capital")
    ax.plot([], [], color=eg.SERIES[0], linewidth=6, alpha=0.35, label="Opciones del ranking")
    ax.plot([], [], color=eg.SERIES[1], linewidth=6, alpha=0.35, label="Trampas")
    ax.legend(loc="upper right", ncol=1)
    fig.tight_layout()
    guardar(fig, "rendimiento_anual")


def plan():
    cfg = yaml.safe_load((RAIZ / "cartera" / "plan-sin-venta.yaml").read_text(encoding="utf-8"))
    SALIDA.mkdir(parents=True, exist_ok=True)
    plan_sin_venta.grafico(cfg, SALIDA / "plan.png")


def escenarios_modelos():
    for stem in ("op12-fabrica-herramientas", "op08b-microadquisicion-chica", "op13-motos-operador", "op14-app-suscripcion"):
        m = escenarios.cargar_modelo(MODELOS / f"{stem}.yaml")
        r = escenarios.correr(m)
        SALIDA.mkdir(parents=True, exist_ok=True)
        escenarios.grafico(m, r, SALIDA / f"esc_{stem}.png")


def main():
    eg.aplicar()
    rendimiento_anual()
    plan()
    escenarios_modelos()
    print("Gráficos en", SALIDA)


if __name__ == "__main__":
    main()
