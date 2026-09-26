#!/usr/bin/env python3
"""Motor de escenarios y sensibilidad (Monte Carlo + tornado).

Lee un modelo YAML con supuestos inciertos (rango mínimo / más probable / máximo) y cálculos encadenados,
y responde las preguntas que importan para decidir capital:

  * ¿Cuál es el rango realista del resultado (P10 / P50 / P90)?
  * ¿Qué probabilidad hay de superar cada umbral relevante?
  * ¿Qué supuestos mueven más el resultado? (tornado: qué hay que validar primero)

Uso:
  python3 herramientas/escenarios.py herramientas/modelos/op01-consorcios.yaml
  python3 herramientas/escenarios.py MODELO.yaml --md salida.md --png grafico.png
  python3 herramientas/escenarios.py --todos            # corre todos los modelos y escribe herramientas/modelos/resultados/

Formato del modelo: ver herramientas/modelos/_plantilla.yaml
"""
from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import numpy as np
import yaml

RAIZ = Path(__file__).resolve().parent.parent
DIR_MODELOS = RAIZ / "herramientas" / "modelos"
DIR_RESULTADOS = DIR_MODELOS / "resultados"

FUNCIONES_PERMITIDAS = {
    "min": np.minimum,
    "max": np.maximum,
    "abs": np.abs,
    "sqrt": np.sqrt,
    "log": np.log,
    "exp": np.exp,
    "redondear": np.round,
    "pi": math.pi,
}
PERCENTILES = [5, 10, 25, 50, 75, 90, 95]


def cargar_modelo(ruta: Path) -> dict:
    with open(ruta, encoding="utf-8") as f:
        modelo = yaml.safe_load(f)
    for campo in ("id", "nombre", "supuestos", "calculos", "salida"):
        if campo not in modelo:
            raise ValueError(f"{ruta.name}: falta el campo obligatorio '{campo}'")
    return modelo


def _muestrear(spec, n: int, rng: np.random.Generator) -> np.ndarray:
    """Devuelve n muestras de un supuesto. Acepta número fijo o dict con tipo."""
    if isinstance(spec, (int, float)):
        return np.full(n, float(spec))
    tipo = spec.get("tipo", "triangular")
    if tipo == "fijo":
        return np.full(n, float(spec["valor"]))
    if tipo == "triangular":
        lo, modo, hi = float(spec["min"]), float(spec["modo"]), float(spec["max"])
        if not lo <= modo <= hi:
            raise ValueError(f"triangular inválida: min={lo} modo={modo} max={hi}")
        if lo == hi:
            return np.full(n, lo)
        return rng.triangular(lo, modo, hi, n)
    if tipo == "uniforme":
        return rng.uniform(float(spec["min"]), float(spec["max"]), n)
    if tipo == "bernoulli":
        return (rng.random(n) < float(spec["p"])).astype(float)
    raise ValueError(f"tipo de distribución desconocido: {tipo}")


def _valor_central(spec) -> float:
    if isinstance(spec, (int, float)):
        return float(spec)
    tipo = spec.get("tipo", "triangular")
    if tipo == "fijo":
        return float(spec["valor"])
    if tipo == "triangular":
        return float(spec["modo"])
    if tipo == "uniforme":
        return (float(spec["min"]) + float(spec["max"])) / 2
    if tipo == "bernoulli":
        return float(spec["p"])
    raise ValueError(tipo)


def _extremos(spec) -> tuple[float, float] | None:
    if isinstance(spec, (int, float)):
        return None
    tipo = spec.get("tipo", "triangular")
    if tipo in ("triangular", "uniforme"):
        return float(spec["min"]), float(spec["max"])
    if tipo == "bernoulli":
        return 0.0, 1.0
    return None


def evaluar(modelo: dict, valores: dict[str, np.ndarray]) -> dict[str, np.ndarray]:
    """Evalúa los cálculos en orden sobre los valores de los supuestos (vectorizado)."""
    entorno = dict(FUNCIONES_PERMITIDAS)
    entorno.update(valores)
    for nombre, expresion in modelo["calculos"].items():
        try:
            entorno[nombre] = np.asarray(eval(str(expresion), {"__builtins__": {}}, entorno), dtype=float)
        except Exception as exc:  # noqa: BLE001 - se re-lanza con contexto
            raise ValueError(f"error en el cálculo '{nombre}': {expresion} → {exc}") from exc
    return entorno


