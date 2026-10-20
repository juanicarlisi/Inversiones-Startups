# CLAUDE.md — Sistema operativo del repositorio

Este repositorio es la **memoria externa permanente** y el **cerebro operativo** de una organización privada de investigación,
estrategia, inversión y creación de empresas con una sola misión:

> **Encontrar y convertir oportunidades económicas extraordinarias en una cartera de negocios e inversiones que genere caja,
> se reinvierta y componga durante años.** Filosofía: *ir siempre un paso adelante*. Principio económico: *con poco hacer muchísimo*
> (máximo valor creado por unidad de recurso: capital, tiempo, atención, riesgo).

Cada sesión de Claude que trabaje acá debe leer este archivo y actuar como el equipo descrito abajo, no como un chatbot.

---

## 1. Quién es el fundador (resumen; detalle en `perfil/fundador.md`)

- Vive en **CABA** (Argentina). **Conoce logística.** Capital recurrente inicial ≈ **USD 400/mes**, ampliable si la relación
  capital→valor lo justifica.
- Quiere usar la IA **al máximo** como fuerza de trabajo (desarrollo, trámites, marketing, ventas, finanzas) y está dispuesto a pagar
  planes caros si el retorno lo justifica (ver `doctrina/05-palanca-ia.md`).
- Da ejemplos para orientar; **son ilustrativos de la dirección, no candidatos a analizar**. Usarlos para entender qué busca y
  **barrer el espectro por iniciativa propia** (no esperar a que traiga cada idea): cada ejemplo abre una familia de alternativas,
  incluido "replicar lo que ya funciona" (activos de Flippa y similares con difusión propia). Toda alternativa lleva roadmap y regla
  de corte; no se descarta por descartar: si no conviene como está, se muestra la mejor versión ("así no → mejor así"). Tener en
  cuenta lo que Claude puede construir hoy (aclarado el 26-09-2026; ver DEC-2026-09-26-8).
- **Prefiere ingresos pasivos o casi pasivos, sin salir a vender** (26-09-2026). Toda propuesta debe decir quién vende por él
  (el mercado, una plataforma con demanda propia, un operador o un negocio que ya vende) y cuántas horas pide. Ver DEC-2026-09-26-5.
- **Formas de pensar obligatorias** (28-09-2026, `doctrina/08-formas-de-pensar.md`): barrer todo el ecosistema a partir de sus
  ejemplos; **mirar lo que ya funciona** (MercadoLibre → eBay) y copiar, mejorar o fusionar; explorar antes de descartar (lo chico
  puede volverse viral); **nunca descartar por "es caro conseguir audiencia"**: se construye con difusión a costo cero y sin cara;
  buscar siempre un **diferencial extraordinario**; cada proyecto sobreviviente lleva definición completa, opciones de nombre y caso
  de negocio a 5 años (`oportunidades/proyectos.yaml`).
- **Datos del 28-09-2026:** suite cristiana con foco **protestante**; Claude **Pro hasta fin de 2026**, después evaluar Max; entrenar
  IA y "horas en dólares" quedan fuera salvo algo fácil y seguro; recordatorios pendientes del fundador: cargar su agente de
  inversiones (renta), su agente de alquileres y una descripción general (sin código ni datos de la empresa) de su simulador de
  última milla.
- **Datos del 06-10-2026:**
  - todo diseño minimiza el costo de servidores y escala sin rehacer la app;
  - los ejemplos del fundador (juegos, apps) son semillas para evaluar, fusionar y generar familias, nunca encargos de copia (`doctrina/08-formas-de-pensar.md` §9).
- **Datos del 11-10-2026:**
  - lo inspirado en juegos ajenos (Mario Party y otros) se hace con impronta propia: mecánicas de más de 20 años o propias, nada de marcas ni del aspecto del original, búsqueda de patentes y consulta legal antes de construir;
  - el proyecto Senda tiene un mapa de toda la app (`oportunidades/proyectos/senda/mapa_total.yaml`) que se actualiza al cerrar cada sesión, igual que `estado.yaml`.
  - en Senda, **todo enseña y edifica**: cada función y cada juego tiene que ayudar a aprender y crecer en la relación con Dios y en su Palabra; lo que solo entretiene, afuera (salió «Alimenta a Elías»; puerta de dos preguntas en el capítulo 10, §14);
  - la Biblia abre directo, sin nada antes de leer; el contenido bíblico se verifica línea por línea contra el texto y lo interpretativo se marca como tal;
  - lo que el fundador trae de terceros (por ejemplo, un juego visto en una conferencia) es dirección, nunca algo para copiar.
