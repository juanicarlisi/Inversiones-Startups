# Capítulo 78 — Prueba 53: el logo en la app, las doctrinas en la trivia y el contenido listo para el lanzamiento

**Fecha:** 13-11-2026. **Origen:** el fundador, después de cerrar con Claude en Chrome las cuentas (INPI, Google Play, Apple,
Cloudflare), pidió: «Continuemos».

## 1. Lo que pidió (textual)

1. «Me pareció muy grande el botón de "Jugar". Y un poco "cachivache"… Revisar».
2. «Crear APK con todas las correcciones requeridas» (las que estaban anotadas para el 53: el micrófono, el botón para activarlo, el
   logo nuevo, la Lany nueva de Rive, el dominio del sitio y los datos del responsable en lo legal).
3. «Sumar preguntas tipo "¿Cómo se conoce la doctrina de que Dios está presente en todas partes?" (o similar, es sólo ejemplo). No
   doctrinas problemáticas sino las comunes».
4. «Revisá todos los pendientes relacionados a preguntas de la trivia, y contenidos de travesías. QUE ESTÉ TODO PERFECTO Y COMPLETO
   PARA EL LANZAMIENTO».
5. «Avanzá con esto y los próximos».

## 2. Lo que se hizo

### 2.1 Jugar, una ficha dentro de la barra (pedido 1)

La moneda con zócalo que sobresalía de la barra salió. Jugar es ahora una **ficha ámbar de 48 × 28** dentro de la barra, a la altura
de las otras pestañas, con el ícono, la etiqueta debajo y el globito de avisos en la esquina; brilla apenas cuando está activa y se
hunde al tocarla. Sigue siendo la única pieza llena de color de la barra (regla R29 del marco de UX, reescrita). Commit 03b015d.

### 2.2 El logo «Camino en la noche» en la app (DEC-2026-11-10-4)

`scripts/marca/marca_camino.py` dibuja todas las piezas de la marca desde la misma geometría (la S como camino que se pierde en el
horizonte, la cruz separada en la luz, sin puntas): símbolo, versión clara, silueta, logo horizontal y apilado, piezas de redes.
`scripts/generar_iconos.cjs` saca de ahí el ícono, el adaptable de Android (frente con el ícono entero en la zona segura de 72 dp,
fondo de noche y monocromo para Android 13), el splash, el favicon, la notificación y la hoja de marca. El `Logo` de la bienvenida y
de la entrada lee los mismos archivos. El sitio público usa el logo nuevo. Commit 64f9c05.

### 2.3 Correcciones del APK 53

- **Micrófono** (causa raíz, ya en el 6a582bc): la configuración de expo-image-picker bloqueaba el permiso RECORD_AUDIO que pide el
  reconocimiento de voz; ahora el permiso se declara con el texto de Senda.
- **«Activar el micrófono»**: en «Nombres por letra» y en su torneo, si el permiso falta aparece el botón. Lo vuelve a pedir y, si
  Android ya no deja preguntar, abre los ajustes de Senda; al volver, el juego escucha solo (`activarMicrofono` en
  `src/util/escucha.ts`).
- **Dominio**: los enlaces para sumarse usan `https://senda-1zw.pages.dev/u/` (senda.pages.dev es de otra persona).
- **Legal**: privacidad y términos con el nombre y el domicilio del responsable; sitio regenerado. La leyenda «para revisión de un
  abogado» queda para la sesión legal exclusiva (DEC-2026-11-10-5).
- Commit 609a01d.

### 2.4 Las doctrinas comunes en la trivia (pedido 3)

Banco 53 (`scripts/autor/trivia_banco53.py`): **46 preguntas** que dan la definición en palabras simples y piden el nombre, como el
ejemplo del fundador. Entran solo las que comparten las iglesias protestantes:

- **Quién es Dios:** omnipresencia, omnisciencia, omnipotencia, inmutabilidad, eternidad, santidad, soberanía, providencia, la
  creación de la nada, Trinidad, monoteísmo, imagen de Dios, pecado original.
- **Jesús:** encarnación, unión hipostática, divinidad de Cristo, nacimiento virginal, expiación, propiciación, resurrección,
  ascensión, intercesión, segunda venida.
- **La salvación:** gracia, justificación por la fe, regeneración, santificación, adopción, reconciliación, redención,
  arrepentimiento, glorificación.
- **La Palabra:** inspiración, suficiencia, revelación general y especial, iluminación.
- **La Reforma:** Sola Scriptura, Sola fide, Sola gratia, Solus Christus, Soli Deo gloria.
- **Lo demás:** sacerdocio de todos los creyentes, el gran mandamiento, la resurrección de los muertos, el juicio final.

Afuera, por ser secundarias: bautismo, cena, elección, dones, el orden de los últimos tiempos. Cada pregunta va sobre un versículo que
ninguna otra usa; el dato dice dónde lo enseña la Biblia. Una salió por repetida («la fe sin obras» ya estaba).

Las 46 están también en portugués e inglés, traducidas a mano (capa `espadeo_mano`). La clave de cada una se lee en las dos Biblias
del idioma. Validador: todo en orden. Commits 9a7e41f y ee24273.

### 2.5 Las 1.026 preguntas «rebuscadas» que quedaban (pedido 4)

El detector de la prueba 52 (`scripts/autor/rebuscadas.py`) había marcado 1.026 preguntas que nadie había leído todavía. Las leyeron
**nueve revisores en paralelo**, una por una con su versículo de la RV1909 (lotes 27 a 35 de `scripts/autor/revision52/`), con la
regla 9 de `docs/REDACCION.md`: una sola pregunta directa, sin comodines, en positivo y corta. Claude controló después que cada lote
coincidiera con su parte, que ningún par de repetidas quedara retirado por los dos lados (esc-4219 se salvó: su gemela ya estaba
retirada) y que no quedaran dos enunciados iguales (esp-41141, Marcos, repetía a cin-41090, Mateo: salió).

- **978 reescritas**, **18 quedan como estaban** (ya eran directas) y **31 retiradas** (repetidas de un pasaje paralelo, como
  Reyes y Crónicas o Mateo y Marcos, o datos menores que no edifican).
- **Errores de contenido corregidos de paso:** Job 21:12 decía «arpa y flauta» (el versículo dice tamboril y cítara); Salmos 37:35,
  «cedro» por «laurel»; Proverbios 30:15, una respuesta que no estaba en ninguna Reina-Valera; Proverbios 17:22 y Rut 1:21, que la
  RVR1960 lee distinto; Hebreos 3:16, que la RV1909 y las versiones de hoy leen al revés (retirada); palabras viejas en opciones
  («enfervorizó», «doctores», «necio», «la inspiración del Omnipotente» → «el soplo», con Job 33:4 abriéndose en una versión que
  dice «soplo»).
- **La Biblia de la app:** errata «las mandamientos» en 1 Corintios 7:19, corregida en `scripts/biblia_arreglos.py`.
- **Resultado:** 0 preguntas marcadas sin leer; traducciones de lo que cambió en la capa a mano (portugués 5.281 preguntas, inglés
  5.256); validador: todo en orden. Commit efd5c89.
