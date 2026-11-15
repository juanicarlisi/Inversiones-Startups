# Senda: blindaje legal (19-10-2026, prueba 23)

Pedido del fundador: que de ninguna manera Senda caiga en un problema legal (demandas por plagio, por imitar otra app o juego,
música, contenido, nombres, imágenes). Esta bitácora reúne la ley aplicable, los casos que marcan el límite, lo que se revisó
activo por activo y lo que se cambió. HECHO = leído en la fuente ese día; INFERENCIA = conclusión propia. **Nada de esto es
asesoramiento legal**: la recomendación final es una revisión de una hora con un abogado de propiedad intelectual sobre
`docs/LEGAL.md` de la app antes de publicar en las tiendas.

## 1. El marco: qué protege la ley y qué no

| Norma | Qué dice | Qué significa para Senda | Fuente |
|---|---|---|---|
| **Ley 11.723, art. 1** (Argentina) | La protección «abarca la expresión de ideas» y «no esas ideas, procedimientos, métodos y conceptos en sí» | Las **mecánicas** de un juego (girar una ruleta, adivinar con preguntas de sí o no, ordenar hechos) no tienen dueño; su **expresión** (dibujos, textos, personajes, aspecto) sí | argentina.gob.ar/normativa, HECHO |
| **Ley 11.723, art. 5 y 8** | 70 años desde la muerte del autor; las obras anónimas de personas jurídicas, **50 años desde su publicación** (Decreto Ley 12.063/57) | La RV1909 es de dominio público en todo el mundo. La RVR1960 (1960, SBU) estaría en dominio público **en Argentina** por el art. 8, pero no en EE.UU. (95 años desde la publicación) ni en la mayoría de los países donde se distribuye la app; además «Reina-Valera 1960» es marca registrada. Conclusión: se licencia, como ya se decidió | argentina.gob.ar, OEA, HECHO |
| **Ley 11.723, art. 10** | Derecho de cita: hasta 1.000 palabras de obras literarias «con fines didácticos o científicos», solo lo indispensable; los tribunales lo aplican de forma restrictiva | No cubre reproducir una versión bíblica con derechos en una app comercial; sí cubre citar frases cortas con fuente en una explicación | cerlalc.org (fallos), HECHO |
| **Ley 22.362** (marcas) | Primero en registrar, primero en derecho; la marca no registrada tiene defensa débil | Registrar «Senda» y el logo (clases 9, 41, 42) antes del lanzamiento | INPI, HECHO (bitácora del 28-09) |
| **Ley 24.481, art. 6** (patentes) | No se patentan programas de computación ni métodos para juegos en Argentina | Las patentes que importan son las de EE.UU. y Japón, donde sí se patentan mecánicas de software | INPI, HECHO (28-09) |
| **Ley 25.326 y AAIP** (datos) | Datos mínimos, consentimiento, derechos de acceso y borrado; guías de la AAIP para menores (dic-2024) | Ya cumplido por diseño (identificador anónimo, nada de nombre ni contactos, borrado en Ajustes); 13+ en las tiendas | allende.com, marval.com, HECHO |
| **Google Play: suplantación** | «App titles and icons that are so similar to those of existing products or services that users may be misled» es violación | Nombre, ícono y ficha propios; no nombrar otras apps en la ficha | support.google.com/googleplay/android-developer/answer/9888374, HECHO |
| **Apple 4.1, 5.2.1, 1.1.5, 4.3** | «Don't simply copy the latest popular app… or make some minor changes to another app's name or UI»; «Don't use protected third-party material such as trademarks, copyrighted works, or patented ideas»; «inaccurate or misleading quotations of religious texts»; apps «indistinguishable from what's already widely available» | Senda es una app completa y propia; toda cita se verifica; nada de marcas ajenas | developer.apple.com/app-store/review/guidelines, HECHO |

## 2. Los casos que marcan el límite (y qué enseñan)

| Caso | Qué pasó | Lección para Senda |
|---|---|---|
| **Tetris Holding v. Xio Interactive** (D.N.J., 2012) | El clon «Mino» copió el aspecto de Tetris (dimensiones del tablero, piezas, pieza fantasma, vista de la pieza siguiente); el juez lo condenó por copiar el *look and feel*, aunque las reglas no tengan dueño | Inspirarse en una mecánica está permitido; copiar cómo se ve, no. Por eso el Espadeo no puede parecerse a Preguntados en lo visual |
| **Spry Fox v. LOLApps** (W.D. Wash., 2012) | Yeti Town copió Triple Town; el juez dijo que un videojuego tiene «trama, tema, diálogo, humor, escenario, ritmo y personajes» protegibles; se arregló fuera del tribunal | Los personajes y el «tono» cuentan: Lany, los textos y las láminas tienen que ser propios |
| **King y «Candy»/«Saga»** (2014) | King registró «Candy» (en Europa) y se opuso a «The Banner Saga»; disputas resueltas por acuerdos | Las empresas grandes defienden palabras comunes como marca: evitar nombres que coincidan con marcas de juegos conocidos |
| **Hasbro v. Scrabulous** (2008) | Hasbro demandó al clon de Scrabble en Facebook y pidió la baja a Facebook; después retiró la demanda | Los dueños de juegos de mesa sí demandan a clones digitales |
| **Nintendo v. Pocketpair (Palworld)** (Japón, 2024-2026) | Demanda por tres patentes japonesas de mecánicas; Pocketpair cambió mecánicas en 2025; sin sentencia al 19-10-2026 | Antes de construir el modo fiesta tipo tablero, buscar patentes (regla del 11-10) |
| **Interstellar v. Kahoot!** (EE.UU., patente 10.339.825, «System and method for on-line academic competition») | Kahoot! fue demandada; su pedido de revisión de la patente fue rechazado por «expectativas asentadas» (2025-2026) | La trivia en vivo con proyector (idea votada) toca esa patente en EE.UU.: antes de lanzarla allí, leer las reivindicaciones y diseñar alrededor |
| **Miffy v. conejo coreano** (Seúl) | Dos personajes de animal «lindo» no son sustancialmente similares cuando lo que comparten es lo genérico de los animales | Una oveja puede ser mascota; lo que no puede es copiar **los rasgos distintivos** de una oveja famosa |

