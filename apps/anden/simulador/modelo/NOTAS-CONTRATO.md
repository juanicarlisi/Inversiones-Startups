# Notas de contrato · P3 Modelo y enlace (18-10-2026; puesto al día el 23-10-2026)

Lo que el contrato (`contratos/`) o la especificación (`corte-1.md`) no fija, fija de forma contradictoria o no alcanza a cubrir, y lo que
este paquete agregó por su cuenta. En cada punto: qué pasa, qué supuesto tomó P3 y la propuesta para la integración. **Ninguno cambia un
contrato**: P3 cumple las firmas de `contratos/modelo.ts` y `contratos/escena.ts` tal cual. Los puntos 1, 2, 5 y 8 pedían una decisión de la
integración y ya la tienen (`integracion/NOTAS-CONTRATO.md` §1); los demás son informativos. Lo que cambió después de la revisión del
19-10-2026 (huella agregada `h` en la receta, tope de noches de la receta, tope de la película, `I-PAUSAS-SUPERPUESTAS`) está en los
puntos 3, 7 y 8, y lo que se agregó en la corrida del 23-10-2026 (enlace canónico estricto, medidas de peor caso, fuzz cruzado con el hub)
está en el punto 12.

## 1. `noLeido` es una distribución `bernoulli` en un campo `Num` y `numero()` del contrato la rechaza

- **Qué pasa.** El ejemplo de §5 escribe `sorter.lector.noLeido: "@noLeido"` y el parámetro `noLeido` vale `{ tipo: "bernoulli", p: 0.015 }`.
  `contratos/referencias.ts::numero(m, "@noLeido")` lanza («es una distribución y se pidió un número»): solo acepta número o `fija`.
- **Supuesto de P3.** En los campos que son probabilidades (`atrasoComun.probabilidad`, `lector.noLeido`, los dos `ausentismo`) el compilador
  acepta una referencia a un parámetro `fija` o `bernoulli`, y toma `p` como el número. `modelo/f0.ts::numeroEfectivo` hace lo mismo
  (`numeroDe` es la versión que lanza). En cualquier otro campo `Num`, una referencia a una `bernoulli` es `E-REF.tipo-parametro`.
- **Propuesta.** Cambiar `numero()` de `contratos/referencias.ts` para que una `bernoulli` devuelva su `p` (una línea: `if (v.tipo === 'bernoulli') return v.p;`),
  o poner `noLeido` como número plano en el ejemplo. Sin eso, **P4 no puede leer `noLeido` con `numero()`** y tiene que leer `p` a mano (hoy
  es el único caso del ejemplo). Es lo que más probablemente rompe en la integración.
- **Resuelto (19-10-2026).** La integración dejó el contrato como está: P3 y P4 toman `p` de un parámetro `bernoulli` en los campos de
  probabilidad, y las dos plantillas compilan y corren (MEDIDO el 23-10-2026: 1.109 de 1.500 modelos mutados aceptados por `compilar`, 1.105
  simulados con el núcleo de producción sin una excepción ni un KPI no finito; ver el punto 12).

## 2. «Bomba de deflate de 1 KB → 100 MB» no existe; H03 y H04 caen en `bomba` y no en el tope de nodos o de texto

- **Qué pasa.** Deflate no comprime más de 1.032 : 1, así que 1 KB no puede inflarse a 100 MB. La mayor bomba que cabe en los 16.000
  caracteres de fragmento son ~12 KB → ~12 MB. Además, 10⁶ nodos (≥ 2 MB de texto) y un texto de 1 MB superan los 262.144 bytes
  descomprimidos antes de que el parseo vea los nodos o el largo del texto: el error que sale es `bomba`, no el de nodos o de texto.
- **Supuesto de P3.** H01 usa ~10 KB de ceros comprimidos → 10 MB (cabe en el fragmento y prueba el contador de bytes). Aparte, una prueba corre
  una bomba de **100 MB** directo sobre `descomprimirConTope` y comprueba que corta (`bomba`) en el tope. H03 y H04 se rechazan con `bomba`; para
  probar los topes de nodos y de texto hay dos variantes que sí caben en los bytes: H03b (25.000 nodos → `json-profundo`) y H04b (un título de
  100 KB dentro de un modelo → `esquema`).
- **Propuesta.** Documentar en `contratos/escena.ts` que `json-profundo` cubre profundidad **y** cantidad de nodos (el contrato no tiene un error
  `json-grande`; hoy el tope de nodos devuelve `json-profundo`, y el de texto largo `esquema`).

