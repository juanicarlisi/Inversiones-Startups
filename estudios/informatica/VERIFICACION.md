# Registro de verificación (Partes 0 y 1, 09-11-2026)

Qué se verificó y qué no. Los 42 días pasan el validador (estructura, términos, largo, preguntas, fuentes, rutas de Senda), pero eso **no** prueba que cada dato sea cierto: lo declarado por los redactores sobre sus propias fuentes está acá, para una segunda pasada.

## Enlaces
- 340 fuentes registradas; **313 de 339 responden 200** al verificador. Los otros 26 son 403 de sitios que bloquean robots (ACM, W3C, Intel, GAO, cppreference, MySQL, TSMC, Joel on Software, Science Museum) o un certificado que este entorno no valida (csapp.cs.cmu.edu, gaia.cs.umass.edu). Comprobados a mano con navegador: ourworldindata y support.google.com (200). **Ninguno se encontró roto.**
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
