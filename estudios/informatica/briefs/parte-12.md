# Parte 12: Arquitectura de software y sistemas distribuidos. Notas por día.
Contexto: el estudiante ya recorrió programación (POO, funcional, módulos: Parte 3), oficio (pruebas, calidad, ADR: Parte 4), redes, frontend, backend (capas, colas, caché, circuit breaker), APIs, bases (transacciones, réplicas, CAP en 09-34) y mobile. Esta parte da criterio para decidir estructuras. REGLA DE ORO: nada de dogma ni de «buenas prácticas» sin su costo; cada principio o patrón se muestra con un ejemplo CORRIDO de logística (despachos, depósitos, rutas, tarifas) en JS/TS o Python, «antes y después», con lo que se gana Y lo que se paga, y con cuándo NO usarlo. Usá bloques `ejecutable` (JS puro, sin DOM ni red, <3 s) cuando el ejemplo entre; si no, `terminal` con salida real. Para sistemas distribuidos, simulá en un solo proceso (nodos como objetos, red como cola con pérdida, demora y partición sembradas con semilla fija) o con varios procesos locales en puertos 24xxx; PostgreSQL propio en /var/tmp si hace falta (`runuser -u postgres`). Fuentes primarias: los papers y libros originales (Parnas 1972, Brooks «No Silver Bullet», GoF, Martin, Evans, Fowler, Conway 1968, Lamport 1978, Brewer/Gilbert–Lynch, Ongaro–Ousterhout Raft, DeCandia Dynamo, Garcia-Molina Sagas, Kleppmann DDIA, Deutsch falacias, Nygard, Kazman ATAM, Simon Brown C4): citá lo que LEÍSTE; si un sitio da 403, usá una copia institucional y decilo; lo de memoria va rotulado. Casos reales (12-29) solo con postmortems o posts de ingeniería oficiales fechados. Retomá con [@id] lo ya visto en vez de repetirlo (p. ej. [@07-06], [@07-17], [@08-15], [@09-24]..[@09-30], [@09-34]). SENDA aparece como caso breve donde ilustre (y el 12-31 entero): cliente React Native + Supabase sin servidor propio; lógica en funciones SQL; cada proveedor detrás de su módulo (`src/util/nube.ts`, `metricas.ts`, `avisos.ts`, `almacen.ts`); director de Lany (`src/lany/director.ts`) como bus de eventos interno; zustand como flujo unidireccional; bandeja de salida idempotente con `cliente_id`; polling en vez de tiempo real; hallazgos conocidos (pantallas de complejidad alta: `Leccion` 165, `QuienEs` 125; `sermonGrupo` importa de una pantalla; reglas duplicadas TS/SQL). Solo hechos verificados en /home/user/senda-app (solo lectura) y `senda/mapa-tecnico.md`. Entorno compartido: disco justo (nada de instalaciones de más de 200 MB; borrá por ruta exacta), `rm` con comodines y `pkill`/`kill` por patrón bloqueados.

