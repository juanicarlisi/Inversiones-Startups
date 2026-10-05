#!/usr/bin/env python3
"""Proyecto completo de Senda (app cristiana del holding, P1) → PDF + HTML.

Uso:
  python3 informes/construir_senda.py              # gráficos + HTML + PDF (dos pasadas) + HTML autocontenido
  python3 informes/construir_senda.py --solo-html  # solo el HTML de trabajo

Texto: oportunidades/proyectos/senda/capitulos/*.md (un archivo por capítulo; el número del archivo es el del capítulo).
Datos: oportunidades/proyectos/senda/roadmap.yaml (fases, tareas, hitos), presupuesto.yaml (menú de calidad) y economia.yaml
(vidas, comodines, monedas, planes y proyección). Visuales: informes/senda_visual.py (íconos, Lani, armadura) y
informes/senda_pantallas.py (pantallas de ejemplo y bloques gráficos).
Marcadores en los capítulos: {{cap:NN}} (número de capítulo), {{GRAF:x}}, {{MOCK:x}} y bloques {{NOMBRE}} generados acá.
"""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import html
import os
import re
import subprocess
import sys
from pathlib import Path

import markdown
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
import senda_pantallas as S  # noqa: E402
import senda_visual as V  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
DIR = RAIZ / "oportunidades" / "proyectos" / "senda"
CAPITULOS = DIR / "capitulos"
FUENTE = RAIZ / "informes" / "fuente-senda"
GRAF = FUENTE / "graficos"
TIPO = RAIZ / "informes" / "tipografia"
TITULO = "Senda · El proyecto completo de la app"
SALIDA_PDF = RAIZ / "informes" / "2026-10-senda-proyecto-v2.pdf"
SALIDA_HTML_AUTO = RAIZ / "informes" / "2026-10-senda-proyecto-v2.html"
SALIDA_HTML = FUENTE / "informe.html"

AMBAR, NOCHE, VERDE, GRANADA, CREMA, TINTA = V.AMBAR, V.NOCHE, V.VERDE, V.ROJO, V.CREMA, "#1B1B1F"
QUIEN = {"claude": ("#2a78d6", "Claude"), "vos": ("#eb6834", "Vos"), "juntos": ("#1baf7a", "Juntos"),
         "externo": ("#7a4fd0", "Especialista externo")}
CARRILES = [("producto", "Producto"), ("contenido", "Contenido"), ("arte", "Arte y sonido"),
            ("difusion", "Difusión y comunidad"), ("tiendas", "Tiendas, legal y PI"), ("negocio", "Negocio y decisiones")]
MESES_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def esc(t) -> str:
    return html.escape(str(t))


def fecha(x) -> dt.date:
    if isinstance(x, dt.date):
        return x
    return dt.date.fromisoformat(str(x))


def fecha_txt(d: dt.date) -> str:
    return f"{d.day:02d}-{MESES_ES[d.month-1]}-{str(d.year)[2:]}"


def cargar() -> dict:
    return {k: yaml.safe_load((DIR / f"{k}.yaml").read_text(encoding="utf-8")) for k in ("roadmap", "presupuesto", "economia")}


def usd(x: float, dec: int = 0) -> str:
    t = f"{x:,.{dec}f}"
    return t.replace(",", "X").replace(".", ",").replace("X", ".")


# ─────────────────────────────────────────────── gráficos ───────────────────────────────────────────────
def _estilo():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib import font_manager
    for f in sorted(TIPO.glob("*.ttf")):  # Inter (los gráficos usan la tipografía del texto)
        font_manager.fontManager.addfont(str(f))
    plt.rcParams.update({
        "figure.facecolor": "#fcfcfb", "axes.facecolor": "#fcfcfb", "savefig.facecolor": "#fcfcfb",
        "font.family": "Inter", "font.size": 9, "axes.edgecolor": "#c3c2b7", "axes.labelcolor": "#52514e",
        "axes.titlecolor": TINTA, "axes.titlesize": 10.5, "axes.titleweight": "bold", "axes.titlelocation": "left",
        "xtick.color": "#898781", "ytick.color": "#898781", "xtick.labelcolor": "#52514e", "ytick.labelcolor": "#52514e",
        "axes.grid": True, "grid.color": "#e1e0d9", "grid.linewidth": 0.8, "axes.axisbelow": True,
        "axes.spines.top": False, "axes.spines.right": False, "legend.frameon": False, "legend.fontsize": 8.2,
        "svg.fonttype": "path",
    })
    return plt


def _guardar(fig, nombre):
    GRAF.mkdir(parents=True, exist_ok=True)
    fig.savefig(GRAF / f"{nombre}.svg", metadata={"Date": None})
    import matplotlib.pyplot as plt
    plt.close(fig)


def graf_uso():
    plt = _estilo()
    etiquetas = ["Argentina: conectados por día", "Argentina: en el celular", "Mundo: en apps (promedio)",
                 "Mundo: en redes sociales", "Senda: la meta diaria (10–15 min)"]
    minutos = [8 * 60 + 44, 4 * 60 + 40, 3.6 * 60, 92, 15]
    colores = ["#c3c2b7", V.INDIGO_M, V.VIOLETA, GRANADA, AMBAR]
    fig, ax = plt.subplots(figsize=(9.2, 2.9))
    y = range(len(etiquetas))[::-1]
    ax.barh(list(y), minutos, color=colores, height=0.62)
    for yi, m in zip(y, minutos):
        h, mm = divmod(int(round(m)), 60)
        ax.text(m + 6, yi, f"{h} h {mm:02d} min" if h else f"{mm} min", va="center", fontsize=8.6, color=TINTA)
    ax.set_yticks(list(y))
    ax.set_yticklabels(etiquetas)
    ax.set_xlim(0, 600)
    ax.set_xticks([0, 120, 240, 360, 480])
    ax.set_xticklabels(["0", "2 h", "4 h", "6 h", "8 h"])
    ax.grid(axis="y", visible=False)
    ax.set_title("Cuánto tiempo pasamos con el celular (2025) y cuánto le pide Senda")
    fig.text(0.01, 0.01, "Fuentes: DataReportal Digital 2026 Argentina; Sensor Tower State of Mobile 2026.", fontsize=7, color="#898781")
    fig.tight_layout(rect=(0, 0.04, 1, 1))
    _guardar(fig, "uso")


