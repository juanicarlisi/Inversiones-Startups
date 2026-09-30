# Contenido: qué hay libre, qué producimos y cómo se revisa

<div class="enpocas" markdown="1">
**En pocas palabras.** La Biblia, los comentarios, las referencias, los mapas y buena parte del material de estudio existen con
licencia libre (casi todo en inglés); lo traducimos y lo revisamos. Lo que no existe (preguntas, lecciones, devocionales, juegos) lo
produce Claude con cita y lo revisan personas de tu comunidad. Hay una línea editorial escrita, un circuito de revisión y un botón para
reportar errores en todo.
</div>

## 1. Inventario de contenido libre y reconocido

| Contenido | Fuente | Licencia | Idiomas | Uso en Senda |
|---|---|---|---|---|
| Biblias en español | RVR1909; Nueva Biblia Viva (Biblica, abierta 2008); Versión Biblia Libre; Biblia Libre para el Mundo; Español Sencillo | Dominio público, CC BY-SA, CC0, CC BY | ES | Lector, audio, verificación de preguntas |
| Biblias en portugués | Nova Bíblia Viva (abierta 2007); Bíblia Livre | CC BY-SA / CC BY | PT | 2028 |
| Biblias en inglés | Berean Standard Bible; KJV; WEB | Dominio público | EN | 2028 |
| Biblias en otros idiomas | eBible.org y la Free Use Bible API (1.000+ traducciones) | Libres (se verifica una por una) | 700+ | Etapa 3 |
| Notas de estudio | Tyndale Open Study Notes | CC BY-SA 4.0 | EN → ES, PT | «+» Notas |
| Comentarios clásicos | Matthew Henry, Jamieson-Fausset-Brown, Calvino, Gill, Clarke, Keil-Delitzsch | Dominio público | EN → ES, PT | «+» Comentarios |
| Diccionario bíblico | Tyndale Open Bible Dictionary | Abierto (Open Bible Data) | EN → ES, PT | «+» Palabras |
| Referencias cruzadas | OpenBible.info (sobre el Treasury of Scripture Knowledge) | CC BY 4.0 | Neutro | «+» Referencias |
| Lugares y mapas | OpenBible.info (geocodificación) | CC BY 4.0 | Neutro | «+» Lugares, ejercicios de mapa |
| Palabras originales | Concordancia de Strong | Dominio público | EN → ES | «+» Palabras (v2) |
| Clásicos cristianos | Bunyan, Spurgeon (originales), historia de la Reforma | Dominio público | EN → ES; LibriVox en ES | Biblioteca |
| Himnos | Letras del siglo XIX (J. B. Cabrera y otros) | Dominio público | ES | Biblioteca |
| Videos | BibleProject | Gratis, sin alojar ni lucrar | ES, PT, EN | Enlace «ver el video del libro» |
| Bancos de preguntas | OpenTriviaQA, Open Trivia DB, set de Hugging Face | CC BY-SA / citar / revisar | EN | Base del banco (capítulo {{cap:09}}) |

**Atribución:** una pantalla **«Créditos y licencias»** lista cada fuente con su licencia; cada comentario muestra su autor y
licencia; las obras CC BY-SA y sus derivados (por ejemplo, la traducción de las notas de Tyndale) se publican también como CC BY-SA
con la lista de cambios.

## 2. Lo que producimos

| Contenido | Quién lo produce | Cómo se verifica | MVP | Fin de 2027 |
|---|---|---|---|---|
| Preguntas de Espadeo | Claude + bancos filtrados + jugadores | Automático (cita, respuesta en el texto) + humano | 3.000 | 10.000 |
| Lecciones del Camino | Claude desde fichas de unidad | Automático + humano | 90 lecciones | 600 lecciones |
| Devocionales y planes | Claude | Revisor doctrinal | 5 planes | 30 planes, 100 devocionales |
| Palabras de juegos (Dibujalo, Impostor, Tutti Frutti, Rosco) | Claude | Automático (existen en la Biblia) + muestreo | — | 1.500 + 800 + 5.000 + 780 |
| Tarjetas de apologética | Claude | Revisor doctrinal | — | 40 |
| Traducciones de notas y comentarios | Claude por lotes | Automático (citas) + muestreo | — | Libros prioritarios |
| Imágenes de versículos | Plantillas + ilustración | Diseño | 30 | 150 |
| Audio | Voz neuronal | Escucha por muestreo | — | 2 versiones |
| Dinámicas para Senda Reunión | Claude + curaduría | Líderes | — | 200 |
| Contenido para redes | Claude | Vos aprobás | 3–5 por semana | 5–7 por semana |

