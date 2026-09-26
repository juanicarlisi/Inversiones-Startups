#!/usr/bin/env python3
"""Construye el informe "Ingresos sin salir a vender": gráficos → HTML → PDF + HTML autocontenido.

Uso:
  python3 informes/construir_ingresos_sin_vender.py              # PDF + HTML autocontenido
  python3 informes/construir_ingresos_sin_vender.py --solo-html  # solo el HTML de trabajo (para revisar)

Fuente: informes/fuente-ingresos/capitulos/*.md (en orden por nombre). Marcadores con datos vivos:
  {{TABLA_CRITERIOS}} {{TABLA_RANKING}} {{TABLA_PUNTAJES}} (cartera/ranking-sin-venta.yaml)
  {{TABLA_PLAN}} (herramientas/plan_sin_venta.py)  {{ANEXO_MODELOS_SV}} (modelos del informe)
"""
from __future__ import annotations

import argparse
import base64
import html
import os
import re
import subprocess
import sys
from pathlib import Path

import markdown
import yaml

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "informes" / "fuente-ingresos"
CAPITULOS = FUENTE / "capitulos"
sys.path.insert(0, str(RAIZ / "herramientas"))
sys.path.insert(0, str(RAIZ / "informes"))

import escenarios  # noqa: E402
import plan_sin_venta  # noqa: E402
from construir_informe import CSS, NBH, _u  # noqa: E402

TITULO = "Ingresos sin salir a vender"
SUBTITULO = "Qué conviene hacer ya, qué en un año y qué no hacer · Informe 2"
FECHA = "26 de septiembre de 2026"
SALIDA_PDF = RAIZ / "informes" / "2026-09-ingresos-sin-vender.pdf"
SALIDA_HTML_AUTO = RAIZ / "informes" / "2026-09-ingresos-sin-vender.html"
SALIDA_HTML = FUENTE / "informe.html"
RANKING = RAIZ / "cartera" / "ranking-sin-venta.yaml"
MODELOS_ANEXO = [
    "op12-fabrica-herramientas", "op08b-microadquisicion-chica", "op13-motos-operador", "op14-app-suscripcion",
    "descartes/k19-mineria-btc-casa", "descartes/k20-alquiler-gpu-casa",
]


def _ranking() -> dict:
    r = yaml.safe_load(RANKING.read_text(encoding="utf-8"))
    crit = r["criterios"]
    total_peso = sum(c["peso"] for c in crit.values())
    for o in r["opciones"]:
        o["_total"] = sum(o["puntajes"][k] * c["peso"] for k, c in crit.items()) / total_peso * 20
    r["opciones"].sort(key=lambda o: -o["_total"])
    return r


def tabla_criterios() -> str:
    r = _ranking()
    filas = ["| Criterio | Peso | Qué mide |", "|---|---|---|"]
    for c in r["criterios"].values():
        filas.append(f"| {c['nombre']} | {c['peso']}% | {c['guia']} |")
    return "\n".join(filas)


def tabla_ranking() -> str:
    r = _ranking()
    filas = ["| # | Opción | Quién vende por vos | Cuándo | Capital | Horas | Números | Puntaje |",
             "|---|---|---|---|---|---|---|---|"]
    for i, o in enumerate(r["opciones"], 1):
        filas.append(f"| {i} | **{o['nombre']}** ({o['id'].replace('-', NBH)}) | {o['quien_vende']} | {o['cuando']} | "
                     f"{o['capital']} | {o['horas']} | {o['numeros']} | **{o['_total']:.0f}** |")
    return "\n".join(filas)


def tabla_puntajes() -> str:
    r = _ranking()
    crit = r["criterios"]
    filas = ["| Opción | " + " | ".join(f"{c['nombre']} ({c['peso']}%)" for c in crit.values()) + " | Total |",
             "|---|" + "---|" * (len(crit) + 1)]
    for o in r["opciones"]:
        filas.append(f"| {o['id'].replace('-', NBH)} | " + " | ".join(str(o["puntajes"][k]) for k in crit) +
                     f" | **{o['_total']:.0f}** |")
    return "\n".join(filas)


def tabla_plan() -> str:
    cfg = yaml.safe_load((RAIZ / "cartera" / "plan-sin-venta.yaml").read_text(encoding="utf-8"))
    return plan_sin_venta.tabla_md(cfg)


