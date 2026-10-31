# Motor de render de Hub Nocturno · radar técnico (30-10-2026)

> Frente: motor de render del juego para portales (CrazyGames pide funcionar en un Chromebook de 4 GB; Poki, cargar en menos de 10 s). Laboratorio: `apps/juegos/aviacion/laboratorio/` (lee `js/` en solo lectura; no toca producto). Reproducible: `README.md` del laboratorio.
> Etiquetas: **HECHO** (fuente y fecha) · **MEDIDO** (reproducible con el laboratorio) · **INFERENCIA** (razonamiento propio). Todo consultado el 30-10-2026 salvo que diga otra fecha. No se gastó nada ni se publicó nada.
> **Dos límites de las medidas.** (1) Este entorno **no tiene GPU**: WebGL corre en SwiftShader (software), así que **ninguna cifra de WebGL sirve para decidir**; sí sirven las de canvas 2D y las de CPU del lado de JS. (2) La máquina es compartida: carga de 8 a 12 sobre 4 núcleos durante la matriz y de 4 a 8 en las corridas intercaladas. Los números absolutos son pesimistas; valen las comparaciones intercaladas y repetidas.

## 1. Veredicto

1. **Motor para portales: el canvas 2D actual, optimizado** (misma tecnología, sin librería nueva, sin GPU). Mismo cuadro (0,03 % de los píxeles difieren más de 24/255), **91 % menos llamadas** (9.129 → 834 por cuadro), **+40 % de fps con CPU normal (34,8 → 48,7) y +44 % con CPU frenada 4× (7,1 → 10,2)** (MEDIDO, §4). Es una ganancia segura y sin riesgo de plataforma; la implementación de prueba está en `escena/canvas2d-opt.js`.
2. **PixiJS 8.22.0 funciona y se ve igual, pero no se adopta ahora.** Se portó el cuadro completo (paridad visual, 1,5 % de píxeles distintos por texto y bordes; 10 llamadas de dibujo y 31.425 triángulos por cuadro). No se adopta porque: (a) sin GPU no hay medida de WebGL que valga (§4.3), (b) en el único renderer de Pixi que corre acá, el Canvas (experimental), no mejora al actual (6,4 fps contra 7,1 con CPU 4×; 14.915 llamadas por cuadro), (c) suma 135 KB de descarga y ~0,9 s de arranque en una red lenta, y (d) como WebGL por software está en baja, **el canvas 2D tendría que seguir existiendo como respaldo** de todos modos. Queda aprobado como capa opcional de efectos detrás de una regla de corte medible en un Chromebook real (§5).
3. **No se adoptan Phaser 4, three.js con globo, MapLibre con globo ni deck.gl** para este juego (§2). Los cuatro corren sobre los mismos datos del juego (capturas 05 a 08).
4. **Hallazgo que vale para todo el holding:** en Chromium 141 forzar `--use-angle=swiftshader` manda la composición por software y baja una página de relleno plano a 17 fps (60 sin la bandera). Y Chromium avisa «Automatic fallback to software WebGL has been deprecated»: **un juego que dependa de WebGL puede quedar sin red de seguridad en equipos sin aceleración**. Coincide con `conocimiento/anden-simulador-2026-10/tecnologia-web.md`: la vista 2D es el piso universal.

## 2. Elección (una por necesidad)

