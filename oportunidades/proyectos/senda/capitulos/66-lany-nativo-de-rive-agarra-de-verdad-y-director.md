# Capítulo 66 — Lany nativo de Rive, que agarra de verdad, y el director de Lany (prueba 40, 30-10-2026)

## 1. Lo que pidió el fundador

- **Lany, un personaje animado de primer nivel**, como el búho de Duolingo o mejor: que se mueva sin parecer un muñeco articulado,
  cambie de postura y expresión, agarre los objetos de verdad (escudo, espada, casco), levante cosas con el cuerpo acompañando el peso,
  que los accesorios no parezcan pegatinas y que se puedan crear animaciones nuevas sin reconstruirlo. Una pose de presentación
  (brazos cruzados, como un jugador con la camiseta) y su variante heroica con escudo y espada. Un sistema central para pedirle cosas
  desde cualquier pantalla.
- **Con la herramienta oficial de Rive** (corrección del fundador a mitad de la sesión): Rive CLI (`rive.app/agents`), RML como fuente,
  `rive . --verify`, nada de generar el `.riv` con un escritor propio ni de simular resortes o restricciones con código propio.
- Los créditos de la API (USD 200, vencen el 22-11): «lo que sea que sirva para Senda, adelante».
- CLAUDE.md con el estándar más alto de ingeniería; textos que no suenen a IA; láminas libres para la trivia; más trivia y más
  contenido.

## 2. Rive CLI y por qué el primer archivo no cargaba

- **HECHO (30-10-2026):** Rive CLI existe y es oficial; se instaló en el entorno (versión 1.8.0, más `libegl1` y `libgles2`).
- **Causa:** el escritor propio del binario reutilizaba las mismas pinturas en dos formas (los dedos nuevos): un objeto con dos padres,
  y el motor de Rive rechaza el archivo entero. Falló el generador propio; no el visor oficial, ni el editor, ni el runtime de SENDA.
- **Ahora:** `scripts/rive/rml.py` escribe la fuente en RML (`rive/lany/lany.rml`) y el `.riv` sale del compilador oficial
  (`rive rive/lany --verify` y `--once`: 0 errores, 0 advertencias). El orden de dibujo sigue la regla de RML (el primer hijo va
  adelante).

## 3. El rig nativo

- Brazos y piernas: **huesos de Rive** (`RootBone`/`Bone`) y un solo contorno con **skin y pesos** que se dobla en el codo y la
  rodilla (sin el círculo de articulación de antes). **IK de Rive** con controles para manos y pies (`controlManoD`, `controlPieI`…):
  las animaciones mueven el control y Rive resuelve hombro y codo, o cadera y rodilla, en vivo. La mano copia el giro del control con una
  restricción de rotación.
- Objetos: **restricciones de transformación y de traslación de Rive** con fuerza animada: con 0 el objeto está en el mundo (baja con
  luz), con 1 lo lleva la mano. Los dedos que cierran por delante del mango son una pieza atada a la mano y dibujada encima del objeto.
- Las 128 animaciones anteriores siguen andando sobre los huesos.

## 4. Las actuaciones nuevas (revisadas cuadro a cuadro con capturas del renderizador oficial)

- **Presentación**: carga el peso en una pierna, abre un paso (rodillas que flexionan y pie plantado por IK), saca pecho, cruza los
  brazos uno después del otro, mentón arriba, guiño; termina en «brazos cruzados» (bucle vivo).
- **Espada**: baja con luz, gira hacia ella, estira la mano abierta, la cierra sobre el mango, la hoja se mece con el peso, toma
  impulso y la levanta al cielo en un arco hacia afuera; queda en la mano.
- **Escudo**: llega mostrando la manija de cuero, la agarra, siente el peso, lo da vuelta en el aire, guardia y toc toc con los nudillos.
- **Casco**: las dos manos se atan a las asas, lo levanta, inclina la cabeza para recibirlo, se lo pone, lo acomoda, la cabeza cede con
  el peso y guiño.
- **Heroica**: se agacha, abre la postura, espada al cielo con el escudo al pecho, baja a la guardia; queda en «heroe» (bucle).
- **Coraza**: dos manos a las asas, al pecho (el pecho cede y se infla), toc toc con los nudillos en la gema. **Cinturón**: lo toma de las
  puntas, lo lleva a la cintura, cierra la hebilla al frente y lo ajusta. **Botas**: se agacha, salta, las botas caen debajo y aterriza
  adentro (polvo), pisa fuerte. Las seis piezas las trae Lany con las manos en el festejo de pieza (la de la vitrina ya no vuela).
