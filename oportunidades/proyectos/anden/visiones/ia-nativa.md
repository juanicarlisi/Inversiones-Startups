# Andén · Visión «IA nativa»: el ingeniero de simulación incluido (17-10-2026)

> **Qué es este documento.** Una de las visiones de producto y arquitectura para el simulador de Andén (P2,
> `oportunidades/proyectos/P2-anden.yaml`), escrita desde un ángulo: **IA nativa**. Contás tu operación como se la contarías a un
> colega (texto, voz, foto de un plano hecho a mano, PDF, planilla), y la IA arma el modelo, pregunta lo que falta, corre los
> experimentos, encuentra el cuello de botella y explica qué cambiar.
>
> **Base.** Los seis informes de `conocimiento/anden-simulador-2026-10/`: `incumbentes.md`, `frontera-ia.md`, `tecnologia-web.md`,
> `realismo-logistico.md`, `motor-validacion.md` y `mercado.md`. Se suma una **medición nueva hecha para esta visión**, en
> `conocimiento/anden-simulador-2026-10/medicion-ia-nativa/` (ver §2).
>
> **Fecha y etiquetas.** Todas las fuentes se consultaron el 17-10-2026. Etiquetas: **HECHO** (fuente y fecha) · **HECHO medido**
> (script reproducible) · **ESTIMACIÓN** (con método) · **HIPÓTESIS** (a validar) · **INFERENCIA** (razonamiento propio).
>
> **Límites.** Ninguna cifra de este documento sale de la empresa donde trabaja el fundador. Las plantillas se arman solo con datos
> públicos y con conocimiento general (Ley 11.723 art. 4 inc. d; LCT arts. 82, 85 y 88; ver P2 › riesgos).

---

## 0. Resumen

1. **«La IA arma el modelo» dejó de ser un diferencial en septiembre de 2026.** HECHO:
   - AnyLogic 8.9.10 (24-09-2026) arma «borradores simples».
   - AnyLogic Online (15-09-2026) corre en el navegador.
   - Simio abrió MCP (23-09-2026).
   - Siemens escribe SimTalk con su copiloto.

   En 12 a 18 meses lo van a tener todos (HIPÓTESIS, probabilidad alta). Lo que **nadie** tiene es el **estudio de simulación
   completo**, hecho por una IA que sigue el método de un ingeniero y **no puede mentir**. Esa IA:
   - pregunta lo que cambia la decisión;
   - deja los supuestos a la vista;
   - verifica el modelo;
   - experimenta con estadística honesta;
   - explica con contrafactuales calculados;
   - entrega una decisión en pesos, con su nivel de confianza.
2. **Categoría: el estudio de simulación automático**, la forma concreta del «gemelo de decisiones» que propone `mercado.md`. Hoy
   hay tres maneras de llegar a una decisión, y ninguna sirve a la pyme:
   - Los incumbentes venden una **herramienta** para analistas.
   - Los consultores venden **estudios**.
   - La pyme decide con Excel: el 79% de las pymes de un Delphi de la WSC 2022 no simula (HECHO).

   Andén vende **el estudio, al precio de una aplicación**.
3. **Principio 1: la IA es la voz y el método; el cálculo es determinista y local.**
   - El modelo de lenguaje (LLM) nunca produce un número: llama herramientas.
   - Un verificador revisa que cada cifra de cada frase coincida con un resultado guardado. Si no coincide, la frase no se muestra.
   - Sin conexión o sin créditos de IA, todo sigue funcionando con formularios generados desde el mismo esquema.
4. **Principio 2: preguntar lo que cambia la decisión, no todo** (HECHO medido, §2). Probamos un modelo de juguete de un turno de
   hub con 10 supuestos desconocidos.
   - Solo **3 cambian la cantidad de puestos que hace falta**: tasa de inducción, ausentismo y temporarios.
   - El atraso de las troncales corre el fin del turno **45 minutos**, pero **no cambia la decisión**.
   - El tamizado completo tardó 78 s en un hilo y 28 s en 4 procesos. Entra en el tiempo de una entrevista.
   - La entrevista de Andén se ordena por **valor de la información** y termina cuando nada de lo que falta puede cambiar la
     respuesta.
5. **Principio 3: el riesgo, no el promedio** (HECHO medido, §2).
   - Una cuenta «de planilla» con promedios (ausentismo, pausas y fatiga incluidos) se quedó corta en **17 de 21 escenarios**:
     casi siempre por un puesto, y por tres con 10% de ausentismo.
   - Con 20 réplicas, la simulación «decidía» 4 puestos (P̂ = 95%). Con 400 réplicas, 4 puestos cumplen el **84%** de los días
     (IC 95%: 80–87%) y hacen falta 5.
   - El semáforo de confianza de Andén lo habría marcado: el intervalo con 20 réplicas iba de 76% a 99% y cruzaba la meta.
6. **Diecinueve capacidades diferenciales** (§3). Las centrales:
   - entrevista guiada por la decisión;
   - ingesta multimodal con la procedencia de cada pieza;
   - detector de contradicciones antes de simular;
   - borrador instantáneo más confirmación por simulación;
   - libro de supuestos con dos incertidumbres separadas (ruido de la simulación y desconocimiento de los datos);
   - calibración inversa;
   - narración del peor día;
   - reglas evolucionadas legibles;
   - abogado del diablo automático;
   - **plan de medición con cronómetro en el teléfono** (Andén te dice qué medir mañana y cuántas veces);
   - banco público para medir a la IA.
7. **Arquitectura: el agente corre en el navegador del usuario.** Las herramientas son locales, en Web Workers. El LLM se usa como
   una función remota. El único servidor:
   - alojamiento estático;
   - una función mínima (proxy de IA con medición de créditos y firma de licencias).

   También hay MCP local (`npx`), MCP remoto liviano (sin cómputo) y WebMCP. Con eso, el agente del usuario paga sus propios
   tokens.
8. **Costo de IA por estudio completo: USD 0,01–0,25** (ESTIMACIÓN con precios oficiales en caché del 06-10-2026, a re-verificar;
   §5.6). El cálculo pesado no cuesta nada: corre en el dispositivo.
9. **Corte 1, «Tu hub en una conversación»** (nov-2026 → feb-2027, ESTIMACIÓN), ya profundo:
   - motor verificado (59 controles públicos);
   - plantilla de hub calibrada con datos argentinos públicos;
   - entrevista por valor de la información;
   - borrador instantáneo y simulación;
   - semáforo, explicación con contrafactuales en pesos y peor día narrado;
   - vista 2D e isométrica que anda sin placa de video;
   - enlace para el jefe y MCP local.

   Claude lo prueba solo, con entrevistados sintéticos que esconden una operación verdadera.
10. **Riesgos centrales** (§9):
    - **La IA se equivoca con confianza** → verificación y citas obligatorias.
    - **Los incumbentes copian** → banco público, verticales argentinas y precio.
    - **El teléfono es lento** → réplicas secuenciales y cálculo durante la charla.
    - **Dependencia de un proveedor de IA** → capa de herramientas que no depende del modelo, clave propia (BYOK) y MCP.

---

## 1. La tesis

### 1.1 Qué cambió en las últimas cuatro semanas (HECHO)

| Quién | Qué hace su IA hoy | Qué no hace | Fuente |
|---|---|---|---|
| AnyLogic 8.9.10 (24-09-2026) | Arma «borradores simples y ejecutables», describe modelos, explica errores. Funciona con la clave propia del usuario (Claude, ChatGPT, Gemini) | No pregunta lo que falta. El propio fabricante lo llama «borrador» | anylogic.com/blog (8.9.10) |
| AnyLogic Online (15-09-2026) | Modelado completo en el navegador, con experimentos en la nube | No sabemos si calcula en el navegador o en la nube (quedó abierto) | anylogic.com/blog (Online) |
| Simio 20.294 (23-09-2026) | Servidor MCP: el agente externo crea lógica, explica, corre y analiza experimentos | Producto de escritorio caro, orientado a fábricas | Business Wire vía financialcontent.com |
| Siemens Plant Simulation 2606 | Copiloto que escribe y corrige SimTalk; opción de LLM propio | Resumen del modelo, cuellos automáticos y armado de experimentos figuran como «metas futuras» | blogs.sw.siemens.com |
| FlexSim 2026 (Autodesk) | No encontramos asistente nativo (las notas de versión dieron 403) | — | `incumbentes.md` |

**INFERENCIA (confianza alta).** Los cuatro pusieron la IA donde ya tenían un hueco: **escribir código o armar un borrador para un
experto**. El código es justo la parte del estudio que menos le importa a quien decide.

### 1.2 Qué cuesta de verdad un estudio de simulación y dónde ataca cada uno

Un estudio de simulación sigue pasos conocidos. El esquema es el de los textos clásicos de Law y de Sargent: Sargent (WSC 2010)
recomienda acordar la validación antes de construir y revisar la validez con expertos en cada vuelta (HECHO). La lista de pasos
de abajo es conocimiento general del método, no re-verificado hoy.

En los proyectos, los **datos de entrada** se llevan el 10–40% del tiempo (Skoogh y Johansson 2009) y **construir el modelo**, el
40–60% (Banks, citado por la UNAM en 2026). HECHO.

| Paso del estudio | Quién lo hace hoy | Qué hacen los copilotos | Qué hace el ingeniero de Andén |
|---|---|---|---|
| 1. Formular la decisión (qué se decide, con qué meta, en qué horizonte) | Consultor o analista | Nada | Lo pregunta primero y lo guarda en el modelo como objeto `decision` |
| 2. Datos y supuestos | El analista, a mano (10–40% del proyecto) | Nada (ANDRITZ compró Stat::Fit en ene-2026 por eso) | Lee planillas y exportaciones en el navegador. Ajusta distribuciones. Pregunta solo lo que mueve la decisión. Arma un plan de medición |
| 3. Validar el modelo conceptual con quien conoce la operación | Reunión | Nada | Escribe un libro de supuestos en lenguaje llano. El usuario confirma cada supuesto con un toque |
| 4. Construir | Programador (40–60%) | Escriben código (SimTalk) o un borrador | Llena un esquema tipado; un compilador lo valida |
| 5. Verificar | A ojo, si hay tiempo | Revisión de sintaxis | Controles automáticos en cada modelo: balance de flujo, Little, ocupación menor que 1, Erlang C por estación, invariantes de traza |
| 6. Validar contra la realidad | A veces | Nada | Prueba de Turing con datos del usuario y calibración inversa |
| 7. Diseñar experimentos | Analista con estadística | Nada (Siemens: «meta futura») | Plan visible: réplicas hasta la precisión pedida, números aleatorios comunes, selección del mejor con garantía (método de Kim y Nelson) |
| 8. Analizar y explicar | Analista | Simio responde preguntas sobre resultados por MCP | Explicación calculada con contrafactuales; el LLM solo redacta y cita |
| 9. Presentar y convencer | PowerPoint | Nada | Un enlace que abre en el teléfono del jefe, video del peor día y memo en pesos |
| 10. Vigilar (nuevo) | Nadie | Nada | Recalibra con la planilla de cada semana y avisa cuando cambia la decisión |

**Tesis.** El hueco no es «escribir el modelo». Son los pasos 1, 2, 3, 5, 6, 7, 8 y 10: el **método**. Una IA que sigue el método,
con un motor que no le deja inventar, hace en minutos lo que hoy es un proyecto de consultoría. Y lo hace para quien nunca va a
contratar uno (INFERENCIA).

### 1.3 La categoría: el estudio de simulación automático

- **Nombre de mercado:** «gemelo de decisiones» (*decision twin*), como propone `mercado.md` §6.
- **Promesa concreta de esta visión:** *«Contale tu operación. Andén te hace el estudio: qué pasa, dónde se traba, qué cambiar y
  cuánto confiar»*.
- **La unidad de valor no es el modelo, es la decisión con su evidencia.** El modelo es un subproducto que el experto puede abrir
  y editar.
- **Lo que no hay que decir** (de `mercado.md`): «el FlexSim barato», «IA que arma el modelo» (ya lo dicen AnyLogic y Siemens) y
  «gemelo digital» a secas.

### 1.4 Por qué le gana a FlexSim, AnyLogic y Plant Simulation en lo que importa (y dónde no)

| Lo que importa a quien decide | FlexSim / AnyLogic / Plant Simulation (HECHO, `incumbentes.md`) | Andén, IA nativa (HIPÓTESIS con criterio de prueba) |
|---|---|---|
| Tiempo hasta la primera decisión confiable | Días o semanas: datos 10–40% y construcción 40–60% del proyecto | Menos de 15 minutos para una plantilla con datos propios (criterio en §10) |
| Quién lo puede usar | Quien programa: FlexScript, Java, SimTalk; «no es para quien no programa» (reseñas) | Quien maneja la operación, en español y desde el teléfono |
| Qué preguntar | El analista tiene que saber qué importa | Andén calcula qué supuesto cambia la decisión y lo pregunta primero (§2) |
| Confianza en el número | Réplicas fijas e intervalo «inspeccionado visualmente» (FlexSim); intervalos de una sola corrida en algún producto comercial (Law 2023: 7,2% de cobertura real) | Semáforo doble (ruido y supuestos), batería pública, receta reproducible bit a bit |
| Por qué pasa | Analizador de cuellos y diagrama Sankey (Siemens) | Contrafactual calculado con la misma aleatoriedad, en pesos, y cada frase con su cita |
| Riesgo | Medias | P90, probabilidad de perder el corte y pruebas de estrés antes de recomendar |
| Compartir | Licencia o visor | Enlace que corre en el dispositivo de quien mira |
| Precio | ~USD 6.000 por año (FlexSim, revendedores); USD 4.995–9.995 (ExtendSim); USD 21.800 por año (anyLogistix) | Gratis el motor completo; Pro a USD 12 por mes en Latinoamérica (HIPÓTESIS de `mercado.md`) |
| Datos locales | No | Costos con índices argentinos (FADEEAC, CEDOL, CCT 40/89 y 130/75), ya en `apps/anden/js/referencias.js` |

