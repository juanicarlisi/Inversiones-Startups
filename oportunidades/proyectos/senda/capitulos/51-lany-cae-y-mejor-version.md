# Lany cae de verdad y la versión que mejor se lee en cada versículo (la prueba 25)

<div class="enpocas" markdown="1">
**En pocas palabras.** La noche del 19-10-2026 el fundador vio dos cosas en el APK: que Lany, al desmayarse, «está muy dura:
tiene que ser más fluido» (y pidió ir a fondo: Rive, 3D, lo que haga falta), y que en Gálatas 5:22 la Nueva Biblia Viva dice «amor»
donde la RV1909 dice «caridad», así que vale la pena validar, versículo por versículo, cuál de las versiones libres de la app se lee
mejor y usarla en cada trivia, travesía, versículo del día o juego. Esta prueba hace las dos: el desmayo y el patatús de Lany se
rehicieron con oficio de animación (anticipación, tambaleo, caída con gravedad, impacto con aplastar y rebote, y un estado nuevo en
el que respira tirada en el piso hasta que la app la levanta), y cada pasaje que se abre fuera del lector (lecciones, trivia, juegos,
versículo del día) se muestra en la versión libre que tiene **menos palabras difíciles** en ese versículo (1.223 versículos: 876 en
la PDT, 342 en la NBV, 5 en la BES), con chips para volver a la RV1909 y el motivo a la vista. La RV1909 sigue siendo la Biblia de
los ejercicios y la trivia; nada de lo que la persona practica cambia.
</div>

## 1. Lo que pidió el fundador y dónde quedó

| Pedido (resumen) | Dónde quedó |
|---|---|
| «Cuando Lany se desmaya está muy dura. Tiene que ser más fluido. Andá a fondo con las animaciones, Rive, 3D, lo que haga falta» | Desmayo y patatús rehechos en Rive, con un estado «desmayada» en bucle; verificado cuadro a cuadro y en la máquina de estados (§2–§4). Por qué sigue siendo 2D y no 3D: §5 |
| «Para cada versículo validar las versiones libres que tenemos y a partir de eso ver cuál usar para cada trivia, travesía, versículo del día, juego o lo que aparezca» | Tabla de 1.223 versículos con la versión que mejor se lee, regla medible, chips en cada pasaje, versículo del día en Inicio y en el widget (§7) |
| «Recordá avanzar con los próximos y pendientes» | Lo que sigue y lo que espera decisión, en §8 |

## 2. Por qué el desmayo se veía duro

El desmayo de la prueba 20 estaba escrito con pocas claves y todo el cuerpo giraba **en bloque** desde la raíz: la cabeza, las orejas,
los brazos y las patas llegaban al piso en el mismo instante y con la misma curva, sin anticipación, sin que nada se adelantara ni
llegara tarde, y al tocar el suelo la animación terminaba y Rive sostenía el último cuadro: Lany quedaba congelada como una figura
de cartón. Es exactamente lo que el ojo lee como «dura»: en la vida real ninguna parte de un cuerpo se mueve a la vez con las demás.

HECHO (Frank Thomas y Ollie Johnston, *The Illusion of Life*, 1981; los doce principios de animación de Disney): lo que hace creíble un
movimiento no es el dibujo sino el **tiempo**: anticipación antes de la acción, aplastar y estirar en los impactos, arrastre y
superposición (las partes blandas llegan tarde), aceleración y frenado (nada arranca ni para de golpe), arcos, acción secundaria y
exageración con medida. La prueba 25 aplica los ocho que importan en una caída.

## 3. Lo que se hizo (Rive, `scripts/rive/lani.py`)

**El desmayo (2,0 s), por fases.** Nada se mueve en bloque: cada parte tiene su propio retraso.

| Tiempo | Qué pasa | Principio |
|---|---|---|
| 0–0,3 s | Se yergue un poco, abre los ojos, el cuerpo se estira | Anticipación |
| 0,3–0,7 s | Tambalea de un lado al otro (tres vaivenes que se achican); la cabeza se bambolea más que el cuerpo, el jopo y las orejas van 40 milésimas detrás; los brazos flotan; las rodillas ceden (el cuerpo se aplasta) y la raíz se corre de lado | Arrastre y superposición, acción secundaria, arcos |
| 0,7–1,0 s | Cae con una curva de gravedad (acelera, no baja parejo); los brazos y las orejas vuelan por inercia y van más allá; el torso se dobla tarde | Aceleración, exageración |
| 1,0–1,1 s | Impacto: el cuerpo se aplasta fuerte, la cabeza da el latigazo, el jopo rebota | Aplastar y estirar |
| 1,1–1,5 s | Rebote y asentamiento amortiguado: cada parte se acomoda en su tiempo | Frenado |
| 1,5–2,0 s | Quieta; a los 1,72 s, un tic de la pata | Acción secundaria |

