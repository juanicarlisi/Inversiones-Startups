# 3D del centro de distribución y del hub · radar técnico (30-10-2026)

> Frente: 3D de Andén (CD y hub de clasificación) con calidad de producto. Laboratorio: `apps/anden/laboratorio/3d/` (no toca `simulador/` ni `juegos/aviacion/`).
> Etiquetas: **HECHO** (fuente y fecha) · **MEDIDO** (reproducible con el laboratorio) · **INFERENCIA** (razonamiento propio).
> Todo lo consultado es del 30-10-2026 salvo que diga otra fecha. No se gastó nada ni se publicó nada.

## 1. Veredicto

1. **three.js 0.186.1 se queda como único motor de GPU** y se le suma la cadena profesional que lo vuelve «producto»: activos hechos por código en **Blender (bpy 5.2.3, sin interfaz)** → **glTF Transform + Meshopt** → instancias → **pmndrs/postprocessing + N8AO**. No hubo que escribir ni un cargador, ni un motor, ni un compresor.
2. **El 3D es una capa que exige GPU.** Sin placa de video (WebGL por software) la escena completa da **0,4–1,3 cuadros por segundo** y la versión mínima 3 (MEDIDO, §4). Se confirma lo ya medido en `tecnologia-web.md` §5.3: la vista 2D/2,5D existente es el piso universal; el 3D se activa al detectar GPU real.
3. La escena de prueba (sorter de 176 bandejas, 5.000 paquetes por instancias, 40 jaulas con tolvas, 56 pallets, 20 cintas, 8 acoplados, 24 operarios, 75 luminarias) **ya se ve como una instalación real**, no como un tablero de cajas (capturas en `apps/anden/laboratorio/3d/capturas/`). Todavía no es «años de desarrollo»: faltan personajes con esqueleto, luz horneada y reflejos (§7).
4. **Hallazgo que cambia el diseño del paquete:** un cubo de **12 triángulos con un mapa de normales de bisel** se ve igual que uno de 108 con bisel real a la distancia de uso, y cuesta entre 15% y 30% menos de cuadro (MEDIDO). El triángulo, no el píxel ni la cantidad de instancias, es lo que manda en software y pesa en teléfonos.
5. No se adoptaron: R3F, Babylon, PlayCanvas, Theatre.js, GSAP, Rapier (todavía), WebGPURenderer. Reglas de corte en §2.

## 2. Elección (una por necesidad)

