# Blindaje legal: que Senda no caiga en ningún problema (la prueba 23)

<div class="enpocas" markdown="1">
**En pocas palabras.** El fundador pidió revisar a fondo todo lo que pudiera traer una demanda: plagio, imitar otra app o juego,
música, contenido, nombres, imágenes. Se leyó la ley (Argentina, tiendas), los casos que marcan el límite y cada activo de la app.
Cuatro cosas se cambiaron en el acto:
- **La música**: los seis temas de Mixkit se sacaron (su licencia gratuita **no permite videojuegos** y no menciona apps) y toda la
  música es ahora de Kevin MacLeod, Creative Commons Atribución 4.0, con el crédito tema por tema (§3).
- **Lany v4**: la v3 (cara y patas negras, lana clara y copete) compartía los rasgos distintivos de la oveja Shaun de Aardman; la v4
  tiene cara y patas canela, misma personalidad (§3).
- **El Espadeo** cambia la corona de la ruleta (el casillero de Preguntados) por el yunque de la Armería; la ruta «Quién es quién» pasa
  a «Quién fue quién» (el juego de mesa de Hasbro se llama «¿Quién es quién?») (§4).
- **Los créditos** quedan completos (Biblias en portugués e inglés, Natural Earth, OpenBible, Freesound, Rive, cada tema musical) y la
  app tiene su inventario legal con lista de control (`docs/LEGAL.md`) (§3).
Lo que solo puede hacer el fundador: buscar y registrar «Senda» y «Lany» en el INPI, una hora con un abogado de propiedad
intelectual y la autorización escrita del ministerio aliado (§5). Detalle y fuentes: `conocimiento/2026-10-19-senda-blindaje-legal.md`.
</div>

## 1. Lo que pidió el fundador y dónde quedó

| Pedido (resumen) | Dónde quedó |
|---|---|
| Todos los riesgos posibles de demandas (plagio, imitar apps o juegos, música, contenido, nombres, imágenes); ley y casos históricos; que de ninguna manera caigamos en un bache legal | §2 (marco y casos), §3 (activos), §4 (nombres), `docs/LEGAL.md` en la app |
| Revisar nombres e imágenes; reforzar | §3 y §4: Lany v4, yunque, «Quién fue quién», créditos completos |
| Que el último APK traiga todas las modificaciones | Siempre fue así (cada APK se compila entero desde `main`); la nota de la release 23 lo dice |

{{PANTALLAS23}}

## 2. El marco y los casos que marcan el límite

**Lo que la ley protege y lo que no.** La Ley 11.723 (art. 1) protege «la expresión de ideas» y «no esas ideas, procedimientos,
métodos y conceptos en sí»: las **mecánicas** de un juego no tienen dueño; los dibujos, los textos, los personajes, los nombres y el
**aspecto** sí. Las marcas (Ley 22.362) son del primero que las registra. En Argentina no se patentan programas ni métodos de
juego (Ley 24.481, art. 6), pero en EE.UU. y Japón sí, y ahí se distribuye la app.

| Caso | Qué enseña |
|---|---|
| **Tetris v. Xio** (EE.UU., 2012): el clon copió el aspecto (tablero, piezas, pieza fantasma) y perdió aunque las reglas no tengan dueño | Inspirarse en una mecánica, sí; copiar cómo se ve, no |
| **Spry Fox v. LOLApps** (2012): un juego tiene «trama, humor, escenario, ritmo y personajes» protegibles | Los personajes y el tono tienen que ser propios (Lany, los textos, las láminas) |
| **King y «Candy»/«Saga»** (2014) y **Hasbro v. Scrabulous** (2008) | Las empresas grandes defienden nombres comunes como marca y demandan a clones digitales |
| **Nintendo v. Pocketpair** (Palworld, 2024-2026) | Nintendo demanda por patentes de mecánicas: antes del modo fiesta tipo tablero, buscar patentes |
| **Interstellar v. Kahoot!** (patente US 10.339.825 sobre competencias académicas en línea) | La trivia en vivo con proyector toca esa patente en EE.UU.: diseñar alrededor antes de lanzarla allí |
| **Miffy v. conejo coreano** (Seúl) | Dos animales «lindos» no son similares por lo genérico; lo que no se puede es copiar los rasgos distintivos de uno famoso |

