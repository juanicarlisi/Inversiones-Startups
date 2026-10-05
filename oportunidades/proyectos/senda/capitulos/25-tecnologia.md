# Desarrollo tecnológico y escalabilidad

<div class="enpocas" markdown="1">
**En pocas palabras.** Una sola base de código para Android, iOS y (en 2028) web: **React Native con Expo**, en TypeScript, el lenguaje
en el que Claude Code rinde mejor. Detrás, **Supabase** (base de datos, cuentas, tiempo real y archivos), **Cloudflare R2** para las
Biblias y los audios, **Rive** para que Lani se mueva como el búho de Duolingo, **RevenueCat** para las suscripciones, **AdMob** para
los videos, **PostHog** y **Sentry** para medir, la Biblia con licencia vía **API.Bible** (más tres Biblias libres desde el día 1), y la **API de
Claude solo por detrás** (producir, traducir y moderar contenido; no hay IA para los usuarios). Claude Code puede construir casi todo;
para llegar al **nivel profesional** hacen falta, además, un **diseñador de interfaz**, un **ilustrador**, un **animador de Rive** y
un **diseñador de sonido**. Costo mensual: USD 80–330 en 2027 (con licencias de Biblias) y ~USD 0,009 por usuario activo más
licencias después.
</div>

## 1. Respuesta honesta: ¿alcanza Claude Code?

| Parte | ¿Claude Code puede? | Qué hace falta |
|---|---|---|
| Estructura de la app, pantallas, navegación, lógica de juegos | **Sí** | — |
| Backend, base de datos, reglas de seguridad, funciones del servidor | **Sí** | — |
| Multijugador en tiempo real (salas de hasta 200), duelos por turnos | **Sí** | Pruebas de carga |
| Animaciones de interfaz (rebotes, ruleta con física, partículas, explosiones de luz, transiciones) | **Sí** (Reanimated, Skia, Lottie) | Ajuste fino con tu ojo y el del diseñador |
| **Dirección visual y sistema de interfaz** (paleta, componentes, íconos, cómo se ve cada pantalla) | **Parcial**: lo programa con precisión y propone | **Diseñador de interfaz** que define el sistema y las pantallas clave: es lo que separa «hecho en Claude» de «app profesional» |
| Calendario (repeticiones, invitaciones, suscripción desde Google o Apple) | **Sí** | — |
| Pantalla escudo antes de las redes (*Primero la Palabra*) | **Sí**, con módulos nativos | Permiso especial de Apple (Family Controls) y cumplir las políticas de Google |
| Compartir en historias de Instagram, WhatsApp y Facebook | **Sí** | Un Facebook App ID (cuenta de desarrollador de Meta) |
| Lienzo de dibujo (Dibujalo) | **Sí** (Skia) | — |
| **Mascota animada con estados y boca que habla** | **Parcial**: integra el archivo y lo controla por código | **Animador de Rive** que dibuja y arma la máquina de estados |
| **Ilustraciones** (Lani, armadura, avatares, fondos) | **Parcial**: bocetos y conceptos con IA | **Ilustrador** para la versión final (y para tener derechos de autor) |
| **Diseño de sonido** (40–60 sonidos + firma) | **Parcial**: especifica, busca en bibliotecas con licencia, genera con herramientas de efectos | **Diseñador de sonido** para la firma y la mezcla final (o curaduría cuidadosa) |
| Contenido (preguntas, lecciones, traducciones) | **Sí**, con verificación automática | **Revisores humanos** |
| Pruebas en teléfonos reales | Automatiza pruebas | **Testers humanos** con distintos teléfonos (incluido iPhone) |
| Publicación en tiendas | Prepara todo (fichas, capturas, textos) | **Vos** apretás el botón y manejás las cuentas |
| Legal | **Sí**: todos los documentos (capítulo {{cap:26}}) | Revisión profesional puntual y opcional en dos casos |

**Conclusión:** el cuello de botella no es el código sino **la dirección visual, el arte (Lani), el sonido y la revisión de
contenido**. Por eso se encargan desde el principio (capítulos {{cap:29}} y {{cap:30}}).

