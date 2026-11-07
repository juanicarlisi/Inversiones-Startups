# Senda: chequeo legal para publicar en Google Play (07-11-2026)

Revisión independiente pedida por el fundador («Evaluá TODO lo legal para que todo esté ok para la publicación», 06-11-2026),
hecha por el agente `analista-regulatorio` sobre los borradores de la app (`src/datos/legal.ts`, `docs/LEGAL.md`, `docs/TIENDAS.md`,
`src/util/cuenta.ts`, `src/pantallas/Ajustes.tsx`, `supabase/migrations/20261101000000_juntos.sql`). **No es asesoramiento legal ni
contable**: lo marcado [abogado] o [contador] lo ve un profesional. Fuentes que no se pudieron leer: planalto.gov.br (bloqueado), el
texto completo de la Disp. 954/2025 en el Boletín Oficial (503; se usó el resumen oficial de argentina.gob.ar), el PDF de preguntas de
la ANPD (401).

## 0. La decisión que más simplifica (INFERENCIA)

Lanzar el 18-12 solo en Argentina y países de habla hispana; excluir en Play Console EE. UU., Brasil y la UE (con Reino Unido y Suiza)
hasta resolver cada bloque (§C). La interfaz en portugués e inglés puede quedar; se frena la distribución. Salen así: COPPA y la ley de
Texas (señal de edad de la tienda), el ECA Digital de Brasil (art. 24: cuentas hasta 16 años en redes vinculadas a un responsable) y el
RGPD (arts. 9 y 27) con el CMP certificado que pide AdMob.

## A. Lo que bloquea la publicación

1. **Borrado de cuenta** (HECHO, Play 13327111): si la cuenta se crea en la app, hay que poder borrarla dentro de la app y por un enlace
   web sin abrirla, incluidos los datos en proveedores. **Aunque sea anónima: sí** (INFERENCIA fuerte: tiene alias, código, amigos y
   grupos en el servidor; Ley 25.326 art. 16). Hoy «Borrar mis datos» solo limpia el teléfono y `grupos`, `eventos`, `torneos`,
   `encuestas` y `trivias_sermon` tienen `creado_por` sin `on delete`: **borrar un usuario hoy falla**. Falta (Claude): función
   `borrar-cuenta` que anonimice o reasigne lo creado y borre el usuario; borrar en PostHog y el token de avisos; «Borrar mi cuenta» en
   Ajustes; página web con formulario y regla de retención. Fundador: publicar el sitio.
2. **Contenido de usuarios** (HECHO, Play 9876937): aceptar normas antes de crear contenido, denunciar contenido y usuarios desde la app,
   bloquear y moderar. En Senda es contenido de usuarios: alias, nombre y ciudad del grupo, rol del líder, eventos, torneos, apodo en
   salas, preguntas del sermón. Hoy: sin denuncia, bloqueo solo en pedidos de amistad, `apodo_valido` sin filtro de insultos, cuenta sin
   aceptar nada. Falta (Claude): «Normas de la comunidad» con un toque al crear la cuenta; «Denunciar» (perfil, grupo, evento, sala,
   pregunta) con motivo; bloquear desde el perfil y el duelo; filtro de palabras es/pt/en en la base; tabla `denuncias` con cola en
   «Senda para todos»; correo de soporte. Fundador: atender la cola (graves en 24 h).
3. **IA generativa** (HECHO, Play 13985936): reportar contenido ofensivo de la IA dentro de la app; la política de uso de Anthropic pide
   requisitos extra si menores acceden directo a la IA. Falta: «Reportar» en cada pregunta generada (revisión del líder y al jugar);
   leyenda «Armadas con IA y revisadas por tu líder»; generar solo 18+; reglas de contenido en el pedido a Claude.
4. **Política de privacidad** (HECHO, Play 10144311; Ley 25.326 art. 6): URL pública (no PDF) con desarrollador, contacto, datos,
   destinatarios, seguridad, retención y borrado; responsable y domicilio, fines y derechos. El borrador 0.5 no tiene responsable,
   correo, retención, Anthropic, Expo/FCM, AdMob ni transferencias a EE. UU.; dice «No usamos publicidad real» y «nunca mandamos tu
   nombre» (el alias nace del nombre de la bienvenida).
5. **Seguridad de los datos e IARC** (HECHO, Play 10787469): `docs/TIENDAS.md` §5–6 quedó viejo. Declarar: nombre (apodo), IDs de
   usuario y de dispositivo (id anónimo, token de avisos, ID de publicidad), interacciones, otro contenido de usuarios, archivos (PDF,
   procesado en el momento), ubicación aproximada (AdMob por IP), compras cuando haya, URL de borrado. IARC: «los usuarios interactúan».
6. **Menores y público** (HECHO, Play 9893335): la bienvenida ofrece «Menos de 13» y deja seguir; Comunidad no tiene freno. Falta:
   menores de 13 sin cuenta, sin token en el servidor, sin Comunidad ni salas; 13–17 con búsqueda por alias y logros apagados de fábrica;
   estadísticas con un «sí» explícito (Ley 25.326 art. 5).
