# Senda: anuncios y vidas. Cómo están, qué cambiar y cuánto deja cada opción (19-11-2026)

Pedido del fundador (19-11-2026, textual): «hacé un análisis de como está hoy en día también el tema de los anuncios. Creés que están
bien seteados para q la recaudación sea buena? veía q 5 vidas quizás es un montón. Podemos bajarlo a 3. Y poner más anuncios como lo
ves? va a arruinar la experiencia del usuario? quizás cada 2 veces q perdes en una trivia, osea pierdo, juega el otro, vuelvo a
perder, ahí mandarle un anuncio. en la travesía, quizás luego de completar 2 niveles. o no sé, hacé vos benchmark exhaustivo, análisis
profundo, investigación, excelente sinergia entre UX y recaudación y rentabilidad, para q de bien.»

**Etiquetas:** **HECHO** (con fuente y fecha), **ESTIMACIÓN** (con método), **HIPÓTESIS** (a validar), **INFERENCIA** (razonamiento
propio). **Calidad de la fuente:** [oficial] la empresa, la tienda o la plataforma; [académico]; [prensa]; [proveedor] vende publicidad
o mediación (le conviene que los anuncios parezcan buenos); [tercero] guías y agregadores; [usuarios] reseñas y foros.

**Palabras que se usan:** *intersticial* = anuncio de pantalla completa que aparece solo; *video con premio* = el que la persona elige
ver a cambio de algo; *eCPM* = lo que paga la publicidad cada 1.000 anuncios mostrados; *relleno* = veces que hay un anuncio para
mostrar; *activo* = persona que abre la app ese día; *D7* = de cada 100 que instalan, cuántos vuelven el día 7.

---

## Resumen ejecutivo

1. **El esquema de hoy está bien pensado y no está flojo:** un intersticial al terminar, nunca en la Biblia ni a mitad de lección, uno cada 4 minutos como mucho. Es la carga de Duolingo (un anuncio al final de cada lección), lejos de las trivias que juntan quejas.
2. **Hallazgo 1, plata sin un anuncio más por partida:** el contador de «2 actividades libres por día» vive en la memoria y vuelve a cero cada vez que el teléfono cierra la app. Por eso hoy se muestran ~28 % menos intersticiales de los que dice la regla. Guardarlo por día suma **~34 %** de ingreso (ESTIMACIÓN).
3. **Hallazgo 2, obligatorio para iPhone:** Apple (guía 2.5.18) exige que se puedan **denunciar anuncios inapropiados**. Senda no lo tiene, y `docs/TIENDAS.md` lo da por cumplido.
4. **Bajar a 3 vidas no suma plata.** Los videos que se ven de más (+65 %) no compensan los juegos que se dejan de jugar: queda entre **−8 % y +5 %** antes de contar a los que se van. Además, un principiante queda trabado **a mitad de una lección 30 a 60 veces más seguido**. Ese es el problema que llevó a Duolingo a sacar los corazones en 2025.
5. **5 vidas no son «un montón».** En Senda cada juego gasta una vida aunque ganes, y en la lección cada error gasta otra. Candy Crush también da 5 vidas con una cada 30 minutos, pero ahí solo se pierde una vida al perder.
6. **«Un anuncio cada 2 derrotas»:** en esta trivia cada turno termina con un error, así que sin reloj serían ~5 anuncios en una partida de 12 minutos. Eso queda justo en el límite de AdMob (uno cada dos acciones) y le pega más al que más se equivoca. **Con el reloj de 4 minutos, en la práctica contra Lany ya funciona casi así.** En la Travesía, «cada 2 niveles» muestra **menos** anuncios que hoy.
7. **Modelo, cada 1.000 activos por día en Latinoamérica:** hoy USD 1,57 por día; con el contador arreglado, 2,10; con la recomendada, 2,30; con la propuesta del fundador, 2,90, pero con **~12 % menos activos** al estabilizarse (8 % menos que con la recomendada). En EE. UU. cada activo deja ~7 veces más (16,4 por día con la recomendada).
8. **Qué decide:** cuánta gente se va por cada anuncio de más (eso se mide), la parte de usuarios de EE. UU. y lo que paga cada anuncio. Lo que menos pesa es la cantidad de anuncios. La propuesta del fundador deja más plata de anuncios en 90 días (+20 %). Si cada 10 % más de anuncios espanta a más del 1,3 % de los activos, deja menos que la recomendada contando el Premium.
9. **Recomendación:** 5 vidas, una cada 30 minutos, y una lección empezada se termina siempre. Contador por día. Reloj de 4 minutos. Un anuncio al mandar cada 2 turnos de un duelo (hoy no hay ninguno). El video que duplica, también al ganar. El día de la instalación, sin intersticiales. Tope de 12 por día. Un video con premio reinicia el reloj.
10. **Todo configurable desde Supabase** y la versión «más intensa» (reloj de 3 minutos) se prueba con 1 de cada 5 personas nuevas, con regla de corte: D7 −1,5 puntos, reseñas que hablan de anuncios, nota por debajo de 4,5.

---

## 1. Cómo está hoy (HECHO, leído en el código el 19-11-2026)

| Qué | Regla | Dónde |
|---|---|---|
| Vidas | 5; vuelve 1 cada 30 min; +1 por capítulo nuevo leído (hasta 3 por día); +1 por video, sin límite | `src/tema.ts` (`reglas`), `src/estado/usuario.ts` |
| Qué gasta una vida | Cada juego al empezar (Espadeo, duelos, «¿Quién es?», «Nombres por letra», «Antes o después», «En la frente», «Vivir la historia», la copa); en la Travesía, cada error. Torneos y sala en vivo no gastan | `src/util/vida.ts`, `src/pantallas/Leccion.tsx` |
| Historia | En la prueba 11 el fundador subió de 3 a 5: «que no se terminen enseguida y que siempre se puedan recuperar con anuncios» | comentario en `src/tema.ts` y migración `version < 5` en `usuario.ts` |
| Intersticial al terminar | Al terminar un juego o al tocar «Seguir» después de una lección; las 2 primeras actividades libres; como mucho 1 cada 4 min (todo junto) | `src/util/pausaAnuncio.ts` (`tocaAnuncio`) |
| Intersticial en el turno de Lany | En la práctica del Espadeo, cuando fallás juega Lany: ahí puede ir un anuncio, con la misma medida | `pausaAnuncio.ts` (`tocaAnuncioEnPausa`), `Jugar.tsx` |
| Duelos con personas | Al fallar, el turno se manda al rival y **no hay anuncio**; el único va al terminar el duelo (días después) | `Jugar.tsx` (`finDeTurno` → `enviarTurno`) |
| Video con premio | +1 vida (al quedarse sin); +10 Talentos duplicando el cofre (hasta 3 por día, solo plan gratis) | `Leccion.tsx`, `Jugar.tsx`, `Travesia.tsx` |
| A quién nunca | Menores de 13, Premium y Max | `src/util/anuncios.ts` |
| Cómo | AdMob sin personalizar, clasificación G (cuenta en PG), categorías sensibles bloqueadas, precarga | `docs/ANUNCIOS.md` |
| A distancia | Solo un interruptor de prender y apagar (`anuncios`); ningún número se puede cambiar sin una versión nueva | `src/util/interruptores.ts` |

