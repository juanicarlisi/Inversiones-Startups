# Andén · Plan técnico del corte 2 · y motor de render de Hub Nocturno (30-10-2026)

> **Qué es.** El plan con el que el corte 2 de Andén incorpora la tecnología elegida en `radar-tecnico.md`:
> - 3D del hub y del CD;
> - ruteo en calle y seguimiento en vivo;
> - VRP;
> - SimPy como oráculo en las pruebas;
> - tableros.
>
> Lo arma el arquitecto jefe sobre los cinco frentes con pruebas reales (`conocimiento/radar-tecnico-2026-10/`). Lo que el corte 2 traía
> en `diseno-maestro.md` §8 (planillas, validación por traza, arranque en caliente, IA, video) no se replanea acá. El §5 trae el plan del
> motor de render de Hub Nocturno, sin reiniciar la v1.
>
> **Etiquetas:** HECHO · MEDIDO · ESTIMACIÓN · HIPÓTESIS · INFERENCIA (`doctrina/02-estandares-de-evidencia.md`).
>
> **Lo que este plan no hace:** nada se publica ni se paga sin el OK del fundador (regla 8). Publicar cualquier plantilla de hub o de
> última milla pide antes la consulta legal (`diseno-maestro.md` §8, gates). Los números de cuadros por segundo de WebGL son hipótesis
> hasta C2-1.

## 0. En una página

1. **Tres frentes, un producto:**
   - **La escena en 3D** del hub, con la biblioteca de piezas del CD, a nivel de «años de desarrollo». Usa el mismo reproductor y solo se
     activa con GPU real; el 2D y el 2,5D siguen siendo el piso.
   - **La calle:** la plantilla 3 (nodo de última milla, ya prevista para el corte 2 en `diseno-maestro.md` §6) simulada por el mismo
     motor. Suma ruteo en calle por contracción en WebAssembly, plan de reparto (VRP) y seguimiento en vivo sobre un mapa.
   - **Rigor y análisis:** SimPy como oráculo en `verificacion/` (hub y última milla) y un trozo de análisis de N noches.
2. **Compuerta:** antes de fijar si el 3D sale por defecto y cuántos vehículos se muestran, se mide en GPU real (C2-1). Le pide al
   fundador 10 a 15 minutos.
3. **Barandas:** nueve controles medibles garantizan que el corte 1 no se rompe (§1).
4. **Tamaño honesto:** 13 a 19,5 sesiones (ESTIMACIÓN, §4; rev. 31-10: la suma original, 11,5–17,5, no coincidía con las filas). No entra en las 6–10 sesiones que el diseño maestro previó para todo el
   corte 2. Se propone partirlo en **2a «Ver y creer»** y **2b «La calle»**; el orden contra el resto del corte 2 lo decide el comité.
5. **Hub Nocturno:** el área «render» de la v1 se hace sobre el canvas 2D optimizado, que ya está medido (+40% de fps). PixiJS entra
   solo si cumple su regla en un equipo real.

## 1. Barandas: cómo no romper el corte 1 (se miden en cada paquete)

| # | Baranda | Cómo se mide |
|---|---|---|
| B1 | Los contratos congelados no cambian; todo lo nuevo va en archivos nuevos de `contratos/` | `git diff --stat` sobre los `contratos/*.ts` existentes = 0 líneas; prueba de arquitectura |
| B2 | Las huellas del corte 1 no cambian | Doradas de `hub-chico@1.0.0` y `hub-lazo-noche@1.0.0` idénticas con 5 semillas; R04 Node = Chromium en 95 de 95 claves |
| B3 | La batería sigue en 85 de 85 | `npm run verificar`; S01 y S02 fallan como deben |
| B4 | `npm test` tarda < 3 min con el equipo libre | Lo pesado va en scripts aparte: `oraculo`, `calles`, `reparto`, `banco3d`, `analisis` |
| B5 | La primera carga queda en ≤ 150 KB brotli (hoy 146,5) | `npm run banco` falla si se pasa; todo lo nuevo va en trozos a demanda |
| B6 | Capas respetadas | La prueba de arquitectura se amplía: `vista3d/`, `mapa/` y `analisis/` importan solo `contratos/` y los reproductores; `nucleo/` no importa nada nuevo; `calle/` y `reparto/` no usan DOM ni `Math.random` |
| B7 | Los recorridos del corte 1 siguen pasando | `npm run e2e`: 16 de 16, con 0 errores de consola. Base: README del simulador, criterio 8 (30-10). Rev. 31-10: la corrida del 31-10 00:35 en `integracion/salida/e2e.json` dio 13 de 16 por cierre del navegador en 360-oscuro mientras el corte seguía cerrándose; la base se confirma de nuevo cuando el corte 1 cierre, y el e2e corre con el equipo libre |
| B8 | Nada sale a terceros | Servidor solo en 127.0.0.1. Prueba de red: 0 pedidos fuera del origen en ejecución (PMTiles, wasm, glifos y fuentes autoalojados) y 0 a `tile.openstreetmap.org` |
| B9 | Licencias | Una prueba lee `package-lock.json` y los activos y falla con cualquier licencia fuera de MIT, BSD, Apache-2.0, ISC, Zlib, CC0, 0BSD o BlueOak-1.0.0. ODbL y CC BY solo como datos con atribución visible; SIL OFL 1.1 solo para fuentes tipográficas (los glifos Noto Sans del mapa), con su aviso. Rev. 31-10, la prueba tiene que: (a) mirar solo las dependencias de producción (`npm ls --omit=dev`), porque `@gltf-transform/cli` arrastra `sharp` y sus binarios `@img/sharp-libvips-*` son LGPL-3.0-or-later (herramienta de construcción, nunca distribuida), y las herramientas de construcción no van al `package-lock.json` del producto; (b) entender expresiones SPDX (`(MIT OR GPL-3.0-or-later)` de `jszip` y `(MIT OR Apache-2.0)` de `@maplibre/mlt` alcanzan con una opción permitida); (c) leer el campo legacy `licenses` (`json-bignum`, MIT) o el archivo LICENSE cuando falte `license`; (d) tratar como fallo cualquier MPL-2.0 transitiva (hoy: Perspective, ver `radar-tecnico.md` §2.7) |

