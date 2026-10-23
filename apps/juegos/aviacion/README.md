# Hub Nocturno (nombre de trabajo) · v1 en construcción

Juego web de gestión de una red aérea, del correo de 1929 a la carga del continente. Es el producto JG4 de Carpincho Games
(`oportunidades/proyectos/P6-juegos.yaml`). Está acá de forma temporal, como Senda en el sprint 0: cuando el fundador cree el
repositorio propio de los juegos, se mueve.

**Estado (20-10-2026):** las áreas «modelo» e «interfaz» de la v1 están terminadas; falta el área «render» (la noche como
espectáculo, el hub como maqueta, aviones con personalidad, la pieza musical de 1929 y los 30 fps con 150 aviones). La interfaz v1
está descrita en «La interfaz v1» (más abajo), con lo medido en el navegador.

## Cómo se juega (v1)

- Un solo clic («Empezar») y estás jugando: 1 de noviembre de 1929, 09:00, un hangar en Buenos Aires y $ 40.000. En Buenos Aires ya
  esperan 24 sacas para Montevideo: la primera misión es esa ruta corta (206 km). Una guía de 3 pasos (se puede saltear) marca con
  una mano lo que sigue: tocar Montevideo → «Conectar con Buenos Aires» → comprar la Golondrina. El avión sale enseguida y el primer
  cobro llega a los 10 segundos de «Empezar» (ver «La interfaz v1»).
- Después de la guía, un chip arriba a la izquierda propone siempre la **mejor próxima acción**; al tocarlo selecciona el objeto y
  marca el botón que hay que tocar. Tocar una ciudad fuera de la red ofrece «Conectar con <la ciudad más cercana de tu red> · $X»;
  si ningún avión llega, el panel dice por qué ciudad hacer escala.
- Controles: tocar o hacer clic; arrastrar para mover el mapa; pellizcar (dedos o touchpad) para el zoom; dos dedos en el touchpad
  mueven el mapa; la rueda del mouse acerca y aleja. Teclado: espacio pausa, 1/2/3 cambian la velocidad (×1, ×3, ×6), + y − hacen
  zoom, las flechas mueven el mapa; Escape es solo un atajo (toda ventana tiene su botón de cierre).
- La segunda misión es el correo del sur (Buenos Aires–Bahía Blanca): con dos radios, el correo de Montevideo a Bahía Blanca cambia
  de avión en Buenos Aires y el jugador ve su hub clasificar sacas antes del minuto 3.
- **El hub es el corazón:** la red rutea solo por rutas con aviones, por la menor cantidad de escalas (y, a igual escalas, por menos
  km). Cada escala baja la demanda (correo y carga × 1/(1 + 0,5 × (tramos − 1)); pasajeros × 0,5 por conexión y nada con más de
  3 tramos) y los rodeos también (× (km directo / km recorrido)²). Lo que conecta pasa por el centro de transbordo, que tiene un
  ritmo por hora y una cola de 6 horas: lo que no entra se pierde.
- **La noche importa:** en 1929 los aviones no despegan de noche sin balizas en la ruta (las primeras, a mitad de precio). La
  primera noche cae después de que el primer avión hizo al menos 2 viajes de ida y vuelta, y avisa qué aviones se quedan en tierra.
- **El servicio paga:** el correo llega a tiempo si tarda 8 h + km/150 o menos (tarde paga el 40%); la carga, 24 h + km/300 (tarde,
  60%); los pasajeros que esperan más de 3 h se van. Un avión parado cuesta por hora y cada despegue tiene una tasa fija más una por
  tonelada. Si una ruta pasa demasiado tiempo sin un vuelo, la gente manda menos.
- **Carga mínima:** cada ruta elige si el avión sale con lo que haya, con 30% (espera hasta 2 h), 60% (hasta 4 h) o lleno (hasta
  12 h). Con la flota ajustada a la demanda, «lo que haya» quema vuelos medio vacíos y «lleno» deja el correo tarde.
- **Objetivos a la vista:** siempre 1 misión de historia y hasta 2 contratos del día, con avance («sacas 18/40») y una pista cuando
  algo lleva 200 minutos de juego sin avanzar. Las misiones miden servicio real: abrir rutas vacías o poner balizas en una ruta sin
  aviones no cumple nada.
- **Contratos del día** (linaje: los subsidios de Transport Tycoon, 1994): un tablero de 3 («N unidades de A→B en D días: $X»), al
  menos uno por el transbordo del hub; se aceptan hasta 2. Del 10 al 24 de diciembre (fecha del juego o del dispositivo) aparece el
  Correo de Navidad, que paga ×1,8.
- **Ronda nocturna** (la mecánica propia): una noche de cada tres aparece el chip «La ronda empieza a las 22:00» (nunca abre nada
  solo). Si lo tocás, se abre la vista de la noche y el tiempo va a 3 minutos de juego por segundo (unos 140 s de 22:00 a 05:00):
  subís o bajás destinos en la cinta del centro y movés la salida de cada avión de a 15 minutos, con un semáforo por avión que
  dice si llega a primera hora (antes de las 07:00), o tocás «Plan sugerido». Si no la jugás, corre el automático sin castigo.
  Cierra con medalla (bronce 70%, plata 90%, oro 100%), el % a primera hora y lo ganado contra el automático.
- **La mejor próxima acción:** el modelo sugiere siempre lo que más rinde por peso (nunca algo que pierda ni algo que deje la caja
  sin 2 vuelos). Si la historia pide algo que todavía no alcanza pero la red lo junta pronto, la sugerencia es juntar para eso.
- **Red de seguridad:** si la caja no alcanza para 2 vuelos y el neto lleva un día negativo, se sugiere vender el avión que más
  pierde; un día entero en rojo vende solo los que más pierden hasta volver a cero.
- Tres capítulos (1929 correo, 1946 pasajeros, 1970 jets y carga), 22 misiones, 7 aviones propios, 37 ciudades. Al terminar la
  historia el juego sigue con contratos y rondas con medalla.
- **La vuelta:** mientras no estás, la red trabaja de verdad hasta la mañana siguiente y, si estuviste afuera 30 minutos o más, al
  volver aparece el parte de la mañana en una sola pantalla (entregas, a tiempo, perdidas, mejor ruta, misiones, las rondas que
  corrieron en automático y la próxima meta), que se cierra con «Cobrar». Se acredita el 50% de lo que se habría ganado las
  primeras 2 h, el 20% hasta las 24 h y nada después: una noche afuera (14 h) equivale a unos 8,5 días de juego de la red.

## Cómo se corre

