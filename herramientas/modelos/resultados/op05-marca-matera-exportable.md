# Escenarios — OP-05: Marca matera premium exportable (Amazon EE.UU. vía FBA, envío a granel) — régimen al mes 18

*Salida*: **margen** (USD/mes). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

Probabilidad de tracción supuesta: **35%** (si no hay tracción la unidad se cierra: valor -150). *Condicional* = si funciona; *incondicional* = incluye el fracaso.

| Caso | Condicional (si funciona) | Incondicional |
|---|---|---|
| Base (supuestos en su valor más probable) | 709 | — |
| Media Monte Carlo | 1.050 | 281 |
| P10 | -4.131 | -1.217 |
| P50 | 661 | -150 |
| P90 | 6.854 | 2.992 |
| Probabilidad de resultado negativo (condicional) | 42% |

## Probabilidad de superar umbrales

| Umbral | Valor | Si funciona | Incondicional |
|---|---|---|---|
| No pierde plata | 0,00 | 58% | 21% |
| Motor de caja (USD 1.000/mes) | 1.000 | 46% | 16% |
| Unidad relevante (USD 3.000/mes) | 3.000 | 28% | 10% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| contrib_unidad | -6,37 | 1,97 | 11 |
| margen_pct | -0,14 | 0,04 | 0,18 |
| capital_trabajo | 17.359 | 39.475 | 75.088 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | precio — ESTIMACIÓN: precio de venta de un kit premium (calabaza/cuero + bombilla de alpaca + accesorios); Amazon muestra kits USD 25–60 | 35 a 75 | -2.980 | 5.700 | 8.680 |
| 2 | cogs — ESTIMACIÓN: costo del kit artesanal en Argentina + packaging (USD) | 10 a 26 | 3.159 | -2.441 | 5.600 |
| 3 | tacos — HIPÓTESIS CRÍTICA: publicidad como % de ventas totales | 0,08 a 0,30 | 2.529 | -1.475 | 4.004 |
| 4 | unidades_mes — HIPÓTESIS: kits vendidos por mes en régimen | 60 a 1.500 | -86 | 3.860 | 3.946 |
| 5 | flete_arancel — ESTIMACIÓN: flete a granel a depósito FBA + arancel EE.UU. (efectivo promedio AR ~5,7%) | 2,50 a 8,00 | 1.409 | -516 | 1.925 |
| 6 | devoluciones — ESTIMACIÓN: devoluciones y roturas como % de ventas | 0,02 a 0,10 | 1.255 | -201 | 1.456 |
| 7 | fba — ESTIMACIÓN: tarifa de fulfillment de Amazon por unidad | 6,00 a 10 | 1.409 | 9,00 | 1.400 |
| 8 | fijos — ESTIMACIÓN: software, almacenamiento, fotos, cuenta vendedor | 100 a 500 | 859 | 459 | 400 |

## Lectura

La exportación de accesorios de mate por Amazon solo funciona en el segmento premium, con precio ≥ USD 50 y publicidad ≤ 15% de las ventas. En el segmento medio (USD 30–40) la contribución por unidad es cercana a cero por costos de fulfillment y publicidad. Además inmoviliza capital de trabajo (3 meses de inventario). Validar precio y TACoS con una tanda chica (100–200 kits) antes de producir en serie.
