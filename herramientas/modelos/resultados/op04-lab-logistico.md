# Escenarios — OP-04: Laboratorio de decisiones logísticas (simulación como servicio) — régimen al mes 18

*Salida*: **margen** (USD/mes). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

Probabilidad de tracción supuesta: **45%** (si no hay tracción la unidad se cierra: valor 0,00). *Condicional* = si funciona; *incondicional* = incluye el fracaso.

| Caso | Condicional (si funciona) | Incondicional |
|---|---|---|
| Base (supuestos en su valor más probable) | 1.033 | — |
| Media Monte Carlo | 2.254 | 1.020 |
| P10 | 923 | 0,00 |
| P50 | 2.074 | 0,00 |
| P90 | 3.857 | 3.058 |
| Probabilidad de resultado negativo (condicional) | 0% |

## Probabilidad de superar umbrales

| Umbral | Valor | Si funciona | Incondicional |
|---|---|---|---|
| Cubre herramientas + aporte (USD 400) | 400 | 99% | 45% |
| Motor de caja (USD 1.000/mes) | 1.000 | 88% | 40% |
| Unidad relevante (USD 3.000/mes) | 3.000 | 23% | 11% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingresos | 1.398 | 2.595 | 4.429 |
| horas_mes | 8,77 | 19 | 36 |
| usd_por_hora | 51 | 110 | 222 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | proyectos_trimestre — HIPÓTESIS: estudios vendidos por trimestre | 0,30 a 3,00 | 380 | 2.900 | 2.520 |
| 2 | ticket — HIPÓTESIS: precio por estudio (dimensionamiento de flota, depósito, muelles, multimodal) | 1.000 a 8.000 | 367 | 2.700 | 2.333 |
| 3 | clientes_recurrentes — HIPÓTESIS: clientes que pagan mantenimiento del modelo/gemelo digital | 0,00 a 4,00 | 633 | 2.233 | 1.600 |
| 4 | fee_recurrente — HIPÓTESIS: fee mensual por modelo mantenido | 150 a 1.000 | 783 | 1.633 | 850 |
| 5 | marketing — ESTIMACIÓN: contenido técnico + LinkedIn + eventos | 50 a 400 | 1.133 | 783 | 350 |
| 6 | costo_directo — ESTIMACIÓN: datos, relevamiento, traslados por estudio | 50 a 800 | 1.083 | 833 | 250 |
| 7 | herramientas — ESTIMACIÓN: Claude Max 5x/20x + cómputo | 100 a 220 | 1.083 | 963 | 120 |
| 8 | horas_por_proyecto — ESTIMACIÓN: horas del fundador por estudio (la IA construye el modelo) | 15 a 80 | 1.033 | 1.033 | 0,00 |

## Lectura

El valor está en vender decisiones caras (flota, depósito, multimodal) y reutilizar los modelos. El precio y la frecuencia de proyectos dominan. Es la forma de monetizar el conocimiento logístico del fundador desde el mes 1 y de financiar, con clientes reales, la eventual versión producto (SaaS vertical).