- Pendiente de la misma calidad: el resto del repertorio pedido (curiosidad, risa, salto, decepción, confusión, tropiezo, caída,
  despertar, conversar) sobre el rig nuevo.

## 5. El director de Lany

`src/lany/director.ts`: las pantallas piden eventos con sentido (`emitir("victoria")`, `"bienvenida"`, `"armarse"`…) y el director
decide la reacción del repertorio con prioridad (lo importante interrumpe a lo chico), enfriamiento, variedad (nunca la misma dos
veces) y canales (cada Lany escucha el suyo). En la bienvenida Lany se presenta; en el festejo de pieza, escudo, espada y casco los trae
Lany; con la armadura completa, la presentación heroica. Pruebas: `pruebas/arranque/datos.test.tsx`.

## 6. Trivia, librerías y estándar

- **28 preguntas «¿qué historia muestra la imagen?»** con los grabados de Gustave Doré para la Biblia (1866, dominio público;
  digitalización de Project Gutenberg): nunca escenas con Jesús, desnudos ni escenas sangrientas, ni libros fuera de la Biblia protestante.
  Banco 38. Después, el banco 39: 16 preguntas fáciles, difíciles y curiosidades (Génesis 1, el mar Rojo, Jericó, David antes de Goliat, Nehemías 8, Saulo en Damasco, la pesca de Juan 21) sobre versículos que ninguna pregunta usaba; la trivia en **2.290 preguntas**. Wikimedia Commons limitó las consultas desde el entorno: se usó Gutenberg.
- **expo-image** (láminas con caché y fundido) y **zod** (lo que llega del servidor se valida fila por fila y nunca rompe Inicio).
- **CLAUDE.md de la app**: reglas 16 (el estándar más alto, sin atajos), 17 (Lany como Duolingo o mejor, Rive nativo con Rive CLI,
  director) y 18 (textos que no suenan a IA).

## 7. Los créditos de la API

Aprobados. Flujo «Lotes de Claude» en GitHub Actions (`scripts/lotes/claude_lotes.py`): traducción de la trivia al portugués y al
inglés y segunda revisión de cada pregunta contra la RV1909, con Claude Opus 5.5 en la API de lotes (mitad de precio). ESTIMACIÓN:
~USD 35 la traducción y ~USD 20 la revisión. Todo vuelve como borrador a la rama «lotes» y pasa por el validador antes de entrar.
La clave la creó y la cargó en GitHub el fundador con la extensión de Claude en Chrome (30-10, nombre «senda-lotes», límite de gasto
de la organización en USD 200 por mes; la clave nunca pasó por el chat).

**Lo que se hizo con los créditos (30-10-2026):**
- Dos lotes de prueba de 30 preguntas (USD 0,24) y después los tres grandes: revisión de 2.252 preguntas, traducción de 1.907 al
  portugués y de 2.282 al inglés. HECHO (log del flujo): 16,6 millones de tokens de entrada y 1,5 millones de salida, **~USD 48**
  (ESTIMACIÓN a precio de lista con el 50 % de lotes, sin descontar la caché). Quedan ~USD 150 hasta el 22-11.
- **Traducción**: `scripts/lotes/incorporar.py` las incorpora con el validador como filtro (la palabra clave tiene que leerse en las
  dos Biblias del idioma; si no, busca otra de la respuesta o la pregunta que sí; nada que se delate, se repita o cite mal).
  Entraron 96 % en portugués y 96 % en inglés. Claude leyó una muestra al azar contra el español y el versículo: correctas, con los
  nombres de la Bíblia Livre y de la BSB. Resultado: la trivia se juega entera en los tres idiomas (todas las piezas con más de 40).
- **Revisión**: marcó 117 preguntas (6 error, 111 dudosas). Claude las leyó una por una contra la RV1909: 81 tenían un problema real
  y se corrigieron (`scripts/autor/trivia_revision40.py`): incorrectas que también eran verdad (el Herodes de Hechos 12 *es* Agripa;
  Filipenses termina con la misma frase que Apocalipsis; Jesús también se apareció a los doce; «ochenta» es «más de cuarenta»),
  enunciados ambiguos (a los siete los eligió la multitud, no los apóstoles; «mayormente» es «sobre todo»; una cita que delataba la
  respuesta), palabras que la RV1909 dice distinto («más conjunto», «la sana lengua», el valle «del Alcornoque») y tres datos que
  afirmaban de más. Las traducciones de esas 84 se volvieron a pedir y entraron: 2.204 preguntas en portugués y 2.199 en inglés. El resto eran exigencias de más del revisor (el pasaje entero
  se abre al responder).

