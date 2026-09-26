#!/usr/bin/env python3
"""Construye el informe estratégico: gráficos → HTML → PDF.

Uso:
  python3 informes/construir_informe.py                 # informes/2026-09-cartografia-inicial.pdf
  python3 informes/construir_informe.py --solo-html     # solo el HTML (para revisar)

Fuente: informes/fuente/capitulos/*.md (en orden por nombre). Marcadores que se completan con datos vivos:
  {{TABLA_OPORTUNIDADES}}  {{TABLA_PROYECCION}}  {{ANEXO_MODELOS}}
"""
from __future__ import annotations

import argparse
import html
import os
import re
import subprocess
import sys
from pathlib import Path

import markdown
import numpy as np
import yaml

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "informes" / "fuente"
CAPITULOS = FUENTE / "capitulos"
sys.path.insert(0, str(RAIZ / "herramientas"))
sys.path.insert(0, str(RAIZ / "informes"))

import cartera as cartera_mod  # noqa: E402
import escenarios  # noqa: E402
import oportunidades  # noqa: E402

TITULO = "Cartografía inicial de oportunidades"
SUBTITULO = "Informe estratégico fundacional · Opportunity Intelligence & Venture Portfolio"
FECHA = "26 de septiembre de 2026"
SALIDA_PDF = RAIZ / "informes" / "2026-09-cartografia-inicial.pdf"
SALIDA_HTML = FUENTE / "informe.html"


def _u(x: float) -> str:
    return f"{x:,.0f}".replace(",", ".")


NBH = "\u2011"  # guion que no corta línea


def tabla_oportunidades() -> str:
    ops = [o for o in oportunidades.cargar() if not o["_errores"]]
    orden = {e: i for i, e in enumerate(["validar", "explorar", "inversion", "radar"])}
    ops.sort(key=lambda o: (orden.get(o["estado"], 9), -o["_ivr"]))
    filas = [
        "| ID | Oportunidad | Estado | Rol | Puntaje | IVR | Flujo esperado m36 (USD/mes) | Capital óptimo (USD) | h/sem | IA % |",
        "|---|---|---|---|---|---|---|---|---|---|",
    ]
    for o in ops:
        filas.append(
            f"| {o['id'].replace('-', NBH)} | {o['titulo']} | {o['estado']} | {o['rol'].replace('-', ' ')} | {o['_puntaje']:.0f} | {o['_ivr']:.2f} | "
            f"{_u(o['_flujo_esperado_m36'])} | {_u(float(o['capital']['optimo_usd']))} | {o['horas_semana']} | {o['ia_ejecutable_pct']} |"
        )
    return "\n".join(filas)


def tabla_proyeccion() -> str:
    cfg = yaml.safe_load((RAIZ / "cartera" / "proyeccion.yaml").read_text(encoding="utf-8"))
    base = cartera_mod.proyectar(cfg)
    cfg_e = yaml.safe_load((RAIZ / "cartera" / "proyeccion.yaml").read_text(encoding="utf-8"))
    for u in cfg_e["unidades"] + cfg_e.get("reinversiones", []):
        u["prob_exito"] = min(1.0, u["prob_exito"] * 0.6)
    estres = cartera_mod.proyectar(cfg_e)

    def p(r, clave, m, q):
        return float(np.percentile(r[clave][:, m], q))

    filas = [
        "| Métrica (USD) | Base P10 | Base P50 | Base P90 | Estrés P50 | Solo tesorería |",
        "|---|---|---|---|---|---|",
    ]
    for m in (12, 24, 60):
        filas.append(
            f"| Flujo mensual de unidades, mes {m} | {_u(p(base,'flujo',m,10))} | {_u(p(base,'flujo',m,50))} | "
            f"{_u(p(base,'flujo',m,90))} | {_u(p(estres,'flujo',m,50))} | — |"
        )
    for m in (24, 60):
        filas.append(
            f"| Patrimonio, mes {m} | {_u(p(base,'patrimonio',m,10))} | {_u(p(base,'patrimonio',m,50))} | "
            f"{_u(p(base,'patrimonio',m,90))} | {_u(p(estres,'patrimonio',m,50))} | {_u(base['solo_tesoreria'][m])} |"
        )
    T = base["T"]
    mejor_b = float(np.mean(base["patrimonio"][:, T] > base["solo_tesoreria"][T])) * 100
    mejor_e = float(np.mean(estres["patrimonio"][:, T] > estres["solo_tesoreria"][T])) * 100
    filas.append(f"| Probabilidad de superar a solo tesorería al mes {T} | — | {mejor_b:.0f}% | — | {mejor_e:.0f}% | — |")
    return "\n".join(filas)


