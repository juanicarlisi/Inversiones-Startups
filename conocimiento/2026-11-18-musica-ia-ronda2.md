# Música con IA, ronda 2: más semillas, curaduría con evaluador como filtro y la segunda escucha a ciegas

*Bitácora de prueba, 17 y 18-11-2026. Autor: constructor. Proyectos: P9 Remanso y P8 Sobremesa (`oportunidades/proyectos/musica/
plan-canales.md`). Pedido: subir la calidad por encima de la ronda 1 sin gastar (decisión del fundador: todo gratis por ahora; Lyria
3.5 preparada y sin correr). El trabajo se cortó por un reinicio de la máquina y se retomó el 18-11.*

> Marcas: **HECHO** (medido hoy, con fuente), **ESTIMACIÓN** (con método), **INFERENCIA** (razonamiento propio), **HIPÓTESIS** (a
> validar). **Claude no puede escuchar.** Todo lo de este documento sale de mediciones, espectrogramas y modelos de evaluación; la nota
> la pone el fundador en la página a ciegas.

---

## 0. En una página

- **Se generaron 126 clips de 75 s con Stable Audio 3 Medium en la CPU de Claude (HECHO):** 9 estilos × 14 (4 formas de pedir × 2
  semillas, más 6 semillas de la forma que eligió el evaluador). 3,6 horas de máquina, USD 0.
- **El evaluador automático no sirve para elegir (HECHO, con la ronda 1):** en la pareja que importa (piano compuesto nota por nota,
  nota 3, contra el piano de Stable Audio 3, nota 5) todas sus medidas se equivocan; la «calidad de producción» acierta 2 de 5 parejas.
  Se usó **solo para descartar** lo roto y para elegir el tramo de 45 s dentro de cada clip.
- **La postproducción de limpieza empeoraba (HECHO, espectrogramas):** dejaba un escalón en 5 kHz y franjas oscuras en el agudo. Todo va
  **crudo con solo nivelación**; la imagen estéreo se toca solo cuando la correlación L/R es negativa.
- **La revisión a ojo de los espectrogramas sacó dos clips que el evaluador ponía arriba** (parciales metálicos, un silbido en 15,6
  kHz) y mostró un patrón: la forma con guía alta (cfg 3 y lista negativa) trae más artefactos y tarda 25 % más.
- **Página de la segunda escucha (lista, sin publicar):** 5 grupos, 3 candidatos por estilo (uno por forma de pedir, para que el voto
  diga también qué forma conviene) y el mejor clip de la ronda 1 escondido en piano y en café, para medir si subimos. Votos en `votos2`.
- **Recomendación franca (INFERENCIA):** con Stable Audio 3 Medium el techo realista es 7. Para llegar a 8 hace falta un generador
  mejor (Lyria 3.5: una ronda igual a esta cuesta **USD 2,88 a 4,32**; producir cuesta ~USD 3 a 5 por hora terminada) y temas enteros de
  2-3 minutos con forma, no tramos de 45 s. Primero se leen los votos de esta ronda (§7).

## 1. Qué se generó (HECHO)

| | |
|---|---|
| Modelo | Stable Audio 3 Medium (int8, TFLite) + decodificador SAME-L (el «de calidad»: el piano C de la ronda 1, nota 5, salió con ese; el B, nota 2, con el rápido) |
| Máquina | Contenedor de Claude Code, 4 núcleos, sin GPU |
| Estilos (9) | piano para orar, piano con cuerdas suaves, dormir, bossa, jazz de café, flamenco tranquilo, guitarra española sola, rumba suave, tango lounge |
| Formas de pedir (4) | **T** etiquetas de catálogo (AudioSparx, con lo que se entrenó el modelo) + descripción concreta; **N** descripción narrativa larga; **C** pedido corto (como la ronda 1); **TG** = T con guía cfg 3 y lista negativa |
| Etapa 1 | 4 formas × 2 semillas × 9 estilos = 72 clips |
| Etapa 2 | 6 semillas más de la forma que el evaluador puso arriba en cada estilo (C en piano solo, bossa y jazz; N en piano con cuerdas, flamenco, rumba y tango; T en dormir y guitarra) = 54 clips |
| Tiempo | 98 s por clip con cfg 1 (108 clips) y 124 s con guía (18 clips), con el evaluador corriendo a la par; 3,6 h en total para 2,6 h de audio. Solo, sin nada al lado, ~45 s por clip |
| Prompts | `herramientas/musica/ronda2_prompts.py`; sin nombres de artistas ni de temas |

