"""Pantallas de ejemplo de Senda v2 (bocetos de dirección con la paleta B, tipografías nuevas e íconos propios).

Lo usa informes/construir_senda.py. Los estilos están en informes/fuente-senda/estilo.css (sección «v2 · pantallas»).
"""
from __future__ import annotations

import math

import senda_visual as V
from senda_visual import AMBAR, CAT, CATS, INDIGO, NOCHE, ORO, VERDE, VIOLETA, icono, lani, pieza_svg

TABS = [("inicio", "Inicio"), ("biblia", "Biblia"), ("travesia", "Travesía"), ("jugar", "Jugar"), ("comunidad", "Comunidad")]


# ─────────────────────────────── piezas comunes ───────────────────────────────
def tel(cuerpo: str, pie: str, nav: str | None = "Inicio", clase: str = "", fondo: str = "") -> str:
    barra = ""
    if nav is not None:
        barra = '<div class="ph-nav">' + "".join(
            f'<span class="{"on" if n == nav else ""}">{icono(k, 13, "currentColor")}<i>{n}</i></span>' for k, n in TABS) + "</div>"
    st = (f'<div class="ph-st"><span>9:41</span><span class="ph-sig"><i></i><i></i><i></i><b></b></span></div>')
    return (f'<figure class="mk"><div class="ph"><div class="ph-s {clase}" style="{fondo}"><div class="ph-isla"></div>{st}'
            f'<div class="ph-b">{cuerpo}</div>{barra}</div></div><figcaption>{pie}</figcaption></figure>')


def chips(vidas: str | int = 5, racha: int = 12, talentos: str = "340", avatar: bool = True) -> str:
    av = f'<span class="chp-av">{lani("reposo", 13, sombra=False)}</span>' if avatar else ""
    return (f'<div class="chips-top"><span class="chp">{icono("vida", 10, V.ROJO)}{vidas}</span>'
            f'<span class="chp">{icono("racha", 10, AMBAR)}{racha}</span><span class="chp">{icono("talento", 10, ORO)}{talentos}</span>{av}</div>')


def destellos(color: str = ORO, n: int = 10, r0: float = 18, r1: float = 34, tam: float = 90) -> str:
    """Explosión de partículas (para aciertos y premios)."""
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n + .3
        x0, y0 = 50 + r0 * math.cos(a), 50 + r0 * math.sin(a)
        x1, y1 = 50 + r1 * math.cos(a), 50 + r1 * math.sin(a)
        pts.append(f'<path d="M{x0:.1f} {y0:.1f} L{x1:.1f} {y1:.1f}" stroke="{color}" stroke-width="2.6" stroke-linecap="round"/>')
        if k % 2 == 0:
            xs, ys = 50 + (r1 + 6) * math.cos(a + .15), 50 + (r1 + 6) * math.sin(a + .15)
            pts.append(f'<circle cx="{xs:.1f}" cy="{ys:.1f}" r="2" fill="#fff"/>')
    return f'<svg class="burst" viewBox="0 0 100 100" width="{tam}" height="{tam}">{"".join(pts)}</svg>'


def chispas() -> str:
    """Destellos de cuatro puntas alrededor de un acierto."""
    est = '<svg viewBox="0 0 20 20" width="{t}" height="{t}" style="{p}"><path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0Z" fill="{c}"/></svg>'
    pos = [("left:-1mm;top:-1.2mm", 12, ORO), ("right:-.6mm;top:.4mm", 8, "#fff"), ("right:1.6mm;bottom:-1.6mm", 11, ORO), ("left:2mm;bottom:-.8mm", 7, "#fff")]
    return '<div class="chs">' + "".join(est.format(t=t, p=p, c=c) for p, t, c in pos) + "</div>"


def rayos(color: str = ORO) -> str:
    rs = "".join(f'<path d="M100 100 L{100 + 160 * math.cos(math.radians(a)):.0f} {100 + 160 * math.sin(math.radians(a)):.0f} '
                 f'L{100 + 160 * math.cos(math.radians(a + 9)):.0f} {100 + 160 * math.sin(math.radians(a + 9)):.0f}Z" fill="{color}" opacity=".13"/>'
                 for a in range(0, 360, 24))
    return f'<svg class="rayos" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">{rs}</svg>'


def barra(p: float, color: str = VERDE) -> str:
    return f'<div class="bar2"><i style="width:{p:.0f}%;background:{color}"></i></div>'


# ─────────────────────────────── Inicio ───────────────────────────────
def m_inicio() -> str:
    dias = [("L", "12"), ("M", "13"), ("X", "14"), ("J", "15"), ("V", "16"), ("S", "17"), ("D", "18")]
    tira = "".join(f'<span class="{"hoy" if d == "V" else ""}"><b>{d}</b>{n}{"<i></i>" if d in ("V", "S", "D") else ""}</span>' for d, n in dias)
    c = f"""{chips()}
<div class="hola"><div><div class="kk">Viernes 16</div><div class="t-un hola-t">¡Hola, Joaco!</div></div>{lani("saludo", 46, sombra=False)}</div>
<div class="tira">{tira}</div>
<div class="ev-hoy"><span style="--c:{AMBAR}">{icono("jugar", 10, AMBAR)} <b>21 h</b> Viernes de Espadeo</span><span style="--c:{VIOLETA}">{icono("trofeo", 10, VIOLETA)} Fecha 7 vs @juli</span></div>
<div class="gl vd"><div class="kk">Versículo del día</div><div class="vd-t">«Lámpara es a mis pies tu palabra, y lumbrera a mi camino.»</div>
<div class="vd-p"><span>Salmo 119:105 · RVR</span><span>{icono("parlante", 10, "#5a3500")}{icono("compartir", 10, "#5a3500")}</span></div></div>
<div class="gl seg"><div class="seg-a"><svg viewBox="0 0 36 36" width="30" height="30"><circle cx="18" cy="18" r="15" stroke="#ffffff22" stroke-width="4" fill="none"/>
<circle cx="18" cy="18" r="15" stroke="{VERDE}" stroke-width="4" fill="none" stroke-dasharray="62 95" stroke-linecap="round" transform="rotate(-90 18 18)"/></svg>
<div><div class="kk" style="color:#86E5B8">Travesía · Fundamentos</div><b>Las plagas · nivel 3</b></div></div><span class="b3 verde mini">{icono("tri", 12, "#fff")}</span></div>
<div class="gl mis"><div class="mis-h"><span class="kk">Misiones de hoy</span>{icono("cofre", 14, ORO)}</div>
<div class="mis-r"><span>Completá 2 lecciones</span>{barra(100)}<em>✓</em></div>
<div class="mis-r"><span>Ganá un duelo en Mapa</span>{barra(0, CAT["botas"][3])}<em>15</em></div>
<div class="mis-r"><span>Orá por un pedido</span>{barra(0, ORO)}<em>15</em></div></div>
<div class="dos2"><div class="t2" style="--c:{ORO}">{icono("estrella", 14, ORO)}<b>Giro diario</b></div><div class="t2" style="--c:{CAT['botas'][3]}">{icono("jugar", 14, CAT['botas'][3])}<b>Te toca con Sofi</b></div></div>"""
    return tel(c, "Inicio: la semana a la vista, lo de hoy y la pantalla termina")


