# Capítulo 67 — El Lany Master en 3D, la hoja que se curva y los juegos más claros (prueba 41, 31-10-2026)

## 1. Lo que pidió el fundador

- **La lista de la prueba 41** (con tres capturas): Inicio sin «le ganaste a Ana»; el festejo de pieza con Lany que agarra la pieza y
  piezas más grandes; el versículo del día en la NBV; **pasar de página como en la app de Libros del iPhone**; la temática por área
  y nivel (Éxodo con sus plagas, el desierto con tiendas y Lany vestida de hebrea: ejemplos, no encargos); seguir con las traducciones
  y más preguntas con los créditos; «¿Quién es?» y «Nombres por letra» contra otras personas; el backlog de juegos e ideas a la vista;
  la entrada del Espadeo con tres caminos claros y el rival con alias y nombre; «Aquí no se trata de ganar…» reescrito sin sonar a IA;
  el hub de Jugar sin «Más juegos» todos iguales y la trivia de la iglesia como **flujo del líder** (sube el PDF del sermón → el grupo
  recibe «jugá la trivia de mi iglesia», tipo Kahoot con fecha y hora o un torneo con llaves, con aviso a todos y el PDF para bajar si
  el líder lo permite); «Antes o después» con niveles como Candy Crush; el álbum fuera de los juegos, anual y con cara de álbum;
  los globitos de abajo que se limpian al entrar; las piernas de Lany arregladas en la causa raíz; textos cortados.
- **A mitad de la sesión, el pedido grande:** «Lany tiene que comportarse como un personaje de dibujos animados, no como un sticker
  al que le agregamos movimientos»: saltar, girar sobre sí misma, caminar y correr, inclinarse, mirar a los costados, agacharse, darse
  vuelta y mostrar la espalda, levantar los brazos, cambiar de postura, interactuar con objetos. Nada de objetos pegados encima,
  extremidades que se mueven como piezas sueltas, personajes que nunca cambian de perspectiva ni accesorios que ignoran el volumen.
- **Y después, el objetivo definitivo (IMPORTANTÍSIMO):** adoptar la metodología de producción de personajes de los estudios (con los
  posts de Duolingo como referencia: diseño, modelado, texturizado, rigging, controles faciales, dirección de actuación y animación);
  construir **un Lany Master** (modelo tridimensional completo, lana con volumen, ojos y boca con controles, esqueleto profesional,
  manos y pies, orejas y secundarios, vistas frontal, lateral, posterior y tres cuartos); movimiento libre y natural; interacción
  física con los objetos (el cinturón que de verdad rodea la cintura, el casco que se levanta y se acomoda, la mano que cierra sobre
  el asa del escudo); dirección artística intacta (rostro marrón, lana crema, ojos expresivos, orejas, pañuelo naranja, zapatillas;
  estética de animación 3D estilizada, ni realismo ni videojuego genérico); **cuatro pruebas obligatorias** (turnaround, movimiento,
  interacción, actuación heroica); integración en toda Senda con un sistema central; elegir las herramientas y ejecutar, sin
  presentar comparaciones; conservar lo estable y no acumular parches sobre un rig defectuoso.

## 2. Las decisiones (ejecutadas, no propuestas)