## 3. Lo que se revisó, activo por activo

**Música (el hallazgo grande, HECHO).** La página oficial de Mixkit (mixkit.co/license/modal/musicFree/) dice de la Stock Music Free
License: «You're not allowed to use them in CDs or DVDs, video games or tv or radio broadcast»; la lista «Not Allowed» incluye
«Video Games» y la de permitidos no menciona apps. Senda usaba seis temas de Mixkit desde la prueba 19 (la bienvenida y los cinco
fondos de los juegos), elegidos por calidad con la creencia equivocada de que la licencia cubría apps. **Se reemplazaron todos** por
temas de Kevin MacLeod (incompetech.com), licencia Creative Commons Atribución 4.0 (cualquier uso, también comercial, con el
crédito): «Nonstop» (la que el fundador había elegido en la prueba 17) para la bienvenida y la firma; «Funky Chunk», «Lobby Time»,
«Deuces», «Wallpaper» y «Dreams Become Real» como fondos. Los archivos y las propuestas de Mixkit se borraron de la app y de la
Consola. Pixabay se evaluó como alternativa: su licencia permite uso comercial y modificación pero no menciona apps ni juegos
(pixabay.com/service/terms); queda como posible, a confirmar con info@pixabay.com.

**Sonidos cortos.** VCSL (CC0, «para software comercial, sin regalías ni crédito», versilian-studios.com), Kenney (CC0 en cada
paquete, kenney.nl/assets/interface-sounds) y tres sonidos de Freesound CC0: en regla; se suman los nombres de Freesound a los créditos.

**Lany (la mascota).** La versión 3 tenía cara y patas negras, lana crema y un copete arriba: la combinación distintiva de **Shaun
the Sheep** (Aardman), marca y personaje con licencias activas en todo el mundo (Aardman registra «Shaun the Sheep» en varias clases;
EE.UU. n.º 79031031). Aunque el estilo, la ropa y las expresiones de Lany son propios, esa combinación es la que un tribunal miraría
primero (Spry Fox: los personajes cuentan). **Se hizo Lany v4**: cara, patas y manos canela, orejas rosadas, misma personalidad,
copete como la llama de la lámpara (motivo de Senda). La v3 queda archivada para comparar (Consola → `consola/propuestas/lany_v3/`).

**Nombres.**
- «Senda»: en Google Play hay apps «Senda» de finanzas, remesas, salud, hábitos (coach IA) y boletos, ninguna bíblica ni cristiana;
  en el App Store no apareció ninguna (búsquedas del 19-10-2026). Los dominios senda.app, sendaapp.com, appsenda.com, senda.ar y
  senda.com.ar están tomados; sendabiblia.com y sendabiblia.app no resuelven (verificar en el registrador). El INPI no se puede
  consultar desde este entorno: **buscar «SENDA» en las clases 9, 41 y 42** antes de presentar (fundador o gestor). Si hay
  conflicto, registrar la marca mixta «Senda · Biblia y juegos» con el logo.
- «Lany»: «LANY» está registrada en EE.UU. (n.º 5718771, banda; música y papelería). Clases y rubros distintos; riesgo bajo.
  Registrarla en Argentina como marca figurativa (el personaje) junto con Senda.
- Juegos: el de Hasbro se llama «¿Quién es quién?» (España) y «Adivina quién» (Latinoamérica); nuestro juego se llama **«¿Quién
  es?»** y la ruta de personajes pasó de «Quién es quién» a **«Quién fue quién»** para no acercarse al nombre registrado. HedBanz
  (Spin Master, marca mundial desde 2019), Timeline (Asmodee) y Tutti frutti/Scattergories (Hasbro) inspiran «En la frente», «Antes
  o después» y «Nombres por letra», con nombres y aspecto propios.
- Preguntados / Trivia Crack (Etermax): no hay patentes publicadas sobre la ruleta ni demandas conocidas contra clones, pero el
  aspecto está protegido. El Espadeo compartía con Preguntados el casillero de la **corona** (que lleva directo a elegir pieza):
  ahora es el **yunque de la Armería**. Las piezas de la armadura, Lany, los colores y la disposición ya eran propios.
