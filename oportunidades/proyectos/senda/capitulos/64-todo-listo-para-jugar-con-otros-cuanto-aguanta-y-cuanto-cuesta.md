# Todo listo para jugar con otros, cuánto aguanta y cuánto cuesta (la prueba 38)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 25-10-2026 el fundador pidió siete cosas: revisar todas las interacciones (las suyas con la gente y las de
la gente entre sí) y dejarlas listas para que el día del lanzamiento «al descargar la app ya se pueda jugar entre personas, armar los
grupos, armar el grupo de iglesia, cargar el PDF… todas las funcionalidades OK»; preguntas con curiosidades; una línea con cuánta
gente aguanta la app hoy y cuánto costaría crecer; sacar «Para tu vida»; textos de la RV1909 que no se entienden («allegarse ha»);
carteles tapados; y visuales que no tenían que ver con la lección. **Todo lo social quedó listo y probado de punta a punta contra una
base igual a la de Supabase (69 pasos, 69 bien)**, con la **sala en vivo**, la **trivia del sermón desde el PDF** y **regalar Max**
(§2). La app **aguanta hoy unas 5.700 personas por mes gratis**, y crecer cuesta **USD 25 a 40 por mes hasta las 100 mil** (§3).
**56 curiosidades** nuevas en la trivia y **Nahúm y Malaquías** jugables (§4). «Para tu vida» salió, los textos difíciles se leen en
una versión de hoy, los carteles miden su texto y 73 visuales que no correspondían se sacaron (§5). **APK 38**, con todo (§7).
</div>

## 1. Lo que dijo el fundador y dónde quedó

| Lo que dijo (resumen) | Dónde quedó |
|---|---|
| «Revisar todas las interacciones… dejar bien seteado» y «que el día que publiquemos, al descargar la app ya se pueda jugar entre personas, armar los grupos, el grupo de iglesia, cargar el PDF… todas las funcionalidades OK» | §2 |
| «Preguntas con curiosidades, cosas que la gente seguramente no sepa, y que están en la Biblia» | §4: banco 36, 56 preguntas |
| «Una línea donde vea cuántos usuarios soportaría hoy la app… y cuánto podría llegar a costar» | §3 y la Consola (Proyecto → «Cuánta gente aguanta y cuánto cuesta») |
| «Eliminar "Para tu vida" de las travesías» | §5: salió de las 451 lecciones; el validador no deja que vuelva |
| «Seguir corrigiendo textos (lección de Eva, "allegarse ha" ni se entiende)» | §5: los ejercicios difíciles se leen en la PDT o la NBV |
| «Hay carteles que se siguen tapando» | §5: el globo del nivel va arriba y cada cartel mide su texto |
| «¿Por qué aparece el templo de Salomón en "Santo, justo y verdadero"? … revisá que esté bien ligado» | §5: 73 visuales sacados, uno corregido, y el validador lo controla |
| «Sigamos a full con contenido, trivia y todo lo próximo» | §4 |

## 2. Todo lo social, listo para el lanzamiento

El pedido era que el día del lanzamiento todo funcione sin tocar nada más. Para eso se armó en la app una **prueba de la base**
(`pruebas/nube/`): levanta un Postgres igual al de Supabase (los mismos roles, la misma forma de saber quién es cada uno), aplica
todas las migraciones y recorre lo que hacen las personas, cada una con su cuenta. Corre en GitHub antes de tocar la base real: si
falla, la base no se toca.

**Lo que recorre (69 pasos, 69 bien):**

| Qué | Lo que se prueba |
|---|---|
| Cuentas y amigos | Cada persona con su apodo y su código; agregar por código; ver solo lo propio |
| Duelos | Por código, con un amigo y al azar; turnos; el turno que se reintenta (sin señal) no se cuenta dos veces; vencidos a las 72 horas |
| Grupos | Crear, unirse con código, roles (líder, ayudante, miembro), sacar a alguien, salir; si el líder se va, el liderazgo pasa solo |
| Eventos y encuestas | Los del fundador para todos y los del grupo para los suyos; votar una vez; nadie más puede publicar para todos |
| Copas y torneos | La marca oficial la corrige la base contra la clave de cada pregunta; la tabla por todos, país o grupo |
| La trivia del sermón | Solo el líder con Max (o la de prueba sin Max); cuántas le quedan; revisar y publicar; los del grupo la juegan |
| La sala en vivo | El líder la abre, la gente entra con el código, todos responden la misma pregunta; suma el que acierta y más rápido; la respuesta repetida no suma dos veces |
| Avisos y limpieza | El token de cada teléfono; la cola de avisos; la limpieza de cada noche |

**Lo que encontró y se arregló (HECHO):** el turno de un duelo reintentado daba «no es tu turno»; abrir una sala chocaba con la
seguridad de la base; la sala devolvía otro puntaje cuando el teléfono reenviaba la respuesta; y la limpieza de lo viejo estaba
prevista pero nunca programada (§3).

