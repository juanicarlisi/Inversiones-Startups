# Capítulo 87: Prueba 60, citas sin palabras que nadie usa (21-11-2026)

## 1. Lo que pidió el fundador (21-11)

Encontró en una explicación de la Travesía la cita de Isaías 51:2 en la RV1909: «…porque solo lo llamé, y bendíjelo, y multipliquelo».
Lo que escribió:

> «ESTE TÉRMINO BENDÍJELO NO SE USA EN NINGUNA PARTE DEL MUNDO […] analizá texto por texto, trivia por trivia, TODO […] usá el mejor
> que hay a disposición de las versiones que tenemos […] que el versículo sea parecido a rvr1960 o bien, actual, y no cambie el
> significado. Y no use estas palabras y terminologías que no entiende ni usa nadie. Dedicá esta sesión a dedicarte a eso solo y nada
> más. Y no termines hasta resolver texto por texto.»

En el mismo mensaje trajo cuatro temas más. Quedan para la próxima sesión, por su propio pedido («solo eso y nada más»):

- el progreso de la Travesía que no se guarda al salir un momento de la app;
- el desmayo de Lany («pésimo»);
- la música estilo funk con sintetizadores;
- los anuncios en ministerionuevageneracion.com.

## 2. Por qué pasaba

La prueba 59 eligió la versión más clara solo para los pasajes que **se abren**: la hoja del versículo y el versículo del día.

Las citas escritas **dentro** del contenido quedaron en la RV1909 tal como se escribieron. Eso incluye lo que va entre «» en:

- las explicaciones, el relato y el resumen;
- el «¿Sabías que…?»;
- la trivia;
- la línea de tiempo;
- los juegos.

También quedaron así los textos de los ejercicios («completar», «¿Quién lo dijo?»).

## 3. Lo hecho (senda-app e791633 y 523bb4e, en `main`)

- **Inventario medible** (`scripts/autor/citas_claras.py`) de todo el contenido:
  - cada cita bíblica entre «»;
  - cada texto de ejercicio;
  - en la segunda pasada, cada enunciado, opción y distractor que va sin comillas.

  Marca las palabras que hoy no se usan con `palabras_raras.py`, que combina:
  - la frecuencia de uso del español (wordfreq);
  - el lema de cada palabra (simplemma), para no marcar conjugaciones de hoy;
  - una regla para el futuro de subjuntivo («creyere», «viniere»);
  - una regla para los pronombres pegados («díjole», «bendíjelo»);
  - los nombres propios de las Biblias.

  Para cada cita ubica sus versículos y trae el texto en la RV1909, la PDT, la NBV y la BES.
- **Revisores en paralelo**, lote por lote, con reglas fijas:
  - entre «» solo la Biblia, textual, de una sola versión, con su nombre si no es la RV1909;
  - la versión que diga lo mismo sin palabras raras y conserve las palabras clave de la fe;
  - la PDT primero, salvo «YAVÉ»;
  - no cambia el significado ni lo que la cita demuestra.

  Un verificador controló que cada cita fuera textual en la versión nombrada.
- **Números**:

  | Qué | Cantidad |
  |---|---|
  | Textos cambiados | 1.851 (primera pasada: 1.683 citas y textos; segunda: 166 enunciados, opciones y distractores) |
  | Citas a la PDT | 836 |
  | Citas a la NBV | 465 |
  | Citas a la BES | 253 |
  | Leídos y dejados con su porqué | 443 («tráele», «bautícese», nombres propios, términos que la lección enseña) |
  | Ejercicios rehechos | 40 |

  Los campos revisados por archivo (cambiados o dejados):
  - Travesía: 1.999;
  - trivia: 219;
  - línea de tiempo: 43;
  - Vivir la historia: 41;
  - ¿Quién es?: 25;
  - Trivia de la iglesia: 6;
  - guía de libros: 1.

  Los 443 que quedan están en `scripts/autor/citas60/excepciones.json`.
- **Ejemplo**: Isaías 51:2 ahora dice «Miren a Abraham, su antepasado, y a Sara, quien los dio a luz. Porque cuando estaba solo lo
  llamé, lo bendije y lo multipliqué» (PDT).
- **Ejercicios rehechos**: 40 ejercicios cuya palabra vieja no salía recortando.
  - Ejemplos: «confesares», «invocare», «menester», «se enseñorea».
  - Pasaron a la versión libre que dice lo mismo con palabras de hoy.
  - Cada uno tiene **versión fija** por ejercicio (`citas60/version_fija.json`, clave `lección#n`). Así la tabla por versículo no
    cambia para los demás ejercicios del mismo versículo.
  - Ejemplo: Romanos 10:9, «Que si confiesas con la ___ al Señor Jesús…» (PDT).
- **Guardia permanente**: `citas_claras.py control` corre dentro del validador (en el APK, el AAB y el iPhone, con wordfreq 3.1.1 y
  simplemma 2.0.0).
  - Ninguna cita, ejercicio, enunciado ni opción nueva puede llevar una palabra que nadie usa sin pasar por la lista de excepciones con
    su porqué.
  - Hoy da 0.
- **Herramientas**:
  - `citas60_aplicar.py` aplica las decisiones en tres lugares: el contenido, el script de autor (para que no vuelva al regenerar) y las
    traducciones, que citan su propia Biblia y quedan como estaban.
  - `parche.py` encuentra ahora textos escritos con comillas simples o armados en el script.
- **Controles al cerrar**:
  - validador «Todo en orden»;
  - guardia de citas con los cambios sellados;
  - pruebas 88 de 88;
  - APK 60 compilado en GitHub.

## 4. Lo que queda (para una próxima pasada)

- Algunas respuestas de ejercicios conservan una forma vieja porque son la palabra del hueco, y cambiarla rompe el ejercicio:
  - Romanos 10:13 «invocare»;
  - 1 Reyes 18:21 «seguidle»;
  - Juan 2:5 «dijere»;
  - «vivifica»;
  - «hacedlo»;
  - Zacarías 8:23 «Enseñadnos»;
  - Salmo 18:30 «Acendrada»;
  - 1 Corintios 15:22 «vivificados»;
  - Esdras 7:10 «inquirir».

  Se rehacen como los 40 de arriba.
- El **lector** de la Biblia sigue mostrando la RV1909 con sus formas viejas: es la Biblia, y el fundador puede cambiarla a la PDT, la
  NBV o la BES con un toque. No se toca sin su decisión.
- La versión 1.0.6 de Play lleva estos cambios. Antes de subirla a la prueba cerrada, confirmar en la ayuda de Google que una
  actualización no reinicia los 14 días.
