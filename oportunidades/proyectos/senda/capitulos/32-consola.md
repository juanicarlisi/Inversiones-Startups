# La Consola: cómo se gobierna Senda

<div class="enpocas" markdown="1">
**En pocas palabras.** Hasta el sprint 1, el contenido de Senda (preguntas, lecciones, encuestas) estaba escrito dentro del código:
para cambiar una pregunta había que publicar otra versión de la app, y no había un lugar donde ver el proyecto entero. Desde el
05-10-2026 el contenido vive **como datos**, con su estado de revisión y una verificación automática de citas, y todo se gobierna
desde la **Consola de Senda**: avance y presupuesto del proyecto, catálogo del contenido, propuestas, sonidos, licencias y métricas.
Crece en tres etapas: **v0 hoy** (página privada en claude.ai, USD 0), **v1 en el sprint 2** (web propia sobre Supabase, con inicio
de sesión, edición directa, contenido que llega sin actualizar la app y métricas de PostHog, USD 0) y **v2 en 2027** (revisores,
preguntas propuestas por jugadores con votos, calendario de contenido, pruebas A/B).
</div>

## 1. La pregunta del fundador

¿Cómo se crean las encuestas del Pulso? ¿Cómo se agregan preguntas al Espadeo o lecciones a la Travesía? ¿Dónde se ve lo que ya
existe? ¿Dónde están las métricas? ¿Desde dónde se gobierna la app y el proyecto (avance, lo que falta en cada parte, el presupuesto
de las próximas etapas)? El proyecto lo tenía repartido (contenido en el capítulo {{cap:23}}, tecnología en el {{cap:25}}, métricas
en el {{cap:27}}), pero no tenía **un lugar** donde todo eso se ve y se decide. Este capítulo lo resuelve.

## 2. Qué hacen las apps de referencia

| App | Cómo gobiernan el contenido | Qué tomamos |
|---|---|---|
| **Preguntados** (Etermax) | «Fábrica de preguntas»: los jugadores proponen y califican; con unas 100 calificaciones positivas una pregunta pasa a «casi lista» y el equipo hace un filtro final (de unas 20.000 propuestas por día llegan 1.000 al equipo) | Propuestas de jugadores con votos y filtro editorial (v2). Hoy: tus propuestas en la Consola y mi verificación |
| **Duolingo** | Herramientas internas propias, un «curso base» compartido que se adapta a muchos idiomas y métricas de calidad por ítem que guían a quienes escriben | La **salud de cada pregunta**: % de acierto, reportes y tiempo, en cuanto haya métricas |
| **Juegos con eventos en vivo** | Calendario de contenido, configuración remota e interruptores, paquetes de contenido que llegan sin pasar por la tienda | Pulso programado por fecha, semana Senda como datos y paquetes de contenido (v1) |
| **YouVersion** | Los planes de lectura los cargan editoriales y ministerios desde un portal de socios | En 2027, un portal para que iglesias y líderes suban planes y reuniones (capítulo {{cap:12}}) |

## 3. Las opciones que se compararon

| Opción | Costo | Quién edita | Contenido sin actualizar la app | Métricas | Veredicto |
|---|---|---|---|---|---|
| Contenido dentro del código (como estaba) | 0 | Solo Claude | No: cada cambio es una versión nueva | No | **Descartada** |
| Archivos en el repositorio + editor «CMS con git» (Decap, Keystatic, Tina) | 0 | Claude y quien tenga GitHub | Sí, con paquetes | No | Sirve para el contenido, pero no muestra el proyecto ni las métricas y pide cuenta de GitHub al editor |
| CMS en la nube (Sanity, Contentful, Strapi Cloud) | 0 → USD 15–300 por mes | Editores con cuenta | Sí | No | Otro proveedor más, sin datos de usuarios (votos, reportes) |
| Constructor de paneles sobre la base (Retool gratis hasta 5 usuarios; Appsmith o Tooljet autoalojados) | 0 → USD 10 por usuario | Quien tenga cuenta | Sí | Parcial | Rápido para tablas, pero genérico y sin el tablero del proyecto |
| Editor de tablas de Supabase | 0 | Quien tenga acceso a la base | Sí | No | Útil para Claude; riesgoso y poco amable para el fundador |
| **Consola a medida** (página propia sobre los datos de Senda, Supabase y PostHog) | **0** (hosting gratis en Cloudflare Pages; hoy, claude.ai) | Fundador, Claude y (2027) revisores | **Sí** | **Sí** (PostHog) | **Elegida**: muestra proyecto, contenido, métricas y licencias en un solo lugar y la mantiene Claude |

