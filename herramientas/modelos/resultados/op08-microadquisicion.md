# Escenarios — OP-08: Micro-adquisición de un negocio digital en USD operado con IA (una operación)

*Salida*: **flujo** (USD/mes). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

| Caso | Valor |
|---|---|
| Base (todos los supuestos en su valor más probable) | 422 |
| Media Monte Carlo | 523 |
| P10 | -108 |
| P50 | 526 |
| P90 | 1.001 |
| Probabilidad de resultado negativo (condicional) | 12% |

## Probabilidad de superar umbrales

| Umbral | Valor | Probabilidad |
|---|---|---|
| No pierde plata | 0,00 | 88% |
| USD 400/mes (duplica el aporte) | 400 | 65% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| sde_mensual | 420 | 686 | 1.064 |
| retorno_anual | -0,05 | 0,28 | 0,40 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | precio_compra — HIPÓTESIS: precio pagado (USD) | 8.000 a 45.000 | 97 | 1.100 | 1.003 |
| 2 | colapso — HIPÓTESIS: probabilidad de colapso (fraude, cambio de plataforma, pérdida de canal) | 0,00 a 1,00 | 496 | -120 | 616 |
| 3 | multiplo — HECHO→ESTIMACIÓN: múltiplo de SDE anual en negocios chicos con dependencia del dueño (2–4x) | 2,00 a 3,80 | 639 | 279 | 360 |
| 4 | variacion_ingresos — HIPÓTESIS: variación del flujo tras la compra (pérdida de conocimiento del dueño, IA que erosiona el nicho) | -0,40 a 0,15 | 241 | 573 | 331 |
| 5 | costo_operacion — ESTIMACIÓN: herramientas + freelancers + parte del plan de IA | 50 a 300 | 492 | 242 | 250 |
| 6 | mejora_ia — HIPÓTESIS: mejora por operar con IA (soporte, contenido, código, precios) | 0,00 a 0,50 | 351 | 587 | 236 |

## Lectura

Rinde 20–40% anual en USD en el caso base, con cola de pérdida por colapso. La calidad de la due diligence (verificación de ingresos en el procesador de pagos, dependencia de un canal, tendencia) pesa más que el precio. Buena cobertura contra riesgo Argentina: ingresos en USD de clientes globales.
