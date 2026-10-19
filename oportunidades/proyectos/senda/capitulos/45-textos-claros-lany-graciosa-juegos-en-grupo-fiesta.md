# Textos que se entienden a la primera, Lany graciosa, juegos para jugar con otros, la fiesta y el widget: la prueba 20

<div class="enpocas" markdown="1">
**En pocas palabras.** La prueba 20 (19-10-2026) responde una lista larga de observaciones del fundador después de probar la app, con
una idea de fondo: **cada palabra importa y cada juego tiene que poder jugarse con otros.**
- **Los textos se entienden a la primera**: se corrigieron las frases que confundían (los serafines ya no «se gritaban»; «su eterna
  potencia y divinidad» se explica; Babel y otras siete preguntas tienen contexto; «caridad» es siempre amor) y nació el **glosario
  automático**: 95 palabras explicadas, con su original cuando ayuda, resaltadas en la historia de cada lección (§2).
- **La historia de la lección se rediseñó**: pasos numerados, citas en color, negritas, «hasta acá» chiquito y fichas de palabras;
  el repaso del día es una píldora que dice «opcional» y el globo de Lany ya no pisa nada (§3).
- **Lany reacciona al error con gracia**: se desmaya y se levanta, se tapa la cara, se marea, se tapa los ojos; nunca se burla.
  Investigación de mascotas y de cómo Duolingo anima a sus personajes (§4). **Fiesta** de verdad: confeti y globos al terminar
  lección y capítulo y al ganar una pieza, con el tablero grande y menos texto (§5).
- **Tres juegos para jugar con otros**: «¿Quién es?» contra alguien (§6), «Vivir la historia» en grupo con voto secreto y un minuto de
  charla (§7) y «Nombres por letra», nuevo (§8).
- **Calendario en tres pasos, la tarjeta de Inicio solo con eventos y el widget del versículo del día** para Android (§9).
- **Libros**: manda la clasificación nueva del fundador; nada de esa biblioteca se había usado. Registrados el entorno de prueba
  para líderes y «10 kits por puntos» (§10).
</div>

## 1. Lo que pidió el fundador y dónde quedó

| Pedido (resumen) | Dónde quedó |
|---|---|
| Más animaciones y más gracia en Lany (que se desmaye al errar); investigar mascotas y dibujos; que todos hablen de Lany | §4: cinco gestos nuevos en Rive y la lógica de reacción al error; investigación en `conocimiento/2026-10-19-…` |
| Bienvenida: el «Siguiente» doble; áreas que no se desmarcaban y demasiadas; menos preguntas | §3: corregido; ocho áreas y ocho preguntas de entrada con «Más preguntas» |
| Intros de lección más cortas, con negritas y resaltados, hermosas | §3: la tarjeta de la historia nueva |
| Travesías revisadas línea por línea («eterno poder y deidad», la llanura, los ángeles, «caridad», lo básico como «santo») | §2: correcciones y glosario |
| Repaso opcional menos invasivo; carteles que se pisan al tocar a Lany | §3 |
| Mucha más fiesta; pantalla de pieza con tablero grande y menos texto | §5 |
| Calendario en pasos; evaluar lugar, enlace y notas; ¿molesta en Inicio?; widget del versículo; el desafío del domingo | §9 |
| Juego de nombres por letra para grupos | §8 |
| «¿Quién es?» contra alguien con preguntas escritas (y sacar a Lany si no entiende) | §6 |
| «Vivir la historia» interactivo, útil y divertido | §7 |
| Verificar que no se usaron libros no confiables (el repositorio de Génesis) | §10 |
| Registrar el entorno de prueba para líderes y la idea de los kits | §10 |

{{PANTALLAS20}}

## 2. Textos que se entienden a la primera: las correcciones y el glosario

**Qué estaba mal.** Al leer la Travesía como la lee alguien que recién llega, aparecían tres clases de problema: palabras de la
Reina-Valera de 1909 que hoy no se usan o se entienden distinto («caridad» por amor, «potencia» por poder, «inmundo» por impuro,
«menester» por necesidad); frases bien traducidas pero mal elegidas (los serafines «se gritaban»: la RV1909 dice «el uno al otro
daba voces», y «gritarse» suena a pelea); y preguntas que daban por sabido el contexto («¿En qué tierra estaba la llanura donde se
asentaron?», sin decir quiénes ni cuándo).

