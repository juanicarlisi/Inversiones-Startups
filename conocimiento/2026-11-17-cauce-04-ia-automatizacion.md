# Frente 04 — IA aplicada a procesos y diagramas, automatización, agentes y lo emergente

**Fecha de corte:** 17-11-2026. **Autor:** explorador de tecnología emergente (Claude).
**Convención:** **HECHO** = con fuente y fecha de consulta (todas las consultas son del 17-11-2026 salvo aclaración).
**ESTIMACIÓN** = con método. **INFERENCIA** = razonamiento propio. Casi todo lo de proveedores sale de su propio
marketing o de prensa del sector: lo marco como "dicho por el proveedor" cuando no hay verificación independiente.

---

## 0. Resumen en una pantalla

1. **Generar un diagrama desde texto ya es commodity.** SAP Signavio, Lucid, Miro, Camunda, ARIS, Appian, Pega, Creately,
   Zapier Canvas, draw.io vía MCP y cualquier chat (ChatGPT/Claude con Mermaid) lo hacen. No es diferencial.
2. **Lo que todavía no está resuelto es la calidad y la validez.** La literatura 2024-2026 coincide: los LLM son buenos en
   sintaxis y "pragmática" (que se lea bien) y flojos en **semántica** (que el proceso sea el correcto) y en **validez**
   (XML BPMN que respete el estándar). La técnica que funciona: **modelo intermedio (JSON/POWL) + validación + layout
   automático**, nunca XML directo.
3. **El mercado grande se movió a "orquestación agéntica"**: BPMN como columna vertebral auditable con agentes de IA como
   participantes (Camunda, UiPath Maestro, Pega Agentic Process Fabric, ServiceNow AI Control Tower, Celonis vía MCP).
   Gartner publicó su primer *Hype Cycle for Agentic Automation* (07-07-2026).
4. **El puente "dibujar → automatizar" directo fracasó en su versión ingenua**: Microsoft eliminó el 14-07-2026 la
   exportación de BPMN de Visio a flujos de Power Automate. Lo que sobrevive es "diagrama → borrador asistido por IA en
   la herramienta de ejecución" (Zapier Canvas → Zap borrador) o "BPMN ejecutable en un motor" (Camunda/Operaton).
5. **MCP y MCP Apps son el canal de distribución nuevo**: draw.io, Lucid, Miro y Celonis ya tienen servidor MCP; MCP Apps
   (extensión oficial, estable desde 26-01-2026) permite mostrar UI interactiva dentro de ChatGPT y Claude.
6. **Costo de IA: chico si se diseña bien.** Generar un diagrama típico cuesta ~USD 0,004 con un modelo chico y ~USD 0,07
   con uno mediano (ESTIMACIÓN abajo). El margen se destruye solo con agentes sin cuota o con modelos tope para todo.
7. **Espacio libre real** (existe poco o nada integrado, en una herramienta accesible para pymes de habla hispana):
   diff semántico entre versiones, "¿qué pasa si cambio esto?" explicado y simulado, detección de controles faltantes
   sobre el modelo, proceso → manual normativo + capacitación + quiz, relevamiento por voz/WhatsApp, y "3 rediseños
   simulados". Los grandes tienen piezas sueltas y caras; nadie las junta para el segmento chico.

---

## 1. Estado del arte: qué hace de verdad cada uno

### 1.1 Pizarras y diagramadores generalistas

