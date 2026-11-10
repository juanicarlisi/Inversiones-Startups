import sys; sys.path.insert(0,'.')
from v18 import logo
def segs(E): return [((30,1090),(520,1040),(905,930),(732,790)),((732,790),(560,654),(176,700),(250,546)),((250,546),(300,452),(E[0]-60,476),E)]
C=dict(G=54,ARM=62,STUB=62,gap=24)
for n,kw in [('X1',dict(END=(520,436),w0=330,w1=6,pot=0.85)),('X2',dict(END=(520,436),w0=330,w1=6,pot=1.0)),('X3',dict(END=(520,446),w0=360,w1=6,pot=0.75))]:
    kw.update(C); logo(n,segs=segs(kw['END']),**kw); logo(n+'_mono',segs=segs(kw['END']),mono=True,**kw)
