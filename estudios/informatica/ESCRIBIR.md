# Guía para escribir un día de «Informática desde cero»

Leé esto entero antes de escribir. Es corto a propósito; lo que falta lo muestran los dos días modelo (`dias/01-09.json` para días de concepto y `dias/00-02.json` para días con Senda).

## 1. Quién lee y qué quiere

Juan, fundador de una organización de inversión y creación de empresas, vive en Buenos Aires, **conoce logística** y **no es ingeniero**. Está construyendo con IA una app (Senda) y quiere entender *de verdad* todo el universo informático: poder hablar con frontend, backend, mobile, arquitectos, DBAs, cloud, DevOps y seguridad; entender cada componente de una app real; y poder tomar decisiones técnicas con criterio propio. Estudia **un día por vez, 20 a 30 minutos**, en una app HTML (teléfono o compu). Quiere:

- entender **a la primera**, sin conocimientos previos, sin definiciones de diccionario ni abstracciones sin ejemplo;
- **ver qué pasa en la realidad**: procesos paso a paso, números concretos, casos reales;
- rigor técnico intacto: analogías sí, pero que no mientan;
- que cada concepto se apoye en los anteriores y que se vaya armando un mapa mental completo;
- profundidad y claridad antes que velocidad. Es un estudio para toda la vida, no un listado de tutoriales.

Idioma: **español rioplatense**, voseo, directo, cálido, sin relleno. Se puede usar humor liviano. Nada de tono de manual ni de «influencer».

## 2. Cómo trabajar (en este orden)

1. `python3 scripts/contexto.py ID` (desde `estudios/informatica/`): te da el título (no se cambia), los términos que el día **debe presentar**, los días vecinos y los términos disponibles.
2. Leé `dias/01-09.json` (y `dias/00-02.json` si el día es de tipo S o si usa diagramas de secuencia). Imitá su nivel de claridad, no su contenido.
3. Investigá lo necesario. Hay red: usá WebSearch/WebFetch (o `curl`) para verificar en **fuentes oficiales** (RFC, documentación del proveedor, papers, universidades). Para historia, fuentes primarias o muy confiables. **Nunca inventes** cifras, fechas, citas, nombres de funciones ni URLs.
4. Escribí el día en `dias/ID.json`. Recomendado: un script de Python en el directorio temporal que arma un `dict` y hace `json.dump(..., ensure_ascii=False, indent=1)` (así no pelea con las comillas), como en `scripts/modelo/dia_01_09.py`. Para las comillas dentro de los textos usá «» y ‘’. Los saltos de línea de un bloque de código van como `\n`.
5. Corré `python3 scripts/verificar_dia.py ID` y corregí **todos los errores y avisos** hasta que diga `✓ … 0 errores`. El validador es el criterio de «terminado».
6. Chequeá `python3 -m json.tool dias/ID.json > /dev/null` y, si usaste enlaces nuevos, que respondan (`curl -sI -L URL`).
7. Tu respuesta final son **tres líneas**: ids escritos, palabras de lectura y alguna duda o hallazgo que el fundador deba saber. Nada más.

No toques otros días, el plan, la app ni el validador. Si el validador te parece erróneo, decilo en tu respuesta final, no lo edites.

## 3. Qué tiene que tener un día (estructura del JSON)

Campos obligatorios en la raíz: `id`, `titulo` (igual al del plan), `bajada` (1 frase que promete algo concreto), `minutos` (20 a 30), `vigencia` (`principio` | `mixto` | `herramienta`), `revisado` (`2026-11-09` o la fecha de hoy), `objetivos` (3 a 5, empiezan con un verbo: «Explicar…», «Leer…», «Calcular…»), `venis_de` (qué viste antes y qué falta), `se_apoya_en` (ids de días anteriores que realmente hacen falta), `gancho` (1 a 3 párrafos de apertura: una escena, una pregunta o un problema concreto; nunca una definición), `bloques` (el cuerpo), `recap` (4 a 7 puntos), `repaso` (5 a 7 preguntas; en días `R`, 8 a 12), `feynman` (una consigna para explicar con las propias palabras), `para_profundizar` (2 a 4 ítems con `fuente` o `url`), `videos` (opcional, 0 a 2), `terminos` (**todos** los términos del plan para ese día, más los que sumes, cada uno con `t` y `d` de una o dos frases), `siguiente` (una frase que enlaza con el día que viene; se muestra como «Mañana: …»), y `fuentes_nuevas` (solo si citás algo que no está en `fuentes/fuentes.json`).