**Dónde no gana (y no compite), INFERENCIA:**
- 20 años de bibliotecas.
- Física de contacto y emulación de PLC (Emulate3D).
- Fotorrealismo sobre NVIDIA Omniverse.
- Modelos gigantes con lógica arbitraria para multinacionales.
- Integración con AutoCAD.

El experto puede seguir usando FlexSim para eso y Andén para lo rápido y para mostrar. `mercado.md` muestra que Onshape fue
técnicamente superior y no desplazó a SolidWorks. Ganaron en grande los que agrandaron el mercado: Canva y Figma.

### 1.5 Tres principios que ordenan todo lo demás

1. **La IA es la voz y el método; el motor es la verdad.**
   - El LLM traduce, pregunta, propone parches y redacta.
   - Los números salen de herramientas deterministas.
   - Una afirmación sin experimento que la respalde no se muestra.
   - Es la lección de Sketch2DES (97% con «LLM → JSON validado → adaptador determinista») frente al 30,6% de código correcto
     cuando el LLM escribe el simulador (SIMCODE). HECHO, `frontera-ia.md`.
2. **Preguntar lo que cambia la decisión.** El costo de una entrevista es la paciencia del usuario. Cada pregunta tiene que valer
   más que la anterior, y la entrevista termina cuando lo que falta ya no puede cambiar la respuesta (§2, §3 C1).
3. **El riesgo, no el promedio.** La logística se decide por lo que pasa el peor día de cada veinte, no por el día medio. La IA
   traduce «casi nunca» a una probabilidad que el usuario confirma, y el motor la verifica (§3 C8).

---

## 2. Lo que medimos para esta visión: preguntar lo que cambia la decisión

**Pregunta.** ¿Se puede calcular en el navegador, mientras dura la entrevista, **qué supuesto cambia la decisión** (y no solo el
resultado)? Si se puede, el «ingeniero» pregunta tres cosas y no treinta.

**Modelo (de juguete; no es un hub real).**
- Un turno de un hub con 24.000 paquetes que llegan en 6 horas, con un pico de 2 horas. El corte es al minuto 450.
- Inducción manual con c puestos. El NO-READ va a codificación manual (2 personas) y vuelve a inducción.
- Pausas escalonadas y ausentismo por puesto sin reemplazo.
- Los temporarios rinden 0,6 de un experimentado (inspirado en Loske y Klumpp 2020: 0,46–0,61 contra 0,80–0,95 al empezar).
- Fatiga que crece con el tiempo desde la última pausa.
- **Decisión:** el mínimo de puestos de inducción tal que P(terminar todo antes del corte) ≥ 0,90.
- 10 supuestos desconocidos, cada uno con un rango bajo–medio–alto, como los dejaría una entrevista a medio hacer.
- Método: un supuesto por vez, con números aleatorios comunes (un flujo de azar por fuente, atributos sorteados al nacer el
  paquete, ausencias sorteadas por puesto).

Scripts:
- `conocimiento/anden-simulador-2026-10/medicion-ia-nativa/voi.js`;
- `precision.js`;
- resultados en `resultado-100-replicas.json`, `resultado-20-replicas.json` y `precision.json`.

Entorno: Node 22.22, Intel Xeon de 2,1 GHz y 4 núcleos compartidos. Corrida del 17-10-2026.

**Resultados con 100 réplicas por configuración** (HECHO medido; con los valores medios, la decisión es **5 puestos**):

| Supuesto desconocido | Rango probado | Puestos que hacen falta (bajo / medio / alto) | «Planilla» de promedios | P(cumplir) con 5 puestos si la verdad es el extremo bajo / alto | Cuánto corre el fin del turno con 5 puestos (min) |
|---|---|---|---|---|---|
| Tasa de inducción por puesto | 800 – 1.600 paq/h | **7 / 5 / 3** | 6 / 4 / 3 | **0,00** / 1,00 | −113 |
| Ausentismo por puesto | 0 – 10% | **4 / 5 / 7** | 4 / 4 / 4 | 1,00 / **0,87** | 34 |
| Fracción de temporarios | 0 – 50% | **5 / 5 / 6** | 4 / 4 / 5 | 0,96 / **0,84** | 37 |
| Atraso de troncales | 0 – 45 min | 5 / 5 / 5 | 4 / 4 / 5 | 0,96 / 0,96 | **45** |
| Pausas por persona | 20 – 60 min | 5 / 5 / 5 | 4 / 4 / 4 | 0,96 / 0,96 | 10 |
| Concentración del pico | 33% – 60% en 2 h | 5 / 5 / 5 | 4 / 4 / 5 | 0,96 / 0,96 | 5 |
| Variabilidad del tiempo de inducción (CV) | 0,3 – 1,0 | 5 / 5 / 5 | 4 / 4 / 4 | 0,96 / 0,96 | 0 |
| NO-READ | 0,5% – 5% | 5 / 5 / 5 | 4 / 4 / 4 | 0,96 / 0,96 | 3 |
| Ritmo de codificación manual | 100 – 250 paq/h | 5 / 5 / 5 | 4 / 4 / 4 | 0,96 / 0,96 | 0 |
| Fatiga | 0 – 10% | 5 / 5 / 5 | 4 / 4 / 4 | 0,96 / 0,96 | 2 |

**Precisión** (HECHO medido, `precision.json`; IC de Wilson al 95%):

| Réplicas | P(cumplir) con 4 puestos | P(cumplir) con 5 puestos | Decisión que sale |
|---|---|---|---|
| 20 | 0,95 [0,76; 0,99] | 1,00 [0,84; 1,00] | **4 (equivocada)** |
| 100 | 0,86 [0,78; 0,92] | 0,96 [0,90; 0,98] | 5 |
| 400 | 0,84 [0,80; 0,87] | 0,97 [0,95; 0,98] | 5 |
| Control analítico: P(no falta ninguno de 4) = 0,95⁴ | 0,8145 | — | Coherente: los días en que falta alguien con 4 puestos casi nunca se llega |

**Cómputo** (HECHO medido):
- Tamizado completo con 100 réplicas: 7.400 turnos simulados (362 millones de eventos) en **78 s en un hilo** (4,6 millones de
  eventos por segundo) y **28 s repartido en 4 procesos**.
- Con 20 réplicas: 14 s en un hilo, pero con la decisión equivocada.

**Qué enseña** (INFERENCIA sobre un modelo de juguete; el método es lo que se valida, no los números del hub):

1. **El ranking por decisión no es el ranking por resultado.**
   - El atraso de las troncales es el segundo supuesto que más mueve el fin del turno (45 min) y **no cambia la dotación**.
   - El ausentismo mueve menos el fin (34 min) y obliga a sumar **dos** puestos.
   - El análisis de sensibilidad clásico (cuánto se mueve el KPI) ordena mal las preguntas. Hay que medir cuánto se mueve **la
     decisión** y cuánto cuesta equivocarse.
2. **La cuenta con promedios subestima la gente en 17 de 21 escenarios, siempre para el mismo lado.**
   - El ausentismo es un riesgo discreto: un día faltan dos.
   - Una planilla que multiplica por 0,95 nunca lo ve.
   - La «planilla» ni siquiera detecta que el ausentismo importa: en su ranking da cero.
   - Por eso el borrador analítico sirve como **alarma**, nunca como respuesta, y los supuestos que funcionan como golpes discretos
     (faltas, fallas, llegadas en lote) siempre se tamizan con simulación.
3. **Con pocas réplicas, la decisión sale mal y con cara de segura.** Veinte réplicas dieron 95% para una configuración que cumple
   el 84%. El semáforo tiene que mirar si el intervalo **cruza la meta**, no solo su ancho.
4. **El tamizado entra en la entrevista, no en una animación.**
   - Medido: 28 s en 4 procesos.
   - ESTIMACIÓN, sin medir: con réplicas secuenciales (20 primero, más solo donde el intervalo cruza la meta), entre 8 y 15 s en
     4 hilos.
   - En un teléfono, de 3 a 10 veces más (rango supuesto en `tecnologia-web.md`, también sin medir).
   - Eso entra mientras el usuario contesta la pregunta anterior (30 a 60 s por respuesta, HIPÓTESIS).

**Límites honestos de esta medición:**
- Es un modelo de juguete, con rangos de ejemplo.
- Es un supuesto por vez: no capta interacciones; para eso, Morris o Sobol, §7.
- El ausentismo sin reemplazo es una regla del modelo. Justamente por eso «¿cubrís al que falta?» pasa a ser una pregunta de la
  entrevista.
- No se midió en un navegador ni en un teléfono.

---

## 3. Diecinueve capacidades diferenciales

Formato de cada una: **qué hace**, **por qué nadie la tiene (o la tiene mal)**, **cómo se construye en el navegador** y **cómo se
prueba**. Salvo indicación, cada capacidad es una HIPÓTESIS de producto con su criterio de prueba. Las cifras entre comillas en «Qué
hace» son **textos de ejemplo de la interfaz**, no datos, salvo las que citan una fuente.

### C1. Entrevista guiada por la decisión y por el valor de la información

- **Qué hace.** Arranca con una sola pregunta: «¿Qué tenés que decidir?». Con la respuesta elige el tipo de decisión de un catálogo
  (dotación por turno, puestos o muelles, horario de corte, comprar un equipo, layout, tarifa) y arma un borrador desde la
  plantilla. Después, en cada vuelta, sigue este ciclo:
  1. tamiza los supuestos que faltan (§2);
  2. pregunta el que más mueve la decisión, o el que más cuesta equivocar en pesos;
  3. ofrece tres salidas si el usuario no sabe: un valor de referencia con su fuente, un rango («entre 800 y 1.600») o un plan de
     medición (C19).

  **Termina sola** cuando ningún supuesto que falta puede cambiar la respuesta más allá de la zona de indiferencia que fijó el
  usuario («no me importan diferencias de menos de $50.000 por mes»).
- **Por qué es nuevo.** Ningún fabricante documenta una IA que detecte lo que falta y pregunte como un ingeniero. La investigación
  sobre esa elicitación en simulación casi no existe (`frontera-ia.md` §1, INFERENCIA de confianza alta). Lo que sí existe es
  sensibilidad sobre el KPI, que ordena mal las preguntas (medido en §2).
- **Cómo se construye.** El tamizado corre en Web Workers con el motor y la ficha de cada bloque (§5.7). La ficha trae, para
  cada parámetro:
  - su pregunta en criollo;
  - su rango por defecto con fuente;
  - si es un golpe discreto (va siempre a simulación).

  El orquestador del LLM solo elige cómo formular la pregunta. **Qué preguntar lo decide el cálculo.** La regla de corte usa
  intervalos pareados: si con el supuesto en sus dos extremos la decisión no cambia, ese supuesto no se pregunta.
- **Cómo se prueba.** Con 30 entrevistados sintéticos con la operación escondida (C16):
  - al menos 27 llegan a la decisión de referencia;
  - la mediana es de 8 preguntas o menos;
  - comparado con un cuestionario completo, se hace menos de la mitad de las preguntas con la misma decisión.

### C2. Ingesta multimodal con la procedencia de cada pieza

- **Qué hace.** Junta en **un solo modelo** lo que el usuario trae:
  - lo que cuenta por texto o voz;
  - una foto del pizarrón o del plano hecho a mano;
  - el PDF del procedimiento;
  - la planilla de volúmenes;
  - la exportación del WMS.

  Cada elemento del modelo sabe **de dónde salió**:
  - «esta rampa, de la foto (recuadro marcado)»;
  - «este tiempo, del PDF, pág. 4»;
  - «este volumen, de la planilla, columna C»;
  - «este ausentismo, lo supuse yo: 5%, tope "aceptable" según ADRHA, citado por la EIL».

  Con un toque en cualquier número, «¿de dónde sale?» muestra la cadena completa hasta la fuente.
- **Por qué es nuevo.**
  - Sketch2DES (jul-2026) demostró imagen de colas → JSON validado con 97% de acierto, pero en 8 diagramas limpios, en inglés y en
    laboratorio.
  - No encontramos nada probado con fotos de celular de depósitos, «planos» que vectorizan viviendas, ni fusión de varias fuentes
    con procedencia (HECHO / INFERENCIA, `frontera-ia.md` §1.3).
  - Los incumbentes importan CAD; nadie importa un croquis.
