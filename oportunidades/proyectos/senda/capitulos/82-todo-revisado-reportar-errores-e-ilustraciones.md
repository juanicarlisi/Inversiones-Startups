# Capítulo 82 — Prueba 57: todo revisado, «¿Ves un error?», ilustraciones pintadas y música propia

**Fecha:** 18-11-2026. **Origen:** el fundador probó el APK 56 (y la versión del iPhone) y mandó trece temas con dos capturas: la
hoja de Jeremías 31:26 de una pregunta y la lámina del foso de los leones de un desafío. Cerró con: «Evalúa tranquilo… quiero que
estén ABSOLUTAMENTE TODOS LOS ERRORES CORREGIDOS Y PODAMOS SALIR EXCELENTE».

## 1. Lo que pidió (resumido; el texto entero está en la sesión)

1. **Salida gradual:** el APK 56 traía todos los juegos y todas las rutas abiertas; tiene que venir como la tienda (DEC-2026-11-17-1).
2. **Avatares:** «son todos la misma cara, y da MUY POCAS OPCIONES».
3. **Una cita corrida:** «Era Jeremías 31:25, y vos pusiste Jeremías 31:26. Arreglá todo lo roto; y además, permití siempre… reportar
   un error… No pueden haber errores de este tipo».
4. **Revisar todo:** «Chequeá pregunta por pregunta, trivia por trivia, travesía por travesía. TODO».
5. **La lámina del desafío** «no se entiende nada. Si van a aparecer así, los eliminamos… ¿No podés… usar imágenes mejor?».
6. **Eliminar grupos.**
7. **Nombres por letra:** no tomó Miriam, Miqueas, Mardoqueo ni Matías; mostró «error inesperado» y se cerró; el permiso del
   micrófono fue confuso; en iPhone se cerraba al decir un nombre.
8. **Avisos de Android** como los del iPhone.
9. **La música seguía** al salir del juego.
10. **Sombra de Cristo:** el tabernáculo en todo el camino y algo roto arriba; revisar todas las rutas.
11. **Torneos:** «me pierdo un poco»; «Te toca» y «Ya jugaste», muy chicos.
12. **Frases internas a la vista** («sin scroll infinito» al final de Inicio).
13. **Música y sonidos propios** «RECONTRA HIPER ULTRA ARCHI MEGA MEJOR», con alguna herramienta que haya quedado conectada.
14. Además: «llegó una notificación de tad» (sin el contenido).

## 2. Lo que se hizo

### 2.1 La revisión de todo el contenido (pedidos 3 y 4)

- **Trivia:** 5.136 preguntas leídas contra su versículo; 262 propuestas y 240 aplicadas con la cita, la clave y la versión
  verificadas (esp-4105 pasa a Jeremías 31:25 en la PDT, «Saciaré»).
- **Travesía:** las 1.625 lecciones (63 lotes, las 15 rutas de entrada primero) leídas contra el texto. Entre lo encontrado:
  - citas corridas;
  - respuestas que no se leían en la versión que abre;
  - relatos y fichas con datos de más;
  - distractores que también valían.
  Se corrigieron también las Biblias: los «[[ ]]» de la PDT y la errata de Hebreos 12:2 en la RV1909.
- **Juegos**, dato por dato:
  - **En la frente:** 124 personajes y 372 pistas; 34 corregidas. Las frases entre «» ahora son textuales y hay pistas propias donde
    «Profetisa» o «Pescador» servían para dos.
  - **Antes o después:** 317 hechos; 12 corregidos (concilio de Jerusalén, Jericó, Jetro entre los mandamientos, Daniel 1-2 en
    «profetas»). La tabla de la base va en una migración nueva.
  - **Vivir la historia:** 13 misiones y 90 pasos; 33 corregidos. Por ejemplo:
    - Cornelio y Pedro tuvieron la visión con un día de diferencia, no el mismo día;
    - lo que se repite siete veces es el criado mirando al mar, no la oración de Elías;
    - Gedeón es «hijo de Joás».
  - **¿Quién es?:** 71 personajes y unos 3.800 «sí» leídos contra su versículo; 170 cambios. «¿Aparece en el Evangelio de…?» ahora
    cuenta si ese Evangelio lo nombra.
- **Traducciones:** los 36 elementos por idioma que cambiaron, al día en portugués y en inglés.
- **Los avisos del validador, leídos uno por uno** (antes del APK):
  - tres lecciones citaban Hebreos 12:2 con la errata vieja de la RV1909 («en al autor») y una citaba Efesios 4:31 sin ser textual:
    corregidas;
  - nueve preguntas eran dos frases («…varios hijos. ¿Cuántos?»): ahora son una sola pregunta directa, en los tres idiomas, y
    pasaron la guardia de citas.
  Los demás avisos no son errores: fuentes bibliográficas y nombres propios que se escriben igual en otro idioma, o la respuesta
  traducida que espera la lectura humana de siempre.
