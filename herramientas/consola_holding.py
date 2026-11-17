#!/usr/bin/env python3
"""Consola del Holding (versión 2): convierte cartera/consola.yaml y las fichas de proyecto en la página que se publica.

Uso:
  python3 herramientas/consola_holding.py            # escribe informes/consola-holding.html

Qué junta:
  - cartera/consola.yaml: la capa de gestión (estado, prioridad, foco, plataformas, camino, próximos, pendientes, novedades).
  - oportunidades/proyectos/P*.yaml (campo `ficha`): lema, gantt, hitos y horas; con herramientas/holding.py, el caso
    «si funciona» y las chances (ESTIMACIONES con los supuestos de cada ficha).
  - oportunidades/proyectos/_ideas_nuevas.yaml, oportunidades/backlog.yaml, oportunidades/OP-*.md y descartadas.md: la fila de ideas.

La página guarda lo que marca el fundador en la base del artefacto: `marcas/<id>` (pendientes y próximos hechos, ideas que le
interesan) y `notas/<proyecto>`. Claude las lee al empezar cada sesión (ArtifactData).
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "cartera" / "consola.yaml"
SALIDA = RAIZ / "informes" / "consola-holding.html"
DIR_PROY = RAIZ / "oportunidades" / "proyectos"
DESDE, HASTA = "2026-11", "2028-06"   # ventana de la línea de tiempo y de las horas

PALETA = ["#0a6b52", "#3a6fd8", "#b7791f", "#6d5bd0", "#c2410c", "#0e7490", "#be185d", "#4d7c0f", "#7c2d12", "#475569"]


def meses(desde: str, hasta: str) -> list[str]:
    a, m = map(int, desde.split("-")); b, n = map(int, hasta.split("-"))
    out = []
    while (a, m) <= (b, n):
        out.append(f"{a:04d}-{m:02d}"); m += 1
        if m == 13: a, m = a + 1, 1
    return out


def slug(t: str, n: int = 36) -> str:
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:n].strip("-")


def ym(x) -> str:
    return str(x)[:7]


def leer_fichas() -> dict:
    fichas = {}
    for f in sorted(DIR_PROY.glob("P*.yaml")):
        fichas[f.name] = yaml.safe_load(f.read_text(encoding="utf-8"))
    return fichas


def modelo(fichas: dict) -> dict:
    """Horas por mes y caso «si funciona» con el motor del holding. Si falta numpy, la consola sale sin esos números."""
    try:
        sys.path.insert(0, str(RAIZ / "herramientas"))
        import holding as H  # noqa: E402
    except Exception as e:  # pragma: no cover
        print(f"aviso: sin modelo del holding ({e}); la consola sale sin horas ni casos", file=sys.stderr)
        return {}
    out, ventana = {}, meses(DESDE, HASTA)
    for nombre, p in fichas.items():
        try:
            h = H.horas_proyecto(p); c = H.curva_normal_proyecto(p)
            out[nombre] = {
                "horas": [round(float(h[H.idx(m)]), 2) for m in ventana],
                "caso": {k: round(float(c[H.idx(k)])) for k in ("2027-12", "2028-12", "2030-12")},
                "chances": round(float(H.chances_proyecto(p)), 2),
            }
        except Exception as e:  # una ficha rara no tumba la consola
            print(f"aviso: {nombre}: {e}", file=sys.stderr)
    return out


def ideas() -> dict:
    nuevas = yaml.safe_load((DIR_PROY / "_ideas_nuevas.yaml").read_text(encoding="utf-8")).get("nuevas", [])
    back = yaml.safe_load((RAIZ / "oportunidades" / "backlog.yaml").read_text(encoding="utf-8")).get("items", [])
    ops = []
    for f in sorted((RAIZ / "oportunidades").glob("OP-*.md")):
        t = f.read_text(encoding="utf-8")
        if t.startswith("---"):
            fm = yaml.safe_load(t.split("---")[1]) or {}
            ops.append({"id": fm.get("id"), "titulo": fm.get("titulo"), "estado": fm.get("estado"), "rol": fm.get("rol"),
                        "resumen": str(fm.get("resumen") or "")[:220], "proximo": str(fm.get("proximo_paso") or "")[:200]})
    desc = (RAIZ / "oportunidades" / "descartadas.md").read_text(encoding="utf-8")
    return {
        "nuevas": [{"id": x.get("n"), "nombre": x.get("idea"), "va": x.get("va"), "viene": x.get("viene")} for x in nuevas],
        "backlog": [{"id": x.get("id"), "nombre": x.get("nombre"), "destino": x.get("destino"), "prioridad": x.get("prioridad"),
                     "viable": x.get("viable"), "activa": x.get("activa")} for x in back],
        "oportunidades": ops,
        "cementerio": len(re.findall(r"^\| K\d+", desc, re.M)),
    }


def armar() -> dict:
    datos = yaml.safe_load(FUENTE.read_text(encoding="utf-8"))
    fichas = leer_fichas(); mod = modelo(fichas)
    ids = [p["id"] for p in datos["proyectos"]]
    if len(ids) != len(set(ids)):
        raise SystemExit("hay ids de proyecto repetidos")
    grupos = {g["id"] for g in datos.get("grupos", [])}
    for x in datos["pendientes"]:
        if x["proyecto"] not in ids:
            raise SystemExit(f"pendiente {x['id']}: proyecto {x['proyecto']} no existe")
    for i, p in enumerate(datos["proyectos"]):
        if p["etapa"] not in datos["etapas"]:
            raise SystemExit(f"{p['id']}: etapa {p['etapa']} no está en la lista")
        if p.get("grupo") not in grupos:
            raise SystemExit(f"{p['id']}: grupo {p.get('grupo')} no existe")
        f = fichas.get(p.get("ficha") or "")
        if p.get("ficha") and f is None:
            raise SystemExit(f"{p['id']}: no existe la ficha {p['ficha']}")
        p["color"] = (f or {}).get("color") or p.get("color") or PALETA[i % len(PALETA)]
        p["hito"]["fecha"] = str(p["hito"]["fecha"])
        vistos = set()
        for x in p.get("proximos", []):
            base = f"px-{p['id'].lower()}-{slug(x['que'])}"; k, n = base, 2
            while k in vistos: k, n = f"{base}-{n}", n + 1
            vistos.add(k); x.setdefault("id", k)
        if f:
            p["lema"] = f.get("lema"); p["una_frase"] = f.get("una_frase")
            p["gantt"] = [{"que": g[0], "desde": ym(g[1]), "hasta": ym(g[2]), "quien": g[3] if len(g) > 3 else ""} for g in f.get("gantt", [])]
            p["hitos_ficha"] = [{"fecha": ym(h[0]), "que": h[1]} for h in f.get("hitos", [])]
            p["cortes_ficha"] = f.get("cortes", [])
            if p["ficha"] in mod:
                p.update(mod[p["ficha"]])
            if (f.get("caso") or {}).get("tipo", f.get("tipo")) == "renta":   # la renta no es ingreso operativo: sin caso «si funciona»
                p.pop("caso", None); p.pop("chances", None)
        if not p.get("camino") and p.get("gantt"):   # sin camino propio: el gantt de la ficha hace de camino
            hoy = date.today().isoformat()[:7]
            p["camino"] = [{"fase": g["que"], "cuando": f"{g['desde']} → {g['hasta']}",
                            "estado": "hecho" if g["hasta"] < hoy else "en_curso" if g["desde"] <= hoy else "despues", "que": ""}
                           for g in p["gantt"][:8]]
    datos["ventana"] = meses(DESDE, HASTA)
    datos["ideas"] = ideas()
    h = yaml.safe_load((DIR_PROY / "_holding.yaml").read_text(encoding="utf-8"))
    datos["capital"] = {**(h.get("capital") or {}), "reglas": h.get("reglas", [])}
    return datos


PAGINA = r"""<title>Consola del Holding</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* Tablero de gestión de un holding chico: panorama, un proyecto por vez, lo que te toca, lo que viene, ideas y horas. */
:root {
  --fondo: #f3f5f4; --sup: #ffffff; --sup2: #e9eeec; --tinta: #14201c; --tenue: #5b6a64; --linea: #d5ddd9;
  --acento: #0a6b52; --acento-t: #ffffff; --verde: #0f7a4d; --ambar: #a15c00; --rojo: #b3261e; --gris: #6b7772; --azul: #2f5fc4;
  --verde-f: #dcf0e5; --ambar-f: #f9ead2; --rojo-f: #f8dedb; --gris-f: #e6eae8; --azul-f: #e1e9fb;
  --cuerpo: "IBM Plex Sans", system-ui, sans-serif; --titulo: "IBM Plex Sans Condensed", "IBM Plex Sans", system-ui, sans-serif;
  --dato: "IBM Plex Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --fondo: #0f1614; --sup: #17201d; --sup2: #1f2a26; --tinta: #e8efec; --tenue: #9aa9a3; --linea: #2b3833;
  --acento: #4fc39f; --acento-t: #06231a; --verde: #5fcf95; --ambar: #f0b45a; --rojo: #ff8a80; --gris: #8d9994; --azul: #8fb0ff;
  --verde-f: #143326; --ambar-f: #3a2a10; --rojo-f: #3d1a17; --gris-f: #222c29; --azul-f: #1b2744; color-scheme: dark; } }
:root[data-theme="dark"] {
  --fondo: #0f1614; --sup: #17201d; --sup2: #1f2a26; --tinta: #e8efec; --tenue: #9aa9a3; --linea: #2b3833;
  --acento: #4fc39f; --acento-t: #06231a; --verde: #5fcf95; --ambar: #f0b45a; --rojo: #ff8a80; --gris: #8d9994; --azul: #8fb0ff;
  --verde-f: #143326; --ambar-f: #3a2a10; --rojo-f: #3d1a17; --gris-f: #222c29; --azul-f: #1b2744; color-scheme: dark; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--fondo); color: var(--tinta); font: 15px/1.5 var(--cuerpo); }
.marco { max-width: 1160px; margin: 0 auto; padding-block: 20px 64px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2, h3 { font-family: var(--titulo); margin: 0; text-wrap: balance; letter-spacing: .01em; }
h1 { font-size: 30px; line-height: 1.1; } h2 { font-size: 20px; } h3 { font-size: 17px; }
p { margin: 0; } ul { margin: 0; padding-left: 18px; }
button, select { font: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }
a { color: var(--acento); }
.cab { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 8px 24px; }
.cab small { color: var(--tenue); font-family: var(--dato); font-size: 12px; }
.frase { margin-top: 10px; max-width: 75ch; color: var(--tenue); }
.pest { display: flex; gap: 2px; margin: 20px 0 18px; border-bottom: 1px solid var(--linea); overflow-x: auto; scrollbar-width: none; }
.pest::-webkit-scrollbar { display: none; }
.pest button { border: 0; background: none; padding: 10px 12px; white-space: nowrap; color: var(--tenue); font-weight: 500;
  border-bottom: 3px solid transparent; margin-bottom: -1px; }
.pest button[aria-selected="true"] { color: var(--tinta); border-bottom-color: var(--acento); }
.cuenta { font-family: var(--dato); font-size: 12px; background: var(--acento); color: var(--acento-t); border-radius: 9px; padding: 1px 7px; margin-left: 6px; }
.seccion { margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
.seccion:first-child { margin-top: 0; }
.sub { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.grilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 12px; }
.tarjeta { background: var(--sup); border: 1px solid var(--linea); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column;
  gap: 10px; text-align: left; min-width: 0; position: relative; overflow: hidden; }
.tarjeta::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--c, var(--acento)); }
button.tarjeta:hover { border-color: var(--acento); }
.fila { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; }
.fila > :first-child { min-width: 0; }
.pastilla { font-size: 12px; font-weight: 600; border-radius: 6px; padding: 2px 8px; white-space: nowrap; }
.e-verde { background: var(--verde-f); color: var(--verde); } .e-ambar { background: var(--ambar-f); color: var(--ambar); }
.e-rojo { background: var(--rojo-f); color: var(--rojo); } .e-gris { background: var(--gris-f); color: var(--gris); }
.e-azul { background: var(--azul-f); color: var(--azul); }
.tenue { color: var(--tenue); } .chico { font-size: 13px; } .mini { font-size: 12px; }
.dato { font-family: var(--dato); font-variant-numeric: tabular-nums; }
.etapas { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }
.etapas span { height: 5px; border-radius: 2px; background: var(--sup2); }
.etapas span.h { background: var(--acento); } .etapas span.a { background: var(--acento); opacity: .45; }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.kpi { background: var(--sup); border: 1px solid var(--linea); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.kpi b { font-family: var(--titulo); font-size: 26px; line-height: 1.1; }
.kpi span { font-size: 13px; color: var(--tenue); }
.kpi.alerta b { color: var(--ambar); }
.lista { display: flex; flex-direction: column; gap: 8px; }
.foco { background: var(--sup); border: 1px solid var(--linea); border-radius: 10px; display: grid; grid-template-columns: 4px minmax(0, 1fr); overflow: hidden; }
.foco > i { background: var(--c); }
.foco > button { all: unset; cursor: pointer; padding: 12px 14px; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 2fr) auto; gap: 4px 16px; align-items: center; }
.foco > button:focus-visible { outline: 2px solid var(--acento); outline-offset: -2px; }
.foco:hover { border-color: var(--acento); }
.item { background: var(--sup); border: 1px solid var(--linea); border-radius: 10px; padding: 12px 14px; display: grid;
  grid-template-columns: auto minmax(0, 1fr); gap: 4px 12px; align-items: start; }
.item input[type="checkbox"], .paso input { width: 20px; height: 20px; margin: 2px 0 0; accent-color: var(--acento); }
.hecho .que { text-decoration: line-through; color: var(--tenue); }
.item .meta { grid-column: 2; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; color: var(--tenue); }
.quien { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; border-radius: 5px; padding: 1px 6px; white-space: nowrap; }
.q-vos { background: var(--ambar-f); color: var(--ambar); } .q-claude { background: var(--sup2); color: var(--tenue); } .q-ambos { background: var(--azul-f); color: var(--azul); }
.paso { display: grid; grid-template-columns: auto 64px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 9px 0; border-top: 1px solid var(--linea); }
.paso:first-child { border-top: 0; }
.paso .cuando { text-align: right; }
.detalle { background: var(--sup); border: 1px solid var(--linea); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 20px; }
.dos { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 24px; }
.rot { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--tenue); margin-bottom: 6px; }
.selector { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; background: var(--sup); border: 1px solid var(--linea); border-radius: 12px; padding: 10px 12px; }
.selector label { font-weight: 600; }
.selector select { flex: 1 1 220px; min-width: 0; background: var(--fondo); border: 1px solid var(--linea); border-radius: 8px; padding: 8px 10px; }
.selector .nav { display: flex; gap: 6px; }
.bt { background: none; border: 1px solid var(--linea); border-radius: 8px; padding: 6px 12px; }
.bt:hover { border-color: var(--acento); }
.plats { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
.plat { border: 1px solid var(--linea); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; background: var(--fondo); }
.plat b { font-size: 14px; }
.camino { display: flex; flex-direction: column; }
.fase { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 10px; position: relative; padding-bottom: 14px; }
.fase:last-child { padding-bottom: 0; }
.fase::before { content: ""; position: absolute; left: 10px; top: 20px; bottom: -2px; width: 2px; background: var(--linea); }
.fase:last-child::before { display: none; }
.punto { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--linea); background: var(--sup); display: grid; place-items: center; font-size: 12px; z-index: 1; }
.f-hecho .punto { background: var(--acento); border-color: var(--acento); color: var(--acento-t); }
.f-en_curso .punto { border-color: var(--acento); box-shadow: 0 0 0 4px var(--verde-f); }
.f-en_curso .punto::after { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--acento); }
.f-proximo .punto { border-color: var(--acento); border-style: dashed; }
.fase .t { display: flex; flex-wrap: wrap; gap: 2px 10px; align-items: baseline; }
.fase .t b { font-weight: 600; }
.cifras { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.cifras div { background: var(--fondo); border: 1px solid var(--linea); border-radius: 8px; padding: 8px 10px; }
.cifras b { display: block; font-family: var(--dato); font-size: 15px; }
textarea { width: 100%; min-height: 84px; font: inherit; color: inherit; background: var(--fondo); border: 1px solid var(--linea); border-radius: 8px; padding: 8px 10px; resize: vertical; }
.guardar { background: var(--acento); color: var(--acento-t); border: 0; border-radius: 8px; padding: 7px 14px; font-weight: 600; }
.guardar:disabled, input:disabled { opacity: .5; cursor: not-allowed; }
.mes { font-family: var(--titulo); font-size: 15px; color: var(--tenue); margin-top: 12px; }
.aviso { font-size: 13px; color: var(--tenue); min-height: 1.5em; }
.linea-row { display: grid; grid-template-columns: 120px minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 8px 0; border-top: 1px solid var(--linea); }
.gantt { background: var(--sup); border: 1px solid var(--linea); border-radius: 12px; padding: 12px 12px 14px; overflow-x: auto; }
.gantt svg { display: block; min-width: 760px; width: 100%; height: auto; font-family: var(--cuerpo); }
.gantt text { fill: var(--tinta); }
.gantt .t2 { fill: var(--tenue); font-size: 11px; }
.ideas { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
.idea { background: var(--sup); border: 1px solid var(--linea); border-radius: 10px; padding: 10px 12px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 8px; align-items: start; }
.estrella { border: 1px solid var(--linea); background: none; border-radius: 8px; width: 34px; height: 34px; font-size: 16px; line-height: 1; color: var(--tenue); }
.estrella[aria-pressed="true"] { color: var(--ambar); border-color: var(--ambar); background: var(--ambar-f); }
.tabla { width: 100%; border-collapse: collapse; font-size: 14px; }
.tabla th, .tabla td { text-align: left; padding: 8px 8px; border-top: 1px solid var(--linea); vertical-align: top; }
.tabla th { font-size: 12px; color: var(--tenue); font-weight: 600; border-top: 0; }
.tabla td.n, .tabla th.n { text-align: right; font-family: var(--dato); }
.envolver { overflow-x: auto; background: var(--sup); border: 1px solid var(--linea); border-radius: 12px; padding: 4px 8px; }
.ley { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 13px; color: var(--tenue); }
.ley i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 5px; vertical-align: -1px; }
@media (max-width: 760px) {
  .dos { grid-template-columns: 1fr; } h1 { font-size: 24px; }
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .foco > button { grid-template-columns: minmax(0, 1fr) auto; }
  .foco > button .sig { grid-column: 1 / -1; }
  .foco > button .pastilla { grid-row: 1; grid-column: 2; justify-self: end; align-self: start; }
  .paso { grid-template-columns: auto 56px minmax(0, 1fr); } .paso .cuando { grid-column: 3; text-align: left; }
  .linea-row { grid-template-columns: 1fr; gap: 2px; }
  .linea-row .pastilla { justify-self: start; }
}
</style>
<div class="marco">
  <header class="cab">
    <div><h1>Consola del Holding</h1></div>
    <small id="fecha"></small>
  </header>
  <p class="frase" id="frase"></p>
  <nav class="pest" role="tablist" id="pest"></nav>
  <main id="vista"></main>
</div>
<script id="datos" type="application/json">__DATOS__</script>
<script>
(() => {
  const D = JSON.parse(document.getElementById('datos').textContent);
  const $ = (s) => document.querySelector(s);
  const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MC = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fecha = (f) => { const [a, m, d] = String(f).split('-').map(Number); return d ? `${d} de ${MESES[m - 1]} de ${a}` : `${MESES[m - 1]} de ${a}`; };
  const corta = (f) => { const [a, m, d] = String(f).split('-').map(Number); return d ? `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}` : `${MC[m - 1]} ${String(a).slice(2)}`; };
  const usd = (n) => n == null ? '—' : `USD ${Math.round(n).toLocaleString('es-AR')}`;
  const ESTADO = { verde: 'En marcha', ambar: 'Atención', rojo: 'Trabado', gris: 'Programado', azul: 'Espera tu decisión' };
  const PLAT = { hecho: ['Listo', 'verde'], en_curso: ['En curso', 'verde'], proximo: ['Próximo', 'azul'], despues: ['Después', 'gris'], no_va: ['No va', 'gris'] };
  const FASE = { hecho: 'Hecho', en_curso: 'En curso', proximo: 'Próximo', despues: 'Después' };
  const P = Object.fromEntries(D.proyectos.map((p) => [p.id, p]));
  const G = Object.fromEntries(D.grupos.map((g) => [g.id, g]));
  const HOY = new Date().toISOString().slice(0, 10);
  const marcas = {}, notas = {};
  let db = null, aviso = '';
  const guardado = (k, def) => { try { return localStorage.getItem(k) || def; } catch { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
  let pest = guardado('consola.pest', 'panorama'), proy = guardado('consola.proy', D.proyectos[0].id);
  if (!P[proy]) proy = D.proyectos[0].id;
  const h0 = decodeURIComponent(location.hash.slice(1));
  if (P[h0]) { pest = 'proyecto'; proy = h0; }
  if (!['panorama', 'proyecto', 'pendientes', 'linea', 'ideas', 'horas'].includes(pest)) pest = 'panorama';

  const hecho = (id) => !!marcas[id]?.hecho;
  const abiertos = () => D.pendientes.filter((x) => !hecho(x.id)).sort((a, b) => a.prioridad - b.prioridad);
  const etapas = (p) => { const i = D.etapas.indexOf(p.etapa); return `<div class="etapas" title="Etapa: ${esc(p.etapa)}">${D.etapas.map((e, j) => `<span class="${j < i ? 'h' : j === i ? 'a' : ''}"></span>`).join('')}</div>`; };
  const siguiente = (p) => (p.proximos ?? []).find((x) => !hecho(x.id));
  const quien = (q) => `<span class="quien q-${esc(q)}">${q === 'vos' ? 'Vos' : q === 'ambos' ? 'Los dos' : 'Claude'}</span>`;
  const mesAct = HOY.slice(0, 7), iMes = Math.max(0, D.ventana.indexOf(mesAct));
  const horasMes = (i) => D.proyectos.reduce((s, p) => s + (p.horas?.[i] ?? 0), 0);

  function tarjeta(p) {
    const s = siguiente(p);
    return `<button class="tarjeta" style="--c:${esc(p.color)}" data-abrir="${esc(p.id)}">
      <div class="fila"><h3>${esc(p.nombre)}</h3><span class="pastilla e-${esc(p.estado)}">${esc(ESTADO[p.estado])}</span></div>
      <p class="chico tenue">${esc(p.que)}</p>
      ${etapas(p)}
      <div class="fila mini"><span class="tenue">${esc(p.etapa)}</span><span class="dato">${p.avance}%</span></div>
      <div class="chico"><span class="dato">${esc(corta(p.hito.fecha))}</span> · ${esc(p.hito.que)}</div>
      ${s ? `<div class="chico tenue">Sigue: ${esc(s.que)}</div>` : ''}
    </button>`;
  }
  function pendiente(x) {
    const p = P[x.proyecto];
    return `<label class="item ${hecho(x.id) ? 'hecho' : ''}"><input type="checkbox" data-marca="${esc(x.id)}" ${hecho(x.id) ? 'checked' : ''} ${db ? '' : 'disabled'}>
      <span class="que">${esc(x.que)}</span>
      <span class="meta"><span>${esc(p?.nombre ?? x.proyecto)}</span><span>${esc(x.tiempo)}</span><span>${esc(x.cuando)}</span>${x.donde ? `<span>Dónde: ${esc(x.donde)}</span>` : ''}</span></label>`;
  }

  // ───────────── Panorama ─────────────
  function vistaPanorama() {
    const ab = abiertos(), foco = D.proyectos.filter((p) => p.foco).sort((a, b) => a.prioridad - b.prioridad);
    const prox = D.proyectos.map((p) => p.hito).filter((h) => h.fecha >= HOY).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    const hp = D.proyectos.find((p) => p.hito === prox);
    const hm = horasMes(iMes), tope = D.tope_horas;
    const kpis = `<div class="kpis">
      <div class="kpi"><b>${D.proyectos.filter((p) => p.estado !== 'gris' && p.grupo !== 'herramientas').length}</b><span>proyectos en marcha de ${D.proyectos.filter((p) => p.grupo !== 'herramientas').length}</span></div>
      <div class="kpi ${ab.length ? 'alerta' : ''}"><b>${ab.length}</b><span>cosas te tocan a vos</span></div>
      <div class="kpi ${hm > tope ? 'alerta' : ''}"><b>${hm.toLocaleString('es-AR', { maximumFractionDigits: 1 })} h</b><span>tuyas por semana este mes (tope ${tope})</span></div>
      <div class="kpi"><b>${prox ? esc(corta(prox.fecha)) : '—'}</b><span>${prox ? `${esc(hp.nombre)}: ${esc(prox.que)}` : 'sin hitos'}</span></div></div>`;
    const focoHtml = foco.map((p) => { const s = siguiente(p); return `<div class="foco" style="--c:${esc(p.color)}"><i></i><button data-abrir="${esc(p.id)}">
        <span><b>${esc(p.nombre)}</b><br><span class="mini tenue">${esc(p.etapa)} · ${p.avance}%</span></span>
        <span class="sig chico">${s ? `${quien(s.quien)} ${esc(s.que)}` : '<span class="tenue">Sin próximo cargado</span>'}</span>
        <span class="pastilla e-${esc(p.estado)}">${esc(ESTADO[p.estado])}</span></button></div>`; }).join('');
    const porGrupo = D.grupos.map((g) => { const ps = D.proyectos.filter((p) => p.grupo === g.id).sort((a, b) => a.prioridad - b.prioridad);
      return ps.length ? `<section class="seccion"><div class="sub"><h2>${esc(g.nombre)}</h2><span class="chico tenue">${esc(g.que)}</span></div><div class="grilla">${ps.map(tarjeta).join('')}</div></section>` : ''; }).join('');
    const I = D.ideas, nOps = I.oportunidades.length, interes = Object.keys(marcas).filter((k) => k.startsWith('idea-') && marcas[k].interesa).length;
    return `<section class="seccion">${kpis}</section>
      <section class="seccion"><div class="sub"><h2>Lo que se está trabajando</h2><span class="chico tenue">por importancia; tocá uno para entrar</span></div><div class="lista">${focoHtml}</div></section>
      ${ab.length ? `<section class="seccion"><div class="sub"><h2>Te toca a vos</h2><button class="bt" data-pest="pendientes">Ver los ${ab.length}</button></div><div class="lista">${ab.slice(0, 3).map(pendiente).join('')}</div></section>` : ''}
      ${porGrupo}
      <section class="seccion"><div class="sub"><h2>En la fila</h2><button class="bt" data-pest="ideas">Ver ideas</button></div>
        <p class="chico">${nOps} oportunidades con ficha, ${I.nuevas.length} ideas nuevas, ${I.backlog.length} proyectos secundarios esperando turno y ${I.cementerio} descartadas con su razón.${interes ? ` Marcaste ${interes} que te interesan.` : ''}</p></section>
      <section class="seccion"><h2>Novedades</h2><div>${D.novedades.slice(0, 8).map((n) => `<div class="linea-row"><span class="dato chico">${esc(corta(n.fecha))}</span><span>${esc(n.que)}</span><span></span></div>`).join('')}</div></section>`;
  }

  // ───────────── Proyecto ─────────────
  function horasSpark(p) {
    if (!p.horas) return '';
    const v = p.horas.slice(iMes, iMes + 14), mx = Math.max(1, ...v), w = 14 * 16;
    const barras = v.map((h, i) => `<rect x="${i * 16 + 2}" y="${40 - (h / mx) * 34}" width="12" height="${(h / mx) * 34}" rx="2" fill="${esc(p.color)}" opacity="${i ? .55 : 1}"><title>${esc(corta(D.ventana[iMes + i]))}: ${h} h por semana</title></rect>`).join('');
    return `<div><div class="rot">Tus horas por semana</div><svg viewBox="0 0 ${w} 52" width="100%" height="56" role="img" aria-label="Horas por semana de los próximos 14 meses">${barras}<text x="2" y="51" class="t2" font-size="10" fill="currentColor">${esc(corta(D.ventana[iMes]))}</text><text x="${w - 2}" y="51" text-anchor="end" font-size="10" fill="currentColor">${esc(corta(D.ventana[Math.min(D.ventana.length - 1, iMes + 13)]))}</text></svg>
      <p class="mini tenue">Este mes: ${v[0]} h. Máximo en el período: ${Math.max(...v)} h.</p></div>`;
  }
  function vistaProyecto() {
    const p = P[proy], orden = [...D.proyectos].sort((a, b) => a.prioridad - b.prioridad), i = orden.findIndex((x) => x.id === p.id);
    const opciones = D.grupos.map((g) => `<optgroup label="${esc(g.nombre)}">${orden.filter((x) => x.grupo === g.id).map((x) => `<option value="${esc(x.id)}" ${x.id === p.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</optgroup>`).join('');
    const enl = (p.enlaces ?? []).map((e) => e.url ? `<li><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.nombre)}</a></li>` : `<li>${esc(e.nombre)}: <span class="dato mini">${esc(e.ruta)}</span></li>`).join('');
    const mios = D.pendientes.filter((x) => x.proyecto === p.id);
    const plats = (p.plataformas ?? []).map((x) => { const [t, c] = PLAT[x.estado] ?? ['', 'gris']; return `<div class="plat"><div class="fila"><b>${esc(x.donde)}</b><span class="pastilla e-${c}">${t}</span></div><span class="chico tenue">${esc(x.cuando)}</span></div>`; }).join('');
    const camino = (p.camino ?? []).map((f) => `<div class="fase f-${esc(f.estado)}"><span class="punto">${f.estado === 'hecho' ? '✓' : ''}</span>
        <div><div class="t"><b>${esc(f.fase)}</b><span class="mini dato tenue">${esc(f.cuando)}</span><span class="mini tenue">${esc(FASE[f.estado] ?? '')}</span></div>${f.que ? `<p class="chico tenue">${esc(f.que)}</p>` : ''}</div></div>`).join('');
    const proximos = (p.proximos ?? []).map((x) => `<label class="paso ${hecho(x.id) ? 'hecho' : ''}"><input type="checkbox" data-marca="${esc(x.id)}" ${hecho(x.id) ? 'checked' : ''} ${db ? '' : 'disabled'} aria-label="Marcar como hecho">
        ${quien(x.quien)}<span class="que">${esc(x.que)}</span><span class="cuando chico tenue">${esc(x.cuando)}</span></label>`).join('');
    const caso = p.caso ? `<div><div class="rot">Si funciona (escenario normal, ESTIMACIÓN)</div><div class="cifras">
        <div><span class="mini tenue">dic 2027</span><b>${usd(p.caso['2027-12'])}</b></div><div><span class="mini tenue">dic 2028</span><b>${usd(p.caso['2028-12'])}</b></div><div><span class="mini tenue">dic 2030</span><b>${usd(p.caso['2030-12'])}</b></div></div>
        <p class="mini tenue" style="margin-top:6px">Por mes. Chances de que funcione: ${Math.round((p.chances ?? 0) * 100)}%. Supuestos en la ficha.</p></div>` : '';
    return `<div class="selector"><label for="sel">¿Con qué proyecto trabajamos?</label><select id="sel">${opciones}</select>
        <span class="nav"><button class="bt" data-mover="-1" aria-label="Proyecto anterior">←</button><button class="bt" data-mover="1" aria-label="Proyecto siguiente">→</button></span></div>
      <article class="detalle" style="margin-top:12px">
        <div><div class="fila"><h2>${esc(p.nombre)}</h2><span class="pastilla e-${esc(p.estado)}">${esc(ESTADO[p.estado])}</span></div>
          <p style="margin-top:6px">${esc(p.que)}</p>${p.lema ? `<p class="chico tenue" style="margin-top:4px">«${esc(p.lema)}» · ${esc(G[p.grupo]?.nombre)} · prioridad ${p.prioridad}</p>` : `<p class="chico tenue" style="margin-top:4px">${esc(G[p.grupo]?.nombre)} · prioridad ${p.prioridad}</p>`}
          ${p.nota ? `<p class="chico tenue" style="margin-top:6px">${esc(p.nota)}</p>` : ''}</div>
        <div><div class="rot">Dónde está</div>${etapas(p)}<div class="fila chico" style="margin-top:6px;flex-wrap:wrap"><span>${D.etapas.map((e) => e === p.etapa ? `<b>${esc(e)}</b>` : `<span class="tenue">${esc(e)}</span>`).join(' → ')}</span><span class="dato">${p.avance}%${p.avance_de ? ` ${esc(p.avance_de)}` : ''}</span></div></div>
        ${plats ? `<div><div class="rot">Dónde sale</div><div class="plats">${plats}</div></div>` : ''}
        <div class="dos">
          <div class="lista" style="gap:20px">
            <div><div class="rot">Próximos (tocá para marcar lo hecho)</div>${proximos || '<p class="tenue chico">Sin pasos cargados todavía.</p>'}</div>
            ${camino ? `<div><div class="rot">El camino</div><div class="camino">${camino}</div></div>` : ''}
            ${(p.hecho ?? []).length ? `<div><div class="rot">Hecho</div><ul class="chico">${p.hecho.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>` : ''}
          </div>
          <div class="lista" style="gap:18px">
            <div><div class="rot">Próximo hito</div><p><span class="dato">${esc(fecha(p.hito.fecha))}</span><br>${esc(p.hito.que)}</p></div>
            <div><div class="rot">Cómo gana plata</div><p class="chico">${esc(p.gana ?? 'A definir.')}</p></div>
            ${caso}
            ${horasSpark(p)}
            ${p.corte ? `<div><div class="rot">Regla de corte</div><p class="chico">${esc(p.corte)}</p></div>` : ''}
            ${enl ? `<div><div class="rot">Enlaces</div><ul class="chico">${enl}</ul></div>` : ''}
          </div>
        </div>
        ${mios.length ? `<div><div class="rot">Te toca a vos en ${esc(p.nombre)}</div><div class="lista">${mios.map(pendiente).join('')}</div></div>` : ''}
        <div><div class="rot">Tu nota para Claude sobre ${esc(p.nombre)}</div>
          <textarea id="nota" ${db ? '' : 'disabled'} placeholder="${db ? 'Lo que quieras que lea al empezar la próxima sesión.' : 'Las notas se guardan cuando abrís la consola con tu sesión de Claude.'}">${esc(notas[p.id]?.texto ?? '')}</textarea>
          <div class="fila" style="margin-top:8px"><button class="guardar" data-nota="${esc(p.id)}" ${db ? '' : 'disabled'}>Guardar nota</button><span class="aviso" id="aviso">${esc(aviso)}</span></div></div>
      </article>`;
  }

  // ───────────── Te toca a vos ─────────────
  function vistaPendientes() {
    const ab = abiertos(), he = D.pendientes.filter((x) => hecho(x.id));
    return `<section class="seccion"><h2>Pendientes, por prioridad</h2><div class="lista">${ab.map(pendiente).join('') || '<p class="tenue">Nada pendiente.</p>'}</div></section>
      ${he.length ? `<section class="seccion"><h2>Marcados como hechos</h2><div class="lista">${he.map(pendiente).join('')}</div></section>` : ''}
      <p class="aviso" style="margin-top:12px">${db ? 'Lo que marcás acá lo leo al empezar la próxima sesión.' : 'Para marcar, abrí la consola con tu sesión de Claude.'}</p>`;
  }

  // ───────────── Lo que viene: línea de tiempo ─────────────
  function vistaLinea() {
    const V = D.ventana, n = V.length, izq = 132, W = 1000, col = (W - izq - 8) / n, fh = 26;
    const filas = [...D.proyectos].filter((p) => (p.gantt ?? []).some((g) => g.hasta >= V[0] && g.desde <= V[n - 1]) || p.hito.fecha.slice(0, 7) <= V[n - 1]).sort((a, b) => a.prioridad - b.prioridad);
    const x = (m, fin) => { let i = V.indexOf(m); if (i < 0) i = m < V[0] ? 0 : n - 1 + (fin ? 1 : 0); else if (fin) i += 1; return izq + i * col; };
    const H = 30 + filas.length * fh + 8;
    let svg = '';
    V.forEach((m, i) => { const [a, mm] = m.split('-').map(Number); if (mm === 1 || i === 0) svg += `<text x="${izq + i * col + 2}" y="12" font-size="11" font-weight="600">${a}</text>`; svg += `<text x="${izq + i * col + col / 2}" y="25" text-anchor="middle" class="t2">${MC[mm - 1][0].toUpperCase()}</text>`; if (mm === 1) svg += `<line x1="${izq + i * col}" x2="${izq + i * col}" y1="2" y2="${H}" stroke="currentColor" stroke-opacity=".18"/>`; });
    filas.forEach((p, k) => {
      const y = 30 + k * fh;
      svg += `<g data-abrir="${esc(p.id)}" style="cursor:pointer"><rect x="0" y="${y}" width="${W}" height="${fh}" fill="transparent"/><text x="0" y="${y + 17}" font-size="12.5" font-weight="600">${esc(p.nombre)}</text>`;
      for (const g of p.gantt ?? []) { if (g.hasta < V[0] || g.desde > V[n - 1]) continue; const x1 = x(g.desde < V[0] ? V[0] : g.desde), x2 = x(g.hasta > V[n - 1] ? V[n - 1] : g.hasta, true);
        svg += `<rect x="${x1 + 1}" y="${y + 6}" width="${Math.max(3, x2 - x1 - 2)}" height="${fh - 12}" rx="3" fill="${esc(p.color)}" opacity=".78"><title>${esc(p.nombre)}: ${esc(g.que)} (${esc(corta(g.desde))} → ${esc(corta(g.hasta))})</title></rect>`; }
      const hf = p.hito.fecha.slice(0, 7);
      if (hf >= V[0] && hf <= V[n - 1]) { const cx = x(hf) + col / 2; svg += `<path d="M${cx} ${y + 4} l6 9 l-6 9 l-6 -9z" fill="var(--tinta)" stroke="var(--sup)" stroke-width="1.5"><title>${esc(p.nombre)}: ${esc(p.hito.que)} (${esc(fecha(p.hito.fecha))})</title></path>`; }
      svg += `</g>`;
    });
    const hx = x(HOY.slice(0, 7)) + col * (Number(HOY.slice(8, 10)) / 31);
    svg += `<line x1="${hx}" x2="${hx}" y1="16" y2="${H}" stroke="var(--rojo)" stroke-width="1.5"/><text x="${hx + 3}" y="${H - 2}" font-size="10" fill="var(--rojo)">hoy</text>`;
    const hitos = D.proyectos.flatMap((p) => [{ f: String(p.hito.fecha), q: p.hito.que, p }, ...(p.hitos_ficha ?? []).map((h) => ({ f: h.fecha, q: h.que, p }))])
      .filter((h) => h.f.slice(0, 7) >= HOY.slice(0, 7)).sort((a, b) => a.f.localeCompare(b.f));
    const vistos = new Set(); let mes = '', lista = '';
    for (const h of hitos) { const k = h.p.id + h.q; if (vistos.has(k)) continue; vistos.add(k);
      const m = h.f.slice(0, 7); if (m !== mes) { mes = m; lista += `<div class="mes">${fecha(m)}</div>`; }
      lista += `<div class="linea-row"><span class="dato chico">${esc(corta(h.f))}</span><span><b>${esc(h.p.nombre)}</b> · ${esc(h.q)}</span><span class="pastilla e-${esc(h.p.estado)}">${esc(ESTADO[h.p.estado])}</span></div>`; }
    return `<section class="seccion"><div class="sub"><h2>Línea de tiempo</h2><span class="chico tenue">Barras: etapas de cada ficha. Rombo: próximo hito. Tocá una fila para entrar.</span></div>
        <div class="gantt"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Línea de tiempo de los proyectos">${svg}</svg></div></section>
      <section class="seccion"><h2>Hitos que vienen</h2><div>${lista}</div></section>`;
  }

  // ───────────── Ideas ─────────────
  function estrella(id) { const on = !!marcas[id]?.interesa; return `<button class="estrella" data-interes="${esc(id)}" aria-pressed="${on}" title="${on ? 'Te interesa' : 'Marcar que te interesa'}" ${db ? '' : 'disabled'}>${on ? '★' : '☆'}</button>`; }
  function vistaIdeas() {
    const I = D.ideas, EST = ['validar', 'explorar', 'inversion', 'radar', 'pausa'], NOM = { validar: 'Para validar', explorar: 'Para explorar', inversion: 'Inversión', radar: 'En el radar', pausa: 'En pausa' };
    const ops = EST.map((e) => { const xs = I.oportunidades.filter((o) => o.estado === e); return xs.length ? `<div class="mes">${NOM[e]} · ${xs.length}</div><div class="ideas">${xs.map((o) => `<div class="idea"><div><b class="chico">${esc(o.id)} · ${esc(o.titulo)}</b><p class="mini tenue">${esc(o.proximo || o.resumen)}</p></div>${estrella('idea-' + o.id)}</div>`).join('')}</div>` : ''; }).join('');
    const nuevas = I.nuevas.map((x) => `<div class="idea"><div><b class="chico">${esc(x.nombre)}</b><p class="mini tenue">${esc(x.va ? 'Va a: ' + x.va : '')}${x.viene ? ` · Viene de: ${esc(x.viene)}` : ''}</p></div>${estrella('idea-' + x.id)}</div>`).join('');
    const back = I.backlog.map((x) => `<div class="idea"><div><b class="chico">${esc(x.id)} · ${esc(x.nombre)}</b>${x.destino ? `<p class="mini tenue">${esc(x.destino)}</p>` : ''}</div>${estrella('idea-' + x.id)}</div>`).join('');
    return `<section class="seccion"><div class="sub"><h2>Oportunidades con ficha</h2><span class="chico tenue">Marcá con la estrella lo que te interesa: lo leo al empezar la próxima sesión.</span></div>${ops}</section>
      <section class="seccion"><h2>Ideas nuevas (${I.nuevas.length})</h2><div class="ideas">${nuevas}</div></section>
      <section class="seccion"><h2>Secundarios esperando turno (${I.backlog.length})</h2><div class="ideas">${back}</div></section>
      <p class="chico tenue" style="margin-top:16px">Además hay ${I.cementerio} ideas descartadas con su razón y lo que las revive (oportunidades/descartadas.md).</p>`;
  }

  // ───────────── Horas y plata ─────────────
  function vistaHoras() {
    const V = D.ventana, n = V.length, W = 1000, H = 230, izq = 34, ab = 24, arr = 10, cw = (W - izq - 6) / n, tope = D.tope_horas;
    const conH = D.proyectos.filter((p) => p.horas && p.horas.some((h) => h > 0)).sort((a, b) => a.prioridad - b.prioridad);
    const tot = V.map((_, i) => conH.reduce((s, p) => s + p.horas[i], 0)), mx = Math.max(tope + 2, ...tot), y = (v) => H - ab - (v / mx) * (H - ab - arr);
    let svg = '';
    for (let v = 0; v <= mx; v += 2) svg += `<line x1="${izq}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" stroke-opacity=".1"/><text x="${izq - 6}" y="${y(v) + 4}" text-anchor="end" class="t2">${v}</text>`;
    V.forEach((m, i) => { let base = 0; const [a, mm] = m.split('-').map(Number);
      for (const p of conH) { const h = p.horas[i]; if (!h) continue; svg += `<rect x="${izq + i * cw + 3}" y="${y(base + h)}" width="${cw - 6}" height="${y(base) - y(base + h)}" fill="${esc(p.color)}" stroke="var(--sup)" stroke-width="1"><title>${esc(corta(m))} · ${esc(p.nombre)}: ${h} h</title></rect>`; base += h; }
      svg += `<text x="${izq + i * cw + cw / 2}" y="${H - 8}" text-anchor="middle" class="t2">${mm === 1 || i === 0 ? MC[mm - 1] + ' ' + String(a).slice(2) : MC[mm - 1][0].toUpperCase()}</text>`;
      if (tot[i] > tope) svg += `<text x="${izq + i * cw + cw / 2}" y="${y(tot[i]) - 3}" text-anchor="middle" font-size="10" fill="var(--ambar)">${tot[i].toFixed(1)}</text>`; });
    svg += `<line x1="${izq}" x2="${W}" y1="${y(tope)}" y2="${y(tope)}" stroke="var(--rojo)" stroke-dasharray="5 4" stroke-width="1.5"/><text x="${izq + 6}" y="${y(tope) - 5}" font-size="11" font-weight="600" fill="var(--rojo)" stroke="var(--sup)" stroke-width="4" paint-order="stroke">tope: ${tope} h por semana</text>`;
    const ley = conH.map((p) => `<span><i style="background:${esc(p.color)}"></i>${esc(p.nombre)}</span>`).join('');
    const filas = [...D.proyectos].filter((p) => p.caso).sort((a, b) => a.prioridad - b.prioridad).map((p) => `<tr><td><button class="bt" style="padding:2px 8px" data-abrir="${esc(p.id)}">${esc(p.nombre)}</button></td><td class="n">${Math.round(p.chances * 100)}%</td><td class="n">${usd(p.caso['2027-12'])}</td><td class="n">${usd(p.caso['2028-12'])}</td><td class="n">${usd(p.caso['2030-12'])}</td></tr>`).join('');
    const C = D.capital;
    return `<section class="seccion"><div class="sub"><h2>Tus horas por semana</h2><span class="chico tenue">Suma de lo que pide cada ficha. Claude hace el resto.</span></div>
        <div class="gantt"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Horas por semana por proyecto y mes">${svg}</svg><div class="ley" style="margin-top:8px">${ley}</div></div></section>
      <section class="seccion"><div class="sub"><h2>Si cada uno funciona</h2><span class="chico tenue">Ingreso neto por mes en el escenario normal. ESTIMACIÓN con los supuestos de cada ficha; no es lo esperado.</span></div>
        <div class="envolver"><table class="tabla"><thead><tr><th>Proyecto</th><th class="n">Chances</th><th class="n">dic 2027</th><th class="n">dic 2028</th><th class="n">dic 2030</th></tr></thead><tbody>${filas}</tbody></table></div></section>
      <section class="seccion"><h2>La plata del holding</h2><div class="kpis">
        <div class="kpi"><b>${usd(C.aporte_mensual)}</b><span>aporte tuyo por mes</span></div><div class="kpi"><b>${usd(C.ahorro_inicial)}</b><span>ahorro disponible para una oportunidad validada</span></div>
        <div class="kpi"><b>${Math.round((C.reinversion ?? 0) * 100)}%</b><span>de la ganancia va a la renta en dólares</span></div><div class="kpi"><b>${((C.tasa_renta ?? 0) * 100).toLocaleString('es-AR')}%</b><span>vara mínima: lo que rinde la renta por año</span></div></div>
        <ul class="chico tenue" style="margin-top:6px">${(C.reglas ?? []).map((r) => `<li>${esc(r)}</li>`).join('')}</ul></section>`;
  }

  const PESTANAS = [['panorama', 'Panorama'], ['proyecto', 'Proyectos'], ['pendientes', 'Te toca a vos'], ['linea', 'Lo que viene'], ['ideas', 'Ideas'], ['horas', 'Horas y plata']];
  function pintar() {
    $('#fecha').textContent = `Actualizada el ${fecha(D.actualizado)}`;
    $('#frase').textContent = D.en_una_frase;
    const n = abiertos().length;
    $('#pest').innerHTML = PESTANAS.map(([id, t]) => `<button role="tab" aria-selected="${pest === id}" data-pest="${id}">${t}${id === 'pendientes' && n ? `<span class="cuenta">${n}</span>` : ''}</button>`).join('');
    const V = { panorama: vistaPanorama, proyecto: vistaProyecto, pendientes: vistaPendientes, linea: vistaLinea, ideas: vistaIdeas, horas: vistaHoras };
    $('#vista').innerHTML = V[pest]();
  }
  function abrir(id) { proy = id; pest = 'proyecto'; aviso = ''; guardar('consola.proy', id); guardar('consola.pest', pest); history.replaceState(null, '', '#' + id); pintar(); window.scrollTo({ top: 0 }); }

  document.addEventListener('click', async (ev) => {
    const t = ev.target.closest('[data-pest],[data-abrir],[data-nota],[data-mover],[data-interes]');
    if (!t) return;
    if (t.dataset.pest) { pest = t.dataset.pest; guardar('consola.pest', pest); if (pest !== 'proyecto') history.replaceState(null, '', location.pathname + location.search); pintar(); window.scrollTo({ top: 0 }); }
    else if (t.dataset.abrir) abrir(t.dataset.abrir);
    else if (t.dataset.mover) { const o = [...D.proyectos].sort((a, b) => a.prioridad - b.prioridad), i = o.findIndex((x) => x.id === proy); abrir(o[(i + Number(t.dataset.mover) + o.length) % o.length].id); }
    else if (t.dataset.interes && db) {
      const id = t.dataset.interes, v = !marcas[id]?.interesa; marcas[id] = { ...(marcas[id] ?? {}), interesa: v }; pintar();
      try { await db.doc(`marcas/${id}`).set({ interesa: v, fecha: new Date().toISOString() }); } catch { marcas[id].interesa = !v; pintar(); }
    }
    else if (t.dataset.nota && db) {
      const id = t.dataset.nota, texto = $('#nota').value;
      try { await db.doc(`notas/${id}`).set({ texto, fecha: new Date().toISOString() }); notas[id] = { texto }; aviso = 'Guardada.'; }
      catch { aviso = 'No se pudo guardar. Probá de nuevo.'; }
      const a = $('#aviso'); if (a) a.textContent = aviso;
    }
  });
  document.addEventListener('change', async (ev) => {
    if (ev.target.id === 'sel') { abrir(ev.target.value); return; }
    const c = ev.target.closest('[data-marca]');
    if (!c || !db) return;
    const id = c.dataset.marca, v = c.checked;
    marcas[id] = { ...(marcas[id] ?? {}), hecho: v }; pintar();
    try { await db.doc(`marcas/${id}`).set({ hecho: v, fecha: new Date().toISOString() }); }
    catch { marcas[id].hecho = !v; pintar(); }
  });
  window.addEventListener('hashchange', () => { const h = decodeURIComponent(location.hash.slice(1)); if (P[h] && h !== proy) abrir(h); });

  pintar();
  (async () => {
    try {
      const base = await window.claude?.use?.('db');
      if (!base) return;
      db = base; pintar();
      const tranquilo = () => !document.activeElement?.matches?.('textarea, select');
      base.collection('marcas').onSnapshot((s) => { s.docs.forEach((d) => { marcas[d.id] = d.data() || {}; }); if (tranquilo()) pintar(); }, () => {});
      base.collection('notas').onSnapshot((s) => { s.docs.forEach((d) => { notas[d.id] = d.data() || {}; }); if (tranquilo()) pintar(); }, () => {});
    } catch { /* sin base: la consola se lee igual */ }
  })();
})();
</script>
"""


def main() -> int:
    datos = armar()
    crudo = json.dumps(datos, ensure_ascii=False, default=str).replace("</", "<\\/")
    SALIDA.write_text(PAGINA.replace("__DATOS__", crudo), encoding="utf-8")
    print(f"{SALIDA.relative_to(RAIZ)}: {len(datos['proyectos'])} proyectos, {len(datos['pendientes'])} pendientes, "
          f"{len(datos['ideas']['nuevas']) + len(datos['ideas']['backlog']) + len(datos['ideas']['oportunidades'])} ideas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
