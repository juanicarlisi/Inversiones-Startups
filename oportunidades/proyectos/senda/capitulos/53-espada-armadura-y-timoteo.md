# La espada bien agarrada, la armadura entera y 1 y 2 Timoteo (la prueba 27)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 20-10-2026 el fundador pidió seis cosas: que Lany agarre bien la espada (parecía tenerla «de arriba») y
que el festejo de cada pieza se vea mejor; que al ganar las seis piezas aparezca Lany con toda la armadura puesta (no aparecía);
volver a buscar el ejemplar de la RVR1960, que él cree haber subido a LIBROS-REFERENCIA3; sacar de la bienvenida la pregunta «¿qué
Biblia usan en tu iglesia?» («es medio raro»); corregir que la bienvenida salte sola antes de tocar «Siguiente»; y avanzar a fondo
con todo lo pendiente para una sola APK consolidada. Esta prueba hace todo eso: la espada rehecha en Rive (la hoja sigue el
antebrazo, el puño tapa la empuñadura; colgando apunta al piso y en alto al cielo), el festejo de pieza con Lany grande en el
centro y la pieza que vuela hasta ella, la armadura completa con Lany puesta de pie en guardia y festejando, la bienvenida sin ese
paso y sin avance automático, 1 y 2 Timoteo jugables (12 lecciones, 307 en total), dos diagramas nuevos (el templo de Salomón y la
estatua del sueño de Nabucodonosor), la línea de tiempo de los imperios, 84 visuales más en lecciones que no tenían, la línea de
tiempo unificada, el banco 7 de trivia (728 preguntas) y más interfaz en portugués e inglés. El ejemplar de la 1960 no está en
ningún repositorio al que se llegue (§4).
</div>

## 1. Lo que pidió el fundador y dónde quedó

| Pedido (resumen) | Dónde quedó |
|---|---|
| «Cuando Lany agarra la espada parece que la tiene agarrada de arriba; mejorá la interfaz de Lany cuando se va completando la armadura» | §2 |
| «Cuando ganás todo no aparece Lany con toda la armadura puesta; tiene que aparecer» | §3 |
| «¿El ejemplar de la 1960 no lo encontraste? Estaba cargado en LIBROS-REFERENCIA3» | §4 |
| «El sonido del tachado aún no lo sé porque no está la APK nueva» | APK 26 publicada (§8); el sonido se elige en la Consola |
| «Lo de la bienvenida, qué Biblia usan en tu iglesia, no: es medio raro» | §5 |
| «Si aprieto algo, salta directo antes de que apriete Siguiente; a veces paso dos pantallas» | §5 |
| «Continuá avanzando a fondo con todos los próximos y pendientes y dame la APK con todo consolidado» | §6 (contenido), §7 (visuales y línea unificada), §8 (APK 27) |

## 2. La espada, de verdad en la mano

**Qué pasaba.** En el modelo de Rive la espada estaba dibujada con la hoja saliendo hacia el codo. Con el brazo colgando, la hoja
subía por delante del antebrazo y se leía como «espada en alto»; pero el gesto de ponérsela levanta el brazo entero, y entonces la
hoja quedaba colgando desde el puño hacia abajo: exactamente «agarrada de arriba». Además, la espada se dibujaba encima de la mano,
así que la empuñadura tapaba el puño en vez de que el puño la agarrara.

**Qué se hizo** (`scripts/rive/lani.py`, prueba 27):

- La espada nace **dentro de la mano**, detrás de las formas del puño y delante del antebrazo: asoman el pomo arriba y la guarda y la
  hoja abajo, como cuando una mano cierra sobre una empuñadura.
- La hoja **sigue el antebrazo**, hacia donde apuntan los dedos. Colgando el brazo, la punta queda cerca del piso al costado del pie
  (con un ángulo chico hacia afuera); con el brazo en alto, la punta al cielo. Es una espada corta, como la «máchaira» romana de
  Efesios 6:17: con el largo justo para que no toque el piso en reposo.
- El giro de la hoja lo maneja la capa del cuerpo, pose por pose: en reposo, apenas hacia afuera; al ponérsela, un pequeño pasarse
  al llegar arriba (como si pesara) y la vuelta al ángulo de reposo mientras baja el brazo; en guardia (la pose de la armadura
  completa), diagonal hacia arriba y afuera, sin cruzar la cara. La capa de la pieza ya no toca el giro.
- El gesto de ponérsela se alargó a 1,9 s: la espada aparece en el puño con un «pop» justo cuando el brazo llega arriba.

Se verificó cuadro a cuadro con el visor de la máquina de estados (reposo con espada y escudo, guardia con armadura completa,
el gesto de ponérsela en siete momentos, el festejo con espada).