- **Datos del 12-10-2026 (Senda, prueba 10):**
  - misión nueva: que una generación conozca la Palabra de Dios como ninguna antes y por ella se rinda a Cristo y lo ame; la visión se
    mide por lo que la gente sabe y vive, no por descargas;
  - cada travesía, absolutamente completa: en cada nivel, todo lo que hay que leer y dónde está cada respuesta (también en la trivia); lo
    que no está en un versículo va como nota con su fuente;
  - fuentes protestantes confiables; la biblioteca de comentarios (repositorio `biblioteca-estudios-biblicos`) solo para entender,
    nunca para copiar (capítulo 23 §3b);
  - el inventario bíblico (`oportunidades/proyectos/senda/inventario_biblico.yaml`) se completa en cada sesión y su cobertura se
    regenera con `python3 herramientas/inventario_senda.py`, igual que `estado.yaml` y `mapa_total.yaml`.
- **Datos del 12-10-2026 (Senda, prueba 11):**
  - cada travesía con una línea clarísima y progresiva: en las rutas que cuentan una historia, cada lección dice qué pasó antes, qué
    pasa, cuándo y qué sigue; cada capítulo, qué se aprende (lo exige el validador);
  - lo revisado y confiable se publica (Claude revisa pregunta por pregunta); los revisores doctrinales humanos confirman después;
  - no quedarse en «no se puede»: explorar hasta la última vía (así se hizo con la RVR1960), siempre dentro de lo legal.
- **Datos del 13-10-2026 (Senda, prueba 12):**
  - la mascota se escribe **Lany** (antes «Lani»); la historia anterior queda como se escribió;
  - Lany es la guía de la Travesía, con la calidad de una app hecha por expertos (patrón Duolingo como dirección, nunca copia);
  - el «+» de estudio, a la vista en cada versículo al leer (DEC-2026-10-13-1).
- **Datos del 13-10-2026 (Senda, prueba 13):**
  - Lany **no habla** (ni boca ni voz): actúa con el cuerpo y la mirada; su aspecto con volumen, como Duolingo, se hace en Rive;
  - licencias: la recomendación (no sacar anuncios ni suscripciones; lanzar con las versiones libres; sumar la NTV por API.Bible con
    regla de corte) espera su decisión (DEC-2026-10-13-2; capítulo 38 §5).
- **Datos del 16-10-2026 (Senda, prueba 14):**
  - calidad antes que velocidad: ir despacio, leer todo y preguntar cualquier duda;
  - Senda trabaja con un ministerio juvenil aliado (su nombre y su material van solo en el repositorio privado de la app); su estudio
    del evangelio es la base del área «El evangelio» (temas, nunca copia);
  - la Travesía, en 15 áreas y 5 estantes; nada de doctrinas secundarias; Israel y los últimos tiempos, sin tomar posición;
  - libros de referencia: solo de autores y editoriales protestantes reconocidos, para entender y nunca para copiar ni enseñar desde
    ellos; los de autor desconocido o dudoso no se abren; el repositorio de libros no se toca hasta que el fundador avise;
  - la trivia y la Travesía se responden leyendo la RVR1960 (los huecos usan palabras que la RVR1960 conserva);
  - la RVR1960 completa solo se licencia a organizaciones registradas (Digital Bible Library): la figura legal y el camino de
    licencias esperan su decisión (DEC-2026-10-16-1; capítulo 39 §4).
- **Datos del 16-10-2026 a la noche (Senda, prueba 15):**
  - «El evangelio» enseña la doctrina del estudio del ministerio aliado tal cual, aunque haya diferencias: es la única excepción a
    «nada de doctrinas secundarias» (DEC-2026-10-16-2; capítulo 40 §2);
  - la Biblia de la app se escribe con la ortografía de hoy («creó», nunca «crió»); lo que la RVR1960 dice distinto se resuelve en los
    ejercicios, que se leen igual en las dos;
  - Lany es un personaje adulto y canchero (más alto, esbelto, menos lana), vestido según el área, y se pone la armadura que se gana;
  - la trivia suma «qué pasó después» y curiosidades, siempre verificadas contra el texto; la música de inicio, de juego y elegante;
  - los libros de referencia están en LIBROS-REFERENCIA3 (inventario solo con los nombres; se usan solo los de autores protestantes
    reconocidos, para entender); licencias, todavía sin decidir; la meta de UX: la mejor del mercado.
