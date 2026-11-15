# Senda en la Unión Europea, Reino Unido y Suiza desde el 18-12-2026: todo lo que hay que hacer (14-11-2026)

Pedido del fundador (14-11-2026): que Senda salga desde el primer día también en la UE (antes: 01-09-2027, DEC-2026-11-07-6), y
evaluar Reino Unido y Suiza: «recopilá absolutamente todo lo que haya que hacer para lograrlo, no importa lo que sea, y buscamos
hacerlo». Relevamiento del agente `analista-regulatorio` sobre lo que la app hace hoy (`docs/LEGAL.md`, `docs/TIENDAS.md`,
`docs/CUENTAS.md`, `docs/ANUNCIOS.md`, `contenido/legal.json` de la app) y sobre el chequeo legal del 07-11
(`conocimiento/2026-11-07-senda-chequeo-legal.md`).

**No es asesoramiento legal ni contable.** Lo marcado [abogado] o [contador] lo confirma un profesional (o la sesión de revisión
legal exhaustiva de DEC-2026-11-10-5, con la salvedad de §4). Etiquetas: **HECHO** (fuente y fecha), **ESTIMACIÓN** (con método),
**INFERENCIA** (razonamiento propio), **HIPÓTESIS** (a validar).

**Fuentes que no se pudieron leer el 14-11-2026:** EUR-Lex devolvió páginas vacías (el texto del DSA se leyó en
eu-digital-services-act.com, que lo reproduce artículo por artículo); ofcom.org.uk respondió 403 (lo de Ofcom sale de estudios
jurídicos que citan sus guías); TMview respondió 503 (la búsqueda de marcas en la UE queda pendiente); la lista oficial del Data
Privacy Framework (dataprivacyframework.gov) no mostró participantes; la página de la tasa del ICO no responde si la pagan quienes
están fuera del Reino Unido.

---

## 0. Veredicto

**Sí, se puede salir el 18-12 en la UE, pero conviene hacerlo en pocos países: España, Portugal e Irlanda (Malta opcional).**
(INFERENCIA) Ninguna ley pide un permiso previo para publicar una app. Lo que pesa son obligaciones que corren **desde el primer
usuario europeo**, y dos de ellas las controla la tienda: el estado de comerciante (trader) en la App Store y, si hay anuncios, el
mensaje de consentimiento certificado de AdMob. Todo lo demás es trabajo de Claude (código y textos) más tres contrataciones del
fundador. El costo fijo (representantes, documentos) es el mismo para 1 país que para 27. Lo que encarece abrir más países es
el idioma (información al consumidor en el idioma local) y las leyes nacionales de menores. Por eso conviene empezar donde la app ya
habla el idioma de la gente.

**Lo mínimo indispensable para el 18-12 (siete cosas; si el 08-12 falta alguna, rige la regla de corte de abajo):**

1. **Representantes en la UE contratados y publicados:** RGPD art. 27 y DSA art. 13 (y, con el mismo proveedor si lo ofrece, el
   del Reglamento de contenido terrorista, art. 17). Lo hace el fundador. ESTIMACIÓN: EUR 800 a 1.650 por año.
2. **Estado de comerciante (trader) declarado y verificado**, en App Store Connect (sin eso la app no se distribuye en la UE) y en
   Play Console. Hace falta dirección, teléfono y correo, que quedan **públicos** en la ficha europea.
3. **Consentimiento en el primer arranque en la UE:** estadísticas y anuncios solo si la persona dice que sí (UMP/TCF para AdMob,
   o anuncios apagados en la UE al principio, que es lo recomendado); **consentimiento explícito** al crear la cuenta de Comunidad,
   porque la cuenta y los grupos de una app cristiana revelan la fe (RGPD art. 9); edad mínima por país para Comunidad.
4. **Privacidad y términos en versión UE** (es, pt, en): bases legales, art. 9, representante, transferencias con su mecanismo,
   derechos y autoridad de control, derechos del consumidor y moderación de contenido según el DSA.
5. **Mecanismo del DSA:** formulario para avisar contenido ilegal (abierto también a quien no usa la app), motivación de cada decisión
   de moderación y puntos de contacto publicados.
6. **Evaluación de impacto (DPIA) y registro de actividades de tratamiento**, escritos por Claude y firmados por el fundador.
7. **Contratos de encargado (DPA con cláusulas tipo)** aceptados con Supabase, PostHog, Anthropic, Expo y Google, y la región de
   Supabase confirmada.

**Reino Unido:** también se puede el 18-12 si se suma el representante del Reino Unido (UK GDPR art. 27; ESTIMACIÓN: EUR 340 a 850
por año) y el diseño del Children's Code, que la app ya cumple casi entero. Las evaluaciones de riesgo de la Online Safety Act tienen
**tres meses** desde el lanzamiento para servicios nuevos (HECHO, guía de Ofcom citada por Bristows; ver §5). Recomendación: el
mismo día si el fundador aprueba el costo; si no, enero.

**Suiza:** legalmente es lo más barato (probablemente sin representante; consentimiento de AdMob ya cubierto), pero la gente no habla
los idiomas de la app (alemán, francés, italiano) y en Suiza Google **no** es quien vende (HECHO, Play 7645364): la venta queda a
nombre del desarrollador. **Dejarla para después.**

**Orden de países (INFERENCIA):** 1) **España** (contenido completo en español; edad digital 14); 2) **Portugal** (13; «A grande
história» y la trivia en portugués) e **Irlanda** (16; inglés) en la misma tanda, porque no suman costo fijo; Malta si se quiere
(inglés oficial; edad a verificar); 3) **Reino Unido**; 4) el resto de la UE **solo** con contenido en su idioma; 5) Suiza.

**Regla de corte:** si el 08-12 no están los siete puntos, Latinoamérica sale igual el 18-12 y la UE (con el Reino Unido) pasa al
**15-01-2027**, sin tocar el lanzamiento de Latinoamérica ni la regla de iOS del 05-12 (DEC-2026-11-10-2).

