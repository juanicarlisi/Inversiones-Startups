# Nido · Bitácora de investigación (15-11-2026)

> Proyecto P10. Base: la app familiar `apps/economia-familiar/` (versión 32, 12-11-2026), que ya usa la familia del fundador.
> Convención (regla 1): **HECHO** (con fuente y fecha), **ESTIMACIÓN** (con método), **HIPÓTESIS** (a validar), **INFERENCIA**
> (razonamiento propio). Todas las búsquedas se hicieron el 15-11-2026 vía motor de búsqueda; muchas fuentes de precios son blogs
> de comparación o de apps competidoras (**fuente interesada**): se marca. Todo dato que decida plata se re-verifica en la fuente
> primaria antes de usarlo (CLAUDE.md §8). Este repositorio es público: acá no hay ningún dato ni importe de la familia.

---

## 1. Qué ya existe (la base)

**HECHO (lectura del código, 15-11-2026).** Un solo `index.html` armado con `build.py` desde `src/` (núcleo y cálculos,
catálogo de ítems, vistas, formularios, app). Funciones: gastos e ingresos; plan mensual (cobros y pagos previstos con
recordatorios); presupuestos por rubro y "bolsas" que juntan rubros; fondos con aporte fijo o % de lo que sobra, rendimiento
estimado que se compone y rendimiento real cargado en el cierre; **cierre de mes con asistente**; metas de compra; tarjetas con
**día de cierre** (la compra se imputa al mes de pago correcto) y **cuotas** (un movimiento por mes); vista "mes de pago" o
"fecha de compra"; **foto del ticket con IA** que devuelve comercio, fecha, medio, total y cada renglón con su rubro, chequeando
contra el total; pegar texto de un ticket digital (sin IA); clasificación por reglas + lo aprendido de la familia; catálogo de
ítems; análisis por rubro, ítem, evolución y proyección anual; exportar CSV; rubro "Diezmo y ofrendas" con cálculo del 10%.
La capa de datos está aislada en un objeto `Store` (base compartida del Artifact o `localStorage`).

**INFERENCIA.** El 70% de lo difícil del dominio (modelo contable sin doble conteo, cuotas, cierre de tarjeta, fondos, cierre de
mes) ya está resuelto y probado con uso real. Lo que falta para publicar es plataforma: cuentas, sincronización privada,
empaquetado, cobro, legal y difusión. **Pendiente de limpieza antes de publicar:** los valores por defecto del código traen
nombres de personas y de bancos de la familia; se reemplazan por un onboarding genérico (no se citan acá).

---

## 2. El mercado y lo que ya funciona

### 2.1 Mundo (EE.UU. y Europa)

