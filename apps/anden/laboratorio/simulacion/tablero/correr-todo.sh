#!/usr/bin/env bash
# Mide todo lo de tableros en Chromium (el del entorno, sin GPU) y deja resultados/graficos.json (se escribe página por página).
# Tarda ~15 min: ECharts hace 8 zooms de ≈ 12 s por corrida.
cd "$(dirname "$0")/.."
export NODE_PATH=/opt/node-tools/node_modules
node tablero/build.mjs > /dev/null
node tablero/medir.mjs g-raster g-uplot-linea g-uplot g-plot d-duckdb p-perspective.mjs --rep=3
node tablero/medir.mjs d-duckdb --rep=3 --q=b=coi
node tablero/medir.mjs g-echarts --rep=1
node tablero/medir.mjs i-tablero --rep=3
node tablero/medir.mjs g-echarts --rep=1 --q=prog=defecto
