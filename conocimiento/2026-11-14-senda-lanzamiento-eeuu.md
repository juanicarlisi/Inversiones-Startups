# Senda en EE. UU. desde el 18-12-2026: todo lo que hay que hacer (14-11-2026)

Pedido del fundador (14-11-2026): «recopilá absolutamente todo lo que haya que hacer para lograrlo, no importa lo que sea, y buscamos
hacerlo». Revierte la exclusión de EE. UU. hasta el 01-06-2027 (DEC-2026-11-07-6). Relevamiento del agente `analista-regulatorio`
sobre los documentos de la app (`docs/LEGAL.md`, `TIENDAS.md`, `CUENTAS.md`, `SEGURIDAD.md`, `ANUNCIOS.md`), el código
(`Bienvenida.tsx`, `cuenta.ts`, `anuncios.ts`, `juntos.ts`, `escucha.ts`, `app.json`) y fuentes oficiales consultadas el 14-11-2026.

**No es asesoramiento legal ni contable.** Lo marcado [abogado EE. UU.] o [contador] lo confirma un profesional. Etiquetas: **HECHO**
(fuente y fecha), **ESTIMACIÓN** (con método), **INFERENCIA** (razonamiento propio), **HIPÓTESIS** (a validar).

**Fuentes que no se pudieron leer el 14-11:** ecfr.gov (redirige a un bloqueo para clientes automáticos; se usó la copia de Cornell LII
de 16 CFR 312.2), leginfo.legislature.ca.gov (403; AB 1043 por fuentes secundarias), developer.apple.com/documentation (se arma con
JavaScript; se usó el anuncio de Apple y la documentación de Expo), el buscador de marcas de la USPTO (se usó TSDR, que sí abrió para
tres expedientes), markinton.com (DNS caído).

---

## 0. Veredicto

**Sí se puede salir el 18-12-2026 en EE. UU.** (INFERENCIA), con una condición técnica dura y una decisión de producto:

1. **Condición técnica dura (bloquea): integrar las señales de edad de las tiendas** (Google Play Age Signals y Apple Declared Age
   Range, con `expo-age-range`, que ya existe para Expo SDK 57). La ley de Texas (SB 2420) **está vigente desde el 04-06-2026** por una
   suspensión de la Corte del Quinto Circuito (la Corte Suprema no la levantó el 06-07-2026) y obliga al desarrollador a «usar la
   información que le da la tienda» para saber la franja de edad y si hay consentimiento de los padres. Después vienen California
   (01-01-2027), Alabama (01-01-2027), Utah (06-05-2027, con demanda privada de USD 1.000 por infracción) y Luisiana (01-07-2027): la
   integración se necesita igual dos semanas después del lanzamiento. **Regla de corte:** si el 05-12 no funciona en un iPhone y en un
   Android reales, EE. UU. pasa a enero sin atrasar Latinoamérica.
2. **Decisión de producto (la toma el fundador): qué hacen los adolescentes de 13 a 17 en EE. UU.** Hay leyes estatales de «redes
   sociales para menores» vigentes (Mississippi, Tennessee, partes de Nebraska) que piden verificar la edad y el permiso de los padres, o
   herramientas de supervisión para los padres, a servicios con cuentas, perfiles y contenido que ven otros. Senda probablemente entra en
   la excepción de «contenido elegido por el proveedor con interacción incidental», pero no es seguro (INFERENCIA; [abogado EE. UU.]).
   - **Recomendado para el 18-12 (opción A):** en EE. UU., Comunidad (amigos, duelos, grupos, torneos, salas) **solo para 18+**; de 13
     a 17 leen, hacen la Travesía y juegan solos (sin cuenta, como hoy los menores de 13 pero con estadísticas y anuncios no
     personalizados si dicen que sí). Riesgo casi cero, sin abogado previo. Costo: el pastor de jóvenes de EE. UU. no
     puede armar su grupo de adolescentes al principio.
   - **Opción B (en enero, con opinión de un abogado):** 13–17 con Comunidad solo si la tienda da la franja y el permiso de los padres,
     sin publicar texto libre (alias elegido de una lista, sin crear grupos, eventos ni torneos).

**Lo mínimo indispensable para el 18-12** (todo lo demás mejora, pero no frena):

| # | Mínimo | Quién |
|---|---|---|
| 1 | Señales de edad de Play y de Apple integradas, con la regla «gana la edad más baja» | Claude |
| 2 | La pregunta de edad deja de poder saltearse antes de cualquier cuenta o dato en la nube (hoy se puede: `Bienvenida.tsx`, botón «Saltar»; `cuenta.ts` solo frena `menos13`, no `null`) | Claude |
| 3 | Opción A (Comunidad 18+ en EE. UU.) o B, decidida | Fundador decide; Claude programa |
| 4 | Menores de 13: el reconocimiento de voz solo en el teléfono o apagado (hoy puede mandar audio a Google o Apple: `escucha.ts` no pide `requiresOnDeviceRecognition`) | Claude |
| 5 | Privacidad, términos, normas y página de borrado **en inglés**, con la sección de EE. UU. (COPPA, estados, datos que pueden revelar la fe, aviso de controles parentales del art. 230(d)) | Claude redacta; fundador publica |
| 6 | Consentimiento expreso al crear la cuenta y al activar estadísticas para datos que pueden revelar la fe (Connecticut desde el 01-07-2026) | Claude |
| 7 | Fichas en inglés (Play y App Store), disponibilidad en EE. UU., clasificación por edad y etiquetas de privacidad al día, señales de edad y clasificación de los productos de compra en Play Console | Claude prepara; fundador carga |
| 8 | Datos fiscales: W-8BEN en App Store Connect; en AdMob, declaración de «editor extranjero sin actividades en EE. UU.» (o formulario 8233) | Fundador; [contador] |
| 9 | En EE. UU., torneos **sin premios** y la sala en vivo apagada hasta revisar una patente activa sobre competencias en vivo (US 10.339.825) | Claude (por país de la tienda) |
| 10 | Correo de soporte publicado en la ficha y en la app (Apple 1.2) | Fundador |

---

## 1. Tabla de requisitos

Clave de «¿Bloquea?»: **Sí** = no se publica o se publica fuera de la ley; **Antes de X** = tiene fecha propia; **No** = recomendable.
Costos en USD; «0» = solo trabajo de Claude o del fundador.

