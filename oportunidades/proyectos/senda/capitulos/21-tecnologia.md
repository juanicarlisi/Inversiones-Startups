# Desarrollo tecnológico y escalabilidad

<div class="enpocas" markdown="1">
**En pocas palabras.** Una sola base de código para Android, iOS y (en 2028) web: **React Native con Expo**, en TypeScript, el lenguaje
en el que Claude Code rinde mejor. Detrás, **Supabase** (base de datos, cuentas, tiempo real y archivos), **Cloudflare R2** para las
Biblias y los audios, **Rive** para que Lani se mueva como el búho de Duolingo, **RevenueCat** para las suscripciones, **AdMob** para
los videos, **PostHog** y **Sentry** para medir, y la **API de Claude** para Berea y la producción de contenido. Claude Code puede
construir casi todo; lo que necesita manos humanas especializadas es la **animación de la mascota, la ilustración y el diseño de
sonido**. Costo mensual: USD 40–70 al principio y ~USD 0,012 por usuario activo después.
</div>

## 1. Respuesta honesta: ¿alcanza Claude Code?

| Parte | ¿Claude Code puede? | Qué hace falta |
|---|---|---|
| Estructura de la app, pantallas, navegación, lógica de juegos | **Sí** | — |
| Backend, base de datos, reglas de seguridad, funciones del servidor | **Sí** | — |
| Multijugador en tiempo real (salas de hasta 200), duelos por turnos | **Sí** | Pruebas de carga |
| Animaciones de interfaz (rebotes, ruleta con física, confeti, transiciones) | **Sí** (Reanimated, Skia, Lottie) | Ajuste fino con tu ojo |
| Lienzo de dibujo (Dibujalo) | **Sí** (Skia) | — |
| **Mascota animada con estados y boca que habla** | **Parcial**: integra el archivo y lo controla por código | **Animador de Rive** que dibuja y arma la máquina de estados |
| **Ilustraciones** (Lani, armadura, avatares, fondos) | **Parcial**: bocetos y conceptos con IA | **Ilustrador** para la versión final (y para tener derechos de autor) |
| **Diseño de sonido** (40–60 sonidos + firma) | **Parcial**: especifica, busca en bibliotecas con licencia, genera con herramientas de efectos | **Diseñador de sonido** para la firma y la mezcla final (o curaduría cuidadosa) |
| Contenido (preguntas, lecciones, traducciones) | **Sí**, con verificación automática | **Revisores humanos** |
| Pruebas en teléfonos reales | Automatiza pruebas | **Testers humanos** con distintos teléfonos (incluido iPhone) |
| Publicación en tiendas | Prepara todo (fichas, capturas, textos) | **Vos** apretás el botón y manejás las cuentas |
| Legal | Borradores | **Abogado** para revisar términos y privacidad |

**Conclusión:** el cuello de botella no es el código sino **el arte (Lani), el sonido y la revisión de contenido**. Por eso se
encargan desde el principio (capítulo {{cap:26}}).

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
| IA | **API de Claude** (Anthropic), desde funciones del servidor | Berea, planificador, moderación, producción de contenido por lotes | Por uso (sección 7) | — |
| Voz de la Biblia | Google Cloud TTS o Azure (generación única) | Calidad neuronal, se genera una vez | USD 17–130 por versión | ElevenLabs |
| Traducciones de la interfaz | Archivos i18n + Claude + revisor | Todo traducible desde el día 1 | Gratis | Crowdin |
| Código y pruebas automáticas | GitHub + GitHub Actions | Repositorio privado, pruebas en cada cambio | Gratis | — |
| Sitio web y páginas para compartir | Next.js en Vercel o Cloudflare Pages | Rápido, buen posicionamiento en Google | Gratis al principio | — |

## 4. Tiempo real y multijugador

- **Duelos por turnos:** cada jugada se guarda en la base; una función del servidor valida la respuesta y pasa el turno; aviso al
  rival. No hace falta estar conectados a la vez.