**Las tiendas.** Google Play prohíbe títulos e íconos «tan similares a los de productos existentes que puedan confundir»; Apple
(4.1) «no copies la app popular del momento ni cambies un poco el nombre o la interfaz de otra», (5.2.1) nada de marcas, obras o
«ideas patentadas» ajenas, (1.1.5) nada de «citas inexactas o engañosas de textos religiosos», (4.3) nada «indistinguible de lo que
ya existe». Senda cumple por diseño: app completa y propia, toda cita verificada, nombres propios.

## 3. Lo que se revisó y lo que cambió

| Activo | Qué se encontró | Qué se hizo |
|---|---|---|
| **Música** | La página oficial de Mixkit dice de su licencia gratuita de música: «You're not allowed to use them in CDs or DVDs, video games or tv or radio broadcast»; apps, ni mencionadas. Senda usaba seis temas de Mixkit (prueba 19) | Todos reemplazados por Kevin MacLeod (CC BY 4.0, cualquier uso con crédito): «Nonstop» (la que el fundador eligió en la prueba 17) en la bienvenida y la firma; «Funky Chunk», «Lobby Time», «Deuces», «Wallpaper» y «Dreams Become Real» en los juegos. Las alternativas de la Consola, todas de MacLeod |
| **Sonidos** | VCSL y Kenney (CC0) y tres de Freesound (CC0): en regla | Se suman los nombres de Freesound a los créditos |
| **Lany** | La v3 tenía cara y patas negras, lana clara y copete: la combinación distintiva de Shaun the Sheep (Aardman), marca registrada con licencias en todo el mundo | **Lany v4**: cara, patas y manos canela, orejas rosadas, mismo cuerpo, ropa y expresiones; el copete queda como la llama de la lámpara (motivo de Senda). La v3, archivada para comparar |
| **Espadeo** | La ruleta tenía un casillero «corona» que lleva directo a elegir pieza: igual que Preguntados | El casillero es ahora el **yunque de la Armería** (ícono propio); la mecánica no cambia |
| **Biblias** | RV1909 (dominio público), NBV/PDT/BES y las de portugués (Creative Commons), BSB y WEB (dominio público); RVR1960 y otras solo por enlace a Bible.com, en el navegador del teléfono (YouVersion prohíbe copiar y robots, no enlazar) | Faltaban las atribuciones de las cuatro Biblias en portugués e inglés: agregadas |
| **Datos y mapas** | OpenBible (CC BY), Natural Earth (dominio público), OpenStreetMap (ODbL) | Acreditados en «Licencias y créditos» |
| **Código** | 41 bibliotecas: MIT, Apache, BSD, ISC, OFL; Rive: runtime MIT y «you own your User Content» | Acreditado |
| **Contenido** | Nada copiado de libros ni del estudio del ministerio; sin letras de canciones; hechos históricos sin dueño | Borrador de autorización escrita del ministerio aliado (`docs/legal/`) |

## 4. Nombres y marcas

| Nombre | Riesgo | Qué se hace |
|---|---|---|
| **Senda** | Google Play tiene apps «Senda» de finanzas, remesas, salud, hábitos y boletos (ninguna bíblica); el INPI no se pudo consultar desde acá; senda.app, sendaapp.com, appsenda.com, senda.ar y senda.com.ar están tomados; sendabiblia.com y sendabiblia.app parecen libres | Buscar «SENDA» en el INPI (clases 9, 41, 42) y presentar la marca, con el logo si hay conflicto (100 UMAPI por clase, ≈ ARS 41.000 al 1-10-2026, ESTIMACIÓN) |
| **Lany** | «LANY» registrada en EE.UU. por una banda (música y papelería): rubro distinto, riesgo bajo | Registrar el personaje como marca figurativa junto con Senda; nada de merchandising solo con el nombre |
| **«¿Quién es?»** y **«Quién fue quién»** | Hasbro vende «¿Quién es quién?» (España) y «Adivina quién» (Latinoamérica) | Nombres propios y distintos; los retratos se atenúan, no «se bajan» como las fichas |
| **En la frente, Antes o después, Nombres por letra, Vivir la historia, Espadeo** | Inspirados en juegos con marcas registradas (HedBanz, Timeline, Tutti frutti) | Nombres y aspecto propios; nunca sus nombres |
| **Reina-Valera 1960®, Biblica®** | Marcas registradas | Solo uso nominativo y las leyendas que piden sus licencias |

