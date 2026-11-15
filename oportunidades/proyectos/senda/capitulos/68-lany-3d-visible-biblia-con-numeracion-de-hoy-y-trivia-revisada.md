# 68. La Lany 3D por fin se ve, la Biblia con la numeración de hoy y la trivia leída pregunta por pregunta (prueba 42, 01-11-2026)

Sesión del 31-10 al 01-11-2026. El fundador probó el APK 41 y pidió una lista larga; a mitad de camino avisó que iba por el 90 % del
consumo semanal y pidió avanzar solo con lo necesario y dejar pendientes claros. Este capítulo cuenta lo hecho, lo medido y lo que
queda, en ese orden.

## 1. Lo que pidió el fundador (prueba 42)

- Lany como personaje de dibujos animados, realista, «no una imagen tiesa»; la armadura como stickers; sin interruptor «Lany en 3D»;
  sonidos tipo Duolingo (sin palabras). «No frenes la sesión hasta no darme un producto que en verdad esté a la altura».
- «La app se volvió lentísima. Optimizá» y, en la Biblia, «sigue andando LENTÍSIMO… No me entregues el apk hasta lograr eso».
- La hoja de la Biblia no se dobla del lado del lomo (está pegada ahí).
- «Practicar con Lany»: al errar le toca el turno a Lany, no sigo yo.
- Travesía: los carteles tapan, al bajar se salen y no se puede apretar «Jugar». «Hay cosas que aparecen cortadas».
- «Avanzá con contenidos y trivia, y todos los próximos que falten». «Hay algunas preguntas con errores. Revisá bien todo».
- Ajustes con el plan activo (Gratis / Premium / Max) y, desde una función bloqueada, una pantalla con los tres planes y sus tildes.
- Álbum «como si fuera un álbum posta». ¿Quién es? y Nombres por letra con rival a elección (Lany, al azar, un amigo).
- «Revisá CADA punto… andá despacio, línea por línea».

## 2. HECHOS (todo en `senda-app`, rama main; fechas UTC)

### 2a. La causa raíz de la Lany 3D invisible en Android (resuelta)
- **Hecho (medido en el emulador, 01-11, run 41263649540 de «Prueba de humo»):** three.js (r163 en adelante) rechaza el contexto con
  «WebGL 1 is not supported since r163» porque en expo-gl `WebGL2RenderingContext` hereda de `WebGLRenderingContext` (en el navegador
  no). Por eso la Lany 3D nunca apareció en el teléfono desde la prueba 41, aunque en la web se veía bien.
- **Arreglo (commit f6bff7c):** mientras se construye el renderer se esconde ese global y después se restaura (solo en nativo).
  Evidencia: el registro del emulador dice `[Lany3D] primer cuadro dibujado (+13440 ms)` y las capturas muestran a Lany en 3D en Inicio,
  el Espadeo y la Travesía. El interruptor «Lany en 3D» se sacó: va directo.
- **Lo que se vio después (01-11, misma corrida):** de noche Inicio pide la pose «dormida» y la 3D la contaba con el clip del patatús
  (cara al piso, brazos abiertos). Arreglado (commit 8dcbef2): dormida es el reposo con los párpados cerrados (los mismos huesos y
  giro que usan los clips de Blender), la cabeza caída, la respiración lenta y tres zetas; verificado en la vista previa.

### 2b. Velocidad (lo que se pudo hacer sin un teléfono real)
- Sin mapa de sombras (duplicaba el dibujo por cuadro; la sombra es una mancha plana), 24 cuadros por segundo en reposo, MSAA 2 en el
  teléfono, three.js cargado solo cuando hace falta, el modelo leído y armado después de que la pantalla termina sus animaciones
  (mientras tanto se ve la Lany de Rive), y las capturas de la hoja de la Biblia diferidas (la actual a los 260 ms, la anterior 700 ms
  después). En el emulador: 4,4 ms por cuadro con una Lany, 8,4 ms con dos (software; no es el teléfono).
- **Lo que no se puede afirmar:** cuánto mejora en el teléfono del fundador. Es la primera cosa a leer de la prueba 42.

