#!/usr/bin/env python3
"""Proyecto completo de Senda (app cristiana del holding, P1) → PDF + HTML.

Uso:
  python3 informes/construir_senda.py              # gráficos + HTML + PDF (dos pasadas) + HTML autocontenido
  python3 informes/construir_senda.py --solo-html  # solo el HTML de trabajo

Texto: oportunidades/proyectos/senda/capitulos/*.md (un archivo por capítulo; el número del archivo es el del capítulo).
Datos: oportunidades/proyectos/senda/roadmap.yaml (fases, tareas, hitos) y presupuesto.yaml.
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

RAIZ = Path(__file__).resolve().parent.parent
DIR = RAIZ / "oportunidades" / "proyectos" / "senda"
CAPITULOS = DIR / "capitulos"
FUENTE = RAIZ / "informes" / "fuente-senda"
GRAF = FUENTE / "graficos"
TIPO = RAIZ / "informes" / "tipografia"
TITULO = "Senda · El proyecto completo de la app"
SALIDA_PDF = RAIZ / "informes" / "2026-09-senda-proyecto.pdf"
SALIDA_HTML_AUTO = RAIZ / "informes" / "2026-09-senda-proyecto.html"
SALIDA_HTML = FUENTE / "informe.html"

AMBAR, NOCHE, VERDE, GRANADA, CREMA, TINTA = "#F5A524", "#1E2A5A", "#2FA66A", "#D9434B", "#FFF8EC", "#1B1B1F"
QUIEN = {"claude": ("#2a78d6", "Claude"), "vos": ("#eb6834", "Vos"), "juntos": ("#1baf7a", "Juntos"),
         "externo": ("#7a4fd0", "Especialista externo")}
CARRILES = [("producto", "🧱 Producto"), ("contenido", "📚 Contenido"), ("arte", "🎨 Arte y sonido"),
            ("difusion", "📣 Difusión y comunidad"), ("tiendas", "🏪 Tiendas, legal y PI"), ("negocio", "📊 Negocio y decisiones")]
PIEZAS = [
    ("🛡️", "Escudo de la fe", "Antiguo Testamento", "#2F80ED", "Historias y personajes del AT (Hebreos 11)"),
    ("👡", "Calzado del evangelio", "Jesús y los Evangelios", "#EB5757", "Vida, enseñanzas, milagros y parábolas"),
    ("⛑️", "Yelmo de la salvación", "Iglesia y cartas", "#9B51E0", "Hechos, las cartas y Apocalipsis"),
    ("🗡️", "Espada del Espíritu", "Versículos", "#F2994A", "¿Dónde dice?, completá, ¿quién lo escribió?"),
    ("🪢", "Cinto de la verdad", "Apologética y doctrina", "#27AE60", "Lo central de la fe y cómo responder"),
    ("🦺", "Coraza de justicia", "Personajes y vida cristiana", "#F2C94C", "Personajes de toda la Biblia y valores"),
]
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
    return {"roadmap": yaml.safe_load((DIR / "roadmap.yaml").read_text(encoding="utf-8")),
            "presupuesto": yaml.safe_load((DIR / "presupuesto.yaml").read_text(encoding="utf-8"))}


# ─────────────────────────────────────────────── gráficos ───────────────────────────────────────────────
def _estilo():
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib import font_manager
    for f in sorted(TIPO.glob("*.ttf")):
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
    colores = ["#c3c2b7", NOCHE, "#6b7bb6", GRANADA, AMBAR]
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
    mau = [1_500, 8_000, 22_000, 40_000, 60_000]
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


def graficos():
    graf_uso()
    graf_descargas()


# ─────────────────────────────────────────────── bloques ───────────────────────────────────────────────
def lista(items, clase="") -> str:
    return f'<ul class="{clase}">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


def bloque_resumen(D) -> str:
    p = D["presupuesto"]["items"]
    tot = {k: sum(i[k] for i in p) for k in ("minimo", "recomendado", "ideal")}
    pilares = [
        ("📖", "Leer", "Biblia gratis y sin publicidad, varias versiones e idiomas, audio y el «+» con notas y comentarios libres", "#1E2A5A"),
        ("🧭", "Aprender", "El Camino: la historia de la Biblia en niveles de 3–5 minutos, con Lani, rachas, ligas y repaso", "#2FA66A"),
        ("⚔️", "Jugar", "Espadeo (la armadura de Dios), Dibujalo, Tutti Frutti, el Rosco, el Impostor y desafíos diarios", "#EB5757"),
        ("🤝", "Juntos", "Amigos, grupos, Senda Reunión para el líder, la Liga Senda entre iglesias y la Copa Senda", "#9B51E0"),
        ("🌱", "Crecer", "Planes, desafíos con fecha, memorizar, apologética y Berea, la IA que siempre cita", "#F5A524"),
    ]
    pil = "".join(f'<div class="pil" style="--c:{c}"><div class="pil-i">{i}</div><b>{t}</b><span>{d}</span></div>' for i, t, d, c in pilares)
    fichas = [
        ("Para quién", "Jóvenes de 13 a 30 años, sus líderes y sus iglesias; foco protestante amplio"),
        ("Dónde", "Android e iOS desde el lanzamiento; web en 2028. Español primero; portugués e inglés en 2028"),
        ("Cómo se sostiene", "Gratis + Plus (USD 0,99/mes) + Líder (USD 2,99) + Iglesia (USD 9,99) + videos opcionales en los juegos"),
        ("Cuándo sale", "<b>18 de diciembre de 2026</b>, y una versión nueva cada dos semanas"),
        ("Cuánto cuesta", f"Primer año: USD {tot['minimo']:,} a {tot['ideal']:,}; recomendado <b>USD {tot['recomendado']:,}</b> por tramos".replace(",", ".")),
        ("La meta", "<b>1 millón de descargas en 2030</b>; lo que manda: personas con 3+ días con la Palabra por semana"),
    ]
    fic = "".join(f'<div class="fic"><div class="fic-k">{k}</div><div class="fic-v">{v}</div></div>' for k, v in fichas)
    dif = [
        "Todo en una sola app, en español de origen: leer, aprender, jugar y compartir con tu iglesia.",
        "La <b>armadura de Dios</b> como corazón de la trivia: se gana juntando las 6 piezas de Efesios 6.",
        "<b>Senda Reunión</b>: el líder arma y juega la reunión en pantalla grande con 20 a 200 chicos.",
        "La <b>Liga Senda</b>: cada iglesia es un equipo; una iglesia invita a la siguiente.",
        "La primera Biblia con <b>notas y comentarios libres en español</b>, detrás del «+».",
        "Gamificación que edifica: día de reposo, cofres que no se venden, la racha se recupera leyendo.",
        "<b>Berea</b>: una IA que responde siempre con la Biblia citada y te manda a verificar.",
    ]
    etapas = [("dic-26", "MVP «Primera luz»", "Biblia, Camino, Espadeo, Lámpara"), ("mar-27", "v1 «Reunión»", "Senda Reunión, grupos, ligas, suscripciones"),
              ("ago-27", "v2 «Liga»", "Liga y Copa Senda, más juegos, Berea"), ("dic-27", "v3 «Iglesia»", "Púlpito, plan Iglesia, Tu año en la Palabra"),
              ("2028", "Nuevos idiomas", "Portugués, inglés y web"), ("2030", "El millón", "Ligas nacionales, Prode del Mundial")]
    et = "".join(f'<div class="et"><div class="et-f">{f}</div><b>{n}</b><span>{d}</span></div>' for f, n, d in etapas)
    return f"""