| Necesidad | Elegido · versión · fecha · licencia | Por qué | Regla de corte / reemplazo |
|---|---|---|---|
| Motor 3D | **three.js 0.186.1** (24-09-2026) · MIT. r187 salió hoy (30-10); se fija la anterior | Una sola librería de GPU en todo el holding (ya decidido en `tecnologia-web.md`); 109 KB brotli el motor mínimo; ecosistema de posproceso, glTF y AO que los otros no tienen; el simulador es TypeScript sin framework (grep: cero imports de React) | Cambiar solo si en 3 teléfonos + 1 notebook otro motor da ≥ 2× a igual calidad |
| Instancias | `InstancedMesh` + **atributos por instancia y shader de trayectos** (`src/escena.js`) | Una llamada de dibujo para los 5.000; cero trabajo de CPU por cuadro; mismo resultado que la vía CPU (§4) | Pasar a `@three.ez/instanced-mesh` (MIT, 0.3.16, 25-10-2026: culling y LOD por instancia) para estáticos si hay miles fuera de cámara |
| Posproceso | **pmndrs/postprocessing 6.39.5** (09-09-2026, Zlib) + **N8AO 2.0.1** (10-08-2026, ISC, `N8AOPostPass`) | Bloom, mapeo tonal NEUTRAL, viñeta y SMAA en un solo pase; AO de calidad de producto | N8AO se apaga (o se hornea AO en Blender) si un teléfono medio no sostiene 30 fps con él en media resolución |
| Activos | **Blender 5.2.3 como módulo Python (`bpy`)**, PyPI 22-10-2026, GPL-3.0 | 14 piezas con bisel, UV y materiales PBR en **≈ 2 s** sin interfaz; reproducible | `bpy` es herramienta de construcción: nunca va dentro del producto. El resultado es nuestro (blender.org: «What you create with Blender is your sole property») |
| Optimización glTF | **glTF Transform 4.5.1** (28-09-2026, MIT) + **meshoptimizer 1.3.0** (MIT); Draco (Apache-2.0) solo de comparación; **gltf-validator 2.0.0-dev.3.10** (Apache-2.0) | 225 KB crudos → **101 KB con Meshopt** (−55%) → 50 KB con Draco (−78%). Se elige Meshopt: decodificador chico y rápido, ya incluido en three | Draco si los activos superan ~5 MB. Validador: 0 errores y 0 avisos en crudo y comprimido |
| Texturas | **KTX2 con ktx2-encoder 0.6.0** (19-07-2026, MIT, WASM, sin binarios) | 1024²: JPG 116 KB; KTX2 ETC1S 141 KB; UASTC 952 KB (con mipmaps). La ganancia es de memoria de GPU, no de descarga | Decodificación en navegador **no verificada** (falta correr `KTX2Loader` en un dispositivo real) |
| Activos libres | **Poly Haven (CC0)**: HDRI y concreto. Kenney: CC0 según su ficha en itch.io; `kenney.nl` dio 403 en este entorno | Licencia comercial limpia | **Quaternius ya no es CC0:** licencia propia QAL v1.0 (no se pueden redistribuir los activos sueltos). Usarlo solo tras decisión consciente |
| Cámara y tiempo | **`CatmullRomCurve3` de three** (recorrido cinemático) + `OrbitControls` | Cero dependencias; 3 tomas de recorrido capturadas | **Theatre.js**: `@theatre/core` 0.7.2 (Apache-2.0) sin versión nueva desde **19-05-2024** y sin Releases en GitHub. **GSAP** 3.15.0: licencia propietaria «no charge» (vigente desde 30-04-2025), no OSI, con prohibiciones. Revisar si hace falta un editor de línea de tiempo |
| Física | **Rapier 0.21.0** (25-09-2026, Apache-2.0, WASM embebido) probado fuera de línea | Funciona en Node y hornea poses a JSON | **No sirve para llenar jaulas:** el apilado por caída da pilas caóticas (§4). Guardarlo para derrames, atascos y paquetes caídos |
| WebGPU | No adoptado | En este Chromium 141 hay adaptador WebGPU solo con banderas (SwiftShader) y `WebGPURenderer` de three r186 **falla** con `TypeError: ... GPUTextureComponentSwizzle` | Reintentar con un Chromium más nuevo; portar el shader de trayectos a TSL/cómputo recién entonces |
| React Three Fiber | No adoptado (9.8.2, MIT, 21-10-2026) | Agrega reconciliador React a un simulador que no usa React y no toca el camino caliente (las instancias) | Si la interfaz del producto pasa a React |
| Babylon.js / PlayCanvas | No adoptados (9.33.1 Apache-2.0, 29-10-2026 / 2.23.3 MIT, 30-10-2026) | Misma escena mínima: ver §4 (empate técnico); el motor mínimo pesa 342 KB y 212 KB brotli contra 109 KB. Las *thin instances* de Babylon se dibujan **todas o ninguna** (doc oficial) | Ídem motor 3D |

## 3. Evidencia verificada en fuente oficial

- **HECHO** · three.js r187 (30-oct), r186 (24-sep), r185 (01-jul): https://github.com/mrdoob/three.js/releases. Sin notas de WebGL por software.
- **HECHO** · Versiones y licencias de todos los paquetes: registro npm (`npm view`), 30-10-2026. PyPI `bpy` 5.2.3: rueda `cp313-manylinux_2_28_x86_64` de 402 MB, 22-10-2026, GPL-3.0.
- **HECHO** · Blender: «What you create with Blender is your sole property» y la API `bpy` va con la GPL: https://www.blender.org/about/license/
- **HECHO** · Poly Haven: «Our assets are all licensed as CC0»: https://polyhaven.com/license . Quaternius: QAL v1.0, no CC0: https://quaternius.com/license.html . GSAP: https://gsap.com/standard-license
- **HECHO** · Babylon *thin instances*: «all thin instances are drawn (if the mesh is deemed visible) or none»: https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/thinInstances
- **HECHO** · `@three.ez/instanced-mesh`: culling por instancia, LOD y BVH, MIT: https://github.com/agargaro/instanced-mesh
- **HECHO** · KTX-Software: última versión estable 4.4.2 (oct-2025) y 5.0.0-rc2 de prueba; en la página no se vio un binario Linux x86_64 (el listado estaba truncado), por eso se usó ktx2-encoder: https://github.com/KhronosGroup/KTX-Software/releases
- **MEDIDO** · Chromium 141.0.7390.37: `navigator.gpu` solo existe en contexto seguro; sin banderas `requestAdapter()` da `null`; con `--enable-unsafe-webgpu --use-webgpu-adapter=swiftshader` da un adaptador SwiftShader de 19 características.
- **No verificado** · Rapier: la página oficial no declara licencia ni determinismo en lo leído (Apache-2.0 sale del registro npm).

