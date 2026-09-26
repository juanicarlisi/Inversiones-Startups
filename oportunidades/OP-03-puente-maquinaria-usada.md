---
id: OP-03
titulo: "Puente de maquinaria usada Europa → pymes argentinas"
estado: validar
rol: motor-de-caja
tipo: intermediacion
resumen: "Europa se desindustrializa (récord de insolvencias en Alemania) y Argentina acaba de bajar al 25% el arancel de líneas de producción usadas (Decreto 483/2026). Un intermediario que busca, valúa, inspecciona, importa y tramita el régimen cobra comisión de éxito con capital casi nulo."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "jun-2026 → elecciones 2027 (riesgo de reversión del decreto)"
modelo: herramientas/modelos/op03-maquinaria.yaml
capital:
  minimo_usd: 300
  optimo_usd: 1500
  acelerado_usd: 6000
  maximo_razonable_usd: 30000
  mensual_usd: 100
horas_semana: 8
ia_ejecutable_pct: 55
semanas_a_primer_aprendizaje: 4
meses_a_primer_ingreso: 4
riesgo_politico_2027: alto
rampa: true
puntajes:
  dolor_y_pago: 4
  economia_unitaria: 4
  distribucion: 3
  defensibilidad: 2
  ajuste_fundador: 5
  palanca_ia: 3
  ventana: 5
  opcionalidad: 4
  sinergias: 3
  velocidad_aprendizaje: 3
  robustez: 2
gates: {problema_pagado: si, distribucion: pendiente, economia: si, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.55, flujo_mensual: 0, capital_perdido_usd: 800}
  base: {prob: 0.32, flujo_mensual: 1700}
  expansivo: {prob: 0.13, flujo_mensual: 4000}
multiplo_terminal_meses: 12
sinergias: [OP-07, OP-04]
proximo_paso: "Conseguir 1 pedido real de una pyme del Conurbano y entregar 3 opciones con costo puesto en planta (EXP-03)"
---

# OP-03 — Puente de maquinaria usada Europa → pymes argentinas

## 1. Tesis en una línea

Dos shocks opuestos crean un arbitraje: fábricas europeas que cierran venden equipos a precio de remate, y Argentina acaba de hacer
que importar líneas de producción usadas pague solo **25% del arancel** y ninguna tasa de 2% + 3%; el que sabe buscar, verificar,
traer y tramitar gana comisión sin poner capital.

## 2. Por qué ahora

- **HECHO**: Decreto 483/2026 (BO 23-06-2026) flexibilizó el Régimen de Importación de Líneas de Producción Usadas: 25% del arancel,
  exención de tasa de comprobación de destino (2%) y estadística (3%); el requisito de compras nacionales bajó de 30% a 10% del FOB;
  bienes reconstruidos hasta 30 años; la línea puede completarse con bienes nuevos.
- **HECHO**: 4.996 insolvencias en Alemania en el 2T-2026, máximo desde 2005; electrotécnica +77% en quiebras grandes. Subastas
  industriales (Surplex, NetBid, Maynards) con lotes en toda Europa.
- **INFERENCIA**: el shock energético por Ormuz (Brent ~USD 105) agrava la crisis industrial europea → más oferta 2026–2028.
- **HECHO**: la industria argentina cae (EMAE); las pymes que sobreviven a la apertura necesitan productividad y no pueden pagar
  equipos nuevos importados con arancel pleno.
- **Riesgo de ventana**: ADIMRA critica el decreto; ante un cambio de gobierno en 2027 podría revertirse.

## 3. Problema, cliente y alternativa actual

- **Cliente**: pyme industrial de AMBA (plásticos, envases, alimentos, metalmecánica, gráfica, textil técnica) que necesita
  capacidad o reemplazar equipos viejos. Decide el dueño; paga con caja, crédito o leasing.
- **Alternativa actual**: equipo nuevo (caro), usado local (poco y viejo), importación propia (no sabe buscar, no confía, no conoce
  el régimen), o un importador especializado (existen algunos, sobre todo en agro, p. ej. Italia Maquinarias).
- **Dolor**: riesgo de comprar chatarra a distancia, logística y aduana, papeleo del régimen (proyecto de competitividad aprobado),
  idioma.

## 4. Evidencia e hipótesis

| Afirmación | Tipo | Validación |
|---|---|---|
| Beneficios y requisitos del Decreto 483/2026 | HECHO | Infobae 23-06-2026; CIRA; argentina.gob.ar (servicio "líneas de producción usadas") |
| Existe además un trámite para "importar máquinas usadas con aranceles más bajos" | HECHO (a precisar alcance) | argentina.gob.ar — verificar si aplica a máquinas individuales |
| Récord de insolvencias en Alemania | HECHO | IWH, 2T-2026 |
| Contenedor 40' Europa → Buenos Aires USD 3.500–8.500 (fletes +20–37% por la guerra) | HECHO (rango) | Cotizadores 2026 |
| Precio de usados europeos 30–60% debajo del nuevo | HIPÓTESIS | Comparar 20 lotes reales vs listas de precios nuevos |
| Pymes pagarían 8% de comisión + fee de gestión | HIPÓTESIS CRÍTICA | EXP-03 |

