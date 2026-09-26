---
id: OP-13
titulo: "Financiar la herramienta de trabajo de repartidores: motos a través de un operador"
estado: pausa
rol: activo-de-renta
tipo: activo-real-con-operador
resumen: "Comprar motos que un operador de flota alquila (o vende en cuotas) a repartidores de aplicaciones en AMBA. La demanda existe sin salir a vender (listas de espera); el operador cobra, asegura y mantiene. Rendimiento alto porque el repartidor no tiene crédito, a cambio de riesgos concretos: robo, mora, accidentes y el propio operador."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2028: patentamientos de motos +32% i.a.; repartidores formales +900% desde 2020"
modelo: herramientas/modelos/op13-motos-operador.yaml
capital:
  minimo_usd: 2500
  optimo_usd: 5000
  acelerado_usd: 10000
  maximo_razonable_usd: 15000
  mensual_usd: 0
horas_semana: 1
ia_ejecutable_pct: 50
semanas_a_primer_aprendizaje: 4
meses_a_primer_ingreso: 1
riesgo_politico_2027: medio
rampa: false
puntajes:
  dolor_y_pago: 4
  economia_unitaria: 4
  distribucion: 4
  defensibilidad: 2
  ajuste_fundador: 4
  palanca_ia: 2
  ventana: 3
  opcionalidad: 2
  sinergias: 2
  velocidad_aprendizaje: 3
  robustez: 2
gates: {problema_pagado: si, distribucion: si, economia: si, experimento_barato: pendiente, downside_acotado: pendiente, legal: pendiente}
escenarios_36m:
  fracaso: {prob: 0.15, flujo_mensual: 0, capital_perdido_usd: 3000}
  base: {prob: 0.65, flujo_mensual: 190}
  expansivo: {prob: 0.20, flujo_mensual: 240}
multiplo_terminal_meses: 12
sinergias: [OP-02]
proximo_paso: "PAUSA (DEC-2026-09-26-6): solo si aparece un operador verificable. Paso previsto: Claude: mapa de operadores de motos para repartidores en AMBA (quién acepta inversores, contratos, seguros, mora) y lista de preguntas de due diligence; fundador: 2–3 entrevistas presenciales (no es venta: es evaluar a un proveedor)"
---

# OP-13 — Motos para repartidores a través de un operador

## 1. Tesis

La economía de plataformas creció más rápido que el crédito para sus trabajadores. Un repartidor sin moto paga ~$120–125 mil por
semana por usar una (con seguro, patente y mantenimiento). Quien pone el capital cobra una parte de ese alquiler sin salir a vender:
la demanda hace fila.

## 2. Evidencia (sep-2026)

| Afirmación | Tipo | Fuente |
|---|---|---|
| Alquiler ~$125.000/semana, mínimo 90 días, incluye seguro, patente y mantenimiento; MotoRenta: 300 motos en 4 meses y 50 en espera | HECHO (fecha de la nota sin verificar) | Telefe Noticias; avisos en Mercado Libre |
| Honda Wave 110S $3,43–4,02 M (sep-2026) | HECHO | cuyomotor.com.ar 03-09-2026 |
| Gurpi (fintech de motos para repartidores): > 3.000 vehículos, mora 4%, > USD 5 M de facturación | HECHO | El Cronista; Revista Mercado |
| Rentabilidad de "vehículos de flota" 13–15% | HECHO de baja calidad | resumen de búsqueda sin fuente primaria |
| Qué parte del alquiler cobra el inversor (30–50%) | HIPÓTESIS | a validar con operadores |

## 3. Economía

Modelo `op13-motos-operador.yaml` (retorno anual sobre lo invertido, incluye amortización y reventa): base 23%; P10 / P50 / P90 =
−6% / 23% / 37%; 12% de probabilidad de pérdida grave modelada; 87% supera a la tesorería. El supuesto que más pesa es la parte del
alquiler que llega al inversor, y es el que menos evidencia tiene.

## 4. Riesgos que deciden

1. **Responsabilidad civil del dueño** (CCyC arts. 1757–1758: dueño y guardián responden en forma concurrente y objetiva por el daño
   de la cosa riesgosa). Si la moto está a nombre del inversor, un accidente grave puede terminar en juicio contra él → seguro de RC con
   límites altos y, preferentemente, estructura donde el titular sea el operador o un fideicomiso.
2. **Operador**: fraude, quiebra o desorden. Due diligence: antigüedad, cantidad de motos, mora, contratos, referencias de otros
   inversores, seguros vigentes, rastreo satelital.
3. **Robo** (alto en AMBA) y **tipo de cambio**: la renta es en pesos.
4. **Reputación y ética**: el alquiler es caro para el repartidor. Preferir esquemas de alquiler con opción de compra.

## 5. Veredicto

**Explorar.** Es la opción que mejor usa el conocimiento logístico sin vender, pero solo se hace con un operador verificable,
contrato escrito y seguros adecuados. Tamaño máximo: satélite (≤ 10% del patrimonio de la cartera). Si ningún operador acepta
inversores con esas condiciones, se descarta. Alternativa regulada a vigilar: instrumentos de oferta pública (ON, fideicomisos
financieros) de fintechs que financian motos.
