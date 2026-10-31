#!/bin/bash
# variante 'ruta': costo fijo x0.1 (pesa el ruteo). n=200, 30 s, secuencial
cd "$(dirname "$0")"; export FIJO_FACTOR=0.1
for s in 1 2; do python3 prueba_caba.py 200 30 pyvrp $s; done
for f in PATH_CHEAPEST_ARC PARALLEL_CHEAPEST_INSERTION SAVINGS; do python3 prueba_caba.py 200 30 ortools $f; done
T=/tmp/claude-0/-home-user-Inversiones-Startups/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad
for k in 1 2; do node ../rust-wasm/probar_nodo.mjs 200 30 $T/rsr_$k.json _ff0.1 > /dev/null && python3 evaluar_externo.py $T/rsr_$k.json vrprs_wasm_$k; done