**Tamaño:** entre **2.800 y 3.800 palabras de lectura** (el validador cuenta gancho + bloques + recap, sin código; error si < 2.200 o > 4.600). Eso, más widgets, ejercicios y preguntas, son ~25 minutos. Es un día **denso y completo**, no un resumen. Si te sobra espacio, profundizá con un caso real, un número concreto o una segunda analogía, **nunca con relleno**.

### Cómo se arma un buen día (patrón)

Un día de concepto sigue este arco: **problema concreto → idea clave → cómo funciona por dentro (paso a paso, con números) → qué se rompe o qué se confunde → cómo se ve en la práctica → qué te llevás**. Alternás explicación con algo que se mira o se toca (diagrama, tabla, widget, ejercicio). Cada 500 a 700 palabras, un `pensa` (pregunta para intentar contestar antes de leer la respuesta) o un `ejercicio`. Mínimos que controla el validador: 4 subtítulos `h`, 2 `pensa`, 2 recursos visuales (`diagrama`, `widget` o `tabla`), 1 analogía, 1 `ojo` o `mito`.

Reglas de oro de la explicación:
- **Un concepto nuevo por vez**, anclado a algo que el estudiante ya conoce. Si usás una palabra técnica que no presentó un día anterior o este, la explicás al pasar en una frase. Con `[[término]]` marcás las palabras del glosario; solo se permiten términos presentados **hoy o antes** según el plan (el validador lo controla).
- **Mostrar, no solo decir**: «un píxel pesa 3 bytes: una foto de 12 megapíxeles son 36 millones de bytes sin comprimir» enseña más que «las imágenes ocupan espacio».
- **Números reales y fechados**. Si no estás seguro de una cifra, es una ESTIMACIÓN: decilo («del orden de…») y cómo se obtiene. Cosas que cambian con el tiempo (versiones, precios, cuotas, funciones de un producto) van **siempre** en una `nota` de tipo `vigencia` con la fecha y la fuente oficial verificada, y el día se marca `mixto` o `herramienta`.
- **Principio permanente contra herramienta que cambia**: enseñá primero la idea que no envejece; después, cómo hoy la implementa tal producto.
- Errores comunes y mitos: dedicá espacio a lo que la gente entiende mal (`ojo`, `mito`).
- Las analogías cotidianas tienen que ser **honestas**: decí dónde la analogía deja de valer.
- Conectá con **logística** cuando sea natural (rutas, depósitos, colas, trazabilidad): es el idioma que el fundador ya habla. Sin forzarlo.
- Conectá con **Senda** cuando sea natural, **pero solo con hechos verificados** (ver §6). Senda no es el tema de todos los días.

Tipos de día (el tipo está en el plan):
- **C concepto**: el patrón de arriba.
- **H historia**: relato con personas, fechas y problemas concretos; qué problema querían resolver, qué idea nueva aportaron y **qué sigue siendo verdad hoy**. Verificá fechas y atribuciones con fuentes primarias o muy confiables; si algo es leyenda o está discutido, decilo. Usá `linea-tiempo` y `cita` (máx. 30 palabras, textual, con fuente).
- **L laboratorio**: se hace con las manos. Mínimo 2 `ejercicio` con pista y solución (o código `ejecutable`). El estudiante tiene que terminar con algo hecho. Podés usar los widgets (§5).
- **S Senda**: ver §6.
- **R cierre de parte**: sin conceptos nuevos de fondo (igual hay que definir los términos que figuran en el plan, que son los de «integración»). Una `traza completa` de un caso de punta a punta que une los días de la parte, un diagrama `capas` o `flujo` con el mapa de la parte, una `tabla` de «pregunta típica → dónde está la respuesta» y 8 a 12 preguntas que **mezclan días distintos de la parte**.

## 4. Las preguntas de repaso (importa mucho)

Evalúan **comprensión**, no memoria: «¿qué pasaría si…?», «¿cuál de estas explicaciones es correcta y por qué?», cálculos cortos. Reglas (las controla el validador):
- 3 o 4 opciones plausibles; las incorrectas representan **errores reales** que alguien comete (no disparates).
- **La correcta no puede delatarse por el largo**: igualá la longitud de las opciones. Variá la posición de la correcta.
- Cada pregunta lleva una explicación (`e`, ≥ 40 caracteres) que dice **por qué** la correcta lo es y qué error representa cada incorrecta relevante.
- Nada de «todas las anteriores» ni «ninguna».
- Las preguntas se entienden solas, sin tener el texto delante.

## 5. Bloques disponibles (campo `t` de cada elemento de `bloques`)

