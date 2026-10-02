# Módulo Biblia: leer, escuchar y entender con el «+»

<div class="enpocas" markdown="1">
**En pocas palabras.** Una Biblia completa, gratis y **sin publicidad**, con la **Reina-Valera por defecto** y como alternativas las
versiones que más usan las iglesias (**NTV, NVI, DHH y TLA**), que se lee sin conexión y se escucha en voz alta. Al tocar el **«+»**
de un versículo se abre una hoja con notas de estudio, comentarios clásicos, referencias y mapas, todo con licencia libre. No hay
botones que manden a otras apps: todo pasa dentro de Senda. Acá vive también **Berea** (planes y desafíos, capítulo {{cap:15}}).
</div>

## 1. Versiones

| Versión | Titular | Licencia | Rol en la app | Cuándo |
|---|---|---|---|---|
| **Reina-Valera 1960** | Sociedades Bíblicas Unidas (SBU) | Con derechos; licencia | **Versión por defecto** en cuanto esté la licencia | MVP si llega la licencia; si no, v1 |
| **Reina-Valera 1909** | — | Dominio público | **Por defecto desde el día 1** hasta tener la RVR1960; después, alternativa clásica | MVP |
| **NTV** (Nueva Traducción Viviente) | Tyndale House Foundation | Con derechos; licencia | Alternativa moderna y clara | v1 (feb–mar 2027) |
| **NVI** (Nueva Versión Internacional) | Biblica | Con derechos; licencia | Alternativa moderna | v1 |
| **DHH** (Dios Habla Hoy) | SBU | Con derechos; licencia | Alternativa en lenguaje popular | v1 |
| **TLA** (Traducción en Lenguaje Actual) | SBU | Con derechos; licencia | Alternativa para nuevos creyentes y chicos | v1 |
| Nueva Biblia Viva (edición abierta) | Biblica | CC BY-SA 4.0 | Alternativa libre (no depende de licencias) | MVP |
| La Biblia en Español Sencillo | — | CC BY 4.0 | Alternativa libre | MVP |
| Portugués e inglés | Varios | Libres y con licencia | — | 2028 |

**Por qué la Reina-Valera por defecto:** es la que usa la mayoría de las iglesias evangélicas de habla hispana, la que se lee en voz
alta el domingo y la que los jóvenes tienen en papel. Abrir Senda y encontrar «su» Biblia genera confianza. La RV1909 (dominio
público) es casi idéntica en contenido y permite lanzar sin depender de nadie; la RVR1960 entra apenas se firme la licencia, y quien
ya leía en 1909 elige si cambia.

**Cómo verifican los juegos:** las preguntas y lecciones se comprueban contra dos versiones (la Reina-Valera y una moderna) para que
ninguna respuesta dependa de una traducción.

## 2. Cómo se consiguen las licencias, paso a paso

Hay tres caminos. Se intentan en este orden porque van del más barato al más trabajoso.

| | Camino | Qué es | Costo | Qué hay que verificar |
|---|---|---|---|---|
| 1 | **YouVersion Platform** | Desde diciembre de 2025, YouVersion abre gratis su tecnología y sus acuerdos con editoriales a otras apps: API, kit para React Native y 1.487 Biblias de 36 editoriales | **Gratis** | Si una app con planes pagos y anuncios en los juegos (aunque la Biblia no los tenga) puede usarla, y qué permite cada editorial (lectura sin conexión, mostrar el texto en preguntas) |
| 2 | **API.Bible** (American Bible Society) | Biblias con derechos a través de una API, con licencias por traducción | Plan Pro desde **USD 29/mes** + cada versión **desde USD 10/mes** (1.000 usuarios) hasta **USD 250/mes** (100.000 usuarios) | Que estén disponibles en uso comercial las 5 versiones; reglas: aviso de derechos siempre visible, no modificar el texto, refrescar lo guardado cada 30 días como máximo |
| 3 | **Licencia directa** | Pedirla a cada titular: SBU (RVR1960, DHH, TLA), Biblica (NVI) y Tyndale (NTV: permisos@tyndale.com) | A negociar | Plazos de 2 a 8 semanas; casi siempre piden datos de la empresa y del uso |

