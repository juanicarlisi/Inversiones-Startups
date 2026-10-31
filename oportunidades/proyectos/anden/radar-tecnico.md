# Andén y Hub Nocturno · Radar técnico (30-10-2026)

> **Qué es.** La decisión del arquitecto jefe, necesidad por necesidad, sobre qué herramienta usan Andén (simulador logístico) y Hub
> Nocturno (juego para portales). Aplica la regla 10 de `CLAUDE.md`, `doctrina/09-herramientas-especializadas.md` y la directriz técnica
> del 30-10-2026 (DEC-2026-10-30-5). El plan que usa estas decisiones está en `corte-2-plan.md`.
>
> **En qué se apoya.** Cinco frentes con pruebas reales, todos del 30-10-2026:
> - Informes en `conocimiento/radar-tecnico-2026-10/`: `3d-cd.md`, `calles-tracking.md`, `optimizacion.md`, `simulacion-tableros.md` y `juego.md`.
> - Pruebas en `apps/anden/laboratorio/{3d,calles,ruteo,simulacion}/` y en `apps/juegos/aviacion/laboratorio/`.
>
> El arquitecto agregó tres cosas el 31-10-2026:
> - volvió a verificar las versiones en los registros oficiales (npm, PyPI, crates.io);
> - corrió el oráculo SimPy contra el motor actual (§5, punto 11);
> - revisó a ojo las capturas del 3D y del mapa (§4).
>
> **Etiquetas** (`doctrina/02-estandares-de-evidencia.md`): **HECHO** (fuente oficial y fecha), **MEDIDO** (reproducible con el laboratorio
> que se cita), **INFERENCIA** (razonamiento propio). No se gastó ni se publicó nada.

## 0. Límites de la evidencia (leer antes que las tablas)

1. **Ninguna medición se hizo en una GPU real.** El entorno solo tiene WebGL por software (SwiftShader).
   - Toda cifra de cuadros por segundo de WebGL (3D, deck.gl, PixiJS) es un piso que no sirve para decidir. Sí sirven las comparaciones
     de Canvas 2D, las de CPU y las de ruteo.
   - Los niveles de calidad del 3D y los techos de vehículos del mapa quedan como **HIPÓTESIS** hasta el paquete C2-1 (`corte-2-plan.md`).
2. **La máquina estaba compartida**, con una carga de 3 a 13 sobre 4 CPU. Hay ±40–50% de ruido entre corridas: solo valen las
   diferencias grandes y las que se repitieron.
3. **Falta la revisión independiente por agente** (paso 8 del skill `/herramientas`). No la tuvo ninguno de los cinco frentes ni esta
   síntesis, porque ningún hilo tenía herramienta para lanzar un agente.
   - Lo que hubo: controles mecánicos (validador glTF, equivalencia de imagen GPU/CPU, evaluador cruzado, fallas sembradas).
   - Queda como obligatoria en C2-I, con los archivos a revisar nombrados.
   - El 31-10-2026 un revisor independiente revisó **este radar y el plan** (versiones, licencias, fuentes oficiales y pruebas
     reproducidas), no el código de los laboratorios. Sus correcciones están marcadas «(rev. 31-10)» y listadas en el §7.
4. **No se pudo medir:** OSRM (pide glibc 2.43), GraphHopper (pide Java 25), `HeatmapLayer` de deck.gl, la decodificación de KTX2 en el
   navegador, `WebGPURenderer` (falla en el Chromium 141 de este entorno), Timefold Java, LKH-3 y funciones en el borde. **Sobre ellos no
   se afirma nada.**

## 1. Decisiones en una mirada

| Necesidad | Elegido | Se mantiene de lo construido |
|---|---|---|
| 3D del CD y del hub | three.js 0.186.1 + pmndrs/postprocessing + N8AO; activos con Blender (`bpy`) → glTF Transform + Meshopt | Vistas 2D y 2,5D en Canvas como piso universal |
| Animación y cámara | Curvas y controles de three, fotogramas clave propios; física de Rapier horneada solo para incidentes | Reproductor de tramos del corte 1 (la vista no mueve nada que no esté en la traza) |
| Mapas y seguimiento en vivo | MapLibre GL JS 6.13.0 + deck.gl 9.4.0 por `@deck.gl/maplibre`; PMTiles de Protomaps como archivo propio | — (nuevo) |
| Ruteo en calle | Jerarquías de contracción `fast_paths` 1.0.0 compiladas a WebAssembly; Valhalla 3.9.1 como oráculo en CI | Dijkstra propio en CSR (respaldo con pesos que cambian) |
| VRP | vrp-cli 1.25.0 (WASM) en el navegador; PyVRP 0.14.1 en CI y en servidor (con OK); OR-Tools 9.15 de reserva; VROOM solo como semilla | — (nuevo) |
| Oráculo de simulación | SimPy 4.1.2 (hub y última milla); evaluador de planes independiente; NetworkX y Valhalla para caminos | Motor TypeScript determinista (85 de 85) y su batería |
| Tableros | DuckDB-WASM 1.32.0 + ECharts 6.1.0 por módulo + uPlot 1.6.32, en un trozo aparte | Cien noches con agregación en el Worker; raster de densidad propio |
| Línea de tiempo | Propia (cabezal y momentos) + uPlot para series densas | Cabezal y momentos del corte 1 |
| Interfaz | TypeScript sin framework, esbuild 0.28.2, todo lo nuevo en trozos a demanda | Todo |
| Juego (Hub Nocturno) | Canvas 2D optimizado (4 cambios); PixiJS 8.22.0 solo si cumple su regla de corte en un equipo real | Canvas 2D |

**Política de versiones (vale para todo):**
- Versión exacta en `package.json` / `requirements*.txt` con lockfile.
- Se sube de versión solo si la nueva tiene ≥ 14 días (salvo arreglo de seguridad) y pasan las pruebas de equivalencia del paquete que
  la usa.
- Ejemplo: three 0.187.0 salió el 30-10-2026 (HECHO, npm, 31-10-2026) y por eso se fija 0.186.1. Además (rev. 31-10) `postprocessing`
  6.39.5 declara `three >= 0.168.0 < 0.187.0` (HECHO, `package.json` instalado, 31-10-2026): la 0.187.0 queda fuera de su rango.
- Excepciones de adopción inicial con menos de 14 días al 31-10-2026 (rev. 31-10): `bpy` 5.2.3 (22-10), Streamlit 1.66.1 (21-10) y
  Perspective 5.6.1 (23-10). Ninguna corre dentro del producto (construcción, análisis interno y laboratorio); se vuelve a mirar al abrir
  el paquete que las use.

## 2. Tablas por necesidad

