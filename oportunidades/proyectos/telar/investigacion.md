# Telar (hoy «Plan Maestro») · Investigación de mercado

> Bitácora del 15-11-2026. Responde al encargo de convertir la app de organización del fundador en un proyecto del holding (P11,
> `../P11-telar.yaml`). El diseño del producto está en `producto.md`. Repositorio público: no hay datos personales ni tareas reales.

**Cómo leer las etiquetas.** HECHO = dato con fuente y fecha. ESTIMACIÓN = cuenta mía con método escrito. HIPÓTESIS = a validar.
INFERENCIA = razonamiento propio. Marco ⚠ las fuentes interesadas (el proveedor, un competidor o un blog de afiliados).
Las páginas oficiales las leí el 15-11-2026; el resto vino por buscador, y varios agregadores muestran fechas y precios que se
contradicen entre sí. Todo precio que decida plata hay que reverificarlo en la página del proveedor (CLAUDE.md §8).

---

## 1. Resumen ejecutivo

1. **El mercado está saturado y lo digo sin vueltas.** Solo en lo que revisé hay más de 20 productos con precio, y los grandes
   (Notion ≈ USD 865 M de ingreso anual estimado, monday USD 1.232 M en 2025, Todoist con 50 M de usuarios según la propia empresa) tienen
   más recursos que nosotros por varios órdenes de magnitud. Probabilidad honesta de que Telar llegue a un negocio sostenible: **20%**.
2. **Hay un hueco real pero angosto.** Las listas (Todoist, TickTick, Things) no muestran el tiempo; los planificadores de día
   (Sunsama, Motion, Akiflow) miran un día o una semana y cuestan USD 17–34 por mes; los Gantt (GanttPRO, TeamGantt, OmniPlan) son para
   jefes de proyecto. **Una persona sola con varios proyectos y horas limitadas** queda en el medio. No encontré ninguna herramienta que
   junte, para una persona, cronograma de proyectos + capacidad en horas + replanificar con un toque (INFERENCIA de la búsqueda; se valida
   con entrevistas, §12).
3. **La alternativa real es gratis**: una planilla, Notion o Trello gratis y el calendario. El precio que hay que ganarle es USD 0 más
   el costo de «armarla y mantenerla» (HIPÓTESIS).
4. **Lo que vale es lo que un incumbente no puede o no le conviene hacer:** sin cuenta y con datos del usuario, a USD 4 por mes, para
   una persona, en español primero. En 2025–2026 cerraron Height (24-09-2025) y Clockwise (27-03-2026), Amie se corrió a notas con IA y
   subieron precios Sunsama, Motion y Todoist: **«tu plan es un archivo tuyo» es un argumento de confianza con evidencia** (⚠ parte de
   las fuentes son blogs de competidores).
5. **El negocio es chico y barato.** Costo por usuario casi cero (datos locales), distribución por plantillas indexables, 1–2 horas por
   semana. En el escenario normal deja ≈ USD 2.250 netos por mes en diciembre de 2030; en el esperado, ≈ USD 15–20 mil acumulados a
   septiembre de 2031 (ESTIMACIÓN, §8). Contra la vara del holding (6–8% anual) el capital en juego (USD 120) no es el problema: lo
   escaso son las horas.
6. **Conviene como apuesta chica con corte duro**, y tiene un premio de consolación real: es la herramienta con la que el fundador
   puede gestionar los 11 proyectos del holding.

---

## 2. Qué es hoy la base (lectura de `apps/plan-maestro/index.html`, 1.106 líneas)

**HECHO (leído el 15-11-2026):**

- **Hace bien:** jerarquía áreas → proyectos → tareas con color por área; árbol fijo a la izquierda y cronograma tipo Gantt al lado;
  tres niveles de detalle (áreas, proyectos, tareas) y cuatro escalas (panorama, meses, semanas, días) con zoom centrado; línea de «hoy»;
  barras que se mueven y se estiran; fechas clave y hábitos; progreso por área y proyecto; tablero por estado, área o proyecto con filtro de
  período (día, semana, mes); prioridad = orden vertical, arrastrando; foco con estrella; búsqueda y filtros; deshacer de 40 pasos; copia en
  JSON y CSV con restauración; modo oscuro automático; panel inferior en el celular; atención a accesibilidad (foco visible, `aria-pressed`,
  reducción de movimiento).
- **Le falta:**
  - **Se apoya en la plataforma de artefactos de Claude** (`window.claude.use("db")`, `"downloads"`). Fuera de ahí solo queda `localStorage`;
    no tiene manifiesto ni trabajo sin conexión (service worker) y carga las fuentes desde Google.
  - **No tiene horas ni capacidad**: las fechas son manuales; no hay dependencias, subtareas, recurrencia real (el «hábito» es solo una
    barra rayada), etiquetas, avisos ni calendario externo.
  - **Teclado casi nulo**: solo Ctrl+Z y Escape. No hay captura rápida, lenguaje natural, paleta de comandos ni selección múltiple.
  - **Arrastrar filas y tarjetas usa el sistema de arrastre del navegador, que no anda con el dedo**: en el celular se ocultan los agarres
    de las filas y quedan solo botones de subir y bajar. Las barras del cronograma sí usan eventos de puntero (sirven con dedo).
  - **Vacío inicial pobre** (un cartel con dos botones), un solo plan y ninguna plantilla ni ejemplo.
  - **Sin revisión semanal ni métricas** más allá de contadores.
  - **Rendimiento (INFERENCIA, no medido):** cada cambio vuelve a dibujar todo el cronograma como texto HTML y en la escala de días crea una
    marca por día; con cientos de tareas va a notarse. El historial guarda copias completas del plan (40).
