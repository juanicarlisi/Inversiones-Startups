# Capítulo 77 — Prueba 52: la barra nueva, la eliminatoria y los juegos con otros

**Fecha:** 10-11-2026. **Origen:** el fundador probó el APK 51 (lo marcó hecho en la Consola el 09-11) y mandó tres capturas y una
lista larga. Cerró con: «AVANZÁ CON TODO ESTO SUPER TRANQUILO. NO TE APURES. NO HAY APURO NI LÍMITE DE TIEMPO».

## 1. Lo que pidió (textual, resumido por tema)

**General**
1. «el by nueva generación está muy feo en el inicio de la app».
2. «lo de pasar la hoja de la biblia no se arregla; dejemos solo el del scroll».
3. «no veo en pendiente en consola lo de mandar solicitud por rvr1960. ¿dónde está?» y «cuando me des lo del correo a sociedades
   bíblicas lo mando».
4. Barra de abajo en este orden: Inicio, Travesía, Jugar, Biblia, Comunidad; «el jugar debería aparecer en el centro como con un
   círculo… resaltado, con una EXCELENTE ux».
5. Desafío del día (captura: «con todo tu ___» → «poder»): «es muy nada que ver rvr1960. ¿no podés fijarte qué versión se parece
   más y poner la que más se parezca en cada desafío del día? lo mismo sería para las travesías, trivias, etc. y explicame cómo
   funciona el desafío del día, ¿se puede generar solo?».

**Inicio**
6. Sacar «escuchar el versículo» y lo de leer la Biblia; «dejá solo lo de seguí tu senda ahí».
7. «Torneo» fijo en Inicio (hoy aparece solo en la pestaña comunitaria del calendario).
8. Torneos: «hasta cuándo» → «cuándo vence» o algo que se entienda mejor; al compartir, con enlace o con el código directo.
9. Torneo de trivia: o «tipo kahoot» (todos las mismas preguntas, gana uno) o **eliminatoria** entre todos. Quien lo crea puede poner
   un tope de fecha para la inscripción (por si comparte por enlace). Eliminatoria: desde la fecha de arranque, cada día es una fase
   (octavos viernes 13, cuartos sábado 14…); quien no juega ese día pierde; si no juegan los dos, pasa uno al azar; la final puede
   tener un día propio; la cantidad de fases sale de la cantidad de participantes. «Si la querés desafiar y encontrás algo mejor,
   adelante».
10. A quien le llega el enlace: un botón para sumarse y OK; después, la opción de jugar (en los dos formatos).

**Espadeo / trivia** (lo tituló «Travesía»)
11. Capturas 1 y 2: preguntas rebuscadas («Moisés explica por qué vendrían las maldiciones… ¿De qué manera no lo sirvió?»; «Samuel
    dijo al pueblo que pecaría contra Jehová si dejaba de hacer algo por ellos. ¿Qué era?»): revisar si hay más y mejorarlas.
12. «a veces cuando juego y termino mi turno, se traba ahí y no me deja volver, tipo no hay botón, para volver a la pantalla de juegos».
13. Al ganar una pieza de la armadura, movimientos raros de Lany (rodillas para adentro, el codo se articula para adentro).

**¿Quién es?**
14. El título contra Lany: «elige», no «eligió».
15. La pregunta para elegir la cantidad de tarjetas: «¿Cuántos personajes?» o algo que se entienda.
16. Contra Lany, un límite de preguntas («sino es imposible perder»).
17. Una sola lista de preguntas (fuera «Lany sugiere» y el otro título).
18. Muchísimas más preguntas: que lo que la persona escriba seguro esté; sobre cada personaje, todas las preguntas posibles, todas
    correctas; lo escrito tiene que coincidir bien con la de la lista («es mejor que se escriba»).

**Antes o después**
19. La tarjeta se arrastra hasta su lugar (no tocar la línea ni el «+»). «La mejor UX del mundo posible».
20. En Niveles, un dibujo por nivel «tipo Bible Project, o algo similar a lo de las travesías».
21. Contra otro: elijo un amigo y gana el que más acierta; arranca muy fácil y se complica.
22. Modos: por niveles, «juego libre» (al azar, stock MUY amplio para que no se repita) y «juega y pasa» (cada uno pone su nombre y
    se pasan el teléfono, instrucciones clarísimas).

**Nombres por letra**
23. El «+» más abajo y sin carga automática: se verifica al tocar «+».
24. Contra Lany dio dos veces la misma letra; en el de 45 segundos, los dos equipos tuvieron la misma letra.
25. Competencia: poner el nombre de cada equipo; al jugar, «le toca a» chico y «ANA» bien grande.
26. «Súper innovador pero clave»: que la persona lo diga en voz alta y la app lo entienda y lo agregue sola (en los dos modos).

