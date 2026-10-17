# Claridad, lecciones que entran en la pantalla, música nueva y las ideas votadas: la prueba 17

<div class="enpocas" markdown="1">
**En pocas palabras.** La prueba 17 (17-10-2026) responde al mensaje del fundador de ese día y a su voto en la Consola:
- **Nada que se preste a confusión:** ninguna pregunta puede enseñar un error, aunque la persona no lea la nota. Se corrigió
  Nicea (Arrio), la serpiente y diez «verdadero o falso» de doctrina, y el validador lo controla (§2).
- **Ni textos tapados ni deslizar para seguir:** la pregunta se compacta sola si no entra en la pantalla y el globo de Lany ya
  no queda debajo de la puerta (§3).
- **Música de inicio tipo publicitaria**, de un compositor profesional y libre con crédito (§4). **Lany más viva**, pulida por
  Claude, sin animador pago (§5). El **kit imprimible, en pausa** (§8).
- **Ideas votadas:** desafíos con fecha (Adviento, enero y Semana Santa), **Tu año en la Palabra**, el **sitio de las guías** y
  **Habacuc** jugable; la voz de la Biblia narrada encontró un problema de licencia que se explica en §6.
</div>

## 1. Lo que pidió el fundador y dónde quedó

Resumen de lo pedido (sin citas textuales) y cómo se resolvió.

| Pedido | Qué se hizo | Estado | Dónde |
|---|---|---|---|
| Una pregunta de Historia de la Iglesia mostraba como respuesta lo que enseñaba Arrio: quien solo responde podía aprender el error. Todo tiene que ser lógico y claro, sin prestarse a confusión | Regla de redacción para toda la app, corrección de Nicea, la serpiente y diez verdadero o falso; el validador da error si se nombra a un hereje sin decir que era un error | Hecho | §2 |
| En la Travesía a veces los textos quedan tapados, y en las respuestas a veces hay que deslizar para seguir | La pregunta se compacta en dos pasos si no entra; la letra del sistema hasta 1,2; el globo de Lany se corre de la puerta | Hecho | §3 |
| La música de inicio, otra vez: algo mejor, más tipo publicitaria, libre si hace falta | «Nonstop» de Kevin MacLeod (CC BY 4.0, con el crédito en la app) y ocho alternativas | Hecho (para escuchar) | §4 |
| El kit, no por ahora | En pausa: no se difunde ni se sigue | Hecho | §8 |
| El animador de Rive no se puede pagar: que lo haga Claude lo mejor posible | Lany pulida con código: reposo, parpadeo, suspiro y acompañamiento de orejas, jopo y cola | Hecho (primera ronda) | §5 |
| Ya marcó las ideas para ser la número uno; avanzar con eso y con todo lo pendiente | De las diez votadas que sí, cuatro avanzaron sin cuentas; las de grupos esperan Supabase | Hecho / en curso | §6, §7 |

## 2. Que nada enseñe un error

**El problema.** En «Nicea: Jesús es Dios», la pregunta era qué enseñaba Arrio y la respuesta correcta, la frase de su error. La
nota lo aclaraba, pero quien responde rápido y sigue se queda con la frase marcada como correcta. Es el riesgo más serio que puede
tener una app que enseña la Biblia.

**La regla (docs/REDACCION.md en el repositorio de la app).** Lo que se lee al responder tiene que enseñar la verdad por sí solo:
1. la respuesta correcta siempre dice algo verdadero;
2. toda enseñanza falsa se nombra como falsa en la misma frase («enseñaba un error», «negaba que…»);
3. las mentiras que cita la Biblia (la serpiente, el diablo) se presentan como mentira en el enunciado;
4. en doctrina, el verdadero o falso afirma la verdad; una frase falsa solo va cuando es un hecho del relato, y la explicación da
   la verdad con su cita;
5. los distractores pueden ser errores, pero nunca quedan como lo único que se lee;
6. una sola respuesta posible, sin dobles negaciones, con palabras que la RV1909 y la RVR1960 conservan;
7. la línea de la historia en cada lección; 8. lo interpretativo, marcado.

**Lo corregido.** Nicea («¿Por qué se reunió el Concilio de Nicea?», con la respuesta «Para responder al error de Arrio, que negaba
que el Hijo de Dios fuera Dios eterno»); las dos preguntas de la serpiente en El evangelio («Completa la mentira de la serpiente»);
y diez verdadero o falso de doctrina que mostraban un error para marcarlo como falso, que ahora afirman la verdad.

**Cómo se controla.** El validador da error si una pregunta nombra a quien enseñó una herejía conocida (Arrio, Marción, Pelagio,
Sabelio, gnósticos y otros) y ni la pregunta ni la respuesta correcta lo llaman error; y avisa si un ejercicio completa palabras de
la serpiente o del diablo sin decir que son mentira. El resto se revisa pregunta por pregunta al escribir, y después los revisores
doctrinales.

