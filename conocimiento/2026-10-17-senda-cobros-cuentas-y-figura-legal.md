# Senda: cómo entra la plata (suscripciones y anuncios), a qué cuenta va y qué hace falta en lo legal

Bitácora del 17-10-2026. Pedido del fundador: saber a qué cuenta bancaria va lo que paguen las suscripciones y lo que dejen los
anuncios, cómo funciona y si hace falta algo legal. Los datos de Google se leyeron en su centro de ayuda; los del BCRA y ARCA, en
estudios y medios que citan las normas (la red del entorno no abre bcra.gob.ar ni boletinoficial.gob.ar). **Todo lo que decida plata
se re-verifica con un contador matriculado antes de facturar.**

## 1. Hechos

### Google Play (suscripciones y compras dentro de la app)

| # | Hecho | Fuente y fecha |
|---|---|---|
| 1 | Argentina admite el alta de desarrolladores y de comerciantes («merchant»); la moneda por defecto del desarrollador es el dólar | [Play Console, ubicaciones admitidas](https://support.google.com/googleplay/android-developer/answer/9306917) (consultado 17-10-2026) |
| 2 | A los comerciantes de Argentina se les paga por transferencia desde EE.UU., en dólares | Ídem |
| 3 | Para cobrar por transferencia en dólares, el saldo tiene que llegar a USD 100 al cierre del ciclo | [Pagos por transferencia](https://support.google.com/googleplay/android-developer/answer/2700656) (17-10-2026) |
| 4 | Los bancos argentinos pueden pedir documentación al recibir el pago (la página cita la Comunicación «A» 6037 del BCRA y el boleto de cambio), aun por montos chicos, y puede pedirse una factura según las reglas impositivas locales | Ídem |
| 5 | La cuenta bancaria tiene que estar en el mismo país donde está registrado el comerciante; para transferencia, en dólares; si el banco ofrece cuenta en dólares, es la opción preferida | [Datos bancarios del comerciante](https://support.google.com/googleplay/android-developer/answer/7161440) (17-10-2026) |
| 6 | Las cuentas que cobran (apps pagas o compras dentro de la app) **muestran en Google Play la dirección completa**, tomada del perfil de pagos; el nombre de desarrollador que se ve se elige y se puede cambiar | [Información que se muestra en Google Play](https://support.google.com/googleplay/android-developer/answer/13634081) (17-10-2026) |
| 7 | Una cuenta de organización necesita número D-U-N-S (gratis, pedirlo puede tardar hasta 30 días); sin él no se crea | [Datos para crear la cuenta](https://support.google.com/googleplay/android-developer/answer/13628312) (17-10-2026) |
| 8 | La prueba cerrada obligatoria (12 testers durante 14 días) rige para las cuentas **personales** creadas después del 13-11-2023 | [Requisitos de prueba de cuentas personales nuevas](https://support.google.com/googleplay/android-developer/answer/14151465) (17-10-2026) |
| 9 | Google pide el formulario W-8BEN (persona) o W-8BEN-E (empresa) en el perfil de pagos para pagar a tiempo; entrega cada año un resumen de retenciones por país (algunos países, como Brasil, retienen sobre las ventas de desarrolladores de afuera) | [Información fiscal del comerciante](https://support.google.com/paymentscenter/answer/13401799) (17-10-2026) |

### AdMob (anuncios)

| # | Hecho | Fuente y fecha |
|---|---|---|
| 10 | El pago por transferencia está disponible solo en algunos países: si en Pagos aparece «Agregar cuenta bancaria», está habilitado; se verifica con un depósito de prueba; el pago sale cerca del día 21 de cada mes | [AdMob, recibir pagos por transferencia](https://support.google.com/admob/answer/3372975?hl=es) (17-10-2026) |
| 11 | La cuenta tiene que estar en el país del editor; Google paga en dólares o euros según el país | [AdMob, preguntas sobre transferencias](https://support.google.com/admob/answer/6025222) (17-10-2026) |
| 12 | AdMob «rara vez» retiene impuestos de EE.UU. (hasta 30% si faltan formularios); quien no tiene actividades en EE.UU. puede declararlo («Foreign Publisher with no US Activities») y no necesita formularios | [AdMob, impuestos de EE.UU.](https://support.google.com/admob/answer/4381375) (17-10-2026) |
| 13 | Guías de 2019 a 2026 cuentan cobros de AdSense y AdMob desde Argentina por transferencia a cajas de ahorro en dólares, aceptando la orden de pago en el home banking y facturando como exportación de servicios | [Guía 2026](https://cristianveloso.com/como-cobrar-google-adsense-en-argentina/); [caso Santander 2019](https://cronicasfreelancer.com/2019/06/21/cobrar-adsense-transferencia-bancaria/) |

### Argentina: dólares, impuestos y consumidor

| # | Hecho | Fuente y fecha |
|---|---|---|
| 14 | Comunicación «A» 8417 del BCRA (09-04-2026): las personas humanas que exportan servicios quedan eximidas de liquidar en el mercado de cambios, para todos los servicios | [Smartlog, abr-2026](https://www.smartlog.com.ar/blog/exportacion-de-servicios-abril-2026-nueva-opcion-para-no-liquidar-divisas/); [Allende & Brea, 14-04-2026](https://allende.com/bancario/el-banco-central-flexibiliza-el-regimen-cambiario-para-exportaciones-transferencias-en-moneda-extranjera-y-pagos-financieros-04-14-2026/) |
| 15 | Comunicación «A» 8481 (14-09-2026): se elimina el tope de USD 36.000 por año y la declaración jurada; condición: que los fondos se acrediten en una cuenta en moneda extranjera **del titular** en un banco local | [Allende & Brea, 15-09-2026](https://allende.com/bancario/el-bcra-flexibiliza-el-cobro-de-exportaciones-de-servicios-y-ajusta-reglas-de-acceso-al-mercado-de-cambios-09-15-2026/) |
| 16 | Un monotributista puede exportar servicios con factura E (punto de venta propio para exportación); la exportación no lleva IVA y suma a los ingresos que definen la categoría | [Contablix, 2026](https://contablix.ar/blog/factura-e-exportacion-servicios-2026); [Estudio Lorenzo](https://estudiolorenzoasoc.com/blog/monotributo-exportacion-servicios-factura-e-cobro-limites/) |
| 17 | Monotributo: escala vigente desde el 01-08-2026; tope anual de la categoría A ≈ ARS 12,0 millones y de la K ≈ ARS 126,6 millones; cuota de octubre de la A: ARS 49.527 | [iProfesional, oct-2026](https://www.iprofesional.com/impuestos/465371-monotributo-cuanto-se-paga-en-octubre-2026-segun-categoria); [Hacecuentas](https://hacecuentas.com/datos-monotributo-2026) |
| 18 | Los derechos de exportación de servicios (hasta 5%, Ley 27.541) se anunciaron eliminados desde el 01-01-2022; la eliminación dependía de un decreto | [Diario de Cuyo, 24-09-2021](https://diariodecuyo.com.ar/economia/A-partir-de-enero-no-habra-retenciones-a-la-exportacion-de-servicios-20210924-0083.html); [EY, 01-10-2021](https://globaltaxnews.ey.com/news/2021-6012) |
| 19 | Disposición 954/2025 (04-09-2025): quien vende o presta servicios en línea tiene que mostrar en su pantalla principal un **botón de arrepentimiento** (10 días corridos) y un **botón de baja**, sin registro previo, con número de gestión en 24 horas; la Disposición 3/2026 permite verificaciones de identidad razonables | [Allende & Brea, 05-09-2025](https://allende.com/administrativo/el-gobierno-refuerza-la-proteccion-al-consumidor-en-el-comercio-electronico-09-05-2025/); [abogados.com.ar](https://abogados.com.ar/se-unifican-el-derecho-de-arrepentimiento-y-el-boton-de-baja-de-servicios/37500) |
| 20 | El IVA del 21% a servicios digitales del exterior lo cobran al usuario las tarjetas y los procesadores de pago (no el desarrollador) | [LevelUp](https://www.levelup.com/noticias/impuesto-de-compras-digitales-del-21-ya-funciona-en-argentina-y-afecta-a-los-principales-juegos/); [PayPro Global](https://payproglobal.com/it/imposta-sulle-vendite-saas/argentina/) |
| 21 | SAS en CABA: crearla cuesta ARS 750.000 a 1.000.000 y mantenerla con contador, ARS 120.000 a 250.000 por mes (ago-2026); las SAS ya no presentan balances ante la IGJ (RG IGJ 11/2024) | [Indicadores Argentina, ago-2026](https://indicadores.ar/crear-empresa); [Argentina.gob.ar](https://www.argentina.gob.ar/node/433718); [Contablix 2025](https://contablix.ar/blog/sas-en-argentina-todo-lo-que-necesitas-saber-antes-de-armar-una-sociedad-guia-completa-2025) |
| 22 | Comisiones por recibir dólares del exterior: Macro sin comisión hasta USD 10.000 (personas, 2025), Galicia la redujo a la mitad (2025), un caso de Santander gratis (jul-2026) | [Bloomberg Línea](https://www.bloomberglinea.com/latinoamerica/argentina/macro-redobla-la-apuesta-de-galicia-y-elimina-comisiones-para-recibir-dolares-del-exterior/); [La Nación, 02-07-2025](https://www.lanacion.com.ar/economia/dolar/un-banco-reduce-a-la-mitad-las-comisiones-de-transferencias-en-dolares-que-vienen-desde-el-exterior-nid02072025/); [Infoviajera, jul-2026](https://www.infoviajera.com/2026/07/recibir-transferencias-en-dolares-del-exterior-fue-rapido-simple-y-gratis-con-el-banco-santander-de-argentina/) |

## 2. Lo que no quedó confirmado (para el contador o para verlo en la cuenta)

- **HIPÓTESIS:** que AdMob ofrezca hoy «Agregar cuenta bancaria» a cuentas de Argentina. Las guías dicen que sí; se ve en la cuenta.
- **HIPÓTESIS:** que las cuentas de organización no tengan que hacer la prueba cerrada de 12 testers (lo dicen blogs; la página de
  Google habla solo de cuentas personales).
- **HIPÓTESIS:** que los derechos de exportación de servicios ya no rijan (anunciado para 2022; no se encontró el decreto).
- **A confirmar:** a qué entidad de Google se le emite la factura E (la que figure en el informe de pagos; para AdSense en la región
  es Google LLC), el código de actividad en ARCA y si la exportación paga Ingresos Brutos en CABA.
- **A confirmar:** la inscripción de las bases de datos personales en la AAIP (Ley 25.326), gratis por trámite a distancia.

## 3. Inferencias (razonamiento propio)

1. **La plata de Google va a una cuenta en dólares a nombre de quien figura en el perfil de pagos.** Hoy, el fundador (persona); con
   la empresa, la empresa. No hay forma de mandarla a la cuenta de otro.
2. **Lanzar con anuncios y sin compras dentro de la app no expone la dirección**: solo las cuentas que venden en Play la muestran.
   Las suscripciones están en el plan para febrero y marzo de 2027.
3. **Antes de prender las suscripciones conviene tener la empresa**: así Google muestra la dirección de la empresa y no la casa del
   fundador. Además, la empresa puede ser titular de las licencias (la RVR1960 por la DBL exige una organización registrada), limita la
   responsabilidad y saca a las apps nuevas del holding de la prueba cerrada de 12 testers (si se confirma la hipótesis). Coincide con
   la decisión de septiembre (empresa en febrero de 2027, antes de activar cobros).
4. **El monotributo alcanza para el primer año de Senda**: con el dólar oficial de referencia (~ARS 1.545, 25-09-2026) la categoría A
   llega a ~USD 7.800 por año y la K a ~USD 82.000. La plata puede quedarse en dólares (A 8481).
5. **Las tarjetas cobran el IVA al usuario**; Senda no tiene que liquidar IVA por lo que se vende en Play dentro de Argentina.
