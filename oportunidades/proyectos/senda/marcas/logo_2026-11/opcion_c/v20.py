# Variantes de la opción C («Camino en la noche»): la S y la cruz siempre separadas.
import sys, math; sys.path.insert(0,'.')
from geo import muestras, largo
S=1024
PAL={
 'alba':     (('#0C0A2A','#231A66'),('#6A3BFF','#C2379E','#FF6A4A','#FFB648','#FFE6A6'),'#FFF1C9',('#FF9A4A','#E0389A')),
 'brasa':    (('#120A26','#3A1450'),('#B0278F','#E8475A','#FF7A3D','#FFB13B','#FFE3A0'),'#FFF0C4',('#FF8A3D','#E8475A')),
 'oceano':   (('#08102E','#18276B'),('#3B5BFF','#8A4BEA','#E8559A','#FFB060','#FFE9B0'),'#FFF4D6',('#FFB060','#8A4BEA')),
 'violeta':  (('#1A0F4A','#3A1E8C'),('#7B4BFF','#D040A8','#FF6A55','#FFBE55','#FFEBB2'),'#FFF4D2',('#FFA04A','#D040A8')),
 'oro':      (('#0C0A2A','#231A66'),('#6A3BFF','#C2379E','#FF6A4A','#FFB648','#FFE6A6'),'#FFC94A',('#FFB648','#E0389A')),
}
def seg_a(E): return [((30,1090),(520,1040),(905,930),(732,790)),((732,790),(560,654),(176,700),(250,546)),((250,546),(300,452),(E[0]-60,476),E)]
def seg_b(E): return [((30,1090),(520,1040),(905,930),(732,790)),((732,790),(560,654),(176,700),(250,546)),((250,546),(300,440),(E[0],520),E)]
def seg_c(E): return [((10,1080),(520,1050),(930,930),(744,776)),((744,776),(560,626),(150,676),(236,512)),((236,512),(290,410),(E[0]-60,440),E)]
GEOS={'a':(seg_a,(520,446)),'b':(seg_b,(512,448)),'c':(seg_c,(520,404))}
def puntos(segs,w0,w1,pot):
    pts=muestras(segs,500); L=largo(pts); tot=L[-1]
    return [(p,(w1+(w0-w1)*(1-l/tot)**pot)/2,l/tot) for p,l in zip(pts,L)]
def discos(P,paso=1.6):
    out=[];ult=None
    for p,w,t in P:
        if ult and math.dist(p,ult)<paso and t<1: continue
        ult=p; out.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="{w:.1f}"/>')
    return ''.join(out)
