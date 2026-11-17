# 01 — Benchmark de pizarras colaborativas y herramientas de diagramación

**Fecha de corte:** 17-11-2026 · **Frente:** pizarras + diagramación (BPM puro va en otro informe) · **Autor:** investigación de mercado (Claude)

**Cómo leer las marcas:**
- **HECHO**: con URL y fecha de consulta. Todas las consultas son del 17-11-2026 salvo que se diga otra cosa.
- **ESTIMACIÓN**: dice el método.
- **INFERENCIA**: razonamiento propio.
- **[no verificado hoy]**: dato de conocimiento previo que no se pudo confirmar en esta sesión.

**Limitaciones de esta sesión (HECHO):**
- Se agotó el cupo de búsquedas web antes de cerrar varios frentes.
- Algunas páginas oficiales de precios no se pudieron leer: Lucid y Creately se arman con JavaScript, y SmartDraw, Cacoo y Visio "compare" devolvieron 404. En esos casos se usaron agregadores, que se marcan y casi siempre se contradicen.
- G2 y Reddit no se pudieron leer directo. Las quejas salen de los foros oficiales de los propios proveedores (Miro Community, Figma Forum, Lucid Community, Atlassian Community), que en general son más duros que G2.
- **Todo precio que decida capital se re-verifica en la fuente primaria antes de usarlo.**

---

## 0. Lo más importante en 10 líneas

1. **La categoría se reordenó en 2026.**
   - Bending Spoons compró **Miro** por **USD 1.355 millones** de valor empresa. Es ~90 % debajo de la valuación de USD 17.500 millones de 2022, con ~USD 600 millones de ARR. El cierre fue el 26-10-2026.
   - Microsoft **retira las apps sueltas de Whiteboard** (16-10-2026) y absorbió al equipo de **Cove** (canvas con IA).
   - Lucid pasó **USD 300 millones de ARR** y es rentable (abril de 2025).
2. **La IA ya no es "generar un diagrama desde un prompt"; es "el canvas como herramienta de los agentes"** (MCP).
   - Miro reporta **16 millones de llamadas a su servidor MCP**; el ~65 % viene de Claude.
   - draw.io, tldraw, Lucid y Whimsical abrieron el canvas a agentes externos.
3. **El lock-in es real y es el dolor más viejo de la categoría.**
   - Miro no exporta a Visio ni a SVG (se pide desde 2021).
   - FigJam no exporta SVG.
   - Lucid cobra la exportación a Visio.
   - Gliffy deja los diagramas en solo lectura si no renovás.
4. **draw.io es el contraejemplo económico.**
   - Es gratis, abierto, y se monetiza en el **Atlassian Marketplace**: 59.375 instalaciones en Confluence Cloud, desde USD 2.020 al año para 100 usuarios.
   - La entidad inglesa tiene 2 empleados y £1,6 millones en caja.
5. **La oportunidad para un recién llegado** no es "otro Miro". Es:
   - un **modelo semántico abierto** (diagrama = dato con significado: proceso, sistema, flujo), con ida y vuelta sin pérdida a BPMN, VSDX, drawio y Mermaid;
   - **nativo para agentes**;
   - con **exportación generosa** como marketing;
   - con un **vertical** (procesos operativos y logística, simulables) y distribución por marketplaces.

---

## 1. Mercado: tamaño y datos duros

| Dato | Valor | Tipo | Fuente (consulta 17-11-2026) |
|---|---|---|---|
| Venta de Miro a Bending Spoons | USD 1.355 millones de valor empresa, en efectivo; ~USD 1.790 millones de valor patrimonial con la caja neta | HECHO | https://miro.com/blog/miro-bending-spoons/ (post del 10-09-2026); https://www.goodwinlaw.com/en/news-and-events/news/2026/09/announcements-technology-goodwin-advises-miro-acquisition-agreement-bending-spoons |
| Cierre de la compra de Miro | Lunes 26-10-2026 | HECHO | https://thenextweb.com/news/bending-spoons-completes-miro-deal |
| ARR de Miro | ~USD 600 millones; ~90 % viene de clientes business y enterprise (según el CEO de Bending Spoons) | HECHO (dicho por el comprador) | https://pulse2.com/bending-spoons-to-acquire-miro-for-1-355-billion-as-ai-workspace-reaches-600-million-arr/ |
| Usuarios de Miro | "más de 100 millones" de usuarios; "casi 4 millones" de pagos; 250.000+ organizaciones | HECHO (dicho por la empresa) | blog de Miro (arriba); https://miro.com/newsroom/momentum-grows-for-miro-mcp-as-users-embrace-the-canvas-for-ai-collaboration/ |
| Valuación pico de Miro | USD 17.500 millones (Serie C, enero de 2022) | HECHO | https://www.reworked.co/collaboration-productivity/bending-spoons-acquires-miro-for-136b/ |
| Bending Spoons también compró Airtable | Agosto de 2026 | HECHO (prensa) | Reworked y TNW, arriba |
| Lucid | "pasó USD 300 millones de ARR", "más de 100 millones de usuarios", rentabilidad sostenida | HECHO (comunicado de abril de 2025) | https://www.theautochannel.com/news/2025/04/03/1513492-lucid-software-expands-visual-collaboration-with-first-work-acceleration-platform.html |
| Lucid, última valuación conocida | USD 3.000 millones (secundaria de USD 500 millones, junio de 2021) | HECHO | https://spectrumequity.com/news/after-record-year-lucid-receives-500m-secondary-investment-at-3-billion-valuation |
| tldraw | Serie A de USD 10 millones (abril de 2025, Lux y Definition) | HECHO | https://tldraw.dev/blog/announcing-tldraw-series-a |
| Cove (canvas con IA, semilla de USD 6 millones de Sequoia) | El equipo pasa a Microsoft; el producto cierra el 01-04-2026 | HECHO | https://techcrunch.com/2026/03/18/microsoft-hires-the-team-of-sequioa-backed-ai-collaboration-platform-cove/ |
| Informes de "mercado de pizarras online" | Entre USD 685 millones y 3.200 millones para 2025, según quién mida | HECHO (que existen), pero poco confiables | Allied, Mordor y Expert Market Research vía búsqueda |
| Informes de "software de diagramación" | Entre USD 1.130 millones y 3.800 millones para 2025 | HECHO (que existen), pero poco confiables | TBRC, Orion y HTF vía búsqueda |

**ESTIMACIÓN del tamaño real (de abajo hacia arriba)**
- Método: sumar ingresos conocidos de los líderes.
  - Miro: ~USD 600 millones.
  - Lucid: más de USD 300 millones (abril de 2025).
  - Visio: no publicado. Plan 1 a USD 5 y Plan 2 a USD 15, con una base instalada enorme, permite suponer cientos de millones [no verificado hoy].
  - La parte de FigJam en Figma: no se separa.
  - draw.io, Mural, Whimsical, Creately, Canva Whiteboards: no publicados.
- Resultado: los ingresos por software de pizarra y diagramación superan con holgura los **USD 1.500 millones por año**, con dos jugadores concentrando la mitad.
- Los informes de consultoras tienen rangos de 5x entre sí. No sirven para decidir.