- **Seguridad:** escapa el texto antes de dibujarlo y abre enlaces con `rel="noopener"`. Bien.

Conclusión: es una **buena base de interfaz** (el cronograma y el tablero ya están) y **no es todavía un producto** (no hay datos propios,
instalación, capacidad ni nada que lo distinga).

---

## 3. Cliente y decisor

| Perfil | Quién usa | Quién decide | De qué presupuesto sale | Cuánto ya paga | Etiqueta |
|---|---|---|---|---|---|
| **Persona con 3–10 proyectos en paralelo** (freelancer, consultor, fundador solo, creador, quien estudia y trabaja) | La persona | La persona | Gasto personal de suscripciones (o gasto de su negocio, si es autónoma) | Todoist Pro USD 60 al año; TickTick USD 36–50; planificadores USD 204–408 | HIPÓTESIS: segmento principal |
| **Pareja o familia con un proyecto grande** (mudanza, casamiento, reforma, viaje, bebé) | Dos personas | Quien propone la herramienta | Gasto del hogar | Casi nada: usan chat, planillas y notas compartidas | HIPÓTESIS: se contrata por episodio, retención baja |
| **Tesistas y posgrado** | La persona | La persona | Bolsillo personal, mucho descuento por ser estudiante | Poco | HIPÓTESIS: sirve para distribución (plantillas de tesis) más que para ingreso |
| **Personas neurodivergentes que necesitan ver el tiempo** | La persona | La persona | Personal; ya pagan Tiimo (≈ USD 10 por mes según fuentes que no coinciden) | Ver §6 | HIPÓTESIS: adyacente, no objetivo inicial |

No hay compra B2B ni comité: es **autoservicio y de tarjeta personal**. Un fundador anónimo que no sale a vender solo puede jugar acá.

INFERENCIA sobre el comprador inicial: el propio fundador es el primer usuario típico (varios proyectos, horas escasas). Es una ventaja
(entiende el dolor) y un sesgo (n = 1): por eso el §12.

---

## 4. Trabajo a resolver (JTBD)

> «Cuando tengo varias cosas importantes con fecha corriendo a la vez y un tiempo limitado, quiero ver si lo que me comprometí a hacer
> **cabe** y qué se corre si algo cambia, para no enterarme tarde de que una fecha se perdió.»

| Qué le cuesta hoy | Cómo se mide | Etiqueta |
|---|---|---|
| Tiempo de rehacer el plan en planilla o en Notion cuando se rompe la semana | Minutos por semana, a preguntar | HIPÓTESIS |
| Fechas perdidas por no ver la sobrecarga a tiempo | Cantidad en los últimos 3 meses, a preguntar | HIPÓTESIS |
| Estrés de «tener todo en la cabeza» | Cualitativo | HIPÓTESIS |
| Costo de cambiar de herramienta cuando una cierra o sube el precio | Casos recientes | HECHO parcial: Height cerró (24-09-2025) y Clockwise (27-03-2026) |

**Frecuencia:** semanal (mirar y reacomodar) y diaria (abrir «hoy», tildar). Es un producto de hábito, no de episodio: bueno para
retención, malo si la primera semana no engancha (la mediana de la categoría dice que gran parte de las conversiones pasa el día 0:
72% en productividad según RevenueCat 2026, que mezcla en «productividad» diseño y herramientas de desarrollo).

**Aclaración honesta:** el dolor es fuerte cuando hay **3 o más proyectos con fecha y un tope de horas**. Quien tiene una lista de
compras y cuatro recordatorios no siente este dolor y le sobra Todoist o Recordatorios.

---

## 5. La alternativa actual y su precio (el verdadero competidor)

| Alternativa | Precio | Fuente y fecha | Confiabilidad |
|---|---|---|---|
| **Planilla (Excel, Google Sheets), papel, WhatsApp a uno mismo** | USD 0 + el tiempo | HIPÓTESIS (a confirmar en entrevistas) | Es el competidor principal |
| **Notion** (con vista de cronograma) | Gratis para individuos; planes de pago desde ≈ USD 8–10 por usuario | Reseñas y comparadores, oct–nov 2026 | Secundaria |
| **Trello** | Gratis (hasta 10 tableros); Standard ≈ USD 5 por usuario; sin Gantt propio en el plan gratis | Comparadores, 2026 | Secundaria, los precios no coinciden |
| **Todoist Pro** | USD 5 por mes anual (USD 60 al año), USD 7 mensual; gratis con 5 proyectos | todoist.com/pricing, leída el 15-11-2026 | **Oficial** |
| **TickTick Premium** | USD 27,99–49,99 al año (las fuentes no coinciden) | Activepieces (30-10-2026), Capterra, CRM.org | Secundaria, conflicto |
| **Things 3** | Pago único: USD 9,99 iPhone, 19,99 iPad, 49,99 Mac; sincronización incluida | Comparadores, 2026 | Secundaria |
| **Sunsama** | USD 17 por mes anual (USD 204 al año), USD 22 mensual; sin plan gratis; 14 días de prueba | sunsama.com/pricing, 15-11-2026 | **Oficial** |
| **Motion** | Pro AI USD 19 y Business AI USD 29 por usuario y mes (anual, −33%); la página decía «plan no disponible» al leerla; otras fuentes hablan de USD 49 por mes sin descuento | usemotion.com/pricing, 15-11-2026, más Trustpilot | Oficial + reseñas |
| **Akiflow** | ≈ USD 34 mensual; USD 15–19 por mes anual (no coinciden); sin plan gratis | Morgen ⚠, Lindy, toolradar | Secundaria, un competidor |
| **FlowSavvy** | Desde USD 5 por mes; plan gratis con replanificación automática | Capterra y comparadores, 2026 | Secundaria |
| **SkedPal** | USD 9,95 y USD 21,95 por mes | toolradar, 17-10-2026 | Secundaria |
| **GanttPRO** | Core USD 7, Advanced USD 10, Business USD 17 por usuario y mes (anual) | ganttpro.com/pricing, 15-11-2026 | **Oficial** |
| **TeamGantt** | Gratis personal (1 usuario, 1 proyecto, 40 tareas); pagos de USD 24 a 59 según la fuente | toolradar (oct-2026), Instagantt ⚠ | Secundaria, conflicto |
| **Instagantt** | Individual USD 12 por mes; equipo USD 24 | toolradar (oct-2026) | Secundaria |
| **OmniPlan 4** | Pro USD 399,99 una vez, o suscripción antigua de USD 199,99 al año | Ficha de la App Store (histórica) | Secundaria |
| **Basecamp** | Plus USD 15 por usuario; Pro Unlimited USD 299 por mes | toolradar (oct-2026) | Secundaria |

