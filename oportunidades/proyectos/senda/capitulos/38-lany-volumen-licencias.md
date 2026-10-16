# Lany con volumen, Personajes y la decisión de las licencias: la prueba 13

<div class="enpocas" markdown="1">
**En pocas palabras.** La prueba 13 (13 y 14-10-2026) responde al mensaje del fundador del 13-10-2026:
- **Lany ya no habla:** la boca y la voz se sacaron. Ahora tiene **volumen** (luces y sombras como un muñeco) y **mira**: gira la cabeza
  hacia la pregunta, hacia las respuestas, hacia arriba cuando piensa y hacia el nivel que sigue en el camino.
- **El «+» sigue creciendo:** cada uno de los 66 libros muestra **cómo está armado**, por partes, y cada parte lleva a su capítulo.
- **Personajes:** dos travesías nuevas, **Mujeres de la Biblia** y **Los patriarcas**: 22 lecciones y 131 preguntas verificadas contra
  la RV1909.
- **Licencias:** la licencia no es lo que hace inviable el negocio. La recomendación es no sacar anuncios ni suscripciones, lanzar con las
  versiones libres y sumar la NTV por API.Bible cuando se cumpla una regla de corte (§5).
</div>

## 1. Lo que pidió el fundador y dónde quedó

Resumen de lo pedido (sin citas textuales) y cómo se resolvió.

| Pedido | Qué se hizo | Estado | Dónde |
|---|---|---|---|
| Lany hablando se siente mal: sacarlo | Sin boca que habla y sin voz del teléfono en el globo; Lany actúa con el cuerpo y la mirada | Hecho | §2 |
| Mejorar a Lany todo lo posible, con lo que hacen Duolingo y lo que permite Rive; que se vea en 3D, como Duolingo | Volumen con luces y sombras en cada parte, sombras de contacto suaves y una mirada que gira la cabeza con profundidad | Hecho (falta verlo en el teléfono) | §2 y {{cap:16}} §3e |
| El «+» va bien: seguir evolucionándolo | «Cómo está armado» en los 66 libros | Hecho | §3 |
| Las lecciones y preguntas van bien: avanzar | Mujeres de la Biblia y Los patriarcas (área Personajes) | Hecho | §4 |
| Seguir con las próximas iteraciones y lo planificado | Personajes (sprint 2), inventario al día, APK prueba 13 | Hecho | §4 y §6 |
| Licencias: buscar a fondo y ayudar a decidir (sacar anuncios y suscripciones, otra monetización, una sola versión pagada, otras salidas) | Hechos leídos el 13-10, diez caminos comparados, recomendación y regla de corte, consulta a API.Bible lista; el camino A ya funciona con siete versiones | Para decidir | §5 |

## 2. Lany: sin voz, con volumen y con mirada

**Por qué se sacó el habla.** Una boca que se abre y se cierra mientras suena la voz del teléfono no se parece a una persona hablando:
se nota que es una máquina. En las apps que enseñan con un personaje, el personaje **actúa** y el texto lo dice el globo. Desde la
prueba 13, Lany no habla: el globo trae la pregunta y Lany la acompaña con el cuerpo.

**Volumen, como un muñeco (lo que se hizo en Rive).**
- **Luz y sombra en cada parte:** lana, mechón, cara, hocico, orejas, mangas, brazos, piernas, zapatos, bufanda y el blanco de los ojos
  tienen una sombra interior del lado opuesto a la luz y un brillo suave del lado de la luz. Es la técnica de los personajes de
  Duolingo (sombreado en dos tonos), con el dibujo de Lany.
- **Sombras de contacto:** una sombra suave bajo los pies, otra más oscura justo donde apoya y otra bajo la cabeza, sobre la bufanda.
  Es lo que hace que un personaje «pese» y no parezca recortado.
