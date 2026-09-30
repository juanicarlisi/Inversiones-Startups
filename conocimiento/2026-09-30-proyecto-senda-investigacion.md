# Bitácora — Investigación para el proyecto completo de Senda (30-09-2026)

> Complementa `2026-09-28-apps-cristianas-y-mecanicas.md` y `2026-09-28-difusion-costo-cero.md`. Datos vía buscador (el entorno
> bloquea la lectura directa de la mayoría de los sitios). Todo dato que decida plata se re-verifica en la fuente antes de usarlo.
> Etiquetas: HECHO (con fuente y fecha) / ESTIMACIÓN (con método) / INFERENCIA.

## 1. Biblias con licencia libre (para que la Biblia sea gratis y legal en varios idiomas)

| Texto | Idioma | Licencia | Etiqueta | Fuente |
|---|---|---|---|---|
| Reina-Valera 1909 | Español | Dominio público | HECHO | ebible.org, wikisource |
| **Biblica® Open Nueva Biblia Viva 2008** | Español (moderna) | **CC BY-SA 4.0** (atribuir a Biblica y open.bible; derivados bajo la misma licencia) | HECHO | ebible.org/spaonbv/copyright.htm |
| Versión Biblia Libre (VBL) | Español (NT desde el griego, AT) | CC BY-SA 4.0 | HECHO | ebible.org/spavbl/copyright.htm |
| Biblia Libre para el Mundo | Español | CC0 (según bitácora del 28-09) | HECHO | ebible.org |
| La Biblia en Español Sencillo | Español (simple) | CC BY 4.0 | HECHO | bitácora 28-09 |
| **Biblica® Open Nova Bíblia Viva 2007** | Portugués (Brasil) | CC BY-SA 4.0 | HECHO | ebible.org/poronbv/copyright.htm |
| Bíblia Livre (Almeida 1819 actualizada) | Portugués | CC BY / CC BY-SA (3.0/4.0 BR) | HECHO | ebible.org/porbr2018 |
| Bíblia Livre para Todos | Portugués | CC BY-SA 4.0 | HECHO | ebible.org/porblt |
| **Berean Standard Bible (BSB)** | Inglés moderno | **Dominio público desde el 30-04-2023** (todo uso, incluso comercial) | HECHO | berean.bible/terms.htm |
| KJV, ASV, WEB | Inglés | Dominio público | HECHO | ebible.org |
| Free Use Bible API (HelloAO) | 1.000+ traducciones en 700+ idiomas | Sin clave, sin límites, sin restricciones (incluso comercial) sobre lo que publica | HECHO | github.com/HelloAOLab/bible-api, learnofchrist.com |

**Conclusión (INFERENCIA):** Senda puede tener desde el día 1 una Biblia moderna libre en español (Nueva Biblia Viva, CC BY-SA)
además de la RVR1909, y en 2028 lo mismo en portugués (Nova Bíblia Viva) e inglés (BSB). La RVR1960 sigue siendo con licencia
(API.Bible, desde ~USD 10/mes por traducción, ver bitácora 28-09).

## 2. Comentarios, notas y datos de estudio libres (para el botón «+»)

| Recurso | Licencia | Idioma | Fuente |
|---|---|---|---|
| Matthew Henry, Jamieson-Fausset-Brown, Calvino, John Gill, Adam Clarke, Keil-Delitzsch | Dominio público (CC0 en la Free Use Bible API) | Inglés | learnofchrist.com (reseña de la API) |
| **Tyndale Open Study Notes** (2022) | **CC BY-SA 4.0** | Inglés | freely-given.org/OBD/TOSN |
| Tyndale Open Bible Dictionary | Abierto (Open Bible Data) | Inglés | freely-given.org/OBD |
| Referencias cruzadas OpenBible.info (base: Treasury of Scripture Knowledge, dominio público) | CC BY 4.0 (120.858 entradas; TSK ampliado a 340.000+ conexiones) | Neutro (referencias) | huggingface NuBerea/openbible, viz.bible |
| Geocodificación de lugares bíblicos (OpenBible.info) | CC BY 4.0 | Neutro | github.com/openbibleinfo/Bible-Geocoding-Data |
| Comentarios de Matthew Henry y JFB **en español** | **Con derechos** (ediciones de CLIE, Unilit, Casa Bautista) | Español | editorialunilit.com, logos.com |

