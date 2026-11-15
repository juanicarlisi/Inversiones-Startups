#!/usr/bin/env python3
"""Hornea el relieve del mundo de Hub Nocturno v2 a partir de datos de dominio público.

Entradas (se bajan una sola vez a una carpeta de trabajo; no se versionan):
  - etopo2022.nc   NOAA NCEI ETOPO 2022, 60 segundos de arco, «surface» (doi:10.25921/fd45-gt74). Dominio público (obra del
                   gobierno de EE. UU.). Recorte: lon -86..-30, lat -58..16, por el servicio NCSS de THREDDS de NCEI:
                   https://www.ngdc.noaa.gov/thredds/ncss/grid/global/ETOPO2022/60s/60s_surface_elev_netcdf/
                   ETOPO_2022_v1_60s_N90W180_surface.nc?var=z&north=16.004&west=-86.004&east=-29.996&south=-58.004&horizStride=1&accept=netcdf3
  - ne2/NE2_LR_LC.tif   Natural Earth II, cobertura del suelo sin sombreado (dominio público):
                   https://naciscdn.org/naturalearth/10m/raster/NE2_LR_LC.zip
  - ne_50m_rivers_lake_centerlines.geojson, ne_50m_lakes.geojson, ne_50m_admin_0_boundary_lines_land.geojson
                   Natural Earth 1:50m (dominio público), de github.com/nvkelso/natural-earth-vector

Salidas (en ../activos):
  - alturas.webp  (sin pérdida) RGB de 8 bits: R,G = altura en 16 bits (ver ALT_MIN/ALT_MAX), B = máscara de ríos y lagos.
  - costa.webp    (sin pérdida) distancia con signo a la orilla: 128 = costa, ±127 = ±0,5 unidades de mundo.
  - suelo.webp    color del suelo (cobertura); el canal alfa lleva las fronteras.
  - mundo.json    límites y codificación, para que el juego ubique todo.

Uso:  python3 relieve.py <carpeta con las entradas> [ancho]
Proyección: Mercator con grados como unidad (x = longitud; y = ln(tan(45° + lat/2)) en grados).
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.io import netcdf_file
from scipy.ndimage import distance_transform_edt, gaussian_filter, label, map_coordinates, zoom

Image.MAX_IMAGE_PIXELS = None
ENTRADA = Path(sys.argv[1])
ANCHO = int(sys.argv[2]) if len(sys.argv) > 2 else 1536
SALIDA = Path(__file__).resolve().parent.parent / 'activos'
SALIDA.mkdir(exist_ok=True)

OESTE, ESTE, SUR, NORTE = -86.0, -30.0, -58.0, 16.0
ALT_MIN, ALT_MAX = -8192.0, 8192.0  # metros que cubre la codificación de 16 bits (0,25 m por paso)


def merc(lat):
    return np.degrees(np.log(np.tan(np.pi / 4 + np.radians(lat) / 2)))


def inv_merc(y):
    return np.degrees(2 * np.arctan(np.exp(np.radians(y))) - np.pi / 2)


Y_N, Y_S = float(merc(NORTE)), float(merc(SUR))
ALTO = int(round(ANCHO * (Y_N - Y_S) / (ESTE - OESTE)))
print(f'salida {ANCHO}×{ALTO}  merc y {Y_S:.2f}..{Y_N:.2f}')

# Centro de cada píxel de salida → lon, lat
lon = OESTE + (np.arange(ANCHO) + 0.5) / ANCHO * (ESTE - OESTE)
ymerc = Y_N - (np.arange(ALTO) + 0.5) / ALTO * (Y_N - Y_S)
lat = inv_merc(ymerc)

# ── alturas ──
f = netcdf_file(str(ENTRADA / 'etopo2022.nc'), 'r', mmap=False)
z = np.array(f.variables['z'].data, dtype=np.float32)
zlat = np.array(f.variables['lat'].data)
zlon = np.array(f.variables['lon'].data)
f.close()
# Antialias: la salida tiene menos resolución que la fuente (1' ≈ 0,0167°)
z_fuente = z.copy()
paso = (ESTE - OESTE) / ANCHO / (zlon[1] - zlon[0])
if paso > 1.0:
    z = gaussian_filter(z, sigma=0.42 * paso)
fila = (lat - zlat[0]) / (zlat[1] - zlat[0])
col = (lon - zlon[0]) / (zlon[1] - zlon[0])
F, C = np.meshgrid(fila, col, indexing='ij')
alt = map_coordinates(z, [F, C], order=1, mode='nearest').astype(np.float32)
print('alturas', alt.min(), alt.max())

# ── costa: distancia con signo a la orilla (positiva en tierra), para que la costa, la playa y la espuma salgan limpias ──
# Se calcula al doble de resolución con las alturas de origen y se guarda en 8 bits: ±0,5 unidades de mundo (unos 45 km).
E2 = 2
lon2 = OESTE + (np.arange(ANCHO * E2) + 0.5) / (ANCHO * E2) * (ESTE - OESTE)
lat2 = inv_merc(Y_N - (np.arange(ALTO * E2) + 0.5) / (ALTO * E2) * (Y_N - Y_S))
F2, C2 = np.meshgrid((lat2 - zlat[0]) / (zlat[1] - zlat[0]), (lon2 - zlon[0]) / (zlon[1] - zlon[0]), indexing='ij')
alt2 = map_coordinates(z_fuente, [F2, C2], order=1, mode='nearest')
tierra2 = gaussian_filter(alt2, 1.2) > 0.5
# el agua que no toca el borde del mapa y es chica (depresiones bajo el nivel del mar) cuenta como tierra
etiquetas, n_et = label(~tierra2)
borde = set(np.unique(np.concatenate([etiquetas[0], etiquetas[-1], etiquetas[:, 0], etiquetas[:, -1]])))
tam = np.bincount(etiquetas.ravel())
for k in range(1, n_et + 1):
    if k not in borde and tam[k] < 4000:
        tierra2[etiquetas == k] = True
# y las islas de menos de 6 píxeles se quitan (ruido)
etiquetas, n_et = label(tierra2)
tam = np.bincount(etiquetas.ravel())
chicas = np.isin(etiquetas, np.where(tam < 6)[0])
tierra2[chicas] = False
px_mundo = (ESTE - OESTE) / (ANCHO * E2)
d_tierra = distance_transform_edt(tierra2) * px_mundo
d_mar = distance_transform_edt(~tierra2) * px_mundo
sdf2 = gaussian_filter(np.where(tierra2, d_tierra - px_mundo / 2, -(d_mar - px_mundo / 2)), 1.0)
sdf = sdf2.reshape(ALTO, E2, ANCHO, E2).mean(axis=(1, 3))
costa8 = np.clip(np.round(128 + sdf / 0.5 * 127), 0, 255).astype(np.uint8)
Image.fromarray(costa8, 'L').save(SALIDA / 'costa.webp', lossless=True, method=6)
# las alturas acompañan a la costa: tierra por encima de 2 m, mar por debajo de −2 m
alt = np.where(sdf > 0, np.maximum(alt, 2.0), np.minimum(alt, -2.0)).astype(np.float32)

# El fondo del mar no necesita precisión: se suaviza para que el PNG pese menos (la costa queda intacta)
mar = alt < -40
suave = gaussian_filter(alt, sigma=2.0)
alt = np.where(mar, np.round(suave / 16) * 16, alt)

q = np.clip((alt - ALT_MIN) / (ALT_MAX - ALT_MIN), 0, 1)
q16 = (np.round(q * 65535 / 16) * 16).clip(0, 65535).astype(np.uint16)  # pasos de 4 m: el WebP sin pérdida pesa la mitad

# ── ríos y lagos (máscara) y fronteras ──
ESC = 2  # sobre-muestreo para que las líneas salgan suaves


def a_pix(lo, la):
    x = (lo - OESTE) / (ESTE - OESTE) * ANCHO * ESC
    y = (Y_N - float(merc(max(-85.0, min(85.0, la))))) / (Y_N - Y_S) * ALTO * ESC
    return x, y


def lineas(geo):
    g = geo['type']
    if g == 'LineString':
        yield geo['coordinates']
    elif g == 'MultiLineString':
        yield from geo['coordinates']
    elif g == 'Polygon':
        yield geo['coordinates'][0]
    elif g == 'MultiPolygon':
        for p in geo['coordinates']:
            yield p[0]


def dentro(cs):
    return any(OESTE - 1 < c[0] < ESTE + 1 and SUR - 1 < c[1] < NORTE + 1 for c in cs)


agua = Image.new('L', (ANCHO * ESC, ALTO * ESC), 0)
d = ImageDraw.Draw(agua)
rios = json.load(open(ENTRADA / 'ne_50m_rivers_lake_centerlines.geojson'))
n = 0
for ft in rios['features']:
    if not ft['geometry']:
        continue
    rango = ft['properties'].get('scalerank') or 6
    grosor = max(1.6, 4.6 - 0.45 * rango) * ESC * ANCHO / 1536
    for cs in lineas(ft['geometry']):
        if not dentro(cs):
            continue
        d.line([a_pix(c[0], c[1]) for c in cs], fill=255, width=int(round(grosor)), joint='curve')
        n += 1
lagos = json.load(open(ENTRADA / 'ne_50m_lakes.geojson'))
for ft in lagos['features']:
    for cs in lineas(ft['geometry']):
        if dentro(cs) and len(cs) > 2:
            d.polygon([a_pix(c[0], c[1]) for c in cs], fill=255)
print('ríos dibujados', n)
agua = agua.filter(ImageFilter.GaussianBlur(0.9 * ESC)).resize((ANCHO, ALTO), Image.LANCZOS)
agua_np = np.asarray(agua).copy()
agua_np[sdf <= 0] = 0  # en el mar manda la costa

front = Image.new('L', (ANCHO * ESC, ALTO * ESC), 0)
d = ImageDraw.Draw(front)
for ft in json.load(open(ENTRADA / 'ne_50m_admin_0_boundary_lines_land.geojson'))['features']:
    for cs in lineas(ft['geometry']):
        if dentro(cs):
            d.line([a_pix(c[0], c[1]) for c in cs], fill=255, width=int(round(1.5 * ESC * ANCHO / 1536)), joint='curve')
front = front.filter(ImageFilter.GaussianBlur(0.5 * ESC)).resize((ANCHO, ALTO), Image.LANCZOS)

rgb = np.dstack([(q16 >> 8).astype(np.uint8), (q16 & 255).astype(np.uint8), agua_np])
Image.fromarray(rgb, 'RGB').save(SALIDA / 'alturas.webp', lossless=True, method=6)

# ── color del suelo ──
ne = Image.open(ENTRADA / 'ne2' / 'NE2_LR_LC.tif')
px = 360.0 / ne.size[0]
caja = (int((OESTE - 1 + 180) / px), int((90 - NORTE - 1) / px), int((ESTE + 1 + 180) / px), int((90 - SUR + 1) / px))
rec = np.asarray(ne.crop(caja)).astype(np.float32)
lat0 = 90 - caja[1] * px
lon0 = -180 + caja[0] * px
fila = (lat0 - lat) / px - 0.5
col = (lon - lon0) / px - 0.5
F, C = np.meshgrid(fila, col, indexing='ij')
suelo = np.dstack([map_coordinates(rec[:, :, k], [F, C], order=1, mode='nearest') for k in range(3)])
# La cobertura de Natural Earth pinta el mar de celeste plano: donde hay mar se extiende el color de la costa (así el filtrado
# de la textura no mete un borde celeste en la playa).
tierra = sdf > 0.01
color = suelo.copy()
peso = tierra.astype(np.float32)
for _ in range(6):
    num = np.dstack([gaussian_filter(color[:, :, k] * peso, 3) for k in range(3)])
    den = gaussian_filter(peso, 3)
    relleno = num / np.maximum(den, 1e-4)[:, :, None]
    falta = (peso < 0.5) & (den > 0.02)
    color[falta] = relleno[falta]
    peso = np.where(falta, 1.0, peso)
suelo_img = Image.fromarray(np.clip(color, 0, 255).astype(np.uint8), 'RGB')
# Las fronteras van en el canal alfa (WebP con alfa pesa poco más y ahorra otra descarga)
suelo_img.putalpha(Image.eval(front, lambda v: 255 - v))
suelo_img.save(SALIDA / 'suelo.webp', quality=86, method=6)

json.dump({
    'oeste': OESTE, 'este': ESTE, 'sur': SUR, 'norte': NORTE, 'yNorte': Y_N, 'ySur': Y_S,
    'ancho': ANCHO, 'alto': ALTO, 'altMin': ALT_MIN, 'altMax': ALT_MAX,
    'fuentes': {
        'alturas': 'NOAA NCEI ETOPO 2022 (60 arc-second, surface), doi:10.25921/fd45-gt74, dominio público',
        'suelo': 'Natural Earth II land cover (NE2_LR_LC), dominio público',
        'rios_lagos_fronteras': 'Natural Earth 1:50m, dominio público',
    },
}, open(SALIDA / 'mundo.json', 'w'), ensure_ascii=False, indent=1)
for a in ('alturas.webp', 'costa.webp', 'suelo.webp', 'mundo.json'):
    print(a, (SALIDA / a).stat().st_size // 1024, 'KB')