**Costo del primer año (ESTIMACIÓN):** representantes UE EUR 800 a 1.650; con Reino Unido, EUR 1.150 a 2.300 (método: lista de
precios de Prighter leída el 14-11-2026, plan Growth EUR 420 por año y Small EUR 852 por año por producto, más el descuento por
combinar productos, 10 % por producto adicional; otros proveedores publicados: Rep4EU EUR 348 por año, EU Shield EUR 490 por año,
GDPR Local GBP 99 por mes). Marcas (optativas antes del lanzamiento): EUIPO EUR 900 por marca en dos clases, UKIPO GBP 265, IPI
CHF 350 a 450, más honorarios a cotizar. Abogado en la UE: a cotizar (no hay dato publicado que sirva de base). Trabajo de Claude:
ESTIMACIÓN de 3 a 5 sesiones (código y textos de §2, DPIA, registro y evaluaciones del Reino Unido).

---

## 1. Tabla de requisitos

«Bloquea» significa: (T) lo exige la tienda para distribuir; (L) es obligación legal desde el primer usuario, aunque nadie la
controle al publicar; «No» se puede hacer después o no aplica.

### 1.1 Unión Europea: datos personales (RGPD y ePrivacy)

| # | Requisito | Qué dice (etiqueta y fuente) | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| 1 | El RGPD aplica a Senda | INFERENCIA fuerte: art. 3(2)(a), ofrecer servicios a personas en la UE (app en tiendas UE, en sus idiomas, con precios en euros). Senda no tiene establecimiento en la UE | Base de todo | — | — | — |
| 2 | **Representante en la UE (art. 27)** | HECHO: la excepción exige que el tratamiento sea **ocasional**, que no incluya a gran escala datos del art. 9 y que sea de bajo riesgo; el EDPB (Directrices 3/2018, v2.0 del 12-11-2019) entiende «ocasional» como no regular y fuera de la actividad habitual. INFERENCIA: una app abierta todos los días no es ocasional → **obligatorio**. Tiene que estar en un país donde haya usuarios (España o Irlanda) | L | Fundador contrata; Claude prepara los datos y lo publica en la política | EUR 420 a 852 por año (Prighter, 14-11-2026) | 2 a 5 días (INFERENCIA: alta en línea) |
| 3 | **Datos de convicción religiosa (art. 9)** | HECHO: TJUE C-252/21, Meta c. Bundeskartellamt (04-07-2023): los datos de uso de sitios y apps que pueden revelar una categoría sensible son sensibles aunque el usuario solo los visite; si un conjunto mezclado tiene un dato sensible, se trata entero como sensible; visitar no es «hacer público manifiestamente». INFERENCIA: la cuenta de Comunidad (alias en una app cristiana, grupos de iglesia con rol, eventos de iglesia) y las estadísticas de uso con identificador revelan la fe. La excepción del art. 9(2)(d) es para fundaciones o asociaciones religiosas sin fines de lucro y sobre sus miembros: Senda (persona física con anuncios) no encaja. Queda el **consentimiento explícito** del art. 9(2)(a) [abogado] | L | Claude: pantalla y registro del consentimiento; abogado: texto | — | 1 día de Claude |
| 4 | **Edad de consentimiento digital (art. 8)** | HECHO: cada país fija entre 13 y 16. España 14 (LOPDGDD art. 7; el proyecto que la subía a 16 caducó, Osborne Clarke 27-10-2026); Portugal 13 (Lei 58/2019 art. 16); Irlanda 16 (tabla secundaria, verificar en la Data Protection Act 2018); Malta 13 (INFERENCIA, verificar); Francia 15, Alemania 16, Países Bajos 16, Austria 14 (tabla secundaria). Por debajo, consiente quien tiene la responsabilidad parental | L, para Comunidad, estadísticas y anuncios | Claude: tabla por país con 16 por defecto | — | Medio día |
| 5 | **DPIA (art. 35)** | INFERENCIA: datos sensibles más menores (dos criterios de las directrices del EDPB sobre DPIA) → obligatoria **antes** de tratar | L | Claude redacta; el fundador firma | — | 1 sesión |
| 6 | **Registro de actividades (art. 30)** | HECHO: la excepción para menos de 250 empleados no vale si el tratamiento no es ocasional o incluye datos del art. 9 (art. 30(5)) | L | Claude | — | Junto con la DPIA |
| 7 | **Transferencias a EE. UU. (cap. V)** | HECHO: el Data Privacy Framework sigue vigente (el Tribunal General desestimó Latombe, T-553/23, el 03-09-2025; apelación C-703/25 P pendiente). No se pudo confirmar en la lista oficial quién está certificado; PostHog y Anthropic no lo muestran en sus páginas. HECHO: el DPA de Supabase trae las cláusulas tipo 2021/914 (importador: Supabase Pte. Ltd., Singapur). INFERENCIA: usar las **cláusulas tipo de cada DPA** y no depender del DPF. **La frase actual «al crear tu cuenta aceptas que tus datos se guarden allí» no sirve en la UE**: el consentimiento del art. 49 es una excepción para casos puntuales | L | Fundador acepta los DPA; Claude cambia el texto | Gratis | 1 hora del fundador |
| 8 | **Política de privacidad UE (arts. 12 a 14)** | INFERENCIA, sobre la versión 1.1 de `contenido/legal.json`: faltan bases legales por finalidad, art. 9, representante, mecanismo de transferencia, derecho a reclamar ante la autoridad (AEPD, CNPD, DPC) y retirar el consentimiento | L | Claude | — | 1 sesión, tres idiomas |
| 9 | Derechos (arts. 15 a 22) | INFERENCIA: el borrado ya está; falta descargar los datos (portabilidad) y un canal con respuesta en un mes | No, si al inicio el correo responde a mano | Claude | — | Medio día |
| 10 | Brechas (arts. 33 y 34) | INFERENCIA: sin establecimiento en la UE no hay ventanilla única: se avisa a cada autoridad afectada en 72 h | No | Claude escribe el procedimiento | — | — |
| 11 | Delegado de protección de datos (art. 37) | INFERENCIA: hace falta si la actividad principal es tratar datos del art. 9 **a gran escala**; al inicio no. Revisar al crecer | No | — | — | — |
| 12 | **ePrivacy art. 5(3)** (consentimiento para guardar o leer cosas en el teléfono) | HECHO: las Directrices 2/2023 del EDPB (v2, 07-10-2024) lo extienden más allá de las cookies. INFERENCIA: el identificador de PostHog y el de publicidad necesitan consentimiento; la sesión de Supabase y el código de avisos (pedidos por la persona) no. La ley local: LSSI art. 22.2 en España, Lei 41/2004 en Portugal | L | Claude: estadísticas apagadas de fábrica en la UE | — | Medio día |
| 13 | **CMP certificado para AdMob (TCF)** | HECHO (AdMob 13554116, leído el 14-11-2026): en el EEE y el Reino Unido desde el 16-01-2024 y en Suiza desde el 31-07-2024; sin CMP certificado, solo anuncios no personalizados o «limitados»; quien usa UMP marca con TFUA a los menores de la edad de consentimiento. UMP es el CMP gratuito de Google | T, si hay anuncios en la UE | Fundador: mensaje RGPD en AdMob; Claude: UMP y opciones de privacidad | Gratis | 1 hora + medio día |