## 2. La arquitectura

{{ARQUITECTURA}}

## 3. Las piezas y por qué

| Pieza | Elección | Por qué | Costo | Alternativa |
|---|---|---|---|---|
| App móvil | **React Native + Expo** (TypeScript) | Una base para Android e iOS (y web); actualizaciones sin pasar por la tienda; enorme ecosistema; Claude rinde mejor en TypeScript | Gratis | Flutter |
| Compilación y publicación | **Expo EAS** (Build, Submit, Update) | Compila iOS en la nube sin Mac; publica en tiendas; actualizaciones «por aire» | Gratis → USD 19/mes (Starter) en meses de mucho trabajo | Compilar a mano |
| Animación de la mascota | **Rive** (runtime gratis y abierto) | Lo que usa Duolingo: máquina de estados, archivos chicos, boca sincronizada | Editor: el animador usa su cuenta (desde USD 9/mes); el motor en la app es gratis | Lottie (más limitado) |
| Microanimaciones | **Reanimated** + **Lottie** | 60 cuadros por segundo en el hilo de la interfaz | Gratis | — |
| Dibujo y gráficos | **React Native Skia** | Lienzo rápido (Dibujalo), ruleta, efectos de luz | Gratis | — |
| Sonido y vibración | expo-audio + expo-haptics | Sonidos precargados y vibración sincronizada | Gratis | — |
| Base de datos, cuentas, tiempo real, archivos | **Supabase** (Postgres) | SQL con reglas de seguridad por fila; tiempo real incluido; código abierto (se puede mudar) | Gratis → **USD 25/mes (Pro)** desde el lanzamiento | Firebase |
| Biblias, audios e imágenes | **Cloudflare R2** + CDN | Sin costo por descarga (clave para el audio) | ~USD 0,015 por GB al mes | S3 |
| Almacenamiento local | SQLite en el teléfono | Biblia y progreso sin conexión | Gratis | — |
| Suscripciones | **RevenueCat** | Unifica Google y Apple, pruebas de precio, antifraude | Gratis hasta USD 2.500/mes; luego 1% | Directo con las tiendas |
| Publicidad | **AdMob** (mediación desde 2028) | Video recompensado; controles para menores | Gratis (se cobra ingreso) | AppLovin MAX |
| Analítica y experimentos | **PostHog** | Eventos, embudos, retención, interruptores de funciones, pruebas A/B | Gratis hasta 1 M de eventos/mes | Firebase Analytics |
| Errores y rendimiento | **Sentry** | Cierres inesperados con detalle | Gratis (plan desarrollador) | Crashlytics |
| Avisos | Expo Notifications (FCM + APNs) | Integrado | Gratis | OneSignal |
| IA (solo interna) | **API de Claude** (Anthropic), fuera de la app | Producción y verificación de contenido, traducción, moderación de textos de usuarios | Por uso (sección 7) | — |
| Biblias con licencia | **API.Bible** (YouVersion Platform no aplica: exige app no comercial) | Versiones con derechos sin negociar una por una | USD 29 + por versión | Licencia directa |
| Fuentes tipográficas | Unbounded, Plus Jakarta Sans, Literata | Licencia libre (SIL OFL), incluidas en la app | Gratis | — |
| Compartir | Sharing to Stories (Meta), hojas de compartir del sistema | Historias de Instagram, estados de WhatsApp, Facebook | Gratis | — |
| Enlaces que abren la app | Enlaces universales (iOS) y App Links (Android) | Cada desafío, evento o sala abre en el lugar correcto | Gratis | — |
| Voz de la Biblia | Google Cloud TTS o Azure (generación única) | Calidad neuronal, se genera una vez | USD 17–130 por versión | ElevenLabs |
| Traducciones de la interfaz | Archivos i18n + Claude + revisor | Todo traducible desde el día 1 | Gratis | Crowdin |
| Código y pruebas automáticas | GitHub + GitHub Actions | Repositorio privado, pruebas en cada cambio | Gratis | — |
| Pantalla escudo (*Primero la Palabra*) | API de Tiempo de Uso de Apple (FamilyControls, ManagedSettings) y permiso de uso de apps en Android, con módulos nativos | Versículo antes de abrir la red elegida | Gratis (requiere permiso de Apple) | — |
| Sitio web y páginas para compartir | Next.js en Vercel o Cloudflare Pages | Rápido, buen posicionamiento en Google | Gratis al principio | — |

