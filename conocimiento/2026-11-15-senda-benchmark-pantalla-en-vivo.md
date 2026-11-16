# Senda: benchmark de apps de «pantalla en vivo» (tipo Kahoot) y diseño de la Pantalla de Senda

**Fecha:** 15-11-2026. **Autor:** analista de mercado del holding. **Pedido del fundador (textual):** «no deberíamos también
incorporar una página para que puedan ingresar y mientras responden y eso, que se vea en una pantalla para todos? Tipo kahoot.. UN
TOTALMENTE EXHAUSTIVO Y COMPLETO BENCHMARK DE APPS EXISTENTES CON ESTA FUNCIONALIDAD […] y lo mejor que podamos aplicar, sin plagio».

**Cómo leer las etiquetas** (regla 1 del holding):

| Etiqueta | Qué quiere decir |
|---|---|
| **[H]** | HECHO leído hoy (15-11-2026) en la fuente oficial citada |
| **[H2]** | HECHO de fuente secundaria: lo que devolvió el buscador sobre una página oficial o de un tercero, sin leer el original. Re-verificar antes de decidir plata |
| **[T]** | La fuente es parte interesada (el proveedor hablando de sí mismo o un competidor comparándose) |
| **[C]** | Conocimiento previo del analista (hasta mediados de 2026), sin verificar hoy. Vale como INFERENCIA |
| **[I]** / **[E]** / **[Hip]** | INFERENCIA (razonamiento propio) / ESTIMACIÓN (con método) / HIPÓTESIS (a validar) |

Los códigos entre paréntesis (K1, M2, R4…) remiten a la sección 8. Todos los precios son de las páginas de los proveedores: son
hechos, pero la descripción de sus virtudes es marketing.

**Límites de esta investigación:** los centros de ayuda de Kahoot!, Blooket y Quizlet devuelven 403 a la lectura directa y varias
páginas de precios se arman con JavaScript y llegan vacías; en esos casos usé el buscador y lo marqué [H2]. No probé ninguna app
con las manos (no hay navegador en este entorno): lo que se ve en cada pantalla sale de documentación, no de observación. La lista
de lo que no se pudo leer está en 8.3.

---

## 0. Veredicto y recomendación en una pantalla

**Veredicto: sí, y es chico.** Senda ya tiene el 80 % (sala con código, reloj de 20 s, la base corrige, tabla, podio, trivia del
sermón, torneos; R1, R2, R3). Lo que falta es **una página web que solo muestra** (la Pantalla) y que el teléfono del líder
maneja. Ninguna de las 49 herramientas relevadas combina las tres cosas que Senda ya tiene juntas: contenido bíblico verificado
con su cita, en español para iglesias protestantes de Latinoamérica, y una pantalla para proyectar [H: no lo encontré; eso no
prueba que no exista].

**Lo que sale el 18-12-2026 (MVP):**
1. **La Pantalla**: una dirección corta + el código de la sala. Muestra QR y código, quiénes van llegando, la pregunta, la cuenta
   regresiva, cuántos respondieron, las barras por opción, **el versículo que responde** («Escrito está»), la tabla de los cinco
   primeros y el podio con el versículo para llevar. No pide cuenta ni inicia sesión en la PC de la iglesia.
2. La gente responde **desde la app** (como hoy). El QR lleva a la sala si ya la tiene y a la tienda si no.
3. Tres arreglos que el benchmark deja a la vista: sacar a alguien de la sala y filtrar apodos antes de mostrarlos en grande;
   prueba de 40 altas desde una misma red; la sala y la Pantalla apagadas en EE. UU. (ya está la regla en `region.ts`).

**Lo que no sale el 18-12:** responder desde el navegador sin instalar («invitado»). Es lo que hacen todos los grandes y es la
mejor palanca de crecimiento, pero abre el tema de menores y de seguridad a 33 días del lanzamiento. Va en enero, antes de la Gran
Copa de Verano (30-01-2027), **salvo** que iPhone no llegue al corte del 05-12: en ese caso pasa a ser necesario para el lanzamiento
(sin él, quien tiene iPhone no puede jugar en la reunión).

**Tres decisiones que le tocan al fundador:**
1. **Dominio:** comprar un dominio propio y corto de Senda (15 letras o menos) y dejar `ministerionuevageneracion.com/senda` como
   la página del proyecto que enlaza ahí. Hay que decidirlo antes del 05-12 porque el dominio queda grabado en la app (sección 6).
2. **Tope de la sala gratis:** hoy son 10 personas sin Max (R1). Kahoot! gratis deja 40 en cuenta de aula [H: K1], AhaSlides 50
   [H: A1], Slido 100 [H2: S2], Bible Trivia Live no declara tope [H: BT1]. Con 10, el primer intento de un grupo de 25 jóvenes
   choca con el cobro antes de ver el valor. Recomiendo 40 gratis y cobrar por la trivia del sermón, las salas grandes y el informe
   del líder (decisión comercial; sección 5.0).
3. **Puntaje de la sala:** hoy es 500 + hasta 500 por rapidez (R9), el mismo rango que Kahoot! [H2: K5]. Recomiendo que la sala
   de iglesia premie acertar (800 fijos + hasta 200 por rapidez) y deje la versión rápida como opción. Toca una decisión suya de la
   prueba 33, así que se pregunta.

**Dos alertas que encontré de paso (no son del benchmark, pero pegan el día del lanzamiento):**
- Supabase limita las cuentas anónimas a **30 por hora por IP** de fábrica [H2: T2] y `docs/SEGURIDAD.md` línea 65 pide **bajar**
  ese límite. En una iglesia todos salen por la misma IP del Wi-Fi: la persona 31 que instala la app en la reunión no podría
  entrar a la sala [I]. No pude ver cómo está configurado el proyecto real; hay que mirarlo y probarlo.
- La Pantalla es una página web abierta al mundo: la regla de EE. UU. (sala apagada por la patente US 10.339.825, informe del
  14-11) tiene que aplicarse también a la página, no solo a la app [I].

---

## 1. Fichas por app

Campos: **(a)** cómo se entra · **(b)** qué se ve en la pantalla grande y qué en el teléfono · **(c)** tipos de pregunta ·
**(d)** modos · **(e)** estadísticas · **(f)** cómo se crea el contenido · **(g)** música, espera, reacciones · **(h)** moderación ·
**(i)** gratis y precios · **(j)** idiomas, sin proyector, a distancia · **(k)** críticas. Si un campo no aparece es porque no
conseguí fuente y no lo relleno de memoria.

### 1.1 Las catorce grandes

**Kahoot!** (Noruega; el estándar del formato)
- (a) Código numérico («Game PIN») en kahoot.it o en la app, QR o enlace; los jugadores no necesitan cuenta, solo el anfitrión
  [H: K2, K4]. Apodo libre; opciones del anfitrión: generador de apodos de dos palabras con hasta tres tiradas, «player identifier»
  y «2-Step Join» (después del código hay que repetir un patrón que cambia en la pantalla, contra bots) [H2: K5].
- (b) «Players answer on their own devices, while questions are displayed on a shared screen» [H: K4]. Hay un ajuste para mostrar
  también pregunta y respuestas en el teléfono [H2: K5]. De fábrica el teléfono muestra solo los cuatro botones de color con forma [C].
- (c) Gratis: quiz y verdadero/falso. De pago (planes de docentes): selección múltiple, encuesta y puzzle desde Bronze; nube de
  palabras, pin en imagen y escala desde Silver; respuesta escrita, slider, abierta y lluvia de ideas desde Gold [H: K1].
- (d) En vivo: Classic, Team (con «Team Talk» opcional) y Lecture [H2: K5]; «challenges» a ritmo propio [H: K4]; experiencia
  «Accuracy» (los puntos dependen solo de acertar, la velocidad no cuenta) y «Confidence» (apostar: si acertás suma extra, si no,
  resta) [H2: K5]; modos de juego grupales premium desde Silver [H: K2]. Puntaje: hasta 1.000 por pregunta y baja con el tiempo
  [H2: K5]; el mínimo de 500 por acierto figura en el artículo de «Confidence» [H2: K5] y como fórmula general lo conozco de antes
  [C]; hay rachas de aciertos [H2: K5].
- (e) Barras por opción después de cada pregunta, tabla y podio de tres al final [C]. Informes: los estándar piden plan de pago y
  los avanzados, Gold [H: K2].
- (f) IA desde un tema, una URL o un archivo (desde Bronze), importar diapositivas (desde Silver) [H: K1, K2].
- (g) Música de espera que el anfitrión puede silenciar o bajar [H2: K5].
- (h) Generador de apodos, patrón de dos pasos; en reseñas piden un filtro de palabras para los nombres [H2: K6].
- (i) **Gratis («Kahoot! Go»): 10 jugadores en uso personal o 40 en aula** (la propia página dice 40 en la tabla y 10 en las
  preguntas frecuentes) [H: K1, K2]. Kahoot!+ Bronze USD 3/mes (USD 36 al año), 50 jugadores; Silver USD 6 (72), 100; Gold USD 10
  (120), 200; Kahoot! One USD 19 (228), 800 — son precios de oferta de Black Friday hasta el 27-11 [H: K1]. Para empresas (Kahoot!
  360): Pro Start USD 15/mes, 50 personas; Standard USD 25, 200; Plus USD 39, 1.000; Max USD 79, 2.000 [H: K3].
- (j) Sitio en español y portugués [H: K2]. A distancia, compartiendo pantalla en la videollamada [C].
- (k) Demoras que afectan el puntaje por tiempo; «the kids don't have enough time to think»; ansiedad por el reloj; falta de filtro
  de nombres; el anonimato permite contestar al azar [H2: K6]. Desgaste con el uso repetido (sección 3).