**Lectura (INFERENCIA):** el ancla de precio para uso personal está en **USD 36–60 al año** (listas) y la de los planificadores en
**USD 204–408**. Telar Pro a **USD 48 al año** (menos en Latinoamérica) cae entre ambas y por debajo de lo que cobran quienes hoy resuelven
un problema vecino. Un solo plan bien armado con una planilla es gratis: la única forma de ganarle es **ahorrar más tiempo del que
cuesta el cambio**.

---

## 6. Mapa por producto: tamaño, qué aman, qué odian, hueco

Dónde no encontré evidencia de reseñas, lo digo: no inventé quejas.

### 6.1 Equipos y proyectos (los grandes se alejan de la persona sola)

| Producto | Tamaño | Qué aman / odian | Hueco para nosotros |
|---|---|---|---|
| **Notion** | ≈ USD 865 M de ingreso anual en jul-2026, +82% (estimación de Sacra); ≈ 4 M de clientes que pagan; créditos de IA a USD 10 por 1.000 desde mayo de 2026; más de la mitad del ingreso viene de clientes con IA (dato de la empresa relayado por Sacra) | Aman la flexibilidad (Capterra 4,7 sobre 2.841 reseñas). Odian el celular (editar bases es frustrante), la poca función sin conexión, el tiempo de armado y la lentitud con bases grandes | Todo está en Notion si lo armás tú; nadie quiere armarlo. Hueco: «viene armado y sabe de horas» |
| **ClickUp** | No encontré ingreso | Curva de aprendizaje empinada y exceso de funciones (varias reseñas, de calidad dispar) | Lo opuesto: simple para una persona |
| **monday.com** | USD 1.232 M en 2025, +27%, 250 mil clientes (UC Today); se corre de las pymes hacia empresas grandes | Fuentes sin reseñas de usuarios en esta ronda | Se aleja de lo chico |
| **Asana** | Ingreso trimestral de USD 187,3 M, +9% (análisis secundario) | Sin reseñas en esta ronda; precios en disputa (USD 10,99–13,49) | Ídem |
| **Linear** | Más de USD 100 M de ingreso anual y USD 2,5 mil millones de valuación en una venta de acciones de agosto de 2026 (agregadores) | Buena experiencia de teclado y velocidad: es la referencia de calidad. Solo para equipos de producto | Aprender de su velocidad, no de su público |
| **Trello** (Atlassian) | n.d. | Simple; su cronograma está solo en planes de pago y el plan gratis limita complementos a uno | Gantt personal sin pagar por usuario |
| **Basecamp** | n.d. | Opinionado; plan gratis limitado | Otro enfoque |
| **Height** | Cerró el 24-09-2025 (AlternativeTo) | — | Evidencia de riesgo de «herramienta que desaparece» |

### 6.2 Listas personales

| Producto | Tamaño | Qué aman / odian | Hueco |
|---|---|---|---|
| **Todoist** | Más de 50 M de usuarios (⚠ dato de la propia empresa y de su fundador, mayo de 2026); sin inversores externos; suba de plan Business a USD 10 en jul-2026 (una sola fuente) | Sin reseñas recogidas en esta ronda; en su plan gratis faltan calendario, duración de tareas y copias | No muestra el tiempo de varios proyectos |
| **TickTick** | ≈ 30 M de usuarios (⚠ cifra de ClickUp) | Aman el calendario y el plan gratis generoso (Capterra 4,7 sobre 129; G2 4,0). Critican el diseño, que es básico en subtareas y programación avanzada, la sincronización y la colaboración débil. No confirmé si tiene vista de Gantt | Falta el cronograma de proyectos |
| **Things 3** | n.d. | Aman el diseño y la fiabilidad. Solo Apple, sin colaboración, actualizaciones más lentas que las de suscripción, sincronización propietaria difícil de exportar | Multiplataforma, datos abiertos |
| **Superlist** | n.d. (de un cofundador de Wunderlist) | Plan gratis y Basic USD 5 (toolradar, oct-2026) | Colaborativa, no cronograma |

### 6.3 Planificadores de día y calendario con IA (donde está el dinero del segmento)

