---
id: OP-15
titulo: "Suite cristiana en español: trivia bíblica, versículo del día, compañero IA y agenda de eventos"
estado: validar
rol: motor-de-caja
tipo: producto-en-marketplace
resumen: "App Android para la comunidad cristiana hispana, construida por Claude y difundida por la comunidad del fundador (no hay que salir a vender): trivia bíblica por niveles y desafíos entre amigos, versículo del día en la pantalla de inicio, estudio con IA (premium) y agenda de eventos. Ingresos por video recompensado + premium USD 2–4/mes."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2028: apps de fe en auge (Hallow ~USD 40 M en 2025; Bible Chat 25 M de descargas) y evangélicos en Argentina 17,4% (UBA 2026)"
modelo: oportunidades/catalogo.yaml#A1
capital:
  minimo_usd: 50
  optimo_usd: 150
  acelerado_usd: 1500
  maximo_razonable_usd: 3000
  mensual_usd: 30
horas_semana: 4
ia_ejecutable_pct: 85
semanas_a_primer_aprendizaje: 8
meses_a_primer_ingreso: 3
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 3
  economia_unitaria: 3
  distribucion: 5
  defensibilidad: 3
  ajuste_fundador: 5
  palanca_ia: 5
  ventana: 4
  opcionalidad: 4
  sinergias: 4
  velocidad_aprendizaje: 4
  robustez: 3
gates: {problema_pagado: si, distribucion: si, economia: pendiente, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.70, flujo_mensual: 0, capital_perdido_usd: 500}
  base: {prob: 0.22, flujo_mensual: 1500}
  expansivo: {prob: 0.08, flujo_mensual: 5000}
multiplo_terminal_meses: 24
sinergias: [OP-08, OP-16]
proximo_paso: "Fundador: enfoque (interdenominacional o evangélico), 1–2 revisores, cuenta de Google Play + AdMob, 12 testers; Claude: banco de 3.000 preguntas con citas y primera versión en 5 semanas (EXP-09)"
---

# OP-15 — Suite cristiana en español

Ficha completa con números, gantt, riesgos y regla de corte: alternativa **A1** en `oportunidades/catalogo.yaml` e informe 3
(`informes/2026-09-el-plan.pdf`, capítulo 6).

## Tesis
La comunidad del fundador resuelve el problema más caro de una app con publicidad: los primeros usuarios (comprar instalaciones en
Latinoamérica cuesta USD 0,50–2 y la publicidad deja menos que eso). Claude construye y mantiene; el fundador decide, revisa y comparte.

## Evidencia (HECHOS, 2026)
- Evangélicos en Argentina 17,4% (> 8 millones; Barómetro Ocrear-UBA, jun-2026).
- YouVersion 1.000 M de instalaciones (nov-2025); Hallow ~USD 40 M de ingresos en 2025; Bible Chat 25 M de descargas.
- Publicidad en Latinoamérica: 5–20% de lo que paga un usuario de EE.UU.; video recompensado es el formato que más paga.
- Google Play: 12 testers × 14 días para cuentas personales nuevas; verificación de identidad desde sep-2026.

## Regla de corte
Mes 6: si no hay 1.000 usuarios activos por semana o menos de 10% vuelve a la semana, se congela y el tiempo pasa al radar de nichos (A10).

## Veredicto
**Validar ya (motor 1 del plan, DEC-2026-09-26-6).**

## Idea a validar: imágenes para compartir (26-09-2026)
HIPÓTESIS: un módulo de "imagen del día" (versículo sobre un fondo lindo, con el nombre de quien la manda) que se comparte por
WhatsApp y estados puede ser el motor de crecimiento de la suite. En Play Store hay muchas apps de "imágenes cristianas" y "buenos
días con bendiciones" (demanda probada, casi todas hechas con plantillas). Costo casi cero: los fondos se generan una vez (~USD 0,003–0,04
cada uno) y el texto se arma en el teléfono. Cada imagen compartida lleva el nombre de la app. Surge de evaluar el generador de
imágenes genérico (A14, descartado). Validar con el radar de nichos (A10) cuando haya acceso a play.google.com.
