# La misión de la semana, «Cómo se juega» en todos los juegos y un calendario más simple: la prueba 21

<div class="enpocas" markdown="1">
**En pocas palabras.** La prueba 21 (19-10-2026) responde al fundador sobre tres cosas que no le cerraban y avanza con lo previsto.
- **«Vivir la historia» es ahora la misión de la semana**: una historia por lunes (al lanzar, una sola), que se recorre en 6 a 8
  pasos con cuatro opciones parecidas en cada uno; si hubo un error, no queda cumplida y se vuelve a intentar; cumplirla da talentos.
  Se sacó el modo en grupo y los textos se leen mejor (§2).
- **«Cómo se juega» en los siete juegos**, corto y claro, sola la primera vez y siempre a mano (§3).
- **El evento nuevo se arma en cuatro pantallas**: solo el título, el día en el calendario del mes, la hora con ruedas como la
  alarma del teléfono (o escribiéndola) y al final si se repite y el aviso (§4).
- **Lo previsto**: Quién es quién capítulo 3 (poetas y profetas), la trivia pasa las 600 y «¿Quién es?» tiene tableros por tema (§5).
- **Un error encontrado al revisar**: una animación dejaba pantallas transparentes en la web; corregido (§6).
</div>

## 1. Lo que pidió el fundador y dónde quedó

| Pedido (resumen) | Dónde quedó |
|---|---|
| Explicar bien las instrucciones de cada juego antes de empezarlo, fácil y sencillo | §3: «Cómo se juega» en los siete juegos |
| «Vivir la historia» no cierra; una vez hecha queda tildada; una por semana como desafío, individual, más opciones, más difíciles, varios pasos, puntos; sacar el modo en grupo; al lanzar una sola; textos más amigables; si erró, no aparece completada | §2 |
| Calendario: sin clasificaciones; título y listo; el día con un calendario dinámico y lindo; la hora como en la alarma, deslizando o escribiendo; después si se repite; más compacto | §4 |
| Revisar y rediseñar la UX en general | §3, §4 y §6; la misión de la semana en Inicio (§2) |
| Avanzar con todo lo próximo y pendiente | §5 |

{{PANTALLAS21}}

## 2. «Vivir la historia» como misión de la semana

**Por qué cambió.** La versión 2 (prueba 19) proponía decidir «como si fueras el personaje» y mirarse en un espejo al final, sin
puntos. Al fundador no le cerraba, el modo en grupo de la prueba 20 le resultó raro y una historia ya hecha quedaba tildada sin nada
más que hacer. La versión 3 tiene un objetivo simple: **recorrer una historia de la Biblia paso a paso y acertar lo que pasó**.

**Cómo funciona.**
- **Una historia por semana.** Cada lunes se suma una (`calendario` en `contenido/historias_rol.json`). Al lanzar habrá una sola; las
  anteriores quedan para jugar y la próxima se anuncia con su fecha, sin decir cuál es. Hoy hay siete, del 19-10 al 30-11: Jonás,
  Rut, Daniel, Ester, el carcelero de Filipos, la multitud de Juan 6 y los pastores de Belén. **Antes del lanzamiento hay que poner
  como fecha de inicio el lunes en que salga la app** (lo hace Claude); para probarlas todas ya, Ajustes → «Ver todas las historias».
- **De 6 a 8 pasos.** Cada paso cuenta lo que está pasando en párrafos cortos, con negritas y las citas de la Biblia en color, y el
  pasaje a un toque. Pregunta qué pasó («¿Qué hace Jonás?») y da cuatro opciones parecidas: lo que hizo otro personaje, lo que pasa
  en otro momento de la historia, un detalle cambiado. Las opciones se mezclan y **la correcta ya no se adivina por el largo** (antes
  era la más larga en 44 de 51 pasos; ahora en 12, y el validador no deja que vuelva a pasar).
- **Al responder**: si fue un error, «No fue así» con el porqué y dónde está lo correcto; siempre, «Lo que pasó» con su cita y
  «Por qué». Lany reacciona al error como en la lección.
- **Se cumple sin errores.** Si hubo alguno, al final dice «¡Casi! 6 de 8», muestra cada paso que se escapó con la respuesta y su
  cita, y ofrece volver a intentarla. Cumplida: **50 talentos en su semana y 25 después**, fiesta con confeti y globos.
- **En Inicio**, una tarjeta muestra la misión de la semana, cuántos días quedan y los talentos; cumplida, cuándo llega la próxima.

**Contenido.** 7 historias, 51 pasos y 204 opciones, escritas leyendo la RV1909 de la app (`scripts/autor/historias_rol.py`). El
validador controla cada comilla contra el pasaje que se cita, que cada error tenga su explicación y la nombre como error, el
calendario y el largo de las opciones. Lo que ya estaba (las láminas animadas, la música) se conserva. **Se sacó el modo en grupo**
(queda en la historia del proyecto, capítulo 45 §7).