**El festejo de cada pieza** (`src/componentes/festejoPieza.tsx`). Antes, la pieza en 3D ocupaba el centro y Tu Lany aparecía
chica al costado. Ahora Lany es la protagonista: grande, en el centro, con lo que ya tiene puesto; la pieza llega a una vitrina
arriba a la izquierda (anillo de luz, polvo dorado), a 1,4 s **vuela hasta Lany** y Lany se la pone (el gesto propio de cada
pieza); cuando termina, festeja con los brazos en alto y llueve más confeti. Debajo sigue el tablero grande de las seis piezas,
«N de 6», la frase que empuja y el versículo chico. El motor de Lany entiende «todavía no» (n = 0) para que la pieza no se encienda
antes de tiempo.

{{PANTALLAS27}}

## 3. La armadura entera, puesta

Antes, al ganar la sexta pieza, la pantalla mostraba las seis piezas en 3D bajo la luz de vitrina y ningún Lany. Ahora
(`FestejoArmadura`): Lany grande, de pie en guardia, con las cinco piezas que ya tenía; se pone la última (la que acaba de ganar)
y festeja con los brazos en alto, con confeti y globos; cada cinco segundos repite el festejo. Debajo, las seis piezas encendidas,
el título («¡La armadura es tuya!» o «¡Le ganaste a Lany!»), «+20 talentos», el versículo que presenta la armadura entera
(Efesios 6:13) y lo que enseña el pasaje. Fijas, las acciones de la partida. La vista previa lo abre con `?demo=armadura`.

## 4. El ejemplar de la RVR1960: no está en ningún repositorio

El fundador cree haberlo subido a LIBROS-REFERENCIA3. Se buscó el 20-10-2026 con un clon fresco de cada repositorio al que la
sesión llega:

| Repositorio | Último commit | Archivos | ¿Alguna Biblia? |
|---|---|---|---|
| LIBROS-REFERENCIA3 | 16-10-2026 | 564 (530 PDF, 29 docx, 2 doc, 1 epub, README) | No: todos son libros de autores; ninguno es una Biblia |
| LIBROS-REFERENCIA2 | (vacío el 19-10) | 0 | No |
| LIBROS-REFERENCIA | sin commits | 0 | No |
| biblioteca-estudios-biblicos | 11-10-2026 | 121 (comentarios, Biblias de estudio en PDF) | No |
| estudios-biblicos-con-ani | 20-10-2026 | 421 (todo en `genesis/`) | No |

Se revisaron los nombres completos (también los que no dicen «Biblia»: «Sagrada», «Escrituras», «RV», «Reina», «Valera», «1960»,
«Santa») y las extensiones (ni .txt, .usfm, .sqlite, .zip ni .xml). HECHO: en ningún repositorio accesible hay un ejemplar de la
RVR1960. Si lo subió a otro lado (por ejemplo, a un repositorio privado que la sesión no ve), hace falta el nombre exacto del
repositorio y la carpeta. **Lo más simple y lo más seguro:** adjuntarlo en el chat; queda en la carpeta de subidas de la sesión,
fuera de todo repositorio, que es donde tiene que estar (el texto de la 1960 no entra a la app ni a ningún repositorio).

## 5. La bienvenida: sin «¿qué Biblia usan?» y sin saltar sola

- **El paso de la Biblia de la iglesia salió** (`src/pantallas/Bienvenida.tsx`): la versión «↗» de cada pasaje sigue eligiéndose en
  Ajustes → Lectura de la Biblia, para quien quiera.
- **Nada avanza solo.** Las opciones de un solo toque (edad, nivel, fe, meta, recordatorio, origen) solo marcan; el paso siguiente
  lo decide siempre «Siguiente». Se sacó el temporizador de avance de la prueba 20, que era la causa: elegías, la pantalla pasaba
  sola a los 0,4 s y, al ir a tocar «Siguiente», ya estabas en la siguiente, así que pasabas dos. Con una sola regla («Siguiente»
  avanza, nada más) no hay ambigüedad; «Saltar» sigue para los pasos sin respuesta.

## 6. Contenido: 1 y 2 Timoteo, trivia 7 y lo que quedaba

- **1 y 2 Timoteo jugables** (`scripts/autor/cartas_timoteo.py`): 12 lecciones en «Las cartas», sección «1 y 2 Timoteo y Tito»
  (antes de Tito, con un repaso por carta): «Antes de abrir 1 Timoteo», un nivel por capítulo (la ley y la gracia, orar por todos y
  un solo mediador, obispos y diáconos, ejercitarse para la piedad, viudas y ancianos, la piedad con contentamiento) y lo mismo con
  2 Timoteo (no te avergüences, el buen soldado, toda Escritura es inspirada, he peleado la buena batalla). Todo sale del texto
  (RV1909, leído entero antes de escribir); los huecos usan palabras que la RVR1960 conserva; las palabras viejas van explicadas
  («caridad» es amor, «conversación» es conducta, «salud» es salvación, «granjería» es ganancia, «neófito» es recién convertido).
  1 Timoteo 2:11-15 se nombra sin tomar posición («las iglesias protestantes lo aplican de maneras distintas: léelo entero y
  conversa con tus líderes»): nada de doctrinas secundarias. La Travesía queda en 307 lecciones y 440 niveles; el validador, en
  «Todo en orden».
