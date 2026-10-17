# Andén · Incumbentes de la simulación logística y sus límites (17-10-2026)

> Frente de investigación: **incumbentes y sus límites**, para diseñar el simulador logístico más profundo del mercado.
> Fecha de consulta de todas las fuentes: **17-10-2026**. Datos obtenidos con buscador y lectura directa cuando el sitio lo
> permitió (G2, Capterra, TrustRadius y varias páginas de proveedores devolvieron 403: lo que viene de ahí son extractos del
> buscador y se marca así). **Todo dato que decida capital se re-verifica en la fuente primaria.**
> Etiquetas: **HECHO** (fuente y fecha) · **ESTIMACIÓN** (con método) · **HIPÓTESIS** (a validar) · **INFERENCIA** (razonamiento propio).

---

## 0. Resumen (lo que cambia el diseño de Andén)

1. **La IA de los incumbentes es un copiloto pegado arriba de lenguajes de 20 años.** Siemens genera SimTalk (Copilot desde la
   versión 2504; código validado por sintaxis en la 2606, jun-2026), AnyLogic promete "modelos simples desde texto" (asistente
   presentado como "coming very soon" en mayo de 2026 y ya listado en su página de funciones), Simio abrió un **servidor MCP** el
   23-09-2026 para que Claude Code, Codex o Copilot manejen sus modelos, Rockwell muestra Emulate3D + Copilot en VS Code. **FlexSim
   no tiene asistente de lenguaje natural propio** que hayamos encontrado (17-10-2026). HECHO. Ninguno diseñó el *formato del
   modelo* para que lo escriba y lo verifique una IA: la IA escribe código para un motor pensado para humanos. INFERENCIA.
2. **La estadística por defecto es floja y nadie lo resuelve con la interfaz.** Averill Law (WSC 2023) muestra que el intervalo
   de confianza calculado sobre una sola corrida dio **7,2% de cobertura real contra 95% prometido**, y escribe que ese método
   "es una opción en uno o más productos comerciales". En FlexSim las réplicas son fijas y el intervalo se "inspecciona
   visualmente" en un gráfico. HECHO. Una herramienta que no deje mentir (réplicas, calentamiento, precisión objetivo,
   percentiles y comparación pareada por defecto, con semáforo de confianza) es diferencial y barata de construir. INFERENCIA.
3. **El 3D fotorrealista se tercerizó en NVIDIA Omniverse** (AnyLogic 8.9.2, Simio 19, Visual Components FactoryLens, Emulate3D
   Factory Test): escritorio Windows + placa RTX. HECHO. Nadie ofrece 3D lindo y fluido **en cualquier navegador o teléfono**,
   compartible con un enlace, con el motor corriendo en el dispositivo del que mira. realvirtual WEB hace el visor 3D en el
   navegador, pero sin motor de eventos discretos. HECHO/INFERENCIA.
4. **Entrar cuesta caro y lo gratis es diminuto.** FlexSim ~USD 6.000/año (revendedor); ExtendSim Pro USD 4.995–9.995;
   SIMUL8 desde USD 6.049/usuario/año (Capterra); Plant Simulation X Essentials ~USD 419/usuario/mes con tope de 500 objetos
   (G2); anyLogistix USD 21.800/año (lista oficial). Gratis: FlexSim Express 30 objetos, Plant Simulation estudiante 80 objetos,
   Arena estudiante 150 entidades, AnyLogic PLE 10 tipos de agente y corridas de 1 minuto en su nube gratis. HECHO.
5. **Ola de consolidación y un huérfano grande.** Autodesk compró FlexSim (anuncio oct-2023; licencias y acceso pasan a cuentas
   Autodesk desde la 2027), Minitab compró SIMUL8 (dic-2024), ANDRITZ compró ExtendSim (2023) y Stat::Fit (ene-2026), Aegis
   compró Simio (ene-2026), Lanner/WITNESS es de Haskoning. **Applied Materials discontinúa AutoMod: no se vende ni se soporta
   después del 31-12-2026** (fuente: un revendedor competidor; verificar). HECHO. Los incumbentes se van hacia suites
   corporativas; la punta "independiente, abierta, barata, IA nativa" queda libre. INFERENCIA.
6. **Lo que más tiempo come no es simular, es cargar datos y armar el modelo**: datos de entrada 10–40% del proyecto (Skoogh y
   Johansson 2009), construcción del modelo 40–60% (Banks 2010, citado por UNAM 2026). HECHO. ExtendSim compró un ajustador de
   distribuciones en 2026 justamente por eso. Andén tiene que tragar planillas y exportaciones de WMS y salir con
   distribuciones, curvas horarias y supuestos visibles. INFERENCIA.
7. **Ingeniería de software para modelos casi no existe.** Git llegó a AnyLogic (8.9, ago-2024), Emulate3D (2025) y JaamSim.
   Solo Emulate3D tiene un "Test Runner" con pruebas automáticas, y es para probar PLC. HECHO. Nadie hace "integración continua
   de operaciones": cada cambio del modelo corre sus pruebas de KPI y muestra un diff legible. INFERENCIA.
8. **Hubs de paquetería y última milla no tienen herramienta de mercado**: BEUMER y Vanderlande simulan y emulan sus hubs con
   herramientas propias; los generalistas traen bloques (cintas, AGV, racks) pero no plantillas de clasificación por destino,
   horarios de corte, oleadas e inducción. HECHO (lo de BEUMER/Vanderlande) / INFERENCIA (la ausencia de plantillas: no
   encontramos ninguna, lo que no prueba que no exista).

---

## 1. Mapa rápido del mercado (17-10-2026)

