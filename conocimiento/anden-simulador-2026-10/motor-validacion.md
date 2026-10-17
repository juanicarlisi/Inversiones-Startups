# Andén · Motor, rigor estadístico y validación (17-10-2026)

> Frente de investigación: **qué hace falta para que el motor de Andén sea más riguroso que FlexSim y AnyLogic y creíble para
> ingenieros y cátedras**. Proyecto: P2 (`oportunidades/proyectos/P2-anden.yaml`). Hermanos de este informe:
> `incumbentes.md`, `frontera-ia.md` y `realismo-logistico.md` (misma carpeta).
> Fecha de consulta de todas las fuentes: **17-10-2026**.
> **Método y límite honesto:** el cupo de búsquedas web de la sesión (200 por turno, compartido con los otros frentes) ya estaba
> agotado cuando arrancó este frente. Trabajé con (a) lectura directa de fuentes primarias cuyas direcciones conocía (Law en WSC
> 2023, Sargent en WSC 2010, el manual de FlexSim 2027, el libro de Simio, la documentación de SimPy, el paper de Random123,
> MDN, el diseño de WebAssembly, SimOpt, SALib, JaamSim) y (b) **mediciones propias**: escribí un motor de referencia con la API
> que propongo y le corrí una batería de 78 verificaciones contra teoría de colas y casos publicados. Lo que es bibliografía
> conocida que **no pude abrir hoy** está marcado "[no verificado en línea hoy]". Todo número de este informe sale de una
> fuente con URL o de un script reproducible en `medicion-motor/`.
> Etiquetas: **HECHO** (fuente y fecha) · **MEDIDO** (medición propia reproducible, es un HECHO con fuente = script) ·
> **ESTIMACIÓN** (con método) · **HIPÓTESIS** (a validar) · **INFERENCIA** (razonamiento propio).

---

## 0. Resumen: lo que más debería cambiar el diseño de Andén

1. **La teoría alcanza para certificar el motor, y ya lo probamos.** Un motor de referencia de ~130 líneas con procesos como
   generadores pasó **las 59 verificaciones exigibles** de la batería (más 17 informativas y 2 demostraciones de métodos que
   tienen que fallar): M/M/1, M/M/c (Erlang C hasta 50 servidores), M/D/1, M/G/1
   lognormal, D/M/1 exacto, M/M/c/K, Erlang B con su insensibilidad, prioridades con y sin preempción, red de Jackson con
   realimentación, redes cerradas (MVA y Penny Fab), llegadas no homogéneas, fuente finita, reproducibilidad, y **tres casos
   publicados por Averill Law (WSC 2023) que caen dentro de sus intervalos**. MEDIDO. → La batería es el primer entregable del
   motor, corre en integración continua y se publica: *"Andén Verificado"*. INFERENCIA.
2. **Los intervalos ingenuos mienten, y lo reproducimos.** Calcular el intervalo con los datos de una sola corrida como si
   fueran independientes dio **8,4% de cobertura** contra 95% prometido (Law publica 7,2% con el mismo experimento y escribe que
   ese método "es una opción en uno o más productos comerciales"). Medias por lotes con 20 lotes: **82,2%**.
   Réplicas independientes con borrado: **94,4%**. MEDIDO + HECHO. → Andén nunca muestra un intervalo de una sola corrida;
   réplicas independientes por defecto.
3. **El calentamiento automático hay que aplicarlo bien o empeora.** MSER-5 aplicado a **una sola corrida** de una cola al 90%
   **casi cuadruplicó el sesgo** (de −0,14 a −0,54 clientes sobre 9). Aplicado a la **serie promedio de 10 réplicas** eliminó el sesgo de
   un arranque cargado (de +2,51 a +0,02). MEDIDO. → Regla de diseño: el corte se calcula sobre el promedio entre réplicas y se
   muestra con su gráfico de Welch; nunca réplica por réplica.
4. **Con utilización alta hace falta muchísimo más cómputo del que la gente cree.** La varianza asintótica de la cola M/M/1
   (fórmula de Whitt, que **verificamos: 1.804 medido contra 1.800 teórico**) implica que para estimar el largo de cola con ±1%
   al 95% hacen falta **0,9 millones** de tiempos de servicio simulados al 50% de ocupación, **16,2 millones al 90%** y **63
   millones al 95%**. MEDIDO + cálculo. → El "semáforo de confianza" tiene que mirar la ocupación y avisar antes de correr cuánto
   va a costar la precisión pedida.
5. **Números aleatorios comunes: la diferencia entre 2 y 70 segundos.** Comparando una mejora chica (servicio de 4,5 a 4,4 min),
   sincronizar los flujos aleatorios redujo la varianza de la diferencia **34 veces** (= 34 veces menos réplicas). Comparando 5
   contra 6 empleados, solo **1,43 veces**. MEDIDO. → CRN siempre activados y, sobre todo, **sincronizados por diseño**: un flujo
   con nombre por fuente de azar y atributos sorteados al nacer la entidad.
6. **La reproducibilidad entre navegadores no es gratis.** MDN advierte que muchas funciones de `Math` tienen precisión
   "dependiente de la implementación" y que el mismo motor puede dar resultados distintos en otro sistema operativo o procesador;
   WebAssembly, en cambio, solo tiene no determinismo en patrones de NaN, hilos con memoria compartida y SIMD relajado. HECHO. →
   El núcleo numérico (log, exp, sen, cos) va con implementación propia o en WebAssembly sin SIMD relajado, y cada resultado lleva la
   huella de su traza de eventos: cualquiera reproduce bit a bit una réplica con un enlace. INFERENCIA.
7. **La expresividad cuesta 4,7 veces; se paga solo donde hace falta.** El mismo hub de 3 etapas corre a **1,9–2,1 millones de
   paquetes por segundo** con un motor de callbacks y a **0,40–0,45 millones** con procesos como generadores. MEDIDO. → Motor
   de dos niveles: bloques estándar compilados (colas, servidores, cintas) para la velocidad y procesos-generador para la lógica a
   medida que escriben el usuario o la IA.
8. **Las fórmulas de manual sirven como alarma, no como verdad.** Allen-Cunneen sobreestimó la espera **entre 5% y 9%** y
   Kingman **3,6%** en casos sencillos (E2/E2/c y M/LN/4). MEDIDO. → En Andén la simulación es la respuesta y las aproximaciones son un control de
   cordura visible ("la teoría dice ~0,89 min, la simulación 0,81 ± 0,01: coherente").
9. **En logística el pico de la cola llega después del pico de llegadas.** En una curva diaria senoidal con servicio de 1 h, la
   carga máxima se atrasa **59 min** y se achata **3,3%** respecto del pico de llegadas (fórmula exacta M_t/M/∞, validada por
   simulación). Cálculo + MEDIDO. → Dimensionar mirando solo la curva de llegadas es un error que Andén puede mostrar en vivo.