def graf_descargas():
    plt = _estilo()
    from matplotlib.ticker import FuncFormatter
    fechas = [2026 + 11.5 / 12, 2027 + 2.5 / 12, 2027 + 11.5 / 12, 2028 + 11.5 / 12, 2029 + 11.5 / 12, 2030 + 11.5 / 12]
    desc = [1_000, 10_000, 50_000, 250_000, 500_000, 1_000_000]
    mau_x = [2026 + 11.5 / 12, 2027 + 11.5 / 12, 2028 + 11.5 / 12, 2029 + 11.5 / 12, 2030 + 11.5 / 12]
    mau = [1_500] + D_ECON["proyeccion"]["activos_mes"]
    fig, ax = plt.subplots(figsize=(9.2, 3.1))
    ax.plot(fechas, desc, color=AMBAR, linewidth=2.4, marker="o", label="Descargas acumuladas (meta)")
    ax.plot(mau_x, mau, color=NOCHE, linewidth=2, marker="s", linestyle="--", label="Personas activas por mes (escenario normal)")
    ax.set_yscale("log")
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v/1e6:.0f} M" if v >= 1e6 else (f"{v/1e3:.0f} mil" if v >= 1e3 else f"{v:.0f}")))
    for x_, v in zip(fechas, desc):
        ax.annotate(f"{v/1e6:.0f} M" if v >= 1e6 else f"{v/1e3:.0f} mil", (x_, v), xytext=(0, 8), textcoords="offset points",
                    ha="center", fontsize=8, color="#9a5b00", fontweight="bold")
    ax.set_xticks([2027, 2028, 2029, 2030, 2031])
    ax.set_xticklabels(["ene-27", "ene-28", "ene-29", "ene-30", "ene-31"])
    ax.set_xlim(2026.8, 2031.05)
    ax.set_title("El camino al primer millón de descargas")
    ax.legend(loc="upper left")
    fig.tight_layout()
    _guardar(fig, "descargas")


D_ECON: dict = {}


def graficos(D):
    D_ECON.update(D["economia"])
    graf_uso()
    graf_descargas()


# ─────────────────────────────────────────────── bloques ───────────────────────────────────────────────
def lista(items, clase="") -> str:
    return f'<ul class="{clase}">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


def bloque_resumen(D) -> str:
    p = D["presupuesto"]["items"]
    tot = {k: sum(i[k] for i in p) for k in ("basico", "profesional", "premium")}
    pilares = [
        ("biblia", "Leer", "Biblia gratis y sin anuncios: Reina-Valera y más versiones, audio y el «+»", V.INDIGO_M),
        ("travesia", "Aprender", "La Travesía: Rutas casi infinitas, con vidas, repaso y Tu Lani", V.VERDE),
        ("jugar", "Jugar", "Espadeo con la armadura de Dios, Liga Senda, Copas y juegos", V.ROJO),
        ("comunidad", "Juntos", "Calendario, Senda Reunión para el líder y Púlpito para el pastor", V.VIOLETA),
        ("lampara", "Crecer", "Berea: planes, desafíos, memoria, Ayuno de redes y Pulso", V.AMBAR_OSC),
    ]
    pil = "".join(f'<div class="pil" style="--c:{c}"><div class="pil-i" style="background:{c}">{V.icono(i, 15, "#fff")}</div><b>{t}</b><span>{d}</span></div>'
                  for i, t, d, c in pilares)
    fichas = [
        ("Para quién", "Jóvenes de 13 a 30 años, sus líderes y sus iglesias; foco protestante amplio, sin disputas doctrinales"),
        ("Dónde", "Android e iOS desde el lanzamiento; web en 2028. Español primero; portugués en marzo de 2028"),
        ("Cómo se sostiene", "Gratis + Plus (USD 0,99) + Max (USD 2,49) + Familia + Pase Senda + Líder + Iglesia + videos opcionales y Perlas"),
        ("Cuándo sale", "<b>18 de diciembre de 2026</b>, una versión cada dos semanas y la <b>ruta principal completa el 30-06-2027</b>"),
        ("Cuánto cuesta", f"Menú de calidad del primer año: básico USD {usd(tot['basico'])}, <b>profesional USD {usd(tot['profesional'])}</b> (recomendado, por tramos), premium USD {usd(tot['premium'])}"),
        ("La meta", "<b>1 millón de descargas en 2030</b>; lo que manda: personas con 3+ días con la Palabra por semana"),
    ]
    fic = "".join(f'<div class="fic"><div class="fic-k">{k}</div><div class="fic-v">{v}</div></div>' for k, v in fichas)
    dif = [
        "<b>Nivel profesional, nada infantil</b>: diseño, animación y sonido son la prioridad.",
        "La <b>armadura de Dios</b> en Espadeo: cada pieza es una categoría; tu armadura se completa a la vista.",
        "La <b>Liga Senda por persona</b>: Apertura, Clausura, ascensos y Copas, sin enfrentar iglesias.",
        "El <b>calendario</b> que junta lo de Senda, lo tuyo y lo de tu grupo.",
        "<b>Senda Reunión</b>: el líder arma su reunión con bloques y recibe el registro.",
        "<b>Tu Lani</b>: tu mascota con atuendos y vehículos; todo lo que hacés suma.",
        "<b>Menos scroll</b>: Primero la Palabra y un inicio que termina.",
    ]
    etapas = [("dic-26", "MVP «Primera luz»", "Biblia, Travesía, Espadeo nuevo, calendario, Tu Lani"), ("mar-27", "v1 «Juntos»", "Grupos, Senda Reunión, planes y Pase Senda"),
              ("jun-27", "v2 «Liga»", "Liga Apertura, Fundamentos completa, Púlpito"), ("dic-27", "v3 «Copa»", "Copas, Clausura, 6 Rutas nuevas, salas web"),
              ("2028", "Nuevos idiomas", "Portugués, inglés, web, Copa Continental"), ("2030", "El millón", "Ligas en más países y plan institucional")]
    et = "".join(f'<div class="et"><div class="et-f">{f}</div><b>{n}</b><span>{d}</span></div>' for f, n, d in etapas)
    return f"""
<p class="lead-s"><b>Senda</b> es una app cristiana para que los jóvenes conozcan la Biblia jugando, leyendo y en comunidad, con la
calidad de las mejores apps del mundo. Junta en un solo lugar, en español de origen, lo que hoy está repartido en cinco apps en inglés.</p>
<div class="pils">{pil}</div>
<div class="fics">{fic}</div>
<div class="duo">
<div class="caja si"><h4 class="ico-t">{V.icono("estrella", 13, V.AMBAR)} El diferencial</h4>{lista(dif, 'apretada')}</div>
<div class="caja"><h4 class="ico-t">{V.icono("mapa", 13, V.INDIGO_M)} Cómo crece: publicada temprano y por etapas</h4><div class="ets">{et}</div>
<p class="nota" style="margin-top:2mm">Cada etapa prueba una hipótesis y tiene una condición para seguir. La primera regla de corte es el
30 de abril de 2027 (capítulo {{{{cap:30}}}}).</p></div>
</div>
<div class="caja rec"><h4 class="ico-t">{V.icono("check", 13, V.VERDE)} Lo que necesito de vos para arrancar</h4>
<p>Las 16 decisiones ya están tomadas (capítulo {{{{cap:31}}}}) y el desarrollo empezó el 05-10-2026. Ahora: probar cada vista previa
desde el celular, crear el repositorio de la app, verificar el nombre, elegir 2 revisores y 12 testers y abrir Google Play a más tardar
el 15-11. Todo gasto y toda publicación salen con tu aprobación.</p></div>"""