## 2. La calibración del evaluador contra el oído del fundador (HECHO)

Evaluadores: Audiobox Aesthetics de Meta (PQ calidad de producción, CE disfrute, CU utilidad; 1 a 10) y CLAP (laion/clap-htsat-unfused)
para el estilo. Se pasaron los seis clips de la ronda 1 y se compararon con las notas del fundador (17-11-2026).

| Clip de la ronda 1 | Nota del fundador | PQ | CE | CU | Puntaje (0,4 CE + 0,4 PQ + 0,2 CU) |
|---|---|---|---|---|---|
| A, piano compuesto por Claude | **3** | **7,93** (el mejor de los pianos) | 7,70 | 7,87 | **7,83** (el mejor) |
| B, piano Stable Audio 3, decodificador rápido | 2 | 7,33 | 6,77 | 7,73 | 7,19 |
| C, piano Stable Audio 3, decodificador de calidad | **5** | 7,68 | 7,10 | 7,78 | 7,47 |
| D, bossa compuesta por Claude | **4** | **8,26** (el mejor del café) | 7,82 | 8,30 | 8,09 |
| E, bossa Stable Audio 3 | 6 | 8,22 | 8,29 | 8,38 | 8,28 |
| F, tango lounge Stable Audio 3 | 6 | 8,25 | 8,04 | 8,27 | 8,17 |

- Parejas dentro de cada familia en las que el evaluador ordena igual que el fundador: **PQ 2 de 5, CU 3 de 5, CE 4 de 5, puntaje 4 de 5.**
  Con 5 parejas, acertar 4 por azar pasa 19 % de las veces: no hay evidencia de que sirva.
- **El error es justo el que importa:** las cuatro medidas ponen el piano compuesto (3) por encima del mejor generado (5). El
  evaluador premia el sonido limpio del MIDI que el fundador oye como «máquina».
- **Se probó un detector de «suena a MIDI» con CLAP (HECHO):** tres pares de textos («grabación en vivo» contra «MIDI con instrumentos
  virtuales», «interpretación humana» contra «secuenciado», «estudio profesional» contra «demo amateur»). En café separa (E y F por
  encima de D), en piano da al revés (A, el compuesto, arriba). No se usa.
- **Consecuencia (INFERENCIA):** esta ronda tiene solo clips del generador, así que el error típico (MIDI) no aparece, pero 6 clips no
  alcanzan para confiar en el orden entre clips del mismo generador. Regla: el evaluador **descarta**, el fundador **elige**.

## 3. Cómo se curó (HECHO; `ronda2_elegir.py`, `seleccion_r2_informe.json` con el motivo de cada descarte)

**Descartes** (solo lo roto o flojo de verdad): CLAP no reconoce el estilo o lo oye como voz, electrónica o ruido; mono puro
(correlación L/R ≥ 0,99); fase invertida (correlación < -0,3: suena hueco y se cae en un parlante de teléfono); flojo a más de 1,5
desvíos de su estilo; todos los tramos de 45 s con una ventana de 10 s rota (calidad 0,6 o más debajo del promedio del clip).

| Estilo | Quedaron | Descartados y por qué |
|---|---|---|
| Piano para orar | 11 de 14 | 2 flojos y 1 por la revisión a ojo (§4) |
| Piano con cuerdas | 13 de 14 | 1 flojo |
| Dormir | 8 de 14 | 4 con fase invertida (uno además con todos los tramos rotos), 2 flojos |
| Bossa | 13 de 14 | 1 flojo |
| Jazz de café | 12 de 14 | 2 flojos |
| Flamenco | 13 de 14 | 1 flojo |
| Guitarra española | 11 de 14 | 3 en mono puro (la forma corta da guitarra mono: correlación 1,00) |
| Rumba | 13 de 14 | 1 flojo |
| Tango | 13 de 14 | 1 por la revisión a ojo (§4) |

