# Jugar con otros de verdad, torneos y el evangelio primero (la prueba 39)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 30-10-2026 el fundador probó los duelos con otro teléfono y trajo una lista larga: que al proponer un duelo
no llegaba nada, que el rival aparecía como «Alguien», que la pantalla de victoria no se entendía, que la ruleta ya no se agarraba,
que no se podía salir de una partida, que invitar con el código no anduvo; y pidió alias único, roles libres en los grupos,
invitaciones que se aceptan, torneos para cualquiera (también de «Nombres por letra», validados con todos los nombres de la Biblia),
el Evangelio como primera travesía, planes de 3 meses, una evaluación de Inicio, más contenido y un plan para los **USD 200 de
créditos de Anthropic que vencen el 22-11**. **Todo quedó hecho, salvo usar los créditos, que espera su visto bueno (§7).** Los
duelos llegan (aviso y tarjeta «Te esperan» arriba de todo en Inicio), arrancan directo y muestran el nombre del rival; al ganar,
Lany festeja con **cuatro bailes nuevos** al azar (§2 y §4). **Torneos** de trivia, de nombres por letra o en vivo, con amigos o con
un grupo (§3). La primera lección de todos es **«La buena noticia, de principio a fin»** (§5). **Zacarías** completa los doce
profetas y hay **32 preguntas nuevas**, 17 de ellas «¿Qué historia muestra la imagen?» (§5). Y se cerró un agujero: cualquiera
podía marcarse administrador desde su teléfono (§8). **APK 39**, con todo (§10).
</div>

## 1. Lo que dijo el fundador y dónde quedó

| Pedido (30-10-2026) | Dónde quedó |
|---|---|
| «Cuando me proponen un duelo no me llega nada: ni la notificación, ni en el inicio, ni en ningún lado» | §2: el permiso de avisos se pide al entrar a lo social; el canal de Android que faltaba; «Te esperan» en Inicio; globito en Jugar |
| «Turno enviado vs Alguien», «Tu turno contra buscando un rival…» | §2: el rival siempre con su alias; «Alguien» desapareció |
| Proponer un duelo te tiene que llevar directo a jugar; un acceso chiquito en Inicio para jugar con un amigo o al azar | §2: desafiar arranca el duelo en Jugar; «Juega con alguien» en Inicio |
| Después de perder el turno, mostrar los duelos pendientes; un buen mensaje al que pierde | §2: el fin de turno muestra los otros duelos y «Jugar con alguien más»; la derrota tiene su mensaje |
| La victoria se ve rara; una celebración enorme de Lany (girar en el aire, saltos, varios bailes al azar) | §4: pantalla nueva y cuatro bailes nuevos en Rive |
| Seguir mejorando el desmayo y las animaciones de Lany | §4: los ojos dan vueltas antes de caer |
| La ruleta ya no se gira con la mano; no se puede salir de una partida | §2: la ruleta pasa al sistema de gestos nativo; botón «Salir» |
| El cartel de «te toca» es feo y no se entiende | §2: cartel «¡Te toca! · Duelo con Sofi · ronda 3 de 25» |
| Alias único; roles libres; invitar con el código no anduvo; aceptar invitaciones; avisos de torneos | §3 |
| Crear torneo u organizar evento: participantes de un grupo o de tus amigos; trivias, el tipo Kahoot, el de letras; contenido propio o con IA | §3 |
| La pieza de armadura ganada se volvió a ver chica | §4: Lany hasta el 70 % del ancho, sin pasarse de la pantalla |
| Una frase corta: el objetivo no es competir sino aprender y recordar la Palabra | §5: en la portada del Espadeo |
| Preguntas de «qué representa la imagen», edificantes, más preguntas, más travesía | §5 |
| La primera travesía, el Evangelio, con una lección que lo anuncie entero | §5 |
| Sin anual: como mucho 3 meses, con el ahorro a la vista | §6 |
| Cambiar «conoce la Biblia»; «by Nueva Generación»; evaluar Inicio sin que sea cargoso | §5 y §9 |
| Los USD 200 de créditos de Anthropic | §7 |
| Reducir tokens del PDF; evaluar los anuncios; usar la app como alguien nuevo | §7, §6 y §9 |