### 1.2 Unión Europea: plataformas (DSA y contenido terrorista)

| # | Requisito | Qué dice | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| 14 | Qué es Senda para el DSA | INFERENCIA: es un **servicio de alojamiento** (guarda lo que suben los usuarios) y probablemente una **plataforma en línea** (difunde al público alias, perfiles que se buscan, torneos abiertos). INFERENCIA: es **microempresa** (menos de 10 personas y menos de EUR 2 millones; la Recomendación 2003/361 incluye a los autónomos) | — | — | — | — |
| 15 | **Representante legal (art. 13)** | HECHO: quien no tiene establecimiento en la UE designa por escrito un representante en un país donde opera; **puede ser responsable** por los incumplimientos; se notifican nombre, dirección, correo y teléfono al Coordinador de Servicios Digitales de ese país y se publican. **No hay excepción por tamaño** | L | Fundador contrata | Prighter publica EUR 852 por año (Small), con «contactar a ventas» | 2 a 5 días |
| 16 | **Puntos de contacto (arts. 11 y 12)** | HECHO (art. 12): un punto único para usuarios, electrónico, que no dependa solo de herramientas automáticas, publicado y al día. Art. 11: otro para autoridades, con los idiomas en que se atiende | L | Claude: página web; fundador: el correo | — | Horas |
| 17 | **Términos con la moderación (art. 14)** | INFERENCIA, sobre el texto del art. 14: los términos dicen qué se modera, cómo, con qué herramientas y cómo reclamar, en lenguaje claro | L | Claude | — | Junto con el n.º 8 |
| 18 | **Aviso de contenido ilegal (art. 16)** | HECHO: cualquier persona o entidad (no solo usuarios) avisa por vía electrónica; el formulario pide explicación, ubicación exacta, nombre y correo (salvo abuso sexual infantil) y declaración de buena fe; acuse de recibo y decisión con las vías de reclamo | L | Claude: formulario web e in-app; fundador: atender la cola | — | 1 día |
| 19 | **Motivación (art. 17)** | INFERENCIA, sobre el texto del art. 17: cada retiro de contenido o suspensión de cuenta se explica al afectado (hechos, norma o regla, si fue automático, cómo reclamar) | L | Claude | — | Medio día |
| 20 | Delitos que amenazan la vida (art. 18) | INFERENCIA: si aparece una sospecha, avisar a la policía del país; procedimiento escrito | No | Claude | — | — |
| 21 | Informe de transparencia (art. 15) | HECHO: no aplica a micro y pequeñas empresas (art. 15(2)) | No | — | — | — |
| 22 | Sección 3 (arts. 20 a 28: reclamos internos, patrones oscuros, publicidad, **menores art. 28**, prohibición de anuncios con perfil a menores) | HECHO (art. 19): no aplica a micro y pequeñas empresas, salvo el art. 24(3) (dar el número de usuarios si lo pide la autoridad). Las directrices del art. 28 (Comisión, 14-07-2025) son la vara si Senda crece. INFERENCIA: Senda igual las cumple casi enteras (anuncios sin personalizar, menores sin buscador de fábrica) | No | — | — | — |
| 23 | **Estado de comerciante (trader) en las tiendas** (DSA arts. 30 y 31, obligación de la tienda) | HECHO (App Store Connect, leído el 14-11-2026): cada desarrollador declara si es comerciante; una persona física da **dirección o casilla, teléfono y correo**, se verifican (doble factor y un documento vigente con nombre y dirección) y **se publican en la ficha** en los 27 países; quien no es comerciante muestra que no rigen los derechos del consumidor. HECHO: Apple saca de la tienda europea las apps sin estado declarado desde el 17-02-2025 (noticia de Apple Developer). Google Play: declaración en Play Console con fecha límite en febrero de 2027 y publicación desde el 01-03-2027 (solo blogs: verificar en Play Console). INFERENCIA fuerte: con anuncios y suscripciones Senda **es comerciante**; declararse «no comerciante» sería falso | T (Apple, UE) | Fundador | Gratis (o una oficina virtual si no quiere publicar su casa: a cotizar) | Días (verificación del documento) |
| 24 | **Contenido terrorista (Reglamento 2021/784)** | HECHO (fuentes secundarias: policía de Malta, Bundesnetzagentur): quien aloja y difunde al público retira en **1 hora** ante una orden; punto de contacto (art. 15) y **representante legal (art. 17)** si no tiene establecimiento en la UE. INFERENCIA: aplica a lo público de Senda; riesgo práctico bajo | L | Fundador: pedir que el representante del DSA lo cubra; Claude: procedimiento y herramienta de retiro | A cotizar (VeraSafe lo ofrece) | Con el n.º 15 |

