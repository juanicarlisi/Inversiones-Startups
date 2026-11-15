# La música que no se corta, tu Lany en la entrada, el álbum, la cuenta, amigos, duelos y la guía (la prueba 35)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 24-10-2026, a la noche, el fundador mandó la ilustración de Lany que generó con otra IA («me parece MUY
buena imagen, creo que es el camino»), avisó que **la música de la trivia se cortaba** (al girar la ruleta, al responder) y pidió que
nunca se apague si la persona no la apaga, que baje mientras se responde y que haya **más temas del estilo del predeterminado**,
siempre libres; y cerró con «avanzá con esto y todos los próximos». Se encontró la causa del corte (el motor de sonido apagaba la voz
más vieja al quedarse sin voces, y la más vieja era el fondo) y se arregló de raíz; la música baja al 45 % mientras se lee y responde
y vuelve en la ruleta; entraron seis temas más de Kevin MacLeod (§2). La ilustración ocupa el centro de la entrada y los medallones
pasaron al camino de luz (§3). **El álbum de personajes** salió como se aprobó: nueve páginas, 48 figuritas, sobres solo con Talentos
(el primero gratis), nunca repetidas, la figurita dorada con una pregunta y Jesús como página central (§4). Y «los próximos» de la
prueba 35 entraron a la app: **la cuenta anónima** con apodo y código (§5), **Amigos** (§6), **Duelos por turnos** jugados en el
Espadeo de siempre y corregidos por la base (§7), el **token de avisos push** (§8) y **la guía de bienvenida** de Lany en las cinco
pestañas (§9). Lo social se pudo probar con datos de ejemplo y no con la base viva: eso espera que el fundador active las cuentas
anónimas (§10). **APK 35**, con todo (§11).
</div>

## 1. Lo que dijo el fundador y dónde quedó

| Lo que dijo (resumen) | Dónde quedó |
|---|---|
| «Te comparto la imagen que me generó la IA… me parece MUY buena imagen, creo que es el camino» | §3: en la entrada |
| «Avisame si tengo que mandar algún otro prompt» | §3 y §12: sí, dos pedidos chicos (el generador, una versión grande y otra sin armadura) |
| «La música eventualmente se corta en la trivia… no debería cortarse; por ahí bajar un poco el volumen mientras respondo, pero si el usuario no la elimina, que no se apague» | §2 |
| «La que está seleccionada como predeterminada está muy buena; buscá más de ese estilo y agregalas, siempre que se puedan usar sin licencia ni nada» | §2: seis temas más de Kevin MacLeod (CC BY 4.0, con crédito) |
| «Avanzá con esto y todos los próximos» | §4 a §9: el álbum, la cuenta, Amigos, Duelos, push y la guía (capítulo 60 §11) |

## 2. La música que se cortaba: la causa y el arreglo

**La causa.** El motor de sonido de Senda tiene un tope de 36 voces a la vez. Cuando se llenaba (la ruleta suena un clic por casillero
y en un giro largo son muchos), apagaba la voz **más vieja** para hacer lugar; y la más vieja siempre era el tema de fondo, que
arrancó antes que todo. Por eso la música «se cortaba» justo al girar o al encadenar sonidos: no era el juego ni el volumen, era el
reciclado de voces.

**El arreglo, de raíz (`src/sonido.ts`):**

- la voz que se sacrifica ya **nunca es el fondo ni la música**: se busca la primera que no sea ninguno de los dos;
- mientras se lee y responde una pregunta, la música **baja al 45 %** con una rampa de 0,35 s y vuelve a su volumen en la ruleta y en
  los festejos (`atenuarFondo`); el interruptor y el volumen que elige la persona mandan siempre;
- si la persona no la apaga, no se apaga: ni el juego ni el motor la cortan.