## 5. La oferta

"**Te traemos la máquina que necesitás, verificada, con el arancel reducido y puesta en tu planta.**"
1. Relevamiento de la necesidad (capacidad, espacio, energía, operario).
2. Búsqueda en subastas y *dealers* europeos (Claude barre catálogos a diario) y 3 opciones con **costo puesto en planta** (FOB +
   flete + seguro + arancel reducido + despachante + transporte + instalación).
3. **Inspección independiente** obligatoria (pagada por el cliente; EUR 500–1.500).
4. Proyecto de competitividad para la Autoridad de Aplicación y coordinación con despachante.
5. Seguimiento logístico hasta planta.

Cobro: fee fijo de gestión + comisión de éxito (5–12% del FOB). Sin inventario propio en la etapa 1.

## 6. Economía

Modelo: `herramientas/modelos/op03-maquinaria.yaml`.

| Régimen año 2 (si funciona) | Valor |
|---|---|
| Base (3 operaciones/año de USD 60k, 8% + USD 1.500) | **≈ USD 1.150/mes** promedio |
| P10 / P50 / P90 | USD 560 / 1.750 / 4.000 |
| Ingreso por operación (P50) | ≈ USD 8.400 |
| Probabilidad de > USD 1.000/mes | 76% si funciona; **30% incondicional** |

**Qué mueve el resultado**: valor promedio de la operación y cantidad por año. **Capital casi nulo**: el riesgo es reputacional.

## 7. Capital por tramos

| Tramo | USD | Compra | Hito |
|---|---|---|---|
| Mínimo | 300 | Landing, base de subastas, contactos de inspectores y despachante | — |
| Óptimo | 1.500 | Pauta a industriales, asistencia a 1 feria/cámara, abogado aduanero puntual | 1 pedido real cotizado |
| Acelerado | 6.000 | Viaje a Europa a un remate/feria con 3 compradores confirmados | 2 operaciones cerradas |
| Máximo razonable | 30.000 | Etapa 2: comprar-reacondicionar-vender (inventario propio) | 5 operaciones con 0 reclamos graves |

## 8. Distribución

Red logística/comex del fundador; parques industriales del Conurbano; cámaras (CIRA, cámaras sectoriales); despachantes de aduana
(alianza: ellos tienen al cliente y no tienen tiempo de buscar); contenido "precio de esta línea nueva vs usada puesta en planta"
(para OP-07); pauta en Meta a rubros industriales (CPM "repuestos industriales" es el más barato del país: ~ARS 1.064 en ago-2026).

## 9. Competencia y defensibilidad

Importadores especializados, *dealers* europeos con representante local, compra directa del cliente. Defensa **baja**: relaciones,
red de inspectores, historial de operaciones exitosas, base de precios. Por eso el comité la trata como **motor táctico con
ventana**, no como activo de largo plazo, salvo que evolucione a *dealer* con servicio técnico.

## 10. Palanca IA

Barrido diario de subastas y catálogos (DE/IT/ES), traducción y análisis técnico de fichas, valuación por comparables, armado del
costo puesto en planta, borrador del proyecto de competitividad, seguimiento logístico, comunicaciones en alemán/italiano.
**Humano**: venta, confianza, negociación, coordinación de inspección, decisión final del cliente.

## 11. Riesgos y pre-mortem

| Causa de fracaso | Mitigación |
|---|---|
| Máquina llega y no funciona → reputación destruida | Inspección independiente obligatoria; contrato con responsabilidades claras; no vender sin verificación |
| Reversión del decreto en 2027 | Concentrar esfuerzo en 2026–2027; seguir con arancel pleno si el diferencial de precio lo justifica |
| Subdeclaración de valor por parte de terceros (práctica denunciada) | Nunca; valor real documentado (riesgo legal) |
| Ciclo de venta largo | Pipeline de 10+ oportunidades; fee de búsqueda cobrado por adelantado |
| Tipo de cambio / crédito | La pyme financia; nosotros no tomamos riesgo de crédito |

## 12. Validación: plan 30/60/90

- **1–30**: 10 conversaciones con pymes industriales y 3 despachantes; elegir 1 pedido real; entregar 3 opciones con costo puesto en
  planta. *Éxito*: el cliente pide inspección de una opción. *Muerte*: nadie encuentra valor en el diferencial de precio.
- **31–90**: cerrar la primera operación con fee de gestión; documentar el caso (con permiso) para contenido.

## 13. Rol en cartera

Motor de caja táctico con capital casi cero. Detrás: **dealer de usados con servicio técnico** (más defensible), **exportar el
modelo a Uruguay/Paraguay/Chile**, datos de precios para OP-07 (comex) y casos de reequipamiento para OP-04 (layout y capacidad).

## 14. Qué tendría que ser cierto

1. El costo puesto en planta de un usado europeo es ≥ 35% menor que el nuevo equivalente.
2. Hay inspectores confiables a costo razonable.
3. 3+ operaciones por año son alcanzables con la red del fundador.

## 15. Veredicto

**Validar con un pedido real.** Excelente ajuste (comex/logística) y ventana clara, pero defensa baja y riesgo político alto:
aprovechar la ventana 2026–2027 sin comprometer capital.
