# Hub Nocturno v2 · capa 3D, primer contacto y etapa 1 «decidir sabiendo» (16-11-2026)

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
| **Tarjeta de decisión** (`estimador.js`, etapa 1) | Antes de abrir una ruta, comprar un avión, poner faros o agrandar el correo: **Cuesta · Deja por día · Se paga en**. Los números salen de simular tu red de verdad, con la compra y sin ella. En el hangar los modelos van lado a lado con los mismos renglones |
| **Reloj frenado al decidir** (`main.js`) | Con un panel abierto (o la pregunta de la base, el parte de la mañana, el menú) el reloj espera: el reloj de la barra muestra el signo de pausa y «Reloj frenado» |
| **Tres velocidades** | Tranquila (la de una partida nueva: la mitad de la de antes), normal y rápida, con su nombre a la vista |
| **El libro de la empresa** (`libro.js`) | La historia día por día (de 6:00 a 6:00), por ruta y por avión; lo prometido en cada compra; el **parte de la mañana** a las 6:00; a los 3 días de cada compra, **el resultado contra lo prometido**. Vive en el guardado «extra», con tope de 60 días |
| **Tu empresa** | Nombre y color (pinta la librea de todos los aviones, el banderín de la barra y el borde de la caja). Se cambia desde el menú o desde la oficina |
| **Puente con la oficina** (`puente-oficina.js`) | `datosOficina()`, `accionOficina(a)` y `abrirOficina()`: el juego produce los datos del contrato y la escena de la oficina (`src/oficina/`, otro módulo) los dibuja |
| **Cámara del jugador** (`mundo.js`) | Arrastrar, rueda, gesto de trackpad, pellizco y doble toque dejan quieto el punto del suelo que está bajo el dedo; botones de acercar y alejar; de cerca se ve un avión a pantalla casi llena y de lejos entra toda la época. El juego no mueve la cámara si el jugador la puso donde quería |

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

## Etapa 1 · decidir sabiendo (16-11-2026)

Responde a la prueba del fundador del 15-11-2026: le gustó cómo se ve, pero todo pasaba tan rápido que no entendía, no veía el
costo ni el beneficio de cada decisión y terminaba apretando botones; y pidió que el zoom funcione mejor. El diseño está en
`oportunidades/proyectos/hub-nocturno/diseno-carrera.md` (esta carpeta trae la etapa 1 menos la escena de la oficina, que es otro
módulo).

### El estimador: de dónde salen los tres números

**Método elegido midiendo: simular, no una fórmula.** Se hace un gemelo exacto del estado (`structuredClone`, como ya hace el modelo
para la ronda nocturna: «lo que se promete y lo que pasa salen del mismo motor») y se corre el modelo de verdad 3 días de juego,
una vez sin la compra y otra con ella. «Deja por día» es la diferencia de lo cobrado menos lo gastado en volar y en tierra (los
premios de misión y de encargo no cuentan). El mismo par de corridas se repite con otros dos climas posibles: si con otro clima el
resultado cambia más de un 25% (y más de $ 300 por día), la tarjeta muestra **el rango** en vez de un número. Si pierde plata, lo
dice con **una línea de por qué**, que sale de lo que pasó en las corridas (qué tan llenos vuelan los aviones, si la ruta sola da
plata, si el correo tiene cola), no de una regla fija. Una ruta sola no deja nada: la cuenta va con el avión más barato que llega
y la tarjeta lo dice.

La cuenta rápida que ya tenía el modelo (`estimarAvion`, `decisiones`) quedó descartada para mostrar números: en los 26 casos en
que da un número, erra **157% en promedio** y más de 30% en 19. `pruebas/estimador.test.mjs` compara las dos contra lo que pasa
de verdad (la partida sigue 3 días con la compra y sin ella, medido por la caja) en 27 casos variados; algunos:

| Caso | Cuesta | Cuenta rápida del modelo | **Tarjeta** | Real (3 días, sin tocar nada más) |
|---|---|---|---|---|
| Primer avión, Buenos Aires – Montevideo | 10.000 | 12.286 | **12.914** | 12.914 |
| Segundo avión en la misma ruta (2 rutas, día 2) | 10.000 | 877 | **6.330** | 6.330 |
| Faros en Buenos Aires – Montevideo (día 2) | 2.100 | 5.960 | **7.441** | 7.441 |
| Ruta a Rosario con su avión (día 2) | 13.400 | 9.675 | **1.645** | 1.645 |
| Agrandar el correo de la base (día 2) | 8.000 | 0 | **−824** · «tus aviones ya salen llenos» | −824 |
| Día 3, 5 rutas: ruta nueva Rosario – Mendoza | 19.300 | 17.289 | **entre 715 y 1.255** | 1.255 |
| Día 5, 7 rutas y 19 aviones: quinto avión a Bahía Blanca | 10.000 | 2.102 | **entre −8.504 y −5.882** · «no hay más cartas para llevar» | −8.504 |
| Día 5: ruta nueva Córdoba – Mendoza | 14.300 | 13.019 | **entre −12.413 y −7.355** · «trae cartas a aviones que ya salen llenos» | −12.413 |
| Día 7, 7 rutas: faros en Buenos Aires – Mar del Plata | 7.700 | 5.315 | **14.695** | 14.695 |
| Día 7: agrandar el correo de la base | 250.000 | 0 | **−5.448** · «hoy tu correo da abasto» | −5.448 |

- **Error de la tarjeta contra lo real: 0% en los 27 casos.** No es mérito de una fórmula: es el mismo motor y la misma semilla,
  así que si después de comprar no se toca nada más, pasa exactamente lo que dijo la tarjeta. Lo que el número no puede saber es
  lo que el jugador hace después.
- **Con la partida siguiendo** (otro jugador automático que sigue comprando: 81 compras en 3 partidas de 7 días), la nota de
  «resultado contra lo prometido» dice «se cumplió» en el **60%** y el error mediano es **22%**; el resto lleva su porqué («en el
  medio sumaste otro avión a esa ruta», «hubo tormenta en…»). Es un jugador que compra mucho más seguido que una persona.
- **Hallazgo de juego (medido, no arreglado: es regla del modelo):** lo que más hace perder es sumar cartas en conexión a aviones
  que ya salen llenos: pagan menos por tramo y les sacan el lugar a las que pagan más. Por eso «Siguiente paso» ya no repite los
  consejos de compra del modelo sin comprobarlos: uno que no pide la historia se dice solo si la cuenta verdadera da que se paga
  en 8 días o menos.
- **Cuánto tarda:** una tarjeta, entre 40 y 150 ms en 1929 (6 corridas de 3 días). Se hace por tandas (`Tandas`, de a 8 ms entre
  cuadros; más largas si el equipo va lento) para no trabar la pantalla; las tarjetas de un mismo panel comparten las corridas
  «sin la compra». En capítulos avanzados una corrida tarda más (0,3 s con 60 aviones; 0,85 s con 230): ahí se usa un solo clima
  y la tarjeta dice «Haciendo la cuenta…» unos segundos. Un Web Worker lo bajaría a la mitad: queda anotado, no hizo falta en 1929.

### Reloj, velocidades y carteles

- **Reloj frenado:** con un panel abierto, la pregunta de la base, una ventana o la oficina, el modelo no avanza. Comprar cierra
  el panel y el reloj sigue (se ve al avión salir). «Seguirlo con la cámara» también cierra el panel.
- **Velocidades:** tranquila (5 minutos de juego por segundo: un día dura 288 s), normal (10) y rápida (30). Teclas 1, 2 y 3;
  espacio, pausa. En el celular, un botón pasa por las tres y avisa cuál quedó.
- **Una sola fila de carteles:** el festejo de una misión, las frases de la guía, la pregunta de la base, las tarjetas de aviso,
  los avisos cortos, el parte y el resultado esperan su turno. Con un panel abierto, lo que no es urgente espera a que se cierre.