**Seis temas más del estilo de «Funky Chunk».** Todos de Kevin MacLeod (incompetech.com), CC BY 4.0, con el crédito en «Licencias y
créditos», en `assets/sonidos/CREDITOS.md` y en `musica_macleod.json`: **Funkorama**, **Cut and Dry**, **Funk Game Loop**,
**Fretless**, **Rollin at 5** y **Hidden Agenda**. Bucles de 64 s a 96 kbps, hechos con el mismo script que los anteriores. El
Espadeo rota ahora **diez** temas y «Cambiar de tema» los recorre.

## 3. Tu Lany en la entrada

La imagen que mandó el fundador trae tres variantes de Lany con la armadura. Se recortó la del medio (mirada al frente, escudo con la
cruz, espada en alto), se le quitó el fondo y quedó como `assets/lani/entrada_armadura.png` (431 × 715). En la entrada ocupa el
centro de la puerta de luz; su alto es el 40 % de la pantalla (máximo 330 puntos) y el ancho sale de la proporción de la imagen.

Los seis medallones de la armadura estaban en arco sobre la cabeza y, con la ilustración más alta, **tapaban el título «SENDA»**.
Pasaron a **una fila apenas curvada sobre el camino de luz**, entre el piso de la puerta y la barra de carga: siguen apareciendo de a
uno con su destello y no tapan nada. La ilustración quedó anotada en `docs/LEGAL.md` (activo generado por el fundador con una IA de
imágenes; falta el nombre del generador, §12).

## 4. El álbum de personajes

Tal como se aprobó el 24-10 («va, desde el inicio»; capítulo 60 §6):

- **Nueve páginas**, en el orden de la historia: Los primeros (de Adán al diluvio), Los patriarcas, El Éxodo y la tierra, Jueces y Rut,
  Reyes y profetas de Israel, Profetas y exilio, **Jesús**, Los Evangelios, Hechos y las cartas. Se pasan de costado; los puntos de
  arriba muestran dónde estás (el de Jesús es dorado).
- **48 figuritas**: todos los personajes que ya tienen retrato en la app (de Adán a Felipe). Las que faltan se ven en silueta con «?».
- **Los sobres.** El primero de cada página es gratis; los demás cuestan **40 Talentos** (`reglas.precioSobre`). Los Talentos se ganan
  leyendo, en la Travesía y en los juegos y **nunca se venden** (por la Lei 15.211 de Brasil y por convicción). **Nunca sale una
  repetida**: el azar decide el orden, no si te toca algo nuevo; con la página completa, el botón desaparece.
- **La ficha al conseguirla.** Al abrir el sobre, el retrato aparece grande con chispas y «¡Nuevo en tu álbum!», y abajo la ficha
  completa del personaje: para los 24 que tienen ficha en la Travesía (quién es, qué quiere decir su nombre, su familia con cita, de
  dónde, cuándo, su historia, por qué importa), la misma ficha; para los demás, lo que la Biblia dice de ellos con su cita, tomado
  de «¿Quién es?». Cada cita se abre sin salir. «Leer su historia» abre el pasaje; «Su lección en la Travesía», su lección.
- **La figurita dorada.** Se gana sabiendo, no con suerte: «¿Cuál de estas cosas dice la Biblia de Adán?» con cuatro opciones; la
  correcta es un rasgo verificado del personaje y las otras tres son rasgos de personajes de **otras páginas** (ninguna puede ser
  cierta también de él). La correcta nunca se delata por el largo (misma regla que en «Vivir la historia»: se prefieren rasgos
  cortos y los distractores de largo parecido). Se acierte o no, la respuesta correcta se muestra con su cita para leerla.
- **Jesús no es una figurita.** La página central no tiene retrato: «Jesús no es una figurita. Todas estas historias apuntan a él», con
  Juan 5:39 de la Biblia de la app.
- **Dónde está:** en Jugar («Álbum de personajes», nuevo) y en Ajustes («Tu álbum de personajes»). Se guarda en el teléfono.

Algo que apareció al probarlo y quedó arreglado para toda la app: la **hoja inferior** (la que sube desde abajo) podía ser más alta
que la pantalla cuando el contenido era largo, y entonces lo de arriba quedaba afuera. Ahora **nunca pasa la pantalla**: lo que no
entra se desliza adentro, y tiene botón «Cerrar» además de tocar afuera.

