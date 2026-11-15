import sys; sys.path.insert(0,'.')
from v18 import logo
from v19 import segs
P=dict(END=(520,446),w0=360,w1=6,pot=0.75,G=54,ARM=62,STUB=62,gap=24)
logo('noche_icono',segs=segs(P['END']),**P)
logo('noche_mono',segs=segs(P['END']),mono=True,**P)