# ─────────────────────────────── Travesía ───────────────────────────────
def m_travesia_mapa() -> str:
    nodos = [("done", 38, 82), ("done", 60, 70), ("done", 44, 58), ("cur", 62, 45), ("cofre", 40, 33), ("lock", 58, 21), ("jefe", 42, 9)]
    ns = []
    for tipo, x, y in nodos:
        if tipo == "done":
            dentro = icono("check", 12, "#7a4f00")
        elif tipo == "cur":
            dentro = icono("tri", 17, "#fff")
        elif tipo == "cofre":
            dentro = icono("cofre", 15, ORO)
        elif tipo == "jefe":
            dentro = icono("corona", 14, "#fff")
        else:
            dentro = icono("candado", 11, "#8c86a8")
        ns.append(f'<div class="nd {tipo}" style="left:{x}%;top:{y}%">{dentro}</div>')
    c = f"""<div class="trv-bg">{V.mapa_travesia(220, 420)}</div>{chips()}
<div class="sec-h"><div><div class="kk">Ruta Fundamentos · Sección 3</div><b class="t-un">Libres del faraón</b></div><span class="sec-r">{icono("mapa", 12, "#fff")}</span></div>
<div class="ruta2">{''.join(ns)}<div class="tip" style="left:62%;top:35%">EMPEZAR</div>
<div class="ln-moto" style="left:22%;top:47%"><div class="ln-sobre">{lani("saludo", 36, sombra=False, buzo=VIOLETA, gorra=AMBAR)}</div>{V.vehiculo("moto", 50)}</div></div>"""
    return tel(c, "Travesía: el mapa de la sección, con Tu Lani en moto", nav="Travesía")


def m_leccion_imagen() -> str:
    ops = [("Moisés", True), ("Elías", False), ("Josué", False), ("Noé", False)]
    o = "".join(f'<div class="op2 {"ok" if ok else ""}">{chispas() if ok else ""}<span>{t}</span>{icono("check", 11, "#fff") if ok else ""}</div>'
                for t, ok in ops)
    c = f"""<div class="lec-t">{icono("cruz", 11, "#ffffff88")}{barra(64)}<span class="chp">{icono("vida", 10, V.ROJO)}4</span></div>
<div class="kk" style="margin-top:1mm">Pregunta con imagen</div><div class="t-un q2">¿Quién es?</div>
<div class="img2">{V.escena_mar(200, 112)}</div>
<div class="ops2">{o}</div>
<div class="fb2"><div class="fb2-t"><span class="fb2-i">{icono("check", 14, "#fff")}</span><div><b class="t-un">¡Imparable! 5 seguidas</b><br>
Éxodo 14:21 · <u>Leer el pasaje</u> · +1 {icono("vida", 8, V.ROJO)}</div></div><div class="b3 verde">CONTINUAR</div></div>"""
    return tel(c, "Lección: pregunta con imagen, explosión de luz y la cita", nav=None)


def rutas_bloque() -> str:
    rutas = [("Fundamentos", "Toda la Biblia", "travesia", VERDE, 34, "En curso"), ("Héroes", "60 personajes", "estrella", CAT["escudo"][3], 0, "Mar-2027"),
             ("Mapas", "Lugares y viajes", "mapa", CAT["botas"][3], 0, "Jun-2027"), ("66 Libros", "Libro por libro", "biblia", CAT["espada"][3], 0, "Jun-2027"),
             ("Preparados", "Apologética", "luz", CAT["cinturon"][3], 0, "Sep-2027"), ("Jesús", "Su vida en orden", "corona", CAT["casco"][3], 0, "Sep-2027"),
             ("Profecías", "Promesa y cumplimiento", "racha", V.AMBAR_OSC, 0, "Nov-2027"), ("Sabiduría", "Salmos y Proverbios", "lampara", CAT["coraza"][3], 0, "Nov-2027")]
    cards = "".join(f'<div class="rt2" style="--c:{c}"><div class="rt2-i">{icono(i, 18, "#fff")}</div><div class="rt2-n">{n}</div>'
                    f'<div class="rt2-d">{d}</div>{barra(p, c) if p else f"<div class=rt2-c>{cu}</div>"}</div>' for n, d, i, c, p, cu in rutas)
    niveles = ('<div class="niv"><span style="--c:#2FBF71"><b>Fundamentos</b>13 secciones · jun-2027</span><i></i><span style="--c:#9C6BFF"><b>Profundo</b>libro por libro · 2.º sem 2027</span>'
               '<i></i><span style="--c:#F5A524"><b>Maestría</b>2028</span><i></i><span style="--c:#17B3D1"><b>Repaso del día</b>infinito</span></div>')
    return f'<div class="rutas2">{cards}</div>{niveles}'


