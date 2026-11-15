import sys; sys.path.insert(0,'.')
import v14, v12
P=dict(CX=556,FOOT=300,G=60,ARM=72,STUB=72,BAJO=1.0,w0=320,w1=60,pot=1.05)
v12.logo('senda_icono',**P)
v12.logo('senda_icono_luz',paleta='luz',**P)
v12.logo('senda_mono',mono=True,**P)
E=0.68
v12.logo('senda_adapt',escala=E,centro=(530,560),extender=True,**P)
v12.logo('senda_adapt_mono',escala=E,centro=(530,560),extender=True,mono=True,**P)
