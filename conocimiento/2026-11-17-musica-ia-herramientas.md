# Bitácora — Herramientas para Remanso y Sobremesa: música, imagen, video, directo y subida (17-11-2026)

> Investigador tecnológico (regla 10, `doctrina/09-herramientas-especializadas.md`). Todo lo marcado **HECHO** se leyó en la
> fuente oficial el **17-11-2026** salvo que se indique otra fecha. **ESTIMACIÓN** lleva su método. **INFERENCIA** es criterio propio.
> No se creó ninguna cuenta ni se pagó nada. Proyectos: `oportunidades/proyectos/P9-remanso.yaml` y `P8-sobremesa.yaml`.

## 0. Resumen en una pantalla

| Pieza | Elegida | Costo |
|---|---|---|
| Música de Remanso (piano para orar) | **Composición propia en MIDI + Salamander Grand Piano + FluidSynth + pedalboard (Dragonfly Hall)**, probada acá en CPU | USD 0 |
| Música de Sobremesa (bossa, flamenco, jazz, tango lounge, lobby) | **Google Lyria 3.5 por la API de Gemini** (`lyria-3.5`) | USD 0,08 por tema |
| Imagen (portadas, fondos, miniaturas) | **Nano Banana 2.1** (`gemini-nano-banana-2.1`), misma clave | USD 0,034 (1K) a 0,113 (4K) |
| Animación de fondos (bucles) | **Gemini Omni Flash 1.2** (`gemini-omni-1.2-flash`), misma clave; gratis: movimiento con ffmpeg | ~USD 0,07 por segundo (720p) |
| Armado del video largo | **ffmpeg** (bucle de 20 s + `-stream_loop -1 -c copy`), probado acá | USD 0 |
| Directo 24/7 | **ffmpeg en un VPS chico de Hetzner** (`-re -stream_loop -1 -c copy` a RTMP) | desde EUR 5,49 por mes |
| Subida | **YouTube Data API v3** (`videos.insert`) con OAuth del fundador | USD 0 |

Una sola cuenta paga (Google AI Studio / Gemini API, facturación del fundador) cubre música de Sobremesa, imágenes y animación.

## 1. Generadores de música cerrados