| Producto | Tamaño | Qué aman / odian | Hueco |
|---|---|---|---|
| **Sunsama** | Ingreso anual de USD 1,1–1,5 M y 9–14 empleados (Latka, estimaciones que no coinciden y de baja confiabilidad, ⚠ año 2023); eso implica ≈ 5.400–7.400 suscriptores a USD 204 (INFERENCIA) | Aman el método (ritual de planificación diaria; útil con TDAH). **Odian el celular** («casi inutilizable» para editar, reseñas de feb-2026), el precio (subió en 2026), la dificultad para cancelar y la poca novedad. Poco seguimiento de proyectos (⚠ casi todo de blogs de competidores) | Es el mejor producto en el nivel «día»; no mira meses ni capacidad |
| **Motion** | La empresa dice ocho cifras de ingreso en 3 meses para su línea «AI Employees» (⚠ dato propio, relayado, sin verificar) | Aman el reacomodo automático. **Odian** las subas de precio, la cancelación («dark patterns» según una reseña de Trustpilot), el soporte hecho con IA, el celular y el exceso de funciones (⚠ blogs de competidores) | Replanifica a nivel de calendario; para equipos y empresas; USD 19–49 |
| **Akiflow** | Calificación 4,7 sobre 330 reseñas (agregado toolradar) | «Muy caro» (App Store); sin plan gratis | Día y calendario |
| **Reclaim** | Comprada por Dropbox en ago-2024 (GeekWire); 22 personas | Sin reseñas en esta ronda | Reuniones y hábitos |
| **Morgen, Amie, FlowSavvy, SkedPal** | n.d. | Amie desplazó su foco a notas de reuniones con IA (varios blogs); muchos usuarios buscan «lo que Amie era» | Hay hambre de calendario + tareas simple y barata |
| **Clockwise** | Cerró el 27-03-2026 (blog Carly ⚠) | — | Evidencia de riesgo de cierre |

### 6.4 Línea visual del día para personas con TDAH

| Producto | Tamaño | Qué aman / odian | Hueco |
|---|---|---|---|
| **Tiimo** | **App del Año 2025 de Apple (iPhone)**; más de 3 M de descargas (ficha de Apple relayada); entre USD 4,8 M y 5,9 M de financiación según la fuente; ≈ USD 10 por mes (fuentes dispares) | Diseño amable y visual | A escala de día, no de proyectos |
| **Structured** | 15 M+ de descargas, 500 mil+ usuarios pro, 30+ idiomas (⚠ cifras de su propia web, leída el 15-11-2026); pago vitalicio disponible | Línea de tiempo visual del día | Día, no proyectos |

Aprendizaje (INFERENCIA): un planificador **visual y calmo** puede ganar premios y descargas masivas con un equipo chico; la visualización
es una vía de entrada y no un lujo.

### 6.5 Gantt

| Producto | Qué pasa | Hueco |
|---|---|---|
| **GanttPRO** | Lanzó en abril de 2026 un «AI Gantt maker» gratis que arma el plan desde unas frases (⚠ comunicado de prensa propio) | Para jefes de proyecto, por usuario, sin horas personales |
| **Instagantt** | Asistente de IA en beta, solo en su versión independiente (⚠ documentación propia) | Ídem |
| **Tom's Planner** | «AI Assist» (promesa propia) | Ídem |
| **OmniPlan** | Perpetuo de USD 399,99 o suscripción | Profesional, Apple, caro |

**«Plan desde una frase» ya existe** en los Gantt para equipos. No es un diferencial por sí solo (§9).

---

## 7. Señales del mercado 2025–2026 (qué dicen de dónde está el espacio)

1. **Cierres:** Height (24-09-2025), Clockwise (27-03-2026). **Compras:** Reclaim por Dropbox (ago-2024). **Cambios de rumbo:** Amie hacia IA.
   Las herramientas independientes de productividad mueren o se mudan; la gente lo sabe. INFERENCIA: «tu plan es un archivo tuyo» es un
   argumento diferenciador creíble.
2. **Subas de precio:** Sunsama (2026), Motion (varias, según Trustpilot), Todoist Business (jul-2026, una fuente). La mercadería sube y
   el segmento de USD 3–5 por mes queda disponible.
3. **IA = dinero medido:** Notion cobra créditos desde mayo de 2026; Linear mide algunas funciones de IA desde julio de 2026. Para un
   producto personal conviene **que la IA sea cara de usar solo cuando hace falta** y que el motor de planificación no la necesite.
4. **Los grandes del equipo se alejan de la persona sola** (monday hacia empresas grandes). Los incumbentes de listas (Todoist, TickTick)
   no ofrecen cronograma de varios proyectos con horas.
5. **Lo visual gana:** Tiimo (App del Año), Structured (15 M de descargas, dato propio).
6. **El celular es donde fallan:** reseñas contra la app móvil de Sunsama, Motion y Notion (⚠ en parte competidores). Planificar a escala de
   meses es de pantalla grande; vivir el plan es del celular. Telar tiene que ser **dos experiencias**, no una pantalla achicada.
7. **Argentina es Android:** 82–87% de los celulares según Statcounter (jul–ago 2026, el dato varía por página); el iPhone gana en ingreso por
   usuario, el Android en cantidad. La app web instalable cubre ambos; las tiendas, después.

---

## 8. Tamaño bottom-up (unidades × ticket × frecuencia)

**No uso TAM.** Los informes de «mercado de apps de productividad» (USD 12–14 mil millones para 2025–2026 según Fortune Business
Insights y Research and Markets, ⚠ vendedores de informes) no sirven para decidir: mezclan software de empresa con apps y las cifras de las
«apps de lista» difieren un 50% entre ellos.

### 8.1 Embudo en régimen (diciembre de 2030)

