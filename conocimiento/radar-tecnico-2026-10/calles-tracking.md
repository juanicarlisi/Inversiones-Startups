# Mapas, ruteo en calle y live tracking de flotas · radar técnico (30-10-2026)

> Frente: mapas, ruteo por calle y seguimiento simulado de grandes flotas para Andén. Laboratorio: `apps/anden/laboratorio/calles/` (no toca `simulador/` ni `juegos/aviacion/`).
> Etiquetas: **HECHO** (fuente y fecha) · **MEDIDO** (reproducible con el laboratorio) · **INFERENCIA** (razonamiento propio).
> Todo lo consultado es del 30-10-2026 salvo que diga otra fecha. No se gastó nada ni se publicó nada.

## 1. Veredicto

1. **Mapa y flota: MapLibre GL JS 6.13.0 + deck.gl 9.4.0 (`TripsLayer`, `ScenegraphLayer`) por el módulo nuevo `@deck.gl/maplibre`, sin React.** Anduvo de punta a punta: 300 vehículos recorriendo calles reales de Villa Crespo, con camiones glTF orientados por rumbo, estelas con desvanecido y edificios extruidos (capturas en `capturas/`). `HeatmapLayer` **no se dibujó** en software (aviso de luma.gl `weightsTexture`): sin verificar. Se escala a 10.000 vehículos / 1,6 M de puntos sin error (el cuadro por software es lento; ver §4.4).
2. **Mapa base sin clave ni servidor propio: PMTiles de Protomaps como archivo estático** (extracto de barrio: 1,6 MB, 38 teselas, 31 pedidos, 5,8 s con el CLI oficial). **OpenFreeMap** queda de respaldo y de desarrollo (sin clave, uso comercial permitido, sin SLA). `tile.openstreetmap.org` no se usa nunca en producto.
3. **Ruteo en el navegador: jerarquías de contracción (`fast_paths`, Rust → WebAssembly, 72 KB) precomputadas en la carga.** Sobre toda CABA (34.662 nodos, 75.324 aristas): **0,069 ms por consulta** contra 2,99 ms de Dijkstra en JS (43×) y 119 ms de Dijkstra en NetworkX (1.700×), con 300/300 respuestas iguales al oráculo. Preparación: 2,9 s. **No hace falta servidor de ruteo para el caso base.**
4. **A\* no es la respuesta:** con una cota admisible real (130 km/h, porque OSM trae `maxspeed` por encima de la tabla) asienta 36% menos nodos pero **no baja el tiempo** (3,6 ms contra 3,0 ms en JS; 113 contra 119 ms en Python). Con una cota «razonable» (60 km/h) fue más rápido pero **dio camino subóptimo en 13 de 300 pares** (MEDIDO). La respuesta es contracción, no heurística.
5. **Servidor de ruteo: Valhalla (pyvalhalla 3.9.1, MIT) como oráculo, matrices, isócronas y map matching; OSRM y GraphHopper no se pudieron medir acá** (§6). `kepler.gl` no se integra.
6. **Lo que más falta no es software: son alturas de edificios.** OSM tiene 356 huellas en el barrio (25% con pisos); Overture 9.019, pero solo 94 con altura o pisos. El 3D urbano real necesita un dato de alturas (§6).

## 2. Elección (una por necesidad)