**Lo nuevo en la app:**

- **La sala en vivo** (Comunidad → «Sala en vivo», o desde el grupo): el líder abre la sala y muestra el código; la gente entra con su
  apodo; cuando hay dos o más, «Empezar». Cada pregunta tiene 20 segundos y su reloj; al terminar se ve la respuesta con su cita y la
  tabla; al final, el podio. Se juega con preguntas del Espadeo o con la trivia del sermón.
- **La trivia del sermón desde el PDF** (en la página del grupo): el líder escribe el título, elige el PDF (hasta 6 MB) y Senda arma
  las preguntas con su cita; el líder las lee, saca las que no le gusten con un toque y publica. Desde ahí el grupo la juega sola, en
  el mismo teléfono o en una sala en vivo. El PDF no se guarda en ningún lado.
- **Regalar Max o Premium** (Ajustes → «Senda para todos», solo con la cuenta del fundador): con el código de amigo de un líder, 30,
  90 o 365 días. Sirve para las iglesias piloto mientras las compras de Google Play esperan la cuenta y los precios.
- **El despliegue automático:** al subir cambios a la base, GitHub corre la prueba, aplica las migraciones y publica las dos funciones
  de borde (la del sermón y la de compras).

**Lo que falta para que funcione con gente de verdad** está en el mensaje final y en la Consola (pendiente «juntos_cuentas»):
activar las cuentas anónimas en Supabase (sin captcha), cargar la clave de Claude para los sermones, marcar tu perfil como
administrador y regalar Max a los líderes piloto. Las compras de Google Play esperan la cuenta de Play y la decisión de precios
(DEC-2026-10-24-4).

## 3. Cuánta gente aguanta y cuánto cuesta crecer

El modelo vive en la app (`scripts/economia/capacidad.py`, explicado en `docs/CAPACIDAD.md`) y se ve en la Consola como una
escalera de tarjetas. Toma cada cantidad de personas activas por mes y calcula lo que la app gasta en cada límite de los proveedores:
la base, el tráfico, las cuentas, los pedidos por segundo en la hora pico, los eventos de métricas y los sermones.

- **Hoy (Supabase gratis) aguanta unas 5.700 personas activas por mes** (unas 1.100 por día). El primer tope es el tráfico (5 GB por
  mes). La alarma del 70 % suena cerca de las **4.100**: ahí se pasa a Supabase Pro, USD 25 por mes.
- **Tramo por tramo** (servidor = Supabase, métricas y avisos; los sermones van aparte porque los paga Max, con el precio todavía en
  decisión):

| Personas por mes | Plan | Servidor por mes | Sermones / lo que deja Max |
|---|---|---|---|
| 1.000 | gratis | **Gratis** | USD 3 / USD 15 |
| 5.000 | Pro · Micro | **USD 25** | USD 17 / USD 76 |
| 10.000 | Pro · Micro | **USD 25** | USD 35 / USD 153 |
| 25.000 | Pro · Micro | **USD 31** | USD 87 / USD 382 |
| 50.000 | Pro · Micro | **USD 31** | USD 174 / USD 764 |
| 100.000 | Pro · Small | **USD 40** | USD 347 / USD 1.527 |
| 250.000 | Pro · Medium | **USD 202** | USD 868 / USD 3.819 |
| 500.000 | Pro · Large | **USD 702** | USD 1.736 / USD 7.637 |
| 1.000.000 | Pro · XL | **USD 1.782** | USD 3.472 / USD 15.274 |

- **Lectura:** hasta unas 4 mil personas, USD 0; de 5 mil a 100 mil, USD 25 a 40 por mes. Pasando las 100 mil, lo que más pesa es
  lo que cobra Supabase por cada cuenta activa; por eso, desde las 250 mil, el aviso push se guarda sin cuenta y la cuenta se despierta
  solo al usar lo social. Con un millón de personas por mes, el servidor sale unos USD 1.800 por mes (menos de un centavo por persona).
- **Los sermones** cuestan unos USD 0,25 cada uno con el modelo más capaz de Claude; un líder que arma cuatro por mes gasta USD 1 y
  deja USD 5 con Max.
- **Para que entre más gente gratis, esta prueba agregó:** la limpieza de cada noche (respuestas de más de 30 días, ya resumidas;
  salas viejas; duelos de más de 180 días; votos de encuestas cerradas), que duplica lo que aguanta la base gratis; y la sala en vivo
  más liviana (durante la pregunta pide solo el estado, no la tabla): la mitad de pedidos.
- **Qué es dato y qué es estimación:** los precios son HECHOS con fuente y fecha (Supabase, PostHog, Expo y Claude, 25-10-2026); el
  consumo por persona es ESTIMACIÓN (20 % de la gente del mes entra cada día, 30 respuestas y 80 KB de tráfico por día, 1 de cada 10
  juega una sala por semana). Con las primeras 500 personas se mide en el panel de Supabase y en PostHog, se cargan los números
  reales y se vuelve a correr. Los precios se re-verifican en la fuente antes de gastar.