## 2. Duelos que llegan, arrancan y se entienden

- **Por qué no llegaba nada.** Tres causas juntas: el permiso de avisos solo se pedía al crear un evento del calendario (quien nunca
  creó uno, nunca lo dio); la base mandaba los avisos al canal «senda_v4», que no existía en el teléfono (Android los descarta); y la
  app no tenía dónde mostrar lo que espera. Ahora el permiso se pide al entrar a Amigos o Duelos y al desafiar, el canal «Duelos y
  amigos» existe, el token se guarda con una función (si el teléfono cambia de cuenta, el aviso sigue llegando) y tocar el aviso lleva
  **directo a jugar ese turno**.
- **«Te esperan»**, arriba de todo en Inicio y solo cuando hay algo: lo más urgente en grande (Lany señala y el botón late) y lo demás
  en filas cortas, cada una con su acción a un toque: **Jugar**, **Aceptar**, **Unirme**, **Revancha**. La base lo arma en una
  sola llamada (`mis_novedades`: duelos donde te toca, pedidos de amistad, invitaciones a grupos y torneos, duelos terminados) y la app
  la pide al entrar, cada 45 segundos mientras se mira Inicio, al volver a la app y al llegar un aviso. La pestaña Jugar muestra un
  **globito rojo** con los duelos que te esperan.
- **El rival con su nombre.** Las funciones de la base devolvían la partida sin el alias del rival y la app caía en «Alguien» o en
  «buscando un rival» aunque fuera un amigo. Ahora el alias se conserva y, si alguien no tiene, se ve «Jugador» y su código.
- **Directo a jugar.** Desafiar desde Inicio, Amigos, Duelos o el final de un turno abre Jugar y arranca el turno; al empezar aparece
  el cartel **«¡Te toca! · Duelo con Sofi · Juegas hasta fallar. Ronda 3 de 25»** dos segundos.
- **El final del turno**, rehecho: «¡Turno enviado!» y a quién le toca; si perdiste, **«Esta vez ganó Sofi»** con un mensaje que no
  humilla («lo que repasaste hoy te queda, y la revancha está a un toque»); si se vencieron las 72 horas, lo dice. Debajo, **los
  otros duelos donde te toca** y **«Jugar con alguien más»** (tus amigos y «al azar» en burbujas).
- **La ruleta otra vez se agarra.** Desde que creció (prueba 34) la pantalla se desplaza, y en Android el desplazamiento nativo le
  ganaba el gesto al dedo. Ahora el gesto es del sistema nativo (Gesture Handler): mientras el dedo está en la ruleta, la página espera.
- **Salir de una partida**, siempre a mano: en la práctica se termina; en un duelo, el turno se manda como está (así nadie mira una
  pregunta difícil, sale y vuelve a probar).

## 3. Comunidad: alias, amigos, grupos y torneos

- **Alias único** en todo Senda (sirve para tablas y torneos internacionales), de 3 a 20 letras o números, sin palabras reservadas.
  Mientras se escribe, la app dice si está libre. Los que no tenían reciben uno libre parecido a su nombre.
- **«Invitar con el código no anduvo».** El pedido sí se creaba, pero al otro no le llegaba nada y no lo veía hasta abrir Amigos.
  Ahora aparece en «Te esperan» y llega el aviso; y **si los dos se piden amistad, quedan amigos solos**. Aceptar le avisa al otro.
- **Grupos con invitación**: el líder o el ayudante invita a sus amigos y cada uno **acepta o no** desde Inicio (entrar con el código
  del grupo sigue igual: ya es una decisión de la persona). **Títulos libres**: el líder escribe el rol de cada uno («Guitarra y
  alabanza», «Coordina los viernes»); los permisos (líder, ayudante, miembro) siguen por debajo.