| Necesidad | Elegido · versión · fecha · licencia | Por qué | Regla de corte / reemplazo |
|---|---|---|---|
| Motor de mapa | **MapLibre GL JS 6.13.0** (06-10-2026) · BSD-3-Clause | Estándar abierto, sin clave; `fill-extrusion` para edificios; es el motor que soporta `@deck.gl/maplibre` | v6 es ESM-only, sin `export default` y con *worker* aparte (`maplibre-gl-worker.mjs`, servirlo como `text/javascript`). Si un dispositivo objetivo no lo soporta, bajar a 5.24.0 (probado también) |
| Capas de flota | **deck.gl 9.4.0** (05-09-2026) · MIT, vía **`@deck.gl/maplibre` 9.4.0** (`MapLibreOverlay`, modo *interleaved*) | `TripsLayer` con atributos binarios (`startIndices`) toma 49 mil puntos sin tocarlos; `ScenegraphLayer` pone modelos glTF | **No usar `@deck.gl/mapbox` con MapLibre 6**: 9.4.0 y 9.4.1 fallan (`Cannot read properties of undefined (reading 'height')`) porque MapLibre 6.0.0 quitó `map.transform` (CHANGELOG). Sin React hasta que la interfaz lo pida |
| Mapa base | **PMTiles v3 + Protomaps (build 20261029) + `@protomaps/basemaps` 5.7.2** (BSD-3; datos ODbL) · `pmtiles` 4.5.0 (BSD-3) | Un archivo estático con pedidos *Range*: cero servidor, cero clave, cero costo por vista; estilo oscuro en español; barrio de 1,6 MB | Respaldo: OpenFreeMap (`styles/dark`). Cambiar si el extracto por ciudad pasa de ~50 MB o si Protomaps cambia el esquema (v4 hoy) |
| Edificios | **Huellas Overture (release 2026-10-21.0)** + `fill-extrusion` | 9.019 huellas contra 356 de OSM en 2,1 × 1,7 km | **Alturas sintéticas** en lo que no tiene dato (marcado `s` en el GeoJSON): solo contexto visual. Reemplazar con un dato de alturas real antes de mostrar a un cliente |
| Ruteo en navegador | **`fast_paths` 1.0.0 → WASM** (MIT/Apache-2.0, 04-05-2024) | 43× sobre Dijkstra JS a escala ciudad; 72 KB; serialización 32 bits documentada para WASM | Sin versión nueva desde 05-2024 (INFERENCIA: mantenimiento bajo). Si falla o hay que sumar giros prohibidos/tráfico denso: Valhalla o OSRM en servidor, con costo medido |
| Dijkstra/A\* de respaldo | **Propio (CSR + heap binario, 60 líneas)** | 3 ms a escala CABA con pesos que cambian (tráfico); la contracción es estática | Es glue de negocio, no un motor: no hay alternativa que lo justifique |
| Servidor de ruteo / oráculo | **Valhalla 3.9.1** (pyvalhalla, MIT) | Corre en proceso, tiles de CABA en 5,3 s, ruta, matriz, isócrona, *map matching* y TSP | OSRM/GraphHopper: ver §6. Pasar a servicio solo si se necesita tráfico en vivo o matrices > 1000² |
| Extracción de red | **OSMnx 2.1.1 + extracto BBBike (PBF, réplica 24-10-2026)** | Grafo dirigido y simplificado en 0,2 s (barrio) / 20 s (CABA) | Si hace falta frescura diaria: `pyosmium` sobre un extracto de Geofabrik (`download.geofabrik.de` no respondió desde este entorno) |
| Optimización de rutas | **OR-Tools 9.15 (TSP con GLS) sobre matriz Dijkstra** | 300 TSP de 7 puntos + 2.100 Dijkstra en 12 s | VRP de flota completa: PyVRP / OR-Tools sin cambios (otro frente) |
| Explorador manual | **kepler.gl: no integrar** (MIT; npm `3.3.0-alpha.19`) | Es una aplicación React/Redux cerrada, en alfa; no se embebe en un simulador sin React | Útil solo como visor ad hoc de CSV/GeoJSON del analista |

## 3. Evidencia verificada en fuente oficial (HECHO; las citas entre « » son traducción mía)

