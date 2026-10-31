# Simulación, oráculos, tableros y línea de tiempo · radar técnico (30-10-2026)

> Frente: (a) SimPy como oráculo independiente del motor de Andén, (b) Streamlit y stlite, (c) tableros de alto rendimiento (ECharts, uPlot, Observable Plot, Perspective, DuckDB-WASM + Arrow) y React frente a la interfaz actual. Laboratorio: `apps/anden/laboratorio/simulacion/` (README ahí; no toca `apps/anden/simulador/`, que solo se LEE para correr el motor, ni `apps/juegos/aviacion/`).
> Etiquetas: **HECHO** (fuente y fecha) · **MEDIDO** (reproducible con el laboratorio) · **INFERENCIA** (razonamiento propio). Todo del 30-10-2026 salvo que diga otra fecha. No se gastó ni se publicó nada.
> **Límite de las medidas:** 4 CPU compartidas con otras sesiones (carga 3 a 13 durante las corridas), Chromium 141.0.7390.37 headless **sin GPU** (Canvas y WebGL dibujan por software). Valen las diferencias grandes, no las de pocos puntos; los tiempos de WebGL no representan una GPU real.

## 1. Veredicto

1. **SimPy 4.1.2 entra como oráculo y funciona: el motor de Andén pasa.** Una segunda implementación del hub chico, en otro paradigma (procesos de SimPy, no calendario propio; escrita desde la especificación y leyendo el motor donde la especificación calla: independencia de código, no de lectura de las reglas), da **los 24 KPI idénticos al motor F2 en 5 modelos sin azar** (hasta el milisegundo) y **coincide en distribución con el motor F3 en los 24 KPI** de 3 escenarios con azar (100 a 300 noches por lado, |z| máx. 2,36). No encontró ningún error del motor. Las pruebas exactas detectan 5 de 6 fallas sembradas a propósito y las estadísticas, 3 de 6 (juntas, 6 de 6). Se propone meterlo como `node --test` sin Python (§5).
2. **Hallazgo sobre el motor y sus fidelidades:** en `hub-chico@1.0.0` tal cual, **F2 no sirve para decidir** (el F2 del propio motor subestima el fin de la noche en 33 min, 15 %: 185,5 contra 218,3; y los pendientes al corte 4×: 32,6 contra 139,3; 300 noches) porque se llenan rampas y hay recirculación; el dominio de validez de F2 (ρ de inducción ≤ 0,5 y sin rampas llenas) no lo cumple la plantilla. F3 es el que vale, y el oráculo lo respalda.
3. **Streamlit: solo análisis interno. stlite: no para el producto.** Streamlit 1.66.1 como servidor: 200 MB de memoria con una sesión, 2,6–3,2 s hasta ver la tabla, 4,8 MB de frontend, y se ve como Streamlit (justo lo que el fundador no quiere). stlite 1.12.0 corre sin servidor pero tarda ≈ 22 s en frío y baja 32 MB (Pyodide + pandas desde jsDelivr).
4. **Tableros: DuckDB-WASM para consultar, y cada gráfico con la librería que lo aguanta; no hay una sola.** DuckDB-WASM 1.32.0 resuelve 5 consultas sobre 100 noches (809.800 paquetes) en 12–70 ms y un tablero completo (consultas + 2 gráficos) aparece en 2,8 s desde cero. Para **1 M de puntos como nube** ninguna librería probada (ECharts, uPlot, Plot, Perspective, echarts-gl) se acerca a un raster de densidad de ≈ 40 líneas (32–47 ms y 39 ms de zoom, contra 1,2–1,4 s de primer cuadro y 10–15 s por zoom en ECharts): acá el código propio le gana a las librerías y se deja asentado con su prueba. Las librerías sirven para lo agregado (§2).
5. **React: no.** React + ReactDOM 19.3.1 pesan 58,0 KB brotli; la primera carga de Andén ya está en 146,5 de 150 KB (README del simulador, medido el 30-10-2026). Preact 11.1.0 pesa 5,0 KB pero reescribir 10 pantallas para ganar un modelo de componentes no cambia ningún resultado medido. La interfaz en TypeScript sin framework se queda; los tableros pesados van en trozos aparte cargados al abrirlos.

