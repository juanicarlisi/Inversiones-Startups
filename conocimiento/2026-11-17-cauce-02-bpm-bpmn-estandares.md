# Benchmark: modelado de procesos, BPM/BPMN, documentación de procesos y estándares

**Fecha de corte:** 17-11-2026 · **Frente:** 02 (BPM, BPMN y estándares) · **Autor:** investigador de mercado (Claude)

**Cómo leer este informe.** Cada afirmación lleva una etiqueta:
- **HECHO**: con URL y fecha de consulta. Todas las consultas son del 17-11-2026 salvo que se diga otra cosa.
- **ESTIMACIÓN**: con el método.
- **INFERENCIA**: razonamiento propio.
- **PREVIO (sin verificar hoy)**: algo que sé de antes y no pude volver a comprobar en esta sesión.

**Límites de esta investigación (HECHO).**
- Se terminó el presupuesto de búsquedas web de la sesión, que comparten todos los agentes. Varios puntos quedaron sin verificar en fuente primaria: Ardoq/LeanIX en detalle, QPR, Interfacing EPC, MID Innovator/Bpanda, el estado de CMMN, ArchiMate, ISO 5807 y los Market Guides de Gartner. Están marcados como PREVIO o como pendientes.
- Algunos sitios devolvieron 403 a la lectura directa: sparxsystems.com, iso.org y sap.com (Joule). Para esos usé resultados de búsqueda.
- Casi ningún precio enterprise es público. Cuando el único dato viene de un agregador o de un reseller, lo digo.

---

## 0. Resumen ejecutivo

1. **La categoría está partida en cuatro mundos que no se hablan:**
   - modelado riguroso (Bizagi Modeler, Signavio, ARIS, ADONIS, Blueworks, Visual Paradigm, Sparx);
   - ejecución y orquestación (Camunda, Appian, Pega, Bizagi Automation, Ofelia/Bonita, ProcessMaker);
   - documentación operativa y SOPs (Process Street, SweetProcess, Trainual, Scribe, Tango, Nintex Process Manager);
   - arquitectura empresarial (Bizzdesign/HOPEX/Alfabet, Ardoq, LeanIX).

   Ninguno resuelve bien el puente entre la pizarra libre (Miro, Lucid) y el modelo formal. **(INFERENCIA)**, apoyada en las fichas de abajo.
