# La Biblia sin ruido, la trivia con música, la entrada nueva y las conexiones del lanzamiento (la prueba 34)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 24-10-2026 el fundador mandó la prueba 34 con siete pedidos y dos capturas (la pantalla de carga de
Preguntados, solo como ejemplo de lo que transmite, y un diagrama con textos encimados). **La Biblia** quedó sin ruido arriba: un
botón solo («Planes y versiones») y lo de hoy en tu plan (§2). **Los textos que se pisaban o se salían del cuadro** se buscaron con
una auditoría automática de toda la app (810 lecciones, 728 pantallas de trivia, todas las pantallas, con letra normal y grande) y se
corrigieron en los diagramas, los mapas (los nombres ahora buscan un lugar libre), la línea de tiempo y once pantallas (§3). **La
trivia** tiene la ruleta protagonista (ocupa casi todo el ancho) y un control de música en el juego: silenciar, volumen, el tema que
suena con su crédito, «Cambiar de tema» y una rotación automática entre cuatro temas (§4). **La entrada** se rediseñó entera (puerta
de luz, rayos, medallones en arco, barra de carga); la pose nueva de Lany no convenció y el fundador pidió no insistir: la
ilustración definitiva se genera con otra IA con el prompt de §5; mientras tanto, Lany con la armadura completa. **El álbum** quedó
aprobado y va primero en la prueba 35 (§6). **«Adviento»** pasó a «Camino a Navidad» y la copa a «Copa de Navidad» (§7). Y lo más
grande: **todas las conexiones del lanzamiento** (cuentas, amigos, duelos al azar y contra amigos, grupos e iglesias, copas con
tabla, eventos que aparecen en el calendario de todos, encuesta diaria en vivo, Senda Premium y Max con salas en vivo y la trivia
del sermón) quedaron mapeadas, con el esquema de la base escrito y validado, las dos funciones de borde, la guía de bienvenida
diseñada y el camino semana por semana hasta el 18-12 (§8). Biblica respondió sobre la NVI (§9). **APK 34**, con todo (§10).
</div>

## 1. Lo que dijo el fundador y dónde quedó

| Lo que dijo (resumen) | Dónde quedó |
|---|---|
| En la Biblia, arriba, «un montón de cosas, re incómodo»: un botón solo | §2 |
| Textos que se pisan, se salen del cuadro: revisar todos los casos y corregirlos | §3 |
| Silenciar la música de fondo en la trivia, elegir el volumen, que cambie cada tanto; la ruleta más grande, protagonista | §4 |
| La intro de Lany «MUY alejada de mi idea»; la de brazos cruzados, «una vergüenza»; algo mucho mejor diseñado, sin replicar Preguntados; si no, un prompt para otra IA | §5 |
| «Lo del álbum, va. Desde el inicio», con personajes, creativo y bien conectado | §6 |
| «Temporada de Adviento»: ¿qué es? Suena a adventista o a algo católico | §7 |
| Conexiones para que al arrancar funcione todo: rivales al azar y contactos, copas y eventos en el calendario de todos, cuentas con progreso, Premium y Max (Kahoot para jóvenes, trivia del sermón desde PDF), grupos e iglesias con campeonatos, encuesta diaria en vivo, instructivo dinámico; todo mapeado y en la línea de tiempo | §8 |
| «Avancemos con esto y los próximos pendientes» | §10 y §11 |
| (A mitad de la prueba) La pose nueva de Lany «quedó espantosa, parece con los brazos quebrados»; no reintentar; dame el prompt | §5 |
| (A mitad de la prueba) La respuesta de Biblica sobre la NVI | §9 |

## 2. La Biblia sin ruido arriba

**Antes:** la pestaña Biblia abría con las cintas, los planes de lectura, los desafíos con fecha, la historia en una línea y las
versiones, todo apilado antes de los libros. **Ahora (HECHO, 24-10):**

- arriba, el título y la lupa (buscar);
- una tarjeta con **lo de hoy**: si tenés un plan en marcha, «Hoy en tu plan» con la lectura del día y «LEER»; si no, «seguir leyendo»
  donde quedaste o «empezar a leer» en Génesis 1;
