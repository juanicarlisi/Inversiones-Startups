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

### 2.5 Lany: rodillas y codos en el festejo de cada pieza (en curso)

Revisado cuadro a cuadro. Dos causas, las dos en el esqueleto y no en cada animación:

- **«Las rodillas para adentro».** Las rodillas doblan hacia afuera; lo que se veía mal eran los pies: la zapatilla giraba con la
  canilla y, al agacharse, las dos puntas se cruzaban. Arreglado: un nodo «tobillo» sin espejo con una restricción de giro hacia el
  control del pie, que las actuaciones prenden junto con la IK del pie. Visto en `ponBotas`: los pies quedan apoyados y derechos.
  (Primer intento fallido: la restricción puesta directo en la zapatilla izquierda, que está espejada, la daba vuelta.)
- **«El codo se articula para adentro».** La IK de Rive dobla siempre hacia el mismo lado de la línea hombro-mano. Con la mano
  colgando eso es «codo hacia afuera»; con la mano a la altura del hombro o más arriba y hacia afuera, el codo queda arriba, como un
  ala (se ve al agarrar la espada, 1,2 a 1,8 s, y al bajarla, 2,8 s). `Act.codo(lado, [(t, "abajo" | "arriba")])` anima el sentido
  (`invertDirection`, que Rive deja animar). **Falta** usarlo: el cambio de sentido va en un cuadro donde el brazo está estirado
  (control más lejos que el largo del brazo: hombro en (±43, −86), brazo 85) para que no se vea el salto; hay que rehacer el
  recorrido de las manos en `pon_espada` (agarre con el codo abajo, barrido amplio con el brazo estirado al levantarla), `pon_casco`
  (manos a las sienes con los codos hacia afuera) y revisar escudo, coraza, cinturón y `heroica`
  (hojas ya dibujadas en el scratchpad, sin mirar).

Herramientas: `node scripts/rive/cuadros_cli.cjs <disparo> <segundos> [cuadros] [salida] [columnas] [desde]` dibuja la hoja de cuadros
desde la fuente RML con la CLI oficial (una corrida por cuadro: en este entorno la CLI solo dibuja bien la primera captura).

**Bloqueo de la herramienta:** la CLI de Rive 1.9 reemplazó `--once` por `--publish`, que pide `rive login` con una cuenta de Rive
(gratis). Sin eso se puede verificar y dibujar, pero no escribir `assets/lani/lani.riv`: el APK sigue con el .riv anterior hasta que
el fundador inicie sesión (un código en el navegador). `scripts/rive/lani.py` ya avisa y no falla.

### 2.6 Google Play (10-11)

**HECHO (captura del fundador, 10-11-2026):** la cuenta de desarrollador «Senda App» está creada, como cuenta personal. Google está
verificando la identidad y pide tres pasos más antes de dejar publicar: declarar el estado de operador, verificar el acceso a un
teléfono Android (app Play Console) y verificar el teléfono de contacto. El pendiente de la Consola quedó reescrito con esos pasos.

### 2.7 Dónde quedó la sesión (10-11, pausa pedida por el fundador para cambiar de modelo)

- Hecho y subido: barra de abajo con la ficha de Jugar, Inicio, entrada, turno trabado, desafío del día, precios, correo a la SBU en
  la Consola (§2.1 a §2.4) y el arreglo de los pies de Lany (§2.5).
- Trabajando en ramas aparte (`/home/user/senda-wt/<nombre>`, ramas `p52-<nombre>`): lector solo con scroll, «¿Quién es?»,
  «Antes o después», trivia rebuscada (con los 11 huecos que no coinciden con la RVR1960) y huecos de la Travesía. Al terminar se
  revisan y se unen a `main` (trivia antes que huecos; borrar `TRIVIA_EN_ARREGLO_P52`).
- Sin empezar: «Nombres por letra» (el «+», letras sin repetir, nombres de equipos, voz) y torneos (eliminatoria con llaves, cierre de
  inscripción, compartir por enlace o código, botón para sumarse; migración `20261201000001_*`).
- Cierre pendiente: capítulo, estado, línea de tiempo, mapa, inventario, CLAUDE.md, manual con capturas nuevas, Consola y APK 52.

[sigue]