**INFERENCIA: el precio de Miro es la señal más importante del año.**
- Un líder de categoría con ~USD 600 millones de ARR se vendió a ~2,3x ARR.
- El mercado está diciendo que "la pizarra horizontal" es un negocio maduro, de crecimiento bajo y con riesgo de quedar como commodity frente a la IA y a las suites (Microsoft, Google, Atlassian, Figma, Canva).
- Para un recién llegado esto es **malo para "otra pizarra genérica"** y **bueno para nichos semánticos y verticales**.
- Además, Bending Spoons tiene historia de recortes y suba de precios después de comprar: Reworked recuerda los despidos en Evernote tras la compra de 2023. Eso puede abrir ventanas de cambio de proveedor en 2027.

---

## 2. Tabla maestra (resumen por herramienta)

Leyenda de exportación:
- **V** = vectorial (SVG o PDF vectorial).
- **E** = formato editable interoperable (VSDX, drawio, BPMN, Mermaid).
- **R** = solo imagen o PDF raster.

| Herramienta | Qué hace excelente | Debilidad principal | IA real (2026) | Exportación (lo clave) | Precio de lista (USD, fecha y fuente en §3) |
|---|---|---|---|---|---|
| **Miro** | Facilitación y talleres, presencia, plantillas, ecosistema, marketplace, MCP | Rendimiento en tableros grandes; facturación de asientos confusa; lock-in | Sidekicks agénticos, Flows, AI Workflows, MCP de lectura y escritura | Free: baja resolución. Pago: imagen y PDF en alta. **Sin VSDX ni SVG.** CSV de tablas | Free (3 tableros editables) · Starter 8 · Business 20 (anual) · Enterprise a medida desde 30 |
| **Lucidchart / Lucidspark / Lucidscale** | Diagramación seria: datos vinculados, capas, condicionales, Visio, nube (Lucidscale), agentes de proceso | Free muy limitado; precio sube con módulos; editor viejo (se renueva en octubre de 2026) | Process Agent, Cloud Agent, foto a diagrama, desde SOP de Confluence | PDF, PNG, JPEG, SVG, JSON, CSV; **VSDX solo pago** | Free (3 documentos, 60→75 figuras) · Individual ~9 · Team ~10 con mínimo 3 (agregadores; contradicciones) |
| **FigJam** | Diversión y velocidad: stickers, sellos, widgets, cursor chat, integración con Figma; seat colaborativo barato | Pobre para diagramas formales; **sin SVG** | Generar tablero o diagrama, ordenar y resumir notas | PNG, JPG, PDF (con calidad), CSV de notas y tablas; **SVG no soportado** | Collab seat 3 (Professional) / 5 (Org y Enterprise) |
| **Mural** | Facilitación metodológica, salas, plantillas de metodología | Menos fuerza en diagramas; momento de mercado incierto | Mural AI (en Team+) | No informado en la página de precios | Free (3 murales editables) · Team+ 9,99 (anual) o 12 (mensual) · Business 17,99 |
| **Canva Whiteboards** | Gratis dentro de Canva; estética; distribución masiva | No es una herramienta de diagramas rigurosos | Magic (genérica de Canva) | Free: PNG, JPG, PDF (estándar y para impresión). **SVG solo Pro** | Pro 15–18 por mes según la fuente (contradicción) |
| **Visio (web y escritorio)** | Estándar empresarial, plantillas técnicas, BPMN 2.0 y UML en Plan 2, VSDX nativo | Escritorio solo en Windows; web limitada; UX vieja | Copilot no figura en la página de planes | VSDX nativo (el formato que todos importan) | Visio en M365: incluido · Plan 1: 5 · Plan 2: 15 (anual) · Perpetua 2024: Std ~310, Pro ~580 (terceros) |
| **MS Whiteboard / Loop** | Incluido en Teams | Apps sueltas retiradas el 16-10-2026; borrado de pizarras viejas | Copilot en Whiteboard desde 2023 (terceros) | Limitada | Incluido en M365 |
| **draw.io / diagrams.net** | Gratis, sin cuenta, offline, privacidad; biblioteca enorme; XML abierto; vive dentro de Confluence, Jira, VS Code, SharePoint | UX "de ingeniero"; colaboración en vivo limitada fuera de los anfitriones | Generar con Claude, OpenAI o Gemini con tu propia clave; MCP oficial; agente de Rovo | PNG, SVG, PDF, XML, VSDX (beta según terceros), HTML; importa VSDX, Gliffy y Lucid | Gratis. Confluence Cloud: 10 usuarios gratis, 100 usuarios a 2.020 por año, 1.000 a 7.345 por año |
| **Excalidraw / Excalidraw+** | Estilo a mano que baja la ansiedad; rapidez; código abierto | Pocas funciones "pro"; diagramas grandes desordenados | Texto a diagrama: 10 por día gratis, 100 por día en Plus o tu propia clave | Free: PNG, SVG, archivo. Plus: PDF y PPTX | Plus: 6 por usuario por mes |
| **tldraw** | El mejor SDK de canvas infinito; base para agentes; Make Real | SDK con marca de agua salvo licencia paga | Kit inicial de agentes (Anthropic, OpenAI, Google); app MCP; offline editable por agentes | Del lado del integrador | SDK: licencia comercial anual "según valor" (terceros: ~6.000 por año, no confirmado) |
| **Whimsical** | Velocidad y estética para flujos, wireframes y mapas mentales; poco ruido | Free muy corto; pocos formatos | Conectar agentes (Claude, ChatGPT, Cursor) gratis | **Marca de agua en Free**; Pro sin marca | Pro 10 (anual) o 12 · Business 20 o 24 |
| **Creately** | Plantillas para negocio, datos en figuras, "base de datos visual" | Precios opacos y cambiantes | "Herramientas de IA" sin cuota declarada | **Free sin exportar** según la página oficial (Capterra dice PNG y JPEG: contradicción) | Business 149 fijo por mes según CostBench (no verificado) |
| **Gliffy** | Dentro de Confluence, barato | Solo Atlassian; si no renovás, **solo lectura** | Sin datos | JPEG, PNG, SVG; importa Visio y draw.io | Confluence: gratis hasta 10, 3,80 por usuario por mes de 11 a 100 |
| **SmartDraw** | Diagramas automáticos (organigramas, árboles), Visio | Imagen vieja | Sin datos verificados | Visio, SVG, PDF [no verificado hoy] | ~6,95–7,95 por usuario por mes con mínimo 3 (terceros) |
| **Cacoo (Nulab)** | Simple, barato, ecosistema Backlog | Poca innovación | Sin datos | [no verificado hoy] | Pro y Team ~6 por usuario por mes (terceros) |
| **Eraser.io** | Diagrama como código y documentación técnica con IA ("DiagramGPT") | Precio alto para el segmento | Créditos de IA (3 en Free) | PDF, PNG, SVG, MD en todos los planes | Free (3 archivos) · Business 45 (anual) o 60 · Business Plus 42 con mínimo 10 (sic; verificar) |
| **Mermaid / Mermaid Chart (→ mermaid.ai)** | Estándar de facto de diagrama como texto (GitHub, Notion, LLMs); editor visual sobre texto | Diseño limitado; diagramas grandes ilegibles | Créditos (15 en Free; 300 por año en Plus) y "workflows" | Mermaid es texto abierto | Free (3 diagramas) · Plus 10 · Premium 20 (anual) |
| **PlantUML / Kroki** | Diagramas como código, autoalojable, más de 30 lenguajes (Kroki: MIT) | Sin edición visual ni colaboración | — (los LLM lo escriben bien) | PNG, SVG, PDF, TXT según el tipo | Gratis y código abierto |
| **Napkin.ai** | Texto a visual (infografía) en segundos | No es un editor de diagramas; los visuales son genéricos | Núcleo del producto | **Free con marca de Napkin**; SVG y PPT solo pago | Free (500 créditos por semana) · Plus 9 · Pro 22 por mes |
| **Xmind** | El mejor mapa mental de escritorio, rápido | Free muy recortado | Texto a mapa, resúmenes (Premium) | **Free: PNG de a un mapa y con marca de agua**; Pro: SVG, PDF, MD, Office | Pro 4,92 · Premium 8,25 (base de cobro ambigua) |
| **Heptabase** | Canvas para pensar y estudiar (tarjetas + PDF) | Nicho; caro con IA | Agente con GPT, Claude o Gemini según el plan | Sin datos en la página | Pro 8,99 · Premium 17,99 · Premium+ 53,99 por mes |
| **Obsidian Canvas** | Local, archivos propios, **formato abierto JSON Canvas (MIT)** | Sin colaboración en vivo | Plugins de terceros | `.canvas` abierto | Obsidian gratis [licencia no verificada hoy] |
| **AFFiNE** | Documentos y pizarra en uno, primero local, código abierto | Madurez | AFFiNE AI | Sin datos | Pro 6,75 · Team 10 por asiento · Believer 499,99 pago único |
| **Milanote** | Tableros visuales para creativos | Diagramación débil | — | — | Precios contradictorios (no verificado) |
| **ClickUp / Notion** | Pizarra dentro de la herramienta de trabajo | Pizarra de segunda | IA de la suite | — | ClickUp: Free 3 pizarras, Unlimited 10, Business sin límite. Notion: canvas no confirmado |
| **Freeform (Apple)** | Gratis, Pencil, iCloud | Solo Apple, poco formal | — | — | Gratis [no verificado hoy] |
| **IcePanel** | Modelo C4: **un modelo, muchas vistas**; flujos sobre el modelo; ADR | Caro; nicho de arquitectura | Descripciones y resúmenes | PNG, PDF, JSON, CSV, HTML, **LLMs.txt** | Free (1 editor, 100 objetos) · Growth 40 · Scale 80 (anual, desde 20) |
| **Structurizr** | Arquitectura como código (DSL C4) | Servicio en la nube en retiro; licenciamiento del servidor | — | — | Servidor: £300, £600 o £900 por mes según usuarios (docs vía búsqueda) |
| **OmniGraffle** | Precisión tipográfica en Mac, automatización con JavaScript | Solo Apple | — | [no verificado hoy] | v7.26.1. Suscripción ~12,49 por mes (Capterra); perpetua ~150/250 (terceros) |
| **yEd** | **Diseño automático** de grafos grandes, gratis incluso para uso comercial | Java, UX vieja, sin colaboración | — | PNG, JPG, SVG, PDF, SWF; VSDX solo como complemento de yFiles | Gratis (yFiles SDK es pago) |
| **Emergentes con IA** | Boardmix (100+ agentes, junio de 2026), Jeda.ai, Novastart (canvas con agentes, sin inversión externa), Cove (cerró) | Ninguno con tracción verificada | Agentes en el canvas | — | Novastart: Pro 10, Team 20 (se describe a sí misma) |

