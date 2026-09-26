---
id: OP-02
titulo: "Oficina virtual con IA para transportistas pyme"
estado: validar
rol: motor-de-caja
tipo: servicio-recurrente
resumen: "El 87% del transporte de cargas argentino opera sin sistemas y el 37% de los camiones viaja vacío. Un servicio por WhatsApp, hecho por IA con supervisión humana, le lleva la administración a transportistas de 1–20 camiones (viajes, documentos, facturación, cobranzas, vencimientos, rentabilidad por viaje) por menos que un administrativo part-time; y abre la puerta a financiar facturas y llenar retornos."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2028 (IA barata + sector analógico + fondo de flota viejo que obliga a cuidar margen)"
modelo: herramientas/modelos/op02-transporte.yaml
capital:
  minimo_usd: 200
  optimo_usd: 2000
  acelerado_usd: 8000
  maximo_razonable_usd: 25000
  mensual_usd: 150
horas_semana: 10
ia_ejecutable_pct: 70
semanas_a_primer_aprendizaje: 3
meses_a_primer_ingreso: 2
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 4
  economia_unitaria: 4
  distribucion: 3
  defensibilidad: 3
  ajuste_fundador: 5
  palanca_ia: 5
  ventana: 3
  opcionalidad: 4
  sinergias: 4
  velocidad_aprendizaje: 4
  robustez: 4
gates: {problema_pagado: pendiente, distribucion: pendiente, economia: si, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.60, flujo_mensual: 0, capital_perdido_usd: 1200}
  base: {prob: 0.28, flujo_mensual: 1500}
  expansivo: {prob: 0.12, flujo_mensual: 4500}
multiplo_terminal_meses: 24
sinergias: [OP-04, OP-07, OP-03]
proximo_paso: "20 entrevistas a transportistas de 1–20 camiones + servicio concierge a 5 durante 30 días (EXP-02)"
---

# OP-02 — Oficina virtual con IA para transportistas pyme

## 1. Tesis en una línea

Los pequeños transportistas pierden plata por administración: viajes mal cobrados, facturas que se atrasan, documentos vencidos,
retornos vacíos y ninguna idea de cuánto gana cada camión; una "oficina" que funciona por WhatsApp, hecha por IA y supervisada por
alguien que conoce logística, puede resolverlo por un precio que se paga solo.

## 2. Por qué ahora

- **HECHO**: ~87% de las empresas de transporte de cargas opera sin sistemas digitales (teléfono, planillas, confirmación verbal);
  1 de cada 10 usa tecnología avanzada; **4,2% integra IA**; **37% de los camiones viaja vacío** (Índice de Digitalización del
  Transporte 2026, Avancargo, n=378; jun-2026).
- **HECHO**: ~416.000 camiones y tractores interjurisdiccionales, **antigüedad promedio 20 años**; programas oficiales apuntan a
  transportistas con ≤ 5 camiones (FADEEAC / Nación).
- **HECHO**: la Factura de Crédito Electrónica MiPyME es obligatoria desde $5.549.862 (abr-2026) con 21 días hábiles de
  aceptación: el transportista que le factura a grandes empresas necesita gestionarla bien para cobrar o descontarla.
- **Costo de ejecución**: un agente IA por WhatsApp cuesta ~USD 0,15–0,25 por conversación (ver `doctrina/05-palanca-ia.md`).
- **Ajuste fundador**: el fundador conoce logística; habla el idioma del cliente.

## 3. Problema, cliente y alternativa actual

- **Cliente**: dueño-transportista o pyme de 1–20 camiones (a menudo el dueño maneja uno). Decide él mismo; paga de su caja.
- **Trabajos que hoy hace mal o de noche**: registrar viajes y gastos (combustible, peajes, viáticos), emitir facturas y cartas de
  porte, perseguir cobranzas (60–90 días), vigilar vencimientos (RUTA, VTV, licencias, seguros), liquidar choferes, saber qué viaje
  conviene y cómo no volver vacío.
- **Alternativa actual**: el propio dueño + un familiar + el contador (que solo factura y liquida impuestos); algunos pagan un
  administrativo part-time (USD 400–800/mes); pocos usan un TMS.
- **Costo del problema** (HIPÓTESIS a validar): 5–15% del ingreso perdido en viajes mal cobrados, demoras de cobro, multas y
  kilómetros vacíos.

## 4. Evidencia e hipótesis

| Afirmación | Tipo | Validación |
|---|---|---|
| Sector mayormente analógico, 37% vacío | HECHO | IDT 2026 (encuesta de una plataforma interesada: sesgo posible) |
| 95% de las 245 M t interzonales sin carga de retorno del mismo producto en el mismo par (2018) | HECHO | Matrices O-D oficiales (repositorio "vacio-lab") |
| El transportista pagaría USD 20–30 por camión/mes por un servicio que le ahorra horas y plata | HIPÓTESIS CRÍTICA | EXP-02 (concierge pago) |
| El servicio se puede operar con ≤ 3 h humanas por cliente/mes | HIPÓTESIS | Medir en el concierge |
| Canales: grupos de WhatsApp/Facebook, cámaras regionales, estaciones de servicio, aseguradoras | HIPÓTESIS | Entrevistas |

## 5. La oferta (y lo que NO hacemos)

"**Tu oficina por WhatsApp**": el transportista manda audios, fotos de tickets y remitos; la oficina registra, factura, persigue
cobranzas, avisa vencimientos y le manda cada lunes un parte simple: cuánto ganó cada camión, qué le deben y qué vence.

