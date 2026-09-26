# Plan "ingresos sin salir a vender" — resultados de la simulación

Generado por `herramientas/plan_sin_venta.py` con `cartera/plan-sin-venta.yaml` (60 meses, aporte USD 400/mes). Todo se reinvierte; "ingreso pasivo" es lo que el sistema podría pagar ese mes si se retirara.

| Escenario | Ingreso pasivo mes 12 (P10 / P50 / P90) | Mes 24 | Mes 60 | Patrimonio mes 60 (P50) | P(ingreso ≥ USD 400 al mes 60) |
|---|---|---|---|---|---|
| Plan base (renta + fábrica + compras) | 31 / 153 / 814 | 129 / 338 / 1.274 | 248 / 598 / 1.923 | 33.267 | 73% |
| Plan base con ahorro inicial de USD 5.000 | 144 / 276 / 945 | 229 / 487 / 1.404 | 314 / 755 / 2.092 | 44.761 | 83% |
| Plan base + motos con operador (satélite) | 30 / 151 / 855 | 152 / 277 / 1.249 | 331 / 683 / 1.969 | 35.085 | 84% |
| Solo renta (con riesgo de shock) | 22 / 24 / 27 | 47 / 52 / 57 | 135 / 149 / 165 | 28.200 | 0% |

Valores en USD por mes; 10.000 simulaciones. Referencia sin shock (solo renta al 6,5%): USD 24 / 53 / 150 por mes a los meses 12 / 24 / 60 y patrimonio de USD 28.270 al mes 60 (aportado: USD 24.000). En el plan base la fábrica sobrevive a la regla de corte en 85% de las simulaciones y el patrimonio al mes 60 supera al de solo renta en 67%.