## 3. Formato de la receta dentro del enlace (`r=`)

`corte-1.md` dice «receta ≤ 160 caracteres» pero no define cómo se escribe. P3 definió un binario compacto v1 → base64url
(`enlace.ts::codificarReceta` / `decodificarReceta`), canónico (un solo texto por receta) y estricto al leer. **Canónico de verdad desde el
23-10-2026:** hasta ahí el último carácter del base64url admitía 4 o 16 variantes que daban los mismos bytes (el decodificador ignoraba los bits
sobrantes) y una velocidad entera escrita como float64 también decodificaba; ahora `deBase64url` exige los bits sobrantes en cero y
`decodificarReceta` rechaza `vel` entera en float64 («vel no canónico»). Lo cubren `enlace.test.ts` (base64url estricto, receta canónica y
float64). El codificador nunca produjo esas formas, así que ningún enlace existente cambia.

| Bytes | Contenido |
|---|---|
| 0 | versión del formato (1 = `Receta.v` 1) |
| 1–8 | huella del modelo (16 hex = 8 bytes) |
| varint ×3 | versión del motor: mayor, menor, parche |
| varint ×2 | semilla (hasta 2³²−1), réplicas (1 a 100.000) |
| 1 | banderas: bit 0 `noche`, 1 `t`, 2 `vel`, 3 `vel` en float64, 4 `esc`, 5 `h` (agregado el 20-10-2026) |
| opcionales, en ese orden | `noche` (varint) · `t` (varint, ms) · `vel` (varint si es entero, si no float64 little-endian) · `esc` (varint cantidad, y por cada id varint largo + UTF-8) · `h` (8 bytes) |

`h` es la **huella agregada de las noches del autor** (16 hex, la del comprobante): con ella quien abre el enlace compara SUS números con los
del autor y el sello «reproducida» deja de ser verdadero por construcción (hallazgo H1 de la revisión, `integracion/CAMBIOS-CONTRATO.md` §1).
El tipo congelado `Receta` no la tiene: viaja como campo opcional extra (`RecetaConHuella = Receta & { h?: string }`). Una receta sin `h` sigue
siendo válida. **Tope de noches (SEG-03):** `replicas` va de 1 a `MAX_REPLICAS_RECETA = 1000` y `noche` de 0 a 999 (antes 100.000).

Los varint son LEB128 sin ceros de relleno (uno con relleno se rechaza: «no canónico»). Después del último campo no puede haber nada.
**MEDIDO (18-10-2026; sin `h`):** receta completa de la prueba (con noche, instante, velocidad y 2 escenarios) = 62 caracteres con `r=`; mínima = 22;
con `h` suma 11 (8 bytes → 11 caracteres).
El tope es de 8 ids de escenario de hasta 64 caracteres; con los 8 al máximo la receta pasa los 160 (el criterio de 160 vale para el uso normal).
**Tamaños medidos:** ejemplo completo = 6.024 caracteres (tope 8.000); `t=hub-chico@1.0.0&p=…` con 5 cambios = 223 (tope 400).

## 4. `crearCodec(resolver, opciones?)` y el error `version-motor`

- **Qué pasa.** `CrearCodec = (resolver) => CodecEnlace` no tiene dónde recibir la versión del motor de la app, pero `ErrorEnlace` incluye
  `'version-motor'` (la receta se hizo con otro motor y la película no se reproduciría bit a bit).
- **Supuesto de P3.** `crearCodec` acepta un segundo parámetro opcional `{ versionMotor: '1.0.0' }` (compatible con la firma del contrato).
  Sin él nunca se emite `version-motor`. Con él, una receta de **otra versión mayor** se rechaza; menor y parche distintos se aceptan.
- **Propuesta.** La integración llama `crearCodec(resolver, { versionMotor: VERSION_MOTOR })`. La regla «misma mayor» es una decisión de
  producto (con motores inmutables, §4.10 del diseño, el service worker podría traer el motor viejo): confirmarla o endurecerla a «versión exacta».
- **Resuelto (19-10-2026).** Cableado en `integracion/ensamblar.ts`; la regla «misma versión mayor» quedó aceptada para el corte 1 (con el motor
  1.1.0 el códec sigue abriendo recetas hechas con 1.0.x).
- `codificar` **lanza** (no devuelve un error) si el fragmento pasa de 16.000 caracteres: mensaje `enlace: muy-largo: …`. P8 («Compartir») tiene
  que atrapar la excepción y avisar; el contrato (`Promise<string>`) no deja otra forma.

