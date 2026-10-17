# Andén · Tecnología web para un simulador de primer nivel (17-10-2026)

> Frente de investigación: **cómo construir en el navegador, sin servidor, el simulador logístico más potente del mercado** (P2,
> `oportunidades/proyectos/P2-anden.yaml`). Complementa a `frontera-ia.md` (motor medido, IA), `realismo-logistico.md` (parámetros)
> e `incumbentes.md` (competencia), todos en esta carpeta.
> Fecha de consulta de todas las fuentes: **17-10-2026**. Método: mediciones propias (scripts en `medicion-tecnologia/`), registro de
> npm y crates.io (versión, licencia y fecha), datos abiertos de compatibilidad (MDN browser-compat-data 8.1.6, caniuse-lite
> 1.0.30001816, `features.json` de WebAssembly) y lectura directa de documentación primaria.
> **Límite honesto:** el cupo de búsquedas web de la sesión (200 por turno, compartido con los otros frentes) se agotó al empezar
> este frente. Por eso casi todo sale de mediciones propias y de fuentes primarias leídas directo; lo que quedó sin verificar está en
> la §14. La documentación de FlexSim (error 530) y la ayuda de AnyLogic (403) no se pudieron abrir.
> Etiquetas: **HECHO** (fuente y fecha) · **HECHO medido** (medición propia reproducible) · **ESTIMACIÓN** (con método) ·
> **HIPÓTESIS** (a validar) · **INFERENCIA** (razonamiento propio).

---

## Resumen

1. **El navegador alcanza para un motor de primer nivel, y WebAssembly rinde más, pero poco más.** Medimos el mismo hub de 3 etapas en
   tres versiones: TypeScript/JS con arreglos tipados, **7–10 millones de eventos por segundo (M ev/s)**; Rust compilado a WebAssembly,
   **8,8–14,3 M ev/s** (1,35–1,46 veces el JS); Rust nativo, 12–15 M ev/s. Las tres dan **exactamente el mismo resultado**. Un motor
   «cómodo», estilo SimPy (procesos con generadores), rinde **3 a 5 veces menos** que el núcleo tipado, pero igual es unas 15 veces más
   rápido que SimPy. → **Núcleo propio orientado a datos en TypeScript, con un esquema declarativo arriba. Rust solo si lo piden las
   mediciones en teléfonos.** No hay librería de eventos discretos en JS viva: la última versión de SimScript es de 2021 y la de SimJS, de 2016.
2. **La reproducibilidad bit a bit entre dispositivos no viene gratis.** La especificación de JavaScript **no fija** cuánto da
   `Math.log`, `exp`, `sin` o `pow`: solo *recomienda* fdlibm. Medimos que `Math.log` de V8 y la `ln` de Rust compilada a WebAssembly
   **difieren en el 1,7% de los valores** (en 1 ulp, la última cifra binaria); `pow`, en el 4,7%; `sin` y `cos`, en el 0,9%. En el
   modelo del hub, 1 de cada 50 semillas da un resultado distinto en la última cifra. **Solución medida:** un `log` determinista en JS puro
   (adaptación de fdlibm) coincide en 5 millones de casos de 5 millones con el de V8 y cuesta el doble (20 contra 40 millones por segundo).
   La reproducibilidad exacta (el mismo resultado en el teléfono del alumno y en la PC del docente) es una **promesa diferencial posible**.
3. **El generador aleatorio que usamos en la primera medición (mulberry32) no sirve para miles de réplicas.** Su estado es de 32 bits,
   su autor reconoce que **no produce un tercio de los valores** posibles, y con semillas al azar 1.000 réplicas de una semana del hub
   chico ya tienen solapamiento casi seguro entre flujos; las de un hub de 90.000 paquetes por día superan el período entero. → **xoshiro128\*\* con saltos** (114 millones por segundo, medido) o **MRG32k3a** (el estándar de la
   simulación, 16 millones por segundo en JS) con **un flujo por fuente de azar**, para tener números aleatorios comunes.
4. **Las réplicas no necesitan SharedArrayBuffer.** Son independientes: alcanza con Web Workers y mensajes. Lo que sí importa es *cómo*
   se mandan los datos: devolver 1 millón de eventos como objetos tarda **5,1 s** (ida y vuelta); como arreglo tipado *transferido*,
   **8 ms** (más de 600 veces menos). La memoria compartida pide encabezados COOP/COEP que **rompen inserciones de terceros** (pago, videos,
   el simulador embebido en blogs): se usa solo como mejora, nunca como requisito.
5. **Sin placa de video, el 3D no existe; el 2D sí.** En el renderizador por software de Chrome, three.js tarda **28 ms por cuadro con
   1.000 cajas** y 286 ms con 10.000; Canvas 2D dibuja **10.000 rectángulos en 5,6 ms** (~28.000 por cuadro a 60 fps). Además, Chrome 141
   avisa que el paso automático a WebGL por software **quedó obsoleto**. → **La vista 2D es el producto; el 3D es una capa opcional**,
   cargada aparte y solo si hay GPU.
6. **WebGPU ya está en Chrome (Windows, macOS, ChromeOS; Android 12+ desde la versión 121), Safari 26 y Firefox 141+ en Windows**, pero no en
   Firefox para Linux ni para Android. Por versión de navegador, ~92% del uso argentino lo soportaría; el número real es menor porque
   depende de la placa y del sistema (hay que medirlo). three.js r186 con `WebGPURenderer` cae solo a WebGL 2 (99,8% de cobertura en
   Argentina). → **three.js como única librería de GPU** (131–211 KB gzip según el renderizador), cargada a demanda.
7. **Animar no es simular.** Las posiciones se *calculan* a partir de tramos que emite el motor (entidad, desde, hasta, t0, t1,
   perfil): para 100.000 bultos en cintas cuesta **1,1 ms por cuadro** (medido). Nada de motor de física: cintas y vehículos con
   cinemática cerrada (acumulación, perfiles trapezoidales, reservas de tramos), que además es determinista.
8. **El guardado tiene que ser un documento, no miles de filas.** En IndexedDB, 10.000 registros sueltos tardan 374 ms y 100.000,
   **23 s**; el mismo modelo de 100.000 objetos como **un solo documento, 62 ms**. Una traza de 1 millón de eventos pesa 19 MB; en formato
   columnar con deltas y gzip, **4,1 MB**.
9. **El simulador no puede abrirse con doble clic** desde el disco: módulos, Workers y `fetch` fallan en `file://` (medido en Chromium).
   La v0 de calculadoras sí funciona así porque usa scripts clásicos. → El simulador va **publicado y como PWA**, que lo deja
   funcionando sin conexión después de la primera visita.
10. **Cobrar sin backend propio es posible, con una función mínima.** Los «comerciantes de registro» (Lemon Squeezy, Polar, Paddle)
    cobran **5% + USD 0,50** y liquidan impuestos; emiten claves de licencia validables por API. Para que la app funcione *sin conexión*,
    una función en Cloudflare Workers (plan gratis: 100.000 pedidos por día) firma un token Ed25519 que la app verifica sola con WebCrypto
    (Chrome 137+, Firefox 129+, Safari 17+). **GitHub Pages prohíbe usos comerciales (SaaS)**: la versión paga va en Cloudflare Pages.
11. **Conviene introducir build para el simulador (no para las calculadoras):** TypeScript «borrable» (sin enums ni namespaces) +
    Vite 8. Con esa disciplina, Node 22.18+ corre los `.ts` directo en las pruebas y el día que Vite no sirva se cambia por
    cualquier otra herramienta sin reescribir nada.

