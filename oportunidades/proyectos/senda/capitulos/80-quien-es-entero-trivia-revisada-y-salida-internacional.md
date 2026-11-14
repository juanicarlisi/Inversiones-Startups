# Capítulo 80 — Prueba 55: ¿Quién es? entero, la trivia leída de punta a punta y la salida internacional

**Fecha:** 14-11-2026. **Origen:** el fundador probó el APK 54 y mandó doce pedidos, más tres capturas («screenshot 1 y 2: errores en
la travesía de cosas que se leen mal; screenshot 3: preguntas raras de la trivia que siguen apareciendo»). Cerró con: «Hacé todo esto
totalmente tranquilo, despacio, línea por línea… mejor CALIDAD que velocidad… que quede PERFECTO».

## 1. Lo que pidió (resumido; el texto entero está en la sesión)

1. Nombres por letra: «¿tiene todos los nombres de la Biblia? Dije Teófilo y no lo tomó… tarda una banda… si digo muchos seguidos no
   los toma bien».
2. Una fecha clave para un torneo con premios, «para incrementar participación exponencial al principio».
3. «Para la primer salida también cubramos EE. UU., Brasil, UE… recopilá absolutamente todo lo que haya que hacer».
4. Trivia: preguntas «¿cuál de estas frases dijo Pablo?», algunas graciosas («cuando hay hambre no hay pan duro»), siempre sanas.
5. Revisar travesías y trivia: «todo lo correcto que vos llegues a ver».
6. «Lany juega muy mal»; mientras juega Lany, un anuncio para quien no tiene el Pro.
7. «Salir» en la trivia casi no se ve, y no tiene que perder la partida: que quede abierta, como los duelos.
8. ¿Quién es?: «puse "¿es de la época de Jesús?" y me puso "¿es del Nuevo Testamento?"… TIENEN QUE ESTAR TODAS LAS PREGUNTAS HABIDAS Y
   POR HABER… Trabajá EXHAUSTIVAMENTE».
9. Cada juego consume una vida.
10. ¿Quién es?: un comodín de pista, escribir tocando el globo de Lany y menos preguntas («parece fácil»).
11. La Travesía global: «está fea la ruta y tiene en general algo feo».
12. El instructivo de la app: «CLAVE… EXCELENTE UX, rápido, dinámico, poco texto… el de "Antes o después", un cosito que aprieta… MUY
    INTUITIVO». Y la velocidad: «volver atrás en los niveles de Antes o después tarda».

## 2. Lo que se hizo

### 2.1 Nombres por letra (pedido 1)

- **Todos los nombres:** de 1.400 a **1.918 nombres de personas** de la Biblia, sacados del texto de la RV1909 y cruzados con
  Theographic (CC BY-SA, solo como referencia para encontrarlos). Teófilo está.
- **Más rápido:** mientras la persona habla, cada nombre se suma apenas se termina de decir (antes esperaba el final de la frase); la
  frase completa se confirma a los 450 ms. Al reconocedor del teléfono se le pasan los nombres de la letra como pistas.
- Debajo de la lista, «Todos los nombres con la L en la Biblia» para consultar. Prueba automática: Teófilo y varios nombres seguidos.

### 2.2 ¿Quién es? (pedidos 8 y 10)

- **De 263 a 542 preguntas**, cada «sí» con su versículo (**3.930**). Cuatro revisores, uno por tema (cuándo y dónde; quién era y su
  familia; qué hizo y qué le pasó, con Dios y con Jesús; en qué libro aparece y con quién), pensaron todas las preguntas que hace la
  gente y contestaron cada una para los 71 personajes leyendo la RV1909. «¿Es de la época de Jesús?» ahora es su propia pregunta.
- La unión se hizo pregunta por pregunta (`scripts/autor/quien_soy_55.py`): cinco repetidas fusionadas, palabras que llevaban a dos
  preguntas separadas con frases propias («está en Romanos» ≠ «era romano»; «su hijo es otro personaje» ≠ «tuvo hijos»; «tuvo una
  hija»; «no se casó»), tres preguntas que daban «no» para los 71 fuera. **1.635 frases de prueba**, todas pasan; el validador revisa
  que cada cita exista y que lo citado entre «» se lea así (12 citas corregidas).
