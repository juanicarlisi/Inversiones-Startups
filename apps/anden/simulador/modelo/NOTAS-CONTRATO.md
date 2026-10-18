# Notas de contrato · P3 Modelo y enlace (18-10-2026)

Lo que el contrato (`contratos/`) o la especificación (`corte-1.md`) no fija, fija de forma contradictoria o no alcanza a cubrir, y lo que
este paquete agregó por su cuenta. En cada punto: qué pasa, qué supuesto tomó P3 y la propuesta para la integración. **Ninguno cambia un
contrato**: P3 cumple las firmas de `contratos/modelo.ts` y `contratos/escena.ts` tal cual. Los puntos 1, 2, 5 y 8 piden una decisión de la
integración; los demás son informativos.

## 1. `noLeido` es una distribución `bernoulli` en un campo `Num` y `numero()` del contrato la rechaza

- **Qué pasa.** El ejemplo de §5 escribe `sorter.lector.noLeido: "@noLeido"` y el parámetro `noLeido` vale `{ tipo: "bernoulli", p: 0.015 }`.
  `contratos/referencias.ts::numero(m, "@noLeido")` lanza («es una distribución y se pidió un número»): solo acepta número o `fija`.
- **Supuesto de P3.** En los campos que son probabilidades (`atrasoComun.probabilidad`, `lector.noLeido`, los dos `ausentismo`) el compilador
  acepta una referencia a un parámetro `fija` o `bernoulli`, y toma `p` como el número. `modelo/f0.ts::numeroEfectivo` hace lo mismo
  (`numeroDe` es la versión que lanza). En cualquier otro campo `Num`, una referencia a una `bernoulli` es `E-REF.tipo-parametro`.
- **Propuesta.** Cambiar `numero()` de `contratos/referencias.ts` para que una `bernoulli` devuelva su `p` (una línea: `if (v.tipo === 'bernoulli') return v.p;`),
  o poner `noLeido` como número plano en el ejemplo. Sin eso, **P4 no puede leer `noLeido` con `numero()`** y tiene que leer `p` a mano (hoy
  es el único caso del ejemplo). Es lo que más probablemente rompe en la integración.

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
(`enlace.ts::codificarReceta` / `decodificarReceta`), canónico (un solo texto por receta) y estricto al leer:

| Bytes | Contenido |
|---|---|
| 0 | versión del formato (1 = `Receta.v` 1) |
| 1–8 | huella del modelo (16 hex = 8 bytes) |
| varint ×3 | versión del motor: mayor, menor, parche |
| varint ×2 | semilla (hasta 2³²−1), réplicas (1 a 100.000) |
| 1 | banderas: bit 0 `noche`, 1 `t`, 2 `vel`, 3 `vel` en float64, 4 `esc` |
| opcionales, en ese orden | `noche` (varint) · `t` (varint, ms) · `vel` (varint si es entero, si no float64 little-endian) · `esc` (varint cantidad, y por cada id varint largo + UTF-8) |

Los varint son LEB128 sin ceros de relleno (uno con relleno se rechaza: «no canónico»). Después del último campo no puede haber nada.
**MEDIDO (18-10-2026):** receta completa de la prueba (con noche, instante, velocidad y 2 escenarios) = 62 caracteres con `r=`; mínima = 22.
El tope es de 8 ids de escenario de hasta 64 caracteres; con los 8 al máximo la receta pasa los 160 (el criterio de 160 vale para el uso normal).
**Tamaños medidos:** ejemplo completo = 6.024 caracteres (tope 8.000); `t=hub-chico@1.0.0&p=…` con 5 cambios = 223 (tope 400).

## 4. `crearCodec(resolver, opciones?)` y el error `version-motor`

- **Qué pasa.** `CrearCodec = (resolver) => CodecEnlace` no tiene dónde recibir la versión del motor de la app, pero `ErrorEnlace` incluye
  `'version-motor'` (la receta se hizo con otro motor y la película no se reproduciría bit a bit).
- **Supuesto de P3.** `crearCodec` acepta un segundo parámetro opcional `{ versionMotor: '1.0.0' }` (compatible con la firma del contrato).
  Sin él nunca se emite `version-motor`. Con él, una receta de **otra versión mayor** se rechaza; menor y parche distintos se aceptan.
- **Propuesta.** La integración llama `crearCodec(resolver, { versionMotor: VERSION_MOTOR })`. La regla «misma mayor» es una decisión de
  producto (con motores inmutables, §4.10 del diseño, el service worker podría traer el motor viejo): confirmarla o endurecerla a «versión exacta».
- `codificar` **lanza** (no devuelve un error) si el fragmento pasa de 16.000 caracteres: mensaje `enlace: muy-largo: …`. P8 («Compartir») tiene
  que atrapar la excepción y avisar; el contrato (`Promise<string>`) no deja otra forma.