- **Cifras de cobro:** una por ciudad cada 2,6 s; las que caen en el medio se suman en la siguiente.
- **Sin «Acelerá el tiempo»:** cuando no hay nada que decidir, «Siguiente paso» invita a seguir a un avión con la cámara (cada toque,
  a otro) o a pasar por la oficina si llegó un resultado. De noche, sin faros: «Tus aviones duermen. A las 6 sale el sol».

**Ritmo medido** (10 minutos de reloj, jugador automático que toca cada 3 s siguiendo la guía y «Siguiente paso», 1280×720, sin
placa de video; mismo instrumento que el diagnóstico del 15-11):

| | Antes (velocidad de entonces) | Ahora (velocidad de partida nueva) |
|---|---|---|
| Un día de juego | 145 s | 311 s |
| Vuelo Buenos Aires – Montevideo | 7,0 s | 14,9 s |
| Decisiones en 10 minutos | 42 (8 en el primero) | 26 (8 en el primero) |
| Carteles con texto | 52 | 30 |
| Cifras de cobro | 138 | 31 |
| Tiempo con algún cartel a la vista | 36% | 25% |
| **Segundos con dos o más carteles a la vez** | **87** | **0** |
| Segundos con el consejo «Acelerá el tiempo» | 281 (47%) | 0 |
| Segundos con el reloj frenado por decidir | 0 | 50 (44 con un panel, 3 con el parte) |
| Capítulo 1 (las 7 misiones) | 8,2 min | 16,7 min (corrida de 30 minutos: 0 s con dos carteles a la vez en los 30) |

El primer minuto sigue teniendo 8 decisiones porque el jugador automático toca cada 3 segundos todo lo que la guía le marca; una
persona tarda lo que tarde en leer, con el reloj frenado. De esos 10 minutos, el jugador automático siguió a un avión con la
cámara en lugar de esperar: el consejo de relleno ya no pide apurar el reloj.

### El libro, el parte de la mañana y el resultado

- **Día de la empresa = de 6:00 a 6:00** (la noche es parte del día de trabajo). A las 6:00 se cierra y sale el **parte de la
  mañana**: entró, salió, quedó; mejor y peor ruta; un consejo. Una pantalla, un botón («A trabajar»), reloj frenado, partida
  guardada. No sale antes del primer vuelo ni durante el primer minuto guiado. El consejo sale de los datos del día; los que
  proponen una compra (faros donde durmieron aviones, otro avión donde salen llenos, agrandar el correo si hay cartas tarde) se
  comprueban antes con el estimador y llevan su número («Otro avión ahí deja $ 12.462 más por día»).
- **Resultado contra lo prometido:** a los 3 días de comprar un avión, poner faros o agrandar el correo. «Lo que pasó» = lo
  prometido más lo que la ruta (o la empresa, si fue el correo) hizo de más o de menos que lo que el gemelo esperaba de ella,
  descontando lo que las compras posteriores le iban a cambiar a esa ruta según sus propias cuentas. Dentro de un 30% (o $ 300
  por día) dice «Se cumplió»; si no, dice qué cambió en el medio. Mientras la oficina no esté integrada va como un cartel de la
  fila; con la oficina, queda en su bandeja y el juego solo avisa.
- **Guardado:** `hubnocturno.v2.extra` = `{ v: 2, guia, vistos, vel, empresa: { nombre, color }, libro }`. Una partida de antes (sin
  libro) o un libro dañado no rompen nada: se empieza un libro de hoy. Un libro de 64 días pesa menos de 40 KB.

### La oficina: contrato de datos y puente

```js
import { datosOficina, accionOficina, abrirOficina, conectarOficina, hayOficina } from './puente-oficina.js';   // o window.HubNocturno

datosOficina()   // → { empresa, hoy, dias, rutas, flota, bandeja, cuaderno, carrera }  (null si el juego no arrancó)
accionOficina(a) // → { ok, … }   a = { tipo: 'nombre', nombre, color } | { tipo: 'ir', a: 'ruta' | 'avion', id } |
                 //                    { tipo: 'bandeja', id, accion } | { tipo: 'leido', id } | { tipo: 'salir' }
abrirOficina()   // → true si había escena y se abrió (frena el reloj y guarda); false si todavía no hay escena
conectarOficina({ abrir({ datos, accion }), cerrar() })   // la escena se anota; desde ahí aparecen los botones «Ir a la oficina»
```