## 2. Hallazgos que van al cierre del corte 1 (no esperan al corte 2)

1. **El oráculo y el motor 1.2.0.** Medido por el arquitecto el 31-10-2026: 6 de 9 pruebas del oráculo pasan.
   - Las 3 que fallan lo hacen solo en `horasPersonaPagadas` y `costoNoche` (|z| de 4,1 a 4,8): el motor da 126,19 h y el oráculo, de
     124,64 a 124,88 h. Coincide con el cambio de reglas de la 1.2.0 (los ausentes cobran medio turno y las horas de más llevan recargo).
   - No es un error del motor: es el oráculo desactualizado. Se resuelve en C2-2.
   - Mientras tanto, nadie debe citar «SimPy coincide» para el motor 1.2.0.
2. **`DOMINIO_F2.rampasLlenas` está declarado y no se controla.**
   - `hub/f2.ts` declara `{ rhoInduccionMax: 0.5, rampasLlenas: false }`, pero solo se controla ρ.
   - La app no usa F2 para decidir. Aun así, conviene que la batería y `consistencia-f2` exijan también «sin rampas llenas»: el oráculo
     midió que F2 subestima el fin en 33 min con `hub-chico`.
3. **Cola larga.** El 1,2% de los paquetes espera más de 60 min, con un máximo de 672 min en 125 noches.
   - Hay que abrir la biografía del peor paquete y decidir si es comportamiento real o un error, antes de cerrar el corte.
4. **Primer cuadro desde el enlace:** tarda 953 ms y la meta es 150. No es tema de este plan, pero lo condiciona: el 3D, el mapa y el
   análisis cargan siempre después del primer cuadro y nunca lo demoran. El «primer cuadro progresivo» (`integracion/NOTAS-CONTRATO.md`)
   conviene que vaya en 2a.

## 3. Paquetes de trabajo

Cada paquete tiene un solo dueño por archivo, como en el corte 1. Los criterios se miden con un script que queda en el repositorio.
«Escritorio» es el contenedor de 4 núcleos con la carga anotada. «GPU real» son los equipos de C2-1.

### C2-0 · Paso 0: contratos del corte 2 (aditivos)

- **Qué:** contratos nuevos, sin tocar los congelados.
  - `contratos/vista3d.ts`: `NivelGPU = 'A' | 'B' | 'C'`, `DeteccionGPU` (cadena del renderizador, `software`, nivel), `Vista3D` (la
    `Vista` con `piso: '3d'`) y `ElegirPisoGPU(det, medir3dMs, medirIsoMs)`, que devuelve `Piso | '3d'`.
  - `contratos/calle.ts`: `GrafoCalles` en CSR (`desde`, `hacia`, `pesoMs: Uint32Array`, `largoM`, `lon` y `lat`), `Caminos` (`tiempo`,
    `camino` sin asignar memoria) y `MatrizTiempos`.
  - `contratos/reparto.ts`: `InstanciaReparto`, `PlanReparto` y `Solucionador.resolver(inst, { semilla, iteraciones, inicial? })`.
    - `PlanReparto` = `rutas: { tipo, paradas }[]` más `procedencia`: solucionador, versión, semilla, iteraciones, costo evaluado y hash.
  - `contratos/traza-reparto.ts`: `TrazaReparto` (tramos de vehículo con referencia a camino, paradas, intentos fallidos) y
    `ReproductorReparto`. La `Traza` del hub, con su `geometria: GeometriaHub`, no se toca.
  - `contratos/viajes.ts`: `Viajes`, con coordenadas `Float32Array`, tiempos `Float32Array` relativos a `baseMs` e inicios `Uint32Array`.
    Es el formato que `TripsLayer` toma sin copiar.
  - `contratos/analisis.ts`: esquema Arrow del resumen por paquete y por noche, con unidades.
- **Aceptación:**
  - `tsc` en verde y B1.
  - Una prueba en Node por contrato, con una implementación de referencia, como el paso 0 del corte 1.
  - La entrada correspondiente en `integracion/CAMBIOS-CONTRATO.md`.
- **Estimación:** 0,5 sesiones.

### C2-1 · Banco en GPU real (compuerta)

- **Qué:** una página que corre sola (≈ 3 min por equipo) y guarda los resultados. Mide:
  - la escena 3D del laboratorio en los niveles A (PBR, sombra 2048, N8AO a media resolución) y B (Lambert o PBR sin IBL, sombra 1024,
    sin AO), con 5.000 y 20.000 paquetes;
  - la flota de deck.gl con 300, 1.000 y 3.000 viajes y estelas;
  - los 4 motores de Hub Nocturno (`autoprueba.html`).

  Informa la cadena del renderizador, p50 y p95 del cuadro, y la memoria cuando el navegador la da. Las escenas son **sintéticas del
  laboratorio**: ninguna plantilla de hub.
- **Cómo llega al equipo:** una página privada de claude.ai (Artifact, privada por defecto, con las librerías por CDN de versión fija).
  Si el entorno de la página no permite guardar resultados, muestra un código corto para copiar (INFERENCIA: a verificar al armarla).
  - **Rev. 31-10, regla 8:** subir esa página a claude.ai es una publicación, aunque quede privada y sea sintética. Se prepara «lista
    para apretar el botón» y **se publica solo con el OK del fundador**. Como el banco carga librerías por CDN en el equipo del
    fundador, B8 no se le aplica (B8 es del producto).
  - **Alternativa que no publica nada:** servir el banco por la red local del fundador con un servidor estático de solo lectura y
    `--lan`, como el de la autoprueba de Hub Nocturno (`apps/juegos/aviacion/laboratorio/servidor.mjs`, `juego.md` §5), y abrirlo
    desde el teléfono en la misma red.
