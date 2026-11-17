# Plataforma de flujogramas y gestión de procesos: el negocio (mercado, modelos, clientes, distribución y caso a 5 años)

Analista de mercado · 17-11-2026 · Todas las consultas web son del 17-11-2026, salvo que se indique otra fecha.

**Etiquetas.** **HECHO**: dato con fuente y fecha. **ESTIMACIÓN**: número calculado, con el método a la vista. **HIPÓTESIS**: algo que hay que validar. **INFERENCIA**: razonamiento propio. **[interesada]**: la fuente es el propio proveedor o un socio suyo. **[agregador]**: la fuente es un sitio de estimaciones de terceros (Latka, Owler, CostBench, etc.), de baja confianza.

**Límite de esta investigación.** A mitad del trabajo se agotó el cupo de búsquedas web de la sesión. Por eso quedaron **sin verificar**: la cantidad de certificados ISO 9001 en Argentina y Latinoamérica, los volúmenes de búsqueda en español («plantilla de flujograma», «cursograma», «manual de procedimientos»), la matrícula de Ingeniería Industrial y Ciencias Económicas, y los honorarios de los consultores ISO. Donde hacen falta, van como HIPÓTESIS, cada una con el método para conseguir el dato. Ningún número de esos se inventó.

---

## 0. Veredicto en 10 líneas

1. **El disparador del fundador ya lo resolvió otro, gratis.** draw.io exporta PDF vectorial sin registro y sin licencia, y Bizagi Modeler (gratis) exporta documentación. Si el producto se vende como «exportás sin pagar», compite contra lo gratis y pierde. INFERENCIA, apoyada en los HECHOS de la sección 2.
2. **El horizontal tipo Miro + Lucid es zona de muerte para un holding de USD 400/mes.** Miro se vendió en 2026 por USD 1.355 millones de valor empresa con unos USD 600 millones de ARR, un 90 % por debajo de su valuación de 2022 (HECHO). Lucid supera los USD 300 millones de ARR (HECHO [interesada]). Canva tiene USD 4.000 millones de ARR (HECHO). La pizarra se commoditizó.
3. **Quién ganó plata:** el que cobró donde el comprador ya tenía presupuesto y circuito de compra (draw.io en Atlassian; Bizagi y Camunda en la automatización empresarial), no el que cobró por exportar.
4. **El hueco real no es el lienzo. Es el «manual de procedimientos en español en una tarde».** Se cuenta el proceso (texto, audio o PDF), sale el diagrama con datos por bloque (responsable, tiempo, costo, documento, control) y, de ahí, el manual PDF listo para ISO, el cursograma y la matriz de responsables. Hoy eso se hace con Word, Visio y un consultor. HIPÓTESIS central, a validar con entrevistas.
5. **Recomendación: entrar por la cuña B** («Manual de procesos con IA, en español») sobre un motor compartido con **Andén** (la simulación es la capa paga de operaciones). Sin muros en la exportación. Se cobra la IA en volumen, la marca propia del consultor, el portal publicado con versiones y aprobaciones, y la simulación.
6. **Tamaño alcanzable (bottom-up, ESTIMACIÓN):** en el escenario base, unos USD 16.000 por mes a 5 años (2031). En el de fracaso se corta en el mes 9. En el expansivo, más de USD 90.000 por mes.
7. **Barrera ante una copia en 6 meses: débil en producto, fuerte solo en distribución acumulada.** Cuenta lo que se junta con el tiempo: la biblioteca SEO de plantillas en español, las cátedras que lo ponen en el programa, los consultores que entregan manuales con su marca y los datos de costos de Andén.
8. **Regla de corte:** a los 6 meses del lanzamiento, menos de 1.000 usuarios activos por mes orgánicos, menos de 10 pagos o ninguna cátedra. Si se cumple, se congela como función interna de Andén.

---

## 1. Mercado: tamaño, con fuente y con crítica de la fuente

### 1.1 Lo que dicen los informes de mercado (de arriba hacia abajo, presentados solo para criticarlos)

