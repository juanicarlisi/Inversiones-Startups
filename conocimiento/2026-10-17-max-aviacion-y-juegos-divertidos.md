# Bitácora — Claude Max, juegos de aviación y apps que divierten (17-10-2026)

> Pedido del fundador (17-10-2026, resumen sin citas): ya tiene Claude Max y quiere aprovecharlo al máximo; propone sumar un
> simulador de vuelo o de aeropuerto al estilo de los tycoon de aerolíneas, y pregunta si hay otra app más divertida para sumar;
> después pidió avanzar con todo lo que se pueda del holding.
> Datos vía buscador y páginas oficiales, consultados el 17-10-2026. Todo dato que decida capital se re-verifica en la fuente.

## 1. Claude Max: qué trae y qué cambia

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Precio | Max 5x USD 100/mes; Max 20x USD 200/mes; solo mensual | HECHO | [claude.com/pricing](https://claude.com/pricing), [ayuda](https://support.claude.com/en/articles/11049741) |
| Uso | 5x o 20x el de Pro por ventana de 5 horas, más un tope semanal para todos los modelos; las cifras exactas no se publican | HECHO | idem |
| Crédito de API | La tabla de precios muestra un crédito mensual en la plataforma de USD 100 (5x) y USD 200 (20x) | HECHO (verificar en la cuenta del fundador y sus condiciones de uso) | claude.com/pricing |
| Claude Code | Sin funciones exclusivas de Max: Max multiplica el volumen. Sesiones en la nube en paralelo sin tope documentado (comparten el límite), subagentes (hasta 20 a la vez), workflows multiagente, tareas programadas (mínimo cada 1 hora) | HECHO | [docs de Claude Code](https://code.claude.com/docs/en/feature-availability), [rutinas](https://code.claude.com/docs/en/routines) |
| claude.ai | Research, memoria, proyectos, conectores, artifacts, Claude Design, Slides y Docs, Claude en Chrome | HECHO | claude.com/pricing |
| Buenas prácticas | Darle a Claude una forma de verificar (pruebas), planificar antes de cambios grandes, un hilo por tema, medir con `/usage` | HECHO | [mejores prácticas](https://code.claude.com/docs/en/best-practices) |

**INFERENCIA (lo que cambia para el holding):**
- Max saca el cuello de botella de Claude, **no el del fundador** (6–10 h por semana). Por eso conviene adelantar lo que casi no
  pide horas suyas: código, contenido, juegos en portales y automatizaciones; lo que pide su tiempo (Posta, la compra) sigue en fecha.
- La regla de «dos motores a la vez» se refiere a horas del fundador: se mantiene. Lo nuevo son líneas de muy pocas horas
  (juegos en portales, calculadoras de Andén) que Claude puede llevar en paralelo.
- Si el crédito de API se confirma, cubre las funciones de IA en producción de los primeros meses (la entrevista de Andén, un juego
  con IA, el compañero de Senda) sin costo extra: mejora la economía de esos proyectos.
- **Cuándo pasar a 20x:** no hay criterio oficial. Medir con `/usage` durante noviembre; si en el sprint de lanzamiento de Senda
  (diciembre) se corta seguido la ventana de 5 horas o la semana, subir a 20x por ese mes y volver.

## 2. Juegos de aviación: mercado, portales y propiedad intelectual

### 2.1 Quién funciona (resumen; detalle en el informe del analista de mercado del 17-10-2026)

| Juego | Cobro | Dato | Etiqueta |
|---|---|---|---|
| Airline Manager 4 (Trophy Games) | Gratis + compras + publicidad; web, celular y Steam | Más de 100.000 jugadores por día (30-10-2025); en 2024 la publicidad fue ~10% de lo facturado | HECHO (fuente interesada) · [Inderes](https://www.inderes.se/releases/q3-financial-update-record-revenue-in-q3-backed-by-solid-fundamentals) |
| Airlines Manager (Playrion) | Gratis + compras | Paradox lo vendió a Trophy el 25-09-2026 por €2,25 M al contado + 9% de lo que facture 3 años; Playrion factura ~€4 M por año | HECHO · [Paradox](https://www.paradoxinteractive.com/media/press-releases/paradox-interactive/paradox-interactive-sells-playrion-to-trophy-games), [mobilegamer.biz](https://mobilegamer.biz/trophy-games-acquires-playrion-from-paradox-interactive-for-2-6m/) |
| Airport City (Game Insight) | Gratis + compras | 75 M de jugadores registrados (2019) | HECHO · Wikipedia |
| Airport CEO / SimAirport | Pago único (Steam) | ~178.000 y ~89.000 copias | ESTIMACIÓN de terceros (Raijin) |
| Flight Control (2009) | USD 0,99 | 3,9 M de copias en iPhone (2011) | HECHO · [PocketGamer](https://www.pocketgamer.biz/firemints-sold-3881634-copies-of-flight-control-on-iphone/) |
| Mini Metro / Mini Motorways | Pago único | Más de 7 M de copias (2021) | HECHO (fuente interesada) |
| GeoFS, Infinite Flight | Navegador gratis + suscripción; celular USD 9,99/mes | — | HECHO |

**En los portales (17-10-2026):** CrazyGames tiene *Airline Tycoon Idle* (36.000 «me gusta») e *Idle Airport Tycoon* (47.000),
ambos sin carga; Poki tiene juegos de aeropuerto y un control de tráfico aéreo (4,3 sobre 5.086 votos). **No apareció ninguno de
carga aérea ni con hub, conexiones o slots** (HECHO, limitado a las páginas revisadas). Los portales no publican partidas por juego.

**Requisitos de los portales:** CrazyGames pide inglés, PEGI 12, que ande en un Chromebook de 4 GB, publicidad cada 3 minutos como
máximo y video con premio siempre opcional; el lanzamiento básico no paga pero mide gratis. Poki elige a mano, exige exclusividad
web, no permite compras y pide carga en menos de 10 segundos ([docs CrazyGames](https://docs.crazygames.com/requirements/technical/),
[Poki](https://developers.poki.com/guide/requirements-quality)).

### 2.2 Propiedad intelectual

- **Marcas:** el original *Airline Tycoon* es de Spellbound (1998); Kalypso compró los derechos de *Airline Tycoon II* en 2009; hoy
  la edición Deluxe la publican Black Forest Games y THQ Nordic (Embracer). «Tycoon» convive en muchas marcas de distintos dueños.
  No se usan «Airline Tycoon», «Airport Tycoon» ni «Airline(s) Manager». Búsqueda en EUIPO, DPMA y USPTO pendiente (sitios bloqueados).
- **Patentes vigentes a evitar:** Nintendo US7637813B2 (personaje que sigue un trazo dibujado, hasta 22-05-2027) y US10843074B2
  (hasta 14-05-2032): **no se dibujan trayectorias**. Revisar EA US8851978B1 y US9975045B2 (premios por tiempo) antes de publicar
  la ganancia por ausencia ([Google Patents](https://patents.google.com/patent/US7637813B2/en)).
- **Linaje de mecánicas:** control de tráfico aéreo (1978), Railroad Tycoon (1990), Aerobiz (1992), Transport Tycoon (1994),
  Airline Tycoon (1998), Airport Tycoon (2000), idle (Progress Quest, 2002): más de 20 años. Dibujar trayectorias (2009), Pocket Planes
  (2012), clicker con gerentes y reinicio (2013) y red minimalista (Mini Metro, 2015): menos de 20 años, no se usan.

### 2.3 La familia y el veredicto (así no → mejor así)

| Familia | Demanda probada | Costo | Riesgo PI | Veredicto |
|---|---|---|---|---|
| Simulador de vuelo | Nichos con 3D, física y licencias de imágenes satelitales | Alto | Bajo | **Así no**: choca con «costo mínimo de servidores» y no tiene diferencial |
| Control de tráfico aéreo | Media; celular saturado | Muy bajo | Alto si se dibujan trayectorias | Solo como ronda dentro del juego, asignando pistas y turnos |
| Aeropuerto tycoon (terminal) | Media en portales | Alto si se quiere profundidad | Bajo | Como capa de mejoras (el centro de transbordo) |
| Red minimalista de rutas | Alta en tiendas | Medio | Mecánica de 2015 | Esperar |
| **Idle de aerolínea con carga y hub** | Alta en portales y fuera | Bajo, 2D | Bajo con las exclusiones de arriba | **Mejor así**: es el que se construyó |

**Diferencial (INFERENCIA):** lo que nadie hace en los portales es la logística de verdad: el hub y su transbordo, la noche (balizas en
1929, el corte nocturno de la carga después), la carga mínima contra la puntualidad. Es el saber del fundador hecho juego, y comparte
motor con el tycoon de última milla que ya estaba en el plan (se fusionan: la última milla pasa a ser la segunda campaña).

**Salida posible (INFERENCIA):** Trophy Games compra juegos de aerolíneas que funcionan (pagó ~0,56 veces la facturación anual al
contado por Playrion). Un juego que retenga tiene comprador natural.

### 2.4 Lo construido hoy

Prototipo jugable **Hub Nocturno** (nombre de trabajo) en `apps/juegos/aviacion/`: tres capítulos (1929 correo, 1946 pasajeros,
1970 jets y carga), 37 ciudades sobre el mapa de Natural Earth (dominio público), 7 aviones con nombres propios, transbordo en el hub,
balizas, carga mínima, tormentas, ganancia por ausencia, español e inglés, guardado; 6 pruebas del modelo y un jugador automático
que mide el balance (capítulo 1 en ~11 minutos). Dato histórico del capítulo 1 verificado: el 1-11-1929 salió el primer correo aéreo
Bahía Blanca–Comodoro Rivadavia con escalas en San Antonio Oeste y Trelew ([Diario Jornada](https://www.diariojornada.com.ar/257685/magazine/a_90_anos_del_vuelo_inaugural_de_la_aeroposta)).

## 3. Apps y juegos que divierten (barrido del 17-10-2026)

Lo que muestra el barrido (INFERENCIA con base en los casos): a los éxitos chicos de 2025–2026 los trajeron streamers, clips y grupos
de amigos, no la publicidad; la IA rinde cuando **es la mecánica** (rival, narrador o juez) y no cuando rellena; hay rechazo a lo
«hecho con IA» como relleno ([Caixin](https://www.caixinglobal.com/2026-08-20/cx-daily-game-studios-have-bought-into-ai-but-players-still-arent-sold-102475820.html), 20-08-2026).

| # | Candidato | Evidencia (HECHO) | Servidor | Encaje con el holding | Veredicto |
|---|---|---|---|---|---|
| 1 | **Plataformas con trampas, tema burocracia** («Trámite Imposible») | *Level Devil*, de un solo desarrollador: 3,6 M de «me gusta» en Poki y #12 en tendencias ([Poki](https://poki.com/en/g/level-devil), 17-10-2026) | Ninguno | Alto: portal, sin cara, humor universal latino, género de más de 20 años | **Al plan** (P6, mar-2027) |
| 2 | **Convencer a un personaje con IA** | *Gandalf* (Lakera): 4 M de intentos y 18 M de mensajes ([Destructoid](https://www.destructoid.com/players-have-tried-to-crack-security-companys-password-game-over-4-million-times/)) | Una función + API (~USD 0,002 por partida, ESTIMACIÓN) | Medio. **Así no:** el patovica del boliche (no va con la marca ni con la comunidad del fundador). **Mejor así:** «Convencé al de la ventanilla», el empleado público que nunca tiene el sello; comparte universo con el #1 y es la prueba barata del personaje del Truco (N9) | **Experimento de 1 semana** (regla de corte abajo) |
| 3 | Juego de grupo con IA («¿Sobrevivís?») | *Death by AI*: casi 7 M de usuarios en semanas como Discord Activity, 70% de sesiones con más de 3 amigos ([Discord](https://discord.com/build-case-studies/playroom)) | Salas por turnos | Medio; mecánica de 2024 (pide consulta legal) | Backlog, después del #2 |
| 4 | Dibujá contra la IA | Gartic Phone ~9,5 M de visitas; *Quick, Draw!* 50 M de dibujos con licencia CC BY 4.0 | Ninguno (modelo en el teléfono) | Medio-alto; Pictionary es de 1985 | Backlog |
| 5 | Juego diario compartible (ya en reserva) | En LinkedIn, el 86% de los que juegan vuelve al día siguiente ([Social Media Today](https://www.socialmediatoday.com/news/linkedin-adds-zip-puzzle-game/742847/)) | Ninguno | Alto | Sigue en reserva; el dato lo refuerza |
| — | Combinar cosas con IA (tipo *Infinite Craft*) | ~1.000 creaciones por segundo en su pico (2024) | Bajo | Mecánica de 2010 | Radar (consulta legal antes) |
| — | App tipo Locket | 80 M de descargas, rentable ([TechCrunch](https://techcrunch.com/2025/08/06/photo-sharing-app-locket-is-banking-on-a-new-celebrity-focused-feature-to-fuel-its-growth)) | — | Ya tiene dueño | **Así no** → el widget del desafío del día de Senda (N15) |
| — | Puzzles de flechas | Los dos primeros gastaron más de USD 9 M en publicidad en EE.UU. en abril de 2026 ([Gamigion](https://www.gamigion.com/?p=33473)) | — | Éxito comprado | **Así no** → ya lo cubre Hub Rush |
| — | Cooperativo en Steam para 4 amigos | *Meccha Chameleon*: 2 personas, 20 M de copias en dos meses (prensa, ago-2026) | Red de Epic | 3D, meses de trabajo | Solo si pega un juego web |

**Las 6 condiciones de los virales** (doctrina 08 §3): el #2 las cumple todas (se explica en 4 palabras, el resultado se comparte
—«entré en 4 mensajes»—, la ventana es la IA de 2026, invita a otros, hay un personaje nuevo cada día, se construye en días); el #1
cumple 3 de 6 (no tiene resultado para mostrar ni cita: su difusión es el portal y los clips).

**Experimento «Convencé al de la ventanilla» (diseñado, no lanzado):** una semana de construcción; web propia y Discord (no portal
hasta que publiquen su política sobre IA); filtros de contenido y marca separada de Senda. **Regla de corte:** si en 4 semanas menos
del 5% comparte su resultado o la partida cuesta más de USD 0,005, se archiva. Necesita una función en la nube y una clave de API:
lo aprueba el fundador.

## 4. Señales nuevas (para `radar/senales.md`)

- SEN-2026-10-01 · Trophy Games consolida juegos de aerolíneas (compró Playrion el 25-09-2026): comprador natural de un juego que retenga.
- SEN-2026-10-02 · La IA como mecánica de juego: *Death by AI* llegó a ~7 M de usuarios; un modelo liviano cuesta USD 0,10/0,40 por
  millón de tokens (Gemini 2.5 Flash-Lite, [precios](https://ai.google.dev/gemini-api/docs/pricing), 17-10-2026).
- SEN-2026-10-03 · Rechazo de los jugadores al contenido «hecho con IA» como relleno: el arte y la música propios pesan más.
- SEN-2026-10-04 · Juegos de un solo desarrollador siguen arriba en Poki (*Level Devil*): el portal sigue siendo un canal sin pagar.
- SEN-2026-10-05 · Claude Max incluye crédito de API mensual (según la página de precios): baja el costo de las funciones de IA.

## 5. Fuentes de los informes de los agentes

Informes del 17-10-2026 del analista de mercado (aviación, 25 fuentes), del explorador (apps divertidas, ~35 búsquedas) y de la guía
de Claude Code (Max, 14 páginas oficiales). Las URL principales están citadas arriba. Límites: no se pudieron abrir el informe anual
2024 de Trophy, los registros de EUIPO y Justia, SteamDB ni developers.reddit.com.