- **Cómo se construye.**
  - **Foto:** un modelo con visión (Sonnet 5.5) extrae un «croquis» en JSON: zonas, flechas, etiquetas, cotas, con el recuadro de
    cada una. Un adaptador determinista lo convierte en layout y grafo. El croquis se dibuja **como fantasma sobre la foto** para
    confirmar («¿esto es la rampa 1?»). La escala se fija marcando dos puntos y su distancia.
  - **PDF:** extracción con **citas por página**. La API de Claude devuelve `page_location` en documentos PDF (HECHO, documentación
    de la API, en caché del 06-10-2026). Las citas no son compatibles con la salida estructurada, así que se hacen dos pasadas:
    citas primero, esquema después.
  - **Planilla:** se lee **en el navegador**. El LLM solo ve encabezados y estadísticas para decir «esta columna parece la hora de
    escaneo» (C18).
  - **Voz:** se graba con MediaRecorder. La transcripción en español rioplatense con jerga («jaula», «rampa», «flexero») es
    HIPÓTESIS: hay que comparar 2 o 3 opciones con un juego de 30 audios.
- **Cómo se prueba.** AndénBench (C16) con:
  - 20 fotos reales de croquis: al menos 80% correctas al primer intento y 100% después de una confirmación;
  - 10 PDF: cada parámetro extraído con su página correcta.

### C3. Detector de contradicciones antes de simular

- **Qué hace.** Antes de correr nada, cruza lo dicho con la aritmética de la operación. Por ejemplo: «Me dijiste que hay 2.000
  paquetes en el piso y que cada uno tarda 10 minutos en salir. Eso son 12.000 por hora. Antes me dijiste 3.000 por hora: ¿cuál de
  los dos está mal?» (ley de Little). Otros chequeos:
  - capacidad contra demanda (ocupación ≥ 1);
  - balance de flujo;
  - unidades;
  - turnos que no suman;
  - cortes imposibles con las llegadas declaradas.

  Cada contradicción se convierte en **una** pregunta.
- **Por qué es nuevo.** Los copilotos validan sintaxis, no coherencia física. Un analista humano lo hace a ojo y tarde (INFERENCIA).
- **Cómo se construye.** Reglas deterministas del compilador del esquema: Little, conservación, ρ por estación y aritmética de
  turnos. El LLM solo redacta la repregunta. Cuesta microsegundos.
- **Cómo se prueba.** Casos de AndénBench con contradicciones sembradas: se detecta al menos el 95%, con menos de 5% de falsas
  alarmas.

### C4. Dos velocidades: borrador instantáneo y confirmación por simulación

- **Qué hace.** Mientras el usuario habla, un modelo analítico (fluido, Erlang C o Allen-Cunneen por estación, análisis de valor
  medio para redes cerradas) se recalcula en milisegundos. Dibuja el flujo y marca el probable cuello: «Con lo que me contaste, la
  inducción está al 94%». La simulación confirma en segundos. **Si difieren, Andén lo dice y explica por qué**: «La cuenta de
  planilla supone un ausentismo parejo del 5%. Algunos días faltan dos personas y con 4 puestos no llegás».
- **Por qué es nuevo.** Las herramientas para no expertos dan la fórmula; las de expertos dan la simulación. Ninguna muestra las dos
  y su diferencia como aprendizaje (INFERENCIA). Medido en §2: 17 de 21 diferencias, todas para el lado de faltar gente.
- **Cómo se construye.** El compilador genera del mismo esquema las dos representaciones: la red de colas (nivel L0) y las tablas
  del motor (L1 en adelante, ver §4.1). La alarma salta cuando la decisión de las dos no coincide.
- **Cómo se prueba.**
  - El L0 coincide con la teoría en los casos de la batería (V01–V30 de `motor-validacion.md`).
  - Cada diferencia con la simulación lleva una explicación generada que nombra el mecanismo (riesgo discreto, pico, variabilidad).

### C5. Libro de supuestos vivo con incertidumbre doble

- **Qué hace.** Todo modelo trae un **libro de supuestos** en lenguaje llano. Cada supuesto tiene:
  - su procedencia: dato tuyo, medido, referencia o supuesto de la IA con su razón;
  - su rango;
  - su peso en la decisión (C1).

  El resultado lleva **dos semáforos separados**:
  - «Ruido de la simulación: ±1%. Se arregla corriendo más, y Andén lo hace solo.»
  - «Incertidumbre de tus supuestos: ±12%. Se arregla midiendo la tasa de inducción: 15 minutos con el cronómetro.»
- **Por qué es nuevo.**
  - Los incumbentes reportan, en el mejor caso, el intervalo del ruido. La incertidumbre de los datos de entrada queda afuera, aunque
    en una pyme es la más grande (INFERENCIA).
  - Cuantificar la incertidumbre de entrada es un tema conocido en la literatura de simulación (conocimiento general, no
    re-verificado hoy). No encontramos producto que lo muestre así.
- **Cómo se construye.**
  - Monte Carlo de dos niveles en Workers. Afuera se sortean los supuestos dentro de su rango o de su distribución calibrada; adentro
    van las réplicas.
  - La varianza total se reparte entre las dos fuentes.
  - Con pocos supuestos que importan (C1 los filtra), el costo es del orden del tamizado de §2.
- **Cómo se prueba.**
  - Casos sintéticos con incertidumbre conocida: el reparto entre ruido y supuestos sale dentro de ±10% del valor verdadero.
  - Un usuario no experto explica bien qué medir, en una prueba de 3 preguntas.

### C6. Calibración inversa: «no sé el tiempo, pero sé cuánto sale»

- **Qué hace.** Cuando el usuario no sabe un parámetro pero sí un resultado («sacamos 6.000 por turno y quedan 500 sin clasificar»),
  Andén estima el parámetro que lo produce y su incertidumbre:
  - «Tu tasa real de inducción está entre 1.050 y 1.230 por hora.»
  - Si la estimación queda ancha: «Con ese dato no alcanza; medí esto».

  Incluye la **prueba de Turing** de Sargent: se muestran tres días reales y uno simulado, y el usuario tiene que adivinar cuál es el
  simulado.
- **Por qué es nuevo.** La inferencia basada en simulación ya se probó en colas M/G/1 (arXiv 1805.07226). No encontramos
  simuladores comerciales que la ofrezcan (`frontera-ia.md` §2, INFERENCIA).
- **Cómo se construye.** Computación bayesiana aproximada (ABC) por lotes en Workers: se sortean parámetros y se simula. Quedan los
  que reproducen los resúmenes observados (paquetes por hora, pendiente al corte). Con números aleatorios comunes y réplicas cortas
  entra en el navegador para 1 a 3 parámetros. Para más parámetros, un metamodelo (corte 4).
- **Cómo se prueba.** Recupera parámetros escondidos en casos sintéticos: el valor verdadero cae dentro del intervalo creíble del 90%
  en 85–95% de los casos (calibración de la incertidumbre).

### C7. Descubrimiento del proceso desde los escaneos

- **Qué hace.** El usuario suelta la exportación de escaneos del WMS (paquete, evento, puesto, hora) y Andén **descubre el
  proceso**: etapas, recorridos más frecuentes, probabilidades de desvío (NO-READ, manual, devolución), curvas cada 15 minutos y
  tiempos por etapa. Todo queda como supuestos editables.
- **Por qué es nuevo.**
  - Simod (código abierto) descubre modelos de procesos de negocio desde registros, con una debilidad documentada: los tiempos de
    cada actividad.
  - SIMUL8 Business genera simulaciones desde datos de negocio (HECHO, `incumbentes.md`).
  - No encontramos a nadie que lo haga para hubs y depósitos con escaneos (INFERENCIA; no encontrarlo no prueba que no exista).
- **Cómo se construye.**
  - Grafo de «sigue directamente a», variantes y ajuste de distribuciones (lognormal, gamma, Weibull, empírica), con pruebas de
    bondad de ajuste. Todo local.
  - Para separar espera de servicio cuando solo hay un escaneo por etapa, se combina el mínimo entre escaneos con la calibración
    inversa (C6).
  - El LLM solo interpreta los nombres de los eventos.
- **Cómo se prueba.** Registros generados por el propio motor desde un modelo conocido: la estructura recuperada es exacta y los
  tiempos medios quedan dentro de ±5%.

### C8. El ingeniero diseña y corre los experimentos, y traduce el criollo a probabilidades

- **Qué hace.** Muestra el plan antes de correr: «Voy a comparar 4 configuraciones con entre 40 y 160 réplicas pareadas. Tarda unos
  2 minutos en tu compu». Además:
  - Traduce metas blandas en restricciones con probabilidad y las confirma en frecuencias: «¿"Casi nunca perder el corte" es 1 día
    de cada 20 o 1 de cada 100?».
  - Detecta si el estudio es de un turno o de régimen permanente.
  - Calcula el calentamiento sobre el promedio de réplicas.
  - Avisa el costo de la precisión antes de correr: al 90% de ocupación, ±1% en la cola pide 16,2 millones de tiempos de servicio
    simulados (`motor-validacion.md` §4.4).
  - Cierra con selección del mejor con garantía (Kim y Nelson), con la zona de indiferencia en pesos.
- **Por qué es nuevo.**
  - FlexSim 2027 replica «hasta lograr la confianza» al optimizar.
  - Simio trae Kim y Nelson, pero para el calentamiento aconseja «mirar los gráficos» (HECHO, `motor-validacion.md` §1).
  - Nadie lo hace por defecto, explicado y conversado.
- **Cómo se construye.** La capa 3 de la API de `motor-validacion.md` §8.3 (`experimento`, `comparar`, `optimizar`). El LLM solo
  llena sus argumentos con herramientas estrictas: `strict: true` garantiza que la entrada cumpla el esquema (HECHO, documentación de
  la API).
- **Cómo se prueba.** Cobertura de los intervalos entre 93% y 97% en la batería S01–S03, y KN elige el mejor verdadero en al menos
  el 95% de los casos sintéticos con diferencia mayor que δ.

### C9. Explicación calculada, citas verificadas y el peor día narrado

- **Qué hace.**
  - **El «por qué».** Descompone el tiempo de ciclo (espera, proceso, bloqueo, hambre, falla). Busca el cuello dinámico con el
    método del período activo (Roser, WSC 2002) y calcula contrafactuales con la misma aleatoriedad: «+1 persona en inducción: −22%
    ± 3% de tiempo de ciclo, 40 réplicas, experimento E-14». Si hay varias causas, una atribución tipo Shapley reparte el efecto.
  - **El peor día.** Detectores deterministas recorren la traza (rampa llena, cola sobre el umbral, pausa con cola, falla,
    recirculación) y arman una línea de tiempo de momentos. El reproductor salta a cada uno con un subtítulo: «10:12, la rampa 14 se
    llena y empieza la recirculación». Se exporta como video para WhatsApp.
- **Por qué es nuevo.** Siemens anuncia los cuellos automáticos como «meta futura». Las explicaciones contrafactuales sobre
  simulación logística casi no tienen literatura (`frontera-ia.md` §4).
- **Cómo se construye.** El LLM escribe el memo como JSON: cada frase con sus afirmaciones (valor, unidad, referencia al resultado,
  tipo). Un **verificador de afirmaciones** controla tres cosas:
  1. que el valor exista en el almacén de resultados y coincida con el redondeo;
  2. que el sentido de la frase coincida con el signo («baja», «sube»);
  3. que «la diferencia es real» solo aparezca si el intervalo excluye el cero.

  Si una frase falla, se re-pide una vez. Si vuelve a fallar, se muestra la frase de plantilla. El video sale con MediaRecorder sobre
  el canvas (`tecnologia-web.md` §8.3).
- **Cómo se prueba.**
  - En 100 memos generados, 0 cifras sin cita y 0 sentidos invertidos (prueba automática).
  - Usuarios no expertos responden bien 4 de 5 preguntas sobre «por qué».

### C10. Escalera de fidelidad: más detalle solo donde la abstracción cambia la decisión

- **Qué hace.** Arranca con el nivel más simple que alcanza (§4.1). Cuando el cuello cae en un bloque abstraído, la IA propone
  refinarlo: «Tu sorter está modelado como una tasa. Los sorters con inducción manual rinden entre 40% y 70% de su diseño, según un
  proveedor. ¿Lo modelo con bandejas, huecos y recirculación? Puede mover el resultado». Corre la versión refinada **solo de ese
  subsistema**. Si la decisión cambia, la conserva; si no, la descarta y lo dice.
- **Por qué es nuevo.** Los incumbentes dan un nivel por objeto y lo elige el usuario. Fidelidad mixta («física solo donde
  importa») es el hueco 7 de `incumbentes.md` §6.
- **Cómo se construye.** Cada bloque de la biblioteca trae varias implementaciones (tasa, cola, mecanismo) con la misma interfaz de
  puertos. El compilador cambia una por otra. La prueba de equivalencia exige que con carga baja las dos den lo mismo.
- **Cómo se prueba.** Reproducir con el modelo de mecanismo la caída de 8.640 a 7.338 paquetes por hora del ejemplo de oskon.com.tr
  (`realismo-logistico.md` §2.3), con factores acoplados que la multiplicación no ve.

### C11. Reglas evolucionadas, legibles y a prueba de suerte

- **Qué hace.** El usuario elige una regla de su operación: orden de picking, armado de olas, asignación de muelles, prioridad de
  inducción o slotting. Andén toma la regla actual como semilla. El simulador hace de juez, con números aleatorios comunes, y un LLM
  propone variantes. Sale **una regla que el jefe entiende y aplica mañana**, con la mejora y su intervalo, probada en días que no
  se usaron para buscarla.
- **Por qué es nuevo.** FM Logistic mejoró 10,4% su ruteo de picking con AlphaEvolve: más de 15.000 km menos por año (HECHO
  autoinformado, 26-03-2026). Lo hizo con Google y un equipo propio. Nadie lo empaqueta para pymes.