### 1.A Menores y edad

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| A1 | **COPPA (regla modificada)**: vigente desde el 23-06-2025, cumplimiento obligatorio desde el **22-04-2026**. Senda tiene varios factores de «dirigida a niños» (personaje animado, juegos, actividades para chicos) | HECHO: FR 22-04-2025; 16 CFR 312.2 (LII). INFERENCIA: la FTC podría tratarla como **«mixed audience»** (dirigida a niños pero sin que sean su público principal): es lo que ya hace Senda y es legal **si** pregunta la edad de forma neutral **antes** de recoger cualquier dato y no recoge datos personales de menores de 13 sin permiso verificable de los padres | **Sí** | Claude | 0 | Antes del 05-12 |
| A2 | Pregunta de edad **neutral y obligatoria** antes de cualquier dato: sin edad por defecto, sin invitar a mentir; si se saltea, no hay cuenta ni datos en la nube; quien eligió «Menos de 13» no puede volver atrás y cambiarla en el momento | HECHO: definición de «mixed audience» en 312.2 («neutral manner that does not default to a set age or encourage visitors to falsify age»). Hoy el paso de edad tiene «Saltar» y `perfil.edad = null` puede crear cuenta (`cuenta.ts:141`) | **Sí** | Claude | 0 | 05-12 |
| A3 | Menores de 13 sin datos personales: sin cuenta, sin token de avisos en la base, sin estadísticas, sin anuncios (ya hecho y verificado en el código: `asegurarCuenta()` lanza `menor_13` antes de `guardar_token`; AdMob no se inicia). **Falta:** voz solo en el teléfono, y una auditoría de red con el perfil «menos13» (encuesta anónima, copas: si mandan un identificador persistente, que sea solo para el funcionamiento interno y no se guarde con el perfil) | HECHO: 312.2 incluye como dato personal el identificador persistente y el audio con la voz del niño; la excepción de «soporte para operaciones internas» cubre servir la app, publicidad contextual y topes de frecuencia | **Sí** (la voz) | Claude | 0 | 05-12 |
| A4 | Si la tienda dice que la persona es menor de 13 pero eligió «18+», gana la tienda (conocimiento efectivo) | INFERENCIA fuerte: 312.2 trata como dirigida a niños la parte del servicio donde hay conocimiento efectivo; California AB 1043 (desde 01-01-2027) dice que quien recibe la señal **tiene conocimiento efectivo** aunque la ignore (HECHO, fuente secundaria) | **Sí** | Claude | 0 | 05-12 |
| A5 | **Texas SB 2420** (App Store Accountability Act): el desarrollador debe (a) asignar clasificación por edad a la app **y a cada compra**; (b) avisar a las tiendas **antes** de un cambio significativo de términos o privacidad (cambia datos, clasificación, suma monetización o cambia la función); (c) **usar los datos de la tienda** para la franja de edad y el consentimiento parental; (d) usarlos solo para eso y borrarlos tras verificar; (e) no exigir términos a un menor sin consentimiento. Franjas: menor de 13, 13–15, 16–17, 18+. Sanción: práctica engañosa (DTPA) | HECHO: texto enrolado SB 2420, arts. 121.052–121.056 y 121.101 (capitol.texas.gov). Estado: medida cautelar del 23-12-2025, **suspendida** por el Quinto Circuito (administrativa 28-05-2026; definitiva 04-06-2026); la Corte Suprema negó levantarla el 06-07-2026; audiencia 04-08-2026; sin sentencia al 13-10-2026 (texasdatalaw.com). Google: «now in effect» (Play 16569691). Apple: rige para cuentas nuevas creadas en Texas | **Sí** | Claude (código); fundador (consolas) | 0 | 05-12 |
| A6 | Puerto seguro de Texas: sin responsabilidad si se confía de buena fe en la edad y el consentimiento que da la tienda, y si la clasificación sigue un estándar de la industria | HECHO: art. 121.056(b)-(c) | — | — | — | — |
| A7 | **California AB 1043** (Digital Age Assurance Act): pedir la señal de edad cuando la app se descarga y se abre; recibirla = conocimiento efectivo. Multa civil por niño afectado: hasta USD 2.500 (negligente) y 7.500 (intencional), solo el fiscal general | HECHO (fuentes secundarias: Kelley Drye, TrueVault; leginfo dio 403). Ojo: AB 1856 (2026) podría cambiar el texto operativo | Antes del 01-01-2027 | Claude | 0 | Con A5 |
| A8 | **Alabama HB 161**: rige el 01-01-2027 para cuentas nuevas; **Utah** SB 142 reformada por HB 498: postergada al **06-05-2027**, sin fiscal, con demanda privada de padres (mayor entre daño real o USD 1.000 por infracción) y puerto seguro para quien confía en la tienda; **Luisiana** HB 570: postergada al **01-07-2027** por HB 977 (firmada el 15-05-2026), solo fiscal, hasta USD 10.000 por infracción | HECHO (fuentes secundarias: recordinglaw.com 13-08-2026; Alston & Bird; Loeb). Verificar en las legislaturas | Antes de cada fecha | Claude | 0 | Con A5 |
| A9 | Herramientas: **Play Age Signals API** (beta; devuelve franja, fuente de la verificación, estado de aprobación de cambios significativos; solo se puede usar para cumplir la ley, nunca para anuncios ni analítica); Google **no obliga** a usarla, pero dice que cada desarrollador decide cómo le aplica la ley y que para bloquear un estado hay que hacerlo uno mismo | HECHO: developer.android.com/google/play/age-signals (términos de oct-2025); Play 16585319 y 16569691 | — | — | 0 | — |
| A10 | Apple: **Declared Age Range** (franjas de Texas, método de verificación), **Significant Change API** de PermissionKit para pedir consentimiento ante un cambio significativo, propiedad de StoreKit para detectar cambios de clasificación y **notificaciones del servidor** cuando un padre retira el consentimiento (la app deja de abrir en ese teléfono). Requiere el permiso `com.apple.developer.declared-age-range` y Xcode 26 | HECHO: Apple Developer News 04-11-2025 («Next steps for apps distributed in Texas»); docs de Expo `expo-age-range` (SDK 57) | — | — | 0 | — |
| A11 | **Leyes de redes sociales para menores**. Vigentes que podrían alcanzar a Senda: **Mississippi HB 1126** (servicio que conecta usuarios para interactuar, con perfil y contenido que ven otros; exige registrar la edad, «esfuerzos comercialmente razonables» para verificarla y permiso expreso de los padres para menores de 18 conocidos; excepciones: contenido «principalmente generado o elegido por el proveedor», videojuegos con interacción incidental, noticias, comercio); vigente desde la suspensión del Quinto Circuito del 17-07-2025, segunda audiencia el 03-02-2026, sin sentencia encontrada. **Tennessee** (Protecting Children from Social Media Act): cautelar negada el 18-06-2025 (NetChoice v. Skrmetti, citado por el tribunal de Nebraska). **Luisiana** (La. Rev. Stat. 51:1751-1756): cautelar **permanente
solo a favor de los miembros de NetChoice** (NetChoice v. Murrill, apelada), así que para Senda, que no es miembro, podría seguir
exigible: revisar su definición y sus umbrales [abogado EE. UU.]. **Nebraska LB 383** (desde el 01-07-2026): cautelar parcial del 27-06-2026 contra la verificación de edad y el permiso parental; **siguen exigibles** las herramientas de supervisión para padres de cuentas de menores (ver publicaciones y mensajes, controlar ajustes, medir el tiempo, revocar); excepción para sitios con contenido «principalmente preseleccionado» por el dueño e interacción «incidental». **Texas SCOPE Act (HB 18)**: el Quinto Circuito concedió revisión en pleno el 28-10-2026 y anuló el fallo de julio (una sola fuente secundaria); estado incierto | HECHO: texto de HB 1126 (billstatus.ls.state.ms.us); orden del 27-06-2026 en NetChoice v. Hilgers (D. Neb., 4:26-cv-3149, Doc. 33, leída en PDF). Resto, fuentes secundarias. INFERENCIA: Senda tiene buen argumento para la excepción (el 90 % de lo que se ve lo escribe Senda), pero grupos, eventos y torneos con texto de usuarios lo debilitan | **Sí para 13–17 con Comunidad** (opción A lo resuelve) | Fundador decide; Claude programa; [abogado EE. UU.] para la opción B | Opción A: 0 | 05-12 |
| A12 | Leyes que **no** alcanzan a Senda (INFERENCIA): Florida HB 3 (exige que el 10 % de los usuarios diarios menores de 16 use 2 h o más y funciones adictivas), Georgia, Arkansas y Utah (bloqueadas según trackers), Nueva York SAFE for Kids y California SB 976 (solo «feeds» algorítmicos; Senda no tiene), California AADC (bloqueada), Maryland Kids Code (umbrales tipo CCPA) | Fuentes secundarias (AVPA, trackers) | No | — | — | Revisar cada trimestre |
| A13 | Leyes federales pendientes: KOSA, COPPA 2.0 (aprobada por el Senado en marzo de 2026), App Store Accountability Act federal (aprobada en comisión de la Cámara, 26-23, marzo de 2026), KIDS Act (H.R. 7757, aprobada por la Cámara el 29-06-2026): **ninguna es ley** al último dato encontrado (agosto de 2026) | Fuentes secundarias (Loeb, Mayer Brown, Fortune) | No | Claude vigila | 0 | Vigilancia |
| A14 | **Álbum con sobres**: la FTC (HoYoverse/Genshin Impact, 17-01-2025, USD 20 M) prohibió vender cajas de botín a menores de 16 sin permiso de los padres y trató el juego como dirigido a niños | HECHO: ftc.gov (blog del 01-2025). INFERENCIA: los sobres de Senda se abren solo con Talentos ganados jugando (nunca con plata): no es el caso; **nunca vender Talentos** (ya es regla) | No | — | 0 | Regla permanente |