| Qué | Elegido | Por qué |
|---|---|---|
| Dónde vive el personaje | **Blender 4.5 LTS** (headless, por código: `scripts/lany3d/` en la app) | La herramienta profesional estándar para modelar, riggear y animar; el personaje se construye por código, como la Lany de Rive, para que quede en git y se regenere igual en cualquier máquina. Blender es GPL; lo que produce es nuestro. |
| Cómo viaja a la app | **glTF binario** (`assets/lani/lany.glb`, 2,2 MB) + manifiesto (clips, eventos de objetos, sockets, offsets) | Estándar abierto; un solo archivo con malla, esqueleto, morph targets y los 22 clips muestreados. Sin texturas: colores por vértice, nada que decodificar en el teléfono. |
| Quién lo dibuja en el teléfono | **three.js sobre expo-gl** (ya estaban en Senda por la fiesta), con sombreado toon de tres escalones y contorno de dibujo animado | OpenGL ES: corre en gama baja y en la web (la vista previa). Descartados react-native-filament (más peso, otra librería de worklets) y react-native-wgpu (Vulkan obligatorio), y los renders pre-hechos (no pueden mirar a un punto ni fundir animaciones, y pesan decenas de MB). |
| Rive | Sigue para las Lany chiquitas (< 60 px) y como respaldo si el 3D falla | Lo que ya anda no se tira; el 3D se prende con un ajuste («Lany en 3D», encendido de fábrica). |
| La hoja del lector | **@shopify/react-native-skia 2.6.2** (la versión que fija Expo SDK 57) + shader SkSL propio | La única vía verificada para el curl de Libros siguiendo el dedo en Android e iOS con nuestro texto nativo (ver §5 y la investigación). |

Esto reemplaza la decisión del capítulo 52 §2 («Lany es 2D y sigue 2D»): la razón de entonces (el 3D costaba expresiones) se resolvió
con los controles faciales del rig (párpados, cejas, ojos, boca con formas). La Lany de Rive queda como respaldo y para lo chiquito.

## 3. El Lany Master, paso a paso (HECHOS, todo en `senda-app` commit cddeb48 y siguientes)

- **Herramienta instalada y comprobada:** Blender 4.5.9 LTS descargado de download.blender.org (sha256 verificado), corriendo en
  segundo plano en el entorno de Claude (Workbench, EEVEE y Cycles renderizan; el exportador glTF y Rigify están). Para CI se baja en
  el paso del workflow cuando haga falta regenerar el modelo (hoy el GLB va en el repositorio).
- **Modelo** (`comun.py`, `modelo.py`): las medidas son las del rig 2D (Lany mide 335 px = 2 unidades) para que no cambie de
  proporciones. Cráneo y torso como sólidos de revolución (los mismos del volumen 2D de la prueba 41), hocico, nariz, ojos con iris,
  pupila y brillo y párpados de arriba y de abajo como casquetes (abiertos quedan dentro de la cabeza), cejas de lana, orejas con el
  interior rosado, el jopo de cinco bultos, la lana como nube de 40 vellones alrededor del núcleo (la silueta con festones desde
  cualquier ángulo), pañuelo con nudo y dos puntas, cola, brazos con manos de tres dedos y pulgar, piernas y zapatillas con la franja
  naranja. 15.644 vértices. La boca es una rejilla con cuatro formas (plana, abierta, «o», triste) y dientes y lengua que asoman.
  Y la armadura entera, seis piezas: cinturón (un aro con la forma exacta de la cintura), casco (calza sobre el cráneo con 2 px de
  aire y deja las cejas a la vista), escudo con cruz y asa, espada, coraza (una placa curva con grosor que sigue el perfil del torso,
  borde dorado y gema; `cascara()`) y dos botas (tapan las zapatillas y suben por la canilla).
