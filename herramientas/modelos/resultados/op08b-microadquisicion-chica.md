# Escenarios — OP-08b: Compra de un micro-negocio digital que ya vende solo (USD 3–12 k), operado con IA, a 3 años

*Salida*: **retorno_anual_pct** (% anual sobre el precio (3 años. incluye valor final)). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

| Caso | Valor |
|---|---|
| Base (todos los supuestos en su valor más probable) | 13 |
| Media Monte Carlo | 13 |
| P10 | -24 |
| P50 | 14 |
| P90 | 43 |
| Probabilidad de resultado negativo (condicional) | 29% |

## Probabilidad de superar umbrales

| Umbral | Valor | Probabilidad |
|---|---|---|
| No pierde plata | 0,00 | 71% |
| Supera la tesorería (~7% anual) | 7,00 | 61% |
| Supera 20% anual | 20 | 40% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| beneficio_mensual | 169 | 261 | 395 |
| flujo_mes12 | 0,00 | 174 | 340 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | colapso — HIPÓTESIS: fraude no detectado o pérdida del canal (más probable en operaciones chicas) | 0,00 a 1,00 | 23 | -27 | 50 |
| 2 | variacion_1a — HIPÓTESIS: cambio del beneficio en el primer año (se va el dueño, competencia con IA, cambios de la plataforma) | -0,50 a 0,20 | -9,87 | 36 | 46 |
| 3 | multiplo — HECHO→ESTIMACIÓN: Flippa, mediana 1,68x el beneficio anual en operaciones de USD 10–100 k; SaaS en Acquire 3,9x (2025) | 1,40 a 3,20 | 30 | -2,60 | 33 |
| 4 | tendencia — HIPÓTESIS: variación anual del beneficio desde el segundo año | -0,30 a 0,20 | -0,80 | 31 | 32 |
| 5 | costo_operacion — ESTIMACIÓN: hosting, herramientas y cuota de IA atribuible (USD/mes) | 15 a 100 | 19 | -1,15 | 20 |
| 6 | mejora_ia — HIPÓTESIS: mejora por operar con IA (soporte, arreglos, precios, funciones nuevas) | 0,00 a 0,40 | 8,17 | 29 | 20 |
| 7 | precio — HIPÓTESIS: precio pagado; se junta con ~12 meses de aporte | 3.000 a 12.000 | 3,66 | 18 | 14 |
| 8 | factor_salida — HIPÓTESIS: múltiplo de reventa al año 3 relativo al de compra | 0,60 a 1,00 | 8,63 | 16 | 7,46 |
| 9 | mes_colapso — HIPÓTESIS: mes en que colapsa, si colapsa | 1,00 a 24 | 12 | 17 | 4,95 |

## Lectura

Es la forma más directa de "comprar ingresos que ya se venden solos", pero el precio bajo de los activos chicos es el precio de su riesgo (dependencia del dueño, caída de la demanda, fraude). Comprando "al promedio" el rendimiento esperado se parece al de la tesorería con mucho más riesgo; lo que lo vuelve atractivo es comprar mejor que el promedio (menos probabilidad de colapso) y operar mejor (tendencia y mejora). Las dos variables que más mueven el resultado son la tendencia del negocio y el múltiplo pagado: la due diligence vale más que la negociación.