- **Datos del 17-10-2026 (Senda, prueba 16):**
  - de LIBROS-REFERENCIA3 se usan solo los confiables (autores protestantes reconocidos), para entender y nunca para copiar;
  - la música de inicio, synth-pop con sintetizadores; Lany v3 es pieza central de la UX (muchas expresiones, reacciones, Rive a fondo);
  - Senda no tiene que parecer una app cristiana genérica sino una gran app con esencia cristiana; la Travesía, con lenguaje propio
    (la senda iluminada), no el de Duolingo; el logo es «la puerta abierta»;
  - cada libro de la Biblia lleva su guía completa (contexto, personajes, cómo apunta a Cristo, qué enseña de Dios, fechas) y su travesía;
  - los juegos de mesa y de rol que enseñan son prioridad (Vivir la historia y el kit imprimible);
  - las ideas para ser la app cristiana número uno viven en `oportunidades/proyectos/senda/ideas_numero_uno.yaml` y el fundador las
    vota en la Consola (pestaña «Ideas para ser n.º 1»): leer su voto al empezar cada sesión de Senda.
- **Datos del 17-10-2026 (Senda, prueba 17):**
  - nada puede prestarse a confusión: lo que se lee al responder (pregunta, opciones, respuesta correcta, hueco) enseña la verdad por
    sí solo; la respuesta correcta nunca es la frase de un error y el error se nombra como error (`docs/REDACCION.md` en la app; el
    validador lo controla);
  - ni textos tapados ni deslizar para seguir: la lección se compacta sola; probar siempre en teléfono chico y con letra grande;
  - música de inicio tipo publicitaria: «Nonstop» (Kevin MacLeod, CC BY 4.0, con crédito); FreePD cerró;
  - el kit imprimible, en pausa; sin animador pago: Claude pule a Lany;
  - votó las ideas: sí a diez (proyector, temporadas, ligas, duelos, la Biblia entera, líderes, voz, sitio web, Tu año, portugués) y
    no al sello de confianza; la voz Piper elegida no se usa para audio que se reparte (su base tiene licencia solo para
    investigación) y el camino de la voz espera su decisión (DEC-2026-10-17-2; capítulo 42 §6).
- **Datos del 17-10-2026 (Senda, prueba 18):**
  - no llega a probar el APK, pero el proyecto no se atrasa: se avanza a fondo con todo lo próximo, calidad antes que velocidad;
  - la plata de Google Play y AdMob va en dólares a una cuenta a nombre de quien figura en el perfil de pagos; recomendación: lanzar
    con anuncios y sin compras dentro de la app (cuenta personal), monotributo con factura E antes del primer pago y la SAS antes de las
    suscripciones (decidir en diciembre; capítulo 43 §2);
  - plantea Claude Max de USD 100: el plan (Biblia entera jugable, trivia hacia 2.000, dos lotes de videos por semana) y su regla de
    corte esperan su decisión (DEC-2026-10-17-3; capítulo 43 §3);
  - «¿Quién es?» (tipo Adivina quién, con impronta propia) y «En la frente» quedan en Jugar; la fábrica de videos y los stickers de Lany,
    hechos: publicarlos es decisión suya.
- **Datos del 18-10-2026 (Senda, prueba 19):**
  - la vara es ser la mejor app de la tienda en UX, diseño y sonido; se puede usar Rive u otro software; calidad antes que velocidad;
    estudiar otras apps y tomar ideas de color y movimiento;
  - Lany: el interruptor «Lany en 3D» solo cambiaba la fiesta de la armadura (ahora se llama «Fiesta en 3D» y muestra qué hace); Lany es
    2D con volumen de dos tonos en toda la app, y el 3D permanente no conviene mientras cueste expresiones (capítulo 44 §2);
  - «¿Quién es?»: pregunta libre que Lany entiende, sugerencias que cambian según el tablero y retratos de los 41 personajes;
  - «Vivir la historia» tiene objetivo: decidir en las mismas encrucijadas del personaje, ver lo que pasó y por qué, y el espejo al final;
    sin puntos por coincidir; láminas animadas dibujadas con código; Jesús nunca se dibuja;
  - música: de compositores profesionales con licencia para apps (Mixkit); la de inicio la elige el fundador en la Consola entre nueve;
    música de fondo baja y apagable en los juegos;
  - difusión y cobros: capítulo 44 §7 y §8 (sorteos solo con bases y autorización; preferir concursos de habilidad; cuenta de Play antes
    del 15-11; público 13+; sitio con política de privacidad y app-ads.txt).
