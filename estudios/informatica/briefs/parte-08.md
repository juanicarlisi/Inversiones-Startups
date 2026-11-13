# Parte 8: APIs e integración entre sistemas. Notas por día.
Contexto: el estudiante ya sabe redes y HTTP (Parte 5), frontend (Parte 6) y backend (Parte 7: Express, capas, validación, autenticación y sesiones/tokens, errores y logs, colas, caché, servicios, BaaS, Senda sin servidor propio). Esta parte es el contrato entre sistemas. Herramientas reales: Node 22 y Python 3.13, curl, Postgres 16 propio (en /var/tmp, no en /tmp/claude-0 porque es modo 700), `openssl` para HMAC, Protobuf (`protoc` por apt si baja, o `protobufjs`/`@bufbuild/protobuf` por npm), `graphql` por npm, `@grpc/grpc-js` por npm, OpenAPI tooling por npm (`@apidevtools/swagger-parser`, `openapi-typescript`, `@stoplight/spectral-cli` si anda), Playwright. Todo demo corre en localhost con datos INVENTADOS y secretos falsos con formato obvio; nada contra servicios reales de terceros ni con cuentas (no hay credenciales y no se piden). Para ver el formato de un proveedor real (Stripe, GitHub, Twilio) usá su documentación oficial y reproducí el mecanismo contra un servidor local propio. Reglas del entorno: VM compartida (puertos propios 20xxx + número de tu día, nada de `pkill` genérico: matá por PID propio), `rm` con comodines bloqueado, no llenes el disco (cuidado con paquetes que clonan repos completos). Versiones y estándares con fecha y fuente oficial (RFC/IETF, OpenAPI Initiative, graphql.org, grpc.io, etc.), verificados al 13-11-2026. Logística: paralelos (remitos, EDI de transporte, contrato con un proveedor) con su límite. SENDA: sus integraciones son AdMob, FCM/Expo Push, Supabase (REST/RPC/Auth/funciones), PostHog por HTTP, Google (vincular cuenta), Anthropic (solo en la función `trivia-sermon`), API.Bible/YouVersion según el código: verificá cada una con grep en /home/user/senda-app (solo lectura) y `senda/mapa-tecnico.md`; el código manda sobre cualquier documento. Ya hay hallazgos verificados que conviene citar con tu propia verificación: reintento de red ~480 s, `Authorization: Bearer` en `cuenta.ts`, `on_conflict`/`ignore-duplicates` y `cliente_id` para idempotencia, funciones de borde sin CORS, claves `anon`/`service_role` en retirada, `enviar_avisos` a lo sumo una vez vía `pg_net`.

## 08-01 Qué es una API
API como contrato, API de biblioteca vs API web, interfaz vs implementación, acoplamiento, quién consume (otro código), contrato y compatibilidad, API pública/privada/interna. Ejemplos de la vida real con logística (un sistema de seguimiento que otro sistema consulta). Retomá [@07-01] y [@03-18]. Un mismo servicio llamado como biblioteca y como API web, corrido.

## 08-02 REST I: recursos, URLs y métodos
Fielding 2000 (verificá la tesis: capítulo 5), recursos y representaciones, URLs como sustantivos, métodos seguros e idempotentes (RFC 9110: verificá), qué NO es REST (RPC sobre HTTP), niveles de madurez de Richardson (atribuí con cuidado). Diseñá y corré una API de despachos con curl. Retomá [@05-18], [@07-05].

## 08-03 REST II: códigos de estado, paginación y filtros
Códigos de estado correctos (201+Location, 204, 400/401/403/404/409/422/429), paginación (offset vs cursor: medí el costo de offset grande sobre 300.000 filas en Postgres local), filtros y ordenamiento, HATEOAS (qué es y por qué casi nadie lo implementa), `ETag`/`If-Match` para concurrencia optimista. Retomá [@05-19], [@07-12].

