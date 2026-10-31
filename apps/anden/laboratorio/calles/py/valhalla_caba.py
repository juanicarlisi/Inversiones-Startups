"""Valhalla a escala CABA: construir tiles, ms por ruta (300 pares OD del benchmark), matriz 50x50, isocrona, map matching."""
import json, time, random, os, shutil, subprocess, sys
import numpy as np, valhalla
from valhalla import Actor, get_config
out = {}
shutil.rmtree("valhalla/tiles_caba", ignore_errors=True); os.makedirs("valhalla/tiles_caba")
cfg = get_config(tile_extract="", tile_dir="valhalla/tiles_caba", verbose=False); json.dump(cfg, open("valhalla/valhalla_caba.json", "w"))
t0 = time.perf_counter()
r = subprocess.run([os.path.join(os.path.dirname(valhalla.__file__), "bin", "valhalla_build_tiles"), "-c", "valhalla/valhalla_caba.json", "datos/caba.osm.pbf"], capture_output=True, text=True)
out["build_tiles_s"] = round(time.perf_counter()-t0, 1); out["rc"] = r.returncode
out["tiles_MB"] = round(sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk("valhalla/tiles_caba") for f in fs)/1e6, 1)
A = Actor(get_config(tile_extract="", tile_dir="valhalla/tiles_caba", verbose=False))
meta = json.load(open("datos/caba_pares.json")); n = meta["n"]
raw = open("datos/caba_grafo.bin", "rb").read(); X = np.frombuffer(raw, "<f8", n); Y = np.frombuffer(raw, "<f8", n, 8*n)
loc = lambda i: {"lon": float(X[i]), "lat": float(Y[i])}
ms, ok, mins = [], 0, []
for a, b in meta["pares"][:300]:
    t0 = time.perf_counter()
    try:
        res = A.route({"locations": [loc(a), loc(b)], "costing": "auto"}); ms.append((time.perf_counter()-t0)*1000); ok += 1; mins.append(res["trip"]["summary"]["time"]/60)
    except Exception as e: err = str(e)[:80]
ms.sort(); out["route_ok"] = f"{ok}/300"; out["route_ms_mediana"] = round(ms[len(ms)//2], 2); out["route_ms_p95"] = round(ms[int(len(ms)*.95)], 2); out["viaje_min_mediana"] = round(sorted(mins)[len(mins)//2], 1)
rnd = random.Random(3); pts = [loc(rnd.randrange(n)) for _ in range(50)]
t0 = time.perf_counter()
try: A.matrix({"sources": pts, "targets": pts, "costing": "auto"}); out["matriz_50x50_ms"] = round((time.perf_counter()-t0)*1000, 1)
except Exception as e: out["matriz_err"] = str(e)[:120]
t0 = time.perf_counter()
try: iso = A.isochrone({"locations": [loc(rnd.randrange(n))], "costing": "auto", "contours": [{"time": 10}, {"time": 20}], "polygons": True}); out["isocrona_10_20min_ms"] = round((time.perf_counter()-t0)*1000, 1)
except Exception as e: out["iso_err"] = str(e)[:120]
json.dump(out, open("datos/medidas_valhalla_caba.json", "w"), indent=1); print(json.dumps(out, indent=1))