# ─────────────────────────────── Espadeo ───────────────────────────────
def ruleta_svg(tam: float = 150) -> str:
    segs = []
    n = 7
    cols = [c[3] for c in CATS] + [ORO]
    for k in range(n):
        a0, a1 = 2 * math.pi * k / n - math.pi / 2, 2 * math.pi * (k + 1) / n - math.pi / 2
        x0, y0 = 50 + 46 * math.cos(a0), 50 + 46 * math.sin(a0)
        x1, y1 = 50 + 46 * math.cos(a1), 50 + 46 * math.sin(a1)
        segs.append(f'<path d="M50 50 L{x0:.2f} {y0:.2f} A46 46 0 0 1 {x1:.2f} {y1:.2f}Z" fill="{cols[k]}" stroke="#1C1446" stroke-width="1.2"/>')
        am = (a0 + a1) / 2
        segs.append(f'<path d="M50 50 L{x0:.2f} {y0:.2f} A46 46 0 0 1 {x1:.2f} {y1:.2f}Z" fill="url(#rb)" opacity=".35"/>')
        cx, cy = 50 + 31 * math.cos(am), 50 + 31 * math.sin(am)
        clave = CATS[k][0] if k < 6 else None
        if clave:
            segs.append(f'<g transform="translate({cx - 8:.1f} {cy - 8:.1f})">{pieza_svg(clave, 16)}</g>')
        else:
            segs.append(f'<g transform="translate({cx - 7:.1f} {cy - 7:.1f})"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 8l4.4 3.8L12 5l4.6 6.8L21 8l-2 10.5H5z" fill="#7a4f00"/></svg></g>')
    luces = "".join(f'<circle cx="{50 + 48.5 * math.cos(2 * math.pi * k / 21):.1f}" cy="{50 + 48.5 * math.sin(2 * math.pi * k / 21):.1f}" r="1.3" fill="{"#FFF4D6" if k % 2 else ORO}"/>' for k in range(21))
    return f"""<svg viewBox="0 0 100 100" width="{tam}" height="{tam}" class="rul"><defs><radialGradient id="rb" cx=".5" cy=".5" r=".5"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs>
<circle cx="50" cy="50" r="49.5" fill="#120c30" stroke="{ORO}" stroke-width="1.4"/>{"".join(segs)}{luces}
<circle cx="50" cy="50" r="11" fill="#1C1446" stroke="{ORO}" stroke-width="2"/><text x="50" y="52.6" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="4.4" fill="{ORO}">GIRAR</text></svg>"""


def m_espadeo_ruleta() -> str:
    c = f"""<div class="du">{lani("guardia", 26, sombra=False, buzo=VIOLETA)}<div class="du-n"><b>Vos</b><span>Nivel 14</span></div>
<div class="du-vs t-un">VS</div><div class="du-n r"><b>Sofi</b><span>Nivel 12</span></div>{lani("reposo", 26, sombra=False, gorra=AMBAR)}</div>
<div class="hud"><div class="hud-a">{V.emblema(["coraza", "botas"], 24, rival=True)}<div><span class="kk">Sofi</span><b>2 de 6</b></div></div>
<div class="hud-b"><div><span class="kk">Tu armadura</span><b>3 de 6</b></div>{V.emblema(["escudo", "espada", "casco"], 44)}</div></div>
<div class="rul-w">{ruleta_svg(150)}<div class="rul-p"><svg viewBox="0 0 20 20" width="18" height="18"><path d="M10 18 2 4h16z" fill="#fff"/></svg></div></div>
<div class="carga"><span class="kk">Carga</span><i class="on"></i><i class="on"></i><i></i></div>
<div class="b3">¡GIRAR!</div>"""
    return tel(c, "Espadeo: la ruleta, tu armadura arriba a la derecha y la Carga", nav="Jugar",
               fondo="background:radial-gradient(circle at 50% 46%, #4B36A8 0%, #2E2170 38%, #140E33 100%)")


def m_espadeo_pregunta() -> str:
    _, pieza, cat, col, claro, _, _ = CAT["botas"]
    ops = ["Asiria (hoy Irak)", "Egipto", "Grecia", "Babilonia"]
    o = "".join(f'<div class="op2 c" style="--c:{col}">{t}</div>' for t in ops)
    com = [("luz", "Luz", 3), ("reloj", "Tiempo", 1), ("doble", "Doble", 2), ("cambio", "Cambio", 0), ("pista", "Pista", 4), ("tribuna", "Tribuna", 1)]
    cm = "".join(f'<span class="{"cero" if q == 0 else ""}">{icono(i, 12, "#fff")}<i>{n}</i><em>{q}</em></span>' for i, n, q in com)
    c = f"""<div class="cat-h" style="--c:{col}">{pieza_svg("botas", 30)}<div><div class="kk" style="color:#fff">{pieza}</div><b class="t-un">{cat}</b></div>
<div class="hud mini">{V.emblema(["escudo", "espada", "casco"], 30)}</div></div>
<div class="tmr"><i style="width:64%"></i><span>16 s</span></div>
<div class="t-un q2">¿En qué imperio estaba Nínive, la ciudad a la que fue Jonás?</div>
<div class="ops2">{o}</div><div class="coms">{cm}</div><div class="prg-r"><i></i>Sofi ya respondió esta pregunta</div>
<div class="prg-pie">{lani("pensando", 40, sombra=False)}<div class="prg-b">¿Dudás? La <b>Pista</b> te muestra la cita donde está la respuesta, y después podés leerla.</div></div>"""
    return tel(c, "Espadeo: una pregunta de Mapa (Botas) con los seis comodines", nav=None,
               fondo=f"background:linear-gradient(180deg, {col}55 0%, #2E2170 34%, #140E33 100%)")


def m_pieza_ganada() -> str:
    c = f"""<div class="win-bg">{rayos(ORO)}</div><div class="kk win-k" style="margin-top:5mm">Prueba de pieza superada</div>
<div class="win-p">{destellos(ORO, 14, 22, 40, 150)}<div class="win-i">{pieza_svg("botas", 92)}</div></div>
<div class="t-un win-t">¡Ganaste las Botas!</div><div class="win-v">«Calzados los pies con el apresto del evangelio de la paz»<br><span>Efesios 6:15</span></div>
<div class="win-e">{V.emblema(["escudo", "espada", "casco", "botas"], 50)}<div><b>4 de 6</b><br><span>Te faltan Coraza<br>y Cinturón</span></div>
<div class="win-l">{lani("festejo", 50, sombra=False)}</div></div><div class="b3">SEGUIR</div>"""
    return tel(c, "El momento: la pieza vuela a tu emblema, con luz, sonido y vibración", nav=None,
               fondo="background:radial-gradient(circle at 50% 34%, #6A4FD8 0%, #2E2170 45%, #140E33 100%)")


