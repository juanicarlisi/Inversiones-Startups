# Notas de contrato · P7 Explicación y decisión (18-10-2026; actualizadas el 23-10-2026, ver §14)

Lo que el contrato (`contratos/`) o la especificación (`oportunidades/proyectos/anden/corte-1.md`) no fija, fija de forma ambigua o no
alcanza a cubrir, lo que este paquete agregó por su cuenta y lo que midió contra el hub real. En cada punto: qué pasa, el supuesto con el
que siguió P7 y la propuesta. Decide la integración (corte-1.md §2 y §14.8). **Ninguno cambia un contrato**: P7 cumple las firmas de
`contratos/explicacion.ts` y `contratos/decision.ts` tal cual (lo comprueba `tsc`). Los números son MEDIDOS el 18-10-2026 en Node 22.22.0, con
el motor de referencia, el hub (P4) y el compilador (P3) tal como estaban ese día, en scripts de prueba fuera del repositorio (P7 no importa
otros paquetes; la integración puede rehacerlos). Los puntos 1 a 6 piden un cableado o una decisión de la integración o de P8; los demás
son informativos. **Qué cambió desde entonces** (revisión adversarial del 19-10, hub y motor 1.1.0, cableado de la integración) y los números
re-medidos el 23-10-2026 están en la **§14**; donde una cifra de §5 a §13 quedó vieja, la §14 dice cuál vale hoy.

## 1. Cableado de `Servicios` (el contrato no trae `sim` ni `variante`)

- **Qué pasa.** `ContrafactualDirigido` recibe el simulador y la variante como argumentos, pero `Servicios.contrafactual(mv, semilla, replica,
  camion, indice, cambio)` y `Servicios.causas(t, mv, camion, indice)` no. Y `crearContrafactual(sim)` (§9) repite el simulador que ya
  trae la firma.
- **Supuesto.** `crearContrafactual(sim?)`: el simulador de la fábrica es el de respaldo; si la llamada trae uno, usa ese. Las noches se
  recuerdan por (simulador, `mv`, semilla, réplica, parche) con referencias **idénticas**: la integración tiene que pasar siempre el mismo
  `simularNoche` y el mismo objeto `mv` para que la noche base se simule una sola vez entre cincuenta contrafactuales.
- **Receta propuesta.**
  ```ts
  const cf = crearContrafactual(simularNoche);
  const contrafactual = (mv, semilla, replica, camion, indice, cambio) => cf(simularNoche, mv, semilla, replica, camion, indice, cambio, variante);
  const causas = (t, mv, camion, indice) => causasConfirmadas(t, mv, t.semilla, t.replica, camion, indice,
    (cambio) => contrafactual(mv, t.semilla, t.replica, camion, indice, cambio));
  const tamizarMv = (mv, alProgreso) => tamizar(mv, supuestosDe(mv),
    (m) => evaluarDecision(m, planificador, variante, { ...opciones, prioridad: Prioridad.TAMIZADO }), variante, { alProgreso });
  ```
  La semilla y la réplica de las causas salen de la propia traza (`t.semilla`, `t.replica`).
- **En el navegador.** `Simulador` del contrato es síncrono, pero P7 hace `await` del resultado: un `Simulador` que delegue en un Worker y
  devuelva una promesa funciona (hay una prueba). Si se pasa el síncrono, cada contrafactual corre dos noches completas **en el hilo de la
  interfaz** (la base la primera vez y la variante: 0,3 s cada una en el hub de 24.000 paquetes, MEDIDO). Conviene el asíncrono.

## 2. `AlmacenResultados.trazas` se indexa por id y `verificarFrases` no adivina

- **Supuesto.** Con `trazaId` usa esa traza; sin `trazaId` usa la única que haya; con dos o más (pantalla dividida) y sin id, toda afirmación
  de fuente `traza` falla como `fuente-inexistente`. Nunca elige una al azar.
- **Propuesta.** P8 y la integración pasan siempre el id de la traza que se está mirando. El almacén tiene que tener la traza de la noche
  mostrada y el modelo; los experimentos por id para las afirmaciones de fuente `experimento`.