## 5. La cuenta de Senda (anónima, sin pedir nada)

Como dice `docs/LANZAMIENTO.md` §3: la app arranca sin cuenta y sin red; la primera vez que la persona toca algo social (Amigos,
Duelos), `src/util/cuenta.ts` crea una **cuenta anónima** de Supabase con una llamada HTTP (sin SDK: igual que todo lo demás de la
nube), guarda los dos tokens en el teléfono y los renueva sola. Con la cuenta se crea el **perfil**: apodo (el nombre que eligió en
la bienvenida, editable), país del teléfono (dos letras, nunca la ubicación), nivel de los Pasos, y la base le asigna un **código de
amigo de seis letras** que no se confunden (sin O/0 ni I/1/L). A la base nunca va un correo ni un nombre real. En Ajustes aparece
«Tu cuenta de Senda» con el apodo y el código.

Si la nube no está (esta compilación sin claves, las cuentas todavía no activadas, sin señal), la app lo dice con palabras llanas y
**todo lo demás sigue funcionando**: «Esta versión de prueba no tiene conexión», «Las cuentas de Senda todavía no están activas. Muy
pronto», «Sin conexión». Cada código de error de la base tiene su texto en tres idiomas.

## 6. Amigos («tus contactos de Senda»)

La pantalla **Amigos** (desde la tarjeta «Amigos y duelos» arriba de Comunidad, desde Ajustes y desde Duelos): tu tarjeta con el apodo
(se toca para cambiarlo) y **tu código grande** para copiar o compartir por WhatsApp con un mensaje de invitación; «Agregar con un
código» (seis letras; la base avisa al otro); «Quieren ser tus amigos» con **Aceptar** o «No, gracias» (bloquea en silencio); «Tus
amigos» con el nivel y el país de cada uno, el botón **Duelo** al lado y quitar; y «Esperando que acepten».

## 7. Duelos por turnos, en el Espadeo de siempre

- **Empezar** (pantalla **Duelos**, desde el Espadeo, Amigos y Comunidad): **Desafiar a un amigo** (elegís de tu lista), **Rival al
  azar** (entrás a la partida que más espera o dejás la tuya esperando), **Crear un código para compartir** (seis letras, se comparte
  por WhatsApp) y **Entrar con un código**. Empezar un duelo usa una vida, como una partida; jugar el turno, no.
- **La lista:** «Te toca» primero, con las horas que quedan y la ronda; «En curso» (le toca al otro, esperando rival, esperando que
  entren con tu código); «Terminados» (ganaste, ganó X, empate, cancelado). En cada tarjeta, las piezas de los dos.
- **El turno** se juega en el Espadeo con la **misma ruleta**, con tus piezas y las del rival como están en la base y el apodo del rival
  en el marcador. Se juega hasta fallar (sin pregunta de oro: en el duelo todo fallo pasa el turno, igual que lo cuenta la base). Al
  fallar, o al completar la armadura, **el turno entero va a la base en un solo pedido** (`jugar_turno`, idempotente): la base corrige
  cada respuesta contra su tabla de claves, suma las piezas de las Pruebas acertadas, pasa el turno y fija las 72 horas. La pantalla
  final dice «Turno enviado. Ahora le toca a Sofi» o el resultado si terminó.
- **Sin señal**, el turno queda guardado en el teléfono y se manda al abrir la app o al entrar a Duelos; nunca se cuenta dos veces.
  Si la base lo rechaza (venció, ya no era tu turno), lo dice y la lista muestra qué pasó.
- **Las claves de las preguntas** viajan a la base con una migración generada: `scripts/autor/preguntas_clave.py` escribe
  `supabase/migrations/20261102000000_preguntas_clave.sql` con las **720** preguntas que entran a la app (id, respuesta correcta,
  categoría y nivel); se regenera al cambiar el banco y se aplica sola al subirse.

## 8. Avisos push