7. **Términos de uso**: el 0.1 dice «versión de prueba»; faltan normas de conducta, licencia sobre lo que sube el usuario, baja de
   cuentas, IA, contacto, ley aplicable y jurisdicción; «sin garantías» y «si sigues usándola, aceptas» se tienen por no convenidas
   (Ley 24.240 art. 37) [abogado].
8. **Licencias y terceros**: la PDT figura en eBible como CC BY 4.0 (no BY-SA; confirmar la fuente); enlace a cada licencia CC
   (CC BY 4.0 §3(a)(1)(C)); Nominatim (política OSMF): User-Agent propio, máximo 1 pedido por segundo en total, apagado remoto.
   Fundador: autorización firmada del ministerio que cubra «by Nueva Generación».

## B. Antes del primer cobro

9. **Botones de arrepentimiento y de baja** (HECHO): la Disp. 954/2025 (BO 04-09-2025) derogó las Res. 424/2020 y 316/2018; los dos
   botones «a simple vista» en el primer acceso, sin registrarse; código en 24 h; sin arrepentimiento si el servicio ya se usó (art. 3);
   la Disp. 3/2026 (BO 06-02-2026) permite verificar identidad.
10. **Antes de suscribirse** (Play 9900533; Ley 24.240 art. 4): precio en moneda local, periodicidad, renovación automática, prueba
    gratis (cuándo y cuánto se cobra, cómo evitarlo), que no hace falta pagar, cómo cancelar (enlace a Suscripciones de Play),
    «Restaurar compras», en el trimestral el precio de los 3 meses en grande y el ahorro aparte; menores compran con permiso.
11. **AdMob**: solo no personalizados, clasificación máxima baja, bloquear juegos de azar, citas y alcohol, `app-ads.txt`. CMP
    certificado obligatorio solo en UE, Reino Unido y Suiza (HECHO, AdMob 13554116).
12. **AAIP** (HECHO): inscribir responsable y base, gratis, por TAD con clave fiscal nivel 2. [abogado] Ley 25.326 art. 7.3 y datos
    sensibles (convicciones religiosas): ¿un «grupo de iglesia» las revela? Mitigación: consentimiento expreso al unirse, mínimo de datos.
13. **Transferencia internacional** (art. 12): PostHog (us), Supabase, Anthropic y Expo en EE. UU.; INFERENCIA: EE. UU. no está en la
    lista de adecuados (Disp. 60-E/2016), verificar. Claude: PostHog a la UE, descartar IP, consentimiento al crear la cuenta. Fundador:
    región de Supabase y contratos (Res. AAIP 198/2023).
14. **Facturación** [contador]: monotributo antes del primer pago; AdMob → Factura E; Google **no** es «merchant of record» en Argentina
    (HECHO, Play 7645364); W-8BEN; Ingresos Brutos en CABA.

## C. Recomendable y para abrir cada país

Marcas en el INPI antes del 18-12; una hora de abogado con esta lista (ESTIMACIÓN: ARS 80–150 mil); sorteos solo con bases; quitar el
permiso de ubicación si no es indispensable; Chile Ley 21.719 desde el 01-12-2026 (verificar). Brasil: Lei 15.211 (vigente 17-03-2026),
Decreto 12.880/2026, LGPD art. 14. EE. UU.: COPPA modificada (cumplimiento desde el 22-04-2026) y señales de edad de Play. UE: RGPD
arts. 8, 9 y 27 y CMP certificado.

## Lo que hace Claude / lo que hace el fundador

- **Claude:** borrado de cuenta, denuncias y bloqueos, IA del sermón, privacidad 1.0 y términos 1.0, Seguridad de los datos e IARC,
  frenos por edad, atribuciones y Nominatim, botones de la Disp. 954, pantalla de planes, AdMob, PostHog en la UE, `docs/TIENDAS.md` y
  `docs/LEGAL.md` al día.
- **Fundador:** correo y domicilio de contacto; publicar el sitio; excluir países en Play Console; inscripción en la AAIP; región de
  Supabase y contratos; autorización del ministerio con su nombre; marcas en el INPI; abogado y contador; atender las denuncias.

## Fuentes (consultadas el 06/07-11-2026)

Play: borrado 13327111, contenido de usuarios 9876937, IA 13985936, datos de usuario 10144311, Seguridad de los datos 10787469,
Familias 9893335, suscripciones 9900533, merchant of record 7645364 (support.google.com/googleplay/android-developer/answer/<n>);
AdMob CMP 13554116; retenciones de Google (paymentscenter 10349995); Ley 25.326 (argentina.gob.ar); Disp. 954/2025 y Disp. 3/2026
(argentina.gob.ar/normativa); AAIP, registro de bases (argentina.gob.ar); Res. AAIP 198/2023 (boletinoficial.gob.ar); ECA Digital
(fuente secundaria: Estratégia OAB); COPPA (federalregister.gov, 22-04-2025); FPF sobre leyes de tiendas de apps; política de uso de
Anthropic; política de Nominatim (osmfoundation.org); PDT en eBible (spaPdDpt).
