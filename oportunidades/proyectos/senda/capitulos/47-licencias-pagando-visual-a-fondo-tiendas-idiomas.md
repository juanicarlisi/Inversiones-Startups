# Licencias pagando, visual a fondo, el camino a las tiendas y dos idiomas más: la prueba 22

<div class="enpocas" markdown="1">
**En pocas palabras.** La prueba 22 (19-10-2026) responde cinco pedidos del fundador y deja todo listo para que él decida y apriete
los botones.
- **Licencias pagando desde el inicio:** se puede, y lo primero que se puede pagar hoy es la **NTV** por API.Bible (USD 29 + 10 a 25
  por mes al empezar); la **RVR1960** exige una figura legal (la SAS, adelantada a noviembre) y un pedido formal; la **NVI** no se
  vende para apps con ingresos. La YouVersion Platform (gratis, 1.487 Biblias) queda como plan B porque prohíbe anuncios y
  suscripciones (§2).
- **Visual a fondo:** un sistema de mapas (54 lugares y 6 recorridos sobre costas y ríos reales), seis líneas de tiempo, ocho
  diagramas que se arman por capas y las láminas de «Vivir la historia», en la portada de las lecciones, en las preguntas, en la
  trivia («tipo con imagen»), en la prueba de nivel, en el desafío del día y al final de «Antes o después» (§3).
- **Tiendas:** Google Play y App Store, paso por paso, con lo que ya está hecho (firma, AAB, perfiles de EAS, textos de la ficha,
  clasificación y seguridad de datos) y lo que solo puede hacer el fundador (cuentas, sitio, 12 testers) (§4).
- **Contenido:** dos rutas nuevas en «Tierras y tiempos» (el mapa y la gran línea de tiempo), Quién es quién capítulos 4 y 5
  (Evangelios, Hechos y cartas) y la trivia pasa las 640, con ocho preguntas con mapa (§5).
- **Portugués e inglés:** ya se puede elegir el idioma en Ajustes y leer la Biblia en portugués (Bíblia Livre, Nova Bíblia Viva) y
  en inglés (BSB, WEB); el contenido se traduce ruta por ruta en 2027, primero portugués (§6).
</div>

## 1. Lo que pidió el fundador y dónde quedó

| Pedido (resumen) | Dónde quedó |
|---|---|
| Evaluar a fondo incluir una licencia de las Biblias, aunque haya que pagar desde el inicio | §2 y DEC-2026-10-19-3: plan pagando, costos y pasos |
| Más diagramas, líneas de tiempo, imágenes animadas o lo que sea, en trivias, travesías y juegos, para que sea más divertido y mejor UX | §3: el sistema visual completo |
| Ver si ya vamos con Play Store y App Store: qué falta, cómo seguimos | §4 y `docs/TIENDAS.md` en la app |
| A fondo con trivia y travesías (contenidos) | §5 |
| Ver si podemos iniciar portugués e inglés | §6 |
| Avanzar con lo próximo ya previsto | §5 (Quién es quién 4 y 5, trivia) y §7 |

{{PANTALLAS22}}

## 2. Licencias: pagar desde el inicio, qué se puede comprar y qué no

**Qué cambió respecto del 13-10 y del 16-10.** Se volvió a leer todo con la pregunta nueva («no importa pagar»). Detalle, fuentes
y fechas en la bitácora `conocimiento/2026-10-19-senda-licencias-pagas-tiendas-idiomas.md`.

| Versión | ¿Se puede pagar hoy? | Cómo | Cuánto (publicado, a confirmar al pagar) |
|---|---|---|---|
| **NTV** | Sí | API.Bible, licencia exprés comercial (plan Pro) | USD 29 por mes el plan + USD 10 por mes la versión al empezar; 25 con 5.000 usuarios por mes; 75 con 20.000; 150 con 50.000; 250 con 100.000 |
| **NBLA, LBLA** | Sí (misma vía) | API.Bible | Mismo tramo por versión |
| **RVR1960** | Solo con figura legal | Digital Bible Library (organizaciones registradas) y formulario de la American Bible Society: «las apps móviles requieren permiso escrito»; regalías o anticipos se evalúan caso por caso | No publicado |
| **NVI** | No | Biblica no licencia apps comerciales por API.Bible; el pedido directo del 05-10 sigue sin respuesta | — |
| **ESV, NIV (inglés)** | No (comercial) | Crossway solo no comercial por API; la NIV igual que la NVI | — |

