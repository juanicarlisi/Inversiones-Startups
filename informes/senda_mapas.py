"""Bloques gráficos nuevos del proyecto Senda (v3, 11-10-2026).

- mapa_total(): toda la app en una hoja A3, MECE (oportunidades/proyectos/senda/mapa_total.yaml).
- fiesta_tablero(): el tablero del Éxodo de Senda Fiesta (capítulo 10, §12).
- lani3d_bloque(): Lani en 3D (capturas de la escena real de la app, en informes/fuente-senda/graficos/lani3d_*.png).
- estado_bloque(): el avance del desarrollo por área (estado.yaml) y las pruebas en el teléfono.
"""
from __future__ import annotations

import html
import math
from pathlib import Path

import yaml

import senda_visual as V

RAIZ = Path(__file__).resolve().parent.parent
DIR = RAIZ / "oportunidades" / "proyectos" / "senda"


def esc(t) -> str:
    return html.escape(str(t))


# ─────────────────────────────── toda la app en una hoja (A3) ───────────────────────────────
CONEXIONES = [
    ("Leés un capítulo", "suma a la racha y a las misiones de Inicio"),
    ("Fallás una pregunta del Espadeo o de una lección", "vuelve en tu repaso de la Travesía"),
    ("Usás una Lámpara en la lección", "se abre el pasaje en la Biblia"),
    ("Todo lo que hacés", "da Talentos para Tu Lani y los protectores"),
    ("La reunión de tu grupo", "aparece en tu calendario y te avisa"),
    ("Cada minijuego se hace una vez", "y sirve cuatro: Arcade, Fiesta, Reunión y campamento"),
]


def _cuenta(d) -> dict:
    n = {k: 0 for k in d["estados"]}
    for col in d["A"]:
        for g in col["grupos"]:
            for _, e in g["items"]:
                n[e] += 1
    for sec in ("B", "C"):
        for c in d[sec]:
            for _, e in c["items"]:
                n[e] += 1
    return n


def cuenta_mapa() -> dict:
    """Cuántas funciones hay en el mapa y cuántas en cada etapa (para los textos que las citan)."""
    d = yaml.safe_load((DIR / "mapa_total.yaml").read_text(encoding="utf-8"))
    n = _cuenta(d)
    return {**n, "total": sum(n.values())}


def _items(items, E) -> str:
    return "<ul>" + "".join(f'<li style="--e:{E[e]["color"]}">{esc(t)}</li>' for t, e in items) + "</ul>"


def _barra(items, E) -> str:
    n = {}
    for _, e in items:
        n[e] = n.get(e, 0) + 1
    return '<div class="mx-barra">' + "".join(f'<span style="flex:{n[k]};background:{E[k]["color"]}"></span>' for k in E if n.get(k)) + "</div>"