- **un solo botón: «Planes y versiones»** (con cuántos planes tenés en curso) que abre una pantalla aparte con tus planes y su avance,
  los otros planes, los desafíos con fecha, la historia en una línea, tus cintas y las versiones;
- y enseguida los libros (Antiguo y Nuevo Testamento).

Nada se perdió: todo lo que estaba arriba vive en «Planes y versiones». Es la regla de la prueba 23: lo clave de la UX no se sacrifica,
se ordena.

## 3. Los textos que se pisaban: una auditoría de toda la app

El diagrama de la captura («La oración que Jesús enseñó») tenía dos filas con textos encimados. En vez de arreglar ese caso, se
buscaron **todos**:

- **Diagramas (17, 80 capas):** un medidor de texto con la letra real de Android (Roboto, `scripts/arte/medir.py`) revisa cada
  diagrama al generarlo: texto que se sale del dibujo o de su caja, textos que se pisan. Se corrigieron siete (el padrenuestro con
  filas de alto variable, la semana de la creación, la estructura de la Biblia, la última semana, el templo, el cuerpo y sus miembros,
  Adán y Cristo) y el generador **se niega a escribir** un diagrama con problemas.
- **La app entera (`scripts/auditoria/textos.cjs`):** recorre con un navegador las pantallas, las 405 lecciones (810 casos: letra
  normal y grande) y 728 pantallas de trivia, y detecta texto cortado con «…», fuera de su cuadro, fuera de la pantalla, pisado o
  tapado. Primera pasada: 2.139 hallazgos en las lecciones. La mayoría eran falsos (el halo claro detrás de cada nombre de mapa y las
  palabras del glosario dentro de un párrafo se contaban como «pisadas»); la auditoría aprendió a distinguirlos. Lo real se corrigió:
  - **mapas:** los nombres de los lugares ahora **buscan un lugar libre** alrededor de su punto (derecha, izquierda, arriba, abajo,
    más lejos) y no pisan otros nombres, los puntos ni el crédito de Natural Earth; los que se salían del encuadre (Monte Ararat,
    Antioquía de Pisidia, el Mediterráneo) entran; los nombres de agua de fondo que no entran se esconden (`src/componentes/rotulos.ts`);
  - **línea de tiempo:** los tramos son más anchos y el título y la fecha tienen más renglones («Worms y el Nuevo Testamento alemán»
    ya no se corta);
  - **pantallas:** la misión de Inicio, el nivel en Ajustes, el título del lector, la trivia de iglesia, la barra de pestañas, la próxima
    copa, los tramos de la Travesía, el festejo de la pieza (el versículo se achica si hace falta).
- **Resultado final:** pantallas 0 problemas, trivia 0, lecciones 0 (de 2.139). La auditoría queda para correrla antes de cada APK.

## 4. La trivia: ruleta protagonista y música bajo control

- **La ruleta** pasó de 300 puntos fijos (con el dibujo en 270) a ocupar casi todo el ancho del teléfono (hasta 400); las luces del
  borde, el centro «GIRAR» y el puntero crecen con ella.
- **Control de música en el juego:** un botón al lado del título (parlante, o silencio si está apagada) abre una hoja con el
  interruptor «Música en los juegos», el **volumen** (se arrastra o se toca, en pasos de 5 %), qué tema suena con su crédito
  (Kevin MacLeod, CC BY 4.0) y **«Cambiar de tema»**. El volumen también está en Ajustes.
- **La música cambia sola cada tanto:** el Espadeo rota «Funky Chunk» → «Thinking Music» → «Local Forecast - Elevator» → «Deuces» cada
  150 segundos, con fundido cruzado. Los dos temas nuevos son de Kevin MacLeod (CC BY 4.0, bucles de 64 s), con su crédito en la app
  y en `assets/sonidos/CREDITOS.md`.

## 5. La entrada nueva (y la ilustración de Lany, con otra IA)