### 1.3 Unión Europea: consumo, impuestos, IA, accesibilidad, marca e idioma

| # | Requisito | Qué dice | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| 25 | **Desistimiento y botón de desistimiento** | HECHO (varias fuentes jurídicas): la Directiva 2023/2673 agregó el art. 11 bis a la Directiva 2011/83: desde el **19-06-2026**, en contratos hechos por una interfaz en línea con derecho de desistimiento, una función «desistir del contrato aquí» con confirmación, avisada antes de contratar. HECHO: Google es *merchant of record* como agente del desarrollador en los 27 países y el Reino Unido (Play 7645364). INFERENCIA: el cobro y el reembolso los hace la tienda, pero el pantallazo de planes de Senda es parte de la interfaz: mostrar el desistimiento de 14 días y un enlace a la página de la tienda más un formulario propio [abogado: cómo se pierde el derecho al empezar a usar el plan] | L, antes del **primer cobro** en la UE | Claude | — | Medio día |
| 26 | Información antes de suscribirse; Omnibus | INFERENCIA: precio final con impuestos (lo muestra la tienda), renovación automática, cómo cancelar, prueba gratis si la hay; el ahorro del trimestral, sin exagerar (prácticas desleales). Lo que exigía Argentina (Disp. 954/2025) ya va en esa dirección | L, antes del primer cobro | Claude | — | Junto con el n.º 25 |
| 27 | Términos y consumidor | INFERENCIA: la ley y el juez argentinos no pueden quitarle al consumidor europeo la protección de su país (Roma I art. 6; Bruselas I bis arts. 17 y 18); la Directiva 2019/770 de contenidos digitales aplica también a lo gratis «pagado con datos» (anuncios): conformidad y actualizaciones | L | Claude: anexo UE de los términos [abogado] | — | Junto con el n.º 8 |
| 28 | Talentos y sobres del álbum | INFERENCIA: los Talentos no se venden y los sobres se abren solo con Talentos ganados: no hay azar pagado. Si algún día Premium da Talentos, mostrar el equivalente en dinero (principios de la red CPC sobre monedas de juego, marzo de 2025, no releídos hoy) | No | — | — | — |
| 29 | **IVA** | HECHO: en la UE Google determina, cobra e ingresa el IVA y lo descuenta del pago (paymentscenter 7158952); Apple lo hace en los países del Exhibit B del contrato (verificar la lista vigente). INFERENCIA fuerte: el desarrollador **no se inscribe en la OSS** por ventas en tienda [contador]. AdMob paga Google Irlanda por un servicio entre empresas: sin IVA europeo para Senda (INFERENCIA; en Argentina, Factura E) | No | Contador | — | — |
| 30 | **Ley de IA, art. 50** (preguntas del sermón) | HECHO: el art. 50 rige desde el 02-08-2026; el Reglamento ómnibus 2026/1744 (DO 24-07-2026, en vigor el 27-07-2026) no movió la transparencia; solo dio hasta el 02-12-2026 para el marcado legible por máquina (art. 50(2)) a sistemas que ya estaban en el mercado antes de agosto (fuentes secundarias). INFERENCIA: el generador de preguntas es un sistema de IA que Senda pone en servicio con su nombre sobre el modelo de Anthropic → Senda es **proveedor** de ese sistema: marcar cada salida como generada por IA en un formato legible por máquina (metadato) y avisar de forma visible; la excepción de «asistencia para edición estándar» no encaja (genera texto nuevo). El art. 50(4) (texto de interés público) no aplica [abogado] | L, leve | Claude | — | Medio día |
| 31 | Accesibilidad (Directiva 2019/882) | HECHO: «las microempresas que prestan servicios están exentas» (art. 4(5)) | No | — | — | — |
| 32 | Marca en la UE | HECHO (secundario: ficha de EE. UU. sobre Argentina, 2026): Argentina no está en el Protocolo de Madrid → presentación directa en la EUIPO (EUR 850 una clase + 50 la segunda, Anexo I del Reglamento de la marca de la UE). INFERENCIA: la prioridad del Convenio de París (seis meses desde la presentación en el INPI) permite presentar en la UE hasta seis meses después sin perder la fecha. Riesgo real: que ya exista «SENDA» en las clases 9 o 41 en la UE o en España («senda» es palabra común): **la búsqueda no se pudo hacer hoy (TMview 503)** | No (riesgo de nombre en España) | Fundador con Claude en Chrome: búsqueda en TMview y eSearch | EUR 1.800 de tasas por las dos marcas en dos clases + honorarios | 30 minutos la búsqueda |
| 33 | Sorteos y premios | INFERENCIA: cada país tiene su regla; al inicio, **ningún premio de valor** en la UE, el Reino Unido ni Suiza (torneos solo con puntos y copas); los «10 kits por puntos», solo en Argentina | No | — | — | — |
| 34 | **Idioma** | INFERENCIA: ninguna norma europea obliga a traducir la app, pero varios países exigen su idioma para la información y los contratos con consumidores (por ejemplo, la Ley Toubon en Francia). Español, portugués e inglés cubren España, Portugal, Irlanda y Malta; no Francia, Alemania, Italia, Polonia ni el resto | Decide la lista de países | Fundador elige países; Claude, la ficha en tres idiomas | — | — |
| 35 | Tiendas: lo demás | HECHO (secundario): Apple pide el cuestionario de edad nuevo (13+, 16+, 18+) desde el 31-01-2026. INFERENCIA: Play da la clasificación PEGI con el cuestionario IARC; elegir países en las dos consolas; la Ley de Mercados Digitales (DMA) no aplica a Senda y las opciones europeas de Apple y Google (pagos alternativos) son optativas | T (cuestionario de edad) | Fundador carga; Claude prepara | — | Horas |