## 3. Convenciones de `Afirmacion` que el contrato no dice (las fija `verificador.ts`)

- **Traza.** `unidad` ∈ {`ms`, `s`, `min`, `h`} para duraciones e instantes; `hora` = minuto entero desde la medianoche del día del turno
  (`23:50` → 1.430; después de la medianoche del día siguiente, más de 1.440: la frase muestra la hora módulo 24); con campo `a` la unidad
  es una etiqueta (`vueltas`, `paquetes`) y el valor es la columna tal cual.
- **Experimento.** `prob` con unidad `%` se compara contra 100 · p; el resto, contra el valor del KPI. `diferencia` es la media de B − A.
- **Parámetro.** El valor central del parámetro (la media o la probabilidad de su distribución), o `nombre.bajo|medio|alto` (de `incierto`)
  y `nombre.min|max` (de `rango`).
- **Sentido.** Con `sentido`, el `valor` puede ser la magnitud: se compara |valor| con |fuente| y el sentido con el signo de la fuente
  (`igual` solo si la fuente redondea a cero con los decimales de la afirmación).
- **Cifras sueltas.** A las frases del propio explicador (`explicacion.paso.*`, `.causa.*`, `.titulo.*`) se les exige, además, que cada número
  y cada hora de `vars` coincida con alguna afirmación; si no, `sin-fuente` con `afirmacion: −1`.
- **Propuesta.** Copiar este párrafo a `contratos/explicacion.ts` como documentación de `Afirmacion`.

## 4. No hay cómo verificar las cifras que salen del tamizado ni la hora del contrafactual

- **Qué pasa.** Las fuentes de `Afirmacion` son `traza`, `experimento` y `parametro`. La frase «por qué» de una pregunta del formulario
  (`explicacion.pregunta.porque.*`) lleva los tres valores del parámetro (verificables) y la cantidad `n` de puestos en que cambia la
  respuesta, que sale del ranking del tamizado y no tiene fuente de ningún tipo. Igual pasa con la hora a la que **llegaría** el paquete en el
  contrafactual («Confirmado: sin las pausas de rampa llegaba a las 00:12», §9 P8, pantalla 3): esa hora está en
  `Contrafactual.despues.listo`, no en la traza mostrada.
- **Supuesto.** `explicacion.pregunta.*` no es de las frases controladas (`n` queda sin afirmación); la hora del contrafactual no va dentro
  de las frases de causa. Las frases `explicacion.causa.*` dicen «llega antes del corte» o «llega al menos 5 min antes», que es lo que el
  contrafactual confirmó.
- **Propuesta.** Para P8: armar la línea «Confirmado: {cambio} llegaba a las {hora}» con el texto `explicacion.cambio.<tipo>` del
  contrafactual (`cambio.clave` y `cambio.vars`) y la hora de `despues.listo` (el contrafactual es el resultado de una simulación, no una
  frase). Para el contrato: una fuente `{ tipo: 'contrafactual', id }` y otra `{ tipo: 'tamizado', parametro, campo }` en el corte 2.

## 5. Una espera en rampa por ausencia no se puede detectar con la traza del hub

- **Qué pasa.** La regla de §9 dice «RAMPA → según lo que hacía la persona causante (`q`)… PERSONA_AUSENTE → AUSENCIA». El hub (P4,
  `NOTAS-CONTRATO` §11) escribe en `q` a la persona que atiende la rampa **después de redistribuir** las de las ausentes; la ausente nunca es
  `q`, y sus tramos PERSONA_AUSENTE llevan `r = −1`.
- **Medido.** En 30 noches del hub chico, 9 tuvieron una persona de rampa ausente (sin retén): 0 esperas de paquete con causa `AUSENCIA` y
  44.963 con `PERSONA_OCUPADA` (que no se afirma). Es la dirección segura: no hay causa falsa, hay una causa que no se dice. La causa
  `AUSENCIA` sí se detecta en las trazas sintéticas (la persona ausente es la `q`) y en la biografía de la persona.