def correr(modelo: dict, iteraciones: int | None = None, semilla: int | None = None) -> dict:
    n = int(iteraciones or modelo.get("iteraciones", 20000))
    rng = np.random.default_rng(semilla if semilla is not None else modelo.get("semilla", 42))
    supuestos = modelo["supuestos"]
    salida = modelo["salida"]

    muestras = {k: _muestrear(v, n, rng) for k, v in supuestos.items()}
    resultado_mc = evaluar(modelo, muestras)
    y = np.broadcast_to(resultado_mc[salida], (n,))

    centrales = {k: np.array([_valor_central(v)]) for k, v in supuestos.items()}
    base = float(evaluar(modelo, centrales)[salida][0])

    tornado = []
    for k, spec in supuestos.items():
        ext = _extremos(spec)
        if ext is None:
            continue
        valores_bajo = dict(centrales)
        valores_alto = dict(centrales)
        valores_bajo[k] = np.array([ext[0]])
        valores_alto[k] = np.array([ext[1]])
        y_bajo = float(evaluar(modelo, valores_bajo)[salida][0])
        y_alto = float(evaluar(modelo, valores_alto)[salida][0])
        tornado.append({
            "supuesto": k,
            "desc": spec.get("desc", "") if isinstance(spec, dict) else "",
            "min": ext[0],
            "max": ext[1],
            "salida_con_min": y_bajo,
            "salida_con_max": y_alto,
            "rango": abs(y_alto - y_bajo),
        })
    tornado.sort(key=lambda t: t["rango"], reverse=True)

    # Probabilidad de tracción: los supuestos describen el régimen "si la unidad funciona". El resultado incondicional
    # mezcla ese régimen con el fracaso (valor_fracaso, por defecto 0 = la unidad se cierra).
    p_exito = modelo.get("exito")
    if p_exito is not None:
        exito = rng.random(n) < float(p_exito)
        y_inc = np.where(exito, y, float(modelo.get("valor_fracaso", 0.0)))
    else:
        y_inc = y

    umbrales = []
    for u in modelo.get("umbrales", []):
        umbrales.append({
            "nombre": u["nombre"],
            "valor": u["valor"],
            "prob": float(np.mean(y >= u["valor"])),
            "prob_inc": float(np.mean(y_inc >= u["valor"])),
        })

    mostrar = {}
    for nombre in modelo.get("mostrar", []):
        v = np.broadcast_to(resultado_mc[nombre], (n,))
        mostrar[nombre] = {p: float(np.percentile(v, p)) for p in PERCENTILES}

    return {
        "n": n,
        "exito": p_exito,
        "media_inc": float(np.mean(y_inc)),
        "percentiles_inc": {p: float(np.percentile(y_inc, p)) for p in PERCENTILES},
        "base": base,
        "media": float(np.mean(y)),
        "percentiles": {p: float(np.percentile(y, p)) for p in PERCENTILES},
        "prob_negativo": float(np.mean(y < 0)),
        "umbrales": umbrales,
        "tornado": tornado,
        "mostrar": mostrar,
        "muestras": y,
    }


def _fmt(x: float) -> str:
    if abs(x) >= 1000:
        return f"{x:,.0f}".replace(",", ".")
    if abs(x) >= 10:
        return f"{x:.0f}"
    return f"{x:.2f}".replace(".", ",")


def informe_md(modelo: dict, r: dict) -> str:
    u = modelo.get("unidad_salida", "")
    lineas = [
        f"# Escenarios — {modelo['id']}: {modelo['nombre']}",
        "",
        f"*Salida*: **{modelo['salida']}** ({u}). Iteraciones: {r['n']:,}. Semilla: {modelo.get('semilla', 42)}.".replace(",", "."),
        "",
        "> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el",
        "> ranking de sensibilidad, no en un número puntual.",
        "",
        "## Resultado",
        "",
    ]
    if r["exito"] is not None:
        lineas += [
            f"Probabilidad de tracción supuesta: **{r['exito']*100:.0f}%** (si no hay tracción la unidad se cierra: "
            f"valor {_fmt(float(modelo.get('valor_fracaso', 0)))}). *Condicional* = si funciona; *incondicional* = incluye el fracaso.",
            "",
            "| Caso | Condicional (si funciona) | Incondicional |",
            "|---|---|---|",
            f"| Base (supuestos en su valor más probable) | {_fmt(r['base'])} | — |",
            f"| Media Monte Carlo | {_fmt(r['media'])} | {_fmt(r['media_inc'])} |",
        ]
        for p in (10, 50, 90):
            lineas.append(f"| P{p} | {_fmt(r['percentiles'][p])} | {_fmt(r['percentiles_inc'][p])} |")
    else:
        lineas += [
            "| Caso | Valor |",
            "|---|---|",
            f"| Base (todos los supuestos en su valor más probable) | {_fmt(r['base'])} |",
            f"| Media Monte Carlo | {_fmt(r['media'])} |",
        ]
        for p in (10, 50, 90):
            lineas.append(f"| P{p} | {_fmt(r['percentiles'][p])} |")
    lineas.append(f"| Probabilidad de resultado negativo (condicional) | {r['prob_negativo']*100:.0f}% |")
    if r["umbrales"]:
        lineas += ["", "## Probabilidad de superar umbrales", ""]
        if r["exito"] is not None:
            lineas += ["| Umbral | Valor | Si funciona | Incondicional |", "|---|---|---|---|"]
            for t in r["umbrales"]:
                lineas.append(f"| {t['nombre']} | {_fmt(t['valor'])} | {t['prob']*100:.0f}% | {t['prob_inc']*100:.0f}% |")
        else:
            lineas += ["| Umbral | Valor | Probabilidad |", "|---|---|---|"]
            for t in r["umbrales"]:
                lineas.append(f"| {t['nombre']} | {_fmt(t['valor'])} | {t['prob']*100:.0f}% |")
    if r["mostrar"]:
        lineas += ["", "## Variables intermedias (P10 / P50 / P90)", "", "| Variable | P10 | P50 | P90 |", "|---|---|---|---|"]
        for k, ps in r["mostrar"].items():
            lineas.append(f"| {k} | {_fmt(ps[10])} | {_fmt(ps[50])} | {_fmt(ps[90])} |")
    lineas += [
        "",
        "## Sensibilidad (tornado): qué validar primero",
        "",
        "| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |",
        "|---|---|---|---|---|---|",
    ]
    for i, t in enumerate(r["tornado"], 1):
        lineas.append(
            f"| {i} | {t['supuesto']} — {t['desc']} | {_fmt(t['min'])} a {_fmt(t['max'])} | "
            f"{_fmt(t['salida_con_min'])} | {_fmt(t['salida_con_max'])} | {_fmt(t['rango'])} |"
        )
    if modelo.get("lectura"):
        lineas += ["", "## Lectura", "", str(modelo["lectura"]).strip()]
    return "\n".join(lineas) + "\n"