## 3. Ni textos tapados ni deslizar para seguir

La captura que mandó el fundador no llegó a esta sesión; se reprodujo el problema en tres tamaños de teléfono (360×640, 360×780 y
393×852) y con la letra del sistema agrandada.

- **Lo que se encontró.** En la Travesía, el globo de Lany («¡Empecemos! Toca el primer nivel») quedaba debajo de la puerta y su
  cartel ENTRAR en pantallas angostas; y en las rutas que empiezan con secciones en preparación (Los doce profetas), los puntos de
  la senda y las puertas fantasma cruzaban el título del cartel de la sección («Jonás»). En la lección, con la letra del teléfono agrandada (muy común en Android), la última opción
  quedaba fuera de la pantalla: había que deslizar para verla. En la web de prueba, además, el ScrollView no avisaba su tamaño.
- **Lo que se hizo.** La pregunta mide si entra; si no entra, se compacta en dos pasos (Lany más chica, enunciado y opciones con
  letra y espacios menores) y vuelve al tamaño normal en la siguiente. La letra del sistema se respeta hasta 1,2 veces. El globo
  de Lany se ubica del lado libre y, si no entra a lo ancho, se angosta y baja una línea. El cartel de cada sección va por encima
  de la senda, con fondo opaco, y Lany por encima de los carteles.
- **Verificación.** Las seis preguntas de la primera lección de Historia de la Iglesia, El evangelio y Quién es quién, en 360×640
  y 393×852 con letra a 1,2: ninguna obliga a deslizar (antes, cinco de seis en 360×640).

{{PANTALLAS17}}

## 4. La música de inicio: tipo publicitaria

- **Dónde se buscó (HECHO, 17-10-2026).** FreePD, la biblioteca de música en dominio público (CC0), cerró: su página dice «Site
  Closed». La biblioteca de Kevin MacLeod (incompetech.com) sigue abierta con licencia Creative Commons Atribución 4.0, que permite
  usarla en una app comercial con el crédito.
- **La elegida.** Del catálogo (1.443 temas) se filtraron los de 100 a 135 por minuto, luminosos y con aire de video corporativo o
  publicidad, y se bajaron nueve. Quedó **«Nonstop»** (128 por minuto; guitarra, percusión y sintetizadores), desde su parte más
  fuerte: 22 segundos con fundido; la firma de apertura, dos compases del mismo golpe.
- **Para elegir.** En la Consola, ocho alternativas del mismo autor («Inspired», «On My Way», «Werq», «Rainbows», «Getting it Done»,
  «Wepa», «Newer Wave», «Montauk Point») y las anteriores. El crédito está en Licencias y créditos y en assets/sonidos/CREDITOS.md.

## 5. Lany, pulida por Claude

Sin animador pago (decisión del fundador), la primera ronda de pulido por código en Rive:
- **reposo de 9,6 segundos** con tres respiraciones distintas (inspira más rápido de lo que suelta, como una persona), el peso que
  pasa de una pierna a la otra, una mirada al costado y otra hacia arriba;
- **parpadeo de 7,3 segundos**, a intervalos distintos, con uno doble y uno a medias; el párpado baja rápido y sube más lento;
- con los dos ciclos, la combinación tarda más de diez minutos en repetirse: no se nota el bucle;
- **un suspiro** cuando está triste; orejas, jopo y cola que llegan un poco tarde a cada movimiento.

Lo que sigue: más transiciones entre estados y gestos nuevos donde la app los pida.

## 6. Las ideas votadas

El fundador votó en la Consola: **sí** a proyector, temporadas, ligas, duelos, la Biblia entera, líderes, voz, el sitio web, Tu año
y portugués; **no** al sello de confianza, que sale de los planes (la revisión doctrinal sigue igual, sin sello visible).

| Idea | Qué se hizo | Estado |
|---|---|---|
| Desafíos con fecha | «Adviento: la promesa cumplida» (27 días, del 29-11 a Navidad), «21 días con Jesús» (Juan, del 1 al 21 de enero) y «La semana que cambió todo» (Semana Santa 2027), con foco por día e insignia | Hecho |
| Tu año en la Palabra | Resumen del año en la app, para compartir con solo números | Hecho |
| El sitio de las guías | 66 páginas de libros, Quién es quién y sitemap, sin JavaScript | Armado; falta publicarlo |
| La Biblia entera | Habacuc jugable (seis lecciones, cofre y repaso) | En curso: van 3 de 66 |
| Voz de la Biblia narrada | Se investigó la voz elegida y su licencia (abajo) | Espera decisión |
| Proyector, ligas, duelos, líderes | Necesitan cuentas (Supabase) | Esperan las cuentas |
| Portugués | Después de que funcione en español | Después |

