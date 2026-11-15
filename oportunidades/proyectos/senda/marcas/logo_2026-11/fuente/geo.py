# Geometría de la senda en forma de S: una cinta que se angosta con la distancia (perspectiva).
import math
def bez(p0,p1,p2,p3,t):
    u=1-t
    return (u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
            u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1])
def muestras(segs,n=240):
    pts=[]
    for k,s in enumerate(segs):
        for i in range(n+ (1 if k==len(segs)-1 else 0)):
            pts.append(bez(*s,i/n))
    return pts
def largo(pts):
    acc=[0.0]
    for a,b in zip(pts,pts[1:]): acc.append(acc[-1]+math.dist(a,b))
    return acc
def cinta(segs,w0,w1,pot=1.6,n=240):
    pts=muestras(segs,n); L=largo(pts); tot=L[-1]
    izq=[];der=[]
    for i,p in enumerate(pts):
        a=pts[max(i-1,0)]; b=pts[min(i+1,len(pts)-1)]
        dx,dy=b[0]-a[0],b[1]-a[1]; d=math.hypot(dx,dy) or 1
        nx,ny=-dy/d,dx/d
        t=L[i]/tot
        w=(w1+(w0-w1)*(1-t)**pot)/2
        izq.append((p[0]+nx*w,p[1]+ny*w)); der.append((p[0]-nx*w,p[1]-ny*w))
    poly=izq+der[::-1]
    return "M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in poly)+"Z", pts
def linea(pts):
    return "M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in pts)

def cinta2(segs,w0,w1,pot=1.6,n=240,dy=0.0):
    """Como cinta, pero cada punto baja dy*ancho: la pared del camino se afina con la distancia."""
    pts=muestras(segs,n); L=largo(pts); tot=L[-1]
    izq=[];der=[]
    for i,p in enumerate(pts):
        a=pts[max(i-1,0)]; b=pts[min(i+1,len(pts)-1)]
        dx,dyy=b[0]-a[0],b[1]-a[1]; d=math.hypot(dx,dyy) or 1
        nx,ny=-dyy/d,dx/d
        t=L[i]/tot
        w=(w1+(w0-w1)*(1-t)**pot)/2
        bajar=dy*w*2
        izq.append((p[0]+nx*w,p[1]+ny*w+bajar)); der.append((p[0]-nx*w,p[1]-ny*w+bajar))
    poly=izq+der[::-1]
    return "M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in poly)+"Z"