**Conclusión (INFERENCIA):** no hay comentarios clásicos libres en español. La salida es traducir al español y al portugués los de
dominio público y las notas de Tyndale (CC BY-SA → la traducción se publica también CC BY-SA), con IA y revisión humana. Sería la
**primera colección libre de notas de estudio en español** dentro de una app.

## 3. Audio

| Opción | Condición | Etiqueta | Fuente |
|---|---|---|---|
| Bible Brain (Faith Comes By Hearing) | Gratis, con clave aprobada, pero **la licencia prohíbe cobrar a los usuarios** de la app | HECHO | learnofchrist.com, faithcomesbyhearing.com/bible-brain |
| Voz del sistema (TTS del celular) | Gratis, sin conexión, muchos idiomas; calidad variable | HECHO | — |
| Google Cloud TTS | Standard/WaveNet USD 4 por millón de caracteres; Neural2 USD 16; Chirp 3 HD USD 30; Studio USD 160 (hubo un cambio de precios en abril de 2026: re-verificar) | HECHO (2026) | costbench.com, diyai.io |
| Azure neural TTS | ~USD 15 por millón de caracteres (HD con recargo) | HECHO | azure.microsoft.com |
| ElevenLabs | Flash v2.5 USD 0,05 cada 1.000 caracteres (USD 50/millón); Multilingual USD 0,10; licencia comercial desde el plan de USD 6/mes | HECHO (jul-2026) | apiframe.ai, llmreference |

ESTIMACIÓN: una Biblia completa en español tiene ~4,3 millones de caracteres (≈ 80 horas de audio). Narrarla cuesta ≈ USD 17 (WaveNet),
≈ USD 70 (Neural2), ≈ USD 130 (Chirp 3 HD) o ≈ USD 215–430 (ElevenLabs). A 32 kbps ocupa ~1,2 GB por versión.

## 4. Mecánicas de referencia (nuevo)

| De | Dato | Etiqueta | Fuente |
|---|---|---|---|
| Duolingo "Energía" (2025) | Reemplazó los corazones en parte de los usuarios: 25 unidades, cada ejercicio gasta, aciertos seguidos devuelven; generó rechazo (petición en change.org) | HECHO | blog.duolingo.com, androidauthority.com |
| Duolingo + Rive | Personajes animados con Rive: máquina de estados, 12–15 formas de boca (visemas) para sincronizar labios en 40+ idiomas sin videos pre-renderizados | HECHO | blog.duolingo.com/world-character-visemes, rive.app/blog |
| Sonidos de Duolingo | Campanita ascendente al acertar (micro-recompensa); tono descendente al fallar, "lo justo para querer la próxima, sin generar ansiedad" | HECHO (análisis de producto) | out-of-scope-product.beehiiv.com, uxplanet.org |
| Preguntados | Ruleta de 7 casillas: 6 categorías + una especial (jugar por un personaje o duelo); 4 comodines (eliminar respuestas, segunda oportunidad, más tiempo, etc.); 90.000+ preguntas en inglés y español; cualquier usuario propone preguntas | HECHO | laps4.com, wwwhatsnew.com (2013) |
| Trivia Crack / Preguntados | 600 M+ descargas de la franquicia; 150 M+ usuarios activos por año; Etermax superó 400 M de descargas de su cartera (nov-2024) | HECHO | pocketgamer.biz, thinkwithgoogle.com |
| "Sword drill" (espadeo) | Competencia bautista: "¡Atención!", "¡Desenvainen!", se dice una cita y gana quien la encuentra primero; incluye recitar de memoria; "espada" por Efesios 6:17 | HECHO | gwinnettforum.com, louisianabaptists.org (reglamento 2026–2027) |
| Rachas de YouVersion | Días seguidos con la Palabra (leer, escuchar, un día de plan o un video); mini-celebraciones en hitos; aviso si estás por perderla | HECHO | openblog.life.church |
| Kahoot | Gratis hasta 10 jugadores; Kahoot 360: USD 19 (50 jugadores) a 79/mes; 50% de descuento a ONG (≈ USD 15 por anfitrión) | HECHO | triviamaker.com, wooclap.com |
| Bible Chat | Semanal €2,99–6,99, mensual €9,99, anual €29,99–39,99 | HECHO | apppricinglab.com |
| Daily Bible Trivia | #33–79 en recaudación de trivia de iPhone (mar-2026); compras USD 2,99–6,99 | HECHO | apppricinglab.com, apptopia |