- **Salas en vivo (Senda Reunión, juegos online):** canales de tiempo real de Supabase (mensajes y presencia) para hasta 200 personas por
  sala; el anfitrión es la autoridad del juego y el servidor valida puntajes.
- **Si crece mucho** (miles de salas simultáneas): servidor de juego dedicado (por ejemplo, Colyseus) o un servicio de tiempo real
  administrado. Se decide con pruebas de carga (k6) antes de las Copas.

## 5. Sin conexión primero

- La Biblia (texto) se descarga por versión y se guarda en el teléfono.
- El Camino descarga las próximas lecciones; el progreso se guarda local y se sincroniza al volver la conexión.
- Espadeo en solitario y los juegos diarios funcionan sin conexión; los duelos se envían cuando hay red.
- **El contenido se actualiza sin nueva versión de la app:** preguntas, lecciones y planes llegan como datos (paquetes versionados).

## 6. Datos: las entidades principales

Usuario y perfil · franja de edad y consentimientos · amistades · grupos e iglesias (y verificación) · progreso del Camino (por nivel y
por tarjeta de repaso) · Lámpara (días) · monedas y transacciones · inventario (objetos) · duelos y turnos · preguntas (con su ficha
completa) · propuestas de preguntas y votos · salas y partidas · liga (temporadas, fechas, puntajes) · planes y progreso · notas y
resaltados · pedidos de oración · eventos · suscripciones (vía RevenueCat) · reportes y moderación · registros de IA (sin datos
personales).

## 7. La IA dentro de Senda

| Uso | Cómo | Costo estimado |
|---|---|---|
| **Berea** (preguntas de usuarios) | Función del servidor → búsqueda en nuestras Biblias, notas y comentarios → Claude responde con citas → verificador automático de citas → respuesta | ~USD 0,005–0,02 por respuesta según el modelo |
| **Planificador** de Senda Reunión | Igual, con plantilla de reunión | ~USD 0,02–0,05 por reunión |
| **Moderación** de textos de usuarios (preguntas propuestas, descripciones, pedidos de oración) | Clasificador con Claude + listas de palabras | Centavos por mil textos |
| **Producción de contenido** (preguntas, lecciones, traducciones) | API por lotes (50% más barata), fuera de la app | ~USD 0,012 por pregunta verificada |

**Reglas:** la clave de la API nunca va en la app (solo en el servidor); límite de uso por persona y por día; prompt de sistema en caché
(abarata ~90% la parte repetida); registro de respuestas para revisar calidad.

**Elección del modelo:** se arma una prueba con 200 preguntas reales y respuestas esperadas; se comparan Opus 5.5, Sonnet 5.5 y Haiku
4.5 en precisión de citas, fidelidad doctrinal y tono. Con los resultados decidís el modelo (se puede usar uno para gratis y otro para
Plus). **Decisión pendiente** (capítulo {{cap:27}}).

## 8. Seguridad técnica

- Cuentas con Google, Apple (obligatorio en iOS si se ofrece Google) o correo; sesiones seguras.
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
| Pruebas de carga | Salas de 200 jugadores antes de cada Copa |
| **Pistas de publicación** | Prueba interna → prueba cerrada (12 personas durante 14 días, requisito de Google Play para cuentas personales) → TestFlight en iOS → producción |
| **Lanzamiento gradual** | Google Play: 5% → 20% → 50% → 100% en días; Apple: publicación escalonada de 7 días. Si algo falla, se frena |
| **Actualizaciones por aire** | Cambios de código JavaScript y de contenido sin pasar por la tienda (EAS Update), con vuelta atrás inmediata |
| **Interruptores de funciones** | Las funciones nuevas salen apagadas y se prenden para un porcentaje de usuarios (PostHog) |
| Monitoreo | Sentry (cierres), PostHog (uso), alertas de disponibilidad |

