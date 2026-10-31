# Laboratorio · simulación, oráculos, tableros y línea de tiempo (30-10-2026)

Informe: `conocimiento/radar-tecnico-2026-10/simulacion-tableros.md`. Nada de acá es producto ni toca `apps/anden/simulador/` (solo lo
LEE para correr el motor) ni `apps/juegos/aviacion/`. Nada se publicó ni se pagó.

## Preparar
```bash
npm ci                                              # echarts, uplot, plot, perspective, duckdb-wasm, arrow, react, preact, stlite, esbuild
python3 -m venv --system-site-packages .venv && .venv/bin/pip install -r requirements.txt   # solo hace falta para streamlit/
node tablero/generar-datos.mjs --n=125 && node tablero/a-stream.mjs                          # datos/*.arrow: 125 noches reales (1.001.200 paquetes)
```

## Oráculo SimPy (`oraculo/`)
| Archivo | Qué hace |
|---|---|
| `hub_simpy.py` | El hub chico en SimPy 4.1.2, escrito desde la especificación. Modo `F2` y modo `F3-lite` (grilla de pasos, micro-paradas, recirculación). Lee el mismo JSON `anden.modelo/1` |
| `crear_modelos.py` → `modelos/` | A1–A5 exactos (sin azar), B1 casi determinista, C1 estocástico (plantilla tal cual), C2 (medio volumen) |
| `exacto.py` | Compara los 24 KPI de SimPy contra el motor (F2 y F3) al milisegundo en A1–A5 |
| `sensibilidad.py` | Rompe a propósito 6 reglas del oráculo (mutantes) y mide cuáles detectan A1–A5 |
| `estadistico.py` | N noches por lado, Welch + Kolmogorov-Smirnov, SimPy contra motor F2/F3; `--mutantes` mide la potencia |
| `generar_dorados.py` → `dorados/` | Resultados congelados del oráculo para que Node pruebe sin Python |
| `prueba/oraculo.test.mjs` | La prueba propuesta para el repo: `node --test oraculo/prueba/oraculo.test.mjs` (≈ 50 s) |
| `correr-motor.mjs`, `lib-motor.mjs` | Corren el motor de producción (núcleo, F2/F3) y devuelven los KPI |

## Tableros (`tablero/`)
`node tablero/build.mjs` arma `tablero/dist/`; `tablero/correr-todo.sh` mide en Chromium (sin GPU: todo dibuja por software) y escribe
`resultados/graficos.json`; `tamanos.mjs` mide el peso de cada librería con esbuild; `medir-red.mjs` (stlite) y `medir-streamlit.mjs`.
Páginas: `g-*` gráficos de 1 M de puntos (`g-echarts-v`/`-z` son las variantes con las que se diagnosticó ECharts), `i-tablero` DuckDB-WASM + ECharts, `d-duckdb` DuckDB-WASM sobre 100 noches, `p-perspective.mjs`, `stlite.html`.
`streamlit/app.py`: tablero interno del oráculo (no es producto).
