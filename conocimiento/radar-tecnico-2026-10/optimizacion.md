# Optimización de rutas (VRP) · radar técnico (30-10-2026)

> Frente: VRP con ventanas horarias, capacidad, flota heterogénea, reparto y re-entregas para Andén (y su integración con el simulador). Laboratorio: `apps/anden/laboratorio/ruteo/` (no toca `simulador/` ni `juegos/aviacion/`).
> Etiquetas: **HECHO** (fuente y fecha) · **MEDIDO** (reproducible con el laboratorio) · **INFERENCIA** (razonamiento propio). Todo del 30-10-2026 salvo que diga otra fecha. No se gastó ni se publicó nada.
> **Límite de las medidas:** máquina de 4 CPU compartida con otras pruebas (carga 3 a 13). En las corridas de literatura cada proceso recibió en promedio 0,75 de CPU (mínimo 0,43). Valen las diferencias grandes, no las de pocos puntos.

## 1. Veredicto

1. **PyVRP 0.14.1 (MIT) es el optimizador de Andén** para VRP con ventanas, capacidad y flota heterogénea. En los benchmarks publicados (Solomon y Gehring-Homberger) a 10 s da **0,27 % de brecha** contra **3,5 a 5 %** de OR-Tools (MEDIDO, §4.2), y no falló nunca en 36 corridas (OR-Tools no halló solución factible en 3 de 36). Corrección importante a la directriz: desde la 0.13 el algoritmo de PyVRP es **búsqueda local iterada (ILS), ya no genético**; el genético híbrido (HGS) quedó en versiones ≤ 0.12 y en HGS-CVRP (solo CVRP, sin ventanas).
2. **Pero ninguna herramienta gana sola en nuestro problema real.** En la instancia CABA de 200 paradas con costo fijo de flota dominante (85 a 90 % del costo), PyVRP, OR-Tools y vrp-cli empatan en ±3 % (484 a 487 USD el mejor de cada uno) y cada corrida cae en una cuenca distinta de composición de flota (rango 484 a 567). Cuando pesa el ruteo (costo fijo ÷ 10) PyVRP gana por 6 a 9 % (MEDIDO, §4.3 y §4.4). **La recomendación es un portafolio** (§5), no una herramienta.
3. **Sí corre en el navegador, dos caminos verificados** (MEDIDO, §4.6): (a) **PyVRP vía Pyodide 314.0.7**, con la rueda WebAssembly oficial que PyVRP publica en PyPI desde la 0.14.1: da **exactamente la misma solución** que el nativo (determinista) pero **5,1× más lenta**, arranque de 5 a 5,5 s y 9,9 MB comprimidos; (b) **vrp-cli 1.25.0 (Rust → WASM, Apache-2.0)**: arranque 0,1 s, 0,8 MB comprimidos, misma calidad en la instancia de flota y **9 a 13 % peor** en ruteo puro.
4. **OR-Tools queda de reserva en servidor** (restricciones raras): no tiene versión navegador oficial (rueda 9.15.6755 de 29,8 MB sin rueda WASM), fue la más débil en VRPTW puro y exige modelar cada restricción a mano. **jsprit, VROOM, Timefold y un genético propio no se adoptan como motor** (razones en §2).
5. La **verificación es independiente**: todo resultado de cualquier solucionador pasa por `modelo.evaluar` (capacidad, ventanas, jornada, flota, cobertura, costo), validado contra las cuentas internas de PyVRP (diferencia de duración mínima por ruta: 0 s en 6 rutas; costo idéntico) y las matrices de Dijkstra contra NetworkX (error máx. 0,5 s y 0,49 m).

## 2. Elección (una por necesidad)