```bash
npx http-server -p 8080 -s -c-1 .         # o cualquier servidor estático; abrir index.html (la ronda aislada: ronda.html)
                                          # index.html?debug=1: fps, ms por paso, tamaño del guardado y eventos del SDK
npm test                                  # todas las pruebas de node (modelo, portal, interfaz), unos 75 s
npm run navegador                         # todas las pruebas de navegador (Playwright), unos 25 min; capturas: npm run navegador -- carpeta
node herramientas/destinos.mjs            # regenera crazygames.html (y las páginas del lanzamiento completo) desde index.html
node herramientas/empaquetar.mjs crazygames [carpeta]   # la carpeta que se sube (el candidato: sin js/anuncios.js)
node herramientas/jugadores.mjs --perfil literal --semilla 1   # un jugador automático, JSON con las métricas
node herramientas/diferencial.mjs         # ¿pagan los diferenciales? (6 casos)
node herramientas/balance.mjs             # curva de la historia, perfil novato, semillas 1 a 3
```

## El instrumento de medición (el fundador no juega: los números salen de acá)

Todo corre en node, sin DOM ni dependencias. Los jugadores automáticos miden economía y huecos, no diversión: solo usan las
funciones que usa la interfaz (`modelo.API_INTERFAZ`, a través de `herramientas/interfaz.mjs`) y los campos del estado que ve el
jugador; una prueba falla si un perfil importa `modelo.js` o lee algo interno. Reaccionan como una persona: cada acción tarda su
tiempo de reacción (1 a 2 s) y, si no hay nada para hacer, vuelven a mirar después de ese mismo tiempo.

| Herramienta | Qué mide |
|---|---|
| `herramientas/jugadores.mjs --perfil P --semilla N [--minutos 90]` | Una partida de un perfil. JSON con: segundos reales al primer despegue y al primer cobro (y el neto de ese viaje), minuto del primer transbordo, minutos por misión y por capítulo, hueco máximo sin novedad en la primera hora, ganancia por día a los 10, 30 y 60 min, caja mínima, misiones trabadas (5 min reales sin avance), segundos máximos sin una decisión con efecto positivo en los primeros 3 min, repago del primer avión, banco y primera ronda, contratos, aviones comprados por capítulo |
| `jugadores.mjs --novedad --semilla N` | La línea de tiempo de novedades del perfil novato en la primera hora |
| `jugadores.mjs --todos` | Los 4 perfiles, una línea JSON cada uno |
| `herramientas/diferencial.mjs [--json] [--sin-f]` | % de diferencia de neto por día en 6 casos: (a) transbordo de Buenos Aires nivel 0 contra 2 en una estrella de 5 radios; (b) las 4 cargas mínimas en 3 rutas de referencia; (c) estrella contra cadena con los mismos aviones; (d) 4 rutas sin aviones entre las puntas; (e) 10 rutas 30 días con y sin clima; (f) «listo» contra «compraTodo» a los 60 min |
| `herramientas/balance.mjs [semilla] [--perfiles a,b] [--minutos 110] [--json]` | Minutos por capítulo, historia completa, primer cobro, huecos, banco, rondas, contratos y trabadas por perfil y semilla |
| `herramientas/flota.mjs [--json]` | Por avión y ruta tipo: ganancia por día por cada $1.000, repago (días de juego y minutos reales), ocupación de equilibrio |
| `herramientas/ronda.mjs [noches]` | La ronda en la escena de referencia (6 radios de 30 sacas, centro de 40/h) en 200 noches |
| `herramientas/rendimiento.mjs` | 300 aviones en el capítulo 3: ms por paso, ms de una ausencia de 2 h, KB del guardado, guardar y restaurar contra seguir |

Los perfiles (`herramientas/perfiles.mjs`):

- **literal:** hace exactamente lo que dice el texto de la misión activa (y su pista, cuando aparece).
- **novato:** lo del literal, más comprar cuando le alcanza donde se ve carga esperando y aceptar contratos; balizas solo si una
  misión o una pista lo pide.
- **listo:** la acción más barata que hace avanzar cualquier objetivo; si no hay, la mejor próxima acción; juega la ronda con el plan
  sugerido.
- **compraTodo:** sigue la historia lo mínimo y compra el avión más grande cada vez que le alcanza.

## Balance medido (19-10-2026)

Perfil novato, juego activo a velocidad 1 (`balance.mjs`, minutos reales):

| Semilla | Capítulo 1 | Capítulo 2 | Capítulo 3 | Historia | Primer cobro | Hueco máx. 1.ª hora | Hueco máx. cap. 3 | Banco | 1.ª ronda |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 9,6 | 18,7 | 32,2 | 60,4 | 11 s | 3,3 | 3,3 | 10,0 | — |
| 2 | 9,9 | 17,8 | 30,7 | 58,3 | 11 s | 3,6 | 3,6 | 10,4 | — |
| 3 | 9,3 | 17,6 | 31,9 | 58,7 | 11 s | 3,3 | 3,3 | 9,7 | — |
| Meta | 8 a 12 | 15 a 20 | 30 a 45 | 55 a 75 | — | ≤ 5 | ≤ 6 | < 12 | < 12 |

Actualizada el 20-10-2026, con el único cambio de la interfaz en la simulación: el avión comprado sale al comienzo del paso
siguiente (5 minutos de juego antes). Con el modelo del 19-10 (control corrido el mismo día) la historia daba 68,7, 69,3 y 59,3 min;
la diferencia está en el capítulo 3 de las semillas 1 y 2, que en el control se trababan 5 minutos en «m3_contratos» y «m3_ronda» y
ahora no (sensibilidad de la partida al orden de los vuelos, no un cambio de reglas). Todas las metas siguen cumpliéndose y los 6
casos de `diferencial.mjs` dan lo mismo que antes. Las columnas «1.ª ronda» no se volvieron a medir.

- Perfil literal (semilla 1): primer despegue a los 2 s y primer cobro a los 9,5 s desde «Empezar», con neto positivo; primer
  transbordo a los 22 s; el primer avión se paga solo a los 2,0 min. En los primeros 3 minutos del novato nunca pasan más de 37 s
  sin una decisión con efecto positivo (semillas 1 a 3: 37, 20 y 2 s; meta ≤ 40).
- El literal tarda más (capítulo 1 en 11 a 12 min, capítulo 2 en 31 a 33) y se traba en «m3_ronda» (pide 85% en una noche de ronda
  y hay una ronda cada 3 noches). El listo termina la historia en 56 a 73 min. CompraTodo queda pobre (ver riesgos).
- Una noche afuera (14 h) a los 15 min de juego (ya en el capítulo 2) acredita entre 2,0 y 2,2 millones (8,5 días de la red) y
  deja un hito al alcance: se cumple mientras no estás o en el minuto y medio siguiente (semillas 1 a 3).

