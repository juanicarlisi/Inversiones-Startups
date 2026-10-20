# Romanos y 1 Corintios, la interfaz entera en portugués e inglés, Gedeón, Naamán y Cornelio, y 350 lecciones con visual (la prueba 30)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 20-10-2026, con el APK 29 recién salido, el fundador dijo: «Ok. Avanzá con los próximos siguientes! Luego
reviso dónde está la versión de la RVR1960». Esta prueba hace exactamente los «próximos» que dejó listados el capítulo 55 §9:
**Romanos y 1 Corintios jugables** (21 lecciones; «Las cartas» queda en 68 y la Travesía en 352, §2); **el resto de la interfaz en
portugués e inglés**, hasta la última etiqueta de accesibilidad: 1.312 claves, con los días, los meses, las fechas, el saludo y la voz
que lee siguiendo el idioma (§3); **tres misiones más para «Vivir la historia»** (Gedeón, Naamán, y Pedro y Cornelio: 19 pasos y seis
láminas nuevas; 10 misiones hasta el 21-12, §4); y **visuales para las lecciones que no tenían ninguno**: de 132 a 2, con seis
diagramas nuevos (§5). De paso, dos nombres con la grafía de hoy (Éfeso, Estéfanas, §6). APK 30, que trae todo lo anterior (§7).
El archivo de la RVR1960 sigue sin aparecer y nada depende de él (capítulo 55 §3).
</div>

## 1. Lo que dijo el fundador y dónde quedó

| Lo que dijo (resumen) | Dónde quedó |
|---|---|
| «Ok. Avanzá con los próximos siguientes!» | Los cuatro «próximos» del capítulo 55 §9: §2, §3, §4 y §5 |
| «Luego reviso dónde está la versión de la RVR1960» | Nada depende de eso (capítulo 55 §3); el pendiente sigue abierto en la Consola hasta que lo revise |

## 2. Romanos y 1 Corintios, libro por libro

Dos secciones nuevas de «Las cartas», al principio de la ruta, en el orden del Nuevo Testamento: **Romanos** (11 lecciones: «Antes de
abrir Romanos» con los capítulos 1 y 16 y la línea de la Iglesia en el tercer viaje; «Sin excusa: todos bajo pecado» (1–3);
«Justificados gratuitamente, como Abraham» (3–4, con el árbol de Abraham); «Paz con Dios: Adán y Cristo» (5); «Muertos al pecado,
vivos para Dios» (6); «La ley es buena; ¿quién me librará?» (7); «Ninguna condenación: la vida en el Espíritu» (8); «Israel y la
misericordia de Dios» (9–11); «Un sacrificio vivo» (12–13); «El fuerte y el débil» (14–15); «Los planes de Pablo y los saludos»
(15–16); y el repaso) y **1 Corintios** (en la sección «1 y 2 Corintios», 10 lecciones: «Antes de abrir 1 Corintios» (1 y 16);
«Divisiones y la palabra de la cruz» (1–2); «Colaboradores de Dios, templo de Dios» (3–4); «Pureza y pleitos: comprados por precio»
(5–6); «Matrimonio, soltería y lo sacrificado a los ídolos» (7–8); «Los derechos de un apóstol y la carrera» (9–10); «La Cena del
Señor» (11); «Un cuerpo, muchos miembros; el amor» (12–13); «Que todo se haga para edificación» (14); «La resurrección» (15); y el
repaso). Son 21 lecciones (`scripts/autor/cartas_romanos_corintios.py`); «Las cartas» queda en **68** y la Travesía en **352**.

Cómo se escribieron: como siempre, con el texto de la RV1909 de la app abierto capítulo por capítulo; cada cita entre comillas es
textual y el validador la compara con el versículo; los huecos usan palabras que la RVR1960 conserva; los relatos, en párrafos
cortos. Los libros de referencia se usaron para entender y para chequear doctrina, nunca para replicar un bosquejo ni copiar una
frase (capítulo 55 §2). **Lo interpretativo se marca, y nada de doctrinas secundarias:** en Romanos 9, la elección se presenta con lo
que dice el texto y la nota de que las iglesias protestantes la entienden de maneras distintas; «todo Israel será salvo» (Romanos 11)
se enseña como lo que Pablo dice, sin decidir qué quiere decir «todo Israel»; el «yo» de Romanos 7 (¿antes o después de creer?) se
deja abierto; en 1 Corintios, el velo (11), los dones y las lenguas (12–14), «las mujeres callen» (14:34-35) y el orden de la
resurrección (15) van con lo que el texto dice y la marca de «lectura cristiana» donde corresponde. Los colofones que la RV1909 trae
al final de las cartas («Fue escrita de Corinto…») no se usan como dato.

## 3. La interfaz entera en portugués e inglés

