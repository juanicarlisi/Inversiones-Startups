# Escenarios — OP-06: Puente de compre local minero (San Juan) para proveedores de afuera — régimen al mes 24

*Salida*: **neto** (USD/mes). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

Probabilidad de tracción supuesta: **20%** (si no hay tracción la unidad se cierra: valor 0,00). *Condicional* = si funciona; *incondicional* = incluye el fracaso.

| Caso | Condicional (si funciona) | Incondicional |
|---|---|---|
| Base (supuestos en su valor más probable) | 2.550 | — |
| Media Monte Carlo | 5.847 | 1.188 |
| P10 | 2.368 | 0,00 |
| P50 | 5.256 | 0,00 |
| P90 | 10.100 | 5.290 |
| Probabilidad de resultado negativo (condicional) | 0% |

## Probabilidad de superar umbrales

| Umbral | Valor | Si funciona | Incondicional |
|---|---|---|---|
| Genera caja (> USD 100/mes) | 100 | 100% | 20% |
| Motor de caja (USD 1.000/mes) | 1.000 | 99% | 20% |
| Unidad relevante (USD 3.000/mes) | 3.000 | 83% | 17% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingresos | 4.860 | 9.659 | 17.626 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | valor_contrato — HIPÓTESIS: valor del primer año de cada contrato (USD) | 100.000 a 2.000.000 | 1.650 | 7.350 | 5.700 |
| 2 | clientes_retainer — HIPÓTESIS: proveedores extranjeros o de otras provincias con abono mensual | 0,00 a 6,00 | 750 | 6.150 | 5.400 |
| 3 | contratos_anio — HIPÓTESIS: contratos cerrados por año para clientes | 0,00 a 6,00 | 1.350 | 4.950 | 3.600 |
| 4 | fee_retainer — HIPÓTESIS: abono mensual por inteligencia + representación + búsqueda de socio local | 800 a 3.000 | 1.710 | 4.350 | 2.640 |
| 5 | success_fee — HIPÓTESIS: comisión de éxito sobre el primer año | 0,01 a 0,05 | 1.950 | 3.350 | 1.400 |
| 6 | socio_pct — HIPÓTESIS: participación del socio local en San Juan | 0,30 a 0,50 | 3.050 | 2.050 | 1.000 |
| 7 | viajes — ESTIMACIÓN: viajes CABA–San Juan prorrateados por mes | 150 a 700 | 2.750 | 2.200 | 550 |
| 8 | fijos — ESTIMACIÓN | 50 a 200 | 2.600 | 2.450 | 150 |

## Lectura

Economía atractiva si se consiguen 2 clientes con abono y algún contrato; pero la probabilidad de lograrlo desde CABA sin red minera es baja. La variable clave no está en el modelo: encontrar un socio sanjuanino con reputación.