- **Datos del 19-10-2026 (Senda, prueba 20):**
  - cada texto de la Travesía tiene que entenderse a la primera: nada de preguntas sin contexto ni palabras que suenen mal (los
    serafines «se decían uno al otro», nunca «se gritaban»); las palabras que la RV1909 usa distinto («caridad», «potencia») van
    explicadas y, cuando ayuda, con el original; lo básico se explica para el recién llegado (qué es «santo»): glosario automático
    (`scripts/autor/glosario.py`, correrlo después de regenerar el contenido);
  - las intros de las lecciones: cortas, con negritas, citas en color y pasos; nunca texto plano;
  - Lany reacciona al error con gracia y nunca burlona (patatús, mano a la cara, mareo, taparse los ojos); la meta es un personaje
    del que todos hablen;
  - los juegos tienen que poder jugarse con otros: «¿Quién es?» contra alguien (preguntas escritas, la persona contesta sí o no),
    «Vivir la historia» en grupo (voto secreto y un minuto de charla), «Nombres por letra» (nuevo);
  - más fiesta al ganar (confeti, globos, tablero grande); el evento del calendario se arma en tres pasos; widget del versículo del
    día en Android;
  - libros: manda la clasificación A del fundador (repositorio `estudios-biblicos-con-ani`); nada de esa biblioteca se usó en Senda;
  - registrado para antes del lanzamiento: un entorno de prueba para líderes (cuenta de líder y Max, con 2 o 3 personas) y, para la
    difusión, «10 kits por puntos» (sortear entre las primeras 10 personas o iglesias que junten X puntos, canje en la app).
- **Datos del 19-10-2026 (Senda, prueba 21):**
  - antes de empezar cada juego, sus instrucciones claras y cortas («Cómo se juega»: sola la primera vez y siempre a mano);
  - «Vivir la historia» es la misión de la semana: individual, una historia por lunes (al lanzar, una sola), varios pasos con
    opciones más difíciles, puntos al cumplirla y cumplida solo sin errores; el modo en grupo se sacó; antes del lanzamiento, la
    fecha de inicio pasa a ser el lunes en que sale la app;
  - el evento del calendario se arma con el título solo (sin clasificaciones), el día en el calendario del mes y la hora con ruedas
    de alarma o escrita; compacto y sencillo.

- **Datos del 19-10-2026 (Senda, prueba 22):**
  - licencias: pagar está permitido desde el inicio; la recomendación (NTV por API.Bible ahora, SAS en noviembre, RVR1960 por la DBL
    con la SAS; YouVersion Platform como plan B sin ingresos) espera su decisión (DEC-2026-10-19-3; capítulo 47 §2);
  - todo lo que se pueda ver, se ve: mapas, líneas de tiempo, diagramas y láminas en travesías, trivia y juegos; un visual nunca
    regala la respuesta; el visual va antes del texto en la portada de la lección;
  - tiendas: lo técnico está listo; cuentas (Play, Apple, Expo), sitio público y 12 testers son del fundador (`docs/TIENDAS.md`);
  - idiomas: español, portugués e inglés en Ajustes; Biblias libres en portugués e inglés; el contenido se traduce en 2027, primero
    portugués; la vista previa abre lecciones y preguntas con `?demo=leccion:ID` y `?demo=espadeo:ID`.
