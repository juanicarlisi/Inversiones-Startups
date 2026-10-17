# Andén · Diseño maestro del simulador (17-10-2026)

> **Qué es este documento.** La síntesis de las tres visiones del simulador Andén (P2, `oportunidades/proyectos/P2-anden.yaml`):
> `visiones/rigor.md`, `visiones/experiencia.md` y `visiones/ia-nativa.md`, con el juicio de tres jueces (ingeniero, estratega y
> arquitecto). Responde al pedido del fundador del 17-10-2026: «el simulador logístico más espectacular, profundo, realista y avanzado
> que exista, superando incluso a FlexSim». El primer corte para construir ya está en `corte-1.md`; el resumen llano, en `README.md`.
>
> **Sobre qué se apoya.** Los seis informes de `conocimiento/anden-simulador-2026-10/` (`incumbentes.md`, `frontera-ia.md`,
> `tecnologia-web.md`, `realismo-logistico.md`, `motor-validacion.md`, `mercado.md`), sus mediciones, las mediciones de cada visión y
> **una medición nueva hecha para esta síntesis** (`medicion-sintesis/`, §4.5 y §3.3). Las URL vienen de esos informes, consultadas el
> 17-10-2026; esta síntesis abrió una sola fuente nueva (los vectores de prueba de Random123). Lo que un informe dejó sin verificar,
> acá sigue sin verificar y lo dice.
>
> **Etiquetas** (`doctrina/02-estandares-de-evidencia.md`): **HECHO** (fuente y fecha) · **MEDIDO** (medición propia reproducible) ·
> **ESTIMACIÓN** (con método) · **HIPÓTESIS** (a validar, con cómo) · **INFERENCIA** (razonamiento propio, con confianza).
>
> **Límites.** Ningún número sale de la empresa donde trabaja el fundador. Las plantillas se arman con datos públicos y conocimiento
> general (Ley 11.723 art. 4 inc. d; LCT arts. 82, 85 y 88; ver P2 › riesgos). Ningún nombre de empresa aparece en una plantilla: las
> empresas solo figuran como fuente citada.

---

## 0. El diseño en una página

1. **Qué es.** Andén es un **gemelo de decisiones logístico**: un simulador de hubs de clasificación, depósitos y última milla que
   corre entero en el dispositivo de quien lo usa. Su motor se verifica en público, cada resultado sale con una receta que lo reproduce
   bit a bit, y el resultado se comparte como una **escena viva**: un enlace que abre en cualquier teléfono, muestra la noche de la
   operación como una película y deja tocar, preguntar y comparar.
2. **Columna, cara y puerta.** Se toma como columna la visión mejor puntuada en la suma de los tres jueces, **rigor** (83 + 66 + 80 =
   229 de 300), y se le suman la cara de **experiencia** (66 + 82 + 76 = 224) y la puerta de **ia-nativa** (70 + 77 + 66 = 213). Las tres
   comparten esquema, motor y traza: no se elige una y se tira el resto. Quedan tres capas de un solo producto:
   - **abajo, el motor y el comprobante** (rigor): determinista, verificado contra teoría, con estadística que no deja mentir;
   - **la cara, la escena viva** (experiencia): película, cien noches, pantalla dividida con la misma suerte, enlace y QR;
   - **la puerta, el estudio por decisión** (ia-nativa): se pregunta lo que cambia la decisión, primero con formularios y desde el
     corte 2 con IA.
3. **Lo que trae de nuevo esta síntesis (MEDIDO hoy, `medicion-sintesis/`).**
   - Philox4x32-10 en JavaScript puro reproduce los tres vectores oficiales de Random123 y da 25–41 millones de uniformes por
     segundo: el azar por dirección es viable sin WebAssembly.
   - `log`, `exp` y `cos` propios coinciden bit a bit con los de V8 en 2 millones de valores cada uno, y en la maqueta del hub cuestan
     entre 0% y 25% más, con indicadores idénticos en 10 de 10 noches.
   - El 15% de recirculación de la peor noche de la maqueta **es un artefacto de la plantilla**: sale entero de una persona de rampa que
     cubría la ruta más pesada y tres rampas más. Con las personas repartidas por volumen, en las mismas 60 noches el máximo baja de
     15% a 0,03%. Lo que sí es real es que **el plan de clasificación es una decisión de primer orden y gratis**: entra como capacidad
     central (§2, A6).
4. **El corte 1, «Hub verificado, en escena»** (`corte-1.md`), se construye en **una sesión** con un paso 0 de contratos, ocho
   paquetes en paralelo y uno de integración. Trae el motor determinista con su batería de 85 pruebas exigibles, el hub con mecanismo
   (bandejas, rampas, personas, paradas, paquetes de dos bandejas, plan de clasificación), la estadística por defecto con el semáforo de
   decisión, la película en 2D y 2,5D sin placa de video, las cien noches sobre el plano, la pantalla dividida con la misma suerte, la
   biografía de cada paquete con causas confirmadas, el formulario por decisión, el enlace y el comprobante. No se publica: publicar
   pide la consulta legal y el OK del fundador.
5. **Lo que no se pelea.** Veinte años de bibliotecas, física de contacto, PLC, robots de seis ejes, fotorrealismo de Omniverse y CAD
   corporativo. Andén gana donde se decide si alguien firma una recomendación: que el número sea correcto, se pueda reproducir y explicar,
   llegue a quien decide y salga a tiempo, en español, con costos locales y en el teléfono.
6. **Lo que tiene que decidir el fundador** (§12): la consulta legal antes de publicar cualquier plantilla de hub, el OK para publicar,
   si se compran 2 o 3 teléfonos usados de prueba, la revisión de las licencias de los incumbentes antes de cualquier comparación pública,
   y la línea de pago (§11) antes del lanzamiento del Pro.

---

## 1. Tesis y categoría

### 1.1 Qué cambió en las últimas cuatro semanas (HECHO, `frontera-ia.md` §1.1 e `incumbentes.md`)

| Fecha | Qué | Consecuencia (INFERENCIA, confianza alta) |
|---|---|---|
| 15-09-2026 | AnyLogic Online: modelado completo en el navegador | «En el navegador» deja de diferenciar |
| 23-09-2026 | Simio abre un servidor MCP: Claude Code, Codex y otros manejan sus modelos | «Un agente maneja el simulador» deja de diferenciar |
| 24-09-2026 | AnyLogic 8.9.10 con asistente que arma «borradores simples» | «La IA arma el modelo» deja de diferenciar |
| 2606 (jun–ago 2026) | Siemens Plant Simulation con copiloto que escribe SimTalk | Ídem |
| 31-12-2026 | AutoMod deja de venderse y de tener soporte (fuente secundaria: un revendedor competidor; verificar) | Hay modeladores de manejo de materiales buscando dónde mudarse |

Si un modelo se arma en segundos, lo que escasea es **poder creerle** y **hacer que llegue a quien decide**. En un fundador anónimo, la
prueba pública reemplaza a la cara (INFERENCIA).

### 1.2 La categoría: el gemelo de decisiones

- **Nombre de mercado:** «gemelo de decisiones» (`mercado.md` §6). Un solo nombre hacia afuera; «simulación con comprobante», «escena
  viva» y «estudio por decisión» quedan como nombres internos de las tres capas (alerta del estratega: tres nombres para una sola cosa).
- **Promesa:** «Contale tu operación, mirala funcionar, compartila».
- **La unidad de valor es la decisión compartida**, no el modelo del analista: un estudio termina cuando quien decide lo abre, lo toca y
  entiende cuánto confiar (`mercado.md` §3, `experiencia.md` §1.2).
- **Lo que no se dice:** «el FlexSim barato», «IA que arma el modelo», «gemelo digital» a secas, «en el navegador» como mérito, ni
  ningún «nadie lo tiene» sin pasar por el registro de §1.3.

### 1.3 Qué es nuevo y qué no: el registro de afirmaciones

El juez ingeniero lo puso como la alerta más grave: exagerar la novedad ante el público más exigente destruye la única credibilidad de un
fundador anónimo. Regla: **ninguna afirmación de novedad sale a una página pública sin estar verificada en la fuente primaria y fechada**.
La redacción del diferencial cambia de «nadie lo tiene» a «lo tenemos **por defecto, verificable y en el teléfono**».

| Afirmación que tentaría | Qué existe (y su estado de verificación al 17-10-2026) | Cómo se dice |
|---|---|---|
| «Nadie da la probabilidad del evento» | Simio vende planificación con riesgo (RPS): HECHO, `incumbentes.md` §2.4 | «La probabilidad de perder el corte sale por defecto, con su intervalo y su receta» |
| «Nadie calibra desde resultados» | AnyLogic trae un experimento de calibración: conocimiento previo, **no verificado** (anylogic.help dio 403) | «Calibración bayesiana que dice cuándo los datos no alcanzan para separar dos parámetros» |
| «Nadie avisa cuántas corridas hacen falta» | SIMUL8 tendría una calculadora de corridas: conocimiento previo, **no verificado** | «Antes de correr, dice cuánto va a tardar la precisión que pediste» |
| «Nadie rebobina» | AnyLogic guardaría el estado del modelo: conocimiento previo, **no verificado** | «Rebobinar exacto en cualquier dispositivo, porque el motor es determinista» |
| «Nadie usa números aleatorios comunes» | FlexSim tiene «Repeat Streams» (HECHO); Simio trae KN y selección de subconjunto (HECHO) | «La misma suerte en las dos mitades de la pantalla, aunque cambies el modelo» |
| «Nadie explica cuellos» | Siemens tiene analizador de cuellos y Sankey (HECHO) | «La historia de cada paquete, con cada causa confirmada por un contrafactual» |
| «Nadie publica las pruebas de su motor» | No encontramos una batería pública en ningún incumbente (`motor-validacion.md` §1); no encontrar no prueba que no exista | «Nuestra batería es pública: corréla vos» |
| «Nadie corre en el teléfono» | realvirtual WEB corre 3D en el navegador sin motor de eventos (HECHO); AnyLogic Online no se sabe dónde calcula | «Calcula tu teléfono, sin placa de video y sin cuenta» |

El registro vive como archivo (`afirmaciones.yaml`, a crear en el corte 2 antes de cualquier página pública) con: afirmación, fuente
primaria, fecha, estado (verificada / pendiente / falsa) y dónde se usa. Una prueba automática bloquea la publicación si una página usa una
afirmación pendiente.

### 1.4 Por qué gana, para quién (INFERENCIA, confianza media salvo indicación)

| Quién | Qué usa hoy (HECHO, `mercado.md`) | Por qué cambiaría a Andén |
|---|---|---|
| Pyme y operador que no simula (79% del Delphi de la WSC 2022) | Excel, intuición | Plantilla de su problema en 10 minutos, en español, con costos argentinos y una respuesta en «noches de cada 10» |
| Ingeniero o analista | FlexSim (~USD 6.000/año), AnyLogic, Simio | Estadística que no deja mentir por defecto, hub con mecanismo verificado, receta que su jefe reproduce |
| Consultor | Su licencia más un PowerPoint | La escena viva y el modo directorio: el cliente pregunta en la sala y la respuesta sale en vivo |
| Cátedra | Arena estudiante (150 entidades), FlexSim Express (30 objetos), AnyLogic PLE | Gratis sin tope, semilla por alumno y corrección por receta sin servidor |
| Agente de IA de un usuario | Simio por MCP, sobre escritorio caro | El mismo motor por MCP local, con comprobante, sin costo de servidor |

### 1.5 Lo que concedemos (HECHO salvo indicación)

- **Amplitud de bibliotecas:** peatones, tránsito, ferrocarril y GIS (AnyLogic); 20 años de objetos (FlexSim).
- **Física y control:** Emulate3D prueba PLC reales con física 3D y fallas inyectadas.
- **Fotorrealismo:** se terceriza en NVIDIA Omniverse con placas RTX (Isaac Sim 6.0.1 pide RTX 4080 como mínimo).
- **Integración corporativa:** CAD de Autodesk, MES de Siemens.

La vara de «superar a FlexSim» no es tener más objetos: es que, en hubs, depósitos y última milla, **el número de Andén sea más confiable,
más rápido de obtener, más fácil de defender y llegue a más gente** (`mercado.md` §5: Onshape fue superior técnicamente y no desplazó a
SolidWorks; Canva y Figma agrandaron el mercado).

### 1.6 Por qué no lo copian rápido (INFERENCIA, confianza media)

1. El determinismo entre máquinas se diseña desde el núcleo (tiempo entero, matemática propia, azar por dirección); un motor de 20 años
   con modelos de clientes no se cambia sin romper la compatibilidad.
2. Su formato es código (FlexScript, SimTalk, Java); el de Andén es un esquema que un compilador verifica.
3. Su negocio es la licencia por puesto (USD 4.995–21.800 por año, HECHO): un motor completo gratis que corre en el dispositivo la
   canibaliza.
4. Lo que no se copia barato: español, teléfono sin GPU, verticales argentinas con costos locales, batería pública, modo cátedra con
   recetas y precio regional (alerta del estratega sobre AnyLogic Online).

---

## 2. Capacidades diferenciales

Las tres visiones sumaban 53 capacidades. Quedan **15**, cada una con su corte. Formato: **qué hace** · **qué existe hoy y por qué no
alcanza** · **cómo se construye** · **evidencia** · **corte**. Los textos de pantalla con números son ejemplos de diseño, no resultados.

### A1. Motor verificado en público, con conformidad de trazas (rigor D1–D2 + faltante del arquitecto)