### 1.4 Reino Unido

| # | Requisito | Qué dice | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| 36 | **Representante (UK GDPR art. 27)** | INFERENCIA: misma lógica que el n.º 2 (no es tratamiento ocasional) | L | Fundador | EUR 340 a 852 por año (Prighter, con o sin descuento) | 2 a 5 días |
| 37 | Tasa del ICO | Sin confirmar: la página del ICO no dice si la pagan responsables sin establecimiento en el Reino Unido. ESTIMACIÓN: el tramo más bajo ronda GBP 52 por año (cifra de 2025, no releída hoy). Hacer el autodiagnóstico del ICO | No | Fundador | ~GBP 52 si aplica | 15 minutos |
| 38 | Cookies (PECR) | HECHO (secundario): desde el 05-02-2026 la analítica solo estadística puede ir sin consentimiento con opción de salir, bajo condiciones del ICO (Data (Use and Access) Act 2025). INFERENCIA: igual conviene pedir permiso, porque los datos de uso de Senda revelan la fe (UK GDPR art. 9) | L (anuncios); no (analítica estricta) | Claude | — | — |
| 39 | **Children's Code** (código de diseño apropiado para la edad) | HECHO (ICO, leído el 14-11-2026): 15 estándares (interés superior del niño, DPIA, aplicación según la edad, transparencia, uso perjudicial, políticas, **privacidad alta por defecto**, minimización, no compartir, **ubicación apagada**, controles parentales, **perfiles apagados**, sin «empujoncitos», juguetes conectados, herramientas para ejercer derechos). Aplica a servicios que probablemente usen menores de 18 en el Reino Unido. INFERENCIA: Senda (13+) cumple casi todo; falta el ajuste por defecto para 13 a 17 (n.º 15 de §2) | L | Claude | — | Medio día |
| 40 | **Online Safety Act** | HECHO (secundario sobre la ley y Ofcom): aplica a servicios de usuario a usuario con vínculo con el Reino Unido (muchos usuarios de allí, o el Reino Unido como mercado objetivo, o riesgo material), estén donde estén. Obligaciones: evaluación de riesgos de contenido ilegal, evaluación de acceso de niños y, si es probable, evaluación de riesgos para niños; medidas de los códigos (moderación, denuncias, reclamos, términos), registro escrito. Un servicio **nuevo tiene tres meses** desde que empieza para la evaluación. La verificación de edad «altamente efectiva» es para contenido prioritario primario (pornografía, suicidio, autolesión, trastornos alimentarios) que el servicio permita; INFERENCIA: Senda lo prohíbe en sus normas → no la necesita. Multas de hasta GBP 18 millones o 10 % de la facturación mundial (texto de la ley, no releído hoy) | No el día 1 (tres meses) | Claude redacta las tres evaluaciones; el fundador firma como responsable | — | Antes del 18-03-2027 |
| 41 | Suscripciones (DMCC Act 2024) | HECHO (secundario): el régimen de suscripciones entra en enero de 2027 (anuncio del 09-08-2026), con reglamentación todavía pendiente | No; antes del primer cobro en el Reino Unido [abogado] | Claude | — | Enero de 2027 |
| 42 | IVA | HECHO: Google es *merchant of record* también en el Reino Unido (Play 7645364) | No | — | — | — |
| 43 | Marca UKIPO | HECHO (gov.uk vía estudios, desde el 01-04-2026): GBP 205 una clase en línea y GBP 60 cada clase extra. INFERENCIA: pide una dirección para notificaciones en el Reino Unido | No | Fundador | GBP 265 por marca | — |

### 1.5 Suiza

| # | Requisito | Qué dice | ¿Bloquea? | Quién | Costo |
|---|---|---|---|---|---|
| 44 | nLPD (ley de protección de datos, en vigor desde el 01-09-2023) | HECHO (texto del art. 14): representante solo si se cumplen juntas cuatro condiciones (oferta en Suiza, gran escala, regularidad, **alto riesgo**). INFERENCIA: al inicio no. Las opiniones religiosas son datos sensibles; la política dice a qué países van los datos | L (política) | Claude | — |
| 45 | AdMob | HECHO: CMP certificado desde el 31-07-2024 | T, si hay anuncios | Igual que el n.º 13 | — |
| 46 | IVA | HECHO: Google no es *merchant of record* en Suiza (Play 7645364); el extranjero que presta servicios electrónicos se inscribe si su facturación **mundial** llega a CHF 100.000 (ESTV, vía estudios) → no por ahora [contador] | No | Contador | — |
| 47 | Marca IPI | HECHO (IPI vía búsqueda): CHF 450 hasta tres clases (CHF 350 en línea según Chambers 2026); domicilio de notificación en Suiza | No | Fundador | CHF 350 a 450 por marca |

---

## 2. Cambios concretos en la app (para el programador)

Archivos de referencia: `src/util/anuncios.ts`, `src/util/metricas.ts`, `src/util/cuenta.ts`, `src/pantallas/Ajustes.tsx`,
`contenido/legal.json`, `scripts/sitio_web.py`, `web/`, `supabase/migrations/`. Todo texto nuevo con su clave en es, pt y en.

1. **Saber si la persona está en la UE, el Reino Unido o Suiza.** Usar la respuesta de UMP (`AdsConsent.requestInfoUpdate`: si el
   formulario hace falta, la persona está en una región regulada; Google la ubica por IP) y, como respaldo, el país de la tienda o del
   teléfono. Guardar `regionRegulada: 'ue' | 'ru' | 'ch' | null`. Cuando no se sabe, tratar como UE.