- **Equipos:**
  - mínimo, la notebook y el teléfono del fundador;
  - ideal, un Android de gama baja y un iPhone viejo (decisión 3 de `diseno-maestro.md` §12).
- **Aceptación:**
  - Cifras de ≥ 2 equipos reales.
  - Tabla de umbrales A/B/C y techos de vehículos por equipo, escritos en `radar-tecnico.md`.
  - Decisión registrada de si el 3D sale por defecto.
- **Regla:** sin estas cifras, el 3D se ofrece como «Ver en 3D (beta)» a pedido, nunca por defecto, y el mapa usa un techo conservador de
  300 vehículos.
- **Estimación:** 0,5 sesiones, más 10 a 15 minutos del fundador.

### C2-2 · Oráculo SimPy dentro de `verificacion/`

- **Qué:**
  - Actualizar `hub_simpy.py` a las reglas del motor 1.2.0: medio turno de los ausentes, recargo de horas de más y la vuelta del puesto
    manual que espera lugar en la acumulación.
  - Sumar el modelo exacto **A6**, con ausencias y horas de más fijas, para que el piso exacto ejercite los costos.
  - Regenerar los dorados con el nombre de la versión (`simpy-oraculo@0.2.0+motor@1.2.0.json`).
  - Copiarlo a `apps/anden/simulador/verificacion/oraculo/` y agregar `npm run oraculo`, sin Python en el momento de probar.
  - Si la versión del motor no coincide con la del dorado, que falle con ese mensaje y no con ruido de KPI.
  - Sumar `hub-lazo-noche` al piso estadístico.
  - Agregar al comprobante el sello: «motor validado contra un oráculo independiente (SimPy 4.1.2): N modelos exactos y M escenarios
    estadísticos, fecha».
- **Aceptación:**

| Criterio | Umbral | Cómo |
|---|---|---|
| Piso exacto | A1–A6: 24 de 24 KPI con diferencia < 1e-9 | `npm run oraculo` |
| Piso estadístico | B1, C1, C2 y lazo-noche (≥ 100 noches por lado): \|z\| ≤ 3,5 en cada KPI y Kolmogorov-Smirnov p > 0,001 en fin, espera media y P90 | ídem |
| Sensibilidad | 7 fallas sembradas (las 6 de hoy más «ausentes sin costo»): la unión de los dos pisos las detecta las 7 | `sensibilidad.py` |
| Tiempo | ≤ 120 s, fuera de `npm test` | B4 |
| Revisión independiente | Un agente lee `hub_simpy.py` con la especificación, sin la conclusión; 0 hallazgos abiertos de gravedad alta | C2-I |

- **Estimación:** 0,5 a 1 sesión. No depende de C2-0: puede empezar apenas cierre el corte 1.

### C2-3 · Vista 3D del hub (base)

- **Herramientas** (`radar-tecnico.md` §2.1):
  - three 0.186.1 (`WebGLRenderer`), postprocessing 6.39.5 y N8AO 2.0.1 (rev. 31-10: postprocessing 6.39.5 exige `three < 0.187.0`;
    subir three pide subir antes postprocessing y repetir la prueba de equivalencia GPU/CPU);
  - glTF Transform 4.5.1 y meshoptimizer 1.3.0;
  - `bpy` 5.2.3 solo en la construcción, y gltf-validator en CI.
- **Qué:**
  - `vista3d/` como trozo a demanda.
  - `activos/`: los fuentes de `bpy` y el `.glb` generado con `npm run activos`.
  - Detección de GPU: rechaza SwiftShader y llvmpipe y mide el primer segundo.
  - **Vía A:** `posicionesAMatrices()` sobre `Reproductor.posiciones()`. La disposición fija sale de `Traza.geometria`.
  - Niveles A y B, y C sin 3D.
  - Al perder el contexto WebGL, vuelve al 2,5D.
  - Tocar un paquete por rayo.
- **Aceptación:**

| Criterio | Umbral | Cómo |
|---|---|---|
| Primera carga | Sin cambios (B5) | banco |
| Peso | Trozo 3D ≤ 300 KB brotli de JS (en el laboratorio, 287); activos ≤ 1,5 MB | banco |
| Activos | gltf-validator: 0 errores y 0 avisos | CI |
| Tocar | El rayo 3D da la misma entidad que `Reproductor.tocar` en ≥ 99% de 200 toques sintéticos | prueba en Chromium |
| Detección | Con SwiftShader o llvmpipe nunca se elige el 3D: 10 de 10 | prueba en Chromium |
| Sin GPU, forzado | Dibuja sin errores de consola y la captura difiere > 5% del fondo | e2e |
| Contexto perdido | Con `WEBGL_lose_context`, vuelve al 2,5D en el mismo instante y sin error | e2e |
| Memoria | Visor con 3D y hub de 24.000 paquetes ≤ 150 MB | CDP |
| Activación | De «Ver en 3D» al primer cuadro 3D ≤ 2,5 s en escritorio | e2e |
| Cuadro en GPU real | p95 ≤ 12 ms en el nivel A (notebook) y ≤ 33 ms en el B (teléfono medio). Un nivel que no cumple no se ofrece | C2-1 |
| Motor intacto | B2 | doradas |

- **Estimación:** 1,5 a 2,5 sesiones.

### C2-4 · 3D «años de desarrollo» y biblioteca del CD

- **Qué** (lo que el arquitecto vio en las capturas del laboratorio, `radar-tecnico.md` §4):
  - Operarios animados (animación de vértices horneada o esqueleto por instancias), con licencia limpia.
  - Edificio completo: envolvente, exterior nocturno, portones, señalética, matafuegos y barandas.
  - Piso con juntas y desgaste (Poly Haven, CC0).
  - Variación de cajas en tamaño, tono, etiqueta y giro.
  - Acoplados con tractor e interior.
  - Luz horneada con Cycles desde `bpy`, comparada contra N8AO.
  - LOD del paquete: 12 triángulos de lejos y 108 de cerca.
  - Modo director: tomas sobre los momentos de la traza, con profundidad de campo solo en la reproducción.
  - Incidentes con física de Rapier horneada, solo para eventos que están en la traza.
  - Biblioteca del CD (racks, autoelevador, muelles de cross-dock) lista para las plantillas 6 y 7. **Ninguna escena muestra una
    operación que el motor no simule.**
  - **Sprites del 2,5D horneados desde los mismos modelos de Blender**, para subir también el piso sin GPU. Reemplazan a los de hoy solo
    si ganan la comparación.
