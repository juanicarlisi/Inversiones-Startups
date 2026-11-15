# Lany con volumen, «¿Quién es?» con retratos, «Vivir la historia» con encrucijadas, la música y el plan de difusión: la prueba 19

<div class="enpocas" markdown="1">
**En pocas palabras.** La prueba 19 (18-10-2026) responde el pedido más exigente hasta ahora: que Senda sea la mejor app de la tienda
en UX, diseño y sonido, con calidad antes que velocidad.
- **Lany tiene volumen** en todos los motores (sombra y luz de dos tonos, como los personajes de Duolingo) y el interruptor «Lany en
  3D» ahora muestra lo que hace; por qué no conviene que Lany sea siempre 3D, en §2.
- **«¿Quién es?» se rehízo**: se escribe cualquier pregunta y Lany la entiende, las sugerencias cambian según lo que queda en el
  tablero, 41 personajes con **retrato** y tableros de 12, 16 o 20 (§3).
- **«Vivir la historia» tiene por fin un objetivo claro**: decidís en las **mismas encrucijadas** que Rut, Jonás, el carcelero,
  Daniel o Ester, ves lo que pasó de verdad y por qué, y al final te mirás en **el espejo**. Siete historias, 23 encrucijadas y 16
  **láminas animadas** dibujadas con código (§4).
- **Colores más vivos** por pestaña y un Inicio que cambia con la hora; **música** nueva de inicio y música de fondo en los juegos
  (nueve alternativas en la Consola para elegir) (§5 y §6).
- **Difusión**: once métodos concretos y baratos, con el marco legal de los sorteos, y un plan de 90 días (§7). **Cobros**: la lista
  de lo que hay que hacer desde ahora para poder cobrar anuncios y suscripciones (§8).
- **Contenido**: trivia de **560 preguntas** (+150) y **10 de 66 libros jugables** (Joel, Sofonías, Filemón, 2 y 3 Juan y Judas; nace la
  ruta «Las cartas») (§9).
</div>

## 1. Lo que pidió el fundador y dónde quedó

Resumen de lo pedido (sin citas textuales) y cómo se resolvió.

| Pedido | Qué se hizo | Estado | Dónde |
|---|---|---|---|
| Seguir a fondo con Lany y la UX; usar Rive u otro software si hace falta; estudiar otras apps y sacar ideas de colores y movimientos; la mejor app de la tienda en UX | Benchmark de 7 apps y juegos de mesa de tableta; sistema de color v2; Lany con volumen de dos tonos en Rive; música de fondo en los juegos | Hecho | §2, §5, §6 |
| «¿Quién es?»: las preguntas predefinidas no alcanzan; poder formular la pregunta o que varíen; que aparezca un muñequito o una cara; revisar la mecánica | Versión 2: pregunta libre que Lany entiende (41 rasgos), sugerencias que cambian según el tablero, 41 retratos, tableros de 12, 16 y 20, Lany mira la tarjeta que tocás | Hecho | §3 |
| «Vivir la historia»: no se entiende para qué sirve elegir qué hace el personaje; que aparezca una animación de lo que se elige; si no hay objetivo, sacarlo | Análisis exhaustivo (cuatro caminos) y rediseño: encrucijadas reales, lo que pasó y por qué, el espejo, láminas animadas; 7 historias | Hecho | §4 |
| Buena música de fondo para los juegos, como la de los juegos de mesa de tableta | Cinco bucles de fondo (uno por juego) de compositores profesionales, bajos y apagables | Hecho | §6 |
| Colores: está medio corto, muy llano (ejemplo: cómo atrae Candy Crush) | Sistema de color v2: un acento por pestaña, Inicio por hora del día, tarjetas de juego con color, botones de cuatro tonos | Hecho | §5 |
| Activó «Lany en 3D» y no cambió nada; idealmente siempre 3D; evaluar lo mejor para la UX | Por qué no cambiaba nada y qué hace ahora (muestra en Ajustes); evaluación: 2D con volumen en toda la app, 3D solo en la fiesta | Hecho (con recomendación) | §2 |
| Difusión: el método mejor y más barato, con cosas bien concretas (sorteos, redes y todo lo posible) | Once métodos con costo, quién lo hace, cuándo y cómo se mide; marco legal de los sorteos; plan de 90 días | Hecho | §7 |
| Qué hacer desde ahora para poder cobrar anuncios y suscripciones | Lista de 12 pasos en orden, con fechas, lo que ya está y lo que falta | Hecho | §8 |
| La música de inicio sigue siendo muy mala; que sea muy buen sonido (cómo trabaja Apple, las apps n.º 1 de juegos de mesa) | Diagnóstico, criterio nuevo y nueve candidatas de compositores profesionales; la elegida por defecto y las otras en la Consola para que el fundador elija | Hecho (decide el fundador) | §6 |
| Seguir con los contenidos de trivia y travesías, y con todo lo próximo | Trivia +150 (560), cinco libros más jugables y la ruta «Las cartas»; Quién es quién capítulo 3 queda para la prueba 20 | Hecho / sigue | §9 |