- **Propuesta.** Corte 2: que el hub, cuando una rampa la atiende alguien que cubre a un ausente, marque el tramo RAMPA con `c = AUSENCIA` y
  `q` = la persona ausente (o que agregue un tramo PERSONA_AUSENTE con `r` = la primera rampa de la ausente). P7 ya sabe qué hacer con
  ambas cosas; hoy el cambio fijo de la causa («retén + 1») queda sin uso en el hub.

## 6. E01 tal como está escrita no se cumple con el hub; la versión que sí mide el explicador

- **Qué pasa.** §8 dice: «hub chico con corte a las 00:30 y pausas de rampa de 45 min: en 50 réplicas, todo paquete que pierde el corte
  con una espera en rampa de ≥ 5 min superpuesta a una pausa tiene la causa PAUSA confirmada». Un paquete que pierde el corte y esperó
  sobre una pausa puede perderlo igual sin pausas (porque el hub no llega a las 00:30 ni sin ellas); en ese caso el contrafactual **no**
  debe confirmar, y no confirma.
- **Medido (plantilla `hub-chico@1.0.0`, pausas de rampa de 2.700 s, semilla 20261017).**
  - Con el corte a las 00:30 (el literal): 5 réplicas, 9.511 paquetes pierden el corte, 2.277 de ellos con espera en rampa ≥ 5 min sobre una
    pausa y solo 295 (13%) se rescatan sin pausas. Sin pausas, el hub chico termina entre 170 y 237 min (a las 00:50 o más tarde): el
    corte a las 00:30 se pierde por capacidad, no por las pausas.
  - Con el corte a las 01:30 (`25:30`, el de la plantilla): 6 réplicas, 5.465 pierden el corte, 1.616 con espera sobre pausa ≥ 5 min y
    **1.583 (98,0%)** con PAUSA confirmada; los 33 restantes llegan tarde también sin pausas. **0 incoherencias** entre «confirma» y el
    resultado de la misma noche corrida aparte sin pausas, y **0 frases de PAUSA sin confirmar** (la frase sale si y solo si el
    contrafactual confirma). El verificador no encontró ninguna cifra sin respaldo.
- **Propuesta.** Escribir E01 como: (a) para todo paquete con espera ≥ 5 min sobre una pausa que pierde el corte, la frase de PAUSA aparece
  **si y solo si** el mismo paquete llega al corte en la misma noche sin pausas (calculada aparte por la prueba); (b) con el corte a las
  01:30 y pausas de 45 min, al menos el 95% de esos paquetes tiene la PAUSA confirmada. Es la versión que mide la honestidad del explicador
  y no la capacidad del hub.

## 7. E02 con el hub real: cumplida

- **Escenario.** Hub chico, corte a las 02:00 (`26:00`), micro-parada forzada (`paradaLazoEntre` fija en 3.600 s y `paradaLazoDuracion` fija
  en 2.400 s) y pausas de rampa de 2.400 s. Pendientes al corte por réplica: sin ninguna de las dos, 0; solo la parada, 26 a 1.339; solo
  las pausas, 331 a 1.007; las dos, 486 a 1.608 (6 réplicas, MEDIDO): cada una alcanza para perder el corte.
- **Medido.** 10 réplicas × 50 paquetes que pierden el corte y tienen alguna candidata = 500 paquetes: **0 frases causales sin confirmar**
  (se controló cada frase de una sola causa contra un contrafactual confirmado con su cambio, y cada «causa conjunta» contra el conjunto
  confirmado); 17 paquetes con causa conjunta (solo donde el conjunto confirmó); 113 sin ninguna causa; 0 fallas del verificador.
- **Observación.** La micro-parada se ve más como FILA (la acumulación se llena porque la inducción espera bandeja) que como FALLA (solo se
  clasifica FALLA cuando más de la mitad de la espera de bandeja coincide con el lazo detenido). Es la regla de §9 y es honesta; el cambio
  «un puesto más» de la FILA casi nunca confirma cuando la raíz es una parada.

## 8. Candidatas: la espera se suma por causa (y por rampa llena)

- **Qué pasa.** §9: «candidatas = esperas de ≥ 5 min o ≥ 20% del tiempo en el hub». Un paquete que da tres vueltas de 2 minutos por la misma
  rampa llena no tiene una espera de 5 minutos, tiene seis.