def anexo_modelos() -> str:
    bloques = []
    for ruta in sorted((RAIZ / "herramientas" / "modelos").glob("op*.yaml")):
        m = escenarios.cargar_modelo(ruta)
        r = escenarios.correr(m)
        exito = f" · Éxito supuesto: {m['exito']*100:.0f}%" if m.get("exito") is not None else ""
        b = [f"## {m['id']} · {m['nombre']}", "",
             f"Salida: **{m['salida']}** ({m.get('unidad_salida','')}){exito}. Caso base: **{_u(r['base'])}**; "
             f"si funciona P10 / P50 / P90: {_u(r['percentiles'][10])} / {_u(r['percentiles'][50])} / {_u(r['percentiles'][90])}.",
             "", "| Supuesto | Mín. | Más probable | Máx. | Descripción |", "|---|---|---|---|---|"]
        for k, s in m["supuestos"].items():
            if isinstance(s, dict) and s.get("tipo", "triangular") == "triangular":
                b.append(f"| {k} | {s['min']} | {s['modo']} | {s['max']} | {s.get('desc','')} |")
            elif isinstance(s, dict) and s.get("tipo") == "fijo":
                b.append(f"| {k} | — | {s['valor']} | — | {s.get('desc','')} |")
            elif isinstance(s, dict) and s.get("tipo") == "bernoulli":
                b.append(f"| {k} | — | p = {s['p']} | — | {s.get('desc','')} |")
        bloques.append("\n".join(b))
    return "\n\n".join(bloques)


CSS = """
@page { size: A4; }
:root { --tinta:#1a1a19; --tinta2:#52514e; --muted:#898781; --grilla:#e1e0d9; --acento:#2a78d6; --fondo:#fcfcfb; --wash:#f3f2ee; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Liberation Sans','DejaVu Sans',Arial,sans-serif; font-size: 9.6pt; line-height: 1.48; color: var(--tinta); margin: 0; background: white; }
.portada { height: 250mm; display: flex; flex-direction: column; justify-content: space-between; padding: 8mm 2mm; page-break-after: always; }
.portada .marca { font-size: 8.5pt; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.portada h1 { font-size: 30pt; line-height: 1.1; margin: 0 0 6mm; border: 0; page-break-before: avoid; color: #0b0b0b; }
.portada .sub { font-size: 12pt; color: var(--tinta2); max-width: 150mm; }
.portada .hallazgo { border-left: 3px solid var(--acento); padding: 3mm 5mm; background: var(--wash); max-width: 160mm; font-size: 10.5pt; }
.portada .pie { font-size: 9pt; color: var(--tinta2); line-height: 1.6; }
.indice { page-break-after: always; }
.indice h2 { font-size: 16pt; margin-top: 0; }
.indice ol { columns: 1; padding-left: 5mm; }
.indice li { margin: 1.2mm 0; }
.indice .anexos { list-style: none; padding-left: 0; margin-top: 4mm; color: var(--tinta2); }
h1 { font-size: 19pt; line-height: 1.2; margin: 0 0 5mm; padding-bottom: 2.5mm; border-bottom: 1px solid var(--grilla); page-break-before: always; color: #0b0b0b; }
h1 .num { color: var(--acento); margin-right: 3mm; }
h2 { font-size: 12.5pt; margin: 6mm 0 2mm; color: #0b0b0b; page-break-after: avoid; break-after: avoid; }
h3 { font-size: 10.5pt; margin: 4mm 0 1.5mm; page-break-after: avoid; }
p { margin: 1.6mm 0 2.4mm; text-align: left; orphans: 3; widows: 3; }
ul, ol { margin: 1mm 0 2.5mm; padding-left: 5.5mm; }
li { margin: .8mm 0; }
strong { color: #0b0b0b; }
blockquote { margin: 3mm 0; padding: 2mm 4mm; border-left: 3px solid var(--acento); background: var(--wash); color: var(--tinta2); }
code { font-family: 'DejaVu Sans Mono', monospace; font-size: 8.2pt; background: var(--wash); padding: 0 1mm; border-radius: 2px; }
table { width: 100%; border-collapse: collapse; margin: 2.5mm 0 4mm; font-size: 8.1pt; line-height: 1.35; }
thead { display: table-header-group; }
th { text-align: left; font-weight: bold; background: var(--wash); color: #0b0b0b; padding: 1.6mm 1.8mm; border-bottom: 1px solid #c3c2b7; }
td { padding: 1.4mm 1.8mm; border-bottom: .5px solid var(--grilla); vertical-align: top; }
tr { page-break-inside: avoid; break-inside: avoid; }
img { width: 100%; display: block; margin: 3mm 0 3.5mm; page-break-inside: avoid; break-inside: avoid; }
.diagrama { border: 1px solid var(--grilla); border-radius: 4px; padding: 4mm; margin: 3mm 0 4mm; background: var(--fondo); page-break-inside: avoid; }
.diagrama .capa { display: flex; gap: 2.5mm; align-items: stretch; }
.diagrama .etq { width: 31mm; flex: none; font-size: 7.6pt; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; display: flex; align-items: center; }
.diagrama .caja { flex: 1; border-radius: 4px; padding: 2.2mm 3mm; font-size: 8.4pt; line-height: 1.3; border: 1px solid var(--grilla); background: white; }
.diagrama .caja small { color: var(--tinta2); font-size: 7.4pt; }
.diagrama .c1 { border-left: 3px solid #1baf7a; }
.diagrama .c2 { border-left: 3px solid #2a78d6; }
.diagrama .c3 { border-left: 3px solid #4a3aa7; }
.diagrama .c4 { border-left: 3px solid #eb6834; }
.diagrama .c5 { border-left: 3px solid #eda100; }
.diagrama .flecha { text-align: center; color: var(--muted); font-size: 8pt; margin: 1.2mm 0 1.2mm 31mm; }
.anexo h1 .num { display: none; }
"""


