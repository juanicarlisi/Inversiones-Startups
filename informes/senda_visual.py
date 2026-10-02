"""Visuales del proyecto Senda v2: paleta, íconos propios, Lani v2, armadura, vehículos y escenas (SVG).

Lo usa informes/construir_senda.py. Todo es SVG en línea, sin emojis del sistema, para que las pantallas de ejemplo se vean al
nivel buscado (capítulo 19). Son bocetos de dirección: el diseño final lo hacen especialistas.
"""
from __future__ import annotations

import itertools
import math

# ─────────────────────────────── paleta B (ámbar + índigo) ───────────────────────────────
AMBAR = "#F5A524"
ORO = "#FFC857"
AMBAR_OSC = "#D9860F"
NOCHE = "#1C1446"      # índigo noche (fondo profundo)
INDIGO = "#2E2170"
INDIGO_M = "#3A2A8C"
VIOLETA = "#6E56F7"
VERDE = "#2FBF71"
ROJO = "#E5484D"
CREMA = "#FFF8EC"
TINTA = "#17151F"
CARBON = "#35323D"

# Categorías de Espadeo: (clave, pieza, categoría, color, color claro, versículo, qué se pregunta)
CATS = [
    ("escudo", "Escudo", "Héroes", "#3D7BFF", "#8FB5FF", "Efesios 6:16 · el escudo de la fe", "Personajes de toda la Biblia"),
    ("espada", "Espada", "Palabra", "#FF8A2B", "#FFC08C", "Efesios 6:17 · la espada del Espíritu", "Versículos, citas y libros"),
    ("casco", "Casco", "Historia", "#9C6BFF", "#C9B0FF", "Efesios 6:17 · el yelmo de la salvación", "La gran historia y sus épocas"),
    ("coraza", "Coraza", "Vida", "#22C17A", "#86E5B8", "Efesios 6:14 · la coraza de justicia", "Cómo vivir: mandamientos y sabiduría"),
    ("cinturon", "Cinturón", "Verdad", "#17B3D1", "#7FDDEE", "Efesios 6:14 · ceñidos con la verdad", "Lo central de la fe y apologética"),
    ("botas", "Botas", "Mapa", "#FF5470", "#FFA3B2", "Efesios 6:15 · el apresto del evangelio", "Lugares, viajes y geografía"),
]
CAT = {c[0]: c for c in CATS}

_ids = itertools.count(1)


def _uid(p: str) -> str:
    return f"{p}{next(_ids)}"


