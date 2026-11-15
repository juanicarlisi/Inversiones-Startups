# «A grande história», la prueba de arranque en el repositorio y tres misiones más (la prueba 32)

<div class="enpocas" markdown="1">
**En pocas palabras.** El fundador pidió el 21-10-2026: «Continuemos con los próximos, luego chequeo todo lo que está en backlog».
Los próximos eran los que dejó el capítulo 57 §8, y se hicieron en ese orden. **Uno:** la primera ruta de contenido en portugués.
«El gran relato» es ahora **«A grande história»**: 47 lecciones, 9 capítulos, 65 niveles y las 6 líneas de tiempo que usan esas
lecciones, en portugués de Brasil, con cada cita textual de la **Bíblia Livre** y los nombres propios como ella los escribe (§2). Para
eso hubo que construir el motor que faltaba: un archivo por ruta e idioma, con las mismas claves que el español; la app fusiona los
dos y, si algo falta, queda el español; las citas se escriben solas con los nombres de los libros del idioma («Gênesis 3:1 e 20»);
y el validador revisa la traducción contra la Biblia del idioma con las mismas reglas que la RV1909 (§3). **Dos:** la prueba de
arranque en Node que se armó en la prueba 31 para buscar el cierre quedó dentro del repositorio y corre en GitHub Actions antes de
cada APK, junto con el validador: un APK que no arranca o un contenido con errores ya no se compila (§4). **Tres:** tres misiones más
para «Vivir la historia» (José y sus hermanos, Elías en el Carmelo y el ciego de Juan 9), con cinco láminas nuevas, para las semanas
10, 11 y 12 (§5). **APK 32**, que trae absolutamente todo (§6). Lo que queda para después y lo que espera del fundador, en §7.
</div>

## 1. Lo que dijo el fundador y dónde quedó

| Lo que dijo (resumen) | Dónde quedó |
|---|---|
| «Continuemos con los próximos» | §2 y §3 (la ruta en portugués y su motor: el primer «próximo»), §4 (la prueba de arranque en el repositorio: el segundo), §5 (las misiones: el cuarto); el tercero («profetas mayores o más libros, según lo que pida el fundador») y el quinto (el comparador de la 1960, si aparece el archivo) no tenían pedido, §7 |
| «luego chequeo todo lo que está en backlog» | §7 (lo pendiente de las pruebas 24 a 32, ordenado, para que lo revise de una vez) |

## 2. «A grande história»: la primera ruta en portugués

**Qué se tradujo (HECHO, 21-10-2026).** La ruta entera «El gran relato» (`fundamentos`): el nombre y la descripción de la ruta; los 9
capítulos con su nombre y su resumen; los 65 niveles con su título y su detalle (47 lecciones, 9 cofres y 9 jefes); las 47 lecciones
completas (título, el relato con su «hasta acá» y su «lo que sigue», «Lo que aprendiste», «Para tu vida» y las 286 preguntas con sus
opciones y explicaciones); y las 6 líneas de tiempo que esas lecciones muestran en la portada (toda la Biblia, los patriarcas, el
Éxodo, los reyes, la vida de Jesús y los primeros años de la iglesia: 84 tramos con título, fecha y detalle). Todo vive en un solo
archivo, `contenido/traducciones/pt/fundamentos.json` (3.000 líneas), con las mismas claves que el español.

**Cómo se tradujo.** Capítulo por capítulo, con el español a la vista y, para cada cita, el texto de la Bíblia Livre al lado: cada
versículo que se cita entre comillas en el relato, en las explicaciones o en «Para tu vida» se copió de la Bíblia Livre, nunca se
tradujo del español. Los huecos de «completar» y las frases de «¿Quién lo dijo?» usan las palabras que la Bíblia Livre tiene (cuando
la frase portuguesa no permitía el mismo hueco, se cambió el hueco: en Ester 4:14 el español completa «hora» y el portugués «rainha»,
porque la Bíblia Livre dice «para tempo como este que chegaste a ser rainha»). Las reglas de redacción son las mismas: nada que se
preste a confusión, la respuesta correcta nunca es la frase de un error, lo interpretativo marcado como tal. Decisiones de idioma:

