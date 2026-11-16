# Parte 14: DevOps, infraestructura y despliegue. Notas por día.
Contexto: el estudiante ya vio el oficio (git, CI, CD a nivel de idea: 04-19..04-21), SO y contenedores por dentro (02-23, 02-24), redes, backend, bases (migraciones: 09-31), mobile (compilación y tiendas: 10-24..10-29) y cloud (Parte 13). Esta parte es cómo se opera y entrega de verdad. TODO se corre en esta VM cuando se pueda: es Ubuntu 24.04 SIN systemd (no hay `systemctl`/`journalctl` vivos: mostrá archivos de unidad y logs reales de `/var/log` o de un contenedor propio, y rotulá lo que es «según la documentación»), root, con `ip netns`, nftables, nginx (ya instalado por otros redactores; verificá), Caddy si baja como binario liviano, OpenSSH (levantá `sshd` propio en puerto 26xxx con claves de práctica y `ssh` a localhost), cron en `unshare`, Docker: PROBÁ si hay daemon (`docker info`); si no, usá `podman`/`buildah`/`runc`/`skopeo`/`crun` si instalan livianos por apt, o construí la imagen «a mano» (rootfs + `unshare`/`chroot`, capas con tar y hashes) y decilo; Kubernetes: `kind`/`k3s`/`minikube` casi seguro no corren (sin systemd/cgroups delegados): intentá un binario único (k3s) solo si no rompe nada y en un tiempo acotado; si no, kubectl contra nada no sirve: explicá con manifiestos reales validados (`kubectl --dry-run=client` o `kubeconform` si baja) y un mini-orquestador de juguete que reconcilia estado deseado vs real; Terraform/OpenTofu como binario único con el proveedor `local`/`null`/`random` (sin nube); Ansible por pip contra localhost; `act` no (necesita Docker): GitHub Actions por doc oficial + `actionlint` (ya usado en 04-20); Vault en modo dev si baja liviano, si no `age`/`sops`. Sin cuentas ni credenciales de nada; secretos de práctica con formato obviamente falso. Versiones vigentes al 16-11-2026 verificadas en fuente oficial. Disco compartido justo (nada de más de 300 MB; borrá por ruta exacta solo lo tuyo), puertos 26xxx, `rm` con comodines y `pkill`/`kill` por patrón bloqueados. Logística: paralelos de operación (turnos, guardias, checklist de despacho) con su límite. SENDA: su «fábrica» son 10 workflows de GitHub Actions (`apk.yml`, `aab.yml`, `humo.yml`, `firma.yml`, `supabase.yml`, `supabase-despertar.yml`, `limpieza.yml`, `lotes.yml`, `biblias.yml`, `candidatos.yml`), Supabase CLI fija en 3.0.0, sin EAS en uso (`eas.json` existe y nadie lo llama), sin Docker propio ni IaC, sin staging (una sola base), secretos en GitHub; hallazgos ya conocidos (ningún workflow corre `tsc`/lint ni escucha `pull_request`; `aab.yml` sin validadores, AdMob ni R8 y con firma dudosa; `versionCode` fijo; `${{ inputs.* }}` dentro de `run`; acciones `@v4` sin fijar por SHA; migraciones con `exception when others` alrededor de `cron.schedule`). Verificá en /home/user/senda-app (solo lectura) antes de citar; el 14-24 es entero de Senda.