def bloque_mapa_app() -> str:
    tabs = [
        ("inicio", "Inicio", ["Tira de la semana", "Versículo del día", "Seguir la Travesía", "Misiones y cofre", "Giro diario", "Duelos pendientes",
                              "Pulso del día", "Tu grupo"], V.INDIGO_M, "Arena"),
        ("biblia", "Biblia", ["Leer: lector y versiones", "Audio", "«+» notas y comentarios", "Notas y resaltados", "Berea: planes y desafíos",
                              "De memoria", "Ayuno de redes", "Biblioteca"], "#9A6B2F", "Santuario"),
        ("travesia", "Travesía", ["Tus Rutas", "El camino de niveles", "Repaso del día", "Práctica de errores", "Jefes y legendarios",
                                  "Tu Lani en el mapa"], V.VERDE, "Arena"),
        ("jugar", "Jugar", ["Espadeo", "Liga Senda y Copas", "Viernes de Espadeo", "Oveja Perdida · Abecé", "¡Prohibido! · Antes o después",
                            "Dibujalo exprés", "Salas con amigos"], V.ROJO, "Arena"),
        ("comunidad", "Comunidad", ["Amigos", "Tu grupo", "Calendario", "Oremos", "Pulso y Estados", "Senda Reunión (líderes)",
                                    "Senda Púlpito (pastores)"], V.VIOLETA, "Arena"),
    ]
    cols = []
    for ico, n, items, c, clima in tabs:
        cols.append(f'<div class="mt" style="--c:{c}"><div class="mt-h">{V.icono(ico, 14, "#fff")}<b>{n}</b></div><div class="mt-c">Clima: {clima}</div>'
                    + "".join(f"<div class=mt-i>{esc(i)}</div>" for i in items) + "</div>")
    perfil = (f'<div class="mt-perfil ico-t">{V.icono("estrella", 12, V.AMBAR)}<span><b>Perfil</b> (tu avatar, arriba a la derecha): Tu Lani con sus atuendos y '
              'vehículos, el escudo de tu club, insignias, estadísticas, tienda, plan y ajustes</span></div>')
    return f'<div class="mapa-tabs">{"".join(cols)}</div>{perfil}'


def bloque_bucles() -> str:
    bucles = [
        ("Diario (hábito)", V.AMBAR, ["Aviso a tu hora", "Versículo del día", "Lección de 4 minutos", "Rayito en la racha", "Compartís el versículo o tu logro"]),
        ("Amigos (crecimiento)", V.ROJO, ["Desafiás a un amigo", "No tiene la app: le llega un enlace", "La instala para jugar", "Juegan", "Ahora invita a otro"]),
        ("Grupo (el más fuerte)", V.VIOLETA, ["El líder arma la reunión", "20 a 60 chicos juegan en la sala", "Al otro día siguen en la Travesía", "Juegan la Liga", "Invitan a sus amigos"]),
        ("Semana (la cita fija)", V.CAT["escudo"][3], ["Lunes arranca la fecha", "Martes memoria · miércoles de a dos", "Jueves Pulso", "Viernes de Espadeo", "Sábado reunión · domingo Púlpito"]),
        ("Temporada", V.VERDE, ["Desafío con fecha", "Toda la comunidad a la vez", "Tarjetas en las redes", "Usuarios nuevos", "Próxima temporada"]),
    ]
    out = []
    for n, c, pasos in bucles:
        chips = '<i>→</i>'.join(f"<span>{esc(p)}</span>" for p in pasos)
        out.append(f'<div class="bucle" style="--c:{c}"><b>{n}</b><div class="bucle-p">{chips}<i>↺</i></div></div>')
    return f'<div class="bucles">{"".join(out)}</div>'


def bloque_logo() -> str:
    return f"""<div class="logos">
<div class="logo-b logo-osc"><div class="logo-c">{V.logo_simbolo(84)}<div class="logo-t" style="color:#fff">senda</div></div><small>Símbolo + logotipo sobre índigo</small></div>
<div class="logo-b"><div class="logo-ico">{V.logo_simbolo(64)}{V.logo_simbolo(44)}{V.logo_simbolo(28)}</div><small>Ícono de la app en tres tamaños</small></div>
<div class="logo-b logo-claro"><div class="logo-c">{V.logo_simbolo(64, claro=True)}<div class="logo-t">senda</div></div><small>Sobre fondo claro</small></div>
</div><p class="nota">Concepto: una S que es un camino y, arriba, la llama de una lámpara, en ámbar sobre índigo. Es una guía para el
diseñador, no el logo final; el logotipo usa Unbounded.</p>"""


def bloque_arquitectura() -> str:
    return """<div class="arq">
<div class="arq-col">
<div class="arq-t">En el teléfono (y la web en 2028)</div>
<div class="arq-b arq-app"><b>App Senda</b> · React Native + Expo (TypeScript)<div class="arq-mini"><span>Rive (Lani)</span><span>Reanimated</span><span>Skia (ruleta, dibujo, luz)</span><span>Lottie</span><span>Sonido + vibración</span><span>SQLite (sin conexión)</span></div></div>
<div class="arq-b">Tiendas: Google Play y App Store · Expo EAS compila y publica · actualizaciones por aire</div>
<div class="arq-b"><b>Módulos nativos</b>: Primero la Palabra (Tiempo de Uso de Apple; uso de apps en Android), compartir en historias</div>
</div>
<div class="arq-flecha">⇄</div>
<div class="arq-col">
<div class="arq-t">Servicios propios</div>
<div class="arq-b arq-core"><b>Supabase</b><div class="arq-mini"><span>Postgres + reglas por fila</span><span>Cuentas (Google, Apple, correo)</span><span>Tiempo real (salas, duelos, Liga)</span><span>Funciones del servidor</span><span>Archivos</span></div></div>
<div class="arq-b"><b>Cloudflare R2 + CDN</b>: Biblias libres, audios, paquetes de contenido, imágenes</div>
<div class="arq-b"><b>Web</b>: sitio, invitaciones, salas desde el navegador (2.º semestre de 2027)</div>
</div>
<div class="arq-flecha">⇄</div>
<div class="arq-col">
<div class="arq-t">Servicios externos</div>
<div class="arq-b"><b>Biblias con licencia</b>: YouVersion Platform o API.Bible</div>
<div class="arq-b"><b>API de Claude, solo interna</b>: contenido por lotes, traducción, moderación (sin IA para usuarios)</div>
<div class="arq-b"><b>RevenueCat</b>: suscripciones · <b>AdMob</b>: videos opcionales</div>
<div class="arq-b"><b>PostHog</b>: analítica y experimentos · <b>Sentry</b>: errores</div>
<div class="arq-b"><b>Avisos</b>: FCM y APNs · <b>Meta</b>: compartir en historias</div>
</div></div>"""


IMPACTO = {"alto": ("Alto", "#0a6b45", "#dff3ea"), "medio": ("Medio", "#7a4f00", "#fdf1d8"), "bajo": ("Bajo", "#52514e", "#efeee9"),
           "base": ("Base", "#3A2A8C", "#ece8ff")}


