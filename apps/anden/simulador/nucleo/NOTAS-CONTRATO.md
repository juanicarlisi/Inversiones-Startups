# Notas de contrato · P1 Núcleo determinista (18-10-2026; segunda vuelta el 23-10-2026, §13)

Lo que el contrato (`contratos/`) o la especificación (`corte-1.md`) no fija, fija de forma contradictoria o que la referencia
(`contratos/referencia/motor-referencia.ts`) hace distinto. En cada punto: qué pasa, qué supuesto tomó el núcleo y la propuesta para la
integración. **Ninguno cambia la huella de una corrida válida**: R08a da la misma huella que la referencia en los cuatro modelos
sintéticos y cinco semillas (`nucleo/pruebas/diferencial.test.ts`).

## 1. `uniforme` puede dar exactamente 1 (probabilidad 2⁻⁵³)

- **Qué pasa.** §6.6 dice que `u = ((hi >>> 5)·2²⁶ + (lo >>> 6) + 0,5) / 2⁵³` está «siempre en (0, 1)». Con los 53 bits en uno, la suma
  vale 2⁵³ − 0,5, que no es representable y se redondea (al par) a 2⁵³: u = 1 (MEDIDO con Node 22.22). El mínimo, 2⁻⁵⁴, sí es > 0.
- **Consecuencia.** Ninguna: revisado en las 11 distribuciones con u = 1, ninguna da NaN ni negativo (exponencial da −0, Weibull 0,
  Bernoulli 0, triangular, discreta y empírica el máximo, normal y lognormal la media de su rama).
- **Supuesto.** El núcleo usa la fórmula tal cual (cambiarla movería todas las huellas y rompería R08).
- **Propuesta.** Corregir el texto de §6.6 y de `contratos/azar.ts`: «en (0, 1]; u = 1 con probabilidad 2⁻⁵³».

## 2. `correrHasta(hasta)` con `hasta` mayor que el horizonte

- **Qué pasa.** La referencia corta con `heap[0].t > hasta` y procesa eventos con t entre `opciones.hasta` y `hasta`. §6.1 («el
  horizonte excluye eventos con t > hasta») y el comentario de `OpcionesMotor.hasta` dicen que nunca se procesa un evento más allá del
  horizonte; el propio final de la referencia (`ahora = max(ahora, min(hasta, o.hasta))`) también lo supone.
- **Supuesto.** El núcleo corta en `min(hasta, opciones.hasta)` (probado en `motor.test.ts`, «correrHasta: pausa, horizonte…»).
- **Propuesta.** Arreglar la referencia: `if (heap[0].t > Math.min(hasta, o.hasta))`. Solo se nota si alguien llama a `correrHasta` más
  allá del horizonte; `correr()` da lo mismo en los dos.

## 3. `agendar` valida más que la referencia

- **Qué pasa.** El núcleo guarda bloque, tipo, arg y prioridad en `Int32Array` y la fase en `Uint8Array` (§9: «bloque/tipo/arg Int32»).
  La referencia acepta cualquier número: un `arg` de 1,5 o de 2³¹ llegaría distinto a `manejar` en uno y otro motor.
- **Supuesto.** El núcleo lanza un error claro si el bloque no está registrado, si tipo, arg o prioridad no son enteros de 32 bits con
  signo o si la fase no es 0, 1 o 2 (`motor.test.ts`). La huella no cambia: mezcla `x >>> 0`, igual para los enteros válidos.
- **Propuesta.** Que la referencia valide lo mismo (y que el texto de `Motor.agendar` lo diga), para que P2 y P4 vean el error ya con la
  referencia y no recién en la integración.

## 4. Límites del azar: `uniforme(d, i)` con i ≤ 511 y Erlang con k ≤ 512

- **Qué pasa.** El sub-bloque de Philox tiene 8 bits (`(c & 0xffffff)·256 + sub`): hay 256 bloques de 2 uniformes por dirección. La
  referencia enmascara `sub & 0xff` y con i ≥ 512 (o Erlang con k > 512) **repite** uniformes en silencio; con k = 0 da NaN.
- **Supuesto.** El núcleo lanza `RangeError` con i fuera de [0, 511] y con k que no sea entero entre 1 y 512 (también con `discreta`
  de largos distintos o vacía, `empirica` vacía y tipos desconocidos). `bloque(d, sub, out)` enmascara `sub & 0xff` como la referencia.
