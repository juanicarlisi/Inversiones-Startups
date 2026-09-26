# Escenarios — OP-13: Financiar la herramienta de trabajo de repartidores: motos alquiladas a través de un operador (por moto)

*Salida*: **retorno_anual_pct** (% anual sobre lo invertido). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

| Caso | Valor |
|---|---|
| Base (todos los supuestos en su valor más probable) | 23 |
| Media Monte Carlo | 21 |
| P10 | -6,25 |
| P50 | 23 |
| P90 | 37 |
| Probabilidad de resultado negativo (condicional) | 12% |

## Probabilidad de superar umbrales

| Umbral | Valor | Probabilidad |
|---|---|---|
| No pierde plata | 0,00 | 88% |
| Supera la tesorería (~7%) | 7,00 | 87% |
| Supera 20% anual | 20 | 61% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingreso_mensual | 89 | 110 | 133 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | perdida — HIPÓTESIS: pérdida grave en la vida útil (robo sin cobertura plena, fraude del operador, juicio por accidente) | 0,00 a 1,00 | 28 | -12 | 40 |
| 2 | parte_inversor — HIPÓTESIS: lo que el operador paga al dueño después de seguro, patente, mantenimiento, cobranza y su margen | 0,30 a 0,50 | 9,87 | 36 | 26 |
| 3 | alquiler_bruto — HECHO→ESTIMACIÓN: $120–125 mil por semana con seguro, patente y mantenimiento ≈ USD 330/mes a $1.545 (sep-2026); baja si el peso se deprecia | 250 a 400 | 10 | 34 | 24 |
| 4 | vida_util_meses — HIPÓTESIS: vida útil en reparto intensivo | 24 a 42 | 16 | 31 | 16 |
| 5 | ocupacion — HIPÓTESIS: semanas cobradas sobre semanas totales (hay lista de espera; la mora y el recambio de repartidores la bajan) | 0,70 a 0,95 | 12 | 27 | 15 |
| 6 | precio_moto — HECHO→ESTIMACIÓN: Honda Wave 110S $3,43–4,02 M (sep-2026) ≈ USD 2.220–2.600 + patentamiento | 2.300 a 2.900 | 28 | 16 | 12 |
| 7 | valor_residual — HIPÓTESIS: valor de reventa al final, como fracción del precio | 0,15 a 0,45 | 18 | 28 | 11 |

## Lectura

Rendimiento alto porque el repartidor no tiene crédito y paga caro el acceso a la moto: es el precio del riesgo (robo, mora, accidentes, operador). Solo tiene sentido con un operador verificable, contrato escrito, seguro de responsabilidad civil con límites altos y la moto con rastreo. La variante socialmente más sana (alquiler con opción de compra) baja un poco el retorno y alinea incentivos con el repartidor.