| Necesidad | Elegido · versión · fecha · licencia | Por qué | Regla de corte / reemplazo |
|---|---|---|---|
| Mapa del juego para portales | **Canvas 2D optimizado** (código propio) | 4 cambios en `render.js`: capa fija (mar, tierra, fronteras, rutas) en un lienzo aparte con firma de cámara y rutas; atlas de siluetas con `drawImage` en vez de vectores y `shadowBlur`; balizas y luces de navegación en 2 `Path2D` por color; caché de `measureText`. Cero KB, cero GPU | Con la cámara en movimiento la capa fija se redibuja y el costo vuelve al actual (no hay pérdida). Reemplazar por Pixi solo con la regla de §5 |
| Capa GPU opcional (efectos: bloom, estelas) | **PixiJS 8.22.0** · 01-10-2026 · MIT · 135 KB brotli | Probado en el cuadro real; `ParticleContainer` agrupa 300 aviones + luces en una llamada; texto, rutas y capas portadas sin trucos | No integrar hasta medir en GPU real (§5). WebGPU: no (la doc oficial lo marca «Experimental» y recomienda WebGL para producción) |
| Phaser | **No** (4.2.1 · 09-07-2026 · MIT · 290 KB brotli) | El renderer Canvas está **deprecado** (oficial) y lo nuevo es solo WebGL: sin respaldo sin GPU. Trae escenas, entrada y audio que el juego ya resolvió con su modelo y su interfaz propios. El doble de peso que Pixi | Si el juego se reescribiera sobre un motor de escenas |
| three.js con globo 3D | **No para el mapa de juego** (0.187.0 · 30-10-2026 · MIT · 108 KB lo usado) | El globo se ve muy bien (captura 05) pero no mejora la lectura de un mapa de un solo continente con rutas largas; los aviones de 300 puntos se pierden. Es la **única librería de GPU decidida para Andén** (`3d-cd.md`): si el juego pide GPU, esta va antes que sumar Pixi | Una toma cinemática de título o de fin de capítulo; carga diferida |
| MapLibre con globo | **No** (6.16.0 · 25-10-2026 · BSD-3 · 240 + 119 worker + 8 css KB brotli) | Funciona con estilo local (GeoJSON del juego, sin servidor de teselas) pero exige 4 archivos y un worker aparte, y todo texto necesita un servidor de glifos (no probado). Diseñado para mapas reales con teselas | Mapa real con calles: eso es Andén, no el juego |
| deck.gl | **No** (9.4.1 · 28-10-2026 · MIT · 220 KB brotli) | `_GlobeView` es **experimental** según su doc (sin precisión a zoom alto, sin agregaciones). `ArcLayer` con `greatCircle` es ideal para seguimiento de flotas en Andén, no para un juego casual | Frente de Andén |

## 3. Evidencia verificada (HECHO)

- **CrazyGames**, requisitos técnicos: «Games will be disabled on Chromium OS if they do not work smoothly on a 4GB RAM device»; tiempo hasta jugar ≤ 20 s para juegos alojados afuera; descarga inicial ≤ 50 MB (≤ 20 MB para la portada móvil); total ≤ 250 MB; ≤ 1.500 archivos; se espera Chrome y Edge. https://docs.crazygames.com/requirements/technical/ · https://docs.crazygames.com/requirements/intro/
- **Poki**: los jugadores «tend to move to another game if loading takes more than 10 seconds»; guía de tamaño «initial download should not exceed 5MB and 8MB in total»; 16:9 (640×360, 836×470 o 1031×580). Cita 130 KB comprimidos para un proyecto PixiJS, 290 KB para Phaser vacío y 151 KB para three.js. https://developers.poki.com/guide/requirements-quality · https://developers.poki.com/guide/web-engine
- **PixiJS**: v8.22.0 salió el 01-10-2026 (npm 8.22.0, MIT). Su doc marca WebGL «Recommended… Well supported and stable» y WebGPU «Experimental… recommended WebGL for production». El renderer Canvas entró en v8.16.0 con la advertencia «This feature is experimental»; la doc de renderers todavía lo rotula «coming soon», aunque el paquete 8.22.0 lo incluye y corrió (MEDIDO). `ParticleContainer`: «stable but experimental», todos los particles comparten una textura de origen. https://github.com/pixijs/pixijs/releases · https://pixijs.com/8.x/guides/components/renderers · https://pixijs.com/8.x/guides/components/scene-objects/particle-container
- **Phaser 4**: v4.0.0 (10-04-2026) reconstruyó el renderer WebGL; el Canvas sigue pero «officially deprecated»; no menciona WebGPU. https://phaser.io/news/2026/04/phaser-4-renderer-faster-cleaner-and-built-for-modern-games · https://github.com/phaserjs/phaser/releases
- **MapLibre**: el ejemplo oficial activa el globo con `map.setProjection({type:'globe'})` y está fijado a 6.16.0; la página no dice nada sobre estabilidad. https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/
- **deck.gl**: `_GlobeView` «experimental, which means it does not provide the compatibility and stability…»; `ArcLayer` tiene `greatCircle`, `numSegments` y `getHeight`; en globo hace falta `cullMode: 'none'` para ver los arcos por detrás. https://deck.gl/docs/api-reference/core/globe-view · https://deck.gl/docs/api-reference/layers/arc-layer
- **Estrangulación de referencia:** Lighthouse simula móvil con 150 ms de latencia, 1,6 Mbps de bajada y «a constant 4x CPU multiplier»; se usó eso. https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
- **Pérdida de contexto WebGL:** el evento `webglcontextlost` existe y no burbujea (el sitio de MDN no lista causas). https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event
- **Versiones y licencias** de las siete librerías: `npm view` del 30-10-2026 (todas permisivas: MIT o BSD-3). Instaladas con versión fija en `laboratorio/package.json`.
- **No se pudo leer:** el «Player device report» de Poki carga sus cifras por JavaScript y la página vino vacía.