| Producto | Dueño hoy | Paradigma central | Fuerte en | Última versión que encontramos | Etiqueta |
|---|---|---|---|---|---|
| **FlexSim** | Autodesk (anuncio de compra oct-2023) | Eventos discretos con objetos 3D + Process Flow | Almacenes, manejo de materiales, salud (FlexSim HC) | 2026 (26.0.0) disponible; documentación "FlexSim 2027" publicada en help.autodesk.com; 2025 LTS = 25.0.12 | HECHO |
| **AnyLogic** | The AnyLogic Company | Multimétodo: agentes + dinámica de sistemas + eventos discretos | Cadena de suministro, peatones, tránsito, ferrocarril, manejo de materiales | 8.9.9 (jun-2026); AnyLogic 9 en navegador como "technology preview" | HECHO |
| **Plant Simulation** (Tecnomatix) | Siemens | Eventos discretos orientado a objetos, lenguaje SimTalk | Plantas automotrices, líneas, AGV, transportadores | 2606 (jun-2026); "Plant Simulation X" en la nube | HECHO |
| **Simio** | Aegis Software (compra cerrada ene-2026) | Objetos inteligentes; eventos discretos + agentes + continuo | Gemelo digital + planificación y programación (APS) | Simio 20 (sprints 289–294 en 2026; MCP desde 20.294) | HECHO |
| **Arena** | Rockwell Automation | Eventos discretos (lenguaje SIMAN, conocimiento general) | Procesos, enseñanza universitaria | 16.20.11 (parche de seguridad, nov-2025) | HECHO |
| **AutoMod** | Applied Materials | Eventos discretos con 3D a escala, muy usado en manejo de materiales | AS/RS, cintas, semiconductores | Discontinuado después del 31-12-2026 | HECHO (fuente secundaria) |
| **Emulate3D / Demo3D** | Rockwell Automation | Física 3D + emulación conectada a PLC reales | Comisionado virtual, pruebas de control | Emulate3D 2026 (V19, mar-2026) | HECHO |
| **Visual Components** | KUKA | 3D de layout + robots + programación fuera de línea | Celdas robotizadas, layout de planta | 5.0 (12-03-2026) | HECHO |
| **SIMUL8** | Minitab (dic-2024) | Eventos discretos de procesos, liviano | Servicios, salud, procesos de negocio | Planes Project / Business / Twin + Decision Cloud | HECHO |
| **ExtendSim** | ANDRITZ (2023) | Eventos discretos + tasa discreta (flujos) + confiabilidad | Procesos continuos y mixtos, confiabilidad | 10.1.x (la última nota que vimos es de mar-2024) | HECHO |
| **WITNESS Horizon** | Lanner, parte de Haskoning | Eventos discretos + ejecución en la nube (WITNESS.io) | Manufactura, puertos/GNL | Horizon 24–25 (fuentes de 2021–2022) | HECHO (desactualizado) |

---

## 2. Ficha por incumbente

### 2.1 FlexSim (Autodesk)

| Dimensión | Qué encontramos | Etiqueta |
|---|---|---|
| Paradigma | Eventos discretos con objetos 3D arrastrables y **Process Flow** (lógica por diagramas); emulación de PLC | HECHO (flexsim.com) |
| Biblioteca logística | Almacenamiento, muelles, cintas, AGV, personal, AS/RS según el blog de Autodesk; FlexSim HC para salud; complemento FloWorks para fluidos | HECHO (blog Autodesk; KB FlexSim) |
| Novedades | 2025: objeto **Container** y **Task Sequence Queue**; 2026: **submodelos** (sesión del Summit 2026); integración con AutoCAD, Inventor, Factory Design Utilities y Vault (oct-2025) | HECHO |
| 3D | Su fuerte histórico: 3D nativo, el mejor "a primera vista" entre los generalistas según la reputación de mercado | INFERENCIA (no medimos calidad 3D) |
| Experimentación | Experimenter con réplicas **fijas** definidas por el usuario y escenarios; intervalos de confianza "inspeccionados visualmente" en los gráficos de medidas; OptQuest como **complemento pago**; corridas distribuidas en otras PC o en AWS mediante su Webserver (desde 2018) | HECHO (foros Autodesk, KB) |
| IA | Herramienta de aprendizaje por refuerzo + integración con Python + alianza con Microsoft Bonsai (2022). **Sin asistente de lenguaje natural propio encontrado** al 17-10-2026. Hay trabajos de terceros: UNAM 2026 generó con ChatGPT el código del layout en FlexSim desde planos | HECHO |
| Nube | No hay edición de modelado en la nube; el Webserver sirve para correr y distribuir | HECHO / INFERENCIA |
| Precio | Sin lista pública; revendedores citan **~USD 6.000 por año** sin soporte ni capacitación; soporte USD 195 o 595 por usuario por año | HECHO (secundario, rfp.wiki citando revendedores) |
| Gratis | Express: **30 objetos**, 35 actividades de Process Flow, sin árbol ni consola de scripts | HECHO (KB FlexSim) |
| Curva | FlexScript y C++ para lo avanzado; "lleva mucho tiempo y esfuerzo aprender" (reseñas Capterra, vía buscador) | HECHO (extracto) |
| Quejas | Curva de aprendizaje en scripting; costo sin transparencia; requisitos de hardware en modelos grandes; integraciones ERP/WMS débiles | HECHO (extractos de reseñas y rfp.wiki) |
| Señal comercial | Su distribuidor japonés (Zenetech) dice que FlexSim fue n.º 1 mundial en ventas anuales 2023–2025 y lo vende para cumplir la ley japonesa de eficiencia logística de 2026 | HECHO (afirmación de un distribuidor, no verificada) |
| Riesgo de rumbo | Desde la versión 2027 el acceso y la licencia van por cuentas Autodesk; los flujos con Factory Design Utilities piden versiones anuales alineadas de FlexSim, FDU, Inventor y AutoCAD | HECHO (KB FlexSim; Verdantix vía buscador) |

**Lectura:** FlexSim es el referente a superar en "se ve y se entiende en 3D". Su debilidad estructural es que cada vez más es
una pieza del ecosistema CAD de Autodesk (manufactura grande), con lógica en FlexScript y sin IA conversacional. INFERENCIA.

### 2.2 AnyLogic

| Dimensión | Qué encontramos | Etiqueta |
|---|---|---|
| Paradigma | **Multimétodo**: agentes, dinámica de sistemas y eventos discretos en un mismo modelo; Java por debajo | HECHO (anylogic.com) |
| Bibliotecas | Manejo de materiales (con robots de 6 ejes desde 8.9.2; SeizeRobot/ReleaseRobot en 8.9.5), Tránsito vial, Peatones, Ferrocarril, Fluidos, Modelado de procesos | HECHO |
| Novedades 8.9.x | Git y formato de archivo multiarchivo (8.9, ago-2024); conexión directa a Oracle, PostgreSQL, MySQL (8.9.1); perfilador de rendimiento (8.9.4); API de diseño en Python que dibuja en el lienzo (8.9.7, dic-2025); importa glTF, OBJ, FBX | HECHO |
| 3D | 3D propio con sombras; **conector oficial a NVIDIA Omniverse** para fotorrealismo | HECHO |
| Experimentación | Monte Carlo, sensibilidad, variación de parámetros, optimización; en la nube: corridas en paralelo, tableros, exportar a Excel | HECHO |
| IA | **Asistente integrado**: responde, explica modelos, corrige errores y "crea modelos simples a partir de texto" (página de funciones, 17-10-2026); en mayo de 2026 lo presentaban como "coming very soon" para eventos discretos | HECHO |
| Nube | **AnyLogic Online**: armar, correr y compartir modelos en el navegador; AnyLogic 9 es el editor web, en "technology preview" con funciones limitadas. Nube privada Lite (16 núcleos), Pro (64), Enterprise (sin tope) | HECHO |
| Precio | Professional sin lista pública; terceros citan **~USD 18.990+ por puesto** (la bitácora del 28-09 tenía USD 12.390–18.990); anyLogistix **USD 21.800/año** (lista oficial); capacitación USD 1.500–1.750 por persona | HECHO (precio Pro: secundario) |
| Gratis | PLE: 10 tipos de agente, 200 agentes por tipo, 5 h de tiempo simulado en bibliotecas industriales, sin uso comercial; nube gratis: corridas de 1 minuto, 5 min animadas, 30 min multicorrida, 32 MB de salida | HECHO (checkthat.ai, jul-2026) |
| Curva | "No es para el usuario básico ni para quien no programa"; "empinada si no sabés Java" | HECHO (Capterra, extractos) |
| Quejas | Java; documentación que dice qué hacer pero no cómo; lentitud y cuelgues en modelos grandes; editor de código pobre | HECHO (Capterra, Software Advice, GetApp, extractos) |