def bloque_presupuesto(D) -> str:
    it = D["presupuesto"]["items"]
    filas = []
    for i in it:
        n, fg, bg = IMPACTO[i["impacto"]]
        filas.append(f'<tr><td>{esc(i["que"])}</td><td class="num">{usd(i["basico"])}</td><td class="num pro"><b>{usd(i["profesional"])}</b></td>'
                     f'<td class="num">{usd(i["premium"])}</td><td><span class="pill" style="background:{bg};color:{fg}">{n}</span></td>'
                     f'<td class="num">{i["tramo"]}</td><td>{esc(i["cuando"])}</td></tr>')
    tot = {k: sum(i[k] for i in it) for k in ("basico", "profesional", "premium")}
    filas.append(f'<tr class="tot"><td>Total del primer año</td><td class="num">{usd(tot["basico"])}</td><td class="num pro">{usd(tot["profesional"])}</td>'
                 f'<td class="num">{usd(tot["premium"])}</td><td></td><td></td><td></td></tr>')
    return ('<table class="tabla presu"><thead><tr><th>Gasto único (USD)</th><th class="num">Básico</th><th class="num pro">Profesional</th>'
            f'<th class="num">Premium</th><th>Impacto en lo profesional</th><th class="num">Tramo</th><th>Cuándo</th></tr></thead><tbody>{"".join(filas)}</tbody></table>')


TRAMOS = {
    1: ("Arranque y calidad base", "Oct–nov 2026", "Siempre, después de la decisión de seguir del 25-10 (con 3 presupuestos reales por rubro)"),
    2: ("Lanzamiento y Lani viva", "Dic 2026 – feb 2027", "La prueba cerrada muestra que la gente termina lecciones y vuelve"),
    3: ("Arte y contenido", "Feb–mar 2027", "En enero hay 500 o más personas activas por semana"),
    4: ("Crecer", "Mar–dic 2027", "Se cumplió la regla de corte del 30-04-2027 (la publicidad paga, además, espera los datos de retención)"),
}


def bloque_tramos(D) -> str:
    it = D["presupuesto"]["items"]
    filas = []
    for t, (n, cuando, cond) in TRAMOS.items():
        sel = [i for i in it if i["tramo"] == t]
        monto = sum(i["profesional"] for i in sel)
        incl = "; ".join(i["que"].split(" (")[0] for i in sel)
        filas.append(f'<tr><td><b>{t}. {n}</b></td><td>{cuando}</td><td>{esc(incl)}</td>'
                     f'<td class="num"><b>{usd(monto)}</b></td><td>{esc(cond)}</td></tr>')
    return ('<table class="tabla"><thead><tr><th style="width:15%">Tramo</th><th style="width:11%">Cuándo</th><th>Qué incluye (nivel profesional)</th>'
            f'<th class="num">USD</th><th style="width:25%">Se paga si…</th></tr></thead><tbody>{"".join(filas)}</tbody></table>')


def bloque_fases(D) -> str:
    filas = []
    for f in D["roadmap"]["fases"]:
        d0, d1 = fecha(f["desde"]), fecha(f["hasta"])
        hip = f'<div class="hip">Hipótesis: {esc(f["hipotesis"])}</div>' if f.get("hipotesis") else ""
        filas.append(f'<tr><td class="c-n">{f["id"]}</td><td><b>{esc(f["nombre"])}</b><br><small>{fecha_txt(d0)} → {fecha_txt(d1)}</small></td>'
                     f'<td>{esc(f["objetivo"])}{hip}</td><td>{lista([esc(x) for x in f["entregables"]], "apretada")}</td><td>{esc(f["salida"])}</td></tr>')
    return ('<table class="tabla fases"><thead><tr><th></th><th style="width:17%">Fase</th><th style="width:22%">Objetivo</th>'
            f'<th style="width:36%">Entregables</th><th>Para seguir</th></tr></thead><tbody>{"".join(filas)}</tbody></table>')


# ─────────────────────────────────────────────── economía y planes ───────────────────────────────────────────────
def bloque_economia(D) -> str:
    e = D["economia"]
    g = "".join(f"<tr><td>{esc(a)}</td><td class='num'>{esc(p)}</td><td class='num'>{esc(t)}</td></tr>" for a, p, t in e["ganar"])
    q = "".join(f"<tr><td>{esc(a)}</td><td class='num'>{esc(t)}</td><td class='num'>{esc(p)}</td></tr>" for a, t, p in e["gastar"])
    paq = " · ".join(f"{n} por USD {usd(v, 2)}" for n, v in e["monedas"]["paquetes_perlas"])
    return (f'<div class="duo eco"><div><h4 class="ico-t">{V.icono("talento", 13, V.AMBAR)} Ganar</h4><table class="tabla corta"><thead><tr><th>Acción</th>'
            f'<th class="num">Pasos</th><th class="num">Talentos</th></tr></thead><tbody>{g}</tbody></table></div>'
            f'<div><h4 class="ico-t">{V.icono("cofre", 13, V.VIOLETA)} Gastar</h4><table class="tabla corta"><thead><tr><th>Qué</th><th class="num">Talentos</th>'
            f'<th class="num">Perlas</th></tr></thead><tbody>{q}</tbody></table><p class="nota">Paquetes de Perlas: {paq}.</p></div></div>')


def bloque_planes(D) -> str:
    colores = {"gratis": "#8c86a8", "plus": V.CAT["escudo"][3], "max": V.VIOLETA, "familia": V.CAT["casco"][3], "pase": V.AMBAR,
               "lider": V.VERDE, "iglesia": V.INDIGO_M}
    cards = []
    for pl in D["economia"]["planes"]:
        c = colores[pl["id"]]
        if pl["id"] == "gratis":
            precio = '<b>Gratis</b>'
        elif pl["id"] == "pase":
            precio = f'<b>USD {usd(pl["temporada"], 2)}</b><span>por temporada</span>'
        else:
            precio = f'<b>USD {usd(pl["mes"], 2)}</b><span>por mes · USD {usd(pl["anio"], 2)} al año</span>'
        reco = '<div class="pl-reco">El que recomendamos</div>' if pl["id"] == "max" else ""
        filas = [("Vidas", pl["vidas"]), ("Comodines", pl["comodines"]), ("Anuncios", pl["anuncios"]), ("Además", pl["extras"])]
        det = "".join(f'<div class="pl-f"><i>{k}</i>{esc(v)}</div>' for k, v in filas if v and v != "—")
        cards.append(f'<div class="pl{" top" if pl["id"] == "max" else ""}" style="--c:{c}">{reco}<div class="pl-n">{esc(pl["nombre"])}</div>'
                     f'<div class="pl-p">{precio}</div><div class="pl-para">{esc(pl["para"])}</div>{det}</div>')
    return f'<div class="pls">{"".join(cards)}</div>'