Del lado de la app ya está todo: al abrir, si hay cuenta, permiso de avisos y el proyecto de Expo del fundador (`extra.eas.projectId`
en `app.json`), el token de Expo se guarda en `push_tokens`; la base lo usa para «te toca», «te desafiaron», «aceptaron tu duelo»,
«quedan 6 horas» y «quieren ser tu amigo», y tocar el aviso abre Duelos o Amigos. **Sin el proyecto de Expo no hace nada** y los
duelos funcionan igual (la lista se actualiza al abrir): crear la cuenta de Expo y el proyecto de Firebase es del fundador
(`docs/DUELOS.md` §5; pendiente «juntos_cuentas»).

## 9. La guía de bienvenida («Lany te muestra»)

La primera vez en cada pestaña, Lany aparece abajo con **tres carteles cortos**, uno por toque: qué hay acá, qué tocar primero, qué se
gana («Siguiente», «Listo», «Saltar»; nada avanza solo, regla de la prueba 27). Quince carteles en tres idiomas. Se recuerda en el
teléfono y se vuelve a ver desde Ajustes («Volver a ver la guía de Lany»). Se dibuja **solo sobre las pestañas**: nunca encima del
lector, de una lección ni de un juego (mira la ruta que está a la vista), y no sale mientras está la entrada.

## 10. Lo que se probó y lo que no

- **Probado en la vista previa y con la prueba de arranque:** la entrada, la música (las diez pistas, la atenuación), el álbum entero
  (sobres, ficha, dorada, Jesús), la guía en las cinco pestañas, Amigos y Duelos con **datos de ejemplo en memoria** (`?demo=juntos`:
  un perfil, tres amigos, un pedido pendiente, cinco partidas; el turno se juega en el Espadeo y se «envía»), y la auditoría de
  textos de las pantallas (64 casos, letra normal y grande, 0 problemas).
- **No probado con la base viva:** crear la cuenta anónima real, pedir y aceptar amistades y jugar un duelo entre dos teléfonos. Hace
  falta que el fundador active «Anonymous sign-ins» en Supabase (pendiente «juntos_cuentas»); el código habla con las funciones que ya
  están aplicadas en la base desde la prueba 34 y la migración de las claves se aplica al subir. Cualquier diferencia que aparezca
  con gente de verdad se corrige en la prueba 36.

## 11. El APK 35

Como siempre, **trae absolutamente todo lo anterior**. Versión 0.35.0 (código 36); 95,6 MB (las seis pistas nuevas suman unos 4,9 MB; R8 sigue pendiente en un APK aparte). Publicado en https://github.com/juanicarlisi/senda-app/releases/tag/prueba-35. Chequeo de tipos, prueba de arranque (seis pruebas)
y auditoría de textos de las pantallas pasados antes de compilar. Lo que hay que mirar está en la Consola (pendiente «probar35»).

## 12. Pendientes y decisiones

- **Del fundador:** probar el APK 35; decir con qué IA generó a Lany (para `docs/LEGAL.md`) y, si puede, una versión de 2048 px o más
  con fondo transparente y otra **sin armadura** (para la bienvenida y los carteles); activar las cuentas anónimas en Supabase y crear
  el proyecto de Expo (`docs/LANZAMIENTO.md` §7); lo de antes (consulta SBA, INPI y abogado, Google Play antes del 15-11, sitio,
  Claude Max, voz).
- **Próxima prueba (36):** grupos (crear, unirse, roles, calendario), los eventos del fundador y del grupo en el calendario de todos,
  la encuesta del día con resultados en vivo, la tabla de la copa, torneos del grupo; lo que aparezca al probar lo social con la
  base viva.
- **Después:** 37 (Premium y Max, salas en vivo), 38 (trivia del sermón, guardar la cuenta, progreso en la nube); contenido: Josué y
  Jueces, Oseas, trivia en portugués, «El gran relato» en inglés; R8 en un APK aparte.
- **Decisiones:** DEC-2026-10-24-3 (la prueba 35).

{{PANTALLAS35}}