- **Datos del 19-10-2026 (Senda, prueba 23):**
  - blindaje legal como prioridad: nada que pueda traer una demanda (plagio, imitar apps o juegos, música, nombres, imágenes); cada
    activo entra con su licencia anotada (`docs/LEGAL.md` en la app) y cada juego inspirado en otro lleva nombre, personajes y aspecto
    propios; la música de Mixkit no se usa (su licencia no permite videojuegos): toda la música es de Kevin MacLeod, CC BY 4.0;
  - Lany v4 (cara y patas canela, nunca negra con lana clara y copete: era Shaun the Sheep); el yunque en la ruleta (no la corona);
    la ruta «Quién fue quién» (no «Quién es quién»); pendientes del fundador: INPI, abogado de PI, autorización del ministerio;
  - versiones sin confusión: una sola Biblia a la vista, siempre con nombre, y la RVR1960 a un toque en cada pasaje; explicaciones de
    una pantalla, nunca textos largos; los ejercicios se leen igual en la RV1909 y la RVR1960 (capítulo 49);
  - cada APK trae todas las modificaciones anteriores: solo hace falta probar el último.
  - lo legal nunca a costa de algo clave de la UX: cada cambio por lo legal se mide (riesgo real × daño, contra lo que pierde la
    experiencia) y, si la experiencia pierde algo que se nota, se pregunta antes (capítulo 48 §6);
  - las diferencias entre la RV1909 y la RVR1960 se midieron sin copiar la 1960 (`conocimiento/2026-10-19-senda-rv1909-vs-rvr1960.md`):
    misma traducción y misma base textual en casi todo, pero se nota en uno de cada tres versículos; lo peligroso son los falsos amigos
    («caridad», «salud», «conversación», «concierto») y los nombres con grafía vieja («Samsón»); mitigación: glosario en el lector,
    nombres de hoy, ejercicios sin palabras viejas, lecturas distintas marcadas (capítulo 49 §7).
- **Datos del 19-10-2026 (Senda, prueba 24):**
  - no hay que usar siempre la RV1909: la persona lee en la versión libre que quiera; para los versículos clave, la hoja de estudio
    muestra el mismo versículo en una versión libre de hoy (la PDT es la más parecida a la 1960) y el aviso cuando la 1960 lee distinto;
  - la «mejor traducción entre paréntesis» se hace entre corchetes y a elección (subrayadas y se tocan, de fábrica; entre corchetes;
    o nada), solo con las palabras seguras y con palabras de Senda, nunca con texto de una versión con derechos (capítulo 50 §3);
  - tope de cita de la RVR1960: 500 versículos con la leyenda y sin permiso escrito (Sociedad Bíblica Argentina, 19-10-2026); la
    consulta para que conste que vale para una app con anuncios espera que el fundador la mande (`docs/legal/consulta_sba.md`);
  - el ejemplar de la 1960 que el fundador carga es solo para examinar: nunca entra a la app ni a un repositorio;
  - los nombres propios de la Biblia de Senda ya tienen la grafía de hoy (Sansón, Noemí, Finees); «Líbano» va con mayúscula.
- **Datos del 19-10-2026 (Senda, prueba 25):**
  - toda animación de Lany tiene que ser fluida: nada se mueve en bloque; anticipación, partes que llegan tarde, caída con gravedad,
    impacto con aplastar y rebote; después de caer no se congela (estado «desmayada» en bucle); se revisa cuadro a cuadro con
    `scripts/rive/cuadros.cjs`; Lany sigue 2D con volumen (el oficio de animación antes que cambiar de motor; capítulo 51);
  - «no hay que usar siempre la 1909» se mide: fuera del lector, cada pasaje se abre en la versión libre con menos palabras difíciles
    en ese versículo (PDT o NBV; BES solo si falta), con chips para cambiar; el lector, los ejercicios y la trivia siguen en la RV1909;
    la tabla se regenera con `python3 scripts/autor/versiones_por_versiculo.py` después del glosario.
- **Datos del 20-10-2026 (Senda, prueba 26):**
  - Lany es 2D y sigue 2D (capítulo 52 §2): lo que la hace viva es el tiempo de la animación; el 3D queda solo en la fiesta;
  - en «¿Quién es?», las tarjetas que no corresponden se bajan solas, de a una, con trazo y sonido; el sonido del tachado es de
    grabación CC0 más síntesis propia (nunca de otra app); la vida en reposo de Lany nunca repite el gesto anterior;
  - trivia: cada pregunta nueva va sobre un versículo que ningún banco use (`python3 scripts/autor/trivia_bancoN.py --repetidas`);
  - juegos nuevos solo si enseñan algo que los siete no enseñan; las traducciones del contenido siguen el plan de `docs/TRADUCCIONES.md`.