**Cinco decisiones que salen de acá** (§11): (a) motor de datos tipados en Workers, sin DOM, con matemática y azar propios y
deterministas; (b) traza columnar de tramos como única interfaz entre motor y vista; (c) 2D en Canvas propio como base universal y
three.js a demanda para 3D y para 2D masivo; (d) modelo como documento versionado con parches (deshacer, historial, propuestas de la IA);
(e) PWA en Cloudflare Pages con aislamiento solo en la ruta del simulador y licencia firmada verificable sin conexión.

---

## 1. Cómo se midió

Entorno (HECHO medido, 17-10-2026): contenedor con Intel Xeon 2,1 GHz, 4 núcleos virtuales, 15 GB de RAM, **sin GPU**; Node 22.22.0
(V8, el motor de Chrome); Chromium 141.0.7390.37 sin interfaz (Playwright 1.56.1) con gráficos por software (SwiftShader); rustc
1.97.0 con destino `wasm32-unknown-unknown`; esbuild 0.28.2 para tamaños. La máquina es compartida: los tiempos varían ±15–30% entre
corridas, por eso se dan rangos. Todo se puede repetir con los scripts de `medicion-tecnologia/` (cómo correrlos, en la §14).

**Qué NO dice esta medición:** nada sobre GPU reales ni teléfonos. Los números de render son un **piso** (lo que pasa en una
computadora sin aceleración gráfica), no un techo.

---

## 2. Motor: TypeScript/JS o WebAssembly

### 2.1 Medición: el mismo modelo en cuatro estilos

Modelo: hub de 3 etapas en serie (inducción, clasificación, carga; 4, 6 y 5 puestos), 4 paquetes por minuto, servicio exponencial,
montículo binario, colas en anillo, mismo generador aleatorio (mulberry32) en todas las versiones. Horizonte de 2 millones de
minutos (32 millones de eventos). Scripts: `js_vs_wasm.mjs`, `desrs/` y `procesos.mjs`.

| Motor | Eventos por segundo | Paquetes por segundo | Resultado (tiempo medio en sistema) | Tipo |
|---|---|---|---|---|
| JS con arreglos tipados (V8) | **7,0–10,3 M** | 1,75–2,55 M | 4,812955991176639 min | HECHO medido |
| Rust → WebAssembly en V8 (36,7 KB; 15,0 KB gzip) | **8,8–14,3 M** | 2,2–3,6 M | **idéntico** | HECHO medido |
| Rust nativo (referencia) | 12,1–15,3 M | 3,0–3,8 M | **idéntico** | HECHO medido |
| JS «estilo SimPy» (procesos con generadores, objetos) | 5,7–6,8 M de pasos | **0,52–0,62 M** | (otra secuencia de azar) | HECHO medido |
| SimPy nativo (de `frontera-ia.md`) | — | 0,037 M | — | HECHO medido por el otro frente |

En cinco corridas alternadas, tomando la mejor de tres en cada una, WebAssembly fue **1,35–1,46 veces** más rápido que JS (HECHO medido).

**INFERENCIA (confianza media-alta).**
- Para un núcleo escrito con disciplina de datos (arreglos tipados, sin objetos por entidad), **JS queda a ~70% de WebAssembly**. La
  diferencia no justifica arrancar con dos lenguajes. Con modelos con muchas estructuras (rutas, atributos, reglas), la brecha puede
  crecer, porque el recolector de basura de JS pesa más: es una **HIPÓTESIS** que hay que medir con el modelo rico.
- El costo grande no está en el lenguaje sino en la **API**: el estilo «procesos» que tanto gusta (SimPy, el `Process` de AnyLogic) cuesta
  3–5 veces. Por eso el usuario (y la IA) no escriben código del motor: llenan un **esquema declarativo** que un compilador convierte en
  tablas para el núcleo rápido (lo mismo concluye `frontera-ia.md` por confiabilidad).

### 2.2 ¿Hay algo hecho para reutilizar?

| Proyecto | Versión y fecha | Licencia | Lectura |
|---|---|---|---|
| SimScript (npm, TypeScript) | 1.0.37 · 02-09-2021 | ISC | Sin publicaciones nuevas desde 2021 (HECHO, npm) |
| SimJS (npm) | 2.0.3 · 17-05-2016 | MIT | Abandonado (HECHO, npm) |
| NeXosim (Rust, ex-Asynchronix) | 1.0.0 · 03-02-2026 | MIT o Apache-2.0 | Simulación de sistemas asíncrona, viva (HECHO, crates.io) |
| sim (Rust y npm) | 0.13.1 · 26-04-2025 | MIT o Apache-2.0 | Eventos discretos con paquete npm (HECHO, crates.io) |
| rand_philox (Rust) | 0.2.1 · 03-10-2026 | MIT o Apache-2.0 | Philox con «contrato de reproducibilidad bit a bit» (HECHO, crates.io) |

**INFERENCIA:** no hay en JS un motor mantenido que valga la dependencia. El núcleo de eventos son ~300 líneas: se escribe propio y
se controla entero (determinismo, formato de traza, rendimiento). En Rust hay piezas sanas (Philox, libm) para una fase 2.

### 2.3 Qué ofrece hoy WebAssembly (HECHO, `features.json` de webassembly.org, consultado 17-10-2026)

| Función | Chrome | Firefox | Safari | Para qué le sirve a Andén |
|---|---|---|---|---|
| Hilos y atómicos | 74 | 79 | 14.1 (iOS 14.5) | Un solo modelo gigante en varios núcleos (raro; pide COOP/COEP) |
| SIMD de 128 bits | 91 | 89 | 16.4 | Estadísticas y cuentas vectoriales |
| SIMD «relajado» | 114 | 145 | con bandera | **Evitar**: resultados no deterministas por especificación |
| Memoria de 64 bits | 133 | 134 | con bandera | No hace falta (4 GB alcanzan) |
| Recolector (WasmGC) | 119 | 120 | 18.2 | No hace falta con Rust |
| Excepciones | 137 | 131 | 18.4 | Errores del motor |
| JSPI (promesas) | 137 | 153 | 27 | No hace falta |

Según la nota de no determinismo de WebAssembly (HECHO, repositorio `WebAssembly/design`), lo único no determinista en un módulo sin hilos
son **los bits de los NaN, el SIMD relajado y el agotamiento de recursos**. Las operaciones de punto flotante comunes no figuran como
no deterministas: un motor en WebAssembly **con su propia libm adentro** da los mismos bits en todos los navegadores (INFERENCIA, confianza alta).

---

## 3. Reproducibilidad: azar y matemática deterministas

### 3.1 El problema

La especificación ECMA-262 (HECHO, tc39.es, consultada 17-10-2026) dice que `acos`, `cos`, `exp`, `log`, `pow`, `sin`, `random` y
otras funciones «no están especificadas con precisión» y deja «cierta libertad en la elección de algoritmos»; solo *recomienda* (sin
exigirlo) los de fdlibm. `Math.random` usa «un algoritmo definido por la implementación» y no acepta semilla.

Medición (`libm_diff.mjs`, 2 millones de valores por función): `Math.*` de V8 contra la libm de Rust compilada a WebAssembly (port de musl).

| Función | Valores distintos | Diferencia máxima | Tipo |
|---|---|---|---|
| `log(x)`, x en (0,1) | **1,74%** | 1 ulp | HECHO medido |
| `log(1−u)` (el de la exponencial) | 1,72% | 1 ulp | HECHO medido |
| `pow(x, 1,7)` | **4,68%** | 1 ulp | HECHO medido |
| `sin`, `cos` en ±100 | 0,94% y 0,92% | 1 ulp | HECHO medido |
| `exp`, `sqrt` | 0 | — | HECHO medido (`sqrt` es exacta por norma IEEE 754) |

