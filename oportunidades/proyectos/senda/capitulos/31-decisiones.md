# Decisiones y los próximos 30 días

<div class="enpocas" markdown="1">
**En pocas palabras.** El 05-10-2026 tomaste las 16 decisiones. La principal: **no hay validación previa**; se empieza a
desarrollar ya y se valida con la app en uso. El desarrollo arrancó el mismo día (sprint 0, con una vista previa que se abre desde
el celular). Quedan pocas cosas abiertas y casi todas son gratis; lo que cuesta plata (Google Play, la licencia de la RVR1960, Claude
Max) tiene fecha y monto, y se aprueba antes.
</div>

## 1. Lo que decidiste (05-10-2026)

| # | Decisión | Lo que quedó |
|---|---|---|
| 1 | **Nombre de la app** | **Senda**. Verificaciones en curso (sección 3) |
| 2 | **Validación con jóvenes** | **No por ahora**: el proyecto es el punto de partida; se valida y ajusta con la app en uso |
| 3 | **Lani v2** | Aprobado el diseño de dirección |
| 4 | **Paleta** | **B (ámbar + índigo)**; se ajusta más adelante con datos |
| 5 | **Las 6 categorías y piezas de Espadeo** | Aprobadas |
| 6 | **Nombres de juegos** | Aprobados |
| 7 | **Presupuesto** | Aprobado el diseño del menú de calidad; se buscará un presupuesto más ajustado antes de gastar |
| 8 | **Claude Max** | **Desde diciembre** (noviembre no). Octubre y noviembre con Pro |
| 9 | **Biblias** | Arrancar con las libres; ver a fondo la RVR1960 sin licencia (resultado en el capítulo {{cap:07}}: no conviene) |
| 10 | **Planes y precios** | Aprobados por ahora |
| 11 | **Anuncio corto al terminar partidas** | **Uno al terminar cada partida** (precisado en la segunda tanda); se ajusta con datos |
| 12 | **Vidas** | **3 gratis, 1 por hora**; repasar **no** devuelve vidas por ahora |
| 13 | **Revisores doctrinales** | 2 personas de tu comunidad |
| 14 | **Línea editorial** | La del capítulo {{cap:23}}, por ahora |
| 15 | **Cuentas** | Personal ahora; tiendas en noviembre o diciembre |
| 16 | **Idioma de la interfaz** | Español neutro con «tú» |

Además, sumaste el **diseño emocional** como parte del proyecto: está en el capítulo {{cap:20}} y ya se aplica en la app.

**Segunda tanda (05-10-2026, después de probar la vista previa del sprint 0):**

| Tema | Lo que pediste | Lo que quedó |
|---|---|---|
| Repositorio de la app | Creado | El código vive en `juanicarlisi/senda-app`; se borró la copia temporal de este repositorio |
| Expo y la red | Que Claude haga todo lo posible | **No hace falta cuenta de Expo ni tocar la red:** el APK de prueba lo arma GitHub Actions (gratis) y queda en Releases |
| Anuncios | Uno al terminar cada partida | Aplicado (simulado en la prueba; nunca en la Biblia ni en las lecciones) |
| Temas | Elegir entre los diseños del proyecto | **5 temas** (las paletas A, B y C + Clásico claro y Medianoche) y 3 papeles para la Biblia (capítulo {{cap:19}}, sección 18) |
| Ajustes | Lo que suelen tener las apps | Pantalla de **Perfil y ajustes** desde el avatar: tema, letra, sonido, vibración, animaciones, idioma, privacidad, créditos… |
| Navegación | Benchmark: ¿íconos abajo o menú arriba? | **Recomendación: la barra de abajo** (evidencia en el capítulo {{cap:19}}, sección 17). A confirmar por vos |
| Animaciones y sonidos | Todo lo del proyecto, punto por punto | Sprint 1: 36 sonidos propios y los momentos de los capítulos 19 y 20; matriz de lo hecho y lo que falta en la app (`docs/DISENO_EMOCIONAL.md`) |
| Más versiones de la Biblia | Todas las libres protestantes | Se sumó la **Nueva Biblia Viva** (Biblica). Las demás libres se descartaron con su razón (capítulo {{cap:07}}); la RVG necesita permiso (borrador listo) |
| RVR1960 más barata | Si hay algo más barato que ~USD 39 | **No hay vía legal más barata.** Mientras tanto: enlace a la RVR1960 en Bible.com y pedido de precio de ministerio (borradores listos) |
| Lectura «como papel» | Marcador, hojas que se pasan con el dedo | **Lector de papel**: hojas que giran sobre el lomo, 3 cintas de raso, resaltadores, notas, canto dorado, voz |