## 4. Tiempo real y multijugador

- **Duelos por turnos:** cada jugada se guarda en la base; una función del servidor valida la respuesta y pasa el turno; aviso al
  rival. No hace falta estar conectados a la vez.
- **Salas en vivo (Senda Reunión, juegos online):** canales de tiempo real de Supabase (mensajes y presencia) para hasta 200 personas por
  sala; el anfitrión es la autoridad del juego y el servidor valida puntajes.
- **Viernes de Espadeo en vivo** (miles de personas a la vez): las preguntas se publican por un canal de difusión y las respuestas se
  reciben por lotes; si Supabase no alcanza, servicio de tiempo real administrado o servidor de juego dedicado (por ejemplo, Colyseus).
  Se decide con pruebas de carga (k6) antes del primer vivo (junio de 2027).
- **Liga:** fixture, partidos y tablas se calculan en el servidor cada semana; los duelos oficiales usan las mismas preguntas para los
  dos y se validan en el servidor (antitrampa por tiempos y patrones).
- **Calendario:** eventos con reglas de repetición estándar (las mismas de Google Calendar), avisos programados y un enlace de
  suscripción por grupo que se actualiza solo en el calendario del teléfono.

## 5. Sin conexión primero

- Las Biblias libres se descargan completas; las con licencia se guardan según lo que permita cada una (en API.Bible, refrescando lo
  guardado al menos cada 30 días).
- La Travesía descarga las próximas lecciones y sus imágenes; el progreso se guarda local y se sincroniza al volver la conexión.
- Espadeo en solitario y los juegos diarios funcionan sin conexión; los duelos se envían cuando hay red.
- **El contenido se actualiza sin nueva versión de la app:** preguntas, lecciones y planes llegan como datos (paquetes versionados).

## 6. Datos: las entidades principales

Usuario y perfil · franja de edad y consentimientos · Tu Lani (inventario y equipamiento) · amistades, rachas compartidas y vidas
regaladas · grupos e iglesias (y verificación) · progreso de la Travesía (por Ruta, nivel y tarjeta de repaso) · racha (días) · monedas,
vidas y transacciones · duelos y turnos · preguntas (con su ficha e imagen) · propuestas y votos · salas, reuniones (esquema, bloques,
registros) · liga (temporadas, divisiones, zonas, fechas, partidos, clubes y escudos) · calendario (eventos, repeticiones, asistencia,
turnos) · encuestas (las de estudio, **separadas de la cuenta**) · planes y progreso · notas y resaltados · pedidos de oración ·
suscripciones (vía RevenueCat) · reportes y moderación.

## 7. La IA en Senda: solo por detrás

En la v2 **no hay IA para los usuarios** (ni asistente para preguntarle, ni planificador de reuniones, ni generador de material para el
pastor). La IA trabaja por detrás, siempre con revisión humana:

| Uso | Cómo | Costo estimado |
|---|---|---|
| **Producción de contenido** (preguntas, lecciones de las Rutas, palabras de juegos, devocionales) | API por lotes (50% más barata), fuera de la app | ~USD 0,012 por pregunta verificada |
| **Traducción** de notas y comentarios y de la interfaz | Por lotes, con glosario teológico | USD 30–200 por tanda |
| **Verificación** automática de citas y respuestas | Cruce con el texto bíblico en dos versiones | Centavos |
| **Moderación** de textos de usuarios (nombres, escudos, Estados, preguntas propuestas, pedidos de oración) | Clasificador + listas de palabras, desde el servidor | Centavos por mil textos |

**Reglas:** la clave de la API nunca va en la app; los modelos se eligen por calidad y costo para cada tarea (Opus 5.5 para lo doctrinal
delicado, Sonnet 5.5 o Haiku 4.5 para el volumen), con pruebas antes de cada lote grande.