- El objeto es el del contrato (`diseno-carrera.md` §5) con estos agregados, todos opcionales: `empresa.estrenada` (el jugador
  ya eligió nombre y color: pasa a `true` con la acción `nombre` o al guardar en el menú); `hoy` trae además lo que va del día
  (`entro`, `salio`, `cartas`, `vuelos`, `aTiempo`, `tarde`, `compras`, `premios`) y cada día cerrado trae `compras`, `premios` y
  `caja`. `dias` son los días **cerrados** (el que corre está en `hoy`). `rutas[].prometido.dejaDia` es lo que se esperaba que
  dejara **la ruta** por día desde la última compra hecha en ella (se compara con `rutas[].dejaDia`). En `bandeja`: los encargos
  ofrecidos traen la acción `aceptar`; los resultados, `ver` (lleva a la ruta y sale de la oficina); los últimos 3 partes van como
  `nota`. `cuaderno` y `carrera` son de la etapa 2 (hoy `[]` y `null`).
- `src/oficina-datos-ejemplo.json` es ese objeto sacado de una partida de verdad de 6 días y pico (`npm run ejemplo-oficina`).
- **Para integrar la escena** falta una línea en `main.js`: `import './oficina/conectar.js';` (ese archivo, del módulo de la
  oficina, la crea con `datosOficina` y `accionOficina` y la anota con `conectarOficina`). No está puesta: la decide quien integre
  los dos módulos. Sin escena anotada el juego anda igual y no muestra ningún botón de oficina. Probado el 16-11-2026 en una
  copia armada aparte (juego + `conectar.js`, sin tocar `main.js` ni `dist/`): el parte muestra «Ir a la oficina», la escena abre
  con el reloj frenado, aparece el botón de la oficina en la barra y al salir el juego sigue, sin errores de JavaScript.

### Cámara y zoom: los seis defectos, antes y después

Medido con el mismo guion del diagnóstico (`rueda`, `ctrl + rueda`, pellizco táctil en 390×844, doble clic, límites, iframe).

| Defecto | Antes (15-11) | Ahora (16-11) |
|---|---|---|
| (a) Gesto de trackpad (rueda con ctrl) | Cambiaba el zoom de la lente sin tope: de 0,01 a 33,8; «Ver mi red» lo dejaba en 0,01 | La lente no se toca (siempre 1): acerca la cámara, con tope en 0,9 y en el máximo de la época; «Ver mi red» deja distancia 8,4, sin giro |
| (b) La cámara pisa el zoom del jugador | Tras acercarse con la rueda (3,07), una misión cumplida la llevaba sola a 23,47; tocar una ciudad reencuadraba (de 30 a 4,6) | Tras acercarse (2,34), la misión se cumple y la cámara sigue en 2,34; tocar una ciudad no cambia la distancia (30,98 → 30,98) y la deja a la vista al lado del panel. Si el jugador no tocó la cámara, el juego sí muestra la red nueva |
| (c) Acercar casi no agranda | Tope de cerca 2,4: avión de 126 px, ciudad de 411 px | Tope de cerca 0,9: avión de **275 px**, ciudad de **1.166 px** (más grande que la pantalla). De lejos siguen legibles: avión de 30 px y ciudad de 98 px con toda la época en pantalla |
| (d) No entra toda la red | Tope de alejar 64; hacían falta 55, 68 y 122 según el capítulo | Tope por época: 58, 72 y 130 (escritorio); en celular vertical, 53 en 1929. Entran las 13, 27 y 37 ciudades |
| (e) Sin controles a la vista | Ni botones ni teclas; doble clic no hacía nada; «Ver mi red» no estaba en el celular | Botones − y + y «Ver mi red» siempre a la vista (también en el celular); doble clic y doble toque acercan al doble; teclas + y − |
| (f) La rueda mueve la página (iframe) | Sobre la tarjeta de la misión, la página se corría 300 px | 0 px sobre la misión, la barra y el mapa; sobre un panel largo se corre el panel (173 px) y la página no |
| Precisión de la rueda | El suelo bajo el cursor se corría 3,16 unidades por muesca | 0,000 (y al ir y volver queda en el mismo lugar) |
| Arrastre | Error de 0,064 (mouse) y 0,112 (un dedo) | 0,000 y 0,000 |
| Pellizco | Abrir 200 px acercaba ×0,65; el suelo entre los dedos se corría 0,033 | Sigue a los dedos (abrir de 100 a 300 px acerca ×0,33); corrimiento 0,000 |