- **Cómo está hecho:** las sombras usan el «Feather» de Rive (un borde que se difumina) y degradados radiales. En el teléfono, el motor
  de Rive dibuja el difuminado suave; en la vista previa web, con el motor más simple, se ve como dos tonos marcados. El archivo de
  Lany pesa 48,7 KB y tiene 25 animaciones.

**La mirada que gira la cabeza (lo nuevo).**
- Lany tiene cinco miradas: **al frente, a las respuestas, a la izquierda, a la derecha y arriba.** Cada una mueve la cara, el hocico y
  la nariz, las orejas (la del lado al que gira se achica) y el mechón, cada cosa con una profundidad distinta. Así la cabeza parece
  girar en 3D, sin ser un modelo 3D.
- El cambio entre miradas tarda un cuarto de segundo y no corta lo que hace el cuerpo (festejar, pensar, bailar).
- **En la lección:** mira hacia la pregunta cuando aparece y vuelve al frente; mira las respuestas cuando elegís una; mira hacia arriba
  si pasan 14 segundos (está pensando); al acertar, al frente y festeja; al errar, mira la respuesta correcta que se marca y enseguida
  da ánimo. Se agrandó en la lección (de 76 a 104 puntos) para que la mirada se vea.
- **En el camino:** mira siempre hacia el nivel que sigue; cuando dice algo, se da vuelta hacia vos y después vuelve a mirar el camino.

**Lo que Rive permite y queda para después (INFERENCIA).**
- Una mirada **continua** que siga el dedo (Rive lo permite con un estado que mezcla poses según un número). Queda para cuando el
  ilustrador cierre el dibujo final.
- Huesos y mallas que se deforman (Rive los permite) para girar el cuerpo entero. Pide el dibujo final del ilustrador.

**Para probar en el teléfono.** ¿Lany se ve con volumen (no plana) y la mirada se entiende? ¿El difuminado de las sombras se ve suave?

## 3. El «+»: cómo está armado cada libro

- En «Sobre este libro», cada uno de los 66 libros muestra **«Cómo está armado»**: sus partes, en orden, con los capítulos de cada una
  (por ejemplo, en Génesis, «Cap. 1–11»). En los libros de un solo capítulo, las partes van por versículos («vv. 1–14»).
- **Cada parte se toca y lleva a su capítulo**, en la versión que estás leyendo.
- Los bosquejos son del equipo de Senda: dicen lo que hay en cada parte, sin tomar partido en temas que dividen. El validador revisa que
  cada libro empiece en el capítulo 1, termine en su último capítulo y no tenga huecos (si el corte cae a mitad de un capítulo, ese
  capítulo aparece en las dos partes).

## 4. Personajes: Mujeres de la Biblia y Los patriarcas

Las primeras dos rutas del área Personajes. Siguen la **línea clara** ({{cap:36}}): cada lección dice qué pasó antes, cuenta la
historia en orden, dice cuándo pasó y qué sigue; cada capítulo dice qué se aprende. **No repiten** las preguntas del gran relato: lo
que allá es la historia general, acá es la persona de cerca.

**Mujeres de la Biblia** (11 lecciones, 65 preguntas):

| Capítulo | Lecciones | Qué se aprende |
|---|---|---|
| Antiguo Testamento | Sara · Débora · Rut · Ana · Ester | De la promesa a Abraham al destierro en Persia: mujeres que confiaron en Dios |
| Evangelios | María, la madre de Jesús · Marta y María de Betania · María Magdalena | Creyeron, escucharon y sirvieron a Jesús; la primera en verlo resucitado |
| La iglesia primitiva | Tabita · Lidia · Priscila y Aquila | Sirvieron, abrieron su casa y enseñaron el camino de Dios |

**Los patriarcas** (11 lecciones, 66 preguntas):

