# Parte 7: Backend (lo que corre del otro lado). Notas por día.
Contexto: el estudiante ya sabe bits, SO (procesos, archivos, permisos), terminal, programar en JS, git/npm, redes (HTTP, TLS, cookies, WebSockets, CDN; Parte 5) y frontend (Parte 6). Falta la mitad de la app que no se ve. Herramientas reales: Node 22 y npm (instalá Express, Fastify, NestJS, etc. en directorios nuevos del scratchpad; el registro responde por el proxy), Python 3.13 (FastAPI/Django con pip en un venv nuevo), Go, Rust, OpenJDK 21 (Spring Boot si baja por Maven/Gradle; si no, doc), .NET 10, PostgreSQL 16 y sqlite3 (otros redactores los instalaron; levantá tu propio Postgres en un directorio y puerto propios), Redis/Valkey si `apt` lo permite (probalo; si no, doc rotulada), curl, Playwright. Todo demo corre en localhost: servidores propios, datos INVENTADOS (nunca datos reales ni secretos reales; secretos de práctica con formato obvio de falsos). Los ejemplos ejecutables del armador son JS puro sin DOM ni red: para servidores usá `terminal` con salida real; el armador acepta `codigo` con `lang` js/ts/python/go/rust/java/csharp/sql/bash. Ya hay dos hallazgos de entorno que importan: la VM tiene proxy HTTPS y los puertos/nombres son compartidos con otros redactores (usá rangos propios, p. ej. 19xxx con el número de tu día; no uses `pkill` genérico). Versiones y tendencias llevan fecha y fuente oficial; verificá versiones vigentes al 13-11-2026 con `npm view`/`pip index`/sitio oficial. Logística: paralelos (depósito, ventanilla de despacho, ticket de cola) siempre con su límite. IMPORTANTE sobre Senda: NO tiene servidor propio. Su «backend» es Supabase (Postgres con RLS y 41 tablas, funciones RPC en SQL —unas 93—, tres funciones edge en `supabase/functions/`: `borrar-cuenta`, `trivia-sermon`, `compras`, tareas con `pg_cron` y `pg_net`, FCM para push). Todo hecho sobre Senda se verifica en /home/user/senda-app (solo lectura: `src/util/nube.ts`, `cuenta.ts`, `supabase/migrations/`, `supabase/functions/`, `.github/workflows/supabase.yml`) y `senda/mapa-tecnico.md`; no ejecutes nada contra el Supabase real (no hay credenciales y no se piden). Hallazgos ya conocidos que se pueden citar con verificación propia: reintento de red hasta ~480 s (no 10 min), políticas de `respuestas` con `with check (true)`, alta anónima sin captcha, funciones de borde sin cabeceras CORS, `compras` que nada invoca, token `senda-sesion` en AsyncStorage sin cifrar.

## 07-01 Qué es un backend y por qué hace falta
Qué hace el servidor que el cliente no puede (estado compartido, secretos, confianza, trabajo pesado, integración), frontera de confianza (todo lo que llega del cliente es no confiable: demostralo con un pedido falsificado con curl a un servidor propio de práctica), diagrama de capas con el recorrido de un pedido. Retomá [@05-18], [@06-24] (validación en cliente nunca basta). Senda: dónde está la frontera en Senda (RLS en vez de servidor propio; solo verificado en código).

## 07-02 Arquitectura cliente-servidor y otras topologías
Cliente-servidor, peer-to-peer (BitTorrent, WebRTC: conceptual), cliente grueso/delgado, servidor con estado vs sin estado, topologías (monolito, capas, 3-tier). Ejemplos del mundo con fecha/fuente. Un mini cliente-servidor por sockets corrido (retomá [@05-14]). Sin profundizar arquitecturas (Parte 12).

## 07-03 Un servidor HTTP desde cero (tipo L)
Con `net` de Node (o Python `socket`): bucle de aceptación, parsing de solicitud (línea de pedido, encabezados, cuerpo con Content-Length), respuesta válida, un error (404, 400), keep-alive. Probado con curl y nc. Al menos 5 ejercicios con solución corrida. Retomá [@05-18], [@05-19].