- **Banco 7 de trivia** (`scripts/autor/trivia_banco7.py`): 42 preguntas, 7 por pieza, todas sobre versículos que ningún banco
  usaba (de 155 candidatos, 57 estaban libres; `--repetidas` da 0 coincidencias; `--revisar`, 0 sin palabra clave). Cinco con mapa;
  los mapas de lugares marcan las cuatro opciones, nunca solo la correcta. 728 preguntas en total.
- **Juegos nuevos:** sigue lo decidido en la prueba 26 (ninguno todavía).

## 7. Lo que se ve: templo, estatua, imperios y la línea unificada

- **Diagrama «El templo de Salomón»** (`scripts/arte/diagramas.py`): plano visto desde arriba, 1 codo = 3 px, en cinco capas: la
  casa (60 × 20 × 30 codos, 1 Reyes 6:2), el oráculo (20 × 20 × 20, el arca y los querubines, 6:19-23), el lugar santo (40 codos, el
  altar de oro, la mesa y los diez candeleros, 6:17; 7:48-49), el pórtico con Jaquín y Boaz (6:3; 7:21) y el atrio con el altar de
  bronce y el mar de fundición (2 Crónicas 4:1; 1 Reyes 7:23-25). Se ve en «Salomón y el templo» (el gran relato) y en Hageo 2.
- **Diagrama «La estatua del sueño»**: Daniel 2 por partes (cabeza de oro, pecho y brazos de plata, vientre y muslos de bronce,
  piernas de hierro y pies de hierro y barro, la piedra que se vuelve monte), con lo que dice el texto de cada reino. La nota deja
  claro que el texto nombra solo a Babilonia y que Medo-Persia, Grecia y Roma son la lectura protestante tradicional. Se ve en
  «Fieles en Babilonia».
- **Línea de tiempo «Los imperios alrededor de Israel»** (`scripts/autor/lineas.py`): Egipto, Asiria, Babilonia, Persia, Grecia,
  Roma y la caída del templo en el 70, con su cita o, cuando la Biblia no lo cuenta (Alejandro, Pompeyo, el año 70), dicho así y
  con la fuente (Josefo). Siete líneas, 91 tramos.
- **84 visuales más** (`scripts/autor/visuales.py`): mapas, líneas y diagramas en lecciones que no tenían (Quién fue quién entero,
  los doce profetas, patriarcas, mujeres, testigos, los 66 libros, Pablo, las cartas, el gran relato). Las láminas de Rut y Jonás
  se respetan. 144 lecciones con visual (eran 60).
- **La línea de tiempo unificada** (capítulo 47): «La historia en una línea» (desde la Biblia) ahora muestra arriba, con chips,
  las mismas siete líneas que se ven en las lecciones, para recorrerlas con el dedo; abajo sigue la lista vertical de momentos con
  su pasaje. Una sola fuente de verdad (`contenido/lineas.json`).
- **Interfaz en portugués e inglés:** los botones del camino de la Travesía (Entrar, Repasar, el cofre), los títulos de las
  secciones de Ajustes, el título de Comunidad y la pantalla de la línea de tiempo (`docs/TRADUCCIONES.md` actualizado).

## 8. Las APK

- **APK 26** (prueba 26, publicada el 20-10 a la 01:14): https://github.com/juanicarlisi/senda-app/releases/tag/prueba-26. Trae el
  tachado automático con su sonido; si prefiere otro, se elige en la Consola (sala de sonidos → «Se baja una tarjeta»).
- **APK 27** (esta prueba): todo lo de arriba consolidado, más todo lo anterior. El enlace queda en `estado.yaml` (pendiente
  `probar27`) y en el mensaje de cierre.

## 9. Pendientes y decisiones

1. **Fundador:** probar el APK 27 (Jugar → ganar una pieza y la armadura entera; borrar los datos de la app para ver la bienvenida;
   Travesía → Las cartas → 1 Timoteo; Biblia → «La historia en una línea» → chips; una lección con el templo o la estatua); decir
   dónde está el ejemplar de la 1960 o adjuntarlo en el chat; y lo pendiente de las pruebas 24 a 26 (consulta a la Sociedad
   Bíblica, subrayado o corchetes, color de Lany, fila de versión, sonido del tachado).
2. **Claude (próximas):** Santiago y 1 Pedro jugables; las filas de Ajustes y la lección por dentro en portugués e inglés; más
   láminas animadas (hay 144 lecciones con visual de 307); el comparador con el ejemplar de la 1960 cuando aparezca.
