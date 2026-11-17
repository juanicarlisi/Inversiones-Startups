# Avisos de Senda: ícono, textos y UX — informe del investigador tecnológico (15-11-2026)

No edité nada en ningún repositorio durante la investigación. Lo que generé quedó copiado en `oportunidades/proyectos/senda/marcas/aviso_2026-11/` (rutas al final).

## 0. Lo más importante

1. **El ícono chico sí está configurado; el problema es el dibujo.** No es el caso "ícono de la app aplastado": `assets/notificacion.png` es blanco sobre transparente, 96×96, y el plugin lo conecta bien. Lo feo es que es el logo entero pasado a silueta: a 24 dp pierde todo lo que lo hace lindo.
2. **Hay dos "logos" distintos en un aviso y no sé cuál vio el fundador.** En Samsung con One UI 7 o más y en Android 17, la tarjeta del aviso muestra el ícono de la app a color; la silueta queda en la barra de estado. En Android anterior, la tarjeta muestra la silueta. El ícono de la app, simulado a ese tamaño, se ve bien; la silueta se ve mal en todos los tamaños. No lo probé en teléfono ni emulador.
3. **Los textos del servidor repiten "Senda" y esconden a la persona.** 17 de los 23 avisos push llevan de título "Senda" o "Espadeo" (Android ya muestra el nombre de la app arriba), varios no nombran al rival, y todos salen solo en español aunque el idioma se guarda con el token.
4. **No hace falta ninguna herramienta nueva.** expo-notifications 57 (ya instalada) y el generador de marca propio cubren todo. Notifee, la alternativa clásica, está archivada.

---

## PARTE 1 — Diagnóstico en el repo (`/home/user/senda-app`, rama main, commit bd800bb)

### 1.1 Configuración (HECHO, leído hoy)

| Qué | Dónde | Valor |
|---|---|---|
| Plugin expo-notifications | `app.json:78-85` | `icon: ./assets/notificacion.png`, `color: #F5A524`, `sounds: [aviso_v4.wav]`; sin `defaultChannel` |
| Ícono adaptable | `app.json:30-35` | frente, fondo `#0C0A2A` y `monochromeImage: ./assets/android-icon-monochrome.png` |
| Versión | `package.json:34` y `node_modules` | expo-notifications 57.0.21 instalada; la última de SDK 57 es 57.0.25 (npm, 15-11-2026); Expo 57.0.26, RN 0.86.3 |
| Quién genera el ícono | `scripts/generar_iconos.cjs:34` | `centrado("silueta.svg", 0.9)` a 96×96 |
| De dónde sale la silueta | `scripts/marca/marca_camino.py:125-127` y `:164` | camino completo recortado al cuadro, más la cruz |
| Monocromo del lanzador | `scripts/generar_iconos.cjs:31` | la misma silueta, a 0,6 |

- **El plugin escribe los metadatos de FCM** (HECHO, `node_modules/expo-notifications/plugin/build/withNotificationsAndroid.js:23-27, 89-98`): `com.google.firebase.messaging.default_notification_icon` y `_color`, más los equivalentes `expo.modules.notifications.*`. También genera `drawable-{m,h,xh,xxh,xxxh}dpi/notification_icon.png` a 24, 36, 48, 72 y 96 px. Los avisos push con la app cerrada usan el mismo ícono.
- **La carpeta `android/` local es vieja** (11-11, anterior al logo nuevo) y está en `.gitignore`. Los APK se arman con `expo prebuild` en CI (`.github/workflows/apk.yml:136`), así que no sirve para ver qué recibió el fundador.
- **Comentario viejo:** `src/util/avisos.ts:8` todavía dice "la S con la llama".

### 1.2 Por qué el ícono actual se ve mal (HECHO, medido sobre `assets/notificacion.png`)

Lo rendericé a 24, 36, 48, 72 y 96 px sobre claro y oscuro.

- **El camino entra cortado por el borde.** Abajo y a la izquierda queda un canto recto; sin el degradé ni la noche se lee como una bota o un pato, no como un camino.
- **El trazo va de 12 a 1.** El ancho baja de 360 a 30 unidades sobre 1024: a 24 dp la punta mide 0,6 dp y desaparece.
- **La cruz se pega al camino.** Su trazo mide 1,1 dp y el aire con la punta 0,55 dp: de 24 a 48 px se tocan. Rompe la regla "la S y la cruz siempre separadas".
- **Está descentrado.** La caja de tinta es 76×71 px en la posición +4,+21 de 96: el 22 % de arriba está vacío y el peso cae abajo a la izquierda.
- **Blanco sobre ámbar no contrasta.** `#F5A524` contra blanco da 2,04:1.

INFERENCIA (de memoria de AOSP, sin verificar hoy): el sistema dibuja el ícono a unos 15-16 dp, no a 24, así que tiene que aguantar a 40-48 px reales.

### 1.3 Dónde se arman los avisos

**Locales** (`src/util/avisos.ts`):
- Manejador en primer plano: `:49`.
- Canales: `:55-59`.
- Eventos propios: `:117-120`; eventos de la nube: `:132-135`; copas: `:148`; recordatorio diario: `:161`; aviso de prueba: `:177`.
- Toques: `:200-213`, con la navegación en `src/App.tsx:168-183`.

**Servidor:**
- Cola `public.avisos`: `supabase/migrations/20261101000000_juntos.sql:76`.
- Envío a `https://exp.host/--/api/v2/push/send`: `supabase/migrations/20261130000005_grupos_grandes.sql:73-116`, por pg_cron cada minuto (`:121`).
- Manda `title`, `body`, `data`, `sound: 'default'` y `channelId: 'senda_v4'`. Nada más.
- Ninguna función de `supabase/functions/*` manda avisos.