## 2. Lany: volumen en todos los motores, y la verdad sobre «Lany en 3D»

**Por qué «Lany en 3D» no cambiaba nada (HECHO, código de la app, 17-10-2026).** El interruptor solo cambiaba a la Lany de la
fiesta de la armadura (la que baila cuando se gana una pieza, hecha con three.js). En el resto de la app Lany es siempre la de
Rive: no había nada más que cambiar, y el ajuste no lo decía. Ahora el ajuste se llama **«Fiesta en 3D»**, explica exactamente eso
y tiene un botón **VER** que muestra a la Lany 3D ahí mismo para comparar.

**¿Conviene que Lany sea siempre 3D? No, por ahora (INFERENCIA, con el benchmark del 17-10-2026).**
- Lo que hace memorable a Lany es la **cara**: 15 expresiones, párpados que se recortan, cejas y boca que cambian de forma, el
  giro de cabeza, los gestos de sí y no. Todo eso existe en Rive y no en el modelo 3D (que tiene cara fija). Pasar a 3D hoy
  sería perder expresividad para ganar relieve.
- Duolingo, la referencia del fundador, usa personajes **2D con volumen** (sombras de dos tonos) en toda la app y reserva el 3D
  para videos y anuncios (HECHO, bitácora de benchmark). Es el patrón de las apps que mejor UX tienen: el 2D vectorial pesa poco,
  arranca al instante y se ve igual en cualquier teléfono; el 3D en tiempo real gasta batería y procesador, y en teléfonos
  baratos se traba.
- El camino para que Lany parezca 3D sin serlo es el que se hizo en esta prueba: **volumen pintado**.

**Lo que se hizo en Rive (HECHO).** Cada forma grande de Lany (cara, hocico, torso de lana y el jopo de llama) lleva ahora dos
medias lunas: una **sombra** abajo a la derecha y una **luz** arriba a la izquierda, hechas con la diferencia entre el contorno y el
mismo contorno corrido, recortada al original. Es el sombreado de dos tonos de los personajes de Duolingo y, a diferencia del
difuminado que ya tenía (que el motor web no dibuja), **se ve igual en Android, iOS y la web**, y en las 20 poses quietas y los
stickers. Además, en «¿Quién es?» Lany **mira hacia la tarjeta que tocás** (giro de cabeza a izquierda o derecha).

**Cuándo revisarlo.** Si Rive publica herramientas 3D o si Senda tiene presupuesto para un animador, se vuelve a evaluar (regla
de corte: nunca a costa de las expresiones).

## 3. «¿Quién es?» versión 2: preguntás lo que quieras, y Lany tiene cara para cada uno

**El problema (HECHO, pedido del 17-10-2026):** con 12 preguntas fijas no se podía llegar a un solo personaje, y las tarjetas eran
nombre e inicial. **Lo nuevo:**
- **Pregunta libre.** Escribís lo que se te ocurra («¿estuvo en Egipto?», «¿era profeta?», «¿tuvo hijos?») y Lany la **entiende**
  con un banco de **41 rasgos** con palabras clave (sinónimos, formas con y sin acento). Si no entiende, lo dice y ofrece opciones.
- **Sugerencias que cambian.** Lany propone cuatro preguntas que **parten el tablero lo más parejo posible** entre las tarjetas que
  todavía quedan en pie: nunca sugiere algo que ya se preguntó ni algo que no separa a nadie. Por eso siempre se llega a uno.
