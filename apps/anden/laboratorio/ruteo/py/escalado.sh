#!/bin/bash
# escalado: n = 50, 100, 400 con 30 s por corrida, secuencial (un proceso a la vez)
cd "$(dirname "$0")"
for n in 50 100 400; do
  python3 prueba_caba.py $n 30 pyvrp 1
  python3 prueba_caba.py $n 30 ortools PATH_CHEAPEST_ARC
  python3 prueba_caba.py $n 30 ortools SAVINGS
done
