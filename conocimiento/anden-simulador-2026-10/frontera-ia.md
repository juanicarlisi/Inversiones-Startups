# Andén · Frontera: IA, gemelos digitales y optimización (17-10-2026)

> Frente de investigación para llevar Andén (P2, `oportunidades/proyectos/P2-anden.yaml`) al simulador logístico más avanzado que
> exista. Antecedente: `conocimiento/2026-09-28-logistic-lab-ia-y-calculos.md`. Fecha de consulta de todas las fuentes: 17-10-2026.
> Datos obtenidos vía buscador y lectura directa de páginas; varias páginas de fabricantes devolvieron 403 (se indica). Las cifras de
> fabricantes son **autoinformadas** salvo que se diga otra cosa. Etiquetas según `doctrina/02-estandares-de-evidencia.md`.

---

## Resumen

1. **El terreno se movió en las últimas cuatro semanas.** AnyLogic lanzó su asistente de IA (versión 8.9.10, 24-09-2026) que arma
   *borradores simples* de modelos desde una descripción, y AnyLogic Online (15-09-2026), un entorno de modelado en el navegador. Simio
   abrió su software a Claude Code, Codex y otros agentes vía MCP (23-09-2026). Siemens tiene un copiloto que escribe código SimTalk
   (versión 2606, agosto de 2026). **«La IA arma el modelo» y «en el navegador» dejaron de ser diferenciales por sí solos** (HECHO para
   los lanzamientos; INFERENCIA, confianza alta, para la conclusión).
2. **Lo que sí funciona en la investigación es la IA que llena un esquema, no la que escribe código.** El mejor resultado publicado
   (Sketch2DES, julio de 2026) pasa de la imagen de una red de colas a un JSON validado y de ahí, con un adaptador determinista, a un
   modelo ejecutable: 388 de 400 corridas correctas (97%) en 35 s promedio, con modelos abiertos. Donde el LLM escribe el código del
   simulador directamente, la confiabilidad cae (30,6% de ejecución correcta en el benchmark SIMCODE de ns-3). **Andén debe tener un
   lenguaje de modelo propio, tipado y verificable, y un motor determinista; el LLM solo pregunta, completa y explica.**
3. **Nadie hace la entrevista.** Ningún fabricante documenta una IA que *pregunte lo que falta* como un ingeniero; la investigación sobre
   LLM para elicitación en simulación es casi inexistente (encontramos revisiones que piden triangular con expertos, no herramientas).
   Es el hueco más claro para Andén.
4. **Los gemelos digitales «grandes» (NVIDIA Mega, Siemens Digital Twin Composer, Amazon) son de robots, sensores y física
   fotorrealista**, piden placas de video de miles de dólares (Isaac Sim 6.0.1: mínimo RTX 4080 con 16 GB) y siguen en vista previa o
   acceso temprano. Para una pyme latinoamericana sin robots ni sensores, el gemelo útil es un **gemelo de decisiones**: proceso + costo,
   recalibrado con planillas y exportaciones.
5. **La optimización con IA más impactante de 2026 en depósitos es la evolución de algoritmos con LLM usando un evaluador.** FM
   Logistic mejoró 10,4% su ruteo de picking (más de 15.000 km menos por año) con AlphaEvolve, que pasó a disponibilidad general el
   09-07-2026. El patrón es *semilla + evaluador*: **el simulador de Andén puede ser ese evaluador** y la salida, una regla legible.
6. **Medimos el motor:** un motor de eventos discretos mínimo en JavaScript procesa **6–10 millones de eventos por segundo** en un
   solo hilo (Node 22, la misma máquina virtual que Chrome) y corre **40 réplicas de una semana de un hub en 0,5–0,65 s con 4 hilos**.
   El mismo modelo en SimPy nativo es **~66 veces más lento**. Conclusión: motor propio en TypeScript (o Rust a WebAssembly) en Web
   Workers, no Python en el navegador.
7. **La IA que explica es todavía promesa.** Siemens pone el resumen de modelos y la detección automática de cuellos de botella como
   *meta futura*; los papers 2025–2026 (grafo de conocimiento + LLM; trazas de simulación + LLM) muestran el camino pero con pocos
   números. Las explicaciones causales con contrafactuales sobre simulaciones de eventos discretos casi no tienen literatura: **otro
   hueco**.
8. **Los layouts generados sin simular engañan.** El pasillo en espina de pescado promete −20% de recorrido en el caso teórico, pero
   estudios posteriores dan −10 a −15% con doble comando y hasta +30% cuando los pedidos son grandes. Un generador de layouts solo vale
   si cada propuesta se evalúa con el perfil de pedidos real del usuario.
9. **El costo de IA no es el cuello:** convertir una descripción en modelo cuesta ~USD 0,002–0,008 con Claude Haiku 5.5 y ~USD
   0,03–0,17 con Sonnet 5.5 por conversión (ESTIMACIÓN con los tokens de Sketch2DES); una entrevista completa, USD 0,005–0,5 según
   modelo. Y si el usuario trae su propio agente (MCP/WebMCP), el costo para Andén es cero.
10. **El LLM local en el navegador todavía no sirve para todos:** la Prompt API de Chrome (Gemini Nano) acepta imagen y audio pero no
    funciona en teléfonos, pide 22 GB libres y más de 4 GB de VRAM (o 16 GB de RAM); WebLLM retiene 71–80% del rendimiento nativo pero en una Mac M3 Max.
    Para LatAm, con mayoría de teléfonos Android, la IA va en la nube barata o con la cuenta del usuario; el cálculo, local.

**Cinco decisiones de diseño que salen de acá** (detalle en §9): (a) un esquema de modelo propio como fuente única; (b) motor
determinista con semillas y números aleatorios comunes, en Workers; (c) verificación automática contra teoría de colas en cada
modelo; (d) optimizador que usa el simulador como juez, incluida la evolución de reglas con LLM; (e) explicaciones calculadas por
contrafactuales, que el LLM solo redacta.

---

## 1. De lenguaje natural, fotos, planos o PDF a modelo de simulación

### 1.1 Qué tienen los fabricantes (HECHO salvo indicación)

