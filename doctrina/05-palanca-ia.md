# 05 — La palanca IA: modelo operativo

> Premisa del fundador (2026-09-26): "Siento que estoy usando MUY POCO la IA con el potencial que tiene. Si sirve para gestionar
> trámites, hacer aplicaciones, publicidad, vender como agente comercial, facilitar el flujo financiero, aunque tenga que contratar
> planes caros, quizás es rentable. Vos lo evaluás."

## 1. La tesis central: arbitraje de costo de ejecución

Durante décadas, muchos negocios buenos tenían márgenes finos por una razón: **el trabajo administrativo, comercial y de
coordinación era caro**. Administrar un edificio, llevar la administración de una flota, buscar y cotizar una máquina en Europa,
armar un estudio de logística: todo eso eran horas de gente.

En 2026 ese costo colapsó para el trabajo de texto, código, análisis y coordinación:

- **HECHO**: el costo de inferencia de nivel GPT-4 cayó de ~USD 30 a < USD 0,50 por millón de tokens en ~2 años (-95%); el índice
  Silicon Data de gasto por token marcó un mínimo de ~USD 0,97/M en sep-2026.
- **HECHO**: fondos de EE.UU. están comprando empresas de servicios tradicionales para "recablearlas" con IA: Thrive Holdings
  (respaldada por OpenAI) comprometió USD 1.000 M para comprar estudios contables vía *Current* (~50 estudios); General Catalyst
  USD 1.500 M para contables, call centers, administradores de propiedades e IT. Compran a 4–8x EBITDA para re-valuar a múltiplos
  de software.
- **INFERENCIA** (confianza alta): en Argentina ese modelo no llegó. Un fundador solo, con Claude como fuerza de trabajo, puede
  capturar una versión micro del mismo arbitraje en servicios recurrentes, fragmentados y de confianza local.

**Por eso esta organización prefiere oportunidades donde la IA ejecuta una parte grande del trabajo** (dimensión `palanca_ia`
del scorecard) y mide cada unidad por su *costo de servir* con IA vs. sin IA.

## 2. Qué puede hacer Claude hoy, función por función

| Función | Qué hace la IA (con supervisión) | Qué hace el fundador | Nivel de autonomía recomendado |
|---|---|---|---|
| Investigación y estrategia | Radar semanal, *due diligence*, modelos de escenarios, informes, tesis de inversión | Juicio final, conversaciones con clientes | Alto |
| Software | Apps, automatizaciones, scrapers, tableros, integraciones (web services de ARCA, WhatsApp Business API, planillas), simuladores | Priorizar, probar con usuarios | Alto (con revisión de código y pruebas) |
| Marketing | Posicionamiento, copys, landing pages, guiones de video, campañas de Meta/Google listas para cargar, análisis de resultados, SEO, contenido | Aprobar y cargar presupuesto | Medio: la IA prepara, el humano publica y paga |
| Ventas | Listas de prospectos, secuencias personalizadas, primera respuesta 24/7 por WhatsApp/web, calificación, propuestas, seguimiento, CRM | Cierre, reuniones, relaciones | Medio en inbound; bajo en outbound frío |
| Operaciones / back-office | Liquidaciones (por ej. expensas), conciliaciones, OCR de facturas, recordatorios, reportes a clientes, agenda | Excepciones y emergencias | Alto dentro de plantillas aprobadas |
| Trámites | Checklists, formularios pre-llenados, notas, seguimiento de expedientes, lectura de normas | Firmar, presentar con su clave fiscal, asistir | Bajo: la IA prepara, el humano presenta |
| Finanzas | Libro de capital, flujo de caja proyectado, alertas, reconciliación, monitoreo de tesorería, memos de inversión | Mover dinero, invertir | Solo lectura: **el dinero siempre lo mueve el humano** |
| Legal | Borradores de contratos, términos, análisis normativo preliminar | Revisión profesional en lo importante | Bajo |

## 3. Qué NO debe hacer (o no puede)

- **Firmar, presentarse físicamente o representar legalmente** al fundador.
- **Mover dinero de forma autónoma.** Toda transferencia, compra de pauta o inversión la ejecuta el fundador.
- **Enviar mensajes masivos no solicitados.** WhatsApp exige *opt-in* y banea números; la automatización de LinkedIn viola sus
  términos. Outbound frío: email B2B personalizado y en bajo volumen, siempre aprobado.
- **Hacerse pasar por humano** en contextos donde el interlocutor tiene derecho a saberlo. Los agentes conversacionales se
  identifican como asistentes.
- **Garantizar exactitud sin control.** Todo lo que toca dinero, impuestos o compromisos contractuales lleva verificación
  (doble fuente, prueba automática o revisión humana).
- **Tratar datos personales sin cuidado**: Ley 25.326 de Protección de Datos Personales; minimizar datos, consentimiento, acceso restringido.

## 4. El stack y sus costos (sep-2026)

| Componente | Costo | Para qué |
|---|---|---|
| Claude Pro | USD 20/mes | Uso liviano |
| **Claude Max 5x** | **USD 100/mes** | **Activo desde el 17-10-2026.** Sesiones largas, Claude Code en paralelo, subagentes, tareas programadas; según la página de precios trae un crédito mensual de API de USD 100 (verificar en la cuenta) |
| Claude Max 20x | USD 200/mes | Sprints de construcción (1–3 meses) o el mes de un lanzamiento, si `/usage` muestra cortes seguidos; crédito de API de USD 200 |
| API Claude (agentes en producción) | Sonnet 5: USD 2 / 10 por M tokens (entrada/salida); Haiku 4.5: USD 1 / 5; Opus 5.5: USD 4 / 20; *batch* -50%; caché de lectura ~-90% | Agentes 24/7 (WhatsApp, back-office), procesamiento masivo |
| WhatsApp Business API (Argentina) | Marketing ~USD 0,062/msg; utilidad ~USD 0,012/msg; + BSP USD 0,003–0,01/msg; cobro por mensaje desde 1-10-2026 | Canal principal con clientes argentinos |
| Meta Ads (Argentina, ago-2026) | CPM promedio ~ARS 2.870 (~USD 1,9); CPC ~ARS 129 (~USD 0,085) | Adquisición barata de atención |
| Rutinas programadas del entorno | Incluidas en la sesión | Radar semanal automático, revisiones mensuales |

