# Capítulo 86 — Prueba 59: claridad, sala con preguntas propias y jugar desde la computadora (20-11-2026)

## 1. Lo que pidió el fundador (20-11, después de probar el APK 57)

Un mensaje largo («hacelo tranquilo, despacio; siempre mejor calidad que velocidad»), punto por punto:

1. Inicio mostraba «Estrella de Belén · Seguir» (que empieza el 29-11) y no la insignia empezada (Peregrino).
2. El versículo del día dijo «no estribes en tu prudencia»: analizar texto por texto el versículo del día, la trivia y la Travesía, y
   usar la versión que mejor se entienda.
3. Preguntas raras (ejemplo: «Según 1 Juan, ¿qué hace el que miente al decir que tiene comunión con Dios?»): que sean CLARAS, no más
   fáciles, en la trivia, el desafío del día y la Travesía.
4. Biblia: un solo botón «Planes e insignias»; adentro, dos botones bien diferenciados, sin subtítulos.
5. «La historia en una línea» no es ni plan ni insignia: que sea una de las dos.
6. Abajo de la Biblia, solo la versión (fuera «frases cortas…», «¿Por qué la RV1909?» y los otros idiomas).
7. Los textitos grises debajo de los títulos «destruyen la visual»: barrer toda la app (Pulso: «la pregunta de hoy (anónima)»).
8. Sala en vivo: crearla desde un PDF o con preguntas propias.
9. Una ruta «Muy pronto» se abrió con la llave.
10. Salmo 1:2: «bienav / enturado» cortado.
11. Un nivel pasó con 1 de 7: aprobar con un 70 %; si no, repetir.
12. Torneos «quedó TILDADÍSIMO»; «Entrar» y «Crear» al mismo nivel; ojo con los subtítulos.
13. Álbum: el pasar de hoja trababa todo y una hoja quedó en blanco; solo con las flechitas, sin seguir el dedo; Sara aparecía en
    «Patriarcas».
14. ¿La sala en vivo le sale más cara?
15. Jugar desde la computadora, con anuncios: «dejalo seteado».
16. Después, guiarlo paso a paso, en orden, con todos los pendientes.

## 2. Lo hecho en la app (commits de `senda-app` del 20-11, todos en `main`)

- **Insignias en Inicio**: solo la empezada con su día pendiente, o «Estás al día»; una futura aparece como «Anotado» solo si se anotó.
- **Palabras viejas, medidas**:
  - `scripts/autor/palabras_raras.py`: frecuencia de uso del español (wordfreq 3.1.1, Apache-2.0) más el glosario de la app.
  - Cada pasaje que se muestra fuera de los ejercicios se abre en la versión libre con menos palabras difíciles, sin perder la palabra
    clave de la RVR1960 (5.943 versículos cambiaron de versión).
  - El versículo del día tiene su tabla propia: Proverbios 3:5 ahora sale en la NBV («no confíes en tu propia inteligencia»).
  - Los ejercicios no cambian: sus palabras se leen igual en la RV1909 y en la RVR1960.
- **Preguntas claras (trivia y desafío del día)**: ocho revisores leyeron las 5.124 preguntas vivas con su versículo.
  - 392 reescritas: lógica invertida (el ejemplo de 1 Juan 1:6 quedó como lo pidió), oraciones anidadas, la palabra que pregunta al
    final, palabras viejas, opciones que no calzan y la correcta que se delataba por el largo.
  - 19 leídas y dejadas con su porqué; 1 retirada (su respuesta no estaba en su versículo).
  - Cada cambio, con su portugués y su inglés; 23 releídas contra el versículo y selladas en la guardia de citas.
  - Mecanismo: `scripts/autor/trivia_revision59.py`, decisiones en `revision59/`.
- **Preguntas claras (Travesía)**:
  - El mismo detector marcó 395 de las 7.586 preguntas de opción; dos revisores las leyeron con su versículo.
  - Mecanismo: `scripts/autor/parches_claridad59.py`, decisiones en `claridad59/` (§4).
- **Biblia**:
  - Un botón «Planes e insignias» (trofeo y calendario).
  - Adentro, dos puertas grandes, «Insignias» (las medallas) y «Planes de lectura».
  - «La historia en una línea» queda solo como la insignia Peregrino.
  - Abajo, solo la versión.
- **Subtítulos que no suman, fuera**:
  - Pulso (ahora «Pulso · la pregunta de hoy (anónima)»).
  - Mi perfil, Amigos y Grupos.
  - Invitar, que decía «cuando tengamos cuentas».
  - Ajustes, las franjas de grupo en Jugar, «Próximamente», la música, Tu año, la misión semanal y la Trivia de la iglesia.
  - Biblia por grupos, y «Te toca» y «Ya jugaste» en Torneos.
