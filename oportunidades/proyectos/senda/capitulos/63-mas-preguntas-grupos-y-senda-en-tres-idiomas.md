# Más preguntas, grupos y Senda en tres idiomas (la prueba 37)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 24-10-2026 el fundador pidió tres cosas: «Subamos el stock de preguntas, siento que se va a quedar
corto»; dejar para después los planes, Supabase, Expo y Firebase; y «avancemos con todos los próximos mientras tanto». La trivia pasó
de **788 a 2.150 preguntas** (y la meta del lanzamiento, contada por nivel, quedó cumplida); llegaron los **grupos**, los **eventos
para todos**, la **encuesta del día en vivo**, la **tabla de la copa** y los **torneos**; **Amós, Miqueas y Samuel** entraron a la
Travesía (439 lecciones); **«El gran relato» está entero en inglés** y la trivia tiene su **primer banco en portugués**. En el medio,
el fundador decidió terminar Expo y Firebase en el momento: con su extensión de Claude en el navegador quedó cargada la clave de los
avisos (§6). **R8 achicó la app de 95,9 a 87,1 MB**, probado antes en un emulador (§8). **APK 37**, con todo (§9).
</div>

## 1. Lo que dijo el fundador y dónde quedó

| Lo que dijo (resumen) | Dónde quedó |
|---|---|
| «Subamos el stock de preguntas, siento que se va a quedar corto» | §2: de 788 a 2.150 |
| «Luego decidimos lo de los planes; lo de Supabase y Expo y Firebase también lo veo después» | Los planes siguen esperando (DEC-2026-10-24-4); Supabase, cuando decida |
| «Avancemos con todos los próximos mientras tanto» | §3 (grupos y eventos), §4 (Amós, Miqueas, Samuel), §5 (inglés y portugués), §8 (R8) |
| La búsqueda del INPI de «SENDA» y «LANY» y «¿cómo seguimos?» | §7 (DEC-2026-10-25-1) |
| «Iniciaríamos solo con monotributo… sin SAS por ahora» | §7 (DEC-2026-10-25-2) |
| «¡No! Quiero hacerlo ahora… tengo la extensión de Claude. Quiero dejarlo resuelto» (Expo y Firebase) | §6: hecho el 24-10 a la noche |
| «Me estás diciendo esto desde hoy y no veo nada en ningún lado» | §6: el fundador ve solo el último mensaje de cada turno; regla nueva |

## 2. La trivia: de 788 a 2.150 preguntas

- **27 bancos nuevos (9 a 35)**, cada pregunta sobre un versículo que ningún banco usaba, leída contra la RV1909. Un taller común
  (`scripts/autor/trivia_taller.py`) controla la cita, el largo de la correcta, el versículo repetido y que la palabra clave esté en
  el versículo; el validador rechaza la correcta que se adivina por el largo y la cita metida en el enunciado.
- **La meta se cuenta por nivel, no en total.** El dosificador le da a cada jugador sobre todo dos niveles vecinos: el principiante
  juega casi todo fáciles y el experto casi todo muy difíciles. Los que más juegan agotan primero los extremos. Por eso la meta del
  lanzamiento es por nivel, y quedó cumplida:

| | Fácil | Media | Difícil | Muy difícil | Oro | Total |
|---|---|---|---|---|---|---|
| Meta del lanzamiento (18-12) | 580 | 400 | 400 | 540 | 80 | 2.000 |
| **Hoy** | **580** | **523** | **412** | **542** | **93** | **2.150** |
| Meta de Pascua 2027 | 1.160 | 800 | 800 | 1.080 | 160 | 4.000 |

- **Cuánto se repite hoy** (simulación con el dosificador real y la memoria de lo visto; % de preguntas que vuelven antes de 30 días):
  quien juega 15 por día casi no repite en tres meses; el jugador medio que juega 30 por día repite una de cada veinte; los extremos
  que juegan 30 por día empiezan a repetir a las tres semanas, y eso lo cubre la meta de Pascua (detalle en `docs/SUSCRIPCIONES.md`
  §4 de la app). Una pregunta que vuelve después de un mes es repaso, no molestia.
