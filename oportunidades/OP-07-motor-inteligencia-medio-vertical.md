---
id: OP-07
titulo: "Motor de inteligencia + medio vertical (comex, logística, pymes)"
estado: pausa
rol: canal
tipo: medio-y-datos
resumen: "El radar interno que igual hay que mantener, convertido en un medio vertical en español para quienes deciden en comercio exterior, logística y pymes: qué cambió, a quién afecta y qué hacer. La IA hace el 80–90%; el valor es la audiencia propia, el flujo de oportunidades y los leads para las unidades operativas."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "Permanente; hoy hay exceso de cambios normativos (>17.000 artículos desregulados) y los resúmenes genéricos ya son commodity"
modelo: herramientas/modelos/op07-radar-medio.yaml
capital:
  minimo_usd: 50
  optimo_usd: 800
  acelerado_usd: 3000
  maximo_razonable_usd: 8000
  mensual_usd: 60
horas_semana: 4
ia_ejecutable_pct: 85
semanas_a_primer_aprendizaje: 4
meses_a_primer_ingreso: 6
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 2
  economia_unitaria: 3
  distribucion: 3
  defensibilidad: 3
  ajuste_fundador: 4
  palanca_ia: 5
  ventana: 3
  opcionalidad: 4
  sinergias: 5
  velocidad_aprendizaje: 3
  robustez: 4
gates: {problema_pagado: pendiente, distribucion: pendiente, economia: si, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.50, flujo_mensual: 0, capital_perdido_usd: 500}
  base: {prob: 0.38, flujo_mensual: 600}
  expansivo: {prob: 0.12, flujo_mensual: 2000}
multiplo_terminal_meses: 12
sinergias: [OP-01, OP-02, OP-03, OP-04, OP-06]
proximo_paso: "PAUSA (DEC-2026-09-26-5: el fundador prefiere ingresos sin salir a vender; requiere construir audiencia y vender publicidad o suscripciones; además, las respuestas de IA de los buscadores reducen clics). Revive si el fundador decide vender o aparece un socio que venda. Paso previsto: Publicar 8 ediciones semanales gratuitas 'Comex y Logística: qué cambió y qué hacer' en LinkedIn + email + canal de WhatsApp (EXP-06)"
---

# OP-07 — Motor de inteligencia + medio vertical

## 1. Tesis en una línea

La organización necesita un radar permanente; si ese radar se publica con criterio para un nicho que decide (importadores,
exportadores, transportistas, operadores logísticos, pymes industriales), se convierte en **canal propio de distribución** para las
demás unidades y, secundariamente, en ingresos por suscripción y patrocinio.

## 2. Por qué y por qué no

- **A favor**: exceso de cambios (el Ministerio de Desregulación contabiliza >17.000 artículos modificados; decretos de comercio
  exterior, courier, líneas usadas, UE–Mercosur, fin del *de minimis*, FAL…). Los que deciden no tienen tiempo de leer.
- **En contra**: los **resúmenes genéricos del Boletín Oficial ya existen gratis** (p. ej. BOA, boa.com.ar) y los estudios jurídicos
  publican alertas gratuitas. La disposición a pagar por información es baja. Por eso el negocio no es "resumir", sino **decir qué
  hacer** en un nicho específico con números (costo puesto en planta, impacto en el flete, qué papel hay que presentar).

## 3. Producto

- **Edición semanal gratuita**: 5 cambios que importan, a quién afectan, qué hacer, con fuente y fecha.
- **Premium** (USD 5–20/mes): calculadoras (costo de importación con el arancel nuevo, régimen de líneas usadas, costo por viaje),
  alertas por posición arancelaria o tema, archivo buscable.
- **Ediciones por vertical** según tracción: Comex/Logística (principal), Pymes y Trabajo (FAL, reforma laboral), Proveedores RIGI
  (opción para OP-06), Consorcios (contenido para OP-01).

## 4. Economía

Modelo `herramientas/modelos/op07-radar-medio.yaml`: si funciona, base ≈ USD 965/mes (80 pagos × USD 10 + medio sponsor + leads);
incondicional media ≈ USD 1.230 (50% de tracción). Como negocio aislado es **modesto y lento**; el valor está en los leads y el
flujo de oportunidades (difícil de medir: se registra la fuente de cada cliente de las otras unidades).

## 5. Palanca IA

La IA hace 80–90%: vigila fuentes, detecta cambios, redacta, calcula impactos, arma gráficos y mantiene calculadoras. El fundador:
elige qué importa (criterio logístico), agrega opinión, responde a lectores.

## 6. Distribución

LinkedIn (perfil del fundador como voz experta en logística/comex), newsletter por email (propiedad de la lista), canal de WhatsApp,
comunidades de despachantes y transportistas, alianzas con cámaras. SEO limitado (las respuestas de IA de los buscadores reducen
clics): no depender de él.

## 7. Riesgos

Falta de constancia (se mitiga con rutina automática: `/radar`); errores en datos normativos (verificación en fuente primaria antes
de publicar); canibalización por medios grandes (nicho y utilidad).

## 8. Validación

EXP-06: 8 ediciones semanales. *Éxito*: ≥ 300 suscriptores gratuitos, ≥ 40% de apertura y ≥ 3 conversaciones comerciales derivadas
para OP-02/03/04. *Muerte*: < 100 suscriptores y 0 conversaciones.

## 9. Rol en cartera

**Canal y datos**: la infraestructura compartida de distribución de la cartera. Reutiliza el radar que el sistema mantiene de todas
formas, por lo que su costo marginal es mínimo.

## 10. Veredicto

**Validar ya, en paralelo y con pocas horas.** No por su economía propia, sino porque abarata la adquisición de clientes de todas las
demás unidades y mantiene vivo el radar.
