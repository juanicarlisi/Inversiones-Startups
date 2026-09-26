---
id: OP-06
titulo: "Puente de compre local minero (San Juan) para proveedores de afuera"
estado: explorar
rol: opcion
tipo: intermediacion-b2b
resumen: "San Juan obliga a las mineras a comprar 60% en la provincia (Ley 2827-M, multas de hasta 200.000 UT) justo cuando Vicuña (USD 18.100 M, FID fines 2026) empieza a construir. Proveedores extranjeros y de otras provincias necesitan inteligencia, socio local y registro; quien arma ese puente cobra abono y comisión de éxito en USD."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "fines 2026 – 2030 (reglamentación de la Ley 2827-M + construcción de Vicuña 2027–2030)"
modelo: herramientas/modelos/op06-compre-local.yaml
capital:
  minimo_usd: 500
  optimo_usd: 3000
  acelerado_usd: 10000
  maximo_razonable_usd: 20000
  mensual_usd: 250
horas_semana: 8
ia_ejecutable_pct: 50
semanas_a_primer_aprendizaje: 6
meses_a_primer_ingreso: 6
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 5
  economia_unitaria: 4
  distribucion: 2
  defensibilidad: 3
  ajuste_fundador: 2
  palanca_ia: 3
  ventana: 5
  opcionalidad: 4
  sinergias: 3
  velocidad_aprendizaje: 2
  robustez: 4
gates: {problema_pagado: si, distribucion: no, economia: si, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.80, flujo_mensual: 0, capital_perdido_usd: 2000}
  base: {prob: 0.14, flujo_mensual: 2500}
  expansivo: {prob: 0.06, flujo_mensual: 6000}
multiplo_terminal_meses: 12
sinergias: [OP-07]
proximo_paso: "Esperar reglamentación de la Ley 2827-M y FID de Vicuña (V-13); mientras, OP-07 publica una edición 'Proveedores RIGI' para medir interés y encontrar socio sanjuanino"
---

# OP-06 — Puente de compre local minero (San Juan)

## 1. Tesis en una línea

Cuando una ley obliga a comprar local, se crea un mercado para quien convierte a un proveedor de afuera en "local" legítimamente
(socio, depósito, empleo, registro) y para quien ayuda a las pymes locales a calificar; la ventana abre con la construcción de
Vicuña y la reglamentación de la ley sanjuanina.

## 2. Evidencia

| Afirmación | Tipo | Fuente |
|---|---|---|
| RIGI: piso de 20% de contratos con proveedores locales (art. 176) | HECHO | Perfil; Bloomberg Línea |
| San Juan Ley 2827-M (02-07-2026): objetivo 80% empleo local y 60% compras provinciales; multas hasta 200.000 UT; REPROMIN de consulta obligatoria, desarrollado por un privado licitado; reglamentación en revisión legal (sep-2026) | HECHO | Tiempo de San Juan; Diario de Cuyo; Diario Huarpe |
| Salta, Jujuy y Catamarca con pisos ~70% | HECHO | Tiempo de San Juan |
| Vicuña: USD 18.100 M en 3 etapas; FID etapa 1 fines 2026; construcción 2027–2030; 12.000 trabajadores en el pico; 580 proveedores en 2025 (60% sanjuaninos); ya licita transporte de personal | HECHO | Ámbito; La Nación; BHP 6-K |
| RIGI: 12 proyectos mineros aprobados; cobre ~USD 13.300 M, litio ~USD 5.800 M | HECHO | La Nación 18-09-2026 |
| Proveedores de afuera pagarían USD 800–3.000/mes por inteligencia + representación + socio | HIPÓTESIS | Entrevistas |

## 3. La oferta

Para **proveedores extranjeros o de otras provincias**: mapa de licitaciones y compradores, requisitos de "proveedor local"
(REPROMIN), búsqueda y armado de socio/representante sanjuanino, presentación a mineras y contratistas, seguimiento. Para **pymes
sanjuaninas**: preparación para calificar y ofertar (documentación, estándares, seguridad). Cobro: abono mensual + comisión de
éxito sobre el primer año de contrato.

## 4. Economía

Modelo `herramientas/modelos/op06-compre-local.yaml`: si funciona, base ≈ USD 2.550/mes (2 abonos + 2 contratos/año), P50 ≈ USD
5.250; **incondicional (20% de tracción) P50 = 0, media ≈ USD 1.190**. Es una apuesta con cola: alta si funciona, improbable sin red.

## 5. Por qué no ahora (gate de distribución en "no")

- El fundador vive en CABA y no tiene red minera (supuesto). Las relaciones en minería son personales y locales.
- La reglamentación y el REPROMIN todavía no están operativos.
- Sin socio sanjuanino con reputación, la probabilidad de tracción es baja (20%).

## 6. Cómo convertirla en opción barata

1. OP-07 publica una edición mensual "Proveedores RIGI / compre local" con la IA leyendo licitaciones, normas y noticias
   sanjuaninas: mide interés, construye audiencia y atrae posibles socios.
2. Disparador V-13: reglamentación publicada + FID de Vicuña → viaje exploratorio a San Juan (USD 300–500) con 5 reuniones.
3. Si aparece un socio local: acuerdo 60/40 y primer cliente extranjero.

## 7. Palanca IA

Lectura diaria de licitaciones, pliegos y normas; perfiles de compradores; preparación de documentación; traducción para
proveedores extranjeros. **Humano/socio**: relaciones, presencia, reputación.

## 8. Riesgos

Dependencia de un socio; ciclos de venta largos; que las mineras internalicen el desarrollo de proveedores; retraso del FID de Vicuña
(precio del cobre, riesgo país).

## 9. Veredicto

**Explorar como opción**, no validar todavía. El problema es excelente (obligación legal con multas y una ola de inversión), pero el
ajuste fundador y la distribución son débiles desde CABA. Mantener vigilancia barata vía OP-07.