- **Propuesta.** Que el compilador del modelo (P3) rechace Erlang con k > 512 (`E-RANGO`) y que la referencia valide igual.

## 5. `pow(0, y)` con y < 0

- **Qué pasa.** El contrato fija `pow(0, y > 0) = 0` y `pow(x, 0) = 1`; para y < 0 no dice nada. La referencia devuelve 0 (el valor
  matemático es +∞).
- **Supuesto.** El núcleo devuelve 0, igual que la referencia (lo exige R08 y está en las doradas).
- **Propuesta.** Escribirlo en `contratos/matematica.ts` («pow(0, y) = 0 para todo y ≠ 0») o, si se quiere +∞, cambiar los dos a la vez.

## 6. `sin` y `cos`: la reducción es la de fdlibm completa, no solo «dos términos»

- **Qué pasa.** `contratos/matematica.ts` describe «Cody-Waite con dos términos, válida para |x| ≤ 1.000». El núcleo usa la reducción de
  rango medio de fdlibm (`e_rem_pio2.c`, como V8): dos términos y, si hay cancelación cerca de un múltiplo de π/2, un tercero y un cuarto.
  Solo usa + − × ÷, así que sigue siendo determinista entre motores.
- **Resultado.** 0 diferencias de bits con V8 en [0, 2π] (exigido) y también en ±1.000 y cerca de kπ/2 (informativa: 0 en 10⁶ valores
  cada una; MEDIDO el 18-10-2026). El rango y el error fuera de ±1.000 son los del contrato.
- **Propuesta.** Actualizar el comentario del contrato: «reducción de fdlibm (2 a 4 términos de π/2 de 33 bits)».

## 7. `exp(1)` devuelve el valor exacto de e

- **Qué pasa.** V8 trata aparte `exp(1)` y devuelve `Math.E`: sin ese caso, el algoritmo de fdlibm da 2,7182818284590455 y V8 da
  2,718281828459045 (MEDIDO el 18-10-2026). El núcleo hace lo mismo para coincidir con V8 (está en las doradas y en las pruebas de
  casos especiales).
- **Propuesta.** Ninguna; queda anotado por si otro motor de JavaScript lo resolviera distinto (es justamente lo que mide R04).

## 8. Foto: qué guarda además de lo que pide §6.5

- `Foto.seq` es el **próximo** seq a asignar. El seq del último evento procesado (lo que devuelve `m.seq`) va en `calendario.actual`.
- `calendario` lleva, además de las columnas (`n, t, fase, prioridad, seq, bloque, tipo, arg`): `mismo` y `tAnterior` (estado del
  guardián de lazos de tiempo cero), `bloques` (cantidad) y `rutas` (FNV-1a de cada ruta en orden de registro, para exigir «el mismo
  conjunto de bloques en el mismo orden»), y `semilla` y `replica` **informativas**: se puede restaurar con otra réplica a propósito
  (división de trayectorias, corte 5; lo prueba `foto.test.ts`).
- Todo se **copia** al sacar la foto y al restaurar (la foto no cambia aunque el motor siga, y se puede restaurar varias veces).
- `estado()` tiene que devolver solo arreglos tipados y números: la foto lo exige y da un error claro si llega otra cosa.
- **No guarda la traza** (el escritor): después de restaurar, la traza del motor nuevo tiene solo lo que pasó desde la foto.
  **Propuesta para el corte 2** (arranque en caliente y «desde ahora»): agregar las columnas del escritor a la foto o una foto de traza
  aparte.
- `foto()`, `restaurar()`, `correr()` y `correrHasta()` lanzan si se llaman desde `manejar()`.

## 9. Rutas de bloque repetidas

- **Qué pasa.** La foto identifica cada bloque por su ruta (`bloques: Record<ruta, estado>`), pero `registrar` (en el contrato y en la
  referencia) acepta rutas repetidas.
- **Supuesto.** `registrar` las acepta (para no romper código que corre con la referencia); `foto()` lanza un error que nombra la ruta.
- **Propuesta.** Que `registrar` rechace rutas repetidas en los dos motores (la ruta también alimenta las claves del azar: dos bloques con
  la misma ruta y el mismo propósito compartirían sorteos).

## 10. Escritor de traza: niveles y huecos