def storyboard() -> str:
    cuadros = [
        ("0,0 s", "Acierto en la Prueba de pieza", f'<div class="sb-c">{pieza_svg("botas", 44)}{destellos(V.CAT["botas"][3], 10, 14, 26, 70)}</div>', "Explosión del color de la categoría · nota alta"),
        ("0,4 s", "La pieza vuela al emblema", f'<div class="sb-c"><div class="sb-vuelo">{pieza_svg("botas", 30)}</div><div class="sb-emb">{V.emblema(["escudo", "espada", "casco"], 44)}</div></div>', "Estela dorada · «whoosh» que sube"),
        ("1,0 s", "Impacto", f'<div class="sb-c">{V.emblema(["escudo", "espada", "casco", "botas"], 58)}{destellos(ORO, 12, 26, 38, 96)}</div>', "Onda expansiva · metal + campana · vibración fuerte"),
        ("2,0 s", "Armadura completa", f'<div class="sb-c">{V.emblema([c[0] for c in CATS], 64)}</div>', "Las 6 brillan · cámara lenta 300 ms"),
        ("3,0 s", "Tu Lani con la armadura", f'<div class="sb-c">{lani("armadura", 62, sombra=False)}</div>', "Pose heroica · fanfarria de la marca · compartir"),
    ]
    out = "".join(f'<div class="sb"><div class="sb-t">{t}</div>{img}<b>{n}</b><span>{d}</span></div>' for t, n, img, d in cuadros)
    return f'<div class="sbs">{out}</div>'


def armadura_bloque() -> str:
    cards = []
    for clave, pieza, cat, col, claro, vers, que in CATS:
        cards.append(f'<div class="ar2" style="--c:{col};--c2:{claro}"><div class="ar2-i">{pieza_svg(clave, 58)}</div>'
                     f'<div class="ar2-p">{pieza}</div><div class="ar2-c t-un">{cat}</div><div class="ar2-q">{que}</div><div class="ar2-v">{vers}</div></div>')
    return f'<div class="ar2s">{"".join(cards)}</div>'


# ─────────────────────────────── Liga ───────────────────────────────
def escudo_club(c1: str, c2: str, simbolo: str = "lampara", tam: float = 18) -> str:
    return (f'<svg viewBox="0 0 24 28" width="{tam}" height="{tam * 1.16:.0f}"><path d="M12 1 22 4v9c0 7.5-4.5 12-10 14C6.5 25 2 20.5 2 13V4z" fill="{c1}" stroke="#fff" stroke-width="1.2"/>'
            f'<path d="M12 1 22 4v9c0 7.5-4.5 12-10 14z" fill="{c2}" opacity=".9"/><g transform="translate(5.5 6) scale(.55)">'
            f'{icono(simbolo, 24, "#fff")[icono(simbolo, 24, "#fff").find(">") + 1:-6]}</g></svg>')


def m_liga() -> str:
    filas = [(1, "Los de Berea", CAT["escudo"][3], "#1C1446", 18, "asc"), (2, "Leones de Judá", AMBAR, "#8a4b00", 16, "asc"), (3, "Joaco FC", VIOLETA, AMBAR, 15, "asc yo"),
             (4, "Sal y Luz", VERDE, "#0f5132", 13, ""), (5, "Barca de Pedro", CAT["cinturon"][3], "#0b4e5c", 12, ""),
             (10, "Arca Juniors", "#888", "#444", 4, "desc"), (11, "Monte Sion", "#888", "#333", 3, "desc"), (12, "Atlético Emaús", "#888", "#555", 2, "desc")]
    tb = "".join(f'<div class="lg-r {cl}"><span class="lg-p">{p}</span>{escudo_club(c1, c2, "lampara" if k % 2 else "estrella", 13)}<span class="lg-n">{n}</span>'
                 f'<span class="lg-pt">{pt}</span></div>' + ('<div class="lg-sep">• • •</div>' if p == 5 else "") for k, (p, n, c1, c2, pt, cl) in enumerate(filas))
    c = f"""{chips()}<div class="lg-h"><div class="kk">Liga Senda · Apertura 2027</div><b class="t-un">Nacional · Zona 3</b></div>
<div class="gl pf"><div class="kk">Partido de la fecha 7 · hasta el domingo</div><div class="pf-r">{lani("guardia", 24, sombra=False, buzo=VIOLETA)}<b>Joaco FC</b><span class="t-un">VS</span><b>Sal y Luz</b>{lani("reposo", 24, sombra=False, buzo=VERDE)}</div>
<div class="b3 mini2">JUGAR EL PARTIDO</div><div class="pf-x">+1 punto si cumplís 3 días con la Palabra</div></div>
<div class="lg-t"><div class="lg-r cab"><span class="lg-p">#</span><span></span><span class="lg-n">Club</span><span class="lg-pt">Pts</span></div>{tb}</div>"""
    return tel(c, "Liga Senda: tu club, el partido de la fecha y la tabla de tu zona", nav="Jugar")


def liga_bloque() -> str:
    divs = [("Primera", 30, ORO), ("Nacional", 46, "#C9B0FF"), ("B", 62, "#9C6BFF"), ("C", 78, "#6E56F7"), ("Inicial", 94, "#3A2A8C")]
    pir = "".join(f'<div class="dv" style="width:{w}%;--c:{c}"><b>{n}</b></div>' for n, w, c in divs)
    llave = (f'<div class="llave"><div class="ll-col"><div class="ll-c"><em>Semifinal</em><span>1.º de la zona</span><span>4.º de la zona</span></div>'
             f'<div class="ll-c"><em>Semifinal</em><span>2.º de la zona</span><span>3.º de la zona</span></div></div><div class="ll-ln"></div>'
             f'<div class="ll-f"><em>Final</em><span>en vivo, un sábado</span></div><div class="ll-ln"></div>'
             f'<div class="ll-w">{icono("trofeo", 26, ORO)}<b>Campeón</b><span>estrella en el escudo y la Supercopa de diciembre</span></div></div>')
    temporada = ('<div class="tmp"><span style="--c:#2FBF71"><b>Apertura</b>12-abr → 11-jul</span><span style="--c:#FF5470"><b>Copa de invierno</b>julio</span>'
                 '<span style="--c:#9C6BFF"><b>Clausura</b>16-ago → 14-nov</span><span style="--c:#F5A524"><b>Supercopa</b>diciembre</span>'
                 '<span style="--c:#3D7BFF"><b>Copa de verano</b>ene–feb</span></div>')
    return f'<div class="lgb"><div class="lgb-a"><div class="lgb-k">Divisiones por país (ascienden 3, descienden 3)</div><div class="pir">{pir}</div></div>' \
           f'<div class="lgb-b"><div class="lgb-k">Cada zona: 12 clubes, 11 fechas, playoffs de 4</div>{llave}</div></div>{temporada}'


