#!/usr/bin/env python3
"""Cartera: libro de capital y proyección compuesta a 5 años.

Uso:
  python3 herramientas/cartera.py resumen                  # resume cartera/libro-capital.csv por balde y unidad
  python3 herramientas/cartera.py proyectar                # Monte Carlo de cartera/proyeccion.yaml
  python3 herramientas/cartera.py proyectar --md out.md --png out.png

Libro de capital (CSV): fecha,tipo,balde,unidad,monto_usd,nota
  tipo ∈ {aporte, gasto, ingreso, inversion, rescate, rendimiento, retiro}
  balde ∈ {tesoreria, herramientas, validacion, construccion, opciones}
"""
from __future__ import annotations

import argparse
import csv
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
import yaml

RAIZ = Path(__file__).resolve().parent.parent
LIBRO = RAIZ / "cartera" / "libro-capital.csv"
PROYECCION = RAIZ / "cartera" / "proyeccion.yaml"


# ---------------------------------------------------------------- resumen del libro
def resumen() -> str:
    if not LIBRO.exists():
        return "No hay libro de capital todavía."
    por_tipo = defaultdict(float)
    por_balde = defaultdict(float)
    por_unidad = defaultdict(float)
    filas = 0
    with open(LIBRO, encoding="utf-8") as f:
        for fila in csv.DictReader(f):
            filas += 1
            m = float(fila["monto_usd"])
            por_tipo[fila["tipo"]] += m
            signo = 1 if fila["tipo"] in ("aporte", "ingreso", "rendimiento", "rescate") else -1
            por_balde[fila["balde"]] += signo * m
            if fila.get("unidad"):
                por_unidad[fila["unidad"]] += signo * m
    L = ["# Resumen del libro de capital", "", f"Movimientos: {filas}", "", "| Tipo | USD |", "|---|---|"]
    L += [f"| {k} | {v:,.2f} |" for k, v in sorted(por_tipo.items())]
    L += ["", "| Balde | Neto USD |", "|---|---|"]
    L += [f"| {k} | {v:,.2f} |" for k, v in sorted(por_balde.items())]
    L += ["", "| Unidad | Neto USD |", "|---|---|"]
    L += [f"| {k} | {v:,.2f} |" for k, v in sorted(por_unidad.items())]
    caja = por_tipo["aporte"] + por_tipo["ingreso"] + por_tipo["rendimiento"] + por_tipo["rescate"] - por_tipo["gasto"] - por_tipo["inversion"] - por_tipo["retiro"]
    L += ["", f"**Caja neta estimada**: USD {caja:,.2f}"]
    return "\n".join(L) + "\n"


# ---------------------------------------------------------------- proyección
def _tri(rng, spec, n=None):
    return rng.triangular(spec["min"], spec["modo"], spec["max"], n)