| App | Modelo y precio (2026) | Escala | Qué aman / qué odian | Fuente y calidad |
|---|---|---|---|---|
| **YNAB** | Solo pago: USD 14,99/mes o USD 109/año; prueba de 34 días; una suscripción cubre hasta 6 personas | Ingresos estimados ~USD 49 M (Growjo, 2024, estimación de terceros) | Aman el método (cada peso con un trabajo) y la comunidad; odian la curva de aprendizaje y las subas de precio (USD 84 → 99 → 109) | Precios: varios agregadores, uno dice haber verificado la página oficial en oct-2026 ([getfinny](https://getfinny.app/blog/ynab-pricing-2026), [envelopebudgeting](https://envelopebudgeting.com/articles/ynab-review)); quejas: [G2](https://www.g2.com/products/you-need-a-budget/reviews), [Trustpilot](https://www.trustpilot.com/review/youneedabudget.com). Getfinny es app competidora: interesada |
| **Monarch Money** | Solo pago: USD 14,99/mes o USD 99,99/año; pareja incluida sin costo extra | 500 mil+ pagos y 1 M+ usuarios (mar-2026); ARR estimado USD 100 M (sep-2026); Serie B de USD 75 M a USD 850 M post (may-2025) | Ganó a los refugiados de Mint; quejas: conexiones bancarias que se caen, móvil por detrás de la web | [Sacra](https://sacra.com/research/monarch-money) (estimaciones de analista), [Coverager](https://coverager.com/monarch-raises-75-million/) |
| **Copilot Money** | Solo pago: USD 13/mes o USD 95/año | 4,8 estrellas con 30 mil+ reseñas (iOS) | **"La app de presupuesto mejor diseñada"**; categorización rápida. Odian: sin Android (web desde dic-2025), precio, sincronización | [fincomparelab](https://www.fincomparelab.com/?p=664), [Penny Hoarder](https://www.thepennyhoarder.com/budgeting/budgeting-copilot-money-review/) |
| **Rocket Money** | Gratis + Premium "pagá lo que te parezca justo" (~USD 6–14/mes) + negociación de facturas a comisión | No público en lo relevado | Cancelar suscripciones; quejas de cobros | [Rocket Money (propia)](https://www.rocketmoney.com/learn/personal-finance/how-much-does-rocket-money-cost) |
| **Quicken Simplifi** | ~USD 2,99–5,99/mes facturado anual | — | Barata y simple | [costbench](https://www.costbench.com/software/personal-finance/simplifi/) (agregador; precios en conflicto) |
| **PocketGuard** | Plus USD 12,99/mes o USD 74,99/año | — | "Cuánto me queda para gastar" | [blog de Quicken](https://www.quicken.com/blog/?p=9638) (competidor: interesado) |
| **Goodbudget** | Gratis (sobres manuales) + Premium ~USD 10/mes u 80/año | — | Sobres compartidos en pareja sin conectar el banco | agregadores, precios en conflicto |
| **EveryDollar (Ramsey)** | Gratis + Premium USD 79,99/año | 84 mil reseñas, 4,7 (sep-2026) | Presupuesto base cero de **Dave Ramsey, de raíz cristiana** con enorme audiencia propia: el producto lo vende la comunidad | [Penny Hoarder](https://www.thepennyhoarder.com/budgeting/everydollar-app-review/), [getfinny](https://getfinny.app/blog/everydollar-pricing-2026) |
| **Spendee** | Plus USD 1,99/mes (billeteras compartidas) · Premium USD 5,99/mes (banco) | — | Billeteras compartidas baratas | [makerstack](https://makerstack.co/reviews/spendee-review/) |
| **Wallet (BudgetBakers)** | Gratis + Premium (sincroniza "15 mil bancos"); vitalicio ~USD 20–50 según país | — | Completo; quejas de sincronización bancaria que se corta | [finder](https://www.finder.com/uk/budgeting/wallet-budgetbakers-review), [Trustpilot](https://es.trustpilot.com/review/budgetbakers.com) |
| **Money Manager (Realbyte)** | Gratis con publicidad + pago único para sacarla | ~10–20 M instalaciones Android, 4,6 con ~449 mil reseñas | Carga manual rápida tipo "libro de caja"; cero conexión bancaria | [AppPricingLab](https://apppricinglab.com/app/google_play/com.realbyteapps.moneymanagerfree), [AppGoblin](https://appgoblin.info/apps/com.realbyteapps.moneymanagerfree) |
| **Monefy** | Gratis + pago único/Pro | ~10 M instalaciones, 3,9 | Un toque para cargar | [AppPricingLab](https://apppricinglab.com/app/google_play/com.monefy.app.lite) |
| **Splitwise** | Gratis con tope diario de gastos (3–5 por día) desde fines de 2023 + Pro ~USD 39,99/año | — | Dividir gastos; **enojo fuerte por el tope y la presión a pagar** | [Trustpilot](https://dk.trustpilot.com/review/splitwise.com?page=2), [Kimola](https://kimola.com/reports/splitwise-app-feedback-report-uncover-user-insights-google-play-en-144452) |
| **Honeydue** | Gratis para parejas | Comprada por Mission Lane (2021); reseñas hablan de señales de abandono | Pareja; poco mantenimiento | [CB Insights](https://www.cbinsights.com/company/honeydue), [App Store](https://apps.apple.com/us/app/id1157633945) |
| **Buddy, Emma** | Freemium; Buddy permite presupuesto en pareja | No se obtuvo precio 2026 confiable | — | [App Store Buddy](https://apps.apple.com/us/app/id936422955) |

### 2.2 Las que cerraron y por qué (la lección más importante)

- **Mint (cerró el 23-03-2024).** HECHO: ~25 M de cuentas registradas y ~3,6 M activos (2021); gratis, vivía de referidos de
  productos financieros con un ingreso por usuario de **USD 2–3**; la agregación bancaria era cara y frágil; Intuit la absorbió en
  Credit Karma (que vive de publicidad de crédito). Lección de los propios ex-Mint (panel de Monarch, YNAB y Carry): **"tu empresa
  termina siendo tu modelo de negocio"**; la suscripción alinea el producto con el usuario. Fuentes: [Sacra, 22-02-2024](https://sacra.com/research/why-mint-failed),
  [CNBC](https://www.cnbc.com/select/mint-budgeting-app-is-going-away-here-are-some-alternatives/), [Engadget](https://www.engadget.com/intuit-is-closing-down-mint-its-popular-free-budget-tracking-app-054145229.html).
- **Zeta (parejas, cerró en mayo de 2025; activos comprados por Acorns en junio).** Era cuenta bancaria conjunta; no dio razones.
  Fuente única y de baja calidad ([debtpayofftools](https://debtpayofftools.pages.dev/apps/zeta)): **a verificar**.
- **Guiabolso (Brasil, ~6 M de usuarios).** Comprada por PicPay en jul-2021; cerrada en nov-2022 y absorbida como "Minhas finanças"
  dentro de PicPay. Fuentes: [Forbes Brasil](https://forbes.com.br/negocios/2021/07/picpay-compra-100-do-guiabolso-em-aposta-no-open-banking/), [Startups](https://startups.com.br/noticias/guiabolso-comprado-pelo-picpay-sera-encerrado-em-novembro/).
- **Fintonic** (España, gratis, vive de comisiones de préstamos y seguros): **cerró México y Chile** y recién fue rentable en 2025
  concentrada en España; ~450 mil usuarios. Fuente: [Roams](https://roams.es/actualidad/finanzas/fintonic-nuevo-ceo-banco-santander-eneko-fonseca/).

**INFERENCIA.** El patrón es claro: lo gratis financiado con venta de productos financieros muere o se achica; la agregación bancaria
es cara y frágil; los que crecen (YNAB, Monarch, Copilot, EveryDollar Premium) **cobran suscripción y cuidan la experiencia**. Para un
holding de una persona, el modelo correcto es suscripción barata sin servidores caros ni conexión bancaria.

### 2.3 Latinoamérica y Argentina

- **Brasil, el modelo local que ya funciona.** Mobills dice tener **10 M+ de usuarios** (dato propio) y 5 M+ instalaciones en Android;
  planes ~R$ 19,90/mes o R$ 199,90/año. Organizze: 1 M+ instalaciones, ~R$ 15–18/mes o R$ 96/año. Fuentes: [Mobills planes](https://www.mobills.com.br/planos/)
  (interesada), [Canaltech](https://canaltech.com.br/apps/organizze-ou-mobills-qual-aplicativo-melhor-para-controlar-gastos/). Brasil
  además tiene **Open Finance** maduro: 128 M de consentimientos activos (dic-2025), pero solo 37% de los que lo conocen lo usó
  ([Convergência Digital](https://convergenciadigital.com.br/mercado/open-finance-brasil-lidera-ranking-global-com-128-milhoes-de-consentimentos-ativos/), [Finsiders](https://finsidersbrasil.com.br/?p=347810)).
  **INFERENCIA:** Brasil está ocupado; Nido no entra a Brasil antes de 2029.
- **Argentina: los bancos y billeteras se meten en la economía familiar (2026).**
  - **Naranja X "Cuenta Compartida"** (sep-2026): hasta 10 personas, CBU y alias propios, rendimiento diario, "frascos" para metas y
    tareas (facturas pendientes); casi 10 M de clientes mensuales. Exige **mover la plata a Naranja X**. Datos de su propia medición:
    82% vive con otros y 7 de cada 10 usaron el celular para organizar gastos del hogar; Argentina tiene 16 M+ hogares, 3 de cada 4
    con más de una persona ([Forbes Argentina, 24-09-2026](https://www.forbesargentina.com/innovacion/las-fintech-van-dinero-parejas-familias-amigos-nuevo-negocio-cuentas-compartidas-n98660); fuente interesada: es su lanzamiento).
  - **Supervielle "SuperFamilia"** (nov-2026): grupo familiar, límites de gasto, mensualidades, cuentas para adolescentes de 13–17 ([Forbes Argentina, 06-11-2026](https://www.forbesargentina.com/brandvoice/superapp-supervielle-lanza-una-nueva-funcion-cambia-forma-administrar-plata-familia-n101926); nota paga de la marca).
  - **Ualá** categoriza gastos de su propia tarjeta; **Mercado Pago** remunera el saldo en un FCI money market y en jul-2026 sumó fondos de
    renta fija y acciones ([iProfesional](https://www.iprofesional.com/finanzas/457143-mercado-pago-apuesta-ahorro-con-dos-nuevos-fondos-como-invertir-desde-100-pesos)).
  - Startups chicas: AIKESTAR (asistente IA para hogares y pymes), Orionfin (asistente por WhatsApp), Salame y PagameYa (deudas entre
    amigos) ([Mercado](https://mercado.com.ar/finanzas/relanzaron-aikestar-una-plataforma-de-gestion-financiera-con-asistente-de-ia-para-hogares-y-pequenos-negocios), [iProfesional](https://www.iprofesional.com/negocios/440064-que-es-orionfin-easistente-financiero-para-administrar-gastos-y-ahorros-por-whatsapp)).
    Ninguna con tracción pública visible.
  - Plantillas: se venden planillas "presupuesto ajustado por inflación Argentina" a USD 4 y planillas genéricas a USD 5–15 en
    Gumroad y Etsy; Tiendanube, Equifax y blogs regalan planillas para captar tráfico ([Getly](https://www.getly.store/product/presupuesto-mensual-ajustado-por-inflaci-n-argentina-excel-google-sheets), [Tiendanube](https://www.tiendanube.com/recursos/planillas/control-de-gastos-excel)).
    **INFERENCIA:** la planilla es la alternativa real más usada y una vidriera de búsquedas que Nido puede ocupar.

**INFERENCIA central del mercado.** Cada banco ve solo su plata: la cuenta compartida de Naranja X ordena lo que pasa por Naranja X,
la de Supervielle lo de Supervielle. **Una familia típica usa 2–4 bancos y billeteras y 2–3 tarjetas.** Nadie arma la foto completa
de la casa, con cuotas, tarjetas y dos personas, sin pedir que muevas la plata. Ese hueco es Nido.

---

## 3. Particularidades de Argentina y la región (el diferencial)

| Tema | Hecho (fuente, fecha) | Qué significa para Nido |
|---|---|---|
| Inflación | ~2% mensual en 2026; el REM espera ~30% anual para 2026 ([El Economista, 28-10-2026](https://eleconomista.com.ar/economia/la-desinflacion-tambien-estanco-precios-cierran-octubre-alzas-18-2-n99289)). IPC de oct-2025: 2,3% ([Buenos Aires Herald](https://buenosairesherald.com/?p=1073644)). El dato oficial de oct-2026 no se pudo verificar | Comparar meses en pesos nominales engaña: mostrar "en pesos de hoy" y en dólares |
| Cuotas | Las 12 sin interés casi desaparecieron a mediados de 2026; vuelven en promociones (Banco Nación 20 cuotas en marzo; Provincia hasta 24 en el CyberMonday de nov-2026) ([iProfesional, jul-2026](https://www.iprofesional.com/economia/436186-desaparecen-12-cuotas-sin-interes-es-cada-vez-mas-caro-financiarse-con-tarjetas)) | "¿Cuotas o contado con descuento?" y "cuánto tengo comprometido en cuotas los próximos meses" son preguntas reales y frecuentes |
| Tarjetas con cierre y vencimiento | Práctica estándar local; las apps globales imputan a la fecha de compra | Nido ya imputa al mes de pago según el cierre: diferencial existente |
| Dólar y fondos | Dólar mayorista ~$1.525 (25-09-2026, `radar/contexto-macro.md`); 20–29 M de personas cobran rendimientos diarios en billeteras (CAFCI/Invecq vía [iProUP](https://www.iproup.com/finanzas/72757-cuanto-ganaron-los-usuarios-de-mercado-pago-en-2025)); usuarios de Mercado Pago cobraron ~USD 1.100 M en 2025 | La familia argentina "tiene fondos" (MP, FCI, plazo fijo, dólares): Nido ya los modela con aportes y rendimiento real |
| Open banking | Decreto 353/2025 creó el sistema de finanzas abiertas con el BCRA como autoridad, pero a 2026 **no hay estándar técnico ni cronograma** ([Fiskil](https://www.fiskil.com/open-finance-tracker/argentina), proveedor: interesado; [Allende](https://allende.com/en/banking/argentinas-executive-power-launches-the-open-finance-system-06-04-2025/)) | No hay "conectar el banco" legal y estable en 2027. Lo reemplaza leer el **resumen PDF**, los comprobantes compartidos y las notificaciones |
| Tickets y facturas | El QR de la factura electrónica de ARCA codifica un JSON con versión, fecha, CUIT, punto de venta, tipo y número, importe, moneda y CAE (RG 4290/2018; [ARCA](https://arca.gob.ar/fe/qr/ejemplo-de-comprobante.asp); implementación de referencia en [pyafipws](https://www.github.com/PyAr/pyafipws/blob/main/pyqr.py)). **No trae los renglones** | El QR da comercio (CUIT), fecha e importe exactos sin IA; los renglones salen de la foto con IA |
| Pagos con el celular | Google Wallet funciona en Argentina desde 2023; Tap to Pay en iPhone llegó el 22-09-2026 solo con Mercado Pago ([iProUP](https://www.iproup.com/finanzas/71781-apple-tap-to-pay-argentina-mercado-pago-iphone-nfc-septiembre-2026)) | El atajo "cada vez que pagás con Apple Pay" sirve poco en Argentina; en Android, la notificación del banco o billetera es la fuente más rica |
| Ingresos variables | **HIPÓTESIS** (sin fuente cuantitativa): monotributistas y changas hacen que el ingreso mensual no sea fijo | Plan mensual con "ingreso esperado" y reparto por % de lo que sobra (ya existe) |
| Economía de pareja | Naranja X midió que 5 de cada 10 clientes comparten gastos o ayudan a cercanos (interesada) | "Lo mío, lo tuyo, lo nuestro" sin mover la plata |

---

## 4. Patrones de experiencia que retienen (evidencia)

- **La carga manual es la principal causa de abandono** en apps de presupuesto: hay blogs que dicen que las apps manuales pierden
  usuarios 3 veces más rápido, pero **sin estudio primario verificable** ([wealthwiseos](https://wealthwiseos.pages.dev/blog/why-budgeting-apps-fail-30-days)). Las finanzas
  retienen mejor que el promedio de apps (retención al día 30 de ~4–9% en general; [Plotline](https://www.plotline.so/blog/retention-rates-mobile-apps-by-industry),
  [eMarketer](https://www.emarketer.com/content/finance-apps-keep-users-engaged-longer-than-any-other-industry)). **HIPÓTESIS**: la retención de Nido depende de que cargar tarde menos que olvidarse.
- **iOS:** desde iOS 17 los Atajos tienen el disparador "Transacción" (cada pago con Apple Pay), usado por apps sin conexión bancaria
  (WalletPal, Finny). No siempre se dispara ([Finny](https://getfinny.app/blog/ios-shortcuts-automations-flaky-fix), interesada).
- **Android:** varias apps leen las notificaciones del banco con permiso explícito y solo de las apps que elige el usuario
  (Bluecoins, Olik Split; [Bluecoins](https://new.bluecoinsapp.com/guide/bank-notifications/)). Google exige declararlo y mostrarlo; **verificar la política vigente
  de permisos sensibles antes de construir**.
- **Web instalable en iPhone:** notificaciones solo si la app está en la pantalla de inicio (iOS 16.4+); sin aviso de instalación
  automático ([MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)). Conclusión: web primero para validar, app nativa (Capacitor) para widgets, compartir y notificaciones.
- **Diseño como producto:** Copilot cobra USD 95/año sobre todo por diseño y velocidad (4,8 estrellas). **INFERENCIA**: en un mercado
  en español lleno de apps feas o con publicidad, el diseño es una ventaja de verdad, no un adorno.
- **Precio y enojo:** lo que más enoja es quitar lo gratis de golpe (Splitwise) y subir precio sin aviso (YNAB). Regla para Nido: lo
  gratis nunca se achica; precio fundador congelado.

---

## 5. Nombre: verificación de «Nido» (15-11-2026)

| Hallazgo | Riesgo |
|---|---|
| **Nido (Nestlé)**: marca de leche registrada en muchos países (EE.UU. reg. 7087981, clases 5 y 29; Australia 78818). Muy conocida en Latinoamérica ([Markinton](https://markinton.com/trademark/nido-97001822), [IP Australia](https://search.ipaustralia.gov.au/trademarks/search/view/78818/details)) | Otra clase (no 9, 36 ni 42), pero si se la considera **marca notoria** puede oponerse; además ensucia búsquedas ("nido app" devuelve leche y bebés) |
| **"Nido: Personal Finance & Expenses"** en Product Hunt (2026): finanzas personales 100% offline, deudas, **cuotas**, widget, voz y escaneo de tickets; desarrollador independiente de habla hispana ([Product Hunt](https://www.producthunt.com/p/nido-personal-finance-expenses)) | **Conflicto directo**: misma categoría y casi las mismas funciones; no se encontró en las tiendas, pero existe y es anterior |
| **"Mi Nido"** (2023): app de finanzas compartidas para grupos, fundadores de Colombia, Ecuador y España ([Platzi](https://platzi.com/blog/minido)); otra "Mi Nido" de tareas del hogar en la App Store de México ([App Store](https://apps.apple.com/mx/app/mi-nido/id6756851493)) | Conflicto en clase 36/9 en la región |
| **Nidoro: Couple Finance** (App Store) y **Nido Rewards** (alquileres, EE.UU.) | Cercanos |
| El propio holding ya había evaluado "Nido" como nombre del holding: "nombre común" (`_holding.yaml`) | — |

**Conclusión: «Nido» queda como nombre de trabajo y como palabra del lema, pero no como marca.** Alternativas buscadas el 15-11-2026
(búsqueda web; **INPI y dominios pendientes**):

| Nombre | Por qué | Estado |
|---|---|---|
| **Alero** | "Bajo el mismo alero": la casa que cubre a la familia; corto, rioplatense, no es la palabra de todos | Solo una app de compras en El Salvador ("Alero App") y "Altero" (deudas, México). Sin finanzas en Argentina. **Recomendado** |
| **Ombú** | El árbol que da sombra a todos en la pampa; identidad argentina fuerte | Sin apps de finanzas en la búsqueda; difícil de escribir fuera de la región (la tilde) |
| **Nidito** | Diminutivo cariñoso; mantiene la idea del fundador | Sin apps en la búsqueda; pero arrastra el ruido de "Nido" y de Nestlé |
| **Hornero** | El pájaro que construye su casa de a poco: la metáfora exacta del ahorro familiar | **Ya existe Hornero** (proptech de alquileres, Argentina/Uruguay; clase 36) y Hornero Game Studio: descartado |
| **Tándem** | Dos que pedalean juntos: economía de pareja | No verificado a fondo; palabra muy usada en marcas: verificar |

Recomendación: **Alero** como marca ("Alero · la plata de tu casa, en orden"), con "tu nido" en el texto. Si el fundador prefiere
quedarse con Nido, usar una marca compuesta y distintiva (por ejemplo "Nido Casa") y pedir búsqueda de anterioridad en el INPI en
clases 9, 36 y 42 antes de gastar en diseño.

---

## 6. Privacidad y legal (Argentina, tiendas)

- **Ley 25.326** sigue plenamente vigente; hay proyectos de reemplazo (del Ejecutivo 2023, reingresado por el diputado Rossi el
  16-07-2026 como 3397-D-2026; otros de Carro y Doñate) sin sanción a ago-2026 ([Marval](https://www.marval.com/Publicacion/nuevo-proyecto-de-ley-de-proteccion-de-datos-17691),
  [Diario Judicial](https://www.diariojudicial.com/news-99786-datos-personales-libro-y-debate-en-agenda), [IAPP](https://iapp.org/news/a/novedades-legislativas-en-argentina-sobre-protecci-n-de-datos-personales-e-inteligencia-artificial)).
  **INFERENCIA (consultar abogado):** obligaciones prácticas: consentimiento informado, política de privacidad, derechos de acceso y
  supresión, seguridad, inscripción de la base en el registro de la AAIP si hay datos en servidor, y reglas de transferencia
  internacional si el servidor está fuera de la Argentina.
- **Dato sensible escondido:** la ley llama "sensibles" a los datos que revelan convicciones religiosas o salud. Un rubro "Diezmo y
  ofrendas" o renglones de farmacia **pueden revelarlos**. Por eso: el módulo de diezmo es opcional y el diseño cifra de punta a punta.
- **Asesoramiento financiero:** recomendar instrumentos concretos (comprar tal fondo o tal bono) puede encuadrarse como asesoramiento
  regulado por la CNV (Ley 26.831; figura de agente asesor). Nido muestra los datos de la familia, calcula y explica; **nunca
  recomienda productos ni cobra comisiones por ellos**. Verificar con abogado.
- **Google Play:** todas las apps deben completar la declaración de funciones financieras; los préstamos y cripto tienen requisitos
  de licencia ([Google Play, Financial Services](https://support.google.com/googleplay/android-developer/answer/9876821)). Un registro de gastos que no mueve plata
  no pide licencia (INFERENCIA; confirmar en la consola). Formulario de seguridad de datos obligatorio.
- **App Store:** guías revisadas el 13-11-2025; las apps de servicios "altamente regulados" (5.1.1 ix) tienen revisión más estricta y
  las de inversión o gestión de dinero deben venir de la institución que presta el servicio ([Apple](https://developer.apple.com/news/?id=7j1f99yf),
  [foro de Apple](https://developer.apple.com/forums/thread/704470)). YNAB, Copilot o Monarch publican sin ser bancos porque **no mueven
  dinero**: Nido tampoco debe moverlo.
- **Costos de IA (precio oficial, 15-11-2026):** Claude Haiku 5.5 a USD 0,10 por millón de tokens de entrada y USD 0,50 de salida (hasta
  100 mil tokens); Haiku 4.5 a USD 1 / USD 5; lotes con 50% de descuento ([Anthropic](https://platform.claude.com/docs/en/about-claude/pricing)).
  **ESTIMACIÓN:** un ticket ≈ 2.100 tokens de entrada (foto + instrucciones) y 600 de salida → **USD 0,0005 con Haiku 5.5** (USD 0,005
  con Haiku 4.5); un resumen de tarjeta de 4 páginas ≈ 12 mil de entrada y 3 mil de salida → **USD 0,003**. Un hogar activo con 40
  tickets y 3 resúmenes por mes: **USD 0,03–0,25 por mes** según el modelo. La calidad de Haiku 5.5 con tickets argentinos arrugados
  es **HIPÓTESIS**: se prueba con 100 tickets reales (sin subirlos al repositorio).

---

## 7. Cliente, trabajo a resolver, alternativa y tamaño

**Cliente y decisor (HIPÓTESIS a validar con entrevistas).** Usa: parejas y familias de 25–50 años, bancarizadas, con 2–4 bancos o
billeteras y al menos una tarjeta en cuotas. Decide: casi siempre **la persona de la pareja que "lleva las cuentas"** (hoy con una
planilla o notas); paga de su bolsillo, del presupuesto de la casa (rubro "suscripciones", que compite con Netflix o Spotify). Influye:
la otra persona, que tiene que aceptar cargar.

**Trabajo a resolver.** "Saber, sin pelearnos y sin perder una noche por mes, cuánto gastamos, cuánto tenemos comprometido en cuotas,
cuánto nos sobra y cuánto llevamos juntado para lo que queremos." Costo de hoy (HIPÓTESIS): 1–3 horas por mes de planilla, sorpresas
en el resumen de la tarjeta, discusiones de pareja, ahorro que "no se sabe dónde quedó". Frecuencia: diaria (cargar) y mensual (cerrar).

**Alternativa actual y su precio (el verdadero competidor).**
1. **La planilla** (Excel o Google Sheets): gratis o USD 4–15 una vez ([Getly](https://www.getly.store/product/presupuesto-mensual-ajustado-por-inflaci-n-argentina-excel-google-sheets), [Gumroad](https://topexceltemplates.gumroad.com/l/xsghx)).
2. **La app del banco o billetera**: gratis, pero ve un solo banco (Naranja X, Supervielle, Ualá, Mercado Pago).
3. **Apps globales gratis con publicidad** (Money Manager, Monefy, Wallet): gratis o pago único USD 3–20; no entienden cuotas ni cierre.
4. **No hacer nada**: la opción más común. Se mira el resumen de la tarjeta cuando llega.

**Tamaño de abajo hacia arriba (ESTIMACIÓN, método explícito).**
- Unidades: Argentina tiene 16 M+ de hogares (dato de Naranja X, interesada; re-verificar con INDEC). Supuesto: 8–12% son parejas o
  familias bancarizadas que ya intentan llevar las cuentas (planilla, notas o app) → **1,3–1,9 M de hogares**.
- Ticket: USD 20–30 por año por hogar (precio latinoamericano, neto de tiendas ~USD 2–2,5 por mes).
- Disposición a pagar: 2–5% de los que llevan cuentas pagaría por algo claramente mejor que su planilla (HIPÓTESIS; Mobills y Organizze
  muestran que en Brasil se paga) → **26 mil–95 mil hogares pagos posibles en Argentina** → **USD 0,6–2,4 M por año** de techo local.
- Lo que el caso de negocio supone capturar en 5 años (escenario normal): ~1.250–1.500 hogares pagos sumando Argentina, Uruguay,
  Chile, México y España → 1–5% del techo argentino. No se usa ningún TAM de arriba hacia abajo.

**Competencia.** Directos: apps de presupuesto en español (Mobills/Organizze en Brasil; Money Manager, Monefy, Wallet, Spendee globales;
startups locales sin tracción). Sustitutos: planilla, app del banco, cuenta compartida de Naranja X o Supervielle, Splitwise para
dividir. "No hacer nada": el más fuerte.

**¿Qué impide que nos copien en 6 meses? (honesto: poco por separado).** Lo técnico se copia. Lo que cuesta copiar junto: (1) el modelo
contable local ya probado (cuotas, cierre, fondos, cierre de mes) más los lectores de resúmenes banco por banco, que mejoran con cada
resumen; (2) diseño y tono propios, que los bancos no priorizan; (3) la promesa de privacidad verificable (cifrado de punta a punta),
que un banco o una app que vive de vender productos financieros no puede hacer; (4) el costo de cambiarse: dos personas y años de
historia adentro; (5) la biblioteca de plantillas y guías que trae búsquedas; (6) el canal de mayordomía cristiana vía Senda. Riesgo
mayor: Mercado Pago o un banco grande lanza "las finanzas de tu casa con todas tus cuentas" cuando haya finanzas abiertas (2028+).

---

## 8. Guion de entrevistas (12 hogares, sobre lo que hicieron, no sobre lo que harían)

A quién: 12 hogares (8 parejas, 2 familias con hijos, 2 personas que viven solas), mitad que lleva cuentas hoy y mitad que no.
Cómo: la lista de espera de la landing y la beta (nunca contactos en frío sin OK del fundador; regla 8). 30 minutos, por audio.

1. "Contame la última vez que se sentaron a ver cómo venían con la plata. ¿Cuándo fue, qué miraron, con qué?"
2. "¿Dónde anotaste el último gasto que anotaste? Mostrame (sin montos) cómo lo hiciste."
3. "¿Cuándo fue la última vez que el resumen de la tarjeta te sorprendió? ¿Qué pasó después?"
4. "¿Qué suscripciones de apps pagás hoy? ¿Cuál fue la última que diste de baja y por qué?" (disposición a pagar real)
5. "¿Probaste alguna app para gastos? ¿Cuál, cuánto duraste y qué día dejaste de usarla?"
6. "La última compra en cuotas: ¿cómo decidiste cuotas o contado?"
7. "¿Cómo se reparten los gastos con tu pareja? Contame la última discusión por plata (si querés)."
8. "¿Dónde tienen guardados los ahorros hoy? ¿Cómo saben cuánto rindió el mes pasado?"
9. "¿Qué hiciste la última vez que te llegó una notificación de compra del banco o de Mercado Pago?"
10. "¿Alguna vez le diste la clave del banco a una app? ¿Por qué sí o por qué no?"
11. "Si tuviste una planilla, ¿cuánto tiempo la sostuviste? ¿Qué pasó el mes que la dejaste?"
12. (Solo si aplica, sin forzar) "¿Diezman u ofrendan? ¿Cómo llevan esa cuenta hoy?"

Qué se valida: frecuencia real de carga, momento de abandono, cuánto pagan hoy por apps, si la pareja carga, y si el resumen PDF o
la notificación son la puerta de entrada correcta.

---

## 9. Lo que falta averiguar (y cómo)

1. Búsqueda de anterioridad en el INPI de Alero, Ombú y Nido en clases 9, 36 y 42 (el fundador o un gestor; ~USD 0–30).
2. Dominios disponibles (alero.app, usealero.com, etc.).
3. Política vigente de Google Play para leer notificaciones (permisos sensibles) y si Mercado Pago y los bancos permiten compartir el
   comprobante como archivo.
4. Precios reales en pesos de Mobills/Organizze/Wallet en la tienda argentina, y cuánto paga un argentino por una suscripción de app
   (pregunta 4 del guion de entrevistas, §8).
5. Calidad de la lectura de resúmenes PDF por banco (Galicia, Santander, BBVA, Nación, Provincia, Naranja, MP): 2 resúmenes de
   ejemplo por emisor, tachados, aportados por voluntarios de la beta.