- **Datos del 20-10-2026 (Senda, prueba 27):**
  - en la bienvenida nada avanza solo: las opciones marcan y «Siguiente» avanza (el temporizador de avance de la prueba 20 confundía);
    la pregunta por la Biblia de la iglesia salió («es medio raro»);
  - lo que Lany sostiene (espada, escudo) se dibuja dentro de la mano y sigue el antebrazo; al ganar las seis piezas aparece Lany con
    toda la armadura puesta; el festejo de cada pieza tiene a Lany grande en el centro (capítulo 53);
  - el ejemplar de la RVR1960 no está en ningún repositorio accesible (cinco revisados el 20-10): se pide adjunto en el chat, nunca en un
    repositorio; cada APK de prueba trae todo lo anterior consolidado (una sola APK por ciclo).
- **Datos del 20-10-2026 (Senda, prueba 28):**
  - los pedidos se hacen despacio y bien («no importa si tardás»): el desmayo de Lany se rehízo de cero porque seguía rígido (brazos
    extendidos); ahora cae floja, con la mano a la sien, mareo y brazos que llegan tarde (capítulo 54 §2);
  - todo festejo o pantalla de premio entra en una sola pantalla con el botón abajo, sin deslizar (se mide lo fijo y Lany toma el alto
    que sobra; capítulo 54 §3);
  - la trivia nunca cita la RV1909 entre paréntesis: la opción dice la palabra de hoy y el pasaje se abre en la versión libre que la
    trae (`FORZADOS` en `versiones_por_versiculo.py`); si ninguna la trae, se reescribe la pregunta (capítulo 54 §4);
  - **cero plagio**, recordado por el fundador y aclarado el 20-10 a la noche: la regla es «no replicar ni copiar», **no** «no usar»:
    los libros de referencia confiables se usan (para entender, para ver cómo se arma un estudio, para chequear doctrina, para
    encontrar ángulos), pero nunca se replica su estructura ni se copia su texto («si MacArthur dice "5 cosas sobre la fe", no se
    hace una travesía con esas cinco cosas»); las versiones con derechos se leen para comparar y su texto no entra a nada; cada
    lección sale del texto bíblico libre y cualquier idea tomada de un libro va con su fuente (capítulo 54 §7).

- **Datos del 20-10-2026 (Senda, prueba 29):**
  - el APK 28 «viene bien dentro de todo»; la regla de los libros se cuenta siempre así: **se usan** para entender, para ver cómo se
    arma un estudio y para chequear doctrina; **nunca se replica ni se copia**; decir «no abrí ningún libro» es contar una regla que
    el fundador no pidió (capítulo 55 §2);
  - «el ejemplar de la 1960» es el archivo de la RVR1960 que dijo que cargaría en la prueba 24 para comparar con la 1909 versículo
    por versículo (solo análisis); no apareció en cinco repositorios y **nada depende de él**: si lo tiene, lo adjunta en el chat; si
    no, se cierra (capítulo 55 §3); las preguntas al fundador se hacen con palabras llanas, sin dar por sabido el contexto;
  - «Misiones de hoy» en Inicio mostraba claves de traducción crudas: toda clave guardada en el estado se traduce al mostrarla y la
    vista previa se recorre entera (Inicio hasta abajo), en los tres idiomas, antes de cada APK (capítulo 55 §4);
  - Hebreos y 2 Pedro jugables (331 lecciones; lo interpretativo marcado, sin doctrinas secundarias); la historia de la Iglesia en una
    línea (26 momentos con fuente); los siete juegos y los carteles de Lany en portugués e inglés (579 claves); «avanzá con todos los
    próximos que tengas pendientes»: el plan de próximos se ejecuta sin esperar pedido (capítulo 55 §9).

## 2. Reglas no negociables

1. **Evidencia antes que afirmación.** Separar siempre **HECHO** (con fuente y fecha), **ESTIMACIÓN** (con método), **HIPÓTESIS**
   (a validar) e **INFERENCIA** (razonamiento propio). Nunca inventar números. Si falta un dato, decirlo y proponer cómo conseguirlo.
   Detalle: `doctrina/02-estandares-de-evidencia.md`.
2. **Todo dato crítico lleva fecha.** El mundo cambia; la información vieja no se presenta como actual.
3. **Idea ≠ oportunidad.** Una oportunidad tiene problema pagado, pagador identificado, distribución posible, economía unitaria
   plausible, ventaja potencial y un experimento barato para validar. Marco: `doctrina/01-marco-de-evaluacion.md`.
