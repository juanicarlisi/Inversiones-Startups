# Módulo Biblia: leer, escuchar y entender con el «+»

<div class="enpocas" markdown="1">
**En pocas palabras.** Una Biblia completa, gratis y **sin publicidad**, en varias versiones libres y varios idiomas, que se lee
también sin conexión y se escucha en voz alta. Al tocar el **«+»** de un versículo se abre una hoja con notas de estudio,
comentarios clásicos, referencias cruzadas, palabras clave y mapas, todo con licencia libre. Lo único «de juego» que hay acá es la
**Lámpara**: los rayitos que cuentan los días seguidos con la Palabra.
</div>

## 1. Versiones

| Idioma | Versión | Licencia | Rol en la app | Cuándo |
|---|---|---|---|---|
| Español | **Nueva Biblia Viva (Biblica, edición abierta 2008)** | CC BY-SA 4.0 | **Versión por defecto** para jóvenes (moderna y clara) | MVP |
| Español | **Reina-Valera 1909** | Dominio público | La clásica; la más cercana a la RVR1960 que usan las iglesias | MVP |
| Español | La Biblia en Español Sencillo | CC BY 4.0 | Para nuevos creyentes y chicos | MVP |
| Español | Versión Biblia Libre | CC BY-SA 4.0 | Traducción moderna desde el griego | v1 |
| Español | Biblia Libre para el Mundo | CC0 | Alternativa moderna | v1 |
| Español | **Reina-Valera 1960** | Con derechos (Sociedades Bíblicas Unidas) | La más usada por evangélicos; se licencia vía API.Bible cuando haya ingresos (~USD 10/mes) | v2 (2027) |
| Portugués | Nova Bíblia Viva (edición abierta 2007), Bíblia Livre | CC BY-SA 4.0 / CC BY | Por defecto y clásica | 2028 |
| Inglés | Berean Standard Bible, KJV, WEB | Dominio público | Por defecto (BSB) y clásicas | 2028 |
| Otras | «Abrir en tu Biblia» | — | Botón que abre el pasaje en YouVersion u otra app | MVP |

**Por qué la Nueva Biblia Viva por defecto:** es moderna, clara para un chico de 15 años y su licencia permite usarla gratis
(atribuyendo a Biblica y compartiendo bajo la misma licencia lo que se derive del texto). La RVR1909 queda a un toque para quienes
prefieren la versión clásica. Ojo: la familia «Biblia Viva» traduce por sentido (equivalencia dinámica), más libre que la
Reina-Valera; para estudiar conviene compararla con la RVR1909 o la Versión Biblia Libre, y el Camino y Espadeo verifican sus
respuestas contra las dos. **Decisión pendiente** (capítulo {{cap:27}}).

## 2. El lector: lo que hace

| Función | Detalle | Cuándo |
|---|---|---|
| Navegar | Libro → capítulo → versículo en dos toques; historial; «ir a» escribiendo la cita («jn 3 16») | MVP |
| Cambiar de versión | Selector arriba; recuerda la última | MVP |
| Comparar | Dos versiones en paralelo (en tablet, lado a lado; en teléfono, alternadas por versículo) | MVP |
| Buscar | Palabras y frases, con filtros por testamento y libro | MVP |
| Resaltar | 5 colores con significado opcional (promesas, mandatos, preguntas…) | MVP |
| Notas personales | Privadas por defecto; exportables | MVP |
| Marcadores | Y «seguir leyendo» | MVP |
| Compartir | Texto con la cita, o **imagen** con el versículo sobre un fondo (plantillas de la marca) | MVP |
| Escuchar | Voz del teléfono al lanzamiento; voz neuronal de calidad desde v1; velocidad 0,75× a 2×; resalta el versículo que se lee; sigue con la pantalla apagada | MVP / v1 |
| Aspecto | Claro, sepia y oscuro; tamaño y tipo de letra; interlineado; números de versículo visibles o no | MVP |
| Sin conexión | Cada versión se descarga (~4–5 MB de texto); el audio por libro | MVP |
| **«+» notas y comentarios** | Ver sección 3 | v1 (primera tanda) / v2 (completo) |
| Planes de lectura | Del día, con progreso y recordatorio; con amigos o con tu grupo | MVP (5 planes) / v1 (con amigos) |
| Explicame (Berea) | «¿Qué significa este pasaje?» con respuesta citada | v2 |
| Video del libro | Enlace al video de BibleProject del libro (se abre fuera de la app, con crédito) | v1 |

## 3. El «+»: cómo se muestran los comentarios

**El problema a resolver:** las Biblias de estudio muestran demasiado a la vez; las apps simples no muestran nada. El «+» tiene que
ser invisible para quien solo quiere leer y estar a un toque para quien quiere entender.

**Diseño propuesto:**

1. **La marca.** Junto al número de cada versículo que tiene recursos aparece un **«+» chiquito** del color de acento. Se puede
   apagar en ajustes («mostrar el +»). Si el versículo tiene una nota de estudio destacada, el «+» tiene un punto.
2. **El toque.** Tocar el «+» (o mantener apretado el versículo y elegir «Entender») abre una **hoja desde abajo** que ocupa media
   pantalla, con el versículo arriba. Se arrastra hacia arriba para verla completa. El texto de la Biblia queda visible detrás.
