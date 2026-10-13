# Una línea clara, Lany en Rive y la Biblia para estudiar: la prueba 11

<div class="enpocas" markdown="1">
**En pocas palabras.** La prueba 11 (12-10-2026) responde al pedido largo del fundador del mismo día.
- **Lany en Rive:** el personaje anima de verdad, con 18 animaciones y una máquina de estados, hecho con código.
- **Música de apertura nueva:** alegre, moderna y sobria.
- **Travesías con una línea clarísima:** cada lección cuenta qué pasó antes, qué pasa y qué sigue.
- **El gran relato, completo:** 9 capítulos y 47 lecciones.
- **Pablo, en orden:** de perseguidor a apóstol, los tres viajes y preso por Cristo.
- **Dos travesías de historia:** «Testigos fieles» (los mártires) y «La historia de la Iglesia» (los referentes, en orden). Cada dato
  lleva su fuente.
- **Todo el contenido, revisado pregunta por pregunta y publicado.**
- **Vidas que no se terminan enseguida** y que siempre se recuperan.
- **La Biblia para estudiar:** el «+» por versículo, lectura continua por defecto y siete temas.
- **La RVR1960:** todas las vías revisadas, y lo que se puede hacer hoy sin licencia.
</div>

## 1. Lo que pidió el fundador y dónde quedó

Resumen de lo pedido (sin citas textuales) y cómo se resolvió.

**Lany, música, contenido y Travesía**

| Pedido | Qué se hizo | Estado | Dónde |
|---|---|---|---|
| Música de inicio moderna, divertida, tecnológica, alegre y sobria | Firma nueva: sube en semicorcheas con vibráfono y campana, aterriza con un golpe grave y remata arriba, en re mayor con novena, a 132 por minuto. Las variantes «Calma» y «Chispa», y la anterior, quedan en la Consola para comparar | Hecho | {{cap:20}} |
| La mascota hecha en Rive, con una experiencia excelente; cambiarla si conviene | Lany pasa a Rive: articulada, con 18 animaciones y máquina de estados. Se mantiene Lany (no hacía falta cambiarla) | Hecho | §2 y {{cap:16}} §3c |
| Revisar todo el contenido pendiente contra las fuentes y publicar lo confiable | Revisión pregunta por pregunta; se publicó todo lo confiable y se retiraron 8 preguntas del Espadeo | Hecho | §4 |
| Cada travesía con una línea muy clara y progresiva; Pablo en orden; Israel que nace, es esclavo y es liberado | «La historia» en cada lección, resumen en cada capítulo, el gran relato completo y Pablo en tres capítulos | Hecho | §3 |
| Que las vidas no se terminen rápido; videos sin límite para recuperarlas | 5 vidas, una nueva cada 30 minutos, un video da una vida cuando quieras y leer un capítulo devuelve una (hasta 3 por día) | Hecho | §5 y {{cap:17}} |
| Travesía de los mártires y cronología de los referentes de la Iglesia | «Testigos fieles» (9 lecciones) y «La historia de la Iglesia» (18 lecciones) | Hecho | §3 |
| Todo lo de la Travesía y la trivia revisado exhaustivamente | Validador más estricto y revisión manual de Claude, una por una | Hecho | §4 |

**La Biblia**

| Pedido | Qué se hizo | Estado | Dónde |
|---|---|---|---|
| Notas por versículo como MyBible, con fuentes confiables, en el «+» | Referencias cruzadas, notas de traducción y tu nota, con sus fuentes | Hecho (sigue) | §6 y {{cap:07}} |
| Lectura continua por defecto y la de papel como opción; temas de Biblia; velocidad excelente | Lectura continua al instante (sin medir renglones), papel en Ajustes, siete temas | Hecho | §6 |
| Marcadores y paso de hoja rápidos | Se mantienen las mejoras de las pruebas 6 a 9; la lectura continua no mide nada antes de mostrar | Hecho | {{cap:07}} |
| Tener hoy la RVR1960 en la app sin la licencia (pedido durante la sesión) | 13 vías revisadas en la fuente: hoy se lee dentro de Senda vía Bible.com y se pueden citar hasta 500 versículos; pedido a la Sociedad Bíblica Argentina listo | Hecho (falta enviar) | §7 |

## 2. Lany en Rive

**Por qué Rive.** Rive dibuja personajes vectoriales con huesos, mezcla animaciones sin cortes y tiene una máquina de estados: la app
no mueve piezas, le dice a Lany qué está pasando («acertaste», «perdiste una vida», «hay fiesta») y Lany reacciona sola. Pesa poco
(el archivo de Lany ocupa 41 KB) y el mismo archivo anda en Android, iPhone y la web.