## 07-04 Node.js por dentro
V8 + libuv, hilo único y bucle de eventos de Node (fases: timers, poll, check…), thread pool de libuv, `stream` y backpressure (demo de leer un archivo grande sin cargarlo entero, memoria medida), bloquear el bucle (medilo: una ruta lenta congela a las demás), `worker_threads` y `cluster` (retomá [@03-40], [@03-41], [@06-14]). Fuentes: nodejs.org docs.

## 07-05 Express: rutas, middleware y el ciclo de una petición
Instalá Express vigente (verificá versión), rutas, parámetros, middleware (orden importa), `next()`, manejo de errores, objeto request/response. Mostrá el recorrido de un pedido por la cadena con logs numerados. Alternativas (Fastify, Hono) solo nombradas con dato medido si querés (req/s de «hola mundo»: rotulado y con cuidado de no sacar conclusiones).

## 07-06 Endpoints, controladores y servicios
Capas (ruta → controlador → servicio → acceso a datos), separación de responsabilidades, refactor de un endpoint gordo a capas con el mismo comportamiento (pruebas antes y después: retomá [@04-15]), dónde NO poner lógica. Ejemplo de logística inventado (despachos).

## 07-07 Modelos, validación y DTO
Modelo de dominio vs DTO vs fila de base, validación de entrada con zod/Joi/pydantic (instalá y mostrá errores reales), «parse, don't validate», errores 400 vs 422, límites de tamaño, qué pasa sin validación (un pedido malicioso mostrado contra un servidor propio). Retomá [@06-24]. Senda: zod solo en `leerNovedades`; validación del servidor en SQL (verificá en migraciones).

## 07-08 Lógica de negocio: dónde vive
Reglas de negocio, modelo anémico vs rico, dónde poner una regla (aplicación, dominio, base: triggers/constraints), ejemplo de reglas de logística (tarifas, ventanas de entrega) implementadas en tres capas y las consecuencias de cada una. Senda: sus reglas viven en funciones SQL (RPC) y en el cliente (`src/tema.ts` reglas del juego): mostrá una regla real con rutas verificadas y dónde se duplica.

## 07-09 Autenticación I: demostrar quién sos
Autenticación vs autorización (adelanto), contraseñas, hash con sal (bcrypt/scrypt/argon2: verificá recomendación vigente de OWASP con fecha), por qué no cifrar contraseñas, ataque de diccionario y fuerza bruta (demo sobre hashes inventados con tiempos medidos: MD5 vs bcrypt/argon2), rate limiting, MFA a nivel de idea, passkeys/WebAuthn (verificá estado). Nada de contraseñas reales. Retomá [@05-21].

## 07-10 Autenticación II: sesiones contra tokens
Sesión de servidor (cookie con id, almacén), tokens (access + refresh), cookie `HttpOnly`/`Secure`/`SameSite`, dónde guardar un token en web vs móvil, revocación, ventajas y límites de cada una; implementá ambas en un servidor propio. Retomá [@05-19], [@06-38]. Senda: cuentas anónimas de Supabase y el token en AsyncStorage (hallazgo ya conocido; verificá en `src/util/cuenta.ts`).