- **Cómo se construye.**
  - Las variantes se escriben en un lenguaje de reglas acotado (si/entonces sobre corte, destino, cola, antigüedad) con penalidad
    por complejidad, para que sigan siendo legibles. Corren en Workers.
  - Cierre con KN y validación en días reservados: un evaluador con pocas réplicas sobreajusta al ruido (`motor-validacion.md` §6.3).
  - El LLM va en la nube o con la clave del usuario. ESTIMACIÓN de costo por corrida evolutiva: 200 variantes × ~3.000 tokens de
    entrada y 1.000 de salida ≈ USD 0,16 con Haiku 5.5 y ≈ USD 3,2 con Sonnet 5.5 (precios en caché del 06-10-2026).
- **Cómo se prueba.** Al menos 5% de mejora sobre la mejor regla clásica en 3 casos públicos, sostenida en los días reservados
  (criterio de `frontera-ia.md`).

### C12. Abogado del diablo automático

- **Qué hace.** Antes de recomendar, Andén ataca su propia recomendación:
  - cada supuesto en su extremo malo;
  - combinaciones;
  - el pico de evento (Andreani proyecta pasar del 20% al 50% de uso en picos, ×2,5);
  - fallas del equipo crítico;
  - un día con dos faltas.

  Lo reporta así: «La recomendación aguanta 7 de 9 estreses. Cae si el pico supera ×2. Con 6 puestos aguanta los 9 y cuesta $X más
  por mes».
- **Por qué es nuevo.** Las herramientas entregan el escenario pedido; ninguna busca dónde se rompe la propia recomendación
  (INFERENCIA). Es la regla del holding de «capacidad de decir no» aplicada a la operación.
- **Cómo se construye.** El generador de estrés sale del libro de supuestos (C5). Las corridas se hacen en Workers con números
  aleatorios comunes, y la alternativa robusta, con el mismo optimizador.
- **Cómo se prueba.** En casos sintéticos con una debilidad sembrada, la encuentra al menos el 90% de las veces.

### C13. El modelo como software: ramas, pruebas que escribe la IA y diff legible

- **Qué hace.**
  - Cada escenario es una rama: un conjunto de parches sobre el modelo base.
  - Lo que el usuario dijo como regla («el corte de las 22 h no se pierde más de 1 día de cada 20») se vuelve una **prueba de KPI**
    que corre en cada cambio.
  - El diff se lee así: «+2 inductores: +11% de paquetes por hora (IC 95%: +8% a +14%); la prueba del corte pasa».
  - Las propuestas de la IA aparecen como **fantasma** sobre el plano y se aceptan o se descartan con un toque.
- **Por qué es nuevo.** Git llegó a AnyLogic (2024), Emulate3D (2025) y JaamSim. Pruebas automáticas solo tiene Emulate3D, y son
  para PLC (HECHO, `incumbentes.md`). Nadie hace «integración continua de operaciones».
- **Cómo se construye.** El documento del modelo es versionado y cada comando produce un parche JSON (RFC 6902), como propone
  `tecnologia-web.md` §7. Hay pruebas rápidas (borrador L0 y pocas réplicas) en cada edición y completas al pedir. Se puede exportar
  como texto para Git.
- **Cómo se prueba.** Un cambio que rompe un KPI se detecta en menos de 2 s en la prueba rápida, con 0 falsas alarmas en 50
  cambios neutros.

### C14. Gemelo de decisiones vivo

- **Qué hace.** Cada semana el usuario suelta la planilla nueva o la exportación del WMS. Andén recalibra con C6 y C7 y compara:
  - «Tu tasa de inducción bajó 8% en tres semanas.»
  - «Con el volumen proyectado del viernes, el corte se pierde en 3 de cada 10 días.»
  - «Propuesta: sumar una persona de 14 a 16 h.»
- **Por qué es nuevo.** Los gemelos «grandes» (NVIDIA Mega, Siemens Digital Twin Composer) piden sensores, robots y placas de miles
  de dólares, y siguen en vista previa o en acceso temprano (HECHO, `frontera-ia.md` §2). El gemelo útil para la pyme es de
  **decisiones**, alimentado con lo que ya tiene.
- **Cómo se construye.** Todo local, cuando el usuario abre la app. Para avisos programados hay dos caminos:
  - su propio agente por MCP, con costo cero para Andén;
  - un resumen por correo desde una función programada, solo en el plan Equipo y con datos que el usuario elige subir (HIPÓTESIS
    de demanda).
- **Cómo se prueba.** En un piloto, error de predicción semanal menor que 10% (criterio de `frontera-ia.md` §8).

### C15. Andén para agentes: el agente del usuario paga sus tokens

- **Qué hace.** Las mismas herramientas que usa el ingeniero interno quedan abiertas para:
  - **MCP local:** `npx @anden/mcp`, el mismo motor en TypeScript dentro de Node.
  - **MCP remoto liviano:** valida, compila y devuelve un enlace al modelo, sin simular en el servidor.
  - **WebMCP**, para agentes del navegador.

  Claude, ChatGPT o Gemini pueden armar, correr y explicar un modelo, y leer el libro de supuestos y el acta de la entrevista.
- **Por qué es nuevo.** Simio abrió MCP, pero sobre escritorio caro. El directorio de ChatGPT publica plugins armados sobre MCP con
  API de cobro (HECHO, `mercado.md`).
- **Cómo se construye.**
  - En Cloudflare Workers gratis hay 10 ms de CPU por pedido (HECHO, `tecnologia-web.md` §9): por eso el remoto no simula. Simulan
    el MCP local o el navegador de quien abre el enlace.
  - WebMCP está en prueba de origen en Chrome 149–156 (HECHO, fuente secundaria) y queda como mejora, nunca como requisito.
- **Cómo se prueba.** El modelo de referencia del hub se arma desde Claude Code y desde otro agente sin intervención humana, y pasa
  la verificación.

### C16. AndénBench y entrevistados sintéticos: medir a la IA en vez de confiar en ella

- **Qué hace.** Es un banco público de casos de operación con un modelo y una decisión verdaderos:
  - **Primera tanda:** 40 casos en 4 formatos, 10 de cada uno: texto, voz, foto de croquis, y PDF o planilla. Las grabaciones las
    pone una persona; las fotos, el fundador o usuarios voluntarios.
  - **Métricas:** que el modelo compile, que la estructura sea correcta, el error de cada parámetro, **la misma decisión que la
    referencia**, cantidad de preguntas y contradicciones detectadas.
  - **Entrevistados sintéticos:** un LLM hace de jefe de hub con la operación escondida en un JSON y una personalidad (sabe o no
    sabe, se contradice, habla en criollo). El ingeniero de Andén lo entrevista y se puntúa solo.
- **Por qué es nuevo.** No encontramos un banco público de LLM para modelos logísticos (`frontera-ia.md` §10). Publicarlo hace dos
  cosas a la vez:
  - le da a Andén la autoridad de quien define la vara, como «Andén Verificado» para el motor;
  - permite elegir **el modelo de lenguaje más barato que pasa**: Haiku contra Sonnet.
- **Cómo se construye.** Casos en el repositorio y corredor en Node.
  - Las corridas de desarrollo pueden hacerse dentro de las sesiones de Claude Code del plan Max, sin costo de API (INFERENCIA).
  - Las corridas con la API real cuestan dinero y necesitan el OK del fundador (regla 8). ESTIMACIÓN: 40 casos × 15 turnos × 2
    agentes × ~15.000 tokens ≈ 18 millones de tokens, o sea USD 2–5 por corrida con Haiku 5.5 y USD 20–40 con Sonnet 5.5 como
    entrevistador.
- **Cómo se prueba.** Es la prueba. Se corre en cada cambio de prompt o de modelo, y una regresión de más de 2 puntos bloquea el
  cambio.

### C17. Tutor de método (Andén Aula)

- **Qué hace.**
  - Con el modelo del propio alumno, muestra la teoría al lado: Little, Erlang C, por qué el pico de carga llega después del pico de
    llegadas (59 minutos en el caso senoidal de `motor-validacion.md` §4.5).
  - El tutor hace preguntas socráticas: «¿Por qué creés que duplicar el sorter no cambió nada?».
  - El docente arma una consigna en minutos.
  - La corrección es automática: la receta del trabajo práctico se re-corre bit a bit y se comprueban sus invariantes.
- **Por qué es nuevo.** FlexSim está en más de 400 universidades con libro gratis y Simio en más de 500 (HECHO, `mercado.md`).
  Ninguno corrige solo ni enseña método conversando, y menos en español.
- **Cómo se construye.** Reutiliza C3, C4, C8 y C9 con otro tono. Las recetas reproducibles vienen de `motor-validacion.md` §3.
- **Cómo se prueba.** Una cátedra lo usa un cuatrimestre (corte de P2 de sep-2027) y la corrección automática coincide con la del
  docente en al menos el 90% de los trabajos.

### C18. Privacidad por diseño: la planilla nunca viaja

- **Qué hace.** Las filas de la planilla, los nombres de clientes y los costos nunca van al LLM. El LLM ve el esquema del modelo,
  estadísticas agregadas y los encabezados de columna. Hay además:
  - un anonimizador para publicar modelos en la galería (escala volúmenes, renombra destinos y redondea costos);
  - opción de LLM local en escritorio (WebLLM) para mapear columnas;
  - clave propia (BYOK).

  No se guarda ningún dato personal (Ley 25.326).
- **Por qué es nuevo.** Siemens ofrece «tu propio LLM» para empresas que no quieren mandar datos afuera (HECHO). Andén lo resuelve
  por arquitectura, para todos y gratis: **el cálculo y los datos ya están en el dispositivo**.
- **Cómo se construye.** La frontera entre lo que va y lo que no va al LLM es una lista blanca de campos en el orquestador. Los PDF
  y las fotos solo se envían con permiso explícito y con un aviso de qué sale.
- **Cómo se prueba.** Una prueba automática intercepta cada pedido al LLM en 100 sesiones sintéticas: 0 filas de planilla y 0
  valores monetarios crudos.

### C19. Plan de medición y cronómetro en el teléfono

- **Qué hace.** Cuando un supuesto pesa en la decisión y el usuario no lo sabe, Andén arma un **estudio de tiempos de 15 minutos**:
  qué medir, dónde pararse y cuántas observaciones hacen falta para la precisión que pide la decisión.
  - El tamaño sale de n ≈ (1,96 · CV / ε)². Con CV 0,6 y ±15%, unas **61 inducciones**, o sea 3 minutos a 3 s cada una (cuenta).
  - El teléfono se vuelve **cronómetro**: un toque por paquete inducido. Los datos entran directo al modelo con la procedencia
    «medido por vos, 17-10, 62 observaciones», con la distribución ajustada.
- **Por qué es nuevo.** Ningún simulador cierra el lazo con la realidad así de barato. Los incumbentes suponen que los datos ya
  existen, y el 10–40% del tiempo de un proyecto se va en conseguirlos (INFERENCIA).
- **Cómo se construye.** Una página de captura sin conexión (PWA) y el ajuste local. La regla de tamaño se ajusta a la métrica que
  usa la decisión.
- **Cómo se prueba.** Con datos medidos así, el intervalo del supuesto se achica lo previsto y la decisión se estabiliza (casos
  sintéticos primero; después, un usuario real).

---

## 4. El modelo de simulación

### 4.1 Paradigmas: una escalera de fidelidad bajo un solo calendario

Todo corre sobre un calendario de eventos discretos con orden total. La clave es tiempo, fase, prioridad y secuencia
(`motor-validacion.md` §2). La IA elige el escalón según la decisión (C10).

| Escalón | Qué representa | Cómo se calcula | Costo (referencia medida o estimada) | Para qué lo usa la IA |
|---|---|---|---|---|
| **L0 · Analítico** | Red de colas y modelo fluido: ocupación, espera aproximada, cuello probable | Erlang C, Allen-Cunneen, Kingman, análisis de valor medio, acumulado fluido | Microsegundos | Borrador mientras se habla, alarma (C4), filtro de layouts candidatos |
| **L1 · Flujo** | Estaciones con capacidad y turnos, colas, rutas con probabilidad, fallas por tiempo medio entre fallas y de reparación | Bloques estándar compilados a un camino rápido de arreglos tipados | 1,9–2,1 millones de paquetes por segundo en un hub de 3 etapas (HECHO medido) | Tamizado de valor de la información, optimización, riesgo |
| **L2 · Personas y reglas** | Agentes con estado: antigüedad, fatiga, pausas, ausentismo, polivalencia, reglas de asignación; lógica a medida | Procesos como generadores (capa 2) | 4,7 veces más caro por paquete que L1 (HECHO medido) | Dotación, temporarios, pausas, reglas |
| **L3 · Mecanismo** | Sorter con bandejas, paso, ventana de desvío y recirculación; cintas con acumulación; transelevadores; autoelevadores y AGV con reservas de tramos; picking con recorridos sobre el grafo del plano; rutas con servicio por parada | Cinemática cerrada (perfil trapezoidal, cruces de umbral exactos), sin física | Medido solo en interpolación: 1,1 ms por cuadro con 100.000 bultos | Cuando el cuello es un equipo o un recorrido |
| **L4 · Espacio fino** | Congestión de personas en pasillos, cruces | Islas de paso fijo que laten solo mientras hay actividad | Sin medir | Solo si un caso lo pide |
| **Flujo continuo por tramos** | Granel, tanques, cupos, tasa discreta (estilo ExtendSim) | Nivel lineal entre eventos; el cruce de umbral se agenda exacto | Sin medir (la prueba K04 tiene su valor esperado: 5,6667 min) | Cintas a granel, paquetes por minuto cuando el individuo no importa |