def mapa_total() -> str:
    d = yaml.safe_load((DIR / "mapa_total.yaml").read_text(encoding="utf-8"))
    E = d["estados"]
    n = _cuenta(d)
    total = sum(n.values())
    ley = "".join(f'<span><i style="background:{E[k]["color"]}"></i>{esc(E[k]["nombre"])} <b>{n[k]}</b></span>' for k in E)
    cols = []
    for col in d["A"]:
        todos = [x for g in col["grupos"] for x in g["items"]]
        ico = col["id"] if col["id"] != "perfil" else "estrella"
        grupos = "".join(f'<div class="mx-g"><div class="mx-gt">{esc(g["nombre"])}</div>{_items(g["items"], E)}</div>' for g in col["grupos"])
        hechos = sum(1 for _, e in todos if e == "hecho")
        cols.append(f'<div class="mx-col" style="--c:{col["color"]}"><div class="mx-h">{V.icono(ico, 13, "#fff")}<b>{esc(col["nombre"])}</b>'
                    f'<i>{esc(col["pregunta"])}</i></div>{_barra(todos, E)}<div class="mx-cuenta">{len(todos)} funciones · {hechos} ya andan</div>{grupos}</div>')
    tarjetas = lambda sec: "".join(  # noqa: E731
        f'<div class="mx-card"><h5>{V.icono(c.get("icono", "estrella"), 11, V.TINTA)}{esc(c["nombre"])}</h5>{_items(c["items"], E)}</div>' for c in d[sec])
    con = '<i class="mx-fl">·</i>'.join(f'<span><b>{esc(a)}</b> → {esc(b)}</span>' for a, b in CONEXIONES)
    cuando_txt = {"hecho": "ya funcionan, hoy", "mvp": "al lanzar, 18-12-2026", "v1": "«Juntos», mar-2027", "v2": "«Liga» y «Copa», 2.º semestre 2027", "luego": "2028 o evolutivo"}
    cuando = "".join(f'<div class="mx-cs" style="flex:{n[k]};--e:{E[k]["color"]}"><i></i><b>{n[k]}</b><span>{cuando_txt[k]}</span></div>' for k in E if n[k])
    return f"""<section class="a3 mapa-a3"><div class="a3-cab"><div><div class="a3-k">Hoja grande · toda la app en una hoja</div>
<div class="a3-h1">Senda: todo lo que hace, dónde vive y cuándo llega</div>
<div class="mx-sub">{total} funciones en tres niveles que no se pisan y lo cubren todo. Cada función vive en un solo lugar. {n["hecho"]} ya funcionan en la app de prueba (11-10-2026).</div></div>
<div class="mx-ley">{ley}</div></div>
<div class="mx-nivel"><div class="mx-et"><b>A</b>Lo que usa la persona<span>Las cinco pestañas de abajo y el perfil (tu avatar, arriba). La barra de color dice cuánto de cada pestaña ya anda.</span></div>
<div class="mx-a">{"".join(cols)}</div></div>
<div class="mx-bc">
<div class="mx-nivel"><div class="mx-et"><b>B</b>Lo que la hace andar<span>Sistemas que comparten todas las pestañas</span></div><div class="mx-b">{tarjetas("B")}</div></div>
<div class="mx-nivel"><div class="mx-et"><b>C</b>Lo que la sostiene<span>Operación, negocio, legal y lanzamiento</span></div><div class="mx-c">{tarjetas("C")}</div></div>
</div>
<div class="mx-con"><div class="mx-con-t">Cómo se conecta todo</div><div class="mx-con-l">{con}</div></div>
<div class="mx-con"><div class="mx-con-t">Cuándo llega</div><div class="mx-cb">{cuando}</div></div>
</section>"""


# ─────────────────────────────── Senda Fiesta: el tablero del Éxodo ───────────────────────────────
TIPOS = {
    "talento": ("Talento +3", "#F5A524", "talento"),
    "desierto": ("Desierto −3", "#C98A3E", None),
    "pregunta": ("Pregunta", "#2a78d6", None),
    "historia": ("Historia", "#7a4fd0", "biblia"),
    "samaritano": ("Buen samaritano (dar)", "#1baf7a", "vida"),
    "vina": ("Viña (paga más al último)", "#9c3d8a", None),
    "tormenta": ("Tormenta", "#52514e", "rayo"),
}
SECUENCIA = ["talento", "pregunta", "talento", "historia", "desierto", "talento", "samaritano", "pregunta", "tormenta", "talento",
             "historia", "vina", "pregunta", "talento", "desierto", "historia", "talento", "pregunta", "samaritano", "talento",
             "tormenta", "historia", "pregunta", "talento", "vina", "desierto", "talento", "pregunta"]


def _catmull(pts, n):
    """n puntos equiespaciados (aprox.) sobre una curva Catmull-Rom que pasa por pts."""
    dens = []
    for i in range(len(pts) - 1):
        p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[i + 1], pts[min(i + 2, len(pts) - 1)]
        for k in range(40):
            t = k / 40
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            dens.append((x, y))
    dens.append(pts[-1])
    largo = [0.0]
    for a, b in zip(dens, dens[1:]):
        largo.append(largo[-1] + math.dist(a, b))
    out, j = [], 0
    for k in range(n):
        objetivo = largo[-1] * k / (n - 1)
        while j < len(largo) - 2 and largo[j + 1] < objetivo:
            j += 1
        out.append(dens[j])
    return out, dens


