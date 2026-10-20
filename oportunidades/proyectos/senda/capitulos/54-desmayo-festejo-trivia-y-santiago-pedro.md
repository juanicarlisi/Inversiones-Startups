# El desmayo sin rigidez, el festejo en una pantalla, la trivia sin paréntesis y Santiago y 1 Pedro (la prueba 28)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 20-10-2026 el fundador probó el APK 27 y pidió tres cosas, despacio y bien: que Lany deje de desmayarse
«con los brazos extendidos» (la animación seguía rígida); que el festejo de la pieza ganada, que quedó muy bien, entre en una sola
pantalla con el botón abajo (había que deslizar para encontrar «Seguir»); y que la trivia deje de mostrar la palabra correcta con la
forma de la RV1909 entre paréntesis («amor (en la RV1909, «la caridad»)»), revisando si alguna versión libre trae la palabra de hoy
para no citar la 1909 «sí o sí». Además, recordó la regla de siempre: **cero plagio**, ni de versiones con derechos ni de los libros de
referencia (se usan para entender, nunca para replicar). Esta prueba hace las tres cosas y sigue con lo pendiente: el desmayo y el
patatús rehechos de cero como un vahído de dibujo animado (mano a la sien, mareo, rodillas que ceden, brazos que llegan tarde y
quedan flojos); el festejo que mide lo que tiene y acomoda a Lany en el alto que sobra, con el tablero en una fila; 28 preguntas de
trivia sin paréntesis, con el pasaje que se abre en la versión libre que trae la palabra de hoy; cuatro nombres más con la grafía
de hoy en la Biblia de Senda; Santiago y 1 Pedro jugables (12 lecciones; 319 en total); y Ajustes y la lección por dentro en
portugués e inglés (175 cadenas).
</div>

## 1. Lo que pidió el fundador y dónde quedó

| Pedido (resumen) | Dónde quedó |
|---|---|
| «Lany se sigue desmayando con los brazos extendidos y parece muy dura; es muy rígida la animación. Hacelo tranquilo, despacio, pero que quede bien» | §2 |
| «La bienvenida quedó OK» | Nada que hacer (prueba 27) |
| «Cuando se gana pieza, el festejo quedó muy bien, pero para avanzar tengo que deslizar hacia abajo y recién aparece el botón; que se vea todo en una sola pantalla y abajo el botón» | §3 |
| «En la trivia, la palabra correcta y entre paréntesis como está en la RV1909 es incómodo; revisemos si en alguna otra versión libre aparece bien la palabra» | §4 |
| «Andá despacio con cada punto y con todos los pendientes próximos» | §5 (Santiago y 1 Pedro), §6 (portugués e inglés) |
| «CERO PLAGIO, ni de versiones no disponibles ni de los libros que te compartí» | §7 |

## 2. El desmayo, rehecho de cero

**Qué pasaba.** El desmayo de la prueba 25 tenía anticipación, tambaleo, caída con gravedad e impacto con rebote, pero el *cuerpo*
seguía rígido: los dos brazos se abrían simétricos en V (116° y −106° desde el hombro), con las manos abiertas, y así quedaban en el
piso. Cuadro a cuadro se veía una estrella de mar, no una oveja desmayada. El patatús usaba la misma caída.

**Qué se hizo** (`scripts/rive/lani.py`, prueba 28). Un desmayo de dibujo animado se construye con el cuerpo que se *afloja*, no que
cae como una tabla. La caída se escribió una sola vez (`caida()`, 0 a 1,9 s) y la comparten tres animaciones: el desmayo, la
«desmayada» (que guarda la pose final y respira) y el patatús (que después se levanta). Los siete tiempos:

1. **Sobresalto** (0–0,12 s): se yergue, la cabeza sube; el brazo derecho retrocede apenas (anticipación).
2. **La mano a la sien** (0,12–0,36 s): el brazo sube por el costado con el codo afuera y el dorso de la mano se apoya al lado del
   ojo (el gesto clásico del vahído); la cabeza se recuesta sobre esa mano. Lany no llega más arriba: con la cabeza grande y los
   brazos cortos, la mano alcanza la altura del ojo, no la frente, y el gesto se lee igual.
