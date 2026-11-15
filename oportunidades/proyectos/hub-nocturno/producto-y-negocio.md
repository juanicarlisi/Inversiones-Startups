# Hub Nocturno · Qué producto es y cómo daría plata (15-11-2026)

> **Para qué sirve este documento.** El fundador probó la primera versión y dijo que no entendió nada y que no vio animaciones buenas.
> Pidió definir bien el producto y su rentabilidad antes de seguir. Esto es eso: qué es el juego, para quién, cuánto puede dejar de
> verdad por cada canal, con qué probabilidad, y en qué fechas se sigue, se cambia o se corta.
>
> **Cómo leerlo.** Cada dato lleva su etiqueta: **HECHO** (con fuente y fecha), **ESTIMACIÓN** (con el método), **HIPÓTESIS** (a validar)
> e **INFERENCIA** (razonamiento propio). Cuando la fuente es un vendedor interesado (una plataforma que quiere que publiques ahí, un
> blog de un intermediario), se aclara. Moneda: USD.
>
> **Contexto:** producto JG4 de Carpincho Games (`oportunidades/proyectos/P6-juegos.yaml`); prototipo en `apps/juegos/aviacion/`; otro
> agente rehace en paralelo la experiencia en 3D con un comienzo claro. Este documento no toca código.

---

## 0. La respuesta corta

| Pregunta | Respuesta |
|---|---|
| ¿Qué es, en una frase? | **Un juego de navegador donde armás de noche la red de correo aéreo de un continente y mirás cómo tu hub hace que todo llegue a tiempo.** |
| ¿Cuánto deja, siendo honestos? | Lo más probable (65%): **casi nada**. Con suerte media (25%): **USD 50–180 por mes** durante un año. Si pega (10%): **USD 600–2.000 por mes** en el pico. Valor esperado: **unos USD 100 por mes** entre 2027 y 2029 (≈ USD 3.300 en tres años). |
| ¿Le gana a la tesorería? | En plata, sí: arriesga menos de USD 500 en efectivo. En **atención** (horas de Claude que podrían ir a Senda o a Andén) es de los proyectos de menor rendimiento del holding. |
| ¿Seguir, cambiar o cortar? | **Cambiar y seguir con freno de mano.** Como está (tycoon profundo de 22 misiones para el público de los portales) no conviene. Mejor así: **en el portal, una versión corta y espectacular** (el capítulo de 1929, la noche y el hub, 20–30 minutos) que mida gratis si engancha; la profundidad queda para una versión paga en Steam **solo si el portal da buenos números**. Tope: dos iteraciones; si no pasa, queda publicado sin gastar más horas. |
| ¿Qué tiene que hacer el fundador? | Crear la cuenta de desarrollador en CrazyGames (gratis, ~1 h), elegir el nombre tras la búsqueda de marca, aprobar la consulta legal (ronda nocturna y ganancia por ausencia) y mirar 4 tableros de números en 2027 (30 min cada uno). Total: **unas 8–12 horas en un año**. |

---

## 1. Cuánto deja de verdad un juego así, por canal

### 1.1 Portales web (CrazyGames, Poki y el resto)

**Cómo funciona el cobro.**

