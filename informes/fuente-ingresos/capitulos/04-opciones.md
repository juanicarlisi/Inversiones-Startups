# Las cinco opciones, una por una

## 1 · Fábrica de herramientas para agentes de IA y desarrolladores (OP-12)

**Qué es.** Claude construye y mantiene herramientas chicas que desarrolladores y agentes de IA usan y pagan por uso. Son
herramientas de cálculo, validación y datos oficiales con lógica argentina y logística. Se publican en **Apify Store**, que pasa
80% de lo cobrado al desarrollador menos el costo de ejecución. Cada una también se publica como servidor MCP, el formato con el
que los agentes de IA usan herramientas, y es cobrable vía **x402**, el protocolo de pagos de agentes. Nadie sale a vender: los
compradores buscan en el catálogo o los agentes eligen por especificación y precio.

**Por qué ahora.** Apify paga ~USD 1,4 M por mes a ~3.000 desarrolladores y el 01-10-2026 retira el alquiler mensual para quedarse
con el pago por uso, así que el catálogo se reacomoda. x402 movió USD 24 M en 30 días a mediados de septiembre de 2026, y más de
20.000 herramientas de Apify ya son cobrables por agentes. Es la etapa temprana de un canal donde el comprador no necesita un
vendedor.

**Qué se fabrica, y qué no.** Se fabrica lo que una fábrica genérica no sabe resolver:

- Costo puesto de una importación en Argentina: arancel por posición + tasas + IVA + percepciones.
- Costo de flete por kilómetro con índices publicados.
- Días hábiles y feriados argentinos.
- Conversión con el tipo de cambio oficial de una fecha.
- Validación de CUIT.
- Series oficiales del INDEC y el BCRA, normalizadas.
- Lectura del Boletín Oficial por rubro.

**No** se fabrican: extractores de sitios que lo prohíben, herramientas con datos personales ni copias de herramientas que ya
tienen líder. Los nichos obvios, como el padrón de AFIP o el seguimiento de contenedores, ya tienen dueño.

![Fábrica de herramientas: distribución y sensibilidad](graficos/esc_op12-fabrica-herramientas.svg)

**Números** (margen neto al mes 12): P10 / P50 / P90 = **−6 / +70 / +683 USD/mes**; media 195. En 87% de los casos cubre su
costo, en 39% supera USD 100/mes y en 17% supera USD 400/mes. Lo que decide todo es que aparezca una herramienta que "pegue".

**Quién hace qué.** Claude investiga la demanda, programa, prueba, publica, fija precios, mantiene y responde consultas técnicas.
Vos creás la cuenta, habilitás el acceso de red, aprobás la lista y cada publicación, y dedicás unas 2 horas por semana.

**Regla de corte.** A los 90 días: ≥ 15 herramientas publicadas, ≥ 30 usuarios mensuales y ≥ USD 40/mes facturados. Al mes 9, si
no factura USD 40/mes, se cierra. Si una herramienta muestra usuarios recurrentes crecientes durante 3 meses seguidos, se
"gradúa" a la opción 5.

## 2 · Motor de renta en USD (OP-09)

**Qué es.** Cada mes, la parte del aporte que no tiene mejor destino compra un tramo de una escalera de instrumentos en dólares.
Es lo único que genera ingreso sin ninguna intervención.

| Instrumento | Referencia (sep-2026) | Riesgo | Rol |
|---|---|---|---|
| Letras del Tesoro de EE.UU. o fondos de letras | ~4% (Fed 3,75–4,00% desde el 16-09-2026) | Muy bajo; requiere cuenta en el exterior o fondo local equivalente | Liquidez y cobertura fuera de Argentina |
| Obligaciones negociables *hard dollar* de exportadores (YPF, Pampa, TGS, Pluspetrol, Telecom) | TIR ~7,0–7,9% | Riesgo empresa + riesgo Argentina | Núcleo de la renta |
| Bonos soberanos (Globales, Bonares) | Rinden más; riesgo país en 609 pb el 25-09-2026 | Riesgo Argentina 2027 | Solo una parte chica |
| Índice amplio (S&P 500 vía CEDEAR) | Crecimiento, no renta | Volatilidad | Largo plazo: 92,6% de los fondos activos de grandes empresas de EE.UU. rinde menos que el S&P 500 en 20 años (SPIVA 2026) |
| *Stablecoins* con rendimiento | 5–10% ofrecido (hasta 17% en plataformas poco conocidas) | Contraparte | Solo tránsito, con tope |

**Reglas.** Un tramo por mes, que evita adivinar el momento. Al menos 4 emisores y no más de 25% en uno. Un colchón de USD 1.000
que no se toca. Ojo con los dividendos de empresas de EE.UU.: no hay convenio de doble imposición y te retienen 30%. Para renta
convienen los intereses.

**Quién hace qué.** Claude arma la lista mensual con las tasas del día, controla la concentración y lleva el libro de capital.
Vos ejecutás la compra en tu cuenta. *Esto no es asesoramiento financiero regulado: es análisis para tu decisión.*

## 3 · Comprar un micro-negocio digital que ya vende solo (OP-08)