def proyectar(D, f_activos: float = 1.0, f_conv: float = 1.0, f_igl: float = 1.0) -> list[dict]:
    e = D["economia"]
    pr = e["proyeccion"]
    pl = {p["id"]: p for p in e["planes"]}
    mezcla = pr["precio_promedio_vs_mensual"]
    out = []
    for k, anio in enumerate(pr["anios"]):
        def g(clave):
            v = pr[clave]
            return v[k] if isinstance(v, list) else v
        a = pr["activos_mes"][k] * f_activos
        r = {"anio": anio, "activos": a}
        r["plus"] = a * g("plus_pct") * f_conv * pl["plus"]["mes"] * mezcla
        r["max"] = a * g("max_pct") * f_conv * pl["max"]["mes"] * mezcla
        r["familia"] = a * g("familia_pct") * f_conv * pl["familia"]["mes"] * mezcla
        r["pase"] = a * g("pase_pct") * f_conv * pl["pase"]["temporada"] * 2 / 12
        r["lider"] = a * g("lider_pct") * f_conv * pl["lider"]["mes"] * mezcla
        r["n_iglesias"] = g("iglesias") * f_igl
        r["iglesias"] = r["n_iglesias"] * pl["iglesia"]["anio"] / 12
        r["perlas"] = a * g("perlas_pagadores_pct") * f_conv * pr["perlas_gasto_mes"]
        r["tienda"] = sum(r[x] for x in ("plus", "max", "familia", "pase", "lider", "iglesias", "perlas"))
        r["tienda_neto"] = r["tienda"] * pr["neto_tienda"]
        r["anuncios"] = a * g("anuncios_usd_por_activo_mes")
        r["ingreso"] = r["tienda_neto"] + r["anuncios"]
        r["servidores"] = a * pr["costo_servidores_por_activo"]
        lic = pr["licencias_biblias"]
        r["licencias"] = lic["pro"] + lic["por_version"][k] * lic["versiones"]
        r["costos"] = r["servidores"] + r["licencias"]
        r["neto"] = r["ingreso"] - r["costos"]
        out.append(r)
    return out


def bloque_proyeccion(D) -> str:
    P = proyectar(D)
    malo, bueno = proyectar(D, .5, .5, .5)[-1]["neto"], proyectar(D, 2.5, 1, 2.5)[-1]["neto"]
    filas = [("Personas activas por mes", "activos", ""), ("Senda Plus", "plus", ""), ("Senda Max", "max", ""), ("Senda Familia", "familia", ""),
             ("Pase Senda (2 temporadas por año)", "pase", ""), ("Senda Líder", "lider", ""), ("Senda Iglesia", "iglesias", "igl"),
             ("Perlas", "perlas", ""), ("Total en las tiendas", "tienda", "sub"), ("Lo que queda después de tienda e impuestos (75%)", "tienda_neto", ""),
             ("Anuncios (videos opcionales y anuncio corto)", "anuncios", ""), ("Ingreso del mes", "ingreso", "sub"),
             ("Servidores e IA interna", "servidores", "neg"), ("Licencias de Biblias (5 versiones)", "licencias", "neg"), ("Neto del mes", "neto", "tot")]
    cab = "".join(f'<th class="num">Dic-{r["anio"]}</th>' for r in P)
    cuerpo = []
    for n, k, cl in filas:
        celdas = []
        for r in P:
            v = r[k]
            if k == "activos":
                t = usd(v)
            elif cl == "igl":
                t = f'<small>{usd(r["n_iglesias"])} ×</small> {usd(v)}'
            else:
                t = ("−" if cl == "neg" else "") + usd(v)
            celdas.append(f'<td class="num">{t}</td>')
        cuerpo.append(f'<tr class="{ {"sub": "sub", "tot": "tot"}.get(cl, "") }"><td>{n}</td>{"".join(celdas)}</tr>')
    cuerpo.append(f'<tr class="esc"><td>Neto de dic-2030 por escenario: malo · <b>normal</b> · bueno</td><td class="num" colspan="4">'
                  f'USD {usd(malo)} · <b>USD {usd(P[-1]["neto"])}</b> · USD {usd(bueno)} por mes</td></tr>')
    return f'<table class="tabla proy"><thead><tr><th>USD por mes</th>{cab}</tr></thead><tbody>{"".join(cuerpo)}</tbody></table>'


def bloque_proyeccion_corta(D) -> str:
    P = proyectar(D)
    filas = "".join(f'<tr><td>Dic-{r["anio"]}</td><td class="num">{usd(r["activos"])}</td><td class="num">{usd(r["ingreso"])}</td>'
                    f'<td class="num">{usd(r["costos"])}</td><td class="num"><b>{usd(r["neto"])}</b></td></tr>' for r in P)
    return ('<table class="tabla corta"><thead><tr><th>Mes</th><th class="num">Personas activas</th><th class="num">Ingreso (USD/mes)</th>'
            f'<th class="num">Servidores y licencias</th><th class="num">Neto (USD/mes)</th></tr></thead><tbody>{filas}</tbody></table>')


# ─────────────────────────────────────────────── pantallas: antes (v1) y ahora (v2) ───────────────────────────────────────────────
def _tel(cuerpo: str, titulo: str, clase: str = "", nav: str | None = "") -> str:
    tabs = [("🏠", "Inicio"), ("📖", "Biblia"), ("🧭", "Camino"), ("⚔️", "Jugar"), ("🤝", "Comunidad")]
    barra = ""
    if nav is not None:
        barra = '<div class="t-nav">' + "".join(f'<span class="{"on" if n == nav else ""}">{i}<small>{n}</small></span>' for i, n in tabs) + "</div>"
    return (f'<figure class="tel-f"><div class="tel {clase}"><div class="t-status"><span>9:41</span><span>●●● ▮</span></div>'
            f'<div class="t-body">{cuerpo}</div>{barra}</div><figcaption>{titulo}</figcaption></figure>')


def mock_inicio_v1() -> str:
    c = """<div class="t-top"><span>🪔 12</span><span>🪙 340</span><span class="t-av">🧑</span></div><div class="t-hola">¡Hola, Joaquín!</div>
<div class="t-card t-vd"><div class="t-k">Versículo del día</div><div class="t-verso">«Lámpara es a mis pies tu palabra, y lumbrera a mi camino.»</div>
<div class="t-ref">Salmo 119:105 · RVR1909</div><div class="t-acc"><span>🔊</span><span>↗ Compartir</span></div></div>
<div class="t-card t-seguir"><div><div class="t-k">Seguí donde quedaste</div><b>Camino · Noé, nivel 3</b><div class="t-bar"><i style="width:60%"></i></div></div><span class="t-btn-s">▶</span></div>
<div class="t-card"><div class="t-k">Misiones de hoy</div>
<div class="t-mis"><span>✅ Completá 2 lecciones</span><em>15 🪙</em></div>
<div class="t-mis"><span>⬜ Compartí el versículo</span><em>15 🪙</em></div>
<div class="t-mis"><span>⬜ Orá por un pedido</span><em>15 🪙</em></div></div>
<div class="t-dos"><div class="t-mini" style="--c:#F5A524">🎡<b>Maná del día</b></div><div class="t-mini" style="--c:#EB5757">⚔️<b>Te toca con Sofi</b></div></div>"""
    return _tel(c, "Antes (v1): Inicio", nav="Inicio")


def mock_espadeo_v1() -> str:
    c = """<div class="t-cat" style="--c:#2F80ED">🛡️ Escudo de la fe <small>Antiguo Testamento</small></div>
<div class="t-timer"><i style="width:70%"></i></div>
<div class="t-q">¿Quién fue vendido por sus hermanos y llegó a gobernar en Egipto?</div>
<div class="t-op ok">José</div><div class="t-op">Moisés</div><div class="t-op">Daniel</div><div class="t-op">Jacob</div>
<div class="t-ayudas"><span>💡 Luz</span><span>⏱️ Tiempo</span><span>📜 Pista</span><span>🔄 Cambiar</span></div>
<div class="t-ref2">Génesis 37:28 · Leer el pasaje</div>"""
    return _tel(c, "Antes (v1): pregunta de Espadeo", nav=None)