> **Fuente:** «npm» o «PyPI» = el registro oficial (`npm view` o la API JSON de PyPI), consultado el 30-10-2026 por cada frente y de nuevo
> el 31-10-2026. Las demás fuentes son las URL oficiales citadas en cada informe.

### 2.1 3D del centro de distribución y del hub

| Rol | Herramienta · versión · fecha | Fuente oficial | Licencia | Por qué | Prueba que la respalda | Regla de corte |
|---|---|---|---|---|---|---|
| Motor de GPU (única librería de GPU del holding) | **three.js 0.186.1** (24-09-2026), `WebGLRenderer` | github.com/mrdoob/three.js/releases · npm | MIT | 109 KB brotli el motor mínimo, contra 342 KB de Babylon y 212 KB de PlayCanvas. Tiene el ecosistema de glTF, posproceso y AO que el producto necesita, y el simulador no usa React | **MEDIDO** (`3d-cd.md` §4): escena de 5.000 paquetes, 176 bandejas y 523.000 triángulos con sombra, 83 llamadas de dibujo. Empate de velocidad con Babylon (631 ms) y PlayCanvas (481 ms) contra 562 ms de three, dentro del ruido | Cambiar de motor solo si en 3 teléfonos y 1 notebook otro da ≥ 2× a igual calidad |
| Posproceso | **pmndrs/postprocessing 6.39.5** (09-09-2026) + **N8AO 2.0.1** (10-08-2026) | github.com/pmndrs/postprocessing · github.com/N8python/n8ao · npm | Zlib · ISC en el campo `license` de npm, pero el archivo `LICENSE` y el README de N8AO son **CC0 1.0** (rev. 31-10; ambas permisivas) | Bloom, mapeo tonal, viñeta y SMAA en un pase; AO con calidad de producto. Peer de postprocessing: `three < 0.187.0` | **MEDIDO:** bloom, mapeo tonal y SMAA quedan dentro del ruido. N8AO es lo más caro: +30% a +140% | N8AO se apaga en el nivel B, o se reemplaza por AO horneado si un teléfono medio no sostiene 30 fps |
| Fábrica de activos (solo en la construcción, nunca en el producto) | **Blender 5.2.3 como módulo Python `bpy`** (PyPI 22-10-2026) | pypi.org/project/bpy · blender.org/about/license | GPL-3.0 (la herramienta). Lo que produce es nuestro («What you create with Blender is your sole property») | Hace 14 piezas con bisel, UV y PBR en ≈ 2 s, sin interfaz y reproducibles con `npm run activos` | **MEDIDO:** activos validados con 0 errores y 0 avisos en gltf-validator | Los scripts que importan `bpy` viven en el repositorio privado y nunca se distribuyen |
| Optimización glTF | **glTF Transform 4.5.1** (28-09-2026) + **meshoptimizer 1.3.0** (25-09-2026); **gltf-validator 2.0.0-dev.3.10** en CI | gltf-transform.dev · github.com/zeux/meshoptimizer · github.com/KhronosGroup/glTF-Validator · npm | MIT · MIT · Apache-2.0 | Meshopt tiene decodificador chico y ya viene en three. `gltf-validator 2.0.0-dev.3.10` es del 22-10-2024 y sigue siendo la `latest` de npm (HECHO, 31-10-2026; rev. 31-10) | **MEDIDO:** 225 KB → 101 KB con Meshopt (Draco: 50 KB) | Pasar a Draco si los activos superan ~5 MB |
| Paquetes por instancias | `InstancedMesh` con atributos por instancia; **vía A**: `posicionesAMatrices()` desde `Reproductor.posiciones()` | — (three) | MIT | Usa el contrato congelado sin tocarlo; la CPU cuesta 0,51 ms con 5.000 entidades, 1,7 ms con 20.000 y 7,6 ms con 100.000 | **MEDIDO:** equivalencia GPU/CPU con 1,3% de píxeles distintos; el cubo de 12 triángulos con mapa de normales se ve igual que el de 108 y cuesta 15–30% menos | **Vía B** (shader de trayectos) solo por encima de ~100.000 entidades o con el hilo principal ocupado. `@three.ez/instanced-mesh` 0.3.16 (MIT) solo si hay miles de estáticos fuera de cámara |
| Texturas | **ktx2-encoder 0.6.0** (19-07-2026) para KTX2; **Poly Haven** para HDRI y materiales | npm · polyhaven.com/license | MIT · CC0 | Ahorra memoria de GPU, no descarga | **MEDIDO:** 1024²: JPG 116 KB, ETC1S 141 KB. **No verificado:** decodificar en el navegador | Sin la prueba de `KTX2Loader` en un dispositivo real, se queda JPG/WebP |
| Física | **Rapier 0.21.0** (`@dimforge/rapier3d-compat`, 25-09-2026), fuera de línea, con las poses horneadas a JSON | rapier.rs · npm | Apache-2.0 | Sirve para incidentes visibles (derrames, atascos) de eventos que ya están en la traza | **MEDIDO:** apilar por caída da pilas caóticas (273 de 320 paquetes inclinados > 8°) | Nunca para llenar jaulas, que se llenan con grilla por capas. Nunca en tiempo real dentro del producto |
| Descartados | Babylon.js 9.33.1 · PlayCanvas 2.23.3 · R3F 9.8.2 · `WebGPURenderer` r186 · Quaternius | registros oficiales · quaternius.com/license.html | — | Babylon y PlayCanvas pesan más; las *thin instances* de Babylon se dibujan todas o ninguna (doc oficial). R3F agrega React sin tocar el camino caliente. WebGPU **falla** acá (`GPUTextureComponentSwizzle`). Quaternius ya no es CC0 (QAL v1.0) | `3d-cd.md` §2–§4 | WebGPU: reintentar con un Chrome más nuevo y adoptar solo si da ≥ 1,5× en el nivel B, con la misma imagen |

### 2.2 Animación y cámara

