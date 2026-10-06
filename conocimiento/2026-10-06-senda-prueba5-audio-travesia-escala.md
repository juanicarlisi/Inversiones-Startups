# Senda · lo que trajo la prueba 5 en el teléfono: audio nuevo, Travesía completa, escala y juegos futuros

Fecha: 06-10-2026 · Investigación y desarrollo de Claude después de la prueba 5 del fundador (Samsung).

## 1. Lo que contó el fundador (resumen, sin citas textuales)

- La vuelta de hoja de la Biblia sigue lenta y trabada, y eso arruina la experiencia.
- Sonidos: algunos empeoraron o faltan; la ruleta y la corona no suenan; en la Travesía a veces se cuelgan; llegan tarde; son muy
  pocos (por ejemplo, cuando aparecen las opciones del Espadeo). Pidió muchos más, solo de calidad, y hacerlo con calma.
- Las animaciones le gustan: seguir por ese camino.
- Calendario: una vista semanal como Google Calendar, con la franja horaria de cada evento; la notificación se ve fea (logo y texto).
- Registrar algo tipo Kahoot (enlace, vidas, video, para líderes; armar preguntas o subir un PDF), sin ser una réplica.
- Frases de expectativa al abrir la Biblia, cada tanto y configurables desde la Consola.
- Travesía exhaustiva y MECE (apologética, geografía bíblica, historia de la iglesia…), sin inclinaciones teológicas, una de las
  estrellas de la app; por ejemplo, los viajes de Pablo con imágenes y quizás Pablo acompañando a la oveja; un resumen al final de
  cada paso para la memoria.
- La app tiene que estar preparada para millones (Espadeo, travesías, grupos, ligas), con sincronización perfecta y sin cuelgues.
- Evolutivos para después del lanzamiento: juegos de mesa y de consola adaptables a historias bíblicas (el arca, Jericó), algo tipo
  Mario Party y los juegos típicos de campamentos e iglesias.

## 2. Causas encontradas y arreglos (INFERENCIA de Claude, verificada en la vista web y en la compilación del APK)

- **Hoja lenta:** el gesto y la animación corrían en el hilo de JavaScript y cada vuelta volvía a dibujar las hojas. Ahora corren en el
  hilo nativo (Reanimated 4 y Gesture Handler) y cada hoja se dibuja una sola vez (falta la prueba en el teléfono).
- **Sonidos mudos y tardíos:** cada sonido era un reproductor aparte (expo-audio sobre ExoPlayer): 50 a 150 ms para arrancar, los
  clics rápidos se pisaban (el estado «sonando» se actualizaba cada segundo) y con unos 30 reproductores algunos fallaban. El clic de
  la ruleta, además, estaba unos 20 dB por debajo de un acierto (medido: −27 dB contra −13 dB de sonoridad momentánea, más la ganancia
  de 0,45). **Arreglo:** un solo contexto de audio (react-native-audio-api 0.13.6, Software Mansion, publicado el 23-09-2026; Web
  Audio sobre Oboe/AAudio en Android) con búferes en memoria; los clics de la ruleta se agendan con la curva de la animación.
  **HECHO:** el APK compiló con el motor nuevo (corrida 6 de GitHub Actions, 06-10-2026, solo compilación).
- **Sonidos baratos:** la firma era una marimba sintetizada. **Arreglo:** instrumentos grabados de la **Versilian Community Sample
  Library** (VCSL, licencia CC0 verificada en su archivo LICENSE el 06-10-2026: «CC0 1.0 Universal»): marimba, campanas de mano,
  glockenspiel, campanas tubulares, árbol de campanas, mark trees, aplausos, claves, caja china, matraca, tambor de madera y shaker.
  Afinación verificada (±4 cents) y nivel por sonoridad momentánea.

## 3. Benchmark para la Travesía MECE