Marcado en línea dentro de cualquier texto: `**negrita**`, `*cursiva*`, `` `código` ``, `[[término]]` o `[[texto visible|término]]` (glosario), `[#id-fuente]` (cita numerada, la fuente debe existir), `[texto](https://…)` (solo https), `[@01-12]` (enlace a otro día; muestra «Día N» con el número real; **nunca escribas números de día a mano**).

- `{"t":"h","x":"Subtítulo"}` · `{"t":"h3","x":"…"}`
- `{"t":"p","x":"párrafo"}` o `x` como lista de párrafos
- `{"t":"lista","items":["…"],"ord":false}`
- `{"t":"nota","k":"analogia|idea|ojo|mito|dato|historia|vigencia","titulo":"opcional","x":"…"}` (`x` string o lista de párrafos)
- `{"t":"pensa","x":"pregunta","resp":"respuesta posible"}` (la respuesta queda oculta hasta que el lector la pide)
- `{"t":"ejercicio","x":"consigna","pista":"…","solucion":"…"}`
- `{"t":"tabla","cab":["A","B"],"filas":[["…","…"]],"cap":"pie opcional"}`
- `{"t":"codigo","lang":"js|ts|py|sql|bash|c|go|rust|java|kotlin|swift|json|html|css|asm","x":"código","cap":"…","ejecutable":true}` (con `ejecutable` solo JavaScript puro que no use el DOM: corre en un Worker y muestra `console.log`)
- `{"t":"terminal","lineas":[{"c":"ls -l","s":"salida"}],"cap":"…"}`
- `{"t":"cita","x":"≤30 palabras textuales","autor":"…","fuente":"id-fuente"}`
- `{"t":"pasos","titulo":"opcional","pasos":[{"t":"Título del paso","x":"explicación"}]}`
- `{"t":"senda","titulo":"…","x":"texto o lista","archivos":["ruta/real/en/senda-app"]}`
- `{"t":"widget","n":"nombre","titulo":"…","cfg":{…},"cap":"…"}`: widgets que existen hoy: `bits` (cfg `bits`, `inicial`, `ascii`), `utf8` (cfg `texto`), `ieee` (cfg `valor`), `color`, `compuertas` (cfg `compuerta`: AND, OR, XOR, NAND, NOR, XNOR, NOT), `sumador` (cfg `completo`), `microcpu` (cfg `prog`: lista de instrucciones LOADI n, LOAD a, ADD a, SUB a, STORE a, JMP p, JNZ p, HALT; `mem`: valores iniciales de las 16 celdas), `bigo` (cfg `max`), `cidr` (cfg `valor`), `hash` (cfg `texto`).
- `{"t":"diagrama","tipo":…,"cap":"pie"}` con estos tipos:
  - `capas`: `{"capas":[{"n":"Nombre","d":"descripción","k":"color"}]}` (de arriba hacia abajo)
  - `flujo`: `{"filas":[{"nodos":[{"t":"Título","s":"subtítulo","k":"color","e":"etiqueta de la flecha que llega"}],"baja":"texto entre filas"}]}`; máx. ~4 nodos por fila
  - `celdas`: `{"filas":[{"e":"etiqueta","celdas":[{"t":"1","k":"color","s":"sub"}],"nota":"al final"}]}` (bits, memoria, arrays, cálculos posicionales)
  - `secuencia`: `{"actores":[{"n":"Nombre","k":"color"}],"mensajes":[{"de":0,"a":1,"t":"etiqueta ≤44 caracteres","resp":false,"d":"explicación del paso"}]}`; **máx. 5 actores**; el lector puede avanzar paso a paso; cada mensaje debería tener `d`
  - `arbol`: `{"raiz":{"t":"…","s":"…","k":"…","h":[hijos con la misma forma]}}`
  - `linea-tiempo`: `{"eventos":[{"a":"1936","t":"Título","d":"detalle"}]}`
  - `comparar`: `{"izq":{"t":"…","k":"…","items":["…"]},"der":{…}}`
  - `grafo`: `{"alto":360,"nodos":[{"id":"a","x":10,"y":20,"t":"etiqueta corta","k":"…"}],"aristas":[{"de":"a","a":"b","t":"etiqueta","dir":true,"dash":false}]}` con x e y de 0 a 100 (redes, árboles dibujados a mano, topologías)
  - `svg`: `{"x":"<svg viewBox=…>…</svg>"}` para algo a medida (sin scripts ni `on*`; usá `var(--ink)`, `var(--circ)`, `var(--senal)`, `var(--surface)`, `var(--line)` para respetar el modo oscuro)
  Colores `k`: `cliente` (azul), `red` (ámbar), `servidor` (verde), `datos` (violeta), `os`, `hw`, `ok`, `alerta`, `neutro`.

