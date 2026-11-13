# Registro de verificación (Partes 0 a 4; Partes 0 y 1 al 09-11-2026, Partes 2 a 4 al 13-11-2026)

Qué se verificó y qué no. Los 74 días escritos pasan el validador (estructura, términos, largo, preguntas, fuentes, rutas de Senda), pero eso **no** prueba que cada dato sea cierto: lo declarado por los redactores sobre sus propias fuentes está acá, para una segunda pasada.

## Enlaces
- 720 fuentes registradas; **659 de 685 enlaces responden 200** al verificador (fuentes y enlaces dentro de los textos). Los otros 26 son 403 de sitios que bloquean robots (ACM, W3C, Intel, GAO, cppreference, MySQL, TSMC, Joel on Software, Science Museum) o un certificado que este entorno no valida (csapp.cs.cmu.edu, gaia.cs.umass.edu). Comprobados a mano con navegador: ourworldindata y support.google.com (200). **Ninguno se encontró roto.**
- `moore-1965` apunta a `http://` (copia de Stanford; con https reseteaba la conexión).

## Datos de fuente secundaria o de memoria (revisar si importan)
| Día | Dato | Estado |
|---|---|---|
| 01-01 | Origen del ábaco, Schickard vs Pascal, 1801/1804 de Jacquard, leyenda del guarda de tren de Hollerith, años del censo de 1880 (Britannica no abrió) | Discutido; el texto lo dice. Fechas de Leibniz de fuente secundaria. |
| 00-06 | «No consta que otro RFC reemplace al 9110» | Deducido de que la ficha no muestra «Obsoleted by». |
| 01-02 | Detalle de la «Nota G» (operandos invertidos en la operación 4) | Solo fuentes secundarias; sin atribuir autoría. Citas y 25 tarjetas verificadas en el texto de 1843. |
| 01-03 | Collatz «verificado hasta ~10²⁰»; fecha del teorema de Rice (1953); «las cuánticas no salen de lo computable» | Respaldo débil o sin fuente; Collatz con nota de vigencia. |
| 01-05 | Fecha del memo de Eckert (1944); «primer programa almacenado» (ENIAC abr-1948 vs Baby jun-1948); 150 kW como «unos 50 aires» | Marcado como discutido/estimación. Las 18.000 válvulas × 10.000 h es supuesto declarado. |
| 01-06 / 01-07 | Precios de PDP-8, Apple II, Macintosh; Altair a USD 439; G1 (oct-2008); Google Maps Navigation; ChatGPT; código de barras 1974; Intel 4004; Nobel 1956 y 2000; Windows 1.0 | Sin enlace verificable (403/redirección) o de búsqueda/conocimiento previo. Precio del System/360 y serie de GFLOPS: estimación. «Costo por transistor dejó de bajar desde 28 nm»: atribuido y marcado discutido. |
| 01-08 | Setun (1958), flash multinivel | Fuente secundaria. PCIe 6.0 con cuatro niveles «según PCI-SIG» (especificación solo para miembros). |
| 01-11 | Apple decimal desde Mac OS X 10.6 (2009); símbolo «bit» de ISO/IEC 80000-13 y edición 2008; RAM «binaria en la práctica»; umask | Apple: versión archivada; los otros: buscador o conocimiento general. |
| 01-13 | Java da la vuelta en silencio y `Math.addExact` avisa; PostgreSQL «integer out of range» | De memoria. Contador de 248 días del 787 = 2³¹ centésimas: inferencia propia (la FAA no dice cuántos bits). |
| 01-14 | IEEE 754 salió en 1985; yen y dinar kuwaití con 0 y 3 decimales | De memoria. Error del Patriot = 1/10 truncado a 24 bits: inferencia consistente con GAO. |
| 01-15 | Unicode 18.0 (172.808 caracteres) | La página lleva aviso de borrador; con nota de vigencia. |
| 01-17 | 44,1 kHz por los adaptadores de video | Wikipedia; «explicación habitual». |
| 01-23 | ARM64 con 31 registros de 64 bits; largo de instrucciones ARM (4 B) y x86 (1 a 15 B) | Sin cita. |
| 01-25 | Máximo de 15 bytes por instrucción x86 y desglose ModRM de `01 45 f8` (del Intel SDM); Rosetta 2 «desde 2020»; System/360 «1964» | De memoria. RISC-V ADD/SUB verificado contra docs.riscv.org y llvm-mc. |
| 01-27 | Comunicados JEDEC (DDR5 jul-2020, LPDDR5X jul-2021) | Citados por reproducción (design-reuse.com); L3 de 10 a 40 ns es estimación. |
| 01-29 / 01-30 | Cifras PCIe 6.0/7.0 y USB4 v2 | Vía comunicados reproducidos y Wikipedia. DMI 4.0 x8 ≈ PCIe 4.0 x8 es equivalencia propia. eMMC HS400 secundaria. UFS 5.0 (JEDEC 26-02-2026): sin fecha oficial de teléfonos. |
| 01-31 | 6 fuentes de Wikipedia (Dennard, Amdahl, HT, Pentium 4, Tomasulo, Shader) | Los originales no abrían. Cotas de tokens/s y Pentium D: estimación. |
| 01-33 / 01-34 | Fechas históricas (8086, ARM, Opteron, UEFI); 15 B de x86; nombres BOOTX64.EFI / BOOTAA64.EFI | Wikipedia o de memoria. |
| 01-35 | Energía por operación (suma 0,1 pJ; caché 10–100 pJ; RAM 1.300–2.600 pJ, 45 nm) | Del paper de Horowitz (ISSCC 2014) vía trabajos que lo reproducen. Antena: medición de 2010 (Carroll y Heiser). Batería 3,85 V y tabla de autonomía: supuestos. |
| 00-01 | Bjork y Bjork 2011 («dificultades deseables») | No se pudo abrir el capítulo; se atribuye según Roediger y Karpicke. Varios enlaces apuntan a resúmenes (PubMed/APS), no al paper completo. |
| 00-03 | A17 Pro «~19.000 millones de transistores» | Sin fuente formal. |

