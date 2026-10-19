# Las palabras de hoy, los nombres de hoy y los versículos clave (la prueba 24)

**En pocas palabras.** La noche del 19-10-2026 el fundador pidió examinar despacio las diferencias entre la Reina-Valera 1909 (la
Biblia de Senda) y la Reina-Valera 1960, mitigar las peligrosas y responder tres preguntas: si hay un tope que permita citar la 1960
sin licencia, si se puede poner «la mejor traducción entre paréntesis», y si para los versículos clave conviene usar una de las
versiones libres que la app ya tiene. Recordó que no hay que usar siempre la 1909. Esta prueba contesta las tres y mete la
respuesta en la app: un **glosario de la Biblia** de 185 palabras (las que hoy quieren decir otra cosa o ya no se usan), que se
ven subrayadas y se tocan o, si la persona prefiere, con **la palabra de hoy entre corchetes** («caridad [amor]»); **los nombres
propios con la grafía de hoy** (987 lugares: Sansón, Noemí, Finees, Tamar, Uzías, Madián…); y, en la hoja de estudio de cada
**versículo clave**, el mismo versículo en una versión libre de hoy y el aviso cuando la 1960 lee distinto. El texto de la 1909 no
cambia ni una palabra: sigue siendo la versión de dominio público, con ortografía y nombres de hoy.

## 1. Lo que pidió el fundador y dónde quedó

| Pedido (resumen) | Dónde quedó |
|---|---|
| Examinar línea por línea las diferencias con el ejemplar de la 1960 que iba a cargar | El ejemplar no llegó a ningún repositorio visible (§6); mientras tanto, la comparación sigue con el método de la bitácora (25 versículos verificados, vocabulario medido) y queda armado el guion para el día en que esté |
| ¿Hay un tope para citar la 1960 sin licencia? | Sí: 500 versículos, con condiciones (§2) |
| ¿La mejor traducción entre paréntesis? | Sí, entre corchetes y a elección: subrayadas y se tocan, entre corchetes, o nada (§3) |
| ¿Otra versión libre para los versículos clave? | Sí: la Palabra de Dios para ti es la que más se parece a la 1960 en esos lugares; la hoja de estudio la muestra (§4) |
| Avanzar con los pendientes | Glosario, nombres, ejercicios, validador, versículos clave (§5) |

## 2. El tope para citar la RVR1960 sin licencia

- HECHO (sba.org.ar, «Política sobre derechos y permisos de uso de los textos bíblicos», leída el 19-10-2026): se pueden citar
  **hasta 500 versículos** de la RVR1960 en cualquier medio (impreso, visual, electrónico o audio) **sin permiso escrito**, siempre que
  no sean el 50 % o más de un libro completo ni el 25 % o más del texto de la obra donde aparecen, y con la leyenda de derechos
  («Reina-Valera 1960™ © Sociedades Bíblicas en América Latina, 1960. Renovado © Sociedades Bíblicas Unidas, 1988. Utilizado con
  permiso»). Más que eso, permiso escrito con formulario. La misma página define «uso comercial» como el uso en un producto que se
  vende, alquila o permuta.
- INFERENCIA: Senda es gratis con anuncios; no se vende. Igual, antes de lanzar conviene una consulta de dos líneas a la Sociedad
  Bíblica Argentina (o a Sociedades Bíblicas Unidas) para que conste que la cita de hasta 500 versículos con la leyenda vale para
  una app gratuita con anuncios. El correo queda redactado en `docs/legal/consulta_sba.md` de la app; lo manda el fundador (regla 8).
- Qué da el tope: **los versículos de lectura distinta** (hoy tres verificados, se amplía con el ejemplar) y los **falsos amigos más
  fuertes** pueden mostrarse en la 1960 adentro de la app, uno por uno, con la leyenda, hasta 500. `contenido/rvr1960_citas.json` ya
  tiene el cupo y la leyenda; el texto se carga a mano desde un ejemplar propio (nunca copiando sitios que lo prohíben).
- Ley 11.723, art. 10: el derecho de cita con fines didácticos (hasta mil palabras) existe aparte, pero el tope de la Sociedad
  Bíblica es más claro y más generoso: se usa ese.

## 3. La palabra de hoy, a la vista

El fundador propuso «la mejor traducción entre paréntesis». Se hizo así, con tres cuidados:

1. **Corchetes, no paréntesis.** Los corchetes son el signo editorial para lo que no es del texto; los paréntesis ya existen en la
   Biblia. «Y ahora permanecen la fe, la esperanza, y la caridad [amor]».
2. **A elección, en Ajustes → Lectura de la Biblia → «Palabras de hoy»:** subrayadas y se tocan (lo que viene de fábrica: no agrega
   ni una letra al texto), entre corchetes, o sin ayuda.
3. **Solo las palabras seguras van entre corchetes.** Las que en la 1909 tienen más de un sentido («salud», «luego», «virtud»,
   «sepulcro») se subrayan y se explican al tocarlas, pero no se ponen entre corchetes: un corchete afirma un sentido.

La palabra de hoy es la de uso común, en palabras de Senda; no es la palabra de ninguna versión con derechos. Donde coincide con la
1960 («amor», «salvación»), coincide porque es la palabra que todo el mundo usa. Significados léxicos, nunca doctrina: para
«infierno», «sepulcro» y «Gehena» la ficha dice qué palabra hebrea o griega hay detrás y nada más.

## 4. Otra versión para los versículos clave