| Quién | Qué hace hoy | Fecha | Madurez | Fuente |
|---|---|---|---|---|
| **AnyLogic 8.9.10 – AI Assistant** | Arma «borradores simples y ejecutables» desde una descripción vaga; describe modelos grandes; sugiere estadísticas, gráficos y cambios de diagrama; explica errores. Prueba gratis con tokens limitados o clave propia (ChatGPT, Gemini, Claude o un LLM privado) | Versión del 24-09-2026; nota del blog 12-10-2026 | Producto lanzado; el propio fabricante habla de «borrador» | anylogic.com/blog (8.9.10) |
| **AnyLogic Online** | Entorno de modelado completo en el navegador (SaaS), mismo motor que el escritorio, librerías de manejo de materiales, procesos, peatones, tránsito, ferrocarril; experimentos en paralelo en la nube; APIs Python/JS/Java/REST | 15-09-2026 | Lanzado; suscripciones comerciales «planeadas»; cubre «una parte sustancial» del escritorio | anylogic.com/blog (Online) |
| **Siemens Plant Simulation Copilot 2606** | Genera y corrige código SimTalk con verificación de sintaxis; respuestas con citas a la documentación (RAG); guía de configuración; ayuda a diagnosticar «estación bloqueada». Admite Bedrock, Azure OpenAI, Anthropic, Vertex | Nota del 11-08-2026; primera versión en 2504 solo para Plant Simulation X en la nube | Lanzado. **No** arma modelos completos; resumen de modelo, detección automática de cuellos de botella y armado de experimentos desde un objetivo son «metas futuras» | blogs.sw.siemens.com/tecnomatix |
| **Simio (empresa de Aegis Software) – MCP** | Agentes compatibles (Claude Code, Codex, GitHub Copilot CLI, OpenCode) crean o modifican lógica, explican modelos, corren y analizan experimentos («qué órdenes terminaron tarde y qué tienen en común»). Requiere Simio 20.294+ | 23-09-2026 | Lanzado | Business Wire vía financialcontent.com |
| **FlexSim (de Autodesk desde 2023–2024)** | FlexSim 2026 (26.0) disponible. Herramienta de aprendizaje por refuerzo y Python desde 2022, con integración a Microsoft Bonsai (plataforma que Microsoft cerró a comienzos de 2023, según prensa) | Acuerdo de compra 24-10-2023; 2026 disponible | **No encontramos asistente de IA nativo** (las notas de versión devolvieron 403; INFERENCIA, confianza media) | cimdata.com; forums.autodesk.com (vía buscador); informs-sim.org WSC 2022; redmondmag.com |
| **Código abierto** | Text2Sim MCP (SimPy + dinámica de sistemas con PySD, se usa desde Claude); «anylogic-modeler», habilidad comunitaria para Claude Code (feb-2026) | 2025–2026 | Experimental | github.com/IamCatoBot; vibeindex.ai |

### 1.2 Qué dice la investigación 2024–2026

| Trabajo | Qué hace | Resultado con números | Etiqueta |
|---|---|---|---|
| **Sketch2DES** (Monks, Harper, Heather, Mustafee; arXiv 2607.24259, 27-07-2026) | Imagen de una red de colas → descripción (LLM multimodal) → JSON validado con un esquema y un bucle de reflexión → adaptador determinista a la librería Ciw | 8 diagramas; etapa 1 Pass@1 = 0,97 (389/400); etapa 2 Pass@1 = 1,0; punta a punta 388/400 = 0,97, Pass@2 = 1,00; 35 s promedio (21–65 s); 16.942 tokens promedio; modelos abiertos Qwen3.5-35B-A3B y gemma-4-26b-A4B (3–4 mil millones de parámetros activos) en H100; resultados sin diferencias estadísticas contra modelos codificados a mano y analíticos | HECHO (muestra chica: 8 casos) |
| **SimLLM** (Chen y otros; arXiv 2601.06543, ene–may 2026) | Ajuste fino de Qwen-Coder-7B y DeepSeek-Coder-6.7B para escribir SimPy de colas con plantillas por categoría | Mejora ejecutabilidad y cumplimiento de formato; **sigue fallando** en transferencias entre varios nodos y en actualizar servicio residual tras interrupciones (el resumen no da porcentajes) | HECHO |
| **DEVS** (Chen y otros; arXiv 2603.03784, mar–may 2026) | Separa la estructura (quién se conecta con quién) de la lógica de eventos y tiempos; valida con trazas de eventos contra restricciones temporales y causales | Sin números en el resumen | HECHO |
| **Agentes desde ODD** (Fachada y otros; arXiv 2602.10140, Ecological Modelling 517) | 17 LLM traducen documentación estándar de un modelo de agentes a Python | «Implementaciones fieles son posibles pero no garantizadas»; GPT-4.1 consistente, Claude 3.7 Sonnet menos confiable | HECHO |
| **SIMCODE** (ns-3, simulación de redes) | Código de simulación desde lenguaje natural | Mejor modelo (GPT-4.1) 30,6% de ejecución correcta tras ajuste fino | HECHO vía buscador (no abrimos el paper) |
| **Kreikemeyer y otros** (arXiv 2503.01675) | Mistral 7B ajustado escribe un lenguaje específico de dominio | Recupera el modelo correcto en hasta 84,5% de los casos | HECHO (dominio vecino: redes de reacción) |
| **FlexSim + ChatGPT** (Ingeniería Investigación y Tecnología, UNAM, ene–mar 2026) | Imagen de un layout industrial → código FlexSim que posiciona máquinas | Experimento académico, no producto | HECHO |
| **Elbasheer y otros (2025)** | Conversación → modelo de eventos discretos con un marco de plantillas restringido | Citado en 2602.10140; no lo abrimos | HECHO (indirecto) |

**INFERENCIA (confianza alta).** El patrón ganador es: *el LLM nunca toca el motor*. Traduce lo que dice la persona a un modelo
declarativo con esquema estricto; un programa determinista lo ejecuta; un verificador compara contra teoría (colas M/M/c, ley de Little,
balance de flujo) o contra un caso de referencia. Esto convierte errores de la IA en errores *detectables*.

### 1.3 Fotos, planos y PDF

| Entrada | Estado del arte | Para Andén | Etiqueta |
|---|---|---|---|
| Diagrama de proceso (pizarrón, papel) | Sketch2DES: 97% en 8 diagramas limpios de colas | Viable ya con modelos de nube; hay que probar con fotos reales en español | HECHO / HIPÓTESIS |
| Plano de planta (imagen) | FloorplanVLM (arXiv 2602.06507) y Raster2Seq (2602.09016) vectorizan planos residenciales; Raster-to-Vector clásico ~90% de precisión y exhaustividad | **Nada probado en depósitos ni con fotos de celular** (perspectiva, sombras): hueco | HECHO / INFERENCIA |
| PDF de procedimiento | Los LLM de nube leen PDF nativamente (hasta 600 páginas por pedido en la API de Claude) | Extraer pasos, tiempos y recursos al esquema; marcar lo que falta | HECHO (capacidad) / HIPÓTESIS (calidad) |
| Escaneo 3D del lugar | Gaussian splatting desde el celular (Scaniverse → .SPZ); extensión glTF para splats en candidata a versión desde feb-2026 | Sirve para **ver** el depósito en 3D en el navegador, no para modelarlo; posible capa visual en 2028+ | HECHO (fuentes de blog) / INFERENCIA |
| CAD | AnyLogic convierte CAD en paredes; KION arma gemelos desde CAD, video, lidar e imágenes | Importar DXF es un «básico» competitivo | HECHO |