¿Cambia el resultado? (`propag.mjs`, 50 semillas por horizonte, cambiando solo el `log`): con 1 y 8 horas, 0 de 50; con 1 día y con 1
semana, **1 de 50**, con una diferencia relativa de 4×10⁻¹⁶ (HECHO medido). Numéricamente es irrelevante; para la confianza no:
rompe la comparación exacta de resultados (pruebas «doradas», huella de una corrida, «¿me da lo mismo que al profe?») y, en modelos con
empates o umbrales (un sensor que dispara a los 3,000 m, una regla «si la cola es mayor a 20»), puede bifurcar la historia entera
(INFERENCIA). No pudimos medir Firefox ni Safari (no hay esos navegadores en el entorno): queda pendiente (§14).

**Solución medida** (`detlog.mjs`): `log` en JS puro, adaptado de fdlibm (`e_log.c`), solo con `+ − × ÷`, que JavaScript sí define con
exactitud IEEE 754. **0 diferencias con el `Math.log` de V8 en 5 millones de valores** (incluidos subnormales y extremos), a mitad de
velocidad: 20 contra 40 millones por segundo con el generador incluido (HECHO medido). En un motor de ~100 ns por evento, suma
~10–25 ns por variable aleatoria (ESTIMACIÓN con esas cifras).

### 3.2 Generadores de números aleatorios