### 1.4 Canales de Android que existen (HECHO, `src/util/avisos.ts:28-30, 54-59`)

| Id | Nombre visible | Importancia | Qué lleva |
|---|---|---|---|
| `eventos_v4` | "Tus eventos" | HIGH | eventos del calendario propios y de la nube |
| `recordatorio_v4` | "Recordatorio diario" | DEFAULT | recordatorio diario y copas |
| `senda_v4` | "Duelos y amigos" | HIGH | todo lo que manda el servidor |

- Los tres comparten sonido `aviso_v4.wav`, luz `#F5A524`, visibilidad pública en bloqueo y `showBadge: false`.
- Los nombres y descripciones están escritos en español dentro del código, sin clave de traducción.

### 1.5 Qué se usa y qué no

| Función | Estado |
|---|---|
| Ícono grande | No se usa. La 57 no tiene `largeIcon` en el plugin (aparece en SDK 58), pero el nativo ya pone como ícono grande la imagen de un push remoto (`ExpoNotificationBuilder.kt:150-154`) |
| Subtítulo, categorías y acciones | No se usan |
| Agrupado | No se usa; expo-notifications 57 no tiene `setGroup` (verificado en el fuente instalado). Android agrupa solo desde 4 avisos de la misma app |
| `tag`, `collapseId`, `threadId` | No se mandan. El nativo instalado sí respeta `tag` (`FirebaseMessagingDelegate.kt:129`) |
| Badge | Apagado (`shouldSetBadge: false`, `showBadge: false`) |
| Estilo | BigText siempre (`ExpoNotificationBuilder.kt:109`) |
| Color por aviso | Los locales cambian de color según el tipo (`avisos.ts:88, 133, 148, 161`): el ícono sale de varios colores |

**Fallas al tocar un aviso** (HECHO salvo donde se indica):
- "Amigos" y "Grupos" llevan a Inicio, no a la pantalla (`src/App.tsx:176`).
- "Te regalaron Senda Max" manda `pantalla: 'Grupos'` y también cae en Inicio.
- El aviso de `preparar_borrado` trae solo `grupo`, sin `pantalla` ni `tipo`: el toque no navega a ningún lado (`avisos.ts:204-210`).
- Si la navegación no está lista, el toque se descarta (`App.tsx:169`). No se llama `getLastNotificationResponse()`, que existe en la 57.0.21. INFERENCIA: se pierde el toque con la app cerrada.

**Promesa incumplida:** Ajustes dice "Nunca después de las 22" (`src/i18n/textos.ts:640`), pero el servidor manda a cualquier hora. `push_tokens` no guarda zona horaria.

**Otras:**
- `eliminatoria.sql:318` formatea la fecha con la zona de Buenos Aires fija, para cualquier país.
- En iOS el push usa el sonido por defecto, no `aviso_v4.wav`.
- No hay tope diario ni fusión de avisos repetidos.

### 1.6 Todos los textos de aviso que existen hoy

Marcas: **[P]** plantilla o frase de folleto, **[N]** no nombra a la persona o al grupo, **[R]** repite el nombre de la app, **[E]** solo en español.

**Locales** (`src/util/avisos.ts`):

| # | Línea | Título / cuerpo | Marca |
|---|---|---|---|
| L1 | 80 | "Tu momento con la Palabra" / "Unos minutos alcanzan." | P, E |
| L2 | 81 | "Un capítulo para hoy" / "Lee, escucha o repasa: lo que te salga." | P (tríada, giro rioplatense), E |
| L3 | 82 | "La senda sigue" / "Un paso hoy cuenta." | P (eslogan), E |
| L4 | 83 | "Una palabra para hoy" / "Abre la Biblia: un capítulo alcanza." | P, E |
| L5 | 160 | "Tu lectura de hoy" / "Sigue en {Juan 3}" | bien; E |
| L6 | 90 | {título} / "Fecha tope: mañana" o "Fecha tope: hoy" | bien; E |
| L7 | 91 | {título} / "Es mañana" o "Es hoy" | bien; E |
| L8 | 92-98 | {título} / "Mañana · 20:00–21:00 · por Meet" (también "En 1 hora", "En 10 minutos", "Ahora") | bien; E |
| L9 | 133 | {título} / "Hoy a las {h} · {d}" (`textos.ts:2681`, es/pt/en) | bien |
| L10 | 133 | {título} / "Ya está abierto · {d}" (`textos.ts:2682`, es/pt/en) | bien |
| L11 | 143 | "Mañana: Copa de Navidad" / "15 preguntas, las mismas para todos. Acertar y rápido suma más." | cuerpo de 62 letras; E |
| L12 | 144 | "Hoy es la Copa de Navidad" / "Tienes todo el día para jugarla. ¡Suerte!" | P ("¡Suerte!"), E |

**Servidor** (todos **[E]**; la definición vigente de cada función, en `supabase/migrations/`):

