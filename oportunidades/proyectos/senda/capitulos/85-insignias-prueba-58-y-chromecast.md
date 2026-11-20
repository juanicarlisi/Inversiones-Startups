# Capítulo 85 — Insignias, prueba 58 y la tele (20-11-2026)

## 1. Lo que pidió el fundador (20-11)

Un mensaje largo con 23 puntos («hacé tranqui, no hay apuro, mejor despacio pero de alta calidad»), y dos más durante el turno:

- «El próximamente debe decir más juegos o algo así, no mostrar cuáles son».
- «Que se pueda compartir por Chromecast. Tipo estamos jugando un torneo, y se puede compartir. Estamos con una trivia o travesía, y que
  también se pueda. Todo así, para que sea grupal o individual, se pueda visualizar en tele. ¿Eso se puede?» (§9).

## 2. Lo hecho en la app (commits de `senda-app` del 20-11, todos en `main`)

- **Sala en vivo visible**: cuadro en Jugar; la Pantalla web (`web/pantalla/`) deja escribir un código o crear la sala desde ahí.
- **Vidas**: la lección gasta una vida al empezar y los errores no (DEC-2026-11-19-3, la parte técnica).
- **Errores**: el turno de Lany que no aparecía, «Antes o después» desde la historia en una línea y los anuncios que no salían.
- **Rutas que se abren sin anunciarlas**: el aviso llega cuando se liberan.
- **Insignias**: los desafíos con fecha pasan a ser insignias, con la lectura y la travesía de cada día, palmarés y recordatorios.
  - Cuatro travesías nuevas: Camino a Navidad, 1 de enero, Pascua y «La historia en una línea» (`scripts/autor/ins_*.py`).
  - Ningún versículo repetido con lo que ya se pregunta: el día 13 de Navidad pasó de Isaías 53 (lo usa Pascua) a Isaías 61.
  - Las rutas de insignias nunca piden llave (lo controla una prueba).
- **Biblia**:
  - «RVR1960» queda siempre a la vista arriba del lector, en su propia fila: en un teléfono de 360 px el título se reducía a «J».
  - «Planes y versiones» lleva un título claro y las insignias en grande.
- **Tu perfil**: arriba en Comunidad y también en Ajustes.
- **Jugar**:
  - Ocupa la pantalla entera y muestra solo los juegos abiertos.
  - Los de grupo van en franjas (Trivia de la iglesia, Torneos, Sala).
  - Cierra con «Próximamente más juegos», con Lany y sin nombrar cuáles.
- **Álbum**: la hoja se pasa de verdad (Reanimated: se levanta, muestra el dorso y deja sombra).
- **Avatares**:
  - Muchas más opciones: paletas, color de barba y de lentes, fondos con degradé.
  - La base acepta las opciones nuevas (migración `20261207000003`) y la prueba de la nube suma ese paso.
- **Torneos**: las preguntas salen en otro orden para cada participante. El orden es fijo para cada uno y no cambia si vuelve
  (`src/util/ordenPropio.ts`).
- **Música**:
  - La trivia rota entre temas y siempre vuelve a su tema principal.
  - La bienvenida y la Travesía suenan con funk electrónico.
  - Hay cinco temas funk más de Kevin MacLeod (CC BY 4.0, con crédito).
  - Hay candidatas propias de Lyria para elegir en la Consola, que entran a la app solo cuando el fundador elige.
- **Botón de comentarios para testers**: es flotante y existe solo en las versiones de prueba.
- **Max no se pierde**: había tres agujeros, cerrados:
  - la pantalla de fallo borraba el plan;
  - «Restablecer» lo reiniciaba;
  - el plan regalado o verificado en el servidor no se leía nunca.

  Ahora el plan se respalda aparte y se recupera solo (`src/util/planGuardado.ts`). **Pendiente**: las compras reales de la tienda
  (librería de compras y «Restaurar compras») todavía no están integradas.
- **Consola, Licencias**:
  - Cada tarjeta muestra su estado real y lo que pasó.
  - Cuando no hay dirección, ofrece «Responder en el hilo de Gmail» (antes armaba el enlace con un nombre).
- **Guía para testers**: una página con los colores de Senda, publicada en https://claude.ai/artifact/Sqr6XSiLgCu9kybZ9voNdn. Es
  privada hasta que el fundador la comparta. Copia en `testers/guia-testers.html`.

Pruebas: arranque (84 en verde), tipos, validador de contenido («Todo en orden») y la prueba de la nube.

## 3. Respuestas del 20-11

### Las preguntas de la bienvenida

