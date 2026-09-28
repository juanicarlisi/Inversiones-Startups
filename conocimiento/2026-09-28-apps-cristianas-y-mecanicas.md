# Bitácora — Apps cristianas y mecánicas para copiar (28-09-2026)

> Investigación para la suite cristiana (A1), foco protestante. Datos vía buscador (el entorno bloquea la lectura directa de la
> mayoría de los sitios). Todo dato que decida plata se re-verifica en la fuente. Etiquetas: HECHO / ESTIMACIÓN / INFERENCIA.

## 1. El mercado

| Dato | Etiqueta | Fuente |
|---|---|---|
| YouVersion superó 1.000 M de instalaciones el 28-10-2025; en 2025 +12% descargas y +18% uso diario; 1.000 M de aperturas cada 39 días; los 10 días de más uso de su historia fueron en 2026 (Pascua 2026: 21,6 M de personas) | HECHO | youversion.com (nov-2025), mnnonline 2026, appfigures |
| YouVersion es sin fines de lucro: sin publicidad ni suscripción; lo financia Life.Church con donaciones | HECHO | appfigures, Premier Christianity |
| Bible Chat (IA): 25 M de descargas; ~USD 900 mil de ingreso en marzo-2026; 1,5 M de descargas en marzo-2025; >95% del ingreso viene de EE.UU.; crece con SEO (contenido que lleva de Google a la app) | HECHO | appfigures (abr-2025), learnofchrist 2026 |
| Hallow (católica): ~USD 40 M netos en 2025; ~280 mil descargas por mes; USD 157 M levantados; pico de USD 9,7 M en abril-2025 por su desafío de Cuaresma "Pray40" (casi 2 M de participantes en 2025; llegó al #2 del App Store) | HECHO | appfigures, Contrary Research, hallow.com |
| Glorify: 5 M+ descargas, USD 84,6 M levantados; USD 6,99/mes o 83,88/año. Pray.com USD 59,99–99/año. Abide USD 39,99/año | HECHO | TechCrunch, actssocial 2026 |
| Apps tipo "Duolingo de la Biblia" ya existen en inglés: Ascend (lecciones < 10 min, rachas, insignias, ranking comunitario, mascota fénix), Manna (niveles con IA, mentor IA, mascota que se debilita si no leés), Bible Way (caminos por libro, XP). En portugués, "Logos – O jogo da Bíblia" | HECHO | faith.tools, Product Hunt, App Store |
| En español abundan trivias y sopas de letras bíblicas sueltas (12.000 preguntas, 66 categorías por libro), pero **no encontramos una app en español que junte niveles tipo Duolingo + trivia social + lectura + comunidad de iglesia** | INFERENCIA (búsqueda 28-09-2026) | Google Play / App Store |
| "Bible Trivia – Word Quiz Game": 8,5 M de descargas, 130 mil en 30 días, #10 en trivia | HECHO | AppBrain 2026 |
| Apps de "imágenes cristianas / buenos días con versículos" en español: decenas en Google Play (compartir por WhatsApp, fondos de pantalla) | HECHO | Google Play |
| Evangélicos: Argentina 17,4% (UBA 2026; Latinobarómetro 2024 da 8,8%); Brasil 26,9% = 47,4 M (Censo 2022, publicado jun-2025); Latinoamérica 19% (Latinobarómetro 2024); Guatemala 40%, Honduras 44,6% | HECHO | UBA, IBGE, Latinobarómetro |
| Hispanos en EE.UU.: ~21% protestantes (2022); 12% de los evangélicos de EE.UU. son hispanos | HECHO | Pew 2023-24 |
| Argentina: > 25.000 iglesias evangélicas que reúnen ~6 M de personas (IGJ); Convención Bautista: 1.216 iglesias | HECHO | IGJ, censo bautista 2024 |
| Mercado de apps de bienestar espiritual: USD 2,8 mil M en 2026, +14,6% anual | ESTIMACIÓN de consultora | Grand View Research |

## 2. Textos bíblicos: qué se puede usar y cómo (clave para "¿versiones bíblicas?")

| Opción | Condiciones | Uso en la suite |
|---|---|---|
| **Reina-Valera 1909** | Dominio público | Texto completo dentro de la app, con audio por voz sintética, sin pagar |
| **Biblia Libre para el Mundo** | CC0 (dominio público) | Segunda versión moderna gratis |
| **Versión Biblia Libre** | CC BY-SA 4.0 (atribución y compartir igual) | Opcional (la licencia obliga a compartir las modificaciones del texto) |
| **La Biblia en Español Sencillo** | CC BY 4.0 (atribución a AudioBiblia.org / Irma Flores) | Versión simple para chicos y nuevos creyentes |
| **Reina-Valera 1960** (la más usada por evangélicos) | Marca y derechos de Sociedades Bíblicas Unidas; uso electrónico con licencia y aviso de derechos | Vía API.Bible con licencia comercial (desde ~USD 10/mes por traducción según el titular) o enlace a Bible.com |
| **YouVersion Platform** (mar-2026): lector embebido gratis con 1.487 Biblias (NVI, RVR1960…) y SDK para Kotlin/React Native | Solo apps **no comerciales**: sin publicidad, suscripción ni muros de pago; si no, te quitan el acceso | **No sirve** para una app con premium; sí para enlazar ("abrir este pasaje en tu Biblia") |
| **API.Bible** (Sociedad Bíblica Americana) | Gratis solo no comercial (5.000 llamadas/mes); Pro desde USD 29/mes; traducciones con derechos desde USD 10/mes cada una; la NVI no se licencia para uso comercial | Camino para sumar RVR1960 cuando haya ingresos |
| **Citas en preguntas** | Ley 11.723 art. 10: con fines didácticos se pueden incluir hasta 1.000 palabras de una obra, solo lo indispensable y citando | Las preguntas citan referencia y fragmentos cortos; la lectura completa usa las versiones libres |

**Conclusión:** la suite arranca con RVR1909 + Biblia Libre para el Mundo + Español Sencillo (gratis y legales, con audio por voz
sintética) y suma RVR1960 por licencia cuando el premium pague la licencia. Para las demás versiones, botón "abrir en tu Biblia".

## 3. Mecánicas que funcionan (qué copiar y de dónde)

| De | Mecánica | Dato | Cómo la usamos |
|---|---|---|---|
| Duolingo | Racha diaria, XP, camino de niveles, ligas semanales, notificaciones con mascota | 58,7 M de usuarios diarios y 12,7 M de pagos (2T-2026, +23% y +17%); los usuarios con racha de 7 días retienen 2,4× más; las ligas subieron 17% el tiempo de estudio y triplicaron a los muy activos | "Camino" por temas (historia, geografía, personajes, profetas, parábolas), racha, ligas semanales por iglesia |
| Preguntados (Etermax, Buenos Aires) | Duelo por turnos con amigos, ruleta de categorías, "fábrica de preguntas" que escriben los usuarios | Lanzado el 26-10-2013; 500 mil descargas por día en su pico; 500 M+ en 180 países; se hizo en ~5 meses | Duelos bíblicos por turnos y preguntas enviadas por la comunidad (con revisión) |
| Gran DT / fantasy | Ligas privadas entre amigos, fechas semanales, ranking | Gran DT: 3 M de jugadores desde 1995 (Clarín) | **Liga de iglesias**: cada iglesia es un equipo; la fecha es semanal; tabla nacional y ligas privadas por ciudad o denominación |
| Hallow | Desafío de temporada con fecha fija | Pray40 casi 2 M de participantes y #2 del App Store | Desafíos protestantes con fecha: 21 días de ayuno y oración en enero (Ayuno de Daniel, muy extendido en iglesias evangélicas), Semana Santa, "40 días" |
| Kahoot | Juego en vivo proyectado en pantalla; los jugadores entran con un código | Las iglesias lo usan para noches de trivia, pero el plan gratis admite solo **10 jugadores** por partida | **Modo proyector gratis para grupos de jóvenes** (hasta 100 jugadores, sin instalar: entran por el navegador con QR) → cada noche de trivia es una ola de descargas |
| HQ Trivia | Trivia en vivo a hora fija con premio y vidas extra por referido | 2,4 M de jugadores simultáneos en su pico; murió por repetitivo y problemas internos (2017–2020) | Trivia en vivo semanal ("la final del viernes") con vidas extra por invitar; premio simbólico (insignia, mención) |
| Wordle | Un desafío por día, resultado compartible sin spoilers | 4.800 M de partidas en 2023 | "Versículo escondido" diario compartible por WhatsApp (R2 dentro de la suite) |
| YouVersion | Planes de lectura con amigos, versículo del día, imágenes con versículos, QR para compartir, etiquetar amigos en planes (jun-2026) | 1.000 M de instalaciones | Plan de lectura con tu grupo; imágenes para WhatsApp; QR en el culto |
| Bible Chat | Asistente IA; crece con SEO | USD 900 mil/mes | Compañero de estudio con IA **con límites doctrinales**: siempre cita pasajes, muestra fuentes y no reemplaza al pastor |
| Subsplash / Church Center | Agenda de eventos, grupos pequeños, muro de oración | Plataformas pagas por iglesias | Agenda y muro de oración gratis dentro de la suite (las iglesias chicas no pagan Subsplash) |
| Promiedos | Fixture, resultados, tabla y comentarios de usuarios | 1 M+ instalaciones | Fixture de la liga de iglesias, tabla y comentarios moderados |

## 4. Riesgos específicos

- **IA y doctrina:** estudios de 2026 muestran que los chatbots bíblicos citan mal pasajes y arrastran sesgos teológicos; los pastores
  protestantes son los más desconfiados (Religion Unplugged, ago-2026; Bible Society UK, ene-2026). → El compañero IA responde
  solo con pasajes citados y verificables, declara su enfoque, no opina sobre temas disputados y deriva al pastor.
- **Privacidad:** 83% de los líderes de iglesia pone la privacidad de datos como primera preocupación con la IA (Barna 2026). →
  Pedidos de oración privados por defecto y datos mínimos.
- **Comunidades y chats:** moderación obligatoria (reportes, bloqueo, filtros; menores de edad). Empezar con comunidad por iglesia
  (cerrada, con moderador de esa iglesia), no un foro abierto.
- **Derechos de textos:** ver sección 2.

## 5. Precios de referencia para una suscripción "muy barata"

- Spotify Premium individual: ARS 4.499/mes (2026) + impuestos; estudiantes ARS 2.299. YouTube Premium: ARS 3.399.
- Dólar oficial ~ARS 1.535–1.545 (23/25-09-2026) → Spotify ≈ USD 2,9 antes de impuestos.
- Apps cristianas en EE.UU.: USD 40–100 por año (Abide, Pray.com, Glorify).
- **Propuesta:** en Argentina ~ARS 1.500–2.000/mes (≈ USD 1–1,3, menos que medio Spotify) o ARS 12.000/año; en EE.UU. USD 2,99/mes
  o 19,99/año; plan "iglesia" para destacar eventos y armar ligas privadas.

Fuentes: youversion.com/news; blog.youversion.com (jun-2026); appfigures.com/resources/insights (abr-2025 y Hallow); research.contrary.com/company/hallow;
hallow.com/pray40; faith.tools; producthunt.com/products/manna; appbrain.com; sba.org.ar; ebible.org; api.bible y docs.api.bible;
platform.youversion.com/terms y dev.to (YouVersion Platform); argentina.gob.ar (Ley 11.723); investors.duolingo.com (2T-2026);
lennysnewsletter.com (Duolingo); es.wikipedia.org (Cavazzani, Preguntados); en.wikipedia.org (Gran DT, HQ Trivia, Bible quiz);
support.kahoot.com; agenciabrasil.ebc.com.br (Censo 2022); Latinobarómetro 2024; pewresearch.org; religionunplugged.com;
biblesociety.org.uk; eldestapeweb.com (Spotify); iprofesional.com (YouTube Premium); lanacion.com.ar (dólar).

## 6. El ecosistema completo (más allá de trivias): qué más existe y qué tomamos

> El fundador aclaró (28-09-2026) que Duolingo, Gran DT y los demás son ejemplos: hay que barrer todo el universo. Esta tabla recorre
> categorías enteras.

| Categoría | Qué existe (dato) | Qué tomamos para la suite |
|---|---|---|
| Sermón → contenido | **Pulpit AI** (de Subsplash, desde USD 49/mes, en inglés): sube el sermón y genera 20+ piezas (devocionales diarios, guía para grupos pequeños, clips, resumen, email) | **"Del sermón a la semana" en español**: el pastor sube el audio del domingo y la app arma la trivia del sermón, 5 devocionales y preguntas para células. Hace que el pastor recomiende la app (distribución) y es la base del plan para iglesias |
| Memorizar versículos | **Remember Me** (ONG suiza, 2 M+ descargas, gratis, repetición espaciada, 48 idiomas); The Bible Memory App (millones) | Repetición espaciada dentro del camino de niveles ("versículos para guardar en el corazón") |
| Juegos de grupo | Varias apps de "Heads Up bíblico" (celular en la frente) en inglés: Selah, Bible Charades | Modo "adiviná el personaje" para campamentos y reuniones, en español, gratis y offline |
| Juego en vivo en pantalla | Kahoot (gratis hasta 10 jugadores) | Modo proyector gratis hasta 100 jugadores |
| Chicos | **Bible App for Kids** (YouVersion + OneHope): 41 historias animadas, 70+ idiomas, gratis, el más descargado del mundo | No competir en animación: sumar un "modo familia" con preguntas por edad y el progreso de los chicos visible para los padres |
| Audio | Dwell (20+ narradores, 15 versiones), Bible.is (Faith Comes By Hearing), Bible Gateway Audio (NVI en español gratis) | Audio de la RVR1909 con voz sintética de calidad + **biblioteca de clásicos cristianos de dominio público** narrados (El progreso del peregrino, sermones de Spurgeon, etc.) |
| Oración y meditación | Hallow (católica), Abide, Glorify, Pray.com (USD 40–100/año) | Muro de oración privado por iglesia; oración guiada corta con música instrumental propia (sinergia con el sello de música) |
| Planes de lectura sociales | YouVersion: 3 M de personas se suscribieron a planes de 1 año el **1 de enero de 2025**; récord de 19 M de aperturas un domingo de noviembre; "Desafío de 30 días" con 2,6 M | **Lanzar antes de enero**: la ola de propósitos de Año Nuevo y el Ayuno de Daniel (21 días en enero) son la mejor ventana del año |
| Resumen del año compartible | YouVersion publica el "Versículo del año" (Isaías 41:10 en 2025, 4 de 6 años) y cada usuario ve su resumen | "Tu año en la Palabra": tarjeta compartible con racha, libros leídos y liga de tu iglesia (tipo Spotify Wrapped) |
| Gestión de iglesias en español | Ekklesia (Argentina), Khesed-tek (USD 49–299/mes, con WhatsApp), Mincloud, AdminFiel, ConectaIglesia | **No competir** con gestión completa: solo agenda de eventos y grupos, gratis, como puerta para la liga de iglesias |
| Contenido sin cara en redes | En TikTok y YouTube crecen cuentas cristianas sin cara (historias bíblicas cinematográficas con IA, versículos con música) | Motor de difusión de la suite (ver bitácora de difusión) |

Fuentes adicionales: pulpitai.com y subsplash.com/product/pulpit-ai; remem.me; biblememory.com; play.google.com (Selah Bible Charades);
bible.com/kids y onehope.net; faith.tools/daily-audio-bible; archive.org (El progreso del peregrino); prnewswire.com (YouVersion
Verse of the Year 2025); ekklesia.com.ar; khesed-tek-systems.org.

## 7. Módulo para reuniones de jóvenes y juegos dentro de la app (idea del fundador del 28-09-2026, explorada como disparador)

| Qué existe | Dato | Etiqueta | Fuente |
|---|---|---|---|
| **"El Impostor"** (todos reciben una palabra menos uno; pistas y votación) | Viral en Argentina a fines de 2025: streams, clips, juntadas y sobremesas; se juega con celulares | HECHO | La Capital, El Destape (dic-2025) |
| **Jackbox** (el celular es el control; pantalla compartida) | Muy usado en ministerios juveniles desde la pandemia; ~USD 8–18 M/año | HECHO / ESTIMACIÓN | Presbyterian Outlook, Kona Equity, Growjo |
| **Gartic Phone y StopotS** (Onrizon, Brasil) | Teléfono descompuesto dibujado (hasta 30 jugadores, sin instalar) y Tutti Frutti online: éxitos virales de navegador | HECHO | vidaextra, stopots.com |
| **Pasapalabra (el rosco)** | En Telefe desde el 26-01-2025, con ratings de 7–11 puntos; Argentina mantiene el rosco (España lo sacó en 2026) | HECHO | La Nación, Wikipedia |
| Kahoot | Gratis solo hasta 10 jugadores | HECHO | support.kahoot.com |
| Recursos para líderes en inglés | Download Youth Ministry: 4.000+ juegos descargables y planificador; "Youth Ministry Planner": convierte un pasaje y notas en la reunión completa | HECHO | downloadyouthministry.com, youthministryplanner.com |
| Recursos en español | **e625** (ex Especialidades Juveniles, fundada por el argentino Lucas Leys en Buenos Aires, 2001): libros, instituto online y convenciones; blogs como ParaLideres y sitios de "+200 dinámicas" | HECHO | e625.com, blog.paralideres.org |
| Campamentos | Muchos ministerios hacen campamentos de verano (LAPEN en 13 provincias; FASTA 1.270 jóvenes) con juegos por equipos durante varios días | HECHO | lacorriente.com, fasta.org |

**Qué sale (INFERENCIA): "Modo Reunión" dentro de la suite.** No es un juego más: es la herramienta del líder de jóvenes y, a la vez,
**el mejor canal de difusión de la app** (cada reunión mete a 20–60 jóvenes en la app sin instalar nada).

1. **Planificador con IA:** el líder pone un pasaje o un tema y sale la reunión completa (rompehielo, juego, mensaje corto, preguntas
   para grupos, oración), con un banco curado de dinámicas en español.
2. **Juegos en la sala** (pantalla proyectada + celulares como control, entran por QR sin instalar):
   Impostor bíblico · Trivia en vivo para 100 jugadores · Adiviná el personaje con el celular en la frente · Rosco bíblico (tipo
   Pasapalabra) · Tutti Frutti bíblico · Dibujá y adiviná · Mímica y Tabú con cartas · ¿Quién soy? · Búsqueda del tesoro con QR y
   "escape room" bíblico · sorteador de equipos, cronómetro y marcador.
3. **Campamentos:** tablero de puntos por equipos para varios días, desafíos diarios y ranking en pantalla.
4. **Liga entre grupos de jóvenes** (se conecta con la liga de iglesias).
5. **Cómo se cobra:** lo básico gratis (es el canal); "Plan Líder" con juegos premium, planificador ilimitado y modo campamento.
6. **Contenido sin cara para redes:** clips de rondas del Impostor bíblico y del rosco (grabación de pantalla y voz sintética), un
   formato que hoy ya es tendencia.
7. **Cuidado:** moderación y privacidad de menores (sin chat abierto entre desconocidos; datos mínimos; fotos solo con permiso del líder).

## 8. Bancos de preguntas bíblicas existentes (pedido del fundador, 28-09-2026)

| Fuente | Qué es | Licencia / uso | Fuente del dato |
|---|---|---|---|
| Bible Trivia (Hugging Face, formato Alpaca) | 1.290 pares pregunta–respuesta en inglés | Revisar la licencia de la ficha antes de importar | huggingface.co/datasets/liaaron1/bibile_trivia_alpaca |
| OpenTriviaQA | Preguntas de trivia por categorías (incluye religión) | CC BY-SA 4.0 (atribución y compartir igual) | github.com/uberspot/OpenTriviaQA |
| Open Trivia Database (el-cms) | JSON con categoría, idioma, respuestas y fuente | Pide citar y enlazar el repositorio | github.com/el-cms/Open-trivia-database |
| Listas en español en PDF | «1800 preguntas bíblicas» (biblioteca del ministerio juvenil), 100 de BibliaRed, 38 de recursos-biblicos.com, 50 y 100 en Scribd | Sin licencia abierta explícita: **solo como referencia** de temas y categorías; se reescribe | eunice.fustero.es, bibliared.org, recursos-biblicos.com, scribd.com |

**Filtro pregunta por pregunta (diseño):** deduplicar → verificar contra el texto (el pasaje existe y la respuesta es correcta,
automático contra RVR1909) → descartar lo disputado o ajeno al foco protestante → asignar categoría, dificultad y cita → revisión
humana de lo sensible y muestreo del resto → registrar fuente y licencia de cada pregunta. Solo se importa tal cual lo que tiene
licencia abierta, con atribución.