## Lo medido por los redactores (reproducible)
Código ejecutable de los días corrido en Node; programas del widget `microcpu` replicados en Python; ensamblador compilado con gcc 13.3 y clang 18.1.3; codificaciones RISC-V con llvm-mc; gzip -9 sobre archivos de Senda; matriz por filas vs columnas en un servidor virtual (dato único de esa máquina, cociente ~1,2 a ~5 según tamaño).

## Hallazgos sobre Senda surgidos al escribir (commit 25e08fa)
- El reintento con espera creciente de `src/util/nube.ts` se corta a 320 s (`fallos` limitado a 7), no a «10 min» como dicen `docs/ESCALA.md` y el mapa; con la cola llena (500) se descartan las respuestas más viejas.
- APK de prueba solo arm64 (`docs/PESO.md`); `humo.yml` compila x86_64; `apk.yml` suma x86_64 con la opción «emulador»; `aab.yml` no fija ABIs.
- Además, del mapa técnico (§17): clave de respuestas `preguntas_clave` desincronizada de `contenido/espadeo.json`; «plan» Premium/Max como interruptor local; `aab.yml` sin AdMob ni validadores; sin reporte remoto de fallos.

## Para la app
- Hecho en esta sesión: notas visibles en móvil; clase CSS repetida que ponía las notas «Ojo» en mayúsculas; widget `contraste`.