## 14-01 Qué es DevOps
Origen (2009, Allspaw–Hammond; Phoenix/Accelerate), cultura vs herramientas, las métricas DORA (retomá [@04-21]) y la ingeniería de plataforma; qué significa para un equipo de una persona.
## 14-02 Linux para servidores I: archivos, procesos y logs
Dónde vive cada cosa en un servidor, procesos y señales (retomá Parte 2), zombis (creá uno), carga (`uptime`, `/proc/loadavg`), logs (`/var/log`, journald por doc), `df`/`du`/`free`/`top`, disco lleno como incidente (esta misma VM lo sufrió: contalo).
## 14-03 Linux para servidores II: usuarios, paquetes y cron
Usuarios y `sudo`, mínimo privilegio, apt y actualizaciones de seguridad (`unattended-upgrades` por doc), cron real en un `unshare`, timers de systemd por doc; retomá [@07-18].
## 14-04 SSH: claves, túneles y acceso seguro
Criptografía de SSH (retomá [@05-21]), par de claves ed25519, `authorized_keys`, `known_hosts` y el aviso de huella, agente, túneles `-L/-R`, bastión, endurecimiento (`PasswordAuthentication no`); todo contra un `sshd` propio en localhost.
## 14-05 Hosting, dominios y DNS en la práctica
Comprar un dominio (registrador vs DNS vs hosting: retomá [@05-13]), registros A/AAAA/CNAME/MX/TXT (SPF/DKIM/DMARC a nivel de qué son), TTL y «propagación», verificación de dominio para servicios; zona de práctica con un servidor DNS local (BIND/dnsmasq ya usados en 05-11). Senda: `web/` sin publicar, `app-ads.txt`, dominio pendiente (sin presionar).
## 14-06 Servidores web y proxies inversos
nginx y Caddy: servir estáticos, proxy inverso, terminación TLS (certificado de práctica; ACME por doc: retomá [@05-23]), compresión, cabeceras, límites; medí con y sin gzip.
## 14-07 Docker I: imágenes y contenedores
Imagen = capas + config (formato OCI: abrí una imagen real bajada con `skopeo`/`crane` o armada a mano y mostrá manifest, config y capas), contenedor = proceso aislado (retomá [@02-24]), registros (Docker Hub, GHCR: límites y licencias con fecha).
## 14-08 Docker II: Dockerfile, volúmenes, redes y Compose
Dockerfile instrucción por instrucción y caché de capas, volúmenes vs bind mounts, redes de contenedores (bridge: reproducilo con netns), Compose; construí con la herramienta que haya (`buildah`/`podman`/Docker) o mostrá el equivalente manual.
## 14-09 Laboratorio: contenerizar una aplicación (tipo L)
La API de despachos de [@07-28] en una imagen mínima con compilación multietapa (tamaños medidos antes y después), usuario no root, `.dockerignore`, healthcheck; ≥5 ejercicios con solución corrida.
## 14-10 Kubernetes I: por qué y cómo es por dentro
El problema (muchos contenedores, muchas máquinas), plano de control (API server, etcd, scheduler, controladores), nodos y kubelet, el bucle de reconciliación (implementá uno de juguete y matale «pods»); retomá consenso [@12-23].
## 14-11 Kubernetes II: Pods, Deployments, Services e Ingress
Manifiestos YAML reales validados, etiquetas y selectores, Service (ClusterIP/NodePort/LoadBalancer), Ingress, rolling update; con el mini-orquestador o un clúster real si lo lograste.
## 14-12 Kubernetes III: configuración, almacenamiento, escalado y cuándo no usarlo
ConfigMap/Secret (base64 no es cifrado), volúmenes persistentes, HPA, costo operativo real y alternativas (Cloud Run, PaaS, un VPS): cuándo NO usar K8s (casi siempre al principio).
## 14-13 Entornos: desarrollo, pruebas, staging y producción
Paridad (12 factores), entornos efímeros por PR, datos de prueba (anonimización), feature flags (retomá [@07-19]). Senda: una sola base viva + base local de `pruebas/nube` como sustituto de staging (verificá).
## 14-14 CI/CD I: pipelines a fondo
Etapas, caché, matriz, artefactos versionados, «construí una vez, promové» (retomá [@04-20], [@04-25]), pipeline local con make/scripts medido con y sin caché.
## 14-15 CI/CD II: GitHub Actions por dentro
Eventos, workflows, jobs, steps, runners alojados (specs y minutos gratis con fecha), secretos y `GITHUB_TOKEN`, permisos mínimos, reutilización; `actionlint` sobre ejemplos. Senda: anatomía de `apk.yml` (verificado).
## 14-16 Estrategias de despliegue
Recreate, rolling, blue/green, canary, rollback y sus costos; simulación con dos versiones detrás de nginx y un error sembrado (retomá [@05-25]).
## 14-17 Migraciones de base de datos en el despliegue
Orden (migrar antes o después), compatibilidad en dos versiones, expand-contract (retomá [@09-31]), migraciones reversibles o roll-forward; demo con Postgres propio y dos versiones de app. Senda: `supabase.yml` despliega solo con push a `main` y sus migraciones no tienen marcha atrás.
## 14-18 Infraestructura como código I: la idea y Terraform
Por qué IaC, declarativo, `plan`/`apply`, proveedores; corré OpenTofu/Terraform con proveedores locales (archivos, random) y mostrá el plan; licencia de Terraform (BSL) y OpenTofu (verificá estado).
## 14-19 Infraestructura como código II: estado, módulos y alternativas
El archivo de estado (qué guarda, por qué es sensible, bloqueo, backends), módulos, deriva (cambiá algo a mano y mirá el plan), Pulumi/CloudFormation/CDK por doc.
## 14-20 Gestión de secretos
Dónde viven los secretos en operación (retomá [@04-06], [@07-19]), KMS y cifrado de sobre, Vault (dev mode si corre) o `sops`+`age`, rotación, secretos efímeros (OIDC entre GitHub Actions y nubes: doc). Senda: 9 secretos y 3 variables en GitHub; contraseña del keystore como entrada de `firma.yml` (hallazgo).
## 14-21 Gestión de configuración y deriva
Ansible contra localhost (idempotencia demostrada corriéndolo dos veces), mascotas vs ganado, infraestructura inmutable, deriva de configuración.
## 14-22 Release engineering móvil
Trenes de lanzamiento, congelamiento, rollout escalonado y pausa (retomá [@10-27], [@10-29]), versiones y `versionCode`, canales, hotfix; Senda: «cada APK trae todo» y qué cambia al entrar a tienda (sin opinar sobre fechas).
## 14-23 Cadena de suministro de software
Dependencias maliciosas y typosquatting (casos con fuente: retomá [@04-05]), SBOM (generá uno con `syft`/`cyclonedx-npm` si baja), firma de artefactos (cosign/Sigstore por doc o corrido), fijar acciones por SHA, SLSA a nivel de mapa. Senda: acciones `@v4` y dependencias sin Dependabot.
## 14-24 La fábrica de Senda: GitHub Actions, EAS y Supabase CLI (tipo S)
Los 10 workflows uno por uno (disparador, qué hace, cuánto tarda si consta, qué controla antes de compilar), `lotes.yml` (lotes de Claude), `supabase.yml` y la CLI, la prueba de humo en emulador; qué está automatizado y qué depende de una persona; ≥2 bloques `senda`, ≥4 archivos reales; hallazgos con verificación propia.
## 14-25 Cierre de la Parte 14: del commit a producción (tipo R)
Mapa de entrega, un caso recorrido (un cambio chico desde el commit hasta producción con rollback), tabla «pregunta típica → día», 8–12 preguntas. Al final.