| Segmento | Cifra 2025 | Fuente | Crítica |
|---|---|---|---|
| Software de diagramación | USD 1.130 millones (crecimiento anual compuesto del 12,8 %) | The Business Research Company vía GII ([gii.tw](https://www.gii.tw/report/tbrc1849262-diagramming-software-global-market-report.html)) | **Se contradice con los datos duros.** Solo Lucid (más de USD 300 millones) y Miro (unos USD 600 millones, aunque Miro es pizarra) ya suman casi USD 900 millones de ARR, sin contar Visio, draw.io, Canva ni Whimsical. |
| Diagramación online | USD 2.800 millones | Market Intelo ([marketintelo.com](https://marketintelo.com/report/online-diagramming-software-market/amp)) | Metodología no visible; el informe es pago. |
| Diagramación | «≈ USD 2.500 millones» | Market Research Forecast ([enlace](https://www.marketresearchforecast.com/reports/diagramming-software-60019)) | Admite que es una estimación «considerando mercados similares». Es humo. |
| BPM (gestión de procesos de negocio) | USD 16.700 a 21.200 millones | IMARC (17.500), Mordor (16.730), Roots (21.240) ([IMARC](https://www.imarcgroup.com/business-process-management-market)) | Incluye suites de automatización y servicios. Casi nada de esa cifra es «dibujar y documentar procesos». |
| Minería de procesos | entre USD 770 millones y 13.990 millones (dispersión de 18 veces) | Varias firmas ([IMARC](https://imarcgroup.com/process-mining-software-market), [Everest](https://www.everestgrp.com/report/egr-2025-38-r-7549/)) | Una dispersión así anula la cifra. Gartner y Everest no publican el número gratis. |

**Conclusión (INFERENCIA).** Los TAM de arriba hacia abajo no sirven para decidir: miden cosas distintas y algunos están por debajo de lo que facturan dos empresas solas. Para decidir sirven (a) lo que facturan los jugadores (sección 1.2) y (b) el embudo propio de abajo hacia arriba (sección 7).

### 1.2 Datos duros de los jugadores

| Jugador | Modelo | Ingresos o ARR | Usuarios | Valuación y rondas | Fuente y calidad |
|---|---|---|---|---|---|
| **Miro** | Gratis con 3 tableros editables + pago por asiento (Starter USD 8, Business USD 20 por miembro y mes, anual) | ≈ USD 600 millones de ARR; casi 90 % de empresas | sin cifra oficial reciente (los agregadores dicen 90 a 100 millones) | USD 17.500 millones en 2022 → venta a **Bending Spoons por USD 1.355 millones de valor empresa** (anunciada el 10-09-2026, cerrada el 26-10-2026). Despidos del 7 % (2023) y del 18 % (oct-2024) | HECHO: [Reworked](https://www.reworked.co/collaboration-productivity/bending-spoons-acquires-miro-for-136b/), [Business Wire](https://www.sttinfo.fi/tiedote/72445219/bending-spoons-completes-the-acquisition-of-miro?publisherId=58763726), [miro.com/pricing](https://miro.com/pricing/) |
| **Lucid** (Lucidchart) | Gratis (≈ 3 documentos editables) + Individual ≈ USD 9 + Team ≈ USD 10 por usuario | «superó USD 300 millones de ARR con rentabilidad sostenida» (abr-2025) | «más de 100 millones» | USD 100 millones de ARR en 2020; secundaria de 2021 a una valuación de USD 3.000 a 4.500 millones (agregadores) | HECHO [interesada]: [comunicado vía Reworked](https://www.reworked.co/the-wire/lucid-software-expands-visual-collaboration-with-first-work-acceleration-platform-for-business-transformation/); [TechCrunch 2020](https://techcrunch.com/2020/04/16/lucidchart-raises-52m-series-d-passes-100m-arr/). Precios: [agregador](https://costbench.com/software/diagramming/lucidchart/) |
| **Canva** | Gratis + Pro + equipos | USD 4.000 millones de ARR a fin de 2025; segmento empresas (más de 25 asientos) USD 500 millones, +100 % | 265 millones de usuarios activos por mes; **31,2 millones pagos (11,8 %)** | — | HECHO: [TechCrunch 18-02-2026](https://techcrunch.com/2026/02/18/canva-gets-to-4b-in-revenue-as-llm-referral-traffic-rises/) |
| **draw.io / JGraph** (desde sep-2025 «draw.io Ltd») | **Web y escritorio gratis, sin registro**; cobra en Confluence y Jira (Atlassian Marketplace) | **No publicado.** Owler dice USD 1,7 millones [agregador], lo que es incompatible con los precios y las instalaciones. Estimación propia: decenas de millones de USD por año (ver 2.1) | 23 millones o más de instalaciones en Google Workspace; 59.375 instalaciones de la app de Confluence | Sin capital de riesgo («self-funded»). Desde 2016 presenta cuentas abreviadas en Companies House, sin facturación | HECHO: [Google Workspace](https://workspace.google.com/marketplace/app/drawio_diagrams/671128082532), [Atlassian](https://marketplace.atlassian.com/apps/1210933/draw-io-diagrams-uml-bpmn-aws-erd-flowcharts), [Companies House](https://find-and-update.company-information.service.gov.uk/company/04051179/filing-history), [Wikipedia](https://en.wikipedia.org/wiki/Diagrams.net) |
| **Bizagi** (Colombia, 1989) | **Modeler gratis** (escritorio, BPMN) → plataforma de automatización empresarial | Estimaciones de USD 48,6 a 94,7 millones [agregadores, se contradicen] | «más de 400 clientes empresariales, más de 10.000 procesos, más de 50 países»; comunidad de «más de 1 millón» (2018) | Privada | HECHO [interesada]: [bizagi.com/about](https://bizagi.com/about); ingresos: [Latka](https://getlatka.com/companies/bizagi.com), [ZoomInfo](https://www.zoominfo.com/c/bizagi/14847544) |
| **Camunda** | Motor de flujos de código abierto + empresa | **Cerca de USD 200 millones de ARR** (ago-2026); retención neta de ingresos > 120 %; más de 700 clientes | — | Sin rondas desde 2021; recompra de acciones a más de USD 1.000 millones | HECHO [interesada]: [camunda.com, 04-08-2026](https://camunda.com/press-releases/camunda-closing-in-on-200m-in-arr-doubling-revenue-in-record-time/) |
| **Signavio** | Modelado y minería de procesos para empresas | ≈ USD 53 millones de ingresos de los últimos doce meses al venderse [estimación de terceros] | — | **SAP la compró por EUR 949 millones** (cierre 05-03-2021) | HECHO: [SAP 20-F FY2021](https://www.sec.gov/Archives/edgar/data/1000184/000110465922029675/sap-20211231x20f.htm); múltiplo: [multiples.vc](https://multiples.vc/private-comps/signavio) |
| **Celonis** | Minería de procesos empresarial | Último dato: ≈ USD 400 millones (2022) [estimación de terceros] | — | USD 13.000 millones (ago-2022) | [multiples.vc](https://multiples.vc/private-comps/celonis), [Celonis](https://userresearch.celonis.com/press/with-a-13billion-dollar-valuation-celonis-defies-current-startup-economics) |
| **Heflo** (Brasil) | Plan académico gratis → Lite (se compra dentro de la app; incluye **«documentación PDF profesional»**) → Enterprise | No publicado | — | — | HECHO: [heflo.com/plans](https://www.heflo.com/plans); el sitio no publica precios |
| **Excalidraw** | Código abierto (MIT) + Excalidraw+ (≈ USD 6 a 7 por usuario) | No publicado | **≈ 850.000 usuarios activos por mes** (ene-2025); 89.000 estrellas en GitHub | — | HECHO [interesada]: [blog](https://plus.excalidraw.com/blog/excalidraw-in-2024) |
| **tldraw** | SDK con **licencia comercial** (prueba de 100 días; ≈ USD 6.000 por año para equipos de menos de 10 personas) | ≈ USD 1 millón el primer año de ventas [fuente única] | — | Serie A de USD 10 millones (09-04-2025, Lux y Definition) | HECHO: [tldraw.dev](https://tldraw.dev/blog/announcing-tldraw-series-a), [precios](https://tldraw.dev/pricing) |
| **Whimsical** | Gratis + pago por usuario | «millions in revenue» antes de 2021 | «miles de equipos» | **4 años rentable sin inversores**; luego, serie A de USD 30 millones (02-11-2021, Accel) | HECHO [interesada]: [whimsical.com/blog/funding](https://whimsical.com/blog/funding) |
| **Eraser** | Gratis (3 archivos, PDF incluido) → Business USD 45 por miembro | No publicado | — | Semilla de USD 4 millones (2021) | HECHO: [eraser.io/pricing](https://www.eraser.io/pricing), [TechCrunch](https://techcrunch.com/2021/11/09/eraser-a-new-collaboration-startup-for-technical-teams-has-4-million-in-seed-funding-and-some-traction) |
| **Napkin** | Texto → visual con IA; gratis con marca Napkin → Plus USD 9, Pro USD 22 | **≈ USD 1,7 millones de ARR** (2025) [fuente secundaria única] | **5 millones de registrados** (2025) | Semilla de USD 10 millones (ago-2024, Accel y CRV) | HECHO: [napkin.ai/pricing](https://www.napkin.ai/pricing), [Maginative](https://www.maginative.com/article/napkin-ai-emerges-from-stealth-with-10m-funding-for-ai-tool-that-generates-business-visuals); ARR: [fast.io](https://fast.io/resources/napkin-ai-review-2026.md) |
| **Mermaid Chart** | Diagramas como código (código abierto) + nube | No publicado | 4 a 8 millones según la fuente | Semilla de USD 7,5 millones (mar-2024; Sequoia, M12) | [TechCrunch](https://techcrunch.com/2024/03/20/mermaid-chart-a-markdown-like-tool-for-creating-diagrams-raises-5-5m/amp) |
| **Visio** (Microsoft) | Plan 1 USD 5, Plan 2 USD 15 por usuario; versión liviana incluida en Microsoft 365 | — | — | — | [agregador](https://costbench.com/software/diagramming/visio/) |

### 1.3 Lecturas que importan (INFERENCIA)

- **La compresión de Miro es la señal del año.** Pagaron unas 2,3 veces el ARR por una empresa rentable que llegó a valer 29 veces más. El lienzo colaborativo horizontal ya no se paga como antes: lo empujan Canva, Microsoft, la IA generativa y draw.io gratis.
- **Napkin es la alarma para la «IA que dibuja»:** 5 millones de registrados y unos USD 1,7 millones de ARR dan **≈ USD 0,34 por registrado por año** (ESTIMACIÓN: división directa; el ARR viene de una fuente única). La IA atrae multitudes que no pagan.
- **Canva es el techo de conversión:** 11,8 % pagos sobre activos mensuales, con marca global y producto amplio. Un producto nicho en LatAm debería suponer entre 1 % y 3 % (HIPÓTESIS, a medir).
- **El dinero de procesos está en ejecutar, no en dibujar.** Camunda (≈ USD 200 millones) y Bizagi (decenas de millones, según estimaciones) facturan por automatización empresarial. El modelador gratis es la puerta. Signavio valió EUR 949 millones por integrarse al circuito de venta de SAP.

---

## 2. Modelos de negocio que funcionan y por qué

### 2.1 El caso clave: draw.io, producto gratis que factura por un canal

**HECHOS:**
- La web y el escritorio son gratis, sin registro ([Wikipedia](https://en.wikipedia.org/wiki/Diagrams.net)). Tiene 23 millones o más de instalaciones en Google Workspace, gratis ([listado](https://workspace.google.com/marketplace/app/drawio_diagrams/671128082532)).
- En Confluence Cloud cobra por instancia, según la cantidad de usuarios. Es gratis hasta 10 usuarios. Precio anual de lista: 15 usuarios, USD 303; 100, USD 2.020; 500, USD 4.995; 1.000, USD 7.345; 10.000, USD 26.995 ([API pública de precios de Atlassian, consultada el 17-11-2026](https://marketplace.atlassian.com/rest/2/addons/com.mxgraph.confluence.plugins.diagramly/pricing/cloud/live)). Por usuario y mes: **USD 1,68 con 100 usuarios y USD 0,61 con 1.000**.
- Las instalaciones de la app de Confluence son 59.375, con 1.208 reseñas y 4,8 estrellas. El listado aparece como «Seibert - draw.io», o sea que el ingreso se reparte con un socio en una proporción que no se conoce ([listado](https://marketplace.atlassian.com/apps/1210933/draw-io-diagrams-uml-bpmn-aws-erd-flowcharts)).
- En 2019 era «la app paga más exitosa de Confluence», según un análisis citado por su socio ([Seibert, 18-04-2019, [interesada]](https://seibert.group/blog/en/draw-io-diagramming-in-confluence-is-currently-the-most-successful-app-in-the-atlassian-marketplace/)).
- Subió los precios el 22-09-2025 ([drawio-app.com](https://drawio-app.com/blog/upcoming-pricing-changes-for-drawio/)).
- En agosto de 2024 agregó a la licencia una cláusula que prohibía usar el código en Confluence y Jira, para proteger su canal. La sacó en diciembre de 2024 y empezó a publicar archivos minificados ([Wikipedia](https://en.wikipedia.org/wiki/Diagrams.net)).
- El Marketplace de Atlassian vendió ≈ USD 1.800 millones en 2024 ([Aventis Advisors, ago-2025](https://aventis-advisors.com/atlassian-marketplace-ma/), estimación de una consultora).

**ESTIMACIÓN de ingresos de draw.io en Confluence.** Método: instalaciones × proporción paga × ticket anual medio.
- Proporción de instalaciones pagas (más de 10 usuarios): entre 30 % y 60 %. HIPÓTESIS; las instalaciones incluyen pruebas y sitios chicos.
- Ticket medio: entre USD 1.500 y 4.000 por año (entre 75 y 500 usuarios por sitio). HIPÓTESIS.
- Resultado: 59.375 × 0,30 a 0,60 × USD 1.500 a 4.000 = **entre USD 27 y 140 millones por año en ventas brutas** de Marketplace, antes de la comisión de Atlassian y del reparto con Seibert. La cifra de Owler (USD 1,7 millones) es incompatible con este orden de magnitud.
- Confianza: baja en el número, alta en el orden de magnitud (decenas de millones).
- Cómo cerrarlo: las cuentas de draw.io Ltd en Companies House son abreviadas, sin facturación. Habría que mirar el balance (caja y patrimonio) de las cuentas al 31-08-2025, que no se pudieron descargar desde este entorno.

**Por qué funciona (INFERENCIA).**
1. **No cobra por la función: cobra por estar donde la empresa ya compra.** En Confluence, el área de sistemas aprueba apps de una tienda donde ya tiene facturación, seguridad y renovación automática. El usuario no tiene que convencer a nadie de un proveedor nuevo.
2. **La versión gratis ilimitada es su marketing.** La gente aprende draw.io gratis y después lo pide en el trabajo.
3. **Precio ridículamente bajo por usuario** (USD 0,61 a 1,68 por mes): nadie se pone a buscar alternativa.
4. **Protege el canal** (la cláusula de 2024), no el producto.

### 2.2 Tabla de modelos

| Modelo | Quién | Qué se cobra | ¿Choca con «sin restricciones artificiales de exportación»? | ¿Encaja con el holding (casi pasivo, sin vender)? |
|---|---|---|---|---|
| Gratis + pago por asiento | Miro, Lucid, Whimsical | Colaboración, cantidad de tableros, **exportación en alta** (Miro: la versión gratis exporta solo en baja resolución; el PDF en alta es de Starter, [pricing](https://miro.com/pricing/)) | Sí, en Miro | Medio: el pago por asiento empuja a vender a equipos |
| Gratis + tienda de apps | draw.io | Integración, administración y compra centralizada en la tienda del cliente | **No** | **Alto**: la tienda vende por vos |
| Código abierto + nube paga | Excalidraw+, Mermaid Chart | Colaboración, almacenamiento, equipo | No | Alto en distribución, bajo en ingresos |
| Licencia de SDK | tldraw (≈ USD 6.000 por año) | El motor para otros desarrolladores | No | Bajo: es venta B2B a desarrolladores |
| Modelador gratis → plataforma empresarial | Bizagi, Heflo, Camunda | Automatización, ejecución, servicios | No en el modelador; Heflo **cobra el PDF profesional** (Lite) | **Bajo**: venta empresarial larga, preventa, implementación |
| IA por créditos | Napkin, Eraser | Generaciones de IA, quitar la marca (Napkin) | No, porque la IA tiene costo real | Alto |
| Pago único (lifetime) | Herramientas chicas en tiendas de ofertas (sin dato verificado) | Acceso de por vida | No | Alto en caja inicial, riesgoso (soporte sin ingreso recurrente) |
| Plantillas pagas o marketplace | Canva, Notion (sin dato propio verificado en esta sesión) | Contenido | No | Medio: sirve como canal SEO más que como ingreso |
| Consultoras que revenden | Bizagi (socios), Signavio (socios de SAP) | Proyecto + licencia | No | Medio: el consultor vende por nosotros |

### 2.3 Qué modelo encaja con «sin restricciones artificiales» y aun así cobra (INFERENCIA)

Hay una regla simple para distinguir:
- **Restricción artificial:** la que no le cuesta nada al proveedor (exportar PDF, cantidad de páginas, marca de agua obligatoria).
- **Restricción real:** la que sí tiene costo marginal o valor de gobierno, y que se cobra sin culpa:
  1. **IA en volumen.** Cada generación cuesta tokens.
  2. **Publicar y gobernar:** un portal de procesos con versiones, aprobaciones, lectores ilimitados y registro de cambios. Es lo que pide un auditor de ISO.
  3. **Marca propia y multicliente para el consultor:** el manual sale con su logo y no con el nuestro.
  4. **Simulación y costeo** (Andén): cómputo y datos actualizados (índices de costos).
  5. **El canal:** apps en tiendas donde la organización ya paga.

Así cobran draw.io (canal), Excalidraw+ (colaboración), Napkin y Eraser (IA) y Camunda o Bizagi (ejecución). **El PDF gratis y perfecto no es una pérdida de ingreso: es el anuncio.** Cada manual que circula en una empresa muestra la herramienta.

---

## 3. Clientes, decisor y trabajo a resolver (JTBD)

### 3.1 Segmentos

| Segmento | Quién usa / quién decide / de qué presupuesto | Trabajo a resolver | Cuánto le cuesta hoy | Alternativa actual y precio | Disposición a pagar (evidencia) | Cómo se lo alcanza sin vender |
|---|---|---|---|---|---|---|
| **Pyme de 20 a 200 personas que se certifica o se ordena** | Usa: el responsable de calidad o el analista de administración. Decide: el dueño o el gerente. Presupuesto: «certificación ISO» o «consultoría» | «Tener los procedimientos escritos y aprobados para la auditoría (o para que la empresa no dependa de una persona)» | Semanas de relevamiento; horas del consultor | Word + Visio o PowerPoint + consultor. **Visio Plan 1: USD 5 por usuario** [agregador]; Bizagi Modeler gratis; draw.io gratis | Indirecta: Heflo cobra justamente el «PDF profesional» ([heflo.com/plans](https://www.heflo.com/plans)). Sin dato de honorarios ISO en LatAm (HIPÓTESIS) | SEO «manual de procedimientos de compras» y similares; plantillas; el consultor que la usa |
| **Consultor de procesos, ISO o calidad (independiente o estudio chico)** | Usa y decide él mismo; lo paga de su bolsillo y lo traslada al cliente | «Entregar más rápido un manual prolijo con mi marca y cobrar lo mismo» | Su tiempo es el costo: si un manual le lleva días, la IA le ahorra la mayor parte (HIPÓTESIS) | Bizagi Modeler + Word; Lucid (≈ USD 9 por mes [agregador]); Visio | **El segmento más probable para pagar USD 9 a 19 por mes** (INFERENCIA: es su herramienta de trabajo y la factura al cliente) | Plantillas, comunidades de calidad, «hecho con» en cada manual que entrega |
| **Analista de procesos o de mejora continua en empresa mediana o grande** | Usa: el analista. Decide: sistemas o procesos. Presupuesto: TI | «Mapear el proceso actual para el proyecto de ERP o de mejora» | Horas de taller | Bizagi, Signavio (si son clientes SAP), Lucid, Visio | Alta, pero ya pagan (Lucid, Visio, SAP) | Difícil sin vender. Solo por tiendas de apps (Teams, Google) |
| **Estudiantes de Ingeniería Industrial y de Ciencias Económicas** | Usa: el alumno. Decide: **el docente** (lo pone en la consigna) | «Entregar el trabajo práctico con el cursograma o el BPMN bien hecho» | Peleas con Bizagi (solo Windows; HIPÓTESIS a verificar) o con plantillas de Word | Bizagi Modeler gratis, draw.io gratis, Lucid educativo | **Cero.** Valen como semilla: dentro de 3 a 5 años son analistas y consultores | Cátedras (la red de la UNNOBA del fundador), centros de estudiantes, YouTube sin cara |
| **Equipos de operaciones y logística** | Usa: el jefe de depósito o de operaciones. Decide: el gerente de operaciones | «Saber dónde se traba y cuánto cuesta el proceso» | Decisiones a ojo; FlexSim ≈ USD 6.000 por año y AnyLogic USD 12.000 a 19.000 (dato de la ficha de Andén, `oportunidades/proyectos/P2-anden.yaml`, del 28-09-2026) | Excel, simuladores caros, nada | Media-alta si sale costo por unidad y cuello de botella | Andén (calculadoras gratis por SEO) |
| **Auditores y control interno** | Usa: el auditor. Decide: el socio del estudio | «Documentar el circuito y sus controles (cursograma con puntos de control)» | Horas del equipo | Word, Visio, plantillas propias | Media | Plantillas de «circuito de pagos con controles», SEO |
| **Implementadores de ERP** | Usa: el consultor funcional. Presupuesto: el proyecto | «Relevar el proceso como es y cómo será» | Talleres | Visio, Lucid, Bizagi, Signavio | Media; lo pagan dentro del proyecto | Difícil sin vender |
| **Estado** | Usa: el área de modernización. Decide: licitación | Manuales de procedimiento | Muy alto en tiempo | Word | Baja por presupuesto y compras públicas | **No es segmento inicial** (compra pública = salir a vender) |

### 3.2 El hueco en español y LatAm (INFERENCIA, con hechos de apoyo)

- **Los dos jugadores de procesos nacidos en la región subieron hacia la automatización empresarial.** Bizagi (Bogotá, 1989) tiene más de 400 clientes empresariales ([about](https://bizagi.com/about)). Heflo (Brasil) cobra el PDF profesional y lleva lo grande a Enterprise. Ninguno se quedó con el «manual de procedimientos para pymes con IA».
- **Los globales están en inglés primero** y cobran por asiento en dólares. Su IA genera diagramas, no **manuales de procedimiento** con la estructura que pide ISO 9001: objetivo, alcance, responsables, actividades, registros, indicadores (INFERENCIA; no se auditó la salida de la IA de cada uno).
- **El cursograma con la simbología IRAM** que se enseña en Ciencias Económicas en Argentina (Sistemas Administrativos) no aparece como biblioteca nativa en los globales. Es una **HIPÓTESIS a verificar**: bibliotecas de formas de draw.io y Lucid, y programas de cátedra de la FCE-UBA, la UNLP y la UNC.
- **Nada de esto se verificó con datos de demanda.** Faltan los volúmenes de búsqueda y la cantidad de empresas certificadas (ver el límite al principio). El experimento de la sección 8(d) mide la demanda antes de construir.

---

## 4. Competencia: directos, sustitutos y «no hacer nada»

| Tipo | Competidor | Precio | Por qué nos pueden ganar | Por qué podemos ganarles |
|---|---|---|---|---|
| Directo | **draw.io** | Gratis; USD 0,61 a 1,68 por usuario y mes en Confluence | Gratis, excelente, PDF libre, 23 millones de instalaciones en Google | No genera el manual, no tiene datos por bloque con informe, no simula, no tiene IA conversacional en español (INFERENCIA, verificar su IA actual) |
| Directo | **Bizagi Modeler** | Gratis (escritorio); colaboración en la nube ≈ USD 1.990 por usuario y año [agregador, poco fiable] | BPMN riguroso, gratis, conocido en la región, documentación exportable | Escritorio con curva de aprendizaje; su negocio está en lo empresarial, no en la pyme (INFERENCIA) |
| Directo | **Heflo** | Académico gratis; Lite pago | Portugués y español, PDF profesional | Precio opaco; poca presencia en Argentina (HIPÓTESIS) |
| Directo | **Lucid**, **Miro**, **Visio** | USD 5 a 20 por usuario y mes | Marca, IA, presencia en empresas | Inglés primero, pago por asiento, PDF en alta pago (Miro) |
| Sustituto | **ChatGPT, Claude o Gemini** + Mermaid, o Word | Ya lo pagan (USD 20 por mes) o es gratis | **El sustituto más peligroso:** «pedile a la IA el procedimiento» ya da texto y diagrama | No entrega un diagrama editable de calidad, ni datos por bloque, ni versión aprobada, ni portal, ni simulación (INFERENCIA). **Cada vez menos cierto: hay que revisarlo cada trimestre** |
| Sustituto | **Napkin**, Canva | Gratis a USD 22 | Visuales lindos al instante | Infografía, no proceso con rigor |
| Sustituto | El **consultor ISO** con su propio método | Honorarios (sin dato) | Hace el trabajo entero | Puede volverse nuestro canal y no nuestro rival |
| «No hacer nada» | El proceso vive en la cabeza del dueño | Gratis hasta que alguien se va o llega la auditoría | Es la opción por defecto en la mayoría de las pymes (INFERENCIA) | Solo se compite con un disparador: auditoría, cliente que exige ISO, rotación, ERP nuevo |

**¿Qué impediría que nos copien en 6 meses? (INFERENCIA, sin autoengaño)**
- **El producto no lo impide.** Un lienzo + IA + PDF lo arma un equipo chico en semanas. tldraw y Excalidraw dan el lienzo, y el BPMN existe en código abierto.
- **Sí lo impide lo acumulado:**
  1. Cientos de plantillas y manuales de referencia por industria en español, indexados en Google y en los asistentes de IA (Canva atribuye parte del crecimiento al tráfico que llega desde los modelos de lenguaje, [TechCrunch](https://techcrunch.com/2026/02/18/canva-gets-to-4b-in-revenue-as-llm-referral-traffic-rises/)).
  2. Cátedras con la herramienta en el programa: se cambia una vez por año como mucho.
  3. Consultores con sus manuales y clientes adentro: cambiarse les cuesta.
  4. Los índices de costos argentinos de Andén y la simulación calibrada.
- Ninguno existe el día uno. **La barrera es la distribución y hay que construirla desde el mes 1.**

---

## 5. Distribución sin vender

### 5.1 Qué funcionó en la categoría

| Producto | Canal que funcionó | Evidencia |
|---|---|---|
| draw.io | Gratis sin registro + Google Workspace (23 millones o más) + cobro en Atlassian | HECHO ([Google](https://workspace.google.com/marketplace/app/drawio_diagrams/671128082532), [Atlassian](https://marketplace.atlassian.com/apps/1210933/draw-io-diagrams-uml-bpmn-aws-erd-flowcharts)) |
| Excalidraw | Código abierto (GitHub, 89.000 estrellas) + redes + paquete npm embebido en otros productos | HECHO [interesada] ([blog](https://plus.excalidraw.com/blog/excalidraw-in-2024)) |
| Mermaid | **GitHub lo renderiza nativo en Markdown** (feb-2022): el canal fue la plataforma de otro | HECHO ([TechCrunch 2024](https://techcrunch.com/2024/03/20/mermaid-chart-a-markdown-like-tool-for-creating-diagrams-raises-5-5m/amp)) |
| Whimsical | Boca en boca; creció 3 veces en el año previo a la ronda, sin inversión paga | HECHO [interesada] ([blog](https://whimsical.com/blog/funding)) |
| Napkin | Gratis con marca Napkin en cada visual (cada uso es un anuncio) | HECHO ([pricing](https://www.napkin.ai/pricing)) |
| Canva | Gratis masivo + tráfico desde los modelos de lenguaje | HECHO ([TechCrunch](https://techcrunch.com/2026/02/18/canva-gets-to-4b-in-revenue-as-llm-referral-traffic-rises/)) |
| Miro | Integración por MCP (100 llamadas por día en el plan gratis) | HECHO ([pricing](https://miro.com/pricing/)): los grandes ya juegan dentro de los asistentes de IA |

### 5.2 Canales para nosotros, ordenados por relación costo-alcance (INFERENCIA)

1. **SEO de plantillas y manuales en español** (el canal núcleo). Una página por proceso y por área: «flujograma de compras», «cursograma de pagos a proveedores», «manual de procedimientos de RR. HH. (selección)», «procedimiento de recepción de mercadería ISO 9001». Cada página trae el diagrama editable, el manual PDF de muestra y el botón «Editalo gratis». **Costo marginal casi cero con Claude.** Los volúmenes de búsqueda no se verificaron: es lo primero que hay que medir (Google Keyword Planner o Search Console de una página de prueba).
2. **Cada PDF y cada enlace como canal:** pie «Hecho con [marca]», prendido por defecto y apagable gratis (a diferencia de Napkin, que lo impone). Los enlaces públicos de procesos llevan el botón «Hacé el tuyo».
3. **Apps dentro de ChatGPT y de Claude (MCP):** «Convertí este procedimiento en diagrama y manual PDF». Hoy los directorios son nuevos y están poco saturados en español (INFERENCIA). Miro ya está ahí en inglés.
4. **Cátedras:** plan académico gratis con espacio por curso. Empieza por la red del fundador en la UNNOBA, como en Andén. Un docente trae 50 a 200 alumnos por año (ESTIMACIÓN: tamaño típico de una comisión, a verificar).
5. **Consultores como canal:** plan Pro con marca propia. Cada manual entregado a un cliente lleva la herramienta adentro de la empresa. El consultor vende por nosotros.
6. **Tiendas de apps con circuito de compra** (la lección de draw.io), en fase 2:
   - Confluence: saturado por draw.io; no conviene.
   - Monday, ClickUp, Notion: menos saturadas en procesos (HIPÓTESIS).
   - Microsoft Teams y AppSource: la pyme LatAm vive en Microsoft 365 (HIPÓTESIS).
   - Google Workspace: draw.io ya está, gratis.
7. **YouTube y Shorts sin cara:** «cómo hacer un cursograma en 3 minutos». La fábrica de videos de Senda es reutilizable (INFERENCIA).
8. **Product Hunt:** un día de picos. Sirve para el inglés más adelante, no para la cuña en español.

---

## 6. Oportunidades derivadas: evaluación rápida

| Derivada | Valor | Veredicto |
|---|---|---|
| **Plataforma interna del holding** | Hoy el holding es el fundador más Claude, con Senda y Andén. El ahorro de licencias es casi nulo porque draw.io ya es gratis (INFERENCIA) | **No justifica construir.** Sirve como prueba de uso propio |
| **SaaS horizontal (Miro + Bizagi)** | Mercado enorme y en compresión; competidores con cientos de millones de USD | **No.** Así no → mejor la cuña B |
| **Vertical de operaciones y logística con simulación = fusión con Andén** | Andén ya planea «subís un diagrama o un PDF y la IA arma la simulación» (`P2-anden.yaml`, v3 2028). El modelador de procesos **es la entrada natural de Andén** | **Sí: fusionar el motor.** Un modelo de proceso con datos por bloque alimenta a la vez el manual y la simulación. Dos puertas, un motor |
| **Servicios** (relevamiento con IA, manuales ISO hechos) | Factura rápido, pero **es salir a vender y a operar** | No para el fundador. **Sí como función para el consultor:** el consultor brinda el servicio con nuestra herramienta |
| **Marketplace de plantillas y procesos de referencia por industria** | Canal SEO más que ingreso | Sí, como canal (gratis). Pago, recién con 500 o más plantillas y consultores que publiquen |
| **Certificación y cursos** («Analista de procesos con IA») | Ingreso en contenido; buen complemento para cátedras | Fase 3; reutiliza Andén Aula |
| **API o SDK** | Compite con tldraw y bpmn.io | No |

---

## 7. Tamaño de abajo hacia arriba y caso de negocio a 5 años

### 7.1 Método

El TAM de arriba hacia abajo no se usa. Se modela el **embudo propio**: usuarios activos por mes (de SEO, enlaces, cátedras y tiendas) × porcentaje de pago × ingreso medio por usuario pago, más organizaciones pagas × ticket.

**Supuestos comunes (HIPÓTESIS):**
- Mezcla de países en el caso base: 70 % LatAm y 30 % resto (España, EE. UU. hispano).
- Ingreso medio del plan Pro: USD 6,0 en 2027 (mucho precio LatAm) que sube a 7,0 con más mezcla global.
- Plan Organización: USD 35 a 45 por mes de media.
- Precios en la sección 8(b).
- Costos de infraestructura e IA: fuera de este frente (los ve el CFO). La IA tiene que tener tope por plan para que el margen bruto no se coma el ingreso.

Referencias para la conversión, todas HECHOS citados arriba:
- Canva: 11,8 % pagos sobre activos mensuales (techo, empresa global).
- Napkin: ≈ USD 0,34 por registrado por año (piso de la «IA que dibuja»).
- Excalidraw: 850.000 activos por mes después de 4 años, siendo gratis y de código abierto (techo de tracción de una herramienta gratis muy querida).

### 7.2 Escenarios (ESTIMACIÓN; valores a diciembre de cada año)

**Fracaso.** El SEO no rinde (poca búsqueda o competencia de draw.io y Canva), ninguna cátedra lo adopta y la IA genérica alcanza.

| Año | Usuarios activos por mes | Pro pagos | Organizaciones pagas | Ingreso mensual (USD) |
|---|---|---|---|---|
| 2027 | 800 | 5 | 0 | ≈ 30 |
| 2028 en adelante | — | — | — | **Se corta en el mes 9** (regla de la sección 8(e)): queda como función de Andén |

**Base.** El SEO en español rinde de forma gradual, entran 2 cátedras por año y entre 20 y 100 consultores pagan.

| Año | Usuarios activos por mes | % pago (Pro) | Pro pagos × ingreso medio | Organizaciones × ticket | Ingreso mensual (USD) | Ingreso del año (≈, USD) |
|---|---|---|---|---|---|---|
| 2027 | 4.000 | 1,0 % | 40 × 6,0 | 2 × 35 | **≈ 310** | ≈ 2.000 |
| 2028 | 15.000 | 1,2 % | 180 × 6,5 | 10 × 35 | **≈ 1.520** | ≈ 11.000 |
| 2029 | 35.000 | 1,5 % | 525 × 7,0 | 30 × 40 | **≈ 4.880** | ≈ 38.000 |
| 2030 | 60.000 | 1,8 % | 1.080 × 7,0 | 60 × 40 | **≈ 9.960** | ≈ 90.000 |
| 2031 | 90.000 | 2,0 % | 1.800 × 7,0 | 100 × 40 | **≈ 16.600** | ≈ 160.000 |

**Expansivo.** Una app en ChatGPT o en Claude que pega, portugués e inglés desde 2029, una tienda con circuito de compra (Teams o Monday) y adopción en 15 o más cátedras.

| Año | Usuarios activos por mes | % pago | Pro pagos × ingreso medio | Organizaciones × ticket | Ingreso mensual (USD) |
|---|---|---|---|---|---|
| 2027 | 10.000 | 1,5 % | 150 × 6,5 | 8 × 40 | ≈ 1.300 |
| 2028 | 50.000 | 2,0 % | 1.000 × 7,0 | 50 × 40 | ≈ 9.000 |
| 2029 | 130.000 | 2,2 % | 2.860 × 7,5 | 150 × 45 | ≈ 28.200 |
| 2030 | 250.000 | 2,4 % | 6.000 × 8,0 | 280 × 45 | ≈ 60.600 |
| 2031 | 400.000 | 2,5 % | 10.000 × 8,0 | 400 × 45 | **≈ 98.000** |

**Contra la vara.** Con aportes de USD 400 por mes, el caso base devuelve más que la tesorería (6 a 8 % anual) recién desde 2029, siempre que el costo de construir lo absorba el plan de Claude que ya se paga (INFERENCIA). Andén ya tiene previsto un motor de simulación. Fusionar baja el costo marginal de esta línea, y por eso es la versión que conviene.

### 7.3 Sensibilidad (INFERENCIA)

Las tres variables que deciden, en orden:
1. **Usuarios activos por mes desde SEO y tiendas.** Es la distribución.
2. **Porcentaje de pago** (1 % contra 2,5 %: el ingreso cambia 2,5 veces).
3. **Mezcla LatAm/global** (el ingreso medio va de USD 4,5 a 9).

El costo de la IA por usuario gratis es el riesgo de margen: si cada usuario gratis genera mucho sin tope, el escenario base pierde plata.

---

## 8. Cierre

### (a) Tres estrategias de entrada (cuñas) comparadas

| | **A. «draw.io en español con alma de procesos»** (horizontal) | **B. «Manual de procesos con IA», en español** (recomendada) | **C. «Andén Procesos»**: modelado + simulación de operaciones |
|---|---|---|---|
| Promesa | Pizarra y diagramas excelentes, todo gratis | «Contá tu proceso y llevate el diagrama, el manual PDF listo para ISO y el cursograma» | «Dibujá tu operación y te digo cuánto cuesta y dónde se traba» |
| Cliente que paga | Difuso | Consultor ISO o de procesos (Pro) y pyme (Organización) | Jefe de operaciones y consultor industrial |
| Rival directo | draw.io gratis, Canva, Miro | Bizagi + Word, consultor, IA genérica | FlexSim y AnyLogic (caros), Excel |
| Costo de construir | **Alto** (un lienzo de calidad Miro es un pozo sin fondo) | Medio (lienzo de código abierto + plantillas + IA + generador de PDF) | Alto (simulación de eventos discretos), pero **ya previsto en Andén** |
| Distribución sin vender | SEO genérico muy disputado | **SEO de cola larga en español** + consultores + cátedras | SEO de calculadoras logísticas (Andén) + cátedras |
| Barrera | Ninguna | Biblioteca en español + consultores adentro | Índices de costos argentinos + simulación |
| Riesgo principal | Competir con lo gratis | Que la IA genérica alcance | Mercado chico y técnico |
| **Veredicto** | No | **Sí: la puerta** | **Sí: la segunda capa, fusionada** |

**Recomendación.** Arrancar con B como herramienta gratis sin muros, apoyada en el motor de modelado que va a usar Andén. La simulación de C es el plan pago de operaciones y llega con el cronograma de Andén. A queda descartada: si alguna vez hace falta un lienzo genérico, se toma uno de código abierto y no se compite en eso.

### (b) Precios recomendados (USD; el precio LatAm se cobra en moneda local donde se pueda)

| Plan | Global | LatAm | Qué incluye | Qué se cobra de verdad |
|---|---|---|---|---|
| **Gratis** | 0 | 0 | Diagramas, BPMN y cursograma ilimitados. **Exportación sin límites** (PDF vectorial, PNG, SVG, BPMN XML). Manual PDF básico. IA con tope (por ejemplo, 10 generaciones por mes). «Hecho con» apagable | — |
| **Pro** (consultor o profesional) | **9 por mes** (90 por año) | **5 por mes** (50 por año) | IA en volumen, **manual con marca propia**, espacios por cliente, plantillas premium por industria, historial | IA + marca + multicliente |
| **Organización** (por empresa, **no por asiento**) | **49 por mes** hasta 25 editores | **29 por mes** | Portal de procesos publicado con **lectores ilimitados**, versiones, aprobaciones, registro de cambios para auditoría, roles | Gobierno y publicación |
| **Operaciones** (con Andén) | +29 por mes | +15 por mes | Simulación, costo por unidad, escenarios, índices actualizados | Cómputo + datos |
| **Académico** | 0 | 0 | Espacio por curso, consignas, corrección | Semilla de usuarios futuros |

Por qué estos precios (INFERENCIA sobre HECHOS):
- El Pro global se pone al nivel de Lucid Individual (≈ USD 9), Napkin Plus (USD 9) y Miro Starter (USD 8), y queda muy por debajo de Eraser (USD 45).
- El Pro LatAm se pone al nivel de Visio Plan 1 (USD 5).
- El precio por organización copia la lección de draw.io (precio por instancia, barato por cabeza) y evita la fricción del asiento en la pyme.
- Pago único de lanzamiento: opcional y limitado (por ejemplo, 200 licencias Pro de por vida a USD 79). Da caja inicial, pero hay que ponerle tope por el soporte (HIPÓTESIS).

### (c) Caso de negocio a 5 años

Ver las tablas de la sección 7.2. En resumen, el ingreso mensual a diciembre de cada año:

| | 2027 | 2028 | 2029 | 2030 | 2031 |
|---|---|---|---|---|---|
| Fracaso | ≈ 30 → corte | — | — | — | — |
| Base | ≈ 310 | ≈ 1.520 | ≈ 4.880 | ≈ 9.960 | ≈ 16.600 |
| Expansivo | ≈ 1.300 | ≈ 9.000 | ≈ 28.200 | ≈ 60.600 | ≈ 98.000 |

### (d) Primeros 10 usuarios y clientes, sin salir a vender

Antes de construir, el **experimento barato (2 semanas, ≈ USD 0 a 20):** 30 páginas SEO de plantillas en español, cada una con un diagrama editable en draw.io de muestra y un manual PDF de ejemplo, más una lista de espera «Generá el tuyo con IA». Se mide impresiones y clics en Search Console, descargas y altas a la lista. Si en 8 semanas no hay impresiones, el canal núcleo no existe.

Los 10 primeros:
1. **El fundador:** documenta los procesos de Senda (publicación, revisión, lanzamiento) y los de Andén. Prueba de uso propio.
2. **De 2 a 3 docentes de la red UNNOBA** (organización industrial, sistemas administrativos), que reciben el plan académico. El fundador les pasa el enlace a conocidos: no es venta, es un regalo.
3. **De 3 a 5 consultores ISO o de procesos** que llegan solos por las páginas SEO o por la app en ChatGPT o Claude. Programa «Consultores fundadores»: Pro gratis 6 meses a cambio de una entrevista y un manual publicado como plantilla.
4. **De 2 a 3 pymes** que llegan por la búsqueda «manual de procedimientos de [área]» y descargan el PDF de ejemplo.

Ninguno de estos caminos pide que el fundador llame o venda. La app de IA y las páginas SEO venden por él; las cátedras y los consultores distribuyen.

### (e) Riesgos de mercado y regla de corte

| Riesgo | Probabilidad (INFERENCIA) | Señal temprana | Mitigación |
|---|---|---|---|
| La IA genérica (ChatGPT, Claude, Gemini) genera procedimiento + diagrama + PDF «suficiente» | Alta y creciendo | En entrevistas, «ya lo hago con ChatGPT» | Estar **dentro** de ChatGPT y de Claude como app; diferenciar con el diagrama editable, los datos por bloque, el portal y la simulación |
| draw.io o Canva lanzan IA en español con PDF de manual | Media | Anuncios de producto | La barrera es la biblioteca en español + consultores + Andén |
| Baja disposición a pagar en LatAm y problemas cambiarios en Argentina | Alta | Conversión menor al 0,8 % | Precio regional; cobrar en dólares fuera de Argentina; plan Organización |
| Poca búsqueda real en español (los volúmenes no se verificaron) | Media | Pocas impresiones en el experimento | Medirlo **antes** de construir |
| El costo de IA por usuario gratis se come el margen | Media | Costo de IA mayor al 30 % del ingreso | Tope de generaciones; modelos chicos para borradores |
| Soporte que vuelve no pasivo el negocio | Media | Más de 3 horas por semana de soporte | Documentación, comunidad, y ninguna implementación a medida |
| Licencias del motor (por ejemplo, la licencia de bpmn.io exige mostrar su logo; tldraw es pago) | Media | — | Lo valida el investigador tecnológico **antes** de construir (INFERENCIA: verificar las licencias) |

**Regla de corte (propuesta para registrar como decisión):**
- **Antes de construir:** si en el experimento SEO de 8 semanas las 30 páginas suman menos de 2.000 impresiones, o si menos de 3 de 10 entrevistados pagaron o intentaron pagar en los últimos 12 meses por documentar procesos (herramienta o consultor), no se construye la cuña B. Queda solo el modelador dentro de Andén.
- **A los 6 meses del lanzamiento:** menos de 1.000 usuarios activos por mes orgánicos, **o** menos de 10 pagos, **o** ninguna cátedra → se congela (solo hosting) y se absorbe en Andén.
- **A los 12 meses:** menos de USD 500 por mes → no recibe más capital ni horas de construcción fuera de Andén.

---

## 9. Guion de entrevistas (de 5 a 20; conducta pasada, no opiniones sobre el futuro)

**Cupos:** 6 consultores ISO o de procesos, 5 responsables de calidad o administración de pymes, 4 docentes (Ingeniería Industrial y Ciencias Económicas), 3 jefes de operaciones o logística y 2 auditores o personas de control interno.

**Cómo llegar sin vender:** que lleguen por la lista de espera del experimento SEO (formulario «¿Te podemos hacer 3 preguntas?»), por los docentes conocidos de la red UNNOBA y por grupos públicos de calidad, donde se publica una invitación abierta. Cualquier mensaje a terceros lo aprueba el fundador (regla 8).

**Filtro inicial:** «En los últimos 12 meses, ¿hiciste o encargaste un diagrama de proceso, un cursograma o un manual de procedimientos?» Si la respuesta es no, la entrevista se termina con un agradecimiento.

**Preguntas:**
1. Contame la **última vez** que tuviste que documentar un proceso. ¿Cuál era, para qué y quién lo pidió?
2. ¿Qué pasó **justo antes** de que decidieran hacerlo (auditoría, cliente, ERP, alguien que se fue)?
3. Paso a paso, ¿qué herramientas usaste? ¿Dónde se te trabó?
4. ¿Cuánto tiempo te llevó, de punta a punta? ¿Cuántas personas participaron?
5. ¿Pagaste algo, sea herramienta, consultor o curso? ¿Cuánto, y de qué presupuesto salió? ¿Quién lo aprobó?
6. ¿Alguna vez una herramienta te pidió pagar para exportar o para seguir? ¿Qué hiciste en ese momento (pagaste, buscaste otra, sacaste captura)?
7. ¿Qué pasó con ese documento después? ¿Quién lo leyó, dónde quedó guardado, se actualizó alguna vez?
8. La última vez que un auditor o un jefe revisó un procedimiento tuyo, ¿qué te pidió corregir?
9. ¿Usaste ChatGPT, Claude u otra IA para algo de esto? Mostrame qué le pediste y qué hiciste con lo que te dio.
10. (Consultores) ¿Cuántos manuales entregaste en el último año? ¿Cuánto cobraste por cada uno? ¿Qué parte del trabajo es pasar en limpio?
11. (Docentes) ¿Qué herramienta indicaste el último cuatrimestre para cursogramas o BPMN? ¿Qué problemas te trajeron los alumnos?
12. (Operaciones) La última decisión de dotación, de turnos o de layout, ¿cómo la tomaste? ¿Con qué números?
13. ¿Hay alguien más a quien le haya pasado lo mismo hace poco y con quien pueda hablar?

**Qué no se pregunta:** «¿Pagarías por…?», «¿Te gustaría que…?» ni nada sobre precios futuros.

**Qué se registra:** hechos de gasto (monto, presupuesto, quién aprobó), frecuencia (cuántas veces por año), herramienta actual, momento disparador y el texto exacto de los dolores.

---

## 10. Datos que faltan y cómo conseguirlos

| Dato | Para qué | Cómo conseguirlo |
|---|---|---|
| Certificados ISO 9001 en Argentina y en LatAm | Tamaño del segmento pyme certificada | ISO Survey (iso.org, planilla anual gratis) |
| Volúmenes de búsqueda en español (plantillas, cursograma, manual de procedimientos) | Validar el canal núcleo | Google Keyword Planner + experimento SEO |
| Matrícula de Ingeniería Industrial y de Contador Público en Argentina | Tamaño del canal académico | Anuario de Estadísticas Universitarias (Ministerio de Capital Humano) |
| Honorarios de un manual ISO en Argentina y en LatAm | Disposición a pagar del consultor | Entrevistas (pregunta 10) + presupuestos publicados |
| Balance de draw.io Ltd (31-08-2025) | Cerrar la estimación del caso clave | Descargar el PDF de Companies House desde un entorno con acceso |
| IA actual de draw.io, Lucid y Bizagi en español: ¿generan un manual? | Medir qué tan grande es el hueco | Prueba manual de 1 hora con el mismo procedimiento en cada uno |
| Simbología IRAM en las bibliotecas de los competidores | Cuña del cursograma | Prueba manual + programas de cátedra |
| Si Bizagi Modeler gratis trae simulación y exportación a Word o PDF hoy | Medir el rival gratis | Instalarlo y probar (es gratis) |
