---
id: OP-09
titulo: "Tesorería en USD + tesis satélite: Argentina exportadora de energía en un mundo sin Ormuz"
estado: inversion
rol: cobertura
tipo: activo-financiero
resumen: "Mientras el capital espera destino, rinde en USD (ON corporativas ~7%) y una pequeña posición satélite captura la tesis de 2026: el mayor shock de oferta petrolera de la historia revaloriza a Vaca Muerta, el oleoducto VMOS y el GNL argentino. No es asesoramiento financiero regulado."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "Permanente (tesorería); tesis satélite 2026–2028 mientras dure el shock y avancen VMOS/GNL"
modelo: ""
capital:
  minimo_usd: 100
  optimo_usd: 3000
  acelerado_usd: 10000
  maximo_razonable_usd: 50000
  mensual_usd: 100
horas_semana: 1
ia_ejecutable_pct: 60
semanas_a_primer_aprendizaje: 1
meses_a_primer_ingreso: 1
riesgo_politico_2027: medio
rampa: false
puntajes:
  dolor_y_pago: 3
  economia_unitaria: 3
  distribucion: 5
  defensibilidad: 3
  ajuste_fundador: 4
  palanca_ia: 3
  ventana: 3
  opcionalidad: 3
  sinergias: 4
  velocidad_aprendizaje: 5
  robustez: 3
gates: {problema_pagado: si, distribucion: si, economia: si, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.05, flujo_mensual: 0, capital_perdido_usd: 1500}
  base: {prob: 0.85, flujo_mensual: 17.5}
  expansivo: {prob: 0.10, flujo_mensual: 25}
multiplo_terminal_meses: 171   # ≈ capital devuelto (3.000 / 17,5)
sinergias: [OP-01, OP-02, OP-03, OP-04]
proximo_paso: "Definir cuenta en ALyC y política de tesorería (doctrina/03 §5); registrar el primer aporte en cartera/libro-capital.csv"
---

# OP-09 — Tesorería en USD + tesis satélite energética

> Análisis para decisión propia del fundador; no constituye asesoramiento financiero. Todos los precios y rendimientos deben
> re-verificarse el día de operar.

## 1. Tesorería (la vara mínima de la cartera)

- **Instrumentos de referencia (sep-2026)**: ON hard dollar con TIR ~7,0–7,9%: YPF 2031 (~7,1%), Pluspetrol 2031 (~7,3%), Pampa
  2037 (~7,6%), Telecom 2033 (~7,9%), TGS 2031 (~7,0%). YPF colocó una clase internacional a 9 años en sep-2026.
- **Política** (ver `doctrina/03-asignacion-de-capital.md` §5): liquidez para 3 meses de experimentos; ≥ 4 emisores, máx. 25% por
  emisor, vencimientos ≤ 2031; preferir exportadores con caja en USD; parte en exposición global como cobertura de 2027.
- **Por qué importa**: toda unidad compite contra ~7% en USD con riesgo moderado. El IVR de la tesorería (~0,13–0,22 a 3 años) es el
  piso del tablero.

## 2. Tesis satélite: "Argentina exportadora de energía en el shock de Ormuz"

**Hechos (sep-2026)**
- Guerra con Irán desde el 28-02-2026; Ormuz casi cerrado; exportaciones de crudo del Golfo -47%; Brent ~USD 105.
- Qatar (~20% del GNL mundial) exporta por Ormuz → GNL escaso y caro; Alemania firmó con SESA 2 Mtpa de GNL argentino por 8 años
  desde fines de 2027 (>USD 7.000 M).
- Vaca Muerta: crudo nacional > 800 kb/d (récord), producción 2026 +16%; VMOS exporta desde fines de 2026 (180 kb/d → 550 kb/d en
  2027); RIGI con 23 proyectos aprobados.
- **Vista Energy (VIST)**: guía 2026 de 158 kboe/d (3T ~160, 4T ~170) y EBITDA ajustado de USD 3.000 M **con Brent USD 65**
  (sensibilidad: ±USD 200 M por ±USD 10/bbl en el 2º semestre); 2T-2026 ingresos USD 1.150 M (+89%), producción +32% tras integrar
  activos de Equinor. Precio ~USD 74, capitalización ~USD 8.300 M (dato de agregador, verificar). Precios objetivo de bancos
  USD 87–94.

**Inferencia**: con Brent muy por encima del supuesto de la guía, el flujo 2026–2027 de los productores de Vaca Muerta debería
superar lo que el mercado descuenta con prima de riesgo país (~600 pb). Formas de exponerse: productores (VIST, YPF), transporte
(TGS, midstream) o deuda (ON de energéticas, menos volátil).

**Qué mataría la tesis**
1. Reapertura de Ormuz y colapso del Brent (< USD 70) → disparador V-14.
2. Crisis política 2027 con controles de cambio o retenciones altas al crudo.
3. Problemas de ejecución (VMOS demora, cuellos logísticos: arena, camas, rutas).
4. Riesgo de "precio local" (el crudo vendido en el país no sigue al Brent).

**Reglas**: tamaño máximo dentro del balde *Opciones* (≤ 10% del patrimonio de la cartera); precio/condición de salida escritos antes
de entrar; revisión mensual en `/comite`.

## 3. Actualización 2026-09-26: el "motor de renta" (lo único 100% pasivo)

- HECHO: la Fed subió a 3,75–4,00% el 16-09-2026 (letras cortas de EE.UU. ~4%); el riesgo país cerró en 609 pb el 25-09-2026 y los
  bonos en USD cayeron hasta 4% en cinco ruedas. INFERENCIA: las tasas en USD están altas; armar la escalera de a poco (un tramo por
  mes) evita adivinar el momento.
- HECHO: sin convenio de doble imposición con EE.UU., los dividendos de fuente estadounidense sufren 30% de retención → para renta
  preferir intereses (letras, ON) y, para crecimiento, índices amplios (SPIVA: 92,6% de los fondos activos pierde contra el S&P 500
  en 20 años).
- HECHO: rendimientos de *stablecoins* de 5–10% (hasta 17% en plataformas poco conocidas). INFERENCIA: por encima de ~4% se cobra
  riesgo de contraparte; usar solo como tránsito, en plataformas registradas como PSAV ante la CNV y con tope bajo.
- La cuenta honesta: USD 400/mes a ~6,5% genera ~USD 24/mes de renta al mes 12 y ~USD 150/mes al mes 60. Pasivo de verdad, pero
  lento: por eso el plan combina la tesorería con compras de flujos (OP-08) y opciones baratas (OP-12). Ver
  `cartera/plan-sin-venta-resultados.md`.

## 4. Veredicto

**Operativa desde el mes 1** como balde de tesorería. La tesis satélite es opcional, chica y con reglas de salida; su función es
capturar un cambio estructural que el sistema detectó, no reemplazar a las unidades operativas.