## 08-04 JSON, XML, Protobuf y otros formatos
JSON (RFC 8259), JSON Schema (validá un documento real), XML, Protobuf y serialización binaria (tamaño y tiempo medidos del mismo dato en JSON, MessagePack/CBOR y Protobuf), compatibilidad de esquemas (agregar campos), `Content-Type`, números grandes en JSON (precisión de JS: retomá [@01-xx] según corresponda). Senda: JSON en `contenido/*.json` y el formato `.bib` de las Biblias (verificá `scripts/biblias.py`).

## 08-05 Autenticación de APIs: claves, bearer y firmas
API key vs bearer token vs firma HMAC (implementá firma de solicitud con `openssl` y Node y verificala del otro lado; incluí protección contra repetición con marca de tiempo), qué protege cada una y qué no, dónde viajan, rotación y alcance. Retomá [@07-09], [@07-10], [@07-19]. Senda: la clave `anon`/`publishable` NO es secreta (verificá la doc de Supabase con fecha) y el token de sesión de `cuenta.ts`.

## 08-06 OAuth 2.0 y OpenID Connect
Roles, flujo de código de autorización con PKCE (RFC 6749, 7636, 9700 si aplica: verificá), tokens, scopes, OIDC (ID token), por qué no «implicit», proveedores de identidad. Implementá un proveedor de juguete en Node local (autorización + PKCE + token) y un cliente que lo use; mostrá el intercambio paso a paso. Senda: PKCE en `src/util/cuenta.ts` (SHA-256) y `vincularGoogle` (verificá qué parte es real y cuál no está activada).

## 08-07 JWT por dentro
Estructura (header.payload.firma), claims (`iss`, `sub`, `aud`, `exp`, `iat`), HS256 vs RS256/ES256, verificación completa (no solo firma), ataques (`alg: none`, confusión HS/RS, claves débiles: demostralos contra un verificador de práctica y mostrá el arreglo), por qué no guardar secretos en un JWT (está codificado, no cifrado), revocación. RFC 7519 y 8725 (verificá). Retomá [@07-10]. Senda: los JWT de Supabase Auth y el campo `eyJ` en `nube.ts` (verificá qué hace).

## 08-08 GraphQL
Esquema, queries y mutaciones, resolvers, el problema N+1 y DataLoader (medilo contando consultas a Postgres local), sobrefetch/subfetch frente a REST, costos (consultas profundas, límites de complejidad), cuándo conviene. Corré un servidor con `graphql` por npm. Senda no usa GraphQL (verificá con grep) pero PostgREST/pg_graphql: verificá si pg_graphql aparece.

## 08-09 RPC, gRPC y tRPC
RPC clásico, gRPC (HTTP/2, Protobuf, streaming: retomá [@05-20], [@08-04]), definición de servicio `.proto`, generación de código, tRPC (tipos de punta a punta con TypeScript), cuándo gRPC y cuándo REST. Corré un servidor y cliente gRPC en Node local y mostrá bytes en el cable si podés (tshark en loopback). Senda: las RPC de Supabase (`/rest/v1/rpc/`) son «RPC sobre HTTP/JSON», NO gRPC: mostralo con una llamada real del código.

## 08-10 Webhooks
Push de eventos entre sistemas, por qué existen, firma del webhook (HMAC con marca de tiempo: implementá el verificador, incluí el ataque de repetición), reintentos del emisor, idempotencia del receptor (retomá [@07-12], [@07-14]), orden y duplicados, qué pasa si el receptor está caído. Servidor emisor + receptor locales con una caída simulada. Senda: ¿recibe webhooks? (RevenueCat/Play: verificá con grep; la función `compras` es candidata).

## 08-11 Tiempo real: WebSockets, SSE y push
Elegir entre polling, long polling, SSE, WebSocket (retomá [@05-26]), push móvil (FCM y APNs: doc oficial, fecha), difusión y salas, escalado de conexiones (sticky, pub/sub entre nodos: conceptual). SSE implementado local con reconexión y `Last-Event-ID`. Senda: polling de 2/8/45 s y la publicación `supabase_realtime` sin clientes; push vía Expo/FCM con `pg_net` (verificá `enviar_avisos`).