- **Retratos.** 41 medallones dibujados con código, todos con la misma mano que Lany (formas blandas, luz arriba a la izquierda,
  sin contornos negros): pelo, barba, tocado, ropa y una insignia con el objeto que los identifica (Pedro con la red, Lidia con la
  púrpura, Sansón con el pelo largo porque era nazareo). Pensados desde el texto; nada copia el aspecto de otro juego. Jesús nunca se
  dibuja. Los mismos retratos se usan en «En la frente».
- **Tableros de 12, 16 o 20**, con personajes del Antiguo y del Nuevo Testamento mezclados; las tarjetas muestran época y nombre.
- **Todo verificado:** cada «sí» de cada personaje tiene su versículo leído contra la RV1909 (302 citas); el validador revisa que
  existan y que no haya dos personajes con las mismas respuestas.

## 4. «Vivir la historia» versión 2: para qué sirve decidir

### 4.1 El análisis

**El diagnóstico (HECHO, prueba 16 y pedido del 17-10-2026).** En la primera versión eras un personaje imaginado (un marinero, una
espigadora) y elegías qué hacer, pero las dos opciones llevaban casi siempre a la misma escena: la decisión **no pesaba** y por
eso no se entendía su sentido. El texto bíblico era correcto, pero el juego no tenía objetivo.

**Los cuatro caminos que se evaluaron (INFERENCIA):**

| Camino | Qué sería | Por qué sí | Por qué no |
|---|---|---|---|
| A. Sacarlo | Quedarse con los otros juegos | No agrega riesgo | Se pierde el único juego de rol, que el fundador valora y que pidió explorar en la prueba 16 |
| B. Relato interactivo sin decisiones | Leer la historia con láminas animadas, sin elegir | Fácil de hacer; enseña | Es un libro ilustrado: no es juego, y no responde «para qué elijo» |
| C. Aventura con finales alternativos | Que tus decisiones cambien lo que pasa | Es lo que hacen los juegos de aventura | Cambiaría lo que cuenta la Biblia: prohibido por principio («lo que pasó es lo que cuenta la Biblia») |
| **D. Encrucijadas reales y espejo** | **Decidís donde el personaje tuvo que decidir, ves lo que pasó y por qué, y al final te comparás** | Tiene objetivo (conocerte y entender la decisión del personaje), enseña el texto y la razón, y no altera nada | Exige reescribir las historias con las decisiones reales del texto |

**Se eligió D.** El objetivo del juego queda escrito en la pantalla de inicio: *llegás a las mismas encrucijadas de un personaje de
la Biblia; decidís; ves lo que pasó de verdad y por qué; y al final te mirás en el espejo.* La gracia no es «acertar»: a veces el
personaje decidió mal (Jonás huyó; la multitud quiso hacer rey a Jesús por el pan) y el aprendizaje está en el porqué. Por eso
**no hay puntos por coincidir** y el espejo es neutral: «decidiste como Daniel en 2 de 2» o «Jonás decidió distinto; lo que importa
es el porqué».

### 4.2 Cómo juega

1. Elegís una historia; la tarjeta ya muestra su lámina. Sos el personaje real (Rut, Jonás, el carcelero, Daniel, Ester) o alguien
   que estuvo ahí (un pastor en Belén, uno de la multitud de Juan 6), siempre aclarado.
2. En cada escena, arriba está la **lámina animada** y abajo el texto con su cita («Lo cuenta Rut 1:8-14»), para leer el pasaje.
3. En una **encrucijada**, Lany se pone a pensar y preguntás «¿qué haces?» entre dos o tres opciones. Al elegir, aparece **lo que te
   trae tu decisión** (una o dos frases, marcadas como imaginadas), y enseguida **Lo que pasó** (el texto de la Biblia, con su cita)
   y **Por qué** (la razón que da el texto). La lámina cambia con lo que pasó (el barco zarpa; el mar se aquieta; la cárcel tiembla).
4. Hay preguntas para pensar (sin vidas) y, al final, **el espejo**: cada encrucijada con tu decisión y la del personaje, lo que
   aprendiste, un paso para vivirlo y el capítulo entero para leer.

