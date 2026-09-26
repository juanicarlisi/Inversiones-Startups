---
id: OP-01
titulo: "Administración de consorcios aumentada por IA (CABA)"
estado: validar
rol: motor-de-caja
tipo: servicio-recurrente
resumen: "Administrar edificios de CABA con un back-office operado por IA: mismo precio que un administrador tradicional, más transparencia y respuesta, y la mitad del costo de servir. Cuña para una plataforma de servicios recurrentes (compras, seguros, energía, contabilidad)."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2029 (IA barata + administradores envejecidos + nuevas obligaciones CABA)"
modelo: herramientas/modelos/op01-consorcios.yaml
capital:
  minimo_usd: 300
  optimo_usd: 2500
  acelerado_usd: 20000
  maximo_razonable_usd: 60000
  mensual_usd: 200
horas_semana: 12
ia_ejecutable_pct: 65
semanas_a_primer_aprendizaje: 3
meses_a_primer_ingreso: 4
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 4
  economia_unitaria: 4
  distribucion: 3
  defensibilidad: 3
  ajuste_fundador: 4
  palanca_ia: 4
  ventana: 3
  opcionalidad: 4
  sinergias: 5
  velocidad_aprendizaje: 4
  robustez: 5
gates: {problema_pagado: si, distribucion: pendiente, economia: si, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.45, flujo_mensual: 0, capital_perdido_usd: 1500}
  base: {prob: 0.40, flujo_mensual: 1500}
  expansivo: {prob: 0.15, flujo_mensual: 3800}
multiplo_terminal_meses: 20
sinergias: [OP-07, OP-11, R11]
proximo_paso: "Inscribirse al curso RPA (≥40 h) y lanzar el imán 'auditoría gratuita de expensas' con USD 100 de pauta (EXP-01)"
---

# OP-01 — Administración de consorcios aumentada por IA (CABA)

## 1. Tesis en una línea

En CABA hay **más de 122.000 consorcios** que pagan todos los meses un honorario de administración, atendidos por miles de
administradores chicos, analógicos y cada vez más controlados; con IA se puede administrar con la mitad del costo y más
transparencia, ganar edificios por comparación (y comprando carteras de administradores que se retiran), y usar esa base como
plataforma para vender servicios de mayor margen.

## 2. Por qué ahora

- **Costo de ejecución**: liquidar expensas, conciliar pagos, gestionar proveedores y responder consultas es trabajo de texto y
  planillas que la IA ya hace a costo marginal (~USD 1 por millón de tokens, sep-2026).
- **Presión regulatoria**: la Disposición 1129/DGDYPC/2026 agregó plazos, obligaciones de información, sanciones y un canal de
  denuncias para administradores en CABA. A más cumplimiento, más ventaja para quien lo automatiza.
- **Descontento**: las denuncias contra administradores crecen con la suba de expensas (falta de transparencia, no rendición de
  cuentas, intereses abusivos).
- **Sucesión**: la industria es de dueños mayores y oficinas chicas; solo 16% de las empresas familiares argentinas tiene plan de
  sucesión. Las carteras de edificios se venden informalmente.
- **Modelo probado afuera**: General Catalyst destinó USD 1.500 M a comprar, entre otros, administradores de propiedades para
  recablearlos con IA (2026). En Argentina nadie lo está haciendo.

## 3. Problema, cliente y alternativa actual

- **Pagador**: el consorcio (los propietarios, vía expensas). **Decisor**: la asamblea (mayoría) o el consejo de propietarios.
- **Trabajo a resolver** (JTBD): "que el edificio funcione, que las expensas sean justas y entendibles, que cuando algo se rompe
  alguien responda rápido, y que nadie nos robe".
- **Alternativa actual**: administrador tradicional. Honorarios orientativos (CAPHAI, jun-2026): **$50–120k/mes** para 6–20
  unidades funcionales, **$120–200k** para 20–50, **$200–400k** para 50–100+ (≈ USD 33–260 al oficial de sep-2026).
- **Dolor**: opacidad, demoras, liquidaciones con errores, falta de rendición, comunicación por teléfono en horario de oficina.

## 4. Evidencia e hipótesis

