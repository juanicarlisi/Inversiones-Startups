# Capítulo 88: Prueba 61, «Notas y marcadores», insignias en cadena y Chromecast propio (21-11-2026)

## 1. Lo que pidió el fundador (21-11, con capturas del APK 60)

El fundador pidió pasar todas las correcciones juntas, para armar una sola versión (cada AAB tarda unas 2 horas).

1. **Insignias:** que los días no se abran uno por día. El siguiente se abre al completar el anterior, se pueden hacer todas el mismo día, e Inicio recuerda las que están abiertas (con el texto «recomendado: una por día»).
2. **Trivia:** «Salir» se pisaba con el corazón de las vidas.
3. **Aviso de lectura:** le llegó «seguí leyendo Isaías» por haber abierto Isaías de paso.
4. **Portada de la lección:** en «La historia en una línea», el texto quedaba muy arriba.
5. **Calendario:**
   - En las vistas de 3 días y de semana no aparecían las opciones de siempre.
   - Al elegir «culto», el título quedaba como «planilla.culto» (era la clave sin traducir, «plantilla.culto»).
   - La categoría elegida tiene que quedar como título; si no hay categoría, el título se escribe a mano.
6. **Biblia:**
   - «Feo lo de arriba»: arriba quedan solo «Planes e insignias» y una sección nueva, «Notas y marcadores».
   - Lo que pidió para esa sección: «puede tener un potencial enorme… una de las grandes estrellas y diferenciales de Senda… que no diga cosas de gusto adentro y que me sea en verdad útil».
7. **Calidad:** «Revisá que todo quede funcionando excelente».

A mitad de la sesión trajo el ID de Chromecast que había registrado en la consola de Google Cast (§3).

## 2. Lo hecho (senda-app e1fa43c y 8006365)

- **Notas y marcadores** (`src/pantallas/Cuaderno.tsx`). El benchmark revisó YouVersion, Logos, Olive Tree, Bible Gateway, Hallow, Dwell, Glorify y Readwise/Kindle, con sus fuentes oficiales y reseñas leídas el 21-11.
  - **Lo que más se pide y menos se resuelve:** encontrar lo marcado (buscar, filtrar por libro y por color) y que lo marcado sirva para algo.
  - **Arriba, la única acción llena:** «Guardar en el corazón» (Salmo 119:11).
  - **Después:**
    - «Seguir leyendo», con dónde quedaste y las cintas;
    - el buscador;
    - los filtros Todo, Notas, Colores y Memoria;
    - los colores con el nombre que les pone cada persona (por ejemplo, «Amarillo = promesas»), sin carpetas ni etiquetas;
    - el orden por fecha reciente o por libro.
  - **Cada versículo** muestra su texto en tu versión, tu color y tu nota. Al tocarlo se abre la Biblia en ese versículo.
  - **«Compartir todo como texto»:** sirve de copia para guardar.
  - **Errores que evita, según el benchmark:**
    - la lista sin buscador de YouVersion;
    - los colores sin significado;
    - las marcas atadas a una versión;
    - no tener copia;
    - los resaltados públicos de entrada.
  - **Privacidad:** todo queda en el teléfono.
- **Guardar en el corazón** (`src/pantallas/Memoria.tsx`, `src/datos/memoria.ts`, `src/estado/cuaderno.ts`): es el diferencial.
  - Los versículos que la persona elige aprender vuelven con repetición espaciada: las mismas cajas de Leitner del repaso, a 1, 3, 7, 16 y 35 días.
  - **El ejercicio:** es la Biblia misma con huecos. Se arma tocando las palabras que faltan, en orden, desde un banco.
  - **Dificultad:** a mayor caja, más huecos (de un tercio de las palabras con contenido hasta el versículo entero, con un tope de 12).
  - **Resultado:** con uno o ningún error, sube de caja; si no, vuelve mañana.
  - **Sin puntos ni vidas.** Lany acompaña sin hablar.
  - **Desde el lector:** se agregan con «Memorizar», en la fila de los resaltadores.
  - **Cambio de datos:** las marcas y las notas guardan ahora su fecha, para mostrar lo reciente. Lo marcado antes de este cambio queda como «Antes».