### 4.3 Las siete historias

| Historia | Pasaje | Quién sos | Encrucijadas |
|---|---|---|---|
| Tu pueblo será mi pueblo | Rut 1–2 | Rut | 4: volver a Moab o seguir con Noemí; salir a espigar o esperar; recibir la bondad de Booz o desconfiar; llevarle todo a Noemí o guardar |
| Huir de Dios por el mar | Jonás 1–4 | Jonás | 5: ir a Nínive o huir; confesar o callar en la tormenta; que te echen al mar o remar; ir la segunda vez; esperar que Nínive arda o alegrarse |
| La noche de Belén | Lucas 2 | Un pastor (imaginado) | 2: ir a Belén ahora o esperar; contar a todos o callar |
| ¿A quién iremos? | Juan 6 | Uno de la multitud (imaginado) | 3: hacerlo rey; buscarlo por pan o por sus palabras; irse o quedarse cuando la palabra se pone dura |
| Medianoche en Filipos | Hechos 16 | El carcelero | 4: el cepo o la compasión; matarse o entrar; preguntar qué hacer para ser salvo; lavar las heridas esa noche |
| La ventana abierta | Daniel 6 | Daniel | 2: orar con la ventana abierta, cerrada o no orar; responder al rey con gloria a Dios o con reclamo |
| Para esta hora | Ester 4–5 | Ester | 3: decir que no puede o ir; callar o ayunar y entrar; acusar a Amán ya o invitar al banquete |

Siete historias, 42 escenas, 23 encrucijadas. Las cinco de la prueba 16 se reescribieron (el marinero pasó a ser Jonás; el preso,
el carcelero) y se sumaron Daniel y Ester.

### 4.4 Las láminas animadas

**Qué son (HECHO).** 16 escenas de 360 × 200 dibujadas con código (`scripts/arte/laminas.py` en la app), en capas que la app anima
en el hilo nativo: el cielo, las colinas, el mar que deriva, el barco que se balancea (más en la tormenta), la lluvia, el rayo que
destella, el fuego que late, las estrellas que titilan, la cortina que se mueve, los leones que respiran. Cada escena tiene
**estados** (el mar en calma, tormenta y quieto; la noche de Belén en noche, ángel, coro y amanecer; la cárcel en noche, terremoto y
luz) y la app **funde** las capas cuando la historia cambia de estado. En total 124 capas; el archivo pesa 162 KB (no son videos: no
pesan ni gastan datos). Con «reducir movimiento», las láminas quedan quietas.

**Reglas.** Las personas son siluetas sin cara; **Jesús nunca se dibuja** (en el pesebre hay luz, no un niño; en el monte hay
multitud, no un maestro). El estilo es el de los retratos y de Lany: formas blandas, luz arriba a la izquierda, sin contornos negros.

### 4.5 Verificación

El validador de contenido se amplió: cada escena lleva a otra que existe y hay un final; cada encrucijada tiene dos o más opciones
con su eco imaginado (sin citas bíblicas), la opción que coincide con el texto existe, **lo que pasó** se cita y lo que va entre
comillas está textual en ese pasaje de la RV1909; el porqué, el final y las explicaciones, textuales en algún lugar de la RV1909; y
cada lámina y estado que se nombra existe. Las siete historias pasan.

{{PANTALLAS19}}

## 5. Color y UX: más vivo, sin perder sobriedad

**Benchmark (HECHO, 17-10-2026; bitácora `conocimiento/2026-10-17-senda-benchmark-ux-color-sonido.md`).** Duolingo usa un acento
por sección y personajes 2D con volumen; Candy Crush atrae con saturación alta sobre fondos oscuros y recompensas que explotan en
color; Headspace y Calm cambian la paleta con la hora del día; los juegos de mesa de tableta (ajedrez, cartas, el juego de la vida)
tienen música de fondo baja, instrumental y en bucle, apagable. **Lo que se aplicó:**
- **Un acento por pestaña:** Inicio sol, Biblia cielo, Travesía menta, Jugar coral, Comunidad uva. La barra de abajo se tiñe con el
  color de la pestaña activa; cada pantalla tiene su halo de fondo y sus tarjetas con tinte.