### 1.4 En el navegador y a costo casi cero

| Opción | Dato | Limitación | Etiqueta |
|---|---|---|---|
| **Prompt API de Chrome (Gemini Nano)** | Entrada de imagen y audio, salida texto; actualizada 26-08-2026 | Solo escritorio (Windows, macOS 13+, Linux, Chromebook Plus); 22 GB libres; GPU con más de 4 GB de VRAM o 16 GB de RAM; **no en Android ni iOS**; no disponible en Web Workers | HECHO |
| **WebLLM** (arXiv 2412.15803) | Llama-3.1-8B: 41,1 tokens/s en el navegador vs 57,7 nativo (71%); Phi-3.5-mini: 71,1 vs 89,3 (80%); en MacBook Pro M3 Max | En GPU integradas y teléfonos rinde mucho menos; descargas de cientos de MB a GB | HECHO |
| **LLM de nube barato** | Claude Haiku 5.5: USD 0,10 por millón de tokens de entrada y USD 0,50 de salida; Sonnet 5.5: USD 2 / 10 (tabla oficial en caché del 06-10-2026; re-verificar) | Necesita conexión; costo variable | HECHO |
| **Costo por conversión** | Con 16.942 tokens por conversión (Sketch2DES): Haiku 5.5 USD 0,002–0,008; Sonnet 5.5 USD 0,03–0,17 | Método: todos los tokens como entrada (mínimo) a todos como salida (máximo) | ESTIMACIÓN |
| **Costo por entrevista** | 10 turnos con historial creciente (~110 mil tokens de entrada acumulados, ~5 mil de salida): Haiku ~USD 0,014; Sonnet ~USD 0,27; rango USD 0,005–0,5 con y sin caché | Supuesto de largo de entrevista propio | ESTIMACIÓN |
| **Agente del usuario** | WebMCP (páginas que exponen herramientas a agentes del navegador) en prueba de origen en Chrome 149–156; el objeto pasó de `navigator.modelContext` a `document.modelContext` | Borrador de grupo comunitario W3C; Firefox y Safari sin compromiso; casi ningún agente lo consume | HECHO (fuentes secundarias; verificar en developer.chrome.com) |

**Qué sería genuinamente nuevo acá** (HIPÓTESIS a validar):
- **La entrevista de ingeniero**: la IA detecta lo que falta (llegadas por hora y su forma, tiempos y variabilidad, turnos, recursos,
  reglas de prioridad, fallas) y pregunta en criollo, con valores de referencia sugeridos y su fuente. Los competidores generan
  borradores; ninguno documenta un proceso que *sepa qué preguntar*.
- **Supuestos a la vista con nivel de confianza** por parámetro (dato del usuario / referencia / supuesto de la IA), editable.
- **Audio en español rioplatense** como entrada («contámelo como a un colega»): ningún fabricante lo menciona.
- **Verificación automática** en cada modelo generado (ver §4.3), mostrada al usuario como «el modelo pasó 7 de 7 controles».

---

## 2. Gemelos digitales de almacenes: qué hay de verdad

| Iniciativa | Qué es | Estado y números | Etiqueta | Fuente |
|---|---|---|---|---|
| **NVIDIA Omniverse «Mega»** | Arquitectura de referencia para probar flotas de robots, «cerebros» de IA y sensores en un gemelo antes de llevarlos a la planta; Isaac, Omniverse, sensores simulados | Anunciado el 06-01-2025; «en vista previa» en build.nvidia.com; adoptantes KION, Accenture, Foxconn, Pegatron, Schaeffler | HECHO | blogs.nvidia.com |
| **KION / Dematic + Accenture** | «AI Control Tower» sobre Mega; primer camión industrial autónomo con IA en un depósito de GXO (Épinoy, Francia) | Comunicado GTC 16-03-2026; **sin cifras** de productividad, costo ni disponibilidad | HECHO | kiongroup.com |
| **Siemens Digital Twin Composer** | Escenas 3D fotorrealistas sobre Omniverse unidas a datos de MES, PLC y sensores | Lanzado en CES 06-01-2026, «en acceso temprano»; PepsiCo: +20% de rendimiento, hasta 90% de problemas detectados antes de tocar la planta, −10 a −15% de inversión | HECHO (cifras autoinformadas) | news.siemens.com |
| **Amazon** | Gemelos en Omniverse e Isaac Sim desde 2022; **DeepFleet**, modelo fundacional entrenado con movimientos de cientos de miles de robots | 1 millón de robots (jun-2025); DeepFleet mejora 10% el tiempo de viaje de la flota (autoinformado); paper arXiv 2508.08574 compara 4 arquitecturas, ganan las que modelan interacciones locales con actualización asincrónica | HECHO | aboutamazon.com; arxiv.org |
| **Dexory** | Robots que escanean más de 10.000 ubicaciones por hora con lidar y arman un gemelo vivo del inventario | USD 165 millones (USD 100 M serie C + USD 65 M deuda), 14-10-2025; clientes GXO, Maersk, DHL | HECHO | siliconangle.com; freightwaves.com |
| **Requisitos de Isaac Sim 6.0.1** | Simulador de robots de NVIDIA | Mínimo RTX 4080 16 GB y 32 GB de RAM; ideal RTX PRO 6000 de 48 GB; no corre en GPU sin núcleos RT (A100, H100) | HECHO | docs.isaacsim.omniverse.nvidia.com |

**INFERENCIA (confianza alta).** El «gemelo digital» de los grandes resuelve otro problema: entrenar y probar robots y sensores. Exige
CAD, sensores, robots y hardware caro, y se vende con consultoras. No compite con Andén por el mismo cliente; sí define la expectativa
visual («quiero verlo en 3D») y el vocabulario («gemelo»).

**Lo que Andén puede ofrecer y ellos no** (HIPÓTESIS):
- **Gemelo de decisiones sin sensores:** el modelo se recalibra cada semana con lo que la pyme ya tiene (exportación del WMS en CSV,
  planilla de volúmenes, reportes de Mercado Libre). Herramientas como Simod (descubre modelos de simulación de procesos desde registros
  de eventos, código abierto) muestran que se puede, aunque su debilidad documentada son los tiempos de cada actividad.
