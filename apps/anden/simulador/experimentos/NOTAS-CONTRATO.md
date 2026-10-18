# Notas de contrato · P5 Experimentos y estadística (18-10-2026)

Lo que el contrato (`contratos/`) o la especificación (`corte-1.md`) no fija, fija de forma ambigua o no alcanza a cubrir, y lo que este
paquete agregó por su cuenta. En cada punto: qué pasa, qué supuesto tomó P5 y la propuesta para la integración. **Ninguno cambia un
contrato**: P5 cumple las firmas de `contratos/experimentos.ts` tal cual (lo comprueba `pruebas/firmas.test.ts` con `tsc`). Los puntos 1, 2,
3, 5 y 6 piden una decisión o un cableado de la integración (o de P7 y P8); los demás son informativos.

## 1. `semaforo(...)` no tiene firma en el contrato

- **Qué pasa.** §9 P5 pide `semaforo(...)` y §7 da la tabla de motivos, pero `contratos/experimentos.ts` solo define el tipo `Semaforo`.
- **Supuesto de P5.** `semaforo(e: EntradaSemaforo): Semaforo` con una entrada por objeto: `diagnosticos`, `resultados`, `replicas`,
  `minimoReplicas` (20), `confianza` (0,95), `precision`, `decisionEnDuda` y `fueraDeDominio` (todo opcional). Más `semaforoDe(mv, resultados,
  extra?)`, que toma del modelo sus diagnósticos, `experimento.confianza` y `experimento.precision`: **es lo que tendría que llamar la
  vista de las cien noches**. El texto de cada motivo es la clave `experimentos.semaforo.<motivo>` con las variables de `vars`
  (la prueba de textos verifica que cada texto use exactamente las variables que el semáforo entrega, en es y en en).
- **Orden de evaluación.** Rojo: `modelo-con-errores` > `conservacion` > `invariante` > `inestable`; amarillo: `fuera-de-dominio` >
  `decision-en-duda` > `pocas-replicas` > `precision-no-lograda`; si no, verde `ok`.
- **Tres decisiones que §7 no cubre.** (a) `fuera-de-dominio` está en `MotivoSemaforo` pero no en la tabla de §7: lo puse primero entre los
  amarillos (quita valor a todo lo demás; diseño maestro §7.10.10) y solo salta si quien llama pasa `fueraDeDominio`. (b) Las alertas
  `tope-eventos` y `lazo-tiempo-cero` cuentan como `inestable` (igual que `no-termina`); una alerta que P5 no conoce **nunca se ignora**: es
  rojo `invariante` con su texto como nombre. (c) Con una evaluación de decisión en la que **ninguna** configuración cumple (y ninguna está en
  duda), la recomendación es `null` y el semáforo queda **verde**: no hay duda, hay una respuesta («ninguna de las opciones probadas
  cumple», clave `experimentos.recomendacion.ninguna-cumple`). La interfaz tiene que mostrarlo; no es un caso de error.

## 2. `EvaluarDecision` no tiene forma de elegir la prioridad (y P7 la necesita)

- **Qué pasa.** `contratos/decision.ts` dice que el tamizado «corre las evaluaciones con prioridad TAMIZADO y las cancela si el usuario
  cambia algo», pero las opciones de `EvaluarDecision` (`replicasIniciales`, `tanda`, `replicasMax`, `alProgreso`) no traen prioridad.
- **Supuesto de P5.** `evaluarDecision` acepta además `prioridad?: Prioridad` (por defecto `DECISION`) y `etiqueta?: string` (prefijo de los
  ids de trabajo, para depurar). El tipo de `evaluarDecision` es más ancho que el del contrato pero asignable a él (comprobado con `tsc`).
- **Propuesta.** Agregar `prioridad?: Prioridad` a las opciones de `EvaluarDecision` en el contrato. Hasta entonces, la integración arma
  el `evaluar` del tamizado como `(mv) => evaluarDecision(mv, planificador, variante, { ...opciones, prioridad: Prioridad.TAMIZADO })`.