| Eslabón | Bajo | Normal | Alto | Método |
|---|---|---|---|---|
| Visitas por mes a la web (plantillas, galería, buscadores) | 20.000 | 40.000 | 100.000 | HIPÓTESIS: depende de cuántas plantillas indexen; medir en Search Console |
| % que se activa (crea un plan y vuelve en 7 días) | 7% | 9% | 10% | HIPÓTESIS |
| Vida media de un usuario activo (meses) | 5 | 6 | 7 | HIPÓTESIS |
| **Usuarios activos por mes** | **7.000** | **21.600 ≈ 22.000** | **70.000** | visitas × activación × vida |
| % de activos que paga | 2,0% | 3,2% | 4,0% | La mediana de descarga a pago es 2,0% (todas las categorías; 2,1% en freemium) según RevenueCat 2026 (⚠ informe de un proveedor de cobros, con sus propias apps); la normal asume que el dolor es de uso diario y la prueba gratis es generosa |
| **Suscriptores** | **140** | **≈ 700** | **2.800** | |
| Neto por suscriptor y mes | USD 3,0 | USD 3,7 | USD 3,7 | Lista USD 48 al año (≈ USD 30 en Latinoamérica), menos comisiones (≈ 5% + USD 0,50 por cobro con un procesador intermediario, dato de proveedores; 15% en las tiendas, conocimiento general sin verificar acá) y mezcla de países |
| **Ingreso neto de suscripciones por mes** | **≈ USD 420** | **≈ USD 2.600** | **≈ USD 10.400** | unidades × ticket × frecuencia mensual |
| Costo por mes (12 + 0,004 × activos + 0,6 × suscriptores) | ≈ USD 124 | ≈ USD 520 | ≈ USD 1.970 | Base local y relay barato; IA y sincronización solo de pagos (ESTIMACIÓN a verificar con la tarifa vigente de la API y del relay) |

La curva del proyecto (`P11-telar.yaml`) usa la columna **Normal** y aplica los multiplicadores del holding ×0,3 (malo) y ×3 (bueno), que
caen dentro del rango Bajo–Alto de arriba.

### 8.2 Controles de cordura (no son mercado, son comparaciones)

- **22.000 activos = 0,04% de los 50 M de usuarios que declara Todoist.** No necesitamos un mercado nuevo, solo un rincón.
- **700 suscriptores = 0,14% de los 500 mil «pro» que declara Structured** (⚠ propio) y ≈ 9–13% de los 5.400–7.400 suscriptores que
  implica el ingreso estimado de Sunsama (INFERENCIA con datos de baja calidad).
- **Base rate:** solo el 4,6% de las apps nuevas llega a USD 10.000 por mes en dos años (RevenueCat 2026). Nuestro éxito normal queda en
  USD 2.250 por mes de neto y el piso de «éxito» en ≈ USD 400 por mes: por eso `p_exito = 0,20` y no más.

### 8.3 Tres escenarios (todos son ESTIMACIÓN)

| Escenario | Probabilidad | Qué pasa | Resultado a dic-2030 |
|---|---|---|---|
| **No despega** | 80% | En dic-2027 hay menos de 2.000 activos o de 30 pagos | Se cierra en mantenimiento. Pérdida de USD 130–250 y ≈ 100 horas; queda una herramienta propia |
| **Nicho sostenible** | 16% | La curva normal o la mala | USD 0,7k a USD 2,3k netos por mes (centro: USD 2.250) |
| **Éxito grande** | 4% | ≈ 3 veces la normal | ≈ USD 6–7 mil netos por mes; más de 2.000 pagos |

**Valor esperado (ESTIMACIÓN):** neto acumulado de la curva normal entre abril de 2027 y septiembre de 2031 ≈ USD 65 mil (integrando
linealmente entre los puntos del caso). × 0,20 × 1,43 (media de los multiplicadores 0,3 / 1 / 3) ≈ **USD 18 mil esperados**, menos ≈ USD 130 de
costos esperados de los fallos. Con ≈ 305 horas del fundador, ≈ **USD 60 por hora** esperados. La corrida oficial la hace `herramientas/holding.py`.

**Contra la vara del holding (6–8% anual):** USD 120 en tesorería rinden ≈ USD 40 en 5 años; la apuesta los multiplica, pero **el capital es
irrelevante**: se decide por horas. Esos ≈ USD 60 esperados por hora del fundador hay que compararlos, en el comité (`/comite`), contra lo que
rinden las horas en las demás líneas del holding.

### 8.4 Lo que no sé y cómo conseguirlo

| Dato que falta | Cómo se consigue | Cuándo |
|---|---|---|
| Búsquedas mensuales de «cronograma personal», «plantilla gantt», «plan de tesis», etc. | Search Console después de publicar 10 plantillas; Google Trends | feb-2027 |
| Retención real a semana 4 | Beta con ≥ 150 personas (analítica local, sin rastreo) | mar-2027 |
| Si pagan por «capacidad + replanificar» | 8–12 entrevistas + preventa del vitalicio «Fundadores» | ene–abr 2027 |
| Costo real de IA por acción | Registro desde el primer día de la beta | feb-2027 |
| Si el procesador de pagos acepta a la empresa y paga a la cuenta elegida | Consultar con cada plataforma (Paddle, Stripe, Polar, Lemon Squeezy: no pude confirmar Argentina en las fuentes) | feb-2027 |

---

## 9. Competencia

### 9.1 Directos (herramientas para una persona con proyectos y tiempo)

Sunsama, Motion, Akiflow, FlowSavvy, SkedPal, Morgen, Tiimo, Structured: **todos a escala de día**. TeamGantt (plan personal de 1 proyecto y
40 tareas), Instagantt individual (USD 12) y GanttPRO: **cronograma sin horas personales**. Ninguno junta **varios proyectos + capacidad + replanificar**
para una persona, hasta donde llegó mi búsqueda de 2025–2026 (INFERENCIA; el único hallazgo cercano es un planificador de disponibilidad para freelancers
que guarda en el navegador y no replanifica).

