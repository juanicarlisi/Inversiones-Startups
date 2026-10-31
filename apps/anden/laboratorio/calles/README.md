# Laboratorio Andén · calles, ruteo y live tracking (30-10-2026)

Prueba de herramientas, no producto. Informe: `conocimiento/radar-tecnico-2026-10/calles-tracking.md`.
No toca `apps/anden/simulador/` ni `apps/juegos/aviacion/`.

## Qué hay

| Carpeta | Contenido |
|---|---|
| `py/` | Pipeline Python: `extraer_osm.py` (PBF BBBike → calles del barrio y huellas), `flota.py` (OSMnx + 300 vehículos por calle con Dijkstra/A\*, orden de paradas con OR-Tools), `escala_caba.py` (red completa de CABA), `valhalla_prueba.py` y `valhalla_caba.py` (Valhalla en proceso), `edificios.py` (huellas Overture con altura) |
| `ch-wasm/` | Jerarquías de contracción: Rust `fast_paths` 1.0.0 → WebAssembly (72 KB, sin wasm-bindgen) |
| `herramientas/` | `build.mjs` (esbuild), `servidor.mjs` (estático con Range), `captura.mjs` (capturas y banco de cuadros con Chromium), `ruteo_escala.mjs` (Dijkstra/A\*/CH-js/CH-WASM a escala ciudad) |
| `web/` | Página: MapLibre GL JS + deck.gl (`TripsLayer`, `ScenegraphLayer`; `HeatmapLayer` sin verificar: no se dibujó en software), tres mapas base (`?base=local\|pmtiles\|ofm`) |
| `capturas/`, `datos/medidas_*.json` | Evidencia |

## Reproducir

```bash
npm ci                                   # versiones fijas; override de tslib por un tarball 404 en el registro
python3 -m venv --system-site-packages .venv && .venv/bin/pip install osmium==4.0.2 overturemaps==1.0.2 pyvalhalla==3.9.1
curl -o datos/BuenosAires.osm.pbf https://download.bbbike.org/osm/bbbike/BuenosAires/BuenosAires.osm.pbf
.venv/bin/python py/extraer_osm.py && .venv/bin/python py/flota.py
node herramientas/build.mjs && node herramientas/servidor.mjs 8765     # http://127.0.0.1:8765/?base=local&n=300
```

Parámetros de la página: `base`, `n` (vehículos), `heads=none|dots|trucks`, `heat=1`, `glow=0|1`, `bld=0|1`, `speed`, `t` (hora fija), `bench=<s>` (mide cuadros; resultado en `window.__bench`), `zoom`, `pitch`, `bearing`.

**Banco de cuadros en GPU real:** abrí `?base=pmtiles&n=3000&heads=dots&bench=10` en el Chrome de tu máquina y leé `__bench` en la consola. Las cifras de este entorno son con render por software (SwiftShader) y no representan una GPU.

## Licencias de lo que entra

- Código: MapLibre GL JS 6.13.0 (BSD-3-Clause), deck.gl 9.4.0 (MIT), pmtiles 4.5.0 y @protomaps/basemaps 5.7.2 (BSD-3-Clause), contraction-hierarchy-js 2.0.0 (MIT), fast_paths 1.0.0 (MIT/Apache-2.0), esbuild 0.28.2 (MIT).
- Datos: © OpenStreetMap contributors (ODbL); Overture Maps Foundation (edificios: ODbL / CC BY 4.0 según fuente); teselas Protomaps (ODbL, atribución OSM).
- Modelo `web/assets/modelos/camion.glb`: Cesium Milk Truck, © 2017 Cesium, CC BY 4.0 (Khronos glTF-Sample-Assets). **Solo laboratorio**: para producto, modelo propio o CC0.
- Fuentes (Noto Sans, SIL OFL) y sprites (derivados de tangrams/icons, MIT) del mapa base, copiados de `protomaps.github.io/basemaps-assets` según el README de ese repositorio (`raw.githubusercontent.com/protomaps/basemaps-assets/main/README.md`, leído el 30-10-2026). Falta el icono `townhall` en los sprites v4: aviso inofensivo.