# ─────────────────────────────── íconos de interfaz ───────────────────────────────
def icono(nombre: str, tam: float = 18, color: str = "currentColor", extra: str = "") -> str:
    """Íconos propios de trazo grueso y relleno, en una grilla de 24."""
    c = color
    p = {
        "vida": f'<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3.1 1.6-1.9 3.1-3.1 5.2-3.1 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill="{c}"/>'
                f'<path d="M7 7.2c-1.4.3-2.3 1.6-2 3" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
        "racha": f'<path d="M12 2.5c2.8 3.4 4.6 6 4.6 9 0 2.9-2.1 5.1-4.6 5.1S7.4 14.4 7.4 11.5c0-1.6.7-3 1.6-4.2.2 1.4 1 2.4 2 2.7-.1-2.9.4-5.3 1-7.5z" fill="{c}"/>'
                 f'<path d="M12 9.6c1.2 1.4 1.9 2.5 1.9 3.6 0 1.1-.9 1.9-1.9 1.9s-1.9-.8-1.9-1.9c0-1.1.7-2.2 1.9-3.6z" fill="#FFF4D6"/>'
                 f'<rect x="7" y="18" width="10" height="3.6" rx="1.6" fill="{c}" opacity=".85"/>',
        "talento": f'<circle cx="12" cy="12" r="9" fill="{c}"/><circle cx="12" cy="12" r="6.3" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>'
                   f'<path d="M10.2 8.4h3.6M12 8.4v7.2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
        "perla": f'<circle cx="12" cy="12.5" r="8" fill="{c}"/><circle cx="9.5" cy="9.5" r="2.6" fill="#fff" opacity=".7"/>',
        "inicio": f'<path d="M3.5 11 12 3.8 20.5 11v8.7a1.5 1.5 0 0 1-1.5 1.5h-4.2v-6h-5.6v6H5a1.5 1.5 0 0 1-1.5-1.5z" fill="{c}"/>',
        "biblia": f'<path d="M2.5 5.2c3-1.5 6.3-1.4 8.7.7v13.6c-2.4-1.8-5.7-1.9-8.7-.6z" fill="{c}"/>'
                  f'<path d="M21.5 5.2c-3-1.5-6.3-1.4-8.7.7v13.6c2.4-1.8 5.7-1.9 8.7-.6z" fill="{c}"/>',
        "travesia": f'<circle cx="12" cy="12" r="8.6" stroke="{c}" stroke-width="2.6" fill="none"/><path d="m16.4 7.6-2.8 6-6 2.8 2.8-6z" fill="{c}"/>',
        "jugar": f'<path d="M5 4l6.5 6.5-1.6 1.6L3.4 5.6V4zm14 0v1.6l-9.6 9.6 1.4 1.4-1.6 1.6-1.9-1.9-2.6 2.6-1.4-1.4 2.6-2.6-1.9-1.9 1.6-1.6 1.4 1.4L17.4 4z" fill="{c}"/>'
                 f'<path d="m14.2 15.6 1.6-1.6 1.4 1.4 1.4-1.4 1.4 1.4-1.4 1.4 2.6 2.6-1.4 1.4-2.6-2.6-1.4 1.4-1.4-1.4 1.4-1.4z" fill="{c}"/>',
        "comunidad": f'<circle cx="8.5" cy="8.5" r="3.4" fill="{c}"/><circle cx="16.2" cy="9.4" r="2.8" fill="{c}" opacity=".8"/>'
                     f'<path d="M2.5 19c.4-3.6 2.9-5.7 6-5.7s5.6 2.1 6 5.7z" fill="{c}"/><path d="M14.6 14c2.9-.5 5.9.9 6.4 4.6h-4.6c-.2-1.8-.8-3.4-1.8-4.6z" fill="{c}" opacity=".8"/>',
        "calendario": f'<rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="{c}"/><rect x="3.5" y="5" width="17" height="4.6" rx="2" fill="#000" opacity=".18"/>'
                      f'<path d="M8 3v4M16 3v4" stroke="{c}" stroke-width="2.4" stroke-linecap="round"/><rect x="7" y="12" width="3.4" height="3" rx=".8" fill="#fff"/><rect x="13.4" y="12" width="3.4" height="3" rx=".8" fill="#fff" opacity=".6"/>',
        "cofre": f'<path d="M4 10h16v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" fill="{c}"/><path d="M4 10a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5z" fill="{c}" opacity=".8"/>'
                 f'<rect x="10.3" y="9" width="3.4" height="5" rx="1" fill="#fff"/>',
        "trofeo": f'<path d="M7 3.5h10v5.5a5 5 0 0 1-10 0z" fill="{c}"/><path d="M7 5H4.2c0 2.6 1.4 4.3 3.4 4.6M17 5h2.8c0 2.6-1.4 4.3-3.4 4.6" stroke="{c}" stroke-width="1.8" fill="none"/>'
                  f'<path d="M10.5 13.8h3l.6 3.7h-4.2z" fill="{c}"/><rect x="7.5" y="17.5" width="9" height="3" rx="1" fill="{c}"/>',
        "play": f'<circle cx="12" cy="12" r="9" stroke="{c}" stroke-width="2.4" fill="none"/><path d="M10 7.6v8.8l6.8-4.4z" fill="{c}"/>',
        "tri": f'<path d="M8 4.8c0-1 1.1-1.6 1.9-1.1l10 6.6c.8.5.8 1.6 0 2.1l-10 6.6c-.8.5-1.9-.1-1.9-1.1z" fill="{c}"/>',
        "candado": f'<rect x="5" y="10.5" width="14" height="10" rx="2.6" fill="{c}"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="{c}" stroke-width="2.4" fill="none"/>',
        "estrella": f'<path d="m12 2.8 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.6l-5.6 3.2 1.3-6.2L3 9.3l6.3-.7z" fill="{c}"/>',
        "campana": f'<path d="M12 3a6 6 0 0 1 6 6v4.5l1.8 3H4.2l1.8-3V9a6 6 0 0 1 6-6z" fill="{c}"/><circle cx="12" cy="19.5" r="2" fill="{c}"/>',
        "rayo": f'<path d="M13.5 2 5 13.5h6L9.8 22 19 9.8h-6.2z" fill="{c}"/>',
        "corona": f'<path d="M3 8l4.4 3.8L12 5l4.6 6.8L21 8l-2 10.5H5z" fill="{c}"/><rect x="5" y="18.8" width="14" height="2.4" rx="1" fill="{c}"/>',
        "flecha": f'<path d="M5 12h12M12.5 6.5 18 12l-5.5 5.5" stroke="{c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        "check": f'<path d="m5 12.5 4.2 4.2L19 7" stroke="{c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        "cruz": f'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="{c}" stroke-width="3" stroke-linecap="round"/>',
        "lupa": f'<circle cx="10.5" cy="10.5" r="6" stroke="{c}" stroke-width="2.6" fill="none"/><path d="m15 15 5 5" stroke="{c}" stroke-width="2.8" stroke-linecap="round"/>',
        "reloj": f'<circle cx="12" cy="12.6" r="8" stroke="{c}" stroke-width="2.6" fill="none"/><path d="M12 8.6v4.4l3 1.8M9.5 2.6h5" stroke="{c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
        "luz": f'<circle cx="12" cy="10" r="5.6" fill="{c}"/><rect x="9.4" y="16.2" width="5.2" height="4" rx="1.2" fill="{c}" opacity=".85"/>'
               f'<path d="M12 1.5v1.6M3.5 10H2M22 10h-1.5M5.6 3.8l1.1 1.1M18.4 3.8l-1.1 1.1" stroke="{c}" stroke-width="1.8" stroke-linecap="round"/>',
        "pista": f'<path d="M5 3.5h10.5L19 7v13.5H5z" fill="{c}"/><path d="M8 10h8M8 13.5h8M8 17h5" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>',
        "doble": f'<circle cx="9" cy="12" r="6.5" fill="{c}"/><circle cx="15" cy="12" r="6.5" fill="{c}" opacity=".6"/><path d="M7 12.3l1.6 1.6 3-3.3" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
        "cambio": f'<path d="M5 9h11.5l-3-3M19 15H7.5l3 3" stroke="{c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
        "tribuna": f'<rect x="3" y="13" width="4" height="7" rx="1" fill="{c}"/><rect x="10" y="8" width="4" height="12" rx="1" fill="{c}"/><rect x="17" y="4" width="4" height="16" rx="1" fill="{c}"/>',
        "compartir": f'<circle cx="17.5" cy="5.5" r="3" fill="{c}"/><circle cx="6.5" cy="12" r="3" fill="{c}"/><circle cx="17.5" cy="18.5" r="3" fill="{c}"/>'
                     f'<path d="m8.9 10.6 6.2-3.6M8.9 13.4l6.2 3.6" stroke="{c}" stroke-width="2"/>',
        "parlante": f'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="{c}"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="{c}" stroke-width="2" fill="none" stroke-linecap="round"/>',
        "mas": f'<circle cx="12" cy="12" r="10" fill="{c}"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
        "qr": f'<rect x="3" y="3" width="7" height="7" rx="1.4" fill="{c}"/><rect x="14" y="3" width="7" height="7" rx="1.4" fill="{c}"/><rect x="3" y="14" width="7" height="7" rx="1.4" fill="{c}"/>'
              f'<rect x="14" y="14" width="3" height="3" fill="{c}"/><rect x="18" y="18" width="3" height="3" fill="{c}"/>',
        "grafico": f'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="{c}" stroke-width="2.6" stroke-linecap="round"/>',
        "oracion": f'<path d="M12 3c1 2.8 1.6 5.6 1.6 8.4v5.2L17 20h-4.4L12 18l-.6 2H7l3.4-3.4v-5.2C10.4 8.6 11 5.8 12 3z" fill="{c}"/>',
        "pdf": f'<path d="M6 3h8l4 4v14H6z" fill="{c}"/><path d="M14 3v4h4" fill="#000" opacity=".2"/><path d="M8.5 13h7M8.5 16h5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
        "mapa": f'<path d="M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20z" fill="{c}"/><path d="M8.5 4v13.5M15.5 6.5V20" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"/>',
        "lampara": f'<path d="M5 15h14l-2 4H7z" fill="{c}"/><path d="M4.5 13.5c2-1.6 5.5-2.3 7.5-2.3s5.5.7 7.5 2.3z" fill="{c}" opacity=".85"/>'
                   f'<path d="M12 2.8c1.9 2.3 2.8 4 2.8 5.5a2.8 2.8 0 0 1-5.6 0c0-1.5.9-3.2 2.8-5.5z" fill="{ORO}"/>',
    }[nombre]
    return f'<svg class="ic" viewBox="0 0 24 24" width="{tam}" height="{tam}" {extra}>{p}</svg>'


