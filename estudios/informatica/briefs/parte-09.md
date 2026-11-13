# Parte 9: Bases de datos y gestión de la información. Notas por día.
Contexto: el estudiante ya sabe backend (Parte 7: capas, validación, transacciones solo en pasada, jobs, caché, RLS de Senda a nivel de ejemplo) y APIs (Parte 8). Acá se aprende la base de datos de verdad, de cero. Herramientas reales: PostgreSQL 16 y sqlite3 (ya instalados por otros redactores; PostgreSQL NO arranca como root y `/tmp/claude-0` es modo 700: iniciá tu clúster en `/var/tmp/<tu-día>` con `runuser -u postgres -- ...` y puerto propio 21xxx; apagalo y borrá tu directorio al terminar), `psql`, SQLite (módulo `node:sqlite` de Node 22 o Python `sqlite3`), DuckDB/Redis/Valkey/MongoDB solo si instalan limpio por apt/pip/npm/go (evitá descargas gigantes: el disco es compartido y ya se llenó una vez; chequeá `df -h /tmp` antes de bajar cosas pesadas), `pg_dump`, `pgbench`, `EXPLAIN (ANALYZE, BUFFERS)`, `pageinspect`/`pg_buffercache`/`pgstattuple` (extensiones contrib si están), `pg_waldump`, `pg_basebackup`. Los widgets del armador no ejecutan SQL; usá `terminal` con salida real corrida, tablas, y `diagrama` (arbol, grafo, svg) para B-tree, ER, planes. Datos de ejemplo SIEMPRE inventados (logística: bultos, depósitos, choferes, rutas, clientes), reproducibles con un script de generación corto mostrado en el día (semilla fija). Mediciones rotuladas «medido en esta VM» (4 CPU compartidos, `fsync` según config: decilo). Versiones vigentes al 13-11-2026 verificadas (PostgreSQL 18? 17? MySQL, SQLite, MongoDB: sitio oficial y release notes); estándares SQL (ISO/IEC 9075) solo por referencia. VM compartida: nada de `pkill`/`kill` por patrón (matá por PID propio); no uses `rm` con comodines (bloqueado). SENDA: su base ES Supabase/Postgres: 41 tablas con RLS, ~93 funciones SQL (RPC), 42 migraciones en `supabase/migrations/` (con fechas posteriores al commit), `pruebas/nube/` con un Postgres 16 propio en `/var/tmp/senda-pg` y puerto 5499, `docs/ESCALA.md` y `docs/COSTOS.md`. Los días 09-45 y 09-46 son de Senda; en los demás, Senda aparece solo donde ilustra algo verificable (tablas, índices, `for update`, `skip locked`, `pg_advisory_xact_lock`, RLS, migraciones, trigger `salud_resumen`, `pg_cron`). Podés aplicar las migraciones de Senda en TU Postgres propio (copiando del repo, solo lectura) para examinar el esquema real. Hallazgos ya conocidos con tu propia verificación: 104 preguntas vivas sin clave (5.402 vs 5.371), `respuestas` con `with check (true)`, `unirse_grupo` sin candado y sin tope de intentos, `enviar_avisos` marca enviado sin leer `pg_net`, `puntosRespuesta` vs `corregir_partida` difieren en 1 punto en 41/19.701 casos de redondeo, funciones con `search_path = public`.

## 09-01 Qué problema resuelven las bases de datos
Persistencia, concurrencia, integridad, consultas sin escribir código ad hoc; el problema de usar archivos (CSV/JSON): demostrá una «base casera» en archivos y cómo falla con dos escritores (corrida real); SGBD; Codd 1970 (verificá el paper original en ACM/IBM: «A Relational Model of Data for Large Shared Data Banks»), historia breve (IMS, CODASYL, System R, Ingres, Oracle). Retomá [@02-xx] archivos y [@07-01].