def bloque_mock(nombre: str) -> str:
    filas = {
        "inicio": [S.m_inicio(), S.m_pulso()],
        "travesia": [S.m_travesia_mapa(), S.m_leccion_imagen(), S.m_sin_vidas()],
        "espadeo": [S.m_espadeo_ruleta(), S.m_espadeo_pregunta(), S.m_pieza_ganada()],
        "reunion": [S.m_reunion_armador(), S.m_reunion_registro()],
        "calendario": [S.m_calendario()],
    }[nombre]
    extra = f'<div class="mk-row">{S.m_reunion_tv()}</div>' if nombre == "reunion" else ""
    clase = "mk-row tres" if len(filas) == 3 else "mk-row"
    return f'<div class="{clase}">{"".join(filas)}</div>{extra}'


def bloque_mocks_ux() -> str:
    flecha = f'<div class="ab-f">{V.icono("flecha", 26, V.AMBAR)}</div>'
    return (f'<div class="mk-row ab">{mock_inicio_v1()}{flecha}{S.m_inicio().replace("Inicio: la semana a la vista, lo de hoy y la pantalla termina", "Ahora (v2): Inicio")}</div>'
            f'<div class="mk-row ab">{mock_espadeo_v1()}{flecha}{S.m_espadeo_pregunta().replace("Espadeo: una pregunta de Mapa (Botas) con los seis comodines", "Ahora (v2): pregunta de Espadeo")}</div>')


def bloque_liga() -> str:
    return f'<div class="lg-dup">{S.m_liga()}<div class="lg-der">{S.liga_bloque()}</div></div>'


def bloque_tu_lani() -> str:
    return S.tu_lani_bloque()


# ─────────────────────────────────────────────── gantt ───────────────────────────────────────────────
def _empacar(items, ancho_mm_total, dias_total, mm_char=1.08):
    mm_dia = ancho_mm_total / dias_total
    carriles, fines = [], []
    for it in items:
        largo = (len(it["t"]) * mm_char + 3.5) / mm_dia
        it["der"] = it["i0"] + largo > dias_total
        it["ini"] = it["i0"] - largo if it["der"] else it["i0"]
        it["fin"] = it["i1"] if it["der"] else max(it["i1"], it["i0"] + largo)
    for it in sorted(items, key=lambda x: (x["ini"], -(x["i1"] - x["i0"]))):
        for k, f in enumerate(fines):
            if f + 1 <= it["ini"]:
                carriles[k].append(it)
                fines[k] = it["fin"]
                break
        else:
            carriles.append([it])
            fines.append(it["fin"])
    return carriles


def gantt_html(tareas, hitos, d0: dt.date, d1: dt.date, ancho_pista_mm: float, clase: str, escala: str = "meses",
               mm_char: float = 1.08, fases=None) -> str:
    total = (d1 - d0).days + 1
    pct = lambda x: f"{x / total * 100:.3f}%"  # noqa: E731
    # escala superior
    marcas, bandas = [], []
    cur = dt.date(d0.year, d0.month, 1)
    while cur <= d1:
        sig = dt.date(cur.year + (cur.month == 12), cur.month % 12 + 1, 1)
        a, b = max(cur, d0), min(sig - dt.timedelta(days=1), d1)
        i0, i1 = (a - d0).days, (b - d0).days + 1
        if escala == "meses":
            etq = MESES_ES[cur.month - 1] + (f" {str(cur.year)[2:]}" if cur.month == 1 or cur == dt.date(d0.year, d0.month, 1) else "")
            if i1 - i0 < 12:
                etq = ""
            marcas.append(f'<span class="{"imp" if cur.month % 2 else ""}" style="left:{pct(i0)};width:{pct(i1 - i0)}">{etq}</span>')
        else:
            if cur.month in (1, 4, 7, 10):
                q = (cur.month - 1) // 3 + 1
                fin_q = dt.date(cur.year + (cur.month == 10), (cur.month + 2) % 12 + 1, 1) - dt.timedelta(days=1)
                j1 = (min(fin_q, d1) - d0).days + 1
                etq = str(cur.year) if q == 1 else (f"T{q} {str(cur.year)[2:]}" if i0 == 0 else f"T{q}")
                marcas.append(f'<span class="{"imp" if cur.year % 2 else ""}" style="left:{pct(i0)};width:{pct(j1 - i0)}">{etq}</span>')
        if cur.month == 1 and i0 > 0:
            bandas.append(f'<i class="gx-an" style="left:{pct(i0)}"></i>')
        cur = sig
    def pistas_de(items, col_fija=None):
        pistas = []
        for carril in _empacar(items, ancho_pista_mm, total, mm_char):
            cosas = []
            for it in carril:
                col = col_fija or QUIEN[it["q"]][0]
                pos = f'right:calc(100% - {pct(it["i0"])});padding-right:1mm' if it["der"] else f'left:{pct(it["i0"])}'
                cosas.append(f'<b class="gx-b" style="left:{pct(it["i0"])};width:{pct(max(it["i1"] - it["i0"], total * 0.004))};--c:{col}"></b>'
                             f'<em class="gx-t" style="{pos}">{esc(it["t"])}</em>')
            pistas.append(f'<div class="gx-pista">{"".join(cosas)}</div>')
        return "".join(pistas)

    filas = []
    if fases:
        its = []
        for t, a, b in fases:
            i0, i1 = (fecha(a) - d0).days, (fecha(b) - d0).days + 1
            if i1 > 0 and i0 < total:
                its.append({"t": t, "i0": max(i0, 0), "i1": min(i1, total), "q": None})
        filas.append(f'<div class="gx-fila gx-fases"><div class="gx-nom">Fases y versiones</div><div class="gx-pistas">{"".join(bandas)}'
                     f'{pistas_de(its, NOCHE)}</div></div>')
    for clave, nombre in CARRILES:
        items = []
        for c, t, a, b, q in tareas:
            if c != clave:
                continue
            i0, i1 = (fecha(a) - d0).days, (fecha(b) - d0).days + 1
            items.append({"t": t, "i0": max(i0, 0), "i1": min(i1, total), "q": q})
        if not items:
            continue
        filas.append(f'<div class="gx-fila"><div class="gx-nom">{nombre}</div><div class="gx-pistas">{"".join(bandas)}{pistas_de(items)}</div></div>')
    hs = [(fecha(f), t) for f, t in hitos]
    marcas_h = "".join(f'<span class="gx-hn" style="left:{pct(min((f - d0).days, total * 0.985))}">{k}</span>' for k, (f, t) in enumerate(hs, 1))
    ley_h = "".join(f'<span><b class="gx-hn st">{k}</b><b>{fecha_txt(f)}</b> {esc(t)}</span>' for k, (f, t) in enumerate(hs, 1))
    ley_q = "".join(f'<span><i style="background:{c}"></i>{n}</span>' for c, n in QUIEN.values())
    return f"""<div class="gx {clase}">
<div class="gx-fila gx-cab"><div class="gx-nom"></div><div class="gx-escala">{"".join(marcas)}</div></div>
{"".join(filas)}
<div class="gx-fila gx-hitos"><div class="gx-nom">Hitos</div><div class="gx-pistas">{"".join(bandas)}<div class="gx-pista">{marcas_h}</div></div></div>
<div class="gx-ley"><div class="gx-lh">{ley_h}</div><div class="gx-lq">{ley_q}</div></div>
</div>"""