Si necesitás un widget o diagrama que no existe y sería **realmente** valioso, descríbilo en tu respuesta final; no lo inventes en el JSON (el validador lo rechaza).

## 6. Días de Senda (tipo S) y menciones a Senda

El fundador pidió: *identificar qué tecnologías usa realmente y no asumir que usa una tecnología simplemente porque sea habitual.* Reglas:
- La **única fuente** sobre Senda es `senda/mapa-tecnico.md` (verificado contra el código, commit `25e08fa`, 2026-11-09) y el código mismo en `/home/user/senda-app` (solo lectura). Leé **solo las secciones que necesitás** (`grep -n '^#' senda/mapa-tecnico.md` te da el índice; usá `Read` con `offset`/`limit`) y verificá en el código lo que vayas a afirmar.
- Cada `senda` lleva `archivos` con rutas **reales** (el validador comprueba que existen). Un día S necesita al menos 2 bloques `senda` y 4 archivos en total.
- Distinguí siempre **«está implementado en el código»** de **«está planificado en los documentos»**. Si una funcionalidad no existe (por ejemplo, compras dentro de la app o actualizaciones por aire), decilo con claridad: es un hallazgo valioso, no una omisión.
- Sé honesto con la deuda técnica y los riesgos (sección 17 del mapa) sin dramatizar: son material de criterio de ingeniería, no una crítica.
- Aclaralo con una frase del tipo «esto corresponde al commit 25e08fa; el código cambia, la forma permanece».
- El archivo nunca debe incluir claves, tokens ni valores secretos.
- En los días que no son S, una mención a Senda es un **bonus** (un bloque `senda` corto cuando una idea de hoy aparece de verdad en su código). No fuerces la conexión.
- Senda es una app cristiana de estudio bíblico y juegos; tratala con respeto, sin ironías sobre su contenido.

## 7. Fuentes y enlaces

- Ya hay 156 fuentes registradas (`fuentes/fuentes.json`: RFC, documentación oficial, papers, libros y cursos abiertos). Citalas por id. Preferí **documentación oficial, estándares y fuentes primarias**.
- Si necesitás otra, agregala en `fuentes_nuevas` con `id` (minúsculas con guiones), `t`, `a`, `tipo` (`libro|rfc|paper|doc|curso|articulo`), `anio` (opcional) y `url` **verificada** (que devuelva 200; si no hay URL pública estable, no la cites).
- En `para_profundizar` explicá en una frase **para qué sirve** ese recurso para este día; no listes por listar. Si es un libro o curso, decí qué capítulo o clase.
- Videos: usá solo `{"q":"búsqueda de YouTube","por_que":"…"}`. No inventes IDs ni enlaces directos a videos.
- Nunca copies texto de libros ni de documentación: parafraseá y citá. Las citas textuales (`cita`) son cortas (≤ 30 palabras) y con fuente.

## 8. Voz y prohibiciones

El validador rechaza frases típicas de texto generado por IA: «no es solo… es…», «cabe destacar», «es importante destacar», «sin lugar a dudas», «en el mundo actual», «en la era de…», «fascinante», «revolucionario», «sumergirnos», «adentrarnos», «en conclusión», «potenciar», «desbloquear», «tapiz», «en un mundo cada vez…». Evitá también: listas de tres adjetivos, cierres moralizantes, signos de exclamación seguidos, preguntas retóricas encadenadas, abuso de rayas largas (—). Escribí como un buen docente que explica en voz alta: frases cortas y medias, concretas, con ejemplos.

Cosas que **no** se hacen: HTML dentro de los textos; emojis; dar por sabido algo no presentado; chistes sobre Senda o la fe; afirmar que «siempre»/«nunca» cuando hay excepciones; presentar opiniones como hechos (marcalas como criterio: «para mí», «una regla práctica es»).

## 9. Chequeo final antes de responder

- [ ] `verificar_dia.py ID` → 0 errores, 0 avisos.
- [ ] Todos los números, fechas y nombres propios están verificados (o marcados como estimación/orden de magnitud).
- [ ] Un estudiante sin conocimientos previos entiende cada párrafo a la primera lectura.
- [ ] Hay al menos un momento de «ahora lo veo» (un ejemplo concreto que hace visible la idea).
- [ ] El día deja al estudiante exactamente donde empieza el siguiente (`siguiente` coherente con el plan).