### 2c. Lo demás que pidió, hecho y visto en la vista previa o el emulador
- Hoja de la Biblia: el pliegue nunca cruza el lomo (ángulo de la curva acotado para que las dos esquinas del lomo queden planas).
- Espadeo: al errar, el turno pasa a Lany (gira, lee la pregunta, responde: acierta el 62 %) y después vuelve; el título no tapa.
- Travesía: el cartel del nivel es una hoja fija sobre la barra de pestañas, con botón siempre visible y cierre con ×.
- Textos cortados: auditoría automática de pantallas con letra normal y grande en tres idiomas; la barra de arriba esconde el tercer
  contador con letra grande; la barra flotante de abajo ahora apaga con un degradé lo que se desplaza detrás (asomaba texto cortado).
- Planes: «Plan activo» en Ajustes y la pantalla Planes (Gratis, Premium, Max con tildes y cruces, precios como propuesta) a la que
  lleva cada función bloqueada (PDF del líder, salas).
- Álbum: páginas de papel que se dan vuelta con el dedo, figuritas pegadas con inclinación, el sobre que se abre, la figurita vuela a
  su casillero, ficha al pegar.
- ¿Quién es? y Nombres por letra: desafío contra Lany, al azar o contra un amigo (torneos de ¿Quién es? con 12/16/20 tarjetas).
- Sonidos de Lany (sin palabras) en gestos y piezas.

### 2d. La Biblia de la app: numeración de versículos de hoy (DEC-2026-11-01-1)
- **Hecho (medido el 01-11 con un barrido de toda la RV1909 de la app):** 16 versículos vacíos y uno con nueve versículos pegados.
  La fuente traía el texto de la edición de 1909 volcado en el esqueleto de capítulos de hoy, y en ocho lugares la 1909 divide distinto
  (Números 12:16/13 y 29:40/30, 2 Samuel 20:25-26, Job 35:15-16, Job 38:39-41/39/40, Oseas 11:12/12, Jonás 1:17/2, Hechos 19:40-41,
  2 Corintios 13:12-14), más 1 Samuel 23:29/24 y 2 Crónicas 33:10-11 arreglados antes en la sesión y Job 32:2 con coma doble.
- **Decisión:** la app usa la numeración de hoy (la de la RVR1960, de las demás Biblias de la app y de todas las citas del contenido).
  El texto sigue siendo la RV1909, dominio público. `scripts/biblia_arreglos.py` lo deja así después de convertir; ya no hay vacíos.
- **Consecuencia:** 26 preguntas de la trivia, 15 citas de lecciones (Jonás, Oseas, Números, 2 Corintios), la misión de Jonás, tarjetas
  de En la frente y ¿Quién es?, la línea del Éxodo y Nombres por letra se habían escrito con la numeración vieja: las movió
  `scripts/autor/renumeracion_biblia.py` en el contenido, el script de autor y la traducción a la vez. Validador: «todo en orden».

### 2e. La trivia leída pregunta por pregunta (bancos 40 y 41)
- 3.089 preguntas en 18 lotes, cada uno leído por un revisor contra el texto de la RV1909 de la app (con la herramienta `ver.py`).
- Hallazgos: 310 (2 de gravedad alta, 101 media, 207 baja). Tipos: «este salmo / el capítulo» sin nombrar (al responder no se ve la
  cita), opciones de distinto tipo o que se pisaban con la correcta, datos con citas corridas o con lecturas de la RVR1960, palabras
  viejas de la 1909 sin explicar, puntuación, repetidas.
- Aplicados: 273 con propuesta concreta (automático, con revisión del antes y después) y 37 a mano; 4 repetidas retiradas (quedan en
  su banco, no se publican: `RETIRADAS` en `trivia_taller.py`); 40 versículos más en `FORZADOS` (la opción dice la palabra de hoy y el
  pasaje se abre en la versión libre que la trae). Las traducciones de lo que cambió de fondo se sacaron para pedirlas de nuevo por
  lotes (portugués: de 5.007 a 4.932 preguntas; inglés: de 3.567 a 3.524). Controles de los bancos: 0 problemas. Los hallazgos quedan en
  `oportunidades/proyectos/senda/revisiones/trivia-p42/`.