### 9.2 Sustitutos

Notion y Trello (armados a mano), ClickUp (complejo), Todoist y TickTick (listas), Apple Recordatorios, Google Calendar, Obsidian y otras
notas, Excel y Google Sheets. **La IA genérica también**: pedirle a Claude o ChatGPT «armame el plan» da un texto, no un plan vivo (INFERENCIA); cuando
puedan editar un plan guardado vía MCP (§9.4), son aliados, no rivales.

### 9.3 No hacer nada

Convivir con la planilla, la libreta y la ansiedad. Es la competencia más fuerte: **gratis y sin cambio**. La única manera de ganar es que
la primera semana el usuario vea algo que su planilla no le dice: «esto no te cabe». Por eso el primer minuto lo dedicamos a eso.

### 9.4 ¿Qué impediría que nos copien en 6 meses? Respuesta honesta

**Técnicamente, nada.** Notion, ClickUp o Todoist pueden sacar una vista de capacidad. Lo que queda es **economía y confianza**:

1. **Sus números no cierran con una persona sola.** Un producto de USD 4 por mes con costo casi cero solo lo sostiene quien tiene 1–2 personas. Los grandes
   se orientan a equipos (monday, Asana) o a IA por créditos (Notion, Motion). INFERENCIA.
2. **Sin cuenta y con archivo propio** choca con su negocio (nube y asientos). Es más fácil para ellos decir «exportá» que dejar los datos acá.
3. **Corpus de plantillas y planes públicos indexados:** se acumula, tarda 12 meses o más en copiarse y trae visitas gratis.
4. **Historial propio:** el factor de realismo de cada usuario (cuánto subestima) vive en su dispositivo y es un costo de cambio suave.
5. **Español primero y precio local** (hoy casi todos están en inglés y en dólares estadounidenses; ⚠ no verifiqué cuántos tienen paridad de
   precio por país).
6. **Velocidad de iteración** con Claude Max y un solo dueño.

Lo que **no** es defensa: el plan desde una frase (ya existe en GanttPRO e Instagantt) ni el aspecto.

---

## 10. Riesgos con evidencia

| Riesgo | Evidencia | Qué hacemos |
|---|---|---|
| Pérdida de datos en iPhone sin app instalada | Fuentes secundarias (jun–nov 2026): Safari borra el almacenamiento de un sitio no usado en 7 días, salvo que esté en la pantalla de inicio. Sin verificación oficial: **comprobar en la documentación de WebKit** | Pedir instalar, copia automática a archivo, sincronización Pro y envoltorio nativo (Capacitor, versión 8 en su documentación) |
| Que la IA invente un plan | Es el riesgo conocido de usar IA para fechas | El motor de fechas es determinista; la IA solo propone cambios que el usuario aprueba (`producto.md`) |
| Plan gratis que no engancha | Retención de las apps de bajo precio: 36% mediana contra 23% en las caras (RevenueCat 2026, todas las categorías) | Ejemplo vivo y «esto no te cabe» en el primer minuto |
| Cancelaciones del mes 1 | 35% de las cancelaciones anuales ocurren en el mes 1 (RevenueCat 2026, todas las categorías) | Anual como opción central y cancelar con un clic (lo que odian de Sunsama y Motion) |
| Fundador anónimo: confianza | — | Formato abierto, pruebas públicas del motor y política de datos clara |
| Cobros a Argentina | Las fuentes no confirmaron pagos a cuentas argentinas | Empresa del holding antes de cobrar (feb-2027) y consulta directa |
| Soporte a miles de gratis | — | Ayuda dentro de la app, preguntas frecuentes y borradores; requiere autorización para las respuestas de plantilla (regla 8) |

---

## 11. Nombre: verificación de conflictos

Método (limitado): búsqueda web de «nombre + app / planificador», apertura de los dominios `.app` / `.io` / `.com` y búsqueda de marcas en
registros públicos de EE.UU. (Justia). **No tuve acceso al INPI ni a la EUIPO** (CLAUDE.md §8): la verificación decisiva es manual.

| # | Nombre | Qué evoca | Lo que encontré | Veredicto |
|---|---|---|---|---|
| 1 | **Telar** | Urdimbre = tiempo, trama = proyectos; cada proyecto es un hilo; «tejé tu año» | Ninguna app de planificación. **telar.io** es una plataforma de reclutamiento en español (otra categoría, misma palabra). En EE.UU., la marca TELAR (registro de 1992) está cancelada desde 2013. `telar.app` no se pudo comprobar; `telar.com` dio error 503. En portugués «tear» es telar: sin problema de lectura | **Recomendado**, sujeto a INPI clases 9 y 42 y a un dominio razonable |
| 2 | **Trazo** | Cada barra es un trazo: «trazá tu plan» | Sin software con ese nombre. `trazo.app` existe sin contenido; `trazo.com` está estacionado y posiblemente en venta | **Respaldo**; muy bueno en inglés |
| 3 | Rumbo | Dirección | `rumbo.app` en venta. Rumbo es una marca grande de viajes en España (conocimiento general, sin verificar acá) | Riesgo de confusión de marca |
| 4 | Hito | La fecha clave | Es la palabra «milestone»: descriptiva, marca débil | Flojo para defender |
| 5 | Pauta | Regla, compás | En Latinoamérica «pauta» es publicidad; `pauta.app` no resolvió | No verificado, ruido de búsqueda |
| 6 | Cauce | El río del tiempo | `cauce.app` ya es una app de presupuesto personal | Descartado (categoría vecina) |

También descartados: **Trama** (trama.app es un editor de historias interactivas con plan de pago; además hay una startup cordobesa de IA con ese nombre)
y **Tramo** (tramo.app es una plataforma de planeación municipal en Colombia).