**Qué se hizo.**

- **Correcciones a mano** en las fuentes (`scripts/autor/evangelio.py`, `relato_c1_c2.py`, `historia_iglesia.py`, `patriarcas.py`,
  `martires.py`, `relato_c5.py`, `relato_c6.py`, `libros_cortos.py`) y en el contenido: los serafines «se decían uno al otro, a gran
  voz»; Romanos 1:20 explicado («mirando la creación se entiende que Dios tiene un poder que no se acaba y que es Dios; la Biblia
  lo dice así: “su eterna potencia y divinidad”»); «santo» con su original (kadósh: apartado, distinto de todo lo demás); «inmundo»
  como impuro; Babel con su contexto; y ocho preguntas sin sujeto reescritas (Diego Thomson, el criado de Abraham, Esteban, el hijo
  pródigo, la caída, el reino dividido, Babel). «Caridad» pasó a ser amor en las tres preguntas de la trivia y en Filemón, siempre
  con la aclaración «en la RV1909, “caridad”» afuera de las comillas: **las comillas siguen siendo texto exacto de 1909** (así se
  respeta la regla de citas y no hay problema de licencia: la RV1909 es de dominio público y la RVR1960 no se copia).
- **El glosario automático** (`scripts/autor/glosario.py`): 95 entradas, cada una con las formas que la disparan, qué quiere decir
  en palabras de hoy y, cuando ayuda, la palabra original (hebreo kadósh, griego agápe, metánoia, euangélion…). El script recorre las
  261 lecciones, busca esas palabras en la historia, las preguntas, las opciones, las explicaciones y el resumen, y le deja a cada
  lección hasta seis (primero las de la historia). **256 de 261 lecciones** tienen glosario (HECHO, 19-10-2026). Las definiciones son
  léxicas, no doctrinales: dicen qué significa la palabra y no toman partido en lo que los cristianos entienden de distintas
  maneras (la ficha lo aclara).
- En la app, las palabras del glosario se **resaltan** en la historia (una vez cada una, para no manchar el texto) y se tocan; abajo
  de la historia están como fichas («Palabras · toca para entender»), y cada una abre una hoja con el original y el significado.

**Qué falta.** La lista de palabras crece con cada ruta nueva (agregar a `GLOSARIO` y correr el script); el validador podría exigir
que ninguna palabra de la lista quede sin glosa en una lección (hoy el script lo garantiza al correr, pero hay que correrlo).

## 3. La intro de la lección, la bienvenida, el repaso y el globo de Lany

**La historia de la lección** (`TarjetaHistoria` en `src/pantallas/Leccion.tsx`, `src/componentes/textoRico.tsx`): una tarjeta con el
color del área; «hasta acá» en letra chica; el relato en **pasos numerados** unidos por una línea; las **citas de la Biblia en color
y semibold**; lo marcado con dobles asteriscos en las fuentes, **en negrita**; y las palabras del glosario resaltadas. El texto de
Lany y la tarjeta de lecturas se acortaron a una frase cada uno (antes eran tres). Es texto anidado: el lector de pantalla lo lee
como un párrafo.

**La bienvenida**: elegir una opción de un paso de respuesta única programaba el avance 380 ms después, y si en ese lapso se tocaba
«Siguiente», se avanzaba dos veces; ahora el botón cancela el avance programado y el avance programado solo vale si todavía se está
en ese paso. Las áreas: de quince a **ocho** («La Biblia, libro por libro» viene incluida y ya no se muestra como tarjeta que no se
puede desmarcar: era lo que daba la sensación de «no me deja»). Las preguntas: **ocho** de entrada (las más buscadas) y «Más preguntas
(11)» para el resto.

**El repaso del día**: de una franja de dos líneas a una píldora chica a la derecha («Repaso · 10 · opcional»).