---

## 3. Fichas con evidencia

### 3.1 Miro (ahora de Bending Spoons)

**Precios (HECHO, https://miro.com/pricing/):**
- Free: USD 0, con **3 tableros editables** ("los tres más recientes siguen editables"; se pueden crear ilimitados) y 10 créditos de IA por mes.
- Starter: USD 8 por miembro por mes, anual, con 25 créditos.
- Business: USD 20, anual, con 50 créditos y SSO SAML.
- Enterprise: a medida, desde 30 miembros, con créditos compartidos desde 2.500 por mes.
- La facturación anual ahorra 20 % frente a la mensual.

**Suba de precio (HECHO vía PricingSaaS, https://pricingsaas.com/companies/miro/diffs/2026Q1):** "Miro raises Business plan 25% to $20/mo" (23-02-2026). No verificado contra el historial oficial.

**Exportación:**
- HECHO, página de precios: Free = "Low-res only"; Starter y Business = JPG y PDF en alta resolución.
- HECHO vía búsqueda en el centro de ayuda (help.miro.com, artículo 360017572754 "Board export"; acceso directo bloqueado con 403):
  - Free exporta "solo en tamaño chico" y sin alta resolución sin marca de agua.
  - Los frames se exportan como PDF "Small" o "Best (Vector)", una página por frame.
- **Contradicción** entre secciones de la misma ayuda sobre si Free accede al vectorial.

**Lock-in (HECHO, https://community.miro.com/ideas/visio-integration-663 y https://community.miro.com/ideas/export-to-svg-2317):**
- No hay exportación nativa a Visio ni a SVG.
- Un usuario escribe: *"The lack of full import / export capability from and to the Visio format is the number one reason my company won't sign on"*.
- Otro: *"Vendor lock in is not a feature."*
- Miro **importa** VSDX desde 2023, pero **no exporta**. Asimetría clásica de lock-in.

**Rendimiento (HECHO, Miro Community):**
- Hilos como "boards are very laggy and slow on desktop app and web app" (#12191) y "miro mindmap is slow… (~1000 nodos)" (#13452).
- La ayuda oficial admite que el rendimiento baja "en sesiones con muchos usuarios y en tableros grandes" y recomienda dividir tableros.

**Facturación (HECHO, Miro Community 2026):**
- Hilos "unexpected 85 invoice for 5 licenses i only need 1" (#28251), "charged 423 usd" (#29254) y "refund misleading pricing" (#28155, abril de 2026).
- Patrón: invitados o enlaces que suman asientos pagos.

**IA (HECHO, https://miro.com/newsroom/miro-takes-aim-at-the-gap-between-ai-potential-and-organizational-reality, 19-05-2026, y el comunicado de MCP del 29-09-2026):**
- Sidekicks (agentes que preguntan, planifican y generan el tablero entero desde un prompt, con voz bidireccional).
- Flows (automatizaciones que llaman herramientas dentro y fuera de Miro).
- Connectors (Slack, Atlassian, GitHub, Granola).
- Conector nativo en ChatGPT, Claude y Copilot.
- MCP desde febrero de 2026: **más de 16 millones de llamadas**. En agosto, **57 % de las llamadas llevaron contexto del tablero a código y 41 % generaron tableros desde código**; Claude Desktop y Claude Code fueron ~65 % del uso. Quienes no son ingenieros superan a los ingenieros 2 a 1.

**INFERENCIA sobre la IA de Miro:**
- La IA de Miro que "de verdad" mueve la aguja es la de **canvas como memoria y contexto compartido entre humanos y agentes**, no el generador de notas.
- Es el dato de demanda más fuerte para un producto nuevo.

### 3.2 Lucid (Lucidchart, Lucidspark, Lucidscale)

**Precios:**
- No se pudo leer la página oficial (redirección a una app que se arma con JavaScript).
- Agregadores:
  - Free: 3 documentos editables, 60 figuras por documento.
  - Individual: USD 9 por mes, anual.
  - Team: USD 10 por usuario, con mínimo 3.
- PricingSaaS registra en junio de 2026 un cambio de empaquetado: "Individual Bundle" a USD 13,50 y Team a USD 15, y el tope de figuras de 60 a 75 (https://pricingsaas.com/companies/lucid/diffs/2026W24).
- **Contradicción: re-verificar.**

**Exportación (HECHO, https://help.lucid.co/hc/en-us/articles/16324571257492):**
- Formatos: "image files (PDF, PNG, JPEG, SVG), Visio files (VDX/VSDX), JSON, and a CSV file of the shape data".
- *"To export a document as Visio file you must be on an Individual, Team, or Enterprise account."*
- "Bulk export is not available."
- Varias fuentes de terceros dicen que Free tiene PDF con marca de agua y SVG restringido. La ayuda oficial no lo dice. **No confirmado.**

**IA (HECHO):**
- Process Agent, en beta desde febrero de 2026 (https://community.lucid.co/inspiration-5/generate-process-flows-quickly-with-lucid-ai-s-process-agent-13308).
- Cloud Agent: AWS disponible en general; Azure y GCP en beta (https://help.lucid.co/hc/en-us/articles/50234664652948).
- En octubre de 2026: **nuevo editor de Lucidchart** en acceso anticipado, foto de diagrama a mano convertida en diagrama editable, y flujos desde SOP en Confluence (https://lucid.co/blog/lately-at-lucid-october-2026).

**Qué lo hace excelente (INFERENCIA, del producto conocido):**
- Datos vinculados a figuras, formato condicional, capas, contenedores, diagramas generados desde datos (organigramas, nube).
- Es **lo más cerca de "diagrama como modelo"** entre las herramientas horizontales.

### 3.3 FigJam (Figma)

**Precios (HECHO, https://www.figma.com/pricing/):**
- Collab seat (solo FigJam): **USD 3 por mes en Professional y USD 5 en Organization y Enterprise** (anual).
- Full seat: 16, 55 y 90.
- Lectores y comentaristas gratis en planes pagos.
- 500 créditos de IA por mes por Collab seat.

**Exportación (HECHO, https://help.figma.com/hc/en-us/articles/4407699832855):**
- Disponible en todos los planes.
- PNG, JPG y PDF con calidad configurable; CSV de notas y tablas.
- **"SVG exports from FigJam aren't currently supported"**: se copia a un archivo de Figma Design para sacar vectores.
- En el foro (diciembre de 2025) hay quejas porque el PDF no extrae bien el texto y por accesibilidad.

**IA (HECHO, https://help.figma.com/hc/en-us/articles/16822138920343):**
- Generar tableros o diagramas, ordenar notas por tema y resumir.
- Un informe secundario dice que Figma "abrió el canvas a agentes" en marzo de 2026 (blog coommit.com; **no verificado**).

**Qué la hace excelente:** ver §6.

### 3.4 Mural

**Precios (HECHO, https://www.mural.co/pricing):**
- Free: "Unlimited murals with 3 editable murals at a time", 1 espacio de trabajo y salas abiertas.
- Team+: USD 9,99 anual o 12 mensual (con Mural AI).
- Business: USD 17,99 anual, con SSO SAML 2.0.
- Enterprise: a medida.
- La página no detalla exportación.

**Situación de la empresa:** no se encontraron datos financieros 2025-2026 (la búsqueda devolvió homónimos). **No verificado.**

### 3.5 Canva Whiteboards

**Precios y exportación (HECHO vía terceros, no verificado en canva.com):**
- La pizarra está incluida en el plan Free.
- Free exporta PNG, JPG, PDF (estándar y para impresión), MP4 y GIF. SVG y PDF en CMYK son Pro.
- Pro a USD 18 por mes o 144 por año según StyleFactory; otras fuentes dicen 15 o 120. **Contradicción.**

**INFERENCIA:** el riesgo de Canva no es la función; es la **distribución gratuita a cientos de millones** que empuja la pizarra genérica a precio cero.

### 3.6 Microsoft Visio, Whiteboard y Loop

**Precios de Visio (HECHO, https://www.microsoft.com/en-us/microsoft-365/visio/microsoft-visio-plans-and-pricing-compare-visio-options):**
- Visio en Microsoft 365: incluido, solo web.
- Plan 1: **USD 5 por usuario por mes**, anual, solo web.
- Plan 2: **USD 15**, anual, web y escritorio, *"diagrams that support BPMN 2.0"*.
- Perpetuas 2024 (terceros): Standard ~USD 310 y Professional ~USD 580. BPMN y UML solo en Professional.

**Whiteboard (HECHO, https://support.microsoft.com/en-us/whiteboard/retirement-standalone-microsoft-whiteboard-apps):**
- Las apps sueltas de Windows, iOS y Android se retiraron el **16-10-2026**.
- Siguen Whiteboard en Teams y en la web.
- Las pizarras viejas (guardadas en Azure) se migran a OneDrive o se borran, según los reportes del Message Center MC1441775 vistos vía búsqueda.

**Cove (HECHO, TechCrunch 18-03-2026):** Microsoft contrató al equipo del canvas con IA.

**INFERENCIA:**
- VSDX sigue siendo **la lengua franca** de la diagramación empresarial: todos lo importan y pocos lo exportan bien.
- Microsoft está consolidando y simplificando su pizarra, no innovando. Eso deja a usuarios corporativos huérfanos de una pizarra buena dentro de M365.

### 3.7 draw.io / diagrams.net: cómo monetiza

**Empresa (HECHO):**
- **draw.io Ltd** (antes JGraph Ltd), Companies House n.º 04051179, cambió de nombre el 18-09-2025.
- Directores: D. Benson y A. J. Benson. Promedio de **2 empleados** en el ejercicio a 31-08-2025.
- Caja: **£1.616.118** (contra £740.514 un año antes).
- Patrimonio neto: £1.024.654 (contra £663.589), es decir, **+£361.065 de ganancias retenidas en el año**.
- Presenta cuentas abreviadas de "small company", **sin estado de resultados** (no se conoce la facturación).
- Fuente: https://find-and-update.company-information.service.gov.uk/company/04051179/filing-history (cuentas en iXBRL descargadas y leídas el 17-11-2026).
- También existe **draw.io AG (Suiza)**: "both entities jointly develop the software and own the brands", según drawio.com/about vía búsqueda.

**Canal Atlassian (HECHO):**
- La app "draw.io Diagrams (UML, BPMN, AWS, ERD & Flowcharts)" para Confluence Cloud tiene **59.375 instalaciones** y **4,8 de 5 con 1.208 reseñas**.
- La publica **"Seibert – draw.io"** (Platinum Marketplace Partner, "Atlassian Enterprise Certified"), con ediciones Standard y Advanced.
- Fuente: https://marketplace.atlassian.com/apps/1210933/draw-io-diagrams-uml-bpmn-aws-erd-flowcharts

**Lista de precios de Confluence Cloud (HECHO, API pública de Atlassian, https://marketplace.atlassian.com/rest/2/addons/com.mxgraph.confluence.plugins.diagramly/pricing/cloud/live):**

| Usuarios del sitio | USD por año | ≈ USD por usuario por mes |
|---|---|---|
| hasta 10 | 0 | 0 |
| 25 | 505 | 1,68 |
| 100 | 2.020 | 1,68 |
| 500 | 4.995 | 0,83 |
| 1.000 | 7.345 | 0,61 |
| 10.000 | 26.995 | 0,22 |
| 50.000 | 62.995 | 0,10 |

- Se cobra por todos los usuarios del sitio, no solo por quienes dibujan.
- Compárese con Gliffy, que cobra **USD 3,80 por usuario por mes** de 11 a 100 usuarios (HECHO, https://www.gliffy.com/pricing). draw.io cuesta menos de la mitad.

**Otros canales de draw.io (HECHO, https://www.drawio.com/blog):**
- Jira, Confluence Data Center (con draw.io 17.0, sin IA).
- SharePoint: el editor es **gratis** en el Microsoft Marketplace desde el 17-09-2026.
- Agente de Rovo en Confluence (29-10-2026).
- Conectores para Claude, ChatGPT, VS Code y Cursor "sin cuenta" (06-11-2026).
- "Editable diagrams from text" (13-11-2026).
- Herramienta para migrar Gliffy en masa a draw.io (10-09-2026). **Usa la migración como arma comercial.**

**IA de draw.io (HECHO, https://www.drawio.com/docs/manual/generate/ai-models/ y el blog del 04-08-2026):**
- Genera XML de mxGraph editable con Claude, OpenAI o Gemini.
- Permite elegir modelo y usar tu propia clave.
- Tiene un MCP oficial (https://github.com/jgraph/drawio-mcp).
- Se puede desactivar la IA, algo que pide el mercado corporativo.

**Estimaciones de terceros de facturación:**
- Owler: USD 1,7 millones. Latka: USD 880.000. ZoomInfo: menos de USD 5 millones.
- INFERENCIA: casi seguro **subestiman**, porque miden la entidad inglesa de 2 personas y no el canal Atlassian, que factura Atlassian y se reparte con Seibert y la AG suiza.

**ESTIMACIÓN propia de lo que factura el canal Atlassian de draw.io:**
- Método:
  - 59.375 instalaciones en Confluence Cloud.
  - Supuesto: 40–60 % son sitios de hasta 10 usuarios (gratis) o evaluaciones. Quedan ~24.000–36.000 sitios pagos.
  - Precio de lista promedio por sitio pago: USD 700–2.500 por año (mezcla de 25 a 1.000 usuarios).
  - La API lista renovaciones a ~la mitad del precio de lista. No se pudo aclarar si es otra unidad, así que se aplica un descuento del 30 % sobre lo bruto.
  - Atlassian retiene una comisión. No se verificó el porcentaje vigente; se asume 15–25 %.
- Resultado: **USD 12–50 millones por año brutos en Cloud**, más Data Center y Jira, **repartidos entre draw.io y Seibert**.
- Rango ancho a propósito. **No apostar capital sobre esta cifra.**

**Lección de modelo de negocio (INFERENCIA):**
- El producto es gratis en todos lados (web, escritorio, VS Code, SharePoint).
- **Se cobra donde la empresa ya tiene la billetera abierta y el proceso de compra resuelto** (el Marketplace de Atlassian factura, cumple normas y renueva).
- El precio por sitio es tan bajo que nadie lo discute.
- Con un equipo mínimo se acumula caja.
- **Es el modelo "con poco, muchísimo" de la categoría.**

### 3.8 Excalidraw / Excalidraw+

**Precios y funciones (HECHO, https://plus.excalidraw.com/pricing):**
- Free: PNG, SVG y archivo; 10 pedidos de IA por día.
- Plus: **USD 6 por usuario por mes** (14 % de descuento anual).
  - Suma PDF y PPTX por frames, presentaciones y presentación en vivo.
  - 100 pedidos de IA por día o tu propia clave.
  - SOC 2 Type 2.
  - **SSO no aparece.**

**Qué lo hace excelente (INFERENCIA):**
- El trazo a mano comunica "esto es borrador" y baja la barrera para participar.
- Formato `.excalidraw` abierto (JSON), con licencia MIT [no verificado hoy].
- Por eso Kroki lo renderiza como un lenguaje más.

### 3.9 tldraw

**Licencia (HECHO, https://tldraw.dev/community/license):**
- El SDK se puede usar comercialmente **con la marca de agua visible**.
- Una licencia comercial anual la quita. Las de prueba son de 100 días.
- Hay licencia hobby discrecional.
- El precio es "según valor": hay que hablar con ventas (https://tldraw.dev/pricing). Gappsy dice USD 6.000 por año (**no confirmado**).

**IA (HECHO, https://tldraw.dev/starter-kits/agent):**
- Un kit inicial de agentes con proveedores intercambiables (Anthropic, OpenAI, Google).
- Las acciones tipadas se **validan y corrigen** antes de aplicarse: ids duplicados, coordenadas inválidas.
- App MCP en Cursor (03-03-2026).
- **tldraw offline** (16-07-2026): app de escritorio gratis cuyos archivos editan agentes locales como Claude Code.
- Make Real (2023) es reconocida como la primera herramienta de "vibe coding" con tracción, según el propio tldraw.

**INFERENCIA para el holding:**
- tldraw es **la opción más rápida para construir** un canvas nuevo con agentes.
- El costo de licencia y la dependencia de un proveedor de 10 millones de dólares de inversión son un riesgo a medir.
- Alternativas abiertas a evaluar con `/herramientas`: Excalidraw (MIT), maxGraph o mxGraph (motor de draw.io) y React Flow.
- **Ninguna se verificó hoy.**

### 3.10 Whimsical

**Precios y límites (HECHO, https://whimsical.com/pricing):**
- Free: "Create up to 50 board objects per month", 7 días de historial y **"Watermark on exports"**.
- Pro: USD 10 anual o 12 mensual, sin marca de agua.
- Business: USD 20 o 24, con SAML y SCIM.
- Conectar agentes (Claude, ChatGPT, Cursor) es gratis.
- La página se contradice: "boards unlimited" contra "50 objetos por mes".

**Qué lo hace excelente (INFERENCIA):**
- Pocas herramientas, estilos limitados a propósito y conectores que se reacomodan solos.
- **El diagrama sale lindo sin pensar.** Es la mejor lección de "restricción como calidad".

### 3.11 Creately, Gliffy, SmartDraw y Cacoo (la "clase media")

**Creately (HECHO, https://creately.com/plans/):**
- Free: "Up to 45 shapes per diagram" y **sin exportación** (guiones en PNG, JPEG, PDF y SVG). Capterra dice que Free exporta PNG y JPEG: **contradicción**.
- SAML y SCIM solo en Enterprise.
- Precios no visibles en el texto. CostBench reporta Business a **USD 149 por mes fijo** desde el 24-04-2026, no verificado.

**Gliffy (HECHO, https://www.gliffy.com/pricing):**
- Exporta JPEG, PNG y SVG; importa Visio y draw.io.
- **"Cloud: Diagrams become read-only until you renew."**
- La venta es solo por el Atlassian Marketplace.
- En julio de 2026 hay usuarios en la comunidad de Atlassian que buscan salir de Gliffy porque solo exporta PDF, PNG o JPG.

**SmartDraw y Cacoo:** solo agregadores (ver la tabla). **No verificado.**

**INFERENCIA:** esta franja está **estancada y a la defensiva**. Pierde contra draw.io (gratis) por abajo y contra Lucid y Miro por arriba. Es un buen semillero de usuarios para migrar.

### 3.12 Diagramas como código: Mermaid, PlantUML, Kroki, Eraser, Structurizr, IcePanel

**Mermaid Chart (HECHO):**
- Ahora redirige a **mermaid.ai**.
- Free: 3 diagramas, tamaño limitado a 60, 15 créditos de IA.
- Plus: USD 10 por usuario por mes, anual (300 créditos por año).
- Premium: USD 20 (2.000 créditos por año).
- SSO solo en Enterprise.
- Fuente: https://mermaid.ai/pricing

**Kroki (HECHO, https://kroki.io/):** licencia MIT, se puede autoalojar y renderiza más de 30 lenguajes (BPMN, C4, D2, Excalidraw, Mermaid, PlantUML, Structurizr, GraphViz, Vega y otros).

**Eraser (HECHO, https://www.eraser.io/pricing):**
- Free: 3 archivos, 3 créditos de IA.
- Exporta PDF, PNG, SVG y MD en todos los planes.
- Business: USD 45 anual o 60 mensual (cifra llamativa; verificar).

**IcePanel (HECHO, https://icepanel.io/pricing):**
- Free: 1 editor y 100 objetos.
- Growth: USD 40 por editor por mes. Scale: USD 80 desde 20 editores.
- Programa de capacitación: USD 10.000.
- Exporta PNG, PDF, JSON, CSV, HTML y **LLMs.txt**.

**Structurizr:**
- La nube aparece en retiro según un post de Patreon vía búsqueda.
- El servidor cuesta £300, £600 o £900 por mes según usuarios únicos.

**INFERENCIA, clave para el producto:**
- **Los LLM escriben Mermaid, PlantUML y BPMN XML muy bien.**
- El texto es el "formato de intercambio" natural entre agentes.
- El patrón ganador de IcePanel es **"un modelo, muchas vistas"**: el objeto existe una vez y aparece en varios diagramas.
- Una herramienta de procesos debería hacer lo mismo con actividades, roles, sistemas y KPIs.

### 3.13 Napkin.ai, Xmind, Heptabase, Obsidian Canvas, AFFiNE, Milanote, ClickUp, Notion y Freeform

**Napkin (HECHO, https://www.napkin.ai/pricing):**
- Free: 500 créditos por semana, PNG y PDF con **"Napkin branding on visuals"**.
- Plus: USD 9 por mes. Pro: USD 22. Los dos suman SVG y PPT.
- "~1 crédito por palabra".
- Es la prueba de que **"texto a visual" se monetiza con la marca de agua como palanca**.

**Xmind (HECHO, https://xmind.com/pricing):**
- Free: 10 mapas, PNG de a uno y sin quitar la marca de agua.
- Pro: USD 4,92, con SVG, PDF, MD y Office.
- Premium: USD 8,25, con IA de texto a mapa y 500 créditos por mes.

**Heptabase (HECHO, https://heptabase.com/pricing):**
- Pro: USD 8,99 (100 créditos, solo Gemini).
- Premium: USD 17,99 (1.800 créditos, GPT, Claude o Gemini).
- Premium+: USD 53,99.

**Obsidian Canvas (HECHO, https://jsoncanvas.org/):** formato **JSON Canvas**, "an open file format for infinite canvas data", creado para Obsidian y con licencia MIT.

**AFFiNE (HECHO vía búsqueda en affine.pro/pricing):**
- Pro: USD 6,75. Team: USD 10 por asiento.
- Believer: USD 499,99 pago único.
- Free: espacios locales ilimitados y 10 GB en la nube.

**ClickUp (HECHO vía búsqueda en help.clickup.com, artículo 29295148751639):**
- Free: 3 pizarras públicas. Unlimited: 10. Business: sin límite.

**Notion, Milanote y Freeform:** sin datos verificables hoy.

---

## 4. Restricciones de exportación por plan (foco a)

| Herramienta | ¿PDF vectorial? | ¿Alta resolución? | ¿Marca de agua? | ¿Formato editable de salida? | ¿Lock-in? | Fuente |
|---|---|---|---|---|---|---|
| Miro | Por frame "Best (Vector)"; en Free hay contradicción | Solo pago | La ayuda menciona marca de agua en Free | **No** (sin VSDX ni SVG; importa VSDX) | **Alto** | pricing + ayuda + comunidad |
| Lucidchart | Sí (PDF y SVG) | Calidad "print" | Terceros dicen que sí en Free (no oficial) | VSDX **solo pago**; JSON | Medio | help.lucid.co |
| FigJam | PDF configurable; **sin SVG** | Sí | No | No | Medio-alto | help.figma.com |
| Mural | Sin datos | Sin datos | Sin datos | Sin datos | ? | mural.co (no lo dice) |
| Canva | PDF para impresión gratis; **SVG solo Pro** | Sí | No informada | No | Medio | terceros |
| Visio | Sí | Sí | No | **VSDX nativo** | Bajo (es el estándar) | microsoft.com |
| draw.io | Sí | Sí | No | **XML abierto, VSDX, SVG editable** | **Mínimo** | drawio.com |
| Excalidraw | SVG gratis; **PDF solo Plus** | — | No | `.excalidraw` (JSON) | Bajo | plus.excalidraw.com |
| Whimsical | Sin datos | — | **Sí en Free** | No | Medio | whimsical.com |
| Creately | **Free sin exportar** (oficial) | — | — | Sin datos | Alto en Free | creately.com |
| Gliffy | SVG | — | No | No (solo lectura si no renovás) | **Alto** | gliffy.com |
| Napkin | PDF gratis; **SVG solo pago** | — | **Sí en Free** | No | Medio | napkin.ai |
| Xmind | **Free solo PNG** | 2x o 3x en Pro | **Sí en Free** | OPML, MD, Word y Excel en pago | Bajo en pago | xmind.com |
| Eraser | PDF y SVG en todos los planes | — | No dice | Código del diagrama | Bajo | eraser.io |
| IcePanel | PDF y PNG | — | — | JSON, CSV, LLMs.txt | Bajo-medio | icepanel.io |
| yEd | PDF y SVG | — | No | GraphML [no verificado hoy] | Bajo | yworks.com |

**INFERENCIA, patrón de la categoría:**
1. La **marca de agua y la baja resolución** son la palanca de cobro de las herramientas livianas (Whimsical, Napkin, Xmind, Miro).
2. El **formato editable de salida** es lo que los grandes **no dan** (Miro, FigJam) o **cobran** (Lucid y VSDX).
3. Solo draw.io y Visio tratan el archivo como algo del cliente.

**Una herramienta nueva que exporte gratis SVG, PDF vectorial y un formato abierto, con ida y vuelta a VSDX, BPMN y Mermaid, se diferencia en algo que el comprador corporativo ya pide por escrito.**

---

## 5. Quejas reales de usuarios (foco b)

| Tema | Evidencia | Herramienta |
|---|---|---|
| Rendimiento en tableros grandes | "Boards are very laggy and slow on desktop app and web app" (#12191); mapa mental de ~1.000 nodos que "se congela" (#13452); la ayuda oficial admite caídas con muchos usuarios y tableros grandes y sugiere dividir. TrustRadius: "with lots of people… stalls virtually to a halt" | Miro |
| Lock-in o exportación | Pedido de exportar a Visio abierto desde 2021 ("#1 reason my company won't sign on"); pedido de SVG sin respuesta | Miro |
| Exportación | Sin SVG; PDF con texto que no se extrae bien; accesibilidad | FigJam (Figma Forum, diciembre de 2025) |
| Facturación o precio | Cobros de asientos no buscados, facturas inesperadas (2026); Business +25 % (febrero de 2026, PricingSaaS) | Miro |
| Free muy corto | "¿3 documentos en total o por mes?" (Lucid Community #3421); "60 objects per document" (#3346) | Lucid |
| Rehén de la renovación | Diagramas en solo lectura si no se renueva; usuarios que buscan salir porque solo exporta PDF, PNG o JPG (Atlassian Community, julio de 2026) | Gliffy |
| Integraciones frágiles | "draw.io does not always save back to Miro and diagrams are blurry" (#15749) | Miro + draw.io |
| Curva de aprendizaje | No se verificó hoy en G2 o Capterra. INFERENCIA: Visio, Lucid y yEd son "potentes pero duros"; Miro y FigJam "fáciles pero superficiales" para diagramas formales | — |

Fuentes: hilos en https://community.miro.com/ (números citados), https://forum.figma.com/, https://community.lucid.co/, https://community.atlassian.com/ (consultados vía búsqueda el 17-11-2026).

---

## 6. Por qué Miro y FigJam se sienten excelentes (foco c)

**INFERENCIA:** es análisis de producto, no hay una fuente única. Los ejemplos describen comportamientos, no aspectos visuales a copiar.

1. **Arranque instantáneo.**
   - Un tablero vacío con el cursor listo y plantillas a un toque.
   - FigJam abre con herramientas grandes y de colores en una barra inferior: nunca hay que buscar qué hacer.
2. **Conectores con "imán".**
   - La flecha se engancha a puntos de anclaje y se re-rutea sola al mover figuras.
   - Arrastrar desde el "+" de una figura crea la siguiente ya conectada y alineada. Así se arma un flujo sin soltar el mouse.
3. **Snapping y guías inteligentes.**
   - Alineación y espaciado equidistante con guías que aparecen solo al acercarse.
   - Distribución automática.
4. **Presencia viva.**
   - Cursores con nombre, "seguir a alguien", chat en el cursor (FigJam) y "traer a todos a mi vista" (Miro).
   - Avatares arriba que indican dónde está cada uno.
5. **Rituales de facilitación integrados.**
   - Temporizador con sonido, votación con puntos (anónima, con límite por persona), modo privado para notas, música, sellos, emotes y "high five".
   - Todo **dentro** del canvas. No hace falta otra app.
6. **Frames como unidad de todo.**
   - El frame sirve de página para exportar, diapositiva para presentar, ancla de navegación y alcance de permisos.
7. **Presentar desde el canvas.**
   - Los frames se vuelven diapositivas sin salir.
   - La transición con zoom mantiene el contexto espacial.
8. **Notas que se escriben solas.**
   - Tab o Enter crea la siguiente nota al lado.
   - Pegar una lista crea una nota por línea.
   - Agrupado y ordenado por tema con IA.
9. **Atajos de una tecla** (N, S, R, L, T) y paleta de comandos.
10. **Rendimiento percibido.**
    - El zoom y el desplazamiento a 60 fps y el renderizado progresivo hacen que se "sienta" rápido aunque el tablero sea enorme. Miro falla justamente cuando esto se rompe (§5).
11. **Widgets y apps embebidas** (FigJam) e integraciones vivas (Jira y Asana en Miro): las tarjetas se actualizan solas.
12. **Lectores gratis.** Compartir no cuesta (FigJam explícitamente): el tablero se viraliza dentro de la empresa.
13. **Tono emocional.** Stickers, color y microanimaciones bajan la seriedad, y eso sube la participación en talleres.

---

## 7. Cierre

### 7.1 Los 15 patrones de UX que debería tomar una herramienta nueva

Se toman los patrones, sin marcas ni aspecto.

1. **Crear desde el borde.** Arrastrar desde un "+" de la figura crea la siguiente ya conectada y alineada, con selector de tipo en el lugar.
2. **Conectores con re-ruteo ortogonal automático**, anclajes visibles solo al acercarse y etiquetas que se acomodan solas.
3. **Guías de alineación y espaciado equidistante** que aparecen solo cuando importan.
4. **Diseño automático bajo pedido**, como yEd: "ordenar este flujo" de arriba abajo o en carriles, sin perder lo que el usuario fijó a mano.
5. **Un modelo, muchas vistas**, como IcePanel y Lucid: el objeto (actividad, rol, sistema) existe una vez y aparece en varios diagramas; editarlo en un lugar lo cambia en todos.
6. **Datos en las figuras con formato condicional**: tiempo, costo, responsable y estado se ven como color, ícono o grosor.
7. **Frames como unidad universal**: exportar, presentar, permisos, navegación y comentarios.
8. **Paleta de comandos y atajos de una tecla**, con la barra visible para quien no los sabe.
9. **Presencia viva**: cursores con nombre, seguir, convocar y el canvas como sala.
10. **Kit de facilitación en el canvas**: temporizador, votación con límite, modo privado y "revelar".
11. **Ida y vuelta texto ↔ diagrama**: pegar Mermaid, BPMN o texto libre da un diagrama editable, y cualquier diagrama se ve como texto (lo que los agentes leen y escriben).
12. **IA que propone cambios con vista previa** (como un diff): el agente sugiere, el humano acepta. Las acciones del agente se validan antes de aplicarse, como en tldraw.
13. **Historial de versiones con comparación visual** y nombres de versión ("antes del taller").
14. **Lectores y comentaristas gratis**, con enlace sin cuenta: viralidad interna.
15. **Rendimiento como función**: miles de objetos fluidos y carga progresiva. Medir y publicar el número.

### 7.2 Las 10 brechas o necesidades mal resueltas

1. **Interoperabilidad editable.** Nadie (salvo draw.io) garantiza una ida y vuelta sin pérdida entre VSDX, BPMN, drawio, Mermaid y JSON Canvas. Miro importa y no exporta, Lucid cobra y FigJam no da SVG.
2. **Diagrama con semántica.** Las pizarras guardan "figuras", no "procesos". No se puede preguntar "¿qué actividades no tienen responsable?" ni simular.
3. **Del dibujo al modelo ejecutable o simulable.** El salto de pizarra a BPM es un cambio de herramienta, con retrabajo.
4. **Rendimiento con tableros grandes y muchos usuarios** (quejas crónicas de Miro).
5. **Precios con sorpresas** (asientos que se suman, subas de 25 %, créditos de IA que se agotan) y **free tiers que encierran** (3 tableros o documentos).
6. **Canvas como contexto para agentes**, con permisos, auditoría y "propuesta → aprobación". Hoy los MCP leen y escriben, pero falta gobernanza de qué hizo el agente.
7. **Exportación digna para entregables**: PDF vectorial accesible con texto seleccionable, PPTX editable y SVG limpio. Todos fallan en algo.
8. **Español y mercados emergentes**: precios en USD a valor de EE. UU., sin facturación local ni plantillas regionales (normativas, procesos de logística o pymes de LatAm). INFERENCIA: no se relevó precio regional hoy.
9. **Soberanía y privacidad**: autoalojamiento, "sin salida de datos", IA desactivable. draw.io lo explota (Zero Egress, sin cuenta) y pocos lo ofrecen con buena UX.
10. **Continuidad**: consolidación (Bending Spoons con Miro, Microsoft retirando Whiteboard, la nube de Structurizr en retiro, Cove cerrado con borrado de datos). Los clientes temen perder sus diagramas, otra vez un tema de formato abierto.

### 7.3 Dónde podría ganar un recién llegado

Todo esto es INFERENCIA, salvo los datos citados.

1. **No competir con la pizarra genérica.** El mercado la valuó a ~2,3x ARR (Miro) y Canva la regala. Ganar ahí exige marketing que el holding no tiene.
2. **Cuña: "el diagrama de procesos abierto y vivo".**
   - Una pizarra rápida, con UX de nivel Miro o FigJam para capturar el proceso en un taller.
   - Que por dentro guarda un **modelo semántico** (actividades, roles, sistemas, tiempos, costos) exportable sin pérdida a BPMN, VSDX, drawio y Mermaid.
   - Y que se **simula** (colas, tiempos, cuellos de botella). Es el puente con el informe de BPM.
3. **Nativo para agentes desde el día uno.**
   - Servidor MCP y app dentro de ChatGPT, Claude y Copilot.
   - La demanda está medida: 16 millones de llamadas al MCP de Miro, la mayoría de Claude, y la mayoría de quienes lo usan no son ingenieros.
   - La propuesta: "pedile a tu asistente que mapee el proceso; revisalo y simulalo acá". **Quién vende por el fundador: la tienda de apps de los asistentes.**
4. **Modelo draw.io de distribución.**
   - Producto gratis, generoso con la exportación (sin marca de agua en vectorial) y cobro **donde la empresa ya paga**: marketplaces de Atlassian, Microsoft y Google Workspace, y apps de asistentes.
   - Precio por sitio bajo y predecible.
   - La lista de draw.io (USD 2.020 al año para 100 usuarios) marca el techo de precio en ese canal.
5. **Migración como motor de adquisición.**
   - Importadores de Gliffy (solo lectura si no se renueva), Miro (no exporta VSDX), Lucid (VSDX pago) y Visio.
   - Los que se van de Miro tras la compra de Bending Spoons son un público concreto en 2027.
6. **Vertical donde el fundador sabe: logística y operaciones de pymes de LatAm.**
   - Plantillas de procesos (recepción, picking, última milla, devoluciones) con KPIs y simulación.
   - En español, con cobro local.
   - Ningún jugador global apunta a esto.
7. **Construir sobre piezas existentes** (doctrina 09):
   - Evaluar con `/herramientas` tldraw SDK (licencia paga, kit de agentes), Excalidraw (MIT), maxGraph o mxGraph (motor de draw.io), React Flow, bpmn-js y JSON Canvas como formato.
   - **No verificado hoy**: licencias y costos a confirmar en fuente oficial antes de elegir.

**Riesgos a vigilar:**
- Miro, Lucid (Process Agent) y draw.io (Rovo, generar desde texto) avanzan rápido en "proceso con IA".
- La diferenciación tiene que ser **modelo, simulación e interoperabilidad**, no "genera diagramas con IA", que ya es commodity.

---

## 8. Fuentes principales (consultadas el 17-11-2026)

**Precios oficiales:**
- miro.com/pricing
- figma.com/pricing
- mural.co/pricing
- whimsical.com/pricing
- eraser.io/pricing
- mermaid.ai/pricing
- plus.excalidraw.com/pricing
- tldraw.dev/pricing
- tldraw.dev/community/license
- creately.com/plans
- gliffy.com/pricing
- napkin.ai/pricing
- xmind.com/pricing
- heptabase.com/pricing
- icepanel.io/pricing
- microsoft.com (página de planes de Visio)
- yworks.com/products/yed
- kroki.io
- jsoncanvas.org
- structurizr.com
- omnigroup.com/omnigraffle

**Ayudas y documentación:**
- help.lucid.co/hc/en-us/articles/16324571257492
- help.figma.com/hc/en-us/articles/4407699832855
- help.figma.com/hc/en-us/articles/16822138920343
- drawio.com/blog
- drawio.com/docs/manual/generate/ai-models/
- github.com/jgraph/drawio-mcp
- tldraw.dev/starter-kits/agent
- support.microsoft.com (retiro de Whiteboard)

**Mercado:**
- miro.com/blog/miro-bending-spoons/
- thenextweb.com/news/bending-spoons-completes-miro-deal
- pulse2.com (ARR de Miro)
- reworked.co (compra de Miro)
- miro.com/newsroom (MCP, 29-09-2026; Canvas 26, 19-05-2026)
- theautochannel.com (Lucid, USD 300 millones de ARR)
- tldraw.dev/blog/announcing-tldraw-series-a
- techcrunch.com (Cove, 18-03-2026)

**draw.io:**
- Companies House 04051179 (cuentas al 31-08-2025, iXBRL)
- marketplace.atlassian.com/apps/1210933
- API de precios del Marketplace (`/rest/2/addons/com.mxgraph.confluence.plugins.diagramly/pricing/cloud/live`)

**Quejas:**
- community.miro.com (#12191, #13452, #28251, #29254, #28155, ideas/visio-integration-663, ideas/export-to-svg-2317, #15749)
- community.lucid.co (#3346, #3421)
- forum.figma.com
- community.atlassian.com (Gliffy, julio de 2026)

**Agregadores (baja confianza, marcados en el texto):** costbench.com, pricingsaas.com, toolradar.com, capterra.com, stylefactoryproductions.com, gappsy.com.

**Pendiente de re-verificar en fuente primaria:**
- Precios de Lucid (junio de 2026), Canva, SmartDraw, Cacoo, OmniGraffle, Milanote, Creately y Eraser Business.
- Exportación de Mural.
- Licencias de Excalidraw, maxGraph y React Flow.
- Facturación de draw.io AG y Seibert.
- Puntajes de G2 y Capterra.
