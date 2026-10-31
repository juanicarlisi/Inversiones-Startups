# Laboratorio de ruteo (VRP) · Andén · 30-10-2026

Banco de pruebas, **no es producto**. Informe: `conocimiento/radar-tecnico-2026-10/optimizacion.md`.

Qué hay:

| Carpeta | Contenido |
|---|---|
| `py/construir_instancia.py` | Grafo vial de CABA (OpenStreetMap, extracto de `../calles/datos/caba.osm`, solo lectura) -> matrices de tiempo y distancia por Dijkstra (SciPy, calles de mano única) -> 400 paradas sintéticas con ventanas horarias, demanda y servicio. Se autoverifica contra NetworkX. |
| `py/modelo.py` | `Instancia` + **evaluador independiente** (`evaluar`): factibilidad (capacidad, ventanas, jornada, flota, cobertura) y costo de cualquier solución, venga de donde venga. |
| `py/resolutores.py` | PyVRP, OR-Tools y VROOM sobre la misma instancia y el mismo objetivo. |
| `py/prueba_caba.py`, `py/reentregas.py` | Corridas sobre CABA y la segunda ola de re-entregas. |
| `py/benchmark_literatura.py`, `py/resumen_literatura.py` | Solomon y Gehring-Homberger contra las mejores soluciones conocidas. |
| `web/` | PyVRP en el navegador: Pyodide 314.0.7 + rueda WebAssembly de PyPI, en un Web Worker (`index.html`, `probar_navegador.mjs`, `pyodide_nodo.mjs`). |
| `jsprit/` | jsprit 2.0.0 (Java 21) sobre la misma instancia (`py/correr_jsprit.py`). |
| `rust-wasm/` | vrp-cli 1.25.0 (crates.io, Apache-2.0) compilado a WebAssembly: `probar_nodo.mjs` (Node) y `index.html` + `probar_navegador.mjs` (Chromium). |
| `resultados/` | JSON de cada corrida (con carga de CPU de la máquina, que era compartida). |

Reproducir (Python 3.13, Node 22):

```
pip install -r requirements.txt
python3 py/construir_instancia.py          # ~30 s
python3 py/validar_matrices.py             # SciPy contra NetworkX
python3 py/prueba_caba.py 200 60 pyvrp 1   # una corrida
python3 py/prueba_caba.py 200 60 ortools PATH_CHEAPEST_ARC
python3 py/exportar_web.py 200 && (cd web && npm ci) && node web/probar_navegador.mjs 200 10 1
```

Reconstruir lo que no se versiona:

```
# PyVRP en el navegador (ruedas fijas, de la CDN de Pyodide y de PyPI)
cd web && npm ci && mkdir -p vendor/pyodide-paquetes && cd vendor/pyodide-paquetes
B=https://cdn.jsdelivr.net/pyodide/v314.0.7/full
curl -O $B/numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl -O $B/vrplib-2.1.0-py3-none-any.whl
curl -O https://files.pythonhosted.org/packages/90/87/bccf6eb6f29d197127f2bf3ecf1eb4e190112fbdd6e8e204bdcc93afae99/pyvrp-0.14.1-cp314-cp314-pyemscripten_2026_0_wasm32.whl
# vrp-cli en WebAssembly
cargo install wasm-bindgen-cli --version 0.2.100 --locked
cd rust-wasm && cargo build --release --target wasm32-unknown-unknown
wasm-bindgen target/wasm32-unknown-unknown/release/vrp_wasm_prueba.wasm --out-dir pkg-web --target web
wasm-bindgen target/wasm32-unknown-unknown/release/vrp_wasm_prueba.wasm --out-dir pkg-node --target nodejs
python3 py/exportar_vrp_rs.py 200          # instancia en formato pragmatic
# jsprit
cd jsprit && mvn -q dependency:copy-dependencies -DoutputDirectory=lib && javac -cp "lib/*" -d classes src/Prueba.java
```

Variante con el ruteo pesando: `FIJO_FACTOR=0.1 python3 py/prueba_caba.py 200 30 pyvrp 1` (y `python3 py/exportar_web.py 200 0.1`).

Los datos pesados (`datos/*.npz`, `web/node_modules`, `web/vendor`, `jsprit/lib`) se regeneran con los comandos de arriba; `web/vendor/pyodide-paquetes` son las ruedas descargadas de PyPI y de la CDN de Pyodide (ver el informe).

Límite honesto: las medidas de tiempo se tomaron en una máquina de 4 CPU **compartida** con otras pruebas (carga entre 3 y 13). Cada JSON guarda `carga_cpu_ini_fin` y, donde se pudo, `cpu/seg`. Valen las diferencias grandes, no las de 10 %.