## 4. Prueba real (MEDIDO)

**Escena.** 5.000 paquetes = 148 sobre bandejas del sorter, 324 en cintas, **2.040 que se deslizan por la tolva y caen a su jaula** (ciclo de 120 s, ~25 en caída a la vez) y 2.488 en reposo sobre pallets. Constantes en movimiento: 472 paquetes + 176 bandejas + 24 operarios (con balanceo de piernas en el shader). Las 5.000 pasan por el mismo shader (o por la misma actualización de matrices) en todos los cuadros, se muevan o no. 523.000 triángulos por cuadro con sombras (264.000 sin ellas), 83 llamadas de dibujo (44 sin sombras). Datos de instancia: 18 flotantes × 5.000 = 360 KB.

**Método.** Chromium 141 de Playwright, `--use-angle=swiftshader` (WebGL por software), 4 CPU virtuales. Cuadros **sincrónicos**: se dibuja y se fuerza el fin del trabajo con `readPixels` de 1 píxel antes de tomar el tiempo (con `requestAnimationFrame` se mide solo el envío; se descubrió al principio: daba 11 ms mentirosos). 2 cuadros de calentamiento, 4 medidos, 2 corridas completas. Vista «general» (peor caso: todo visible). **Límite grande:** durante las corridas la máquina estuvo compartida (carga 11,8 sobre 4 CPU por las pruebas del simulador en paralelo): el ruido entre corridas llega a ±40%. Por eso se informa la **mediana de cada corrida** y el **mejor cuadro de las dos**; solo valen las diferencias grandes.

| Configuración (960×540 salvo aviso) | Mediana c1 / c2 (ms) | Mejor cuadro (ms) | fps |
|---|---|---|---|
| **Base**: estándar PBR + luz de armónicos esféricos + sombra 2048 | 1789 / 1579 | 1486 | 0,67 |
| Sin sombras | 787 / 864 | 746 | 1,34 |
| Sombra 1024 / 4096 | 1729 / 1839 · 2004 / 2558 | 1530 · 1857 | 0,65 · 0,54 |
| IBL completo (PMREM) en lugar de armónicos | 2223 / 2050 | 1810 | 0,55 |
| Posproceso (bloom + mapeo tonal + SMAA) | 1731 / 1455 | 934 | 1,07 |
| + N8AO media resolución, 12 muestras | 2346 / 3098 | 2172 | 0,46 |
| + N8AO resolución completa | 2871 / 3822 | 2540 | 0,39 |
| MSAA 4× del navegador | 2214 / 3529 | 2019 | 0,50 |
| Animación de paquetes en CPU (matrices JS) en vez de GPU | 1485 / 1410 | 1169 | 0,86 |
| Material Lambert en vez de PBR | 1548 / 1496 | 1167 | 0,86 |
| Paquete con bisel real (108 triángulos, 1,48 M por cuadro) | 2520 / 2186 | 1739 | 0,58 |
| N = 1.000 / 2.500 / 10.000 paquetes | 1078 / 1679 · 1588 / 1484 · 1698 / 2346 | 1067 · 1348 · 1529 | 0,94 · 0,74 · 0,65 |
| 640×360, sombra 1024 · 1280×720 | 1175 / 1079 · 2494 / 2109 | 843 · 1788 | 1,19 · 0,56 |
| Piso: 640×360, Lambert, sin sombras, sin techo | 312 (una corrida) | — | 3,2 |