<p class="lead-s"><b>Senda</b> es una app cristiana para que los jóvenes conozcan la Biblia jugando, leyendo y en comunidad. Junta en
un solo lugar, en español de origen, lo que hoy está repartido en cinco apps en inglés.</p>
<div class="pils">{pil}</div>
<div class="fics">{fic}</div>
<div class="duo">
<div class="caja si"><h4>⭐ El diferencial</h4>{lista(dif, 'apretada')}</div>
<div class="caja"><h4>🗺️ Cómo crece: publicada temprano y por etapas</h4><div class="ets">{et}</div>
<p class="nota" style="margin-top:2mm">Cada etapa prueba una hipótesis y tiene una condición para seguir. La primera regla de corte es el
30 de abril de 2027 (capítulo {{{{cap:26}}}}).</p></div>
</div>
<div class="caja rec"><h4>✋ Lo que necesito de vos para arrancar</h4>
<p>Responder las decisiones del capítulo {{{{cap:27}}}} (nombre, mascota, versión bíblica, presupuesto, cuentas), abrir las cuentas de Google Play y
Apple, elegir 2 revisores y 12 testers, hacer las entrevistas de validación y empezar la rutina de redes. Todo gasto y toda publicación
salen con tu aprobación.</p></div>"""


def bloque_mapa_app() -> str:
    tabs = [
        ("🏠", "Inicio", "Hoy", ["Versículo del día", "Tu Lámpara", "Seguir donde quedaste", "Misiones y cofre", "Maná del día", "Duelos pendientes", "Tu grupo"], "#1E2A5A", "Arena"),
        ("📖", "Biblia", "Santuario", ["Lector y versiones", "Audio", "«+» notas y comentarios", "Planes", "Notas y resaltados", "Búsqueda", "Lámpara"], "#8a6d3b", "Santuario"),
        ("🧭", "Camino", "Aprender", ["Ruta principal (13 secciones)", "Rutas temáticas", "Práctica de repaso", "Guardá la Palabra", "Preparados", "Ligas de las 12 piedras"], "#2FA66A", "Arena"),
        ("⚔️", "Jugar", "Jugar", ["Espadeo (duelos y modos)", "¡Desenvainá!", "Dibujalo · Tutti Frutti", "El Rosco · El Impostor", "¿Quién soy?", "Senda Reunión", "Torneos"], "#EB5757", "Arena"),
        ("🤝", "Comunidad", "Juntos", ["Amigos", "Mi grupo y mi iglesia", "Liga Senda", "Oremos", "Agenda", "Berea (IA)"], "#9B51E0", "Arena"),
    ]
    cols = []
    for ico, n, sub, items, c, clima in tabs:
        cols.append(f'<div class="mt" style="--c:{c}"><div class="mt-h"><span>{ico}</span><b>{n}</b></div><div class="mt-c">Clima: {clima}</div>'
                    + "".join(f"<div class=mt-i>{esc(i)}</div>" for i in items) + "</div>")
    perfil = ('<div class="mt-perfil">👤 <b>Perfil</b> (tu avatar, arriba a la derecha): avatar, versículo preferido, qué significa tu nombre, '
              'insignias, estadísticas, tienda, plan y ajustes</div>')
    return f'<div class="mapa-tabs">{"".join(cols)}</div>{perfil}'


def bloque_bucles() -> str:
    bucles = [
        ("Diario (hábito)", "#F5A524", ["Aviso a tu hora", "Versículo del día", "Lección de 4 minutos", "Rayito en la Lámpara", "Compartís el versículo o tu resultado"]),
        ("Amigos (crecimiento)", "#EB5757", ["Desafiás a un amigo a un duelo", "No tiene la app: le llega un enlace", "La instala para jugar", "Juegan", "Ahora él invita a otro"]),
        ("Grupo (el más fuerte)", "#9B51E0", ["El líder arma la reunión", "20 a 60 chicos juegan en la sala", "Al otro día siguen en el Camino", "Suman a la liga de su iglesia", "Desafían a otra iglesia"]),
        ("Contenido", "#2FA66A", ["Proponés una pregunta", "La comunidad vota", "Los revisores la aprueban", "Aparece con tu nombre", "La compartís"]),
        ("Temporada", "#1E2A5A", ["Desafío con fecha", "Toda la comunidad a la vez", "Publicaciones en Instagram", "Usuarios nuevos", "Próximo desafío"]),
    ]
    out = []
    for n, c, pasos in bucles:
        chips = '<i>↓</i>'.join(f"<span>{esc(p)}</span>" for p in pasos)
        out.append(f'<div class="bucle" style="--c:{c}"><b>{n}</b><div class="bucle-p">{chips}<i>↺ vuelve a empezar</i></div></div>')
    return f'<div class="bucles">{"".join(out)}</div>'


def bloque_armadura() -> str:
    cards = "".join(f'<div class="pz" style="--c:{c}"><div class="pz-i">{i}</div><div class="pz-n">{esc(n)}</div>'
                    f'<div class="pz-c">{esc(cat)}</div><div class="pz-d">{esc(d)}</div></div>' for i, n, cat, c, d in PIEZAS)
    return (f'<div class="armadura">{cards}</div><p class="nota">«Tomad toda la armadura de Dios… el escudo de la fe… el yelmo de la '
            'salvación, y la espada del Espíritu, que es la palabra de Dios» (Efesios 6:13–17). Ganás el duelo cuando completás las seis piezas.</p>')


def bloque_paleta() -> str:
    tonos = [("Ámbar Lámpara", AMBAR, "#1B1B1F"), ("Azul Noche", NOCHE, "#fff"), ("Verde Brote", VERDE, "#fff"), ("Rojo Granada", GRANADA, "#fff"),
             ("Crema Pergamino", CREMA, "#1B1B1F"), ("Tinta", TINTA, "#fff")]
    sw = "".join(f'<div class="sw" style="background:{c};color:{t}"><b>{n}</b><span>{c}</span></div>' for n, c, t in tonos)
    pz = "".join(f'<div class="sw sw-s" style="background:{c};color:{"#1B1B1F" if c == "#F2C94C" else "#fff"}"><b>{i} {esc(n)}</b><span>{c}</span></div>'
                 for i, n, _, c, _ in PIEZAS)
    return f'<div class="paleta">{sw}</div><div class="paleta">{pz}</div>'


def lani_svg(ancho=150) -> str:
    return f"""<svg viewBox="0 0 200 200" width="{ancho}" height="{ancho}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Boceto de Lani">
