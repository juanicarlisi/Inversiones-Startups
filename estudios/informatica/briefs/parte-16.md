# Parte 16: Escalabilidad, rendimiento y confiabilidad. Notas por día.
Contexto: el estudiante ya vio rendimiento web (Parte 6), caché, colas y resiliencia en backend (Parte 7), índices, réplicas y pool (Parte 9), sistemas distribuidos (Parte 12), nube y DR (Parte 13), despliegue (Parte 14). Esta parte es medir, crecer y no caerse. REGLA: todo número se MIDE en esta VM (servidores propios en Node/Python/Go/nginx en 127.0.0.1, puertos 28xxx; PostgreSQL 16 propio con `runuser -u postgres` y clúster en /var/tmp; generadores de carga livianos: `wrk`/`hey`/`ab`/`k6` si instalan por apt o binario permitido, si no un generador propio en Node) o se simula con semilla fija en bloques `ejecutable`; decí siempre la máquina (núcleos, RAM) y que son medidas de una VM compartida y ruidosa (repetí y da rango). Carga SOLO contra procesos propios en localhost; nunca contra terceros ni contra el Supabase de Senda. Fuentes: Google SRE book y Workbook (sre.google, gratis), Gregg (método USE), Dean & Barroso «The Tail at Scale», Gunther (USL), Little, Amdahl, documentación de Prometheus/OpenTelemetry/k6, Netflix (chaos), postmortems oficiales. Prometheus/Grafana/Jaeger: binarios pesados y descargas que pueden estar denegadas por los permisos de la sesión: si una descarga es denegada NO busques caminos alternativos; exponé métricas en formato Prometheus desde un servidor propio y leelas con curl, usá el SDK de OpenTelemetry por npm con exportador a consola. Logística: paralelos fuertes (muelles = servidores, cola de camiones = cola de pedidos, ley de Little en un depósito, cuello de botella en el picking) con su límite. SENDA: sin servidor propio; el cuello es Supabase (plan gratis: conexiones, 500 MB de base, egress, pausa) y los sondeos a 2/8/45 s; el modelo `scripts/economia/capacidad.py` (3.000–7.900 personas según supuesto, base 5.700: ESTIMACIÓN del repo, nunca medida con gente real), `docs/ESCALA.md`, `docs/COSTOS.md`, `docs/CAPACIDAD.md`, `medir(…, { muestra })`, tabla `salud`/`salud_resumen`; sin reporte remoto de fallos. Verificá en /home/user/senda-app (solo lectura); el 16-22 es entero de Senda y NO se mide nada contra su base viva: se mide una réplica local del esquema si las migraciones aplican en Postgres propio (ya se hizo en la Parte 9: mirá 09-41/09-42) y se rotula. Sin recomendar gasto. Entorno compartido: directorio propio del scratchpad, disco justo, `rm` con comodines y `pkill`/`kill` por patrón bloqueados; no cambies permisos de directorios ajenos.