**«Desmayada» (estado nuevo, 2,0 s en bucle).** Antes, al terminar de caer Lany se congelaba. Ahora la máquina de estados pasa sola
de «desmayo» a «desmayada»: tirada en el piso **respira** (el pecho sube y baja), la cabeza se mueve apenas, una oreja y una pata dan
un tic y la cola se sacude, hasta que la app la levanta (vuelve a reposo con 320 milésimas de mezcla). El estado guarda todo lo que
el desmayo dejó (la raíz acostada, los brazos abiertos) para que el cambio no se note.

**El patatús (2,8 s).** La misma caída fluida y, al levantarse, lo que faltaba: se remueve, toma impulso hundiéndose un poco, salta
con estirar en el aire y aplastar al aterrizar, y sacude la cabeza como quien vuelve en sí. Dramática y graciosa, nunca burlona
(regla de la prueba 20).

Números: el archivo `assets/lani/lani.riv` pasa de 109 a 110 animaciones (272 KB); la pose fija «desmayo» se regeneró con la
caída nueva; las demás poses no cambian.

## 4. Cómo se verificó (sin la app y en la app)

- **Cuadro a cuadro** (`scripts/rive/cuadros.cjs`, nuevo): dibuja cualquier animación del mismo `lani.riv` con el motor web de Rive y
  saca N cuadros repartidos en la duración; sirve para revisar sin compilar la app. Las tiras de abajo salen de ahí: la caída vieja
  (en bloque, cuatro cuadros iguales en el piso) contra la nueva.
- **La máquina de estados** (prueba en Chromium sin ventana, con el mismo archivo y la misma propiedad `estado` que usa la app):
  reposo → «desmayo» a los 0,7 s de pedirlo → «desmayada» a los 2,7 s (sola, por tiempo) → reposo cuando la app pone `estado = 0`.
  Es la cadena exacta que corre en Android, iOS y la web.
- **En la app**, el desmayo aparece al quedarse sin vidas en una lección (`Leccion.tsx`, fase «sin vidas») y el patatús es una de las
  cuatro reacciones al error.

{{PANTALLAS25}}

## 5. ¿Rive, 3D o qué hacía falta?

El fundador abrió la puerta a «Rive, 3D, lo que haga falta». Lo que hacía falta no era otra tecnología sino **oficio de animación**:
el archivo de Rive ya tenía huesos, curvas y máquina de estados; lo que no tenía era tiempo bien repartido entre las partes. La
decisión de la prueba 19 sigue en pie (capítulo 44 §2): Lany es 2D con volumen de dos tonos en toda la app, y el 3D permanente no
conviene mientras cueste expresiones (en 3D cada gesto de la cara es un modelo más; en Rive es una curva). INFERENCIA: con la caída
nueva, lo que falta por ganar en fluidez está en el mismo lugar (más claves, más retrasos entre partes), no en cambiar de motor.

Lo que Rive permitiría además y hoy no usamos: deformación de malla (que la lana ondule como tela) y cinemática inversa (que la
mano «busque» el piso). Nuestro escritor de `.riv` (`escritor.py`) no genera mallas; agregarlas es trabajo de editor de Rive con una
persona que anime, o extender el escritor. ESTIMACIÓN: dos o tres días de trabajo propio para mallas simples; queda para después del
lanzamiento, si el fundador ve que la lana rígida se nota.

## 6. Las otras reacciones, con el mismo oficio

Mano a la cara, mareo y taparse los ojos no son caídas, pero tenían la misma deuda: poco retraso entre partes y ninguna
anticipación. En la misma prueba se les pasó el mismo peine, sin cambiar sus duraciones (la app las temporiza igual):

- **Mano a la cara (1,6 s):** la cabeza sube apenas y las cejas se levantan antes de que la mano suba (anticipación); la mano llega
  a la frente con retroceso y rebote; la cabeza cae tarde y niega apenas («no puede ser»); el torso, el jopo y la cola llegan después;
  se repone con un pequeño pasarse.
- **Mareo (1,8 s):** un sacudón hacia atrás y recién después las vueltas; los ojos la siguen al revés; el jopo y la cola llegan tarde;
  el cuerpo se bambolea y respira con el vaivén.
- **Taparse los ojos (1,7 s):** la cabeza y las cejas se van para atrás antes de que suban las manos; el cuerpo se encoge; al espiar,
  la cabeza se ladea, las pupilas miran de reojo y la cola se sacude; las baja con un pequeño pasarse.

El giro de festejo queda como estaba (ya tenía aplastar, estirar y rebote). Las tiras de las tres están abajo del §4.

## 7. La versión que mejor se lee en cada versículo

**El ejemplo del fundador, medido.** Gálatas 5:22 en las cuatro versiones libres de la app (HECHO, texto de la app, 19-10-2026):