| Generador | Velocidad en V8 (medida) | Período y flujos | Calidad (fuente) | Uso en Andén |
|---|---|---|---|---|
| `Math.random` | 124 M/s | Sin semilla | Definido por cada navegador (ECMA-262) | **Prohibido en el motor** |
| mulberry32 | 98 M/s | 2³² | Su autor: no produce ~1/3 de los valores de 32 bits; falla PractRand a los 32 GB (gist de T. Ettinger, act. 2026) | Solo demos |
| sfc32 | 114 M/s | Sin saltos documentados | Sin verificar acá | No |
| **xoshiro128\*\*** | **114 M/s** | Con funciones de salto: secuencias sin solapamiento | «Generador de 32 bits para todo uso»; sembrar con SplitMix (prng.di.unimi.it) | **Por defecto en JS** |
| **MRG32k3a** (L'Ecuyer) | 16 M/s | Subsecuencias separadas por saltos de 2⁷⁶ (HECHO, cuRAND) | Estándar en simulación (paquete RngStreams); diseñado para aritmética de doble precisión exacta (conocimiento previo: el artículo original devolvió 403 hoy) | Opción de referencia académica |
| Philox 4×32-10 | No medido en JS | Basado en contador: el número *n* del flujo *k* se calcula directo | «Generador basado en contador» (cuRAND); crate con contrato bit a bit | **Para WebGPU** y réplicas masivas |

**INFERENCIA (cuenta).** Con *n* flujos de largo *L* sembrados al azar en un período *P*, la probabilidad de que dos se pisen es del orden
de n²·L/P. Hub chico (4 paquetes por minuto, ~4 números por paquete): una semana ≈ 161.000 números por réplica; con 1.000 réplicas,
n²·L/P ≈ 10⁶ × 1,6×10⁵ / 4,3×10⁹ ≈ 37 (mucho más que 1: solapamiento casi seguro). Hub de 90.000 paquetes por día con ~10 números por
paquete: 6,3 millones por réplica-semana; 1.000 réplicas = 6,3×10⁹, **más que el período entero** (4,3×10⁹). Con xoshiro128\*\* y saltos, cada
réplica y cada fuente tienen su tramo propio, sin depender de la suerte.

**Reglas de determinismo del motor** (INFERENCIA de diseño, confianza alta):
1. **Un flujo por fuente de azar** (llegadas, cada máquina, cada operario) y por réplica: así, cambiar una máquina no altera las llegadas
   (números aleatorios comunes, que achican la varianza al comparar escenarios).
2. **Tiempo en enteros** (por ejemplo, milisegundos guardados como enteros exactos en doble precisión, válidos hasta 2⁵³ ms ≈ 285.000
   años): elimina la «absorción» de diferencias al sumar a tiempos grandes y hace explícitos los empates.
3. **Desempate por número de secuencia** en el montículo: dos eventos simultáneos salen siempre en el mismo orden.
4. **Prohibidos en el motor:** `Math.random`, `Date.now`, `performance.now`, el orden de iteración de objetos con claves numéricas
   mezcladas, y `Math.log`/`exp`/`pow`/`sin` nativos (se usan los propios).
5. **Agregación ordenada:** sumar resultados de réplicas por índice, no por orden de llegada de los Workers (la suma en punto flotante
   no es asociativa). `Math.sumPrecise` existe desde Chrome 147, Firefox 137 y Safari 26.2 (HECHO, MDN BCD), pero el orden fijo alcanza.
6. **Huella de corrida:** hash del estado final y de la traza; las pruebas comparan huellas en Node y en navegadores.

---

## 4. Paralelismo: Workers, réplicas y memoria compartida

### 4.1 Réplicas en el navegador (HECHO medido, Chromium 141, `web/index.html`)

40 réplicas de una semana (10.080 min) del hub:

| Workers | Tiempo total | Eventos por segundo |
|---|---|---|
| 1 | 1,13 s | 5,7 M |
| 2 | 0,70 s | 9,3 M |
| 4 | 0,66 s | 9,7 M |

La escala se aplana de 2 a 4 porque el contenedor es compartido (INFERENCIA); en un equipo propio debería acercarse a lineal hasta los
núcleos físicos. Regla práctica: `navigator.hardwareConcurrency − 1` Workers y uno libre para la interfaz (INFERENCIA).

**ESTIMACIÓN (método: eventos por paquete × volumen ÷ velocidad medida).** Un hub como el CIT de Andreani (90.000 paquetes por día;
`realismo-logistico.md`) con 4–30 eventos por paquete genera 0,36–2,7 millones de eventos por día: **0,04–0,4 s por día simulado** en un
hilo de esta máquina. En un teléfono de gama media, entre 3 y 10 veces más (rango supuesto, sin medir).

### 4.2 Cómo pasar datos entre hilos (HECHO medido, ida y vuelta salvo memoria compartida)

| Forma | 100.000 eventos (3,8 MB) | 1.000.000 eventos (38 MB) |
|---|---|---|
| Arreglo de objetos `{t, id, k, x, y}` (clon estructurado) | 261 ms | **5.129 ms** |
| Arreglo tipado copiado | 83 ms | 561 ms |
| **Arreglo tipado transferido** | **1,6 ms** | **8,1 ms** |
| Memoria compartida (el Worker escribe 5 M de números y avisa) | 27 ms | 24 ms |

**INFERENCIA (confianza alta):** el formato de intercambio decide más que el lenguaje. Todo lo que cruza hilos viaja en **bloques
columnares transferidos** (un `Float64Array`/`Int32Array` por columna). La memoria compartida no le gana a la transferencia para pasar
resultados; sirve para *mirar* un modelo mientras corre (la vista lee el estado sin pedirlo).

### 4.3 SharedArrayBuffer: requisitos y costos

- **Requisitos (HECHO, MDN):** contexto seguro (HTTPS) y aislamiento de origen cruzado (`crossOriginIsolated`), que se logra con
  `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp` (o `credentialless`). Medido en Chromium 141:
  sin esos encabezados, `crossOriginIsolated = false` y `SharedArrayBuffer` no existe; con ellos, ambos disponibles (HECHO medido).
- **Soporte (HECHO, MDN BCD 8.1.6):** SharedArrayBuffer en Chrome 68 (Android 89), Firefox 79 y Safari 15.2; `COEP: credentialless` solo en
  Chrome 96+ y Firefox 119+ de escritorio, **no en Safari**. Por versión de navegador, 99,6% del uso argentino lo soporta (HECHO, caniuse-lite).
- **Costo (INFERENCIA, confianza alta, por cómo funciona COEP):** con `require-corp`, todo recurso o `iframe` de otro origen necesita
  permiso explícito (CORP o CORS). Eso rompe o complica el checkout embebido de un procesador de pagos, videos de YouTube, contadores de
  terceros y, sobre todo, **el simulador insertado en el blog de otro** (táctica de difusión de P2): la página que lo inserta no está
  aislada, así que ahí no habrá memoria compartida.
- **Dónde se puede activar:** GitHub Pages no deja fijar encabezados; existe `coi-serviceworker` (MIT, 0.1.7 del 09-07-2023), que los
  agrega con un *service worker* pero **recarga la página en la primera visita** y no puede ir en un CDN (HECHO, README). Cloudflare Pages
  acepta un archivo `_headers` con hasta 100 reglas por ruta (HECHO, documentación de Cloudflare).

**Decisión (INFERENCIA):** memoria compartida **opcional**: aislamiento solo en `/sim/` cuando haga falta; el resto del sitio (landing,
pago, versión insertable) sin aislar. El motor detecta `crossOriginIsolated` y elige el camino; nunca depende de eso.

### 4.4 WebGPU para réplicas masivas

`frontera-ia.md` ya la dejó como HIPÓTESIS (la literatura de simulación de eventos discretos en GPU reporta 25–100 veces de aceleración). Agregamos
una condición técnica: en GPU hace falta un generador **basado en contador** (Philox) y un modelo «vectorizable» (muchas réplicas iguales de un
modelo chico). Es una fase 3 para el análisis de riesgo («mil futuros»), no el motor principal (INFERENCIA).

---

## 5. Render 2D y 3D

### 5.1 Qué hay en los navegadores (HECHO)

| Tecnología | Estado al 17-10-2026 | Fuente |
|---|---|---|
| WebGPU | Chrome 113 en Windows, macOS y ChromeOS; Android 12+ con ARM, Qualcomm o Intel desde Chrome 121; Linux solo Intel Gen12+ (Chrome 144) y NVIDIA en Wayland (147); Firefox 141 en Windows, 145/147 en Mac con Apple Silicon (no Intel); **Firefox Linux y Android, no**; Safari 26 en macOS, iOS, iPadOS y visionOS | Wiki de gpuweb (editada 02-10-2026); MDN BCD |
| WebGL 2 | Universal (Safari 15+) | MDN BCD |
| OffscreenCanvas (dibujar en un Worker) | Chrome 69, Firefox 105, Safari 16.4 (WebGL 2 en Worker: Safari 17) | MDN BCD |
| Paso automático a WebGL por software | Chrome 141 muestra «Automatic fallback to software WebGL has been deprecated» | HECHO medido (consola) |

**Cobertura en Argentina por versión de navegador** (HECHO, caniuse-lite 1.0.30001816 del 13-10-2026, región AR): WebGL 2 99,8%;
OffscreenCanvas 99,3%; WebGPU 91,6% (+1,4% parcial); acceso a carpetas (File System Access) 37,5%. Uso: Chrome Android 49,9%, Chrome
escritorio 32,0%, Safari iOS 5,1%, Edge 4,7%, Firefox 2,8%, Samsung 2,5% (~58% móvil, INFERENCIA por suma). **Ojo:** caniuse cuenta
versiones, no placas ni versión de Android; el WebGPU real es menor y hay que medirlo con telemetría propia (HIPÓTESIS sobre el tamaño de la brecha).

### 5.2 Librerías (HECHO: npm para versión, fecha y licencia; tamaños medidos con esbuild 0.28.2, ESM minificado)

| Librería | Versión · fecha | Licencia | Tamaño (min / gzip / brotli) | Lectura |
|---|---|---|---|---|
| **three.js**, solo lo necesario con WebGL | 0.186.1 · 24-09-2026 | MIT | 524 / **131** / 108 KiB | Base de 3D |
| three.js con `WebGPURenderer` (`three/webgpu`) | ídem | MIT | 772 / **211** / 171 KiB | Cae solo a WebGL 2 (código fuente de r186) |
| PixiJS | 8.22.0 · 01-10-2026 | MIT | 532 / 154 / 126 KiB | 2D masivo por GPU |
| Babylon.js modular | 9.31.0 · 15-10-2026 | Apache-2.0 | 1.076 / 262 / 210 KiB | Bueno, más pesado |
| Babylon.js entero | ídem | Apache-2.0 | 8.005 / **1.789** / 1.288 KiB | Evitar importar todo |
| PlayCanvas | 2.23.3 · 15-10-2026 | MIT | 2.460 / 638 / 495 KiB | Motor de juegos: sobra |
| Konva (editor 2D) | 10.9.0 · 15-10-2026 | MIT | 191 / 59 / 50 KiB | Atajo posible para el editor |
| uPlot (series de tiempo) | 1.6.32 · 14-03-2025 | MIT | 51 / **23** / 20 KiB | Gráficos de resultados |
| ECharts (líneas y barras) | 6.1.0 · 19-05-2026 | Apache-2.0 | 526 / 180 / 153 KiB | Completo, pesado |
| idb / Dexie (IndexedDB) | 8.0.4 · 06-10-2026 / 4.4.6 · 10-09-2026 | ISC / Apache-2.0 | 3 / 1 / 1 KiB · 98 / 32 / 29 KiB | idb alcanza |
| Comlink (Workers como funciones) | 4.4.2 · 07-11-2024 | Apache-2.0 | 4 / 2 / 2 KiB | Opcional |
| fflate (zip y gzip) | 0.8.3 · 16-05-2026 | MIT | 11 / 6 / 5 KiB | Archivo `.anden` |

### 5.3 ¿Cuántas entidades a 60 fps?

**Sin GPU (piso medido, 1280×720, `web/index.html`):**

| Prueba | 1.000 | 10.000 | 50.000 | 100.000 | 1.000.000 |
|---|---|---|---|---|---|
| Canvas 2D, rectángulos móviles (ms por cuadro) | 0,79 | 5,6 | 29 | 59 | — |
| three.js `InstancedMesh`, cajas con luz (ms) | 28 | 286 | — | 2.470 | 12.834 |
| three.js, una malla por caja (ms) | 26,5 (1.000 llamadas) | 220 | — | — | — |

Lectura (INFERENCIA de estos números): en software, Canvas 2D sostiene **~28.000 elementos simples por cuadro** a 60 fps; el 3D, **menos de
~600 cajas**. Sin GPU, el cuello es rasterizar píxeles y no la cantidad de llamadas: instanciar no salva.

**Con GPU (fuentes de terceros; no las medimos):**
- PixiJS v8 (HECHO del fabricante, 05-03-2024; hardware no informado): 100.000 sprites en movimiento, ~15 ms de CPU y ~2 ms de GPU por cuadro
  (v7: ~50 y ~9 ms); con sprites quietos, 0,12 ms de CPU.
- PixiJS `ParticleContainer` (HECHO del fabricante, 03-10-2024, MacBook Pro M3): **200.000 sprites** o **1.000.000 de partículas** a 60 fps; el
  cuello pasó a ser la lógica de movimiento, no el dibujo.
- three.js `InstancedMesh` (anécdotas de foros vistas vía buscador, sin hardware verificado): 2,5 millones de cuadriláteros a 60 fps; 1 millón
  de cubos a 120 fps; 1 millón de instancias con lógica a 40–70 fps. Valen como orden de magnitud, no como dato.
- Babylon.js *thin instances* (HECHO, documentación): no crean objetos JS por instancia, pero el descarte por cámara es «todo o nada».

**ESTIMACIÓN de diseño (HIPÓTESIS hasta medir en 3 teléfonos y 1 notebook):** presupuesto de **10.000 entidades animadas en un teléfono de
gama media y 100.000 en una notebook con GPU integrada**. Un hub de 90.000 paquetes por día (62,5 por minuto) con 30–60 minutos de
permanencia tiene ~1.900–3.750 bultos en el piso a la vez (INFERENCIA por la ley de Little, con esa permanencia supuesta), así que el
presupuesto sobra para casi cualquier pyme.

### 5.4 Cómo se ve «espectacular» sin pagar en rendimiento (INFERENCIA de diseño)

- **Una sola librería de GPU: three.js.** La usa la vista 3D y también el 2D masivo (cámara ortográfica con instancias); así no se suma PixiJS.
- **Animación en la GPU:** cada instancia recibe su tramo (desde, hasta, t0, t1) como atributo; el *vertex shader* calcula la posición con el
  tiempo como único dato por cuadro. La CPU solo trabaja cuando cambia un tramo. Hace falta recién por encima de ~100.000 entidades (§6).
- **Estático horneado:** estanterías, muelles y planos se dibujan una vez (en un canvas aparte o con oclusión ambiental precalculada);
  por cuadro solo se dibuja lo que se mueve.
- **Niveles de detalle:** de lejos, un paquete es un punto de color por estado (esperando, en cinta, demorado); de cerca, una caja con etiqueta.
- **Mapas de calor** de congestión y de recorridos sobre el plano, calculados con *todas* las réplicas (percentil 90, no una sola historia):
  algo que la animación de una corrida no muestra.

---

## 6. Reloj, interpolación y cinemática (sin motor de física)

### 6.1 Desacoplar el reloj

La técnica clásica de juegos (G. Fiedler, «Fix Your Timestep!», 10-06-2004; HECHO) separa el paso de simulación del cuadro de dibujo e
**interpola** entre estados. En eventos discretos es todavía más simple: el motor no avanza a pasos fijos sino que sabe *exactamente* cuándo
empieza y termina cada movimiento. La vista hace `t_sim = t0_sim + velocidad × (t_reloj − t0_reloj)` y calcula cada posición desde su tramo.

Costo medido (`interp.mjs`, bultos en 200 cintas con acumulación): **0,10 ms por cuadro con 10.000; 1,1 ms con 100.000; 11,7 ms con
1.000.000** (HECHO medido). Con esto salen gratis la velocidad variable (×1 a ×10.000), la pausa y el **rebobinado**: para saltar a cualquier
minuto alcanza con fotos del estado cada N minutos y repetir desde la más cercana, cosa que solo es posible porque el motor es determinista
(INFERENCIA).

### 6.2 Cintas, vehículos y personas con cinemática cerrada (INFERENCIA de diseño)

No pudimos leer las páginas de cintas de FlexSim ni de AnyLogic (530 y 403): el diseño de abajo es nuestro, con parámetros de
`realismo-logistico.md`.

- **Cinta sin acumulación:** si la salida se bloquea, se detiene entera; cada bulto conserva su separación. Eventos: llegada al final,
  bloqueo, desbloqueo.
- **Cinta con acumulación:** cada bulto avanza a `v` hasta tocar la cola acumulada (posición `largo − n × paso`); el motor calcula a qué hora
  la toca, sin integrar nada. Fotoceldas, desvíos y uniones (con prioridad o alternancia) son eventos a horas conocidas.
- **Capacidad de cinta y sorter:** sale de velocidad ÷ paso (fórmula de `realismo-logistico.md`), y el modelo la reproduce sin calibrar.
- **Vehículos (autoelevadores, AGV, zorras):** perfil trapezoidal (aceleración, velocidad máxima, frenado) con tiempo cerrado; si el tramo
  es corto, triangular. Red de caminos como grafo con A*; para evitar choques, **reserva de tramos y nodos por ventanas de tiempo**, que
  es determinista y explicable («el AGV 3 esperó 12 s porque el cruce estaba reservado»).
- **Personas:** recorridos por la red de pasillos con velocidad a pie y tiempos de manipulación; el espacio libre (fuerzas sociales) queda para
  más adelante, solo si un caso lo pide.
- **Por qué no un motor de física** (Rapier 0.21.0, Apache-2.0, por ejemplo): agrega no determinismo entre equipos, costo por cuadro y
  fenómenos que no deciden nada (rebotes). Solo como «vidriera» desacoplada, nunca en el núcleo.

---

## 7. Editor de layout

Requisitos para competir con FlexSim en el armado, pero en el teléfono también (INFERENCIA de diseño):

| Función | Cómo |
|---|---|
| Unidades reales | Mundo en metros; grilla de 0,5 m por defecto (0,1 / 1 / 5 m con teclado) |
| Imantado | A la grilla, a los extremos de cintas y puertos, a ángulos de 15°, guías de alineación; tolerancia en **píxeles de pantalla** (≈8 px) para que no dependa del zoom |
| Conexiones | Arrastrar el extremo de una cinta a otra la conecta; puertos sueltos se marcan en rojo (validación del esquema en vivo) |
| Copias en serie | «20 estanterías cada 3,2 m» en un gesto |
| Plano de fondo | PNG o PDF del depósito, escalado marcando dos puntos y su distancia |
| Táctil | Pellizcar para zoom, mantener para seleccionar; botones grandes |
| Deshacer | Cada acción es un **comando que produce un parche** (JSON Patch, RFC 6902) sobre el documento del modelo |
| Selección y búsqueda | Índice espacial por grilla uniforme para elegir lo que está bajo el dedo sin recorrer todo |

**Los parches son la pieza diferencial:** dan deshacer/rehacer, historial («qué cambiaste desde el escenario base»), colaboración futura
y, sobre todo, una forma segura de que la IA proponga cambios: la propuesta se muestra **como fantasma sobre el plano** y el usuario la
acepta o la descarta (INFERENCIA; encaja con «la IA llena un esquema» de `frontera-ia.md`).

Librerías: el editor se dibuja con el mismo Canvas 2D propio de la vista; Konva (MIT, 59 KB gzip) es un atajo aceptable si apura. Para la
vista de lógica como grafo, @xyflow/react 12.12.0 (MIT) sirve pero obliga a usar React. **tldraw 5.5.2 no:** su licencia prohíbe producción
sin clave paga (HECHO, LICENSE.md).

---

## 8. Guardado, exportación y uso sin conexión

### 8.1 IndexedDB (HECHO medido en Chromium 141)

| Operación | Tiempo |
|---|---|
| Escribir / leer un bloque binario de 50 MB | 121 / 140 ms |
| 1.000 / 10.000 / 100.000 registros sueltos en una transacción | 40 ms / 374 ms / **23.281 ms** |
| 100.000 objetos como **un solo documento** (escribir / leer) | **62 / 65 ms** |
| El mismo documento como texto JSON (6 MB) | 11 ms |

**Decisión (INFERENCIA):** el modelo es **un documento por versión** (más la cola de parches) y la traza va en bloques binarios. Nada de
una fila por objeto.

### 8.2 Cuotas y riesgos de borrado (HECHO, MDN y blog de WebKit del 10-08-2023)

- Chrome: hasta 60% del disco por origen. Firefox: el menor entre 10% del disco y 10 GiB (persistente: hasta 50%). Safari 17+: ~60% por origen
  en el navegador, ~15% en apps que lo embeben. `localStorage`: 5 MiB (nunca para modelos).
- **Safari borra todo lo escrito por scripts si el sitio no tuvo interacción en 7 días de uso** (con la prevención de rastreo activa). Una app
  web en la pantalla de inicio tiene la misma cuota, y WebKit concede `persist()` según heurísticas como esa (HECHO).
- `navigator.storage.persist()`: Chrome y Safari lo deciden solos según el uso; Firefox pregunta. En nuestra prueba sin interacción, dio `false`.

**INFERENCIA:** los modelos de un usuario de iPhone **pueden desaparecer**. Hace falta: pedir `persist()`, ofrecer instalar la app,
recordar exportar y, más adelante, sincronización opcional en la nube (cuenta Pro).

### 8.3 Archivos y exportación

| Necesidad | Tecnología | Soporte (HECHO, MDN BCD) |
|---|---|---|
| Trazas grandes | OPFS (sistema de archivos privado) con acceso síncrono en Workers | Chrome 86 (Android 109), Firefox 111, Safari 15.2 |
| Guardar en una carpeta del usuario | `showSaveFilePicker` | Solo Chrome/Edge (Android 132); **no Firefox ni Safari**; 37,5% en AR |
| Respaldo universal | Descarga con `<a download>` e importación con `<input type=file>` | Universal |
| Comprimir | `CompressionStream` nativo (Chrome 80, Firefox 113, Safari 16.4) o fflate (6 KB) | — |
| Video del depósito animado | `MediaRecorder` + `canvas.captureStream` (Safari 14.1) o WebCodecs `VideoEncoder` (Chrome 94, Firefox 130 escritorio, Safari 16.4) | — |
| 3D para otras herramientas | glTF con el exportador de three.js | — |
| Planillas | CSV propio; el paquete `xlsx` de npm está congelado en 0.18.5 (24-03-2022) y ExcelJS en 4.4.0 (19-10-2023) | HECHO (npm) |

**Formato de traza (HECHO medido, `gzip`):** 1 millón de eventos de 5 campos en `float32` = 19,1 MB; con gzip, 9,5 MB (2,2 s); **en columnas,
con el tiempo en deltas enteros, 4,1 MB**. **Archivo `.anden`:** un zip con `modelo.json`, parches, resultados y columnas de la traza.

**El video es una función de crecimiento:** «exportá el video de tu depósito con el cuello de botella marcado» se comparte en WhatsApp sin
que el otro instale nada (INFERENCIA, encaja con la difusión de costo cero de P2).

### 8.4 PWA sin conexión

- **HECHO medido:** abierto desde `file://`, Chromium 141 bloquea módulos ES («origin null»), no deja crear Workers y `fetch` falla. El
  simulador **tiene que servirse por HTTP(S)**; la v0 de calculadoras funciona desde el disco solo porque usa scripts clásicos.
- *Service worker* que guarda la app (y el WebAssembly y el módulo 3D cuando se usan), manifiesto e instalación: los *service workers* cubren
  99,8% del uso argentino y el manifiesto 90,6% (caniuse-lite). El aviso de instalación (`BeforeInstallPromptEvent`) existe solo en Chromium;
  en iPhone se instala a mano desde «Compartir» (HECHO, MDN BCD para el evento).
- Herramientas: Workbox 7.4.1 (MIT, 04-05-2026) o vite-plugin-pwa 2.0.0 (MIT, 03-10-2026), que genera la lista de archivos con hash.

---

## 9. Cobrar sin backend

| Opción | Comisión | Qué resuelve | Fuente (HECHO) |
|---|---|---|---|
| Lemon Squeezy | 5% + USD 0,50; extras fuera de EE. UU. | Comerciante de registro (impuestos), suscripciones, API de licencias (activar, validar, desactivar; 60 pedidos por minuto; el ejemplo no lleva clave de API) | lemonsqueezy.com/pricing; docs de License API |
| Polar | Starter 5% + USD 0,50 (Pro 3,8% + USD 0,40 por USD 20/mes); **+1,5% con tarjetas no estadounidenses**; liquidaciones con costos de Stripe (USD 2/mes, 0,25% + USD 0,25 por pago) | Comerciante de registro; claves con límite de activaciones, vencimiento y revocación al cancelar | polar.sh/resources/pricing; docs de license keys |
| Paddle | 5% + USD 0,50 | Comerciante de registro; precio especial a consultar por debajo de USD 10 | paddle.com/pricing |
| Mercado Pago | No verificado | Las suscripciones se crean **por API** (hace falta backend); el «link de pago» es sin código | Documentación de Mercado Pago |

**ESTIMACIÓN (cuenta con el precio de P2):** con un plan Pro de USD 12–15 por mes, 5% + USD 0,50 se lleva **8,3–9,2%** de cada cobro (más 1,5%
en Polar con tarjeta argentina); con un plan anual de USD 120, **5,4%**. El plan anual conviene a ambos lados.

**Arquitectura recomendada (INFERENCIA):**
1. Pago en una pestaña del comerciante de registro (link): evita choques con COEP y no se toca ningún dato de tarjeta. Al fundador lo protege
   también el anonimato: el vendedor formal es la plataforma.
2. La plataforma manda la clave por mail. La app la valida contra una **función en Cloudflare Workers** (gratis: 100.000 pedidos por día y 10 ms
   de CPU por pedido; HECHO, docs de Cloudflare) que devuelve un **token firmado con Ed25519** que vence en 30 días.
3. La app verifica la firma **sin conexión** con WebCrypto: Ed25519 en Chrome 137, Firefox 129 y Safari 17 (HECHO, MDN BCD).
4. Sin clave, todo lo gratuito funciona igual; nada de bloqueos agresivos.

**Honestidad:** cualquier control en el navegador se puede saltear (el código está a la vista). La defensa no es la llave sino lo que
necesita del servicio: índices argentinos actualizados, plantillas nuevas, la entrevista con IA, la sincronización y el aula (INFERENCIA).
Que los ejemplos de Lemon Squeezy y Polar no lleven clave secreta sugiere que se pueden llamar desde el navegador, pero **no verificamos CORS** (§14).

**Alojamiento (HECHO):** GitHub Pages «no está pensado ni permitido» como alojamiento comercial (negocios en línea, SaaS); límites de 1 GB por
sitio y 100 GB por mes. Cloudflare Pages gratis: 500 compilaciones por mes, 20.000 archivos, 25 MiB por archivo y encabezados por ruta.
→ **La versión paga se publica en Cloudflare Pages.**

---

## 10. ¿Seguir sin build o introducir Vite/TypeScript?

**Hoy (HECHO, `apps/anden/`):** HTML + CSS + scripts clásicos (variables globales, ni siquiera módulos ES), sin dependencias; abre desde el disco.

**Qué pide el simulador:** Workers (idealmente como módulos: Chrome 80, Firefox 114, Safari 15), WebAssembly opcional, un módulo 3D que se
cargue aparte, un *service worker* con lista de archivos versionados, un esquema compartido por motor, editor, IA y pruebas, y dependencias
(three.js, idb, fflate).

| Opción | A favor | En contra |
|---|---|---|
| **A. Sin build**: módulos ES + *import maps* (Chrome 89, Firefox 108, Safari 16.4; 99,5% en AR) + tipos en JSDoc revisados con `tsc` | Cero herramientas; lo que se escribe es lo que corre | Sin hash en los nombres (la caché del *service worker* se vuelve frágil); las librerías van copiadas a mano; TypeScript 7.0 (08-07-2026) cambió el soporte de JS y sacó formas de JSDoc (HECHO, anuncio oficial); muchos archivos chicos al cargar |
| **B. TypeScript «borrable» + Vite 8** | Tipos reales en el esquema (la pieza que más cambia); Vite 8 (12-03-2026) usa Rolldown, con compilaciones «hasta 10–30 veces más rápidas»; Workers, WebAssembly, carga diferida y PWA resueltos; **Node 22.18+ corre `.ts` directo** (borrado de tipos estable en 24.12/25.2) | Una herramienta más; pide Node 20.19+ o 22.12+ |
| **C. Núcleo en Rust + wasm-bindgen + Vite** | 1,35–1,46 veces más rápido (medido); determinismo con libm propia | Dos lenguajes, depuración más difícil; la ganancia medida no lo paga todavía |

**Recomendación (INFERENCIA, confianza media-alta): B para el simulador**, en su repositorio propio cuando nazca; las calculadoras siguen como
están. Regla de **TypeScript borrable** (`erasableSyntaxOnly`: sin `enum`, sin `namespace` con código, sin propiedades en parámetros): así el
paso de build solo borra tipos, Node ejecuta las pruebas sin compilar y, si Vite deja de convenir, se cambia por esbuild (0.28.2) o
Rolldown (1.2.14) sin tocar el código. TypeScript 7.0.2 (nativo en Go, 8–12 veces más rápido; HECHO) para revisar tipos.
**C queda como fase 2** con regla de corte: si el motor TS en un teléfono de gama media no simula un día del hub modelo en menos de 1 s, se
porta el núcleo a Rust detrás de la misma interfaz de arreglos tipados, con las mismas pruebas de huella.

---

## 11. Arquitectura recomendada

```
 HILO PRINCIPAL (interfaz)                              WORKERS (sin DOM)
 ┌─────────────────────────────────────────┐            ┌──────────────────────────────────┐
 │ editor/   comandos → parches            │            │ compilador/  esquema → tablas    │
 │ modelo/   documento versionado + esquema│──modelo──▶ │ motor/       eventos, azar y     │
 │ vista2d/  Canvas 2D propio (base)       │            │              matemática propios  │
 │ vista3d/  three.js, a demanda           │◀─traza───  │ cinematica/  cintas, vehículos   │
 │ reproductor/ reloj, tramos, rebobinado  │ (bloques   │ experimentos/ réplicas, diseños, │
 │ resultados/  uPlot, mapas de calor      │ columnares │              optimizador         │
 │ ia/ (frontera-ia.md) propone parches    │ transferidos)            (1 Worker por núcleo)│
 └──────────────┬──────────────────────────┘            └──────────────────────────────────┘
                │ almacen/ IndexedDB (documento) + OPFS (trazas) · pwa/ service worker · licencia/ token Ed25519
```

| Módulo | Hace | Corre en | No puede |
|---|---|---|---|
| `modelo/` | Esquema tipado y versionado del layout y la lógica; validación; migraciones | Principal y Workers | Conocer la vista |
| `editor/` | Herramientas, imantado, selección; todo cambio sale como parche | Principal | Escribir el documento por fuera de los comandos |
| `compilador/` | Esquema → tablas tipadas (rutas, distribuciones, capacidades); chequeos contra teoría de colas | Worker | Usar azar |
| `motor/` | Montículo con desempate, tiempo entero, flujos de azar, matemática determinista; devuelve resultados y tramos | Worker (y Node en pruebas) | DOM, `Math.random`, `Date`, `Math.log` nativo |
| `cinematica/` | Tiempos cerrados de cintas, vehículos y personas; reservas de tramos | Worker | Integrar paso a paso |
| `traza/` | Formato columnar por bloques; compresión; fotos del estado para rebobinar | Worker → Principal | Mandar objetos |
| `experimentos/` | Réplicas en paralelo, calentamiento, intervalos, comparación con números comunes, optimización | Workers | Agregar en orden de llegada |
| `reproductor/` | Reloj simulado ↔ real; posiciones desde tramos; velocidad y rebobinado | Principal | Pedirle cosas al motor por cuadro |
| `vista2d/` | Plano, estados por color, mapas de calor; funciona sin GPU | Principal (u OffscreenCanvas) | Depender de WebGL |
| `vista3d/` | three.js (`WebGPURenderer` → WebGL 2), instancias, niveles de detalle | Principal, carga diferida | Ser obligatoria |
| `almacen/` | Documento por versión, trazas en bloques, `persist()`, exportar e importar `.anden` | Principal | Usar `localStorage` para modelos |
| `licencia/` | Validación con la función mínima; verificación Ed25519 sin conexión | Principal | Bloquear lo gratuito |

**Presupuestos (INFERENCIA de diseño, a confirmar en dispositivos):** cuadro de 16,7 ms = interpolación ≤ 2 ms + dibujo ≤ 10 ms + interfaz ≤ 4 ms;
primera carga sin 3D ≤ 300 KB brotli; módulo 3D ~171 KB brotli aparte; resultado «en vivo» al mover un control ≤ 150 ms (≈1–1,5 millones
de eventos en un hilo de esta máquina: entre medio día con un modelo rico y casi tres días con uno simple de un hub de 90.000 paquetes;
ESTIMACIÓN con la §4.1).

**Fases (INFERENCIA):** 1) motor + compilador + vista 2D + reproductor + guardado (lo que ya entrega valor y es distinto); 2) experimentos,
optimizador, editor completo, PWA y licencia; 3) vista 3D, video, mapas de calor de réplicas, Rust/WebGPU si las mediciones lo piden.

