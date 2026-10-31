"""Construye la instancia de prueba CABA (30-10-2026): grafo vial real de OpenStreetMap -> matrices de tiempo y distancia por Dijkstra
(SciPy, sobre el grafo dirigido con calles de mano unica) -> 400 paradas sinteticas con ventanas horarias, demanda y tiempo de servicio.

Las paradas son NODOS REALES de la red vial elegidos al azar (semilla fija), no clientes reales. Los parametros de velocidad, trafico,
costos y flota son SUPUESTOS del laboratorio (INFERENCIA), declarados abajo; sirven para comparar solucionadores, no para cotizar.

Uso: python3 py/construir_instancia.py
Salida: datos/caba_matrices.npz, datos/caba_clientes.json, datos/flota.json
"""
import hashlib, json, math, os, sys, time
import numpy as np
import osmnx as ox
import scipy.sparse as sp
from scipy.sparse.csgraph import dijkstra

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
OSM = os.path.join(RAIZ, "..", "calles", "datos", "caba.osm")  # extracto de BBBike (derivado de OpenStreetMap, ODbL); solo lectura
SEMILLA = 20261030
N_MAX = 400
DEPOSITO_LATLON = (-34.6385, -58.3990)   # Parque Patricios / Barracas: zona de depositos y centros logisticos del sur de CABA (elegido a criterio)
RADIO_KM = 9.0                            # paradas dentro de este radio del deposito

# --- supuestos de velocidad (km/h) por tipo de via cuando OSM no trae maxspeed; INFERENCIA, no dato oficial ---
VEL = {"motorway": 70, "motorway_link": 45, "trunk": 50, "trunk_link": 40, "primary": 40, "primary_link": 30, "secondary": 35,
       "secondary_link": 28, "tertiary": 30, "tertiary_link": 25, "unclassified": 25, "residential": 25, "living_street": 12,
       "service": 15, "services": 15}
FACTOR_TRAFICO = 0.70      # fraccion de la velocidad libre que se logra en hora de reparto (congestion)
DEMORA_ARCO_S = 5.0        # semaforo / esquina / giro por arco simplificado


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def maxspeed(v, hw):
    if v is not None:
        if isinstance(v, list):
            v = v[0]
        try:
            return float(str(v).split()[0])
        except ValueError:
            pass
    hw = hw[0] if isinstance(hw, list) else hw
    return VEL.get(hw, 25)


def cargar_grafo():
    """Grafo vial dirigido de CABA. El tiempo de cada tramo se calcula ANTES de simplificar (cada segmento con su velocidad) y se suma al
    fusionar: asi no depende del orden en que osmnx fusiona atributos (hallazgo: con listas de atributos el resultado cambiaba entre corridas)."""
    G = ox.graph_from_xml(OSM, simplify=False, retain_all=True)
    for u, v, k, d in G.edges(keys=True, data=True):
        vel = maxspeed(d.get("maxspeed"), d.get("highway")) * FACTOR_TRAFICO
        d["tmov"] = d["length"] / (vel / 3.6)
    G = ox.simplify_graph(G, edge_attr_aggs={"length": sum, "tmov": sum})
    return ox.truncate.largest_component(G, strongly=True)


