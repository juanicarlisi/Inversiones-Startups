# Taller de música por código (Remanso y Sobremesa)

Claude compone en Python (MIDI con rubato y humanización), renderiza con muestras reales de licencia libre, mezcla y masteriza
a -14 LUFS, y arma un video 1080p con una escena dibujada por código. Corre en CPU, sin GPU, sin cuentas y sin pagar nada.
Resultados y evaluación: `conocimiento/2026-11-17-musica-ia-taller.md`.

**En el repositorio solo está el código.** Muestras (~1,1 GB), sfizz compilado, audios y videos quedan en `$TALLER`
(por defecto `~/taller-musica`), fuera del repositorio.

## Cómo correrlo

```bash
bash herramientas/musica/preparar.sh          # una vez: apt, venv, descargas (~4 min por 1,1 GB), compila sfizz (~1,5 min en 4 núcleos)
bash herramientas/musica/producir.sh aguas     # pieza 1: piano para orar (render ~9 s, mezcla ~45 s)
bash herramientas/musica/producir.sh bossa     # pieza 2: bossa nova (render ~4 s, mezcla ~16 s)
bash herramientas/musica/producir.sh video     # ciclo de 12 s (~3 min) + MP4 de 3:35 (~8 min con preset slow)
```

Salidas: `$TALLER/salida/aguas_de_reposo.{wav,mp3}`, `tarde_en_colegiales.{wav,mp3}`, `video/aguas_de_reposo_muestra.mp4`,
`video/cuadro_*.png` y espectrogramas `*_espectro.png`.

**Cómo apagarlo:** no queda nada corriendo. Para liberar disco, `rm -rf $TALLER`.

## Archivos

| Archivo | Qué hace |
|---|---|
| `humano.py` | Mapa de tempo con rubato (interpolación coseno), humanización de tiempos y velocidades, escritura de MIDI |
| `componer_aguas.py` | «Junto a aguas de reposo»: Re♭ mayor, 48 compases, intro · A · A2 · B (cima) · A' · coda |
| `componer_bossa.py` | «Tarde en Colegiales»: Re mayor, 40 compases, 4 pistas (piano, contrabajo, guitarra, escobillas) |
| `revisar_choques.py` | Control de escritura: novenas menores y segundas entre melodía y acompañamiento (tiene que dar 0) |
| `sfz_contrabajo.py` | Genera el SFZ del contrabajo pizzicato de VSCO 2 CE (octavas, round-robin, nivel igualado por muestra) |
| `mezcla.py` | Reverb por convolución (scipy), limitador de pico real con anticipación (x4), loudness, exportación WAV 24 bits + MP3 320 |
| `mezclar_aguas.py` / `mezclar_bossa.py` | Cadena de cada pieza (EQ, imagen estéreo, envíos, bus, master a -14 LUFS / -1,2 dBTP) |
| `analizar.py` | LUFS, pico real, clips, pérdida al sumar a mono, bandas, espectrograma |
| `prueba_capas.py` | Barrido de velocidad sobre Do4: costuras entre capas de muestras (para comparar pianos) |
| `escena_agua.py` | Lago al amanecer en luz lineal, ciclo sin costura de 12 s, título en EB Garamond |
| `preparar.sh` / `producir.sh` | Instalación y producción completas |

## Fuentes y licencias de lo que se descarga (verificado el 17-11-2026)

| Recurso | Fuente | Licencia | Para videos monetizados y venta B2B |
|---|---|---|---|
| Salamander Grand Piano V3 (Yamaha C5, 16 capas) | freepats.zenvoid.org | CC BY 3.0 (Alexander Holm) | Sí, con crédito en la descripción / ficha |
| Upright Piano KW (solo comparación) | freepats.zenvoid.org | CC0 | Sí, sin condiciones |
| VSCO 2 CE, contrabajo pizzicato | github.com/sgossner/VSCO-2-CE | CC0 | Sí, sin condiciones |
| MuseScore General (guitarra de nylon, kit «Brush») | paquete Debian/Ubuntu `musescore-general-soundfont-lossless` | MIT (partes CC0 y dominio público) | Sí (el aviso MIT acompaña al archivo, no al audio) |
| FluidR3 GM (solo comparación) | paquete `fluid-soundfont-gm` | MIT | Sí |
| Respuestas al impulso (St Nicolaes Church, French 18th Century Salon) | voxengo.com/impulses | Uso libre de regalías para cualquier fin, también comercial | Sí |
| EB Garamond | paquete `fonts-ebgaramond` | OFL 1.1 | Sí |

Crédito sugerido: «Piano: Salamander Grand Piano por Alexander Holm (CC BY 3.0). Contrabajo: VSCO 2 CE (CC0).»

Software: sfizz 1.2.3 (BSD-2; espejo oficial gitlab.com/sfztools/sfizz, commit f5c6e29 del 17-03-2025), FluidSynth 2.3.4 (LGPL-2.1),
ffmpeg 6.1.1 + LAME 3.100 + x264, pedalboard 0.9.26 (GPL-3), pyloudnorm 0.2.0 (MIT), pretty_midi 0.2.11 (MIT), numpy/scipy (BSD),
Pillow (HPND). Usar herramientas GPL para producir audio no impone licencia sobre el audio.

## Problemas de red conocidos (17-11-2026)

- GitHub por HTTPS (releases, codeload, API) da 403 en el entorno de Claude Code; `git clone` de GitHub sí funciona.
  Por eso sfizz se clona de GitLab y sus submódulos por git.