## 5. La huella del modelo se calcula sobre el modelo **normalizado**, y el compilador devuelve una copia

- `compilar` no devuelve el mismo objeto que recibe: devuelve `mv.modelo`, una copia limpia (sin `undefined`, `-0` pasa a `0`) y **normalizada**
  (si los pesos de las rutas no suman 1 ± 1e-9, se dividen por su suma y sale `A-PESOS`). La normalización es idempotente: `compilar(mv.modelo)`
  da la misma huella y no vuelve a avisar (probado).
- Por eso la receta tiene que usar `mv.huella`, y el enlace tiene que codificar `mv.modelo` (o el original: da la misma huella al decodificar
  porque el decodificador también compila).
- **Dorada.** `huella(hub-chico del §5) = 0491977a06fedf2a`. **Propuesta (hecha: `integracion/pruebas/puente.test.ts`; revisado el 23-10-2026):** un test de integración exige `huellaModelo(PLANTILLAS['hub-chico@1.0.0'])`
  igual a esa dorada (es decir, que la plantilla de P4 sea el ejemplo de `contratos/ejemplos/hub-chico.json`) y que **las dos plantillas compilen sin
  errores** (`compilar(PLANTILLAS[…])`); P3 probó la escala de la grande con un modelo sintético armado con las reglas de §5 (60 rampas, 50 rutas,
  300 bandejas, 24.000 paquetes): compila. **Medido el 23-10-2026 con las plantillas reales de P4:** `hub-chico@1.0.0` = `0491977a06fedf2a`
  (la dorada) y `hub-lazo-noche@1.0.0` = `407052d652dfe284`, las dos sin errores ni avisos; la propuesta `hub-chico-1.1.0.json` también compila
  (`2c1292154f2b9eec`). Presupuesto de la grande: 31.678 paquetes y 635.492 eventos.

## 6. Casos de borde de F0 que la especificación no cubre

- **Ventana 0** (todos los camiones en el mismo instante, o un solo camión): `llegadaMediaPorHora` no se puede dividir; se usa la capacidad de
  descarga como llegada efectiva (si no es finita, `paquetes × 3600`).
- **Capacidad 0** (por ejemplo `puestosActivos = 0`): la capacidad es 0, la utilización `Infinity` y el cuello esa etapa; `A-RHO` avisa.
- **`finEstimado`** infinito, NaN o mayor que `47:59` se informa como `'47:59'` (el formato de `Hora` no pasa de ahí); `A-CORTE-IMPOSIBLE` lo marca.
- **Medias:** las pedidas por §6.10 son exactas. Las que no están pedidas: `bernoulli` → `p`; `discreta` → media ponderada; `empirica` → media de la
  interpolación lineal de §6.6; `weibull` → `escala · Γ(1 + 1/forma)` con Γ aproximada (Abramowitz y Stegun 6.1.36, error ≤ 3·10⁻⁷), solo con sumas y productos.
- F0 usa solo `+ − × ÷`, `Math.PI`, `Math.round` y `Math.floor` (más `Math.sqrt` en la longitud de las cintas): mismo resultado en cualquier motor.

## 7. Códigos y chequeos que P3 agregó a la lista de §9

La lista de §9 es el piso. Se agregaron, todos con texto en es y en y probados: `E-UNIDAD` (la moneda de los costos no es la del modelo),
`E-RAMPA-EN-DOS-RUTAS`, `A-RAMPA-SIN-RUTA`, `A-INCIERTO` (el medio de `incierto` no coincide con el valor), `A-PROCEDENCIA` (la clave apunta a un campo
que no existe), `E-ESCENARIO` (el parche no se puede aplicar o deja el modelo inválido), `E-DECISION` (rango vacío, más de 30 valores, un valor que
deja el modelo inválido) e `I-CONTROLES` (controles hechos / sin diagnóstico / avisos, para `Comprobante.modelo`: `vars = { controles, pasaron, avisos }`,
catálogo de 24 en `chequeos.ts::CONTROLES`) e `I-PAUSAS-SUPERPUESTAS` (información, desde el 20-10-2026: con el escalón menor que la pausa,
cuántas personas del rol pueden estar en pausa a la vez; con el relevo del motor 1.1.0 es un dato para el comprobante y no un aviso: no entra en
el catálogo de controles). `E-HORAS.corte` exige `inicio ≤ corte ≤ fin + 8 h` (el horizonte de §6.7 regla 1).
`A-SORTER-TIPO` (31-10-2026, hallazgo HUB-R11): `hub.sorter.tipo = 'banda-cruzada'` compila, pero el motor del corte 1 simula todo lazo
como bandejas basculantes; el aviso lo dice en lugar de dejar creer que un cross-belt rinde distinto.
Por qué se compilan los escenarios y los valores de la decisión **al compilar el modelo** («modo profundo»): para que un modelo con un escenario roto
no se acepte y se descubra recién al tocarlo. Costo MEDIDO: 6 ms para el ejemplo (con 4 escenarios y 4 valores); decodificar el enlace completo, 10 ms.
`crearVariante` también compila en modo profundo: una variante se rechaza si sus propios escenarios dejan de ser válidos (no pasó con los del ejemplo).
**No implementado:** `A-LITTLE` (lo nombra un comentario de `contratos/modelo.ts`; la especificación de P3 no lo define) y la verificación de que una
rampa figure en una sola lista de `asignacion` explícita (la especificación no dice qué hace el hub con una rampa de dos personas; hoy se acepta).