## 07-11 Autorización: qué podés hacer
RBAC, ABAC, propiedad del recurso (IDOR / BOLA como error #1: demostralo contra un servidor propio), políticas, principio de mínimo privilegio, dónde chequear (siempre en el servidor). Senda: las políticas RLS de Postgres como autorización por fila (ejemplo real de `supabase/migrations/`) y los roles de grupo (líder/ayudante/miembro) si están en SQL.

## 07-12 Errores, logs y respuestas coherentes
Manejo de errores, sobre de error uniforme (RFC 9457 problem details: verificá), logs estructurados (JSON), niveles, correlación con `request-id`, idempotencia (claves de idempotencia en POST; retomá `cliente_id` de Senda con `on_conflict`/`ignore-duplicates` ya visto en [@05-18]), no filtrar secretos en logs (demo de qué pasa si se loguea un token). Mostrá un servidor con logs reales.

## 07-13 Procesamiento asíncrono: jobs y workers
Por qué sacar trabajo del ciclo pedido-respuesta, job, worker, cola de trabajos, reintentos con espera, trabajos fallidos (dead letter), idempotencia del worker. Implementá una cola mínima en proceso y una con base (tabla + `SELECT … FOR UPDATE SKIP LOCKED` en PostgreSQL local). Herramientas reales solo nombradas (BullMQ, Celery, Sidekiq) con doc oficial.

## 07-14 Colas de mensajes y eventos
Cola vs publicación-suscripción, broker (RabbitMQ, Kafka, SQS, NATS: conceptual con diferencias verificadas en doc oficial), entrega al menos una vez/como mucho una vez y mensajes duplicados (demostrá un duplicado y cómo lo absorbe la idempotencia), orden, particiones. Si podés, corré un broker liviano (NATS o similar bajado como binario) en localhost; si no, simulación rotulada.

## 07-15 Caching en el backend
Cache-aside, write-through, TTL, invalidación («solo hay dos cosas difíciles»: atribuí bien o no uses la cita), estampida de caché, Redis/Valkey (primera vista: instalalo con apt si es posible; estructuras básicas, expiración), medí latencia con y sin caché sobre un Postgres local. Licencias de Redis (cambio de licencia 2024/2025 y Valkey): verificá en fuentes oficiales con fecha. Retomá [@05-19] (caché HTTP).

## 07-16 Archivos: subidas, almacenamiento de objetos y streaming
Subida de archivos (multipart: mostrá el cuerpo crudo), límites y validación (tipo real vs extensión, tamaño), almacenamiento de objetos (S3 y compatibles: concepto, claves, URL firmada: implementá una firma HMAC de juguete), streaming con rangos HTTP (`Range`/206: demostralo), antivirus/escaneo a nivel de idea. Senda: Storage de Supabase solo si se usa (verificá con grep) y la trivia del sermón desde PDF (`trivia-sermon`: leé el código).

## 07-17 Comunicación entre servicios
Llamada síncrona entre servicios, timeouts, reintentos con espera y jitter (AWS Architecture Blog: verificá), circuit breaker (implementá uno chico y mostrá sus estados), propagación de fallos, `Retry-After`. Demo: un servicio B lento y un A que se protege. Retomá lo de reintentos de Senda ([@05-31]).

## 07-18 Tareas programadas y procesos de fondo
`cron` (sintaxis, zonas horarias, DST), tareas programadas en la nube, ejecución única (locks distribuidos a nivel de idea; advisory locks de PostgreSQL probados), tareas perdidas, idempotencia. Senda: `pg_cron` y `limpieza.yml` (cron de GitHub Actions) con rutas verificadas.

## 07-19 Configuración y entornos del servidor
Configuración por entorno (dev/staging/prod; retomá [@04-06]), secretos (gestores: Vault, AWS Secrets Manager, variables de plataforma: doc oficial), feature flags (implementá uno chico; ya viste [@04-21]), configuración validada al arrancar (fallar rápido). Senda: secretos de GitHub Actions y `EXPO_PUBLIC_*`, y qué NO es secreto (la clave anónima).

## 07-20 NestJS
Qué agrega sobre Express/Fastify, módulos, proveedores, inyección de dependencias (retomá [@06-29]), decoradores, pipes/guards/interceptors. Instalá `@nestjs/cli` si anda y generá una app chica; mostrá el árbol y una petición. Versión vigente verificada.

## 07-21 Python en el backend: FastAPI y Django
ASGI/WSGI, FastAPI (tipado, validación automática con pydantic, OpenAPI generado: mostralo), Django (baterías incluidas: ORM, admin, migraciones), asyncio vs hilos en Python (GIL: estado según [@03-40]/[@03-49]). Corré ambos en un venv propio con un endpoint equivalente y compará código y salida. Versiones verificadas.

## 07-22 Java y Spring Boot
JVM en el servidor, Spring/Spring Boot, beans, inyección, JPA/Hibernate, contenedores de aplicaciones (Tomcat embebido), por qué Java domina en empresas grandes (dato con fuente o sin afirmar). Intentá generar un proyecto con Spring Initializr (start.spring.io responde por el proxy?) y compilar con OpenJDK 21; si no es posible, doc y rotulá. Retomá [@03-50].

## 07-23 .NET y ASP.NET Core
ASP.NET Core, Kestrel, Minimal APIs y controladores, Entity Framework Core, inyección de dependencias integrada. Corré `dotnet new webapi` con el SDK 10 instalado y mostrá una petición. Retomá [@03-53]. Licencia y multiplataforma (verificá en doc oficial).

## 07-24 Go, Rust, Ruby y PHP: otras alternativas
Servidor HTTP en la biblioteca estándar de Go (retomá [@03-54]) y en Rust con un framework mínimo (axum/actix si baja por cargo; si no, `std::net`), Rails y Laravel («convención sobre configuración»: solo doc salvo que puedas instalarlos), cuándo cada uno. Comparativa medida de un «hola mundo» con la salvedad de que no es un benchmark serio (rotulado).

## 07-25 Backend como servicio: Supabase y Firebase
BaaS, autenticación gestionada, reglas de seguridad (RLS de Postgres vs reglas de Firestore: contraste con doc oficial), qué se gana (velocidad, cero servidores) y qué se paga (dependencia de proveedor, límites, modelo de costos con precios FECHADOS y fuente), alternativas (Appwrite, PocketBase: doc). Senda es el caso real: verificá cómo usa Supabase (41 tablas, RPC, edge, pg_cron). Sin recomendaciones de compra.

## 07-26 Funciones serverless y edge
Función serverless, arranque en frío (medilo con un contenedor/proceso local que simule arranque o Deno/Node), edge functions (Deno en Supabase; Cloudflare Workers: doc), límites (tiempo, memoria), cuándo conviene. Senda: leé las tres funciones de `supabase/functions/` (qué hacen, su runtime Deno, cabeceras CORS ausentes, 405 a no POST).

## 07-27 Elegir tecnología de backend
Criterios (equipo, talento disponible, madurez, ecosistema, costo oculto, operación), matriz de decisión con puntajes rotulados como opinión, errores típicos (reescribir en otro lenguaje, microservicios prematuros), aplicado a un caso inventado de logística y al caso Senda (por qué le sirve Supabase hoy y qué señales dirían cuándo no). Encuestas con fecha (Stack Overflow 2026, JetBrains, etc.) si las verificás.

## 07-28 Laboratorio: una API mínima con autenticación y base de datos (tipo L)
Construí una API de punta a punta (Node/Express o Fastify + PostgreSQL local o SQLite): registro y login con hash, sesión o token, endpoints protegidos, autorización por dueño, validación, logs y una prueba de punta a punta; todo corrido y con salidas reales; al menos 5 ejercicios con solución. Dejá en el scratchpad el código completo y mostralo en el día en bloques.

## 07-29 Senda no tiene un servidor propio: qué hace la base en su lugar (tipo S)
Cómo una app sin servidor hace lo que haría un backend: RLS (políticas de `supabase/migrations/`), RPC de base de datos (funciones SQL con `security definer`: verificá y mostrá una real; riesgos), funciones edge, pg_cron/pg_net para push y limpieza, validación y reglas en SQL. ≥2 bloques `senda`, ≥4 archivos reales. Incluí los hallazgos ya conocidos con verificación propia, sin exagerar (marcá qué es riesgo real y qué es diseño aceptable).

## 07-30 Cierre de la Parte 7: la vida de una petición en el servidor (tipo R)
Mapa del backend (de la conexión al dato y de vuelta: recepción, middleware, autenticación, autorización, validación, lógica, datos, caché, colas, respuesta, logs), caso recorrido de punta a punta (pedido inventado de logística), tabla «pregunta típica → día», 8–12 preguntas. Escribilo al final.