## Parte 2 (Sistemas operativos, 13-11-2026): qué se midió y qué no
**Medido en este entorno** (Ubuntu 24.04, kernel 6.18.44, VM KVM de 4 vCPU; son datos de una sola máquina, no cifras generales): costo de una llamada al sistema (~85 ns), crear 10.000 hilos vs procesos, cambio de contexto, ticks del temporizador (HZ=250), OOM killer con registro de `dmesg` y salida 137, tope de CPU por cgroup (1 s de trabajo en 4,9 s), overlayfs, un contenedor con `runc`, un `.exe` real (PE) inspeccionado, ASLR con y sin `setarch -R`, `fork` con marcos físicos distintos, `readelf`/`ldd`/`strace`, `stat`/`df -i`/`debugfs` (tras `rm`, los bytes siguen en el bloque), contador con y sin mutex, interbloqueo reproducido y ThreadSanitizer.
**Hallazgos del entorno que se contaron como tales:** el PID 1 es `process_api` (indicio de Firecracker, no prueba), no systemd; el kernel se compiló sin módulos (`CONFIG_MODULES` apagado); no hay `/dev/kvm` ni `vmx`; no hay páginas de `man` ni PowerShell. En Python 3.13 la condición de carrera no se reprodujo (se dejó como lección, no se forzó).
**Solo documentación (nada corrido):** todo Windows, macOS, Android e iOS (Microsoft Learn, Apple Platform Security, source.android.com), con fechas del 13-11-2026 (macOS 27.2.1; Rosetta hasta macOS 27; Android 17/API 37; fin de soporte de Windows 10 y ESU de consumidores al 12-10-2027).
| Día | No verificado en fuente primaria |
|---|---|
| 02-01 / 02-02 | GM-NAA I/O, CTSS y Linux 1991 (Wikipedia); que Linux manda SIGSEGV ante un #GP (interpretación del `si_code` de strace); cadena de capas de Senda (inferencia); EL0/EL1 de ARM (Wikipedia). |
| 02-03 / 02-04 | Tramo entre Smss y Winlogon; que el Zygote cree `system_server` (la doc no lo dice); `loginuid` 4294967295 como «sin asignar» (inferencia); columna «dónde lo ves» de `task_struct` (propia). |
| 02-05 / 02-06 | Fecha de EEVDF (KernelNewbies 29-10-2023 vs docs del kernel «2024»: se usó la primera); base de EEVDF tomada del comentario del código; una cola de listos por núcleo (OSTEP y lectura parcial de `fair.c`). Descartado un experimento SCHED_RR/FIFO cuyos números no se explicaron. |
| 02-07 / 02-08 | Ticks en núcleos ociosos de la VM (hipótesis); paginación de 5 niveles no expuesta (inferencia); «Memoria virtual» en Windows; ancho virtual de teléfonos ARM; `[vvar]`. |
| 02-09 / 02-10 | Tamaño de TLB (solo orden de magnitud); fallo de TLB ~10 ns y fallo mayor 40–117 µs (propios); corte de overcommit 15/20 GiB (observación); «sin swap» de iOS (guía archivada 2003–2013); swap de Android y aviso previo (no verificado). |
| 02-11 / 02-12 | Origen de las letras de unidad de Windows; papelera = mover a carpeta («en general»); bloque de 4 KiB en el teléfono (estimación). |
| 02-13 / 02-14 | iPhone (el artículo de Apple solo cubre iPad con chip M); citas traducidas por el redactor; los 8,5 millones de equipos de CrowdStrike son dato de Microsoft sin método explicado. |
| 02-15 / 02-16 | Ubuntu/Fedora/RHEL con systemd por defecto («conocimiento general»); origen de «daemon» (Jargon File, sin URL estable); `systemctl` no corrido (no hay systemd). |
| 02-17 / 02-18 | Coma decimal en `sort -n` (manual de coreutils, sin prueba); PowerShell, `setx`, `%PATH%`, `CreateProcess` no ejecutados; macOS solo hedgeado. |
| 02-19 / 02-20 | Mach-O (solo docs de Apple; la guía figura «retirada»); «MZ» de PE (observación del archivo, no de la especificación); tabla j00ru sin mapear versiones; `arm64-v8a` «cubre casi todos» (comentario de `apk.yml`). |
| 02-21 / 02-22 | Bloqueo de fila entre dos teléfonos de un duelo (la doc de PostgreSQL no lo dice explícito); 126/127 como convención de bash; `CreateProcess` en un paso; Zygote por COW (inferencia). |
| 02-23 / 02-24 | Historia (Popek–Goldberg, VT-x/AMD-V, VMware, chroot/LXC/Docker) de Wikipedia; Firecracker como indicio; si el emulador de Senda usa KVM (no se confirmó). |
| 02-25 / 02-26 | Historia de NT (Cutler 1988…2001) y `ntdll.dll` (Wikipedia); cita de Torvalds 1991 y fecha de la GPL (Wikipedia); openSUSE con zypper/RPM (no verificado). |
| 02-27 / 02-28 | Expansión de TCC; «macOS se parece más a monolítico» (criterio propio); celdas de Linux de la tabla; launchd «bajo demanda» (guía archivada); `spctl` copiado de la doc sin ejecutar. |
| 02-29 / 02-30 | Hermes y la restricción de memoria W^X de iOS (inferencia propia); «sin swap en iOS»; carpetas del contenedor de iOS (doc archivada); firma en Windows/Linux y regiones fuera de la UE (celdas sin cita). |
| 02-31 / 02-32 | UID real, tamaño de `RKStorage`, manifiesto final fusionado y comportamiento por fabricante (no hay teléfono); lo demás se leyó en el manifiesto generado con `expo prebuild` sobre una copia del commit. |