La pantalla se rediseñó entera, con impronta propia (la captura de Preguntados sirvió para entender qué transmite una «presentación
del jugador», nada de su aspecto): fondo índigo con **rayos dorados que giran despacio** y chispas que titilan; la **puerta abierta**
(el logo de Senda) como una puerta de luz detrás de Lany, con la luz que cae al piso; el logo, la marca y el lema **«Conoce la
Palabra»** arriba; las **seis piezas de la armadura en un arco de medallones** que aparecen de a uno con un destello; abajo, una barra de
carga que se llena y «toca para entrar». Dura 3 segundos o hasta el toque; con «reducir movimiento», quieta.

**Lany.** Se hizo una pose nueva en Rive («héroe»: puños en la cintura, pecho afuera, cara canchera). El fundador la vio y pidió no
insistir: «parece con los brazos quebrados». Se sacó. Mientras llega la ilustración definitiva, la entrada muestra a Lany **con la
armadura completa**, la pose que mejor se ve. El **prompt** para generar la ilustración con otra IA (en inglés, con la variante con
armadura, las correcciones típicas y el blindaje legal) y la **lámina de referencia** del personaje están en
`oportunidades/proyectos/senda/lany_prompt_entrada.md` y `lany_referencia.png` (también en la app: `docs/LANY_ENTRADA.md`). Cuando el
fundador mande la imagen, se recorta, se escala y entra en la entrada; si después se quiere que se mueva, se pide la misma pose en
capas y se arma en Rive.

## 6. El álbum de personajes: aprobado, primero en la prueba 35

«Lo del álbum, va. Desde el inicio.» Queda aprobado con el diseño de la DEC-2026-10-23-2 (sobres solo con talentos, nunca una
figurita repetida, dorada por saber y no por suerte, Jesús no es figurita, 72 personajes por año) y con lo que pidió ahora: **al
conseguir un personaje se abre su ficha** (qué quiere decir su nombre, su historia en tres líneas con cita, su familia, cuándo vivió,
por qué importa, y los enlaces a su travesía y a los pasajes), todo conectado con las fichas de personaje que ya existen en la
Travesía. Es lo primero de la prueba 35 (§11): es una pantalla nueva con datos verificados y merece una prueba entera.

## 7. «Adviento» → «Camino a Navidad»

**Qué era:** el desafío con fecha de 27 días, del 29 de noviembre a Navidad, con las promesas sobre el Mesías y su cumplimiento;
«Adviento» es el nombre tradicional de las cuatro semanas antes de Navidad (lo observan luteranos, anglicanos, metodistas y
presbiterianos, además de los católicos), pero en las iglesias evangélicas de habla hispana la palabra es rara y, como dijo el
fundador, suena a adventista o a católico. **HECHO (24-10):** el desafío se llama **«Camino a Navidad: la promesa cumplida»** y la
copa del 19-12, **«Copa de Navidad»** (español, portugués e inglés); el contenido es el mismo y los identificadores internos no
cambian (lo guardado en los teléfonos sigue valiendo). La línea de tiempo de la Consola ya lo dice así.

## 8. Las conexiones del lanzamiento («Juntos»)

El pedido más grande de la prueba. Todo el detalle está en `docs/LANZAMIENTO.md` de la app; lo esencial:

| Pieza | Qué ve la persona | Estado |
|---|---|---|
| Cuenta | Se crea sola (anónima) al tocar algo social; apodo, país, tu Lany, código de amigo; «guardar» con correo o Google; progreso en la nube | Esquema listo; app en la prueba 35 |
| Amigos | Agregar con el código del otro o por WhatsApp; aceptar o bloquear | Esquema listo; prueba 35 |
| Duelos | Contra un amigo, contra alguien al azar o con código; por turnos (72 h), hasta 20 abiertos; el servidor corrige y puntúa | Esquema y funciones listos; prueba 35 |
| Copas | La marca oficial entra en la tabla de todos (global, por país, por iglesia) | Esquema listo; prueba 36 |
| Lo que el fundador crea para todos | Copa, torneo, evento o desafío desde la Consola → en el calendario de todos, con campana | Esquema listo; prueba 36 |
| Grupos | Iglesia, jóvenes, célula, familia; código para unirse; roles; calendario del grupo; torneos del grupo | Esquema listo; prueba 36 |
| Encuesta diaria | El fundador pregunta; todos votan una vez; resultados en vivo | Esquema listo; prueba 36 |
| Senda Premium | Sin anuncios (Google Play) | Esquema y verificación de compra listos; prueba 37 |
| Senda Max | Salas en vivo para jóvenes (código proyectado, puntos por acierto y velocidad) y la trivia del sermón (PDF → preguntas con cita → revisión del líder → jugar esa semana) | Esquema y funciones listos; pruebas 37 y 38 |
| Avisos push | «Te toca», «te desafiaron», «la copa es mañana» | Esquema listo; prueba 35 |
| Guía de bienvenida | Lany, tres carteles por pestaña la primera vez; nada avanza solo | Diseño listo; prueba 35 |

