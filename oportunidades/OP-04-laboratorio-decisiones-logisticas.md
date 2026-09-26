---
id: OP-04
titulo: "Laboratorio de decisiones logísticas (simulación como servicio)"
estado: validar
rol: plataforma
tipo: servicio-profesional-productizado
resumen: "Reformulación de la idea del fundador (app de simulación logística hecha con Claude). No vender software de simulación —mercado de AnyLogic/FlexSim, caro y lento— sino decisiones logísticas caras (flota, depósito, dársenas, multimodal) resueltas con modelos que la IA construye en días; reutilizar los modelos y convertir el más pedido en un producto vertical."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2028 (IA abarata construir simuladores; depósitos escasos en AMBA; cuellos logísticos de Vaca Muerta)"
modelo: herramientas/modelos/op04-lab-logistico.yaml
capital:
  minimo_usd: 100
  optimo_usd: 1200
  acelerado_usd: 4000
  maximo_razonable_usd: 15000
  mensual_usd: 150
horas_semana: 8
ia_ejecutable_pct: 70
semanas_a_primer_aprendizaje: 3
meses_a_primer_ingreso: 2
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 3
  economia_unitaria: 4
  distribucion: 3
  defensibilidad: 3
  ajuste_fundador: 5
  palanca_ia: 4
  ventana: 3
  opcionalidad: 4
  sinergias: 4
  velocidad_aprendizaje: 4
  robustez: 4
gates: {problema_pagado: pendiente, distribucion: pendiente, economia: si, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.55, flujo_mensual: 0, capital_perdido_usd: 800}
  base: {prob: 0.33, flujo_mensual: 1800}
  expansivo: {prob: 0.12, flujo_mensual: 4000}
multiplo_terminal_meses: 12
sinergias: [OP-02, OP-03, OP-07]
proximo_paso: "Vender 1 estudio piloto (USD 500–1.500) a un contacto logístico antes de programar nada grande (EXP-04)"
---

# OP-04 — Laboratorio de decisiones logísticas

## 1. Tesis en una línea

