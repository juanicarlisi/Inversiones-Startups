# Capítulo 81 — Prueba 56: velocidad, avisos, torneos, la Trivia de la iglesia y la Pantalla

**Fecha:** 15 y 16-11-2026. **Origen:** el fundador probó el APK 55 y mandó diez temas con dos capturas (la imagen rara que
aparece al compartir el enlace de un torneo y el teclado tapando el campo del código en Amigos). Cerró con: «ES CLAVE QUE LOS VEAS
UNO POR UNO Y NO VAYAS RÁPIDO EN NADA… prefiero calidad que velocidad… que la persona que ingresa entienda TODO a la primera».

## 1. Lo que pidió (resumido; el texto entero está en la sesión)

1. **Velocidad:** «Anda LENTÍSIMA la app en general, y la parte de travesías cuando veo todas las opciones en el menú de mapa.
   Invertí todo lo que haya que invertir».
2. **Avisos:** «Sale MUY FEO el logo en la notificación. Y a veces el texto parece muy IA. Investigá a fondo».
3. **Duelos:** «Cuando me desafían, como que tarda en llegar, y en inicio no me permite actualizar».
4. **Teclado:** al escribir, el teclado tapa el campo (en Amigos y «en varios campos»). «Tiene que funcionar perfecto».
5. **Nombres por letra:** todavía hay demora al tomar la voz y con varios nombres seguidos; «Nerón no me lo tomó: corroborá que
   estén todos los nombres de la Biblia».
6. **Torneos:** buscar amigos por alias; subir un PDF, con una corona que diga que es de un plan; unirse con código; un QR; que al
   crear diga el código; la imagen rara del enlace; que termine cuando jugaron todos y quede en el historial; un palmarés visible
   en el perfil, con la categoría del torneo; que «cuándo vence» sea un día específico.
7. **Una pantalla para todos:** «¿no deberíamos incorporar una página… que se vea en una pantalla para todos? Tipo Kahoot… UN
   TOTALMENTE EXHAUSTIVO Y COMPLETO BENCHMARK… sin plagio». Considerar el dominio ministerionuevageneracion.com.
8. **Antes o después:** ver aciertos y errores, y marcar la carta en la que se equivocó.
9. **Pendientes:** «Revisá los BACKLOGS DE TODAS LAS COSAS… que no quede todo recargado y no vea qué le toca».
10. **Grupos:** al hacer líder a alguien que tenía un rol escrito («Guitarra»), seguía diciendo solo «Guitarra».
11. **Trivia de la iglesia:** arriba, dos opciones nomás (crear / participar); el líder sube el PDF y decide el formato (torneo o
    eliminatoria); la persona practica contra Lany, juega el campeonato o desafía a alguien con las preguntas del PDF; el líder
    puede corroborar las preguntas, pero «lo que se crea tiene que estar perfecto».

## 2. Lo que se hizo

### 2.1 Velocidad (pedido 1)

**Método:** primero medir. Se armó un medidor dentro de la app (solo en la compilación de medición) y un recorrido fijo en un
emulador (`scripts/velocidad_emulador.sh`, flujo `velocidad.yml`): arranque en frío, reposo, cambio de pestañas, bajar por la
Travesía, abrir y recorrer el mapa.

**Causas encontradas (HECHO, leído en el código de `react-native-svg` para Android, `SvgView.java`):** cada dibujo SVG se pinta
entero en una imagen del tamaño de la vista. La Travesía tenía:
- la senda como un solo dibujo del alto de toda la ruta (unos 7.220 puntos: del orden de 94 MB de imagen en un teléfono común);
- el camino del mapa como otro dibujo entero (del orden de 40 MB);
- cada paisaje de capítulo como un dibujo de pantalla completa con máscara, y el halo de cada pantalla como otro;
- además, las 1.625 lecciones (10,6 MB de datos) se cargaban al abrir la app.

**Arreglos:**
- la senda y el camino del mapa se dibujan en tiras de 400 puntos y solo las que están cerca de lo que se ve
  (`src/componentes/svgEnTiras.tsx`);