- **Inicio por hora:** la cabecera pasa del amanecer (naranja y violeta) al día (celeste y azul), al atardecer (coral y uva) y a la
  noche (violeta profundo).
- **Jugar con tarjetas de color:** cada juego con su loseta, su disco de ícono y su etiqueta («nuevo», «para grupos»).
- **Botones de cuatro tonos** (cielo, coral, uva, menta) además del ámbar, para que no todo sea el mismo botón.
- La sobriedad se cuida con fondos oscuros y texto claro: el color vive en acentos, halos y tarjetas, no en pantallas enteras.

## 6. La música: diagnóstico, criterio y candidatas

**Diagnóstico (INFERENCIA sobre las cinco músicas de inicio anteriores).** Lo que fallaba no era el estilo sino la **producción**:
sonaban sintetizadas o de biblioteca vieja. Apple, los juegos de mesa de tableta y las apps grandes usan temas de compositores con
instrumentos reales o producción de estudio, motivos cortos, cálidos y modernos, y nunca melodías infantiles ni tristes.

**Criterio nuevo (HECHO).** Tres condiciones: cálido, moderno y con instrumentos reales; sin voz, sin aire infantil; y licencia para
apps. La fuente: **Mixkit** (licencia Mixkit Stock Music Free: uso comercial sin atribución; igual se acredita en
`assets/sonidos/CREDITOS.md`). Verificado el 17-10-2026.

**Lo que hay en la app.**
- **Inicio:** «Driving Ambition» (Ahjay Stelino): piano, cuerdas y batería que crece, de presentación de producto. La firma de Senda
  (al abrir, una vez por día) sale del mismo tema.
- **Ocho alternativas** de inicio en la Consola (pestaña Sonidos): pop luminoso, ukelele y palmas, guitarra acústica, piano solo,
  pizzicato, y otras. **El fundador elige**; la que marque pasa a la app.
- **Música de fondo en los juegos:** un bucle de 64 segundos sin costura para cada juego (Espadeo, «¿Quién es?», «En la frente»,
  «Antes o después» y «Vivir la historia»), a volumen bajo, que se pausa cuando la app pasa a segundo plano y se apaga en Ajustes
  («Música en los juegos»).

## 7. Difusión: métodos concretos, baratos y legales

**Principios.** Sin mostrar a nadie (habla Lany); canales donde ya hay gente que busca (la tienda, Google, las iglesias, los grupos
de jóvenes); todo se mide (instalaciones por canal con enlaces de referencia de Google Play) y se corta lo que no funciona.

**A quién.** En Argentina los evangélicos son el 11,7 % según la encuesta CEIL-CONICET y Management & Fit (2025; 15,3 % en la
encuesta de 2019) y entre los jóvenes de 16 a 34 años el 29,4 % no tiene religión (HECHO, 18-10-2026, prensa de la encuesta;
re-verificar en el informe). Brasil tiene 47,4 millones de evangélicos (censo 2022). El público de Senda no son «los cristianos»
sino **los jóvenes de iglesias evangélicas y sus líderes**: ahí se concentra la primera ola.

### 7.1 Los métodos, en orden de valor por peso

