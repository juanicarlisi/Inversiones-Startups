# Parte 13: Cloud (AWS, Azure, Google Cloud y compañía). Notas por día.
Contexto: el estudiante ya sabe SO y virtualización/contenedores (Parte 2), redes (Parte 5), backend y BaaS (Parte 7), bases y réplicas (Parte 9) y arquitectura (Parte 12). Esta parte es el mapa de la nube. LÍMITE DURO: NO hay cuentas de ningún proveedor y NO se crean (ni «capa gratuita»): nada de consolas ni CLIs autenticadas. Todo lo de proveedores va por DOCUMENTACIÓN OFICIAL FECHADA (aws.amazon.com/docs, learn.microsoft.com, cloud.google.com/docs, supabase.com/docs, firebase.google.com/docs, developers.cloudflare.com, vercel.com/docs, etc.) y páginas oficiales de precios leídas el día de la escritura, con fecha y moneda; cada precio se rotula «precio de lista al DD-MM-2026, región X» y nunca se presenta como recomendación de compra. Para que el día no sea solo lectura, cada concepto se DEMUESTRA en local con equivalentes abiertos o simulaciones rotuladas: MinIO o un servidor S3 de juguete para objetos (si MinIO baja liviano como binario; si no, simulá la API con Node), `ip netns` + nftables para VPC/subredes/NAT (retomá [@05-10]), procesos/cgroups o `unshare` para instancias y contenedores (no hay Docker daemon salvo que verifiques lo contrario; `runc`/`podman` solo si instalan liviano), funciones serverless simuladas con procesos efímeros (retomá [@07-26]), políticas IAM evaluadas con un evaluador de juguete propio sobre JSON de política real de la doc, calculadoras de costo propias en JS `ejecutable` con precios de lista citados. Datos de mercado (cuotas de nube) solo con fuente pública y fecha (Synergy/Canalys suelen resumirse en notas de prensa: citá la nota, no inventes). Latencias a regiones: retomá [@05-27]. Incidentes: solo postmortems oficiales. Argentina: región más cercana (São Paulo sa-east-1 y equivalentes; verificá si hay regiones nuevas en LATAM al 16-11-2026), facturación en USD e impuestos locales a nivel de mención con fuente oficial o sin afirmar. Entorno compartido: disco justo (nada de más de 200 MB; borrá por ruta exacta), puertos 25xxx, `rm` con comodines y `pkill`/`kill` por patrón bloqueados. SENDA: su nube es Supabase (plan gratis hoy según docs del repo; Pro planificado), GitHub Actions (minutos gratis), Expo Push/FCM, AdMob, PostHog, Anthropic API por lotes (créditos casi agotados): el día 13-27 hace el inventario y los costos REALES solo con lo que consta en el repo (`docs/COSTOS.md`, `docs/ESCALA.md`, `docs/CAPACIDAD.md`, `scripts/economia/capacidad.py`) y en páginas de precios vigentes; todo lo demás, estimación rotulada. Sin opinar sobre decisiones de gasto del fundador.