| # | Archivo:línea (función) | Título / cuerpo | Marca |
|---|---|---|---|
| S1 | `20261111000000_novedades.sql:158` (agregar_amigo) | "Senda" / "{A} quiere ser tu amigo en Senda" | R (tres veces "Senda") |
| S2 | `…novedades.sql:151` y `:172` (agregar_amigo, responder_amistad) | "Senda" / "{A} aceptó: ya son amigos. ¿Un duelo?" | R, P |
| S3 | `20261103000000_azar_primero.sql:35` (crear_partida) | "Espadeo" / "{A} te desafió a un duelo" | título genérico |
| S4 | `20261101000000_juntos.sql:231` (unirse_partida) | "Espadeo" / "Aceptaron tu duelo. ¡Te toca!" | N |
| S5 | `20261127000000_seguridad.sql:161` (jugar_turno) | "Espadeo" / "Tu rival completó la armadura. ¿Revancha?" | N |
| S6 | `…seguridad.sql:173` (jugar_turno) | "Espadeo" / "Te toca jugar" | N; es el más frecuente y todos salen idénticos |
| S7 | `…juntos.sql:311` (cerrar_vencidas) | "Espadeo" / "Te quedan 6 horas para jugar tu turno" | N |
| S8 | `20261122000000_desafios.sql:131-135` (marca_torneo) | "Senda" / "Empate en «{t}»: {n} puntos cada uno" o "Terminó «{t}»: ganó {G} ({a} a {b})" | R; al ganador le dice "ganó {su propio alias}" |
| S9 | `20261108000000_juntos_listo.sql:105` (regalar_plan) | "Senda" / "Te regalaron Senda Max" o "…Premium" | R, N |
| S10 | `20261123000000_invitar_miembros.sql:18` (invitar_a_grupo) | "Senda" / "{A} te invitó al grupo «{g}»" | R |
| S11 | `20261130000005_grupos_grandes.sql:38` (responder_invitacion_grupo) | "Senda" / "{A} entró al grupo «{g}»" | R |
| S12 | `20261201000001_eliminatoria.sql:132-136` (organizar_torneo) | "Senda" / "{A} te invitó a la eliminatoria «{t}»: súmate antes de que arranque"; "{A} te desafió a «¿Quién es?»"; "{A} te desafió a «Nombres por letra»"; "{A} te invitó al torneo «{t}»" | R; "arranque" es rioplatense |
| S13 | `…eliminatoria.sql:139-143` (organizar_torneo) | "Senda" / "Eliminatoria nueva en tu grupo: «{t}». Súmate antes de que arranque" o "Torneo nuevo en tu grupo: «{t}»" | R, N (no dice qué grupo) |
| S14 | `…desafios.sql:164` (desafio_azar) | "Senda" / "{A} aceptó tu desafío al azar: ya pueden jugar «{t}»" | R |
| S15 | `20261128000000_borrar_cuenta.sql:60` (preparar_borrado) | "Tu grupo" / "Ahora eres líder del grupo: quien lo lideraba borró su cuenta." | N; el toque no hace nada |
| S16 | `20261130000003_aviso_torneo.sql:19` (anotarse_torneo) | "Empieza el torneo" / "{t}: ya se puede jugar." | título genérico |
| S17 | `20261130000004_pasar_liderazgo.sql:22` (pasar_liderazgo) | "Ahora eres líder" / "Te pasaron el liderazgo de {g}." | N |
| S18 | `…eliminatoria.sql:243` (armar_cuadro) | "Senda" / "La eliminatoria «{t}» no arrancó: se necesitan al menos 2 personas" | R |
| S19 | `…eliminatoria.sql:263-268` (armar_cuadro) | "Senda" / "Arrancó «{t}»: hoy juegas contra {B}" o "…: pasas a la fase 2 sin jugar" | R |
| S20 | `…eliminatoria.sql:316-320` (avanzar_cuadro) | "Senda" / "«{t}»: llegaste a la final. Juegas contra {B} el DD/MM" o "…pasaste a la fase {k}…" | R; zona horaria fija |
| S21 | `…eliminatoria.sql:326-329` (avanzar_cuadro) | "Senda" / "«{t}»: ¡ganaste la eliminatoria!" o "«{t}»: ganó {G}" | R |
| S22 | `…eliminatoria.sql:424-428` (marca_cruce) | "Senda" / "«{t}»: ganaste tu cruce ({a} a {b})" o "…perdiste tu cruce…" | R, N |

---

## PARTE 2 — Cómo se hace bien (fuentes consultadas el 15-11-2026)

### 2.1 Android

**Guía de diseño de notificaciones** — https://developer.android.com/design/ui/mobile/guides/home-screen/notifications (HECHO):
- El ícono es "a two-dimensional representation of your app's identity. It appears in monochrome in the status bar".
- Desde Android 12 el sistema saca el color del ícono del color que fija la app.
- Título: "Doesn't exceed 30 characters", lo más importante primero, y "Excludes the app's name, which already appears in the header".
- Texto: "Avoids exceeding the 40-character limit" y no repite el título.
- Ícono grande: para la persona que manda algo o la fuente del contenido. "Don't: Use the large icon for branding". Redondo si es una persona.
- Toque: "if the notification says it's their turn in a two-player game, tapping the notification should take them directly to that game".
- Acciones: hasta tres; no poner una que haga lo mismo que tocar el aviso.
- Avisos viejos: sacarlos cuando dejan de ser relevantes.
- No usar avisos para: promoción cruzada ("strictly prohibited by the Play Store"), traer de vuelta sin dar valor ("Haven't seen you in a while!"), pedir calificación, saludos de fiestas o cumpleaños.
- Importancia: HIGH para lo que hay que saber o hacer ya (mensajes, alarmas, llamadas); DEFAULT para lo que se ve cuando convenga (recordatorios); LOW para invitaciones de redes sociales; MIN para promoción.