def semana_bloque() -> str:
    dias = [("Lunes", "Arranca la fecha", "trofeo", VIOLETA), ("Martes", "Versículo de la semana", "biblia", CAT["espada"][3]),
            ("Miércoles", "De a dos (Escuadra)", "comunidad", CAT["escudo"][3]), ("Jueves", "Pulso", "grafico", CAT["cinturon"][3]),
            ("Viernes", "Viernes de Espadeo · 21 h", "jugar", AMBAR), ("Sábado", "Día de reunión · torneo relámpago", "calendario", VERDE),
            ("Domingo", "Desafío del domingo · día libre", "oracion", CAT["casco"][3])]
    return '<div class="sem">' + "".join(
        f'<div class="sem-d{" top" if d == "Viernes" else ""}" style="--c:{c}"><div class="sem-i">{icono(i, 16, "#fff")}</div><b>{d}</b><span>{t}</span></div>' for d, t, i, c in dias) + "</div>"


# ─────────────────────────────── Calendario ───────────────────────────────
def m_calendario() -> str:
    evs = [("18:00", "Reunión de jóvenes", "Grupo · Iglesia Esperanza", VERDE, "Senda Reunión armada · 24 van"),
           ("21:00", "Viernes de Espadeo", "Senda · en vivo", AMBAR, "15 preguntas · ranking nacional"),
           ("Dom", "Fecha 7: vos vs Sal y Luz", "Mi calendario · Liga", VIOLETA, "Hasta el domingo 23:59"),
           ("Dom 10:00", "Culto + Desafío del domingo", "Iglesia", CAT["casco"][3], "Turno: alabanza (vos)")]
    e = "".join(f'<div class="cev" style="--c:{c}"><span class="cev-h">{h}</span><div><b>{t}</b><i>{k}</i><em>{x}</em></div></div>' for h, t, k, c, x in evs)
    dias = "".join(f'<span class="{"hoy" if n == 16 else ""}">{n}<i style="background:{c}"></i></span>' for n, c in
                   [(12, VIOLETA), (13, "transparent"), (14, CAT["escudo"][3]), (15, "transparent"), (16, AMBAR), (17, VERDE), (18, CAT["casco"][3])])
    c = f"""{chips()}<div class="cal-h"><b class="t-un">Octubre</b><span class="cal-f"><i style="--c:{AMBAR}">Senda</i><i style="--c:{VIOLETA}">Mía</i><i style="--c:{VERDE}">Grupo</i></span></div>
<div class="cal-d">{dias}</div>{e}
<div class="inv"><div class="inv-p">{lani("baile", 40, sombra=False, lentes=True)}<div class="inv-t t-un">CAMPA<br>2027</div></div>
<div class="inv-b"><b>Campamento de jóvenes</b><span>14–16 de febrero · Sierras</span><div class="inv-x"><span class="b3 mini3">VOY</span><span>{icono("compartir", 10, "#3A2A8C")} Compartir</span></div></div></div>"""
    return tel(c, "Calendario: lo de Senda, lo tuyo y lo de tu grupo, con invitaciones para compartir", nav="Comunidad")


# ─────────────────────────────── Senda Reunión ───────────────────────────────
def m_reunion_armador() -> str:
    bloques = [("pdf", "Mi bosquejo", "Juan 6 · 3 páginas", "#8c86a8", "5 min"), ("tribuna", "Quiz en vivo", "8 preguntas (5 mías + 3 del banco)", AMBAR, "10 min"),
               ("comunidad", "Oveja Perdida", "Palabras de Juan 6", VERDE, "15 min"), ("trofeo", "Campeonato", "Eliminación · 4 rondas", VIOLETA, "20 min"),
               ("estrella", "Algo del día", "Desafío para la semana", CAT["escudo"][3], "5 min")]
    b = "".join(f'<div class="blq" style="--c:{c}"><span class="blq-h"></span><span class="blq-i">{icono(i, 13, "#fff")}</span><div><b>{n}</b><i>{d}</i></div><em>{m}</em></div>'
                for i, n, d, c, m in bloques)
    c = f"""<div class="ar-h"><div class="kk">Senda Reunión · sáb 17-oct · 18 h</div><b class="t-un">Reunión 12: «Yo soy el pan»</b></div>
{b}<div class="blq add">{icono("mas", 14, AMBAR)}<b>Agregar bloque</b></div>
<div class="ar-t">Total: 55 min · 24 confirmaron</div><div class="b3">ABRIR EN VIVO</div>"""
    return tel(c, "El armador: el líder elige y ordena los bloques de su reunión", nav="Comunidad")


def qr_svg(tam: float = 84) -> str:
    n = 25
    celdas = []
    for y in range(n):
        for x in range(n):
            fin = any(x0 <= x < x0 + 7 and y0 <= y < y0 + 7 for x0, y0 in ((0, 0), (n - 7, 0), (0, n - 7)))
            if fin:
                dx, dy = (x % (n - 7) if x >= n - 7 else x), (y % (n - 7) if y >= n - 7 else y)
                on = dx in (0, 6) or dy in (0, 6) or (2 <= dx <= 4 and 2 <= dy <= 4)
            else:
                cerca = any(x0 - 1 <= x <= x0 + 7 and y0 - 1 <= y <= y0 + 7 for x0, y0 in ((0, 0), (n - 7, 0), (0, n - 7)))
                on = not cerca and ((x * 31 + y * 17 + x * y * 7) % 11) < 5
            if on:
                celdas.append(f'<rect x="{x}" y="{y}" width="1.02" height="1.02"/>')
    return f'<svg viewBox="-2 -2 {n + 4} {n + 4}" width="{tam}" height="{tam}" class="qr2"><rect x="-2" y="-2" width="{n + 4}" height="{n + 4}" rx="2" fill="#fff"/><g fill="#17151F">{"".join(celdas)}</g></svg>'