**Tercera tanda (05-10-2026, después de probar el sprint 1):**

| Tema | Lo que dijiste | Lo que quedó |
|---|---|---|
| Navegación | La barra de abajo, muy bien | **Confirmada** |
| Enlace a la RVR1960 en Bible.com | Dejarlo por ahora | **Confirmado** (la única salida de la app, hasta tener la licencia) |
| Versiones de la Biblia | Solo protestantes (NTV, TLA, DHH, NVI, LBLA…) | Pedidos de licencia listos para cada titular: SBU (RVR1960, DHH, TLA, RVC), Tyndale (NTV), Biblica (NVI) y Lockman (LBLA, NBLA); se envían desde un correo del proyecto (capítulo {{cap:07}} y Consola) |
| Paso de hoja | Se veía muy feo | **Rehecho:** la hoja se dobla siguiendo el dedo, con el dorso del papel y su sombra; la elección «pasar hojas o deslizar» sigue en Ajustes |
| Sonidos | Algunos baratos, tardíos o cansadores | Motor sin demoras; sin sonido en botones y pestañas; **Sala de sonidos** en la Consola para elegir entre los propios y bancos libres (Kenney y Freesound, CC0) |
| «Pausa con Lani» | Parecía meditación oriental: se va | **Reemplazada por «Antes de leer»:** invitación breve a orar con el Salmo 119:18, una vez por día, desactivable |
| Jugar y Travesía | Menos tiesos | Ruleta con física, carta de categoría, opciones en cascada, Lani que reacciona; mapa que se dibuja, globo para empezar, Lani que camina |
| Voz que lee | Fea y con acento de España | Elige sola la mejor voz latinoamericana y natural del teléfono; selector en Ajustes; muestras de voces neuronales libres para elegir la definitiva |
| Biblia al marcar versículos | Corta y tosca | Varios versículos a la vez, barra de acciones animada, resaltador que pinta, versículo que «respira» mientras se escucha |
| Gobierno de la app | ¿Desde dónde se gobierna todo? | **Consola de Senda** (capítulo {{cap:32}}): proyecto, contenido, propuestas, sonidos, licencias y métricas; el contenido pasó a ser datos con verificación automática |

**Cuarta tanda (05-10-2026, después de probar el APK de la prueba 2):**

| Tema | Lo que dijiste | Lo que quedó |
|---|---|---|
| Sonidos que no paraban | En el teléfono, la hoja y el «correcto» sonaban sin fin, aun fuera de la app | **Arreglado (prueba 3):** en Android, rebobinar un sonido terminado lo hacía sonar otra vez; ahora se pausa antes de rebobinar, un guardián corta cualquier efecto largo y todo se calla al salir de la app |
| Biblia de papel | Texto «pegado» sobre un papel que parecía sucio | **Rehecha como Biblia impresa:** renglones parejos, justificado con guiones, capitular, versalitas, una o dos columnas, hojas llenas hasta abajo con versículos partidos entre hojas, titulillo, texto del dorso que se transparenta, papel biblia sin manchas (capítulo {{cap:07}}) |
| Elegir sonidos | No se podía (estaban rotos) | **Los elegí yo** de bancos libres (CC0): cortos y limpios; cambiar alguno es opcional |
| Voz | La de Samsung «es-US-SMTl01» es la mejor | La app la prefiere sola |
| Trivia | Demasiado fácil; que alterne | **Dificultad que alterna** (capítulo {{cap:09}}, sección 15): 5 niveles, habilidad por categoría estilo Elo, ola de la partida, rescate, preguntas de oro; 127 preguntas |
| Correos de licencias | No sabía cómo; correo appsenda.ok@gmail.com | Botones que abren cada correo ya escrito en Gmail desde ese correo; formularios con «Copiar» por dato; contactos de ABS y Tyndale corregidos |
| Supabase y PostHog | Explicar paso a paso | Pasos en la Consola; las claves van como secretos de GitHub (nunca por el chat); la app y las tablas ya están listas para conectarse |
| Presupuesto | ¿Por qué un diseñador de interfaz si lo hace Claude? | **Tenías razón:** lo hago yo. Presupuesto **mínimo recomendado del primer año: USD 55** (Google Play + IA para traducciones); lo profesional queda como opción (capítulo {{cap:29}}) |
| Lo próximo | Avanzar | Planes de lectura (5), protector de racha, métricas anónimas y base de datos listas (prueba 4) |