2. **Nada arranca antes del consentimiento en esas regiones:** PostHog no se inicializa ni guarda su identificador; AdMob no pide
   anuncios hasta que UMP termina. Guardar el consentimiento con versión y fecha.
3. **Estadísticas apagadas de fábrica** en la UE, el Reino Unido y Suiza, con un «sí» explícito que diga que los datos de uso de una
   app cristiana pueden mostrar la fe. Si no hay sí, tampoco mandar `cliente_id` con las respuestas del juego y los votos del Pulso
   (un identificador fijo es dato personal seudónimo: mandarlas sin él o no mandarlas). PostHog en la región UE, sin GeoIP y sin
   perfiles de persona.
4. **Anuncios:** recomendado para el 18-12 que en la UE, el Reino Unido y Suiza **no haya anuncios** (interruptor remoto `anunciosUE`,
   apagado), hasta que el abogado valide AdMob dentro de una app religiosa (§4, riesgo 1). Si el fundador los quiere desde el día 1:
   UMP con el mensaje RGPD de AdMob (TCF), `requestNonPersonalizedAdsOnly` como hoy, `tagForUnderAgeOfConsent` para quien esté debajo
   de la edad del país y, en Ajustes, «Opciones de privacidad de anuncios» (`showPrivacyOptionsForm`) cuando UMP lo pida.
5. **Edad por país.** Tabla `edadDigital` (ES 14, PT 13, IE 16, MT 13, FR 15, IT 14, AT 14, DE 16, NL 16, RU 13; el resto de la UE
   y lo desconocido, 16). En la bienvenida, si la persona está debajo de la edad de su país: sin Comunidad, sin estadísticas ni
   anuncios, como hoy los menores de 13 (sin flujo de consentimiento de padres al inicio; el mensaje dice por qué).
6. **Consentimiento explícito (art. 9) al crear la cuenta de Comunidad**, en una pantalla aparte después de las normas: casilla sin
   marcar, texto corto («Senda es una app cristiana. Tu alias, tus amigos y tus grupos pueden mostrar tu fe. Aceptás que Senda guarde
   estos datos para que juegues con otros. Lo retirás borrando tu cuenta.»), enlace a la política. Guardar `consentimiento_art9`
   (versión, fecha) en el perfil, con una migración nueva y su prueba en `pruebas/nube`.
7. **Privacidad y términos versión UE/RU/CH** en `contenido/legal.json` (o un bloque `ue`): responsable; representantes UE y RU
   (nombre y dirección); tabla finalidad → base legal (contrato, consentimiento explícito, interés legítimo para seguridad y denuncias);
   destinatarios; transferencias con **cláusulas tipo** (sacar «al crear tu cuenta aceptas…»); plazos; derechos y autoridad (AEPD,
   CNPD, DPC, ICO, FDPIC); edades; IA del sermón; anexo de consumo (desistimiento, ley y jurisdicción del consumidor, conformidad).
   Regenerar con `python3 scripts/sitio_web.py`.
8. **DSA en la web:** página «Contacto y avisos legales» con el punto de contacto para usuarios y para autoridades, los idiomas
   (es, pt, en), los datos del representante y el formulario de aviso de contenido ilegal (abierto a cualquiera; campos: qué es y por
   qué es ilegal, enlace o alias o código del grupo, nombre y correo, declaración de buena fe; acuse automático por correo).
9. **DSA en la app:** «Denunciar» distingue «va contra las normas» de «es ilegal (en mi país)»; el que denuncia recibe la decisión;
   el afectado por un retiro o una suspensión recibe un aviso con el motivo, la regla, si fue automático y cómo reclamar (art. 17);
   la cola de «Senda para todos» guarda fecha y decisión.
10. **Contenido terrorista y urgencias:** en «Senda para todos», retirar cualquier contenido y suspender una cuenta en un toque, y
    un correo de punto de contacto que el fundador lea todos los días.
11. **Descargar mis datos** en Ajustes → Tus datos: un JSON con perfil, amistades, grupos, eventos, torneos y consentimientos.
12. **IA del sermón (art. 50):** cada pregunta generada guarda `origen: 'ia'`, el modelo y la fecha (metadato legible por máquina,
    también en lo que se exporta) y se muestra el aviso «Hecha con IA y revisada por tu líder» al líder al subir y a quien juega.
13. **Planes en la UE:** antes de pagar, precio de la tienda, renovación, cómo cancelar y el derecho de desistimiento de 14 días; en
    Ajustes → Tu plan, «Desistir del contrato aquí» (art. 11 bis) que abre la página de la tienda y un formulario con confirmación.
    Recién cuando se activen los cobros [abogado].
14. **Ficha y cumplimiento en las tiendas:** países (§0), textos en tres idiomas, cuestionario de edad de Apple, PEGI vía IARC,
    etiquetas de privacidad y «Seguridad de los datos» sin cambios si los anuncios están apagados en la UE.
