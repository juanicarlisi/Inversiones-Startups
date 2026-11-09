import json, os
D = {
 "id": "00-02",
 "titulo": "El viaje de un toque: de tu dedo a la base de datos y de vuelta",
 "bajada": "Antes de estudiar cada pieza, un plano de toda la casa: qué recorre un solo toque en una app real y por qué casi todas las apps tienen la misma forma.",
 "minutos": 25,
 "vigencia": "mixto",
 "revisado": "2026-11-09",
 "objetivos": [
  "Nombrar las cuatro piezas que tiene casi cualquier app (**cliente, red, servidor y base de datos**) y decir qué hace cada una.",
  "Seguir con el dedo, paso a paso, lo que pasa cuando un toque de Senda viaja hasta otro teléfono.",
  "Distinguir lo que se queda en el teléfono de lo que necesita viajar, y explicar por qué es una **decisión de diseño** y no un accidente.",
  "Saber en qué parte de este estudio vas a entender a fondo cada tramo del viaje."
 ],
 "venis_de": "Hoy es el primer día de contenido: todavía no necesitás saber nada. Solo tenés que animarte a ver el mapa antes de recorrer el territorio.",
 "se_apoya_en": ["00-01"],
 "gancho": [
  "Estás jugando un duelo en Senda contra un amigo. Respondés unas preguntas, fallás una, y la app te dice que terminó tu turno. En el teléfono de tu amigo, menos de un minuto después, aparece un aviso: «Te toca jugar». Para vos fue un toque. ¿Cuánto camino recorrió ese toque?",
  "Salió de tu dedo, pasó por el sistema operativo de tu teléfono, atravesó la antena de tu operador, cruzó cables que quizás pasen por el fondo del mar, llegó a una computadora en un centro de datos, se anotó en un archivo ordenado, y de ahí salió otra señal que viajó hasta el teléfono de tu amigo. Todo en una fracción de segundo, y sin que tengas que saber nada de eso.",
  "Este estudio existe para que sepas todo eso. Pero hay un truco para no ahogarse: **primero el plano de toda la casa, después cada habitación**. Hoy vas a ver el plano. No vas a entender cada pieza (para eso están los días que vienen), pero vas a saber que existe, para qué sirve y dónde se estudia. Después, cada concepto nuevo va a tener un lugar donde acomodarse en tu cabeza."
 ],
 "bloques": [
  {"t": "h", "x": "Las cuatro piezas de casi cualquier app"},
  {"t": "p", "x": [
   "Casi todas las apps que usás tienen la misma estructura básica, aunque hagan cosas muy distintas. Pensemos en un restaurante, que es una buena imagen porque tiene exactamente el mismo problema: alguien pide algo y otro lo prepara.",
   "El comensal con su pedido es el [[cliente|cliente]]: el programa que vive en tu teléfono o en tu navegador y con el que interactuás directamente. Es quien **pide**. Tiene la pantalla, los botones y las animaciones, pero normalmente no tiene todos los datos ni toma todas las decisiones.",
   "El mozo que lleva el pedido hasta la cocina y vuelve con el plato es la [[red|red]]: el camino por el que viajan los mensajes entre una computadora y otra, ya sea Wi-Fi, datos móviles o los cables de Internet. No cocina nada, pero sin ella nada se mueve.",
   "La cocina es el [[servidor|servidor]]: una computadora, casi siempre ubicada en un centro de datos, que está encendida todo el día esperando pedidos. Recibe un pedido, aplica las reglas («¿hay ingredientes?, ¿este cliente puede pedir esto?»), y prepara la respuesta. Es quien **atiende**.",
   "Y la despensa con el libro de inventario es la [[base de datos|base de datos]]: el lugar ordenado donde se guardan los datos que tienen que sobrevivir y que muchos necesitan consultar, como quién es amigo de quién, quién va ganando un duelo o qué puntaje tiene cada uno."
  ]},
  {"t": "diagrama", "tipo": "flujo", "filas": [
   {"nodos": [{"t": "Cliente", "s": "la app en tu teléfono", "k": "cliente"}, {"t": "Red", "s": "Wi-Fi, antena, cables de Internet", "k": "red", "e": "pedido"}, {"t": "Servidor", "s": "una computadora que atiende pedidos", "k": "servidor", "e": ""}, {"t": "Base de datos", "s": "donde se guarda lo que importa", "k": "datos", "e": "consulta"}]},
   {"baja": "y la respuesta hace el camino inverso", "nodos": [{"t": "Cliente", "s": "muestra el resultado", "k": "cliente"}, {"t": "Red", "s": "vuelve por el mismo camino", "k": "red", "e": "respuesta"}, {"t": "Servidor", "s": "arma la respuesta", "k": "servidor", "e": ""}, {"t": "Base de datos", "s": "devuelve los datos", "k": "datos", "e": "datos"}]}
  ], "cap": "El esquema que se repite en WhatsApp, en el home banking, en Senda y en casi todo lo demás."},
  {"t": "nota", "k": "idea", "x": "**Cliente y servidor son roles, no tipos de computadora.** «Cliente» es quien pide; «servidor» es quien atiende. Tu notebook puede ser servidor un rato y cliente otro. Lo que importa es quién hace cada cosa en la conversación."},
  {"t": "p", "x": "Hay una quinta palabra que vas a escuchar a cada rato: la [[API|API]]. Es el menú de lo que la cocina acepta: la lista exacta de pedidos que el servidor sabe atender y el formato en que hay que hacerlos. Si pedís algo que no está en el menú, o lo pedís de forma incorrecta, el servidor te rechaza. Más adelante vas a dedicar toda una parte del estudio a las APIs; por ahora quedate con la idea del menú."},
  {"t": "nota", "k": "mito", "titulo": "«La nube es algo flotante, sin forma»", "x": "Cuando alguien dice «lo guardé en la nube», suena a magia. No lo es: la nube son **computadoras de otra empresa**, en edificios reales llenos de estantes con servidores, que alquilás por hora o por uso. Cuando en la Parte 13 estudiemos la nube, vas a ver esos edificios por dentro. Por ahora, cada vez que escuches «nube» reemplazá mentalmente por «servidores de alguien más»."},

  {"t": "h", "x": "El toque, paso a paso: un duelo en Senda"},
  {"t": "p", "x": [
   "Veamos esas cuatro piezas funcionando en una situación real. Lo que sigue **no es un ejemplo inventado**: es lo que pasa en el código de Senda cuando terminás tu turno en un duelo del Espadeo (el juego de preguntas). Fue leído y verificado archivo por archivo.",
   "Apretá «Paso a paso» y andá avanzando; cada paso se explica abajo del diagrama."
  ]},
  {"t": "diagrama", "tipo": "secuencia",
   "actores": [{"n": "Tu dedo", "k": "cliente"}, {"n": "App de Senda", "k": "cliente"}, {"n": "API de Supabase", "k": "servidor"}, {"n": "Base Postgres", "k": "datos"}, {"n": "Teléfono rival", "k": "red"}],
   "mensajes": [
    {"de": 0, "a": 1, "t": "Terminás tu turno", "d": "Fallaste una pregunta, así que el turno corta. Para el programa, esto es un **evento**: algo que pasó y a lo que tiene que reaccionar."},
    {"de": 1, "a": 1, "t": "Junta tus respuestas en una lista", "d": "La app (el **cliente**) arma una lista con cada respuesta: qué pregunta, qué contestaste y en cuántos segundos. Esto ocurre dentro de tu teléfono, sin internet todavía. A cada jugada le pone un identificador único, para que un reintento no se cuente dos veces."},
    {"de": 1, "a": 2, "t": "POST /rest/v1/rpc/jugar_turno", "d": "Acá aparece la **red**. La app manda un pedido HTTP, que vas a estudiar a fondo en la Parte 5. El texto «POST /rest/v1/rpc/jugar_turno» es el pedido: «ejecutá la función jugar_turno con estos datos». Esa dirección es una de las que forman la **API** de Supabase, el servicio que Senda usa como servidor."},
    {"de": 2, "a": 3, "t": "Ejecuta la función jugar_turno()", "d": "El servidor no decide nada por su cuenta: pasa el pedido a la función guardada dentro de la propia base de datos. Esta es una elección de diseño interesante de Senda, que vas a ver con detalle más adelante."},
    {"de": 3, "a": 3, "t": "Valida, corrige, guarda, pasa el turno", "d": "La **base de datos** hace el trabajo de verdad. Verifica que la partida esté abierta y que sea tu turno, corrige cada respuesta contra la clave de respuestas, descarta repetidas, guarda las jugadas y le pasa el turno al rival. Todo esto ocurre como una sola operación indivisible; también vas a estudiar por qué eso importa."},
    {"de": 3, "a": 2, "t": "Devuelve la partida actualizada", "resp": True, "d": "La base le contesta al servidor con el estado nuevo de la partida."},
    {"de": 2, "a": 1, "t": "Respuesta HTTP 200 con los datos", "resp": True, "d": "El servidor empaqueta ese estado como una respuesta HTTP (un 200 significa «todo bien») y la manda de vuelta por la red."},
    {"de": 1, "a": 0, "t": "Muestra cómo quedó el duelo", "resp": True, "d": "La app lee la respuesta y actualiza la pantalla: ves quién va ganando y que ahora le toca al rival."},
    {"de": 3, "a": 4, "t": "Cada minuto: push «Te toca jugar»", "d": "Mientras tanto, la base había dejado anotado un aviso en una cola. Una tarea programada que corre **cada minuto** junta los avisos pendientes y se los entrega al servicio de notificaciones, que los lleva hasta el teléfono de tu rival. Por eso el aviso llega en menos de un minuto, no al instante."}
   ],
   "cap": "El viaje real de «terminar un turno» en Senda. Las líneas punteadas son respuestas."},
  {"t": "pensa", "x": "En el diagrama hay una pieza que corrige las respuestas y otra que las junta. ¿Por qué creés que la corrección la hace la base de datos y no la app en tu teléfono?", "resp": "Porque el teléfono es tuyo y podrías modificarlo para que siempre diga «acerté». Cualquier cosa que decida un resultado compartido, como quién gana un duelo, tiene que decidirse en un lugar que el jugador no controla. Esa es una de las razones centrales de existir de los servidores."},
  {"t": "senda", "titulo": "Dónde está esto en el código", "x": [
   "La función que arma y envía el turno es `jugarTurno` en `src/util/juntos.ts`. La que hace el pedido HTTP a la base es `rpc()` en `src/util/cuenta.ts`, que usa `fetch` directo, sin librería intermedia. La lógica que valida y corrige vive **en SQL**, en la función `jugar_turno` definida en `supabase/migrations/20261127000000_seguridad.sql`.",
   "Todo lo que ves acá corresponde al commit `25e08fa` (9 de noviembre de 2026). El código de Senda cambia seguido: los nombres de archivos pueden moverse, pero la **forma** del recorrido (teléfono, red, API, base) es la parte duradera."
  ], "archivos": ["src/util/juntos.ts", "src/util/cuenta.ts", "supabase/migrations/20261127000000_seguridad.sql", "docs/SEGURIDAD.md"]},

  {"t": "h", "x": "El mismo esquema, sin Senda: abrir una página web"},
  {"t": "p", "x": [
   "Para convencerte de que esto no es una rareza de una app en particular, mirá lo que pasa cuando escribís la dirección de un diario en el navegador. El **cliente** es el navegador (Chrome, Safari), que pide la página. La **red** lleva ese pedido hasta el servidor del diario. El **servidor** busca la nota, quizás consulta una **base de datos** con los artículos y los comentarios, arma el documento y lo devuelve. Tu navegador lo recibe y lo dibuja.",
   "Misma estructura, cosas muy distintas: un diario, una app de duelos, un home banking, un juego en línea. Cambia qué datos se guardan y qué reglas se aplican, pero el esqueleto es el mismo. Por eso vale la pena entender el esqueleto una sola vez y bien."
  ]},

  {"t": "h", "x": "Pero la mayoría de los toques nunca salen del teléfono"},
  {"t": "p", "x": [
   "Ahora la parte que más sorprende. Terminar una lección de la Travesía, sumar talentos, mantener tu racha de días o leer la Biblia **no** viajan a ningún servidor. Todo eso ocurre dentro de tu teléfono, y por eso funciona aunque no tengas señal.",
   "Es una decisión de diseño, no un accidente: Senda es una app **«primero el teléfono»**. La Biblia entera, el contenido de las lecciones, tu progreso y tus ajustes viven en el teléfono. La nube se usa solo para lo que necesita a **más de una persona**: amigos, duelos, grupos, torneos, tablas de copas y la cuenta que te identifica."
  ]},
  {"t": "diagrama", "tipo": "comparar", "izq": {"t": "Se queda en tu teléfono", "k": "cliente", "items": ["La Biblia y el contenido de las lecciones", "Tu progreso, estrellas y racha", "Talentos, pasos y álbum de personajes", "Tus ajustes y notas"]}, "der": {"t": "Viaja a la nube (a Supabase)", "k": "servidor", "items": ["Tu cuenta y tu alias", "Amigos y grupos", "Duelos y torneos", "Copas con tabla de posiciones"]}, "cap": "La frontera entre las dos columnas es una decisión de ingeniería, no una ley de la naturaleza."},
  {"t": "p", "x": "Terminar una lección, por ejemplo, es un recorrido corto: la pantalla de la lección llama a una función que suma talentos y marca la lección como hecha; ese cambio se anota en el almacén del teléfono, y listo. No hay red en ningún punto del camino. Compará con el duelo: ahí había cuatro piezas, y acá hay una."},
  {"t": "senda", "x": "El recorrido local de una lección empieza en `avanzar()` dentro de `src/pantallas/Leccion.tsx`, pasa por el estado en `src/estado/usuario.ts` y termina escribiendo en el almacenamiento del teléfono vía `src/util/almacen.ts`.", "archivos": ["src/pantallas/Leccion.tsx", "src/estado/usuario.ts", "src/util/almacen.ts"]},
  {"t": "nota", "k": "analogia", "titulo": "Pensalo así: el cuaderno y la pizarra del bar", "x": "Tu cuaderno personal es solo tuyo: lo abrís donde quieras, nadie más lo ve y no necesita a nadie. La pizarra del bar, en cambio, la ven todos y tiene que estar en un solo lugar, para que todos lean lo mismo. En Senda, tu progreso es el cuaderno (vive en el teléfono) y los duelos y las copas son la pizarra (viven en el servidor)."},
  {"t": "pensa", "x": "Pensá en qué ganás y qué perdés con que tu progreso viva solo en el teléfono.", "resp": "Ganás velocidad (no esperás a nadie), funcionamiento sin internet, más privacidad y un costo de servidores casi nulo. Perdés que, si perdés o cambiás de teléfono, perdés el progreso, salvo que lo hayas guardado con una cuenta. Y perdés la posibilidad de confiar en esos datos para algo oficial: lo que está en tu teléfono lo podrías modificar. Por eso lo que decide quién gana vive en la base."},

  {"t": "h", "x": "Por qué no se hace todo en el teléfono ni todo en el servidor"},
  {"t": "p", "x": "Esta es la primera de muchas decisiones de ingeniería que vas a ver, y conviene mirarla con calma porque aparece en todos lados. Cada tarea de una app puede hacerse en el cliente o en el servidor, y ninguno de los dos lugares es siempre mejor. Cada uno tiene ventajas y costos."},
  {"t": "tabla", "cab": ["Criterio", "Si lo decide el teléfono", "Si lo decide el servidor"], "filas": [
   ["Velocidad percibida", "Inmediata: no espera a nadie", "Depende de la red: decenas o cientos de milisegundos"],
   ["Sin conexión", "Funciona igual", "No funciona sin red"],
   ["Confianza", "El dueño del teléfono puede alterarlo", "Corre en un lugar que controla quien hace el producto"],
   ["Compartir con otros", "Imposible: cada teléfono es una isla", "Natural: todos consultan el mismo lugar"],
   ["Costo para quien hace la app", "Casi cero: el teléfono lo pagó el usuario", "Crece con cada usuario: servidores, energía, mantenimiento"],
   ["Cambiar una regla", "Hay que publicar una versión nueva de la app", "Se cambia en un lugar y vale para todos al instante"]
  ], "cap": "Ninguna columna gana siempre. La habilidad está en repartir cada tarea donde convenga."},
  {"t": "p", "x": "Fijate que los criterios se pelean entre sí: lo más rápido es lo menos confiable, y lo más confiable cuesta plata. A eso los ingenieros le dicen *trade-off* (en español, un compromiso o intercambio: para ganar algo cedés algo), y lo vas a ver con más detalle en unos días, y después casi todos los días. Una buena parte de lo que hace un arquitecto de software es decidir con criterio de qué lado cae cada tarea."},

  {"t": "h", "x": "Qué cambia cuando la app tiene mil usuarios, o un millón"},
  {"t": "p", "x": [
   "Las cuatro piezas siguen siendo las mismas, pero cada una se comporta distinto cuando crece la cantidad de gente. Los **clientes** crecen solos y gratis: cada usuario nuevo trae su propio teléfono con su propia CPU y su propia batería. La **red** es de otros (de los operadores y de Internet) y casi no te toca.",
   "Donde duele es en el medio. Un solo servidor atiende cierta cantidad de pedidos por segundo; si llegan más, hay que sumar servidores y repartir los pedidos entre ellos. Y la **base de datos** suele ser la pieza más difícil de hacer crecer, porque todos necesitan leer y escribir sobre los mismos datos sin pisarse. Por eso casi todas las historias de escalabilidad hablan de ella. Todo esto es la Parte 16, y más adelante vas a ver cómo se prepara Senda para crecer."
  ]},

  {"t": "h", "x": "Dónde se estudia cada tramo del viaje"},
  {"t": "p", "x": "Lo que acabás de ver es una simplificación a propósito. Cada flecha del diagrama esconde mucho más, y cada pieza tiene una parte del estudio para ella. Esta tabla es tu mapa de ruta:"},
  {"t": "tabla", "cab": ["Tramo del viaje", "Qué esconde", "Dónde lo estudiás"], "filas": [
   ["Tu dedo y el teléfono", "Hardware, procesador, memoria y sistema operativo", "Parte 1 y Parte 2"],
   ["La app y su lógica", "Programación, estructuras de datos, algoritmos", "Parte 3 y Parte 4"],
   ["La pantalla", "Interfaces, diseño y accesibilidad; apps móviles", "Parte 6 y Parte 10"],
   ["La red", "Direcciones, DNS, TCP, HTTP, cifrado", "Parte 5"],
   ["El servidor y la API", "Backend, contratos entre sistemas, autenticación", "Parte 7 y Parte 8"],
   ["La base de datos", "SQL, índices, transacciones, copias de seguridad", "Parte 9"],
   ["Dónde viven los servidores", "La nube, contenedores, despliegue", "Parte 13 y Parte 14"],
   ["Que no se rompa ni lo rompan", "Seguridad, escalabilidad, observabilidad", "Parte 15 y Parte 16"],
   ["Cómo se decide todo esto", "Arquitectura, producto, criterio", "Partes 12, 19 y 21"],
   ["Todo junto, en una app real", "Senda de punta a punta", "Parte 20 (y recuadros «En Senda» en todo el estudio)"]
  ], "cap": "No hace falta memorizarla. Volvé a esta tabla cuando te pierdas: siempre vas a poder ubicar dónde estás."},
  {"t": "p", "x": "Fijate además en una cosa del orden: el estudio empieza por **abajo** (los bits y la CPU) y sube. Es a propósito. Cada capa se explica con lo que ya viste de la anterior, y nunca vas a encontrar una palabra que no se haya presentado antes. El diagrama de hoy es el único lugar donde vas a ver algo «de arriba» sin haber construido la base, y por eso conviene releerlo cuando termines cada parte."},
  {"t": "ejercicio", "x": "Elegí una app que uses todos los días (WhatsApp, Mercado Libre, Spotify, el home banking) y un solo toque dentro de ella (mandar un mensaje, comprar algo, dar «play»). En una hoja, dibujá el viaje con las cuatro piezas. Respondé: ¿qué parte pasa solo dentro del teléfono? ¿Qué viaja por la red? ¿Qué se tiene que guardar en un lugar compartido? ¿Quién más se entera?", "pista": "Empezá por el final: ¿qué cosa tiene que ver otra persona o otro dispositivo? Eso tiene que pasar por un servidor.", "solucion": "Un ejemplo con mandar un mensaje de WhatsApp: el teclado, el texto y la pantalla del chat son del cliente; el mensaje viaja por la red hasta un servidor; el servidor lo guarda (en una base de datos o cola) hasta que el destinatario esté disponible y se lo entrega; el destinatario ve el mensaje y su teléfono avisa que lo recibió. No hace falta que aciertes los detalles internos: lo valioso es que ubiques las cuatro piezas."}
 ],
 "recap": [
  "Casi toda app tiene cuatro piezas: **cliente** (quien pide), **red** (el camino), **servidor** (quien atiende) y **base de datos** (donde se guarda lo que importa).",
  "Una **API** es el menú de pedidos que un servidor acepta, con el formato exacto en que hay que hacerlos.",
  "Cliente y servidor son roles: cambian según quién pide y quién atiende, no según el tipo de computadora.",
  "Lo que decide un resultado compartido (quién gana un duelo) tiene que decidirse donde el usuario no pueda tocarlo: el servidor y la base de datos.",
  "Mucho de lo que hace una app no necesita viajar: Senda es «primero el teléfono», y usa la nube solo para lo que involucra a más de una persona.",
  "La nube son computadoras de otra empresa en un centro de datos, no algo etéreo."
 ],
 "repaso": [
  {"p": "En la imagen del restaurante, ¿qué pieza de una app representa la cocina?", "o": ["El cliente", "La red", "El servidor", "La base de datos"], "c": 2, "e": "La cocina recibe pedidos, aplica reglas y prepara la respuesta: es el servidor. El comensal sería el cliente, el mozo la red y la despensa con el inventario la base de datos."},
  {"p": "¿Qué es una API, según lo visto hoy?", "o": ["Una pantalla donde el usuario hace los pedidos", "El cable físico que conecta el teléfono a Internet", "El menú de pedidos que acepta un servidor y su formato", "Un tipo especial de base de datos para apps"], "c": 2, "e": "Una API es el contrato entre quien pide y quien atiende: qué pedidos existen y cómo se formulan. No es una pantalla, ni la red, ni una base de datos."},
  {"p": "En Senda, ¿por qué la corrección de las respuestas de un duelo la hace la base de datos y no el teléfono?", "o": ["Porque el teléfono no tiene capacidad de hacer esas cuentas", "Porque así se gasta menos batería en cada turno", "Porque el jugador controla su teléfono y podría trampear", "Porque las respuestas ocupan demasiado espacio en el teléfono"], "c": 2, "e": "Todo lo que decide un resultado compartido tiene que correr en un lugar que el jugador no controla. El teléfono sí puede hacer cuentas; el problema es de confianza, no de capacidad."},
  {"p": "Terminás una lección de la Travesía en Senda sin señal de Internet. ¿Qué pasa?", "o": ["No funciona hasta que vuelva la conexión a Internet", "Se guarda en el servidor y se pierde después", "Funciona igual: ese progreso vive en el teléfono", "La app se cierra porque no encuentra el servidor"], "c": 2, "e": "Senda es «primero el teléfono»: lecciones, talentos y racha viven en el dispositivo. Solo lo que involucra a otras personas (duelos, amigos, grupos) necesita red."},
  {"p": "Un amigo dice «lo tengo guardado en la nube». ¿Qué quiere decir en concreto?", "o": ["Que está en un lugar sin ubicación física real", "Que está en servidores ajenos, en un centro de datos", "Que está en el teléfono, pero comprimido para ahorrar", "Que se guarda solo mientras haya Wi-Fi disponible"], "c": 1, "e": "La nube son computadoras reales de otra empresa. «Nube» es un nombre comercial para «servidores de alguien más, accesibles por Internet»."},
  {"p": "El aviso «Te toca jugar» llega al rival en menos de un minuto, pero no al instante. ¿Por qué?", "o": ["Porque la señal de celular tarda en cada envío", "Porque una tarea los junta y los envía cada minuto", "Porque el rival tiene que abrir la app primero", "Porque el servidor espera a juntar cien jugadores"], "c": 1, "e": "La base deja el aviso en una cola, y una tarea programada que corre cada minuto lo manda al servicio de notificaciones. Es un compromiso de diseño: agrupar envíos cuesta menos que mandar cada aviso al instante."},
  {"p": "Una app necesita decidir quién ganó una partida entre dos personas. ¿Dónde conviene que se decida, según la tabla de hoy?", "o": ["En el teléfono de quien juega primero", "En el servidor, que nadie de los jugadores controla", "En el teléfono del que tenga mejor conexión", "En cualquiera de los dos teléfonos, da lo mismo"], "c": 1, "e": "Para un resultado compartido hace falta un árbitro neutral. Si lo decide un teléfono, su dueño podría alterarlo; el servidor es un lugar que ningún jugador controla."}
 ],
 "feynman": "Explicale a alguien que no sabe de tecnología qué pasa desde que tocás «enviar» en una app hasta que otra persona ve el resultado. Usá las cuatro piezas (cliente, red, servidor, base de datos) y una analogía propia, que no sea la del restaurante.",
 "para_profundizar": [
  {"fuente": "mdn-client-server", "nota": "Una introducción corta y clara, de la documentación oficial de Mozilla, a cómo se comunican clientes y servidores en la web."},
  {"fuente": "kurose-ross", "nota": "El capítulo 1 de este libro de redes de Kurose y Ross cuenta el mismo viaje con mucho más detalle técnico. Es de lo mejor que existe para entender Internet. Disponible en inglés."},
  {"fuente": "supabase-docs", "nota": "La documentación oficial de Supabase, el servicio que Senda usa como servidor y base de datos. Hojearla ahora para ver los nombres que irán apareciendo."}
 ],
 "videos": [
  {"q": "cliente servidor explicado qué es y cómo funciona una aplicación", "por_que": "Para ver el mismo esquema animado por otra persona."}
 ],
 "terminos": [
  {"t": "cliente", "d": "El programa con el que interactuás (la app en tu teléfono o el navegador) y que hace los pedidos a un servidor."},
  {"t": "servidor", "d": "Computadora o programa que está esperando pedidos de clientes, aplica las reglas y devuelve una respuesta."},
  {"t": "base de datos", "d": "Lugar ordenado donde se guardan los datos que tienen que sobrevivir y ser consultados por muchos."},
  {"t": "red", "d": "El camino por el que viajan los mensajes entre computadoras: Wi-Fi, datos móviles, cables, todo el recorrido."},
  {"t": "API", "d": "El conjunto de pedidos que un programa acepta de otros programas, con el formato exacto en que deben hacerse."}
 ],
 "siguiente": "las capas de abstracción: cómo se apilan los electrones, el hardware, el sistema operativo y tu app, y por qué esa pila es lo único que hace posible que alguien construya software sin saber física.",
 "fuentes_nuevas": [
  {"id": "mdn-client-server", "t": "Visión general cliente-servidor", "a": "MDN Web Docs", "tipo": "doc", "url": "https://developer.mozilla.org/es/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview"}
 ]
}
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'dias', f"{D['id']}.json")
json.dump(D, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