## 2. Elección (una por necesidad)

| Necesidad | Elegido · versión · fecha · licencia | Por qué | Regla de corte |
|---|---|---|---|
| Oráculo independiente del motor | **SimPy 4.1.2** · PyPI 24-05-2026 · MIT (+ numpy 2.5.3) | §4.1: 24/24 KPI en cinco modelos exactos y en seis comparaciones estadísticas | Si el motor cambia una regla a propósito, se corrige el oráculo o se versiona el dorado. Si SimPy se abandona: el oráculo es 960 líneas de Python puro, portable |
| Consultar N noches (cien noches, comparaciones, percentiles) | **@duckdb/duckdb-wasm 1.32.0** (bundle `eh`) · npm 16-12-2025 · MIT · motor DuckDB v1.4.3 | 5 consultas en 12–70 ms sobre 809.800 filas; igual a un JS a mano hasta 6e-6 min; 2× más rápido que el JS en la consulta que se pudo comparar (66–70 contra 134 ms) | Si el wasm de 4,9 MB brotli molesta, el trozo se carga solo al abrir «análisis de cien noches»; para < 20.000 filas alcanza JS plano |
| Gráficos agregados del producto (barras, abanicos, mapas de calor ≤ 100.000 elementos) | **ECharts 6.1.0** · npm 19-05-2026 · Apache-2.0, importando por módulo (150,9 KB brotli, no los 304,7 del paquete entero) | La entrega de datos agregados por DuckDB (§4.3) llega a un tablero real en una sola página | No usar para nubes de > 100.000 puntos ni zoom sobre ellas (§4.2) |
| Series densas y línea de tiempo (miles a 1 M de puntos en línea) | **uPlot 1.6.32** · npm 14-03-2025 · MIT · 20,4 KB brotli | Una línea de 1 M de puntos: primer cuadro 0,76–1,0 s, zoom ≈ 420 ms | No para dispersión (con 1 M no dibujó ni un punto); es de mantenimiento lento (última versión 14-03-2025) |
| Exploración libre / pivote («modo ingeniero») | **Perspective 5.6.1** · `@perspective-dev/*` · npm 23-10-2026 · Apache-2.0 | 1.001.200 filas en la grilla virtual en 0,8 s; pivotes y gráficos WebGL arrastrando columnas | Más lenta que DuckDB para agrupar (2,2–2,9 s contra 26–70 ms); solo para explorar, nunca para el cálculo del producto |
| Nube de 1 M de puntos (densidad) | **Raster de densidad propio** (≈ 40 líneas, Canvas 2D + `ImageData`) | 32–47 ms y zoom de 37–48 ms (§4.2); ninguna librería probada lo iguala sin GPU | Si hace falta interacción por punto (tocar uno), pasar a un scatter WebGL con GPU (deck.gl o regl-scatterplot: no se probaron acá, es del frente de mapas) |
| Interfaz del producto | **Se mantiene TypeScript sin framework** | React suma 58 KB brotli a una carga de 146,5 de 150 KB | Preact (5 KB) solo si aparece una pantalla con estado muy anidado que lo justifique |
| Análisis interno (no producto) | **Streamlit 1.66.1** · PyPI 21-10-2026 · Apache-2.0 | 30 líneas de Python leen `resultados/estadistico-*.json` y muestran tabla y gráfico | No va al producto ni a un servidor público |
| **No adoptadas** | **Observable Plot 0.6.17** (ISC, npm 14-02-2025): SVG, 10.000 puntos en 140–167 ms pero 100.000 en 1,3–1,4 s y 250.000 en 3,5–3,7 s; solo un mapa de calor agrupado de 1 M entra (1,7–2,2 s, 3.049 rectángulos); 110,8 KB brotli. **echarts-gl 2.1.0** (MIT, 28-05-2026): no compila con ECharts 6.1.0 sin un alias (importa `echarts/lib/*`, que el `exports` de ECharts 6 no expone); con el alias dibuja bien 1 M de puntos (8,5 s por software, 1,9 MB), pero ya hay un camino mejor. **stlite 1.12.0** (§4.4) | | Revisar Plot si hace falta una gráfica explicativa chica y estática; echarts-gl si se prueba con GPU real |