- los paisajes y el halo pasaron a ser imágenes livianas (WebP y PNG, 664 KB en total);
- en el mapa, las regiones que no se ven no se dibujan;
- las lecciones se partieron por ruta y cada una se carga cuando se abre (`scripts/partir_travesia.cjs`).

**Medición:**
- En la vista previa web (HECHO): el tiempo en que la app no responde al abrir bajó de 6,5 a 4,0 segundos (con el procesador
  frenado seis veces).
- En el emulador (HECHO, corridas 43773623697 y 43773944236): la memoria bajó de 468 a 410 MB y lo mandado a disco, de 307 a 237 MB.
  Los tiempos de dibujo dieron casi iguales antes y después: ese emulador dibuja sin placa de video y queda saturado (2 cuadros
  por segundo en cualquier pantalla), así que no sirve para comparar fluidez.
- Lo que esa medición sí mostró: **la app dibuja sin parar aun quieta** (40 a 51 cuadros en 10 segundos de reposo en Inicio; una
  app quieta dibuja casi cero) y el sistema a veces no puede leer la pantalla porque nunca queda quieta.
- Para saber qué pesa se lanzaron tres mediciones que apagan una cosa por vez (todo prendido, sin animaciones que se repiten solas,
  sin Lany animada): ver §2.1.1.

#### 2.1.1 Las tres mediciones que apagan una cosa por vez (16-11-2026)

La misma versión (`d7d1fae`), en tres máquinas de GitHub, el mismo recorrido:

| Corrida | Qué se apagó | Reposo en Inicio (cuadros en 10 s) | Tiempo por cuadro (mediana) | JavaScript sin responder en reposo (de 10 s) | Lecturas de pantalla fallidas |
|---|---|---|---|---|---|
| 43779199399 | nada | 30 y 36 | 60 a 90 ms | 2,4 y 2,8 s | 7 |
| 43779201805 | animaciones que se repiten | 53 y 67 | 77 a 150 ms | 5,1 y 3,5 s | 3 |
| 43779204444 | Lany animada (Rive) | 54 y 53 | 450 ms | 9,4 y 9,8 s | 48 |

**Lectura (HECHO):**
- Las tres corridas no se pueden comparar entre sí. La que tenía todo prendido salió la más rápida y la que tenía a Lany quieta,
  siete veces más lenta: lo que cambió fue la máquina que tocó, no la app. **El emulador gratis de GitHub no sirve para comparar
  variantes** (y tampoco servía el «antes y después» de más arriba: la memoria sí, los tiempos no).
- Lo único que se repite en las tres: **la app sigue dibujando estando quieta**, con las animaciones apagadas y también con Lany
  quieta. Es decir, las dos cosas dibujan (INFERENCIA: cada variante apagó una y quedó la otra).
- En la vista previa web, el perfil de 10 segundos de Inicio en reposo muestra 3,6 s de trabajo, casi todo de Lany (Rive); lo
  demás es mínimo. En el teléfono Rive dibuja fuera del hilo de JavaScript, así que ese número no se traslada.

**Decisión:** no se toca a Lany ni se apagan animaciones a ciegas (Lany es pieza central y no hay un dato que lo justifique).
En su lugar, se mide donde importa, como se hizo con los cierres de la prueba 31:

- **Ajustes → «Medir la velocidad»** (`src/util/velocidad.ts`): la persona lo prende, usa la app un minuto y vuelve; el informe
  se copia solo. Dice el modelo del teléfono, la versión de Android, el ajuste de animaciones y, por pantalla: cuadros por
  segundo del hilo de JavaScript, porcentaje de cuadros lentos, trabas de más de 300 ms y la peor. Se apaga sola a los 3 minutos.
- La app ya tenía «Animaciones: como el teléfono / todas / reducidas» en Ajustes (con «reducidas», Lany queda quieta y los brillos
  no se repiten). Medir con «todas» y con «reducidas» en el mismo teléfono es la comparación que el emulador no pudo dar.

**Regla de corte:** con el informe del fundador en la mano: si con «reducidas» las trabas bajan a menos de la mitad, la prueba 57
pausa a Lany y los brillos cuando la pantalla no se toca hace unos segundos y en las pestañas que no se ven; si no cambian, el
problema es otro y se busca en la pantalla que el informe marque como la peor.