| Necesidad | Elegido · versión · fecha · licencia | Por qué | Regla de corte / reemplazo |
|---|---|---|---|
| Optimizador principal | **PyVRP 0.14.1** · 16-10-2026 · MIT. Núcleo C++ (14.900 líneas, medido en el repo del 29-10) + Python (4.000) | Mejor en benchmarks (§4.2) y en ruteo puro (§4.4); soporta ventanas múltiples, flota heterogénea con perfiles de matriz, jornada flexible, reentrega (`reload_depots`, `release_time`), arranque en caliente; rueda WASM oficial | Cambiar si otro da ≥ 3 % mejor costo a igual tiempo en 3 instancias reales de Andén |
| Matriz de tiempos/distancias | **SciPy 1.18.1 Dijkstra** (dirigido, calles de mano única) sobre el grafo OSM de CABA (34.662 nodos, 75.324 arcos); en navegador, el CH-WASM del frente de calles | 401 fuentes en 6,7 s; verificado contra NetworkX | En navegador usar CH-WASM (0,069 ms por consulta, medido por el frente de calles) |
| Arranque rápido / portafolio | **VROOM 1.15 (pyvroom 1.15.2, BSD-2)** | Propone mezclas de flota que PyVRP no encuentra (§4.5); pero **no expresa la jornada máxima** y tardó 6 a 73 s en 200 paradas con 30 vehículos y 3 perfiles | Solo como semilla; nunca como respuesta final sin pasar por PyVRP |
| Motor interactivo en navegador | **vrp-cli 1.25.0** (crates.io, 10-11-2024, Apache-2.0) compilado a `wasm32` | Arranque 0,1 s, 0,8 MB; calidad suficiente para "qué pasa si" | Si se necesita calidad de ruteo, pasar al motor de calidad |
| Motor de calidad en navegador | **PyVRP en Pyodide 314.0.7** (14-09-2026, MPL-2.0) en Web Worker | Misma solución que nativo; resolución por rebanadas con progreso | Si la carga de 10 MB o los 5× molestan, mandar a servidor |
| Servidor (> 200 paradas, lotes, multi-semilla) | **PyVRP nativo en contenedor** | 1,2 MB de rueda; 10 s de una CPU ≈ USD 0,00024 (§4.7) | Solo con OK del fundador (gasto) |
| OR-Tools 9.15.6755 (Apache-2.0) | **Reserva** | Flexibilidad; sin WASM oficial; 3,5 a 5 % peor en VRPTW | Reactivar si aparece una restricción que PyVRP no modele |
| **No adoptados** | jsprit 2.0.0 (Apache-2.0): 568 USD contra 484 (+17 %), 190 ms por iteración, 5 s para la primera solución. Timefold: el solver Python está discontinuado y archivado (6-10-2025), el Java no se midió. Genético propio: PyVRP ya es la implementación de referencia y el "propio" tendría que repetir años de afinación | | Revisar Timefold Java si hace falta un motor de restricciones de planificación general |

## 3. Evidencia verificada