**Mentimeter** (Suecia; presentaciones con participación)
- (a) Enlace o código, sin cuenta [H: M2]; menti.com y QR [C]. (b) Los resultados en la pantalla del presentador; la pregunta, en
  el teléfono [C].
- (c) Encuesta, quiz, sondeo, nube de palabras, preguntas del público, opción múltiple, escalas, abiertas [H: M2]; ranking, pin en
  imagen, cuadrícula 2×2 y quiz con «Select Answer», «Type Answer» y tabla [H2: M3]. (d) En vivo y a ritmo propio [H: M2].
- (e) Exportar a imagen, PDF y Excel y segmentar resultados: de pago [H: M1]. (f) IA incluida en el gratis; importar
  presentaciones, de pago [H: M1]. (h) Preguntas del público moderadas: plan Pro [H: M1].
- (i) **Gratis: 50 participantes por mes** (la tarjeta del plan dice otra cosa, «Unlimited participants once per month»: la propia
  página se contradice). Basic USD 11,99 por presentador por mes y Pro USD 24,99, facturados por año [H: M1].
- (k) El tope mensual de 50 es la queja más repetida [H2, T]. **Uso en iglesias documentado:** una iglesia metodista de Texas y un
  pastor de Columbia Británica lo usaron en el sermón; Mentimeter tiene una plantilla «Engage Your Parishioners» [H2: M4].

**Slido** (de Cisco [C]; preguntas del público)
- (a) slido.com + código de evento, QR (prendido de fábrica en todos los planes) o enlace; sin descargar ni registrarse [H2: S2].
- (c) Opción múltiple, nube de palabras, puntuación, texto abierto, ranking; quiz con reloj y tabla; **preguntas del público con
  votos, anónimas o con nombre**; lluvia de ideas [H: S1]. (e) Analíticas y exportar a Sheets, Excel o PDF [H: S1].
- (h) «Review all incoming questions before your participants can see them» [H: S1]. (j) PowerPoint, Google Slides, Teams, Zoom,
  Webex [H: S1].
- (i) Gratis: 100 participantes, 3 encuestas y 1 quiz por evento; Engage ~USD 17,50/mes facturado por año (200 personas);
  Professional ~USD 75/mes (1.000) [H2: S2; agregadores que no coinciden entre sí; la página oficial llegó sin precios].
- (k) Límites del gratis y precio alto para un solo evento [H2: S2].

**Wayground (ex Quizizz)**
- (a) wayground.com/join + código numérico (unos 6 dígitos); quizizz.com/join redirige [H2: W1]. (b) Cada uno ve la pregunta en su
  dispositivo y avanza a su ritmo [C].
- (d) Classic, Mastery Peak, Test, Team y **Paper Mode** (tarjetas impresas que el docente escanea con el teléfono; sin dispositivos
  para los alumnos); potenciadores (hasta 3, uno por vez) [H2: W1]; «pregunta de revancha» para volver a contestar una errada y
  memes entre preguntas [H2, T: W1].
- (i) Gratis («Basic»): hasta 100 alumnos, 20 actividades guardadas y menos tipos de pregunta [H2, T: W1]. Precios de pago: los
  agregadores se contradicen (de USD 59 a 125 por usuario por mes); no los doy por buenos.
- (k) Cada vez más funciones detrás del muro de pago [H2: W1].

**Blooket**
- (a) play.blooket.com + Game ID de 7 dígitos, o QR; el jugador no necesita cuenta; elige apodo y un avatar («Blook») [H2: B1].
- (b) Las preguntas se contestan en el dispositivo, a ritmo propio, dentro de un minijuego; la pantalla del anfitrión muestra el
  avance [C]. (d) Tower Defense, Crypto Hack, Battle Royale y más de 25 modos [H2, T: B1]. (g) En la sala de espera, controles de
  pantalla completa y música [H2: B1].
- (i) Gratis hasta 60 jugadores; Plus hasta 300 en la mayoría de los modos; Plus ~USD 4,99/mes facturado por año (USD 59,88) y Plus
  Flex ~USD 9,99/mes [H2: B1; dos fuentes dan cifras menores; la página oficial dio 403].
- (k) «Students are distracted on trying to get first, not answering the questions» (reseña docente en Common Sense); hilo en
  r/teaching «Blooket is bad for students»; trampas con scripts [H2: B1].

**Gimkit**
- (a) gimkit.com/join + código, QR o enlace [H2, T: G1]. (b)(d) Preguntas en el dispositivo a ritmo propio; los aciertos dan plata
  del juego para comprar mejoras [C]; muchos modos, parte de ellos limitados sin Pro.
- (i) Pro USD 14,99/mes o USD 59,88/año; gratis con los modos destacados sin tope y los demás con tope de 5 jugadores (dato del
  anuncio de Gimkit de 2020; puede haber cambiado) [H2: G1].
- (k) La competencia y la moneda pueden tapar el objetivo de aprender [T: G1]. No pasa publicidad a propósito [H2: G1].

**AhaSlides**
- (a) QR o código detrás de ahaslides.com/; sin app [H2: A2].
- (c) 41 tipos de diapositiva a noviembre de 2026 (30 interactivas): lluvia de ideas en tres pasos (proponer, votar, mostrar el
  ranking), ordenar, clasificar, unir pares, nube de palabras, ruleta, encuesta, escala, dibujar la respuesta, pin en imagen,
  carrera de patos, verdadero/falso, tablero de ideas, matriz 2×2 [H2, T: A2].
- (i) Gratis: hasta 50 participantes en vivo y presentaciones sin tope [H: A1]. Essential ~USD 7,95/mes y Pro ~USD 15,95/mes
  [H2: A2; no quedó claro si es facturación mensual o anual].

**Poll Everywhere**
- (c) Opción múltiple, nube de palabras, preguntas del público con voto a favor y en contra, imagen cliqueable (el voto queda como
  un pin), sondeo, abierta, competencia, ranking [H2: P2]. (h) Moderación en nube, preguntas y abiertas; filtro de malas palabras
  [H2: P2]. (a) pollev.com/usuario o por SMS [C].
- (i) Gratis: 40 personas. Present USD 10/mes (USD 120 al año), 700; Engage USD 49/mes anual (USD 99 mensual); Teams USD 84/mes
  anual [H: P1].

**Socrative**
- (a) Nombre de «sala» que comparte el docente; los alumnos no tienen cuenta y usan gratis cualquier dispositivo [H: So1; H2: So2].
- (d) Quiz, **Space Race** (equipos o individuos mueven su cohete por la pantalla al acertar), Exit Ticket (tres preguntas de
  cierre) y Quick Question (opción múltiple, verdadero/falso o respuesta corta, que después se puede votar) [H2: So2].
- (e) Resultados en vivo e informes por correo o descarga [H2: So2].
- (i) Gratis: 50 alumnos, 1 sala, 5 quizzes. Essentials USD 10/mes (USD 120 al año). Pro USD 16,67/mes (USD 200,04 al año), 300
  alumnos [H: So1].

**Crowdpurr** (eventos y bares)
- (d) **Survivor** (quien erra queda afuera; gana el último), **apuesta de puntos**, equipos básicos (responde el capitán) y
  avanzados (todos responden; ranking individual y por equipo), torneos, bingo, muro social [H: C1; H2: C2].
- (i) Gratis: 20 participantes, 15 preguntas, con logos y anuncios. Classroom USD 49,99/mes o USD 24,99/mes pagando el año (USD
  299,94), 100 personas; Seminar USD 149,99/mes, 500 [H: C1].

**Jackbox Games** (juegos de fiesta, no encuestas)
- (a) jackbox.tv + el código de sala que muestra la pantalla; el teléfono es el control; solo el anfitrión compra e instala el
  paquete [H: J1]. Código de cuatro letras, por navegador [H2: J2].
- (b) Todo pasa en la pantalla compartida; el teléfono sirve para escribir, dibujar y votar [H: J1]. (d) Unos 8 jugadores y el resto
  entra como público que vota [H2: J2].
- (h) Ocultar el código de sala, exigir cuenta de Twitch, contraseña de moderador para aprobar o rechazar lo que la gente escribe
  antes de que salga en pantalla [H2: J2]. (j) A distancia compartiendo pantalla por Discord o Zoom [H: J1].
- (i) Se paga por paquete; no leí el precio.

**Quizlet Live**
- (a) Código; con la app, QR [H2, T: Q1]. (d) Equipos al azar de 2 a 4 o individual; **un error del equipo vuelve su avance a
  cero** [H2: Q1]. (i) No verificado (la página oficial dio 403).

**Wooclap** (universidades)
- (c) 21 formatos; modo competencia [H2: Wo2]. (h) Modo moderador en Pro [H: Wo1].
- (i) Gratis («Starter»): hasta 1.000 participantes y 5 preguntas por mes [H: Wo1]. Basic ~USD 13/mes y Pro ~USD 25/mes facturados
  por año [H2: Wo2, captura de un tercero del 16-10-2026; otras fuentes dan EUR 14,99 y 24,99].

**Vevox**
- (c) Encuestas, preguntas del público anónimas, quiz con tabla; nube de palabras en planes de pago [H2: V2].
- (i) Gratis hasta 100 participantes (no está claro si es plan permanente o prueba); Education Starter GBP 5 y Business Starter
  GBP 8 por usuario por mes [H2: V2; la página oficial no muestra precios].

### 1.2 Las demás (ficha corta)