## Hallazgos nuevos sobre Senda (commit 25e08fa, a confirmar en un teléfono o con el fundador)
- **Copia de seguridad automática de Android:** el manifiesto trae `allowBackup="true"` sin exclusiones; por la documentación de Android, el Auto Backup podría copiar el almacenamiento local (`RKStorage`), sesión incluida. El mapa técnico no lo menciona.
- **Avisos con demora:** no declara `SCHEDULE_EXACT_ALARM`, así que en Android 12 o superior los avisos locales pueden llegar con minutos de demora.
- **Escrituras fallidas en silencio:** `src/util/almacen.ts` escribe con `.catch(() => {})` vacío y AsyncStorage tiene un tope de 6 MB por defecto.
- **Permiso heredado:** `SYSTEM_ALERT_WINDOW` viene de la plantilla de Expo y nada en `src/` lo pide.
- **Reintento de red:** se corta a 320 s (no 10 min); con la cola llena se descartan las respuestas más viejas (ya anotado antes).
- **Contenedores:** no hay Dockerfile, compose ni devcontainer; el Postgres de la prueba de base es el del sistema.
- **Pruebas de humo:** la corrida n.º 10 (1-nov-2026) terminó bien en ~42 min; el flag `-gpu swiftshader_indirect` figura como obsoleto en la doc de Android y la virtualización anidada no está oficialmente soportada en GitHub.
- **.gitignore:** no hay `.env` versionado, pero tampoco regla para ese nombre.

## Partes 3 y 4 (13-11-2026): qué no se verificó en fuente primaria
Lo demás de cada día se corrió en la VM (Node 22, Python 3.13, Go, Rust, GHC, Git 2.43, PostgreSQL 16, gitleaks, ESLint, actionlint, etc.); los tiempos son de una sola VM y están rotulados.
| Días | No verificado o de segunda mano |
|---|---|
| 03-39 / 03-40 | Costos de lista enlazada y grafo (de la definición); Pike como creador de Go; estado del Python sin GIL (3.15.2 lo deja opcional según lo leído); hilos de `Libro.tsx` no medidos en un teléfono. |
| 03-47 / 03-48 | Reuters 2017 sobre COBOL (segunda mano); ISO/IEC 1989:2023 (fecha de listados); fechas de Prolog, Smalltalk, Python, Java, Node, npm, V8 y Deno (Wikipedia); 6,3 M de paquetes de npm (Libraries.io); 40.000 programas COBOL (página de IBM, vendedor interesado). TypeScript 7.0 salió el 8-07-2026; la `tsc` local es la 6.0.2. |
| 03-59 | Hermes/JS tomado de 03-42 y 03-43; orden de recorrido de Go y Rust citado de su documentación. |
| 04-01 / 04-02 | Royce 1970 (reseñas, PDF dio 403); Glass 40–80 % de mantenimiento (reseña del libro); origen del LSP (nota de prensa de Red Hat); VS Code de escritorio no corrido (doc oficial); `tsc --lsp --stdio` de TypeScript 7 es observación propia. |
| 04-03 / 04-04 | PowerShell solo por doc; `~/.bashrc` en terminales interactivas (memoria); CocoaPods no corrido (necesita macOS; cierre de trunk el 2-12-2026 según su blog); Maven Central sin conteo oficial; 4,6 M de npm es orden de magnitud. |
| 04-05 / 04-06 | NVD no legible (CVE-2024-3094 vía oss-security); Dependabot, Renovate, push protection y trufflehog solo por doc; que `~` de Expo siga la serie del SDK es observación propia. |
| 04-07 / 04-08 | Años de RCS, CVS, Subversion y fechas de Hamano (Wikipedia); 93,9 % de Git en Stack Overflow 2022 (orden de magnitud); firma `gpgsig` de Senda no verificada. |
| 04-09 / 04-10 | Artículo completo de Fowler sobre ramas (solo índice); capítulo `reset` de Pro Git citado sin leerlo; fecha exacta de Git 2.23. |
| 04-11 / 04-12 | Bitbucket (rotulado); páginas de docs.github.com leídas por resumen; Bacchelli–Bird y Sadowski sí leídos enteros. |
| 04-13 / 04-14 | Dijkstra EWD249 (PDF caído, vía Hillel Wayne); libro de Bossavit no abierto; datos de Google 80/15/5 leídos en página. |
| 04-15 / 04-16 | «Fake It» de Beck de memoria (Canon TDD sí leído); Goodhart/Strathern (Wikipedia); Wake 2001 vs artículo de 2011. |
| 04-17 / 04-18 | Cunningham 2009 (transcripción de terceros); NIST SP 500-235 vía mccabe.com; CodeQL y extensión ESLint de VS Code no probados; `--strict` por defecto en TS 6 sale de `tsc --help --all`. |
| 04-19 / 04-20 | Gradle y npm con caché (memoria); `setup-node` con `cache: npm`; ningún APK real de Senda abierto; `verificar.yml` solo validado con actionlint. |
| 04-21 / 04-22 | Royce (Wikipedia); Buehler et al. 1994 solo por Crossref; kanban «cartel» y rol de Scrum Master de memoria; métricas DORA: no se verificó en qué informe se sumó la quinta; precios de Jira/Linear no leídos. |
| 04-23 / 04-24 | Diátaxis solo en su página de inicio; notas de vigencia de GitHub (13-11-2026); «prueba desarrollo» en un AAB de `aab.yml` es inferencia; el ADR de Senda es una reconstrucción rotulada. |
| 04-25 | Versiones de acciones `@v4` no corridas en Actions. |