def m_reunion_tv() -> str:
    barras = [(CAT["escudo"][3], "Juan", 23, True), (CAT["botas"][3], "Mateo", 5, False), (CAT["espada"][3], "Lucas", 7, False), (VERDE, "Marcos", 3, False)]
    bs = "".join(f'<div class="tv-b2" style="--c:{c}"><span>{n}{" ✓" if ok else ""}</span><i style="width:{v / 23 * 100:.0f}%"></i><em>{v}</em></div>' for c, n, v, ok in barras)
    return f"""<figure class="mk"><div class="tv2"><div class="tv2-l"><div class="kk">Senda Reunión</div><b class="t-un">482 913</b>{qr_svg(84)}
<span>Entrá desde la app o el navegador</span><div class="tv2-j">{icono("comunidad", 11, "#fff")} 38 jugando</div>{lani("festejo", 66, sombra=False)}</div>
<div class="tv2-r"><div class="tv2-k"><span class="kk">Quiz en vivo · 4 de 8</span><span class="tv2-t">{icono("reloj", 12, AMBAR)} 0:04</span></div>
<div class="t-un tv2-q">¿Qué evangelio cuenta que Jesús dijo «Yo soy el pan de vida»?</div>{bs}
<div class="tv2-pod"><span>2.º Mica</span><span class="p1">1.º Tomi · 4.200</span><span>3.º Lu</span></div></div></div>
<figcaption>En vivo en la pantalla grande: todos juegan desde su celular</figcaption></figure>"""


def m_reunion_registro() -> str:
    c = f"""<div class="ar-h"><div class="kk">Registro</div><b class="t-un">Reunión 12 · sáb 17-oct</b></div>
<div class="rg3"><div><b class="t-un">38</b><span>vinieron</span></div><div><b class="t-un">+6</b><span>vs. la anterior</span></div><div><b class="t-un">74%</b><span>aciertos</span></div></div>
<div class="gl"><div class="kk">Podio del quiz</div><div class="pod3"><span>2 · Mica</span><span class="p1">1 · Tomi</span><span>3 · Lu</span></div></div>
<div class="gl"><div class="kk" style="color:#FFA3B2">Para reforzar</div><div class="rf">«¿Quién dijo "Señor, ¿a quién iremos?"?» · 41% · Juan 6:68</div><div class="rf">«¿Cuántas canastas sobraron?» · 52% · Juan 6:13</div>
<div class="b3 mini2">MANDAR COMO REPASO AL GRUPO</div></div>
<div class="gl"><div class="kk">¿Sigue en la semana?</div><div class="sw2"><span class="on">Quiz abierto hasta el viernes</span><span>Campeonato: ronda 2 el sábado</span></div></div>"""
    return tel(c, "Después: registro, en qué reforzar y qué sigue en la semana", nav="Comunidad")


# ─────────────────────────────── Tu Lani, momentos y Pulso ───────────────────────────────
def m_tu_lani() -> str:
    items = [("moto", "Moto", "4.500", True), ("auto", "Auto", "6.000", False), ("skate", "Skate", "1.800", True), ("carro", "Carro de fuego", "Legendario", False)]
    it = "".join(f'<div class="it2{" eq" if k == 0 else ""}">{V.vehiculo(t, 44)}<b>{n}</b><span>{icono("talento", 8, ORO) if p[0].isdigit() else icono("corona", 8, ORO)}{p}</span></div>'
                 for k, (t, n, p, _) in enumerate(items))
    c = f"""{chips()}<div class="tl-st">{lani("reposo", 92, buzo=VIOLETA, gorra=AMBAR, lentes=False)}<div class="tl-pl"></div></div>
<div class="tl-n"><b class="t-un">Tu Lani</b><span>Nivel 14 · Joaco FC</span></div>
<div class="tabs2"><span>Atuendos</span><span class="on">Vehículos</span><span>Accesorios</span><span>Festejos</span></div><div class="its2">{it}</div>"""
    return tel(c, "Tu Lani: atuendos, accesorios y vehículos que se ganan o se compran", nav=None,
               fondo="background:radial-gradient(circle at 50% 28%, #5B43C9 0%, #2E2170 42%, #140E33 100%)")


def m_sin_vidas() -> str:
    ops = [("repaso", "Repasar 3 minutos", "+1 vida, gratis", VERDE), ("amigos", "Pedirle a un amigo", "Juli y Tomi pueden regalarte", CAT["escudo"][3]),
           ("video", "Ver un video", "+1 vida", AMBAR), ("max", "Senda Max", "Vidas ilimitadas · 7 días gratis", VIOLETA)]
    iconos = {"repaso": "rayo", "amigos": "comunidad", "video": "tri", "max": "corona"}
    o = "".join(f'<div class="sv" style="--c:{c}"><span class="sv-i">{icono(iconos[k], 13, "#fff")}</span><div><b>{t}</b><i>{d}</i></div></div>' for k, t, d, c in ops)
    c = f"""<div class="sv-l">{lani("desmayo", 92, sombra=False)}</div><div class="t-un sv-t">¡Uy! Te quedaste sin vidas</div>
<div class="sv-s">La próxima vuelve en <b>42:10</b></div>{o}"""
    return tel(c, "Sin vidas: opciones claras y un repaso que siempre está", nav=None)


def m_cofre() -> str:
    premios = [("talento", "+120", ORO), ("luz", "Luz ×2", CAT["cinturon"][3]), ("perla", "+5", "#E9E4FF")]
    p = "".join(f'<div class="pr3" style="--c:{c}">{icono(i, 22, c)}<b>{t}</b></div>' for i, t, c in premios)
    cofre = f"""<svg viewBox="0 0 100 80" width="120" height="96"><defs><linearGradient id="cf1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98A3E"/><stop offset="1" stop-color="#7A4A1A"/></linearGradient></defs>
<path d="M12 40h76v32a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z" fill="url(#cf1)" stroke="{ORO}" stroke-width="2.4"/>
<path d="M14 36 Q50 4 86 36 L84 42 H16Z" fill="#B57A30" stroke="{ORO}" stroke-width="2.4" transform="rotate(-18 14 40)"/>
<rect x="44" y="44" width="12" height="14" rx="2" fill="{ORO}"/><path d="M30 40 Q50 -10 70 40" fill="#FFF1B8" opacity=".55"/></svg>"""
    c = f"""<div class="win-bg">{rayos(ORO)}</div><div class="kk win-k" style="margin-top:9mm">Cofre de plata · misión semanal</div>
<div class="cf-w">{destellos(ORO, 12, 20, 38, 140)}<div class="cf-i">{cofre}</div></div><div class="prs3">{p}</div>
<div class="b3">GUARDAR</div><div class="cf-x">{icono("play", 10, "#fff")} Ver un video y duplicar los premios</div>"""
    return tel(c, "Abrir un cofre: tiembla, se abre con luz y los premios saltan", nav=None,
               fondo="background:radial-gradient(circle at 50% 36%, #3D7BFF66 0%, #2E2170 45%, #140E33 100%)")