| Versión | Texto | Palabras difíciles |
|---|---|---|
| RV1909 | «Mas el fruto del Espíritu es: **caridad**, gozo, paz, tolerancia, benignidad, bondad, fe» | caridad (falso amigo), benignidad |
| PDT | «Pero el fruto del espíritu es amor, gozo, paz, **longanimidad**, **benignidad**, bondad, fidelidad» | longanimidad, benignidad |
| NBV | «En cambio, este es el fruto que el Espíritu produce en nosotros: amor, gozo, paz, paciencia, **benignidad**, bondad, fidelidad» | benignidad |
| BES | «Pero el fruto del Espíritu es amor, gozo, paz, paciencia, actos amables, bondad, fe» | ninguna |

La prueba 24 elegía siempre la PDT (la más parecida a la RVR1960 en los versículos verificados) y acá habría mostrado «longanimidad».
Tenía razón el fundador: en este versículo la NBV se lee mejor. Pero «se lee mejor» no puede ser gusto, versículo por versículo
hay 31.102; tiene que ser una regla que se mida.

**La regla (`scripts/autor/versiones_por_versiculo.py`):**

1. Si el versículo de la RV1909 no tiene ningún **falso amigo** (una palabra que hoy se entiende mal: «caridad», «salud»,
   «conversación», «concierto», «parió»…), se queda en la RV1909: es la Biblia de la Travesía y la trivia, y con el glosario las
   palabras viejas se explican. Son 29.879 versículos.
2. Si lo tiene, compiten la PDT y la NBV, y gana la que tiene **menos palabras difíciles en ese versículo**; a igual cantidad, la PDT
   (la más parecida a la 1960). La PDT queda afuera en los versículos donde escribe «YAVÉ» o «ʼElohim». La BES (traducida del
   inglés básico; en Gálatas 5:22 dice «actos amables») solo cuando a las dos les falta el versículo.
3. «Palabra difícil» = una forma del glosario de la Biblia (falsos amigos y palabras viejas, 187 entradas) que las versiones
   modernas casi no usan. Las que las versiones modernas usan seguido («luego», «ha», «virtud», «gentes»: 23 formas con 15
   apariciones o más entre la PDT, la NBV y la BES) no cuentan, porque hoy se leen bien. La lista sale de los datos, no del gusto:
   569 formas difíciles.

**Resultado (HECHO, generado el 19-10-2026):** 1.223 versículos se abren en otra versión: 876 en la PDT, 342 en la NBV, 5 en la BES;
22 cambian de versión respecto de la prueba 24 por tener menos palabras difíciles (Gálatas 5:22 entre ellos). Para que la regla
viera «longanimidad» y «benignidad», las dos entraron al glosario (la 1960 las conserva, así que un hueco con ellas sigue valiendo).

**Dónde se aplica.** En todo pasaje que se abre fuera del lector: la Lámpara y «Leer» de las lecciones, «Leer el pasaje» de la trivia
y de los juegos que abren uno, y el versículo del día (Inicio y el widget de Android). Si el pasaje tiene varios versículos, decide el
primero que trae un falso amigo. Arriba del texto, los **chips** de las cuatro versiones (la elegida marcada), el ⓘ que abre «Las
versiones, en una pantalla», «RVR1960 ↗», y el motivo en una línea: «Se abre en la NBV porque la RV1909 dice “caridad”; tocá RV1909
para verla igual». Abajo, la atribución de la versión que se ve (la NBV y la PDT exigen crédito: capítulo 48).

**Dónde no.** El lector sigue en la versión que la persona eligió (si lee la RV1909, el glosario la acompaña). Los ejercicios
(«completar», huecos) y las respuestas de la trivia siguen sobre la RV1909: el validador garantiza que la respuesta se lee igual en la
RV1909 y la RVR1960, y nunca pide una palabra que la 1960 no conserve (capítulo 50 §5).

**Una observación de paso (HECHO, texto de la PDT):** la PDT escribe «espíritu» en minúscula en Gálatas 5:22. No es un error de
Senda; es la PDT. Es otra razón para que ahí gane la NBV.

## 8. Pendientes y decisiones

1. **Fundador:** probar el APK 25 (una lección hasta quedarse sin vidas: el desmayo, y respirando en el piso; errar una pregunta hasta
   que toque el patatús; Travesía → «El fruto del Espíritu» → Lámpara: el pasaje en la NBV con los chips; Jugar → una pregunta de
   1 Corintios 13 → «Leer»: la PDT). Decir si la caída y las reacciones convencen. Siguen esperando:
   la consulta a la Sociedad Bíblica, dónde quedó el ejemplar de la 1960, subrayado o corchetes de fábrica, el color de Lany, la fila
   de versión afinada (capítulo 50 §7).
2. **Claude (prueba 26):** la comparación con el ejemplar de la 1960 cuando esté; la pregunta de versión en la bienvenida (capítulo 49 §3, G); más mapas y libros jugables
   (capítulo 47).
