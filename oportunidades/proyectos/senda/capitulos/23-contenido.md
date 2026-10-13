# Contenido: qué hay libre, qué producimos y cómo se revisa

<div class="enpocas" markdown="1">
**En pocas palabras.** Las Biblias más usadas se licencian (Reina-Valera, NTV, NVI, DHH, TLA) y el resto del material de estudio
existe con licencia libre (casi todo en inglés): lo traducimos y lo revisamos. Lo que no existe (preguntas, lecciones de todas las
Rutas, devocionales, palabras de juegos, imágenes para preguntas) lo produce el equipo (Claude con revisión humana) con cita en todo.
Hay una línea editorial escrita, guardas doctrinales, un circuito de revisión y un botón para reportar errores en todo.
</div>

## 1. Inventario de contenido libre y reconocido

| Contenido | Fuente | Licencia | Idiomas | Uso en Senda |
|---|---|---|---|---|
| Biblias en español con licencia | RVR1960, DHH y TLA (SBU); NVI (Biblica); NTV (Tyndale) | Licencia vía API.Bible o directa (YouVersion Platform solo admite apps no comerciales) (capítulo {{cap:07}}) | ES | Lector, audio si la licencia lo incluye |
| Biblias en español libres | RV1909; Nueva Biblia Viva (Biblica, abierta 2008); Versión Biblia Libre; Biblia Libre para el Mundo; Español Sencillo | Dominio público, CC BY-SA, CC0, CC BY | ES | Lector, audio, verificación de preguntas |
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
| Bancos de preguntas | OpenTriviaQA, Open Trivia DB, set de Hugging Face | CC BY-SA / citar / revisar | EN | Base del banco (capítulo {{cap:09}}) |

**Atribución:** una pantalla **«Créditos y licencias»** lista cada fuente con su licencia; cada comentario muestra su autor y
licencia; las obras CC BY-SA y sus derivados (por ejemplo, la traducción de las notas de Tyndale) se publican también como CC BY-SA
con la lista de cambios.

## 2. Lo que producimos

| Contenido | Quién lo produce | Cómo se verifica | MVP | Fin de 2027 |
|---|---|---|---|---|
| Preguntas de Espadeo | Claude + bancos filtrados + jugadores | Automático (cita, respuesta en el texto) + humano | 4.000 | 14.000 |
| Ilustraciones para preguntas | Ilustrador (o IA con retoque y revisión) | Revisor doctrinal (cómo se representa) | 100 | 400 |
| Lecciones de la Travesía (todas las Rutas) | Claude desde fichas de unidad | Automático + humano | 130 lecciones | 1.600 lecciones (Fundamentos completa en junio) |
| Devocionales y planes | Claude | Revisor doctrinal | 5 planes | 30 planes, 100 devocionales |
| Palabras de juegos (Dibujalo, Oveja Perdida, Tutti Frutti, Abecé, ¡Prohibido!) | Claude | Automático (existen en la Biblia) + muestreo | — | 1.500 + 800 + 5.000 + 780 + 600 |
| Ruta Preparados (apologética) | Claude | Revisor doctrinal | — | 40 tarjetas + niveles |
| Preguntas del Viernes de Espadeo | Claude | Revisor | 4 semanas | 52 semanas |
| Encuestas de Pulso | Claude + escalas reconocidas de libre uso | Revisión de redacción y ética | Pregunta del día | Estudio anual |
| Traducciones de notas y comentarios | Claude por lotes | Automático (citas) + muestreo | — | Libros prioritarios |
| Imágenes de versículos | Plantillas + ilustración | Diseño | 30 | 150 |
| Audio | Voz neuronal | Escucha por muestreo | — | 2 versiones |
| Plantillas de reuniones | **Los líderes** (biblioteca compartida); Senda solo las ordena | Revisión antes de destacarlas | — | 200 |
| Contenido para redes | Claude | Vos aprobás | 3–5 por semana | 5–7 por semana |

## 3. Línea editorial (la «declaración de fe» de Senda)

1. **Base común protestante:** la Biblia como Palabra de Dios y autoridad final; un solo Dios en tres personas; Jesucristo, verdadero
   Dios y verdadero hombre, muerto y resucitado; salvación por gracia mediante la fe en Cristo; la iglesia como comunidad de creyentes.
   Referencias: el Credo de los Apóstoles y el Pacto de Lausana.
2. **Temas en los que las iglesias protestantes discrepan** (forma del bautismo, dones espirituales, gobierno de la iglesia, orden de
   los tiempos finales, predestinación): no entran en preguntas de «una sola respuesta» ni tienen una Ruta propia; si aparecen (en el
   «+» o en Preparados) se presentan las posturas con sus textos y se invita a hablarlo con el pastor.
3. **Respeto:** sin burlas a otras confesiones ni religiones.
4. **Edad:** contenido apto para 13 años; los pasajes fuertes (violencia, sexualidad) se tratan con cuidado y sin detalles gráficos
   en juegos.
5. **Fidelidad al texto:** toda afirmación bíblica lleva su cita; lo interpretativo se presenta como tal.
6. **Imágenes:** no se representa a Dios Padre; Jesús aparece con respeto (de espaldas, a distancia o en silueta) para no dividir
   sensibilidades entre iglesias; nada de violencia gráfica.