## 4. Prueba real (MEDIDO)

**Escena.** El modelo real del juego (`js/modelo.js`) en la red grande del capítulo 3: **300 aviones**, 30 rutas con balizas en todas, 38 aeropuertos, cámara del capítulo, **de noche** (≈ 00:35 del juego), con luces de ciudad, balizas titilando y luces de navegación. Modo «real»: el modelo avanza como en `main.js` (116 aviones en vuelo y 184 en tierra). Modo «enjambre»: los 300 en vuelo y animados.
**Método.** Chromium 141.0.7390.37, 4 vCPU, 1366×768 a dpr 1 (Chromebook típico). CPU frenada con CDP `Emulation.setCPUThrottlingRate` (solo el hilo principal). 8 s de rAF tras 2 s de calentamiento; cuatro rondas intercaladas (A-B-C-A-B-C…) para cancelar la deriva de carga. Las funciones geométricas (`curva`, `posAvion`) son las mismas del juego: posiciones idénticas.

### 4.1 Cuadros por segundo (mediana de 4 rondas; modo real)

| Motor | fps CPU 1× | fps CPU 4× | Intervalo p95 a 4× | JS por cuadro a 4× | Llamadas por cuadro |
|---|---|---|---|---|---|
| Canvas 2D actual (producción) | 34,8 | **7,1** | 175 ms | 15,7 ms | 9.129 (2D) |
| **Canvas 2D optimizado** | **48,7** | **10,2** | 138 ms | 9,5 ms | **834** |
| PixiJS 8 · renderer Canvas | 35,5 | 6,4 | 217 ms | 28,6 ms | 14.915 (2D) |
| PixiJS 8 · WebGL (SwiftShader) | 1,6 | 1,5 | 917-1.467 ms | 6,6 ms de actualización + envío | 10 draws · 31.425 triángulos |

- Modo enjambre (300 en vuelo, 1 corrida): actual 30,6 / 10,3 · optimizado 43,6 / 12,6 · Pixi Canvas 34,1 / 9,1 · Pixi WebGL 2,0 / 1,8 fps (CPU 1× / 4×).
- 1920×1080 con CPU 4× (1 corrida): actual 6,0 · optimizado 8,2 · Pixi Canvas 6,0 · Pixi WebGL 0,6 fps.
- En el canvas 2D de este entorno la rasterización es por CPU **dentro del hilo principal** (por eso 4× lo frena tanto); en un Chromebook con aceleración esa parte pasa a la GPU. Lectura honesta: el orden entre variantes se mantiene en las 3 pruebas independientes, **los fps absolutos no son los de un Chromebook**.
- **Qué cuesta en JS** (MEDIDO): la geometría de los 300 aviones (`posAvion`) es solo 0,39 ms por cuadro (0,70 ms a 4×): no es el cuello de botella; lo es el volumen de llamadas de dibujo (9.129 por cuadro, de las cuales 3.000 son `lineTo` de la tierra y 1.249 son `fill` sueltos).
- **Paridad visual** (diferencia de píxeles contra la captura de producción, umbral 24/255): optimizado **0,03 %**, Pixi WebGL 1,52 %, Pixi Canvas 1,53 %. Capturas en `laboratorio/capturas/01` a `04`.

### 4.2 Peso, carga y memoria

| Candidato | Brotli -q11 (lo usado) | Enviado en la prueba (con el código del juego) | Hasta que corre el paquete (Slow 4G + CPU 4×) |
|---|---|---|---|
| Juego actual (`main.js`, modelo, render) | 76 KB | 52 KB | 0,65-0,78 s |
| Canvas 2D optimizado | +0 KB | 53 KB | 0,70 s |
| PixiJS 8.22.0 | 135 KB | 203 KB | 1,58-1,68 s |
| three.js 0.187.0 (globo) | 108 KB | 172 KB | 1,35 s |
| deck.gl 9.4.1 | 220 KB | 294 KB | 2,17 s |
| MapLibre 6.16.0 | 240 + 119 (worker) + 8 (css) KB | 450 KB | 2,12 s |
| Phaser 4.2.1 | 290 KB | 379 KB | 2,88 s |