- **Portugués de Brasil, con «você»** en lo que se le dice a la persona («Hoje olhe para alguém que é difícil para você»), que es
  como habla la interfaz desde la prueba 26; las citas bíblicas conservan el «tu» y el «vós» de la Bíblia Livre.
- **Los nombres propios, como los escribe la Bíblia Livre:** Abraão, Isaque, Jacó, Moisés, Josué, Davi, Elias, Tiago, Estêvão,
  Sadraque, Mesaque e Abednego, Ninrode, Sinear, Ararate, Gósen, Hebrom, Jope. Donde el español dice «Jehová», el portugués dice
  «o SENHOR» (así traduce la Bíblia Livre el nombre de Dios, en mayúsculas), y donde el español explica «la RV1909 dice…», el
  portugués explica lo que dice la Bíblia Livre («a Bíblia Livre escreve "Ararate"»).
- **Lo que se explica del idioma viejo no se traduce:** el glosario del español (las palabras de la RV1909 que cambiaron) no se aplica
  en portugués, porque la Bíblia Livre es una revisión de 2018 con la escritura de hoy; en su lugar, una lección en portugués no muestra
  glosario (si alguna palabra lo necesitara, el archivo de traducción puede traer el suyo).
- **Las citas se escriben solas.** El archivo no trae ninguna cita: la app toma la del español («Génesis 3:1, 20-24») y la escribe con
  los nombres de los libros del idioma («Gênesis 3:1, 20-24»; «Mateo 4:4, 7 y 10» → «Mateus 4:4, 7 e 10»). Así no hay forma de que una
  cita traducida apunte a otro pasaje.

**Qué se ve en portugués** (vista previa, 21-10): Inicio con «Seguir sua senda · A grande história · A criação, nível 1»; el camino de
la Travesía con «A grande história», «Capítulo 1 · Os começos» y su resumen, los niveles con «Entrar»; la portada de «Adão e Eva» con
la línea de tiempo («Sem data · A criação», «≈ 2000 a.C. · Abraão sai de Harã»), la historia, «O que você vai ler · Gênesis 2–3» y
«Vamos!»; cada pregunta con su «Está em Gênesis 2», sus opciones y su explicación. Las capturas están al final del capítulo.

**Lo que queda en español dentro de la ruta, a propósito.** Los 8 diagramas que usan sus lecciones (la semana de la creación, las
plagas, el tabernáculo, el templo, la estatua de Daniel, la última semana, el árbol de Abraham, el reino dividido): su texto va
dibujado dentro del SVG que arma `scripts/arte/diagramas.py`, y se traduce cuando se traduzcan los visuales (2027, con los mapas y las
láminas, que también tienen nombres de lugares en español). Y los nombres de las 15 áreas y de las rutas que todavía no están
traducidas, en el explorador de la Travesía: son el plan entero, y traducir el nombre de una ruta cuyo contenido sigue en español
confundiría más de lo que ayuda; se traducen a medida que se traducen las rutas.

**Cuánto costó (HECHO):** una sesión entera de trabajo para la ruta, incluido el motor; la estimación de `docs/TRADUCCIONES.md` (4 a
6 horas por ruta de 40 lecciones con verificación versículo por versículo) quedó corta por el motor y las líneas de tiempo, y es
razonable para las próximas rutas, que ya no lo necesitan.

## 3. El motor: cómo una ruta se traduce sin que se pierda nada

Lo que faltaba no era solo texto: la app no tenía forma de mostrar una lección en otro idioma. Lo que se construyó (todo en la app,
`docs/TRADUCCIONES.md` lo documenta):

1. **El archivo por ruta e idioma** (`contenido/traducciones/<idioma>/<ruta>.json`): la cabecera (idioma, ruta y qué Biblia se usó),
   el nombre y la descripción de la ruta, `secciones` (nombre, resumen y cada nivel por id), `lineas` (las líneas de tiempo por id,
   con cada tramo por id) y `lecciones` (por id, con las preguntas en el mismo orden que el español). **Solo texto:** el tipo de
   pregunta, cuál es la correcta, las citas, los visuales y las lecturas no se pueden traducir (el validador lo rechaza); de un visual
   solo se traduce el título.
