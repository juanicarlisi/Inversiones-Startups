---
id: OP-14
titulo: "App de suscripción en una tienda B2B, graduada desde la fábrica de herramientas"
estado: radar
rol: motor-de-caja
tipo: producto-en-marketplace
resumen: "Cuando una herramienta de OP-12 muestra usuarios recurrentes que crecen, se convierte en una app de suscripción en una tienda con demanda propia (Shopify App Store, Chrome Web Store, Google Workspace Marketplace). Un acierto rinde mucho más que la fábrica, pero pide producto, reseñas y soporte (que la IA puede atender con reglas aprobadas por el fundador)."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2027+: solo tras una graduación desde OP-12"
modelo: herramientas/modelos/op14-app-suscripcion.yaml
capital:
  minimo_usd: 200
  optimo_usd: 1000
  acelerado_usd: 3000
  maximo_razonable_usd: 6000
  mensual_usd: 60
horas_semana: 3
ia_ejecutable_pct: 80
semanas_a_primer_aprendizaje: 8
meses_a_primer_ingreso: 4
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 3
  economia_unitaria: 4
  distribucion: 3
  defensibilidad: 3
  ajuste_fundador: 3
  palanca_ia: 5
  ventana: 3
  opcionalidad: 3
  sinergias: 4
  velocidad_aprendizaje: 3
  robustez: 3
gates: {problema_pagado: pendiente, distribucion: si, economia: pendiente, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.80, flujo_mensual: 0, capital_perdido_usd: 1000}
  base: {prob: 0.13, flujo_mensual: 700}
  expansivo: {prob: 0.07, flujo_mensual: 2500}
multiplo_terminal_meses: 30
sinergias: [OP-12, OP-08]
proximo_paso: "Nada hasta que una herramienta de OP-12 cumpla la regla de graduación (usuarios recurrentes crecientes 3 meses seguidos)"
---

# OP-14 — App de suscripción graduada

## Evidencia (2026)

- Shopify App Store: ~16.800–17.600 apps; el desarrollador conserva 100% del primer USD 1 M de por vida y paga 15% después;
  mediana del plan más barato de apps pagas USD 9,99/mes (HECHO: shopify.dev; BetaKit; Meetanshi).
- Chrome: ~50% de las extensiones monetizadas gana < USD 100/mes; ~5% > USD 10.000/mes (HECHO: Konabayev; Chrome Goldmine).
- App Store de Apple: +84% de envíos en 1T-2026 por apps hechas con IA; más competencia y revisiones más lentas (HECHO:
  AppleInsider 05-04-2026). → Evitar tiendas de consumo masivo; preferir tiendas B2B con compradores que pagan por resolver trabajo.

## Economía

Modelo `op14-app-suscripcion.yaml`: 20% de probabilidad de tracción; si funciona, P50 ≈ USD 1.340/mes al mes 18; incondicional
media ≈ USD 280/mes y mediana −40 (se cierra). Por eso no se arranca de cero: se gradúa lo que ya mostró demanda.

## Veredicto

**Radar.** Se activa solo por graduación desde OP-12. El soporte a clientes lo responde la IA con plantillas aprobadas por el
fundador (autorización permanente acotada, registrada como decisión).