def m_pulso() -> str:
    c = f"""{chips()}<div class="gl pul"><div class="kk">Pulso · la pregunta de hoy</div><div class="t-un pul-q">¿Leíste la Biblia hoy antes de abrir las redes?</div>
<div class="pul-r"><span style="--p:63%"><b>Sí</b><em>63%</em></span><span style="--p:37%" class="no"><b>Todavía no</b><em>37%</em></span></div>
<div class="pul-x">12.408 respuestas · {icono("compartir", 9, "#fff")} Compartir</div></div>
<div class="kk" style="margin:2mm 0 1.2mm">Estados de tus amigos</div>
<div class="est">{"".join(f'<span style="--c:{c}">{lani(p, 26, sombra=False, buzo=b)}<i>{n}</i></span>' for p, b, c, n in [("festejo", None, AMBAR, "Juli"), ("reposo", VERDE, VIOLETA, "Tomi"), ("saludo", None, CAT["botas"][3], "Sofi"), ("baile", CAT["escudo"][3], VERDE, "Lu")])}</div>
<div class="gl estc"><div class="kk">Juli · hace 2 h</div><b>Completé la Ruta Héroes</b><div class="estc-r"><span>Amén</span><span>¡Bien ahí!</span><span>Orando</span></div></div>
<div class="gl ayu"><span>{icono("racha", 14, AMBAR)}</span><div><b>Ayuno de redes · día 9 de 21</b><i>Tu grupo: 14 de 18 siguen</i></div></div>"""
    return tel(c, "Pulso, Estados y el Ayuno de redes en Comunidad", nav="Comunidad")


def share_cards() -> str:
    def story(fondo, cuerpo, pie):
        return (f'<figure class="mk"><div class="sto" style="{fondo}">{cuerpo}<div class="sto-m">{V.logo_txt()}<span>¿Me ganás? senda.app/joaco</span></div></div>'
                f'<figcaption>{pie}</figcaption></figure>')
    a = story("background:radial-gradient(circle at 50% 40%, #6A4FD8, #1C1446 70%)",
              f'<div class="sto-bg">{rayos(ORO)}</div><div class="kk">Armadura completa</div>{lani("armadura", 92, sombra=False)}<div class="t-un sto-t">¡La número 23!</div><div class="sto-s">Le gané a @sofi en Espadeo</div>',
              "Armadura completa")
    b = story("background:linear-gradient(180deg, #2E2170, #1C1446)",
              f'<div class="kk">Liga Senda · Apertura</div><div class="sto-esc">{escudo_club(VIOLETA, AMBAR, "lampara", 70)}</div><div class="t-un sto-t">¡Ascendimos a Primera!</div><div class="sto-s">Joaco FC · 1.º de la Zona 3</div>',
              "Ascenso en la Liga")
    c = story("background:radial-gradient(circle at 50% 38%, #F5A52455, #1C1446 70%)",
              f'<div class="kk">Racha</div><div class="sto-r">{icono("racha", 74, AMBAR)}</div><div class="t-un sto-t">30 días con la Palabra</div><div class="sto-s">Un rayito por día</div>',
              "Hito de racha")
    return f'<div class="mk-row">{a}{b}{c}</div>'


# ─────────────────────────────── paletas ───────────────────────────────
PALETAS = [
    ("A · La de la v1", "Ámbar + azul noche", "#1E2A5A", "#2B3C78", "#F5A524", ["#2F80ED", "#EB5757", "#9B51E0", "#F2994A", "#27AE60", "#F2C94C"], "#FFFFFF"),
    ("B · Ámbar + índigo (recomendada)", "El mismo ámbar; índigo profundo; categorías de joya", "#1C1446", "#3A2A8C", "#F5A524", [c[3] for c in CATS], None),
    ("C · Ámbar + petróleo", "Ámbar + verde azulado profundo", "#0F2E35", "#1F5560", "#F5A524", ["#4C8DF6", "#FF7A45", "#A07BFF", "#3DD68C", "#FFD166", "#FF5C7A"], None),
]


def paletas_bloque() -> str:
    out = []
    for nombre, desc, f1, f2, ac, cats, claro in PALETAS:
        fondo = f"background:linear-gradient(180deg,{f2},{f1})" if not claro else f"background:#fff"
        txt = "#fff" if not claro else "#1E2A5A"
        sub = f"rgba(255,255,255,.10)" if not claro else "#EEF1F8"
        catb = "".join(f'<i style="background:{c}"></i>' for c in cats)
        out.append(f'''<div class="pal3"><div class="pal3-ph" style="{fondo};color:{txt}">
<div class="pal3-top"><span style="background:{ac}"></span><b>Senda</b></div>
<div class="pal3-c" style="background:{sub}"><div class="kk" style="color:{ac}">Versículo del día</div><div class="pal3-l"></div><div class="pal3-l s"></div></div>
<div class="pal3-cats">{catb}</div>
<div class="pal3-c" style="background:{sub}"><div class="pal3-l s"></div><div class="pal3-g"><i style="background:#2FBF71"></i></div></div>
<div class="pal3-ch"><i style="background:#E5484D"></i><i style="background:{ac}"></i><i style="background:#FFC857"></i></div>
<div class="pal3-b" style="background:{ac}">JUGAR</div></div>
<div class="pal3-n"><b>{nombre}</b><span>{desc}</span></div></div>''')
    return f'<div class="pals3">{"".join(out)}</div>'