## 8. Seguridad técnica

- Cuentas con Google, Apple (obligatorio en iOS si se ofrece Google) o correo; sesiones seguras.
- **Encuestas de estudio** guardadas en una base aparte, sin el identificador de la persona; los resultados solo se consultan agregados
  y con mínimos de respuestas.
- **Reglas de seguridad por fila** en la base: cada persona solo lee y escribe lo suyo; los grupos solo lo del grupo.
- Puntajes y monedas **validados en el servidor** (anti-trampa); límites de velocidad contra abusos.
- Copias de seguridad diarias; datos cifrados en tránsito y en reposo.
- Buenas prácticas de seguridad para apps móviles (guía OWASP MASVS): sin secretos en la app, verificación de compras en el servidor.
- Borrado de cuenta y exportación de datos desde la app.

## 9. Calidad: pruebas y publicación

| Qué | Cómo |
|---|---|
| Pruebas automáticas | Unitarias (lógica de juegos y monedas), de componentes y de punta a punta (flujos clave con Maestro) en cada cambio |
| Pruebas de contenido | Verificación automática de citas y respuestas en cada paquete nuevo |
| Pruebas en dispositivos | Matriz de teléfonos (gama baja Android, iPhone viejo y nuevo, tablets); nube de dispositivos cuando haga falta |
| Pruebas de carga | Salas de 200 jugadores; el Viernes de Espadeo con miles de personas a la vez; la fecha de la Liga |
| **Prueba de la grilla** | Cada pantalla clave al lado de su equivalente en las apps de referencia antes de publicar (capítulo {{cap:19}}) |
| **Pistas de publicación** | Prueba interna → prueba cerrada (12 personas durante 14 días, requisito de Google Play para cuentas personales) → TestFlight en iOS → producción |
| **Lanzamiento gradual** | Google Play: 5% → 20% → 50% → 100% en días; Apple: publicación escalonada de 7 días. Si algo falla, se frena |
| **Actualizaciones por aire** | Cambios de código JavaScript y de contenido sin pasar por la tienda (EAS Update), con vuelta atrás inmediata |
| **Interruptores de funciones** | Las funciones nuevas salen apagadas y se prenden para un porcentaje de usuarios (PostHog) |
| Monitoreo | Sentry (cierres), PostHog (uso), alertas de disponibilidad |

**Metas de rendimiento:** abre en menos de 2 s en un Android de gama baja; 60 cuadros por segundo en animaciones; app de menos de
80 MB; 99,5% de sesiones sin cierres.

## 10. Cómo escala (y cuánto cuesta)

| Etapa | Personas activas por mes | Qué cambia | Costo mensual estimado |
|---|---|---|---|
| Lanzamiento | 0–5.000 | Supabase Pro, R2, planes gratis de lo demás, API.Bible Pro + versiones | USD 80–150 |
| Crecimiento | 5.000–50.000 | Más capacidad de base de datos; EAS Starter; licencias que crecen con los usuarios | USD 250–900 |
| Escala | 50.000–250.000 | Réplicas de lectura, caché, CDN para contenido, mediación de anuncios; servidor de juego para los vivos | USD 900–3.500 |
| Gran escala | 1 M+ | Equipo técnico, infraestructura dedicada | A definir con ingresos |

Regla práctica: **~USD 0,009 por persona activa por mes** (servidores + IA interna; sin asistente de IA para usuarios), **más las
licencias de las Biblias** (USD 230–880 por mes con 5 versiones vía API.Bible según usuarios; menos con un precio de ministerio).

## 11. Lo que hace falta para el nivel profesional (más allá del código)