| # | Método | Cómo, concreto | Cuesta | Quién lo hace | Cómo se mide |
|---|---|---|---|---|---|
| 1 | **La ficha en Google Play (ASO)** | Título de 30 caracteres («Senda: Biblia y trivia»), descripción corta de 80 con las palabras que la gente busca («biblia», «trivia bíblica», «juegos cristianos», «Reina Valera»), descripción larga en lenguaje natural (Google indexa todo el texto visible), 8 capturas con una frase cada una, ícono con la puerta abierta; después, **experimentos de ficha** en Play Console (ícono, capturas, descripción corta; el título no se puede probar) | USD 0 | Claude escribe y arma; el fundador pega | Conversión de la ficha (visitas → instalaciones) en Play Console |
| 2 | **Videos cortos sin cara** (TikTok, Reels, Shorts) | La fábrica ya arma 7 por semana desde la trivia; sumar los formatos «¿Quién soy?» (pistas y retrato), «versículo animado» y «Antes o después». Publicar uno por día; siempre con el enlace de la tienda en la bio | USD 0 | Claude arma; el fundador publica (10 min por día) | Visitas a la ficha desde cada red (enlace con referencia) |
| 3 | **Líderes de jóvenes** (el canal que vende por el fundador) | Un **kit de líder**: una diapositiva para el anuncio del domingo con QR, un mensaje de WhatsApp listo para el grupo, una «noche de trivia» con las preguntas de Senda para jugar en grupo (hoy desde un teléfono; después, el modo proyector votado). Empezar por el ministerio aliado y las iglesias que conoce el fundador | USD 0 | Claude arma el kit; el fundador lo manda a 10 líderes | Instalaciones con el enlace de cada iglesia |
| 4 | **Sorteos** | Ver 7.2: solo con bases y condiciones, premio chico y, si se dirige a CABA, con autorización; preferir **concursos de habilidad** (el mejor puntaje de la semana en el Espadeo, con registro de resultado) que no son juego de azar | Premios: Biblias RVR1960 (ARS 25.000 a 40.000 cada una, estimación) | El fundador decide y paga | Participantes e instalaciones durante la semana |
| 5 | **Pre-registro en Google Play** | Abrir la ficha hasta 90 días antes del lanzamiento (desde mediados de noviembre para el 18-12): los que se anotan reciben la app sola el día que sale. Sin premio de pre-registro (exige un producto dentro de la app, y Senda sale sin compras) | USD 0 | Claude prepara; el fundador publica | Pre-registros |
| 6 | **Desafío de Adviento (29-11)** | El desafío con fecha ya está en la app; se promociona en las redes y con los líderes: «27 días hasta Navidad, con la Biblia». Es el gancho perfecto para el lanzamiento | USD 0 | Claude arma los videos del desafío | Anotados al desafío |
| 7 | **Stickers de Lany en WhatsApp** | Los 13 stickers ya hechos, empaquetados para WhatsApp; cada paquete lleva el nombre Senda y se comparte solo de grupo en grupo | USD 0 | El fundador publica el paquete | Descargas del paquete |
| 8 | **El sitio de respuestas (SEO)** | Las guías de los 66 libros y «¿Quién fue…?» como páginas que Google indexa (como hace Bible Chat), cada una con el botón de la tienda; en Cloudflare Pages | USD 0 (dominio: unos USD 10 por año) | Claude genera; el fundador crea la cuenta | Visitas de Google → instalaciones |
| 9 | **Reseñas en la tienda** | Pedir la reseña en el momento justo (al terminar una historia o ganar una pieza) con el diálogo oficial de Play, nunca con premios | USD 0 | Claude lo programa | Reseñas y nota en la ficha |
| 10 | **Iglesias y medios cristianos** | Nota de prensa breve y Lany para radios y portales evangélicos de Argentina; un correo por semana desde appsenda.ok@gmail.com | USD 0 | Claude redacta; el fundador aprueba y manda | Menciones e instalaciones |
| 11 | **Publicidad paga** | Recién en Semana Santa de 2027, prueba de USD 100 a 200 en Google Ads para apps con regla de corte (plan del capítulo 43) | USD 100 a 200 | El fundador | Costo por instalación y retención a 7 días |
| 12 | **«10 kits por puntos»** (anotado el 19-10-2026 para cuando se vea la difusión) | Diez kits (Biblias, remeras de Lany o un kit de líder impreso) para las primeras diez personas o diez iglesias que junten X puntos en toda la app, con canje desde la app (un código que se muestra al llegar). Si gana el puntaje, es **concurso de habilidad** (sin trámite de sorteo); si se sortea entre los que llegan, lleva bases y, en CABA, autorización (§7.2). Necesita cuentas para contar puntos por iglesia | Los kits (ESTIMACIÓN: ARS 30.000 a 60.000 cada uno) | El fundador decide y paga; Claude arma las bases y el canje | Inscriptos, puntos y canjes |

### 7.2 Sorteos: el marco legal (HECHO, 18-10-2026; verificar con un abogado antes del primero)