## 8. Cotas de seguridad que la especificación no nombra (y que P4 debe respetar)

- **Qué pasa.** Con solo el presupuesto de §9 (`paquetes` y `eventos ≈ paquetes × 14 + horizonte ÷ tick`) quedan pasando modelos válidos que cuelgan
  o revientan al correr: `acumulacion.largo = 1e12` (1,7·10¹² lugares), `sorter.recta = 1e9` (3·10⁹ bandejas), una rampa de capacidad 10⁹,
  10⁹ personas de rampa, pausas «cada 0,001 s» o micro-paradas «cada 0,8 ms» (cientos de millones de eventos que no dependen de los paquetes).
- **Supuesto de P3.** `E-PRESUPUESTO` tiene dos casos nuevos, además de `paquetes` y `eventos`:
  - `memoria`: `lugaresDeMemoria(m)` = bandejas del lazo + lugares de la acumulación + playa + Σ capacidad de rampas + personas (andenes, retén, rampa,
    manual) + puestos físicos ≤ **2.000.000** (`MAX_LUGARES_MEMORIA`). La plantilla grande pide ~2.000.
  - `recurrentes`: `eventos + eventosRecurrentes(m)` ≤ 50.000.000, con pausas (2 eventos por pausa y persona de inducción y de rampa) y micro-paradas.
  - `traza` (agregado el 20-10-2026, hallazgo SEG-01 de la revisión): paquetes estimados × `TRAMOS_POR_PAQUETE` (12; MEDIDO 11,5 en el chico, 11,6 en
    el grande, 11,9 la noche más cargada) ≤ `MAX_TRAMOS_ESTIMADOS` (2.000.000, ≈ 70 MB la película de una noche). Un enlace de 7.950 caracteres que
    pasaba los topes de paquetes y de eventos pedía 11,5 millones de tramos (400 MB por noche); la grande estima ~380.000. Solo se evalúa si los
    paquetes ya entraron en su tope.
  `estimarPresupuesto` **no cambia**: devuelve exactamente los dos números de §9 (10.560 y 339.840 para el ejemplo).
- **Consecuencia para P4.** «Rampas sin tope» de L01–L03 se pide con una capacidad grande: con `compilar` no puede pasar de ~2·10⁶ en total; en las pruebas
  de P4 conviene `validadoSinChequeos` y, en el código, dimensionar los anillos con `min(capacidad, paquetes máximos)`.
- **Hallazgo corregido de la corrida anterior:** `demanda.camiones.cantidad = 1e308` daba un presupuesto NaN (`Infinity − Infinity` en el redondeo)
  y el modelo **pasaba** el tope. Ahora `techo()` deja pasar lo no finito y los topes se comparan con `!(x <= max)`. Cubierto por una prueba y por el fuzz.

## 9. Anonimizar: qué cambia y qué no

- Cambia: sin `autor` ni `descripcion`; `id` y `titulo` neutros; ids de andenes, cintas, puestos, rampas, excepción, sorter, rutas («Ruta 01…», tres dígitos
  si son más de 99) y camiones («Camión 01…») renombrados **con sus referencias** (también dentro de los parches de los escenarios); volúmenes × f con
  f ∈ [0,8; 1,25) derivado de la semilla (incluidos los parches que cambian la demanda); costos y `decision.indiferencia.valor` a 2 cifras significativas;
  la `fuente` de los costos y de los datos `DATO_USUARIO` / `MEDIDO` reemplazada (suele repetir el número exacto).