## 5. Lo que sigue y quién lo hace

1. **Fundador:** buscar «SENDA» y «LANY» en el INPI y presentar la marca antes del 15-11; una hora con un abogado de propiedad
   intelectual sobre `docs/LEGAL.md` antes de la prueba cerrada (ESTIMACIÓN: ARS 80.000 a 150.000); pedir la autorización escrita
   al ministerio aliado (borrador listo); elegir dominio (sendabiblia.com o .app).
2. **Claude:** la lista de control de `docs/LEGAL.md` antes de cada publicación; buscar patentes antes del modo fiesta y de la trivia
   en vivo; el glosario de palabras que la RVR1960 dice distinto, en el lector (capítulo 49).
3. **Regla permanente:** cada activo nuevo entra con su licencia anotada; cada juego inspirado en otro, con nombre, personajes y
   aspecto propios; cada cita, verificada.

## 6. Lo legal sin romper nada clave de la UX: riesgo real y qué vale la pena

El fundador pidió, la noche del 19-10-2026, que lo legal no rompa nada clave de la experiencia y que cada cambio se mida en serio.
La regla que se usa desde ahora: un cambio por lo legal vale la pena cuando **(probabilidad de un reclamo × daño si llega) supera con
claridad lo que pierde la experiencia**. El daño típico no es un juicio: es que Google Play baje la app por una denuncia de marca o de
derechos (la tienda baja primero y pregunta después) justo cuando la difusión arranca.

| Cambio | Riesgo real (de qué, quién reclamaría, cuán probable) | Qué pierde la UX | Veredicto |
|---|---|---|---|
| **Música: Mixkit → Kevin MacLeod** | HECHO (19-10): la licencia gratuita de Mixkit dice «Not allowed: Video Games» y no menciona apps; Senda tiene siete juegos. Reclamaría Envato o el autor, con una denuncia en Play. Probabilidad baja (no se encontraron casos contra apps chicas), daño inmediato y visible si llega. | La música de inicio no cambia («Nonstop» ya era de MacLeod, elegida en la prueba 17). Cambian los cinco fondos de los juegos: correctos, pero son temas muy oídos en YouTube; menos «nivel Apple» que los de Mixkit. | **Vale la pena hoy** (costo cero, riesgo cero). Camino de vuelta a la calidad en §6.1. |
| **Lany v4 (cara, patas y manos canela)** | La v3 (cara y patas negras, lana blanca, copete) era el esquema de Shaun the Sheep (Aardman: marcas registradas y personaje con derechos; licencia el personaje a fabricantes). Probabilidad media si Senda crece: la mascota es lo primero que mira un equipo de licencias en la ficha de la tienda. Daño alto: rehacer la mascota después del lanzamiento, con videos, stickers y ficha ya publicados. | Ninguna función cambia; cambia el color de la cara. La v4 conserva proporciones, expresiones, ropa y armadura. El costo real es afectivo: el fundador tiene que querer a la v4 tanto como a la v3. | **Vale la pena.** Para que no sea una imposición, Claude deja en la Consola tres colores de cara (canela, gris pizarra, crema) y el fundador elige (§6.2). |
| **El yunque en vez de la corona (Espadeo)** | La ruleta de seis categorías de colores con un casillero de corona es la firma visual de Preguntados (Etermax, Buenos Aires: mismo mercado y mismas tiendas). La mecánica no es protegible (Ley 11.723, art. 1); el conjunto visual sí puede serlo (Tetris v. Xio). No se encontraron demandas de Etermax contra copias (búsqueda del 19-10). Probabilidad baja, daño medio. | La corona dice sola «premio, elegí». El yunque hay que explicarlo una vez («Cómo se juega» ya lo dice: en la Armería se forja la pieza). | **Vale la pena**, costo mínimo. Revisar en el APK 23 que el ícono se lea a 44 px. |
| **«Quién fue quién»** | Marca de Hasbro («¿Quién es quién?», Guess Who?). | Nada: es el título de una ruta. | **Obvio.** |
| **La fila de versión en cada pasaje** | No es un cambio legal: es la respuesta al pedido de fidelidad entre versiones (capítulo 49). | Dos cosas que se notan: (a) la versión aparece dos veces, en la píldora y en la leyenda larga de abajo del pasaje; (b) «RVR1960 ↗» en medio de una lección saca de la app (abre Bible.com o YouVersion) y puede sugerir que la 1960 es «la de verdad» y la de Senda una copia menor. | **Ajustar en la prueba 24** (§6.3), sin tocar nada legal. |

