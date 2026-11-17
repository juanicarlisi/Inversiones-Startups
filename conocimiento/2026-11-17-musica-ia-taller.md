# Taller de música por código: ¿qué calidad se alcanza sin GPU y sin pagar?

*Bitácora de prueba, 17-11-2026. Autor: constructor. Proyectos: P9 Remanso (serie «Aguas de Reposo») y P8 Sobremesa.
Pedido: probar la vía que corre en el entorno de Claude Code (Claude compone en código y renderiza con muestras reales) y medir
la calidad de verdad. Otros dos agentes cubren los generadores de música con IA y el mercado.*

> Marcas: **HECHO** (medido o verificado hoy, con fuente), **CONOCIDO** (dato estable no re-verificado hoy), **ESTIMACIÓN** (con
> método), **INFERENCIA** (razonamiento propio), **HIPÓTESIS** (a validar). **Aviso importante:** Claude no puede escuchar. Toda la
> evaluación de calidad sale de mediciones (loudness, espectro, picos, estéreo, choques armónicos), de la escritura musical y de lo que
> se sabe de cada biblioteca de muestras. La nota final necesita el oído del fundador o de oyentes a ciegas.

---

## 0. En una página

- **Se hizo todo el circuito en CPU y gratis (HECHO):** una pieza de piano para orar de 3:35 («Junto a aguas de reposo»), una bossa
  nova de 1:20 con cuatro instrumentos («Tarde en Colegiales»), masters a -14,0 LUFS con pico real -1,2 dBTP, y un video 1920×1080 de
  3:35 con una escena de agua al amanecer dibujada por código, movimiento sutil y título. Código en `herramientas/musica/`.
- **Es rápido y barato (HECHO):** renderizar 3:35 de piano con el mejor piano libre lleva 9 s; mezcla y master, 45 s; la bossa entera,
  20 s. Lo único lento es codificar video (~8 min para 3:35 con calidad alta; para 1 hora hay un atajo de segundos, §4).
- **Nota franca (INFERENCIA, sin oído):** piano para orar **6/10**; bossa **4/10**. «Bueno» para el mercado de estos canales es ~8.
  El piano sale limpio, cálido y bien formado, pero la interpretación es por reglas (le falta la respiración de un pianista) y el
  piano libre es bueno, no de primera. En la bossa, la guitarra de nylon y las escobillas General MIDI suenan a demo de MIDI: es el
  techo de las muestras gratis para ensambles.
- **Recomendación (INFERENCIA):** Remanso (piano solo) puede salir por esta vía si se mejora el piano (Pianoteq, pago, corre en Linux
  sin pantalla) y se valida a ciegas contra un generador; Sobremesa (ensambles) conviene hacerla con un generador. Esta vía queda como
  la fábrica de música **propia, editable nota por nota y con licencias limpias** para Senda (sus juegos no pueden usar Mixkit).

## 1. Qué se hizo

1. **Composición en código** (`componer_aguas.py`, `humano.py`): Re♭ mayor, 4/4, 48 compases: introducción (4), tema A con pregunta y
   respuesta (8+8), desarrollo B hacia el relativo menor con dominante secundaria (F7 → Si♭m) y cima en Sol♭maj9 (12), regreso A' con
   textura más quieta y cadencia rota (12), coda con plagal mayor y plagal menor (4). Acordes de séptima y novena en voicings
   abiertos, intercambio modal (iv menor, Sol♭m6, como «amén» que vuelve), melodía por grados en frases de 4 compases, voz interna en
   las notas largas. Rubato con mapa de tempo suave (negra entre 43 y 61,5; media 56,8), melodía adelantada 14 ms (como un pianista),
   dispersión de tiempos de 7 ms y velocidades de 26 a 92 en la melodía (HECHO, medido sobre el MIDI). Pedal legato en cada cambio de
   armonía. No sigue ninguna canción existente: progresión y melodía escritas para esta pieza.
2. **Render con muestras reales**: se compararon cuatro pianos (§6) y ganó Salamander Grand Piano V3 en SFZ, con sfizz.
3. **Mezcla y master** (`mezcla.py`): reverb por convolución con la IR «St Nicolaes Church» (retorno filtrado 180 Hz-6,5 kHz,
   predelay 24 ms, 9,4 dB bajo el seco), EQ suave, compresión lenta (1,4:1), loudness a -14 LUFS y limitador de pico real propio.