## 3. Evidencia verificada (HECHO)

- **SimPy**: 4.1.2 es la última en PyPI (24-05-2026), MIT. La fase URGENTE del motor se imita con `Environment.schedule(evento, URGENT, demora)`: `schedule` está documentada (referencia de la API, leída 30-10-2026: `schedule(event, priority=1, delay=0)`), pero la constante `URGENT` (0, de `simpy.core`) no figura en esa página y el oráculo fija a mano los atributos privados `_ok` y `_value` del evento (frágil si SimPy los cambia; la versión está fija en 4.1.2).
- **ECharts** 6.1.0 (npm, 19-05-2026, Apache-2.0). Su modo `large` acepta datos en un `Float32Array` plano `[x0,y0,x1,y1…]` solo si no se declara `dimensions` (con `dimensions` no dibuja: MEDIDO, 0 píxeles) y con `progressive: 0` pinta de una vez; con el pacing progresivo por defecto, 100.000 puntos tardan 3,5–6,5 s y 1 M tardan 43,8 s en terminar de dibujarse (MEDIDO).
- **uPlot** (README oficial, leído 30-10-2026): «chart for time series, lines, areas, ohlc & bars», 166.650 puntos en 25 ms (v1.6.24, Chrome 113, 11-03-2023), «puede costar más allá de 100.000 puntos a la vista» en vivo. No menciona dispersión. Última versión npm 1.6.32 del 14-03-2025.
- **Perspective**: el paquete `@finos/perspective` 3.8.0 (03-09-2025) está **deprecado** («no longer maintained, upgrade to @perspective-dev/client», aviso de npm, leído 30-10-2026); el sitio oficial (perspective-dev.github.io, leído 30-10-2026) lista solo el alcance `@perspective-dev` (client, server, viewer, viewer-datagrid, viewer-charts, react); 5.6.1 del 23-10-2026, Apache-2.0. La versión 5 trae gráficos WebGL (`viewer-charts`: barras, líneas, dispersión, mapa de calor…). Se probó con 5.6.1, no con la 3.8.
- **DuckDB-WASM**: MIT. La última versión estable en npm es **1.32.0 (16-12-2025)**; la `1.33.1-dev57.0` (22-06-2026) es de desarrollo. El README del repo dice «basado en DuckDB v1.5.6» pero la estable publicada corre **DuckDB v1.4.3** (MEDIDO con `SELECT version()`): lo publicado va atrás del repo. Multihilo «experimental y desactivado por defecto» (README, 30-10-2026).
- **stlite** 1.12.0 (npm 18-10-2026, Apache-2.0): corre Streamlit en el navegador con Pyodide; por defecto carga Pyodide de una CDN (MEDIDO: `cdn.jsdelivr.net/pyodide/v314.0.3/full/`) y se puede autoalojar con `pyodideUrl` (README oficial); límites declarados: paquetes con extensiones binarias sin build para Pyodide, red limitada, `time.sleep` no hace nada. Trae el wheel de Streamlit **1.65.0** (la 1.66.1 salió después).
- **React** 19.3.1 (14-10-2026, MIT), **Preact** 11.1.0 (27-10-2026, MIT), **Observable Plot** 0.6.17 (14-02-2025, ISC), **apache-arrow** 21.2.0 (21-07-2026, Apache-2.0).
- **Tamaño real** (esbuild 0.28.2, minificado, brotli nivel 11; MEDIDO): ECharts por módulo 150,9 KB (completo 304,7) · uPlot 20,4 · Plot 110,8 · Perspective 118,3 (+ wasm 0,6 + 2,5 + 1,6 MB) · DuckDB-WASM 44,2 (+ wasm `eh` 32,7 MB crudo, **4,9 MB brotli**, + worker 0,77 MB) · apache-arrow 41,8 · React 58,0 · Preact 5,0.