- **Calibración inversa:** cuando el usuario no sabe un tiempo pero sí un resultado («sacamos 6.000 paquetes por turno y quedan 500
  sin clasificar»), la inferencia basada en simulación (redes neuronales que estiman parámetros desde simulaciones; ya probada en colas
  M/G/1 en la literatura) estima el parámetro y su incertidumbre. No encontramos simuladores comerciales que lo ofrezcan.
- **3D en el navegador, opcional y separado del motor:** three.js con su renderizador WebGPU cae solo a WebGL 2 cuando no hay WebGPU.
  WebGPU está en Chrome/Edge (escritorio), Safari 26 (macOS, iOS, iPadOS), Firefox 141+ en Windows y 145+ en Mac con Apple Silicon, y
  Chrome Android 121+ con Android 12 y GPU Qualcomm o ARM; **Linux y Firefox Android, pendientes** (web.dev, 25-11-2025). No
  verificamos qué porcentaje de usuarios argentinos tiene WebGPU.

---

## 3. Optimización sobre simulación

### 3.1 Panorama

| Técnica | Qué existe | Madurez | Números | Etiqueta |
|---|---|---|---|---|
| **OptQuest** (OptTek) | Metaheurística de búsqueda dispersa y tabú que trata el modelo como caja negra; complemento de muchos simuladores comerciales | Industrial desde hace dos décadas | Un estudio de 2025 la encuentra la mejor frente a PROMETHEE en manufactura flexible | HECHO |
| **Optimización bayesiana** | BoTorch (PyTorch, adquisición Monte Carlo, multi-fidelidad: corridas cortas guían a las largas); SimBO y estudios con SimPy | Madura en investigación; poca en simuladores comerciales | Sin benchmark de dotación de depósitos encontrado | HECHO |
| **Aprendizaje por refuerzo (RL)** | FlexSim (herramienta RL), AnyLogic (vía Python); papers de asignación de ubicaciones y AGV | Mayormente académico: **no encontramos despliegues reales documentados** de políticas de batching o picking entrenadas en simulación | PPO conjunto asignación + despacho de AGV: −8,7% de tiempo de transporte y espera vs la mejor regla de distancia mínima; −11 a −18% con muchos obstáculos (Ain Shams Eng. J., 2025–26) | HECHO / INFERENCIA |
| **Ruteo de robots (MAPF)** | MAPF-GPT (AAAI 2025): imitación de soluciones expertas, rinde bien con modelos de **2 millones de parámetros**; SILLM (ICRA 2025): hasta 10.000 agentes | Investigación avanzada; Amazon en producción con DeepFleet | SILLM: +16,0% de rendimiento sobre el mejor método de búsqueda y +137,7% sobre el mejor aprendido, en 6 mapas grandes | HECHO |
| **Evolución de algoritmos con LLM** | AlphaEvolve (Google Cloud, disponible para todos desde 09-07-2026): semilla + evaluador del cliente; ShinkaEvolve (Sakana, Apache 2.0): récord de empaquetamiento con 150 muestras | **Ya en producción en logística** | FM Logistic (26-03-2026): +10,4% de eficiencia de ruteo de picking, +15.000 km ahorrados por año, depósito de 17.700 ubicaciones en Polonia, evaluador con 60 recorridos reales y penalidades por violar capacidad, FIFO o tiempo de cómputo | HECHO (autoinformado) |
| **LLM + trazas de simulación** | Li y Li (arXiv 2608.09343, 10-08-2026): un agente lee la peor réplica, formula hipótesis de cuello de botella y otros agentes editan el código de la política | Investigación | Puntaje medio de 62,49 a 78,61 (escala 0–100) en la mejor corrida; en 100 semillas pareadas supera a MILP rodante, reglas y metaheurísticas en todas | HECHO |
| **Solvers abiertos** | NVIDIA cuOpt (abierto, GPU; 23 récords de ruteo según NVIDIA); VRP en Rust compilable a WebAssembly (reinterpretcat/vrp); HiGHS compilado a WebAssembly (paquete npm `highs`) | Maduros | cuOpt: «1.000 paquetes en 10 s en vez de 20 min» (autoinformado) | HECHO |
| **LLM → modelo de optimización** | ORLM, OptiMUS y otros traducen enunciados a programación lineal entera | En evolución; benchmarks nuevos (MIPLIB-NL, feb-2026) muestran que los casos industriales siguen siendo difíciles | NL4Opt de 78,8% a 92,3% y IndustryOR de 37% a 50% con LLM como juez (2025) | HECHO vía buscador |
| **Metamodelos con redes de grafos** | Lone y Karanjkar (arXiv 2607.16769): 100.000 redes de suministro simuladas | Investigación | R² ≈ 0,99; 1 ms por red vs ~6 s de simulación (~6.000 veces más rápido); **fuera del rango de entrenamiento se rompe** (costo de transporte con R² negativo por encima de ~350 nodos) | HECHO |

### 3.2 Medición propia: cuánto rinde un motor en el navegador

Scripts en `conocimiento/anden-simulador-2026-10/medicion-motor/`. Entorno: contenedor con Intel Xeon 2,1 GHz y 4 núcleos, Node 22.22
(motor V8, el mismo de Chrome), Python 3.13 y SimPy 4.1.1. Corridas del 17-10-2026 (HECHO medido; varía ±15% entre corridas).

| Prueba | Resultado |
|---|---|
| Hub de 3 etapas en serie (inducción, clasificación, carga; 4–6 puestos por etapa; 4 paquetes por minuto), motor JS mínimo con montículo binario | **8,9–9,8 millones de eventos/s**; 2,45 millones de paquetes/s en un hilo |
| El mismo hub en SimPy nativo | 37.000 paquetes/s → el motor JS es **~66 veces más rápido** |
| 40 réplicas de una semana (10.080 min) del hub | 1,0 s en 1 hilo; **0,52–0,65 s en 4 hilos**; intervalo de confianza del tiempo de ciclo ±1,2% |
| Variante rica: 12 estaciones, 10% de retrabajo, fallas y reparaciones, atributos por paquete | **6,2–6,9 millones de eventos/s**; ~0,4 millones de paquetes/s |
| Pyodide (Python compilado a WebAssembly) frente a Python nativo | 1 a 16 veces más lento (medición de Mozilla de 2019; no la repetimos) |