4. **Bossa nova** (`componer_bossa.py`): Re mayor, negra 128, intro de guitarra · A (16) · A' con variación y terceras (16) · final con
   ritardando (4). Guitarra con la clave de bossa y anticipaciones, contrabajo 1-5 con aproximaciones cromáticas, escobillas con
   barrido, aro en la clave y bombo suave. Piano y contrabajo con sfizz; guitarra y batería con FluidSynth.
5. **Video** (`escena_agua.py`): lago quieto al amanecer en luz lineal (cielo índigo a durazno, sol que asoma, lomas con bruma, reflejo
   con ondas en perspectiva, camino de destellos que titila y luz que respira), ciclo de 12 s que empalma sin costura (diferencia en el
   empalme 1,17 contra 0,89 entre cuadros consecutivos, casi todo grano: HECHO), título en EB Garamond con fundido, MP4 H.264 + AAC 320.
6. **Medición** (`analizar.py`): LUFS, pico real, clips, piso, pérdida al sumar a mono, bandas y espectrograma de cada pieza; control
   de choques armónicos (`revisar_choques.py`) y barrido de capas por velocidad (`prueba_capas.py`).

## 2. Herramientas elegidas (regla 10)

| Herramienta | Versión | Fuente | Licencia | Por qué | Regla de corte |
|---|---|---|---|---|---|
| sfizz (`sfizz_render`) | 1.2.3, commit f5c6e29 (17-03-2025) | gitlab.com/sfztools/sfizz | BSD-2 | El reproductor SFZ de referencia: usa las 16 capas, ruidos de martillo, resonancias y pedal del Salamander | Si Pianoteq entra (pago), se compara a ciegas y se reemplaza solo si gana |
| FluidSynth | 2.3.4 | apt Ubuntu 24.04 | LGPL-2.1 | Para SF2 (guitarra, batería, comparación de pianos) | — |
| pedalboard | 0.9.26 | PyPI (Spotify) | GPL-3 | EQ y compresión; su limitador (JUCE) y su convolución se descartaron (§5) | — |
| pyloudnorm | 0.2.0 | PyPI | MIT | Loudness ITU-R BS.1770 | — |
| pretty_midi / mido | 0.2.11 / 1.3.3 | PyPI | MIT | Escribir MIDI en segundos absolutos (el rubato queda en el archivo) | — |
| ffmpeg + LAME + x264 | 6.1.1 / 3.100 | apt | LGPL/GPL | MP3 320, video | — |
| numpy, scipy, Pillow | 2.5.5, 1.18.1, 13.0.0 | PyPI | BSD / HPND | Convolución, limitador, escena | — |

music21 no hizo falta: la armonía se escribió como voicings explícitos (más control que generar con reglas de libro).

## 3. Muestras y licencias (verificadas el 17-11-2026 en su fuente)

| Recurso | Licencia | ¿Video monetizado? | ¿Venta B2B (listas para locales)? |
|---|---|---|---|
| Salamander Grand Piano V3 (freepats.zenvoid.org; readme del paquete) | CC BY 3.0, Alexander Holm | Sí, con crédito | Sí, con crédito en la ficha o el certificado de licencia |
| Upright Piano KW (freepats) | CC0 | Sí | Sí |
| VSCO 2 CE, contrabajo pizzicato (github.com/sgossner/VSCO-2-CE, archivo LICENSE) | CC0 | Sí | Sí |
| MuseScore General (guitarra nylon, kit Brush; `/usr/share/doc/musescore-general-soundfont-lossless/copyright`) | MIT, partes CC0 y dominio público | Sí | Sí |
| FluidR3 GM (solo comparación) | MIT | Sí | Sí |
| IR de Voxengo (voxengo.com/impulses) | «royalty-free for any purpose, including commercial usage» | Sí | Sí |
| EB Garamond (título del video) | OFL 1.1 | Sí | Sí |

INFERENCIA: CC BY y MIT permiten uso comercial; la única obligación práctica es el crédito del Salamander. Las muestras no traen
riesgo de Content ID (no son grabaciones de obras), pero el Salamander es muy usado: si alguien registra en Content ID una pieza con
el mismo piano, el riesgo de falso positivo es bajo pero no nulo (HIPÓTESIS, no medida).

**Derechos de autor de la composición (CONOCIDO, no re-verificado hoy):** la Oficina de Copyright de EE. UU. (informe de enero de 2025)
no protege lo hecho sin aporte humano suficiente. Eso vale igual para esta vía (la compuso Claude) que para un generador: ninguna de las
dos da por sí sola una obra protegible. Para vender licencias B2B «exclusivas» haría falta aporte humano documentado (consulta legal ya
prevista en P8).