- **No cambia** (hay que avisarlo en «Compartir», P8): los textos libres `escenarios[].titulo`, `decision.pregunta` y `dichoComo`, `parametros[].pregunta`,
  `nota` y `unidad`, y los nombres de los parámetros. Si el autor escribió ahí el nombre de una empresa, viaja.
- **La semilla de anonimizar tiene que ser secreta y distinta de `experimento.semilla`** (que viaja en la receta): con ella cualquiera recalcula f y
  recupera los volúmenes reales. Propuesta: P8 la saca de `crypto.getRandomValues`. El modelo anonimizado compila (probado con escenarios y decisión).

## 10. Textos (`textos.es.json` / `textos.en.json`) y variables

- 125 claves iguales en es y en (23-10-2026), con las mismas variables `{nombre}` (probado). `Diagnostico.clave` = `modelo.diag.<código>[.<caso>]`; hay además un texto
  genérico `modelo.diag.<código>` para los códigos con casos (respaldo si aparece una clave nueva), `modelo.enlace.<ErrorEnlace>` (9), `modelo.etapa.<descarga|induccion|sorter|rampas>`
  (los nombres de las etapas de F0 y del cuello) y `modelo.nivel.<error|aviso|info>`.
- Las variables llegan **crudas** (`2000000`, `0.0123`, ids tal cual): P8 puede darles formato es-AR si `traducir` formatea los números. Los textos no usan
  la `ruta`: la interfaz la muestra aparte. Todo texto que viene del modelo (ids, valores, `fuente`) llega por `vars`: se pone con `textContent`.
- Una prueba (`textos.test.ts`) exige las dos direcciones: toda clave que el compilador emite en los 122 casos de `mutaciones.ts` (99 claves distintas) tiene texto, y todo texto
  del diccionario lo emite algún caso (menos los de respaldo).

## 11. Otros supuestos menores

- **Tope de lista y de trabajo** (no están en la especificación): 50 escenarios, 200 operaciones por parche, 30 valores de la decisión, 100 diagnósticos por
  compilación (se corta con `E-ESQUEMA.demasiados`), 8 escenarios y 1.000 noches en la receta. Los 20.000 nodos y los 1.000 caracteres por texto son los de `LIMITES_ENLACE`.
- **`huella.ts`** usa `crypto.subtle` y, si no existe o lanza (contexto no seguro: la PWA abierta por `http://` en una IP de la red local), una implementación propia de
  SHA-256 (FIPS 180-4) que da los mismos bytes; probada contra `node:crypto` en todos los largos de 0 a 300 y en bloques grandes.
- **Soporte del navegador.** `CompressionStream('deflate-raw')` y `DecompressionStream('deflate-raw')` se usaron según el diseño (§4.9). Probadas en Node 22.22 y,
  por la integración (`integracion/NOTAS-CONTRATO.md` §1 y §10), en Chromium 141: ida y vuelta exacta del modelo completo (6.024 caracteres) y de plantilla + 5
  cambios, y H01 por la URL con aviso en 0,3–0,4 s. Falta la versión mínima de Chrome, Firefox y Safari (Firefox y WebKit no están en el entorno: R04 queda
  «Node = Chromium»); si un navegador no lo soporta, `codificar` lanza y `decodificar` devuelve `formato` con el detalle, sin colgarse.
- **JSON canónico.** Si un valor no tiene representación JSON (NaN, infinito, `undefined` dentro de una lista, función, `Map`…), `jsonCanonico` **lanza** diciendo la ruta; una
  propiedad con valor `undefined` cuenta como ausente. Más de 1.000 niveles lanza (no agota la pila).
- **Texto de la entrada.** Caracteres prohibidos en todo texto y clave: controles C0 y C1, separadores de línea y de párrafo, marcas de dirección (U+202A–202E, U+2066–2069) y
  sustitutos UTF-16 sueltos (dos textos distintos darían la misma huella).
- **Dependencias.** Ninguna de ejecución; `modelo/` solo importa de sí mismo y de `contratos/` (probado por `arquitectura.test.ts` sobre el texto de los archivos,
  junto con la ausencia de `Math.random`, `log`, `exp`, `pow`, `sin`, `cos`, `Date`, `performance`, DOM y red).

## 12. Corrida del 23-10-2026: revisión del paquete terminado y lo que se agregó