| App | Cómo funciona y qué la distingue | Gratis y precio | Fuente |
|---|---|---|---|
| **Nearpod** | Lección con código; actividades: Time to Climb (quiz con carrera), Draw It, encuesta, tablero colaborativo, pares, memoria | Gratis 40 por lección; Gold USD 159/año (75); Platinum USD 397/año (90) | [H: N1] |
| **Pear Deck** | Diapositivas con preguntas; el alumno puede entrar anónimo; arrastrar y dibujar son de pago | Gratis; Premium USD 149/año | [H: PD1] |
| **Plickers** | **Sin dispositivos para el público:** cada uno levanta una tarjeta de papel girada según su respuesta y el docente las escanea con su teléfono | Gratis; Pro ~USD 5,99–8,99/mes (fuente sin fecha) | [H2: Pl1] |
| **Baamboozle** | **Una sola pantalla y equipos**; nadie usa teléfono; el docente toca el tablero | Gratis 4 equipos y 24 preguntas; Baamboozle+ ~USD 7,99/mes, 8 equipos | [H2: Ba1] |
| **Genially** | Presentación interactiva con sesión en vivo: QR o código de 6 dígitos, sala de espera, ranking | Gratis 50 por sesión; Pro EUR 6/mes; Master EUR 20/mes (200) | [H: Ge1; H2: Ge2] |
| **Quizalize** | Quiz con juegos de equipo y vista de aula | Gratis ~50 en vivo; Standard USD 9,99/mes | [H2: Qz1] |
| **Formative** | Evaluación con respuestas en vivo para el docente; sin plan gratis en la página | Classroom USD 249/año | [H: Fo1] |
| **ClassPoint** | Dentro de PowerPoint; estrellas, niveles, insignias y tabla en todos los planes | Gratis 25 por clase y 5 actividades; Pro USD 8/mes (200) | [H: CP1] |
| **Slides With Friends** | QR sin descargar; opción múltiple, respuesta escrita, votar las respuestas de otros, «pasar el micrófono», compartir fotos, nube de palabras, **botonera de sonidos** que el anfitrión puede silenciar | Gratis 10; Starter USD 8/mes anual (50); Pro USD 24/mes (250) | [H: SW1] |
| **CrowdParty** | Juegos por QR, código o enlace, sin instalar | Gratis ~10 por sala; pagos entre ~USD 18 y 36/mes (fuentes que no coinciden) | [H2: CrP1] |
| **TriviaMaker** | Tablero de categorías, lista, ruleta, tatetí, ahorcado; modo «Crowd» con teléfonos y modo con pulsador | Gratis 2 equipos o 20 en Crowd; Premium USD 6,99/mes o 19/año (50); Plus USD 39,99/año (200) | [H: TM1] |
| **Factile** | Tablero de categorías con pulsador en el teléfono | Gratis 3 juegos y 5 equipos, sin pulsador; desde USD 48/año | [H2: Fa1] |
| **StreamAlive** | El público participa **escribiendo en el chat** de Zoom, Meet, Teams o YouTube; en persona, código o QR; mapas, nubes, ruleta | Gratis 5 personas; Starter USD 25/mes anual; paquete de 4 sesiones USD 100 | [H: SA1] |
| **Sendsteps** | Presentaciones con IA y más de 20 tipos de pregunta | Gratis sin tope de participantes; Starter ~USD 6,50 y Professional ~USD 13,50/mes | [H: Se1; H2] |
| **DirectPoll** | Encuesta sin cuenta: un enlace para votar, otro para mostrar resultados y otro privado («cockpit») para avanzar | Gratis, sin anuncios; 500 votantes a la vez | [H: DP1] |
| **myQuiz** | Quiz en línea para eventos grandes | Desde ~USD 9,99–11/mes; el gratis tiene límites que no pude leer | [H2: MQ1] |
| **QuizBreaker** | Rompehielos para equipos de trabajo, por correo y en vivo | USD 39/mes anual (100 usuarios); sin plan gratis | [H: QB1] |
| **Zeetings** | Presentaciones con encuestas | ~USD 20/mes; no está claro si tiene gratis | [H2] |
| **Quizgecko** | Genera quizzes con IA; no encontré modo en vivo | — | [H2] |
| **Poll Junkie** | Encuestas sin registro con resultados en vivo | Gratis (directorios; el sitio no cargó) | [H2] |
| **Swift Polling** | **Cerró:** el dominio está en venta | — | [H: redirige a HugeDomains] |
| **Tricider, Votify** | Sin datos: el buscador no devolvió nada útil (Votify es el nombre de varios proyectos distintos) | — | — |

### 1.3 Las bíblicas y las de iglesia (el competidor directo)

**Bible Trivia Live** (bibletrivialive.com) — lo más parecido a lo que pide el fundador [H: BT1]
- Web, sin app ni cuenta: el anfitrión arma un «Group Game», elige categoría y dificultad, y sale un PIN y un QR; cada uno pone un
  nombre. Botón «Open big screen» para la tele o el proyector; por Zoom se comparte esa pantalla.
- 10 preguntas, 15 segundos, **dos intentos por pregunta** (el segundo vale más o menos la mitad), tabla después de cada pregunta.
  Banco de «more than 1,000» preguntas; categorías por dificultad, por Testamento y por tema (familia, oración, fe).
- Gratis para el anfitrión y los jugadores. Proyecto personal de Paul Mazzapica Sr. (Clearwater, Florida). No dice idiomas (todo
  indica solo inglés) ni cómo modera los nombres.

**Bible Live Quiz: Group Trivia** (Royal Nation LLC; iPhone y Android) — competidor nuevo y activo [H: BL1]
- El anfitrión conduce; los jugadores entran con código de sala o QR; «TV Cast» y un **enlace de pantalla para compartir** que
  convive con ProPresenter, EasyWorship, OBS y Zoom; respuestas en tiempo real, reloj, tabla; preguntas propias mezcladas con sus
  bancos. Las notas de versión dicen que las pantallas del jugador, del anfitrión y del proyector están en diez idiomas (no pude
  confirmar que el español sea uno).
- **Gratis hasta 10 personas por evento**; Pro USD 4,99/mes, USD 29,99/año o USD 49,99 de por vida; además vende créditos. 13+.
  Una sola calificación en la tienda de EE. UU. Once versiones entre el 22 de mayo y el 31 de octubre (la tienda no muestra el año;
  por el número de la app, 2026 [I]).

**Kerygma** (kerygma.one; iPhone y Android) [H: Ke1]
- Trivia con salas por código de cinco caracteres o enlace; cada uno en su teléfono, tabla compartida. «Every answer opens the
  verse it came from», con un comentario corto. Pasar el teléfono entre 2 a 8. **En español (Reina Valera)**, inglés y rumano.
- Prueba de 7 días; después USD 4,99/mes o USD 29,99/año. No menciona pantalla para proyectar.

**Faith Family Showdown** (faithshowdown.com) [H: FS1]
- Tablero en la tele con código y QR; el teléfono del capitán es el pulsador de su equipo; dos equipos; formato de encuesta («qué
  contestó la gente») que se parece a Family Feud; el sitio aclara que es independiente. Paquete inicial gratis y paquetes temáticos
  de pago único. Lo que escriben los jugadores no se filtra.

**Otras:** Bible Jeopardy (web con pulsador desde el teléfono; usa un nombre de formato ajeno) [H2]; **Impostor Bíblico** (iPhone;
deducción social con salas por código, de 3 a 10; Premium USD 2,99 por semana, 9,99 por año o 14,99 de por vida; menciona español y
portugués) [H: IB1]; Superbook (CBN): trivia para chicos, de a uno; no encontré modo grupal [H2]; **YouVersion Events**: notas del
sermón, versículos y enlaces dentro de la app de la Biblia, gratis para iglesias; **no encontré encuestas ni quiz en vivo** [H2: YV1];
Gloo Polls, Pastor Notes, Pushpay y Clearstream ofrecen encuestas durante el culto (lo dicen sus propias páginas) [H2, T]. De
Subsplash y Planning Center no encontré nada en vivo. Los blogs de pastoral juvenil recomiendan Kahoot!, Quizizz y Gimkit con
preguntas propias [H2].

**Lectura del analista [I]:** en inglés ya hay dos productos con la mecánica completa (uno gratis, otro de pago y moviéndose rápido).
En español, la búsqueda devolvió Kahoot!, AhaSlides y juegos de un solo teléfono. La pantalla sola se copia en semanas; lo difícil de
copiar es lo que Senda ya tiene detrás.

---

## 2. Matriz comparativa