def main():
    t0 = time.time()
    G = cargar_grafo()
    nodos = list(G.nodes)
    pos = {n: i for i, n in enumerate(nodos)}
    N = len(nodos)
    xs = np.array([G.nodes[n]["x"] for n in nodos]); ys = np.array([G.nodes[n]["y"] for n in nodos])
    print(f"grafo: {N} nodos, {G.number_of_edges()} arcos ({time.time()-t0:.1f}s)")

    U, V, T, L = [], [], [], []
    for u, v, d in G.edges(data=True):
        U.append(pos[u]); V.append(pos[v]); L.append(d["length"]); T.append(d["tmov"] + DEMORA_ARCO_S)
    U = np.array(U); V = np.array(V); T = np.array(T); L = np.array(L)
    # arcos paralelos: se queda el de menor tiempo
    orden = np.lexsort((T, V, U)); U, V, T, L = U[orden], V[orden], T[orden], L[orden]
    clave = U.astype(np.int64) * N + V
    primero = np.concatenate(([True], clave[1:] != clave[:-1]))
    U, V, T, L, clave = U[primero], V[primero], T[primero], L[primero], clave[primero]
    A = sp.csr_matrix((T, (U, V)), shape=(N, N))

    # deposito y paradas
    def haversine_km(lat, lon):
        R = 6371.0088
        p1, p2 = math.radians(lat), np.radians(ys)
        dphi = p2 - p1; dl = np.radians(xs - lon)
        a = np.sin(dphi / 2) ** 2 + math.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
        return 2 * R * np.arcsin(np.sqrt(a))
    dep = int(np.argmin(haversine_km(*DEPOSITO_LATLON)))
    dist_dep = haversine_km(ys[dep], xs[dep])
    cand = np.where((dist_dep <= RADIO_KM) & (dist_dep >= 0.4))[0]
    rng = np.random.default_rng(SEMILLA)
    elegidos = rng.choice(cand, size=N_MAX, replace=False)
    indices = np.concatenate(([dep], elegidos))   # 0 = deposito

    # Dijkstra desde cada punto, con predecesores para acumular la distancia del camino de menor tiempo
    n = len(indices)
    dur = np.zeros((n, n)); dis = np.zeros((n, n))
    t1 = time.time()
    D, P = dijkstra(A, directed=True, indices=indices, return_predecessors=True)
    arange = np.arange(N)
    for k, s in enumerate(indices):
        p = P[k].copy()
        p[p < 0] = s                       # inalcanzables y la propia fuente apuntan a la fuente
        kk = p.astype(np.int64) * N + arange
        idx = np.searchsorted(clave, kk, side="left")
        idx[idx >= len(clave)] = 0
        e = np.where(clave[idx] == kk, L[idx], 0.0)    # longitud del arco predecesor->v (0 en la fuente)
        e[s] = 0.0
        acc = e.copy(); ptr = p.copy(); ptr[s] = s
        for _ in range(24):                # salto de punteros: acumula la longitud hasta la fuente en log2(profundidad) pasos
            acc = acc + acc[ptr]; ptr = ptr[ptr]
        dis[k] = acc[indices]; dur[k] = D[k][indices]
    print(f"dijkstra {n} fuentes: {time.time()-t1:.1f}s; tiempo medio entre paradas {dur[1:,1:].mean()/60:.1f} min, distancia media {dis[1:,1:].mean()/1000:.2f} km")
    assert np.isfinite(dur).all()
    # autoverificacion contra NetworkX (implementacion independiente) en 25 pares
    import networkx as nx
    for t_ in range(25):
        i_, j_ = (int(a) for a in rng.choice(n, 2, replace=False))
        w = nx.single_source_dijkstra(G, nodos[indices[i_]], nodos[indices[j_]], weight=lambda a, b, dd: min(x["tmov"] for x in dd.values()) + DEMORA_ARCO_S)[0]
        assert abs(w - dur[i_, j_]) < 1e-6 * max(1, w), (i_, j_, w, dur[i_, j_])

    # --- paradas ---
    demanda = rng.choice([1, 2, 3, 4, 6, 8], size=N_MAX, p=[.30, .25, .20, .12, .08, .05])
    servicio = np.minimum(150 + 45 * demanda, 600)
    H = 3600
    tipo = rng.choice(["manana", "tarde", "franja2h", "libre"], size=N_MAX, p=[.30, .30, .25, .15])
    tw = []
    for t in tipo:
        if t == "manana": tw.append((9 * H, 13 * H))
        elif t == "tarde": tw.append((14 * H, 18 * H))
        elif t == "franja2h":
            a = int(rng.integers(9, 17)) * H; tw.append((a, a + 2 * H))
        else: tw.append((9 * H, 19 * H))
    clientes = [{"id": i + 1, "nodo_osm": int(nodos[elegidos[i]]), "lat": float(ys[elegidos[i]]), "lon": float(xs[elegidos[i]]),
                 "demanda": int(demanda[i]), "servicio_s": int(servicio[i]), "tw_ini": int(tw[i][0]), "tw_fin": int(tw[i][1]), "tipo_tw": str(tipo[i])}
                for i in range(N_MAX)]
    deposito = {"nodo_osm": int(nodos[dep]), "lat": float(ys[dep]), "lon": float(xs[dep]), "abre": 8 * H, "cierra": 21 * H}

    # flota heterogenea: supuestos de costo en milesimas de USD (INFERENCIA; no son cotizaciones)
    flota = [
        {"tipo": "moto",  "cantidad": 12, "capacidad": 18,  "fijo_mUSD": 22000, "por_km_mUSD": 50,  "factor_tiempo": 0.80, "jornada_max_s": 8 * H},
        {"tipo": "van_s", "cantidad": 12, "capacidad": 70,  "fijo_mUSD": 48000, "por_km_mUSD": 140, "factor_tiempo": 1.00, "jornada_max_s": 9 * H},
        {"tipo": "van_l", "cantidad": 6,  "capacidad": 160, "fijo_mUSD": 75000, "por_km_mUSD": 220, "factor_tiempo": 1.15, "jornada_max_s": 9 * H},
    ]
    os.makedirs(os.path.join(RAIZ, "datos"), exist_ok=True)
    np.savez_compressed(os.path.join(RAIZ, "datos", "caba_matrices.npz"), dur_s=np.rint(dur).astype(np.int32), dist_m=np.rint(dis).astype(np.int32))
    meta = {"fecha": "2026-10-30", "semilla": SEMILLA, "osm_archivo": "apps/anden/laboratorio/calles/datos/caba.osm", "osm_sha256": sha256(OSM),
            "grafo": {"nodos": N, "arcos": int(G.number_of_edges())}, "factor_trafico": FACTOR_TRAFICO, "demora_arco_s": DEMORA_ARCO_S,
            "radio_km": RADIO_KM, "velocidades_kmh_por_tipo": VEL}
    json.dump({"meta": meta, "deposito": deposito, "clientes": clientes}, open(os.path.join(RAIZ, "datos", "caba_clientes.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(flota, open(os.path.join(RAIZ, "datos", "flota.json"), "w"), indent=1)
    print("listo", f"{time.time()-t0:.1f}s")


if __name__ == "__main__":
    main()
