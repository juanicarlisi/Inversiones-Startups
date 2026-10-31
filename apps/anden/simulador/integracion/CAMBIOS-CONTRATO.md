# Cambios de contrato y de especificación · corte 1, arreglos de la revisión del 19-10-2026 · 20-10-2026

Los arreglos de los hallazgos confirmados de la revisión (H1, H2, E-01…E-05, R1…R5, UX-01…UX-10, SEG-01…SEG-04 y los menores baratos)
**no tocaron `contratos/`**: `pruebas/arquitectura.test.ts` sigue exigiendo que sea idéntico byte a byte al anexo del paso 0 y al código de
los Anexos A y B de `corte-1.md`, y pasa. Pero varios arreglos cambian lo que dice la especificación (`oportunidades/proyectos/anden/corte-1.md`)
o extienden un tipo congelado por fuera del contrato. Este archivo dice cuáles, cómo quedó el código y qué texto se propone. Lo decide el
orquestador (y, si hace falta, el fundador); mientras tanto el código hace lo que se describe acá. MEDIDO = medido en el contenedor del
entorno (4 núcleos, Node 22.22.0) el 20-10-2026.

## 1. `Receta` lleva la huella agregada de las noches del autor (`h`) · H1 y E-01

- **Qué pasaba.** El sello «Reproducida en este dispositivo» se encendía cuando el enlace traía receta, el modelo tenía la misma huella, el
  motor era el mismo y las noches habían terminado: comparaba **entradas**, nunca **salidas**, y salía también sobre el modelo anonimizado.
- **Qué se hizo, sin tocar el contrato.** `modelo/enlace.ts` define `RecetaConHuella = Receta & { h?: string }` (16 hex en minúscula, la
  huella agregada del comprobante) y el códec la lleva con el bit 5 de las banderas (8 bytes). Una receta sin `h` sigue siendo válida (las
  viejas y las del modelo anonimizado). `app/sesion.ts` la pone al compartir (salvo en el modelo anonimizado: otras noches, otra huella) y
  `selloReproducida()` devuelve `reproducida` solo si la huella agregada que calculó este dispositivo es igual a `h` (y coinciden réplicas y
  semilla); si no, `no-coincide`; sin `h`, `sin-huella` («no se puede comprobar»), además de `sin-receta`, `otro-motor` y `calculando`.
- **Además (SEG-03).** La receta pide como máximo `MAX_REPLICAS_RECETA = 1000` noches (antes 100.000) y `noche` < 1000; la escena corre como
  mucho `MAX_NOCHES_ESCENA = 400` y lo dice.
- **Propuesta para el Anexo A (`contratos/receta.ts` o donde viva `Receta`).** Agregar `h?: string` («huella agregada de las `replicas`
  noches del autor, 16 hex») y bajar el tope de `replicas` a 1.000. El código ya lo hace; el cambio de contrato solo lo vuelve oficial.

## 2. Motor 1.1.0: el hub cambia de semántica · R1, R2, R3, R4 (parcial) y R5

`nucleo/version.ts` pasa de 1.0.0 a 1.1.0 (el códec acepta recetas del mismo mayor). Las huellas de las doradas del hub cambian
(`hub/pruebas/doradas.json`, regeneradas); las de la batería del núcleo (P1, P2) no cambian. Cambios de `corte-1.md` §6.7 y §6.9:

| Regla | 1.0.0 (lo que dice §6.7) | 1.1.0 (lo que hace el código) | Hallazgo |
|---|---|---|---|
| 11 · caminata | `caminar` s fijos por cambio de rampa | distancia sobre el pasillo del lazo por el lado más corto ÷ 1,2 m/s, con `caminar` s como mínimo (`hub/config.ts` › `caminataMs`). SUPUESTO: 1,2 m/s, marcha de un adulto sin carga; el esquema `anden.modelo/1` no tiene el campo, queda como constante del motor (`VELOCIDAD_CAMINAR_MPS`) | R1 |
| 7 · plan `por-volumen` | rampas repartidas por volumen en ronda, por todo el lazo | bloques **contiguos** de rampas (en el orden del lazo) con la carga más pareja posible: partición lineal min-max por programación dinámica, desempate por el corte más temprano (`hub/plan.ts` › `particionPareja`) | R1 |
| 11 · `la-mas-llena` y `la-que-se-llena-antes` | elige en cada paquete; empate por orden del modelo | se **queda** en la rampa donde está mientras tenga paquetes y ninguna otra de las suyas esté llena; en un empate gana la actual, después la más cercana, después el orden del modelo. Una jaula completa pendiente en la rampa actual se cierra primero | R2 |
| 6 y 7 · pausas de rampa | la rampa de quien pausa espera | **relevo**: durante la pausa sus rampas las atiende la siguiente persona presente que no esté en pausa (en ronda), como en una ausencia, y al volver las recupera | R3 |
| 6 · pausas después de `fin` | no hay | si la noche se alarga, las pausas siguen con el mismo ritmo (inicio + primera + i·escalón + m·cada) mientras quede trabajo y antes del horizonte; si no queda trabajo se descartan sin dejar rastro (`pausaTrasFin`) | R4 |
| §6.9 · `utilInduccionPct`, `personaOcupadaPct` | ÷ el turno (`fin − inicio`) | ÷ la jornada real, `max(fin, último listo) − inicio`: no pasan del 100% en las noches largas | R5 |

- **Compilador.** `I-PAUSAS-SUPERPUESTAS` (información, no aviso): con el escalón menor que la pausa, cuántas personas del rol pueden estar
  en pausa a la vez (`{hasta, escalon, duracion}`); con el relevo es un dato para el comprobante, no un error.
- **MEDIDO (20 noches, `hub-chico@1.0.0`).** `por-volumen` contra `contiguas`: P(todo antes del corte) 0,73 contra 0,67, recirculación 5,3%
  contra 12,0%, fin P90 282 contra 379 min. En `hub-lazo-noche@1.0.0` (100 noches): con 9 personas de rampa P 0,98 contra 0,84 y
  recirculación 0,0% contra 5,0%; con 8, 0,98 contra 0,80 y una noche de `contiguas` que no termina en el horizonte (a quien le faltan dos
  vecinos le tocan tres tramos de rampas); con 10 o más casi no hay diferencia. Antes «balancear el plan» ganaba también porque 2 s fijos
  hacían gratis cruzar el lazo. Con las 15 personas de la plantilla ninguna rampa se llena con ninguno de los dos planes: el primer minuto
  (`integracion/e2e/comun.mjs`) usa ahora 9 personas y `contiguas`.
- **Lo que esto muestra de la regla 7 (no se cambió):** con `contiguas`, las rampas de una persona ausente pasan enteras a la siguiente
  presente, y con `la-mas-llena` una rampa que no llega a llenarse puede esperar mientras otra de la misma persona esté llena (MEDIDO: en la
  peor noche con 8 personas un paquete esperó 13,5 h). Es la semántica de §6.7; repartir las rampas de la ausente entre varias personas o
  atender por antigüedad queda como propuesta para el corte 2.
- **E01 (§8) se reformula otra vez** (`integracion/pruebas/e-explicador.test.ts`): con relevo, una espera que apenas roza la pausa ya no es
  «por la pausa» (la otra persona estaba trabajando). Se exigen los paquetes que esperan ≥ 5 min **dentro** de la pausa (no ≥ 5 min de
  espera que se superpone en cualquier medida). Solidez y completitud igual que en `NOTAS-CONTRATO.md` §2.
- **Lo que de R4 NO se hizo** (cambia §6.7 reglas 1 y 2 y pide más que un arreglo): la cobertura entre roles (que una persona de descarga
  o de rampa tome un puesto de inducción vacío) y la jornada máxima con la alerta «jornada-excedida». Propuesta: corte 2, con versión 1.2.0.
