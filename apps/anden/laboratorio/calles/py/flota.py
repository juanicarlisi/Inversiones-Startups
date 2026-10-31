"""Grafo de calles (OSMnx) + flota de 300 vehiculos ruteados por calle (Dijkstra/A*) + orden de paradas con OR-Tools.
Salidas: web/datos/grafo.json (para rutear en el navegador), web/datos/viajes.bin + viajes.meta.json (para TripsLayer),
         web/datos/calles.geojson, datos/medidas_python.json
Uso: .venv/bin/python py/flota.py
"""
import json, math, random, time, struct
import numpy as np, networkx as nx, osmnx as ox
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

SEED = 20261030
N_VEH, N_STOPS, N_DEPOTS = 300, 6, 3
DWELL_S = 90.0                     # tiempo de servicio por parada (INFERENCIA)
START_SPREAD_S = 1500.0            # salidas escalonadas en 25 min
# Velocidades efectivas urbanas por tipo de via en km/h (INFERENCIA: reparto en CABA con transito; no son limites legales)
SPEEDS = {"motorway":60,"trunk":40,"primary":28,"secondary":25,"tertiary":22,"unclassified":20,"residential":18,
          "living_street":8,"service":12,"motorway_link":40,"trunk_link":30,"primary_link":25,"secondary_link":22,"tertiary_link":20}
rnd = random.Random(SEED)
med = {}

t0 = time.perf_counter()
G = ox.graph_from_xml("datos/calles.osm", bidirectional=False, simplify=True, retain_all=False)
med["osmnx_graph_from_xml_s"] = round(time.perf_counter()-t0, 3)
G = ox.truncate.largest_component(G, strongly=True)
G = ox.routing.add_edge_speeds(G, hwy_speeds=SPEEDS, fallback=18)
G = ox.routing.add_edge_travel_times(G)
nodes, edges = ox.graph_to_gdfs(G)
med["nodos"], med["aristas"] = G.number_of_nodes(), G.number_of_edges()
med["km_calle_dirigidos"] = round(edges["length"].sum()/1000, 1)

ids = list(G.nodes)
idx = {n:i for i,n in enumerate(ids)}
xy = {n:(G.nodes[n]["x"], G.nodes[n]["y"]) for n in ids}

def hav(a, b):  # metros
    (x1,y1),(x2,y2) = xy[a], xy[b]
    p = math.pi/180; dx=(x2-x1)*p*math.cos((y1+y2)/2*p); dy=(y2-y1)*p
    return 6371008.8*math.hypot(dx, dy)
VMAX = max(d["length"]/d["travel_time"] for _,_,d in G.edges(data=True) if d["travel_time"]>0)  # cota real del grafo
h_time = lambda a, b: hav(a, b)/VMAX     # heuristica admisible en segundos

depots = rnd.sample(ids, N_DEPOTS)
stops = [[rnd.choice(ids) for _ in range(N_STOPS)] for _ in range(N_VEH)]

# --- 1) matriz de tiempos por vehiculo con Dijkstra (networkx) y orden de paradas con OR-Tools (TSP) ---
t0 = time.perf_counter(); n_dij = 0
orders = []
for v in range(N_VEH):
    dep = depots[v % N_DEPOTS]; pts = [dep] + stops[v]
    M = []
    for a in pts:
        d = nx.single_source_dijkstra_path_length(G, a, weight="travel_time"); n_dij += 1
        M.append([int(d.get(b, 10**6)) for b in pts])
    mgr = pywrapcp.RoutingIndexManager(len(pts), 1, 0); R = pywrapcp.RoutingModel(mgr)
    cb = R.RegisterTransitCallback(lambda i, j: M[mgr.IndexToNode(i)][mgr.IndexToNode(j)])
    R.SetArcCostEvaluatorOfAllVehicles(cb)
    prm = pywrapcp.DefaultRoutingSearchParameters()
    prm.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    prm.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    prm.time_limit.FromMilliseconds(30)
    sol = R.SolveWithParameters(prm); i = R.Start(0); seq = []
    while not R.IsEnd(i): seq.append(pts[mgr.IndexToNode(i)]); i = sol.Value(R.NextVar(i))
    seq.append(dep); orders.append(seq)
med["matriz_dijkstra_y_ortools_s"] = round(time.perf_counter()-t0, 2); med["dijkstra_single_source_corridas"] = n_dij