---

## 12. Qué NO usar

| No usar | Por qué | Fuente |
|---|---|---|
| `Math.random` y `Math.log/exp/pow/sin` nativos en el motor | Sin semilla; resultados que la especificación no fija | ECMA-262; HECHO medido (§3) |
| mulberry32 para réplicas | Estado de 32 bits, huecos en las salidas, se agota | Gist del autor; cuenta §3.2 |
| SIMD relajado de WebAssembly | No determinista por especificación | `WebAssembly/design` |
| Objetos para cruzar hilos | Más de 600 veces más lento que transferir | HECHO medido (§4.2) |
| SharedArrayBuffer como requisito | Rompe inserciones y pagos; `credentialless` no existe en Safari | MDN, MDN BCD |
| Motor de física para cintas y vehículos | No determinista, caro, irrelevante | INFERENCIA (§6.2) |
| WebGPU sin respaldo | No hay en Firefox Linux/Android ni en placas no habilitadas | Wiki de gpuweb |
| 3D como única vista | Sin GPU: 28 ms por cuadro con 1.000 cajas | HECHO medido |
| Babylon.js importado entero | 1,79 MB gzip | HECHO medido |
| tldraw | Producción solo con clave paga | LICENSE.md de tldraw |
| `localStorage` para modelos | 5 MiB | MDN |
| Una fila de IndexedDB por objeto | 23 s para 100.000 | HECHO medido |
| Pyodide o SimPy en el navegador | ~66 veces más lento que JS (Python nativo); Pyodide aún más | `frontera-ia.md` |
| Unity o Unreal exportados a la web | Descargas pesadas y otro mundo de herramientas (no medido) | INFERENCIA |
| GitHub Pages para la versión paga | Prohibido para SaaS | Docs de GitHub Pages |
| Depender de `showSaveFilePicker` | Solo Chromium; 37,5% en AR | MDN BCD, caniuse |