- **Texto propuesto para §6.7.** Reescribir las reglas 6, 7 y 11 con la columna 1.1.0 de la tabla, y §6.9 con la jornada real.

## 3. CSP de §1.8 endurecida · SEG-06

- `app/index.html` (meta) y `integracion/servir.mjs` (cabecera, que además puede llevar `frame-ancestors 'none'`, que la meta no admite):
  sin `blob:` en `worker-src` (los Workers salen de `self`), y `base-uri 'none'` y `form-action 'none'`.
- **Propuesta para §1.8.** La CSP exacta de `servir.mjs`, y decir que al publicar se manda como cabecera HTTP (con `frame-ancestors`).

## 4. S03 de §8: la cobertura queda informativa y se exige independencia y sesgo · H3

- **Qué pasaba.** Después de fallar con la banda de §8 ([93,1%; 96,9%]), la banda se recentró en la cobertura observada del mismo método
  ([91,4%; 95,9%]): circular, y un defecto que bajara la cobertura 2 puntos pasaba.
- **Qué se hizo.** S03 (exigible) mide lo que la cobertura quería proteger y se puede medir sin circularidad: la media de las 5.000 medias
  de réplica sin sesgo contra W = 9 (|z| ≤ 3,29) y réplicas vecinas sin correlación (r₁ con z = (r₁ + 1/n)·√n, |z| ≤ 3,29). La cobertura
  pasa a S03c, informativa, con la banda de §8 al lado y la explicación (con medias de réplica asimétricas el IC de t con 10 réplicas
  cubre ≈ 93,6%, no 95%). La batería sigue en 85 exigibles.
- **Texto propuesto para §8.** «S03 · réplicas independientes con borrado: sin sesgo contra W y sin correlación de orden 1 entre réplicas
  vecinas, |z| ≤ 3,29. S03c (informativa): cobertura del IC del 95% con 10 réplicas, con la cobertura real del método al lado.»

## 5. Umbral de la batería con ee de las réplicas: t(0,9995; n − 1) · H4

- `verificacion/casos/comun.ts` › `umbralT(n)` = max(3,29; t(0,9995; n − 1)): cuando el ee sale de las propias réplicas el cociente es una
  t con n − 1 grados (con 20 réplicas, |t₁₉| > 3,29 pasa el 0,39% de las veces, no el 0,1%). Con muchas réplicas es 3,29.
- **Texto propuesto para §8.** «|error| ≤ t(0,9995; n − 1) ee (3,29 con muchas réplicas)».

## 6. Decisión secuencial con corrección por mirar varias veces (Bonferroni) · H2 y E-03

- `experimentos/decision.ts`: cada mirada usa la confianza 1 − α/K y z = Φ⁻¹(1 − α/(2K)), con K = 1 + ⌈(máximo − iniciales) ÷ tanda⌉
  (20, 20 y 400 → K = 20, confianza por mirada 99,75%, z = 3,0233). `experimentos/estadistica/normal.ts` calcula la normal y su inversa
  con solo aritmética (sin `Math.log` ni `Math.exp`, §1.4). La pantalla dice la confianza por mirada.
- **MEDIDO.** Probabilidad exacta (programación dinámica sobre la binomial) de declarar «cumple» con p real = meta: ≤ 2,5% para metas 0,8,
  0,9 y 0,95 (antes 9,2% y 4,0%); 2.000 decisiones con la `evaluarDecision` real dentro de 2,5% + 3 ee
  (`experimentos/pruebas/normal.test.ts`). Costo: hacen falta más noches para decidir (hub chico con los datos del recorrido: 420).
- **Texto propuesto para §7.** «Cada mirada de la regla secuencial usa el intervalo de Wilson al nivel 1 − α/K, con K la cantidad de
  miradas posibles, para que el error total de declarar cumple o no cumple no pase de α/2.»

## 7. Presupuesto del enlace: tope de tramos de la película · SEG-01

