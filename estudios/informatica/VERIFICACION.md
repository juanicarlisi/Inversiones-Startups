# Registro de verificación (Partes 0 a 2; Partes 0 y 1 al 09-11-2026, Parte 2 al 13-11-2026)

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

## Para la app (pendiente)
- Widget de terminal interactivo (lo pidieron varios redactores; muy útil para las Partes 2, 4 y 14); visor de Rss/Pss de procesos que comparten memoria.
