# Senda en Brasil desde el 18-12-2026: todo lo que hay que hacer (14-11-2026)

Pedido del fundador: «recopilá absolutamente todo lo que haya que hacer para lograrlo [salir en Brasil el 18-12], no importa lo que
sea, y buscamos hacerlo». Relevamiento del agente `analista-regulatorio`. **No es asesoramiento legal ni contable**: lo marcado
[abogado BR] lo confirma un abogado brasileño; [contador] un contador. Etiquetas: **HECHO** (fuente y fecha), **ESTIMACIÓN** (con
método), **INFERENCIA** (razonamiento propio), **HIPÓTESIS** (a validar).

**Fuentes que no se pudieron leer:** planalto.gov.br (todas las URL redirigen a `gov.br/planalto`, 302): la Lei 15.211 se leyó en la
publicación original de la Cámara de Diputados (`camara.leg.br/legin`) y el Decreto 12.880 en una transcripción secundaria
(higa.me), contrastada con el FAQ oficial de ANPD/MJSP/Secom (PDF, 30-07-2026) y la guía de alcance de la ANPD (PDF, octubre de
2026), que sí se leyeron. Mattos Filho y legjur devolvieron 403. La búsqueda de antecedentes de marca en el INPI de Brasil
(busca.inpi.gov.br) necesita sesión: no se pudo hacer desde acá.

---

## 0. Veredicto

**Sí, se puede salir en Brasil el 18-12, pero no con la app tal cual: hace falta una «versión Brasil» y un representante legal en
Brasil.** (INFERENCIA, apoyada en los HECHOS de §1.)

- Senda está alcanzada por el ECA Digital sin discusión: dice ser para mayores de 13 (apunta a adolescentes) y los juegos
  electrónicos se presumen «de acceso probable» por menores (guía de la ANPD, oct-2026, p. 31). Le aplica también la LGPD (art. 3) y
  el Marco Civil (art. 11).
- Las tiendas ya ejecutan la parte de ellas en Brasil: Google entrega la señal de edad desde el 17-03-2026 y Apple bloquea las apps
  18+ a menores desde el 24-02-2026. Nada de eso impide publicar Senda; **lo que la ley pide al desarrollador hay que hacerlo en el
  código y en papeles**.
- **El cuello de botella no es el código** (ESTIMACIÓN: 3 a 4 sesiones de Claude, por comparación con la prueba 49, que hizo
  borrado de cuenta, denuncias y frenos por edad en una sesión). **Es el representante legal en Brasil** (Lei 15.211 art. 40; el STF
  pide además que sea persona jurídica con sede en Brasil): hay que contratarlo y darle un poder apostillado en tres semanas.
- **Lo que no llega al 18-12 y conviene dejar para el primer trimestre de 2027:** vincular la cuenta del menor con un responsable
  (para abrirle lo social con permiso), cobrar suscripciones en Brasil y cualquier premio con valor.

**Lo mínimo indispensable para el 18-12** (todo lo demás de §1 puede seguir después):

1. **Representante legal en Brasil** contratado (persona jurídica brasileña), con poder firmado y apostillado. Lo hace el fundador.
2. **Señal de edad de las tiendas integrada** (Play Age Signals y Declared Age Range de Apple, con `expo-age-range`) y **modo
   protegido para Brasil**: a menores de 18 y a quien no tenga edad conocida, nada de interacción con otros (duelos, grupos,
   torneos, salas, eventos, buscador por alias, perfil público), configuración más protectora por defecto y controles para
   responsables. Lo hace Claude.
3. **Privacidad y términos en portugués** según la LGPD y el CDC (incluido el consentimiento destacado para lo que puede revelar
   convicción religiosa), con el contacto del encargado de datos y el canal de denuncias en portugués. Claude los escribe; un abogado
   brasileño los lee.
4. **Clasificación indicativa** actualizada por IARC para Brasil y mostrada dentro de la app y en los términos.
5. **Anuncios**: siguen sin personalizar; además, en Brasil, sin anuncios para menores de 16 y apuestas bloqueadas en AdMob.
6. **Registro en el Sistema Nidus de la Policía Federal** (canal obligatorio para reportar explotación infantil) dentro del plazo.
7. **Ficha de la tienda en portugués**, honesta sobre lo que todavía está en español.

Y en Brasil, al lanzar: **gratis con anuncios, sin suscripciones y sin premios** (la app ya lanza así en todos lados: SUSCRIPCIONES.md
§6).

**Regla de corte (propuesta):** si el **05-12** (la misma fecha de corte del iPhone) no está firmado el representante o la versión
Brasil no pasó la prueba en el emulador con señales de edad simuladas, Brasil vuelve al **01-03-2027** (DEC-2026-11-07-6) sin
atrasar el resto del lanzamiento.

**El costo de producto que hay que mirar de frente** (INFERENCIA): el público natural de Senda (13 a 17) entra en Brasil **sin la
parte social** hasta que exista el vínculo con un responsable. La Biblia, la Travesía, la trivia y los juegos individuales
funcionan completos.

---

## 1. Tabla de requisitos

Columna **Bloquea**: «Ley» = obligación vigente desde el primer día en Brasil; «Tienda» = sin esto la tienda no publica; «Cobro»
= solo si se vende en Brasil; «No» = conviene, pero no frena.