| Rol | Herramienta · versión | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Recorridos de cámara y modo director | **`CatmullRomCurve3` + `OrbitControls` de three 0.186.1** (con amortiguación), fotogramas clave y suavizados propios | three.js docs | MIT | Cero dependencias. Lo propio es pegamento (qué toma mostrar en qué momento de la traza) | **MEDIDO:** 3 tomas de recorrido capturadas (`capturas/04`) | Si hace falta un editor visual de líneas de tiempo, revisar Theatre.js; hoy está quieto |
| Personas (operarios) | **Animación de vértices horneada en Blender** (VAT), o esqueleto por instancias si la librería lo soporta (a verificar). Origen: Kenney (CC0, a confirmar en su página oficial) o modelo propio en Blender | kenney.nl/support: «all game assets on the asset pages are public domain licensed (CC0)» (HECHO, 31-10-2026, rev. 31-10); falta confirmar qué pack trae personas con esqueleto | CC0 o propio | Hoy los operarios son bloques sin esqueleto: el delator número 1 de «hecho rápido» | **INFERENCIA:** técnica estándar para multitudes; no medida en este radar | Se elige la variante con 0 delatores en la revisión independiente y ≤ 2 ms de CPU por cuadro con 200 operarios |
| Animación 2D y 2,5D | **Reproductor de tramos propio del corte 1** | `escena/reproductor.ts` | propio | Interpola los tramos de la traza: es el contrato, no un motor genérico | 1.070 pruebas del corte 1 (1.069 pasan y 1 se omite, README del simulador); e2e 16 de 16 en el informe de salida del 30-10 (rev. 31-10: la corrida del 31-10 00:35 en `integracion/salida/e2e.json` dio 13 de 16, con 3 cierres del navegador en 360-oscuro, mientras el corte seguía cerrándose) | Se mantiene |
| Descartados | **Theatre.js** (`@theatre/core` 0.7.2, sin versión nueva desde el 19-05-2024) · **GSAP** 3.15.0 | github.com/theatre-js/theatre · gsap.com/standard-license | Apache-2.0 · propietaria «no charge», no OSI | Theatre.js está quieto; GSAP tiene licencia propietaria con prohibiciones | `3d-cd.md` §2–§3 | GSAP no entra mientras su licencia no sea OSI |

### 2.3 Mapas y seguimiento en vivo (live tracking simulado)

| Rol | Herramienta · versión · fecha | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Motor de mapa | **MapLibre GL JS 6.13.0** (06-10-2026) | github.com/maplibre/maplibre-gl-js (CHANGELOG) · npm | BSD-3-Clause | Estándar abierto, sin clave, `fill-extrusion` para volúmenes | **MEDIDO:** 300 vehículos en Villa Crespo, sin errores de mapa (`calles/capturas/01–07`) | Es ESM-only y su *worker* va aparte. 6.16.0 (25-10-2026) existe; se sube con la regla de versiones. Respaldo: 5.24.0, probado |
| Capas de flota | **deck.gl 9.4.0** (05-09-2026) por **`@deck.gl/maplibre` 9.4.0** (`MapLibreOverlay`, intercalado): `TripsLayer` con atributos binarios, `ScenegraphLayer` y capas de puntos e íconos | deck.gl/docs (trips-layer, whats-new) · npm | MIT | Toma 49.000 puntos sin copiarlos. La documentación anuncia el módulo nuevo para MapLibre 4, 5 y 6 | **MEDIDO:** escala a 10.000 vehículos y 1,6 M de puntos sin error; el JS por cuadro cuesta 0,3 ms con 300 vehículos y ~10 ms con 10.000. **Cuadros por segundo en GPU: no medidos** | **Nunca `@deck.gl/mapbox` con MapLibre 6:** la 9.4.0 y la 9.4.1 fallan porque MapLibre 6.0.0 quitó `map.transform` (HECHO, CHANGELOG) |
| Mapa base | **PMTiles v3 + Protomaps** (build 20261029) + **`@protomaps/basemaps` 5.7.2** + **`pmtiles` 4.5.0**, como archivo estático propio | docs.protomaps.com · npm | BSD-3 (código). Datos ODbL, con atribución a OpenStreetMap | Sin servidor, sin clave y sin costo por vista; Protomaps desaconseja enlazar sus descargas | **MEDIDO:** extracto de barrio de 1,6 MB y 38 teselas en 5,8 s con el CLI | Si el extracto por ciudad supera ~50 MB, bajar el zoom máximo. **Respaldo** (desarrollo): OpenFreeMap (sin clave, uso comercial permitido, sin SLA). **Nunca** `tile.openstreetmap.org` (su política prohíbe el uso sin conexión) |
| Edificios | **Huellas de Overture** (release 2026-10-21.0) | docs.overturemaps.org/attribution | ODbL; incluye fuentes CC BY 4.0, con atribución | 9.019 huellas contra 356 de OSM en el barrio | **MEDIDO:** solo 94 traen altura o pisos | Las alturas sintéticas **nunca** se muestran como reales: volumen neutro y bajo, con rótulo, hasta tener un dato oficial (el portal de la Ciudad no respondió desde acá) |
| Vehículos 3D del mapa | Modelos propios de la fábrica de Blender (§2.1), en `ScenegraphLayer` solo a zoom de calle | — | propio | Mismo lenguaje visual que el hub 3D | — | *Cesium Milk Truck* (CC BY 4.0) queda solo en el laboratorio |
| Piso sin GPU del mapa | **A verificar:** `protomaps-leaflet` 5.1.0 + Leaflet 1.9.4. Si no, Canvas 2D propio sobre el grafo CSR | npm (31-10-2026) | BSD-3 · BSD-2 | El producto abre en cualquier teléfono y Chromium da por obsoleto el WebGL por software (`juego.md` §1.4) | **No medido** (existencia y licencia: HECHO, npm 31-10-2026) | Se elige lo que dibuje 300 vehículos en ≤ 10 ms por cuadro con la CPU frenada 4× |
| Descartados | **kepler.gl** (`3.3.0-alpha.19`) · `HeatmapLayer` (sin verificar) | docs.kepler.gl | MIT | kepler.gl es una aplicación React/Redux cerrada y está en alfa | `calles-tracking.md` §2 | Visor ad hoc del analista, nunca dentro del producto |

### 2.4 Ruteo en calle