def portada() -> str:
    return f"""
<section class="portada">
  <div class="marca">Opportunity Intelligence &amp; Venture Portfolio · Versión 1</div>
  <div>
    <h1>{TITULO}</h1>
    <div class="sub">{SUBTITULO}. La primera fotografía del terreno económico: fuerzas, normas, oportunidades priorizadas con
    evidencia y números, lo que descartamos, la cartera a cinco años y los próximos 90 días.</div>
  </div>
  <div class="hallazgo"><strong>Hallazgo central.</strong> El costo de ejecutar trabajo de oficina colapsó con la IA justo cuando la
  mayoría de los servicios pyme argentinos sigue siendo analógica. La ventaja no está en tener una idea nueva, sino en operar
  negocios de servicio recurrentes —administración de consorcios, administración de transportistas, decisiones logísticas— con la
  mitad del costo, y reinvertir la caja en activos en dólares.</div>
  <div class="pie">Fecha de corte: {FECHA} · Punto de partida: CABA, Argentina · Capital recurrente: USD 400/mes<br>
  Documento de uso privado. No constituye asesoramiento financiero, legal ni impositivo regulado.<br>
  Fuente viva: repositorio del sistema (fichas, modelos, radar y cartera).</div>
</section>"""


def construir_html() -> str:
    reemplazos = {
        "{{TABLA_OPORTUNIDADES}}": tabla_oportunidades(),
        "{{TABLA_PROYECCION}}": tabla_proyeccion(),
        "{{ANEXO_MODELOS}}": anexo_modelos(),
    }
    md = markdown.Markdown(extensions=["tables", "sane_lists", "md_in_html"])
    cuerpo, indice, anexos = [], [], []
    n = 0
    for ruta in sorted(CAPITULOS.glob("*.md")):
        texto = ruta.read_text(encoding="utf-8")
        for k, v in reemplazos.items():
            texto = texto.replace(k, v)
        es_anexo = ruta.name.startswith("9")
        html_cap = md.reset().convert(texto)
        titulos = re.findall(r"<h1>(.*?)</h1>", html_cap)
        for t in titulos:
            if es_anexo:
                anexos.append(t)
            else:
                n += 1
                indice.append(t)
                html_cap = html_cap.replace(f"<h1>{t}</h1>", f'<h1><span class="num">{n}</span>{t}</h1>', 1)
        cuerpo.append(f'<section class="{"anexo" if es_anexo else "capitulo"}">{html_cap}</section>')
    idx = "".join(f"<li>{t}</li>" for t in indice)
    idx_an = "".join(f"<li>{t}</li>" for t in anexos)
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{html.escape(TITULO)}</title>
<style>{CSS}</style></head><body>
{portada()}
<section class="indice"><h2>Contenido</h2><ol>{idx}</ol><ul class="anexos">{idx_an}</ul></section>
{''.join(cuerpo)}
</body></html>"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--solo-html", action="store_true")
    ap.add_argument("--sin-graficos", action="store_true")
    args = ap.parse_args()
    if not args.sin_graficos:
        import graficos

        graficos.main()
    SALIDA_HTML.write_text(construir_html(), encoding="utf-8")
    print("HTML:", SALIDA_HTML)
    if args.solo_html:
        return 0
    env = dict(os.environ)
    env.setdefault("NODE_PATH", "/opt/node22/lib/node_modules")
    subprocess.run(["node", str(RAIZ / "informes" / "imprimir_pdf.cjs"), str(SALIDA_HTML), str(SALIDA_PDF), TITULO],
                   check=True, env=env)
    return 0


if __name__ == "__main__":
    sys.exit(main())