**La YouVersion Platform (nuevo, HECHO).** YouVersion abrió a fines de 2025 una plataforma gratis para desarrolladores: 1.487
Biblias de 36 editoriales (RVR1960, NVI y NTV incluidas), lector embebible, API y SDK para React Native. Condición: **uso no
comercial, sin anuncios, sin muros de pago ni suscripciones**; si no se cumple, retiran el acceso. Para Senda con ingresos no sirve
tal como está. Queda como plan B del «camino D» del capítulo 38 (Senda como ministerio sin ingresos) y vale una consulta sobre
acuerdos comerciales, que manda el fundador si quiere (regla 8).

**El plan pagando (recomendación, DEC-2026-10-19-3):**
1. **Ahora:** API.Bible Pro + NTV. Entre USD 39 y 54 por mes al empezar; USD 104 con 20.000 usuarios. Entra en los USD 400
   mensuales del fundador y es la primera Biblia «de las que lee la gente» que Senda puede ofrecer legalmente sin salir a Bible.com.
2. **Noviembre:** la **SAS Senda** (estaba para enero; capítulo 43 §2): titular de la licencia, de la cuenta de Play de organización y
   de la de Apple. ARS 750.000 a 1.000.000 al crearla y 120.000 a 250.000 por mes (ESTIMACIÓN del capítulo 43).
3. **Con la SAS:** pedido de la RVR1960 por la DBL y el formulario de la ABS (borrador listo en la Consola, tarjeta «API.Bible —
   RVR1960 por la DBL»).
4. **2027, con portugués:** NAA o NTLH (Sociedade Bíblica do Brasil) y NLT o CSB (API.Bible), si el uso lo pide.

**Cuánto pesa.** Con 8.000 usuarios y dos versiones pagas, USD 79 por mes; con 60.000 y tres, USD 479: el 5 % del ingreso neto
proyectado para 2030 (`economia.yaml`). La regla de corte del 13-10 (licencias hasta el 10 % del ingreso neto) sigue como tope, pero
deja de ser la condición para empezar. Lo que no se puede comprar ni pagando (la NVI) sigue «en un toque» desde Bible.com.

**Qué hace la app mientras tanto.** El lector ya guarda la Biblia entera para leer sin conexión y la refresca cada 14 días (cumple
las dos reglas de API.Bible: 30 días de caché y menos de 500 versículos seguidos por pedido). Cuando el fundador pague, la NTV
entra como una versión más del selector, con su leyenda de derechos.

## 3. Visual a fondo: mapas, líneas de tiempo, diagramas y láminas

**Por qué.** Hasta la prueba 21, la Travesía enseñaba con texto y preguntas; el único dibujo era el mapa de los viajes de Pablo. El
pedido es que todo lo que se pueda ver, se vea. Se construyó un **sistema visual** con cuatro piezas, descrito en el contenido (un
objeto `visual` en cada historia o pregunta) y dibujado por la app:

| Pieza | Qué es | Datos | Dónde aparece |
|---|---|---|---|
| **Mapa** | Costas, ríos y lagos reales (Natural Earth, dominio público) con 54 lugares ubicados (ciudades, regiones, montes y aguas), 4 encuadres (Tierra Santa, Oriente, Egipto y Sinaí, Galilea) y 6 recorridos que se dibujan solos: Abraham, el Éxodo, el exilio, Jonás, Jesús y Rut | `scripts/arte/mapa_biblia.py` → `src/arte/mapaBiblia.ts` | Portada de 20 lecciones; ejercicio «toca el lugar en el mapa» con pines A–D; 8 preguntas de trivia |
| **Línea de tiempo** | Franja que se recorre con el dedo: los hechos en orden con cuándo pasaron (aproximado y marcado como tal); al tocar uno, su detalle y «Leer» | `scripts/autor/lineas.py` → `contenido/lineas.json`: toda la Biblia (17 tramos), patriarcas (13), Éxodo (13), reyes (14), Jesús (14), iglesia (13) | Portada de «La gran línea de tiempo»; al responder un «ordenar»; final de «Antes o después» |
| **Diagrama** | Esquema que se arma por capas con «SEGUIR» (y «DE NUEVO»): la semana de la creación, la estructura de la Biblia, el árbol de Abraham, el tabernáculo, el reino dividido, la armadura de Dios, las diez plagas y la última semana | `scripts/arte/diagramas.py` → `contenido/diagramas.json` | Portada de 12 lecciones (La creación, Una biblioteca un Autor, El reino se divide, las plagas…) |
| **Lámina** | Las escenas animadas de «Vivir la historia», ahora reutilizables en cualquier lección | `src/arte/laminas` | Jonás, el Éxodo y las historias con lámina |