| App | Se entra por | ¿Cuenta? | La pregunta se lee en | Ritmo | Lo que la distingue | Equipos | Qué muestra la pantalla al cerrar cada pregunta | Tope gratis | Pago desde |
|---|---|---|---|---|---|---|---|---|---|
| Kahoot! | Código, QR, enlace; web o app | No | La pantalla (el teléfono, botones) | Anfitrión | Rapidez, música, podio | Sí | Barras por opción y tabla [C] | 10 o 40 | USD 3/mes (50) |
| Mentimeter | Código, QR, enlace; web | No | El teléfono | Anfitrión o propio | Nube de palabras, escalas | — | Gráfico en vivo | 50 por mes | USD 11,99/mes |
| Slido | Código, QR, enlace; web | No | El teléfono | Anfitrión | Preguntas del público con votos | — | Resultados y tabla del quiz | 100 (3 encuestas) | ~USD 17,50/mes |
| Wayground | Código; web o app | No | El teléfono | Propio | Potenciadores, revancha, modo papel | Sí | Avance y tabla | ~100 | No verificado |
| Blooket | Game ID o QR; web | No | El teléfono | Propio | Minijuegos y avatares | Según modo | Avance del juego | 60 | ~USD 4,99/mes |
| Gimkit | Código, QR; web | No | El teléfono | Propio | Plata del juego y mejoras | Sí | Avance del juego | Modos limitados | USD 14,99/mes |
| AhaSlides | Código o QR; web | No | Ambos | Anfitrión o propio | 30 tipos; ruleta, lluvia de ideas | Sí [C] | Gráfico y tabla | 50 | ~USD 7,95/mes |
| Poll Everywhere | Enlace, SMS; web | No | El teléfono | Anfitrión | Imagen cliqueable, votos | — | Gráfico en vivo | 40 | USD 10/mes |
| Socrative | Nombre de sala; web o app | No | El teléfono | Ambos | Carrera de cohetes, cierre de tres preguntas | Sí | Tabla de respuestas | 50 | USD 10/mes |
| Crowdpurr | Código o QR; web | No | Ambos | Anfitrión o propio | Eliminación, apuesta, torneos | Sí (dos formas) | Ranking individual y por equipo | 20 | USD 24,99/mes |
| Jackbox | Código de 4 letras; web | No | La pantalla | Juego | Escribir, dibujar y votar; público | Según juego | El resultado de la ronda | Se compra | Por paquete |
| Quizlet Live | Código o QR | No [C] | El teléfono | Equipo | Un error vuelve a cero | Sí (al azar) | Carrera de equipos | No verificado | No verificado |
| Wooclap | Código, QR; web | No | El teléfono | Ambos | 21 formatos; universidad | — | Gráfico en vivo | 1.000 (5 preguntas/mes) | ~USD 13/mes |
| Bible Trivia Live | PIN o QR; web | No | Pantalla y teléfono | Anfitrión | Bíblica; dos intentos | — | Tabla tras cada pregunta | No declara | Gratis |
| Bible Live Quiz | Código o QR; app | — | Pantalla y teléfono | Anfitrión | Bíblica; enlace de pantalla para ProPresenter y OBS | — | Tabla | 10 | USD 4,99/mes |
| **Senda hoy** | Código o enlace; **solo app** | Anónima, sola | El teléfono | Anfitrión | Preguntas con cita; trivia del sermón | No | (no hay pantalla) | 10 | USD 3,99/mes (Max, 500) |

Las celdas de la matriz que no tienen fuente propia en la sección 1 (sobre todo «la pregunta se lee en» y «ritmo») son [C].

**Patrones comunes [I a partir de los hechos de arriba]:**
1. **Nadie pide cuenta ni app al que juega.** Las catorce grandes dejan entrar por navegador. Senda es la excepción.
2. **Tres piezas siempre:** una dirección corta, un código y un QR. Varias compraron un dominio aparte solo para entrar
   (kahoot.it, menti.com, jackbox.tv, pollev.com, vevox.app, joinpd.com) [C para los que no figuran con fuente arriba].
3. **Dos familias.** «El anfitrión marca el ritmo y la pregunta está en la pantalla» (Kahoot!, Mentimeter, Slido, Jackbox): sirve
   para una reunión. «Cada uno a su ritmo en su teléfono» (Blooket, Gimkit, Wayground): sirve para un aula con tarea; en un salón
   cada uno termina mirando su teléfono. Para una reunión de jóvenes va la primera.
4. **Lo gratis alcanza para una clase, no para un evento:** 40 a 100 personas (salvo Kahoot! personal, Slides With Friends y Bible
   Live Quiz, con 10).
5. **Se cobra por tamaño de sala, tipos de pregunta, informes, IA y marca propia.** Casi nadie cobra al que juega.
6. **La moderación llega tarde y como función de pago** (Mentimeter Pro, Slido, Wooclap Pro); Jackbox es el que mejor la resolvió
   para pantallas públicas.

---

## 3. Qué dice la evidencia

| # | Hallazgo | Fuente | Qué significa para Senda |
|---|---|---|---|
| 1 | Los sistemas de respuesta del público tienen un efecto **chico pero significativo** en lo que se aprende y **casi mediano** en motivación y participación (metaanálisis) | Hunsu, Adesope y Bayly, *Computers & Education* 94, 2016 [H2: E5] | La pantalla ayuda sobre todo a que participen; el aprendizaje hay que diseñarlo (la cita y la explicación después de cada pregunta) |
| 2 | Revisión de 93 estudios sobre Kahoot!: efecto positivo en rendimiento, dinámica del aula y actitud; en casi todos los que lo midieron, **menos ansiedad** que con métodos tradicionales | Wang y Tahir, *Computers & Education* 149, 2020 [H2: E1; el dato de la ansiedad llegó por un resumen que en parte es del blog de Kahoot!, T] | El formato funciona |
| 3 | La misma revisión lista lo que les molesta a los alumnos: conexión poco confiable, **preguntas difíciles de leer en la pantalla proyectada**, no poder cambiar la respuesta, **presión del tiempo**, poco tiempo, **miedo a perder** y no poder remontar después de un error | Resumen del artículo, de memoria [C]; verificar en doi 10.1016/j.compedu.2020.103818 | Letra grande y textos cortos; tiempo generoso; puntaje que no castigue un error temprano; que perder no humille |
| 4 | Usar Kahoot! en todas las clases durante cinco meses baja apenas la motivación; lo único significativo fue la dinámica del aula | Wang, *Computers & Education* 82, 2015 [H2: E2] | Variar el formato semana a semana (trivia, dos opciones, reflexión, por equipos) |
| 5 | Con y sin puntos, con y sin música: cambian la concentración, las ganas y la diversión; **el aprendizaje no cambia** | Wang y Lieberoth, ECGBL 2016 [H2: E3, de las diapositivas] | La música y los puntos hacen la fiesta; no reemplazan el contenido |
| 6 | Un curso con tabla de posiciones e insignias durante 16 semanas terminó con **menos** motivación, satisfacción y nota final que el mismo curso sin eso | Hanus y Fox, *Computers & Education* 80, 2015 [H2: E4] | La tabla es para la noche del juego, no un ranking permanente del grupo; sumar una meta de todos juntos |
| 7 | Levantar la mano engaña: con respuesta anónima cambia lo que la gente contesta y cuánta participa; ayuda contra la timidez y el «seguir al grupo» | Levy, Yardley y Zeckhauser (JoSoTL); Barr, JCAL 2017; Stowell, Oldham y Bennett, 2010 [H2: E6] | Las preguntas de reflexión, anónimas |
| 8 | Equipos contra individual: los estudios directos son pocos y chicos; la idea de que los equipos bajan la presión es razonable pero no está probada | Búsqueda del 15-11 (INTED 2025; Samuel et al. 2026) [H2: E7] | Es una hipótesis: medirla en Senda |
| 9 | En reseñas de usuarios, la queja de fondo de Kahoot! es el reloj. Kahoot! mismo sumó un modo donde la velocidad no cuenta y en su foro piden poder apagarla | Capterra y G2; soporte de Kahoot! [H2: K5, K6] | Hay demanda de «acertar antes que apurarse» |

Aviso: Kahoot! publica en su blog estudios que lo favorecen (menos estrés, etc.); es fuente interesada y no los uso como prueba
[T: E8]. El efecto de «recordar para aprender» (practicar la recuperación) lo conozco de la literatura [C], pero no lo verifiqué hoy.

---

## 4. Lo legal: qué no tocar y qué es de todos

No soy abogado y esto no reemplaza la sesión de revisión legal previa al lanzamiento (DEC-2026-11-10-5). Conviene sumarle esta lista.

### 4.1 Lo que Senda no usa

| Elemento | De quién | Estado | Etiqueta |
|---|---|---|---|
| El nombre **KAHOOT!** y el logo «K!» | Kahoot! AS | Marca registrada en EE. UU. (reg. 5420892, clases 9, 41 y 42); «KAHOOT! LIVE» registrada en 2025; su guía de marca prohíbe crear términos o logos que la incluyan | [H2: K7] |
| Los **cuatro botones de color con forma** (triángulo, rombo, círculo, cuadrado) | Kahoot! | No encontré un registro de esas formas (no consulté TSDR ni EUIPO directamente). Aunque no estuviera registrado, el conjunto es su aspecto distintivo y copiarlo es el caso típico de confusión | [H2: no encontrado] + [I] |
| La **música** de espera y de cuenta regresiva de cualquier app | Cada proveedor | La música tiene derecho de autor desde que existe, sin registro | [I]; verificar con Ley 11.723 |
| «Game PIN» como rótulo | Kahoot! lo usa | No verifiqué si está registrado. Senda ya dice «el código» | [I] |
| **«Blooks»**, los nombres de los modos de Blooket y de Gimkit, **Quiplash, Fibbage, Drawful** y demás títulos de Jackbox | Cada proveedor | Nombres comerciales propios | [C] |
| Formatos de televisión: **Jeopardy!**, **Family Feud**, **El Rosco** | Sus productoras | Senda ya descartó El Rosco (prueba 47). Faith Family Showdown y «Bible Jeopardy» caminan por el borde; no seguirlos | [C] |
| «Kahoot», «Mentimeter», etc. en la ficha de la tienda, en palabras clave o en anuncios | — | Usar la marca de otro para atraer búsquedas es justo lo que una marca impide, y las tiendas lo prohíben en los metadatos | [C]; verificar la política de Play |
| **La sala y la Pantalla en EE. UU.** | Interstellar Inc. (patente US 10.339.825) | Demandó a Kahoot! en Texas (W.D. Tex., 1:24-cv-00727, 28-06-2024), causa suspendida; la USPTO rechazó revisar la patente (IPR2025-00696); el Circuito Federal rechazó el recurso el 25-02-2026; Kahoot! fue a la Corte Suprema (26-198), en la conferencia del 04-12-2026. Las reivindicaciones no fueron juzgadas y **no las leí** | [H: L2; H2] |

### 4.2 Lo que es mecánica general

Entrar con un código, un QR o un enlace; una pantalla del anfitrión; el teléfono como control; cuenta regresiva; barras con
cuántos eligieron cada opción; tabla de posiciones; podio; sala de espera con los nombres que llegan; apodos sorteados; equipos;
eliminación; apostar puntos; nube de palabras; preguntas del público con votos.