def _pct(r) -> str:
    return " / ".join(f"{x*100:.1f}".replace(".", ",").replace(",0", "") + "%" for x in r)


def _num(r) -> str:
    return " / ".join(_u(x) for x in r)


def anexo_modelos() -> str:
    bloques = []
    for stem in MODELOS_ANEXO:
        m = escenarios.cargar_modelo(RAIZ / "herramientas" / "modelos" / f"{stem}.yaml")
        r = escenarios.correr(m)
        exito = f" · Éxito supuesto: {m['exito']*100:.0f}%" if m.get("exito") is not None else ""
        pc = r["percentiles_inc"] if m.get("exito") is not None else r["percentiles"]
        media = r["media_inc"] if m.get("exito") is not None else r["media"]
        b = [f"## {m['id']} · {m['nombre']}", "",
             f"Salida: **{m['salida']}** ({m.get('unidad_salida', '')}){exito}. Media {_u(media)}; "
             f"P10 / P50 / P90: {_u(pc[10])} / {_u(pc[50])} / {_u(pc[90])}"
             + (" (incondicional)." if m.get("exito") is not None else "."),
             "", "| Supuesto | Mín. | Más probable | Máx. | Descripción |", "|---|---|---|---|---|"]
        for k, s in m["supuestos"].items():
            if isinstance(s, dict) and s.get("tipo", "triangular") == "triangular":
                b.append(f"| {k} | {s['min']} | {s['modo']} | {s['max']} | {s.get('desc', '')} |")
            elif isinstance(s, dict) and s.get("tipo") == "fijo":
                b.append(f"| {k} | — | {s['valor']} | — | {s.get('desc', '')} |")
            elif isinstance(s, dict) and s.get("tipo") == "bernoulli":
                b.append(f"| {k} | — | p = {s['p']} | — | {s.get('desc', '')} |")
        bloques.append("\n".join(b))
    cfg = yaml.safe_load((RAIZ / "cartera" / "plan-sin-venta.yaml").read_text(encoding="utf-8"))
    a = cfg["adquisiciones"]
    bloques.append("\n".join([
        "## Plan combinado (cartera/plan-sin-venta.yaml)", "",
        f"- Aporte USD {cfg['aporte_mensual']}/mes durante {cfg['meses']} meses; colchón USD {_u(cfg['colchon_usd'])}; todo se reinvierte.",
        f"- Renta: tasa anual {_pct(cfg['tesoreria']['tasa_anual'])} (mín. / más probable / máx.); evento Argentina con probabilidad "
        f"{cfg['tesoreria']['shock']['prob']:.0%} entre los meses {cfg['tesoreria']['shock']['mes'][0]} y "
        f"{cfg['tesoreria']['shock']['mes'][1]}, pérdida de {_pct(cfg['tesoreria']['shock']['perdida'])} de la tesorería.",
        f"- Fábrica: ingresos del modelo OP-12 con rampa desde el mes {cfg['fabrica']['mes_inicio_ingresos']}; tendencia anual "
        f"{_pct(cfg['fabrica']['tendencia_anual'])}; corte al mes {cfg['fabrica']['corte']['mes']} si factura menos de USD "
        f"{cfg['fabrica']['corte']['minimo_usd']}/mes.",
        f"- Compras: desde el mes {a['mes_minimo']}, hasta {a['maximo']}, cada ≥ {a['meses_entre_compras']} meses, topes de USD "
        f"{_num(a['topes'])}, costo de transacción {a['costo_transaccion']:.0%}; múltiplo {' / '.join(str(x).replace('.', ',') for x in a['multiplo'])}; "
        f"variación del primer año {_pct(a['variacion_1a'])}; mejora IA {_pct(a['mejora_ia'])}; tendencia {_pct(a['tendencia_anual'])}; colapso {a['prob_colapso_1a']:.0%} el primer año y "
        f"{a['prob_colapso_anual_despues']:.0%} anual después.",
        f"- Motos (variante): desde el mes {cfg['motos']['mes_minimo']}, hasta {cfg['motos']['maximo']}; ingreso al inversor "
        f"USD {_num(cfg['motos']['ingreso_inversor_mensual'])}/mes; vida útil {_num(cfg['motos']['vida_util'])} meses; el ingreso se informa "
        f"neto de amortización.",
    ]))
    return "\n\n".join(bloques)