- **HECHO** · PyVRP: artículo Wouda, Lan, Kool, *INFORMS Journal on Computing* 36(4):943-955 (2024), arXiv 2403.13795: implementa búsqueda genética híbrida, "ranked 1st in the 2021 DIMACS VRPTW challenge" (el algoritmo que PyVRP pulió) y 1.º en la pista estática de EURO meets NeurIPS 2022; MIT. Para el 12.º desafío DIMACS las fuentes **discrepan** (ORTEC dice haber ganado VRPTW; una página de HUST dice 2.º en VRPTW): no se usa como argumento.
- **HECHO** · Benchmarks propios de PyVRP (`docs/source/setup/benchmarks.rst`, leído 30-10): brechas contra BKS promediadas en 10 semillas, v0.14.0 (19-08-2026): CVRP 0,31 %, VRPTW 0,65 %, HFVRP 0,51 %. OR-Tools v9.10.4067 (20-05-2024, una semilla): CVRP 4,42 %, VRPTW 9,38 %, PCVRPTW 10,72 %. Tiempos largos (VRPTW: 2 h en 1000 clientes).
- **HECHO** · El algoritmo actual es ILS: README de PyVRP ("iterated local search algorithm") y nota del benchmark ("we switched from a hybrid genetic search algorithm to an iterated local search algorithm", v0.13.0, 15-01-2026).
- **HECHO** · Comparación escrita por los mantenedores de PyVRP (`why_pyvrp.rst`; **fuente interesada**): VROOM "no metaheuristic on top… can get stuck"; jsprit y OR-Tools "poor on large instances"; PyVRP no soporta duraciones dependientes del tiempo (jsprit sí); VROOM no soporta salida flexible. Mis medidas lo confirman en lo que probé (§4).
- **HECHO** · Ruedas WASM: PyPI de `pyvrp` 0.14.1 (16-10-2026) lista `pyvrp-0.14.1-cp314-cp314-pyemscripten_2026_0_wasm32.whl` (687 KB; también cp313 y cp315); su CD las construye con cibuildwheel/pyodide. `ortools` 9.15.6755 (14-01-2026) y `pyvroom` 1.15.2 (22-04-2026): **sin** ruteo WASM; OR-Tools WASM existe solo de terceros (or-tools-wasm, solo CP-SAT).
- **HECHO** · Pyodide 314.0.0 (09-06-2026, Python 3.14.2, Emscripten 5.0.3), 314.0.7 (14-09-2026); numpy 2.4.6 WASM de su CDN; el lock no trae pyvrp ni ortools.
- **HECHO** · vrp-cli (reinterpretcat/vrp): Apache-2.0, repo v1.26.0 (21-09-2026); README: "The solver runs as WebAssembly in a browser or in node"; no hay paquete npm, se construye con wasm-pack. En crates.io solo está la 1.25.0 (10-11-2024); es la que se compiló. Su formato de objetivos cambió entre 1.25 (lista plana) y 1.26 (anidada).
- **HECHO** · jsprit 2.0.0 (Maven Central; último commit 14-09-2026; exige Java 21; la doc de PyVRP lo llama "largely abandoned", ya desactualizado). VROOM v1.15.0, último commit 17-03-2026, BSD-2. Timefold Python: PyPI 1.10.0a0 (16-05-2024), repo archivado 06-10-2025, el Enterprise Edition de Java es propietario.
- **HECHO** · Precios (búsqueda sobre la página oficial; **verificar en vivo antes de decidir**): Cloud Run por solicitud, región nivel 1, USD 0,000024 por vCPU-segundo, 0,40 por millón de solicitudes, gratis 180.000 vCPU-s y 2 millones de solicitudes al mes. Cloudflare Workers de pago: USD 5 al mes, USD 0,02 por millón de ms de CPU, hasta 5 min de CPU por invocación.

## 4. Prueba real (MEDIDO)

**Instancia.** Grafo OSM de CABA (extracto BBBike, ODbL, sha256 en `datos/caba_clientes.json`) → matrices por Dijkstra → depósito en Parque Patricios y 200 paradas **sintéticas** (nodos reales al azar, radio 9 km, semilla fija): demanda 1 a 8 (total ≈ 660), servicio 150 + 45 por unidad, ventanas (30 % mañana 9-13, 30 % tarde 14-18, 25 % franjas de 2 h, 15 % libres). Flota heterogénea de 30 vehículos en 3 perfiles (moto 12 × cap. 18, van chica 12 × 70, van grande 6 × 160, tiempos × 0,80 / 1,00 / 1,15, jornada 8 / 9 / 9 h, ventana de depósito 8 a 21 h). Velocidades, congestión (× 0,70), demora por esquina (5 s) y costos (fijo 22 / 48 / 75 USD por jornada, 0,05 / 0,14 / 0,22 por km) son **supuestos** (INFERENCIA): sirven para comparar solucionadores, no para cotizar.

### 4.1 Verificadores
Dijkstra SciPy contra NetworkX: error máx. 0,50 s y 0,49 m en 40 pares + 25 pares de autoverificación; asimetría media 6,5 % (mano única); distancia por calle / en línea recta: mediana 1,35. Evaluador contra PyVRP: costo idéntico y 0 s de diferencia de duración en 6 rutas. (El primer evaluador marcaba 3 soluciones de OR-Tools como infactibles por jornada: era un error mío en la duración mínima; corregido con el cálculo exacto y revalidado.)