- **Entre «» va solo la Biblia, textual:** se sacaron las comillas de las opciones que no eran texto bíblico y el validador revisa
  cada cita entre «» contra la RV1909 entera (490 citas, ninguna mal).
- **De paso, la Biblia de Senda:** Absalón, Joás, Elí, Bet-horón y otros nombres que quedaban con la grafía de 1909 ahora se escriben
  como hoy, y 41 mayúsculas de apertura sueltas («Y Fue» → «Y fue») se corrigieron. Las palabras del texto no cambian.

## 3. Grupos, eventos para todos, la encuesta del día, la copa y los torneos

Lo que quedó de la prueba 36 para la 37 (el esquema estaba en la base desde la prueba 34):

- **Grupos** (Comunidad → Grupos): crear uno (jóvenes, familia, célula…), unirse con el código de seis letras, roles **líder,
  ayudante y miembro** (si el líder se va, el liderazgo pasa solo), el calendario del grupo, los miembros y renovar el código.
- **Eventos para todos:** lo que crea la cuenta del fundador («Senda para todos») o un líder aparece en Inicio, en Comunidad y en el
  calendario de cada persona, con aviso una hora antes.
- **La encuesta del día en vivo**, en Inicio: los resultados se mueven mientras la gente vota; la publica la cuenta del fundador
  (pregunta, opciones y cuántos días dura).
- **La tabla de la copa:** la marca oficial de cada copa sube a la nube y la tabla se filtra por todos, país o grupo. **Torneos del
  grupo:** quince preguntas, las mismas para todos, una sola vez, con su tabla. **El puntaje lo recalcula la base** contra la clave de
  las preguntas: nadie puede inflarlo desde el teléfono.
- Las reglas están cerradas del lado del servidor (migración `20261107000000_grupos.sql`), con unos 140 textos nuevos en los tres
  idiomas.

**Se ven en la vista previa; funcionan de verdad cuando se activen las cuentas anónimas en Supabase** (el fundador lo dejó para
después).

## 4. Más Biblia para recorrer: Amós, Miqueas y Samuel

- **Amós** (6 lecciones, «Los doce profetas»): el pastor de Tecoa, «por tres pecados… y por el cuarto», «Buscadme, y viviréis», la
  justicia como un arroyo, las visiones y Amasías, y cómo lo usan Esteban, Jacobo (Hechos 15) y Jesús (Mateo 23:23).
- **Miqueas** (6 lecciones): Samaria y Jerusalén, los que traman el mal, el monte de Jehová, Belén Efrata (Mateo 2:4-6), lo que Dios
  pide (6:8) y «¿Qué Dios como tú?».
- **Samuel** (9 lecciones, «Los libros históricos», en orden): Ana y «Habla, que tu siervo oye»; el arca y el pedido de un rey; Saúl y
  «el obedecer es mejor que los sacrificios»; David, el elegido («Jehová mira el corazón»), y Goliat; David perseguido que no toca al
  ungido; David rey, Jerusalén y la promesa de 2 Samuel 7; Mefi-boset, Betsabé y Natán, Absalón; y cómo lo leen Lucas 1, Hechos 13 y
  Hebreos 1. Dos cofres y el repaso.
- Los huecos se leen igual en la RVR1960; donde la 1960 dice otra cosa (Miqueas 3:8, 5:2, 6:8 y 7:8) la pregunta va con opciones en
  palabras de hoy. Validador y regla «empezar por el principio», en orden. **La Travesía queda en 439 lecciones y 608 niveles.**

## 5. Senda en tres idiomas: «The Big Story» y la trivia en portugués

- **«The Big Story»:** «El gran relato» entero en inglés (47 lecciones, 9 capítulos, 6 líneas de tiempo), con las citas textuales de
  la Berean Standard Bible y los nombres como ella los escribe. **Cada hueco también se llena leyendo la King James**, la que más se
  conoce: cuando la palabra de la pregunta no está en las dos (por ejemplo «for ever» o «testament» en la KJV), el hueco va en otra
  palabra del mismo versículo. El validador la revisa entera sin errores. Siguen en español dentro de la ruta los diagramas y los
  nombres de lugares de los mapas (se traducen con los visuales).