| Herramienta (versión) | API oficial | Duración máx. | Precio | Dueño / uso comercial | Biblioteca para locales (B2B) | Datos de entrenamiento | Fuente |
|---|---|---|---|---|---|---|---|
| **Suno** (v6, v6-wild, v6-mini; v6 del 09-09-2026 según terceros) | **No.** Desde el 01-07-2026 «explorando» una API con socios elegidos; los «Suno API» que se venden son envoltorios no oficiales | 8 min por generación (más con Extend) | Pro USD 10/mes (8 anual), **20 descargas/mes**; Premier 30 (24), 60 descargas; Platinum 120 (100), 120 descargas. Gratis: sin descargas ni uso comercial | Pago: Suno cede sus derechos sobre lo descargado; no garantiza que haya copyright. **Uso comercial solo de lo descargado** por los canales de Suno; prohíbe robots y scraping; prohíbe usar lo generado «para competir con Suno» | No lo trata; la cláusula de competencia es una zona gris para una biblioteca B2B (INFERENCIA) | Acuerdo con Warner (nov-2025), BMG (ago-2026); UMG y Sony siguen en juicio (abr-2026, terceros) | suno.com/pricing; suno.com/terms (vigentes desde 03-09-2026, revisión 10-08-2026); MBW 01-07-2026 |
| **Udio** | No | — | — | Descargas apagadas desde el 29/30-10-2025; plataforma cerrada («jardín amurallado») | No sirve: no se puede exportar | Acuerdos con UMG, Warner, Kobalt, Merlin; app licenciada «Starstruck» anunciada sin fecha (abr-2026) | MBW, Music Week (2025-2026) |
| **ElevenLabs Music** (`music_v2_5`; v1 se retira el 31-01-2027) | Sí (planes pagos) | 5 min | USD 0,15/min por API; planes Starter 6, Creator 22, Pro 99 | «Retenés todos los derechos sobre el Output». Streaming (Spotify) solo desde Creator; WAV solo desde Pro; Creator y Pro, **solo personas físicas** | **Prohibido en todos los planes autoservicio**: no se puede «compilar, crear o contribuir a una Music Library» sin permiso escrito (solo Enterprise) | «Hecho en colaboración con sellos, editoriales y artistas» | elevenlabs.io/docs (música), /pricing/api, /music-terms (actualizado 09-10-2026) |
| **Google Lyria 3.5** (`lyria-3.5`; GA en API 03/04-09-2026; tarjeta del modelo 29-07-2026) | **Sí**, API de Gemini | «Un par de minutos», se guía con el texto («create a 2-minute song»); no hay máximo publicado | **USD 0,08 por canción** (sin capa gratis). Lyria 3 Clip (30 s) USD 0,04 y Lyria 3 Pro 0,08 quedan como legado | «Google no reclamará la propiedad» de lo generado y «puede generar lo mismo o algo similar para otros». Bloquea voces de artistas y letras con derechos. Todo lleva **SynthID** | No hay restricción en los términos de la API de Gemini (leídos 17-11-2026) | Google dice que usó datos «que tiene derecho a usar»; demanda de músicos independientes (mar-2026) en curso | aistudio.google.com/docs/pricing; /docs/music-generation; /docs/terms; deepmind.google model card |
| **Lyria 2** (`lyria-002`, Vertex AI) | Sí | 30 s, WAV 48 kHz, solo instrumental | USD 0,06 por 30 s | — | — | — | docs.cloud.google.com (Vertex) |
| **Lyria RealTime** (`lyria-realtime-exp`) | Experimental, sin precio publicado; sin novedades desde may-2025 | Flujo continuo | — | — | — | — | ai.google.dev/gemini-api/docs/models/lyria-realtime-exp |
| **Stable Audio 3** (Large solo API; Small y Medium abiertos; 20-05-2026) | Sí (Stability API) | Medium 6:20; Large «más de 6 min» | **USD 0,08 por generación** (3.0 y 2.5; 1 crédito = USD 0,01) | Licencia comunitaria: «sos dueño de los outputs», comercial gratis con menos de USD 1 M/año, **registro obligatorio** para uso comercial | No lo prohíbe | **«Entrenado con datos totalmente licenciados»** (licenciados + Creative Commons) | stability.ai (anuncio), docs.stability.ai/pricing, LICENSE.md en Hugging Face |
| **MiniMax Music** (2.5+, 2.6, 3.0) | Sí (MiniMax; también fal y WaveSpeed) | ~5 min (terceros) | USD 0,075–0,15 por tema según revendedor | Términos no verificados en fuente primaria | No verificado | No verificado | fal.ai, wavespeed.ai (no oficiales) |
| **Mureka** (V9, V9.5) | Sí (platform.mureka.ai, página no legible sin JS) | No verificado | USD 0,045–0,07 por tema según terceros | Terceros: cesión «si los hubiera»; demanda por datos de entrenamiento en EE. UU. (jun-2026, terceros) | No verificado | En litigio | apiframe, cometapi (no oficiales) |
| **AIVA** | No | 5:30 (Pro) | Pro EUR 33/mes (anual), 300 descargas | **Copyright tuyo** solo en Pro; Standard: AIVA es dueña | Pro sin restricciones listadas | Composición simbólica (exporta MIDI) | aiva.ai/pricing |
| **Mubert API** | Sí | hasta 25 min | USD 49 (sin monetizar), 199, 499/mes | Sublicencia solo desde 499; «sin distribución» en todos | Solo 499/mes | «Licenciado y de socios» | mubert.com/api |
| Beatoven, Soundraw, Loudly | Sin precio de API verificado en fuente oficial | — | Beatoven: ~USD 3 por minuto descargado (terceros) | — | — | — | costbench y similares (no oficiales) |