### 4.2 Benchmarks publicados, 10 s, 1 hilo (12 instancias, 3 semillas PyVRP, 3 configuraciones OR-Tools)
| Conjunto | PyVRP (media 3 semillas) | OR-Tools (media de corridas factibles) | OR-Tools infactibles |
|---|---|---|---|
| Solomon 100 clientes (R101, R201, RC101, RC201, C101, C201) | **0,25 %** | 3,15 % | 2 de 18 |
| Gehring-Homberger 200 clientes (R1_2_1, R2_2_1, RC1_2_1, RC2_2_1, C1_2_1, C2_2_1) | **0,29 %** | 6,50 % | 1 de 18 |

Brecha contra la mejor solución conocida (PyVRP/Instances, BKS de CVRPLIB, redondeo DIMACS). PyVRP iguala la BKS en 7 de 12 instancias con su mejor semilla. Con mejor configuración por instancia OR-Tools baja a 3,50 % de media (generoso: se elige a posteriori). `PATH_CHEAPEST_ARC` ni siquiera arma solución en R101, RC101 y R1_2_1 con flota limitada.

### 4.3 CABA 200 paradas, costo fijo dominante (USD de jornada; evaluador independiente; todas factibles)
| Solucionador | 10 s | 30 s | 60 s | Vehículos (60 s) |
|---|---|---|---|---|
| PyVRP, semillas 1/2/3 | 515 / 538 / 502 | 513 / 538 / 502 | **512 / 499 / 484** | 13 / 11 / 9 |
| OR-Tools PATH_CHEAPEST_ARC + GLS | 488 | 488 | **487** | 9 |
| OR-Tools SAVINGS / PARALLEL_CHEAPEST_INSERTION | 525 / 558 | 524 / 558 | 524 / 557 | 13 / 16 |
| vrp-cli (WASM, objetivo por defecto), 3 corridas | 485 / 514 / 490 | 493 / 493 / 494 | 489 (1) | 7 a 12 |
| vrp-cli (WASM, objetivo "costo") | 531 / 565 / 567 | 495 / 521 / 560 | | |
| jsprit 2.0.0 | | 568 | 568 | 15 |
| VROOM nivel 1 / 5 | 423 / 421 (**infactible**: nivel 5 con jornadas de 9,06 y 9,44 h > 9 h) | | | 6 |

Lectura: los mejores de cada uno quedan en 484 a 487 (±0,6 %); la dispersión entre corridas (484 a 538 solo en PyVRP) es mayor que la diferencia entre herramientas. Las soluciones se parten en cuencas por mezcla de flota (9 van chicas contra 4 vans grandes + motos). VROOM encuentra la mezcla barata pero con la jornada violada.

### 4.4 Misma instancia con el ruteo pesando (costo fijo × 0,1), 30 s
**PyVRP 91,8 y 91,7** · OR-Tools 97,9 (SAVINGS), 99,3, 101,0 · vrp-cli 100,2 y 99,9. PyVRP gana por 6 a 9 % (CPU/pared de estas corridas: 0,93 a 0,98, máquina menos cargada).

### 4.5 Híbrido: arranque rápido + PyVRP (60 s totales)
VROOM nivel 5 (50 s) → PyVRP 9,7 s: **445,3 USD, factible** (−11 % contra PyVRP solo, ≈ 499). VROOM nivel 1/2/3 → PyVRP, 2 semillas cada uno: 497, 497, 497, 468, 497, 468. Es decir **1 de 7 baja 11 %, 2 de 7 bajan 6 % y 4 de 7 empatan** con PyVRP solo. OR-Tools 10 s → PyVRP 50 s: 481 (contra 487 de OR-Tools solo). El arranque con buena mezcla de flota ayuda, no es garantía: de ahí el portafolio.