- **[H]** Cada una de esas mecánicas aparece en varios productos independientes de este benchmark (secciones 1 y 2).
- **[I]** Por eso son ideas y funciones, no la expresión de alguien: el derecho de autor protege cómo se expresa un juego, no la
  idea ni el método para jugarlo. El límite lo marca *Tetris Holding v. Xio* (D.N.J. 2012): las reglas son libres, pero un clon que
  copia el aspecto fue infracción [H2: L1]. En Argentina rige el mismo principio (Ley 11.723) y además la competencia desleal por
  confusión [C; verificar en la revisión legal].
- **[I]** La regla práctica: mecánica de todos + **nombre, colores, formas, música, textos y personaje propios**. Dos cosas ayudan
  a alejarse de Kahoot! sin perder nada: las opciones se identifican con **letra y posición** (A, B, C, D), con la paleta de Senda y
  nunca con cuatro colores con formas; y el puntaje de la sala deja de ser 500 a 1.000 por rapidez.
- **[C]** «QR Code» es marca de Denso Wave; la tecnología se usa libremente. En pantalla alcanza con «escanea el código».

**Las patentes son territoriales** [H2: informe del 14-11]: fuera de EE. UU. esa patente no aplica. La Pantalla web tiene que
respetar la regla que ya está en `src/util/region.ts` (línea 72: `salaEnVivo: false` para EE. UU.).

---

## 5. Diseño propuesto para Senda

### 5.0 Quién paga, cuánto y contra qué (lo que ordena todo lo demás)

- **Quién usa:** jóvenes de 13 a 30 en la reunión. **Quién decide:** el líder de jóvenes, casi siempre voluntario. **De qué
  presupuesto:** su bolsillo o la caja chica del ministerio [Hip: no hay entrevistas todavía].
- **Qué intenta lograr:** que la reunión arranque con energía, que participen los callados y saber qué quedó del mensaje. **Qué le
  cuesta hoy:** tiempo de preparar preguntas y el riesgo de que la técnica falle delante de todos [Hip].
- **La alternativa real y su precio:**

| Alternativa | Precio | Límite | Fuente |
|---|---|---|---|
| Preguntas en voz alta, papel o diapositivas («no hacer nada») | USD 0 + el tiempo del líder | No mide nada | — |
| Kahoot! gratis con preguntas propias | USD 0 | 10 o 40 jugadores; solo quiz y verdadero/falso | [H: K1] |
| Kahoot!+ Bronze / Silver | USD 36 / 72 al año | 50 / 100 jugadores | [H: K1] |
| Bible Trivia Live | USD 0 | En inglés | [H: BT1] |
| Bible Live Quiz Pro | USD 29,99 al año | Gratis hasta 10 | [H: BL1] |
| Kerygma | USD 29,99 al año | Sin pantalla | [H: Ke1] |
| **Senda Max** | **USD 3,99 por mes (USD 47,88 en doce meses)** | Sala hasta 500 + 8 trivias del sermón; gratis hasta 10 | R1; DEC-2026-11-10-1 |

- **Lo que salta a la vista [I]:** el líder compara contra Kahoot! gratis de 40. Con un tope gratis de 10, Senda pierde antes de
  mostrar lo que tiene. La sala es además el mejor canal de difusión: cada reunión pone la app delante de todo un grupo. Conviene
  regalar la sala hasta el tamaño de un grupo normal y cobrar por lo que cuesta plata o ahorra tiempo (trivia del sermón, salas
  grandes, informe del líder).
- **Tamaño, de abajo hacia arriba [E]:** unidades = líderes con Max; ticket = USD 3,99 × 0,85 (comisión de la tienda) = USD 3,39
  netos por mes. Con el supuesto que ya usa `scripts/economia/capacidad.py` (3 líderes con Max cada mil personas activas; es un
  supuesto, no un dato):

| Personas activas por mes | Líderes con Max | Ingreso neto por mes |
|---|---|---|
| 5.000 | 15 | USD 51 |
| 25.000 | 75 | USD 254 |
| 100.000 | 300 | USD 1.017 |

  Para USD 1.000 netos por mes hacen falta unos 295 líderes pagando. **La Pantalla no es una línea de ingreso: es el motor de
  altas.** No tengo un dato verificado de cuántos grupos de jóvenes protestantes hay en Latinoamérica y no lo invento; se consigue
  por denominación (anuarios) o midiendo cuántos grupos se crean en la app.
- **Qué impide que nos copien en seis meses [I]:** la pantalla, nada. Lo que no se copia rápido: 5.136 preguntas vivas y 11.007 de
  la Travesía, cada una con su cita y revisadas contra el texto; la trivia del sermón; grupos, torneos y copas ya armados; Lany; el
  ministerio aliado; y que lo que se juega el sábado sigue en la semana dentro de la app.

### 5.1 (a) Lo que sale el 18-12-2026

**La Pantalla** es una página que solo muestra. El líder la abre en la PC o la tele de la iglesia, escribe el código de su sala y
listo. Su teléfono es el control (los botones que ya tiene en `Sala.tsx`: empezar, ver respuesta, siguiente, podio). El patrón de
«una pantalla para mostrar y otra privada para manejar» lo usan DirectPoll y Bible Live Quiz [H: DP1, BL1].

| Momento | Qué muestra la Pantalla | Qué ve el teléfono (como hoy) |
|---|---|---|
| Espera | QR grande, la dirección corta, el código, «llegaron 23», los apodos entrando de a uno, Lany esperando, música suave | El código y la lista |
| Pregunta | La pregunta en grande, las opciones con letra (A a D), la barra del tiempo, «respondieron 18 de 23» | Pregunta y opciones |
| Respuesta | Barras con cuántos eligieron cada opción, la correcta marcada, **«Escrito está»: la cita y el versículo**, la explicación de una línea | Si acertó y cuánto sumó |
| Entre preguntas | Los cinco primeros y quién subió más | Su puesto |
| Final | Podio, el versículo «Para el camino», QR para seguir en la app | Podio |

Requisitos, cada uno con su porqué:
- **Sin cuenta en la PC y sin poder tocar nada:** la PC de la iglesia es de todos. Quien tenga el código solo puede mirar.
- **Legible desde el fondo** (hallazgo 3 de la evidencia): preguntas de hasta unas 90 letras y opciones de hasta 40 [Hip: medirlo
  con un proyector real y la luz prendida]; márgenes para teles que recortan el borde.
- **Nunca color solo:** letra, posición y color (accesibilidad, y distancia del aspecto de Kahoot!).
- **El sonido arranca con un clic** («Empezar» en la Pantalla): los navegadores no dejan sonar sin un gesto [C]. Música de Kevin
  MacLeod con su crédito, como en la app.
- **Los tres idiomas** de la interfaz. **Apagada en EE. UU.**, igual que la sala.
- **En la base:** hoy la sala no devuelve cuántos eligieron cada opción ni el texto de las preguntas del Espadeo (cada teléfono las
  saca de su banco; R2). La Pantalla necesita una lectura pública de solo lectura por código que devuelva estado, textos, conteo por
  opción y los primeros puestos, y que entregue la respuesta correcta recién cuando el líder la revela [I: es trabajo del
  constructor; lo dejo como requisito].
- **Apodos en grande:** con las búsquedas que hice no encontré en el repo un filtro automático de palabras ni una función para
  sacar a alguien de la sala (sí normas, denuncias, bloqueo y cola del administrador; R6). En un teléfono alcanza; en una pantalla
  delante de la iglesia, no. Para el 18-12: que el líder pueda sacar a alguien con un toque y que la Pantalla muestre los apodos
  recién cuando pasan el filtro. Verificar si ya existe con otro nombre.
- **A distancia:** se comparte la pestaña en la videollamada, como hacen todos [H: J1, BT1].

**¿Responder desde el navegador sin instalar?**

| | A favor | En contra |
|---|---|---|
| Crecimiento | Es lo que hacen las catorce grandes [H]. Instalar unos 89 MB (lo que pesaba el APK 33) con los datos del teléfono en los dos minutos de espera deja gente afuera [I]. Quien jugó como invitado ve al final «guarda tu puntaje en Senda» y la instala en su casa | Menos instalaciones en el momento; el invitado no ve la Travesía ni la Biblia |
| iPhone | Si iPhone no llega al corte del 05-12, es la única forma de que jueguen | — |
| Menores | Con apodo sorteado y sin guardar nada, casi no hay dato personal [I] | Se saltea la edad antes de la cuenta y el consentimiento por datos de fe que la app ya pide (prueba 55). Hay que pasarlo por la revisión legal |
| Moderación | Con apodos sorteados no hay texto libre que filtrar | Con apodo libre, cualquiera con el código escribe en la pantalla de la iglesia |
| Seguridad | — | Una puerta nueva sin cuenta, a 33 días, después de cerrar 14 ataques (R6) |
| Costo | No crea cuentas en Supabase (no suma usuarios activos ni choca con el límite por IP) si se hace como «invitado de sala» | Un segundo cliente para mantener |

**Recomendación:** el 18-12 sale la Pantalla y se entra por la app. El invitado web se construye enseguida, en su versión mínima
(solo opción múltiple, apodo sorteado de una lista propia, sin cuenta, nada guardado después de la sala, sin anuncios ni
estadísticas), y sale en enero. **Reglas de corte:** (1) si el 05-12 iPhone no entra, el invitado pasa a ser condición del
lanzamiento; (2) si en las primeras cuatro semanas menos del 70 % de quienes abren el enlace de una sala terminan adentro (se mide:
visitas a la página de entrada contra entradas a la sala), se adelanta todo lo demás [Hip: el 70 % es un umbral inicial].

**Para que el QR rinda desde el primer día:** hoy la página de entrada intenta abrir `senda://unirme/CÓDIGO` y, si no hay app,
dice «Pronto en Google Play» (R7). Al lanzar tiene que llevar a la tienda con el código de la sala adentro, para que al abrir la app
recién instalada la persona caiga en su sala sin escribir nada. Play lo permite con el referente de instalación [C: verificar].