- **Supuesto.** Las esperas del mismo tipo se suman (las de rampa llena, por rampa) y el grupo es candidata si la suma llega a 5 min o al
  20% del tiempo del paquete en el hub. Candidatas con **exactamente el mismo cambio** (FILA y BLOQUEO piden «un puesto más») se prueban
  una sola vez y comparten veredicto; como mucho 6 por paquete (`MAX_CANDIDATAS`, cada una cuesta una noche simulada; la noche base y las
  variantes se recuerdan). El `cambio.clave` de una candidata que junta dos causas es el de la primera (los textos son idénticos).
- **Sin cambio fijo no hay candidata.** FALTA_BANDEJA, PERSONA_OCUPADA, ANDEN_OCUPADO y NO_TRANSPORTABLE se describen en la biografía y no
  se afirman. Tampoco es candidata una causa cuyo cambio el modelo ya tiene (pausas ya en 0, retén al máximo de puestos, etc.): el
  contrafactual no cambiaría nada y «confirmaría» solo por el azar de la comparación.

## 9. Causa conjunta

- **Supuesto.** Se prueba el cambio conjunto de las candidatas que **no** confirmaron de a una cuando son 2 o 3 (con una sola, el conjunto
  sería ella misma; con más de 3, solo contrafactuales de un factor, §9 y diseño maestro A9). Las que confirmaron solas se muestran solas
  y no entran al conjunto. Frases: un encabezado `explicacion.causa.conjunta` y una `explicacion.causa.conjunta.<tipo>` por componente.
  El conjunto no es Shapley: no reparte cuánto aporta cada parte.

## 10. Biografía

- **Pasos.** Un paso por tramo del paquete; las esperas (fila, espera de bandeja, rampa, cola manual) de **menos de 3 s** no son un paso
  (`ESPERA_MINIMA_MS`), así que la cadena puede tener un hueco de hasta 2,999 s. Medido en 6.700 biografías de paquete (4 noches: hub chico y grande, réplicas
  0 y 3): 0 huecos ≥ 3 s, 0 fallas del verificador, todas las causas dentro de la taxonomía.
- **JAULA.** El tramo queda abierto hasta el fin de la traza; el paso es el instante de entrada (`desde = hasta`).
- **Percentil.** `100 · (paquetes de la noche que tardaron estrictamente menos) ÷ (paquetes nacidos)`, un decimal; el tiempo en el hub es de
  la descarga a la jaula (o al fin de la traza si no terminó).
- **Otras entidades.** Camión, persona (bloques de trabajo con menos de 1 min entre tramos, pausas, huecos libres, ausencia), rampa
  (lapsos llena calculados de los tramos RAMPA, no de los momentos, y cierres de jaula), lazo y puesto. La clase `PUESTO` usa los tramos de
  pausa y ausencia con `r` = puesto (el hub los escribe así para inducción).
- **`Biografia.causas`** sale siempre vacío (la función es síncrona y no simula).
- **Fixture de la maqueta.** `trazaDeMaqueta()` deja `paquetes.camion` en −1 para todos; `encontrarPaquete` ignora −1 (columna sin
  registrar), así que con esa fixture `causasConfirmadas` necesita que se le ponga un camión (las pruebas de P7 usan 0). P8 (servicios
  falsos) debe hacer lo mismo.

## 11. Tamizado y formulario

- **Pérdida esperada.** `Σ pesoᵢ · |costoᵢ(dᵢ) − costoᵢ(d_medio)|` con `costo` = media del KPI **objetivo** de la decisión
  (`decision.objetivo.minimizar`, `objetivo.media` de la evaluación): está en pesos por noche solo si el objetivo es `costoNoche`. Los pesos
  de `incierto.pesos` se normalizan si no suman 1 (error que dice cuál parámetro si son negativos o suman 0). Si `dᵢ` es `null` porque
  **ninguna opción cumple**, se usa el máximo de la variable (§9) y la decisión queda en `null` en el resultado para que se vea. Si es `null`
  porque alguna opción **quedó en duda**, desde el 19-10 no se usa el máximo sino la peor resolución posible de la duda (§14.2).