**Respuestas a las cuatro preguntas del capítulo 76 §10**
- La autorización de Nueva Generación «ya está ok».
- «lo de iphone sale junto con android».
- «los planes son de 1.99 usd y de 3.99 usd».
- El correo a Sociedades Bíblicas: lo manda cuando se lo pase.

## 2. Lo que se hizo

### 2.1 La barra de abajo y la ficha de Jugar (pedido 4)

- HECHO (commit 799c85f de la app): el orden es Inicio, Travesía, Jugar, Biblia, Comunidad.
- La primera versión del botón central (círculo coral con un brillo, sobre una loma) el fundador la vio en la vista previa y la
  rechazó el mismo 10-11: «está ESPANTOSO… si hace falta que hagas un benchmark con otras aplicaciones, un estudio sobre teorías
  de la UX, lo que sea, pero NO PUEDE ESTAR TAN FEO».
- Segunda vuelta, con método: qué estaba mal mirado a 3× (brillo «de plástico», coral que no es el color de la acción en Senda,
  espadas finas, globo ilegible, cruce con el contenido); teoría (zona del pulgar, efecto de aislamiento, patrón del botón centrado
  sobre la barra, coherencia con los botones propios); benchmark de apps de primera línea; cuatro variantes en una maqueta con la
  barra real (ficha coral, **ficha ámbar**, medallón, dentro de la barra) en los dos temas. Ganó **la ficha ámbar con canto**: el
  mismo lenguaje de «Seguir tu senda». Regla nueva R29 en `docs/MARCO_UX.md` §2.13 de la app.

### 2.2 Inicio (pedidos 6 y 7) y la entrada (pedido 1)

- «Tu día» queda con una sola acción, «Seguir tu senda». Leer y escuchar siguen sumando Talentos al hacerlos, pero no son filas.
- Torneos, fijo en los atajos de Inicio (cuatro atajos, de a dos); salió del pie del calendario comunitario (una cosa, un lugar).
- La firma del ministerio bajó al pie de la entrada (la palabra «by» chica y el nombre en letras espaciadas entre dos líneas de luz).

### 2.3 Trabajos en paralelo (cada uno en su rama, se integran al terminar)

| Rama | Qué | Pedidos |
|---|---|---|
| `p52-lector` | sacar por completo el modo de pasar hojas de la Biblia | 2 |
| `p52-quien` | ¿Quién es?: título, «¿Cuántos personajes?», tope de preguntas, una lista, banco muy amplio y emparejador probado | 14 a 18 |
| `p52-antes` | Antes o después: arrastrar, dibujos por nivel, modos, contra un amigo, stock de 250+ hechos | 19 a 22 |
| `p52-trivia` | preguntas rebuscadas: detector, reescritura una por una, traducciones, control permanente | 11 |

### 2.4 El turno que queda trabado (pedido 12): causa raíz

HECHO (código de la app, 10-11): al terminar el turno en un duelo, la pantalla final no muestra ningún botón mientras el turno
«se está enviando», y el botón «Salir» de arriba se esconde en esa fase. El pedido a la base no tiene tope de tiempo (React Native
deja la conexión abierta sin límite): con poca señal queda «…» para siempre. Arreglo: tope de tiempo en todos los pedidos a la
base (el turno queda guardado y se manda solo cuando vuelve la señal) y una salida siempre a la vista en la pantalla final.

La barra vertical violeta que tapa la pregunta en la captura 1 no es de Senda: es el control de volumen de Samsung, que aparece al
sacar la captura (encendido + bajar volumen).

### 2.5 Lany: rodillas y codos en el festejo de cada pieza (pedido 13)

Revisado cuadro a cuadro con la herramienta oficial de Rive. Dos causas, las dos en el esqueleto y no en cada animación:

- **«Las rodillas para adentro».** Las rodillas doblan hacia afuera; lo que se veía mal eran los pies: la zapatilla giraba con la
  canilla y al agacharse las dos puntas se cruzaban. Arreglo: un nodo «tobillo» sin espejo con una restricción de giro hacia el
  control del pie, que las actuaciones prenden junto con la IK del pie. Visto en `ponBotas`: los pies quedan apoyados y derechos.
- **«El codo se articula para adentro».** La IK de Rive dobla siempre hacia el mismo lado de la línea hombro-mano: con la mano
  colgando es «codo afuera», pero con la mano al costado a la altura del pecho el codo quedaba arriba como un ala, y con la mano
  arriba quedaba del lado de la cabeza. Arreglo: `codos_automaticos()` (scripts/rive/actuaciones.py) elige cuadro a cuadro el
  sentido que deja el codo más abajo y más afuera, con histéresis, y pone el cambio donde el brazo está más estirado (el salto no se
  ve). Afecta ponEspada, ponEscudo, ponCasco, heroica y ponBotas. Visto: al agarrar la espada el codo cae; al subir el casco va afuera.