### 5.2 (b) Lo que va después (2027)

| Cuándo | Qué | Por qué en ese orden |
|---|---|---|
| Enero (antes del 30-01, Gran Copa de Verano) | Invitado web; «El cruce»; puntaje «Acierto primero»; «Para repasar» | Lo que más mueve participación y repetición |
| Febrero–marzo (Brasil el 01-03) | «Tribus» (equipos); «Pausa» con «Voces» moderadas; «La senda se ilumina»; todo en portugués | Variedad contra el desgaste (hallazgo 4) |
| Pascua 2027 | Copa de Pascua entre iglesias, cada una con su Pantalla y la tabla por grupo en vivo | Es el gran hito del año |
| Segundo trimestre | «Abecé en vivo»; «Pregunta sin miedo»; modo sin teléfonos | Formatos nuevos con lo que ya existe |
| Cuando lo pida la carga (~25 mil personas por mes, R4) | Pasar la sala a tiempo real | Ya previsto en `docs/ESCALA.md` |

### 5.3 (c) Catorce ideas propias para iglesias

| # | Idea | Por qué | Lo más parecido que existe |
|---|---|---|---|
| 1 | **«Escrito está»**: después de cada pregunta, la cita y el versículo que la responde, en grande | La misión es que conozcan la Palabra; la pregunta es la excusa. Los datos ya están (`cita` y `explica`, R2) | Kerygma abre el versículo, pero en el teléfono [H: Ke1]. Ninguna lo proyecta |
| 2 | **«Acierto primero»**: 800 puntos por acertar + hasta 200 por rapidez; opción «sin reloj a la vista» | Presión del tiempo y miedo a perder son las quejas de fondo (evidencia 3 y 9) | Experiencia «Accuracy» de Kahoot! [H2: K5] |
| 3 | **«El cruce»**: preguntas de dos opciones, sin puntos; la pantalla se parte en dos y se llena en vivo; la última tiende el puente al tema | Rompehielos: todos opinan y nadie queda mal. Usa la encuesta que ya existe | Encuestas de Mentimeter y Slido; nadie lo arma como formato de dos mitades |
| 4 | **«Pausa»**: una pregunta de reflexión sin puntos ni nombres; las respuestas salen como **«Voces»** (nube de palabras) cuando el líder las aprueba en su teléfono | El anonimato cambia lo que la gente se anima a decir (evidencia 7) | Nube de Mentimeter; moderación previa de Slido y Jackbox [H: S1; H2: J2] |
| 5 | **«Tribus»**: equipos por mesa o célula; el puntaje del equipo es el promedio, para que no gane la mesa más grande | Baja la exposición individual; es lo que ya hacen los campamentos | Team mode de Kahoot!; equipos avanzados de Crowdpurr [H2: K5, C2] |
| 6 | **«La senda se ilumina»**: además de la tabla, una meta de toda la sala: el camino de la Pantalla se enciende con los aciertos del grupo | Los rankings solos desgastan (evidencia 6); con una meta común también ganan los últimos. Usa el lenguaje visual de Senda | Modos grupales premium de Kahoot! [H: K2]; no vi otra |
| 7 | **«Para repasar»**: al terminar, al teléfono del líder le llegan las tres preguntas que más costaron, con su cita y la ruta de la Travesía que las enseña | El líder ve qué no quedó y tiene qué hacer el sábado siguiente | Informes de Kahoot! (de pago) y de Socrative [H: K2; H2: So2] |
| 8 | **«Para el camino»**: el cierre es el versículo de la noche en grande, con un QR para guardarlo en la app | La reunión termina en la Palabra y no en quién ganó | YouVersion Events comparte notas, sin juego [H2: YV1] |
| 9 | **Lany en la Pantalla**: reacciona a la sala entera (festeja si acertó la mayoría, piensa, espera); nunca a una persona; no festeja en rutas de mártires | Personaje propio y el resguardo legal más simple | Avatares de Blooket [H2: B1]; ninguna tiene un personaje que actúe |
| 10 | **Segunda oportunidad con pista**: a quien erra, la cita (sin el texto) y un intento más por la mitad | Se aprende buscando; poder remontar baja la frustración (evidencia 3) | Dos intentos de Bible Trivia Live [H: BT1]; revancha de Wayground [H2, T: W1] |
| 11 | **Del sermón a la sala en dos minutos**: PDF → preguntas con cita → el líder revisa → se proyecta | Ya existe; con la Pantalla se vuelve visible. Es la razón para pagar Max | IA de Kahoot! (desde Bronze) y de Crowdpurr, sin cita ni revisión doctrinal [H: K1, C1] |
| 12 | **Copa entre iglesias en vivo**: la misma trivia a la misma hora; cada iglesia con su Pantalla ve «tu grupo va 3.º de 14» | Convierte a cada grupo en difusor | Torneos de Crowdpurr [H: C1]; ninguna cruza salas de iglesias |
| 13 | **«Pregunta sin miedo»**: preguntas anónimas al líder; el grupo vota cuáles quiere escuchar; el líder aprueba antes de que salgan | Los jóvenes tienen preguntas que no hacen en voz alta [Hip] | Preguntas con votos de Slido [H: S1]; anónimas de Vevox [H2: V2] |
| 14 | **Sin teléfonos**: la Pantalla sola, por equipos; se contesta en voz alta y el líder marca. Y **«Abecé en vivo»** con los 1.918 nombres que la app ya valida | Campamentos sin señal; chicos sin teléfono | Baamboozle y Plickers [H2: Ba1, Pl1] |

### 5.4 (d) Cómo se llama cada cosa

La regla del marco de UX manda: rótulos que digan qué hay detrás. Por eso lo básico queda llano y el lenguaje propio va en los
momentos.

| En otras apps | En Senda | Nota |
|---|---|---|
| Kahoot, quiz en vivo | **Sala en vivo** | Ya se llama así (R3) |
| Pantalla del anfitrión, «big screen» | **La Pantalla** («Abrir la Pantalla») | Dice lo que es |
| Game PIN, room code | **el código** («El código para entrar») | Ya está |
| Lobby | **la espera** («Llegaron 23») | Ya está |
| Join | **Entrar** | La dirección termina en lo mismo |
| Host | **quien abre la sala** / el líder | — |
| Guest | **invitado** | Para el que entra por el navegador |
| Answer reveal | **Escrito está** | Mateo 4:4 en la Reina-Valera; va sin comillas porque es un rótulo |
| Leaderboard | **la tabla** | Ya está |
| Podium | **el podio**, dibujado como la llegada del camino a la luz | Palabra común, aspecto propio |
| Speed scoring | **Acierto primero** / **A toda velocidad** | Dos opciones al abrir |
| This or that | **El cruce** | Lenguaje de camino, sin peso doctrinal |
| Word cloud | **Voces** | — |
| Poll o pregunta abierta sin puntos | **Pausa** | — |
| Team mode | **Tribus** | Verificar con el fundador que no choque con «grupos» |
| Meta de todos | **La senda se ilumina** | El lema ya es «La Palabra ilumina tu senda» |
| Report | **Para repasar** | — |
| Cierre | **Para el camino** | — |
| Q&A anónimo | **Pregunta sin miedo** | — |

### 5.5 (f) Qué métrica muestra que funciona

- **La principal:** líderes que abren una segunda sala con Pantalla dentro de los 14 días de la primera. Si repite, sirvió.
  Umbral inicial: 40 % [Hip].
- **El embudo:** abrieron el enlace → entraron a la sala → respondieron al menos una → llegaron al podio. Corte: 70 % de abrieron
  a entraron [Hip].
- **Lo que trae:** instalaciones cuya primera acción fue entrar a una sala, y cuántas de esas personas vuelven a los 7 días
  comparadas con las que llegaron solas.
- **Lo que queda** (la visión se mide por lo que la gente sabe): porcentaje de acierto cuando una pregunta que costó vuelve a
  aparecer la semana siguiente.
- **Regla de corte de la función:** si al 28-02-2027 menos de 20 líderes distintos usaron la Pantalla dos veces, no se construye
  nada más de la lista y se entrevista a los que la dejaron [Hip].

### 5.6 Guion de entrevistas (10 a 12 líderes: 5 del ministerio aliado y 5 a 7 de otras iglesias)

Todas sobre lo que ya pasó, ninguna sobre lo que harían.
1. Contame la última reunión de jóvenes: ¿qué hicieron en los primeros quince minutos?
2. ¿Cuándo fue la última vez que usaste un juego con pantalla o con teléfonos? ¿Cuál? ¿Qué pasó?
3. ¿Cuánta gente había? ¿Cuántos pudieron entrar? Los que no, ¿por qué?
4. ¿Qué hay en el salón: proyector, tele, PC de quién? ¿El Wi-Fi anduvo? ¿Con qué datos entraron los chicos?
5. ¿Cuánto tardaste en preparar las preguntas la última vez? ¿De dónde las sacaste?
6. ¿Pagaste alguna vez por una app para la reunión? ¿Cuál, cuánto, con plata de quién? Si la dejaste, ¿por qué?
7. ¿Pasó algo incómodo con un juego en pantalla (un nombre, alguien que quedó mal)? ¿Qué hiciste?
8. ¿Qué edades tenían los que estaban? ¿Cuántos tenían teléfono propio? ¿Cuántos iPhone?
9. Después de la última prédica, ¿cómo supiste qué entendieron?
10. ¿Qué día y a qué hora se reúnen? (define el pico de carga)
11. ¿Quién decide qué se usa en la reunión? ¿A quién tuviste que pedirle permiso la última vez que cambiaste algo?
12. La última vez que un juego salió bien, ¿qué pasó en la semana siguiente con eso? ¿Alguien siguió?