- Ningún candidato se acerca a los límites: 5 MB iniciales de Poki, 10 s de carga, 20 s de CrazyGames. **El peso no decide.** («Hasta que corre» mide el paquete; el primer cuadro de WebGL en SwiftShader tarda de 1,4 s a más de 10 s según el candidato y no es representativo.)
- **Memoria** (MEDIDO, un navegador nuevo por candidato, RSS por pid): renderer + proceso de GPU = 350 MB (optimizado), 368 (actual), 398 (Pixi Canvas), 424 (Pixi WebGL), 411 (deck.gl), 428 (three.js), 439 (MapLibre), 446 (Phaser); montículo de JS de 4,5 a 15 MB. **Ninguno amenaza un equipo de 4 GB**; la memoria de GPU real es otra y no se pudo medir.

### 4.3 Por qué no hay cifra válida de WebGL acá (MEDIDO)

- WebGL crudo, un triángulo de pantalla completa (1,05 Mpx) más lectura de 1 píxel: **≈ 9 ms por pantalla** (≈ 115 Mpx/s).
- Pixi con **una escena vacía** (un sprite de mar): **150 a 250 ms por cuadro** a 1366×768 y 28 ms a 480×270. Con todas las capas, 600 ms. La bisección por capas a 480×270 da tierra ≈ 90 ms, aviones ≈ 50 ms, aeropuertos ≈ 60 ms: costos de SwiftShader, no de la escena (31 mil triángulos y 10 llamadas son triviales para cualquier GPU: INFERENCIA).
- **Lo que sí se midió del lado de CPU en Pixi WebGL:** actualización de la escena (aviones, balizas, luces) 2,0-2,6 ms con CPU 1× y 6,3-6,6 ms con 4× (modo real); el envío `render()` agrega 5-6 ms y 10-12 ms, pero incluye la contrapresión de SwiftShader (cota superior). **INFERENCIA:** con GPU real, Pixi costaría en el hilo principal entre 7 y 17 ms por cuadro a 4×, del mismo orden que los 9,5 ms del canvas optimizado: no hay ventaja de velocidad demostrable, solo de capacidad (efectos).

### 4.4 Candidatos de humo (capturas 05 a 08; 09 = WebGPU; modo enjambre, CPU 4×)

Corren los cuatro con los datos del juego (tierra, fronteras, rutas, aeropuertos, 300 aviones). three.js: tierra por textura, luces de ciudad, atmósfera, rutas en arco, aviones como puntos. MapLibre: globo con estilo local (necesita `setWorkerUrl` al worker aparte). deck.gl: `_GlobeView` con `GeoJsonLayer` + `ArcLayer` + `IconLayer`. Phaser: gráficos + 300 imágenes de atlas, bucle avanzado a mano. En SwiftShader dan 0,4 a 2,8 fps: **solo prueban que existen y se integran**, no su rendimiento.

## 5. Integración