- **Rig** (`rig.py`): 53 huesos exportados (raíz, cadera, columna, pecho, cuello, cabeza, jopo, boca, cola, pañuelo; hombro, brazo,
  antebrazo, mano, tres dedos y pulgar por lado; muslo, canilla, pie y punta; ojos, párpados, cejas y orejas de dos tramos) más los
  controles de IK (mano y pie con sus polos) y **nueve sockets** (cadera, cabeza, espalda, pecho, las dos manos, los dos tobillos y
  uno libre para lo que vuela) donde se enganchan los objetos. Los pesos no son automáticos: cada pieza sabe a qué hueso va y las
  articulaciones se mezclan a lo largo del hueso.
  **El rig se midió, no se adivinó** (31-10, a la noche): al revisar la coraza, los codos se juntaban adelante al sostener algo. Un
  script de diagnóstico en Blender (posiciones de codo y rodilla en seis poses, torsión de la mano y la canilla en reposo contra su
  reposo modelado) mostró la causa: los polos de brazos y piernas tenían el signo cambiado y el brazo y la pierna quedaban girados
  180° en reposo (los pulgares hacia afuera) y doblaban al revés (codo adelante, rodilla atrás al dar un paso). Se corrigió en el rig
  (brazos +90° con el polo detrás y abajo del codo, piernas −90° con el polo delante de la rodilla, el codo del reposo 5 px atrás) y
  se volvió a medir: torsión 6° y 0°, codos atrás/abajo y rodillas adelante en todas las poses, igual de los dos lados. Ningún clip se
  parchó. Otro hallazgo de las tiras: los brazos de Lany no llegan por encima de su cabeza (cabeza grande, brazos cortos), así que
  «ponerse el casco» no puede ser levantarlo: ahora lo lanza (toma impulso, el casco sube solo por el socket libre, da una vuelta en
  el aire, ella lo sigue con los ojos y se acomoda debajo, le cae con aplastón y lo ajusta por el borde). El escudo se muestra de
  frente con la muñeca extendida y termina colgando, que es como lo lleva puesto.
- **El lenguaje para animar** (`animaciones.py`): rotaciones en los ejes del personaje (adelante, costado, giro), posiciones en px,
  squash & stretch con volumen, suavizados con nombre (resorte, caída, rebote, salto), cara (parpadeo, ojos, cejas, mirada, boca),
  eventos de objetos y `seguir()`, que genera el movimiento secundario (orejas, pañuelo, jopo y cola llegan tarde y se pasan de largo).
  Cada clip queda completo (todo hueso con clave): ningún clip hereda la pose del anterior, ni en los renders ni en la app.
- **El repertorio** (`clips.py`, 22 clips) y **las cuatro pruebas** pedidas, revisadas cuadro a cuadro en tiras de Blender:
  - **A. Turnaround:** el turnaround quieto desde ocho ángulos; `vuelta` (toma envión, salta girando 360° con los brazos abiertos y
    aterriza con aplastón y rebote; el giro va con Euler para que la vuelta entera no se pierda en el cuaternión); `darseVuelta`
    (gira con dos pasos sin patinar, muestra la espalda, mira por sobre el hombro y vuelve).
  - **B. Movimiento:** `caminar` (contacto, abajo, pasada, arriba; caderas y hombros contrapuestos), `correr` (con fase de vuelo),
    `saltar` (anticipación, estirón, vuelo con las piernas recogidas, caída, aplastón y rebote), `agacharse`, `inclinar`, `levantar`.
  - **C. Interacción:** `ponCinturon` (lo trae en la mano derecha, lo pasa por detrás de la espalda a la izquierda, que lo recibe y lo
    trae por su costado hasta adelante; las dos manos lo abrochan y tiran; mete panza y se acomoda), `ponCasco` (lo lleva por el borde
    entre las dos manos, lo levanta en arco, lo baja hasta que calza, lo ajusta con las dos manos; el jopo se achata), `tomaEscudo`
    (lo busca en la espalda, la mano cierra sobre el asa, lo trae con esfuerzo y lo presenta al frente), `tomaEspada` (la saca de la
    espalda, la levanta al cielo, baja en guardia).
  - **D. Actuación:** `heroica` (pies separados, pecho afuera, puños en la cintura, cabeza en alto, orejas paradas, respira) y
    `presentacion` (brazos cruzados, ladea la cabeza, guiña, el peso pasa de una pierna a la otra).
  - Y el repertorio de la app: `reposo`, `pensar`, `saludo`, `festejo`, `acierto`, `error`, `patatus` (cae de espaldas como una tabla,
    rebota, queda tirada y una pierna tiembla), `mirar`.
- **En la app** (`src/lany3d/actor.js`, `src/componentes/lany3d.tsx`): el actor carga el GLB una sola vez, clona el esqueleto por cada
  Lany en pantalla, mezcla clips con fundidos, engancha los objetos a los sockets con los offsets del manifiesto (un socket virtual
  «manos» entre las dos manos para el casco), aplica la mirada y la inclinación después del mezclador en los ejes del personaje, y pausa
  cuando la app está de fondo. `Lany` (`Arte.tsx`) elige motor: Lany Master desde 60 px, Rive si falla, imagen si todo falla. Las poses
  y gestos de la app se traducen a clips (`POSE_CLIP`, `GESTO_CLIP`): el director no cambió.
