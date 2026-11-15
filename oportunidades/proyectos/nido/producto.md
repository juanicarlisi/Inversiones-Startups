# Nido · Producto (15-11-2026)

> Nombre de trabajo: **Nido** (marca recomendada: **Alero**; ver `investigacion.md` §5). Ficha del proyecto: `../P10-nido.yaml`.
> Para leer sin saber de tecnología. Lo que dice HIPÓTESIS se valida en la beta; lo que dice ESTIMACIÓN tiene el método al lado.

## 1. Qué es, en una frase

**La plata de tu casa, en orden y entre los dos: cargás un gasto en tres segundos, la app entiende tus cuotas y tus tarjetas, lee el
resumen y el ticket, y una vez por mes cierran el mes juntos en cinco minutos. Sin darle a nadie la clave del banco. Nadie más que
tu familia puede ver tus números, ni siquiera nosotros.**

La base existe y funciona: es la app que hoy usa la familia del fundador (versión 32). Nido es convertirla en producto.

## 2. Principios de experiencia (la vara: la mejor del mundo en su categoría)

1. **Cargar tarda menos que olvidarse.** Un gasto en 3 segundos con una mano: monto, palabra, listo. Todo lo demás se adivina
   (rubro, medio, fecha) y se corrige si hace falta.
2. **Perdona.** Si una semana no cargaste nada, el resumen de la tarjeta o los comprobantes completan el hueco. Nunca culpa, nunca
   rachas que castigan.
3. **Al abrir, dos números:** cuánto queda para este mes y qué viene (cuotas, vencimientos, cobros). El resto, a un toque.
4. **Un ritual, no una tarea.** El cierre de mes es un momento de pareja de 5 minutos con un final que da gusto (lo que juntaron, lo
   que rindieron los fondos, cuánto más cerca está la meta).
5. **Habla como vos.** Rioplatense, cálido, sin jerga ni sermones ("este mes gastaron 8% menos en comida afuera", nunca "¡cuidado!").
   Entiende "15 lucas", "un palo", "la verdu", "el chino".
6. **Privado de verdad.** Nunca pide la clave del banco. Los números se cifran en el teléfono antes de salir. Sin publicidad, sin
   vender datos, sin ofrecer préstamos ni productos financieros: **el único cliente es la familia**.
7. **Rápida en un celular de gama media y sin señal.** Funciona sin conexión; sincroniza cuando puede.
8. **Lo gratis nunca se achica.** Lo que hoy es gratis, sigue gratis (la lección de Splitwise).

## 3. Las 10 funciones diferenciales

Costo de IA con Claude Haiku 5.5 (USD 0,10 / 0,50 por millón de tokens, precio oficial al 15-11-2026). ESTIMACIÓN por uso típico.