**Lecturas (INFERENCIA con confianza alta donde la diferencia es > 30% en las dos corridas):**
- La **sombra duplica el costo** (×2,0) y su resolución casi no importa hasta 2048: el costo es volver a dibujar la geometría, no el mapa. Techo de 2048.
- Cuesta el **triángulo**: ≈ 0,8 µs cada uno (el paquete de 108 triángulos suma 960.000 por cuadro y 730 ms en la corrida 1). Encuadre 640×360, sin sombras ni IBL: con la primera versión de los activos (1,15 M de triángulos) 948 ms; con el presupuesto de triángulos en el generador (264.000) 487 ms. Ese presupuesto valió más que cualquier otro ajuste.
- El **N8AO es el efecto más caro** (+30% a +140% según carga); bloom + mapeo tonal + SMAA queda dentro del ruido.
- La cantidad de paquetes pesa poco: de 1.000 a 10.000, +43% en el mejor cuadro. La infraestructura domina.
- En software la vía **CPU es 10–20% más rápida** que la GPU (el «vertex shader» corre en las mismas CPU). En una GPU real ocurre lo contrario; ahí lo medible es el costo de CPU por cuadro: **0,51 ms para 5.000 entidades, 1,7 ms para 20.000 y 7,6 ms para 100.000** (`src/adaptador.bench.mjs`, Node 22, incluye colores). La vía GPU se justifica por encima de ~100.000 o cuando el hilo principal está ocupado.
- **Equivalencia comprobada:** misma escena en modo GPU y modo CPU, diferencia de imagen: 1,3% de los píxeles (> 12/255) con diferencia media de 0,97/255 en dos instantes; entre t=20 s y t=20,5 s cambia 8,2% de los píxeles en ambos modos (se mueve de verdad).
- **Rapier** (0.21.0; 10 ms por paquete incluyendo asentarse): 320 paquetes en 8 jaulas dejan **273 inclinados > 8°**; con 8 por jaula, 29 de 64 inclinados y alturas de 0,85–1,2 m. Un operario apila plano: se mantiene la grilla por capas.
- **Motores, misma escena mínima** (5.000 cajas con matriz recalculada cada cuadro, sombra 2048, 960×540; mediana de 4 cuadros, una corrida): three 562 ms · Babylon 631 ms · PlayCanvas 481 ms. Empate técnico dentro del ruido; las tres imágenes difieren en exposición y filtro de sombra (`capturas/07-…`), así que no es una comparación de calidad.
- **Bug encontrado y corregido por esta prueba:** las texturas del piso se cargaban en segundo plano y el primer cuadro salía con el piso negro; ahora la escena espera las cargas. El **error de ejes** de los activos (Blender es Z arriba; todo salía de costado) se vio en la captura y se arregló exportando sin conversión.

**Calidad visual** (`apps/anden/laboratorio/3d/capturas/`): 01 corte sin techo, 02 sorter y jaulas, 03 jaulas y tolvas, 04 recorrido de cámara, 05 muelle, 06 bisel 12 vs 108 triángulos, 07 motores, 08 cintas con AO. Lo logrado: contacto y sombras reales, concreto PBR con pintura de piso numerada, jaulas de malla, bandejas con carro y ruedas, cartón con cinta y etiqueta, luminarias con bloom. Lo que todavía delata «hecho rápido»: operarios de bloques sin esqueleto, paredes lisas, sin reflejos de piso ni luz horneada.

## 5. Integración con Andén

Contrato congelado `contratos/vistas.ts`: `Reproductor.posiciones(t, out)` entrega `x, y, ang, estado` (metros, radianes) sin asignar memoria; `Piso = '2d' | 'iso'` y `ElegirPiso` ya prevén que «el 3D (corte 2) se suma con su regla».
1. `vista3d/` carga a demanda (three + pmndrs + N8AO ≈ 287 KB brotli; el motor solo, 109 KB) e implementa `Vista` con `piso: '3d'`. Se activa si el renderizador **no** es por software (`WEBGL_debug_renderer_info`: SwiftShader/llvmpipe) y si el primer segundo mide bien, igual que `ElegirPiso`.
2. **Vía A, sin tocar el contrato:** `posicionesAMatrices()` (`src/adaptador.js`, sin dependencias, apta para Worker) escribe en el buffer de instancias; `estado` → color. **Vía B, más de ~100.000 entidades:** subir los tramos (desde, hasta, t0, t1) de la traza una vez y dejar el shader de trayectos del laboratorio.
3. La disposición fija (cintas, tolvas, jaulas, pallets, acoplados) sale de `Traza.geometria` y se instancia con las piezas de `activos.glb`. Los activos se regeneran con `npm run activos` (bpy → glTF Transform), reproducible.
4. Tres niveles de calidad (INFERENCIA, a confirmar en dispositivos): **A** GPU potente: PBR + sombra 2048 + N8AO media resolución + bloom + SMAA; **B** GPU integrada o teléfono: Lambert o PBR sin IBL, sombra 1024, sin AO; **C** sin GPU: no hay 3D, sigue el 2D/2,5D actual.

## 6. Riesgos y lo que NO se verificó