# ─────────────────────────────── piezas de la armadura (íconos de juego) ───────────────────────────────
def _metal_defs(uid: str, gema: str) -> str:
    return (f'<defs><linearGradient id="m{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F7FC"/>'
            f'<stop offset=".45" stop-color="#B9C4D6"/><stop offset="1" stop-color="#5E6A82"/></linearGradient>'
            f'<linearGradient id="g{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE29A"/><stop offset=".5" stop-color="{AMBAR}"/>'
            f'<stop offset="1" stop-color="{AMBAR_OSC}"/></linearGradient>'
            f'<radialGradient id="j{uid}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="{gema}"/>'
            f'<stop offset="1" stop-color="{gema}" stop-opacity=".75"/></radialGradient></defs>')


def pieza_svg(clave: str, tam: float = 64, apagada: bool = False) -> str:
    """Ícono de juego de cada pieza: metal con brillo, ribete dorado y gema del color de su categoría."""
    _, _, _, col, _, _, _ = CAT[clave]
    u = _uid("pz")
    M, G, J = f"url(#m{u})", f"url(#g{u})", f"url(#j{u})"
    formas = {
        "escudo": f'<path d="M32 6 52 13v15c0 14-8.6 23.5-20 29C20.6 51.5 12 42 12 28V13z" fill="{M}" stroke="{G}" stroke-width="3.2"/>'
                  f'<path d="M32 11.5 47 17v11.5c0 10.6-6.2 18.2-15 22.8z" fill="#fff" opacity=".22"/>'
                  f'<circle cx="32" cy="29" r="7.5" fill="{J}" stroke="{G}" stroke-width="2"/>',
        "espada": f'<path d="M32 4 37 10v30h-10V10z" fill="{M}" stroke="#4d5870" stroke-width="1.2"/><path d="M32 6v33" stroke="#fff" stroke-opacity=".7" stroke-width="1.6"/>'
                  f'<rect x="17" y="40" width="30" height="6" rx="3" fill="{G}"/><rect x="29" y="46" width="6" height="10" rx="2" fill="#6b4a1f"/>'
                  f'<circle cx="32" cy="58" r="4" fill="{J}" stroke="{G}" stroke-width="1.6"/><circle cx="32" cy="43" r="2.6" fill="{J}"/>',
        "casco": f'<path d="M12 36c0-14 9-24 20-24s20 10 20 24v6H38v-9H26v9H12z" fill="{M}" stroke="{G}" stroke-width="3"/>'
                 f'<path d="M30 12h4v20h-4z" fill="{G}"/><path d="M18 30c0-9 5.5-14 11-15.5" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
                 f'<circle cx="32" cy="21" r="4.2" fill="{J}" stroke="{G}" stroke-width="1.4"/><path d="M12 42h14M38 42h14" stroke="{G}" stroke-width="3" stroke-linecap="round"/>',
        "coraza": f'<path d="M16 12 25 9c2 3.6 4.5 5 7 5s5-1.4 7-5l9 3 4 10-6 3v24c-5 3-9.4 4-14 4s-9-1-14-4V25l-6-3z" fill="{M}" stroke="{G}" stroke-width="3"/>'
                  f'<path d="M32 18v36" stroke="#4d5870" stroke-opacity=".45" stroke-width="1.4"/><path d="M22 22c0 8 2 14 6 18" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
                  f'<circle cx="32" cy="30" r="6.5" fill="{J}" stroke="{G}" stroke-width="2"/>',
        "cinturon": f'<rect x="6" y="24" width="52" height="16" rx="5" fill="{M}" stroke="#4d5870" stroke-width="1.2"/><path d="M8 28h48" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>'
                    f'<rect x="22" y="19" width="20" height="26" rx="5" fill="{G}"/><rect x="26.5" y="23.5" width="11" height="17" rx="3" fill="#7a5216" opacity=".35"/>'
                    f'<circle cx="32" cy="32" r="5.5" fill="{J}" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>',
        "botas": f'<path d="M14 8h16v26l8 6c6 1.5 12 4 12 10v4H14z" fill="{M}" stroke="{G}" stroke-width="3" stroke-linejoin="round"/>'
                 f'<path d="M14 48h36" stroke="{G}" stroke-width="3"/><path d="M18 12v24" stroke="#fff" stroke-opacity=".6" stroke-width="2.2" stroke-linecap="round"/>'
                 f'<path d="M30 20h-12M30 27h-12" stroke="#4d5870" stroke-opacity=".5" stroke-width="1.6"/><circle cx="24" cy="40" r="5" fill="{J}" stroke="{G}" stroke-width="1.6"/>'
                 f'<path d="M44 40l6-6M48 44l7-4" stroke="{col}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>',
    }
    filtro = ' style="filter:grayscale(1) brightness(.55) opacity(.55)"' if apagada else ""
    return (f'<svg viewBox="0 0 64 64" width="{tam}" height="{tam}"{filtro}>{_metal_defs(u, col)}'
            f'<g style="filter:drop-shadow(0 2px 1.5px rgba(0,0,0,.35))">{formas[clave]}</g></svg>')