| # | Función | Qué hace | Por qué nadie la tiene (o la tiene mal) | Cómo se construye | Costo por usuario |
|---|---|---|---|---|---|
| 1 | **Cuotas a la vista** | Cada compra en cuotas proyecta los próximos resúmenes; muestra "tenés comprometidos $X en marzo, abril y mayo" y cuándo te liberás | Las apps globales imputan a la fecha de compra; los bancos muestran una tarjeta a la vez | **Ya existe** (imputación por cierre y cuotas); falta la vista de compromisos | 0 |
| 2 | **Leé tu resumen** | Subís o compartís el PDF del resumen de la tarjeta (cualquier banco, Naranja, Mercado Pago): extrae consumos, cuotas pendientes, impuestos y percepciones, y lo concilia con lo cargado sin duplicar | Sin finanzas abiertas en Argentina, nadie lo resuelve; las globales piden conectar el banco | IA lee el texto del PDF (sin guardar el archivo) + conciliación propia; plantillas por emisor que mejoran con el uso | ~USD 0,003 por resumen; ~0,01/mes |
| 3 | **Ticket con renglones y QR de ARCA** | Foto del ticket: cada renglón con su rubro (el súper se reparte entre comida y limpieza); si hay QR de factura, toma CUIT, fecha e importe exactos | Las demás toman solo el total; nadie usa el QR de ARCA para validar | **Ya existe la foto con IA**; sumar lector de QR local (sin IA) y chequeo cruzado | ~USD 0,0005 por ticket; ~0,02/mes |
| 4 | **Compartir desde cualquier app** | Desde Mercado Pago, el banco o el mail: "compartir → Nido" con el comprobante, y queda cargado | Las apps globales no reciben comprobantes argentinos | App nativa con Capacitor y extensión de compartir (Android e iOS); lector de comprobantes por plantilla y, si no alcanza, IA | ~0 a USD 0,01/mes |
| 5 | **Aviso del banco → gasto (Android)** | Con permiso explícito y solo de las apps que elegís, la notificación de compra se convierte en un borrador para confirmar con un toque | Existe en apps chicas (Bluecoins), no en español con bancos argentinos | Lectura de notificaciones en el teléfono, sin IA y sin salir del equipo; verificar política de Google Play antes | 0 |
| 6 | **Carga de 3 segundos, voz y widget** | "1500 verdu" o por voz "gasté quince lucas en el chino" → gasto listo; widget en la pantalla de inicio | Nadie entiende el habla rioplatense; Monefy es rápido pero tonto | **Ya existe** el parser rápido y el autocompletado; sumar widget nativo y voz (dictado del sistema + parser; IA solo si falla) | ~0 |
| 7 | **Cierre de mes en pareja** | Asistente de 5 pasos: confirma cobros y pagos, reparte lo que sobró entre los fondos, carga cuánto vale hoy cada fondo y muestra el rendimiento real; al final, una tarjeta para guardar ("cerramos marzo ahorrando 18%", sin montos) | Las apps muestran gráficos; nadie arma el ritual | **Ya existe**; pulir la animación final y la tarjeta para compartir | 0 |
| 8 | **En pesos de hoy y en dólares** | Cada mes se puede ver en pesos nominales, en pesos de hoy (ajustado por inflación) o en dólares del día; "gastaste 4% menos que en marzo, en serio" | Con 2% de inflación mensual, comparar pesos nominales engaña; ninguna app lo corrige | Series públicas (IPC del INDEC, cotizaciones del BCRA) bajadas una vez por día a un archivo estático | ~0 |
| 9 | **Lo mío, lo tuyo, lo nuestro** | Dos personas, cada gasto con dueño o compartido; reparto por mitades o proporcional al ingreso; saldo entre los dos | Honeydue y Splitwise no hacen presupuesto local; Naranja X exige mover la plata a su cuenta | Sobre el modelo de dos usuarios que ya existe; sumar regla de reparto y saldo | 0 |
| 10 | **Fondos y metas que rinden (sin recomendar)** | Fondos (Mercado Pago, FCI, plazo fijo, dólares) con aporte por % de lo que sobra y rendimiento real contra inflación; metas de compra con "cuotas o contado con descuento" y cuánto aportar por mes | Las globales no tienen fondos locales; los bancos solo muestran los suyos | **Ya existe** (fondos, metas, aporte necesario); sumar comparador cuotas/contado con inflación esperada (REM del BCRA) | 0 |

**Módulo opcional "Mayordomía"** (apagado por defecto): diezmo y ofrendas calculados sobre los ingresos que la familia elija (ya
existe el cálculo). Puente natural con Senda (P1) y con la audiencia cristiana protestante, como EveryDollar en EE.UU. Es un dato
sensible (revela convicciones religiosas): solo se activa a pedido y viaja cifrado.

## 4. Cómo está hecha por dentro (en simple)

- **Primero en el teléfono.** Los datos viven en una base dentro del teléfono (funciona sin señal). La pareja se sincroniza a través de
  un servidor que solo guarda **una copia cifrada que no puede leer** (cifrado de punta a punta con una clave que nace en los
  teléfonos de la familia y un código de recuperación que se guarda la familia).
- **Servidor mínimo.** Supabase (o equivalente) como depósito de copias cifradas y cuentas; una función chica para pasar fotos y PDF a
  la IA con un tope por usuario. Costo de servidores ESTIMADO: USD 0–25 por mes hasta ~5 mil hogares; ~USD 0,004 por hogar activo
  por mes después. La capa `Store` actual se reemplaza sin tocar el resto (ya está aislada).
- **Una sola base de código** para web instalable, Android y iPhone (Capacitor), con piezas nativas solo donde hacen falta: widget,
  compartir, lectura de notificaciones (Android) y Atajos (iOS).
- **IA solo donde agrega:** tickets, resúmenes y voz que el parser no entiende. Todo lo demás corre en el teléfono.

## 5. Privacidad y legal (lo que se promete y lo que no)

**Promesa recomendada:** "Nadie más que tu familia puede ver tus números. Ni nosotros." Es más fuerte y más honesta que "los datos
quedan en tu teléfono", porque con dos teléfonos y respaldo los datos sí viajan, pero cifrados. Letra chica honesta: cuando usás la
lectura de tickets o resúmenes, esa imagen o ese PDF se envían a un proveedor de IA solo para leerlos y no se guardan.

Qué **no** hace Nido, nunca: pedir claves bancarias; mover dinero; recomendar fondos, bonos o préstamos (eso es asesoramiento regulado
por la CNV); mostrar publicidad; vender o compartir datos.

