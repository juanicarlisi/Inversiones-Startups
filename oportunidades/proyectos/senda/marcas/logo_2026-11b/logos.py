#!/usr/bin/env python3
"""Tres opciones de logo para Senda (prueba 54, pedido del fundador: «la actual la siento muy IA»; «fuerte identidad de marca,
un buen logo para app»). Planos, con los colores de la app (noche, ámbar, oro, crema), sin degradés ni resplandores. Lienzo 1024.
Descartadas al mirarlas a tamaño de ícono: la lámpara de aceite (se leía como la de Aladino y, después, como una sartén) y la puerta
en arco con la cruz (se leía como una lápida)."""
NOCHE, AMBAR, AMBAR_OSC, ORO, CREMA, VIOLETA = "#1C1446", "#F5A524", "#D9860F", "#FFC857", "#FFF3D6", "#2E2170"

def svg(cuerpo, fondo):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="{fondo}"/>{cuerpo}</svg>'

def cruz(cx, cy, alto, grosor, color):
    brazo = alto * 0.62
    return (f'<rect x="{cx-grosor/2}" y="{cy-alto/2}" width="{grosor}" height="{alto}" rx="{grosor/2}" fill="{color}"/>'
            f'<rect x="{cx-brazo/2}" y="{cy-alto/2+alto*0.22}" width="{brazo}" height="{grosor}" rx="{grosor/2}" fill="{color}"/>')

# A. La S de camino: la S es una ruta maciza con su línea del medio; arriba, la cruz a la que lleva (separada de la S).
S = "M642 297 A150 150 0 1 0 512 522 A150 150 0 1 1 382 747"
def camino(fondo=AMBAR, ruta=NOCHE, linea=CREMA, meta="cruz"):
    fin = cruz(758, 190, 150, 44, CREMA) if meta == "cruz" else f'<circle cx="752" cy="196" r="56" fill="{CREMA}"/>'
    return svg(f'''
<g transform="translate(-24 44)">
  <path d="{S}" fill="none" stroke="{ruta}" stroke-width="172" stroke-linecap="round"/>
  <path d="{S}" fill="none" stroke="{linea}" stroke-width="16" stroke-linecap="round" stroke-dasharray="40 38"/>
  {fin}
</g>''', fondo)

# B. El libro que se hace camino: la Biblia abierta; del medio sale la senda hacia la luz (Salmo 119:105).
def libro(fondo=NOCHE, tapa=AMBAR, hojas=CREMA, renglon="#E8D9B5", senda=ORO, luz=CREMA, colina=VIOLETA, colina2="#3B2C86"):
    izq = "M512 560 C440 520 330 508 214 524 L214 806 C330 790 440 802 512 842 Z"
    der = "M512 560 C584 520 694 508 810 524 L810 806 C694 790 584 802 512 842 Z"
    renglones = "".join(
        f'<path d="M{252 if lado<0 else 560} {600+k*52} C{330 if lado<0 else 640} {588+k*52} {400 if lado<0 else 710} {592+k*52} {464 if lado<0 else 772} {612+k*52}" '
        f'fill="none" stroke="{renglon}" stroke-width="14" stroke-linecap="round" transform="{"" if lado<0 else ""}"/>'
        for lado in (-1, 1) for k in range(4))
    return svg(f'''
<path d="M512 590 C430 548 320 536 188 552 L188 846 C320 830 430 842 512 884 C594 842 704 830 836 846 L836 552 C704 536 594 548 512 590 Z" fill="{tapa}"/>
<path d="{izq}" fill="{hojas}"/><path d="{der}" fill="{hojas}"/>
{renglones}
<path d="M150 470 C260 410 360 396 470 420 C560 440 650 380 874 430 L874 600 L150 600 Z" fill="{colina}"/>
<path d="M150 520 C300 470 420 488 512 500 C640 516 740 470 874 486 L874 600 L150 600 Z" fill="{colina2}"/>
<path d="M404 590 C452 520 528 470 516 412 L534 412 C560 470 560 520 620 590 Z" fill="{senda}"/>
<path d="M512 584 C498 530 540 480 525 420" fill="none" stroke="{fondo}" stroke-width="9" stroke-linecap="round" stroke-dasharray="22 18"/>
{cruz(525, 312, 120, 36, luz)}''', fondo)