## 4. Prueba real (MEDIDO)

### 4.1 Oráculo SimPy contra el motor de Andén
**Qué es** (`oraculo/hub_simpy.py`, ≈ 960 líneas): camiones, playa, andenes, cintas con espaciado, contrapresión, acumulación FIFO con no transportables, inducción con ausencias y pausas, lectura NO-READ, rutas → rampas, personas de rampa (plan por-volumen/contiguas, reglas, caminata, jaulas, pausas con relevo), puesto manual, y los 24 KPI de §6.9. Dos modos: **F2** (demora fija estación → rampa) y **F3-lite** (grilla de pasos, micro-paradas que congelan lo que va en bandejas, vueltas de recirculación hasta `maxVueltas`). **No modela** qué bandeja está ocupada, fatiga, temporarios ni el plan en lista explícita. Lee el mismo JSON `hub-chico.json` que el motor. Azar distinto a propósito (numpy PCG64): se compara la distribución, no la corrida.

**Piso exacto** (modelos sin azar: tiempos fijos, 1 ruta, 1 clase; el motor da lo mismo con cualquier semilla, el oráculo también): A1 base · A2 pausas, desvío +120 s y atraso común de 30 min · A3 estrés con 2 puestos (contrapresión y playa) · A4 plan contiguas y regla en-orden · A5 descarga más rápida que la cinta. **Motor F2 = SimPy en los 24 KPI de los 5 modelos** (por ejemplo A1: fin 270,1933 min, espera media 52,7887 min, 128 h pagadas; diferencias < 1e-9). Contra el motor **F3** esos mismos modelos difieren muchísimo (A1: fin 959,7 contra 270,2 min) porque las rampas se llenan y recirculan: están fuera del dominio de F2, como debe.

**Sensibilidad** (6 fallas sembradas en el oráculo): sin relevo en las pausas, caminata fija, sin contrapresión, sin desvío de no transportables, pausa perdida, sin espaciado de cinta. Los modelos exactos detectan 5 (el desvío de no transportables no se ejercita: una sola clase); la prueba estadística (100 noches por lado en C1) detecta 3 (contrapresión z = 4,8 y 8,2; no transportables z = −57,5; pausa perdida z = −3,5) y **no** ve las otras 3 (relevo, caminata, espaciado: efectos de minutos en una noche, ruido en la media). **Los dos pisos se necesitan.**

**Piso estadístico** (Welch |z| ≤ 3,5 por KPI, Bonferroni sobre ≈ 24 KPI, FWER ≈ 1 %, más Kolmogorov-Smirnov p > 0,001 en fin, espera media y P90). B1 = tiempos fijos con rutas y clases al azar (100 noches), C1 = plantilla tal cual (300), C2 = medio volumen, ρ de inducción ≈ 0,36 (300):

| Escenario | SimPy F2 vs motor F2 | SimPy F3-lite vs motor F3 | SimPy F2 vs motor F3 |
|---|---|---|---|
| B1 | 20/20 · |z| máx. 1,73 | **24/24** · |z| máx. 2,36 | 19/20 |
| C1 | 20/20 · |z| máx. 1,62 | **24/24** · |z| máx. 2,07 | 12/20 (fin 183,4 vs 218,3 min; a excepción 277 vs 387; pendientes al corte 19,6 vs 139,3) |
| C2 | 20/20 · |z| máx. 2,05 | **24/24** · |z| máx. 2,00 | 18/20 (espera media 0,98 vs 1,14 min; P90 1,76 vs 2,21: las micro-paradas) |

Tiempo por noche (carga 3–13): motor F2 25–50 ms, F3 37–72 ms, SimPy F2 230–630 ms. **Prueba propuesta** (§5): `oraculo/prueba/oraculo.test.mjs`, 9 pruebas (5 exactas + 4 estadísticas contra dorados), 9 de 9 pasan, 51 s.

### 4.2 Un gráfico con 1 millón de puntos (Chromium, 1.001.200 paquetes reales de 125 noches: x = minuto de creación, y = espera)
Datos del motor de producción (F3, traza completa, 92 ms por noche) en Arrow IPC (14,0 MB). Mediana de 3 corridas, ms; «zoom» = un paso de zoom sobre 60 min de la vista.