def insignia_pieza(clave: str, tam: float = 88, texto: bool = True) -> str:
    """Pieza dentro de una insignia con el color de su categoría (para tablas y tarjetas)."""
    _, pieza, cat, col, claro, _, _ = CAT[clave]
    return (f'<div class="pz2" style="--c:{col};--c2:{claro};width:{tam}px;height:{tam}px">'
            f'<div class="pz2-in">{pieza_svg(clave, tam * .66)}</div></div>')


# ─────────────────────────────── emblema del guerrero (la armadura que se completa) ───────────────────────────────
def emblema(ganadas: list[str], tam: float = 60, rival: bool = False) -> str:
    """Silueta neutra con 6 espacios: casco, coraza, cinturón, botas, escudo y espada."""
    def col(k):
        return CAT[k][3] if k in ganadas else "#ffffff22"

    def brillo(k):
        return f' style="filter:drop-shadow(0 0 3px {CAT[k][3]})"' if k in ganadas else ""
    borde = "#ffffff55"
    return f"""<svg viewBox="0 0 64 64" width="{tam}" height="{tam}">
<circle cx="32" cy="32" r="30" fill="{'#ffffff10' if rival else '#00000033'}" stroke="{borde}" stroke-width="1.2"/>
<path d="M24 19c0-6 3.6-10 8-10s8 4 8 10v3H24z" fill="{col('casco')}"{brillo('casco')}/>
<path d="M23 24h18l2 13H21z" fill="{col('coraza')}"{brillo('coraza')}/>
<rect x="21.5" y="37.5" width="21" height="4" rx="1.6" fill="{col('cinturon')}"{brillo('cinturon')}/>
<path d="M23.5 43h6.5l-.6 11h-6.8zM34 43h6.5l1 11h-6.8z" fill="{col('botas')}"{brillo('botas')}/>
<path d="M9 27l8-3 8 3v6c0 6-3.5 10-8 12-4.5-2-8-6-8-12z" fill="{col('escudo')}"{brillo('escudo')}/>
<path d="M50 10l3 3-9 21-3-1.5z" fill="{col('espada')}"{brillo('espada')}/><path d="M40 31l7 3.4" stroke="{col('espada')}" stroke-width="3" stroke-linecap="round"/>
</svg>"""


# ─────────────────────────────── Lani v2 ───────────────────────────────
_POSES = {
    #          mano izq        mano der        cuerpo°  piernas      expresión
    "reposo": ((63, 170), (137, 170), 0, "quieto", "canchera"),
    "festejo": ((56, 92), (144, 92), 0, "salto", "feliz"),
    "saludo": ((63, 170), (150, 96), -3, "quieto", "alegre"),
    "pensando": ((63, 170), (108, 112), 2, "quieto", "pensando"),
    "uff": ((63, 170), (113, 63), 3, "quieto", "uff"),
    "guardia": ((84, 146), (120, 140), -4, "abierto", "decidida"),
    "corriendo": ((76, 150), (130, 128), -12, "corre", "decidida"),
    "armadura": ((52, 150), (150, 88), 0, "abierto", "decidida"),
    "dormida": ((70, 168), (130, 168), 0, "quieto", "dormida"),
    "desmayo": ((60, 150), (140, 150), 78, "quieto", "desmayo"),
    "baile": ((54, 110), (140, 160), -8, "baile", "feliz"),
}