**Panorama de notificaciones** — https://developer.android.com/develop/ui/compose/notifications (HECHO):
- "Small icon: required". "Large icon: optional; usually used only for contact photos. Don't use it for your app icon."
- Un aviso sin canal no aparece. La interfaz llama "categorías" a los canales.
- Cuatro o más avisos de la misma app sin grupo se agrupan solos. Android 16 agrupa por cuenta de la app.
- Android 15 baja el sonido y la vibración de avisos repetidos durante hasta dos minutos.
- El permiso `POST_NOTIFICATIONS` existe desde Android 13.

**Android 17** — https://developer.android.com/reference/android/app/Notification#EXTRA_PREFER_SMALL_ICON (HECHO): constante nueva en API 37, "requesting that the notification card show the small icon instead of the launcher app icon". Es decir, por defecto la tarjeta muestra el ícono de la app.

**Samsung One UI 7** (HECHO de fuente secundaria: listas de cambios en SamMobile y GSMArena, vía buscador): "Icons on notifications are now the same as the icon that appears on your Home screen". El teléfono del fundador es Samsung (capítulos 31 y 77 del proyecto); no sé qué versión de One UI tiene.

**Medidas del ícono chico:**
- 24×24 dp con cuadro óptico de 22×22 dp, todo blanco, "flat and simple, using the same single, visual metaphor as your launcher icon". Fuente: guía de iconografía de Android, leída en un espejo (stuff.mit.edu); la página oficial vieja ya no está en línea. Fuente secundaria.
- En píxeles: mdpi 24, hdpi 36, xhdpi 48, xxhdpi 72, xxxhdpi 96. Coincide con lo que genera el plugin de Expo (HECHO, fuente instalado).
- Android usa solo el canal alfa del ícono (fuente secundaria: documentación de OneSignal).

**Material Design 3:** no llegué a consultar su página.

### 2.2 Expo (SDK 57)

**Referencia de expo-notifications** — https://docs.expo.dev/versions/v57.0.0/sdk/notifications/ (HECHO):
- `icon`: "96x96 all-white png with transparency".
- `color`: tinte del ícono. `defaultChannel`: canal por defecto para FCM v1.
- `largeIcon` no existe en 57; aparece en la referencia de SDK 58.
- `setNotificationChannelAsync` va antes de pedir el token; en Android 13 el cartel de permiso no sale hasta que exista un canal. Senda ya lo cumple.

**Formato del push de Expo** — https://docs.expo.dev/push-notifications/sending-notifications/ (HECHO):
- Campos útiles que Senda no usa: `tag` (Android, reemplaza el aviso ya mostrado), `collapseId`, `threadId` (iOS, agrupa), `subtitle`, `interruptionLevel`, `relevanceScore`, `categoryId`, `richContent.image`.
- `richContent.image` se muestra solo en Android; en iOS pide una Notification Service Extension.
- No hay campo para color ni para ícono grande aparte.
- Límites: 100 mensajes por pedido, 600 por segundo, 4096 bytes.

### 2.3 iOS

**HIG, Notifications** — https://developer.apple.com/design/human-interface-guidelines/notifications (HECHO, leído por el JSON del sitio oficial porque la página no carga sin JavaScript):
- "Avoid including your app name or icon."
- Título corto. Si solo hay un título genérico, mejor dejar que el sistema muestre el nombre de la app.
- "Avoid sending multiple notifications for the same thing."
- "Avoid sending a notification that tells people to perform specific tasks within your app."
- Oraciones completas, con puntuación, sin truncar a mano.
- Hasta cuatro acciones. "Avoid providing an action that merely opens your app."
- Badge solo para contar lo no leído.

**HIG, Managing notifications** (HECHO, misma vía):
- Niveles: Passive (para ver cuando quieras), Active (por defecto), Time Sensitive (solo si pasa ahora o dentro de una hora), Critical (con permiso especial de Apple).
- Marketing: solo con permiso explícito, nunca Time Sensitive, y con pantalla de ajustes en la app.

**App Store Review Guidelines 4.5.4** — https://developer.apple.com/app-store/review/guidelines/ (HECHO): los push no pueden ser requisito para usar la app ni llevar datos sensibles; promociones solo con consentimiento en la interfaz y forma de salir. La 2.5.18 prohíbe publicidad en avisos.

No encontré en la HIG largos visibles exactos; uso los de Android (30 y 40) como tope común.

### 2.4 Apps de referencia y estudios