**Límite:** la fluidez real solo se ve en el teléfono del fundador. Es lo primero que hay que leer de la prueba 56.

### 2.2 Avisos (pedido 2) y duelos que llegan (pedido 3)

Investigación completa en `conocimiento/2026-11-15-senda-avisos.md` (guías de Android, Apple y Expo; estudio de Duolingo).

- **Ícono:** el logo entero, achicado a 24 puntos, se empastaba. Se redibujó la S del «Camino en la noche» para ese tamaño (trazo
  grueso, la cruz separada): `scripts/marca/aviso.py`. El mismo dibujo va en el ícono con tema de Android 13.
- **Color:** un solo color para todos los avisos, el violeta de la marca (#6E56F7). Es el único de la paleta que se lee sobre el
  panel claro y sobre el oscuro (contraste 4,8 y 3,5; el ámbar daba 2,0 sobre claro). Es una decisión de marca: si el fundador
  prefiere el ámbar, se cambia en una línea.
- **Textos:** 17 de los 23 avisos de la base se titulaban «Senda» o «Espadeo» (el sistema ya muestra el nombre de la app) y varios
  no decían quién. Ahora cada aviso tiene una clave y sus datos; el texto se arma al mandarlo, en el idioma de cada teléfono: el
  título dice quién o qué (la persona, el torneo, el grupo) y el cuerpo, qué pasó. 37 textos en español, portugués e inglés. Ejemplo:
  antes «Espadeo / Te toca jugar»; ahora «Sofi / Ya jugó. Te toca.».
- **El recordatorio diario** lleva un dato de la persona (dónde sigue su lectura, el versículo del día, la racha desde tres días)
  en lugar de frases hechas, y nunca repite el del día anterior.
- **Por qué tardaban (HECHO, documentación de Expo leída el 15-11-2026):** salían con prioridad «normal», que en Android puede
  demorarse si el teléfono está dormido; y la base los mandaba una vez por minuto. Ahora salen con prioridad alta y en el momento
  en que se crean.
- Un duelo ocupa un solo aviso (el nuevo reemplaza al anterior) y sus avisos se sacan del panel al abrirlo.
- Lo que es para muchos a la vez (torneo nuevo del grupo, alguien entró, quién ganó) espera a las 8 si es de noche para esa
  persona. Lo que una persona le manda a otra llega siempre.
- Tocar un aviso de amigos, grupos o planes abre su pantalla (antes caía en Inicio), también si la app estaba cerrada.
- **Deslizar hacia abajo actualiza** Inicio, Jugar, Comunidad y Torneos.

### 2.3 El teclado (pedido 4)

Herramienta: `react-native-keyboard-controller` 1.21.9 (regla 10). Las 16 pantallas con campos y todas las hojas suben con el
teclado: el campo donde se escribe queda a la vista con 28 puntos de aire. El recorrido del emulador lo comprueba (compara dónde
quedó el campo con dónde empieza el teclado).

### 2.4 Nombres por letra (pedido 5)

- **Demora:** cuando el teléfono tiene el modelo de voz del idioma, el reconocimiento se hace en el teléfono (sin ir a internet).
  Si no lo tiene, aparece «Escucharte más rápido», que lo baja una vez. Un nombre que no puede ser el comienzo de otro se suma
  al instante; los demás esperan 300 ms. Se miran tres interpretaciones de lo que se dijo, no una.
- **Nerón (HECHO):** no está en el texto de la Biblia. Aparecía solo en la nota del final de 2 Timoteo de la edición de 1909
  («…cuando Pablo fue presentado la segunda vez a César Nerón»), que es una nota de los editores, no texto bíblico. Esas notas se
  sacaron de las 14 cartas en la RV1909 y en la Bíblia Livre (`scripts/biblia_arreglos.py`). Si alguien dice «Nerón», el juego
  explica por qué no cuenta (lo mismo con Melchor, Gaspar, Verónica, Dimas, Gestas y Longinos, que vienen de la tradición).

### 2.5 Torneos (pedido 6)

- **Invitar** con una sola entrada: una hoja con el código en grande, el QR (`qrcode-generator` 2.0.4, MIT) y el enlace. Se abre
  sola al crear un torneo con enlace y desde cada torneo propio.
- **Buscar amigos** por alias cuando hay más de cinco; los elegidos quedan primero.
- **«De un PDF»** con la corona, siempre a la vista en la trivia, también entre amigos.
- **«¿Cuándo vence?»** es un día a elección en el calendario, hasta un mes.
- **La imagen del enlace** era la hoja de marca entera. Ahora es una tarjeta de 1200 × 630 con el logo y «Te invitaron a jugar».
  Ya está publicada.
- **Termina cuando jugaron todos** (quien lo armó, los invitados que no dijeron que no y, si es de un grupo, sus miembros). Con
  enlace, solo cuando ya no se puede sumar nadie. Al terminar, cada uno se entera de quién ganó.
- **Historial:** «Terminados» muestra cómo le fue a la persona (puesto y quién ganó) y la tabla a un toque, sin el tope de 7 días.
- **Palmarés** en el perfil: los torneos ganados (de 3 personas o más, o una eliminatoria) con su categoría: Torneo de Senda, Grupo
  tal, Entre amigos. Respeta la vitrina oculta; el nombre del grupo lo ve solo quien es del grupo (dice dónde se congrega alguien).
- **Dos errores encontrados** en los torneos armados con un PDF: quien no era del grupo no recibía las preguntas, y la correcta se
  contaba corrida un lugar. Corregidos en la base y en la app.

### 2.6 La Pantalla (pedido 7)

**Benchmark:** 49 herramientas (Kahoot, Mentimeter, Slido, Quizizz, Blooket, Gimkit, AhaSlides, Jackbox y otras) en
`conocimiento/2026-11-15-senda-benchmark-pantalla-en-vivo.md`: cómo se entra, qué se ve en la pantalla, cómo se puntúa, qué cobran
y qué tienen protegido.

**Lo que se construyó:** una página que **solo muestra** (`web/pantalla/`; hoy en senda-1zw.pages.dev/pantalla). Se abre en la
computadora del proyector y se escribe el código de la sala. Cuatro momentos:
1. la espera: el código gigante, el QR y los apodos que van llegando;
2. la pregunta: el enunciado, las opciones con su letra, la cuenta regresiva y cuántos respondieron;
3. el resultado: cuántos eligieron cada opción, la correcta, «Escrito está» con el versículo y los cinco primeros;
4. el final: podio y tabla.

La respuesta correcta no llega a la página hasta que el anfitrión muestra el resultado (la base no la entrega). Identidad propia:
opciones con letra y posición, sin formas de colores, sin nombres ni música de otros productos. En la sala, el anfitrión tiene
«Mostrar en una pantalla».

**Lo que sigue (del benchmark, para enero):** responder desde el navegador sin instalar; equipos con puntaje promedio; una
pregunta de dos opciones para romper el hielo; la palabra de la semana en una nube aprobada por el líder; las tres preguntas más
difíciles para repasar; puntaje que premie acertar más que la velocidad.

**El dominio:** ver §4.

### 2.7 Trivia de la iglesia (pedido 11)

- **Portada:** dos entradas (Participar / Crear) y «Probar con un ejemplo».
- **Participar:** cada trivia publicada con lo que se puede hacer: jugar el campeonato que armó el líder, practicar contra Lany,
  desafiar a alguien (los dos responden las preguntas de ese PDF) y ver el PDF. Salieron los modos de pasar el teléfono.
- **Crear (líderes):** subir el PDF, revisar y armar el campeonato. El líder corrige cualquier pregunta a mano (el texto, una
  opción, cuál es la correcta) y elige el formato: todos juegan lo mismo, con el día en que vence, o eliminatoria.
- **Para que salga bien de entrada:** después de armar las preguntas, una segunda lectura automática revisa cada una contra el
  sermón (se responde con lo que dice, una sola correcta, la cita corresponde, se entiende sola) y corrige o saca la que no pasa.
- Las mismas preguntas sirven para el campeonato, la práctica, los desafíos y la sala en vivo (y la Pantalla).

### 2.8 Lo demás

- **Antes o después (pedido 8):** arriba, los aciertos y los errores; cada tramo del avance en verde o en rojo; la carta en la
  que la persona se equivocó queda marcada con una cruz roja en la línea.
- **Grupos (pedido 10):** cada miembro muestra su rol y su título juntos («Líder · Guitarra»), con el color del rol.
- **Pendientes (pedido 9):** «Te esperan» se ordena por lo que apura (primero lo que vence en menos de un día, con «Vence en 5
  h»; después lo que alguien pidió; al final, los resultados). Torneos separa «Te toca», «Ya jugaste: faltan los demás»,
  «Próximos» y «Terminados».

## 3. Herramientas (regla 10)

- 15-11-2026 · Teclado · **react-native-keyboard-controller 1.21.9** · github.com/kirillzyusko/react-native-keyboard-controller ·
  MIT · sigue el teclado cuadro por cuadro y trae la lista que sube sola · corte: si en el teléfono un campo queda tapado.
- 15-11-2026 · QR · **qrcode-generator 2.0.4** · npm · MIT · sin dependencias, sirve en la app y en la página · corte: si un
  teléfono no lo lee proyectado.
- 15-11-2026 · Avisos · **expo-notifications 57.0.21** (ya instalada) con el servicio de Expo · docs.expo.dev · MIT · ya trae
  prioridad, reemplazo y agrupado · corte: si hace falta la foto del rival como ícono grande en iPhone.
- 15-11-2026 · Voz · **expo-speech-recognition 57.1.1** (ya instalada), ahora con reconocimiento en el teléfono.

## 4. Lo que queda para decidir (del fundador)

1. **Color de los avisos:** violeta (puesto) o ámbar.
2. **Dirección de la Pantalla.** Hoy: senda-1zw.pages.dev/pantalla. Opciones: (a) `senda.ministerionuevageneracion.com` (gratis,
   el dominio es del fundador; se conecta con un registro en el DNS); (b) un dominio corto propio de Senda (unos USD 10 por año).
   Recomendación: (a) ahora, para llegar al lanzamiento sin gastar, y (b) cuando haya que imprimirlo o decirlo en voz alta.
3. **Tope de la sala gratis:** hoy 10 personas; para un grupo de jóvenes conviene 40.
4. Siguen abiertas: la salida en EE. UU., Brasil y la UE (DEC-2026-11-14-2) y la Gran Copa de Verano (DEC-2026-11-14-1).

## 5. Riesgos y lo que no se pudo verificar

- **La fluidez en el teléfono real** no se pudo medir desde acá: el emulador no sirve para comparar (§2.1.1). Por eso el
  APK 56 trae «Medir la velocidad» en Ajustes.
- **El ícono del aviso** se revisó en la computadora a 24, 36, 48, 72 y 96 píxeles; falta verlo en el teléfono.
- **La Pantalla** se probó en Chromium con una sala simulada y la base, con 9 pasos de prueba; falta una sala de verdad.
- **En una iglesia, todos comparten una conexión:** Supabase limita las cuentas nuevas por dirección (unas 30 por hora por
  defecto). Si 40 personas instalan Senda en la misma reunión, algunas no van a poder crear la cuenta hasta más tarde. Hay que
  subir ese límite en el panel antes del lanzamiento.
- **Los textos en portugués e inglés** de los avisos y de lo nuevo no los leyó un hablante nativo.
- La página del ministerio dice «iPhone en 2027» e «inglés y portugués en 2028»: conviene que el fundador la revise.

## 6. Pruebas

- `pruebas/nube`: de 326 a 387 pasos (avisos, torneos, PDF, la Pantalla), todos bien; se corren antes de tocar la base real.
- Arranque: 42 pruebas. Tipos: sin errores. Validador de contenido: en orden.
- Auditoría de textos: 14 casos nuevos (Trivia de la iglesia, perfil con palmarés y Torneos en tres idiomas). Encontró 13 casos
  cortados con «…» con la letra al 120 % (la cabecera de la Trivia de la iglesia, los torneos terminados, el palmarés y los roles
  del grupo): corregidos. Queda en 120 casos sin hallazgos.
- El manual, con 58 capturas (25 nuevas o rehechas, con región Argentina para que se vea la sala en vivo).