- **Sala en vivo**: «Crear una» elige De Senda, Mías (de 3 a 30 preguntas) o De un PDF.
  - Base: migración `20261207000004`.
  - Las preguntas propias quedan en una tabla que nadie lee directo; la correcta llega recién al cerrar cada pregunta.
  - La Pantalla del proyector también las muestra.
  - Prueba de la nube: 425 de 425.
- **Rutas «Muy pronto»**: la apertura anticipada con llave (+200 Talentos, capítulo 83) quedó apagada (`reglas.abrirAntes`).
- **Palabras largas en las parejas** se achican para entrar en una línea, en lugar de cortarse.
- **Aprobar el nivel**: hace falta el 70 % (5 de 7); si no, la pantalla «Repetir el nivel».
- **Torneos**:
  - «Entrar a un torneo» y «Crear uno», dos puertas iguales.
  - Los torneos se piden después de la transición de entrada, en lugar de competir con ella.
- **Álbum**:
  - Una sola página a la vista; las flechas y los puntos la cambian con un deslizamiento corto y un fundido en el hilo nativo.
  - Antes había dos páginas montadas y la de arriba podía quedar invisible.
  - Páginas bien nombradas:
    - «De Noé a José» (Sara no es un patriarca).
    - «De los jueces a Samuel» (Ana y Samuel).
    - «Profetas, exilio y regreso» (Ester y Nehemías no eran profetas).
- **Jugar desde la computadora** (`docs/WEB_JUGAR.md`):
  - La misma app en el navegador, en una columna del ancho de un teléfono.
  - Anuncios de AdSense para juegos HTML5, apagados hasta tener la cuenta.
  - Flujo de GitHub que la publica en Cloudflare Pages cuando estén las claves.
  - La Lany 3D (apagada) quedó afuera de la web para entrar en el límite de 25 MiB por archivo (24,3 MiB).

## 3. Respuestas

### ¿La sala en vivo sale más cara?

- No mientras Senda esté en el plan gratis de Supabase.
- Cada sala gasta unos 45 KB por persona y por minuto (`scripts/economia/capacidad.py`): una de 10 personas durante 20 minutos son
  unos 9 MB.
- El plan gratis (5 GB de tráfico por mes) alcanza para unas 5.700 personas activas por mes, con 1 de cada 10 jugando una sala por
  semana.
- Por encima de eso, Supabase Pro cuesta USD 25 por mes y llega a unas 25.000 personas.
- Sin Max, una sala admite hasta 10 personas; las salas grandes (hasta 500) son de Max, que se paga.

### ¿La suscripción si no tiene Gmail?

- La suscripción no depende de Senda ni de un correo: se compra con la cuenta de la tienda del teléfono.
  - En Android, la cuenta de Google con la que se usa Play (no hace falta que sea Gmail).
  - En el iPhone, el ID de Apple.
- En un teléfono nuevo con la misma cuenta de la tienda, «Restaurar compras» la recupera.
- Guardar el progreso con Google es aparte y opcional.
- Las compras reales y «Restaurar compras» son el próximo trabajo técnico de Claude (pendiente `compras_tienda`), después de que la app
  exista en Play Console.

## 4. Travesía: preguntas claras

- El detector marcó 395 preguntas de opción de las lecciones (de 7.586).
- Dos revisores las leyeron con su versículo: 170 cambiadas y 225 que ya se entendían a la primera (el detector exagera: «¿qué no
  tenemos aquí?» o «¿por medio de qué…?» se leen bien).
- Lo más común: una explicación seguida de una pregunta suelta («¿Cuál?», «¿Qué?»). Ejemplos:
  - «Pablo dice que toda la creación gime. ¿Como quién?» → «Según Romanos 8:22, ¿cómo gime toda la creación?».
  - «Amós pregunta si dos pueden andar juntos sin algo. ¿Sin qué?» → «Según Amós 3, ¿qué necesitan dos personas para andar juntas?».
- Las traducciones: donde la del portugués o el inglés seguía sirviendo, queda; donde no, se escribió en la sesión.
- 12 releídas contra su versículo y selladas.
- 7 retocadas para presentar a la persona antes de nombrarla (regla «empezar por el principio»).
- 3 cambios de opciones no entraron, porque el texto está en más de un guion: quedan las opciones de antes, enteras (mes-4, for-5,
  for-9).
- El manual de Senda (capturas de la Biblia, la sala y Torneos) se actualiza en la próxima sesión.

## 5. Próximos

1. Los pendientes del fundador, de a uno, en este orden:
   - Prueba cerrada de Play.
   - INPI.
   - Chromecast.
   - EE. UU.
   - Cuestionario de edad de Play al subir la versión con llaves.
2. Con la app creada en Play Console: las compras reales y «Restaurar compras».
3. Con el ID de Google Cast: compilar la versión con el ID de Senda.
4. Si el contenido crece: cargar las rutas de la Travesía con `import()` para que la web se parta en trozos.