**Elección de los 3 por estilo:** uno por forma de pedir (primero la forma de la etapa 2), así el voto también dice qué forma
conviene. Dentro de cada forma, en este orden: que CLAP lo reconozca como su estilo; que tenga un tramo sin cortes de silencio;
que se parezca a lo que el fundador prefirió en la ronda 1 (similitud CLAP con el piano C, nota 5, o la bossa E y el tango F, nota
6). En dormir y en lo español no hay referencia (comparar flamenco con la bossa lo empujaría a sonar a bossa): desempata la
estabilidad (la peor ventana más alta).

**Tramo de 45 s:** de los inicios 0, 10, 20 y 30 s, los sanos y sin cortes; entre ellos, el de mejores ventanas del evaluador, solo si
le gana al primero por más de 0,15 (uso permitido: comparar partes del mismo clip).

**Cuatro intentos antes de esta regla (aprendizaje):**
1. Con «saltos de timbre» (distancia CLAP entre bloques de 10 s seguidos) y «huecos» como descarte, se iban 11 de 14 tangos, justo los
   que CLAP reconoce como tango: el tango cambia de sección y frena en seco a propósito. Los saltos no tienen validación: quedaron como
   dato.
2. Los «huecos» (caídas de 30 dB) son casi siempre cortes musicales: en la rumba aparecen cada ~17,6 s (8 compases a 108 BPM) y en el
   mismo segundo con dos semillas del mismo pedido. Pero son 0,4 s de silencio digital, sin cola de sala; con la estabilidad como
   desempate salían las tres rumbas con cortes. Ahora pesan para elegir, no descartan.
3. Sin mirar el reconocimiento de estilo, los tres tangos elegidos sonaban, para CLAP, a jazz o a flamenco (sin bandoneón a la vista).
4. «Tramo limpio» exigía también no contener el salto de timbre mayor del clip; todo clip tiene uno, aunque sea chico (0,086 en un
   tango), y eso dejaba afuera clips sanos. Ahora el salto mayor solo decide entre tramos sin cortes.

## 4. Postproducción: crudo con solo nivelación (HECHO)

Se probaron cuatro versiones del mismo tramo (`ronda2_post.py`): v0 recorte, fundidos y master; v1 + limpieza (pasa-altos, notch de
«silbidos» agudos y reducción de soplido por encima de 5 kHz); v2 + EQ e imagen estéreo; v3 + compresión paralela y sala por
convolución. El 17-11 la regla era «entra si sube el puntaje»: subía entre 0,01 y 0,07, dentro del ruido.

**El espectrograma lo resolvió (18-11):** v1 deja un escalón duro en 5 kHz en los pasajes suaves (se apaga el aire del piano y de los
pads) y los notch, varios juntos entre 11 y 21 kHz, abren franjas oscuras que en el crudo no había; los «silbidos» detectados no se
ven como líneas en el crudo. Es decir: el evaluador puntuaba apenas mejor una versión con artefactos nuevos. v2 y v3 se apoyan en v1.

Regla nueva (`ronda2_curar.elegir_version`): **v0 siempre**, salvo **v4** (solo imagen estéreo sobre el crudo: graves en mono y
lados al 75 %) cuando la correlación L/R es negativa, si v4 la sube, no agrega chasquidos ni huecos y la peor ventana no baja más de 0,2.
La sala de v3 nunca: el generador ya trae la suya.

Resultado en los 27 elegidos: **23 crudos (v0) y 4 con la imagen estéreo corregida (v4)**: dos de dormir (correlación -0,17 y
-0,19 pasan a +0,27 y +0,31; la pérdida al sumar a mono baja de -3,8 a -2,0 dB) y dos pianos con cuerdas (-0,03 y -0,06 pasan a +0,32
y +0,28). Primero la regla vetaba v4 si la peor ventana del evaluador bajaba más de 0,05; bajaba
0,05 a 0,10, que es su propio ruido: se subió a 0,2 (`--redecidir` aplica la regla de nuevo sin volver a medir).

**Revisión a ojo de los 27 espectrogramas (HECHO; `excluir_ojo.json`, pasado a `ronda2_elegir.py --excluir`):**
- Fuera el piano para orar TG semilla 202: parciales agudos (5 a 12 kHz) que ondulan por encima de los armónicos del piano, en tres
  tramos. Metálico o un instrumento que no se pidió. **El evaluador le había dado la mejor calidad de su forma (PQ 7,78).**