**ESTIMACIÓN (método: eventos medidos × tamaño del caso).** Un hub de 24.000 paquetes por día simulado una semana genera entre 0,8 y 2,7
millones de eventos: 0,15–0,45 s por réplica en un hilo. Una optimización bayesiana o evolutiva de 100 configuraciones × 20 réplicas
(2.000 réplicas) tarda **1,5–4 minutos con 4 hilos** en una computadora como la medida, y menos con multi-fidelidad (horizontes cortos
al principio). En un teléfono de gama media, entre 3 y 10 veces más (rango supuesto, sin medir).

**INFERENCIA (confianza media-alta).** Para el tamaño de problema de una pyme, **la optimización completa cabe en el navegador**. La
literatura de simulación de eventos discretos en GPU reporta 25 veces (Kunz y otros, 2012) y hasta 100 veces (Sang y otros, 2019) de
aceleración para muchas réplicas en paralelo: WebGPU podría llevar el análisis de riesgo a decenas de miles de réplicas, pero no
encontramos ni medimos una implementación en WebGPU (HIPÓTESIS).

### 3.3 Qué sería genuinamente nuevo

- **«AlphaEvolve en tu depósito»** (HIPÓTESIS): el usuario elige la decisión (orden de picking, armado de olas, asignación de
  muelles, reglas de clasificación, slotting); Andén toma la regla actual como semilla, el simulador como evaluador con números
  aleatorios comunes, y un LLM propone variantes. Sale una **regla legible** que el jefe de depósito entiende y puede aplicar mañana,
  con la mejora y su intervalo. FM Logistic lo hizo con Google y un equipo propio; Andén lo empaqueta para quien no tiene equipo.
  Herramientas abiertas (ShinkaEvolve) permiten hacerlo sin Google. Validación: 3 casos de referencia públicos + 2 casos del
  fundador, mejora ≥ 5% contra la mejor regla clásica.
- **Optimización con «recompensas verificables»**: el mismo patrón que llevó a los LLM a generar planos residenciales válidos (§5)
  aplicado a decisiones logísticas: el simulador es el verificador.
- **Dotación por curva de volumen con riesgo** (HIPÓTESIS): no «13 operarios», sino «13 operarios dan 95% de probabilidad de terminar el
  turno en Hot Sale; con 12, 71%». Ningún competidor lo presenta así para no expertos.

---

## 4. IA que explica resultados y propone cambios

### 4.1 Qué existe

| Qué | Estado | Etiqueta |
|---|---|---|
| Siemens Copilot 2606 | Responde «por qué esta estación se bloquea» con guía de configuración; **la detección automática de cuellos de botella y el resumen de modelos son metas futuras** | HECHO |
| Simio + MCP | El agente del usuario consulta resultados («qué órdenes terminaron tarde y qué tienen en común») | HECHO |
| AnyLogic AI Assistant | Describe modelos grandes y sugiere estadísticas y gráficos | HECHO |
| Grafo de conocimiento + LLM (Parekh y otros, arXiv 2507.17273, jul-2025) | Convierte la salida de una simulación de depósito en un grafo y un agente responde con consultas Cypher; «tasas de acierto casi perfectas» y «supera a métodos base», **sin cifras en el resumen** | HECHO |
| Trazas + LLM (arXiv 2608.09343) | Hipótesis de cuello de botella desde la peor réplica | HECHO |
| Método del período activo (Roser y otros, WSC 2002) | La estación con el período activo ininterrumpido más largo es el cuello en ese momento; detecta cuellos que se desplazan; paquete PyPI `active-period-method` | HECHO (clásico, maduro) |
| Contrafactuales sobre trazas | Resimulación contrafactual para explicar causas (IJCAI 2018, modelos biológicos basados en reglas); **no encontramos trabajos 2025–2026 en simulación logística** | HECHO / INFERENCIA |

### 4.2 Diseño recomendado (INFERENCIA, confianza alta)

La explicación **se calcula, no se redacta**. Cuatro piezas deterministas y una de lenguaje:

1. **Descomposición del tiempo de ciclo** por paquete y por estación: espera, proceso, bloqueo, hambre, falla.
2. **Cuello de botella dinámico** por el método del período activo, con el porcentaje del tiempo que cada estación fue el cuello.
3. **Contrafactuales con números aleatorios comunes:** para cada recurso, «+1 persona», «−10% de tiempo», «+20% de llegadas»; la
   diferencia se mide con la misma aleatoriedad, así la variación es la causa y no el azar. Con varias causas a la vez, una atribución
   tipo Shapley reparte el efecto (HIPÓTESIS: costo de cómputo aceptable con pocos factores; verificar).
4. **Costo por paquete** de cada escenario con los índices argentinos de las calculadoras v0 (FADEEAC, convenios 40/89 y 130/75).
5. **El LLM solo narra** lo calculado y cada frase cita el experimento que la respalda («si sumás 1 persona en clasificación, el tiempo
   de ciclo baja 22% ± 3%; experimento E-14, 40 réplicas»). Una afirmación sin experimento no se muestra.

**Qué sería nuevo:** un «¿por qué?» con contrafactual cuantificado y su intervalo, en lenguaje llano y en pesos, para quien nunca
simuló. Ningún fabricante lo ofrece hoy (Siemens lo anuncia como futuro).

### 4.3 Verificación automática del modelo (la base de la confianza)

Cada modelo, generado o editado, pasa controles antes de mostrar resultados (INFERENCIA; cada control es teoría estándar):

| Control | Qué detecta |
|---|---|
| Balance de flujo (entra = sale + en proceso) | Paquetes perdidos o duplicados |
| Ley de Little (en proceso = tasa × tiempo) | Errores de medición |
| Utilización < 1 en cada recurso con su capacidad | Sistemas que explotan (colas infinitas) |
| Comparación con Erlang C o M/M/c en estaciones simples | Lógica de colas mal hecha |
| Prueba de calentamiento y largo de corrida | Resultados sesgados por el arranque |
| Repetibilidad con la misma semilla | No determinismo |
| Sensibilidad mínima a cada parámetro | Parámetros que no se usan («cables sueltos») |

---

## 5. Generación de layouts