- `modelo/presupuesto.ts`: `TRAMOS_POR_PAQUETE = 12` (MEDIDO: 11,5 en el chico y 11,6 en el grande, máximo 11,9) y
  `MAX_TRAMOS_ESTIMADOS = 2.000.000`; `modelo/chequeos.ts` da `E-PRESUPUESTO` caso `traza` cuando los paquetes entran en su tope pero la
  película no. El enlace H07b (40 camiones de 48.100 paquetes, ≈ 23 millones de tramos) se rechaza al leerlo, antes de simular.
- **Texto propuesto para §1.8 / §11.** Agregar «tramos estimados de una noche ≤ 2.000.000» a los límites del enlace.

## 8. El sello del motor depende del código que corrió la batería · H5

- `integracion/huella-fuentes.mjs` calcula el SHA-256 de los archivos que alcanza la batería (la clausura de imports de
  `integracion/verificar.ts` más `verificacion/doradas.json`); `npm run verificar` la guarda en `salida/bateria-nucleo.json` y
  `integracion/construir.mjs` la recalcula: si no coincide, el sello dice «sin verificar» en lugar de «85 de 85».
- **Texto propuesto para §8.** «El sello del motor nombra la versión y la huella de las fuentes que pasaron la batería».

## 9. Lo que no se cambió (queda para decidir)

- R6 (rampa alternativa de la misma ruta), R7 (no transportables por la cinta), R8 (recargo nocturno y horas extra), R9 (buffer físico) y
  R10 (jaulas a medio llenar al corte): cambian §6.7 y §6.9 y el esquema; corte 2.
- E-11 (la precisión de la plantilla no se alcanza con 100 noches): hace falta decidir entre más tandas, un botón o revisar la plantilla.
- SEG-05 (primer cuadro desde el enlace 7,5 veces arriba de la meta): ya estaba abierto (`NOTAS-CONTRATO.md` §9).

## 10. «KPI sanos» de §9 (P4): la integración elige el camino 2 · 23-10-2026

**`contratos/` no cambia.** Lo que cambia es el texto de `corte-1.md` §9 (P4, «Pruebas propias»), que no es de ningún paquete: lo pasa
el orquestador.

- **Por qué.** Al pie de la letra (`finClasificacionMin` entre 120 y 300 en las 50 noches) es imposible con `hub-chico@1.0.0` y su semilla:
  en r44 faltan dos de los tres inductores y el único presente necesita 333,5 min solo para inducir (certificado sin correr el hub,
  `hub/pruebas/kpi.test.ts`), y en 200 noches 13 quedan fuera, todas con un golpe discreto que el contrafactual confirma
  (`hub/NOTAS-CONTRATO.md` §13). Publicar `hub-chico@1.1.0` para que pase cambiaría la plantilla que es el ejemplo de §5 (F0, huella dorada
  `0491977a06fedf2a`, tamaños del enlace) y la historia de la decisión que muestra la app.
- **Qué se hizo en el código.** Se borró la prueba `todo` de `hub/pruebas/kpi.test.ts` (la principal ya exige el texto de abajo y pasa; el
  certificado y el criterio literal sobre la propuesta 1.1.0 siguen). `hub-chico@1.1.0` sigue en `PROPUESTAS`, sin publicar.
- **Texto propuesto para §9, P4, «Pruebas propias».** Reemplazar «KPI sanos en 50 noches del hub chico (`clasificados = paquetes` al
  horizonte, `finClasificacionMin` entre 120 y 300, sin alertas)» por: «KPI sanos en 50 noches del hub chico (`clasificados = paquetes` al
  horizonte y sin alertas en todas; `finClasificacionMin` entre 120 y 300 en toda noche sin golpes discretos; una noche con faltas o atraso
  común puede pasarse, pero la misma noche sin ese golpe —misma semilla y réplica— tiene que caer en el rango)».

## 11. Textos de la especificación que trajeron los paquetes en su segunda vuelta · 23-10-2026

Ninguno cambia código ni `contratos/`; son correcciones de `corte-1.md` (y de comentarios del contrato) para que diga lo que el código hace.