3. **Mareo** (0,36–0,82 s): el cuerpo se bambolea cada vez más; la cabeza, el jopo y las orejas llegan tarde; el brazo izquierdo
   cuelga suelto y oscila por inercia, al revés del cuerpo (cuando el cuerpo va a un lado, el brazo se queda y después lo sigue);
   las rodillas tiemblan.
4. **Ceden las rodillas** (0,82–0,94 s): baja, se aplasta, la cabeza cae y la mano resbala de la sien.
5. **La caída** (0,94–1,18 s): acelera con la gravedad; los brazos no acompañan al cuerpo: se quedan atrás, giran sueltos y llegan
   tarde; el pie de arriba se levanta por inercia; el torso se dobla.
6. **Impacto** (1,18–1,34 s): aplastar y rebote; la cabeza da el latigazo; cada brazo se pasa de largo y cae después: el derecho
   queda con el antebrazo cruzado sobre la panza (el hombro casi colgando, el codo doblado) y el izquierdo tirado a lo largo del
   cuerpo con la mano caída hacia el piso; las manos, relajadas (la mano abierta se veía tensa).
7. **Asentamiento** (1,34–1,9 s): rebotes cada vez más chicos, las patas juntas y flojas (la de arriba apenas cruzada), un tic de la
   cola.

Las poses finales se calcularon con la cinemática inversa del modelo (la mano derecha en un punto de la panza; el brazo izquierdo
con hombro 4° y codo 30°) y se revisaron cuadro a cuadro con `scripts/rive/cuadros.cjs` (41 cuadros, uno cada 50 ms) y con el visor de
la máquina de estados. En la app no cambia nada: Leccion (al quedarse sin vidas) y la trivia (al errar) disparan lo mismo.

{{PANTALLAS28}}

## 3. El festejo de la pieza, en una pantalla

**Qué pasaba.** El festejo de la prueba 27 (Lany grande en el centro, la pieza que vuela hasta ella, el tablero de seis en dos filas,
«3 de 6», la frase, el versículo) medía unos 800 puntos en un teléfono de 780 de alto: «Seguir» quedaba fijo abajo, pero el contenido
tapaba el final y había que deslizar.

**Qué se hizo** (`src/componentes/festejoPieza.tsx`). La pantalla mide lo que tiene antes de dibujar: lo fijo son unos 330 puntos
(cabecera 66, tablero 72, contador 44, frase 20, talentos 28, versículo 50 y separaciones) más el pie con «Seguir» (80); Lany se lleva
el alto que sobra (su escena mide 1,2 veces su tamaño), nunca más de 240 ni más del 56 % del ancho. El tablero de las seis piezas pasa
a **una sola fila** (ranuras de 52 puntos con el nombre debajo y el chip «NUEVA»), la cabecera se achica («¡Felicidades!» 26 en vez
de 30; el subtítulo dice «La espada del Espíritu · Palabra») y el versículo va en dos líneas. Probado en 390×780 (Lany de 218), en
360×640 (Lany de 180, entra justo) y en 390×844: todo a la vista y «Seguir» abajo, sin deslizar. La lista solo desliza si la letra
grande del sistema lo obliga (hasta 1,2 veces, como en toda la app).

## 4. La trivia sin paréntesis de la RV1909

**Qué pasaba.** 28 preguntas del Espadeo traían la palabra de hoy con la forma de la RV1909 al lado: «La fe, la esperanza y el amor
(en la RV1909, «la caridad»)», «Rode (en la RV1909, Rhode)», «Virtud (poder) para ser testigos», «Más unido (conjunto) que un
hermano», «Los de Ararat (Armenia)». Tenían un motivo (la respuesta se leía en la RV1909, donde la palabra es otra), pero el
paréntesis es incómodo y la prueba 25 ya había traído la herramienta para no necesitarlo: el pasaje se abre en la versión libre que
mejor se lee.

**Qué se hizo.** Tres cosas, en este orden:

1. **Nombres con la grafía de hoy en la Biblia de Senda** (`scripts/ortografia.py`), como la regla de la prueba 24 (Sansón, Noemí,
   Finees): Rode (era Rhode), Gayo (Gaio), Gabaón en Josué 21:17 (Gibeón; los otros 34 lugares ya decían Gabaón), Malta (Melita) y
   la reina de Sabá (reina de Seba, en los ocho versículos de 1 Reyes 10 y 2 Crónicas 9; «Seba» sigue siendo Seba donde es otro
   nombre). Son 12 versículos. De paso se arregló que «Líbano» oscilara entre mayúscula y minúscula en cada pasada del repaso de
   ortografía (una regla lo tomaba por gentilicio): ahora está en la lista de nombres que no lo son.
2. **La opción con la palabra de hoy, sin paréntesis**, en las 28 preguntas (cin-019, esp-311, cor-402, esc-607, esp-606, bot-705,
   esc-311, cor-318, cor-327, cin-323, bot-314, cas-419, cor-401, cor-406, cor-412, cor-423, cin-412, cin-421, bot-501, esc-803,
   bot-015, bot-020, bot-606, bot-702 y cinco «¿sabías que…?» que comparaban versiones). Ejemplos: «Poder para ser testigos», «Más
   fiel que un hermano», «Con nuestras riquezas y las primicias de nuestros frutos», «Un miembro distinguido del Consejo…», «Desde
   la hora sexta hasta la novena: del mediodía a las tres de la tarde». Las curiosidades que solo explicaban la diferencia entre
   versiones se cambiaron por datos del texto («Le trajo oro, piedras preciosas y más especias que nadie había traído nunca», 1 Reyes
   10:10; «Después de eso Moab quedó sometido a Israel y la tierra reposó ochenta años», Jueces 3:30).
3. **El pasaje se abre en la versión libre que trae la palabra de hoy** (`scripts/autor/versiones_por_versiculo.py`, lista `FORZADOS`,
   19 versículos): el script busca, en el orden de siempre (PDT sin nombres transliterados, NBV, BES), la primera versión que trae
   *todas* las palabras de la opción, y falla si ninguna la trae (nunca se inventa). Así, Hechos 1:8 se abre en la NBV («recibirán
   poder para ser mis testigos»), Proverbios 3:9 en la BES («con tus riquezas, y con las primicias»), Génesis 8:4 en la PDT («las
   montañas de Ararat») y Mateo 7:5 en la NBV («la paja del ojo de tu hermano»). La hoja explica por qué en una línea («Se abre en la
   NBV porque la RV1909 dice «virtud»; tocá RV1909 para verla igual»): la tabla guarda ahora el motivo de cada forzado y la app lo
   usa cuando el versículo no tiene un falso amigo del glosario. La tabla queda en 1.236 versículos (881 PDT, 348 NBV, 7 BES).

Lo que se lee para responder sigue enseñando la verdad por sí solo (regla de la prueba 17); el validador controla que cada hueco
y cada cita sigan textuales en la RV1909, y pasa. Cero plagio: solo versiones libres (PDT, NBV, BES, CC BY o dominio público) y la
RV1909 de dominio público; la RVR1960 sigue a un toque, en Bible.com.

## 5. Santiago y 1 Pedro, libro por libro

Dos cartas «generales» (no a una iglesia sino a los creyentes esparcidos), en la ruta «Las cartas», en las secciones que el plan ya
preveía («Santiago» y «1 y 2 Pedro»; 2 Pedro, más adelante). Mismo armado que 1 y 2 Timoteo y Tito: un nivel para abrir cada carta
y uno por capítulo, con la línea (qué pasó antes, qué pasa, cuándo y qué sigue), siete preguntas por lección y el repaso al final de
cada carta. Son 12 lecciones (`scripts/autor/cartas_santiago_pedro.py`); la Travesía queda en 319.