| Rol | Herramienta · versión · fecha | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Caminos más cortos en el navegador | **`fast_paths` 1.0.0** (04-05-2024), Rust → WASM de 72 KB, con `serialize_32` | crates.io/crates/fast_paths · github.com/easbar/fast_paths | MIT / Apache-2.0 | 43× más rápido que Dijkstra en JS y 1.700× más que NetworkX, con preparación de 2,9 s | **MEDIDO** (`calles/datos/medidas_ruteo_js.json`, revisado por el arquitecto el 31-10-2026): CABA (34.662 nodos, 75.324 aristas): **0,069 ms por consulta**, 300 de 300 iguales a NetworkX | Sin versión desde 05-2024 (HECHO, crates.io, 31-10-2026): se vendoriza el crate fijado. Si falta algo (giros prohibidos, tráfico denso): Valhalla en servidor con costo medido y OK |
| Pesos que cambian (tráfico simulado) | **Dijkstra propio** (CSR + montículo binario, 60 líneas); `prepare_with_order` para reponderar | — | propio | 3 ms a escala ciudad. Es pegamento, no un motor | **MEDIDO:** 2,99 ms, 300 de 300 | Si reponderar un 5% de aristas con `prepare_with_order` tarda < 1 s, se usa eso |
| Oráculo de tiempos de viaje y matrices (CI y laboratorio) | **Valhalla 3.9.1** (`pyvalhalla`) | github.com/valhalla/valhalla · PyPI | MIT | Ruta, matriz, isócrona, *map matching* y TSP, en proceso; modela restricciones de giro | **MEDIDO:** mediana 20 ms por ruta en CABA; matriz de 50×50 en 5,4 s; tiles en 5,3 s | Pasa a servicio solo con tráfico en vivo o matrices > 1000², con OK |
| Red de calles | **OSMnx 2.1.1** + extracto BBBike (PBF, réplica 24-10-2026) | github.com/gboeing/osmnx · download.bbbike.org | MIT · datos ODbL | Grafo dirigido y simplificado en 20 s para CABA | **MEDIDO** | Si hace falta frescura diaria: `pyosmium` sobre Geofabrik |
| Descartados | **A\*** como algoritmo principal · `contraction-hierarchy-js` 2.0.0 · OSRM 26.10.0 y GraphHopper 11 (no medidos) | — | — | A\* con cota admisible (130 km/h) no baja el tiempo; con 60 km/h es más rápido (1,1 ms contra 3,0–3,7 ms de Dijkstra) pero da camino subóptimo en **39 de 300 pares (13%)** con tolerancia de 0,2% y en 42 con 1 ms; con 80 km/h, en 2 de 300 (rev. 31-10: el informe decía «13 de 300», que no se reprodujo, probable confusión con el 13%). La contracción en JS tarda 224 s en prepararse y solo gana 1,5× | **MEDIDO** (`calles-tracking.md` §4.2; el recuento de la cota la reprodujo el revisor el 31-10-2026 con `ruteo_escala.mjs` y la cota cambiada) | OSRM y GraphHopper se prueban en CI con Docker solo si una matriz grande lo pide |

### 2.5 Optimización de rutas (VRP)

| Rol | Herramienta · versión · fecha | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Motor en el navegador (respuesta inmediata y replanificación) | **vrp-cli 1.25.0** (crates.io, 10-11-2024), Rust → WASM en Worker, con varias semillas en paralelo | crates.io/crates/vrp-cli · github.com/reinterpretcat/vrp | Apache-2.0 | Arranca en 0,08–0,11 s, pesa 0,81 MB comprimido, licencia permisiva | **MEDIDO:** CABA, 200 paradas, flota dominante: 485–514 USD a 10 s (PyVRP: 502–538). Con el ruteo pesando, **12,7% peor** que PyVRP (105,0 contra 93,2) | La «1.26.0» **no está publicada** (rev. 31-10): crates.io tiene como máximo la 1.25.0 y no hay etiqueta `v1.26.0` en github.com/reinterpretcat/vrp/tags (consulta del 31-10-2026); es la versión de trabajo de `master`, con su CHANGELOG en `[Unreleased]` y cambios que rompen el formato. Se fija 1.25.0, la última publicada. Si en las instancias de la plantilla 3 queda > 3–5% sobre la vara, manda el spike de PyVRP en WASM (abajo) |
| Optimizador de calidad, vara de comparación en CI y servidor | **PyVRP 0.14.1** (16-10-2026), nativo | pypi.org/project/pyvrp · github.com/PyVRP/PyVRP · arXiv 2403.13795 | MIT | Mejor en benchmarks publicados y en ruteo puro. Ventanas, flota heterogénea, recarga en depósito y arranque en caliente | **MEDIDO:** Solomon y Gehring-Homberger a 10 s: **0,27%** de brecha contra 3,15–6,5% de OR-Tools, y 0 de 36 corridas infactibles (OR-Tools: 3). Con el ruteo pesando gana por 6–9%. **Pero** con 400 paradas y flota dominante OR-Tools fue 9% mejor (843,9 contra 929,2; una semilla) | Servidor solo con OK del fundador (≈ USD 0,00024 por solución de 10 s, INFERENCIA con el precio de Cloud Run, a verificar en vivo; rev. 31-10: la página oficial de precios no se pudo leer completa desde acá, así que el USD 0,000024 por vCPU-segundo sigue SIN VERIFICAR en la fuente) |
| Spike: PyVRP en el navegador sin Pyodide | **Núcleo C++ de PyVRP → WASM directo** (Emscripten) + porte a TypeScript del bucle ILS y del manejo de penalidades (≈ 550 líneas Python) | github.com/PyVRP/PyVRP | MIT | Daría la calidad de PyVRP sin los 9,9 MB ni la licencia MPL de Pyodide | **No construido.** Lo que sí se midió: el bucle Python tiene 290 + 259 líneas (`IteratedLocalSearch.py`, `PenaltyManager.py`, 31-10-2026) | Se adopta si reproduce el plan nativo exacto a 3.000 iteraciones, en ≤ 2× el tiempo nativo y con ≤ 1,5 MB brotli. Si no, se descarta |
| Reserva | **OR-Tools 9.15.6755** (14-01-2026) | pypi.org/project/ortools | Apache-2.0 | Restricciones raras; ganó en la instancia de 400 paradas | **MEDIDO** (arriba) | Entra a la cartera del servidor (con OK) si en instancias ≥ 400 paradas sigue ganando con 3 semillas |
| Semilla del lote en servidor | **VROOM 1.15** (`pyvroom` 1.15.2, 22-04-2026) | github.com/VROOM-Project/vroom · PyPI | BSD-2 | Encuentra mezclas de flota que PyVRP no ve | **MEDIDO:** VROOM → PyVRP bajó 11% en 1 de 7 corridas y 6% en 2 de 7. No expresa la jornada máxima (su nivel 5 dio una solución infactible) | Nunca es respuesta final: siempre pasa por PyVRP y por el evaluador |
| Juez de todos | **Evaluador independiente** (`ruteo/py/modelo.evaluar` → TypeScript) | laboratorio | propio | Elige el mejor plan con una sola vara, no con lo que dice cada solucionador | **MEDIDO:** contra PyVRP, costo idéntico y 0 s de diferencia de duración en 6 rutas. Se encontró y corrigió un error propio | Es pegamento del negocio: se mantiene |
| Descartados | **PyVRP en Pyodide 314.0.7** (fuera del producto) · jsprit 2.0.0 · Timefold · genético propio | pyodide.org · github.com/graphhopper/jsprit · github.com/TimefoldAI/timefold-solver-python | MPL-2.0 · Apache-2.0 · — | Pyodide funciona (misma solución que nativo) pero es **5,1× más lento**, baja **9,9 MB** y es MPL-2.0 (por el mismo criterio quedó afuera mediabunny, `diseno-maestro.md` §4.13). jsprit da +17% de costo. Timefold Python está archivado desde el 06-10-2025. PyVRP ya es la implementación de referencia | `optimizacion.md` §2, §4.6 | Pyodide queda en el laboratorio. Volver a mirarlo solo si el spike falla y el fundador acepta la excepción de licencia |