Diferenciales (`diferencial.mjs`, 19-10-2026):

| Caso | Resultado | Meta |
|---|---|---|
| (a) transbordo de Buenos Aires nivel 0 → 2 (promedio de 4 semillas) | +33,5% | ≥ +30% |
| (b) carga mínima: troncales BUE–MVD y BUE–ROS | 30%, 60% y lleno empatan (±2%); «lo que haya» rinde 52% y 53% menos | la mejor es 30% o 60% en 2 de 3 y la peor ≥ 15% menos |
| (b) carga mínima: ramal CRD–RGL | gana 60%; «lo que haya» y «lleno» pierden plata | |
| (c) estrella contra cadena, mismos aviones | +172% | ≥ +35% |
| (d) 4 rutas vacías entre las puntas | 0% | baja ≤ 2% |
| (e) clima en 10 rutas, 30 días | −6,5% | entre −3% y −10% |
| (f) listo contra compraTodo a los 60 min | listo 24 millones por día (capítulo 3), compraTodo 0,12 millones (capítulo 2) | ≥ +25% |

Sensibilidad de la carga mínima a la flota (exploración del 19-10-2026, 4 semillas, 8 días, neto por día de la ruta): la decisión
importa cuando la flota está ajustada a la demanda. Con flota corta todos los vuelos salen llenos y las opciones casi empatan; con
flota de más, gana esperar a llenar.

| Ruta y flota | Capacidad / demanda por hora | Lo que haya | 30% | 60% | Lleno |
|---|---|---|---|---|---|
| BUE–MVD, 2 Golondrinas | 15 / 23 | 18.893 | 21.689 | 22.980 | 22.607 |
| BUE–MVD, 3 Golondrinas | 23 / 23 | 12.455 | 22.290 | 22.103 | 21.909 |
| BUE–MVD, 6 Golondrinas | 46 / 23 | −57.115 | −26.896 | 4.840 | 18.908 |
| BUE–ROS, 3 Golondrinas | 19 / 20 | 16.172 | 33.426 | 34.971 | 34.241 |
| CRD–RGL, 2 Teros | 12,5 / 7,6 | −27.796 | −11.485 | 1.528 | −2.677 |

Rendimiento (`rendimiento.mjs`, node, 300 aviones en el capítulo 3): 0,7 ms por paso (meta ≤ 4), ausencia de 2 h en 143 ms
(meta ≤ 200), guardado de 38 KB (meta < 50), guardar y restaurar da exactamente la misma partida. Las 4 corridas de perfil con
semilla 1 y `diferencial.mjs` tardan 47 s de reloj (meta < 60).

## Flota de los capítulos 1 y 2

Cada avión declara su nicho en `js/datos.js`. Medido con `flota.mjs`: el Tero rinde 1,52 veces por cada $1.000 lo que la Golondrina
en tramos largos de correo, y el Cauquén 1,50 veces lo que el Chajá en tramos largos de pasajeros; fuera de su nicho, el chico gana.
El costo por ciclo crece con el tamaño (tasa de aterrizaje por tonelada): el Cauquén pierde plata en tramos de menos de 300 km. La
ocupación de equilibrio en el nicho queda entre 47% y 53%. Golondrina y Tero se venden en los capítulos 1 y 2 (no en el 3). Los
aviones del capítulo 3 pasan a la v1.1.

| Avión | Época y capacidad en el juego | Referencia de época |
|---|---|---|
| Golondrina | biplano de correo, 30 sacas, 180 km/h, 700 km | INFERENCIA: del tipo del Breguet 14, biplano que llevó correo en las líneas de los años 20 |
| Tero | monoplano de correo de 1929, 45 sacas, 230 km/h, 950 km | INFERENCIA: del tipo del Latécoère 28, que voló el correo sudamericano desde 1929 |
| Chajá | bimotor de 1936, 21 pasajeros y 30 sacas, 290 km/h | INFERENCIA: del tipo del Douglas DC-3 (21 asientos en su versión de línea) |
| Cauquén | cuatrimotor de posguerra, 56 pasajeros y 60 sacas, 400 km/h | INFERENCIA: del tipo del Douglas DC-4 |

Las capacidades y velocidades son valores de juego coherentes con esas referencias, no datos verificados de esos modelos (a
verificar en fuentes primarias antes de citarlos en textos del juego). Ningún avión usa el nombre ni el aspecto de un modelo real.

## Ronda nocturna: compuerta del paso 1 (19-10-2026)

La escena aislada (`ronda.html`, `js/ronda.js`) cumple las metas en 200 noches de la escena de referencia: automático 56,5% a
primera hora (meta ≤ 70%), plan sugerido 99,7% (≥ 95%), ingreso +35,1% (entre 25% y 45%), y con el centro en 120/h el automático
llega al 100% (≥ 85%).

Claude la jugó con Playwright en 1280×720 y 390×844 (capturas en el scratchpad de la sesión, carpeta `v1/modelo/capturas/ronda`):
ordenando la cinta a toques pasó de 52% a 67%, moviendo salidas de a 15 minutos llegó a 100%, y el plan sugerido también da 100%.
**Pasa en la primera iteración:** 2 tipos de control (tocar un destino para clasificarlo primero; − y + de a 15 minutos por avión)
más «Plan sugerido»; guía de 2 pasos que se puede saltear; el resultado se lee sin texto (un semáforo por avión y una medalla);
sin desborde horizontal y la última fila no queda tapada por los botones. Lo que la compuerta no mide: si un jugador casual entiende
«prioridad de la cinta» (se mide en el lanzamiento básico con la conversión y el uso de la ronda).

En el juego, el banco del hub rige solo en Buenos Aires y solo en las noches de ronda (como máximo 1 de cada 3); se habilita después
de «m1_noche» con 3 rutas iluminadas desde el hub (en el capítulo 2 todas vuelan de noche). Saltear la ronda nunca rinde menos que
el automático. Si una ronda no llega a la meta porque el centro tardaba horas en clasificar, la pista lo dice.

«La ronda del día» (`ronda.html?dia`): la misma noche para todos (la semilla es la fecha UTC), una medalla por fecha (los reintentos
no la cambian), racha en `localStorage` con try/catch y un premio chico en plata del juego, que se cobra al volver a la partida.

## Guardado y vuelta

- `localStorage` siempre con try/catch. Formato v2 compacto: colas y aviones como enteros empaquetados; el modelo guarda sus
  promedios con la misma precisión que el guardado, así que restaurar deja la partida exactamente igual. Un capítulo 3 con 300
  aviones pesa 38 KB (entra en el módulo de datos del lanzamiento completo).