**El paso a paso:**

1. **Octubre de 2026:** Claude prepara la consulta a YouVersion Platform (qué es Senda, cómo se financia, que la Biblia nunca tiene
   publicidad) y la cuenta en API.Bible. Vos la revisás y la enviás.
2. **Si YouVersion responde que sí:** se integran las cinco versiones con su kit, sin costo.
3. **Si no, o mientras tanto:** se activa API.Bible Pro con la RVR1960 primero (USD 39 por mes al inicio) y en v1 se suman NTV, NVI,
   DHH y TLA.
4. **Si alguna versión no está en API.Bible:** se escribe al titular con el modelo de carta que prepara Claude.
5. **Siempre:** se guarda cada licencia en el repositorio, se muestra el aviso de derechos en cada pantalla donde aparece el texto y se
   respeta cada regla de uso (capítulo {{cap:25}}).

**ESTIMACIÓN de costo con API.Bible** (5 versiones con derechos): ~USD 230 por mes con 8.000 personas activas, ~USD 880 con 60.000.
Está incluido en la proyección del capítulo {{cap:23}}; con YouVersion Platform ese costo podría ser cero. Para no pagar de más, las
versiones se licencian por demanda: si casi nadie usa una, se evalúa dejarla.

## 3. El lector: lo que hace

| Función | Detalle | Cuándo |
|---|---|---|
| Navegar | Libro → capítulo → versículo en dos toques; historial; «ir a» escribiendo la cita («jn 3 16») | MVP |
| Cambiar de versión | Selector arriba; recuerda la última | MVP |
| Comparar | Dos versiones en paralelo (tablet, lado a lado; teléfono, alternadas por versículo) | MVP |
| Buscar | Palabras y frases, con filtros por testamento y libro | MVP |
| Resaltar | 5 colores con significado opcional (promesas, mandatos, preguntas…) | MVP |
| Notas personales | Privadas por defecto; exportables | MVP |
| Marcadores | Y «seguir leyendo» | MVP |
| Compartir | Texto con la cita, o **imagen** con el versículo sobre un fondo de la marca, lista para historias de Instagram y estados de WhatsApp | MVP |
| Escuchar | Voz del teléfono al lanzamiento; voz neuronal de calidad desde v1; velocidad 0,75× a 2×; resalta el versículo que suena; sigue con la pantalla apagada | MVP / v1 |
| Aspecto | Claro, sepia y oscuro; tamaño y tipo de letra; interlineado; números de versículo visibles o no | MVP |
| Sin conexión | Las versiones libres se descargan completas; las con licencia, según lo que permita cada una | MVP |
| **«+» notas y comentarios** | Ver sección 4 | v1 (primera tanda) / v2 (completo) |
| Planes y desafíos | En Berea (capítulo {{cap:15}}) | MVP |

## 4. El «+»: cómo se muestran los comentarios

**El problema a resolver:** las Biblias de estudio muestran demasiado a la vez; las apps simples no muestran nada. El «+» tiene que
ser invisible para quien solo quiere leer y estar a un toque para quien quiere entender.

1. **La marca.** Junto al número de cada versículo con recursos aparece un **«+» chiquito** del color de acento. Se puede apagar.
2. **El toque.** Tocar el «+» (o mantener apretado el versículo y elegir «Entender») abre una **hoja desde abajo** a media pantalla,
   con el versículo arriba; se arrastra para verla completa. El texto queda visible detrás.
3. **Las pestañas** de la hoja:
   - **Notas** — notas de estudio breves (traducción de las Tyndale Open Study Notes).
   - **Comentarios** — una tarjeta plegable por comentarista (Matthew Henry, Jamieson-Fausset-Brown, Calvino, Gill, Clarke,
     Keil-Delitzsch), con autor, año y licencia; se eligen cuáles mostrar.
   - **Referencias** — versículos relacionados (OpenBible.info), ordenados por relevancia; tocar uno lo muestra sin perder el lugar.
   - **Palabras** — términos clave con su definición y, en v2, la palabra original en hebreo o griego.
   - **Lugares** — si el versículo nombra un lugar, el mapa (OpenBible.info).
   - **Mis notas** — tus notas y resaltados de ese versículo.
