"""Dibuja el ícono de Telar en SVG (src/iconos/telar.svg y telar-maskable.svg).

Una trama simple: tres hilos verticales claros (la urdimbre: el tiempo) y tres hilos de color escalonados, como las
barras de un cronograma (la trama: tus proyectos), que pasan por arriba y por abajo alternando. Todo dentro de la zona
segura de los íconos adaptables (círculo del 80 % del lado). Uso: python3 herramientas/icono_svg.py
"""
import math, pathlib

FONDO = '#4a3cc0'
URD = '#f1edff'
GROSOR_URD, GROSOR_TRAMA, AIRE = 22, 54, 8
URDIMBRE = [160, 256, 352]
Y0, Y1 = 112, 400
TRAMA = [(178, 104, 290, '#ff8a65'), (256, 216, 408, '#ffcf5c'), (334, 132, 300, '#4fd8c4')]

def cuerpo():
    p = []
    for x in URDIMBRE:
        p.append(f'<line x1="{x}" y1="{Y0}" x2="{x}" y2="{Y1}" stroke="{URD}" stroke-width="{GROSOR_URD}" stroke-linecap="round"/>')
    for y, x1, x2, c in TRAMA:
        p.append(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{FONDO}" stroke-width="{GROSOR_TRAMA + 2 * AIRE}" stroke-linecap="round"/>')
        p.append(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{c}" stroke-width="{GROSOR_TRAMA}" stroke-linecap="round"/>')
    medio = GROSOR_TRAMA / 2 + AIRE
    for i, (y, x1, x2, c) in enumerate(TRAMA):
        for j, x in enumerate(URDIMBRE):
            if not (x1 < x < x2):
                continue
            if (i + j) % 2 == 1:  # acá la urdimbre pasa por arriba
                p.append(f'<line x1="{x}" y1="{y - medio}" x2="{x}" y2="{y + medio}" stroke="{FONDO}" stroke-width="{GROSOR_URD + 2 * AIRE}"/>')
                p.append(f'<line x1="{x}" y1="{y - medio - 1}" x2="{x}" y2="{y + medio + 1}" stroke="{URD}" stroke-width="{GROSOR_URD}"/>')
    return '\n  '.join(p)

def verificar():
    # Que nada salga de la zona segura (radio 0,4 × 512 = 204,8 alrededor del centro).
    pts = [(x, Y0 - GROSOR_URD / 2) for x in URDIMBRE] + [(x, Y1 + GROSOR_URD / 2) for x in URDIMBRE]
    for y, x1, x2, _ in TRAMA:
        r = GROSOR_TRAMA / 2
        for x in (x1, x2):
            for a in range(0, 360, 10):
                pts.append((x + r * math.cos(math.radians(a)), y + r * math.sin(math.radians(a))))
    peor = max(math.hypot(x - 256, y - 256) for x, y in pts)
    assert peor <= 204.8, f'se sale de la zona segura: {peor:.1f}'
    # Que ninguna punta de trama quede pegada a un hilo que no cruza.
    for y, x1, x2, _ in TRAMA:
        for x in URDIMBRE:
            if not (x1 < x < x2):
                d = min(abs(x - x1), abs(x - x2)) - GROSOR_TRAMA / 2 - GROSOR_URD / 2
                assert d >= 12, f'punta pegada a un hilo (y={y}, x={x}): {d}'
    return peor

peor = verificar()
d = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'iconos'
cab = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
(d / 'telar.svg').write_text(f'{cab}\n  <title>Telar</title>\n  <rect width="512" height="512" rx="116" fill="{FONDO}"/>\n  {cuerpo()}\n</svg>\n')
(d / 'telar-maskable.svg').write_text(f'{cab}\n  <title>Telar</title>\n  <rect width="512" height="512" fill="{FONDO}"/>\n  {cuerpo()}\n</svg>\n')
print(f'ícono listo; punto más lejano a {peor:.1f} px del centro (zona segura: 204,8)')