| # | Requisito (norma y artículo) | Qué dice y qué significa para Senda | Bloquea | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| 1 | **Alcance del ECA Digital** (Lei 15.211/2025, art. 1 y p. ún.; Decreto 12.880/2026; guía ANPD oct-2026) | HECHO: la ley se aplica a todo producto «direcionado a crianças e a adolescentes no País ou de acesso provável por eles», esté donde esté el proveedor (art. 1). Los juegos electrónicos tienen presunción legal de acceso probable (guía, p. 31). «A ausência de pagamento direto... não afasta a incidência» (guía, p. 14). Niño: menos de 12; adolescente: 12 a 18. INFERENCIA: Senda está alcanzada de lleno | — | — | — | Vigente desde el 17-03-2026 |
| 2 | **Representante legal en Brasil** (Lei 15.211 art. 40; FAQ ANPD/MJSP 30-07-2026; STF, Temas 987/533, 26-06-2025) | HECHO: el art. 40 obliga a «manter representante legal no País» con poder para recibir citaciones y notificaciones judiciales y administrativas y responder ante las autoridades. El FAQ oficial: «Toda empresa de serviços digitais que opere no Brasil deve manter representante legal no País». HECHO (fuente secundaria, Barbieri Advogados): la tesis del STF sobre el art. 19 del Marco Civil pide «sede e representante no país, necessariamente pessoa jurídica aqui sediada». INFERENCIA: un representante persona jurídica (estudio jurídico o empresa de representación) cubre las dos cosas | **Ley** | Fundador: elegir, contratar, firmar un poder ante escribano argentino con apostilla (Argentina y Brasil son parte de la Convención de La Haya) [abogado BR: si pide traducción jurada] | **Sin precio público** (dos búsquedas el 14-11): pedir tres cotizaciones. Es costo **recurrente** | Firmado antes del 05-12 |
| 3 | **Recibir la señal de edad de las tiendas** (Lei 15.211 arts. 12 y 14; Decreto 12.880 arts. 25-26) | HECHO: los proveedores «devem receber» la señal de la tienda o del sistema y adaptar la experiencia, y además tener mecanismos propios (art. 14). Si la señal y lo que sabe la app no coinciden, gana lo más protector (Decreto art. 25 §4). La señal no puede traer fecha de nacimiento ni identidad (art. 25 §1). HECHO (developer.android.com, leído 14-11): Play Age Signals entrega edad en Brasil desde el **17-03-2026**; en Brasil el estado solo puede ser `DECLARED`, `UNKNOWN` o `null`; desde la versión 0.0.4 (julio de 2026) hay que pedir permiso con `requestAgeSignalsAccess()`. HECHO (developer.apple.com, 24-02-2026): Declared Age Range da la categoría de edad en Brasil si la persona o su responsable aceptan compartirla | **Ley** | Claude: integrar `expo-age-range` (Expo SDK 57). Fundador: en Play Console → «Age signals» → edades mínimas 13, 16 y 18; en Apple, activar la capacidad `com.apple.developer.declared-age-range` | USD 0 | 1 sesión |
| 4 | **Interacción en juegos, limitada por defecto** (Lei 15.211 art. 21; Lei 14.852/2024 art. 16) | HECHO (texto de la Cámara): los juegos que permiten interacción entre usuarios (mensajes, audio, video, intercambio de contenido) aplican las salvaguardas del art. 16 de la Lei 14.852 y «por padrão» limitan esas funciones para asegurar el consentimiento de los responsables. HECHO (FAQ oficial): exige protección contra contactos perjudiciales, moderación y supervisión parental. INFERENCIA: en Brasil, para menores de 18 (y para edad desconocida), Comunidad apagada hasta que haya consentimiento de un responsable | **Ley** | Claude | USD 0 | Con el #3 |
| 5 | **Vincular cuentas de menores de 16 a un responsable** (Lei 15.211 art. 24) | HECHO: el caput habla de «provedores de produtos ou serviços direcionados a crianças e a adolescentes», pero está en el capítulo «Das redes sociais». El FAQ oficial lo lee para redes sociales («Para usar redes sociais... menores de 16 anos deverão ter contas vinculadas»). La guía de la ANPD define red social como interacción abierta «sem limitações substanciais de visibilidade ou de destinatários» y deja fuera las plataformas cerradas a grupos delimitados (p. 16 y ejemplo 1). INFERENCIA: Senda (Biblia y juegos; amigos por código, grupos por invitación) **no es red social**; con el modo protegido (#4) el punto queda sin efecto al lanzar. Riesgo: el buscador por alias, el rival al azar, los torneos abiertos y las salas de 500 la acercan a «abierta» | No (con #4) | [abogado BR] confirmar | — | — |
| 6 | **Lo más protector por defecto y controles para responsables** (Lei 15.211 arts. 7, 16, 17 y 18; Decreto arts. 10 y 14) | HECHO: configuración más protectora por defecto desde el diseño (art. 7); herramientas fáciles para supervisar, aviso visible cuando están activas, límite de tiempo, limitar comunicación con no autorizados, restringir ubicación (art. 17); gestionar la cuenta, restringir compras, ver con qué adultos habla, métricas de uso, información **en portugués** (art. 18); prohibido el diseño que esconde estos controles (art. 18 §2; Decreto art. 10). Obligaciones moduladas por porte y riesgo (art. 39) | **Ley** (proporcional) | Claude: pantalla «Controles para responsáveis» | USD 0 | 1 sesión |
| 7 | **Evitar el uso compulsivo** (Lei 15.211 art. 8 IV; Decreto art. 9) | HECHO (FAQ oficial): prohibidas las «notificações de urgência fabricadas ("seu amigo está esperando por você!")» y las «recompensas imprevisíveis que estimulam comportamento compulsivo»; el Decreto (art. 9, vía transcripción) nombra las recompensas por tiempo de uso y el exceso de avisos. INFERENCIA: en Senda tocan a la racha, el protector de racha, «Te esperan», los avisos de duelo y la sorpresa del sobre del álbum. Para menores en Brasil: sin avisos de racha en riesgo, tope de avisos, horario de silencio; el «descansar a los 45 minutos» ya existe | **Ley** | Claude | USD 0 | Con el #6 |
| 8 | **Cajas de recompensa** (Lei 15.211 art. 20; Decreto art. 23; NT MJSP 55/2026) | HECHO (FAQ oficial): la caja de recompensa es la función por la que el jugador adquiere, «mediante pagamento», ítems al azar sin saber qué trae; con caja, alcanza ofrecer una versión sin ella o apagarla a quien no probó tener 18. HECHO: la NT 55/2026 (MJSP, 15-10-2026) pidió a la ANPD fiscalizar seis juegos. INFERENCIA: los sobres de Senda (solo con Talentos que no se venden ni se ganan con anuncios, sin repetidas) **no son cajas de recompensa**. Mantener la regla «los Talentos nunca se venden» y responder «no» en IARC y en el cuestionario de Apple (una caja declarada lleva la app a 18+ en Brasil) | No | Claude y fundador (cuestionarios) | — | — |
| 9 | **Publicidad sin perfiles** (Lei 15.211 arts. 22 y 26; Decreto arts. 31-33) | HECHO: prohibido perfilar a menores para publicidad y usar análisis emocional o realidad aumentada para eso; la ANPD fija reglas para que no vean apuestas, alcohol o tabaco (Decreto art. 32). Senda ya pide anuncios sin personalizar para todos (`src/util/anuncios.ts`). INFERENCIA: en Brasil, sin anuncios para menores de 16 (la menor exposición posible; el ingreso es chico) y apuestas bloqueadas en AdMob (en Brasil las «bets» son masivas) | **Ley** | Claude (código); fundador (bloqueos en AdMob) | USD 0 | Con el #3 |
| 10 | **IA generativa** (Decreto 12.880 art. 11) | HECHO (transcripción): hay que avisar que el sistema es sintético, prevenir manipulación y evaluar el riesgo. Senda ya muestra la leyenda y solo deja generar a adultos. INFERENCIA: en Brasil, «adulto» = señal de 18+, no autodeclaración | **Ley** | Claude | USD 0 | Con el #3 |
| 11 | **Clasificación indicativa** (Lei 15.211 art. 8 V; Decreto art. 12 §§2-4; Portaria MJSP 1.048/2025) | HECHO: la clasificación pesa ahora interacción, compras, microtransacciones y cajas (Decreto art. 12 §2); se muestra al entrar (art. 8 V) y los términos la dicen en portugués (Decreto art. 12 §4). HECHO (Play 6223646): ClassInd sale de IARC; puede hacer falta reenviar el cuestionario. HECHO (secundario, LexLegal): publicidad → 12; compras en línea y conversación entre usuarios sin verificar edad → 14; compartir ubicación → 16; cajas → 18. HECHO (Agência Gov, abr-2026): tener controles parentales no baja la clasificación. **ESTIMACIÓN: Senda saldría 12 o 14 en Brasil** (anuncios, y compras cuando existan) | **Tienda** | Fundador: reenviar IARC; Claude: mostrar la clasificación en la bienvenida en portugués, en Ajustes y en los términos | USD 0 | Antes del AAB de producción |
| 12 | **Denuncias, retiro sin orden judicial y reporte a la Policía Federal** (Lei 15.211 arts. 27-29; Portaria MJSP 1.312/2026) | HECHO: retirar y reportar de inmediato el contenido de explotación, abuso, secuestro o captación de menores; retirar con prioridad lo que notifiquen víctimas, Ministerio Público o entidades. HECHO (Agência Gov, 30-09-2026): los reportes van al Centro Nacional de Proteção à Criança e ao Adolescente por el **Sistema Nidus**; fase 1, registro dentro de los 60 días del acto de apertura (previsto «até 29 de outubro»); fase 2, reportes en 12 h (riesgo inminente), 72 h (material nuevo) o 7 días, con IDs, URL, IP y hashes; preservar la evidencia. **ESTIMACIÓN: el registro vence a fines de diciembre** si el acto salió el 29-10 (verificar el acto) | **Ley** | Fundador: registrarse en Nidus. Claude: categoría «exploração de criança» con prioridad máxima, guardado de evidencia, formulario web en portugués también para quien no usa la app (lo pide el STF) | USD 0 | Registro antes de que venza el plazo (verificar) |
| 13 | **Evaluación de impacto** (Lei 15.211 art. 16 II; Decreto art. 47) | HECHO (guía ANPD, p. 41): el Decreto pide «avaliação de impacto à segurança e à saúde de crianças» con riesgos, probabilidad, gravedad, mitigación y seguimiento | **Ley** (documento) | Claude la escribe en portugués | USD 0 | Antes del 18-12 |
| 14 | **LGPD: base legal, aviso y datos que revelan religión** (Lei 13.709 arts. 3, 5 II, 7, 9, 11 y 14) | HECHO (texto de la ley): se aplica a quien ofrece servicios a personas en Brasil (art. 3); la convicción religiosa es dato sensible (art. 5 II) y el régimen sensible alcanza a todo tratamiento que pueda **revelarlo** (art. 11 §1); se trata con consentimiento «específico e destacado» (art. 11 I). INFERENCIA: un alias en un «grupo de iglesia» y el uso de una app cristiana pueden revelar convicción religiosa → consentimiento destacado y separado al usar Comunidad y al prender estadísticas. Menores: art. 14 y mejor interés; menos de 12, consentimiento de un responsable (art. 14 §1); en el Código Civil, menos de 16 es incapacidad absoluta → INFERENCIA: un consentimiento sensible de 13 a 15 lo da un responsable [abogado BR]. Con el modo protegido, de 13 a 15 nada sensible sale del teléfono | **Ley** | Claude: privacidad en portugués y pantallas de consentimiento; [abogado BR] la lee | Ver #26 | Antes del 18-12 |
| 15 | **Encargado de datos (DPO)** (LGPD art. 41; Res. CD/ANPD 18/2024; Res. CD/ANPD 2/2022) | HECHO (secundarias): la Res. 2/2022 exime de encargado a los agentes chicos, **incluidas personas naturales**, salvo tratamiento de alto riesgo (un criterio general, como larga escala, más uno específico, como datos sensibles o de menores). La Res. 18/2024 pide que el encargado se comunique «em língua portuguesa» y que su identidad y contacto estén publicados en lugar destacado. INFERENCIA: Senda (datos de adolescentes y que pueden revelar religión) puede caer en alto riesgo cuando crezca; nombrar encargado desde el día uno es barato y evita discutirlo | **Ley** (INFERENCIA) | Fundador: designarse con apoyo de Claude para el portugués, o tomar el servicio del mismo estudio del #2 | Sin precio público si se terceriza | Antes del 18-12 |
| 16 | **Transferencia internacional** (LGPD arts. 33-36; Res. CD/ANPD 19/2024; Res. CD/ANPD 32/2026) | HECHO: la Res. 32 (26-01-2026) reconoce a la UE como adecuada → **PostHog en la UE, sin trámite**. Supabase (región a confirmar), Anthropic (PDF del sermón), Expo/Firebase (avisos) y AdMob procesan en EE. UU. u otros países. HECHO (búsquedas 14-11): los DPA públicos de Supabase y Anthropic citan las cláusulas de la UE, no las de la ANPD. INFERENCIA: documentar la cláusula estándar de la ANPD con cada proveedor que la acepte y, mientras tanto, consentimiento específico y destacado para la transferencia (art. 33 VIII) al subir un PDF y al usar Comunidad [abogado BR] | No (si se documenta) | Fundador: confirmar región de Supabase y pedir los anexos; Claude: textos | USD 0 | Antes del 18-12 (consentimientos); cláusulas, Q1 |
| 17 | **Incidentes de seguridad** (Res. CD/ANPD 15/2024) | Comunicar a la ANPD y a los titulares los incidentes relevantes; el plazo que conocemos es de 3 días hábiles (no se releyó hoy: verificar) | No (procedimiento) | Claude: protocolo en `docs/SEGURIDAD.md` | USD 0 | Q1 |
| 18 | **Marco Civil da Internet** (Lei 12.965/2014 arts. 11 y 15) | HECHO (texto de la ley): rige la ley brasileña si se recogen datos de terminales en Brasil, aunque el proveedor esté afuera (art. 11). Guardar registros de acceso 6 meses es obligatorio para el proveedor «constituído na forma de pessoa jurídica» (art. 15). INFERENCIA: el fundador, persona física, no está obligado; si mañana opera una SAS, sí. Recomendación: guardar 6 meses los registros de acceso que ya produce Supabase (IP y hora), cifrados | No | Claude | USD 0 | — |
| 19 | **Consumidor: idioma, identificación y precio** (CDC, Lei 8.078/1990 arts. 31, 37, 46 y 54 §3; Decreto 7.962/2013 art. 2; Decreto-Lei 857/1969) | HECHO (textos de las normas): información de productos y servicios en portugués (art. 31); publicidad engañosa prohibida (art. 37 §1); contratos de adhesión claros y legibles (art. 54 §3); en comercio electrónico, nombre del proveedor, número fiscal, dirección física y electrónica a la vista (Decreto 7.962 art. 2); obligaciones en reales. Las tiendas cobran en BRL. INFERENCIA: nombre, CUIT y domicilio argentino del fundador en los términos y en la web [abogado BR: si el CUIT alcanza] | **Ley** (términos) | Claude | Ver #26 | Antes del 18-12 |
| 20 | **Arrepentimiento de 7 días en suscripciones** (CDC art. 49; Decreto 7.962 art. 5) | HECHO (texto): 7 días para desistir de lo contratado fuera del establecimiento, con devolución total. INFERENCIA: vale para las suscripciones compradas en la app; Senda debe ofrecer el camino dentro de la app | **Cobro** | Claude: «Desistir em 7 dias» (Android: reembolso por la API de Google Play; iPhone: hoja de reembolso de StoreKit) | USD 0 | Antes del primer cobro en Brasil |
| 21 | **Retenciones de las tiendas en Brasil** (Play 9384608 y payments 15152514; Apple, noticia 16-05-2025 y ayuda de impuestos) | HECHO: Google retiene **25 % del precio al cliente (15 % IRRF + 10 % CIDE)** a quien cobra fuera de BRL; con certificado de residencia fiscal de un país con tratado (**Argentina está en la lista**) se puede bajar el IRRF, nunca la CIDE; «la única forma de no retener es no distribuir en Brasil». HECHO: Apple descuenta 10 % de CIDE a desarrolladores fuera de Brasil desde el 16-05-2025 y retiene a la tasa estándar hasta revisar el certificado de residencia; anunció un ajuste por IOF de 3,5 %. **ESTIMACIÓN** (si comisión y retención se calculan sobre la misma base, que Google no aclara): de una suscripción de USD 1,99 en Brasil queda ≈ 60 % antes de tratado, contra ≈ 85 % en Argentina (15 % de comisión). Solo afecta lo que se venda en la tienda; AdMob no (INFERENCIA: lo paga Google desde fuera de Brasil) | **Cobro** (pesa en el precio) | Fundador: certificado de residencia fiscal de ARCA y cargarlo en Google y Apple; [contador]: tasa del tratado Argentina-Brasil y si la retención se puede computar en Argentina (INFERENCIA: en el monotributo no) | Trámite en ARCA (gratis, verificar) | Antes del primer cobro en Brasil |
| 22 | **Verificación de comerciante para vender en Brasil** (Play 6223646) | HECHO: quien vende en Play a Brasil carga nombre, dirección, beneficiarios y representantes; si no, «payments could be withheld and your account can be suspended» | **Cobro** | Fundador (cuando Google lo pida) | USD 0 | Antes del primer cobro en Brasil |
| 23 | **Reforma tributaria IBS/CBS** (LC 214/2025 y LC 227/2026) | HECHO (Receita Federal, curso mayo-2026; ConJur): en 2026, CBS 0,9 % e IBS 0,1 % de prueba, sin recaudación si se cumplen las obligaciones accesorias. HECHO (PwC 2026, secundaria): las plataformas digitales, aun extranjeras, responden por el IBS/CBS de lo que intermedian desde 2027. INFERENCIA: vendiendo solo por Google y Apple, el desarrollador extranjero no se inscribe ni factura en Brasil [contador] | No | [contador] | — | Revisar en 2027 |
| 24 | **Facturación desde Argentina** | INFERENCIA: nada cambia por Brasil: el que paga sigue siendo Google o Apple (Factura E, monotributo antes del primer pago, DEC-2026-10-25-2) | No | Fundador y [contador] | — | — |
| 25 | **Sorteos y concursos con premios** (Lei 5.768/1971 arts. 1, 3 y 4; Decreto 70.951/1972; Portaria SPA/MF 1.818/2026) | HECHO: los premios gratuitos «a título de propaganda» por sorteo, vale-brinde o concurso necesitan autorización, que solo se da a personas jurídicas con actividad empresarial y al día con los impuestos (gov.br). No la necesita el concurso «exclusivamente cultural, artístico, desportivo ou recreativo» sin azar, sin pago y sin compra (art. 3). INFERENCIA: un torneo de trivia gratis podría encuadrar ahí, pero si promueve la app la Secretaría puede leerlo como promoción; el fundador, persona física, no puede pedir autorización. **En Brasil: sin premios con valor económico** (solo insignias dentro de la app) y «10 kits por puntos» excluye Brasil en sus bases | No | Claude (bases y bloqueo por país) | USD 0 | — |
| 26 | **Revisión de un abogado brasileño** | INFERENCIA: privacidad, términos, modo protegido y la lectura de los arts. 21 y 24; idealmente el mismo estudio del #2 | **Ley** (calidad) | Fundador contrata; Claude prepara la lista | Sin precio público: cotizar | Antes del 12-12 |
| 27 | **Marca en el INPI de Brasil** (Lei 9.279 art. 217; tabla INPI desde el 20-12-2025; Convenio de París art. 4) | HECHO: quien vive afuera necesita procurador domiciliado en Brasil (art. 217). HECHO (tabla oficial): pedido con especificación preaprobada **R$ 880 por clase** (R$ 440 con el descuento de 50 % para «pessoas naturais», verificar si alcanza a un extranjero); primer decenio R$ 0. HECHO (Marval, secundaria): Argentina **no está en el Protocolo de Madrid** (el acuerdo con EE. UU. le pide llevarlo al Congreso antes de fin de 2027): hay que presentar en Brasil directamente. INFERENCIA: con la prioridad de París, presentando en Brasil dentro de los 6 meses de la presentación argentina (expedientes 4208861, 4208894, 4208608 y 4208613), la fecha argentina vale en Brasil. ESTIMACIÓN de tasas: 2 marcas × 2 clases = **R$ 1.760 a 3.520** más honorarios del procurador. La búsqueda de antecedentes de «SENDA» y «LANY» en Brasil queda para el procurador | No | Fundador por procurador (puede ser el estudio del #2) | R$ 1.760–3.520 + honorarios | Dentro de los 6 meses de la presentación argentina |
| 28 | **Bíblia Livre** (ebible.org/porbr2018, leído 14-11) | HECHO: CC BY 4.0 Brasil; © 2018 Diego Santos, Mario Sérgio y Marco Teles; crédito sugerido «Todas as Escrituras em português citadas são da Bíblia Livre (BLIVRE)...» con la fecha de versión; si se cambia el texto, decirlo. Sin restricción de marca | No | Claude: crédito exacto, fecha de versión y nota si hubo cambios de numeración u ortografía | USD 0 | Antes del 18-12 |
| 29 | **¿Todo en portugués?** | INFERENCIA con base en #6, #11, #14, #15 y #19: **la ley pide portugués para la información, los contratos, la privacidad, los controles para responsables, la clasificación y el contacto del encargado; no para el contenido**. Lo que sí no se puede es prometer «tudo em português» si hay rutas en español (CDC art. 37 §1). Hoy: interfaz entera, trivia entera y 23 de 102 rutas | No (si la ficha es honesta) | Claude | USD 0 | — |
| 30 | **Ficha y nombre en las tiendas** | INFERENCIA: «senda» existe en portugués (camino); nombre propuesto «Senda: Bíblia e jogos» (cabe en los 30 caracteres de Play); descripción pt-BR que diga qué está en portugués y qué llega en 2027; capturas en portugués | **Tienda** (práctica) | Claude escribe; fundador carga | USD 0 | Antes del AAB de producción |
| 31 | **Informe de transparencia semestral** (Lei 15.211 art. 31) | HECHO (Demarest y FAQ): solo con más de un millón de usuarios menores | No | — | — | — |
| 32 | **Ley de IA** (PL 2338/2023) | HECHO (Senado): aprobado en el Senado el 10-12-2024 y remitido a Diputados el 17-03-2025; no se encontró sanción al 14-11-2026 | No | Vigilar | — | — |
| 33 | **Fiscalización de la ANPD** (cronograma en gov.br/anpd, leído 14-11) | HECHO: etapa II desde agosto de 2026 (guía definitiva de verificación de edad y adaptación de agosto a noviembre); **etapa III desde enero de 2027: fiscalización, empezando por la verificación de edad**. La guía de alcance salió en octubre de 2026 (v1.0); la de verificación de edad seguía en borrador en la página leída. Multas: advertencia con 30 días para corregir; hasta 10 % de la facturación en Brasil o R$ 10 a R$ 1.000 por usuario registrado, tope R$ 50 millones por infracción (art. 35) | — | — | — | Desde enero de 2027 |

**Herramienta elegida (regla 10 del holding):** `expo-age-range` (Expo, SDK 57; docs.expo.dev/versions/v57.0.0/sdk/age-range, leído
14-11). Envuelve Play Age Signals en Android y Declared Age Range en iOS; un solo paquete, del mismo proveedor que el resto de la
app. Cuidado documentado: en iOS anterior a 26 devuelve `lowerBound: 18`, que **no** es una edad verificada. Licencia: la de los
módulos de Expo (verificar en el paquete al instalar). Regla de corte: si en el emulador con `setFakeAgeSignals` no devuelve los
rangos 13/16/18 configurados, se usa directamente la biblioteca de Google (`com.google.android.play:age-signals` 0.0.4) en un módulo
nativo chico.

---

## 2. Cambios concretos en la app (lista para el programador)

Todo detrás de un interruptor remoto por país (`src/util/interruptores.ts`), para poder apagar Brasil sin publicar otra versión.

1. **Detectar Brasil** (`src/util/pais.ts`, nuevo): `esBrasil()` = región del teléfono `BR` **o** tienda de Brasil (iOS:
   `Storefront.countryCode`) **o** idioma `pt-BR`. Si alguna da Brasil, se aplica el modo Brasil (equivocarse para el lado protector
   es lo que pide el Decreto, art. 25 §4).
2. **Edad en cuatro tramos útiles para Brasil** (`src/estado/usuario.ts`): partir `"13a17"` en `"13a15"` y `"16a17"`; migrar lo
   guardado: `"13a17"` pasa a `"13a15"` en Brasil (lo más protector) y queda igual fuera de Brasil.
3. **Señal de edad** (`src/util/edadTienda.ts`, nuevo, con `expo-age-range`):
   - Android: `requestAgeSignalsAccessAsync()` y, solo si da `'SHARED'`, `requestAgeRangeAsync()`. Play Console devuelve los rangos
     según las edades mínimas 13/16/18 que cargue el fundador.
   - iOS 26 o más: `requestAgeRangeAsync({ threshold1: 13, threshold2: 16, threshold3: 18 })`. En iOS anterior: **edad desconocida**.
   - **Edad efectiva en Brasil** = la menor entre la autodeclarada y la de la tienda; sin señal, la autodeclarada, pero **lo social
     exige señal de 18+** (ver la decisión en §3, paso 1).
   - Se guarda solo el tramo en el teléfono; al servidor va solo `comunidad_habilitada: true/false` (Decreto art. 25 §1: nada de fecha
     de nacimiento). Se vuelve a pedir al abrir la app (la señal cambia con el cumpleaños).
   - Si la señal contradice lo declarado, se aplica lo más protector y se ofrece «contestar» (Decreto art. 27): un texto que explica
     cómo corregir la edad en la tienda.
4. **Modo protegido para Brasil** (menores de 18 o edad desconocida):
   - Apagados: Comunidad, Duelos (también el rival al azar), Grupos, Torneos, Salas en vivo, Eventos compartidos, buscador por alias,
     perfil público, invitaciones y avisos de otros. En su lugar, una tarjeta en portugués: qué está apagado, por qué y «Em breve:
     ativar com a autorização de um responsável».
   - Defensa en la base (Supabase): una política que rechaza crear amistades, grupos, duelos, torneos y entradas a salas si el perfil
     tiene `pais = 'BR'` y `comunidad_habilitada = false`. Con su prueba en `pruebas/nube`.
   - La trivia del sermón (generar): solo con señal de 18+.
5. **Controles para responsáveis** (Ajustes, en portugués, con PIN de 4 cifras):
   - límite diario de tiempo (bloquea al llegar, con aviso);
   - apagar avisos;
   - ver el uso de la semana (local);
   - enlace a los controles de compra de la tienda (Family Link / Tempo de Uso);
   - un cartel visible «Controles ativos» mientras estén prendidos (art. 17).
6. **Contra el uso compulsivo** (menores en Brasil):
   - nada de avisos de «racha en riesgo»;
   - como mucho un aviso por día y ninguno entre las 22 y las 8;
   - nada de textos de urgencia;
   - el protector de racha se ofrece sin presión;
   - el «descansar a los 45 minutos» queda prendido de fábrica;
   - sobres del álbum: para menores en Brasil, se muestra qué figurita trae el próximo sobre (sin la sorpresa), o un tope de sobres
     por día. Lo decide el fundador (§3, paso 1).
7. **Anuncios en Brasil** (`src/util/anuncios.ts`):
   - menores de 16 y edad desconocida: sin anuncios;
   - de 16 a 17: G y `tagForUnderAgeOfConsent`;
   - adultos: sin personalizar, como ahora.
8. **Textos legales en portugués** (`contenido/legal.json` → `scripts/sitio_web.py` → `web/pt/`):
   - **Política de privacidade (LGPD):** controlador (nombre, CUIT, domicilio); encarregado y su contacto; representante legal en
     Brasil; finalidades y base legal de cada dato (arts. 7 y 11); datos que pueden revelar convicción religiosa y su consentimiento;
     menores (art. 14); transferencias por país y proveedor (art. 33); derechos (art. 18) y cómo pedirlos; retención; reclamo ante la
     ANPD.
   - **Termos de uso (CDC):** identificación del proveedor; precio en reales que muestra la tienda; renovación y cancelación;
     arrepentimiento de 7 días; clasificación indicativa en portugués (Decreto art. 12 §4); normas de la comunidad. Sin cláusulas que
     el CDC tiene por no escritas; nada de fuero argentino contra un consumidor brasileño (CDC art. 101) [abogado BR].
   - **Páginas web:** «Representante legal no Brasil» y «Canal de denúncias», abiertas a quien no usa la app.
9. **Consentimientos LGPD en Brasil:**
   - uno destacado y separado al prender Comunidad (adultos) que dice que el grupo o la actividad pueden revelar convicción religiosa
     y que los datos viajan a los países listados;
   - estadísticas apagadas de fábrica para menores;
   - al subir un PDF del sermón, consentimiento para el envío a Anthropic (EE. UU.).
10. **Denuncias** (`denuncias`):
    - categoría «Exploração ou abuso de criança» con prioridad máxima y retiro inmediato;
    - se guarda la evidencia para el reporte a Nidus: IDs, fecha y hora, IP, hashes; borrado bloqueado mientras dure la custodia;
    - la cola de «Senda para todos» muestra el plazo (12 h, 72 h o 7 días);
    - formulario web en portugués para quien no usa la app.
11. **Clasificación a la vista:** «Classificação indicativa: N anos» en la bienvenida en portugués, en Ajustes → Sobre y en los
    términos, con el valor del certificado IARC.
12. **Contenido en portugués:**
    - en `pt`, la Travesía muestra solo las rutas traducidas enteras;
    - las demás, en una sección «Em espanhol (tradução em 2027)», a elección;
    - crédito de la BLIVRE con la línea sugerida y la fecha de versión; si la app cambia numeración u ortografía, la nota de
      cambios (CC BY 4.0).
13. **Torneos y premios:**
    - en Brasil, sin premios con valor (solo insignias);
    - el «10 kits por puntos» filtra Brasil en la app y en las bases.
14. **Suscripciones (cuando se habiliten en Brasil):**
    - precios localizados que entrega la tienda (nunca USD fijo en pantalla);
    - renovación y cancelación a la vista;
    - «Desistir em 7 dias»: en Android, reembolso del lado del servidor con la API de Google Play Developer (verificar el método
      vigente al implementarlo); en iOS, la hoja de reembolso de StoreKit;
    - «Restaurar compras».
15. **Registros de acceso:** retener 6 meses los de Supabase (IP y hora), cifrados, y borrarlos después.
16. **Documento «Avaliação de impacto ECA Digital»** (`docs/legal/avaliacao_impacto_br.md`, en portugués): riesgos por función,
    probabilidad, gravedad, medida y cómo se mide.
17. **Pruebas:**
    - `?demo=brasil&edad=13a15|16a17|18|desconocida` en la vista previa;
    - en el emulador, `setFakeAgeSignals` para los cuatro casos;
    - prueba de la base: un menor brasileño no puede crear una amistad ni entrar a una sala.
18. **Ficha pt-BR** (`docs/TIENDAS.md` §4 en portugués) y respuestas nuevas de IARC y del cuestionario de edad de Apple (sin cajas,
    sin apuestas, sin ubicación compartida, usuarios que interactúan solo adultos en Brasil).

ESTIMACIÓN de trabajo de Claude: 3 a 4 sesiones (1 a 7 y 10 a 13 en dos; textos legales y documento de impacto en una; ficha,
pruebas y ajustes en otra). Debe entrar en el AAB que pase a producción, a más tardar el 10-12.

---

## 3. Tareas del fundador, en orden

1. **Hoy o mañana: decidir.** Opciones:
   - **(a)** Brasil el 18-12 con la versión protegida, gratis con anuncios, sin cobrar y sin premios, con la regla de corte del 05-12;
   - **(b)** Brasil el 01-03-2027, como estaba.

   Si elige (a), dos decisiones chicas:
   - **lo social para adultos sin señal de edad:** estricto (solo con señal de 18+) o práctico (con autodeclaración de 18+). La
     recomendación es estricto: es lo que la ANPD considera confiable;
   - **la sorpresa del sobre para menores en Brasil:** quitarla o ponerle tope diario.
2. **17 al 25-11: pedir tres cotizaciones** a estudios brasileños para:
   - representante legal (ECA Digital art. 40 y STF);
   - encargado de datos (opcional);
   - revisión de la privacidad y los términos en portugués;
   - procurador en el INPI.

   Claude deja el pedido escrito en portugués para copiar. Mandarlo es decisión del fundador (regla 8 del holding).
3. **Antes del 05-12: contratar uno y firmar el poder.** Ante escribano en Argentina, con apostilla. Preguntar al estudio si pide
   traducción jurada.
4. **Play Console:**
   - «Age signals» → edades mínimas 13, 16 y 18;
   - sumar Brasil a los países;
   - ficha pt-BR;
   - reenviar el cuestionario IARC;
   - «Seguridad de los datos» al día.
5. **App Store Connect:**
   - disponibilidad en Brasil y metadatos pt-BR;
   - cuestionario de edad;
   - activar la capacidad Declared Age Range en el identificador de la app.
6. **AdMob:** confirmar bloqueada la categoría de apuestas y juegos de azar (ANUNCIOS.md, paso 3).
7. **Policía Federal: registrarse en el Sistema Nidus** dentro del plazo del acto de apertura (Portaria MJSP 1.312/2026). Claude
   busca el acto y prepara los datos.
8. **Encargado de datos:** designarse (con Claude para el portugués) o tomar el del estudio. Publicar nombre y contacto.
9. **Supabase:** confirmar la región del proyecto y aceptar los DPA de Supabase, Anthropic y Google.
10. **Antes de cobrar en Brasil** (no el 18-12):
    - pedir a ARCA el certificado de residencia fiscal y cargarlo en Google (Brasil) y en App Store Connect;
    - completar la verificación de comerciante de Play para Brasil;
    - [contador]: la tasa del tratado y el costo neto.
11. **INPI de Brasil:** por el procurador, «SENDA BIBLIA Y JUEGOS» y «LANY» en las clases 9 y 41, con prioridad argentina, dentro
    de los 6 meses de la presentación en Argentina. Antes, la búsqueda de antecedentes en Brasil.
12. **Desde el 18-12:** atender las denuncias de Brasil en portugués con los plazos de §1 #12. Claude redacta las respuestas.

---

## 4. Riesgos residuales

- **La guía definitiva de verificación de edad no salió** (la página de la ANPD leída el 14-11 la muestra en borrador). La ANPD fiscaliza
  desde enero de 2027 empezando por ahí. Si fija un método más fuerte que la señal de la tienda para lo que hace Senda, hay que
  agregarlo. Probabilidad: ESTIMACIÓN media; Senda no ofrece contenido prohibido, que es donde el borrador exige verificación dura.
- **Que la ANPD trate a Senda como red social** (Decreto art. 19 §2 le deja reclasificar): entonces el art. 24 obliga a vincular a
  los menores de 16 con un responsable. Mitigación: con el modo protegido no hay menores con cuenta social. El vínculo con
  responsable es el primer evolutivo de 2027.
- **Autodeclaración:** si el fundador elige el camino práctico (adultos sin señal), un menor que miente accede a lo social. La ANPD dice
  que la autodeclaración no es confiable.
- **iPhone con iOS anterior a 26:** no hay señal; la app los trata como edad desconocida (sin Comunidad). Puede molestar a adultos.
- **Clasificación 14 en Brasil** (ESTIMACIÓN): con supervisión, la tienda puede pedir permiso de un responsable para descargar a menores de esa edad (Lei
  15.211 art. 12 §2); baja el alcance en 12 y 13 años.
- **Producto:** sin lo social para adolescentes en Brasil y con 79 de 102 rutas en español, pueden llegar reseñas flojas.
  Mitigación: ficha honesta y mostrar primero lo que está entero (Biblia, trivia, 23 rutas).
- **Costo fijo del representante** contra ingresos de Brasil todavía desconocidos. Sin precios públicos no se puede hacer el caso de
  negocio: decidir con las cotizaciones en la mano (regla 5 del holding: cada dólar compite).
- **Retención del 25 %** (más IOF en Apple) cuando se cobre: Brasil deja ≈ 60 % de cada suscripción antes del tratado (ESTIMACIÓN,
  §1 #21).
- **Marcas:** sin la búsqueda en el INPI de Brasil no se sabe si «SENDA» o «LANY» chocan en las clases 9 y 41. «Senda» es palabra
  común en portugués.
- **Reversión de la norma: baja** (INFERENCIA). El ECA Digital salió en 2025 con fuerte respaldo político y social. La tendencia
  2026 es agregar reglas (Decreto 12.880, Portaria 1.312, NT 55, Portaria 1.048), no sacarlas.
- **Lo que tiene que confirmar un profesional antes de salir** [abogado BR]:
  1. Que el modo protegido cumple los arts. 21 y 24.
  2. Que la señal de la tienda alcanza para el art. 14 en un servicio sin contenido prohibido.
  3. El consentimiento sensible de 13 a 17.
  4. Transferencias sin cláusulas de la ANPD firmadas.
  5. El CUIT como identificación (Decreto 7.962).
  6. Que el representante persona jurídica cumple el art. 40 y la tesis del STF.

  [contador]: tratado Argentina-Brasil (IRRF) y el efecto en el monotributo.

**Lectura económica (para `radar/mapa-regulatorio.md`; no se editó por pedido expreso):** ganan los estudios brasileños que venden
representación, encargado de datos y cumplimiento del ECA Digital, y los proveedores de verificación de edad. Pierden los
desarrolladores chicos extranjeros, que cargan un costo fijo y una retención del 25 % en Brasil. Mercado que aparece:
«representante legal + cumplimiento ECA llave en mano» para apps extranjeras. Su tamaño no se estimó: no hay precios públicos ni
cuenta de apps afectadas. Ventana: 2026-2027, con la fiscalización desde enero de 2027. Reversión: baja.

---

## 5. Fuentes (consultadas el 14-11-2026 salvo indicación)

**Primarias**
- Lei 15.211/2025, publicación original: [camara.leg.br/legin](https://www2.camara.leg.br/legin/fed/lei/2025/lei-15211-17-setembro-2025-797997-publicacaooriginal-176498-pl.html) (arts. 1, 2, 7-9, 12, 14, 16-18, 20-22, 24-26, 35, 39, 40). Planalto bloqueado (302).
- ANPD/MJSP/Secom, «Perguntas e respostas sobre o ECA Digital», act. 30-07-2026: [PDF](https://www.gov.br/anpd/pt-br/assuntos/eca-digital/perguntas_respostas_eca_digital_30072026.pdf/@@display-file/file).
- ANPD, guía «Fornecedores de produtos ou serviços de TI: escopo e obrigações gerais do ECA Digital», v1.0, oct-2026: [PDF](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-fornecedores-de-produtos-ou-servicos-de-tecnologia-da-informacao.pdf/@@display-file/file) (pp. 7-42).
- ANPD, página ECA Digital (cronograma y estado de las guías): [gov.br/anpd](https://www.gov.br/anpd/pt-br/assuntos/eca-digital).
- MJSP, Portaria 1.312/2026 (Nidus), vía Agência Gov 30-09-2026: [agenciagov.ebc.com.br](https://agenciagov.ebc.com.br/noticias/202609/mjsp-regulamenta-notificacao-de-crimes-contra-criancas-em-plataformas-digitais).
- Agência Gov, clasificación indicativa en el primer mes del ECA Digital (abr-2026): [agenciagov.ebc.com.br](https://agenciagov.ebc.com.br/noticias/202604/classificacao-indicativa-principais-mudancas-no-primeiro-mes-do-eca-digital); Agência Brasil 18-03-2026: [agenciabrasil](https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2026-03/consulta-publica-ouvira-sociedade-sobre-implementacao-do-eca-digital).
- Google Play: requisitos por país (Brasil, ECA Digital y verificación de comerciante) [6223646](https://support.google.com/googleplay/android-developer/answer/6223646?hl=en); Play Age Signals [v3](https://developer.android.com/google/play/age-signals/v3/use-age-signals-api) y [notas de versión](https://developer.android.com/google/play/age-signals/release-notes); retenciones [9384608](https://support.google.com/googleplay/android-developer/answer/9384608?hl=en) y [Brazil Tax Information 15152514](https://support.google.com/paymentscenter/answer/15152514?hl=en-IN); impuestos [138000](https://support.google.com/googleplay/android-developer/answer/138000?hl=en).
- Apple: [requisitos de edad en Brasil, 24-02-2026](https://developer.apple.com/news/?id=f5zj08ey); [CIDE 10 %, 16-05-2025](https://developer.apple.com/news/?id=wim4cztw); [información fiscal](https://developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information/).
- Expo, `expo-age-range` SDK 57: [docs.expo.dev](https://docs.expo.dev/versions/v57.0.0/sdk/age-range/).
- INPI, tabla de retribuciones de marcas (Portaria GM/MDIC 110/2025, vigente desde 20-12-2025): [PDF](https://www.gov.br/inpi/pt-br/servicos/custos-e-pagamento/NovaTabeladeRetribuiesINPI_MARCAS_Final_20_dez_25.pdf).
- Bíblia Livre, licencia: [ebible.org/porbr2018](https://ebible.org/porbr2018/copyright.htm).
- Lei 5.768/1971, texto actualizado: [camara.leg.br (PDF)](https://www2.camara.leg.br/legin/fed/lei/1970-1979/lei-5768-20-dezembro-1971-357812-normaatualizada-pl.pdf); autorización solo a personas jurídicas: [gov.br](https://www.gov.br/pt-br/servicos/obter-autorizacao-para-atividades-de-distribuicao-gratuita-de-premios-a-titulo-de-propaganda-ou-de-captacao-de-poupanca-popular).
- LGPD (Lei 13.709/2018), CDC (Lei 8.078/1990), Marco Civil (Lei 12.965/2014), Decreto 7.962/2013: texto de ley, citado de memoria
  verificable; no se releyó hoy porque Planalto está bloqueado. Releer en camara.leg.br antes de publicar.

**Secundarias (marcadas como tales en el texto)**
- Decreto 12.880/2026, transcripción: [higa.me](https://higa.me/notas/normas/decreto-12880). Souto Correa, ECA Digital y juegos: [soutocorrea.com.br](https://www.soutocorrea.com.br/client-alerts/eca-digital-entra-em-vigor-o-que-muda-para-empresas-de-servicos-digitais-e-jogos-eletronicos/).
- Demarest, cartilla ECA Digital (mar-2026): [PDF](https://www.demarest.com.br/wp-content/uploads/2026/03/Cartilha-ECA-Digital_V2.pdf).
- Data Privacy Brasil sobre las guías de la ANPD: [alcance final](https://www.dataprivacybr.org/a-quem-se-aplica-o-eca-digital-os-avancos-do-novo-guia-orientativo-da-anpd/) y [borradores](https://dataprivacy.com.br/escopo-e-afericao-de-idade-entenda-as-propostas-de-guias-da-anpd/).
- STF, Temas 987/533 (26-06-2025): [Barbieri Advogados](https://www.barbieriadvogados.com/marco-civil-da-internet-stf-redefine-responsabilidade-das-plataformas-digitais/).
- Clasificación por función (5.ª edición del Guia Prático): [LexLegal](https://lexlegal.com.br/?p=45411).
- Res. CD/ANPD 32/2026 (adecuación de la UE): [Mattos Filho](https://www.mattosfilho.com.br/unico/brasil-ue-protecao-dados-equivalentes/), [Lefosse](https://lefosse.com/noticias/alerta/transferencia-internacional-de-dados-pessoais-anpd-anuncia-decisao-de-adequacao-mutua-entre-brasil-e-uniao-europeia/).
- Res. CD/ANPD 2/2022 y 18/2024: [Machado Meyer](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/direito-digital/empresas-de-pequeno-porte-podem-ser-dispensadas-de-ter-dpo), [Mattos Filho](https://www.mattosfilho.com.br/unico/anpd-resolucao-encarregado/).
- NT MJSP 55/2026 (cajas de recompensa, 15-10-2026): [Correio da Manhã](https://www.correiodamanha.com.br/economia/justica/2026/10/327183-governo-pede-investigacao-de-seis-jogos-por-risco-de-apostas-a-menores.html).
- Reforma tributaria y plataformas: [PwC 2026](https://www.pwc.com.br/pt/thinking-about-taxes/tax-intelligence/2026/tax-intelligence-raciocinios-ed-07_marketplaces.pdf); [Receita Federal, curso 05-2026](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/curso/material-de-apoio/curso-cfc-rfb-modulo-1-mombelli_maio-2026-final.pdf).
- Argentina y el Protocolo de Madrid: [Marval](https://www.marval.com/Publicacion/el-protocolo-de-madrid-como-eje-del-acuerdo-con-ee-uu-17478).
- PL 2338/2023: [Senado](https://www12.senado.leg.br/noticias/materias/2024/12/05/comissao-chega-a-consenso-e-regulamentacao-da-inteligencia-artificial-vai-a-plenario).

**Del repositorio** (contexto): `conocimiento/2026-11-07-senda-chequeo-legal.md`; en la app, `docs/LEGAL.md`, `docs/TIENDAS.md`,
`docs/ANUNCIOS.md`, `docs/ECONOMIA.md`, `docs/SUSCRIPCIONES.md`, `src/util/anuncios.ts` y `src/estado/usuario.ts` (solo lectura).