## 5. Marco teórico: uso del celular

| Dato | Etiqueta | Fuente |
|---|---|---|
| Argentina: 8 h 44 min por día conectados; 4 h 40 min en el celular (53,5%); 90,6% usa internet; 96,8% entra desde el celular; 32,9 M de identidades en redes | HECHO (fin de 2025) | DataReportal Digital 2026 Argentina |
| Mundo: 3,6 h por día en apps; 5,3 billones de horas en 2025; redes sociales ~2,5 billones de horas (más de 90 min por día por usuario), muy por encima del resto | HECHO | Sensor Tower, State of Mobile 2026 |
| EE.UU.: casi la mitad de los adolescentes (13–17) está conectada "casi todo el tiempo" (24% hace una década); 73% usa YouTube a diario | HECHO (encuesta sep–oct 2024) | Pew Research Center, dic-2024 |
| Estadounidenses: el celular se revisa 186 veces por día (205 en 2025) | HECHO | Reviews.org 2025–2026 |
| "Brain rot" palabra del año de Oxford 2024 (+230% de uso 2023→2024): deterioro mental atribuido al consumo excesivo de contenido trivial | HECHO | corp.oup.com |
| Haidt ("La generación ansiosa", 2024): desde ~2012 se duplicaron los episodios depresivos graves en adolescentes; autolesiones en 10–14 años +188% (chicas) en los 2010s; causa propuesta: celular + menos juego libre | HECHO (tesis con debate académico) | theconversation.com, shortform |
| Reino Unido, "Quiet Revival" (Bible Society, 2025): asistencia mensual a la iglesia 8%→12% (2018–2024); jóvenes de 18–24 del 4% al 16% (varones 4%→21%). Cuestionado por otros encuestadores | HECHO (con controversia) | religionmediacentre.org.uk, baptistnews.com |
| EE.UU. (State of the Bible): la generación Z es la que más dice haber aumentado su lectura (21% más vs 9% menos en 2024); el repunte de 2025 retrocedió en 2026 | HECHO | baptistpress.com, news.americanbible.org |

## 6. Tiendas, precios y costos de plataforma

| Dato | Etiqueta | Fuente |
|---|---|---|
| Google Play: suscripciones al 15% (en 2026: 10% de servicio + 5% de facturación en EE.UU., Reino Unido y EEE); precios menores a USD 1 habilitados en muchos países desde 2021 (el mínimo de Argentina se verifica en la consola) | HECHO | support.google.com, pricepush.app, android-developers.googleblog.com |
| Apple: precios desde USD 0,29; Programa de pequeñas empresas: 15% desde el primer año | HECHO | revenuecat.com, 9to5mac |
| Apple Developer Program: USD 99 por año (persona o empresa); empresa requiere D-U-N-S (gratis) | HECHO | adalo.com, choicely.com |
| Expo EAS: gratis (builds limitados, actualizaciones a 1.000 usuarios); Starter USD 19/mes; Production USD 99/mes | HECHO | expo.dev/pricing |
| Supabase: Pro USD 25/mes (100.000 usuarios activos, 8 GB de base, 100 GB de archivos); apps chicas terminan en USD 35–75/mes | HECHO | makerkit.dev, jetadmin.io |
| RevenueCat: gratis hasta USD 2.500 de ingreso mensual; después 1% del total | HECHO | costbench.com |
| Rive: plan gratis (3 archivos) y Cadet USD 9/mes (anual); los runtimes son gratis y de código abierto (MIT), sin regalías | HECHO | rive.app/docs/account-admin/pricing |
| AdMob, video recompensado en Latinoamérica: eCPM ~USD 2 en Android (2021–22); es el formato que más paga | HECHO (dato viejo; re-verificar) | appodeal.com |
| Costo por instalación en Latinoamérica: USD 0,3–2 (Android más barato; iOS 2–5 veces más) | HECHO (agregadores 2026) | mapendo.co, thesocialoutline.com |

