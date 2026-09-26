# Escenarios — K20: Alquilar una GPU de gama alta (tipo RTX 5090) desde casa en un marketplace de cómputo

*Salida*: **margen** (USD/mes por equipo). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

| Caso | Valor |
|---|---|
| Base (todos los supuestos en su valor más probable) | -37 |
| Media Monte Carlo | -35 |
| P10 | -72 |
| P50 | -36 |
| P90 | 3,27 |
| Probabilidad de resultado negativo (condicional) | 88% |

## Probabilidad de superar umbrales

| Umbral | Valor | Probabilidad |
|---|---|---|
| No pierde plata | 0,00 | 12% |
| Rinde más que la tesorería con el mismo capital (~USD 30/mes) | 30 | 2% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingreso | 67 | 98 | 138 |
| electricidad | 29 | 40 | 52 |
| amortizacion | 72 | 93 | 120 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | precio_hora — HECHO: RTX 5090 en Vast.ai desde ~USD 0,27–0,31/h (spot desde 0,09) en 2026 | 0,20 a 0,45 | -67 | 9,12 | 76 |
| 2 | utilizacion — HIPÓTESIS: fracción del tiempo alquilada (depende de confiabilidad y conexión) | 0,25 a 0,80 | -68 | 0,15 | 68 |
| 3 | vida_util — HIPÓTESIS: meses de vida comercial | 24 a 48 | -82 | -14 | 68 |
| 4 | precio_equipo — HECHO→ESTIMACIÓN: placa USD 3.500–5.000 en sep-2026 (escasez de GDDR7) + resto del equipo + importación formal (supera el tope courier de USD 3.000) | 4.000 a 6.500 | -19 | -64 | 45 |
| 5 | valor_residual — HIPÓTESIS: reventa al final | 0,20 a 0,50 | -58 | -16 | 42 |
| 6 | tarifa — HECHO→ESTIMACIÓN: CABA residencial sin subsidio + impuestos | 0,11 a 0,18 | -29 | -48 | 19 |
| 7 | consumo_kw — ESTIMACIÓN: placa + resto del equipo bajo carga | 0,45 a 0,75 | -29 | -44 | 15 |

## Lectura

Se compite contra centros de datos con energía más barata y conexiones más confiables; la placa se deprecia y los precios de alquiler bajan a medida que entra oferta. El caso típico pierde plata o empata; el caso bueno no compensa el riesgo frente a la tesorería.
