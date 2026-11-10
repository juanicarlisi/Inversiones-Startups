import sys; sys.path.insert(0,'.')
import v12
from v12 import T
def curvaL(CX,FOOT,k=0.92):
    base=[((300,1100),(830,1040),(872,705),(538,642)),((538,642),(185,575),(205,385),(420,380))]
    b=[tuple(T(p,k) for p in s) for s in base]
    a=b[-1][-1]
    turn=(a,(a[0]+120,a[1]-1),(CX,a[1]-40),(CX,a[1]-95))
    neck=((CX,a[1]-95),(CX,a[1]-110),(CX,FOOT+15),(CX,FOOT))
    return b+[turn,neck]
v12.curva=curvaL
def hacer(n,**kw):
    v12.logo(n,**kw); v12.logo(n+'_mono',mono=True,**kw)
# FOOT = donde termina el camino (debajo del travesaño); BAJO*STUB = palo visible debajo del travesaño
hacer('S1',CX=556,FOOT=300,G=64,ARM=76,STUB=76,BAJO=1.0,w0=330,w1=64,pot=0.9)
hacer('S2',CX=556,FOOT=300,G=60,ARM=72,STUB=72,BAJO=1.0,w0=320,w1=60,pot=1.05)
hacer('S3',CX=556,FOOT=300,G=64,ARM=76,STUB=76,BAJO=1.0,w0=330,w1=64,pot=0.9,paleta='luz')