| Trabajo | Qué hace | Números | Etiqueta |
|---|---|---|---|
| Shahroudnejad y otros (arXiv 2407.08633, jul-2024) | Búsqueda en haz con restricciones (accesibilidad, holguras, conectividad de pasillos) y puntaje por posiciones y costos de acceso | Sin números en el resumen | HECHO |
| Lara, Milios, Pal y otros (Findings of ACL 2026; arXiv 2605.14117) | LLM ajustado con planos reales + aprendizaje por refuerzo con recompensas verificables (áreas, dimensiones, conectividad) | −94% en la métrica de incompatibilidad y +26% de diversidad frente a HouseDiffusion en 8 ambientes; solo viviendas de un piso | HECHO |
| Cohen y Aperstein (IFAC INCOM 2024) | VAE + GAN para layouts de planta | Sin números a mano | HECHO |
| Pasillos en espina de pescado (Gue y Meller, 2009) | Pasillos diagonales | −20% de recorrido esperado (carga unitaria, comando simple); estudios posteriores: −10 a −15% con doble comando y **hasta +30% con pedidos grandes**; menor densidad de almacenamiento | HECHO |
| AnyLogic (blog 20-08-2026) | Simular el layout antes de construir; CAD a paredes; integración con Omniverse | Caso DHL: 70.000 SKU, 9.000 pedidos diarios, −72% de operaciones «pick and pass», de 4 a 2 horas de ciclo (autoinformado). **Sin generación de layouts por IA** | HECHO |

No encontramos (búsqueda del 17-10-2026) un producto que **genere layouts de depósito con IA y los valide con simulación del perfil de
pedidos del usuario**. INFERENCIA, confianza media (puede existir en consultoras o en investigación no indexada).

**Diseño propuesto** (HIPÓTESIS): un generador paramétrico (racks, pasillos, pasillos cruzados, espina de pescado, muelles, zonas de
consolidación) que produce cientos de candidatos; un filtro analítico rápido (distancia esperada de picking con el perfil ABC real); y
simulación completa solo para los 5–10 mejores, con congestión de autoelevadores y personas. El LLM traduce restricciones dichas en
voz («las columnas están cada 12 metros», «el muelle 3 no se usa en invierno») a restricciones del generador. El ejemplo de la espina
de pescado es el argumento de venta: **«lo que dicen los libros puede empeorar tu depósito; te lo mostramos con tus pedidos»**.

---

## 6. Qué se puede hacer en el navegador hoy, con costo cercano a cero

| Capacidad | Tecnología | Estado (17-10-2026) | Costo de servidor | Etiqueta |
|---|---|---|---|---|
| Motor de eventos discretos | TypeScript en Web Workers (o Rust → WebAssembly) | 6–10 M eventos/s medidos en V8 | Cero | HECHO medido |
| Réplicas en paralelo | Workers (un hilo por núcleo) | 40 réplicas de una semana en ~0,6 s con 4 hilos | Cero | HECHO medido |
| Miles de réplicas para riesgo | WebGPU compute | Disponible en los navegadores principales salvo Linux y Firefox Android; sin implementación DES verificada | Cero | HIPÓTESIS |
| Optimización (bayesiana, evolutiva, MILP, ruteo) | JS propio; HiGHS y VRP compilados a WebAssembly | Paquetes disponibles; sin benchmark propio | Cero | HECHO (existencia) |
| Metamodelo instantáneo para «deslizadores» | Red chica en ONNX Runtime Web o transformers.js | Viable técnicamente; precisión se rompe fuera del rango entrenado | Cero | INFERENCIA |
| Visual 2D y 3D | Canvas 2D; three.js WebGPU con caída a WebGL 2 | Maduro | Cero (activos estáticos) | HECHO |
| LLM local | WebLLM; Prompt API de Chrome | Solo escritorio con buena GPU | Cero | HECHO |
| LLM de nube | Haiku 5.5 / Sonnet 5.5 | USD 0,002–0,5 por modelo según tarea | Variable, bajo | ESTIMACIÓN |
| Agente del usuario | MCP local; WebMCP en prueba de origen | Temprano | Cero | HECHO |

---

## 7. Probado o prometido

| Tema | Probado (hay números o despliegue) | Prometido (anuncio, demo o sin cifras) |
|---|---|---|
| Texto → modelo | Borradores simples (AnyLogic); 97% en 8 diagramas de colas (Sketch2DES) | Modelos complejos de logística correctos desde texto |
| Foto o plano → modelo | Diagramas de colas limpios | Fotos de celular de depósitos reales |
| Gemelos de robots | Amazon en producción (DeepFleet +10%, autoinformado) | Mega en vista previa; KION sin cifras; Siemens Composer en acceso temprano |
| Optimización con LLM | FM Logistic +10,4% (informado por Google y FM Logistic, sin verificación independiente) | Generalización a cualquier depósito sin equipo propio |
| RL en depósitos | Mejoras de 8–18% en simulación (papers) | Despliegues reales documentados |
| Explicación automática | Período activo (clásico); consultas a resultados vía MCP | Cuellos de botella y resúmenes automáticos (Siemens, «futuro»); causalidad |
| Layouts con IA | Planos residenciales con RL verificable | Layouts logísticos validados por simulación |
| IA en el navegador | WebLLM al 71–80% de lo nativo en Mac de alta gama | IA local en teléfonos de gama media |

---

## 8. Lo genuinamente nuevo que Andén puede ser

Ordenado por valor esperado para el usuario objetivo (pyme, operador de última milla, estudiante). Todas son HIPÓTESIS; al lado, cómo
se valida.

| # | Propuesta | Por qué es nuevo | Cómo se valida |
|---|---|---|---|
| 1 | **Entrevista de ingeniero** que construye el modelo preguntando lo que falta, con valores de referencia argentinos y supuestos visibles | Los competidores generan borradores; ninguno documenta elicitación | 10 personas reales describen su operación; ≥ 8 llegan a un modelo que pasa la verificación en < 15 minutos |
| 2 | **Modelo verificado** («pasó 7 de 7 controles») en cada generación o edición | Nadie lo muestra al usuario | Banco de 30 casos con solución analítica; 0 errores no detectados |
| 3 | **Decisión en pesos**: cada escenario sale en $/paquete con índices que se actualizan solos | Los simuladores dan tiempos, no costos locales | El fundador valida 5 casos contra su experiencia |
| 4 | **«¿Por qué?» con contrafactual cuantificado** (efecto ± intervalo) narrado en llano | Siemens lo pone como futuro | Usuarios no expertos explican correctamente la recomendación en una prueba de 5 preguntas |
| 5 | **Reglas evolucionadas** (picking, olas, muelles, slotting) con el simulador como juez | FM Logistic lo hizo con Google; nadie lo empaqueta para pymes | ≥ 5% de mejora sobre la mejor regla clásica en 3 casos públicos |
| 6 | **Riesgo, no promedio**: «con 13 personas terminás el turno de Hot Sale 95 de cada 100 días» | Las herramientas para no expertos dan un número | Comparación con datos de un pico real (cuando haya un usuario dispuesto) |
| 7 | **Gemelo de decisiones vivo** recalibrado con CSV y planillas; calibración inversa desde resultados observados | Los gemelos grandes piden sensores | Error de predicción semanal < 10% en un piloto |
| 8 | **Layouts generados y probados con tus pedidos** | No encontramos producto equivalente | Reproducir el resultado de la espina de pescado (a favor y en contra) con perfiles distintos |
| 9 | **Andén como herramienta de agentes** (MCP y WebMCP): el agente del usuario arma, corre y explica | Simio y AnyLogic lo abren para expertos y escritorio; nosotros, en el navegador y gratis de servidor | El modelo de referencia se arma desde Claude o Gemini sin intervención |
| 10 | **Foto del pizarrón → modelo**, en español, con verificación | Sketch2DES lo demostró en inglés y en laboratorio | 20 fotos reales; ≥ 80% de modelos correctos al primer intento |
| 11 | **Modo aula**: el modelo y la teoría (Little, Erlang C) lado a lado | Ayuda a cátedras (Andén Aula) | Una cátedra lo usa un cuatrimestre |
| 12 | **Flotas de AMR y AGV** con políticas aprendidas chicas (MAPF-GPT rinde con 2 M de parámetros) corriendo en el navegador | Hoy es terreno de Amazon e investigación | Para 2028+, si aparece demanda |

