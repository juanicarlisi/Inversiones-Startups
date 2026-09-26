"""Estilo común de gráficos (paleta validada para impresión en fondo claro).

Paleta categórica en orden fijo (validada con el validador del skill dataviz: 3 slots pasan todos los pares;
4 slots pasan pares adyacentes). Slots 3 y 4 tienen contraste < 3:1 → siempre acompañar con etiquetas o tabla.
"""
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

SUPERFICIE = "#fcfcfb"
TINTA = "#0b0b0b"
TINTA_2 = "#52514e"
TINTA_MUTED = "#898781"
GRILLA = "#e1e0d9"
EJE = "#c3c2b7"
SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"]


def aplicar():
    plt.rcParams.update({
        "figure.facecolor": SUPERFICIE,
        "axes.facecolor": SUPERFICIE,
        "savefig.facecolor": SUPERFICIE,
        "font.family": "DejaVu Sans",
        "font.size": 9,
        "axes.edgecolor": EJE,
        "axes.labelcolor": TINTA_2,
        "axes.titlecolor": TINTA,
        "axes.titlesize": 10,
        "axes.titleweight": "bold",
        "axes.titlelocation": "left",
        "xtick.color": TINTA_MUTED,
        "ytick.color": TINTA_MUTED,
        "xtick.labelcolor": TINTA_2,
        "ytick.labelcolor": TINTA_2,
        "axes.grid": True,
        "grid.color": GRILLA,
        "grid.linewidth": 0.8,
        "grid.linestyle": "-",
        "axes.axisbelow": True,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "legend.frameon": False,
        "legend.fontsize": 8,
        "lines.linewidth": 2,
        "lines.solid_capstyle": "round",
    })


def usd(x, _=None):
    if abs(x) >= 1000:
        return f"{x/1000:,.0f}k".replace(",", ".") if abs(x) >= 10000 else f"{x/1000:,.1f}k".replace(".", ",")
    return f"{x:,.0f}".replace(",", ".")