**El globo de Lany**: pisaba el cartel del capítulo cuando Lany estaba en el primer nivel (por eso se mandaba abajo, donde pisaba la
puerta) y se volvía a abrir si se tocaba a Lany con la tarjeta de un nivel abierta. Ahora cada cartel deja un respiro de 72 puntos
antes del primer nivel (el globo entra arriba sin tocar nada) y, con la tarjeta abierta, Lany se ríe pero no habla.

## 4. Lany: lo que hacen las mascotas que la gente quiere, y las reacciones nuevas

**Investigación** (detalle y fuentes en `conocimiento/2026-10-19-senda-mascotas-widgets-y-juegos-en-grupo.md`):

- Duolingo anima una reacción propia por personaje **al acierto** y premia las rachas con interludios; su blog no describe reacciones
  al error: **ahí hay un espacio libre** que Lany ocupa. Lily, en la videollamada, no está preanimada: una máquina de estados mezcla
  piezas (ocho cabezas × ocho cuerpos = más de 64 reposos distintos) para que nunca se repita igual. Senda ya hace lo mismo con el
  reposo de 9,6 s y el parpadeo irregular.
- La «muerte» del búho (febrero de 2025) costó unos pocos miles de dólares y generó el doble de contenido de usuarios que anuncios del
  Super Bowl; funcionó porque antes hubo **años de personalidad coherente** y porque los memes salieron del comportamiento del producto.
  Finch genera apego porque el pájaro tiene nombre y espera; el riesgo documentado es la culpa («mi pájaro va a estar triste»).
- **Qué toma Senda**: reacciones al error graciosas y nunca burlonas; variedad; un personaje coherente durante meses antes de
  cualquier golpe de difusión; nunca culpa ni amenaza (Lany invita, no reclama; capítulo 36).

**Las reacciones nuevas** (`scripts/rive/lani.py`, cinco disparadores más, 109 animaciones en el archivo): **patatús** (se tambalea,
cae de espaldas, queda un instante y se levanta de un salto sacudiendo la cabeza; 2,4 s), **mano a la cara** (1,6 s), **mareo**
(la cabeza da vueltas, los ojos la siguen al revés, hace equilibrio con los brazos; 1,8 s), **taparse los ojos** (y espiar por un
costado; 1,7 s) y **giro** (salta y da una vuelta entera en el aire; 1,3 s, para festejar). Cada una trae su cara (dormida,
preocupada, nervios, risa). En la lección y en el Espadeo, la primera vez que se falla Lany hace el «uff» de siempre; después, una
reacción distinta cada vez, sin repetir la anterior (`reaccionAlError` en `laniRiveComun.ts`), y el ánimo llega cuando la reacción
termina. La hoja de contacto con los cuadros de cada reacción está más arriba, junto a las pantallas.

**Para que todos hablen de Lany** (HIPÓTESIS, se prueba en la difusión): las reacciones al error son el material natural de los
videos cortos (un «patatús» de dos segundos se comparte solo); los stickers ya existen; y cada mes conviene sumar un gesto nuevo
que la gente descubra sola. Nada de campañas «unhinged» hasta que Lany tenga meses de comportamiento coherente en la tienda.

## 5. La fiesta

`src/componentes/fiesta.tsx`: **confeti** (64 a 90 papelitos que salen disparados desde las dos esquinas de abajo, suben en arco y
caen girando, 2,6 s) y **globos** (siete, que suben meciéndose con su hilo). Todo en el hilo nativo y apagado con «reducir
movimiento». Dónde: al terminar una lección (globos si fue perfecta o si fue el jefe del capítulo, con el título «¡Capítulo
completo!»), al ganar una pieza y al terminar una ronda de «Nombres por letra».

**La pantalla de la pieza ganada**, rehecha como pidió el fundador: «¡Felicidades!» arriba; la pieza en 3D con Tu Lany
poniéndosela; **el tablero grande de las seis piezas** (las ganadas encendidas, la nueva con su marca y latido); «**3 de 6**» en
grande y la frase que empuja («¡Te faltan dos! Ya casi», «¡Una más y la armadura es tuya!»); el versículo de Efesios chico, al
final; sin el párrafo de explicación. Sonido: el de la pieza y, al llegar, el de fiesta.