| Opción | 1.er cuadro (1 M) | Zoom | Veredicto |
|---|---|---|---|
| Raster de densidad propio (referencia) | 32–47 | 37–48 | Gana por mucho; sin interacción por punto |
| uPlot, **línea** de 1 M | 757–999 (incluye ordenar: ≈ 430) | 416–433 | Bien para series densas |
| uPlot, dispersión | 1.230–1.300 y **0 puntos dibujados** (con 50.000 sí, 6,8 s) | 251–273 | No es su caso de uso |
| ECharts 6.1.0 `large`, Float32Array, `progressive:0` | 1.210–1.420 | **10.400–15.300** por paso (4 corridas) | Pinta, pero el zoom no es usable; a 200.000 puntos tarda 3,6–13 s por paso, salvo un paso de 91 ms entre medio, errático (3 maneras de hacer zoom probadas: `dataZoom` con y sin filtro, `setOption`) |
| ECharts, pacing progresivo por defecto | 35.200–43.800 | — | No usar con este volumen |
| Observable Plot, puntos SVG | 10.000: 140–167 · 50.000: 692–866 · 100.000: 1.266–1.405 · 250.000: 3.495–3.690 | — | No escala |
| Observable Plot, mapa de calor agrupado de 1 M | 1.657–2.180 | — | Sirve (3.049 rectángulos) |
| Perspective 5.6.1, `X/Y Scatter` WebGL (software) | 5.581–7.932 (`Heatmap` no terminó en 45 s) | — | Dibuja; con GPU sería menos (no medido) |
| echarts-gl 2.1.0, `scatterGL` (software) | 8.546 | — | Dibuja (captura revisada); empaquetado roto sin alias |

La captura de echarts-gl con 1 M de puntos muestra lo que importa del hub: la espera sube entre los minutos 130 y 200 (pico de volumen) y se ven **diagonales** de paquetes creados en momentos distintos que terminan todos a la misma hora (INFERENCIA: una rampa o una persona que se libera tarde; no se rastreó la causa). El eje de la captura corta en 60 min: en las 125 noches hay paquetes que esperan hasta 672 min y 12.358 (1,2 %) esperan más de 60 min, en 16 de las 125 noches (MEDIDO), una cola larga que conviene mirar en el motor, no en el tablero. **Lección:** para ver volumen se agrega antes de dibujar (DuckDB devuelve 2.558 celdas en 38 ms), no se dibujan 1 M de glifos.

### 4.3 DuckDB-WASM sobre 100 noches (809.800 paquetes + 24 KPI por noche), Chromium
Arrow IPC (stream) → `insertArrowFromIPCStream`. Arranque del wasm `eh`: **1,36–1,38 s** (el bundle `coi` con hilos: 4,4–4,8 s y las consultas no mejoran (Q1 62–90 contra 66–70 ms; Q5 34–48 contra 25–29): elegir `eh`, que además no pide encabezados COOP/COEP). Carga de las dos tablas: 158–183 ms. Memoria de DuckDB: 36 MB.

| Consulta (mediana de 5, ms) | `eh` |
|---|---|
| Q1 por noche: n, media, P90, máx. (100 grupos) | 66–70 (el mismo cálculo en JS plano: 134 ms; diferencia máx. 6e-6 min) |
| Q2 distribución del P90 entre las 100 noches | 28 |
| Q3 mapa de calor 5 min × 2 min (2.558 celdas) | 38–50 |
| Q4 unión con KPI: espera media de las noches del 10 % peor fin | 12–13 |
| Q5 P99 por camión y ruta | 25–29 |

Perspective con el mismo volumen (1.001.200 filas): crear la tabla 1,3 s, agrupar por noche 2,2–2,5 s, por camión × ruta 2,8–3,1 s, grilla virtual 0,76–0,84 s. **DuckDB agrupa entre 30 y 100 veces más rápido (66–70 ms contra 2,2–2,5 s; 25–29 ms contra 2,8–3,1 s); Perspective gana en la exploración sin escribir SQL.**