## 5. La huella del modelo se calcula sobre el modelo **normalizado**, y el compilador devuelve una copia

- `compilar` no devuelve el mismo objeto que recibe: devuelve `mv.modelo`, una copia limpia (sin `undefined`, `-0` pasa a `0`) y **normalizada**
  (si los pesos de las rutas no suman 1 ± 1e-9, se dividen por su suma y sale `A-PESOS`). La normalización es idempotente: `compilar(mv.modelo)`
  da la misma huella y no vuelve a avisar (probado).
- Por eso la receta tiene que usar `mv.huella`, y el enlace tiene que codificar `mv.modelo` (o el original: da la misma huella al decodificar
  porque el decodificador también compila).
- **Dorada.** `huella(hub-chico del §5) = 0491977a06fedf2a`. **Propuesta:** un test de integración exige `huellaModelo(PLANTILLAS['hub-chico@1.0.0'])`
  igual a esa dorada (es decir, que la plantilla de P4 sea el ejemplo de `contratos/ejemplos/hub-chico.json`) y que **las dos plantillas compilen sin
  errores** (`compilar(PLANTILLAS[…])`); P3 probó la escala de la grande con un modelo sintético armado con las reglas de §5 (60 rampas, 50 rutas,
  300 bandejas, 24.000 paquetes): compila.

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
catálogo de 24 en `chequeos.ts::CONTROLES`). `E-HORAS.corte` exige `inicio ≤ corte ≤ fin + 8 h` (el horizonte de §6.7 regla 1).
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

- 123 claves iguales en es y en, con las mismas variables `{nombre}` (probado). `Diagnostico.clave` = `modelo.diag.<código>[.<caso>]`; hay además un texto
  genérico `modelo.diag.<código>` para los códigos con casos (respaldo si aparece una clave nueva), `modelo.enlace.<ErrorEnlace>` (9), `modelo.etapa.<descarga|induccion|sorter|rampas>`
  (los nombres de las etapas de F0 y del cuello) y `modelo.nivel.<error|aviso|info>`.
- Las variables llegan **crudas** (`2000000`, `0.0123`, ids tal cual): P8 puede darles formato es-AR si `traducir` formatea los números. Los textos no usan
  la `ruta`: la interfaz la muestra aparte. Todo texto que viene del modelo (ids, valores, `fuente`) llega por `vars`: se pone con `textContent`.
- Una prueba (`textos.test.ts`) exige las dos direcciones: toda clave que el compilador emite en los 121 casos de `mutaciones.ts` (97 claves distintas) tiene texto, y todo texto
  del diccionario lo emite algún caso (menos los de respaldo).

## 11. Otros supuestos menores

- **Tope de lista y de trabajo** (no están en la especificación): 50 escenarios, 200 operaciones por parche, 30 valores de la decisión, 100 diagnósticos por
  compilación (se corta con `E-ESQUEMA.demasiados`), 8 escenarios en la receta. Los 20.000 nodos y los 1.000 caracteres por texto son los de `LIMITES_ENLACE`.
- **`huella.ts`** usa `crypto.subtle` y, si no existe o lanza (contexto no seguro: la PWA abierta por `http://` en una IP de la red local), una implementación propia de
  SHA-256 (FIPS 180-4) que da los mismos bytes; probada contra `node:crypto` en todos los largos de 0 a 300 y en bloques grandes.
- **Soporte del navegador.** `CompressionStream('deflate-raw')` y `DecompressionStream('deflate-raw')` se usaron según el diseño (§4.9); en esta sesión solo se
  probaron en Node 22.22. Falta verificar la versión mínima de Chrome, Firefox y Safari (a medir en R04/integración); si un navegador no lo soporta, `codificar`
  lanza y `decodificar` devuelve `formato` con el detalle, sin colgarse.
- **JSON canónico.** Si un valor no tiene representación JSON (NaN, infinito, `undefined` dentro de una lista, función, `Map`…), `jsonCanonico` **lanza** diciendo la ruta; una
  propiedad con valor `undefined` cuenta como ausente. Más de 1.000 niveles lanza (no agota la pila).
- **Texto de la entrada.** Caracteres prohibidos en todo texto y clave: controles C0 y C1, separadores de línea y de párrafo, marcas de dirección (U+202A–202E, U+2066–2069) y
  sustitutos UTF-16 sueltos (dos textos distintos darían la misma huella).
- **Dependencias.** Ninguna de ejecución; `modelo/` solo importa de sí mismo y de `contratos/` (probado por `arquitectura.test.ts` sobre el texto de los archivos,
  junto con la ausencia de `Math.random`, `log`, `exp`, `pow`, `sin`, `cos`, `Date`, `performance`, DOM y red).