7. **Rutas sensibles** (Vida real: ansiedad, noviazgo, identidad): para 16 o más, escritas con cuidado pastoral y revisadas siempre.

**Decisión pendiente:** confirmar esta línea con tus revisores (capítulo {{cap:31}}).

## 3b. Fuentes confiables y la biblioteca de estudio (prueba 10, 12-10-2026)

**Qué pidió el fundador (resumen).** Usar siempre fuentes protestantes confiables (nombró la Coalición por el Evangelio, Toma Tu Lugar y
MiSión, o similares), aprender de ellas **sin copiar y pegar**; la biblioteca de comentarios (de Génesis a Apocalipsis) se puede usar
para entender, nunca para plagiar, y no hay que limitarse a ella.

**Acceso a la biblioteca (confirmado el 11-10-2026).** El repositorio privado `juanicarlisi/biblioteca-estudios-biblicos` tiene 142 PDF
(guardados con Git LFS). Claude los lee bajándolos por la API de LFS. Los PDF **nunca** se publican ni se copian a la app ni a este
repositorio: tienen derechos de autor.

**Qué hay (y con qué cuidado se usa cada uno).**

| Obra | Tradición | Para qué sirve | Cuidado |
|---|---|---|---|
| Diccionario Bíblico Mundo Hispano (Douglas y Tenney, 2003) | Evangélica | Datos de historia, idiomas, canon, lugares: es la fuente de las notas de «Cómo se formó la Biblia» | Citar entrada; re-verificar fechas que decidan algo |
| MacArthur (comentarios del NT y Biblia de estudio), Hendriksen y Kistemaker, Carballosa, Stott, Walvoord, Moody, Mundo Hispano, Matthew Henry, Spurgeon (Salmos), Lutero (Romanos y Gálatas), Edersheim | Protestante (reformada, bautista, dispensacional, luterana) | Contexto, sentido del pasaje, preguntas difíciles | Cuando dos de ellos discrepan (por ejemplo, el orden de los tiempos finales), es tema de posturas |
| Beacon | Protestante (wesleyana) | Contexto | Igual que arriba |
| Barclay | Protestante, con posturas liberales en algunos temas (milagros, inspiración) | Trasfondo histórico y palabras griegas | No usar para doctrina |
| Ladd, Larkin, Hanegraaff, Iafrancesco (Apocalipsis) | Protestantes con escuelas distintas (premilenial histórica, dispensacional con gráficos, preterista parcial) | Mostrar las posturas sobre el Apocalipsis | Nunca como respuesta única |
| Pikaza (Apocalipsis) | Católica | Contraste académico | No es fuente protestante: no se usa para enseñar |

**Las reglas (no negociables).**
1. **Entender, nunca copiar.** Nada de frases tomadas de un comentario o de un sitio. Se escribe con palabras propias, después de entender.
2. **La Biblia manda.** Toda respuesta está en el texto bíblico (verificado línea por línea contra la RV1909); los comentarios ayudan a no
   equivocarse en el sentido y en el contexto.
3. **Datos de historia, con fuente.** Lo que no está en un versículo (fechas, idiomas, canon) va como nota con su fuente nombrada.
4. **Interpretación, marcada.** «Muchos estudiosos ven…», «es una interpretación».
5. **Lo que divide, como posturas**, citando los textos de cada una.
6. **Sitios en línea:** Coalición por el Evangelio y otros ministerios evangélicos sirven para ver cómo se explica un tema hoy; se leen,
   no se copian. **Pendiente:** confirmar con el fundador los nombres y sitios exactos de «Toma Tu Lugar» y «MiSión» (no los encontramos
   con certeza) y si hay otros que quiera sumar.

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
| Febrero | Amistad (plan temático); fin de campamentos y de la Copa de verano |
| Marzo | Vuelta a clases y a los grupos de jóvenes |
| Marzo–abril | **Semana Santa** (28-03-2027; 16-04-2028); arranca la **Liga Apertura** (abril) |
| Mayo–junio | Pentecostés (50 días en Hechos) |
| Julio | Final del Apertura; **Copa Senda de invierno**; campamentos de invierno |
| Agosto | Arranca el **Clausura**; vuelta a clases en México y EE.UU. |
| Septiembre | Aniversario de Senda; en varios países se celebra el mes o el día de la Biblia (fecha según cada país) |
| Octubre | Reforma (31 de octubre) |
| Noviembre | Gratitud; final del Clausura |
| Diciembre | Supercopa; Adviento y Navidad; **Tu año en Senda**; Informe Pulso |

## 7. Contenido para redes (sin mostrar a nadie; detalle en el capítulo {{cap:22}})

- **La que habla es Lany:** la cuenta de Instagram y TikTok es la voz de la mascota.
- **Formatos:** versículo del día con imagen; «¿Sabías que…?» (carrusel); trivia en historias con encuestas; clips de partidas de
  Oveja Perdida y del Abecé; memes de Lany; resultados de la Liga y del Viernes de Espadeo; anuncios de Copas y sorteos.
- **Ritmo:** 3–5 publicaciones por semana al principio; 1–2 reels por semana; historias diarias.
- **Producción:** Claude arma el lote semanal; vos aprobás en 20 minutos los lunes y respondés comentarios en ratos (ver el roadmap).