def paleta_final() -> str:
    tonos = [("Ámbar Lámpara", AMBAR, "#2a1700", "Firma, acentos, botón principal de juego"), ("Oro", ORO, "#2a1700", "Brillos y premios"),
             ("Índigo Noche", NOCHE, "#fff", "Fondo profundo de la Arena"), ("Índigo", V.INDIGO_M, "#fff", "Degradés y superficies"),
             ("Violeta Señal", VIOLETA, "#fff", "Acento secundario (poco)"), ("Verde Acierto", VERDE, "#06301a", "Acierto, avanzar"),
             ("Rojo Error", V.ROJO, "#fff", "Error suave, vidas"), ("Crema Pergamino", V.CREMA, "#2b2622", "Fondo de lectura (Santuario)")]
    sw = "".join(f'<div class="sw3" style="background:{c};color:{t}"><b>{n}</b><span>{c}</span><i>{u}</i></div>' for n, c, t, u in tonos)
    cats = "".join(f'<div class="sw3 s" style="background:{c[3]}"><b>{c[2]}</b><span>{c[1]} · {c[3]}</span></div>' for c in CATS)
    return f'<div class="sws3">{sw}</div><div class="sws3 c6">{cats}</div>'


# ─────────────────────────────── Lani: bloques ───────────────────────────────
def lani_bloque() -> str:
    return f"""<div class="lani2"><div class="lani2-h">{lani("reposo", 150)}</div><div class="lani2-t"><div class="lani-k">Boceto de dirección v2 (no es el diseño final)</div>
<p>Oveja joven de pie, cabeza más chica, piernas largas, cara carbón con cejas de lana, párpados con actitud, pañuelo ámbar con la lámpara
y zapatillas. Sin pestañas, sin rubor, sin rosa: <b>neutra</b>. La versión final la dibuja y la anima un profesional con esta guía y
se aprueba con el «infantilómetro».</p>
<div class="lani2-v">{lani("reposo", 62, buzo=VIOLETA, gorra=AMBAR)}{lani("saludo", 62, lentes=True, auriculares=True)}{lani("reposo", 62, buzo=V.CAT["botas"][3])}{lani("guardia", 62, buzo=VERDE)}</div>
<div class="lani2-c">Cuatro de las mil combinaciones de Tu Lani</div></div></div>"""


def lani_reacciones() -> str:
    poses = [("reposo", "Reposo canchero", "#3E2D97"), ("festejo", "¡Imparable!", "#1E8A50"), ("uff", "Uff (nunca se burla)", "#8a3a4e"),
             ("pensando", "Pensando", "#3A2A8C"), ("guardia", "En guardia (Carga llena)", "#9a5b00"), ("corriendo", "¡Te estaba buscando!", "#1f6f8f"),
             ("baile", "Baile de festejo", "#5B43C9"), ("armadura", "Armadura completa", "#8a6400"), ("saludo", "Saludo", "#3E2D97"),
             ("dormida", "De noche", "#141033"), ("desmayo", "Sin vidas (dramática)", "#7a2433")]
    celdas = "".join(f'<div class="reac-c" style="--m:{m}">{lani(p, 76, sombra=False)}<span>{n}</span></div>' for p, n, m in poses)
    celdas += f'<div class="reac-c" style="--m:#5B43C9">{lani("saludo", 76, sombra=False, buzo=VIOLETA, gorra=AMBAR)}<span>Con Tu Lani puesta</span></div>'
    return f'<div class="reac">{celdas}</div>'


def tu_lani_bloque() -> str:
    veh = "".join(f'<div class="vh3">{V.vehiculo(t, 72)}<b>{n}</b><span>{d}</span></div>' for t, n, d in
                  [("skate", "Skate", "1.800 Talentos"), ("bici", "Bici", "3.000 Talentos"), ("moto", "Moto", "4.500 Talentos o 700 Perlas"),
                   ("auto", "Auto", "6.000 Talentos o 900 Perlas"), ("carro", "Carro de fuego", "Legendario: no se vende")])
    return f"""<div class="tl3"><div class="tl3-l">{lani("reposo", 80, buzo=VIOLETA, gorra=AMBAR)}{lani("saludo", 80, lentes=True, auriculares=True)}{lani("festejo", 80, buzo=V.CAT["botas"][3])}</div>
<div class="tl3-v">{veh}</div></div>{m_tu_lani_fila()}"""


def m_tu_lani_fila() -> str:
    return f'<div class="mk-row">{m_tu_lani()}{m_cofre()}</div>'


# ─────────────────────────────── economía ───────────────────────────────
def economia_mapa() -> str:
    hace = ["Leer y escuchar", "Lecciones y repasos", "Duelos y juegos", "Orar por alguien", "Invitar amigos", "Misiones y cofres"]
    usa = [("Talentos", "talento", ORO, "Vidas · comodines · protectores · Tu Lani · escudo del club"),
           ("Pasos", "rayo", VERDE, "Nivel · Pase Senda · desempates"),
           ("Perlas", "perla", "#C9B0FF", "Objetos especiales · recargas · Pase Senda")]
    h = "".join(f"<span>{x}</span>" for x in hace)
    u = "".join(f'<div class="ec-u" style="--c:{c}">{icono(i, 18, c)}<b>{n}</b><i>{d}</i></div>' for n, i, c, d in usa)
    return f"""<div class="ecm"><div class="ec-a"><div class="ec-k">Todo lo que hacés…</div>{h}</div><div class="ec-f">→</div>
<div class="ec-b"><div class="ec-k">…suma</div>{u}</div><div class="ec-f">→</div>
<div class="ec-c"><div class="ec-k">Y si querés ir más rápido</div><span>{icono("play", 12, AMBAR)} Video opcional</span><span>{icono("corona", 12, VIOLETA)} Plus · Max · Familia</span>
<span>{icono("estrella", 12, ORO)} Pase Senda</span><span>{icono("perla", 12, "#C9B0FF")} Perlas</span><div class="ec-n">Nunca: ventaja en partidos oficiales</div></div></div>"""


def mocks_ux() -> str:
    return (f'<div class="mk-row">{m_pieza_ganada()}{m_pulso()}{m_tu_lani()}</div>'
            f'<div class="mk-row">{m_leccion_imagen()}{m_liga()}{m_cofre()}</div>')