- **Pista:** un comodín por partida que cuesta una pregunta: Lany elige la pregunta que mejor parte el tablero.
- **Escribir tocando el globo de Lany**, además del botón de abajo.
- **Más difícil:** tope de preguntas = 1,5 × log2(tarjetas): 5 con 12, 6 con 16 y 20. Simulado con el banco nuevo: quien elige bien gana
  84 a 89 %; quien pregunta sin pensar, 61 a 68 %.

### 2.3 Juegos, vidas y anuncios (pedidos 6, 7 y 9)

- **Lany juega mejor:** acierta del 92 % en las fáciles al 64 % en las más difíciles (antes, 62 % en todas).
- **Anuncio en el turno de Lany** para quien no tiene plan pago (nunca a menores de 13, con la misma medida de los juegos: desde la
  tercera partida del día y cada 4 minutos).
- **Salir sin perder:** la partida de práctica del Espadeo queda guardada; al volver aparece «Seguir la partida (n/6)» y «Partida nueva».
  El botón «Salir» es más grande y con borde.
- **Cada juego usa una vida** (¿Quién es?, Nombres por letra, Antes o después, Vivir la historia, la copa y En la frente; los torneos y
  los duelos siguen como estaban).

### 2.4 Trivia (pedidos 4 y 5, y la captura 3)

- **Banco 55:** 46 preguntas «¿Cuál de estas frases dijo…?»: la correcta, textual de la RV1909; las otras, frases de otros personajes
  y, en la mitad, un refrán que evidentemente no está en la Biblia («Cuando hay hambre no hay pan duro»), nombrado como refrán al
  responder.
- **La trivia entera, leída una por una:** 16 revisores, cada uno con unas 330 preguntas, contra su pasaje de la RV1909 (y la Bíblia
  Livre y la BSB). **3.240 decisiones: 2.864 reescritas y 358 retiradas.** Lo que más se corrigió: datos menores que ahora preguntan
  lo que enseña el pasaje (la captura del Predicador y sus vacas y ovejas, Eclesiastés 2:7, ahora pregunta a qué conclusión llegó),
  respuestas con palabras de una sola versión («arco de acero/bronce», «topacio», «estiércol»), personas sin presentar, incorrectas que
  eran verdad en otro lugar de la Biblia y traducciones con opciones distintas del español. **5.136 preguntas vivas.**
- Pendientes chicos: «Capernaum» como la escribe la RV1909; Esaú «rubio», no «pelirrojo»; Mateo 23:23 abre en la PDT («justicia»).

### 2.5 La Travesía: lo que se leía mal (pedido 5 y capturas 1 y 2)

- **Capturas:** el diagrama de los 66 libros rehecho (rótulos en dos líneas, ancho mínimo por libro, leyenda de 10 grupos); la línea de
  tiempo con el «cuándo» de alto fijo y un fundido a la derecha; la frase «Las respuestas están en…» fuera del globo de Lany.
- **Lectura línea por línea de las tres áreas por las que entra la gente** (220 lecciones, tres revisores), con los arreglos aplicados
  en el contenido, el script de autor y la traducción a la vez (`scripts/autor/parches_lectura55.py`; decisiones en
  `scripts/autor/lectura55/`):
  - **El evangelio** (85 lecciones, 175 arreglos): dos errores doctrinales puestos como frase a marcar (Jesús «primer ser creado»; la
    Trinidad como «tres máscaras»), 18 verdadero o falso que mostraban el error, dos respuestas correctas que eran la frase de un error,
    «Tito agrega» (la carta es de Pablo), un «¿Sabías que…?» con texto de la RVR1960, nombres y palabras sin presentar.
  - **Jesús, el Mesías** (79 lecciones, 47): el silencio de Jesús fue ante Pilato, no ante el sumo sacerdote; el canto del Siervo
    empieza en Isaías 52:13; lo «citado de Jeremías» era Hebreos 8; «acorneado»; la Trinidad afirmada como doctrina.
  - **Panorama** (56 lecciones, 114): Nínive no era la capital en tiempos de Jonás; Lamentaciones no es «mayor por larga»; Rut termina
    con David; fechas y autores con fuente o como lo que se cree.
  - Costo a mirar (INFERENCIA): en El evangelio, casi todos los verdadero o falso quedan «Verdadero» (regla de no mostrar el error).
- **Lo que falta:** las otras 10 áreas (1.405 lecciones) no se volvieron a leer en esta prueba; ya habían sido releídas al escribirse
  (prueba 54). Es lo primero de la próxima si el fundador quiere la misma vara en todas.

