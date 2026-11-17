# Frente 3: simulación de procesos, análisis cuantitativo, process mining y gemelo digital de la organización

**Fecha de corte:** 17-11-2026. **Para:** evaluación de una plataforma propia de flujogramas con datos por bloque y simulación.
**Convención:** **HECHO** (fuente + fecha de consulta 17-11-2026 salvo que se indique otra), **ESTIMACIÓN** (con método),
**INFERENCIA** (razonamiento propio), **SIN DATO** (se buscó y no apareció). Ningún precio está inventado: cuando el proveedor no
publica, se dice y se cita el agregador con su nivel de confianza.

---

## 0. Resumen en cinco líneas

1. La simulación de eventos discretos es una tecnología madura (30+ años) pero **cara, de escritorio y de especialista**: las
   licencias comerciales van de ~USD 2.000 a ~USD 19.000 por puesto y por año, casi todas a cotizar, y la barrera real no es la
   plata sino **el modelado y los datos**.
2. Las herramientas de BPM (Bizagi, Signavio, iGrafx) traen simulación "liviana" sobre BPMN, pero es **un modo aparte** que se
   corre a mano, con resultados en tablas; nadie hace **análisis en vivo mientras se dibuja**.
3. El process mining se convirtió en "process intelligence" para agentes de IA (Celonis, SAP, Salesforce-Apromore). Es **enterprise
   puro**: Microsoft cobra USD 5.000 por tenant por mes de add-on; Celonis tiene una mediana de contrato de ~USD 12.800/año según
   un agregador de compras y cifras de seis dígitos en despliegues reales. **El segmento pyme con un CSV está casi vacío.**