**Tres cosas que no están como se cree:**

1. **«2 libres por día» es, en la práctica, «2 libres cada vez que la app arranca de cero».** El contador (`partidasHoy`) y el reloj
   (`ultimo`) viven en la memoria. El propio comentario lo dice: «al reabrir la app vuelve a contar». En Android, el sistema cierra
   las apps en segundo plano, sobre todo en teléfonos de gama baja, que en Latinoamérica son mayoría. Así, quien entra 2 o 3 veces
   por día recibe 2 regalos cada vez. La regla escrita en `docs/ANUNCIOS.md` y en el pedido dice «del día».
2. **Falta la denuncia de anuncios que pide Apple.** La guía 2.5.18 termina así: «Apps that contain ads must also include the
   ability for users to report any inappropriate or age-inappropriate ads» (Apple, consultado el 19-11-2026). En la app no hay
   ningún texto ni botón para eso, y `docs/TIENDAS.md` marca la 2.5.18 como «Cumplido por diseño». Hay que agregarlo antes de mandar
   el iPhone a revisión.
3. **Un video con premio no cuenta como anuncio para el reloj.** Alguien puede mirar un video para conseguir una vida, jugar 3
   minutos y comerse un intersticial al terminar. Unity e ironSource recomiendan no mostrarle intersticiales a quien mira videos por
   su cuenta.

---

## 2. Benchmark

### 2.1 Cómo lo hacen las apps comparables