- Duolingo: sin patentes ni juicios conocidos contra apps parecidas; la senda iluminada (puertas, cabecera con anillo) ya se alejó
  del camino de Duolingo en la prueba 16.
- «Reina-Valera 1960®»: marca registrada de Sociedades Bíblicas Unidas / American Bible Society; solo uso nominativo («abrir en
  RVR1960»). «Biblica®»: se usa la leyenda que pide la licencia de la NBV.

**Textos bíblicos.** RV1909 (dominio público, open-bibles); NBV, PDT, BES, Bíblia Livre, Nova Bíblia Viva (Creative Commons, con
sus leyendas); BSB y WEB (dominio público). RVR1960 y otras: solo enlace a Bible.com en el navegador del teléfono (Custom Tabs / hoja
de Safari): los Términos de YouVersion prohíben robots y copiar material, no enlazar; no se enmarca ni se copia texto. OpenBible.info
(referencias cruzadas): CC BY, acreditada. Natural Earth (mapas): dominio público, acreditada.

**Código.** 41 bibliotecas: MIT, Apache 2.0, BSD, ISC, OFL (ninguna GPL ni AGPL; revisado con `node` el 19-10-2026). Rive: runtime
MIT; los Términos de Rive dicen «you own your User Content» y el plan gratuito no restringe el uso comercial (rive.app/docs/legal).

**Contenido.** Nada se copia de libros ni del estudio del ministerio aliado (regla del fundador); las fechas y hechos históricos no
tienen dueño; no hay letras de canciones modernas (solo se menciona que «Castillo fuerte» es de Lutero, dominio público). El área
«El evangelio, paso a paso» toma la estructura del estudio del ministerio: conviene una **autorización escrita** simple
(borrador en la app: `docs/legal/autorizacion_ministerio.md`; la pide el fundador).

**Datos y anuncios.** Argentina (25.326, AAIP), Brasil (LGPD) al salir en portugués, GDPR si se habilita Europa; anuncios no
personalizados con consentimiento (UMP en Android, ATT en iOS); 13+. Sorteos solo con bases (capítulo 44 §7).

## 4. Lo que falta y quién lo hace

| Qué | Quién | Cuándo |
|---|---|---|
| Buscar «SENDA» y «LANY» en el INPI (clases 9, 41, 42) y presentar la marca (100 UMAPI por clase ≈ ARS 41.000 al 1-10-2026, ESTIMACIÓN; más el gestor si se quiere) | Fundador (o gestor) | Antes del 15-11 |
| Revisión de una hora con abogado de PI sobre `docs/LEGAL.md` | Fundador | Antes de la prueba cerrada |
| Autorización escrita del ministerio aliado | Fundador | Antes del lanzamiento |
| Dominio (sendabiblia.com o .app) | Fundador | Con el sitio |
| Leer las reivindicaciones de la patente US 10.339.825 antes de lanzar la trivia en vivo en EE.UU. | Claude | Cuando se construya (2027) |

## 5. Fuentes (leídas el 19-10-2026)
- Ley 11.723: https://www.argentina.gob.ar/normativa/nacional/ley-11723-42755/texto · fallos sobre el art. 10: cerlalc.org (jurisprudencia 1427, 2689)
- Mixkit: https://mixkit.co/license/modal/musicFree/ · https://mixkit.co/license/ · Pixabay: https://pixabay.com/service/terms/ · Incompetech (Kevin MacLeod): https://incompetech.com/music/royalty-free/licenses/
- VCSL: https://versilian-studios.com/vcsl/ · Kenney: https://kenney.nl/assets/interface-sounds · Natural Earth: https://www.naturalearthdata.com/about/ · OpenBible: https://www.openbible.info/labs/cross-references/
- Rive: https://rive.app/docs/legal/terms-of-service · https://rive.app/pricing
- YouVersion: https://www.bible.com/terms · ABS (RVR1960): https://bibles.com/pages/american-bible-society-rights-and-permissions
- Google Play (suplantación): https://support.google.com/googleplay/android-developer/answer/9888374 · Apple: https://developer.apple.com/app-store/review/guidelines/
- Casos: Tetris v. Xio (gamedeveloper.com; Wikipedia «Video game clone»), Spry Fox v. LOLApps (Wikipedia), King «Candy» (worldipreview.com, pocketgamer.biz), Hasbro v. Scrabulous (abajournal.com), Nintendo v. Pocketpair (patentarcade.com, gamereactor.eu), Interstellar v. Kahoot (ipverse.greyb.com; patents.google.com/patent/US10339825), Miffy (yulchon.com)
- Marcas: LANY (trademark.justia.com/873/43/lany-87343405.html), Shaun the Sheep (trademarks.justia.com/owners/aardman-animations-limited-2082494), HedBanz (licenseglobal.com), INPI (argentina.gob.ar/inpi/marcas/registrar-una-marca)
- Google Play «senda»: play.google.com/store/search?q=senda&c=apps (19-10-2026)
