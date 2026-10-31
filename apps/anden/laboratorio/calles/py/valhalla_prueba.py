"""Valhalla (pyvalhalla 3.9.1, MIT) en proceso sobre el mismo extracto del barrio: ms por ruta, matriz, isocrona, map matching y TSP."""
import json, time, random, os, shutil, subprocess, sys
import valhalla
from valhalla import Actor, get_config

out = {}
shutil.rmtree("valhalla/tiles", ignore_errors=True); os.makedirs("valhalla/tiles")
cfg = get_config(tile_extract="", tile_dir="valhalla/tiles", verbose=False)
json.dump(cfg, open("valhalla/valhalla.json", "w"))
t0 = time.perf_counter()
r = subprocess.run([os.path.join(os.path.dirname(valhalla.__file__), "bin", "valhalla_build_tiles"), "-c", "valhalla/valhalla.json", "datos/barrio.osm.pbf"], capture_output=True, text=True)
out["build_tiles_s"] = round(time.perf_counter()-t0, 2); out["build_rc"] = r.returncode
if r.returncode: print(r.stderr[-800:]); raise SystemExit(1)
out["tiles_bytes"] = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk("valhalla/tiles") for f in fs)
cfg = get_config(tile_extract="", tile_dir="valhalla/tiles", verbose=False)
A = Actor(cfg)
g = json.load(open("web/datos/grafo.json"))
legs = g["tramos_prueba"][:300]
loc = lambda i: {"lon": g["x"][i], "lat": g["y"][i]}
ok, ms, km, mins = 0, [], 0, 0
for a, b in legs:
    t0 = time.perf_counter()
    try:
        res = A.route({"locations": [loc(a), loc(b)], "costing": "auto", "directions_options": {"units": "kilometers"}})
        ms.append((time.perf_counter()-t0)*1000); ok += 1; s = res["trip"]["summary"]; km += s["length"]; mins += s["time"]/60
    except Exception as e:
        err = str(e)[:100]
ms.sort()
out["route_ok"] = f"{ok}/{len(legs)}"; out["route_ms_mediana"] = round(ms[len(ms)//2], 3) if ms else None; out["route_ms_p95"] = round(ms[int(len(ms)*.95)], 3) if ms else None
# matriz 40x40
rnd = random.Random(1); pts = [loc(rnd.randrange(g["n"])) for _ in range(40)]
t0 = time.perf_counter()
try:
    m = A.matrix({"sources": pts, "targets": pts, "costing": "auto"}); out["matriz_40x40_ms"] = round((time.perf_counter()-t0)*1000, 1)
except Exception as e: out["matriz_err"] = str(e)[:150]
# isocrona 5/10 min
t0 = time.perf_counter()
try:
    iso = A.isochrone({"locations": [loc(rnd.randrange(g["n"]))], "costing": "auto", "contours": [{"time": 5}, {"time": 10}], "polygons": True}); out["isocrona_ms"] = round((time.perf_counter()-t0)*1000, 1); out["isocrona_features"] = len(iso["features"])
except Exception as e: out["iso_err"] = str(e)[:150]
# optimized_route (TSP de 8 puntos)
t0 = time.perf_counter()
try:
    o = A.optimized_route({"locations": [loc(rnd.randrange(g["n"])) for _ in range(8)], "costing": "auto"}); out["tsp8_ms"] = round((time.perf_counter()-t0)*1000, 1)
except Exception as e: out["tsp_err"] = str(e)[:150]
# map matching: traza ruidosa de un vehiculo real simulado
meta = json.load(open("web/datos/viajes.meta.json"))
import numpy as np
raw = open("web/datos/viajes.bin", "rb").read(); n = meta["puntos"]
C = np.frombuffer(raw, dtype=np.float32, count=2*n).reshape(-1, 2); T = np.frombuffer(raw, dtype=np.float32, count=n, offset=8*n)
S = np.frombuffer(raw, dtype=np.int32, offset=12*n)
tr = [{"lon": float(C[i][0]+rnd.gauss(0, 3e-5)), "lat": float(C[i][1]+rnd.gauss(0, 3e-5)), "time": int(T[i])} for i in range(S[0], min(S[1], S[0]+80), 2)]
t0 = time.perf_counter()
try:
    mm = A.trace_route({"shape": tr, "costing": "auto", "shape_match": "map_snap"}); out["map_matching_ms"] = round((time.perf_counter()-t0)*1000, 1); out["map_matching_puntos"] = len(tr)
except Exception as e: out["mm_err"] = str(e)[:150]
out["valhalla_version"] = valhalla.__version__ if hasattr(valhalla, "__version__") else "pyvalhalla 3.9.1"
json.dump(out, open("datos/medidas_valhalla.json", "w"), indent=1)
print(json.dumps(out, indent=1))