## 4. Tiempos (HECHO, CPU de 4 núcleos, sin GPU)

| Paso | Tiempo |
|---|---|
| Descargas (1,1 GB: Salamander SFZ+FLAC 742 MB, SF2 310 MB, KW 29 MB) | 3 min 50 s |
| Compilar sfizz | ~1,5 min |
| Render piano 3:35 (Salamander SFZ, sfizz) | 8,2 a 9,9 s (≈ 23 veces más rápido que tiempo real) |
| Render piano 3:35 con FluidSynth (Salamander SF2 / KW / MuseScore) | 2,8 / 1,3-1,6 / 3,2-3,5 s |
| Mezcla y master pieza 1 (convolución + limitador x4 iterado) | 40-45 s |
| Bossa: render de las 4 pistas | 4 s (piano 2,2-2,6; bajo 0,3; guitarra 0,8; batería 0,7) |
| Bossa: mezcla y master | 16 s |
| Escena: ciclo de 12 s (360 cuadros 1080p) | 184 s |
| MP4 final de 3:35 (x264 preset slow, crf 17) | 476 s |

Para videos de 1 hora (formato de P9): codificar una vez el ciclo con el título ya puesto y concatenarlo con copia de flujo; no se
re-codifica la hora entera (ESTIMACIÓN: segundos en vez de ~2 h).

## 5. Problemas encontrados y cómo se resolvieron

1. **sfizz no se consigue armado (HECHO):** no está en apt, PyPI ni conda-forge; el repositorio OBS de sfztools está vacío; GitHub por
   HTTPS (releases y codeload) da 403 en este entorno. Se clonó del espejo oficial en GitLab y los submódulos por git (que sí pasa) y se
   compiló `sfizz_render`.
2. **OpenAIR** (biblioteca de IR grabadas) tiene el certificado TLS vencido: no se desactivó la verificación; se usaron las IR de
   Voxengo (son modelos de Impulse Modeler, no grabaciones; por eso el retorno se filtra para que no suene metálico).
3. **El limitador de pedalboard no es de pared (HECHO):** dejó 16 muestras en 0 dBFS y pico real +0,04 dBTP. Se escribió un limitador
   con anticipación de 2 ms que detecta picos sobre la señal sobremuestreada x4 (pico real); verificado: -1,2 dBTP exactos, 0 clips.
4. **La convolución de pedalboard normaliza la IR por su cuenta:** pedí reverb 9 dB abajo y quedó 23 dB abajo. Se pasó a
   `scipy.signal.oaconvolve` con la IR a energía unitaria.
5. **sfizz escribe a 16 bits** y el piano salía con picos de -18 dBFS: un envoltorio SFZ suma 10 dB (`global_volume`) y usa la variante
   «Retuned» del Salamander (corrige la afinación muestra por muestra, hasta 38 cents).
6. **Pedal desparejo:** mi MIDI pisaba con valor 110 y el SFZ dispara el ruido de bajada solo con 126-127 (el de subida sí sonaba). Pedal
   en 127 y ruidos de pedal 7 dB más bajos.
7. **Errores de escritura que encontró el control de choques:** notas del acorde anterior que seguían sonando sobre el siguiente, y
   novenas menores (la séptima mayor Do4 debajo de la tónica Re♭5 en la melodía; la novena Do4 bajo Re♭5 en Si♭m9). Se recortaron las
   duraciones al cambio de acorde y se re-voicearon Re♭maj9, Si♭m9 y Mi♭m9. En la bossa: Re5 contra Do#4 en Si m9, Sol4 contra Fa#4 en
   Mi m9 y la guitarra sosteniendo el La sus sobre el cambio a La13; corregido (0 choques en las dos piezas).
8. **Dinámica aplanada:** A, A2 y B sonaban al mismo nivel. Se abrió la paleta y se suavizó el compresor: ahora intro -23,6 · A -19,2 ·
   A2 -17,0 · B -15,8 · cima -13,7 · A' -21,2 · coda -27,1 dB RMS. Costo: el limitador trabaja más de 1 dB el 1,15 % del tiempo (picos de
   la cima).