En la prueba 29 faltaban «unas 225 cadenas»; al recorrerlo todo resultaron muchas más, porque cada pantalla tiene también sus
etiquetas de accesibilidad (lo que lee el lector de pantalla), sus avisos y sus textos de ayuda. Pasó a la tabla de idiomas
(`src/i18n/textos.ts`) **todo lo que quedaba**: la Travesía (el camino, los carteles de Lany en el camino, el repaso del día, las
lecturas de la sección, el explorador de rutas y «Proponer una travesía»), el calendario entero (vistas del mes, tres días y semana,
el alta de eventos en sus cuatro pasos, la rueda de hora, los avisos), la bienvenida (edades, niveles, motivos, recomendaciones), el
lector por dentro (la barra de marcas, las cintas, «Letra y papel», los papeles, las versiones, el glosario), el estudio por versículo,
Tu año, Proponer, Inicio completo, la Biblia y los planes de lectura, la línea de tiempo (épocas y fuente), Ajustes (la voz que lee y
su ayuda por sistema, los nombres y descripciones de los temas, los papeles, las cintas), ¿Quién es?, Vivir la historia, el desafío
del día, Comunidad, los mapas y las láminas. Son **1.312 claves** (eran 579).

Tres cosas que no eran una cadena más:

- **Las fechas siguen el idioma.** Los días, los meses, el «29 de noviembre» (en inglés, «November 29»), la fecha larga de Inicio
  («Terça-feira, 20 de outubro»; «Tuesday, October 20»), el rango de la semana y el saludo («Bom dia», «Good evening») salen de
  `src/util/fechas.ts`, que lee el idioma de Ajustes. Las letras de la tira de la semana también (S T Q Q S S D en portugués).
- **La voz que lee sigue el idioma.** `src/util/voz.ts` elegía solo voces en español; ahora elige las del idioma de la app
  (português, English), con la misma preferencia por las naturales, y la frase de prueba de Ajustes se lee en cada idioma desde su
  Biblia libre («O SENHOR é meu pastor, nada me faltará», Bíblia Livre; «The LORD is my shepherd; I shall not want», BSB).
- **Lo que viene de datos se traduce al mostrarse:** los tipos de evento, las plantillas, los nombres de los temas y los papeles
  (`tema.ts` guarda la clave y la pantalla la traduce), las categorías y comodines del Espadeo y los tipos de glosa.

Verificado en la vista previa en portugués e inglés, Inicio hasta abajo (capítulo 55 §4): lo que queda en español es contenido
(nombres de rutas y lecciones, preguntas, personajes, los eventos de la semana Senda, los planes de lectura), que se traduce con el
contenido en 2027 (`docs/TRADUCCIONES.md`). Lo que más se parece a una cadena suelta («Todo el día» en los eventos de la semana Senda)
se traduce al mostrarlo.

{{PANTALLAS30}}

## 4. Tres misiones más para «Vivir la historia»

«Vivir la historia» sale una historia por semana desde el lanzamiento (capítulo 46); había siete, hasta el 30-11. Ahora hay **diez**,
hasta el 21-12: **«Trescientos hombres»** (Gedeón, Jueces 6–7: el lagar de Ofra, «¿con qué voy a salvar a Israel?», el altar de Baal
de noche, el vellón, los trescientos, el sueño del pan de cebada, y las bocinas, los cántaros y las teas; 7 pasos), **«Siete veces en
el Jordán»** (Naamán, 2 Reyes 5: la muchacha cautiva, la carta y el rey que rasga sus vestidos, el mensajero en la puerta, «Padre mío»,
«no hay Dios sino en Israel», y Giezi corriendo detrás del carro; 6 pasos) y **«Lo que Dios limpió»** (Pedro y Cornelio, Hechos 10:
el centurión que ora, la azotea de Jope, «tres hombres te buscan», «yo mismo también soy hombre», «Dios no hace acepción de
personas», y el Espíritu sobre los gentiles; 6 pasos). Son 19 pasos con 76 opciones (`scripts/autor/historias_rol.py`; 10 misiones,
70 pasos). Mismas reglas de siempre: cada cita entre comillas es textual en el pasaje que se cita; la respuesta correcta es una frase
verdadera y los errores se nombran como error con su cita; cumplida solo sin errores; lo interpretativo (Jehová-salom, el sentido
de la visión del lienzo) se dice como lectura. El validador también cuida que la respuesta correcta no sea siempre la más larga (la
primera versión lo era en 14 de 19 pasos; se reescribieron las opciones).

**Seis láminas nuevas** (`scripts/arte/laminas.py`; 22 láminas, 173 capas), con la misma mano que las anteriores (formas blandas,
siluetas sin cara, nada de Jesús): la era de Ofra con el lagar, la peña y el alcornoque (de día, con el fuego que sube de la peña, de
noche y con el vellón); el valle de Jezreel con el campamento de Madián (de día, de noche con fogatas y con las teas de los
trescientos alrededor); el Jordán (el carro de Naamán en la orilla; Naamán limpio en el agua); la casa de Eliseo en Samaria (el carro
en la puerta, la vuelta, el camino con Giezi corriendo); la azotea de Jope junto al mar (la oración; el lienzo que baja con los
animales); y la casa de Cornelio en Cesarea (el ángel de la visión, la reunión, el Espíritu sobre todos). Cada paso de las misiones
abre su lámina en el estado que corresponde; la del centurión reutiliza además el puerto de Jope de Jonás.