**Lectura:** AnyLogic es el más potente en *amplitud* (multimétodo, GIS, peatones) y el que más avanzó hacia la web y la IA.
Su talón de Aquiles es Java y el precio. Es el competidor más probable de lo que Andén quiere ser. INFERENCIA.

### 2.3 Siemens Plant Simulation (Tecnomatix)

| Dimensión | Qué encontramos | Etiqueta |
|---|---|---|
| Paradigma | Eventos discretos orientado a objetos; lógica en **SimTalk** | HECHO |
| Biblioteca | Transportadores, cintas en cualquier dirección, AGV con frenado y curvas realistas, robots pick-and-place por cinemática, portadores multi-pieza (2606) | HECHO (blog Siemens, 25-06-2026) |
| Análisis | Experiment Manager, módulo de **algoritmos genéticos**, **analizador automático de cuellos de botella**, diagramas Sankey (también para AGV libres en 2606), asistente de redes neuronales | HECHO (folleto y blog Siemens) |
| IA | **Copilot** desde 2504, inicialmente solo para usuarios de Plant Simulation X en la nube; en 2606 escribe y corrige SimTalk con sugerencias validadas por sintaxis, con agentes LangGraph y opción **"trae tu propio LLM"** local. Prometido: resúmenes de modelo, cuellos de botella, ayuda para experimentos | HECHO |
| Nube | Plant Simulation X (cloud-enabled) | HECHO |
| Precio | **Plant Simulation X Essentials ~USD 418,95 por usuario por mes**, hasta 500 objetos (G2); en 2020 Foundation costaba USD 250/mes en la tienda de Siemens | HECHO (G2 vía buscador; Siemens 2020) |
| Gratis | Licencia de estudiante: **80 objetos**, Windows, sin uso comercial | HECHO |
| Quejas | Interfaz mejorable (G2, 4,4/5 con 113 reseñas); los algoritmos genéticos con muchos parámetros se vuelven muy lentos (paper 2019) | HECHO (extractos) |

**Lectura:** el más maduro para plantas y el que más invierte en IA "seria" (agentes, LLM local para datos sensibles). Está
atado al mundo Siemens y a Windows. INFERENCIA.

### 2.4 Simio (Aegis Software)

| Dimensión | Qué encontramos | Etiqueta |
|---|---|---|
| Paradigma | Objetos inteligentes sin programar; mezcla eventos discretos, agentes y continuo | HECHO (agregadores) |
| Diferencial | Gemelo digital + **planificación y programación con riesgo** (RPS); Simio Portal para publicar planes y tableros en la web (requiere SQL Server aparte) | HECHO |
| IA | Redes neuronales embebidas desde 2021 (14.230); **soporte MCP integrado desde 20.294 (anuncio 23-09-2026)**: un LLM externo puede generar o refinar lógica, explicar el modelo, depurar, correr y analizar experimentos y preguntar "qué órdenes salieron tarde y qué tienen en común" | HECHO |
| 3D | Vista 3D en un paso; símbolos de 3D Warehouse; integración con NVIDIA Omniverse en Simio 19 | HECHO |
| Experimentación | Experimentos y OptQuest integrado como complemento | HECHO (agregadores) |
| Precio | Solo cotización (Design, Team, Enterprise, Portal, RPS); copia académica personal **USD 25** con tope de pasos; prueba de 30 días | HECHO |
| Alcance educativo | En el programa de más de **500 universidades** | HECHO (comunicado de Aegis) |
| Quejas | Curva empinada para lo avanzado, documentación y sitio pobres, lentitud en modelos muy grandes, poco soporte para Mac, caro | HECHO (rfp.wiki, resumen de reseñas) |

