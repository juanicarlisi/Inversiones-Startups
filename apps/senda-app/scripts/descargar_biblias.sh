#!/usr/bin/env bash
# Descarga las Biblias libres de open-bibles (USFX) y las convierte al formato de la app (assets/biblia/*.bib).
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
base="https://raw.githubusercontent.com/seven1m/open-bibles/master"
for f in spa-rv1909 spa-bes spa-pddpt; do curl -fsSL -o "$tmp/$f.usfx.xml" "$base/$f.usfx.xml"; done
python3 scripts/convertir_biblia.py "$tmp/spa-rv1909.usfx.xml" assets/biblia/rv1909.bib rv1909 "Reina-Valera 1909" "RV1909" "Dominio público" "Reina-Valera 1909 (dominio público)"
python3 scripts/convertir_biblia.py "$tmp/spa-bes.usfx.xml" assets/biblia/bes.bib bes "La Biblia en Español Sencillo" "BES" "CC BY 4.0" "La Biblia en Español Sencillo, AudioBiblia.org / Irma Flores (CC BY 4.0)"
python3 scripts/convertir_biblia.py "$tmp/spa-pddpt.usfx.xml" assets/biblia/pdt.bib pdt "Palabra de Dios para ti" "PDT" "CC BY-SA 4.0" "Palabra de Dios para ti © Centro Mundial de Traducción de la Biblia (CC BY-SA 4.0)"
rm -rf "$tmp"