ESTIMACIÓN (19-10-2026, método: coincidencia de palabras con la 1960 en los 19 versículos verificados de la bitácora): la **Palabra
de Dios para Todos (PDT)** es la versión libre de la app que más se parece a la 1960 en esos lugares (0,59 sobre 1; la 1909, 0,69;
la Biblia en Español Sencillo, 0,51; la Nueva Biblia Viva, 0,43). La PDT dice «el amor», «Seol», «tumores», «manera de vivir».
Tiene un rasgo propio que hay que saber: escribe los nombres divinos transliterados («YAVÉ», «ʼElohim») donde la 1909 y la 1960
escriben «Jehová» y «Dios». Es del Centro Mundial de Traducción de la Biblia, con licencia CC BY-SA 4.0.

Lo que se hizo con eso: una tabla de **versículos clave** (`src/datos/versiculosClave.ts`, 13 al cierre): los tres de lectura
distinta y los diez falsos amigos verificados. En la **hoja de estudio** de esos versículos (el «+»), la sección «Palabras de hoy»
muestra el aviso («la RVR1960 lee distinto aquí» o «una palabra que cambió»), el mismo versículo en la PDT (o en la BES cuando se
parece más) y, en las lecturas distintas, el enlace al capítulo en la RVR1960 en Bible.com. Nunca se copia el texto de la 1960.
Además, la persona siempre puede leer toda la Biblia en la PDT, la NBV o la BES desde el selector de versiones: la 1909 es la
Biblia de la Travesía y la trivia, no una obligación.

## 5. Lo que entró en la app (prueba 24)

- **Glosario de la Biblia** (`scripts/autor/glosario_biblia.py` → `contenido/glosario_biblia.json`): 185 palabras, 6.171 versículos
  tocados; 55 falsos amigos, 116 palabras viejas, 11 medidas y términos, 3 palabras con carga de sentido. Cada una con sus formas,
  la palabra de hoy, una línea de explicación, el original cuando ayuda, y dos marcas: «segura» (va entre corchetes) y «la 1960 la
  conserva» (un hueco con ella sí se encuentra leyendo la 1960). Entradas nuevas que salieron de la medición: «Palestina» (en la
  1909 es Filistea), «coger» (tomar), «denunciar» (anunciar), «concurso» (multitud), «tigres» (leopardos).
- **Dónde se ve:** en la Biblia (hojas y deslizar), subrayado punteado en el color de los números; tocar abre una ficha al pie que no
  tapa el texto; en los pasajes de las lecciones, la trivia y los juegos, la ficha se abre debajo del versículo; en la hoja de estudio,
  todas las palabras del versículo. Con «corchetes», la palabra de hoy entra al texto antes de medir los renglones, así la hoja de
  papel sigue justificada.
- **Nombres propios con la grafía de hoy:** 187 nombres más en la lista fija de `scripts/ortografia.py`, 987 lugares de la Biblia
  (Sansón, Noemí, Finees, Tamar, Urías, Adonías, Uzías, Madián, Sedequías, Sinar, Susa, Enoc, Otoniel, Isaí, Genesaret, Berenice…),
  verificados con las Biblias modernas de la app en los mismos versículos o fijados a mano; los dudosos quedaron como estaban
  (lista en la bitácora). De paso apareció y se corrigió un error viejo: «Líbano» estaba en minúscula en sus 71 lugares.
- **Ejercicios:** once opciones reescritas con la palabra de hoy entre paréntesis o sin la palabra vieja («Segar con los criados (la
  RV1909 dice «mozos»)», «tigres (leopardos)», «carrizal (un cañaveral)», «capitán de la nave (el «maestre»)»); tres «completar» que
  empezaban con «empero» ahora empiezan después; dos huecos cambiados («simiente» → «tierra», «inquirir» → «preparado»).
- **Validador:** la lista de palabras que no pueden ser un hueco pasa de 7 a todas las formas del glosario que la 1960 no conserva;
  los versículos de lectura distinta no admiten «completar»; el validador sigue en «Todo en orden».
- **Versículos clave:** 13 (§4). Versión 0.24.0.

{{PANTALLAS24}}

## 6. El ejemplar de la RVR1960 del fundador

El fundador avisó que cargaba una copia autorizada para examinar (no para la app). Se buscó el 19-10-2026 en la carpeta de subidas
de la sesión, en el holding, en `biblioteca-estudios-biblicos` (último commit del 11-10), en `LIBROS-REFERENCIA3` (último commit del
16-10) y en `LIBROS-REFERENCIA2` (vacío): no estaba. Cuando esté, el guion de comparación (`scratchpad/vers/`) alinea verso a verso
con la 1909 de Senda, separa ortografía, forma, léxico y lectura distinta, y lista los versículos para revisar a mano; el texto
de la 1960 no entra a ningún repositorio ni a la app. Lo más útil del ejemplar: completar la lista de lecturas distintas (hoy tres)
y la de versículos clave, y medir de verdad cuánto de cada capítulo cambia.

## 7. Pendientes y decisiones

1. **Fundador:** probar el APK 24 (Ajustes → Palabras de hoy; una lección → Lámpara; la Biblia en 1 Corintios 13 y su «+»); decir
   si prefiere subrayado o corchetes de fábrica; confirmar dónde quedó el ejemplar de la 1960; mandar la consulta a la Sociedad
   Bíblica (`docs/legal/consulta_sba.md`) cuando quiera.
2. **Claude (prueba 25):** la comparación con el ejemplar; cargar en `rvr1960_citas.json` los versículos de lectura distinta (con la
   leyenda, dentro del cupo) desde el ejemplar del fundador si él lo aprueba; la fila de versión afinada (capítulo 48 §6.3) si la
   aprueba; la pregunta de la bienvenida (capítulo 49 §3, G).
