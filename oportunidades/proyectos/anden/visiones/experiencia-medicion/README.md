# Medición de la visión «Experiencia» (17-10-2026)

Mediciones propias hechas para `oportunidades/proyectos/anden/visiones/experiencia.md`. Responden cuatro preguntas que la visión
necesitaba con números y no con opiniones:

1. ¿Cuánto tarda el dispositivo de quien abre un enlace en calcular la «película» de una noche de hub con el mecanismo completo?
2. ¿Entra el modelo en un enlace? ¿Y en un código QR?
3. ¿Cuánto cuesta cada cuadro en 2D, en 2,5D isométrica y en 3D, sin placa de video y con la CPU frenada como un teléfono?
4. ¿Se puede exportar un video desde el navegador, sin servidor, y cuánto tarda?

## Qué hay

| Archivo | Qué es |
|---|---|
| `hub.mjs` | Maqueta del motor: hub de clasificación de última milla (turno noche) con sorter de bandejas, simulado como mecanismo (camiones con turno y desvío, andenes, cintas con contrapresión, personas que inducen con fatiga, pausas y ausentismo, bandejas con paso fijo, NO-READ, rampas con capacidad, recirculación, personas de rampa, jaulas, puesto manual). Eventos discretos con montículo y una «isla» de paso fijo para el sorter con rueda de tiempos. Emite una traza de tramos en columnas. Módulo ES sin APIs de Node. |
| `reproductor.mjs` | Dado un instante, calcula dónde está cada cosa con fórmulas cerradas sobre la traza (sin volver a simular). |
| `vistas.mjs` | Tres vistas del mismo reproductor: plano 2D (Canvas), 2,5D isométrica con sprites horneados (Canvas, sin GPU) y 3D (three.js r186, instancias). |
| `pelicula.mjs` | Node: noches enteras con y sin traza, primeros 15 minutos, peso de la traza. → `resultados-pelicula.json` |
| `noches.mjs` | Node: 60 noches del hub 24k, para ver cuánto cambia una de otra. → `resultados-noches.json` |
| `ab.mjs` | Node: pantalla dividida A/B (4 → 5 inductores) con la misma aleatoriedad contra suertes independientes, 40 réplicas. → `resultados-ab.json` |
| `enlace.mjs` | Node: documento declarativo completo del hub (`modelo-ejemplo.json`), plantilla + parche y receta de escena, comprimidos para el `#` de la URL y para QR. → `resultados-enlace.json` |
| `banco.html`, `worker-hub.mjs`, `correr.cjs` | Navegador (Chromium 141 sin interfaz, Playwright 1.56.1, gráficos por software SwiftShader): simulación en Worker, costo por cuadro de las tres vistas, CPU frenada 4× y 6× por CDP, capturas, video y «primer cuadro» desde un enlace. → `resultados-navegador.json`, `captura-2d.png`, `captura-iso.png`, `captura-3d.png` |

Los parámetros del hub son **supuestos de ejemplo** (fuentes en `conocimiento/anden-simulador-2026-10/realismo-logistico.md`), no un hub real
ni datos de ninguna empresa. La maqueta usa `Math.log/exp/cos` nativos: el producto usaría matemática propia (ver `tecnologia-web.md` §3).

## Cómo se repite

```bash
cd oportunidades/proyectos/anden/visiones/experiencia-medicion
node pelicula.mjs 10 && node noches.mjs 60 && node ab.mjs 40
mkdir -p /tmp/dep && (cd /tmp/dep && npm i three@0.186.1 mediabunny@1.61.6 qrcode-generator@2.0.4)
NODE_PATH=/tmp/dep/node_modules node enlace.mjs
DEPS=/tmp/dep node correr.cjs        # necesita Playwright y Chromium (en este entorno: /opt/node-tools y /opt/pw-browsers)
```

Entorno: contenedor compartido con Intel Xeon 2,1 GHz, 4 núcleos virtuales, sin GPU; Node 22.22.0. Los tiempos varían ±15–30% entre
corridas; por eso se dan medianas y rangos.

## Resultados (HECHO medido, 17-10-2026)

**Película de la noche** (10 semillas; hub de ~24.000 paquetes con 4 inductores, sorter de 300 bandejas a 2 m/s y 60 rampas; hub
de ~90.000 con 14 inductores, 760 bandejas y 138 rampas):