def proyectar(cfg: dict) -> dict:
    rng = np.random.default_rng(cfg.get("semilla", 7))
    T = int(cfg["meses"])
    N = int(cfg["iteraciones"])
    r_m = (1 + cfg["tasa_tesoreria_anual"]) ** (1 / 12) - 1
    reinv = float(cfg.get("reinversion_pct", 1.0))

    caja = np.zeros((N, T + 1))
    flujo = np.zeros((N, T + 1))
    valor_unidades = np.zeros((N, T + 1))
    solo_tesoreria = np.zeros(T + 1)
    compras = defaultdict(int)
    exitos_unidad = defaultdict(int)

    cap = int(cfg.get("max_unidades_escaladas", 99))
    p_sin_tiempo = float(cfg.get("prob_fundador_sin_tiempo", 0.0))
    fe_spec = cfg.get("factor_ejecucion")
    sin_tiempo_total = 0
    for i in range(N):
        # Riesgos comunes: el fundador puede no tener tiempo (todas fallan) y su ejecución afecta a todas las unidades.
        sin_tiempo = rng.random() < p_sin_tiempo
        sin_tiempo_total += sin_tiempo
        factor = float(_tri(rng, fe_spec)) if fe_spec else 1.0
        candidatas = []
        for u in cfg["unidades"]:
            ok = (not sin_tiempo) and rng.random() < u["prob_exito"]
            regimen = float(_tri(rng, u["flujo_regimen"])) * factor if ok else 0.0
            candidatas.append([u, ok, regimen])
        # Capacidad: el comité escala solo las mejores unidades que consumen horas del fundador.
        consumen = sorted([c for c in candidatas if c[1] and c[0].get("consume_capacidad", True)], key=lambda c: -c[2])
        for c in consumen[cap:]:
            c[1], c[2] = False, 0.0
        unidades = [tuple(c) for c in candidatas]
        for u, ok, _ in unidades:
            if ok:
                exitos_unidad[u["id"]] += 1
        activos = []  # reinversiones ejecutadas: (spec, mes_compra, ok, flujo)
        pendientes = list(cfg.get("reinversiones", []))
        saldo = 0.0
        for t in range(1, T + 1):
            f_t = 0.0
            costo_t = cfg["gasto_herramientas_mensual"]
            v_t = 0.0
            for u, ok, regimen in unidades:
                ini = u["inicio_mes"]
                fin_val = ini + u["meses_validacion"]
                fin = u.get("fin_mes", 10**6)
                if ini <= t < fin_val:
                    costo_t += u["costo_validacion_mensual"]
                elif ok and fin_val <= t <= fin:
                    progreso = min(1.0, (t - fin_val + 1) / u["rampa_meses"])
                    f_u = regimen * progreso
                    f_t += f_u
                    v_t += f_u * u["multiplo_valor_meses"]
            for spec, mes, ok, fl in activos:
                if ok:
                    progreso = min(1.0, (t - mes) / 3)
                    f_t += fl * progreso
                    v_t += fl * progreso * spec["multiplo_valor_meses"]
            saldo = saldo * (1 + r_m) + cfg["aporte_mensual"] + f_t * reinv - costo_t
            # reinversiones disponibles
            for spec in list(pendientes):
                if t < spec["desde_mes"]:
                    continue
                req = spec.get("requiere")
                if req and not any(u["id"] == req and ok for u, ok, _ in unidades):
                    pendientes.remove(spec)
                    continue
                if saldo >= spec["costo"] * 1.1:  # deja un colchón de 10%
                    saldo -= spec["costo"]
                    ok = rng.random() < spec["prob_exito"]
                    fl = float(_tri(rng, spec["flujo"])) if ok else 0.0
                    activos.append((spec, t, ok, fl))
                    compras[spec["id"]] += 1
                    pendientes.remove(spec)
            caja[i, t] = saldo
            flujo[i, t] = f_t
            valor_unidades[i, t] = v_t
    s = 0.0
    for t in range(1, T + 1):
        s = s * (1 + r_m) + cfg["aporte_mensual"]
        solo_tesoreria[t] = s
    patrimonio = caja + valor_unidades
    aportado = cfg["aporte_mensual"] * T
    return {
        "T": T,
        "N": N,
        "caja": caja,
        "flujo": flujo,
        "patrimonio": patrimonio,
        "solo_tesoreria": solo_tesoreria,
        "aportado": aportado,
        "compras": {k: v / N for k, v in compras.items()},
        "exitos": {k: v / N for k, v in exitos_unidad.items()},
        "sin_tiempo": sin_tiempo_total / N,
    }


def _pct(a, p):
    return float(np.percentile(a, p))


def _u(x):
    return f"{x:,.0f}".replace(",", ".")


def informe_proyeccion(cfg: dict, r: dict) -> str:
    L = [
        "# Proyección compuesta de la cartera (Monte Carlo)",
        "",
        f"{r['N']} simulaciones, {r['T']} meses. Aporte USD {cfg['aporte_mensual']}/mes; tesorería al "
        f"{cfg['tasa_tesoreria_anual']*100:.0f}% anual; herramientas USD {cfg['gasto_herramientas_mensual']}/mes; "
        f"reinversión {cfg.get('reinversion_pct', 1)*100:.0f}% del flujo. Supuestos en `cartera/proyeccion.yaml` (HIPÓTESIS).",
        "",
        "## Flujo mensual de las unidades (USD/mes)",
        "",
        "| Mes | P10 | P50 | P90 | Prob. > USD 1.000 | Prob. > USD 3.000 |",
        "|---|---|---|---|---|---|",
    ]
    for m in (12, 24, 36, 48, 60):
        f = r["flujo"][:, m]
        L.append(f"| {m} | {_u(_pct(f,10))} | {_u(_pct(f,50))} | {_u(_pct(f,90))} | {np.mean(f>1000)*100:.0f}% | {np.mean(f>3000)*100:.0f}% |")
    L += [
        "",
        "## Caja líquida acumulada (tesorería después de reinversiones, USD)",
        "",
        "| Mes | P10 | P50 | P90 | Solo tesorería (mismo aporte) | Aportado acumulado |",
        "|---|---|---|---|---|---|",
    ]
    for m in (12, 24, 36, 48, 60):
        c = r["caja"][:, m]
        L.append(
            f"| {m} | {_u(_pct(c,10))} | {_u(_pct(c,50))} | {_u(_pct(c,90))} | {_u(r['solo_tesoreria'][m])} | "
            f"{_u(cfg['aporte_mensual']*m)} |"
        )
    L += [
        "",
        "## Patrimonio de la cartera (caja + valor de unidades y activos a múltiplos conservadores, USD)",
        "",
        "| Mes | P10 | P50 | P90 | Solo tesorería |",
        "|---|---|---|---|---|",
    ]
    for m in (12, 24, 36, 48, 60):
        p = r["patrimonio"][:, m]
        L.append(f"| {m} | {_u(_pct(p,10))} | {_u(_pct(p,50))} | {_u(_pct(p,90))} | {_u(r['solo_tesoreria'][m])} |")
    L += ["", "## Probabilidad de cada evento", "", "| Evento | Probabilidad |", "|---|---|"]
    L.append(f"| El fundador no puede dedicar las horas (todas las unidades fallan) | {r['sin_tiempo']*100:.0f}% |")
    for k, v in sorted(r["exitos"].items()):
        L.append(f"| {k} logra tracción y el comité la escala | {v*100:.0f}% |")
    for k, v in sorted(r["compras"].items()):
        L.append(f"| Se ejecuta la reinversión {k} | {v*100:.0f}% |")
    p60 = r["patrimonio"][:, r["T"]]
    L += [
        "",
        "## Lectura",
        "",
        f"- Probabilidad de terminar el mes {r['T']} con más patrimonio que la estrategia de solo tesorería: "
        f"**{np.mean(p60 > r['solo_tesoreria'][r['T']])*100:.0f}%**.",
        f"- Probabilidad de que la cartera genere > USD 1.000/mes al mes 24: **{np.mean(r['flujo'][:,24]>1000)*100:.0f}%**; "
        f"al mes 60: **{np.mean(r['flujo'][:,60]>1000)*100:.0f}%**.",
        "- El resultado depende sobre todo de que al menos una unidad de servicio logre tracción en el año 1: con varias apuestas "
        "baratas en paralelo, la probabilidad de que *ninguna* funcione cae mucho (diversificación de experimentos).",
    ]
    return "\n".join(L) + "\n"