## 3. Línea editorial (la «declaración de fe» de Senda)

1. **Base común protestante:** la Biblia como Palabra de Dios y autoridad final; un solo Dios en tres personas; Jesucristo, verdadero
   Dios y verdadero hombre, muerto y resucitado; salvación por gracia mediante la fe en Cristo; la iglesia como comunidad de creyentes.
   Referencias: el Credo de los Apóstoles y el Pacto de Lausana.
2. **Temas en los que las iglesias protestantes discrepan** (forma del bautismo, dones espirituales, gobierno de la iglesia, orden de
   los tiempos finales, predestinación): no entran en preguntas de «una sola respuesta»; en el «+», en Preparados y en Berea se
   presentan las posturas con sus textos y se invita a hablarlo con el pastor.
3. **Respeto:** sin burlas a otras confesiones ni religiones.
4. **Edad:** contenido apto para 13 años; los pasajes fuertes (violencia, sexualidad) se tratan con cuidado y sin detalles gráficos
   en juegos.
5. **Fidelidad al texto:** toda afirmación bíblica lleva su cita; lo interpretativo se presenta como tal.

**Decisión pendiente:** confirmar esta línea con tus revisores (capítulo {{cap:27}}).

## 4. El circuito de revisión

1. **Producción:** Claude produce el contenido con su cita y lo marca por nivel de sensibilidad (normal, doctrinal, delicado).
2. **Verificación automática:** citas que existen, respuestas presentes en el texto en dos versiones, sin duplicados, sin palabras
   prohibidas, lectura adecuada para la edad.
3. **Revisión humana:**
   - **Revisor doctrinal** (1–2 personas de tu comunidad): todo lo marcado como doctrinal o delicado, y el 10% del resto.
   - **Revisor de lengua** (cuando haya otros idiomas): nativo del idioma.
   - **Prueba con jóvenes:** un grupo chico juega el contenido nuevo antes de abrirlo a todos.
4. **Publicación** con estado y responsables registrados.
5. **Correcciones:** botón «Reportar un error» en cada pregunta, lección, nota y comentario. Meta: revisar todo reporte en 72 horas;
   lo doctrinal grave se retira en 24 horas.

## 5. Traducción e idiomas

- **Interfaz:** todos los textos en archivos de traducción desde el día 1 (nada escrito en el código).
- **Método:** Claude traduce con un **glosario teológico fijo** por idioma y una guía de estilo; un revisor nativo revisa lo doctrinal
  y un muestreo del resto.
- **Contenido bíblico:** en cada idioma, las preguntas y lecciones se verifican contra las Biblias libres de ese idioma (no se
  traducen las citas: se toman del texto de la versión).
- **Adaptación cultural:** nombres de juegos, ejemplos y fechas por país.

## 6. Calendario anual de contenido

| Mes | Contenido especial |
|---|---|
| Enero | 21 días de oración y ayuno; Copa Senda de verano; campamentos |
| Febrero | Amistad y noviazgo (plan temático); fin de campamentos |
| Marzo | Vuelta a clases y a los grupos de jóvenes; arranca la temporada 1 de la liga |
| Marzo–abril | **Semana Santa** (28-03-2027; 16-04-2028) |
| Mayo–junio | Pentecostés (50 días en Hechos) |
| Julio | **Copa Senda de invierno**; campamentos de invierno |
| Agosto | Temporada 2 de la liga; vuelta a clases en México y EE.UU. |
| Septiembre | Aniversario de Senda; en varios países se celebra el mes o el día de la Biblia (fecha según cada país) |
| Octubre | Reforma (31 de octubre) |
| Noviembre | Gratitud; final de la temporada 2 |
| Diciembre | Adviento y Navidad; **Tu año en la Palabra** |

## 7. Contenido para redes (sin mostrar a nadie)

- **La que habla es Lani:** la cuenta de Instagram y TikTok es la voz de la mascota.
- **Formatos:** versículo del día con imagen; «¿Sabías que…?» (carrusel); trivia en historias con encuestas; clips de partidas del
  Impostor y del Rosco (grabación de pantalla con voz sintética); memes de Lani; resultados de la liga y de los torneos; anuncios de
  sorteos.
- **Ritmo:** 3–5 publicaciones por semana al principio; 1–2 reels por semana; historias diarias.
- **Producción:** Claude arma el lote semanal; vos aprobás en 20 minutos los lunes y respondés comentarios en ratos (ver el roadmap).