**Lo que sigue.** Una historia nueva por semana después del 30-11, con su lámina; las candidatas son David y Goliat, Gedeón, Pedro
sobre el agua, Nehemías y el muro, y Elías en el Carmelo.

## 3. «Cómo se juega» en los siete juegos

Una hoja igual para todos (`src/componentes/comoSeJuega.tsx`): Lany, el nombre del juego, tres o cuatro pasos cortos con un ícono y
lo importante en negrita, **cómo se gana** en un recuadro dorado y un botón «Entendido». Aparece **sola la primera vez** que se entra
a cada juego y después queda en el botón **«? Cómo se juega»** de la pantalla del juego. Lo que dice cada hoja es lo que hace el
código (por ejemplo, en el Espadeo: 25 segundos por pregunta, la Carga que se vacía con un error, tres luces por partida y una vida
por partida). Juegos: Espadeo, ¿Quién es?, En la frente, Nombres por letra, Vivir la historia, Antes o después y Trivia de la iglesia.

## 4. El evento nuevo, en cuatro pantallas

| Paso | Qué se ve |
|---|---|
| 1. ¿Qué evento es? | Solo el título. El tipo (color, ícono, cuánto dura y cuándo avisa) **sale solo del título**: «Reunión de oración» es oración, «Cumpleaños de Ana» es cumpleaños y queda de todo el día. Ya no hay clasificaciones para elegir |
| 2. ¿Qué día? | El **mes entero en grilla**, con hoy marcado, los días pasados apagados, el elegido en el color del evento y atajos (hoy, mañana, el fin de semana); se cambia de mes deslizando |
| 3. ¿A qué hora? | **Dos ruedas como la alarma del teléfono**: se deslizan, se clavan en el número y el del medio se agranda; un toque trae un número al medio. «Escribir la hora» cambia a dos casillas para teclear. «Todo el día» y cuánto dura, con la hora en que termina |
| 4. Listo | El resumen, si se repite, cuándo avisar y «Más opciones» (lugar con mapa, enlace, notas, foto) |

Al editar un evento se ve todo junto, en el mismo orden. Las ruedas (`src/componentes/rueda.tsx`) funcionan igual en Android, iPhone
y la web.

## 5. Lo previsto que se avanzó

- **Quién es quién, capítulo 3: Poetas y profetas** (6 lecciones, con cofres y jefe): Job y sus amigos; los que escribieron cantos y
  proverbios (David, Asaf, los hijos de Coré, Moisés, Hemán y Etán, Salomón, Agur, Lemuel); alrededor de Isaías (Uzías, Acaz,
  Sear-jasub, Emanuel, Ezequías, Senaquerib, Ciro); alrededor de Jeremías (Baruc, Joacim, Hananías, Ebed-melec); Ezequiel y los nombres
  de Babilonia (Beltsasar, Sadrac, Mesac, Abed-nego, Belsasar); y los doce profetas. Lo interpretativo va marcado (por ejemplo, el
  Redentor de Job 19:25 como lectura cristiana). Quedan Evangelios y Hechos y cartas.
- **Trivia de 602 preguntas** (banco 4: 42 nuevas, 7 por pieza), sobre lo trabajado en esta prueba y sin repetir temas de los
  bancos anteriores (se revisó tema por tema); cada una con su palabra clave en el versículo.
- **Tableros por tema en «¿Quién es?»**: toda la Biblia, Antiguo Testamento, Nuevo Testamento y mujeres de la Biblia (11).
- Los libros cortos que figuraban como siguientes (Joel, Sofonías, Filemón, Judas y 1, 2 y 3 Juan) ya estaban jugables.

## 6. Un error encontrado al revisar

En la web, la pantalla del primer paso y la del final de «Vivir la historia» quedaban **transparentes**: la animación de entrada
arrancaba antes de que la vista nueva estuviera montada y, al desmontarse la anterior, el motor de animaciones la frenaba en cero.
Ahora la entrada se anima después de montar la vista. Se revisaron las otras pantallas con el mismo patrón (la bienvenida ya lo hacía
bien).

## 7. Pendientes y decisiones

- **Probar la prueba 21** (pendiente `probar21` en la Consola).
- **Fecha de inicio de la misión de la semana**: el lunes del lanzamiento (Claude la cambia antes de publicar).
- Siguen abiertas las decisiones anteriores: música de inicio en la Consola, licencias y figura legal (capítulos 38 y 39), voz
  (capítulo 42 §6) y la cuenta de Google Play antes del 15-11.
