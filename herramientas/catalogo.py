#!/usr/bin/env python3
"""Catálogo de alternativas: puntaje, simulación de plata a corto/mediano/largo plazo y tabla generada.

Lee oportunidades/catalogo.yaml y, para cada alternativa con números:
  * calcula el puntaje de conveniencia (0–100) con criterios en lenguaje simple;
  * simula 60 meses (Monte Carlo): si funciona (malo/normal/bueno) o si no funciona (y se corta);
  * resume plata esperada a 6, 12, 36 y 60 meses, plata acumulada y dólares por hora tuya.

Uso:
  python3 herramientas/catalogo.py              # imprime el ranking
  python3 herramientas/catalogo.py --md         # regenera oportunidades/CATALOGO.md
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
import yaml

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "oportunidades" / "catalogo.yaml"
SALIDA_MD = RAIZ / "oportunidades" / "CATALOGO.md"
MESES = 60
N = 4000

# Lo que el fundador pidió priorizar (26-09-2026): plata, pocas horas, chances, diversión/encaje, sin vender, IA, velocidad.
CRITERIOS = {
    "plata": {"peso": 20, "nombre": "Plata si sale bien", "guia": "Ingreso mensual a 3 años en el escenario normal"},
    "horas": {"peso": 15, "nombre": "Pocas horas tuyas", "guia": "Horas por semana (pesa más el régimen que el arranque)"},
    "probabilidad": {"peso": 15, "nombre": "Chances de que salga", "guia": "Probabilidad estimada de que funcione"},
    "encaje": {"peso": 15, "nombre": "Divertido y a tu medida", "guia": "Te divierte, usa tus redes, tu conocimiento y respeta el anonimato"},
    "sin_venta": {"peso": 10, "nombre": "Sin vender cara a cara", "guia": "La demanda llega sola o la trae una plataforma"},
    "ia": {"peso": 10, "nombre": "Lo hace la IA", "guia": "Qué parte del trabajo puede hacer Claude"},
    "velocidad": {"peso": 10, "nombre": "Plata rápido", "guia": "Meses hasta el primer ingreso"},
    "inversion": {"peso": 5, "nombre": "Poca inversión", "guia": "Plata que hay que poner al inicio"},
}
VEREDICTOS = {
    "hacer_ya": "Hacer ya",
    "plan": "En el plan",
    "segunda_ola": "Segunda ola",
    "solo_si": "Solo si…",
    "no": "Así no",
    "palanca": "Palanca aparte",
    "pausa": "En pausa",
}


def _escala(valor: float, cortes: list[float], ascendente: bool = True) -> int:
    """Convierte un valor en puntaje 1–5 según cortes (4 cortes → 5 tramos)."""
    tramo = sum(valor >= c for c in cortes) if ascendente else sum(valor <= c for c in cortes)
    return int(1 + tramo) if ascendente else int(1 + tramo)


def puntajes(a: dict) -> dict:
    if "si_sale" not in a:
        return {}
    normal_m36 = a["si_sale"]["m36"][1]
    h = 0.3 * a["horas_arranque"] + 0.7 * a["horas_regimen"]
    p = {
        "plata": _escala(normal_m36, [100, 300, 1000, 3000]),
        "probabilidad": _escala(a["p_exito"], [0.10, 0.20, 0.35, 0.60]),
        "horas": 6 - _escala(h, [1.01, 2.01, 4.01, 7.01]),
        "velocidad": 6 - _escala(a["meses_primer_ingreso"], [1.5, 3.5, 6.5, 12.5]),
        "inversion": 6 - _escala(a["inversion"][1], [100.5, 500.5, 2000.5, 5000.5]),
        "ia": a["ia"],
        "sin_venta": a["sin_venta"],
        "encaje": a["encaje"],
    }
    return p


def puntaje_total(p: dict) -> float:
    if not p:
        return float("nan")
    total = sum(CRITERIOS[k]["peso"] for k in CRITERIOS)
    return sum(p[k] * CRITERIOS[k]["peso"] for k in CRITERIOS) / total * 20


def _tri_q(r, u):
    """Cuantil u de una triangular [a, c, b] (vectorizado): mismo u en todos los hitos = trayectoria coherente."""
    a, c, b = (float(x) for x in r)
    if b <= a:
        return np.full_like(u, a)
    fc = (c - a) / (b - a)
    return np.where(u < fc, a + np.sqrt(u * (b - a) * (c - a)), b - np.sqrt((1 - u) * (b - a) * (b - c)))


def simular(a: dict, n: int = N, semilla: int = 11) -> dict | None:
    if "si_sale" not in a:
        return None
    rng = np.random.default_rng(semilla + sum(ord(c) for c in a["id"]))
    meses = np.arange(MESES + 1)
    exito = rng.random(n) < a["p_exito"]
    u = rng.random(n)
    ss = a["si_sale"]
    hitos_m = [6, 12, 36]
    hitos_v = np.stack([_tri_q(ss[f"m{m}"], u) for m in hitos_m], axis=1)
    crec60 = rng.triangular(0.7, 1.1, 1.5, n)
    v60 = hitos_v[:, 2] * crec60
    xs = np.array([0] + hitos_m + [60], dtype=float)
    inicio = a["meses_primer_ingreso"]
    ingreso_ok = np.zeros((n, MESES + 1))
    for i in range(n):
        ys = np.array([0.0, hitos_v[i, 0], hitos_v[i, 1], hitos_v[i, 2], v60[i]])
        ingreso_ok[i] = np.interp(meses, xs, ys)
    ingreso_ok[:, meses < inicio] = 0.0
    si_no = rng.triangular(*a["si_no"], n) if a["si_no"][2] > a["si_no"][0] else np.full(n, float(a["si_no"][0]))
    corte = int(a["mes_corte"])
    ingreso_no = np.where((meses >= inicio) & (meses <= corte), 1.0, 0.0)[None, :] * si_no[:, None]
    costo = rng.triangular(*a["costo_mensual"], n) if a["costo_mensual"][2] > a["costo_mensual"][0] else np.full(n, float(a["costo_mensual"][0]))
    activo_no = (meses >= 1) & (meses <= corte)
    costo_ok = np.where(meses >= 1, 1.0, 0.0)[None, :] * costo[:, None]
    costo_no = activo_no[None, :] * costo[:, None]
    neto = np.where(exito[:, None], ingreso_ok - costo_ok, ingreso_no - costo_no)
    inversion = rng.triangular(*a["inversion"], n) if a["inversion"][2] > a["inversion"][0] else np.full(n, float(a["inversion"][0]))
    acumulado = np.cumsum(neto, axis=1) - inversion[:, None]
    # activos comprados (app, moto, cochera): lo que se conserva cuenta a partir del mes 36
    vr = a.get("valor_residual")
    if vr:
        residual = np.where(exito, vr[0], vr[1]) * inversion
        acumulado[:, 36:] += residual[:, None]

    semanas_36 = 36 * 52 / 12
    h_arr, h_reg = a["horas_arranque"], a["horas_regimen"]
    horas_ok = 13 * h_arr + (semanas_36 - 13) * h_reg
    sem_corte = min(corte, 36) * 52 / 12
    horas_no = 13 * h_arr + max(sem_corte - 13, 0) * h_reg
    horas_esp = a["p_exito"] * horas_ok + (1 - a["p_exito"]) * horas_no

    def pct(m, q, mask=None):
        v = neto[:, m] if mask is None else neto[mask, m]
        return float(np.percentile(v, q)) if len(v) else 0.0

    curvas = {
        "no_funciona": np.median(ingreso_no - costo_no, axis=0),
        "normal": np.median((ingreso_ok - costo_ok)[exito], axis=0) if exito.any() else np.zeros(MESES + 1),
        "muy_bien": np.percentile((ingreso_ok - costo_ok)[exito], 90, axis=0) if exito.any() else np.zeros(MESES + 1),
        "esperado": neto.mean(axis=0),
    }
    return {
        "neto": neto,
        "exito": exito,
        "inversion": inversion,
        "residual": (np.where(exito, vr[0], vr[1]) * inversion) if vr else np.zeros(n),
        "curvas": curvas,
        "esperado": {m: float(neto[:, m].mean()) for m in (6, 12, 36, 60)},
        "normal_si_sale": {m: pct(m, 50, exito) for m in (6, 12, 36, 60)},
        "acumulado_esperado": {m: float(acumulado[:, m].mean()) for m in (12, 36, 60)},
        "p_acumulado_36_positivo": float(np.mean(acumulado[:, 36] > 0)),
        "horas_36": horas_esp,
        "usd_por_hora": float(acumulado[:, 36].mean() / horas_esp) if horas_esp > 0 else float("nan"),
        "inversion_media": float(inversion.mean()),
    }


def cargar() -> dict:
    datos = yaml.safe_load(CATALOGO.read_text(encoding="utf-8"))
    for a in datos["alternativas"]:
        a["_p"] = puntajes(a)
        a["_puntaje"] = puntaje_total(a["_p"])
        a["_sim"] = simular(a)
        a["_h"] = (0.3 * a["horas_arranque"] + 0.7 * a["horas_regimen"]) if "horas_regimen" in a else None
    return datos


def simular_plan(datos: dict, opcionales: bool = False) -> dict:
    """Suma los motores del plan (independientes) con su mes de inicio, menos los costos fijos compartidos."""
    plan = datos["plan"]
    por_id = {a["id"]: a for a in datos["alternativas"]}
    comps = list(plan["componentes"]) + (list(plan.get("opcionales", [])) if opcionales else [])
    total = np.zeros((N, MESES + 1))
    inv_total = np.zeros(N)
    residual = np.zeros(N)
    medias = {}
    rng = np.random.default_rng(29)
    # factor común: si falta tiempo o energía, fallan juntos los proyectos a construir (no son apuestas independientes)
    comun = rng.random(N) < float(plan.get("fallo_comun", 0))
    n_exitos = np.zeros(N, dtype=int)
    for c in comps:
        s = por_id[c["id"]]["_sim"]
        k = int(c["inicio"])
        neto = s["neto"].copy()
        ok = s["exito"].copy()
        if c.get("construir") and comun.any() and (~s["exito"]).any():
            fallidos = np.where(~s["exito"])[0]
            idx = np.where(comun)[0]
            neto[idx] = s["neto"][rng.choice(fallidos, size=len(idx))]
            ok[idx] = False
        if c.get("construir"):
            n_exitos += ok.astype(int)
        desplazado = np.zeros_like(neto)
        desplazado[:, k:] = neto[:, : MESES + 1 - k]
        total += desplazado
        inv_total += s["inversion"]
        residual += s["residual"]
        medias[c["id"]] = desplazado.mean(axis=0)
    fijos = float(plan.get("costos_fijos_mensuales", 0))
    total[:, 1:] -= fijos
    acumulado = np.cumsum(total, axis=1) - inv_total[:, None]
    acumulado[:, 36:] += residual[:, None]
    # referencia: todo el aporte (USD 400/mes) a la renta al 6,5% anual
    r = 0.065 / 12
    cap, ref = 0.0, np.zeros(MESES + 1)
    for t in range(1, MESES + 1):
        ref[t] = cap * r
        cap += 400 + ref[t]
    horas = {}
    for c in comps:
        a = por_id[c["id"]]
        k = int(c["inicio"])
        h = np.zeros(MESES + 1)
        for t in range(MESES + 1):
            if t < k:
                continue
            h[t] = a["horas_arranque"] if t < k + 3 else a["horas_regimen"]
        horas[c["id"]] = h
    grupos = {}
    for nombre, mask in (("ninguno", n_exitos == 0), ("uno", n_exitos == 1), ("dos_o_mas", n_exitos >= 2)):
        grupos[nombre] = {
            "prob": float(mask.mean()),
            "mediana": np.median(total[mask], axis=0) if mask.any() else np.zeros(MESES + 1),
            "acumulado_36": float(np.median(acumulado[mask, 36])) if mask.any() else 0.0,
        }
    return {
        "grupos": grupos,
        "n_exitos": n_exitos,
        "horas": horas,
        "componentes": comps,
        "medias": medias,
        "fijos": fijos,
        "total": total,
        "p10": np.percentile(total, 10, axis=0),
        "p50": np.percentile(total, 50, axis=0),
        "p90": np.percentile(total, 90, axis=0),
        "media": total.mean(axis=0),
        "acumulado": acumulado,
        "solo_renta": ref,
        "p_supera_400": {m: float(np.mean(total[:, m] >= 400)) for m in (12, 24, 36, 60)},
    }


def _u(x: float) -> str:
    return f"{x:,.0f}".replace(",", ".")


def tabla_md(datos: dict) -> str:
    fam = datos["familias"]
    alts = sorted(datos["alternativas"], key=lambda a: (-(a["_puntaje"] if a["_puntaje"] == a["_puntaje"] else -1)))
    filas = [
        "| # | ID | Alternativa | Familia | Veredicto | Puntaje | h/sem | Inversión | 1er ingreso | Chances | Normal si sale m6 / m12 / m36 (USD/mes) | Esperado m36 | USD por hora (3 años) |",
        "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    i = 0
    for a in alts:
        s = a["_sim"]
        if s is None:
            continue
        i += 1
        ns = s["normal_si_sale"]
        filas.append(
            f"| {i} | {a['id']} | {a['nombre']} | {fam[a['familia']]['nombre']} | {VEREDICTOS[a['veredicto']]} | {a['_puntaje']:.0f} | "
            f"{a['_h']:.1f} | {_u(a['inversion'][1])} | mes {a['meses_primer_ingreso']} | {a['p_exito']*100:.0f}% | "
            f"{_u(ns[6])} / {_u(ns[12])} / {_u(ns[36])} | {_u(s['esperado'][36])} | {s['usd_por_hora']:.1f} |"
        )
    sin_num = [a for a in datos["alternativas"] if a["_sim"] is None]
    filas += ["", "## Trampas y alternativas en pausa", "",
              "| ID | Alternativa | Veredicto | Por qué | En su lugar / se reactiva si |", "|---|---|---|---|---|"]
    for a in sin_num:
        ver = "Trampa" if a["familia"] == "trampa" else VEREDICTOS[a["veredicto"]]
        alt = f"ver {a['en_su_lugar']}" if a.get("en_su_lugar") else a.get("revive", a.get("mejor_version", ""))
        filas.append(f"| {a['id']} | {a['nombre']} | {ver} | {a.get('por_que', '')} | {alt} |")
    return "\n".join(filas)


def ideas_md(datos: dict) -> str:
    """Cada ejemplo del fundador: qué entendimos, el espectro que abrimos y la mejor versión."""
    filas = ["| Tu idea (reformulada) | Qué entendimos | Espectro que abrimos | La mejor versión | Veredicto |",
             "|---|---|---|---|---|"]
    for i in datos.get("ideas", []):
        filas.append(f"| {i['tema']} | {i['entendimos']} | {', '.join(i['espectro'])} | {i['mejor']} | {i['veredicto']} |")
    return "\n".join(filas)


def rutas_md(datos: dict) -> str:
    """Roadmap de 26 semanas de cada alternativa (o de su mejor versión)."""
    quien = {"claude": "Claude", "vos": "Vos", "ambos": "Juntos"}
    out = []
    for a in datos["alternativas"]:
        pasos = a.get("ruta") or [[t, d, h, q, ""] for t, q, d, h in a.get("gantt", [])]
        if not pasos and not a.get("revive") and not a.get("en_su_lugar"):
            continue
        titulo = f"### {a['id']} · {a.get('corto', a['nombre'])} — {VEREDICTOS[a['veredicto']] if a['familia'] != 'trampa' else 'Trampa'}"
        out += [titulo, ""]
        if a["veredicto"] == "no" and a.get("ruta"):
            out.append(f"Roadmap de la mejor versión: {a.get('mejor_version', '')}")
            out.append("")
        for t, d, h, q, txt in pasos:
            sem = f"S{d}" if d == h else f"S{d}–{h}"
            out.append(f"- **{sem} · {t}** ({quien[q]}){': ' + txt if txt else ''}")
        if a.get("corte"):
            out.append(f"- ✂️ Corte: {a['corte']}")
        if a.get("en_su_lugar"):
            out.append(f"- En su lugar: ver {a['en_su_lugar']}.")
        if a.get("revive"):
            out.append(f"- Se reactiva si: {a['revive']}")
        out.append("")
    return "\n".join(out)


def escribir_md(datos: dict) -> None:
    pesos = " · ".join(f"{c['nombre']} {c['peso']}%" for c in CRITERIOS.values())
    texto = "\n".join([
        "# Catálogo de alternativas",
        "",
        "> Generado por `python3 herramientas/catalogo.py --md` desde `oportunidades/catalogo.yaml`. **No editar a mano.**",
        f"> Puntaje 0–100 = {pesos}. \"Normal si sale\" = mediana de las simulaciones en las que funciona;",
        "> \"Esperado\" = promedio ponderando éxito y fracaso (neto de costos). USD por hora = plata acumulada esperada a 36 meses",
        "> (neta de inversión y costos) dividida por las horas esperadas.",
        "",
        tabla_md(datos),
        "",
        "## Tus ideas → qué entendimos y qué espectro abrimos",
        "",
        ideas_md(datos),
        "",
        "## Roadmaps (primeras 26 semanas)",
        "",
        rutas_md(datos),
        "",
    ])
    SALIDA_MD.write_text(texto, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--md", action="store_true")
    args = ap.parse_args()
    datos = cargar()
    if args.md:
        escribir_md(datos)
        print("Escrito", SALIDA_MD)
    alts = [a for a in datos["alternativas"] if a["_sim"] is not None]
    alts.sort(key=lambda a: -a["_puntaje"])
    for a in alts:
        s = a["_sim"]
        print(f"{a['id']:4} {a['_puntaje']:5.1f} {a['veredicto']:12} h={a['_h']:.1f} p={a['p_exito']:.2f} "
              f"esp m12={s['esperado'][12]:7.0f} m36={s['esperado'][36]:7.0f} acum36={s['acumulado_esperado'][36]:8.0f} "
              f"usd/h={s['usd_por_hora']:6.1f}  {a['corto']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
