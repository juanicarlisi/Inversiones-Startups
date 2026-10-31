"""Extrae del PBF de BBBike (derivado de OpenStreetMap, ODbL) las calles transitables por auto y los edificios de un barrio de CABA.
Salida: datos/caba.osm (XML minimo para osmnx.graph_from_xml) y datos/_caba_edificios.geojson.
Uso: .venv/bin/python py/extraer_osm.py
"""
import json, sys
import osmium
from lxml import etree

PBF = "datos/BuenosAires.osm.pbf"
# Villa Crespo y entorno (Almagro, Palermo, Chacarita): W, S, E, N
W, S, E, N = -58.5320, -34.7050, -58.3350, -34.5260   # CABA completa (aprox.)

NO_HW = {"abandoned","bridleway","bus_guideway","construction","corridor","cycleway","elevator","escalator","footway","no",
         "path","pedestrian","planned","platform","proposed","raceway","razed","steps","track","via_ferrata","busway"}
NO_SERVICE = {"parking","parking_aisle","driveway","private","emergency_access"}

def drivable(t):
    hw = t.get("highway")
    if not hw or hw in NO_HW: return False
    if t.get("area") == "yes": return False
    if t.get("motor_vehicle") == "no" or t.get("motorcar") == "no": return False
    if t.get("access") == "private": return False
    if t.get("service") in NO_SERVICE: return False
    return True

def inside(lon, lat): return W <= lon <= E and S <= lat <= N

fp = osmium.FileProcessor(PBF).with_locations()
ways, nodes_used, buildings = [], {}, []
n_ways_seen = 0
for o in fp:
    if o.is_way():
        t = {tag.k: tag.v for tag in o.tags}
        if "highway" in t and drivable(t):
            n_ways_seen += 1
            try:
                pts = [(n.ref, n.lon, n.lat) for n in o.nodes]
            except osmium.InvalidLocationError:
                continue
            if not any(inside(lon, lat) for _, lon, lat in pts): continue
            ways.append((o.id, t, [r for r, _, _ in pts]))
            for r, lon, lat in pts: nodes_used[r] = (lon, lat)
        elif False:
            try:
                ring = [(n.lon, n.lat) for n in o.nodes]
            except osmium.InvalidLocationError:
                continue
            cx = sum(p[0] for p in ring)/len(ring); cy = sum(p[1] for p in ring)/len(ring)
            if not inside(cx, cy) or len(ring) < 4: continue
            lv = t.get("building:levels"); h = t.get("height")
            try: levels = float(lv) if lv else None
            except ValueError: levels = None
            try: height = float(h.replace("m","").strip()) if h else None
            except ValueError: height = None
            buildings.append({"type":"Feature","properties":{"levels":levels,"height":height,"kind":t["building"]},
                              "geometry":{"type":"Polygon","coordinates":[[list(p) for p in ring]]}})

osm = etree.Element("osm", version="0.6")
for r,(lon,lat) in sorted(nodes_used.items()):  # ids ordenados: Valhalla/OSRM exigen entrada ordenada
    etree.SubElement(osm, "node", id=str(r), lat=f"{lat:.7f}", lon=f"{lon:.7f}")
for wid, t, refs in sorted(ways, key=lambda w: w[0]):
    w = etree.SubElement(osm, "way", id=str(wid))
    for r in refs: etree.SubElement(w, "nd", ref=str(r))
    for k, v in t.items():
        if k in ("highway","oneway","name","lanes","maxspeed","junction","bridge","tunnel","surface","ref"):
            etree.SubElement(w, "tag", k=k, v=v)
etree.ElementTree(osm).write("datos/caba.osm", xml_declaration=True, encoding="utf-8")
json.dump({"type":"FeatureCollection","features":buildings}, open("datos/_caba_edificios.geojson","w"), separators=(",",":"))
print(f"vias transitables dentro del bbox: {len(ways)} (de {n_ways_seen} en el extracto); nodos: {len(nodes_used)}; edificios: {len(buildings)}")

# PBF ordenado para Valhalla / OSRM (mismas vias)
import os
if os.path.exists("datos/caba.osm.pbf"): os.remove("datos/caba.osm.pbf")
wr = osmium.SimpleWriter("datos/caba.osm.pbf")
for o in osmium.FileProcessor("datos/caba.osm"): wr.add(o)
wr.close()