**Lo que se hizo hoy:** la migración `20261101000000_juntos.sql` (147 sentencias: 20 tablas, reglas de seguridad por fila para cada
una, 14 funciones, dos tareas programadas; validada con el analizador de Postgres), las funciones de borde `trivia-sermon` (Claude arma
las preguntas; el PDF nunca se guarda) y `compras` (verifica el recibo con Google Play), el mapa completo y el camino semana por semana
(pruebas 35 a 38, prueba cerrada del 16 al 30-11, lanzamiento el 18-12). **Lo que le toca al fundador** (sin apuro, cada cosa antes de
su prueba): activar las cuentas anónimas en Supabase, las extensiones pg_cron y pg_net, marcarse como administrador, las cuentas de
Expo y Firebase (push), los productos de suscripción y la cuenta de servicio en Play Console, la clave de Anthropic para la trivia
del sermón. Todo está en `docs/LANZAMIENTO.md` §7 y en la Consola.

**Principios que no se mueven:** sin cuenta también se juega; lo competitivo lo decide el servidor; cada tabla con su regla; nada pago
da ventaja en lo oficial; idempotente y barato (docs/ESCALA.md).

## 9. Biblica y la NVI

El formulario del 14-10 recibió el 24-10 una respuesta automática: Biblica remite a su página de permisos y avisa que no habrá otra
respuesta. Lo que esa página dice (verificado por buscador; la página está bloqueada en el entorno): hasta 500 versículos se citan sin
permiso (con el aviso de derechos); la licencia exprés para apps es solo para apps **sin ingresos** y sin IA; lo demás, por formulario
o por sus editoriales socias (Zondervan). **Conclusión:** la NVI completa no entra en Senda mientras tenga anuncios; sigue en un toque
desde Bible.com, como hasta ahora. Sin acción pendiente. Registrado en la Consola (Licencias) y en `licencias.yaml`.

## 10. El APK 34

Trae **todo lo anterior** más lo de esta prueba: la Biblia sin ruido, los textos corregidos (diagramas, mapas, línea de tiempo,
pantallas), la ruleta grande y el control de música con los temas que rotan, la entrada nueva (con Lany en armadura), «Camino a
Navidad» y «Copa de Navidad». La migración de la base se aplica sola al subirse (flujo «supabase»); no cambia nada de lo que la app
hace hoy. R8 sigue sin entrar (va solo, en un APK aparte, cuando se pueda probar en un emulador).

## 11. Pendientes y decisiones

- **Próxima prueba (35):** el álbum de personajes con la ficha al conseguir cada uno (§6); la cuenta anónima, el perfil y el código;
  amigos; duelos (amigo, azar, código) con push; la guía de bienvenida; la ilustración de Lany si llega.
- **Después:** 36 (grupos, eventos del fundador, encuesta, tabla de copa, torneos), 37 (Premium y Max, salas en vivo), 38 (trivia del
  sermón, guardar la cuenta, progreso en la nube); contenido: Josué y Jueces, Oseas, trivia en portugués, «El gran relato» en inglés.
- **Del fundador:** probar el APK 34; generar la imagen de Lany con el prompt (§5); las cuentas y claves de `docs/LANZAMIENTO.md` §7,
  cada una antes de su prueba; lo de antes (consulta SBA, INPI y abogado, Google Play antes del 15-11, sitio, Claude Max, voz).
- **Decisiones:** DEC-2026-10-24-1 (prueba 34) y DEC-2026-10-24-2 (el lanzamiento con «Juntos»: todas las conexiones salen el 18-12).

{{PANTALLAS34}}