**Lo que no conviene perseguir** (INFERENCIA): física fotorrealista, sensores simulados y entrenamiento de robots (terreno de NVIDIA y
Siemens, con hardware que nuestros usuarios no tienen); un LLM local como requisito; RL de caja negra como producto principal (sin
despliegues probados y difícil de explicar).

---

## 9. Implicancias concretas para la arquitectura

1. **Esquema de modelo propio (fuente única).** JSON tipado y versionado: entidades, llegadas (con forma y fuente), estaciones,
   recursos, turnos, reglas, fallas, costos. Todo lo demás (entrevista, foto, plantilla, edición manual, agente externo) escribe ahí.
   Es la lección de Sketch2DES y de los fracasos del código libre.
2. **Motor determinista en TypeScript dentro de Web Workers** (Rust → WebAssembly si hace falta más velocidad), con semillas, números
   aleatorios comunes y salida de trazas de eventos. Nada de Python en el navegador para el núcleo (66 veces más lento medido).
3. **Verificador** que corre siempre (§4.3) y bloquea resultados si un control falla.
4. **Experimentador y optimizador** sobre el motor: diseño de experimentos, optimización bayesiana o evolutiva con multi-fidelidad, y
   evolución de reglas con LLM (semilla + evaluador). La optimización pesada, en el navegador; el LLM, en la nube o con la cuenta del
   usuario.
5. **Explicador calculado** (descomposición, período activo, contrafactuales, costo) y un narrador LLM que solo cita experimentos.
6. **Visual separado del motor:** el motor corre sin dibujar (rápido); la vista 2D o 3D reproduce trazas. Así el teléfono sirve.
7. **Puertas para agentes:** servidor MCP y, cuando madure, WebMCP. Diseñarlo desde el día uno cuesta poco y abre una vidriera nueva.
8. **Evaluación continua de la IA:** banco de casos con solución conocida (colas, hubs, cross-docks) para medir cada cambio de
   modelo de lenguaje y elegir el más barato que pasa (Haiku vs Sonnet).

**Riesgos** (INFERENCIA): AnyLogic ya combina IA y navegador, y puede bajar precios o lanzar un plan gratis amplio (su edición personal
ya es gratis con límites); las cifras de casos de éxito son autoinformadas; la IA puede equivocarse con confianza (mitigación:
verificación y supuestos visibles); WebGPU y WebMCP pueden cambiar.

---

## 10. Lo que no encontramos o queda abierto

- Si FlexSim 2026 incluye IA generativa (notas de versión inaccesibles, 403).
- Edición, límites y precio del asistente de AnyLogic, y si AnyLogic Online calcula en el navegador o en la nube.
- Porcentaje de dispositivos con WebGPU en Argentina y rendimiento real de nuestro motor en teléfonos Android de gama media (medirlo con
  la prueba de `medicion-motor/` en 3 teléfonos).
- Benchmarks públicos de LLM para modelos logísticos (no de colas genéricas): habría que armar el propio.
- Despliegues reales de RL en picking o batching con resultados medidos.
- Implementaciones de simulación de eventos discretos en WebGPU.

---

## Fuentes (todas consultadas el 17-10-2026)

**Del texto, la imagen o el PDF al modelo**
- Monks y otros, Sketch2DES, arXiv 2607.24259 — https://arxiv.org/abs/2607.24259 y https://arxiv.org/html/2607.24259
- Chen y otros, SimLLM, arXiv 2601.06543 — https://arxiv.org/abs/2601.06543
- Chen y otros, DEVS, arXiv 2603.03784 — https://arxiv.org/abs/2603.03784
- Fachada y otros, ODD, arXiv 2602.10140 — https://arxiv.org/abs/2602.10140
- Kreikemeyer y otros, arXiv 2503.01675 — https://arxiv.org/pdf/2503.01675
- SIMCODE (vía buscador) — https://alphaxiv.org/benchmarks/queens-university/simcode
- SimBench, arXiv 2408.11987 — https://arxiv.org/pdf/2408.11987
- Revista Ingeniería Investigación y Tecnología (UNAM), v27n1-04 — https://www.revistaingenieria.unam.mx/numeros/v27n1-04.php
- LLM para modelos de agentes (revisión), arXiv 2507.05723 — https://arxiv.org/pdf/2507.05723
- AnyLogic 8.9.10 — https://www.anylogic.com/blog/anylogic-8-9-10-boost-productivity-with-the-new-ai-assistant/
- AnyLogic Online — https://www.anylogic.com/blog/welcome-to-anylogic-online-another-way-to-build-and-use-simulations/
- AnyLogic, sesión IISE 2026 — https://iise.secure-platform.com/annual2026/solicitations/102014/sessiongallery/95947
- Siemens Copilot 2606 — https://blogs.sw.siemens.com/tecnomatix/ai-for-discrete-event-simulation-how-plant-simulation-x-copilot-accelerates-simtalk-programming/
- Siemens Copilot (lanzamiento) — https://blogs.sw.siemens.com/tecnomatix/introducing-the-ai-powered-copilot-for-siemens-plant-simulation-software/
- Simio MCP (Business Wire) — https://www.financialcontent.com/article/bizwire-2026-9-23-aegis-software-introduces-ai-powered-interaction-for-process-simulation-and-planning-in-simio
- Autodesk compra FlexSim — https://www.cimdata.com/en/industry-summary-articles/item/23014-autodesk-signs-definitive-agreement-to-acquire-flexsim
- FlexSim 2026 disponible (403, vía buscador) — https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-2026-available/ta-p/13938844
- FlexSim RL, WSC 2022 — https://www.informs-sim.org/wsc22papers/370.pdf
- Cierre de Bonsai (prensa) — https://redmondmag.com/articles/2023/02/10/microsoft-reportedly-cuts-industrial-metaverse-team.aspx
- Text2Sim MCP — https://github.com/IamCatoBot/text2sim-MCP-server
- FloorplanVLM, arXiv 2602.06507 — https://arxiv.org/abs/2602.06507 ; Raster2Seq, arXiv 2602.09016 — https://arxiv.org/abs/2602.09016
- Gaussian splatting (guías 2026) — https://www.utsubo.com/blog/gaussian-splatting-guide ; https://www.thefuture3d.com/blog/state-of-gaussian-splatting-2026/