---

## 13. Ideas técnicas que van más allá de FlexSim (HIPÓTESIS: no verificamos que ningún incumbente las tenga así)

1. **Reproducibilidad garantizada y verificable:** cada corrida con su «huella»; el docente y el alumno, o el consultor y el cliente,
   comprueban que obtuvieron lo mismo en cualquier dispositivo.
2. **Simulación en vivo mientras se edita:** al arrastrar una estantería o mover el control de dotación, se re-simula un horizonte corto con
   los mismos números aleatorios y el resultado se actualiza en ~150 ms.
3. **Rebobinar como un video**, gracias al determinismo y a las fotos de estado.
4. **«Mil futuros» sobre el plano:** mapas de calor de congestión por percentil, con todas las réplicas, no una historia elegida.
5. **Video exportado desde el navegador** para mandar por WhatsApp.
6. **Funciona en el teléfono y sin conexión**, en el piso del depósito.
7. **La IA propone parches que se ven como fantasma** y se aceptan con un toque.
8. **Modelo en un enlace:** los modelos chicos viajan comprimidos en el `#` de la URL, como ya hace la v0 (el límite de largo no lo medimos).

---

## 14. Qué falta medir o verificar

| Pendiente | Cómo |
|---|---|
| Determinismo y velocidad en Firefox y Safari | `npx playwright install firefox webkit` y correr `libm_diff`, `detlog` y el motor; o una página de prueba en dispositivos reales |
| Render con GPU real | `web/index.html` en 3 teléfonos Android (gama baja, media, alta), 1 iPhone y 1 notebook con gráficos integrados |
| WebGPU real en Argentina | Telemetría sin cookies: `navigator.gpu.requestAdapter()` al abrir la vista 3D |
| CORS de las APIs de licencias de Lemon Squeezy y Polar | Un `fetch` desde una página de prueba |
| Fin del WebGL por software en Chrome (versión y fecha exactas) | Notas de versión de Chrome (sin buscador en esta sesión) |
| Cintas y AGV de FlexSim y AnyLogic (para comparar el diseño) | Documentación cuando vuelva a abrir |
| Rendimiento del modelo rico en WebAssembly frente a JS | Portar `des2.js` (12 estaciones, fallas, retrabajo) a Rust |
| Mercado Pago: comisiones y suscripciones sin backend | Documentación de tarifas |
| Librerías para importar DXF (planos de AutoCAD) | Revisión en npm |