## 3. Qué hace `evaluarDecision` cuando se cancela (el contrato no lo dice)

- **Supuesto de P5.** Si el planificador cancela cualquiera de sus trabajos (`cancelar`, `cancelarDesde`, `cerrar`), la evaluación cancela
  los demás trabajos que había lanzado y **se rechaza con `ErrorCancelado`** (`esCancelacion(e)` lo reconoce por el nombre). Un error del
  simulador se rechaza con su mensaje original y **no** es una cancelación. No devuelve resultados parciales: una recomendación a medias
  sería justo lo que el contrato de honestidad prohíbe.
- **Para P7 y P8.** El tamizado y la pantalla de decidir tienen que atrapar `ErrorCancelado` y tratarlo como «el usuario cambió algo», no
  como un fallo.
- **Progreso.** `alProgreso(hechas, maximo)`: `hechas` sube de a una por cada noche simulada; `maximo` es la cota fija
  `replicasMax × cantidad de valores` y nunca cambia (la barra no retrocede, pero normalmente no llega al 100%: se usa menos de lo máximo).

## 4. Qué valores reciben más noches en la evaluación secuencial

- **§7 dice** «tandas solo a los valores en duda». **Supuesto de P5:** solo a los valores en duda **que están por debajo del menor valor que
  ya cumple** (un valor por encima de uno que cumple no puede cambiar la recomendación, que es «el menor que cumple»). Por eso la tabla
  final puede mostrar «en duda» un valor alto que ya no importaba; el semáforo `decision-en-duda` solo salta por los valores que sí importan.
- **Medido** (simulador falso 0,60 · 0,80 · 0,97 · 0,995, meta 0,9, 200 corridas con semillas 1000–1199): recomienda 4 en **200 de 200**
  (la especificación pide ≥ 95%) y usa en promedio **205 noches = 12,8%** de las 1.600 de correr 400 fijas por valor (pide < 60%).
- **Estimación de lo que falta.** Cuando algo queda en duda al llegar a `replicasMax`, `vars.faltan` es una ESTIMACIÓN (`nochesQueFaltan`): las
  noches que harían falta para que el Wilson de la **misma proporción observada** deje de cruzar la meta. Si la proporción es justo la meta,
  o harían falta más de un millón, se informa 1.000.000. Se calcula para el valor en duda más bajo (el que bloquea la recomendación), y
  `vars.replicas` es la cantidad de noches de **ese** valor.

## 5. `PuertoTrabajador` no avisa cuando un Worker se muere

- **Qué pasa.** El puerto solo tiene `enviar`, `alRecibir` y `terminar`. Un Worker real que se cae (excepción no atrapada, memoria,
  `onerror`) no manda ningún mensaje: el planificador no se entera y el `enviar` de ese trabajo queda colgado para siempre.
- **Lo que hace P5.** Si el Worker responde `error`, el trabajo se rechaza con el mensaje original (el trabajador sano sigue en uso).
  Si un trabajo se cancela, el trabajador que lo corría se termina y se reemplaza.
- **Propuesta.** Agregar al contrato `alFallar?(f: (motivo: string) => void): void` en `PuertoTrabajador`; el envoltorio del Worker real
  (integración) lo conecta a `worker.onerror` y `onmessageerror`, y el planificador rechazaría el trabajo y reemplazaría al trabajador
  (ESTIMACIÓN: ~10 líneas en `planificador.ts`). Mientras tanto, el «guardián que termina el Worker si se pasa del tiempo» (diseño maestro §4.9) puede
  usar `cancelar(id)`, que ya termina y reemplaza al trabajador.

## 6. `comparar` no da veredicto para KPI neutros

- **Qué pasa.** `Comparacion.veredicto` solo tiene `b-mejor | a-mejor | no-se-distingue`, y `META_KPI` marca como `neutro` a `paquetes`,
  `utilInduccionPct` e `inductoresPresentes`: no hay un «mejor». Devolver `no-se-distingue` cuando el IC excluye el cero sería falso.