**Content ID (HECHO, support.google.com/youtube/answer/2605065):** para registrar en Content ID hacen falta derechos **exclusivos**; lo
licenciado no exclusivo no es elegible y las bibliotecas «libres de regalías» van a revisión manual. **INFERENCIA:** nada generado por IA
de un servicio que «puede generar lo mismo para otros» se puede registrar como propio, y el riesgo real es el inverso: que un tercero
registre algo parecido y reclame nuestro video (casos contados por creadores en guías de 2026, sin fuente primaria; la disputa da 30 días
al reclamante). Una composición propia en MIDI no tiene ese riesgo de colisión con otros usuarios del mismo generador.

**YouTube (HECHO, answer/1311392, cambio del 15-07-2025):** la política de contenido «repetitivo» pasó a llamarse **contenido no
auténtico**: no se monetiza lo «producido en masa, genérico, repetitivo», ni «contenido generado con IA hecho con plantillas genéricas que
da la impresión de producción masiva». Terceros (tubefilter, 13-07-2026) informan una aclaración en julio de 2026 con detección por canal.

## 2. Modelos abiertos

| Modelo | Licencia de los pesos (HECHO, Hugging Face 17-11-2026) | Calidad | Requisitos | Cómo correrlo sin GPU propia |
|---|---|---|---|---|
| **Stable Audio 3 Medium** (1,4 B) y **Small** (433 M) | Stability Community License: comercial gratis bajo USD 1 M/año, registro obligatorio; el codificador de texto T5Gemma, bajo términos de Gemma | AA instrumental: Medium 996, Small 946 (Large 1014) | GPU o **CPU**: el repositorio oficial trae versiones **TFLite (x86/ARM)** y **C++ con Intel AMX** (int8/bf16). **Este contenedor tiene AMX** (`amx_bf16 amx_int8 amx_tile`, Xeon) | Acá mismo (ver §2.1), o API de Stability USD 0,08 (Large) |
| **ACE-Step 1.5** (y XL 4B, abr-2026) | **MIT** | Fuera de la tabla de Artificial Analysis; el equipo dice «supera a casi todas las comerciales» (autodeclarado) | < 4 GB de VRAM (base); XL ≥ 12 GB | fal.ai **USD 0,0002 por segundo de audio** (≈ USD 0,72 por hora generada) |
| HeartMuLa oss 3B | Apache-2.0 (actualizado 15-11-2026) | Canciones con voz; sin dato instrumental | GPU | — |
| YuE (v1) | Apache-2.0 (YuE2 con licencia más estricta, según terceros) | Canciones con voz | GPU grande | — |
| DiffRhythm 1.2 / 2 | Apache-2.0 | Canciones con voz | GPU | — |
| MusicGen (AudioCraft) | **CC-BY-NC 4.0: no comercial** | AA instrumental 868 (último) | GPU | Descartado por licencia |
| Stable Audio Open 1.0 | Community License | Superado por SA3 | — | — |
| SongBloom, LeVo 2 | No verificado (repos no accesibles desde acá) | Canciones con voz | GPU | — |

Para piano, bossa o lounge **instrumental**, los modelos de canción con voz (YuE, DiffRhythm, HeartMuLa, SongBloom) no aportan.

**Precios de cómputo (HECHO de fuentes secundarias, sep-oct-2026):** Hugging Face PRO USD 9/mes con 40 min diarios de ZeroGPU y
USD 1 cada 10 min extra; Modal L4 ~USD 0,80/h, A10 ~USD 1,10/h, con USD 30 de cómputo por mes en el plan Starter.
**ESTIMACIÓN:** con Stable Audio 3 Medium (0,8 s para 120 s de audio en H200 según su README) cualquier GPU chica genera horas de música
por centavos; el costo lo domina el arranque en frío, no la generación.

### 2.1 Prueba de Stable Audio 3 en esta CPU

