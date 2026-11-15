# Capítulo 70 · Prueba 44: el Espadeo sin cortes, preguntas claras y grupos fáciles

Fecha: 06-11-2026. Pedido del fundador, con siete capturas del APK 43:

> «La pantalla en ocasiones aparece con cuadros que se cortan (ejemplo cuando estamos en la ruleta) · La ruleta a veces aparecen los
> iconos/símbolos invertidos · Hay algunas preguntas que son un tanto extrañas · El escudo y la espada se ven raros en el festejo final ·
> La imagen que aparece en una pregunta es horrible y muy fea. No utilizar ese tipo de imágenes; sí las que sean libres y tengan colores
> […] Caso contrario, quizás algún diagrama, o crear una imagen · Sacar lo que dice si es una curiosidad, el nivel de dificultad de la
> pregunta, etc. · Tiene que ser fácil armar un grupo y agregar un amigo. Puedo estar en grupos donde no todos son mis amigos. (Revisar si
> tendría que haber un tope en el grupo) · Evaluar NBV como predeterminada».

## 1. Qué se hizo (commit 56bc5ad en `senda-app`)

1. **Cortes en el Espadeo.** «Tu armadura» y «Lany va por la suya» ocupaban un tercio de la pantalla y tapaban el borde de la ruleta y
   el cartel de la pregunta. Ahora es un solo marcador de dos columnas (tu armadura | la del rival, con su nombre y la ronda en los
   duelos). Revisado en la vista previa a 360 px: la ruleta entra entera y la pregunta empieza a la vista.
2. **Íconos de la ruleta derechos.** Estaban dibujados dentro de la rueda y giraban con ella (abajo quedaban cabeza abajo). Ahora van
   encima y se contrarrotan: se ven derechos también mientras gira. El séptimo gajo era una corona; ahora es el yunque (la armería),
   como decía la regla de la prueba 23.
3. **Sin etiquetas antes de responder.** Salieron la dificultad (puntos y «Difícil»), «de oro», «Curiosidad» y «Mira la imagen». Las
   curiosidades venían como «¿Sabías que X? ¿Y?», que suena raro y regala la mitad: se muestran «X. ¿Y?» (en español, portugués e
   inglés; `sinSabias` en `src/datos/espadeo.ts`). El aviso de «¡De oro!» queda solo después de acertar, como premio.
4. **Fuera los grabados.** Los 28 grabados de Doré (blanco y negro) salieron de la app (2,2 MB menos). Cuatro preguntas pasan a una
   lámina a color de Senda que muestra la escena sin dudas (José vendido, Noemí y sus nueras, Rut en el campo, Daniel en el foso); las
   otras 24 se retiran porque ninguna lámina las muestra sin confundirse con las otras opciones.
   - Fuente a color evaluada: las ilustraciones de Sweet Publishing (CC BY-SA 3.0) en FreeBibleImages; el buscador del sitio necesita
     JavaScript y Wikimedia Commons responde 429 desde este entorno, así que no se pudieron bajar. Queda como camino para sumar
     imágenes (con su licencia anotada en `docs/LEGAL.md` y sin escenas con Jesús); mientras tanto, láminas propias, mapas y diagramas.
5. **Preguntas raras.** Seis revisores leyeron las 5.343 preguntas vivas buscando lo que un adolescente tropieza: **274 corregidas** y
   **12 retiradas**. Lo más común: palabras viejas de la RV1909 en las opciones («De cascajo» → «De arena»; «alcornoque» → «encina»;
   «oniquinas» → «ónice»; aquilón, majano, zaque, vihuela, talabarte), opciones que también se podían defender y enunciados que
   regalaban la respuesta. Cuando la palabra de hoy es la correcta, «Leer el pasaje» abre la versión libre que la trae (FORZADOS). Un
   revisor anotó un arreglo con el id equivocado; un control cruzado lo encontró y se corrigió antes de guardar. Script:
   `scripts/autor/trivia_revision43.py`, decisiones en `scripts/autor/revision43/`. Las curiosidades se revisan en una segunda pasada.
