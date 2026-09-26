# Escenarios — OP-07: Motor de inteligencia + medio vertical (comex / pymes / proveedores RIGI) — régimen al mes 24

*Salida*: **valor_total** (USD/mes). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

Probabilidad de tracción supuesta: **50%** (si no hay tracción la unidad se cierra: valor 0,00). *Condicional* = si funciona; *incondicional* = incluye el fracaso.

| Caso | Condicional (si funciona) | Incondicional |
|---|---|---|
| Base (supuestos en su valor más probable) | 965 | — |
| Media Monte Carlo | 2.464 | 1.229 |
| P10 | 1.114 | 0,00 |
| P50 | 2.262 | 0,00 |
| P90 | 4.117 | 3.424 |
| Probabilidad de resultado negativo (condicional) | 0% |

## Probabilidad de superar umbrales

| Umbral | Valor | Si funciona | Incondicional |
|---|---|---|---|
| Genera valor (> USD 100/mes) | 100 | 100% | 50% |
| Motor de caja (USD 1.000/mes) | 1.000 | 93% | 46% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingresos_directos | 970 | 2.064 | 3.907 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | suscriptores_pagos — HIPÓTESIS: suscriptores pagos del tier premium | 10 a 400 | 265 | 4.165 | 3.900 |
| 2 | precio — HIPÓTESIS: precio mensual del tier premium (USD) | 5,00 a 20 | 565 | 1.765 | 1.200 |
| 3 | valor_leads — INFERENCIA: valor mensual de los leads que el medio deriva a otras unidades (OP-02, OP-03, OP-04) | 0,00 a 1.000 | 765 | 1.765 | 1.000 |
| 4 | sponsors — HIPÓTESIS: sponsors por mes (despachantes, forwarders, ALyC, software) | 0,00 a 3,00 | 840 | 1.590 | 750 |
| 5 | pauta — ESTIMACIÓN: promoción | 0,00 a 300 | 1.065 | 765 | 300 |
| 6 | tarifa_sponsor — HIPÓTESIS: USD por mes por sponsor | 100 a 600 | 890 | 1.140 | 250 |
| 7 | herramientas — ESTIMACIÓN: plataforma de envíos, dominio, API | 30 a 150 | 995 | 875 | 120 |

## Lectura

Como negocio aislado es modesto y lento. Su valor real es de infraestructura: audiencia propia, flujo de oportunidades y leads para las unidades operativas, y el radar interno que igual hay que mantener. Casi todo el trabajo lo hace la IA.