def grafico(modelo: dict, r: dict, ruta_png: Path) -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import estilo_graficos as eg
    import matplotlib.pyplot as plt
    from matplotlib.ticker import FuncFormatter

    eg.aplicar()
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 3.6), gridspec_kw={"width_ratios": [1, 1.15]})
    y = r["muestras"]
    ax1.hist(y, bins=50, color=eg.SERIES[0], alpha=0.9, edgecolor=eg.SUPERFICIE, linewidth=0.6)
    ax1.grid(axis="x", visible=False)
    ymax = ax1.get_ylim()[1]
    for p in (10, 50, 90):
        v = r["percentiles"][p]
        ax1.axvline(v, color=eg.TINTA_2, linewidth=0.9)
        ax1.text(v, ymax * 0.97, f" P{p}", color=eg.TINTA_2, fontsize=7.5, va="top")
    ax1.set_title("Distribución si funciona (condicional)" if modelo.get("exito") is not None else "Distribución del resultado")
    ax1.set_xlabel(modelo.get("unidad_salida", ""))
    ax1.set_yticks([])
    ax1.xaxis.set_major_formatter(FuncFormatter(eg.usd))

    top = r["tornado"][:7][::-1]
    base = r["base"]
    for i, t in enumerate(top):
        lo, hi = sorted((t["salida_con_min"], t["salida_con_max"]))
        ax2.barh(i, hi - lo, left=lo, height=0.55, color=eg.SERIES[0], alpha=0.9)
    ax2.axvline(base, color=eg.TINTA, linewidth=1)
    ax2.set_ylim(-1.1, len(top) - 0.4)
    ax2.text(base, -0.95, " caso base", color=eg.TINTA_2, fontsize=7.5, va="bottom")
    ax2.set_yticks(range(len(top)))
    ax2.set_yticklabels([t["supuesto"] for t in top], fontsize=8)
    ax2.grid(axis="y", visible=False)
    ax2.set_title("Sensibilidad: cada supuesto de mín. a máx.")
    ax2.xaxis.set_major_formatter(FuncFormatter(eg.usd))
    fig.tight_layout()
    fig.savefig(ruta_png, dpi=170)
    if str(ruta_png).endswith(".png"):
        fig.savefig(str(ruta_png)[:-4] + ".svg")
    plt.close(fig)


def procesar(ruta: Path, md: Path | None, png: Path | None, silencioso: bool = False) -> dict:
    modelo = cargar_modelo(ruta)
    r = correr(modelo)
    texto = informe_md(modelo, r)
    if md:
        md.parent.mkdir(parents=True, exist_ok=True)
        md.write_text(texto, encoding="utf-8")
    if png:
        png.parent.mkdir(parents=True, exist_ok=True)
        grafico(modelo, r, png)
    if not silencioso:
        print(texto)
    return {"modelo": modelo, "resultado": r}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("modelo", nargs="?", help="ruta al YAML del modelo")
    ap.add_argument("--md", help="escribir informe markdown en esta ruta")
    ap.add_argument("--png", help="escribir gráfico PNG en esta ruta")
    ap.add_argument("--todos", action="store_true", help="correr todos los modelos de herramientas/modelos/")
    args = ap.parse_args()

    if args.todos:
        DIR_RESULTADOS.mkdir(parents=True, exist_ok=True)
        for ruta in sorted(DIR_MODELOS.glob("*.yaml")):
            if ruta.name.startswith("_"):
                continue
            stem = ruta.stem
            procesar(ruta, DIR_RESULTADOS / f"{stem}.md", DIR_RESULTADOS / f"{stem}.png", silencioso=True)
            print(f"ok  {ruta.name}")
        return 0
    if not args.modelo:
        ap.print_help()
        return 1
    procesar(Path(args.modelo), Path(args.md) if args.md else None, Path(args.png) if args.png else None)
    return 0


if __name__ == "__main__":
    sys.exit(main())