- **Qué hace.** Una batería con valor analítico esperado y tolerancia declarada (colas, casos publicados, cinemática, mecanismo del hub,
  estadística, reproducibilidad) corre en cada cambio. Además, una **especificación escrita de la semántica del motor** (orden de eventos
  simultáneos, fases, redondeo al tick, consumo de azar por bloque) con un juego de **trazas doradas** por huella, al estilo de Test262:
  la integración continua bloquea por huella exacta, y la batería estadística corre aparte con n grande.
- **Qué existe.** No encontramos una batería pública de verificación en los incumbentes (`motor-validacion.md` §1). Emulate3D tiene un
  Test Runner, para PLC (HECHO).
- **Cómo.** Pruebas con `node --test` (Node 22.22 corre `.ts` directo: MEDIDO hoy) y en navegadores con Playwright. IDs únicos (el juez
  arquitecto encontró V01–V05 repetidos para ρ = 0,5 y 0,8 en `resultados-validacion.json`). Criterio: |error| ≤ 3,29 errores estándar y
  error relativo ≤ 3% (≤ 2% en probabilidades). Con 85 pruebas exigibles, la chance de al menos una falsa alarma por corrida es
  1 − 0,999⁸⁵ ≈ 8% (cuenta); por eso una falla se re-corre sola con otra semilla y 4 veces más réplicas, y solo si vuelve a fallar es
  error del motor. Cada cambio intencional de una huella dorada exige una re-certificación estadística registrada.
- **Evidencia.** La maqueta `motor_ref.js` pasó 59 de 59 exigibles (MEDIDO, `medicion-motor/`). Tres casos de Law caen dentro de sus
  intervalos publicados.
- **Corte.** 1 (batería y doradas); 2 (página «Andén Verificado» en borrador, se publica con OK); 4 (exportación a SimPy y Ciw: «no nos
  creas, corrélo en Python»).

### A2. Resultado con comprobante: la misma huella en cualquier dispositivo (rigor D3 + experiencia E14 corregida)

- **Qué hace.** Cada resultado lleva su receta (huella del modelo, versión del motor, semilla, réplicas, noche, instante) y su
  comprobante (pruebas del motor que pasó, controles del modelo, semáforo, procedencia de los datos). Abrir la receta en otro teléfono
  reproduce lo mismo bit a bit.
- **Qué existe.** FlexSim repite flujos en la misma instalación (HECHO). La igualdad entre máquinas no la encontramos documentada.
- **Cómo.** Siete reglas del motor (§4.4): tiempo en milisegundos enteros, desempate (t, fase, prioridad, secuencia), matemática propia,
  azar por dirección, sin SIMD relajado, agregación por índice de réplica, huella de 64 bits de los eventos. Las versiones del motor se
  publican inmutables y direccionadas por contenido: una receta de 2027 abre en 2030 con el motor con que se hizo.
- **Evidencia.** Matemática propia idéntica a V8 en 2 millones de valores por función; Philox con los tres vectores oficiales (MEDIDO hoy).
  Falta R04: la misma huella en Chrome, Firefox, Safari y Node. El corte 1 la corre en Node y Chromium; Firefox y WebKit si Playwright los
  instala. Playwright con WebKit en Linux **no es** Safari en un iPhone (alerta del arquitecto): hace falta la **sonda colectiva** (cada
  escena abierta corre en segundo plano una traza dorada de ~50 ms y reporta, anónima y sin cookies, si pasó, con el agente de usuario) o
  teléfonos de prueba.
- **El sello dice lo que prueba y nada más** (alerta de los tres jueces): «Los números que ves los calculó este dispositivo y coinciden con
  la receta». No dice «verificado» ni «validado» (§5.9).
- **Corte.** 1 (receta, comprobante, R04 en Node y Chromium); 2 (sonda colectiva con OK para publicar, motores inmutables).

### A3. Estadística que no deja mentir y semáforo de decisión (rigor D4 + ia-nativa)

- **Qué hace.** Por defecto: réplicas independientes hasta la precisión pedida, media con IC de t de Student, P90 con IC por estadísticos
  de orden, probabilidad del evento que importa con IC de Wilson, aviso del costo antes de correr. Y un **semáforo que mira si el intervalo
  cruza la meta de la decisión**, no solo su ancho, con réplicas secuenciales que se concentran en las configuraciones en duda.
- **Qué existe.** FlexSim usa réplicas fijas e intervalos «inspeccionados visualmente» (HECHO). Law midió 7,2% de cobertura real con un
  método presente «en uno o más productos comerciales» (HECHO, WSC 2023). Simio aconseja mirar gráficos para el calentamiento (HECHO).
- **Cómo.** Fórmulas cerradas en `experimentos/`. Calentamiento con MSER-5 sobre el **promedio** de réplicas (en una sola corrida empeora
  el sesgo: MEDIDO). Una configuración «cumple» si el extremo inferior del IC de Wilson supera la meta, «no cumple» si el superior queda
  abajo, y está «en duda» si la cruza.
- **Evidencia.** Cobertura 8,4% ingenua, 82,2% con lotes y 94,4% con réplicas (MEDIDO). Con 20 réplicas salía 4 puestos con P̂ = 0,95
  [0,76; 0,99] cuando 4 puestos cumplen el 84% [0,80; 0,87] con 400 (MEDIDO, `medicion-ia-nativa/`): el semáforo lo habría marcado en duda.
- **Corte.** 1.

### A4. Comparar con la misma suerte (rigor D5 + experiencia E7, con la corrección del juez)

- **Qué hace.** Toda comparación es pareada: las dos mitades de la pantalla tienen los mismos camiones, la misma mezcla, las mismas
  faltas. Lo que se ve distinto es el efecto de la decisión.
- **Qué existe.** FlexSim «Repeat Streams» (HECHO); los CRN no vienen sincronizados por diseño.
- **Cómo: azar por dirección semántica.** Philox4x32-10 con clave (semilla, clave de la dirección) y contador (réplica, a, b, c). La
  dirección es **por propósito, nunca por orden de sorteo**: (ruta del bloque en el esquema + propósito, ordinal estable de la entidad
  en su fuente, segundo índice, intento). El juez ingeniero y el arquitecto señalaron la trampa: si el contador es el número de sorteo de
  la entidad, un escenario que agrega una vuelta corre todos los sorteos siguientes. Con esta dirección, la lectura del paquete
  (camión 7, paquete 233) en su intento 2 es siempre el mismo número, aunque cambie la cantidad de rampas o de inductores. Los atributos
  se sortean al nacer (ruta, tamaño, tiempo base de inducción, manejo en la rampa).
- **Evidencia.** Pantalla dividida: varianza de la diferencia 8,4 veces menor en el P90 de espera (MEDIDO, `experiencia-medicion/`);
  CRN 34 veces en un cambio chico y 1,43 en uno grande (MEDIDO, `motor-validacion.md`). Variables de control: ÷1,6–2,5 adicional
  (MEDIDO, `rigor-medicion/`; corte 2).
- **Corte.** 1 (CRN semánticos, pantalla dividida, prueba R05 con recirculación distinta entre escenarios); 2 (variables de control).

### A5. El mecanismo del hub, con fidelidad verificada (rigor D7–D8 + faltantes del ingeniero)

- **Qué hace.** El hub se simula como mecanismo, no como tasas: bandejas con paso que giran, ventana de desvío, rampas que se llenan,
  recirculación con máximo de vueltas, NO-READ a manual, contrapresión de las cintas, personas de rampa con reglas, jaulas que se
  cierran, **paquetes que ocupan dos bandejas**, **no transportables a flujo manual** y **micro-paradas del lazo** (atascos). Cada bloque
  existe en niveles de fidelidad (F0 fórmula, F2 cola, F3 mecanismo) y Andén **verifica la consistencia** entre niveles en un rango
  escrito como dominio de validez.
- **Qué existe.** Los generalistas traen bloques genéricos; BEUMER y Vanderlande simulan **su** equipo (HECHO). Con inducción manual, los
  sorters rinden 40–70% de su diseño según un proveedor (HECHO autoinformado): una tasa fija esconde justo lo que se decide.
- **Cómo.** Isla de paso fijo con **rueda de tiempos**: cada paquete se agenda para el paso en que su bandeja pasa por su rampa, O(1)
  por vuelta (de `experiencia-medicion/hub.mjs`). Una parada del lazo congela el contador de pasos: todo lo que está en tránsito se
  atrasa exactamente lo que dura la parada.
- **Evidencia.** Capacidad teórica = velocidad ÷ paso × 3.600 (oskon.com.tr, HECHO); el corte 1 la reproduce exacta con todos los
  factores en 1 (prueba L01). La noche de 24.000 paquetes tarda 160–196 ms en la maqueta con matemática propia (MEDIDO hoy).
- **Corte.** 1 (F0, F2 y F3 del sorter de bandejas); 3 (sorter de robots); 5 (cross belt de dos pisos, zapatas).

### A6. El plan de clasificación como decisión de primer orden (faltante del ingeniero + medición de hoy)

- **Qué hace.** Las decisiones que más mueven un hub y no cuestan capital son variables del modelo: qué ruta va a qué rampa (y cuántas
  rampas tiene una ruta pesada), quién vacía cada rampa y con qué regla, las ventanas por ola y la carga de jaulas por secuencia de
  reparto. Andén las compara con la misma suerte y, desde el corte 3, **busca el mejor plan con el simulador como juez**.
- **Qué existe.** No lo encontramos como objeto de modelo en ninguna visión ni en la documentación leída de los incumbentes (INFERENCIA,
  confianza media).
- **Evidencia (MEDIDO hoy, `medicion-sintesis/`).** En la maqueta, repartir las 15 personas de rampa por volumen en lugar de por rampas
  vecinas lleva la recirculación de mediana 0,17% · P90 7,2% · máximo 15,0% a mediana 0% · P90 0,01% · máximo 0,03%, y el P90 de espera
  de 4,2 a 3,6 min. Sin un peso de inversión.
- **Corte.** 1 (plan como objeto del esquema, asignación por volumen, contigua o explícita, botón «balancear el plan» y su escena A/B);
  3 (optimización del plan con cierre estadístico).

### A7. Personas con estado y reglas explícitas (rigor D9 + experiencia E12 + alertas)

- **Qué hace.** Cada persona tiene rol, pausas escalonadas, ausencia sorteada por noche, eficiencia (planta o temporario) y, si se activa,
  fatiga. **«¿Cubrís al que falta?» es un parámetro**: el retén de reemplazo cubre primero la inducción y después las rampas.
- **Alerta resuelta (juez ingeniero): doble conteo.** Productividad = base × aprendizaje × fatiga × condición cuenta la fatiga dos veces
  si la base se midió en planta. Por eso la fatiga viene **apagada por defecto**, marcada como supuesto, y el tamizado muestra cuánto
  mueve la decisión (ia-nativa midió que no la mueve en su modelo de juguete).
- **Evidencia.** Ingresantes 0,46 → 0,88 en ~9 semanas contra 0,80–0,95 de planta (Loske y Klumpp, IFAC 2020, HECHO); ausentismo con
  tope «aceptable» de 5% (ADRHA vía EIL, HECHO). En la maqueta, perder el corte pasa solo en noches con faltas sin reemplazo: 6 de 200
  con 4 puestos y 2 de 200 con 5 (MEDIDO hoy).
- **Corte.** 1 (retén, pausas, ausencias, temporarios con eficiencia fija); 3 (aprendizaje por semanas para el Hot Sale; turnos con MILP).

### A8. La escena viva: película, cien noches, enlace y QR (experiencia E1, E2, E5, E10, E11)

- **Qué hace.** Al abrir el enlace, la noche ya corre en el piso que el equipo soporta. Hay una línea de tiempo con marcas («02:14 la
  rampa R07 se llena»), velocidad de ×1 a ×3.600, rebobinado y la etiqueta obligatoria de qué noche se ve («noche 37 de 100: la mediana
  por hora de fin»). «Ver las cien noches» pinta sobre el plano la probabilidad de que cada rampa se llene y el abanico de la hora de fin.
- **Qué existe.** Los incumbentes animan una réplica y muestran la estadística en otra ventana (INFERENCIA); el fotorrealismo pide RTX.
- **Cómo.** La traza es la única fuente visual. **Tramos con fórmula** (bandeja = (j + k(t)) mod T; lugar en la fila = secuencia −
  salidas hasta t; cinta interpolada): el reproductor calcula 1.860 entidades en 0,1–0,2 ms por cuadro (MEDIDO, `experiencia-medicion/`).
  Pisos: 2,5D isométrica con sprites horneados como vista por defecto sin GPU (1,8 ms por cuadro; 6,8 ms con la CPU frenada 4×, MEDIDO),
  plano 2D como piso universal y 3D con three.js solo si el primer segundo mide ≤ 12 ms por cuadro (corte 2). Rebobinar es re-simular en
  escenas de menos de 1 s.
- **Enlace.** Plantilla inmutable + parche RFC 6902 (264 caracteres, entra en un QR versión 11) o modelo completo en el `#` (el ejemplo
  del corte 1 ocupa 6.006 caracteres con zlib y 6.022 con CompressionStream: MEDIDO hoy), más una receta de ~130 caracteres.
- **Corte.** 1 (película 2D y 2,5D, cien noches, línea de tiempo, enlace y QR); 2 (3D, video, zoom semántico); 3 (galería pública).

### A9. El porqué de cada paquete, con causas confirmadas (rigor D10 + experiencia E4, con la corrección de los jueces)

- **Qué hace.** Tocar un paquete abre su biografía: llegó en el camión 7, esperó 6 min en la acumulación, lo indujo la persona del
  puesto I2, dio 2 vueltas porque la rampa R07 estaba llena, la persona de esa rampa estaba en la pausa de las 23:50, entró a la jaula
  a las 00:31. Lo mismo para una rampa, una persona o un camión.