2. **La fusión** (`src/datos/traducciones.ts`): el español con la traducción encima, clave por clave; una lista traducida reemplaza
   a la del español elemento por elemento; lo que la traducción no trae queda en español. Así nunca se pierde una pregunta ni un
   campo, y una ruta a medio traducir se vería mezclada pero entera (el validador no deja publicar una ruta a medias, §3.4).
3. **Dónde entra:** la lección (`leccion(id)`), el jefe de cada capítulo (que arma sus preguntas con las lecciones traducidas), el
   repaso, la ruta en el camino de la Travesía (`rutaDe`), el nombre de la ruta en Inicio, en la cabecera del camino y en el
   explorador, y las líneas de tiempo (`traducirLinea`). Los nombres de los libros en portugués e inglés viven ahora en
   `src/datos/biblia.ts` (`NOMBRES_PT`, `NOMBRES_EN`), y `referencia()` y las lecturas se escriben en el idioma elegido; el lector de
   citas (`src/datos/citas.ts`) entiende «Gênesis 3:1 e 20» y «Psalm 23:1» además del español. Para sumar una ruta o un idioma basta
   escribir el archivo e importarlo en una lista: Metro empaqueta solo lo que se importa, así que el APK no crece con idiomas que no
   se usan.
4. **El validador** (`scripts/validar_contenido.py`, sección «Traducciones», HECHO: corre en cada commit y ahora también antes de cada
   APK): exige que cada archivo refleje la ruta entera (todas las lecciones, todos los capítulos y niveles, todas las líneas de tiempo
   que usan sus lecciones: si falta una, es error); que cada lección sea un espejo del español (mismas claves, listas del mismo largo,
   ninguna clave estructural); y revisa cada lección contra la Biblia libre del idioma con las mismas reglas que la RV1909: los huecos
   de «completar» y las frases de «¿Quién lo dijo?» tienen que estar palabra por palabra en el pasaje citado (error si no); todo lo
   entrecomillado en el relato, el resumen, las explicaciones y «Para tu vida» tiene que leerse así en los pasajes de la lección (aviso
   si no, y en esta ruta no quedó ninguno); una enseñanza falsa se nombra como error también en portugués e inglés; y un texto que quedó
   igual que en español se avisa. La Bíblia Livre en portugués y la Berean Standard Bible en inglés quedan asignadas como Biblias de
   referencia; sumar un idioma es sumar una línea.

**INFERENCIA:** con este motor, la trivia del Espadeo y los personajes de «¿Quién es?» (los siguientes del plan de traducciones) van a
necesitar lo mismo que las lecciones (un archivo por banco, una sección más en el validador), pero no otro motor: lo que se construyó
sirve para todo el contenido con citas.

## 4. La prueba de arranque, dentro del repositorio y antes de cada APK

La prueba 31 armó una prueba automática que carga la app entera en Node con el preset de Android y la dibuja con un estado guardado;
estaba en una carpeta temporal y se corría a mano. Ahora (HECHO, 21-10-2026):

- Vive en `pruebas/arranque/` (la configuración de Jest, el plugin que convierte `import()` en `require()`, la prueba) y se corre con
  `npm run prueba:arranque`. No hay `babel.config.js` en la raíz: Metro sigue usando el preset de Expo por defecto, exactamente como
  hasta hoy, y la prueba usa ese mismo preset más el plugin, declarado en su propia configuración; el APK no cambia por tener la prueba.
- `jest-expo`, `jest` y `react-test-renderer` entran como dependencias de desarrollo (no van al APK) y el `package-lock.json` quedó
  en orden para `npm ci`.
- Corre **en GitHub Actions antes de compilar cada APK**, junto con el validador de contenido: si el contenido tiene un error o la app
  no arranca, el APK no se compila. Localmente tarda 50 segundos (seis pruebas: los módulos cargan desde `index.ts`; Inicio se dibuja
  con un estado guardado; la bienvenida en una instalación nueva; una clave de traducción que no existe no revienta; la guardia atrapa
  un error al dibujar; un evento guardado con un tipo que ya no existe no revienta).

## 5. Tres misiones más para «Vivir la historia»

Las tres que dejó anotadas el capítulo 57, escritas con la misma regla que las diez anteriores (cada frase entrecomillada, textual en
la RV1909 dentro del pasaje citado; cada error, nombrado como error con dónde está lo correcto; la correcta nunca la más larga: el
validador rechazó las tres versiones primeras por eso y se reescribieron las opciones):

