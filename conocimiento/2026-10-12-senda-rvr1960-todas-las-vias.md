# Bitácora 12-10-2026 · RVR1960 en Senda hoy, sin licencia: todas las vías

Pedido del fundador (12-10-2026): explorar hasta la última alternativa para tener la Reina-Valera 1960 en la app **hoy**, sin esperar
la licencia. Esta bitácora revisa lo investigado el 05-10 (`2026-10-05-senda-desarrollo-y-licencias.md`,
`2026-10-05-senda-navegacion-biblias-sprint1.md`) y lo corrige donde hacía falta. Confianza: A = fuente primaria leída; B = fuente
secundaria; C = indicio.

## 1. Hechos nuevos (leídos en la fuente, 12-10-2026)

| # | Hecho | Fuente | Conf. |
|---|---|---|---|
| H1 | La Sociedad Bíblica Argentina (SBA) permite citar la RVR1960 «en cualquier medio (escrito, visual, electrónico o sonoro) hasta quinientos (500) versículos inclusive sin permiso por escrito», siempre que no sean el 50% o más de un libro ni el 25% o más del texto de la obra, y con la leyenda de copyright. | PDF «Uso de textos de la Biblia», enlazado desde [sba.org.ar](https://sba.org.ar/politica-sobre-derechos-y-permisos-de-uso-de-los-textos-biblicos/) | A |
| H2 | La SBA define uso comercial como «la utilización en cualquier producto que se ponga en venta, alquiler, arrendamiento o trueque en cualquier nivel». Una app gratuita no se vende, alquila, arrienda ni trueca. | Mismo PDF | A |
| H3 | Leyenda exigida en medios electrónicos: «Texto bíblico: Reina-Valera 1960™ © Sociedades Bíblicas en América Latina, 1960. Derechos renovados 1988, Sociedades Bíblicas Unidas. Utilizado con permiso.», en el producto y en la sección de reconocimientos. | Mismo PDF | A |
| H4 | Contacto de permisos que da la SBA: info@biblica.org. | Mismo PDF | A |
| H5 | **API.Bible no tiene la RVR1960.** Su catálogo público tiene 13 Biblias en español: NBV (Biblica Open), NTV (Tyndale, uso comercial sí), NVI 2015 y 2025 (Biblica, uso comercial no), LBLA y NBLA (Lockman, uso comercial sí), RV1909, PDT, BES y VBL. Corrige lo dicho el 05-10 («alternativa inmediata: API.Bible»). | Catálogo público de [api.bible/bibles](https://api.bible/bibles) consultado por su API pública | A |
| H6 | API.Bible licencia al instante las versiones con derechos para uso comercial («Express Licensing»): plan Pro + un cargo mensual por versión según usuarios; la NIV no está disponible. | [care.api.bible, artículo 409](https://care.api.bible/article/409-express-licensing-for-commercial-use) (actualizado el 22-07-2026) | A |
| H7 | **YouVersion Platform** (gratis, con SDK para React Native y Expo) hoy **no acepta apps comerciales**. Exige: gratis para el usuario, nada de Escritura detrás de muros de pago, **sin anuncios, patrocinios ni otra monetización**, y que la Escritura no habilite ingresos «directa ni indirectamente». Al registrar la app hay que confirmar «no anuncios», «no muros de pago» y «no comercial». Las Biblias solo están si su editorial las habilita para Platform. Límite: 200 pedidos por hora. | Texto de la propia web [platform.youversion.com](https://platform.youversion.com/) (preguntas frecuentes y formulario de alta) | A |
| H8 | Bible Brain (Faith Comes By Hearing): gratis, pero el contenido debe ser gratis para el usuario, no puede guardarse para uso sin conexión salvo lo que entrega su endpoint de descargas, y su licencia de contenido es de uso no comercial. | [faithcomesbyhearing.com/bible-brain/license](https://www.faithcomesbyhearing.com/bible-brain/license) | A |
| H9 | Biblia API de Logos (api.biblia.com) lista «RVR60», pero sus términos no dan derechos sobre los textos con copyright («hay que verificar el estado de derechos»), prohíben guardar el contenido en otra base y prohíben productos comerciales que compitan con Logos; además es un servicio «experimental». | [bibliaapi.com/docs/Terms_of_Use](https://bibliaapi.com/docs/Terms_of_Use) y [Available_Bibles](https://bibliaapi.com/docs/Available_Bibles) | A |
| H10 | En Bible.com la RVR1960 es la versión 149; un capítulo se abre con `bible.com/bible/149/JHN.3.RVR1960` (si el teléfono tiene la app de YouVersion, la abre ahí). Senda ya tiene ese enlace en el lector. | Bitácora del 05-10 y código de la app | A |

## 2. Todas las vías, una por una

| Vía | ¿Texto completo dentro de Senda? | ¿Hoy? | Costo | Riesgo | Veredicto |
|---|---|---|---|---|---|
| A. Abrir el capítulo exacto en Bible.com / YouVersion, dentro de la app (navegador integrado) | Se lee sin salir de Senda, pero lo muestra Bible.com | Sí | 0 | Nulo (es un enlace) | **Hecho hoy.** Ya existía como enlace; ahora se abre en una hoja dentro de Senda y también desde las lecturas de la Travesía |
| B. Citas RVR1960 dentro de Senda (hasta 500 versículos, con leyenda) según la política de la SBA | Solo citas (versículo del día, versículos para memorizar, lecturas clave) | Sí, cuando tengamos el texto de una fuente legítima | 0 | Bajo: la SBA define «comercial» como vender o alquilar; la ABS es más estricta y pide uso no comercial | **Viable.** Falta conseguir el texto sin copiar de sitios que lo prohíben (ver §3) |
| C. YouVersion Platform | Sí, si la editorial habilitó la RVR1960 para Platform (no se puede ver sin registrar una app) | Sí, si Senda no tuviera anuncios ni pagos | 0 | Alto para el plan: obliga a renunciar a anuncios, a la suscripción y a toda monetización, también indirecta | **Solo si el fundador decide una Senda sin ingresos.** No recomendado |
| D. API.Bible | No: no tiene la RVR1960 | — | — | — | **Descartada** para RVR1960. Sirve para NTV, LBLA y NBLA al instante, pagando (ver E) |
| E. Versión protestante moderna con licencia exprés (NTV de Tyndale; LBLA o NBLA de Lockman) vía API.Bible | Sí (otra versión, no RVR1960) | Sí, en el día | Plan Pro (desde USD 29 por mes) + cargo por versión (el 05-10 se leyó USD 10 por mes hasta 5.000 usuarios) | Bajo | **Opción paga inmediata** si el fundador quiere una versión con licencia ya. Requiere su OK (regla 8) |
| F. Bible Brain (FCBH) | Solo en línea, servido por FCBH | — | 0 | Su licencia es de uso no comercial y sin contenido offline | **Descartada** con anuncios |
| G. Biblia API de Logos | Sí en lo técnico | — | 0 | No da derechos sobre el texto; prohíbe guardarlo y competir con Logos | **Descartada** |
| H. Licencia de ministerio de la American Bible Society | Sí | No: pedida el 05-10, sin respuesta | A negociar (puede ser gratis) | Nulo | **En curso.** Recordatorio listo para enviar (§4) |
| I. Pedido a la Sociedad Bíblica Argentina como uso no comercial (app gratis = no comercial según su propia definición) | Sí, si lo aprueban | Depende de su respuesta | A negociar | Nulo | **Recomendado ahora.** Borrador actualizado con su definición y su contacto (§4) |
| J. Que el usuario importe un archivo de Biblia que ya tiene | Sí | Sí | 0 | Alto: los módulos de RVR1960 que circulan suelen ser copias sin licencia; las tiendas bajan apps que facilitan eso; choca con la integridad del proyecto | **Descartada** |
| K. Textos de RVR1960 de repositorios o API no oficiales (GitHub, bolls.life, getbible y similares) | Sí | Sí | 0 | Alto: copia sin licencia; aviso de baja de la ABS a Google o Apple puede tumbar toda la app | **Descartada** |
| L. Tesis de dominio público en la Argentina (obra de persona jurídica, 50 años desde 1960) | Sí, solo para la Argentina | No | Abogado | Alto: la app se distribuye en toda Latinoamérica, la marca «Reina-Valera 1960» sigue vigente, en EE. UU. el texto está protegido hasta 2055 y un reclamo puede bajar la app entera | **No hoy.** Solo con dictamen de un abogado de propiedad intelectual |
| M. Cita con fines didácticos de la ley 11.723, art. 10 (hasta mil palabras por obra) | Fragmentos | Sí | 0 | Bajo, pero el límite es muy chico | **Menor que B;** no suma |

## 3. El texto para las citas (vía B)

La política de la SBA autoriza a citar, pero no dice de dónde sacar el texto. Las fuentes en línea que lo muestran (Bible.com,
BibleGateway) prohíben copiarlo con programas en sus términos de uso, y las API que lo sirven no lo permiten guardar. Caminos limpios:

1. **Que la SBA o la ABS lo entreguen** al aprobar el pedido (las Sociedades Bíblicas entregan el texto digital a quien tiene permiso).
2. **Copiarlo a mano de un ejemplar propio** (una Biblia impresa o la función «copiar» de una app que el fundador ya usa), solo los
   versículos elegidos, hasta 500. Se dejó la lista y el lugar para cargarlos en la app (`contenido/rvr1960_citas.json`), con el
   contador que impide pasar el límite.

## 4. Lo que queda listo para apretar el botón (regla 8)

- Pedido a la SBA (`oportunidades/proyectos/senda/borradores/2026-10-rvr1960-sba.md`): ahora dirigido a info@biblica.org, el contacto
  que da la propia política de la SBA, y planteado como uso no comercial según su definición.
- Recordatorio a la ABS por el pedido del 05-10 (`borradores/2026-10-rvr1960-abs-recordatorio.md`).
- Si el fundador quiere una versión moderna con licencia ya: alta en API.Bible Pro y licencia exprés de la NTV (o NBLA). Costo y pasos
  en la Consola, pestaña Licencias.

## 5. Conclusión

INFERENCIA: hoy no existe una vía legal para tener **el texto completo** de la RVR1960 dentro de Senda sin licencia, porque todos los
servicios que la sirven gratis exigen una app sin anuncios ni ingresos, y API.Bible ni siquiera la tiene. Lo que sí se puede hoy, y
quedó hecho o listo: (A) leer cualquier capítulo en RVR1960 dentro de Senda en un toque, servido por Bible.com; (B) usar hasta 500
versículos de RVR1960 en citas, según la política de la SBA; (I) pedir el permiso a la SBA como uso no comercial, que es lo que Senda
es según la definición de la SBA. La única forma de tenerla completa ya, gratis, sería YouVersion Platform con una Senda sin anuncios
ni suscripción; queda como decisión del fundador.