**Recomendación: Telar.** Por qué: (1) la metáfora explica el producto sin texto (proyectos como hilos sobre el tiempo; las dos vistas son
el telar visto de frente y de atrás); (2) cinco letras, dos sílabas, se dice igual en español y se lee fácil en inglés; (3) es cálida y de acá
sin ser «gauchesca»; (4) es una palabra común, así que su defensa se apoya en la marca combinada («Telar» + logotipo + clases 9/42) y en el
contenido. Tarea del fundador: aprobar el gasto del INPI y del dominio (regla 8); si aparece un conflicto serio en clases 9 o 42, pasar a **Trazo**.

---

## 12. Guion de entrevistas (12 de 30 minutos; sirve con 5 y escala a 20)

**Regla de oro:** preguntar por **lo que hicieron**, no por lo que harían. Nada de «¿usarías…?» ni «¿pagarías…?». Pedir ejemplos de las
últimas 4 semanas, con fechas, herramientas y montos. Las entrevistas son asincrónicas si se prefiere (audios o texto): el fundador
**no sale a vender** y puede mantener el anonimato; publicar la convocatoria requiere su OK (regla 8).

### 12.1 A quién (12 personas, 4 perfiles)
- 4 freelancers o consultores con 2 o más clientes.
- 4 personas con un proyecto propio además de un trabajo o estudio.
- 2 tesistas o personas de posgrado.
- 2 parejas o personas que organizaron algo grande de a dos en los últimos 6 meses.

**Filtro (3 preguntas, descartar si falla alguna):** (1) ¿Tuviste 3 o más cosas con fecha abiertas a la vez en el último mes? (2) ¿Usás alguna
herramienta digital para organizarlas (aunque sea una planilla)? (3) ¿Hablás español de forma cotidiana?

### 12.2 Preguntas

**Bloque A. Contexto (5 min)**
1. Nombrame las cosas importantes con fecha que tenés abiertas hoy. ¿Cuáles tienen fecha dura y cuáles blanda?
2. ¿Cuántas horas por semana tenías disponibles de verdad el mes pasado? ¿Cómo lo sabés?

**Bloque B. La última vez que planificaste (6 min)**
3. Contame la última vez que te sentaste a armar un plan de varias cosas juntas. ¿Cuándo fue? ¿Dónde estabas? ¿Con qué herramienta? ¿Cuánto
   tardaste?
4. ¿Qué hiciste con ese plan después? ¿Cuándo fue la última vez que lo abriste? ¿Qué pasó con él?

**Bloque C. La semana rota (6 min)**
5. Pensá en la última vez que una semana se te desarmó (enfermedad, trabajo, imprevisto). ¿Qué tenías planeado? ¿Qué hiciste, paso a paso,
   para reacomodar? ¿Cuánto tiempo te llevó?
6. ¿Perdiste alguna fecha o dejaste a alguien esperando? ¿Cuándo te diste cuenta de que iba a pasar?
7. ¿Y la última vez que dijiste que sí a algo nuevo? ¿Cómo supiste si te cabía? ¿Qué se corrió?

**Bloque D. Herramientas y plata (6 min)**
8. ¿Qué herramientas abriste ayer para organizar tu tiempo o tus proyectos? ¿Y cuál abrís menos de lo que quisieras?
9. ¿Qué pagás hoy por esto? ¿Cuánto, desde cuándo, y cuándo fue la última vez que cancelaste algo de este tipo? ¿Por qué?
10. La última vez que probaste una herramienta nueva: ¿por qué la probaste, cuánto duró y por qué la dejaste o te quedaste?

**Bloque E. Estimar (3 min)**
11. Pensá en la última tarea de más de un día. ¿Cuánto pensabas que iba a llevar y cuánto llevó? ¿Cuándo te enteraste de la diferencia?

**Bloque F. Compartir (2 min, solo parejas y quien comparte)**
12. ¿Cómo se coordinaron la última vez? ¿Qué usaron? ¿Qué se les escapó?

**Bloque G. Cierre con material (2 min)**
13. (Mostrar la captura de un cronograma con carga semanal.) «¿En qué momento de las últimas 4 semanas te habría hecho falta ver algo así?
    Contame ese momento.» (Si no hay momento, es dato.)
14. «Armamos una prueba cerrada en enero. ¿Querés estar? ¿Me pasás un plan tuyo real, tapando lo que quieras, para cargarlo?» (Un compromiso
    de conducta; no es una opinión.)

**Qué NO preguntar:** si «les parece buena idea», cuánto «pagarían», qué función «les gustaría».

### 12.3 Criterios para seguir (decisión en enero de 2027)

| Señal | Seguimos si… |
|---|---|
| Semana rota reciente | ≥ 6 de 12 cuentan un caso concreto de los últimos 30 días con costo (fecha perdida o horas) |
| Hoy pagan | ≥ 4 de 12 pagan algo por organizar su tiempo, o lo pagaron en el último año |
| Planilla como alternativa | ≥ 5 de 12 usan planilla o Notion armada a mano y la describen como incómoda |
| Compromiso | ≥ 3 aceptan la prueba cerrada y comparten un plan real |
| Alerta | Si más de la mitad resuelve con calendario + lista y no siente el dolor, **frenar** y dejar Telar solo como herramienta propia |

---

## 13. Qué falta verificar (honestidad)

