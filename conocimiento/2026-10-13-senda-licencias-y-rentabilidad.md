# Bitácora 13-10-2026 · Licencias de Biblias y rentabilidad de Senda

**Por qué.** El 13-10-2026 el fundador compartió la respuesta de Tyndale sobre la NTV: la única forma de usarla electrónicamente es API.Bible.
También vio que, en API.Bible, el grupo de Lockman (AMP, NASB, NASB 2020, LBLA, NBLA) cuesta USD 500 por mes para 25.000 a 100.000 usuarios
por mes, y que eso no le parece escalable. Pidió:
- explorar a fondo;
- ver si se puede pagar menos o nada, o si alcanza con que la gente se descargue el texto al teléfono;
- ayudarlo a decidir entre sacar anuncios y suscripciones, monetizar de otra manera o pagar una sola versión.

**Confianza:** A = fuente primaria leída hoy · B = secundaria · C = indicio.

## 1. Hechos (leídos el 13-10-2026)

| # | Hecho | Fuente | Conf. |
|---|---|---|---|
| L1 | Tyndale respondió el pedido del 05-10. Si la app puede usar una API, la NTV se pide por API.Bible: «es la única forma de acceder a la traducción electrónicamente por ahora». | Correo de Tyndale, pegado por el fundador en la Consola (Licencias → Tyndale) | A |
| L2 | El catálogo de API.Bible en español tiene hoy 13 Biblias. **Con licencia comercial** (Standard License): **NTV** (Tyndale), **LBLA** y **NBLA** (Lockman). **NVI 2015 y 2025** y la **NBV de Biblica**: «Unique License», no comercial (requieren acuerdo directo con Biblica). **Abiertas:** NBV Open, BES, PDT, VBL y RV1909. **No está la RVR1960.** | API pública del catálogo (`api.bible/api/trpc/public.publicBibles.list`, filtro «Spanish») | A |
| L3 | Plan Pro: desde USD 29 por mes, 150.000 llamadas por mes, sobrecargo opcional de USD 1 cada 1.000 llamadas. Uso comercial: plan Pro + un cargo mensual por cada versión con derechos, que depende del editor y de los usuarios por mes. El precio exacto aparece recién en el checkout. | [care.api.bible/article/378](https://care.api.bible/article/378-comparing-api-bible-plans) y [/409](https://care.api.bible/article/409-express-licensing-for-commercial-use) (actualizados el 22-07-2026) | A |
| L4 | **No comercial: plan Pro a USD 29 por mes «con acceso a todas las Biblias con derechos elegibles», sin cargo por versión.** | [care.api.bible/article/405](https://care.api.bible/article/405-express-licensing-faqs) (01-10-2026) | A |
| L5 | Comercial es «cualquier uso que genere ingresos»: anuncios, suscripción, freemium, compras dentro de la app y patrocinios. Solo se exceptúa un enlace discreto para ofrendar o donar; los avisos que interrumpen para pedir donaciones están prohibidos. | [api.bible/faq](https://api.bible/faq) y [términos](https://api.bible/terms-and-conditions) §2.9 | A |
| L6 | Usuarios por mes: «la cantidad de usuarios distintos que acceden a una aplicación durante un mes del plan» (términos §2.25). La guía de licencias dice «usuarios que accederán a la Escritura a través de tu aplicación». **No queda claro si cuentan todos los usuarios de Senda o solo los que abren esa versión: hay que preguntarlo por escrito.** | [Términos](https://api.bible/terms-and-conditions) §2.25 y §17.3(b); búsqueda sobre la guía | A / B |
| L7 | **Sin conexión:** se permite guardar copias. Hay que buscar actualizaciones al menos cada 30 días, y el texto no puede tener más de 30 días de atraso. Si la cuenta se cancela, se borra en 72 horas. Hace falta protección contra copia (DRM). Imprimir, hasta 100 versículos. | Términos §10.2, §11 y §12 | A |
| L8 | **Leer en voz alta textos con derechos tiene límites.** Pasar texto a audio puede ser obra derivada. La voz de IA necesita permiso escrito. Para seis versiones de la ABS se permite la voz efímera. Prohibido mandar texto con derechos a un modelo de IA. | Términos §9.1, §9.2 y §9.10(a); preguntas frecuentes | A |
| L9 | Se puede cambiar la letra y el diseño, pero no el texto (ni la puntuación). | Preguntas frecuentes de licencias | A |
| L10 | YouVersion Platform (gratis) solo acepta apps no comerciales: sin anuncios, sin muros de pago y sin otra monetización. Las versiones están solo si el editor las habilitó. | Bitácora del 12-10 (H7), leído en su web | A |
| L11 | Bible Brain (FCBH): uso no comercial y sin texto sin conexión. | Bitácora del 12-10 (H8) | A |
| L12 | Digital Bible Library (Sociedades Bíblicas Unidas): licencias negociadas texto por texto con cada titular, solo para «ministerios calificados». Acepta organizaciones con distintos modelos (donaciones, ventas, servicios). | [thedigitalbiblelibrary.org](https://thedigitalbiblelibrary.org/get-involved) | B |
| L13 | Versiones libres en español: RV1909 (dominio público), BES (CC BY 4.0), PDT y VBL (CC BY-SA 4.0; VBL revisión 4, 02-10-2025). | [open-bibles](https://github.com/seven1m/open-bibles), [open.bible](https://open.bible/bibles/spanish-freebible-text-nt/), [ebible.org/spavbl](https://ebible.org/spavbl/copyright.htm) | A / B |
| L14 | Anuncios en Latinoamérica: video recompensado ~USD 2 eCPM en Android; intersticial ~USD 1,9 (Android) y ~3,75 (iOS); banner ~USD 0,10. | Tenjin, MAF, Udonis (2024–2026), según [búsqueda](https://maf.ad/en/blog/mobile-ads-ecpm/) | B |
| L15 | Suscripciones: la app típica convierte ~2% de las instalaciones en pago en 35 días; India y el sudeste asiático, 0,7%; Norteamérica, 2,8%. | RevenueCat 2026, citado por [The Social Outline](https://thesocialoutline.com/blog/download-to-paid-conversion-rate-benchmarks) | B |
| L16 | YouVersion es gratis, sin anuncios ni venta de datos, y la sostiene una iglesia (Life.Church) como misión. | [Premier Christianity](https://www.premierchristianity.com/opinion/we-would-make-millions-if-we-monetised-the-bible-app-heres-why-we-never-will/20447.article) (columna de su fundador) | B |

## 2. Respuestas directas

**«¿Se puede que la gente la descargue y la tenga en el teléfono, para no pagar?»**
- Tenerla sin conexión se puede (L7): guardada con protección y renovada cada 30 días.
- Pero el costo no cambia, porque la licencia se paga **por usuario por mes**, no por descarga ni por pedido.
- Una descarga sin licencia sería una copia ilegal, igual que las que ya descartamos (vías J y K del 12-10).

**«¿Puedo poner menos texto?»**
- Sin permiso escrito se pueden citar hasta 500 versículos (SBA para la RVR1960; Tyndale tiene una regla parecida).
- Alcanza para el versículo del día, versículos para memorizar y citas en lecciones. No alcanza para un lector de Biblia.
- No hay un «paquete chico» más barato: lo que se paga es mostrar la versión completa.

**«¿Es inviable porque no escala?»** (INFERENCIA con el modelo de `economia.yaml`)
- El costo por usuario **baja** a medida que se crece: USD 500 por mes para 25.000 a 100.000 usuarios es entre USD 0,02 y USD 0,005 por usuario por mes.
- El modelo de Senda espera entre USD 0,10 y 0,17 netos por usuario por mes (planes, iglesias y anuncios en los juegos).
- Con una versión de USD 100 a 500 por mes, la licencia pesa:
  - entre 5% y 19% del ingreso neto con 22.000 usuarios;
  - entre 1% y 5% con 60.000.
- El peso solo es alto al principio: con 8.000 usuarios, entre 16% y 64% (aunque en ese tramo el precio es menor).
- **Conclusión: la licencia no es lo que hace inviable el negocio.** El riesgo real está en otro lado:
  1. que la monetización llegue a esos números (todavía es una ESTIMACIÓN);
  2. que **lo que más quiere la gente (RVR1960 y NVI) no se puede comprar hoy para una app comercial a ningún precio** (L2).

## 3. Las alternativas

| # | Camino | Versiones dentro de Senda | Costo de licencias | Ingresos posibles | Riesgo | Veredicto |
|---|---|---|---|---|---|---|
| A | **Libres + «Abrir en YouVersion»** (lo de hoy) | RV1909, NBV, PDT, BES (+ VBL si la aprueban los revisores); RVR1960, NVI y NTV en un toque dentro de Senda, servidas por Bible.com | 0 | Todos (planes, iglesias, anuncios en juegos) | Bajo; las versiones preferidas no quedan «dentro» | **Para el lanzamiento** |
| B | **A + NTV por API.Bible**, cuando los números lo justifiquen | + NTV completa, sin conexión | Pro 29 + NTV según usuarios (a confirmar en el checkout) | Todos | Bajo | **Segundo paso, con regla de corte** (§4) |
| C | A + grupo Lockman (LBLA/NBLA) | + LBLA y NBLA | ~500 por mes con 25k–100k (lo que vio el fundador) | Todos | Medio: versiones menos leídas que la NVI y la RVR1960 | Más adelante, si la piden |
| D | **Senda sin ingresos** (donaciones): API.Bible Pro no comercial + YouVersion Platform | NTV, LBLA y NBLA por USD 29 en total; RVR1960 y NVI **solo si** sus editores las habilitaron en Platform (no se puede saber sin registrarse) | 29 | Solo donaciones (estimación: USD 0,005–0,02 por usuario por mes, de 10 a 30 veces menos que A) | Alto para el holding: deja de ser un negocio | Solo si Senda pasa a ser un ministerio |
| E | Las versiones con licencia como beneficio de Max | NTV para quien paga | Crece con los que pagan, **si** API.Bible cuenta solo a quien la abre (L6) | Todos | Medio: «pagar por la Biblia» choca con la promesa de Senda | No recomendado |
| F | Dos apps: «Senda Biblia» sin ingresos + «Senda» con juegos y planes | En la de Biblia, todas las de D | 29 | Los de A en la segunda app | Alto: parte la experiencia en dos | No recomendado |
| G | **Edición propia: RV1909 con ortografía actual** | Una Reina-Valera que se lee como de hoy (fue, dio, vio; «a» y «o» sin tilde), legal y gratis | 0 (trabajo de Claude) | Todos | Bajo; revisar el uso del nombre «Reina-Valera» antes de publicar | **Hacer** |
| H | **Licencia de ministerio** de la SBA o la ABS para la RVR1960 | RVR1960 completa | A negociar (puede ser 0) | Todos (si la aceptan con anuncios en los juegos) | Nulo: es pedir | **Mandar ya el pedido a la SBA**; recordatorio a la ABS el 19-10 |
| I | Fundación o asociación civil para entrar a la DBL | Las que cada titular acepte | A negociar | Limitados (sin fines de lucro) | Cambia de quién es Senda | No por ahora |
| J | Copias de la RVR1960 de sitios o archivos no oficiales | — | — | — | Alto: pueden bajar la app entera | **Descartada** |

## 4. Recomendación (para decidir)

1. **No sacar los anuncios ni las suscripciones.**
   - Sin ingresos, Senda gana versiones (D) pero pierde de 10 a 30 veces sus ingresos posibles, y deja de ser un negocio del holding.
   - Las reglas que ya tiene Senda bastan para cuidar la Biblia: nunca hay anuncios en la Biblia ni en la Travesía, y la Biblia nunca se cobra.
2. **Lanzar con el camino A** (costo 0) y hacer el **G**: una RV1909 con ortografía actual, para que la Reina-Valera libre se lea fluida.
3. **Pedir la RVR1960 como ministerio (H).**
   - El pedido a la SBA está listo; hay que mandarlo.
   - Si la ABS no responde, el recordatorio va el 19-10.
4. **Escribirle a API.Bible antes de pagar nada** (borrador listo, `oportunidades/proyectos/senda/borradores/2026-10-apibible-consultas.md`):
   - ¿cuentan todos los usuarios de Senda o solo los que abren la NTV?
   - ¿cuánto cuesta la NTV en cada tramo?
   - ¿se puede leer la NTV en voz alta con la voz del teléfono?
   - ¿alcanza con guardarla cifrada y renovarla cada 30 días para tenerla sin conexión?
5. **Regla para sumar la NTV (camino B).** Se suma cuando se cumplen las tres:
   - el costo total de licencias es como mucho el 10% del ingreso neto medido en los dos últimos meses;
   - Senda tiene al menos 5.000 usuarios por mes;
   - la NTV es la versión más pedida (en el selector o en «Abrir en YouVersion»).
   Lockman (C) se evalúa recién con más de 25.000 usuarios y si la piden.

## 5. Lo que todavía no sabemos y cómo saberlo

| Dato | Cómo |
|---|---|
| Precio de la NTV en cada tramo de usuarios | El fundador lo ve en el checkout de API.Bible (Plan → Additional Bibles) o lo responde soporte |
| Si cuentan solo los usuarios que leen la NTV | Consulta por escrito a support@api.bible |
| Qué versiones en español habilitó cada editor en YouVersion Platform | Solo registrando una app no comercial (no aplica mientras Senda tenga ingresos) |
| Si Biblica licencia la NVI para una app comercial fuera de API.Bible | Después del lanzamiento y con empresa constituida (bitácora del 06-10) |
| Uso de la marca «Reina-Valera» en una edición propia de la 1909 | Búsqueda de marcas (INPI y Estados Unidos) antes de publicar con ese nombre |
