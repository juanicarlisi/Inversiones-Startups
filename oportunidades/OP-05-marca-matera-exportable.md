---
id: OP-05
titulo: "Marca matera: evaluación de la idea original y versión exportable premium"
estado: explorar
rol: opcion
tipo: producto-marca
resumen: "La idea del fundador (6 meses de precio regalado en mates/termos/bombillas para ganar mercado, luego marca, local y diversificación) destruye valor tal como está planteada. La versión con sentido económico es chica y acotada: kits premium con identidad argentina para Amazon EE.UU./UE (envío a granel), más regalos empresariales en temporada; se prueba con 100–200 kits antes de invertir en serio."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2028 (auge global de la yerba, UE–Mercosur, exportación postal sin límite; pero fin del de minimis en destino)"
modelo: herramientas/modelos/op05-marca-matera-exportable.yaml
capital:
  minimo_usd: 600
  optimo_usd: 4000
  acelerado_usd: 12000
  maximo_razonable_usd: 30000
  mensual_usd: 150
horas_semana: 8
ia_ejecutable_pct: 55
semanas_a_primer_aprendizaje: 8
meses_a_primer_ingreso: 3
riesgo_politico_2027: medio
rampa: true
puntajes:
  dolor_y_pago: 2
  economia_unitaria: 2
  distribucion: 3
  defensibilidad: 2
  ajuste_fundador: 3
  palanca_ia: 3
  ventana: 3
  opcionalidad: 3
  sinergias: 2
  velocidad_aprendizaje: 2
  robustez: 3
gates: {problema_pagado: si, distribucion: pendiente, economia: pendiente, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.65, flujo_mensual: 0, capital_perdido_usd: 2500}
  base: {prob: 0.25, flujo_mensual: 700}
  expansivo: {prob: 0.10, flujo_mensual: 3000}
multiplo_terminal_meses: 18
sinergias: [OP-07]
proximo_paso: "No invertir en stock ni en precio regalado. Si el fundador quiere explorarla: prueba de 100 kits premium en Amazon/Etsy con tope USD 1.500 (EXP-05), después de EXP-01/02"
---

# OP-05 — Marca matera: la idea original y la versión que sí tiene economía

## 1. Tesis en una línea

La demanda mundial de mate crece y la identidad argentina vale afuera, pero los accesorios de mate son **bienes durables, fáciles de
copiar y con competidores gigantes**; por eso la ventaja no puede ser el precio, sino una marca premium en un canal con demanda
comprobada, con apuestas chicas y medibles.

## 2. La idea original, evaluada con números

**Idea**: "Inversión en marroquinería, mates, termos, bombillas. Los primeros 6 meses precio regalado hasta tener fuerte entrada,
sacrificar ganancias e incluso invertir. Luego, con cartera de clientes, escalar usando la marca, diversificar en unidades de
negocio, local en un shopping, y combinar con importaciones."

Modelo `herramientas/modelos/op05b-penetracion-mercadolibre.yaml` (6 meses de precio de penetración en Mercado Libre):

| Resultado | Valor |
|---|---|
| Costo de la campaña (P10 / P50 / P90) | **USD 9.700 / 19.900 / 35.900** (= 2 a 7 años del aporte mensual del fundador) |
| Valor neto a 24 meses en el caso base | **−USD 3.060** |
| P10 / P50 / P90 del valor neto | −USD 14.500 / +1.150 / +21.200 |
| Probabilidad de perder plata | 46% |
| Supuesto que más pesa (tornado) | **Ventas orgánicas extra por el ranking ganado** (amplitud ~USD 32.000), muy por encima de la recompra |

**Lectura**:
1. **Recompra baja**: un termo dura años; un mate, uno o dos; una bombilla, años. Los clientes que llegan por precio regalado
   compran una vez y no vuelven a precio normal (ver `doctrina/06`: precio de penetración sin mecanismo de retención).
2. **Todo depende del algoritmo de Mercado Libre**: el único activo que podría quedar es ranking y reseñas. Es real, pero se mide
   con una prueba de semanas, no con 6 meses de subsidio.
3. **El mercado local ya tiene gigantes**: Stanley (importado por Parallel desde 2015) ancla el premium; Lumilagro lidera lo local
   con un modelo mixto (fabrica y trae acero inoxidable de China, con equipo propio en Asia) y locales propios; además, Temu, Shein y
   Amazon Bazaar ya venden en Argentina. Competir por precio contra eso es perder.
4. **Local en shopping**: costo fijo alto (alquiler, expensas, personal: ESTIMACIÓN USD 3.000–8.000/mes en CABA, a verificar) que
   solo tiene sentido con marca probada y ventas online estables. Última etapa, no primera.