- **Los 12 delatores** (lista cerrada; cada uno tiene que quedar en 0):
  1. Personas sin esqueleto o sin ciclo de caminata.
  2. Vacío negro alrededor: sin envolvente, sin exterior ni cielo.
  3. Paredes y techo lisos, sin paneles, zócalos, portones, señalética ni elementos de seguridad.
  4. Piso uniforme, sin juntas, desgaste ni variación de rugosidad.
  5. Repetición visible de cajas, jaulas o pallets idénticos.
  6. Arranques y frenos instantáneos, saltos entre cuadros o paquetes que se atraviesan.
  7. Sombras con acné o «peter panning», o sin oclusión de contacto.
  8. Serrucho o parpadeo en geometría fina (mallas de jaulas, cintas) al mover la cámara.
  9. Luz plana: sin rebote, sin zonas, luminarias sin halo.
  10. Acoplados sin tractor, sin interior o con la boca negra.
  11. Escala incoherente, fuera de ±10% de la medida real.
  12. Cámara sin inercia, cortes bruscos, o interfaz que tapa la escena.
- **Aceptación:**

| Criterio | Umbral | Cómo |
|---|---|---|
| Delatores | 0 de 12, con capturas de 1280×720 y 360×740, 3 tomas y 2 temas | revisión independiente (agente con las capturas y la lista, sin la conclusión) |
| Credibilidad industrial | ≥ 8 de 10 en 2 de 3 revisores independientes, con rúbrica escrita antes de mirar | ídem |
| Continuidad del movimiento | Ninguna entidad se mueve entre cuadros más que su velocidad máxima física × dt + 1 cm, en 10.000 cuadros del hub chico | prueba en Node sobre el reproductor y la interpolación de la vista |
| Escala | Cajas delimitadoras de `activos.glb` a ±10% de una tabla de medidas con fuente | prueba en Node |
| Operarios | ≤ 2 ms de CPU por cuadro con 200 operarios (CPU 1×) | banco |
| Horneado contra N8AO | Con diferencia ≤ 2% de píxeles, se queda el más barato en el teléfono de C2-1 | banco |
| Sprites 2,5D horneados | Reemplazan a los actuales solo si el cuadro iso sigue ≤ 10 ms con CPU 4× (la regla de `ElegirPiso`) **y** 2 de 3 revisores los prefieren a ciegas | banco y revisión |
| Licencias | Cada activo con fuente y licencia; 0 activos CC BY o QAL en el producto | B9 |

- **Estimación:** 2 a 3 sesiones.

### C2-5 · Plantilla 3 «nodo de última milla» en el motor, con ruteo en calle

- **Qué:**
  - Paquete `calle/`: grafo CSR por ciudad, hecho con OSMnx en la construcción (CABA: 1,8 MB), con atribución ODbL; contracción
    `fast_paths` 1.0.0 en WASM, con el crate vendorizado y `serialize_32` precalculado; Dijkstra de respaldo para pesos que cambian.
  - Paquete `reparto/`: los bloques corren sobre el mismo `nucleo/`.
    - Bloques: carga, salida, tramo por calle, parada con servicio y ausente (reintento o vuelta).
    - Reglas: ventanas y jornada.
    - KPI: entregas a tiempo, fallidas, km, horas y costo por entrega.
  - `TrazaReparto`.
  - Plantilla `nodo-ultima-milla@1.0.0`: datos públicos, SUPUESTOS marcados, nombres genéricos.
  - **Determinismo:** pesos enteros en ms; el plan entra como dato (de C2-6) y nunca se resuelve durante la simulación.
  - **Oráculo SimPy de la última milla**, escrito por un agente que lee solo la especificación y no el código de `reparto/`. Así es más
    independiente que el del hub (`simulacion-tableros.md` §6).
- **Aceptación:**

| Criterio | Umbral | Cómo |
|---|---|---|
| Contracción = Dijkstra | Mismo costo en 10.000 de 10.000 pares de CABA; mediana ≤ 0,1 ms por consulta **y** ≥ 30× más rápida que el Dijkstra en CSR medido en la misma corrida. Rev. 31-10: el laboratorio dio 0,069 ms (43×) y el revisor reprodujo 0,094 ms (39×); 0,1 ms deja 6% de margen contra el ruido de la máquina, por eso se agrega el cociente | `npm run calles` |
| Matriz en el navegador | 201×201 en ≤ 3 s con la contracción precalculada (INFERENCIA de 2,8 s en `optimizacion.md` §5) | Chromium |
| R04 | Huella Node = Chromium en la plantilla 3, con 5 semillas | `npm run r04` |
| Oráculo | ≥ 3 modelos exactos con todos los KPI < 1e-9 y 2 escenarios estadísticos con \|z\| ≤ 3,5; ≥ 4 fallas sembradas detectadas | `npm run oraculo` |
| Invariantes | Entregados + fallidos + pendientes = total; ningún vehículo en dos lugares; ninguna parada fuera de su ventana sin marcar «atrasada»; jornada respetada o reportada. 0 alertas en 200 días | prueba |
| Realismo del tiempo de viaje | Contra Valhalla en 1.000 pares: mediana del cociente en [0,85; 1,15] y P90 en [0,70; 1,40]. Si no, se recalibra la tabla de velocidades (SUPUESTO) antes de mostrar números | CI con `pyvalhalla` |
| Presupuesto | Un día de la plantilla (≈ 3.000 paradas, 40 vehículos) en ≤ 400 ms en escritorio | banco |
| Corte 1 intacto | B2 a B4 | — |

- **Estimación:** 2 a 3 sesiones.