| Afirmación | Tipo | Fuente / validación |
|---|---|---|
| >122.000 consorcios y >1.600.000 unidades funcionales en CABA | HECHO | IGJ (iniciativa de libros rubricados), consultado sep-2026 |
| Honorarios orientativos por tamaño (tabla arriba) | HECHO | CAPHAI / iProfesional, jun-2026 |
| Para administrar en CABA: RPA (Ley 941), curso ≥ 40 h, antecedentes, CUIT, renovación anual | HECHO | Adminia; Liga del Consorcista; AIERH (2026) |
| Curso de 80 h (3 meses) cuesta ~$100.000 (~USD 65) | HECHO | Liga del Consorcista 2026 |
| Nuevas obligaciones y canal de denuncias (Disp. 1129/2026) | HECHO | Liga del Consorcista 2026 |
| El mercado de software de administración ya ofrece IA (WhatsApp, OCR) | HECHO | Adminia, CONSO, Open Administración |
| Pool de honorarios de CABA ≈ USD 95 M/año | ESTIMACIÓN | 122k × ~USD 65 × 12; rango USD 60–140 M |
| Con IA, el costo de servir baja de ~USD 50–70 a ~USD 20–30 por edificio/mes | HIPÓTESIS | Medir en los primeros 5 edificios |
| Un imán de "auditoría gratuita de expensas" genera leads calificados a bajo costo | HIPÓTESIS CRÍTICA | EXP-01 |
| Las carteras se compran a 6–12 meses de honorarios con pago diferido | HIPÓTESIS | Entrevistas con 5 administradores mayores |

## 5. La oferta (y lo que NO hacemos)

**Oferta al consorcio**: administración completa al precio de mercado con tres diferenciales verificables:
1. **Transparencia total**: cada gasto con comprobante visible en línea, explicación en lenguaje simple, comparativa contra
   edificios similares.
2. **Respuesta 24/7** por WhatsApp con asistente IA (identificado como tal) y escalamiento humano para lo urgente.
3. **Ahorro medible**: renegociación de proveedores y seguros con datos de benchmark; informe trimestral de ahorro.

**Cuña B2B paralela (mientras se obtiene el RPA)**: vender a administradores existentes el back-office (liquidación, OCR,
comunicación) a USD 10–20 por edificio/mes. Da caja temprana, aprendizaje del oficio y relación con futuros vendedores de carteras.

**No hacemos**: construir otro software de administración para vender en competencia con los existentes (mercado ya servido);
administrar edificios fuera del radio de densidad (al principio: 3–4 barrios).

## 6. Economía: escenarios y sensibilidad

Modelo: `herramientas/modelos/op01-consorcios.yaml` → resultados en `herramientas/modelos/resultados/op01-consorcios.md`.

| Régimen al mes 30 (si funciona) | Valor |
|---|---|
| Caso base (25 edificios, USD 80 de honorario, 3 h/edificio) | **Margen operativo ≈ USD 1.400/mes** (≈ 61%) |
| P10 / P50 / P90 Monte Carlo | USD 770 / 1.870 / 3.640 por mes |
| Probabilidad de superar USD 1.000/mes | 83% si funciona; **46% incondicional** (con 55% de probabilidad de tracción) |
| Margen operativo (P10 / P50 / P90) | 44% / 59% / 70% |

**Qué mueve el resultado** (tornado): 1) cantidad de edificios, 2) honorario promedio, 3) horas humanas por edificio,
4) ingresos extra. Traducción: **la distribución manda**; la IA asegura el margen pero no trae edificios.

Economía por edificio (base): ingreso USD 92 (incluye 15% de extras) − costo de servir USD 25 − earn-out prorrateado USD 5 ≈
**USD 62 de contribución mensual**. Con CAC de USD 300, **payback ≈ 5 meses**; con vida media de 5+ años, LTV/CAC > 10.

## 7. Capital por tramos e hitos

| Tramo | USD | Compra | Hito que lo libera |
|---|---|---|---|
| Mínimo | 300 | Curso RPA, trámites, landing, primeras auditorías, USD 100 de pauta | — |
| Óptimo | 2.500 | 12 meses de pauta chica, herramientas, seguro, asesoría legal puntual | EXP-01 con ≥ 10 auditorías solicitadas y ≥ 2 asambleas conseguidas |
| Acelerado | 20.000 | Compra de una cartera de 10–20 edificios (con pago diferido, parte contado) | 5 edificios propios funcionando 3 meses con < 3 h/edificio y NPS alto |
| Máximo razonable | 60.000 | 2–3 carteras + asistente operativo | Retención post-compra ≥ 85% en la primera cartera |

## 8. Distribución: primeros 10 clientes y canal escalable

1. **Imán de valor**: "Subí tu liquidación de expensas y en 48 h te decimos si hay gastos anómalos." La IA analiza el PDF,
   detecta rubros fuera de rango y arma un informe. Es útil aunque no nos contraten y genera confianza.
2. **Pauta hiper-local** en Meta (propietarios de 30–70 años en los barrios elegidos). CPM promedio ~USD 1,9 en Argentina.
3. **Red y referidos**: el propio edificio del fundador, familiares, conocidos; cada asamblea ganada se convierte en caso público.
4. **Desarrolladoras e inmobiliarias**: en edificios nuevos, el primer administrador lo designa el desarrollador (canal B2B).
5. **Compra de carteras**: el canal más rápido; se abre con la cuña B2B.