10. **El estándar a superar está documentado y es alcanzable.** FlexSim 2027 ya replica "hasta lograr la confianza" en sus
    trabajos de optimización y tiene "repetir flujos"; Simio trae selección del mejor de Kim y Nelson (KN) y selección de
    subconjunto, pero para el calentamiento solo aconseja "mirar los gráficos" y hacerlo "largo". HECHO. → Andén gana en rigor por
    **defaults automáticos, transparencia de cada fórmula y una batería pública**, no por inventar estadística nueva. INFERENCIA.

---

## 1. Qué ofrecen hoy los incumbentes en rigor (la vara)

| Herramienta | Réplicas e intervalos | Calentamiento | Números aleatorios | Comparar / optimizar | Etiqueta |
|---|---|---|---|---|---|
| **FlexSim 2027** (Autodesk) | Réplicas por escenario; en trabajos de optimización, modo "Objective Confidence Met": replica "hasta lograr un nivel de confianza para todos los objetivos" (no documenta cómo lo calcula) | Campo "Warmup Time" por trabajo, fijado por el usuario | Opción "Repeat Streams of Replication" para corridas manuales | Trabajo de optimización que genera escenarios; corte "Best Outside Confidence"; núcleos múltiples y CPU distribuidas | HECHO (help.autodesk.com) |
| **Simio** (libro oficial, 6.ª ed.) | Semiancho con t de Student sobre réplicas; nivel editable | "No es nada fácil" saber cuándo hay estado estacionario; mirar gráficos animados de **una** réplica y hacer el calentamiento "largo"; no menciona MSER ni Welch | Por defecto la misma secuencia en cada corrida; réplicas sin solapamiento | OptQuest ("no puede garantizar" el óptimo), selección de subconjunto y **KN** (Kim y Nelson 2001), válido "con o sin" CRN | HECHO (textbook.simio.com) |
| **AnyLogic** | Monte Carlo, sensibilidad, variación de parámetros, optimización con réplicas | No verificado hoy (anylogic.help devolvió 403) | No verificado hoy | OptQuest integrado | HECHO (vía `incumbentes.md`) / sin verificar |
| **Algún producto comercial** (sin nombre) | Intervalo con datos de una sola corrida como si fueran independientes: cobertura real 7,2% | — | — | — | HECHO (Law, WSC 2023) |
| **SimPy** (código abierto) | El usuario los programa | El usuario | El usuario | El usuario | HECHO (simpy.readthedocs.io) |
| **JaamSim** (Apache 2.0) | Sin datos en la portada | — | — | — | HECHO (jaamsim.com) |

**Lectura (INFERENCIA):** los grandes ya tienen piezas sueltas (réplicas adaptativas para optimizar, KN, flujos repetibles), pero
**ninguno documenta un pipeline estadístico completo por defecto** ni publica pruebas de su motor contra teoría. El hueco no es
algorítmico: es de producto (defaults, explicación, verificación pública).

---

## 2. Arquitectura del motor

### 2.1 Núcleo de eventos discretos

| Pieza | Diseño propuesto | Por qué | Etiqueta |
|---|---|---|---|
| Calendario | Heap binario indexado por la clave **(tiempo, fase, prioridad, secuencia)**; cancelación perezosa (marca y descarta al salir) | Orden total y determinista; SimPy desempata por un id creciente ("el que se agendó primero se procesa primero", FIFO) | HECHO (SimPy) / INFERENCIA |
| Fases dentro del mismo instante | `urgente` (interrupciones, arranques) → `normal` → `tardía` (observaciones, estadísticas, render) | Que medir no cambie lo medido; que las interrupciones lleguen antes que las reanudaciones del mismo instante | INFERENCIA |
| Representación del tiempo | `float64` en la unidad base del modelo para el flujo de eventos; **horarios** (turnos, cortes, ventanas) como enteros de segundos convertidos una sola vez | Evitar que `0,1 + 0,2 ≠ 0,3` genere empates falsos en horarios deterministas | INFERENCIA |
| Estado | Todo el estado de una réplica es serializable: **foto** (snapshot) en cualquier instante | Arranque en caliente desde una foto (evita calentamiento), depurar "volviendo atrás", gemelo que arranca del estado real de hoy | INFERENCIA |
| Escala | Heap binario medido a 7,5–8,5 M eventos/s con callbacks (un hilo, Node 22) | Alcanza para hubs grandes; el cuello es la lógica, no el calendario | MEDIDO |

### 2.2 Procesos como generadores

Los procesos se escriben como `function*` de JavaScript/TypeScript que hacen `yield` de un evento y se suspenden hasta que
ocurre (el mismo patrón de SimPy). Primitivas mínimas:

| Primitiva | Qué hace | Equivalente | Etiqueta |
|---|---|---|---|
| `sim.timeout(d)` | Espera `d` unidades de tiempo | SimPy `Timeout` ("se agenda en now + delay") | HECHO (SimPy) |
| `res.request({prioridad, preempt})` / `res.release(r)` | Pide y libera capacidad; cola ordenada por (prioridad, tiempo de pedido, secuencia) | SimPy `Resource`, `PriorityResource`, `PreemptiveResource` | HECHO (SimPy) |
| `store.get(filtro)` / `store.put(x)` | Objetos concretos (paquetes, jaulas, pallets) con filtro o prioridad | SimPy `Store`, `FilterStore`, `PriorityStore` | HECHO (SimPy) |
| `tanque.get(q)` / `tanque.put(q)` | Cantidades continuas o discretas (granel, combustible, cupos) | SimPy `Container` | HECHO (SimPy) |
| `anyOf(...)` / `allOf(...)` | Esperar el primero o todos (abandono de cola, ensamble) | SimPy `AnyOf`/`AllOf` (`\|` y `&`) | HECHO (SimPy) |
| `espera(estado, predicado)` | Dormir hasta que un estado cumpla una condición, **sin sondeo**: el estado avisa al cambiar | salabim "Process interaction with wait()" | HECHO (índice de salabim) / INFERENCIA |
| `proc.interrupt(causa)` | Interrumpe un proceso (falla, preempción, cambio de plan) | SimPy `Interrupt` con `cause` | HECHO (SimPy) |
| `yield* subproceso(...)` | Composición: un proceso llama a otro como subrutina | Delegación de generadores de JS | INFERENCIA |

### 2.3 Preempción: semántica explícita, nunca implícita