- `restaurar` valida la estructura (arreglos, tipos de avión y aeropuertos conocidos, capítulo de 1 a 3, números finitos), migra de
  v1 a v2, nunca tira excepción (devuelve `{ error }`) y rechaza sin tocar los guardados de versión mayor. Probado con los 6
  guardados rotos del QA y en el navegador.
- La ganancia por ausencia se apaga con `CONFIG.ausencia = false` (por si la consulta legal lo pide) sin romper guardados.

## API del modelo para la interfaz (lo nuevo de la v1)

- Eventos de `paso()`: `despegue {avion, ruta, costo, carga}`, `aterrizaje {avion, ruta, ingreso, netoViaje, ap}`, `cobro`,
  `mision {id, premio, grande}`, `avionNuevo`, `ciudadesNuevas`, `capitulo`, `finHistoria`, `avisoNoche`, `primeraNoche {aviones}`,
  `pronostico {zona, desde, hasta}`, `tormenta`, `tormentaFin`, `ventaForzada`, `contratosNuevos`, `contrato`, `contratoVencido`,
  `bancoListo`, `rondaDisponible`, `rondaCorte`, `resultadoNoche {sacas, pctPrimeraHora, ingreso, ingresoAutomatico, medalla}`.
  Los que producen las acciones del jugador salen en el próximo `paso()` o con `tomarEventos()`.
- `sugerencia(s)`: `{tipo, id, costo, efectoDia}` o null. Tipos: `ruta` (con a y b), `avion` (con ruta), `balizas`, `transbordo`,
  `cargaMin` (con v), `contrato`, `vender` (con `seguridad` o `sobra`) y `ahorrar` (`{que, meta, falta, minutos}`: «Juntá $X para
  el Halcón»; texto `sug_ahorrar`).
- `misionesActivas(s)`: hasta 3 objetivos `{id, tipo: 'historia'|'contrato', progreso 0..1, avance, avanceTxt, pista, premio, …}`.
- `listoParaCargar(s, avionId)` (el contador «9/30»), `s.stats.ultimoVuelo`, `flujoTramo(s, rutaId)`, `indicadoresHub(s, ap)`,
  `resumenRuta(s, id)` (costo por despegue, ingreso medio por vuelo, costo por hora parado), `costoTransbordo(s, ap)`,
  `aceptarContrato`, `escenaRonda`, `fijarPrioridad`, `moverSalida`, `planSugerido`, `aplicarPlan`, `rondaEnCurso`,
  `premioRondaDelDia`, `simularAusencia` (devuelve `parte`), `historiaTerminada`.
- Al terminar el capítulo 3, `avanzarCapitulo` devuelve `{ ok: false }`: la interfaz tiene que cerrar con el evento `finHistoria`
  (texto `finHistoria`) y seguir el juego, no ofrecer un «Seguir» que no hace nada.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `js/modelo.js` | Simulación pura (sin DOM): demanda, ruteo, transbordo, aviones, plata, promesas, misiones, contratos, ronda en el hub, mejor próxima acción, ausencia y guardado |
| `js/datos.js` | Ciudades, aviones (con nicho y ventana de venta), cargas, capítulos y misiones |
| `js/ronda.js` | La ronda nocturna, pura: escena de referencia, automático, plan sugerido, controles y la ronda del día |
| `ronda.html`, `js/ronda-escena.js`, `css/ronda.css` | La ronda como escena aislada (y «La ronda del día» con `?dia`) |
| `js/render.js` | Mapa en canvas (Mercator), rutas, aviones, noche, nombres sin pisarse, textos flotantes (área «render» de la v1) |
| `index.html`, `css/estilo.css` | La página (carga en CSS en línea, barra, mapa, objetivos, panel, avisos) y el único tema de la interfaz |
| `crazygames.html`, `crazygames-completo.html`, `poki.html` | Generados desde `index.html` con `herramientas/destinos.mjs` (no se editan a mano) |
| `js/main.js` | Arranque, bucle que no muere, eventos del modelo, acciones, guardado con respaldo, vuelta, fin de capítulo |
| `js/ui.js` | Campos vivos sin reemplazar botones, acciones en `pointerup`, barra, panel (ciudad, ruta, avión, lista de rutas), avisos, ventanas, selector |
| `js/objetivos.js` | Tarjeta de misión y contratos, celebración, mejor próxima acción, guía de 3 pasos |
| `js/entrada.js` | Cámara, toque, arrastre, pellizco, touchpad, teclado, selector de ciudades cercanas, zoom hacia el área útil |
| `js/ronda-juego.js` | La ronda nocturna dentro del juego y el parte de la mañana |
| `js/portal.js` | Capa de portal del lanzamiento básico (máquina de estados, sin anuncios) |
| `js/anuncios.js` | Capa del lanzamiento completo (HN-27, v1.1): no la carga el candidato |
| `js/iconos.js`, `js/compat.js` | Íconos SVG, logo y favicon por código; compatibilidad con Safari viejo |
| `js/i18n.js` | Español e inglés (los portales piden inglés), verbos según el dispositivo |
| `js/mapa.js` | Costas y fronteras de Natural Earth 1:50m (dominio público), generado con `herramientas/extraer_mapa.mjs` |
| `herramientas/` | Jugadores automáticos y herramientas de medición (tabla de arriba) |
| `pruebas/` | 83 pruebas de node: modelo (reglas, ruteo, misiones, economía, contratos, ronda, flota, balance, guardado, instrumento), portal y anuncios, textos e interfaz |
| `pruebas/navegador/` | Pruebas de Playwright de la interfaz (clics, entrada, medidas, misiones, logística, ronda, lista del portal, jugador de pantalla) |

Peso del paquete del candidato (`herramientas/empaquetar.mjs crazygames`): 20 archivos, 420 KB sin comprimir (57 KB son el mapa), sin
dependencias ni servidor.

## La interfaz v1 (20-10-2026)

Todo se mide con Playwright en `pruebas/navegador/` (cada prueba levanta su propio servidor; `npm run navegador` las corre todas).
Los números de esta sección son del 20-10-2026.

**Entrada sin clics perdidos (HN-11).** Cada zona (barra, objetivos, chips, panel) se arma con `innerHTML` solo cuando cambia su
estructura; los valores vivos van en nodos con `data-campo` y se actualizan sin reemplazar nada. Nunca se reemplaza un botón con
un puntero apretado sobre la interfaz o con el foco de teclado adentro, y las acciones se resuelven en `pointerup` sobre el mismo
`data-accion` (el teclado llega como `click` con `detail` 0). En una ruta sin aviones, «Comprar» queda donde estaba «Conectar».