9. **El par AB del Salamander está en contrafase en el agudo (HECHO):** con la melodía de la bossa la correlación estéreo dio -0,38 y el
   «lado» superó al «medio»; cerrar la imagen hacía perder 5 dB al piano. En la bossa se usa un solo micrófono (mono coherente) y se
   panea. En la pieza de oración se cerró al 70 %: pérdida al sumar a mono 1,7 dB (aceptable; parlantes de bar y celulares).
10. **Contrabajo de VSCO:** el nivel de las muestras variaba más de 20 dB entre notas y la capa suave del grave necesitaba +30 dB (ruido).
    El SFZ generado iguala el nivel por muestra y usa la capa fuerte en el grave. El pico de cada muestra llega 50-160 ms después del
    ataque: el bajo se adelanta 20 ms. Una muestra empezaba sin fundido (salto en el ataque): 3 ms de ataque en el SFZ.
11. **Métrica engañosa:** «saltos bruscos» dio ~840 en la bossa; medido por pista, son transitorios legítimos de las escobillas, no clics
    (0 en piano y guitarra, 1 en el bajo, corregido).

## 6. Comparación de pianos (HECHO, mismo MIDI y misma cadena)

Barrido de velocidad 8-127 sobre Do4: si el timbre cambia de a poco al tocar más fuerte (como un piano real) o salta entre capas.

| Piano | Rango dinámico | Mayor salto de nivel | Mayor salto de timbre (centroide) | Lectura |
|---|---|---|---|---|
| **Salamander SFZ (sfizz)** | 28,9 dB | 3,7 dB | 1,1 semitonos; brillo 393 → 506 Hz | El único con cambio de timbre suave y rango realista: **elegido** |
| Salamander SF2 (FluidSynth) | 65,5 dB | 7,0 dB | 1,1 | Mismas muestras sin ruidos de liberación ni resonancias; la curva de velocidad del SF2 exagera el rango; corta la cola del final |
| MuseScore General («Splendid Grand», dominio público) | 39,7 dB | 5,5 dB | 1,2 | Correcto, más opaco |
| Upright KW (CC0) | 49,8 dB | 7,0 dB | 2,65 | Saltos de timbre entre capas y piso de ruido alto (-82 dBFS: grabado con un Zoom H1 en un living) |
| FluidR3 GM | 47,6 dB | 7,0 dB | 0 (una sola capa) | El timbre nunca cambia: el «sonido MIDI» |

Para el oído del fundador quedan cuatro fragmentos de 75 s con la misma mezcla (ver §10).

## 7. Mediciones finales (HECHO)

| | Aguas de reposo (3:35) | Tarde en Colegiales (1:20) |
|---|---|---|
| Loudness integrado | -14,02 LUFS (WAV y MP3) | -14,00 LUFS |
| Pico real | -1,20 dBTP (MP3: -1,18) | -1,20 dBTP (MP3: -1,16) |
| Clips | 0 | 0 |
| Rango de sonoridad (aprox. LRA) | 19,5 dB | 5,4 dB |
| Pérdida al sumar a mono | 1,71 dB | 0,55 dB |
| Correlación estéreo | 0,37 | 0,78 |
| Balance (dB respecto del total) | graves -3,5 · medios -2,6 · presencia -22,7 · aire -57,5 | graves -3,7 · medios -2,5 · presencia -19,1 · aire -25,6 |
| Limitador > 1 dB | 1,15 % del tiempo | 0,01 % |

El piano es oscuro (poca energía arriba de 6 kHz): coherente con tocar suave (capas suaves del Salamander) y con el pedido de calidez;
si el oído lo encuentra apagado, se sube el estante de agudos. Hay también una versión a -16 LUFS: YouTube baja lo que pasa de -14 pero
no sube lo más bajo (CONOCIDO), y un piano calmo respira mejor a -16 (limitador > 1 dB solo el 0,57 % del tiempo). Para la serie
conviene decidir con el oído (HIPÓTESIS: -16 suena más natural y la diferencia de volumen frente a otros videos no molesta en este
nicho).

## 8. Evaluación franca y comparación con generadores

**Aguas de reposo: 6/10 (INFERENCIA).** A favor: forma clara, armonía cálida sin choques, dinámica con arco, sonido limpio (sin
artefactos, sin ruido, sin clips), reverb de iglesia moderada, exactamente la duración pedida. En contra: la interpretación es por
reglas (rubato de frase, apoyos, melodía adelantada) y un oyente atento nota la regularidad de los arpegios de corcheas; el Salamander
es el mejor piano libre pero está un escalón abajo de las bibliotecas pagas; el estéreo AB tiene un agudo un poco hueco. Para fondo de
oración es publicable; para competir con los canales grandes de «piano para orar», no alcanza todavía.