- Fuera el tango TG semilla 202: una banda fija en 15,6 kHz, 7 dB sobre las vecinas y a -35 dB del total (silbido del decodificador).
- **Patrón (HECHO en esta muestra, chica):** la banda de 15,6 kHz aparece solo con la forma TG (guía cfg 3 y lista negativa): en 3 de
  los 8 TG medidos (7,4 dB sobre las vecinas en el tango, 4,9 en el piano con cuerdas, 4,0 en dormir) y en ninguno de los 23 de las
  otras formas (de -2,4 a +2,8 dB). Junto con los parciales metálicos,
  **la guía alta trae más artefactos y cuesta 25 % más de tiempo.** Las líneas finas que sí se ven (dormir T 505, tango T 101) quedan a
  -54 a -72 dB del total: inaudibles para casi todos.
- Quedan con un cambio brusco de textura que puede ser música o costura (no se puede saber sin oído): la bossa C 404 en el segundo 25
  (entra un ruido de banda ancha, probablemente las escobillas) y el tango N 505 en el 33-35 (baja el agudo, frena y entra otra
  sección).

Master de todos: -14 LUFS integrados, pico real -1 dBTP con limitador con anticipación. El limitador trabaja poco en casi todos
(menos de 2 dB y menos de 1 % del tiempo), salvo cinco: flamenco T 202 (hasta 6,4 dB), piano para orar N 101 (5,7 dB, 4,9 % del
tiempo por encima de 1 dB), flamenco N 202 (5,5), jazz T 202 (5,3) y piano con cuerdas T 202 (4,1). Es el precio de llevar un piano
suave a -14 LUFS con -1 dBTP; puede aplanar algún ataque.

## 5. La página de la segunda escucha (HECHO; sin publicar)

- **Dónde:** `/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/escucha2/index.html` y `audio/`; la
  correspondencia (letra → clip, prompt, semilla, tramo, postproducción, loudness) en `escucha2/correspondencia.json`, **que no se sube
  con la página**. Armada con `ronda2_pagina.py` sobre la de la ronda 1; probada en el visor (carga, notas, favoritos, revelar).
- **Grupos y clips (29):** Piano para orar 7 (3 de piano solo, 3 con cuerdas y el piano C de la ronda 1, nota 5); Dormir 3; Café 7 (3
  bossa, 3 jazz y la bossa E de la ronda 1, nota 6); Española 9 (3 flamenco, 3 guitarra sola, 3 rumba); Tango 3. Orden barajado con
  semilla fija; letras de la G a la Z, distintas dentro de cada grupo (no repiten las A-F de la ronda 1). El texto de «de dónde sale»
  se muestra solo cuando el fundador lo pide.
- **Volumen y peso:** todos -14,1 a -14,2 LUFS medidos en el MP3 (pedido: -14 ± 0,3), 45,0 s, MP3 224 kbps (la ronda 1 usó 192):
  **36,6 MB** en total (tope 40). Los dos clips de la ronda 1 salen de su MP3 de 192 kbps decodificado y llevado de -14,5 a -14,0 LUFS:
  pasan por una segunda codificación y quedan 0,5 dB más fuertes que en la ronda 1.
- **Votos:** colección `votos2` de la base del artefacto (la ronda 1 sigue en `votos`): `votos2/<clip>` con `nota` (1-10) e `ia`
  (Sí, Un poco, No), `votos2/favorito-<grupo>` y `votos2/comentario`.
- **Qué se mide:** (1) si algún estilo pasa de 7; (2) si los nuevos le ganan a los dos clips de la ronda 1 escondidos (mismo oído, mismo
  día); (3) qué forma de pedir prefiere (T, N, C, TG) en cada estilo.