Cómo se escribieron, para que conste: con el texto de la RV1909 de la app abierto, capítulo por capítulo, y nada más. Cada cita entre
comillas es textual (el validador la compara con el versículo); los huecos usan palabras que la RVR1960 conserva («gozo», «corona»,
«airarse», «muerta», «fuego», «humildes», «mucho», «paz», «oro», «santo», «sacerdocio», «justos», «pecados», «mano»); las palabras
viejas van explicadas («zahiere», no reprocha; «caridad», amor; «solicitud», ansiedad; «conversación», conducta; «salud», salvación;
«dechados», ejemplos). Lo interpretativo se marca: que el autor de Santiago es Jacobo el hermano del Señor es «la lectura tradicional,
no un dato del texto»; que «Babilonia» de 1 Pedro 5:13 es Roma, «una lectura, no un dato del texto». Nada de doctrinas secundarias:
1 Pedro 3:1-7 se presenta con lo que el texto dice y la nota de que las iglesias lo aplican de maneras distintas; «los espíritus
encarcelados» (3:19) se nombra sin tomar posición. Santiago 2 y Romanos 4 se explican como lo hace la lectura protestante corriente:
Pablo muestra cómo se recibe la justicia (creyendo) y Santiago cómo se demuestra una fe viva (obrando); los dos citan Génesis 15:6.

Un detalle de la app que apareció al probar: la cabecera de la lección decía «SECCIÓN 11 DE 6» (numeraba por el plan de 14 cartas
pero contaba solo las seis secciones publicadas); ahora cuenta por el plan: «Sección 11 de 14».

## 6. Portugués e inglés: Ajustes y la lección por dentro

Siguiendo `docs/TRADUCCIONES.md`, pasaron a la tabla de idiomas (`src/i18n/textos.ts`) todas las filas de Ajustes (títulos, detalles,
opciones de cada segmento, botones y avisos: 88 cadenas) y lo fijo de la lección por dentro (portada, cabecera «Sección x de y»,
los siete tipos de pregunta, el panel de respuesta, el resumen final, la pantalla sin vidas, las notas y el glosario: 87 cadenas).
Al elegir portugués, la lección muestra «O que você vai ler», «Palavras · toque para entender», «Vamos! 7 perguntas…»; en inglés,
«The story», «So far», «Let's go!». El contenido (la historia, las preguntas) sigue en español hasta que se traduzca ruta por ruta en
2027. Falta de interfaz (ESTIMACIÓN): unas 300 cadenas (los carteles de Lany, los juegos por dentro, Comunidad y Calendario, el
lector, los avisos).

## 7. Cero plagio: cómo se cumple

El fundador lo recordó y vale dejarlo escrito. En esta prueba: las lecciones de Santiago y 1 Pedro salen del texto bíblico libre
(RV1909 de dominio público) y de nada más; no se abrió ningún libro de referencia para escribirlas y no se copió la estructura de
ningún estudio ajeno (nada de «cinco cosas sobre la fe» tomadas de un autor). La trivia se corrigió solo con las cuatro versiones
libres de la app. La RVR1960 no entra ni al contenido ni a los repositorios; el ejemplar del fundador, cuando aparezca, se usa solo
para comparar. Los libros de LIBROS-REFERENCIA3 siguen siendo para entender un tema y saber cómo se arma un estudio, nunca para
replicar; cuando alguna lección use una idea de un libro, lo dirá con su fuente (como las notas de historia).

## 8. Las APK

- **APK 28** (`senda-prueba-28.apk`, release `prueba-28`): trae absolutamente todo lo anterior. Es la única que hace falta probar:
  Travesía → una lección y fallar hasta quedarse sin vidas (el desmayo nuevo; o en el Espadeo, errar: el patatús); Jugar → ganar una
  pieza (el festejo en una pantalla); Jugar → responder y «Leer el pasaje» (la versión libre con la palabra de hoy y el motivo);
  Travesía → Las cartas → Santiago y 1 y 2 Pedro; Ajustes → Idioma → Português y entrar a una lección.

## 9. Pendientes y decisiones

1. **Fundador:** probar el APK 28; lo de la Consola y «más cosas» que dijo que revisa después; decir dónde está el ejemplar de la
   1960 o adjuntarlo en el chat; y lo pendiente de las pruebas 24 a 27 (consulta a la Sociedad Bíblica, subrayado o corchetes, color
   de Lany, fila de versión, sonido del tachado).
2. **Claude (próximas):** 2 Pedro y Hebreos jugables (siguiendo el plan de «Las cartas»); los carteles de Lany y los juegos por dentro
   en portugués e inglés; más láminas animadas (hay 144 lecciones con visual de 319); el comparador con el ejemplar de la 1960
   cuando aparezca.