## 16-01 Qué significa escalar
Carga (qué se mide: usuarios activos, concurrentes, solicitudes/s), de DAU a RPS con cuenta explícita, capacidad, escalabilidad vs rendimiento; un servidor propio medido a 1, 10, 100 concurrentes.
## 16-02 Latencia, throughput y percentiles
Por qué el promedio miente (distribución medida), p50/p95/p99, cola larga (Tail at Scale: fan-out), ley de Little verificada en una simulación, omisión coordinada.
## 16-03 Cuellos de botella: cómo encontrarlos
Método USE, CPU vs E/S vs bloqueo, perfilado real (`node --prof` o `--cpu-prof`, `py-spy`/cProfile), flame graph leído, Amdahl con cuentas; encontrar y arreglar un cuello sembrado.
## 16-04 Escalado vertical y horizontal
Límites de cada uno, servicio sin estado (sacar la sesión del proceso), USL (por qué más nodos puede dar menos); 1 vs N procesos detrás de un balanceador medidos.
## 16-05 Balanceo de carga a fondo
Retomá [@05-25]: algoritmos (round robin, menos conexiones, «el poder de dos opciones» simulado), L4 vs L7, health checks, afinidad y sus costos; nginx propio con un backend lento.
## 16-06 Caching por capas
Retomá [@07-15], [@06-xx]: capas, tasas de acierto medidas, invalidación, estampida de caché demostrada y arreglada (bloqueo/stale-while-revalidate).
## 16-07 CDN a fondo
PoP, claves de caché, `Cache-Control`/`s-maxage`/`Vary`, purga, contenido dinámico en el borde; simulá un borde con nginx `proxy_cache` y medí. Senda: el contenido viaja dentro de la app (qué ahorra y qué cuesta).
## 16-08 Escalar la base de datos
Orden sensato: consultas e índices → pool (PgBouncer/Supavisor: por qué Postgres sufre con muchas conexiones, medido) → réplicas de lectura → particionar → shard (retomá [@09-28]..[@09-30]); `pgbench` propio.
## 16-09 Colas y contrapresión
Cola sin límite = caída diferida (demo de memoria creciendo), contrapresión, cola acotada, descarte de carga, prioridades; retomá [@07-14], [@12-27].
## 16-10 Arquitecturas para picos
Picos previsibles (venta de entradas, Navidad) vs virales, sala de espera, precalentamiento, degradación planificada, límites por usuario; simulación de un pico 20× con y sin protecciones. Senda: la Copa de Navidad y torneos como pico previsible (qué operación pesa: leé el SQL), sin opinar de fechas.
## 16-11 Alta disponibilidad, redundancia y failover
Nueves en minutos por año, disponibilidad en serie y en paralelo (cuentas), SPOF (mapeo de un sistema inventado), failover activo-pasivo con procesos locales medido; retomá [@13-22].
## 16-12 Tolerancia a fallos y chaos engineering
Principios (principlesofchaos.org, Netflix), hipótesis de estado estable, radio de impacto, experimento chico: matar un proceso/introducir demora en un sistema propio y ver si las protecciones aguantan.
## 16-13 Recuperación ante desastres
RPO/RTO (retomá [@09-27], [@13-22]), backup probado = backup (restaurá de verdad un `pg_dump` y medí el tiempo), runbook, ejercicio. Senda: qué backups da su plan según la doc vigente y qué vive solo en el teléfono.
## 16-14 Observabilidad I: logs
Log estructurado (JSON) vs texto, niveles, id de correlación, qué no loguear (datos personales, secretos), costo de volumen, muestreo; consultas con `jq` sobre un log propio.
## 16-15 Observabilidad II: métricas
Contador, medidor, histograma; señales doradas, RED y USE; formato de exposición de Prometheus servido por un servidor propio; cardinalidad. Senda: `metricas.ts` (PostHog) y `salud` (verificá qué mide).
## 16-16 Observabilidad III: trazas distribuidas
Traza y span, propagación de contexto (`traceparent` W3C), OpenTelemetry con exportador a consola en dos servicios propios, muestreo.
## 16-17 Monitoreo, alertas y guardias
SLI/SLO/SLA, presupuesto de error con cuentas, alertas por síntoma y tasa de quemado, fatiga de alertas, guardias para un equipo de una persona (qué es razonable).
## 16-18 Pruebas de carga y de rendimiento
Tipos (carga, estrés, pico, resistencia), modelo abierto vs cerrado, diseño de una prueba (escenario, rampa, criterio de aprobación), corrida real contra servidor propio hasta el punto de quiebre, lectura de resultados.
## 16-19 Incidentes y postmortems sin culpa
Roles en un incidente, línea de tiempo, comunicación, postmortem sin culpa (formato de Google SRE), «causa raíz» y sus críticas (factores contribuyentes); escribí el postmortem del disco lleno de esta misma VM durante la escritura del estudio (hecho real del entorno: los redactores llenaron el disco compartido varias veces el 13/16-11-2026).
## 16-20 De 10 a 10 millones de usuarios
Etapas con su punto de quiebre típico y el cambio que lo destraba (cuentas explícitas por etapa, rotuladas como órdenes de magnitud), qué NO hacer antes de tiempo.
## 16-21 Costo contra escala: cuándo no escalar
Escalado y optimización prematuros (Knuth: la cita completa), costo por usuario, cuándo conviene pagar en vez de optimizar y al revés; calculadora `ejecutable`.
## 16-22 Cuántos usuarios aguanta Senda (tipo S)
El modelo de capacidad del repo corrido en una copia, sus supuestos uno por uno (estimación), el primer cuello según el modelo y según el código (sondeos, RPC más pesadas), una medición sobre réplica local del esquema si aplica, qué habría que medir con gente real; ≥2 bloques `senda`, ≥4 archivos reales; sin recomendar gasto.
## 16-23 Cierre de la Parte 16: crecer sin romperse (tipo R)
Mapa de escalabilidad, caso recorrido (una app de despachos de 100 a 1.000.000 de usuarios, etapa por etapa), tabla «pregunta típica → día», 8–12 preguntas. Al final.
