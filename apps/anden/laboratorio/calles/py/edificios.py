"""Huellas de Overture (release 2026-10-21.0, ODbL/CDLA) -> web/datos/edificios.geojson con altura 'h' en metros.
Altura real si existe (height / num_floors * 3 m); si no, SINTETICA y deterministica (hash del indice): marcada src='sintetica'.
El render 3D de edificios con alturas sinteticas es solo contexto visual, no dato."""
import json, hashlib
g = json.load(open("datos/edificios_overture.geojson"))
out, real, sint = [], 0, 0
def r6(c): return [[round(x, 6), round(y, 6)] for x, y in c]
for i, f in enumerate(g["features"]):
    p = f["properties"]; geom = f["geometry"]
    if geom["type"] == "Polygon": polys = [geom["coordinates"]]
    elif geom["type"] == "MultiPolygon": polys = geom["coordinates"]
    else: continue
    h = p.get("height"); nf = p.get("num_floors")
    if h: hh, src = float(h), "real"
    elif nf: hh, src = float(nf)*3.0, "real"
    else:
        u = int(hashlib.sha1(str(i).encode()).hexdigest()[:6], 16) / 0xFFFFFF   # 0..1 deterministico
        hh = 5.5 + u*4.5 if u < .70 else 11 + (u-.70)/.25*13 if u < .95 else 28 + (u-.95)/.05*16
        src = "sintetica"
    real += src == "real"; sint += src == "sintetica"
    for poly in polys:
        out.append({"type": "Feature", "properties": {"h": round(hh, 1), "s": src[0]}, "geometry": {"type": "Polygon", "coordinates": [r6(r) for r in poly]}})
json.dump({"type": "FeatureCollection", "features": out}, open("web/datos/edificios.geojson", "w"), separators=(",", ":"))
print(f"edificios: {len(out)} (altura real {real}, sintetica {sint})")