- Herramienta nueva: `node scripts/rive/cuadros_cli.cjs <disparo> <segundos> [cuadros] [salida]` dibuja la hoja de cuadros desde la
  fuente con la CLI oficial (en este entorno la CLI solo dibuja bien la primera captura de cada corrida: una corrida por cuadro).
- **Bloqueo (fundador):** la CLI de Rive 1.9 reemplazó `--once` por `--publish`, que pide `rive login` con una cuenta de Rive gratis
  (código en el navegador). Sin eso se verifica y se dibuja, pero no se escribe `assets/lani/lani.riv`: **el APK 52 lleva el .riv
  anterior** y el arreglo de pies y codos entra en el primer APK después de la sesión iniciada. `lani.py` avisa y no falla.

### 2.6 Biblia solo con scroll (pedido 2)

HECHO (rama p52-lector, unida): sale el modo de pasar hojas entero (cuatro archivos y unas 1.750 líneas); quien lo tenía elegido abre
deslizando con su papel y su letra. Al escuchar un capítulo, el texto sube solo siguiendo a la voz (sin las hojas, el versículo
iluminado se iba de la pantalla; falta verlo en un teléfono). El interruptor de Ajustes pasa a «Sonido al pasar las páginas del álbum».

### 2.7 Desafío del día y la RVR1960 (pedido 5)

- **Cómo funciona (respuesta al fundador):** se genera solo. Cada día la app toma una pregunta del banco de la trivia según la fecha;
  no hace falta cargar nada. Desde esta prueba elige solo entre las de dificultad media y recorre el banco con un paso primo (no se
  repite hasta agotarlo).
- **«Con todo tu ___» → «poder»:** la RVR1960 dice «alma» ahí. La trivia (2.351 marcadas, 1.324 reescritas, 32 retiradas: §2.9) y los
  557 huecos de la Travesía se revisaron contra la RVR1960: 524 bien, 2 con otro hueco del mismo versículo, 4 reemplazados y 27
  recortados. El registro por versículo de las palabras que la 1960 cambia pasó a un archivo de datos
  (`contenido/rv1909_cambia_en.json`, 114 versículos, 147 palabras) y el validador lo aplica como **error** donde cae el hueco, en la
  trivia y en lo que queda a la vista. Ninguna palabra de la RVR1960 entra a la app: se marca lo que la 1909 dice distinto.
- **«Qué versión se parece más»:** la regla ya vigente (capítulo 51) sigue: fuera del lector cada pasaje se abre en la versión libre
  con menos palabras difíciles. Lo que pedía el fundador se resuelve mejor al revés: el ejercicio pide solo palabras que se leen igual
  en la RV1909 y en la RVR1960, así que da igual con cuál estudie la persona.

### 2.8 Nombres por letra (pedidos 23 a 26)

- **Voz:** el teléfono escucha los nombres dichos en voz alta y los suma solo (en grupo, durante toda la ronda; en el escrito, con el
  botón del micrófono). Herramienta: `expo-speech-recognition` 57.1 (MIT; usa el reconocedor del teléfono). La parte que decide si es
  un nombre de la Biblia es propia (`src/util/escucha.ts`): clave fonética y una letra de tolerancia solo en los nombres conocidos
  («igual» no es Igal). Sin permiso o sin reconocedor, sigue el «+1». Senda no graba ni guarda audio (privacidad 1.2, `docs/LEGAL.md`).
  El permiso de micrófono, que estaba bloqueado a propósito, se habilitó para esto.
- El «+» abajo del campo, ancho, y escribir ya no suma solo (suma el «+» o el «Enviar» del teclado).
- Letras: la partida siguiente contra Lany empieza por las que no salieron; el reloj y el botón no pueden pasar dos veces de letra.
  En «cada uno su tiempo», **cada equipo saca su propia letra** y gana la vuelta el que dijo más.
- Cada equipo con su nombre; «LE TOCA A» chico y el nombre grande; el marcador con los nombres.

### 2.9 Preguntas rebuscadas (pedido 11)

HECHO (rama p52-trivia, unida): un detector marcó 2.351 de 5.381; se leyeron y decidieron 1.356 (1.324 reescritas, 32 retiradas, 0
dejadas igual); **quedan 1.028 marcadas sin leer**, todas de señales blandas. Las traducciones de lo reescrito se rehicieron a mano
(1.284 en portugués y 1.284 en inglés). Regla 9 de `docs/REDACCION.md` de la app: una sola pregunta directa que se entiende a la
primera. El validador avisa las rebuscadas. Ejemplo del fundador: «Samuel dijo al pueblo que pecaría contra Jehová si dejaba de hacer
algo por ellos. ¿Qué era?» → «¿Qué dijo Samuel que seguiría haciendo por el pueblo, para no pecar contra Jehová?».