- **Argentina.** Las promociones con sorteo se autorizan por jurisdicción. En la Ciudad de Buenos Aires, un estudio jurídico
  indica que LOTBA S.E. (Lotería de la Ciudad) es la autoridad que autoriza y fiscaliza los sorteos promocionales, que la
  autorización hace falta aunque no se exija compra, y que hay que presentar bases y condiciones y pagar un canon (fuente
  secundaria; no se encontró la página oficial del trámite). Las provincias tienen regímenes propios (Río Negro y Tierra del Fuego,
  por ejemplo, exigen escribano). **Un concurso de habilidad** (gana el mejor puntaje, no la suerte) no es un sorteo: es la vía
  recomendada para empezar, con bases publicadas igual.
- **Meta (Instagram y Facebook).** Las normas de promociones piden bases oficiales, requisitos de participación, cumplir la ley
  local, que cada participante libere a Meta de responsabilidad y reconozca que la promoción no está patrocinada ni administrada
  por Meta, y **prohíben exigir o incentivar compartir, republicar o etiquetar a otros** (texto de las políticas para páginas, grupos
  y eventos, consultado el 18-10-2026). O sea: nada de «etiquetá a tres amigos».
- **Google Play.** La política de juegos de azar y concursos no regula los sorteos fuera de la app, pero sí los programas con
  premios dentro de la app: bases publicadas en la app, cantidad fija de ganadores y fecha, y nada que se pague para participar.
  Senda no va a hacer sorteos dentro de la app.
- **Premios.** Biblias impresas, suscripciones de Senda cuando existan, y nada de dinero.

### 7.3 Plan de 90 días (noviembre a enero)

| Semana | Qué |
|---|---|
| 1 a 2 (nov) | Cuenta de Google Play; ficha con ASO; pre-registro abierto; cuentas de redes creadas; primer lote de videos publicado; kit de líder a 10 líderes |
| 3 a 4 | Prueba cerrada con 12 testers (líderes y jóvenes del ministerio aliado) durante 14 días; videos del desafío de Adviento |
| 5 a 6 (dic) | Lanzamiento el 18-12 con el desafío de Adviento ya en marcha; pedido de reseñas; nota a medios |
| 7 a 10 (ene) | Primer concurso de habilidad (mejor puntaje de la semana); el sitio de respuestas; «21 días con Jesús» (1 al 21 de enero) |
| 11 a 13 | Medir por canal, cortar lo que no trae instalaciones y preparar Semana Santa |

## 8. Cobros: qué hacer desde ahora para poder cobrar anuncios y suscripciones

Lo que ya estaba investigado (capítulo 43 §2) sigue vigente; esto es **la lista en orden**, con lo que hay que hacer desde ahora.
Todo lo que implica abrir cuentas o pagar es decisión del fundador (regla 8).

