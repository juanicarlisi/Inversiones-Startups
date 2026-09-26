# Escenarios — K19: Minería de bitcoin en casa (CABA) con un equipo de ~200 TH/s

*Salida*: **margen** (USD/mes por equipo). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

| Caso | Valor |
|---|---|
| Base (todos los supuestos en su valor más probable) | -176 |
| Media Monte Carlo | -184 |
| P10 | -261 |
| P50 | -183 |
| P90 | -108 |
| Probabilidad de resultado negativo (condicional) | 100% |

## Probabilidad de superar umbrales

| Umbral | Valor | Probabilidad |
|---|---|---|
| No pierde plata | 0,00 | 0% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingreso | 188 | 234 | 287 |
| electricidad | 312 | 366 | 428 |
| kwh_mes | 2.338 | 2.559 | 2.815 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | hashprice — HECHO→ESTIMACIÓN: USD 39,6 por PH/s por día el 07-09-2026 (jul-2026 ~29) | 25 a 55 | -254 | -74 | 180 |
| 2 | tarifa — HECHO→ESTIMACIÓN: CABA residencial sin subsidio ~$158–207/kWh + impuestos ≈ USD 0,11–0,18 | 0,11 a 0,18 | -100 | -277 | 176 |
| 3 | eficiencia — HECHO: J/TH de la generación S21 | 15 a 21 | -126 | -247 | 121 |
| 4 | precio_equipo — HECHO→ESTIMACIÓN: S21 200 TH nuevo USD 907–1.230 (sep-2026) + importación | 900 a 1.800 | -162 | -200 | 38 |
| 5 | vida_util — HIPÓTESIS: meses hasta que el equipo deja de ser competitivo (halving esperado en 2028) | 18 a 36 | -193 | -159 | 34 |

## Lectura

Pierde plata antes de pagar el equipo: con la electricidad residencial de CABA el costo de energía supera al ingreso. Además consume ~2.500 kWh/mes (la categoría de consumo más cara), hace ruido y calor, y en 2028 el halving corta el ingreso a la mitad.