| Dónde | Texto propuesto | De |
|---|---|---|
| §6.6 y comentario de `contratos/azar.ts` | «siempre en (0, 1]» en lugar de «(0, 1)»: con `hi` y `lo` en `0xffffffff` la fórmula da 1 exacto (probabilidad 2⁻⁵³). Los 52 bits que lo dejan en (0, 1) estricto, en el motor 2.0.0 (cambian todas las huellas) | P1, `nucleo/NOTAS-CONTRATO.md` §13 |
| §9 P1, «Entrega» | «`VERSION_MOTOR`: la versión del motor completo (núcleo + hub); la sube quien cambie una huella» (hoy `'1.1.0'`) | P1 §13 |
| §6.7 regla 7 (1.1.0, relevo) | «durante la pausa sus rampas las atiende la siguiente persona presente que no esté en pausa; si no hay ninguna, la primera que vuelva de la suya» | P4, `hub/NOTAS-CONTRATO.md` §17.2 |
| §6.7 regla 11 (1.1.0, jaulas) | «una jaula completa la cierra quien atiende la rampa en ese momento (la primera persona que llega); si ya la cerró otra, busca otra tarea» | P4 §16.2 y §17.1 |
| §9 P4, «plan» | comparar `'por-volumen'` contra `'contiguas'` en la plantilla grande con 9 personas de rampa (con las 15 de la plantilla ninguna rampa se llena con ninguno de los dos planes y la prueba no distingue nada) | P4 §15 |

## 12. Arreglos de la revisión del 30-10-2026 · motor 1.2.0 · 31-10-2026

**`contratos/` no cambia** (`pruebas/arquitectura.test.ts` lo sigue exigiendo byte a byte). Lo que sigue extiende tipos por fuera del
contrato o cambia el texto de `corte-1.md`; el código ya lo hace y lo decide el orquestador (o el fundador). MEDIDO = en el contenedor (4
núcleos compartidos, Node 22.22) el 30/31-10-2026.

### 12.1 Motor 1.2.0 (cambian las huellas del hub; `hub/pruebas/doradas.json` regenerado)

| Regla | 1.1.0 | 1.2.0 | Hallazgo |
|---|---|---|---|
| §6.7 regla 12 · vuelta del puesto manual | entra al final de la acumulación sin mirar lugar (la fila llegaba a 154 en 120 lugares) | si fila + cintas + en descarga ya llegan a la capacidad, el paquete espera en la mesa (tramo MANUAL con causa BLOQUEO; la persona sigue ocupada) y entra apenas se libera un lugar, antes que los andenes parados | HUB-R03 |
| §6.7 regla 1 · horas pagadas | presentes × max(turno, último paquete − inicio), a tarifa simple | presentes × turno + presentes × (último paquete − fin) con recargo `RECARGO_HORA_EXTRA` = 1,5 + ausentes × turno × `FRACCION_AUSENTE_PAGADA` = 0,5 (SUPUESTOS con fuente en `hub/costos.ts`: LCT arts. 201 y 208 e IDESA 3T-2025, a verificar en la fuente primaria) | HUB-R02 |
| §6.9 · `personaOcupadaPct` | ÷ la jornada pagada (pasaba de 100% con el cierre de la última jaula y en las noches que no terminan) | ÷ max(jornada, último evento − inicio): numerador y denominador en la misma ventana | REV-D7, HUB-R10 |
| traza · `fin` | max(fin, último evento, último listo) | además, el mayor t1 de los tramos (en las noches que no terminan, tareas agendadas terminaban hasta 20 s después) | REV-D8 |

- **Extras fuera del contrato (`hub/kpi.ts` › `ResultadoReplicaHub.kpiExtra`).** `esperaDesdeLlegadaMediaMin/P90Min` (listo − llegada del
  camión), `estadiaCamionMediaMin/P90Min` (andén libre − llegada: el turn time) y las horas pagadas separadas (normales, extra, de ausentes).
  La «espera» del contrato cuenta desde que empieza la descarga del paquete y no ve la cola en el camión ni en la playa (HUB-R01); la app
  la rotula así («tiempo en el hub desde la descarga») y muestra los extras en la tabla de réplicas del modo ingeniero. La biografía del
  paquete empieza con su camión: a qué hora llegó y cuánto esperó en la playa.