---

## 6. El dominio

**Lo que hay hoy:**
- `ministerionuevageneracion.com` está en línea: sitio estático del ministerio Nueva Generación (interdenominacional), con Inicio,
  Nosotros, Contenidos, Actividades, **Senda** y Sumarme; Instagram @mngeneracion [H: D1].
- La página `/senda` presenta el proyecto (lectura, Travesía, juegos, comunidad). Según la lectura automática, dice «iPhone en
  2027», «portugués e inglés en 2028» y «planes y anuncios desde 2027» [H: D1]. Eso no coincide con lo decidido después (iPhone
  junto con Android con corte el 05-12; planes al lanzamiento). **Conviene que el fundador la mire.** No tiene enlaces a las tiendas.
- El sitio de Senda vive en `senda-1zw.pages.dev`: ahí apuntan los enlaces canónicos de las guías de los 66 libros, la privacidad,
  los términos y el `app-ads.txt` (R7). El enlace para sumarse a una sala o torneo sale de la app con esa dirección
  (`src/util/juntos.ts`, línea 494).
- En `web/` no hay carpeta `.well-known`: los enlaces https todavía no abren la app por sí solos; lo hace la página intermedia con
  `senda://` (R7).

**Lo que mandan los hechos:**
1. **Lo que se escribe mirando una pantalla tiene que ser corto.** `jugar.ministerionuevageneracion.com` son 35 caracteres;
   `senda-1zw.pages.dev`, 19, con un guion y «1zw», que nadie dicta bien. Las referencias: kahoot.it (9), jackbox.tv (10),
   slido.com (9), play.blooket.com (16) [H: K4, J1; H2: S2, B1]. Varias compraron un dominio solo para esto.
2. **El dominio queda grabado en la app.** Para que un enlace https abra la app, Android pide un archivo en
   `/.well-known/assetlinks.json` de **ese** dominio y el dominio declarado dentro de la app; cada subdominio necesita el suyo
   [H: T3; H2: T6]. En iPhone el archivo se baja al instalar o actualizar la app, así que cambiar de dominio obliga a que todos
   actualicen [H: T4]. **Se elige antes de compilar la versión pública.**
3. **Cloudflare Pages acepta dominios propios** sin mudar el sitio: un subdominio se conecta con un CNAME aunque el DNS esté en
   otro lado; un dominio raíz pide que el DNS esté en Cloudflare; la dirección `pages.dev` sigue andando [H: T5].

| Opción | A favor | En contra |
|---|---|---|
| **A. Subdominio del ministerio** (`senda.` o `jugar.ministerionuevageneracion.com`) | Costo cero; ya es del fundador; confianza entre quienes conocen el ministerio; coherente con «by Nueva Generación» | 35 caracteres para escribir; ata los enlaces de la app al ministerio; mezcla quién responde por la privacidad (la cuenta de Play es «Senda App», las marcas son del fundador); para una iglesia de otra denominación la puerta de entrada lleva el nombre de otro ministerio [Hip]; el `app-ads.txt` se busca en el dominio raíz del desarrollador [C: verificar] |
| **B. Seguir en `senda-1zw.pages.dev`** | Ya funciona; costo cero | No es de Senda (es de Cloudflare); feo y difícil de dictar; el posicionamiento de las 66 guías se junta en un nombre que no es marca |
| **C. Dominio propio y corto de Senda** | Corto; estable; marca propia; un solo lugar para sitio, entrada a la sala, Pantalla, privacidad, `app-ads.txt` y correo de soporte; sirve igual para Brasil y otros países | Cuesta del orden de USD 10 a 20 por año [E: precio habitual de un .com o .app; no lo verifiqué hoy]; hay que elegir el nombre y comprobar que esté libre |

**Recomendación: la opción C.** Un dominio propio de 15 caracteres o menos, sin guiones ni números, que se pueda decir en voz alta
sin deletrear; conectado al mismo proyecto de Cloudflare Pages. La página `ministerionuevageneracion.com/senda` queda como la cara
del proyecto dentro del ministerio y enlaza al dominio nuevo. Si se quiere, `senda.ministerionuevageneracion.com` redirige ahí.

- **Qué se escribe en la Pantalla** (en «tú», como todo el contenido de la app): «Entra a **dominio** y escribe **K7M2QP**», con
  el QR al lado. El código ya usa un alfabeto
  sin letras confusas (sin I, L, O, 0 ni 1; R9). Bien.
- **Nombres:** no pude comprobar disponibilidad. `sendaapp.com` está tomado (redirige a un negocio de envíos) [H]; `senda.app`
  responde con error 503, así que alguien lo tiene [I]; `sendabiblia.com` y `senda.bible` no resolvieron desde este entorno, lo que
  no prueba nada. Por coherencia con la marca pedida en el INPI («SENDA BIBLIA Y JUEGOS»), el primero a consultar es
  `sendabiblia.com` (15 caracteres).
- **Es un gasto: lo aprueba el fundador** (regla 8). **Fecha límite: antes del 05-12**, para que entre en la versión pública.
- **Si decide no comprar:** `senda.ministerionuevageneracion.com` como dirección estable y QR siempre a la vista. Nunca
  `pages.dev` como dirección para escribir.

---

## 7. Riesgos y cómo se achican

| # | Riesgo | Qué tan probable y qué tan grave | Cómo se achica |
|---|---|---|---|
| 1 | **Altas anónimas desde una misma red:** Supabase deja 30 cuentas anónimas por hora por IP de fábrica [H2: T2] y `docs/SEGURIDAD.md` pide bajarlo. En la iglesia todos salen por una IP; con datos móviles, las operadoras también comparten IP [C] | Alta el día del lanzamiento (todos instalan en la reunión); grave: la sala falla delante del grupo | No bajar el límite: subirlo y proteger por otro lado (tope de intentos por código, ya previsto en R6). Probar 40 altas desde una IP en `pruebas/nube`. Mirar el valor real en el panel (no lo pude ver) |
| 2 | **Menores:** la Pantalla muestra apodos; el invitado web no pasa por la edad | Media; grave por lo regulatorio | El 18-12 solo entran cuentas de la app (13+ con normas aceptadas). Invitado: apodo sorteado, sin datos, sin anuncios ni estadísticas; pasarlo por la revisión legal. Brasil, EE. UU. y la UE siguen `region.ts` |
| 3 | **Un nombre ofensivo en la pantalla de la iglesia** | Media; el líder no vuelve a usarla | Filtro antes de mostrar; sacar a alguien con un toque; opción «apodos sorteados»; cerrar la entrada cuando empieza. Para «Voces» y «Pregunta sin miedo», nada sale sin que el líder lo apruebe (patrón de Slido y Jackbox) |
| 4 | **Conexión floja** | Alta en Latinoamérica [Hip]; es la primera molestia de la lista de Wang y Tahir | La sala ya consulta cada 2 segundos y tolera cortes (R2). Página de la Pantalla liviana (menos de 300 KB [Hip]); si se cae, sigue con el último estado y avisa; el reloj lo cuenta la base. Tiempo generoso por pregunta |
| 5 | **Costo y pico del servidor:** una sala de 40 son unos 20 pedidos por segundo durante 9 minutos y cerca de 16 MB de tráfico [E: 270 consultas por teléfono a ~1 KB más las lecturas de la tabla]: lo que gastan unas 200 personas en un día normal (80 KB por persona, R4). El pico no lo da el total de usuarios: lo dan las salas a la misma hora (sábado a la noche [Hip]) | Media; diez salas a la vez serían ~200 pedidos por segundo, más que el pico para el que R4 prevé el servidor Micro (69 pedidos por segundo en su tabla; con 107 ya pasa a Small) | Consultar menos mientras corre la pregunta: el teléfono sabe cuándo vence. Prueba de carga con 10 salas de 40. La Pantalla es un solo cliente más por sala. Tiempo real: gratis 200 conexiones a la vez (cinco salas de 40) y Pro 500, después USD 10 por cada 1.000 [H: T1]; por eso consultar es más seguro mientras haya pocos usuarios |
| 6 | **Patente en EE. UU.** | Baja de probabilidad, alta de daño (informe del 14-11) | La página aplica la misma regla que la app. No promocionar la Pantalla en inglés para EE. UU. hasta la búsqueda de libertad de operación |
| 7 | **Parecerse a Kahoot!** | Baja si se sigue 4.2 | Letras y paleta propia, música libre, nombres propios, puntaje propio, Lany; nunca «tipo Kahoot» en la tienda ni en anuncios |
| 8 | **El tope gratis de 10 frena la difusión** | Alta [I] | Decisión del fundador: 40 gratis (5.0) |
| 9 | **Desgaste por repetir** (evidencia 4) | Media a los dos o tres meses | Formatos que rotan (5.2 y 5.3) |
| 10 | **Un competidor bíblico en inglés suma español** (Bible Live Quiz ya dice tener diez idiomas) | Media | Sumarlo a `radar/vigilancia.md`; la ventaja de Senda es el contenido, la app de la semana y el ministerio |
| 11 | **Llegar con todo el 18-12 y que algo falle** | Media | La Pantalla es solo lectura: si falla, la sala sigue en los teléfonos. Lo demás, después |

---

## 8. Fuentes

Todas consultadas el 15-11-2026.

### 8.1 Leídas en directo
- **K1** https://kahoot.com/school/plans/ · **K2** https://kahoot.com/es/home/kahoot-plus/ · **K3** https://kahoot360.com/pricing/ ·
  **K4** https://kahoot.com/what-is-kahoot/