- **Supuesto de P5.** `comparar` **lanza** un error claro para un KPI neutro. `tieneSentido(kpi)` dice cuáles sirven; la interfaz
  (tabla de diferencias de la pantalla dividida) tiene que filtrar con él. Para ver la diferencia de un KPI neutro alcanza con
  `resumir` sobre las diferencias.
- **Propuesta alternativa.** Un cuarto veredicto `'sin-sentido'` en el contrato.

## 7. Las funciones de resumen son estrictas a propósito

Todas ordenan por índice de réplica antes de sumar (así R07 da bit a bit lo mismo con 1 o 3 trabajadores y con llegadas desordenadas) y
**lanzan** (con qué se esperaba y qué llegó) en estos casos, que la interfaz no debe provocar:

- `resumir` con menos de 2 réplicas (contrato de honestidad: nunca un intervalo de una sola corrida). La vista previa «provisoria (1 noche)»
  muestra el valor de esa noche **sin** intervalo; no llama a `resumir`.
- Una misma (semilla, réplica) repetida, o réplicas de **modelos distintos** (distinta `modelo`) en una misma llamada.
- `comparar` con listas que no son exactamente las mismas (semilla, réplica) (se parea por réplica, no por posición), o con menos de 2.
- `armarComprobante` si no hay réplicas; si alguna es de otro modelo que `mv.huella` o de otra semilla que `receta.semilla`; si los índices no
  son exactamente `0…N−1` sin saltos; o si `receta.replicas ≠ N`. Razón: la receta dice «semilla S, N réplicas» y tiene que reproducir
  la huella agregada; un comprobante que no se pueda reproducir no se emite. La evaluación de una decisión tiene réplicas distintas por
  configuración, así que su comprobante es **por configuración** (no un comprobante de la decisión entera).

## 8. `Comprobante.modelo`: de dónde sale «controles»

- **Qué pasa.** El contrato pide `modelo: { controles, pasaron, avisos }` pero `ModeloValidado` no trae cuántos controles corrió el compilador.
- **Supuesto de P5.** `controles` = los 18 códigos de §9 P3 (`E-ESQUEMA` … `I-SUPUESTOS`, lista `CODIGOS_DE_CONTROL`) más cualquier otro
  código que aparezca en los diagnósticos; `pasaron` = controles − códigos distintos con algún diagnóstico de nivel `error`; `avisos` = cantidad
  de diagnósticos de nivel `aviso`. Con un modelo sin diagnósticos da 18 / 18 / 0.
- **Propuesta.** Que `modelo/indice.ts` exporte la lista de controles (o que `ModeloValidado` traiga `controles: number`) y P5 la use.

## 9. Detalles de la estadística que §7 deja a criterio

- **Wilson** devuelve `[inferior, superior]` (tupla). Con p̂ = 0 el inferior es exactamente 0 y con p̂ = 1 el superior es exactamente 1 (la
  cuenta da 1 ± 2e-16 por redondeo). Una configuración **cumple** si `inferior ≥ meta` (con igualdad cumple).
- **P_q** es `x₍min(n−1, ⌊q·n⌋)₎` con índice desde 0, literal: el P90 de 10 datos es el máximo. **IC del P90:** los rangos `l` y `u` se usan
  también desde 0, como índices de `x` ordenado. Cobertura exacta de ese intervalo con n = 100 (suma de la binomial) = **95,23%**;
  simulada en 2.000 muestras exponenciales (primera pasada, semilla 20261018) = **94,95%**.
- **MSER-5** devuelve las observaciones a descartar (múltiplo de 5). `mser5Detalle` agrega los `MSER(d)`, la cantidad de lotes y
  `tocaElLimite` (el mínimo cayó en ⌊m/2⌋: no se encontró zona estable; es la «alerta si el corte pasa la mitad» de diseño maestro §7.4).
  Las sumas se centran en la media global antes de acumular (una media de 1e9 con ruido de 1 da el mismo corte). `serieMedia` promedia
  las series de las réplicas (hay que hacerlo **antes**: sobre una sola corrida el sesgo empeora).