## Hallazgos sobre Senda de las Partes 3 y 4 (commit 25e08fa)
- **Integración continua:** ningún flujo corre `tsc`, ESLint ni Prettier ni escucha `pull_request`; de 10 flujos solo `supabase.yml` (push a `main`) y `limpieza.yml` (cron) corren solos; `aab.yml` no corre validadores ni pruebas; `versionCode` fijo en 41; no hay `expo-updates`. 0 PR, 0 issues, 4 ramas, 189 corridas de Actions (144 manuales), 8 de los últimos 100 commits son merges sin PR; no hay CODEOWNERS, plantillas ni Dependabot.
- **Calidad estática:** 159 comentarios `eslint-disable` en 49 archivos sin ESLint instalado (con una configuración de prueba: 214 mensajes, 171 de `no-require-imports`); 166 funciones con complejidad > 10 (`Leccion` 165, `QuienEs` 125, `Jugar` 112, `Lector` 99); `reprogramarAvisos` (30–31) sin prueba; Prettier reescribiría 195 de 204 archivos.
- **Dependencias:** 849 paquetes para 55 directas; `npm audit` sobre copia del lock: 20 avisos (3 altos, 9 moderados, 8 bajos), uno moderado directo en `@dicebear/core` 9.4.2; `expo-constants` es dependencia fantasma (importada en `src/util/juntos.ts`); `three ^0.186.1` no admite 0.187.0; `typescript ~6.0.3` deja afuera la 7.0; gitleaks marca solo `google-services.json` (clave de Firebase, no secreta según su doc).
- **Red:** el reintento de `nube.ts` llega a 480 s (no 10 min como dicen el comentario y el mapa); `enviarTurnosPendientes` descarta el turno ante cualquier error que no sea `sin_senal`; solo `interruptores.ts` y `lugares.ts` fijan tiempo máximo; `cuenta.ts` manda `Authorization: Bearer <clave pública>` siempre, `nube.ts` solo si empieza con `eyJ`; `respuestas` tiene `with check (true)` sin tope por emisor; alta anónima sin captcha.
- **Pruebas:** `pruebas/nube/correr.sh` dio 261 de 261 pasos (el mapa decía ~188, contaba llamadas); 10 pruebas Jest; ninguna toca `repaso.ts`, habilidad ni misiones; la prueba de humo es lo más parecido a una E2E.
- **Discrepancias de documentación:** `CLAUDE.md` dice 3 vidas y 1 por hora, `src/tema.ts` dice 5 y 30 min; `docs/LANZAMIENTO.md` cita `expo-secure-store` que no está en `package.json`; `docs/PESO.md` dice 405 lecciones (hoy 482 y 5.402 preguntas vivas); `version_app` de métricas fijo en «0.13»; comentario de `glosarioBiblia.ts` dice formas de dos palabras pero el código busca de tres; `apk.yml` instalación del NDK: `yes | sdkmanager … && break` puede terminar en verde si fallan los reintentos; `lotes.yml` y `aab.yml` insertan `${{ inputs.* }}` dentro de `run`.
- **Otros:** 8 líneas de `console.*` y ningún reporte remoto de fallos; Senda no usa WebSocket propio ni supabase-js; Hermes por defecto y JS sin minificar por Metro (inferencia con medición de bytecode).

## Para la app (pendiente)
- Widget de terminal interactivo (lo pidieron varios redactores; muy útil para las Partes 2, 4 y 14); visor de Rss/Pss de procesos que comparten memoria.

