"""Valida las matrices de Dijkstra (SciPy) contra NetworkX (implementacion independiente) en pares al azar. Uso: python3 py/validar_matrices.py"""
import json, math, os, random
import numpy as np, networkx as nx, osmnx as ox
import importlib.util
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(AQUI)
spec = importlib.util.spec_from_file_location("ci", os.path.join(AQUI, "construir_instancia.py")); ci = importlib.util.module_from_spec(spec); spec.loader.exec_module(ci)
G = ci.cargar_grafo()
for u, v, k, d in G.edges(keys=True, data=True):
    d["t"] = d["tmov"] + ci.DEMORA_ARCO_S
M = np.load(os.path.join(RAIZ, "datos", "caba_matrices.npz")); C = json.load(open(os.path.join(RAIZ, "datos", "caba_clientes.json")))
nodos = [C["deposito"]["nodo_osm"]] + [c["nodo_osm"] for c in C["clientes"]]
random.seed(1); err_t = err_d = 0; n = 0; asim = 0
for _ in range(40):
    i, j = random.sample(range(len(nodos)), 2)
    t, path = nx.single_source_dijkstra(G, nodos[i], nodos[j], weight="t")
    dist = sum(min(G[a][b][k]["length"] for k in G[a][b] if G[a][b][k]["t"] == min(G[a][b][kk]["t"] for kk in G[a][b])) for a, b in zip(path[:-1], path[1:]))
    err_t = max(err_t, abs(t - M["dur_s"][i, j])); err_d = max(err_d, abs(dist - M["dist_m"][i, j])); n += 1
print(f"{n} pares: error maximo tiempo {err_t:.2f} s, distancia {err_d:.2f} m (SciPy vs NetworkX)")
d = M["dur_s"][1:, 1:].astype(float); print(f"asimetria media |t_ij - t_ji| / t_ij = {np.mean(np.abs(d-d.T)[d>0]/d[d>0])*100:.1f}% (calles de mano unica)")
lin = []
for _ in range(2000):
    i, j = random.sample(range(1, len(nodos)), 2)
    a, b = C["clientes"][i-1], C["clientes"][j-1]
    R = 6371008.8; p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    h = math.sin((p2-p1)/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(math.radians(b["lon"]-a["lon"])/2)**2
    lin.append(M["dist_m"][i, j] / (2*R*math.asin(math.sqrt(h))))
print(f"distancia por calle / distancia en linea recta: mediana {np.median(lin):.2f}, p10 {np.percentile(lin,10):.2f}, p90 {np.percentile(lin,90):.2f}")