def lani(pose: str = "reposo", tam: float = 160, buzo: str | None = None, gorra: str | None = None, lentes: bool = False,
         auriculares: bool = False, armadura: bool = False, panuelo: str = AMBAR, sombra: bool = True, mirada=(0.0, 0.0),
         clase: str = "") -> str:
    """Lani v2: oveja joven de pie, cara carbón, cejas de lana, pañuelo y zapatillas. Neutra; nada de rasgos de bebé."""
    u = _uid("ln")
    (lx, ly), (rx, ry), giro, piernas, expr = _POSES[pose]
    armadura = armadura or pose == "armadura"
    W = f"url(#w{u})"
    F = f"url(#f{u})"
    defs = (f'<defs><radialGradient id="w{u}" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#FFFEFA"/><stop offset=".55" stop-color="#F3E9D8"/>'
            f'<stop offset="1" stop-color="#D9C7AA"/></radialGradient>'
            f'<linearGradient id="f{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4C4955"/><stop offset="1" stop-color="#2C2A33"/></linearGradient>'
            f'<linearGradient id="p{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{ORO}"/><stop offset="1" stop-color="{panuelo}"/></linearGradient></defs>')
    # piernas y zapatillas
    if piernas == "salto":
        pl, pr, dy = (86, 176, -8), (103, 176, 8), -10
    elif piernas == "abierto":
        pl, pr, dy = (82, 176, 10), (107, 176, -10), 0
    elif piernas == "corre":
        pl, pr, dy = (84, 176, 35), (104, 176, -30), 0
    elif piernas == "baile":
        pl, pr, dy = (84, 176, 18), (104, 176, -6), -4
    else:
        pl, pr, dy = (86, 176, 0), (103, 176, 0), 0

    def pierna(x, y, ang):
        return (f'<g transform="rotate({ang} {x + 5.5} {y})"><rect x="{x}" y="{y}" width="11" height="38" rx="5.5" fill="{F}"/>'
                f'<path d="M{x - 4} {y + 34} q0 -5 6 -5 h8 q6 0 7 6 v3 q0 3 -3 3 h-15 q-3 0 -3 -3z" fill="#fff"/>'
                f'<path d="M{x - 4} {y + 39} h21" stroke="#2C2A33" stroke-width="2.6" stroke-linecap="round"/>'
                f'<path d="M{x + 1} {y + 32.5} l7 0" stroke="{AMBAR}" stroke-width="2.4" stroke-linecap="round"/></g>')
    patas = pierna(*pl) + pierna(*pr)
    # cuerpo de lana
    nubes = [(75, 137, 21), (125, 137, 21), (80, 160, 19), (120, 160, 19), (100, 165, 22), (100, 134, 27), (87, 118, 15), (113, 118, 15)]
    cuerpo = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{W}"/>' for x, y, r in nubes)
    cuerpo = f'<g stroke="#D3BF9F" stroke-width="1.4">{cuerpo}</g>'
    # buzo (opcional)
    ropa = ""
    if buzo:
        ropa = (f'<path d="M64 128 Q66 114 84 112 Q100 120 116 112 Q134 114 136 128 L138 172 Q100 186 62 172 Z" fill="{buzo}"/>'
                f'<path d="M64 128 Q66 114 84 112 Q100 120 116 112 Q134 114 136 128" stroke="#fff" stroke-opacity=".22" stroke-width="2" fill="none"/>'
                f'<path d="M82 150 h36 l3 14 q-21 7 -42 0z" fill="#000" opacity=".16"/>'
                f'<path d="M94 118 v15 M106 118 v15" stroke="#fff" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"/>'
                f'<path d="M62 168 Q100 182 138 168 L138 174 Q100 188 62 174Z" fill="#000" opacity=".2"/>')
    # brazos
    manga = buzo or F

    def brazo(x0, y0, x1, y1):
        return (f'<path d="M{x0} {y0} L{x1} {y1}" stroke="{manga}" stroke-width="{12 if buzo else 10.5}" stroke-linecap="round"/>'
                f'<circle cx="{x1}" cy="{y1}" r="6.6" fill="#2C2A33"/><path d="M{x1 - 3} {y1 - 3} q3 -2 6 0" stroke="#5a5662" stroke-width="1.4" fill="none"/>')
    brazos = brazo(76, 134, lx, ly) + brazo(124, 134, rx, ry)
    # armadura (encima del cuerpo)
    arm = ""
    if armadura:
        arm = (f'<path d="M74 122 Q100 114 126 122 L130 166 Q100 176 70 166 Z" fill="#C3CCDA" stroke="{AMBAR}" stroke-width="2.4"/>'
               f'<path d="M80 128 Q90 140 88 160" stroke="#fff" stroke-opacity=".7" stroke-width="2.4" fill="none"/>'
               f'<circle cx="100" cy="142" r="6" fill="{CAT["coraza"][3]}" stroke="{AMBAR}" stroke-width="1.6"/>'
               f'<rect x="70" y="166" width="60" height="7" rx="3" fill="{AMBAR}"/><circle cx="100" cy="169.5" r="3" fill="{CAT["cinturon"][3]}"/>')
    # cabeza
    gx, gy = mirada
    ojos, cejas, boca = "", "", ""
    ex = {"canchera": (0, 0), "alegre": (0, 0), "feliz": (0, 0), "pensando": (-2.2, -2.6), "uff": (0, 1.6), "decidida": (0, .5),
          "dormida": (0, 0), "desmayo": (0, 0)}[expr]
    px, py = ex[0] + gx, ex[1] + gy
    if expr in ("feliz",):
        ojos = ('<path d="M82 84 q7 -8 14 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>'
                '<path d="M104 84 q7 -8 14 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>')
    elif expr in ("dormida", "desmayo"):
        ojos = ('<path d="M82 83 q7 5 14 0" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
                '<path d="M104 83 q7 5 14 0" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>')
    else:
        alto = 7.8 if expr != "uff" else 5.6
        ojos = (f'<ellipse cx="89" cy="82" rx="7.4" ry="{alto}" fill="#fff"/><ellipse cx="111" cy="82" rx="7.4" ry="{alto}" fill="#fff"/>'
                f'<circle cx="{89 + px}" cy="{83 + py}" r="4.8" fill="#141218"/><circle cx="{111 + px}" cy="{83 + py}" r="4.8" fill="#141218"/>'
                f'<circle cx="{90.6 + px}" cy="{81.4 + py}" r="1.5" fill="#fff"/><circle cx="{112.6 + px}" cy="{81.4 + py}" r="1.5" fill="#fff"/>')
        if expr == "uff":
            ojos += '<path d="M81 78 h16 M103 78 h16" stroke="url(#f%s)" stroke-width="4"/>' % u
        if expr in ("canchera", "decidida"):
            k = 3.6 if expr == "canchera" else 5
            ojos += (f'<path d="M80.5 {73 + k} Q89 {72 + k - 2} 97.5 {74 + k} L97.5 72 L80.5 72Z" fill="url(#f{u})"/>'
                     f'<path d="M102.5 {74 + k} Q111 {72 + k - 2} 119.5 {73 + k} L119.5 72 L102.5 72Z" fill="url(#f{u})"/>')
    cej = {"canchera": ((-6, 2), (6, -2), -3), "alegre": ((-4, -2), (4, -2), -5), "feliz": ((-4, -2), (4, -2), -6),
           "pensando": ((-6, 2), (8, -4), -6), "uff": ((5, 3), (-5, 3), -1), "decidida": ((8, 4), (-8, 4), 0),
           "dormida": ((0, 0), (0, 0), 0), "desmayo": ((5, 3), (-5, 3), 0)}[expr]
    (al, bl), (ar, br), sube = cej

    def ceja(cx, ang, b):
        return (f'<g transform="rotate({ang} {cx} {69 + sube})"><rect x="{cx - 8}" y="{66 + sube + b / 3}" width="16" height="5.4" rx="2.7" '
                f'fill="#F6EEDF"/></g>')
    cejas = ceja(89, al, bl) + ceja(111, ar, br)
    bocas = {
        "canchera": '<path d="M92 105 Q102 111 109 102" stroke="#141218" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
        "alegre": '<path d="M91 103 Q100 112 109 103" stroke="#141218" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
        "feliz": '<path d="M89 101 Q100 118 111 101 Z" fill="#141218"/><path d="M94 109 q6 5 12 0 q-6 -3 -12 0" fill="#E5484D"/>',
        "pensando": '<path d="M95 106 h9" stroke="#141218" stroke-width="2.6" stroke-linecap="round"/>',
        "uff": '<path d="M91 107 q4.5 -4 9 0 q4.5 4 9 0" stroke="#141218" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
        "decidida": '<path d="M92 104 Q101 108 109 103" stroke="#141218" stroke-width="2.8" fill="none" stroke-linecap="round"/>',
        "dormida": '<ellipse cx="100" cy="106" rx="3" ry="2.2" fill="#141218"/>',
        "desmayo": '<path d="M93 104 q7 6 14 0" stroke="#141218" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M104 106 q2 6 5 3" fill="#E5484D"/>',
    }
    boca = bocas[expr]
    cabeza = (f'<ellipse cx="66" cy="80" rx="16" ry="6.4" fill="{F}" transform="rotate(-22 66 80)"/>'
              f'<ellipse cx="134" cy="80" rx="16" ry="6.4" fill="{F}" transform="rotate(22 134 80)"/>'
              f'<ellipse cx="67" cy="80" rx="8.5" ry="2.8" fill="#6b6672" transform="rotate(-22 67 80)"/>'
              f'<ellipse cx="133" cy="80" rx="8.5" ry="2.8" fill="#6b6672" transform="rotate(22 133 80)"/>'
              f'<ellipse cx="100" cy="84" rx="27" ry="30" fill="{F}"/>'
              f'<path d="M80 70 q4 -12 16 -14" stroke="#fff" stroke-opacity=".12" stroke-width="4" fill="none" stroke-linecap="round"/>'
              f'<g stroke="#D3BF9F" stroke-width="1.2"><circle cx="87" cy="57" r="10" fill="{W}"/><circle cx="100" cy="51" r="12" fill="{W}"/>'
              f'<circle cx="113" cy="57" r="10" fill="{W}"/></g>'
              f'<ellipse cx="100" cy="101" rx="13.5" ry="9.5" fill="#56525D"/>'
              f'<ellipse cx="95.5" cy="97.5" rx="2" ry="1.4" fill="#232128"/><ellipse cx="104.5" cy="97.5" rx="2" ry="1.4" fill="#232128"/>'
              + ojos + cejas + boca)
    # accesorios de cabeza
    acc = ""
    if gorra:
        acc += (f'<path d="M73 62 Q100 36 127 62 Q100 54 73 62Z" fill="{gorra}"/><path d="M118 58 q18 2 22 10 q-12 -2 -24 -4z" fill="{gorra}"/>'
                f'<path d="M80 60 Q100 46 120 60" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/>')
    if lentes:
        acc += ('<g><rect x="79" y="76" width="19" height="11" rx="5" fill="#141218"/><rect x="102" y="76" width="19" height="11" rx="5" fill="#141218"/>'
                '<path d="M98 80 h4" stroke="#141218" stroke-width="2.4"/><path d="M83 79 l6 0" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/></g>')
    if armadura:
        acc += (f'<path d="M71 70 Q72 38 100 37 Q128 38 129 70 L122 70 Q120 50 100 49 Q80 50 78 70 Z" fill="#C3CCDA" stroke="{AMBAR}" stroke-width="2.2"/>'
                f'<path d="M98 37 h4 v16 h-4z" fill="{AMBAR}"/><circle cx="100" cy="44" r="3.4" fill="{CAT["casco"][3]}"/>')
    cuello = ""
    if auriculares:
        cuello += f'<path d="M78 112 Q100 128 122 112" stroke="#141218" stroke-width="5" fill="none"/><rect x="70" y="106" width="11" height="13" rx="4" fill="{VIOLETA}"/><rect x="119" y="106" width="11" height="13" rx="4" fill="{VIOLETA}"/>'
    if not buzo and not armadura:
        cuello += (f'<path d="M80 108 Q100 118 120 108 L104 133 Q100 137 96 133 Z" fill="url(#p{u})"/>'
                   f'<circle cx="100" cy="114" r="4.6" fill="{AMBAR_OSC}"/>'
                   f'<path d="M100 120 c1.6 2 2.4 3.4 2.4 4.6 a2.4 2.4 0 0 1 -4.8 0 c0 -1.2 .8 -2.6 2.4 -4.6z" fill="#FFF4D6"/>')
    # objetos en las manos (armadura)
    manos = ""
    if armadura:
        manos = (f'<g transform="translate({lx - 22} {ly - 26}) scale(.72)">{_escudo_simple()}</g>'
                 f'<g transform="translate({rx - 9} {ry - 62}) rotate(8)"><path d="M9 0 L13 6 V52 H5 V6 Z" fill="#DDE3EE" stroke="#5E6A82" stroke-width="1"/>'
                 f'<rect x="-3" y="52" width="24" height="5" rx="2.5" fill="{AMBAR}"/><rect x="7" y="57" width="4" height="9" fill="#6b4a1f"/></g>')
    extra = ""
    if pose == "dormida":
        extra = f'<text x="140" y="56" font-family="Unbounded" font-weight="800" font-size="16" fill="{VIOLETA}">z</text><text x="154" y="40" font-family="Unbounded" font-weight="800" font-size="12" fill="{VIOLETA}" opacity=".7">z</text>'
    if pose == "corriendo":
        extra = '<path d="M30 150 h22 M24 166 h26 M34 134 h16" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>'
    if pose == "uff":
        extra = '<path d="M146 58 q6 9 0 13 q-6 -4 0 -13z" fill="#8FD8F0"/><path d="M144 64 q1 3 3 3" stroke="#fff" stroke-width="1.4" fill="none"/>'
    if pose == "pensando":
        extra = (f'<circle cx="140" cy="62" r="3.4" fill="#fff" opacity=".85"/><circle cx="150" cy="48" r="5" fill="#fff" opacity=".85"/>'
                 f'<circle cx="166" cy="30" r="12" fill="#fff"/><text x="166" y="36" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="16" fill="{VIOLETA}">?</text>')
    if pose == "saludo":
        extra = '<path d="M164 80 q8 10 3 22 M172 74 q10 14 4 30" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>'
    if pose == "baile":
        extra = (f'<g fill="{ORO}"><path d="M150 40 v22 a5 4 0 1 1 -3 -4 v-14 l12 -3 v4z"/></g>'
                 f'<g fill="#C9B0FF"><path d="M36 60 v18 a4.4 3.6 0 1 1 -2.6 -3.4 v-11 l10 -2.6 v3.4z"/></g>')
    if pose == "guardia":
        extra = f'<path d="M40 222 h24 M136 222 h24 M30 210 h18 M152 210 h18" stroke="{ORO}" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>'
    if pose == "festejo":
        extra = (f'<g fill="{ORO}"><path d="M40 60 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"/><path d="M160 54 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4z"/></g>')
    sombra_svg = '<ellipse cx="100" cy="226" rx="46" ry="6" fill="#000" opacity=".18"/>' if sombra else ""
    trans = f"translate(0 {dy}) rotate({giro} 100 200)" if pose != "desmayo" else "translate(-6 46) rotate(72 100 150) scale(.86)"
    cuerpo_todo = (f'<g transform="{trans}">{patas}{cuerpo}{ropa}{arm}{brazos}{cuello}'
                   f'<g>{cabeza}{acc}</g>{manos}</g>')
    return (f'<svg class="ln2 {clase}" viewBox="0 0 200 240" width="{tam}" height="{tam * 1.2:.0f}" role="img" aria-label="Lani">{defs}'
            f'{sombra_svg}{cuerpo_todo}{extra}</svg>')