**Desafíos con fecha.** Cada día tiene un título, un foco con nuestras palabras y la cita donde se ve el cumplimiento, verificada
contra la RV1909 (por ejemplo, Isaías 7:14 y Mateo 1:23). Lo que es lectura cristiana y no lo dice un versículo del Nuevo Testamento
va marcado (Génesis 3, 22 y 49, Números 24, Jeremías 23, Isaías 60). Los capítulos son enteros, así cuentan solos al leerlos. Uno
se anota antes y el plan empieza en su fecha; aparece en Biblia y, una semana antes y mientras dura, en Inicio. Regla de corte
(del capítulo 41): si el de enero suma menos de 1.000 participantes, el siguiente se hace solo dentro de la app, sin campaña.

**Tu año en la Palabra.** Capítulos y días con la Palabra, racha más larga, lecciones, versículos marcados, partidas, el libro más
leído y los libros completos. Se calcula en el teléfono y al compartir van solo los números. Desde esta prueba la app guarda el
día en que se lee cada capítulo; lo leído antes cuenta para 2026, su primer año.

**El sitio de las guías.** `web/` en el repositorio de la app, armado desde el contenido ya verificado (sin contenido nuevo): una
página por libro con su guía, el versículo clave y el bosquejo; Quién es quién; robots y sitemap. Publicarlo en Cloudflare Pages es
gratis, pero necesita una cuenta y elegir la dirección (gratis, senda-….pages.dev, o un dominio propio de unos USD 10 por año,
ESTIMACIÓN): lo decide el fundador.

**La voz de la Biblia narrada: el problema de licencia (HECHO, 17-10-2026).** La voz libre que eligió el fundador, Piper
«es_MX-ald-medium», se entrenó con datos de licencia libre (Unlicense), pero **a partir de otra voz** («davefx», CC0) que a su vez se
entrenó **a partir de «lessac»**, cuya base de datos (Blizzard 2013) tiene licencia **solo para investigación**: prohíbe expresamente
el uso comercial y el desarrollo de productos de voz. Casi todas las voces de Piper en español heredan esa base («sharvard»,
«daniela»); la única entrenada desde cero con datos de dominio público («carlfm») es de calidad muy baja; «claude» declara Apache
2.0 pero sin decir de qué voz parte. No es seguro usar ninguna para audio que se reparte en una app con ingresos.

- **Recomendación:** lanzar con la voz del teléfono (gratis, ya está en la app, el fundador ya eligió la mejor) y pasar a una voz
  neuronal con licencia comercial clara (ESTIMACIÓN: USD 100 a 300 por toda la Biblia, más almacenamiento gratis hasta 10 GB) solo
  si se cumple la regla de corte.
- **Regla de corte:** si al mes del lanzamiento más del 20 % de los usuarios activos usa «Escuchar» al menos una vez por semana.
- **Pendiente del fundador (voz17):** confirmar la recomendación. Gastar requiere su aprobación (regla 8).

## 7. Habacuc, libro por libro

Mismo armado que Rut y Jonás, en «Los doce profetas»: antes de abrirlo (un profeta que le habla a Dios, los caldeos, la fecha
estimada); «¿Hasta cuándo?» (la queja y la respuesta); «El justo por su fe vivirá» (la segunda queja, el centinela y la visión
escrita en tablas); los cinco ayes contra el opresor y la tierra llena del conocimiento de la gloria de Jehová; «Aunque la higuera
no florezca» (la oración final); y «Habacuc y el evangelio» (Romanos 1:17, Gálatas 3:11 y Hebreos 10:38), con lo que sigue,
Sofonías. Treinta y seis preguntas, cofre y repaso; citas textuales de la RV1909 y huecos con palabras que conserva la RVR1960. La
guía del libro abre su travesía. Van 3 de los 66 libros jugables.

## 8. El kit imprimible, en pausa

El fundador lo deja para más adelante. Queda guardado tal cual (docs/kit en el repositorio de la app); no se difunde, no se manda a
nadie y no se sigue trabajando. Si se retoma, sigue siendo gratis y compartirlo es un envío a terceros que decide el fundador.

## 9. Cómo probar la prueba 17 y lo que sigue

**Probar (pendiente probar17 en la Consola):** instalar el APK prueba 17; escuchar la bienvenida nueva; hacer «Nicea: Jesús es
Dios» y ver que todo entre sin deslizar (mejor con la letra del teléfono agrandada); mirar a Lany quieta un rato; anotarse en
Adviento; abrir «Tu año en la Palabra»; jugar Habacuc.

**Lo que sigue:**
1. Más libros jugables, de a varios por semana, empezando por los cortos y los que más se leen.
2. Las ideas de grupos (proyector, ligas, duelos y líderes) apenas estén las cuentas (pendientes del fundador: Supabase y el
   token como secreto de GitHub).
3. Publicar el sitio cuando el fundador cree la cuenta de Cloudflare (web17).
4. Seguir puliendo a Lany y revisar con el fundador cualquier texto que todavía quede tapado (con captura, si puede).