- **Insignias en cadena** (`src/estado/insignias.ts`):
  - Empezada la insignia (y, en las que tienen fecha, llegado su primer día), cada día abre al completar el anterior.
  - El recordatorio diario apunta al primer día que falta.
  - Inicio suma «Tienes otra insignia con un día abierto».
  - En la insignia se lee «Recomendado: uno por día».
- **«Seguí leyendo» solo si leíste** (`Lector.tsx`): abrir un capítulo cuenta como lectura si la persona lo recorre con el dedo, lo escucha o se queda 20 segundos.
- **Calendario** (`Evento.tsx`):
  - Los eventos de siempre aparecen en el paso del título, desde cualquier vista.
  - Elegir uno pone su nombre traducido como título, que se puede editar, junto con su hora y su repetición. Antes el título quedaba como la clave cruda «plantilla.culto».
  - Sin teclado de entrada, para que las opciones se vean.
- **Portada de la lección** (`lineaTiempo.tsx`): el párrafo de la fuente de las fechas quedaba arriba de la historia. Ahora es una línea chica («Fechas aproximadas · ver la fuente») y se abre a un toque.
- **Trivia:** durante la partida no va la cara del perfil. «Salir» va primero y, en teléfonos angostos o con letra grande, queda solo la cruz.
- **Textos cortados:** la auditoría (`--solo pantallas`, en los tres idiomas y con letra 1 y 1,2) encontró 24, todos de la tarjeta de la insignia de Navidad, que aparece desde hoy, y de «Entrar a uno» en Torneos. En la tarjeta, el botón de la propuesta pasó debajo del texto. Después del arreglo, 0.

## 3. Chromecast con el receptor propio

- **Registro:** Application ID **DB9D6987**, receptor `https://senda.ministerionuevageneracion.com/tele/`, registrado por el fundador el 21-11.
- **En la app:** está en `app.json`. El prebuild lo lleva a la meta-data de Cast en Android y a `_DB9D6987._googlecast._tcp` en iOS.
- **Prueba nueva:** falla si vuelve el ID de prueba de Google.
- **Dónde va:** en el APK 61, el AAB 1.0.7 y TestFlight 1.0.7.
- **Por qué importa el AAB:** es el primero que sube a la prueba cerrada. Así los testers tienen la tele durante los 14 días.
- **Prueba en la tele:** la hace el fundador. Espadeo → botón de la tele → se tiene que ver la pregunta en grande.

## 4. Controles antes de armar

- tsc sin errores.
- Pruebas: 93 de 93. Entre las nuevas:
  - la cadena de días de las insignias;
  - la memoria (huecos, cajas, fechas);
  - el ID de Cast.
- Validador: «Todo en orden».
- Auditoría de textos: 0.
- Vista previa recorrida a 360 px:
  - Biblia;
  - Notas y marcadores, con datos de ejemplo;
  - el repaso de memoria de punta a punta (acierto y error, con las cajas guardadas);
  - el evento nuevo con sus opciones;
  - la portada de «La historia en una línea»;
  - Inicio.

## 5. Lo que queda

Siguen pendientes los temas que el fundador pidió el 21-11 a la mañana:

- el progreso de la Travesía al salir y volver;
- el desmayo de Lany;
- la música funk;
- los anuncios en ministerionuevageneracion.com.

**Ideas del benchmark para una próxima vuelta:**

- «Hace un año marcaste…» en Inicio;
- un aviso cuando una lección o el versículo del día cita un versículo que tiene una nota tuya;
- un camino «Mis versículos» en el Espadeo, con preguntas ya validadas.