- **La trivia en portugués:** primer banco de **345 preguntas** (56 a 58 por pieza) con la Bíblia Livre. **Una pieza se juega en
  portugués recién cuando tiene 40 preguntas traducidas o más**; si no, sigue entera en español (nunca se mezclan idiomas dentro de
  una pieza). Las copas y los torneos usan las mismas preguntas para todos y muestran la traducción si existe. El validador revisa
  las mismas reglas que en español y, además, que la palabra clave esté **en la Bíblia Livre y en la Almeida**. Las que dependían de
  algo que la Bíblia Livre traduce distinto (los títulos de los salmos; «Maranata», que dice «Vem, Senhor») no se tradujeron o se
  rehicieron. **El costo:** con unas 57 preguntas por pieza, quien juega en portugués repite antes que en español (entre 263 y
  425 por pieza); los próximos bancos en portugués apuntan a 150 por pieza antes del lanzamiento.
- **Lo que se encontró al mirar la app en portugués:** los comodines de la trivia (Luz, Tiempo, Doble, Cambio, Pista, Tribuna), las
  citas fijas de la semana («Desafío del domingo») y otros **33 textos de botones y títulos** (Salir, GUARDAR, SEGUIR, PIEZA GANADA,
  PREGUNTAR, Saltar…) estaban escritos en español dentro de las pantallas. Ahora tienen su clave en los tres idiomas.

## 6. Expo y Firebase: resuelto en el momento

El fundador quiso dejarlo resuelto esa misma noche, con la extensión de Claude en su navegador:

- **Expo:** proyecto `senda-app-ok`; **Firebase:** proyecto `senda-fafc8`, app `com.sendaapp.biblia`. La configuración de la app
  (`app.json` y `google-services.json`) apunta a los dos.
- **La clave de los avisos (FCM V1)** quedó cargada en Expo el 24-10 a las 22:22, con la cuenta de servicio de Firebase. El asistente
  web de Expo pedía un almacén de claves de Android: se usó uno **de relleno**, generado para eso y que no firma nada; la clave real
  de Google Play nunca se sube a Expo (`docs/EXPO_FIREBASE.md`).
- **Lo que falta para que un aviso llegue de verdad:** solo Supabase (las cuentas anónimas), que el fundador decidió ver después.

**Regla nueva de comunicación (HECHO, 24-10):** el fundador ve **solo el último mensaje de cada turno**; lo que se escribe en el medio
le llega plegado o resumido. Todo lo que tenga que hacer va en el mensaje final, corto, en pasos, y con el archivo adjunto cuando hay
uno.

## 7. La marca y el monotributo

- **La marca (DEC-2026-10-25-1):** la búsqueda del fundador en el INPI mostró que «SENDA» sola choca en las tres clases (SENDA
  PROHIBIDA en la 9, LA SENDA y una docena de «Senda + algo» en la 41, SENDA en la 42). **Recomendación:** la mixta «SENDA BIBLIA Y
  JUEGOS» con el logo y la mixta «LANY» con el dibujo, en las clases 9 y 41 (≈ ARS 165.000 las cuatro, ESTIMACIÓN), antes del
  18-12; antes de pagar, mirar la ficha de LA SENDA y, si se puede, una consulta corta con un agente. Guía en `docs/legal/marca_inpi.md`.
- **Solo monotributo, sin SAS por ahora (DEC-2026-10-25-2):** el monotributo no hace falta al publicar; va antes del primer cobro de
  AdMob (ESTIMACIÓN: febrero o marzo de 2027), con la caja de ahorro en dólares y la factura E. La marca va a nombre del fundador y la
  cuenta de Google Play es personal (al prender las suscripciones, Play muestra la dirección: decidirlo antes).

## 8. R8: achicar la app, probado antes en un emulador

R8 es la herramienta de Android que achica el código Java y Kotlin y saca lo que no se usa. Es lo normal en las apps publicadas,
pero tiene un riesgo: si saca una pieza que una biblioteca nativa (Lany en Rive, el motor de audio) busca por su nombre, la app se
cierra al abrir sin que la guardia lo pueda mostrar. Por eso se probó antes de dártelo:

- **El ajuste** (`scripts/android_r8.sh`): R8 y el recorte de recursos, conservando enteras las piezas que se llaman desde C++ o por
  reflexión (Rive, Nitro, el audio, el widget, GL y los ayudantes de React Native).
- **La prueba de humo** (`.github/workflows/humo.yml`, nueva): GitHub compila la app con R8, la instala en un **emulador de Android**,
  la abre, pasa la bienvenida, recorre las pestañas y falla si la app se cierra, si aparece la pantalla de fallo o si el registro de
  Senda trae un error de clase. Deja capturas y el registro.
- **Primera corrida:** la app abrió y dibujó la bienvenida sin un solo error propio, pero la prueba se cortó por un cartel del
  emulador («System UI isn't responding») y por contar errores de Ajustes de Android como si fueran de Senda. Se corrigió la prueba
  (espera y despeja esos carteles, solo cuenta lo de Senda).
- **Segunda corrida: en verde.** La bienvenida, Inicio con Lany, la Biblia, la Travesía y Jugar abrieron y la app siguió viva todo el
  recorrido; el único proceso que se cerró fue Ajustes de Android. Las capturas están al final del capítulo.
- **El resultado (HECHO):** el APK 37 pesa **87,1 MB**; el 36 pesaba **95,9 MB**: 8,8 MB menos, y eso que el 37 trae unas 1.360 preguntas
  más y la trivia en portugués (la estimación del capítulo 59 era de 6 a 9 MB).
- **Si igual pasa algo en tu teléfono** (el emulador no es un teléfono real): si el APK 37 se cierra al abrir, avisame y en minutos sale
  un 37b igual pero sin R8.

## 9. El APK 37

Como siempre, **trae absolutamente todo lo anterior**. Versión 0.37.0 (código 38), con R8. Antes de compilar pasaron el validador,
la prueba de arranque (6 de 6), la auditoría de textos de las pantallas (74 casos, letra normal y grande: 0 problemas) y la de las
2.158 preguntas de la trivia con letra grande (0 problemas). Publicado en
https://github.com/juanicarlisi/senda-app/releases/tag/prueba-37 (87,1 MB). Lo que hay que mirar está en la Consola (pendiente
«probar37»).

## 10. Lo que se probó y lo que no

- **Probado:** el validador de contenido («Todo en orden»: 2.158 preguntas, 2.150 activas; 439 lecciones; «The Big Story» y
  «A grande história» enteras; 345 preguntas en portugués), la regla «empezar por el principio», el chequeo de tipos y la prueba de
  arranque (6 de 6); la vista previa en español, portugués e inglés (las lecciones nuevas, la trivia en portugués, Grupos, «Senda para
  todos», Inicio y Comunidad); la prueba de humo con R8 en un emulador de Android (bienvenida, Inicio, Biblia, Travesía y Jugar, sin cierres ni errores de Senda); la
auditoría de textos de 74 pantallas y de las 2.158 preguntas con letra grande (0 problemas).
- **No probado:** grupos, eventos, encuesta, copa y torneos con la base viva (falta activar las cuentas anónimas); los avisos al
  teléfono de punta a punta (ídem).

## 11. Pendientes y decisiones

- **Del fundador:** probar el APK 37; cuando decida, Supabase (cuentas anónimas sin captcha, pg_cron y pg_net) para probar todo
  «Juntos» con la base viva; los planes y precios (DEC-2026-10-24-4); la marca en el INPI (§7); lo de antes (Google Play antes del
  15-11, consulta SBA, abogado de PI, autorización del ministerio, sitio, voz).
- **Próxima prueba (38):** Joel, Abdías y Jonás en «Los doce profetas»; Reyes en «Los libros históricos»; el banco de la trivia en
  inglés y más preguntas para Pascua (hacia 4.000); la segunda ruta en portugués e inglés; lo que traiga el fundador del APK 37.
- **Después:** 39 (Premium y Max con los planes decididos, salas en vivo), 40 (trivia del sermón, guardar la cuenta, progreso en la
  nube).
- **Decisiones:** DEC-2026-10-25-1 (la marca), DEC-2026-10-25-2 (solo monotributo), DEC-2026-10-25-3 (la prueba 37).

{{PANTALLAS37}}