Cómo: camera-controls queda para las transiciones, los límites y el giro; los gestos se atienden en `mundo.gestos()` con una
cuenta exacta (el punto del suelo bajo el dedo se despeja de la distancia y de la orientación de la cámara). De cerca la cámara
mira a la altura de lo que hay (el suelo, o el avión que se sigue) y nunca se hunde en el relieve.

## Cómo se corre y se construye

```bash
cd apps/juegos/aviacion/v2
npm install                      # una vez (three, postprocessing, camera-controls, animejs, tone, fuentes, esbuild)
npm run construir                # deja dist/ (index.html + archivos relativos; sin CDN, sin servidor propio)
npm run servir                   # http://localhost:8812  (cualquier servidor de archivos sirve)
node --test pruebas/*.test.mjs   # textos, rótulos, estimador (la tabla de arriba) y libro; sin navegador, unos 15 s
node herramientas/jugador.cjs 10 # jugador automático: 10 minutos siguiendo «Siguiente paso»; falla si hay un error de JavaScript
node herramientas/medir.cjs      # cuadros por segundo por nivel de calidad
node herramientas/capturas.cjs   # rehace las 8 capturas de capturas/
node herramientas/capturas-etapa1.cjs   # rehace las de capturas/etapa1/ (tarjetas, parte, resultado, zoom); unos 25 minutos sin placa de video
npm run ejemplo-oficina          # rehace src/oficina-datos-ejemplo.json (una partida jugada sola, sin navegador)
```

`dist/` está versionado para poder jugar sin construir: alcanza con servir esa carpeta (con doble clic sobre `index.html` no anda:
los navegadores no cargan módulos desde un archivo suelto). Parámetros útiles de la dirección:
`?lang=es|en`, `?calidad=alto|medio|bajo`, `?nuevo=1` (ignora el guardado), `?saltar=guia` (sin entrada ni guía),
`?semilla=7` (partida repetible, para medir).

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

## Lo medido (15-11-2026; peso y pruebas, al 16-11-2026)

**Peso de la descarga inicial:** 3,5 MB sin comprimir en total (objetivo: menos de 8 MB). La etapa 1 sumó 54 KB a `juego.js`
(el estimador, el libro y la cámara) y ninguna librería.

| Archivo | Peso |
|---|---|
| `activos/alturas.webp` (relieve y ríos, sin pérdida) | 1.663 KB |
| `juego.js` (motor, juego y sonido; 472 KB con gzip) | 1.545 KB |
| `activos/suelo.webp` (color del suelo y fronteras) | 145 KB |
| `activos/costa.webp` (distancia a la orilla) | 89 KB |
| dos tipografías | 74 KB |
| `juego.css`, `index.html`, `mundo.json` | 37 KB |

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

**Pruebas (16-11-2026).**
- Modelo (`cd .. && node --test pruebas/*.test.mjs`): 94 de 99, **las mismas 5 que fallaban antes de empezar** (n.º 2 sequía de
  novedades, 16 sugerencia en 3 estados fijos, 47 tiempo de CPU, 97 y 98 de la ronda; comparado renglón por renglón). El modelo no
  se tocó: ningún archivo de `../js` cambió (el estimador y el libro viven en `src/` y lo usan desde afuera).