Módulos por etapa: (1) registro de viajes y gastos + rentabilidad por viaje; (2) facturación y gestión de FCE; (3) cobranzas y
recordatorios; (4) sugerencias de retorno (alianza con plataformas de cargas; no competir con ellas); (5) financiación de facturas
(derivación a ALyC/SGR con comisión).

**No hacemos**: otro TMS para vender por licencia; una bolsa de cargas propia al principio (Avancargo y otras ya existen).

## 6. Economía: escenarios y sensibilidad

Modelo: `herramientas/modelos/op02-transporte.yaml`.

| Régimen al mes 24 (si funciona) | Valor |
|---|---|
| Base (25 clientes × 4 camiones × USD 25) | **Margen operativo ≈ USD 1.600/mes** |
| P10 / P50 / P90 | USD 850 / 2.900 / 7.200 |
| Contribución por cliente (P50) | ~USD 94/mes; **LTV/CAC P50 ≈ 9** |
| Probabilidad de > USD 1.000/mes | 87% si funciona; **30% incondicional** (35% de tracción supuesta) |

**Qué mueve el resultado**: clientes, camiones por cliente y **precio por camión**. Si el precio real es USD 12–15 por camión, la
unidad no justifica el esfuerzo; si es ≥ USD 20, es un motor de caja con muy poco capital.

## 7. Capital por tramos e hitos

| Tramo | USD | Compra | Hito que lo libera |
|---|---|---|---|
| Mínimo | 200 | Número de WhatsApp Business, formularios, planillas, 1 mes de pauta mínima | — |
| Óptimo | 2.000 | WhatsApp API + agente, integraciones, 6 meses de pauta y visitas | 5 clientes concierge pagando ≥ USD 20/camión tras 30 días |
| Acelerado | 8.000 | Asistente operativo + producto más automatizado (Max 20x en sprint) | 20 clientes con churn < 5% mensual |
| Máximo razonable | 25.000 | Equipo comercial regional, alianzas con aseguradoras | CAC < USD 250 con 3 canales probados |

## 8. Distribución

- **Primeros 10**: red del fundador en logística; grupos de WhatsApp/Facebook de transportistas; paradores y estaciones de
  servicio en accesos a AMBA (Mercado Central, Puerto, Zárate–Campana); cámaras regionales (CATAC, FADEEAC); dadores de carga que
  quieren que sus fleteros estén ordenados.
- **Escalable**: referidos (los transportistas se hablan todo el tiempo), alianzas con aseguradoras de flota y tarjetas de
  combustible, contenido corto (videos de "cuánto te queda por viaje").

## 9. Competencia y defensibilidad

- TMS SaaS (Avancargo y otros), contadores, planillas. Diferencial: **servicio hecho por nosotros** vía WhatsApp, no software que
  hay que aprender; conocimiento logístico del fundador.
- **Defensa**: historial de datos del cliente (viajes, costos, cobranzas) = switching cost; confianza; efecto red si se suma
  financiación y retornos.

## 10. Palanca IA

Transcripción y clasificación de audios/fotos, registro de viajes y gastos, emisión de comprobantes vía web services de ARCA (con
delegación del cliente), recordatorios, redacción de reclamos de cobro, reporte semanal de rentabilidad, detección de patrones
(viajes que pierden plata). **Humano**: alta del cliente, excepciones, relación, cobros difíciles.

## 11. Riesgos y pre-mortem

| Causa probable de fracaso | Mitigación |
|---|---|
| El transportista no paga por "administración" | Vender ahorro concreto (cobranzas recuperadas, viajes que pierden plata); precio por camión bajo; primer mes gratis contra informe |
| Informalidad: parte del negocio no se factura | Segmentar a quienes facturan a grandes empresas (FCE obligatoria) |
| Errores en facturación con clave fiscal del cliente | Nivel L0/L1: la IA prepara, el cliente confirma; delegaciones acotadas |
| Churn alto en temporadas bajas | Precio estacional; valor en cobranzas |
| Una plataforma grande lanza lo mismo | Nicho en servicio y confianza; alianza antes que competencia |

## 12. Validación: plan 30/60/90

- **1–30**: 20 entrevistas (guion preparado por Claude); elegir 5 para concierge pago simbólico (USD 10/camión) durante 30 días.
  *Éxito*: ≥ 3 de 5 dicen que pagarían ≥ USD 20/camión y usan el servicio ≥ 3 veces por semana. *Muerte*: < 2 de 5.
- **31–60**: automatizar los 3 flujos más usados; subir precio; medir horas por cliente. *Éxito*: ≤ 3 h/cliente/mes.
- **61–90**: 10 clientes pagos. Decisión: acelerar o archivar.

## 13. Rol en cartera y la oportunidad detrás

Motor de caja con alta palanca IA. Detrás: **datos de costos reales por tramo** (insumo para OP-04 y para un índice de fletes),
**financiación de facturas** (comisiones de derivación), **retornos** (alianzas), **seguros de flota**. Reutiliza el mismo
back-office IA que OP-01.

## 14. Qué tendría que ser cierto

1. Hay un segmento (transportistas que facturan a empresas) que valora orden y cobranza por ≥ USD 20 por camión/mes.
2. La IA procesa audios/fotos con precisión suficiente para operar en L1.
3. Los referidos funcionan (CAC < USD 250).

## 15. Veredicto

**Validar en paralelo con OP-01.** Máximo ajuste con el fundador (logística) y máxima palanca IA. Riesgo principal: disposición a
pagar. Se valida en 30 días con casi cero capital.
