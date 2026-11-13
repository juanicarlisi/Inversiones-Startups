# Capítulo 79 — Prueba 54: la Travesía entera y como un lugar

**Fecha:** 13-11-2026. **Origen:** el fundador preguntó cuánto de la Travesía estaba desarrollado (27 % de las secciones) y pidió
dejar todo hecho, aunque no salga en la primera versión.

## 1. Lo que pidió (textual)

1. «Avanzá con esto de las travesías a fondo. Aunque no lo publiquemos en la primer versión, dejemos ya TODO desarrollado. Andá línea
   por línea, chequeá todo punto por punto mientras vas construyendo para no cometer errores. No importa lo que demores».
2. «Recordá lo del layout de cada nivel de travesía, ajustado a lo que trata la travesía».
3. «Analizá extremadamente a fondo lo que es la UX en donde aparecen los niveles, al ir a ver todas las opciones de travesías. Están
   buenas las categorizaciones y eso pero me parece como muy app IA o app poco diseñada, más de otra cosa que de juego… creá también
   para esto el mejor entregable posible a tu alcance».
4. «El punto de "jugar" en el menú, ahora se fue al extremo. Quedó muy chico. Revisá otras apps que tienen esto… Ni groncho ni que no
   parezca de app de juego».

## 2. Lo que se hizo

### 2.1 Jugar: «el sol asentado» (pedido 4)

Benchmark de 16 apps con botón central (Kahoot, Trivia Crack, TikTok, Poshmark, Material 3 y otras), con la regla que sale de medirlas:
50 a 54 de diámetro y que asome entre un cuarto y un tercio. Jugar es un círculo ámbar plano de 52 (46 más un corte de 3 del color de
la barra) que asoma 16 sobre la barra, con las espadas de 26 y la etiqueta en la línea de las demás. Sin lomas, brillos ni cantos (lo
que hizo «cachivache» a la moneda de la prueba 52). Regla R29 del marco de UX, reescrita.

### 2.2 El entregable de UX (pedido 3)

«El mapa de la Travesía»: https://claude.ai/artifact/Y47pbj7a2hMjsm6ycjDtuU. Diagnóstico de la pantalla de entonces, referencias,
principios, un prototipo navegable (mapa → región → senda → puerta, con letra grande y pantalla de 360) y el plan en cuatro entregas.

### 2.3 El rediseño, en la app (pedido 3)

- **La senda limpia** (entrega 1): el capítulo es un estandarte chico al costado de su primer nivel (antes, un cartel que cortaba el
  camino); arriba, una sola fila con «Mapa» y «Lecturas» con su palabra, la ruta y el capítulo que se mira y los capítulos como
  segmentos; la hoja del nivel dice capítulo y nivel, preguntas y minutos y tres lecturas con «y N más»; Lany ya no da instrucciones.
- **El mapa de regiones** (entrega 2): la Travesía completa como un mapa de 13 regiones unidas por el camino del alba que baja de la
  cruz, cada una con su paisaje en un arco y una lámpara por ruta; cada región con sus rutas como postales (paisaje, nombre y una
  lámpara por capítulo) y lo que se prepara con «Avisarme cuando abra».
- **Las puertas del lugar** (entrega 3): misma forma de arco, con el material del paisaje (adobe, agua, tienda, piedra, templo,
  ladrillo esmaltado, arco romano, madera, vid, luz).
- Reglas nuevas del marco de UX: R30 a R33 (`docs/MARCO_UX.md` §2.13).

### 2.4 El layout de cada nivel según el tema (pedido 2)

Cada ruta del mapa (también las que se preparan) y cada capítulo tienen el paisaje de su lugar o su tema, y cada tramo pinta el suyo
detrás del camino, fundido con el anterior. Tres escenas nuevas: la vía romana, las ruinas y la tumba vacía (Jesús nunca se dibuja).
Al cerrar, cada capítulo de las rutas nuevas también tiene el suyo (Defender la fe, Cómo leer la Biblia, Tierras y tiempos,
Panorama). Se midió dónde está el dibujo en cada una de las 34 escenas: los arcos y la vía se veían vacíos en las postales (el foco
miraba el cielo) y el «mapa antiguo» eran curvas de nivel casi invisibles; se corrigieron los focos y el mapa se redibujó con mar,
costa, tierra, un camino punteado entre ciudades y la rosa de los vientos.