### Cuánto cuesta un "empleado IA" (ESTIMACIÓN)

Conversación comercial típica por WhatsApp: ~10 turnos, contexto de ~3.000 tokens cacheado, ~300 tokens de respuesta por turno.

- Modelo (Sonnet 5, con caché): ≈ 10 × (3.000 × 2/10⁶ × 0,1 + 300 × 10/10⁶) ≈ **USD 0,04**
- Mensajes de WhatsApp (utilidad/servicio): ≈ 10 × 0,012–0,02 ≈ **USD 0,12–0,20**
- **Total ≈ USD 0,15–0,25 por conversación**, 24/7, en segundos.

Referencia humana: un/a administrativo/a o vendedor/a junior en Argentina cuesta ~USD 800–1.200/mes con cargas y maneja ~1.000–1.500
conversaciones/mes → **~USD 0,6–1,2 por conversación**, en horario laboral. La IA es 3–6x más barata y no duerme, pero **no
cierra ventas complejas ni reemplaza la confianza**: se usa como primera línea y para liberar horas del fundador.

## 5. Regla de rentabilidad de los planes caros

- **Max 5x (USD 100)**: se paga si ahorra ≥ 10 horas/mes a una tarifa sombra de USD 10/h. En esta etapa el ahorro esperado es
  muy superior (investigación, código, marketing). **Recomendado.**
- **Max 20x (USD 200)**: se justifica en meses de construcción intensiva (por ej. desarrollar la plataforma de back-office de una
  unidad validada). No antes de tener una unidad validada.
- **API en producción**: se presupuesta por unidad como costo variable (costo por cliente atendido). Se mide mensualmente.
- **Revisión mensual** (`/revision`): costo IA total vs horas ahorradas vs ingresos habilitados. Si el ratio empeora 2 meses
  seguidos, bajar de plan.

### 5b. Desde el 17-10-2026: cómo exprimir Max (DEC-2026-10-17-2)

Max saca el cuello de botella de Claude, **no el del fundador** (6–10 h por semana). Entonces:

1. **Adelantar lo que casi no pide horas del fundador**: código, contenido, juegos en portales (el portal trae a los jugadores),
   calculadoras y automatizaciones. Lo que pide su tiempo o su plata (Posta, la compra, la empresa) sigue en su fecha.
2. **Una sesión por frente**, cada una con su contexto: Senda (motor 1), Andén (motor 2), juegos (línea de pocas horas) y el holding
   (radar, comité, informes). El fundador las abre desde el celular cuando tiene un rato.
3. **Agentes en paralelo** para investigar y verificar (como el 17-10: mercado, ecosistema, documentación y construcción a la vez), y
   **pruebas automáticas** en todo lo que se construye (la verificación es lo que permite delegar sin bajar la calidad).
4. **Tareas programadas** para lo repetitivo: `/radar` semanal y `/revision` mensual en sesiones nuevas (se crean con el OK del fundador:
   consumen cuota aunque nadie mire).
5. **El crédito de API** (si se confirma) paga las funciones de IA en producción de los primeros meses: la entrevista de Andén, el
   experimento de juego con IA, el compañero de Senda.
6. **Medir**: `/usage` cada mes en `/revision`. Si en un mes de sprint se corta seguido la ventana de 5 horas o la semana, 20x ese mes
   y volver. La regla de ahorro sigue: si a mediados de 2028 los proyectos no cubren los costos fijos, se vuelve a Pro.

Lo que **no** cambia: dos motores a la vez como máximo (por horas del fundador), regla 8 (plata y terceros con su OK) y calidad antes
que velocidad.

## 6. Niveles de autonomía

| Nivel | La IA... | Ejemplos |
|---|---|---|
| L0 | Prepara; el humano ejecuta | Pagos, inversiones, trámites con clave fiscal, contratos, publicar pauta |
| L1 | Ejecuta dentro de plantillas pre-aprobadas | Recordatorios de vencimientos, reportes mensuales a clientes, respuestas a preguntas frecuentes |
| L2 | Ejecuta con criterio propio dentro de límites y registra todo | Calificar leads, agendar reuniones, clasificar facturas, proponer respuestas a reclamos |

Se empieza en L0/L1 y se sube de nivel solo con una tasa de error medida y aceptable.

## 7. Qué hago yo (Claude) en los primeros 90 días

- Mantener el radar vivo (rutina semanal) y el tablero actualizado.
- Construir las herramientas de cada experimento: *landing pages*, formularios, simuladores, auditor de expensas, bot de
  preguntas frecuentes, planillas y scripts.
- Preparar campañas listas para cargar (copys, segmentación, presupuesto, métricas de corte).
- Preparar guiones de entrevistas de clientes y sintetizar lo aprendido.
- Llevar el libro de capital y el informe mensual.
- Redactar todos los mensajes, propuestas y documentos que el fundador tenga que enviar o firmar.

## 8. Métricas de la palanca

- % de tareas de cada unidad ejecutadas por IA (objetivo ≥ 60% en unidades de servicio).
- Horas del fundador por cliente atendido (debe bajar mes a mes).
- Costo IA por cliente y por USD de ingreso.
- Tasa de error / retrabajo en tareas automatizadas.