## 7. IA (precios por millón de tokens, caché del 25-09-2026)

| Modelo | ID | Entrada | Salida |
|---|---|---|---|
| Claude Opus 5.5 | `claude-opus-5-5` | USD 4 | USD 20 (lectura de caché USD 0,20) |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | USD 2 | USD 10 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | USD 1 | USD 5 |

La API por lotes cuesta 50% menos; el caché del prompt de sistema abarata ~90% la parte repetida. ESTIMACIÓN por respuesta del
compañero de estudio (3.000 tokens de sistema en caché + 2.000 de pasajes + 600 de salida): Opus 5.5 ≈ USD 0,02; Sonnet 5.5 ≈ 0,011;
Haiku 4.5 ≈ 0,005. Generar y verificar una pregunta de trivia por lotes con Opus 5.5 ≈ USD 0,012 → 3.000 preguntas ≈ USD 36.

## 8. Legal y menores

| Dato | Etiqueta | Fuente |
|---|---|---|
| Google Play: apps no diseñadas para menores de 13 pueden usar SDK de anuncios comunes solo con mayores de 13; si el público incluye chicos, pantalla de edad neutral y anuncios certificados para ellos | HECHO | support.google.com (Families) |
| Apple: nuevas clasificaciones 4+, 9+, 13+, 16+, 18+ y API "Declared Age Range" (iOS 26, sep-2025) que devuelve la franja de edad sin la fecha de nacimiento | HECHO | techradar, ppc.land |
| Argentina: la Ley 25.326 no distingue datos de menores; hay proyectos para fijar el consentimiento en 16 años | HECHO | abogados.com.ar, iprofesional (jul-2026) |
| Brasil: **ECA Digital (Ley 15.211/2025) vigente desde el 17-03-2026**: verificación de edad, control parental y deberes de protección para apps con probable acceso de chicos, aunque la empresa esté afuera | HECHO | machadomeyer.com.br, mattosfilho.com.br |
| Argentina: la Ley 22.802 fue reemplazada por el DNU 274/2019 (Lealtad Comercial) y la Res. SCI 241/2020 regula promociones con premios: los sorteos deben ser sin obligación de compra y con bases publicadas | HECHO | abogados.com.ar, marval.com |
| BibleProject: contenido gratis, pero no se puede alojar en la app, ponerlo detrás de un muro de pago ni lucrar directa o indirectamente; se enlaza o se inserta desde su sitio o YouTube con crédito | HECHO | help.bibleproject.com |

## 9. Otros contenidos libres

- LibriVox: casi 800 audiolibros en español de dominio público (voluntarios).
- Himnos: Juan B. Cabrera (1837–1916) y otros traductores de himnos del siglo XIX: letras en dominio público (hymnary.org).
- Sermones de Spurgeon: el original inglés es de dominio público; las traducciones al español suelen tener derechos (CLIE).

Fuentes: ebible.org (spaonbv, spavbl, poronbv, porbr2018, porblt), berean.bible/terms.htm, github.com/HelloAOLab/bible-api,
learnofchrist.com/resources/free-use-bible-api y /bible-brain-api, freely-given.org/OBD, github.com/openbibleinfo, huggingface.co,
faithcomesbyhearing.com/bible-brain, costbench.com, diyai.io, azure.microsoft.com, apiframe.ai, blog.duolingo.com,
rive.app/blog, uxplanet.org, laps4.com, pocketgamer.biz, gwinnettforum.com, louisianabaptists.org, openblog.life.church,
triviamaker.com, wooclap.com, apppricinglab.com, datareportal.com/reports/digital-2026-argentina, sensortower.com/blog/state-of-mobile-2026,
pewresearch.org (vía AP, dic-2024), reviews.org (vía Stacker), corp.oup.com, theconversation.com, religionmediacentre.org.uk,
baptistpress.com, support.google.com, pricepush.app, revenuecat.com, expo.dev, makerkit.dev, rive.app/docs, appodeal.com,
mapendo.co, machadomeyer.com.br, abogados.com.ar, help.bibleproject.com, librivox.org, hymnary.org.