- **TripsLayer:** `getPath`, `getTimestamps`, `currentTime`, `trailLength`, `fadeTrail`; las marcas de tiempo son **float32** (restar una base: un epoch en segundos pierde precisión) — deck.gl docs, `api-reference/geo-layers/trips-layer`, 30-10-2026. No documenta cifras de rendimiento.
- **deck.gl 9.4:** módulo nuevo `@deck.gl/maplibre` «con MapLibre v4, v5 y el recién lanzado v6»; WebGPU «experimental, no recomendado para producción» — deck.gl `whats-new`, 30-10-2026. La guía de `@deck.gl/mapbox` todavía cita MapLibre 5.0.0 y admite v3+ en modo *interleaved* (`api-reference/mapbox/overview`).
- **MapLibre 6.0.0:** «El `map.transform` interno se eliminó» — `CHANGELOG.md` del repositorio (raw.githubusercontent.com), 30-10-2026. Versiones 6.13.0 (06-10) y 6.16.0 (25-10) en npm; 5.24.0 (23-04) es la última 5.x.
- **PMTiles:** archivo único de pirámides de teselas, servido por *Range* desde almacenamiento estático; especificación v3 — docs.protomaps.com/pmtiles. `pmtiles extract --bbox --maxzoom` desde URL remota — docs.protomaps.com/pmtiles/cli. Registro con MapLibre: `maplibregl.addProtocol("pmtiles", new Protocol().tile)`.
- **Protomaps basemap:** «distribuido como Obra Producida bajo ODbL (se exige atribución a OpenStreetMap)»; los *hotlinks* a las descargas «están desaconsejados» y recomiendan copiar el archivo a almacenamiento propio — docs.protomaps.com/basemaps/downloads. Planeta ≈ 120 GB (el build 20261029 mide 139 GB según el encabezado `Content-Range`).
- **OpenFreeMap:** «completamente gratis, sin límites de vistas ni pedidos; sin registro, sin claves, sin cookies»; uso comercial permitido; «no ofrezco SLA»; descargas sin conexión hasta 3.000 teselas o 50 MB con 4 pedidos paralelos y *User-Agent* único; autoalojable y de código abierto — openfreemap.org y /quick_start. Atribución: «OpenFreeMap © OpenMapTiles Data from OpenStreetMap».
- **Servidor de teselas de OSM:** el uso intensivo puede bloquearse, «los servicios comerciales... el acceso puede retirarse en cualquier momento», sin SLA, **«el uso sin conexión no está permitido»**, atribución visible, *User-Agent* propio — operations.osmfoundation.org/policies/tiles/.
- **ODbL / atribución:** crédito «OpenStreetMap» con enlace a /copyright en una esquina del mapa; las **bases de datos derivadas** deben ofrecerse bajo ODbL si se usan públicamente; los resultados de ruteo no arrastran atribución si no forman una base derivada — osmfoundation.org, *Attribution Guidelines*. **Implicancia (INFERENCIA, a confirmar con asesor):** el extracto PMTiles y el grafo de calles que se publiquen son bases derivadas → publicarlos bajo ODbL.
- **Overture:** tema *buildings* bajo ODbL; fuentes: OSM (ODbL), Microsoft ML (ODbL), Google Open Buildings (CC BY 4.0), Esri (CC BY 4.0) y otras. Crédito: «© OpenStreetMap contributors, Overture Maps Foundation» — docs.overturemaps.org/attribution (actualizada 15-05-2026). Release usado: `2026-10-21.0` (listado del bucket S3 público).
- **OSRM:** BSD-2-Clause; CH y MLD; enlaces Node `@project-osrm/osrm` 26.10.0 (01-10-2026) — github.com/Project-OSRM/osrm-backend y npm. **Valhalla:** MIT; ruta, matriz, isócronas, *map matching*, TSP; paquetes `pyvalhalla` (PyPI 3.9.1) y `@valhallajs/valhallajs` 3.7.0 (npm, 29-04-2026). **GraphHopper:** Apache-2.0, CH por defecto, versión 11.x, **requiere Java ≥ 25**; la API comercial de optimización de rutas se basa en `jsprit`, un proyecto abierto aparte — github.com/graphhopper/graphhopper.
- **`fast_paths`:** CH para grafos dirigidos de pesos positivos; `FastGraph` serializable con serde, **`serialize_32` para WASM de 32 bits**, `prepare_with_order` para reponderar un grafo parecido — README en raw.githubusercontent.com/easbar/fast_paths y crates.io (1.0.0, 04-05-2024, MIT/Apache-2.0).
- **kepler.gl:** MIT; «construido sobre MapLibre GL y deck.gl»; se embebe como componente React con Redux — docs.kepler.gl.

## 4. Prueba real (MEDIDO)

Entorno: 4 núcleos **compartidos con otros agentes** (carga 6–13 durante las mediciones), Node 22.22, Chromium 141 con WebGL por **SwiftShader (software)**, sin GPU. Cifras de render = piso; cifras de ruteo = confiables (CPU, una sola hebra).

### 4.1 Datos y flota (barrio: Villa Crespo y entorno, 2,1 × 1,7 km)