Pendientes legales (con abogado, ~1 hora, cuando exista la empresa del holding): política de privacidad y términos según la Ley
25.326 (y seguir el proyecto de reemplazo); inscripción de la base en la AAIP si corresponde; transferencia internacional al servidor;
botón de baja de la suscripción visible; formularios de Google Play (funciones financieras, seguridad de datos, permiso de
notificaciones) y etiquetas de privacidad y borrado de cuenta dentro de la app en la App Store.

## 6. Precio

- **Gratis para siempre:** carga ilimitada, dos personas, cuotas y tarjetas, cierre de mes, 10 lecturas de ticket por mes.
- **Nido Plus familiar** (una suscripción para toda la casa): resúmenes PDF ilimitados, tickets ilimitados, pesos de hoy y dólares,
  fondos y metas avanzados, aviso del banco, respaldo cifrado con historial. Precio HIPÓTESIS: **USD 2,5–3 por mes o USD 20–25 por año
  en Latinoamérica** (cobrado en pesos), USD 4–5 en España y EE.UU.; **precio fundador congelado** para los primeros 500 hogares.
- No hay pago único vitalicio al lanzar (los costos de IA son por uso); se evalúa en 2028.

## 7. Roadmap en cortes verticales

| Corte | Cuándo | Qué sale | Claude construye | El fundador decide |
|---|---|---|---|---|
| 0 · Separar casa y producto | nov–dic 2026 | Código sin datos ni nombres de la familia; onboarding genérico; capa de datos local en el teléfono; web instalable | Todo el código; exportar/importar para que la familia migre sus datos | Nombre y marca (Alero / Nido); si su familia pasa a la versión nueva |
| 1 · Pareja cifrada y beta | ene–feb 2027 | Cuentas, sincronización cifrada de dos teléfonos, tickets con IA con tope, landing con lista de espera, 3 plantillas gratis | Sincronización, función de IA, landing, plantillas, cuenta temática | Promesa de privacidad final; textos legales con abogado; OK para abrir la lista de espera |
| 2 · Lanzamiento web Argentina | mar 2027 | Web pública; "Leé tu resumen" v1 (Visa y Master de los 6 bancos más grandes + Mercado Pago y Naranja); pesos de hoy y dólares | Lectores de resumen, series de IPC y dólar, guías para búsquedas | Precio y fecha de cobro (requiere la empresa del holding) |
| 3 · Android | may–jul 2027 | App en Google Play con widget, compartir, aviso del banco y voz; Nido Plus con cobro | Empaquetado, piezas nativas, cobro por Google Play | OK de publicación en la tienda |
| Corte de evaluación | sep 2027 | ¿1.500 hogares activos por mes con 25% cargando a los 60 días, o 40 hogares pagos? | Tablero de métricas | Seguir, achicar o cortar |
| 4 · iPhone | oct–dic 2027 | App Store, widget, compartir, Atajos | Igual que Android | OK de publicación |
| 5 · Región | 2028 | Uruguay, Chile, México (meses sin intereses) y España; cuotas y tarjetas de cada país | Adaptaciones y plantillas por país | Qué país primero |
| 6 · Profundidad | 2029–2030 | Finanzas abiertas si el BCRA las habilita (opcional), asistente de cierre con IA, informe anual de la familia | Integraciones | Si se suma conexión bancaria o se mantiene la promesa sin claves |

## 8. Difusión sin pagar publicidad (y sin poner la cara)

- **Principal: búsquedas.** Calculadoras y guías que la gente busca: "¿conviene pagar en cuotas o contado?", "cuánto tengo
  comprometido en cuotas", "planilla de gastos familiares 2027", "cómo dividir gastos en pareja", "cuánto rinde Mercado Pago contra la
  inflación". Cada una termina en "hacelo automático con Nido".
- **Plantillas gratis y pagas** (Google Sheets y Excel) en la web propia, Gumroad y Etsy: vidriera y algo de ingreso.
- **Cuenta temática sin cara** (TikTok, Instagram, YouTube cortos): "el cierre de mes de una familia argentina" con números de ejemplo,
  nunca reales.
- **Dentro del producto:** la invitación a la pareja (cada hogar trae un segundo usuario) y la tarjeta del cierre de mes para guardar o
  compartir.
- **Promoción cruzada:** Senda (módulo de mayordomía) y el resto de la cartera.
- **Comunidades:** grupos de finanzas personales en Reddit, Facebook y Telegram con la regla 90/10 (aportar antes de mencionar).

## 9. Métricas

- **Norte:** hogares que cierran el mes en la app (por mes).
- Otras: hogares activos por mes; % que sigue cargando a los 60 días; % de hogares con dos personas; gastos cargados por hogar y por
  semana; hogares pagos; costo de IA por hogar pago.