def fiesta_tablero() -> str:
    W, H = 680, 300
    camino = [(48, 150), (92, 214), (150, 262), (232, 268), (298, 222), (330, 152), (382, 96), (452, 78), (512, 122), (536, 196), (590, 236), (634, 178), (636, 112)]
    casillas, denso = _catmull(camino, len(SECUENCIA) + 2)
    trazo = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in denso)
    partes = [f"""<svg viewBox="0 0 {W} {H}" class="ft-svg" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ftArena" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E6C4"/><stop offset="1" stop-color="#EBCB92"/></linearGradient>
<linearGradient id="ftMar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2F6FD6"/><stop offset="1" stop-color="#5BB4F0"/></linearGradient>
<linearGradient id="ftMonte" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9C6B4A"/><stop offset="1" stop-color="#6E4630"/></linearGradient></defs>
<rect width="{W}" height="{H}" rx="14" fill="url(#ftArena)"/>
<path d="M150 0 C170 60 160 120 196 176 C206 196 232 200 252 176 C278 130 262 60 280 0 Z" fill="url(#ftMar)" opacity=".92"/>
<path d="M170 30 q12 -5 24 0 M176 70 q12 -5 24 0 M188 112 q12 -5 24 0 M214 150 q12 -5 24 0" stroke="#CFE9FF" stroke-width="2" fill="none" opacity=".8"/>
<path d="M14 120 l20 -34 l20 34 z M42 120 l14 -24 l14 24 z" fill="#D8A85F" stroke="#B4823B" stroke-width="1.2"/>
<path d="M580 96 l56 -84 l40 84 z" fill="url(#ftMonte)"/><path d="M620 40 l16 -28 l12 26 q-14 -6 -28 2z" fill="#fff" opacity=".85"/>
<g fill="#4E8F4A" opacity=".75"><circle cx="452" cy="44" r="7"/><circle cx="466" cy="40" r="6"/><circle cx="440" cy="40" r="5"/><rect x="451" y="44" width="2.4" height="12" fill="#7A5A2E"/></g>
<path d="{trazo}" stroke="#fff" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
"""]
    # el atajo: del borde del mar Rojo al otro lado, cruzando el agua
    a, b = casillas[3], casillas[10]
    cx_, cy_ = (a[0] + b[0]) / 2, min(a[1], b[1]) - 70
    partes.append(f'<path d="M{a[0]:.1f},{a[1]:.1f} Q{cx_:.1f},{cy_:.1f} {b[0]:.1f},{b[1]:.1f}" stroke="#fff" stroke-width="3" stroke-dasharray="5 5" fill="none"/>')
    partes.append(f'<text x="{cx_:.1f}" y="{(a[1] + cy_) / 2 + 2:.1f}" text-anchor="middle" class="ft-t ft-halo-a" fill="#fff">Atajo: el mar se abre cada 3 rondas</text>')
    nombres = {0: "Egipto", 4: "Mar Rojo", 11: "Mara", 16: "Elim", 19: "Desierto de Sin: maná", 24: "Refidim: agua de la roca"}

    def lugar(i):
        """Dónde poner el nombre de la casilla i: del lado de la curva más lejos de las otras casillas."""
        x, y = casillas[i]
        p0, p1 = casillas[max(i - 1, 0)], casillas[min(i + 1, len(casillas) - 1)]
        tx, ty = p1[0] - p0[0], p1[1] - p0[1]
        nn = math.hypot(tx, ty) or 1
        nx_, ny_ = -ty / nn, tx / nn
        mejor = None
        for sg in (1, -1):
            for dist in (22, 30):
                px, py = x + sg * nx_ * dist, y + sg * ny_ * dist
                libre = min(math.dist((px, py), c) for j, c in enumerate(casillas) if j != i)
                if mejor is None or libre > mejor[0]:
                    mejor = (libre, px, py)
        return mejor[1], mejor[2]
    for i, (x, y) in enumerate(casillas):
        if i == 0:
            partes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="13" fill="#17151F"/><text x="{x:.1f}" y="{y + 3:.1f}" text-anchor="middle" class="ft-n" fill="#fff">SALIDA</text>')
            continue
        if i == len(casillas) - 1:
            partes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="13" fill="#F5A524" stroke="#fff" stroke-width="2"/><text x="{x:.1f}" y="{y + 3:.1f}" text-anchor="middle" class="ft-n" fill="#17151F">SINAÍ</text>')
            continue
        tipo = SECUENCIA[(i - 1) % len(SECUENCIA)]
        _, c, ico = TIPOS[tipo]
        partes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="{c}" stroke="#fff" stroke-width="2"/>')
        if tipo == "pregunta":
            partes.append(f'<text x="{x:.1f}" y="{y + 3.4:.1f}" text-anchor="middle" class="ft-q" fill="#fff">?</text>')
        elif tipo == "desierto":
            partes.append(f'<text x="{x:.1f}" y="{y + 3:.1f}" text-anchor="middle" class="ft-q" fill="#fff" style="font-size:9px">−3</text>')
        elif tipo == "vina":
            partes.append(f'<g fill="#fff"><circle cx="{x - 2:.1f}" cy="{y - 1.5:.1f}" r="1.9"/><circle cx="{x + 2:.1f}" cy="{y - 1.5:.1f}" r="1.9"/><circle cx="{x:.1f}" cy="{y + 1.8:.1f}" r="1.9"/></g>')
        elif ico:
            partes.append(f'<g transform="translate({x - 5:.1f} {y - 5:.1f})">{V.icono(ico, 10, "#fff")}</g>')
        if i in nombres:
            lx, ly = lugar(i)
            partes.append(f'<text x="{lx:.1f}" y="{ly + 3:.1f}" text-anchor="middle" class="ft-t ft-halo" fill="#4a2f12">{nombres[i]}</text>')
    # la nube con la corona, sobre una casilla
    nx, ny = casillas[14]
    partes.append(f"""<g transform="translate({nx:.1f} {ny - 52:.1f})"><path d="M-26 8 q-10 0 -10 -9 q0 -9 10 -9 q2 -12 16 -12 q10 0 14 8 q4 -4 10 -4 q12 0 12 12 q8 1 8 8 q0 6 -8 6 z" fill="#fff" stroke="#c9c2b0" stroke-width="1.2"/>
<g transform="translate(-7 -14)">{V.icono("corona", 14, "#D9860F")}</g><path d="M0 10 v30" stroke="#fff" stroke-width="2.4" stroke-dasharray="2 3"/></g>
<text x="{nx - 40:.1f}" y="{ny - 58:.1f}" text-anchor="end" class="ft-t ft-halo" fill="#4a2f12">La nube: la corona está acá</text>""")
    # cuatro jugadores
    for k, (cx, cy) in enumerate([casillas[3], casillas[7], casillas[7], casillas[21]]):
        col = ["#E5484D", "#3A2A8C", "#17B3D1", "#2FBF71"][k]
        off = (k - 1.5) * 7 if k in (1, 2) else 0
        partes.append(f'<g transform="translate({cx + off:.1f} {cy - 17:.1f})"><circle r="5.2" fill="{col}" stroke="#fff" stroke-width="1.6"/><path d="M-3 4 L0 10 L3 4z" fill="{col}"/></g>')
    partes.append("</svg>")
    ley = "".join(f'<span><i style="background:{c}"></i>{esc(n)}</span>' for n, c, _ in TIPOS.values())
    ley += '<span><i style="background:#fff;border:1px solid #c9c2b0"></i>La nube (la corona se gana sabiendo)</span>'
    return f'<div class="ft">{"".join(partes)}<div class="ft-ley">{ley}</div><p class="nota">Boceto del primer tablero: el Éxodo, de Egipto al Sinaí. Los cuatro marcadores son los jugadores. Arte final con el estilo de Senda.</p></div>'