- **Alerta resuelta (ingeniero y arquitecto).** En redes con bloqueo, «quién tenía el recurso» no es causa contrafactual. Por eso:
  1. las esperas se clasifican en una **taxonomía tipada y cerrada** (fila, bloqueo, falta de bandeja, rampa llena, pausa, ausencia,
     falla, cierre de jaula, NO-READ, persona ocupada, andén ocupado, no transportable): no hay causas libres;
  2. **cada frase causal se confirma con un contrafactual dirigido a ese paquete**, con la misma suerte («sin la pausa de las 23:50,
     ¿el paquete (7, 233) llega al corte?»); si no lo confirma, la frase no se muestra como causa;
  3. la atribución tipo Shapley se limita a k ≤ 3 causas (2^k experimentos); con más, contrafactuales de un factor.
- **Evidencia.** Prueba E01 (una causa sembrada) y E02 (**dos causas que se compensan**: ninguna frase causal sin confirmar) en el corte 1.
- **Corte.** 1.

### A10. El estudio por decisión: preguntar lo que cambia la decisión (ia-nativa C1, C3, C4, C19 + injertos)

- **Qué hace.** El modelo tiene un objeto `decision` (variable tipada, restricción de probabilidad dicha en criollo, objetivo, zona de
  indiferencia en pesos). Andén ordena las preguntas por **cuánto puede costar equivocarse**: para cada supuesto con incertidumbre
  declarada (tres valores y sus pesos previos) calcula la decisión en cada valor y la **pérdida esperada de decidir hoy** en pesos por
  noche. Pregunta primero lo que más pierde y para cuando nada de lo que falta supera la zona de indiferencia. Si el usuario no sabe, le
  ofrece la referencia con fuente, un rango o un **plan de medición** (n ≈ (1,96 · cv / ε)²) con cronómetro en el teléfono.
- **Qué existe.** No encontramos una IA ni un formulario que pregunte por valor de la decisión (`frontera-ia.md` §1, INFERENCIA). La
  sensibilidad clásica ordena por cuánto se mueve el KPI, que es otro ranking: el atraso de troncales corre el fin del turno 45 min y no
  cambia la dotación; el ausentismo lo corre 34 min y suma dos puestos (MEDIDO, ia-nativa §2).
- **Correcciones de los jueces.** No es EVPPI completo: es sensibilidad de la decisión con previas de tres puntos, un supuesto por vez; las
  interacciones (ausentismo × temporarios) quedan para Morris y Sobol como vista secundaria (corte 4). El borrador analítico (F0) es
  alarma, nunca respuesta, y se compara contra una cuenta honesta (no contra una «planilla» de hombre de paja que multiplica por 0,95).
- **Corte.** 1 (formulario por decisión **sin IA**, generado desde las fichas de parámetro; tamizado como trabajo cancelable en segundo
  plano); 2 (entrevista en texto con IA que solo redacta y propone parches); 6 (voz y croquis, hipótesis).

### A11. Tus datos y la realidad (rigor D6 y D13, ia-nativa C5–C7 + faltantes del ingeniero)

- **Qué hace.** Separa el azar de la operación (se achica corriendo) de lo que no se sabe de los datos (se achica midiendo): dos semáforos.
  Calibra parámetros desde resultados observados con cómputo bayesiano aproximado y **dice cuándo los datos no alcanzan para separar dos
  parámetros**. Valida **conducido por traza**: reproduce días históricos alimentando las llegadas reales escaneadas, para validar el
  mecanismo por separado del modelado de entradas. Arranca **en caliente desde el estado de hoy** («son las 18 h, esto está pendiente en el
  WMS: ¿llegamos al corte de esta noche?»).
- **Qué existe.** El experimento de calibración de AnyLogic (no verificado); Simod descubre procesos desde registros, con tiempos débiles
  (HECHO). Sargent pide validar con datos históricos y pruebas de Turing (HECHO, WSC 2010).
- **Cómo.** Importación de CSV y XLSX con un lector XML en streaming dentro del Worker (DOMParser no existe en Workers: conocimiento
  previo, alerta del arquitecto); OCEL 2.0 y XES para registros de eventos; la foto del estado del motor (§4.4) da el arranque en caliente.
- **Corte.** 2 (importar, ajustar, validación conducida por traza, arranque en caliente); 3 (incertidumbre doble y calibración).

### A12. El modelo como software y la lógica sin programar (rigor D11, ia-nativa C3 y C13 + faltantes)

- **Qué hace.** El modelo es un documento tipado con unidades y procedencia. Un compilador lo valida antes de que exista un número:
  unidades, referencias, conectividad, **contradicciones** (capacidad contra demanda, turnos que no suman, cortes imposibles con las
  llegadas declaradas) y presupuesto de cómputo. Cada cambio es un parche; cada escenario, una rama; las invariantes se chequean sobre la
  traza. Desde el corte 4, **un editor visual de lógica** (diagramas de flujo y de estados) compila a un **lenguaje de procesos propio**
  (pedir, liberar, esperar, esperar hasta que, el primero de) que se ejecuta como máquina de estados serializable.
- **Qué existe.** Process Flow de FlexSim (HECHO, `incumbentes.md` §2.1) y el editor de AnyLogic retienen a los ingenieros que no
  programan. Git llegó a AnyLogic, Emulate3D y JaamSim; pruebas automáticas solo en Emulate3D, para PLC (HECHO).
- **Por qué un lenguaje propio y no generadores de JavaScript (alerta del arquitecto).** Los generadores no se pueden serializar ni
  clonar, y el diseño promete fotos del estado, rebobinado, arranque en caliente y división de trayectorias. El lenguaje de procesos
  resuelve las cinco cosas a la vez, deja compartir modelos sin ejecutar código ajeno y lo puede escribir la IA con validación estática.
  Los generadores quedan solo como implementación de referencia en las pruebas.
- **Corte.** 1 (esquema, compilador con chequeos estáticos, parches, invariantes del hub); 4 (lenguaje de procesos y editor visual).

### A13. Optimizar con garantía (rigor D14, ia-nativa C11 + faltante del ingeniero)

- **Qué hace.** Variables tipadas, búsqueda con presupuesto de réplicas, restricciones de probabilidad chequeadas estadísticamente, números
  comunes entre candidatos y **cierre KN obligatorio** con la zona de indiferencia en pesos. La dotación por turnos va como **programación
  lineal entera** (HiGHS) con reglas del CCT 130/75: el MILP propone, la simulación con riesgo valida y KN cierra. Las reglas operativas
  se pueden evolucionar con un LLM, siempre legibles y validadas en días apartados.
- **Qué existe.** OptQuest «no puede garantizar» el óptimo (Simio, HECHO); en FlexSim es un complemento pago (HECHO). FM Logistic mejoró
  10,4% su ruteo de picking con AlphaEvolve (HECHO autoinformado).
- **Cómputo honesto (alerta del arquitecto).** 2.000 réplicas de un día del hub de 24.000 paquetes no son 25–60 s: con ~0,2–0,5 s por
  noche son ~100–250 s con 4 Workers en escritorio (ESTIMACIÓN con la medición de hoy). El optimizador corre como trabajo de fondo,
  con multi-fidelidad (horizontes cortos primero) y aviso de duración.
- **Corte.** 3.

### A14. Presentar y enseñar (experiencia E8–E9, ia-nativa C17)

- **Qué hace.** El **modo directorio** arma una reunión de siete minutos en tres actos (así es una noche; dónde se traba y por qué; qué
  proponemos, cuánto cuesta y cuánto confiar) que funciona sin conexión y contesta en la sala. El **modo cátedra** pone la teoría sobre la
  escena (Little en vivo, Erlang C al lado de la fila, el experimento de cobertura de Law), da una semilla por alumno y corrige por receta,
  sin servidor; desde el corte 4 emite un **certificado verificable** que el alumno comparte.
- **Corte.** 1 (modo directorio v0: los tres actos con pantalla completa); 3 (con marca del consultor, plan Equipo); 4 (cátedra completa,
  certificado, curso en español).

### A15. Motor para agentes, con comprobante (rigor D16, ia-nativa C15)

- **Qué hace.** El mismo motor por MCP local (`npx`): validar, correr, comparar, decidir, explicar. Cada respuesta trae receta y semáforo,
  así lo que afirma la IA del usuario se puede comprobar. Costo de servidor cero; el usuario paga sus tokens.
- **Corte.** 2.

### 2.16 Lo que se posterga o se descarta (de 53 a 15)

| Capacidad de alguna visión | Qué pasa | Por qué |
|---|---|---|
| Director automático de cámara (E3) | Se posterga; en el corte 1 solo saltos a momentos | Vidriera; el modo directorio cubre el uso |
| Realidad aumentada (E18) | Regla de corte: 1 de cada 10 presentaciones desde teléfono o tableta | WebXR 0% completo en AR (HECHO) |
| Voz rioplatense y croquis por foto (C2) | Corte 6, como hipótesis | Sin forma de probarlo sin humanos; Sketch2DES probó 8 diagramas limpios |
| AndénBench con entrevistados sintéticos (C16) | Se rehace: casos escritos por humanos apartados antes de afinar, grabación y reproducción de conversaciones, prueba de McNemar | Circular y debajo del ruido (1 caso = 2,5 puntos con 40 casos) |
| Gemelo vivo con avisos programados (C14) | Corte 5, por el agente del usuario o Google Sheets | Necesita servidor o agente |
| Eventos raros por división (D12) | Corte 5 | Necesita estado clonable (lo da la foto del corte 1) y una función de importancia para hubs (HIPÓTESIS) |
| WebGPU masivo | Corte 6 con regla: ≥ 10 veces sobre Workers con huella idéntica | Sin implementación de eventos discretos en WebGPU encontrada |
| Sonido (E17) | Opcional, apagado por defecto, corte 3 | Accesibilidad, no decisión |

---

## 3. Modelo de simulación

### 3.1 Un calendario, siete paradigmas

| Paradigma | Para qué en logística | Cómo entra al único calendario | Corte |
|---|---|---|---|
| **Eventos discretos** (núcleo) | Paquetes, camiones, personas | Montículo por (tiempo en ms enteros, fase, prioridad, secuencia); fases urgente → normal → tardía, para que medir no cambie lo medido | 1 |
| **Islas de paso fijo** con rueda de tiempos | Sorters de bandejas, carruseles | Un evento de paso por tick solo mientras hay actividad; la rueda agenda cada paquete para el paso en que su bandeja llega a su rampa | 1 |
| **Agentes con estado** | Personas, choferes, vehículos | Estado en arreglos tipados; reglas explícitas (la rampa más llena primero, retén, pausas) | 1 |
| **Procesos** | Lógica a medida (un camión con paciencia, un supervisor que reasigna) | Lenguaje de procesos compilado a máquinas de estados serializables (no generadores) | 4 |
| **Cinemática cerrada** | Cintas con acumulación y separación, perfiles trapezoidales, AGV con reservas | Tiempos exactos de fin de tramo; posición solo cuando alguien mira | 1 (cintas), 3 (vehículos) |
| **Flujo continuo por tramos** | Granel, cupos, tanques, zonas lejanas | Tasas constantes entre eventos; el cruce de un umbral se calcula exacto y se agenda | 4 |
| **Optimizador adentro** | Ruteo de última milla, asignación de muelles, turnos | La simulación llama a un solver en WebAssembly (VRP en Rust; HiGHS) como un evento más; determinismo del solver a verificar antes | 3–5 |

Regla que viene de experiencia: **todo paradigma emite tramos**. Si no, no se puede dibujar ni explicar.

### 3.2 Familias de objetos y niveles de fidelidad

| Familia | Objetos | Niveles | Control contra fórmula o dato publicado | Corte |
|---|---|---|---|---|
| Flujo genérico | Fuente, cola, servidor con prioridad y preempción declarada, ruteo, red cerrada, fuente finita | F2 | Batería de colas (§7.1) | 1 (batería), 4 (aula) |
| Clasificación | Sorter de lazo de bandejas, inducción, lectura, rampas, jaulas, excepción | F0, F2, F3 | Velocidad ÷ paso (oskon); L01–L07 | 1 |
| Clasificación (otros) | Sorter de robots, cross belt de dos pisos, zapatas, narrow belt | F0, F3 | Correo Argentino Monte Grande 9.000/h, 13 puestos, 130 salidas (HECHO) | 3–5 |
| Transporte interno | Cinta con y sin acumulación, unión, desvío, autoelevador, AGV, AMR | F1–F4 | K01–K03 | 1 (cintas), 3 |
| Almacenamiento | Estantería, pasillo como recurso, transelevador, shuttle, puerto mercadería a la persona | F0–F4 | Ciclos FEM 9.851/9.860 (documentos pagos, comprar con OK); 20–40 ciclos dobles/h por pasillo [extracto] | 4–5 |
| Instalación | Playa, andenes, turnos de camiones | F1–F3 | 62 contra 142 min de descarga paletizada o a granel (Supervalu, HECHO) | 1 (playa y andenes), 3 |
| Personas | Inducción, rampa, descarga, excepción, retén, supervisor | F2–F3 | Loske y Klumpp; ausentismo EIL | 1 |
| Última milla | Vehículo, ruta, parada, fallidas y re-entregas | F1–F3 | 148 paradas, 8,1 h, 56% en servicio (Amazon 2018; solo estadísticas, CC BY-NC) | 5 |

### 3.3 El hub por dentro (lo que construye el corte 1)

1. **Camiones** con turno, desvío sorteado por camión, **factor de volumen del día** (error de pronóstico, lognormal de media 1) común a
   todos y **atraso común** de la noche (lluvia, paro, corte de ruta) con su probabilidad. Esperan en la playa si no hay andén.
