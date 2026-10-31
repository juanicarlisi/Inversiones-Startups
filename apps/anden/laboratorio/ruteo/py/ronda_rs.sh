#!/bin/bash
cd "$(dirname "$0")"; T=/tmp/claude-0/-home-user-Inversiones-Startups/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad
for t in 10 30; do for k in 1 2 3; do
  node ../rust-wasm/probar_nodo.mjs 200 $t $T/rs_${t}_$k.json > /dev/null && python3 evaluar_externo.py $T/rs_${t}_$k.json vrprs_wasm_$k
done; done
