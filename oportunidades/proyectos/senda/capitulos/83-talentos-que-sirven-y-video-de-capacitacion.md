# Capítulo 83 — Talentos que sirven y el video de capacitación

**Fecha:** 18-11-2026. **Origen:** después del APK 57, el fundador pidió dos cosas: revisar a fondo en qué se gastan los Talentos
(«VE EXHAUSTIVAMENTE ESTO!») y un video de capacitación que enseñe a usar Senda «entretenido, profesional, que capacite de verdad».

## 1. Lo que pidió

1. **Talentos:** «Revisar si algo mejor para invertir talentos --> quizás estaría bueno que para abrir una travesía nueva necesites
   talentos. O mirás videos o con algún juego conseguís monedas. No quiero que la persona llegue a acumular un montón de talentos y no
   les sirvan para nada.»
2. **Video de capacitación**, con estos pedidos:
   - capacitar, entretener y dar ganas de usar la app, con la interfaz real y solo lo que sale en el lanzamiento;
   - tono alegre, cálido, moderno y juvenil, pero profesional;
   - escenas en casa, al aire libre, en la iglesia y en una mesa, con cosas que salen del teléfono.

   Ajuste del mismo día:
   - las personas, muy poco tiempo en pantalla («para que no se note la IA»);
   - dinámico y entendible a la primera, sin ponerse lento;
   - «capaz no más de 1 minuto, o por ahí… o quizás minuto y medio… definilo vos».

## 2. Talentos (pedido 1)

### 2.1 El problema existía y se midió

**ESTIMACIÓN.** Simulación de 20 semanas, 300 corridas por tipo de usuario (`herramientas/simulacion_talentos.py`). Con las reglas
anteriores:
- un usuario casual usaba ~20 % de lo que ganaba;
- uno regular, ~7 %;
- uno intenso, ~3 %.

Se gastaba casi solo en el álbum (tope de ~1.600 por año) y en el protector de racha.

### 2.2 Las fuentes

- **Benchmark** (`conocimiento/2026-11-18-senda-talentos-benchmark.md`): Duolingo, Khan, Elevate, apps bíblicas, Kakao Page, Clash
  Royale y eCPM de video con premio.
- **Legal** (`conocimiento/2026-11-18-senda-talentos-legal.md`), contra fuentes primarias: Play, Apple 3.1.1 y 3.2.2(x), AdMob,
  Brasil (ECA Digital art. 20 y NT 55/2026), EE. UU., la UE, Chile y Argentina. El mapa regulatorio suma lo nuevo
  (`radar/mapa-regulatorio.md`).

### 2.3 La decisión: la idea del fundador, en su mejor versión (DEC-2026-11-18-1)

| Pieza | Cómo queda |
|---|---|
| Llaves de ruta | Las 15 rutas de entrada están siempre abiertas. Las otras 87, cuando llega su día, se abren con Talentos según su largo: 200, 300, 400 o 600. Abrirla antes de su día cuesta 200 más. |
| Primera llave | De regalo. |
| Terminar una ruta | Devuelve 50: la ruta se paga sola con lo que dan sus lecciones, pruebas y cofres. |
| Ruta empezada | Nunca se traba (lo pide el análisis legal). |
| Video que duplica el cofre | +10 Talentos, hasta 3 por día, solo con el plan gratis. Nunca a menores de 13. Fuera de Latinoamérica y en Chile, solo a mayores de 18, y nunca con la edad sin decir. Nunca dentro de una lección ni en la Biblia. |
| Sobre del álbum | A la vista: dice a quién trae antes de abrirlo. Es la próxima figurita que falta, sin azar. ★ 80, ★★ 120, ★★★ 160; la primera de cada página, gratis. |
| Luz en la práctica | En «Practicar con Lany», una luz más cuesta 20. Nunca en duelos, torneos ni salas. |
| Ganancias | Misión del día: 10. Ganar: 15. Repetir una lección: 5 (antes 15, 20 y lo mismo que la primera vez). |

**Así no → mejor así:**
- **Pagar con Talentos para leer o estudiar, no.** La Biblia, las lecciones de una ruta abierta, los juegos y la comunidad nunca piden
  Talentos.
- **El video que abre una ruta directo, no.** El video solo duplica algo ganado estudiando.
- **El sobre al azar pagado con Talentos de video, no.** Quedaría cerca de la «caja de recompensa» que Brasil prohíbe para
  adolescentes. Con el sobre a la vista no hay discusión.