### 4.2 Objetos de la biblioteca logística (primera versión)

| Familia | Bloques | Mecanismo y parámetros clave (con fuente en `realismo-logistico.md`) |
|---|---|---|
| Demanda | Curva de pedidos cada 15 minutos; curva de llegadas físicas; troncales por turno con adelanto o atraso; multiplicadores de evento (Hot Sale, CyberMonday) | Poisson no homogéneo exacto, sin «tasa constante por hora». Hot Sale 2026: hora pico de 13 a 14 h del primer día. Pico de Andreani ×2,5 (20% → 50% de uso) |
| Patio y muelles | Playa con capacidad, turnos de camiones, asignación de muelle, descarga a granel o paletizada | Granel contra paletizado: de 2 a 4 veces más lento (Supervalu: 142 contra 62 minutos por camión) |
| Hub | Singulación, inducción (persona o robot), lectura, NO-READ y manual, sorter (tilt tray, cross belt, zapatas, robots), recirculación, rampas, contenedores, olas y cortes | Inducción sostenible ≈ 1.600 por hora por puesto y techo ≈ 2.250; lectura de 98,5% a 99,9%; 40–70% de uso del diseño con inducción manual; Correo Monte Grande ≈ 690 por hora por puesto |
| Depósito | Recepción, ubicación, rack, reposición, picking (por zona, ola, lote, mercadería a la persona), consolidación, embalaje, despacho | El recorrido es ≈ 50% del picking; flow rack: picking −4,6% y reposición +38,65%; WERC «mejor de su clase»: 70 líneas o más por persona-hora |
| Equipos automáticos | Transelevador, shuttle, AMR, puertos AutoStore | Ciclo por cinemática con la lógica de FEM 9.851/9.860 (documentos pagos, a comprar en el corte 3); tasas publicadas solo como control |
| Vehículos internos | Autoelevador, reach truck, zorra, AGV | Velocidad de 11 a 14,5 km/h y elevación de 0,28 a 0,8 m/s (fichas); red de caminos con A*; reserva de tramos por ventana de tiempo |
| Última milla | Ruta con paradas por tipo (edificio, casa, comercio), servicio, intento fallido, re-entrega que vuelve al hub mañana | En Amazon, el servicio es el 56% del tiempo de ruta (≈109 s por parada); fallidas de 2,8% a 33% como distribución; la re-entrega falla más del doble |
| Personas | Operario, temporario, supervisor, chofer | Ver §4.3 |
| Fallas | Reloj por calendario o por marcha; al fallar: reanudar, reiniciar o volver a sortear | Semántica explícita (`motor-validacion.md` §2.3) |
| Costos | Costo por hora (convenios), espacio, equipos, índices mensuales | Conectados a las calculadoras v0 (FADEEAC, CEDOL, CCT 40/89 y 130/75) |

### 4.3 Personas: el cuello más común y el menos modelado

- **Productividad de cada persona** = base × aprendizaje (antigüedad) × fatiga (tiempo desde la última pausa) × condición (frío,
  calor, peso). INFERENCIA de diseño (`realismo-logistico.md` §6).
- **Aprendizaje:** ley de Wright con cociente de progreso editable (b = 0,75–0,90). Calibración por defecto con Loske y Klumpp
  (IFAC 2020): los ingresantes pasan de 0,46 a 0,88 de eficiencia en ~9 semanas, contra 0,80–0,95 de los experimentados. Un Hot Sale
  dura 3 o 4 días: la dotación de pico calculada con la productividad de planta **se queda corta** (INFERENCIA, confianza alta).
- **Fatiga y pausas:** modelo de acumulación y recuperación (Jaber, Givi y Neumann, usado en WSC 2022). Las pausas son eventos que
  bajan la capacidad de la línea.
- **Ausentismo:** por persona y por día. El tope «aceptable» del 5% (ADRHA) sirve como ancla y el valor por sector se toma de la
  EIL. Que el ausentismo suba los lunes es HIPÓTESIS sin fuente. **Reemplazo y polivalencia** son reglas explícitas, porque cambian
  la decisión (§2).
- **Turnos, horas extra y temporarios con fecha de ingreso**, para responder «¿cuánta gente y desde cuándo la entreno?».

### 4.4 Datos: cada parámetro viaja con su procedencia

Se extiende el formato de `apps/anden/js/referencias.js` y de `realismo-logistico.md` §1. Cada parámetro guarda:
- valor, unidad y distribución;
- rango válido;
- tipo (HECHO, ESTIMACIÓN, MEDIDO o SUPUESTO_IA);
- fuente (URL, archivo y celda, página de PDF, recuadro de una foto, id de una frase del acta);
- fecha;
- peso en la decisión (C1).

La interfaz pinta distinto lo que no es dato del usuario. Reglas de licencia:
- Del dataset de Amazon (CC BY-NC) se citan estadísticas, nunca se incrusta.
- El «85% de OEE de clase mundial» no se usa: no tiene fuente.

### 4.5 Nivel de realismo: qué modela, qué abstrae y qué no hace

| Andén modela con mecanismo | Andén abstrae (a propósito) | Andén no hace |
|---|---|---|
| Bandejas, huecos y recirculación del sorter; personas con aprendizaje, fatiga y faltas; recorridos de picking sobre el plano; cinemática de equipos; lazo de re-entregas; cortes y olas | Física de contacto (rebotes, apilado): cinemática cerrada en su lugar; peatones con fuerzas sociales (solo islas a demanda) | Emulación de PLC, sensores simulados, entrenamiento de robots, fotorrealismo de Omniverse (terreno de NVIDIA y Siemens, con hardware que el usuario no tiene) |

### 4.6 El esquema: un modelo hecho para que lo escriba y lo verifique una IA

El modelo es un **documento declarativo y tipado** (JSON con esquema publicado). Se puede ver como YAML. Además de la estructura,
guarda lo que una IA necesita para razonar sobre él. Ejemplo resumido (INFERENCIA de diseño):

```yaml
esquema: anden/1
decision:                      # paso 1 del estudio: qué se decide y cómo se juzga
  tipo: dotacion_por_turno
  variables: { puestos_induccion: entero(2, 16) }
  meta: { minimizar: costo_turno }
  restricciones:
    - { probabilidad: "termina_antes_del_corte", al_menos: 0.90, dicho_como: "casi nunca perder el corte", acta: u07 }
  indiferencia: { costo_mes: 50000 }        # ARS
estructura:                    # grafo de bloques y puertos (lo que dibuja el editor)
  bloques: [troncales, descarga, induccion, lectura, manual, sorter, rampas, despacho]
parametros:
  induccion.tasa:
    valor: { lognormal: { media: 1200, cv: 0.6 } }   # paquetes/h por puesto
    tipo: SUPUESTO_IA
    fuente: { referencia: "oskon.com.tr, 1.600/h sostenible (diseño); Correo Monte Grande ≈ 690/h" }
    rango_incierto: [800, 1600]
    peso_en_decision: alto     # calculado por el tamizado (C1); vuelve a la entrevista
  personas.ausentismo:
    valor: 0.05
    tipo: ESTIMACIÓN
    fuente: { url: "https://argentina.gob.ar/sites/default/files/eil_ausentismo_ficha_metodologica.pdf", fecha: 2026-10-17 }
    pregunta_pendiente: "¿Cuando falta alguien, lo cubrís?"
supuestos:                     # el libro de supuestos, en llano, confirmable
  - { id: S3, texto: "Las troncales llegan con hasta 20 minutos de atraso", confirmado: false, peso_en_decision: bajo }
pruebas:                       # escritas por la IA desde lo que dijo el usuario (C13)
  - { kpi: prob_perder_corte, max: 0.05, origen: u07 }
  - { invariante: "ningún paquete sale antes de entrar" }
escenarios:                    # ramas = conjuntos de parches
  mas_un_puesto: [ { op: replace, path: /decision/fijar/puestos_induccion, value: 6 } ]
acta: anden-acta/u01..u23      # la entrevista es parte del modelo
```

**Por qué así:** el esquema es la única fuente. La entrevista, la foto, la plantilla, el editor, el agente externo y el tutor
escriben ahí, y un compilador rechaza lo inválido antes de que exista un número (INFERENCIA, consistente con los seis informes).

---

## 5. Arquitectura técnica

### 5.1 Principio: el agente corre en el navegador del usuario

Lo que tradicionalmente es «servidor» (el agente, las herramientas, el motor, los datos) vive en el dispositivo. En la nube quedan
tres piezas mínimas:
1. alojamiento estático (Cloudflare Pages, porque GitHub Pages prohíbe el uso comercial);
2. una **función proxy de IA** que guarda la clave de Andén, mide los créditos de cada plan y transmite la respuesta;
3. la firma de licencias Ed25519 que la app verifica sin conexión (`tecnologia-web.md` §9).

Con clave propia (BYOK) o con el agente del usuario por MCP, ni siquiera el proxy interviene. La API de Claude acepta llamadas
directas desde el navegador con un encabezado de acceso explícito. Es conocimiento previo de 2024, **no verificado hoy**: hay que
confirmarlo en la documentación antes de construir.

### 5.2 Diagrama

```
 NAVEGADOR DEL USUARIO
 ┌──────────────────────────────── hilo de la interfaz ────────────────────────────────┐
 │ conversación (texto, voz, archivos) · editor 2D con fantasmas · reproductor 2D/2,5D │
 │ vista 3D a demanda · modo decisión · libro de supuestos · memo · cronómetro         │
 │                         ▲                         │                                 │
 │       ORQUESTADOR DEL ESTUDIO (máquina de estados del método, §5.4)                 │
 │       ├─ elige la próxima pregunta con el tamizado (no con el LLM)                  │
 │       ├─ llama al LLM solo para redactar, interpretar y proponer parches            │
 │       └─ verificador de afirmaciones · lista blanca de lo que sale (C18)            │
 └──────────────┬──────────────────────────────────────────────────┬───────────────────┘
                │ herramientas (misma API para la interfaz, el LLM │ y MCP)
 ┌──────────────▼──────────── WEB WORKERS (sin DOM, 1 por núcleo) ──┴──────────────────┐
 │ compilador (esquema → L0 + tablas) · motor (eventos, azar y matemática propios)     │
 │ cinemática · experimentos (réplicas, CRN, KN, MSER) · tamizado de valor de la       │
 │ información · calibración inversa (ABC) · descubrimiento de procesos · explicador   │
 │ (período activo, contrafactuales, Shapley) · detectores de momentos · evolutivo     │
 └──────────────┬──────────────────────────────────────────────────────────────────────┘
                │ traza columnar transferida (no objetos)
 almacén: IndexedDB (documento + parches + acta) · OPFS (trazas) · archivo .anden (zip)
 ───────────────────────────────── internet (mínimo) ─────────────────────────────────
  Cloudflare Pages (estático) · función proxy de IA + créditos · firma de licencias
  LLM: Haiku 5.5 / Sonnet 5.5 por el proxy, o clave propia, o el agente del usuario por MCP
```

### 5.3 Módulos y límites

| Módulo | Hace | Corre en | No puede |
|---|---|---|---|
| `esquema/` | Tipos, validación, migraciones de versión, fichas de bloque | Interfaz, Workers y Node | Conocer la vista o el LLM |
| `compilador/` | Esquema → red L0 + tablas tipadas; detector de contradicciones (C3) | Worker | Usar azar |
| `motor/` | Calendario, flujos de azar con nombre, matemática determinista, bloques compilados, generadores | Worker y Node | DOM, `Math.random`, `Date`, `Math.log` nativo |
| `experimentos/` | Réplicas, precisión objetivo, calentamiento, comparación pareada, KN, optimización | Workers | Agregar en orden de llegada (se suma por índice) |
| `voi/` | Tamizado de la decisión, regret en pesos, regla de corte de la entrevista (C1) | Workers | Preguntar: solo devuelve un ranking |
| `calibracion/` | ABC, ajuste de distribuciones, descubrimiento de procesos (C6, C7) | Workers | Mandar filas al LLM |
| `explicador/` | Descomposición, período activo, contrafactuales, detectores de momentos (C9) | Workers | Redactar |
| `ingeniero/` | Orquestador del estudio, herramientas, verificador de afirmaciones, lista blanca | Interfaz | Escribir el modelo fuera de los parches; mostrar cifras sin cita |
| `ia/` | Cliente del LLM (proxy, BYOK o local), enrutamiento por tarea, caché de prompts | Interfaz | Ejecutar herramientas por sí mismo |
| `editor/`, `vista2d/`, `vista3d/`, `reproductor/` | Como en `tecnologia-web.md` §11, más fantasmas y saltos a momentos | Interfaz | Pedirle cosas al motor en cada cuadro |
| `almacen/` | Documento por versión, parches, acta, trazas, `persist()`, exportar | Interfaz | `localStorage` para modelos |
| `mcp/` | Servidor local (`npx`), remoto liviano y WebMCP con las mismas herramientas | Node, Worker de Cloudflare, página | Simular en el servidor |

### 5.4 El ingeniero: un método con estados, no un chat