4. **En tablet** la hoja pasa a ser una columna al costado, sincronizada con el texto.
5. **Módulos descargables** por idioma, gratis y sin conexión.
6. **Transparencia:** cada comentario lleva su etiqueta (*comentario clásico, siglos XVII–XIX*; *traducción asistida por IA y
   revisada*) y su licencia.

## 5. Comentarios en español: cómo se consiguen

**HECHO:** no existen comentarios clásicos libres en español ni en portugués (las ediciones en español de Matthew Henry y
Jamieson-Fausset-Brown tienen derechos). Los originales en inglés son de dominio público y las notas de Tyndale tienen licencia CC BY-SA.

**Plan:** priorizar pasajes (Evangelios, Hechos, Romanos, Salmos, Génesis, Proverbios); traducir con IA por lotes con un glosario
teológico fijo; verificar automáticamente cada cita; revisión humana por muestreo y completa en pasajes sensibles; publicar las
traducciones derivadas de Tyndale bajo CC BY-SA con la lista de cambios. Costo: del orden de USD 30–200 en total; lo caro es la revisión.

Resultado: **la primera colección libre de notas y comentarios bíblicos en español** dentro de una app.

## 6. Audio: que la Biblia te lea

| Etapa | Cómo | Costo | Calidad |
|---|---|---|---|
| MVP | Voz del propio teléfono (gratis, sin conexión) | 0 | Aceptable |
| v1 | **Voz neuronal generada una vez** por versión libre (Google o Azure), guardada en nuestro almacenamiento | USD 17–130 por versión | Muy buena |
| v1–v2 | Audio de las versiones con licencia, si la licencia lo incluye (YouVersion o API.Bible) | Según licencia | Muy buena |
| Futuro | Narradores humanos para la versión por defecto, si hay ingresos | Miles de dólares | La mejor |

No se usa el audio de Faith Comes By Hearing porque su licencia prohíbe apps en las que el usuario pague algo.

## 7. La racha: lo único de juego que se ve en la Biblia

- **Qué cuenta:** días seguidos con al menos un **momento con la Palabra**: leer un capítulo (o 3 minutos), escuchar 3 minutos, hacer
  el día de un plan o completar una lección de la Travesía.
- **Cómo se ve:** una lámpara cuya luz crece con los días; cada día es un **rayito**. En los hitos (3, 7, 30, 100, 365) hay una
  celebración corta con un sonido cálido.
- **Día libre:** elegís un día por semana en el que no hace falta abrir la app; no corta la racha.
- **Protector:** guarda la racha si un día no pudiste (máximo 2 guardados).
- **Recuperala leyendo:** si se apagó, tenés 48 horas para volver a encenderla leyendo dos capítulos extra.
- **Qué suma leer:** cada capítulo leído suma Pasos (con un tope de 5 por día, para que nadie «pase páginas») y el primer momento con
  la Palabra del día abre el **Cofre de la Palabra** (Talentos). Así se cumple que *todo suma* sin convertir la lectura en una carrera.
- **Sin publicidad ni ofertas:** nunca en este módulo.

## 8. Contenido necesario (resumen; detalle en el capítulo {{cap:22}})

| Pieza | MVP | v1–v2 | 2028 |
|---|---|---|---|
| Versiones | RV1909 + 2 libres (+ RVR1960 si llega) | + RVR1960, NTV, NVI, DHH, TLA | + portugués e inglés |
| Notas de estudio traducidas | — | Evangelios, Hechos, Romanos, Salmos | Toda la Biblia |
| Comentarios traducidos | — | Matthew Henry en los libros prioritarios | 6 comentarios en los libros más leídos |
| Audio neuronal | — | Versiones libres en español | + portugués e inglés |
| Imágenes para compartir | 30 fondos | 150 | 400 |

## 9. Cómo se mide

- Porcentaje de usuarios activos que leen o escuchan cada semana; minutos por semana; capítulos completos.
- Uso de cada versión (para decidir licencias).
- Distribución de la racha (cuántos llegan a 7, 30 y 100 días).
- Uso del «+» y reportes de errores.