1. **Canvas optimizado (recomendado ya):** llevar a `js/render.js` los 4 cambios de `escena/canvas2d-opt.js` (lo hace quien tenga el código de producto; esta sesión no lo toca). Se mantienen las exportaciones (`dibujar`, `crearCamara`, `tocar`, `posAvion`, `proyectar`, `POS`). `escena/atlas.js` es la copia de `silueta()` que alimenta el atlas; paletas de los 3 capítulos incluidas. Criterio de aceptación: `npm test` y `npm run navegador` en verde, diferencia de píxeles ≤ 0,1 % contra `capturas/01`, y al menos +30 % de fps contra el actual en `autoprueba.html` (en el Chromebook, con la CPU sin frenar).
2. **Autoprueba en dispositivo real (lista para apretar el botón):** `node laboratorio/servidor.mjs 8080 --lan` y abrir `/laboratorio/autoprueba.html` en un Chromebook de la misma red; corre los 4 motores 8 s cada uno y da fps, intervalos y JS, con GPU y memoria del equipo. Sirve archivos del juego en solo lectura dentro de la red local; no publica nada.
3. **Pixi (condicionado):** se integraría como paquete diferido (+135 KB, solo si hay GPU) detrás de una interfaz `crearRender({tipo})`, con el canvas optimizado como respaldo (no el renderer Canvas de Pixi, que cuesta más), detección de GPU por `WEBGL_debug_renderer_info` (rechazar SwiftShader y llvmpipe), manejo de `webglcontextlost` y una autoevaluación de 60 cuadros al arrancar. **Regla de corte para adoptarlo:** en un Chromebook de 4 GB real, «PixiJS WebGL» ≥ 55 fps con p95 ≤ 25 ms y al menos 20 % más fps que el canvas optimizado, **o** un efecto (bloom en las luces de ciudad, estelas) que se vea claramente mejor en captura lado a lado y no se logre con sprites aditivos en canvas. Si no, se queda el canvas.
4. **Textos y zoom en Pixi:** las etiquetas son `Text` (canvas a textura; cambiar de día a noche las vuelve a rasterizar, 38 etiquetas); al cambiar el zoom se reconstruyen tierra y rutas (0,5 ms con CPU 1×, 3,5 ms a 4×, solo CPU).

## 6. Riesgos y no verificado

- **NO VERIFICADO: rendimiento en GPU real.** Todo lo de WebGL se infiere de conteos de llamadas y de la parte de CPU. Se necesita un Chromebook (o equivalente) y la autoprueba.
- **Máquina compartida** (carga 4 a 12 sobre 4 núcleos): los números absolutos son pesimistas y cambian entre corridas; la ventaja del optimizado se repitió en 3 de 3 pruebas (matriz, intercalada, 1080p).
- **Canvas en Chromebook real:** con aceleración, el canvas 2D rasteriza en GPU y las cifras de 4× de acá no aplican; la reducción de 91 % de llamadas debería ayudar igual, pero no está medida en ese equipo.
- **Capa fija con cámara animada:** el optimizado se invalida con cada paso de cámara; durante un zoom el costo vuelve al del actual (medido 11,4 ms por cuadro con CPU 1× y cámara nueva en cada cuadro, incluida la rasterización).
- **Pixi Canvas** es experimental y re-traza todo cada cuadro. **Pixi WebGPU** es experimental: en este Chromium no hay adaptador sin banderas (`requestAdapter()` da `null`); con `--enable-unsafe-webgpu --use-webgpu-adapter=swiftshader` Pixi arranca pero dibuja negro y repite «A valid external Instance reference no longer exists» (captura 09; sus «55 fps» no valen porque no dibuja).
- **Phaser sin Canvas** (deprecado) y **MapLibre/deck.gl** con partes experimentales o archivos extra: menos opciones de respaldo.
- **Revisión independiente** (paso 8 del procedimiento): no hecha, esta sesión no dispone de agente revisor; queda al orquestador. El código del laboratorio no pasó revisión externa.
- Sin commits; `node_modules/` y `dist/` quedan fuera de git por el `.gitignore` del laboratorio.

## 7. Fuentes (consultadas el 30-10-2026)

CrazyGames: https://docs.crazygames.com/requirements/technical/ · https://docs.crazygames.com/requirements/intro/ · Poki: https://developers.poki.com/guide/requirements-quality · https://developers.poki.com/guide/web-engine · https://developers.poki.com/guide/player-device-report (sin datos) · PixiJS: https://github.com/pixijs/pixijs/releases · https://github.com/pixijs/pixijs/releases/tag/v8.16.0 · https://pixijs.com/8.x/guides/components/renderers · https://pixijs.com/8.x/guides/components/scene-objects/particle-container · Phaser: https://github.com/phaserjs/phaser/releases · https://phaser.io/news/2026/04/phaser-4-renderer-faster-cleaner-and-built-for-modern-games · MapLibre: https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/ · deck.gl: https://deck.gl/docs/api-reference/core/globe-view · https://deck.gl/docs/api-reference/layers/arc-layer · Lighthouse: https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md · MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event · Registro npm (`npm view`, 30-10-2026). Internos: `conocimiento/anden-simulador-2026-10/tecnologia-web.md` (§5.3, WebGL por software obsoleto), `conocimiento/radar-tecnico-2026-10/3d-cd.md` (three.js como única librería de GPU).