**Metas de rendimiento:** abre en menos de 2 s en un Android de gama baja; 60 cuadros por segundo en animaciones; app de menos de
60 MB; 99,5% de sesiones sin cierres.

## 10. Cómo escala (y cuánto cuesta)

| Etapa | Personas activas por mes | Qué cambia | Costo mensual estimado |
|---|---|---|---|
| Lanzamiento | 0–5.000 | Supabase Pro, R2, planes gratis de lo demás | USD 40–70 |
| Crecimiento | 5.000–50.000 | Más capacidad de base de datos; EAS Starter; más uso de IA | USD 150–600 |
| Escala | 50.000–250.000 | Réplicas de lectura, caché, CDN para contenido, mediación de anuncios; servidor de juego si hace falta | USD 700–3.000 |
| Gran escala | 1 M+ | Equipo técnico, infraestructura dedicada | A definir con ingresos |

Regla práctica: **~USD 0,012 por persona activa por mes** (servidores + IA), la misma que usa el caso de negocio del holding.

## 11. Costos extra y especialistas

| Qué | Para qué | Costo estimado | Cuándo |
|---|---|---|---|
| Animador de Rive | Lani con 15+ estados, boca sincronizada, piezas de armadura | USD 600–2.000 | Dic-2026 a feb-2027 |
| Ilustrador | Lani final, 6 piezas, 40 objetos de avatar, fondos | USD 400–1.500 | Nov-2026 a ene-2027 |
| Diseñador de sonido | Firma sonora + 40–60 sonidos | USD 150–800 (o USD 50 con bibliotecas con licencia) | Nov-2026 |
| Abogado | Términos, privacidad, bases de sorteos | USD 0–600 | Nov-2026 |
| Voz neuronal de la Biblia | 2 versiones en español | USD 35–260 una vez | Ene-2027 |
| Cuenta de Apple | Publicar en iOS | USD 99 por año | Nov-2026 |
| Cuenta de Google Play | Publicar en Android | USD 25 una vez | Oct-2026 |
| Licencia RVR1960 | La versión más usada | ~USD 10/mes | 2027 |

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
| API de Claude | IA y contenido | Por uso | Oct-2026 |
| Google Play Console | Tienda Android | USD 25 | Oct-2026 |
| App Store Connect | Tienda iOS | USD 99/año | Nov-2026 |
| RevenueCat | Suscripciones | 0 | Ene-2027 |
| AdMob | Videos | 0 | Dic-2026 |
| Google Cloud TTS o Azure | Voz de la Biblia | Por uso | Ene-2027 |
| Rive (cuenta del animador) | Mascota | Del animador | Dic-2026 |
| Meta Business (Instagram) y TikTok | Difusión | 0 | Oct-2026 |
| Plataforma de boletines | Carta a líderes | 0 | Mar-2027 |

## 13. Qué hace que sea superadora (la vara técnica)

- **Lani viva**: 15+ estados en Rive, reacciona a cada respuesta, parpadea, mira, baila, se pone la armadura; desde 2027 habla con la
  boca sincronizada.
- **Coreografía de toque, sonido y vibración** en cada interacción (tabla del capítulo {{cap:14}}).
- **Ruleta con física real** y sonido que se desacelera con ella.
- **Duelos instantáneos**: responder se siente local (menos de 100 ms) y se sincroniza detrás.
- **Todo anda sin conexión** y en teléfonos baratos.
- **Contenido vivo**: preguntas y lecciones nuevas cada semana sin actualizar la app.
- **Medición de todo** y mejoras cada dos semanas con la app publicada.

## 14. La versión web (2028)

La misma base de código genera la web (React Native Web con Expo) para jugar desde la computadora, proyectar Senda Reunión desde una
notebook y **entrar a una sala sin instalar** (el mejor argumento para los líderes). Las páginas públicas (versículos, planes, resultados
compartidos) se hacen con Next.js para que Google y las IA las encuentren.
