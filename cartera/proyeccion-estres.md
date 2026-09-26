# Proyección compuesta de la cartera (Monte Carlo)

5000 simulaciones, 60 meses. Aporte USD 400/mes; tesorería al 7% anual; herramientas USD 120/mes; reinversión 90% del flujo. Supuestos en `cartera/proyeccion.yaml` (HIPÓTESIS).

## Flujo mensual de las unidades (USD/mes)

| Mes | P10 | P50 | P90 | Prob. > USD 1.000 | Prob. > USD 3.000 |
|---|---|---|---|---|---|
| 12 | 0 | 475 | 1.701 | 28% | 0% |
| 24 | 0 | 1.190 | 3.677 | 54% | 18% |
| 36 | 0 | 1.224 | 3.807 | 54% | 19% |
| 48 | 0 | 1.304 | 4.415 | 55% | 24% |
| 60 | 0 | 1.411 | 4.470 | 56% | 25% |

## Caja líquida acumulada (tesorería después de reinversiones, USD)

| Mes | P10 | P50 | P90 | Solo tesorería (mismo aporte) | Aportado acumulado |
|---|---|---|---|---|---|
| 12 | 1.807 | 3.420 | 8.800 | 4.952 | 4.800 |
| 24 | 5.357 | 8.288 | 21.342 | 10.251 | 9.600 |
| 36 | 7.959 | 12.107 | 56.195 | 15.921 | 14.400 |
| 48 | 10.185 | 15.068 | 60.729 | 21.987 | 19.200 |
| 60 | 16.107 | 23.285 | 113.272 | 28.478 | 24.000 |

## Patrimonio de la cartera (caja + valor de unidades y activos a múltiplos conservadores, USD)

| Mes | P10 | P50 | P90 | Solo tesorería |
|---|---|---|---|---|
| 12 | 1.807 | 7.578 | 21.945 | 4.952 |
| 24 | 5.400 | 20.583 | 53.073 | 10.251 |
| 36 | 9.245 | 29.736 | 94.346 | 15.921 |
| 48 | 13.358 | 36.610 | 142.192 | 21.987 |
| 60 | 17.760 | 47.841 | 196.732 | 28.478 |

## Probabilidad de cada evento

| Evento | Probabilidad |
|---|---|
| El fundador no puede dedicar las horas (todas las unidades fallan) | 15% |
| OP-01 logra tracción y el comité la escala | 26% |
| OP-02 logra tracción y el comité la escala | 17% |
| OP-03 logra tracción y el comité la escala | 18% |
| OP-04 logra tracción y el comité la escala | 22% |
| OP-07 logra tracción y el comité la escala | 26% |
| Se ejecuta la reinversión CARTERA-CONSORCIOS-1 | 26% |
| Se ejecuta la reinversión CARTERA-CONSORCIOS-2 | 26% |
| Se ejecuta la reinversión OP-08 | 65% |
| Se ejecuta la reinversión OP-10 | 49% |
| Se ejecuta la reinversión OP-11 | 26% |

## Lectura

- Probabilidad de terminar el mes 60 con más patrimonio que la estrategia de solo tesorería: **60%**.
- Probabilidad de que la cartera genere > USD 1.000/mes al mes 24: **54%**; al mes 60: **56%**.
- El resultado depende sobre todo de que al menos una unidad de servicio logre tracción en el año 1: con varias apuestas baratas en paralelo, la probabilidad de que *ninguna* funcione cae mucho (diversificación de experimentos).