**Por qué la consola a medida:** con Claude como equipo de desarrollo, construir y mantener un panel propio cuesta lo mismo que
configurar una herramienta genérica, y permite lo que ninguna trae: el avance del proyecto, los pendientes del fundador, el
presupuesto por etapa, la sala de sonidos y el seguimiento de licencias, al lado del contenido y las métricas. Los datos quedan en
formatos abiertos (archivos JSON y Postgres), así que se puede cambiar de herramienta sin perder nada.

## 4. Las tres etapas

| Etapa | Cuándo | Qué es | Qué permite | Costo |
|---|---|---|---|---|
| **v0** | Hoy (05-10-2026) | Página privada en claude.ai, armada por Claude con los datos del repositorio de la app y del holding; guarda lo que marcás en su propia base de datos | Ver avance, pendientes, presupuesto, etapas, todo el contenido con su estado, licencias y metas; **proponer** preguntas, encuestas e ideas; **elegir** sonidos y voz; marcar pendientes y licencias. Claude lo lee al empezar cada sesión, lo verifica e incorpora | USD 0 |
| **v1** | Sprint 2 (26-oct a 8-nov) | Web propia con inicio de sesión sobre Supabase (Cloudflare Pages) | Editar y publicar contenido sin actualizar la app (paquetes que la app baja sola), Pulso con votos reales, reportes de errores de usuarios, métricas en vivo (PostHog) | USD 0 (planes gratis) |
| **v2** | 2027 (v1 «Juntos») | La misma Consola con roles | Revisores doctrinales con su cola, preguntas propuestas por jugadores con votos, calendario de contenido y eventos en vivo, interruptores de funciones y pruebas A/B, panel de iglesias | Supabase Pro USD 25 por mes (ya presupuestado) |

## 5. Qué se gobierna desde la Consola

| Pestaña | Qué muestra | Qué se hace ahí |
|---|---|---|
| **Proyecto** | Avance del MVP (ponderado por área), días al lanzamiento, próximo hito, cada parte de Senda con lo hecho, lo que falta y lo próximo, etapas y presupuesto (con el mínimo recomendado y quién hace cada cosa) | Marcar como hechos tus pendientes, cada uno con su «Cómo, paso a paso» |
| **Contenido** | Cantidades por tipo y por categoría, estado de revisión, resultado de la verificación automática y el catálogo navegable (Espadeo, Travesía, Pulso, semana Senda, versículos del día) | Buscar y filtrar; ver respuestas y citas |
| **Proponer** | Formularios para preguntas de Espadeo, encuestas de Pulso (con fecha) e ideas o correcciones | Cargar propuestas; ver si se incorporaron |
| **Sonidos y voz** | Cada momento con sonido, el actual y los candidatos libres; muestras de voces neuronales | Escuchar y elegir |
| **Licencias** | Cada titular, sus versiones, el camino y el pedido ya escrito: los correos se abren listos en Gmail desde el correo del proyecto; los formularios traen cada dato con su botón «Copiar» | Enviar, marcar el estado y anotar la respuesta |
| **Métricas** | El indicador que manda, las metas de abril y diciembre de 2027 y los eventos que va a mandar la app | Desde el sprint 2, ver los números en vivo |
| **Cómo se gobierna** | Este capítulo, resumido | — |

## 6. El circuito del contenido

1. **Propuesta**: la carga el fundador en la Consola, la produce Claude por lotes o (2027) la propone un jugador.
2. **Formato y verificación automática** (`scripts/validar_contenido.py` en la app): formato, ids únicos, respuesta en rango, que la
   cita exista y que la palabra clave esté en el versículo citado de la RV1909; corre en cada cambio.
3. **Estado**: borrador → en revisión → aprobada → publicada (o retirada). En la versión de prueba se ven las «en revisión»; a la
   tienda solo salen las aprobadas por un revisor doctrinal (capítulo {{cap:23}}).
4. **Publicación**: hoy, con la versión de la app; desde la v1, como paquete de contenido que la app baja sola.
5. **Salud**: con métricas, cada pregunta muestra su % de acierto y sus reportes; las que confunden vuelven a revisión.

## 7. Quién hace qué

| Quién | En la Consola |
|---|---|
| **Fundador** | Mira el avance cada lunes (10 minutos, capítulo {{cap:27}}), propone, elige sonidos y voz, marca pendientes y licencias, aprueba gastos |
| **Claude** | Actualiza el estado del proyecto al cerrar cada sesión, lee y procesa propuestas y elecciones, produce y verifica contenido, mantiene la Consola |
| **Revisores** (2027) | Aprueban o devuelven el contenido marcado «en revisión» |

## 8. Fuentes

Benchmark y precios en la bitácora `conocimiento/2026-10-05-senda-consola-sonido-licencias.md` (búsquedas del 05-10-2026; varias
páginas oficiales estaban bloqueadas en el entorno de Claude y se re-verifican antes de cualquier gasto).