<ellipse cx="100" cy="186" rx="52" ry="7" fill="#000" opacity=".08"/>
<g fill="#3b3a48"><rect x="78" y="155" width="10" height="24" rx="5"/><rect x="93" y="158" width="10" height="23" rx="5"/>
<rect x="107" y="158" width="10" height="23" rx="5"/><rect x="122" y="155" width="10" height="24" rx="5"/></g>
<g fill="#FFF6E6" stroke="#E6D8C0" stroke-width="2">
<circle cx="72" cy="128" r="26"/><circle cx="128" cy="128" r="26"/><circle cx="84" cy="150" r="22"/><circle cx="116" cy="150" r="22"/>
<circle cx="100" cy="132" r="34"/><circle cx="100" cy="108" r="24"/><circle cx="76" cy="108" r="18"/><circle cx="124" cy="108" r="18"/></g>
<path d="M72 112 Q100 128 128 112 L131 122 Q100 140 69 122 Z" fill="#F5A524"/>
<path d="M112 124 L124 148 L110 146 Z" fill="#E59412"/>
<ellipse cx="66" cy="84" rx="16" ry="7" fill="#3b3a48" transform="rotate(-28 66 84)"/>
<ellipse cx="134" cy="84" rx="16" ry="7" fill="#3b3a48" transform="rotate(28 134 84)"/>
<ellipse cx="66" cy="84" rx="9" ry="3.5" fill="#f2a7a7" transform="rotate(-28 66 84)"/>
<ellipse cx="134" cy="84" rx="9" ry="3.5" fill="#f2a7a7" transform="rotate(28 134 84)"/>
<ellipse cx="100" cy="88" rx="27" ry="30" fill="#3b3a48"/>
<g fill="#FFF6E6" stroke="#E6D8C0" stroke-width="2"><circle cx="88" cy="60" r="10"/><circle cx="100" cy="55" r="12"/><circle cx="112" cy="60" r="10"/></g>
<circle cx="89" cy="86" r="9.5" fill="#fff"/><circle cx="111" cy="86" r="9.5" fill="#fff"/>
<circle cx="91" cy="88" r="5.5" fill="#1B1B1F"/><circle cx="113" cy="88" r="5.5" fill="#1B1B1F"/>
<circle cx="93" cy="85.5" r="2" fill="#fff"/><circle cx="115" cy="85.5" r="2" fill="#fff"/>
<path d="M82 74 Q89 70 96 74" stroke="#FFF6E6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M104 74 Q111 70 118 74" stroke="#FFF6E6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<circle cx="82" cy="100" r="4" fill="#f2a7a7" opacity=".75"/><circle cx="118" cy="100" r="4" fill="#f2a7a7" opacity=".75"/>
<path d="M93 103 Q100 110 107 103" stroke="#FFF6E6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<g transform="translate(150 128)"><path d="M-10 18 L10 18 L7 6 L-7 6 Z" fill="#C98A1B"/><ellipse cx="0" cy="6" rx="11" ry="4" fill="#E59412"/>
<path d="M0 -14 C6 -6 7 0 0 4 C-7 0 -6 -6 0 -14 Z" fill="#FFC857"/><path d="M0 -6 C3 -2 3 1 0 3 C-3 1 -3 -2 0 -6 Z" fill="#fff4d6"/></g>
</svg>"""


def bloque_lani() -> str:
    emociones = [("😊", "Alegría"), ("🤩", "Festejo"), ("🤔", "Pensando"), ("😮", "Sorpresa"), ("😢", "Uy (1 segundo)"), ("😴", "Dormida"), ("💪", "¡Vamos!"), ("🛡️", "Con la armadura")]
    em = "".join(f"<span>{e}<small>{n}</small></span>" for e, n in emociones)
    return f"""<div class="lani">
