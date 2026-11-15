# Hub Nocturno v2 · capa de presentación 3D y primer contacto (15-11-2026)

Rehace **cómo se ve y cómo se entiende** Hub Nocturno, sin tocar las reglas. El modelo probado (`../js/modelo.js`, `../js/datos.js`,
`../js/ronda.js`) se importa tal cual: esta carpeta solo lo consulta y le pide acciones. La versión anterior (`../index.html`) queda
intacta y sus pruebas siguen corriendo igual.

**Por qué existe.** El fundador probó la v1 y no entendió nada: no supo qué eran las «sacas», no vio animaciones, le pareció un
artefacto hecho en un minuto. Tenía razón: era un mapa plano con puntos y textos con jerga.

## Qué hay

| Pieza | Qué hace |
|---|---|
| **Mundo 3D** (`src/mundo/`) | El sur de Sudamérica como maqueta con **relieve real** (ETOPO 2022, exagerado 20×: la cordillera se ve desde Buenos Aires), costa nítida con playa y espuma, mar con color según la profundidad real, ríos y lagos, nubes que derivan y dan sombra, fronteras como costura punteada |
| **Día y noche** (`cielo.js`) | Una sola fuente de luz para todo: amanecer, mediodía, atardecer dorado, crepúsculo y noche con luna y estrellas. De noche las ciudades se encienden, la base tiene un faro que gira y los aviones llevan luces |
| **Ciudades** (`ciudades.js`) | 37 conjuntos de maqueta distintos (ficha de pasto, pista con luces, hangar, casas, edificios según el tamaño, árboles). Buenos Aires lleva el correo central con cúpula dorada |
| **Aviones** (`aviones.js`, `vuelos.js`) | Los 7 tipos modelados por código, con formas propias (biplano con piloto y bufanda, monoplano de ala alta, bimotor, cuatrimotor, turbohélice, jet y carguero). Carretean, despegan, **viran inclinándose**, dejan estela, aterrizan, dan la vuelta en la cabecera. La posición sale del modelo: la vista no inventa nada |
| **Rutas y faros** (`rutas.js`) | La ruta se dibuja sola al abrirla; los faros se **encienden en cadena** con una nota cada uno y una luz que corre por la ruta toda la noche |
| **Cámara de cine** (`mundo.js`) | Entrada de 10 s (de la cordillera de noche al amanecer en Buenos Aires), seguir a un avión, acercarse a la base, encuadrar la red. Arrastrar mueve, rueda o pellizco acerca, botón derecho gira |
| **Respuesta a cada acción** | La plata cuenta sola, monedas que vuelan a la caja, cifras que flotan, sobres que saltan al avión, chispas, papelitos, polvo en la pista, cartel de misión cumplida |
| **Primer minuto guiado** (`main.js`) | Dos frases de historia y después una acción por vez, con flecha, anillo, dedo y un solo cartel: tocar Montevideo → abrir la ruta → comprar el avión → verlo volar → cobrar. Después, un botón **Siguiente paso** que siempre dice qué conviene; la primera noche vuelve el mismo patrón (la ruta abierta, una frase y el dedo sobre «Poner faros») |
| **Carteles en fila** (`main.js`, «carteles en fila») | Nunca dos carteles importantes a la vez: el festejo de una misión, la pregunta de la base (se queda hasta que se responde y nada la tapa), la guía de la noche y las tarjetas de aviso esperan su turno. Una misión cumplida se queda su tiempo entero a cualquier velocidad y deja un aviso de 12 s |
| **Rótulos sin choques** (`ui/rotulos.js`) | Algoritmo voraz por prioridad (la base, las ciudades de la misión, las que tienen cartas, el resto): cada rótulo prueba 9 lugares alrededor de su ciudad y se queda con el primero que no pisa otro rótulo, un panel fijo ni la ciudad de otro; si no entra, no se muestra. Con memoria para que no titile |
| **Sonido y música** (`audio/audio.js`) | Todo generado por código: una milonga lenta en re menor (ritmo 3-3-2) con guitarra pulsada, fuelle y campanitas; de noche queda el fuelle y las campanitas. Cada acción tiene su sonido |
| **Español rioplatense e inglés** (`ui/textos.js`) | Palabras de un chico de 12 años. Nunca «sacas», «transbordo», «hub» ni «balizas» (lo comprueba una prueba) |

### Glosario del juego (8 términos, cada uno con su ícono; está en el menú, «¿Qué es cada cosa?»)