3. **Las pestañas** de la hoja (fichas deslizables):
   - **Notas** — notas de estudio breves (traducción de las Tyndale Open Study Notes): qué pasa, contexto, por qué importa.
   - **Comentarios** — una tarjeta plegable por comentarista (Matthew Henry, Jamieson-Fausset-Brown, Calvino, Gill, Clarke,
     Keil-Delitzsch), con autor, año y licencia. Se eligen cuáles mostrar y en qué orden.
   - **Referencias** — otros versículos relacionados (referencias cruzadas libres de OpenBible.info), ordenados por relevancia; tocar
     uno lo muestra sin perder el lugar.
   - **Palabras** — términos clave con su definición (diccionario abierto de Tyndale) y, en v2, la palabra original en hebreo o griego
     con su número de Strong.
   - **Lugares** — si el versículo nombra un lugar, un mapa con su ubicación (datos abiertos de OpenBible.info).
   - **Mis notas** — tus notas y resaltados de ese versículo.
4. **En tablet** la hoja pasa a ser una **columna al costado**, sincronizada con el texto (como la vista en paralelo de MyBible).
5. **Módulos descargables.** «Descargar más comentarios» abre una lista por idioma con el tamaño de cada paquete; funcionan sin
   conexión. Todo es gratis.
6. **Transparencia.** Cada comentario lleva una etiqueta: *comentario clásico (siglos XVII–XIX)*, *traducción asistida por IA y
   revisada*, y su licencia. Los comentaristas históricos tienen posturas propias; un aviso breve lo aclara la primera vez.

## 4. Comentarios en todos los idiomas: cómo se consiguen

**HECHO:** no existen comentarios clásicos libres en español ni en portugués (las ediciones en español de Matthew Henry y
Jamieson-Fausset-Brown tienen derechos). Los originales en inglés sí son de dominio público, y las notas de Tyndale tienen licencia
CC BY-SA.

**Plan:**

1. **Priorizar pasajes:** Evangelios, Hechos, Romanos, Salmos, Génesis, Proverbios y las cartas cortas cubren la mayor parte de lo
   que se lee.
2. **Traducir con IA por lotes** (más barato y consistente) con un glosario teológico fijo (por ejemplo: *righteousness* →
   «justicia»; *atonement* → «expiación»), respetando el estilo de cada autor.
3. **Verificación automática:** que cada cita bíblica dentro del comentario exista y apunte al versículo correcto en la versión en
   español.
4. **Revisión humana por muestreo** y completa en pasajes sensibles; botón «reportar un error» en cada tarjeta.
5. **Licencias:** las traducciones de las notas de Tyndale se publican bajo CC BY-SA con atribución; las de dominio público pueden
   publicarse igual con CC BY-SA para mantener un solo régimen. Se publica la lista de cambios, como exige la licencia.
6. **Costo:** del orden de USD 30–200 en total para las primeras tandas (capítulo {{cap:25}}); lo caro es la revisión, no la
   traducción.

Resultado: **la primera colección libre de notas y comentarios bíblicos en español** dentro de una app, y después en portugués.

## 5. Audio: que la Biblia te lea

| Etapa | Cómo | Costo | Calidad |
|---|---|---|---|
| MVP | Voz del propio teléfono (gratis, sin conexión, en todos los idiomas) | 0 | Aceptable, varía según el teléfono |
| v1 | **Voz neuronal generada una vez** por versión (Google o Azure) y guardada en nuestro almacenamiento; se escucha en línea o se descarga por libro | USD 17–130 por versión, una sola vez | Muy buena |
| v2 | Voces distintas por género literario (narración, poesía de Salmos) y música de fondo suave opcional (de Remanso, el sello propio) | Bajo | Excelente |
| Futuro | Narradores humanos para la versión por defecto si hay ingresos | Miles de dólares | La mejor |

No se usa el audio de Faith Comes By Hearing porque su licencia prohíbe apps en las que el usuario pague algo.

Funciones: velocidad, temporizador para dormir, seguir desde un versículo, continuar con la pantalla apagada, descargar libros
enteros, resaltar el versículo que suena.

## 6. La Lámpara: la única «gamificación» de la Biblia

- **Qué cuenta:** días seguidos con al menos un **momento con la Palabra**: leer un capítulo (o 3 minutos), escuchar 3 minutos, hacer
  el día de un plan o completar una lección del Camino.
- **Cómo se ve:** una lámpara de aceite cuya luz crece con los días; cada día es un **rayito**. En los hitos (3, 7, 30, 100, 365
  días) hay una celebración corta con un sonido cálido.
- **Día de reposo:** elegís un día por semana en el que no hace falta abrir la app; no corta la racha.
- **Aceite:** protectores que guardan la racha si un día no pudiste (máximo 2 guardados).
- **Recuperala leyendo:** si se apagó, tenés 48 horas para volver a encenderla **leyendo dos capítulos extra**. No se paga.
- **Sin puntos ni monedas por leer:** leer no da Talentos ni puntos de liga individuales. La Biblia no se «farmea».
- **Sin publicidad:** nunca hay anuncios ni ofertas en este módulo.

## 7. Contenido necesario (resumen; detalle en el capítulo {{cap:18}})

| Pieza | MVP | v1–v2 | 2028 |
|---|---|---|---|
| Versiones | 3 en español | 5 + RVR1960 | + 2 en portugués y 3 en inglés |
| Notas de estudio traducidas | — | Evangelios, Hechos, Romanos, Salmos | Toda la Biblia (ES y PT) |
| Comentarios traducidos | — | Matthew Henry en los libros prioritarios | 6 comentarios en los libros más leídos |
| Referencias cruzadas | v1 (neutrales, sirven para todos los idiomas) | ✓ | ✓ |
| Audio neuronal | — | 2 versiones en español | + portugués e inglés |
| Planes | 5 | 30 | 80 |
| Imágenes para compartir | 30 fondos | 150 | 400 |

## 8. Cómo se mide

- Porcentaje de usuarios activos que leen o escuchan cada semana.
- Minutos por semana en la Biblia y capítulos completos.
- Distribución de la Lámpara (cuántos llegan a 7, 30 y 100 días).
- Uso del «+» (qué pestañas, qué comentarios) y reportes de errores.