<div class="lani-svg">{lani_svg(170)}</div>
<div class="lani-txt"><div class="lani-k">Boceto de concepto (no es el diseño final)</div>
<p>Lani: oveja joven, redonda, ojos grandes y cejas marcadas, bufanda ámbar (el color de la Lámpara) y su lámpara al lado. La versión final la
dibuja y la anima un profesional con esta guía.</p><div class="emos">{em}</div></div></div>"""


def logo_svg(tam=120, con_texto=True) -> str:
    icono = f"""<svg viewBox="0 0 120 120" width="{tam}" height="{tam}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Concepto de logo">
<rect x="0" y="0" width="120" height="120" rx="28" fill="{NOCHE}"/>
<path d="M80 38 C58 30 36 40 40 56 C44 72 82 64 80 84 C78 100 54 102 38 92" stroke="{AMBAR}" stroke-width="13" fill="none" stroke-linecap="round"/>
<path d="M88 14 C96 24 97 32 88 38 C79 32 80 24 88 14 Z" fill="#FFC857"/><path d="M88 23 C91 28 91 32 88 34 C85 32 85 28 88 23 Z" fill="#FFF4D6"/>
</svg>"""
    if not con_texto:
        return icono
    return f'<div class="logo-c">{icono}<div class="logo-t">senda</div></div>'


def bloque_logo() -> str:
    return f"""<div class="logos">
<div class="logo-b">{logo_svg(110)}<small>Símbolo + logotipo (concepto)</small></div>
<div class="logo-b"><div class="logo-ico">{logo_svg(64, False)}{logo_svg(44, False)}{logo_svg(28, False)}</div><small>Ícono de la app en tres tamaños</small></div>
<div class="logo-b logo-claro"><div class="logo-c">{logo_svg(64, False)}<div class="logo-t" style="color:{NOCHE}">senda</div></div><small>Sobre fondo claro</small></div>
</div><p class="nota">Concepto: una S que es un camino y, arriba, la llama de una lámpara. Es una guía para el diseñador, no el logo final.</p>"""


def bloque_arquitectura() -> str:
    return f"""<div class="arq">
