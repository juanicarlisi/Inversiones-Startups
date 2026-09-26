#!/usr/bin/env python3
"""Simulación a 60 meses del plan "ingresos sin salir a vender" (Monte Carlo, mes a mes).

Combina tres motores que no requieren salir a vender:
  1. Tesorería en USD (aporte mensual + interés), con un posible shock Argentina.
  2. Fábrica de herramientas en marketplaces (OP-12), con regla de corte.
  3. Compras de micro-negocios digitales que ya venden (OP-08b), financiadas con la tesorería.
Opcional: motos con operador (OP-13) como satélite.

Uso:
  python3 herramientas/plan_sin_venta.py                     # resumen en consola
  python3 herramientas/plan_sin_venta.py --md cartera/plan-sin-venta-resultados.md --png cartera/plan-sin-venta.png

"Ingreso pasivo" = interés de la tesorería + margen neto de la fábrica + flujo neto de los negocios comprados (+ motos).
Se reinvierte todo (nada se retira) para mostrar el ingreso que el sistema podría pagar cada mes si se decidiera retirarlo.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
import yaml

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "herramientas"))

import escenarios  # noqa: E402

CONFIG = RAIZ / "cartera" / "plan-sin-venta.yaml"


def _tri(rng, r, n):
    lo, modo, hi = r
    return rng.triangular(lo, modo, hi, n)


def _muestras_fabrica(cfg, n, rng):
    """Ingreso bruto y costo fijo mensual de la fábrica al mes 12, muestreados del modelo OP-12."""
    modelo = escenarios.cargar_modelo(RAIZ / cfg["fabrica"]["modelo"])
    mu = {k: escenarios._muestrear(v, n, rng) for k, v in modelo["supuestos"].items()}
    r = escenarios.evaluar(modelo, mu)
    return np.broadcast_to(r["ingresos"], (n,)).copy(), np.broadcast_to(r["costo_fijo"], (n,)).copy()


def simular(cfg: dict, ahorro_inicial: float = 0.0, fabrica: bool = True, adquisiciones: bool = True,
            motos: bool = False, n: int | None = None, semilla: int | None = None) -> dict:
    n = int(n or cfg["simulaciones"])
    rng = np.random.default_rng(semilla if semilla is not None else cfg["semilla"])
    T = int(cfg["meses"])
    aporte = float(cfg["aporte_mensual"])
    colchon = float(cfg["colchon_usd"])

    tes_cfg = cfg["tesoreria"]
    tasa = _tri(rng, tes_cfg["tasa_anual"], n) / 12
    shock = rng.random(n) < tes_cfg["shock"]["prob"]
    mes_shock = rng.integers(tes_cfg["shock"]["mes"][0], tes_cfg["shock"]["mes"][1] + 1, n)
    perdida_shock = _tri(rng, tes_cfg["shock"]["perdida"], n)

    tes = np.full(n, float(ahorro_inicial))

    # Fábrica
    f_cfg = cfg["fabrica"]
    f_ing12, f_costo = _muestras_fabrica(cfg, n, rng)
    f_tend = _tri(rng, f_cfg["tendencia_anual"], n)
    f_viva = np.full(n, fabrica)

    # Adquisiciones (hasta K espacios)
    a_cfg = cfg["adquisiciones"]
    K = int(a_cfg["maximo"])
    a_activa = np.zeros((n, K), dtype=bool)
    a_mes = np.zeros((n, K), dtype=int)
    a_precio = np.zeros((n, K))
    a_base = np.zeros((n, K))       # beneficio mensual al comprar
    a_obj1 = np.zeros((n, K))       # factor objetivo al mes 12 de la compra
    a_tend = np.zeros((n, K))
    a_costo = np.zeros((n, K))
    a_mult = np.zeros((n, K))
    a_factor = np.ones((n, K))
    n_compras = np.zeros(n, dtype=int)
    ultima_compra = np.full(n, -999)
    h1 = 1 - (1 - a_cfg["prob_colapso_1a"]) ** (1 / 12)
    h2 = 1 - (1 - a_cfg["prob_colapso_anual_despues"]) ** (1 / 12)

    # Motos
    m_cfg = cfg["motos"]
    M = int(m_cfg["maximo"])
    m_activa = np.zeros((n, M), dtype=bool)
    m_mes = np.zeros((n, M), dtype=int)
    m_precio = np.zeros((n, M))
    m_ing = np.zeros((n, M))
    m_vida = np.zeros((n, M), dtype=int)
    m_resid = np.zeros((n, M))
    hm = None

    ingreso = np.zeros((n, T + 1))
    patrimonio = np.zeros((n, T + 1))
    patrimonio[:, 0] = tes
    comprado = np.zeros((n, T + 1))

    for t in range(1, T + 1):
        # --- shock Argentina sobre la tesorería
        golpe = shock & (mes_shock == t)
        tes[golpe] *= 1 - perdida_shock[golpe]

        # --- fábrica
        f_neto = np.zeros(n)
        if fabrica:
            if t < f_cfg["mes_inicio_ingresos"]:
                f_ing = np.zeros(n)
            elif t <= 12:
                f_ing = f_ing12 * (t - f_cfg["mes_inicio_ingresos"] + 1) / (12 - f_cfg["mes_inicio_ingresos"] + 1)
            else:
                f_ing = f_ing12 * (1 + f_tend) ** ((t - 12) / 12)
            if t == f_cfg["corte"]["mes"]:
                f_viva &= f_ing >= f_cfg["corte"]["minimo_usd"]
            f_neto = np.where(f_viva, f_ing - f_costo, 0.0)

        # --- flujo de negocios comprados
        a_flujo = np.zeros((n, K))
        if adquisiciones:
            edad = t - a_mes
            colapsa = a_activa & (rng.random((n, K)) < np.where(edad <= 12, h1, h2))
            a_activa &= ~colapsa
            en_rampa = a_activa & (edad <= 12)
            a_factor = np.where(en_rampa, 1 + (a_obj1 - 1) * np.clip(edad, 0, 12) / 12, a_factor)
            despues = a_activa & (edad > 12)
            a_factor = np.where(despues, a_factor * (1 + a_tend) ** (1 / 12), a_factor)
            a_flujo = np.where(a_activa, a_base * a_factor - a_costo, 0.0)

        # --- motos
        m_flujo = np.zeros((n, M))
        if motos:
            edad_m = t - m_mes
            if hm is None:
                hm = 1 - (1 - m_cfg["prob_perdida_vida"]) ** (1 / 30)
            pierde = m_activa & (rng.random((n, M)) < hm)
            m_activa &= ~pierde
            fin = m_activa & (edad_m >= m_vida)
            tes += (m_precio * m_resid * fin).sum(axis=1)
            m_activa &= ~fin
            m_flujo = np.where(m_activa, m_ing, 0.0)

        interes = tes * tasa
        flujo_total = f_neto + a_flujo.sum(axis=1) + m_flujo.sum(axis=1)
        tes += aporte + interes + flujo_total
        # la caja de las motos incluye devolución de capital: el ingreso se informa neto de amortización
        amort_motos = (m_precio * (1 - m_resid) / np.maximum(m_vida, 1) * m_activa).sum(axis=1) if motos else 0.0
        ingreso[:, t] = interes + flujo_total - amort_motos

        # --- decisión de compra de un negocio
        if adquisiciones and t >= a_cfg["mes_minimo"]:
            disponible = tes - colchon
            puede = (n_compras < K) & (t - ultima_compra >= a_cfg["meses_entre_compras"])
            tope = np.array(a_cfg["topes"])[np.minimum(n_compras, K - 1)]
            precio = np.minimum(disponible / (1 + a_cfg["costo_transaccion"]), tope)
            compra = puede & (precio >= a_cfg["precio_minimo"])
            if compra.any():
                idx = np.where(compra)[0]
                k = n_compras[idx]
                p = precio[idx]
                mult = _tri(rng, a_cfg["multiplo"], len(idx))
                a_activa[idx, k] = True
                a_mes[idx, k] = t
                a_precio[idx, k] = p
                a_mult[idx, k] = mult
                a_base[idx, k] = p / mult / 12
                a_obj1[idx, k] = (1 + _tri(rng, a_cfg["variacion_1a"], len(idx))) * (1 + _tri(rng, a_cfg["mejora_ia"], len(idx)))
                a_tend[idx, k] = _tri(rng, a_cfg["tendencia_anual"], len(idx))
                a_costo[idx, k] = _tri(rng, a_cfg["costo_operacion"], len(idx))
                a_factor[idx, k] = 1.0
                tes[idx] -= p * (1 + a_cfg["costo_transaccion"])
                n_compras[idx] += 1
                ultima_compra[idx] = t
                comprado[idx, t] = p

        # --- decisión de compra de una moto (satélite)
        if motos and t >= m_cfg["mes_minimo"]:
            libres = ~m_activa
            hay_lugar = libres.any(axis=1)
            precio_m = _tri(rng, m_cfg["precio"], n)
            compra_m = hay_lugar & (tes - colchon >= precio_m) & (m_activa.sum(axis=1) < M)
            # no competir con la próxima compra de negocio: solo si ya hubo una compra o faltan > 6 meses para poder comprar
            compra_m &= (n_compras >= 1) | (t < a_cfg["mes_minimo"] - 6) | (not adquisiciones)
            if compra_m.any():
                idx = np.where(compra_m)[0]
                j = np.argmax(libres[idx], axis=1)
                m_activa[idx, j] = True
                m_mes[idx, j] = t
                m_precio[idx, j] = precio_m[idx]
                m_ing[idx, j] = _tri(rng, m_cfg["ingreso_inversor_mensual"], len(idx))
                m_vida[idx, j] = np.round(_tri(rng, m_cfg["vida_util"], len(idx))).astype(int)
                m_resid[idx, j] = _tri(rng, m_cfg["valor_residual"], len(idx))
                tes[idx] -= precio_m[idx]

        valor_neg = (np.maximum(a_base * a_factor - a_costo, 0) * 12 * a_mult * 0.8 * a_activa).sum(axis=1)
        valor_motos = (m_precio * np.clip(1 - (t - m_mes) / np.maximum(m_vida, 1), m_resid, 1) * m_activa).sum(axis=1)
        patrimonio[:, t] = tes + valor_neg + valor_motos

    # Referencia: solo tesorería con la tasa más probable, sin shock
    r = tes_cfg["tasa_anual"][1] / 12
    ref = np.zeros(T + 1)
    ref_ing = np.zeros(T + 1)
    ref[0] = ahorro_inicial
    for t in range(1, T + 1):
        ref_ing[t] = ref[t - 1] * r
        ref[t] = ref[t - 1] + aporte + ref_ing[t]
    return {
        "T": T, "n": n, "ingreso": ingreso, "patrimonio": patrimonio, "compras": n_compras,
        "comprado": comprado, "fabrica_viva": f_viva, "ref_patrimonio": ref, "ref_ingreso": ref_ing,
        "aportado": ahorro_inicial + aporte * np.arange(T + 1),
    }


def _u(x: float) -> str:
    return f"{x:,.0f}".replace(",", ".")


ESCENARIOS_PLAN = [
    ("Plan base (renta + fábrica + compras)", dict()),
    ("Plan base con ahorro inicial de USD 5.000", dict(ahorro_inicial=5000)),
    ("Plan base + motos con operador (satélite)", dict(motos=True)),
    ("Solo renta (con riesgo de shock)", dict(fabrica=False, adquisiciones=False)),
]


def tabla_md(cfg: dict) -> str:
    """Tabla de escenarios del plan + lectura de la simulación base (markdown)."""
    lineas = [
        "| Escenario | Ingreso pasivo mes 12 (P10 / P50 / P90) | Mes 24 | Mes 60 | Patrimonio mes 60 (P50) | P(ingreso ≥ USD 400 al mes 60) |",
        "|---|---|---|---|---|---|",
    ]
    for nombre, kw in ESCENARIOS_PLAN:
        r = simular(cfg, **kw)
        ing, pat = r["ingreso"], r["patrimonio"]

        def trio(m):
            return " / ".join(_u(np.percentile(ing[:, m], q)) for q in (10, 50, 90))

        p400 = float(np.mean(ing[:, 60] >= 400)) * 100
        lineas.append(f"| {nombre} | {trio(12)} | {trio(24)} | {trio(60)} | {_u(np.percentile(pat[:, 60], 50))} | {p400:.0f}% |")
    base = simular(cfg)
    tasa_txt = f"{cfg['tesoreria']['tasa_anual'][1]*100:.1f}".replace(".", ",")
    lineas += [
        "",
        f"Valores en USD por mes; {_u(cfg['simulaciones'])} simulaciones. Referencia sin shock (solo renta al "
        f"{tasa_txt}%): USD {_u(base['ref_ingreso'][12])} / {_u(base['ref_ingreso'][24])} / "
        f"{_u(base['ref_ingreso'][60])} por mes a los meses 12 / 24 / 60 y patrimonio de USD {_u(base['ref_patrimonio'][60])} al mes 60 "
        f"(aportado: USD {_u(base['aportado'][60])}). En el plan base la fábrica sobrevive a la regla de corte en "
        f"{np.mean(base['fabrica_viva'])*100:.0f}% de las simulaciones y el patrimonio al mes 60 supera al de solo renta en "
        f"{np.mean(base['patrimonio'][:, 60] > base['ref_patrimonio'][60])*100:.0f}%.",
    ]
    return "\n".join(lineas)


def resumen_md(cfg: dict) -> str:
    return "\n".join([
        "# Plan \"ingresos sin salir a vender\" — resultados de la simulación",
        "",
        f"Generado por `herramientas/plan_sin_venta.py` con `cartera/plan-sin-venta.yaml` ({cfg['meses']} meses, aporte USD "
        f"{cfg['aporte_mensual']}/mes). Todo se reinvierte; \"ingreso pasivo\" es lo que el sistema podría pagar ese mes si se retirara.",
        "",
        tabla_md(cfg),
    ]) + "\n"


def grafico(cfg: dict, ruta_png: Path) -> None:
    import estilo_graficos as eg
    import matplotlib.pyplot as plt
    from matplotlib.ticker import FuncFormatter

    eg.aplicar()
    fig, axes = plt.subplots(1, 2, figsize=(10, 3.9), sharey=True)
    for ax, (titulo, kw) in zip(axes, [("Sin ahorro inicial", {}), ("Con USD 5.000 de ahorro inicial", {"ahorro_inicial": 5000})]):
        r = simular(cfg, **kw)
        x = np.arange(r["T"] + 1)
        ing = r["ingreso"]
        p10, p50, p90 = (np.percentile(ing, q, axis=0) for q in (10, 50, 90))
        ax.fill_between(x, p10, p90, color=eg.SERIES[0], alpha=0.16, linewidth=0, label="P10–P90 del plan")
        ax.plot(x, p50, color=eg.SERIES[0], label="Plan: mediana")
        ax.plot(x, r["ref_ingreso"], color=eg.SERIES[1], linewidth=1.8, label="Solo renta")
        ax.axhline(400, color=eg.TINTA_MUTED, linewidth=0.9)
        ax.text(1, 408, "USD 400/mes (el aporte)", color=eg.TINTA_2, fontsize=7.5, va="bottom")
        ax.set_title(titulo)
        ax.set_xlabel("Mes")
        ax.set_xticks([0, 12, 24, 36, 48, 60])
        ax.yaxis.set_major_formatter(FuncFormatter(eg.usd))
    axes[0].set_ylabel("Ingreso pasivo mensual (USD)")
    axes[0].legend(loc="upper left", bbox_to_anchor=(0.0, 0.93))
    fig.tight_layout()
    fig.savefig(ruta_png, dpi=170)
    fig.savefig(str(ruta_png)[:-4] + ".svg", metadata={"Date": None})
    plt.close(fig)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default=str(CONFIG))
    ap.add_argument("--md")
    ap.add_argument("--png")
    args = ap.parse_args()
    cfg = yaml.safe_load(Path(args.config).read_text(encoding="utf-8"))
    texto = resumen_md(cfg)
    print(texto)
    if args.md:
        Path(args.md).write_text(texto, encoding="utf-8")
    if args.png:
        grafico(cfg, Path(args.png))
    return 0


if __name__ == "__main__":
    sys.exit(main())