- **La guardia de citas** (`scripts/autor/guardia_citas.py`, dentro del validador): las 13.272 preguntas revisadas quedan selladas.
  Toda pregunta nueva o cambiada tiene que tener su respuesta en el versículo citado; si un vecino encaja mejor, es una cita corrida
  y el validador frena. Probado con el caso real: con Jeremías 31:26 salta («vecino_mejor: 31:25»).

### 2.2 «¿Ves un error? Avísanos» (pedido 3)

- Un renglón chico al pie de la hoja del pasaje (trivia, Travesía, desafío y juegos) y en cada versículo de la Biblia.
- Se abre ahí mismo: cuatro opciones, un comentario opcional y Enviar. No pide cuenta.
- Llega a «Errores reportados» en Admin, con lo que se veía, la versión de la app y el idioma.
- La base: tabla `reportes_error`, con tope por hora y por cuenta. La tabla vieja de la prueba 26 quedó cerrada. Pruebas de la base:
  401 de 401.

### 2.3 Ilustraciones pintadas (pedido 5)

- **Herramienta:** Gemini 2.5 Flash Image en Vertex AI, proyecto senda-campana, con el crédito de prueba (registro de la regla 10 en
  §3).
- **Las preguntas «¿Qué historia muestra la imagen?»:** 20 escenas. 23 preguntas de la trivia y de la Travesía dejan la lámina dibujada
  con código.
- **Vivir la historia:** cada paso tiene su escena (87 nuevas). Se eligieron así:
  - la escena de la pregunta muestra lo que cuenta el paso y nunca la respuesta. Antes, por ejemplo, el cetro ya aparecía extendido
    cuando se preguntaba qué hacía el rey, y José aparecía vendido cuando se preguntaba qué hacían con él;
  - la escena de «lo que pasó» puede mostrar el desenlace.
  Las escenas se funden una en otra al avanzar, con un acercamiento muy lento que se apaga con «reducir movimiento», y la cárcel
  tiembla con el terremoto.
- **Reglas en el pedido de cada escena:**
  - Jesús nunca se dibuja (en el pesebre hay luz, no un niño);
  - sin aureolas, cruces ni íconos, y sin texto;
  - los ángeles son hombres de blanco con luz; en Belén llevan alas.
- **Control:** cada escena se miró una por una (también de cerca: caras, manos y esquinas) y se volvieron a pedir las que
  fallaron:
  - el ángel de Belén parecía una mujer;
  - José aparecía vendido con la túnica de colores que ya le habían sacado;
  - el pez dejaba ver a Jonás adentro;
  - el poste de Asera, junto al altar de Baal, parecía una cruz;
  - el ángel de Gedeón (barba y pelo largo, de blanco) y José en el pesebre se parecían a la imagen de Jesús: ahora el ángel es un
    joven sin barba y José lleva la cabeza cubierta;
  - en Dotán, José estaba entre los hermanos cuando tenía que venir de lejos;
  - cuatro escenas traían una firma falsa en una esquina: se borró con una edición de Gemini sobre la misma imagen
    (`ilustraciones.py --limpiar`), sin cambiar nada más;
  - el ciego de Siloé con lodo en los ojos salía siempre con una venda (tres intentos): ese paso usa la escena del ciego en la
    calle;
  - varias escenas vinieron angostas o con bordes blancos y se recortaron.

### 2.4 La app (pedidos 1, 2 y 6 a 12)

- **Salida gradual:** el APK de prueba viene como la tienda. Para revisar todo, Ajustes → «Ver todo lo que todavía no salió» (solo en
  las de prueba).
- **Avatares:** ojos, cejas y boca por separado (252 caras amables), remera con dibujo y más colores de pelo y de fondo.
- **Eliminar grupos:** el líder, con confirmación (`borrar_grupo`; probado que un miembro no puede).
- **Nombres por letra:**
  - el cierre en iPhone: el sonido del acierto le cambiaba la sesión de audio al micrófono en pleno uso;
  - el micrófono se pide una sola vez, antes de empezar;
  - Miriam, Santiago, Rajab, Nemrod, Ozías, Betsabée y Eutiquio, con la grafía de hoy (también en la base);
  - el «error inesperado» en Android no se pudo reproducir (§5).
- **Avisos de Android:** el ícono de Senda a color al lado del texto, como en el iPhone. Se hizo un complemento propio, porque el de
  Expo no lo escribe.
- **Música:** suena solo con el juego a la vista; al cambiar de pestaña o salir, se corta.
- **Travesía:**
  - 54 rutas repetían el mismo paisaje en todo el camino; ahora cambia por capítulo según lo que trata;
  - el primer capítulo deja la cima del edificio debajo del estandarte;
  - verificado en la vista previa con Sombras de Cristo (desierto, fiestas, templo y figuras).