El orquestador es una **máquina de estados del estudio** (pasos de §1.2):
1. decisión;
2. borrador;
3. entrevista (bucle de tamizado, pregunta y respuesta);
4. libro de supuestos;
5. confirmación;
6. verificación;
7. piloto;
8. plan de experimentos;
9. corridas;
10. abogado del diablo;
11. memo;
12. compartir;
13. vigilancia.

En cada estado, el LLM recibe **solo las herramientas de ese estado** (herramientas estrictas, `strict: true`) y un resumen del
modelo, no el modelo entero.

**Herramientas** (la misma lista que expone MCP):

| Herramienta | Qué devuelve | ¿Determinista? |
|---|---|---|
| `leer_modelo`, `leer_supuestos`, `leer_acta` | Vistas resumidas del documento | Sí |
| `proponer_parche` | Un parche validado por el compilador (o los errores) | Sí (el contenido lo propone el LLM) |
| `faltantes`, `contradicciones` | Qué falta según las fichas de bloque; qué no cierra | Sí |
| `ranking_preguntas` | Tamizado del valor de la información con su regla de corte | Sí (estocástico con semilla) |
| `referencia(parametro)` | Valor sugerido con fuente, fecha y tipo | Sí |
| `ajustar(columna)`, `descubrir_proceso(archivo)` | Distribuciones y grafo, sin que el LLM vea filas | Sí |
| `plan_experimento`, `correr`, `comparar`, `optimizar`, `estresar` | Resultados con id, intervalo y receta | Sí |
| `explicar(kpi)`, `contrafactual(cambio)`, `momentos(replica)` | Descomposición, cuellos, efectos con intervalo, línea de tiempo | Sí |
| `plan_medicion(parametro)` | Protocolo y tamaño de muestra (C19) | Sí |
| `costo(escenario)` | Pesos por paquete y por mes con los índices del mes | Sí |

**Enrutamiento de modelos** (ESTIMACIÓN; se ajusta con AndénBench, C16):

| Tarea | Modelo | Por qué |
|---|---|---|
| Turnos de entrevista, mapeo de columnas, subtítulos del peor día | Haiku 5.5 | Barato (USD 0,10 / 0,50 por millón de tokens de entrada y salida, para prompts de hasta 100.000 tokens) |
| Foto del croquis, PDF con citas, memo final, variantes de reglas | Sonnet 5.5 | Visión y razonamiento (USD 2 / 10 por millón) |
| Desarrollo y evaluación del banco | Opus 5.5 solo en desarrollo (USD 4 / 20) | Nunca en el camino del usuario |

Precios: tabla oficial en caché del 06-10-2026. Re-verificar en https://platform.claude.com/docs/en/about-claude/pricing.

**Sin conexión, sin créditos o sin IA:** el orquestador sigue con **formularios** generados desde las fichas de bloque, en el mismo
orden del tamizado. La IA acelera; no es requisito (INFERENCIA de diseño: protege costo, privacidad y disponibilidad).

**Proveedor:** la capa de herramientas no depende del modelo de lenguaje. Cambiar de proveedor es cambiar el cliente de `ia/` y
re-correr AndénBench.

### 5.5 Motor, render y persistencia (lo que se toma de los otros frentes)

- **Motor** en TypeScript «borrable» con arreglos tipados y dos niveles: bloques compilados y generadores.
  - Tiempo entero, desempate fijo, un flujo de azar por fuente (xoshiro128** con saltos, medido a 114 millones por segundo, o
    Philox) y matemática propia para que la huella sea igual en todos los navegadores.
  - Rust a WebAssembly queda para una fase 2, con regla de corte: si un teléfono de gama media no simula un día del hub modelo en
    menos de 1 s (`tecnologia-web.md` §10).
- **Traza columnar transferida** como única interfaz entre el motor y la vista. Pasar 1 millón de eventos como objetos tarda 5,1 s;
  como arreglo tipado transferido, 8 ms (HECHO medido).
- **Vista:** 2D en Canvas propio como base universal (~28.000 elementos por cuadro sin placa de video) y una **isométrica 2,5D en el
  mismo Canvas**, que da profundidad sin WebGL (INFERENCIA de diseño, a medir). El 3D va con three.js r186 (`WebGPURenderer` con
  respaldo WebGL 2) y se carga a demanda.
- **Persistencia:** un documento por versión más parches (IndexedDB: 100.000 objetos como documento en 62 ms, contra 23 s en filas
  sueltas), traza en OPFS y archivo `.anden`. **El acta de la entrevista va dentro del modelo**: la procedencia apunta a frases
  concretas.
- **Safari** borra los datos a los 7 días sin uso: se pide `persist()`, se ofrece instalar la app y se recuerda exportar.

### 5.6 Costos (servidor e IA)

| Rubro | Cuánto | Etiqueta |
|---|---|---|
| Cálculo (simulación, experimentos, tamizado) | 0 para Andén: corre en el dispositivo | INFERENCIA |
| Alojamiento | Cloudflare Pages gratis (500 compilaciones por mes, 20.000 archivos) | HECHO (`tecnologia-web.md`) |
| Proxy de IA y licencias | Cloudflare Workers gratis hasta 100.000 pedidos por día; el proxy casi no usa CPU (espera la respuesta) | HECHO (cupo) / INFERENCIA (consumo de CPU; verificar) |
| Entrevista de 15 turnos (Haiku 5.5) | ~180.000 tokens de entrada (dos tercios en caché) y ~6.000 de salida ≈ **USD 0,01** | ESTIMACIÓN (supuesto: 12.000 tokens por turno; lectura en caché ≈ 0,1× del precio) |
| Foto del croquis (Sonnet 5.5) | ~8.000 de entrada y ~3.000 de salida ≈ **USD 0,05** | ESTIMACIÓN |
| PDF de 10 páginas con citas (Sonnet 5.5) | ~25.000 de entrada (supuesto: 1.500–3.000 tokens por página, a medir con `count_tokens`) y ~3.000 de salida ≈ **USD 0,08** | ESTIMACIÓN |
| Memo de decisión (Sonnet 5.5) | ~20.000 de entrada y ~2.500 de salida ≈ **USD 0,07** | ESTIMACIÓN |
| **Estudio completo** | **USD 0,01** (solo texto, memo con Haiku) a **USD 0,25** (foto, PDF y memo con Sonnet) | ESTIMACIÓN; coherente con los USD 0,005–0,5 de `frontera-ia.md` |

**Lectura para el plan Pro (ESTIMACIÓN):** el caso de P2 supone ~USD 1,5 de IA por usuario Pro por mes. Eso alcanza para unos 6
estudios completos o decenas de estudios solo de texto. Para pasar de ahí: créditos por plan, clave propia sin límite y MCP con el
agente del usuario.

### 5.7 Extensibilidad: cada bloque trae su manual para la IA

Un bloque nuevo (por ejemplo, «puerto AutoStore») es una **ficha** con:
- esquema de parámetros con unidades y rangos;
- implementaciones por escalón (L0, L1, L3);
- pruebas de verificación con valor esperado;
- **preguntas en criollo** con su prioridad previa;
- valores de referencia con fuente;
- plantillas de explicación;
- apariencia 2D y 3D (glTF).

La interfaz, el compilador, la entrevista, la documentación y el tutor salen de la misma ficha: la IA aprende el bloque nuevo sin
reentrenar nada (INFERENCIA de diseño).

Además:
- La lógica a medida (capa 2, procesos en TypeScript) corre en un Worker sin red, con la API determinista y un linter que prohíbe
  `Math.random`.
- Cuando la escribe la IA, tiene que pasar las pruebas del modelo antes de usarse.
- El esquema publicado y abierto (exportar todo, 3D en glTF) es la respuesta a «tu modelo es tuyo» frente a la consolidación de
  los incumbentes (Autodesk, Minitab, ANDRITZ, Aegis).

### 5.8 Seguridad de una app con IA

- **Inyección de instrucciones desde documentos:** un PDF o una planilla pueden traer texto que intente dirigir a la IA. Defensas:
  - el contenido se trata como dato;
  - el LLM solo puede proponer parches que valida el compilador;
  - ninguna herramienta tiene red ni acceso a otros modelos;
  - los cambios se aceptan a mano (fantasma).
- **Lógica escrita por la IA:** se ejecuta en un Worker aislado, sin red, con límites de tiempo y memoria.
- **Licencia:** cualquier control en el navegador se puede saltear. La defensa es lo que necesita del servicio: índices, plantillas,
  IA, sincronización y aula (`tecnologia-web.md` §9).

---

## 6. La experiencia

### 6.1 Minuto 0 a 1: una pregunta y una respuesta

Se abre un enlace, sin cuenta. Hay un solo campo grande, con micrófono, cámara y «soltá un archivo»: **«¿Qué tenés que decidir?»**.
Debajo, plantillas con nombre de problema y no de objeto: «¿Cuánta gente para el Hot Sale?», «¿Me alcanzan los muelles?», «¿Llego
al corte de Flex?». En segundos aparece el borrador L0, dibujado en 2D y animado, con un primer número marcado como borrador.

Ejemplo de diálogo (INFERENCIA de diseño; tono rioplatense):

> **Usuario:** Tengo un hub, entran unos 24.000 paquetes por turno y quiero saber cuántos puestos de inducción poner. El corte es
> 13:30.
> **Andén:** Armé un borrador con la plantilla de hub. Con lo que me contaste, 4 puestos parecen alcanzar *(borrador, sin
> simular)*. Antes de confiar en ese número necesito tres cosas, en este orden, porque son las que cambian la respuesta:
> **1. ¿Cuántos paquetes por hora mete una persona en un puesto, más o menos?** Si no sabés, te propongo 1.200 (rango
> 800–1.600; los proveedores dicen 1.600 sostenible y el Correo de Monte Grande rinde ~690 por puesto). También te puedo armar un
> cronómetro: 3 minutos y lo medís vos.
> **Usuario:** Ni idea, ponele 1.200.
> **Andén:** Dale, queda como supuesto. **2. Cuando falta alguien, ¿lo cubrís con otra persona?** Pregunto porque el ausentismo
> cambia la respuesta más que el pico o el atraso de los camiones.

### 6.2 Minutos 1 a 10: la entrevista que se acorta sola

- Cada pregunta trae su porqué («cambia la respuesta en hasta 2 puestos»).
- Hay botones de «no sé» y «medilo» y referencias con fuente.
- Las contradicciones se resuelven con una pregunta (C3). Las propuestas aparecen como fantasma en el plano.
- Un **medidor de confianza** sube con cada respuesta.
- Andén dice cuándo para: «Ya está. Lo que falta (fatiga, NO-READ, ritmo de manual) no cambia la respuesta».

### 6.3 Minutos 10 a 30: el estudio

1. **Plan de experimentos visible**, corrida con barra de avance y semáforo doble (C5).
2. **Resultado:** «5 puestos. Con 5 terminás antes del corte 97 de cada 100 días (IC 95–98%); con 4, 84 de cada 100 (IC 80–87%).»
   Son los números del modelo de juguete de §2, con 400 réplicas.
3. **Por qué:** contrafactuales en pesos y la descomposición del tiempo de ciclo.
4. **El peor día narrado**, sobre el replay 2D o isométrico.
5. **Abogado del diablo:** «aguanta 7 de 9 estreses».
6. **Memo de una página** con el costo por paquete del mes y los supuestos que más pesan.
7. **Botón «compartir con tu jefe»**: el modo decisión en el teléfono, sin cuenta, con 3 a 5 controles, el cuello y la confianza.
8. **Video para WhatsApp.**

### 6.4 Día 2 en adelante

- El cronómetro para medir lo que importa (C19).
- La planilla de la semana para recalibrar (C14).
- Ramas para probar ideas (C13).
- Avisos cuando cambia la decisión.

### 6.5 El experto

- Editor completo con imantado y unidades reales.
- Escalones de fidelidad a mano.
- Capa 2 en TypeScript y consola de experimentos (diseños factoriales, NOLH, Morris y Sobol validados contra SALib).
- Exportación a Git, API y MCP.
- **Puede anular cualquier decisión de la IA** y ver el acta.
- «Modo sin IA» con formularios.

El experto no pierde nada de lo que ya hace y gana el método automático para lo rápido (INFERENCIA).

### 6.6 Plantillas iniciales

Cada plantilla se publica con su página de validación: contra la teoría y contra los datos públicos que la calibran.

| Plantilla | Decisión que responde | Calibración pública (fuentes en `realismo-logistico.md`) | Corte |
|---|---|---|---|
| **Hub de clasificación con inducción manual** | Puestos por turno, pausas, temporarios, corte | oskon.com.tr, Plus One, Loske y Klumpp, EIL | 1 |
| **Nodo de última milla AMBA (Flex)** | Llego al corte, rutas por ola, re-entregas que vuelven | Flex (cumplimiento en el día > 90%; cortes de 13 a 17 h, extracto), Don Torcuato (1,5 millones por mes, pico de 60.000 por día), Amazon (servicio por parada, solo estadísticas) | 1–2 |
| **Hub con sorter de robots** (tipo Correo Monte Grande) | Robots, puestos e inducción contra salidas | 9.000 por hora, 240 robots, 13 inducciones, 130 salidas | 2 |
| **Hub con cross belt de 2 pisos** (tipo Andreani Pacheco) | Capacidad neta contra nominal, recirculación, rampas | 18.000 por hora y 200 salidas; narrow belt 2 × 4.000 por hora; 20% → 50% de uso en picos | 3 |
| **Dotación Hot Sale con temporarios que aprenden** | Cuántos y desde cuándo entrenarlos | Hot Sale 2026 (13–14 h), Loske y Klumpp, ×2,5 de Andreani | 1 (como escenario del hub) |
| **Depósito pyme de e-commerce** | Picking por zona, ola o lote; slotting; reposición | WERC 2025, recorrido ≈ 50%, flow rack −4,6% / +38,65% | 3 |
| **Cross-dock de supermercado** | Muelles, playa, granel contra paletizado | Supervalu (62 contra 142 minutos de descarga) | 3 |
| **Patio y turnos de camiones** | Turnos, playa, estadía | Hueco de datos argentinos: plantilla con supuestos marcados | 3 |
| **Comparador neutral de automatización** | Manual, AMR, AutoStore o shuttle con la misma demanda | GEODIS/Locus 65 → 98 unidades por hora; AutoStore ≈ 300 picks por hora por puerto; FEM | 4 |
| **Recolección municipal** (Andén Ciudad) | Camiones y recorridos | Dato UBA en la bitácora del 28-09-2026 | 5 |
| **Aula: colas y Little** | Enseñar con el modelo al lado de la teoría | La batería V01–V30 | 1 |