## 09-02 El modelo relacional: tablas, filas y columnas
Relación como conjunto de tuplas, atributo y dominio, clave candidata, por qué «relacional» (de la matemática de relaciones, no de «relaciones entre tablas»), álgebra relacional a vuelo de pájaro (selección, proyección, producto, unión) mostrada con SQLite/Postgres. Tabla inventada de bultos. Ejercicios.

## 09-03 SQL I: preguntarle cosas a una tabla (tipo L)
`SELECT … FROM … WHERE`, predicados, operadores, `LIKE`, `IN`, `BETWEEN`, resultado tabular, SQL como lenguaje declarativo (retomá [@03-56]), dialectos. Laboratorio con una tabla de ≥10.000 filas inventadas; ≥5 ejercicios con solución corrida.

## 09-04 SQL II: ordenar, limitar, funciones y NULL (tipo L)
`ORDER BY`, `LIMIT/OFFSET` (adelanto del costo de offset: retomá [@08-03]), funciones de texto/fecha/numéricas, `NULL` y lógica de tres valores (los errores clásicos: `= NULL`, `NOT IN` con NULL: mostralo), `COALESCE`, `CASE`, zonas horarias en `timestamptz` (por qué importa). ≥5 ejercicios con solución.

## 09-05 SQL III: crear y modificar datos
`CREATE TABLE`, `INSERT`, `UPDATE`, `DELETE`, `RETURNING`, `UPSERT` (`ON CONFLICT`: retomá `ignore-duplicates` de Senda y [@07-12]), qué pasa sin `WHERE` en un `UPDATE` (demo en una copia; hábito: transacción primero), `TRUNCATE`.