**Quinta tanda (06-10-2026, después de probar el APK de la prueba 4):**

| Tema | Lo que dijiste | Lo que quedó |
|---|---|---|
| Biblia cortada abajo y trabada | La hoja salía cortada abajo y se trababa al usarla | **Arreglado (prueba 5):** la letra del sistema (Samsung la agranda) ahora entra en la grilla y ya no corta la hoja; las hojas vecinas quedan precargadas y el gesto ya no vuelve a armar el texto |
| Salmos desde el plan | Salía el Salmo 1 y al dar vuelta solo «Terminar capítulo» | «Terminé» ocupa dos renglones y entra debajo del Salmo 1; con un plan dice «Terminé · sigue Salmos 2», pasa solo y la cabecera muestra «día 1 · 2 de 8» |
| Ruleta y festejo | La ruleta sonaba fea; al ganar una pieza no había festejo | **Firma sonora propia** (capítulo {{cap:19}}, sección 8): la ruleta con clics reales y una nota por categoría; festejo de pieza a pantalla entera (cae, golpea al compás, rayos de su color, lluvia de luz, encastre en la armadura) |
| Benchmark de Preguntados y otras | Investigar lo mejor de su mejor época, sin imitar | Lo que tomamos: la consigna simple, la ruleta como anticipación, coleccionar las 6 piezas, el audio que sube la concentración (Kahoot), la campanita breve del acierto (Duolingo); lo que evitamos: los límites que cortan la sesión y los anuncios invasivos (las quejas de Trivia Crack 2) |
| Calendario | Eventos propios; grupos con roles; video, fotos, recordatorios, fechas tope | **Mi calendario hecho** (capítulo {{cap:13}}): eventos con foto, lugar o Meet, repetición, fechas tope y avisos reales; **grupos con roles** (líder, coordinador, miembro) y agenda compartida en febrero de 2027 (sección 3b) |
| Juego de carrera con Lani | Algo tipo Subway Surfers con el espíritu de Senda | **Lani corre** (capítulo {{cap:10}}, sección 10): historias bíblicas como niveles, la armadura como poderes, el versículo por partes; un nivel de prueba en el segundo trimestre de 2027 con regla de corte |
| Supabase y PostHog | Listos (token sin vencimiento y con todos los permisos) | Tablas aplicadas desde GitHub; la app manda respuestas anónimas y votos del Pulso y lee resultados reales; PostHog activo. El token funciona; conviene cambiarlo por uno que venza en un año (opcional) |
| Licencias | Mandaste los dos correos; los formularios te trabaron | Marcados como enviados. **Formularios, más adelante:** Biblica no licencia apps en desarrollo ni a personas, y Lockman pide dirección postal. Cada campo quedó listo en la Consola |

**Sexta tanda (06-10-2026, después de probar el APK de la prueba 5):**