## 5. Visuales: 350 de 352 lecciones

Quedaban 132 lecciones sin ningún visual (ni en la portada ni en un paso). Ahora quedan **2**, a propósito: «El hijo que volvió»
(la parábola de Lucas 15) y «Job y sus amigos», porque ningún mapa, línea o diagrama les dice algo verdadero sin forzar el texto
(la tierra de Uz no se ubica; la parábola no tiene lugar ni fecha). Las otras 130 llevan lo que les corresponde
(`scripts/autor/visuales.py`, bloque «prueba 30»; 331 visuales puestos en total): las cartas con la línea de la Iglesia en el tramo en
que se escribieron (Romanos y 1 Corintios en el tercer viaje, las de la cárcel en «preso», las pastorales y 1 Pedro en Roma, Santiago
en el concilio, 2 Timoteo y Judas al final) o con un diagrama cuando la lección es doctrinal; los profetas con la línea de los reyes o
de los imperios (Habacuc en Babilonia, Hageo en el segundo templo, Sofonías en Josías) o con un mapa (Abdías con Edom; Joel con Sión);
«Orar como Jesús enseñó» con el Padre nuestro; «El evangelio» con el bautismo, la cena, la resurrección, la ascensión, Pentecostés y
los diagramas; Rut con la era de Booz y su mapa; Jonás con el pez.

**Seis diagramas nuevos** (`scripts/arte/diagramas.py`; 16 diagramas, 79 capas), capa por capa como los anteriores y todos desde el
texto: **el fruto del Espíritu** (Gálatas 5:22-23, nueve caras de un solo fruto, con «caridad», «tolerancia» y «templanza» explicadas
con la palabra de hoy); **los «Yo soy» de Jesús** (los siete del Evangelio de Juan, cada uno con su versículo); **la oración que Jesús
enseñó** (Mateo 6:9-13: primero Dios, después nosotros, dicho como una forma de verla); **un cuerpo, muchos miembros** (1 Corintios
12:12-27); **tres idiomas, un libro** (hebreo, arameo y griego, con lo que es dato de los manuscritos marcado como tal y los versículos
que lo muestran: Daniel 2:4, Juan 19:20, Hechos 21:40; y que la Reina-Valera es una traducción); y **Adán y Cristo** (Romanos 5:12-19,
las dos columnas y el «mucho más»). Ninguno regala la respuesta de una pregunta.

## 6. Éfeso y Estéfanas

Al escribir 1 Corintios aparecieron dos nombres que el repaso de ortografía de la prueba 15 no había tocado: «Efeso» sin acento y
«estéfanas» en minúscula (el patrón de los gentilicios en «-anas» lo tomaba por uno). `scripts/ortografia.py` los fija (`FIJOS` y
`NO_GENTILICIO`) y el repaso cambió 20 versículos de la Biblia de la app y las lecciones y preguntas que los citan. Como siempre: las
mismas palabras de la RV1909 con la escritura de hoy, nada más.

## 7. Las APK

- **APK 30** (`senda-prueba-30.apk`, release `prueba-30`): trae absolutamente todo lo anterior. Es la única que hace falta probar:
  Travesía → Las cartas → Romanos (11) y 1 y 2 Corintios (1 Corintios, 10); Ajustes → Idioma → Português o English → recorrer Inicio
  entero, el calendario, una lección, el lector (Letra y papel, cintas), Tu año y Ajustes: todo traducido, con la fecha y el saludo en
  el idioma; Jugar → Vivir la historia: las nuevas salen el 7-12 (Gedeón), el 14-12 (Naamán) y el 21-12 (Cornelio); cualquier lección
  de «Orar como Jesús enseñó» o de «Listas» (el fruto del Espíritu, los «Yo soy»): el diagrama nuevo en la portada.

## 8. Pendientes y decisiones

1. **Fundador:** probar el APK 30; el archivo de la RVR1960 («luego reviso dónde está»): adjuntarlo en el chat si aparece, o decir que
   no está y se cierra; lo pendiente de las pruebas 24 a 29 (consulta a la Sociedad Bíblica, subrayado o corchetes, color de Lany,
   fila de versión, sonido del tachado, lo de la Consola y «más cosas»).
2. **Claude (próximas):** 2 Corintios, Gálatas, Efesios, Filipenses, Colosenses y 1 y 2 Tesalonicenses jugables (para cerrar «Las
   cartas» con las 21), o los profetas mayores, según lo que pida el fundador; la primera ruta de contenido en portugués («El gran
   relato», `docs/TRADUCCIONES.md`); más historias para «Vivir la historia» después del 21-12 (José y sus hermanos, Elías en el Carmelo,
   el ciego de Juan 9); las dos lecciones sin visual, si aparece algo que no fuerce el texto; el comparador con el archivo de la 1960 si
   aparece.