### 2.6 Oráculo de simulación

| Rol | Herramienta · versión | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Oráculo independiente del motor del hub (y, en el corte 2, de la última milla) | **SimPy 4.1.2** (24-05-2026) + numpy 2.5.3, con los dorados congelados y la prueba en `node --test` sin Python | pypi.org/project/simpy · simpy.readthedocs.io | MIT | Otro paradigma (procesos, no calendario propio) y otro código | **MEDIDO el 30-10, contra el motor 1.1.0:** 5 modelos exactos con 24 de 24 KPI al milisegundo; 6 comparaciones estadísticas en verde (F2 20/20 y F3-lite 24/24, \|z\| máx. 2,36); fallas sembradas: 6 de 6 sumando los dos pisos. **MEDIDO el 31-10, contra el motor 1.2.0:** 6 de 9 (§5, punto 11) | Si el motor cambia una regla a propósito, se actualiza el oráculo y el dorado nuevo forma parte del cambio de versión |
| Ancla externa | **Batería propia contra teoría de colas** (85 exigibles) | `apps/anden/simulador/verificacion/` | propio | Lo que ninguna herramienta publica | 85 de 85 (`informe-salida.json`) | Se mantiene |
| Oráculos de caminos y de planes | NetworkX 3.7 (Dijkstra), Valhalla 3.9.1 (tiempo de viaje) y el evaluador de planes | PyPI | BSD-3 · MIT · propio | Verificación cruzada de las piezas nuevas | **MEDIDO:** SciPy contra NetworkX con error máx. de 0,5 s y 0,49 m | — |

### 2.7 Tableros

| Rol | Herramienta · versión · fecha | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Consultas sobre N noches (modo análisis) | **DuckDB-WASM 1.32.0** (16-12-2025), bundle `eh`, autoalojado | github.com/duckdb/duckdb-wasm · npm | MIT | 5 consultas en 12–70 ms sobre 809.800 paquetes; el doble de rápido que JS a mano | **MEDIDO** (`simulacion-tableros.md` §4.3): tablero completo en 2,8 s desde cero | **Fijar exacto:** en npm la etiqueta `latest` apunta a `1.33.1-dev57.0`, una versión de desarrollo (HECHO, `npm view dist-tags`, 31-10-2026). La etiqueta `v1.33.0` de GitHub («no real differences from 1.32.0») nunca llegó a npm (rev. 31-10). Pesa 4,9 MB brotli: solo en el trozo de análisis. Sus dependencias son MIT/Apache-2.0 (`apache-arrow` anidado trae `json-bignum`, MIT en su campo legacy `licenses`) |
| Gráficos agregados | **ECharts 6.1.0** (19-05-2026), importado por módulo (150,9 KB brotli) | echarts.apache.org · npm | Apache-2.0 | Barras, abanicos y mapas de calor de hasta 100.000 elementos | **MEDIDO** | Nunca para nubes de > 100.000 puntos con zoom: 10–15 s por paso |
| Series densas | **uPlot 1.6.32** (14-03-2025), 20,4 KB brotli | github.com/leeoniya/uPlot | MIT | Una línea de 1 M de puntos dibuja en 0,76–1,0 s y hace zoom en ≈ 420 ms | **MEDIDO** | Mantenimiento lento: si un error bloquea, pasar a ECharts por módulo |
| Nube de 1 M de puntos | **Raster de densidad propio** (≈ 40 líneas) | — | propio | Ninguna librería probada lo iguala sin GPU | **MEDIDO:** 32–47 ms y zoom de 37–48 ms, contra ≥ 1,2 s de ECharts | Con interacción por punto: deck.gl con `OrthographicView` (ya está en el trozo del mapa; no se suma otra librería; no medido) |
| Exploración libre (modo ingeniero, opcional) | **Perspective 5.6.1** (`@perspective-dev/*`, 23-10-2026) | perspective-dev.github.io | Apache-2.0 el paquete propio, pero **trae MPL-2.0 por dependencia transitiva**: `leb128` y `buffer-pipe`, vía `pro_self_extracting_wasm` ← `@perspective-dev/viewer` (HECHO, `package-lock.json` del laboratorio, 31-10-2026; rev. 31-10) | Pivotes sin SQL | **MEDIDO:** agrupa 30–100× más lento que DuckDB | **No entra al producto** mientras tenga dependencias MPL-2.0 (mismo criterio que Pyodide y mediabunny); queda en el laboratorio hasta que el fundador acepte la excepción o las dependencias cambien. `@finos/perspective` está deprecado (HECHO, npm) |
| Análisis interno (no es producto) | **Streamlit 1.66.1** (21-10-2026) | pypi.org/project/streamlit | Apache-2.0 | Claude mira resultados en minutos | **MEDIDO:** 200 MB de servidor por sesión; se ve como Streamlit | Nunca en el producto ni en un servidor público. **stlite 1.12.0 descartado:** 22 s en frío y 32 MB |

### 2.8 Línea de tiempo

| Rol | Herramienta | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Cabezal, momentos y etiqueta de la noche | **Propios del corte 1** (`escena/momentos.ts`, `indice-tiempo.ts`) | — | propio | Los momentos salen de la taxonomía causal de la traza; ninguna librería modela eso | e2e 16 de 16 | Se mantiene |
| Series bajo la línea (fila, rampas llenas, personas en pausa) | **uPlot 1.6.32**, sincronizado con el cabezal, en un trozo a demanda | §2.7 | MIT | Liviano y hecho para series temporales | **MEDIDO** (§2.7) | Actualizar el cursor cuesta ≤ 16 ms |
| Video de la escena | WebCodecs + **webm-muxer 5.1.4** (MIT), como fija `diseno-maestro.md` §4.13 | npm | MIT | — (rev. 31-10: npm marca `webm-muxer` como **deprecada**, «superseded by Mediabunny», HECHO 31-10-2026; mediabunny es MPL-2.0, npm 1.65.0, y por eso `diseno-maestro.md` §4.13 lo dejó afuera: la elección vuelve a abrirse en el paquete de video) | **No medido en este radar** | Lo resuelve el paquete de video del corte 2, fuera de este plan |

### 2.9 Interfaz y construcción