SimPy documenta dos trampas: el recurso "valora las prioridades por encima de la preempción" (un pedido con preempción no salta a uno
de mayor prioridad que ya espera) y mezclar pedidos con y sin preempción "puede anular la preempción" ("¡Cuidado con la preempción
mezclada!"). HECHO (simpy.readthedocs.io). Andén obliga a declarar, para cada recurso que puede ser desalojado:

| Decisión | Opciones | Ejemplo logístico |
|---|---|---|
| Qué pasa con el trabajo interrumpido | **reanudar** (sigue donde quedó) · **reiniciar con el mismo tiempo** · **reiniciar con un tiempo nuevo** | Cinta que se traba y sigue · etiqueta que hay que reimprimir · carga que se rehace |
| Dónde vuelve el desalojado | al frente de su clase (clave original) · al final | El paquete a medio clasificar va primero |
| Reloj de fallas | por **tiempo calendario** · por **tiempo de marcha** | Law usa calendario; una cinta se gasta por horas de marcha |

La maqueta implementa "reanudar con clave original" y pasó la prueba de prioridad con preempción y el caso de la fábrica de Law
(fallas por calendario con reanudación). MEDIDO (V19, V20, C04).

### 2.4 Simulación híbrida: eventos + agentes + flujo continuo + cinemática

| Capa | Cómo se integra al calendario | Qué evita | Etiqueta |
|---|---|---|---|
| **Agentes** (choferes, operarios, autoelevadores) | Cada agente es un proceso con estado (diagrama de estados) y reglas; consultas espaciales con grilla o árbol k-d | Un "motor de agentes" aparte con su propio reloj | INFERENCIA |
| **Flujo continuo por tramos** (cintas a granel, tolvas, tanques, cupos de energía) | Entre eventos las tasas son constantes → el nivel es lineal → el cruce de un umbral se **calcula exacto** y se agenda como evento; al cambiar una tasa se recalcula | El paso de tiempo fijo (error y costo); sirve para el 90% de los casos logísticos | INFERENCIA |
| **Continuo no lineal** (dinámica de sistemas, temperatura de cámara de frío) | Integrador con detección de cruce por cero, o métodos de estados cuantizados (QSS, Kofman) [no verificado en línea hoy] | Mezclar mal dos relojes | INFERENCIA |
| **Cinemática** (autoelevadores, AGV, zorras) | Perfil trapezoidal: tiempo exacto de recorrido; la posición se calcula a demanda (x₀ + v·(t − t₀)) solo cuando alguien mira | Mover objetos en cada cuadro: el 3D nunca frena al motor | INFERENCIA |
| **Cintas con piezas** | Cada tramo guarda piezas con posición lineal en el tiempo; eventos solo en llegada al final, acumulación y cambio de velocidad | Simular la cinta milímetro a milímetro | INFERENCIA |
| **Islas de paso fijo** (peatones, tránsito fino) | Un proceso que "late" cada Δt **solo mientras hay actividad** en esa zona | Pagar paso fijo en todo el modelo | INFERENCIA |
| **Render 2D/3D** | El motor emite "tramos de estado" (entidad, desde, hasta, perfil); el visor interpola. Como el motor es determinista, cualquier réplica se **re-genera** desde (modelo, semilla, réplica): no hay que guardar video | Servidores de render; cumple la regla del holding de costo mínimo | INFERENCIA |

### 2.5 Dos niveles de ejecución y dónde corre

- **Medición (MEDIDO, `rendimiento_generadores.js`, Node 22, 4 núcleos compartidos):** mismo hub de 3 etapas (4, 6 y 5
  servidores; 4 paquetes/min; 500.000 min). Callbacks: **1,9–2,1 M paquetes/s**; generadores: **0,40–0,45 M paquetes/s**;
  costo relativo **4,7 veces** por paquete. Ambos dan el mismo tiempo medio en sistema (4,822 contra 4,820 min), lo que además es
  una verificación cruzada entre dos motores. Parte del costo viene de eventos de "tiempo cero" (otorgar el recurso, arrancar el
  proceso): la versión con generadores procesa el doble de eventos (16,0 M contra 8,0 M).
- **Decisión (INFERENCIA):** los bloques estándar (fuente, cola, servidor, cinta, muelle, clasificador) se compilan a un camino
  rápido sin eventos de tiempo cero; los procesos-generador quedan para lógica a medida. Réplicas en paralelo en Web Workers
  (el frente `frontera-ia.md` midió 40 réplicas de una semana en 0,52–0,65 s con 4 hilos). HECHO (hermano) / INFERENCIA.
- **Determinismo entre navegadores:** MDN: "muchas funciones de `Math` tienen una precisión dependiente de la implementación
  [...] distintos navegadores pueden dar resultados distintos. ¡Incluso el mismo motor en otro sistema operativo o arquitectura!".
  WebAssembly solo declara no determinismo en bits de NaN, signo de NaN, hilos con memoria compartida, SIMD relajado y
  agotamiento de recursos. HECHO. → Biblioteca matemática propia (log, exp, trigonométricas) dentro del motor, sin SIMD relajado;
  aritmética básica de IEEE 754. INFERENCIA. Prueba R04 de la batería (pendiente): misma huella en Chrome, Firefox, Safari y Node.

---

## 3. Reproducibilidad y números aleatorios

| Regla | Diseño | Evidencia | Etiqueta |
|---|---|---|---|
| Nunca `Math.random` | Flujos con nombre: `sim.stream('llegadas')` = f(semilla, nombre, réplica) | La maqueta lo hace; misma semilla → misma huella de traza (R01); otra réplica → otra (R03) | MEDIDO |
| Generador de producción | **Philox4x32-10** (basado en contador): clave = (semilla, flujo), contador = (réplica, índice) | Random123: todos sus generadores "pasan BigCrush de TestU01" y dan "al menos 2⁶⁴ flujos paralelos únicos, cada uno con período de 2¹²⁸ o más"; Philox da flujos "independientes de la máquina" | HECHO (Salmon y otros, SC11) |
| Alternativa clásica | MRG32k3a con flujos y subflujos (RngStreams de L'Ecuyer) | El PDF devolvió "Access Denied" | [no verificado en línea hoy] |
| CRN sincronizados | Un flujo por fuente de azar; los atributos (tiempo de servicio, destino, peso) se sortean **al nacer** la entidad; si una rama no se usa, el número igual se consume | Con 2 o 3 servidores, las primeras 50 llegadas son idénticas (R02) | MEDIDO |
| Variables con consumo fijo | Cada variable aleatoria consume siempre la misma cantidad de uniformes (Box-Muller sin caché, Erlang-k con k uniformes) | Necesario para R02 | INFERENCIA |
| Receta del experimento | Cada resultado guarda: huella del modelo, versión del motor, semilla, réplicas, método de calentamiento, versión de la batería que pasó, huella de traza | Permite que una cátedra re-corra bit a bit lo que entregó un alumno | INFERENCIA |

---

## 4. Análisis de salida por defecto

### 4.1 Terminante o estacionario

Law (WSC 2023): una simulación es **terminante** si hay un evento natural que la corta (el hub cierra, se cumple el pedido) y
**no terminante** si interesa el largo plazo. HECHO. En logística casi todo es terminante con ciclo (un día de hub, una
temporada de Hot Sale); Andén lo infiere del modelo (¿tiene horario de cierre o corte?) y lo confirma con el usuario. INFERENCIA.

### 4.2 Calentamiento (solo para estado estacionario)

- Welch (1983) es el método gráfico que recomienda Law: varias réplicas piloto, promedio entre réplicas, suavizado y corte donde
  la curva "se aplana". HECHO (Law 2023).
- **MSER-5** (elegir el corte que minimiza la varianza del promedio truncado, en lotes de 5) se puede automatizar.
  Lo medimos sobre M/M/1 al 90% (L real = 9; 20.000 tiempos de servicio; 200 réplicas o 40 macro-experimentos de 10):

| Prueba | Corte mediano (P90 o rango) | Sesgo sin cortar | Sesgo con MSER-5 | Lectura | Etiqueta |
|---|---|---|---|---|---|
| Una corrida, arranque vacío (S04–S05) | 0 (P90: 5.550) | −0,138 (ee 0,088) | **−0,536** (ee 0,085) | Empeora: corta en el fin de una excursión alta | MEDIDO |
| Una corrida, arranque con 100 (S06–S07) | 1.200 (P90: 6.350) | +2,408 (ee 0,126) | −0,436 (ee 0,093) | Corrige, pero se pasa | MEDIDO |
| Promedio de 10 réplicas, vacío (S10–S11) | 50 (0–2.800) | −0,028 (±0,130) | −0,024 (±0,130) | Inocuo | MEDIDO |
| Promedio de 10 réplicas, con 100 (S10–S11) | 1.350 (750–6.150) | +2,511 (±0,210) | **+0,017** (±0,144) | Elimina el sesgo | MEDIDO |

  Referencia de escala: el tiempo de relajación de M/M/1 es 1/(μ(1−√ρ)²) = **380** tiempos de servicio al 90%; vaciar 100
  clientes al ritmo neto de 0,1 por unidad lleva ~1.000. Cálculo (INFERENCIA; fórmula clásica de Morse [no verificado en línea hoy]).
- **Regla para Andén (INFERENCIA):** MSER-5 sobre la serie promedio de réplicas + gráfico de Welch visible + alerta si el corte
  supera la mitad de la corrida (señal de corrida corta o de sistema inestable) + opción de **arranque en caliente** desde una
  foto o desde el estado real de hoy. Con arranque estacionario (cuando se conoce) no hace falta calentamiento: lo probamos en S09
  (L = 4,008 ± 0,013 contra 4 sin cortar nada).

### 4.3 Réplicas, intervalos y precisión objetivo

- Réplicas independientes con t de Student: intervalo X̄ ± t·S/√n; para estado estacionario, réplica/borrado. Para cuadruplicar
  la precisión hacen falta 4 veces más réplicas (en el ejemplo de la oficina de Law: de 25 a 225 réplicas para pasar de ±1,10 a
  ±0,37 min). HECHO (Law 2023).
- **Probabilidades y percentiles también** (Law): probabilidad = proporción de réplicas con el evento; percentil con
  estadísticos de orden (en su ejemplo, P95 de la cola máxima = 25 con IC 90% [22; 27] en 100 réplicas). HECHO. En logística
  se decide por el P90 del tiempo en patio, la probabilidad de perder el corte de un camión, el máximo de la playa: Andén los
  muestra por defecto junto a la media. INFERENCIA.
- **Cobertura medida** (S01–S03; M/M/1 con λ = 1/min y μ = 10/9 por min, W = 9 min; corrida de 15.000 min con 5.000 de
  calentamiento; 500 macro-experimentos; banda de ±1,9 puntos):

| Método | Cobertura real del "IC 95%" | Etiqueta |
|---|---|---|
| Una corrida, observaciones tratadas como independientes | **8,4%** (Law: 7,2%) | MEDIDO + HECHO |
| Una corrida, 20 medias por lotes de ~500 min | **82,2%** | MEDIDO |
| 10 réplicas independientes con borrado | **94,4%** | MEDIDO |

- **Precisión objetivo (INFERENCIA):** el usuario pide "±2% en el costo por paquete" (o Andén lo propone); el motor corre una
  tanda inicial de 10 réplicas, estima cuántas faltan con n ≈ n₀·(semiancho₀/semiancho)² (el mismo cálculo de Law) y avisa el
  tiempo ("faltan 38 réplicas, 9 s en este teléfono"). Con varias métricas, Bonferroni o un objetivo principal declarado.

### 4.4 Cuánto hay que correr: la ley de la ocupación

Whitt (1989) da la varianza asintótica del promedio temporal del número en sistema de M/M/1 con μ = 1: σ² = 2ρ(1+ρ)/(1−ρ)⁴
[artículo no verificado en línea hoy: el PDF dio 404]. **Lo verificamos**: con ρ = 0,8, T·Var medido = **1.804** (IC 95%
[1.496; 2.218]) contra **1.800** teórico (S08). MEDIDO. De ahí, el tiempo total simulado para estimar L con un semiancho relativo
ε al 95% es T = 1,96²·σ²/(ε²L²):

| Ocupación ρ | Tiempo de relajación (tiempos de servicio) | Para ±5% | Para ±1% | Etiqueta |
|---|---|---|---|---|
| 0,50 | 12 | 36.900 | 922.000 | Cálculo (fórmula verificada) |
| 0,70 | 38 | 82.900 | 2.073.000 | Cálculo |
| 0,80 | 90 | 172.900 | 4.322.000 | Cálculo |
| 0,85 | 164 | 297.300 | 7.432.000 | Cálculo |
| 0,90 | 380 | 648.800 | 16.220.000 | Cálculo |
| 0,95 | 1.560 | 2.523.000 | 63.083.000 | Cálculo |

Ejemplo (ESTIMACIÓN): un puesto de inducción con servicio medio de 2,5 s al 90% necesita ~16,2 M × 2,5 s ≈ **470 días
simulados** para ±1% en su cola (repartidos entre réplicas). Con ~1,0–1,4 M clientes/s medidos en M/M/1 (P01: 4,3–5,7 M eventos/s según la carga de la máquina),
son ~10–15 s de cómputo en un hilo: barato para el motor, imposible "a ojo". INFERENCIA: el producto tiene que **mostrar este costo antes de
correr** y sugerir métricas más estables (ocupación, rendimiento) cuando la cola está al límite.

### 4.5 Curvas horarias: el pico de la carga se atrasa

Para llegadas de Poisson no homogéneas con tasa λ(t) = λ̄(1 + β·sen γt) y servicio exponencial (M_t/M/∞), la carga media es
exactamente m(t) = λ̄/μ + λ̄β(μ·sen γt − γ·cos γt)/(μ² + γ²) en régimen. Con ciclo de 24 h y μ = 1/h, el pico se atrasa
arctan(γ/μ)/γ = **0,98 h** y la amplitud se multiplica por μ/√(μ²+γ²) = **0,967**. Cálculo (INFERENCIA; la línea de trabajo es
Eick, Massey y Whitt 1993 [no verificado en línea hoy]). La maqueta lo reprodujo en 4 instantes del ciclo (V28) y confirmó que
N(t) es Poisson (varianza/media 1,08 ± 0,14; V29). MEDIDO. → Andén tiene que generar llegadas no homogéneas **exactas**
(adelgazamiento, no "tasa constante por hora"), y mostrar la curva de carga contra la de llegadas. INFERENCIA.

---

## 5. Comparar escenarios

| Herramienta estadística | Qué resuelve | Estado en Andén | Etiqueta |
|---|---|---|---|
| Diferencia pareada con IC (Law) | "¿La mejora es real?" entre 2 escenarios: Zⱼ = X₁ⱼ − X₂ⱼ, IC con t | Por defecto, con CRN | HECHO (Law 2023) |
| CRN | Reduce la varianza de la diferencia | Medido: **×1,43** (5 contra 6 empleados) y **×34,4** (servicio 4,5 → 4,4 min): ±0,039 contra ±0,231 min con 2.000 réplicas (E01, E03) | MEDIDO |
| Selección de subconjunto | Separa "posibles mejores" de "rechazados"; no rechazado ≠ bueno | Para 3 a 20 escenarios | HECHO (Simio) |
| **KN** (Kim y Nelson 2001), totalmente secuencial | Elige el mejor con confianza 1−α si la diferencia supera la **zona de indiferencia** δ; el cómputo crece "superlinealmente" al achicar δ | Cierre de toda optimización; δ en pesos ("no me importan diferencias de menos de $5.000/día") | HECHO (Simio) |
| OCBA, comparaciones múltiples con el mejor | Repartir réplicas donde más informan | Fase 2 | [no verificado en línea hoy] |

Por qué el CRN rinde tan distinto (INFERENCIA, verificable con los datos de E01): la varianza de la diferencia con CRN no puede
bajar de (σ₁ − σ₂)²; con 5 empleados la demora diaria tiene un desvío de ~4,2 min y con 6, de ~0,75 min, así que aunque la
correlación sea alta (~0,86) el piso es alto. Con dos configuraciones parecidas (lo típico al ajustar una operación: −2% de
tiempo, un operario más en un puesto) los desvíos son similares y el CRN es enorme. **Mensaje de producto:** comparar cambios
chicos sin CRN cuesta decenas de veces más réplicas; con CRN sale en segundos.

**Veredicto en lenguaje llano (INFERENCIA):** "Con un muelle más, el P90 del tiempo en patio baja 12,4 min (entre 10,8 y 14,1;
40 réplicas pareadas). La diferencia es real." Si el IC cruza el cero: "No podemos distinguir los escenarios con 40 réplicas;
hacen falta ~160 o aceptar que la diferencia es menor que 2 min".

---

## 6. Diseño de experimentos, sensibilidad y optimización con restricciones

### 6.1 Diseño de experimentos y metamodelos

| Necesidad | Método | Etiqueta |
|---|---|---|
| Pocos factores (≤ 5) | Factorial 2ᵏ o completo, con CRN entre puntos | INFERENCIA |
| Muchos factores (10–100) | Hipercubos latinos casi ortogonales (NOLH) y bifurcación secuencial para descartar factores sin efecto | [no verificado en línea hoy] (Kleijnen, Sanchez y otros) |
| "Qué pasa si" instantáneo | Metamodelo (proceso gaussiano) entrenado con las corridas: el control deslizante responde al instante **con su banda de incertidumbre** y el motor re-simula cuando el usuario sale de la zona confiable | HIPÓTESIS (de producto) |
| Granja de datos para cátedras | Diseños grandes corridos en los navegadores de los alumnos | HIPÓTESIS |

### 6.2 Sensibilidad

- Local: un factor por vez con CRN (diferencias finitas pareadas), en un **tornado en pesos** ("cada 1% de entrega fallida
  cuesta $X por paquete"). INFERENCIA.
- Global: Morris para filtrar y Sobol para repartir la varianza. SALib implementa Sobol, Morris, FAST, RBD-FAST, Delta, DGSM,
  Shapley, factorial fraccionado, HDMR, PAWN y sensibilidad regional: sirve como **implementación de referencia para validar** la
  nuestra. HECHO (salib.readthedocs.io). Sargent también lista la variabilidad de parámetros como técnica de validación: "las
  mismas relaciones deberían ocurrir en el modelo que en el sistema real". HECHO.

### 6.3 Optimización con restricciones

- La vara: OptQuest (búsqueda dispersa y tabú) en FlexSim, AnyLogic y Simio; Simio aclara que estos métodos "no pueden garantizar
  absolutamente" el óptimo y que sus resultados son medias con error de muestreo. FlexSim 2027 corta por tiempo, por iteraciones
  o por "Best Outside Confidence". HECHO.
- **Pipeline de Andén (INFERENCIA):**
  1. Variables tipadas (enteras, continuas, categóricas: muelles 3–8, operarios por turno, regla de carga).
  2. Búsqueda global con presupuesto de réplicas (optimización bayesiana con ruido o evolutiva para lo discreto; el frente
     `frontera-ia.md` suma la evolución de reglas con LLM usando el simulador como evaluador).
  3. **Restricciones estocásticas** declaradas como probabilidad ("paquetes tarde ≤ 2% con 95% de confianza"), con chequeo de
     factibilidad estadístico, no por la media.
  4. **Cierre con KN** entre los mejores candidatos, con δ en pesos: lo que se recomienda tiene garantía, no solo "salió primero".
  5. Todo con CRN entre candidatos.
- **Credibilidad:** correr el optimizador de Andén sobre **SimOpt**, el banco de pruebas abierto (licencia MIT) de problemas y
  algoritmos de optimización por simulación de Eckman, Shashaani, Henderson y otros, que compara algoritmos por su desempeño en
  tiempo finito con curvas de progreso e intervalos. HECHO (github.com/simopt-admin/simopt). Publicar esas curvas es una forma
  barata de ganarse a las cátedras. INFERENCIA.
- Riesgo (INFERENCIA): un optimizador o un LLM que evalúa miles de reglas con pocas réplicas **sobreajusta al ruido** ("ganó
  porque tuvo suerte"). Por eso el paso 4 no es opcional.

---

## 7. La batería de validación (lo que el motor tiene que pasar)

**Criterio de aprobación (INFERENCIA):** cada prueba estocástica pasa si |error| ≤ 3,29 errores estándar (99,9%) y el error
relativo ≤ 3% (≤ 1–2% en probabilidades). Con 59 verificaciones exigibles, la chance de al menos una falsa alarma en una corrida
completa es ~6% (1 − 0,999⁵⁹); por eso una falla se re-corre sola con otra semilla y 4 veces más réplicas, y solo si vuelve a
fallar se trata como error del motor. La precisión exigida (semiancho ≤ 2% del valor en la mayoría) asegura que la prueba detecte errores reales. Resultados de la
maqueta: `medicion-motor/resultados-validacion.json` (semillas fijas; se reproduce con `node validacion.js`). Valores teóricos
calculados por fórmula en el mismo script.

### 7.1 Teoría de colas (valores analíticos esperados)

Unidad de tiempo = tiempo medio de servicio (μ = 1) salvo que se diga otra cosa. 20 réplicas por prueba salvo indicación.

| ID | Prueba | Valor esperado | Maqueta (± semiancho 95%) | ¿Pasa? |
|---|---|---|---|---|
| V01–V05 | M/M/1 ρ = 0,5: Wq · L · ocupación · P(esperar) · Little (L − λW) | 1 · 1 · 0,5 · 0,5 · 0 | 0,9986 ± 0,0069 · 0,9988 ± 0,0048 · 0,4996 · 0,4991 · −0,0003 | Sí |
| V01–V05 | M/M/1 ρ = 0,8 | Wq = 4 · L = 4 | 3,972 ± 0,043 · 3,975 ± 0,038 | Sí |
| V01–V05 | M/M/1 ρ = 0,9 | Wq = 9 · L = 9 | 8,897 ± 0,109 · 8,905 ± 0,105 | Sí |
| V06–V07 | M/M/3, λ = 2,4 (ρ = 0,8): Erlang C · Wq | 0,64719 · 1,07865 | 0,64736 ± 0,0013 · 1,0813 ± 0,0091 | Sí |
| V06–V07 | M/M/5, λ = 4,5 (ρ = 0,9) | 0,76249 · 1,52499 | 0,76285 ± 0,0020 · 1,5338 ± 0,0255 | Sí |
| V06–V07 | M/M/50, λ = 45 (ρ = 0,9) | 0,36386 · 0,072773 | 0,36431 ± 0,0041 · 0,07325 ± 0,0020 | Sí |
| V08 | M/D/1 ρ = 0,9 (Pollaczek-Khinchine): Wq | 4,5 | 4,4967 ± 0,0728 | Sí |
| V09 | M/G/1 lognormal (media 1, cv 1,5), ρ = 0,7: Wq = λE[S²]/(2(1−ρ)) | 3,79167 | 3,7692 ± 0,0461 | Sí |
| V10–V11 | D/M/1 ρ = 0,9 exacto (GI/M/1: σ = e^{−(1−σ)/ρ} = 0,80690): Wq · P(esperar) (40 réplicas) | 4,17866 · 0,80690 | 4,2123 ± 0,0386 · 0,80712 ± 0,0008 | Sí |
| V12 | Kingman E2/E2/1 ρ = 0,9 (aproximación) | 4,5 | 4,342 ± 0,052 (aprox. +3,6%) | Informativa |
| V12 | Allen-Cunneen E2/E2/2 ρ = 0,8 · E2/E2/4 ρ = 0,85 · M/LN/4 ρ = 0,85 cv 1,5 | 0,8889 · 0,5744 · 1,8669 | 0,8127 · 0,5259 · 1,7734 (aprox. +9%, +9%, +5%) | Informativa |
| V13–V14 | M/M/2/5, λ = 2: P(rechazo) · L (nacimiento y muerte) | 0,181818 · 2,72727 | 0,18156 ± 0,0009 · 2,7230 ± 0,0052 | Sí |
| V15 | M/M/10/10, carga 7 Erl: Erlang B | 0,078741 | 0,078809 ± 0,00031 | Sí |
| V16 | M/G/10/10 lognormal cv = 2: **insensibilidad** de Erlang B | 0,078741 | 0,078832 ± 0,00025 | Sí |
| V17–V18 | Prioridad sin preempción (Cobham), λ = (0,3; 0,5): Wq alta · Wq baja | 1,14286 · 5,71429 | 1,1440 · 5,7123 | Sí |
| V19–V20 | Prioridad con preempción y reanudación: tiempo en sistema alta · baja | 1,42857 · 7,14286 | 1,4260 · 7,1507 | Sí |
| V21–V23 | Red de Jackson: λ = 1 externo; nodo 1 M/M/2 μ = 1 → 70% al 2 y 30% al 3; nodo 2 M/M/1 μ = 1,2 → 20% vuelve al 1; nodo 3 M/M/1 μ = 0,5. L total · W total · L₁ · L₂ · L₃ | 6,17266 · 6,17266 · 1,75654 · 2,10843 · 2,30769 | 6,1674 · 6,1701 · 1,7496 · 2,1061 · 2,3117 | Sí |
| V24 | Penny Fab **determinista** (4 estaciones de 2 h, 1 máquina): TH y CT con N = 2, 4, 6 | 0,25/h y 8 h · 0,5/h y 8 h · 0,5/h y 12 h | 0,2501 y 8,0000 · 0,5001 y 8,0000 · 0,5001 y 12,0000 | Sí |
| V25–V26 | Penny Fab exponencial balanceada N = 4 (peor caso práctico de Hopp y Spearman): TH · CT | 0,285714/h · 14 h | 0,28597 · 13,986 | Sí |
| V27 | Red cerrada desbalanceada (medias 1; 2; 1,5; 0,5 h), N = 5, por MVA: TH | 0,437838/h | 0,43800 ± 0,0008 | Sí |
| V28–V29 | M_t/M/∞, λ̄ = 20/h, β = 0,6, ciclo 24 h, μ = 1/h: E[N(t)] en t = 48, 54, 60, 66 h · varianza/media (400 réplicas) | 17,060 · 31,230 · 22,940 · 8,770 · 1 | 17,28 · 31,15 · 22,70 · 8,69 · 1,08 ± 0,14 | Sí |
| V30 | Fuente finita: 5 máquinas, falla 0,1/h cada una, 1 reparador a 1/h: máquinas rotas en promedio | 0,639522 | 0,64006 ± 0,0033 | Sí |

### 7.2 Casos publicados

| ID | Caso (Law, WSC 2023) | Publicado | Maqueta | ¿Pasa? |
|---|---|---|---|---|
| C01 | Oficina 9–17 h, 5 empleados, llegadas exp(1 min), servicio exp(4,5 min), atiende hasta vaciarse: demora media en cola | 5,68 ± 1,10 min (25 réplicas) | 5,426 ± 0,184 (2.000 réplicas) | Sí (dentro) |
| C02 | Ídem con 6 empleados | 1,30 min (25 réplicas, sin IC publicado) | 1,201 ± 0,033 | Informativa |
| C03 | Diferencia 5 contra 6 | 4,39 ± 0,99 min | 4,225 ± 0,157 | Sí (dentro) |
| C04 | Fábrica: máquina U[0,65; 0,70] + inspector U[0,75; 0,80], 10% retrabajo, fallas exp(6 h) por calendario, reparación U[8; 12] min con reanudación: horas para 2.000 piezas | 33,25 ± 0,56 h (10 réplicas) | 33,401 ± 0,074 (400 réplicas) | Sí (dentro) |
| C05 (pendiente) | Taller de 5 estaciones con 2 autoelevadores y bloqueo (Law 2015, cap. 14, diseño 3): rendimiento diario | 120,29 ± 0,63 trabajos/día (IC 90%) | — | A construir |

### 7.3 Estadística, reproducibilidad, cinemática y continuo

| ID | Prueba | Esperado | Maqueta | Estado |
|---|---|---|---|---|
| S01–S03 | Cobertura de IC 95% (ingenuo · lotes · réplicas) | Ingenuo y lotes pocos **deben fallar** (demostración); réplicas ∈ [93,1%; 96,9%] | 8,4% · 82,2% · 94,4% | Sí |
| S04–S07, S10–S11 | MSER-5 por corrida y sobre el promedio | Sesgo con corte sobre promedio dentro del ruido | Ver §4.2 | Sí (regla) |
| S08–S09 | Varianza de Whitt; arranque estacionario sin calentamiento | 1.800 · L = 4 | 1.804 [1.496; 2.218] · 4,008 ± 0,013 | Sí |
| R01–R03 | Misma semilla → misma huella; CRN sincronizados; otra réplica → otra huella | Idénticas / idénticas / distintas | 309fc7e8 = 309fc7e8 · idénticas · distinta | Sí |
| R04 | Misma huella en Chrome, Firefox, Safari (móvil y escritorio) y Node | Idéntica | — | A construir |
| K01 | Autoelevador, perfil trapezoidal, vmáx 2 m/s, aceleración 0,5 m/s²: 5 m · 8 m · 30 m · 100 m | 6,325 s · 8,000 s · 19,000 s · 54,000 s | — | A construir |
| K02 | Cinta sin acumulación de 42 m a 2 m/s, paso 0,6 m: tránsito · capacidad | 21,0 s · 12.000 piezas/h | — | A construir |
| K03 | Cinta con acumulación de 42 m, paso 0,6 m, salida bloqueada: piezas que entran antes de bloquear la entrada | 70 | — | A construir |
| K04 | Tanque de 10 m³ vacío, entra 2 m³/min, sale 0,5 m³/min desde el minuto 3: instante de lleno (evento exacto, sin paso fijo) | 5,6667 min | — | A construir |
| D01 | Prueba degenerada (Sargent): M/M/1 con λ = 1,2 y μ = 1: la cola crece a 0,2 por unidad de tiempo | Pendiente 0,2 | — | A construir |
| M01 | Prueba metamórfica: cambiar la unidad de minutos a segundos con la misma semilla multiplica todos los tiempos por 60 | Exacto | — | A construir |
| M02 | Conservación en cada bloque: entraron = salieron + adentro; Little por bloque al final de cada réplica | Exacto / ≤ 2% | V05 y V22 lo cumplen | Sí (parcial) |
| P01–P02 | Rendimiento: eventos/s y paquetes/s por nivel de motor | Referencia, no umbral | 4,3–5,7 M eventos/s (M/M/1) · 0,40–0,45 M contra 1,9–2,1 M paquetes/s | Informativa |

Además, Sargent recomienda acordar la validación **antes** de construir, fijar la precisión requerida de cada salida, hacer
validez aparente con expertos en cada iteración, comparar con datos del sistema real y revisar la validez periódicamente; su
lista incluye trazas, gráficos operativos, pruebas de condiciones extremas y degeneradas, validación con datos históricos y
pruebas de Turing ("¿cuál es la salida real y cuál la del modelo?"). HECHO (WSC 2010). Andén lo convierte en funciones: modo
traza de una entidad, prueba de Turing con datos del usuario y "reporte de validación" del modelo. INFERENCIA.

---

## 8. API del motor (diseño propuesto)

Tres capas. La IA escribe sobre todo la capa 1 (datos tipados, verificables); un ingeniero puede bajar a la capa 2; la capa 3
es la misma para la interfaz, la IA y las cátedras. INFERENCIA (coherente con `frontera-ia.md`: "la IA llena un esquema").

### 8.1 Capa 1: el modelo como datos

```yaml
modelo: hub-ejemplo           # todo con unidades; el validador rechaza lo que no las tiene
unidades: { tiempo: min, distancia: m, dinero: ARS }
llegadas:
  camiones:
    proceso: poisson_no_homogeneo
    tasa_por_hora: { planilla: volumenes.xlsx, hoja: curva, columna: camiones }   # curva de 15 min
    atributos: { paquetes: { lognormal: { media: 850, cv: 0.35 } } }              # se sortea al nacer
recursos:
  muelles:   { capacidad: 4 }
  operarios: { capacidad: { turno: { "06-14": 12, "14-22": 9 } } }
  induccion: { capacidad: 3, fallas: { reloj: marcha, mtbf_min: 480, mttr_min: { uniforme: [8, 12] }, al_fallar: reanudar } }
flujo:
  - { paso: esperar_muelle, recurso: muelles, abandono: { paciencia_min: 90 } }
  - { paso: descargar, usa: [muelles, operarios], duracion_min: "paquetes * 0.012" }
  - { paso: inducir, recurso: induccion, por_unidad: paquetes, duracion_s: { triangular: [1.8, 2.2, 3.5] } }
salidas: [costo_por_paquete, p90_tiempo_en_patio, prob_perder_corte_22h, ocupacion.induccion]
```

### 8.2 Capa 2: procesos a medida (TypeScript)

```ts
import { Sim, Resource, Store, anyOf } from '@anden/motor';

export function* camion(sim: Sim, c: Camion, m: Hub) {
  const llegada = sim.now;
  const turno = m.muelles.request({ prioridad: c.conCorte ? 0 : 1 });
  const r = yield anyOf(turno, sim.timeout(c.pacienciaMin));     // abandono de playa
  if (!r.has(turno)) { turno.cancel(); m.kpi.abandonos.add(1); return; }
  try {
    const equipo = yield m.operarios.request({ cantidad: 2 });
    yield sim.timeout(c.paquetes * m.p.descargaMinPorPaquete);
    m.operarios.release(equipo);
    for (const jaula of c.jaulas) yield m.colaInduccion.put(jaula); // Store con jaulas concretas
  } finally {
    m.muelles.release(turno);
    m.kpi.tiempoEnPatio.add(sim.now - llegada);
  }
}
```

### 8.3 Capa 3: experimentos, comparación y optimización

```ts
import { experimento, comparar, optimizar, entero, opcion, probabilidad } from '@anden/experimentos';

const exp = experimento(modelo, {
  tipo: 'terminante', horizonte: { hasta: 'vacio', cierreLlegadas: '22:00' },
  replicas: { min: 10, max: 2000, precision: { metrica: 'costo_por_paquete', relativa: 0.02 }, confianza: 0.95 },
  crn: true, semilla: 20261017,
});

const r = await comparar(exp, { base: {}, masUnMuelle: { 'muelles.capacidad': 5 } }, { metodo: 'pareado' });
r.diferencia('p90_tiempo_en_patio');
// → { media: -12.4, ic95: [-14.1, -10.8], unidad: 'min', replicas: 40, veredicto: 'mejora real', receta: 'and3n:7f2c…' }

const o = await optimizar(exp, {
  variables: { muelles: entero(3, 8), operariosNoche: entero(4, 20), regla: opcion(['FIFO', 'por_ruta', 'por_corte']) },
  objetivo: { minimizar: 'costo_total_dia' },
  restricciones: [probabilidad('paquetes_tarde / paquetes <= 0.02', { confianza: 0.95 })],
  presupuesto: { replicas: 4000 },
  cierre: { metodo: 'KN', indiferencia: { costo_total_dia: 5000 } },   // garantía sobre la recomendación
});
```

Cada resultado trae: estimación, intervalo, réplicas usadas, método de calentamiento y corte, **semáforo** (verde: precisión
lograda; amarillo: precisión no lograda o corte > 50% de la corrida; rojo: sistema inestable, ρ ≥ 1, o Little/conservación
violados) y la **receta** que lo reproduce bit a bit. INFERENCIA.

### 8.4 El motor de referencia ya existe (maqueta)

`medicion-motor/motor_ref.js` implementa las piezas de la capa 2 (calendario con orden total, procesos-generador, recurso con
prioridad y preempción-reanudación, interrupciones, monitores, flujos con nombre) y `medicion-motor/validacion.js` la batería.
Los modelos de prueba se escribieron con esa API: la oficina de Law entra en cinco líneas. MEDIDO. No es el motor de
producción (le faltan `Store`, `Container`, `anyOf`, cintas, cinemática, Philox y la biblioteca matemática propia).

---

## 9. Hoja de ruta técnica (encaja en el gantt de P2)

| Cuándo | Qué | Criterio de corte | Etiqueta |
|---|---|---|---|
| nov–dic 2026 | Motor de producción en TypeScript: núcleo + Philox + matemática propia + `Store`/`Container`/`anyOf`; batería V/C/S/R en integración continua | Pasa la batería en Node y en 3 navegadores (R04) | ESTIMACIÓN (Claude, ~3–4 semanas de trabajo) |
| ene–mar 2027 | Camino rápido para bloques estándar; Workers; experimentos con precisión objetivo, MSER-5 sobre promedio, CRN, comparación pareada, semáforo | Costo relativo generadores/bloques medido; ≤ 1,5× contra `des.js` en bloques | ESTIMACIÓN |
| abr–jul 2027 | Cintas, cinemática, flujo por tramos (K01–K04); KN y subconjunto; esquema de modelo para la IA; C05 | Junto con «Contame tu operación» v1 | ESTIMACIÓN |
| 2º cuatr. 2027 | Página pública "Andén Verificado" + optimizador sobre SimOpt; kit para cátedras (re-correr recetas) | Una cátedra usa la batería en clase | HIPÓTESIS |
| 2028 | Metamodelos para "qué pasa si" instantáneo; Sobol/Morris validados contra SALib; foto de estado real para gemelo | Error del metamodelo dentro de su banda en ≥ 95% de los puntos de prueba | HIPÓTESIS |

---

## 10. Lo que no pude verificar hoy y cómo conseguirlo

- **AnyLogic** (manual de experimentos y aleatoriedad): anylogic.help devolvió 403. Leerlo desde un navegador o con más acceso de red.
- **Whitt 1989** (PDF 404): la fórmula está verificada por simulación (S08), falta la cita exacta.
- **MSER y comparaciones de métodos de calentamiento** (White 1997; Franklin y White; Hoad, Robinson y Davies 2010, proyecto
  AutoSimOA): no abrí los originales (las direcciones que probé eran otros papers o 404). Lo afirmado sobre MSER-5 es medición propia.
- **L'Ecuyer, RngStreams/MRG32k3a**: PDF bloqueado por protección antibots.
- **Kim y Nelson 2001, OCBA, NOLH, QSS, Eick-Massey-Whitt 1993, Allen-Cunneen, Morse**: bibliografía conocida citada sin abrir.
- **Caso C05** (Law 2015, cap. 14): el resultado publicado está en Law 2023; faltan los tiempos medios por tipo de trabajo y
  estación para replicarlo (están en el libro).
- **Calidad del generador de la maqueta** (xoshiro128** sembrado por mezcla de hashes): no corrimos TestU01; en producción se
  usa Philox, que sí tiene BigCrush publicado.
- Se pueden reanudar las búsquedas en un turno nuevo (el cupo es por turno) o subiendo `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`.

---

## 11. Fuentes (todas consultadas el 17-10-2026)

**Leídas directamente**
- Law, A. M. (2023). "Design and analysis of simulation experiments using three simple statistical formulas". *Proceedings of
  the 2023 Winter Simulation Conference*, pp. 1487–1500. https://informs-sim.org/wsc23papers/124.pdf
- Sargent, R. G. (2010). "Verification and validation of simulation models". *Proceedings of the 2010 Winter Simulation
  Conference*. https://www.informs-sim.org/wsc10papers/016.pdf
- Autodesk, FlexSim 2027, manual de referencia, Experimenter. https://help.autodesk.com/view/FLEXSIMIN/2027/ENU/?guid=FlexSim_User_Manual_reference_tools_experimenter_html
- Smith, Sturrock y Kelton, *Simio and Simulation: Modeling, Analysis, Applications* (libro en línea): índice
  https://textbook.simio.com/SASMAA/ · cap. 4 https://textbook.simio.com/SASMAA/ch-first-model.html · cap. 9
  https://textbook.simio.com/SASMAA/ch-advanced-modeling.html
- SimPy, guías "Shared Resources", "Time and Scheduling" y "Events". https://simpy.readthedocs.io/en/latest/topical_guides/resources.html ·
  https://simpy.readthedocs.io/en/latest/topical_guides/time_and_scheduling.html · https://simpy.readthedocs.io/en/latest/topical_guides/events.html
- salabim 26.0.0, índice del manual. https://www.salabim.org/manual/
- Salmon, Moraes, Dror y Shaw (2011). "Parallel random numbers: as easy as 1, 2, 3". SC11.
  https://www.thesalmons.org/john/random123/papers/random123sc11.pdf
- MDN, objeto `Math` (nota sobre precisión dependiente de la implementación). https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
- WebAssembly design, "Nondeterminism in WebAssembly". https://github.com/WebAssembly/design/blob/main/Nondeterminism.md
- SimOpt (testbed de optimización por simulación, MIT). https://github.com/simopt-admin/simopt
- SALib (análisis de sensibilidad en Python). https://salib.readthedocs.io/en/latest/
- JaamSim (simulación de eventos discretos de código abierto, Apache 2.0). https://jaamsim.com/
- Wikipedia (fórmulas de referencia): Kingman https://en.wikipedia.org/wiki/Kingman%27s_formula · M/M/c
  https://en.wikipedia.org/wiki/M/M/c_queue · Erlang B y C https://en.wikipedia.org/wiki/Erlang_(unit) · Jackson
  https://en.wikipedia.org/wiki/Jackson_network · MVA https://en.wikipedia.org/wiki/Mean_value_analysis · Little
  https://en.wikipedia.org/wiki/Little%27s_law
- Informes hermanos: `conocimiento/anden-simulador-2026-10/incumbentes.md` (AnyLogic, precios, Law vía buscador) y
  `frontera-ia.md` (medición de 40 réplicas en Workers).

**Intentadas sin éxito hoy:** http://www.columbia.edu/~ww2040/PlanningQueueingSimulations1989.pdf (404) ·
https://www.iro.umontreal.ca/~lecuyer/myftp/papers/streams00.pdf (bloqueo antibots) ·
https://anylogic.help/anylogic/experiments/optimization.html (403) ·
https://warwick.ac.uk/fac/soc/wbs/subjects/orms/research/autosimoa/ (404).

**Mediciones propias (17-10-2026, Node 22, Linux, 4 núcleos; semillas fijas, reproducibles):**
- `conocimiento/anden-simulador-2026-10/medicion-motor/motor_ref.js` (motor de referencia)
- `conocimiento/anden-simulador-2026-10/medicion-motor/validacion.js` → `resultados-validacion.json` (batería completa)
- `conocimiento/anden-simulador-2026-10/medicion-motor/rendimiento_generadores.js` (generadores contra callbacks; usa `des.js` del frente hermano)