| Grupo | Letra | Clip | Tramo | Post |
|---|---|---|---|---|
| Piano para orar | P | ronda 1, piano C (nota 5) | — | — |
| Piano para orar | Z | piano solo, pedido corto, semilla 707 | 0 s | crudo |
| Piano para orar | N | piano solo, etiquetas, 101 | 20 s | crudo |
| Piano para orar | T | piano solo, narrativo, 101 | 20 s | crudo |
| Piano para orar | S | piano con cuerdas, narrativo, 808 | 0 s | crudo |
| Piano para orar | U | piano con cuerdas, etiquetas, 202 | 20 s | imagen |
| Piano para orar | V | piano con cuerdas, etiquetas + guía, 202 | 0 s | imagen |
| Dormir | H | etiquetas, 505 | 10 s | imagen |
| Dormir | G | corto, 101 | 0 s | crudo |
| Dormir | P | etiquetas + guía, 101 | 0 s | imagen |
| Café | J | ronda 1, bossa E (nota 6) | — | — |
| Café | R / K / V | bossa: corto 404, etiquetas 101, etiquetas + guía 101 | 0 s | crudo |
| Café | Y / U / N | jazz: corto 202, narrativo 202, etiquetas 202 | 0 s | crudo |
| Española | T / Z / L | flamenco: narrativo 202, etiquetas 202, corto 101 | 0 s | crudo |
| Española | G / Y / U | guitarra sola: etiquetas 101, etiquetas + guía 101, narrativo 101 | 0, 0, 10 s | crudo |
| Española | X / H / M | rumba: narrativo 202, corto 202, etiquetas + guía 202 | 0, 20, 0 s | crudo |
| Tango | L / Q / U | narrativo 505, etiquetas 101, etiquetas + guía 101 | 0, 30, 0 s | crudo |

## 6. Licencias

| Pieza | Licencia | Qué pide |
|---|---|---|
| Stable Audio 3 Medium (pesos y código) | Stability AI Community License | Gratis con ingresos anuales menores a USD 1 M; **para uso comercial hay que registrarse** (gratis) en Stability. «Sos dueño de lo generado». Entrenado con datos con licencia. El registro lo hace el fundador antes de monetizar (regla 8: es una cuenta a su nombre) |
| Audiobox Aesthetics (Meta) | CC BY 4.0 | Solo se usó para filtrar; nada entra al audio |
| CLAP laion/clap-htsat-unfused | Apache 2.0 | Ídem |
| noisereduce, pedalboard, pyloudnorm, ffmpeg + LAME | MIT, GPL-3, MIT, LGPL/GPL | Herramientas: no imponen licencia al audio |
| Música resultante | Sin autor humano protegible (Oficina de Derechos de Autor de EE. UU., ene-2025) | No va a Content ID; se guarda la procedencia (prompt, semilla, modelo) en `correspondencia.json` y en el manifiesto |

## 7. Recomendación franca para llegar a 8 (INFERENCIA salvo donde dice HECHO)

1. **Qué esperar de esta ronda:** subir de 5-6 a 6-7. Se cambió la elección (más semillas, descarte de lo roto, variedad) y no el
   generador. En el ranking a ciegas de Artificial Analysis (HECHO, leído el 17-11) Stable Audio 3 Medium tiene 996 puntos, Lyria 3.5
   1078 y Suno 1148: 82 puntos de diferencia equivalen a que la gente prefiera Lyria en ~62 % de las comparaciones (ESTIMACIÓN con
   la fórmula Elo). No es un salto de 6 a 8 por
   sí solo, pero la ronda 1 dejó claro que el generador manda (el generador le ganó a la composición nota por nota).
2. **Lo que falta para 8 no es solo el generador:** son temas enteros de 2-3 minutos con forma (entrada, desarrollo, final), no tramos de
   45 s de un clip de 75 s; un canal de YouTube se escucha de corrido. Stable Audio 3 Medium admite hasta 6:20 por pedido (no probado en esta CPU)
   y no deja marcar la forma; Lyria 3.5 acepta la estructura con marcas de tiempo en el texto (`lyria.py` ya la pide).
3. **Ronda con Lyria 3.5 (sin correr; decisión del fundador):** precio leído hoy en aistudio.google.com/docs/pricing (HECHO,
   18-11-2026): **USD 0,08 por tema, sin capa gratis.** La misma ronda que esta (9 estilos × 4 tomas) cuesta **USD 2,88**; con 6 tomas
   por estilo para elegir 3, **USD 4,32**. Producir: un tema de ~2,5 min cuesta USD 0,08, 24 temas por hora ≈ USD 1,9; con la mitad
   descartada en la curaduría, **~USD 3,8 por hora terminada** (ESTIMACIÓN). Hace falta proyecto de Google AI Studio con facturación,
   clave en `GEMINI_API_KEY` y tope de gasto (lo hace el fundador). Todo lleva SynthID.
