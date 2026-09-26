# Escenarios — OP-12: Fábrica de herramientas para desarrolladores y agentes de IA (Apify Store + MCP + x402), construida por Claude

*Salida*: **margen** (USD/mes (mes 12)). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

| Caso | Valor |
|---|---|
| Base (todos los supuestos en su valor más probable) | 100 |
| Media Monte Carlo | 195 |
| P10 | -6,39 |
| P50 | 70 |
| P90 | 683 |
| Probabilidad de resultado negativo (condicional) | 13% |

## Probabilidad de superar umbrales

| Umbral | Valor | Probabilidad |
|---|---|---|
| Cubre su costo | 0,00 | 87% |
| USD 100/mes netos | 100 | 39% |
| USD 400/mes netos (iguala el aporte) | 400 | 17% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingresos_cola | 44 | 102 | 210 |
| ingresos | 48 | 122 | 735 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | hit — HIPÓTESIS: al menos una herramienta 'pega' (usuarios recurrentes o un cliente grande) | 0,00 a 1,00 | 20 | 420 | 400 |
| 2 | ingreso_hit — HECHO→ESTIMACIÓN: la primera herramienta de ParseForge paga ~USD 1.000/mes; los mejores independientes > USD 10.000 | 150 a 1.500 | 50 | 320 | 270 |
| 3 | ingreso_tipico — HECHO→ESTIMACIÓN: ingreso neto mensual de una herramienta que cobra algo; mediana USD 14 entre las 829 de terceros del top-900 (2026) | 2,00 a 25 | 48 | 249 | 201 |
| 4 | herramientas — HIPÓTESIS: herramientas publicadas y mantenidas al mes 12 (Claude construye ~1 por semana; el fundador revisa) | 15 a 70 | 60 | 170 | 110 |
| 5 | frac_con_ingresos — HIPÓTESIS: fracción que genera algún ingreso (fuera del top-900 de Apify la mayoría no cobra) | 0,10 a 0,40 | 58 | 142 | 84 |
| 6 | costo_fijo — ESTIMACIÓN: parte atribuible de Claude Max 5x (compartido con todo el sistema) + proxies y dominios | 30 a 80 | 120 | 70 | 50 |

## Lectura

Distribución de ley de potencias: la mediana es modesta y la media la tiran pocos aciertos. La variable que más mueve el resultado es si aparece una herramienta que pega; por eso la estrategia es muchos intentos baratos con regla de corte, no una apuesta grande. El valor extra (no modelado) es aprender a operar herramientas que después se pueden comprar (OP-08) y quedar posicionado en la economía de agentes que pagan por uso (x402).
