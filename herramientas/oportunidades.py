#!/usr/bin/env python3
"""Tablero de oportunidades: valida fichas, calcula puntaje e IVR y regenera TABLERO.md.

Uso:
  python3 herramientas/oportunidades.py            # valida y escribe TABLERO.md
  python3 herramientas/oportunidades.py --json     # imprime los datos calculados en JSON
  python3 herramientas/oportunidades.py --check    # solo valida (código de salida 1 si hay errores)

Cada ficha es oportunidades/OP-XX-*.md con frontmatter YAML según oportunidades/_plantilla.md.
Metodología: doctrina/01-marco-de-evaluacion.md
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
DIR_OP = RAIZ / "oportunidades"
CONFIG = yaml.safe_load((RAIZ / "herramientas" / "config.yaml").read_text(encoding="utf-8"))

CAMPOS_OBLIGATORIOS = [
    "id", "titulo", "estado", "rol", "resumen", "fecha_alta", "fecha_revision", "capital", "horas_semana",
    "ia_ejecutable_pct", "puntajes", "gates", "escenarios_36m", "multiplo_terminal_meses", "proximo_paso",
]
GATES = ["problema_pagado", "distribucion", "economia", "experimento_barato", "downside_acotado", "legal"]


def leer_frontmatter(ruta: Path) -> dict | None:
    texto = ruta.read_text(encoding="utf-8")
    if not texto.startswith("---"):
        return None
    partes = texto.split("---", 2)
    if len(partes) < 3:
        return None
    datos = yaml.safe_load(partes[1]) or {}
    # YAML 1.1 interpreta "no"/"si" de forma inconsistente (no → False): normalizar los gates a texto.
    if isinstance(datos.get("gates"), dict):
        datos["gates"] = {
            k: ("si" if v is True else "no" if v is False else v) for k, v in datos["gates"].items()
        }
    datos["_archivo"] = ruta.name
    return datos


def puntaje(p: dict) -> float:
    pesos = CONFIG["pesos"]
    total = sum(pesos.values())
    return sum(pesos[k] * float(p.get(k, 0)) / 5 for k in pesos) * 100 / total


def ivr(op: dict) -> dict:
    """Índice de Valor por Recurso (ver doctrina/01, sección 5)."""
    esc = op["escenarios_36m"]
    # Con rampa (unidades operativas) el flujo acumulado ≈ horizonte/2 meses de régimen; sin rampa (activos financieros)
    # el flujo corre desde el mes 1.
    meses_acum = CONFIG["horizonte_meses"] / 2 if op.get("rampa", True) else CONFIG["horizonte_meses"]
    mult = float(op["multiplo_terminal_meses"]) + meses_acum
    ve = 0.0
    flujo_esperado = 0.0
    prob_total = 0.0
    for nombre, e in esc.items():
        p = float(e["prob"])
        prob_total += p
        f = float(e.get("flujo_mensual", 0))
        flujo_esperado += p * f
        if nombre == "fracaso":
            ve -= p * float(e.get("capital_perdido_usd", 0))
        else:
            ve += p * f * mult
    cap = float(op["capital"].get("optimo_usd", 0))
    horas = float(op.get("horas_semana", 0)) * 52 * CONFIG["horizonte_meses"] / 12
    recurso = cap + horas * CONFIG["tarifa_sombra_usd_hora"]
    # Valor creado neto = valor bruto al mes 36 (caja acumulada + valor terminal) − capital invertido.
    neto = ve - cap
    return {
        "valor_esperado": ve,
        "valor_neto": neto,
        "flujo_esperado_m36": flujo_esperado,
        "recurso": recurso,
        "ivr": neto / recurso if recurso else 0.0,
        "prob_total": prob_total,
    }


def validar(op: dict) -> list[str]:
    errores = []
    for c in CAMPOS_OBLIGATORIOS:
        if c not in op:
            errores.append(f"falta '{c}'")
    if errores:
        return errores
    if op["estado"] not in CONFIG["estados"]:
        errores.append(f"estado inválido '{op['estado']}'")
    if op["rol"] not in CONFIG["roles_validos"]:
        errores.append(f"rol inválido '{op['rol']}'")
    for k in CONFIG["pesos"]:
        v = op["puntajes"].get(k)
        if v is None or not 0 <= float(v) <= 5:
            errores.append(f"puntaje '{k}' ausente o fuera de 0–5")
    for g in GATES:
        if op["gates"].get(g) not in ("si", "no", "pendiente"):
            errores.append(f"gate '{g}' debe ser si/no/pendiente")
    pt = sum(float(e["prob"]) for e in op["escenarios_36m"].values())
    if abs(pt - 1) > 0.01:
        errores.append(f"las probabilidades de escenarios suman {pt:.2f} (deben sumar 1)")
    if op["estado"] in ("validar", "construir", "escalar") and any(op["gates"].get(g) == "no" for g in GATES):
        errores.append("estado avanzado con un gate en 'no'")
    return errores


def cargar() -> list[dict]:
    ops = []
    for ruta in sorted(DIR_OP.glob("OP-*.md")):
        op = leer_frontmatter(ruta)
        if op is None:
            continue
        op["_errores"] = validar(op)
        if not op["_errores"]:
            op["_puntaje"] = puntaje(op["puntajes"])
            op.update({f"_{k}": v for k, v in ivr(op).items()})
            rev = op["fecha_revision"]
            rev = rev if isinstance(rev, dt.date) else dt.date.fromisoformat(str(rev))
            op["_vencida"] = (dt.date.today() - rev).days > CONFIG["dias_vencimiento"]
            op["_gates_ok"] = sum(1 for g in GATES if op["gates"].get(g) == "si")
        ops.append(op)
    return ops


def _usd(x: float) -> str:
    return f"{x:,.0f}".replace(",", ".")


def tablero(ops: list[dict]) -> str:
    validas = [o for o in ops if not o["_errores"]]
    orden = {e: i for i, e in enumerate(CONFIG["estados"])}
    validas.sort(key=lambda o: (orden.get(o["estado"], 99), -o["_ivr"]))
    hoy = dt.date.today().isoformat()
    L = [
        "# Tablero de oportunidades",
        "",
        f"> Generado por `python3 herramientas/oportunidades.py` el {hoy}. **No editar a mano.**",
        "> Puntaje 0–100 (scorecard ponderado). IVR = (valor esperado al mes 36 − capital óptimo) / recurso,",
        "> con recurso = capital óptimo + horas del fundador × tarifa sombra. La tesorería (OP-09) marca el piso.",
        f"> Referencias: puntaje ≥ {CONFIG['umbral_puntaje_prioridad']} = prioridad; IVR ≥ {CONFIG['umbral_ivr_minimo']} en unidades "
        "operativas; en activos intensivos en capital, IVR ≥ 2× el de la tesorería.",
        "",
        "## Pipeline",
        "",
    ]
    conteo = {}
    for o in validas:
        conteo[o["estado"]] = conteo.get(o["estado"], 0) + 1
    L.append(" · ".join(f"**{e}**: {conteo.get(e, 0)}" for e in CONFIG["estados"] if conteo.get(e)))
    L += [
        "",
        "## Ranking",
        "",
        "| ID | Oportunidad | Estado | Rol | Puntaje | IVR | Valor neto esperado (USD) | Flujo esperado m36 (USD/mes) | Capital óptimo | h/sem | IA % | Gates | Próximo paso |",
        "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for o in validas:
        alerta = " ⚠ vencida" if o["_vencida"] else ""
        L.append(
            f"| [{o['id']}](oportunidades/{o['_archivo']}) | {o['titulo']} | {o['estado']}{alerta} | {o['rol']} | "
            f"{o['_puntaje']:.0f} | {o['_ivr']:.2f} | {_usd(o['_valor_neto'])} | {_usd(o['_flujo_esperado_m36'])} | "
            f"{_usd(float(o['capital'].get('optimo_usd', 0)))} | {o['horas_semana']} | {o['ia_ejecutable_pct']} | "
            f"{o['_gates_ok']}/6 | {o['proximo_paso']} |"
        )
    L += ["", "## Detalle del scorecard", ""]
    dims = list(CONFIG["pesos"].keys())
    L.append("| ID | " + " | ".join(dims) + " |")
    L.append("|---|" + "---|" * len(dims))
    for o in validas:
        L.append(f"| {o['id']} | " + " | ".join(str(o["puntajes"][d]) for d in dims) + " |")
    L += ["", "## Tramos de capital (USD)", "", "| ID | Mínimo | Óptimo | Acelerado | Máximo razonable | Mensual |", "|---|---|---|---|---|---|"]
    for o in validas:
        c = o["capital"]
        L.append(
            f"| {o['id']} | {_usd(c.get('minimo_usd', 0))} | {_usd(c.get('optimo_usd', 0))} | {_usd(c.get('acelerado_usd', 0))} | "
            f"{_usd(c.get('maximo_razonable_usd', 0))} | {_usd(c.get('mensual_usd', 0))} |"
        )
    invalidas = [o for o in ops if o["_errores"]]
    if invalidas:
        L += ["", "## Fichas con errores", ""]
        for o in invalidas:
            L.append(f"- `{o['_archivo']}`: " + "; ".join(o["_errores"]))
    return "\n".join(L) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    ops = cargar()
    errores = [o for o in ops if o["_errores"]]
    if args.check:
        for o in errores:
            print(f"ERROR {o['_archivo']}: " + "; ".join(o["_errores"]))
        return 1 if errores else 0
    if args.json:
        limpio = [{k: v for k, v in o.items()} for o in ops]
        print(json.dumps(limpio, ensure_ascii=False, indent=2, default=str))
        return 0
    (RAIZ / "TABLERO.md").write_text(tablero(ops), encoding="utf-8")
    print(f"TABLERO.md actualizado ({len(ops)} fichas, {len(errores)} con errores)")
    for o in errores:
        print(f"  ERROR {o['_archivo']}: " + "; ".join(o["_errores"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