**Reglas que se cumplen siempre.**
- **Un visual nunca regala la respuesta.** En la trivia, el mapa marca el lugar donde pasa la historia o los cuatro lugares entre los
  que se elige, nunca solo el correcto (lo controla la revisión de cada pregunta). En «ordenar», la línea de tiempo aparece recién al
  responder: antes mostraría el orden.
- **Todo sale del texto.** Los lugares del mapa llevan su cita; las fechas que la Biblia no da se marcan «aprox.» con la fuente
  (cronología tradicional, Encyclopaedia Britannica); el validador revisa cada cita de las líneas y cada lugar, recorrido y encuadre
  de los mapas contra las listas de la app.
- **Se ve primero.** En la portada de la lección, el visual va antes del texto; en teléfono chico se compacta como el resto.

**Dónde entró.** 61 lecciones tienen visual en la portada o en una pregunta; 8 preguntas de trivia traen mapa («tipo con imagen»);
la prueba de nivel y el desafío del día muestran el visual de cada pregunta; «Antes o después» termina con toda la línea de la
Biblia. Para mirarlo rápido sin recorrer la app, la vista previa web acepta `?demo=leccion:tie-1-2` y `?demo=espadeo:bot-603`
(también sirven para las pruebas automáticas).

**Lo que sigue (prueba 23):** más mapas en «Jesús, el Mesías» e «Israel»; los imperios con sus fronteras; el diagrama del templo de
Salomón; que la línea de tiempo se pueda abrir entera desde la Biblia («La historia en una línea» ya existe; se unifica).

## 4. Las tiendas: qué falta y cómo seguimos

Todo lo que se podía dejar listo sin cuentas, está en el repositorio de la app (`docs/TIENDAS.md` tiene la tabla completa). Lo que
falta son **cuentas, un sitio público y personas**, y eso lo hace el fundador.

| | Hecho | Falta (fundador) |
|---|---|---|
| **Google Play** | Flujo «Clave de firma (una vez)» y flujo «AAB para Google Play» en GitHub (`firma.yml`, `aab.yml`): el AAB firmado sale con cuatro secretos; Android 16 (API 36) ya cumplido; textos de la ficha; respuestas de clasificación de contenido y de seguridad de datos; público 13+ | Cuenta de desarrollador (USD 25, antes del 15-11); publicar el sitio con la política de privacidad (Cloudflare Pages gratis + dominio ≈ USD 10 por año); 12 testers 14 días seguidos (el ministerio aliado); `app-ads.txt` cuando entre AdMob |
| **App Store** | `eas.json` con perfiles `prueba` y `produccion`; `app.json` con número de compilación, declaración de cifrado y permisos; el proyecto iOS se genera sin errores; textos, palabras clave y etiquetas de privacidad | Apple Developer Program (USD 99 por año); cuenta de Expo (gratis: 15 compilaciones iOS por mes); primera compilación y TestFlight con 2 o 3 personas |

**El orden recomendado.** (1) Ahora: la cuenta de Play y el flujo de la clave de firma; en paralelo, el sitio. (2) Noviembre: el
primer AAB a la prueba cerrada; TestFlight si la cuenta de Apple ya existe. (3) Diciembre: Google Play el 18-12 y App Store cuando
Apple apruebe (uno a tres días hábiles la primera revisión). **Costo del primer año (ESTIMACIÓN):** USD 25 + 99 + 10 = 134, más EAS
si se pasa del plan gratis (USD 19 por mes).

## 5. Contenido: Tierras y tiempos, Quién es quién 4 y 5, trivia de 644

- **«El mapa de la Tierra Santa»** (ruta nueva, 6 lecciones, cofres y jefe): de Dan a Beerseba; Galilea, Samaria y Judea; los
  vecinos (Fenicia, Siria, Moab, Edom, filisteos); los grandes viajes; por donde caminó Jesús; ríos y mares. Cada lección abre con el
  mapa y pide tocar lugares en él.