- **Torneos:**
  - arriba, una sola acción grande («Crear un torneo») y «¿Te pasaron un código? Entra acá»;
  - «Te toca», «Ya jugaste» y «Por empezar» como títulos grandes con contador;
  - «Invitar», dentro de cada torneo.
- **Frases internas:** fuera «Sin scroll infinito» («Eso es todo por hoy. ¡Nos vemos mañana!»), y la nota de «versión de prueba» de
  los planes ya no se ve en la tienda.
- **El versículo del día** se leía «»Dios amó tanto…»: ya no lleva comilla de más.

### 2.5 Música propia (pedido 13)

- **Herramienta:** Lyria 2 en Vertex AI (el mismo proyecto), a USD 0,06 cada 32 segundos. Lo generado lleva la marca invisible
  SynthID y Lyria bloquea lo que se parece a obras existentes.
- **Diez candidatas para elegir en la Consola:**
  - tres para la entrada (synth-pop, lounge, acústica);
  - tres para el Espadeo (funk, retro, electro);
  - dos para los juegos (pizzicato, piano);
  - dos para «Vivir la historia» (oud, arpa).
- **Cómo se prepararon:** las de juego empalman en bucle (entre el principio y el final hay menos de 2 dB de diferencia) y todas
  quedaron al mismo volumen (−16 LUFS), para comparar la música y no el volumen.
- **Qué falta:** nada entra a la app hasta que el fundador elija.
- **Riesgo legal (HECHO, leído el 18-11-2026):** Lyria no está en la lista de servicios con indemnidad de Google (versión del
  20-07-2026). La lista cubre Codey, Gemini, Imagen, PaLM y Veo; por eso las escenas pintadas con Gemini sí están cubiertas. Lo que
  genera Lyria es nuestro, y Lyria frena lo que se parece a obras existentes. Pero si un tema se pareciera a uno protegido, Google no
  nos cubre. La alternativa sin ese riesgo sigue siendo Kevin MacLeod (CC BY 4.0).

## 3. Herramientas (regla 10)

- 18-11-2026 · Ilustraciones · **Gemini 2.5 Flash Image (Vertex AI)** · cloud.google.com/vertex-ai · lo generado es contenido del cliente
  · un estilo parejo por pedido y control escena por escena · corte: si una escena no se entiende o rompe una regla, se vuelve a pedir.
- 18-11-2026 · Música · **Lyria 2 (`lyria-002`, Vertex AI)** · USD 0,06 por pista de 32 s · SynthID · sin la indemnidad de Google ·
  corte: el fundador elige; si ninguna supera a lo que hay, o si no quiere el riesgo, sigue Kevin MacLeod.

## 4. Lo que queda del fundador

1. **Probar el APK 57** (y la versión del iPhone en TestFlight): trae todo.
2. **Elegir la música** en la Consola (Sala de sonidos): una por momento, o «ninguna». Lyria no tiene la indemnidad de Google (§2.5).
3. **El cierre de Nombres por letra en Android:** después de que pase, Ajustes → «Último fallo registrado» → copiar y pegarlo en el chat.
4. **El aviso de TAD:** pegar el texto (o una captura) de la notificación que llegó.

## 5. Riesgos y lo que no se pudo verificar

- **El cierre de Nombres por letra en Android** no se reprodujo; la app lo registra en «Último fallo registrado».
- **La música** no se escuchó acá: se midió (volumen, silencios, empalme) y se eligió por los pedidos. El oído del fundador manda.
- **Las ilustraciones en el teléfono:** se miraron en la computadora. Falta verlas en un teléfono chico y con letra grande.
- **Los generadores viejos** (`antes_despues.py`, `quien_soy.py`) ya no reconstruyen el JSON publicado, porque la RVR1960 como vara se
  aplicó sobre el JSON: quedó anotado en cada uno. Las correcciones nuevas van por capas (`quien_soy_57.py`) o directo al JSON, con
  el validador.

## 6. Pruebas

- Base (`pruebas/nube`): 401 de 401 (reportar un error sin cuenta, solo el administrador los lee y los cierra, la tabla vieja
  cerrada, eliminar un grupo solo el líder).
- Arranque: 48 de 48. Tipos: sin errores. Validador: en orden (con la guardia de citas).
- La vista previa: Torneos y la Travesía de Sombras de Cristo, revisadas en capturas.
- La vista previa: Vivir la historia con las escenas pintadas (intro, paso y «lo que pasó»), sin errores en la consola.
- **APK 57** (18-11-2026, 125 MB): https://github.com/juanicarlisi/senda-app/releases/tag/prueba-57 — compilado con el validador y la
  prueba de arranque en orden. **iPhone 57:** subido a la rama «testflight»; Expo lo compila y lo manda a TestFlight.