**Cómo se hizo.** El sitio de Rive está bloqueado en la red del entorno de Claude, así que no se pudo usar su editor. Claude escribió un
generador de archivos `.riv` que usa los mismos tipos y claves que el motor oficial (tomados de las cabeceras del código abierto de
Rive), y con él armó a Lany:

- **Articulaciones:** cuerpo que se aplasta y se estira desde el piso, cadera y cintura, hombros y codos, cuello, orejas, cejas, ojos
  (forma, parpadeo y mirada por separado), bocas y mechón.
- **18 animaciones** con anticipación, impulso, frenada y movimiento secundario: reposo con miradas, saludo, festejo, acierto, error,
  tocar, pensando, triste, dormida, baile al pulso de la fiesta, guardia, corriendo, desmayo, armadura y Tu Lany (buzo y gorra).
- **Máquina de estados con data binding:** un modelo de datos «Lany» (estado, armadura, Tu Lany y los disparadores). El parpadeo es
  una capa aparte que sigue mientras Lany hace cualquier otra cosa.

**En la app.** Motor nativo de Rive en el teléfono y su versión web (wasm) en la vista previa. El archivo se carga una sola vez y todas
las Lany lo comparten. Para tamaños chicos, con «reducir movimiento» o si Rive fallara, se muestran poses quietas salidas del mismo
archivo. Lany 3D (prueba 8) queda como opción en Ajustes para las fiestas.

**La decisión.** Se mantiene Lany: el personaje ya está definido ({{cap:16}}) y ahora se mueve como uno profesional. En noviembre se
decide si un animador de Rive la pule (la línea de USD 1.200 del presupuesto) o si queda la hecha con código.

## 3. Una línea clarísima en la Travesía

**«La historia» en cada lección.** En las rutas que cuentan una historia, cada lección empieza con un bloque fijo: **hasta acá** (lo
que pasó antes), **el relato en orden** (de uno a cinco párrafos), **cuándo** y **lo que sigue**. El camino muestra qué pasa en cada
capítulo, la portada dice «Capítulo N de M» y, al terminar, aparece «Lo que sigue». El validador exige el relato en esas rutas y un
resumen de 20 a 150 letras en cada capítulo. Las rutas temáticas también tienen ya su resumen por capítulo.

| Travesía | Capítulos | Lecciones | Preguntas | La línea |
|---|---|---|---|---|
| El gran relato | 9 | 47 | 286 | Los comienzos → los patriarcas → éxodo y desierto (Israel nace en Egipto, es esclavo y Dios lo libera) → la tierra prometida → reyes y profetas → exilio y regreso → Jesús → la iglesia → la esperanza |
| Pablo, de Damasco a Roma | 3 | 11 | 71 | De perseguidor a apóstol → los tres viajes → preso por Cristo |
| Testigos fieles | 3 | 9 | 54 | Mártires en la Biblia (Juan el Bautista, Esteban, Jacobo, la corona de la vida) → la iglesia perseguida (Nerón, Ignacio, Policarpo, Perpetua, el 313) → la Reforma y las misiones (Hus, Tyndale, los cinco de Ecuador) |
| La historia de la Iglesia | 6 | 18 | 108 | La iglesia antigua (Nicea, Atanasio, Agustín) → antes de la Reforma (Valdo, Wycliffe, Gutenberg) → la Reforma (Lutero, Worms, Calvino) → la Biblia en español (Enzinas, Reina, Valera) → avivamientos y misiones (Wesley, Carey, Hudson Taylor) → el evangelio en América del Sur (Thomson, Gardiner, Penzotti) |

**Cada dato con su fuente.** En las dos travesías de historia, lo que no está en la Biblia va como nota con su fuente: documentos
antiguos (Tácito, el Martirio de Policarpo, la Pasión de Perpetua, Eusebio, las Confesiones de Agustín), cartas originales (las de
Diego Thomson desde Buenos Aires, 1820 y 1821) y obras de referencia. Lo dudoso se dice como tal: la puerta de Wittenberg es
tradición, el «Aquí estoy» de Worms es una frase atribuida, la lista de las cinco «solas» es del siglo XX, las palabras exactas del
sermón de Carey no se conservan y la fecha del martirio de Policarpo se discute. Cada lección termina con un versículo que la conecta
con la Palabra y un paso para la vida: la historia también enseña y edifica.

