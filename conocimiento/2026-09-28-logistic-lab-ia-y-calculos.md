# Bitácora — Logistic Lab: IA que arma la simulación, cálculos clave y propiedad intelectual (28-09-2026)

> Para el proyecto Logistic Lab (C1). Datos vía buscador; re-verificar antes de decidir.

## 1. ¿Existe ya "describir el proceso y que la IA arme la simulación"?

| Quién | Qué tiene (2025–2026) | Etiqueta | Fuente |
|---|---|---|---|
| **AnyLogic** | Asistente de IA integrado: responde dudas, explica modelos, corrige errores y **crea modelos simples a partir de texto** | HECHO | anylogic.com/features |
| **Siemens Plant Simulation** | Copilot que convierte lenguaje natural en lógica (SimTalk) y metodología de generación automática de modelos (ASMG); presentado en su conferencia 2025 | HECHO | blogs.sw.siemens.com/tecnomatix |
| **FlexSim** (hoy de Autodesk) | Herramienta de aprendizaje por refuerzo (2022) e integración con Autodesk Tandem (2026); **no encontramos un asistente nativo que arme el modelo desde texto** | HECHO / INFERENCIA | autodesk.com, forums.autodesk.com |
| Investigación | Trabajos 2026: modelos de lenguaje que generan simulaciones de eventos discretos para manufactura; convertir **imágenes de redes de colas en modelos verificables** (arXiv 2607.24259); traducción fiel de colas a SimPy (arXiv 2601.06543); estudio con FlexSim + IA generativa para logística (Applied Sciences, mar-2026) | HECHO | arxiv.org, mdpi |
| Código abierto | **Text2Sim MCP** (SimPy + dinámica de sistemas, se usa desde Claude) y **anylogicPLE-mcp** (genera modelos de AnyLogic desde Claude Code) | HECHO | github.com |
| Precios | AnyLogic Professional USD 12.390–18.990 por licencia; FlexSim ~USD 6.000 por año; AnyLogic PLE gratis pero limitada (5 h de tiempo simulado, 10 tipos de agente) | HECHO | checkthat.ai, trustradius, anylogic.help |

**Conclusión honesta:** la idea del fundador va en la dirección correcta, pero **la tecnología de base ya empezó a aparecer** en los
grandes (en inglés, para expertos y con licencias de miles de dólares) y en código abierto. El diferencial no puede ser "la IA arma
el modelo" solamente. Tiene que ser el **producto completo para quien hoy no simula**:

1. **Entrada como la da una persona real:** texto, audio, foto de un diagrama hecho a mano, PDF del procedimiento, planilla de
   volúmenes. La IA junta todo.
2. **Entrevista de ingeniero:** la IA detecta lo que falta (llegadas por hora, tiempos, turnos, recursos, variabilidad) y
   pregunta en criollo, con valores sugeridos de referencia cuando el usuario no sabe.
3. **Plantillas logísticas** (depósito, cross-dock, hub de clasificación, última milla, planta) que evitan errores típicos.
4. **Muestra supuestos y nivel de confianza**, y deja corregir cualquier número (lo que la hace auditable).
5. **Sale con una decisión, no con un modelo:** cuello de botella, costo por unidad, cuántas personas o vehículos, 3 escenarios
   "qué pasa si" y un informe en lenguaje llano.
6. **Costos argentinos actualizados solos** (ver sección 2): nadie lo hace para pymes.
7. **En español, en el navegador y a precio latinoamericano** (vs. USD 6.000–19.000).

Frase de producto (borrador): *"Contale tu operación como a un colega: en 10 minutos tenés la simulación, el cuello de botella y el
costo por paquete."*

## 2. Los cálculos que el mercado usa (lista del fundador + investigación)

| # | Cálculo | Quién lo busca | Dato local que lo hace único | Competencia |
|---|---|---|---|---|
| 1 | **Tarifa a transportistas vs. ingreso y volumen** (punto de equilibrio por paquete, por ruta o por hora) | Operadores de última milla, "flexeros", pymes con reparto | Tarifas de referencia de Envíos Flex (actualizadas el 1-09-2026; en CABA desde ~$3.000–4.200 por envío según operador) | Casi nula en español |
| 2 | **Costo por recorrido** (troncal y última milla): por km, por hora, por parada | Transportistas, pymes | Índice FADEEAC (+1,66% ago-2026; +27% en 8 meses; +42% interanual) e IMC de Última Milla de AECAUM (+1,64% ago; +28,6% en 8 meses) | Planillas sueltas |
| 3 | **Costo laboral por operario** ($/hora con cargas sociales, adicionales, ausentismo) | Pymes, operadores, estudiantes | Escalas del CCT 40/89 (chofer 1ª: $1.095.277 básico desde 1-09-2026; peón $982.642) y Comercio 130/75 | Calculadoras de sueldo genéricas, no de costo total |
| 4 | **Costo por proceso de clasificación** en media y última milla (por paquete clasificado) | Hubs, couriers | Productividad por puesto + costo laboral local + espacio | Nula |
| 5 | **Costo por proceso de almacenamiento** (recepción, posición, picking por línea, despacho: costeo por actividad) | Depósitos, 3PL, e-commerce | Índice de CEDOL/UTN (+1,66% con transporte; +1,06% sin transporte, ago-2026); alquiler logístico ~USD 7,2/m²/mes (GBA, 2026) | Artículos, pocas herramientas |
| 6 | **Rutas óptimas y cantidad de vehículos** (paradas por ruta, ventanas horarias) | Pymes con reparto | Mapas y zonas de AMBA | Herramientas pagas (Routific, etc.) |
| 7 | **Dotación por curva de volumen** (cuántas personas por turno para un pico: Hot Sale, CyberMonday) | Depósitos, e-commerce | Calendario local de picos | Nula |
| 8 | **Peso volumétrico, cubicaje, pallets y contenedores** | Todos | — | **Muy competida** (Omni, PackCalc, DSV): solo como puerta de entrada |
| 9 | **Stock de seguridad y punto de pedido** | Pymes, estudiantes | — | Competida; útil para cátedras |
| 10 | **Costo de Full vs. Flex vs. despacho propio** para vendedores de Mercado Libre | Vendedores | Tarifas y bonificaciones de MeLi | Poca, y conecta con R10 |