- **Dónde quedan**: en el teléfono, en el perfil local (`useUsuario.perfil`). El recordatorio, la hora, el tema y las estadísticas van
  a Ajustes. Solo sube a la nube dentro de la copia privada del progreso, para quien guarda su cuenta con Google (para recuperarla en
  otro teléfono); nadie más la ve.
- **Para qué sirven**:
  - **Edad**: menores de 13 sin Comunidad, anuncios con el trato por edad, sin video por Talentos, micrófono, sermón ni moderación;
    también alimenta la señal de edad de la tienda.
  - **Motivos, fe, dudas y nivel**: eligen la primera ruta de la Travesía y la pestaña donde arranca la persona.
  - **Dudas**: personalizan Inicio.
  - **Nivel**: fija la dificultad inicial de la trivia.
  - **Meta**: es la meta diaria.
- **Qué va a las estadísticas** (solo con 13 o más): cuántos motivos y cuántas dudas, nunca cuáles. Van también el objetivo, el nivel,
  la meta, el origen y el paso donde terminó. La respuesta sobre la fe nunca se manda.
- «Origen» («cómo nos conociste») solo se mide: sirve para saber qué canal de difusión trae gente.

### Dónde se ve la plata

- Los anuncios se ven en el panel de AdMob (apps.admob.com): ganancias estimadas por día, por app y por bloque. Se cobra una vez por
  mes, a partir de USD 100.
- Las suscripciones se van a ver en Play Console (Monetización), y en App Store Connect para el iPhone, cuando estén las compras.
- Más adelante la Consola puede traer esos números.

### El correo de Apple (ITMS-90725)

- Avisa que las compilaciones 5 a 7 (0.40.0) se hicieron con un SDK de iOS anterior al que Apple va a exigir.
- No frena nada hoy: TestFlight y la revisión siguen.
- Hay que compilar con Xcode 27 antes de abril de 2027. Queda como pendiente técnico de Claude, en el flujo de compilación.

## 4. Chromecast: ver Senda en la tele (DEC-2026-11-20-1, PROPUESTA)

- **¿Se puede?** Sí, en dos niveles.
  - **Hoy, sin cambiar nada**:
    - Android duplica la pantalla en un Chromecast o en una tele con Google TV, desde «Transmitir» en los ajustes rápidos.
    - El iPhone lo hace por AirPlay.
    - La Pantalla web (`web/pantalla/`) ya se abre en el navegador de una tele o de una compu conectada, con el código de la sala.
  - **Bien hecho (propuesta)**: un botón «Ver en la tele» que manda a la tele una vista grande y propia, mientras el teléfono sigue
    siendo el control.
    - Pregunta y opciones en grande, el puntaje y la tabla del torneo.
    - La lección de la Travesía con su lámina.
    - La sala en vivo: la Pantalla que ya existe.
- **Cómo**:
  - La librería `react-native-google-cast`, con su plugin de Expo.
  - Un receptor web propio (Custom Web Receiver) que reutiliza la Pantalla, alojado en HTTPS gratis.
  - Un canal de mensajes entre el teléfono y la tele.
  - Sirve en Android y en el iPhone. Sin servidores nuevos: el teléfono le manda a la tele lo que muestra.
- **Lo que cuesta**:
  - El registro de desarrollador de Google Cast: USD 5, una sola vez. Lo paga el fundador con su OK, desde su cuenta de Google.
  - ESTIMACIÓN de Claude: dos o tres sesiones de trabajo.
- **Cuándo**: después del lanzamiento, en enero, para que esté para la Gran Copa de Verano (30-01) y la Pascua. Hasta entonces, la
  duplicación de pantalla y la Pantalla web cubren el uso en grupo.
- **Regla de corte**: si a las 6 semanas menos del 3 % de las salas y torneos usan «Ver en la tele», no se suman más vistas (solo
  sala y torneo).
- **Fuentes** (20-11-2026):
  - support.google.com/cast-developer/answer/4512496 (registro, USD 5).
  - developers.google.com/cast/docs/registration.
  - react-native-google-cast.github.io/docs (plugin de Expo y canales propios).

## 5. Próximos

1. Recibir lo que salga del APK 58 y del iPhone 58.
2. La tarea siguiente de Play Console del fundador (prueba cerrada antes del 02-12).
3. Las compras reales de la tienda y «Restaurar compras», junto con la cuenta de Play.
4. Si el fundador da el OK al Chromecast: el registro de USD 5, y la construcción en enero.
5. Compilar el iPhone con Xcode 27 antes de abril de 2027.