| App | Vidas o energía | Anuncios: dónde y cada cuánto | Video con premio | Qué le enseña a Senda | Fuente y fecha |
|---|---|---|---|---|---|
| **Duolingo** | Hasta 2025: 5 corazones, se pierde 1 por error, vuelve 1 cada ~4 h [tercero]. Desde jul-2025: **energía**; «cada lección usa un poco», se llena en ~1 día; los errores dejan de restar | **«Quien usa Duolingo gratis ve un anuncio al final de cada lección»** | Recupera energía; desde jun-2026, un video de 30 s antes de la primera lección = 30 min de energía ilimitada; el 89 % vio alguno y el 40 % los mira seguido | Uno por lección es la carga del líder del rubro. Sacó los corazones porque **los principiantes tenían el doble de chances de quedarse sin vidas a mitad de lección**. La energía igual tuvo rechazo (petición y críticas de «muro de pago») | [Blog, 03-07-2025](https://blog.duolingo.com/duolingo-energy/) [oficial]; [10-K 2025](https://www.sec.gov/Archives/edgar/data/1562088/000162828026012494/duol-20251231.htm) [oficial]; eMarketer jun-2026 y Android Authority oct-2025, vía `2026-11-18-senda-talentos-benchmark.md` [prensa] |
| **Preguntados / Trivia Crack** (Etermax) | Retro: hasta 10 vidas, +1 cada 30 min. Versión vieja: 3 vidas, 1 por hora (qué gasta la vida no se pudo verificar) | Reseñas: anuncio después de cada respuesta mal y de cada partida; versión paga «sin anuncios» y pase anual | Una vida por video (versión vieja) | Según un agregador, el exceso de anuncios es **la primera causa de reseñas negativas en 2025-2026** (no verificado). 600 M de descargas | Centro de ayuda Retro (leído por el buscador; la página dio 403) [oficial]; [App Store](https://apps.apple.com/app/preguntados/id651510680) [usuarios]; [kimola, jun-2025](https://kimola.com/reports/essential-trivia-crack-user-feedback-analysis-report-app-store-tr-144560) [tercero]; [Wikipedia](https://en.wikipedia.org/wiki/Trivia_Crack) [tercero] |
| **Candy Crush** (King) | **5 vidas, 1 cada 30 min**; la vida se pierde **solo si perdés el nivel** (o salís después de mover); ganar no cuesta | Casi sin intersticiales: vive de compras | — | Las 5 vidas con 30 min son «baratas» porque ganar no las gasta. En Senda, ganar sí gasta | [Wiki de fans](https://candycrush.fandom.com/wiki/Lives) y artículo «484 lives» de King (403) [tercero/oficial], consultado 19-11-2026 |
| **Kahoot!** | No tiene | No encontré anuncios en la app | — | Cobra por funciones (Kahoot!+), no por interrupciones | [kahoot.com/plans](https://kahoot.com/home/plans/) (consultado 18-11-2026) [oficial]; anuncios no verificados |
| **QuizUp** | — | — | — | Cerró en marzo de 2021: «nunca encontró cómo hacer pagar a los jugadores» | [Wikipedia](https://en.wikipedia.org/wiki/QuizUp) [tercero] |
| **Trivias bíblicas** (Daily Bible Trivia ~6 M, Bible Word Puzzle ~35 M, otras) | Monedas para pistas; niveles que se abren jugando | Reseñas: «5 anuncios en 15 preguntas», anuncios después de cada pregunta, compra «sin anuncios» que no siempre funciona | Monedas por video | La queja más repetida del rubro: «no avanzás si no mirás anuncios» y anuncios cada pocas preguntas | [justuseapp](https://justuseapp.com/en/app/1590338120/bible-trivia-bible-quiz-games/reviews) (2024) [usuarios]; [AppGoblin](https://appgoblin.info/apps/com.daily.bible.trivia.android) [tercero]; [learnofchrist](https://learnofchrist.com/resources/daily-bible-trivia) [usuarios] |
| **YouVersion** | No | **Ninguno**; vive de donaciones; 1.000 M de instalaciones | — | La referencia de confianza del rubro: la Biblia sin anuncios (Senda ya lo cumple) | [Christian Today, nov-2025](https://christiantoday.com/news/how-youversion-reached-its-one-billion-download-milestone) [prensa] |
| **Bible App for Kids** (YouVersion y OneHope) | No | Ninguno; gratis y sin compras | — | Lo infantil, sin publicidad (Senda: menores de 13, nunca) | [App Store](https://apps.apple.com/dk/app/bible-app-for-kids/id668692393) [oficial]; [faith.tools](https://faith.tools/app/bible-app-for-kids) [tercero] |
| **Bible Chat** | No | No encontré anuncios; suscripción con IA | — | Las bíblicas grandes cobran suscripción, no viven de anuncios | [Appfigures, abr-2025](https://appfigures.com/resources/insights/20250418/amp?f=5) [tercero]; anuncios no verificados |
| **Brain Out** | Llaves para pistas | Reseñas: anuncio **después de cada nivel**, sin poder saltarlo | Llaves por video | Funciona en descargas, pero junta reseñas de «demasiados anuncios» y pedidos de pistas en vez de anuncios | [App Store](https://apps.apple.com/in/app/brain-out/id1477841973) [usuarios] |
| **Wordle (NYT) y parecidos** | No: el límite es el juego del día | — | — | El límite natural es el contenido del día; el archivo, para suscriptores | [TechCrunch, 07-05-2024](https://techcrunch.com/2024/05/07/nyt-games-launches-a-wordle-archive-with-access-to-more-than-1000-past-puzzles/) [prensa] |
| **Juegos rápidos** (Voodoo, Supersonic y similares) | — | No encontré la regla oficial de Voodoo. Lo publicado por plataformas: Facebook exige **30 s como mínimo** entre intersticiales y recomienda **60-90 s** en juegos casuales y **90-120 s** en puzzles; Google (juegos web) usa por defecto **uno cada 2 min**, nunca menos de 30 s | Para todo | Senda (uno cada 4 min) es 2 a 4 veces más prudente que un juego casual | [Facebook](https://developers.facebook.com/documentation/games/monetize/in-app-ads/interstitial-ads) [oficial]; [Google Ad Placement](https://developers.google.com/ad-placement/docs/ad-rate) [oficial], consultados 19-11-2026 |
| **Mimo** | 5 vidas, vuelve 1 cada ~4 h | — | — | Las vidas son la queja más repetida en sus reseñas | [App Store](https://apps.apple.com/us/app/mimo-learn-coding-programming/id1133960732) (18-11-2026) [usuarios] |

### 2.2 Lo que dicen las plataformas (HECHO [oficial], consultado el 19-11-2026)

| Plataforma | Regla | Qué significa para Senda |
|---|---|---|
| **AdMob**, intersticiales no permitidos ([6201362](https://support.google.com/admob/answer/6201362?hl=en)) | Nada al abrir o al salir de la app; nada después de cada acción; «no más de un intersticial **cada dos acciones**»; nunca uno pegado a otro; «no sorprendas» a quien juega o lee; solo en cortes lógicos (páginas, etapas, niveles); precargar | «Cada 2 derrotas» sin reloj queda **justo en el límite**; el anuncio en el turno de Lany tiene que verse venir |
| **AdMob**, tope por bloque ([7311435](https://support.google.com/admob/answer/7311435/)) | Se puede limitar por persona por minuto, hora o día desde la consola | Sirve de red de seguridad además del tope de la app |
| **AdMob**, clasificación máxima ([7562142](https://support.google.com/admob/answer/7562142?hl=en)) | Con G solo entran anuncios G; bloquear achica la competencia; la consola estima cuánto cambia al mover la clasificación | Probar PG para mayores de 13 si el relleno es bajo (ya previsto en `docs/ANUNCIOS.md`) |
| **Google Play**, mejores experiencias con anuncios ([12271244](https://support.google.com/googleplay/android-developer/answer/12271244?hl=en)) | Prohibidos los de pantalla completa **inesperados**; ejemplo: «los que aparecen **al empezar un nivel**»; permitidos en cortes naturales, «al terminar el nivel o la sección» | Nunca al tocar «Jugar» ni al abrir una lección; sí después del resultado |
| **Google Play**, anuncios ([9857753](https://support.google.com/googleplay/android-developer/answer/9857753?hl=en)) | Todo intersticial tiene que poder cerrarse a los 15 s; el video con premio elegido por la persona no cuenta; los anuncios tienen que ir con la clasificación de la app | Se cumple con el SDK de AdMob |
| **Apple**, guía 2.5.18 ([guías](https://developer.apple.com/app-store/review/guidelines/)) | Anuncios acordes a la edad; nada dirigido con datos sensibles; los intersticiales dicen que son anuncios y tienen un botón de cerrar visible; **la app tiene que dejar denunciar anuncios inapropiados** | **Falta la denuncia** (§1) |

### 2.3 Cuánto paga la publicidad

| Fuente | Período | Latinoamérica, Android | Latinoamérica, iPhone | EE. UU. o Norteamérica | Nota |
|---|---|---|---|---|---|
| [TopOn, informe 1.er semestre 2025](https://mores.toponad.com/reports/TopOn%20Global%20Mobile%20Games%20Monetization%20Report%20_%202025%20H1.pdf) | ene-jun 2025 | Intersticial **≈ USD 1,0-1,3** (en suba); video **≈ 1,05-1,25** (leve baja interanual) | Intersticial ≈ 3,0-4,0; video ≈ 4,7-5,3 | EU+NA Android: intersticial ≈ 3,3-4,6, video ≈ 5,7-7,0; iPhone ≈ 11-13 y 12-13,5 | Leído del gráfico (pág. 21, 22, 33 y 34). En Android de Latinoamérica, **AdMob no está entre las 5 redes que más pagan** (Pangle 34 %, Mintegral, Xiaomi, Kwai, Liftoff) [proveedor] |
| Appodeal 4.º trimestre 2024, vía [playio](https://blog.playio.co/mobile-game-ecpm-benchmarks-2026) | oct-dic 2024 | Intersticial ≈ 1,3; video ≈ 1,8 | ≈ 2,2 y 3,4 | Norteamérica Android ≈ 9,6 y 9,0; iPhone ≈ 10,4 y 13,6 | Lectura de gráficos por un tercero [proveedor/tercero] |
| Appodeal Benchmarks, vía [Moonetix](https://moonetix.com/academy/monetization/highest-cpm-countries) | sep-2024 (consultado por el autor el 20-10-2026) | **México**: intersticial 2,03; video 2,03 | México video 4,21 | **EE. UU.** Android: intersticial 11,24, video 13,00; iPhone: 12,02 y 14,53 | Todas las categorías [proveedor/tercero] |
| Argentina y Colombia por formato | — | **No encontrado** (solo una lista genérica sin método: AR 0,35, CO 0,61, MX 0,76) | — | — | Se mide en el informe por país de AdMob a las 2 semanas de lanzar |
| Anuncios **sin personalizar** | — | Sin cifra oficial para apps. AdMob deja comparar «sin personalizar» contra «sin restricción» en sus informes | — | — | Referencia más dura: el experimento al azar de Google en sitios web (96 días de 2019) dio **−52 % de ingreso** promedio sin cookies (mediana −64 %) ([Google, 27-08-2019](https://services.google.com/fh/files/misc/disabling_third-party_cookies_publisher_revenue.pdf)) [oficial, con interés] |
| Teléfonos | jun-ago 2026 | Argentina: Android 82-87 %; México: 78 % | | | [StatCounter](https://gs.statcounter.com/os-market-share/mobile/argentina) [tercero] |

**ESTIMACIÓN para Senda.** Método: benchmark × 0,55 (HIPÓTESIS: −45 % por anuncios sin personalizar, clasificación G, categorías
bloqueadas y solo AdMob; rango −30 a −60 %), con 82 % de Android.
- **Latinoamérica, intersticial:** Android 1,15 × 0,55 = 0,63 e iPhone 3,5 × 0,55 = 1,93. Mezclado da 0,87 → **USD 0,85 cada 1.000**
  (rango 0,40-1,60).
- **Latinoamérica, video:** Android 1,15 × 0,55 = 0,63 e iPhone 5,0 × 0,55 = 2,75. Mezclado da 1,01 → **USD 1,00** (rango 0,50-1,80).
- **EE. UU.:** intersticial ≈ 11,5 × 0,55 = 6,3 → **USD 6,0**; video ≈ 13,8 × 0,55 = 7,6 → **USD 7,5**. Se redondea hacia abajo por
  el público adolescente y los bloqueos.
- **Relleno:** 85 % (HIPÓTESIS; no hay un benchmark público).

**INFERENCIA:** en Latinoamérica, un video con premio y un intersticial pagan casi lo mismo. Por eso «más videos a cambio de menos juegos»
no es negocio.

### 2.4 Qué le pasa a la gente cuando hay más anuncios

| Estudio | Qué encontró | Calidad |
|---|---|---|
| **Pandora**, 35 M de oyentes, 9 grupos al azar, 21 meses ([Goli, Huang, Reiley y Riabov, arXiv 07-12-2024](https://arxiv.org/abs/2412.05516v1)) | Más anuncios → menos horas, menos días y menos probabilidad de seguir escuchando. **A largo plazo la sensibilidad es 3 veces la que muestra un mes.** La gente reacciona al **total de anuncios por hora**, no tanto a cuántas pausas. Más anuncios → más gente paga la versión sin anuncios | académico |
| Pandora, resumen de [Nielsen Norman Group, 06-05-2018](https://www.nngroup.com/articles/annoying-ads-cost-business/) | De 3,6 a 5,0 anuncios por hora (+38 %): −2,8 % de horas por semana; con −25 % de anuncios, +1,7 %. El 41 % de la caída vino de gente que dejó de usar. Al mes, la caída era de apenas −0,4 % | prensa especializada |
| Pandora y suscripciones ([Goli, Reiley y Zhang, *Marketing Science* 44(2), 2025](https://econpapers.repec.org/RePEc:inm:ormksc:v:44:y:2025:i:2:p:327-352)) | 7 M de usuarios, 18 meses: el efecto sobre el uso tardó **más de un año** en estabilizarse | académico |
| ZiMAD, *Dig Out!* ([Unity/ironSource, 10-12-2019](https://unity.com/en/resources/zimad-dig-out)) | Sumar intersticiales a un juego que solo tenía videos y banners: ingreso por activo +18 %, D7 −2,5 % | proveedor |
| Appodeal, *Word Maker* ([Appodeal](https://appodeal.com/success-stories/20-arpu-retention-strategies-3-successful-games/), s/f) | Sacar la espera entre intersticiales: +15 % de ingreso, «sin efecto» en la retención en 2 semanas (muy poco tiempo para verlo) | proveedor |
| [Unity/ironSource, 07-03-2021](https://unity.com/blog/best-practices-for-maximizing-revenue-from-interstitial-ads-in-your-app) | Si subís la frecuencia y cae D1 sin que suba el ingreso, retrocedé. En juegos hipercasuales, el primer anuncio entre el nivel 3 y el 8; en casuales, esperar. No mostrarles intersticiales a quienes pagan ni a quienes miran muchos videos | proveedor |
| [Deloitte con Google AdMob, 2025](https://www.deloitte.com/us/en/industries/tmt/articles/improve-mobile-game-advertising.html) | Encuesta a 7.000 jugadores: los anuncios que interrumpen traen malestar, sesiones más cortas y más abandono; el 72 % de los que ven anuncios de buena calidad sigue jugando | proveedor (encuesta) |
| [playio, 2026](https://blog.playio.co/interstitial-ads-mobile-games) | **El ingreso extra se ve el mismo día; la gente que se va se nota entre el día 3 y el 7.** Probar al menos 7 días | tercero |

**INFERENCIA:** el riesgo de «más anuncios» es asimétrico. La plata se ve enseguida y la pérdida de gente tarda meses en aparecer.
Una prueba corta engaña.

### 2.5 Cuánta gente mira el video con premio

- AdMob llama «bueno» a que lo mire más del 50 % de los activos del día, con 80 % de videos completos ([guía de AdMob](https://admob.google.co.in/home/resources/rewarded-ads-playbook/), s/f) [proveedor].
- Más de un tercio de los activos lo mira en muchos géneros (38,4 % en juegos de palabras) ([Dataconomy, 25-11-2025](https://dataconomy.com/2025/11/25/how-rewarded-advertising-became-a-core-growth-engine-for-mobile-games)) [prensa].
- Duolingo: el 89 % vio alguno y el 40 % los mira seguido (eMarketer, jun-2026, vía el benchmark del 18-11) [prensa].
- La «tasa de aceptación» (cuántos de los que reciben la oferta la toman) depende de cómo se cuente. Los proveedores dicen 40-70 % ([Applixir, 2026](https://www.applixir.com/blog/rewarded-video-quality-benchmarks-2026-completion-rates-viewability-user-engagement/)) o 70-90 % ([Gamelight, 2025](https://www.gamelight.io/post/rewarded-ua-benchmarks-ctr-retention-roas-in-2025)), con interés propio.
- **HIPÓTESIS para Senda:** 40 % al quedarse sin vidas (porque leer un capítulo es otra salida) y 25-35 % para duplicar Talentos.

---

## 3. Las propuestas del fundador, una por una

### 3.1 De 5 a 3 vidas (con recarga cada 30 min)

**Lo que pasa (INFERENCIA y ESTIMACIÓN):**
- **Con recarga de 30 minutos, las vidas pesan solo dentro de una sesión.** Entre una sesión y otra se llenan solas: 3 vidas en 1,5 h y
  5 en 2,5 h. Quien juega 1 o 2 cosas por vez no nota la diferencia. La notan quien juega varias seguidas y **quien se equivoca en las
  lecciones**.
- **Un Espadeo dura ~12 minutos** y gasta 1 vida. Para ganar hacen falta 24 aciertos (6 piezas, cada una con 3 de Carga más la prueba);
  con 70 % de aciertos son ~34 preguntas y ~10 turnos de Lany (ESTIMACIÓN). Las vidas casi no limitan el Espadeo: limitan los juegos
  cortos y las lecciones.
- **Una lección con errores sí se traba.** En una lección de 7 ejercicios, empezada con todas las vidas, la probabilidad de quedarse sin
  vidas a la mitad es esta (ESTIMACIÓN, binomial):

| Errores por ejercicio | 3 vidas | 4 vidas | 5 vidas |
|---|---|---|---|
| 15 % | **7,4 %** | 1,2 % | 0,12 % |
| 20 % (principiante) | **14,8 %** | 3,3 % | 0,47 % |

  Con 3 vidas, una de cada siete lecciones de un principiante se corta a la mitad para ofrecerle un video. Es **30 a 60 veces** más
  seguido que con 5. Es exactamente lo que Duolingo corrigió en 2025 («los principiantes tenían el doble de chances de quedarse sin
  corazones a mitad de lección»). Choca con la misión: que aprender la Palabra nunca se trabe por un anuncio.
- **La plata no mejora.** En el modelo de §4, bajar solo a 3 vidas hace ver un 65 % más de videos con premio, pero se pierden juegos y
  lecciones de quien se va al quedarse sin vidas (−9 % de intersticiales). Antes de contar a los que dejan la app, el resultado es
  **−2 %** con 40 % que mira el video, **−8 %** si lo mira el 20 % y **+5 %** recién si lo mira el 60 %. Sumando un 3 % de activos
  perdidos por la frustración (HIPÓTESIS), queda negativo en todos los casos.
- **La comparación que confunde:** «Candy Crush da 5 y está bien». Sí, pero ahí ganar no gasta vida. En Senda, ganar un juego gasta
  una y, en la lección, cada error gasta otra. Las 5 de Senda ya son más exigentes que las 5 de Candy Crush.

**¿3, 4 o 5?** **5.** 4 solo tendría sentido si la lección dejara de cobrar por error (ver §5). **¿Cambiar la recarga?** No por ahora:
dejarla configurable a distancia y probar con datos.

### 3.2 Un intersticial cada 2 derrotas en la trivia

- **En esta trivia, cada turno termina con un error** (o con el triunfo). «Cada 2 derrotas» es, en los hechos, «cada 2 turnos».
- **Práctica contra Lany:** hoy el anuncio ya puede salir en el turno de Lany cuando pasaron 4 minutos. Con turnos de ~1,2 minutos, eso
  cae **cada 3 o 4 turnos**: casi la idea del fundador, pero con reloj. Sin reloj serían ~5 anuncios en una partida de 12 minutos (uno
  cada ~2,4 min). Además:
  - queda justo en el máximo de AdMob, que es un intersticial cada dos acciones;
  - es un anuncio en plena partida, lo que AdMob pide no hacer («no sorprendas a quien juega»);
  - le pega más a quien más se equivoca: los que recién empiezan y los de 13 a 15 años.
- **Duelos con personas:** acá la idea del fundador **suma algo que hoy no existe**. Al mandar el turno («juega el otro»), la persona
  terminó su parte y se va del tablero: es el corte más natural de un juego por turnos (Preguntados lo usa). Hoy no hay ningún anuncio
  hasta que el duelo termina, días después. **Mejor así:** un anuncio al mandar cada 2 turnos, con el mismo reloj de 4 minutos y las 2
  actividades libres del día.
- **Alternativas consideradas:** al cambio de cada turno (demasiado), cada N preguntas sin importar si acertás (castiga menos, pero es
  más difícil de explicar), solo al final (deja mucha plata afuera en duelos de varios días). Elegido: **turno de Lany con reloj en la
  práctica; turno mandado, cada 2, en los duelos; siempre después del resultado, nunca antes de jugar.**
- **Que se vea venir:** el anuncio del turno de Lany, con un cartel de 1 segundo («Pausa: un anuncio mientras juega Lany»). Así deja de
  ser «inesperado» para AdMob y para Play, y la persona entiende por qué aparece.

### 3.3 En la Travesía, un intersticial cada 2 niveles

- **Hoy sale más seguido que eso:** después de cada lección, pasadas las 2 libres, si pasaron 4 minutos. Una lección dura ~4 minutos,
  así que en la práctica es casi una por lección, como Duolingo.
- «Cada 2 lecciones» **baja ~9 % el ingreso total** de anuncios (ESTIMACIÓN con el modelo: las lecciones son la mitad de las
  actividades). Es una opción válida si el fundador quiere que aprender tenga menos cortes. La recomendación es dejarlo como está,
  porque es el estándar del líder del rubro y la lección es el corte natural, y dejar el número configurable para probar.

### 3.4 El tope: 1 cada 4 minutos y 2 libres por día

- **4 minutos se queda.** Es la mitad de frecuente que lo que Google usa por defecto en juegos web (2 min) y entre 2 y 4 veces más
  prudente que lo que Facebook recomienda para juegos casuales y puzzles (60 a 120 s). Calza con «uno por lección» de Duolingo. Para
  una app de fe con adolescentes, es el punto justo. Bajarlo a 3 se prueba con una parte de la gente (§5.4), no para todos.
- **2 libres por día se quedan, pero de verdad por día** (hoy se reinician al reabrir).
- **Se suman tres reglas que cuidan la experiencia:**
  - el día de la instalación, sin intersticiales: el D1 es el número que más importa y Unity recomienda no mostrar el primer anuncio
    enseguida;
  - un video con premio reinicia el reloj;
  - tope de 12 intersticiales por día por persona: solo lo toca quien juega más de una hora, que es justo a quien más conviene cuidar
    porque es el que trae gente y el futuro Premium.

---

## 4. El modelo

### 4.1 Método

Script: `herramientas/simulacion_anuncios.py`. Modelo analítico, sin azar, por cada 1.000 activos por día. En esta sesión no había
consola para correrlo: las cifras de abajo se calcularon a mano con las mismas fórmulas. Para verificarlas hay que correr
`python3 herramientas/simulacion_anuncios.py`.

| Supuesto | Valor | Tipo |
|---|---|---|
| Tipos de persona | Casual 50 % (1,5 sesiones por día, 1,4 actividades por sesión, 0,5 turnos de duelo); regular 35 % (2; 2,2; 1,5); intensa 15 % (3; 3; 3). Promedio: 3,9 actividades y ~25 minutos por día | HIPÓTESIS |
| Actividades | 50 % lecciones (~4 min), 25 % juegos cortos (~3 min), 25 % Espadeo contra Lany (~12 min) | HIPÓTESIS / ESTIMACIÓN |
| Intersticiales por actividad elegible (k) | Hoy **1,30**: lección 0,8, juego corto 0,6, Espadeo 3 (en el turno de Lany a los ~4 y ~8 min y al final). Fundador **1,75**: lección 0,5, juego corto 1, Espadeo 5. Recomendada **1,30 × 0,92**: día de instalación sin intersticiales y el video reinicia el reloj | ESTIMACIÓN con las reglas |
| Duelos | Un anuncio al mandar cada 2 turnos (0,5 por turno elegible) en la propuesta del fundador y en la recomendada; hoy, 0 | Regla |
| Contador de libres | Hoy vuelve a cero en las sesiones que arrancan con la app cerrada (70 % de las que no son la primera del día); arreglado, por día | HIPÓTESIS (70 %) |
| Vidas | 1 por actividad en promedio. Una sesión choca si pide más de las que tiene (Poisson). En cada choque se piden 1,5 vidas: 40 % mira un video por vida, 20 % lee un capítulo y se va, 40 % se va | HIPÓTESIS |
| Videos para duplicar Talentos | 0,10, 0,25 y 0,50 por día; con «duplicar al ganar», 0,20, 0,45 y 0,80 (siempre dentro del tope de 3) | HIPÓTESIS |
| Quién ve anuncios | 93 % de los activos (sin menores de 13; al lanzar no hay planes pagos); relleno 85 % | HIPÓTESIS |
| eCPM | Latinoamérica: intersticial 0,85, video 1,00; EE. UU.: 6,0 y 7,5 (§2.3) | ESTIMACIÓN |
| Gente que se va | Elasticidad −0,10: cada 100 % más de anuncios por hora resta 10 % de activos. 3 vidas restan un 3 % aparte. El efecto entra en línea recta en 60 días | HIPÓTESIS (Pandora, audio: ~−0,07 en horas a largo plazo; un intersticial interrumpe más) |
| Valor del Premium | USD 0,105 por activo diario y por mes, cuando exista (de `docs/SUSCRIPCIONES.md`: USD 315 por mes cada 10.000 activos mensuales, con 3 activos diarios cada 10 mensuales) | ESTIMACIÓN / HIPÓTESIS |

Escenarios:
- **A, hoy:** el código tal cual.
- **A2:** hoy, con el contador por día.
- **A3:** A2 con 3 vidas, para aislar el efecto de las vidas.
- **B, fundador:** 3 vidas; anuncio cada 2 turnos perdidos (práctica y duelos) con 2 min entre anuncios; Travesía cada 2 lecciones; al
  terminar cada juego.
- **C, recomendada:** §5.

### 4.2 Resultados (elasticidad −0,10)

| Por cada 1.000 activos por día | A Hoy | A2 Contador por día | A3 Solo 3 vidas | **B Fundador** | **C Recomendada** |
|---|---|---|---|---|---|
| Intersticiales por activo por día | 2,04 | 2,83 | 2,59 | 3,84 | 2,94 |
| Videos con premio por activo por día | 0,25 | 0,25 | 0,41 | 0,41 | 0,41 |
| Intersticiales por hora de uso (promedio, con las libres) | 4,9 | 6,8 | 6,2 | 9,2 | 7,0 |
| **USD por día, Latinoamérica** | 1,57 | 2,10 | 2,06 | **2,90** | **2,30** |
| USD por día, EE. UU. | 11,16 | 14,90 | 14,69 | 20,64 | 16,39 |
| **Activos cuando se estabiliza (de 1.000)** | 1.000 | 961 | 943 | **882** | **956** |
| Anuncios en 90 días, Latinoamérica (USD) | 141 | 184 | 179 | 241 | 201 |
| Anuncios en 90 días, EE. UU. (USD) | 1.004 | 1.306 | 1.272 | 1.712 | 1.432 |
| Por mes, estable, Latinoamérica: anuncios + Premium (USD) | 152 | 161 | 157 | 169 | 166 |

Para dar escala, 10.000 activos por día en Latinoamérica dejan, con la recomendada, ~USD 690 por mes en anuncios. Con la del fundador
dejan ~USD 870, pero con ~740 personas menos por día al estabilizarse.

### 4.3 Qué variable decide (sensibilidad)

**1. Cuánta gente se va por cada anuncio de más (la elasticidad).** Es la que decide entre B y C, y no se conoce.

| Elasticidad | Anuncios en 90 días, LatAm: B / C (USD) | Activos estables: B / C |
|---|---|---|
| −0,03 (como el audio de Pandora en usuarios activos) | 252 / 205 | 944 / 987 |
| **−0,10 (base)** | **241 / 201** | **882 / 956** |
| −0,20 | 225 / 195 | 794 / 912 |
| −0,30 (lo que se espera a largo plazo si es 3 veces lo de un mes) | 210 / 189 | 706 / 868 |

- En 90 días, solo plata de anuncios, B gana salvo que la elasticidad sea peor que **−0,53**. Las pérdidas tardan y la plata entra
  enseguida.
- Con el mes ya estable, solo anuncios, C gana si la elasticidad es peor que **−0,33**.
- Con el mes estable y el Premium contado, C gana si es peor que **−0,13**: cada 10 % más de anuncios tendría que espantar a más del
  1,3 % de los activos.
- **INFERENCIA:** con la evidencia disponible, a largo plazo la elasticidad probablemente esté entre −0,1 y −0,3 para un intersticial
  que corta un juego, contra −0,07 del audio de fondo en Pandora. Eso pone a la recomendada por delante o empatada en el largo plazo,
  y a la del fundador por delante solo en el corto.

**2. Lo que paga cada anuncio** (proporcional). C en Latinoamérica:
- intersticial a 0,40 → USD 1,26 por día cada 1.000; a 1,60 → 4,04;
- video a 0,50 → 2,14; a 1,80 → 2,56;
- relleno 70 % → 1,90; 95 % → 2,57.

**3. La parte de usuarios de EE. UU.** Con 15 % de los activos en EE. UU., C deja USD 4,41 por día cada 1.000, y **EE. UU. pone el 56 %
de la plata**. Con 30 %, 6,53. Es la palanca más grande de todas, y no pide un solo anuncio más.

**4. Cuántos miran el video al quedarse sin vidas** (solo para la decisión de 3 vidas): −8 %, −2 % o +5 %, con 20 %, 40 % o 60 %
(§3.1).

**5. Para medir:** con 1.500 personas nuevas por grupo solo se detecta una diferencia de D7 de ~3,5 puntos (D7 de 15 %, 95 % de
confianza, 80 % de potencia). Para ver 1,5 puntos hacen falta ~9.000 por grupo (ESTIMACIÓN, fórmula de dos proporciones). Por eso
conviene **arrancar prudente** y subir solo cuando haya volumen para medir.

### 4.4 Lo que el modelo no ve

- El boca a boca y las iglesias: un grupo que se va porque «la app está llena de anuncios» se lleva a otros.
- La nota en la tienda: las trivias con muchos anuncios juntan reseñas negativas (§2.1).
- El riesgo de cuenta: un problema con la política de AdMob limita los anuncios de toda la app.
- Que más anuncios empujan a pagar el Premium (Pandora lo midió), un punto a favor de B que todavía no se puede contar porque al
  lanzar no hay suscripciones.

---

## 5. Recomendación: así no → mejor así

**Así no:** 3 vidas, un anuncio cada 2 derrotas sin reloj y cada 2 niveles en la Travesía. Junta tres problemas:
- traba lecciones a la mitad;
- concentra los anuncios en quien pierde;
- en la Travesía, termina mostrando **menos** anuncios donde mejor funcionan.

Gana unos pesos en 90 días y pierde gente a largo plazo.

**Mejor así:**

| Tema | Hoy | Fundador | **Mejor así** | Por qué |
|---|---|---|---|---|
| Vidas | 5, 1 cada 30 min | 3 | **5, 1 cada 30 min** | Con 3 no sube la plata (§3.1) |
| Lección sin vidas | Se corta a la mitad | Se corta más seguido | **Una lección empezada se termina siempre** (la vida que falta se descuenta de la próxima). Mejor versión, a decidir: la lección gasta 1 vida al empezar, como los juegos; los errores no gastan, y una lección perfecta devuelve la vida | Lo que Duolingo corrigió; premia aprender bien |
| Al quedarse sin vidas | Video o esperar (leer da vida) | — | Primero «Leé un capítulo: +1 vida», después el video | Leer va primero: es la misión |
| Contador de libres | Se reinicia al reabrir | — | **2 por día, guardadas en el teléfono** | +34 % de ingreso sin un anuncio más por partida |
| Día de la instalación | Con intersticiales | — | **Sin intersticiales** (videos sí) | Cuida el D1 |
| Al terminar juego o lección | Sí, con reloj de 4 min | Juegos sí; lecciones cada 2 | **Igual que hoy**, siempre **después** del resultado o del festejo, nunca antes de jugar ni al abrir | Corte natural (AdMob, Play) |
| Espadeo contra Lany | En el turno de Lany, con reloj | Cada 2 turnos perdidos | **Igual que hoy, pero con aviso** («Pausa: un anuncio mientras juega Lany»), nunca en la prueba de pieza ni en la corona | Deja de ser inesperado |
| Duelos con personas | Ninguno hasta el final | Cada 2 turnos perdidos | **Al mandar cada 2 turnos**, con el reloj | El corte más natural del juego por turnos; hoy se pierde |
| Reloj | 1 cada 4 min | 2 min | **4 min**; un video con premio lo reinicia | Prudente y comparable con Duolingo |
| Tope diario | No hay | — | **12 intersticiales por persona** | Cuida a quien más usa |
| Video con premio | +1 vida sin límite; duplicar el cofre (3 por día) | — | Igual, más **«Duplicá lo que ganaste»** al ganar un juego, dentro del mismo tope de 3 | Más videos elegidos, no impuestos |
| Denunciar anuncios | No hay | — | **«¿Viste un anuncio que no va? Avisanos»** en Ajustes y en un enlace chico al cerrar un intersticial, con el mismo canal que «¿Ves un error?» hacia Admin; además, bloquear el anuncio en el Centro de revisión de anuncios de AdMob | Apple 2.5.18 lo exige |
| Menores de 13, Premium y Max | Nunca | — | Nunca | Sin cambio |

**Qué se gana con eso** (ESTIMACIÓN, §4.2): +47 % de ingreso de anuncios por activo frente al código de hoy (+10 % frente al contador
arreglado solo). Los intersticiales pasan de 4,9 a 7,0 por hora de uso, dentro de lo que hace Duolingo y muy por debajo de una trivia
casual. Nunca se traba una lección ni se le pone un anuncio a nadie al empezar a jugar.

**Lo que mueve más plata que la cantidad de anuncios** (en este orden, ninguno pide más anuncios):
1. **Más activos y más EE. UU.:** un activo de EE. UU. deja ~7 veces más.
2. **Mejor precio por anuncio:** a los 30 días, mirar el informe por país. Si el relleno con G es bajo, probar PG para mayores de 13.
   Probar la subasta de AdMob con una o dos redes que respeten los bloqueos (en Android de Latinoamérica, AdMob no está entre las 5 redes
   que más pagan, según TopOn). Con la subasta, Duolingo subió más de 20 % su ingreso por activo (caso de AdMob, [proveedor]).
3. **El Premium «sin anuncios»** cuando esté la figura para cobrar.

La personalización de anuncios para adultos subiría el precio (la referencia de Google: hasta el doble). La decisión de no personalizar
en una app de fe es correcta: no se recomienda tocarla.

### 5.1 Qué dejar configurable desde Supabase (sin versión nueva)

Hoy solo existe el interruptor `anuncios`. Propuesta: una tabla `parametros` (clave, valor numérico) que se lee al abrir, igual que
`interruptores`, más un número de grupo por persona (al azar al instalar) para las pruebas.

| Parámetro | Valor inicial |
|---|---|
| `vidas_gratis` / `minutos_por_vida` | 5 / 30 |
| `leccion_termina_sin_vidas` | 1 |
| `anuncio_espera_min` | 4 |
| `anuncio_libres_dia` | 2 |
| `anuncio_tope_dia` | 12 |
| `anuncio_dia_instalacion` | 0 (sin intersticiales) |
| `anuncio_leccion_cada` | 1 |
| `anuncio_turno_lany` | 1 |
| `anuncio_duelo_cada_turnos` | 2 |
| `videos_talentos_dia` | 3 |
| `prueba_intensa_pct` / `prueba_intensa_espera_min` | 0 / 3 (se prende al 20 % cuando haya volumen) |

### 5.2 Qué medir desde el día uno

- **AdMob**, por país, formato y plataforma: eCPM, relleno, anuncios mostrados.
- **Eventos de la app:**
  - `anuncio_mostrado`: tipo, lugar y minutos desde el anterior;
  - `video_ofrecido` y `video_visto`: lugar y premio;
  - `sin_vidas`: qué hizo después (video, leer, esperar o irse);
  - **sesión que termina dentro de los 15 s de un intersticial**: es el mejor detector de un anuncio mal ubicado.
- **Retención:** D1, D7 y D30 por cohorte y por grupo de prueba; sesiones y actividades por activo.
- **Reseñas:** nota y parte de las reseñas de 1-2 estrellas que hablan de anuncios o vidas.

### 5.3 Reglas de corte

**Retroceder** (volver el parámetro al valor anterior desde Supabase) si pasa cualquiera de estas cosas:
- en el grupo con más anuncios, a los 14 días o más, D7 cae ≥ 1,5 puntos o D1 ≥ 2 puntos frente al otro grupo (con el volumen de §4.3);
- más del 20 % de los intersticiales de un lugar terminan la sesión: ese lugar se saca;
- más del 10 % de las reseñas de 1-2 estrellas del período hablan de anuncios o de vidas (la misma vara de `docs/ECONOMIA.md` §5);
- la nota baja de 4,5 (vara del capítulo 24).

**Avanzar** (por ejemplo, el reloj de 3 minutos para todos) solo si el ingreso de anuncios por instalación a 30 días sube 10 % o más y
D7 no cae más de 1 punto.

**3 vidas:** no se prueba hasta que la lección deje de cortarse a la mitad. Si se prueba, es con el mismo método.

### 5.4 Orden de trabajo (no hecho: el pedido fue no tocar código)

1. Guardar el contador y el reloj de `pausaAnuncio.ts` en el teléfono, por día. Es chico.
2. Agregar la denuncia de anuncios (Apple 2.5.18) y corregir `docs/TIENDAS.md`.
3. Hacer que la lección empezada se termine siempre.
4. Agregar el anuncio al mandar cada 2 turnos de duelo y el aviso del turno de Lany.
5. Hacer que el video reinicie el reloj, el día de instalación sin intersticiales y el tope de 12 por día.
6. Crear la tabla `parametros` en Supabase y la lectura en la app.
7. Agregar «Duplicá lo que ganaste» al ganar.
8. Agregar los eventos de §5.2.

**Decisiones del fundador:**
1. ¿5 vidas con lección que no se corta, en lugar de 3?
2. ¿«Una lección gasta 1 vida al empezar y los errores no» (y la perfecta la devuelve)?
3. ¿Anuncio en los duelos al mandar cada 2 turnos?
4. ¿La prueba «intensa» al 20 % cuando haya volumen?

---

## 6. Fuentes (consultadas el 19-11-2026 salvo otra fecha)

**Oficiales:**
- AdMob: [intersticiales no permitidos](https://support.google.com/admob/answer/6201362?hl=en), [tope de frecuencia](https://support.google.com/admob/answer/7311435/), [clasificación máxima del contenido](https://support.google.com/admob/answer/7562142?hl=en), [política del video con premio](https://support.google.com/admob/answer/7313578).
- Google Play: [mejores experiencias con anuncios](https://support.google.com/googleplay/android-developer/answer/12271244?hl=en), [política de anuncios](https://support.google.com/googleplay/android-developer/answer/9857753?hl=en).
- Apple: [guías de revisión de la App Store, 2.5.18 y 1.3](https://developer.apple.com/app-store/review/guidelines/).
- Plataformas de juegos: [Google Ad Placement, frecuencia](https://developers.google.com/ad-placement/docs/ad-rate) · [Facebook Instant Games, intersticiales](https://developers.facebook.com/documentation/games/monetize/in-app-ads/interstitial-ads).
- Duolingo: [blog, energía (03-07-2025)](https://blog.duolingo.com/duolingo-energy/) · [10-K del año 2025 (SEC)](https://www.sec.gov/Archives/edgar/data/1562088/000162828026012494/duol-20251231.htm).
- Otras apps: [Candy Crush, wiki de vidas](https://candycrush.fandom.com/wiki/Lives) (King «484 lives», 403) · [Preguntados, App Store](https://apps.apple.com/app/preguntados/id651510680) · [Bible App for Kids, App Store](https://apps.apple.com/dk/app/bible-app-for-kids/id668692393) · [Brain Out, App Store](https://apps.apple.com/in/app/brain-out/id1477841973) · [Kahoot, planes](https://kahoot.com/home/plans/).
- [Google, cookies e ingresos (27-08-2019)](https://services.google.com/fh/files/misc/disabling_third-party_cookies_publisher_revenue.pdf).

**Académicas y estudios:**
- [Goli, Huang, Reiley y Riabov, Pandora (arXiv, 07-12-2024)](https://arxiv.org/abs/2412.05516v1) · [Goli, Reiley y Zhang, *Marketing Science* 44(2), 2025](https://econpapers.repec.org/RePEc:inm:ormksc:v:44:y:2025:i:2:p:327-352) · [Nielsen Norman Group sobre Pandora (06-05-2018)](https://www.nngroup.com/articles/annoying-ads-cost-business/).
- [Deloitte con Google AdMob (2025)](https://www.deloitte.com/us/en/industries/tmt/articles/improve-mobile-game-advertising.html).

**Proveedores (con interés en el resultado):**
- eCPM: [TopOn, 1.er semestre 2025](https://mores.toponad.com/reports/TopOn%20Global%20Mobile%20Games%20Monetization%20Report%20_%202025%20H1.pdf) · [Appodeal, 4.º trimestre 2024](https://appodeal.com/wp-content/uploads/2025/03/Quarterly_Mobile_eCPM_Report_-_Q4_2024.pdf).
- Casos y guías: [Unity/ironSource, ZiMAD (10-12-2019)](https://unity.com/en/resources/zimad-dig-out) · [Unity/ironSource, intersticiales (07-03-2021)](https://unity.com/blog/best-practices-for-maximizing-revenue-from-interstitial-ads-in-your-app) · [Appodeal, casos de retención](https://appodeal.com/success-stories/20-arpu-retention-strategies-3-successful-games/) · [AdMob, guía del video con premio](https://admob.google.co.in/home/resources/rewarded-ads-playbook/) · [caso AdMob-Duolingo](https://admob.google.co.in/home/resources/duolingo-partners-with-admob-to-optimize-mediation-strategy-and-increase-ads-revenue-by-seventy-percent/).
- Video con premio: [Applixir (2026)](https://www.applixir.com/blog/rewarded-video-quality-benchmarks-2026-completion-rates-viewability-user-engagement/) · [Gamelight (2025)](https://www.gamelight.io/post/rewarded-ua-benchmarks-ctr-retention-roas-in-2025).

**Prensa, terceros y usuarios:**
- Precios de los anuncios: [playio, eCPM 2026](https://blog.playio.co/mobile-game-ecpm-benchmarks-2026) · [playio, intersticiales](https://blog.playio.co/interstitial-ads-mobile-games) · [Moonetix, Appodeal Benchmarks (consultado por el autor el 20-10-2026)](https://moonetix.com/academy/monetization/highest-cpm-countries) · [Dataconomy (25-11-2025)](https://dataconomy.com/2025/11/25/how-rewarded-advertising-became-a-core-growth-engine-for-mobile-games) · [StatCounter, Argentina](https://gs.statcounter.com/os-market-share/mobile/argentina).
- Reseñas: [kimola, Trivia Crack (jun-2025)](https://kimola.com/reports/essential-trivia-crack-user-feedback-analysis-report-app-store-tr-144560) · [justuseapp, trivia bíblica](https://justuseapp.com/en/app/1590338120/bible-trivia-bible-quiz-games/reviews) · [learnofchrist](https://learnofchrist.com/resources/daily-bible-trivia).
- Otras apps: [Wikipedia, Trivia Crack](https://en.wikipedia.org/wiki/Trivia_Crack) · [Wikipedia, QuizUp](https://en.wikipedia.org/wiki/QuizUp) · [Christian Today, YouVersion (nov-2025)](https://christiantoday.com/news/how-youversion-reached-its-one-billion-download-milestone) · [faith.tools](https://faith.tools/app/bible-app-for-kids) · [Appfigures, Bible Chat (abr-2025)](https://appfigures.com/resources/insights/20250418/amp?f=5) · [AppGoblin](https://appgoblin.info/apps/com.daily.bible.trivia.android) · [TechCrunch, Wordle (07-05-2024)](https://techcrunch.com/2024/05/07/nyt-games-launches-a-wordle-archive-with-access-to-more-than-1000-past-puzzles/).

**Internas:**
- Benchmark de Talentos del 18-11-2026: `conocimiento/2026-11-18-senda-talentos-benchmark.md` (Duolingo, eMarketer, Mimo, trivias bíblicas).
- De la app: `docs/ANUNCIOS.md`, `docs/SUSCRIPCIONES.md`, `docs/ECONOMIA.md`, `docs/TIENDAS.md`, `src/util/pausaAnuncio.ts`, `src/util/vida.ts`, `src/util/anuncios.ts`, `src/util/interruptores.ts`, `src/tema.ts`, `src/estado/usuario.ts`, `src/pantallas/Jugar.tsx`, `src/pantallas/Leccion.tsx`.

**Lo que no se pudo leer:** los centros de ayuda de Etermax y de King (403; se usó lo que mostró el buscador), eMarketer (403) y las cifras
por país de Argentina y Colombia (no publicadas). Los eCPM de TopOn se leyeron de los gráficos.