2. **Descarga** a granel por personas del andén; cada paquete nace con sus atributos (ruta, clase de tamaño, tiempo base de inducción,
   manejo en la rampa) sorteados por dirección.
3. **Cintas** con separación mínima y **acumulación** con capacidad = largo ÷ paso; si se llena, **los andenes paran** (contrapresión).
4. **Inducción:** un puesto con persona toma el primero de la fila. Los no transportables van directo al puesto manual. El tiempo es el
   base del paquete × fatiga (si está activa) ÷ eficiencia de la persona. Después espera **una bandeja libre** (o dos seguidas si el
   paquete es grande).
5. **Lazo:** bandejas con paso fijo; la rueda de tiempos agenda el paso de llegada a la rampa destino (la menos llena de su ruta, o
   alternando). El lector decide en la primera pasada: NO-READ va a la rampa de excepción.
6. **Rampa llena:** el paquete da otra vuelta (tramo con causa «rampa llena» y la rampa como causante). Pasada la cantidad máxima de
   vueltas, va a excepción.
7. **Personas de rampa:** cada una cubre sus rampas (por volumen, contiguas o una lista) con una regla (la más llena, la que se llena
   antes, en orden), camina al cambiar de rampa, cierra la jaula cuando se llena, hace sus pausas. Una ausencia se cubre con el retén o
   se reparte entre las presentes.
8. **Excepción:** el puesto manual resuelve y reinduce (los no transportables van directo a su jaula).
9. **Micro-paradas del lazo:** tiempo entre paradas y duración sorteados; el contador de pasos se congela y todo se atrasa lo mismo.
10. **Indicadores:** paquetes, pendientes al corte, P(todo antes del corte), fin de la clasificación, recirculación, NO-READ, esperas
    P50 y P90, utilización, horas de rampa llena, paradas, horas-persona pagadas, costo por noche y por paquete (§3.10).

### 3.4 Física: cinemática cerrada, sin motor de física

Los motores de física agregan no determinismo entre equipos, costo por cuadro y fenómenos que no deciden nada (`tecnologia-web.md` §6.2).
Andén usa cuentas cerradas: aceleración y frenado, velocidad máxima por eje, acumulación, separación mínima, uniones con prioridad,
reservas de nodos y tramos para AGV. Fuera de alcance: paquetes que caen, robots de seis ejes, sensores simulados.

### 3.5 Personas

| Componente | Modelo | Valor por defecto (fuente) | Etiqueta |
|---|---|---|---|
| Tiempo de inducción | Base del paquete (lognormal) ÷ eficiencia | Media 2,4 s (≈ 1.500/h); 1.600/h sostenible como supuesto de diseño y techo ~2.250/h (oskon; Plus One) | ESTIMACIÓN |
| Temporario | Eficiencia relativa fija (corte 1); curva por semanas (corte 3) | 0,70 ≈ 0,61 / 0,875 (Loske y Klumpp 2020, período 5, por cuenta) | ESTIMACIÓN |
| Pausas | Programadas y escalonadas por persona | 15 min cada 2 h, escalón de 10 min (apuntes de estudio del trabajo: 5–15 min a media jornada) | HECHO (rango) / SUPUESTO (horario de noche) |
| Ausencia | Bernoulli por persona y noche, dirección (rol, persona, noche) | 5% (tope «aceptable» ADRHA vía EIL) | ESTIMACIÓN |
| Reemplazo | Retén de N personas; sin retén, se reparte | 0 por defecto (decisión del usuario) | Regla del modelo |
| Fatiga | 1 + máx · (1 − e^(−t/τ)) desde la última pausa | Apagada; 0,15 y τ = 90 min si se activa | SUPUESTO |
| Mayor ausencia los lunes | — | No se modela: sin fuente | HIPÓTESIS sin respaldo |

### 3.6 Demanda doblemente estocástica (faltante del ingeniero)

Un Poisson no homogéneo por paquete subestima la varianza de la noche, que es lo que decide si se llega al corte (INFERENCIA de oficio).
Andén modela tres niveles: **el día** (factor de volumen por error de pronóstico y golpe común de atraso), **el camión** (turno con
desvío; en el corte 2, mezcla de destinos correlacionada por origen) y **el paquete** (atributos al nacer). Para flujos continuos
(pedidos de e-commerce), dos curvas cada 15 minutos —pedidos y llegadas físicas— unidas por los cortes, con Poisson no homogéneo exacto
por adelgazamiento (corte 2). Con servicio de 1 h, el pico de carga se atrasa 59 min y se achata 3,3% (fórmula exacta de M_t/M/∞,
reproducida por simulación: MEDIDO, V28).

### 3.7 Perfil físico del paquete (faltante del ingeniero)

Cada paquete tiene una clase (chico, mediano, grande que ocupa dos bandejas, no transportable que va a flujo manual). La capacidad real
del sorter depende de esa mezcla y no solo de velocidad ÷ paso: con una fracción f de paquetes de dos bandejas, el máximo es
12.000 / (1 + f) por hora en un lazo de 2 m/s con paso de 0,6 m (prueba L03). **La mezcla no tiene fuente**: va como supuesto (un hub
argentino separa irregulares de hasta 1,2 m y 50 kg en otro sorter, HECHO de prensa del 17-12-2024). En el corte 3 se suman bolsas con
peor lectura y peso.

### 3.8 Micro-paradas y fallas (faltante del ingeniero)

Atascos, paradas de emergencia y rampas trabadas pesan en la práctica tanto como las fallas largas (INFERENCIA de oficio, sin fuente). En el
corte 1 entran como paradas del lazo con tiempo entre paradas y duración marcados como supuesto, y el tamizado muestra si mueven la
decisión. **Pendiente:** buscar datos de proveedor (BEUMER, Vanderlande, Fives publican casos) y, cuando haya un caso real, calibrarlas.
Las fallas de equipo declaran su semántica de preempción (reanudar, reiniciar o volver a sortear; reloj de calendario o de marcha:
`motor-validacion.md` §2.3).

### 3.9 Excepciones como flujos visibles

| Excepción | Rango de referencia (fuente en `realismo-logistico.md`) | En el corte 1 |
|---|---|---|
| NO-READ | Lectura de 98,5% a 99,9% | Sí, a excepción y reinducción |
| Recirculación | Se calcula; el 3% de oskon es solo un ejemplo | Sí, con máximo de vueltas |
| No transportable | Sin tasa con fuente | Sí, como clase del perfil |
| Mal clasificado | ≤ 0,05% (proveedor) | No (corte 3) |
| Entrega fallida y re-entrega | 2,8% a 33% según país; el segundo intento falla más del doble (Ninja Van 2016) | No (corte 5, multi-día) |

### 3.10 Costos

El costo se asigna por actividad con valores de `apps/anden/js/referencias.js`: hora pagada de la calculadora 3 (peón de Camioneros
40/89: $7.085 por hora pagada y $9.361 por hora productiva al 17-10-2026, MEDIDO corriendo la calculadora), alquiler de naves (USD 7,1
por m² y mes, Cushman & Wakefield, tercer trimestre de 2026), servicios y tipo de cambio de referencia. Se usa la hora **pagada** porque
pausas y faltas las modela el simulador: usar la productiva las contaría dos veces. El costo por paquete sale con intervalo y se actualiza
solo cuando se actualizan los índices.

### 3.11 Datos y procedencia

Cada parámetro viaja con valor, unidad, distribución, rango válido, fuente, URL, fecha, etiqueta, pregunta en criollo y, si se puede
tamizar, tres valores con pesos previos. Los valores estructurales (capacidades, fracciones, layout) llevan su procedencia por JSON
Pointer. Jerarquía visible con insignias: **dato tuyo** > **medido** > **referencia con fuente** > **estimación** > **supuesto**.

### 3.12 Nivel de realismo: valores de referencia

| Parámetro | Valor | Fuente (consultada el 17-10-2026) | Etiqueta | Dónde |
|---|---|---|---|---|
| Capacidad teórica de un sorter | velocidad ÷ paso × 3.600; 2 m/s ÷ 0,8 m = 9.000/h | oskon.com.tr | HECHO (fórmula) | F0, L01 |
| Ejemplo neto de un sorter | 8.640 → 7.338 buenos/h; «los factores no son independientes» | oskon.com.tr | ESTIMACIÓN (ejemplo del autor) | L08 informativa |
| Sorter con inducción manual | 40–70% del diseño | plusonerobotics.com | HECHO autoinformado | Control |
| Inducción manual | 1.600/h sostenible; ~2.250/h techo | oskon.com.tr; plusonerobotics.com | ESTIMACIÓN / HECHO autoinformado | Plantillas |
| Lectura | 98,5–99,9% | oskon.com.tr; cognex.com | ESTIMACIÓN / HECHO autoinformado | Plantillas |
| Exactitud de clasificación | ≥ 99,95% | gbisorters.com | HECHO autoinformado | Corte 3 |
| Sorters argentinos | 8.000–18.000/h; 26.000/h y 520.000/día en un hub (20% de uso normal, 50% en picos) | Prensa 2024–2026 (mercado.com.ar, iprofesional.com, itsitio.com) | HECHO (prensa) | Calibración de plantillas, sin nombres |
| Sorter de robots | 9.000/h, 240 robots, 13 puestos, 130 salidas | mercado.com.ar (16-12-2025) | HECHO (prensa) | Plantilla 4 |
| Curva de aprendizaje | 0,46 → 0,61 → 0,72 → 0,88 en ~9 semanas | Loske y Klumpp, IFAC 2020 | HECHO | Personas |
| Ausentismo | Tope «aceptable» 5%; 12,6% faltó al menos un día del mes | ADRHA vía EIL; IDESA (19-02-2026) | HECHO | Personas |
| Pausas | 5–15 min a media jornada; suplemento 2–5% | Apuntes de estudio del trabajo (EMU) | HECHO | Personas |
| Hora pico del Hot Sale 2026 | 13–14 h del primer día | Facturante vía BAE (12-05-2026) | HECHO | Plantilla 2 |
| Descarga paletizada contra granel | 62 contra 142 min por camión | supermarketnews.com (Supervalu, 1998) | HECHO | Plantilla 5 |
| Última milla | 148 paradas, 8,1 h de ruta, 56% en servicio, ~109 s por parada | Merchán y otros 2022 (Amazon 2018; CC BY-NC: solo estadísticas) | HECHO / INFERENCIA (cuentas) | Corte 5 |
| Entrega fallida | 2,8–33% según país; Argentina sin tasa publicada | `realismo-logistico.md` §5.2 | HECHO / hueco | Corte 5, como distribución editable |
| Picking | ≥ 70 líneas por persona-hora «mejor de su clase» | WERC 2025 (infografía de Yale) | HECHO (secundaria) | Plantilla 6 |
| Hora de un peón | $7.085 pagada; $9.361 productiva | Calculadora 3 (`apps/anden`) | MEDIDO (cálculo) | Costos |
| Alquiler logístico | USD 7,1 por m² y mes | Cushman & Wakefield, 3er trim. 2026 | HECHO | Costos |
| Capacidad de rampa, cierre de jaula, manejo de rampa, micro-paradas, mezcla de tamaños, desvío de camiones | — | **Sin fuente publicada** | SUPUESTO marcado | Plantillas: el tamizado dice si mueven la decisión |
| OEE «de clase mundial» de 85% | — | Sin fuente; no se usa | — | Nunca |

### 3.13 Varios días con re-entregas (alerta del ingeniero)

Con re-entregas que vuelven al hub, el estudio deja de ser terminante: es periódico con una condición inicial de pendientes. Método
(corte 5): (1) noches de arranque descartadas con MSER-5 sobre la serie diaria promediada entre réplicas, o arranque en caliente desde
una foto en régimen; (2) cada réplica es una secuencia de días después del arranque, y el intervalo se calcula sobre réplicas, nunca sobre
días de una misma réplica como si fueran independientes; (3) el semáforo exige ese análisis antes de mostrar un intervalo multi-día.
Hasta que esté, **el corte 1 simula una noche terminante** y lo dice.

---

## 4. Arquitectura técnica

### 4.1 Principios

1. **Una sola fuente:** el documento del modelo (esquema tipado, con unidades, procedencia y versión). Todo escribe ahí con parches.
2. **Motor isomorfo y determinista:** el mismo código en Workers, en Node (pruebas, MCP) y, si hace falta, en WebAssembly.
3. **Estado numérico:** calendario y bloques en arreglos tipados, sin closures: se fotografía, se restaura, se clona, se porta.
4. **La traza es el contrato** entre el motor y todo lo demás. La vista nunca le pide nada al motor por cuadro.
5. **Cero servidor para calcular:** el servidor solo sirve archivos, firma licencias y, si el usuario no trae su clave, hace de paso a la IA.
6. **Capas forzadas por pruebas, no por documentación:** una prueba de arquitectura lee los `import` y prohíbe dependencias cruzadas y
   tokens prohibidos en el motor; en ejecución, el Worker congela `Math.random` y la matemática nativa.
7. **Crecer sin rehacer:** esquema y traza versionados con migraciones, motores inmutables, corpus de compatibilidad.

### 4.2 Diagrama