- **Evaluaciones.** 1 (el modelo) + 2 por supuesto, en secuencia, para que cancelar sea inmediato; si una `evaluar` se rechaza (por ejemplo
  con `ErrorCancelado` de P5), `tamizar` se rechaza con **el mismo error** y no lanza más: la integración y P8 tienen que atrapar
  `ErrorCancelado` y tratarlo como «el usuario cambió algo» (experimentos/NOTAS §3). Un valor bajo igual al medio no se vuelve a evaluar.
- **Supuestos.** Parámetros con `incierto` que algún campo del modelo referencia con `@nombre` y que la configuración usa (se descartan los
  campos apagados: temporarios 0, fatiga inactiva, micro-paradas inactivas, atraso común con probabilidad 0, rol sin gente). Ejemplo
  hub chico: ausentismo, errorPronosticoCv, induccionBase, manejoRampa, noLeido, probAtrasoComun, ritmoDescarga (7; `eficienciaTemporario`
  entra con temporarios > 0).
- **Los parámetros que importan y no tienen `incierto`.** P4 (§13) espera que el tamizado muestre que la caminata entre rampas y las pausas
  de rampa mueven la decisión. `caminarEntreRampas` no tiene `incierto` en la plantilla, y las pausas (`personas.*.pausas`) son números del
  esquema, no parámetros: no se pueden tamizar. **Propuesta:** `hub-chico@1.1.0` con `incierto` en `caminarEntreRampas` y `cierreJaula`, y
  `Pausas` con `Num` (referencias) en `anden.modelo/1.1`.
- **Formulario.** `rango` = [`incierto.bajo`, `incierto.alto`] (no el `Parametro.rango`, que es el de validez del compilador);
  `referencia` = valor central del parámetro con su fuente y etiqueta; `texto` = `Parametro.pregunta` (o el nombre y la unidad si falta).
  Plan de medición: cv de la distribución si la trae (lognormal, exponencial, erlang, normal, uniforme, triangular), 0,5 si no; ε = 0,15;
  segundos por observación = lo que dura lo medido (si la unidad es `s…`) + 10 s de anotación (**SUPUESTO**, `SEGUNDOS_DE_ANOTACION`).
- **«Ya está» no siempre es verdad (agregado de P7).** Con `hub-chico@1.0.0` y su decisión tal cual (puestos 2 a 5, perder el corte como
  mucho 1 noche de cada 10), **ninguna** configuración cumple (2: 0%, 3: 20%, 4: 35%, 5: 40% de noches sin pendientes con 20 a 60 réplicas,
  MEDIDO): la recomendación es `null`, todas las decisiones del tamizado son `null`, las pérdidas dan 0 y el formulario queda sin preguntas
  (tamizado real de 15 evaluaciones, 69 s en un trabajador en proceso). Mostrar «Ya está: lo que falta no cambia la respuesta» sería decir que
  hay una respuesta. P7 agrega `cierreDelFormulario(ranking)`, que devuelve `{ motivo, clave }`: `listo` (hay recomendación),
  `ninguna-cumple` (`explicacion.formulario.ninguna_cumple`) o `en-duda` (`explicacion.formulario.en_duda`: la decisión sigue en duda por el
  azar de las noches). `armarFormulario` sigue devolviendo una lista de preguntas como pide el contrato; cuando viene vacía, mostrar el mensaje
  de `cierreDelFormulario` es una decisión de P8 y de la integración. **El recorrido «decidir» de §10.8 («formulario hasta “Ya está”») no
  llega a ese mensaje con la plantilla chica sin cambios**: hace falta `hub-chico@1.1.0` (P4 §13) o una decisión con meta alcanzable.
- **Con la decisión en duda no se pregunta (agregado de P7, a partir de una corrida real).** Variante del hub chico con 12 personas de rampa,
  corte a las 02:00 y `caminarEntreRampas` con `incierto` (8 supuestos, 17 evaluaciones, `replicasMax` 160): el valor medio quedó **en duda**
  (`recomendacion = null`) y, siguiendo §9 al pie de la letra (`dᵢ` null → máximo de la variable), cinco supuestos salieron con una pérdida de
  $ 26.675 a $ 28.340 por noche que no mide lo que no se sabe sino la duda misma: la decisión «de hoy» contra la que se compara no existe. Por eso
  `armarFormulario` devuelve `[]` mientras el valor medio esté en duda, y `cierreDelFormulario` dice `en-duda` («hacen falta más noches»).
  Cuando ninguna opción cumple sin duda (el caso anterior), sí pregunta: con un valor más favorable puede alcanzar. `tamizar` no cambia: el
  ranking completo, con sus `null` visibles, sigue a disposición de la tabla del modo ingeniero.