def _escudo_simple() -> str:
    c = CAT["escudo"][3]
    return (f'<path d="M30 2 56 11v19c0 18-11 30-26 37C15 60 4 48 4 30V11z" fill="#C3CCDA" stroke="{AMBAR}" stroke-width="3"/>'
            f'<circle cx="30" cy="30" r="9" fill="{c}" stroke="{AMBAR}" stroke-width="2"/>')


# ─────────────────────────────── vehículos de Tu Lani ───────────────────────────────
def vehiculo(tipo: str, tam: float = 90) -> str:
    u = _uid("vh")
    if tipo == "moto":
        s = (f'<circle cx="22" cy="44" r="11" fill="#1E1B26"/><circle cx="22" cy="44" r="5" fill="#9AA3B5"/>'
             f'<circle cx="74" cy="44" r="11" fill="#1E1B26"/><circle cx="74" cy="44" r="5" fill="#9AA3B5"/>'
             f'<path d="M20 36 Q30 22 50 24 L62 24 Q70 24 76 34 L70 38 Q60 32 52 34 L36 36 Z" fill="{VIOLETA}"/>'
             f'<path d="M40 24 h18 q4 0 4 4 h-24z" fill="#1E1B26"/><path d="M66 22 l8 -10 h6" stroke="#1E1B26" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
             f'<circle cx="80" cy="30" r="3" fill="{ORO}"/><path d="M28 30 Q34 26 44 27" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>')
    elif tipo == "auto":
        s = (f'<path d="M8 40 Q8 30 18 28 L30 16 Q34 12 42 12 H62 Q70 12 74 18 L82 28 Q92 30 92 40 V44 H8Z" fill="{AMBAR}"/>'
             f'<path d="M33 18 Q36 15 42 15 H50 V28 H24Z" fill="#BDE4FF"/><path d="M54 15 H62 Q67 15 70 19 L76 28 H54Z" fill="#BDE4FF"/>'
             f'<circle cx="26" cy="45" r="9" fill="#1E1B26"/><circle cx="26" cy="45" r="4" fill="#9AA3B5"/><circle cx="74" cy="45" r="9" fill="#1E1B26"/>'
             f'<circle cx="74" cy="45" r="4" fill="#9AA3B5"/><path d="M14 32 h70" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>')
    elif tipo == "skate":
        s = (f'<rect x="10" y="34" width="80" height="7" rx="3.5" fill="{VERDE}"/><path d="M14 35 h72" stroke="#fff" stroke-opacity=".4" stroke-width="1.5"/>'
             f'<circle cx="24" cy="46" r="5" fill="#1E1B26"/><circle cx="76" cy="46" r="5" fill="#1E1B26"/>')
    elif tipo == "bici":
        s = (f'<circle cx="22" cy="40" r="13" fill="none" stroke="#1E1B26" stroke-width="3.4"/><circle cx="76" cy="40" r="13" fill="none" stroke="#1E1B26" stroke-width="3.4"/>'
             f'<path d="M22 40 L40 22 H62 L76 40 M40 22 L50 40 L62 22 M58 14 h8" stroke="{CAT["escudo"][3]}" stroke-width="3.4" fill="none" stroke-linejoin="round"/>')
    else:  # carro de fuego
        s = (f'<defs><linearGradient id="fu{u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="{ROJO}"/><stop offset=".5" stop-color="{AMBAR}"/>'
             f'<stop offset="1" stop-color="#FFF1B8"/></linearGradient></defs>'
             f'<path d="M6 40 C10 22 18 30 18 14 C26 24 30 18 30 6 C40 18 44 12 48 2 C56 16 62 14 66 6 C70 18 78 16 82 10 C86 22 92 26 94 40 Z" fill="url(#fu{u})"/>'
             f'<path d="M20 26 H76 L72 42 H24 Z" fill="{AMBAR}" stroke="#8a5a10" stroke-width="2"/><path d="M26 30 H70" stroke="#FFE29A" stroke-width="2"/>'
             f'<circle cx="34" cy="46" r="9" fill="none" stroke="{AMBAR_OSC}" stroke-width="3.4"/><circle cx="62" cy="46" r="9" fill="none" stroke="{AMBAR_OSC}" stroke-width="3.4"/>'
             f'<path d="M34 37v18M25 46h18M62 37v18M53 46h18" stroke="{AMBAR_OSC}" stroke-width="2"/>')
    return f'<svg viewBox="0 0 100 58" width="{tam}" height="{tam * .58:.0f}">{s}</svg>'