- **HECHO:** en 1996 la Association of Theological Schools estableció que todo MDiv acreditado incluya cuatro áreas: herencia
  religiosa (Escritura, hermenéutica, teología, historia), contexto cultural, formación personal y espiritual, y capacidad para el
  ministerio ([Wikipedia: Master of Divinity](https://en.wikipedia.org/wiki/Master_of_Divinity)).
- **HECHO:** un MDiv típico tiene núcleo de estudios bíblicos (AT I y II, NT I y II), estudios históricos y teológicos, formación
  espiritual y ministerio ([Campbell University](https://divinity.campbell.edu/academics/degree-programs/master-of-divinity/degree-plan/),
  [Gardner-Webb 2025-2026](https://gardner-webb.smartcatalogiq.com/en/2025-2026/academic-catalog/school-of-divinity/degree-programs/masters-programs/master-of-divinity)).
- **HECHO (vía buscador):** programas de estudios bíblicos en español incluyen geografía y arqueología bíblicas, historia y entorno de
  cada época y métodos de interpretación (Deusto, Universidad de Navarra; resultados de búsqueda del 06-10-2026).
- **HECHO:** los cursos de geografía bíblica recorren la Tierra Santa, el Éxodo, la vida de Jesús y los viajes de Pablo
  ([Indiana Wesleyan BIL-280](https://indwes.smartcatalogiq.com/en/2015-2016/catalog/courses/bil-biblical-literature/200/bil-280),
  [Beth Bible College](https://bethbc.edu/geography-of-the-bible-new-testament-online-course/),
  [MSOP, 2024](https://www.msop.org/wp-content/uploads/2024/02/MOST-643-Bible-Geography-Syllabus-Cates-2024.pdf)).
- **HECHO:** BibleProject Classroom trabaja libro por libro (Génesis, Éxodo, Ezequiel, Jonás, Mateo, Corintios, Efesios) con estudio
  de palabras hebreas ([faith.tools](https://faith.tools/app/bibleproject-classroom)).
- **Decisión de diseño (INFERENCIA):** 8 áreas, cada una responde una sola pregunta; las lecciones se asignan por la pregunta que
  responden. Detalle y guardas doctrinales en el capítulo 08 del proyecto.
- **Mapa:** costas de Natural Earth 1:50 m, dominio público ([licencia en el repositorio](https://github.com/nvkelso/natural-earth-vector)).
  Ciudades y recorridos de Hechos 13–28 con ubicaciones aproximadas.

## 4. Benchmark para la escala

- **HECHO (vía buscador; el sitio de Supabase está bloqueado en este entorno, re-verificar):** plan gratis de Supabase: 500 MB de
  base, 50 mil activos por mes, 5 GB de tráfico, se pausa a la semana sin uso; Pro: USD 25 por mes, 8 GB de base, 100 mil activos,
  250 GB de tráfico ([MakerKit](https://makerkit.dev/blog/saas/supabase-pricing), [Schematic](https://schematichq.com/blog/supabase-pricing)).
- **HECHO (vía buscador):** Realtime en Pro: 500 conexiones simultáneas y 500 mensajes por segundo, configurables
  ([docs de Supabase](https://supabase.com/docs/guides/realtime/limits)).
- **ESTIMACIÓN (Claude):** 1 M de personas por día × 30 respuestas en lotes de 50 ≈ 7 pedidos por segundo de promedio, 70 en el pico.
- **HECHO:** la migración de escala se aplicó en Supabase el 06-10-2026 (corrida exitosa del flujo «Base de datos (Supabase)»;
  sintaxis verificada antes con el analizador de Postgres, libpg_query).

## 5. Benchmark de los evolutivos

- **Kahoot:** desde 2024 convierte un PDF en preguntas con IA ([Kahoot, 17-01-2024](https://kahoot.com/blog/2024/01/17/ai-pdf-question-generator-for-educators/));
  en 2025 el PIN de un juego pasó a durar 8 horas para compartirlo antes ([Kahoot EDU Q2 2025](https://support.kahoot.com/hc/en-us/articles/40981626377235-Kahoot-EDU-Quarterly-Newsletter-Q2-2025)).
- **Juegos bíblicos de consola:** Wisdom Tree (1990) vendió en librerías cristianas para esquivar las restricciones de Nintendo;
  *Bible Adventures* (NES, 1991) vendió unas 350 mil copias; *Super 3D Noah's Ark* usó el motor de Wolfenstein 3D
  ([Wikipedia](https://en.wikipedia.org/wiki/Wisdom_Tree), [Giant Bomb](https://giantbomb.com/wiki/Games/Bible_Adventures)).
  Lección (INFERENCIA): los juegos «con la Biblia pegada encima» quedan como curiosidad; la mecánica tiene que nacer de la historia.
- **Juegos de mesa bíblicos:** lo más vendido son mazos de trivia y adaptaciones de clásicos como ¿Quién es quién? bíblico
  ([AsInsight](https://www.asinsight.com/report/US/bible-board-games)).
- **Mario Party:** estrellas en una cantidad fija de turnos, dado de 1 a 10, estrella por 20 monedas en una casilla que se mueve,
  minijuego al final de cada ronda con 10 monedas para los ganadores ([Wikipedia](https://en.wikipedia.org/wiki/Mario_Party_(video_game)));
  *Super Mario Party Jamboree*: 7,48 M de copias al 31-03-2025, el más rápido de la serie
  ([Nintendo Life](https://nintendolife.com/news/2025/02/super-mario-party-jamboree-is-the-fastest-selling-entry-in-franchise-history)).
- **Campamentos e iglesias:** esgrima bíblica (libros con más de 900 preguntas, [FaithGateway](https://faithgateway.com/products/esgrima-biblica)),
  búsqueda del tesoro con pistas de versículos, firmas, «uno, dos, tres, cristianos» ([ACI Prensa](https://www.aciprensa.com/catequesis/dinamicas2.htm)).

## 6. Lo hecho (prueba 6)

- App: motor de audio nuevo y firma con instrumentos grabados; 30 sonidos nuevos; ajuste «Sonidos de toques»; ruleta agendada;
  corona, carga y luz; cascada de opciones; vista semanal; avisos nuevos (ícono, color, texto, sonido, botón de prueba); el umbral de
  la Biblia; Travesía completa (8 áreas, 56 rutas), motor de lecciones (mapa y ordenar), Los viajes de Pablo con Pablo y el mapa
  real, «Lo que aprendiste»; bandeja de salida persistente e idempotente y migración de escala; `docs/ESCALA.md`.
- Proyecto: capítulos 07, 08, 10, 12, 13, 19, 25 y 31; estado y roadmap.