| Paso | Resultado |
|---|---|
| Extracto BBBike `BuenosAires.osm.pbf` (38,7 MB, réplica 2026-10-24) → vías transitables | 560 vías → **424 nodos, 839 aristas, 76,7 km dirigidos** (componente fuertemente conexa) |
| Flota | 300 vehículos, 3 depósitos, 6 paradas c/u + regreso, 90 s de servicio; orden de paradas OR-Tools (TSP, GLS 30 ms) sobre matriz Dijkstra: **12,2 s** para 2.100 Dijkstra + 300 TSP |
| Tramos por calle | 2.088: Dijkstra 0,215 ms, A\* 0,176 ms (NetworkX); **mismo tiempo de viaje en 2.088/2.088** |
| Resultado | **49.183 puntos, 580 KB binario (203 KB comprimido)**, 1.936 km recorridos, jornada de 43 min |
| Velocidades | 8–28 km/h por tipo de vía: **INFERENCIA** (reparto con tránsito), no son límites legales |
| Edificios | OSM: 356 huellas (89 con pisos, 1 con altura). Overture: **9.019** (8.418 Google, 372 OSM, 229 Microsoft); 93 con pisos, 1 con altura → alturas **sintéticas** en 8.926 |

### 4.2 Ruteo a escala ciudad (CABA completa, 300 pares aleatorios, respuesta de referencia = Dijkstra de NetworkX)

| Método | Preparación | ms por consulta | Correctas | Nota |
|---|---|---|---|---|
| NetworkX Dijkstra / A\* | — | 119 / 113 | 300/300 | A\* con cota 130 km/h |
| JS Dijkstra propio (CSR + heap) | 0 | **2,99** | 300/300 | 17.684 nodos asentados |
| JS A\* propio | 0 | 3,62 | 300/300 | 11.356 nodos asentados |
| `contraction-hierarchy-js` 2.0.0 (JS puro) | **224 s** | 2,06 | 300/300 | Solo 1,5× sobre Dijkstra: descartado |
| **`fast_paths` → WASM (Rust)** | **2,9 s** | **0,069** | 300/300 | 181.323 aristas con atajos; camino completo (99 nodos) 0,051 ms; 72,6 KB |
| Valhalla 3.9.1 en proceso | 5,3 s (tiles 11,2 MB) | mediana 20,4 · p95 37 | 300/300 | Incluye maniobras y JSON; matriz 50×50: **5,4 s**; isócrona 10/20 min: 117 ms |

Red: 35.143 nodos OSMnx → 34.662 en la componente fuerte; carga OSMnx 20 s. Barrio con Valhalla: tiles 1,1 s, ruta mediana 1,9 ms, matriz 40×40 118 ms, isócrona 12 ms, *map matching* de 40 puntos 13 ms, TSP de 8 puntos 39 ms.

### 4.3 Mapa y animación (capturas en `apps/anden/laboratorio/calles/capturas/`)

`01` local sin red (calles GeoJSON + edificios Overture) · `03` Protomaps PMTiles · `04` OpenFreeMap · `05` camiones a nivel de calle · `06` intento de mapa de calor (las estelas se ven; **la capa de calor no apareció**, queda sin verificar en GPU) · `07` vista cenital de trazas. Sin errores de mapa en ninguna; único aviso: falta el icono `townhall` en los *sprites* v4. Peso de la página: JS 2,3 MB (**637 KB comprimido**: MapLibre + deck.gl + pmtiles + estilo), datos de flota 203 KB, edificios 267 KB, PMTiles 1,6 MB.

### 4.4 Cuadros por segundo (SwiftShader, 640×360, sin edificios ni halo salvo donde se indica)

| Escena | Puntos | Cuadros medidos | ms por cuadro, mediana (p95) | JS por cuadro (ms) | Carga CPU |
|---|---|---|---|---|---|
| 300 viajes · solo estelas | 49.183 | 10 | 1.800 (3.950) | 0,3 | 7,3 |
| 300 · estelas + puntos | 49.183 | 10 | 3.133 (4.283) | 0,7 | 6,9 |
| 1.000 · estelas + puntos | 164.086 | 10 | 6.666 (10.816) | 1,1 | 10,9 |
| 3.000 · estelas + puntos | 491.830 | 5 | 21.282 (29.866) | 2,1 | 8,1 |
| 10.000 · estelas + puntos | 1.639.576 | 2 | 86.480 | 10 | 11,0 |
| 300 · estelas + camiones glTF | 49.183 | 10 | 2.167 (11.099) | 0,8 | 6,2 |
| 3.000 · estelas + camiones glTF | 491.830 | 5 | 24.066 (30.249) | 1,9 | 6,9 |
| 300 · completa: halo + 9.019 edificios + camiones, mapa local | 49.183 | 10 | 7.183 (12.300) | 1,0 | 10,8 |
| 300 · completa con Protomaps (71 capas, etiquetas) | 49.183 | 10 | 7.350 (20.632) | 0,7 | 9,5 |
| 1.000 · puntos, extremos redondeados / rectos (misma sesión) | 164.086 | 8 / 10 | 10.550 / 9.316 | 0,7 / 0,9 | 10,6 / 11,3 |

