---
id: OP-XX
titulo: "Nombre corto y concreto"
estado: explorar            # radar | explorar | validar | construir | escalar | pausa | inversion | descartada
rol: motor-de-caja          # motor-de-caja | plataforma | canal | datos | activo-de-renta | opcion | cobertura
tipo: servicio-recurrente   # libre: servicio-recurrente, intermediacion, producto, adquisicion, activo-financiero, inmobiliario...
resumen: "Tesis en una oración: quién paga, por qué, por qué ahora, por qué nosotros."
fecha_alta: 2026-01-01
fecha_revision: 2026-01-01
ventana: "2026–2028"
modelo: herramientas/modelos/opXX-nombre.yaml
capital:
  minimo_usd: 0             # lo imprescindible para aprender si funciona
  optimo_usd: 0             # lo que maximiza valor por dólar
  acelerado_usd: 0          # lo que compra velocidad
  maximo_razonable_usd: 0   # por encima, el dólar marginal rinde menos que la tesorería
  mensual_usd: 0            # gasto mensual típico en validación
horas_semana: 0
ia_ejecutable_pct: 0        # % del trabajo que puede hacer la IA con supervisión
semanas_a_primer_aprendizaje: 0
meses_a_primer_ingreso: 0
riesgo_politico_2027: medio # bajo | medio | alto
rampa: true                 # false para activos que rinden desde el mes 1
puntajes:                   # 0–5, ver rúbricas en doctrina/01
  dolor_y_pago: 0
  economia_unitaria: 0
  distribucion: 0
  defensibilidad: 0
  ajuste_fundador: 0
  palanca_ia: 0
  ventana: 0
  opcionalidad: 0
  sinergias: 0
  velocidad_aprendizaje: 0
  robustez: 0
gates: {problema_pagado: pendiente, distribucion: pendiente, economia: pendiente, experimento_barato: pendiente, downside_acotado: pendiente, legal: pendiente}
escenarios_36m:             # flujo de caja neto mensual al mes 36 (USD); probabilidades suman 1
  fracaso: {prob: 0.5, flujo_mensual: 0, capital_perdido_usd: 0}
  base: {prob: 0.35, flujo_mensual: 0}
  expansivo: {prob: 0.15, flujo_mensual: 0}
multiplo_terminal_meses: 12 # meses de flujo que valdría la unidad (venta o continuidad)
sinergias: []
proximo_paso: "Acción concreta, con responsable y fecha"
---

# OP-XX — Título

## 1. Tesis en una línea
## 2. Por qué ahora
## 3. Problema, cliente y alternativa actual
## 4. Evidencia (HECHOS con fuente y fecha) e hipótesis
## 5. La oferta (y lo que NO hacemos)
## 6. Economía: escenarios y sensibilidad
## 7. Capital por tramos e hitos
## 8. Distribución: primeros 10 clientes y canal escalable
## 9. Competencia y defensibilidad
## 10. Palanca IA: qué hace Claude
## 11. Riesgos y pre-mortem
## 12. Validación: plan 30/60/90 con criterios de éxito y muerte
## 13. Rol en cartera, sinergias y la oportunidad detrás de la oportunidad
## 14. Qué tendría que ser cierto
## 15. Veredicto