### 2.5 Lany en las rutas de mártires (pedido del 13-11 a la noche)

«En mártires, cuando completas un nivel o algo, Lany no festeja, más bien es como pose de reverencia». En «Testigos fieles», las
cuatro rutas de mártires y «La iglesia perseguida hoy», Lany ya no baila ni festeja: al terminar la lección ora (ojos cerrados y
manos juntas), sin confeti ni chispas y con una nota suave en vez de la fanfarria; en la racha de aciertos asiente; en el camino
llega asintiendo y con la ruta completa ora; el cofre, también. Las frases del camino cambian («Un testimonio más», «Terminaste la
ruta. Que su fe te anime»). La vista previa abre la pantalla final con `?demo=fin:ID`.

### 2.6 Toda la Travesía (pedido 1)

**Antes y después (HECHO, contado en `contenido/travesia.json`).**

| | Al empezar (13-11, mañana) | Al cerrar |
|---|---|---|
| Rutas abiertas | 23 de 102 | **102 de 102** (ninguna en «pronto») |
| Capítulos | 104 | 383 |
| Lecciones | 482 | **1.625** (1.143 nuevas) |
| Preguntas de la Travesía | 3.019 | **11.007** |

Por región, lo nuevo: La Biblia libro por libro 209 lecciones (Pentateuco, históricos, poéticos, profetas mayores, evangelios,
Hechos, Apocalipsis, «Datos que sorprenden» y 22 historias bíblicas más); Vivir la fe 195 (14 rutas); Personajes 168 (9 rutas);
Historia de la Iglesia 84 (de los primeros siglos a América Latina y las cuatro rutas de mártires, más «La iglesia perseguida hoy»);
Israel 74; Jesús el Mesías 68; Tierras y tiempos 65 (con «Arqueología», nueva); Defender la fe 62 (con «El dolor y el mal», «Jesús y
las religiones» y «Responder con respeto», nuevas); Cómo leer la Biblia 55 (con «Las promesas de Dios en su contexto» y «La Biblia
en español», nuevas); Panorama 47 (los 66 libros de cerca, los hilos y del Antiguo al Nuevo Testamento); Los últimos tiempos 45
(cada postura contada sin tomar partido); El evangelio 41; La oración 30.

**Cómo se escribió y se controló.** Una ruta por script (`scripts/autor/<ruta>.py`), escrita desde el texto de la RV1909 y con los
libros confiables solo para entender. Cada área la escribió un autor en su propia copia del repositorio (12 en paralelo) con la misma
guía; después, una segunda lectura pregunta por pregunta contra el versículo. Cada ruta entró solo si: el validador daba «Todo en
orden» (lecturas que cubren cada cita, nadie preguntado antes de presentarse, nada para atrás en la historia, la correcta nunca
la más larga, huecos que se leen igual en la RVR1960, entre «» solo la Biblia), ninguna lección existente cambiaba y no repetía
un versículo ya preguntado en otra ruta. En la segunda lectura se corrigieron, entre otras cosas: preguntas repetidas de otras rutas
(unas 60), datos mal (el sitio de Jerusalén, Abraham en Egipto, Antioquía y Cornelio, Malaquías y «400 años sin profeta», la
piedra de Pilato), lecturas que la RVR1960 dice distinto, posturas cristianas sobre la creación que quedaban marcadas como error,
distractores que tomaban partido sobre el milenio o el bautismo, y frases que no son de la Biblia entre «» (Ignacio, Policarpo,
Tertuliano, Tyndale). Lo interpretativo va marcado como tal (Israel y los últimos tiempos sin tomar posición).