<div class="arq-col">
<div class="arq-t">En el teléfono (y la web en 2028)</div>
<div class="arq-b arq-app"><b>App Senda</b> · React Native + Expo (TypeScript)<div class="arq-mini"><span>Rive (Lani)</span><span>Reanimated</span><span>Skia (dibujo, ruleta)</span><span>Lottie</span><span>Sonido + vibración</span><span>SQLite (sin conexión)</span></div></div>
<div class="arq-b">Tiendas: Google Play y App Store · compila y publica Expo EAS · actualizaciones por aire</div>
</div>
<div class="arq-flecha">⇄</div>
<div class="arq-col">
<div class="arq-t">Servicios propios</div>
<div class="arq-b arq-core"><b>Supabase</b><div class="arq-mini"><span>Postgres + reglas por fila</span><span>Cuentas (Google, Apple, correo)</span><span>Tiempo real (salas, duelos)</span><span>Funciones del servidor</span><span>Archivos</span></div></div>
<div class="arq-b"><b>Cloudflare R2 + CDN</b>: Biblias, audios, paquetes de contenido, imágenes</div>
<div class="arq-b"><b>Web</b>: sitio, páginas para compartir (Next.js)</div>
</div>
<div class="arq-flecha">⇄</div>
<div class="arq-col">
<div class="arq-t">Servicios externos</div>
<div class="arq-b"><b>API de Claude</b>: Berea, planificador, moderación, contenido por lotes</div>
<div class="arq-b"><b>Voz neuronal</b> (Google o Azure): audio de la Biblia, una vez</div>
<div class="arq-b"><b>RevenueCat</b>: suscripciones · <b>AdMob</b>: videos</div>
<div class="arq-b"><b>PostHog</b>: analítica y experimentos · <b>Sentry</b>: errores</div>
<div class="arq-b"><b>Avisos</b>: FCM (Android) y APNs (iOS)</div>
</div></div>"""


def bloque_presupuesto(D) -> str:
    it = D["presupuesto"]["items"]
    filas = "".join(f'<tr><td>{esc(i["que"])}</td><td class="num">{i["minimo"]:,}</td><td class="num"><b>{i["recomendado"]:,}</b></td>'
                    f'<td class="num">{i["ideal"]:,}</td><td>{i["tramo"]}</td><td>{esc(i["cuando"])}</td></tr>'.replace(",", ".") for i in it)
    tot = {k: sum(i[k] for i in it) for k in ("minimo", "recomendado", "ideal")}
    filas += (f'<tr class="tot"><td>Total del primer año</td><td class="num">{tot["minimo"]:,}</td><td class="num">{tot["recomendado"]:,}</td>'
              f'<td class="num">{tot["ideal"]:,}</td><td></td><td></td></tr>').replace(",", ".")
    return ('<table class="tabla"><thead><tr><th>Gasto único (USD)</th><th class="num">Mínimo</th><th class="num">Recomendado</th>'
            f'<th class="num">Ideal</th><th>Tramo</th><th>Cuándo</th></tr></thead><tbody>{filas}</tbody></table>')


TRAMOS = {
    1: ("Arranque", "Oct–nov 2026", "Siempre: es lo mínimo para lanzar bien"),
    2: ("Lanzamiento", "Nov 2026 – ene 2027", "La prueba cerrada muestra que la gente termina lecciones y vuelve"),
    3: ("Lani viva y arte", "Dic 2026 – mar 2027", "En enero hay 500 o más personas activas por semana"),
    4: ("Crecer", "Mar–dic 2027", "El desafío de 21 días tuvo 500 participantes (la publicidad paga, además, espera los datos de retención)"),
}


def bloque_tramos(D) -> str:
    it = D["presupuesto"]["items"]
    filas = []
    for t, (n, cuando, cond) in TRAMOS.items():
        sel = [i for i in it if i["tramo"] == t]
        monto = sum(i["recomendado"] for i in sel)
        incl = ", ".join(i["que"].split(" (")[0].lower() for i in sel)
        filas.append(f'<tr><td><b>{t}. {n}</b></td><td>{cuando}</td><td>{esc(incl[0].upper() + incl[1:])}</td>'
                     f'<td class="num"><b>{monto:,}</b></td><td>{esc(cond)}</td></tr>'.replace(",", "."))
    return ('<table class="tabla"><thead><tr><th>Tramo</th><th>Cuándo</th><th>Qué incluye</th><th class="num">USD</th><th>Se paga si…</th></tr></thead>'
            f'<tbody>{"".join(filas)}</tbody></table>')


def bloque_fases(D) -> str:
    filas = []
    for f in D["roadmap"]["fases"]:
        d0, d1 = fecha(f["desde"]), fecha(f["hasta"])
        hip = f'<div class="hip">Hipótesis: {esc(f["hipotesis"])}</div>' if f.get("hipotesis") else ""
        filas.append(f'<tr><td class="c-n">{f["id"]}</td><td><b>{esc(f["nombre"])}</b><br><small>{fecha_txt(d0)} → {fecha_txt(d1)}</small></td>'
                     f'<td>{esc(f["objetivo"])}{hip}</td><td>{lista([esc(x) for x in f["entregables"]], "apretada")}</td><td>{esc(f["salida"])}</td></tr>')
    return ('<table class="tabla fases"><thead><tr><th></th><th style="width:17%">Fase</th><th style="width:22%">Objetivo</th>'
            f'<th style="width:36%">Entregables</th><th>Para seguir</th></tr></thead><tbody>{"".join(filas)}</tbody></table>')


# ─────────────────────────────────────────────── pantallas de ejemplo (mockups) ───────────────────────────────────────────────
def _tel(cuerpo: str, titulo: str, clase: str = "", nav: str | None = "") -> str:
    tabs = [("🏠", "Inicio"), ("📖", "Biblia"), ("🧭", "Camino"), ("⚔️", "Jugar"), ("🤝", "Comunidad")]
    barra = ""
    if nav is not None:
        barra = '<div class="t-nav">' + "".join(f'<span class="{"on" if n == nav else ""}">{i}<small>{n}</small></span>' for i, n in tabs) + "</div>"
    return (f'<figure class="tel-f"><div class="tel {clase}"><div class="t-status"><span>9:41</span><span>●●● ▮</span></div>'
            f'<div class="t-body">{cuerpo}</div>{barra}</div><figcaption>{titulo}</figcaption></figure>')


def _top(vidas=True) -> str:
    v = '<span>❤️ 5</span>' if vidas else ""
    return f'<div class="t-top">{v}<span>🪔 12</span><span>🪙 340</span><span class="t-av">🧑</span></div>'


def mock_inicio() -> str:
    c = f"""{_top(False)}<div class="t-hola">¡Hola, Joaquín!</div>