- **HECHO:** repositorio oficial `Stability-AI/stable-audio-3` (MIT, último commit 02-11-2026) clonado; dependencias del runtime TFLite
  instaladas (`ai_edge_litert 2.3.0`). El repositorio `stabilityai/stable-audio-3-optimized` en Hugging Face **no exige iniciar sesión**
  y trae los pesos para CPU (Medium int8 1,7 GB; decodificador 0,5 GB; T5Gemma 0,56 GB).
- **NO VERIFICADO:** la ejecución del script oficial fue **denegada por el sistema de permisos** de la sesión (ejecutar código
  descargado). No se rodeó. Para probarlo hace falta permitir:
  `cd <repo>/optimized/tflite && ./install.sh -y && ./sa3 --prompt "soft ambient pad, warm, slow" --dit medium --seconds 60`.
- **INFERENCIA:** si corre, da música licenciada y gratis para colchones de ambiente (Remanso Dormir y Estudio) y una alternativa
  sin costo para Sobremesa; su calidad medida (996) queda ~80 puntos debajo de Lyria 3.5 (1078), una diferencia que se oye.

## 3. Componer sin generador (CPU, acá)

| Pieza | Versión | Licencia | Estado |
|---|---|---|---|
| pretty_midi / music21 / mido | 0.2.11 / 10.5.2 / 1.3.3 | MIT / BSD-3 / MIT | Instaladas y usadas |
| **FluidSynth** | 2.3.4 (apt) | LGPL-2.1 | Instalado y usado |
| **Salamander Grand Piano V3** (Yamaha C5, 16 capas de velocidad, 48 kHz/24 bit) | SF2 del 02-06-2020 (296 MiB comprimido, 1,27 GB) | **CC-BY 3.0** según freepats; **dominio público desde el 04-03-2022** según la lista de Nils Hilbricht. Se acredita igual | Descargado y usado |
| Upright Piano KW | 2022-02-21 | CC0 | No probado |
| **VSCO 2 Community Edition** (orquesta de cámara) | — | CC0 («sin reglas, sin regalías») | No probado |
| Salamander Drumkit | 2012 | Dominio público desde 2022 | No probado |
| Spitfire LABS | Ahora «Splice INSTRUMENT»; funciona como plugin propio | Sin licencia legible en la página; requiere su app (no Linux) | **No sirve acá** |
| sfizz (para la versión SFZ con ruido de pedal y resonancias) | — | BSD-2 | No está en apt; habría que compilarlo |
| **pedalboard** (Spotify) | 0.9.26 | GPL-3 | Instalado y usado |
| **Dragonfly Reverb** (Hall, Room, Plate) como VST3 dentro de pedalboard | 3.2.10 (apt) | GPL-3 | Instalado y usado |
| Matchering | 2.0.6 | GPL-3 | Instalado, no usado |

**Prueba real (HECHO, 17-11-2026, en este contenedor de 4 vCPU):** pieza de piano para orar en Re mayor compuesta nota por nota
(165 notas, pedal en cada cambio de acorde, rubato leve) → MIDI en 0,2 s → **68 s de audio estéreo 48 kHz renderizados con Salamander en
2,1 s** (~30 veces tiempo real) → master con pedalboard y Dragonfly Hall en 2,2 s → −14,6 LUFS en el video. El espectrograma muestra piano
real con pedal y cola de reverb. Archivos de prueba en el scratchpad (no en el repositorio).

**Límites (INFERENCIA):** para **piano solo** el timbre es el de un piano grabado de verdad y la calidad depende de la composición y de
la interpretación, que Claude controla nota por nota (velocidad, rubato, pedal, voicing). Para **bossa, flamenco, tango o jazz** faltan
bibliotecas libres buenas de guitarra de nylon, contrabajo, escobillas y bandoneón (la lista de Hilbricht no tiene ninguna): esa vía
no alcanza a un generador para Sobremesa. Nadie escuchó el render: falta la prueba a ciegas (regla de corte abajo).

## 4. Ranking de calidad independiente

