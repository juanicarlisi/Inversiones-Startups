#!/usr/bin/env bash
# Prepara el taller de música (una sola vez): paquetes del sistema, entorno de Python, muestras y sfizz.
# Todo lo pesado queda FUERA del repositorio, en $TALLER (por defecto ~/taller-musica).
# Uso: bash herramientas/musica/preparar.sh
set -euo pipefail
TALLER="${TALLER:-$HOME/taller-musica}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$TALLER"/{muestras,src,bin,salida}
cd "$TALLER"

# 1) sistema: FluidSynth, soundfonts GM (MIT), tipografía EB Garamond (OFL), ffmpeg, compilador
sudo_() { if [ "$(id -u)" = 0 ]; then "$@"; else sudo "$@"; fi; }
sudo_ apt-get install -y fluidsynth fluid-soundfont-gm musescore-general-soundfont-lossless fonts-ebgaramond \
  ffmpeg cmake g++ p7zip-full bc git curl

# 2) Python (versiones fijas)
[ -d venv ] || python3 -m venv venv
./venv/bin/pip install -q -r "$AQUI/requirements.txt"

# 3) pianos de FreePats: Salamander Grand (CC BY 3.0, Alexander Holm) y Upright KW (CC0)
B=https://freepats.zenvoid.org/Piano
cd muestras
[ -f SalamanderGrandPiano-SFZ+FLAC-V3+20200602.tar.gz ] || curl -fSLO "$B/SalamanderGrandPiano/SalamanderGrandPiano-SFZ+FLAC-V3+20200602.tar.gz"
[ -f SalamanderGrandPiano-SF2-V3+20200602.tar.xz ] || curl -fSLO "$B/SalamanderGrandPiano/SalamanderGrandPiano-SF2-V3+20200602.tar.xz"
[ -f UprightPianoKW-SF2-20220221.7z ] || curl -fSLO "$B/UprightPianoKW/UprightPianoKW-SF2-20220221.7z"
mkdir -p sal_sfz sal_sf2 kw ir
[ -d sal_sfz/SalamanderGrandPiano-SFZ+FLAC-V3+20200602 ] || tar -xzf SalamanderGrandPiano-SFZ+FLAC-V3+20200602.tar.gz -C sal_sfz
[ -d sal_sf2/SalamanderGrandPiano-SF2-V3+20200602 ] || tar -xJf SalamanderGrandPiano-SF2-V3+20200602.tar.xz -C sal_sf2
[ -d kw/UprightPianoKW-SF2-20220221 ] || 7z x -okw UprightPianoKW-SF2-20220221.7z > /dev/null

# envoltorio del Salamander: versión «Retuned» + 10 dB (sfizz escribe a 16 bits) + ruidos de pedal 7 dB más bajos
D=sal_sfz/SalamanderGrandPiano-SFZ+FLAC-V3+20200602
{ echo "<global> global_volume=10"
  sed -e 's/on_hicc64=127 off_by=2 volume=-20/on_hicc64=127 off_by=2 volume=-27/' \
      -e 's/on_hicc64=1 volume=-19/on_hicc64=1 volume=-26/' "$D/SalamanderGrandPianoRetuned-V3+20200602.sfz"; } > "$D/Remanso-Salamander.sfz"

# 4) respuestas al impulso de Voxengo (uso libre de regalías, también comercial)
[ -f ir/IMreverbs.zip ] || curl -fSL -o ir/IMreverbs.zip https://www.voxengo.com/files/impulses/IMreverbs.zip
(cd ir && unzip -o -q IMreverbs.zip)
cd ..

# 5) contrabajo pizzicato de VSCO 2 CE (CC0): solo esa carpeta, con checkout parcial
if [ ! -d src/VSCO-2-CE ]; then
  git clone --filter=blob:none --no-checkout --depth 1 https://github.com/sgossner/VSCO-2-CE.git src/VSCO-2-CE
  (cd src/VSCO-2-CE && git sparse-checkout init --no-cone && \
   git sparse-checkout set "/Strings/Solo Contrabass/Pizz/*" "/LICENSE" && git checkout)
fi
mkdir -p instrumentos
./venv/bin/python "$AQUI/sfz_contrabajo.py" "src/VSCO-2-CE/Strings/Solo Contrabass/Pizz" instrumentos/contrabajo_vsco.sfz

# 6) sfizz 1.2.3 (BSD-2): no está en apt ni en PyPI; se compila desde el espejo oficial en GitLab
if [ ! -x bin/sfizz_render ]; then
  [ -d src/sfizz ] || git clone --depth 1 https://gitlab.com/sfztools/sfizz.git src/sfizz
  (cd src/sfizz && git submodule update --init --recursive --depth 1 && mkdir -p build && cd build && \
   cmake .. -DCMAKE_BUILD_TYPE=Release -DSFIZZ_JACK=OFF -DSFIZZ_RENDER=ON -DSFIZZ_LV2=OFF -DSFIZZ_VST=OFF \
     -DSFIZZ_AU=OFF -DSFIZZ_SHARED=OFF -DSFIZZ_TESTS=OFF -DSFIZZ_BENCHMARKS=OFF -DSFIZZ_DEMOS=OFF -DSFIZZ_DEVTOOLS=OFF && \
   make -j"$(nproc)" sfizz_render)
  cp src/sfizz/build/library/bin/sfizz_render bin/
fi
echo "Listo. Taller en $TALLER"