## 4. Contenido revisado y publicado

- **Cómo se revisó.** El validador comprueba que cada cita exista en la RV1909, que lo que se completa o se cita esté textual en el
  pasaje y que las lecturas de cada nivel cubran todo lo citado. Además, Claude revisó cada pregunta a mano: que la respuesta sea la
  correcta, que ninguna otra opción también lo sea y que el enunciado no se preste a dos lecturas.
- **Lo que se corrigió**, por ejemplo: el enunciado de Génesis 1:3 («Sea la ___: y fué la ___»), la explicación de Josué 21:45, un
  distractor que también era respuesta posible (Isaí) y la cita textual de Mateo 3:15.
- **Lo que quedó.** 12 rutas abiertas con 128 lecciones y 782 preguntas; en el Espadeo, 137 preguntas publicadas, 12 aprobadas y 8
  retiradas por dudosas o ambiguas.
- **Lo que falta.** La confirmación de dos revisores doctrinales humanos, que sigue siendo recomendable antes de las tiendas.

## 5. Vidas

| Regla | Valor | Por qué |
|---|---|---|
| Vidas gratis | 5 | Alcanza para una lección difícil sin cortar |
| Recarga | 1 cada 30 minutos | Volver al rato siempre funciona |
| Video | +1 vida, sin límite | Pedido del fundador; hoy es un anuncio simulado, hasta tener la red de anuncios |
| Leer la Biblia | +1 vida por capítulo leído, hasta 3 por día | Leer la Palabra se premia: todo enseña y edifica |

Al actualizar la app, a quien no estaba esperando una recarga se le completan las vidas al máximo nuevo.

## 6. La Biblia para estudiar

- **El «+» por versículo**, como MyBible: tocás un versículo y «Estudio» abre una hoja con
  - **referencias cruzadas** de OpenBible.info (CC BY): las 10 más votadas por versículo, con al menos 2 votos y solo las que existen
    en la RV1909 (220.356 referencias en 29.212 versículos), con el texto en la versión que estás leyendo;
  - **notas de traducción** de la Palabra de Dios para Todos (232) y de la Nueva Biblia Viva (68);
  - **tu nota** y **las fuentes** de cada cosa.
  Los datos (2,5 MB) se cargan a los 1,5 segundos de abrir la Biblia, para no frenar la lectura.
- **Lectura continua por defecto.** La Biblia se va bajando, como cualquier lector, y se muestra al instante porque no mide renglones
  antes de dibujar; la Biblia de papel, con sus hojas, se elige en Ajustes.
- **Siete temas de lectura:** Papel, Sepia, Blanco, Gris, Noche, Azul noche y Negro.
- **Lo próximo del «+»:** nombres y léxico (STEPBible, CC BY), un diccionario bíblico de dominio público, introducciones a los 66
  libros y mapas.

## 7. La RVR1960 hoy, sin licencia

Se revisaron 13 vías en la fuente primaria (bitácora `conocimiento/2026-10-12-senda-rvr1960-todas-las-vias.md`). La conclusión:
**sin licencia no hay forma legal de tener el texto completo dentro de Senda**. Lo que sí se hizo o se puede hacer hoy:

| Vía | Qué permite | Estado |
|---|---|---|
| Bible.com dentro de Senda | Leer el capítulo exacto en la RVR1960 sin salir de la app, desde el lector y desde cada lección | Hecho |
| Citas según la política de la Sociedad Bíblica Argentina | Hasta 500 versículos, con su leyenda, sin permiso escrito (versículo del día, versículos para memorizar) | Lugar listo en la app; falta el texto de una fuente legítima |
| Pedido a la Sociedad Bíblica Argentina como uso no comercial | El texto completo, si lo aprueban: su política define como comercial solo lo que se vende, alquila o trueca | Correo listo para enviar (Consola) |
| YouVersion Platform | El texto completo, gratis | Solo si Senda no tuviera anuncios ni ingresos de ningún tipo: decisión del fundador, no recomendada |

Se descartaron las copias que circulan en internet y la importación de archivos por el usuario: un reclamo podría bajar toda la app.

## 8. Qué sigue

- **El fundador:** probar la prueba 11 (Lany, la música, las travesías nuevas, el «+» y las vidas) y enviar el pedido a la Sociedad
  Bíblica Argentina.
- **Claude, sprint 2 (26-10 a 8-11):** Los 66 libros y Personajes; más paquetes del «+»; cuentas opcionales y la Consola v1.