**HECHO — Artificial Analysis, AA-Music-Instrumental v1.1** (votos a ciegas de evaluadores contratados, ~2.200 muestras por modelo;
consultado 17-11-2026, la página no muestra fecha): Suno v6 **1148**; Suno v6-mini 1114; Mureka V9.5 1084; Mureka V9 1083; Lyria 3 Pro
1080; **Lyria 3.5 1078**; Eleven Music 1021; **Stable Audio 3 Large 1014**; Eleven Music v2 1011; MiniMax 2.5+ 1007; Eleven v2.5 1001;
MiniMax 3.0 1000 (referencia); **Stable Audio 3 Medium 996**; Stable Audio 2.5 984; SA3 Small 946; Lyria 2 926; MusicGen 868 (±21 en
todos). ACE-Step no figura. No hay prueba publicada de piano solo ni de bossa con Lyria 3.5 (búsqueda 17-11-2026).

## 5. Imagen y video

**Imagen — HECHO** (precios oficiales 17-11-2026; ranking AA-Image-T2I v2.1 consultado el mismo día):

| Modelo | Precio | Ranking | Licencia |
|---|---|---|---|
| **Nano Banana 2.1** (`gemini-nano-banana-2.1`, oct-2026) | USD 0,0336 (1K), 0,0504 (2K), 0,113 (4K); lote a mitad de precio | **8.º, 1176** | Google no reclama la propiedad; SynthID |
| Nano Banana 2 (`gemini-3.1-flash-image`) | 0,067 (1K) | 13.º, 1143 | Igual |
| GPT Image 2.6 Sunburst | No verificado | 1.º, 1261 | — |
| FLUX 3 Image (BFL) | 0,048 (1K) | 21.º, 1115 | Términos de la API no leídos |
| FLUX.2 [pro] | 0,03 por MP | 53.º, 1004 | — |
| **FLUX.2 [klein] 4B** abierto | gratis local | — | **Apache-2.0** (el 9B y el [dev] son no comerciales) |
| Ideogram 4.0 / Recraft V4.1 | ~0,03–0,10 / 0,04 | 39.º / 38.º | — |
| Midjourney | **sin API oficial** (oct-2026, terceros; sus términos prohíben automatizar) | no figura | — |

**Video (bucles de fondo) — HECHO** (AA-Video-I2V v2.1; precio por minuto que muestra la tabla, 17-11-2026):
MiniMax H3 768p 1134 (USD 4,80/min); Pika H3 Flex 1114 (2,10/min); **Gemini Omni Flash 1.2 1085** (6,26/min; en la página de precios
de Gemini ≈ USD 0,07/s a 720p, 0,023/s a 360p, hasta 15 s); Kling 3.0 1000; Veo 3.1 Lite 931 (4,80/min); LTX-2.5 912. Runway Gen-4
Turbo USD 0,05/s (terceros). Abiertos: Wan 2.2 (Apache-2.0), LTX-2 (licencia comunitaria propia): en CPU son demasiado lentos (INFERENCIA).

**Armado — HECHO:** ffmpeg 6.1.1 instalado (libx264, SVT-AV1, loudnorm, xfade). Prueba: 71 s a 1080p30 con zoom lento recodificado en
37 s (~2× tiempo real); en cambio, **un bucle de 20 s codificado una vez (12 s) + `-stream_loop -1 -c copy` arma el video largo en 0,2 s**:
así una hora sale en segundos. **Remotion** (HECHO, remotion.dev/license): gratis para personas y empresas de hasta 3 personas; no hace
falta para fondos fijos con movimiento suave.

## 6. Directo 24/7

- **HECHO (YouTube, answer/2853700):** canal verificado, sin restricciones de directo en los últimos 90 días, 16 años o más; hasta 10
  directos activos por canal y 3 por clave.
- **HECHO (hetzner.com/cloud, 17-11-2026):** «Regular Performance» desde **EUR 5,49/mes** sin IVA (el plan más barato figura «no
  disponible»); IPv4 EUR 0,50/mes (docs.hetzner.com). Tráfico incluido: no figura en la página leída (NO VERIFICADO).