# ─────────────────────────────── logo (concepto) ───────────────────────────────
def logo_simbolo(tam: float = 120, claro: bool = False) -> str:
    """Una S que es un camino y, arriba, la llama de una lámpara. Concepto para el diseñador, no el logo final."""
    u = _uid("lg")
    fondo = (f'<rect width="120" height="120" rx="28" fill="url(#b{u})"/>' if not claro else
             '<rect width="120" height="120" rx="28" fill="#fff" stroke="#E6E1F5" stroke-width="2"/>')
    return (f'<svg viewBox="0 0 120 120" width="{tam}" height="{tam}" role="img" aria-label="Concepto de logo">'
            f'<defs><linearGradient id="b{u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4B36A8"/>'
            f'<stop offset=".55" stop-color="{INDIGO}"/><stop offset="1" stop-color="{NOCHE}"/></linearGradient>'
            f'<linearGradient id="s{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{ORO}"/><stop offset="1" stop-color="{AMBAR}"/></linearGradient></defs>'
            f'{fondo}<path d="M80 38 C58 30 36 40 40 56 C44 72 82 64 80 84 C78 100 54 102 38 92" stroke="url(#s{u})" stroke-width="13" fill="none" stroke-linecap="round"/>'
            f'<path d="M88 13 C96 23 97 31 88 37 C79 31 80 23 88 13 Z" fill="{ORO}"/><path d="M88 22 C91 27 91 31 88 33 C85 31 85 27 88 22 Z" fill="#FFF4D6"/></svg>')