<div class="t-card t-vd"><div class="t-k">Versículo del día</div><div class="t-verso">«Lámpara es a mis pies tu palabra, y lumbrera a mi camino.»</div>
<div class="t-ref">Salmo 119:105 · RVR1909</div><div class="t-acc"><span>🔊</span><span>↗ Compartir</span></div></div>
<div class="t-card t-seguir"><div><div class="t-k">Seguí donde quedaste</div><b>Camino · Noé, nivel 3</b><div class="t-bar"><i style="width:60%"></i></div></div><span class="t-btn-s">▶</span></div>
<div class="t-card"><div class="t-k">Misiones de hoy</div>
<div class="t-mis"><span>✅ Completá 2 lecciones</span><em>15 🪙</em></div>
<div class="t-mis"><span>⬜ Compartí el versículo</span><em>15 🪙</em></div>
<div class="t-mis"><span>⬜ Orá por un pedido</span><em>15 🪙</em></div></div>
<div class="t-dos"><div class="t-mini" style="--c:#F5A524">🎡<b>Maná del día</b></div><div class="t-mini" style="--c:#EB5757">⚔️<b>Te toca con Sofi</b></div></div>"""
    return _tel(c, "Inicio: lo de hoy, y la pantalla termina", nav="Inicio")


def mock_camino_ruta() -> str:
    nodos = [("done", "✓", 10), ("done", "✓", 38), ("cur", "▶", 22), ("lock", "🎁", 44), ("lock", "🔒", 18), ("lock", "🔒", 36)]
    ns = "".join(f'<div class="nodo {k}" style="margin-left:{m}%">{t}</div>' for k, t, m in nodos)
    c = f"""{_top()}<div class="t-seccion"><small>Sección 1 · Los comienzos</small><b>Unidad 3: Noé</b></div>
<div class="ruta">{ns}<div class="ruta-lani">{lani_svg(40)}</div></div>"""
    return _tel(c, "Camino: el recorrido de niveles", nav="Camino")


def mock_camino_leccion() -> str:
    c = """<div class="t-lec"><span>✕</span><div class="t-bar"><i style="width:62%"></i></div><span>❤️ 4</span></div>
<div class="t-q">¿Qué señal puso Dios después del diluvio?</div>
<div class="t-op ok">🌈 Un arcoíris</div><div class="t-op">⭐ Una estrella</div><div class="t-op">🕊️ Una paloma</div><div class="t-op">🔥 Una columna de fuego</div>
<div class="t-fb"><b>¡Bien!</b> Génesis 9:13 <span class="t-leer">Leer el pasaje</span><div class="t-cont">CONTINUAR</div></div>"""
    return _tel(c, "Lección: acierto con su cita", nav=None)


def mock_espadeo_ruleta() -> str:
    cols = [c for _, _, _, c, _ in PIEZAS] + ["#FFC857"]
    seg = 360 / 7
    grad = ", ".join(f"{c} {i*seg:.1f}deg {(i+1)*seg:.1f}deg" for i, c in enumerate(cols))
    slots = "".join(f'<span class="{"on" if k < 3 else ""}" style="--c:{c}">{i}</span>' for k, (i, _, _, c, _) in enumerate(PIEZAS))
    c = f"""<div class="t-duelo"><div><span class="t-av">🧑</span><b>Vos</b><em>3</em></div><div class="vs">VS</div><div><em>2</em><b>Sofi</b><span class="t-av">👩</span></div></div>
<div class="t-slots">{slots}</div>
<div class="ruleta-w"><div class="ruleta" style="background:conic-gradient({grad})"><div class="ruleta-c">⚔️</div></div><div class="ruleta-p">▼</div></div>
<div class="t-btn">¡GIRAR!</div>"""
    return _tel(c, "Espadeo: la ruleta y tu armadura", nav="Jugar")


def mock_espadeo_pregunta() -> str:
    c = """<div class="t-cat" style="--c:#2F80ED">🛡️ Escudo de la fe <small>Antiguo Testamento</small></div>
<div class="t-timer"><i style="width:70%"></i></div>
<div class="t-q">¿Quién fue vendido por sus hermanos y llegó a gobernar en Egipto?</div>
<div class="t-op ok">José</div><div class="t-op">Moisés</div><div class="t-op">Daniel</div><div class="t-op">Jacob</div>
<div class="t-ayudas"><span>💡 Luz</span><span>⏱️ Tiempo</span><span>📜 Pista</span><span>🔄 Cambiar</span></div>
<div class="t-ref2">Génesis 37:28 · Leer el pasaje</div>"""
    return _tel(c, "Espadeo: pregunta de la pieza Escudo de la fe", nav=None)


def mock_biblia() -> str:
    c = """<div class="t-bib-h"><span>‹</span><b>Juan 3</b><span class="t-ver">RVR1909 ▾</span><span>🔊</span></div>