| Producto | Qué hace con IA (verificado) | Fuente y fecha |
|---|---|---|
| **Miro** | Ene-2026: *AI Workflows/Flows* para enterprise. May-2026 (Canvas 26): Flows generan frames, tablas, diagramas y widgets desde un prompt; **Sidekicks "agénticos" en beta privada con lista de espera**; el canvas es "legible y escribible" por agentes de terceros con **MCP ampliado** y formatos Mermaid/Markdown/HTML; conectores nativos dentro de ChatGPT, Claude y Microsoft Copilot. | HECHO: [miro.com/newsroom (12-01-2026)](https://miro.com/newsroom/miro-launches-ai-workflows/), [miro.com/newsroom (19-05-2026)](https://miro.com/it/newsroom/miro-takes-aim-at-the-gap-between-ai-potential-and-organizational-reality), [blog may-2026](https://miro.com/blog/whats-new-may-2026/) |
| **Lucid** | *Process Agent* en el panel de chat: genera diagrama + marco de contexto, resumen y descripción; puede **revisar un diagrama y dejar comentarios de mejora**. *Process Capture*: grabás la pantalla y genera diagrama editable + SOP escrito (anunciado "coming soon", luego descripto como disponible). Importa PNG/JPG y lo reconstruye como formas editables (ago-2026). **Servidor MCP** que, según Lucid (oct-2026), genera BPMN "compliant" con gateways, eventos y carriles, y Mermaid. | HECHO (dicho por el proveedor): [Lucid may-2026](https://lucid.co/blog/lately-at-lucid-may-2026), [Lucid oct-2026](https://lucid.co/blog/lately-at-lucid-october-2026), [comunidad Lucid MCP](https://community.lucid.co/community-news-and-announcements-9/new-capabilities-for-the-lucid-mcp-server-generate-mermaid-diagrams-timelines-and-link-data-with-ai-14121), [imagen→diagrama](https://community.lucid.co/community-news-and-announcements-9/reconstruct-and-convert-images-into-editable-lucid-diagrams-with-lucid-ai-13819) |
| **Eraser (DiagramGPT)** | Diagramas técnicos (arquitectura, ERD, secuencia) desde lenguaje natural o código; usa modelos de OpenAI. | HECHO: [eraser.io/diagramgpt](https://www.eraser.io/diagramgpt-new) |
| **Napkin.ai** | Texto → visuales estáticos para presentaciones/documentos. No es modelado de procesos. | HECHO (reseñas): [dupple.com](https://dupple.com/learn/best-ai-diagram-tools) |
| **Whimsical / FigJam** | Generación de flowcharts y wireframes con IA, por créditos. No encontré detalle 2026 específico de FigJam. | HECHO parcial: [dupple.com](https://dupple.com/learn/best-ai-diagram-tools). Hueco: no verificado en fuente primaria. |
| **Mermaid Chart** | Generación de Mermaid asistida por IA + colaboración. Precios en conflicto entre fuentes (Plus USD 10/usuario/mes según una, Team USD 20 según otra). | HECHO con conflicto: [toolradar](https://toolradar.com/tools/mermaid/pricing) |
| **Creately** | Descripción → flowchart; la propia guía dice "tratalo como primer borrador". | HECHO: [creately.com/guides/ai-diagrams](https://creately.com/guides/ai-diagrams) |
| **draw.io (jgraph)** | **Servidor MCP oficial, Apache-2.0**: un "MCP App Server" que renderiza diagramas interactivos dentro del chat (hosteado en mcp.draw.io o autohosteable) y un "Tool Server" (`npx @drawio/mcp`) que abre en el editor; acepta XML, CSV y Mermaid. | HECHO: [github.com/jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp) |
| **Microsoft Visio** | No encontré Copilot que genere diagramas en Visio; usuarios lo piden en el foro oficial sin respuesta. | HECHO (ausencia, no concluyente): [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5633217/is-there-anything-on-the-visio-roadmap-that-is-con) |

**INFERENCIA:** en pizarras, la IA ya es "texto/imagen → diagrama" + "agente que edita el canvas". La pelea de 2026 es
**ser el canvas que los agentes externos usan** (Miro y Lucid abriendo MCP), no tener el mejor generador propio.

### 1.2 Suites de gestión de procesos (BPM / process intelligence)

| Producto | Qué hace con IA (verificado) | Fuente |
|---|---|---|
| **SAP Signavio + Joule** | Texto → BPMN (anunciado mar-2025); feb-2026 mejora gateways, flujo y asignación de unidades; **Joule GA en Signavio (feb-2026)** para pedidos en lenguaje natural; según CX Today, imagen y tabla → proceso hacia jun/jul. Límite separado de **850 consultas/mes** para el Process Analyzer con IA. SAP dice "50 % menos tiempo de modelado" sin metodología. | HECHO: [SAP text-to-process](https://www.sap.com/hungary/products/business-transformation-management/signavio-solutions-process-modeler-text-to-process.html), [Signavio feb-2026](https://www.signavio.com/post/february-2026-product-release-update/), [news.sap.com feb-2026](https://news.sap.com/2026/02/process-conversation-joule-sap-signavio-solutions-generally-available/), [CX Today](https://www.cxtoday.com/customer-engagement-journey-orchestration/sap-signavio-process-mining/) |
| **ARIS (Software AG)** | *AI Companion*: notas, SOP y documentación (varios archivos) → modelo, respetando métodos y atributos propios; reutiliza objetos ya validados del repositorio; chat de Portal para no modeladores que **solo responde con contenido ARIS** "para evitar alucinaciones" (10.2026.4 SaaS). ARIS marca sus funciones de IA como piloto/experimentales. Nedbank reporta −67 % de esfuerzo (cifra de cliente). | HECHO: [ARIS community 24-06-2026](https://ariscommunity.com/users/sabine-steffensky/2026-06-24-what%E2%80%99s-new-aris-ai-companion-your-process-knowledge-activated), [aris.com/aris-ai-companion](https://aris.com/aris-ai-companion) |
| **Bizagi** | No encontré un "Ally" que genere procesos desde documentos. Su IA visible es Copilot para *prompts* de agentes, AI Agents, AI Workers y "Ask Ada". Modeler sigue gratis. | HECHO (ausencia, no concluyente): [bizagi.com/ai-agents](https://bizagi.com/en/platform/ai-agents), [help.bizagi.com](https://help.bizagi.com/platform/en/bizagi-ai-approach.htm) |
| **Celonis** | Primer **servidor MCP de "process intelligence"** (Celosphere, nov-2025): expone datos y herramientas de process mining a agentes de terceros (Copilot Studio, Bedrock, Claude Desktop). Integración con Databricks. | HECHO: [developer.celonis.com MCP](https://developer.celonis.com/mcp-server-asset/overview/), [Celonis press](https://www.celonis.com/news/press/global-enterprises-unlock-billions-building-composable-ai-solutions-with-celonis) |
| **ServiceNow** | *AI Workflow Factory*: Process Mining → construir workflow → App Engine; *AI Control Tower* gobierna agentes propios y de terceros (*Action Fabric*); *AI Lens* reconoce formas BPMN en una imagen y las convierte en diagrama editable (docs may-2026). | HECHO: [techstrong.ai](https://techstrong.ai/articles/servicenow-debuts-ai-workflow-factory-for-enterprise-automation/), [ServiceNow newsroom 2026](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-launches-the-real-time-data-foundation-that-puts-autonomous-AI-to-work-across-the-enterprise/default.aspx), [docs AI Lens](https://www.servicenow.com/docs/r/application-portfolio-management/enterprise-architecture/eaw-bpm-diagram-from-image.html) |
| **IBM Blueworks Live** | Imagen (flowchart, foto de pizarra) → BPMN. | HECHO: [ibm.com docs](https://www.ibm.com/docs/en/SS2MKC/com.ibm.bwl.doc/Help/topics/iq_create_diagram_img.html) |
| **Microsoft (Power Platform)** | Copilot en el diseñador de Power Automate (ola 1 de 2026); Copilot en Process Mining (análisis GA may-2025); minería centrada en objetos (OCPM). **Eliminó la exportación BPMN Visio → Power Automate el 14-07-2026.** | HECHO: [Collab365](https://spaces.collab365.com/posts/microsoft-removes-visio-export-into-power-automate-p1_eHt), [MC1061019](https://mc.merill.net/message/MC1061019), [Futurum](https://futurumgroup.com/insights/is-workflow-ai-now-native-after-microsoft-embeds-copilot-in-power-platform/) |

### 1.3 Plataformas que generan *aplicaciones* desde lenguaje natural

**Pega Blueprint (a fondo).**
- HECHO: lanzado como *Pega GenAI Blueprint* (feb-2024); toma una descripción en lenguaje natural de una app y genera
  **tipos de caso (case types), etapas, pasos, campos de datos, personas e integraciones** combinando IA con "mejores
  prácticas" de Pega; el diseño se **importa a App Studio** y se convierte en app. Pega lo posiciona como "diseño de
  workflow y decisiones, no generación de código". [BusinessWire 12-02-2024](https://www.businesswire.com/news/home/20240212674025/en),
  [Futurum](https://futurumgroup.com/insights/pegasystems-blueprint-for-fast-tracking-app-and-workflow-dev).
- HECHO: en 2025 sumó **análisis de legado**: subís código fuente, capturas, documentos (y, según un resumen de Pega,
  videos, diagramas de proceso, archivos de datos e integración) y un agente arma un borrador de workflow moderno;
  ene-2026 lanzó la importación de **Lotus Notes**; el folleto de jun-2026 dice que sus agentes **analizan archivos BPMN**.
  [BusinessWire 20-01-2026](https://www.businesswire.com/news/home/20260120680821/en/Pega-Launches-New-AI-Tool-to-Accelerate-Lotus-Notes-Transformation),
  [ComputerWeekly](https://www.computerweekly.com/news/366625045/Interview-Pegas-Blueprint-for-breaking-the-curse-of-legacy-IT),
  [Pega PDF](https://www.pega.com/system/files/resources/pdf/pega-break-freee-from-legacy.pdf).
- HECHO: Blueprint es **SaaS gratuito**, sin entorno de Pega (según reseña de Kissflow actualizada oct-2026, competidor;
  tomar con pinzas). [kissflow.com](https://kissflow.com/alternatives/pega-genai-blueprint-review/).
- HECHO: *Pega Agentic Process Fabric* (PegaWorld 2025) coordina agentes, sistemas y datos, sean o no de Pega.
  [Constellation Research](https://www.constellationr.com/insights/news/pegasystems-launches-pega-agentic-process-fabric-rides-ai-momentum).
- **INFERENCIA (lección clave):** Blueprint es el ejemplo más claro de **"diagrama gratis como embudo hacia la
  plataforma de ejecución paga"**. Su modelo intermedio no es BPMN sino el *case model* de Pega (etapas → pasos → datos),
  que es mucho más fácil de validar y ejecutar. Para nosotros: **el diseño gratuito y bueno es marketing; la plata está
  en ejecutar, medir y mantener**. Y un modelo de "caso" (etapas/pasos/datos/roles) es mejor objeto intermedio que BPMN
  crudo para generar apps.

**Appian Composer.** HECHO: arma un *plan de aplicación* desde documentos de requisitos, diagramas, imágenes (incluida
**foto de pizarra**) y exportaciones de legado; en 26.10 crea y actualiza *process models* desde la descripción; limitado
a tiers avanzados con cuotas de uso. Un post de la comunidad (16-02-2026) reporta "Generate Process" que no generaba nada.
[docs.appian.com 26.7](https://docs.appian.com/suite/help/26.7/generate-a-plan.html),
[docs 26.10](https://docs.appian.com/suite/help/26.10/dev-agent-process-models.html),
[comunidad Appian](https://community.appian.com/ai-and-agentic-automation-5/process-generation-not-working-appian-composer-15279).

### 1.4 Orquestación agéntica (BPMN + agentes)

- **Camunda.** HECHO: 8.7 (abr-2025) "agentic orchestration"; 8.8 suma *agentic BPMN* con **sub-procesos ad hoc** donde
  un agente elige qué tareas activar, todo auditable; **Camunda Copilot** genera BPMN desde lenguaje natural y convierte
  código legado o modelos no BPMN a BPMN; **FEEL Copilot** escribe y corrige expresiones de decisión; 8.9 (abr-2026)
  "une lógica determinística BPMN con puntos de decisión dinámicos". [Camunda blog oct-2025](https://camunda.com/blog/2025/10/enterprise-grade-agentic-automation-is-here/),
  [Camunda 8.7](https://camunda.com/blog/2025/04/camunda-87-agentic-orchestration-for-enterprise/).
- **UiPath Maestro.** HECHO: BPMN 2.0 extendido con tareas de robots, agentes y sub-procesos, decisiones en DMN;
  *Maestro Flow* (más nuevo, "developer-first", expuesto a Claude Code, Cursor y Copilot) corre en el mismo motor y se
  llama con BPMN; *Case Management* para trabajo largo y lleno de excepciones. [uipath.com/product/maestro](https://www.uipath.com/product/maestro),
  [iTWire](https://itwire.com/business-it-news/business-software/uipath-hands-the-orchestration-canvas-to-claude-code-cursor-and-copilot-with-maestro-flow).
- **Gartner.** HECHO: *Hype Cycle for Agentic Automation, 2026* publicado el 07-07-2026 (primera edición, sucede al de
  Enterprise Process Automation); temas: orquestación, agentes, *process insights*. Según Kissflow, predice que el 60 %
  de las organizaciones adoptará plataformas de orquestación de agentes de proveedores **ajenos a sus sistemas de
  registro** para 2030 (dato de segunda mano). Gartner también advierte del *agent washing* y publicó (07-10-2026) "AI
  Agents Are Not an Automation Strategy". [gartner.com/documents/8107197](https://www.gartner.com/en/documents/8107197),
  [kissflow.com](https://kissflow.com/no-code/gartner-hype-cycle-agentic-automation/), [gartner.com/documents/8483745](https://www.gartner.com/en/documents/8483745).

**INFERENCIA:** el consenso de 2026 es "**determinismo donde se puede, agente donde hace falta, todo dentro de un proceso
auditado**". BPMN vuelve a ser relevante como lenguaje de gobierno de agentes, no como dibujo.

### 1.5 ¿Qué tan bien generan procesos los LLM? (investigación 2024-2026)

| Trabajo | Hallazgo | Fuente |
|---|---|---|
| **ProMoAI** (Kourani, Berti, Schuster, van der Aalst, 2024) | El LLM **no escribe BPMN**: escribe código Python que llama funciones predefinidas que construyen un modelo **POWL** (correcto por construcción); después se exporta a BPMN o red de Petri. Corrige errores con bucle de retroalimentación. | HECHO: [arXiv 2403.04327](https://arxiv.org/html/2403.04327v2) |
| **Benchmark de modelado** (Kourani et al., arXiv 2412.00023) | 20 procesos con modelo de referencia y log simulado; **16 LLM** evaluados. Correlación positiva entre buen manejo de errores y calidad; la **optimización de la salida** (auto-mejora) ayuda sobre todo a modelos flojos. El abstract no da el ranking. | HECHO: [arXiv 2412.00023](https://arxiv.org/abs/2412.00023) |
| **RL para POWL** (Berti, Wang, Kourani, van der Aalst, *Process Science* 2025) | Ajuste por refuerzo (GRPO) con recompensas verificables (chequeos estructurales y "huellas" de comportamiento): un modelo abierto chico se acerca a GPT-4o con **menos generaciones inválidas**. Seguimiento jul-2026 (arXiv 2607.06175) con Llama 3.1 8B y Qwen 2.5 14B y 48 configuraciones de recompensa. | HECHO: [Process Excellence Network](https://www.processexcellencenetwork.com/business-process-management-bpm/news/reinforcement-learning-specializes-llms-for-process-modeling), [arXiv 2607.06175](https://arxiv.org/abs/2607.06175) |
| **BPMN Assistant** (arXiv 2509.24592, rev. ene-2026) | Representación intermedia **JSON** vs. **XML BPMN directo** con GPT-5.1, Claude 4.5 Sonnet y DeepSeek V3: JSON da éxito igual o mayor en edición, **~43 % menos latencia y >75 % menos tokens de salida**, a cambio de más contexto de entrada. | HECHO: [arXiv 2509.24592](https://arxiv.org/abs/2509.24592) |
| **BEF4LLM** (Lauer et al., *Information Systems* 142, 2026) | 39 métricas; LLM abiertos vs. modeladores humanos: LLM **excelentes en calidad sintáctica y pragmática**, humanos mejores en **semántica**; diferencias modestas; **validez XML** sigue siendo un desafío. | HECHO: [arXiv 2601.21787](https://arxiv.org/abs/2601.21787) |
| **"Do LLMs Speak BPMN?"** (Drakopoulos et al., *Computation* 14(1), 2026) | 5 herramientas texto→BPMN (incl. BPMN-Chatbot de Klagenfurt): capturan lo principal pero con **pasos faltantes, lógica inconsistente y violaciones de reglas**. Exploratorio. | HECHO: [DOAJ](https://doaj.org/article/c069a771222d4faea99bbfb2eddeb04a) |
| **PM-LLM-Benchmark** (Berti, Kourani, van der Aalst, ICPM 2024/LNBIP 2025) | 78 prompts en 7 categorías de process mining: modelos comerciales y abiertos grandes rinden "satisfactoriamente"; los **muy chicos no**; v2.0 (2025) para modelos de razonamiento. | HECHO: [arXiv 2407.13244](https://arxiv.org/abs/2407.13244) |
| **Flowchart2Mermaid** (EACL 2026 demo) | Modelo visión-lenguaje: imagen de flowchart → código Mermaid editable. | HECHO: [arXiv 2512.02170](https://arxiv.org/abs/2512.02170v2) |

**Qué técnica funciona (síntesis, INFERENCIA apoyada en lo anterior):**
1. **Nunca pedir XML BPMN directo.** Pedir un **modelo intermedio estructurado** (JSON con esquema estricto o llamadas a
   funciones tipo POWL) usando *structured outputs* / herramientas con `strict: true`. El esquema ya prohíbe gran parte de
   los errores.
2. **Validar con código, no con el LLM**: chequeos de esquema, conectividad, un solo inicio, fines alcanzables, gateways
   balanceados, sin *deadlocks* (sobre POWL/red de Petri es formal y barato), roles existentes.
3. **Bucle de reparación**: errores del validador → de vuelta al modelo (la "optimización de salida" de Kourani).
4. **Layout automático determinístico** (ELK/elkjs, dagre) — el LLM nunca debe ubicar coordenadas.
5. **Serializar** a BPMN 2.0 XML con una librería (bpmn-moddle) para exportar e interoperar.
6. **Humano en el bucle para la semántica**: la IA explica sus supuestos ("asumí que el paso X lo hace Compras") y
   pregunta lo que falta. La semántica es donde los humanos todavía ganan (BEF4LLM).

---

## 2. Documento → proceso

| Fuente de entrada | Quién lo hace hoy (verificado) | Madurez (INFERENCIA) |
|---|---|---|
| Texto/procedimiento escrito | Signavio, ARIS (varios archivos), Lucid, Camunda Copilot, Appian, Pega, ADONIS (SOP → modelo, extrayendo primero una descripción) | Alta como borrador; semántica a revisar |
| PDF/Word de manuales | ARIS, Appian (Word/PDF), Pega Blueprint, ADONIS ([docs BOC](https://docs.boc-group.com/adonis/pl/docs/18.0/user_manual/aid-000000/)) | Media-alta |
| Foto de pizarra / imagen | IBM Blueworks Live, ServiceNow AI Lens, Lucid, Appian, Sketch2Diagram (Confluence), Mida/MockFlow | Media; sin benchmarks independientes |
| Video de pantalla (task mining) | Lucid *Process Capture* (grabación → diagrama + SOP), Pega (videos de legado), Skan (agente de escritorio que observa clics y aplicaciones), Scribe Optimize, KYP.ai (SOP desde datos reales) | Media; mucho marketing |
| Grabación de pasos → SOP | Scribe, Tango (Tango agrega ramificaciones; según comparativas pivotó hacia automatización de navegador) | Alta para SOP lineal; baja para proceso con decisiones |
| Entrevistas por voz | **Sona8** (YC otoño 2026): agente de voz entrevista empleados, repregunta, arma "company brain"; **Oxagile Voiager** (mar-2026) | Temprana — señal débil importante |
| Notas de *walkthrough* de auditoría | **Deloitte ControlCatalyst.AI** (ago-2026): notas → flujos, matriz de riesgos y controles y pasos de prueba | Temprana, enterprise |
| Correos / tickets | Process mining clásico (Celonis, Microsoft, ServiceNow) sobre logs; no encontré producto masivo "bandeja de correo → diagrama" | Hueco |

Fuentes de la tabla: [Lucid](https://community.lucid.co/inspiration-5/generate-process-flows-quickly-with-lucid-ai-s-process-agent-13308),
[Bardeen task mining 2026](https://www.bardeen.ai/best/task-mining-tools), [Scribe](https://scribe.com/library/task-mining),
[Tango](https://www.tango.ai/blog/scribe-alternatives), [Fondo/Sona8](https://fondo.com/blog/sona8-uses-voice-agents-to-uncover-how-employees-actually-work),
[Oxagile](https://www.oxagile.com/voiager/), [Deloitte](https://www.deloitte.com/us/en/about/press-room/deloitte-announces-launch-of-controlcatalyst-ai.html),
[Atlassian Marketplace Sketch2Diagram](https://marketplace.atlassian.com/apps/994450088/sketch2diagram-ai-whiteboard-to-diagram).

**INFERENCIA:** el insumo más subexplotado para una pyme de habla hispana es **WhatsApp + audio**: es donde vive el
conocimiento operativo real en Argentina/LatAm. Un pipeline audio → transcripción → entrevista guiada → modelo intermedio
→ diagrama es técnicamente trivial hoy y no lo encontré ofrecido así por nadie.

---

## 3. Automatización: del dibujo a la ejecución

### 3.1 Licencias y encaje (lo que importa para construir encima)

| Herramienta | Licencia / condición (verificado) | ¿Se puede embeber en un SaaS propio? |
|---|---|---|
| **n8n** | *Sustainable Use License*: "uso o modificación solo para fines internos de negocio o no comerciales"; "distribuir o proveer a otros solo gratis y con fines no comerciales"; archivos `.ee` bajo licencia Enterprise. HECHO: [LICENSE.md](https://github.com/n8n-io/n8n/blob/master/LICENSE.md). Embed: contrato con ventas; una fuente japonesa da ~USD 50.000/año (no corroborado). | **No sin licencia Embed paga.** Sí exportar un JSON de flujo n8n que el cliente importa en su propio n8n (INFERENCIA: eso no distribuye n8n). |
| **Activepieces** | Comunidad **MIT** fuera de `packages/ee/` y `.../app/ee`; el SDK de Embed es comercial ("desde USD 36k/año" según una fuente); cada *piece* se expone por MCP. HECHO: [github.com/activepieces](https://github.com/activepieces/activepieces), [activepieces.com/mcp](https://www.activepieces.com/mcp/mcp) | Sí el núcleo MIT (autohosteado); el embebido "lindo" con SDK es pago. |
| **Zapier / Make** | Propietarios. Zapier Canvas: **seleccionás parte del diagrama y la IA genera un Zap borrador**; Zapier Agents y MCP (MCP con etiqueta Beta al 11-08-2026). Make: servidor MCP en planes pagos y cliente MCP. HECHO: [Zapier Canvas open beta](https://zapier.com/blog/zapier-canvas-open-beta-release), [automationatlas](https://automationatlas.io/guides/ai-agents-in-automation-2026/) | No; integración por API/MCP. |
| **Power Automate / Workato / Pipedream** | Propietarios. | Integración por API. |
| **Temporal** | Servidor **MIT** (ejecución durable, código primero). | Sí. |
| **Kestra** | **Apache 2.0** (YAML declarativo). | Sí. |
| **Windmill** | En disputa: mayormente AGPLv3 + partes Apache + código enterprise propietario. Verificar LICENSE. | Con cuidado (AGPL). |
| **Node-RED** | Apache 2.0 (conocido; no re-verificado hoy). | Sí. |
| **Camunda 8** | Desde 8.6, **Self-Managed requiere licencia para producción**. Camunda 7 CE: última versión 7.24 (14-10-2025), sin parches. HECHO: [forum.camunda.io](https://forum.camunda.io/t/camunda-7-community-edition-end-of-life/48995), [Camunda 8.6 notes](https://docs.camunda.io/docs/8.7/reference/announcements-release-notes/860/860-announcements) | No gratis en producción. |
| **Operaton** | Fork de Camunda 7 CE, **Apache 2.0**, comunitario; 2.x sobre Spring Boot 4; versiones/fechas en conflicto entre fuentes (2.1.5 del 18-09-2026 según una). HECHO: [github.com/operaton](https://github.com/operaton/operaton), [wz-it.com](https://wz-it.com/en/blog/camunda-7-end-of-life-operaton-cibseven-fluxnova-compared/). También **CIB seven** (fork permanente). | Sí (Java). |
| **Flowable** | Open source Apache 2.0 en su núcleo (conocido; no re-verificado hoy). | Sí (Java). |
| **bpmn-engine (paed01)** | **MIT**, Node.js, sobre bpmn-moddle; ~950 descargas semanales; última versión vista 25.0.0 (mar-2025). HECHO: [npm](https://npmjs.com/package/bpmn-engine), [Snyk](https://dev.snyk.io/advisor/npm-package/bpmn-engine) | Sí, pero proyecto chico (riesgo de mantenimiento). |

### 3.2 ¿Puede un diagrama "ejecutarse"?

- **Sí, si es BPMN ejecutable** (con tipos de tarea, datos, expresiones, eventos de timer/mensaje) en un motor
  (Camunda, Operaton, Flowable, bpmn-engine). Pero un diagrama "de relevamiento" casi nunca es ejecutable: le faltan
  datos, condiciones y conectores. **INFERENCIA:** el 80 % del trabajo está en completar eso, no en dibujar.
- **Señal fuerte de que el puente ingenuo no funciona:** Microsoft eliminó el 14-07-2026 la exportación de BPMN de Visio
  a flujos de Power Automate y recomienda Copilot + plantillas en el diseñador. HECHO: [Collab365](https://spaces.collab365.com/posts/microsoft-removes-visio-export-into-power-automate-p1_eHt).

**Puente realista (INFERENCIA, de menor a mayor ambición):**
1. **Proceso → "plan de automatización"**: la IA marca qué pasos son automatizables, con qué conector, ahorro estimado
   (KYP.ai hace algo parecido con puntaje y ROI).
2. **Proceso → borrador en la herramienta del cliente**: exportar fragmentos como **JSON de n8n**, flujo de Activepieces,
   Zap o Make scenario (vía API/MCP). Lo ejecuta el cliente en su herramienta; nosotros no cargamos con la ejecución ni
   con la licencia.
3. **Proceso → agente**: el proceso se compila a **instrucciones operativas** (SOP estructurado + herramientas
   permitidas + puntos de aprobación humana) para un agente (Claude/OpenAI/MCP). Ver §4.3.
4. **Proceso → BPMN ejecutable** en Operaton/Camunda/bpmn-engine para clientes que ya tienen motor. Nicho técnico.

---

## 4. Agentes y MCP

### 4.1 MCP como canal

- HECHO: servidores MCP de diagramas/proceso existentes: **draw.io (oficial, Apache-2.0, con MCP App interactiva)**,
  **Lucid** (BPMN y Mermaid desde Claude), **Miro** (canvas legible/escribible por agentes), **Celonis** (process
  intelligence), **Activepieces** (todas sus *pieces*), **Make** y **Zapier** (beta). Fuentes en §1 y §3.
- HECHO: **MCP Apps** (`io.modelcontextprotocol/ui`), primera extensión oficial de MCP, versión **2026-01-26 estable**;
  nació de SEP-1865 fusionando MCP-UI y el Apps SDK de OpenAI; UI en iframes aislados que hablan JSON-RPC con el host;
  según trackers de terceros (28-10-2026), soportada en Claude (web y escritorio) y ChatGPT.
  [blog.modelcontextprotocol.io](https://blog.modelcontextprotocol.io/tags/apps/), [WorkOS 27-01-2026](https://workos.com/blog/2026-01-27-mcp-apps).
- **INFERENCIA (oportunidad de distribución):** una **MCP App "Procesos"** que muestre el diagrama editable dentro de
  Claude/ChatGPT, con validación y simulación, es distribución a costo cero hacia millones de usuarios de chat, en línea
  con la doctrina del holding (*difusión sin salir a vender*). draw.io ya lo hace para dibujar; **nadie lo hace con
  rigor de proceso (validación, simulación, versión, KPIs)**. Riesgo: el canal es de terceros y las reglas cambian.

### 4.2 Agentes como participantes de un proceso (gobierno)

- HECHO: Camunda (sub-procesos ad hoc agénticos), UiPath Maestro (tareas de agente en BPMN), Pega Agentic Process
  Fabric, ServiceNow AI Control Tower/Action Fabric (identidad, permisos y auditoría para agentes de terceros). Fuentes §1.4.
- HECHO: **AWS "Agentic SOP"** para excepciones de SAP (jul-2026): agentes leen procedimientos aprobados, consultan datos
  vivos y actúan con niveles de confianza progresivos (asesor → supervisado → autónomo).
  [ERP Today](https://erp.today/aws-is-giving-sap-agents-a-rulebook-for-erp-exceptions/).
- HECHO (academia): *SOP-Agent* representa un SOP como grafo de decisión que el agente recorre; *Agent-Ops* (ACL 2026
  industry) con un "SOP Groomer" que convierte documentación ambigua en especificación automatizable (+13,2 % de
  precisión según los autores). [ACL Anthology](https://aclanthology.org/2026.acl-industry.29/), [emergentmind](https://www.emergentmind.com/topics/standard-operating-procedure-agent-sop-agent-framework).

### 4.3 El proceso como "instrucciones operativas" para agentes

**INFERENCIA (tesis central de este frente):** en 2026 el proceso deja de ser documentación para humanos y pasa a ser
**la especificación ejecutable de humanos + agentes**. El artefacto valioso es un proceso que, al mismo tiempo:
- se ve como diagrama (para la gente),
- se lee como SOP (para auditoría y capacitación),
- se compila como instrucciones + herramientas + límites para un agente (Skill/prompt de sistema/MCP),
- y se mide (KPIs por paso, desvíos).

La pieza "SOP Groomer" (pasar de SOP ambiguo a SOP automatizable) es exactamente el valor que una herramienta de
procesos con IA puede dar, y la evidencia académica dice que mejora resultados.

---

## 5. Ideas extraordinarias: ¿existen?, ¿quién?, dificultad, valor

Escala: dificultad y valor 1-5 (INFERENCIA salvo donde cito).

| # | Idea | ¿Existe? ¿Quién? | Dificultad | Valor | Comentario |
|---|---|---|---|---|---|
| 1 | **Conversar con un proceso** ("¿quién aprueba compras > USD 5k?") | Sí en enterprise: ARIS Portal chat (solo con contenido ARIS), Joule en Signavio, Lucid Process Agent | 2 | 4 | Con el modelo como contexto estructurado y respuestas citando nodos: barato y confiable. Commodity en enterprise, ausente en pymes. |
| 2 | **Explicar consecuencias de un cambio** ("si saco este control, ¿qué se rompe?") | Parcial: Celonis/Signavio con datos de minería; no encontré "impacto explicado" sobre el modelo para pymes | 3 | 5 | Combina análisis de grafo (aguas abajo, roles, controles, KPIs) + LLM que lo narra. Diferencial fuerte. |
| 3 | **Diff semántico entre versiones** ("se agregó una aprobación; el tiempo de ciclo sube ~1 día") | No encontré producto que lo haga con narrativa | 3 | 4 | Diff estructural determinístico + resumen del LLM + impacto simulado. Muy útil para auditoría ISO 9001 (control de cambios). |
| 4 | **Detectar riesgos y controles faltantes (SOX/ISO/COSO)** | Parcial: Deloitte ControlCatalyst.AI (desde notas de walkthrough, ago-2026), V7 SOX agent (validación); nadie desde el modelo para pymes | 3 | 5 | Biblioteca de patrones de control (segregación de funciones, doble firma, conciliación) aplicada al grafo + LLM. Alto valor para estudios contables/auditoría en AR. |
| 5 | **Generar capacitación (curso, quiz, video) desde el proceso** | Piezas: Scribe/Tango (guías paso a paso), Lucid (SOP); no encontré quiz/curso desde BPMN | 2 | 4 | Encaja con la experiencia del holding en trivia y lecciones (Senda): **ventaja interna real**. |
| 6 | **Manual de procedimientos normativo** (formato ISO 9001/manual de auditoría) | Parcial: ARIS/Signavio publican documentación; Lucid genera SOP | 2 | 4 | Plantillas por norma + generación por proceso + control de versiones. |
| 7 | **Proceso → app (formularios)** | Sí: Pega Blueprint, Appian Composer, Power Apps, Kissflow | 4 | 4 | Competencia pesada. Versión liviana: formulario por tarea humana + tabla. |
| 8 | **Proceso → tablero de KPIs** | Parcial en process mining (con logs) | 3 | 4 | Proponer KPIs por paso y armar el tablero con datos cargados o conectados. |
| 9 | **Entrevista guiada por IA para relevar** | Temprano: Sona8 (YC otoño 2026), Oxagile Voiager | 2 | 5 | Señal débil fuerte; la entrevista adaptativa es el mejor insumo para la semántica (donde el LLM falla). |
| 10 | **Relevamiento por voz/WhatsApp** | No encontré para procesos | 2 | 5 | Específico LatAm. Distribución natural. |
| 11 | **Foto de pizarra/servilleta → diagrama editable** | Sí: IBM, ServiceNow, Lucid, Appian, Sketch2Diagram | 2 | 3 | Ya es commodity; hay que tenerlo, no diferencia. |
| 12 | **Gemelo digital con agentes que simulan personas** | Investigación/whitepapers (preprint Aston/NUS mar-2026; Ekho; Salesforce eVerse para interacciones de clientes) | 5 | 3 | Atractivo para demo, débil en validez. Mejor: simulación de eventos discretos clásica con parámetros que la IA propone. |
| 13 | **IA propone 3 rediseños y los simula** | No encontré integrado | 4 | 5 | LLM propone variantes como modelos intermedios válidos → motor de simulación (tiempos, costos, colas) → tabla comparativa. **El diferencial más fuerte** si el simulador es riguroso. |
| 14 | **Process Capture por grabación de pantalla** | Sí: Lucid, Skan, Scribe | 4 | 3 | Caro de hacer bien; dejar para después o integrar. |
| 15 | **Proceso → agente (SOP compilado)** | Emergente: AWS Agentic SOP, Camunda/UiPath; académico SOP-Agent | 3 | 5 | Exportar el proceso como Skill/instrucciones para Claude/ChatGPT con puntos de aprobación. |
| 16 | **Revisión de calidad del modelo (lint con explicación)** | Parcial: Lucid Process Agent comenta mejoras; validadores BPMN clásicos | 2 | 4 | Reglas determinísticas (7PMG, *deadlocks*) + explicación en lenguaje llano. |

---

## 6. Costos de IA

### 6.1 Precios de lista (USD por millón de tokens, 17-11-2026)

| Proveedor / modelo | Entrada | Salida | Caché (lectura) | Batch | Fuente |
|---|---|---|---|---|---|
| Claude Opus 5.5 | 4,00 | 20,00 | 0,20 | 50 % | HECHO: [platform.claude.com/pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| Claude Sonnet 5.5 | 2,00 | 10,00 | 0,10 | 50 % | ídem |
| Claude Haiku 5.5 (≤100k tokens de prompt) | 0,10 | 0,50 | 0,01 | 50 % | ídem (sube a 0,50/2,50 sobre 100k) |
| OpenAI gpt-6-astra | 10,00 | 50,00 | 1,00 | menor | HECHO: [developers.openai.com/api/docs/pricing](https://developers.openai.com/api/docs/pricing) |
| OpenAI gpt-6.1-sol | 2,00 | 10,00 | 0,10 | menor | ídem |
| OpenAI gpt-6.1-terra | 1,00 | 5,00 | 0,05 | menor | ídem |
| OpenAI gpt-6-luna | 0,10 | 0,50 | 0,01 | menor | ídem |
| Gemini 4 Argon / Carbon | 2,00 (**4,00 desde 01-12-2026**) | 10,00 (**20,00**) | 0,10 (0,20) | 50 % | HECHO: [aistudio.google.com/docs/pricing](https://aistudio.google.com/docs/pricing) |
| Gemini 3.8 Flash | 0,75 (**1,50 desde 01-01-2027**) | 3,75 (**7,50**) | 0,075 | 50 % | ídem |
| Gemini 3.5 Flash-Lite | 0,30 | 2,50 | 0,03 | 50 % | ídem |
| Gemini 2.5 Flash-Lite | 0,10 | 0,40 | 0,01 | 50 % | ídem |
| DeepSeek V4 Flash (entrada) | 0,14 | s/d | — | — | HECHO de segunda mano (lista al 18-07-2026): [capitalandcompute.net](https://capitalandcompute.net/blog/china-ai-pricing/) |
| Qwen3.6-35B-A3B (abierto, vía proveedor) | ~0,15 | ~1,00 | — | — | HECHO de agregador, no oficial: [anotherwrapper.com](https://anotherwrapper.com/tools/llm-pricing/qwen3.6-35b-a3b/deepseek-chat) |

**Nota crítica (HECHO):** Google **duplica** los precios de Gemini 4 desde el 01-12-2026 y de 3.8/3.6 Flash desde el
01-01-2027 (fin de precios introductorios). Es la mejor prueba de que **el precio por token no es estable** y hay que
poder cambiar de proveedor.

### 6.2 Costo por operación típica (ESTIMACIÓN)

**Método:** tokens estimados por tipo de tarea × precios de lista de arriba. Supuestos: prompt de sistema + esquema +
ejemplos ≈ 4.000 tokens (cacheable); descripción del usuario ≈ 1.000; salida en JSON intermedio ≈ 2.500; razonamiento
interno ≈ 3.000 (se factura como salida). Una página de PDF ≈ 700 tokens de texto. Sin caché en la primera llamada.

| Operación | Tokens (entrada / salida) | Haiku 5.5 | Sonnet 5.5 | Opus 5.5 | Gemini 3.5 Flash-Lite |
|---|---|---|---|---|---|
| Generar un diagrama desde descripción | 5k / 5,5k | ~USD 0,003 | ~USD 0,065 | ~USD 0,13 | ~USD 0,015 |
| Editar por chat ("agregá aprobación de gerencia") con modelo cacheado | 6k (5k en caché) / 1,5k | ~USD 0,001 | ~USD 0,018 | ~USD 0,035 | ~USD 0,004 |
| Manual de 30 páginas → proceso | 25k / 8k | ~USD 0,007 | ~USD 0,13 | ~USD 0,26 | ~USD 0,028 |
| Análisis profundo (riesgos + 3 rediseños) | 30k / 15k | — (no recomendable) | ~USD 0,21 | ~USD 0,42 | — |
| Audio de entrevista 30 min → transcripción | — | costo de transcripción aparte (no verificado hoy) | | | |

**Uso mensual típico de un usuario activo (ESTIMACIÓN):** 20 generaciones + 150 ediciones por chat + 3 documentos +
2 análisis profundos.
- Todo en Sonnet 5.5: 20×0,065 + 150×0,018 + 3×0,13 + 2×0,21 ≈ **USD 4,8/mes**.
- Ruteado (ediciones y generaciones simples en Haiku 5.5; documentos y análisis en Sonnet 5.5): 20×0,003 + 150×0,001 +
  3×0,13 + 2×0,21 ≈ **USD 1,0/mes**.
- Contra un precio de referencia de USD 10-15 por usuario/mes (rango de Mermaid Chart/Eraser citado arriba), el ruteo
  baja el costo de IA de ~30-50 % a **~7-10 % del ingreso**. INFERENCIA: el ruteo es obligatorio, no opcional.

### 6.3 Cómo evitar que la IA destruya el margen

1. **Ruteo por tarea**: modelo chico para editar, clasificar y explicar; mediano para generar desde documentos y
   analizar; tope solo en análisis "premium" cobrados aparte.
2. **Modelo intermedio compacto** (JSON/POWL): BPMN Assistant mide >75 % menos tokens de salida que XML directo.
3. **Caché de prompt**: el esquema, las reglas y el modelo actual del proceso van al inicio y se cachean (lectura a
   0,05× en Sonnet/Opus 5.5).
4. **Batch (−50 %)** para lo no interactivo: regenerar manuales, capacitaciones, auditorías nocturnas.
5. **Validación determinística** antes de reintentar con el LLM (cada reintento evitado es plata).
6. **Cuotas por plan** (créditos de IA), como hacen Whimsical, Napkin, Mermaid Chart y Signavio (850/mes en su Analyzer).
7. **BYOK** (el cliente trae su clave) para enterprise y para quien quiere usar su proveedor aprobado; también resuelve
   privacidad.
8. **Capa de abstracción multi-proveedor** desde el día 1 (Claude como principal, alternativa preparada) — ver el
   aumento de Gemini.
9. **Modelo abierto ajustado** (estilo RL sobre POWL de Berti et al.) solo cuando el volumen lo justifique; un 8-14B
   ajustado puede hacer la generación estructurada barata y local.

---

## 7. Cierre

### (a) Las 15 capacidades de IA de más valor, priorizadas

Puntaje = impacto (1-5) × factibilidad hoy (1-5) × diferencial frente al mercado (1-5). Todo INFERENCIA, basada en la
evidencia de arriba.

| # | Capacidad | I | F | D | Puntaje |
|---|---|---|---|---|---|
| 1 | **Generación confiable**: texto/documento → modelo intermedio validado → layout automático → BPMN exportable, con supuestos explícitos y preguntas | 5 | 5 | 3 | 75 |
| 2 | **Entrevista guiada por IA** (chat y voz, también por WhatsApp) que releva el proceso y repregunta lo ambiguo | 5 | 4 | 4 | 80 |
| 3 | **Revisión inteligente**: lint determinístico + explicación en lenguaje llano + sugerencias | 4 | 5 | 3 | 60 |
| 4 | **Riesgos y controles faltantes** (SoD, aprobaciones, conciliaciones; ISO 9001/COSO) sobre el modelo | 5 | 4 | 4 | 80 |
| 5 | **Diff semántico entre versiones** con impacto estimado | 4 | 4 | 5 | 80 |
| 6 | **"¿Qué pasa si…?"**: impacto de un cambio (grafo + simulación) narrado | 5 | 3 | 5 | 75 |
| 7 | **3 rediseños propuestos y simulados** con tabla comparativa (tiempo, costo, riesgo) | 5 | 3 | 5 | 75 |
| 8 | **Proceso → manual normativo** (SOP, manual de procedimientos, versión controlada) | 4 | 5 | 3 | 60 |
| 9 | **Proceso → capacitación** (lección, quiz, guía paso a paso; experiencia interna de Senda) | 4 | 5 | 4 | 80 |
| 10 | **Conversar con el proceso** (Q&A citando nodos, sin alucinar) | 4 | 5 | 2 | 40 |
| 11 | **Proceso → agente** (exportar como instrucciones/Skill/MCP con puntos de aprobación) | 5 | 4 | 4 | 80 |
| 12 | **Proceso → automatización en la herramienta del cliente** (n8n/Activepieces/Zapier/Make como borrador) | 4 | 4 | 3 | 48 |
| 13 | **Imagen/foto de pizarra → diagrama** | 3 | 5 | 1 | 15 |
| 14 | **Proceso → KPIs y tablero** | 4 | 3 | 3 | 36 |
| 15 | **MCP App** para editar y validar procesos dentro de Claude/ChatGPT (canal) | 4 | 4 | 4 | 64 |

Orden resultante: entrevista guiada, controles faltantes, diff semántico, capacitación, proceso → agente (80) →
generación confiable, qué-pasa-si, 3 rediseños (75) → MCP App (64) → revisión, manual (60) → automatización (48) →
conversar (40) → KPIs (36) → foto (15).

### (b) v1 vs. después

**v1 (INFERENCIA; lo que da diferencial con poco):**
- Núcleo: generación confiable (#1) con modelo intermedio + validador + layout + exportación BPMN/Mermaid/PNG.
- Entrevista guiada por chat (#2, texto); la voz se agrega en v1.1 (con transcripción del teléfono o de un servicio).
- Revisión con explicación (#3) y controles faltantes con una biblioteca chica de 20-30 patrones (#4).
- Diff semántico entre versiones (#5), sin simulación al principio (solo estructural + narrativa).
- Proceso → manual y → capacitación/quiz (#8, #9).
- Imagen → diagrama (#13) porque es barato y los usuarios lo esperan (usar visión del mismo LLM).
- Ruteo de modelos, caché, cuotas y BYOK desde el día 1.

**v2 (cuando haya motor de simulación sólido):** qué-pasa-si (#6) y 3 rediseños simulados (#7); KPIs (#14).

**v2-v3 (canal y ejecución):** MCP App (#15) y exportar a agentes (#11) y a n8n/Activepieces/Zapier (#12); BPMN
ejecutable en Operaton solo si aparece demanda.

**No hacer (por ahora):** motor de ejecución propio, task mining por grabación de pantalla, gemelo digital con agentes
que "actúan como personas", generación de apps completas (Pega/Appian ya lo regalan como embudo).

### (c) Riesgos

1. **Alucinaciones semánticas.** HECHO: la semántica es la debilidad documentada de los LLM (BEF4LLM; "Do LLMs Speak
   BPMN?"). Mitigación: modelo intermedio + validador formal; la IA **declara supuestos** y pregunta; cada afirmación del
   chat cita el nodo; marca de "borrador IA" hasta que un humano lo confirme. En controles (SOX/ISO): la IA **sugiere**,
   el humano decide (coincide con la guía de práctica citada por Weaver/Norman Marks).
2. **Privacidad de procesos sensibles.** Los procesos revelan cómo opera una empresa (aprobaciones, montos, proveedores).
   Mitigación: BYOK, opción de proveedor con retención cero o región (Claude cobra 1,1× por inferencia solo en EE. UU.,
   HECHO en la página de precios), anonimizar nombres y montos antes de enviar, registro de qué se mandó a la IA,
   cumplimiento de la Ley 25.326 (AR) y equivalentes. INFERENCIA: para enterprise, "no entrenamos con tus datos" y la
   opción de modelo local serán requisito de compra.
3. **Dependencia de proveedor.** HECHO: Gemini duplica precios en dic-2026/ene-2027; Microsoft retiró la exportación
   Visio → Power Automate; Zapier MCP seguía en beta en ago-2026; la versión gratis de Mermaid Chart se achicó.
   Mitigación: capa multi-proveedor, formato propio abierto (JSON intermedio documentado) + exportación estándar
   (BPMN 2.0, Mermaid), nada crítico atado a una sola API.
4. **Commoditización acelerada.** HECHO: Pega Blueprint gratis; draw.io MCP gratis y Apache-2.0; ChatGPT/Claude generan
   Mermaid nativamente. INFERENCIA: "texto → diagrama" no se puede cobrar; se cobra rigor (validación, simulación,
   versionado, controles), salidas útiles (manual, capacitación, agente) y el flujo de trabajo del equipo.
5. **Licencias de automatización.** HECHO: n8n no se puede embeber comercialmente sin contrato; Camunda 8 pide licencia en
   producción. Mitigación: exportar a la instancia del cliente (no redistribuir), preferir MIT/Apache (Activepieces
   núcleo, Kestra, Temporal, Operaton, bpmn-engine).
6. **Agent washing y expectativas.** HECHO: Gartner advierte sobre vendedores que rebautizan chatbots como "agentes".
   INFERENCIA: prometer "tu proceso se automatiza solo" genera churn; prometer "tu proceso queda claro, controlado,
   enseñable y listo para automatizar" es cumplible.
7. **Costo descontrolado por agentes.** Un agente en bucle sin tope puede costar 100× una generación. Mitigación: topes de
   tokens por tarea, cuotas por plan, batch para lo no urgente.

---

## 8. Huecos de evidencia (para verificar antes de decidir capital)

- Ranking concreto de modelos en los benchmarks de modelado (los abstracts no lo dan): leer los PDF completos de
  arXiv 2412.00023 y 2601.21787.
- Precio y alcance real de Pega Blueprint gratis, Lucid Process Agent por plan y Miro Sidekicks (beta privada).
- Licencia exacta de Windmill y estado de releases de Operaton (fuentes en conflicto).
- Precio oficial del Embed de n8n y de Activepieces (cifras de una sola fuente).
- Precios oficiales de DeepSeek y Qwen (solo agregadores).
- Calidad real de imagen → BPMN (no hay benchmark independiente).
- Bizagi: confirmar en sus release notes si existe generación desde documentos.