def grafico_proyeccion(cfg: dict, r: dict, ruta: Path) -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import estilo_graficos as eg
    import matplotlib.pyplot as plt
    from matplotlib.ticker import FuncFormatter

    eg.aplicar()
    t = np.arange(r["T"] + 1)
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(10, 3.8))
    for arr, ax, titulo in ((r["flujo"], a1, "Flujo mensual de las unidades (USD/mes)"),
                            (r["patrimonio"], a2, "Patrimonio de la cartera (USD)")):
        p10, p50, p90 = (np.percentile(arr, q, axis=0) for q in (10, 50, 90))
        ax.fill_between(t, p10, p90, color=eg.SERIES[0], alpha=0.12, linewidth=0, label="Rango P10–P90")
        ax.plot(t, p50, color=eg.SERIES[0], linewidth=2, label="Mediana (P50)")
        ax.text(t[-1], p50[-1], f"  {eg.usd(p50[-1])}", color=eg.TINTA_2, fontsize=8, va="center")
        ax.set_title(titulo)
        ax.set_xlabel("Mes")
        ax.set_xlim(0, r["T"] + 8)
        ax.yaxis.set_major_formatter(FuncFormatter(eg.usd))
    a2.plot(t, r["solo_tesoreria"], color=eg.SERIES[1], linewidth=2, label="Solo tesorería (mismo aporte)")
    a2.text(t[-1], r["solo_tesoreria"][-1], f"  {eg.usd(r['solo_tesoreria'][-1])}", color=eg.TINTA_2, fontsize=8, va="center")
    a1.legend(loc="upper left")
    a2.legend(loc="upper left")
    fig.tight_layout()
    fig.savefig(ruta, dpi=170)
    if str(ruta).endswith(".png"):
        fig.savefig(str(ruta)[:-4] + ".svg")
    plt.close(fig)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("accion", choices=["resumen", "proyectar"])
    ap.add_argument("--md")
    ap.add_argument("--png")
    ap.add_argument("--estres", type=float, default=1.0,
                    help="multiplica las probabilidades de éxito de unidades y reinversiones (p. ej. 0.6 = escenario de estrés)")
    args = ap.parse_args()
    if args.accion == "resumen":
        print(resumen())
        return 0
    cfg = yaml.safe_load(PROYECCION.read_text(encoding="utf-8"))
    if args.estres != 1.0:
        for u in cfg["unidades"] + cfg.get("reinversiones", []):
            u["prob_exito"] = min(1.0, u["prob_exito"] * args.estres)
    r = proyectar(cfg)
    texto = informe_proyeccion(cfg, r)
    print(texto)
    if args.md:
        Path(args.md).write_text(texto, encoding="utf-8")
    if args.png:
        grafico_proyeccion(cfg, r, Path(args.png))
    return 0


if __name__ == "__main__":
    sys.exit(main())
