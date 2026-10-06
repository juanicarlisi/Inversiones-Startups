# Senda · prueba 6 en el teléfono: marcar al instante, la fiesta, las Lámparas, costos y duelos

Fecha: 06-10-2026. Desarrollo e investigación de Claude después de que el fundador probó el APK de la prueba 6.

## 1. Lo que contó el fundador (resumen, sin citas textuales)

- **Biblia:** la hoja y los sonidos, mucho mejor. Marcar o seleccionar un versículo, o marcar una página, está muy lento.
- **Jugar:**
  - excelente por ahora;
  - el clic de la ruleta puede ser más profesional;
  - al ganar una pieza quiere más fiesta (Lani que baila, música de fondo);
  - todo lo mejorable de la experiencia, trabajarlo.
- **Travesía:**
  - lo de Pablo, muy bueno;
  - que la persona vea que aprendió;
  - una ayuda que diga dónde leer, o unas 3 ayudas por recorrido.
- **Calendario:** bien por ahora.
- **Pedidos de diseño:**
  - optimizar todo para bajar el costo de servidores;
  - que escale sin rehacer la estructura ni el backend;
  - partidas abiertas que vencen a los X días, como en Preguntados.
- **Pedidos de producto:**
  - recordar la transliteración y la palabra original con el «+», como opción;
  - un ejemplo de juego («alimenta a Elías», un cuervo tipo Flappy Bird).
- **Aclaración:** las ideas de juegos son semillas para evaluar y tomar como forma de pensar.
- **Pregunta:** si al publicar ya sirve para duelos entre amigos.

## 2. Causas y arreglos (INFERENCIA de Claude, verificada en la vista web)

- **Marcar lento.**
  - **Causa:** cada toque cambiaba el estado de la pantalla entera. Se volvía a dibujar la hoja completa (todos los párrafos, justificados y con guiones) y se escribía todo el progreso en el teléfono en el medio de la animación.
  - **Arreglo:**
    - cada versículo escucha solo sus marcas (selección, resaltado, nota, cinta);
    - las animaciones van en el hilo nativo;
    - la barra de acciones se dibuja aparte;
    - lo guardado se junta y se escribe de a lotes.
  - **Medido** con el procesador frenado 6 veces (como un teléfono de gama media), en tiempo bloqueado por toque:

    | Acción | Antes | Ahora |
    |---|---|---|
    | Tocar un versículo | 170–260 ms | 60–90 ms |
    | Resaltar | 540 ms | 270 ms |
    | Poner una cinta | 600 ms | 300 ms |

  - En la web, las animaciones corren en JavaScript; en el teléfono, en el hilo nativo, así que ahí la mejora debería ser mayor (a confirmar en la prueba 7).
- **Hojas escondidas que se quedaban con el toque en la web:** «box-none» deja pasar los toques a los hijos aunque la capa de arriba diga «none». Arreglado: las hojas que no se leen no reciben toques.
- **Clic de la ruleta.**
  - El de antes era una caja china a unos 1,4 kHz: un «toc» tonal.
  - El nuevo usa dientes de una matraca grabada (VCSL, CC0; los 8 más limpios de 220 detectados, con mucho golpe, poco ruido antes y poca cola) más el cuerpo corto de la caja china y una saturación suave.
  - Livianos cuando gira rápido y llenos al frenar, con el rebote de la lengüeta al final.
- **La fiesta.**
  - Música compuesta con grabaciones de la VCSL (bongós, congas, shaker grande, pandereta, palmas, bombo, redoblante, platillos, timbal, xilofón, marimba, glockenspiel y campanas de mano). Re mayor, 125 negras por minuto.
  - Afinación medida:
    - el xilofón de la VCSL suena una octava arriba de su nombre y unos 15 cents alto; se corrigió y quedó a ±2 cents;
    - el timbal se llevó de fa♯ grave a re.
  - Lani baila al pulso, con una sola animación en el hilo nativo.

## 3. Benchmarks y datos