| Tema | Lo que dijiste | Lo que quedó |
|---|---|---|
| Vuelta de hoja lenta | Pasar la hoja de la Biblia es lento y se traba | **Rehecha (prueba 6):** el gesto y la animación corren en el hilo nativo (Reanimated y Gesture Handler), las hojas no se vuelven a dibujar al pasar y el lector escucha solo lo que usa |
| Sonidos | Faltan, llegan tarde, se cuelgan; la ruleta y la corona mudas; muy pocos y algunos baratos | **Motor de audio nuevo** (un solo contexto de audio, voces superpuestas, clics de la ruleta agendados con la animación) e **instrumentos grabados** (VCSL, CC0: marimba, campanas de mano, glockenspiel, campanas tubulares, aplausos…). Sonidos nuevos: corona, carga, luz, opciones en cascada, toques, pestañas, hojas, guardado, umbral y aviso. Detalle en el capítulo {{cap:19}}, sección 8 |
| Animaciones | Muy buenas, seguir evolucionando | Se suman el mapa que se dibuja solo, los alfileres, Pablo y la cascada de opciones con su nota |
| Calendario | Vista semanal como Google; la notificación es fea | **Vista semanal por horas** y **avisos nuevos** (ícono nítido, color del tipo, texto sin repetir, sonido propio, botón para probar). Capítulo {{cap:13}} |
| Tipo Kahoot | Enlace, vidas, video, para líderes; armar preguntas o subir un PDF; no una réplica | Registrado en Senda Reunión (capítulo {{cap:12}}): enlace/código/QR, modos con vidas de la reunión, bloques de video y **preguntas propuestas desde el PDF del líder, que él aprueba** (cambio de decisión: antes Senda no leía el bosquejo) |
| Frases al abrir la Biblia | Cada tanto, como «leer la Biblia es como escuchar a Dios», configurable | **Hecho:** el «umbral», 18 frases, 35 % de las veces y como mucho una cada 18 horas; se editan, se proponen y se ajustan desde la Consola |
| Travesía | Exhaustiva y MECE, sin inclinaciones, con resumen al final; Pablo y sus viajes con imágenes | **Mapa completo** de 8 áreas y 56 rutas (capítulo {{cap:08}}, sección 7), guardas doctrinales ampliadas, **Los viajes de Pablo** jugable con mapa real y Pablo de guía, y **Lo que aprendiste** al final de cada lección |
| Escala | Preparada para millones, sincronización perfecta, sin cuelgues | Bandeja de salida persistente e idempotente, resúmenes que no recorren millones de filas (migración aplicada) y el plan por etapas en `docs/ESCALA.md` (capítulo {{cap:25}}, sección 10) |
| Juegos nuevos (evolutivos) | Juegos de mesa y de consola llevados a la Biblia; algo tipo Mario Party; juegos de campamento | Registrados con benchmark y regla de corte en el capítulo {{cap:10}} (secciones 11 a 13): El arca, Jericó, Nehemías, José, David, Los viajes de Pablo de mesa, Babel; **Senda Fiesta** (tablero, dado, coronas, un minijuego por ronda); esgrima bíblica, rally, lotería y más para el modo campamento |

## 2. Cómo seguimos: el desarrollo

| Qué | Cómo |
|---|---|
| **Dónde vive el código** | En su repositorio propio, `juanicarlisi/senda-app` (privado), separado del holding |
| **Cómo probás** | Cada sprint publica una **vista previa web** privada que abrís desde el celular, y un **APK de prueba para Android** que arma GitHub Actions y queda en la pestaña Releases del repositorio (sin cuenta de Expo, sin costo) |
| **Ritmo** | Un sprint cada dos semanas; vos probás 30 minutos y decidís qué sigue |
| **Gastos** | Nada hasta noviembre. Después, solo lo imprescindible y con tu aprobación: Google Play (USD 25, una vez), RVR1960 por API.Bible (~USD 39 por mes, opcional), Claude Max (desde diciembre). Mínimo recomendado del primer año en gastos únicos: USD 55 |

**Plan de sprints hasta el lanzamiento** (detalle en el repositorio de la app, `docs/SPRINTS.md`):

| Sprint | Fechas | Qué sale |
|---|---|---|
| 0 | 5–11 oct | Base de la app, sistema de diseño, Inicio, Biblia con 3 versiones libres, una lección, Espadeo de práctica, semana Senda. **Hecho** |
| 1 | 12–25 oct | **Hecho el 5-oct (pruebas 1 a 4):** temas y Ajustes, lector de Biblia impresa, búsqueda, notas, cintas, voz, Nueva Biblia Viva, racha con Día libre, Protector e hitos, bienvenida, «¡Volviste!», sonidos libres, «Antes de leer», planes de lectura, dificultad del Espadeo. **Falta:** recordatorio real (pasa al sprint 2) |
| 2 | 26 oct – 8 nov | Motor de la Travesía con las secciones 0 a 2, repaso, misiones y cofres, cuentas y sincronización (Supabase gratis) |
| 3 | 9–22 nov | Espadeo real: duelos por turnos con amigos y con Lani, 6 comodines, Armería, banco de preguntas grande; tarjetas para compartir |
| 4 | 23 nov – 6 dic | Calendario completo, Giro diario, Desafío del día, Tu Lani, pulido, accesibilidad; **prueba cerrada en Google Play** |
| Lanzamiento | 7–18 dic | Correcciones, fichas de tienda, publicación gradual el **18-12-2026** |

## 3. Lo que queda abierto