```
HILO DE INTERFAZ (app/)                                   WORKERS (núcleos − 1, sin DOM)
  escena/ reproductor de tramos, vistas 2D y 2,5D  ◀──┐     nucleo/      calendario, azar Philox, matemática propia,
  biografía, cien noches, pantalla dividida           │                  rueda de tiempos, traza, huella, foto
  decisión: formulario, evaluación, semáforo          │     hub/         bloques del hub (F0, F2, F3), KPI, costos
  compartir: enlace, QR, anonimizar                   │     experimentos/ réplicas, IC, Wilson, P90, decisión
  comprobante, modo ingeniero, presentar              │     explicacion/  esperas tipadas, contrafactual dirigido
        │ planificador de trabajos (prioridad, cancelación, Workers precalentados)
        └──── MensajeAlTrabajador ─────────────────────┘── MensajeDelTrabajador (resultados y trazas transferidas)
TRANSVERSALES: modelo/ (esquema, compilador, chequeos, parches, enlace) · contratos/ (tipos congelados) · i18n (es, en)
FUERA DEL NAVEGADOR: verificacion/ (batería en Node + Chromium + Firefox + WebKit) · mcp/ (corte 2: el mismo motor en Node)
```

### 4.3 Módulos y límites (lo que cada uno «no puede» lo hace cumplir una prueba)

| Módulo | Hace | Corre en | No puede |
|---|---|---|---|
| `contratos/` | Tipos y funciones mínimas congeladas | Todos | Cambiar sin el paquete de integración |
| `nucleo/` | Calendario, azar, matemática, rueda, anillo, traza, huella, foto | Worker y Node | DOM, `Date`, `performance`, `Math.random`, `log`, `exp`, `pow`, `sin`, `cos` nativos |
| `modelo/` | Validar, normalizar, chequeos estáticos, F0, parches, JSON canónico, huella, enlace | Interfaz y Worker | Usar azar; aceptar entrada sin límites |
| `hub/` | Bloques del hub, plantillas, KPI, costos, geometría | Worker y Node | DOM; sortear por orden de evento o por índice de servidor |
| `verificacion/` | Bloques de flujo genéricos, fórmulas analíticas, batería, doradas | Node y navegadores | Entrar al paquete de la app |
| `experimentos/` | Réplicas, estadística, decisión, semáforo, comprobante, planificador | Interfaz y Worker | Calcular un intervalo con una sola corrida; agregar por orden de llegada |
| `explicacion/` | Esperas, biografía, contrafactual, verificador de frases, tamizado, formulario | Worker e interfaz | Afirmar una causa fuera de la taxonomía o sin contrafactual |
| `escena/` | Reproductor, vistas, riesgo, momentos | Interfaz (y OffscreenCanvas) | Mover algo que no esté en la traza |
| `app/` | Pantallas, i18n, PWA, compartir | Interfaz | Escribir el modelo fuera de los parches; texto fijo fuera de i18n; `innerHTML` con datos del modelo |

### 4.4 El motor por dentro

- **Tiempo:** milisegundos enteros (exactos hasta 2⁵³). `agendar` rechaza tiempos no enteros: atrapa errores de redondeo.
- **Calendario:** montículo binario en columnas (t, fase, prioridad, secuencia, bloque, tipo, argumento). Sin cancelación: los bloques
  descartan eventos viejos comparando la secuencia que guardaron con la del evento (patrón documentado en `corte-1.md`).
- **Guardianes:** tope de eventos, tope de eventos seguidos en el mismo instante (lazo de tiempo cero), horizonte.
- **Foto y restauración:** el estado completo (calendario + bloques) se copia como arreglos tipados; con azar por dirección no hay estado
  de generadores que guardar. Habilita rebobinar sin re-simular en modelos grandes, el arranque en caliente (corte 2) y la división de
  trayectorias (corte 5).
- **Huella:** dos carriles de 32 bits sobre (t, bloque, tipo, argumento) de cada evento procesado; 16 caracteres hex.
- **Bloques compilados:** el camino rápido. Los procesos a medida llegan en el corte 4 como máquinas de estados del lenguaje de procesos.
- **Rendimiento, con los números corregidos (alerta del arquitecto).** La estimación de rigor (6–10 M de eventos por segundo × 20–30
  eventos por paquete = 0,05–0,12 s por noche de 24.000 paquetes) estaba inflada. Lo medido: la maqueta con mecanismo hace ~188.000
  operaciones (eventos + pasos del sorter) por noche, ~7,7 por paquete, y tarda **160–196 ms con matemática propia** (MEDIDO hoy). Para el
  motor de producción, con traza causal y estado tipado, se presupuesta **≤ 400 ms por noche de 24.000 paquetes en escritorio**
  (ESTIMACIÓN: lo medido × 2,5 de margen). En un teléfono de gama media, entre 3 y 10 veces más, sin medir: 0,5–4 s.
- **Consecuencias para la experiencia:** el deslizador en vivo de 150 ms sobre la noche entera no se promete; la vista previa re-simula la
  noche completa (≤ 600 ms en escritorio) y se marca «provisoria (1 noche)» hasta que llegan las réplicas pareadas. El «desde ahora»
  (bifurcar en el cabezal) usa la foto y llega en el corte 2.
- **Regla de corte técnica:** si un teléfono de gama media no simula la noche del hub de 24.000 paquetes en menos de 1 s, el núcleo se
  porta a Rust/WebAssembly detrás de los mismos contratos (WebAssembly rindió 1,35–1,46 veces el JS: MEDIDO, `tecnologia-web.md`).

### 4.5 Azar por dirección y matemática propia (MEDIDO hoy, `medicion-sintesis/`)

- **Philox4x32-10** en JS puro: 3 de 3 vectores de Random123 exactos; 12–20 millones de bloques por segundo (25–41 M de uniformes de 53
  bits). Una noche de 24.000 paquetes pide ~200.000 uniformes: 5–8 ms. **No hace falta WebAssembly para el azar.**
- **Clave** = (semilla, FNV-1a de 32 bits de «ruta del bloque/propósito»); **contador** = (réplica, a, b, (intento << 8) | sub-bloque).
- **Consumo fijo por distribución** (normal y lognormal con Box-Muller sin caché: 2 uniformes; exponencial, uniforme, triangular, Weibull,
  Bernoulli, discreta y empírica: 1; Erlang k: k).
- **Matemática:** `log` (fdlibm `e_log.c`, ya medido en `tecnologia-web.md`), `exp` (`e_exp.c`) y `cos`/`sin` (`k_cos.c`, `k_sin.c` con
  reducción de Cody-Waite) solo con + − × ÷: 0 diferencias con V8 en 2 millones de valores por función. `sqrt` es exacta por IEEE 754.
  Costo en la maqueta del hub: 0–25%.

### 4.6 Traza

- **Columnas por tramo:** entidad, tipo, recurso, auxiliar, t0, t1, **causa** (taxonomía tipada) y **causante** (referencia a entidad).
  Más momentos puntuales (rampa llena, pausa, parada, atraso) y un resumen por paquete con su **clave estable** (camión, índice), que es
  lo que permite seguir al mismo paquete entre escenarios para el contrafactual.
- **Tramos con fórmula:** bandeja (paso del lazo con sus tramos de marcha y parada), fila FIFO por secuencia, cinta interpolada.
- **Memoria (alerta del arquitecto):** ~34 bytes por tramo y ~9 tramos por paquete ≈ 7–8 MB por noche de 24.000 paquetes; 21 MB crudos en
  la maqueta de 90.000 (MEDIDO). Reglas: las cien noches **nunca** retienen trazas (se agregan en el Worker como `ResultadoReplica`); solo
  la noche mostrada y su par de la pantalla dividida tienen traza completa; para hubs grandes, traza por ventanas y nivel de detalle en la
  fuente (corte 2). Prueba de memoria con tope de clase teléfono (≤ 150 MB el visor).

### 4.7 Render

- **2,5D isométrica** (Canvas, sprites horneados, orden por profundidad): vista por defecto. **2D** (Canvas): piso universal y editor.
  **3D** (three.js 0.186.1, MIT, carga a demanda; `WebGPURenderer` con respaldo WebGL 2): solo si el primer segundo mide ≤ 12 ms por cuadro
  (corte 2). Sin GPU, el 3D por software tarda 28 ms con 1.000 cajas (MEDIDO, `tecnologia-web.md`).
- **Un solo origen del arte:** los sprites del 2,5D se hornean desde los mismos modelos paramétricos del 3D (sugerencia del arquitecto);
  el aspecto se deriva del esquema (largo, paso, capacidad), sin modelador.
- **Vistas probables en Node:** cada vista compone primero una lista de primitivas (función pura, se prueba en Node) y después la pinta.
- **Calidad visual sin el fundador:** métricas perceptuales automáticas (contraste WCAG ≥ 4,5:1, etiquetas sin superposición, el KPI nunca
  tapado, estados distinguibles en escala de grises) más capturas en 360 px y 1280 px, claro y oscuro. La revisión de Claude sobre su
  propio trabajo no alcanza como evidencia (alerta del arquitecto): suma un agente revisor independiente y, desde el corte 2, usuarios beta
  reales (con OK).

### 4.8 Workers y planificador de trabajos (faltante del arquitecto)

Un planificador con **prioridades** (vista previa > confirmación > cien noches > decisión > tamizado), **cancelación inmediata** al mover un
deslizador (si un Worker está en medio de una réplica cancelada, se termina y se reemplaza por uno precalentado), agregación por índice de
réplica y presupuestos por trabajo. Las réplicas no necesitan memoria compartida: mensajes con arreglos transferidos (1 millón de eventos
en 8 ms contra 5,1 s como objetos, MEDIDO). COOP/COEP solo en la ruta que lo necesite, nunca en la escena incrustable.

### 4.9 Toda entrada que llega por enlace es no confiable (faltante del arquitecto)

Tope de caracteres (16.000) y de bytes descomprimidos (256 KB) contra bombas de deflate; tope de profundidad y nodos del JSON; rechazo de
claves `__proto__`, `constructor` y `prototype`; números no finitos rechazados; textos con tope de largo y sin caracteres de control;
presupuesto de paquetes y eventos estimado por el compilador **antes** de correr; guardián que termina el Worker si se pasa del tiempo;
detección de lazos de tiempo cero; CSP estricta y textos siempre como `textContent`. El decodificador y el compilador se prueban con
entradas hostiles en cada cambio (y con fuzzing desde el corte 2).

### 4.10 Persistencia y compatibilidad

- IndexedDB con **un documento por versión** más la cola de parches (62 ms para 100.000 objetos contra 23 s con una fila por objeto,
  MEDIDO); OPFS para trazas grandes; archivo `.anden` (zip abierto).
- Safari borra lo escrito por scripts a los 7 días sin uso (HECHO, WebKit): `persist()`, instalar la app, recordar exportar, y el enlace
  como primer lugar de vida del modelo.
- **Compatibilidad hacia atrás (faltante del arquitecto):** corpus de regresión con cada plantilla, enlace y receta publicada desde la v1;
  migraciones del esquema probadas contra ese corpus; motores inmutables guardados por el service worker. Un QR impreso en 2027 abre en 2030.

### 4.11 IA (desde el corte 2)

- **Capa de herramientas deterministas** con la misma API para la interfaz, el LLM, MCP y las pruebas: validar, correr, comparar, decidir,
  explicar, contrafactual, costo, plan de medición. Cada herramienta se prueba en Node sin LLM.
- **El LLM nunca produce números ni toca el motor:** traduce, pregunta, propone parches (se ven como fantasma) y redacta. El **verificador
  de afirmaciones** controla valor, redondeo, signo y que «la diferencia es real» solo aparezca si el IC excluye el cero.
- **Privacidad por lista blanca:** al LLM no viajan filas de planillas ni costos crudos.
- **Proxy de IA sin relé abierto (alerta del arquitecto):** ficha por dispositivo, desafío anti-bot, límites por IP y **tope duro de gasto**;
  requiere la aprobación del fundador (regla 8). Clave propia del usuario solo como opción avanzada y con aviso.
- **Integración continua sin gastar:** las conversaciones se graban y se reproducen; las corridas reales del banco son periódicas, con
  aprobación, k repeticiones por caso y prueba pareada de McNemar; una porción de casos escrita por humanos se aparta antes de afinar.
- **Costo:** USD 0,01–0,25 por estudio completo (ESTIMACIÓN con precios en caché del 06-10-2026; re-verificar antes de fijar créditos).

### 4.12 Extensibilidad

- **Ficha de bloque:** esquema con unidades, implementaciones por nivel de fidelidad, pruebas con valor esperado, preguntas en criollo,
  referencias con fuente, aspecto paramétrico y plantillas de explicación. El formulario sin IA sale de esa ficha.
- **Nivel A (declarativo):** expresiones con unidades y reglas en el lenguaje de procesos; seguro para modelos compartidos.
- **Nivel B (TypeScript):** solo en modo ingeniero local, nunca en la galería.

### 4.13 Build y TypeScript (decisión)

- **TypeScript «borrable»** (`erasableSyntaxOnly`: sin `enum`, sin `namespace` con código, sin propiedades en parámetros) con imports con
  extensión `.ts`. **Node 22.22 corre las pruebas `.ts` directo con `node --test`, sin compilar (MEDIDO hoy).** `tsc` 6.0.x solo revisa
  tipos.
- **Navegador:** esbuild 0.28.2 (MIT) empaqueta la app y el Worker; queda fijado en `package-lock.json`. Vite 8 no entra en el corte 1: no
  hace falta servidor de desarrollo ni plugin de PWA todavía, y como el código es TS borrable se cambia de herramienta sin reescribir.
  Respaldo si no se puede instalar: `module.stripTypeScriptTypes` de Node (existe en 22.22, experimental: MEDIDO hoy) más reescribir las
  extensiones de los imports.
- **Dependencias en tiempo de ejecución, todas MIT, versión fija y vendorizadas o por jsDelivr:** ninguna en el núcleo;
  qrcode-generator 2.0.4 (corte 1); three 0.186.1 y webm-muxer 5.1.4 (corte 2). **mediabunny 1.61.6 queda afuera:** es MPL-2.0, copyleft
  por archivo, y la regla del holding pide licencias permisivas (HECHO, npm, 17-10-2026).