- **`replicasSugeridas`** (pareada) = `⌈n·(semiancho ÷ (|media|/2))²⌉` con una tolerancia de 1e-9 relativa para que un 80,00000000001 no
  pida 81; es `null` si se distingue (no hace falta) o si la media es 0.
- **Trozos del planificador:** 1 réplica para `VISTA_PREVIA` y `CONFIRMACION`, 5 para `NOCHES`, `DECISION` y `TAMIZADO` (§9 solo fija los
  dos primeros números). Se puede cambiar con `opciones.tamanoTrozo`.
- **`trabajadorEnProceso`** cede el hilo con `setTimeout(0)` después de **cada** réplica (como pide §9). En Node cada ceder cuesta ≥ 1 ms:
  despreciable con noches reales, notable con un simulador falso. `trabajadorEnProcesoCon(sim, motor, { cederCada: N })` lo cambia.
  No hay variante con `worker_threads` (no hizo falta).

## 10. Pruebas estadísticas: el borde de S12 y la política de falsa alarma

- La **cobertura exacta** del Wilson al 95% con p = 0,9 y n = 100 (suma de la binomial) es **93,64%**: la banda de la especificación
  (93%–97%) deja poco margen por abajo. Con 2.000 repeticiones el error de muestreo es ±0,55%, así que una semilla cualquiera cae
  por debajo de 93% en la primera pasada con probabilidad ~12%; con la semilla fija 20261018 la primera pasada dio **93,00%** (justo en el borde).
- Por eso las pruebas con Monte Carlo (S12 y la cobertura del IC del P90) aplican la **política de falsa alarma de §8** dentro de la prueba:
  si la primera pasada cae fuera de la banda, se re-corre con otra semilla y 4× repeticiones, y recién esa decide. Además S12 tiene una
  versión **exacta** (sin azar) que sí tiene que estar en la banda. Ninguna aserción depende de cuánto tarda algo (el único reloj de las pruebas es un
  límite para no colgarse esperando una condición).

## 11. Archivos y herramientas que no están en el árbol de §2

- `estadistica/generar-tabla-t.ts`: genera `tabla-t.json` (beta incompleta regularizada con fracción continua de Lentz y bisección sobre t,
  tal cual pide §7). Se corre una vez: `node experimentos/estadistica/generar-tabla-t.ts`. Le pasa el `log` y el `exp` por parámetro
  (usa los de `contratos/referencia`, que usa `Math.*` a propósito), así que en `experimentos/` no aparece ningún token prohibido de §1.4.
  Una prueba regenera la tabla y la compara con la guardada (tolerancia 1e-9). La tabla coincide con los valores publicados de manual a 9–10 decimales.
- `estadistica/t-student.ts` importa la tabla con `import … with { type: 'json' }`. Funciona en Node 22.22, con `tsc` 6.0.3 y con esbuild.
  **Para la integración:** si `construir.mjs` cae en el plan B (`module.stripTypeScriptTypes` sin esbuild), tiene que conservar ese import
  con su atributo y copiar `tabla-t.json` junto al módulo; los navegadores actuales lo aceptan.
- `pruebas/ayudas.ts`: simulador falso por valor, planificador sincrónico de prueba, variante falsa (solo `replace`), baraja determinista.
- Extras exportados por `indice.ts` que §9 no pide pero ayudan a quien integra: `semaforoDe`, `cuantilNormal`, `serieMedia`, `mser5Detalle`,
  `estadoPorWilson`, `estadoConfiguracion`, `nochesQueFaltan`, `recomendar`, `ErrorCancelado`, `esCancelacion`, `correrYAgregar` (corre un
  trabajo y devuelve los resultados **ordenados por réplica**), `trabajadorEnProcesoCon`, `huellaAgregada`, `claveSemaforo`, `tieneSentido`,
  `ordenarPorReplica`, `resumirNumeros`.