---

## 7. Rigor

### 7.1 Verificación del motor: «Andén Verificado»

La batería de `motor-validacion.md` ya funciona en la maqueta:
- 59 verificaciones exigibles, más 17 informativas y 2 demostraciones de métodos que deben fallar;
- M/M/c hasta 50 servidores, Jackson, MVA, Penny Fab y fuente finita;
- 3 casos publicados por Law que caen dentro de sus intervalos.

Corre en integración continua y se publica. Falta construir:
- R04, la misma huella en Chrome, Firefox y Safari (Playwright instala Firefox y WebKit);
- las pruebas de cinemática K01–K04, la degenerada D01, la metamórfica M01 y el caso C05 de Law.

### 7.2 Verificación de cada modelo, en cada edición

Antes de mostrar un resultado, cada modelo pasa estos controles (`frontera-ia.md` §4.3):
- balance de flujo;
- Little por bloque;
- ocupación menor que 1;
- Erlang C en las estaciones simples;
- prueba de calentamiento y de largo de corrida;
- repetibilidad con la misma semilla;
- sensibilidad mínima de cada parámetro (si un parámetro no mueve nada, es un «cable suelto»);
- **invariantes de traza derivados del esquema**: ningún paquete sale antes de entrar, la cinta no supera su capacidad y nadie
  trabaja en pausa (el patrón de validar trazas contra la especificación, arXiv 2603.03784).

Si un control falla, el número no se muestra y la IA explica qué arreglar.

### 7.3 Validación contra la realidad (Sargent)

- **Validez aparente:** el usuario confirma el libro de supuestos y mira «un lunes típico» en el replay.
- **Datos históricos:** con la planilla, se comparan las predicciones con días que no se usaron para calibrar.
- **Prueba de Turing** (C6).
- **Calibración inversa** cuando falta el dato.

Todo queda en un **informe de validación del modelo** que acompaña al memo.

### 7.4 Estadística por defecto

- Réplicas independientes hasta la precisión pedida. **Nunca** un intervalo de una sola corrida: cobertura real de 8,4% medida, y
  7,2% según Law.
- Calentamiento con MSER-5 sobre el promedio de réplicas, con el gráfico de Welch a la vista.
- Números aleatorios comunes sincronizados por diseño: la varianza de la diferencia baja 34 veces en cambios chicos (medido).
- Media y P90 siempre, y probabilidades.
- Comparación pareada con veredicto llano y KN para cerrar optimizaciones.
- Aviso del costo de la precisión según la ocupación (Whitt).
- **Además, en esta visión:**
  - la incertidumbre de entrada separada del ruido (C5);
  - el **semáforo mira si el intervalo cruza la meta de la decisión** (§2), no solo su ancho;
  - **réplicas secuenciales en el tamizado**: pocas al principio y más solo donde la decisión está en duda.

### 7.5 Evaluación de la IA

AndénBench (C16) se corre en cada cambio de prompt o de modelo. Umbrales iniciales (HIPÓTESIS, a recalibrar):

| Métrica | Umbral para publicar |
|---|---|
| Misma decisión que la referencia | ≥ 90% de los casos |
| Modelos que compilan al primer intento | ≥ 95% |
| Contradicciones sembradas detectadas | ≥ 95% |
| Cifras sin cita en memos | 0 |
| Datos crudos enviados al LLM | 0 |
| Mediana de preguntas en la entrevista | ≤ 8 |
| Costo por estudio | ≤ USD 0,30 |

Pruebas adversariales: PDF con instrucciones escondidas, usuarios que se contradicen, «no sé» a todo (la respuesta correcta es un
plan de medición, no inventar).

### 7.6 Optimización

1. Variables tipadas.
2. Búsqueda bayesiana con ruido o evolutiva.
3. Restricciones con probabilidad.
4. Cierre con KN.
5. Todo con números aleatorios comunes (`motor-validacion.md` §6.3).
6. Evolución de reglas legibles (C11).

El desempeño del optimizador se publica contra **SimOpt** (banco abierto, licencia MIT) con curvas de progreso, que es lo que mira
una cátedra.

### 7.7 Lo que Andén no hace nunca

- Mostrar un intervalo de una sola corrida.
- Mostrar una frase con una cifra sin cita.
- Usar un número sin procedencia.
- Recomendar sin abogado del diablo.
- Usar el «85% de OEE de clase mundial».
- Guardar `Math.random` en el motor.
- Mandar la planilla al LLM.

---

## 8. Roadmap en cortes verticales

Cada corte funciona de punta a punta y se puede mostrar solo. Las fechas son ESTIMACIÓN. Método: el motor de referencia con su
batería de 78 verificaciones salió en un frente de investigación; `motor-validacion.md` §9 estima el motor de producción en 3–4
semanas de trabajo de Claude; las calculadoras v0 salieron en una sesión. Este plan propone **adelantar** el simulador respecto del
gantt de P2 («Contame tu operación» v1 en abr–jul 2027) gracias a Max. El corte de P2 de sep-2027 (500 usuarios por mes o una
cátedra) no cambia. La síntesis tiene que reconciliar las fechas con las otras visiones.

El fundador pidió explícitamente que Claude pruebe la experiencia solo e itere. Por eso cada corte trae **cómo se prueba sin el
fundador**:
- entrevistados sintéticos;
- Playwright en Chromium, Firefox y WebKit;
- estrangulamiento de CPU de Chrome (CDP) como aproximación a un teléfono lento;
- la batería y el banco.

### Corte 1 · «Tu hub en una conversación» (nov-2026 → feb-2027)

**Qué entra, de punta a punta:**
- Motor de producción en TypeScript (núcleo, bloques compilados L1, generadores L2, azar y matemática deterministas) con «Andén
  Verificado» en integración continua: 59 de 59, más R04 en 3 navegadores.
- Plantilla **hub de clasificación con inducción manual**, con NO-READ y manual, sorter L1, rampas, olas y corte, troncales por
  turno y personas con pausas, ausentismo, reemplazo y temporarios. El escenario «Hot Sale con temporarios» viene incluido.
- **Ingeniero v1:** entrevista por texto guiada por la decisión y por el valor de la información (C1), contradicciones (C3), borrador
  L0 más simulación (C4), libro de supuestos (C5 con un solo semáforo, el de ruido, y los rangos a la vista), plan de medición y
  cronómetro (C19).
- Experimentos con precisión objetivo, P90, probabilidad de perder el corte, comparación pareada y KN (C8).
- Explicación calculada con verificador de afirmaciones, peor día narrado y memo en pesos con el costo laboral de la calculadora 3
  (C9). Abogado del diablo con 5 estreses fijos (C12, versión 1).
- Vista **2D y 2,5D isométrica en Canvas**, que anda sin placa de video, con reproductor y rebobinado.
- **Modo decisión por enlace**, con el modelo comprimido en el `#`.
- **MCP local** con las mismas herramientas (C15).
- AndénBench v0 (20 casos de texto) y 30 entrevistados sintéticos (C16).

**Por qué ya es espectacular y no un MVP pobre (INFERENCIA):**
- Ningún incumbente hace hoy, en ninguna versión, el ciclo pregunta-por-valor → supuestos → verificación → decisión con
  probabilidad y en pesos → enlace para el jefe.
- Es profundo donde importa: personas con riesgo discreto, cortes y picos. Es exactamente donde la cuenta de promedios falla 17 de
  21 veces (§2).

**Qué construye Claude:** todo lo anterior. El LLM de producción va por el proxy, con un tope de créditos.

**Cómo lo prueba Claude solo:**
1. La batería en Node y en 3 navegadores.
2. 30 entrevistas sintéticas.
3. Recorridos de Playwright de «primer minuto» y «primer estudio» en 360 px y en escritorio.
4. 100 memos contra el verificador.
5. Tiempos con la CPU estrangulada ×4 y ×6.

**Criterio para mostrarlo:**
- 59 de 59 en 3 navegadores;
- al menos 27 de 30 entrevistas con la decisión correcta;
- 0 cifras sin cita;
- primer estudio en 10 minutos o menos en el recorrido guionado;
- tamizado de 10 supuestos en 30 s o menos en escritorio con 4 hilos.

**Horas del fundador:** 2 a 3 en total.
- Mirar si la plantilla «parece un hub», solo con conocimiento general.
- Revisar las 20 preguntas.
- Aprobar el gasto de API del banco: ESTIMACIÓN de USD 10–50 en el corte.
- Aprobar la publicación.

**Horas de Claude:** ESTIMACIÓN de 6 a 10 semanas calendario de sesiones.

### Corte 2 · «Contámelo como quieras» (mar → may 2027)

- Entrada **multimodal**:
  - foto de croquis con fantasma y escala (C2);
  - PDF con citas por página;
  - voz, con 2 o 3 opciones de transcripción comparadas en 30 audios rioplatenses;
  - planillas y exportaciones de WMS con ajuste de distribuciones y descubrimiento de procesos (C7).
- **Incertidumbre doble** (C5 completo) y **calibración inversa** de 1 a 3 parámetros (C6).
- **Vista 3D** a demanda (three.js) y **video** exportable.
- Plantillas «nodo de última milla AMBA» y «hub con sorter de robots».
- AndénBench con 40 casos en 4 formatos.

**Prueba sin el fundador:**
- fotos y PDF generados (croquis dibujados por script, procedimientos escritos por Claude);
- registros de escaneos generados por el motor desde modelos conocidos.

**Prueba que necesita a alguien:** 10 fotos reales de pizarrón y 10 audios. Los puede aportar el fundador con 1 hora, o
voluntarios.

**Criterio:**
- ≥ 80% de croquis correctos al primer intento;
- estructura exacta y tiempos dentro de ±5% en el descubrimiento de procesos;
- calibración inversa bien calibrada (85–95%).

### Corte 3 · «Más detalle donde importa» (jun → sep 2027; coincide con v1 y Pro de P2)

- **Escalera de fidelidad** (C10) con el sorter L3 (bandejas, ventana de desvío, recirculación, rampa llena) y la reproducción del
  ejemplo de oskon.
- Plantillas de **depósito**:
  - picking con recorridos sobre el plano;
  - slotting con la curva ABC del usuario;
  - olas y reposición, con el costo escondido del flow rack;
  - transelevadores con cinemática (comprar FEM 9.851 y 9.860, con el OK del fundador porque es gasto).
- Plantillas de **cross-dock** y **patio**.
- **Optimizador** con KN y **reglas evolucionadas legibles** (C11), probados en SimOpt y en 3 casos públicos.
- Plan Pro (cobro con *merchant of record*, según `mercado.md`).

**Criterio:**
- ≥ 5% de mejora sostenida en días reservados en 3 casos;
- el sorter L3 reproduce el −15% de oskon con factores acoplados.

### Corte 4 · «El gemelo que no se duerme» (oct → dic 2027)

- **Gemelo de decisiones vivo** (C14) con avisos.
- **Modelo como software** completo (C13): ramas, pruebas de KPI, diff y exportación a Git.
- **Comparador neutral de automatización.**
- Metamodelos para «qué pasa si» instantáneo con banda de incertidumbre.
- Valor de la información con interacciones (Morris y Sobol validados contra SALib).
- Plan Equipo con lectores gratis.

**Criterio:** error semanal menor que 10% en un piloto voluntario (lo consigue la galería o una cátedra, sin venta).

### Corte 5 · «La vara pública» (2028)

- **Andén Aula** completo (C17) con corrección automática.
- **AndénBench público** y «Andén Verificado» en inglés y portugués.
- Galería de modelos y arena de desafíos (de `mercado.md`).
- WebMCP cuando madure.
- Andén Ciudad.

---

## 9. Riesgos y cómo se mitigan