Métrica de canal: costo por auditoría solicitada → % que presenta propuesta en asamblea → % que gana. Supuesto base: USD 10 por
auditoría, 20% llega a asamblea, 30% gana ⇒ **CAC ≈ USD 170** más horas.

## 9. Competencia y defensibilidad

- **Competidores**: miles de administradores (fragmentado); administraciones grandes; software (Adminia, CONSO, Octopus, Open
  Administración) que vende herramientas a administradores, no reemplaza al administrador.
- **¿Qué impide que nos copien en 6 meses?** Poco en tecnología; mucho en **densidad local** (costo de servir por edificio baja con
  la cercanía), **switching costs** (cambiar de administrador exige asamblea), **datos de benchmark** de expensas y proveedores
  (mejoran con cada edificio) y **reputación** local.
- **Riesgo competitivo real**: que un administrador grande adopte IA primero. Respuesta: velocidad y foco en transparencia.

## 10. Palanca IA: qué hace Claude

Liquidación mensual de expensas a partir de facturas (OCR + reglas), conciliación de pagos, detección de morosos y recordatorios,
redacción de actas y convocatorias, asistente de WhatsApp para consultas y reclamos (L1/L2), informe mensual para el consejo,
auditoría de expensas (imán de leads), comparativa de proveedores, seguimiento de vencimientos (seguros, matafuegos, ascensores,
certificaciones), y el *playbook* legal de Ley 941 / Código Civil y Comercial. **Humano**: asambleas, emergencias, relación con
encargados y proveedores, firma y responsabilidad legal.

## 11. Riesgos y pre-mortem

| Si esto fracasa, probablemente fue porque... | Mitigación |
|---|---|
| Las asambleas son lentas y ganar edificios lleva 6–12 meses | Cuña B2B + compra de carteras |
| El fundador no tiene tiempo para asambleas nocturnas y emergencias | Asistente operativo part-time desde el edificio 10; asambleas virtuales cuando la ley lo permita |
| Un error en la liquidación destruye la confianza | Doble control (IA + revisión humana) los primeros 6 meses; seguro de responsabilidad |
| Responsabilidad legal/contable por fondos de terceros | Cuentas separadas por consorcio; asesoría profesional; nunca mezclar fondos |
| Conflictos laborales con encargados (convenio SUTERH) | Liquidación correcta y asesoría laboral |
| Un administrador vendedor se lleva a los clientes | Earn-out atado a retención; acuerdo de no competencia |

## 12. Validación: plan 30/60/90

- **Días 1–30**: inscripción al curso RPA; construir el auditor de expensas (Claude); landing; 5 conversaciones con consejos de
  propietarios; 3 conversaciones con administradores mayores (venta de cartera y cuña B2B). *Éxito*: ≥ 10 auditorías solicitadas con
  ≤ USD 150 de pauta. *Muerte*: < 3 auditorías con USD 150.
- **Días 31–60**: primeras 2 propuestas en asamblea; piloto B2B con 1 administrador (≥ 5 edificios). *Éxito*: 1 edificio ganado o
  1 piloto B2B pago.
- **Días 61–90**: primer mes de administración o de back-office B2B; medir horas reales por edificio. *Éxito*: ≤ 4 h/edificio y
  cliente satisfecho. Decisión de comité: acelerar (comprar cartera) o pausar.

## 13. Rol en cartera, sinergias y la oportunidad detrás de la oportunidad

**Motor de caja** con ingresos indexados a inflación (tablas CAPHAI se actualizan cada 2 meses por IPC) y robusto a 2027.
Detrás de la oportunidad:
- **Compras agregadas**: con 30+ edificios, poder de negociación con limpieza, mantenimiento, ascensores, seguros.
- **Seguros**: comisiones de seguros integrales de consorcio (vía productor asociado o matrícula PAS).
- **Energía**: solar en terrazas y baterías para bombas/ascensores ante cortes (OP-11); el consorcio es un cliente ideal.
- **Plataforma**: el mismo back-office IA sirve para estudios contables (R11) y transportistas (OP-02).
- **Datos**: índice de expensas por barrio (contenido para OP-07 y argumento comercial).

## 14. Qué tendría que ser cierto

1. Se consigue ≥ 1 edificio nuevo por mes a CAC ≤ USD 400 (o carteras a ≤ 12 meses de honorarios con retención ≥ 85%).
2. La IA baja las horas a ≤ 4 por edificio/mes sin deteriorar el servicio.
3. El fundador (o un asistente) puede cubrir asambleas y emergencias.

## 15. Veredicto

**Validar ya.** Es el candidato más sólido a primer motor de caja: problema pagado todos los meses, mercado enorme y fragmentado
en la ciudad del fundador, economía unitaria buena con IA, robusto a la política nacional y con opcionalidad de plataforma. El
riesgo principal es la velocidad de distribución, y se testea en semanas por menos de USD 300.
