---
id: OP-10
titulo: "Nodo energético del Golfo San Matías (Las Grutas / San Antonio / Sierra Grande)"
estado: radar
rol: activo-de-renta
tipo: inmobiliario-y-servicios
resumen: "El oleoducto VMOS (export desde fines de 2026), el GNL flotante de SESA (desde fines de 2027) y el eventual Argentina LNG (USD 51.000 M) convierten a un balneario y dos pueblos en el nodo exportador de energía del país. Es el 'Añelo 2012' visto a tiempo: vivienda, alojamiento corporativo y servicios antes del boom."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2029; se cierra a medida que el mercado incorpora el boom en precios"
modelo: ""
capital:
  minimo_usd: 500
  optimo_usd: 40000
  acelerado_usd: 80000
  maximo_razonable_usd: 150000
  mensual_usd: 0
horas_semana: 2
ia_ejecutable_pct: 40
semanas_a_primer_aprendizaje: 8
meses_a_primer_ingreso: 18
riesgo_politico_2027: medio
rampa: true
puntajes:
  dolor_y_pago: 4
  economia_unitaria: 3
  distribucion: 3
  defensibilidad: 3
  ajuste_fundador: 2
  palanca_ia: 2
  ventana: 5
  opcionalidad: 3
  sinergias: 2
  velocidad_aprendizaje: 1
  robustez: 3
gates: {problema_pagado: si, distribucion: pendiente, economia: pendiente, experimento_barato: si, downside_acotado: pendiente, legal: si}
escenarios_36m:
  fracaso: {prob: 0.25, flujo_mensual: 0, capital_perdido_usd: 8000}
  base: {prob: 0.55, flujo_mensual: 350}
  expansivo: {prob: 0.20, flujo_mensual: 700}
multiplo_terminal_meses: 150   # valor del inmueble al mes 36 ≈ 1,3x capital (supuesto de apreciación del polo)
sinergias: []
proximo_paso: "Vigilar V-01; mientras tanto, la IA arma un tablero de precios de lotes y alquileres (Zonaprop/Argenprop/ML) de Las Grutas, San Antonio Oeste y Sierra Grande, actualizado mensualmente"
---

# OP-10 — Nodo energético del Golfo San Matías

## 1. Tesis

La historia de Añelo (población +142% entre censos, déficit habitacional ~60%, rentas de 10–15% en USD en alojamiento corporativo,
"el cuello de botella ya no está en los pozos sino en las camas") se va a repetir en la costa rionegrina, pero con más escala
(exportación de crudo y GNL) y con un balneario con infraestructura turística como base.

## 2. Evidencia (sep-2026)

- VMOS: terminal de Punta Colorada con los tanques más grandes del país; inicio a fines de 2026 con 180 kb/d, > 550 kb/d en 2027;
  oficinas en Sierra Grande; exportaciones proyectadas ~USD 15.000 M/año.
- SESA (PAE, YPF, Pampa, Harbour, Golar): FID tomada, 6 Mtpa con dos buques FLNG en el Golfo San Matías; contrato con SEFE (Alemania)
  por 2 Mtpa x 8 años desde fines de 2027. Argentina LNG (YPF–Eni–XRG): USD 51.000 M presentado al RIGI.
- Señales locales: más ventas inmobiliarias ("hay demanda y va a crecer mucho más", operador local); obreros de VMOS alojados en Las
  Grutas; empresas pidiendo tierra (30 ha); ocupación de Las Grutas ~95% en enero 2026; puerto de San Antonio Este con cargas para
  GNL y VMOS. Fuentes: Diario Río Negro; Informativo Hoy (2026).
- Precio de referencia: lote de ~630 m² en Las Grutas ofrecido a ~USD 38.000 (Argenprop, 2026). Un solo dato: construir una serie.

## 3. Cómo entrar con poco (opciones)

1. **Información** (hoy, USD 0): tablero mensual de precios y alquileres construido por la IA; entrevistas telefónicas a
   inmobiliarias locales.
2. **Coinversión** en unidad de alquiler anual/temporario para trabajadores y técnicos (cuando la cartera tenga USD 30–40k), con
   administración local.
3. **Servicio**: gestión de alojamiento corporativo (modelo "Vaca Muerta Services": >850 camas administradas en Neuquén) con socio local.

## 4. Riesgos

Boom y caída (los proyectos de construcción terminan y la demanda baja a la operación, que emplea menos); retrasos del GNL; clima y
estacionalidad; iliquidez inmobiliaria; distancia (CABA–Las Grutas ~1.100 km).

## 5. Veredicto

**Radar con disparador V-01.** Excelente ejemplo de "ir un paso adelante", pero hoy la cartera no tiene el capital ni la presencia.
El paso gratuito (tablero de precios) mantiene la opción viva y detecta si la ventana se está cerrando.