| | Hub 24k | Hub 90k |
|---|---|---|
| Noche entera con traza, Node (mediana; rango) | **182 ms** (144–225) | **773 ms** (659–1.018) |
| Noche entera en un Worker de Chromium (mediana de 6) | 209 ms | 827 ms |
| Primeros 15 minutos simulados (lo que necesita el primer cuadro) | 2,2 ms | 5,3 ms |
| Eventos + pasos del sorter por noche | ~100.000 + ~85.000 | ~391.000 + ~161.000 |
| Veces más rápido que el tiempo real | ~160.000 | ~42.000 |
| Tramos de la traza; peso crudo → columnas con gzip | 198.000; 5,5 MB → 1,3 MB | 760.000; 21 MB → 5,2 MB |

En el hub 24k, la recirculación de 60 noches tuvo mediana 0,17%, percentil 90 de 7,2% y máximo de 15,0% (la semilla 2, que es la
escena que usa el banco del navegador); en 11 de 60 noches faltó un inductor. La «noche promedio» no se parece a ninguna noche: la vista
tiene que poder mostrar la peor.

**Pantalla dividida A/B** (4 → 5 inductores, 40 réplicas): con la misma aleatoriedad en los dos lados, la diferencia del percentil 90 de
espera fue −0,82 min (IC 95% ± 0,09) y su varianza **8,4 veces menor** que con suertes independientes (± 0,27); la del fin de la
clasificación, −5,6 min (± 3,4), solo 1,4 veces menor.

**Enlace y QR** (`resultados-enlace.json`):

| Contenido | JSON | Comprimido | Caracteres en el `#` | QR que hace falta (URL completa) |
|---|---|---|---|---|
| Modelo completo (60 rampas, 27 personas, 26 camiones, curva de 96 tramos, 9 parámetros con procedencia, 3 escenarios) | 17.262 B | 2.862 B deflate-raw · 2.206 B brotli | 3.816 | No entra (tope de un QR versión 40-L: 2.953 bytes) |
| Plantilla publicada + parche de 5 cambios | 385 B | 198 B | 264 | Versión 11 (L) · 12 (M) |
| Receta de una escena (huella del modelo, versión del motor, semilla, instante, velocidad) | 99 B | 95–98 B (la huella no se comprime) | 127–131 | Versión 7 (L) · 8–9 (M) |

**Costo por cuadro, 1280 × 720, sin GPU** (mediana; percentil 95), en el instante con más cosas a la vista:

| Vista | Hub 24k (~370 visibles) | Hub 90k (~1.860 visibles) |
|---|---|---|
| Solo calcular posiciones desde la traza | < 0,1 ms | 0,2 ms |
| Plano 2D | 0,8–1,3 ms (1,5) | 1,9 ms (3,2) |
| 2,5D isométrica con sprites horneados | **1,8 ms (2,7)** | 5,9 ms (7,3) |
| 3D three.js, resolución completa | 33–36 ms (43) | 61 ms (67) |
| 3D three.js, media resolución | 19 ms (24) | 50 ms (57) |
| Plano 2D con CPU 4× / 6× | 4,1 / 5,6 ms | 8,3 / 13 ms |
| 2,5D con CPU 4× / 6× | **6,8 / 16,8 ms** | 29 / 46 ms |

El primer lienzo de la página pagó ~34 ms por cuadro hasta que Chromium cambió su modo de lectura (después, 0,9 ms): el banco descarta
esa corrida. Con la CPU frenada por CDP se frena el JavaScript, no la rasterización en el proceso de GPU: es una aproximación de un
teléfono, no un teléfono.

**Video**: 10 s a 30 cuadros por segundo de la vista 2,5D (1280 × 720) codificados en **2,2–2,4 s** (4,2–4,6 veces el tiempo real), **1,9 MB**,
VP9 en WebM. Este Chromium no codifica H.264 (MP4) ni por WebCodecs ni por MediaRecorder; sí VP8, VP9 y AV1.

**Primer cuadro desde un enlace** (sin red ni carga de JavaScript): descomprimir y leer el modelo, 3,5–6,8 ms; simular los primeros
10 minutos y dibujar el primer cuadro 2D, 24–36 ms; total **28–42 ms** en cuatro corridas.

**Peso de los módulos** (esbuild 0.28.2, minificado): motor de la maqueta + reproductor + vistas 2D y 2,5D, 21 KB (8,2 KB brotli);
exportador de video (mediabunny, solo MP4/WebM y lienzo), 228 KB (50 KB brotli), cargado a demanda.

## Qué NO dicen estas mediciones

Nada sobre teléfonos reales, GPU reales, Firefox ni Safari. La maqueta es un hub; un depósito con miles de ubicaciones a la vista tiene
más objetos estáticos (que se hornean) pero no necesariamente más objetos en movimiento. Hay que repetir el banco en 3 teléfonos
Android (gama baja, media y alta), 1 iPhone y 1 notebook con gráficos integrados.