- **Torneos para cualquiera** (pantalla nueva «Torneos», desde Inicio y desde cada grupo), en una sola pantalla de arriba abajo:
  1. **Qué juegan**: trivia, «Nombres por letra» o **en vivo** (el concurso de la reunión, tipo Kahoot: la sala de Senda Max).
  2. **Con quién**: tus amigos (los eliges con un toque) o un grupo entero (si eres su líder o ayudante).
  3. **De qué son las preguntas**: las de Senda (todos las mismas), **las que escribes tú** (de 3 a 30, con su respuesta y su cita) o
     **la trivia del sermón** que tu grupo armó desde el PDF (la IA trabaja detrás y el líder la revisa: es la parte con Max).
  4. **Hasta cuándo**: hoy, 3 días, 1 semana o 2 semanas. Los invitados reciben el aviso y lo ven en «Te esperan»; jugarlo es aceptar.
- **«Nombres por letra» en torneo**: la base sortea las letras (las mismas para todos); por cada letra hay 45 segundos para escribir
  nombres de personas de la Biblia, que se validan al instante (100 puntos; 150 los que pocos conocen); los repetidos y los que no
  están no suman. La base corrige todo de nuevo. Al final, «también valían» con su versículo a un toque. La lista tiene **1.421
  nombres** y sale del texto bíblico, no de memoria (`scripts/autor/nombres_biblicos.py`): un nombre propio que aparece donde solo
  puede ir una persona («hijo de…», «el rey…», «dijo…», las genealogías), más los 255 revisados a mano, menos los lugares, pueblos,
  títulos y nombres de Dios que se cuelan (revisados uno por uno).
- **La base**: una migración nueva (`20261111000000_novedades.sql`) y la lista de nombres (`20261112…`); la prueba de la base pasó
  de 69 a **103 pasos, todos bien** (alias, novedades, amistad mutua, invitaciones, títulos, torneos con preguntas propias y de letras).

## 4. Lany: la victoria más grande

- **Cuatro bailes nuevos**, escritos en Rive con código y revisados cuadro a cuadro: **la voltereta** (se agacha, sale disparada, da
  una vuelta entera en el aire girando sobre el centro del cuerpo, cae con peso y termina con los puños en V), **los saltitos** (tres
  saltos, el último en estrella), **el bailecito** (pasos al costado con la ola de los brazos y la mano al cielo) y **el lazo** (revolea
  el antebrazo al costado, con la otra mano en la cintura, y termina con el pulgar arriba y un guiño). Cada uno con anticipación,
  partes que llegan tarde (orejas, jopo, cola) y estirar y aplastar.
- **La pantalla de victoria**, de cero: una sola pantalla, «¡Ganaste!», Lany **grande** con toda la armadura encadenando bailes al
  azar sin repetir el anterior (la primera, la voltereta), confeti y globos, el marcador claro (6 contra las piezas del rival),
  «+20 talentos», **Revancha** y Seguir.
- **El desmayo**: antes de caer, los ojos dan dos vueltas cada vez más grandes y se quedan mirando arriba.
- **La pieza ganada**: Lany llega al 70 % del ancho y hasta 290 (antes 56 % y 240); probado en 390 × 844 y en 360 × 640.

## 5. Contenido: el evangelio primero, Zacarías y la trivia nueva

- **«La buena noticia, de principio a fin»**: un capítulo nuevo al principio de «El evangelio, paso a paso», con una lección en
  cinco pasos (Dios te hizo · el pecado nos separó · Dios vino a buscarte · se recibe, no se gana · una vida nueva), cada uno con su
  versículo textual, y la invitación a responderle a Dios con las propias palabras (Romanos 10:9). Hasta hacerla, **es la primera
  lección de todos** («Empieza aquí» en Inicio), sea cual sea la ruta; las cuentas nuevas empiezan en la ruta del Evangelio.
- **Zacarías** (6 lecciones): antes de abrir, las visiones de la noche, el ayuno que Dios quiere, el rey humilde y las treinta piezas,
  «mirarán al que traspasaron» y «Jehová será rey sobre toda la tierra». Con lo que el Nuevo Testamento cita (Mateo 21:5; 26:15, 31;
  Juan 19:37). El capítulo 14 se lee sin tomar posición sobre el orden de los últimos tiempos (marcado como lectura). **Los doce
  profetas, completos**; la Travesía tiene **458 lecciones**.