- **Presupuesto del tamizado.** Esa corrida de 17 evaluaciones tardó **311 s** en un trabajador en proceso con el motor de referencia
  (6.300 noches: las evaluaciones en duda usan hasta `replicasMax`). El presupuesto de §11 es ≤ 60 s con 3 Workers y el núcleo de producción.
  **Propuesta:** que la integración arme el `evaluar` del tamizado con `replicasMax` bajo (100, o 60: el tamizado solo necesita saber si la
  decisión cambia, no estimarla con precisión) y `prioridad: Prioridad.TAMIZADO`; el banco lo mide. Con la plantilla chica sin cambios (7
  supuestos, 15 evaluaciones, 20/20/100) fueron 69 s en un trabajador.

## 12. Lo que se agregó y no estaba en la lista de entrega

`candidatasDe`, `cambioDeCausa`, `fraseDeCausa`, `verificarAfirmacion`, `cifrasSinRespaldo`, `fraseDeMedicion`, `cierreDelFormulario`,
`MENSAJE_FORMULARIO_*`, `segundosPorObservacion`, `todasLasClaves`, `VARIABLES_POR_CLAVE` y las constantes de umbrales; todas opcionales.
`VARIABLES_POR_CLAVE` es el registro de claves y variables: `crearFrase` lanza si una frase no lo cumple, y `pruebas/textos.test.ts` lo cruza
con `textos.es.json` y `textos.en.json` (mismas claves, mismas variables, sin claves huérfanas, sin nombres de la lista negra).

## 13. Rendimiento (MEDIDO, trazas de la plantilla grande: 22.334 paquetes, 261.537 tramos)

Primer acceso a una traza (arma el índice por entidad): 49 ms; 1.000 `esperasDe`: 9 ms; 100 biografías de paquete: 21 ms; 1.000
`candidatasDe`: 6 ms; biografía de una rampa, una persona y el lazo: 11 ms. Los índices se guardan por traza (`WeakMap`): se liberan con ella.

## 14. Después de la revisión del 19-10 y con el hub 1.1.0: qué cambió y qué vale hoy (23-10-2026)

Ningún punto de esta sección cambia un contrato: `contratos/explicacion.ts` y `contratos/decision.ts` se cumplen tal cual (`tsc` sin errores).

### 14.1 Estado

- **Pruebas propias:** 133 en 10 archivos (`node --test "explicacion/**/*.test.ts"`, 1,9 s, sin reloj ni red), todas pasan. Cubren cada punto de
  «Pruebas propias» de §9: las 12 causas de la taxonomía en su traza sintética y ninguna fuera de ella; biografía con pasos encadenados; 200
  frases verdaderas con 0 fallas y 20 falsas sembradas con 20 de 20 detectadas (valor, signo, «diferencia real» con IC que cruza el cero, sin
  fuente); contrafactual con simulador falso que rescata (`confirma = true`) y que no (`false`); tamizado con un modelo donde solo un supuesto
  cambia la decisión (primero, con pérdida > 0, y los demás con 0); formulario que se detiene bajo la indiferencia; plan de medición (cv 0,6 →
  62). Más: arquitectura (tokens de §1.4, imports, TypeScript borrable) y textos (mismas claves y variables en es y en).
- **Archivos más allá de la lista de §2:** `consulta.ts` (índices por entidad, solapes y búsqueda por (camión, índice)), `frases.ts` (registro
  de claves y variables, constructores de frases con afirmaciones), `parametros.ts` (valor central, cv y parche de un parámetro) y
  `unidades.ts` (el único redondeo, compartido por quien escribe la cifra y por quien la controla); en `pruebas/`, `ayudas.ts` (trazas
  sintéticas, simulador y variante falsos).
