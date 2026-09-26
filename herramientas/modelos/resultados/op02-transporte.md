# Escenarios — OP-02: Oficina virtual con IA para transportistas pyme — régimen al mes 24

*Salida*: **margen_operativo** (USD/mes). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

Probabilidad de tracción supuesta: **35%** (si no hay tracción la unidad se cierra: valor 0,00). *Condicional* = si funciona; *incondicional* = incluye el fracaso.

| Caso | Condicional (si funciona) | Incondicional |
|---|---|---|
| Base (supuestos en su valor más probable) | 1.605 | — |
| Media Monte Carlo | 3.567 | 1.252 |
| P10 | 848 | 0,00 |
| P50 | 2.896 | 0,00 |
| P90 | 7.177 | 4.422 |
| Probabilidad de resultado negativo (condicional) | 0% |

## Probabilidad de superar umbrales

| Umbral | Valor | Si funciona | Incondicional |
|---|---|---|---|
| Cubre el aporte mensual (USD 400) | 400 | 97% | 34% |
| Motor de caja (USD 1.000/mes) | 1.000 | 87% | 30% |
| Unidad relevante (USD 3.000/mes) | 3.000 | 48% | 17% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingresos | 1.793 | 4.503 | 9.736 |
| contrib_cliente | 41 | 94 | 179 |
| ltv | 844 | 2.062 | 4.328 |
| ltv_cac | 3,19 | 8,90 | 22 |
| caja_neta | -100 | 2.023 | 6.339 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | clientes — HIPÓTESIS: empresas de transporte (1–20 camiones) activas al mes 24 | 3,00 a 80 | 87 | 5.400 | 5.313 |
| 2 | camiones — HIPÓTESIS: camiones promedio por cliente (programas oficiales apuntan a ≤5) | 2,00 a 10 | 555 | 4.755 | 4.200 |
| 3 | precio_camion — HIPÓTESIS CRÍTICA: USD por camión/mes (un administrativo part-time cuesta USD 400–800/mes) | 12 a 45 | 305 | 3.605 | 3.300 |
| 4 | costo_ia_camion — ESTIMACIÓN: API + WhatsApp + integraciones por camión/mes | 2,00 a 8,00 | 1.805 | 1.205 | 600 |
| 5 | horas_cliente — HIPÓTESIS: horas humanas por cliente/mes (excepciones, carga inicial, llamadas) | 1,00 a 5,00 | 1.830 | 1.230 | 600 |
| 6 | costo_hora — ESTIMACIÓN: hora de asistente operativo | 4,00 a 9,00 | 1.730 | 1.418 | 312 |
| 7 | fijos — ESTIMACIÓN: fijos (software, contador, dominio) | 50 a 250 | 1.675 | 1.475 | 200 |
| 8 | churn — HIPÓTESIS: bajas mensuales | 0,02 a 0,08 | 1.605 | 1.605 | 0,00 |
| 9 | cac — HIPÓTESIS: costo de adquirir un cliente (pauta en grupos/Meta + demo + horas) | 60 a 500 | 1.605 | 1.605 | 0,00 |
| 10 | nuevos_mes — HIPÓTESIS: clientes nuevos por mes en régimen | 1,00 a 7,00 | 1.605 | 1.605 | 0,00 |

## Lectura

La variable dominante es el precio por camión, seguida de la cantidad de clientes. La economía unitaria es buena si el transportista paga ≥ USD 20 por camión; por debajo de USD 15 la unidad no justifica el esfuerzo comercial. Validar primero disposición a pagar con un servicio "concierge" (humano + IA) a 5 transportistas durante 30 días.