def logo_txt(tam: float = 18, color: str = "#fff") -> str:
    return (f'<span class="logo-mini">{logo_simbolo(tam)}<b style="color:{color}">senda</b></span>')


# ─────────────────────────────── escenas ───────────────────────────────
def escena_mar(ancho: float = 200, alto: float = 120) -> str:
    """Escena para una pregunta con imagen: alguien abre el mar (de espaldas, en silueta)."""
    u = _uid("es")
    return f"""<svg viewBox="0 0 200 120" width="{ancho}" height="{alto}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="c{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB86B"/><stop offset=".55" stop-color="#F58A6E"/><stop offset="1" stop-color="#7A4FD0"/></linearGradient>
<linearGradient id="o{u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1D5FD8"/><stop offset="1" stop-color="#3FB4F0"/></linearGradient>
<linearGradient id="o2{u}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#1D5FD8"/><stop offset="1" stop-color="#3FB4F0"/></linearGradient></defs>
<rect width="200" height="120" fill="url(#c{u})"/><circle cx="100" cy="40" r="16" fill="#FFE7A8" opacity=".9"/>
<path d="M0 34 Q30 26 56 40 L82 120 H0Z" fill="url(#o{u})"/><path d="M200 30 Q170 24 144 40 L118 120 H200Z" fill="url(#o2{u})"/>
<path d="M10 44 q14 -6 26 2 M8 62 q16 -6 30 2 M14 82 q16 -6 32 2" stroke="#BFE7FF" stroke-width="2.2" fill="none" opacity=".8"/>
<path d="M190 42 q-14 -6 -26 2 M192 60 q-16 -6 -30 2 M186 80 q-16 -6 -32 2" stroke="#BFE7FF" stroke-width="2.2" fill="none" opacity=".8"/>
<path d="M82 120 L96 60 H104 L118 120Z" fill="#E9C38C"/>
<g fill="#2A1E3F"><circle cx="100" cy="74" r="4.2"/><path d="M95 79 h10 l2 20 h-14z"/><path d="M104 80 l9 -12" stroke="#2A1E3F" stroke-width="2.6" stroke-linecap="round"/>
<path d="M113 66 v-10" stroke="#5a3d1d" stroke-width="2.2" stroke-linecap="round"/></g>
</svg>"""


def mapa_travesia(ancho: float = 220, alto: float = 380) -> str:
    """Fondo ilustrado de la sección «Libres del faraón»: desierto, mar y el camino de niveles."""
    u = _uid("mp")
    return f"""<svg viewBox="0 0 220 380" width="{ancho}" height="{alto}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="s{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2170"/><stop offset=".45" stop-color="#7A4FD0"/><stop offset=".75" stop-color="#F58A6E"/><stop offset="1" stop-color="#FFB86B"/></linearGradient>
<linearGradient id="d{u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C27B"/><stop offset="1" stop-color="#D99A4E"/></linearGradient></defs>
<rect width="220" height="380" fill="url(#s{u})"/>
<g fill="#fff" opacity=".7"><circle cx="30" cy="30" r="1.2"/><circle cx="80" cy="18" r="1"/><circle cx="160" cy="40" r="1.4"/><circle cx="190" cy="16" r="1"/><circle cx="120" cy="60" r="1"/></g>
<path d="M0 150 Q40 136 80 150 T160 148 T220 150 V380 H0Z" fill="#9C6BFF" opacity=".35"/>
<path d="M0 200 Q50 182 110 198 T220 194 V380 H0Z" fill="url(#d{u})"/>
<path d="M0 250 Q60 236 120 252 T220 246 V380 H0Z" fill="#E8B068"/>
<path d="M150 210 l14 -30 14 30z M168 214 l10 -22 10 22z" fill="#C98A3E"/>
<path d="M20 300 q8 -18 16 0 M36 300 q6 -12 12 0" stroke="#2E7D4F" stroke-width="3" fill="none"/>
<path d="M110 360 C40 330 180 300 110 270 C50 245 170 220 110 190 C70 170 150 140 110 110" stroke="#fff" stroke-opacity=".35" stroke-width="16" fill="none" stroke-linecap="round" stroke-dasharray="1 22"/>
</svg>"""