- **Duolingo** (HECHO, Yancey y Settles, KDD 2020, https://research.duolingo.com/papers/yancey.kdd20.pdf):
  - Los recordatorios salen de un banco de plantillas escritas a mano, con datos de la persona y condiciones para usar cada una. Ejemplo: "You're on fire / Continue your 109 day Spanish streak on Duolingo", solo con racha de 3 días o más.
  - Repetir la misma plantilla "will get repetitive, desensitize users".
  - Variar por persona dio +0,5 % de usuarios activos diarios y +2 % de retención de nuevos.
  - Se mide si hay una lección dentro de las 2 horas.
- **Airship, benchmarks 2026** (fuente secundaria; el informe pide registro): la mediana de aceptación en Android bajó de 71,3 % (2023) a 53,3 % (2025); iOS cerca de 49 %. Apertura directa mediana de 2,7 a 3,2 %. Personalizar por comportamiento reciente sube la apertura 37 % en promedio.
- **Pielot y otros, MobileHCI 2018** ("Dismissed!", 794.525 avisos de 278 personas): no pude leer las cifras por categoría; no las cito.
- **No encontré un estudio serio y reciente** que relacione frecuencia de avisos con desinstalación. Lo que circula son blogs de proveedores sin datos.
- **Formas de ícono de WhatsApp, Instagram, YouVersion, Headspace y Preguntados:** no las verifiqué hoy. INFERENCIA de conocimiento general: todas usan una sola figura cerrada, sin texto ni detalle fino.

### 2.5 Reglas de redacción (derivadas de las fuentes de arriba y de la regla 18 de la app)

1. **Título = quién o qué.** El alias de la persona, o el nombre del torneo o del grupo. Nunca "Senda" ni "Espadeo". Hasta 30 letras.
2. **Cuerpo = qué pasó y, si hace falta, qué sigue.** Una oración, ideal hasta 40 letras, con punto final. No repite el título.
3. **Verbo concreto en pasado o presente:** "Te desafió", "Ya jugó", "Empezó". Nada de "¡No te lo pierdas!", "¡Suerte!", preguntas retóricas ni eslóganes.
4. **Como mucho un signo de exclamación por aviso, y casi nunca.** Sin emojis de relleno.
5. **Sin comillas angulares en nombres de grupos o torneos.** En la app, entre «» va solo la Biblia.
6. **Español neutro con "tú".** "Empezó", no "arrancó".
7. **Cada aviso se entiende solo,** porque puede aparecer fuera de su grupo.
8. **El recordatorio diario lleva un dato real** (dónde sigue la lectura, el versículo de hoy, la racha) y no repite la plantilla del día anterior.

---

## PARTE 3 — Propuesta para Senda

### 3.1 Ícono chico

**Elegido: "la S manda"** — la S como camino entero dentro del cuadro, con la cruz chica y separada arriba de la punta. Es la variante E de siete que probé.

Especificación en grilla de 24 dp:
- **Camino:** tres curvas de Bézier, con ancho lineal de 3,7 dp (cerca) a 2,1 dp (punta) y extremos redondos. Proporción 1,8 a 1 en lugar de 12 a 1.
  - Tramo 1: (3.8, 21.15) (10.5, 21.7) (21.2, 21.3) (19.0, 17.5)
  - Tramo 2: (19.0, 17.5) (16.6, 13.5) (4.9, 15.9) (6.0, 11.7)
  - Tramo 3: (6.0, 11.7) (6.8, 9.0) (11.6, 9.9) (14.4, 9.65)
- **Cruz:** centro x = 14,4; arriba en y = 1,2; alto 5,6; ancho 4,7; trazo 2,0; barra centrada en y = 3,25; radio de esquina 0,44.
- **Aire entre cruz y camino:** 1,8 dp.
- **Qué se saca del logo:** el corte por el borde, el canto, el brillo, el degradé y la perspectiva fuerte.
- **Mínimos:** trazo de 2 dp o más; huecos de 1,8 dp o más; margen de 1 dp o más por lado.
- **Ajuste pendiente:** el prototipo quedó con 1,75 dp de margen a la izquierda y 3 dp a la derecha. Hay que correrlo 0,6 dp a la derecha.

**Por qué esta y no las dos más cercanas:**
- "Solo la senda" (variante C, sin cruz): es la más limpia, pero pierde la cruz, que es media marca. Queda de respaldo.
- "Más perspectiva" (variante B): se parece más al logo, pero los huecos se cierran a 24-36 px.

**Cómo generarlo por código:**
1. En `scripts/marca/marca_camino.py`, una función nueva `aviso()` que use el mismo método (discos a lo largo de las curvas, unidos con shapely y con cierre redondo) con los parámetros de arriba, y emita `assets/marca/aviso.svg`.
2. En `scripts/generar_iconos.cjs:34`, cambiar la pieza a `cuadro(svg("aviso.svg"))`.
3. En `:31`, usar el mismo dibujo a 0,6 para el monocromo del lanzador.

Shapely no está instalada en este entorno; el prototipo lo hice sin ella, con discos en SVG y Chromium, y da el mismo dibujo.

**Cómo probarlo:**
- Hoja a 24, 36, 48, 72 y 96 px sobre claro (`#FFFFFF`) y oscuro (`#1B1B1F`), ampliada y a tamaño real. El script `hoja.sh` de `oportunidades/proyectos/senda/marcas/aviso_2026-11/` ya lo hace.
- Mirar sobre todo 36 y 48 px, que es el tamaño real en la barra.
- Después, captura real en el emulador de `humo.yml` con el panel abierto, en tema claro y oscuro.

### 3.2 Color de acento

**Recomendado: `#6E56F7`** (`color.violeta` de `src/tema.ts`), y un solo color para todos los avisos.

| Color | Contra blanco | Contra `#1B1B1F` |
|---|---|---|
| Ámbar `#F5A524` (actual) | 2,04 | 8,41 |
| Violeta `#6E56F7` | 4,84 | 3,55 |
| Violeta del logo `#6A3BFF` | 5,70 | 3,01 |

- El violeta es el único de la paleta que pasa de 3,5:1 en los dos temas (HECHO, calculado).
- INFERENCIA, sin probar: con ámbar, en tema claro el sistema lo oscurece a un ocre, y donde dibuja el ícono blanco sobre un círculo del color, casi no se lee.
- Implica sacar el `color` por aviso de `avisos.ts:88, 133, 148, 161` y cambiar `app.json:81`.
- Es una decisión de marca: el ámbar es "la luz" de Senda. Por eso va a decisión del fundador con las dos capturas.

### 3.3 Canales

Cuatro. Se conservan los ids existentes: en Android el nombre y la descripción de un canal se pueden actualizar, pero no su importancia ni su sonido.

| Id | es / pt / en | Importancia | Qué lleva |
|---|---|---|---|
| `senda_v4` | Duelos y torneos / Duelos e torneios / Duels and tournaments | HIGH | te desafiaron, te toca, resultados, cruces de la eliminatoria |
| `social_v1` (nuevo) | Amigos y grupos / Amigos e grupos / Friends and groups | DEFAULT | solicitudes, invitaciones, alguien entró, liderazgo, regalo |
| `eventos_v4` | Tus eventos / Seus eventos / Your events | HIGH | recordatorios del calendario y el torneo al que te anotaste |
| `recordatorio_v4` | Recordatorio diario / Lembrete diário / Daily reminder | DEFAULT | recordatorio diario y copas marcadas |

- `enviar_avisos` elige el canal según `datos->>'tipo'`.
- Agregar `defaultChannel: "senda_v4"` al plugin.
- **Orden obligatorio:** primero sale el APK que crea `social_v1`, después la migración. Un aviso a un canal que no existe se pierde.
- En iOS: `interruptionLevel: passive` para "alguien entró al grupo" y los avisos masivos de grupo; `active` para el resto.

### 3.4 Reescritura de cada texto

{A} = quien hace la acción; {B} = el rival; {G} = quien ganó; {g} = grupo; {t} = torneo.

**Servidor:**

| # | Título | Cuerpo (es) | pt | en |
|---|---|---|---|---|
| S1 | {A} | Te envió una solicitud de amistad. | Enviou um pedido de amizade. | Sent you a friend request. |
| S2 | {A} | Aceptó tu solicitud. Ya pueden jugar. | Aceitou seu pedido. Já podem jogar. | Accepted your request. You can play now. |
| S3 | {A} | Te desafió a un duelo de Espadeo. | Desafiou você para um duelo do Espadeo. | Challenged you to a Sword Duel. |
| S4 | {B} | Aceptó tu duelo. Te toca. | Aceitou seu duelo. É a sua vez. | Accepted your duel. Your turn. |
| S5 | {B} | Completó la armadura y ganó. ¿Revancha? | Completou a armadura e venceu. Revanche? | Completed the armor and won. Rematch? |
| S6 | {B} | Ya jugó su turno. Te toca. | Já jogou. É a sua vez. | Played their turn. You're up. |
| S7 | Duelo con {B} / Duelo com {B} / Duel with {B} | Tu turno vence en 6 horas. | Sua vez termina em 6 horas. | Your turn expires in 6 hours. |
| S8 (ganó) | Ganaste {a} a {b} / Você venceu por {a} a {b} / You won {a}–{b} | {t}, contra {B}. | {t}, contra {B}. | {t}, against {B}. |
| S8 (perdió) | {G} ganó {a} a {b} / {G} venceu por {a} a {b} / {G} won {a}–{b} | {t}. | {t}. | {t}. |
| S8 (empate) | Empate: {n} a {n} / Empate: {n} a {n} / Tie: {n}–{n} | {t}, contra {B}. | {t}, contra {B}. | {t}, against {B}. |
| S9 | Tienes Senda Max / Você tem o Senda Max / You have Senda Max | Te lo regalaron por {n} días. | Você ganhou por {n} dias. | It was gifted to you for {n} days. |
| S10 | {A} | Te invitó al grupo {g}. | Convidou você para o grupo {g}. | Invited you to the group {g}. |
| S11 | {g} | {A} aceptó tu invitación. | {A} aceitou seu convite. | {A} accepted your invitation. |
| S12 (eliminatoria) | {A} | Te invitó a la eliminatoria {t}. Súmate antes de que empiece. | Convidou você para a eliminatória {t}. Entre antes de começar. | Invited you to the knockout {t}. Join before it starts. |
| S12 (¿Quién es?) | {A} | Te desafió a ¿Quién es? | Desafiou você no Quem é? | Challenged you to Who is it? |
| S12 (Nombres por letra) | {A} | Te desafió a Nombres por letra. | Desafiou você no Nomes por letra. | Challenged you to Names by letter. |
| S12 (torneo) | {A} | Te invitó al torneo {t}. | Convidou você para o torneio {t}. | Invited you to the tournament {t}. |
| S13 (torneo) | {g} | Torneo nuevo: {t}. | Novo torneio: {t}. | New tournament: {t}. |
| S13 (eliminatoria) | {g} | Eliminatoria nueva: {t}. Súmate antes de que empiece. | Nova eliminatória: {t}. Entre antes de começar. | New knockout: {t}. Join before it starts. |
| S14 | {A} | Aceptó tu desafío. Ya puedes jugar. | Aceitou seu desafio. Já pode jogar. | Accepted your challenge. You can play now. |
| S15 | {g} | Ahora lideras el grupo. Quien lo lideraba cerró su cuenta. | Agora você lidera o grupo. Quem liderava encerrou a conta. | You now lead the group. The previous leader closed their account. |
| S16 | {t} | Ya empezó. Puedes jugar. | Já começou. Você pode jogar. | It has started. You can play. |
| S17 | {g} | {A} te pasó el liderazgo. | {A} passou a liderança para você. | {A} made you the leader. |
| S18 | {t} | No empezó: hacen falta 2 personas o más. | Não começou: faltam 2 pessoas ou mais. | It didn't start: it needs 2 or more people. |
| S19 (juega) | {t} | Empezó. Hoy juegas contra {B}. | Começou. Hoje você joga contra {B}. | It started. Today you play {B}. |
| S19 (pasa) | {t} | Empezó. Pasas directo a la fase 2. | Começou. Você vai direto para a fase 2. | It started. You go straight to round 2. |
| S20 (final) | {t} | Estás en la final. Juegas contra {B} el {fecha}. | Você está na final. Joga contra {B} em {fecha}. | You're in the final. You play {B} on {fecha}. |
| S20 (fase) | {t} | Pasaste a la fase {k}. Juegas contra {B} el {fecha}. | Você passou para a fase {k}. Joga contra {B} em {fecha}. | You reached round {k}. You play {B} on {fecha}. |
| S21 (ganó) | {t} | Ganaste la eliminatoria. | Você venceu a eliminatória. | You won the knockout. |
| S21 (otros) | {t} | Ganó {G}. | {G} venceu. | {G} won. |
| S22 | {t} | Ganaste {a} a {b} contra {B}. / Perdiste {a} a {b} contra {B}. | Você venceu por {a} a {b} contra {B}. / Você perdeu por {a} a {b} contra {B}. | You won {a}–{b} against {B}. / You lost {a}–{b} to {B}. |

Notas:
- S4, S5, S6, S7, S17 y S22 necesitan un dato que hoy no se pasa al texto (el alias del rival o de quien actúa); está disponible en cada función.
- S9: lo regala un administrador (`soy_admin()`), por eso no lleva nombre.
- S20: la fecha tiene que salir en la zona horaria de quien la recibe.
- En inglés el Espadeo aparece como "Sword Duel" en casi todos lados y como "Espadeo" en `textos.ts:357`. Conviene unificar.

**Locales:**

| # | Título propuesto (es / pt / en) | Cuerpo propuesto (es / pt / en) |
|---|---|---|
| L5 | Sigue en {Juan 3} / Continue em {João 3} / Continue in {John 3} | Tu lectura de hoy. / Sua leitura de hoje. / Today's reading. |
| L1-L4 (se reemplazan) | {referencia del versículo del día} | El versículo de hoy. / O versículo de hoje. / Today's verse. |
| | {nombre de la próxima lección} | Tu próxima lección de la Travesía. / Sua próxima lição da Travessia. / Your next Journey lesson. |
| | Llevas {n} días seguidos / Você está há {n} dias seguidos / {n} days in a row | Hoy sería el {n+1}. / Hoje seria o {n+1}. / Today would be day {n+1}. |
| | Tu lectura de hoy / Sua leitura de hoje / Today's reading | La Biblia abre donde la dejaste. / A Bíblia abre onde você parou. / The Bible opens where you left off. |
| L6-L8 | sin cambio | sin cambio de redacción; pasar "Mañana", "En 1 hora", "En 10 minutos", "Ahora", "Fecha tope", "Es hoy" y "por" a claves en los tres idiomas |
| L9-L10 | sin cambio | sin cambio |
| L11 | Copa de Navidad: mañana / Copa de Natal: amanhã / Christmas Cup: tomorrow | 15 preguntas, las mismas para todos. / 15 perguntas, as mesmas para todos. / 15 questions, the same for everyone. |
| L12 | Copa de Navidad: hoy / Copa de Natal: hoje / Christmas Cup: today | Tienes todo el día para jugarla. / Você tem o dia todo para jogar. / You have all day to play it. |

- Cada plantilla del recordatorio se usa solo si su dato existe (la de racha, desde 3 días) y nunca dos días seguidos la misma.
- Salen "La senda sigue / Un paso hoy cuenta", "Tu momento con la Palabra" y "Lee, escucha o repasa: lo que te salga".
- El recordatorio ya se frena solo: se programan 7 días y se renuevan al abrir la app (`avisos.ts:156`), así que quien no entra una semana deja de recibirlo.

### 3.5 Mejoras de UX, por impacto y esfuerzo

**Entran ya** (un APK y una migración):

| # | Mejora | Impacto | Esfuerzo |
|---|---|---|---|
| 1 | Ícono chico nuevo, el mismo dibujo en el monocromo del lanzador, y un solo color | alto | chico |
| 2 | Textos nuevos del servidor con plantillas por clave e idioma | alto | medio |
| 3 | Toques que llevan al lugar: Amigos y Grupos a su pantalla, el regalo a Planes, el de liderazgo al grupo, y `getLastNotificationResponse()` al arrancar | alto | chico |
| 4 | Un aviso por duelo: `tag` y `collapseId` = `partida:{id}` (el "te toca" reemplaza al "te desafió"), `threadId` por torneo o grupo en iOS | alto | chico |
| 5 | Silencio de 22 a 8 en la hora de la persona: guardar la zona horaria con el token y postergar con `enviar_desde`. Cumple lo que Ajustes ya promete | alto | medio |
| 6 | Sacar del panel los avisos de un duelo al abrirlo | medio | chico |
| 7 | Canales con nombre en tres idiomas y canal `social_v1` | medio | chico |
| 8 | Avisos locales traducidos y banco nuevo del recordatorio | medio | chico |
| 9 | Sonido propio en iOS (`sound: 'aviso_v4.wav'`) | bajo | chico |

Sobre el punto 2: recomiendo una tabla `avisos_textos(clave, idioma, titulo, cuerpo)` y una función `avisar(usuario, clave, vars, datos)`, y que `enviar_avisos` arme el texto con el idioma de cada token. Hay que tocar las 15 funciones una sola vez; después cambiar un texto no toca ninguna. La alternativa de solo cambiar las cadenas en cada función es más rápida pero deja todo en español.

**No entran ahora:**

| Mejora | Por qué espera |
|---|---|
| Avatar del rival como ícono grande (`richContent.image`) | Hace falta servir cada avatar como PNG público; en iOS pide una extensión nativa |
| Tope diario por persona y resumen ("Te esperan 3 duelos") | Conviene medir primero con gente real cuántos llegan |
| Avisos masivos de grupo (hasta 10.000) en importancia baja | Va junto con el tope |
| Acciones rápidas (Aceptar, Rechazar) | Piden una llamada autenticada en segundo plano. "Jugar ahora" no va: Apple y Android piden no duplicar el toque |
| Subir a SDK 58 por `largeIcon` | No hace falta: el logo como ícono grande está desaconsejado |
| Agrupado propio en Android | expo-notifications no lo tiene; Android 16 agrupa solo |

### 3.6 Línea de registro (regla 10)

> 15-11-2026 · Avisos · **expo-notifications 57.0.21** (ya instalada; subir a 57.0.25) con el servicio de push de Expo, y el ícono generado por `scripts/marca/marca_camino.py` + `scripts/generar_iconos.cjs` (Playwright/Chromium) · fuentes: docs.expo.dev/versions/v57.0.0/sdk/notifications y docs.expo.dev/push-notifications/sending-notifications · licencia MIT, sin costo · por qué: ya escribe los metadatos de FCM y soporta `tag`, `threadId`, `interruptionLevel` e imagen remota; Notifee está archivada desde abril de 2026 (fuente secundaria; no pude abrir su repositorio) y OneSignal mandaría datos de usuarios a un tercero · regla de corte: si en la captura del emulador el ícono nuevo no se lee como S y cruz a 36-48 px, se usa "solo la senda"; si hace falta el avatar como ícono grande en iOS, se evalúa una extensión nativa.

## Riesgos

- **No probé en dispositivo.** Todo lo del ícono es render en escritorio. El comportamiento del color en tema claro y el tamaño real de dibujo son inferencias hasta ver la captura.
- **La migración de textos toca 15 funciones** de duelos y torneos. Tiene que pasar `pruebas/nube` antes de ir a la base real.
- **El orden APK → migración** importa por el canal nuevo.
- **Los textos en portugués e inglés** son propuesta mía, sin lectura de un hablante nativo.

## Lo que requiere decisión del fundador

1. **Qué vio exactamente:** una captura del aviso y de la barra de estado, y qué Samsung y versión de One UI tiene. No frena el trabajo; confirma cuál de las dos superficies le pareció fea.
2. **Aprobar el dibujo "la S manda"** mirando la hoja comparativa.
3. **Color del ícono:** violeta `#6E56F7` (mi recomendación) o seguir con el ámbar.

Nada pide plata, cuentas nuevas ni datos a terceros.

## Archivos (copiados del scratchpad al repositorio del holding el 15-11-2026)

Carpeta: `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/`

- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/hoja2.png` — comparación: actual, E, F, G y C, en oscuro y claro
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/E_s_manda.svg` — el ícono recomendado
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/E_s_manda_96.png` — el mismo, a 96 px
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/C_solo_senda.svg` — el de respaldo
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/lanzador_en_aviso.png` — el ícono de la app al tamaño de la tarjeta del aviso
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/actual.png` — el ícono actual a cinco tamaños, en gris y en ámbar
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/icono_aviso.py` — generador del prototipo, con los parámetros de todas las variantes
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/render.cjs` — SVG a PNG con Chromium
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/hoja.sh` — arma la hoja de prueba
- `/home/user/Inversiones-Startups/oportunidades/proyectos/senda/marcas/aviso_2026-11/avisos_sql.py` — saca los textos vigentes de las migraciones

No se copió la primera tanda de variantes (A a D, `icono/hoja_oscuro.png`): quedó solo en el scratchpad de la sesión, que se puede borrar. Sus parámetros están en `icono_aviso.py`.

Archivos del repo que tocaría el constructor: `/home/user/senda-app/app.json`, `/home/user/senda-app/scripts/marca/marca_camino.py`, `/home/user/senda-app/scripts/generar_iconos.cjs`, `/home/user/senda-app/src/util/avisos.ts`, `/home/user/senda-app/src/App.tsx`, `/home/user/senda-app/src/util/juntos.ts`, `/home/user/senda-app/src/i18n/textos.ts` y una migración nueva en `/home/user/senda-app/supabase/migrations/`.

## Fuentes

- https://developer.android.com/design/ui/mobile/guides/home-screen/notifications
- https://developer.android.com/develop/ui/compose/notifications
- https://developer.android.com/reference/android/app/Notification#EXTRA_PREFER_SMALL_ICON
- https://docs.expo.dev/versions/v57.0.0/sdk/notifications/
- https://docs.expo.dev/versions/latest/sdk/notifications/
- https://docs.expo.dev/push-notifications/sending-notifications/
- https://developer.apple.com/design/human-interface-guidelines/notifications
- https://developer.apple.com/design/human-interface-guidelines/managing-notifications
- https://developer.apple.com/app-store/review/guidelines/
- https://research.duolingo.com/papers/yancey.kdd20.pdf
- https://www.sammobile.com/news/samsung-one-ui-7-features-improvements-changelog/ (secundaria)
- https://documentation.onesignal.com/docs/en/notification-icons.md (secundaria)
- https://stuff.mit.edu/afs/sipb/project/android/docs/design/style/iconography.html (espejo de la guía vieja de Android)
- https://www.airship.com/resources/mobile-app-push-notification-benchmarks-2026/ (con registro; cifras por resúmenes de terceros)
- https://dev.to/marco_crupi/notifee-is-archived-heres-a-maintained-new-architecture-drop-in-replacement-3ib5 (secundaria)