- **Cableado hecho por la integración** (§1): `integracion/ensamblar.ts` arma `crearContrafactual(simularNoche)`; en el navegador el `Simulador`
  es asíncrono y pide cada noche al planificador con prioridad `CONFIRMACION`, así que ningún contrafactual simula en el hilo de la interfaz;
  el tamizado usa `replicasMax` 100 por valor (`REPLICAS_MAX_TAMIZADO`). **MEDIDO por el banco de la integración** (mediana de 5 corridas):
  tamizado del hub chico con 3 Workers **41,6 s** (meta ≤ 60 s) y evaluación de la decisión **3,6 s** (meta ≤ 20 s).

### 14.2 Tamizado y formulario: «en duda» no es «ninguna opción cumple» (hallazgo E-05)

- **Qué pasaba.** Cuando con el valor bajo o el alto la recomendación era `null` porque una opción quedó **en duda** (el tamizado mira hasta
  100 noches por opción), §9 al pie de la letra manda usar el máximo de la variable. Eso comparaba contra una decisión que nadie tomaría
  (poner el máximo de puestos) y la frase del formulario decía «ninguna opción probada alcanza», que no es lo que pasó.
- **Qué hace el código.** `decisionesPosibles(ev)` (exportada) da las decisiones entre las que está la duda: desde la menor opción en duda hasta
  la menor que cumple después de ella, o hasta la última si ninguna cumple; `null` si hay recomendación o si no hay duda (ninguna cumple →
  sigue valiendo «el máximo de la variable», §9). La pérdida de un extremo se calcula con **cada** decisión posible y se usa la **mayor** (lo
  más que puede costar equivocarse). Las filas de `tamizar` traen, además del contrato (`ResultadoTamizadoConDuda`, exportado): `enDuda`
  `[bajo, medio, alto]` (qué extremos quedaron en duda y no en «ninguna cumple»), `perdidaRango` `[mejor resolución, peor resolución]` y `peorCaso`.
  La decisión de esa fila sigue siendo `null` para que se vea. Frases del formulario: `explicacion.pregunta.porque.sin_respuesta` (ninguna
  opción alcanza) y `explicacion.pregunta.porque.en_duda` (harían falta más noches), con las tres cifras atadas a la ficha del parámetro.
- **Medido en la prueba sintética** (`tamizado.test.ts`, «un extremo que quedó EN DUDA…»): la pérdida es 12.500 (0,25 · |30.000 − 80.000|, con
  la decisión 3) y no 7.500 (con el máximo, 5); el rango queda en [0, 12.500].
- **Para quien muestra el resultado.** `perdidaEsperada` es un **promedio ponderado** por los pesos previos; el «cuesta hasta» de la pantalla
  tiene que ser `peorCaso` (hallazgo E-12: Presentar decía «hasta» con el promedio). `app/pantallas/presentar.ts` ya lo lee (por duck-typing;
  ahora el tipo sale de `indice.ts`).

### 14.3 Singular en «¿cuánto cambia la respuesta?» (lo encontró P8)

`explicacion.pregunta.porque.<variable>` decía «cambia en hasta 1 puestos». Con `n = 1` se usa la variante `.uno` (cuatro claves nuevas,
`puestos`, `rampa`, `reten` y `generica`, en es y en, con su registro en `frases.ts` y sus variables verificadas por `textos.test.ts`).

### 14.4 Re-medición con el hub y el motor 1.1.0 (MEDIDO el 23-10-2026, Node 22.22.0, motor de producción)

El hub cambió desde las mediciones de §5 a §13 (relevo en las pausas, caminata por distancia, plan por volumen en bloques contiguos, pausas
después del fin: `integracion/CAMBIOS-CONTRATO.md` §2). P7 no cambió por eso; se volvió a medir.

