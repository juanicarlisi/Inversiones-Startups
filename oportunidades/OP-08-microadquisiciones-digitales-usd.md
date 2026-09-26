---
id: OP-08
titulo: "Micro-adquisiciones de negocios digitales en USD operados con IA"
estado: validar
rol: cobertura
tipo: adquisicion
resumen: "Comprar ingresos que ya se venden solos: pequeños negocios digitales rentables (micro-SaaS, plugins, extensiones, nichos de contenido o e-commerce) a 2–4 veces el beneficio anual en marketplaces como Acquire.com, y operarlos con IA. Ingresos en USD de clientes globales: cobertura contra el riesgo Argentina y uso de caja de las otras unidades."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "Primera compra chica (USD 3–8 k) entre el mes 6 y el 12; compras mayores desde 2028 con la caja acumulada"
modelo: herramientas/modelos/op08b-microadquisicion-chica.yaml
capital:
  minimo_usd: 3000
  optimo_usd: 6000
  acelerado_usd: 45000
  maximo_razonable_usd: 100000
  mensual_usd: 40
horas_semana: 4
ia_ejecutable_pct: 70
semanas_a_primer_aprendizaje: 8
meses_a_primer_ingreso: 10
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
  fracaso: {prob: 0.25, flujo_mensual: 0, capital_perdido_usd: 6000}
  base: {prob: 0.55, flujo_mensual: 170}
  expansivo: {prob: 0.20, flujo_mensual: 330}
multiplo_terminal_meses: 30   # reventa ≈ 2,5x flujo anual
sinergias: [OP-12, OP-14, OP-09]
proximo_paso: "Primer paso (DEC-2026-09-26-6): comprar una app o juego Android chico con AdMob verificado en Flippa (USD 1.000–2.500 del ahorro) entre el mes 6 y el 9, tras 3 análisis de práctica (EXP-08, alternativa F1 del catálogo). Compras mayores (F2) en el año 2."
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

## 7. Actualización 2026-09-26: tramo chico y preferencia "sin vender"

El fundador prefiere ingresos que no dependan de salir a vender. Comprar un negocio que **ya** vende por un canal con demanda propia
(tienda de apps, marketplace, buscador) es la forma más directa. Se agrega un tramo chico para empezar antes:

- Evidencia nueva: Flippa, mediana 1,68x el beneficio anual en operaciones de USD 10–100 k; SaaS en Acquire 3,9x (2025); Microns
  y Flippa listan negocios desde ~USD 500–1.000 (HECHO, ver `conocimiento/2026-09-26-investigacion-ingresos-sin-vender.md`).
- Modelo `op08b-microadquisicion-chica.yaml` (USD 3–12 k, 3 años, incluye valor final): **media 13% anual**, P10 / P50 / P90 =
  −24% / 14% / 43%; 61% de probabilidad de superar a la tesorería. Comprando "al promedio" el rendimiento se parece al de la
  tesorería con mucho más riesgo; lo que lo vuelve atractivo es **comprar mejor que el promedio** (menos colapsos) y **operar
  mejor** (tendencia y mejora con IA). Las variables que más mueven el resultado: colapso, caída del primer año, múltiplo y tendencia.
- Cobro en USD: el BCRA permite a personas humanas no liquidar divisas por exportación de servicios (Com. "A" 8417 y 8481/2026).

## 8. Veredicto

**Validar (sin capital) ya; primera compra chica entre el mes 6 y el 12.** Antes, en orden: criterios escritos, 5 due diligence
simuladas, estructura de cobro y declaración resuelta. Veredicto anterior: **Explorar (sin capital) ahora; activar en 2027.** IVR menor que las unidades de servicio por ser intensivo en capital, pero muy
superior a la tesorería y con alta robustez. Primer paso sin costo: practicar *due diligence* con Claude sobre listados reales.