El paquete llegó a esta corrida completo (ya integrado y endurecido por la revisión del 19-10-2026). Se revisó de punta a punta contra §9 de
`corte-1.md` y se midió de nuevo; solo se tocó lo que sigue.

- **Medido hoy.** `node --test "modelo/**/*.test.ts"`: 302 pruebas, 302 pasan, 0 fallan, 0 omitidas, ≈ 6,5 s (eran 300: se sumaron 2); `tsc -p tsconfig.json`: 0 errores;
  búsqueda de los tokens de §1.4 en `modelo/*.ts` fuera de comentarios y textos: 0. El ejemplo de §5 compila con `I-SUPUESTOS` (14 de 20) y
  `I-CONTROLES`; F0 = 3.200 · 4.320 · 3.937,5 · 11.320,754716981131 · 4.725, cuello `induccion`, `finEstimado` `24:30`; huella `0491977a06fedf2a`;
  modelo completo 6.024 caracteres; presupuesto 10.560 paquetes y 339.840 eventos.
- **Enlace canónico de verdad (cambio de código).** `deBase64url` rechaza los bits sobrantes distintos de cero y `decodificarReceta` rechaza una
  `vel` entera escrita como float64 (punto 3). Antes la receta era maleable: el último carácter admitía 16 variantes que daban los mismos bytes.
  Pruebas nuevas en `enlace.test.ts`: «base64url estricto», «receta canónica» y el caso de float64 en «bytes mal formados».
- **Peor caso de latencia del compilador (MEDIDO, Node 22.22, JIT frío).** Un modelo en el borde de los 20.000 nodos tarda: 50 escenarios × 20 a 90
  operaciones, 229–410 ms; 50 escenarios + cinta de 4.000 puntos + 30 valores de decisión, 210 ms; 50 escenarios + 1.900 camiones + 30 valores,
  518 ms. Está acotado (el trabajo es (escenarios + valores) × tamaño del modelo, y el tamaño lo corta el tope de nodos), pero en un teléfono
  de gama media serían 2–5 s en el hilo de la interfaz. Si la integración quiere eliminar el riesgo, puede correr `compilar` del enlace en un
  Worker; el costo del modo profundo se puede bajar validando cada variante sin su lista de `escenarios` (queda como propuesta: cambia qué
  detecta el modo profundo cuando un parche toca `/escenarios`).
- **Fuzz cruzado con el hub (scratch, no entra al repositorio).** Se mutaron hojas numéricas del ejemplo (×0, ×0,001 … ×100, −1, enteros
  redondeados) y se corrió el simulador de producción (`hub/` + `nucleo/`) sobre todo modelo que `compilar` aceptó y estima ≤ 1,5 M de eventos.
  Cuatro semillas, 13.500 modelos mutados: 3.591 rechazados, 9.909 aceptados, 9.884 simulados (25 saltados por pasar de 1,5 M de eventos), **0 excepciones,
  0 KPI no finitos**; las únicas alertas son 225 `no-termina` (configuraciones sobrecargadas, que el semáforo ya pone en rojo). Es la evidencia de
  que lo que `compilar` acepta, el hub lo puede correr; si algún día aparece una excepción en el hub con un modelo aceptado, el chequeo que falta
  es de P3.
- **Efecto sobre el sello del motor (importante para la integración).** `modelo/enlace.ts` está en la clausura de imports de la batería
  (`integracion/huella-fuentes.mjs` lista 13 archivos de `modelo/`), y era el único archivo de esa clausura distinto de `HEAD`. Con este cambio la
  huella de fuentes de `integracion/salida/bateria-nucleo.json` (`cf61bfbb…`) ya no coincide y la construcción dice «sin verificar» en lugar de
  «85 de 85» hasta volver a correr `npm run verificar` (≈ 9 min). La batería no prueba enlaces, así que su resultado no puede cambiar; para
  volver al estado anterior sin correrla basta `git checkout -- modelo/enlace.ts modelo/pruebas/enlace.test.ts`.
- **Sigue sin hacer:** `A-LITTLE` (lo nombra un comentario de `contratos/modelo.ts`, la especificación de P3 no lo define); comprobar que una rampa
  figure en una sola lista de `asignacion` explícita; probar `CompressionStream('deflate-raw')` en Firefox y Safari (el entorno solo trae
  Chromium: R04 queda «Node = Chromium» con los otros dos pendientes); la anonimización no toca los textos libres (punto 9).