<div class="t-bib"><p><sup>16</sup><em class="mas">+</em>Porque de tal manera amó Dios al mundo, que haya dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.</p>
<p><sup>17</sup><em class="mas">+</em>Porque no envió Dios a su Hijo al mundo, para que condene al mundo, mas para que el mundo sea salvo por él.</p></div>
<div class="t-hoja"><div class="t-asa"></div><div class="t-hoja-v">Juan 3:16</div>
<div class="t-tabs"><span class="on">Notas</span><span>Comentarios</span><span>Referencias</span><span>Palabras</span><span>Lugares</span></div>
<div class="t-com"><b>Notas de estudio</b><small>Tyndale Open Study Notes · CC BY-SA · traducción revisada</small><i></i><i></i><i style="width:70%"></i></div>
<div class="t-com"><b>Matthew Henry (1706)</b><small>Dominio público · traducción revisada</small><i></i><i style="width:80%"></i></div>
<div class="t-com"><b>Referencias</b><small>Romanos 5:8 · 1 Juan 4:9 · Juan 1:14</small></div></div>"""
    return _tel(c, "Biblia: el «+» abre notas y comentarios", clase="santuario", nav="Biblia")


def mock_perfil() -> str:
    c = """<div class="t-perfil"><div class="t-avg">🧑</div><b>Joaquín</b><small>@joaco · Iglesia Esperanza</small>
<div class="t-bio">Fútbol, guitarra y el grupo de los sábados.</div></div>
<div class="t-card t-fila"><span>📖 Versículo preferido</span><b>Josué 1:9</b></div>
<div class="t-card t-fila"><span>✨ Qué significa mi nombre</span><b>«Dios levantará» (hebreo)</b></div>
<div class="t-stats"><div><b>🪔 12</b><small>Lámpara</small></div><div><b>🌱 7</b><small>Brote</small></div><div><b>🛡️ 23</b><small>Armaduras</small></div><div><b>💛 18</b><small>Guardados</small></div></div>
<div class="t-ins"><span>🪔7</span><span>🛡️</span><span>✍️</span><span>📖</span></div>
<div class="t-btn t-btn2">🤝 CONECTAR HERMANO</div>"""
    return _tel(c, "Perfil: quién sos en la fe y cómo vas", nav="Comunidad")


def mock_reunion() -> str:
    qr = "".join(f'<i class="{"n" if (i * 7 + i // 9) % 3 else ""}"></i>' for i in range(81))
    barras = [("#2F80ED", "Mateo", 23, True), ("#EB5757", "Marcos", 5, False), ("#F2994A", "Lucas", 7, False), ("#27AE60", "Juan", 3, False)]
    bs = "".join(f'<div class="tv-b" style="--c:{c}"><span>{n}{" ✓" if ok else ""}</span><i style="width:{v/23*100:.0f}%"></i><em>{v}</em></div>' for c, n, v, ok in barras)
    return f"""<figure class="tel-f"><div class="tvm"><div class="tv-l"><div class="tv-k">Senda Reunión</div><b>Sala 482 913</b>
<div class="qr">{qr}</div><small>Entrá desde la app Senda</small><div class="tv-j">👥 38 jugadores</div></div>
<div class="tv-r"><div class="tv-q">¿En qué libro está el Sermón del monte?</div>{bs}
<div class="tv-pod"><span>🥈 Mica</span><span class="p1">🥇 Tomi</span><span>🥉 Lu</span></div></div></div>
<figcaption>Senda Reunión en la pantalla grande: trivia en vivo con todo el grupo</figcaption></figure>"""


def bloque_mock(nombre: str) -> str:
    if nombre == "camino":
        return f'<div class="mocks">{mock_camino_ruta()}{mock_camino_leccion()}</div>'
    if nombre == "espadeo":
        return f'<div class="mocks">{mock_espadeo_ruleta()}{mock_espadeo_pregunta()}</div>'
    raise KeyError(nombre)


def bloque_mocks_ux() -> str:
    return (f'<div class="mocks">{mock_inicio()}{mock_biblia()}{mock_perfil()}</div>'
            f'<div class="mocks">{mock_reunion()}</div>'
            '<p class="nota">Pantallas de ejemplo para mostrar la estructura y el tono; el diseño final sale del sistema de diseño y de las '
            'pruebas con jóvenes. Las del Camino y Espadeo están en sus capítulos.</p>')


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
        filas.append(f'<div class="gx-fila gx-fases"><div class="gx-nom">🚀 Fases y versiones</div><div class="gx-pistas">{"".join(bandas)}'
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
<div class="gx-fila gx-hitos"><div class="gx-nom">◆ Hitos</div><div class="gx-pistas">{"".join(bandas)}<div class="gx-pista">{marcas_h}</div></div></div>
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
PARTES = {1: "I · Qué es y por qué", 6: "II · La app, módulo por módulo", 16: "III · Cómo se ve, se cuenta y se sostiene",
          21: "IV · Cómo se construye y se cuida", 25: "V · Plata, tiempos y decisiones"}


def portada(D) -> str:
    p = D["presupuesto"]["items"]
    reco = sum(i["recomendado"] for i in p)
    pilares = [("📖", "Leer", "Biblia gratis, audio y el «+»", "#1E2A5A"), ("🧭", "Aprender", "El Camino con Lani", "#2FA66A"),
               ("⚔️", "Jugar", "Espadeo y juegos", "#EB5757"), ("🤝", "Juntos", "Grupos, Reunión y Liga", "#9B51E0"),
               ("🌱", "Crecer", "Planes, memoria y Berea", "#F5A524")]
    pil = "".join(f'<div style="--c:{c}"><span style="font-size:15pt">{i}</span><b>{t}</b>{d}</div>' for i, t, d, c in pilares)
    datos = [("18-12-2026", "sale en Android e iOS (versión mínima que ya sirve)"), ("cada 2 semanas", "una versión nueva, con la app publicada"),
             (f"USD {reco:,}".replace(",", "."), "primer año, recomendado, pagado por tramos"), ("1 millón", "de descargas: la meta para fines de 2030")]
    dt_ = "".join(f"<div><b>{a}</b><span>{b}</span></div>" for a, b in datos)
    return f"""<section class="portada-s">