## 13-01 Qué es la nube y por qué existe
De comprar servidores a alquilar capacidad; elasticidad, pago por uso, autoservicio (definición NIST SP 800-145: leela); historia (EC2/S3 2006); qué NO es (no es «la computadora de otro» sin más: es API + escala + facturación). Cálculo: capex vs opex de un caso inventado.
## 13-02 Dentro de un centro de datos
Racks, energía redundante, refrigeración, PUE (definición y valores publicados por proveedores con fecha), red interna, seguridad física; cables submarinos (retomá [@05-09]). Solo fuentes oficiales/informes públicos.
## 13-03 Regiones, zonas y disponibilidad
Región, zona de disponibilidad, latencia entre regiones (retomá [@05-27]), soberanía de datos, SLA (qué prometen y qué compensan: leé un SLA real), cálculo de disponibilidad compuesta.
## 13-04 IaaS, PaaS, SaaS y FaaS
El espectro de control vs comodidad, responsabilidad compartida (diagrama por capa), ejemplos; dónde cae Supabase y dónde Senda.
## 13-05 Cómputo I: máquinas virtuales
Instancias, familias/tipos, imágenes, discos, autoscaling, spot/reservadas; hipervisores (retomá [@02-23]; esta VM corre sobre Firecracker: mostrá indicios verificables). Simulación de autoscaling con una traza de carga inventada.
## 13-06 Cómputo II: contenedores gestionados
Contenedores (retomá [@02-24]), registros de imágenes, Cloud Run/App Runner/Container Apps/Fargate, orquestador gestionado (EKS/GKE/AKS) a nivel de mapa (Kubernetes en detalle va en la Parte 14). Demo local con `unshare`/runc si se puede.
## 13-07 Cómputo III: serverless
Lambda/Cloud Functions/Azure Functions: modelo, límites (tiempo, memoria, tamaño), concurrencia, arranque en frío, precio por invocación y GB-segundo (calculadora propia con precios de lista). Retomá [@07-26], [@12-19].
## 13-08 Almacenamiento I: objetos, bloques y archivos
S3 (buckets, claves, API HTTP: mostrá pedidos reales contra un servidor S3 local), volúmenes de bloques, sistemas de archivos de red; cuándo cada uno (retomá [@09-40]).
## 13-09 Almacenamiento II: durabilidad, clases y costos de salida
«Once nueves» (qué significa y qué no), clases de almacenamiento y ciclo de vida, egress y por qué es la trampa clásica (calculadora), R2 y el egress cero (doc).
## 13-10 Redes virtuales
VPC, subredes públicas/privadas, tablas de ruteo, gateway de Internet y NAT, grupos de seguridad vs ACL; reproducí una VPC chica con `ip netns` y nftables. Retomá [@05-06], [@05-10], [@05-24].
## 13-11 Identidad y acceso: IAM
Usuarios, roles, políticas JSON (allow/deny, evaluación), mínimo privilegio, credenciales temporales, claves filtradas como causa típica de incidentes; evaluador de juguete sobre políticas de ejemplo de la doc. Retomá [@07-11].
## 13-12 Bases de datos administradas
RDS/Aurora/Cloud SQL/Azure SQL: qué administra el proveedor (parches, backups, réplicas, failover) y qué no; serverless DB (Aurora Serverless, Neon); precios de lista de una instancia chica; retomá [@09-28], [@09-29]. Supabase como Postgres administrado.
## 13-13 AWS: el mapa de servicios
Los 15–20 servicios núcleo y para qué sirve cada uno, cuenta/organización, regiones (sa-east-1), consola/CLI/SDK, capa gratuita (condiciones vigentes: verificá, cambió en 2025). Mapa en diagrama.
## 13-14 Microsoft Azure: el mapa de servicios
Equivalentes en Azure, Entra ID, suscripciones y grupos de recursos, fortaleza en empresas con Microsoft; región Brazil South y otras.
## 13-15 Google Cloud: el mapa de servicios
Proyectos, BigQuery, GKE, Cloud Run, Firebase dentro de GCP; región southamerica-east1 y Santiago.
## 13-16 AWS, Azure y Google Cloud: diferencias reales
Tabla de equivalencias, diferencias de modelo (cuentas, redes, IAM), precios comparados de un caso fijo con precios de lista fechados, cuota de mercado con fuente; sin ganador.
## 13-17 Supabase y Firebase por dentro
Sobre qué nube corren (verificá en su doc), modelo de precios por uso, límites del plan gratuito, qué pasa al pasarse; retomá [@07-25], [@09-42]. Senda: plan y límites que le aplican (doc del repo + página de precios).
## 13-18 Vercel, Netlify y Cloudflare
Red de borde, Workers (aislados V8), R2, Pages; plataformas de despliegue y su modelo de precios; retomá [@05-25], [@06-27].
## 13-19 Otros proveedores: Hetzner, DigitalOcean, Fly.io, Railway
VPS, bare metal, proveedores regionales; cuándo un VPS de pocos dólares alcanza; costos de lista comparados y lo que uno administra a mano.
## 13-20 Mensajería y eventos en la nube
SQS/SNS/EventBridge, Pub/Sub, Service Bus: mapa y garantías (retomá [@07-14], [@12-17]); demo local equivalente (cola con visibilidad y reintentos en Node o NATS si está).
## 13-21 Seguridad en la nube: el modelo de responsabilidad compartida
Qué asegura el proveedor y qué el cliente, configuraciones erróneas típicas (bucket público, claves en repos, puertos abiertos), registros de auditoría (CloudTrail); casos con fuente oficial. Retomá [@04-06].
## 13-22 Alta disponibilidad y recuperación ante desastres en la nube
Multi-AZ, multi-región, estrategias (backup/restore, pilot light, warm standby, activo-activo) con RPO/RTO y costo (retomá [@09-28]); un postmortem oficial de caída regional.
## 13-23 Arquitecturas híbridas, multi-cloud y lock-in
Nube híbrida, multi-cloud real vs de discurso, lock-in (datos, APIs, egress, conocimiento), cómo medir el costo de salida; Senda y su dependencia de Supabase (qué es portable: Postgres/SQL; qué no: Auth, Storage, funciones edge: verificá en el código).
## 13-24 Costos de la nube y FinOps
Cómo se factura, sorpresas típicas, presupuestos y alertas, reservas/ahorros, etiquetas; calculadora `ejecutable` de un caso inventado; FinOps Foundation (fuente).
## 13-25 Gobernanza: cuentas, organizaciones y etiquetas
Organizaciones y cuentas separadas por entorno, políticas de gobierno (SCP/Azure Policy), etiquetas de costos, landing zone a nivel de idea; para un equipo de una persona: lo mínimo sensato (MFA, alertas, cuentas separadas).
## 13-26 Migrar a la nube y volver
Las 6 R (fuente AWS), TCO, repatriación (casos documentados: 37signals/Basecamp con sus cifras publicadas; verificá), cuándo conviene cada cosa.
## 13-27 La nube de Senda: proveedores y costos reales (tipo S)
Inventario de proveedores de Senda con qué hace cada uno, plan, límite que primero se alcanza y costo de lista vigente; el modelo de capacidad del repo (`scripts/economia/capacidad.py`: corrélo en una copia fuera del repo si no necesita red) y sus supuestos rotulados como estimación; ≥2 bloques `senda`, ≥4 archivos reales; sin recomendar gasto.
## 13-28 Cierre de la Parte 13: la nube como un mapa (tipo R)
Mapa cloud, caso recorrido (llevar una app de despachos a la nube paso a paso con sus decisiones), tabla «pregunta típica → día», 8–12 preguntas. Al final.