**Tablero integrado** (`i-tablero.js`, una página): DuckDB-WASM + ECharts dibujan el mapa de calor y el abanico P10/P50/P90 de las 100 noches. Mediana de 3 corridas: **2,8 s desde que se abre la página hasta ver los dos gráficos** (arranque del wasm y carga 2,4 s, las dos consultas 0,5 s, dibujar 0,4 s; 1.189 celdas de calor y 73 puntos del abanico). Es una prueba técnica, no un diseño: el aspecto final del tablero es trabajo de diseño aparte, y esa prueba usó el ECharts completo (la página pesa 1,3 MB minificada), no el recorte por módulo. En el abanico se ve lo que el motor cuenta: la espera P90 de los paquetes creados hacia el minuto 180 llega a 60 min en las peores noches.

### 4.4 Streamlit y stlite
- **Streamlit 1.66.1** (servidor, `streamlit/app.py`, 30 líneas): arranca en 1,0 s; memoria 59 MB en reposo, **200 MB con la primera sesión y 201 MB con cinco**; 2,6–3,2 s hasta ver la tabla; frontend de 4,8 MB; el entorno virtual pesa 278 MB. Funciona bien para mirar resultados.
- **stlite 1.12.0** (la misma idea sin servidor): **21,5–22,4 s** hasta que aparece la app y **32,4 MB** descargados (25,9 MB de jsDelivr: Pyodide 314.0.3, numpy, pandas; 6,4 MB locales); necesita Internet en tiempo de ejecución (jsDelivr y PyPI) salvo que se autoaloje todo.
- **INFERENCIA:** ninguno sirve para el producto: Streamlit exige un servidor por sesión (costo que el fundador quiere evitar) y ambos tienen el aspecto de Streamlit. Sí sirven para que Claude o el fundador miren resultados internos en minutos.

## 5. Integración propuesta

1. **Oráculo en las pruebas** (cuando el cierre paralelo de `apps/anden/simulador/` termine; yo no lo toqué): copiar `oraculo/{hub_simpy.py,crear_modelos.py,generar_dorados.py,modelos/,dorados/,lib-motor.mjs,prueba/}` a `apps/anden/simulador/verificacion/oraculo/` y agregar `"oraculo": "node --test verificacion/oraculo/prueba/oraculo.test.mjs"`. **No va dentro de `npm test`** (51 s sumaría a un presupuesto de < 3 min que hoy ya se estira a 6 con la máquina compartida): va junto a `npm run verificar` y a `npm run informe`. Python solo se necesita para regenerar los dorados (`python3 -I oraculo/generar_dorados.py`) cuando cambie una regla del hub: el dorado nuevo es parte de la decisión de «versión nueva del motor». Con semilla fija la prueba de Node es determinista (pasa o falla siempre igual).
2. **Sello:** sumar al comprobante «motor validado contra un oráculo independiente (SimPy 4.1.2): 5 modelos exactos y 3 escenarios estadísticos, fecha». Es evidencia que FlexSim no publica.
3. **Ampliar el oráculo** (en orden): ocupación de bandejas individuales y paquetes de dos bandejas (hoy el modo F3-lite no los modela y aun así coincide; INFERENCIA: en estas plantillas la competencia por bandejas no mueve los KPI); `hub-lazo-noche` (60 rampas); temporarios, fatiga y retén; el plan en lista explícita.
4. **Tableros:** trozo aparte `tableros/` (DuckDB-WASM `eh` + ECharts por módulo + uPlot), cargado solo al abrir «análisis de cien noches» o «modo ingeniero»; la primera carga de 150 KB no cambia. Datos: el Worker escribe Arrow IPC (stream) por noche y DuckDB-WASM consulta; el mapa de calor y el abanico salen de consultas agregadas. Para «explorar libre» se puede sumar Perspective en otro trozo. El mapa de las cien noches y la escena actual (Canvas propio) **no se reemplazan**: no hay prueba de que algo sea superior.
5. **Streamlit** (`streamlit/app.py` + `requirements.txt`) queda como herramienta de análisis interno para Claude: lee `integracion/salida/*.json` y `resultados/estadistico-*.json`.