| # | Cuándo | Qué | Detalle (HECHO salvo indicación; centros de ayuda de Google y fuentes citadas, 18-10-2026) |
|---|---|---|---|
| 1 | Ahora | **Cuenta personal de Google Play** (USD 25, una vez) | El nombre legal y la dirección salen del perfil de pagos y se verifican antes de publicar; se verifican correo y teléfono; en la ficha se muestran el nombre legal, el país y el correo del desarrollador; **si se monetiza, se muestra la dirección completa** (por eso Senda sale sin compras dentro de la app). El pago se verifica con un depósito; hasta 5 días |
| 2 | Ahora | **Prueba cerrada de 12 testers por 14 días seguidos** | Obligatoria para cuentas personales creadas después del 13-11-2023; cumplirla no garantiza el acceso a producción (Google revisa) |
| 3 | Ahora | **Público objetivo 13 años o más** en la Consola | Evita las reglas de la política de familias (anuncios certificados, restricciones); la declaración tiene que ser veraz |
| 4 | Ahora | **Política de privacidad en una URL pública** y formulario de seguridad de datos | Hace falta un sitio: Cloudflare Pages (gratis) con un dominio (unos USD 10 por año) |
| 5 | Al tener el sitio | **app-ads.txt** en el sitio del desarrollador que figura en la ficha | Desde enero de 2025 las apps nuevas de AdMob tienen que verificar la propiedad; sin eso, los anuncios se limitan |
| 6 | Al tener la cuenta de Play | **Cuenta de AdMob** | Revisión hasta 24 horas (a veces dos semanas); recomiendan teléfono local, identidad y banco. Umbrales: USD 10 para verificar identidad y elegir forma de pago, **USD 100 para cobrar** |
| 7 | Antes del primer pago | **Caja de ahorro en dólares** a nombre del titular del perfil, y **monotributo con factura E** | Capítulo 43 §2; desde la «A» 8481 del BCRA los dólares pueden quedar en dólares. Alternativa nueva: desde el 30-10-2025 Google habilitó **PayPal Hyperwallet** para editores de Argentina (prensa especializada; verificar en la cuenta) |
| 8 | Antes del primer pago | **Formulario W-8BEN** en AdMob y Play | Persona física sin actividades en EE.UU. |
| 9 | Antes de lanzar | **Consentimiento de anuncios** (UMP) y anuncios no personalizados por defecto | Por si hay usuarios en la Unión Europea; no cuesta nada |
| 10 | 2027 | **Verificación de desarrollador de Android** (fuera de la Play Console) | Google verifica a todos los desarrolladores con documento y USD 25: empezó el 30-9-2026 en Brasil, Indonesia, Singapur y Tailandia y se extiende al mundo en 2027 (prensa y blogs especializados; verificar en la documentación oficial). Quien ya tiene Play Console verificada tiene el camino corto |
| 11 | Diciembre | **Decidir la SAS** (crearla en enero) | Capítulo 43 §2: antes de prender las suscripciones y para las licencias |
| 12 | Al prender suscripciones (feb–mar 2027) | **Facturación de Play** (suscripciones), botón de arrepentimiento y de baja | Ya comprometidos en los términos (Disposición 954/2025) |

**Lo que no quedó confirmado:** los umbrales de AdMob para pagos en Argentina (la tabla oficial no lista el peso argentino), si la
transferencia bancaria sigue disponible en el país además de Hyperwallet, y la fecha exacta de la verificación global de
desarrolladores. Se verifica en las cuentas cuando existan.

## 9. Contenido: trivia de 560 y 10 de 66 libros jugables

- **Trivia, banco 3:** 150 preguntas nuevas (25 por pieza), cada una leída al lado de su versículo en la RV1909 y con su palabra
  clave en el texto (`scripts/autor/trivia_banco3.py --revisar`). El Espadeo tiene **560 preguntas**.
- **Libros jugables:** **Joel** (5 niveles: la plaga, tocad trompeta en Sión, derramaré mi Espíritu, el valle de la decisión y
  Pentecostés) y **Sofonías** (5: el día de Jehová, buscad a Jehová, la ciudad opresora y el resto humilde, canta hija de Sión) entre
  los doce profetas; y nace la ruta **«Las cartas»** con **Filemón** (2), **2 y 3 Juan** (2) y **Judas** (3). Lo que apunta a Cristo
  va marcado como lectura cristiana; las fechas, como estimaciones; las notas de tradición, con su fuente. **Van 10 de 66.** La
  Travesía suma **261 lecciones** y 378 niveles.
- **Quién es quién, capítulo 3** («Poetas y profetas») queda para la prueba 20.

## 10. Cómo probar la prueba 19 y lo que sigue

**Probar (pendiente probar19 en la Consola), cuando pueda:** instalar el APK prueba 19 (trae lo de la 17 y la 18); mirar a Lany de
cerca (el volumen) y el ajuste «Fiesta en 3D» con VER; jugar «¿Quién es?» escribiendo preguntas; una historia entera de «Vivir la
historia» (Jonás o el carcelero) hasta el espejo; escuchar la música de inicio y la de fondo en el Espadeo; en la Consola, elegir la
música de inicio entre las nueve.

**Decisiones del fundador:** la música de inicio (Consola); si se empieza la difusión (cuentas) y con qué métodos de §7; la cuenta de
Google Play antes del 15-11 (§8); Max y la SAS (capítulo 43).

**Lo que sigue:** Quién es quién capítulo 3; más libros jugables (Amós, Miqueas, Nahúm; Santiago y 1 Pedro); más historias para
«Vivir la historia» (Pedro, José, David en la cueva); el kit de líder y los videos de Adviento; el sitio de respuestas cuando exista
Cloudflare; Senda Reunión cuando exista Supabase.