| Rol | Herramienta | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Interfaz | **TypeScript «borrable» sin framework** | — | — | React + ReactDOM 19.3.1 suman 58,0 KB brotli y la primera carga ya está en 146,5 de 150 KB. Preact (5,0 KB) no mejora ningún resultado medido | **MEDIDO** (`simulacion-tableros.md` §3; README del simulador) | Preact solo si aparece una pantalla con estado muy anidado que lo justifique |
| Construcción | **esbuild 0.28.2** y **TypeScript 6.0.3** (`tsc` solo revisa tipos) | npm | MIT · Apache-2.0 | Ya probados en el corte 1; corren en 0,2 s. (rev. 31-10: la `latest` de TypeScript en npm es 7.0.2; el corte 1 queda en 6.0.3, que figura en su `package.json`) | corte 1 | Se mantienen; no se sube TypeScript sin las pruebas de equivalencia del corte 1 |
| Carga | **Todo lo nuevo en trozos a demanda** (`vista3d/`, `mapa/`, `reparto/`, `analisis/`) | — | — | La primera carga tiene 3,5 KB de margen | banco del corte 1 | Una prueba del banco falla si la primera carga pasa de 150 KB |

### 2.10 Juego (Hub Nocturno, portales)

| Rol | Herramienta · versión | Fuente | Licencia | Por qué | Prueba | Regla de corte |
|---|---|---|---|---|---|---|
| Mapa del juego | **Canvas 2D optimizado** (propio): capa fija en un lienzo aparte, atlas de siluetas, balizas en 2 `Path2D` por color y caché de `measureText` | `laboratorio/escena/canvas2d-opt.js` | propio | Mismo cuadro, 91% menos llamadas, 0 KB extra y no necesita GPU | **MEDIDO** (`juego.md` §4.1, 300 aviones, intercalado): 34,8 → **48,7 fps** con CPU 1× (+40%) y 7,1 → **10,2** con CPU 4× (+44%). Píxeles distintos: 0,03%. Se repitió en 3 de 3 pruebas | Al mover la cámara, la capa fija se redibuja y el costo vuelve al de hoy (sin pérdida). Se ataca en HN-R2 |
| Capa GPU opcional (efectos) | **PixiJS 8.22.0** (01-10-2026), cargado a demanda, solo con GPU real | github.com/pixijs/pixijs/releases · pixijs.com/8.x/guides/components/renderers | MIT | Agrupa 300 aviones y luces en 1 llamada | **MEDIDO:** paridad visual (1,5%). En su renderer Canvas no mejora (6,4 contra 7,1 fps a 4×). Con WebGL por software no hay cifra válida | **Se adopta solo si**, en un equipo real de 4 GB: ≥ 55 fps con p95 ≤ 25 ms **y** ≥ 20% más que el canvas optimizado, **o** un efecto (bloom, estelas) claramente mejor que con sprites aditivos en canvas |
| Requisitos de los portales | CrazyGames: fluido en un Chromebook de 4 GB, ≤ 50 MB iniciales. Poki: carga < 10 s, guía de ≤ 5 MB iniciales | docs.crazygames.com/requirements/technical · developers.poki.com/guide/requirements-quality (los 10 s) · developers.poki.com/guide/web-engine (los 5 MB iniciales y 8 MB totales; rev. 31-10: esa cifra no está en `requirements-quality`). Los de Poki son guías («what we expect»), no límites duros; CrazyGames: ≤ 50 MB iniciales y desactivación en Chromium OS si no anda fluido en 4 GB (HECHO, 31-10-2026) | — | El peso no decide: todos los candidatos entran | **MEDIDO:** el juego pesa 76 KB brotli; con Pixi, +135 KB | — |
| Descartados | **Phaser 4.2.1** · globo de **three.js 0.187.0** · globo de **MapLibre 6.16.0** · **deck.gl 9.4.1** | phaser.io (renderer Canvas «officially deprecated») · deck.gl (`_GlobeView` experimental) | MIT · BSD-3 | Phaser no tiene respaldo sin GPU y pesa el doble que Pixi. El globo no mejora la lectura del mapa del juego. MapLibre y deck.gl son de Andén | `juego.md` §2, capturas 05–08 | El globo de three (la librería de GPU del holding) queda solo para una toma de título, cargada a demanda |

## 3. Qué se mantiene de lo construido y por qué

| Componente | Por qué se queda | Evidencia |
|---|---|---|
| **Motor de eventos discretos en TypeScript** (núcleo 1.2.0, determinista, azar Philox por dirección, matemática propia) | Supera la teoría de colas y coincide con un oráculo de otro paradigma. Ninguna herramienta da la misma huella bit a bit en cualquier navegador. Reemplazarlo exige una prueba comparativa (DEC-2026-10-30-5) | 85 de 85; R04: Node = Chromium en 95 de 95 claves; SimPy: 24 de 24 KPI exactos en 5 modelos (motor 1.1.0) |
| **Vistas 2D y 2,5D en Canvas** | Son el piso universal. Sin GPU, el 3D da 0,4–3,2 fps y Chromium deprecó el respaldo automático a WebGL por software | `3d-cd.md` §4; `juego.md` §1.4 |
| **Cien noches con agregación en el Worker y mapa de riesgo** | Funcionan y no hay prueba de que algo sea superior. DuckDB solo agrega el análisis por paquete | `simulacion-tableros.md` §5.4 |
| **Línea de tiempo y momentos** | Son la lógica causal del producto | corte 1 |
| **TypeScript sin framework y esbuild** | El margen de la primera carga no admite React | §2.9 |
| **Raster de densidad y Dijkstra en CSR propios** | Código propio que ganó a las librerías en una prueba medida (lo permite la doctrina 09: «resolver lo particular» y justificarlo) | §2.4 y §2.7 |
| **Canvas 2D de Hub Nocturno** | Se optimiza, no se cambia de tecnología | §2.10 |
| **Cadena Python de construcción** (OSMnx, SciPy, NetworkX, SimPy, PyVRP, OR-Tools, ya fijados en `requirements-sim.txt`) | Herramientas de construcción y de CI, no de producto | DEC-2026-10-30-5 |

## 4. Qué se suma o se reemplaza, y con qué evidencia