4. **Camino gratis que queda por probar (HIPÓTESIS):** ACE-Step 1.5 (licencia MIT, datos con licencia según sus autores, sin prueba
   independiente de calidad). La versión base podría correr en esta CPU; la XL pide GPU. Vale una tarde de prueba si los votos dejan
   todo por debajo de 7.
5. **Regla de corte propuesta:** si en esta ronda algún estilo llega a 7 o más con el fundador, ese estilo sigue con Stable Audio 3 y se
   pasa a temas largos con la forma de pedir que ganó. Si ningún clip pasa de 6, o si los clips de la ronda 1 escondidos sacan lo mismo
   que los nuevos, la curaduría sola no alcanza: se pide el OK para la ronda de Lyria 3.5 (USD ~4,32) con los mismos estilos y la misma
   página.

## 8. Qué no convence (franco)

- **La elección dentro de lo sano es casi a ciegas.** Sin oído, de 11 a 14 clips vivos por estilo se eligen 3 por variedad y parecido
  con lo que gustó; eso asegura aprendizaje (qué forma de pedir conviene), no que sean los mejores. Puede haber un 8 entre los descartados
  por desempate.
- **Tango:** solo 8 de 14 tienen un tramo de 45 s sin cortes de silencio (la rumba, 10); el de etiquetas (Q) los tiene y el narrativo (L) frena y cambia de
  sección en el segundo 33-35. El de guía (U) CLAP lo oye más como flamenco que como tango. Ninguno de los tres es un tango lounge
  «de manual» por las medidas.
- **Imagen estéreo:** dos de los tres pianos solos tienen correlación L/R cercana a 0 (muy abiertos, pierden ~3 dB en mono) y la bossa y
  la guitarra quedan casi mono (0,88 a 0,99): ninguno suena a una toma estéreo natural. Solo se corrigió lo negativo.
- **Limitador:** cinco clips piden entre 4 y 6,4 dB de limitación para llegar a -14 LUFS; en el piano para orar N 101 puede notarse en
  los ataques. Se respetó el pedido de mismo volumen para todos.
- **Las referencias de la ronda 1** pasan por una segunda codificación MP3 y suben 0,5 dB respecto de lo que el fundador escuchó; el piano
  de la ronda 1 quedó primero en su grupo por sorteo y puede reconocerlo.
- **Son 29 clips (22 minutos).** Es mucho para una sentada; la página dice que empiece por lo que más le importa, pero los grupos con
  menos votos van a decir menos.
- **El evaluador sigue en la cadena** (descartes, tramo, la guardia de v4) aunque no esté validado; en esta ronda descartó 10 de 126 por
  flojos (y uno más por tramos rotos, que ya caía por fase), y uno de los que dejó pasar con nota alta tenía artefactos que se vieron a
  ojo. En total quedaron afuera 19 de 126: 10 flojos, 4 con fase invertida, 3 en mono puro y 2 por la revisión a ojo.
- **No se pudo escuchar nada.** Todo lo de arriba es señal y espectrograma.

## 9. Cómo correrlo y cómo apagarlo

Pasos y tiempos en `herramientas/musica/README.md` (sección «Ronda 2»). Archivos de trabajo (no van al repositorio): `$R2_DIR/gen/`
(clips y manifiesto), `puntajes.jsonl`, `medidas_elegir.json`, `seleccion_r2.json` y su informe, `curado/curado_r2.jsonl`, `curado/png/`
(espectrogramas) y la página en `escucha2/`. **Como el scratchpad se borra al reiniciar**, la página (sin audio) y los datos para leer
los votos (correspondencia, selección con motivos, revisión a ojo, curado, puntajes y manifiesto con prompts y semillas) quedaron
también en `informes/escucha-musica-2/`. **Apagar:** no queda nada corriendo; borrar `$R2_DIR`, `scratchpad/sa3` (2,4 GB) y los
pesos en `~/.cache/huggingface`.