## 09-06 Tipos de datos y restricciones
Tipos de PostgreSQL (enteros, `numeric` vs `float` con dinero: demostrá 0,1+0,2 y retomá [@01-xx], texto, fechas, `boolean`, `uuid`, `jsonb`, arrays, enums), `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, por qué las restricciones en la base son la última defensa (retomá [@07-07], [@07-08]). Senda: una restricción real de `supabase/migrations/` (verificá).

## 09-07 Claves primarias y foráneas
PK natural vs sustituta (serial, identity, UUID v4/v7: tamaños e impacto en índices medidos), FK, integridad referencial, `ON DELETE CASCADE/RESTRICT/SET NULL`, huérfanos (demostrá qué pasa sin FK). Senda: PK/FK reales (verificá una migración).

## 09-08 Relaciones: uno a uno, uno a muchos, muchos a muchos
Cardinalidad, tabla intermedia, relación recursiva (jerarquía de depósitos), modelado de «pertenece a». Diagramas ER (SVG). Ejercicios. Senda: `grupos`/`miembros` como caso de muchos a muchos con rol (verificá en SQL).

## 09-09 SQL IV: JOIN, la operación central
`INNER`, `LEFT`, `FULL`, `CROSS`, diagrama honesto (los diagramas de Venn engañan: explicá por qué y mostrá con filas), `ON` vs `USING`, qué hace el motor (nested loop, hash, merge: adelanto de [@09-22]). Un caso con 3 tablas inventadas.

## 09-10 SQL V: JOINs en la práctica (tipo L)
Alias, unir varias tablas, anti-join (`LEFT JOIN … IS NULL` vs `NOT EXISTS` vs `NOT IN`), duplicados por unir mal (multiplicación de filas: demostrala), self-join. ≥5 ejercicios con solución corrida.

## 09-11 SQL VI: agregaciones, GROUP BY y HAVING
`COUNT/SUM/AVG/MIN/MAX`, `GROUP BY`, `HAVING` vs `WHERE`, `COUNT(*)` vs `COUNT(col)` con NULL, `FILTER`, `GROUPING SETS/ROLLUP` a nivel de uso, errores típicos. Reporte de logística (bultos por zona y mes) con datos inventados.

## 09-12 SQL VII: subconsultas y CTE
Subconsulta escalar/en `FROM`/`EXISTS`, CTE (`WITH`), CTE recursivo (jerarquía de depósitos), consultas correlacionadas y su costo, legibilidad. Comparación de planes con y sin CTE (materialización en PG ≥12: verificá en la doc).

## 09-13 SQL VIII: funciones de ventana
`OVER`, `PARTITION BY`, `ORDER BY`, `ROW_NUMBER/RANK/DENSE_RANK`, `LAG/LEAD`, acumulados y media móvil (`ROWS BETWEEN`), el top-N por grupo. Ejemplo: ranking de choferes por entregas y por zona. Senda: el ranking/copas (verificá si usa ventanas en SQL).

## 09-14 Diseño de esquemas: del problema a las tablas
Del texto del problema a entidades y relaciones, diagrama ER (notación crow's foot), identificar claves, ejemplo de principio a fin con logística. Errores típicos. Preparación del laboratorio [@09-44].

## 09-15 Normalización I: 1FN, 2FN y 3FN
Dependencia funcional, anomalías de inserción/actualización/borrado (demostralas con una tabla mala corrida), 1FN/2FN/3FN con ejemplos, cómo se normaliza paso a paso. Ejercicios con solución.

## 09-16 Normalización II y desnormalización
BCNF, 4FN a nivel de nombre, cuándo desnormalizar (lecturas masivas, reportes, caché de resumen: el trigger `salud_resumen` de Senda es un caso real: verificalo), tabla de hechos y dimensiones (adelanto de [@18-xx]), costo de mantener duplicados consistentes. Medí un reporte normalizado vs desnormalizado.

## 09-17 Vistas, vistas materializadas y funciones
Vista como consulta con nombre, seguridad con vistas (`security_invoker`/`security_barrier` en PG: verificá doc), vista materializada y `REFRESH` (cuándo conviene), funciones SQL y `plpgsql`, volatilidad (`IMMUTABLE/STABLE/VOLATILE`). Senda: ¿usa vistas? verificá y mostrá una función SQL real (`security definer`: riesgos y `search_path`).

## 09-18 Procedimientos almacenados y triggers
Procedimiento vs función, triggers (BEFORE/AFTER, por fila/por sentencia), efectos ocultos (por qué los triggers sorprenden: demostrá uno que rompe un `INSERT` masivo o lo hace lento), cuándo usarlos y cuándo no. Senda: el trigger de `salud_resumen` y otros reales.

## 09-19 Cómo se guarda una tabla en disco
Páginas de 8 KB, heap file, tuplas, TOAST, almacenamiento por filas vs columnar (idea), `pageinspect` y `pg_relation_size` sobre una tabla real: mostrá una página por dentro (cabecera, punteros de línea, tuplas), efecto de `UPDATE` (nueva versión de la fila) y `VACUUM`. Retomá [@02-xx] sistemas de archivos.

## 09-20 Índices I: qué son y por qué aceleran
Escaneo secuencial vs índice, selectividad, qué cuesta un índice (escritura, espacio: medilo), cuándo el planificador NO lo usa (tabla chica, baja selectividad), `CREATE INDEX`. Medí una consulta en 1 millón de filas antes y después. Analogía honesta (índice de un libro) y su límite.

## 09-21 Índices II: el B-tree por dentro y otros tipos
B-tree (estructura, altura, páginas: `bt_metap`/`bt_page_items` de `pageinspect`), índice compuesto y el orden de columnas, índices parciales y de expresión, cobertura (`INCLUDE`/index-only scan), hash, GIN, GiST, BRIN (cuándo cada uno; ejemplo con `jsonb`, texto y fechas). Diagrama `arbol` del B-tree.

## 09-22 Cómo ejecuta una consulta el motor
Parser, reescritura, planificador/optimizador, ejecutor; plan como árbol de operadores (`Seq Scan`, `Index Scan`, `Hash Join`, `Nested Loop`, `Merge Join`, `Sort`, `Aggregate`), costos estimados vs reales. Leé un plan real paso a paso. `EXPLAIN` sin `ANALYZE` (no ejecuta) y con (ejecuta: cuidado con `UPDATE`).

## 09-23 Optimización de consultas
`EXPLAIN (ANALYZE, BUFFERS)`, estadísticas (`ANALYZE`, `pg_stats`), estimaciones erradas, `N+1` (retomá [@08-08]), reescrituras, índices que faltan, `pg_stat_statements` (si está), un caso de una consulta lenta que se arregla de 3 formas con tiempos medidos. Qué NO hacer (hints a ciegas, índices en todas las columnas).

## 09-24 Transacciones y ACID
Transacción, `BEGIN/COMMIT/ROLLBACK`, A-C-I-D explicados con ejemplos reales (transferencia entre depósitos: stock), savepoints, qué pasa ante error a mitad, consistencia (de la base vs de la aplicación: Kleppmann). Demos con dos sesiones `psql`. Senda: una función RPC transaccional (verificá `jugar_turno`).

## 09-25 Concurrencia: aislamiento, anomalías y MVCC
Lectura sucia, no repetible, fantasmas, write skew; niveles de aislamiento (READ COMMITTED, REPEATABLE READ, SERIALIZABLE en PG: qué garantiza cada uno, verificá la doc), MVCC (xmin/xmax: mostrá con `SELECT xmin,xmax,*`), `VACUUM`, errores de serialización y reintento. Dos sesiones reproduciendo cada anomalía.

## 09-26 Locks, deadlocks y bloqueo optimista
`SELECT … FOR UPDATE`/`NO KEY UPDATE`/`SKIP LOCKED` (retomá [@07-13]), advisory locks (`pg_advisory_xact_lock`: Senda `reclamar_trivia`), deadlocks (provocá uno y leé el log), bloqueo optimista con columna de versión (retomá `If-Match` de [@08-03]). Senda: `jugar_turno` con `for update` y `unirse_grupo` sin candado (hallazgo): reproducilo en tu Postgres.

## 09-27 WAL, durabilidad y recuperación ante caídas
Write-ahead log, checkpoint, `fsync` y por qué importa (qué pasa con `fsync=off`: tus mediciones), `pg_waldump` de un commit, recuperación tras una caída simulada (matá tu propio postmaster con `kill -9` por PID propio y mirá el log de recuperación). Retomá [@02-xx] journaling.

## 09-28 Backups, recuperación a un punto en el tiempo, RPO y RTO
`pg_dump` lógico vs `pg_basebackup` físico, archivado de WAL y PITR (hacé una recuperación a un punto en el tiempo real en tu Postgres: insertá, anotá la hora, «borrá por error», recuperá), RPO y RTO con números, la regla de que un backup sin prueba de restauración no existe. Senda: sin respaldo propio; el plan Pro de Supabase y qué cubre (verificá la doc oficial con fecha).

## 09-29 Replicación
Réplica, streaming replication (primaria + standby en tu VM con puertos propios: armala de verdad con `pg_basebackup`), síncrona vs asíncrona, retraso de réplica (medilo) y lecturas obsoletas, conmutación por error (failover) a nivel de idea, réplicas de lectura. Senda: réplicas en Supabase solo por doc.

## 09-30 Particionamiento y sharding
Particionamiento declarativo por rango/lista/hash en PG (demostrá poda de particiones con `EXPLAIN`), sharding (clave de shard, rebalanceo, consultas entre shards: costos), cuándo hace falta (casi nunca al principio: números), Citus/Vitess solo doc. Senda: las tablas de crecimiento (`respuestas`) como candidata hipotética: marcalo como hipótesis.

## 09-31 Migraciones de esquema sin caídas
Migraciones versionadas (por qué existen), `ALTER TABLE` y bloqueos (qué operaciones bloquean: demostralo con una tabla grande y dos sesiones), patrón expand-contract, `CREATE INDEX CONCURRENTLY`, compatibilidad entre versiones de app y de esquema. Senda: 42 migraciones, nombres con fecha y cómo `supabase.yml` las aplica (verificá); riesgos con APKs viejos (retomá [@08-13]).

## 09-32 PostgreSQL a fondo
Extensiones (`pg_stat_statements`, `pgcrypto`, `pg_trgm`, `postgis`, `pgvector`: cuáles hay en tu instalación), `jsonb` y sus índices, esquemas, roles y permisos (`GRANT`, `search_path`), `LISTEN/NOTIFY`, `pg_cron`/`pg_net` (como en Supabase), licencia y gobernanza de PG (verificá en postgresql.org), por qué Postgres «ganó». Versión vigente y calendario de soporte con fecha.

## 09-33 MySQL, SQL Server, Oracle y SQLite
Diferencias reales entre motores (tipos, `LIMIT` vs `TOP`, transacciones DDL, MVCC), dónde se usa cada uno (con fuente: DB-Engines ranking con fecha, Stack Overflow 2026), licencias (Oracle/MySQL/MariaDB/SQL Server: doc oficial), SQLite embebida (correla y mostrá que es una biblioteca, un archivo; límites: escritor único; WAL mode). Corré el mismo script en Postgres y SQLite y mostrá diferencias. Senda: SQLite dentro del teléfono (AsyncStorage en Android usa SQLite: retomá [@06-37]).

## 09-34 NoSQL: por qué existe y qué familias hay
Motivos reales (escala horizontal, flexibilidad de esquema, latencia, modelos de datos), familias (documentos, clave-valor, columnas anchas, grafos, series, vectoriales), teorema CAP (enunciado exacto y malentendidos: Brewer/Gilbert–Lynch; PACELC), consistencia eventual. Un cuadro comparativo honesto: «NoSQL no es más rápido».

## 09-35 Documentos: MongoDB y Firestore
Modelo de documento, colecciones, embebido vs referenciado, consultas, índices, transacciones multidocumento, MongoDB (licencia SSPL: verificá) y Firestore (doc). Corré MongoDB local si se puede (o `mongod` desde un paquete oficial/`apt`; si no, FerretDB/doc) y mostrá el mismo caso modelado en Postgres `jsonb` vs documento. Senda no usa Mongo/Firestore (verificá con grep).

## 09-36 Clave-valor y Redis
Clave-valor, estructuras (strings, hashes, listas, sets, sorted sets, streams), expiración, persistencia (RDB/AOF), uso como caché/cola/ranking (retomá [@07-15]), Valkey/Redis (licencias con fecha), límites. Corré Redis/Valkey local y medí ops/s. Senda: ranking en SQL, no en Redis (verificá).

## 09-37 Columnares, de grafos y de series de tiempo
OLTP vs OLAP, almacenamiento columnar (Parquet, DuckDB: corré DuckDB si instala por pip/npm; comparación de una agregación en filas vs columnar medida), bases de grafos (Neo4j: modelo; consulta de caminos con CTE recursivo vs Cypher), series de tiempo (TimescaleDB/InfluxDB: idea; particionado por tiempo). Retomá [@09-19].

## 09-38 Bases vectoriales y búsqueda por similitud
Embeddings (qué son: vectores; sin modelos de IA pagos: usá vectores sintéticos o un modelo pequeño abierto solo si baja liviano; si no, calculá a mano), similitud coseno/distancia euclídea, vecino más cercano exacto vs aproximado (HNSW/IVFFlat: idea), `pgvector` (instalalo si hay paquete; si no, explicalo con doc). Medí exacto vs aproximado si podés. Adelanto de la Parte 17.

## 09-39 Búsqueda de texto: índices invertidos
Índice invertido construido a mano (código corto), tokenización, stemming, relevancia (TF-IDF/BM25: fórmula), búsqueda de texto de Postgres (`tsvector`, `tsquery`, GIN) corrida, `pg_trgm`, Elasticsearch/OpenSearch/Meilisearch (doc). Senda: la búsqueda bíblica (`src/datos/biblia.ts`: verificá cómo busca) — un caso real y chico.

## 09-40 Archivos, imágenes y videos: objetos contra base de datos
Blob en la base vs almacenamiento de objetos con metadatos en la base (tamaños, backup, costo, streaming: medilo con un archivo de 50 MB en `bytea` vs archivo + ruta), URL firmadas (retomá [@07-16]), video (streaming adaptativo a nivel de idea), CDN. Senda: Storage de Supabase para PDFs del sermón (verificá), láminas y audio dentro del APK (89,1 MB: peso; verificá `docs/PESO.md`).

## 09-41 Seguridad de datos en la base
Privilegios (`GRANT/REVOKE`, roles mínimos), seguridad a nivel de fila (RLS: demostrá política y `FORCE`), inyección SQL (retomá [@07-07]; consultas parametrizadas: demostrá un ataque contra una app de práctica y su arreglo), cifrado en reposo y en tránsito, datos personales (LGPD/GDPR/ley 25.326 de Argentina: leé el texto oficial/infoleg con fecha; qué es un dato personal; a nivel de idea, no asesoramiento legal), enmascarado, auditoría. Senda: RLS en 41/41 tablas y hallazgos de seguridad (verificá y citá con cuidado).

## 09-42 Supabase: la anatomía de un backend sobre Postgres
PostgREST (HTTP → SQL), Auth (GoTrue), Realtime, Storage, Edge Functions, `pg_graphql`, cómo `anon`/`authenticated`/`service_role` son roles de Postgres y los JWT llevan el rol (demostralo con `SET ROLE` y claims en tu Postgres, como en [@07-25]); límites; lo que paga el plan. Retomá [@07-25], [@07-29], [@08-17].

## 09-43 Cómo elegir una base de datos
Criterios (modelo de datos, consistencia, escala, operación, costo, equipo, ecosistema), «empezá con Postgres» y sus límites, persistencia políglota, matriz de decisión con puntajes rotulados como opinión, errores típicos (MongoDB «porque es flexible», Redis como base primaria), casos inventados de logística. Senda: por qué Postgres/Supabase calza hoy y qué señales dirían cuándo cambiar.

## 09-44 Laboratorio: diseñar el esquema de una mini Senda sin ayuda (tipo L)
Enunciado de requisitos de una app de lectura y juegos (usuarios, progreso, preguntas, partidas, grupos) SIN mirar el esquema real; diseño guiado paso a paso con checklist de revisión (claves, restricciones, índices, RLS); ≥5 ejercicios con solución corrida en tu Postgres; luego una comparación breve con el esquema real SOLO al final (para el 09-45). No copies el esquema real: el estudiante lo diseña antes.

## 09-45 El esquema real de Senda: tablas, relaciones y RLS (tipo S)
Diccionario de datos de Senda: aplicá las 42 migraciones en tu Postgres propio y generá el inventario real (tablas, columnas clave, FK, índices, políticas RLS, funciones); diagrama ER de las tablas centrales; ≥2 bloques `senda`, ≥4 archivos reales; incluí hallazgos con tu verificación, sin exagerar.

## 09-46 Cómo se actualiza una copa: transacciones y funciones en la base de Senda (tipo S)
Seguí de punta a punta el flujo de copas/partidas (`corregir_partida`, `jugar_turno`, `reclamar_trivia`, cierre de copas, `salud_resumen`): qué es atómico, qué bloquea, qué ocurre con dos teléfonos a la vez (reproducilo en tu Postgres con dos sesiones), el redondeo TS vs SQL, y qué pasa si falta la clave de respuestas (hallazgo: 4 de 45 fijas sin clave). ≥2 bloques `senda`, ≥4 archivos reales.

## 09-47 Cierre de la Parte 9: del dato al disco y de vuelta (tipo R)
Mapa de datos (modelado → SQL → índices y plan → transacciones y concurrencia → WAL, backup y réplica → motores y NoSQL → seguridad → elección), un caso recorrido de punta a punta (un despacho: de la tabla a la página en disco), tabla «pregunta típica → día», 8–12 preguntas. Escribilo al final.
