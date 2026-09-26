---
id: OP-08
titulo: "Micro-adquisiciones de negocios digitales en USD operados con IA"
estado: explorar
rol: cobertura
tipo: adquisicion
resumen: "Comprar pequeños negocios digitales rentables (micro-SaaS, plugins, extensiones, nichos de contenido o e-commerce) a 2–4 veces el beneficio anual en marketplaces como Acquire.com, y operarlos con IA. Ingresos en USD de clientes globales: cobertura contra el riesgo Argentina y uso de caja de las otras unidades."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2027+ (cuando la cartera acumule USD 10–20k o aparezca financiación del vendedor)"
modelo: herramientas/modelos/op08-microadquisicion.yaml
capital:
  minimo_usd: 5000
  optimo_usd: 20000
  acelerado_usd: 45000
  maximo_razonable_usd: 100000
  mensual_usd: 120
horas_semana: 6
ia_ejecutable_pct: 70
semanas_a_primer_aprendizaje: 8
meses_a_primer_ingreso: 12
riesgo_politico_2027: bajo
rampa: false
puntajes:
  dolor_y_pago: 3
  economia_unitaria: 4
  distribucion: 4
  defensibilidad: 2
  ajuste_fundador: 3
  palanca_ia: 5
  ventana: 3
  opcionalidad: 4
  sinergias: 3
  velocidad_aprendizaje: 2
  robustez: 5
gates: {problema_pagado: si, distribucion: si, economia: si, experimento_barato: si, downside_acotado: pendiente, legal: pendiente}
escenarios_36m:
  fracaso: {prob: 0.25, flujo_mensual: 0, capital_perdido_usd: 10000}
  base: {prob: 0.55, flujo_mensual: 500}
  expansivo: {prob: 0.20, flujo_mensual: 1000}
multiplo_terminal_meses: 30   # reventa ≈ 2,5x flujo anual
sinergias: [OP-07]
proximo_paso: "Ejercicio sin capital: due diligence simulada de 5 listados reales en Acquire/Flippa para calibrar criterios (mes 3–6); resolver estructura legal/impositiva para tener activos y cobros en USD"
---

# OP-08 — Micro-adquisiciones digitales en USD

## 1. Tesis en una línea

Hay miles de pequeños negocios digitales rentables que sus dueños quieren vender a 2–4 veces el beneficio anual; con IA, operar uno
(código, soporte, contenido, marketing) cuesta una fracción de lo que le costaba al dueño, y los ingresos son en dólares de clientes
de todo el mundo.

## 2. Evidencia

| Afirmación | Tipo | Fuente |
|---|---|---|
| SaaS *bootstrapped* se vende a ~2–3x ingresos o 3–7x beneficio; micro SaaS 2–3,5x ARR; negocios < USD 1 M con dependencia del dueño a 2–4x SDE | HECHO (rango de mercado) | Acquire.com Multiples Report ene-2026; FE International; bigideasdb |
| Listados promedio en Acquire piden ~USD 434–484k (sesgo a negocios grandes) | HECHO | bigideasdb (522 listados) |
| Existen operaciones de USD 5–50k (plugins, extensiones, herramientas nicho) | HECHO (orden de magnitud) | Marketplaces |
| Con IA, el costo de operar baja y el flujo puede mejorar 0–50% | HIPÓTESIS | Primer caso |

## 3. Economía (una operación)

Modelo `herramientas/modelos/op08-microadquisicion.yaml`: compra de ~USD 20.000 a 2,8x → base ≈ USD 420/mes; P10/P50/P90 =
−USD 110 / +530 / +1.000 por mes; **retorno anual P50 ≈ 28%** en USD; 12% de probabilidad de colapso modelada. Lo que más pesa:
precio pagado, colapso (fraude, cambio de plataforma) y múltiplo.

## 4. Criterios de compra (borrador para el comité)

- Beneficio verificable 12+ meses en el procesador de pagos (acceso de solo lectura), no en capturas.
- Sin dependencia > 50% de un solo canal (una keyword de Google, una tienda de apps) o con plan para mitigarla.
- Producto que la IA pueda mantener (stack común, código legible).
- Nicho que la IA **no** vuelva gratis en 2 años (evitar sitios de contenido genérico).
- Precio ≤ 3x SDE; financiación del vendedor de 20–40% cuando sea posible.

## 5. Riesgos

Fraude en métricas; erosión por IA del propio nicho; dependencia de plataformas; tiempo de soporte subestimado; cuestiones legales e
impositivas de un residente argentino que posee activos y cobra en el exterior (resolver antes de comprar: estructura, cuentas,
declaración). Mitigación: due diligence con checklist, empezar chico, custodia (*escrow*) del marketplace.

## 6. Rol en cartera

**Cobertura** contra riesgo Argentina (ingresos en USD de clientes globales) y destino de la caja de las unidades motor a partir del
año 2. No compite por las horas del fundador en el año 1.

## 7. Veredicto

**Explorar (sin capital) ahora; activar en 2027.** IVR menor que las unidades de servicio por ser intensivo en capital, pero muy
superior a la tesorería y con alta robustez. Primer paso sin costo: practicar *due diligence* con Claude sobre listados reales.