### 1.B Privacidad

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| B1 | Política de privacidad **en inglés**, en URL pública, coherente con lo que hace la app: quién es el responsable, qué datos, para qué, con quién se comparten (Supabase, PostHog UE, Expo/FCM, AdMob, Anthropic), retención, borrado, derechos, contacto; sección COPPA (Senda no recoge datos de menores de 13; qué hace si se entera); sección de estados; el reconocimiento de voz del teléfono (Google o Apple pueden procesar el audio si no es en el teléfono) | HECHO: Apple 5.1.1(i), Play 10144311; FTC Act art. 5 (lo que se promete se cumple). INFERENCIA fuerte: si la app se ofrece en inglés en EE. UU., las condiciones tienen que estar en inglés para ser «claras y visibles» | **Sí** | Claude redacta; fundador publica | 0 | 01-12 |
| B2 | **CCPA/CPRA (California)**: aplica a empresas con ingresos brutos de más de USD 25 M (ajustado por inflación), o que compran, venden o comparten datos de 100.000 o más consumidores, o que sacan 50 % o más de sus ingresos de vender o compartir datos | INFERENCIA: Senda no llega a ningún umbral en 2027 y no «comparte» para publicidad conductual (anuncios no personalizados) → **no aplica**. Revisar al pasar 50.000 usuarios en California | No | Claude vigila | 0 | — |
| B3 | Leyes estatales «integrales» con umbral (Virginia, Colorado, Oregón, Minnesota, etc.: en general 100.000 consumidores; algunas 35.000 o menos) | INFERENCIA: no aplican el primer año | No | Claude vigila | 0 | — |
| B4 | **Texas TDPSA y Nebraska NDPA**: sin umbral de ingresos ni de usuarios, pero exceptúan a la pequeña empresa según la SBA (Senda lo es); aun así, la pequeña empresa **no puede vender datos sensibles sin consentimiento** | HECHO (fuentes secundarias: Benesch, Bass Berry; texto oficial en sll.texas.gov). Senda no vende datos → cumple | No | — | 0 | — |
| B5 | **Connecticut (CTDPA reformada por SB 1295, desde el 01-07-2026)**: aplica sin umbral a quien trate **datos sensibles** o venda datos; los datos sensibles necesitan consentimiento; a menores de 18 conocidos: prohibido publicidad dirigida y venta aun con consentimiento, y prohibidas las funciones de diseño hechas para aumentar mucho el uso | HECHO (fuentes secundarias: Hunton, Perkins Coie, TrueVault). INFERENCIA: grupos de iglesia y eventos como «capitulo_leido» u «oracion_antes_de_leer» pueden revelar creencias religiosas (dato sensible en casi todas las leyes estatales) → tratar como sensible: **consentimiento expreso** al crear la cuenta y al activar estadísticas; para 13–17, revisar rachas y recordatorios [abogado EE. UU.] | **Sí** (el consentimiento) | Claude | 0 | 05-12 |
| B6 | Etiquetas de privacidad de Apple y «Seguridad de los datos» de Play: las mismas para EE. UU.; sumar el **dato sensible** «creencias religiosas» si se guarda en la nube algo que las revele (Apple: «Sensitive Info»; Play: «Información personal → creencias religiosas o políticas») | INFERENCIA; HECHO: Apple 5.1.1 / Play 10787469 | **Sí** (que sean verdad) | Claude prepara; fundador carga | 0 | 01-12 |
| B7 | La política vieja dice cosas pensadas para Argentina (Ley 25.326, AAIP): se mantiene y se suma la parte de EE. UU.; no hace falta un representante en EE. UU. (no hay figura como la del RGPD) | INFERENCIA | — | Claude | 0 | — |