1. Reseñas de usuarios de Todoist, Trello, Asana, monday y ClickUp con comentario concreto sobre uso personal: esta ronda no las recogió.
2. Si TickTick o Notion ya muestran capacidad en horas en una vista de cronograma personal (hay que abrirlas y probar).
3. Precios vigentes de Notion, Trello, TickTick y Akiflow en la página oficial.
4. Disponibilidad de la marca en el INPI, la EUIPO y la USPTO, y de los dominios.
5. Comportamiento actual de Safari con almacenamiento y aplicaciones instaladas (documentación de WebKit).
6. Procesador de pagos que acepte a la empresa del holding y pague a destino.
7. Demanda de búsqueda por plantillas en español.
8. Reglas de las tiendas para una app que envuelve una web (Capacitor): leer las guías de revisión antes de enviar.

---

## 14. Fuentes (consultadas el 15-11-2026)

**Oficiales (leídas con fetch):**
- Todoist, precios: https://www.todoist.com/pricing
- Sunsama, precios: https://www.sunsama.com/pricing
- Motion, precios: https://www.usemotion.com/pricing
- GanttPRO, precios: https://www.ganttpro.com/pricing/
- Tiimo: https://www.tiimoapp.com/pricing
- Structured (cifras de su propia web ⚠): https://structured.app
- RevenueCat, State of Subscription Apps 2026 (⚠ proveedor de cobros): https://www.revenuecat.com/state-of-subscription-apps/ y la sección de productividad https://www.revenuecat.com/state-of-subscription-apps-2026-productivity
- Tauri 2 (escritorio y móvil, según su documentación): https://v2.tauri.app/start/
- Capacitor (iOS, Android y web, versión 8): https://capacitorjs.com/docs
- Yjs: https://docs.yjs.dev/
- OPFS (MDN, «Baseline: ampliamente disponible» desde marzo de 2023): https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system

**Secundarias (buscador; confiabilidad media o baja, precios que se contradicen):**
- Sunsama (reseñas, 2026): https://www.usecarly.com/blog/sunsama-review/ · https://www.morgen.so/blog-posts/sunsama-pricing (⚠ competidor)
- Motion (reseñas y precios): https://ellieplanner.com/comparisons/motion-app-review · https://blog.saner.ai/motion-reviews · Trustpilot https://www.trustpilot.com/review/www.usemotion.com
- Akiflow: https://www.morgen.so/blog-posts/akiflow-pricing (⚠) · https://toolradar.com/tools/akiflow/pricing
- Todoist (cambio de precio, una fuente): https://costbench.com/changelog/todoist-price-increase-2026-07/ · 50 M de usuarios: https://www.pulse.bot/entrepreneurship/news/doists-amir-salihefendic-at-podim-2026-50m-users-bootstrapped-ca256f69-51ab-4d57-a075-06f43456b5ba/
- TickTick: https://www.activepieces.com/blog/ticktick-pricing-in-2026-for-free-and-premium-plans · https://www.capterra.com/p/170641/TickTick/ · https://clickup.com/learn/topic/task-management/tools/ticktick/ (⚠ competidor)
- Things 3: https://toolradar.com/tools/things-3/pricing · https://makerstack.co/reviews/things-3-review/
- Notion (estimación de ingreso): https://sacra.com/research/notion-at-865m-year-growing-82-yoy/ · reseñas: https://www.capterra.com/p/186596/Notion/reviews/ · https://hackceleration.com/notion-review/
- Linear: https://pulse2.com/linear-completes-99-million-tender-at-2-5-billion-valuation-as-arr-tops-100-million-and-net-retention-hits-177/
- monday.com FY2025: https://uctoday.com/monday-com-q4-and-fy2025-earnings-revenue-tops-1-2-billion-as-ai-products-take-centre-stage
- Height (cierre): https://alternativeto.net/news/2025/3/height-project-management-tool-to-shut-down-by-september-2025
- Clockwise (cierre) y Amie (cambio de foco): https://www.usecarly.com/blog/clockwise-shut-down · https://www.usecarly.com/blog/what-happened-to-amie/ (⚠ blog de reseñas)
- Reclaim comprada por Dropbox: https://www.geekwire.com/2024/dropbox-acquires-reclaim-a-calendar-app-that-uses-ai-scheduling-to-boost-productivity/
- Tiimo (App del Año 2025): https://en.wikipedia.org/wiki/Tiimo
- GanttPRO AI (comunicado propio ⚠): https://www.accessnewswire.com/newsroom/en/computers-technology-and-internet/ganttpro-introduces-a-free-ai-gantt-chart-maker-that-turns-raw-id-1157645 · Instagantt AI: https://www.instagantt.com/help-guide/ai-assistant
- TeamGantt e Instagantt, precios: https://toolradar.com/tools/teamgantt/pricing · https://toolradar.com/tools/instagantt/pricing
- OmniPlan 4: https://apps.apple.com/us/app/id1460319993
- Basecamp: https://toolradar.com/tools/basecamp/pricing
- FlowSavvy, SkedPal: https://flowsavvy.app/pricing · https://toolradar.com/tools/skedpal/pricing
- Planificador de disponibilidad para freelancers (guarda en el navegador): https://fwdtools.com/freelance-availability-planner/
- Statcounter, Argentina: https://gs.statcounter.com/os-market-share/mobile/argentina
- PWA en iOS (blogs técnicos, sin Apple): https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide
- Merchant of record (blogs de proveedores ⚠): https://alexcloudstar.com/blog/merchant-of-record-indie-saas-2026/
- Nombres: https://trama.app · https://tramo.app · https://cauce.app · https://telar.io · https://rumbo.app · https://trazo.com · registro TELAR 1992: https://trademarks.justia.com/742/39/telar-74239991.html
- Tamaños de «mercado» descartados (⚠ vendedores de informes): https://www.fortunebusinessinsights.com/productivity-apps-market-110254