- Con `'no'` y con `'kpi'` el escritor no registra nada (tampoco momentos ni el resumen por paquete), igual que la referencia. Si P4
  quiere el resumen por paquete en `'kpi'`, hay que decidirlo en el contrato (hoy no hay forma de pedirlo).
- Un id de paquete sin `paquete()` queda como en la referencia (`camion`, `indice`, `ruta`, `clase` y `vueltas` en 0; `creado` y
  `listo` en NaN). `paquetes.n` es el mayor id pasado a `paquete()` más 1.
- `terminar()` cierra los tramos abiertos en `datos.fin` aunque `fin < t0` (como la referencia); la invariante `t1 ≥ t0` la controla el
  hub (§6.7 regla 16).
- El núcleo lanza si `cerrar(i)` recibe un índice que no existe o si un id de paquete no es entero ≥ 0 (la referencia crearía huecos).

## 11. Tokens prohibidos en las pruebas del núcleo

- Las pruebas de `det` comparan con la matemática nativa a través de `matNativa` de la referencia (está en `contratos/`): `nucleo/` no
  nombra ninguna función prohibida, ni siquiera en las pruebas. El banco informativo (`nucleo/pruebas/rendimiento.ts`, no entra en
  `npm test`) mide con `process.hrtime`. La búsqueda de `tokens.test.ts` cubre todo `nucleo/` (código, pruebas y herramientas) y suma
  las demás funciones trascendentes de Math (`log10`, `log2`, `sinh`, `asin`, `fround`…) y el acceso indirecto `Math[…]`.
- **Propuesta.** Que la prueba de arquitectura de la integración use la misma lista ampliada.

## 12. Rendimiento (informativo)

- M/M/1 sintética (ρ = 0,8, 10⁶ clientes, 2·10⁶ eventos, dos sorteos exponenciales por cliente), mediana de 5 corridas, cada motor en
  su proceso: núcleo **4,1–4,6 M eventos/s**, referencia 2,7 M/s, misma huella (MEDIDO el 18-10-2026 en el contenedor, con los otros
  paquetes corriendo pruebas en paralelo: carga ≈ 1,4). Meta de §9: ≥ 4 M/s. Se repite con `node nucleo/pruebas/rendimiento.ts`.
- Dos decisiones de rendimiento medidas: el estado que cambia por evento vive en un `Float64Array` y no en variables de la clausura
  (+12–17%: los uint32 de la huella no entran en un entero pequeño de V8 y obligaban a reservar memoria por evento), y la huella separa
  `t` en palabras de 32 bits con una resta exacta en vez de `%` de punto flotante.

## 13. Segunda vuelta (23-10-2026): estado, lo que decidió la integración y lo que queda

**Estado (MEDIDO el 23-10-2026, Node 22.22.0, con los otros paquetes corriendo en paralelo: carga ≈ 3,7 en 4 núcleos).**
`node --test "nucleo/**/*.test.ts"`: 83 de 83 en 4,1 s. `tsc`: 0 errores. Tokens prohibidos de §1.4 en todo `nucleo/` (código, pruebas
y herramientas): 0, con dos miradas (texto sin comentarios y árbol sintáctico de TypeScript, que suma el operador de potencia).
Rendimiento informativo (`node nucleo/pruebas/rendimiento.ts`): M/M/1 3,81 M eventos/s de mediana (corridas de 2,9 a 4,9; la
referencia, 2,33; misma huella), Philox 17,7 M bloques/s y 21,4 M uniformes/s. Con esa carga la meta de ≥ 4 M/s no dice nada del motor
(el 18-10-2026, con carga ≈ 1,4, dio 4,1–4,6): el informe ahora trae la carga y los núcleos para que el número se lea bien.

**Lo que decidió la integración sobre estas notas** (`integracion/NOTAS-CONTRATO.md` §1): (1) se acepta la fórmula; la corrección es
de texto. (2) sin cambio (nadie llama a `correrHasta` más allá del horizonte). (3)(4)(9) se aceptan las validaciones más estrictas; el
compilador ya rechaza Erlang con k > 512. (8) la foto sin traza queda para el corte 2. (11) la prueba de arquitectura usa la lista
ampliada más el operador `**`.