Contexto de demanda (HECHO): compras online +36,9% interanual en agosto-2026; cerca de **1 millón de entregas por día** en el país
(Infobae, 27-09-2026).

**Orden recomendado (INFERENCIA):** 1 → 2 → 3 → 4 → 5 (la lista del fundador, que es la que menos competencia tiene), con 8 como
puerta de entrada por búsquedas, y 6–7 después como módulos de simulación.

## 3. El simulador que el fundador hizo en su empresa (propiedad intelectual)

| Norma | Qué dice | Implicancia |
|---|---|---|
| Ley 11.723, art. 4 inc. d (texto de la Ley 25.036) | Son titulares del software las personas o empresas cuyos dependientes lo hayan producido **en el desempeño de sus funciones laborales**, salvo pacto en contrario | Si el simulador se hizo como parte del trabajo, **el código es de la empresa** |
| Ley de Contrato de Trabajo, art. 82 | Las invenciones que derivan de los procedimientos, métodos o instalaciones del establecimiento, o de mejoras de lo que ya se usa, son del empleador | Mismo sentido para métodos y mejoras |
| LCT, art. 85 (deber de fidelidad) y art. 88 (no concurrencia) | Guardar reserva de la información a la que se accede; no hacer negocios que puedan afectar los intereses del empleador sin su autorización | No usar datos, volúmenes, tarifas ni procesos identificables de la empresa; revisar el contrato por cláusulas de confidencialidad o no competencia |

**Cómo usarlo bien (recomendación):**
- Lo que sí es tuyo: **tu conocimiento y experiencia general** (cómo se piensa un hub, qué variables importan, qué errores son típicos).
- Paso seguro: describir el simulador **en términos generales** (qué preguntas responde, qué variables usa, qué salidas da),
  **sin copiar código, archivos, datos ni nombres de la empresa**, y que Claude construya desde cero un modelo genérico de
  procesamiento de última milla con parámetros públicos o inventados.
- Mejor todavía, si la relación lo permite: pedir autorización por escrito o no tocar ese tema hasta cambiar de trabajo.
- La marca anónima separa, pero **no elimina** el riesgo legal si se usara algo de la empresa.
- Consulta de 1 hora con un abogado laboral antes de lanzar el módulo de última milla (USD 50–100, ESTIMACIÓN).

Fuentes: anylogic.com; blogs.sw.siemens.com; autodesk.com; arxiv.org (2607.24259, 2601.06543, 2608.14956); mdpi.com (Applied
Sciences 16/7/3301); github.com (text2sim-MCP-server, anylogicPLE-mcp); checkthat.ai y trustradius.com (precios); anylogic.help
(PLE); fadeeac.org.ar (02-09-2026); infobae.com/movant (03-09, 07-09 y 27-09-2026); globalports.com.ar (CEDOL); cronista.com
(Camioneros sep-2026); mercadolibre.com.ar/ayuda (Envíos Flex); falcoenvios.com y jnenvios.com; omnicalculator.com; packcalc.org;
wipo.int y argentina.gob.ar (Ley 11.723 y LCT 20.744).

## 4. Barrido del ecosistema logístico (más allá de simuladores)

| Qué funciona afuera | Dato | Qué tomamos |
|---|---|---|
| **Ruteadores para repartidores** (Spoke, ex Circuit; Upper; Routific; MyWay) | Spoke/Circuit: ~USD 400 mil por mes y ~80 mil descargas por mes (estimación de Adapty/Sensor Tower 2026); gratis hasta 10 paradas, suscripción para rutas largas | **Ruteador para "flexeros" y cadetes** de AMBA: cargar paradas escaneando la etiqueta o pegando direcciones, orden óptimo, tiempo estimado y **cuánto te queda por paquete** con la tarifa de Flex. Suscripción en pesos; difusión en grupos de repartidores y TikTok sin cara |
| Envíos Flex de Mercado Libre | Fuente de ingreso de miles de repartidores independientes; más de 200 empresas de reparto solo en Buenos Aires; tarifas actualizadas el 1-09-2026 | Público concreto, con dolor diario (rutas largas, tarifas que no cierran) y reunido en grupos |
| Calculadoras genéricas (Omni, PackCalc) | Dominan peso volumétrico y cubicaje | Solo puerta de entrada; no competir ahí |
| Juegos de cadena de suministro para cátedras | The Fresh Connection en 200+ universidades (bitácora 26-09) | Juego en español (C2) conectado al simulador |

Fuentes: adapty.io (paywall de Circuit), upperinc.com, kardinal.ai, iproup.com, jnenvios.com.
