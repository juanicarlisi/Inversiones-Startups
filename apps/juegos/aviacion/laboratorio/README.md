# Laboratorio de render de Hub Nocturno (30-10-2026)

Prueba del motor de render para portales (CrazyGames, Poki). No toca `js/` del juego: importa `js/modelo.js`, `js/render.js`, `js/datos.js` y `js/mapa.js` en solo lectura. Informe: `conocimiento/radar-tecnico-2026-10/juego.md`.

## Qué hay
| Carpeta o archivo | Qué es |
|---|---|
| `escena/estado.js` | Red grande del capítulo 3 con el modelo real: 300 aviones, 30 rutas, balizas en todas, de noche |
| `escena/canvas2d.js` | Variante A: el `dibujar()` de producción, sin tocar |
| `escena/canvas2d-opt.js` | Variante C: canvas 2D optimizado (capa fija en caché, atlas de siluetas, trazados agrupados) |
| `escena/pixi.js` | Variante B: PixiJS 8.22.0, WebGL (`?pref=canvas` usa su renderer Canvas) |
| `escena/globo-three.js`, `globo-maplibre.js`, `globo-deck.js`, `phaser.js` | Candidatos de humo: three.js globo, MapLibre globo, deck.gl `_GlobeView`, Phaser 4 |
| `escena/atlas.js` | Siluetas del juego dibujadas a un atlas (copia de `silueta()` de `js/render.js`) |
| `escena/comun.js` | Arnés: avanza el modelo como el bucle del juego y mide (rAF, cuadros sincrónicos, llamadas) |
| `bench.cjs`, `configs/*.json` | Playwright + CDP: estrangulación de CPU, CPU por proceso, red, capturas |
| `pesos.mjs`, `resumen.mjs` | Peso de cada librería (esbuild + brotli) y tabla resumen de resultados |
| `autoprueba.html` | Prueba en el dispositivo real: corre los 4 motores y muestra fps. Pensada para un Chromebook |
| `resultados/`, `capturas/` | Datos crudos (JSON) y capturas de las pruebas |

## Cómo se corre
```
cd apps/juegos/aviacion/laboratorio && npm install            # versiones fijas en package.json
for f in canvas2d canvas2d-opt pixi; do npx esbuild escena/$f.js --bundle --minify --format=esm --target=es2022 --outfile=dist/$f.js; done
NODE_PATH=/opt/node-tools/node_modules node bench.cjs matriz   # lee configs/matriz.json, escribe resultados/matriz.json
node resumen.mjs matriz                                        # tabla
node pesos.mjs                                                 # pesos de librerías
node servidor.mjs 8080 --lan                                   # sirve el juego; abrir /laboratorio/autoprueba.html en el Chromebook
```

## Advertencias de método (ver informe §4)
- Este entorno **no tiene GPU**: WebGL corre en SwiftShader. Un cuadro de pantalla completa con un solo sprite cuesta 150-250 ms a 1366×768. Las cifras de PixiJS/three/Phaser en WebGL **no sirven para decidir**; sí sirven las de canvas 2D y las de CPU del lado de JS.
- No pasar `--use-angle=swiftshader`: manda la composición por SwiftShader y baja un relleno plano de pantalla completa de 60 a 17 fps.
- La máquina es compartida: el promedio de carga fue de 8 a 12 sobre 4 núcleos durante las pruebas. Los números absolutos son pesimistas; las comparaciones se hicieron intercaladas (A-B-C-A-B-C) y con repeticiones.
