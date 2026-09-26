# Escenarios — OP-03: Puente de maquinaria usada Europa → pymes argentinas (modelo de intermediación)

*Salida*: **margen_mensual** (USD/mes (promedio anual)). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

Probabilidad de tracción supuesta: **40%** (si no hay tracción la unidad se cierra: valor 0,00). *Condicional* = si funciona; *incondicional* = incluye el fracaso.

| Caso | Condicional (si funciona) | Incondicional |
|---|---|---|
| Base (supuestos en su valor más probable) | 1.150 | — |
| Media Monte Carlo | 2.067 | 834 |
| P10 | 555 | 0,00 |
| P50 | 1.751 | 0,00 |
| P90 | 4.014 | 2.796 |
| Probabilidad de resultado negativo (condicional) | 0% |

## Probabilidad de superar umbrales

| Umbral | Valor | Si funciona | Incondicional |
|---|---|---|---|
| Cubre el aporte mensual (USD 400) | 400 | 94% | 38% |
| Motor de caja (USD 1.000/mes) | 1.000 | 76% | 30% |
| Unidad relevante (USD 3.000/mes) | 3.000 | 22% | 9% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingreso_por_op | 5.181 | 8.405 | 13.383 |
| margen_anual | 6.661 | 21.012 | 48.169 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | valor_operacion — ESTIMACIÓN: valor FOB promedio de máquina/línea (USD) | 20.000 a 180.000 | 350 | 3.550 | 3.200 |
| 2 | operaciones_anio — HIPÓTESIS: operaciones cerradas por año en régimen (año 2) | 0,50 a 8,00 | 88 | 3.275 | 3.188 |
| 3 | comision_pct — HIPÓTESIS: comisión de éxito sobre FOB | 0,05 a 0,12 | 700 | 1.750 | 1.050 |
| 4 | fee_servicios — HIPÓTESIS: honorario fijo por gestión (búsqueda, proyecto Decreto 483/2026, coordinación logística) | 500 a 3.000 | 900 | 1.525 | 625 |
| 5 | costo_directo_op — ESTIMACIÓN: costo propio por operación (traducciones, llamadas, eventual viaje; la inspección la paga el cliente) | 300 a 2.500 | 1.275 | 725 | 550 |
| 6 | marketing_anual — ESTIMACIÓN: pauta a industriales + contenido + eventos | 600 a 4.000 | 1.225 | 942 | 283 |
| 7 | costo_problema — HIPÓTESIS: costo esperado de un problema (devolver comisión, reclamo) | 1.000 a 15.000 | 1.230 | 950 | 280 |
| 8 | prob_problema — HIPÓTESIS: probabilidad de que una operación salga mal (máquina no funciona, demora grave) | 0,02 a 0,20 | 1.225 | 1.000 | 225 |

## Lectura

Negocio de pocas operaciones grandes: la cantidad de operaciones por año y el valor promedio explican casi todo. Con 3–4 operaciones medianas por año ya es un motor de caja con capital casi nulo. El riesgo real no está en el modelo sino en la reputación: una máquina que no funciona puede cerrar el canal. Por eso inspección independiente obligatoria.
