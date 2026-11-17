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