- **Trivia, banco 37** (2.246 preguntas): **17 de «¿Qué historia muestra la imagen?»** con las láminas de «Vivir la historia» (solo
  las que no se confunden con otra historia; en la de José, todas las opciones son momentos de su vida) y **15 edificantes** (lo que
  el versículo enseña de Dios y de la vida con él). Todas sobre versículos que ninguna pregunta usaba; la app las anuncia («Mira la
  imagen»).
- **La frase** «Aquí no se trata de ganar: se trata de conocer y recordar la Palabra», corta, en la portada del Espadeo.
- **El lema de la entrada**: «Conoce la Palabra» pasó a **«La Palabra ilumina tu senda»** (el nombre de la app y Salmo 119:105, que es
  la lámpara del pañuelo de Lany), con **«by Nueva Generación»** debajo.

## 6. Planes de 3 meses y anuncios con medida

- **Planes**: sin anual por ahora. **Premium USD 2,49 por mes o 5,99 cada 3 meses (ahorras 20 %)**; **Max USD 5,99 por mes o 14,99
  cada 3 meses (ahorras 17 %)**, en Latinoamérica (los de EE. UU. y Europa, en la misma proporción). Productos de Play:
  `senda_premium_trimestral` y `senda_max_trimestral`. El anual se vuelve a evaluar con datos: si más del 60 % renueva el trimestral.
- **Anuncios** (hoy simulados; AdMob se integra con la cuenta de Play). El diagnóstico: solo el Espadeo mostraba anuncio y los otros
  siete juegos ninguno, y el Espadeo lo mostraba al terminar cada partida. La regla nueva (`src/util/pausaAnuncio.ts`): **solo al
  terminar un juego, ninguno en las dos primeras partidas del día y como mucho uno cada 4 minutos**; nunca en la Biblia ni en una
  lección, nunca a menores de 13 ni con un plan pago. El video a cambio de una vida sigue siendo opcional. **Próximo paso**: la misma
  regla al final de los otros juegos y de los torneos, y medir con AdMob ingresos por persona y abandono antes de subir o bajar.

## 7. Los USD 200 de créditos de Anthropic y los tokens del PDF

**HECHO** (captura del fundador): USD 200 en créditos promocionales para la API, la Batch API, el Agent SDK y Managed Agents,
otorgados el 30-10-2026 y **vencen el 22-11-2026**. Usarlos es gastar: **espera su visto bueno (DEC-2026-10-30-2)**. La propuesta, en
orden de valor para Senda:

1. **Una segunda revisión de todo el contenido** con la Batch API (la mitad del precio normal): cada una de las 2.246 preguntas y de
   las 458 lecciones, con su versículo, a un revisor por API distinto de la sesión que la escribió, que marca ambigüedades, opciones
   dudosas, lo que no se lea igual en la RVR1960 y lo que pueda prestarse a confusión. Sale una lista que Claude Code corrige en la
   prueba 40. Es la mejor defensa de la vara «nada puede prestarse a confusión».
2. **Borradores de traducción** al portugués (y después al inglés) de rutas enteras, también por lotes, que el validador controla
   contra la Bíblia Livre y la BSB: adelanta el plan de 2027 sin sacarle tiempo a lo demás.
3. **La trivia del sermón en serio**: 5 a 10 sermones reales de iglesias amigas antes del lanzamiento (la clave ya está cargada en
   Supabase; si los créditos están en la misma organización, se pagan con ellos).
4. **Lo que sobre al 18-11**: más preguntas por nivel hacia la meta de Pascua (4.000), con la misma revisión.

Cómo se controla: un tope de gasto en la consola de Anthropic, una mirada a «Usage» cada lunes, y cada lote se arma en una sesión de
Claude Code con su tamaño en tokens antes de mandarlo. El costo en dólares de cada lote se lee en la consola (los precios se
verifican ahí, no de memoria).