**Tarde en Colegiales: 4/10 (INFERENCIA).** El arreglo es correcto (clave, anticipaciones, bajo, voicings sin choques) y el piano y el
contrabajo están bien, pero la guitarra de nylon y el kit de escobillas General MIDI tienen pocas capas y ataques repetidos: es lo que
delata «MIDI». Ninguna biblioteca libre de guitarra de nylon o escobillas cambia eso de forma sustancial (las buenas son pagas y casi
todas piden un anfitrión de Windows o Mac).

**Contra Suno o ElevenLabs Music para el mismo pedido (INFERENCIA; no se generaron):**

| Aspecto | Esta vía | Generador (diferencia esperable) |
|---|---|---|
| Realismo del ensamble (bossa) | Bajo (guitarra y escobillas GM) | Mucho mejor: suena a grabación de banda |
| Realismo del piano solo | Bueno, limpio | Parecido o mejor en «toque humano»; a veces agudos con brillo raro, ataques borroneados y compresión de códec |
| Control (tonalidad, forma, duración exacta, cambiar una nota) | Total y repetible | Parcial: se regenera y se elige; editar una nota no se puede |
| Coherencia en piezas largas (1 hora) | Total (se escribe o se encadena) | Hay que unir fragmentos; riesgo de repetición o deriva |
| Costo marginal | 0 (CPU segundos) | Plan pago y créditos por pieza |
| Licencia de las muestras | Clara y documentada | Depende de los términos del plan |
| Protección de la obra | Igual de incierta (la compuso una IA) | Igual de incierta |

## 9. Qué haría falta para calidad de sello

1. **Mejor piano (pago, decisión del fundador por la regla 8):** Pianoteq de Modartt (modelado físico, corre nativo en Linux y renderiza
   MIDI a WAV desde la línea de comandos: CONOCIDO, verificar precio y opciones en la fuente antes de pedir el OK) o una biblioteca paga
   cargada como VST3 en pedalboard. Es el salto más grande para Remanso.
2. **Mejor interpretación:** más reglas finas (balance de voces dentro del acorde, medio pedal, agógica por armonía, variar la figura del
   arpegio cada compás) o tocar la melodía en un teclado MIDI. Sin esto el techo queda en ~7.
3. **Oído humano:** una escucha a ciegas por pieza. Choca con «sin horas del fundador»: alternativa, 3 a 5 oyentes de Senda una vez por
   serie, no por pieza.
4. **Ensambles (Sobremesa):** usar el generador. Esta vía no llega con muestras libres.

**Regla de corte propuesta:** prueba a ciegas (fundador y 3 oyentes) de «Aguas de reposo» contra una pieza de piano de un generador con
el mismo pedido. Si la nuestra no queda «igual o mejor» para al menos 2 de 4, Remanso usa el generador y esta vía queda para Senda y para
música que hay que controlar nota por nota.

**Sinergia de cartera (INFERENCIA):** Senda necesita música con licencia para juegos (Mixkit quedó afuera por eso). Esta vía produce
música propia, con muestras CC0/CC BY y editable, a costo cero: sirve para fondos de oración, temas de juego calmos y variaciones por
temporada.

**Costo por pieza con la API de Claude (doctrina 05):** esta vía no usa la API en producción. Componer una pieza nueva es trabajo de
sesión (plan Max), y el render es CPU local: costo marginal ≈ 0 (ESTIMACIÓN).

## 10. Archivos de esta prueba (fuera del repositorio, en el espacio temporal de la sesión)

`/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/taller-musica/salida/`:
`aguas_de_reposo.{wav,mp3}`, `aguas_de_reposo_-16lufs.{wav,mp3}`, `tarde_en_colegiales.{wav,mp3}`, `aguas.mid`, `bossa/*.mid`,
`comparar/piano_{sal_sfz,sal_sf2,msg,kw}.mp3` (75 s cada uno), espectrogramas `*_espectro.png`,
`video/aguas_de_reposo_muestra.mp4` y `video/cuadro_{8,95.5,171.2}s.png`. Ese espacio se puede borrar: todo se regenera con
`herramientas/musica/preparar.sh` y `producir.sh` (resultados idénticos: semillas fijas, comprobado).