### C2-6 · Plan de reparto (VRP)

- **Qué:**
  - **Evaluador en TypeScript** (porte de `ruteo/py/modelo.evaluar`): es el juez único de todos los planes.
  - **vrp-cli 1.25.0** en WASM, en Workers (núcleos − 1, una semilla fija por Worker): respuesta inmediata y replanificación.
  - El plan entra al modelo como **parche con su procedencia**, y la receta lo guarda.
  - Replanificación con arranque en caliente ante ausencias, demoras y pedidos nuevos.
  - **Vara en CI:** PyVRP 0.14.1 nativo (10 semillas × 60 s), OR-Tools 9.15 y VROOM → PyVRP dan el «mejor conocido» de cada instancia.
  - **Spike:** el núcleo C++ de PyVRP compilado a WASM directo, más el porte del bucle ILS y del manejo de penalidades (≈ 550 líneas).
- **Aceptación:**

| Criterio | Umbral | Cómo |
|---|---|---|
| Evaluador | TS = Python en las 38 soluciones con rutas guardadas en `ruteo/resultados/` (conteo del revisor, 31-10-2026; el plan decía «≥ 40», que hoy no existen: los otros 6 archivos son resúmenes), más las que se agreguen: costo idéntico en mUSD y misma factibilidad | `npm run reparto` |
| Reproducibilidad | Misma instancia, semilla e iteraciones dan el mismo plan (hash) en Node y Chromium, 10 de 10. El tiempo nunca es el presupuesto de un plan que entra a la receta | ídem |
| Calidad en el navegador | En 3 instancias de la plantilla 3 (150, 300 y 600 paradas; flota dominante y ruteo pesando), el mejor de la cartera del navegador a 30 s queda ≤ 3% sobre la vara con flota dominante y ≤ 5% con ruteo pesando | CI y Chromium |
| Interactivo | Primer plan factible de 200 paradas en ≤ 1,5 s en escritorio, contando el arranque | Chromium |
| Replanificación | ≤ 50 paradas en ≤ 2 s, a ≤ 1% del resultado a 10 s | Chromium |
| Spike de PyVRP en WASM | Se adopta si reproduce el plan nativo exacto a 3.000 iteraciones, en ≤ 2× el tiempo nativo y con ≤ 1,5 MB brotli. Si no, se descarta | laboratorio |
| Licencias | En el navegador, solo Apache-2.0 y MIT (Pyodide queda afuera; `radar-tecnico.md` §2.5) | B9 |

- **Regla de corte:** si la cartera del navegador no llega a la calidad y el spike falla, se propone PyVRP en un servidor, con el costo
  medido y el OK del fundador. Mientras tanto, el plan se muestra como «plan sugerido (navegador)».
- **Estimación:** 1,5 a 2,5 sesiones.

### C2-7 · Mapa y seguimiento en vivo

- **Qué:**
  - Trozo `mapa/`: MapLibre 6.13.0 con `@deck.gl/maplibre` 9.4.0, intercalado.
  - `TripsLayer` alimentada por `Viajes`; el adaptador corre en el Worker, desde `TrazaReparto`. Las cabezas siguen un cursor por
    vehículo.
  - Vehículos:
    - a zoom de ciudad, puntos o flechas;
    - a zoom de calle (≥ 16), modelos propios de la fábrica de Blender;
    - tamaño en metros, con un mínimo en píxeles;
    - color por estado: en ruta, atrasado, volviendo, fallida.
  - Mapa base:
    - extracto PMTiles autoalojado, con `@protomaps/basemaps` 5.7.2 en español y oscuro, **sin comercios ni marcas**;
    - huellas de Overture como volumen neutro;
    - atribución visible.
  - **Piso sin GPU:** primero se prueba `protomaps-leaflet` 5.1.0 + Leaflet 1.9.4. Si no cumple, un Canvas 2D propio sobre el grafo CSR.
- **Los 6 delatores del mapa:**
  1. Vehículos más grandes que una manzana.
  2. Comercios y marcas en el mapa base.
  3. Colores de estela sin significado.
  4. Vehículos superpuestos sin agrupar a zoom de ciudad.
  5. Alturas inventadas presentadas como reales.
  6. Cabezas que saltan.
- **Aceptación:**

| Criterio | Umbral | Cómo |
|---|---|---|
| Equivalencia del adaptador | La posición desde `Viajes` en t queda a ≤ 1 m de la interpolación de la traza (1.000 muestras), con error de tiempo ≤ 1 ms tras restar la base | prueba en Node |
| Peso | Trozo del mapa ≤ 700 KB brotli de JS; extracto de CABA ≤ 50 MB (si no, se baja el zoom máximo) | banco |
| Primer cuadro del mapa | ≤ 3 s en escritorio | e2e |
| GPU real | 1.000 vehículos con estelas a p95 ≤ 33 ms en la notebook; techos fijados por equipo | C2-1 |
| Piso sin GPU | 300 vehículos en ≤ 10 ms por cuadro con CPU 4× | banco |
| Terceros | 0 pedidos fuera del origen y 0 a `tile.openstreetmap.org` | B8 |
| Atribución | Visible en el 100% de las capturas e2e | e2e |
| Calidad | 0 de 6 delatores en la revisión independiente | C2-I |
| Alturas | 0 alturas sintéticas visibles como reales | prueba sobre la marca del GeoJSON |

- **Estimación:** 1,5 a 2 sesiones.

### C2-8 · Análisis de N noches (tableros)

- **Qué:**
  - Trozo `analisis/`: el Worker escribe Arrow IPC por noche (resumen por paquete) y DuckDB-WASM 1.32.0 (bundle `eh`, autoalojado,
    **versión exacta**) lo consulta.
  - ECharts 6.1.0 por módulo: mapa de calor, abanico P10/P50/P90 y P99 por camión y ruta.
  - uPlot 1.6.32 para las series de la línea de tiempo, sincronizadas con el cabezal.
  - Raster de densidad para las nubes de 1 M de puntos.
  - ~~Perspective, solo si el modo ingeniero lo pide.~~ Rev. 31-10: **fuera del producto**: trae `leb128` y `buffer-pipe` (MPL-2.0)
    por dependencia transitiva y B9 lo rechazaría (`radar-tecnico.md` §2.7). El modo ingeniero queda con DuckDB-WASM (SQL) hasta que Perspective cumpla B9.
  - La pantalla «cien noches» del corte 1 no cambia.
