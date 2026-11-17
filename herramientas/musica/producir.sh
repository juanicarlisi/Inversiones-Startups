#!/usr/bin/env bash
# Produce todo: pieza 1 (piano), pieza 2 (bossa), mediciones, video de muestra y 3 cuadros.
# Requiere haber corrido preparar.sh. Las salidas quedan en $TALLER/salida (fuera del repositorio).
# Uso: bash herramientas/musica/producir.sh [aguas|bossa|video|todo]
set -euo pipefail
TALLER="${TALLER:-$HOME/taller-musica}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
PY="$TALLER/venv/bin/python"
S="$TALLER/salida"; M="$TALLER/muestras"
SAL="$M/sal_sfz/SalamanderGrandPiano-SFZ+FLAC-V3+20200602/Remanso-Salamander.sfz"
GM=/usr/share/sounds/sf2/MuseScore_General_Full.sf2
FS=(fluidsynth -ni -r 48000 -g 0.5 -R 0 -C 0 -o synth.polyphony=512 -o audio.file.format=float)
t(){ local s=$(date +%s.%N); "$@" >/dev/null 2>&1; echo "$(echo "$(date +%s.%N) - $s" | bc) s"; }
QUE="${1:-todo}"
mkdir -p "$S/bossa" "$S/video"
cd "$AQUI"

if [[ "$QUE" == aguas || "$QUE" == todo ]]; then
  "$PY" revisar_choques.py
  "$PY" componer_aguas.py "$S/aguas.mid"
  echo "render sfizz: $(t "$TALLER/bin/sfizz_render" --sfz "$SAL" --midi "$S/aguas.mid" --wav "$S/raw_aguas.wav" -s 48000 -q 3 -p 256)"
  "$PY" mezclar_aguas.py "$S/raw_aguas.wav" "$M/ir/St Nicolaes Church.wav" "$S/aguas_de_reposo"
  "$PY" analizar.py "$S/aguas_de_reposo.wav" --png
fi

if [[ "$QUE" == bossa || "$QUE" == todo ]]; then
  B="$S/bossa"
  "$PY" componer_bossa.py "$B"
  echo "piano    $(t "$TALLER/bin/sfizz_render" --sfz "$SAL" --midi "$B/piano.mid" --wav "$B/raw_piano.wav" -s 48000 -q 3 -p 256)"
  echo "bajo     $(t "$TALLER/bin/sfizz_render" --sfz "$TALLER/instrumentos/contrabajo_vsco.sfz" --midi "$B/bajo.mid" --wav "$B/raw_bajo.wav" -s 48000 -q 3)"
  echo "guitarra $(t "${FS[@]}" -F "$B/raw_guitarra.wav" "$GM" "$B/guitarra.mid")"
  echo "bateria  $(t "${FS[@]}" -F "$B/raw_bateria.wav" "$GM" "$B/bateria.mid")"
  "$PY" mezclar_bossa.py "$B" "$M/ir/French 18th Century Salon.wav" "$S/tarde_en_colegiales"
  "$PY" analizar.py "$S/tarde_en_colegiales.wav" --png
fi

if [[ "$QUE" == video || "$QUE" == todo ]]; then
  V="$S/video"
  "$PY" escena_agua.py titulo "$V/titulo.png" "Aguas de Reposo" "Remanso · piano para orar"
  # ciclo de 12 s que empalma sin costura (360 cuadros; ~3 min en 4 núcleos)
  "$PY" escena_agua.py ciclo 1920 1080 30 12 | ffmpeg -y -loglevel error -f rawvideo -pix_fmt rgb24 -s 1920x1080 -r 30 -i - \
    -c:v libx264 -preset slow -crf 10 -tune film -pix_fmt yuv444p "$V/ciclo_agua.mp4"
  D=$("$PY" -c "import soundfile as sf; print(round(sf.info('$S/aguas_de_reposo.wav').duration, 3))")
  ffmpeg -y -loglevel error -stream_loop -1 -i "$V/ciclo_agua.mp4" -loop 1 -framerate 30 -i "$V/titulo.png" -i "$S/aguas_de_reposo.wav" \
    -filter_complex "[1:v]format=rgba,fade=t=in:st=2.5:d=3:alpha=1[t];[0:v][t]overlay=0:0,fade=t=in:st=0:d=2.5,fade=t=out:st=$(echo "$D - 4" | bc):d=4,format=yuv420p[v]" \
    -map "[v]" -map 2:a -t "$D" -r 30 -c:v libx264 -preset slow -crf 17 -tune film -profile:v high \
    -c:a aac -b:a 320k -ar 48000 -movflags +faststart "$V/aguas_de_reposo_muestra.mp4"
  for x in 8 95.5 171.2; do ffmpeg -y -loglevel error -ss "$x" -i "$V/aguas_de_reposo_muestra.mp4" -frames:v 1 "$V/cuadro_${x}s.png"; done
fi
echo "Salidas en $S"