Las empresas no compran simuladores: compran respuestas a decisiones caras ("¿cuántos camiones?", "¿cuántas dársenas?", "¿dónde
pongo el depósito?", "¿conviene tren o camión?"); con IA, construir un modelo de simulación u optimización a medida pasó de semanas a
días, y un fundador que conoce logística puede vender esas respuestas con margen alto y acumular una biblioteca de modelos.

## 2. Evaluación honesta de la idea original ("Claude Max 3 meses desarrollando una app de simulación logística")

| Aspecto | Lectura |
|---|---|
| Costo de la herramienta | USD 300–600 por 3 meses de Max: **barato**. No es el riesgo. |
| Riesgo real | Construir 3 meses sin cliente. El software de simulación genérico compite con AnyLogic, FlexSim (~USD 6.000/año), Arena y Simio, orientados a empresas grandes con analistas; las pymes no tienen quién lo use. |
| Qué rescatar | El conocimiento logístico del fundador + la capacidad de la IA de construir modelos rápido. Eso vale mucho **aplicado a una decisión concreta de un cliente que paga**. |
| Reformulación | Primero vender estudios (servicio), después productizar el modelo que más se repite (SaaS vertical). El "Claude Max" se paga desde el primer estudio. |

## 3. Por qué ahora

- La IA escribe modelos de eventos discretos (SimPy), ruteo (OR-Tools) y tableros en horas: el costo de construir cae 5–10x.
- **Depósitos**: AMBA a USD 7,2/m²/mes promedio, CABA USD 14,5; disponibilidad en CABA "prácticamente nula" → optimizar espacio y
  dársenas vale plata (Infobae, ene-2026).
- **Vaca Muerta**: la arena cuesta USD 22/t en cantera y USD 158/t en pozo; >4.000 camiones/mes; debate tren vs camión vs barcaza.
  Las decisiones logísticas del sector valen millones.
- **Transporte analógico** (87% sin sistemas): pocos toman decisiones de flota con datos.

## 4. Clientes y decisiones (hipótesis a validar)

| Cliente | Decisión | Valor para el cliente | Ticket estimado |
|---|---|---|---|
| Distribuidora AMBA (alimentos, bebidas, materiales) | Tamaño de flota propia vs tercerizada, ruteo, turnos | 5–15% del costo de distribución | USD 1.500–4.000 |
| Operador logístico / depósito | Dársenas, turnos de recepción, layout y picking | Evitar alquilar más m² (USD 7–15/m²/mes) | USD 2.000–6.000 |
| Industria que se reequipa (sinergia OP-03) | Capacidad y layout de una línea nueva/usada | Evitar cuellos y sobreinversión | USD 1.500–5.000 |
| Acopio / terminal / puerto | Colas de camiones en cosecha, playa de camiones | Demoras y multas | USD 3.000–10.000 |
| Empresa de servicios en Vaca Muerta | Transporte de personal, arena, agua; campamentos | Costos logísticos enormes | USD 5.000–15.000 |

## 5. La oferta

1. **Estudio de decisión** (2–4 semanas): relevamiento, modelo, escenarios, recomendación con números, tablero para el cliente.
2. **Modelo mantenido** (fee mensual): se actualiza con datos reales; el cliente juega escenarios ("¿y si sube el gasoil 20%?").
3. **Producto vertical** (etapa 2): el tipo de estudio que más se repita se convierte en SaaS (p. ej. "dimensionamiento de flota para
   distribuidoras" o "planificación de dársenas").

## 6. Economía

Modelo: `herramientas/modelos/op04-lab-logistico.yaml`.

| Régimen al mes 18 (si funciona) | Valor |
|---|---|
| Base (1 estudio/trimestre de USD 3.000 + 1 modelo mantenido) | **≈ USD 1.000/mes** |
| P10 / P50 / P90 | USD 920 / 2.070 / 3.860 |
| USD por hora del fundador (P50) | ≈ USD 110 |
| Probabilidad de > USD 1.000/mes | 88% si funciona; **40% incondicional** |

**Qué mueve el resultado**: estudios por trimestre y ticket. La recurrencia (modelos mantenidos) estabiliza.

## 7. Capital por tramos

| Tramo | USD | Compra | Hito |
|---|---|---|---|
| Mínimo | 100 | Plan Claude (ya previsto), plantilla de propuesta, 1 modelo demo | — |
| Óptimo | 1.200 | 6 meses de herramientas + contenido técnico + un evento | 1 estudio pago entregado con cliente satisfecho |
| Acelerado | 4.000 | Max 20x para sprint de producto + demo pública | 3 estudios del mismo tipo (señal de producto) |
| Máximo razonable | 15.000 | SaaS vertical con 1–2 clientes ancla | 2 clientes pagando el modelo mantenido 6 meses |

## 8. Distribución

Red del fundador (primer canal y probablemente el único necesario al principio); LinkedIn con casos y "mini-simulaciones" públicas
(la IA las produce); cámaras (ARLOG, CEDOL); alianzas con consultoras de logística que no tienen capacidad de modelado; derivación
desde OP-02 (transportistas) y OP-03 (reequipamiento).

## 9. Competencia y defensibilidad

Consultoras de logística, ingenieros independientes, software caro. Defensa: **credibilidad de dominio + velocidad + biblioteca de
modelos y datos** (cada estudio mejora el siguiente). Moderada, crece con casos publicados.

## 10. Palanca IA

Construcción del modelo (70–80%), limpieza de datos del cliente, escenarios, informe y tablero. **Humano**: entender el problema,
conseguir datos, validar supuestos con la operación, vender y presentar.

## 11. Riesgos

| Causa de fracaso | Mitigación |
|---|---|
| Nadie paga por "estudios" | Precio de entrada bajo con garantía de ahorro; empezar por la red |
| Datos del cliente malos o inexistentes | Relevamiento rápido y supuestos explícitos; el valor está en el razonamiento |
| El fundador no tiene tiempo para relevar | Estudios remotos acotados; plantillas |
| Construir producto demasiado pronto | Regla: 3 estudios del mismo tipo antes de productizar |

## 12. Validación: plan 30/60/90

- **1–30**: armar 1 demo (p. ej. dársenas de un depósito típico) en días; ofrecer 1 estudio piloto (USD 500–1.500) a 5 contactos.
  *Éxito*: 1 piloto vendido. *Muerte*: 0 de 5 con interés real → pasar a contenido (OP-07) y archivar.
- **31–90**: entregar, medir valor para el cliente, pedir referido y caso publicable.

## 13. Rol en cartera

**Plataforma de capacidades**: monetiza el conocimiento logístico desde el mes 1, alimenta contenido (OP-07), da herramientas a
OP-02 y OP-03, y puede convertirse en SaaS vertical. Alta opcionalidad con capital mínimo.

## 14. Qué tendría que ser cierto

1. La red del fundador tiene al menos 5 empresas con una decisión logística pendiente de más de USD 20.000 de impacto.
2. Pagan ≥ USD 1.500 por una respuesta con números.

## 15. Veredicto

**Validar vendiendo, no programando.** Sí a usar Claude para construir modelos (es barato y rápido), pero cada línea de código debe
responder a un cliente que paga. Buen *IVR* por bajo capital y alto ajuste.
