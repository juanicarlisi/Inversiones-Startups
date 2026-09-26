# Escenarios — OP-14: Una app de suscripción en una tienda B2B (Shopify App Store / Chrome Web Store) que ya probó demanda como herramienta

*Salida*: **margen** (USD/mes (mes 18)). Iteraciones: 20.000. Semilla: 42.

> Los supuestos son ESTIMACIONES/HIPÓTESIS (ver comentarios del modelo). El valor del ejercicio está en el rango y en el
> ranking de sensibilidad, no en un número puntual.

## Resultado

Probabilidad de tracción supuesta: **20%** (si no hay tracción la unidad se cierra: valor -40). *Condicional* = si funciona; *incondicional* = incluye el fracaso.

| Caso | Condicional (si funciona) | Incondicional |
|---|---|---|
| Base (supuestos en su valor más probable) | 624 | — |
| Media Monte Carlo | 1.543 | 280 |
| P10 | 523 | -40 |
| P50 | 1.340 | -40 |
| P90 | 2.882 | 1.357 |
| Probabilidad de resultado negativo (condicional) | 0% |

## Probabilidad de superar umbrales

| Umbral | Valor | Si funciona | Incondicional |
|---|---|---|---|
| Cubre sus costos | 0,00 | 100% | 20% |
| USD 400/mes | 400 | 95% | 19% |
| USD 1.000/mes | 1.000 | 66% | 13% |

## Variables intermedias (P10 / P50 / P90)

| Variable | P10 | P50 | P90 |
|---|---|---|---|
| ingresos | 600 | 1.416 | 2.958 |

## Sensibilidad (tornado): qué validar primero

| # | Supuesto | Rango probado | Salida con mín. | Salida con máx. | Amplitud |
|---|---|---|---|---|---|
| 1 | suscriptores — HIPÓTESIS: suscriptores pagos al mes 18 si la app encuentra demanda | 15 a 250 | 111 | 2.790 | 2.679 |
| 2 | precio — HECHO→ESTIMACIÓN: mediana del plan más barato de apps pagas en Shopify USD 9,99/mes (2026) | 6,00 a 30 | 282 | 1.650 | 1.368 |
| 3 | costos — ESTIMACIÓN: hosting, APIs (incluida IA) y soporte asistido por IA | 20 a 150 | 664 | 534 | 130 |
| 4 | comision — HECHO: Shopify 0% hasta USD 1 M de por vida; ExtensionPay 5%; merchant of record 5% + 0,50 | 0,00 a 0,15 | 660 | 552 | 108 |

## Lectura

Un acierto rinde mucho más por herramienta que la fábrica, pero pide producto, reseñas y soporte. Por eso no se arranca de cero: se "gradúa" una herramienta de OP-12 que ya mostró usuarios recurrentes. Chrome: la mitad de las extensiones monetizadas gana menos de USD 100/mes y ~5% más de USD 10.000.
