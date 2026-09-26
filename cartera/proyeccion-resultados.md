# Proyección compuesta de la cartera (Monte Carlo)

5000 simulaciones, 60 meses. Aporte USD 400/mes; tesorería al 7% anual; herramientas USD 120/mes; reinversión 90% del flujo. Supuestos en `cartera/proyeccion.yaml` (HIPÓTESIS).

## Flujo mensual de las unidades (USD/mes)

| Mes | P10 | P50 | P90 | Prob. > USD 1.000 | Prob. > USD 3.000 |
|---|---|---|---|---|---|
| 12 | 0 | 1.011 | 2.154 | 50% | 1% |
| 24 | 0 | 2.599 | 4.781 | 73% | 42% |
| 36 | 0 | 2.630 | 5.285 | 74% | 43% |
| 48 | 0 | 3.194 | 6.484 | 76% | 53% |
| 60 | 0 | 3.280 | 6.484 | 76% | 54% |

## Caja líquida acumulada (tesorería después de reinversiones, USD)

| Mes | P10 | P50 | P90 | Solo tesorería (mismo aporte) | Aportado acumulado |
|---|---|---|---|---|---|
| 12 | 1.807 | 5.460 | 10.785 | 4.952 | 4.800 |
| 24 | 5.400 | 12.697 | 30.452 | 10.251 | 9.600 |
| 36 | 9.240 | 23.240 | 77.409 | 15.921 | 14.400 |
| 48 | 13.358 | 33.263 | 101.051 | 21.987 | 19.200 |
| 60 | 17.760 | 70.432 | 176.694 | 28.478 | 24.000 |

## Patrimonio de la cartera (caja + valor de unidades y activos a múltiplos conservadores, USD)

| Mes | P10 | P50 | P90 | Solo tesorería |
|---|---|---|---|---|
| 12 | 1.807 | 13.865 | 27.365 | 4.952 |
| 24 | 5.400 | 36.234 | 70.749 | 10.251 |
| 36 | 9.245 | 67.180 | 133.404 | 15.921 |
| 48 | 13.358 | 105.219 | 226.062 | 21.987 |
| 60 | 17.760 | 158.193 | 304.365 | 28.478 |

## Probabilidad de cada evento

| Evento | Probabilidad |
|---|---|
| El fundador no puede dedicar las horas (todas las unidades fallan) | 15% |
| OP-01 logra tracción y el comité la escala | 40% |
| OP-02 logra tracción y el comité la escala | 26% |
| OP-03 logra tracción y el comité la escala | 27% |
| OP-04 logra tracción y el comité la escala | 34% |
| OP-07 logra tracción y el comité la escala | 41% |
| Se ejecuta la reinversión CARTERA-CONSORCIOS-1 | 40% |
| Se ejecuta la reinversión CARTERA-CONSORCIOS-2 | 40% |
| Se ejecuta la reinversión OP-08 | 81% |
| Se ejecuta la reinversión OP-10 | 73% |
| Se ejecuta la reinversión OP-11 | 40% |

## Lectura

- Probabilidad de terminar el mes 60 con más patrimonio que la estrategia de solo tesorería: **79%**.
- Probabilidad de que la cartera genere > USD 1.000/mes al mes 24: **73%**; al mes 60: **76%**.
- El resultado depende sobre todo de que al menos una unidad de servicio logre tracción en el año 1: con varias apuestas baratas en paralelo, la probabilidad de que *ninguna* funcione cae mucho (diversificación de experimentos).