- **Aceptación:**

| Criterio | Umbral | Cómo |
|---|---|---|
| Primera carga | Sin cambios (B5) | banco |
| Apertura | Dos gráficos en ≤ 3 s en escritorio, desde cero (en el laboratorio, 2,8 s) | e2e |
| Consultas | Q1–Q5 en ≤ 100 ms cada una sobre 100 noches del hub chico (≈ 810.000 paquetes) | Chromium |
| Exactitud | Igual a la agregación JS de `experimentos/` dentro de 1e-6 min | prueba |
| Nube de 1 M | Mediana ≤ 60 ms de primer cuadro y por paso de zoom (CPU 1×). Rev. 31-10: el laboratorio dio 32–47 ms y zoom de 37–48 ms de mediana, pero un máximo de zoom de 150 ms en una de 3 corridas; el umbral es sobre la mediana | Chromium |
| Memoria | ≤ 250 MB con el análisis abierto | CDP |
| Terceros | 0 pedidos a CDN | B8 |
| Cursor | Actualizar las series cuesta ≤ 16 ms | Chromium |
| Teléfono | Se ofrece con aviso de peso (4,9 MB) | e2e en 360×740 |

- **Estimación:** 1 a 1,5 sesiones.

### C2-I · Integración y salida

- **Qué:**
  - Ensamblado y recorridos nuevos de punta a punta (3D sí y no, mapa, plan y replanificación, análisis), en 360×740 y 1280×800, claro
    y oscuro.
  - Banco ampliado, R04 de la plantilla 3 e informe de salida.
  - Archivo de licencias y atribuciones, y README.
  - **Revisión independiente obligatoria** (agente `general-purpose` con el código y el criterio, no la conclusión) de:
    - `oraculo/hub_simpy.py` y el oráculo de la última milla;
    - el evaluador TS;
    - el adaptador `Viajes`;
    - el puente con la contracción;
    - el shader `GLSL_HEAD`, si se usa la vía B.
  - Corregir lo que encuentre.
- **Aceptación:**
  - Todos los criterios de C2-0 a C2-8 en verde, o listados con su razón.
  - Los 12 criterios del corte 1 en el mismo estado que hoy o mejor.
  - 0 hallazgos abiertos de gravedad alta.
  - `npm test` < 3 min.
- **Estimación:** 1 a 1,5 sesiones.

## 4. Orden, paralelismo y capacidad

```
C2-0 contratos ──┬─▶ C2-3 3D base ──▶ C2-4 años de desarrollo
                 ├─▶ C2-8 análisis
                 └─▶ C2-5 última milla + calle ──┬─▶ C2-6 VRP
                                                  └─▶ C2-7 mapa y seguimiento
C2-2 oráculo (independiente, apenas cierra el corte 1)
C2-1 banco en GPU real (independiente; habilita los valores por defecto de C2-3, C2-4 y C2-7)
C2-I al final de cada ola
```

| Paquete | Sesiones (ESTIMACIÓN) | Ola |
|---|---|---|
| C2-0 contratos | 0,5 | 2a |
| C2-1 banco en GPU real | 0,5 (+ 10–15 min del fundador) | 2a |
| C2-2 oráculo | 0,5–1 | 2a |
| C2-3 3D base | 1,5–2,5 | 2a |
| C2-8 análisis | 1–1,5 | 2a |
| C2-4 años de desarrollo | 2–3 | 2b |
| C2-5 última milla y calle | 2–3 | 2b |
| C2-6 VRP | 1,5–2,5 | 2b |
| C2-7 mapa y seguimiento | 1,5–2 | 2b |
| C2-I (dos veces) | 1–1,5 cada vez | 2a y 2b |
| **Total** | **13–19,5** (rev. 31-10: con C2-I dos veces; la suma original, 11,5–17,5, no coincidía con las filas; no incluye el «primer cuadro progresivo», que no tiene estimación) | |

**Método.** Por analogía: cada frente del radar fue cerca de una sesión de laboratorio. Pasarlo a producción con contrato, pruebas e
integración cuesta 1,5 a 2,5 veces más (la misma regla de `diseno-maestro.md` §8). Es gruesa.

**Propuesta para el comité** (la capacidad de Max 5x se comparte; Andén le cede el lugar a Senda y a Hub Nocturno):
- **2a «Ver y creer»**, diciembre a enero, ≈ 5–7,5 sesiones (rev. 31-10: C2-0, C2-1, C2-2, C2-3, C2-8 y C2-I; más el primer cuadro
  progresivo, sin estimar): C2-0, C2-1, C2-2, C2-3, C2-8 y el primer cuadro progresivo. Lo que ya existe
  queda verificado de forma independiente y se ve en 3D.
- **2b «La calle»**, febrero a marzo, ≈ 8–12 sesiones (rev. 31-10: antes decía 7–10; suma C2-4, C2-5, C2-6, C2-7 y C2-I): C2-4, C2-5, C2-6 y C2-7.
- El resto del corte 2 del diseño maestro (planillas, validación por traza, arranque en caliente, IA, video) se ordena contra esto en el
  comité.

**Cómo se trabaja** (doctrina 09 y directriz del 30-10-2026):
- Un `constructor` por paquete y un revisor independiente por ola.
- `investigador-tecnologico` solo si aparece una necesidad que el radar no cubre.
- Para verificar y para tareas mecánicas, el modelo liviano; resúmenes, no informes completos, entre agentes.
- **Un flujo pesado de Chromium por vez:** el ruido de la máquina compartida invalidó comparaciones finas en los cinco frentes.

## 5. Hub Nocturno: motor de render sin reiniciar la v1