**Lo que se sumó en esta vuelta (todo fuera de la huella de fuentes de la batería, ver abajo).**
- `pruebas/tokens.test.ts`: segunda búsqueda con el árbol sintáctico de TypeScript sobre todo `nucleo/` (también pruebas y
  `generar-doradas.ts`), con el operador de potencia (`**` y `**=`), y su control con un ejemplo sembrado.
- `matematica/generar-doradas.ts` exporta `generarDoradas()` (en memoria, sin escribir) y `pruebas/det.test.ts` comprueba que
  `doradas-mat.json` es **byte a byte** lo que genera (con el mismo Node y V8 que lo generaron; con otros, las 6.000 filas) y que `det`
  sigue igual a V8 en esas entradas. Antes nada probaba que el archivo saliera del generador.
- `pruebas/distribuciones.test.ts`: las 11 distribuciones con los uniformes extremos (2⁻⁵⁴ y exactamente 1): valores finitos dentro de su
  soporte y lo que da cada borde, fijado.
- `pruebas/rendimiento.ts`: mide también el azar solo (bloques Philox y uniformes por segundo) y anota la carga del equipo.

**Por qué no se tocó ningún archivo del motor.** Desde el hallazgo H5 (`integracion/CAMBIOS-CONTRATO.md` §8) el sello «85 de 85» depende
del SHA-256 de los archivos que corre la batería; del núcleo son 14: `indice.ts`, `version.ts`, `azar/` (4), `cinematica/trapezoidal.ts`,
`matematica/det.ts` y `doradas-mat.json`, `motor/` (4) y `traza/escritor.ts`. Cambiar uno solo (aunque sea un comentario) pone el sello
en «sin verificar» hasta que la integración vuelva a correr `npm run verificar` (≈ 8 min). Esta vuelta no encontró ningún defecto que lo
justifique; la huella de fuentes sigue en `cf61bfbb…` (135 archivos), la misma de `integracion/salida/bateria-nucleo.json`.

**Para juntar con el próximo cambio que obligue a correr la batería** (ninguno cambia una huella):
- `azar/fuente.ts`: «se esperaba la semilla entero» → «se esperaba la semilla entera» (concordancia; lo mismo con «la réplica»), y las
  pruebas que lo buscan (`fuente.test.ts`).
- `azar/fuente.ts`, `uniforme()`: 21 M/s con carga contra 25–41 M/s de la base; pidiendo de a pares rinde ≈ 40% menos que dos
  uniformes por bloque de Philox solo (validación, conversiones y caché por dirección). Hay margen sin cambiar ningún resultado, si
  el banco lo pide.

**Nuevo sobre el punto 1 (`uniforme` puede dar 1).** Con u = 1 exacto, `bernoulli` de p = 1 da **0** (`u < p` es falso): un suceso
seguro falla una vez cada 2⁵³ sorteos (lo fija `distribuciones.test.ts`). En la práctica no pasa (una noche de 24.000 paquetes pide
≈ 200.000 uniformes, diseño maestro §4.5: un uniforme igual a 1 sale una vez cada ≈ 4,5·10¹⁰ noches), pero el texto «siempre en
(0, 1)» es falso. **Propuesta para el motor 2.0.0** (cambia
todas las huellas, así que solo junto con otro cambio de contrato): usar 52 bits, `u = ((hi >>> 6)·2²⁶ + (lo >>> 6) + 0,5) / 2⁵²`,
que queda **estrictamente** en (0, 1): mínimo 2⁻⁵³ y máximo 1 − 2⁻⁵³, todos exactos (MEDIDO con Node el 23-10-2026). Mientras tanto,
corregir el texto de §6.6 y de `contratos/azar.ts` a «(0, 1]».

**`VERSION_MOTOR` dice `'1.1.0'` y §9 dice `'1.0.0'`.** La subió la integración porque cambió la semántica del **hub** (motor 1.1.0,
`integracion/CAMBIOS-CONTRATO.md` §2); el núcleo no cambió y sus huellas tampoco. O sea: la constante vive en `nucleo/` pero versiona
el motor entero (núcleo + hub), que es lo que va en la receta y en el comprobante. **Propuesta:** corregir §9 («`VERSION_MOTOR`: la
versión del motor completo; la sube quien cambie una huella») y, en el corte 2, mudarla a un archivo de la integración o separar
`VERSION_NUCLEO` de `VERSION_MOTOR`, para que el dueño del número sea el que puede moverlo.