**Qué es.** Comprar, en marketplaces como Flippa, Microns o Acquire.com, un negocio chico que ya cobra y cuyos clientes llegan
solos. Puede ser una extensión de Chrome, un plugin, una app de Shopify o un pequeño SaaS. Después se opera con IA (soporte,
arreglos, mejoras). Es la forma más directa de "comprar ingresos que ya se venden solos", y cobra en dólares de clientes de todo el
mundo.

**Evidencia.** En Flippa, las operaciones de USD 10–100 k se pagan a una mediana de **1,68 veces el beneficio anual**. Los SaaS en
Acquire.com se pagan a 3,9 veces (2025). Hay negocios en venta desde USD 1.000, y "más SaaS de menos de USD 10 k a la venta que
nunca". Desde abril de 2026 el BCRA permite a personas humanas no liquidar los dólares de exportaciones de servicios.

![Micro-negocio: distribución y sensibilidad](graficos/esc_op08b-microadquisicion-chica.svg)

**Números** (compra de USD 3–12 k, 3 años, incluye el valor final): media **13% anual**; P10 / P50 / P90 = **−24% / 14% / 43%**.
En 61% de los casos supera a la renta. La distribución tiene dos jorobas: la de los negocios que se sostienen y la de los que
colapsan por fraude no detectado o pérdida del canal.

**La verdad incómoda.** Los negocios chicos son baratos porque son riesgosos. Si comprás "al promedio", rendís parecido a la renta
con mucho más riesgo. La ventaja está en **comprar mejor que el promedio**, porque el colapso es la variable que más pesa, y en
**operar mejor**, porque la tendencia y la mejora con IA son las siguientes. Por eso la due diligence vale más que la negociación.

**Qué comprar**

- Ingresos verificados en el procesador de pagos, no en capturas de pantalla.
- Al menos 12 meses de historia.
- Clientes que llegan por un canal con demanda propia, sin depender más de 50% de uno solo.
- Un producto que la IA pueda mantener.
- Un nicho que la IA no vuelva gratis.
- Un precio de hasta 3 veces el beneficio anual.

**Quién hace qué.** Claude arma el embudo semanal, hace la due diligence, redacta las preguntas al vendedor y, después de la
compra, opera el negocio. Vos aprobás cada contacto con vendedores y cada compra, y resolvés con un contador la estructura de cobro
y la declaración.

**Primer paso (EXP-08).** Cinco due diligence de práctica sobre listados reales, sin comprar nada, en 60 días. Si alguno pasa todos
los criterios a ≤ 2,5 veces el beneficio, se prepara la primera compra real, con tope de USD 8.000.

## 4 · Motos para repartidores a través de un operador (OP-13)

**Qué es.** Comprar motos que un operador de flota alquila, o vende en cuotas, a repartidores de aplicaciones en el AMBA. Un
repartidor sin moto paga ~$120–125 mil por semana, con seguro, patente y mantenimiento incluidos (avisos y notas recientes; la
fecha de la nota de Telefe no está verificada). Hay listas de espera: MotoRenta llegó a 300 motos en 4 meses con 50 personas esperando. Una Honda Wave 110S cuesta $3,43–4,02 M. Es la opción que mejor
usa tu conocimiento logístico sin vender.

![Motos con operador: distribución y sensibilidad](graficos/esc_op13-motos-operador.svg)

**Números** (retorno anual sobre lo invertido, con amortización y reventa): P10 / P50 / P90 = **−6% / 23% / 37%**. Supera a la
renta en 87% de los casos. El supuesto que más pesa es qué parte del alquiler llega al inversor (30–50%), y es el que no tiene
evidencia: hay que verificarlo con operadores.

**Riesgos que deciden**

1. **Responsabilidad civil.** Por los artículos 1757–1758 del Código Civil y Comercial, el dueño y el guardián de un vehículo
   responden en forma objetiva por los daños que cause. Si la moto está a tu nombre, un accidente grave puede terminar en un juicio
   contra vos. Hace falta seguro de responsabilidad civil con límites altos y, mejor, una estructura en la que el titular sea el
   operador o un fideicomiso.
2. **El operador**: fraude, quiebra o desorden.
3. **Robo**, alto en el AMBA.
4. **Renta en pesos.**
5. **Reputación**: el alquiler es caro para el repartidor. Es preferible un alquiler con opción de compra.

**Primer paso.** Claude arma el mapa de operadores y la lista de preguntas de due diligence. Vos hacés 2–3 entrevistas presenciales:
no es vender, es evaluar a un proveedor. Si ningún operador acepta inversores con contrato, seguro y rastreo, se descarta.

## 5 · App de suscripción "graduada" (OP-14)

**Qué es.** Cuando una herramienta de la fábrica muestra usuarios recurrentes que crecen, se convierte en una app de suscripción en
una tienda con compradores empresas: **Shopify App Store**, **Chrome Web Store** o **Google Workspace Marketplace**. Shopify deja al
desarrollador el 100% del primer millón de dólares de por vida. Se evitan las tiendas de consumo masivo, inundadas por apps hechas
con IA.

**Números.** 20% de probabilidad de tracción. Si funciona, la mediana es ~USD 1.340/mes al mes 18. Si no, se cierra perdiendo poco.
En Chrome, la mitad de las extensiones que cobran gana menos de USD 100/mes y ~5% gana más de USD 10.000.

**Regla.** No se arranca de cero: solo se gradúa lo que ya mostró demanda. El soporte lo responde la IA con plantillas que vos
aprobás una vez.