**Hallazgo aparte.** La RV1909 de la app traía 1 Crónicas 21 con la numeración corrida (el 15 partido en dos y el 30 con dos
versículos): arreglado en `scripts/biblia_arreglos.py` con la numeración de hoy (DEC-2026-11-01-1).

**Para el revisor doctrinal humano** (todo está publicado en la app de prueba, según la regla de la prueba 11): el tono pastoral de
«El dolor y el mal»; las descripciones del judaísmo, el islam, el hinduismo y el budismo; las tres lecturas de la creación en
«Ciencia y fe»; las promesas con y sin condición (1 Samuel 2:30, 2 Timoteo 2:12-13); ágape y filéo en Juan 21; Marcos 7:19;
«propiciación» en 1 Juan 2:2; los Macabeos; la lectura de Malaquías 3:1 y Oseas 3:5. Las fuentes que los autores no pudieron abrir
(la Britannica bloquea la lectura) quedan anotadas en cada script para confirmar.

**Lo que falta.** Las rutas nuevas están solo en español (en portugués e inglés se ven en español hasta tener la ruta entera,
DEC-2026-10-21-2). Visuales que conviene dibujar: el mapa de los imperios y de los reinos helenísticos, el plano de Jerusalén del
siglo I, la casa con terrado y la sinagoga, los hallazgos arqueológicos, la línea de la Biblia en español, los géneros y los pactos.

### 2.7 Tres logos nuevos (pedido del 13-11 a la noche)

«El logo está buenísimo… pero la actual en cierto sentido la siento "muy IA"… 3 versiones más como opciones… con fuerte identidad de
marca, y como un buen logo para app». Lo que hace ver «IA» al actual es el degradé violeta a naranja con resplandor. Las tres
opciones son planas, con los colores de la app y sin brillos, y se probaron a 29 px y en círculo:

1. **La S de camino**: la S es una ruta maciza con su línea del medio que lleva a la cruz (separada), sobre ámbar.
2. **El libro y el alba**: la Biblia abierta, el sol que sale y la senda que entra en la luz (el lema dibujado), sobre noche.
3. **Lany**: la cara de la mascota como ícono, sobre índigo.

Se descartaron al mirarlas en chico: una lámpara de aceite (se leía como la de Aladino y después como una sartén), la puerta en
arco con la cruz (se leía como una lápida) y el libro con colinas (la senda parecía una cúpula). Lienzo con las tres:
https://claude.ai/artifact/RziKMpKvPd5PRsjjHZLY78; archivos en `marcas/logo_2026-11b/finales/` (fuente: `logos.py`). Recomendación:
la S de camino. Si se cambia, decidirlo antes de pagar el INPI: las marcas mixtas SENDA BIBLIA Y JUEGOS llevan el dibujo.

### 2.8 Controles antes del APK

Validador «Todo en orden» con las 1.625 lecciones; prueba de arranque (31 de 31); auditoría de textos de las 1.143 lecciones nuevas
con letra grande: 330 portadas con el «cuándo» cortado con «…», arregladas en la pantalla (dos líneas) y vueltas a auditar en cero;
las 86 pantallas, sin problemas.

El APK 54 se compiló en GitHub con el validador, la prueba de arranque y la prueba de lo social en verde (123,9 MB):
https://github.com/juanicarlisi/senda-app/releases/tag/prueba-54 (trae todo lo anterior).

## 3. Próximos

1. Que el fundador pruebe el APK 54 (pendiente «probar54») y elija el logo antes de pagar el INPI (pendiente «logo_eleccion»).
2. Traducir al portugués y al inglés las rutas nuevas, de a una y enteras (DEC-2026-10-21-2), empezando por las de entrada.
3. Los visuales que faltan (imperios y reinos helenísticos, Jerusalén del siglo I, la casa y la sinagoga, los hallazgos, la Biblia
   en español, los géneros y los pactos).
4. La revisión doctrinal humana de los puntos de §2.6.
5. La sesión legal exclusiva antes de que la ficha de Play sea pública (DEC-2026-11-10-5).