| Cambio | Tipo | Evidencia | Lo que el arquitecto vio en las capturas (INFERENCIA, 31-10-2026) |
|---|---|---|---|
| Vista 3D del hub: three + posproceso + N8AO + fábrica de activos en Blender | **Se suma** sobre el 2,5D | §2.1 | Se lee como instalación real (contacto, jaulas, numeración, luminarias), pero todavía no parece de «años de desarrollo»: operarios de bloques, vacío negro alrededor, paredes y piso lisos, acoplados sin tractor y con boca negra. Esos delatores pasan a criterio de aceptación (`corte-2-plan.md`, C2-4) |
| Mapa y flota: MapLibre + deck.gl + PMTiles | **Se suma** | §2.3 | Funciona, pero los camiones son más grandes que una manzana, el mapa base muestra comercios y marcas (Dia, Coto, Carrefour) y los colores de las estelas no significan nada. Hace falta escala en metros, nivel de detalle por zoom, estilo sin comercios y color por estado (C2-7) |
| Ruteo por contracción en WASM | **Se suma.** Reemplaza a «Dijkstra/A\*» de la directriz como algoritmo principal | §2.4: A\* no gana; la contracción, 43× | — |
| VRP: vrp-cli en el navegador; PyVRP en CI y en servidor | **Se suma.** Reemplaza al «genético» de la directriz | §2.5 | — |
| Oráculo SimPy en `verificacion/` | **Se suma** | §2.6 | — |
| Trozo de análisis: DuckDB-WASM + ECharts + uPlot | **Se suma** | §2.7 | — |
| Render de Hub Nocturno: canvas optimizado | **Se reemplaza** `dibujar` de `js/render.js`, con la misma interfaz | §2.10: +40% / +44% fps; 0,03% de píxeles distintos | — |
| `diseno-maestro.md` §4.7: «`WebGPURenderer` con respaldo WebGL 2» | **Se reemplaza** por `WebGLRenderer` | `WebGPURenderer` r186 falla en Chromium 141. deck.gl y PixiJS marcan WebGPU como experimental (HECHO, sus docs). Rev. 31-10: el fallo se midió solo con el adaptador WebGPU por software de ese Chromium (para una GPU real es HIPÓTESIS); lo que sostiene la decisión es que N8AO declara «not yet compatible with WebGPU» (README) y que el README de pmndrs/postprocessing se documenta con `WebGLRenderer` (HECHO, 31-10-2026). Es un cambio en un documento de diseño, no en código del corte 1 | — |

## 5. Correcciones a supuestos previos

1. **PyVRP ya no es genético.** Desde la 0.13.0 usa búsqueda local iterada. El genético híbrido quedó en ≤ 0,12 y en HGS-CVRP.
   (HECHO: README y `benchmarks.rst` de PyVRP; `IteratedLocalSearch.py` en el paquete instalado, 31-10-2026.)
   - Rev. 31-10: la fecha «15-01-2026» es la de la primera versión de PyPI con ILS, la **0.13.1**; la 0.13.0 que nombra
     `benchmarks.rst` no figura en PyPI (HECHO, API JSON de PyPI, 31-10-2026). Queda desactualizado, fuera de este archivo, el
     comentario «búsqueda genética híbrida, HGS» de `requirements-sim.txt` (línea de PyVRP).
2. **A\* no acelera el ruteo de ciudad**, y con una cota no admisible da caminos subóptimos. Lo que sirve es la contracción.
3. **`WebGPURenderer` no está listo acá:** el 3D sale con WebGL 2.
4. **`@deck.gl/mapbox` no anda con MapLibre 6:** se usa `@deck.gl/maplibre`.
5. **DuckDB-WASM:** `npm install` sin versión instala hoy una versión de desarrollo. Se fija 1.32.0, y la estable va atrás del repositorio
   (DuckDB v1.4.3).
6. **Perspective** cambió de alcance de paquetes: `@finos` pasó a `@perspective-dev`.
7. **Quaternius ya no es CC0.**
8. **Pyodide es MPL-2.0:** por el criterio del holding (librerías permisivas; precedente de mediabunny) no entra al producto.
9. **Timefold Python está archivado.**
10. **El dominio de validez de F2 no es solo «ρ de inducción ≤ 0,5»:** también exige «sin rampas llenas».
    - Con `hub-chico@1.0.0`, el F2 del motor subestima el fin de la noche en 33 min y los pendientes 4×.
    - `hub/f2.ts` declara las dos condiciones (`DOMINIO_F2 = { rhoInduccionMax: 0.5, rampasLlenas: false }`), pero solo se controla ρ
      (`integracion/bateria/casos-hub.ts` y `hub/pruebas/consistencia-f2.test.ts`). `rampasLlenas` no se usa en ningún control (grep,
      31-10-2026).
    - La app no usa F2 para decidir: usa F3 (verificado con grep el mismo día). La gravedad es baja, pero conviene completar el control.
11. **El oráculo SimPy se escribió contra el motor 1.1.0 y el motor ya es 1.2.0** (`nucleo/version.ts`).
    - **MEDIDO por el arquitecto** el 31-10-2026 (`node --test oraculo/prueba/oraculo.test.mjs`, carga 0,5, 52,7 s): **6 de 9 pasan**.
      Reproducido por el revisor el mismo día (56,5 s): 6 de 9, con z = 4,13 (C2 F3) y 4,76 (C1 F2 y C2 F2) y el motor en 126,187 h
      contra 124,64–124,88 h. En los 5 exactos la diferencia relativa máxima con SimPy es 1,2e-15 (`resultados/exacto.json`).
    - Los 5 exactos pasan, más C1 F3.
    - Las 3 que fallan (C1 F2, C2 F2 y C2 F3) fallan **solo** en `horasPersonaPagadas` y `costoNoche` (\|z\| entre 4,1 y 4,8): el motor da
      126,19 h y el oráculo, 124,64–124,88 h.
    - Es exactamente lo que cambió la 1.2.0: los ausentes cobran medio turno y las horas de más llevan recargo. El oráculo detectó un
      cambio de regla real.
    - Antes de entrar a `verificacion/`, hay que actualizarlo a las reglas de la 1.2.0 y sumar un modelo exacto con ausencias y horas de
      más, porque hoy el piso exacto no ejercita los costos.
12. **Cola larga en el motor** (MEDIDO por el frente de simulación): en 125 noches, 12.358 paquetes (1,2%) esperan más de 60 min y el
    máximo es 672 min. Puede ser un comportamiento real (recirculación hasta el puesto manual) o un error. Va al cierre del corte 1 como
    pregunta, no como error confirmado.

## 6. Cómo se mantiene este radar

- Se revisa al abrir cada paquete del corte 2 y cada trimestre (`/herramientas auditar apps/anden`).
- Cada cambio deja una línea en la tabla correspondiente: fecha, versión, fuente, licencia, por qué y regla de corte.
- Las licencias de todo lo que entra al producto, con su atribución (OpenStreetMap, Overture, OpenFreeMap si se usa, Poly Haven), se
  copian al archivo de licencias del simulador en C2-I.
- Lo «no medido» de §0 se vuelve a intentar cuando cambie el entorno (GPU real, Chromium más nuevo, Java 25, glibc 2.43).

## 7. Revisión independiente de este radar y del plan (31-10-2026)

**Alcance.** Un revisor que no escribió ni el radar ni el plan comprobó, en fuentes oficiales y corriendo pruebas, lo que los dos
documentos afirman. No revisó el código de los laboratorios (eso sigue obligatorio en C2-I) ni corrió `npm test` ni `npm run e2e`.
No tocó `apps/anden/simulador/` ni `apps/juegos/aviacion/`; la batería se corrió en una copia del commit `699ddd3` fuera del repositorio.