- **Propuesta para el Anexo A (versión 1.2 del contrato, aditiva).** `KPIS` suma `esperaDesdeLlegadaMediaMin`, `esperaDesdeLlegadaP90Min`,
  `estadiaCamionMediaMin` y `estadiaCamionP90Min` (unidad min, mejor «menos»); el esquema `anden.modelo/2` suma
  `costos.fraccionAusentePagada` y `costos.recargoHoraExtra` (hoy constantes del motor, como `VELOCIDAD_CAMINAR_MPS`).
- **Texto propuesto para §6.7 regla 12:** «… vuelve al final de la acumulación si hay lugar (fila + cintas + en descarga < capacidad); si
  no, espera en la mesa con la persona del puesto y entra apenas se libera uno, antes que los andenes parados». Regla 1: la de la tabla.

### 12.2 Decisión secuencial calibrada exacta (EST-04, REV-D1)

- `experimentos/estadistica/secuencial.ts`: el z de cada mirada ya no es Bonferroni. Cada lado del Wilson tiene su z, calibrado con la
  distribución EXACTA del proceso (programación dinámica sobre la binomial, con la misma regla que decide) para que, con p = meta, ni
  «cumple» ni «no cumple» pasen de (1 − confianza) ÷ 2. Para 20/20/400 y confianza 0,95: meta 0,9 → z 2,37 («cumple») y 2,98 («no
  cumple»), errores exactos 2,46% y 2,10%; con p = 0,94 la opción se confirma el 73% de las veces (Bonferroni: 39%). La meta 0,99 se
  puede confirmar (381 noches con todas cumpliendo). Con más de 2.000 noches o 200 miradas, Bonferroni.
- **MEDIDO, de paso:** Bonferroni no solo sobreprotegía «cumple»: del lado de «no cumple» se quedaba CORTO con metas altas (el Wilson
  superior no es exacto en la binomial): 3,19% con meta 0,95, 3,87% con 0,97 y 5,09% con 0,99, contra el 2,5% prometido.
- Meta inalcanzable con el presupuesto (n mínimo = ⌈z²·meta ÷ (1 − meta)⌉ > replicasMax): el semáforo en duda lo dice
  (`experimentos.semaforo.decision-en-duda.inalcanzable`, vars `minimas` y `maximo`).
- **S13 (§8) mide la regla de la interfaz** (`decidirOpcion`, la misma función que usa `evaluarDecision` en cada mirada). **Texto
  propuesto para §8:** «S13 · Decisión con datos fijos y la regla secuencial calibrada (meta 0,9; 20 iniciales, tandas de 20, hasta 400):
  19/20, 20/20 y 97/100 → en-duda; 116/120 y 60/60 → cumple; 336/400 → no-cumple · Exacto». **Para §7:** «Cada mirada usa el Wilson con
  un z por lado, calibrado con la distribución exacta de la regla secuencial para que, con p = meta, la probabilidad de declarar
  “cumple” y la de declarar “no cumple” no pasen de α/2 cada una (Bonferroni si el máximo pasa de 2.000 noches).»

### 12.3 Comparación pareada robusta (EST-02, EST-03, EST-05)

- `comparar` (contrato `Comparar`) devuelve `ComparacionRobusta`: los campos del contrato (`media` e `ic` siguen siendo la media de B − A y
  su IC de t, como dato) más `mediana`, `icMediana` (estadísticos de orden), `bMenor`/`bMayor`/`empates`, `pValor`, `asimetria` y
  `atipicos`. **El veredicto es la prueba del signo exacta** (B mejor en más noches de las que explica el azar; los empates no cuentan) y
  `replicasSugeridas`, las noches para verla con 80% de poder. Con las colas reales del hub (asimetría 11,9) el IC de t cubría la media
  37–62% y daba «B es mejor» con el signo contrario a la media en 1 de cada 4 confirmaciones; el IC de la mediana cubre ≥ 93% y el signo
  nunca contradice a la mayoría de las noches (`experimentos/pruebas/pareada.test.ts`, 2.000 confirmaciones con la anatomía medida).