def logo(nombre,geo='a',pal='alba',w0=360,w1=6,pot=0.75,G=54,ARM=62,STUB=62,BAJO=1.75,gap=26,halo=True,
         horizonte=False,lineas=False,borde=False,mono=False,cruz_alto=0,espesor=False,brillo=False):
    f,E=GEOS[geo]; segs=f(E)
    fondo,cam,cruzc,luz=PAL[pal]
    P=puntos(segs,w0,w1,pot); circ=discos(P)
    pie=E[1]-gap-cruz_alto; alto=STUB+G+BAJO*STUB; top=pie-alto; barc=top+STUB+G/2; cx=E[0]
    cr=lambda c: (f'<g fill="{c}"><rect x="{cx-G/2}" y="{top:.1f}" width="{G}" height="{alto:.1f}" rx="{G*0.12:.1f}"/>'
                  f'<rect x="{cx-G/2-ARM}" y="{barc-G/2:.1f}" width="{G+2*ARM}" height="{G}" rx="{G*0.12:.1f}"/></g>')
    if mono:
        open(nombre+'.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><g fill="#000">{circ}</g>{cr("#000")}</svg>'); return
    stops=''.join(f'<stop offset="{i/(len(cam)-1):.2f}" stop-color="{c}"/>' for i,c in enumerate(cam))
    defs=(f'<linearGradient id="fondo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{fondo[0]}"/><stop offset="1" stop-color="{fondo[1]}"/></linearGradient>'
          f'<linearGradient id="cam" gradientUnits="userSpaceOnUse" x1="0" y1="1024" x2="0" y2="{E[1]}">{stops}</linearGradient>'
          f'<radialGradient id="luz" cx="{cx}" cy="{barc:.0f}" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{luz[0]}" stop-opacity=".55"/><stop offset=".45" stop-color="{luz[1]}" stop-opacity=".18"/><stop offset="1" stop-color="{luz[1]}" stop-opacity="0"/></radialGradient>'
          f'<linearGradient id="hor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{luz[0]}" stop-opacity="0"/><stop offset=".5" stop-color="{luz[0]}" stop-opacity=".75"/><stop offset="1" stop-color="{luz[0]}" stop-opacity="0"/></linearGradient>')
    extra=''
    if horizonte:
        extra+=f'<rect x="150" y="{E[1]+4}" width="724" height="5" rx="2.5" fill="url(#hor)"/>'
    capa=''
    if borde:   # una franja más clara del lado de la luz (da volumen sin brillos)
        cl=[]
        for i,(p,w,t) in enumerate(P[::3]):
            j=min(i*3+1,len(P)-1); q=P[j][0]; k=max(i*3-1,0); r0=P[k][0]
            dx,dy=q[0]-r0[0],q[1]-r0[1]; d=math.hypot(dx,dy) or 1; nx,ny=-dy/d,dx/d
            cl.append(f'<circle cx="{p[0]-nx*w*0.42:.1f}" cy="{p[1]-ny*w*0.42:.1f}" r="{w*0.5:.1f}"/>')
        capa=f'<g fill="#FFFFFF" opacity=".16" clip-path="url(#cp)">{"".join(cl)}</g>'
        defs+=f'<clipPath id="cp">{circ}</clipPath>'
    if lineas:  # trazos del centro del camino, que se achican con la distancia
        dl=[];acc=0
        for p,w,t in P:
            if t<0.04 or t>0.8: continue
            ciclo=(t*22)%1
            if ciclo<0.45: dl.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="{max(w*0.055,1.2):.1f}"/>')
        capa+=f'<g fill="{fondo[0]}" opacity=".55">{"".join(dl)}</g>'
    pared=''
    if espesor:   # el borde del camino, más fino a lo lejos (perspectiva)
        pd=[];ult=None
        for p,w,t in P:
            if ult and math.dist(p,ult)<1.6 and t<1: continue
            ult=p; pd.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]+w*0.16:.1f}" r="{w:.1f}"/>')
        pared=f'<g fill="url(#par)">{"".join(pd)}</g>'
        defs+=f'<linearGradient id="par" gradientUnits="userSpaceOnUse" x1="0" y1="1024" x2="0" y2="{E[1]}"><stop offset="0" stop-color="#2A1580"/><stop offset=".6" stop-color="#7A2A8C"/><stop offset="1" stop-color="#B8642E"/></linearGradient>'
    br=''
    if brillo:
        defs+='<filter id="bb" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>'
        br=f'<g filter="url(#bb)" opacity=".9">{cr(luz[0])}</g>'
    body=(f'<rect width="1024" height="1024" fill="url(#fondo)"/>'+(f'<rect width="1024" height="1024" fill="url(#luz)"/>' if halo else '')+extra+
          f'{pared}<g fill="url(#cam)">{circ}</g>{capa}{br}{cr(cruzc)}')
    open(nombre+'.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}"><defs>{defs}</defs>{body}</svg>')
if __name__=='__main__':
    V={'C0_base':dict(),'C1_punta_arriba':dict(geo='b'),'C2_S_alta':dict(geo='c',gap=30),'C3_horizonte':dict(horizonte=True),
       'C4_espesor':dict(espesor=True),'C7_brillo':dict(brillo=True),'C8_espesor_brillo':dict(espesor=True,brillo=True),'C5_lineas':dict(lineas=True),'C6_cruz_grande':dict(G=62,ARM=70,STUB=70,gap=30)}
    for n,kw in V.items(): logo(n,**kw)
    for p in PAL: logo('P_'+p,pal=p)