**Lectura:** Simio es el primero en abrirse a agentes externos vía MCP. Valida la tesis de Andén ("la IA maneja el
simulador"), pero lo hace sobre un producto de escritorio caro y orientado a fábricas. INFERENCIA.

### 2.5 Arena (Rockwell)

| Dimensión | Qué encontramos | Etiqueta |
|---|---|---|
| Paradigma | Eventos discretos por diagramas de bloques; motor SIMAN | Conocimiento general (no re-verificado hoy) |
| Estado | Mantenimiento: la última novedad pública es un **parche de seguridad** (CVE-2025-11918, versión 16.20.11, nov-2025) | HECHO |
| 3D y plataforma | Solo Windows; la animación se hace "aparte del modelo" | HECHO (reseñas Capterra) |
| IA y nube | No encontramos nada | HECHO (ausencia en la búsqueda) |
| Precio | Cotización; versión estudiante **limitada a 150 entidades** | HECHO |
| Quejas | Interfaz compleja, curva y costo altos, inicialización lenta, errores y cuelgues; Capterra 4,1/5 con 28 reseñas, muchas de 2018–2021 | HECHO (extractos) |

**Lectura:** fuerte en cátedras por inercia de libros de texto; producto sin evolución visible. Las cátedras de Latinoamérica
que hoy usan Arena o FlexSim Express son el puente natural de Andén Aula. INFERENCIA.

### 2.6 AutoMod (Applied Materials)

- **HECHO (fuente secundaria):** según PMC (consultora que vende alternativas, post del 28-04-2026), Applied Materials
  discontinúa AutoMod: no se venden licencias ni hay soporte, actualizaciones ni mantenimiento **después del 31-12-2026**.
  No encontramos el anuncio primario de Applied Materials: **verificar**.
- **HECHO:** Emulate3D tiene "exportar a AutoMod" en todas sus ediciones de diseño (tabla de ediciones de SimPlan), señal de
  cuánto lo usaba la industria del manejo de materiales.
- **INFERENCIA:** quedan modeladores de AS/RS y cintas buscando dónde mudarse en 2027. Es un público pequeño y experto, pero
  también es un canal de difusión: un "importador" o una guía de migración sería contenido de búsqueda muy específico.

### 2.7 Emulate3D / Demo3D (Rockwell)

| Dimensión | Qué encontramos | Etiqueta |
|---|---|---|
| Paradigma | **Modelos 3D con física** (modos volumétrico, planar y lineal) conectados a PLC reales o emulados | HECHO (tabla de ediciones) |
| Ediciones | Layout3D, Demo3D (presentación), Sim3D (simulación con experimentos), Emulate3D Controls Testing y Ultimate | HECHO |
| 2025 | Render con **Unreal**, instancias sin GPU, **Git nativo**, **Test Runner** (escenarios, pruebas con aserciones, tableros, corre después de cada commit), Fault Framework (fallas simuladas), importación de **FMU** (Simulink, Ansys, Modelica), metaheurísticas para optimizar, pruebas unitarias con NUnit | HECHO (PDF Rockwell) |
| 2026 | V19 (mar-2026): Assets & Sections, contenedores, más conectividad, **Model Advisors**, catálogos por industria | HECHO (hoja de ruta; sin detalle) |
| IA | Hannover Messe 2026: Emulate3D + Copilot en VS Code + FactoryTalk Design Studio: comandos en lenguaje llano para armar y revisar modelos, del modelo validado al controlador probado | HECHO (nota de prensa, 27-04-2026) |
| Nube / 3D | Factory Test usa NVIDIA Omniverse y OpenUSD para escala de fábrica | HECHO |
| Precio | Sin lista; taller para cuentas nuevas USD 299 con licencia por 3 semanas; un listado de terceros "desde 850 €" sin aclarar período | HECHO (secundario) |

**Lectura:** Emulate3D es el que mejor trata al modelo como software (Git, pruebas, fallas). Lo hace para ingenieros de control,
no para el jefe de depósito. Copiar esa disciplina para KPIs de operación es una idea robada con orgullo. INFERENCIA.

### 2.8 Visual Components (KUKA)

- **HECHO:** 5.0 salió el 12-03-2026: API de Python 3.12 con async, NumPy/Pandas/SciPy por pip, nuevo controlador de
  movimiento, conectores a robots Denso, Techman, MELFA, Yamaha y PLC LS Electric, cliente MQTT, licencias por cuenta.
  **Sin IA** en las notas. FactoryLens (con bibliotecas de NVIDIA Omniverse) para mostrar simulaciones a clientes; productos
  gratuitos para ver simulaciones en el teléfono, en la web o en realidad virtual.
- **HECHO:** sin precio público (Capterra muestra un valor de relleno de 0,01 €).
- **Lectura:** es robótica y layout de celdas; para logística de depósito es complemento, no rival directo. INFERENCIA.

### 2.9 SIMUL8 (Minitab)

- **HECHO:** planes Project (escritorio y nube, Excel y Google Sheets), Business (compartir con interesados, control de
  versiones con auditoría, importar Visio, BPMN y Minitab Workspace, **simulaciones generadas desde datos del negocio**) y
  Twin (conexión en vivo a bases de datos, API completa, **aprendizaje automático para decisiones de ruteo y tiempos**,
  procesamiento paralelo). OptQuest se compra aparte. Precio: "hablá con el equipo"; Capterra lista **desde USD 6.049 por
  usuario por año**.
- **Lectura:** el más cercano a "procesos de negocio", fuerte en salud y servicios; liviano en 3D y en logística física.
  INFERENCIA.

### 2.10 ExtendSim (ANDRITZ)

- **HECHO:** eventos discretos, **tasa discreta** (flujos a granel) y confiabilidad. Precios públicos: Pro individual
  **USD 4.995** (hasta 100 ciclos de confiabilidad), USD 7.495 (1.000), USD 9.995 (ilimitado); flotante USD 8.790 por
  usuario; mantenimiento USD 899/año. ANDRITZ lo compró en 2023 y en **enero de 2026 compró Stat::Fit** (ajuste de
  distribuciones) para integrarlo.
- **Lectura:** el único con lista de precios pública: buena referencia de "piso" del mercado profesional. La compra de
  Stat::Fit confirma que la carga de datos es un dolor que se paga. INFERENCIA.

### 2.11 WITNESS Horizon (Lanner / Haskoning)

- **HECHO:** Auto Connect (armar y conectar el flujo en un paso, Horizon 25), WITNESS.io para correr lotes grandes de
  experimentos en la nube ("de horas a minutos"), Witness Apps, simulador de logística de GNL. Precio a pedido, sin prueba
  gratis; Capterra 4,4/5 con 38 reseñas. Fuentes de 2021–2022: **información posiblemente desactualizada**.

### 2.12 Especialistas de almacén, intralogística y paquetería

| Quién | Qué hace | Para quién | Etiqueta |
|---|---|---|---|
| **Dematic iQ Virtual** (2019) | Emulación y simulación conectada a su software de ejecución de almacén (WES); 3D en monitor o en casco de realidad virtual | Clientes de Dematic, antes de instalar | HECHO |
| **Kardex StoreX Calculator** (ene-2025) | Web: cargás volumen de órdenes, capacidad y mano de obra → informe de un sistema AutoStore (robots, operarios, superficie, costo, retorno) | Prospectos de AutoStore | HECHO (afirmación del proveedor) |
| **AutoStore CubeVerse** | Plataforma que une diseño, simulación, operación y diagnóstico | Ecosistema AutoStore | HECHO |
| **BEUMER CEP Software Suite** | Simulación y emulación de hubs "de puerta a puerta"; qué pasa si cambia la mezcla de paquetes, las rutas o los horarios de llegada y salida | Hubs de paquetería que compran BEUMER | HECHO |
| **Vanderlande** | Biblioteca 3D propia para modelos de simulación y emulación | Interno | HECHO (2018) |
| **Optricity OptiSlot DC** | Slotting con escenarios qué pasa si y retorno financiero, vía socios; precio no publicado | Centros de distribución | HECHO |
| **Optilogic Cosmic Frog** | Diseño de red de suministro: optimización + simulación + riesgo, cuenta gratis a pedido, IA "Ada" | Planeamiento de red, no operación interna | HECHO |
| **NVIDIA Mega + KION + Accenture** (CES, ene-2025) | Gemelo de almacén en Omniverse desde CAD, video, lidar; entrena robots con Isaac; el WMS de KION asigna misiones a robots virtuales | Grandes automatizaciones | HECHO |
| **MetAI** (Taiwán) | Plano 2D del almacén → gemelo 3D con IA, sobre Omniverse/Isaac; USD 4 M de capital semilla con NVIDIA (ene-2025) | Almacenes inteligentes, foco EE.UU. | HECHO |

**Lectura:** las mejores herramientas de almacén son **herramientas de venta de un fabricante** (te simulan *su* equipo) o
servicios de consultoría. No hay un simulador neutral de depósito y hub para la pyme que compara manual vs. automatización de
cualquier marca. INFERENCIA.

### 2.13 Abiertos y nuevos

- **JaamSim** (Apache 2.0, versión 2026-01 de feb-2026): 3D, arrastrar y soltar, objetos en Java, entradas versionables con
  Git; un estudio de 2021 lo considera alternativa real a los comerciales en producción y logística; la edición Pro (paga)
  suma transporte, flujos a granel y mapas. HECHO.
- **realvirtual WEB**: visor 3D en el navegador (Three.js/TypeScript), el modelo se descarga una vez y corre en el dispositivo
  del que mira; AGPL gratis o 1.920 €/desarrollador/año; para exportar hace falta la versión Professional sobre Unity (1.250 €).
  HECHO. Es precedente técnico del 3D en navegador, no un simulador logístico de eventos discretos. INFERENCIA.
- **Text2Sim MCP** y **anylogicPLE-mcp** (ya registrados en la bitácora del 28-09-2026): la comunidad ya conecta LLM con SimPy y
  con AnyLogic. HECHO.

---

## 3. La IA de los incumbentes, lado a lado (17-10-2026)

| Producto | Qué hace la IA hoy | Qué promete | Arquitectura | Etiqueta |
|---|---|---|---|---|
| Plant Simulation | Copilot: responde con documentación, escribe y corrige SimTalk validado por sintaxis | Resumir modelos, detectar cuellos, guiar experimentos | LangGraph + LLM de Siemens o propio (local) + base vectorial | HECHO |
| AnyLogic | Asistente: responde, explica, corrige errores, modelos simples desde texto | Modelos de eventos discretos completos desde una descripción | No publicada | HECHO |
| Simio | Servidor MCP: un agente externo explica, genera lógica, corre y analiza experimentos y planes | Interfaz "en lenguaje natural" para planificadores | MCP abierto (Claude Code, Codex, Copilot CLI, OpenCode) + redes neuronales embebidas | HECHO |
| Emulate3D | Con Copilot de VS Code y FactoryTalk Design Studio, armar y revisar modelos y llegar al controlador | Model Advisors (2026) | Ecosistema Microsoft/Rockwell | HECHO |
| SIMUL8 | Aprendizaje automático para ruteo y tiempos (plan Twin); simulaciones generadas desde datos | — | No publicada | HECHO |
| FlexSim | Aprendizaje por refuerzo vía Python (2022) | No encontramos hoja de ruta de IA conversacional | — | HECHO |
| Visual Components, ExtendSim, WITNESS, Arena | Nada encontrado | — | — | HECHO (ausencia) |

**Lo que dice la investigación (2025–2026) sobre modelos generados por IA:**

- UNAM 2026 (Romero-Guerrero y otros): ChatGPT generó el código del layout en FlexSim desde planos en PDF, con "reducción
  significativa del tiempo", pero **se equivoca con cotas superpuestas y en la ubicación de operarios**; recomiendan verificar
  siempre en 3D y advierten que depender de la IA reduce el entendimiento del sistema. HECHO.
- DEVS 2026 (arXiv 2603.03784): proponen generar el modelo en etapas y **validarlo comparando las trazas de eventos contra
  restricciones derivadas de la especificación**, porque no hay una única respuesta correcta. HECHO.
- SIMCODE (2025, red ns-3, no logística): el mejor modelo llegó a ~30,6% de ejecución correcta; la mitad de las fallas eran de
  API. HECHO (según resúmenes secundarios). Sirve como advertencia: **generar código para APIs grandes falla mucho**.
- **INFERENCIA:** la IA que escribe código para FlexScript, SimTalk o Java hereda la fragilidad de esos lenguajes. La IA que
  llena un **formato declarativo con esquema** (bloques, recursos, reglas, distribuciones) puede ser validada por un compilador
  y por pruebas de trazas antes de que el usuario vea un número.

---

## 4. Precios y acceso (lo que se paga para empezar)

| Producto | Entrada paga | Gratis / educativo | Etiqueta |
|---|---|---|---|
| FlexSim | ~USD 6.000/año (revendedor) + soporte USD 195–595/año | Express 30 objetos | HECHO (precio secundario) |
| AnyLogic | Pro ~USD 18.990+ por puesto (terceros); anyLogistix USD 21.800/año (oficial) | PLE limitada; nube gratis con corridas de 1 min | HECHO (Pro secundario) |
| Plant Simulation | X Essentials ~USD 419/usuario/mes, ≤500 objetos (G2) | Estudiante 80 objetos | HECHO (secundario) |
| Simio | Cotización | Copia académica USD 25; becas para laboratorios | HECHO |
| Arena | Cotización | Estudiante 150 entidades | HECHO |
| SIMUL8 | Desde USD 6.049/usuario/año (Capterra) | Versión gratis listada en Capterra | HECHO (secundario) |
| ExtendSim | Pro USD 4.995–9.995 + USD 899/año | — | HECHO (oficial) |
| Emulate3D | Cotización; taller USD 299 con 3 semanas de licencia | — | HECHO |
| Visual Components, WITNESS | Cotización | Visores gratuitos (VC) | HECHO |
| JaamSim | Gratis (Pro pago) | Gratis | HECHO |

**ESTIMACIÓN (método: cociente simple):** contra el plan Pro previsto de Andén (USD 12–15/mes ≈ USD 144–180/año), la entrada más
barata del segmento profesional con lista pública (ExtendSim, USD 4.995 el primer año con mantenimiento incluido; después USD 899/año) es **~28–35 veces** el primer año
de Andén; FlexSim (~USD 6.000/año) es **~33–42 veces**. La diferencia de precio no es el problema: el problema es que con lo
gratis de los incumbentes (30–150 objetos) **no se puede modelar un depósito real ni un hub**. INFERENCIA.

---

## 5. Lo que más se queja la gente (síntesis de reseñas y foros)

| Queja | Dónde aparece | Ejemplo (extracto) | Etiqueta |
|---|---|---|---|
| Curva de aprendizaje y programación obligatoria | AnyLogic (Java), FlexSim (FlexScript), Simio (lo avanzado), Arena | "No es para quien no programa"; "lleva mucho tiempo y esfuerzo aprender" | HECHO (extractos Capterra) |
| Documentación pobre | AnyLogic, Simio, Arena | "La documentación dice qué hacer pero no cómo"; "útil pero limitada" | HECHO |
| Lentitud y cuelgues en modelos grandes | AnyLogic, Arena, Simio, FlexSim (hardware) | "Muy lento"; "tarda mucho en inicializar"; "se cuelga" | HECHO |
| Precio opaco y alto | FlexSim, Simio, AnyLogic | "Las compras se traban hasta que llega la cotización completa" | HECHO (rfp.wiki) |
| Solo Windows / poco Mac | Arena, Plant Simulation, Simio | — | HECHO |
| Interfaz anticuada o mejorable | Plant Simulation (G2), Arena | "La interfaz necesita mejorar" | HECHO |
| Biblioteca 2D/3D corta o difícil de extender | AnyLogic | Piden más objetos y crear 3D propio | HECHO |
| Integraciones con ERP/WMS débiles | FlexSim | — | HECHO (rfp.wiki) |

**Nota de método:** no pudimos leer G2, Capterra ni TrustRadius directamente (bloqueo 403) y el buscador no devolvió hilos de
Reddit para estas herramientas. Las quejas son extractos de reseñas vía buscador y resúmenes de agregadores: **sirven para ver
patrones, no para contar frecuencias**. Calificaciones citadas (Capterra, vía buscador): FlexSim 4,6/5 (128), AnyLogic 4,5/5
(518), Simio 4,7/5 (104+), Arena 4,1/5 (28), WITNESS 4,4/5 (38); Plant Simulation en G2 4,4/5 (113). HECHO (secundario).

---

## 6. Lo que nadie hace bien todavía (con evidencia)

| # | Hueco | Evidencia (HECHO) | Por qué importa / qué haría Andén (INFERENCIA o HIPÓTESIS) |
|---|---|---|---|
| 1 | **Modelo pensado para que lo escriba y lo verifique una IA** | Las IA de Siemens, AnyLogic, Rockwell escriben código o responden sobre motores para humanos; Simio expone MCP; la investigación pide validar trazas contra la especificación; generar código para APIs grandes falla mucho (SIMCODE ~30,6%) | Formato declarativo con esquema, compilador que rechaza modelos inválidos, pruebas automáticas de trazas ("ningún paquete sale antes de entrar", "la cinta nunca supera su capacidad"), servidor MCP propio desde el día uno. HIPÓTESIS: la tasa de modelos correctos sube mucho frente a generar código |
| 2 | **Estadística honesta por defecto** | Law 2023: cobertura real 7,2% vs 95% con un método que ofrece "uno o más productos comerciales"; siete errores típicos (una sola corrida, sin calentamiento, sin intervalos, comparar con una réplica, mirar solo promedios); FlexSim: réplicas fijas, intervalo "visual" | Réplicas hasta precisión objetivo, detección de calentamiento, números aleatorios comunes para comparar, percentiles (P90 de espera), comparación pareada con "¿la diferencia es real?", semáforo de confianza en lenguaje llano |
| 3 | **3D bueno en cualquier navegador y teléfono, con el motor ahí mismo** | Fotorrealismo tercerizado en Omniverse (4 incumbentes); AnyLogic 9 web en preview; realvirtual WEB corre en el navegador pero sin motor de eventos | 2D de ingeniería + 3D de comunicación en el navegador (WebGPU con respaldo WebGL), enlace compartible que corre la simulación en el dispositivo del que mira; costo de servidor casi cero |
| 4 | **Cómputo de experimentos gratis y masivo** | Nube gratis de AnyLogic: corridas de 1 minuto; nube privada por núcleos (16/64); FlexSim distribuye a mano en AWS; WITNESS.io pago; GPU para eventos discretos solo en investigación (Kunz 2012: 25 veces en un prototipo) | Miles de réplicas en el navegador con Web Workers y WebAssembly; la nube solo para lo pesado. HIPÓTESIS: un hub típico entra en el teléfono (medir) |
| 5 | **Datos de entrada sin dolor** | 10–40% del proyecto en datos de entrada (Skoogh y Johansson); un concepto automatizado redujo 78% ese tiempo (2012); ANDRITZ compró Stat::Fit en ene-2026 | Soltar una planilla o un export de WMS → ajuste de distribuciones, curvas por hora y por día, detección de outliers, cada supuesto visible y editable |
| 6 | **El modelo como software: versiones, pruebas y diff legible** | Git en AnyLogic (2024), Emulate3D (2025), JaamSim; Test Runner solo en Emulate3D y para PLC | Cada escenario es una rama; cada cambio corre pruebas de KPI; el diff dice "agregaste 2 inductores: +11% de paquetes por hora (IC 95%: +8% a +14%)" |
| 7 | **Fidelidad mixta: física solo donde importa** | Emulate3D: física para probar control; DES generalistas abstraen la física; Plant Simulation 2606 recién suma frenado y curvas de AGV | Nivel de detalle adaptativo: eventos discretos en todo el sistema y física o cinemática fina solo en uniones de cintas, cruces de AGV o zonas críticas. HIPÓTESIS técnica a probar |
| 8 | **Salir con una decisión, no con un modelo** | Lo más cercano: analizador de cuellos de Siemens y Sankey; preguntas de planes vía MCP en Simio | Explicación causal ("el cuello es el pesaje porque…"), costo por unidad con índices argentinos, recomendación con su intervalo, informe en español |
| 9 | **Plantillas de hub de paquetería y última milla** | BEUMER y Vanderlande lo hacen en casa; los generalistas venden bloques | Biblioteca vertical: inducción, clasificación por destino, rampas, oleadas, horarios de corte, reparto por zonas, Flex. Es donde el fundador sabe más que la competencia |
| 10 | **Simulador neutral de automatización de almacén** | Dematic, Kardex/AutoStore, AutoStore CubeVerse: cada uno simula *su* equipo | Comparar manual vs. AutoStore vs. AMR vs. shuttle con la misma demanda y costos públicos, sin vender equipos. HIPÓTESIS de demanda |
| 11 | **Español, precio latinoamericano y costos locales** | No encontramos interfaz en español de ningún incumbente (la búsqueda no lo confirmó ni lo descartó); precios de USD 4.995 a 21.800 | Español primero, pesos y dólares, índices FADEEAC/CEDOL/AECAUM, plan para cátedras |
| 12 | **Independencia y formato abierto** | Consolidación 2023–2026 (Autodesk, Minitab, ANDRITZ, Aegis, Haskoning); AutoMod discontinuado; FlexSim migra licencias a Autodesk | Formato abierto (JSON con esquema publicado, 3D en glTF/OpenUSD), exportar todo, sin candado. Mensaje: "tu modelo es tuyo" |
| 13 | **Gratis que alcance para algo real** | Topes: 30 objetos (FlexSim), 80 (Plant Simulation), 150 entidades (Arena), 10 tipos de agente (AnyLogic) | Plan gratis que modele un depósito chico completo; el pago está en lo que ahorra tiempo (IA, datos, informes), no en el tamaño |

---

## 7. Qué tomar de cada uno (sin copiar)

| De | Tomamos la idea | Etiqueta |
|---|---|---|
| FlexSim | Que el 3D se entienda a primera vista y que los objetos logísticos traigan comportamiento por defecto | INFERENCIA |
| AnyLogic | Multimétodo (agentes + flujos + eventos) y bibliotecas por dominio; API para que un programa dibuje el modelo | INFERENCIA |
| Plant Simulation | Analizador automático de cuellos y Sankey; "trae tu propio LLM" para empresas que no quieren mandar datos afuera | INFERENCIA |
| Simio | MCP abierto a cualquier agente; consultas del tipo "qué órdenes salieron tarde y qué tienen en común" | INFERENCIA |
| Emulate3D | Git, pruebas automáticas y fallas inyectadas (cortes de energía, sensores que derivan) | INFERENCIA |
| SIMUL8 | Importar BPMN y Visio; generar el modelo desde datos del negocio | INFERENCIA |
| ExtendSim | Tasa discreta para flujos a granel (paquetes por minuto cuando no hace falta el paquete individual) | INFERENCIA |
| Kardex StoreX | Calculadora web de dimensionamiento como puerta de entrada (encaja con las calculadoras v0 de Andén) | INFERENCIA |
| JaamSim | Entradas en texto versionables con Git | INFERENCIA |

---

## 8. Riesgos de esta lectura

- **Velocidad de los incumbentes:** AnyLogic ya tiene editor web y asistente; Simio ya tiene MCP. En 12–18 meses "la IA arma el
  modelo" será básico en todos. HIPÓTESIS (alta probabilidad). Por eso el diferencial tiene que estar en verificación,
  estadística, datos, verticales y precio, no en el chat.
- **Fuentes secundarias:** precios de FlexSim, AnyLogic Pro, Plant Simulation X y SIMUL8 vienen de revendedores y agregadores;
  la discontinuación de AutoMod viene de un competidor. Re-verificar antes de usarlos en comunicación pública.
- **Calidad 3D y rendimiento:** no medimos ninguno de los productos; las comparaciones de "3D" son reputación, no medición.
- **Ausencias:** "no encontramos X" no prueba que X no exista (en especial interfaz en español y plantillas de hub).

---

## 9. Fuentes (todas consultadas el 17-10-2026)

**Siemens Plant Simulation**
- Siemens, "Discover what's new in Plant Simulation 2606" (25-06-2026): https://blogs.sw.siemens.com/tecnomatix/discover-whats-new-in-plant-simulation-2606/
- Siemens, "Introducing the AI-powered Copilot for Siemens Plant Simulation" (17-12-2025): https://blogs.sw.siemens.com/tecnomatix/introducing-the-ai-powered-copilot-for-siemens-plant-simulation-software/
- Siemens, "Discover what's new in Tecnomatix 2606": https://blogs.sw.siemens.com/tecnomatix/discover-whats-new-in-tecnomatix-2606-june-2026/
- Siemens, "Buy Plant Simulation online" (13-11-2020): https://blogs.sw.siemens.com/tecnomatix/buy-plant-simulation-online/
- Siemens, descarga de estudiante: https://resources.sw.siemens.com/en-US/download-tecnomatix-plant-simulation-student-software
- Folleto Plant Simulation (4DSysco, oct-2025): https://4dsysco.com/wp-content/uploads/2025/10/Plant-Simulation.pdf
- G2, Tecnomatix (reseñas) y ficha de precios de Plant Simulation X Essentials (vía buscador; URL exacta de precios no recuperada): https://www.g2.com/products/tecnomatix/reviews
- Siemens, evento 2612 EAP y humanoides: https://blogs.sw.siemens.com/tecnomatix/before-humanoids-hit-the-factory-floor-validating-humanoids-with-manufacturing-simulation/

**AnyLogic**
- AnyLogic, funciones: https://www.anylogic.com/features/ · nube: https://www.anylogic.com/features/cloud/
- IISE Annual 2026, sesión "AnyLogic AI Assistant for Discrete-Event Modeling" (18-05-2026): https://iise.secure-platform.com/annual2026/solicitations/102014/sessiongallery/95947
- AnyLogic, línea de tiempo de versiones: https://www.anylogic.ru/features/timeline/
- AnyLogic 9, notas: https://anylogic.help/9/anylogic/introduction/release-notes.html · WSC 2024 (preview pública): https://informs-sim.org/wsc24papers/vdra108s2-file2.pdf
- Wikipedia, AnyLogic (8.9.9, jun-2026): https://en.wikipedia.org/wiki/AnyLogic
- CheckThat.ai, precios AnyLogic (actualizado 02-07-2026): https://checkthat.ai/brands/anylogic/pricing
- anyLogistix, compra: https://anylogistix.com/purchase
- Capterra y Software Advice, reseñas de AnyLogic (extractos vía buscador): https://capterra.com/p/95940/AnyLogic/reviews/ · https://www.softwareadvice.com/business-intelligence/anylogic-profile/

**FlexSim**
- FlexSim (Autodesk), inicio: https://www.flexsim.com/
- KB FlexSim 2026: https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-2026-available/ta-p/13938844
- KB FlexSim 2025: https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-2025-available/ta-p/13584599 · LTS: https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-2025-lts-available/ta-p/14106755
- Ayuda FlexSim 2027: https://help.autodesk.com/view/FLEXSIMIN/2027/ENU/ · licencias por tipo: https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-feature-limitations-by-license-type/tac-p/13814419
- Foro, réplicas del Experimenter: https://forums.autodesk.com/t5/flexsim-forum/replications-experimenter/td-p/13591057 · AWS: https://forums.autodesk.com/t5/flexsim-knowledge-base/tkb-p/flexsim-tkb-en/label-name/aws
- ARC, compra por Autodesk: https://www.arcweb.com/blog/autodesk-signs-definitive-agreement-acquire-flexsim
- Autodesk, FlexSim Summit 2026: https://www.autodesk.com/campaigns/flexsim-summit/overview · integración con FDU (oct-2025): https://www.autodesk.com/blogs/design-and-manufacturing/factory-production/ · almacenes: https://www.autodesk.com/blogs/design-and-manufacturing/top-benefits-of-warehouse-simulation-software-for-manufacturers/
- WSC 2022, IA en FlexSim: https://www.informs-sim.org/wsc22papers/370.pdf
- rfp.wiki (precio de revendedores): https://www.rfp.wiki/supply-chain-logistics-transportation/supply-chain-planning-solutions/supply-chain-simulation-software/flexsim/simul8
- LOGI-TODAY (Zenetech, 12-03-2026 y 09-06-2026): https://www.logi-today.com/923274 · https://www.logi-today.com/962252
- UNAM, Ingeniería Investigación y Tecnología 27(1), 2026: https://www.revistaingenieria.unam.mx/numeros/2026/v27n1-04.pdf

**Simio**
- Aegis/Simio MCP (23-09-2026): https://www.financialcontent.com/article/bizwire-2026-9-23-aegis-software-introduces-ai-powered-interaction-for-process-simulation-and-planning-in-simio
- Simio blog (12-05-2026): https://www.simio.com/blog/talking-to-your-models-the-natural-language-revolution-in-ai-simulation
- Evertiq, compra por Aegis (28-01-2026): https://evertiq.com/news/2026-01-28-aegis-completes-acquisition-of-simulation-software-provider-simio
- Simio 14.230 y redes neuronales: https://simio.com/news/simio-announces-the-release-of-version-14-230-and-its-neural-network-features
- Simio 20: https://www.simio.com/simio-20-revealed-explore-the-new-features · notas sprint 290: https://cdn.simio.com/software/SimioReleaseNotes290.pdf · Scoop nov-2025: https://www.simio.com/simio-scoop-e-newsletter/simio-scoop-november-2025/
- Simio, estudiantes: https://simio.com/academics/student-resources.htm · encuesta INFORMS: https://www.informs.org/ORMS-Today/OR-MS-Today-Software-Surveys/Simulation-Software-Survey/Page-8
- rfp.wiki, Simio vs AnyLogic: https://www.rfp.wiki/supply-chain-logistics-transportation/supply-chain-planning-solutions/supply-chain-simulation-software/simio/anylogic

**Arena, AutoMod, Emulate3D**
- Rockwell, aviso SD1763 (14-11-2025): https://www.rockwellautomation.com/es-ar/trust-center/security-advisories/advisory.SD1763.html
- Capterra, reseñas Arena: https://capterra.com/p/144460/Arena/reviews/ · RPI (150 entidades): https://designlab.eng.rpi.edu/edn/projects/capstone-support-dev/wiki/Arena_software
- PMC, discontinuación de AutoMod (28-04-2026): https://pmcorp.com/blog/automod-is-being-discontinued-exploring-automod-software-alternatives/
- Rockwell, "What's New in Emulate3D 2025": https://www.rockwellautomation.com/content/dam/rockwell-automation/documents/pdf/events/roklive-emea-2025/digital-engineering-summit/what-is-new-in-emulate3d-2025.pdf
- SimPlan, comparación de ediciones: https://www.simplan.de/wp-content/uploads/Comparison-Emulate3D-Editions.pdf
- Business Wire, Emulate3D Factory Test (13-03-2025): https://www.businesswire.com/news/home/20250313584308/en/Rockwell-Automation-Showcases-Emulate3D-Factory-Test-for-the-First-Time-at-NVIDIA-GTC-2025
- The Machine Maker, Hannover Messe 2026 (27-04-2026): https://themachinemaker.com/news/rockwell-automation-showcases-ai-orchestrated-factory-system-design-at-hannover-messe-2026/
- Rockwell Partners, taller Emulate3D: https://partners.rockwellautomation.com/news/b0f3bf28-7a1d-ed11-b83e-000d3a4df6e5/

**Visual Components, SIMUL8, ExtendSim, WITNESS**
- Visual Components, changelog: https://www.visualcomponents.com/changelog · notas 5.0: https://help.visualcomponents.com/5.0/Premium/en/English/Release_Notes/release_notes_5.0.htm · productos: https://www.visualcomponents.com/products/ · KUKA: https://manufacturingdigital.com/articles/kuka-owned-visual-components
- SIMUL8, planes: https://www.simul8.com/pricing · Capterra: https://capterra.com/p/114609/SIMUL8-Professional/ · Minitab (05-12-2024): https://www.minitab.com/en-us/company/press-releases/minitab-simul8-acquisition/
- ExtendSim, precios: https://extendsim.com/pricing · ANDRITZ (22-03-2023): https://www.andritz.com/newsroom-en/automation/2023-03-22-extendsim-group · Stat::Fit: https://extendsim.com/acquisition-statfit
- Lanner: https://www.lanner.com/en-gb/ · Horizon: https://www.lanner.com/en-gb/insights/news/new-predictive-simulation-technology-launched-to-drive-up-user-productivity.html · Capterra: https://capterra.com/p/126389/WITNESS/

**Almacén, intralogística, paquetería y nuevos**
- Dematic, simulación de almacén: https://www.dematic.com/en-us/insights/articles/warehouse-simulation-software/ · iQ Virtual: https://www.automation.com/en-us/products/product01/dematic-introduces-dematic-iq-virtual-emulation-an
- Kardex, StoreX Calculator: https://www.kardex.com/en/company/news/kardex-launches-storex-calculator-at-nrf-2025 · AutoStore: https://autostoresystem.com
- BEUMER, CEP Software Suite: https://www.beumergroup.com/pd/cep-software-suite/ · Vanderlande (TU/e, 2018): https://pa.win.tue.nl/?p=1490
- MMH, "Real benefits with simulation": https://www.mmh.com/article/real_benefits_with_simulation/Simulation
- 4Sight, OptiSlot DC: https://4sight.cloud/offerings/optislot-dc · Optioryx, guía de slotting 2026: https://www.optioryx.com/blog/best-warehouse-slotting-software
- Optilogic: https://optilogic.com/
- NVIDIA, Mega: https://blogs.nvidia.com/blog/mega-omniverse-blueprint · KION/Accenture (06-01-2025): https://www.businesswire.com/news/home/20250106399453/en/KION-Teams-with-NVIDIA-and-Accenture-to-Optimize-Supply-Chains-with-AI-Powered-Robots-and-Digital-Twins
- MetAI: https://technode.global/2025/01/15/nvidia-backed-metai-secures-4m-seed-funding · https://hiverlab.com/metai-metgen-digital-twin-platform-at-ces-2026
- JaamSim: https://jaamsim.com/ · https://en.wikipedia.org/wiki/JaamSim
- realvirtual: https://realvirtual.io/en/products/professional/ · https://realvirtual.io/es/blog/realvirtual-in-the-browser-3d-hmi/

**Investigación**
- Law, A. M. (2023), "Design and analysis of simulation experiments using three simple statistical formulas", WSC 2023: https://informs-sim.org/wsc23papers/124.pdf
- Skoogh y Johansson (2009), SNE 19(2): https://www.sne-journal.org/fileadmin/user_upload_sne/SNE_Issues_OA/SNE_19_2/articles/sne.19.2.09937.tn.OA.pdf · https://research.chalmers.se/en/publication/131143 · automatización (2012): https://research.chalmers.se/en/publication/165035
- Chen y otros (2026), DEVS desde especificaciones: https://arxiv.org/abs/2603.03784
- SimLLM (2026): https://arxiv.org/pdf/2601.06543 · SIMCODE (2025): https://arxiv.org/html/2507.11014v1
- Bicalho-Hoch y otros (2022), pymes y DES, WSC 2022: https://informs-sim.org/wsc22papers/181.pdf
- Mississippi State (2011), obstáculos para pymes: https://www.cavs.msstate.edu/publications/docs/2011/05/8570IERC%202011_Sim%20Obstacles_final.pdf
- Kunz y otros (2012), DES en GPU: https://www.comsys.rwth-aachen.de/fileadmin/papers/2012/2012-kunz-pads-gpu.pdf

**Internas**
- `conocimiento/2026-09-28-logistic-lab-ia-y-calculos.md` (bitácora previa: AnyLogic, Siemens, FlexSim, Text2Sim MCP, precios)
- `oportunidades/proyectos/P2-anden.yaml` (definición del proyecto)