| Quién o qué | Para qué | Costo (nivel profesional) | Cuándo |
|---|---|---|---|
| **Diseñador de interfaz** | Sistema visual (paleta probada, componentes, íconos, movimiento) y 12 pantallas clave | USD 900 | Oct–nov 2026 |
| **Ilustrador** | Lani v2 final, piezas de armadura, íconos, escenarios, objetos de Tu Lani, imágenes para preguntas | USD 500 + 450 + 600 + 300 | Nov-2026 a mar-2027 |
| **Animador de Rive** | Lani con 20+ reacciones y movimientos, boca sincronizada después | USD 1.200 | Dic-2026 a feb-2027 |
| **Diseñador de sonido** | Firma, 60 efectos, música de menús, la escalera de la racha | USD 400 | Nov-2026 |
| **Voz de Lani** | 30 exclamaciones grabadas | USD 150 | Mar-2027 |
| Teléfonos de prueba | Un Android de gama baja y acceso a iPhone (testers) | — | Siempre |
| Licencias de Biblias | RVR1960, NTV, NVI, DHH, TLA | USD 39–330 por mes en 2027 (0 con solo las libres) | Desde el lanzamiento |
| Cuentas | Apple (USD 99 por año), Google Play (USD 25 una vez), Meta (gratis) | — | Oct-2026 |

Detalle, niveles y alternativas más baratas o más caras en el **menú de calidad** del capítulo {{cap:29}}.

## 12. Integraciones para configurar desde el principio

| Servicio | Para qué | Costo al inicio | Cuándo |
|---|---|---|---|
| GitHub | Código, pruebas | 0 | Oct-2026 |
| Expo / EAS | Compilar y publicar | 0 | Oct-2026 |
| Supabase | Backend | 0 → 25 | Oct-2026 |
| Cloudflare (R2, DNS, páginas) | Contenido y web | ~0 | Oct-2026 |
| Dominio y correo del proyecto | Marca y soporte | ~USD 20–45 al año | Oct-2026 |
| PostHog | Analítica y experimentos | 0 | Oct-2026 |
| Sentry | Errores | 0 | Oct-2026 |
| API de Claude | Contenido y moderación (por detrás) | Por uso | Oct-2026 |
| API.Bible | Biblias con licencia | USD 29 + versiones | Cuando se apruebe la RVR1960 |
| Meta for Developers | Compartir en historias de Instagram | 0 | Nov-2026 |
| Apple: permiso Family Controls | *Primero la Palabra* en iOS | 0 (a pedido) | Mar-2027 |
| Google Play Console | Tienda Android | USD 25 | Oct-2026 |
| App Store Connect | Tienda iOS | USD 99/año | Nov-2026 |
| RevenueCat | Suscripciones | 0 | Ene-2027 |
| AdMob | Videos | 0 | Dic-2026 |
| Google Cloud TTS o Azure | Voz de la Biblia | Por uso | Ene-2027 |
| Rive (cuenta del animador) | Mascota | Del animador | Dic-2026 |
| Meta Business (Instagram) y TikTok | Difusión | 0 | Oct-2026 |
| Plataforma de boletines | Carta a líderes | 0 | Mar-2027 |

## 13. Qué hace que sea superadora (la vara técnica)

- **Pasa la prueba de la grilla:** cada pantalla al nivel de Duolingo, Preguntados o Candy Crush.
- **Lani viva**: 20+ reacciones en Rive, mira lo que tocás, parpadea, baila, se pone la armadura; desde 2027 habla con la boca
  sincronizada.
- **Jugosidad en cada momento:** explosiones de luz, sonidos que suben con la racha, vibración sincronizada.
- **Coreografía de toque, sonido y vibración** en cada interacción (tabla del capítulo {{cap:19}}).
- **Ruleta con física real** y sonido que se desacelera con ella.
- **Duelos instantáneos**: responder se siente local (menos de 100 ms) y se sincroniza detrás.
- **Todo anda sin conexión** y en teléfonos baratos.
- **Contenido vivo**: preguntas y lecciones nuevas cada semana sin actualizar la app.
- **Medición de todo** y mejoras cada dos semanas con la app publicada.

## 14. La web

- **Fines de 2027 (v3):** entrar a una sala de Senda Reunión desde el navegador, sin instalar (el mejor argumento para los líderes).
- **2028:** la web completa con la misma base de código (React Native Web con Expo) para jugar desde la computadora y proyectar Senda
  Reunión desde una notebook.
- Las páginas públicas (versículos, resultados y eventos compartidos) se hacen con Next.js para que Google y las IA las encuentren.