| Capítulo | Lecciones | Qué se aprende |
|---|---|---|
| Abraham | Abram y Lot · Agar y el Dios que ve · Abraham ruega por Sodoma · Amigo de Dios hasta el final | Cómo vivió y cómo murió el amigo de Dios |
| Isaac y Jacob | Rebeca y la oración del criado · Isaac, los pozos y la paz · Jacob, el engañador engañado · Jacob en Peniel | Dios cumple su promesa en una familia imperfecta |
| José | Los sueños de José · José, fiel en lo oculto · Judá se ofrece y José perdona | Dios encaminó a bien lo que los hermanos pensaron mal |

**Cómo se cuidó el contenido.**
- Cada pregunta lleva su cita y el validador comprueba que lo que se completa o se cita esté textual en la RV1909.
- **Lo que no está en un versículo va como nota con su fuente:** que la Biblia no dice que María Magdalena haya sido una pecadora
  pública (esa idea viene de un sermón de Gregorio Magno, año 591; Encyclopaedia Britannica); que la púrpura era un tinte caro (Britannica),
  marcado como deducción; que Claudio expulsó a los judíos de Roma también según Suetonio.
- **Lo interpretativo se marca:** ver en Judá, que se ofrece por Benjamín, un anticipo de Jesús es una lectura interpretativa, y así lo
  dice la app.
- **Contenido sensible:** Génesis 19 y Génesis 39 se cuentan con palabras aptas para chicos.

**Cuánto hay ahora en la Travesía:** 15 rutas abiertas, 159 lecciones y 975 preguntas. El inventario bíblico quedó al día: 77 de 96
personajes ya tienen contenido.

## 5. Licencias y rentabilidad: la decisión

El detalle, con las fuentes, está en `conocimiento/2026-10-13-senda-licencias-y-rentabilidad.md`. Lo esencial:

**Lo que se sabe (HECHO, leído el 13-10-2026).**
- Tyndale confirmó que la NTV se usa en una app solo a través de API.Bible.
- En API.Bible, el uso comercial (anuncios, suscripción o compras) se paga con el plan Pro (desde USD 29 por mes) más un cargo mensual
  por versión, que depende de los usuarios por mes. El precio exacto aparece recién al pagar.
- Las versiones con licencia comercial en español son la **NTV**, la **LBLA** y la **NBLA**. **La RVR1960 no está, y la NVI no se puede
  usar en una app comercial.**
- Sin ingresos, el plan Pro da todas esas versiones por USD 29, pero entonces Senda deja de ser un negocio.
- Guardar el texto en el teléfono se permite (protegido y renovado cada 30 días), pero **no baja el costo**: se paga por usuario por mes,
  no por descarga.

**Por qué la licencia no es lo que hace inviable el negocio (INFERENCIA con `economia.yaml`).**
- El costo por usuario **baja** al crecer: USD 500 por mes para 25.000 a 100.000 usuarios es entre USD 0,02 y 0,005 por usuario.
- El modelo de Senda espera entre USD 0,10 y 0,17 netos por usuario por mes. Una versión de USD 100 a 500 por mes pesa entre el 5% y el
  19% del ingreso con 22.000 usuarios, y entre el 1% y el 5% con 60.000.
- El riesgo real es otro: que los ingresos lleguen a esos números (todavía es una ESTIMACIÓN) y que **lo que más quiere la gente (RVR1960
  y NVI) no se pueda comprar hoy a ningún precio** para una app comercial.

**Los caminos.**

