---
id: OP-16
titulo: "Logistic Lab: calculadoras y simuladores logísticos en español (depósito + distribución), por módulos"
estado: validar
rol: plataforma
tipo: software-freemium
resumen: "Plataforma web de calculadoras y simuladores logísticos en español que crece por módulos (costos de depósito, picking, personal, costo por km, tarifas, punto de equilibrio, flujo de fondos; luego simulación 2D/3D). Freemium para profesionales + licencias para cátedras. Usa el conocimiento del fundador; Claude programa. Es la versión producto de OP-04 (que requería vender estudios)."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2029: herramientas profesionales caras (AnyLogic/FlexSim a cotizar) y poca oferta en español; Expo Logisti-k 2026 con 26.000 profesionales"
modelo: oportunidades/catalogo.yaml#C1
capital:
  minimo_usd: 100
  optimo_usd: 300
  acelerado_usd: 2000
  maximo_razonable_usd: 5000
  mensual_usd: 50
horas_semana: 3
ia_ejecutable_pct: 80
semanas_a_primer_aprendizaje: 10
meses_a_primer_ingreso: 6
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 3
  economia_unitaria: 4
  distribucion: 3
  defensibilidad: 4
  ajuste_fundador: 5
  palanca_ia: 4
  ventana: 4
  opcionalidad: 5
  sinergias: 4
  velocidad_aprendizaje: 3
  robustez: 4
gates: {problema_pagado: pendiente, distribucion: pendiente, economia: pendiente, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.75, flujo_mensual: 0, capital_perdido_usd: 800}
  base: {prob: 0.18, flujo_mensual: 2500}
  expansivo: {prob: 0.07, flujo_mensual: 7000}
multiplo_terminal_meses: 36
sinergias: [OP-04, OP-07, OP-12, OP-15]
proximo_paso: "Fundador: las 5 calculadoras que más le hubieran servido + planillas/apuntes; Claude: primeras 5 calculadoras online en 8 semanas con fórmulas documentadas (EXP-10)"
---

# OP-16 — Logistic Lab

Ficha completa: alternativa **C1** en `oportunidades/catalogo.yaml` e informe 3 (capítulo 6). Relacionadas: juego de cadena de
suministro para cátedras (C2), plantillas (C3), asistente de comex (B2) y la versión "herramientas para agentes" (C4/OP-12).

## Tesis
Tu conocimiento de logística es la ventaja: sabés qué calcular y cómo validarlo. Con Claude programando, cada módulo cuesta semanas
en lugar de meses. Primero lo gratis y útil (atrae profesionales y estudiantes), después Pro y cátedras.

## Qué NO hacemos
Construir el simulador 3D completo antes de tener usuarios (alternativa C6, descartada): módulos de 4 semanas con usuarios reales.

## Regla de corte
Mes 9: si no hay 500 usuarios mensuales ni una cátedra usándola, queda solo lo gratis y el tiempo va al motor 1.

## Veredicto
**Validar ya (motor 2 del plan, desde el mes 2; DEC-2026-09-26-6).**