15. **Menores de 18 en la UE y el Reino Unido** (Children's Code y directrices del art. 28 como buena práctica): búsqueda por alias y
    logros públicos apagados de fábrica (ya recomendado el 07-11), ubicación siempre a pedido y sin guardar, sin avisos de noche.
16. **Prueba:** ampliar la vista previa con `?demo=region:ue`, `?demo=region:ru` y `?demo=edad:ie15`, y recorrer bienvenida,
    Comunidad, Ajustes y planes antes del APK.

---

## 3. Tareas del fundador, en orden

| # | Qué | Cuándo | Costo |
|---|---|---|---|
| 1 | **Decidir** (lo prepara Claude como DEC): países de la primera tanda (recomendado España, Portugal e Irlanda; Malta y el Reino Unido optativos), anuncios apagados en la UE al inicio y el presupuesto de representantes | Esta semana | — |
| 2 | Tener activo el **monotributo** (la constancia sirve de documento con nombre y domicilio para Apple) y decidir **qué dirección se publica** en la ficha europea: la del documento o una oficina virtual con comprobante [contador] | Antes del 25-11 | Oficina virtual: a cotizar |
| 3 | **Estado de comerciante en Apple:** App Store Connect → Business → Agreements → Compliance → Digital Services Act (cuenta) y App Information → Digital Services Act (app); verificar teléfono, correo y documento | Antes del 28-11 | Gratis |
| 4 | **Estado de comerciante en Google Play:** Play Console → detalles de la cuenta → declarar estado; luego, contenido de la app | Con el n.º 3 | Gratis |
| 5 | **Contratar representantes** UE (RGPD art. 27 y DSA art. 13, pidiendo que cubra el art. 17 del reglamento de contenido terrorista), en España o Irlanda; y el del Reino Unido si sale el 18-12. Pasar a Claude nombre, dirección, correo y teléfono | Antes del 01-12 | ESTIMACIÓN: EUR 800 a 1.650 por año (UE); EUR 1.150 a 2.300 con el Reino Unido |
| 6 | Notificar el representante del DSA al Coordinador de Servicios Digitales de su país (muchos proveedores lo hacen; si no, Claude prepara el correo) | Con el n.º 5 | — |
| 7 | **Aceptar los DPA:** Supabase (y confirmar la región del proyecto), PostHog (generador de DPA), Anthropic (incluido en los términos comerciales: confirmar), Expo, Google (Firebase y AdMob). Claude deja los enlaces y un prompt para Claude en Chrome | Antes del 01-12 | Gratis |
| 8 | **AdMob:** crear el mensaje RGPD en «Privacidad y mensajes» aunque los anuncios arranquen apagados (UMP también sirve para saber la región) | Antes del 01-12 | Gratis |
| 9 | Firmar la **DPIA** y el **registro de actividades** que redacta Claude | Antes del 05-12 | — |
| 10 | **Buscar «SENDA» y «LANY»** en TMview y eSearch (clases 9 y 41) con Claude en Chrome; si aparece «SENDA» en España, decidir antes de abrir España | Antes del 05-12 | Gratis |
| 11 | **Abogado en la UE** (España) para el consentimiento del art. 9, los menores y los textos de suscripción [abogado]: recomendado aunque la revisión general la haga Claude (DEC-2026-11-10-5) | Cotizar ya; antes del primer cobro | A cotizar |
| 12 | Elegir los países en Play Console y App Store Connect y cargar la ficha en tres idiomas | La semana del 07-12 | — |
| 13 | **Regla de corte:** el 08-12, Claude revisa los siete puntos de §0 y, si falta alguno, la UE pasa al 15-01-2027 | 08-12 | — |
| 14 | Reino Unido: autodiagnóstico de la tasa del ICO; firmar las tres evaluaciones de la Online Safety Act | Antes del 18-03-2027 | ~GBP 52 si aplica |
| 15 | Marcas en la UE, el Reino Unido y Suiza dentro de los seis meses de prioridad desde la presentación en el INPI | Antes de que venza la prioridad | EUR 1.800 + GBP 530 + CHF 700 a 900, más honorarios |
| 16 | Contador: IVA (UE, Suiza) y cobros de AdMob y de las tiendas desde Europa [contador] | Antes del primer cobro | — |

---

## 4. Riesgos residuales

1. **AdMob en una app religiosa** (INFERENCIA): aun sin personalizar, cada pedido de anuncio le dice a Google que ese teléfono usa una
   app cristiana. Con el razonamiento de C-252/21 eso podría ser un dato del art. 9. Por eso la recomendación es arrancar sin
   anuncios en la UE y preguntarle al abogado. Probabilidad de reclamo: baja; daño: alto (multa y orden de cesar).
2. **Menores de 13 a 17:** la autodeclaración de edad es débil (las directrices del art. 28 la consideran insuficiente cuando hace falta
   verificar), pero Senda no tiene contenido para adultos y es microempresa. Vigilar: Francia (prohibición de redes para menores de
   15 aprobada en 2026), Grecia (desde el 01-01-2027), la propuesta europea «Kids Act» (septiembre de 2026, a confirmar) y el
   proyecto español a 16 (caducó; puede volver). Si una ley trata a los grupos como «red social», Comunidad podría quedar cerrada
   para menores de 15 o 16 en ese país.
3. **DPF:** si el Tribunal de Justicia lo anula en C-703/25 P, los proveedores certificados quedan sin base: por eso se usan las
   cláusulas tipo de cada DPA (más una evaluación de transferencia; Supabase publica la suya).
4. **Exposición personal del fundador:** su dirección y su teléfono quedan públicos en la ficha europea de las dos tiendas.
5. **Ejecución a distancia:** la probabilidad de que una autoridad europea persiga a una app chica de Argentina es baja (INFERENCIA),
   pero el representante del DSA puede ser responsable y va a exigir que todo esté en orden; y un usuario puede reclamar ante su
   autoridad sin costo.
6. **Nombre «SENDA» en España:** sin la búsqueda hecha, hay riesgo de que exista una marca anterior en las clases 9 o 41.
7. **Carga de trabajo en 34 días:** sumar la UE compite con la prueba cerrada de Android, iOS y Juntos. La regla de corte del 08-12
   protege a Latinoamérica.
8. **Desistimiento y tiendas:** cómo convive el art. 11 bis con las compras dentro de la app (la tienda cobra, Senda es el comerciante
   del servicio) no tiene una respuesta oficial que se haya podido leer: queda para el abogado antes del primer cobro.
9. **Online Safety Act:** Ofcom tiene un grupo de trabajo para servicios «chicos pero riesgosos»; Senda no lo parece, pero las tres
   evaluaciones tienen que estar firmadas dentro de los tres meses.
10. **Lo que no se pudo leer hoy** (EUR-Lex, Ofcom, TMview, lista DPF): todo dato que decida plata se vuelve a verificar en la
    fuente primaria antes de pagar.

---

## 5. Fuentes (consultadas el 14-11-2026)

- DSA (Reglamento 2022/2065), arts. 12, 13, 15, 16 y 19, texto en eu-digital-services-act.com (EUR-Lex devolvió página vacía):
  https://www.eu-digital-services-act.com/Digital_Services_Act_Article_13.html (y _12, _15, _16, _19).
- Directrices del art. 28 del DSA (Comisión, 14-07-2025): https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-protection-minors
  (vía Covington, Hunton).
- Apple, requisitos de comerciante del DSA: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements;
  noticia «Apps without trader status will be removed…»: https://developer.apple.com/news/?id=einwn76m.
- Google Play, estado de comerciante (solo fuentes secundarias, verificar en Play Console): https://www.fdaytalk.com/google-play-trader-status/,
  https://www.testerscommunity.com/blog/google-play-trader-status-declaration.
- Google Play, *merchant of record*: https://support.google.com/googleplay/android-developer/answer/7645364; IVA en la UE:
  https://support.google.com/paymentscenter/answer/7158952.
- AdMob, CMP certificado en el EEE, el Reino Unido y Suiza: https://support.google.com/admob/answer/13554116.
- EDPB, Directrices 3/2018 (ámbito territorial, art. 27): https://edpb.europa.eu/sites/edpb/files/files/file1/edpb_guidelines_3_2018_territorial_scope_en.pdf
  (vía DataRep y gdpr-text.com); Directrices 2/2023 v2 (art. 5(3) ePrivacy, 07-10-2024):
  https://edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf.
- TJUE C-252/21, Meta c. Bundeskartellamt (04-07-2023): https://fra.europa.eu/en/node/44533 (vía DLA Piper, Steptoe, Thomas Helbing).
- DPF: Latombe, T-553/23 (03-09-2025) y apelación C-703/25 P: https://eur-lex.europa.eu/eli/C/2025/6610/oj/eng; WilmerHale (01-12-2025).
- Supabase DPA y transferencias: https://supabase.com/legal/dpa, https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq.
- PostHog GDPR y DPA: https://posthog.com/docs/privacy/gdpr-compliance, https://posthog.com/dpa.
- Edad digital: España (Osborne Clarke, 27-10-2026): https://www.osborneclarke.com/es/insights/la-eu-kids-act-propone-nuevas-normas-de-proteccion-de-menores-en-linea-que-anticipan;
  Portugal, Lei 58/2019 art. 16 (Legiscope, PLMJ); tabla general: https://childreninthedigitalworld.twobirds.com/home/eu.
- Directiva 2023/2673, botón de desistimiento desde el 19-06-2026: https://www.iubenda.com/en/blog/the-new-online-withdrawal-function-what-eu-directive-2023-2673-means-for-your-business/,
  https://www.jdsupra.com/legalnews/eu-consumer-protection-law-update-new-9377759/.
- Ley de IA, art. 50 y ómnibus: https://artificialintelligenceact.eu/transparency-rules-article-50/; Reglamento 2026/1744 (DO 24-07-2026):
  https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act, https://www.lewissilkin.com/insights/2026/07/27/the-digital-omnibus-on-ai-enters-into-force-today.
- Accesibilidad, Directiva 2019/882 art. 4(5): https://www.legislation.gov.uk/eudr/2019/882/chapter/II/adopted/data.html.
- Contenido terrorista (Reglamento 2021/784): https://pulizija.gov.mt/en/terrorist-content-online/, https://lawplayer.com/eu/act/32021R0784.
- Precios de representantes: https://prighter.com/pricing.md; otros proveedores vía búsqueda (Rep4EU, EU Shield, GDPR Local).
- Marcas: EUIPO, Anexo I del Reglamento de la marca de la UE (https://www.ippt.eu/legal-texts/eu-trade-mark-regulation-2017/annex-i);
  UKIPO, tasas desde el 01-04-2026 (https://www.dyoung.com/en/knowledgebank/articles/ukipo-fees-apr2026); IPI:
  https://ipi.ch/en/intellectual-property/guide/trade-marks/costs; Argentina fuera de Madrid:
  https://www.stopfakes.gov/assets/uploads/ip-snapshot-argentina2026.pdf.
- Reino Unido: Children's Code, estándares: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/code-standards/;
  Online Safety Act, ámbito: https://www.bristows.com/content-hub/the-safety-net/scope-of-act/ y https://www.legislation.gov.uk/ukpga/2023/50;
  plazos y tres meses para servicios nuevos: https://cms.law/en/gbr/legal-updates/online-safety-act-ofcom-launches-enforcement-programme-for-illegal-harms-risk-assessments,
  https://www.mishcon.com/news/online-safety-act-deadline-approaches-for-childrens-risk-assessments; DUAA y cookies:
  https://cm.twobirds.com/en/insights/2026/uk/uk-gdpr-uk-privacy-reform-is-finally-going-live--what-does-your-business-need-to-do-now;
  suscripciones DMCC en enero de 2027: https://www.stephensonharwood.com/insights/subscription-reforms-brought-forward-to-january-2027-is-your-business-ready/.
- Suiza: nLPD art. 14: https://justement.ch/en/doc/act/ch/235_1/chap_2/sec_2/art_14; IVA de extranjeros (ESTV):
  https://www.estv.admin.ch/dam/estv/en/dokumente/mwst/publikationen/mwst-publ-foreign-businesses-en.pdf.download.pdf/mwst-publ-foreign-businesses-en.pdf.
- Menores en otros países (Francia, Grecia, Dinamarca, Kids Act): https://euronews.com/my-europe/2026/09/22/eu-kids-act-the-eus-plan-to-make-the-internet-safer-for-kids
  y notas de julio de 2026 (a confirmar en fuente oficial).