### 2.10 ¿Quién es? (pedidos 14 a 18)

HECHO (rama p52-quien, unida): **263 preguntas para los 71 personajes** (antes 43), cada «sí» con su cita (1.735) y un control
automático contra la RV1909; lo que se escribe lo entiende un emparejador probado con 603 frases; tope de preguntas contra Lany
(12 personajes → 6, 16 → 7, 20 → 8, elegido simulando 2.500 partidas); una sola lista que se ordena sola; «¿A quién elige Lany?»;
«¿Cuántos personajes?». Para revisar: algunas celdas por contexto (lista en el informe de la rama).

### 2.11 Torneos: eliminatoria y cierre de inscripción (pedidos 7 a 10)

- **Base** (`20261201000001_eliminatoria.sql`, 26 pasos nuevos de prueba, 287 de 287): formato «todos contra todos» o «eliminatoria».
  En la eliminatoria se suma gente hasta el día de arranque; ese día se arma el cuadro al azar con pases libres (de 2 a 64 personas →
  de 1 a 6 fases); **cada día es una fase**; cada cruce juega las mismas preguntas; se decide al jugar el segundo; al vencer el día,
  pasa el que jugó o, si ninguno, uno al azar; la final puede ir un día elegido; campeón y avisos.
- **Desafío a la idea del fundador (lo mejoré en dos cosas):** (1) el cruce se decide en el momento en que juega el segundo, y el
  siguiente rival se conoce apenas se deciden los dos cruces que lo alimentan, sin esperar la medianoche; (2) los pases libres se
  reparten al azar por el cuadro, no todos juntos.
- **App:** «¿Cómo se juega?», «¿Cuándo vence?» (antes «¿Hasta cuándo?»), «¿Hasta cuándo se puede sumar gente?» con enlace; en
  eliminatoria, el día de arranque y el de la final; la tarjeta con «SUMARME», «JUGAR CONTRA BETO», ganaste o quedaste afuera,
  campeón y **el cuadro** por fases; compartir con el enlace o copiar el código; al abrir un enlace, primero se ve qué torneo es y se
  confirma con «SUMARME».

### 2.12 Antes o después (pedidos 19 a 22)

HECHO (rama p52-antes, unida): **la carta se arrastra** hasta su lugar (se levanta sobre el dedo, el hueco más cercano se abre e
ilumina con una muesca háptica, la lista corre sola en los bordes; sin «+»: el tablero de toques queda solo para lector de pantalla
o «reducir movimiento»). **317 hechos** (antes 41) de la creación a Patmos, con el orden asegurado por tramos y ramas (Rut, Jonás,
Ester…: dos hechos se comparan solo si su orden es seguro); cada cita y cada «» controlados contra la RV1909. Cuatro formas:
**por niveles** (15 épocas con su dibujo propio, que se colorea al ganarla, y 3 repasos; Jesús no se dibuja), **juego libre** (no
repite hasta agotar el stock), **juega y pasa** (de 2 a 6 nombres, «Le toca a» con el nombre grande y «YA TENGO EL TELÉFONO») y
**contra un amigo** o un rival al azar (10 cartas iguales para los dos, de fácil a difícil; la base sortea y corrige). Migración
`20261201000002_antes_despues.sql`; base 326 de 326. Para mirar: algunos órdenes (Ester entre Ciro y Nehemías; Cornelio antes de
la muerte de Jacobo; la tentación antes de Caná) y que los hechos están solo en español. Falta probar el arrastre en un teléfono.

### 2.13 Decisiones y cuentas del fundador

- Planes USD 1,99 y 3,99 (DEC-2026-11-10-1); iPhone junto con Android con regla de corte el 05-12 (DEC-2026-11-10-2); autorización
  de Nueva Generación: ok; el correo a la SBU por la RVR1960, en la Consola con botón «Copiar».
- **Google Play (HECHO, captura del 10-11):** la cuenta «Senda App» (personal) está creada. Google verifica la identidad y pide tres
  pasos: estado de operador, acceso a un teléfono Android (app Play Console) y teléfono de contacto. Pendiente reescrito en la Consola.

## 3. Próximos

1. **Rive:** que el fundador inicie sesión en Rive (cuenta gratis) para publicar el `.riv` con los pies y codos nuevos.
2. Leer las 1.028 preguntas marcadas que quedan (`python3 scripts/autor/rebuscadas.py --lote 60`).
3. Probar la voz de «Nombres por letra» en el teléfono (Android 13 o más: escucha continua; Android 12 o menos: frase por frase).
4. Probar una eliminatoria de punta a punta con cuentas reales (la base viva la corre cada 5 minutos).
5. iPhone: cuenta de Apple antes del 20-11; «Ingresar con Apple» (obligatorio si hay ingreso con Google) y APNs.