## 6. Riesgos y límites

- **Independencia limitada:** el oráculo se escribió desde `corte-1.md` §6.7/§6.9 y, para lo que la especificación deja abierto (persistencia en la rampa, relevo en las pausas, caminata por distancia, desempates), **leyendo los bloques del hub del motor 1.1.0**. Es independiente en el código y en el paradigma, no en la lectura de las reglas: un error de diseño compartido no se ve; lo que sí prueba es que la implementación del motor (calendario, arreglos tipados, rueda de tiempos) hace lo que dice la regla. Las 85 pruebas contra teoría de colas siguen siendo el ancla externa del motor; un oráculo escrito por otra persona o desde la especificación sola sería más fuerte.
- **El piso exacto depende del orden de desempate** de eventos simultáneos: hoy coincide al milisegundo; un cambio legítimo del orden puede romperlo y exige un dorado nuevo (se documenta como cambio de versión).
- **Alcance del oráculo:** no cubre bandejas individuales, fatiga, temporarios ni `hub-lazo-noche`. La coincidencia en C1 es con la plantilla chica.
- **Medidas sin GPU:** WebGL por software (Perspective, echarts-gl) no mide una GPU real; los tiempos de Canvas se midieron con la máquina cargada. No se probó deck.gl, regl-scatterplot ni WebGPU para 1 M de puntos (es del frente de mapas y 3D).
- **ECharts:** no logré bajar el zoom de 200.000 o más puntos de varios segundos; puede haber una configuración que lo resuelva que no encontré; para lo agregado alcanza.
- **DuckDB-WASM:** la estable (1.32.0, 16-12-2025) va atrás del repo; 32,7 MB de wasm crudo (4,9 MB brotli) y arranque de ≈ 1,4 s; hilos experimentales. Sin red: se autoaloja todo.
- **Perspective** cambió de alcance de paquetes y de versión mayor (3 → 5) en pocos meses: fijar versión y vigilar.
- **uPlot** y **Plot** tienen su última versión publicada en el primer trimestre de 2025.
- **stlite** necesita Internet salvo autoalojar Pyodide y los wheels; sus versiones de Streamlit van un paso atrás.

- **Revisión independiente (paso 8 del skill `/herramientas`): no hecha.** Este frente corrió como subagente sin la herramienta para lanzar otro agente revisor. Lo sustituyen la sensibilidad con fallas sembradas (§4.1), la verificación contra los datos guardados y el control cruzado de las afirmaciones con las fuentes oficiales; falta que otro agente lea `oraculo/hub_simpy.py` y `oraculo/prueba/oraculo.test.mjs` sin conocer la conclusión.

## 7. Fuentes (consultadas el 30-10-2026)

- npm registry (versiones, licencias, fechas): `echarts`, `echarts-gl`, `uplot`, `@observablehq/plot`, `@perspective-dev/{client,viewer,viewer-datagrid,viewer-charts,server}`, `@finos/perspective` (deprecado), `@duckdb/duckdb-wasm`, `apache-arrow`, `react`, `react-dom`, `preact`, `@stlite/browser`, `pyodide`.
- PyPI: `simpy` 4.1.2 (24-05-2026), `streamlit` 1.66.1 (21-10-2026), `numpy`, `scipy`.
- Repositorios y sitios oficiales leídos: github.com/leeoniya/uPlot, perspective-dev.github.io, github.com/duckdb/duckdb-wasm, github.com/whitphx/stlite; READMEs de `@perspective-dev/viewer` y `@stlite/browser` dentro de los paquetes instalados.
- Medidas: `apps/anden/laboratorio/simulacion/resultados/` (`exacto.json`, `sensibilidad.json`, `estadistico-*.json`, `graficos.json`, `tamanos.json`, `streamlit.json`, `stlite.json`, `capturas/`); datos de las noches con el motor 1.1.0 (hub-chico@1.0.0, semilla 20261030).