def portada() -> str:
    return f"""
<section class="portada">
  <div class="marca">Opportunity Intelligence &amp; Venture Portfolio · Informe 2</div>
  <div>
    <h1>{TITULO}</h1>
    <div class="sub">{SUBTITULO}. Quién puede vender por vos, qué rinde cada opción por dólar y por hora, qué parece pasivo y no lo
    es, y un plan a cinco años con USD 400 por mes.</div>
  </div>
  <div class="hallazgo"><strong>Hallazgo central.</strong> No hay ingreso pasivo gratis: o ponés capital, o trabajo por adelantado,
  o comprás algo que ya funciona. La IA abarató fabricar para todos y por eso inundó los canales fáciles. Donde sí te da ventaja es
  en <em>operar barato lo que comprás</em> y en <em>hacer muchos intentos chicos con regla de corte</em>. Combinando renta, una
  fábrica de herramientas y compras de micro-negocios que ya venden, la mediana simulada llega a ~USD 150/mes al año 1, ~340 al
  año 2 y ~600 al año 5, contra 24 / 53 / 150 con renta sola.</div>
  <div class="pie">Fecha de corte: {FECHA} · Punto de partida: CABA, Argentina · Aporte: USD 400/mes · Preferencia: sin salir a vender<br>
  Documento de uso privado. No constituye asesoramiento financiero, legal ni impositivo regulado.<br>
  Fuente viva: repositorio del sistema (fichas OP-08, OP-09, OP-12 a OP-14; modelos; cartera/plan-sin-venta.yaml).</div>
</section>"""


def construir_html() -> str:
    reemplazos = {
        "{{TABLA_CRITERIOS}}": tabla_criterios(),
        "{{TABLA_RANKING}}": tabla_ranking(),
        "{{TABLA_PUNTAJES}}": tabla_puntajes(),
        "{{TABLA_PLAN}}": tabla_plan(),
        "{{ANEXO_MODELOS_SV}}": anexo_modelos(),
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
        for t in re.findall(r"<h1>(.*?)</h1>", html_cap):
            if es_anexo:
                anexos.append(t)
            else:
                n += 1
                indice.append(t)
                html_cap = html_cap.replace(f"<h1>{t}</h1>", f'<h1><span class="num">{n}</span>{t}</h1>', 1)
        cuerpo.append(f'<section class="{"anexo" if es_anexo else "capitulo"}">{html_cap}</section>')
    idx = "".join(f"<li>{t}</li>" for t in indice)
    idx_an = "".join(f"<li>{t}</li>" for t in anexos)
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>{html.escape(TITULO)}</title>
<style>{CSS}</style></head><body>
{portada()}
<section class="indice"><h2>Contenido</h2><ol>{idx}</ol><ul class="anexos">{idx_an}</ul></section>
{''.join(cuerpo)}
</body></html>"""


def autocontenido(doc: str) -> str:
    """Incrusta los gráficos SVG como data URI para que el HTML se abra solo en cualquier navegador."""
    def repl(m):
        ruta = FUENTE / m.group(1)
        datos = base64.b64encode(ruta.read_bytes()).decode("ascii")
        return f'src="data:image/svg+xml;base64,{datos}"'
    return re.sub(r'src="(graficos/[^"]+\.svg)"', repl, doc)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--solo-html", action="store_true")
    ap.add_argument("--sin-graficos", action="store_true")
    args = ap.parse_args()
    if not args.sin_graficos:
        import graficos_ingresos

        graficos_ingresos.main()
    doc = construir_html()
    SALIDA_HTML.write_text(doc, encoding="utf-8")
    print("HTML de trabajo:", SALIDA_HTML)
    if args.solo_html:
        return 0
    SALIDA_HTML_AUTO.write_text(autocontenido(doc), encoding="utf-8")
    print("HTML autocontenido:", SALIDA_HTML_AUTO)
    env = dict(os.environ)
    env.setdefault("NODE_PATH", "/opt/node22/lib/node_modules")
    subprocess.run(["node", str(RAIZ / "informes" / "imprimir_pdf.cjs"), str(SALIDA_HTML), str(SALIDA_PDF), TITULO],
                   check=True, env=env)
    return 0


if __name__ == "__main__":
    sys.exit(main())