### 1.C Tiendas

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| C1 | **Apple 1.2 (contenido de usuarios)**: filtro, denuncia con respuesta a tiempo, bloqueo y **datos de contacto publicados** | HECHO: App Review Guidelines (actualizadas el 16-10-2026). Senda ya tiene filtro, denuncia y bloqueo (`docs/SEGURIDAD.md`); falta el contacto visible | **Sí** | Fundador (correo); Claude (pantalla) | 0 | 01-12 |
| C2 | **Apple 5.1.1(v)**: si la app crea cuentas, borrado dentro de la app | HECHO; ya hecho (prueba 49) | Hecho | — | — | — |
| C3 | **Apple 4.8**: si se ofrece «Continuar con Google», también un inicio equivalente que limite datos a nombre y correo (Sign in with Apple) | HECHO; ya en `docs/TIENDAS.md` §2.7 | **Sí** si Google está activo en iOS | Claude | 0 | 05-12 |
| C4 | **Apple 3.1.2**: suscripciones con valor continuo, mínimo 7 días, disponibles en todos los dispositivos, y explicar qué se recibe antes de pedir el pago | HECHO | **Sí** (si se cobra desde el 18-12) | Claude | 0 | 05-12 |
| C5 | **Apple 1.3 y 5.1.4 (niños)**: no aplica si Senda **no** está en la categoría Kids; no ponerla ahí (prohíbe analítica y anuncios de terceros) | HECHO | — | Fundador (no marcar Kids) | 0 | — |
| C6 | **Clasificación por edad de Apple** (desde 2025: 4+, 9+, 13+, 16+, 18+; cuestionario nuevo obligatorio desde el 31-01-2026): responder honesto (contenido de usuarios, interacción, anuncios); Senda queda 13+ (o la que salga) y puede fijar una edad mínima más alta. Íconos y capturas aptos para 4+ (2.3.8) | HECHO (fuentes secundarias sobre el cambio; 2.3.6 y 2.3.8 de las Guidelines) | **Sí** | Fundador con el texto de Claude | 0 | 01-12 |
| C7 | **Apple 5.3**: concursos y sorteos patrocinados por el desarrollador, con bases dentro de la app que digan que Apple no patrocina | HECHO | Solo si hay premios | Claude | 0 | — |
| C8 | **Apple 5.1.2 / ATT**: no hace falta el cartel de rastreo con anuncios no personalizados y sin rastreo entre apps | HECHO (5.1.2(i)); INFERENCIA sobre AdMob no personalizado | No | — | 0 | — |
| C9 | **Apple: textos de permisos** (`NSMicrophoneUsageDescription`, ubicación) hoy solo en español: localizarlos a inglés y portugués; sacar los textos de ubicación «siempre» si nunca se pide ese permiso | INFERENCIA (riesgo de rechazo en revisión por 5.1.1) | No (pero conviene) | Claude | 0 | 05-12 |
| C10 | **Apple: cumplimiento de exportación** (cifrado): solo HTTPS → exento; declarar `ITSAppUsesNonExemptEncryption = false` | INFERENCIA (regla general de Apple; verificar en `app.json`) | No | Claude | 0 | 05-12 |
| C11 | **Google Play: países**: agregar EE. UU. en «Países y regiones» (producción y prueba) | HECHO | **Sí** | Fundador | 0 | 01-12 |
| C12 | **Google Play: Texas**: página «Age signals» de Play Console para declarar cambios significativos; **clasificación por edad de cada producto de compra** (Premium, Max) en Play Console o por la API de publicación | HECHO: Play 16569691 | **Sí** | Fundador con el texto de Claude | 0 | 05-12 |
| C13 | **Google Play: Child Safety Standards** (normas publicadas contra el abuso sexual infantil, contacto designado, mecanismo de denuncia en la app): obligatoria para apps de categoría «Social» o «Citas». Senda va en Educación, pero con funciones sociales: publicar igual la página de normas (es barato) | HECHO (fuentes secundarias e iubenda; obligatoria desde el 19-03-2025) | No (sí si se elige «Social») | Claude redacta; fundador publica | 0 | 01-12 |
| C14 | **Google Play: dirección física visible**: una cuenta personal que cobra compras dentro de la app tiene que cargar una dirección física y Google la **muestra** en la ficha | HECHO: Play 10840893 / 6223646. No es nuevo de EE. UU., pero con EE. UU. la ve más gente: decidir qué domicilio se usa | **Sí** (si hay compras) | Fundador | 0 | 01-12 |
| C15 | **Público objetivo 13+** en Play (fuera de la política de Familias); a la pregunta «¿podría atraer a niños sin querer?», contestar con la verdad: sí puede, y por eso hay pregunta de edad y nada para menores de 13 | HECHO (Play 9893335); INFERENCIA sobre la respuesta | **Sí** | Fundador | 0 | 01-12 |

### 1.D Contenido de usuarios y moderación

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| D1 | **Sección 230 (47 U.S.C. 230)**: protege a Senda de responder como «editor» de lo que escriben otros, y protege la moderación de buena fe. No cubre propiedad intelectual ni delitos federales | HECHO (LII) | — | — | 0 | — |
| D2 | **Art. 230(d)**: el proveedor, al hacer el acuerdo con el usuario, tiene que avisarle que existen controles parentales comerciales (hardware, software, filtros) y cómo encontrarlos. Casi nadie lo cumple; es una línea en los términos y en la hoja de normas | HECHO (LII) | No (barato, hacerlo) | Claude | 0 | 01-12 |
| D3 | **DMCA (17 U.S.C. 512)**: para el puerto seguro ante reclamos de derechos de autor por contenido de usuarios (preguntas de torneos, PDF del sermón), registrar un **agente designado** en la Oficina de Derechos de Autor (USD 6, renovar cada 3 años), con política de baja y de infractores reincidentes en los términos | HECHO (fuentes secundarias sobre la tarifa; copyright.gov) | No | Fundador registra; Claude redacta | USD 6 | Antes del 18-12 |
| D4 | **Material de abuso sexual infantil**: un proveedor que **se entera** tiene que reportarlo al CyberTipline del NCMEC (18 U.S.C. 2258A). Senda casi no recibe imágenes (solo el PDF del sermón) | INFERENCIA (no se leyó el texto el 14-11) | No | Claude (protocolo en `SEGURIDAD.md`) | 0 | — |
| D5 | Take It Down Act (2025): exige un proceso de baja de imágenes íntimas a plataformas que **principalmente** son un foro de contenido de usuarios | INFERENCIA: Senda no lo es → no aplica | No | — | — | — |

### 1.E Impuestos y cobros

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| E1 | **No hay tratado de doble imposición Argentina–EE. UU.** | HECHO conocido (lista de tratados del IRS; verificar en irs.gov «Tax treaties A to Z») | — | — | — | — |
| E2 | **Apple**: el Paid Apps Agreement exige un formulario fiscal de EE. UU.; para una persona física no residente, **W-8BEN** (App Store Connect lo elige con preguntas; no se corrige después sin pedirlo a Apple). En la línea del número fiscal extranjero va el CUIT/CUIL | HECHO: App Store Connect Help «Provide US tax information» | **Sí** (para cobrar) | Fundador | 0 | 01-12 |
| E3 | **Apple: ¿retiene impuesto de EE. UU. sobre las ventas a usuarios de EE. UU.?** No se encontró la regla oficial de Apple. Peor caso: 30 % de lo que pagan los usuarios de EE. UU. (tasa legal sobre rentas de fuente de EE. UU. a extranjeros sin tratado) | **No verificado**. Preguntar a Apple Finance y al [contador] antes de proyectar ingresos | No | Fundador | 0 | Antes del primer cobro |
| E4 | **Google Play**: la página de impuestos de Play lista retenciones solo para Brasil, Egipto, India, Kenia, Kuwait, Myanmar, Sri Lanka, Taiwán, Tanzania y Vietnam; EE. UU. no figura | HECHO (Play 9384608). INFERENCIA: Google no retiene impuesto de EE. UU. sobre ventas de Play a un desarrollador argentino | No | — | 0 | — |
| E5 | **Impuesto a las ventas de EE. UU.**: Google calcula, cobra y paga el impuesto a las ventas de las compras por Play Billing en 46 estados más DC (lista en Play 138000); el desarrollador no hace nada. Apple cobra y paga en los territorios del Anexo B del Schedule 2 | HECHO (Play 138000). Apple: INFERENCIA fuerte (no se leyó el Anexo B vigente) | No | — | 0 | — |
| E6 | **AdMob**: la página de impuestos de AdMob dice que **no acepta W-8BEN de una persona física** (los ingresos son «servicios personales» → formulario **8233** para pedir exención); sin actividades en EE. UU. (empleados o equipos propios allá) no hace falta formulario: alcanza con aceptar la declaración «Foreign Publisher with no US Activities». Dice que retiene «rara vez» | HECHO: AdMob 4381375 (página con ejemplos de 2012–2013: puede estar vieja). INFERENCIA: los servicios hechos fuera de EE. UU. no son de fuente de EE. UU. → 0 % | No | Fundador; [contador] | 0 | Al abrir AdMob |
| E7 | **EIN o ITIN**: no hacen falta para el W-8BEN de una persona sin tratado (alcanza el número fiscal argentino) | INFERENCIA [contador] | No | — | 0 | — |
| E8 | **Argentina**: lo que retenga EE. UU. probablemente no se recupera con monotributo; factura E a Apple y a Google; ingresos en dólares del exterior | INFERENCIA [contador] | No | Fundador | Honorarios del contador | Antes del primer cobro |
| E9 | **Suscripciones (ley federal ROSCA y ley de renovación automática de California, reformada desde el 01-07-2025)**: antes de cobrar, decir claro precio, período, renovación automática y cómo cancelar; consentimiento expreso a la renovación; acuse después de la compra con cómo cancelar (sin correo: pantalla dentro de la app); cancelar fácil (las tiendas lo resuelven) | HECHO: la regla «click-to-cancel» de la FTC fue anulada por el Octavo Circuito el 08-07-2025, pero ROSCA y la ley de California siguen (fuentes secundarias: Gibson Dunn 02-2026, Lowenstein). La ley de California aplica a cualquier empresa que venda a californianos, sin umbral (INFERENCIA [abogado EE. UU.]) | **Sí** (si se cobra) | Claude | 0 | 05-12 |
| E10 | Comisión de las tiendas: Apple Small Business Program (15 % en vez de 30 % hasta USD 1 M por año) **hay que pedirlo**; Google cobra 15 % en suscripciones | HECHO conocido (verificar en developer.apple.com/app-store/small-business-program) | No | Fundador | 0 | Antes del primer cobro |