**Correcciones hechas en este archivo** (cada una está marcada «rev. 31-10» donde se aplicó):

1. §2.5, vrp-cli: la «1.26.0» no está publicada (crates.io máx. 1.25.0, sin etiqueta `v1.26.0`; es `master` en `[Unreleased]`). Antes decía que «su formato cambió en la 1.26.0».
2. §2.4, A\*: con 60 km/h da camino subóptimo en 39 de 300 pares (13%), no «13 de 300». Se reprodujo con `ruteo_escala.mjs` y la cota cambiada.
3. §2.7, Perspective: trae dependencias MPL-2.0 transitivas (`leb128`, `buffer-pipe`), así que por el criterio del holding no entra al producto. Antes figuraba solo como Apache-2.0.
4. §2.1, N8AO 2.0.1: npm dice ISC, pero el `LICENSE` y el README del paquete son CC0 1.0 (ambas permisivas). Se anotan las dos.
5. Política de versiones: `postprocessing` 6.39.5 exige `three < 0.187.0`, razón técnica además de los 14 días. Se declaran las excepciones de adopción inicial con menos de 14 días (`bpy`, Streamlit, Perspective).
6. §2.8, webm-muxer: npm la marca deprecada («superseded by Mediabunny»), y mediabunny es MPL-2.0. La elección del video queda abierta. Antes figuraba sin aviso.
7. §2.10, Poki: la guía de 5 MB iniciales y 8 MB totales está en `developers.poki.com/guide/web-engine`, no en `requirements-quality` (que trae los 10 s). Ambas son guías, no límites duros.
8. §5.1, PyVRP: la primera versión de PyPI con búsqueda local iterada es la 0.13.1 (15-01-2026); la 0.13.0 no figura en PyPI.
9. §2.2 y §2.8, corte 1: «1.070 pruebas» son 1.069 que pasan y 1 omitida. El «e2e 16 de 16» es el del informe del 30-10; la corrida del 31-10 00:35 en disco dio 13 de 16 (3 cierres del navegador en 360-oscuro).
10. §4, `WebGPURenderer`: la evidencia del fallo vale solo para el adaptador por software de Chromium 141 (HIPÓTESIS para GPU real). Se agrega lo que sí sostiene la decisión: N8AO y postprocessing son WebGL.
11. §2.5, costo de servidor: la página de precios de Cloud Run no se pudo leer completa; el USD 0,000024 por vCPU-segundo sigue sin verificar en la fuente.
12. §2.2, Kenney: CC0 confirmado en la página oficial (kenney.nl/support). Antes decía «a confirmar».
13. §2.1 gltf-validator (última versión de 10-2024), §2.7 DuckDB-WASM (la etiqueta v1.33.0 de GitHub nunca llegó a npm) y §2.9 TypeScript (la `latest` es 7.0.2): se agregan como HECHO, sin cambiar la elección.

**Comprobado y correcto, sin cambios.**
- Versión, fecha de publicación y licencia en npm, PyPI y crates.io de todos los paquetes citados (unos 60). Las diferencias están en la lista de arriba.
- Fuentes oficiales: MapLibre 6.0.0 quitó `map.transform` (CHANGELOG); deck.gl anuncia `@deck.gl/maplibre` para MapLibre 4, 5 y 6 y declara `_GlobeView` experimental; GSAP (licencia propia con prohibiciones), Quaternius (QAL v1.0, no CC0), Poly Haven (CC0), la frase de Blender sobre lo que se crea con él, la política de teselas de OSM (prohíbe uso sin conexión y precarga), OpenFreeMap (sin clave, comercial sí, sin SLA, atribución), Protomaps (ODbL, enlazar descargas desaconsejado), Overture (ODbL con fuentes CC BY 4.0), Phaser (Canvas «officially deprecated»), CrazyGames (≤ 50 MB, 4 GB) y la baja del respaldo de Chromium a SwiftShader. Existen el build 20261029 de Protomaps (139 GB) y el release 2026-10-21.0 de Overture.
- Pruebas reproducidas:

| Prueba | Radar o plan dice | El revisor midió el 31-10-2026 |
|---|---|---|
| Oráculo SimPy contra motor 1.2.0 | 6 de 9 | 6 de 9; z de 4,13 a 4,76; 126,187 h contra 124,64–124,88 h |
| Piso exacto del oráculo | 24 de 24 KPI | 5 de 5 modelos; diferencia relativa máxima 1,2e-15 |
| Comparaciones estadísticas del laboratorio (motor 1.1.0) | \|z\| máx. 2,36 | 2,36 en F3-lite; 2,05 en F2; los 6 pares sin KPI fuera de 3,5 |
| Fallas sembradas | 6 de 6 sumando los dos pisos | 5 las detecta el piso exacto y 1 el estadístico |
| Contracción en WASM contra Dijkstra | 0,069 ms contra 2,99 ms (43×), 300 de 300 | 0,094 ms contra 3,70 ms (39×), 300 de 300, preparación 2,5 s |
| Evaluador contra PyVRP | costo idéntico, 0 s en 6 rutas | idéntico, 0 s |
| Benchmarks de literatura a 10 s | 0,25% y 0,29% contra 3,15% y 6,50%; OR-Tools infactible 3 de 36 | recalculados desde `literatura_10s.json`: idénticos |
| Adaptador de posiciones en CPU | 0,51 / 1,7 / 7,6 ms | 0,35 / 1,24 / 6,77 ms (equipo menos cargado) |
| `activos.glb` | 0 errores y 0 avisos | 0 errores, 0 avisos |
| Batería «Andén Verificado» | 85 de 85 | 84 de 85 con `--sin-navegador`; la que falta es R04, que la bandera salta. El `r04.json` guardado da 95 de 95 en Chromium 141 |
| Hub Nocturno, fps intercalados | 34,8 → 48,7 y 7,1 → 10,2 | medianas de `intercalada.json`: idénticas |

**No verificado por el revisor.** Precios de Cloud Run; que OSRM pida glibc 2.43 y GraphHopper Java 25 (solo se confirmó que `@project-osrm/osrm` 26.10.0 existe, BSD-2-Clause); `HeatmapLayer`; KTX2 en el navegador; las notas de las releases de GitHub (la API de GitHub estaba bloqueada: se usaron las páginas de etiquetas y los `Cargo.toml`/CHANGELOG crudos); `npm test` y `npm run e2e`.

**Costos y publicaciones.** No se encontró ningún gasto ni publicación hecha sin el OK del fundador. En el plan se endureció C2-1 (la página del banco se publica solo con OK; hay una alternativa que no publica nada).
