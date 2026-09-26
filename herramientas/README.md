# Herramientas

| Script | Para qué | Uso |
|---|---|---|
| `oportunidades.py` | Valida fichas `oportunidades/OP-*.md`, calcula puntaje (scorecard) e IVR y regenera `TABLERO.md` | `python3 herramientas/oportunidades.py` (`--check`, `--json`) |
| `escenarios.py` | Motor Monte Carlo + tornado para modelos YAML de economía unitaria | `python3 herramientas/escenarios.py herramientas/modelos/op01-consorcios.yaml` · `--todos` |
| `cartera.py` | Resumen del libro de capital y proyección compuesta a 5 años | `python3 herramientas/cartera.py resumen` · `proyectar [--estres 0.6] [--md] [--png]` |
| `config.yaml` | Pesos del scorecard, tarifa sombra, umbrales, estados y roles | Cambiarlo es una decisión (registrar en `cartera/decisiones.md`) |
| `modelos/` | Un modelo YAML por oportunidad + `resultados/` generados | Copiar `_plantilla.yaml` |

Dependencias: `python3 -m pip install -r requirements.txt`.

## Cómo pensar los modelos

- Cada supuesto es un **rango** (mín / más probable / máx) con etiqueta HECHO, ESTIMACIÓN o HIPÓTESIS y cómo se valida.
- `exito` = probabilidad de lograr tracción. El resultado *condicional* describe "si funciona"; el *incondicional* incluye el fracaso.
- El **tornado** ordena los supuestos por cuánto mueven el resultado: el primero es lo que hay que validar primero.
- Supuestos independientes entre sí: la dispersión real puede ser distinta si están correlacionados (p. ej. precio y volumen).