### 1.F Anuncios (AdMob en EE. UU.)

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| F1 | Ya está: nunca a menores de 13 (el SDK ni se inicia); anuncios **no personalizados** para todos; clasificación G; 13–17 con `tagForUnderAgeOfConsent`; el formulario de Google (UMP) aparece en los estados de EE. UU. que lo exigen | HECHO: `src/util/anuncios.ts` | — | — | — | — |
| F2 | En AdMob → Privacidad y mensajes: crear el mensaje de **estados de EE. UU.** (dos clics); con anuncios no personalizados no hay «venta» ni «compartir» para publicidad dirigida | INFERENCIA (no se leyó la ayuda de AdMob sobre «restricted data processing» el 14-11) | No | Fundador | 0 | Al abrir AdMob |
| F3 | Si algún día se personalizan los anuncios para adultos en EE. UU.: aviso de «no vender ni compartir», respeto a Global Privacy Control donde aplique, y nunca a menores de 18 conocidos (Connecticut) | INFERENCIA | No | — | — | — |

### 1.G Propiedad intelectual

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| G1 | **Biblias en inglés**: BSB (dominio público desde 2023), WEB (dominio público; el **nombre** «World English Bible» es marca de eBible y solo se usa con el texto sin cambios), KJV (dominio público en EE. UU.; la Corona británica tiene derechos solo en el Reino Unido) | HECHO: `docs/LEGAL.md` (ebible.org); INFERENCIA sobre la KJV y la marca WEB (verificar en ebible.org/web/copyright.htm) | No | Claude (verificar que el texto WEB no se cambió) | 0 | 05-12 |
| G2 | **Música**: Kevin MacLeod, CC BY 4.0, con crédito: vale en EE. UU. igual. Al difundir en YouTube o TikTok puede haber reclamos automáticos falsos: guardar la licencia a mano | HECHO: `docs/LEGAL.md` | No | — | 0 | — |
| G3 | **Marca «SENDA» en la USPTO**: «SENDA» (estilizada) registrada el 30-09-2025 por Bonthe Group (China), clase 9, **instrumentos de medición** (niveles, cintas métricas); «SENDA» de Senda Athletics (clases 25 y 28) **cancelada** el 17-04-2026; hay otra solicitud viva (serie 98898550) que TSDR no dejó leer (403). En la App Store de EE. UU. no apareció una app «Senda»; sí Uplode (de Senda, LLC, encuestas) y SendaRide (traslados). INFERENCIA: choque bajo para «SENDA BIBLIA Y JUEGOS» / «Senda: Bible & Games» en las clases 9 y 41 | HECHO: TSDR sn98898553 y sn88363365 (14-11-2026); búsqueda web | No | [abogado EE. UU.] para una búsqueda completa | A cotizar | Antes de invertir en difusión en EE. UU. |
| G4 | **Marca «LANY»**: registrada en EE. UU. por LANY Music, LLC (la banda), reg. 5718771, **viva** (declaración de los arts. 8 y 15 aceptada el 05-08-2025), clases 9 (grabaciones y música descargable), **16 (pósters, calcomanías, stickers)** y 41 (shows, sitio de música). «Juegos en línea» fue **borrado** de la clase 41 | HECHO: TSDR sn87343405 (14-11-2026). INFERENCIA: riesgo bajo para una mascota dentro de una app; **medio** para stickers o merchandising con el nombre «LANY» solo en EE. UU.: no vender stickers con el nombre en EE. UU. | No | Fundador decide | 0 | — |
| G5 | **Registrar en la USPTO**: tasa base **USD 350 por clase** (desde el 18-01-2025); quien vive fuera de EE. UU. tiene que ir con **abogado matriculado en EE. UU.**; Argentina no está en el Protocolo de Madrid (presentación directa). **Prioridad del Convenio de París**: 6 meses desde la presentación en el INPI (si se presentó ~10-11-2026, hasta ~10-05-2027) para presentar en EE. UU. con la fecha argentina | HECHO (tasas: Perkins Coie, Finnegan); abogado obligatorio: 37 CFR 2.11 (de conocimiento, verificar); Madrid y París: HECHO conocido (verificar en wipo.int) | No | Fundador + [abogado EE. UU.] | 350 × clase + honorarios (a cotizar) | Antes del ~10-05-2027 para usar la prioridad |
| G6 | **Patentes (nuevo con EE. UU.: las patentes son territoriales)**: la US 10.339.825 (competencias académicas en línea; Interstellar Inc. demandó a Kahoot! en Texas, causa 1:24-cv-00727; la revisión en la USPTO fue denegada en julio de 2025; Kahoot! llevó el tema a la Corte Suprema, causa 26-198) puede leerse sobre la **sala en vivo** y los torneos en vivo | HECHO: expedientes citados (fuentes secundarias). INFERENCIA: probabilidad baja para una app chica, daño alto (defenderse cuesta mucho más que la app) | **Sí para la sala en vivo en EE. UU.** (hasta revisar) | Claude (apagar por país); [abogado de patentes] si se quiere prender | A cotizar | 05-12 |

