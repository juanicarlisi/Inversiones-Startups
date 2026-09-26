# Escenarios — OP-05b: Idea original del fundador: 6 meses de precio de penetración en Mercado Libre (mates, termos, bombillas)

*Salida*: **valor_neto** (USD (valor neto de la campaña a 24 meses)). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

| Caso | Valor |
|---|---|
| Base (todos los supuestos en su valor más probable) | -3.060 |
| Media Monte Carlo | 2.438 |
| P10 | -14.511 |
| P50 | 1.152 |
| P90 | 21.183 |
| Probabilidad de resultado negativo (condicional) | 46% |

## Probabilidad de superar umbrales

| Umbral | Valor | Probabilidad |
|---|---|---|
| Recupera lo invertido | 0,00 | 54% |
| Duplica lo invertido (aprox.) | 10.000 | 26% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| costo_campania | 9.717 | 19.933 | 35.908 |
| valor_recompra | 2.963 | 7.551 | 16.711 |
| valor_ranking | 3.975 | 12.307 | 30.336 |
| roi | -0,52 | 0,06 | 1,49 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | organicas_extra_mes — HIPÓTESIS CRÍTICA: ventas orgánicas extra por mes gracias al ranking/reseñas ganados | 0,00 a 600 | -9.540 | 22.860 | 32.400 |
| 2 | unidades_mes — HIPÓTESIS: unidades vendidas por mes con precio regalado | 100 a 1.200 | 4.095 | -22.140 | 26.235 |
| 3 | subsidio_unidad — ESTIMACIÓN: descuento vs precio normal + margen negativo por unidad (USD) | 3,00 a 10 | 4.140 | -12.660 | 16.800 |
| 4 | margen_normal — ESTIMACIÓN: margen por unidad a precio normal tras comisión ML (~13–17%), envío, IVA/IIBB | 2,00 a 8,00 | -9.360 | 5.760 | 15.120 |
| 5 | duracion_efecto — HIPÓTESIS: meses que dura el efecto ranking frente a competidores que también bajan precio | 3,00 a 24 | -7.920 | 3.420 | 11.340 |
| 6 | recompra_anual — HIPÓTESIS: compras por cliente y año a precio normal (bienes durables: un termo dura años) | 0,05 a 0,60 | -6.948 | 3.744 | 10.692 |

## Lectura

Tal como fue planteada, la campaña cuesta del orden de USD 5.000–30.000 (equivale a 1–6 años del aporte mensual) y su valor depende casi por completo de un supuesto: que el ranking ganado en Mercado Libre genere ventas orgánicas extra durante muchos meses. La recompra aporta poco porque mates, termos y bombillas son bienes durables. Conclusión: no hacer 6 meses de precio regalado; sí medir la elasticidad del ranking con una prueba de 4–6 semanas, 2–3 productos y un tope de USD 500–1.000.