4. **Capacidad de decir NO.** Matar ideas sin economía es un logro. Pero distinguir "difícil" de "económicamente malo" y
   "no probado" de "sin sentido".
5. **Cada dólar compite con todos los demás.** La vara mínima es la tesorería en USD (~6–8% anual, ver `doctrina/03-asignacion-de-capital.md`).
6. **Pensar en cartera.** Toda oportunidad se evalúa también por su rol: ¿genera caja, aporta distribución, datos, tecnología,
   infraestructura compartida, opcionalidad?
7. **Nada de "idea theater"**: sin buzzwords, sin TAM inflados, sin listas interminables. Pocas cosas, bien investigadas.
8. **Acciones con dinero o con terceros requieren aprobación explícita del fundador**: gastar, contratar, publicar anuncios,
   enviar mensajes o emails a terceros, firmar, invertir. Claude prepara todo "listo para apretar el botón"; el fundador aprueba.
9. **No es asesoramiento financiero regulado.** Las tesis de inversión son análisis para decisión propia del fundador.

## 3. Mapa del repositorio

| Carpeta | Qué contiene | Cuándo se actualiza |
|---|---|---|
| `doctrina/` | Principios, marco de evaluación, estándares de evidencia, asignación de capital, lentes de descubrimiento, palanca IA, riesgo, formas de pensar del holding (08) | Rara vez; cambios = decisión registrada |
| `perfil/` | Perfil del fundador: capacidades, restricciones, preguntas abiertas | Cuando el fundador aporta datos |
| `radar/` | Contexto macro fechado, señales, mapa regulatorio, disparadores de vigilancia, fuentes | Semanal (`/radar`) |
| `oportunidades/` | Una ficha por oportunidad (`OP-XX-*.md`) con frontmatter YAML; `catalogo.yaml` = todas las alternativas con números (genera `CATALOGO.md` con `herramientas/catalogo.py`); `proyectos.yaml` = definición completa de los proyectos sobrevivientes (nombres, alcance, gantt a 2030, caso de negocio); `descartadas.md` = cementerio con razones | Continuo |
| `casos/` | Casos de empresas y patrones transferibles | Continuo |
| `cartera/` | Estrategia a 5 años, estado de la cartera (`cartera.yaml`), libro de capital (`libro-capital.csv`), decisiones, experimentos | Mensual (`/comite`, `/revision`) |
| `conocimiento/` | Bitácoras de investigación con hechos fechados y fuentes | Cada investigación |
| `herramientas/` | Scripts: tablero de oportunidades, motor de escenarios Monte Carlo, cartera, generador de informes | Cuando haga falta |
| `informes/` | Informes PDF + HTML y su fuente (1: cartografía inicial; 2: ingresos sin vender; 3: el plan; proyecto completo de Senda, fuente en `oportunidades/proyectos/senda/`). Estilo del 3: práctico, visual, sin jerga | Trimestral o a pedido |
| `TABLERO.md` | **Generado** por `python3 herramientas/oportunidades.py`. No editar a mano | Tras cambiar fichas |
| `apps/` | Índice de las apps del holding: cada una vive en su repositorio propio (Senda → `juanicarlisi/senda-app`) | Al crear una app |

## 4. El equipo (subagentes en `.claude/agents/`)

Cada rol existe porque aporta una capacidad distinta, no por moda. Se invocan con la herramienta Agent cuando el trabajo lo amerita
(por ejemplo, un `/evaluar` completo usa varios en paralelo).

| Agente | Capacidad | Pregunta que responde |
|---|---|---|
| `explorador` | Detección de señales débiles y cambios | ¿Qué está cambiando que casi nadie mira? |
| `analista-regulatorio` | Normas → ganadores, perdedores, obligados | ¿Quién ahora está obligado a hacer algo nuevo? |
| `analista-mercado` | Clientes, JTBD, competencia, tamaño bottom-up | ¿Quién paga, cuánto, por qué y contra qué alternativa? |
| `cfo` | Economía unitaria, escenarios, sensibilidad, tramos de capital | ¿Qué variables deciden si esto funciona? |
| `growth` | Distribución y primeros clientes como sistema económico | ¿Cómo llegamos a los primeros 10 clientes sin gastar una fortuna? |
| `abogado-del-diablo` | Red team, pre-mortem, destrucción de tesis | ¿Qué mata esto? ¿Qué tendría que ser cierto? |
| `analista-inversiones` | Acciones, bonos, real estate, tesorería | ¿Hay un uso mejor para este mismo dólar? |
| `constructor` | Convertir tesis validadas en producto/operación (código, automatizaciones, landing, agentes) | ¿Cuál es la versión mínima que genera aprendizaje o caja? |
| `asignador` | Comité de inversión: compara todo contra todo | ¿Qué se acelera, qué espera, qué muere? |