| # | Tema | Recomendación | Hasta cuándo |
|---|---|---|---|
| 1 | ~~Crear el repositorio de la app~~ | **Hecho** el 05-10-2026 | — |
| 2 | **Verificar el nombre** | Buscar «Senda» en el INPI (clases 9, 41 y 42), en las tiendas y en redes; ver dominios. Ojo con **Chile**: allí SENDA es el servicio estatal de prevención de drogas y alcohol (sección 4) | 15-10-2026 |
| 3 | ~~Cuenta de Expo y red del entorno~~ | **Ya no hace falta:** el APK se arma con GitHub Actions | — |
| 3b | **Navegación** | Confirmar la barra de abajo (recomendado) o pedir una variante con menú arriba para comparar | Con la próxima prueba |
| 3c | **Enlace a la RVR1960 en Bible.com** | Es la única salida de la app (el proyecto pedía que todo pase adentro). Recomendación: dejarlo hasta tener la licencia | Con la próxima prueba |
| 4 | **Cuenta de Google Play** (USD 25) | Abrirla **a más tardar el 15-11**: las cuentas personales nuevas necesitan 12 testers durante 14 días antes de publicar | 15-11-2026 |
| 5 | **RVR1960 y RVG** | Revisar y enviar los pedidos ya redactados (`borradores/`): precio de ministerio de la RVR1960 (American Bible Society y Sociedad Bíblica Argentina) y permiso de la Reina Valera Gómez. Decidir si se paga API.Bible para el lanzamiento o desde marzo | Pedido: oct; pago: dic o mar |
| 6 | **Cuenta de Apple** (USD 99 por año) | Si querés iOS el 18-12, abrirla a principios de diciembre; si no, iOS en enero o febrero | 01-12-2026 |
| 7 | **Identificador de la app en las tiendas** | Hoy es provisorio (`com.sendaapp.biblia`); no se puede cambiar después de la primera publicación | Antes de la prueba cerrada |

## 4. Verificación del nombre (lo que se pudo hacer desde acá)

- **Tiendas:** en la búsqueda del 05-10-2026 no apareció ninguna app cristiana llamada «Senda». Hay una app de transporte en EE.UU.
  («SendaRide»), de otra categoría.
- **Chile:** «SENDA» es la sigla del **Servicio Nacional para la Prevención y Rehabilitación del Consumo de Drogas y Alcohol**
  (creado por la Ley 20.502, en funciones desde 2011), muy conocido allí («SENDA Previene»). **No impide usar el nombre**, pero en
  Chile puede generar asociaciones y una oposición si se registra la marca allí. Mitigación: el nombre en tienda va siempre con su
  bajada («Senda: la Biblia jugando»), el logotipo en minúsculas con la lámpara y, antes de invertir en Chile, consulta en el INAPI.
- **INPI, dominios y redes:** la red de este entorno bloquea esas consultas. Lista para hacerlo en 15 minutos: INPI → consulta de
  marcas («SENDA», clases 9, 41 y 42); NIC Argentina (`senda.com.ar`); un registrador para `.app` o `.com` (probables alternativas:
  `sendaapp.com`, `jugasenda.com`); usuarios en Instagram, TikTok y YouTube (`@senda.app`, `@sendaapp`).

## 5. Los próximos 30 días (del 5 de octubre al 4 de noviembre de 2026)

### Vos

- [x] Abrir la vista previa del sprint 0 en el celular y contarme qué te gusta y qué no.
- [x] Crear el repositorio `senda-app` y darle acceso a Claude.
- [ ] Probar la vista previa del sprint 1 (temas, Ajustes, lector de papel, sonidos) y, si tenés Android, instalar el APK de prueba.
- [ ] Confirmar la navegación (barra de abajo) y el enlace a la RVR1960.
- [ ] Verificar el nombre con la lista de la sección 4; reservar los usuarios de redes (gratis).
- [ ] Elegir 2 revisores doctrinales y anotar 12 testers con Android (para la prueba cerrada de noviembre).
- [ ] Revisar y decidir el envío de los pedidos de licencia (RVR1960 y RVG) y desde qué correo.

### Claude

- [x] Sprint 1 (lo principal), con vista previa y APK de prueba.
- [ ] Lo que falta del sprint 1 (planes de lectura, protector de racha, recordatorio) y el sprint 2.
- [ ] Banco de preguntas: benchmark de bancos con licencia, filtro y las primeras 1.000 preguntas revisables.
- [ ] Lecciones de las secciones 0 a 2 de Fundamentos para revisión doctrinal.
- [x] Borradores de los pedidos de licencia y de los textos legales (privacidad y términos, en la app; falta normas de comunidad).
- [x] Sonidos propios (36, sintetizados, con la firma de tres notas) y las ideas del capítulo {{cap:20}}.