### 2.6 El mapa global de la Travesía (pedido 11)

Cielo de noche con estrellas, el camino con un halo ámbar suave y piedras redondeadas (sin la sombra negra que lo hacía pesado), cada
área como una postal con borde en su color, luz desde arriba, medalla con su ícono y el nombre en una pastilla que se lee sobre
cualquier escena. Verificado en la vista previa web.

### 2.7 El instructivo de primer uso (pedido 12)

Rehecho como la pista de «Antes o después»: la primera vez en cada pestaña la pantalla se oscurece salvo el botón real que importa y
el mismo círculo **lo aprieta una y otra vez**, con **una sola línea** al lado y Lany chiquita. Dos o tres pasos por pestaña: la
lección de hoy, las vidas y Jugar (Inicio); la puerta encendida y el mapa (Travesía); el Espadeo y los juegos (Jugar); la lectura de
hoy y «Planes y versiones» (Biblia); amigos y grupos (Comunidad). Un toque pasa; «Saltar» cierra. Reemplaza los carteles de la prueba
35, que hablaban de cosas que ya no están (pasar de hoja). En Jugar, «Cómo se juega» espera al instructivo. Probado en las cinco
pestañas en la vista previa.

### 2.8 Velocidad (pedido 12)

- **Volver atrás en «Antes o después»:** el camino de niveles queda montado (oculto) y el botón atrás del teléfono vuelve al instante.
- **Al abrir la app** ya no se cargan el banco de «¿Quién es?» (1,1 MB, el doble desde esta prueba) ni el del Espadeo (2,9 MB): el
  álbum liviano (`albumBase.ts`) y el estado del desafío del día (`estado/desafio.ts`) se separaron de sus pantallas.

### 2.9 La salida en EE. UU., Brasil y la UE (pedido 3)

Tres informes con fuentes primarias, uno por mercado (holding: `conocimiento/2026-11-14-senda-lanzamiento-eeuu.md`, `-brasil.md` y
`-ue.md`). Veredicto (INFERENCIA, apoyada en los HECHOS de cada informe): **los tres son posibles el 18-12, pero ninguno con la app tal
cual**, y lo que frena no es el código sino papeles y personas que solo el fundador puede contratar o firmar.

**Ya hecho en el código (la base común, APK 55):**
- `src/util/region.ts`: la región y sus reglas. EE. UU. (opción A del informe) y Brasil: Comunidad solo 18+ y sin premios; EE. UU. sin
  la sala en vivo (patente US 10.339.825 a revisar). UE y Reino Unido: Comunidad desde la edad digital de cada país (España 14,
  Portugal 13, Irlanda 16, Reino Unido 13), estadísticas solo con un «sí» y sin anuncios al principio. Latinoamérica, como siempre.
- Señales de edad de Play y Apple (`expo-age-range` 57): gana la franja más baja entre la tienda y la bienvenida.
- La edad, obligatoria antes de cualquier cuenta (la hoja de normas la pide si falta) y una casilla aparte, sin marcar, por los datos
  que pueden mostrar la fe (RGPD art. 9, LGPD, Connecticut). Las normas pasan a la versión 2026-11-14.
- Voz de menores de 13 solo en el teléfono; en Brasil, sin anuncios para adolescentes. Siete pruebas automáticas de las reglas.

**Lo que falta en el código (ESTIMACIÓN: 2 a 3 sesiones):** el país de la tienda (Play Billing y StoreKit) en lugar de la región del
teléfono; privacidad, términos y normas en inglés con la sección de EE. UU. y en portugués con la LGPD; la versión UE (bases legales,
art. 9, representante, DSA con formulario de avisos de contenido ilegal abierto a cualquiera); el modo protegido de Brasil completo;
clasificación IARC y fichas en inglés y portugués.

**Lo que solo puede hacer el fundador (en orden, cada uno con su regla de corte):**