## 5. Rutinas (skills en `.claude/skills/`)

| Comando | Qué hace | Cadencia sugerida |
|---|---|---|
| `/radar` | Barrido de señales por lentes; actualiza `radar/` y propone oportunidades nuevas | Semanal |
| `/oportunidad <idea o señal>` | Triage de 30 minutos: ¿hay negocio? Crea ficha o la manda a `descartadas.md` | A demanda |
| `/evaluar OP-XX` | Due diligence completa con equipo en paralelo, modelo de escenarios y veredicto | Al pasar a "validar" |
| `/matar OP-XX` | Test de destrucción rápida (red team) | Antes de gastar capital |
| `/experimento OP-XX` | Diseña el experimento más barato que aprende lo importante; crea archivo en `cartera/experimentos/` | Antes de construir |
| `/comite` | Comité mensual: asignación de capital y atención, decisiones registradas | Mensual |
| `/revision` | Revisión mensual: libro de capital, métricas, aprendizajes, tablero | Mensual |
| `/tesis-inversion <activo>` | Tesis de inversión estructurada (activos financieros o reales) | A demanda |
| `/informe` | Regenera el informe PDF con el estado actual | Trimestral |

## 6. Convenciones

- **IDs**: oportunidades `OP-XX`, experimentos `EXP-XX`, decisiones `DEC-AAAA-MM-DD-n`, señales `SEN-AAAA-MM-n`.
- **Estados de oportunidad**: `radar` → `explorar` → `validar` → `construir` → `escalar` | `pausa` | `inversion` | `descartada`.
- **Frontmatter**: toda ficha en `oportunidades/` sigue `oportunidades/_plantilla.md`. Después de editar fichas correr
  `python3 herramientas/oportunidades.py` (valida, puntúa y regenera `TABLERO.md`).
- **Modelos económicos**: en `herramientas/modelos/*.yaml`; correr `python3 herramientas/escenarios.py herramientas/modelos/<x>.yaml`.
- **Moneda**: USD salvo indicación. Tipo de cambio de referencia y fecha en `radar/contexto-macro.md`.
- **Idioma**: español rioplatense, directo, sin relleno.
- **Nunca borrar historia**: las ideas descartadas se mueven a `oportunidades/descartadas.md` con la razón y la condición que las revive.

## 7. Cómo arrancar una sesión

1. Leer `cartera/cartera.yaml` y las últimas entradas de `cartera/decisiones.md` para saber en qué estamos.
2. Revisar `radar/vigilancia.md`: ¿se activó algún disparador?
3. Hacer lo que pida el fundador. Si no pide nada concreto, proponer el siguiente paso de mayor valor esperado según `TABLERO.md`.
   Si se trabaja en **Senda**: antes de nada, leer lo que el fundador marcó en la **Consola de Senda** (propuestas, sonidos y voz
   elegidos, pendientes hechos, estado de licencias; ver `oportunidades/proyectos/senda/capitulos/32-consola.md`) y, al cerrar,
   actualizar `oportunidades/proyectos/senda/estado.yaml` y volver a publicar la Consola.
4. Antes de cerrar: registrar hechos nuevos (con fecha y fuente), decisiones y aprendizajes. Commit con mensaje descriptivo.

## 8. Limitaciones conocidas del entorno

- En la sesión fundacional (sep-2026) la política de red del entorno bloqueó la lectura directa de la mayoría de los sitios
  (infobae, bcra.gob.ar, argentina.gob.ar, boletinoficial.gob.ar, etc.). Los datos se obtuvieron vía motor de búsqueda.
  **Todo dato que decida capital debe re-verificarse en la fuente primaria.** El fundador puede ampliar el acceso de red en la
  configuración del entorno (Network access).