### 1.H Concursos y premios

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| H1 | Sorteos (azar) con premios: **Nueva York y Florida** exigen registro y fianza si los premios suman más de USD 5.000 (tasa ~USD 100 por estado y fianza ~2 % del premio, según guías); Rhode Island y otros con reglas propias; bases oficiales, «no hace falta comprar», estados excluidos | HECHO (fuentes secundarias: Klein Moynihan, Sweeppea); verificar en NY Department of State y Florida Division of Consumer Services | No (si no hay premios) | — | — | — |
| H2 | Concursos de habilidad (torneos): sin el registro de sorteos, pero algunos estados restringen concursos con pago de entrada | INFERENCIA [abogado EE. UU.] | No | — | — | — |
| H3 | **Recomendación**: en EE. UU., torneos y copas **sin premios materiales** al lanzar; «10 kits por puntos» solo en Argentina con sus bases | INFERENCIA | — | Claude (texto de bases que excluya EE. UU.) | 0 | 05-12 |

### 1.I Idioma, ficha y contacto

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| I1 | Ficha en inglés (en-US) en las dos tiendas: nombre (30), subtítulo o descripción corta (80), descripción (4.000), palabras clave (100, Apple), capturas en inglés (iPhone 6,9"/6,5"; Play 4–8), URL de privacidad y soporte en inglés. **Que diga la verdad**: Biblia entera en inglés (BSB/WEB/KJV), trivia entera, lecciones parciales (23 de 102 rutas) | HECHO: Apple 2.3 (metadatos exactos); FTC Act art. 5 | **Sí** | Claude redacta; fundador carga | 0 | 01-12 |
| I2 | Sumar la localización en español (México o la que permita la tienda) en la ficha de EE. UU.: hay un público hispano grande que ya puede usar todo Senda | INFERENCIA (oportunidad, no obligación) | No | Claude | 0 | 01-12 |
| I3 | Correo de soporte y página de contacto en inglés; una dirección (la de Play, C14) | HECHO: Apple 1.2 y 5.6.2 | **Sí** | Fundador | 0 | 01-12 |
| I4 | No hace falta un agente registrado ni domicilio en EE. UU. para publicar como persona física (no hay figura de «trader» como en la UE) | INFERENCIA (no se encontró ninguna exigencia de las tiendas para EE. UU.) | — | — | — | — |

### 1.J Otros

| # | Requisito | Base | ¿Bloquea? | Quién | Costo | Plazo |
|---|---|---|---|---|---|---|
| J1 | **Accesibilidad (ADA)**: los tribunales están divididos sobre si una app sin local físico es «lugar público»; para un desarrollador extranjero sin presencia el riesgo es bajo. Buena práctica: letra grande, lector de pantalla, contraste (Senda ya prueba con letra grande) | INFERENCIA | No | Claude | 0 | Continuo |
| J2 | Leyes de chatbots de compañía (California SB 243, Nueva York): Senda no tiene un chatbot que converse (Lany no habla; la IA solo arma preguntas del sermón para adultos) → no aplica | INFERENCIA | No | — | — | — |
| J3 | Difusión pagada o con creadores en EE. UU.: las guías de la FTC sobre recomendaciones exigen que se diga que hay pago o regalo | HECHO conocido (FTC Endorsement Guides) | No | Fundador | — | Al difundir |
| J4 | Política de uso de Anthropic: la trivia del sermón ya es solo para adultos | HECHO: `docs/LEGAL.md` | — | — | — | — |

---

## 2. Cambios en la app (lista para un programador)

Por orden de importancia. Todo en `senda-app`; probar en un teléfono chico y con letra grande, en los tres idiomas.

1. **Señales de edad de las tiendas** (`npx expo install expo-age-range`; docs de Expo SDK 57):
   - iOS: permiso `com.apple.developer.declared-age-range` en `app.json` (`ios.entitlements`) y la capacidad «Declared Age Range» en el
     App ID (la prende el fundador o EAS con las credenciales). Requiere Xcode 26.
   - Llamar `requestAgeRangeAsync({ threshold1: 13, threshold2: 16, threshold3: 18 })` al abrir por primera vez y al entrar a Comunidad;
     en Android, antes `requestAgeSignalsAccessAsync()` y seguir solo con `SHARED`.
   - **Cuidado**: por debajo de iOS 26 la librería devuelve `lowerBound: 18`: tratarlo como «desconocido», nunca como adulto.
   - Regla: **gana la franja más baja** entre la tienda y la pregunta de la bienvenida. Si la tienda dice menor de 13, perfil `menos13`
     (sin cuenta; si ya la tenía, borrarla con la función `borrar-cuenta`).
   - Guardar solo la franja (nunca la fecha ni el método) y no mandarla a PostHog (términos de Play y art. 121.055 de Texas).
   - Cambios significativos: en iOS, `getRequiredRegulatoryFeaturesAsync()` y, si incluye `significantAppChangeRequiresAdultNotification`,
     `showSignificantUpdateAcknowledgmentAsync()`; en Android, leer `significantChangeStatus`. Si un padre rechaza o revoca: Comunidad
     apagada para esa persona.
   - Notificaciones del servidor de App Store (retiro del consentimiento): una función de borde de Supabase que las reciba y marque la cuenta.
   - Agregar la «lista de cambio significativo» al proceso de cada APK/IPA: si cambia la política, los términos, la clasificación, se
     suma un cobro o cambia la función, avisar antes en Play Console y en App Store Connect.
2. **La pregunta de edad, obligatoria antes de cualquier dato en la nube**: sacar «Saltar» del paso `edad` en `Bienvenida.tsx` o, si
   se mantiene, que `asegurarCuenta()` en `cuenta.ts` lance `ErrorCuenta("sin_edad")` cuando `perfil.edad` es `null` y pida la edad ahí.
   Sin opción marcada por defecto. Si se eligió «Menos de 13», no dejar cambiarla desde la bienvenida (solo desde Ajustes con la señal
   de la tienda).
3. **País de la tienda** (`StoreKit Storefront.countryCode` en iOS; `getBillingConfig().countryCode` de Play Billing en Android; de
   respaldo, la región del teléfono): un `paisTienda()` en `src/util/` que encienda las reglas de EE. UU.:
   - **Opción A**: Comunidad solo 18+ (13–17: Biblia, Travesía y juegos solos; revisar si las copas necesitan cuenta y, si la
     necesitan, dejarlas para 18+ en EE. UU. o hacerlas sin cuenta).
   - Sala en vivo y torneos en vivo apagados (patente, G6); torneos y copas sin premios (H3).
4. **Voz de menores de 13**: en `src/util/escucha.ts`, `requiresOnDeviceRecognition: true` cuando `perfil.edad === "menos13"`; si el
   teléfono no tiene reconocimiento local, ocultar el micrófono en «Nombres por letra». Para todos, decir en la política que el
   reconocedor del teléfono puede mandar audio a Google o Apple si no es local.
5. **Auditoría de red con el perfil «menos13»** (registro de pedidos en la vista previa y en el emulador): que no salga ningún
   identificador persistente guardado con un perfil (encuesta anónima, copas, versículo del día). Lo que haga falta para que funcione
   (evitar votos dobles) se guarda sin perfil y se borra.
6. **Consentimiento para datos que pueden revelar la fe**: en la hoja de normas al crear la cuenta, una casilla aparte, sin marcar:
   «Entiendo que unirme a grupos e iglesias en Senda puede mostrar mi fe, y acepto que Senda guarde esos datos para que funcionen»; en
   el «sí» de estadísticas, la misma idea. Guardar la versión aceptada (ya se guarda la de las normas).