El ruido entre corridas es de ±50% (la máquina se comparte): 300 viajes con camiones dio 2,2 s y con puntos 3,1 s. Solo cuentan los órdenes de magnitud.

**Lectura honesta:** con render por software la cifra no dice nada de una GPU; sí dice que el costo de dibujo crece **lineal con los viajes** (300 → 1,8 s; 1.000 → 6,7 s; 3.000 → 21 s; 10.000 → 86 s) y que el trabajo de JavaScript por cuadro es despreciable (0,3 ms con 300 viajes; ~10 ms con 10.000). **FPS en GPU real: NO MEDIDO.** Quedó listo el banco: `?base=pmtiles&n=3000&heads=dots&bench=10` y leer `window.__bench`.

## 5. Integración con Andén

- **Contrato de trazas.** El motor ya emite `traza`; un adaptador `traza → viajes` produce tres vistas tipadas: `Float32Array` de `[lon,lat]`, `Float32Array` de segundos desde una base (restar la base: float32), `Uint32Array` de inicios. Es el formato de `web/datos/viajes.bin`; cero copias hacia `TripsLayer`. Simulaciones de varios días: una base por día.
- **Cabezas de vehículos.** Cursor monótono por vehículo (O(V) por cuadro, 10 ms con 10.000) e interpolación lineal; rumbo del segmento activo. **`getOrientation` como atributo binario no se aplicó en `ScenegraphLayer` (MEDIDO en capturas); con *accessor* sí.**
- **Ruteo.** Preproceso en Python (OSMnx → grafo CSR, 1,8 MB para CABA) → `fast_paths` prepara en 3 s en el navegador (o se serializa con `serialize_32`). El nodo de última milla del simulador pide caminos a 0,07 ms. Pesos con tráfico: Dijkstra JS (3 ms) o reponderar con `prepare_with_order`. Misma cadena Rust → WASM que el diseño maestro prevé para el VRP (§ «Optimizador adentro»): un solo espacio de trabajo de Rust.
- **Servidor opcional.** Valhalla en proceso solo en CI/laboratorio como oráculo del tiempo de viaje y para matrices; nada se despliega ni se paga sin OK (regla 8).
- **Atribución en el mapa** (ya implementada): «© OpenStreetMap contributors · Overture Maps Foundation»; con OpenFreeMap suma «OpenFreeMap © OpenMapTiles».

## 6. Riesgos y lo que NO se verificó

- **FPS en GPU real: no medido.** Todo el render fue por software con la máquina compartida. Se necesita una medición en 1 notebook y 3 teléfonos antes de fijar techos de vehículos.
- **Alturas de edificios.** No hay dato de alturas utilizable en OSM ni en Overture para el barrio. Fuente local posible: portal de datos de la Ciudad (`data.buenosaires.gob.ar` cortó la conexión desde este entorno: **no verificada**). Sin ese dato el 3D urbano es decorado, no simulación.
- **OSRM:** los binarios del paquete npm 26.10.0 piden `GLIBC_2.43`/`GLIBCXX_3.4.34`; 26.9.0, 26.8.0 y 26.7.0 también fallaron al arrancar (mensaje de librerías, leído truncado); este entorno trae glibc 2.39 y Docker sin servicio. **No se midió.** No se afirma nada sobre su rendimiento. **GraphHopper:** pide Java ≥ 25 (acá hay 21) y el JAR está en GitHub Releases (bloqueado): **no se midió**.
- **Realismo del ruteo propio:** el grafo de OSMnx no trae giros prohibidos, semáforos ni tráfico; las velocidades son una tabla. Valhalla (u OSRM) sí modela restricciones: usarlo para validar el tiempo de viaje antes de prometer exactitud.
- **`fast_paths`:** última versión 05-2024; los pesos son estáticos (reponderar solo si el grafo cambia poco).
- **Cadena de suministro:** `tslib 2.9.1` figura en el registro de npm pero **su tarball da 404**; se fija `tslib 2.8.1` con `overrides`. `go install` del CLI de PMTiles tardó 4 min y bajó 83 MB de binario (no se versiona).
- **Licencias de lo que se ve:** el camión de pruebas es *Cesium Milk Truck* (© 2017 Cesium, CC BY 4.0): solo laboratorio. Fuentes Noto Sans (OFL) y *sprites* (MIT, de tangrams/icons) por el README de `basemaps-assets`. Publicar el extracto de barrio o el grafo obliga a ODbL (INFERENCIA, a confirmar).
- **No hecho:** revisión independiente por un agente distinto (este hilo no tenía cómo lanzarlo); WebGPU; `HeatmapLayer` en GPU real, `HexagonLayer` y `kepler.gl` embebido; 3D de calles con terreno; ruteo con giros.