## Parte 5 (Redes e Internet, 13-11-2026): qué no se verificó en fuente primaria
Entorno: proxy HTTPS; ICMP y UDP directos limitados; DNS interceptado (solo registros A); sin IPv6, `netem` ni WireGuard en el kernel; laboratorios con `ip netns`, veth, nftables, tcpdump y tshark en localhost; los tiempos de curl miden hasta el proxy.
| Días | No verificado o de segunda mano |
|---|---|
| 05-01 / 05-02 | Baran, Davies y Kleinrock (RAND dio 403; ETHW e Internet Society); fecha de ISO 7498; cuentas de Kurose–Ross de memoria; checksum offload es explicación habitual. |
| 05-03 / 05-04 | IEEE 802.3 y 802.11 (de pago; clases de Jain y Keysight); WPA2/WPA3 fechas de fuentes secundarias; sin radio en la VM (baliza armada a mano). |
| 05-05 / 05-06 | «Octeto» por bytes de otros tamaños (memoria); reservas actuales de LACNIC no legibles. |
| 05-07 / 05-08 | Fechas de agotamiento regional (informe de Huston); cifras de IPv6 de APNIC Labs (Argentina 34,8 %, mundo 44,2 %); corte de Facebook 2021 según Cloudflare y Meta; la VM no tiene IPv6 (ejemplo rotulado). |
| 05-09 / 05-10 | 24 Mbit/s de ADSL2+ (secundarias); altitud geoestacionaria; qué ISP argentinos usan CGNAT (desconocido); hole punching 82 %/64 % de Ford et al. (medición vieja). |
| 05-11 / 05-12 | Cisco DAI y MAC aleatoria (resumen WebFetch); dnsmasq leído a medias; DNS real por DoH porque el UDP/53 está interceptado. |
| 05-13 / 05-14 | Cifras vivas de root-servers.org; «1983» de 4.2BSD (blog de APNIC); TTL de segundo nivel no medidos. |
| 05-15 / 05-16 | Mecanismo del «bad udp cksum»; `Recv-Q` en CLOSE-WAIT; MTU 1.500 y juegos (práctica general). |
| 05-17 / 05-18 | RFC 7231–7235 fechas de memoria; BBR retransmitió más (no investigado); propuesta de Berners-Lee solo vía cern-web. |
| 05-19 / 05-20 | TCP+TLS 1.3 en dos idas y vueltas (estándar, no medido); HTTP/3 no probado (curl sin soporte; solo RFC y `Alt-Svc`). |
| 05-21 / 05-22 | RSA 1978 (solo resumen); edad del universo; significado legal de `ITSAppUsesNonExemptEncryption`; ClientHello híbrido de 1.577 bytes (medido en Node con OpenSSL 3.5.9; la VM trae OpenSSL 3.0.13). |
| 05-23 / 05-24 | X.509 como estándar ITU (memoria); origen de `X-Forwarded-For`; gateway Envoy de Supabase (inferencia); MTU 1420 de WireGuard (inferencia). |
| 05-25 / 05-26 | Autores de RFC 4786 y 6202 (memoria); `IAD` = Dulles (inferencia); límites de Supabase Realtime (200 en Free, 500 en Pro, del proveedor); nginx `sticky` según la doc. |
| 05-27 / 05-28 | 1983 y el metro (BIPM); índice de fibra de Corning vía distribuidor; largo de Firmina; Muuss (su relato). |
| 05-29 / 05-30 | ECH oculta el nombre (no verificado); causa del intento extra de Chrome con `ignoreHTTPSErrors`; tiempos «en frío» son cálculo. |
| 05-31 / 05-32 | Qué hacen `Prefer`/`on_conflict` de PostgREST (429); no se llamó a la base real; RTT de 50 ms inventado en 05-32. |

## Hallazgos sobre Senda de la Parte 5 (commit 25e08fa)
- **Red:** solo HTTPS con `fetch` (nada de WebSocket, UDP ni sockets propios); salas en vivo con sondeo cada 2 s, Inicio cada 45 s, encuesta cada 8 s; el reintento de `nube.ts` llega a 480 s (320 s de base), no a 10 min; `enviarTurnosPendientes` descarta el turno ante cualquier error que no sea `sin_senal` (incluido un 5xx); solo `interruptores.ts` (5 s) y la búsqueda de direcciones (9 s) fijan tiempo máximo; `cuenta.ts` siempre manda `Authorization: Bearer <clave pública>`, `nube.ts` solo si empieza con `eyJ`; la doc de Supabase pide la clave nueva solo en `apikey`.
- **Base:** `respuestas` con `with check (true)` sin tope por emisor; alta anónima sin captcha; la migración `20261101000000_juntos.sql` ya agrega tablas a `supabase_realtime` aunque el cliente no use Realtime (una sala de 500 llenaría el tope de Pro, 200 en Free: inferencia a probar con carga).
- **Región de Supabase:** no consta en el repo (la URL va en un secreto); hay que mirarla en el panel.
- **Repo:** `auditoria-textos.json` está versionado en la raíz de `senda-app`: es el informe de una corrida fallida (681 de 3.110 casos con `ERR_CONNECTION_REFUSED`); conviene sacarlo o regenerarlo. La URL de Supabase queda grabada en cada APK (`EXPO_PUBLIC_*`). Sin fijado de certificados ni configuración de seguridad de red propia. Hash DJB2 no criptográfico en `src/util/respaldo.ts`; la función `compras` (RS256) no la invoca nada.