# ─────────────────────────────── Lani en 3D ───────────────────────────────
def lani3d_bloque() -> str:
    import base64
    graf = RAIZ / "informes" / "fuente-senda" / "graficos"
    fotos = [("lani3d_reposo.png", "Reposo: respira, parpadea y mira alrededor"), ("lani3d_baile.png", "El baile: groove al pulso y chasquidos"),
             ("lani3d_cielo.png", "El gesto propio: señala al cielo"), ("lani3d_aplauso.png", "Aplausos en el 2 y el 4"), ("lani3d_pose.png", "La pose del remate")]
    celdas = []
    for f, t in fotos:
        p = graf / f
        if not p.exists():
            continue
        datos = base64.b64encode(p.read_bytes()).decode("ascii")
        celdas.append(f'<figure><img src="data:image/png;base64,{datos}" alt=""><figcaption>{esc(t)}</figcaption></figure>')
    return f'<div class="l3d">{"".join(celdas)}</div>'


# ─────────────────────────────── el desarrollo hasta hoy ───────────────────────────────
PRUEBAS = [
    ("05-10", "Vista previa", "Sprint 0: base, Lani, Inicio, Biblia, Travesía y Espadeo de práctica"),
    ("05-10", "Prueba 2", "Primer APK: hoja que se dobla, marcar versículos, Consola v0"),
    ("05-10", "Pruebas 3 y 4", "Biblia como impresa, sonidos elegidos, trivia con dificultad, planes, Supabase listo"),
    ("06-10", "Prueba 5", "Lector sin trabas, firma sonora propia, calendario con avisos, métricas reales"),
    ("06-10", "Prueba 6", "Hoja en el hilo nativo, audio con instrumentos reales, Travesía MECE, Pablo, escala"),
    ("06-10", "Prueba 7", "Marcar al instante, la fiesta, Lámparas, repaso, tipos nuevos, costos y duelos"),
    ("11-10", "Prueba 8", "Lani en 3D, baile sin saltitos, bienvenida con edad y objetivo, mapa de toda la app"),
]