**Cómo repetir las mediciones** (desde `conocimiento/anden-simulador-2026-10/medicion-tecnologia/`): `cargo build --release --target
wasm32-unknown-unknown --lib --manifest-path desrs/Cargo.toml`; `node js_vs_wasm.mjs 2e6`; `node libm_diff.mjs`; `node propag.mjs`;
`node prng.mjs`; `node detlog.mjs`; `node procesos.mjs`; `node interp.mjs 100000`; para el navegador, `node server.mjs coi 9871` y
`node run.cjs all 9871 "--enable-unsafe-swiftshader"` (necesita `three` en `node_modules`), `node idb2.cjs` y `node filetest.cjs`;
tamaños con `node tamanos.cjs` (instrucciones en el archivo).

---

## Fuentes (todas consultadas el 17-10-2026)

**Mediciones propias**
- Scripts y modelo en Rust: `conocimiento/anden-simulador-2026-10/medicion-tecnologia/` (17-10-2026).
- Motor y SimPy del otro frente: `conocimiento/anden-simulador-2026-10/medicion-motor/` y `frontera-ia.md`.

**Especificaciones y documentación primaria**
- ECMA-262, Math (borrador vigente) — https://tc39.es/ecma262/multipage/numbers-and-dates.html
- WebAssembly, no determinismo — https://github.com/WebAssembly/design/blob/main/Nondeterminism.md
- WebAssembly, soporte por motor — https://raw.githubusercontent.com/WebAssembly/website/main/features.json (y https://webassembly.org/features/)
- WebGPU, estado de implementación (editado 02-10-2026) — https://github.com/gpuweb/gpuweb/wiki/Implementation-Status
- MDN, SharedArrayBuffer — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
- MDN, cuotas y borrado — https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- MDN, SubtleCrypto.verify (Ed25519) — https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/verify
- MDN browser-compat-data 8.1.6 (15-10-2026) — https://www.npmjs.com/package/@mdn/browser-compat-data
- caniuse-lite 1.0.30001816 (13-10-2026), región AR — https://www.npmjs.com/package/caniuse-lite
- WebKit, cambios de almacenamiento (10-08-2023) — https://webkit.org/blog/14403/updates-to-storage-policy/
- Node.js, TypeScript (borrado de tipos) — https://nodejs.org/api/typescript.html
- Anuncio de TypeScript 7.0 (08-07-2026) — https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- Anuncio de Vite 8 (12-03-2026) — https://vite.dev/blog/announcing-vite8
- three.js r186, `WebGPURenderer` con respaldo WebGL 2 (código fuente) — https://www.npmjs.com/package/three
- Babylon.js, thin instances — https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/thinInstances
- PixiJS v8, lanzamiento (05-03-2024) — https://pixijs.com/blog/pixi-v8-launches
- PixiJS, ParticleContainer (03-10-2024) — https://pixijs.com/blog/particlecontainer-v8
- Fiedler, «Fix Your Timestep!» (10-06-2004) — https://gafferongames.com/post/fix_your_timestep/
- xoshiro/xoroshiro — https://prng.di.unimi.it/
- Mulberry32 (gist del autor) — https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
- NVIDIA cuRAND (MRG32k3a, Philox) — https://docs.nvidia.com/cuda/curand/host-api-overview.html
- coi-serviceworker — https://github.com/gzuidhof/coi-serviceworker
- Cloudflare Pages, encabezados — https://developers.cloudflare.com/pages/configuration/headers/
- Cloudflare Pages, límites — https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Workers, precios — https://developers.cloudflare.com/workers/platform/pricing/
- GitHub Pages, límites y usos prohibidos — https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Licencia de tldraw — https://github.com/tldraw/tldraw/blob/main/LICENSE.md
- Lemon Squeezy, precios — https://www.lemonsqueezy.com/pricing
- Lemon Squeezy, License API — https://docs.lemonsqueezy.com/api/license-api y https://docs.lemonsqueezy.com/api/license-api/validate-license-key
- Polar, precios — https://polar.sh/resources/pricing
- Polar, claves de licencia — https://polar.sh/docs/features/benefits/license-keys
- Paddle, precios — https://www.paddle.com/pricing
- Mercado Pago, suscripciones — https://www.mercadopago.com.ar/developers/es/docs/subscriptions/landing
- Mercado Pago, Checkout Pro — https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/overview
- AnyLogic, Material Handling Library (solo descripción general) — https://www.anylogic.com/resources/libraries/material-handling-library/

**Registros de paquetes (versión, licencia y fecha de publicación)**
- npm: https://www.npmjs.com/package/ seguido de `three`, `pixi.js`, `@babylonjs/core`, `playcanvas`, `konva`, `fabric`, `@xyflow/react`,
  `tldraw`, `uplot`, `echarts`, `idb`, `dexie`, `comlink`, `fflate`, `vite`, `typescript`, `esbuild`, `rolldown`, `workbox-window`,
  `vite-plugin-pwa`, `coi-serviceworker`, `@dimforge/rapier3d`, `xlsx`, `exceljs`, `simscript`, `simjs`.
- crates.io: https://crates.io/crates/ seguido de `nexosim`, `sim`, `libm`, `rand_philox`, `rand_xoshiro`.

**Vistas solo como extracto del buscador (sin verificar en la fuente)**
- Foros de three.js y Babylon.js sobre cantidad de instancias — https://forum.babylonjs.com/t/mesh-with-thin-instance-slower-than-with-full-vertices/46756 ;
  https://discourse.threejs.org/t/instancedmesh2-easy-handling-and-frustum-culling/58622?page=2 ;
  https://discourse.threejs.org/t/rendering-thousands-of-objects-results-in-low-fps-but-also-low-gpu-usage/40142.md