**Gemelos digitales**
- NVIDIA Mega — https://blogs.nvidia.com/blog/mega-omniverse-blueprint
- KION en GTC 2026 — https://www.kiongroup.com/en/News-Stories/Press-Releases/Press-Releases-Detail.html?id=2954666
- Siemens Digital Twin Composer — https://news.siemens.com/en-us/digital-twin-composer-ces-2026
- Amazon, un millón de robots y DeepFleet — https://www.aboutamazon.com/news/operations/amazon-million-robots-ai-foundation-model
- DeepFleet, arXiv 2508.08574 — https://arxiv.org/abs/2508.08574 ; https://www.amazon.science/blog/amazon-builds-first-foundation-model-for-multirobot-coordination
- Omniverse, casos de depósitos — https://docs.omniverse.nvidia.com/digital-twins/latest/warehouse-digital-twins/use-cases.html
- Dexory — https://siliconangle.com/2025/10/14/dexory-secures-165m-transform-warehouse-intelligence-towering-ai-robots/ ; https://www.freightwaves.com/news/dexory-secures-165m-to-accelerate-ai-driven-warehouse-intelligence
- Isaac Sim 6.0.1, requisitos — https://docs.isaacsim.omniverse.nvidia.com/6.0.1/installation/requirements.html
- Simod — https://simod.readthedocs.io
- Sequential Neural Likelihood (M/G/1), arXiv 1805.07226 — https://arxiv.org/abs/1805.07226

**Optimización**
- FM Logistic con AlphaEvolve (26-03-2026) — https://cloud.google.com/blog/products/ai-machine-learning/how-fm-logistic-tackled-the-traveling-salesman-problem-at-warehouse-scale-with-alphaevolve
- AlphaEvolve disponible para todos (09-07-2026) — https://cloud.google.com/blog/products/ai-machine-learning/alphaevolve-is-available-for-everyone
- ShinkaEvolve, arXiv 2509.19349 — https://arxiv.org/abs/2509.19349 ; https://sakana.ai/shinka-evolve/
- LLM y trazas de simulación, arXiv 2608.09343 — https://arxiv.org/abs/2608.09343
- MAPF-GPT, arXiv 2409.00134 — https://arxiv.org/abs/2409.00134
- SILLM, arXiv 2410.21415 — https://arxiv.org/abs/2410.21415
- League of Robot Runners 2023, arXiv 2404.16162 — https://arxiv.org/abs/2404.16162
- PPO asignación + AGV (vía buscador) — https://doaj.org/article/8b217e8a8a2848eaaadb9eefd96b2dba
- DRL + ALNS, arXiv 2506.02746 — https://arxiv.org/abs/2506.02746v1
- OptQuest — https://en.wikipedia.org/wiki/OptQuest
- BoTorch (NeurIPS 2020) — https://neurips.cc/virtual/2020/poster/17263 ; BO con DES (Osnabrück) — https://opus.hs-osnabrueck.de/frontdoor/index/index/year/2020/docId/1564
- NVIDIA cuOpt — https://www.nvidia.com/en-us/ai-data-science/products/cuopt/ ; https://blogs.nvidia.com/blog/cuopt-world-record-route
- HiGHS para JavaScript — https://www.npmjs.com/package/highs ; VRP en Rust/WebAssembly (vía buscador) — https://github.com/reinterpretcat/vrp
- ORLM, arXiv 2405.17743 — https://arxiv.org/abs/2405.17743 ; MIPLIB-NL, arXiv 2602.10450 — https://arxiv.org/pdf/2602.10450
- Metamodelos con grafos, arXiv 2607.16769 — https://arxiv.org/html/2607.16769
- DES en GPU: Kunz y otros 2012 — https://schemmel-net.statichost.eu/publication/2012-gpgpu-simulation ; Sang y otros 2019 — https://www.doi.org/10.1007/S11227-018-2254-4
- Pyodide (Mozilla, 2019) — https://hacks.mozilla.org/2019/04/pyodide-bringing-the-scientific-python-stack-to-the-browser

**Explicación y layouts**
- Grafo de conocimiento + LLM, arXiv 2507.17273 — https://arxiv.org/abs/2507.17273
- Método del período activo, WSC 2002 — https://informs-sim.org/wsc02papers/146.pdf ; https://pypi.org/project/active-period-method/
- Resimulación contrafactual, IJCAI 2018 — https://www.ijcai.org/proceedings/2018/260
- Layouts de depósito, arXiv 2407.08633 — https://arxiv.org/abs/2407.08633
- Planos con LLM y RL verificable, arXiv 2605.14117 — https://arxiv.org/pdf/2605.14117
- Espina de pescado — https://news.uark.edu/articles/9830/fishbone-aisles-appear-to-speed-distribution ; https://etd.auburn.edu/handle/10415/5761
- AnyLogic, layouts — https://www.anylogic.com/blog/facility-layout-planning-simulate-before-you-build/

**Navegador e IA**
- WebGPU en los navegadores principales (25-11-2025) — https://web.dev/blog/webgpu-supported-major-browsers
- three.js WebGPURenderer — https://threejs.org/manual/en/webgpurenderer.html
- Prompt API de Chrome (actualizada 26-08-2026) — https://developer.chrome.com/docs/ai/prompt-api
- WebLLM, arXiv 2412.15803 — https://arxiv.org/abs/2412.15803 ; https://arxiv.org/html/2412.15803v2
- WebMCP, intención de experimento (vía buscador) — https://groups.google.com/a/chromium.org/g/blink-dev/c/gmYffo5WOE8/m/OJxuQRP3AAAJ
- Precios de Claude (tabla en caché del 06-10-2026; re-verificar) — https://platform.claude.com/docs/en/about-claude/pricing

**Medición propia**
- Scripts y resultados: `conocimiento/anden-simulador-2026-10/medicion-motor/` (des.js, des2.js, par.js, des_simpy.py), 17-10-2026.
