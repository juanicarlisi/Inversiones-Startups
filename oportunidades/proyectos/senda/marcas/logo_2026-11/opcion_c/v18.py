# Opción 3: la senda se pierde en el horizonte (termina en punta, como un camino visto de lejos) y la cruz está justo encima, en la luz.
import sys, math; sys.path.insert(0,'.')
from v17 import discos
S=1024
def logo(nombre, END=(512,452), w0=300, w1=4, pot=1.25, G=48, ARM=56, STUB=56, BAJO=1.75, gap=26,
         fondo=('#0C0A2A','#231A66'), camino=('#6A3BFF','#C2379E','#FF6A4A','#FFB648','#FFE6A6'), cruz='#FFF1C9',
         halo=True, mono=False, segs=None, escala=1.0):
    segs=segs or [((30,1090),(520,1040),(905,930),(732,790)),((732,790),(566,662),(214,712),(296,572)),((296,572),(340,492),(END[0]-40,486),END)]
    circ=discos(segs,w0,w1,pot,1.5)
    pie=END[1]-gap; alto=STUB+G+BAJO*STUB; top=pie-alto; barc=top+STUB+G/2; cx=END[0]
    cr=lambda f: (f'<g fill="{f}"><rect x="{cx-G/2}" y="{top:.1f}" width="{G}" height="{alto:.1f}" rx="{G*0.12:.1f}"/>'
                  f'<rect x="{cx-G/2-ARM}" y="{barc-G/2:.1f}" width="{G+2*ARM}" height="{G}" rx="{G*0.12:.1f}"/></g>')
    tr=f'translate({512-512*escala:.1f},{512-512*escala:.1f}) scale({escala})' if escala!=1 else ''
    if mono:
        open(nombre+'.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><g transform="{tr}"><g fill="#000">{circ}</g>{cr("#000")}</g></svg>'); return
    stops=''.join(f'<stop offset="{i/(len(camino)-1):.2f}" stop-color="{c}"/>' for i,c in enumerate(camino))
    defs=(f'<linearGradient id="fondo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{fondo[0]}"/><stop offset="1" stop-color="{fondo[1]}"/></linearGradient>'
          f'<linearGradient id="cam" gradientUnits="userSpaceOnUse" x1="0" y1="1024" x2="0" y2="{END[1]}">{stops}</linearGradient>'
          f'<radialGradient id="luz" cx="{cx}" cy="{barc:.0f}" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A4A" stop-opacity=".55"/><stop offset=".45" stop-color="#E0389A" stop-opacity=".18"/><stop offset="1" stop-color="#E0389A" stop-opacity="0"/></radialGradient>')
    h=(f'<rect width="1024" height="1024" fill="url(#luz)"/>' if halo else '')
    body=f'<rect width="1024" height="1024" fill="url(#fondo)"/>{h}<g transform="{tr}"><g fill="url(#cam)">{circ}</g>{cr(cruz)}</g>'
    open(nombre+'.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><defs>{defs}</defs>{body}</svg>')
if __name__=='__main__':
    logo('W1'); logo('W1_mono',mono=True)
    logo('W2',halo=False)
    logo('W3',w0=330,w1=10,G=54,ARM=62,STUB=62,gap=22)