# C. Lany: la cara de la mascota (cara canela, lana clara, ojos grandes), como el búho de Duolingo. Lany no habla: boca chica.
def lany(fondo=AMBAR):
    CARA, HOCICO, OREJA, OREJA_IN, OJO, LANA, LANA_S = "#8B5A3C", "#B07A55", "#6E452C", "#C98B6B", "#231D38", "#FFF6E6", "#E9D9BD"
    lana = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{LANA}"/>' for x, y, r in [(400, 300, 74), (512, 262, 92), (626, 300, 74), (456, 336, 70), (572, 336, 70)])
    return svg(f'''
<ellipse cx="236" cy="500" rx="118" ry="54" transform="rotate(-18 236 500)" fill="{OREJA}"/>
<ellipse cx="248" cy="498" rx="74" ry="28" transform="rotate(-18 248 498)" fill="{OREJA_IN}"/>
<ellipse cx="788" cy="500" rx="118" ry="54" transform="rotate(18 788 500)" fill="{OREJA}"/>
<ellipse cx="776" cy="498" rx="74" ry="28" transform="rotate(18 776 498)" fill="{OREJA_IN}"/>
<path d="M512 330 C676 330 762 440 762 590 C762 760 650 860 512 860 C374 860 262 760 262 590 C262 440 348 330 512 330 Z" fill="{CARA}"/>
<ellipse cx="512" cy="712" rx="168" ry="118" fill="{HOCICO}"/>
{lana}
<ellipse cx="424" cy="560" rx="58" ry="70" fill="{OJO}"/><ellipse cx="600" cy="560" rx="58" ry="70" fill="{OJO}"/>
<circle cx="444" cy="534" r="20" fill="#fff"/><circle cx="620" cy="534" r="20" fill="#fff"/>
<path d="M370 462 Q420 436 466 458" fill="none" stroke="{LANA}" stroke-width="22" stroke-linecap="round"/>
<path d="M558 458 Q604 436 654 462" fill="none" stroke="{LANA}" stroke-width="22" stroke-linecap="round"/>
<path d="M486 664 C496 652 528 652 538 664 C540 680 524 692 512 692 C500 692 484 680 486 664 Z" fill="{OJO}"/>
<path d="M470 740 Q512 770 554 740" fill="none" stroke="{OJO}" stroke-width="16" stroke-linecap="round"/>''', fondo)

if __name__ == "__main__":
    for n, f in [("A_camino", camino), ("A_camino_punto", lambda: camino(meta="punto")), ("B_libro", libro), ("C_lany", lany),
                 ("C_lany_noche", lambda: lany(NOCHE))]:
        open(f"{n}.svg", "w").write(f())
    print("ok")

# B2. El libro y el alba: la Biblia abierta, el sol que sale detrás y la senda que entra en la luz.
def libro_alba(fondo=NOCHE, tapa=AMBAR, hojas=CREMA, renglon="#E8D9B5", sol=ORO, senda=CREMA):
    izq = "M512 600 C440 560 330 548 214 564 L214 846 C330 830 440 842 512 882 Z"
    der = "M512 600 C584 560 694 548 810 564 L810 846 C694 830 584 842 512 882 Z"
    renglones = "".join(
        f'<path d="M{252 if lado<0 else 560} {640+k*52} C{330 if lado<0 else 640} {628+k*52} {400 if lado<0 else 710} {632+k*52} {464 if lado<0 else 772} {652+k*52}" fill="none" stroke="{renglon}" stroke-width="14" stroke-linecap="round"/>'
        for lado in (-1, 1) for k in range(4))
    return svg(f'''
<clipPath id="arriba"><rect x="0" y="0" width="1024" height="612"/></clipPath>
<circle cx="512" cy="612" r="300" fill="{sol}" clip-path="url(#arriba)"/>
<path d="M452 612 L572 612 L522 330 L502 330 Z" fill="{senda}"/>
<path d="M512 630 C430 588 320 576 188 592 L188 886 C320 870 430 882 512 924 C594 882 704 870 836 886 L836 592 C704 576 594 588 512 630 Z" fill="{tapa}"/>
<path d="{izq}" fill="{hojas}"/><path d="{der}" fill="{hojas}"/>
{renglones}''', fondo)

# B3. La puerta abierta (sin cruz, para que no se lea como lápida): la luz sale de la puerta y se hace camino en S.
def puerta_camino(fondo=NOCHE, marco=AMBAR, luz=CREMA, umbral=AMBAR_OSC):
    return svg(f'''
<path d="M296 650 V372 A216 216 0 0 1 728 372 V650 Z" fill="{marco}"/>
<path d="M340 650 V378 A172 172 0 0 1 684 378 V650 Z" fill="{luz}"/>
<path d="M436 650 C404 730 300 770 324 856 C340 916 300 978 246 1024 L716 1024 C736 972 712 920 678 872 C628 800 604 724 590 650 Z" fill="{luz}"/>
<rect x="280" y="636" width="464" height="30" rx="15" fill="{umbral}"/>''', fondo)