- **«La gran línea de tiempo»** (ruta nueva, 6 lecciones): antes de Abraham sin fechas; los patriarcas con las edades que da Génesis
  (≈ 300 años entre Harán y la muerte de José); del Éxodo a la tierra; los reyes; los dos exilios; de Jesús a Patmos. Las fechas
  aproximadas se marcan como tales y con su fuente; cada «ordenar» termina mostrando la línea.
- **Quién es quién, capítulos 4 y 5** (12 lecciones): alrededor del nacimiento, los doce, amigos y seguidores, los que se opusieron
  y juzgaron, los que Jesús sanó, la cruz y la resurrección; los primeros días de la iglesia, alrededor de Pedro, los compañeros de
  Pablo, la gente de sus ciudades, gobernadores y reyes, las personas de las cartas. Los nombres que la RV1909 escribe distinto van
  con su forma de hoy (Rhode → Rode, Gaio → Gayo, Euodias → Evodia, Bernice → Berenice). La ruta queda completa: 5 de 5 capítulos.
- **Trivia, banco 5:** 42 preguntas nuevas (7 por pieza), revisadas pregunta por pregunta contra la RV1909 y contra todo el banco
  anterior (ni el mismo versículo ni la misma respuesta que una vieja: 30 se reescribieron por eso), 8 con mapa de contexto. Total:
  **644**.
- La Travesía queda en **421 niveles y 291 lecciones**; el validador pasa «Todo en orden» y el glosario cubre 284 lecciones.

## 6. Portugués e inglés: lo que ya se puede y el plan

**Lo que entró ahora.**
- **Idioma en Ajustes:** Español (Latinoamérica), Português (Brasil) y English. Al elegirlo cambian las pestañas, la Biblia y lo que
  ya está traducido; el resto queda en español hasta que se traduzca (la app lo avisa).
- **La Biblia en portugués:** Bíblia Livre (Almeida actualizada, CC BY 4.0) y Biblica® Open Nova Bíblia Viva (CC BY-SA 4.0). **En
  inglés:** Berean Standard Bible (dominio público desde 2023) y World English Bible (dominio público). Las cuatro van dentro de la
  app (≈ 4 MB cada una), con sus créditos en «Derechos».
- **La base técnica:** `src/i18n/textos.ts` con las cadenas por idioma y la función `t()`; las Biblias por idioma en el selector,
  con «Otros idiomas» plegado.

**Lo que implica traducir el contenido (ESTIMACIÓN).** 291 lecciones y 644 preguntas se reescriben y se vuelven a verificar
contra la Biblia del idioma (los huecos y las citas textuales dependen de cada versión: en portugués, contra la Bíblia Livre; en
inglés, contra la BSB). Con la fábrica de contenido de hoy, una ruta por semana: la Travesía entera en unos 9 meses por idioma.
Orden: «El evangelio, paso a paso», la trivia, Quién es quién, el resto.

**Recomendación.** Empezar por **portugués** en enero de 2027 (Brasil es el segundo mercado evangélico del mundo y el fundador votó
el portugués en Ideas n.º 1) e inglés después; publicar en las tiendas con la ficha en portugués cuando la Travesía del evangelio y
la trivia estén traducidas. Las licencias en esos idiomas, en el paso 4 del plan del §2.

## 7. Pendientes y decisiones

**Del fundador (decide y aprieta el botón; nada se paga ni se manda sin su OK):**
1. Pagar API.Bible Pro + NTV (≈ USD 39 a 54 por mes al empezar) · DEC-2026-10-19-3.
2. Crear la SAS en noviembre (adelantada de enero) y, con ella, pedir la RVR1960 por la DBL.
3. Cuenta de Google Play (USD 25, antes del 15-11), Apple Developer (USD 99 por año) y Expo (gratis); publicar el sitio
   (`web/`) para la política de privacidad; reunir 12 testers.
4. Si quiere, consultar a YouVersion por un acuerdo comercial (plan B).
5. Siguen abiertas: la música de inicio, la voz, Claude Max y el APK prueba 21 sin probar (se prueba el 22, que lo incluye).

**De Claude (prueba 23):** más mapas y diagramas (§3); las capturas y el gráfico de la ficha de Play; seguir con los libros
jugables y la traducción de la primera ruta al portugués cuando el fundador lo confirme.