def bloque_gantt_detalle(D) -> str:
    r = D["roadmap"]
    fases = [(f'{f["id"]} · {f["nombre"].split(":")[0]}', f["desde"], f["hasta"]) for f in r["fases"]]
    g = gantt_html(r["tareas"], r["hitos"], dt.date(2026, 9, 28), dt.date(2027, 12, 31), 396 - 58, "gx-a3", "meses", mm_char=1.42, fases=fases)
    return f"""<section class="a3 gantt-a3"><div class="a3-cab"><div><div class="a3-k">Hoja grande · roadmap detallado</div>
<div class="a3-h1">Senda, tarea por tarea: de octubre de 2026 a diciembre de 2027</div></div>
<div class="a3-sub">Publicada el 18-12-2026 y una versión nueva cada dos semanas. Cada barra es una tarea; el color dice quién la hace.
Las tareas se reordenan en cada comité mensual.</div></div>{g}</section>"""


def bloque_gantt_general(D) -> str:
    r = D["roadmap"]
    return gantt_html(r["general"], r["hitos_general"], dt.date(2026, 10, 1), dt.date(2030, 12, 31), 176 - 40, "gx-a4", "trimestres")


# ─────────────────────────────────────────────── documento ───────────────────────────────────────────────
PARTES = {1: "I · Qué es y por qué", 6: "II · La app, módulo por módulo", 16: "III · Cómo se ve, se juega y se sostiene",
          25: "IV · Cómo se construye y se cuida", 29: "V · Plata, tiempos y decisiones"}


def portada(D) -> str:
    tot = sum(i["profesional"] for i in D["presupuesto"]["items"])
    pilares = [("biblia", "Leer", "Reina-Valera y más versiones, audio y el «+»", V.INDIGO_M), ("travesia", "Aprender", "La Travesía, casi infinita", V.VERDE),
               ("jugar", "Jugar", "Espadeo, Liga Senda y Copas", V.ROJO), ("comunidad", "Juntos", "Calendario, Reunión y Púlpito", V.VIOLETA),
               ("lampara", "Crecer", "Berea, Pulso y menos scroll", V.AMBAR_OSC)]
    pil = "".join(f'<div style="--c:{c}"><span class="ps-i" style="background:{c}">{V.icono(i, 14, "#fff")}</span><b>{t}</b>{d}</div>' for i, t, d, c in pilares)
    datos = [("18-12-2026", "sale en Android e iOS, con un MVP más completo"), ("30-06-2027", "la ruta principal de la Travesía, completa"),
             (f"USD {usd(tot)}", "primer año en nivel profesional, por tramos (hay básico y premium)"), ("1 millón", "de descargas: la meta para fines de 2030")]
    dt_ = "".join(f"<div><b>{a}</b><span>{b}</span></div>" for a, b in datos)
    return f"""<section class="portada-s">
<div class="ps-marca">Holding · Proyecto P1 · Documento de trabajo · versión 2.1 · 5 de octubre de 2026 · uso privado</div>
<div class="ps-hero"><div><h1>Senda</h1><p class="ps-sub">El proyecto completo de la app · v2</p>
<p class="ps-lema">Una app cristiana para que los jóvenes conozcan la Biblia <b>jugando, leyendo y en comunidad</b>, con nivel profesional:
nada infantil, nada aburrido. Gratis para leer y aprender; en español de origen; Android e iOS primero y la web después.</p></div>
<div class="ps-img"><div class="ps-esc">{V.lani("saludo", 148, buzo=V.VIOLETA, gorra=V.AMBAR)}</div>{V.logo_txt(30, V.NOCHE)}</div></div>
<div class="ps-pils">{pil}</div>
<div class="ps-datos">{dt_}</div>
<div class="ps-mks">{S.m_inicio()}{S.m_travesia_mapa()}{S.m_espadeo_ruleta()}{S.m_pieza_ganada()}{S.m_liga()}</div>
<div class="ps-mv"><div><span>Misión</span>Ayudar a cada joven a conocer, amar y vivir la Palabra de Dios todos los días, con una experiencia alegre y
excelente, en comunidad, gratis y en su idioma.</div><div><span>Visión</span>Ser la app cristiana número uno del mundo de habla hispana y
portuguesa —la más descargada y la que mejor edifica a los jóvenes—, y una generación que conoce las Escrituras.</div></div>
<div class="ps-pie">Esta versión incorpora las 30 correcciones y las 16 decisiones del fundador, y el diseño emocional (capítulo 20). HECHO lleva fuente y fecha;
ESTIMACIÓN lleva método. Nada que mueva plata o hable con terceros sale sin la aprobación del fundador. Lani, logo y pantallas son
bocetos de dirección: el diseño final lo hacen especialistas.</div>
</section>"""


FUENTES = [("Inter", "inter-latin-{}-normal.woff2", (400, 500, 600, 700, 800), "normal"),
           ("Unbounded", "unbounded-latin-{}-normal.woff2", (500, 700, 800, 900), "normal"),
           ("Jakarta", "plus-jakarta-sans-latin-{}-normal.woff2", (400, 500, 600, 700, 800), "normal"),
           ("Literata", "literata-latin-{}-normal.woff2", (400, 600), "normal"),
           ("Literata", "literata-latin-{}-italic.woff2", (400,), "italic")]


def fuentes_css(incrustar: bool) -> str:
    reglas = []
    for familia, patron, pesos, estilo in FUENTES:
        for peso in pesos:
            f = TIPO / patron.format(peso)
            src = ("data:font/woff2;base64," + base64.b64encode(f.read_bytes()).decode()) if incrustar else f"../tipografia/{f.name}"
            reglas.append(f"@font-face{{font-family:'{familia}';font-style:{estilo};font-weight:{peso};font-display:block;"
                          f"src:url('{src}') format('woff2');}}")
    return "\n".join(reglas)