5. **"Combinar con importaciones"**: importar termos chinos con marca propia es el modelo de Lumilagro y de cientos de vendedores; el
   margen se comprime a medida que todos importan (apertura + aranceles más bajos).

**Veredicto sobre la idea original**: **no hacerla** como está planteada. Sí rescatar: (a) la intuición de marca con identidad
argentina, (b) la idea de "comprar" posicionamiento en un marketplace, pero con una prueba acotada: 4–6 semanas, 2–3 productos,
tope USD 500–1.000, midiendo si las ventas orgánicas se sostienen al volver al precio normal.

## 3. La versión con sentido: marca premium exportable

- **Demanda afuera**: exportaciones récord de yerba en 2025 (58 M kg, +32%); primera exportación a China; mercado mundial de yerba
  USD 2.000 M (2025) → 3.500 M (2035); Balibetov (familia argentina) muestra que la categoría de kits de mate funciona en Amazon EE.UU.
- **Regulación a favor en origen**: Decreto 604/2026 elimina el límite de valor para exportar por correo/courier; UE–Mercosur reduce
  aranceles.
- **Regulación en contra en destino**: EE.UU. terminó con el *de minimis* y la UE cobra €3 por artículo desde julio 2026 → el envío
  DTC paquete por paquete pierde; conviene **envío a granel a depósito (FBA) y venta local**.
- **Diferencial posible**: artesanía verificable (calabaza y cuero, bombillas de alpaca, algarrobo), historia, packaging de regalo,
  contenido. No competir con el acero inoxidable chino.

## 4. Economía de la versión exportable

Modelo `herramientas/modelos/op05-marca-matera-exportable.yaml` (régimen al mes 18, kit premium):

| Resultado | Valor |
|---|---|
| Contribución por unidad (P10 / P50 / P90) | −USD 6,4 / **+2,0** / +11 |
| Margen mensual (base) | ≈ USD 710 con 350 kits/mes |
| Probabilidad de perder plata si funciona | 42% |
| **Capital de trabajo** (3 meses de inventario, P50) | **≈ USD 39.000** |
| Qué decide todo | Precio (≥ USD 50), costo del kit (≤ USD 17) y publicidad (≤ 15% de ventas) |

**Lectura**: aun en su mejor versión, es un negocio de **márgenes finos y capital de trabajo alto** en relación a la cartera de hoy.
Solo tiene sentido en el segmento premium y si la publicidad es eficiente.

## 5. Complemento: regalos empresariales en temporada

Kits materos personalizados para empresas (fin de año, onboarding) son una categoría consolidada con muchos proveedores (Madu,
Hipólito, Impreco, Frank, Escorpión). Margen mejor que el retail, venta B2B estacional. Sirve para **rotar inventario** y financiar
la marca, no como negocio principal.

## 6. Capital por tramos (si se decide explorar)

| Tramo | USD | Compra | Hito |
|---|---|---|---|
| Mínimo | 600 | 30–50 kits de muestra, fotos, cuenta de vendedor, Etsy | — |
| Óptimo | 4.000 | 200 kits, envío a granel, marca registrada, pauta | Contribución ≥ USD 8/kit con TACoS ≤ 15% en la prueba |
| Acelerado | 12.000 | Inventario de 3 meses para 300+ kits/mes | 3 meses consecutivos de contribución positiva |
| Máximo razonable | 30.000 | UE + regalos empresariales + segunda línea | Marca con > 200 reseñas y recompra de accesorios/yerba |

## 7. Palanca IA

Investigación de palabras clave y competidores, fichas de producto en inglés, fotos/escenas (con herramientas generativas),
anuncios y su optimización, atención al cliente, contenido cultural del mate. **No**: producción artesanal, control de calidad,
logística física.

## 8. Riesgos

Copia rápida por fabricantes chinos; dependencia de Amazon; roturas en tránsito; peso apreciado que encarece el costo en USD;
estacionalidad; capital de trabajo inmovilizado.

## 9. Validación (si el comité la activa)

EXP-05: 100 kits premium; listados en Amazon EE.UU. (FBA) y Etsy; 8 semanas; tope USD 1.500. *Éxito*: ≥ 60 kits vendidos a ≥ USD 50
con TACoS ≤ 15%. *Muerte*: contribución < USD 5/kit.

## 10. Rol en cartera

**Opción** de bajo costo si se valida chica. No es motor de caja. Sinergia débil con el resto (salvo contenido y aprendizaje de
exportación).

## 11. Veredicto

**Explorar, no validar todavía.** Puntaje < 55 e IVR < 1: hoy hay mejores usos del mismo dólar y de las mismas horas (OP-01, OP-02,
OP-03, OP-04). Se reabre si el fundador tiene una ventaja específica (proveedor artesanal exclusivo, diseño propio, acceso a canal).