def estado_bloque() -> str:
    e = yaml.safe_load((DIR / "estado.yaml").read_text(encoding="utf-8"))
    total = sum(a["peso"] for a in e["areas"])
    avance = sum(a["peso"] * a["avance"] for a in e["areas"]) / total
    filas = []
    for a in e["areas"]:
        hecho = "".join(f"<li>{esc(h)}</li>" for h in a["hecho"][:3])
        filas.append(f'<div class="ea"><div class="ea-n"><b>{esc(a["nombre"])}</b><span>peso {a["peso"]}%</span></div>'
                     f'<div class="ea-b"><i style="width:{a["avance"]}%"></i><em>{a["avance"]}%</em></div><ul>{hecho}</ul>'
                     f'<div class="ea-s">Sigue: {esc(a["siguiente"])}</div></div>')
    pr = "".join(f'<div class="pr"><div class="pr-f">{f}</div><b>{esc(n)}</b><span>{esc(t)}</span></div>' for f, n, t in PRUEBAS)
    return f"""<div class="dsr"><div class="dsr-tot"><div class="dsr-num">{avance:.0f}%</div><div>del alcance del lanzamiento (18-12-2026), ponderado por área.
ESTIMACIÓN de Claude con un criterio fijo: cuenta solo lo que funciona en la app de prueba y pasó por la vista previa (versión {esc(e["version_app"])}).</div></div>
<div class="prs">{pr}</div><div class="eas">{"".join(filas)}</div></div>"""