**Tokens del PDF.** La trivia del sermón mandaba el PDF entero como documento, y Claude lo procesa página por página como texto y
además como imagen, que es lo que más consume. Ahora la función saca el texto del PDF y manda solo el texto; si el PDF no trae texto
(un escaneo o una foto), lo manda como antes. Probado con un PDF de 2 páginas: queda en unos 3.100 caracteres de texto plano. Cada
trivia anota por qué vía se armó (`uso.via`) para medir el ahorro real con los primeros sermones.

## 8. Un agujero que se cerró

La regla «cada uno cambia su perfil» dejaba cambiar **cualquier columna**, también `admin`: alguien podía marcarse administrador
desde su teléfono y, con eso, mandar eventos y encuestas a todos o regalar planes. Ahora el teléfono solo escribe las columnas que le
tocan (nombre, país, nivel, Lany) y el alias pasa por una función. La prueba de la base lo verifica (dos pasos nuevos).
**Consecuencia**: el APK 38 ya no puede crear perfiles nuevos con la base actualizada (mandaba el alias directo): hay que instalar
el **APK 39** en los dos teléfonos.

## 9. Usar la app como alguien nuevo

Recorrida de Inicio de arriba abajo, como alguien que la abre por primera vez (en la vista previa, con letra normal y grande):

- **Se hizo**: «Misiones de hoy» repetía los tres aros del saludo y los aros no se podían tocar; ahora los aros llevan a cada misión y
  la tarjeta salió (Inicio más corto). Lo social estaba escondido en la pestaña Comunidad; ahora está en Inicio, en una sola tarjeta
  («Juega con alguien», «Organizar torneo», «Grupos»). La primera lección es el evangelio.
- **Para la próxima** (sin tocar ahora, para no cambiar de golpe lo que el fundador ya probó): la encuesta del día ocupa casi una
  pantalla y podría ir en una línea con «Votar»; la portada de Jugar lista siete juegos uno debajo del otro y convendría una grilla;
  el evento «Viernes de Espadeo» en la tira no dice qué hacer al tocarlo.

## 10. Lo que se probó, lo que no y el APK 39

- **Probado**: la prueba de la base (103 de 103, local); el validador («Todo en orden»: 2.246 preguntas, 458 lecciones); «empezar
  por el principio» (sin hallazgos); la prueba de arranque (6 de 6); el chequeo de tipos; la vista previa de Inicio con «Te esperan»,
  Torneos, el armado de un torneo, «Nombres por letra» validando nombres, la victoria y la derrota de un duelo y la pieza ganada; la
  auditoría de textos de esas pantallas con letra normal y grande (lo cortado se corrigió; queda un aviso conocido: el número de nivel
  dentro de su propio botón de perfil, que no es un texto tapado).
- **No probado**: los avisos push y los duelos con dos teléfonos reales y la base viva (lo prueba el fundador con el APK 39); la
  ruleta con el dedo en un Android real; la extracción de texto del PDF dentro de Supabase (probada con la misma librería en Node).
- **APK 39**: versión 0.39.0 (código 40), con R8 y la prueba de humo en el emulador; trae absolutamente todo lo anterior.

## 11. Pendientes y decisiones

- **Del fundador**: instalar el **APK 39 en los dos teléfonos** (el 38 ya no crea perfiles) y probar un duelo de punta a punta
  (aviso, «Te esperan», victoria); dar el visto bueno a los créditos (DEC-2026-10-30-2) antes del 22-11; confirmar con el ministerio
  que «by Nueva Generación» puede ir en la entrada (estaba pendiente su autorización); lo de antes (Play antes del 15-11, INPI, SBA,
  abogado de PI, sitio, voz).
- **Próxima prueba (40)**: lo que salga de la revisión por lotes; la regla de anuncios en todos los juegos; la encuesta en una línea
  y la grilla de Jugar; Reyes en los históricos; la segunda ruta en portugués e inglés.
- **Decisiones**: DEC-2026-10-30-1 (la prueba 39) y DEC-2026-10-30-2 (los créditos, pendiente del fundador).