## Parte 6 (Frontend, 13-11-2026): qué no se verificó en fuente primaria
Todo lo medido con Chromium 153 y Playwright 1.63 en una VM de 4 CPU compartida, sin GPU, sin teléfono real ni lector de pantalla real; tiempos con ±20 % de ruido.
| Días | No verificado o de segunda mano |
|---|---|
| 06-01 / 06-02 | Fechas de Netscape e IE (no figuran); explicación del `User-Agent` (habitual); Safari 6 % en Argentina como hipótesis; StatCounter mide visitas, no personas. |
| 06-03 / 06-04 | Margen de 3.000 px de `loading=lazy` (medido, no en el estándar); origen «usuario» de la cascada; `:nth-child(of S)` fuera de la calculadora. |
| 06-05 / 06-06 | `dvh` sin teléfono real (el emulador da 664 para vh/svh/lvh/dvh); Baseline desde `web-features` 3.46.0. |
| 06-07 / 06-08 | Baseline de subgrid, `:has`, container queries (npm `web-features`); dato argentino de StatCounter (octubre 2026: celular 51,87 %); no hay dato de INDEC. |
| 06-09 / 06-10 | Nombre `UpdateLayoutTree` = «Recalculate Style» (inferencia); memoria de capas es nominal, no de GPU; «ahorro de batería solo en OLED» sin fuente. |
| 06-11 / 06-12 | `touchstart` pasivo por defecto y `innerText` (MDN); `Pressable` de react-native-web como `<button>` solo con render de servidor. |
| 06-13 / 06-14 | Pedidos idénticos en paralelo serializados en Chrome (hipótesis); filas de 120/144 Hz extrapoladas; sin teléfono. |
| 06-15 / 06-16 | Fechas de AngularJS, Angular 2, jQuery de CHANGELOG; Svelte 0.0.1 de npm; no se pudo verificar cuándo se presentó React. |
| 06-17 / 06-18 | Nombres internos `$$typeof`/`_owner`/`_store` (medidos, no documentados); React 19.3.1 de `npm view`. |
| 06-19 / 06-20 | Complejidad n³ de la doc vieja de React 18.2; notas de Fiber de un repo no oficial; números de `tag` de fibras (internos). |
| 06-21 / 06-22 | Sin teléfono (CPU frenado 6× es emulación); react.dev se contradice sobre transiciones (nota de vigencia); mercado de herramientas de estado no verificado. |
| 06-23 / 06-24 | `gcTime`/reintentos de TanStack Query por la guía (no medibles en Node); zod en navegador no medido; sin lector de pantalla real. |
| 06-25 / 06-26 | Anuncio de cambio de pantalla a lectores (sin fuente); desajuste de hidratación por husos horarios (razonamiento). |
| 06-27 / 06-28 | React Compiler solo por el anuncio de Next 16; Vapor/Vue 3.6 solo por tag `rc`; HTML duplicado del componente de servidor es interpretación propia. |
| 06-29 / 06-30 | Angular 2 como producto distinto de AngularJS (conocimiento propio); fechas de Angular 2 de npm; no se citan empresas que usan Angular. |
| 06-31 / 06-32 | Adam Wathan–Tailwind (del texto); gráficos de State of JS/Stack Overflow de terceros; Preact alto por dependencias (inferencia); sin dato de empleo en CABA. |
| 06-33 / 06-34 | JAWS comercial y TalkBack/VoiceOver incluidos (general); 57 % de axe vía Storybook/Deque; DTCG 2025.10 es Community Group Report, WCAG 3.0 borrador. |
| 06-35 / 06-36 | Fitts, Hick, MacKenzie, Hyman por DOI (403): fórmulas vía Wikipedia; Apple HIG 44 pt y Material 48 dp solo como los cita `MARCO_UX.md`; ease-out/in como criterio. |
| 06-37 / 06-38 | CORS de PostgREST por resumen de búsqueda (429); funciones de borde desde navegador es inferencia; cuota de Chromium medida (3 GiB temporal, 10 GiB persistente) no explicada; sin Safari ni Firefox. |
| 06-39 / 06-40 | Umbrales de LCP/INP/CLS por WebFetch; fecha exacta del INP; tope de 7 días de Safari (dato de 2020); push real y Background Sync solo doc. |
| 06-41 / 06-42 | Fechas de primera publicación de bundlers (de npm); 1 s por defecto de `findBy` (memoria); forma de trofeo de Dodds (título); Nx no corrido. |
| 06-43 / 06-44 | Exportación web de Senda no armada (se usó una app mínima propia con Expo 57.0.33 / RNW 0.21.4); ~838 KB del Lany en base64 es cuenta; URL fija en la web es inferencia. |

