"""Escala ciudad: red vial de CABA completa. Mide OSMnx, Dijkstra/A* (networkx) y exporta el grafo binario + pares OD con respuesta de referencia
para comparar Dijkstra/A*/CH en JS y WASM, y Valhalla/OSRM."""
import json, time, math, random, struct, os
import numpy as np, networkx as nx, osmnx as ox
SPEEDS = {"motorway":60,"trunk":40,"primary":28,"secondary":25,"tertiary":22,"unclassified":20,"residential":18,
          "living_street":8,"service":12,"motorway_link":40,"trunk_link":30,"primary_link":25,"secondary_link":22,"tertiary_link":20}
out = {}
t0 = time.perf_counter(); G = ox.graph_from_xml("datos/caba.osm", bidirectional=False, simplify=True, retain_all=False); out["osmnx_carga_s"] = round(time.perf_counter()-t0, 1)
out["nodos_antes_scc"] = G.number_of_nodes()
G = ox.truncate.largest_component(G, strongly=True)
G = ox.routing.add_edge_speeds(G, hwy_speeds=SPEEDS, fallback=18); G = ox.routing.add_edge_travel_times(G)
ids = list(G.nodes); idx = {n:i for i,n in enumerate(ids)}
out["nodos"], out["aristas"] = G.number_of_nodes(), G.number_of_edges()
xy = {n:(G.nodes[n]["x"], G.nodes[n]["y"]) for n in ids}
VMAX = max(d["length"]/d["travel_time"] for _,_,d in G.edges(data=True) if d["travel_time"]>0)   # m/s: cota real del grafo (OSM trae maxspeed > tabla)
out["vmax_kmh_grafo"] = round(VMAX*3.6,1)
def hav(a,b):
    (x1,y1),(x2,y2)=xy[a],xy[b]; p=math.pi/180; return 6371008.8*math.hypot((x2-x1)*p*math.cos((y1+y2)/2*p),(y2-y1)*p)
h = lambda a,b: hav(a,b)/VMAX
rnd = random.Random(7); pairs = [(rnd.choice(ids), rnd.choice(ids)) for _ in range(300)]
t0=time.perf_counter(); ref=[nx.dijkstra_path_length(G,a,b,weight="travel_time") for a,b in pairs]; out["py_dijkstra_ms"]=round((time.perf_counter()-t0)/len(pairs)*1000,2)
t0=time.perf_counter(); ra=[nx.astar_path_length(G,a,b,heuristic=h,weight="travel_time") for a,b in pairs]; out["py_astar_ms"]=round((time.perf_counter()-t0)/len(pairs)*1000,2)
out["py_astar_igual_dijkstra"]=f"{sum(1 for x,y in zip(ref,ra) if abs(x-y)<1e-6)}/{len(pairs)}"
src,dst,w,ln=[],[],[],[]
for u,v,d in G.edges(data=True): src.append(idx[u]); dst.append(idx[v]); w.append(d["travel_time"]); ln.append(d["length"])
X=np.array([xy[n][0] for n in ids]); Y=np.array([xy[n][1] for n in ids])
with open("datos/caba_grafo.bin","wb") as f:
    f.write(X.astype("<f8").tobytes()); f.write(Y.astype("<f8").tobytes()); f.write(np.array(src,"<i4").tobytes()); f.write(np.array(dst,"<i4").tobytes()); f.write(np.array(w,"<f4").tobytes()); f.write(np.array(ln,"<f4").tobytes())
json.dump({"n":len(ids),"m":len(src),"vmax_ms":VMAX,"pares":[[idx[a],idx[b]] for a,b in pairs],"ref_s":[round(x,3) for x in ref]}, open("datos/caba_pares.json","w"))
json.dump(out, open("datos/medidas_caba_python.json","w"), indent=1); print(json.dumps(out, indent=1))