### 4.14 Qué corre dónde y cuánto cuesta

| Pieza | Dónde | Costo para Andén |
|---|---|---|
| Motor, experimentos, vistas, explicador | Dispositivo del usuario | 0 |
| Sitio, plantillas, motores versionados | Cloudflare Pages (GitHub Pages prohíbe usos comerciales, HECHO) | 0 en el plan gratis (500 compilaciones por mes, 20.000 archivos) |
| Licencia | Función en Cloudflare Workers que firma un token Ed25519 verificable sin conexión | 0 (100.000 pedidos por día gratis, HECHO) |
| Sonda colectiva de determinismo | Contador sin cookies | ~0 |
| IA | Clave del usuario, su agente por MCP o créditos del Pro | USD 0,01–0,25 por estudio (ESTIMACIÓN) |
| Galería pública | Almacenamiento de objetos | **A verificar** (precio no consultado) |
| Comentarios y colaboración (corte 4) | Capa mínima de sincronización (por ejemplo, objetos durables de Cloudflare) | **HIPÓTESIS**: medir contra la regla de cero servidor antes de construir |

Meta: menos de USD 0,01 de servidor por usuario mensual (`mercado.md`).

---

## 5. Experiencia

### 5.1 Principios

1. **Lo que se ve es lo que se calculó.** Ninguna animación decorativa mueve una entidad.
2. **Primero la película, después el formulario.**
3. **Cada píxel es una puerta**: todo lo que se dibuja se toca y lleva a su historia, sus números y su causa.
4. **Ningún número sin su incertidumbre a la vista**, ninguna noche sin su etiqueta.
5. **Anda en el peor equipo de la sala**: 2,5D sin GPU, 2D como piso.

### 5.2 Capas de profundidad

Mirar (la película) → tocar (la biografía) → números (con intervalo, semáforo y comprobante) → el modelo (supuestos con insignia, JSON,
traza). El experto llega a todo con un interruptor de modo ingeniero; el lector nunca ve más de lo que necesita.

### 5.3 Minuto 0: alguien abre un enlace en el teléfono

1. Llega por WhatsApp: «Mirá cómo se traba la rampa R07 a las 2», con el enlace.
2. En menos de 1,5 s (meta, a medir en teléfonos reales) la noche corre en 2,5D. Arriba, una línea: «Costo por paquete $X (± Y) · Perder el
   corte: 1 noche de cada N · Confianza: verde · Comprobante». Abajo, la línea de tiempo con marcas y la etiqueta de la noche.
3. Toca la rampa roja: su biografía y la causa confirmada.
4. Toca «¿Y si…?»: mueve «personas de rampa 6 → 7» o «balancear el plan». La película se rehace, provisoria, y en segundos aparece en
   pantalla dividida con la misma suerte y su intervalo.
5. Toca «Ver las 100 noches»: cada rampa pintada por su probabilidad de llenarse.
6. Toca «Hacer mi copia»: entra al formulario por decisión con la plantilla.

### 5.4 El autor: tres puertas en la misma pantalla

1. **Plantillas como películas**, con nombre de problema: «¿Cuánta gente para el Hot Sale?», «¿Llego al corte?», «¿Me alcanzan las rampas?».
2. **Formulario por decisión** (corte 1, sin IA): «¿Qué tenés que decidir?» y después solo las preguntas que cambian la respuesta, en orden.
   La escena se arma a la vista mientras contesta. Desde el corte 2, lo mismo conversando con la IA.
3. **Desde las calculadoras v0**: «Ver esto en movimiento» lleva los números de la calculadora 4 a la plantilla de hub.

### 5.5 Decidir

Escenarios como ramas, pantalla dividida con la misma suerte, cien noches, evaluación de la decisión (por cada valor: probabilidad de cumplir
con su intervalo, estado, costo), recomendación con semáforo, biografías y contrafactuales, comprobante. Desde el corte 2, informe PDF y video.

### 5.6 Presentar: modo directorio

| Minuto | Pantalla | El presentador |
|---|---|---|
| 0–1 | «Así es una noche»: plano general a ×600 con marcador y línea de tiempo | Nada: la película habla |
| 1–3 | «Dónde se traba y por qué»: salto al momento, biografía de la rampa, causa confirmada | Toca la rampa |
| 3–5 | «Qué proponemos»: pantalla dividida, costo por paquete con intervalo, probabilidad de llegar al corte | Mueve el deslizador |
| 5–7 | «Cuánto confiar»: cien noches, la peor noche, comprobante, los supuestos que más pesan y qué medir | Contesta con las perillas |

Funciona sin red (PWA) y con la pantalla encendida (Wake Lock, 96,3% del uso en AR, HECHO). La vista del presentador por BroadcastChannel
llega en el corte 3.

### 5.7 Enseñar: modo cátedra (corte 4)

Teoría sobre la escena, «predecí antes de correr», semilla por alumno derivada de su libreta y del código de la clase, entrega como receta
de ~130 caracteres, corrección automática en el navegador del docente, certificado verificable. Encaja con Andén Aula (P2) y con la
promoción cruzada de los juegos de P6.

### 5.8 El experto: modo ingeniero

JSON del modelo con validación en vivo, diagnósticos del compilador, traza exportable (CSV y columnas), resultados por réplica, gráfico de
Welch, tabla de la decisión con réplicas usadas; desde el corte 4, lenguaje de procesos y editor visual; desde el corte 2, MCP.

### 5.9 Textos honestos: tres sellos que no se mezclan (alerta de los tres jueces)

| Sello | Cuándo aparece | Texto |
|---|---|---|
| **Motor verificado** | Siempre, con la versión | «Motor 1.0.0: pasó 85 de 85 pruebas contra teoría de colas y casos publicados (ver)» |
| **Reproducida en este dispositivo** | Si la huella recalculada coincide con la de la receta | «Los números que ves los calculó este dispositivo y coinciden con la receta del autor» |
| **Validación** | Siempre | «Sin validar contra días reales» o, cuando exista, «Validada con 30 días reales: 27 dentro del intervalo del 90%» |

Además: cada clip y cada vista previa lleva la etiqueta de noche y la franja de supuestos («6 valores de referencia, no tuyos»); una escena
con «modelo con errores» no se publica en la galería.

### 5.10 Diseño visual, accesibilidad e idiomas

- El color fuerte se reserva para estados (rampa llena, dando vuelta, excepción); la forma también distingue (escala de grises).
- 360 px primero; claro y oscuro con la misma paleta de estados; movimiento reducido si el sistema lo pide; teclado completo; una región
  `aria-live` narra los momentos.
- Español rioplatense sin jerga en el modo lector («da otra vuelta», no «recircula»); el término técnico en modo ingeniero.
- **Inglés antes de 2028 en lo que construye autoridad** (página Verificado, galería, plantillas): casi gratis y sin techo (faltante del
  estratega). Portugués en el corte 6.

---

## 6. Plantillas

Cada plantilla trae su película de presentación, su momento, sus fuentes, su control F0 y su página de validación. Nombres genéricos; las
empresas solo como fuente citada (alerta del ingeniero sobre «tipo Andreani Pacheco»).

| # | Plantilla | Qué decide | Calibración pública | Control de cordura | Corte |
|---|---|---|---|---|---|
| 1 | **Hub de clasificación con sorter de bandejas, turno noche** (24.000 paquetes) | Puestos, personas de rampa, retén, plan de clasificación | Inducción 1.600/h; capacidad por paso; sorters argentinos de 8.000–18.000/h | F0; calculadora 4 | 1 |
| 2 | **Hub chico** (8.000 paquetes; el ejemplo de `corte-1.md`) | Ídem, en chico | Ídem | F0 | 1 |
| 3 | **Nodo de última milla para envíos en el día** | ¿Llego al corte? Olas, rutas | Cumplimiento en el día > 90%; cortes de 13 a 17 h [extracto] | Little por día | 2 |
| 4 | **Hot Sale con temporarios que aprenden** | Cuántos temporarios y desde cuándo | Loske y Klumpp; hora pico 13–14 h; ×2,5 en picos (prensa) | P01 | 3, antes del Hot Sale 2027 |
| 5 | **Hub con sorter de robots** | Robots, puestos, salidas | 9.000/h, 240 robots, 13 puestos, 130 salidas | ~690/h por puesto (INFERENCIA) | 3 |
| 6 | **Cross-dock con playa y turnos** | Andenes, citas, granel o paletizado | 62 contra 142 min de descarga | Erlang C por andén | 3 |
| 7 | **Depósito pyme de e-commerce** | Picking por zona, ola o lote; reposición | ≥ 70 líneas por persona-hora; flow rack −4,6% picking y +38,65% reposición | Momentos del tiempo de picking (Engels y otros) | 4 |
| 8 | **Aula: colas y Little** | Enseñar | La batería misma | V01–V30 | 4 |
| 9 | **Hub nuevo con caso de capex** | Cuántas rampas, inducciones, segundo nivel; VAN a 5–10 años con incertidumbre de crecimiento | Costos de `referencias.js` | F0 | 5 |
| 10 | **Comparador neutral de automatización** | Manual, AMR, AutoStore o shuttle con la misma demanda | 65 → 98 u/h (GEODIS); ~300 picks/h por puerto; ~31 ciclos dobles/h por shuttle | Ciclos por cinemática | 5 |
| 11 | **Andén Ciudad: recolección** | Camiones y recorridos | Bitácora del 28-09-2026 | — | 6 |

---

## 7. Rigor

### 7.1 Verificación del motor

| Familia | Qué prueba | En el corte 1 | Meta |
|---|---|---|---|
| V · colas | M/M/1 a M/M/50, M/D/1, M/G/1, D/M/1, M/M/c/K, Erlang B e insensibilidad, prioridades con y sin preempción, Jackson, MVA, Penny Fab, M_t/M/∞, fuente finita | 50 exigibles + 4 informativas | ~60 |
| C · casos publicados | Oficina y fábrica de Law (WSC 2023) | 3 exigibles + 1 informativa | ~10 (C05 de Law 2015 cuando estén los datos del libro) |
| S · estadística | Cobertura, MSER-5 sobre el promedio, Whitt, Wilson, decisión en duda | 6 exigibles + 2 que deben fallar | ~20 |
| R · reproducibilidad | Huella, CRN, réplicas, R04 entre motores, R05 direcciones semánticas, R06 foto, R07 agregación | 8 | ~12 |
| K · cinemática | Trapezoidal, cinta, acumulación | 7 | ~15 |
| L · mecanismo del hub | Capacidad del lazo, NO-READ, dos bandejas, vueltas máximas, rueda, paradas, consistencia F2/F3 | 7 | ~12 |
| D, M, P · degeneradas, metamórficas, personas | ρ > 1, cambio de escala, conservación, ausentismo | 4 | ~15 |
| E · explicador | Causa sembrada; dos causas que se compensan | 2 | ~6 |
| X · eventos raros | División de trayectorias (X01 = 9,5368×10⁻⁷, X02 = 3,3235×10⁻⁵) | — | Corte 5 |
| VR · reducción de varianza | Variables de control ≥ 1,5 veces en M/M/5 al 90% | — | Corte 2 |

**Dos compuertas** (faltante del arquitecto): (1) **doradas**, exactas por huella, bloquean cada cambio; (2) **estadísticas**, con n grande,
corren aparte (todas las noches desde el corte 2), con la política de re-corrida de A1. Cada cambio intencional de huella pide re-certificar.

### 7.2 Verificación del modelo del usuario

Antes de mostrar un número: balance de flujo, Little por bloque, utilización < 1 en el F0, contradicciones (corte imposible, turnos que no
suman, rampas sin persona, rutas sin rampa), presupuesto de cómputo, repetibilidad e invariantes sobre la traza (ningún paquete sale antes
de entrar, ninguna rampa supera su capacidad, nadie trabaja en pausa, toda bandeja con un solo paquete). Si algo falla, **se muestra el
error sobre el plano, no el número**.

### 7.3 Validación contra la realidad

1. **Verificado** (el motor), **reproducido** (la escena) y **validado** (el modelo) son tres palabras distintas (§5.9).
2. **Validación conducida por traza** (corte 2): días históricos con las llegadas reales escaneadas; valida el mecanismo por separado de
   las entradas.
3. **Días apartados** antes de calibrar: ~90% tiene que caer dentro del intervalo predictivo del 90%.
4. **Prueba de Turing** con los datos del usuario (Sargent, HECHO).
5. **Al menos un caso público de validación contra una operación real**, con permiso: una cátedra o un donante, **nunca la empresa del
   fundador** (faltante del ingeniero). Sin eso, «verificado» nunca pasa a «validado».
6. **Reproducción lado a lado de modelos publicados** de los incumbentes (tutoriales oficiales, casos de la WSC), **sujeta a revisar las
   licencias** de FlexSim Express, AnyLogic PLE y Simio y a la consulta legal: muchas licencias prohíben publicar comparaciones sin permiso
   (alerta del ingeniero).

### 7.4 Análisis de salida por defecto

| Decisión | Por defecto | Fundamento |
|---|---|---|
| Tipo de estudio | Terminante si hay cierre o corte (el hub del corte 1); estacionario si no | Law 2023 (HECHO) |
| Réplicas | Independientes, mínimo 20 para decidir, hasta la precisión pedida o hasta que la decisión salga de la duda | Cobertura 94,4% (MEDIDO) |
| Calentamiento | MSER-5 sobre el promedio de réplicas + gráfico de Welch; alerta si el corte pasa la mitad de la corrida | MEDIDO |
| Qué se muestra | Media, P90 y la probabilidad del evento, siempre con intervalo | Law 2023 |
| Costo de la precisión | Avisado antes de correr (ley de Whitt verificada: 1.804 contra 1.800) | MEDIDO |
| Aproximaciones de manual | Como alarma al lado del resultado (Allen-Cunneen se pasó 5–9%) | MEDIDO |