- Capa v2 (`node --test pruebas/*.test.mjs`): 40 de 40 (24 de esta capa y 16 del módulo de la oficina). Las 24: 11 de textos (4 nuevas: la tarjeta, las velocidades, todo porqué y
  consejo en los dos idiomas, y que nada pida apurar el reloj), 5 de rótulos y 8 del estimador y el libro (la tabla de arriba, los
  porqués, las tandas, la nota de resultado con la partida siguiendo, el día de 6 a 6, el tope de 60 días, el contrato de la
  oficina y los guardados viejos o rotos).
- Jugador automático (`herramientas/jugador.cjs 10`): **sin errores de JavaScript**. A la velocidad de una partida nueva, en 10
  minutos cumple 5 misiones (5 rutas, 6 aviones) y cierra 2 partes de la mañana; el capítulo 1 entero lleva 16,7 minutos (medido
  aparte, en tiempo real). Con el reloj frenado decide y cierra el panel antes de seguir; no compra lo que la tarjeta marca en
  rojo salvo que «Siguiente paso» lo pida. (Arreglo de paso: un panel cerrado ya no deja botones viejos escondidos, que el jugador
  automático seguía tocando.)
- Con navegador (guiones en la carpeta de trabajo de la sesión, no versionados): ritmo de 10 y de 30 minutos, los seis defectos de
  zoom, el primer minuto guiado paso a paso en escritorio y en celular, una partida guardada con el formato del 15-11 y un «extra»
  roto (cargan y siguen), y el puente con una oficina de mentira (botones, reloj frenado, las cinco acciones del contrato).

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

Etapa 1 (`capturas/etapa1/`, de una partida jugada de verdad con semilla 7; `e-` escritorio 1280×720, `c-` celular 390×844):

| Archivo | Qué muestra |
|---|---|
| `e-01-tarjeta-ruta.jpg`, `c-01-…` | Abrir una ruta: cuesta, deja por día, se paga en; la cuenta va con el avión más barato y lo dice. El reloj, frenado |
| `e-02-hangar-comparar.jpg`, `c-02-…` | Comprar avión: Golondrina y Tero lado a lado con los mismos renglones; el que se paga antes lleva la marca |
| `e-03-faros-reloj-frenado.jpg` | Poner faros en una ruta, con su tarjeta, y el reloj frenado en la barra |
| `e-04-correo.jpg` | Agrandar el correo de la base: pierde plata y dice por qué |
| `e-06-parte.jpg`, `c-06-…` | El parte de la mañana: entró, salió, quedó; mejor y peor ruta; el consejo con su número |
| `e-07-resultado.jpg` | Resultado contra lo prometido, a los 3 días de una compra |
| `e-08-zoom-cerca-avion.jpg`, `c-08-…` | El zoom de cerca: un avión en vuelo |
| `e-09-zoom-cerca-base.jpg` | El zoom de cerca: la base |
| `e-10-zoom-lejos.jpg` | El zoom de lejos: toda la época en pantalla |
| `e-12-color-empresa.jpg` | Otro nombre y otro color de empresa: el banderín, la caja y la librea del avión |

## Lo que falta

De la etapa 1:

- **Integrar la escena de la oficina** (`src/oficina/`, otro módulo): una línea en `main.js`, `import './oficina/conectar.js';`.
  Hasta entonces no hay botón de oficina y el resultado de cada compra va como cartel.
- **Prueba a ciegas de la etapa 1:** que alguien sin contexto diga, antes de confirmar, qué cuesta y qué deja una ruta.
- **Probar el zoom con las manos** (mouse, trackpad y dedos de verdad): acá se midió con gestos sintéticos.
- **Las cuentas en capítulos avanzados** tardan segundos (0,85 s por corrida con 230 aviones): pasarlas a un Web Worker. Y los
  porqués y los consejos del parte hablan de cartas: en 1946 y 1970 hay que decir pasajeros y carga.
- **La primera cifra del primer avión** incluye las 24 cartas que ya esperaban (deja $ 13.500 por día los primeros 3 días; después,
  menos): es verdad, pero conviene que la nota de resultado lo cuente.
- El nombre de fábrica de la empresa («Correo Aéreo Lucero») no apareció como aerolínea ni como correo en una búsqueda del
  16-11-2026; antes de publicar hay que repetirla (INPI).

De antes:

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