- **Partidas por turnos:** en los juegos de Etermax (Apalabrados), cada jugador tiene **7 días** para responder; si vence, gana el último que jugó ([ayuda de Etermax](https://wordcrack.help.etermax.com/hc/es/articles/1500012376501--Cu%C3%A1nto-tiempo-tengo-para-responder-una-partida)). Para Preguntados no se encontró el dato en la ayuda oficial; **re-verificar**. Decisión de Senda: 72 h, configurable.
- **Supabase** (vía buscador, oct-2026; el sitio está bloqueado en este entorno, **re-verificar antes de gastar**):
  - las cuentas anónimas están en el plan gratis, que trae 50 mil usuarios activos por mes;
  - el Pro trae 100 mil, y después USD 0,00325 cada uno ([precios de Supabase](https://supabase.com/pricing), [MakerKit](https://makerkit.dev/blog/saas/supabase-pricing));
  - `pg_cron` viene habilitado en todos los planes ([documentación de Supabase Cron](https://supabase.com/docs/guides/cron)).
- **Push de Expo:** sin costo, con un tope de 600 notificaciones por segundo por proyecto ([preguntas frecuentes de Expo](https://docs.expo.dev/push-notifications/faq/)).
- **Texto original:**
  - STEPBible-Data (TAGNT, TAHOT, TBESG, TBESH y TIPNR, este último con nombres propios geolocalizados), licencia **CC BY 4.0**, citando a «STEP Bible» ([repositorio](https://github.com/STEPBible/STEPBible-Data));
  - el Diccionario Strong en español es de Editorial Caribe (comercial: [Logos](https://www.logos.com/product/4456/diccionario-strong-de-palabras-originales-del-antiguo-y-nuevo-testamento));
  - la RV1909 con números de Strong (edición de Rubén Gómez, 2012) aparece en programas comerciales, pero su etiquetado no tiene una licencia clara ([Accordance](https://www.accordancebible.com/product/spanish-1909-reina-valera-with-strongs-numbers/)).
- **PostHog:** el plan gratis trae 1 millón de eventos por mes (dato conocido de la sesión anterior; re-verificar). Por eso las respuestas van a PostHog en muestra de 1 cada 10; Supabase ya las tiene todas.

## 4. Diseño (INFERENCIA de Claude)

- **La fábrica de juegos bíblicos:**
  - ocho preguntas con puntaje;
  - «Los cuervos de Querit» (1 Reyes 17:2-6) obtiene 32/40 y «Maná» (Éxodo 16) 34/40;
  - una sola biblioteca de minijuegos para el Arcade, Senda Fiesta, Reunión y los campamentos (capítulo 10, §14).
- **Repaso:** cajas de Leitner (1, 1, 3, 7, 16 y 35 días); lo acertado a la primera entra a la semana. Es la versión simple de FSRS y se cambia sin tocar pantallas.
- **Lámparas:** el pasaje sale del texto de la cita («Hechos 13:8-12»). Si es largo, se acorta a 10 versículos con el clave a la vista. El validador revisa que el clave esté dentro y que el rango exista.

## 5. Lo hecho (prueba 7)

- **App:**
  - marcar al instante y guardado diferido;
  - el clic nuevo de la ruleta (8 tomas) y la fiesta (música y Lani que baila);
  - Lámparas, lectura recomendada y repaso;
  - completar el versículo, unir parejas y ¿quién lo dijo?, con validación textual contra la RV1909;
  - Fundamentos, sección 1 (Adán y Eva, Caín y Abel, Noé y Babel; en revisión doctrinal);
  - muestra en las métricas;
  - `docs/COSTOS.md`, `docs/DUELOS.md` y `docs/PALABRAS_ORIGINALES.md`;
  - la Consola con giros comparables y los tipos nuevos.
- **Proyecto:**
  - capítulos 07, 08, 09, 10, 19, 25 y 31;
  - estado y roadmap;
  - doctrina 08, §9;
  - DEC-2026-10-06-3.