### 7.5 La decisión

- **Estados:** «cumple» (IC de Wilson inferior ≥ meta), «no cumple» (superior < meta), «en duda» (lo cruza).
- **Réplicas secuenciales:** 20 por configuración y después, de a tandas, solo a las que están en duda, hasta que salen de la duda o se
  llega al máximo (asignación tipo OCBA antes del cierre KN del corte 3).
- **Recomendación:** el menor valor de la variable que cumple cuando todos los menores no cumplen; si alguno sigue en duda, no hay
  recomendación y el semáforo queda amarillo diciendo cuántas réplicas faltarían.

### 7.6 Comparación y selección

Dos escenarios: diferencia pareada con IC de t; si cruza el cero, se dice y se estiman las réplicas que harían falta. De 3 a 20: selección
de subconjunto. Para elegir el mejor: KN con la zona de indiferencia en pesos (corte 3).

### 7.7 Sensibilidad de la decisión

1. **Tamizado por decisión** (corte 1): un supuesto por vez en sus tres valores, con números comunes; pérdida esperada en pesos por noche.
2. **Interacciones** (corte 4): Morris para filtrar y Sobol para repartir la varianza, validados contra SALib; como vista secundaria.
3. **Plan de medición:** n = ⌈(1,96 · cv / ε)²⌉; con cv = 0,6 y ε = 15%, 62 observaciones (cuenta).

### 7.8 Optimización (corte 3)

Variables tipadas → búsqueda global con presupuesto y multi-fidelidad → restricciones de probabilidad → CRN entre candidatos → **cierre KN
obligatorio** → prueba fuera de muestra con otra curva de demanda. Turnos con MILP (HiGHS) y validación por simulación; plan de
clasificación con búsqueda local sobre asignaciones; robustez entre futuros (día normal, Hot Sale, CyberMonday). Contra el sobreajuste:
semillas de entrenamiento y de prueba separadas. Vara pública: SimOpt (MIT).

### 7.9 Reducción de varianza y eventos raros

CRN semánticos desde el corte 1; variables de control (÷1,6–2,5, MEDIDO) en el corte 2, con su prueba de que las ganancias se combinan;
división de trayectorias en el corte 5 sobre la foto del estado (515 veces más eficiente en M/M/1, MEDIDO; en un hub, la función de
importancia es HIPÓTESIS).

### 7.10 El contrato de honestidad (lo que Andén se niega a mostrar, probado automáticamente)

1. Un intervalo calculado con una sola corrida.
2. Un resultado sin semáforo y sin comprobante.
3. «A es mejor que B» sin comparación pareada, o con un intervalo que cruza el cero.
4. Una recomendación con la decisión en duda, o del optimizador sin cierre KN.
5. Números cuando falla la conservación, Little o una invariante: se muestra el error.
6. Un parámetro sin procedencia visible.
7. Una frase con una cifra sin fuente, o una causa sin contrafactual que la confirme.
8. Un promedio solo: siempre media, P90 y la probabilidad que importa.
9. Una noche sin su etiqueta («la mediana», «la peor de 100»).
10. Un resultado fuera del dominio de validez sin avisarlo.
11. «Verificado» o «validado» donde solo hay reproducido.
12. Una afirmación de novedad sin verificar en la fuente primaria (§1.3), o un nombre de empresa en una plantilla.

---

## 8. Roadmap por cortes verticales

**Capacidad.** El cuello real es Claude, no las horas del fundador (alerta del estratega). El plan es Max 5x (confirmado el 17-10-2026), y
noviembre–diciembre de 2026 juntan el lanzamiento de Senda, Hub Nocturno en diciembre y la validación de las calculadoras. Por eso: el corte
1 se construye ahora en una sesión (lo pidió el fundador) y **no se publica**; los cortes 2 en adelante arrancan después de esos
lanzamientos y ceden prioridad a Senda si `/usage` muestra cortes. El corte de P2 de septiembre de 2027 (500 usuarios por mes o una
cátedra) no cambia.

**Método de estimación (ESTIMACIÓN gruesa).** Por analogía con lo hecho el 17-10-2026: las calculadoras v0 y su revisión, el motor de
referencia con su batería y la maqueta medida de experiencia salieron en sesiones únicas. Cada corte siguiente se estima en sesiones de
Claude con un rango de 2 a 3 veces por integración (el juez ingeniero y el arquitecto advirtieron que los cortes 1 de las visiones estaban
subestimados por 2 a 3 veces; por eso el corte 1 de acá es más chico que el de cualquiera de ellas).

| Corte | Cuándo | Qué entrega | Criterio de aceptación (medible) | Qué pide al fundador |
|---|---|---|---|---|
| **1 · Hub verificado, en escena** | Oct-2026, 1 sesión (paso 0 + 8 paquetes en paralelo + integración) | Ver `corte-1.md` | 85 exigibles en verde; huellas Node = Chromium; L01–L07; E01–E02; enlace y receta dentro de tamaño; recorrido «primer minuto» sin errores en 360 px y 1280 px; presupuestos de §4.4 | Nada para construir. Para publicar: consulta legal y OK |
| **2 · Tu operación, esta noche** | Dic-2026 → feb-2027, 6–10 sesiones | Importar CSV y XLSX en el Worker; ajuste de distribuciones; **validación conducida por traza**; **arranque en caliente** («¿llegamos esta noche?»); 3D a demanda; video (WebCodecs + webm-muxer); variables de control; entrevista en texto con IA; MCP local; editor 2D con parches; plantilla 3; R04 en Firefox y WebKit; sonda colectiva; motores inmutables; corpus de compatibilidad; página Verificado en borrador; registro de afirmaciones | Recupera la estructura y los tiempos ±5% de un modelo conocido desde sus escaneos; 90% de días apartados dentro del intervalo del 90% en un caso sintético; cuadro 3D ≤ 12 ms donde se elige; 24 de 30 entrevistas con casos escritos por humanos llegan a la decisión correcta; 0 cifras sin cita en 100 memos | Consulta legal (antes de publicar nada); OK para la sonda y la página; aprobar el gasto del banco de IA (USD 10–50, ESTIMACIÓN) |
| **3 · Decidir con garantía, para el Hot Sale** | Mar → may-2027, 8–12 sesiones | Optimizador con KN; MILP de turnos; **optimización del plan de clasificación**; incertidumbre doble y calibración; abogado del diablo; plantillas 4, 5 y 6; galería pública indexable; **Pro y pase de evento**; modo directorio con marca; lanzamiento antes del Hot Sale 2027 (fecha a verificar; en 2026 fue del 11 al 14 de mayo) | Mejora ≥ 5% sostenida en días apartados en 3 casos; KN elige el mejor verdadero en ≥ 95% de casos sintéticos; calibración recupera el parámetro escondido en 85–95% | Empresa del holding y cobro (*merchant of record*); OK de precios y de la página con botón de interés |
| **4 · Lógica propia y aula** | Jun → sep-2027, 8–12 sesiones | **Lenguaje de procesos y editor visual de lógica**; modo cátedra completo con certificado; curso en español; exportación a SimPy y Ciw; Verificado en inglés; reproducción de modelos publicados (si la licencia lo permite); comentarios anclados (si el costo pasa la regla) | Un modelo del editor visual pasa la misma batería que su equivalente compilado; la corrección por receta coincide con la del docente en ≥ 90% de trabajos | Presentar Aula a 2 o 3 docentes (con su OK) |
| **5 · Red, varios días y capex** | Oct → dic-2027 | Multi-día con re-entregas (§3.13); nodo de última milla con ruteo (VRP); plantilla 9 (capex y VAN); plantilla 10; eventos raros; Google Sheets como fuente viva; índice comunitario con consentimiento | Intervalos multi-día con cobertura 93–97% en un caso con solución conocida; estimación de eventos raros dentro del intervalo de un Monte Carlo largo, con ventaja medida | — |
| **6 · Frontera** | 2028 | WebGPU masivo (solo si ≥ 10 veces con huella idéntica); entorno de aprendizaje por refuerzo vía Node; DXF/IFC; croquis y PDF → modelo; voz; portugués; emisiones ISO 14083 / GLEC; realidad aumentada con su regla; Andén Ciudad | Cada una con su regla de corte propia | — |

**Gates que no se saltean:** consulta legal antes de publicar cualquier plantilla de hub y antes de que el fundador revise su realismo
(alerta del ingeniero y del estratega: el corte 1 es exactamente el dominio de su empleador); revisión de licencias de los incumbentes antes
de cualquier comparación pública; empresa y cobro antes del Pro; OK del fundador para todo lo que se publica o gasta (regla 8).

---

## 9. Riesgos

| # | Riesgo | Señal temprana | Mitigación | Etiqueta |
|---|---|---|---|---|
| 1 | **Exagerar la novedad** ante ingenieros | Un comentario que muestra que AnyLogic o Simio ya lo tienen | Registro de afirmaciones (§1.3) y prueba que bloquea publicar pendientes | HECHO (casos de §1.3) |
| 2 | **Propiedad intelectual del empleador** | La plantilla se parece a una operación concreta | Solo fuentes públicas; consulta legal antes de publicar; revisión del fundador limitada a «¿parece un hub?» | HECHO (normas citadas en P2) |
| 3 | **Licencias y marcas** de los incumbentes | Una tabla «Andén contra FlexSim» | Revisar las licencias y consultar antes; plantillas con nombres genéricos | INFERENCIA |
| 4 | **Verificado leído como validado** | Un directorio que toma la escena como garantía | Tres sellos separados (§5.9); franja de supuestos en cada clip | INFERENCIA |
| 5 | **Causas falsas con confianza** | Biografías que contradicen al contrafactual | Taxonomía cerrada + contrafactual dirigido por frase (E01, E02) | INFERENCIA |
| 6 | **Teléfonos más lentos** que lo supuesto | Primer cuadro > 3 s o 2,5D < 30 fps en el banco | Medir en teléfonos reales o con la sonda; nivel de detalle; Rust/WebAssembly con su regla | HIPÓTESIS (no medido) |
| 7 | **Safari distinto** y el sello se cae en iPhone | R04 rojo en WebKit o en la sonda | Matemática con + − × ÷; núcleo numérico en WebAssembly si falla | HECHO (especificaciones) / HIPÓTESIS |
| 8 | **Alcance infinito** | Un corte que se alarga más del doble | Cortes con criterio de salida; nada del corte siguiente sin cerrar el anterior; comité mensual | INFERENCIA |
| 9 | **Validación circular**: Claude escribe, prueba y aprueba | Todos los bancos verdes y ningún jefe de hub convencido | Agente revisor independiente; beta real desde las calculadoras y la cátedra de la UNNOBA (con OK); casos escritos por humanos | INFERENCIA |
| 10 | **Espectáculo que convence de algo falso** | Escenas de plantilla compartidas como si fueran la operación real | Etiqueta de noche, franja de supuestos, «sin validar», galería sin modelos con errores | INFERENCIA |
| 11 | **Se pierde el cobro** porque el enlace regala la privacidad | Mucho uso y cero pagos | Línea de pago definida antes de publicar (§11.3) | INFERENCIA |
| 12 | **Mercado de lectores, no de autores** | Muchas aperturas, pocos autores | Medir lector → autor → pago desde el día uno | INFERENCIA |
| 13 | **AnyLogic Online copia** compartir y 3D web | Anuncios | Competir en lo que no se copia barato (§1.6) | HECHO (lanzamientos) / INFERENCIA |
| 14 | **Proxy de IA abusado** | Créditos que se agotan | Ficha por dispositivo, desafío, límites, tope duro, con aprobación | INFERENCIA |
| 15 | **Falsas alarmas de la batería** que se terminan ignorando | Re-corridas frecuentes | Doradas como compuerta; estadísticas aparte con re-corrida | MEDIDO (cuenta de §A1) |
| 16 | **Memoria de la traza** en hubs grandes | Pestaña que se cae en iPhone | Cien noches sin trazas; ventanas y nivel de detalle; tope de 150 MB | MEDIDO (21 MB en 90k) |
| 17 | **Doble conteo** de fatiga y aprendizaje | Dotaciones infladas | Fatiga apagada por defecto; tamizado muestra su peso | INFERENCIA |
| 18 | **Datos argentinos sin fuente** (rampas, jaulas, paradas, fallidas) | Supuestos que mueven la decisión | Marcados; plan de medición; calibración; índice comunitario | HECHO (huecos) |
| 19 | **Profundidad sin caja** | Meses de corte sin pagos | Regla de caja del simulador (§10.3) | INFERENCIA |
| 20 | **Capacidad de Claude** compartida con Senda y Hub Nocturno | `/usage` con cortes en nov–dic | Cortes 2+ después de los lanzamientos; Andén cede prioridad | HECHO (Max 5x) / INFERENCIA |

---

## 10. Métricas y reglas de corte

### 10.1 Norte y embudo

- **Norte:** decisiones compartidas por semana = modelos con al menos un escenario comparado y abiertos por alguien más que el autor
  (`mercado.md` §10).
- **Embudo, medido desde el día uno** (alerta del estratega): aperturas de escenas → lectores que tocan algo en 30 s → lectores que se
  vuelven autores → autores que comparten → autores que pagan. Contadores sin cookies.