| Dato | Etiqueta | Fuente y fecha |
|---|---|---|
| CrazyGames publica en dos etapas. El **lanzamiento básico** muestra el juego a un público limitado, **sin anuncios ni pago**, hasta que tiene al menos 7 días y 500 partidas (si no llega a 500, termina solo a los 21 días). Recién el **lanzamiento completo** reparte publicidad. | HECHO | [docs.crazygames.com, Basic Launch metrics](https://docs.crazygames.com/resources/basic-launch-metrics/), leído el 15-11-2026; [portalready.world](https://portalready.world/portals/crazygames-basic-launch-vs-full-launch/), 03-10-2026 |
| Qué mide el básico y qué llama «fuerte»: **tiempo de juego** («los exitosos suelen ver 10+ minutos»), **vuelta al día siguiente (D1)** («los fuertes logran 10–15%»), **conversión** (juega al menos un minuto: «los mejores convierten 80%+») y, **desde el 23-11-2026, el clic en la miniatura** («fuertes: el 20% de arriba de su categoría»). No publica un umbral de aprobación. | HECHO | [docs.crazygames.com](https://docs.crazygames.com/resources/basic-launch-metrics/), 15-11-2026 |
| El paso al lanzamiento completo lo decide CrazyGames «solo, por criterios editoriales, de calidad o de rendimiento». | HECHO | Términos para desarrolladores del 18-08-2025, citados por [portalready.world](https://portalready.world/portals/crazygames-basic-launch-vs-full-launch/), 03-10-2026 |
| **Reparto de CrazyGames: no está publicado.** Los términos dicen que el monto mensual depende del alcance, del rendimiento de los anuncios y del interés de los anunciantes. Cobro mensual desde EUR 100. El único porcentaje público (60% de publicidad, 70% de compras) es de las bases de una *game jam* de 2026, no de un contrato general. | HECHO | [portalready.world](https://portalready.world/portals/crazygames-basic-launch-vs-full-launch/) (cláusulas 5.3–5.4, 03-10-2026); [playgama.com](https://playgama.com/blog/?p=14181), 11-09-2026; [Cinevva](https://app.cinevva.com/guides/web-game-monetization), 06-09-2026 |
| **Poki:** 100% de la publicidad cuando el jugador llega por vos (busca el nombre del juego, entra directo) y 50% cuando lo trae Poki. Los acuerdos no exclusivos pagan una licencia fija. | HECHO | [sdk.poki.com/deals](https://sdk.poki.com/deals), visto en buscador el 15-11-2026 |
| Poki elige a mano. Su prueba (*web fit test*) pone el juego frente a ~10.000 jugadores en 3–5 días, mide clic en la miniatura, tiempo en la página y conversión a jugar, y no paga nada durante la prueba. | HECHO | [developers.poki.com/guide/web-fit-test](https://developers.poki.com/guide/web-fit-test), 15-11-2026 |
| **Ningún portal publica qué porcentaje de juegos pasa del lanzamiento de prueba.** | HECHO (ausencia) | Búsqueda del 15-11-2026; lo confirma [portalready.world](https://portalready.world/portals/crazygames-basic-launch-vs-full-launch/) |
| Escala: Poki tiene más de 100 M de jugadores por mes y ~1.000 M de partidas por mes; CrazyGames dice más de 50–60 M de jugadores por mes. | HECHO (dato del propio portal, fuente interesada) | [Informe 2026 State of Web Gaming, encargado por Poki](https://investgame.net/news/pdf/2026-06-25-the_2026_state_of_web_gaming_report_4ee6fdc260_wp/), jun-2026; [GamesBeat](https://gamesbeat.com/crazygames-celebrates-10th-anniversary-with-launch-of-originals-browser-games) |

**Cuánto deja por cada mil partidas.** Es el número que decide todo y **nadie lo publica con datos actuales**.

| Evidencia | Valor | Etiqueta y calidad |
|---|---|---|
| Un desarrollador con 8 juegos en CrazyGames: EUR 556,92 por 451.327 partidas | **≈ EUR 1,2 por mil partidas** | HECHO, pero viejo (juegos de ~2018) y con pocos anuncios. Citado por [Cinevva](https://app.cinevva.com/guides/web-game-monetization), 06-09-2026 |
| Fórmula de un blog: partidas × % que mira el video × eCPM × reparto | USD 3–5,4 por mil (cálculo) | ESTIMACIÓN de terceros con eCPM supuestos, [PixelGameCraft](https://pixelgamecraft.com/blog/html5-game-income/), 17-09-2026 |
| Precio del video con premio (por mil vistas, antes del reparto): EE.UU. USD 15–28, Europa 8–15, India o Brasil 1–3 | — | ESTIMACIÓN de **fuente interesada** (Playgama vende publicación de juegos), citada por PixelGameCraft y Cinevva, 2026 |
| Un desarrollador que publicó en CrazyGames hace la cuenta: «USD 15.000 de un juego de navegador piden entre 1 y 15 millones de partidas» | USD 1–15 por mil | Cálculo personal, no resultado. [X, @froessell](https://x.com/froessell/status/2110671824279179694), visto en buscador el 15-11-2026 |

**ESTIMACIÓN usada en este documento:** **USD 1,5–3 por mil partidas** para el desarrollador, con USD 2 como central. Método: el único dato
real (EUR 1,2) corregido hacia arriba porque un juego de gestión tiene sesiones largas y admite video con premio («cobrar el doble del
parte de la mañana»), y hacia abajo respecto de los cálculos de blog porque suponen público de EE.UU. y tasas altas de video. Se
reemplaza por el número real del tablero de CrazyGames al segundo mes de lanzamiento completo.

**Casos reales con números (todos autodeclarados; ninguno auditado):**

| Caso | Números | Qué enseña | Fuente y fecha |
|---|---|---|---|
| *Liquid Swarm* (incremental de un desarrollador solo, CrazyGames) | ≈ **EUR 31 por día** (≈ USD 12.900 por año) a las 6 semanas; una miniatura y un video mejores subieron el clic ~10% y el ingreso con él; **agregar versión de celular bajó el ingreso un tercio** y volver atrás lo recuperó. Sus tres juegos anteriores fracasaron. | Un juego de progresión puede dejar ~USD 1.000 por mes; la miniatura importa; el escritorio paga más | Título y resumen del devlog en itch.io vistos en buscador el 15-11-2026; **la página da 404 hoy**: no verificable. El juego existe en [CrazyGames](https://www.crazygames.com/game/liquid-swarm) y su [página de Steam](https://store.steampowered.com/app/4710480) dice que la versión web es «la forma de probarlo» |
| Juego de un socio de un estudio ruso en CrazyGames | Empezó en ~USD 50 por día y **cayó diez veces** | Los ingresos caen fuerte después del primer mes | [partnerkin.com](https://partnerkin.com/blog/stati/money-from-html5-games), act. 02-10-2026 |
| Juego en lo más alto de Poki | ~USD 500 por día mientras estuvo arriba | El techo existe, pero es de pocos | misma fuente |
| Rango de ese estudio para un juego simple | USD 10–3.000 por mes; lo común, USD 50–1.500 | — | misma fuente |
| Juego simple de Construct 3 en CrazyGames | ~USD 400 en total | El caso típico | [gamezdev.com](https://www.gamezdev.com/how-to-earn-money-on-crazygames-i-made-400-with-a-simple-construct-3-game/), 01-04-2026 |
| *Blacktop Police Chase* en Poki | 4,5 M de partidas en un año; dos juegos del mismo desarrollador «cerca de seis cifras» en total | Un éxito en Poki puede dejar decenas de miles por año | [Exputer](https://exputer.com/?p=445036), 13-10-2026 |
| Distribución general | «La mediana está cerca de cero» | La mayoría no gana nada | [Cinevva](https://app.cinevva.com/guides/web-game-monetization), 06-09-2026 (sitio de guías, sin método publicado) |

**Qué juegos dominan los portales (lo que importa para nosotros):** en el estudio de CrazyGames sobre EE.UU. (mayo 2025–mayo 2026,
1.740 M de sesiones), el **hipercasual fue el género número uno el 79% del año y el puzzle el 21%**. La gestión no aparece arriba
(HECHO, [PocketGamer.biz](https://www.pocketgamer.biz/report-hypercasual-and-puzzle-games-dominate-the-browser-gaming-space/), 21-05-2026).
Sí hay juegos de aerolínea con público: *Airline Tycoon Idle* (36.000 «me gusta») e *Idle Airport Tycoon* (47.000) en CrazyGames, sin
carga ni hub (HECHO, `conocimiento/2026-10-17-max-aviacion-y-juegos-divertidos.md`, 17-10-2026).

### 1.2 Licencias a portales (pago fijo)

| Dato | Valor | Etiqueta |
|---|---|---|
| Licencia no exclusiva | USD 300–800 por portal | ESTIMACIÓN de **fuente interesada** ([Playgama](https://playgama.com/blog/2026/04/15/10-ways-to-monetize-html5-games-that-actually-work-in-2026/), 15-04-2026) |
| Licencia exclusiva | desde USD 5.000; más de 25.000 para juegos pulidos | misma fuente; sin casos verificados |
| GameDistribution | 33% del ingreso neto, cobro desde EUR 100 | HECHO según su contrato, citado por [playgama.com](https://playgama.com/blog/?p=14181), 11-09-2026 |

INFERENCIA: las licencias son un ingreso de una vez, chico y que solo se consigue si el juego ya demostró que retiene. Además chocan con
la exclusividad web de Poki (y con el bono de exclusividad opcional de CrazyGames). No sirven para decidir si se hace el juego.

### 1.3 Celular (idle y tycoon de transporte y aerolíneas)

| Dato | Valor | Etiqueta y fuente |
|---|---|---|
| Retención de tycoon/idle con tráfico pago de EE.UU. (promedios 2025) | D1 ≥ 40%, D3 20–25%, D7 8–12%, D30 ~6% | HECHO (opinión de un director de marketing de AppQuantum, editora que vive de esto), [PocketGamer.biz](https://www.pocketgamer.biz/marketing-a-new-mobile-game-where-should-studios-start/), 21-10-2026 |
| Costo por instalación al que hay que apuntar en tycoon | **menos de USD 1,50** | misma fuente |
| Costo por instalación mediano de juegos en Apple Ads EE.UU. | USD 4,63 (datos 2025) | AppTweak vía [games.gg](https://games.gg/news/mobile-game-marketing-costs-2027/), 2026 |
| D30 mediano de todos los juegos de celular | ~0,7% (4% el mejor 10%) | GameAnalytics, [informe 2026](https://investgame.net/wp-content/uploads/2026/01/2026-01-20-Mobile_retention_benchmarks_2026.pdf), 20-01-2026 |
| Ingreso por usuario diario en casual con publicidad | USD 0,03–0,30 según el tipo | ESTIMACIÓN de blogs de proveedores ([juegostudio](https://www.juegostudio.com/blog/arpdau-benchmarks-by-game-genre), [playio](https://blog.playio.co/arpdau-benchmarks-mobile-games)); sin método claro |
| Idles de aeropuerto existentes | *Airport Inc.* 2,9 M de instalaciones y menos de USD 10.000 por mes; *Idle Airplane Inc.* 1,2–3,8 M y alrededor de USD 10.000 | ESTIMACIÓN de terceros ([AppGoblin](https://appgoblin.info/apps/com.jettoast.aero), [AppGoblin](https://appgoblin.info/apps/6445961774)), 2025–2026 |

INFERENCIA: en celular **no se crece sin pagar**. Los idles de aeropuerto con millones de descargas dejan menos de USD 10.000 por mes y
llegaron ahí comprando usuarios. Con USD 400 por mes de capital y la regla de no vender, el celular queda **afuera** salvo que el portal
muestre algo excepcional (D1 ≥ 20%), y aun así como puerto barato del mismo código, sin publicidad paga.

### 1.4 Steam (tycoons chicos)

| Dato | Valor | Etiqueta y fuente |
|---|---|---|
| Ingreso mediano de un juego lanzado en Steam en 2025 | **USD 318** (otra lectura: 249) | HECHO (estimación de Gamalytic), [Game Dev Report](https://gamedevreport.beehiiv.com/p/19-606-steam-games-made-16b-in-2025-most-made-0-but-that-s-not-a-problem), 21-12-2025 |
| Juegos de 2025 que pasaron USD 5.000 | 23,4% | misma fuente |
| Juegos de 2025 que no recuperaron los USD 100 del alta | 40% | [WN Hub](https://wnhub.io/news/stores-and-publishing/item-49120), 2026 |
| Conversión de deseados (*wishlists*) en ventas el primer mes | ~27% mediana (Gamalytic) | [SteamPageAnalyzer](https://www.steampageanalyzer.com/blog/median-steam-game-2026), 2026 |
| *Mini Airways* (control aéreo minimalista, USD 9,99, 2024) | ~28.900 copias, ~USD 260.000 brutos | ESTIMACIÓN de [Raijin](https://raijin.gg/app/2289650/Mini_Airways), 24-06-2026 |
| *Airport CEO* | ~178.500 copias, ~USD 2,7 M brutos | ESTIMACIÓN de [Raijin](https://raijin.gg/app/673610/Airport_CEO) |
| *Airline Tycoon Deluxe* (USD 9,99) | ~71.600 copias, ~USD 114.000 brutos | ESTIMACIÓN de [SteamData](https://steamdata.ai/en-US/game/331920/airline-tycoon-deluxe), sin fecha |

INFERENCIA: en Steam **la profundidad sí se paga** (los juegos de aviación con sistema tienen un público fiel), pero son los
sobrevivientes; la mediana es casi cero y Steam pide juntar deseados antes de lanzar (clips, Next Fest). Es el mejor hogar para el Hub
Nocturno «completo» **solo si** el portal demuestra que la fantasía engancha. El portal funciona como demo gratis que alimenta la página
de Steam (lo hace *Liquid Swarm*, ver 1.1).

### 1.5 itch.io y Discord Activities

| Canal | Dato | Etiqueta y fuente | Veredicto |
|---|---|---|---|
| itch.io | ~80% de los juegos pagos gana USD 0–50 por mes; la plataforma cobra lo que elijas (10% por defecto) | ESTIMACIÓN de [Generalist Programmer](https://generalistprogrammer.com/tutorials/phaser-game-monetization-guide) vía Cinevva, 2026 | Solo vitrina y bitácora gratis. Ingreso ≈ 0 |
| Discord Activities | Abiertas a todos desde 2024; compras dentro de la actividad; comisión 15% hasta USD 1 M (no confirmado en fuente oficial); **no hay tienda para descubrir actividades** | [PocketGamer.biz](https://www.pocketgamer.biz/discord-activities-opens-up-to-all-developers-to-make-games-on-the-platform), 2024; [Cinevva](https://app.cinevva.com/guides/publish-game-discord-activities), 2026 | Afuera: sirve para juegos sociales; Hub Nocturno es de una persona y nadie lo encontraría |

### 1.6 Salidas: ¿alguien compraría esto?

| Caso | Números | Etiqueta y fuente |
|---|---|---|
| **Trophy Games compró Playrion** (Airlines Manager, Airport Simulator) a Paradox | EUR 2,25 M al contado + 9% del ingreso neto por 3 años, por un estudio de ~30 personas con ~DKK 30 M de ingreso anual | HECHO, comunicado del 25-09-2026 ([Placera](https://www.placera.se/pressmeddelanden/trophy-games-development-trophy-games-acquires-playrion-sasu-from-paradox-interactive-and-upgrades-full-year-2026-guidance-20260925), [PocketGamer.biz](https://pocketgamer.biz/trophy-games-acquires-playrion-from-paradox)) |
| Trophy Games 2025 | Ingreso DKK 126,5 M; sus 3 juegos grandes (Airline, Farm y Truck Manager) son el 67% | HECHO, [comunicado anual](https://www.inderes.dk/en/releases/trophy-games-reports-record-year-for-2025-with-40percent-revenue-growth), mar-2026 |
| Flippa: juegos chicos en venta | Múltiplos pedidos de 0,8 a 2,8 veces la ganancia anual (avisos, no ventas cerradas) | ESTIMACIÓN, [Flippa](https://flippa.com/12230185), 2025–2026 |

INFERENCIA: el comprador natural (Trophy Games) paga **alrededor de media vez el ingreso anual** por un estudio de aviación entero (DKK 30
M ≈ EUR 4 M; EUR 2,25 M al contado ≈ 0,56 veces). Un juego web que deja USD 100–1.000 por mes valdría entre USD 1.000 y 30.000 en
Flippa. **La salida no justifica construir**: es un premio posible del escenario bueno, no una razón.

---

## 2. Quién lo juega y por qué volvería

| Dato | Valor | Etiqueta y fuente |
|---|---|---|
| Edad en CrazyGames | 32,8% del tráfico medible tiene 18–24 años; los menores casi no se cuentan (los medidores no pueden clasificarlos) | HECHO viejo (Similarweb, nov-2023), [The Conduit](https://news.conduit.gg/p/gen-alphas-favorite-game-store-is) |
| Cuándo se juega (EE.UU.) | 22% más en días hábiles; pico a la 1 de la tarde (hora del almuerzo); la sesión media de navegador es de **30 minutos** | HECHO (estudio de CrazyGames, fuente interesada), [PocketGamer.biz](https://www.pocketgamer.biz/report-hypercasual-and-puzzle-games-dominate-the-browser-gaming-space/), 21-05-2026 |
| Cuánto dura una sesión según los jugadores | 11–20 min: 29%; 21–30: 22%; 6–10: 18%; más de 1 h: 15%. El 49% prueba 2–3 juegos por sesión | HECHO (encuesta encargada por Poki, mayo 2026), [informe](https://investgame.net/news/pdf/2026-06-25-the_2026_state_of_web_gaming_report_4ee6fdc260_wp/) |
| Dispositivo | **Sin dato confiable** del reparto computadora/celular. El caso *Liquid Swarm* sugiere que la computadora paga más | Búsqueda del 15-11-2026 |

**Quién es (INFERENCIA a validar con el tablero del portal):** un adolescente o adulto joven en una computadora (muchas veces de escuela
u oficina, Chromebook), en un recreo de 15–30 minutos, que elige entre decenas de miniaturas en dos segundos y abandona si en el primer
minuto no entiende qué hacer. **No es el fanático de *Airport CEO***: ese está en Steam. Hay un segundo público chico y valioso: el que
ama los mapas, los trenes y los aviones y se queda horas (el 15% que juega más de una hora).

**Qué hace volver en un tycoon de transporte (INFERENCIA; no hay datos públicos por subgénero en portales):**

1. **Ver que la red trabajó sin vos** (el parte de la mañana: «tu red entregó 1.240 sacas mientras dormías»).
2. **Una meta a la vista y alcanzable hoy** (el próximo avión, la próxima ciudad, la próxima época).
3. **Un desafío diario igual para todos** (la ronda del día con medalla y racha).
4. **Coleccionar** (aviones con personalidad, ciudades que se encienden en el mapa).

Lo que **no** hace volver: pantallas de finanzas, decisiones finas que no se ven (la carga mínima por ruta) y tutoriales largos. El
fundador lo comprobó en carne propia: la v1 pide entender transbordo, balizas, carga mínima y promesas antes de sentir la fantasía.

**La promesa de la miniatura** (el clic en la miniatura es métrica oficial de CrazyGames desde el 23-11-2026):

| Opción | Imagen | Texto (inglés, para el portal) |
|---|---|---|
| **A (recomendada)** | Mapa nocturno, rutas encendidas que convergen en un hub iluminado, aviones con luces de posición, un «+$» grande | **«Build the night airmail empire»** |
| B | Un hub de cerca, cintas con sacas cambiando de avión | «Your hub never sleeps» |
| C | Biplano sobre la Patagonia con balizas | «Light the route. Fly the night.» |

---

## 3. Definición del producto

| Campo | Definición |
|---|---|
| **Promesa (una frase)** | Armá de noche la red de correo aéreo de un continente y mirá cómo tu hub hace que todo llegue a tiempo. |
| **Público** | Jugadores de portales en computadora, 13–30 años, sesiones de 15–30 minutos (principal). Fanáticos de gestión y aviación (secundario: son los que pagarían en Steam). |
| **Fantasía central** | «Soy el que hace que todo llegue»: ver la noche llena de luces, los aviones bajando al hub, la carga cambiando de avión y saliendo antes del amanecer. |
| **Pilar 1 · El hub es el espectáculo** | Lo que se ve es lo que pasa: sacas que bajan, se clasifican y suben a otro avión. Es lo que nadie más muestra en los portales y es lo que va en la miniatura. |
| **Pilar 2 · La noche** | Cada día tiene un ritmo: de día crecés, de noche tu red se juega la entrega a primera hora (balizas en 1929, la ronda nocturna después). Tensión y alivio diarios. |
| **Pilar 3 · De una ruta a un continente** | Progresión visible: de un biplano Buenos Aires–Montevideo a la red del continente, por épocas (1929, 1946, 1970). El mapa que se enciende es la recompensa. |
| **Queda afuera** | Pantallas de finanzas; la carga mínima como decisión obligatoria (pasa a «avanzado», con automático por defecto); multijugador; servidores y cuentas; compras dentro del juego en el lanzamiento; 3D que no corra en un Chromebook; marcas, aviones o aerolíneas reales; mecánicas de terceros de menos de 20 años (ver `apps/juegos/aviacion/README.md`). |
| **Alcance del portal (cambio)** | El capítulo 1929 completo y pulido (20–30 min, un hub, la noche y las balizas) como juego en sí; los capítulos 1946 y 1970 se abren solo si el básico da números para el lanzamiento completo. |

**Plataformas en orden y cómo cobra cada una:**

| Orden | Plataforma | Cuándo | Cobro |
|---|---|---|---|
| 1 | **CrazyGames, lanzamiento básico** | Dic-2026 / ene-2027 | Nada (mide gratis) |
| 2 | CrazyGames, lanzamiento completo | Si CrazyGames lo elige (feb–abr 2027) | Publicidad: corte entre capítulos o días (como mucho uno cada 3 min) y video con premio opcional («cobrar el doble del parte»), este último solo con el OK legal |
| 2b | Poki (*web fit test*) | Solo si CrazyGames rechaza y el fundador elige probar otra puerta (exige exclusividad web si acepta) | Publicidad, 50% (100% del tráfico propio) |
| 3 | Licencias no exclusivas a otros portales | Solo si no hay exclusividad y el juego ya pasó la compuerta 2 | Pago fijo (USD 300–800 por portal, fuente interesada) |
| 4 | Steam, versión completa paga | Solo si pasa la compuerta 3 (sep-2027) | Precio único de USD 5–10 (referencia: *Mini Airways* y *Airline Tycoon Deluxe* a USD 9,99) |
| — | Celular, itch.io, Discord | No, salvo resultados excepcionales | — |

**Métrica norte:** **minutos jugados por cada jugador nuevo** (tiempo de juego promedio del tablero de CrazyGames), con dos guardas: la
vuelta al día siguiente (D1) y la conversión a jugar. Es la que más se parece a lo que paga (más minutos = más cortes y videos) y a lo
que CrazyGames usa para decidir el lanzamiento completo.

---

## 4. Caso de negocio de abajo hacia arriba

### 4.1 La cuenta

**Ingreso mensual = partidas por mes × USD por cada mil partidas.**

| Escenario | Prob. (honesta) | Qué pasa | Partidas por mes (ESTIMACIÓN) | USD por mil | Ingreso en el pico |
|---|---|---|---|---|---|
| **Malo** | **65%** | No pasa el básico, o pasa sin tráfico | 0–10.000 | 1,5–3 | USD 0–30 |
| **Medio** | **25%** | Lanzamiento completo con tráfico modesto que cae después del primer mes | 30.000–60.000 | 1,5–3 | USD 45–180 (central 100) |
| **Bueno** | **10%** | Pega como *Liquid Swarm*; se suma Steam y alguna licencia | 300.000–500.000 | 2–4 | USD 600–2.000 (central 1.000) más Steam |

Por qué estas probabilidades (INFERENCIA): la mediana de los juegos web y de Steam está cerca de cero (secciones 1.1 y 1.4); los
portales los dominan el hipercasual y el puzzle, no la gestión; la primera prueba de comprensión (el fundador) falló; y el propio plan
del holding le daba 15% de éxito. A favor: el tema tiene público probado en los portales, la mecánica del hub no la tiene nadie ahí y el
instrumento de medición del juego es muy superior al de un desarrollador típico. Por eso el bueno queda en 10% y no en 3%.

### 4.2 Ingreso mensual por horizonte (desde hoy, 15-11-2026)

| Horizonte | Malo (65%) | Medio (25%) | Bueno (10%) | **Valor esperado** |
|---|---|---|---|---|
| 6 meses (may-2027) | 0 | 100 | 700 | **USD 95 por mes** |
| 12 meses (nov-2027) | 0 | 80 | 1.000 | **USD 120 por mes** |
| 24 meses (nov-2028) | 0 | 50 | 900 (con Steam) | **USD 100 por mes** |
| 36 meses (nov-2029) | 0 | 30 | 600 | **USD 70 por mes** |
| **Acumulado a 3 años** | ≈ 0 | ≈ USD 2.200 | ≈ USD 25.000–30.000 | **≈ USD 3.300** |

Método: curva con caída después del primer mes de lanzamiento completo (el caso de partnerkin cayó 10 veces; se supone una caída más
suave porque un juego de progresión retiene mejor, HIPÓTESIS) y una actualización por año. En el bueno, Steam suma entre 24 y 36 meses
(HIPÓTESIS: USD 3.000–15.000 netos de por vida, muy por debajo de *Mini Airways*).

### 4.3 Costos y horas

| Concepto | Monto | Etiqueta |
|---|---|---|
| Alojamiento | USD 0 (el portal aloja el juego) | HECHO (paquete de 420 KB sin servidor, `apps/juegos/aviacion/README.md`) |
| Cuenta de CrazyGames | USD 0 | HECHO (P6) |
| Consulta legal (ronda nocturna, ganancia por ausencia, patentes de EA) y búsqueda de marca | **a cotizar; sin dato** | Falta el número: pedir dos presupuestos antes de diciembre |
| Registro de marca (INPI y, si pega, EUIPO/USPTO) | a cotizar; solo si pasa a lanzamiento completo | Sin dato |
| Alta en Steam | USD 100 por juego, solo en el bueno | HECHO ([WN Hub](https://wnhub.io/news/stores-and-publishing/item-49120), 2026) |
| Claude Max | ya pagado y compartido con todo el holding | El costo real es **de oportunidad**: cada sesión en Hub Nocturno no va a Senda ni a Andén |
| Horas del fundador | ~8–12 h el primer año; ~2 h por año después | ESTIMACIÓN: cuenta y cobros (2 h), nombre y marca (1 h), consulta legal (2–3 h), prueba del primer minuto (0,5 h), 4 tableros (2 h) |

### 4.4 Contra la vara del holding

| Comparación | Resultado | Etiqueta |
|---|---|---|
| Contra la tesorería (6–8% anual) | Con menos de USD 500 de efectivo en juego, la tesorería daría USD 30–40 por año. El valor esperado del juego (≈ USD 1.100 por año) le gana **en plata**. | INFERENCIA |
| Contra el plan anterior de P6 | El plan suponía USD 200 (jun-2027), 450 (dic-2027) y 800 (dic-2028) por mes en el escenario normal. Con la evidencia de hoy, el valor esperado es **un cuarto o un quinto** de eso. Conviene corregir los números de JG4 en `P6-juegos.yaml` (este documento no lo toca). | INFERENCIA |
| Contra Senda y Andén | Lo escaso no es la plata sino la capacidad de Claude y la atención del fundador. Hub Nocturno es un **tiro barato con cola larga**, no un motor. Merece poca capacidad y cortes duros. | INFERENCIA |
| Rol en la cartera | Comparte motor y tema con Hub Rush (puzzle de clasificar, el género que sí domina los portales) y con Andén (el hub como espectáculo es la misma fantasía que un simulador logístico vende); aprende cómo funcionan los portales para los juegos que siguen. | INFERENCIA |

### 4.5 Así no → mejor así

| Así no | Mejor así | Por qué |
|---|---|---|
| Un tycoon profundo de 3 capítulos y 22 misiones como primera impresión en un portal de hipercasual | **Un capítulo (1929) de 20–30 min, corto y espectacular**, que se entiende en 60 segundos; lo profundo, después y solo si hay números | El público elige en 2 segundos y juega 15–30 min; el fundador no lo entendió |
| Pantallas e indicadores para explicar la logística | **Que la logística se vea**: sacas que cambian de avión, luces que se encienden, un «+$» que vuela | Pilar 1; la miniatura vende lo que se ve |
| 3D completo que exige GPU | **3D liviano con piso 2D** que ande en un Chromebook de 4 GB; el presupuesto visual va a la miniatura y al primer minuto | Sin GPU el 3D cae a 0,4–3,2 fps (`oportunidades/proyectos/anden/radar-tecnico.md`); CrazyGames pide que ande en un Chromebook |
| Corte con «D1 < 20%» (plan actual) | **Corte con los números de CrazyGames**: D1 ≥ 10%, tiempo ≥ 10 min, conversión ≥ 80% y clic en la miniatura en el 40% de arriba | El 20% está por encima de lo que el mismo portal llama «fuerte» (10–15%); con ese corte se archivaría un juego bueno |
| Esperar plata del portal para justificarlo | **El portal como demo gratis**; si engancha, la versión completa paga va a Steam, donde la profundidad se cobra | *Liquid Swarm* usa la web como prueba de su Steam; los tycoons de aviación de pago tienen público |
| Celular con publicidad paga | **Nada de celular** salvo D1 ≥ 20% en el portal, y aun así sin pagar usuarios | Costo por instalación de USD 1,5–4,6 contra ingresos por usuario de centavos |

---

## 5. Pipeline, compuertas y quién hace qué

### 5.1 Etapas

| Etapa | Fechas | Qué se mide | **Seguir** | **Ajustar** | **Archivar** |
|---|---|---|---|---|---|
| **C0 · Primer minuto** (antes de subir) | hasta 15-12-2026 | 5 personas que nunca lo vieron, sin explicación, 5 minutos (las consigue el fundador en su entorno o se reemplazan por una prueba de usuarios pagada si él lo aprueba). Bots: primer cobro, carga, fps en equipo lento | 4 de 5 dicen qué tienen que hacer y llegan al primer transbordo; carga < 10 s; ≥ 30 fps con la CPU frenada 4× | 3 de 5 → una vuelta más (1 semana) | 2 de 5 o menos dos veces → replantear el comienzo antes de subir |
| **C1 · Lanzamiento básico CrazyGames** | dic-2026 a ene-2027 (7–21 días, 500 partidas) | Conversión, tiempo de juego, D1, clic en la miniatura | Conversión ≥ 80%, tiempo ≥ 10 min, D1 ≥ 10% (y lo elige CrazyGames) | Cumple 2 de 3, o los 3 por encima del 70% de la meta → **una** iteración de 3 semanas y nuevo básico (máximo 2 iteraciones, hasta mar-2027) | Después de 2 iteraciones: D1 < 7% o tiempo < 6 min o conversión < 60% |
| **C2 · Lanzamiento completo** | 8 semanas desde que entra (feb–may 2027) | Partidas por día, USD por mil partidas (dato real), ingreso | ≥ USD 150 por mes al 2.º mes → se abren 1946 y 1970 y se piensa en licencias | USD 30–150 → **modo pasivo**: queda publicado, solo arreglos, cero desarrollo nuevo | < USD 30 → queda publicado sin más horas |
| **C3 · ¿Steam o campaña de última milla?** | sep-2027 | Ingreso sostenido, D7, % que juega más de 1 h | ≥ USD 300 por mes 3 meses seguidos y ≥ 10% de jugadores de más de 1 h → página de Steam y Next Fest (con OK del fundador por los USD 100) | Entre USD 150 y 300 → solo actualización en el portal | < USD 150 → no se abre Steam ni celular |
| **C4 · Revisión anual** | nov-2028 | Ingreso de 12 meses, contra la curva de este documento | Por encima del medio → seguir | — | Por debajo del medio → mantener publicado sin horas; evaluar vender en Flippa si deja algo |

**Regla de corte global:** si C1 no pasa en marzo de 2027, Hub Nocturno se archiva como juego de portal (queda publicado o se baja,
sin costo) y su motor y su arte pasan a Hub Rush. Archivar no es fracasar: es el resultado esperado del 65% de los casos y se sabe
gastando casi nada.

### 5.2 Qué decide y qué hace el fundador

| Qué | Cuándo | Horas | Nota |
|---|---|---|---|
| Crear la cuenta de desarrollador de CrazyGames (gratis) y cargar los datos de cobro | antes del 10-12-2026 | 1–2 | Regla 8: es un alta con un tercero |
| Elegir el nombre: **Night Hub / Hub Nocturno** (recomendado) u otro de la lista de P6, después de la búsqueda en INPI, EUIPO y USPTO | antes del 10-12-2026 | 0,5 | Las portadas llevan solo el título |
| Aprobar la consulta legal (ronda nocturna, ganancia por ausencia, patentes de EA US8851978B1 y US9975045B2) con dos presupuestos | antes del 10-12-2026 | 2–3 | Si se quiere subir antes: lanzar el básico con la ganancia por ausencia apagada (`CONFIG.ausencia = false`) y decidir si el básico cuenta como «publicar» para la regla del 11-10-2026 (**decisión suya**) |
| Conseguir 5 personas para la prueba del primer minuto (C0) o aprobar una prueba de usuarios pagada | dic-2026 | 0,5 | Sin hablar ni explicar: solo mirar |
| Leer el tablero de cada compuerta y decidir | ene, mar, may y sep de 2027 | 0,5 cada una | Claude prepara el tablero con la recomendación |
| Aprobar Steam (USD 100) | solo si pasa C3 | 0,2 | — |

### 5.3 Lo que falta saber y cómo se consigue

| Incógnita | Cómo se resuelve | Cuándo |
|---|---|---|
| USD por mil partidas real | Tablero de CrazyGames, 2.º mes de lanzamiento completo | abr–may 2027 |
| Si el público de portales entiende el hub en un minuto | C0 y la conversión del básico | dic-2026 / ene-2027 |
| Si la miniatura convence | Clic en la miniatura contra su categoría (métrica nueva del 23-11-2026) | ene-2027 |
| Reparto computadora/celular de los jugadores | Tablero del portal | ene-2027 |
| Costo de la consulta legal y de la marca | Dos presupuestos | nov–dic 2026 |
| Si un juego que pasó por el básico de CrazyGames puede después ir a Poki | Leer los términos de los dos portales antes de decidir la exclusividad | antes de C2 |

---

## 6. Fuentes (consultadas el 15-11-2026 salvo indicación)

- CrazyGames: [Basic Launch metrics](https://docs.crazygames.com/resources/basic-launch-metrics/) · [guía de anuncios](https://docs.crazygames.com/resources/ad-monetization-guide/) · [portalready.world, básico contra completo](https://portalready.world/portals/crazygames-basic-launch-vs-full-launch/) (03-10-2026)
- Poki: [deals](https://sdk.poki.com/deals) · [web fit test](https://developers.poki.com/guide/web-fit-test) · [2026 State of Web Gaming (encargado por Poki)](https://investgame.net/news/pdf/2026-06-25-the_2026_state_of_web_gaming_report_4ee6fdc260_wp/) (jun-2026)
- Ingresos de juegos web: [Cinevva](https://app.cinevva.com/guides/web-game-monetization) (06-09-2026) · [PixelGameCraft](https://pixelgamecraft.com/blog/html5-game-income/) (17-09-2026) · [partnerkin](https://partnerkin.com/blog/stati/money-from-html5-games) (02-10-2026) · [gamezdev](https://www.gamezdev.com/how-to-earn-money-on-crazygames-i-made-400-with-a-simple-construct-3-game/) (01-04-2026) · [Exputer](https://exputer.com/?p=445036) (13-10-2026) · [Playgama, repartos](https://playgama.com/blog/?p=14181) (11-09-2026) · [Playgama, monetización](https://playgama.com/blog/2026/04/15/10-ways-to-monetize-html5-games-that-actually-work-in-2026/) (15-04-2026) · [PlayFox](https://playfox.org/news/indie-dev-revenue/) (10-11-2026)
- Audiencia: [PocketGamer.biz, estudio de CrazyGames](https://www.pocketgamer.biz/report-hypercasual-and-puzzle-games-dominate-the-browser-gaming-space/) (21-05-2026) · [The Conduit](https://news.conduit.gg/p/gen-alphas-favorite-game-store-is) (10-11-2023)
- Celular: [PocketGamer.biz, AppQuantum](https://www.pocketgamer.biz/marketing-a-new-mobile-game-where-should-studios-start/) (21-10-2026) · [GameAnalytics 2026](https://investgame.net/wp-content/uploads/2026/01/2026-01-20-Mobile_retention_benchmarks_2026.pdf) · [games.gg](https://games.gg/news/mobile-game-marketing-costs-2027/) · [AppGoblin](https://appgoblin.info/apps/com.jettoast.aero)
- Steam: [Game Dev Report](https://gamedevreport.beehiiv.com/p/19-606-steam-games-made-16b-in-2025-most-made-0-but-that-s-not-a-problem) (21-12-2025) · [WN Hub](https://wnhub.io/news/stores-and-publishing/item-49120) · [SteamPageAnalyzer](https://www.steampageanalyzer.com/blog/median-steam-game-2026) · [Raijin, Mini Airways](https://raijin.gg/app/2289650/Mini_Airways) (24-06-2026) · [Raijin, Airport CEO](https://raijin.gg/app/673610/Airport_CEO) · [SteamData](https://steamdata.ai/en-US/game/331920/airline-tycoon-deluxe)
- Discord: [PocketGamer.biz](https://www.pocketgamer.biz/discord-activities-opens-up-to-all-developers-to-make-games-on-the-platform) · [Cinevva](https://app.cinevva.com/guides/publish-game-discord-activities)
- Salidas: [Placera, Trophy Games compra Playrion](https://www.placera.se/pressmeddelanden/trophy-games-development-trophy-games-acquires-playrion-sasu-from-paradox-interactive-and-upgrades-full-year-2026-guidance-20260925) (25-09-2026) · [PocketGamer.biz](https://pocketgamer.biz/trophy-games-acquires-playrion-from-paradox) · [Trophy Games 2025](https://www.inderes.dk/en/releases/trophy-games-reports-record-year-for-2025-with-40percent-revenue-growth) · [Flippa](https://flippa.com/12230185)
- Del repositorio: `oportunidades/proyectos/P6-juegos.yaml`, `conocimiento/2026-10-17-max-aviacion-y-juegos-divertidos.md`, `apps/juegos/aviacion/README.md`, `oportunidades/proyectos/anden/radar-tecnico.md`

**Advertencia de evidencia:** casi todos los números de ingresos de juegos web son autodeclarados o de sitios que venden publicación.
Ningún dato de este documento decide capital grande; el que decide (USD por mil partidas) se reemplaza por el real en abril–mayo de 2027.