| Medida | Resultado |
|---|---|
| Biografías de paquete y de las demás entidades, `hub-chico@1.0.0` (réplicas 0 y 3: 7.450 y 8.610 paquetes; 1 de cada 2) y `hub-lazo-noche@1.0.0` (22.334 y 25.818 paquetes; 1 de cada 7 y 1 de cada 8) | 14.449 biografías de paquete y 332 de camiones, personas, rampas, puestos y lazo; **0 esperas fuera de la taxonomía** en 39.773 esperas; **0 huecos** ≥ 3 s ni solapes entre pasos; **0 fallas del verificador** en 121.919 frases de paquete y en las de las 332 entidades |
| Tiempo del análisis (esperas + biografía + candidatas + verificación) de 3.200 a 4.300 paquetes de una noche, sin contar simularla (0,2–0,4 s con traza completa) | 0,5–0,7 s en el hub chico y 0,8–1,0 s en el grande |
| Causas que aparecen (esperas de paquete) | Con el hub chico: fila, bloqueo, falta de bandeja, rampa llena, pausa, falla, cierre de jaula, no leído, persona ocupada y no transportable. **AUSENCIA: 0**, igual que en §5: sigue sin detectarse en rampa con la traza del hub (no hay causa falsa, hay una causa que no se dice) |
| **E01**, con la forma que decidió la integración (`integracion/NOTAS-CONTRATO.md` §2), **50 réplicas**, pausas de rampa de 45 min, corte a las 00:30 | 13.615 paquetes pierden el corte con ≥ 5 min de espera dentro de una pausa; **508 (3,7%)** llegan sin pausas; las 508 llevan la frase de PAUSA; **0 frases falsas, 0 faltantes** (completitud 100%) |
| Ídem, corte a las 01:30 (el de la plantilla) | 1.795 pierden el corte; **1.520 (84,7%)** llegan sin pausas; las 1.520 con la frase; **0 falsas, 0 faltantes** |
| **E02**, 10 réplicas × 50 paquetes | 500 paquetes con candidatas, 624 frases de una causa, 1 conjunta, 12 paquetes sin causa afirmable; **0 frases causales sin confirmar** |
| Las tres pruebas juntas, con 50 réplicas (`ANDEN_COMPLETA=1 node --test integracion/pruebas/e-explicador.test.ts`) | 3 de 3, 95,5 s. En `npm test` corre la muestra de 4 réplicas (31 s) |

- **Lo que dice sobre §6.** El rescate de la pausa depende del corte, no del explicador: con el corte de la letra (00:30) solo el 3,7% de los
  paquetes que esperan sobre una pausa llegaría al corte sin ella (el hub no llega por capacidad), y con el de la plantilla (01:30), el 84,7%.
  En los dos casos el explicador dice PAUSA en **exactamente** los que sí se rescatan: es la medida de honestidad que §6 proponía. Los números de
  §6 (13% y 98,0%) eran del hub 1.0.0 y de una definición más laxa de «espera sobre una pausa» (con relevo, una espera que apenas roza la pausa
  ya no es «por la pausa»: la otra persona estaba trabajando).
- **Cifras de §10 que valen hoy:** 0 huecos ≥ 3 s en 14.449 biografías (6.700 el 18-10); todas las causas dentro de la taxonomía.

### 14.5 Lo que sigue abierto de P7 (nada de esto rompe una prueba)

1. **AUSENCIA en rampa** (§5): necesita un cambio del hub (marcar el tramo RAMPA con `c = AUSENCIA` y `q` = la persona ausente). Corte 2.
2. **Fuentes de afirmación para el tamizado y el contrafactual** (§4): `{ tipo: 'tamizado' }` y `{ tipo: 'contrafactual' }` en `Afirmacion`. Corte 2.
3. **Parámetros sin `incierto` que importan** (§11): la caminata entre rampas, el cierre de jaula y las pausas no se pueden tamizar con
   `hub-chico@1.0.0`. Propuesta de §11 (`hub-chico@1.1.0` y `Pausas` con referencias en `anden.modelo/1.1`) sigue pendiente; la integración
   recomendó no publicarla en este corte.
4. **`hub-chico@1.0.0` con su decisión tal cual no tiene respuesta** (ninguna configuración cumple): el formulario termina en «ninguna cumple»,
   no en «Ya está» (§11, `cierreDelFormulario`). El recorrido «decidir» de la integración usa un hub propio por enlace para llegar a «Ya está».