6. **Grupos fáciles.** La base ya permitía lo que pide: cualquiera crea un grupo, se entra con un código de 6 letras sin ser amigos y
   en un grupo puede haber gente que no es tu amiga. Lo que faltaba era la pantalla: crear un grupo va primero; al crearlo se abre la
   lista de tus amigos para sumarlos; y cualquier miembro (no solo el líder) puede invitar a sus amigos (migración
   `20261123000000_invitar_miembros.sql`, probada en `pruebas/nube`). **Topes (sin cambios):** 1.000 personas por grupo, 30 grupos por
   persona, 5 grupos como líder, 60 invitaciones por vez. INFERENCIA: alcanza para una iglesia grande y frena el abuso; no hace falta
   bajar el tope.
7. **Festejo de la armadura completa.** Con los brazos cruzados, el escudo quedaba torcido sobre el pecho (la cruz parecía una X) y la
   espada cruzada detrás. Ahora Lany queda de pie, con el escudo derecho en el brazo y la espada en la mano, y cierra con la pose
   heroica (revisado cuadro a cuadro en la vista previa).

## 2. La NBV como Biblia predeterminada (evaluación)

HECHOS (06-11-2026, en la app): la NBV de Senda es la Biblica® Open Nueva Biblia Viva (CC BY-SA 4.0), completa (66 libros); ya es la del
versículo del día; fuera del lector, cada pasaje ya se abre en la versión libre que mejor se entiende (PDT o NBV). La Travesía y la
trivia están hechas sobre la RV1909 (citas textuales, huecos y respuestas que se leen igual en la RVR1960, la de las iglesias), y el
glosario de palabras viejas, las palabras entre corchetes y los avisos de «la 1960 dice distinto» son herramientas para leer la RV1909.

- **A favor:** la NBV se entiende a la primera (público de 13+, mucha gente que recién llega); la misión es que la gente lea y conozca la
  Palabra, y la barrera de la RV1909 es real (los revisores encontraron 274 preguntas con palabras que un chico no entiende).
- **En contra:** es una traducción libre, cercana a la paráfrasis: para estudiar palabra por palabra conviene la Reina-Valera; quien va a
  una iglesia escucha la RVR1960 y va a ver otras palabras en los versículos que ya conoce; las herramientas del lector pensadas para
  la RV1909 no aplican.
- **Recomendación:** sí, con dos condiciones: (1) la NBV abre de entrada solo para quien recién instala (quien ya eligió una versión
  la conserva); (2) arriba del lector, a un toque, «NBV · lenguaje de hoy | Reina-Valera», con el nombre siempre a la vista. La Travesía
  y la trivia siguen sobre la RV1909. **Espera el OK del fundador** (cambia algo clave de la experiencia).

## 2b. Dos tropiezos de la infraestructura (resueltos)

- **Supabase CLI 3.0** (salió entre el 01-11 y el 06-11): `db push` pasó a apuntar a la base local por defecto y pide confirmar los
  cambios en producción; la migración de grupos no se aplicaba y el flujo fallaba sin tocar nada. Arreglo: `--remote --yes` y la
  versión de la CLI fija en 3.0.0 (`.github/workflows/supabase.yml`), para que un cambio de la herramienta no frene las migraciones
  sin aviso. La prueba de lo social (`pruebas/nube`, con el paso nuevo de invitar entre miembros) pasó antes de migrar.
- **Dos lotes a la vez**: los lotes de traducción al portugués y al inglés se lanzaron juntos y el del portugués no pudo guardar su
  registro (los dos escribieron la rama `lotes` al mismo tiempo), aunque Anthropic sí lo recibió. Se anotó a mano con su número
  (msgbatch_01M8Ysbejnubo9NeL2pjeoa6) para recibirlo sin pagarlo dos veces. Regla: un lote por vez.

## 3. Lo que queda

1. Recibir e incorporar las traducciones de las 274 preguntas corregidas (lotes enviados el 06-11; ~USD 5 de crédito, ESTIMACIÓN).
2. La segunda pasada de las 725 curiosidades (palabras viejas como cornijales, acémilas, filacterias).
3. Probar el APK 44.
4. Decisión del fundador sobre la NBV (§2).
5. Retraducir las lecciones corregidas en la prueba 43 (capítulo 69 §2).