### 4.6 Navegador (Chromium 141 headless, Web Worker, todo servido localmente)
| | PyVRP en Pyodide | vrp-cli en WASM |
|---|---|---|
| Corre | **Sí.** 3000 iteraciones: mismo costo (515,049) que nativo, en Node y en Chromium | **Sí.** |
| Velocidad | 27,3 s contra 5,4 s nativo (**5,1×**), 110 contra 560 it/s | no medido contra nativo |
| Arranque | 4,4 s Pyodide + 1,1 s paquetes | 0,08 a 0,11 s |
| Descarga | 17,2 MB / **9,9 MB gzip** (+0,55 MB la instancia) | 3,1 MB / **0,81 MB gzip** |
| 200 paradas, 30 s, flota dominante | 515,0 (13 veh) | 510,2 (11 veh, objetivo "costo") |
| 200 paradas, 30 s, ruteo pesa | **93,2** | 105,0 |
| Progreso en vivo | Sí: resolución por rebanadas de 5 s con arranque en caliente (497,7 en 22,7 s, traza 520,9 → 498,7 → 497,9 → 497,7) | no |

### 4.7 Costo en servidor (INFERENCIA con el precio de §3)
Una solución de 10 s ≈ 10 vCPU-s ≈ USD 0,00024; de 60 s ≈ USD 0,0014. El nivel gratuito cubre 18.000 soluciones de 10 s o 3.000 de 60 s al mes. No se justifica gastar mientras el navegador resuelva.

### 4.8 Escala (30 s, flota dominante)
50 paradas: PyVRP 152,6 · OR-Tools 157,6. 100: 270,6 · 271,6. **400: PyVRP 929,2 · OR-Tools 843,9 (−9 %)**. Con 30 s PyVRP no sale de una mala mezcla de flota; no es el resultado de la literatura y se debe a la estructura de costos (§6).

### 4.9 Re-entregas (segunda ola)
24 de las 200 paradas fallan ("ausente"), vuelven al depósito y se reprograman 16 a 20 h junto con 16 pedidos nuevos (40 paradas; flota de 6 vans chicas y 2 grandes con jornada de 6 h, las soluciones usan 2 chicas): **todos llegan a 112,45 a 112,95 USD** en 10 s; VROOM da 112,45 en **1,2 s**. Replanificar una ola chica es instantáneo con cualquiera; el cuello de botella es el plan base. PyVRP además modela de forma nativa `release_time` y recarga en depósito (multi-viaje); existe la API (`reload_depots`, `max_reloads`), no se comparó contra OR-Tools.

## 5. Integración (arquitectura recomendada)

1. **Datos:** matriz con CH-WASM en el navegador (≈ 2,8 s para 201×201: 40.401 consultas × 0,069 ms, INFERENCIA, más 2,9 s de preparación del CH medidos por ese frente) o Dijkstra SciPy en servidor; formato plano de enteros (`Instancia.a_dict`, 1,3 MB, 0,55 MB gzip).
2. **Portafolio por pedido de plan:** (a) respuesta inmediata con vrp-cli WASM (< 1 s de arranque) para "qué pasa si"; (b) en segundo plano, PyVRP en Pyodide en un Web Worker por rebanadas de 5 s con progreso, arrancando de la mejor solución previa; (c) si el plan importa (> 200 paradas, 4 semillas, VROOM→PyVRP), un contenedor con PyVRP nativo, con OK del fundador. Elegir el mejor **según el evaluador independiente**, no según lo que diga cada solucionador.
3. **Con el simulador (corte 1, TypeScript, eventos discretos):** el plan sale como `[(tipo de vehículo, [paradas])]`; el simulador lo ejecuta con tiempos estocásticos; ausencias, demoras y pedidos nuevos disparan una **replanificación con arranque en caliente** (rutas restantes + pedidos pendientes, hora de corte como apertura del vehículo). SimPy sigue siendo el oráculo del motor de Andén; el evaluador de este laboratorio debería portarse a TypeScript como prueba del plan.
4. **Live tracking:** las rutas de PyVRP más el camino de calle del CH-WASM alimentan el frente de calles/deck.gl; la matriz y el camino salen del mismo grafo.

## 6. Riesgos y límites