| Camino | Qué da | Costo | Veredicto |
|---|---|---|---|
| A · Versiones libres + RVR1960, NVI y NTV en un toque (Bible.com dentro de Senda) | Lo de hoy | 0 | **Para el lanzamiento** |
| B · A + NTV por API.Bible | NTV completa y sin conexión | Pro 29 + NTV según usuarios | **Segundo paso, con regla de corte** |
| C · A + LBLA y NBLA (Lockman) | Dos versiones más | ~500 por mes con 25.000 a 100.000 usuarios | Más adelante, si la piden |
| D · Senda sin ingresos (solo donaciones) | NTV, LBLA y NBLA por 29 | 29 | Solo si Senda pasa a ser un ministerio |
| E · Versiones con licencia solo para quien paga | NTV para Max | Variable | No: «pagar por la Biblia» choca con la promesa de Senda |
| F · Dos apps (Biblia sin ingresos + juegos) | Todo, partido en dos | 29 | No: parte la experiencia |
| G · RV1909 con ortografía actual (edición propia) | Una Reina-Valera libre que se lee como de hoy | 0 | **Hacer** (revisar antes el uso del nombre) |
| H · Licencia de ministerio de la SBA o la ABS para la RVR1960 | RVR1960 completa | A negociar | **Mandar el pedido ya** |
| I · Fundación para entrar a la Digital Bible Library | Lo que acepte cada titular | A negociar | No por ahora |
| J · Copias no oficiales | — | — | **Descartada** |

**El camino A ya está en la app (prueba 13).** En la hoja de versiones, «Abrir este capítulo en otra versión» ofrece siete: RVR1960, NVI,
NTV, LBLA, NBLA, DHH y TLA. Se abren dentro de Senda desde Bible.com, sin copiar el texto (los números de cada versión en Bible.com se
verificaron el 14-10-2026). La app recuerda la última elegida: el final del capítulo dice «Abrir en NTV» y la lección ofrece sus
lecturas en esa versión. Además cuenta cuál se abre más (métrica anónima): es el dato que pide la regla de corte.

**Recomendación (para que decida el fundador).**
1. **No sacar los anuncios ni las suscripciones.** Sin ingresos se ganan versiones, pero se pierden de 10 a 30 veces los ingresos
   posibles. Las reglas de Senda ya cuidan la Biblia: nunca hay anuncios en la Biblia ni en la Travesía, y la Biblia nunca se cobra.
2. **Lanzar con el camino A** (costo 0) y **hacer el G**: una RV1909 con ortografía actual.
3. **Pedir la RVR1960 como ministerio (H):** el pedido a la SBA está listo para mandar; si la ABS no responde, el recordatorio va el 19-10.
4. **Escribirle a API.Bible antes de pagar** (borrador listo en `borradores/2026-10-apibible-consultas.md`): si cuentan todos los
   usuarios o solo los que abren la NTV, el precio por tramo, si se puede guardar sin conexión y si se puede escuchar con la voz del
   teléfono.
5. **Regla de corte para sumar la NTV (B):** cuando se cumplan las tres: licencias como mucho el 10% del ingreso neto de los dos últimos
   meses; al menos 5.000 usuarios por mes; y la NTV es la versión más pedida. Lockman, recién con más de 25.000 usuarios y si la piden.

**Lo que hace falta del fundador:** decidir (o confirmar) la recomendación; mandar el correo a API.Bible y el pedido a la SBA desde
appsenda.ok@gmail.com (regla 8: son mensajes a terceros); y, si quiere, mirar en el checkout de API.Bible el precio de la NTV por tramo
sin pagar.

## 6. Cómo probar la prueba 13

1. **Lany en la lección:** que mire la pregunta, las respuestas, arriba cuando tardás, y que se vea con volumen.
2. **Lany en el camino:** que mire hacia el nivel que sigue y se dé vuelta cuando dice algo.
3. **El «+»:** abrir «Sobre este libro» y tocar una parte de «Cómo está armado».
4. **Personajes:** Travesía → Ver la Travesía completa → Personajes → Mujeres de la Biblia o Los patriarcas.

## 7. Lo que sigue

- **Sprint 2 (desde el 26-10):** las demás rutas de Personajes (Moisés, Jueces y reyes, Vidas de profetas, La vida de Jesús, Los
  apóstoles), cuentas y sincronización.
- **Licencias:** según lo que decida el fundador (§5).
- **Lany:** la mirada que sigue el dedo y el cuerpo que gira, cuando esté el dibujo final.
