#!/bin/bash
# hoja.sh salida.png fondo tinta archivo96...  → una fila por archivo: 24, 36, 48, 72 y 96 px ampliados (vecino más cercano) y, a la derecha, el tamaño real
out=$1; bg=$2; fg=$3; shift 3; T=$(mktemp -d); n=0
for f in "$@"; do
  fila=()
  for s in 24 36 48 72 96; do convert "$f" -filter Lanczos -resize ${s}x${s} -fill "$fg" -colorize 100 -background "$bg" -flatten -filter point -resize 192x192 -bordercolor "$bg" -border 8 $T/c_$s.png; fila+=($T/c_$s.png); done
  # tamaño real: 24 px (mdpi) y 48 px (xhdpi), sin ampliar
  convert "$f" -filter Lanczos -resize 24x24 -fill "$fg" -colorize 100 -background "$bg" -gravity center -extent 80x208 -flatten $T/r24.png
  convert "$f" -filter Lanczos -resize 48x48 -fill "$fg" -colorize 100 -background "$bg" -gravity center -extent 80x208 -flatten $T/r48.png
  convert "${fila[@]}" $T/r24.png $T/r48.png +append $T/fila_$n.png; n=$((n+1))
done
convert $T/fila_*.png -append "$out"; rm -rf $T