- «¿Y si…?» confirma con las mismas noches que A (las cien de la escena, antes 40) y cada indicador al 99% (Bonferroni sobre los cinco:
  el error de la tabla entera ≤ 5%; antes, al menos un veredicto falso en el 11% de las tablas). «Iguales en la práctica» solo si el IC de
  la noche típica Y el promedio caben en el mínimo práctico; si no alcanza, se dice el rango («no alcanza para saber»), no «nula».
- **Texto propuesto para §7:** «Comparación pareada: Zᵢ = Bᵢ − Aᵢ; veredicto por la prueba del signo exacta al nivel de confianza (sin los
  empates); se muestra la mediana de Z con su IC por estadísticos de orden y, aparte, las noches atípicas (Iglewicz–Hoaglin, 3,5)».
  **Para §9 P8.5:** «confirmación con las mismas noches que A (hasta N), cada indicador al 1 − α/5».
- **Propuesta para `MotivoSemaforo`:** sumar `'colas-pesadas'` (amarillo). Hoy las noches atípicas van como nota debajo de la tabla.

### 12.4 Presupuesto y esquema (SEG-R1, SEG-R2, SEG-R3, REV-D3)

- Esquema (`modelo/esquema.ts`): coordenadas de andenes, acumulación, origen y puntos de cinta en ±5.000 m; recta ≤ 2.000 m, radio ≤
  500 m; acumulación ≤ 2.000 m; cada cinta ≤ 2.000 m (`E-RANGO cinta-larga`); ≤ 200 andenes y cintas, 500 rampas, 100 puestos; ≤ 50
  personas por andén y ≤ 2.000 por rol; `maxVueltas` ≤ 254 (el motor lo recortaba en silencio, REV-D3).
- Presupuesto (`modelo/presupuesto.ts`): los tramos estimados suman los de las personas (2 por persona de andén y camión, 4 por persona
  de los demás roles y sus pausas) y hay un tope de dibujo: `E-PRESUPUESTO dibujo` con más de 5.000 bandejas. El escritor de la traza
  tiene un tope duro de 4.000.000 de tramos (`nucleo/traza/escritor.ts`).
- Hostiles nuevas (`modelo/pruebas/hostiles/entradas.ts`): H13 (acumulación a 1e9 m), H14 (origen en 1e12), H15 (andén y cinta a 1e9),
  H16 (recta de 300.000 m) y H17 (1,9 millones de personas en un andén) → `esquema`; H16b (paso de 1 cm) → `presupuesto`. El recorrido
  del enlace hostil abre H13 por la URL.
- **Texto propuesto para §1.8 / §11:** las cotas de arriba, y «primitivas por cuadro acotadas: grilla ≤ 200 líneas por eje, muestreo de
  recorridos ≤ 4.000 puntos, lo que queda fuera del lienzo no se compone».

### 12.5 Segunda vuelta del 31-10-2026: R04 con otro motor y el banco honesto (REV-D5, SEG-R6, EXP-02)

`contratos/` sigue sin cambios. Solo textos de `corte-1.md` (lo decide el orquestador):

- **§8, R04 (y §10.7):** «La misma huella en Node y en Chromium, y en Firefox, WebKit y Bun (JavaScriptCore) si están en el entorno; el
  alcance dice qué motores de JavaScript se compararon (Node y Chromium comparten V8)». Bun no reemplaza a Safari ni a WebKit (otro DOM,
  otro Worker): suma un motor que no comparte código con V8 y cuya matemática nativa sí discrepa (por eso el motor usa la propia).