- **HECHO (Oracle, docs y terceros):** el «Always Free» de Ampere bajó a 2 OCPU y 12 GB desde el 15-06-2026; pide tarjeta.
- Servicios de bucle (terceros, sep-oct-2026): Runnel ~USD 6, Loopcast 11, YTStream 19, Restream corta los bucles a las 40 h.
- **INFERENCIA:** con el mix ya codificado, `ffmpeg -re -stream_loop -1 -i mix.mp4 -c copy -f flv rtmp://a.rtmp.youtube.com/live2/CLAVE`
  casi no usa CPU: un VPS chico sostiene los dos canales. A ~3 Mbps son ~1 TB por mes por canal (3 Mbps × 2,6 M s ÷ 8). Renovar el mix
  del directo cada semana (no un bucle eterno) para no caer en «repetitivo».

## 7. Subida automática

- **HECHO (developers.google.com/youtube/v3/docs/videos/insert, actualizado 12-11-2026):** subir cuesta **1 unidad** en un cupo propio de
  subidas, **100 por día**; los videos subidos desde proyectos **no verificados ya no quedan forzados a privado**; se puede marcar
  `status.containsSyntheticMedia` y programar con `status.publishAt`. Los demás métodos usan el cupo general de 10.000 unidades diarias.
- **HECHO (developers.google.com/identity/protocols/oauth2, actualizado 29-10-2026):** un proyecto con pantalla de consentimiento
  «External» en estado **«Testing» recibe tokens que vencen a los 7 días**: hay que pasarlo a «En producción» para que la subida siga sola.
- El proyecto de Google Cloud, la pantalla de consentimiento y la autorización inicial los hace el fundador con su cuenta (una vez);
  el token de refresco se guarda como secreto, nunca en el repositorio (que es público).

## 8. Elección (regla 10) — una por pieza