| Semana | Misión | Pasaje | Pasos | Láminas nuevas |
|---|---|---|---|---|
| 10 (desde el 28-12) | **De la cisterna al palacio** (José y sus hermanos) | Génesis 37; 42–45; 50 | 7 | `dotan` (el campo, la cisterna, la caravana) y `palacio_jose` (el trono, la copa, el abrazo) |
| 11 (desde el 04-01) | **Fuego en el Carmelo** (Elías) | 1 Reyes 18 | 6 | `carmelo` (el altar, los profetas de Baal, el fuego, la nube, la lluvia) |
| 12 (desde el 11-01) | **Una cosa sé** (el ciego de nacimiento) | Juan 9 | 7 | `siloe` (el camino, el lodo, ve) y `sinagoga` (el interrogatorio, fuera) |

Lo que enseña cada una, en una línea: José, que Dios encamina a bien lo que otros pensaron para mal, y que el perdón se apoya en eso;
Elías, que no se puede claudicar entre dos pensamientos, y que el fuego cayó al instante pero la lluvia pidió orar siete veces; el
ciego, que no hace falta saberlo todo para dar testimonio de lo que Jesús hizo. Jesús no se dibuja en ninguna lámina (regla del
capítulo 44): en Siloé se ve al hombre que camina a ciegas al estanque y vuelve viendo. «Vivir la historia» queda con **13 misiones, 90
pasos y 360 opciones**, hasta el 11-01-2027; las láminas, en 27.

## 6. El APK 32

Trae absolutamente todo lo anterior (prueba 31b incluida: la guardia, las 21 cartas) más esta prueba: la ruta en portugués (se ve al
poner el idioma en **Ajustes → Idioma → Português**: Inicio, la Travesía y «A grande história» cambian; el resto del contenido sigue en
español, como está previsto), las tres misiones (llegan solas en sus semanas; en la vista previa se pueden abrir desde «Jugar → Vivir
la historia») y el arranque probado antes de compilar. Versión 0.32.0. No hace falta probar la 31b: la 32 la contiene.

{{PANTALLAS32}}

## 7. Pendientes y decisiones

1. **Para el fundador (lo que dijo que iba a chequear: el backlog, ordenado por lo que más decide):**
   - Probar el **APK 32** (Travesía en portugués; una misión nueva; y, si algo falla, «Copiar el detalle» y pegarlo en el chat).
   - Las decisiones que esperan desde antes: licencias (NTV por API.Bible ahora, SAS en noviembre, RVR1960 por la DBL; DEC-2026-10-19-3),
     la consulta a la Sociedad Bíblica Argentina (`docs/legal/consulta_sba.md`), INPI y abogado de PI, la autorización del ministerio
     aliado, la cuenta de Google Play antes del 15-11 (prueba cerrada con 12 testers), el sitio público, Claude Max (DEC-2026-10-17-3),
     la voz (DEC-2026-10-17-2), el color de Lany, el entorno de prueba para líderes.
   - El archivo de la RVR1960: si lo tiene, lo adjunta en el chat; si no, se cierra (nada depende de él).
2. **Próximos (en este orden, salvo que el fundador diga otra cosa):** la trivia del Espadeo en portugués (728 preguntas, con el motor
   de §3 extendido al banco) y los personajes de «¿Quién es?»; la ruta «El gran relato» en inglés (Berean Standard Bible), que el
   motor ya soporta; los nombres de las áreas y de las rutas del explorador a medida que se traduzcan las rutas; más misiones de
   «Vivir la historia» después del 11-01 (hay candidatas en el inventario: David y Goliat, Rut ya está, la viuda de Sarepta, Zaqueo);
   más libros jugables cuando el fundador pida alguno (profetas mayores si no dice nada); el comparador de la RVR1960 solo si aparece el
   archivo.
3. **Regla que queda (DEC-2026-10-21-2):** el contenido traducido se verifica contra la Biblia libre de su idioma con las mismas reglas
   que el español, y una ruta se publica en un idioma solo entera (todas sus lecciones, capítulos, niveles y líneas de tiempo); lo
   estructural nunca se traduce; las citas se escriben solas en el idioma; un APK no se compila si el contenido tiene errores o la app
   no arranca en la prueba automática.
