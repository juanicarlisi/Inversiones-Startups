#!/usr/bin/env python3
"""Casos de negocio del holding: curvas mensuales por proyecto, simulación, horas y renta (2026-10 → 2031-09).

Datos: oportunidades/proyectos/*.yaml (proyectos sobrevivientes) + oportunidades/backlog.yaml (secundarios, con los números del
catálogo). Uso:
  python3 herramientas/holding.py            # resumen en consola y cartera/holding-resultados.md
Convenciones:
  - Mes 0 = 2026-10; 60 meses. Fechas "AAAA-MM".
  - "Si funciona (normal)": curva del escenario normal de cada proyecto (drivers × precios − costos).
  - "Esperado": promedio de la simulación (chances de que funcione, escenario malo/normal/bueno y fallas en común).
  - Todo número es ESTIMACIÓN con supuestos escritos en cada ficha.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
import yaml

RAIZ = Path(__file__).resolve().parent.parent
DIR_PROY = RAIZ / "oportunidades" / "proyectos"
BACKLOG = RAIZ / "oportunidades" / "backlog.yaml"
INICIO = (2026, 10)
N_MESES = 60
N_SIM = 4000
FALLO_COMUN = 0.18   # a veces fallan todos juntos (tiempo, energía, cambio de trabajo o de contexto)
SIGMA_EJECUCION = 0.25  # factor común de ejecución: si la difusión sale bien (o mal), afecta a todos los proyectos
AHORRO_CLAUDE = ("2028-06", 80)  # si a esa fecha los proyectos no cubren los costos fijos, se vuelve a Claude Pro (−USD 80/mes)
SEMILLA = 20260928

MESES_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def idx(ym: str) -> int:
    a, m = (int(x) for x in str(ym).split("-"))
    return (a - INICIO[0]) * 12 + (m - INICIO[1])


def ym(i: int) -> str:
    a = INICIO[0] + (INICIO[1] - 1 + i) // 12
    m = (INICIO[1] - 1 + i) % 12 + 1
    return f"{a}-{m:02d}"


def etiqueta(i: int) -> str:
    a, m = (int(x) for x in ym(i).split("-"))
    return f"{MESES_ES[m-1]}-{str(a)[2:]}"


MESES = [ym(i) for i in range(N_MESES)]
ANIOS = [2026, 2027, 2028, 2029, 2030, 2031]


def meses_del_anio(a: int) -> list[int]:
    return [i for i in range(N_MESES) if MESES[i].startswith(str(a))]


# ─────────────────────────────────────────────── carga ───────────────────────────────────────────────
def cargar() -> dict:
    holding = yaml.safe_load((DIR_PROY / "_holding.yaml").read_text(encoding="utf-8"))
    proys = []
    for f in sorted(DIR_PROY.glob("P*.yaml")):
        p = yaml.safe_load(f.read_text(encoding="utf-8"))
        p["_archivo"] = f.name
        proys.append(p)
    proys.sort(key=lambda p: p["orden"])
    backlog = yaml.safe_load(BACKLOG.read_text(encoding="utf-8")) if BACKLOG.exists() else {"items": []}
    return {"holding": holding, "proyectos": proys, "backlog": backlog}


# ─────────────────────────────────────────────── curvas ───────────────────────────────────────────────
def _interp(fechas: list[str], valores: list[float], desde: int | None = None) -> np.ndarray:
    """Interpolación lineal mensual entre anclas; 0 antes de la primera; constante después de la última."""
    xs = [idx(f) for f in fechas]
    out = np.zeros(N_MESES)
    for i in range(N_MESES):
        if i < xs[0]:
            out[i] = 0.0
        elif i >= xs[-1]:
            out[i] = valores[-1]
        else:
            for k in range(len(xs) - 1):
                if xs[k] <= i < xs[k + 1]:
                    t = (i - xs[k]) / (xs[k + 1] - xs[k])
                    out[i] = valores[k] + t * (valores[k + 1] - valores[k])
                    break
    return out


def _eval(expr: str, ctx: dict) -> float:
    return float(eval(str(expr), {"__builtins__": {}, "min": min, "max": max}, ctx))


def curva_drivers(c: dict) -> dict:
    """Devuelve ingresos por línea, costo y neto (escenario normal) + tabla por ancla."""
    fechas = c["fechas"]
    drivers = c["drivers"]
    n = len(fechas)
    for k, v in drivers.items():
        if len(v) != n:
            raise ValueError(f"driver {k}: {len(v)} valores y {n} fechas")
    anclas = []
    for j in range(n):
        ctx = {k: v[j] for k, v in drivers.items()}
        lin = {nombre: _eval(expr, ctx) for nombre, expr in c["lineas"].items()}
        costo = _eval(c["costo"], ctx)
        anclas.append({"fecha": fechas[j], "drivers": ctx, "lineas": lin, "ingreso": sum(lin.values()), "costo": costo})
    lineas = {nombre: _interp(fechas, [a["lineas"][nombre] for a in anclas]) for nombre in c["lineas"]}
    ingreso = sum(lineas.values())
    costo = _interp(fechas, [a["costo"] for a in anclas])
    desde = idx(c.get("costos_desde", fechas[0]))
    costo[desde:idx(fechas[0])] = anclas[0]["costo"]
    costo[:desde] = 0.0
    return {"lineas": lineas, "ingreso": ingreso, "costo": costo, "neto": ingreso - costo, "anclas": anclas}


def curva_plantilla(prod: dict) -> list[dict]:
    """Productos 'plantilla' (radar): misma curva relativa para cada lanzamiento."""
    out = []
    puntos = sorted((int(k), v) for k, v in prod["curva"].items())
    for n, lz in enumerate(prod["lanzamientos"], 1):
        base = idx(lz)
        ing = np.zeros(N_MESES)
        for i in range(base, N_MESES):
            rel = i - base
            if rel >= puntos[-1][0]:
                ing[i] = puntos[-1][1]
            else:
                for k in range(len(puntos) - 1):
                    if puntos[k][0] <= rel < puntos[k + 1][0]:
                        t = (rel - puntos[k][0]) / (puntos[k + 1][0] - puntos[k][0])
                        ing[i] = puntos[k][1] + t * (puntos[k + 1][1] - puntos[k][1])
                        break
        costo = np.zeros(N_MESES)
        costo[base:] = prod.get("costo_mensual", 10)
        out.append({"id": f"{prod['id']}{n}", "nombre": f"{prod['nombre']} {n}", "lanzamiento": lz, "p_exito": prod["p_exito"],
                    "ingreso": ing, "costo": costo, "neto": ing - costo, "lineas": {"Ingreso": ing}})
    return out


def componentes(p: dict) -> list[dict]:
    """Unidades que se simulan por separado: el proyecto entero o cada producto de una cartera."""
    c = p.get("caso", {})
    tipo = c.get("tipo", p.get("tipo"))
    if tipo == "renta":
        return []
    if tipo == "cartera":
        comps = []
        for prod in p["productos"]:
            if prod.get("tipo") == "plantilla":
                comps.extend(curva_plantilla(prod))
                continue
            cv = curva_drivers({**prod, "costos_desde": prod["lanzamiento"]})
            comps.append({"id": prod["id"], "nombre": prod["nombre"], "lanzamiento": prod["lanzamiento"], "p_exito": prod["p_exito"],
                          **cv})
        for k in comps:
            k["malo"], k["bueno"] = c.get("malo", 0.4), c.get("bueno", 2.5)
            # si no funciona: costos durante los 90 días de prueba, sin ingreso relevante
            fail = np.zeros(N_MESES)
            b = idx(k["lanzamiento"])
            fail[b:min(b + 3, N_MESES)] = -k["costo"][b:min(b + 3, N_MESES)]
            k["fallo"] = fail
        return comps
    cv = curva_drivers(c)
    fail = np.zeros(N_MESES)
    corte = idx(c["si_no"]["corte"]) if c.get("si_no", {}).get("corte") else N_MESES
    lz = idx(c["lanzamiento"])
    desde = idx(c.get("costos_desde", c["lanzamiento"]))
    base_costo = cv["anclas"][0]["costo"]
    for i in range(desde, min(corte, N_MESES)):
        fail[i] = -base_costo + (c["si_no"].get("ingreso", 0) if i >= lz else 0)
    comp = {"id": p["id"], "nombre": p["nombre"], "lanzamiento": c["lanzamiento"], "p_exito": c["p_exito"], "fallo": fail,
            "malo": c.get("malo", 0.4), "bueno": c.get("bueno", 2.5), **cv}
    if tipo == "activo":
        comp["compra"] = (idx(c["lanzamiento"]), c["precio_compra"])
        comp["residual"] = c.get("valor_residual", [0.8, 0.3])
    return [comp]


def escalar(comp: dict, f: float) -> np.ndarray:
    """Escenario con volumen × f: ingreso × f; costo mitad fijo, mitad variable."""
    return comp["ingreso"] * f - comp["costo"] * (0.5 + 0.5 * f)


# ─────────────────────────────────────────────── secundarios (backlog) ───────────────────────────────────────────────
def componentes_backlog(datos: dict) -> list[dict]:
    """Secundarios activables (backlog.yaml → escenario 'principales + secundarios'), con los números del catálogo."""
    cat_yaml = yaml.safe_load((RAIZ / "oportunidades" / "catalogo.yaml").read_text(encoding="utf-8"))
    cat = {a["id"]: a for a in cat_yaml["alternativas"]}
    comps = []
    for it in datos["backlog"].get("items", []):
        if not it.get("secundario"):
            continue
        a = cat[it["id"]]
        b = idx(it["desde"])
        ss = a["si_sale"]
        pts = [(0, 0.0), (6, ss["m6"][1]), (12, ss["m12"][1]), (36, ss["m36"][1]), (60, ss["m36"][1] * 1.1)]
        ing = np.zeros(N_MESES)
        for i in range(b, N_MESES):
            rel = i - b
            for k in range(len(pts) - 1):
                if pts[k][0] <= rel <= pts[k + 1][0]:
                    t = (rel - pts[k][0]) / (pts[k + 1][0] - pts[k][0])
                    ing[i] = pts[k][1] + t * (pts[k + 1][1] - pts[k][1])
                    break
        costo = np.zeros(N_MESES)
        costo[b:] = a["costo_mensual"][1]
        fail = np.zeros(N_MESES)
        corte = min(b + a["mes_corte"], N_MESES)
        fail[b:corte] = a["si_no"][1] - a["costo_mensual"][1]
        horas = np.zeros(N_MESES)
        horas[b:min(b + 3, N_MESES)] = a["horas_arranque"]
        horas[min(b + 3, N_MESES):] = a["horas_regimen"]
        comps.append({"id": a["id"], "nombre": it.get("nombre", a["corto"]), "lanzamiento": it["desde"], "p_exito": a["p_exito"],
                      "ingreso": ing, "costo": costo, "neto": ing - costo, "fallo": fail, "malo": 0.4, "bueno": 2.5,
                      "horas": horas, "inversion": a["inversion"][1]})
    return comps


# ─────────────────────────────────────────────── horas ───────────────────────────────────────────────
def horas_proyecto(p: dict) -> np.ndarray:
    h = np.zeros(N_MESES)
    for desde, hasta, v in p.get("horas", []):
        h[idx(desde):idx(hasta) + 1] = v
    return h


# ─────────────────────────────────────────────── costos del holding ───────────────────────────────────────────────
def costos_holding(h: dict) -> tuple[np.ndarray, np.ndarray]:
    fijos = np.zeros(N_MESES)
    for c in h["costos_fijos"]:
        fijos[idx(c["desde"]):idx(c["hasta"]) + 1] += c["usd"]
    unicos = np.zeros(N_MESES)
    for g in h["gastos_unicos"]:
        unicos[idx(g["cuando"])] += g["usd"]
    return fijos, unicos


# ─────────────────────────────────────────────── simulación ───────────────────────────────────────────────
def _tri(rng, lo, mo, hi, n):
    return rng.triangular(lo, mo, hi, n) if hi > lo else np.full(n, mo)


def simular(datos: dict, con_secundarios: bool = False, n: int = N_SIM) -> dict:
    rng = np.random.default_rng(SEMILLA + (1 if con_secundarios else 0))
    h = datos["holding"]
    fijos, unicos = costos_holding(h)
    cap = h["capital"]
    tasa_m = (1 + cap["tasa_renta"]) ** (1 / 12) - 1

    proys = [p for p in datos["proyectos"] if p.get("caso", {}).get("tipo", p.get("tipo")) != "renta"]
    comps_por_proy = {p["id"]: componentes(p) for p in proys}
    if con_secundarios:
        comps_por_proy["SEC"] = componentes_backlog(datos)

    comun = rng.random(n) < FALLO_COMUN
    ejec = rng.lognormal(-SIGMA_EJECUCION ** 2 / 2, SIGMA_EJECUCION, n)   # media 1
    neto_proy = {pid: np.zeros((n, N_MESES)) for pid in comps_por_proy}
    exito_proy = {pid: np.zeros(n, dtype=bool) for pid in comps_por_proy}
    compras = np.zeros((n, N_MESES))
    for pid, comps in comps_por_proy.items():
        for c in comps:
            ok = (rng.random(n) < c["p_exito"]) & ~comun
            f = _tri(rng, c["malo"], 1.0, c["bueno"], n) * ejec
            curvas_ok = np.outer(f, c["ingreso"]) - np.outer(0.5 + 0.5 * f, c["costo"])
            curvas_no = np.tile(c["fallo"], (n, 1))
            neto_proy[pid] += np.where(ok[:, None], curvas_ok, curvas_no)
            exito_proy[pid] |= ok
            if "compra" in c:
                m, precio = c["compra"]
                compras[:, m] += precio

    total_proy = sum(neto_proy.values())
    # regla de ahorro: si a mediados de 2028 los proyectos no cubren los costos fijos, se vuelve a Claude Pro
    fijos_path = np.tile(fijos, (n, 1))
    m_ahorro = idx(AHORRO_CLAUDE[0])
    no_cubre = total_proy[:, m_ahorro] < fijos[m_ahorro]
    fijos_path[no_cubre, m_ahorro:] -= AHORRO_CLAUDE[1]
    # renta: un solo pozo (ahorro inicial + aportes + 50% de la ganancia neta), del que salen compras y gastos únicos
    capital = np.full(n, float(cap["ahorro_inicial"]))
    renta = np.zeros((n, N_MESES))
    disponible = np.zeros((n, N_MESES))
    capital_hist = np.zeros((n, N_MESES))
    for m in range(N_MESES):
        interes = capital * tasa_m
        renta[:, m] = interes
        neto_holding = total_proy[:, m] - fijos_path[:, m]
        aporte = cap["aporte_mensual"] + np.where(neto_holding >= 0, cap["reinversion"] * neto_holding, neto_holding)
        disponible[:, m] = np.where(neto_holding >= 0, (1 - cap["reinversion"]) * neto_holding, 0)
        capital = capital + interes + aporte - unicos[m] - compras[:, m]
        capital_hist[:, m] = capital

    ingreso_total = total_proy + renta - fijos_path     # lo que genera el holding por mes (sin contar tu aporte)
    return {"neto_proy": neto_proy, "exito_proy": exito_proy, "renta": renta, "fijos": fijos, "fijos_path": fijos_path, "unicos": unicos,
            "total_proy": total_proy, "ingreso_total": ingreso_total, "capital": capital_hist, "disponible": disponible,
            "comps": comps_por_proy, "comun": comun}


# ─────────────────────────────────────────────── resúmenes ───────────────────────────────────────────────
def curva_normal_proyecto(p: dict) -> np.ndarray:
    """'Si funciona (normal)'. En carteras: ingreso esperado de los productos condicionado a que al menos uno pegue."""
    comps = componentes(p)
    if not comps:
        return np.zeros(N_MESES)
    if len(comps) == 1:
        return comps[0]["neto"].copy()
    ps = np.array([c["p_exito"] for c in comps])
    p_alguno = 1 - np.prod(1 - ps)
    esperado = sum(c["p_exito"] * c["neto"] for c in comps)
    return esperado / p_alguno


def chances_proyecto(p: dict) -> float:
    comps = componentes(p)
    if not comps:
        return p.get("caso", {}).get("p_exito", 0.85)
    return float(1 - np.prod([1 - c["p_exito"] for c in comps]))


def promedio_anual(serie: np.ndarray) -> dict:
    return {a: float(np.mean(serie[meses_del_anio(a)])) for a in ANIOS}


def resumen(datos: dict) -> dict:
    sim = simular(datos)
    sim2 = simular(datos, con_secundarios=True)
    out = {"sim": sim, "sim2": sim2, "proyectos": [], "horas": {}, "fijos": sim["fijos_path"].mean(axis=0)}
    horas_total = np.zeros(N_MESES)
    for p in datos["proyectos"]:
        tipo = p.get("caso", {}).get("tipo", p.get("tipo"))
        hp = horas_proyecto(p)
        out["horas"][p["id"]] = hp
        horas_total += hp
        if tipo == "renta":
            esperado = sim["renta"].mean(axis=0)
            normal = np.median(sim["renta"], axis=0)
            chances = p["caso"]["p_exito"]
        else:
            esperado = sim["neto_proy"][p["id"]].mean(axis=0)
            normal = curva_normal_proyecto(p)
            chances = chances_proyecto(p)
        out["proyectos"].append({"id": p["id"], "nombre": p["nombre"], "p": p, "tipo": tipo, "esperado": esperado,
                                 "normal": normal, "chances": chances, "esp_anual": promedio_anual(esperado),
                                 "norm_anual": promedio_anual(normal)})
    out["horas_total"] = horas_total
    sec_h = np.zeros(N_MESES)
    for c in sim2["comps"].get("SEC", []):
        sec_h += c["horas"]
    out["horas_sec"] = sec_h
    out["secundarios"] = [{"id": c["id"], "nombre": c["nombre"], "desde": c["lanzamiento"], "p": c["p_exito"],
                           "esperado": None} for c in sim2["comps"].get("SEC", [])]
    if "SEC" in sim2["neto_proy"]:
        sec_esp = sim2["neto_proy"]["SEC"].mean(axis=0)
        out["sec_esperado"] = sec_esp
        out["sec_esp_anual"] = promedio_anual(sec_esp)
        # esperado por secundario (sin fallo común, aproximación p × normal + (1−p) × fallo)
        for s, c in zip(out["secundarios"], sim2["comps"]["SEC"]):
            s["esperado"] = promedio_anual(c["p_exito"] * c["neto"] + (1 - c["p_exito"]) * c["fallo"])
            s["normal"] = promedio_anual(c["neto"])
    tot = sim["ingreso_total"]
    tot2 = sim2["ingreso_total"]
    out["total"] = {"media": tot.mean(axis=0), "p10": np.percentile(tot, 10, axis=0), "p50": np.percentile(tot, 50, axis=0),
                    "p90": np.percentile(tot, 90, axis=0)}
    out["total2"] = {"media": tot2.mean(axis=0), "p10": np.percentile(tot2, 10, axis=0), "p50": np.percentile(tot2, 50, axis=0),
                     "p90": np.percentile(tot2, 90, axis=0)}
    out["total_anual"] = {k: promedio_anual(v) for k, v in out["total"].items()}
    out["total2_anual"] = {k: promedio_anual(v) for k, v in out["total2"].items()}
    # indicadores clave
    m_dic27, m_dic28, m_dic30 = idx("2027-12"), idx("2028-12"), idx("2030-12")
    motores = [p["id"] for p in datos["proyectos"] if p.get("caso", {}).get("tipo", p.get("tipo")) not in ("renta", "activo")]
    alguno = np.zeros(N_SIM, dtype=bool)
    for pid in motores:
        alguno |= sim["exito_proy"][pid]
    out["kpi"] = {
        "p_alguno": float(alguno.mean()),
        "p_cubre_fijos_dic27": float((sim["total_proy"][:, m_dic27] >= sim["fijos"][m_dic27]).mean()),
        "p_cubre_fijos_dic28": float((sim["total_proy"][:, m_dic28] >= sim["fijos"][m_dic28]).mean()),
        "p_ahorro_claude": float((sim["fijos_path"][:, -1] < sim["fijos"][-1]).mean()),
        "p_1000_dic28": float((tot[:, m_dic28] >= 1000).mean()),
        "p_3000_dic30": float((tot[:, m_dic30] >= 3000).mean()),
        "media_dic27": float(tot[:, m_dic27].mean()), "p50_dic27": float(np.median(tot[:, m_dic27])),
        "media_dic28": float(tot[:, m_dic28].mean()), "p50_dic28": float(np.median(tot[:, m_dic28])),
        "media_dic30": float(tot[:, m_dic30].mean()), "p50_dic30": float(np.median(tot[:, m_dic30])),
        "p10_dic30": float(np.percentile(tot[:, m_dic30], 10)), "p90_dic30": float(np.percentile(tot[:, m_dic30], 90)),
        "capital_dic30_p50": float(np.median(sim["capital"][:, m_dic30])),
        "capital_dic30_p10": float(np.percentile(sim["capital"][:, m_dic30], 10)),
        "capital_fin_p50": float(np.median(sim["capital"][:, -1])),
        "acum_36_p10": float(np.percentile(sim["total_proy"][:, :36].sum(axis=1) - sim["fijos"][:36].sum(), 10)),
        "horas_max": float(horas_total.max()), "horas_prom_2027": float(horas_total[meses_del_anio(2027)].mean()),
        "inversion_total": float(sum(p.get("caso", {}).get("inversion", 0) for p in datos["proyectos"])
                                 + sum(g["usd"] for g in datos["holding"]["gastos_unicos"])
                                 + sum(p.get("caso", {}).get("precio_compra", 0) for p in datos["proyectos"])),
    }
    return out


def _u(x: float) -> str:
    return f"{x:,.0f}".replace(",", ".")


def main() -> int:
    datos = cargar()
    r = resumen(datos)
    lin = ["# Resultados del holding (generado por herramientas/holding.py)", "",
           "Ingreso neto mensual promedio de cada año (USD/mes). «Esperado» = promedio de la simulación con chances.", "",
           "| Proyecto | Chances | " + " | ".join(str(a) for a in ANIOS) + " |", "|---|---|" + "---|" * len(ANIOS)]
    for pr in r["proyectos"]:
        lin.append(f"| {pr['id']} {pr['nombre']} | {pr['chances']*100:.0f}% | " +
                   " | ".join(_u(pr["esp_anual"][a]) for a in ANIOS) + " |")
    lin.append("| Costos fijos del holding | — | " + " | ".join(_u(-np.mean(r['fijos'][meses_del_anio(a)])) for a in ANIOS) + " |")
    lin.append("| **Total esperado** | — | " + " | ".join(_u(r['total_anual']['media'][a]) for a in ANIOS) + " |")
    lin += ["", "Si funciona (escenario normal), USD/mes promedio del año:", "",
            "| Proyecto | " + " | ".join(str(a) for a in ANIOS) + " |", "|---|" + "---|" * len(ANIOS)]
    for pr in r["proyectos"]:
        lin.append(f"| {pr['id']} {pr['nombre']} | " + " | ".join(_u(pr["norm_anual"][a]) for a in ANIOS) + " |")
    lin += ["", "Indicadores:", ""] + [f"- {k}: {v*100:.0f}%" if k.startswith("p_") else f"- {k}: {_u(v)}"
                                        for k, v in r["kpi"].items()]
    lin += ["", "Total con secundarios (media): " + " · ".join(f"{a}: {_u(r['total2_anual']['media'][a])}" for a in ANIOS)]
    (RAIZ / "cartera" / "holding-resultados.md").write_text("\n".join(lin) + "\n", encoding="utf-8")
    print("\n".join(lin))
    return 0


if __name__ == "__main__":
    sys.exit(main())