- **Mezcla de flota:** con costos fijos altos PyVRP cae en cuencas malas (la semilla importa tanto como la herramienta). Mitigar con portafolio y arranque de VROOM/OR-Tools. No se probaron los parámetros de PyVRP (vecindarios, penalizaciones) ni `minimise_fleet`.
- **PyVRP no soporta tiempos de viaje dependientes de la hora** (HECHO, doc oficial); jsprit sí. Para tráfico por franja habría que partir en tramos o usar perfiles por vehículo.
- **Navegador:** 5× más lento y 10 MB de descarga (PyVRP); depende de que Pyodide 314 y las ruedas `pyemscripten_2026_0` sigan publicadas. vrp-cli 1.25.0 está desactualizada respecto a la 1.26.0 del repo y su formato cambió; hay que fijar versión.
- **Medidas con CPU compartida** y una sola instancia sintética por régimen; 3 semillas por celda. Diferencias menores a 5 % no son concluyentes. Instancia con costos supuestos.
- **Sin revisión independiente por agente** (este entorno no tiene herramienta de subagentes): sí hay verificación cruzada (evaluador y Dijkstra). Pendiente: revisión de código por un agente `general-purpose`.
- **Fuentes interesadas:** la comparación PyVRP/VROOM/jsprit la escriben los mantenedores de PyVRP; los precios de nube salen de una búsqueda sobre la página oficial.
- No probado: función en el borde (Cloudflare Workers) con el `.wasm` de Rust (requiere cuenta y gasto; el fundador decide), Timefold Java, LKH-3, Hexaly y OR-Tools con recarga en depósito.
- Licencias: PyVRP MIT, OR-Tools/jsprit/vrp-cli Apache-2.0, VROOM BSD-2, Pyodide MPL-2.0 (archivo por archivo, sin modificar), Blender/OSM ODbL con atribución al usar el mapa.

## 7. Fuentes (consultadas el 30-10-2026)

- PyVRP: https://github.com/PyVRP/PyVRP (clon del 29-10-2026), `docs/source/setup/benchmarks.rst`, `why_pyvrp.rst`, README; https://pypi.org/project/pyvrp/ (0.14.1, 16-10-2026); https://arxiv.org/abs/2403.13795
- Instancias y BKS: https://github.com/PyVRP/Instances (carpeta VRPTW, Solomon y GH200; BKS de CVRPLIB http://vrp.atd-lab.inf.puc-rio.br)
- OR-Tools 9.15.6755: https://pypi.org/project/ortools/ (14-01-2026); or-tools-wasm de terceros: https://github.com/Axelwickm/or-tools-wasm
- VROOM: https://github.com/VROOM-Project/vroom (v1.15.0), pyvroom https://pypi.org/project/pyvroom/ (22-04-2026)
- jsprit: https://github.com/graphhopper/jsprit (2.0.0, 14-09-2026), Maven Central `com.graphhopper:jsprit-core:2.0.0`
- vrp-cli (Rust): https://github.com/reinterpretcat/vrp (commit e49bee0, 21-09-2026), https://crates.io/crates/vrp-cli (1.25.0)
- Timefold: https://github.com/TimefoldAI/timefold-solver, https://github.com/TimefoldAI/timefold-solver-python (archivado 06-10-2025), https://pypi.org/project/timefold-solver/
- Pyodide: https://pyodide.org/en/stable/project/changelog.html (314.0.0, 09-06-2026; 314.0.7, 14-09-2026), https://www.npmjs.com/package/pyodide
- DIMACS 12.º desafío: https://dimacs.rutgers.edu/programs/implementation-challenges/vehicle-routing ; https://ortec.com/en/news/ortec-wins-dimacs-2022
- Precios: https://cloud.google.com/run/pricing ; https://developers.cloudflare.com/workers/platform/pricing/
- Medidas propias: `apps/anden/laboratorio/ruteo/resultados/*.json` (literatura_10s, caba*, hibrido*, reentregas*, navegador_resumen); CH-WASM del frente de calles: `apps/anden/laboratorio/calles/datos/medidas_ruteo_js.json`
- Datos: OpenStreetMap vía BBBike (ODbL), extracto `apps/anden/laboratorio/calles/datos/caba.osm`