| Prueba (`pruebas/navegador/…`) | Resultado |
|---|---|
| `clics.cjs`: 60 clics de 150 ms (pausas de 0,7 a 1,3 s) sobre «Sale con 30%/60%» y 30 clics de 1,1 s sobre Comprar, con el juego a ×6 | 0 perdidos y ningún botón reemplazado mientras estaba apretado, con mouse (1280×720) y con el dedo (390×844) |
| `entrada.cjs`: touchpad | dos dedos mueven el mapa sin cambiar el zoom (±0%); una muesca de rueda acerca ×1,15 |
| `entrada.cjs`: pellizco (ctrlKey) | zoom ×exp(−deltaY × 0,01): 30 eventos de −3 dan ×2,46 (ver «Riesgos») |
| `entrada.cjs`: teclado | espacio pausa con `preventDefault`; 1/2/3 (y & é " en AZERTY) cambian la velocidad; + y − zoom; flechas mueven |
| `entrada.cjs`: ventanas | todas con cierre visible de 44 px; el foco queda adentro (Tab); Escape también cierra; la ruta nueva se cancela con un botón |
| `entrada.cjs`: selector | 400 toques al azar a menos de 20 px de Bahía Blanca en 360×640: 100% correctos; 20 toques reales: 19 o 20; con las ciudades amontonadas aparece el selector con los nombres |
| `entrada.cjs`: zoom | + y − con transición de 250 ms hacia el centro del área útil o hacia la selección (0 px de corrimiento); al redimensionar se conserva el centro |
| `medidas.cjs`: objetivos táctiles | todo control mide ≥ 44 px (≥ 48 con pantalla táctil) en 360×640, 390×844, 800×450, 960×540 y 1280×720, panel entero incluido |

**Primer contacto (HN-12).** Portada con logo y 12 palabras; un clic («Empezar»). Cámara inicial sobre Buenos Aires y Montevideo
(la primera ruta mide 206 px en 1280×720 y 125 px en 390×844) que se aleja sola cuando la misión siguiente queda fuera de la vista.
Verbos según el dispositivo (`{Toca}`: «Tocá»/«Tap» con dedo, «Hacé clic en»/«Click» con mouse). Hasta completar el primer día la
barra muestra «último vuelo: +$X» en lugar del «por día». Textos flotantes «−$X combustible» al despegar y «+$X neto» al aterrizar
(hasta 40 aviones). El cobro suena en cada aterrizaje con cobro (sin el azar del 35%; como mucho uno cada 90 ms). El chip de la mejor
próxima acción siempre dice algo: si el modelo no tiene sugerencia, recuerda la misión.

`jugador_pantalla.cjs` es un bot que solo toca lo que marcan la guía o el chip (reacción de 0,7 a 1,2 s para buscar algo nuevo y de
0,35 a 0,55 s si lo marcado quedó bajo el dedo): ver la tabla de resultados en «Medido al cierre».

**Horizontal y 16:9 primero (HN-17).** En horizontal, panel lateral de 272 px (260 en pantallas bajas) que se esconde solo cuando no
hay nada seleccionado; en vertical, hoja inferior con dos alturas (asomada 44% y completa 86%; el asa se toca o se arrastra) que
recentra la cámara si la selección quedó tapada. Un solo tema (la noche del hub, ámbar sobre azul noche), que ignora el tema del
sistema y no cambia con la hora del juego. Íconos SVG propios en `js/iconos.js`; logo y favicon dibujados por código.

| `medidas.cjs` | Resultado |
|---|---|
| Mapa visible con nada seleccionado (misión, pista, 2 contratos y chip a la vista) | 1280×720 85,0% · 960×540 76,3% · 800×450 77,7% · 640×360 68,2% · 844×390 73,6% · 390×844 74,9% (meta ≥ 65%) |
| Muesca de 47 px arriba y 34 abajo (`Emulation.setSafeAreaInsetsOverride`) en 390×844 | barra, misión y zoom debajo de la muesca; el panel arriba de la zona de abajo; nada superpuesto |
| La página nunca se agranda | después de un pellizco sobre el panel la escala sigue en 1,00; `user-select: none` (con prefijos), `touch-action: manipulation`, panel `pan-y`, `maximum-scale=1`, menú contextual cancelado |
| 12 tamaños × 2 idiomas (1920×1080, 1366×768, 1280×720, 1024×768, 960×540, 800×450, 640×360, 844×390, 768×1024, 412×915, 390×844, 360×640) | sin controles superpuestos, sin texto cortado, nada fuera de la pantalla y sin desplazamiento de la página |

Lista con la que se revisaron las capturas de los 12 tamaños (además de las comprobaciones automáticas):

1. La barra entra entera: caja, ritmo, hora y controles de velocidad y menú, sin superponerse.
2. La tarjeta de misión se lee (una línea en horizontal, dos en vertical) y la barra de avance y el número no se cortan.
3. Los contratos muestran cantidad y destino; los recortes con «…» son a propósito y el texto completo está en el título.
4. El chip de la mejor próxima acción no tapa la misión ni el zoom.
5. El panel de ruta muestra arriba el nombre, los avisos y la línea de flujo; lo de abajo se alcanza desplazando el panel.
6. Los avisos no se cruzan con la misión, la barra ni el zoom (con el panel abierto en pantallas bajas, un aviso por vez).
7. En vertical, la hoja deja ver el mapa de arriba y el zoom queda en su columna.
8. Ningún control táctil queda a menos de 48 px ni pegado al borde de la muesca.

**Capa de portal y bucle que no muere (HN-14).** `js/portal.js` es una máquina de estados pura (cargando → menú → jugando ⇄ pausa):
`gameplayStart` sale al quedar jugable (después de «Empezar» o al cerrar la ventana de vuelta) y `gameplayStop` al abrir cualquier
ventana o al pausar; como solo salen en un cambio de estado, nunca salen dos iguales seguidos; no se llama al SDK en
`visibilitychange`. `init` corre con `Promise.race` de 3 s. El locale de CrazyGames (`user.systemInfo.locale`) manda sobre
`navigator.language`, salvo que el jugador haya elegido idioma; el respaldo es inglés. El candidato no tiene anuncios ni video
simulado, y la ventana de vuelta muestra solo «Cobrar». `cuadro()` envuelve su cuerpo en try/catch y siempre agenda el próximo
cuadro; con 3 errores seguidos ofrece «Restaurar respaldo / Empezar de nuevo» (los errores de un cuadro van a `console.warn`). El
último guardado verificado (restaurado entero, como mucho una vez por minuto) queda en `hubnocturno.partida.respaldo`. Si
`localStorage` no se puede escribir, un aviso discreto lo dice. Pantalla de carga en CSS en línea con logo y progreso; la barra y el
panel aparecen recién cuando el juego está listo, y durante la portada `vis.escena = 'titulo'` (para el render).

Cómo se carga el SDK de cada portal:

| Página | Para qué | SDK | Lanzamiento |
|---|---|---|---|
| `index.html` | la web propia y las pruebas | ninguno | básico |
| `crazygames.html` | el candidato de diciembre | `https://sdk.crazygames.com/crazygames-sdk-v3.js` en el `<head>`, antes del juego | básico (`<meta name="hn-lanzamiento" content="basico">`): sin anuncios |
| `crazygames-completo.html` | v1.1, si CrazyGames lo elige para el lanzamiento completo | el mismo | completo: carga `js/anuncios.js` |
| `poki.html` | v1.1, solo si el fundador elige Poki | `https://game-cdn.poki.com/scripts/v2/poki-sdk.js` | completo |

Las cuatro se generan desde `index.html` con `herramientas/destinos.mjs` (una prueba falla si quedan desactualizadas).
`herramientas/empaquetar.mjs crazygames` arma la carpeta que se sube: 20 archivos, 420 KB, solo rutas relativas y sin
`js/anuncios.js` (CrazyGames rechaza las rutas absolutas y pide menos de 1.500 archivos: HECHO, docs.crazygames.com, 17-10-2026).

`99_lista_portal.cjs` corre con los SDK simulados (la URL del SDK se intercepta) y pasa los controles del lanzamiento básico: carga
en 0,8 s con la CPU 4 veces más lenta; `gameplayStart` recién al tocar «Empezar»; `gameplayStop`/`gameplayStart` con ventanas y
pausa; 0 eventos repetidos; nada en `visibilitychange`; arranque igual si `init` no responde (3,3 s); locale del SDK en los dos
sentidos; vuelta solo con «Cobrar» y `gameplayStart` al cerrarla; `localStorage` bloqueado con aviso; guardado que sobrevive a la
recarga; bucle que sigue con un cuadro roto y ofrece el respaldo con 3; `?debug=1`; 1280×720, 960×540, 800×450 y 640×360 sin
desplazamiento; paquete sin rutas absolutas. Los controles de anuncios se marcan «[completo]» (ver HN-27).

APIs del navegador que usa el juego y su soporte en Safari (según MDN, consultado de memoria el 20-10-2026: el entorno no tiene
WebKit, así que esta tabla reemplaza a la prueba en Safari):

| API | Safari desde | Alternativa si falta |
|---|---|---|
| Módulos ES (`type="module"`) e `import()` dinámico | 10.1 / 11.1 | no hay (Safari anterior a 11 no tiene ningún portal moderno) |
| `?.`, `??` | 13.1 | — |
| `??=` (en el modelo y el sonido) | 14 | — (Safari 13 queda afuera; es menos del 0,2% del tráfico web, INFERENCIA) |
| `Array.prototype.at`, `Object.hasOwn`, `String.prototype.replaceAll`, `Element.toggleAttribute` | 15.4 / 15.4 / 13.1 / 12 | polyfills en `js/compat.js` |
| Pointer Events y `setPointerCapture` | 13 | — |
| Pellizco del touchpad como `wheel` con `ctrlKey` | no (Safari manda `gesturestart`/`gesturechange`) | `gesturechange` con `scale` en `js/entrada.js` |
| `matchMedia('(pointer: coarse)')`, `prefers-reduced-motion` | 9 / 10.1 | — |
| `env(safe-area-inset-*)`, `viewport-fit=cover` | 11.2 | — |
| `user-select` | solo con `-webkit-` | el prefijo va en el CSS |
| `-webkit-touch-callout` | solo iOS | — |
| `touch-action` | 13 | — |
| `overscroll-behavior` | 16 | el cuerpo no se desplaza (`overflow: hidden` y la app fija) |
| `:focus-visible` | 15.4 | `js/compat.js` usa `:focus` (sin el anillo en CSS) |
| `gap` en flexbox | 14.1 | sin separación (estético) |
| `inset` | 14.1 | no se usa: `top/right/bottom/left` |
| `CSS.escape` | 10 | — |
| `Element.animate` (vuelo del premio) | 13.1 | sin vuelo: la caja se actualiza igual |
| Canvas 2D: `Path2D`, `ellipse`, `setLineDash`, gradientes | 9 o anterior | — |
| `localStorage` | siempre (en navegación privada de Safari viejo, `setItem` tira) | try/catch y aviso «no se guarda» |
| `AudioContext` | 14.1 (antes `webkitAudioContext`) | `webkitAudioContext` en `js/sonido.js` |
| `toLocaleString` con locale | 10 | — |

**Misiones, contratos y celebración (HN-13).** Tarjeta compacta armada con `misionesActivas`: la misión de historia en una línea con
barra de avance real («sacas 18/40», «$12.300 / $50.000», «falta la ruta»), hasta 2 contratos como chips (con «Aceptar» los
ofrecidos) y la pista cuando no hay avance. Tocar la tarjeta o un contrato centra el mapa en el objetivo. Misión cumplida: la
tarjeta se llena, cae un sello (escala 1,4 → 1 con rebote, en CSS), el premio vuela en arco hasta la caja y la caja cuenta hacia
arriba en 300 a 600 ms; con `prefers-reduced-motion` no hay vuelo ni rebote. Avisos en un solo carril, agrupados («3 misiones
cumplidas: +$16.000»; las ciudades nuevas, en un solo aviso). Avión desbloqueado: tarjeta de hangar con velocidad, alcance,
capacidad y precio. Fin de capítulo: resumen con sacas, pasajeros, toneladas, km, % a tiempo, la mejor ruta, un dato de época y lo
que sigue (el capítulo siguiente y su primera misión). `misiones.cjs` fuerza 3 misiones en el mismo paso en 390×844, 844×390,
800×450 y 960×540: un solo aviso, ninguna ventana encima, el sello, el vuelo, la cuenta de la caja y ningún cruce con la misión, la
barra o el zoom.

Datos de época del fin de capítulo (verificados el 20-10-2026; el juego no nombra empresas ni personas):

| Capítulo | Dato | Fuentes |
|---|---|---|
| 1 (1929-1930) | En 1930 la línea del correo aéreo del sur llegó hasta Río Gallegos. (Fecha exacta discutida: 31 de marzo según dos fuentes argentinas, abril según un trabajo del CONICET; el juego dice solo el año.) | [Wikipedia: Aeroposta Argentina](https://en.wikipedia.org/wiki/Aeroposta_Argentina), [HCDN 2228-D-2024](https://www4.hcdn.gob.ar/dependencias/dsecretaria/Periodo2024/PDF2024/TP2024/2228-D-2024.pdf), [aacademica.org](https://www.aacademica.org/000-061/972.pdf) |
| 2 (1946) | El 4 de junio de 1946 salió el primer vuelo de una aerolínea argentina hacia Europa: un hidroavión rumbo al Reino Unido. | [Billiken](https://billiken.lat/mi-pais/como-nacio-la-primera-aerolinea-internacional-de-argentina-en-1946/), [es-academic (copia de Wikipedia)](https://es-academic.com/dic.nsf/eswiki/470000) |
| 3 (1970) | El 22 de enero de 1970 voló con pasajeros el primer avión de fuselaje ancho: de Nueva York a Londres, con 335 a bordo. | [Aviation Rainbows](https://aviationrainbows.com/2020/01/22/a-50-anos-del-primer-vuelo-comercial-de-un-boeing-747-50-years-from-the-first-commercial-flight-of-a-boeing-747/), [MigFlug](https://migflug.com/jetflights/es/boeing-747-how-the-queen-of-the-skies-changed-air-travel/) |

El dato del 1 de noviembre de 1929 (Bahía Blanca–Comodoro Rivadavia) pasó de la portada a la pista de la misión «m1_sur».

**Información logística (HN-15).** Panel de ruta con los avisos que dicen qué hacer («Sobran aviones: subí la carga mínima o vendé
uno» con capacidad > 1,5 × el flujo y 2 aviones o más; «X sacas trabadas: esta ruta no tiene aviones», en rojo), una línea
«Pasan X · Ofrecés Z · Se pierden W sacas/h» con su barra (sin aviones: la demanda directa) y, detrás de «Detalle», los dos
sentidos (locales y en conexión), lo perdido por sentido, el costo por despegue, el ingreso medio por vuelo y el costo por hora
parado. Cada botón de compra muestra el efecto estimado en $/día (`estimarAvion`) y advierte cuando la capacidad ya supera el flujo,
aunque el efecto sea negativo. Vender el último avión de una ruta y cerrar una ruta piden confirmación. El aeropuerto con centro de
transbordo muestra «% a tiempo · h de atraso» y, detrás de «Detalle», ocupación, demanda perdida por día, costo por unidad y
entregas en 7 días. La lista de rutas se ordena por neto, ocupación o demanda perdida desde las 8 rutas (el orden se recalcula al
cambiar el criterio, las rutas o cada 15 s, para que no salte bajo el dedo). Ficha de avión: llegada, carga a bordo por destino,
ganancia estimada del viaje y lo que dejó desde que se compró. `logistica.cjs` lo prueba en es y en, y la lista con 36 rutas en
390×844 y 1280×720.

**Ronda nocturna y parte de la mañana (HN-16).** La compuerta de HN-08 pasó, así que la ronda entra al juego (ver «Cómo se juega»).
La vista de la noche es una fila por destino en el orden de la cinta: semáforo, sacas y vuelo, subir y bajar, la línea de 22:00 a
07:00 (clasificación, salida, vuelo y la última salida que llega a las 7) y la salida con − y +; arriba, el % previsto. La primera
ronda trae un tutorial de 2 pasos. `ronda.cjs`, en el escenario de referencia de las pruebas del modelo (capítulo 2, 4 rutas
iluminadas desde Buenos Aires con 2 aviones cada una): con el plan sugerido, 100% a primera hora (meta ≥ 90%) y la pantalla de
resultado con medalla, % e ingreso contra el automático; salteada, el resultado es idéntico al de un gemelo sin tocar y solo sale un
aviso; aceptada, el tiempo va a 2,5–3 min de juego por segundo; en 390×844, 844×390 y 800×450 todos los controles entran sin
desplazar; el parte de la mañana sale al volver de 14 h con sus 3 datos y la próxima meta y se cierra con un toque.

**Capa del lanzamiento completo (HN-27, v1.1, apagada en el candidato).** `js/anuncios.js` solo se carga en las páginas
«completo»: guardado con el módulo de datos de CrazyGames y migración desde `localStorage`; un corte solo al tocar «Ir al capítulo
N» y nunca más de uno cada 3 minutos; durante el anuncio la simulación no avanza y el audio se silencia hasta `adFinished` o
`adError`; video con premio solo con la bandera legal (`BANDERAS.videoConPremio`, apagada hasta la consulta sobre las patentes de
EA), ausencias de 30 min o más, 15 min entre ofertas, sin bloqueador y con el foco inicial en «Cobrar» (con `adError` nunca paga);
`happytime` al terminar un capítulo; Poki con `commercialBreak` y `rewardedBreak`. Lo prueban `pruebas/portal.test.mjs` y la parte
«[completo]» de `99_lista_portal.cjs`.

**Cambios mínimos en el modelo hechos desde la interfaz:** el avión comprado sale al comienzo del paso siguiente (`resta: 0`), así
el primer cobro llega medio segundo antes; `stats.km` y `stats.inicioCap` (para el resumen del capítulo); lecturas nuevas
`fichaAvion(s, id)`, `resumenCapitulo(s)` y `resumenRuta(…).directo` (lo que espera en una punta con destino en la otra, aunque la
ruta no tenga aviones); `API_INTERFAZ` suma `fichaAvion`, `resumenCapitulo`, `estimarAvion`, `idRuta`, `fijarFechaDispositivo`,
`CONFIG` y `RONDA_CADA`. Una prueba falla si la interfaz usa del modelo algo fuera de `API_INTERFAZ`.

## Propiedad intelectual (regla del holding: mecánicas de más de 20 años o propias)

| Mecánica | De dónde viene | Estado |
|---|---|---|
| Gestión de aerolínea con rutas y aviones | Aerobiz (1992), Transport Tycoon (1994), Airline Tycoon (1998) | Más de 20 años |
| Contratos del día («N unidades de A→B en D días») | Los subsidios de Transport Tycoon (1994) | Más de 20 años. No automatizan nada ni dan multiplicadores permanentes |
| Correo de Navidad (temporada con fecha real) | Eventos por fecha del calendario del dispositivo: Animal Crossing (2001) | INFERENCIA a verificar; es una variante de un contrato |
| Transbordo del hub, balizas por ruta, carga mínima, promesa por tipo de carga, capítulos históricos | Propias | — |
| **Ronda nocturna:** orden de la cinta y hora de salida de cada avión a toques, sin trazar trayectorias | Propia | **A revisar con abogado antes de publicar** |
| «La ronda del día»: el mismo desafío para todos, uno por fecha, con racha | Los pasatiempos de los diarios (el crucigrama, desde 1913) | INFERENCIA a registrar y verificar; **a revisar** junto con las patentes de EA |
| Ganancia mientras no estás | Progress Quest (2002) se juega solo, pero no está claro que avance con el programa cerrado. Candidatos con avance por reloj real mientras el juego está apagado: Seaman (1999) y Animal Crossing (2001) | **A revisar:** falta un antecedente verificado de más de 20 años de avance con el programa cerrado, y las patentes de EA sobre premios por tiempo (US8851978B1, US9975045B2). Se apaga con `CONFIG.ausencia` |
| Control de tráfico aéreo | Air Traffic Controller (1978) | Más de 20 años (no usado) |
| **Evitado:** dibujar trayectorias con el dedo | Nintendo US7637813B2 (vigente hasta 22-05-2027) y US10843074B2 (hasta 14-05-2032) | No se usa: las rutas se eligen tocando dos ciudades y la ronda se juega con botones |
| **Evitado:** gerentes que automatizan y reinicio con multiplicador | Clickers de 2013–2014 | No se usa: el automático de la ronda rige por defecto y no se compra |
| **Evitado:** estética de mapa de metro con formas | Mini Metro | No se usa: mapa geográfico real |

- Nombres: «Airline Tycoon», «Airport Tycoon» y «Airline(s) Manager» son de terceros: no se usan. «Hub Nocturno / Night Hub» y las
  alternativas están sin verificar en INPI, EUIPO y USPTO (pendiente antes de publicar; las portadas llevan solo el título).
- Aviones con nombres propios (aves del sur), arte propio dibujado por código. Mapa de dominio público.
- Antes de publicar: búsqueda profesional de libertad de operación y consulta legal (regla del 11-10-2026).

## Dato histórico del capítulo 1 (verificado el 17-10-2026)

El 1 de noviembre de 1929 salió el primer vuelo del correo aéreo de Bahía Blanca a Comodoro Rivadavia, con escalas en San Antonio
Oeste y Trelew. Fuentes: [Diario Jornada](https://www.diariojornada.com.ar/257685/magazine/a_90_anos_del_vuelo_inaugural_de_la_aeroposta),
[C5N](https://www.c5n.com/sociedad/aniversario-95-anos-el-hecho-historico-la-aviacion-argentina-que-incluye-al-escritor-el-principito-antoine-saint-exupery-n183623),
[Wikipedia](https://en.wikipedia.org/wiki/Aeroposta_Argentina). El juego no usa el nombre de la empresa histórica ni personas reales.

## Para el portal (requisitos de CrazyGames y Poki, consultados el 17-10-2026)

- Inglés obligatorio (hecho), PEGI 12 (sin violencia), anda en un Chromebook de 4 GB (canvas 2D liviano).
- Guardado en `localStorage` con try/catch (hecho); en el lanzamiento completo, el módulo de datos del SDK (el guardado pesa menos
  de 50 KB).
- Video con premio siempre opcional y con otra forma de conseguir lo mismo. El candidato del lanzamiento básico no lleva anuncios
  (ni el código: `js/anuncios.js` queda afuera del paquete).
- Teclas: nada depende de Escape (saca de la pantalla completa en el portal); las teclas se leen con `e.key` (AZERTY y QWERTZ).
- Horizontal en escritorio, `user-select: none` en el body y la zona segura de la app de CrazyGames: ver «La interfaz v1».
- Poki no permite compras dentro del juego y pide 16:9 y carga en menos de 10 s (la página carga en menos de 0,3 s en local).

## Riesgos y lo que sigue

- **«Jugar bien rinde entre 25% y 45% más que solo comprar aviones»:** la meta mínima se cumple de sobra, pero la diferencia real es
  de cientos de veces: compraTodo se empobrece (aviones de más en rutas cortas) y se traba esperando un Tero o un Cauquén que no
  junta (semilla 1: capítulo 1 en 58 min). La red de seguridad evita que quede en rojo (nunca más de 2 días seguidos), pero no lo
  saca de la pobreza; la mejor próxima acción sí le sugiere vender lo que sobra. A calibrar con los datos del lanzamiento básico.
- La misión «m3_ronda» (85% en una noche de ronda) traba al perfil literal: hay una ronda cada 3 noches (unos 7 min reales).
- Los bots miden economía y huecos, no diversión ni si se entiende la ronda: eso lo mide el lanzamiento básico.
- En el capítulo 3 los jugadores llegan a 300 a 550 aviones (Chajás baratos): el modelo rinde (0,7 ms por paso con 300), el render
  tiene que aguantar más de los 150 de la meta. Rebalancear la flota del capítulo 3 queda para la v1.1.
- **Primer cobro en el límite:** con tres toques humanos (0,7 a 1,2 s cada uno) y un vuelo de 206 km a 180 km/h (6,9 s), el primer
  cobro llega a los 10 s justos (ver «Medido al cierre»). Bajarlo con margen pide acortar el primer vuelo (velocidad de la
  Golondrina, área «modelo», con nuevo balance) o fundir «Conectar» y «Comprar» en la misión 1 (la guía tendría 2 pasos, no 3).
- **Pellizco:** el criterio pide zoom ×exp(−deltaY × 0,01) y, a la vez, que 30 eventos de −3 den entre ×1,2 y ×2; con esa fórmula dan
  ×2,46. Se dejó la fórmula, que es la escala del pellizco de Chrome (el mapa sigue a los dedos).
- **La ronda en el juego es fácil en el escenario de referencia:** el automático ya llega al 98–100% a primera hora (la promesa
  cuenta solo lo que entra en los vuelos que llegan a las 7), así que jugarla suma poco (+$605 en la prueba). En partidas con el hub
  saturado el automático baja (la misión «m3_ronda» del 85% traba al perfil literal). A medir en el lanzamiento básico con el uso
  del chip; si casi nadie la juega o no cambia nada, revisar la promesa en el área «modelo».
- La mejor próxima acción cuesta unos 8 ms con 300 aviones: se calcula cada 2,5 s en redes grandes (cada 1 s en las chicas).
- Safari no se probó en WebKit (el entorno no lo tiene): la tabla de APIs reemplaza la prueba. Antes de subir conviene abrir el
  candidato en un Safari real (Mac o iPhone).
- Sigue el área «render» de la v1, y las decisiones del fundador antes de subir (cuenta de desarrollador, nombre con búsqueda de
  marca, consulta legal sobre la ganancia por ausencia y la ronda, regla de corte, Poki o CrazyGames primero).