# --- 2) expansion de tramos a recorrido por calle: Dijkstra vs A* (misma respuesta, distinto trabajo) ---
def leg_dijkstra(a, b): return nx.shortest_path(G, a, b, weight="travel_time")
def leg_astar(a, b): return nx.astar_path(G, a, b, heuristic=h_time, weight="travel_time")
legs = [(s[i], s[i+1]) for s in orders for i in range(len(s)-1) if s[i] != s[i+1]]
med["tramos"] = len(legs)
t0 = time.perf_counter(); pd = [leg_dijkstra(a,b) for a,b in legs]; med["dijkstra_ms_por_tramo"] = round((time.perf_counter()-t0)/len(legs)*1000, 3)
t0 = time.perf_counter(); pa = [leg_astar(a,b) for a,b in legs]; med["astar_ms_por_tramo"] = round((time.perf_counter()-t0)/len(legs)*1000, 3)
tt = lambda p: sum(min(d["travel_time"] for d in G[u][v].values()) for u,v in zip(p,p[1:]))
iguales = sum(1 for a,b in zip(pd,pa) if abs(tt(a)-tt(b)) < 1e-6)
med["astar_mismo_tiempo_que_dijkstra"] = f"{iguales}/{len(legs)}"

# --- 3) trayectoria con timestamps (segundos desde la salida del primer vehiculo); parada = pausa en el nodo ---
def edge_geom(u, v):
    d = min(G[u][v].values(), key=lambda e: e["travel_time"])
    if "geometry" in d:
        pts = list(d["geometry"].coords)
        if math.hypot(pts[0][0]-xy[u][0], pts[0][1]-xy[u][1]) > math.hypot(pts[-1][0]-xy[u][0], pts[-1][1]-xy[u][1]): pts.reverse()
        return pts, d["travel_time"], d["length"]
    return [xy[u], xy[v]], d["travel_time"], d["length"]
coords, times, starts = [], [], [0]
meta_veh, total_len = [], 0.0
for v, seq in enumerate(orders):
    t = rnd.uniform(0, START_SPREAD_S); P, T = [], []
    def put(p, tt_): P.append(p); T.append(tt_)
    put(xy[seq[0]], t)
    for a, b in zip(seq, seq[1:]):
        if a == b: continue
        path = leg_astar(a, b)
        for u, w in zip(path, path[1:]):
            pts, tti, ln = edge_geom(u, w); total_len += ln
            segl = [math.hypot(pts[i+1][0]-pts[i][0], pts[i+1][1]-pts[i][1]) for i in range(len(pts)-1)]; S = sum(segl) or 1
            acc = 0
            for i in range(1, len(pts)):
                acc += segl[i-1]; put(pts[i], t + tti*acc/S)
            t += tti
        if b != seq[0]:   # servicio en parada
            t += DWELL_S; put(xy[b], t)
    for p, tt_ in zip(P, T): coords.append(p); times.append(tt_)
    starts.append(len(coords)); meta_veh.append({"depot": v % N_DEPOTS, "t0": T[0], "t1": T[-1], "puntos": len(P)})
coords = np.array(coords, dtype=np.float32); times = np.array(times, dtype=np.float32); starts = np.array(starts, dtype=np.int32)
import os; os.makedirs("web/datos", exist_ok=True)
with open("web/datos/viajes.bin", "wb") as f:
    f.write(coords.tobytes()); f.write(times.tobytes()); f.write(starts.tobytes())
tmax = float(times.max())
json.dump({"vehiculos": N_VEH, "puntos": int(len(coords)), "tMax": tmax, "depositos": [list(xy[d]) for d in depots],
           "bytes": {"coords": coords.nbytes, "times": times.nbytes, "starts": starts.nbytes}, "veh": meta_veh},
          open("web/datos/viajes.meta.json", "w"))
med["puntos_totales"] = int(len(coords)); med["bytes_bin"] = int(coords.nbytes+times.nbytes+starts.nbytes)
med["km_recorridos_flota"] = round(total_len/1000, 1); med["duracion_max_min"] = round(tmax/60, 1)

# --- 4) grafo compacto para rutear en el navegador (CSR) y calles para dibujar ---
src, dst, w, ln = [], [], [], []
for u, v, d in G.edges(data=True):
    src.append(idx[u]); dst.append(idx[v]); w.append(round(d["travel_time"], 3)); ln.append(round(d["length"], 1))
json.dump({"n": len(ids), "x": [round(xy[n][0], 6) for n in ids], "y": [round(xy[n][1], 6) for n in ids],
           "src": src, "dst": dst, "w": w, "vmax_ms": VMAX,
           "tramos_prueba": [[idx[a], idx[b]] for a, b in legs[:600]],
           "tt_dijkstra_py": [round(tt(p), 3) for p in pd[:600]]}, open("web/datos/grafo.json", "w"), separators=(",", ":"))
feats = []
for (u, v, k), r in edges.iterrows():
    feats.append({"type":"Feature","properties":{"hw": r["highway"] if isinstance(r["highway"], str) else r["highway"][0],
                  "oneway": bool(r.get("oneway", False))},"geometry":{"type":"LineString","coordinates":[[round(x,6), round(y,6)] for x,y in r.geometry.coords]}})
json.dump({"type":"FeatureCollection","features":feats}, open("web/datos/calles.geojson","w"), separators=(",", ":"))
json.dump(med, open("datos/medidas_python.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(med, indent=1, ensure_ascii=False))
