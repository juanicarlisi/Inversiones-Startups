---
id: OP-11
titulo: "Energía distribuida como activo de renta (solar + baterías en consorcios y comercios de AMBA)"
estado: radar
rol: activo-de-renta
tipo: activo-real
resumen: "Sin subsidios (usuarios pagan ~86% del costo) y con cortes masivos en AMBA, un sistema solar comercial se repaga en 3–4 años. En lugar de instalar (mercado competido), ser dueño de los sistemas y cobrar la energía o un alquiler (modelo PPA / 'energía como servicio'), empezando por los consorcios de OP-01."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2030 (tarifas sin subsidio + paneles y baterías baratos + financiamiento de fideicomisos con autorización automática)"
modelo: ""
capital:
  minimo_usd: 6000
  optimo_usd: 15000
  acelerado_usd: 40000
  maximo_razonable_usd: 150000
  mensual_usd: 0
horas_semana: 2
ia_ejecutable_pct: 40
semanas_a_primer_aprendizaje: 8
meses_a_primer_ingreso: 6
riesgo_politico_2027: medio
rampa: true
puntajes:
  dolor_y_pago: 4
  economia_unitaria: 4
  distribucion: 3
  defensibilidad: 3
  ajuste_fundador: 3
  palanca_ia: 2
  ventana: 4
  opcionalidad: 4
  sinergias: 5
  velocidad_aprendizaje: 2
  robustez: 3
gates: {problema_pagado: si, distribucion: pendiente, economia: pendiente, experimento_barato: pendiente, downside_acotado: pendiente, legal: pendiente}
escenarios_36m:
  fracaso: {prob: 0.20, flujo_mensual: 0, capital_perdido_usd: 5000}
  base: {prob: 0.60, flujo_mensual: 250}
  expansivo: {prob: 0.20, flujo_mensual: 600}
multiplo_terminal_meses: 60   # valor residual ≈ capital depreciado
sinergias: [OP-01]
proximo_paso: "Disparador V-03: cuando OP-01 administre ≥ 15 edificios o la cartera tenga ≥ USD 10.000, modelar un PPA en 1 edificio y 1 comercio reales"
---

# OP-11 — Energía distribuida como activo de renta

## 1. Tesis

La combinación de **tarifas sin subsidio**, **cortes frecuentes** y **equipos baratos** vuelve rentable la generación propia en
comercios y espacios comunes de edificios; el negocio más defendible no es instalar (competido y de mano de obra) sino **financiar y
ser dueño** del sistema, cobrando al usuario menos de lo que paga hoy.

## 2. Evidencia

- Usuarios cubren ~86% del costo de la electricidad en 2026 (vs 29% en dic-2023) (Ámbito).
- Generación distribuida: de 67 usuarios-generadores (2019) a 4.253 y 143 MW (mar-2026); 79% de la potencia es comercial/industrial
  (pv magazine LatAm). Crecimiento "exponencial" tras las subas, pero ínfimo frente a ~16 M de usuarios.
- Costos: residencial USD 1.100–1.300/kWp instalado; comercio 15–20 kWp con repago estimado de 3–4 años con tarifas 2026
  (blogs de instaladores: fuente interesada, verificar).
- Ya existe "energía como servicio" (SolarPower: alquiler solar en UVAs con 10% inicial) y marketplaces (SolarPool).
- Cortes AMBA: hasta 715.000 usuarios de Edesur afectados en el verano 2025–26; ~600.000 el 20-09-2026.
- Financiación: CNV RG 1159/2026 (autorización automática de fideicomisos financieros) facilita titulizar carteras de contratos a futuro.

## 3. Economía preliminar (HIPÓTESIS, a modelar con un caso real)

Sistema de 10 kWp en un comercio: inversión ~USD 11–14k; si ahorra al usuario ~USD 250–350/mes y el contrato cobra el 80% del
ahorro, ingreso ~USD 200–280/mes → repago 4–5 años, TIR en USD ~15–22% a 20 años, con riesgo de crédito del cliente, de tarifa y
regulatorio. En consorcios, el ahorro se refleja en expensas (argumento comercial para OP-01).

## 4. Riesgos

Riesgo de crédito (pyme que deja de pagar), cambios de tarifa o de reglas de inyección/net billing por provincia/distribuidora,
robo o daño, capital intensivo, regulación de propiedad horizontal para usar la terraza.

## 5. Veredicto

**Radar con disparador V-03.** Buena candidata a primer **activo de renta** de la cartera en el año 2, con sinergia directa con
OP-01 (edificios administrados) y financiable con fideicomisos cuando haya volumen.