- **Regalar Talentos, no.** AdMob exige que lo ganado con video sea intransferible.

### 2.4 Lo que se espera

**ESTIMACIÓN**, misma simulación, con los precios nuevos:

| Tipo de usuario | Usa a las 20 semanas | Usa en un año | Veces que tuvo que esperar |
|---|---|---|---|
| Casual | ~94 % | ~64 % | 0 |
| Regular | ~63 % | ~57 % | 0 |
| Intenso | ~68 % | ~83 % | 0 |

El primer borrador (la mitad de estos precios) dejaba a un regular en ~30 %: se duplicaron. Los supuestos de uso son inventados hasta
medir con gente real.

### 2.5 En la app (commit ddfe84c en `senda-app`)

- **Reglas:** `src/util/llaves.ts`, `src/util/videoTalentos.ts`; los precios, en `reglas` de `src/tema.ts`.
- **Pantallas:**
  - la postal de cada ruta muestra el sello de la llave con su precio o «Gratis»;
  - la hoja «¿No quieres esperar?» para abrir antes;
  - «¿Duplicas el cofre?» con dos botones iguales;
  - el álbum dice «El próximo sobre trae a…»;
  - «¡Terminaste la ruta!» con los +50.
- **Textos** en es, pt y en. El ícono de la llave se dibuja con el resto del arte.
- **Interruptores remotos:** `llaves` y `video_talentos` en Supabase (migración `20261205000000`). Apagados, todo vuelve a ser como
  antes, sin otra versión.
- **Métrica:** `talentos_semana` (ganado, gastado y saldo).
- **Pruebas:** `pruebas/arranque/talentos.test.tsx` fija las reglas que no se pueden romper. El arranque pasa 59 de 59.
- **Documento:** `docs/ECONOMIA.md` §5.

### 2.6 Regla de corte

Se apaga `llaves` (o bajan los precios) si pasa cualquiera de estas tres cosas:
- menos gente termina su primera ruta que antes;
- más del 10 % de las reseñas de 1 o 2 estrellas hablan de pagar o de anuncios para avanzar;
- la vuelta semanal cae 2 puntos.

Se mide a los 30, 60 y 90 días. **Metas a 90 días:**
- usar el 60 % o más de lo ganado;
- un saldo mediano que no pase de 30 días de uso.

## 3. Anuncios: el trato por edad nuevo de AdMob (commit 333a6e5)

**HECHO**, del análisis legal:
- Google deprecó TFCD y TFUA; los reemplaza el «trato por edad» (TFAT).
- La librería de la app (react-native-google-mobile-ads 17.4.0) ya lo trae en Android y en iOS.

**Lo que cambió:**
- los de 13 a 17 van como adolescentes (sin personalización, con las protecciones de Google para adolescentes);
- los adultos van sin señal;
- a los menores de 13 no se les piden anuncios (como antes).

## 4. El video de capacitación (pedido 2)

### 4.1 La decisión: 79 segundos

- **Siete bloques:** Tu día, la Biblia, la Travesía, Jugar, Torneos y la Trivia de la iglesia, la sala en vivo y Comunidad, más el
  cierre.
- **El ritmo:** cada toque se ve y cada pantalla dura lo justo para leer un rótulo corto. Quien no entiende algo, pausa.
- **Las personas:** menos de un segundo por plano. Solo marcan el paso entre bloques: la casa, la plaza, la mesa, la escalinata de la
  iglesia, el salón con el proyector, la noche y la sierra.
  - Nunca hablan ni miran a cámara, y nunca se ven de cerca.
  - El proyector dura un poco más (1,7 s) porque lo que se mira es La Pantalla.
- **El formato:**
  - sin locutor (Lany no habla y una voz nueva necesita licencia y OK);
  - se entiende sin sonido;
  - 16:9, 1920 × 1080, 30 cuadros por segundo;
  - textos en «tú».
- **La música:** «Funky Chunk» de Kevin MacLeod (CC BY 4.0), con el crédito al final. El video termina donde termina la canción.

El guion está en `oportunidades/proyectos/senda/campana/capacitacion/guion.md`.

### 4.2 Cómo se hizo

- **La app, real:**
  - grabada cuadro a cuadro en la vista previa web, en modo tienda;
  - con el reloj fijado en el 19-12-2026, el día después del lanzamiento: solo lo que sale ese día;
  - 19 tomas;
  - el dedo se marca con un círculo de luz donde tocó de verdad.