**Contexto (README del juego):**
- El modelo y la interfaz de la v1 están terminados.
- Falta el área «render»: la noche como espectáculo, el hub como maqueta, aviones con personalidad y 30 fps con 150 aviones.
- En el capítulo 3 los jugadores llegan a 300–550 aviones.
- Hay tareas del modelo en curso (HN-30, HN-32, HN-52). **El render cambia solo `js/render.js` y un `js/atlas.js` nuevo, y mantiene las
  exportaciones** (`dibujar`, `crearCamara`, `tocar`, `posAvion`, `proyectar`, `POS`). Rev. 31-10: la lista omitía `aPantalla`,
  `aMundo`, `curva` y `puntoCurva`, que también exporta `render.js`; `main.js`, `entrada.js` y `objetivos.js` usan `R.aPantalla` y
  `R.aMundo` 9 veces. **Se mantienen las 10 exportaciones**, y una prueba compara la lista antes y después. Antes de empezar, `git log` y `git diff` confirman
  que ninguna tarea en curso toca `render.js`; si alguna lo toca, el render va después.

| Paso | Qué | Aceptación (medible) | Sesiones |
|---|---|---|---|
| **HN-R1** Canvas optimizado en producción | Pasar a `js/render.js` los 4 cambios de `laboratorio/escena/canvas2d-opt.js`: capa fija aparte con firma de cámara y rutas, atlas de siluetas, balizas y luces en 2 `Path2D` por color, caché de `measureText` | `npm test` y `npm run navegador` en verde. Diferencia ≤ 0,1% de píxeles (umbral 24/255) contra la captura actual en las 3 paletas, de día y de noche (6 capturas). ≥ +30% de fps con CPU 4× en `autoprueba.html`, en rondas intercaladas (en el laboratorio, +44%). ≤ 1.000 llamadas por cuadro con 300 aviones. Con 550 aviones en vuelo, ≥ 30 fps con CPU 1× en este entorno (rev. 31-10: umbral sin medida previa; el laboratorio llegó a 300 aviones en vuelo, 43,6 fps con el canvas optimizado, 1 sola corrida; si no se cumple, se anota la causa y no se compensa con Pixi sin la regla de corte) | 0,5 |
| **HN-R2** Cámara en movimiento | Durante el arrastre y el zoom se transforma el mapa de bits de la capa fija (dibujada con 25% de margen) y se redibuja nítida al soltar (INFERENCIA: técnica estándar, no medida) | p95 durante un zoom continuo ≤ 1,3× el p95 con la cámara quieta; nitidez de vuelta ≤ 150 ms después del gesto; 0 bordes vacíos | 0,5 |
| **HN-R3** La noche como espectáculo, en canvas | Halos aditivos (`lighter`) desde el atlas para luces de ciudad, balizas y luces de navegación; estelas en un búfer circular; el hub como maqueta con sprites prehorneados en la fábrica de Blender de Andén (estilos 1929, 1946 y 1970: infraestructura compartida de la cartera); aviones con alabeo en los virajes y luces propias | Costo ≤ +15% sobre HN-R1 con CPU 4×. 150 aviones a ≥ 30 fps con CPU 1×. Revisión independiente con rúbrica: ≥ 8 de 10 en «la noche como espectáculo». **Esto es también la prueba de la regla de Pixi:** si un efecto no se logra con sprites aditivos, queda anotado | 1 |
| **HN-R4** Equipo real (opcional) | La misma página de C2-1 corre los 4 motores del juego en un equipo de 4 GB, si el fundador tiene uno | Cifras de fps, p95 y memoria del equipo | — |
| **HN-R5** PixiJS (condicional) | Solo si HN-R4 cumple la regla de `radar-tecnico.md` §2.10: `crearRender({ tipo })`, carga a demanda (+135 KB), detección de GPU, `webglcontextlost` → canvas, autoprueba de 60 cuadros al arrancar | La regla de corte. Sin equipo real, Pixi no entra a la v1 y no se pierde nada: el canvas ya cumple | 1 (si aplica) |

**No se tocan:** el modelo, la interfaz, la capa de portal, el guardado ni los textos. El peso sigue en 76 KB brotli (+0), muy debajo de
la guía de 5 MB de Poki. Phaser, el globo de three, MapLibre y deck.gl no entran al juego (`radar-tecnico.md` §2.10).

## 6. Qué le pide al fundador

| # | Pedido | Por qué | Cuánto le pide | Cuándo |
|---|---|---|---|---|
| 1 | Abrir la página del banco en su notebook y en su teléfono (corre sola) o, si prefiere, decidir los 2–3 teléfonos usados (decisión 3 del diseño maestro) | Ninguna cifra de GPU es real todavía. Sin esto, el 3D sale solo como beta a pedido | 10–15 minutos | Antes de cerrar C2-3 (diciembre) |
| 2 | Sumar a la consulta legal ya pendiente las obligaciones ODbL al publicar el extracto del mapa y el grafo de calles, y la atribución CC BY de fuentes de Overture | Publicarlos probablemente obliga a ofrecerlos bajo ODbL (INFERENCIA de `calles-tracking.md` §3) | 0 extra (misma consulta) | Noviembre de 2026 |
| 3 | Autorizar el gancho de inicio de sesión que instala las herramientas (ya pendiente de DEC-2026-10-30-5) | Los laboratorios necesitan `bpy` (402 MB), Rust y las librerías de Python en cada sesión | 1 minuto | Cuando pueda |
| 4 | Nada para pagar ahora. Un servidor de VRP solo si C2-6 lo pide, con el costo medido (≈ USD 0,00024 por solución de 10 s, INFERENCIA a verificar en vivo) | Regla 8 | — | 2b, si aplica |

## 7. Riesgos del plan