## 4. Curiosidades, Nahúm y Malaquías

- **«¿Sabías que…?» (banco 36): 56 curiosidades** que casi nadie conoce y están en el texto: el gigante de Gat con veinticuatro
  dedos, el velo de Moisés, Raquel sentada sobre los ídolos de su padre, el muerto que revivió al tocar los huesos de Eliseo, el
  templo que se construyó sin ruido de martillos, el púlpito de madera de Esdras, el silencio de media hora en el cielo, las letras
  grandes de Pablo en Gálatas… Cada una sobre un versículo que ninguna pregunta usaba, leída contra la RV1909 y su forma en la RVR1960
  (cuando las dos dicen distinto, la pregunta no depende de esa palabra). En la trivia aparecen con la etiqueta «Curiosidad», y al
  responder, «¿Sabías que…?» con un dato más y su cita. **La trivia queda en 2.214 preguntas** (meta de Pascua: 4.000).
- **Nahúm** (6 lecciones): la ciudad que se arrepintió con Jonás vuelve a la violencia y Dios anuncia su caída; Dios tardo para la ira,
  justo y «bueno para fortaleza en el día de la angustia»; las buenas nuevas sobre los montes y su eco en Romanos 10:15.
- **Malaquías** (6 lecciones): el último libro del Antiguo Testamento; el pueblo que pregunta «¿En qué…?»; el mensajero que prepara el
  camino (Juan el Bautista, según Jesús); el Sol de justicia y Elías, y la página siguiente: Mateo. El diezmo se cuenta como lo que Dios
  le reclamaba a Israel en su ley, con su contexto de Nehemías 13, sin tomar posición sobre doctrinas de hoy.
- **La Travesía queda en 451 lecciones.** «Los doce profetas» tiene 11 de 12 (falta Zacarías).

## 5. Textos, carteles y visuales

- **«Para tu vida» salió** de todas las lecciones; el validador da error si alguna lo vuelve a traer.
- **«Allegarse ha» y compañía:** cuando el versículo de un ejercicio en la RV1909 no se entiende, el ejercicio se lee en la versión
  libre de hoy que lo dice mejor (la PDT o la NBV), con su nombre a la vista («Está en Génesis 2:24 · PDT»). El validador comprueba
  esas citas contra el texto de esa versión. Se hizo así con Génesis 2:24 y otros nueve versículos.
- **Carteles tapados:** el globo del nivel ahora va por encima del cartel del capítulo, y cada cartel mide su texto (con la letra
  grande del teléfono incluida) antes de ubicarse, así el camino deja el lugar justo.
- **Visuales que no tenían que ver:** se revisaron uno por uno contra la lección. **73 se sacaron** (entre ellos, el templo de Salomón
  en «Santo, justo y verdadero» y Juan en Patmos en la lección siguiente: no decían nada de esas lecciones) y dos se corrigieron. Ahora
  hay una lista de lecciones que van sin visual a propósito y el validador avisa si uno vuelve.
- **Los diagramas, más claros:** «Paso 2 de 5», un botón redondo con flecha para seguir y la fuente plegada al pie.

## 6. Lo que se probó y lo que no

- **Probado:** la prueba de la base (69 de 69, local y en GitHub); el validador («Todo en orden»: 2.214 preguntas, 451 lecciones);
  «empezar por el principio» (sin hallazgos); la prueba de arranque (6 de 6); el chequeo de tipos; la recorrida de la vista previa por
  el grupo, el sermón y la sala en vivo (sin errores); la auditoría de textos (§7).
- **No probado:** todo lo social con la base viva y teléfonos reales (falta activar las cuentas); el sermón con un PDF real (falta la
  clave de Claude); las compras de Google Play (falta la cuenta de Play).

## 7. El APK 38

Como siempre, **trae absolutamente todo lo anterior**. Versión 0.38.0 (código 39), con R8. Antes de compilar pasaron el validador,
la prueba de la base, la prueba de arranque y la auditoría de textos. Lo que hay que mirar está en la Consola (pendiente «probar38»).

## 8. Pendientes y decisiones

- **Del fundador:** activar las cuentas anónimas de Supabase, la clave de Claude, marcarse administrador y regalar Max a los líderes
  piloto (pendiente «juntos_cuentas»); probar el APK 38; los planes y precios (DEC-2026-10-24-4); la marca en el INPI; Google Play
  antes del 15-11; lo de antes (consulta SBA, abogado de PI, autorización del ministerio, sitio, voz).
- **Próxima prueba (39):** Zacarías y Reyes; la trivia hacia Pascua (más curiosidades y el banco en portugués hacia 150 por pieza);
  la segunda ruta en portugués e inglés; lo que traiga el fundador del APK 38.
- **Después:** las compras de Google Play con los precios decididos; guardar la cuenta con correo o Google; el progreso en la nube.
- **Decisiones:** DEC-2026-10-25-4 (la prueba 38).