| Ícono | Término | Una frase |
|---|---|---|
| sobre y paquete | **Cartas y paquetes** | Lo que llevás. Cada entrega te paga. |
| línea punteada entre dos puntos | **Ruta** | El camino entre dos ciudades. Por ahí vuelan tus aviones. |
| avión | **Avión** | Va y vuelve solo por su ruta, llevando cartas. |
| casa con estrella | **Base** | Buenos Aires. Acá las cartas llegan en un avión y siguen viaje en otro. |
| torre con luz | **Faros** | Luces en el suelo. Con faros, tus aviones vuelan también de noche. |
| estrella | **Misión** | Lo que te pide la historia. Al cumplirla ganás un premio. |
| hoja con sello | **Encargo** | Un pedido especial, con fecha límite y premio extra. |
| barras con flecha | **Ganancia del día** | Lo que entró menos lo que gastaste hoy. |

## Cómo se corre y se construye

```bash
cd apps/juegos/aviacion/v2
npm install                      # una vez (three, postprocessing, camera-controls, animejs, tone, fuentes, esbuild)
npm run construir                # deja dist/ (index.html + archivos relativos; sin CDN, sin servidor propio)
npm run servir                   # http://localhost:8812  (cualquier servidor de archivos sirve)
node --test pruebas/*.test.mjs   # pruebas de los textos y de la colocación de rótulos (sin navegador)
node herramientas/jugador.cjs 10 # jugador automático: 10 minutos siguiendo «Siguiente paso»; falla si hay un error de JavaScript
node herramientas/medir.cjs      # cuadros por segundo por nivel de calidad
node herramientas/capturas.cjs   # rehace las 8 capturas de capturas/
```

`dist/` está versionado para poder jugar sin construir: alcanza con servir esa carpeta (con doble clic sobre `index.html` no anda:
los navegadores no cargan módulos desde un archivo suelto). Parámetros útiles de la dirección:
`?lang=es|en`, `?calidad=alto|medio|bajo`, `?nuevo=1` (ignora el guardado), `?saltar=guia` (sin entrada ni guía).

El relieve se rehace con `python3 herramientas/relieve.py <carpeta de descargas> 1536` (numpy, scipy y Pillow); las direcciones de
las fuentes están en el encabezado del archivo. No hace falta para construir: las texturas ya están en `activos/`.

## Herramientas elegidas (regla 10: una por necesidad, verificada en fuente oficial el 15-11-2026)

| Necesidad | Herramienta · versión · fecha | Fuente | Licencia | Por qué esta | Regla de corte |
|---|---|---|---|---|---|
| Motor 3D | **three.js 0.186.1** (24-09-2026), `WebGLRenderer` | npm (`npm view three`) | MIT | La que fijó el radar técnico del 30-10; WebGPU falla en este entorno | Cambiar solo con prueba comparativa en equipos reales (radar §2.1) |
| Posproceso | **postprocessing 6.39.5** (09-09-2026): bloom, viñeta, mapeo tonal ACES, SMAA y *tilt-shift* (el desenfoque que da el aire de maqueta) | npm | Zlib | Un solo pase para todo; pide `three < 0.187` | Se apaga entero en el nivel liviano |
| Cámara | **camera-controls 3.1.2** (17-11-2025) | npm | MIT | Transiciones suaves, acercar hacia el cursor, gestos táctiles y límites sin escribir una cámara propia | Si faltara un editor de tomas, mirar Theatre.js (hoy quieto) |
| Animación de interfaz | **anime.js 4.5.0** (22-06-2026) | npm | MIT | Modular y liviana; GSAP queda afuera por licencia propietaria (radar §2.2) | — |
| Sonido y música | **Tone.js 15.1.22** (27-04-2025) | npm | MIT | Sintetizadores, secuencias y efectos de primera sobre Web Audio: la música y los sonidos pesan cero bytes | Si una pieza grabada CC0 sonara mejor, se suma con Howler |
| Tipografías | **Fraunces 5.3.0** y **Nunito 5.3.0** variables (Fontsource, 19-07-2026), solo el recorte latino | npm | OFL-1.1 | Fraunces da el tono de época en títulos y cifras; Nunito se lee fácil | — |
| Empaquetado | **esbuild 0.28.2** (08-08-2026) | npm | MIT | El del resto del holding | — |
| Relieve | **NOAA NCEI ETOPO 2022**, 60 segundos de arco, superficie (doi:10.25921/fd45-gt74) | Servicio NCSS de THREDDS de NCEI (respondió desde este entorno; el ERDDAP de ETOPO1 dio 503) | Dominio público (obra del gobierno de EE. UU.) | Tierra y fondo del mar en una sola grilla | Si hiciera falta más detalle cerca de la base: teselas Terrarium (también de fuentes públicas) |
| Color del suelo, ríos, lagos y fronteras | **Natural Earth** (cobertura `NE2_LR_LC` y vectores 1:50m) | naciscdn.org · github.com/nvkelso/natural-earth-vector | Dominio público | La misma fuente que ya usaba la v1 para las costas | — |
| Modelos 3D | **Por código, en three** (fuselajes de revolución, alas extruidas con canto redondeado, piezas fundidas con color por vértice) | — | propio | Pesan cero bytes, se iteran mirando la captura y no dependen de modelos ajenos. Blender (`bpy`) queda para cuando haga falta más detalle | Pasar a `bpy` + glTF Transform si un avión necesita más de ~3.000 triángulos o esqueleto |
| Íconos | Dibujados a mano en SVG | — | propio | Son la identidad del juego (el sobre con borde de correo aéreo) | — |