- **Lany a su velocidad real:** el grabador ahora hace avanzar los cuadros de animación con el reloj falso, como en el comercial
  (capítulo 82).
- **Los botones de vidrio que se volvían blancos:** con la placa de video simulada (SwiftShader), el degradé translúcido se iba
  aclarando cuadro a cuadro hasta quedar blanco.
  - Se reprodujo y se comprobó que el estilo no cambiaba.
  - Se grabó todo de nuevo con composición por software (`--disable-gpu`).
  - En el teléfono no pasa.
- **El recuadro negro de Lany:** en la vista previa web, el lienzo de Lany recién creado salía negro unos dos segundos (medido: 9.523
  de 10.165 píxeles negros).
  - Solo pasa en la vista previa web; el teléfono usa el Rive nativo.
  - El grabador lo esconde hasta el primer cuadro bueno.
- **Las personas:** Veo 3.1 (Vertex AI, la prueba gratis de Google Cloud). Adultas y de espaldas o de perfil, revisadas cuadro por
  cuadro: sin cruces, imágenes ni estatuas.
- **La sala en vivo en el proyector:** La Pantalla (`web/pantalla/`) grabada aparte y compuesta sobre la tela del proyector.
- **El montaje:** Remotion, con la composición `Capacitacion`.
  - El teléfono queda fijo a la derecha.
  - A la izquierda, una miga con las cinco pestañas, el título del bloque y el paso del momento en grande; los pasos hechos quedan como
    fichas.
  - Lo importante sale del teléfono y se agranda: el versículo, el mapa de la Travesía y la ruleta.

### 4.3 Dónde está

- `oportunidades/proyectos/senda/campana/senda_capacitacion_16x9.mp4`: 78,7 s, 1920 × 1080, 29 MB, audio a −14 LUFS.
- El código, en `scripts/campana2/` de la app (`capacitacion/`, `remotion/src/Capacitacion.tsx` y `remotion/src/cap/`).
- Al publicarlo en redes: marcarlo como hecho con IA (las personas).

## 5. Herramientas (regla 10)

- 18-11-2026 · Señal de edad de anuncios · **`ageRestrictedTreatment` de react-native-google-mobile-ads 17.4.0** · developers.google.com/admob (targeting)
  · reemplaza a TFCD y TFUA, deprecados · corte: si AdMob muestra menos relleno para adolescentes del que se espera, se revisa con los
  números.
- Video: las mismas herramientas del comercial (Playwright con reloj falso, Veo 3.1, Remotion, ffmpeg); nada nuevo.

## 6. Lo que queda del fundador

1. **Mirar el video** y decir si el ritmo está bien. Se puede acortar o alargar un bloque sin rehacer nada.
2. **Cuando salgan las llaves**, rehacer dos cuestionarios con estas respuestas:
   - el de edad de Play (IARC): «sin ítems al azar»;
   - el de Apple: «Loot boxes: No».

   Si el sobre siguiera al azar, la respuesta cambiaría; con el sobre a la vista, no.

## 7. Riesgos y lo que no se pudo verificar

- **Los números de Talentos son una simulación con supuestos inventados.** La regla de corte y la métrica semanal están para
  corregirlos con datos reales.
- **El video de 10 Talentos depende de que AdMob tenga relleno para el video con premio.** Sin video cargado, la hoja dice «No hay videos
  ahora. Prueba más tarde.» y no suma ni descuenta nada.
- **Las llaves cambian lo que se ve en la Travesía** (sellos de precio en las postales). Falta mirarlo en un teléfono chico y con letra
  grande.

## 8. Pruebas

- Arranque: 59 de 59 (8 de Talentos). Tipos: sin errores.
- Base (`pruebas/nube`): la prueba de los interruptores ahora mira las claves (antes contaba 3); la migración de `llaves` y
  `video_talentos` quedó aplicada en Supabase.
- **APK 57c** (18-11-2026, 131 MB, compilado con el validador y la prueba de arranque en orden):
  https://github.com/juanicarlisi/senda-app/releases/tag/prueba-57c. Trae todo lo del 57 y el 57b más los Talentos y el trato por
  edad nuevo. El iPhone sigue en la 57b; los Talentos le llegan con la próxima compilación.
- Simulación: `SEMANAS=20 python3 herramientas/simulacion_talentos.py` y `SEMANAS=52 …`.
- Video: revisado cuadro a cuadro (hojas de contacto de cada toma y de cada tramo del render) y el audio sin silencios.