- **Experiencia:** primer cuadro (mediana y P90 por tipo de dispositivo), cuadros fuera de presupuesto, huellas que no coinciden (sonda).
- **Confianza:** pruebas del motor en verde, modelos que pasan los controles, afirmaciones públicas verificadas.
- **Costo:** servidor por usuario mensual < USD 0,01; IA por estudio ≤ USD 0,30.

### 10.2 Reglas de corte técnicas y de producto

- R04 falla en un motor de navegador → el núcleo numérico pasa a WebAssembly antes de seguir.
- Un teléfono de gama media tarda más de 1 s por noche del hub de 24.000 → Rust/WebAssembly; más de 3 s al primer cuadro o 2,5D < 30 fps →
  se pospone el 3D por defecto y se invierte en el 2,5D.
- Menos del 10% de las escenas se abre en otro dispositivo a los 3 meses del lanzamiento → se rediseña la escena compartida antes de sumar
  funciones.
- La entrevista con IA no llega a 24 de 30 decisiones correctas con casos humanos → se rediseña antes de sumar multimodalidad.
- Realidad aumentada solo si 1 de cada 10 presentaciones se hace desde teléfono o tableta.

### 10.3 Regla de caja del simulador (faltante del estratega)

- Se mantienen los cortes de P2: septiembre de 2027 (500 usuarios por mes o una cátedra) y Pro (menos de 10 pagos a los 6 meses → revisar
  precio y valor).
- **Se suma:** si a los 3 meses del lanzamiento del Pro hay **menos de 15 pagos entre Pro y pases de evento, o menos de 3 cuentas Equipo**, se
  congela la profundidad nueva y el trabajo pasa a conversión.
- **El caso de negocio de P2 no refleja este esfuerzo** (hoy supone 200 pagos y ~USD 5.000 por mes en 2030): el comité de noviembre lo
  actualiza con el simulador, su costo en sesiones de Claude y su hito de caja (regla 5 de `CLAUDE.md`: cada dólar de atención compite con
  Senda y Hub Nocturno).

---

## 11. Posicionamiento y precios

### 11.1 Posicionamiento

> Para quien maneja o estudia una operación logística y hoy decide con Excel o a ojo, **Andén es el gemelo de decisiones**: contale tu
> operación, mirala funcionar en tu teléfono y compartila. Te dice dónde se traba, cuánta gente hace falta y cuánto cuesta cada paquete,
> con la confianza de cada número y una receta que cualquiera reproduce. (HIPÓTESIS de posicionamiento, `mercado.md` §7.)

| Segmento | Mensaje | Prueba |
|---|---|---|
| Jefe de hub o depósito | «Cuánta gente para el Hot Sale, en 10 minutos» | Plantilla 4 con su película |
| Ingeniero | «La simulación que no te deja mentir» | Batería pública y comprobante |
| Consultor | «Tu estudio, en un enlace que tu cliente entiende» | Modo directorio con tu marca |
| Docente | «Tu cátedra entera, gratis, sin laboratorio ni licencias» | Semilla por alumno y corrección por receta |
| Estudiante | «Armá el hub de tu TP y mostralo en tu CV» | Escena pública y certificado |
| Global | «The decision twin: model it, watch it run on any phone, share it with a link» | Galería y Verificado en inglés |

### 11.2 Canales que venden por el fundador (cero horas de venta)

Escenas compartidas y QR; galería pública indexable (una página por modelo, con «duplicar»); calculadoras v0 como puerta (tráfico desde
enero de 2027); cátedras (curso y certificado); agentes de IA por MCP; informe mensual de costos logísticos; consultores con el plan Equipo;
videos cortos sin cara («tu planilla te miente»: el promedio pide 4 puestos y las cien noches piden 5, como formato, con números del modelo
y nunca inventados); una guía y un importador parcial para quienes dejan AutoMod (si se verifica la discontinuación); el embudo cruzado con
Hub Nocturno («¿jugaste el hub? simulá el tuyo»).

### 11.3 La línea de pago, definida antes de publicar (alerta del estratega)

El cálculo es local y el enlace con el modelo en el `#` deja compartir sin servidor: **no se cobra por tamaño, por corridas ni por
compartir**. Se cobra por **control, datos, tiempo ahorrado y marca**.

| Plan | Latinoamérica | Global | Qué incluye (HIPÓTESIS a probar) |
|---|---|---|---|
| **Gratis** | Gratis | Gratis | Motor completo sin tope de tamaño, plantillas, formulario por decisión, estadística completa, escenas por enlace con marca «Hecho con Andén» y franja de supuestos, galería pública con anonimizador |
| **Pro** | USD 12/mes o 120/año | USD 29/mes o 290/año | Escenas privadas con acceso, caducidad y revocación; importar planillas y WMS; arranque en caliente diario; memo e informe PDF con marca propia; video sin marca; optimizador del plan y de turnos; créditos de IA; historial sincronizado |
| **Pase de evento** | ~USD 9 por 30 días, en pesos (HIPÓTESIS) | — | El Pro para el estudio del Hot Sale o del CyberMonday, para pymes que deciden dos o tres veces por año |
| **Equipo** | USD 25 por editor/mes | USD 59 | Lectores gratis, marca del consultor en el modo directorio, espacio compartido, comentarios anclados (cuando existan) |
| **Educación** | Gratis | Gratis | Aulas, semilla por alumno, corrección por receta; certificado con tarifa chica o patrocinador (HIPÓTESIS) |
| **Institución** | USD 240 por cuatrimestre (supuesto de P2) | A validar | Integración con el campus, reportes de cátedra |

- Precios: HIPÓTESIS de `mercado.md` (nivel de precios relativo de Argentina 0,46; Spotify cobra ~22% del precio de EE. UU.). Se prueban con
  una página de precios con botón de interés antes de cobrar, con OK del fundador.
- Cobro: *merchant of record* (5% + USD 0,50; con pago anual baja a ~5,4% de comisión, ESTIMACIÓN) desde que exista la empresa del holding
  (prevista para febrero de 2027); Mercado Pago para el pase en pesos cuando se pueda (comisiones no verificadas).
- Plan gratis con un modelo propio: puede compartir por enlace (con marca y franja) y publicar en la galería con anonimizador; lo privado
  persistente con control es Pro.

---

## 12. Qué decide el fundador

| # | Decisión | Recomendación | Cuándo |
|---|---|---|---|
| 1 | Consulta legal de 1 hora con un abogado laboral (propiedad intelectual del empleador) | Hacerla antes de publicar nada del simulador y antes de revisar el realismo de la plantilla de hub | Noviembre de 2026 |
| 2 | Publicar el corte 1 (escena pública, página Verificado en borrador) | No antes de la consulta; después, sí, sin nombres de empresas | Después de 1 |
| 3 | Comprar 2 o 3 teléfonos usados de prueba (gama baja y media, y un iPhone viejo) o habilitar solo la sonda colectiva | La sonda primero (costo ~0); teléfonos si la sonda no alcanza | Corte 2 |
| 4 | Revisar las licencias de FlexSim Express, AnyLogic PLE y Simio antes de cualquier comparación pública | Sí, con la misma consulta legal | Antes del corte 3 |
| 5 | Línea de pago y precios (§11.3) | Aprobar la página con botón de interés en el corte 3 | Marzo de 2027 |
| 6 | Abrir el motor y la batería como código abierto | Decidir en el corte 4 con datos de uso | 2º semestre de 2027 |
| 7 | Actualizar el caso de negocio de P2 con el simulador | En el comité de noviembre | Noviembre de 2026 |

---

## 13. Fuentes

Consultadas el 17-10-2026 por los frentes de investigación, salvo la medición propia y los vectores de Random123 (abiertos por esta síntesis
el mismo día).

**Mediciones propias**
- Esta síntesis: `oportunidades/proyectos/anden/medicion-sintesis/` (`philox.mjs`, `detmath.mjs`, `precision.mjs`, `hub_diag.mjs`,
  `correr.mjs`, `resultados.json`, README).
- Visiones: `visiones/rigor-medicion/`, `visiones/experiencia-medicion/`, `conocimiento/anden-simulador-2026-10/medicion-ia-nativa/`.
- Frentes: `conocimiento/anden-simulador-2026-10/medicion-motor/` y `medicion-tecnologia/`.
- Calculadora 3: `apps/anden/js/calculadoras.js` y `calculos.js` (ejemplo «Peón · Camioneros (CCT 40/89)», corrido el 17-10-2026).

**Informes y visiones del repositorio**
- `conocimiento/anden-simulador-2026-10/`: `incumbentes.md`, `frontera-ia.md`, `tecnologia-web.md`, `realismo-logistico.md`,
  `motor-validacion.md`, `mercado.md`.
- `oportunidades/proyectos/anden/visiones/`: `rigor.md`, `experiencia.md`, `ia-nativa.md`.
- `oportunidades/proyectos/P2-anden.yaml`, `apps/anden/README.md`, `apps/anden/js/referencias.js`, `cartera/decisiones.md`
  (DEC-2026-10-17-2).

**Abierta por esta síntesis**
- Random123, vectores de prueba: https://raw.githubusercontent.com/DEShawResearch/random123/main/tests/kat_vectors
- npm (versión y licencia, 17-10-2026): https://www.npmjs.com/package/esbuild · /three · /qrcode-generator · /webm-muxer · /mp4-muxer ·
  /mediabunny · /fflate · /typescript · /@types/node

**Primarias citadas a través de los informes** (no reabiertas hoy)
- Law (2023), WSC — https://informs-sim.org/wsc23papers/124.pdf
- Sargent (2010), WSC — https://www.informs-sim.org/wsc10papers/016.pdf
- Bicalho-Hoch y otros (2022), WSC — https://informs-sim.org/wsc22papers/181.pdf
- Random123 (Salmon y otros, SC11) — https://www.thesalmons.org/john/random123/papers/random123sc11.pdf
- ECMA-262, Math — https://tc39.es/ecma262/multipage/numbers-and-dates.html · MDN, Math — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
- WebAssembly, no determinismo — https://github.com/WebAssembly/design/blob/main/Nondeterminism.md
- FlexSim 2027, Experimenter — https://help.autodesk.com/view/FLEXSIMIN/2027/ENU/?guid=FlexSim_User_Manual_reference_tools_experimenter_html
- FlexSim, límites por licencia — https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-feature-limitations-by-license-type/tac-p/13814419
- Simio, libro oficial — https://textbook.simio.com/SASMAA/ · Simio MCP — https://www.financialcontent.com/article/bizwire-2026-9-23-aegis-software-introduces-ai-powered-interaction-for-process-simulation-and-planning-in-simio
- AnyLogic 8.9.10 — https://www.anylogic.com/blog/anylogic-8-9-10-boost-productivity-with-the-new-ai-assistant/ · AnyLogic Online — https://www.anylogic.com/blog/welcome-to-anylogic-online-another-way-to-build-and-use-simulations/
- Siemens Copilot 2606 — https://blogs.sw.siemens.com/tecnomatix/ai-for-discrete-event-simulation-how-plant-simulation-x-copilot-accelerates-simtalk-programming/
- AutoMod discontinuado (secundaria) — https://pmcorp.com/blog/automod-is-being-discontinued-exploring-automod-software-alternatives/
- Oskon, capacidad de sorters — https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity
- Plus One Robotics — https://www.plusonerobotics.com/case-studies/pennsylvania-facility-turns-its-sorter-into-a-24-7-revenue-engine
- Loske y Klumpp (IFAC 2020) — https://re.public.polimi.it/retrieve/584d3515-aaf1-4de0-8e95-e441327146e8/1-s2.0-S2405896320335205-main.pdf
- Kim y Jung (WSC 2022) — https://www.informs-sim.org/wsc22papers/148.pdf
- EIL, ausentismo — https://argentina.gob.ar/sites/default/files/eil_ausentismo_ficha_metodologica.pdf · IDESA — https://eleconomista.com.ar/politica/reforma-laboral-alerta-ausentismo-126-n92728
- Hot Sale 2026 (BAE) — https://www.baenegocios.com/amp/hot-sale-2026-los-argentinos-gastan-casi-100-000-por-compra/
- Supervalu — https://www.supermarketnews.com/archive/palletization-cuts-product-turnaround-times-study
- Amazon Last Mile (Merchán y otros) — https://registry.opendata.aws/amazon-last-mile-challenges
- WERC 2025 (Yale) — https://www.yale.com/globalassets/coms/yale/north-america/documents/white-papers/snack-drawer/YALE-1520_WERC-DC-Metrics-infographic.pdf
- Prensa de hubs argentinos — https://mercado.com.ar/protagonistas/andreani-convierte-su-planta-de-pacheco-en-el-hub-logistico-mas-automatizado-del-pais ·
  https://www.iprofesional.com/tecnologia/453613-andreani-invierte-us30-millones-en-tecnologia-en-su-hub-pacheco-y-expande-su-operacion-a-miami ·
  https://mercado.com.ar/innovacion/correo-argentino-inaugura-sistema-robotico-que-triplica-la-capacidad-operativa-logistica-en-monte-grande
- Cushman & Wakefield vía Bank Magazine — https://bankmagazine.com.ar/en-el-tercer-trimestre-los-inmuebles-logisticos/
- WebKit, almacenamiento — https://webkit.org/blog/14403/updates-to-storage-policy/
- Cloudflare Pages y Workers — https://developers.cloudflare.com/pages/platform/limits/ · https://developers.cloudflare.com/workers/platform/pricing/
- GitHub Pages, usos prohibidos — https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- SimOpt — https://github.com/simopt-admin/simopt · SALib — https://salib.readthedocs.io/en/latest/
- Sketch2DES — https://arxiv.org/abs/2607.24259 · DEVS desde especificaciones — https://arxiv.org/abs/2603.03784
- Figma, Onshape, SimScale, Canva (`mercado.md` §14)