### 6.1 Música: cómo volver a la vara alta sin riesgo

- HECHO (19-10-2026, audiojungle.net/licenses/terms/music_standard): la licencia **Music Standard** de AudioJungle lista «apps,
  games» entre los productos finales, permite productos «free or commercial, monetized or not» y pone un límite de **10.000 copias o
  descargas**; la **Music Mass Reproduction** no tiene límite de copias. El precio lo fija cada autor; fuentes secundarias (no
  oficiales) ubican la reproducción masiva entre USD 50 y 200 por pista (ESTIMACIÓN; verificar en la compra).
- ESTIMACIÓN: un inicio y cinco fondos con licencia de reproducción masiva, USD 300 a 1.000 una sola vez. Se compra cuando haya
  ingresos o cuando el fundador decida subir la vara (regla 8: lo aprueba él). Hasta entonces, MacLeod.
- Envato Elements (suscripción) también cubre apps si el proyecto se registra con la suscripción activa, y esa licencia queda
  perpetua para ese producto (HECHO por fuentes secundarias del 19-10; la página oficial no se pudo leer hoy: verificar antes de pagar).

### 6.2 Lany: que el color lo elija el fundador

La paleta de Lany está en `scripts/rive/lani.py` (constantes `CARBON`, `CARBON_LUZ`, `CARBON_OSC`): cambiar el color de la cara es
una línea. Las dos variantes (gris pizarra y crema) ya están generadas con sus 20 poses (`scripts/rive/lani_variantes.py`) y se
eligen en la Consola, pestaña «Lany», junto a la canela y a la v3 archivada; la elección queda guardada y Claude regenera a Lany con ese
color en la prueba 24. Lo que no vuelve: cara negra con lana blanca y copete (la combinación de Shaun). Lo que sí puede
volver si la v3 le gusta mucho más: la forma de la v3 con otro color.

### 6.3 La fila de versión: misma fidelidad, menos ruido

En las lecciones y en la trivia, dejar solo la píldora de la izquierda («RV1909 · escritura de hoy» ⓘ) y mover «RVR1960 ↗» adentro
de la hoja «Las versiones, en una pantalla» (un toque más, misma disponibilidad; no se sale de la lección por accidente). En la
Biblia, las dos píldoras como hoy. Sacar la leyenda repetida de abajo del pasaje cuando la fila está a la vista (la atribución completa
sigue en Licencias y créditos y en el pie del lector). Listo para hacer con el visto bueno del fundador después de probar el APK 23.

### 6.4 Lo que no se cambia por lo legal (y no conviene cambiar)

El camino de la Travesía (mecánica genérica, con lenguaje propio: la senda iluminada), las reacciones de Lany, la ruleta misma,
«Vivir la historia», «En la frente», «Nombres por letra» (mecánicas de más de veinte años con nombres propios), la trivia por
categorías. Cambiarlos «para estar más seguros» sería pagar en experiencia por un riesgo que ya es bajo. Regla para adelante: antes
de cualquier cambio por lo legal, la misma tabla (riesgo real × daño, contra costo de UX); si la experiencia pierde algo que se nota,
se le pregunta al fundador antes.