- **§11, presupuesto nuevo:** «Intervalo entre cuadros de la película a ×600 mientras los Workers calculan las cien noches: p95 ≤ 50 ms»
  (`cuadroConWorkers` en `integracion/banco.mjs`, hallazgo EXP-02). **§11, cómo se mide:** «una corrida del banco con la carga del sistema
  al empezar por encima de 0,75 por núcleo, o con la referencia M/M/1 a menos del 80% de la del equipo libre, es “no concluyente” y no
  cuenta como medición» (hallazgo SEG-R6).

### 12.6 Tercera vuelta del 31-10-2026: lo que faltaba de los confirmados (HUB-R01, EST-04, EST-02) y menores (REV-D6, HUB-R11, HUB-R13)

`contratos/` sigue sin cambios. Textos para `corte-1.md` (lo decide el orquestador):

- **§9 P7, lista de cambios fijos por causa (HUB-R01).** Sumar: «DESCARGA (el paquete esperó dentro de su camión: andenes ocupados o
  cola de descarga, desde la llegada del camión o el inicio del turno hasta que empieza su descarga) → una persona más de descarga en cada
  andén». El paquete nace al empezar su descarga, así que esa espera no es un tramo suyo: `explicacion/causas.ts › esperaEnCamion` la arma
  con el primer tramo del camión y el tramo DESCARGA del paquete (las dos horas de la frase salen de ahí y el verificador las controla).
  MEDIDO con `hub-chico@1.1.0` y 2.000 paquetes por camión (réplica 0): 9.171 paquetes pierden el corte y ninguno queda sin candidata
  (1.410 tienen solo la del camión; antes, sin ninguna). En esa saturación el contrafactual NO la confirma (0 de 35 en una muestra: el cuello
  es la inducción y más gente de descarga solo llena la acumulación), así que no se afirma; con los andenes como cuello (1 persona por andén
  y 1.100 paquetes por camión) la confirma en 40 de 40. E01 y E02 siguen en 0 frases sin confirmar.
- **§7 / §9 P8.6 (EST-04).** Con la decisión en duda al llegar al máximo, Decidir ofrece «Seguir simulando (hasta N noches por opción)»:
  un parche a `experimento.replicasMax` (el doble, o las noches que el semáforo dice que faltan o que la meta pide como mínimo, en tandas de
  20 y hasta 2.000, el tope de la calibración exacta). Si la meta pide más de 2.000 noches aunque todas cumplan, no se ofrece y el semáforo
  pide revisar la meta.
- **§8 (EST-02).** La comparación pareada tiene una prueba con noches REALES del hub (`integracion/pruebas/pareada-hub.test.ts`, pozo de
  600 pares de `hub-chico@1.0.0`, puestos 3 → 4, generado con el núcleo de producción y atado a la versión del motor): con cien noches al
  99% el IC de la mediana cubre 98,9–100% y ningún veredicto contradice a la mayoría de las noches; el IC de t cubre la media 68% en la
  espera P90 y en el costo por paquete (37% con 40 noches al 95%).
- **§8, R06 (REV-D6).** «… y la foto tomada apenas restaurada es igual a la original; `correrHasta(T)` deja `ahora = T`». Con eso la
  batería atrapa un `seq` que `restaurar()` no devuelve (comprobado con la mutación: 10 de 10 fotos distintas).
- **§9 P3, códigos (HUB-R11).** `A-SORTER-TIPO`: `banda-cruzada` compila pero el motor del corte 1 lo simula como bandejas basculantes; el
  aviso lo dice. `playa.capacidad` y `lector.s` siguen sin efecto en la simulación (corte 2: playa con capacidad y lector que importe).
- **Plantilla `hub-chico@1.1.0` (propuesta, HUB-R13).** `caminarEntreRampas` dice ahora «s como mínimo al cambiar de rampa» y que la
  caminata real va por la distancia sobre el lazo a 1,2 m/s. La 1.0.0 y la grande publicadas no cambian (son inmutables).