def construir_html(D, incrustar: bool = False, paginas: dict | None = None) -> str:
    bloques = {
        "{{RESUMEN}}": lambda: bloque_resumen(D),
        "{{MAPA_APP}}": bloque_mapa_app,
        "{{BUCLES}}": bloque_bucles,
        "{{RUTAS}}": S.rutas_bloque,
        "{{ARMADURA}}": S.armadura_bloque,
        "{{STORYBOARD_ARMADURA}}": S.storyboard,
        "{{LIGA}}": bloque_liga,
        "{{SEMANA}}": S.semana_bloque,
        "{{LANI}}": S.lani_bloque,
        "{{LANI_REACCIONES}}": S.lani_reacciones,
        "{{ECONOMIA_MAPA}}": S.economia_mapa,
        "{{ECONOMIA}}": lambda: bloque_economia(D),
        "{{TU_LANI}}": bloque_tu_lani,
        "{{PALETAS}}": S.paletas_bloque,
        "{{PALETA}}": S.paleta_final,
        "{{MOCKS_UX}}": bloque_mocks_ux,
        "{{LOGO}}": bloque_logo,
        "{{SHARE}}": S.share_cards,
        "{{PLANES}}": lambda: bloque_planes(D),
        "{{PROYECCION}}": lambda: bloque_proyeccion(D),
        "{{PROYECCION_CORTA}}": lambda: bloque_proyeccion_corta(D),
        "{{ARQUITECTURA}}": bloque_arquitectura,
        "{{PRESUPUESTO}}": lambda: bloque_presupuesto(D),
        "{{TRAMOS}}": lambda: bloque_tramos(D),
        "{{FASES}}": lambda: bloque_fases(D),
        "{{GANTT_DETALLE}}": lambda: bloque_gantt_detalle(D),
        "{{GANTT_GENERAL}}": lambda: bloque_gantt_general(D),
        "{{MOCK:inicio}}": lambda: bloque_mock("inicio"),
        "{{MOCK:travesia}}": lambda: bloque_mock("travesia"),
        "{{MOCK:espadeo}}": lambda: bloque_mock("espadeo"),
        "{{MOCK:reunion}}": lambda: bloque_mock("reunion"),
        "{{MOCK:calendario}}": lambda: bloque_mock("calendario"),
    }
    md = markdown.Markdown(extensions=["tables", "sane_lists", "md_in_html"])
    archivos = sorted(CAPITULOS.glob("*.md"))
    caps = {}
    for ruta in archivos:
        pref = ruta.name[:2]
        caps[pref] = "A" if pref.startswith("9") else str(int(pref))
    cuerpo, indice = [], []
    for ruta in archivos:
        pref = ruta.name[:2]
        num = caps[pref]
        texto = ruta.read_text(encoding="utf-8")
        texto = re.sub(r"\{\{GRAF:(\w+)\}\}", lambda m: f'<img src="graficos/{m.group(1)}.svg" alt="">', texto)
        marcadores = {}
        for i, (k, fn) in enumerate(bloques.items()):
            if k in texto:
                token = f"BLOQUE{i}XYZ"
                texto = texto.replace(k, token)
                marcadores[token] = fn()
        faltan = [x for x in re.findall(r"\{\{[^}]+\}\}", texto) if not x.startswith("{{cap:")]
        if faltan:
            raise SystemExit(f"{ruta.name}: marcadores sin reemplazar {faltan}")
        h = md.reset().convert(texto)
        h = re.sub(r"<table>(.*?)</table>", lambda m: ('<table class="corta">' if m.group(1).count("<tr>") <= 15 else "<table>") + m.group(1) + "</table>",
                   h, flags=re.S)
        h = h.replace("<li>[ ] ", '<li class="tarea">')
        for token, val in marcadores.items():
            h = h.replace(f"<p>{token}</p>", val).replace(token, val)
        titulo = re.search(r"<h1>(.*?)</h1>", h).group(1)
        if pref == "00":
            clase, etq = "capitulo intro", ""
        elif num == "A":
            clase, etq = "anexo", "A"
        else:
            clase, etq = "capitulo", num
            h = h.replace(f"<h1>{titulo}</h1>", f'<h1><span class="num">{num}</span>{titulo}</h1>', 1)
        if etq.isdigit() and int(etq) in PARTES:
            indice.append(("parte", PARTES[int(etq)]))
        indice.append((etq, titulo))
        cuerpo.append(f'<section class="{clase}">{h}</section>')
    paginas = paginas or {}
    items = []
    for k, t in indice:
        if k == "parte":
            items.append(f'<li class="parte">{t}</li>')
            continue
        items.append(f'<li><span class="in">{k}</span><span class="it">{t}</span><span class="dots"></span>'
                     f'<span class="pag">{paginas.get(t, "")}</span></li>')
    doc = f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(TITULO)}</title>
<style>{fuentes_css(incrustar)}\n{(FUENTE / "estilo.css").read_text(encoding="utf-8")}</style></head><body>
{portada(D)}
<section class="indice s"><h2>Contenido</h2><ol>{"".join(items)}</ol></section>
{''.join(cuerpo)}
</body></html>"""
    doc = re.sub(r"\{\{cap:(\w+)\}\}", lambda m: caps[m.group(1)], doc)
    if "{{" in doc:
        raise SystemExit("quedaron marcadores sin reemplazar: " + ", ".join(sorted(set(re.findall(r"\{\{[^}]*\}\}", doc)))))
    return doc


def paginas_capitulos(D, pdf: Path) -> dict:
    """Busca en el PDF impreso en qué página empieza cada capítulo (para el índice)."""
    import pymupdf
    doc = pymupdf.open(str(pdf))
    textos = [re.sub(r"\s+", " ", doc[i].get_text()) for i in range(doc.page_count)]
    html_idx = construir_html(D, incrustar=False)
    res = {}
    desde = 2
    for t in re.findall(r'<span class="it">(.*?)</span><span class="dots">', html_idx):
        limpio = html.unescape(re.sub(r"<.*?>", "", t)).strip()
        clave = re.sub(r"\s+", " ", limpio)[:34]
        for i in range(desde, len(textos)):
            if clave in textos[i][:320]:
                res[t] = i + 1
                desde = i
                break
        else:
            print("  (índice) no encontré la página de:", limpio)
    return res


def autocontenido(doc: str) -> str:
    def repl(m):
        datos = base64.b64encode((FUENTE / m.group(1)).read_bytes()).decode("ascii")
        return f'src="data:image/svg+xml;base64,{datos}"'
    return re.sub(r'src="(graficos/[^"]+\.svg)"', repl, doc)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--solo-html", action="store_true")
    ap.add_argument("--sin-graficos", action="store_true")
    args = ap.parse_args()
    D = cargar()
    if not args.sin_graficos:
        graficos(D)
    SALIDA_HTML.write_text(construir_html(D, incrustar=False), encoding="utf-8")
    print("HTML de trabajo:", SALIDA_HTML)
    if args.solo_html:
        return 0
    env = dict(os.environ)
    env.setdefault("NODE_PATH", "/opt/node22/lib/node_modules")

    def imprimir():
        subprocess.run(["node", str(RAIZ / "informes" / "imprimir_pdf.cjs"), str(SALIDA_HTML), str(SALIDA_PDF), "Senda · Proyecto completo · v2", "css", "oct-2026"],
                       check=True, env=env)
    imprimir()
    paginas = paginas_capitulos(D, SALIDA_PDF)
    SALIDA_HTML.write_text(construir_html(D, incrustar=False, paginas=paginas), encoding="utf-8")
    imprimir()
    SALIDA_HTML_AUTO.write_text(autocontenido(construir_html(D, incrustar=True, paginas=paginas)), encoding="utf-8")
    print("HTML autocontenido:", SALIDA_HTML_AUTO)
    return 0


if __name__ == "__main__":
    sys.exit(main())