### 2f. Prueba de humo en el emulador
- La corrida de la prueba 41 «pasaba» con la app congelada en la bienvenida detrás de un cartel del sistema («Process system isn't
  responding»): todas las capturas eran la misma pantalla. Se instala el emulador explícito, se despejan los carteles, se vuelcan
  gfxinfo/top/meminfo y las fases `[Lany3D]`; la corrida del 01-11 recorrió las cinco pestañas de verdad.

## 3. Decisiones
- **DEC-2026-11-01-1:** la RV1909 de la app lleva la numeración de versículos de hoy (texto intacto). Motivo: todas las citas, las demás
  Biblias de la app y la RVR1960 de la gente usan esa numeración; con la vieja, 16 versículos quedaban vacíos y las citas caían en otro
  versículo. Reversible (el script es reproducible).
- **DEC-2026-11-01-2:** por el consumo del plan (el fundador al 90 % de la semana), los seis revisores de las 331 dudas de lecciones se
  frenaron antes de escribir: las dudas quedan preparadas (abajo) para la próxima sesión.

## 4. Lo que queda (en orden) y lo que es del fundador
1. **Probar el APK 42** (compilación lanzada el 01-11 ~03:05 UTC con `publicar=true`): mirar primero si anda rápido y si Lany se ve en
   3D en Inicio, el Espadeo y la Travesía; de noche, dormida con los ojos cerrados.
2. **Las 331 dudas de la segunda lectura de las lecciones**: el archivo está en `revisiones/2026-10-31-segunda-lectura-lecciones.json`
   (cada duda con dónde, motivo y arreglo propuesto); el plan es seis revisores que decidan «aplicar» o «no» contra la RV1909 y un
   script con `parche.py` que lo aplique en contenido, script de autor y traducción.
3. **Volver a traducir** las preguntas corregidas (portugués 75 datos + las de enunciado/opciones; inglés 43 + ídem) y el inglés del
   banco 41: por lotes, cuando se lea el consumo real de los créditos en la consola de Anthropic (~USD 185 de 200 estimados).
4. **UX de los juegos a fondo** (pedido textual: «absolutamente de la mejor forma posible»): se revisaron Espadeo, ¿Quién es?, Nombres
   por letra, Trivia de la iglesia, Álbum y Planes en la vista previa; faltan En la frente, Vivir la historia y Antes o después con el
   mismo detalle, y el recorrido entero con letra grande en los tres idiomas.
5. Del capítulo 67: Lany Master v2 (ropa por área, clips propios, caminar por la pantalla), temática por área y nivel, torneo con llaves.
6. Del fundador: probar el APK 42 y mandar lo que vea lento; la cuenta de Play (15-11); INPI y abogado de PI; la autorización del
   ministerio; los cuatro pasos de lo social.

## 5. Evidencia
- Commits en `senda-app`: b6ecbcd (sonidos), 653903f (duelos y Trivia de la iglesia), a643f9f (lomo fijo), 0d5be2e y f6bff7c (humo y
  causa raíz WebGL 1), 7ec6023 (Travesía, Espadeo, turno de Lany), 79fc9a8 (46 enunciados), 20afc64 (Planes), d21ba34 (velocidad y
  Álbum), 26039ee, 9f1f9e5, 4a48127, 2b6f762, a32a771 (1 Samuel 24, 2 Crónicas 33), 18fa4a5 (barra de arriba), bc82610 (Biblia con
  numeración de hoy y trivia revisada), 8dcbef2 (Lany dormida, fondo de la barra, carga diferida).
- Prueba de humo: runs 41260529352 (prueba 41, congelada) y 41263649540 (01-11, recorre la app; `[Lany3D] primer cuadro dibujado`).
- Hallazgos de la trivia: `oportunidades/proyectos/senda/revisiones/trivia-p42/hallazgos_01..18.json`.