| Riesgo | Señal temprana | Mitigación |
|---|---|---|
| La GPU real rinde menos que lo supuesto | C2-1 da p95 > 33 ms en el teléfono medio | 3D solo en el nivel A; se invierte en los sprites 2,5D horneados (C2-4) |
| El 3D sigue pareciendo «hecho rápido» | Delatores > 0 o rúbrica < 8 | Lista cerrada, revisores independientes y capturas en cada ola. Igual es Claude revisando a Claude (riesgo 9 del diseño maestro): usuarios beta reales, con OK, en cortes siguientes |
| `fast_paths` sin mantenimiento (última versión de 05-2024) | Un error del crate | Crate vendorizado, Dijkstra de respaldo, Valhalla como oráculo |
| DuckDB-WASM: la estable es vieja y `latest` es de desarrollo | Error en 1.32.0 | Versión exacta; las vistas estándar no dependen de DuckDB |
| Calidad del VRP en el navegador | C2-6 > 3–5% sobre la vara | Spike de PyVRP en WASM; servidor con OK |
| Soluciones no reproducibles | Hash de plan distinto entre Node y Chromium | El plan es dato con procedencia y presupuesto por iteraciones |
| El shader inyectado con `onBeforeCompile` se rompe al subir three | La prueba de equivalencia GPU/CPU falla | Vía A por defecto; versión fija |
| Datos: alturas y licencia ODbL | Sin dato oficial de alturas | Volumen neutro; consulta legal antes de publicar |
| Capacidad compartida con Senda y Hub Nocturno | `/usage` con cortes | 2a y 2b; Andén cede |
| La plantilla 3 cae en el dominio del empleador del fundador | Una plantilla parecida a una operación concreta | Solo datos públicos y nombres genéricos; consulta legal antes de publicar (riesgo 2 del diseño maestro) |

## 8. Fuentes

- `oportunidades/proyectos/anden/radar-tecnico.md`: todas las herramientas, con su versión, fuente oficial, licencia, prueba y regla de corte.
- `conocimiento/radar-tecnico-2026-10/{3d-cd,calles-tracking,optimizacion,simulacion-tableros,juego}.md`, del 30-10-2026, y sus
  laboratorios en `apps/anden/laboratorio/` y `apps/juegos/aviacion/laboratorio/`.
- `apps/anden/simulador/README.md` (estado del corte 1: 1.070 pruebas, 85 de 85, primera carga de 146,5 KB, primer cuadro de 953 ms),
  `integracion/NOTAS-CONTRATO.md`, `contratos/vistas.ts`, `contratos/traza.ts`, `hub/f2.ts` y `nucleo/version.ts` (motor 1.2.0). Leídos
  el 31-10-2026.
- Medido por el arquitecto el 31-10-2026: `node --test oraculo/prueba/oraculo.test.mjs` en `apps/anden/laboratorio/simulacion/` dio 6 de
  9, con las fallas solo en `horasPersonaPagadas` y `costoNoche`.
- `apps/juegos/aviacion/README.md` (área «render» pendiente; 300–550 aviones en el capítulo 3).
- `oportunidades/proyectos/anden/diseno-maestro.md` §4, §6, §8, §10 y §12, y `cartera/decisiones.md` (DEC-2026-10-30-4 y -5).

## 9. Revisión independiente (31-10-2026)

Un revisor que no escribió el plan lo leyó junto con `radar-tecnico.md`, comprobó lo citado y corrió pruebas. El detalle de lo
verificado, de lo reproducido y de lo que no se pudo comprobar está en `radar-tecnico.md` §7. No hizo commits, no publicó nada y no
tocó `apps/anden/simulador/` ni `apps/juegos/aviacion/`.

**Correcciones hechas en este archivo** (marcadas «rev. 31-10» donde se aplicaron):

1. §0 y §4, sesiones: la suma decía 11,5–17,5 y las filas dan **13–19,5** (con C2-I dos veces). La ola 2b es **8–12** (decía 7–10) y la 2a **5–7,5** (decía 5–7). El «primer cuadro progresivo» sigue sin estimación.
2. B9, licencias: la lista no aceptaba lo que el propio plan usa (fuentes SIL OFL del mapa, BlueOak y 0BSD en dependencias) y no distinguía producción de construcción: `sharp` y `@img/sharp-libvips-*` (LGPL) vienen con `@gltf-transform/cli`. Ahora la prueba lee solo producción, entiende SPDX y el campo `licenses`, y rechaza MPL-2.0 transitiva.
3. C2-1, regla 8: subir la página del banco a claude.ai es una publicación; se hace solo con el OK del fundador. Se agrega la alternativa por red local, que no publica nada.
4. C2-6, evaluador: «≥ 40 soluciones guardadas» eran **38** con rutas.
5. C2-8, Perspective: sale del producto por sus dependencias MPL-2.0 (B9 lo rechazaría). Y el umbral de la nube de 1 M pasa a ser sobre la mediana (el laboratorio tuvo un máximo de 150 ms en una corrida).
6. C2-5, contracción: el umbral de 0,1 ms deja 6% de margen contra el ruido (se reprodujo 0,094 ms); se suma el cociente ≥ 30× contra el Dijkstra de la misma corrida.
7. C2-3, three: postprocessing 6.39.5 exige `three < 0.187.0`.
8. §5, Hub Nocturno: `render.js` exporta 10 funciones y valores, no 6; `main.js`, `entrada.js` y `objetivos.js` usan `aPantalla` y `aMundo`. Hay que mantener las 10. El umbral de 550 aviones en vuelo no tiene medida previa.
9. B7, e2e: la base «16 de 16» es del informe del 30-10; la corrida del 31-10 00:35 en disco dio 13 de 16 por cierres del navegador.

**Sin cambios y comprobado:** las barandas B1 a B6 y B8 no se contradicen con nada hallado; las herramientas, versiones y licencias del §3 coinciden
con el radar corregido; el piso exacto del oráculo (diferencia relativa máxima 1,2e-15) admite el umbral de 1e-9 de C2-2; 6 de 9 del oráculo
con el motor 1.2.0 se reprodujo; no hay gastos ni publicaciones sin OK (el servidor de VRP, el gancho de sesión y la compra de teléfonos
quedan como pedidos al fundador en el §6).