7. **Textos legales en inglés** (`contenido/legal.json` → `scripts/sitio_web.py` → `web/`): privacidad, términos, normas,
   borrado de cuenta; sección de EE. UU. con COPPA (qué hace Senda si se entera de que un menor de 13 tiene cuenta: la borra), estados
   (derechos de acceso, corrección, borrado; contacto), consentimiento de datos sensibles, renovación automática, agente DMCA y política de
   reincidentes, **aviso del art. 230(d)** («Existen controles parentales comerciales —equipos, software o filtros— que pueden ayudar a
   limitar el acceso de menores a material dañino; ver …» con un enlace a una página pública sobre controles parentales de Apple y
   Google), ley aplicable. Página de normas contra el abuso infantil (C13).
8. **Pantalla de suscripción para EE. UU.** (ROSCA y California): precio en USD, período, renovación automática, cómo cancelar (enlace a
   las suscripciones de la tienda), «Restaurar compras», casilla o botón que acepte la renovación de forma expresa y una pantalla de
   acuse después de comprar con cómo cancelar.
9. **Contacto visible** en Ajustes y en las normas: correo de soporte y página de contacto (Apple 1.2).
10. **`app.json`**: textos de permisos localizados (InfoPlist en inglés y portugués); quitar los de ubicación «siempre» si no se usan;
    `ITSAppUsesNonExemptEncryption: false` si no está.
11. **Ficha en inglés y capturas en inglés** (vista previa con `?lang=en` o equivalente); textos de la Seguridad de los datos y
    etiquetas de Apple con el dato sensible si corresponde.
12. **`docs/LEGAL.md`, `docs/TIENDAS.md`, `docs/ANUNCIOS.md` y `docs/SEGURIDAD.md` al día** con EE. UU. (países, señales de edad,
    protocolo NCMEC, agente DMCA, patentes).

ESTIMACIÓN de trabajo de Claude (método: tamaño comparable a las pruebas 49 y 51, que hicieron borrado, moderación y edad en una
sesión cada una): 2 a 3 sesiones para los puntos 1 a 6, una para 7 a 12. El punto 1 no se puede probar del todo en la vista
previa: hace falta un iPhone con iOS 26 y un Android con Play Store (y el administrador de señales falsas de Google para probar).

---

## 3. Tareas del fundador, en orden

| Orden | Qué | Cuándo | Costo |
|---|---|---|---|
| 1 | **Decidir opción A o B** para los adolescentes de 13 a 17 en EE. UU. (recomendado: A al lanzar, B en enero si un abogado la avala) y si la sala en vivo se apaga en EE. UU. | Ya (antes del 18-11) | 0 |
| 2 | Correo de soporte y domicilio que se va a mostrar (Play muestra la dirección física de una cuenta personal que cobra) | Antes del 25-11 | 0 |
| 3 | App Store Connect → Agreements, Tax, and Banking: Paid Apps Agreement, **W-8BEN** (CUIT/CUIL como número fiscal extranjero), cuenta bancaria; pedir el **Small Business Program**; preguntar a Apple si retiene impuesto de EE. UU. sobre las ventas a usuarios de EE. UU. | Antes del 01-12 | 0 |
| 4 | Apple Developer → Identifiers → capacidad **Declared Age Range** en el App ID; App Store Connect → cuestionario de **clasificación por edad** nuevo; URL de notificaciones del servidor (la da Claude); disponibilidad en EE. UU.; ficha en-US y es-MX | Antes del 01-12 | 0 |
| 5 | Play Console → Países y regiones: **EE. UU.**; página **Age signals**; clasificación por edad de Premium y Max; público objetivo 13+; Seguridad de los datos; ficha en-US | Antes del 01-12 | 0 |
| 6 | Publicar el sitio con las páginas en inglés (`web/`) | Antes del 01-12 | Dominio ya previsto |
| 7 | AdMob: mensaje de estados de EE. UU.; en impuestos, «Foreign Publisher with no US Activities» (o el 8233 si lo pide) | Al abrir AdMob | 0 |
| 8 | Registrar el **agente DMCA** en dmca.copyright.gov (puede ser él mismo, con correo y domicilio) | Antes del 18-12 | USD 6 |
| 9 | Probar en un iPhone con iOS 26 y en un Android la señal de edad (APK/IPA de prueba) | 01 al 05-12 | 0 |
| 10 | **Regla de corte del 05-12**: si las señales de edad no andan en los dos, EE. UU. pasa a enero | 05-12 | 0 |
| 11 | [contador] cómo se facturan y tributan en Argentina los ingresos de EE. UU. y si se pierde lo retenido | Antes del primer cobro | Honorarios |
| 12 | [abogado EE. UU.] (opcional para el 18-12, necesario para la opción B y para la marca): una consulta sobre A11 (redes para menores), B5 (Connecticut) y E9 (suscripciones); búsqueda de marca y presentación en la USPTO con prioridad de París antes del ~10-05-2027 | Enero de 2027 | A cotizar (pedir 2 presupuestos de tarifa fija) + USD 350 por clase |
| 13 | Patentes: si se quiere la sala en vivo en EE. UU., una búsqueda de libertad de operación sobre la US 10.339.825 | Cuando la sala tenga uso que lo justifique | A cotizar |

---

## 4. Riesgos residuales

1. **Texas SB 2420 puede cambiar** con la sentencia del Quinto Circuito (o volver a la Corte Suprema). Si cae, la integración igual
   sirve para California, Alabama, Utah y Luisiana. Riesgo de que la integración sobre (no de que falte).
2. **Las APIs de edad están en beta** (Play) o cambian seguido (Expo avisa «más cambios incompatibles» por eso). Mantenerlas al día en
   cada SDK.
3. **«Mixed audience» depende de los hechos**: si la FTC mira la mascota, los juegos y la difusión (por ejemplo, videos para chicos) y
   concluye que el público principal son niños, Senda tendría que pedir permiso verificable a los padres para todo. Mitigación: difusión
   dirigida a jóvenes y adultos, nunca a chicos; ficha y capturas sin tono infantil.
4. **Redes para menores**: si se elige la opción B sin opinión legal, Mississippi y Tennessee pueden exigir verificación de edad y
   permiso parental; Nebraska, herramientas de supervisión para padres. Los fiscales apuntan a plataformas grandes (INFERENCIA), pero
   Utah (desde 2027) da acción privada a los padres.
5. **Datos sensibles**: que un estado considere «creencia religiosa» el uso de una app bíblica es una lectura amplia pero posible.
   Mitigación: consentimiento expreso y datos mínimos.
6. **Impuestos**: la retención de Apple sobre ventas a EE. UU. no está verificada; peor caso, 30 % de esos ingresos (INFERENCIA).
7. **Marca**: no hay registro en EE. UU.; un tercero podría registrar «Senda» para apps antes. La prioridad de París vence ~10-05-2027.
8. **Patentes**: las entidades que viven de patentes demandan en Texas; la sala en vivo es el blanco más probable.
9. **Contenido en inglés parcial**: reseñas malas de usuarios de habla inglesa si la ficha promete más de lo que hay.
10. **Pocos usuarios de EE. UU. al principio** (INFERENCIA): el costo de cumplir es casi todo trabajo de Claude; el costo en dinero
    es chico (USD 6 + honorarios opcionales). La relación costo/valor es buena si la difusión en EE. UU. arranca por el público hispano.