| Riesgo | Señal | Mitigación | Etiqueta |
|---|---|---|---|
| **La IA se equivoca con confianza** (estructura mal entendida, parámetro inventado) | Errores en AndénBench; usuarios que corrigen mucho | El LLM no produce números; compilador, contradicciones, verificación de cada modelo, verificador de afirmaciones, procedencia visible, fantasma que se acepta a mano | INFERENCIA |
| **Los incumbentes copian la entrevista** (AnyLogic ya tiene asistente y navegador) | Anuncios en 2027 | El diferencial es el conjunto: valor de la información, incertidumbre doble, banco público, verticales argentinas, teléfono y precio. Su modelo de licencias de USD 6.000–21.800 les impide regalar el motor (`mercado.md`) | HIPÓTESIS |
| **El teléfono no da** con el tamizado y los experimentos | Recorridos lentos con la CPU estrangulada; medición en 3 teléfonos | Réplicas secuenciales, cálculo mientras el usuario contesta, menos supuestos (C1 filtra), metamodelo (corte 4), «corré esto en la compu» con el enlace, y Rust a WebAssembly con la regla de corte de `tecnologia-web.md` | HECHO medido en escritorio (28 s) / HIPÓTESIS en teléfono |
| **Costo de IA mayor al previsto** o cambio de precios | Créditos que se agotan; facturas del proxy | Haiku por defecto, caché de prompts, clave propia, MCP del usuario, modo sin IA con formularios, tope duro por plan | ESTIMACIÓN |
| **Dependencia de un proveedor de LLM** | Cambios de API o de términos | Capa de herramientas agnóstica, AndénBench para cambiar de modelo con datos, opción local en escritorio | INFERENCIA |
| **Inyección de instrucciones** desde PDF o planillas | Casos adversariales del banco | Contenido como dato, herramientas sin red, parches validados, aceptación manual | INFERENCIA |
| **Privacidad y propiedad intelectual del empleador del fundador** | Cualquier dato que se parezca a su empresa | Plantillas solo con datos públicos y conocimiento general; consulta con un abogado laboral antes del módulo de última milla (P2); nada de código, datos ni nombres de la empresa | HECHO (normas citadas en P2) |
| **Desconfianza por fundador anónimo** | Ingenieros que piden «quién está detrás» | Andén Verificado, AndénBench y validación de cada plantilla públicos: la confianza la da la prueba, no la cara | INFERENCIA (`mercado.md`) |
| **Faltan datos argentinos** (perfil horario, fallidas, tiempos por parada, patio) | Supuestos marcados que pesan en la decisión | La entrevista y el cronómetro los convierten en mediciones; índice comunitario con consentimiento | HECHO (huecos en `realismo-logistico.md` §10) |
| **Transcripción de voz rioplatense mala** con jerga logística | Error de palabra en el juego de 30 audios | Elegir entre opciones con datos; confirmación de lo entendido en el fantasma; el texto queda siempre disponible | HIPÓTESIS |
| **Explosión de alcance** (Claude construye de más) | Cortes que no cierran | Criterio de salida por corte; nada del corte siguiente sin cerrar el anterior; el comité mensual decide | INFERENCIA |
| **Sobreajuste en reglas evolucionadas** | Mejora que no se sostiene en días reservados | KN más validación fuera de muestra, obligatorios | HECHO (riesgo de `motor-validacion.md`) |
| **Safari borra los modelos** | Usuarios de iPhone que pierden trabajo | `persist()`, instalar la app, exportar, sincronización Pro más adelante | HECHO (`tecnologia-web.md` §8.2) |
| **WebMCP o WebGPU cambian** | Notas de Chrome | Siempre como mejora, nunca como requisito | HECHO (estado en prueba) |

---

## 10. Qué tendría que ser cierto y cortes de esta visión

**Qué tendría que ser cierto** (HIPÓTESIS, cada una con su prueba en el corte indicado):

| Qué tendría que ser cierto | Cómo se sabe | Corte |
|---|---|---|
| Una IA guiada por el tamizado llega a la decisión correcta con pocas preguntas | ≥ 27 de 30 entrevistas sintéticas y ≥ 8 de 10 personas reales llegan a un modelo verificado en menos de 15 minutos | 1–2 |
| Ver «qué medir» convence más que ver «un número» | En una prueba con 5 usuarios, al menos 3 usan el cronómetro o el plan de medición | 1–2 |
| El modo decisión hace que otros abran el modelo | ≥ 10% de los modelos compartidos con otra persona a los 6 meses (corte de `mercado.md`) | 1 en adelante |
| El costo de IA entra en el plan | ≤ USD 0,30 por estudio y ≤ USD 1,5 por Pro por mes, medido en el proxy | 1–3 |
| El banco público suma autoridad | Citas o enlaces entrantes a «Andén Verificado» y AndénBench | 5 |

**Cortes de esta visión:**
- Si en el corte 1 la entrevista sintética no llega a 24 de 30 decisiones correctas, se rediseña antes de sumar multimodalidad.
- Si a los 6 meses del simulador público menos del 10% de los modelos se comparte, se rediseña el modo decisión antes de sumar
  funciones.
- Si el costo de IA por Pro supera USD 3 por mes, se pasa por defecto a Haiku y a formularios en los pasos de menor valor.
- Los cortes generales de P2 siguen vigentes: sep-2027 (500 usuarios por mes o una cátedra) y Pro (menos de 10 pagos a los 6 meses
  → revisar precio y valor).

**Métrica norte:** «decisiones compartidas por semana», de `mercado.md`. Métrica propia de esta visión: **preguntas por decisión
correcta**. Mide que el ingeniero pregunta lo que importa.

---

## 11. Encaje en la cartera

- **Quién vende por el fundador:**
  - el enlace del modo decisión (lo comparte el usuario);
  - el video del peor día;
  - los agentes de IA por MCP;
  - las calculadoras v0 como puerta de entrada;
  - los docentes (Aula);
  - el banco y la verificación públicos (los citan la prensa, las cátedras y las respuestas de IA).

  Nada pide salir a vender (DEC-2026-09-26-5).
- **Horas del fundador:** de 2 a 3 en el corte 1 y de 1 a 2 por corte después, para validar plausibilidad, aportar fotos o audios
  y aprobar gastos y publicaciones. Encaja en las 1–3 h por semana que P2 ya tiene asignadas.
- **Infraestructura compartida (INFERENCIA):**
  - el motor determinista, el dibujador 2D/2,5D y el reproductor pueden servirle a la línea de juegos, como la campaña de última
    milla de Hub Nocturno o Hub Rush (P6), sin atar los calendarios;
  - el orquestador «método + herramientas + verificador de afirmaciones» es un patrón reutilizable en otras apps del holding que
    expliquen números.
- **Opcionalidad:** el banco de operaciones (AndénBench) y el índice comunitario de productividades son datos que nadie más tiene en
  la región.

---

## Fuentes (todas consultadas el 17-10-2026)

**Medición propia de esta visión**
- `conocimiento/anden-simulador-2026-10/medicion-ia-nativa/voi.js`: tamizado de valor de la información en un modelo de juguete.
- `conocimiento/anden-simulador-2026-10/medicion-ia-nativa/precision.js`: réplicas contra decisión, con IC de Wilson.
- Resultados: `resultado-100-replicas.json`, `resultado-20-replicas.json` y `precision.json`, en la misma carpeta (17-10-2026, Node
  22.22, 4 núcleos compartidos).

**Informes del repositorio** (con sus fuentes primarias y URL)
- `conocimiento/anden-simulador-2026-10/incumbentes.md`, `frontera-ia.md`, `tecnologia-web.md`, `realismo-logistico.md`,
  `motor-validacion.md`, `mercado.md`.
- Mediciones de esos frentes: `medicion-motor/` (motor de referencia y batería) y `medicion-tecnologia/` (JS contra WebAssembly,
  matemática, traza, render, IndexedDB).
- `oportunidades/proyectos/P2-anden.yaml`, `apps/anden/README.md`, `apps/anden/js/referencias.js`,
  `conocimiento/2026-09-28-logistic-lab-ia-y-calculos.md`.

**Incumbentes e IA**
- AnyLogic 8.9.10 (asistente de IA): https://www.anylogic.com/blog/anylogic-8-9-10-boost-productivity-with-the-new-ai-assistant/
- AnyLogic Online: https://www.anylogic.com/blog/welcome-to-anylogic-online-another-way-to-build-and-use-simulations/
- Simio MCP (Business Wire, 23-09-2026): https://www.financialcontent.com/article/bizwire-2026-9-23-aegis-software-introduces-ai-powered-interaction-for-process-simulation-and-planning-in-simio
- Siemens Plant Simulation Copilot 2606: https://blogs.sw.siemens.com/tecnomatix/ai-for-discrete-event-simulation-how-plant-simulation-x-copilot-accelerates-simtalk-programming/
- Sketch2DES (arXiv 2607.24259): https://arxiv.org/abs/2607.24259
- SIMCODE (vía buscador): https://alphaxiv.org/benchmarks/queens-university/simcode
- DEVS y validación de trazas (arXiv 2603.03784): https://arxiv.org/abs/2603.03784
- FM Logistic con AlphaEvolve (26-03-2026): https://cloud.google.com/blog/products/ai-machine-learning/how-fm-logistic-tackled-the-traveling-salesman-problem-at-warehouse-scale-with-alphaevolve
- AlphaEvolve disponible para todos (09-07-2026): https://cloud.google.com/blog/products/ai-machine-learning/alphaevolve-is-available-for-everyone
- ShinkaEvolve (arXiv 2509.19349): https://arxiv.org/abs/2509.19349
- LLM y trazas de simulación para políticas de AGV (arXiv 2608.09343): https://arxiv.org/abs/2608.09343
- Simod: https://simod.readthedocs.io
- Inferencia basada en simulación en M/G/1 (arXiv 1805.07226): https://arxiv.org/abs/1805.07226
- Método del período activo (WSC 2002): https://informs-sim.org/wsc02papers/146.pdf
- WebMCP, intención de experimento (vía buscador): https://groups.google.com/a/chromium.org/g/blink-dev/c/gmYffo5WOE8/m/OJxuQRP3AAAJ
- Prompt API de Chrome: https://developer.chrome.com/docs/ai/prompt-api
- WebLLM (arXiv 2412.15803): https://arxiv.org/abs/2412.15803
- Precios y funciones de la API de Claude (modelos, caché de prompts, PDF con citas, herramientas estrictas; tabla en caché del
  06-10-2026, re-verificar): https://platform.claude.com/docs/en/about-claude/pricing

**Método, estadística y validación**
- Law (2023), WSC: https://informs-sim.org/wsc23papers/124.pdf
- Sargent (2010), WSC: https://www.informs-sim.org/wsc10papers/016.pdf
- Skoogh y Johansson (2009): https://www.sne-journal.org/fileadmin/user_upload_sne/SNE_Issues_OA/SNE_19_2/articles/sne.19.2.09937.tn.OA.pdf
- Libro de Simio (Kim y Nelson, selección de subconjunto): https://textbook.simio.com/SASMAA/
- Manual de FlexSim 2027, Experimenter: https://help.autodesk.com/view/FLEXSIMIN/2027/ENU/?guid=FlexSim_User_Manual_reference_tools_experimenter_html
- SimOpt: https://github.com/simopt-admin/simopt
- SALib: https://salib.readthedocs.io/en/latest/
- Random123 (Philox): https://www.thesalmons.org/john/random123/papers/random123sc11.pdf
- Bicalho-Hoch y otros (WSC 2022, pymes): https://informs-sim.org/wsc22papers/181.pdf

**Realismo logístico**
- Capacidad de sorters (oskon): https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity
- Plus One Robotics (inducción manual): https://www.plusonerobotics.com/case-studies/pennsylvania-facility-turns-its-sorter-into-a-24-7-revenue-engine
- Correo Argentino Monte Grande: https://mercado.com.ar/innovacion/correo-argentino-inaugura-sistema-robotico-que-triplica-la-capacidad-operativa-logistica-en-monte-grande
- Andreani Pacheco: https://mercado.com.ar/protagonistas/andreani-convierte-su-planta-de-pacheco-en-el-hub-logistico-mas-automatizado-del-pais y https://www.iprofesional.com/tecnologia/453613-andreani-invierte-us30-millones-en-tecnologia-en-su-hub-pacheco-y-expande-su-operacion-a-miami
- Mercado Libre Don Torcuato: https://mercado.com.ar/negocios/mercado-libre-inauguro-un-centro-logistico-de-ultima-milla-en-don-torcuato
- Loske y Klumpp (IFAC 2020): https://re.public.polimi.it/retrieve/584d3515-aaf1-4de0-8e95-e441327146e8/1-s2.0-S2405896320335205-main.pdf
- Pausas y fatiga (WSC 2022): https://www.informs-sim.org/wsc22papers/148.pdf
- EIL, ausentismo: https://argentina.gob.ar/sites/default/files/eil_ausentismo_ficha_metodologica.pdf
- Dataset de rutas de Amazon (licencia CC BY-NC): https://registry.opendata.aws/amazon-last-mile-challenges
- Flow rack contra pallet (IJPE 2023): https://ideas.repec.org/a/eee/proeco/v261y2023ics0925527323001196.html
- Momentos del tiempo de picking (arXiv 2201.05025): https://arxiv.org/abs/2201.05025
- WERC DC Measures 2025 (infografía Yale): https://www.yale.com/globalassets/coms/yale/north-america/documents/white-papers/snack-drawer/YALE-1520_WERC-DC-Metrics-infographic.pdf
- Supervalu, paletizado contra granel: https://www.supermarketnews.com/archive/palletization-cuts-product-turnaround-times-study

**Tecnología web**
- Cloudflare Workers, precios y límites: https://developers.cloudflare.com/workers/platform/pricing/
- GitHub Pages, usos prohibidos: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- three.js (`WebGPURenderer`): https://threejs.org/manual/en/webgpurenderer.html
- MDN, cuotas y borrado de almacenamiento: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- MDN, objeto `Math` (precisión dependiente de la implementación): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