## 08-12 Límites de uso, cuotas y abuso
Rate limiting (token bucket y ventana deslizante: implementá ambos, probalos con una ráfaga), cuotas, 429 y `Retry-After` (RFC 6585 + el borrador RateLimit headers: verificá estado), límites por clave/IP/usuario, abuso y scraping, el lado del cliente (backoff con jitter: retomá [@07-17]). Senda: topes en SQL (códigos fallidos, 20/h; atributos en `respuestas`) y su ausencia donde corresponda (verificá `unirse_grupo`).

## 08-13 Versionado y evolución de APIs
Cambios compatibles vs incompatibles, versión en URL/cabecera/campo, deprecación (`Deprecation` y `Sunset`: RFC 8594 y 9745 si están vigentes: verificá), compatibilidad hacia atrás y adelante (Postel y sus críticas), contratos de consumidores. Demo: un cliente viejo contra un servidor que cambió. Senda: versionado del cliente móvil vs la base (migraciones; `version_app` fija en «0.13»: hallazgo conocido) y cómo se evita romper APKs viejos (verificá en SQL/código).

## 08-14 Documentación y contratos: OpenAPI, Postman y SDK
OpenAPI 3.1 (verificá versión vigente 3.2 si existe), escribí la especificación de la API de despachos, generá tipos y un cliente (`openapi-typescript`), validá con Spectral, pruebas de contrato (qué son y un ejemplo con Pact o similar), Postman/Bruno/Insomnia (doc), SDKs generados. Retomá [@04-23]. Senda: PostgREST publica su OpenAPI en la raíz de `/rest/v1/` (verificá en la doc; no lo llames).

## 08-15 Integrar un servicio de terceros: qué pasa por dentro
Adaptador/anti-corruption layer, dependencia de proveedor, qué pasa cuando el tercero cae o cambia (degradación elegante, timeouts, fallback, cola), costos y límites, monitoreo, contratos legales/ToS a nivel de idea. Implementá un adaptador con un tercero simulado y probá fallos. Senda: cada integración con su módulo (`nube`, `metricas`, `avisos`, `almacen`: regla 13 de su CLAUDE.md: verificá en `src/util/`) y la regla de «cada proveedor detrás de su módulo».

## 08-16 Integración empresarial
EDI (X12, EDIFACT: ejemplo de un mensaje de transporte inventado), bus de servicios, iPaaS (MuleSoft, Zapier, n8n: doc), sistemas legados (SOAP/WSDL, archivos por SFTP, bases compartidas), patrones de integración empresarial (Hohpe y Woolf: verificá), ETL a nivel de idea (adelanto de la Parte 18). Corré un parseo de EDI/CSV con código y un SOAP mínimo si podés. Logística real: AFIP/ARCA web services en Argentina (facturación electrónica, SOAP + certificados: verificá doc oficial de ARCA con fecha; no conectes; es contexto útil para el fundador).

## 08-17 Las integraciones reales de Senda (tipo S)
Inventario verificado de cada integración externa de Senda (Supabase REST/Auth/RPC/Storage/Functions, PostHog, AdMob, FCM/Expo Push, Google Sign-In, Anthropic en `trivia-sermon`, API.Bible/YouVersion/Bible.com enlaces) con ruta, qué datos viajan, autenticación, qué pasa si cae, y su módulo; ≥2 bloques `senda`, ≥4 archivos reales; incluí los hallazgos de riesgo ya conocidos con tu verificación, sin exagerar. Revisá `package.json` para SDKs reales (verificá versiones).

## 08-18 Cierre de la Parte 8: cómo se hablan los sistemas (tipo R)
Mapa de integración (contrato → transporte → formato → autenticación → límites → versionado → documentación → fallos), un caso recorrido de punta a punta (un transportista y un sistema de pedidos), tabla «pregunta típica → día», 8–12 preguntas. Escribilo al final.