## 6. «¿Quién es?» contra alguien, y Lany que entiende

**Contra alguien** (nuevo, elegido en la pantalla de inicio del juego): una persona elige el personaje en secreto (la pantalla pide
que la otra no mire; se confirma con «Listo, es este») y pasa el teléfono; la otra **escribe cualquier pregunta** y la primera toca
**SÍ o NO**; se bajan tarjetas y se arriesga igual que siempre. Al final, además de lo que se preguntó y se contestó, aparece lo que
la Biblia dice del personaje con cada versículo, para comprobar si las respuestas estuvieron bien: el juego sigue enseñando aunque
Lany no participe.

**Lany entiende mejor** (`entender` en `QuienEs.tsx`): además de las palabras clave tal cual, ahora reconoce raíces («profetas»,
«reinaba»), sinónimos («varón», «monarca», «AT»), errores de tipeo hasta de una letra («ejipto») y, cuando dos rasgos empatan con
una palabra entera («reina» está en «¿fue rey o reina?» y en «¿es mujer?»), gana el rasgo más específico. Una prueba con 40
preguntas naturales (HECHO, 19-10-2026): la versión de la prueba 19 entendía 26; las que faltaban eran casi todas rasgos que no
existían («¿fue a la guerra?», «¿se casó?», «¿fue sacerdote?»). Se agregaron **dos rasgos** con sus citas (guerra; esposo o esposa:
43 rasgos, 328 respuestas «sí» con versículo). Recomendación: **no sacar a Lany** (es el modo para jugar solo) y dejar «contra
alguien» como el modo de a dos.

## 7. «Vivir la historia» en grupo

El fundador lo encontró individual y con un remate flojo («el carcelero decidió distinto»). Lo que cambió:

- **Modo en grupo** (de 2 a 6 con un teléfono): en cada encrucijada cada jugador decide **en secreto** (una tapa esconde las
  opciones hasta que el que sigue la toca), se ven los votos con una ficha de color por jugador, y antes de ver lo que pasó el grupo
  **conversa un minuto** sobre una pregunta escrita para esa encrucijada («¿Alguna vez supiste lo que Dios quería y fuiste para el
  otro lado?», «¿A quién te costaría quedarte a cuidar?»): 23 preguntas de charla (`CHARLAS` en `historias_rol.py`). Después, «lo
  que pasó» y «por qué», y «2 de 3 eligieron lo mismo que Jonás». El espejo del final es de cada jugador.
- **El texto del remate**: «¡Igual que Rut!» cuando coincide; si no, «En la Biblia, Rut hizo otra cosa. Lo valioso es entender por
  qué». Nada de «decidió distinto».
- Qué queda igual: las encrucijadas reales, lo que pasó con su cita, el porqué, las láminas y el espejo (capítulo 44 §4). Mecánica de
  juego de mesa de siempre (votar a ciegas y conversar), con nombre y aspecto propios.

## 8. «Nombres por letra»

Pedido del fundador. **Cómo se juega**: sale una letra al azar (una ruleta de letras que se frena) y el grupo dice, en voz alta,
nombres de personas de la Biblia que empiecen con ella. Dos maneras: **todos juntos** (45 segundos; quien tiene el teléfono toca «+1»
por cada nombre que valga) o **dos equipos** (papa caliente: diez segundos para decir uno y pasarla; el equipo que se traba pierde la
letra; un punto por letra). **Qué enseña**: al final de cada ronda, Senda muestra todos los nombres que tiene con esa letra, con quién
es y el primer versículo del capítulo donde aparece, para leerlo ahí mismo.

**El contenido** (`scripts/autor/nombres.py` → `contenido/nombres.json`): **255 nombres** de personas (nunca títulos como «Faraón»),
cada uno con el capítulo y una línea de quién es; el script busca el nombre en el texto de la RV1909 de ese capítulo (con la grafía de
1909 cuando difiere: «Samsón», «Mardochêo», «Rhode») y arma la cita con el primer versículo donde está; si no lo encuentra, no lo
publica. Se juega con las 19 letras que tienen al menos cuatro nombres (la A tiene 36, la J 32, la S 24; la U, 2).