- sfizz no está en apt (Ubuntu 24.04), PyPI, conda-forge ni en el repositorio OBS (vacío): hay que compilarlo.
- OpenAIR (biblioteca de respuestas al impulso) tiene el certificado TLS vencido: no se usa.

## Para escalar a videos de 1 hora

No re-codificar una hora con `-preset slow` (~2 h de CPU): codificar una vez el ciclo con el título ya puesto y concatenarlo con
copia de flujo (`-f concat -c copy`) más el audio; tarda segundos.

## Ronda 2: generar mucho con Stable Audio 3 y elegir con un oído medible (17-11-2026)

Resultados, puntajes y evaluación: `conocimiento/2026-11-17-musica-ia-ronda2.md`. Todo corre en CPU, gratis, sin cuentas.

| Archivo | Qué hace |
|---|---|
| `oido.py` | Oído medible: Audiobox Aesthetics (Meta, CC BY 4.0) puntúa calidad de producción (PQ), disfrute (CE), utilidad (CU) y complejidad (PC) |
| `ronda2_prompts.py` | Los 9 estilos y sus 4 formas de pedir (etiquetas AudioSparx, narrativa, etiquetas con guía y negativo, corta) |
| `ronda2_generar.py` | Grilla de Stable Audio 3 medium + SAME-L: etapa 1 (4 formas x 2 semillas) y etapa 2 (6 semillas más de la mejor forma) |
| `ronda2_puntuar.py` | Puntaje de cada clip: estética, estilo con CLAP (laion/clap-htsat-unfused, Apache 2.0) y artefactos por señal (silbidos agudos, soplido, huecos, imagen estéreo) |
| `ronda2_resumen.py` | Tabla por estilo y forma de pedir |
| `ronda2_post.py` | Postproducción en 4 versiones del mismo tramo (v0 solo master; v1 limpieza; v2 + EQ e imagen; v3 + compresión paralela y sala), todas a -14 LUFS y -1 dBTP |
| `ronda2_curar.py` | Finalistas por estilo: mejor tramo de 45 s, la versión de postproducción que sube el puntaje (o ninguna) y espectrograma para revisar a ojo |
| `ronda2_pagina.py` | Página de escucha a ciegas (copia de `informes/escucha-musica/`), letras nuevas barajadas, MP3 320 kbps verificados a -14 LUFS ±0,3; la correspondencia queda aparte |
| `lyria.py` | Lyria 3.5 por la API de Gemini para los mismos estilos. **Listo y sin correr**: sin `GEMINI_API_KEY` solo muestra plan y costo |

### Cómo correrlo

```bash
# 1. Stable Audio 3 (una vez; ~2,4 GB de pesos de Hugging Face)
git clone https://github.com/Stability-AI/stable-audio-3 && cd stable-audio-3/optimized/tflite && ./install.sh -y
export SA3_DIR=$PWD R2_DIR=~/r2
# 2. El oído (venv aparte: torch CPU + audiobox + transformers para CLAP; ~1,5 GB)
python3 -m venv $R2_DIR/aesvenv
$R2_DIR/aesvenv/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch torchaudio
$R2_DIR/aesvenv/bin/pip install audiobox_aesthetics transformers requests scipy
# 3. El venv del taller (preparar.sh) más noisereduce
$TALLER/venv/bin/pip install noisereduce
# 4. Generar, puntuar, curar
python3 herramientas/musica/ronda2_generar.py --etapa 1
$R2_DIR/aesvenv/bin/python herramientas/musica/ronda2_puntuar.py $R2_DIR/gen/manifiesto.jsonl $R2_DIR/puntajes.jsonl
python3 herramientas/musica/ronda2_resumen.py $R2_DIR/puntajes.jsonl          # elegir la mejor forma por estilo -> mejores.json
python3 herramientas/musica/ronda2_generar.py --etapa 2 --mejores mejores.json
$R2_DIR/aesvenv/bin/python herramientas/musica/ronda2_puntuar.py $R2_DIR/gen/manifiesto.jsonl $R2_DIR/puntajes.jsonl
TALLER_PY=$TALLER/venv/bin/python $R2_DIR/aesvenv/bin/python herramientas/musica/ronda2_curar.py $R2_DIR/puntajes.jsonl --top 3 --salida $R2_DIR/curado
$TALLER/venv/bin/python herramientas/musica/ronda2_pagina.py seleccion.json $R2_DIR/escucha2/sitio
```

Tiempos medidos en esta máquina (4 núcleos, sin GPU): un clip de 75 s tarda ~45 s solo (cfg 1) y ~75 s con guía (cfg 3); con
el oído y la curaduría corriendo a la par, ~100 s. Puntuar un clip, ~30 s. **Cómo apagarlo:** no queda nada corriendo; borrar
`$R2_DIR` y los pesos en `~/.cache/huggingface`.

Licencias: Stable Audio 3 (Stability AI Community License: gratis con ingresos anuales menores a USD 1 M, registro gratuito
para uso comercial); Audiobox Aesthetics (código y pesos CC BY 4.0; solo para elegir, nada de eso va al audio); CLAP
htsat-unfused (Apache 2.0); noisereduce (MIT); respuestas al impulso de Voxengo (uso libre). `laion/larger_clap_music` da
similitudes cercanas a cero con transformers 5.23: no se usa.