| Pieza | Registro (herramienta · versión · fuente · licencia · por qué · regla de corte) |
|---|---|
| **Música de Remanso** | Composición propia en MIDI (pretty_midi 0.2.11) renderizada con **Salamander Grand Piano V3 (SF2 2020-06-02)** en **FluidSynth 2.3.4** y masterizada con **pedalboard 0.9.26 + Dragonfly Hall 3.2.10** y `loudnorm` de ffmpeg · freepats.zenvoid.org, github.com/spotify/pedalboard · CC-BY 3.0 (o dominio público), LGPL, GPL-3 (herramientas, no contaminan la música) · **por qué:** piano de verdad grabado, arreglos propios de himnos protestantes de dominio público (identidad y contenido auténtico, lo que pide YouTube), editable nota por nota, sin colisiones de Content ID con otros usuarios de un generador, corre acá gratis y la misma partitura sirve para Senda · **corte:** antes de los primeros 10 videos, prueba a ciegas de 10 piezas contra 10 de Lyria 3.5 «solo piano» (fundador + 5 oyentes); si Lyria gana 2 de cada 3 comparaciones, el piano pasa a Lyria 3.5 (~USD 4 por hora terminada). Mejora siguiente: la versión SFZ con sfizz (ruido de pedal y resonancias). Colchones para Dormir y Estudio: Stable Audio 3 Medium en esta CPU cuando se permita ejecutarlo. |
| **Música de Sobremesa** | **Google Lyria 3.5** (`lyria-3.5`) por la API de Gemini · aistudio.google.com/docs/music-generation y /docs/pricing · términos de la API de Gemini (Google no reclama la propiedad; SynthID) · **por qué:** la mejor calidad instrumental con API oficial (1078; Suno 1148 no tiene API, limita descargas y prohíbe robots; Mureka 1084 sin términos verificados y en litigio; ElevenLabs prohíbe armar bibliotecas, que es el negocio B2B) a USD 0,08 por tema y WAV 44,1 kHz · **corte:** si en la curaduría de un estilo se descarta más del 60 %, ese estilo se prueba con Stable Audio 3 Large (mismo precio, datos licenciados); si Google agrega una restricción a bibliotecas o uso B2B, o un fallo afecta a Lyria, el catálogo para locales pasa a Stable Audio 3. Al certificado B2B se le dice la verdad: música generada sin autores de SADAIC, sin exclusividad. |
| **Imagen** | **Nano Banana 2.1** (`gemini-nano-banana-2.1`) · aistudio.google.com/docs/pricing; ranking AA · Google no reclama la propiedad · **por qué:** 8.º del ranking (1176), buen texto en miniaturas, consistencia de estilo en varias vueltas, USD 0,05 a 2K, misma clave · **corte:** si 3 de 10 portadas no pasan la curaduría, FLUX 3 Image (USD 0,048). Gratis: FLUX.2 [klein] 4B (Apache-2.0) en CPU, sin probar. |
| **Animación** | **Gemini Omni Flash 1.2** (`gemini-omni-1.2-flash`), bucles de 8–10 s a 720p · aistudio.google.com/docs/pricing · **por qué:** misma cuenta y clave que todo lo demás (el fundador no abre otra); en fondos de ambiente casi quietos la ventaja de MiniMax H3 (1134 contra 1085) pesa poco (INFERENCIA) · **corte:** si 2 de los primeros 5 bucles tienen defectos visibles o no cierran, MiniMax H3 por fal. Gratis: zoom y paneo lento con ffmpeg (probado). |
| **Armado** | **ffmpeg 6.1.1** (apt) · ffmpeg.org · LGPL/GPL · **por qué:** probado acá; bucle de 20 s + copia sin recodificar = una hora en segundos; marcas de tiempo y fundidos con `acrossfade` · **corte:** si hacen falta textos animados o plantillas complejas, Remotion (gratis hasta 3 personas). |
| **Directo** | **ffmpeg en Hetzner Cloud**, el plan «Regular Performance» más chico · hetzner.com/cloud · EUR 5,49/mes + IPv4 · **por qué:** el directo no puede vivir en el contenedor de Claude (se apaga); con `-c copy` un VPS mínimo alcanza para los dos canales · **corte:** si el VPS corta más de 1 h por semana, Runnel (~USD 6 por canal). |
| **Subida** | **YouTube Data API v3** `videos.insert` · developers.google.com/youtube/v3 · gratis · **por qué:** oficial, 100 subidas por día, ya sin auditoría para publicar, campo de contenido sintético · **corte:** ninguno previsto; si Google vuelve a exigir auditoría, se pide (o se sube a mano lo poco que falte). |

## 9. Presupuesto mensual (ESTIMACIÓN)

Método: dos videos largos por semana por canal (≈ 8,7 h de música por mes por canal); un tema de Lyria dura ~2,5 min (HIPÓTESIS: la
documentación dice «un par de minutos») → 24 temas por hora; la curaduría se queda con la mitad → **~USD 3,84 por hora terminada**.
Imágenes a 2K (USD 0,05). Bucles de 8 s con Omni (USD 0,56). VPS a ~USD 7 con IPv4.

| Nivel | Qué compra | Costo |
|---|---|---|
| **Gratis** | Remanso completo (piano MIDI + Salamander, fondos con ffmpeg, armado, subida por API). Sobremesa solo si Stable Audio 3 Medium corre en esta CPU (calidad 996, más baja). **Sin directo** (o el Always Free de Oracle, que pide tarjeta y cuenta). | USD 0 |
| **Hasta USD 30** | Lo anterior + **Sobremesa con Lyria 3.5 a un video largo por semana** (~4,3 h, ~USD 17) + 40 imágenes (USD 2) + 6 bucles (USD 3,4) + **VPS con los dos directos** (USD 7). | **~USD 29** |
| **Hasta USD 100** | Sobremesa al ritmo pleno (8,7 h, ~USD 33) + colchones y la prueba a ciegas de piano con Lyria y Stable Audio 3 Large (~USD 10) + 100 imágenes (USD 5) + 20 bucles (USD 11) + segundo VPS para separar canales (USD 7) + margen para rehacer. | **~USD 70** (sobra margen) |