- **Verificado donde importa:** en Blender (tiras de las cuatro pruebas y del repertorio), en el motor de la app dentro de Chromium
  (`scripts/lany3d/probar_web.cjs`: esqueleto, morph targets, colores, objetos en los sockets, mirada; encontró y resolvió dos
  diferencias reales entre engines: three limpia los nombres con punto de los huesos y deja los sockets con su propia orientación de
  reposo) y **dentro de Senda** (la vista previa web: el Taller de Lany, Inicio y el festejo con el casco puesto).

## 4. Lo que se ve distinto en la app (prueba 41)

- **Lany en 3D** en todas las Lany de 60 px o más (Inicio, lecciones, Espadeo, festejos, Taller de Lany, bienvenida); las chiquitas
  siguen en Rive. Un interruptor en Ajustes («Lany en 3D») la apaga si un teléfono va lento.
- **La hoja del lector se curva** al pasar, como en Libros: la hoja que se dobla se captura en reposo y una capa de Skia la enrolla
  siguiendo el dedo (por el borde o por la esquina según dónde se toque), con el dorso del color del papel y la sombra sobre la hoja
  de abajo; todo en el hilo nativo. Sin captura, en la web o con «reducir movimiento», sigue el pliegue de antes.
- **Espadeo:** entrada con tres caminos (practicar con Lany a la par, duelo al azar, duelos con amigos), el rival con alias y nombre,
  la armadura fija arriba, «Ganar está bien. Quedarte con la Palabra, mejor».
- **Jugar en secciones** («Aprender jugando» y «Con tu grupo»); la **trivia del sermón programada**: el líder revisa el PDF, elige
  día, hora y cuántas preguntas, y «Avisar al grupo y programar» crea el torneo del grupo (el servidor avisa a todos «Torneo nuevo
  en tu grupo»); puede compartir el PDF (almacenamiento privado con firma). El torneo con llaves (eliminación) queda para la 42.
- **«Antes o después» con niveles:** diez niveles en un camino en zigzag; estrellas por vidas; épocas con color; Lany reacciona.
- **El álbum anual** (el año como tapa), fuera de los juegos y con su tarjeta en Inicio; los globitos de abajo se limpian al entrar.
- **Inicio sin «le ganaste a Ana»**, el **versículo del día en la NBV**, el festejo con piezas más grandes.
- **Trivia:** banco 41 con **1.593 preguntas nuevas** por lotes (400 pedidos, 1.600 candidatas, 1.593 pasan el control del taller;
  ids de cinco cifras para no pisar al banco 40): **5.371 preguntas vivas** (la meta de 4.000 para Pascua, superada); la traducción
  al portugués de las nuevas, enviada por lotes (el inglés, con el presupuesto del mes que viene si los créditos no alcanzan).

## 5. La investigación del pase de hoja (resumen; HECHOS del 31-10-2026)

- Candidatas revisadas con `npm view` y lectura del código: `react-native-pagecurl` (solo dibuja texto propio), `react-native-page-flipper`
  (giro rígido y rompe con Reanimated 4), `react-native-flip-page` (abandonada), `react-native-pager-view` (desliza, no curva),
  `UIPageViewController .pageCurl` (solo iOS), expo-gl + three (contexto por pantalla y three en el hilo JS), Rive/Lottie (no pueden
  texturizar una vista nativa viva), Skia v3 (minSdk 26 y Vulkan obligatorio: canvas en blanco en gama baja).
- Elegida Skia v2 (2.6.2, la que fija Expo SDK 57, OpenGL desde API 21, MIT). El shader propio se compiló y renderizó antes con
  CanvasKit (el mismo motor), y `opaque`/SurfaceView están en 2.6.2 (la palanca de rendimiento que midió Margelo).