## 7. Próximos pasos (por valor esperado)

1. Medir en GPU real (notebook y teléfonos) con el banco listo y fijar los techos de vehículos. Extremos redondeados vs rectos: −12% en software, dentro del ruido: no es la palanca.
2. Resolver las alturas: dato oficial de la Ciudad o modelo de alturas; mientras tanto, mostrar los edificios como volumen neutro.
3. Paquete `mapa/` bajo el contrato del simulador (adaptador de trazas, fábrica de capas, estilos, cursor de cabezas) y prueba de equivalencia contra la traza del motor.
4. `fast_paths` con `serialize_32` precomputado por ciudad + prueba de equivalencia contra Valhalla en 1.000 pares (tolerancia de tiempo declarada).
5. Reponderación por tráfico simulado (`prepare_with_order`) y medida de cuánto tarda con cambio del 5% de aristas.
6. OSRM/GraphHopper en CI con Docker de verdad, solo si una matriz grande lo pide.

## 8. Reproducir

```
cd apps/anden/laboratorio/calles && npm ci
python3 -m venv --system-site-packages .venv && .venv/bin/pip install osmium==4.0.2 overturemaps==1.0.2 pyvalhalla==3.9.1
curl -o datos/BuenosAires.osm.pbf https://download.bbbike.org/osm/bbbike/BuenosAires/BuenosAires.osm.pbf
.venv/bin/python py/extraer_osm.py && .venv/bin/python py/flota.py && .venv/bin/python py/escala_caba.py
.venv/bin/overturemaps download --bbox=-58.4560,-34.6080,-58.4330,-34.5930 -f geojson -t building -o datos/edificios_overture.geojson && .venv/bin/python py/edificios.py
cargo build --release --target wasm32-unknown-unknown --manifest-path ch-wasm/Cargo.toml   # copiar a web/ch_wasm.wasm
node herramientas/ruteo_escala.mjs              # Dijkstra, A*, CH-js, CH-WASM (SIN_CHJS=1 salta los 224 s)
.venv/bin/python py/valhalla_prueba.py && .venv/bin/python py/valhalla_caba.py
node herramientas/build.mjs && NODE_PATH=/opt/node-tools/node_modules node herramientas/captura.mjs todo
```
Extracto PMTiles: `go install github.com/protomaps/go-pmtiles@latest` y `go-pmtiles extract https://build.protomaps.com/20261029.pmtiles web/datos/barrio.pmtiles --bbox=-58.4600,-34.6120,-58.4290,-34.5890 --maxzoom=15`. Resultados en `datos/medidas_*.json`. Parámetros de la página: ver `README.md` del laboratorio.

## 9. Fuentes (consultadas el 30-10-2026)

deck.gl docs: TripsLayer, `mapbox/overview`, `whats-new` · registro npm de deck.gl, @deck.gl/*, maplibre-gl, pmtiles, @protomaps/basemaps, contraction-hierarchy-js, @project-osrm/osrm, @valhallajs/valhallajs, kepler.gl, esbuild, tslib · CHANGELOG de maplibre-gl-js (raw.githubusercontent.com) · docs.protomaps.com (pmtiles, maplibre, cli, basemaps/downloads) y `protomaps/basemaps-assets` · openfreemap.org y /quick_start · operations.osmfoundation.org/policies/tiles · osmfoundation.org/wiki/Licence/Attribution_Guidelines · docs.overturemaps.org/attribution y bucket `overturemaps-us-west-2` · github.com/Project-OSRM/osrm-backend, valhalla/valhalla, graphhopper/graphhopper · docs.kepler.gl · raw.githubusercontent.com/easbar/fast_paths y crates.io · download.bbbike.org (BuenosAires) · PyPI pyvalhalla 3.9.1, overturemaps 1.0.2 · KhronosGroup/glTF-Sample-Assets (CesiumMilkTruck).