Lo que **no** se usó y por qué: GSAP (licencia propietaria), Quaternius (ya no es CC0, radar §2.1), Kenney (su sitio devuelve 403
desde este entorno, no se pudo verificar el paquete), `WebGPURenderer` (falla acá).

## Lo medido (15-11-2026)

**Peso de la descarga inicial:** 3,4 MB sin comprimir en total (objetivo: menos de 8 MB).

| Archivo | Peso |
|---|---|
| `activos/alturas.webp` (relieve y ríos, sin pérdida) | 1.663 KB |
| `juego.js` (motor, juego y sonido; 442 KB con gzip) | 1.491 KB |
| `activos/suelo.webp` (color del suelo y fronteras) | 145 KB |
| `activos/costa.webp` (distancia a la orilla) | 89 KB |
| dos tipografías | 74 KB |
| `juego.css`, `index.html`, `mundo.json` | 28 KB |

**Cuadros por segundo.** Este entorno **no tiene GPU**: Chromium dibuja por software (SwiftShader) en 4 núcleos compartidos. Las
cifras son un **piso**, no lo que da un equipo real (lo mismo que advierte el radar técnico, §0). `node herramientas/medir.cjs`,
red de 4 rutas y 8 aviones:

| Pantalla | Alto | Medio | Liviano | Automático (termina en liviano a 0,4 de resolución) |
|---|---|---|---|---|
| 1280×720 | 1,1 | 2,1 | 4,1 | 8,5 |
| 390×844 | 1,5 | 3,9 | 7,2 | 14,1 |

- El costo es casi todo relleno de píxeles (medido apagando piezas): sin terreno, mar ni cielo el mismo equipo da 39 cuadros; a mitad
  de resolución, 13 con todo encendido.
- **Niveles automáticos:** al arrancar se elige alto, medio o liviano según la GPU, los núcleos, la memoria y si es celular; sin GPU
  se empieza en liviano a media resolución. Cada 1,5 s se miden los cuadros: por debajo de 27 baja la resolución de a pasos, después
  apaga el posproceso y sigue bajando hasta 0,4; por encima de 52 vuelve a subir. El menú deja fijar el nivel a mano.
- El modelo y la interfaz cuestan 0,3 ms por cuadro (medido): no son el límite.
- **Falta medir en una GPU real** (un celular de gama media y una notebook con gráficos integrados).

**Pruebas.**
- Modelo (`cd .. && node --test pruebas/*.test.mjs`): igual que antes de empezar. El modelo no se tocó: fallan las mismas 4 de
  economía y ronda (más la de tiempo de CPU cuando la máquina está cargada).
- Textos y rótulos de la v2 (`node --test pruebas/*.test.mjs`): 12 de 12 (7 de textos y 5 de la colocación de rótulos).
- Jugador automático (`herramientas/jugador.cjs 10`): juega solo tocando «Siguiente paso» y el botón que late. Cumple las 7 misiones
  del capítulo 1 en 3 a 4 minutos (la última corrida: 3,0, con 5 rutas y 8 aviones) y entre los 8 y los 9 pasa al capítulo 2,
  **sin errores de JavaScript**. Desde el
  15-11-2026 espera 130 ms entre toques: la interfaz descarta los toques a menos de 120 ms del anterior y, sin esa pausa, el
  jugador perdía la mayoría según cómo cayeran los cuadros (cada corrida daba otra cosa). Con la misma semilla y la misma pausa,
  la versión anterior terminaba el capítulo 1 a los 8,2 minutos: «Siguiente paso» al día hace que se sigan mejor los consejos.

## Prueba a ciegas del 15-11-2026 y lo que se corrigió

Una persona sin contexto jugó 15 minutos (hasta la misión 5): 8/10 en claridad y 7,5/10 en aspecto. Sus hallazgos y el arreglo:

| Hallazgo | Arreglo |
|---|---|
| «Que 25 cartas cambien de avión en tu base», «Tu correo ordena hasta 40 por hora» y «Agrandar el correo» no se entendían | La misión 3 dice «Que 25 cartas pasen por tu base y sigan viaje» y lleva su explicación debajo; la base dice cuántas cartas por hora pasan de un avión a otro y qué se compra al agrandar el correo. La prueba de textos impide que vuelvan «cambiar de avión» y «el correo ordena» |
| El festejo tapó la pregunta «¿Qué sale primero?» y una misión se cumplió sin verse | Carteles en fila (arriba). Además, otra tarjeta ya no puede reemplazar a la pregunta |
| Encargos sin contexto | Cada tarjeta dice, antes de aceptar, si ya se puede cumplir y por dónde pasan las cartas, o qué ruta o qué avión falta (lo mismo que mira el modelo: un camino de rutas con avión) |
| «Esta ruta perdió $ 2» y «−$ 2 hoy» en rojo al comprar el primer avión | Hasta el primer cobro no se muestra pérdida; después, el rojo aparece solo desde $ 100 |
| Decisiones sin efecto a la vista | «¿Qué sale primero?» dice qué pasa con cada opción (lo calcula el modelo) y «¿Cuándo sale el avión?» muestra las cuatro opciones con su efecto |
| «Siguiente paso» desactualizado, no parecía un botón y repetía la misión | Se recalcula con cada toque, tiene flecha y canto de botón (o se ve como aviso cuando no hay nada para tocar), no aparece con la pregunta abierta y la misión ya no repite el paso («Paso 1 de 2»). La primera vez la burbuja va arriba del botón, con el dedo encima (antes lo tapaba) |
| La noche sin faros no decía qué hacer | Guía de la primera noche (arriba) |
| En la entrada quedaba más de un segundo de pasto sin texto entre las dos frases | La segunda frase entra enseguida y lleva un velo oscuro detrás |
| Rótulos cortados debajo de los paneles o encimados; monedas y sobres por encima de los paneles | Rótulos sin choques (arriba); las monedas, los sobres y las cifras pasan por detrás de los paneles; la cámara encuadra en la parte libre de la pantalla (no debajo del panel ni de la columna de encargos); las nubes tienen el borde blando (un copo detrás de la barra parecía un recorte blanco) |

## Reglas que se respetaron

- Mecánicas de más de 20 años o propias; **no se dibujan trayectorias con el dedo** (todo es tocar una ciudad y un botón).
- Ningún nombre ni aspecto de juegos, empresas o marcas reales; los aviones son formas propias con nombres de aves del sur.
- Sin compras, sin anuncios, apto para todo público; `localStorage` siempre con `try/catch` (claves `hubnocturno.v2.*`, separadas de la v1).
- No se publicó ni se gastó nada.

## Capturas (`capturas/`, JPEG)

| Archivo | Qué muestra |
|---|---|
| `01-portada.jpg` | La portada: la base de noche, con las luces encendidas |
| `02-entrada.jpg` | La entrada: la cordillera al amanecer y la primera frase |
| `03-guia-primer-toque.jpg` | El primer paso de la guía: una sola cosa para tocar |
| `04-primer-vuelo.jpg` | El primer vuelo, con la cámara siguiendo al avión |
| `05-primer-cobro.jpg` | El primer cobro y el cartel de misión cumplida |
| `06-noche-faros.jpg` | La red de noche, con los faros encendidos |
| `07-base-atardecer.jpg` | La base al atardecer, con su panel |
| `08-celular-avion.jpg` | Celular 390×844: la tarjeta del primer avión |

## Lo que falta

1. **Medir en equipos reales** y ajustar los niveles con esos números (acá solo hay GPU por software).
2. **Repetir la prueba a ciegas** con estos arreglos (la del 15-11-2026 dio 8/10 en claridad y 7,5/10 en aspecto; ver arriba): lo
   corregido se comprobó con capturas en escritorio y en celular, pero no lo volvió a jugar alguien sin contexto.
3. **Escuchar la música y los sonidos.** Se comprobó que arrancan sin errores y que no saturan (pico medido de −16 dB jugando
   80 segundos), pero nadie los oyó: hay que afinarlos de oído.
4. **La ronda nocturna** (la mecánica propia de la v1) corre siempre en automático: falta su pantalla en la capa nueva.
5. **Capítulos 2 y 3:** se juegan con la misma capa (ciudades, aviones, pasajeros y carga con su ícono, fin de capítulo), pero no
   tienen el pulido del capítulo 1: sin momentos propios ni tomas de cámara para la cordillera o los jets.
6. **Encargos en el celular:** se aceptan desde «Siguiente paso», que dice cuál es (cuántas cartas, de dónde y adónde); falta su
   lista en pantalla angosta, con el aviso de si ya se puede cumplir.
7. **Detalle cerca de la base:** el relieve tiene unos 4 km por píxel; de muy cerca el suelo se ve liso. Con teselas de más detalle
   para la zona del Río de la Plata mejoraría.
8. **Portales:** la capa de portal de la v1 (CrazyGames, Poki) no está conectada a la v2.
9. Tormentas sin efecto visual propio (hoy avisan con un cartel y un ícono sobre el avión).