**La Travesía en portugués y en inglés (30-10-2026, a pedido del fundador: «continuá usando los créditos para lo que se pueda»):**
`scripts/lotes/rutas.py` manda un pedido por lección (con los pasajes en la Bíblia Livre o la BSB y, para los huecos, en la Almeida o
la King James) y uno por cabecera de ruta; `incorporar.py ruta` publica una ruta solo entera y sin errores del validador. Las 22 rutas
(458 lecciones) quedaron en los tres idiomas: 30 de 42 a la primera, 11 en la primera vuelta de corrección y la última en la segunda.
El validador tenía un falso positivo («montanha» parecía «montanismo»): corregido. HECHO (log): 6,5 millones de tokens de entrada y
2,6 de salida en el lote grande, **~USD 39** (ESTIMACIÓN, sin descontar la caché); con el piloto y las correcciones, ~USD 42. En total
van ~USD 90 de los 200. Después se lanzó una segunda lectura de las 458 lecciones en español contra la RV1909 (~USD 25 estimados).

**Segunda lectura de las lecciones (31-10-2026):** las 458 lecciones en español, contra la RV1909, por lotes (HECHO, log: 4,4 millones
de tokens de entrada, 0,4 de salida, **USD 12,71** ESTIMACIÓN). Marcó 57 errores y 331 dudas. Claude leyó cada error contra el texto:
50 eran reales y se corrigieron en la fuente con `scripts/autor/parches_revision40.py` (hechos fuera de orden —Jehová cierra la puerta
del arca antes del diluvio, Abigail antes de la lanza, la oración de Hechos 4 antes que la de Hechos 12—, citas «» de la PDT o con
glosas adentro, datos que el texto no dice —Ananías «oró», Abraham «muere» antes de los mellizos, Jan «Uz»—). Además, cuatro
«¿Sabías que…?» mostraban la nota interna «re-verificar»: se verificaron en la fuente (The State of Theology 2025 en ligonier.org:
53 %, 53 % y 47 %; 2018-2022 en Christianity Today: 78 %, 65 % y 73 %) y se limpió la fuente. `parche.py` ahora deja anotado el
portugués y el inglés de cada campo corregido, y se volvieron a traducir por lotes (46 lecciones por idioma; las 4 de «El gran relato»,
a mano). Las 22 rutas siguen enteras en los tres idiomas. En total van ~USD 106 de los 200 (ESTIMACIÓN sin descontar la caché).

**Trivia nueva por lotes (31-10-2026):** un pedido por capítulo (400 capítulos de 40 libros, los que más versículos sin usar tenían),
hasta 4 preguntas por capítulo sobre versículos que ninguna pregunta usaba (HECHO, log: USD 9,51). De 1.600 candidatas, 1.598 pasaron el
control del taller y 40 se sacaron por repetir un hecho ya preguntado; Claude leyó una muestra (correctas, claras, distractores
falsos y creíbles). Después, una segunda lectura por lotes contra la RV1909 y la traducción al portugués y al inglés (USD 40,72):
1.496 bien y 61 marcadas (60 dudas y 1 error, casi todas de redacción): las 61 se sacaron en lugar de reescribirlas. **La trivia queda en
3.786 preguntas en español (meta de Pascua: 4.000), 3.668 en portugués y 3.660 en inglés.** Migración nueva de las respuestas
(20261118000000; la 20261117000000 ya estaba en la base y se dejó).

**Gasto total de los créditos (ESTIMACIÓN a precio de lista con el 50 % de lotes, sin descontar la caché, que lo baja):** ~USD 158 de
los 200: trivia traducida y revisada ~51; Travesía en dos idiomas ~42; segunda lectura de las lecciones ~13 y sus retraducciones ~3;
trivia nueva ~10 y su revisión y traducción ~41. El saldo real se ve en platform.claude.com → Billing; se frena acá para no pasar
del crédito (el límite de la organización es USD 200 por mes, y lo que pase del crédito se cobraría).

## 8. Próximos (en orden)

1. Las 331 dudas de la segunda lectura de las lecciones (`contenido/borradores/revision_leccion_es_*.json` en la rama «lotes»): leerlas
   y corregir las reales con `parches_revision40.py` (las de «El evangelio» siguen la doctrina del ministerio aliado tal cual).
2. La secuencia «armarse» entera fluida (hoy el director encadena casco → escudo → espada → heroica); el repertorio nuevo (§4) sobre el rig.
3. Orejas y cola del pañuelo con huesos y skin (que se doblen) y la lana del torso con malla.
4. Más trivia: curiosidades, fáciles, difíciles y atrapantes (meta de Pascua: 4.000), y más láminas de dominio público.
5. Integrar el director en Jugar, la lección y los estados vacíos y de error.