- **M1** https://www.mentimeter.com/plans · **M2** https://www.mentimeter.com/features · **S1** https://www.slido.com/features
- **A1** https://ahaslides.com/pricing/ (sin precios en el texto) · **P1** https://www.polleverywhere.com/plans ·
  **So1** https://www.socrative.com/pricing/ · **C1** https://www.crowdpurr.com/pricing · **J1** https://www.jackboxgames.com/how-to-play ·
  **Wo1** https://www.wooclap.com/en/pricing/ · **V1** https://www.vevox.com/pricing (sin precios)
- **N1** https://nearpod.com/pricing · **PD1** https://www.peardeck.com/pricing · **Ge1** https://genially.com/plans/ ·
  **Fo1** https://www.formative.com/pricing · **CP1** https://www.classpoint.io/pricing · **SW1** https://slideswith.com/pricing ·
  **TM1** https://triviamaker.com/pricing/ · **SA1** https://www.streamalive.com/pricing · **Se1** https://www.sendsteps.com/en/pricing/ ·
  **DP1** https://directpoll.com/ · **QB1** https://www.quizbreaker.com/pricing
- **BT1** https://bibletrivialive.com/ y /about · **BL1** https://apps.apple.com/us/app/bible-live-quiz-group-trivia/id6762076569 ·
  **FS1** https://faithshowdown.com/bible-game-show · **Ke1** https://kerygma.one/ · **IB1** https://apps.apple.com/app/id6758225650
- **L2** https://fedcircuitblog.com/supreme-court/petitions/kahoot-as-v-interstellar-inc/
- **T1** https://supabase.com/pricing · **T3** https://docs.expo.dev/linking/android-app-links/ ·
  **T4** https://docs.expo.dev/linking/ios-universal-links/ · **T5** https://developers.cloudflare.com/pages/configuration/custom-domains/
- **D1** https://ministerionuevageneracion.com y https://ministerionuevageneracion.com/senda
- **Repositorio de la app:** **R1** `docs/LANZAMIENTO.md` · **R2** `src/util/salas.ts` · **R3** `src/pantallas/Sala.tsx` ·
  **R4** `docs/CAPACIDAD.md` · **R5** `src/util/region.ts` · **R6** `docs/SEGURIDAD.md` y `src/util/moderacion.ts` ·
  **R7** `web/u/index.html`, `web/` y `src/util/juntos.ts` línea 494 · **R9** `supabase/migrations/20261110000000_sala_repetida.sql`
  (puntaje) y `20261101000000_juntos.sql` (alfabeto del código)
- **Holding:** `conocimiento/2026-11-14-senda-lanzamiento-eeuu.md` (fila G6, patente)

### 8.2 Por el buscador (secundarias)
- **K5** soporte de Kahoot!: https://support.kahoot.com/hc/en-us/articles/35342050693789 (2-Step Join),
  https://support.kahoot.com/hc/articles/115016055107 (ajustes), https://support.kahoot.com/hc/articles/115002303908 (puntos),
  https://support.kahoot.com/hc/articles/39818967108627 (Accuracy), https://support.kahoot.com/hc/en-us/articles/32200674639261
  (Confidence), https://kahoot.com/blog/2017/11/09/generate-funny-nicknames-players-live-kahoots/
- **K6** https://www.capterra.com/p/156399/Kahoot/ y reseñas de G2 · **K7** https://kahoot.com/files/2017/08/Kahoot-BrandGuide-July2019.pdf
  y https://trademarkdir.com/trademark/kahoot-86914940
- **M3** guías universitarias sobre Mentimeter (p. ej. https://microsites.bournemouth.ac.uk/flie/2022/04/12/new-mentimeter-slide-types/) ·
  **M4** https://www.txcumc.org/news/technology-in-worship-friend-or-foe/ ; https://www.castanet.net/news/BC/237748/Texting-for-Jesus ;
  https://www.mentimeter.com/templates/p/private-engage-parishioners
- **S2** https://www.capterra.com/p/154051/Slido/pricing/ ; https://community.slido.com/the-basics-205/how-to-join-slido-as-a-participant-472
- **W1** https://help.wayground.com/support/solutions/articles/158000404918-live-session-modes-on-wayground ;
  https://help.wayground.com/support/solutions/articles/158000404941-power-ups-their-types ; https://tooliverse.ai/tools/wayground ;
  https://pricingsaas.com/companies/quizizz/diffs/2026Q1
- **B1** https://help.blooket.com/hc/en-us/articles/16291522413975 ; https://help.blooket.com/hc/en-us/articles/15984215236503 ;
  https://ahaslides.com/blog/blooket-review/ (competidor) ; https://nibble-app.com/blog/blooket-pricing ;
  https://www.commonsense.org/education/reviews/blooket/teacher-reviews/5092501
- **G1** https://blog.gimkit.com/blog/gimkit-goes-free ; https://nibble-app.com/blog/gimkit-pricing-cost ;
  https://blog.gimkit.com/blog/why-we-dont-run-advertisements-on-gimkit
- **A2** https://ahaslides.com/features/new-slide-types/ ; https://www.capterra.com/p/193878/AhaSlides/pricing/
- **P2** https://help.unlv.edu/TDClient/33/IT-Support-Portal/KB/ArticleDet?ID=2075 ;
  https://support.polleverywhere.com/hc/en-us/articles/1260801551509-Create-an-activity
- **So2** https://help.socrative.com/launch y guías de usuario · **C2** https://intercom.help/crowdpurr/en/articles/10524846 ;
  https://intercom.help/crowdpurr/en/articles/10524943-team-trivia-explained
- **J2** https://www.jackboxgames.com/how-to-keep-your-stream-safe-while-playing-jackbox-games/ ;
  https://www.jackboxgames.com/streaming-moderation-accessibility-features-jackbox-party-pack-eight/
- **Q1** https://www.educatorstechnology.com/2023/05/what-is-quizlet-live-and-how-to-use-it.html ·
  **Wo2** https://pricingsaas.com/companies/wooclap ; https://docs.wooclap.com/en/articles/674966-what-is-the-competition-mode ·
  **V2** https://www.capterra.com/p/185114/Vevox/pricing/ ; https://www.softwareadvice.com/polling/vevox-profile/
- **Pl1** https://www.techlearning.com/how-to/plickers-how-to-use-it-to-teach · **Ba1** https://blog.baamboozle.com/baamboozle-101 ;
  https://www.educatorstechnology.com/2023/01/baamboozle-review-for-teachers-tons-of.html ·
  **Ge2** https://genially.com/features/audience-engagement · **Qz1** https://help.quizalize.com/en/articles/8281637-quizalize-s-premium-subscription-plans ·
  **Fa1** https://www.playfactile.com/plans/ · **CrP1** https://www.saasworthy.com/product/crowdparty-app/pricing ·
  **MQ1** https://blog.myquiz.org/newpricing
- **YV1** https://www.bible.com/features/events ; https://open.life.church/resources/2567-youversion-events
- **E1** https://doi.org/10.1016/j.compedu.2020.103818 (copia: https://research.gold.ac.uk/id/eprint/39435) ·
  **E2** https://folk.idi.ntnu.no/alfw/publications/Wearout_effect_of_game_based_student_response_system.pdf ·
  **E3** https://folk.idi.ntnu.no/alfw/publications/ECGBL2016-Effect_of_points_and_audio_in_Kahoot.pdf ·
  **E4** Hanus y Fox, *Computers & Education* 80 (2015), 152–161 · **E5** doi 10.1016/j.compedu.2015.11.013 ·
  **E6** https://scholarworks.iu.edu/journals/index.php/josotl/article/view/22068 ; Barr, *Journal of Computer Assisted Learning*, 2017
  (doi 10.1111/jcal.12205) · **E7** https://library.iated.org/view/MARTINEZADRIAN2025LEA ·
  **E8** https://kahoot.com/blog/2025/07/17/kahoot-impact-research-academic-stress/ (fuente interesada)
- **L1** https://www.loeb.com/en/insights/publications/2012/06/tetris-holding-llc-v-xio-interactive-inc ·
  **L2 (más)** https://ipverse.greyb.com/ptab-web/cases/case-details/IPR2025-00696 ;
  https://www.pacermonitor.com/public/case/54090281/Interstellar_Inc_v_Kahoot_EDU,_Inc_et_al
- **T2** https://supabase.com/docs/guides/auth/rate-limits · **T6** https://developer.android.com/training/app-links/configure-assetlinks

### 8.3 Fuentes que no se pudieron leer
- **403 o bloqueo:** support.kahoot.com (todo el centro de ayuda), blooket.com/upgrade, help.blooket.com, quizlet.com/features/live,
  baamboozle.com/pricing, quizgecko.com/pricing.
- **Página vacía o sin precios en el texto:** slido.com/pricing (tres variantes), wayground.com/pricing, gimkit.com/pricing,
  plickers.com/pricing, playfactile.com/pricing, crowdparty.app/pricing, myquiz.org/pricing; los precios de Wooclap, Vevox,
  Sendsteps y AhaSlides no figuran en el texto que llegó.
- **Error del servidor:** docs2.ahaslides.com (503), blog.gimkit.com/blog/gimkit-goes-free (404), quizalize.com/pricing (404),
  polljunkie.com (redirecciones en bucle), play.google.com (ficha de Bible Live Quiz, truncada).
- **No consultadas:** TSDR de la USPTO y EUIPO (formas y colores de Kahoot!); Google Patents (las reivindicaciones de la
  US 10.339.825); el PDF de Wang 2017 sobre tiempo contra completitud llegó ilegible.
- **Sin resultado:** Tricider, Votify, Zeetings (sitio oficial), Subsplash y Planning Center (nada en vivo encontrado), precios
  de los paquetes de Jackbox.
- **Dominios candidatos:** senda.app (503), sendabiblia.com y senda.bible (no resolvieron desde este entorno): la disponibilidad
  hay que verla en un registrador.
- **No se probó ninguna app en un dispositivo:** lo que se ve en cada pantalla sale de documentación.