## 9. Calendario, Inicio y el widget

- **Evento nuevo en tres pasos** (`Evento.tsx`): **qué** (título, las plantillas de siempre y el tipo), **cuándo** (día con atajos y
  mes, hora por franjas, duración) y **listo** (un resumen con el color del tipo y «Guardar»). Lugar, enlace de video, se repite,
  avisarme, notas y foto **se quedan** (sirven para los grupos: la dirección abre Maps, el enlace abre la reunión) pero plegados en
  «Más opciones». Al editar un evento se ve todo junto, como antes.
- **¿Molesta el calendario en Inicio?** La tira de la semana se queda (abre el calendario y muestra la semana Senda); la tarjeta
  «Tu calendario» ahora aparece **solo cuando hay algo agendado**: sin eventos, no ocupaba más que un título y una frase vacía.
- **El desafío del domingo** sigue en Inicio (el desafío del día y el desafío con fecha, capítulo 42); el del líder con su PDF espera
  las cuentas (§10).
- **Widget «Versículo del día»** (`react-native-android-widget` 0.22.1, `src/widget/`): un widget de la pantalla de inicio de Android
  con la referencia y el texto del versículo de hoy en la versión que usa la persona (o la RVR1960 si el versículo está entre los
  500 permitidos), que abre Senda al tocarlo y se actualiza cada media hora. En **Android 16** los mismos widgets aparecen en la
  **pantalla de bloqueo** cuando el teléfono está en el cargador (HECHO con fuentes secundarias, marzo de 2025; verificar en cada
  marca). Se prueba por primera vez en el APK de la prueba 20: si el proceso nativo falla, el widget muestra solo la invitación a leer.

## 10. Libros, el entorno de prueba para líderes y los kits por puntos

- **Libros** (detalle en `docs/LIBROS_REFERENCIA3.md` de la app): el fundador reclasificó su biblioteca archivo por archivo (A 540,
  B 211, C 151, D 135, E 23) y borró de su copia de trabajo los de B, C y D. Cruce con el inventario de Senda: **76** de los 471
  «reconocidos» por nombre de archivo quedaron en B, C, D o E al mirar portadas y datos de edición. **Nada de esa biblioteca se usó en
  Senda**: todas las fuentes citadas en el contenido son obras de referencia estándar y fuentes primarias (se listaron los campos
  «fuente» de todo el contenido). Desde hoy manda la clasificación A del fundador.
- **Entorno de prueba para líderes** (pendiente `entorno_lider` en la Consola): antes de la prueba cerrada, dos cuentas de prueba
  (líder y Max) para subir un PDF, invitar a 2 o 3 personas y comprobar que les llega; necesita las cuentas (Supabase, capítulo 29).
- **«10 kits por puntos»**: anotado como método 12 de difusión (capítulo 44 §7.1), con su forma legal (concurso de habilidad si gana
  el puntaje; bases y autorización si se sortea) y el canje desde la app; necesita cuentas para contar puntos por iglesia.

## 11. Cómo probar la prueba 20 y lo que sigue

**Probar (pendiente probar20 en la Consola):** instalar el APK; la bienvenida desde cero (borrar datos de la app); la historia de
«Dios se da a conocer» y una palabra del glosario; fallar dos o tres preguntas y mirar a Lany; «¿Quién es?» contra alguien, «Vivir
la historia» en grupo y «Nombres por letra» con otra persona; ganar una pieza en el Espadeo; un evento nuevo desde Inicio; el widget
desde la pantalla de inicio del teléfono.

**Decisiones del fundador:** la música de inicio (Consola, sigue sin elegirse); si el widget conviene también en la ficha de la
tienda; cuándo armar las cuentas para el entorno de prueba de líderes.

**Lo que sigue:** Quién es quién capítulo 3; más libros jugables; más historias para «Vivir la historia» (ahora con su pregunta de
charla); más rasgos en «¿Quién es?» a medida que aparezcan preguntas que Lany no entienda (se miden); los nombres que falten en
«Nombres por letra»; el kit de líder y los videos con los «patatús» de Lany.