- **Ninguna medición en GPU real.** Todo es WebGL por software (piso medido); que 523 k triángulos con sombra (≈ 31 M triángulos/s a 60 fps) entren en un teléfono medio es **hipótesis**. Se mide en los 3 teléfonos usados + 1 notebook que `diseno-maestro.md` §12 ya deja a decisión del fundador.
- El shader de trayectos se inyecta con `onBeforeCompile` sobre los trozos internos de three (`begin_vertex`, `beginnormal_vertex`): una actualización de versión puede romperlo. Mitigación: versión fija 0.186.1 y la prueba de equivalencia GPU/CPU como control.
- Ruido de ±40% entre corridas por máquina compartida; los cocientes finos no son confiables.
- Babylon y PlayCanvas se midieron con una escena mínima, no con la del laboratorio, y sin igualar exposición ni filtro de sombra.
- KTX2: tamaños medidos, decodificación en navegador no probada. Kenney: licencia CC0 confirmada por su ficha en itch.io y una búsqueda; la página oficial dio 403 aquí.
- Licencias: `bpy` y los scripts que lo usan van con la GPL; viven en el repositorio privado y nunca se distribuyen. Quaternius no es CC0.
- La revisión independiente que pide el skill (agente `general-purpose`) **no se pudo lanzar** (este hilo no tiene la herramienta de agentes). Se sustituyó por controles mecánicos: validador glTF (0 errores), equivalencia de imagen GPU/CPU, inspección de cajas delimitadoras de los activos y revisión visual de cada captura. Conviene una revisión humana o de otro agente del shader `GLSL_HEAD` de `src/escena.js`.

## 7. Próximos pasos (por valor esperado)

1. Medir en dispositivos reales y fijar los niveles A/B/C con números (decide el resto).
2. `vista3d/` bajo el contrato, con detección de GPU y vía A.
3. **Personajes con esqueleto** de licencia limpia (Kenney tras leer su licencia oficial, o propios en Blender) y animación por instancias; hoy son bloques.
4. **Luz horneada**: AO y mapa de luz de las piezas estáticas con Cycles desde `bpy`, a comparar contra N8AO (más barato en teléfonos).
5. `@three.ez/instanced-mesh` para estáticos (jaulas, pallets, cintas) y LOD del paquete (12 → 108 triángulos de cerca).
6. Modo director: recorrido con `OrbitControls`, profundidad de campo solo en reproducción.
7. Reintentar `WebGPURenderer` con un Chromium más nuevo.

## 8. Reproducir

```
cd apps/anden/laboratorio/3d
npm ci && python3 -m venv .venv && .venv/bin/pip install bpy==5.2.3 numpy   # 402 MB
npm run activos        # Blender -> glTF Transform (Meshopt) -> activos/activos.glb
node construir.mjs     # esbuild: escena y motores mínimos
node medir.mjs trabajos/matriz.json matriz   # también trabajos/visual.json, motores.json, equivalencia.json
python3 comparar-capturas.py a.png b.png      # % de píxeles que cambian (movimiento y equivalencia GPU/CPU)
node fisica/apilado.mjs 40 8 · node src/adaptador.bench.mjs · node probar-webgpu.mjs · node activos/ktx2.mjs
```
Resultados guardados en `apps/anden/laboratorio/3d/resultados/`. Parámetros de la escena por URL: `n`, `anim=gpu|cpu`, `sombras`, `ibl=sh|hdr|none`, `post=1`, `ao=n8ao`, `aoMitad=1`, `aa=smaa|msaa`, `mat=lambert`, `paquete=hd`, `techo=no`, `toma=`, `u=` (recorrido), `t=`.

## 9. Fuentes (consultadas el 30-10-2026)

three.js releases · registro npm de three, postprocessing, n8ao, @gltf-transform/*, meshoptimizer, draco3dgltf, gltf-validator, ktx2-encoder, @dimforge/rapier3d-compat, @theatre/core, gsap, @babylonjs/core, playcanvas, @react-three/fiber, @three.ez/instanced-mesh · PyPI bpy 5.2.3 · blender.org/about/license · polyhaven.com/license · quaternius.com/license.html · gsap.com/standard-license · doc.babylonjs.com (thin instances) · github.com/agargaro/instanced-mesh · github.com/KhronosGroup/KTX-Software/releases · github.com/theatre-js/theatre/releases · rapier.rs (JavaScript) · kenney-assets.itch.io (ficha CC0, vía búsqueda).
