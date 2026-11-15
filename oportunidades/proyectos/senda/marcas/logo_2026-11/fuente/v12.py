# Versión 12: la senda se dibuja como unión de discos a lo largo de la curva (borde siempre suave, sin picos),
# con menos estrechamiento; termina en el pie de una cruz latina de proporciones clásicas.
import sys, math; sys.path.insert(0,'.')
from geo import muestras, largo
S=1024
PALETAS={
 'amanecer':('<stop offset="0" stop-color="#2A1A8C"/><stop offset=".5" stop-color="#7A2BE0"/><stop offset=".8" stop-color="#E0389A"/><stop offset="1" stop-color="#FF5A64"/>','#24127A'),
 'luz':('<stop offset="0" stop-color="#2F5BFF"/><stop offset="1" stop-color="#7A2CFF"/>','#1B0F6B'),
 'indigo':('<stop offset="0" stop-color="#2A1A8C"/><stop offset="1" stop-color="#6A2BE8"/>','#140A4F'),
 'aurora':('<stop offset="0" stop-color="#1E1470"/><stop offset=".55" stop-color="#5B2BE0"/><stop offset="1" stop-color="#FF7A59"/>','#1A0E5C'),
}
def T(p,k=0.92,ox=512,oy=1024,dx=0):
    return (ox+(p[0]-ox)*k+dx, oy+(p[1]-oy)*k)
def curva(CX,FOOT,k=0.92):
    base=[((300,1100),(830,1040),(872,705),(538,642)),((538,642),(185,575),(205,385),(420,380))]
    b=[tuple(T(p,k) for p in s) for s in base]
    a=b[-1][-1]                       # final del rulo de arriba (yendo a la derecha)
    turn=(a,(a[0]+95,a[1]-2),(CX,a[1]-30),(CX,a[1]-90))
    neck=((CX,a[1]-90),(CX,a[1]-100),(CX,FOOT+10),(CX,FOOT))
    return b+[turn,neck]
def discos(segs,w0,w1,pot,paso=2.0):
    pts=muestras(segs,400); L=largo(pts); tot=L[-1]; out=[]; ult=-99
    for p,l in zip(pts,L):
        if l-ult<paso and l<tot: continue
        ult=l; t=l/tot; w=(w1+(w0-w1)*(1-t)**pot)/2
        out.append((p[0],p[1],w))
    return out
def logo(nombre,paleta='amanecer',CX=548,FOOT=392,G=64,ARM=78,STUB=78,BAJO=1.9,w0=340,w1=104,pot=0.7,halo=210,mono=False,
         escala=1.0,centro=(512,512),k=0.92,sombra=True,extender=False,gap=0):
    cielo,somb=PALETAS[paleta]
    segs=curva(CX,FOOT,k)
    if extender:   # para la versión adaptable: el camino sigue hacia abajo fuera del círculo
        p0=segs[0][0]; segs=[((p0[0]-260,p0[1]+340),(p0[0]-170,p0[1]+220),(p0[0]-80,p0[1]+90),p0)]+segs
    D=discos(segs,w0,w1,pot)
    circ=''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}"/>' for x,y,r in D)
    PIE=FOOT-gap
    barc=PIE-BAJO*STUB-G/2; top=barc-G/2-STUB; r=G*0.10
    cruz=lambda f,ex='': (f'<g fill="{f}" {ex}><rect x="{CX-G/2}" y="{top:.1f}" width="{G}" height="{PIE-top+(6 if gap==0 else 0):.1f}" rx="{r}"/>'
                          f'<rect x="{CX-G/2-ARM}" y="{barc-G/2:.1f}" width="{G+2*ARM}" height="{G}" rx="{r}"/></g>')
    tr=f'translate({512-centro[0]*escala:.1f},{512-centro[1]*escala:.1f}) scale({escala})' if escala!=1 else ''
    if mono:
        body=f'<g transform="{tr}"><g fill="#000">{circ}</g>{cruz("#000")}</g>'
        open(nombre+'.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">{body}</svg>'); return
    defs=(f'<linearGradient id="cielo" x1="0" y1="0" x2="0.25" y2="1">{cielo}</linearGradient>'
          '<radialGradient id="halo"><stop offset="0" stop-color="#FFF1B8" stop-opacity=".9"/><stop offset=".45" stop-color="#FFE08A" stop-opacity=".32"/><stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></radialGradient>'
          f'<linearGradient id="cam" gradientUnits="userSpaceOnUse" x1="0" y1="1024" x2="0" y2="{FOOT+70}"><stop offset="0" stop-color="#FFBE2E"/><stop offset=".5" stop-color="#FFE39A"/><stop offset=".86" stop-color="#FFF6DE"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>'
          '<filter id="bl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>'
          '<filter id="bl2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>')
    body=(f'<rect width="1024" height="1024" fill="url(#cielo)"/><g transform="{tr}">'
          f'<circle cx="{CX}" cy="{barc:.1f}" r="{halo}" fill="url(#halo)"/>'
          + (f'<g fill="{somb}" opacity=".45" filter="url(#bl)" transform="translate(0,14)">{circ}</g>' if sombra else '')
          + cruz('#FFE9A8','filter="url(#bl2)" opacity=".85"')
          + f'<g fill="url(#cam)">{circ}</g>' + cruz('#FFFFFF') + '</g>')
    open(nombre+'.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><defs>{defs}</defs>{body}</svg>')
if __name__=='__main__':
    for n,kw in [('Q1',{}),('Q2',dict(w1=84,pot=0.8)),('Q3',dict(paleta='aurora'))]:
        logo(n,**kw); logo(n+'_mono',mono=True,**kw)