4. Gartner creó en 2026 dos cuadrantes nuevos ("Process Intelligence Platforms", mayo; "Digital Twin of an Organization
   Platforms", julio): la categoría existe, la pelean los grandes, y todos venden arriba.
5. Se puede correr en el navegador, hoy, todo lo necesario para una v1: medimos un simulador mínimo en JavaScript a **~3,6
   millones de eventos por segundo** y validado contra Erlang C. El diferencial posible no es "simular", es **simular sin
   especialista, al dibujar, y explicarlo en el diagrama**.

---

## 1. Simulación: benchmark de herramientas

### 1.1 Tabla comparativa (herramientas comerciales de simulación general)

| Herramienta (dueño) | Qué simula | Cómo se usa | Curva | Visualización | Precio (fechado) | Debilidades |
|---|---|---|---|---|---|---|
| **Simul8** (Minitab desde dic-2024) | Eventos discretos de procesos de servicio, salud, manufactura | Escritorio + nube; bloques (entrada, cola, actividad, salida); importa **Visio, BPMN, XPDL y mapas de Minitab Workspace** | Media (la más baja de las "serias") | 2D animado, gráficos de resultados | Planes Project / Business / Twin **sin precio público** ("Talk to our team", simul8.com/pricing). Capterra: **USD 6.049 / 8.249 / 9.569 por usuario por año** | Cerrado, por puesto, Windows-céntrico; precio de consultor |
| **AnyLogic** (The AnyLogic Company) | Multimétodo: eventos discretos, agentes, dinámica de sistemas | Escritorio (Java) + AnyLogic Cloud para correr y compartir | Alta (Java, librerías) | 2D/3D muy rico | Professional a cotizar. Un agregador cita **~USD 18.990+ por puesto** (baja confianza). **PLE gratis**: solo aprendizaje, tope de 5 h de tiempo de modelo por corrida (salvo Process Modeling Library), 10 tipos de agente, 200 bloques por tipo | Hay que programar en Java para casos reales; caro |
| **FlexSim** (Autodesk anunció compra oct-2023) | Eventos discretos 3D, fábricas, depósitos, logística | Escritorio 3D, objetos arrastrables | Media-alta | 3D de alta calidad | Sin precio público, por distribuidor. Modo **Express gratis** limitado (tope de objetos, sin experimentador) | Foco en planta física; poca afinidad con procesos administrativos |
| **Arena** (Rockwell) | Eventos discretos generales (SIMAN) | Escritorio, diagramas de módulos | Alta | 2D/3D básico | Suscripción a cotizar; demo gratis con modelo limitado | Interfaz vieja; muy académica |
| **Simio** | Eventos discretos orientados a objetos + planificación (APS) | Escritorio, 3D | Alta | 3D | **Personal Edition gratis**; Design/Portal a cotizar | Enterprise; curva |
| **ProModel Process Simulator** | Eventos discretos **sobre Visio** (add-in) | Se dibuja en Visio y se simula | Media | Animación sobre el Visio | Capterra: "desde USD 4.500" (otra ficha dice USD 5/mes: contradictorio). INFORMS (encuesta vieja): USD 5.400 | Atado a Visio de escritorio |
| **Witness** (Lanner → Twinn by Royal HaskoningDHV) | Eventos discretos, manufactura y servicios | Escritorio | Alta | 2D/3D | Sin precio público | Producto absorbido por una consultora de ingeniería |
| **ExtendSim** (ANDRITZ/Imagine That) | Eventos discretos, continuo, flujo de tasas | Escritorio, bloques | Media-alta | 2D | **Único con precio público**: Pro **USD 1.995/año** individual o **USD 6.495 perpetuo**; CP USD 397/año; ExtendSim Cloud **USD 10.000/año** (4 instancias) | Interfaz anticuada |
| **JaamSim** (open source) | Eventos discretos con 3D | Escritorio Java, arrastrar y soltar | Media | 3D básico | **Gratis, Apache 2.0** (GitHub jaamsim; existe "JaamSim Pro" comercial) | Comunidad chica |

**Fuentes y estado de evidencia:**
- Simul8: planes y funciones = **HECHO** (https://www.simul8.com/pricing, consultado 17-11-2026: "Talk to our team about
  pricing"; plan Business incluye importar Visio/BPMN/Minitab y "auto-generating simulations from business data"; plan Twin
  incluye conexión SQL, API y ML). Precios USD 6.049/8.249/9.569 = **dato de agregador** (Capterra, búsqueda 17-11-2026), no del
  fabricante. Compra por Minitab el 05-12-2024 = **HECHO** (https://www.minitab.com/en-us/company/press-releases/minitab-simul8-acquisition/).
  Importación BPMN/XPDL/Visio = **HECHO** (https://support.minitab.com/en-us/simul8/help-and-how-to/importing/importing-bpmn/bpmn-simulation/).
- AnyLogic: límites de PLE = **HECHO** (https://anylogic.help/anylogic/ui/editions.html vía buscador; la página directa devolvió
  403). Precio Professional ~USD 18.990 = **baja confianza** (checkthat.ai). AnyLogic Cloud: invitados con tope de 1 min por
  corrida simple, 5 min optimización/animación, 30 min multi-corrida; cuenta gratis con 2 GB RAM; suscripción con 16 GB y API
  = **HECHO** (https://anylogic.help/9/cloud/cloud-options.html), precio de suscripción **SIN DATO**.
- FlexSim: Express y precios por distribuidor = **HECHO** (foro FlexSim en forums.autodesk.com). Autodesk firmó acuerdo de compra
  en oct-2023 = **HECHO** (https://www.arcweb.com/blog/autodesk-signs-definitive-agreement-acquire-flexsim); el foro ya está bajo
  dominio Autodesk → **INFERENCIA**: la compra cerró.
- Arena: suscripción sin precio público = **HECHO** (https://www.rockwellautomation.com/ko-kr/products/software/arena-simulation/buying-options.html).
- Simio: Personal gratis, Design "contact us" = **HECHO** (encuesta INFORMS, https://www.informs.org/ORMS-Today/OR-MS-Today-Software-Surveys/Simulation-Software-Survey/Page-8; fecha de la encuesta no reciente).
- ExtendSim 2026 = **HECHO** (https://extendsim.com/products/purchase/pricing, consultado 17-11-2026).
- Witness/Twinn = **HECHO** (https://www.haskoning.com/en/twinn/news/2023/twinn-witness-26).
- JaamSim Apache 2.0 = **HECHO** (https://github.com/jaamsim/jaamsim; Wikipedia).

### 1.2 Simulación dentro de suites de BPM/modelado

| Herramienta | Qué hace | Cómo | Precio | Lo que deja afuera |
|---|---|---|---|---|
| **Bizagi Modeler** | Simulación BPMN en **4 niveles**: (1) validación del flujo con probabilidades en compuertas; (2) análisis de tiempos con recursos infinitos; (3) análisis de recursos (espera, utilización, costos); (4) calendarios (turnos, feriados). Dice correr sobre BPSim | Modo "Simulation view" separado del modelado; se cargan parámetros por elemento y se ejecuta | Modeler gratis (modelo freemium conocido; **precio de planes pagos no verificado hoy**) | Resultados en tablas/Excel; no hay análisis instantáneo; no hay Monte Carlo de escenarios comparados lado a lado |
| **SAP Signavio Process Manager** | Escenarios con 4 pestañas (Costos, Duración, Frecuencia, Recursos); costo = costos fijos de actividad + recursos por carril con salario y horario | Se definen escenarios sin tocar el modelo | Dentro de la suite Signavio (enterprise, a cotizar) | Exportar costos a Excel figura como **pedido de mejora** en la base de SAP; comparación as-is/to-be se recomienda correr dos simulaciones |
| **iGrafx Process360 Live** | Modelado + simulación + mining | Web | Suscripción por usuario a cotizar; prueba de 30 días | Enterprise; Gartner lo ubica Niche Player (2025) |
| **Camunda / bpmn.io** | **Token simulation**: anima fichas recorriendo el BPMN para entender la lógica; **no** calcula tiempos, colas ni costos | Plugin de Camunda Modeler / módulo de bpmn-js | **Gratis, MIT** (bpmn-js-token-simulation 1.1.0, npm, actualizado 23-10-2026) | No es simulación cuantitativa; no soporta message flows |
| **Sparx Enterprise Architect** | Configura BPSim y ejecuta con motor add-in pago | Escritorio | Add-in pago | Herramienta de arquitecto |
| **BIMP** (Univ. de Tartu, motor QBP) | Simulación BPMN web: probabilidades, tiempos, recursos, histogramas | Se sube un BPMN y se completa un formulario | **Solo uso académico/prueba**; comercial requiere licencia del motor QBP | Interfaz mínima; sin animación |
| **Apromore Simulation** | Descubre un modelo de simulación desde el log "en un par de clics", compara escenarios what-if en dashboards, tiene copiloto de simulación | Web, dentro de la suite de mining | Enterprise a cotizar | Requiere log de eventos y plataforma enterprise |

Fuentes: Bizagi niveles = **HECHO** (https://help.bizagi.com/platform/en/simulation_levels.htm, https://help.bizagi.com/platform/en/level_4_example.htm).
Signavio = **HECHO** (https://learning.sap.com/learning-journeys/design-business-processes-with-sap-signavio-solutions/basic-simulation_fbe67690-eb99-4861-9773-2b05c0144e79;
pedido de mejora: https://userapps.support.sap.com/sap/support/knowledge/en/3161071). iGrafx = **HECHO** (https://www.igrafx.com/fr/process360-live-free-trial/; GetApp).
Token simulation = **HECHO** (https://github.com/bpmn-io/bpmn-js-token-simulation-plugin; registro npm consultado 17-11-2026; limitación de message flows: foro Camunda).
BIMP = **HECHO** (https://bimp.cs.ut.ee/products/bimp-online-simulator/). Apromore = **HECHO** (https://documentation.apromore.org/simulation/index.html).

### 1.3 Librerías abiertas y motores para el navegador

| Librería | Lenguaje | Licencia (verificada) | Para qué sirve | ¿Corre en navegador? |
|---|---|---|---|---|
| **SimPy** 4.1.2 (24-05-2026) | Python | MIT | Eventos discretos por procesos (generadores) | Sí vía Pyodide/JupyterLite (pesado: decenas de MB) |
| **salabim** 26.0.9 | Python | MIT | Eventos discretos con animación 2D/3D integrada | Igual que SimPy |
| **Ciw** 3.2.7 (05-12-2025) | Python | (PyPI no declara; **SIN DATO** verificado) | Redes de colas abiertas, clases de cliente, bloqueo | Igual que SimPy |
| **simjs** 2.0.3 | JavaScript | MIT | Inspirada en SimPy, procesos con generadores JS | **Sí, nativo** |
| **SIM.JS** | JavaScript | (proyecto viejo) | Eventos discretos con callbacks y generadores aleatorios | Sí, nativo |
| **sim (sim-rs)** 0.13.1 | Rust → WebAssembly | MIT o Apache-2.0 | Motor DEVS, compila a WASM, paquete npm | **Sí, WASM** |
| **JaamSim** | Java | Apache 2.0 | Simulador completo con 3D | No (escritorio) |
| **Simod + Prosimos** | Python | (Simod 5.0.1 en PyPI; licencia **no verificada**) | Descubre un modelo de simulación desde un CSV de eventos y lo calibra (TPE) | No (servidor) |
| **PM4Py** 2.7.23.12 | Python | **AGPL-3.0-or-later**; licencia comercial aparte de Process Intelligence Solutions (spin-off de Fraunhofer FIT) | Process mining completo, conformance, OCEL | No (servidor); el AGPL obliga a abrir el código si se ofrece como servicio |
| **bpmn-js-token-simulation** 1.1.0 | JavaScript | MIT | Animación de fichas en BPMN | Sí |

Fuentes: PyPI JSON API consultada 17-11-2026 (simpy, salabim, Ciw, pm4py); registro npm consultado 17-11-2026 (simjs,
sim-rs, bpmn-js-token-simulation); https://simod.readthedocs.io; https://github.com/process-intelligence-solutions/pm4py.

**Prueba propia (HECHO medido el 17-11-2026, Node.js 22.23.4 en el contenedor de esta sesión):** un simulador mínimo de eventos
discretos en JavaScript (cola de prioridad binaria, ~40 líneas) corrió un sistema M/M/10 con λ=9, μ=1 durante 2 millones de
clientes: **4 millones de eventos en 1,12 s (≈3,6 millones de eventos/s)**. Espera media simulada 0,689 contra 0,669 de Erlang C
(diferencia del 3 %, dentro de lo esperable para ρ=0,9 con una sola réplica). **INFERENCIA:** un proceso de pyme (decenas de
pasos, miles de casos por mes) se simula un año entero en milisegundos; 1.000 réplicas Monte Carlo entran en segundos dentro de un
Web Worker, sin servidor. El costo de servidor de la simulación puede ser cero.

### 1.4 ¿Por qué la simulación se usa poco en empresas?

- **HECHO (académico):** "la adopción sigue siendo limitada en la práctica por la calidad de datos" (paper de la Winter Simulation
  Conference 2025, https://www.informs-sim.org/wsc25papers/con252.pdf). Van der Aalst ("Business Process Simulation Revisited",
  Springer 2010, https://link.springer.com/doi/10.1007/978-3-642-15723-3_1) enumera tres problemas: el proceso se modela mal, no
  hay datos para parametrizar, y el lenguaje no captura comportamientos sutiles (personas que trabajan en tandas, que no están al
  100 %, que priorizan).
- **HECHO (académico):** el modelado manual fue el cuello de botella histórico; los enfoques que derivan el modelo desde el log
  "reducen la barrera de entrada" (https://ceur-ws.org/Vol-4032/paper-06.pdf). Un paper de 2026 ("Glitches in the Matrix",
  https://eprints.cs.univie.ac.at/8778) advierte errores sistemáticos al validar simulaciones derivadas de datos.
- **HECHO (práctica):** los interesados subestiman el mantenimiento y esperan que el modelo funcione "como un reporte, para siempre"
  (TechTarget, https://www.techtarget.com/searchbusinessanalytics/tip/Best-practices-for-using-simulation-models-in-business).
- **INFERENCIA (síntesis):** las cinco barreras, en orden de peso:
  1. **Modelar es un oficio**: distribuciones, warm-up, réplicas, intervalos de confianza. El analista de procesos no lo tiene.
  2. **Datos**: nadie sabe cuánto tarda cada paso ni su variabilidad; se inventan números o se abandona.
  3. **Herramienta separada**: el diagrama vive en Visio/Bizagi/Lucid y la simulación en otra herramienta; se modela dos veces.
  4. **Resultados ilegibles**: tablas de utilización e intervalos que el gerente no entiende ni cree.
  5. **Modelo de negocio de consultoría**: la herramienta se vende por puesto caro y se usa en un proyecto, no todos los días.

---

## 2. Métodos: qué pregunta responde cada uno, qué datos pide y si se calcula en vivo

Criterio "en vivo": se recalcula en < 50 ms en el navegador con cada cambio del diagrama (**ESTIMACIÓN** por orden de complejidad:
fórmulas cerradas O(n) sobre nodos; colas analíticas O(n·c); DES y Monte Carlo en segundos → en segundo plano, no "en vivo").

| Método | Pregunta de negocio | Datos mínimos | ¿En vivo al dibujar? |
|---|---|---|---|
| **Análisis estático de flujo** (camino esperado con probabilidades en compuertas, tasas de visita por nodo) | ¿Cuánto trabajo cae en cada paso? ¿Qué % de casos pasa por el reproceso? | Probabilidades por rama, tiempo por paso | **Sí**: sistema lineal de visitas (cadena de Markov absorbente) |
| **Ruta crítica / tiempo de ciclo sin colas** | ¿Cuánto tarda un caso si nadie espera? ¿Qué pasos están en el camino crítico? | Duración por paso, paralelismos (AND) | **Sí** (CPM en un grafo acíclico; con lazos, valor esperado vía visitas) |
| **Capacidad y utilización** (ρ = λ·t / c) | ¿Qué recurso está sobrecargado? ¿Cuántas personas hacen falta? | Demanda por período, tiempo por paso, personas por rol, horas disponibles | **Sí**: semáforo por bloque al instante |
| **Ley de Little** (L = λ·W) | ¿Cuántos casos hay en curso? ¿Cuánto capital/trabajo inmovilizado? | Dos de tres: llegadas, tiempo, WIP | **Sí** |
| **Colas M/M/c y Erlang C** | ¿Cuánto espera un caso en promedio? ¿Qué % espera más de X? Dotación para nivel de servicio (call center, mostrador, picking) | λ, tiempo medio, servidores | **Sí** (fórmula cerrada; validada arriba contra simulación) |
| **Aproximación de Kingman (G/G/1) y Allen-Cunneen (G/G/c)** | ¿Cuánto empeora la espera por la variabilidad? ("al 85 % de uso la cola explota") | Medias y coeficientes de variación de llegadas y servicio | **Sí**; es la que explica por qué no conviene cargar al 95 % |
| **Takt time** (tiempo disponible / demanda) | ¿A qué ritmo hay que producir? ¿Qué paso no llega al ritmo? | Demanda, horas disponibles, tiempo por paso | **Sí** |
| **OEE** (disponibilidad × rendimiento × calidad) | ¿Cuánta capacidad se pierde en paradas, lentitud y defectos? | Tiempo planificado, paradas, velocidad ideal, piezas buenas | **Sí**, pero pide datos de operación reales |
| **ABC y Time-Driven ABC** | ¿Cuánto cuesta realmente cada caso, cliente o producto? ¿Cuánta capacidad pagada no se usa? | Costo del recurso / capacidad práctica (tasa por minuto) × minutos por actividad | **Sí**: TDABC son dos parámetros por recurso; costo por bloque y por caso al instante |
| **Simulación de eventos discretos** | Todo lo anterior con colas reales, prioridades, turnos, lotes, reprocesos, interacciones entre recursos compartidos | Distribuciones (o mín/moda/máx), calendarios, reglas | **No en vivo**: segundos en un Web Worker; se dispara al pausar la edición |
| **Simulación con calendarios y turnos** | ¿Qué pasa con el backlog el lunes? ¿Conviene un turno tarde? | Calendarios por recurso, feriados | En segundo plano |
| **Reprocesos y probabilidades en compuertas** | ¿Cuánto cuesta el retrabajo? ¿Cuánto mejora si baja del 15 % al 5 %? | % por rama | **Sí** (analítico) y en DES |
| **Monte Carlo** | ¿Cuál es el rango (P10–P90) de tiempo y costo? ¿Qué probabilidad hay de cumplir el SLA? | Distribuciones o tres puntos (mín/probable/máx) | En segundo plano (segundos) |
| **Análisis de sensibilidad (tornado)** | ¿Qué parámetro mueve más el resultado? ¿Dónde vale la pena medir mejor? | Rangos por parámetro | **Sí** si se hace sobre el modelo analítico; en segundo plano sobre DES |
| **Optimización de dotación** (búsqueda entera sobre personas por rol) | ¿Cuál es la dotación más barata que cumple el SLA? | Costo por persona, SLA, límites | **Casi**: búsqueda sobre el modelo analítico en < 1 s; refinar con DES |
| **Programación lineal / entera** | Asignación óptima de personas a tareas, mezcla de productos | Coeficientes, restricciones | Sí para tamaños pyme (solvers en WASM, p. ej. HiGHS — **no verificado hoy**, mencionar como candidato) |
| **Metaheurísticas (genéticos, OptQuest)** | Configuraciones complejas sobre simulación (layout, reglas) | Modelo DES + función objetivo | No: minutos a horas; OptQuest (OptTek) es el estándar embebido en AnyLogic, Simio y Arena |

Fuentes: TDABC = **HECHO** (Kaplan y Anderson, HBR nov-2004, págs. 131-138; resumen en https://maaw.info/ArticleSummaries/ArtSumKaplanAnderson2004.htm;
https://hbswk.hbs.edu/item/rethinking-activity-based-costing): dos parámetros (costo por unidad de capacidad y tiempo por
transacción) y hace visible la capacidad ociosa (ejemplo del artículo: 83 % de la capacidad práctica usada). OptQuest embebido en
AnyLogic, Simio y Arena = **HECHO** (https://anylogic.help/anylogic/experiments/optimization.html; https://simio.com/software/OptQuest.php;
https://www.opttek.com/optquest/). Fórmulas de colas (Little, Erlang C, Kingman, Allen-Cunneen), takt y OEE = **HECHO** (teoría
estándar de investigación operativa y lean; no dependen de fecha).

**INFERENCIA clave:** el 80 % de las preguntas que un gerente de pyme haría ("¿dónde se traba?", "¿cuánta gente necesito?",
"¿cuánto cuesta cada pedido?", "¿qué pasa si entra 30 % más?") se responden **con fórmulas cerradas en milisegundos**, sin correr
una simulación. Ninguna herramienta del benchmark lo explota: todas tratan la simulación como un modo aparte con botón "Run".
Ahí está el diferencial técnico más barato del frente.

---

## 3. BPSim (WfMC): qué es, quién lo usa, ¿sirve?

- **HECHO:** BPSim es un estándar de la Workflow Management Coalition para "la parametrización e intercambio de datos de análisis de
  procesos" sobre BPMN (y XPDL). La versión vigente es la **2.0, de diciembre de 2016**, publicada bajo CC BY 3.0, con esquema XML y
  guía para implementadores (https://bpsim.org/; https://www.BPSim.org/specifications/2.0/WFMC-BPSWG-2016-01.pdf).
- **HECHO:** lo impulsaron Trisotech y Lanner (Denis Gagné, de Trisotech, presidió el comité) (https://lanner.com/insights/blog/bpsim-a-standard-for-exchanging-simulation-analysis-data.html).
  Lo implementan Sparx Enterprise Architect (configurador + motor add-in pago), Lanner L-Sim Server y Bizagi declara que su
  simulación corre según BPSim (https://help.bizagi.com/platform/en/simulation_in_bizagi.htm).
- **HECHO:** no hay versión nueva desde 2016 y bpsim.org no publica lista de implementadores.
- **INFERENCIA:** BPSim **sirve como formato de intercambio y como checklist de parámetros** (distribuciones, calendarios, costos,
  probabilidades, prioridades, escenarios), y conviene **exportar e importar BPSim** para compatibilidad con Bizagi/Sparx y como
  argumento de "sin encierro". **No sirve como modelo interno**: está pensado para BPMN puro, no cubre datos de negocio ricos
  (sistemas, volúmenes por canal, OEE, costeo TDABC) ni resultados, y está estancado. Recomendación: modelo propio en JSON, con
  exportación BPSim/BPMN como puerta de salida.

---

## 4. Process mining y task mining

### 4.1 Qué es y en qué se convirtió

Process mining reconstruye el proceso real desde el **log de eventos** (id de caso, actividad, marca de tiempo, y opcionalmente
recurso y atributos) de ERP/CRM/sistemas. Tres usos: **descubrimiento** (cómo es), **conformance checking** (en qué se aparta del
diagrama "como debería ser") y **mejora** (cuellos, retrabajo, variantes). Task mining hace lo mismo desde el escritorio del
empleado (clics, aplicaciones), no desde los logs de sistemas.

- **HECHO:** Gartner renombró la categoría: el **Magic Quadrant for Process Intelligence Platforms** se publicó el **05-05-2026**
  (13 proveedores) y reemplaza al de Process Mining Platforms. Líderes anunciados por los propios proveedores: Celonis (más
  arriba en capacidad de ejecución y más a la derecha en visión), Pega, ARIS y SAP; QPR Visionary
  (https://www.gartner.com/en/documents/7810417; https://www.celonis.com/fr/news/press/celonis-recognized-as-a-leader-in-the-2026-gartner-magic-quadrant-for-process-intelligence;
  https://www.qpr.com/news/qpr-software-recognized-visionary-fourth-consecutive-year-2026-gartner-magic-quadrant-process-intelligence-platforms).
- **HECHO:** en 2025 (todavía "Process Mining Platforms", 16 proveedores, 8 líderes) eran líderes, entre otros, Celonis, ARIS, Pega,
  IBM y Apromore; Microsoft Challenger; iGrafx Niche (https://www.processexcellencenetwork.com/process-mining/articles/16-process-mining-vendors-gartner-magic-quadrant).

### 4.2 Proveedores

| Proveedor | Posición / novedad fechada | Precio (con calidad del dato) |
|---|---|---|
| **Celonis** | Líder. **AgentC** (oct-2024): herramientas para que agentes de IA (Copilot Studio, watsonx Orchestrate, Bedrock Agents) consuman el **Process Intelligence Graph**. **Data Core** GA en Celosphere 2025 (nov-2025): integración sin copia con data lakes (Databricks vía Delta Sharing, Microsoft Fabric). **Orchestration Engine** coordina agentes, personas y sistemas. "Living digital twin". Servidor MCP para process intelligence. Celosphere 2026: 1 al 3-12-2026 en Múnich | No publica. Vendr (agregador de compras): **mediana USD 12.775/año, rango USD 6.000–130.277** (vía buscador; la página directa dio 403). Otras fuentes: USD 60–100 k/año mid-market y 400 k+/año enterprise (**baja confianza**). Plan gratis (ex Snap) **cerrado a usuarios nuevos según foro de mayo-2026** |
| **SAP Signavio Process Intelligence** | Líder en ambos cuadrantes 2026 (PI y DTO). Suite modelado + mining + simulación | No publica; estimaciones de terceros USD 40–150 k/año (**baja confianza**); suele ir en contratos SAP |
| **Microsoft Power Automate Process Mining** (ex Minit) | Challenger 2025 | **HECHO oficial:** Premium USD 15/usuario/mes (incluye 50 MB de datos de mining); **add-on Process Mining USD 5.000 por tenant por mes**, pago anual, con 100 GB (https://www.microsoft.com/en-us/power-platform/products/power-automate/pricing) |
| **UiPath Process Mining** | Ligado a su RPA/agentes | Sin precio público |
| **IBM Process Mining** | Líder 2025 | Terceros: desde USD 4.250/mes SaaS o USD 24–72 k/año (**baja confianza**) |
| **Apromore** | Líder 2025. **Salesforce anunció su compra (oct-2025)** para Agentforce; cierre esperado en su Q4 FY2026; fuentes difieren sobre si ya cerró | Community Edition **gratis, LGPL-3.0** (código ApromoreCore); Academic gratis; Enterprise a cotizar (https://apromore.org/editions-and-pricing) |
| **Disco (Fluxicon)** | El clásico para analistas, escritorio, muy simple | Sin precio público; gratis para universidades socias (https://www.fluxicon.com/academic/) |
| **ProM** | Plataforma académica de plugins (TU/e) | Gratis, open source |
| **PM4Py** | Librería Python de referencia (Fraunhofer FIT → Process Intelligence Solutions) | AGPL-3.0; licencia comercial cerrada aparte (precio **SIN DATO**) |
| **ProcessMind** | Lanzó plataforma "asequible y de autoservicio para pymes" | Captura de su página de precios (may-2026, xpay.sh): **Essential USD 71 y Standard USD 142 por usuario/mes**; Capterra muestra cifras más altas (USD 139–199) → verificar |
| **mindzie, QPR, Mehrwerk (MPM)** | Mid-market; Mehrwerk especializado en SAP/Qlik | Sin precio público verificado |
| **Skan.ai** (task mining + "contexto para agentes") | **Serie C de USD 63 M el 12-08-2026** (Cathay Innovation y Dell Technologies Capital), ~USD 117–120 M totales; dice crecer 300 % interanual | Enterprise |
| **KYP.ai** | Captura continua de escritorio, ROI, agentes; Serie A de USD 18,7 M (fecha **SIN DATO**) | Enterprise |
| **Soroco (Scout)** | Captura de interacciones digitales y variantes | Enterprise; sin novedades de financiamiento encontradas |

Fuentes adicionales: Celonis AgentC/Data Core = **HECHO** (https://www.celonis.com/news/article/celosphere-2025-everything-you-need-to-know-from-process-intelligence-news-to-ai-innovation;
https://siliconangle.com/2025/11/04/celonis-feeds-ai-agents-process-intelligence-data-enhance-operational-context/); fechas
Celosphere 2026 = **HECHO** (https://www.celonis.com/celosphere); plan gratis = **HECHO de foro, no oficial**
(https://community.celonis.com/general-product-q-a-2/celonis-free-plan-academic-alliance-no-longer-accessible-for-new-users-is-this-discontinued-6430).
Salesforce-Apromore = **HECHO** (https://www.salesforceben.com/salesforce-acquires-apromore-to-boost-agentforces-process-mining-abilities/;
https://www.constellationr.com/insights/news/salesforces-acquisition-apromore-highlights-how-process-intelligence-agentic-ai).
Skan.ai = **HECHO** (https://siliconangle.com/?p=812722; https://thenextweb.com/news/skan-ai-63m-series-c-workplace-observation-enterprise-agents).
Valuación Celonis: USD 13.000 M en la ronda de 2022; secundario estimado USD 8.500 M a mayo-2026 (TrueUp/Caplight) = **dato de
agregador**; ingresos 2025 **SIN DATO** confiable.

### 4.3 Object-centric process mining y OCEL 2.0

- **HECHO:** OCEL 2.0 (RWTH Aachen, versión oct-2023, publicado en arXiv mar-2024, CC BY 4.0) define logs donde un evento toca
  **varios objetos** (pedido, ítem, factura, envío), con relaciones objeto-objeto, calificadores y atributos que cambian en el
  tiempo; formatos SQLite, XML y JSON con esquemas de validación (https://arxiv.org/abs/2403.01975; https://www.ocel-standard.org).
- **INFERENCIA:** para logística esto es central: un camión lleva muchos pedidos, un pedido se parte en varios bultos; el log clásico
  "un caso = un id" distorsiona (convergencia/divergencia). Una herramienta nueva debería **modelar objetos de negocio desde el día
  uno** (el bloque mueve "pedidos", "bultos", "camiones") aunque el mining OCEL llegue después. Celonis ya empuja su "Process
  Intelligence Graph" y "60+ objetos y eventos predefinidos" en esa dirección.

### 4.4 Conformance checking

- **HECHO (teoría establecida):** se reproduce el log contra el modelo (token replay o alineamientos) y se mide fitness (qué tanto
  del log explica el modelo), precisión y desvíos por actividad. PM4Py, ProM, Apromore y Celonis lo implementan.
- **INFERENCIA:** es el puente natural entre "el diagrama que dibujó el gerente" y "lo que pasa de verdad". Para una pyme alcanza
  una versión simple: **pintar sobre el propio diagrama** qué % de casos siguió cada flecha, qué pasos se saltearon, qué pasos
  aparecen en el log y no en el dibujo, y el tiempo real vs. el cargado en el bloque.

### 4.5 ¿Qué tan caro y complejo es? ¿Hay espacio para "process mining liviano"?

- **HECHO:** el piso enterprise visible es Microsoft a USD 60.000/año de add-on (más USD 180/usuario/año de Premium); Celonis
  tiene mediana de contrato ~USD 12.800/año según Vendr pero despliegues típicos muy superiores según otras fuentes; la mayoría de
  los proveedores no publica precio.
- **HECHO (académico):** la extracción y limpieza del log es el trabajo pesado (WSC 2025, citado arriba).
- **ESTIMACIÓN (método: precios publicados × costo de implementación reportado):** un proyecto de mining en una empresa mediana
  cuesta entre USD 50.000 y varios cientos de miles el primer año con consultoría; inaccesible para una pyme argentina.
- **INFERENCIA:** **sí hay espacio** para "mining liviano" con estas condiciones:
  1. Entrada = **CSV o planilla** (Excel/Google Sheets) con tres columnas mínimas (caso, actividad, fecha-hora) y mapeo asistido por
     IA de columnas raras; plantillas para exportes típicos (Tango, Bejerman, MercadoLibre, sistemas de WMS/TMS chicos).
  2. Procesamiento **en el navegador** (los datos no salen de la máquina: argumento de privacidad y costo cero de servidor). Un log
     de 100.000 eventos entra cómodo en memoria (**ESTIMACIÓN**: ~100 bytes por evento → ~10 MB).
  3. Resultado **sobre el mismo diagrama editable**, no en un dashboard aparte, y de ahí a la simulación con los parámetros ya
     calibrados (tiempos reales, probabilidades reales en compuertas).
  4. Precio de pyme (decenas de USD por mes, no miles). ProcessMind ya apunta ahí (USD 71–142/usuario/mes), lo que confirma la
     demanda pero también que el hueco no está del todo vacío.

---

## 5. Gemelo digital de la organización (DTO)

- **HECHO:** Gartner define el DTO por cuatro elementos: el modelo operativo de la organización, datos de y sobre sus componentes,
  alineación uno a uno entre el gemelo y la organización, y la capacidad de monitorearla (texto truncado en la fuente;
  https://www.gartner.com/technology/media-products/reprints/softwareag/1-4SLGQDW.html).
- **HECHO:** Gartner publicó el **primer Magic Quadrant for Digital Twin of an Organization Platforms el 27-07-2026** (18
  proveedores; Critical Capabilities el 05-08-2026). Líderes anunciados por los proveedores: Celonis, SAP (Signavio), GBTEC, Mavim y
  ARIS; Interfacing figura como líder solo en un post de LinkedIn (https://www.celonis.com/news/press/celonis-named-a-leader-in-2026-gartner-magic-quadrant-for-digital-twin-of-an-organization-platforms;
  https://news.sap.com/japan/2026/08/0825_sap-leader-gartner-magic-quadrant-digital-twin-organization-platforms/;
  https://www.gbtec.com/whitepaper/2026-gartner-magic-quadrant-for-digital-twin-of-an-organization-platform/).
- **HECHO:** Simul8 vende su plan más caro como "Twin" (datos vivos SQL/PostgreSQL, API, ML para ruteo y tiempos) y Celonis mostró
  un "living digital twin" sobre Data Core en Celosphere 2025.
- **INFERENCIA — qué es en la práctica un "living process model":** un diagrama que (1) tiene los datos de negocio en cada bloque,
  (2) se recalibra solo con los datos reales (log, planilla, API), (3) avisa cuando la realidad se aparta del modelo (conformance y
  deriva de tiempos), y (4) responde "¿qué pasa si…?" con simulación sobre esa base calibrada, incluyendo **predicción a semanas**
  (backlog del lunes, cuándo se rompe el SLA si la demanda sigue creciendo). Los grandes lo venden como plataforma de datos para
  corporaciones; **nadie lo vende como "Waze de tus procesos" para una pyme**.
- **INFERENCIA:** el DTO es hoy una etiqueta de analistas para lo que hacían ARIS/Signavio/Mavim (modelado de arquitectura) más
  mining. Tiene riesgo de "idea theater". Lo útil es la promesa concreta: modelo + datos + simulación + alerta.

---

## 6. Datos de mercado

| Mercado | Fuente | Cifra | Calidad |
|---|---|---|---|
| Software de simulación (amplio: CAE, ingeniería, etc.) | MarketsandMarkets (ago-2025) | USD 19.950 M (2024) → **USD 36.220 M (2030)**, CAGR 10,4 % | **HECHO** de la nota de prensa (https://www.globenewswire.com/news-release/2025/08/18/3135129/0/en/Simulation-Software-Market-Surges-to-36-22-billion-by-2030-Dominated-by-Dassault-Systemes-France-Ansys-US-Autodesk-US.html). Ojo: dominado por Dassault, Ansys, Autodesk (ingeniería física), **no** es el mercado de simulación de procesos |
| Simulación (otras) | Mordor / Knowledge Sourcing | USD 13.580 M a 16.661 M (2025); CAGR ~13 % | Agregadores; definiciones distintas |
| Process mining software | Grand View Research | USD 1.400 M (2024) → USD 3.200 M (2026) → **USD 21.900 M (2030)**, CAGR 59,4 % | Nota pública (https://www.grandviewresearch.com/industry-analysis/process-mining-software-market-report) |
| Process mining | Global Industry Analysts | USD 3.100 M (2024) → USD 23.300 M (2030), CAGR 40,3 % | Resumen público |
| Process mining | TechSci | USD 2.310 M (2024) → USD 19.210 M (2030), CAGR 42,3 % | Resumen público |
| Process mining software | Market Research Future | USD 770 M (2025), CAGR 17,4 % | Resumen público (el más conservador) |
| Simulación de **procesos de negocio / eventos discretos** (el segmento que importa) | — | **SIN DATO** público confiable | — |

**ESTIMACIÓN (método bottom-up grueso, a validar):** el nicho de simulación de eventos discretos "de procesos" (Simul8, AnyLogic,
FlexSim, Arena, Simio, ExtendSim, Witness, ProModel) son empresas de decenas a pocos cientos de empleados; si suman del orden de
decenas de miles de puestos pagos a USD 2.000–19.000 por año, el segmento queda en el orden de **USD 0,5 a 1,5 mil millones anuales**
(muy lejos de los USD 36.000 M del mercado "simulación" que incluye ingeniería física). No usar este número para decidir capital sin
una fuente mejor.

**INFERENCIA sobre los informes:** las cifras de process mining divergen 4× en el tamaño base y 3× en el crecimiento; todas coinciden
en crecimiento alto y en que el gasto está concentrado en grandes empresas. Ninguna mide el segmento pyme.

**Precios de referencia consolidados (para posicionar):**

| Referencia | USD por año | Fuente / calidad |
|---|---|---|
| ExtendSim CP (simulación básica) | 397 | Oficial |
| ExtendSim Pro individual | 1.995 (o 6.495 perpetuo) | Oficial |
| Simul8 Project / Business / Twin | 6.049 / 8.249 / 9.569 por usuario | Capterra (agregador) |
| ProModel Process Simulator | ~4.500 (pago único o anual, no claro) | Capterra (contradictorio) |
| AnyLogic Professional | ~18.990 por puesto | Agregador, baja confianza |
| ExtendSim Cloud | 10.000 (4 instancias) | Oficial |
| ProcessMind Essential/Standard | 852 / 1.704 por usuario | Captura de su página (may-2026) |
| Celonis (mediana de contrato) | 12.775 | Vendr vía buscador |
| Power Automate Process Mining add-on | 60.000 por tenant + 180 por usuario Premium | **Oficial** |

---

## 7. Cierre

### (a) Diseño recomendado del "motor de análisis", en capas

Principio rector (**INFERENCIA**): **"el diagrama ya sabe"**. Cada capa reutiliza los datos cargados en los bloques; ninguna pide
modelar dos veces. Todo corre en el cliente (Web Worker + WASM si hace falta) para que el costo de servidor sea casi cero y escale
sin rehacer la app (alineado con la regla del fundador del 06-10-2026).

| Capa | Qué calcula | Cuándo corre | Datos que pide | Versión |
|---|---|---|---|---|
| **0. Validación estructural** | Flujos sin salida, compuertas sin probabilidad que sume 100 %, bloques sin responsable, lazos infinitos | En cada edición | Solo el dibujo | **v1** |
| **1. Análisis estático instantáneo** | Tasas de visita por bloque (Markov absorbente con reprocesos), tiempo de ciclo esperado sin colas, ruta crítica, costo por caso (TDABC: tasa por minuto × minutos), carga por rol (horas/mes) y **utilización ρ por recurso con semáforo** | En cada edición (< 50 ms) | Demanda, probabilidades, tiempo medio por bloque, personas y costo por rol | **v1** (el diferencial) |
| **2. Colas analíticas** | Espera por bloque (Erlang C / Allen-Cunneen con coeficiente de variación), WIP por Little, % de casos sobre SLA, dotación mínima para SLA | En cada edición | + variabilidad (baja/media/alta en vez de distribuciones) | **v1** |
| **3. Simulación de eventos discretos** | Colas con recursos compartidos, prioridades, turnos y calendarios, lotes (camión que sale lleno o a las 18 h), reprocesos, tiempo de backlog; animación | En segundo plano al pausar la edición, o botón | + calendarios, reglas de lote/prioridad, distribuciones de 3 puntos | **v1.5** (motor propio JS/TS o sim-rs en WASM; validar contra la capa 2) |
| **4. Monte Carlo y escenarios** | Réplicas, P10/P50/P90, probabilidad de cumplir SLA, escenarios guardados ("+30 % demanda", "un picker más", "turno tarde") comparados lado a lado, tornado de sensibilidad | Segundo plano (segundos) | Rangos por parámetro | **v1.5** (escenarios simples con capa 1-2 ya en v1) |
| **5. Optimización** | Dotación mínima por rol que cumple SLA al menor costo (búsqueda entera sobre capas 2-3); luego reglas y turnos con metaheurística | Botón | Objetivo y restricciones | **v2** (dotación óptima analítica puede adelantarse a v1 por lo barata) |
| **6. Process mining y conformance** | Importar CSV/planilla de eventos → descubrir mapa → **calibrar los bloques** (tiempos y probabilidades reales) → pintar desvíos sobre el diagrama dibujado; luego OCEL para pedidos/bultos/camiones | Al importar | Log de eventos | **v2** (descubrimiento + calibración); **v3** OCEL y conexión continua (el "living model") |
| **7. IA como capa transversal** | Pasar de texto/foto/planilla a diagrama con datos; explicar resultados en lenguaje llano ("el cuello está en Control porque…"); proponer escenarios | Siempre | — | v1 para explicar; v2 para generar |

**Notas de implementación (INFERENCIA salvo lo marcado):**
- Motor de cálculo propio pequeño (fórmulas cerradas + DES) es **lo correcto** aquí: son 300–1.500 líneas, el dominio es estable y
  las librerías JS existentes (simjs, SIM.JS) son chicas y viejas. Cumple la regla 10 del repositorio porque se verificó el
  ecosistema: no hay un motor DES de procesos de negocio, mantenido, para navegador, con licencia permisiva; **sim-rs** (MIT/Apache,
  WASM) es la alternativa a evaluar si el motor propio no rinde. Benchmark medido: 3,6 M eventos/s en JS ingenuo (**HECHO**).
- Validar el motor DES siempre contra las fórmulas de la capa 2 (test automático: M/M/c debe dar Erlang C ± tolerancia).
- No usar PM4Py dentro de un SaaS cerrado sin licencia comercial (AGPL). Para mining en el navegador, implementar el
  descubrimiento simple (grafo directamente-seguido con filtros de frecuencia) propio; es suficiente para pymes.
- Exportar/importar **BPMN 2.0 + BPSim** como puerta de salida; el modelo interno es propio (objetos de negocio, datos ricos).

### (b) Visualizaciones que hacen entendible la simulación para no especialistas

1. **Semáforo de carga en cada bloque** (verde < 70 %, ámbar 70–85 %, rojo > 85 %) que cambia **mientras se edita**: el usuario
   aprende la teoría de colas sin saberlo.
2. **Mapa de calor sobre el diagrama**: grosor de flecha = volumen; color del bloque = espera o costo; un toggle cambia la "capa"
   (tiempo, costo, carga, retrabajo).
3. **Tokens animados** (fichas que recorren el diagrama y se apilan donde hay cola), con velocidad ajustable y un reloj de
   "lunes 9:00 … viernes 18:00". Es lo que convence en la reunión. bpmn.io demostró que la animación de fichas se entiende; falta
   ligarla a tiempos y colas reales.
4. **"Pila" visible en la cola**: un contador que crece al lado del bloque y una mini-curva de backlog a lo largo de la semana.
5. **Comparación de escenarios lado a lado** (as-is vs. to-be) con el mismo diagrama y **diferencias resaltadas** (bloque que dejó de
   ser cuello, minutos y pesos ahorrados por mes).
6. **Tarjeta de resultado en lenguaje llano**: "Hoy un pedido tarda 3,2 días; 2,1 son espera en Control. Con una persona más en
   Control baja a 1,4 días y cuesta $X por mes."
7. **Abanico de incertidumbre** (P10–P90) en vez de un número único, y "probabilidad de cumplir el SLA: 78 %".
8. **Tornado de sensibilidad**: "lo que más mueve el resultado es el tiempo de Control y el % de reproceso: medí eso primero".
9. **Gantt/calendario de recursos** por persona o rol (quién está ocioso, quién saturado, por hora del día).
10. **Superposición real vs. dibujado** (conformance): flechas fantasma donde el proceso real se desvía, con % de casos.
11. **Costo por caso desglosado** como cascada (waterfall) por bloque: hace tangible el TDABC.
12. **Modo presentación**: una vista limpia para proyectar al dueño, con la historia "antes → cuello → propuesta → resultado".

### (c) Las 10 oportunidades no resueltas (INFERENCIA, salvo donde se cita)

1. **Análisis en vivo al dibujar.** Ninguna herramienta del benchmark recalcula carga, espera y costo con cada cambio del
   diagrama; todas tienen un modo "simulación" separado (Bizagi, Signavio, Simul8). Las fórmulas existen y corren en milisegundos.
2. **Simulación sin especialista.** Reemplazar distribuciones por "tiempo típico + variabilidad baja/media/alta" y warm-up/réplicas
   por defaults automáticos, con validación interna contra fórmulas. Ataca la barrera número uno documentada (modelado + datos).
3. **De planilla/CSV a modelo calibrado para pymes.** El mining serio arranca en USD 60.000/año (Microsoft) y el plan gratis de
   Celonis está cerrado a nuevos (foro, may-2026). Un importador de planillas que calibre los bloques llena un hueco real.
4. **Un solo modelo para documentar, simular, costear y controlar.** Hoy se dibuja en Visio/Lucid, se simula en Simul8, se costea
   en Excel y se mina en Celonis. Unificar evita modelar cuatro veces.
5. **Costeo TDABC nativo por bloque.** Kaplan y Anderson mostraron que alcanzan dos parámetros por recurso; ninguna herramienta de
   flujogramas muestra "cuánto cuesta este paso y cuánta capacidad pagada sobra" en el diagrama.
6. **Objetos de negocio de logística (OCEL) desde el modelado.** Pedidos que se agrupan en camiones y bultos que se parten: el modelo
   "un caso" distorsiona y el estándar OCEL 2.0 ya existe. Un modelador que entienda lotes, consolidación y ventanas de despacho
   tiene ventaja en el dominio que el fundador conoce.
7. **Explicación del resultado por IA, en el diagrama.** La simulación falla por resultados ilegibles; un LLM que narra "por qué" con
   las cifras del motor (no inventadas) es nuevo en esta categoría.
8. **Precio y despliegue de pyme latinoamericana.** Todo el benchmark es por puesto en dólares de primer mundo o a cotizar; no hay
   oferta en español, con plantillas locales (exportes de sistemas argentinos, feriados, convenios) a decenas de USD por mes.
9. **Living model liviano: alerta de deriva.** Con la planilla mensual, avisar "Control pasó de 12 a 19 minutos promedio y vas a
   romper el SLA en 3 semanas". Los DTO de Gartner lo prometen para corporaciones (cuadrante de jul-2026); nadie para pymes.
10. **Biblioteca de procesos con benchmarks.** Plantillas de procesos típicos (picking, devoluciones, alta de cliente, cobranza) con
    rangos de tiempos de referencia para arrancar sin datos propios y reemplazarlos después. Requiere construir el dato (no
    existe una fuente pública consolidada; **SIN DATO**).

**Riesgos del frente (para el abogado del diablo):**
- La simulación sola no se vende: es una función que el usuario valora pero rara vez paga por separado (**INFERENCIA** del modelo de
  negocio de los incumbentes: pocos clientes, caros, consultoría).
- Los grandes de BPM pueden agregar análisis en vivo cuando quieran; la defensa es el foco pyme/latam, el dominio logístico y la
  UX, no la tecnología.
- La calidad del resultado depende del dato que carga el usuario; un número equivocado "con decimales" destruye la confianza.
  Mitigación: mostrar rangos, marcar datos estimados vs. medidos, y calibrar con planillas reales.
- Licencias: AGPL de PM4Py y uso comercial restringido de BIMP/AnyLogic PLE impiden usarlos dentro del producto.

---

## Anexo: fuentes principales consultadas (17-11-2026)

- Simul8: https://www.simul8.com/pricing · https://www.minitab.com/en-us/company/press-releases/minitab-simul8-acquisition/ · https://support.minitab.com/en-us/simul8/help-and-how-to/importing/importing-bpmn/bpmn-simulation/ · https://www.capterra.com/p/114609/SIMUL8-Professional/pricing/
- AnyLogic: https://anylogic.help/anylogic/ui/editions.html · https://anylogic.help/9/cloud/cloud-options.html · https://www.anylogic.com/purchase/ · https://checkthat.ai/brands/anylogic/pricing
- FlexSim: https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-feature-limitations-by-license-type/ta-p/13530769 · https://www.arcweb.com/blog/autodesk-signs-definitive-agreement-acquire-flexsim
- Arena: https://www.rockwellautomation.com/ko-kr/products/software/arena-simulation/buying-options.html
- Simio / ProModel: https://www.informs.org/ORMS-Today/OR-MS-Today-Software-Surveys/Simulation-Software-Survey/Page-8 · https://www.capterra.com/p/182836/Process-Simulator/
- ExtendSim: https://extendsim.com/products/purchase/pricing
- Witness/Twinn: https://www.haskoning.com/en/twinn/news/2023/twinn-witness-26
- JaamSim: https://github.com/jaamsim/jaamsim
- Bizagi: https://help.bizagi.com/platform/en/simulation_levels.htm
- Signavio: https://learning.sap.com/learning-journeys/design-business-processes-with-sap-signavio-solutions/basic-simulation_fbe67690-eb99-4861-9773-2b05c0144e79 · https://userapps.support.sap.com/sap/support/knowledge/en/3161071
- iGrafx: https://www.igrafx.com/fr/process360-live-free-trial/
- bpmn.io token simulation: https://github.com/bpmn-io/bpmn-js-token-simulation-plugin · https://bpmn.io/blog/posts/2023-the-case-for-bpmn-token-simulation
- BIMP: https://bimp.cs.ut.ee/products/bimp-online-simulator/
- BPSim: https://bpsim.org/ · https://www.BPSim.org/specifications/2.0/WFMC-BPSWG-2016-01.pdf · https://lanner.com/insights/blog/bpsim-a-standard-for-exchanging-simulation-analysis-data.html
- Librerías: PyPI JSON (simpy, salabim, Ciw, pm4py) · npm registry (simjs, sim-rs, bpmn-js-token-simulation) · https://simod.readthedocs.io · https://github.com/process-intelligence-solutions/pm4py
- OptQuest: https://www.opttek.com/optquest/ · https://anylogic.help/anylogic/experiments/optimization.html · https://simio.com/software/OptQuest.php
- TDABC: https://maaw.info/ArticleSummaries/ArtSumKaplanAnderson2004.htm · https://hbswk.hbs.edu/item/rethinking-activity-based-costing
- Barreras de la simulación: https://www.informs-sim.org/wsc25papers/con252.pdf · https://link.springer.com/doi/10.1007/978-3-642-15723-3_1 · https://ceur-ws.org/Vol-4032/paper-06.pdf · https://eprints.cs.univie.ac.at/8778
- Celonis: https://www.celonis.com/news/article/celosphere-2025-everything-you-need-to-know-from-process-intelligence-news-to-ai-innovation · https://siliconangle.com/2025/11/04/celonis-feeds-ai-agents-process-intelligence-data-enhance-operational-context/ · https://www.celonis.com/celosphere · https://www.vendr.com/marketplace/celonis · https://community.celonis.com/general-product-q-a-2/celonis-free-plan-academic-alliance-no-longer-accessible-for-new-users-is-this-discontinued-6430
- Gartner PI 2026: https://www.gartner.com/en/documents/7810417 · https://www.celonis.com/fr/news/press/celonis-recognized-as-a-leader-in-the-2026-gartner-magic-quadrant-for-process-intelligence · https://www.qpr.com/news/qpr-software-recognized-visionary-fourth-consecutive-year-2026-gartner-magic-quadrant-process-intelligence-platforms
- Gartner PM 2025: https://www.processexcellencenetwork.com/process-mining/articles/16-process-mining-vendors-gartner-magic-quadrant
- Gartner DTO 2026: https://www.gartner.com/en/documents/8166629 · https://www.celonis.com/news/press/celonis-named-a-leader-in-2026-gartner-magic-quadrant-for-digital-twin-of-an-organization-platforms · https://news.sap.com/japan/2026/08/0825_sap-leader-gartner-magic-quadrant-digital-twin-organization-platforms/
- Microsoft: https://www.microsoft.com/en-us/power-platform/products/power-automate/pricing
- Apromore/Salesforce: https://apromore.org/editions-and-pricing · https://www.salesforceben.com/salesforce-acquires-apromore-to-boost-agentforces-process-mining-abilities/ · https://documentation.apromore.org/simulation/index.html
- Disco: https://www.fluxicon.com/academic/
- ProcessMind: https://www.processexcellencenetwork.com/process-mining/news/processmind-launches-affordable-self-service-process-mining-platform-for-smbs · https://www.xpay.sh/saas-pricing/processmind/
- Skan.ai: https://siliconangle.com/?p=812722 · https://thenextweb.com/news/skan-ai-63m-series-c-workplace-observation-enterprise-agents
- OCEL 2.0: https://arxiv.org/abs/2403.01975
- Mercado: https://www.globenewswire.com/news-release/2025/08/18/3135129/0/en/Simulation-Software-Market-Surges-to-36-22-billion-by-2030-Dominated-by-Dassault-Systemes-France-Ansys-US-Autodesk-US.html · https://www.grandviewresearch.com/industry-analysis/process-mining-software-market-report · https://www.techsciresearch.com/report/process-mining-market/30636.html
- Benchmark propio: script en /tmp/claude-0/-home-user-Inversiones-Startups/4b39a2d6-e546-5267-8f73-7e6f4cfd5e33/scratchpad/proc/bench/des.js