<div class="ps-marca">Holding · Proyecto P1 · Documento de trabajo · 30 de septiembre de 2026 · uso privado</div>
<div class="ps-hero"><div><h1>Senda</h1><p class="ps-sub">El proyecto completo de la app</p>
<p class="ps-lema">Una app cristiana para que los jóvenes conozcan la Biblia <b>jugando, leyendo y en comunidad</b>. Gratis para leer y aprender;
en español de origen; Android e iOS primero y la web después.</p></div>
<div class="ps-img">{lani_svg(190)}{logo_svg(64)}</div></div>
<div class="ps-pils">{pil}</div>
<div class="ps-datos">{dt_}</div>
<div class="ps-mv"><div><span>Misión</span>Ayudar a cada joven a conocer, amar y vivir la Palabra de Dios todos los días, con una experiencia alegre y
excelente, en comunidad, gratis y en su idioma.</div><div><span>Visión</span>Ser la app cristiana número uno del mundo de habla hispana y
portuguesa —la más descargada y la que mejor edifica a los jóvenes—, y una generación que conoce las Escrituras.</div></div>
<div class="ps-pie">Definición, marco teórico, benchmark, módulos, gamificación, UX/UI, marca, contenido, monetización, tecnología, legal y
propiedad intelectual, operación, riesgos, presupuesto y roadmap. HECHO lleva fuente y fecha; ESTIMACIÓN lleva método. Nada que mueva
plata o hable con terceros sale sin la aprobación del fundador. Mascota y logo son bocetos de concepto.</div>
</section>"""


def fuentes_css(incrustar: bool) -> str:
    reglas = []
    for peso in (400, 500, 600, 700, 800):
        f = TIPO / f"inter-latin-{peso}-normal.woff2"
        src = ("data:font/woff2;base64," + base64.b64encode(f.read_bytes()).decode()) if incrustar else f"../tipografia/{f.name}"
        reglas.append(f"@font-face{{font-family:'Inter';font-style:normal;font-weight:{peso};font-display:block;"
                      f"src:url('{src}') format('woff2');}}")
    return "\n".join(reglas)


def construir_html(D, incrustar: bool = False, paginas: dict | None = None) -> str:
    bloques = {
        "{{RESUMEN}}": lambda: bloque_resumen(D),
        "{{MAPA_APP}}": bloque_mapa_app,
        "{{BUCLES}}": bloque_bucles,
        "{{ARMADURA}}": bloque_armadura,
        "{{LANI}}": bloque_lani,
        "{{PALETA}}": bloque_paleta,
        "{{LOGO}}": bloque_logo,
        "{{ARQUITECTURA}}": bloque_arquitectura,
        "{{PRESUPUESTO}}": lambda: bloque_presupuesto(D),
        "{{TRAMOS}}": lambda: bloque_tramos(D),
        "{{FASES}}": lambda: bloque_fases(D),
        "{{GANTT_DETALLE}}": lambda: bloque_gantt_detalle(D),
        "{{GANTT_GENERAL}}": lambda: bloque_gantt_general(D),
        "{{MOCKS_UX}}": bloque_mocks_ux,
        "{{MOCK:camino}}": lambda: bloque_mock("camino"),
        "{{MOCK:espadeo}}": lambda: bloque_mock("espadeo"),
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
        graficos()
    SALIDA_HTML.write_text(construir_html(D, incrustar=False), encoding="utf-8")
    print("HTML de trabajo:", SALIDA_HTML)
    if args.solo_html:
        return 0
    env = dict(os.environ)
    env.setdefault("NODE_PATH", "/opt/node22/lib/node_modules")

    def imprimir():
        subprocess.run(["node", str(RAIZ / "informes" / "imprimir_pdf.cjs"), str(SALIDA_HTML), str(SALIDA_PDF), "Senda · Proyecto completo", "css"],
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