## 12-01 Qué es la arquitectura de software
Las decisiones difíciles de revertir; atributos de calidad (rendimiento, disponibilidad, modificabilidad, seguridad, costo) y sus tensiones; arquitectura vs diseño; «depende» bien explicado. Caso inventado: la misma app de despachos con dos prioridades distintas da dos arquitecturas.
## 12-02 Complejidad, acoplamiento y cohesión
Esencial vs accidental (Brooks), acoplamiento y cohesión (Parnas: ocultar decisiones), cómo se miden a ojo y con herramientas (dependencias entre módulos: generá el grafo de un proyecto chico). Senda: grafo de imports real de `src/` (conteos propios) y el caso `sermonGrupo`.
## 12-03 SOLID I: responsabilidad única y abierto-cerrado
SRP («una razón para cambiar») y OCP con refactor corrido; críticas y abusos (clases diminutas, abstracción prematura).
## 12-04 SOLID II: Liskov, segregación de interfaces e inversión de dependencias
LSP (el cuadrado-rectángulo y un caso de logística), ISP, DIP e inyección de dependencias a mano (sin framework); para qué sirve en pruebas (retomá [@04-16]).
## 12-05 Patrones de diseño I: creacionales
Qué es un patrón (GoF 1994: vocabulario, no receta), fábrica, builder, singleton (y por qué es polémico: estado global); cuáles ya trae el lenguaje.
## 12-06 Patrones de diseño II: estructurales
Adaptador (retomá [@08-15]), fachada, decorador, proxy; ejemplo corrido de cada uno. Senda: `nube.ts` como fachada/adaptador de Supabase.
## 12-07 Patrones de diseño III: de comportamiento
Observador, estrategia, comando, máquina de estados (estados de un despacho). Senda: el director de Lany (eventos con prioridad y enfriamiento) y la suscripción de zustand como observador.
## 12-08 Arquitectura en capas y MVC
Capas (presentación, aplicación, dominio, datos: retomá [@07-06]), MVC histórico (Reenskaug) y MVC web, qué se rompe cuando una capa se salta. Senda: sus capas reales (`pantallas`/`componentes`/`estado`/`datos`/`util`) y violaciones medidas.
## 12-09 MVVM, Flux y las arquitecturas de interfaz
MVVM, Flux/Redux y el flujo unidireccional (retomá [@06-22]), MVI; por qué las UI convergieron ahí. Senda: zustand.
## 12-10 El monolito modular
Monolito no es mala palabra; módulos con fronteras verificadas (reglas de import), despliegue único; cuándo alcanza (casi siempre al principio). Demo: reglas de dependencia con una herramienta (dependency-cruiser o script propio).
## 12-11 Arquitectura hexagonal
Puertos y adaptadores (Cockburn 2005), núcleo de dominio sin infraestructura; el mismo caso de uso con adaptador de memoria, SQLite y HTTP, y sus pruebas.
## 12-12 Clean Architecture
Regla de dependencia, entidades, casos de uso; comparación honesta con hexagonal y capas; el costo de la ceremonia para un proyecto chico.
## 12-13 Domain-Driven Design I: lenguaje ubicuo y contextos
Lenguaje ubicuo (el vocabulario de logística: «bulto», «remito», «hoja de ruta»), contextos delimitados, mapa de contextos; por qué «pedido» significa cosas distintas en ventas y en depósito.
## 12-14 Domain-Driven Design II: agregados y eventos de dominio
Agregado e invariantes, objeto de valor (dinero, peso), eventos de dominio; ejemplo corrido; cuándo DDD es demasiado. Senda: «partida»/«turno» como agregado en SQL (`jugar_turno`).
## 12-15 Microservicios
Qué son, ley de Conway (1968), autonomía de equipos, lo que cuestan (red, datos repartidos, operación); demo de dos servicios locales con una falla.
## 12-16 Monolito o microservicios: cuándo cada uno
Costo de distribución, monolito distribuido, criterios de división; casos documentados de ida y vuelta (p. ej. Amazon Prime Video 2023, Segment: verificá en la fuente); para un equipo de una persona.
## 12-17 Arquitectura orientada a eventos
Evento vs comando, coreografía vs orquestación, consistencia eventual (retomá [@07-14]); demo con bus en memoria y un consumidor caído.
## 12-18 CQRS y Event Sourcing
Separar lecturas y escrituras, almacén de eventos, proyecciones, reconstruir estado; lo que complica (versionado de eventos, borrar datos personales); ejemplo corrido de cuenta corriente de un cliente. Senda: `salud_resumen` como proyección por trigger (retomá [@09-16]).
## 12-19 Serverless como arquitectura
Funciones como unidad, facturación por uso, límites y arranque en frío (retomá [@07-26]), cuándo sale más caro; Senda como caso «sin servidor propio» (retomá [@07-29]).
## 12-20 Sistemas distribuidos I: por qué son difíciles
Las 8 falacias (Deutsch), fallo parcial, particiones, el problema de los dos generales; simulación con red que pierde mensajes.
## 12-21 Sistemas distribuidos II: tiempo, relojes y orden
Por qué no hay «ahora» global, deriva de relojes y NTP (mostrá `chronyc`/`timedatectl` si existen), relojes de Lamport y vectoriales implementados y corridos. Senda: `Date.now()` del teléfono vs `now()` de la base (dónde confía en cada uno: verificá).
## 12-22 Sistemas distribuidos III: consistencia y CAP
Linealizabilidad vs eventual, CAP con precisión (retomá [@09-34]), PACELC; simulación de una partición con dos réplicas y las dos elecciones.
## 12-23 Sistemas distribuidos IV: consenso
Por qué hace falta (elegir líder, log replicado), Paxos a nivel de idea, Raft (elección y replicación) con una simulación chica corrida; dónde se usa (etcd, ZooKeeper/KRaft: doc).
## 12-24 Sistemas distribuidos V: replicar y repartir datos
Hashing consistente implementado y medido (claves que se mueven al sumar un nodo, con y sin nodos virtuales), quórums R+W>N, Dynamo (paper), lectura reparadora.
## 12-25 Transacciones distribuidas: 2PC y sagas
2PC y su bloqueo si cae el coordinador (simulado), sagas con compensaciones (paper de 1987), orquestada vs coreografiada; caso: reservar stock + cobrar + asignar transporte.
## 12-26 Idempotencia, reintentos y el mito del exactamente-una-vez
At-most/at-least-once, por qué exactly-once es «al menos una vez + idempotencia», claves de idempotencia y deduplicación corridas (retomá [@07-12]). Senda: `cliente_id` + `ignore-duplicates` y `enviar_avisos` (a lo sumo una vez).
## 12-27 Patrones de resiliencia
Timeout, reintento con backoff y jitter, circuit breaker (retomá [@07-17]), bulkhead, degradación, shed de carga; simulación de cascada con y sin protecciones. Senda: qué tiene y qué no (sin timeouts en la mayoría de los `fetch`).
## 12-28 Documentar y decidir: ADR, C4 y análisis de trade-offs
ADR (retomá [@04-23]), modelo C4 (dibujá los 3 primeros niveles de un sistema inventado con `diagrama`), ATAM a escala chica (escenarios de calidad priorizados).
## 12-29 Casos reales de arquitectura
3 o 4 casos con fuente oficial fechada (posts de ingeniería/postmortems): qué decidieron, qué cambió, la lección transferible y su límite. Sin mitología.
## 12-30 Arquitectura para un equipo de una persona
Costo de complejidad, YAGNI, «tecnología aburrida» (McKinley: retomá [@07-27]), comprar vs construir, cuándo sí invertir en estructura; lista de señales. Senda como ejemplo real de decisiones de bajo costo (`docs/COSTOS.md`: verificá).
## 12-31 La arquitectura de Senda en un diagrama: decisiones y trade-offs (tipo S)
Diagrama C4 (contexto, contenedores, componentes) de Senda verificado en el código; 5–7 ADR retroactivos rotulados como reconstrucción (por qué RN+Expo, por qué Supabase sin servidor, por qué polling, por qué contenido como datos, por qué React Navigation) citando documentos reales del repo donde existan; fronteras de confianza; deudas conocidas; ≥2 bloques `senda`, ≥4 archivos reales.
## 12-32 Cierre de la Parte 12: pensar como arquitecto (tipo R)
Mapa de arquitectura, un caso recorrido con decisiones y trade-offs, tabla «pregunta típica → día», 8–12 preguntas. Al final.
