# Las ideas del fundador, evaluadas con números

El fundador aportó dos ideas como ejemplos del tipo de iniciativa que le interesa. Se evaluaron con el mismo rigor que cualquier otra:
destruir lo que no tiene economía y rescatar lo que sí.

## Idea 1: marca de mates, termos y bombillas con seis meses de precio regalado

> "Los primeros 6 meses precio regalado, hasta tener una fuerte entrada en mercado, sacrificar ganancias e incluso invertir. Luego,
> con cartera de clientes, escalar usando la marca, diversificar, local en algún shopping y combinar con importaciones."

**Simulación** (`herramientas/modelos/op05b-penetracion-mercadolibre.yaml`, 20.000 iteraciones):

| Resultado | Valor |
|---|---|
| Costo de la campaña (P10 / P50 / P90) | USD 9.700 / **19.900** / 35.900 (1 a 7 años del aporte mensual) |
| Valor neto a 24 meses, caso base | **−USD 3.060** |
| Valor neto P10 / P50 / P90 | −USD 14.500 / +1.150 / +21.200 |
| Probabilidad de perder plata | 46% |
| Supuesto dominante | Las ventas orgánicas extra que deja el ranking ganado (amplitud ~USD 32.000), no la recompra |

![Penetración en Mercado Libre](graficos/esc_op05b-penetracion-mercadolibre.svg)

**Por qué no funciona como está planteada.**

1. **Recompra baja**: un termo dura años, una bombilla también. Quien llega por precio regalado compra una vez.
2. **Todo depende del algoritmo**: el único activo que puede quedar es el ranking y las reseñas en Mercado Libre. Es real, pero se mide
   con una prueba de cuatro a seis semanas, dos o tres productos y un tope de USD 500–1.000, no con seis meses de subsidio.
3. **Competidores gigantes**: Stanley ancla el segmento premium desde 2015; Lumilagro fabrica localmente, importa acero inoxidable
   de China con equipo propio en Asia y vendió 5 millones de termos; Temu, Shein y Amazon Bazaar ya venden en Argentina.
4. **Local en shopping**: costo fijo alto (ESTIMACIÓN USD 3.000–8.000/mes entre alquiler, expensas y personal en CABA, a verificar)
   que solo tiene sentido con una marca probada.
5. **"Combinar con importaciones"**: es el modelo que ya usan cientos de vendedores; el margen se comprime para todos con la apertura.

**Lo que se rescata.** La intuición de una marca con identidad argentina tiene un canal con demanda comprobada afuera: la yerba
exportó un récord en 2025 y marcas argentinas venden kits de mate en Amazon EE.UU. La simulación de la versión exportable
(`op05-marca-matera-exportable.yaml`) muestra que **solo funciona en el segmento premium** (precio ≥ USD 50, costo del kit ≤ USD 17 y
publicidad ≤ 15% de las ventas), con contribución mediana de ~USD 2 por kit y **~USD 39.000 de capital de trabajo** en régimen. Por
eso queda en espera (OP-05), con una prueba de 100 kits si el fundador la quiere priorizar.

![Marca matera exportable](graficos/esc_op05-marca-matera-exportable.svg)

## Idea 2: Claude Max tres meses desarrollando una app de simulación logística

| Aspecto | Evaluación |
|---|---|
| Costo | USD 300–600 por tres meses: **barato**; no es el riesgo |
| Riesgo real | Construir tres meses sin cliente. El software de simulación genérico compite con AnyLogic, FlexSim (~USD 6.000/año), Arena y Simio, pensados para empresas grandes con analistas; las pymes no tienen quién los use |
| Qué vale | El conocimiento logístico del fundador y la capacidad de la IA de construir modelos a medida en días |
| Reformulación | **OP-04**: vender primero decisiones (estudios de USD 1.500–10.000), acumular modelos reutilizables y convertir en producto solo lo que se repita tres veces |
| Veredicto | Sí a Claude Max desde el día uno —para esto y para todo lo demás—, pero cada línea de código debe responder a un cliente que paga |

## El principio detrás de ambas

Las dos ideas tienen algo en común: empiezan por la **solución** (una marca con precio bajo, una app). El método de este sistema
empieza por el **problema pagado** y por la **hipótesis más riesgosa**, y la prueba con el experimento más barato posible. Con ese
filtro, la idea 2 se convirtió en una de las mejores oportunidades del mapa; la idea 1 quedó como una opción chica.