---

## 5. Fuentes (consultadas el 14-11-2026)

Primarias:
- 16 CFR 312.2 (definiciones de COPPA, incluida «mixed audience»): https://www.law.cornell.edu/cfr/text/16/312.2 (ecfr.gov bloqueado)
- COPPA modificada, Federal Register 22-04-2025 (vigencia 23-06-2025, cumplimiento 22-04-2026): https://downloads.regulations.gov/FTC-2024-0003-0281/content.htm
- Texas SB 2420, texto enrolado: https://capitol.texas.gov/tlodocs/89R/billtext/html/SB02420F.htm
- Mississippi HB 1126: https://billstatus.ls.state.ms.us/documents/2024/html/HB/1100-1199/HB1126SG.htm
- NetChoice v. Hilgers, D. Neb. 4:26-cv-3149, Memorandum and Order del 27-06-2026: https://netchoice.org/wp-content/uploads/2026/06/NE_Granting-PI-in-Part-and-Denying-in-Part.pdf
- 47 U.S.C. 230: https://www.law.cornell.edu/uscode/text/47/230
- Apple App Review Guidelines (actualizadas el 16-10-2026): https://developer.apple.com/app-store/review/guidelines/
- Apple, «Next steps for apps distributed in Texas» (04-11-2025): https://developer.apple.com/news/?id=2ezb6jhj
- App Store Connect Help, «Provide US tax information»: https://developer.apple.com/help/app-store-connect/provide-tax-information/provide-us-tax-information
- Play Age Signals API: https://developer.android.com/google/play/age-signals/overview
- Play, política de Age Signals: https://support.google.com/googleplay/android-developer/answer/16585319
- Play, leyes de tiendas de apps de EE. UU.: https://support.google.com/googleplay/android-developer/answer/16569691
- Play, impuestos a las ventas de EE. UU.: https://support.google.com/googleplay/android-developer/answer/138000
- Play, merchant of record: https://support.google.com/googleplay/android-developer/answer/7645364
- Play, impuestos por país: https://support.google.com/googleplay/android-developer/answer/9384608
- Play, contacto del desarrollador: https://support.google.com/googleplay/android-developer/answer/10840893
- Google Payments, datos fiscales de EE. UU.: https://support.google.com/paymentscenter/answer/10349995
- AdMob, impuestos de EE. UU.: https://support.google.com/admob/answer/4381375
- Expo `expo-age-range` (SDK 57): https://docs.expo.dev/versions/v57.0.0/sdk/age-range.md
- USPTO TSDR: SENDA sn98898553 (https://tsdr.uspto.gov/statusview/sn98898553), SENDA sn88363365 (…/sn88363365), LANY sn87343405 (…/sn87343405)
- FTC, HoYoverse (01-2025): https://ftc.gov/business-guidance/blog/2025/01/level-tips-businesses-ftcs-settlement-genshin-impact-developer-hoyoverse

Secundarias (marcadas así en el texto):
- Texas SB 2420, estado judicial: https://texasdatalaw.com/tracker/sb-2420/ (revisado al 13-10-2026)
- Leyes de tiendas por estado: https://www.recordinglaw.com/us-laws/age-verification-laws/app-store-age-verification-laws/ (13-08-2026)
- Utah HB 498: https://www.alstonprivacy.com/challenge-to-utahs-app-store-accountability-act-voluntarily-dismissed-following-statutory-amendments/ ; https://www.loeb.com/en/insights/passle/2026/05/update-on-utah-app-store-law--another-waiting-game
- Luisiana HB 977: https://www.techtimes.com/articles/319484/20260701/louisiana-app-store-age-law-delayed-2027-id-breach-pattern-grows.htm
- California AB 1043: https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/faq-digital-age-assurance-act-california-youth-safety-on-the-internet ; https://www.truevault.com/blog/the-california-digital-age-assurance-act
- Apple en Texas desde el 04-06-2026: https://www.iclarified.com/101073/texas-app-store-age-verification-law-takes-effect-for-new-apple-accounts
- Texas SCOPE, revisión en pleno: https://www.recordinglaw.com/news/fifth-circuit-en-banc-texas-scope-act/
- Mississippi, litigio: https://netchoice.org/netchoice-v-fitch-mississippi/ ; https://www.biometricupdate.com/202602/netchoice-back-in-appeals-court-over-injunction-on-mississippi-age-assurance-law
- Connecticut SB 1295: https://www.hunton.com/privacy-and-information-security-law/connecticut-amends-the-connecticut-data-privacy-act ; https://www.truevault.com/learn/extensive-changes-to-connecticuts-privacy-law
- Texas y Nebraska (pequeña empresa): https://www.beneschlaw.com/insight/nebraska-enacts-broad-data-protection-law-applicable-to-businesses-collecting-any-personal-data-about-nebraska-consumers/
- Clasificación por edad de Apple 2025: https://9to5mac.com/2025/07/24/apple-notifies-developers-of-new-app-store-age-rating-system/
- Child Safety Standards de Play: https://www.iubenda.com/en/help/175758-child-safety-standards-policy
- Click-to-cancel anulada y ROSCA: https://www.gibsondunn.com/wp-content/uploads/2026/02/ftc-restarts-negative-option-rulemaking-after-eighth-circuit-vacatur-enforcement-under-rosca-continues.pdf ; https://www.jdsupra.com/legalnews/ftc-click-to-cancel-rule-on-hold-but-2056488
- Tasas de la USPTO 2025: https://perkinscoie.com/insights/update/usptos-significant-restructuring-trademark-fees-takes-effect-january-18-2025
- Agente DMCA: https://blogs.loc.gov/copyright/2019/10/it-may-be-time-to-renew-your-dmca-agent-registration/
- Sorteos NY/FL: https://kleinmoynihan.com/sweepstakes-registration-and-bonding-requirements/
- Patente US 10.339.825 y Kahoot!: https://ipverse.greyb.com/litigation/cases/case-details/interstellar-inc-v-kahoot-edu-inc--1-24-cv-00727 ; https://fedcircuitblog.com/supreme-court/petitions/kahoot-as-v-interstellar-inc/
- Leyes federales pendientes: https://www.loeb.com/en/insights/publications/2026/06/childrens-online-privacy-in-2026-congress-stalls-again-ftc-signals-priorities ; https://mayerbrown.com/en/insights/publications/2026/08/childrens-privacy-mid-year-update-key-legislative-developments-and-emerging-trends-for-businesses
- Marcas «SENDA» y «LANY» (agregadores): https://trademarkdir.com/owner/lany-music-llc ; búsqueda web de apps «Senda» en la App Store de EE. UU.

Pendiente de verificar en fuente primaria antes de decidir capital: retención de Apple a no residentes sin tratado (E3); texto
operativo de California AB 1043 tras AB 1856; estado de Mississippi y Tennessee en sus tribunales; Anexo B del Schedule 2 de Apple;
37 CFR 2.11 (abogado obligatorio en la USPTO); lista de tratados del IRS.