Nada de esto compra Suno: no tiene API, sus 20 descargas mensuales de Pro no alcanzan y usarlo con un agente choca con su prohibición de robots.

## 10. Lo que decide el fundador (y nada más)

1. **Cuenta de Google AI Studio con facturación** y una clave de la API de Gemini (música de Sobremesa, imágenes, animación). Sale a
   Google solo el texto de los pedidos y las imágenes de referencia; en la capa paga no se usan para entrenar.
2. **Registro gratuito en la licencia comunitaria de Stability** (stability.ai/community-license) si se usa Stable Audio 3 con fines comerciales.
3. **Proyecto de Google Cloud con OAuth de YouTube** (en producción) y una autorización inicial con la cuenta del canal.
4. **VPS de Hetzner** (EUR 5,49/mes) cuando arranquen los directos.
5. Permitir en la sesión la ejecución del runtime oficial de Stable Audio 3 para probarlo en CPU.

## 11. No verificado

Ejecución de Stable Audio 3 en esta CPU (permiso denegado); precios y términos oficiales de Mureka y MiniMax; duración máxima real de
Lyria 3.5; tráfico incluido en Hetzner; casos de Content ID con fuente primaria; calidad de ACE-Step 1.5 en una prueba independiente;
cómo suena el render de piano (nadie lo escuchó); precio de GPT Image 2.6.

## Fuentes (consultadas el 17-11-2026)

- Suno: https://suno.com/pricing · https://suno.com/terms · https://www.musicbusinessworldwide.com/suno-explores-developer-api-seeking-apps-that-unlock-experiences-generative-music-makes-possible-for-the-first-time/
- Udio: https://www.musicbusinessworldwide.com/universal-music-settles-udio-lawsuit-strikes-deal-for-licensed-ai-music-platform · https://www.musicbusinessworldwide.com/after-universal-warner-and-merlin-deals-now-udio-inks-licensing-agreement-with-kobalt
- ElevenLabs: https://elevenlabs.io/docs/overview/capabilities/music · https://elevenlabs.io/pricing/api · https://elevenlabs.io/music-terms
- Google: https://aistudio.google.com/docs/pricing · https://aistudio.google.com/docs/music-generation · https://ai.google.dev/gemini-api/terms · https://deepmind.google/models/model-cards/lyria-3-5/ · https://ai.google.dev/gemini-api/docs/available-regions · https://the-decoder.com/google-launches-ai-music-generator-lyria-3-pro-says-it-was-trained-on-data-it-has-the-right-to-use/
- Stability: https://stability.ai/news-updates/meet-stable-audio-3-the-model-family-built-for-artistic-experimentation-with-open-weight-models · https://docs.stability.ai/pricing · https://huggingface.co/stabilityai/stable-audio-3-optimized · https://github.com/Stability-AI/stable-audio-3
- Rankings: https://artificialanalysis.ai/music/leaderboard/instrumental · https://artificialanalysis.ai/text-to-image/arena/leaderboard-text · https://artificialanalysis.ai/video/leaderboard/image-to-video
- Otros generadores: https://www.aiva.ai/pricing · https://mubert.com/api · https://fal.ai/models/fal-ai/ace-step · https://huggingface.co/ACE-Step/Ace-Step1.5
- Muestras: https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html · https://sfzinstruments.github.io/pianos/salamander · https://hilbricht.net/foss-sampled-instruments.html · https://versilian-studios.com/vsco-community/ · https://splice.com/instrument/labs-instrument
- Imagen: https://bfl.ai/pricing · https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- YouTube: https://support.google.com/youtube/answer/1311392 · https://support.google.com/youtube/answer/2605065 · https://support.google.com/youtube/answer/2853700 · https://developers.google.com/youtube/v3/docs/videos/insert · https://developers.google.com/youtube/v3/getting-started · https://developers.google.com/identity/protocols/oauth2
- Infraestructura: https://www.hetzner.com/cloud · https://docs.hetzner.com/cloud/servers/overview/ · https://www.remotion.dev/license · https://huggingface.co/docs/hub/spaces-zerogpu
