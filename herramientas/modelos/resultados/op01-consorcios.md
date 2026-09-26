# Escenarios — OP-01: Administración de consorcios aumentada por IA (CABA) — régimen al mes 30

*Salida*: **margen_operativo** (USD/mes). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

Probabilidad de tracción supuesta: **55%** (si no hay tracción la unidad se cierra: valor 0,00). *Condicional* = si funciona; *incondicional* = incluye el fracaso.

| Caso | Condicional (si funciona) | Incondicional |
|---|---|---|
| Base (supuestos en su valor más probable) | 1.405 | — |
| Media Monte Carlo | 2.058 | 1.137 |
| P10 | 772 | 0,00 |
| P50 | 1.867 | 740 |
| P90 | 3.636 | 3.066 |
| Probabilidad de resultado negativo (condicional) | 0% |

## Probabilidad de superar umbrales

| Umbral | Valor | Si funciona | Incondicional |
|---|---|---|---|
| Cubre el aporte mensual (USD 400) | 400 | 98% | 54% |
| Motor de caja (USD 1.000/mes) | 1.000 | 83% | 46% |
| Unidad relevante (USD 3.000/mes) | 3.000 | 19% | 11% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingresos | 1.607 | 3.193 | 5.519 |
| costo_servir | 447 | 901 | 1.581 |
| caja_neta | -230 | 1.038 | 2.835 |
| margen_pct | 0,44 | 0,59 | 0,70 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | edificios — HIPÓTESIS: edificios administrados al mes 30 (orgánico ~1/mes desde el mes 6 + eventual compra de cartera) | 6,00 a 70 | 223 | 4.204 | 3.981 |
| 2 | honorario — HECHO→ESTIMACIÓN: honorario CAPHAI jun-2026 $50–400k/mes según tamaño; mix medio ≈ $120k ≈ USD 80 | 50 a 130 | 588 | 2.767 | 2.180 |
| 3 | horas_por_edificio — HIPÓTESIS: horas humanas por edificio/mes con IA (asambleas, emergencias, supervisión). Tradicional ≈ 8–12 | 1,50 a 5,00 | 1.630 | 1.105 | 525 |
| 4 | extra_pct — ESTIMACIÓN: ingresos extra (liquidación de sueldos del encargado, certificados, gestiones) como % del honorario | 0,05 a 0,30 | 1.205 | 1.705 | 500 |
| 5 | costo_hora — ESTIMACIÓN: costo de una hora de asistente operativo (USD) | 4,00 a 9,00 | 1.555 | 1.180 | 375 |
| 6 | frac_adquiridos — HIPÓTESIS: fracción de edificios que vino de comprar carteras | 0,00 a 0,50 | 1.525 | 1.225 | 300 |
| 7 | costo_ia — ESTIMACIÓN: API + WhatsApp + software + hosting por edificio y mes | 4,00 a 15 | 1.480 | 1.205 | 275 |
| 8 | fijos — ESTIMACIÓN: fijos (contador, renovación RPA, seguros, cuenta bancaria, dominio) | 80 a 300 | 1.475 | 1.255 | 220 |
| 9 | earnout_pct — HIPÓTESIS: % del honorario que se paga al vendedor durante el earn-out | 0,20 a 0,40 | 1.445 | 1.365 | 80 |
| 10 | nuevos_mes — HIPÓTESIS: edificios nuevos por mes en régimen | 0,50 a 4,00 | 1.405 | 1.405 | 0,00 |
| 11 | cac — HIPÓTESIS: costo de adquirir un edificio (pauta + auditorías gratuitas + horas) | 100 a 900 | 1.405 | 1.405 | 0,00 |

## Lectura

El resultado lo decide casi todo la cantidad de edificios (distribución) y el honorario; la IA baja el costo de servir de ~USD 50–70 por edificio (modelo tradicional, 8–12 h/mes) a ~USD 25, lo que lleva el margen operativo a 55–65%. Primera validación: ¿cuántos edificios consigue un imán de "auditoría gratuita de expensas" por cada USD 100 de pauta? Segunda: precio real de las carteras en venta (meses de honorario) y su retención tras el traspaso.