## Hallazgos sobre Senda de la Parte 6 (commit 25e08fa)
- **Estilos y temas:** sin librerías de estilos (`StyleSheet.create`, 47 archivos); `useEstilos` recalcula con el tema; 5 temas en `src/tema.ts`; la app no consulta `prefers-color-scheme`/`Appearance`. Contraste (cuenta sobre los tokens, a confirmar con el fondo real): tema Clásico `enlace` #b87710 da 3,69 contra blanco y 3,21 contra su base, `texto3` 3,01; `Kicker` lo usa a 10,5 px; `texto3` aparece 354 veces en 61 archivos; el `texto3` de Índigo pasa de 5,10 a 3,43 según el fondo. WCAG 2.2: `MARCO_UX.md` dice «05-10-2023» pero la vigente es la republicada del 12-12-2024.
- **Tokens sin uso:** `espacio` no lo importa nadie; `radio` se usa 3 veces frente a 490 `borderRadius` numéricos y 348 hex fuera de `tema.ts`.
- **Accesibilidad:** 335 de 339 elementos tocables declaran `accessibilityRole`; 321 `accessibilityLabel` y ningún `testID`; `Boton` chico mide 43 dp (la regla R8 pide 44); sin Storybook ni registro de pruebas con TalkBack/VoiceOver.
- **Estado:** 21 stores de zustand con `persist` (el mapa decía 11); `migrate` de `usuario.ts` castea sin zod; `useAjustes()` sin selector en 4 archivos; zod solo en `leerNovedades`; React Compiler no activado (plugin 1.0.0 solo transitivo); `cargarNovedades` con `if (pidiendo) return pidiendo;` antes de mirar si es forzada (inferencia, hasta 45 s de dato viejo).
- **Efectos y listas:** 235 `useEffect(` en 75 archivos y 21 `let vivo = true` en 16; 282 `key={` y 29 `key={i}` en 15 archivos (sin auditar si se reordenan); sin StrictMode ni ESLint.
- **Textos en el código:** `Proponer.tsx` (líneas 197-201) tiene texto de pantalla en español dentro del código, contra la regla de claves en tres idiomas; el mínimo de 10 caracteres de «para quién» existe solo en el cliente.
- **Web:** `web/` son 73 páginas (docs dicen 72), pasan el validador Nu; `web/estilo.css` 31 líneas sin `@media`; sin PWA (ni manifiesto ni Service Worker); `registrarPush` devuelve false en web; las tres funciones de borde (`borrar-cuenta`, `trivia-sermon`, `compras`) no devuelven cabeceras CORS y `sermon.ts` tiene una rama web que las llama (probable preflight fallido desde navegador); token `senda-sesion` sin cifrar en AsyncStorage (legible por scripts en la web); `almacen.ts` traga errores de tope con `.catch(() => {})`; el `<html lang="en">` de la exportación web lo corrige `texto.tsx`; importar `react-native-android-widget` sin guarda deja la página web en blanco.
- **Navegación y red:** `NavigationContainer` sin `linking`, los enlaces `senda://unirme/…` se interpretan con una regex en `abrirEnlace`; 34 `Pila.Screen` más 5 pestañas; fuentes: 10 `.ttf` suman 2,3 MB (en WOFF2 el sitio ahorraría ~600 KB).
- **Herramientas:** un solo `package.json` sin workspaces; bundler Metro 0.84.5; 10 pruebas Jest con 16 `jest.mock`; `scripts/auditoria/textos.cjs` usa Playwright que no está en `package.json`; ningún workflow menciona web ni Playwright; React 19.2.3 fijado (la última es 19.3.1); `MARCO_UX.md` llega a R28 aunque `CLAUDE.md` dice 27 reglas.