- Peso: ≈ 4–5 MB más en el APK arm64 (lo mide `apk.yml`).
- **Regla de corte:** antes del APK 42, si en el teléfono del fundador (o uno de gama baja) la vuelta tiene más del 10 % de cuadros
  lentos después de las tres palancas (recortar el shader a la banda del doblez, SurfaceView opaco, captura a 2x), o la captura
  falla en alguna versión de Android, se publica el pliegue con Reanimated y Skia se saca (quedó en una rama).

## 6. Herramientas elegidas (regla 10)

- `31-10-2026 — Lany Master: Blender 4.5.9 LTS (download.blender.org, GPL; sha256 verificado), por código en scripts/lany3d/; salida
  glTF (Khronos) + manifiesto; reproducción con three.js 0.186 sobre expo-gl 57 (MIT), sombreado toon y contorno propios; Rive de
  respaldo. Por qué: volumen y libertad de movimiento de verdad (giro, salto, agarre con oclusión) con un solo archivo de 2,2 MB que
  corre en OpenGL ES; nada de renders pre-hechos ni engines con Vulkan. Regla de corte: si en gama baja el GLView baja de 30 cuadros
  por segundo o la batería se nota, se baja la resolución del lienzo y los vellones; si no alcanza, el 3D queda solo para los
  festejos y las pantallas grandes, y Rive vuelve a las demás.`
- `31-10-2026 — Vuelta de hoja del lector: @shopify/react-native-skia 2.6.2 (v2 OpenGL; la que fija Expo SDK 57; doc oficial
  wcandillon.github.io/react-native-skia/v2), MIT, costo 0; shader SkSL propio de curl en cilindro sobre la hoja capturada con
  makeImageFromView, uniformes por Reanimated + Gesture Handler en el hilo de UI. Regla de corte en §5.`

## 7. Lo que queda (en orden) y lo que es del fundador

1. **Probar el APK 41** y mandar una grabación corta de la vuelta de hoja y de Lany en Inicio (si algo va lento, el interruptor
   «Lany en 3D» en Ajustes y la regla de corte de la hoja). El primer intento de APK 41 (19:26 UTC) falló en el validador: 95
   preguntas del banco 41 citaban «San Mateo» y «San Lucas» (los títulos de la RV1909, que el instalador de lotes copiaba) y una
   cita del dato no era textual; se corrigieron las citas en los dos bancos y el instalador escribe los nombres de la app
   (`_sin_san`) y controla las comillas con la misma regla del validador; el APK se compiló después del arreglo del rig.
2. Lany Master v2: ropa por área (túnica, chaleco, gorras); clips propios para los gestos que hoy comparten clip; las expresiones
   como capa sobre cualquier clip; que camine por la pantalla; medir en gama baja.
3. «¿Quién es?» y «Nombres por letra» contra otras personas (RPC en la base, como los duelos del Espadeo); el torneo con llaves.
4. La temática por área y nivel (fondos y escenas por ruta, Lany vestida según la lección), con el Lany Master.
5. El inglés de las 1.593 preguntas nuevas (lotes) y las 331 dudas de la segunda lectura de las lecciones.
6. Del fundador: el APK 41; INPI, abogado de PI y la autorización del ministerio; la cuenta de Play; los cuatro pasos de lo social.

## 8. Evidencia

- HECHO: commits de `senda-app` c6c83b5 (Antes o después), cddeb48 (Lany Master), b767173 (hoja curvada), 9bacbf3 (banco 41),
  5ca5187 (migración del PDF en Postgres pelado) y el del rig medido, la armadura entera y las citas sin «San» (ver el log de
  `senda-app`); las tiras y láminas de control quedaron en el entorno de trabajo de Claude y se regeneran con `construir.py --renders`.
- ESTIMACIÓN: el gasto de créditos (~USD 173 antes de la traducción al portugués; ~USD 183 después); se verifica en la consola de
  Anthropic antes de mandar el inglés.