| Mercado | Indispensable | Costo (ESTIMACIÓN) | Corte |
|---|---|---|---|
| EE. UU. | Decidir la opción A (Comunidad 18+); W-8BEN en App Store Connect y declaración de AdMob; correo de soporte; prender «Declared Age Range» en el App ID | USD 0 | 05-12: si las señales de edad no funcionan en un teléfono real, enero |
| Brasil | Representante legal persona jurídica en Brasil con poder apostillado; registro en el Sistema Nidus; un abogado brasileño lee privacidad y términos | a cotizar | 05-12: si no está firmado, vuelve al 01-03-2027 |
| UE (España, Portugal, Irlanda) | Representantes RGPD art. 27 y DSA art. 13; estado de comerciante en las tiendas (dirección, teléfono y correo quedan públicos); aceptar los DPA de Supabase, PostHog, Anthropic, Expo y Google | EUR 800 a 1.650 por año (+ Reino Unido EUR 340 a 850) | 08-12: si falta algo, la UE sale el 15-01-2027 |

**Recomendación (INFERENCIA):** el 18-12 salen Latinoamérica y EE. UU. con la opción A (casi sin costo y lo que falta lo hace Claude);
la UE el mismo día solo si el fundador aprueba los representantes antes del 25-11 (sin eso no llegan los papeles); Brasil depende del
representante: si no está contratado a fin de noviembre, conviene sostener el 01-03-2027 que ya estaba decidido y llegar con todo para
Pascua. DEC-2026-11-14-2, a decidir.

### 2.10 El torneo con premios (pedido 2)

**Recomendación (DEC-2026-11-14-1, a decidir): «La Gran Copa de Verano», final el sábado 30-01-2027 a las 20 h de Argentina.**

- **Por qué esa fecha (INFERENCIA):** seis semanas después del lanzamiento (tiempo para que el boca a boca crezca y para corregir lo que
  aparezca), en pleno verano del sur, con chicos de vacaciones y **campamentos de iglesias** (enero es el mes de los campamentos), y
  antes de la vuelta a clases y de la llegada a Brasil (01-03). El 18-12 se anuncia; la Copa de Navidad (19-12) queda como ensayo sin
  premio.
- **Cómo hace crecer (el mecanismo, no la fecha):** clasificatorias los sábados 9, 16 y 23 de enero (copas de 15 preguntas, las mismas
  para todos) y **una tabla por grupo**: el puntaje de una iglesia o un grupo de jóvenes es la suma de sus diez mejores, así que a cada
  líder le conviene sumar a todos los de su grupo. El premio principal va al grupo (por ejemplo, un kit de estudio para el grupo de
  jóvenes) y premios chicos a los tres primeros; a un menor, el premio se entrega a su adulto responsable.
- **Lo legal (HIPÓTESIS a validar en la sesión legal, DEC-2026-11-10-5):** concurso de habilidad, gratis y sin compra, con bases
  públicas, ganador por puntaje y desempate por tiempo (sin azar). Premios solo en Latinoamérica, empezando por Argentina; en EE. UU.,
  Brasil y la UE se juega sin premio (los tres informes lo piden así al principio).
- **Lo que hace falta:** la tabla por grupo en las copas y las bases escritas (Claude); el presupuesto de premios (ESTIMACIÓN USD 150 a
  250, a aprobar por el fundador).

## 3. Controles

- Validador de contenido: «Todo en orden». Pruebas de arranque: 39 de 39. Tipos: sin errores.
- ¿Quién es?: 1.635 frases de prueba; ninguna clave lleva a dos preguntas.
- Vista previa web: el mapa global, el instructivo en las cinco pestañas y el juego de Jugar sin dos carteles a la vez.
- Auditoría de textos (`scripts/auditoria/textos.cjs`, letra normal y grande): 92 pantallas, ninguna con textos que se pisan o se
  cortan. Ahora arranca con la guía vista y revisa aparte el globo de la guía en los tres idiomas (antes la guía tapaba la barra y
  la auditoría no podía cambiar de pestaña).
- APK 55 y la versión de iPhone 55, compilados en GitHub con todo lo anterior.

## 4. Próximos

1. Las decisiones del fundador: el torneo (DEC-2026-11-14-1) y la salida internacional (DEC-2026-11-14-2).
2. Si dice que sí a EE. UU. y la UE: textos legales en inglés y portugués, versión UE con el DSA, país de la tienda, fichas.
3. La lectura línea por línea de las otras 10 áreas de la Travesía (1.405 lecciones).
4. La tabla por grupo en las copas y las bases de la Gran Copa de Verano.
5. Probar en un teléfono: el instructivo, las vidas en cada juego, la partida guardada del Espadeo y Nombres por letra con varios
   nombres seguidos.