2. **El piso de precio del modelado formal es cero.**
   - Bizagi Modeler sigue gratis: es freeware, con modelos ilimitados, simulación y publicación a la web. HECHO: [help.bizagi.com, actualizada 22-09-2025](https://help.bizagi.com/platform/en/intro_welcome.htm).
   - Camunda da modelado BPMN/DMN gratis e ilimitado. HECHO: [camunda.com/pricing](https://camunda.com/pricing/).
   - ADONIS tiene una Community Edition gratis para siempre. HECHO: [boc-group.com](https://www.boc-group.com/en/adonis/get-started/).

   No se compite cobrando el dibujo: se cobra la colaboración, el gobierno, el repositorio y la IA. **(INFERENCIA)**
3. **El techo de precio está en el gobierno de procesos enterprise.** El dato más duro es Nintex Process Manager en el G-Cloud del Reino Unido (julio de 2025): £10.800 por año el plan Essentials y £61.200 el Expert. HECHO: [documento de precios G-Cloud 14](https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/720023/514230927932387-pricing-document-2025-07-22-1254.pdf). Signavio y ARIS no publican precios.
4. **BPMN 2.0.2 (enero de 2014) sigue siendo la versión vigente.** No hay BPMN 2.1 ni 3.0 publicados. HECHO: [omg.org/spec/BPMN](https://www.omg.org/spec/BPMN/). El estándar que sí se mueve es DMN: 1.6 formal y 1.7 beta, ambos con fecha de septiembre de 2026. HECHO: [omg.org/spec/DMN](https://www.omg.org/spec/DMN/).
5. **En Argentina hay una simbología nativa, el cursograma IRAM 34501/34502.** La recomienda el propio Estado: la Tesorería General de la Nación la incorpora en sus pautas para instructivos de procesos. HECHO: [TGN, versión 1.0, 09-01-2019](https://www.argentina.gob.ar/sites/default/files/pautas-y-criterios-para-elaboracion-instructivos-procesos-tgn.pdf). Ninguna herramienta global la soporta de forma nativa (INFERENCIA, por ausencia en todas las fichas revisadas). Es un diferencial local barato.
6. **La IA ya es requisito en los grandes**, siempre generando el modelo desde texto o documentos:
   - Signavio: Joule y «Text to Process».
   - ARIS: AI Companion, que genera BPMN/EPC desde documentos y en 2026 solo está en SaaS.
   - IBM: Blueworks Live IQ.
   - Ardoq: AI Process Modeling.
   - Pega: Blueprint, gratis para diseñar.
   - ADONIS: asistente de modelado.

   Ninguno mantiene viva la documentación a partir de lo que pasa en la operación (INFERENCIA).
7. **La consolidación y los cambios de dueño generan clientes huérfanos o incómodos.**
   - Software AG se desarmó y ARIS quedó como negocio separado bajo Silver Lake.
   - MEGA y Alfabet se fusionaron dentro de Bizzdesign.
   - Bonitasoft pasó a llamarse Ofelia (mayo-junio de 2026).
   - ProcessMaker se fusionó con Decisions (noviembre de 2025).
   - Camunda cerró el uso gratis de Zeebe en producción desde la 8.6.
   - Bizagi retiró los planes Professional y Workgroup del Modeler.

   (HECHOS: fuentes en cada ficha.)

---

## 1. Mapa de la categoría

| Segmento | Qué compra el cliente | Jugadores | Precio típico (ver §3) |
|---|---|---|---|
| A. Modelado y análisis de procesos (BPA) | Repositorio de procesos, notación rigurosa, publicación, gobierno | Bizagi Modeler, SAP Signavio, ARIS, ADONIS, IBM Blueworks Live, iGrafx, Trisotech, Cardanit, Heflo, Visual Paradigm, Sparx EA, MID Innovator/Bpanda, QPR, Interfacing EPC | De 0 a más de USD 2.000 por modelador por año |
| B. Ejecución, orquestación y low-code BPM | Motor que ejecuta BPMN, formularios, integraciones, agentes de IA | Camunda, Bizagi Automation, Appian, Pega, Ofelia/Bonita, ProcessMaker/Decisions, AuraQuantic, Kissflow, Pipefy | De USD 26 a 65 por usuario por mes (Pipefy) a contratos de seis cifras |
| C. Documentación operativa, SOPs y onboarding | Procedimientos paso a paso, checklists, capacitación, captura automática | Nintex Process Manager (ex-Promapp), Process Street, SweetProcess, Trainual, Scribe, Tango, Skore (hoy Liberty Spark) | De USD 15 a 23 por usuario por mes (Tango, Scribe) a £10.800 por año o más (Nintex) |
| D. Arquitectura empresarial (EA) | Mapa de aplicaciones, capacidades y procesos, y transformación | Bizzdesign (con HOPEX y Alfabet), Ardoq, SAP LeanIX, Sparx EA | Por aplicación o a medida |
| E. Pizarra y diagramación general (otro frente) | Dibujo libre y colaborativo | Miro, Lucid, Visio, draw.io | De 0 a USD 20 por usuario por mes |

Process mining (Celonis, Signavio Process Intelligence, ARIS) es un segmento vecino. El software de process mining facturó unos USD 1.100 millones en 2024 (+31,7 %), y Celonis tiene el 47,4 %. HECHO: [processexcellencenetwork.com sobre el MQ de Gartner 2025](https://www.processexcellencenetwork.com/process-mining/articles/highlights-gartners-2025-magic-quadrant-process-mining).

---

## 2. Benchmark por herramienta

### 2.1 Los tres de referencia (análisis largo)

#### Bizagi (Colombia y Reino Unido)
- **Para quién.** Analistas de procesos, áreas de calidad y organización, universidades y pymes o grandes empresas de Latinoamérica que modelan en BPMN. Las que ejecutan además compran Bizagi Automation.
- **Producto.**
  - **Modeler de escritorio (Windows), freeware.** Un editor modela, documenta, simula y publica con procesos y modelos ilimitados guardados en archivos `.bpm` locales. Exporta documentación a Word, PDF, Web (HTML) y Wiki. Importa y exporta Visio, XPDL y BPMN. HECHO: [help.bizagi.com, Modeler 4.3, actualizada 22-09-2025](https://help.bizagi.com/platform/en/intro_welcome.htm).
  - **Suscripción Enterprise (Modeler Services en la nube).** Suma repositorio central, edición simultánea, comentarios, publicación con logo corporativo y roles: editores, contribuidores que comentan y usuarios finales que consultan. Mismo HECHO.
  - **Cambio de licenciamiento.** Con el Modeler 4.0 (nota de versión fechada «07/11/22»), Bizagi retiró los planes Professional y Workgroup y pasó esas suscripciones al plan gratis.
    - Los ex-pagos perdieron nube, carpetas, logo, cadena de valor, versionado y colaboración.
    - A cambio, el plan gratis ganó simulación multiescenario y publicación a la web y a SharePoint.
    - Fuente: HECHO, [releasenotes.bizagi.com](https://releasenotes.bizagi.com/en/release-notes/releases/modeler-4-0).
  - **Qué pasó en 2025-2026.** No encontré ninguna señal de que el Modeler dejara de ser gratis. Lo nuevo es comercial: la plataforma se cobra por consumo, con «Bizagi Processing Units» (BPU), y la IA se mide aparte en BPU por tokens.
    - Fuente del cobro por consumo: [rfp.wiki](https://www.rfp.wiki/enterprise-software-enterprise-application-software-eas-enterprise-service-management-esm/business-process-management-platforms/flowforma/bizagi), un agregador.
    - El EULA de nube se actualizó a la versión 5.0 en abril de 2026; no verifiqué si toca al Modeler gratis.
    - Etiqueta: HECHO de fuente secundaria.
- **Simulación en 4 niveles** (HECHO: [help.bizagi.com/simulation_levels](https://help.bizagi.com/platform/en/simulation_levels.htm)):
  1. **Validación del proceso:** compuertas, enrutamiento y probabilidades.
  2. **Análisis de tiempos:** tiempo de punta a punta, con recursos infinitos.
  3. **Análisis de recursos:** capacidad finita, colas y espera por actividad.
  4. **Análisis de calendarios:** turnos, feriados y horarios.

  Los niveles son independientes. Desde la 4.0 también simula con tiempos y distribuciones tomados de logs de process mining (nota de versión 4.0).
- **IA.** Está en la plataforma de automatización, no en el Modeler: AI Agents, AI Workers y «Ask Ada», con un AI Hub. Fuente: [kissflow.com](https://kissflow.com/alternatives/bizagi-ai-review/), una reseña escrita por un competidor; HECHO de fuente secundaria. La documentación del Modeler 4.3 no menciona IA (HECHO, misma URL de help).
- **Precio.**
  - Modeler: USD 0.
  - Modeler Services y la plataforma: a cotizar. No hay precio público.
  - Un usuario de IT Central Station reporta USD 550 por usuario, que después subieron a 800, sin fecha. Fuente: [itcentralstation](https://www.itcentralstation.com/products/bizagi-pricing). Es dato anecdótico.
- **Quejas.**
  - «Fácil de usar pero poco confiable, se cuelga seguido» y falta de funciones esenciales de modelado. Fuente: [Capterra](https://www.capterra.com/p/127621/BPM-Suite/reviews/?page=2), HECHO.
  - Cuesta encajar el diagrama en una página al publicar.
  - G2 lista «Performance Issues» entre sus contras. Fuente: [G2](https://www.g2.com/compare/bizagi-vs-sap-signavio).
  - INFERENCIA: es escritorio solo para Windows, con una interfaz de la era Office.
- **Presencia académica.** El Bizagi Academy Program da la solución enterprise completa gratis a universidades para uso no comercial. HECHO: [bizagi.com/solutions/education](https://bizagi.com/en/solutions/education). Hay docentes en Colombia que lo usan para enseñar (HECHO, [PeerSpot](https://www.peerspot.com/products/bizagi-reviews)).

#### SAP Signavio (Alemania; de SAP desde 2021, PREVIO)
- **Para quién.** Grandes empresas, sobre todo las que migran a SAP S/4HANA (programa RISE). Es el «process layer» de la transformación SAP.
- **Producto.**
  - Process Manager: modelado BPMN/DMN, diccionario de objetos y versionado.
  - Collaboration Hub: lectura y comentarios para toda la empresa, que funciona como portal de procesos.
  - Process Intelligence: process mining.
  - Process Insights y Journey Modeler (PREVIO).
- **IA.** «Joule with SAP Signavio» lista «Text to Process» en Process Modeler y es compatible con Process Intelligence. Está incluida con una suscripción Joule Base, sin costo extra, pero exige tener esa suscripción. HECHO: [sap.com, resultado de búsqueda](https://www.sap.com/products/business-transformation-management/joule-with-sap-signavio-solutions.html); la lectura directa dio 403.
- **Precio.** SAP no publica precios.
  - Consultoras y reseñas hablan de USD 2.000 a 3.000 por licencia de modelador por año, más el Hub. Fuentes: [PeerSpot](https://www.peerspot.com/questions/what-is-your-experience-regarding-pricing-and-costs-for-signavio-process-manager) y [Redress Compliance](https://redresscompliance.com/sap-signavio-licensing-guide-pricing-negotiation).
  - Un usuario reporta unas 2.500 por año la licencia enterprise y unas 30 libras por año la de colaboración, vendida en bloques.
  - Etiqueta: HECHO de fuente secundaria; varían mucho entre sí.
- **Quejas.**
  - Caro y pensado para empresas grandes.
  - Interfaz «no amigable» según algunos usuarios, aunque otros la elogian.
  - No crea un mapa de procesos desde un Excel.
  - Fuente: [IT Central Station](https://www.itcentralstation.com/products/sap-signavio-process-manager-reviews/page-7), HECHO.
- **Fortaleza clave (INFERENCIA).** Combina, en el mismo producto, un diccionario de objetos compartido (roles, sistemas, documentos reutilizados entre diagramas), un portal de lectura barato para toda la empresa, el vínculo con el process mining (modelo contra realidad) y los contenidos de referencia de SAP.

#### Camunda (Alemania)
- **Para quién.** Equipos de desarrollo que orquestan procesos y agentes de IA con BPMN ejecutable.
- **Producto.**
  - Desktop Modeler y Web Modeler.
  - Motor Zeebe (Camunda 8), más Operate, Tasklist y Optimize.
  - Las librerías bpmn-js, dmn-js y form-js, base de decenas de herramientas.
- **Licencia de las librerías.** La licencia bpmn.io permite uso comercial gratis, pero obliga a dejar visible la marca de agua de bpmn.io, sin taparla. HECHO: [bpmn.io/license](https://bpmn.io/license/).

  INFERENCIA relevante para construir: usar bpmn-js ahorra meses, pero deja su marca a la vista; un editor propio en serio necesita su propio motor de dibujo.
- **Licenciamiento de Camunda 8.**
  - Desde la 8.6 (8 de octubre de 2024), Self-Managed en producción requiere licencia comercial, incluido Zeebe, que antes era gratis en producción hasta la 8.5. El desarrollo sigue gratis y el código está bajo la Camunda License 1.0. HECHO: [camunda.com/blog, octubre de 2024](https://camunda.com/blog/2024/10/camunda-licensing-what-you-need-to-know/).
  - El plan Starter (unos €99 por mes) se discontinuó en el segundo trimestre de 2025. HECHO de fuente secundaria: [pricingsaas](https://pricingsaas.com/companies/camunda/diffs/2025Q2).
  - En julio de 2026 la página de precios se reorganizó: Self-Managed Development gratis, Production con licencia, y SaaS con 30 días de prueba. Se sacó el tope de 5 asientos del plan gratis. Fuente: [pricingsaas 2026W28](https://pricingsaas.com/companies/camunda/diffs/2026W28).
  - La página oficial confirma que el modelado BPMN/DMN sigue gratis e ilimitado después de la prueba y que la producción exige Enterprise. HECHO: [camunda.com/pricing](https://camunda.com/pricing/).
- **Fortaleza (INFERENCIA).** Es el estándar de facto del BPMN ejecutable: modelo igual a código, con versionado y Git Sync en el Web Modeler. Tiene el ecosistema open source más grande de BPMN.
- **Debilidad (INFERENCIA).** Es para desarrolladores: no sirve como repositorio de documentación de negocio ni como portal de procesos para no técnicos. Camunda 7 llega al fin de su vida, lo que dio lugar a forks como Operaton, CIB seven y Fluxnova. Fuente: [wz-it.com](https://wz-it.com/en/blog/camunda-7-end-of-life-operaton-cibseven-fluxnova-compared/), HECHO de fuente secundaria.

### 2.2 Modelado y análisis (segmento A): resto

| Herramienta | Para quién | Diferencial | IA (verificada) | Gobierno y portal | Precio fechado (consulta 17-11-2026) |
|---|---|---|---|---|---|
| **ARIS** (ex-IDS Scheer y Software AG; desde enero de 2025 negocio separado dentro de Software GmbH, controlado por Silver Lake) | Grandes empresas reguladas, Europa | Método ARIS (EPC/eEPC, house of ARIS), repositorio enterprise, riesgo y control (ARIS GRC), process mining | AI Companion: chat en el portal y generación de borradores BPMN o EPC desde documentos, reutilizando objetos del repositorio (release 10.2026.4, SaaS). Fuente: [ariscommunity, 24-06-2026](https://ariscommunity.com/users/sabine-steffensky/2026-06-24-what%E2%80%99s-new-aris-ai-companion-your-process-knowledge-activated). En on-premise está «en evaluación» según un foro de abril de 2026 | Muy fuerte: flujos de aprobación, publicación, GRC | No público. En 2026 nombró nuevo CEO con estrategia de «IA agéntica» (solo el titular, sin verificar) y es socio de la nube soberana europea de AWS (08-06-2026). Fuente de propiedad: [diginomica](https://diginomica.com/software-ag-retrenches-aris-adabas-natural) y [computerweekly](https://www.computerweekly.com/news/366617765/Software-AG-shrinks-with-sale-of-Alfabet-and-Cumulocity) |
| **ADONIS** (BOC Group, Austria) | Europa, sector público, calidad y riesgo | Gobierno configurable, flujo de publicación, ganador autodeclarado del MIWG 2021 | Su página menciona «AI-powered design & insights», guía para crear BPMN, interpretación con IA en el portal y process mining con IA | Fuerte (Grow: flujo de liberación, API de lectura y escritura) | **Community: €0** (1 usuario, procesos limitados, hasta 256 modelos o 2.000 objetos). **Starter: desde €99 por mes** (1 asiento). **Grow: desde €1.195 por mes** (5 asientos, facturación anual). HECHO: [boc-group.com](https://www.boc-group.com/en/adonis/get-started/) y [soporte BOC](https://support.boc-group.com/hc/en-us/articles/21892187399570-Differences-between-Community-Starter-and-Enterprise-Edition). Un resultado de búsqueda anterior mostraba €1.145 para Grow: el precio cambió hace poco |
| **IBM Blueworks Live** | Analistas de negocio en empresas IBM | Modelado simple en la nube, «discovery map» (PREVIO) | Blueworks Live IQ: evaluación guiada por chat, recomendaciones y chequeo de consistencia BPMN | Revisión y aprobación por rol | **Editor desde USD 56,20; Contributor USD 11,25; Viewer USD 225 por paquete de 100**, «por usuario autorizado»; la página no aclara el período (los agregadores dicen por mes). 20 % de descuento hasta el 31-12-2026. HECHO: [ibm.com](https://www.ibm.com/products/blueworkslive/pricing) |
| **iGrafx Process360 Live** | Calidad, riesgo, Lean y Six Sigma | Simulación fuerte, histórica | No verificado | Sí (riesgos y controles: PREVIO) | Prueba de 30 días; precio a pedido. HECHO: [softwareadvice](https://www.softwareadvice.com/bpm/igrafx-profile/) |
| **Trisotech** (Canadá) | Salud, seguros, analistas de decisiones | El único que trabaja «en serio» los tres estándares OMG: BPMN, CMMN y DMN (más SDMN) | No verificado | Sí | Precio no público. Agregadores: «desde USD 360» para la Digital Enterprise Suite, con unidad confusa. Prueba de 7 días. Fuente: [Capterra](https://www.capterra.com/p/133274/Digital-Enterprise-Suite/) |
| **Cardanit** (Italia) | Pymes, educación | BPMN más DMN más simulación BPSim, en la nube y barato | No verificado | Básico | **Basic gratis** (5 proyectos de 30 elementos, exporta PDF o XML). **Desde €25 por usuario**; anual en escalones de €250, €200 y €150 por licencia por año. Fuente: [Capterra UK](https://www.capterra.co.uk/software/1014095/cardanit), agregador |
| **HEFLO** (Brasil) | Pymes y empresas medianas de Brasil y Latinoamérica | BPMN más documentación más automatización; servidores en São Paulo; «Process Sprint», una consultoría con IA | Incluida en Enterprise | Portal de documentación (limitado en Lite, completo en Enterprise) | Academic gratis; Lite se compra dentro de la app; Enterprise a pedido. HECHO: [heflo.com/plans](https://www.heflo.com/plans). SourceForge muestra USD 10 por usuario por mes, sin fecha |
| **Visual Paradigm** (Hong Kong) | Analistas, ingenieros de software, estudiantes | Suite enorme: UML, BPMN, ArchiMate, ERD, Doc Composer | No verificado en esta sesión | Básico (Teamwork Server) | **Suscripción por mes: Modeler USD 6, Standard USD 19, Professional USD 35 a 39, Enterprise USD 89 a 99.** Licencia flotante perpetua: Modeler USD 99, Standard 349, Professional 799, Enterprise 1.999. BPMN en todas las ediciones. HECHO: [visual-paradigm.com/shop](https://www.visual-paradigm.com/shop/) y [página de licencias](https://circle.visual-paradigm.com/docs/introduction-and-system-requirements/introduction-of-visual-paradigm/licensing-options/) |
| **Sparx Enterprise Architect** (Australia) | Arquitectos e ingenieros de sistemas | Todo UML, SysML, BPMN, ArchiMate y BPSim; motor BPSim aparte (MDG BPSim Execution Engine) | No verificado | Repositorio en base de datos (Corporate en adelante) | Ediciones Professional, Corporate, Unified y Ultimate, con licencia por usuario nombrado o flotante y 12 meses de soporte. **No pude leer los precios** (403 en sparxsystems.com; ComponentSource sin cifras). Fuente: [componentsource](https://www.componentsource.com/product/enterprise-architect/prices/professional/buy/a5af-1739ba) |
| **MID Innovator / Bpanda** (Alemania) | Industria alemana | Modelado más portal | Sin verificar | Sin verificar | **Sin verificar** (se agotó el presupuesto de búsqueda) |
| **QPR** (Finlandia) | Europa nórdica | Modelado más process mining (ProcessAnalyzer) | Sin verificar | Sin verificar | **Sin verificar** |
| **Interfacing EPC** (Canadá) | Industrias reguladas (farma, energía) | Procesos, riesgos y controles, documentos y capacitación en un mismo sistema de gestión de calidad | Sin verificar | Fuerte (PREVIO) | **Sin verificar** |

### 2.3 Ejecución y low-code (segmento B)

| Herramienta | Novedad 2025-2026 | Precio |
|---|---|---|
| **Appian** | Process HQ (mining más IA) desde el tier Advanced. Standard limita el data fabric a 4 millones de filas por tipo. Fuente: [bardeen.ai](https://www.bardeen.ai/best/appian-alternatives), secundaria | Por usuario, por mes y por app; a cotizar. Community Edition gratis y limitada |
| **Pega** | GenAI **Blueprint**: diseñar es gratis con un Pega ID y construir exige licencia. Junio de 2026: orquestación de agentes y nuevo modelo de precios. Fuente: [siliconangle, 08-06-2026](https://siliconangle.com/2026/06/08/pega-expands-ai-platform-agent-orchestration-development-tools-new-pricing-model/) | A cotizar |
| **Ofelia (ex-Bonitasoft)** | Rebrand en mayo-junio de 2026 hacia «orquestación de IA gobernada por humanos». Bonita BPM sigue como producto. Fuente: [comunicado de prensa, 09-06-2026](https://www.accessnewswire.com/newsroom/fr/business-and-professional-services/bonitasoft-becomes-ofelia-the-french-agentic-ai-set-to-transform-1174410) | Community con idas y vueltas en la distribución de binarios |
| **ProcessMaker** | Fusión con Decisions en noviembre de 2025; processmaker.com redirige a decisions.com. Núcleo AGPL vivo. Fuente: [tallyfy](https://tallyfy.com/processmaker-review/), secundaria | Por casos, con usuarios ilimitados. Terceros hablan de USD 1.800 a 3.000 por mes, sin verificar |
| **Pipefy** (Brasil) | — | Starter gratis; Business unos USD 26 a 33; Enterprise unos USD 50 a 65 por usuario por mes, según la fuente. Fuente: [Capterra](https://www.capterra.com/p/144848/Pipefy/pricing/) |
| **Kissflow** | Basic pasó de USD 1.500 a 2.500 por mes en octubre de 2025. Fuente: [pricingsaas](https://pricingsaas.com/companies/kissflow/diffs/2025Q3) | Tarifa plana |
| **AuraQuantic** (España) | Modular («Quanta» sobre el Core) | Starter unos €28 por usuario por mes (G2, actualizado en enero de 2025) |

INFERENCIA: el segmento B se movió a «orquestación agéntica». El BPMN pasó a ser el lenguaje con el que se gobiernan los agentes de IA, lo que revaloriza el modelado riguroso.

### 2.4 Documentación operativa y SOPs (segmento C)

| Herramienta | Qué hace | Precio fechado |
|---|---|---|
| **Nintex Process Manager** (ex-Promapp, Nueva Zelanda) | Mapas de procesos simples para no expertos, sin BPMN completo. Responsables, aprobaciones, «process health» y variantes por sitio (PREVIO) | G-Cloud 14 (22-07-2025): **Essentials £10.800 por año** (75 procesos y 150 usuarios); **Professional £21.600** (200 y 500); **Expert £61.200** (750 y 1.500); enterprise £86,40 por usuario por año con mínimo de 1.000 usuarios. El extracto estaba parcialmente desordenado. HECHO: [PDF G-Cloud](https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/720023/514230927932387-pricing-document-2025-07-22-1254.pdf) |
| **Process Street** | Checklists ejecutables y flujos | Desde el 01-08-2025 cobra a admins, builders y usuarios en las cuentas nuevas. Sin precio público claro. Fuente: [glitter.io](https://www.glitter.io/blog/process-documentation/best-process-street-alternatives), secundaria |
| **SweetProcess** | Biblioteca de SOPs | Team (hasta 10 usuarios) **USD 99 por mes**, leído el 22-10-2026 por [toolradar](https://toolradar.com/compare/sweetprocess-vs-trainual) |
| **Trainual** | Manual de la empresa más onboarding | Todos sus tiers a medida. Fuente: [toolradar](https://toolradar.com/compare/sweetprocess-vs-trainual) |
| **Scribe** | Captura clics y arma guías paso a paso | Personal USD 23 por usuario por mes; Team USD 59 por asiento por mes con mínimo de 5 (USD 295 por mes); 20 % menos anual. Captura de la página de mayo de 2026. Fuente: [dubble.so](https://dubble.so/compare/scribe-pricing) |
| **Tango** | Ídem, como extensión de navegador | Pro USD 22 por usuario por mes anual (1 o 2 usuarios) o USD 15 (3 o más); mensual USD 30 y 20; al 30-10-2026. Fuente: [vibrantsnap](https://www.vibrantsnap.com/blog/tango-pricing) |
| **Skore → Liberty Spark** | Mapeo de procesos simple, sin BPMN, en talleres | Antes £6 a 12 por usuario por mes; hoy a pedido. Fuente: [Capterra](https://www.capterra.com/p/162439/Skore-app/pricing/) |

INFERENCIA central: el segmento C crece porque la gente no lee BPMN. Scribe y Tango demuestran que la documentación que **se escribe sola** a partir de la operación vende. Esas herramientas no producen modelo de proceso: producen capturas de pantalla.

### 2.5 Arquitectura empresarial (segmento D)

- **Bizzdesign.** Absorbió a MEGA International (otoño de 2024) y a Alfabet, que se compró a Software AG con anuncio del 09-01-2025. Opera con la marca Bizzdesign, mantiene tres productos (Horizzon, HOPEX, Alfabet), tiene unos 2.000 clientes, unos €110 millones de ventas y más de 600 empleados. Es de Main Capital. HECHO: [McDermott](https://www.mcdermottlaw.com/news/mcdermott-advises-main-capital-and-bizzdesign-on-the-acquisition-of-alfabet/) y [MEGA](https://siteprod.mega.com/news/mega-international-merges-two-leaders-global-enterprise-architecture-digital-transformation).
- **Ardoq.**
  - Precio por cantidad de aplicaciones, con usuarios ilimitados, a cotizar.
  - Add-on «AI Process Modeling», que genera modelos de proceso desde texto o diagramas.
  - Su página de precios no menciona BPMN.
  - HECHO: [ardoq.com/pricing](https://www.ardoq.com/pricing).
- **SAP LeanIX.** SAP lo compró en 2023 (PREVIO). Se integra con Signavio (PREVIO, sin verificar hoy).

INFERENCIA: la arquitectura empresarial se acerca a los procesos desde arriba, con capacidades y aplicaciones, y empieza a generar procesos con IA. Es un competidor futuro del repositorio de procesos de las empresas grandes.

---

## 3. Precios comparados (lo verificable)

| Producto | Unidad | Precio | Tipo de dato |
|---|---|---|---|
| Bizagi Modeler | Editor en escritorio | USD 0 | HECHO oficial |
| Camunda modelado BPMN/DMN | Ilimitado | USD 0 | HECHO oficial |
| ADONIS Community | 1 usuario | €0 | HECHO oficial |
| Visual Paradigm Modeler | Usuario por mes | USD 6 | HECHO oficial |
| Visual Paradigm Standard | Usuario por mes | USD 19 | HECHO oficial |
| Cardanit | Usuario por mes | Desde €25 | Agregador |
| IBM Blueworks Live Editor | Usuario autorizado | USD 56,20 | HECHO oficial (período sin aclarar) |
| ADONIS Starter | 1 asiento por mes | €99 | HECHO oficial |
| ADONIS Grow | 5 asientos por mes | €1.195 (unos €239 por asiento) | HECHO oficial |
| Signavio Process Manager | Modelador por año | Unos USD 2.000 a 3.000 | Reseñas y consultoras |
| Nintex Process Manager Essentials | Año (150 usuarios) | £10.800 | HECHO (G-Cloud, julio de 2025) |
| Scribe Team | Asiento por mes | USD 59 (mínimo 5) | Captura de terceros |
| Tango Pro | Usuario por mes | USD 15 a 22 | Captura de terceros |

ESTIMACIÓN (método: comparación de la tabla). Hay tres escalones claros:
- **Herramienta individual:** USD 0 a 40 por mes.
- **Equipo con gobierno:** unos USD 100 a 250 por asiento de modelador por mes, como ADONIS Grow, más lectores baratos o gratis.
- **Enterprise:** de USD 10.000 a más de 100.000 por año por organización.

El **lector** es casi gratis en todos (Blueworks cobra USD 2,25 por viewer; Signavio unas 30 libras por año): **se cobra al que modela, no al que lee**.

---

## 4. Quejas recurrentes de usuarios (patrones)

| Queja | Dónde aparece | Evidencia |
|---|---|---|
| Precio alto y opaco, solo «hable con ventas» | Signavio, ARIS, Trisotech, Nintex, Appian, Pega, Trainual | HECHO: ninguno publica precios (fichas de arriba). Las reseñas de Signavio lo dicen explícitamente ([PeerSpot](https://www.peerspot.com/questions/what-is-your-experience-regarding-pricing-and-costs-for-signavio-process-manager)) |
| Inestabilidad y escritorio viejo | Bizagi Modeler | HECHO: «se cuelga seguido» ([Capterra](https://www.capterra.com/p/127621/BPM-Suite/reviews/?page=2)); «Performance Issues» en G2 |
| Interfaz poco amigable | Signavio (opiniones divididas) | HECHO: [IT Central Station](https://www.itcentralstation.com/products/sap-signavio-process-manager-reviews/page-7) |
| Lock-in y exportes pobres | Lucid y Miro: no exportan BPMN XML. Lucid importa `.bpmn` y descarta estilos y lo que no es BPMN | HECHO: [comunidad Lucid](https://community.lucid.co/ideas/request-for-supporting-the-export-of-bpmn-models-as-xml-file-with-bpmn-extension-10770) y [comunidad Miro, diciembre de 2024](https://community.miro.com/ideas/export-bpmn-diagrams-19039) |
| Cambios de licencia que rompen la confianza | Camunda 8.6, Bizagi 4.0, Kissflow +67 %, Process Street (cobro a todos los roles) | HECHO: fichas de arriba |
| Diagramas que no entran en una página al publicar | Bizagi | HECHO: Capterra |
| No se puede generar el mapa desde Excel | Signavio | HECHO: IT Central Station |

---

## 5. Universo de estándares y simbologías

**Prioridad para una herramienta nueva (INFERENCIA):**
- **P1:** v1.
- **P2:** v2.
- **P3:** después o a demanda.
- **No:** no conviene soportarlo.

| Estándar | Para qué sirve | Quién lo usa | Estado verificado | Prioridad |
|---|---|---|---|---|
| **Diagrama de flujo básico (ANSI / ISO 5807)** | Flujo simple: inicio, proceso, decisión, documento | Todo el mundo, pymes, docentes | ISO 5807 es de 1985 (PREVIO; iso.org dio 403). Su versión argentina es IRAM-ISO 5807, citada en trabajos académicos ([UFLO](https://repositorio.uflo.edu.ar/bitstreams/b77b0ce9-0a74-42ab-b975-4e48123dafb1/download)) | **P1** (es la puerta de entrada) |
| **Carriles / swimlanes (cross-functional)** | Quién hace qué | Todo el mundo | Convención; BPMN la formaliza con pools y lanes | **P1** |
| **BPMN 2.0.2** (diagrama de procesos y colaboración) | Modelado riguroso, ejecutable e intercambiable | Analistas, consultoras, motores (Camunda, Bizagi) | **Vigente: 2.0.2, enero de 2014. No hay 2.1 ni 3.0 publicados.** Hay issues abiertos en el tracker de la OMG en 2024-2025. HECHO: [omg.org](https://www.omg.org/spec/BPMN/) y [issues.omg.org](https://issues.omg.org/issues/spec/BPMN/2.0.2). ISO/IEC 19510:2013 equivale a BPMN 2.0.1 (PREVIO) | **P1** (con importación y exportación XML) |
| **Cursograma IRAM 34501/34502** | Circuitos administrativos: circulación de documentos y formularios entre sectores | Contadores, licenciados en administración y organismos públicos argentinos; se enseña en la UBA, la UNLP y la UNLu | 34501 son los símbolos: operación, control, demora, archivo transitorio y definitivo, destrucción, alternativa, documento, proceso no representado, traslado, toma de información y conector. 34502 son las técnicas: columnas por sector, de arriba abajo y de izquierda a derecha, líneas solo ortogonales, puentes en los cruces, sin curvas, entradas arriba o al costado y salidas abajo o al costado. 34503 cubre el diseño de formularios. HECHO: [TGN, 09-01-2019](https://www.argentina.gob.ar/sites/default/files/pautas-y-criterios-para-elaboracion-instructivos-procesos-tgn.pdf). Ediciones citadas: 1972, 1984 y una experimental de 1989; la edición vigente no está confirmada ([Studocu](https://www.studocu.com/es-ar/document/universidad-de-buenos-aires/sistemas-administrativos/normas-iram-34501-procedimientos-administrativos-y-simbolos/160640179)) | **P1 para el mercado argentino** (diferencial barato: 12 símbolos y reglas de trazado verificables) |
| **SIPOC** | Alcance del proceso: proveedores, entradas, proceso, salidas y clientes | Six Sigma, ISO 9001 | Convención (sin dueño) | **P1** (es una tabla más un diagrama, barato) |
| **Mapa de procesos ISO 9001 (estratégicos, operativos y de apoyo; interacción)** | Lo exige la ISO 9001 (enfoque a procesos, cláusula 4.4, PREVIO) | Áreas de calidad | ISO 9001:2015 vigente; la revisión está en curso para 2026 (PREVIO, sin verificar) | **P1** (plantilla) |
| **DMN 1.x** | Tablas de decisión y reglas (FEEL) | Bancos, seguros, motores (Camunda, Trisotech, IBM) | **1.6 formal y 1.7 beta, con fecha de septiembre de 2026;** 1.5 de agosto de 2024. HECHO: [omg.org/spec/DMN](https://www.omg.org/spec/DMN/) | **P2** (tablas de decisión simples primero) |
| **VSM (value stream mapping)** | Flujo de valor Lean: tiempos de ciclo y de espera, inventario | Industria, logística, Lean | Convención (Rother y Shook, PREVIO) | **P2** (encaja con simulación y con el conocimiento logístico del fundador) |
| **BPSim 2.0** | Parámetros de simulación sobre BPMN (intercambiables) | Sparx, Cardanit, L-Sim; Bizagi tiene su propia simulación | WfMC, diciembre de 2016, CC BY 3.0. HECHO: [bpsim.org](https://www.BPSim.org/specifications/2.0/WFMC-BPSWG-2016-01.pdf) | **P2** (exportar; el motor puede ser propio) |
| **Organigrama** | Estructura y roles (fuente de los carriles) | Todos | Convención | **P1** (es el diccionario de roles) |
| **Customer journey / service blueprint** | Experiencia del cliente más bastidores | Diseño de servicios, CX | Convención (Shostack, 1984, PREVIO) | **P2** |
| **Kanban / Gantt / PERT-CPM** | Gestión de proyectos y plazos | PMO | Convenciones | **P3** (otro frente: proyectos) |
| **Ishikawa (causa y efecto)** | Análisis de causa raíz | Calidad, ISO 9001 | Convención | **P2** (barato y lo piden en calidad) |
| **EPC / eEPC** | Cadenas de procesos dirigidas por eventos (método ARIS) | Usuarios de SAP R/3 y ARIS, Alemania | Sin cuerpo de estándar formal (PREVIO). ARIS genera EPC con IA (HECHO, ariscommunity) | **P3** (importar para migraciones) |
| **UML: actividad, secuencia, estados** | Diseño de software | Ingenieros | UML 2.5.1 (PREVIO) | **P3** (actividad y estados primero) |
| **Diagrama de estados (statecharts)** | Ciclo de vida de un objeto (pedido, expediente) | Software, producto | UML y Harel (PREVIO) | **P2** (muy útil para «estado de un trámite») |
| **DFD (Yourdon / Gane-Sarson)** | Flujos de datos | Analistas de sistemas, docencia | Convención | **P3** |
| **IDEF0** | Funciones con ICOM (entradas, controles, salidas, mecanismos) | Defensa, ingeniería | FIPS 183 retirado (PREVIO) | **P3 o No** |
| **ArchiMate** | Arquitectura empresarial | Arquitectos | Open Group, 3.2 (PREVIO, sin verificar) | **P3** |
| **C4** | Arquitectura de software (contexto, contenedores, componentes, código) | Desarrolladores | Convención de Simon Brown (PREVIO) | **P3** |
| **CMMN 1.1** | Casos no estructurados | Nicho (Trisotech) | CMMN 1.1 (2016, PREVIO); adopción baja. Camunda 8 no lo soporta (PREVIO) | **No** (salvo pedido) |
| **Redes de Petri** | Semántica formal y verificación | Academia, process mining | ISO/IEC 15909 (PREVIO) | **No como notación; sí como motor interno** de validación |
| **BPEL** | Orquestación de web services (OASIS 2.0, 2007, PREVIO) | Legado SOA | En retirada (INFERENCIA) | **No** |
| **YAWL** | Lenguaje de workflow académico | Academia | Nicho | **No** |
| **XPDL** | Intercambio de procesos (WfMC) | Legado (Bizagi lo importa y exporta, HECHO) | En retirada (INFERENCIA) | **P3** (solo importar) |

### 5.1 El problema de la interoperabilidad

- **HECHO.** La OMG creó el BPMN Model Interchange Working Group (MIWG) para probar el intercambio entre herramientas, con casos de prueba y una tabla de resultados. Los últimos resultados que encontré son de 2021. Fuentes: [omgwiki.org/bpmn-miwg](https://omgwiki.org/bpmn-miwg/) y [BOC](https://www.boc-group.com/en/?p=21094).
- **HECHO.** Bruce Silver documentó por qué falla el intercambio:
  - caracteres no soportados;
  - tamaños fijos de figuras;
  - valores por defecto implícitos;
  - el mapeo de etiquetas a valores semánticos;
  - partes de la especificación que son vagas o contradictorias.

  El MIWG tuvo que agregar reglas de exportación más estrictas que la especificación. Fuente: [slides MIWG](https://www.slideshare.net/slideshow/miwg-semantic-interchange-validation/17012468).
- **HECHO (foro).** En la práctica, el intercambio es «un pasaje de ida» o se limita a un subconjunto chico de elementos que todos soportan. Fuente: [foro Camunda](https://forum.camunda.io/t/bpmn-is-brilliant-actually/53159).
- **INFERENCIA.** Hay tres capas que se pierden por separado:
  1. **Semántica.** Tareas, eventos y compuertas viajan razonablemente bien en el subconjunto «Descriptive» o «Analytic».
  2. **Diagrama (BPMN DI).** Posiciones y tamaños viajan regular; los colores y estilos no, porque no son estándar.
  3. **Extensiones del proveedor.** Atributos, documentación, simulación, formularios y vínculos a riesgos casi nunca viajan.

  Por eso el lock-in no está en el dibujo sino en la **documentación y los metadatos** alrededor del dibujo.
- **Oportunidad (INFERENCIA).**
  - Exportar BPMN XML limpio y validado contra el subconjunto del MIWG.
  - Importar «con reporte de pérdidas»: qué se perdió y por qué.
  - Ofrecer una exportación propia, abierta y legible por máquina, en JSON con la documentación incluida.

  Eso convierte la portabilidad en argumento de venta contra el lock-in.

---

## 6. La demanda: quién documenta procesos y por qué paga

### 6.1 Disparadores de compra

| Disparador | Quién paga | Qué necesita | Evidencia |
|---|---|---|---|
| **Certificación ISO 9001** (e ISO 14001, 45001, 27001) | Empresas certificadas o que quieren certificarse; consultoras de calidad | Mapa de procesos, procedimientos controlados (versión y aprobación), evidencias para la auditoría | HECHO: hay **1.474.118 certificados ISO 9001** en el mundo según la ISO Survey 2024, contra 837.978 en 2023; el salto se debe sobre todo al cambio a datos de IAF CertSearch. Fuente: [infografía GlobalSTD](https://www.globalstd.com/wp-content/uploads/2025/10/Infografia-ISO-Survey-2024_EN.pdf). No pude confirmar el número de Argentina: la infografía muestra «ARGENTINA 9.247» sin aclarar a qué norma corresponde |
| **SOX y control interno** (y en Argentina, auditorías externas y normas de la CNV o el BCRA: PREVIO) | Empresas que cotizan, bancos | Procesos vinculados a riesgos y controles (RCM), evidencia de que el control se ejecuta | ARIS GRC, Interfacing e iGrafx venden ese vínculo (PREVIO) |
| **Implementación de ERP** (S/4HANA, Oracle, Dynamics, Tango Gestión y otros locales) | Empresas e integradores | Procesos «as-is» y «to-be», brechas de ajuste | Signavio es el caso: la herramienta de procesos como parte del programa RISE de SAP (PREVIO) |
| **Onboarding y operación** | Pymes, franquicias, BPOs | SOPs paso a paso, checklists | Scribe, Tango, Trainual, SweetProcess (§2.4) |
| **Transformación digital y automatización con IA** | Empresas medianas y grandes | Proceso modelado antes de automatizar o de poner agentes | Pega Blueprint, Camunda, Bizagi y Ofelia se reposicionan como orquestadores de agentes (§2.3) |
| **Consultoras** (calidad, organización, Big Four, integradores) | Las consultoras compran licencias para sus proyectos | Velocidad para relevar, entregables lindos (manual, cursograma) | INFERENCIA: es un canal de distribución clave (el consultor elige la herramienta) |
| **Sector público** | Organismos | Manuales de procedimientos, circuitos administrativos | HECHO: la TGN exige instructivos con cursogramas IRAM ([PDF](https://www.argentina.gob.ar/sites/default/files/pautas-y-criterios-para-elaboracion-instructivos-procesos-tgn.pdf)); también un manual del Poder Judicial de Río Negro con circuitos y diagramas ([Acordada 11-19](https://jusrionegro.gov.ar/web/gobierno-abierto/informes/documentacion/memorias2019/contenido/gobierno_abierto/Administracion/Acordada%2011-19.pdf)) |
| **Educación** | Universidades (ingeniería industrial, sistemas, administración, contador) | Herramienta gratis para enseñar BPMN o cursogramas | HECHO: Bizagi Academy gratis para universidades; los cursogramas IRAM se enseñan en la UBA, la UNLP y la UNLu (apuntes en Studocu y en la UNLu) |

### 6.2 Tamaño de mercado (con fuente; las definiciones difieren mucho)

| Fuente | Mercado | Valor | Fecha de la fuente |
|---|---|---|---|
| Mordor Intelligence (vía reseller GII) | BPM | USD 16.730 millones (2025) → 29.260 millones (2030), TACC del 11,8 % | 2025, [gii.tw](https://gii.tw/report/moi1444173-business-process-management-market-share-analysis.html) |
| Grand View Research | BPM | USD 20.400 millones (2024) → 61.200 millones (2030), TACC del 20,3 % | [grandviewresearch.com](https://www.grandviewresearch.com/industry-analysis/business-process-management-bpm-market/) |
| IMARC | BPM | USD 17.500 millones (2025) | [imarcgroup.com](https://www.imarcgroup.com/business-process-management-market) |
| Gartner | Software de process mining | USD 1.100 millones (2024, +31,7 %); más de 2.000 millones hacia 2028 | [processexcellencenetwork](https://www.processexcellencenetwork.com/process-mining/articles/highlights-gartners-2025-magic-quadrant-process-mining) |
| Everest Group | Process mining | USD 1.500 a 1.600 millones (2025), unos 24 % anual | [everestgrp.com](https://www.everestgrp.com/report/egr-2025-38-r-7549/) |

ESTIMACIÓN (método: desarmar las definiciones).
- Los USD 17.000 a 21.000 millones de «BPM» incluyen sobre todo ejecución, low-code y servicios.
- El sub-mercado relevante para una herramienta de **modelado y documentación** (el segmento BPA más SOPs) es mucho menor. Razonando por los ingresos conocidos de la arquitectura empresarial (Bizzdesign unos €110 millones con unos 2.000 clientes) y por el tamaño de process mining (unos USD 1.100 millones), lo ubico en el orden de **USD 1.000 a 3.000 millones anuales globales**.

Es una estimación gruesa, no un dato. Para afinarla habría que leer el Market Guide de Gartner para Business Process Analysis (no verificado: se agotó la búsqueda).

### 6.3 Argentina y Latinoamérica

- **Bizagi es «el BPMN de Latinoamérica».** HECHOS:
  - es gratis;
  - tiene un hub de talento en Colombia;
  - tiene programa académico gratis;
  - hay certificaciones privadas de Bizagi Modeler en la región, por ejemplo [Summa Center en Credly](https://credly.com/org/summa-center/badge/bizagi-modeler-aplicado-a-gestion-de-procesos-nivel-experto-platinum).

  INFERENCIA: es la herramienta que la mayoría de los analistas latinoamericanos aprendió primero. Cualquier producto nuevo tiene que **importar `.bpm` o BPMN de Bizagi sin dolor**.
- **El cursograma IRAM es la tradición contable y administrativa argentina.** Está en la currícula de Sistemas Administrativos y en las pautas oficiales de la TGN (HECHO, §5). INFERENCIA: hoy se dibuja en Visio, Word o Bizagi «a mano», sin validar las reglas de la 34502. Es un nicho chico pero sin competencia.
- **Jugadores regionales:**
  - HEFLO (Brasil, con datacenter en São Paulo, HECHO);
  - Pipefy (Brasil);
  - AuraQuantic (España);
  - Lecom (Brasil, citado por HEFLO, [heflo.com](https://www.heflo.com/comparison/heflo-vs-lecom));
  - Deyel (Argentina): no pude verificarlo, se agotó la búsqueda.
- **ISO 9001 en Argentina.** Un análisis de la revista Mercado dice que la participación de la ISO 9001 en el total de certificaciones bajó mientras crecían la ISO 14001 y la 22000. Fuente: [mercado.com.ar](https://mercado.com.ar/revista/numero-1104/el-estado-de-la-calidad-en-el-mundo-en-la-region-y-en-el-pais/), HECHO de fuente periodística.

---

## 7. Qué hace excelentes a los mejores

| | Bizagi | SAP Signavio | Camunda |
|---|---|---|---|
| **La jugada maestra** | Regalar el modelador, con simulación y publicación incluidas, y cobrar la nube y la ejecución. Captura a estudiantes y analistas | Ser la capa de procesos del ecosistema SAP: diccionario de objetos, Collaboration Hub para miles de lectores y el vínculo con el mining | El BPMN como código: el modelo es lo que se ejecuta. Open source como canal (bpmn-js en todos lados) |
| **Lo que copiaría** | Simulación en 4 niveles explicada para no expertos; documentación a Word, PDF o web con un clic; academia gratis | Diccionario de objetos compartido (rol, sistema o documento definidos una vez y usados en todos los diagramas); un lector casi gratis; comparar el modelo con la realidad | Validación estricta en vivo (linting), versionado tipo Git, la calidad del motor de dibujo de bpmn-js |
| **Lo que no copiaría** | Escritorio solo para Windows e inestable; lo esencial cerrado tras la nube paga | Precio opaco y venta solo enterprise | Interfaz para desarrolladores; licencia que cambia (8.6) |

(Basado en los HECHOS de §2.1; la síntesis es INFERENCIA.)

---

## 8. Las 10 brechas grandes de la categoría (INFERENCIA, salvo donde se cita)

1. **Riguroso y lindo a la vez.** Las herramientas rigurosas (Bizagi, Signavio, ARIS, Sparx) se ven como software de 2010 y las lindas (Miro, Lucid) no validan nada. Nadie ofrece un BPMN válido con el acabado visual de Figma o Miro. Evidencia de la tensión: Lucid y Miro no exportan BPMN XML; Bizagi «se cuelga».
2. **El puente de la pizarra al modelo.** Los talleres se hacen con post-its y después alguien redibuja todo en la herramienta formal. Falta una **promoción gradual**: el post-it pasa a tarea tipada, la columna pasa a carril, la flecha suelta pasa a un flujo validado, con la IA proponiendo el tipo y la herramienta mostrando qué falta para que sea BPMN válido.
3. **Documentación viva.** Los manuales envejecen el día que se publican. Ninguno detecta que el proceso real cambió y que el documento quedó viejo:
   - Scribe y Tango capturan pantallas, no modelos;
   - el mining compara logs, pero es caro y solo enterprise.

   Hace falta una documentación ligada a la operación, con alertas de obsolescencia y responsables.
4. **Una sola fuente y varias vistas.** El mismo proceso tendría que verse como BPMN (analista), como cursograma IRAM (contador o auditor), como SOP paso a paso (operario), como SIPOC (calidad) y como checklist ejecutable. Hoy cada vista es un archivo distinto.
5. **IA que entiende el modelo, no solo que lo dibuja.** Los grandes generan diagramas desde texto (Joule «Text to Process», ARIS AI Companion, Blueworks IQ, Ardoq). Falta IA que:
   - critique: antipatrones, deadlocks, compuertas sin cierre;
   - explique el proceso a un recién llegado;
   - responda «¿quién aprueba X?» desde el repositorio;
   - mantenga la consistencia entre diagramas.
6. **Gobierno accesible para pymes.** Versionado, aprobaciones, portal, RACI y vínculos a requisitos ISO o controles existen solo a precio enterprise: Nintex desde £10.800 por año, ADONIS Grow unos €14.000 por año (ESTIMACIÓN: €1.195 × 12). Hay un hueco entre «gratis sin gobierno» y «enterprise opaco».
7. **Interoperabilidad honesta.** El intercambio BPMN es de ida o se limita a un subconjunto (§5.1). Nadie ofrece un reporte de qué se pierde al importar o exportar, ni una exportación abierta con la documentación incluida. El lock-in está en los metadatos.
8. **Simulación para mortales.** La simulación de Bizagi es buena pero exige saber de distribuciones y recursos. Falta simulación guiada («¿qué pasa si entra un 30 % más de pedidos?»), con datos reales importados de una planilla o un log y resultados en lenguaje llano. Es un diferencial para logística, el saber del fundador.
9. **Notaciones locales y del oficio.** El cursograma IRAM, el VSM de logística y los circuitos administrativos del sector público no tienen soporte nativo con validación de sus reglas. La 34502 es literalmente un conjunto de reglas verificables: líneas ortogonales, puentes, sentido del trazado.
10. **Precio transparente y en moneda local.** Casi todo es «hable con ventas» y en USD o EUR. En Latinoamérica no hay una oferta self-service, con precio público, en español nativo y con soporte local entre Bizagi gratis y el enterprise caro (HEFLO en Brasil es lo más cercano).

---

## 9. Qué estándares soportar y cuándo (recomendación)

| Versión | Estándares | Por qué |
|---|---|---|
| **v1 (lanzamiento)** | Diagrama de flujo básico (ANSI / ISO 5807); carriles; **BPMN 2.0.2, subconjunto «Descriptive» y «Analytic» del MIWG, con importación y exportación XML validada**; **cursograma IRAM 34501/34502 con validador de reglas**; organigrama (diccionario de roles); SIPOC; plantilla de mapa de procesos ISO 9001; exportación a PDF, Word, PNG y SVG y a una página web publicada; importación de BPMN de Bizagi y de Visio (VSDX) | Cubre el 80 % de los usos: pymes, calidad, contadores, docencia. BPMN es el idioma común; el IRAM es el diferencial argentino; SIPOC e ISO son las plantillas que pide quien paga por la certificación |
| **v2** | DMN (tablas de decisión con FEEL básico); BPSim como exportación, con simulación propia en 4 niveles al estilo Bizagi pero guiada; VSM; diagrama de estados; customer journey y service blueprint; Ishikawa; RACI generado desde los carriles; vínculos a riesgos y controles y a cláusulas ISO; flujo de aprobación y versionado con diferencias visuales | Lleva a la herramienta hacia calidad, auditoría, logística y CX, donde se paga por el gobierno |
| **Después o a demanda** | EPC/eEPC (importar para migrar desde ARIS); UML de actividad y secuencia; DFD; ArchiMate; C4; Gantt, Kanban y PERT/CPM (si se une al frente de proyectos); XPDL (solo importar); IDEF0; CMMN solo si un cliente lo paga | Notaciones de nicho o de otro público (arquitectos, desarrolladores) |
| **No** | BPEL, YAWL, Petri como notación visible | Legado o academia. Petri o una semántica formal sí como **motor interno** de validación (deadlocks, alcanzabilidad) |

**Nota técnica (INFERENCIA, basada en el HECHO de la licencia).**
- Usar bpmn-js acelera la v1, pero obliga a mostrar la marca de agua de bpmn.io sin taparla ([licencia](https://bpmn.io/license/)).
- Para una herramienta «linda» con varias notaciones (IRAM, VSM y SIPOC conviviendo con BPMN), conviene un motor de lienzo propio o neutral y usar el ecosistema de bpmn.io solo como referencia de validación e importación y exportación, por ejemplo con bpmn-moddle.
- Queda por verificar la licencia de bpmn-moddle con la regla 10 del CLAUDE.md: «herramientas especializadas primero».

---

## 10. Pendientes que quedaron sin verificar (por el límite de búsquedas)

- Precios y novedades de QPR, Interfacing EPC, MID Innovator/Bpanda, Deyel (Argentina), Lecom y SAP LeanIX.
- El estado formal de CMMN, ArchiMate (versión vigente), ISO 5807 (vigencia) e ISO/IEC 19510.
- El Market Guide de Gartner para Business Process Analysis y el Magic Quadrant de arquitectura empresarial 2025-2026.
- El número de certificados ISO 9001 en Argentina en la ISO Survey 2024 (hay que consultar ISO o IAF CertSearch).
- La edición vigente de IRAM 34501/34502/34503 (consultar el catálogo de IRAM; las fuentes citan 1972, 1984 y una experimental de 1989).
- Los precios de lista de Sparx EA (sparxsystems.com bloqueó la lectura).
