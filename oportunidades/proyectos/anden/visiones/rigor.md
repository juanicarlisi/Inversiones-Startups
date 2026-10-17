# Andén · Visión «Rigor»: el motor primero (17-10-2026)

> **Qué es.** Una de las visiones de producto y arquitectura del simulador Andén (P2, `oportunidades/proyectos/P2-anden.yaml`),
> escrita desde un solo ángulo: **el simulador más riguroso y poderoso del mercado (multimétodo, validado contra teoría, con
> experimentación y optimización de nivel profesional), donde el 3D y la IA se apoyan en un motor en el que un ingeniero confía más
> que en FlexSim.** Responde al pedido del fundador del 17-10-2026: «el simulador logístico más espectacular, profundo, realista y
> avanzado que exista, superando incluso a FlexSim».
> **Sobre qué se apoya.** Los seis informes de `conocimiento/anden-simulador-2026-10/` (`incumbentes.md`, `frontera-ia.md`,
> `tecnologia-web.md`, `realismo-logistico.md`, `motor-validacion.md`, `mercado.md`), el motor de referencia y su batería
> (`medicion-motor/`), las calculadoras v0 (`apps/anden/`) y **una medición nueva hecha para esta visión**
> (`oportunidades/proyectos/anden/visiones/rigor-medicion/`: reducción de varianza con variables de control y estimación de eventos
> raros, §6.9).
> **Fuentes.** Las URL del final las consultaron los frentes de investigación el 17-10-2026. Esta visión las toma de esos informes y
> no las volvió a abrir; donde un informe dejó algo sin verificar, acá sigue sin verificar.
> **Etiquetas** (`doctrina/02-estandares-de-evidencia.md`): **HECHO** (fuente y fecha) · **MEDIDO** (medición propia reproducible: un
> hecho cuya fuente es un script) · **ESTIMACIÓN** (con método y rango) · **HIPÓTESIS** (a validar, con cómo) · **INFERENCIA**
> (razonamiento propio, con confianza).

---

## 0. La visión en una página

1. **La categoría nueva es la simulación con comprobante.** FlexSim, AnyLogic y Plant Simulation son simuladores *de autor*: el
   número vale lo que vale la reputación del analista que armó el modelo, y nadie más lo puede comprobar sin la licencia, el archivo
   y el tiempo del analista. Andén abre el **gemelo de decisiones verificado**: cada número sale con su comprobante, que trae cinco
   cosas. Un motor certificado en público. Una receta que lo reproduce bit a bit en cualquier dispositivo. Un intervalo honesto. La
   procedencia de cada dato. Y el porqué, calculado. (INFERENCIA, confianza alta: es la síntesis de los huecos 1, 2, 6 y 8 de
   `incumbentes.md` §6.)
2. **Por qué ahora.** En las últimas cuatro semanas AnyLogic (asistente de IA, 24-09-2026), Simio (servidor MCP, 23-09-2026) y
   Siemens (copiloto que escribe SimTalk, 2606) hicieron que «la IA arma el modelo» sea algo básico (HECHO, `frontera-ia.md` §1.1).
   Si un modelo se arma en segundos, lo que escasea es poder creerle (INFERENCIA, confianza alta). El rigor es la ventaja que queda
   cuando el resto se abarata, y en un fundador anónimo es además lo único que puede reemplazar a una cara conocida (INFERENCIA).
3. **El motor es el producto; el 3D y la IA son sus clientes.** El modelo es un documento declarativo con unidades y procedencia.
   Un compilador lo valida y un motor determinista lo corre en el navegador, en Workers, con números aleatorios por dirección y
   matemática propia. La traza que emite es la única fuente de la vista 2D, de la 3D, de las explicaciones y del narrador de IA.
   Lo que se ve en pantalla no puede contradecir lo que se calculó, porque sale de la misma traza.
4. **Dieciséis capacidades diferenciales** (§2). Entre ellas:
   - un motor que publica sus pruebas («Andén Verificado») y se audita contra sí mismo y contra SimPy;
   - estadística que no deja mentir y que avisa cuánto va a tardar antes de correr;
   - comparaciones con garantía (números comunes de fábrica, reducción de varianza automática, selección del mejor);
   - un intervalo que incluye la incertidumbre de tus datos y te dice qué medir mañana;
   - fidelidad mixta verificada y mecanismos logísticos exactos, no tasas;
   - la cadena causal de cada demora;
   - eventos raros estimados con precisión, calibración inversa y un puntaje de validez contra tus días reales;
   - optimización que cierra con garantía estadística, y depuración con rebobinado.
5. **El primer corte ya es espectacular y profundo.** Se llama «Hub verificado» (§7). Es un hub de 24.000 paquetes por día con el
   mecanismo completo: inducción humana con fatiga y pausas, bandejas con paso, recirculación, rampas que se llenan y cortes.
   - Corre en el teléfono, en 2D y en 3D, y se rebobina como un video.
   - Un deslizador re-simula en vivo con la misma aleatoriedad.
   - Al tocar un paquete atrasado, muestra por qué se atrasó.
   - Todo sale con comprobante y con una batería pública de pruebas.
6. **Lo que no peleamos.** Seguimos sin pelear la amplitud de bibliotecas de veinte años, el PLC, la física, los robots de seis ejes,
   Omniverse ni el CAD corporativo. Ahí ganan los incumbentes y lo decimos (§1.3). Andén gana en lo que decide si un ingeniero firma
   una recomendación: que el número sea correcto, se pueda reproducir, se pueda explicar y salga a tiempo.

---

## 1. La tesis

### 1.1 Qué categoría abre

| Simulador de autor (hoy) | Simulación con comprobante (Andén) |
|---|---|
| La confianza depende del analista | La confianza viaja con el resultado y la puede comprobar cualquiera |
| Réplicas fijas que elige el usuario; intervalo «mirado» en un gráfico (FlexSim, HECHO) | Réplicas hasta la precisión pedida, con costo avisado antes de correr |
| Calentamiento «largo» y a ojo (Simio, HECHO) | Corte calculado sobre el promedio entre réplicas, con gráfico de Welch visible (MEDIDO: es la única forma que no empeora el sesgo) |
| Reproducible en la misma máquina, si se activa (FlexSim «Repeat Streams», HECHO) | Bit a bit en cualquier navegador y en Node, por diseño (HIPÓTESIS a cerrar en el corte 1 con la prueba R04) |
| El motor es una caja negra con una sola implementación | Motor con batería pública, doble implementación auditada y exportación a Python para verificar por fuera |
| Parámetros sin origen | Cada parámetro con valor, unidad, distribución, rango, fuente, fecha y tipo (como `apps/anden/js/referencias.js`) |
| «El cuello es la estación X» (Siemens, analizador de cuellos, HECHO) | «Este paquete perdió el corte por esta cadena de causas», con el contrafactual y su intervalo |
| Optimizador que «no puede garantizar» el óptimo (Simio sobre OptQuest, HECHO) | Optimizador que cierra con selección del mejor con garantía (KN) y la zona de indiferencia expresada en pesos |
| Formato cerrado y licencia de USD 5.000–21.800 por año (HECHO, `incumbentes.md` §4) | Formato abierto, motor completo gratis y sin tope de tamaño, corre en el dispositivo |

**Nombre (HIPÓTESIS de posicionamiento):** categoría «gemelo de decisiones verificado», coherente con el «gemelo de decisiones
abierto» de `mercado.md` §6. Promesa llana: «simulación con comprobante». El comprobante es una ficha que acompaña a cada resultado:
- huella del modelo;
- versión del motor;
- semilla y réplicas;
- método de calentamiento;
- pruebas que pasó;
- huella de la traza;
- semáforo de confianza.

### 1.2 Lo que importa a un ingeniero, y quién gana hoy

| Criterio que decide si un ingeniero firma | FlexSim 2027 | AnyLogic 8.9.10 / Online | Plant Simulation 2606 | Andén (esta visión) |
|---|---|---|---|---|
| ¿El intervalo dice la verdad por defecto? | Réplicas fijas; en optimización, «hasta la confianza» sin documentar el cálculo (HECHO) | No verificado (anylogic.help dio 403) | No verificado | Réplicas independientes por defecto; nunca intervalo de una sola corrida (cobertura medida: 94,4% contra 8,4% del método ingenuo) |
| ¿Puedo reproducir el resultado de otro? | En la misma instalación (HECHO) | No verificado | No verificado | Receta + huella; mismo resultado en cualquier dispositivo (prueba R04, a construir) |
| ¿El motor está probado contra teoría, en público? | No encontramos batería publicada | No encontramos | No encontramos | 59 de 59 verificaciones exigibles ya pasan en la maqueta (MEDIDO); meta: más de 150, publicadas (§6.1) |
| ¿De mis datos a una decisión, cuánto? | Datos y armado: 10–40% y 40–60% del proyecto (HECHO, Skoogh y Johansson; Banks) | Asistente de IA para «borradores simples» (HECHO) | Copiloto que escribe código (HECHO) | Planilla o export → distribuciones con bondad de ajuste e incertidumbre; plantillas calibradas; entrevista que llena un esquema (corte 3) |
| ¿Por qué pasa lo que pasa? | Gráficos | El asistente describe modelos | Analizador de cuellos y Sankey (HECHO); resumen y cuellos automáticos «a futuro» | Descomposición del tiempo de ciclo, cuello dinámico, contrafactual con la misma aleatoriedad y cadena causal por entidad |
| ¿La recomendación tiene garantía? | OptQuest como complemento pago (HECHO) | OptQuest | Algoritmos genéticos (HECHO) | Búsqueda + restricciones de probabilidad + cierre KN; banco SimOpt publicado |
| ¿Profundidad en hubs de paquetería y última milla? | Objetos genéricos | Objetos genéricos | Objetos genéricos | Mecanismo de sorter, inducción humana, rampas, cortes, olas, re-entregas, con datos argentinos públicos |
| ¿Costo y acceso? | ~USD 6.000/año; Express de 30 objetos | Pro ~USD 18.990+ por puesto; PLE limitada | ~USD 419 por mes, hasta 500 objetos | Gratis sin tope de tamaño; Pro a USD 12/29 por mes (HIPÓTESIS de `mercado.md`); teléfono |

(Fuentes de la tabla: `incumbentes.md` §2 y §4, `motor-validacion.md` §1, `frontera-ia.md` §1.1. Los precios de FlexSim, AnyLogic Pro y
Plant Simulation X son de fuentes secundarias. «No encontramos» no prueba que no exista.)

### 1.3 Lo que concedemos (y no perseguimos)

- **Amplitud de bibliotecas.** Peatones, tránsito, ferrocarril y GIS (AnyLogic); robots por cinemática y portadores multipieza
  (Plant Simulation 2606); 20 años de objetos (FlexSim). HECHO.
- **Física y control.** Emulate3D prueba PLC reales con física 3D, Git, Test Runner y fallas inyectadas. HECHO. Andén no emula PLC.
- **Fotorrealismo.** Lo resuelven con NVIDIA Omniverse y placas RTX (HECHO). Andén hace 3D claro, liviano y en cualquier dispositivo,
  no fotorrealista.
- **Integración corporativa.** CAD de Autodesk, MES de Siemens, SQL Server de Simio. HECHO.

**INFERENCIA (confianza alta):** pelear función por función contra 20 años de objetos es la trampa que describe `mercado.md` §5
(Onshape fue superior técnicamente y no desplazó a SolidWorks). La vara de «superar a FlexSim» no es tener más objetos: es que, en
logística de depósitos, hubs y última milla, **el número de Andén sea más confiable, más rápido de obtener y más fácil de defender**.
Y que mucha más gente que hoy no simula (79% de las pymes del Delphi de la WSC 2022, HECHO) pueda hacerlo.

### 1.4 Por qué los incumbentes no lo copian rápido

INFERENCIA, confianza media. No es imposible que lo copien; lo que lo hace lento son cuatro razones:

1. **El determinismo entre máquinas hay que diseñarlo desde el núcleo.** Hace falta:
   - matemática propia, porque ECMA-262 no fija `log`, `exp`, `sin` ni `pow` (HECHO) y en V8 `log` difiere de la libm de Rust en el
     1,74% de los valores (MEDIDO, `tecnologia-web.md` §3);
   - tiempo en enteros;
   - desempate fijo;
   - azar por dirección.

   Un motor de 20 años con modelos de clientes guardados no se puede cambiar sin romper la compatibilidad hacia atrás.
2. **Su formato es código.** FlexScript, SimTalk y Java: la IA de los incumbentes escribe código para motores pensados para humanos
   (HECHO, `incumbentes.md` §3). Andén nace con un esquema que un compilador verifica.
3. **Su negocio es la licencia por puesto.** Un motor completo gratis y sin tope, que corre en el dispositivo, canibaliza licencias de
   USD 6.000–21.800.
4. **Publicar una batería expone sus métodos.** El método de intervalo con 7,2% de cobertura «es una opción en uno o más productos
   comerciales» (Law, WSC 2023, HECHO).

---

## 2. Dieciséis capacidades diferenciales

Formato de cada una: **qué hace** · **por qué nadie la tiene o la tiene mal** · **cómo se construye en el navegador** · **evidencia**.

### D1. Motor certificado en público: «Andén Verificado»

- **Qué hace.** Una batería de pruebas con valor analítico esperado y tolerancia declarada corre en cada cambio del motor. Cubre:
  - colas: M/M/c hasta 50 servidores, M/G/1, D/M/1, Erlang B y su insensibilidad, prioridades, Jackson, MVA, Penny Fab, M_t/M/∞ y
    fuente finita;
  - casos publicados por Law;
  - estadística: cobertura y calentamiento;
  - reproducibilidad, cinemática, flujo continuo y eventos raros.

  Una página pública muestra cada prueba con el valor esperado, el medido, la tolerancia, la versión del motor y los motores de
  navegador en que pasó.
- **Por qué nadie.** No encontramos una batería pública de verificación del motor en ningún incumbente (INFERENCIA, confianza media;
  `motor-validacion.md` §1). Lo más cercano es el Test Runner de Emulate3D, que es para PLC (HECHO).
- **Cómo se construye.**
  - El motor es isomorfo: el mismo TypeScript corre en Node y en los navegadores.
  - Las pruebas corren con `node --test` y en Chromium, Firefox y WebKit con Playwright.
  - La página es estática y la regenera la integración continua.
  - Criterio de aprobación: |error| ≤ 3,29 errores estándar y error relativo ≤ 3% (≤ 1–2% en probabilidades). Si una prueba falla, se
    re-corre sola con otra semilla y 4 veces más réplicas antes de declararla error del motor (`motor-validacion.md` §7).
- **Evidencia.** La maqueta `motor_ref.js` (~130 líneas) pasó **59 de 59 verificaciones exigibles**, más 17 informativas y 2
  demostraciones de métodos que tienen que fallar. Tres casos de Law caen dentro de sus intervalos publicados, por ejemplo la oficina
  con 5 empleados: 5,426 ± 0,184 min contra [4,58; 6,79]. MEDIDO (`medicion-motor/resultados-validacion.json`).

### D2. Doble contabilidad del motor: pruebas diferenciales, modelos al azar y verificación en Python

- **Qué hace.** Tres controles cruzados:
  1. Cada bloque estándar tiene dos implementaciones independientes: el camino rápido compilado y el de procesos-generador. Las dos
     tienen que dar las mismas estadísticas, y la misma traza en los modelos deterministas.
  2. Todas las noches, un generador de modelos al azar crea miles de modelos válidos desde el esquema (la técnica con que se prueban
     los compiladores de C) y compara los dos caminos.
  3. Para el subconjunto que es una red de colas, Andén **exporta un script de SimPy o Ciw**, para que un tercero lo corra y compare
     los intervalos: «no nos creas: corrélo en Python».
- **Por qué nadie.** Los motores comerciales tienen una sola implementación cerrada (INFERENCIA, confianza alta). Exportar a otro
  motor para auditar no aparece en ningún informe.
- **Cómo se construye.**
  - El compilador ya tiene que generar tablas para el camino rápido; generar un camino de referencia es el mismo esquema con otro
    emisor.
  - Los modelos al azar salen de recorrer el esquema con restricciones (capacidades positivas, utilización menor que 1).
  - El exportador escribe Python plano.
  - En el entorno de Claude hay SimPy 4.1.1 instalado (HECHO, `frontera-ia.md` §3.2), así que la comparación corre en integración
    continua.
- **Evidencia.** El primer caso ya pasó: el mismo hub de 3 etapas dio 4,822 min con generadores y 4,820 con callbacks. MEDIDO
  (`motor-validacion.md` §2.5).

### D3. Resultados con comprobante: bit a bit en cualquier dispositivo

- **Qué hace.** Cada resultado lleva su receta: huella del modelo, versión del motor, semilla, réplicas, método de calentamiento,
  versión de la batería y huella de la traza. Abrir la receta en otro teléfono o en otra PC reproduce exactamente lo mismo. Sirve para:
  - que el docente corrija un trabajo práctico re-corriendo la receta, sin pedir el archivo y detectando copias;
  - que el cliente de un consultor verifique el estudio;
  - regenerar el 3D de cualquier réplica sin guardar video.
- **Por qué nadie.** MDN advierte que las funciones de `Math` pueden dar resultados distintos según el navegador, el sistema operativo
  o el procesador (HECHO). FlexSim repite flujos en la misma instalación (HECHO); igualdad entre máquinas no la encontramos documentada
  en ningún incumbente (INFERENCIA, confianza media).
- **Cómo se construye.** Siete reglas del motor:
  1. **Tiempo en ticks enteros** (1 ms por defecto, configurable; exactos en doble precisión hasta 2⁵³).
  2. **Desempate fijo** por (tiempo, fase, prioridad, secuencia).
  3. **Matemática propia** escrita solo con `+ − × ÷` y `sqrt`, que IEEE 754 define exactos. El `log` propio coincidió con el de V8 en
     5 millones de valores de 5 millones, a mitad de velocidad (MEDIDO, `tecnologia-web.md` §3.1).
  4. **Sin SIMD relajado.** Es lo único no determinista de WebAssembly fuera de los NaN y los hilos (HECHO).
  5. **Agregación por índice de réplica**, no por orden de llegada de los Workers.
  6. **Azar por dirección** (ver D5).
  7. **Huella** (hash) de la traza.
- **Evidencia.** El determinismo ya pasó dentro de un mismo motor: R01–R03 dieron 309fc7e8 = 309fc7e8 (MEDIDO). En el hub, 1 de cada
  50 semillas cambia en la última cifra si se usa el `log` nativo (MEDIDO, `tecnologia-web.md` §3.1). La prueba R04 (misma huella en
  Chrome, Firefox, Safari y Node) está **pendiente**: es la primera prueba de salida del corte 1.

### D4. Estadística que no deja mentir, y que avisa antes de correr

- **Qué hace.** Por defecto:
  - infiere si el estudio es **terminante** (el hub cierra, hay corte) o **estacionario**, y lo confirma con el usuario;
  - corre réplicas independientes hasta la **precisión pedida** («±2% en el costo por paquete»);
  - calcula el calentamiento con **MSER-5 sobre la serie promedio de réplicas** y muestra el gráfico de Welch;
  - reporta media, **P90** y la **probabilidad del evento que importa** («perder el corte de las 22»);
  - muestra un semáforo en lenguaje llano.

  **Antes de correr** avisa el costo: «para ±1% en la cola de inducción al 90% hacen falta ~470 días simulados, unos 12 s en esta
  computadora; ¿querés medir la ocupación, que es más estable?».
- **Por qué nadie lo hace bien.**
  - FlexSim usa réplicas fijas e intervalos «inspeccionados visualmente». HECHO.
  - Simio aconseja mirar gráficos de una réplica y hacer el calentamiento «largo». HECHO.
  - Law midió 7,2% de cobertura real con un método presente en productos comerciales. HECHO.
- **Cómo se construye.**
  - Fórmulas cerradas.
  - El costo se estima con la ley de la ocupación de Whitt, que verificamos: 1.804 medido contra 1.800 teórico (MEDIDO).
  - Calentamiento: MSER-5 sobre el promedio entre réplicas, la regla medida que no empeora el sesgo.
  - Precisión objetivo: tanda inicial de 10 réplicas y después n ≈ n₀·(semiancho₀/semiancho)².
  - Percentiles con estadísticos de orden.
- **Evidencia.**
  - Cobertura medida: 8,4% con el método ingenuo, 82,2% con lotes y **94,4%** con réplicas (MEDIDO).
  - Sesgo: MSER-5 en **una sola** corrida casi cuadruplicó el sesgo (−0,14 → −0,54); sobre el promedio de 10 réplicas lo eliminó
    (+2,51 → +0,02). MEDIDO.

### D5. Comparar con garantía: números comunes de fábrica, reducción de varianza automática y selección del mejor

- **Qué hace.**
  - Toda comparación es **pareada con números aleatorios comunes (CRN)**: el mismo azar en los dos escenarios, para que la diferencia
    sea la causa y no la suerte.
  - El motor elige y aplica **reducción de varianza** (variables de control con las medias conocidas de las entradas; antitéticas
    donde la respuesta es monótona) e informa cuánto ahorró: «ahorraste 1.300 réplicas».
  - Entre varios escenarios aplica **selección de subconjunto** y **KN** (Kim y Nelson) con la zona de indiferencia expresada en
    pesos («no me importan diferencias de menos de $5.000 por día»).
- **Por qué nadie lo hace por defecto.**
  - Los CRN existen como opción (FlexSim «Repeat Streams», HECHO) pero no vienen sincronizados por diseño.
  - En la documentación leída por los frentes (manual de FlexSim 2027, libro de Simio) no aparecen variables de control. INFERENCIA,
    confianza media.
  - Simio sí trae KN y subconjunto. HECHO.
- **Cómo se construye: azar por dirección.** Con un generador basado en contador (Philox4x32-10), el número aleatorio es una
  **función pura**:
  - la clave es (semilla, flujo);
  - el contador es (réplica, entidad, número de sorteo).

  El peso del paquete 18.233 en la réplica 7 es siempre el mismo, aunque cambie el modelo (agregar un muelle no corre ni un número de
  las llegadas) y aunque una distribución use rechazo. Random123 documenta que Philox pasa BigCrush y da al menos 2⁶⁴ flujos de período
  2¹²⁸ o más (HECHO). Si Philox en JS rinde menos de 30 millones de números por segundo (no medido), va en un módulo de WebAssembly
  mínimo con multiplicación de 64 bits nativa; el respaldo es xoshiro128\*\* con saltos (114 M/s, MEDIDO).
- **Evidencia.**
  - CRN: la varianza de la diferencia bajó **34 veces** en un cambio chico (servicio de 4,5 a 4,4 min) y 1,43 veces en uno grande
    (5 contra 6 empleados). MEDIDO.
  - Variables de control (medición nueva, §6.9): **la varianza baja entre 1,6 y 2,5 veces** en M/M/c terminantes. MEDIDO.

### D6. La incertidumbre de tus datos, y qué medir mañana

- **Qué hace.** Separa dos incertidumbres que los simuladores mezclan o ignoran:
  - **el azar** de la operación, que se achica con más réplicas;
  - **lo que no sabés** de los parámetros porque mediste pocos casos, que solo se achica midiendo más.

  El intervalo final incluye las dos, y Andén ordena los parámetros por cuánto pesan en lo que no sabés: «medí 70 tiempos de inducción
  más: el intervalo del costo por paquete pasa de ±22% a ±9%» (ejemplo ilustrativo, no medido).
- **Por qué importa: un ejemplo con cuentas** (INFERENCIA, cálculo).
  - El tiempo de inducción se estimó con **30 observaciones** y un coeficiente de variación de 0,5.
  - La media tiene un error relativo de 0,5/√30 = 9,1%, y su intervalo del 95% es **±18,7%** (t de Student con 29 grados de libertad).
  - Si la ocupación nominal es 0,85, el extremo superior da **1,009**: la cola puede ser inestable.
  - Mil réplicas darían un intervalo de ±1% sobre un supuesto que puede estar 19% corrido: una precisión falsa.
- **Por qué nadie.** No encontramos un simulador comercial que separe la incertidumbre de entrada por defecto (INFERENCIA, confianza
  media; `frontera-ia.md` §2 tampoco encontró calibración inversa comercial).
- **Cómo se construye.**
  - Bootstrap de los datos del usuario, que en Workers es paralelo por naturaleza, o posterior bayesiano.
  - Descomposición de la varianza entre «azar» y «parámetros» con un diseño de réplicas anidado.
  - Para que no explote el cómputo, se usa el metamodelo de D14 cuando el modelo es grande.
  - El ranking de qué medir sale de la sensibilidad global (Sobol) sobre los parámetros inciertos.
- **Evidencia.** La procedencia por parámetro ya existe en `referencias.js` (valor, unidad, fecha, fuente, tipo). La descomposición es
  HIPÓTESIS de producto: se valida con un caso de solución conocida (M/M/1 con μ estimado de n datos, donde la varianza total se
  calcula analíticamente) en el corte 2.

### D7. Fidelidad mixta verificada: el zoom de detalle

- **Qué hace.** Cada objeto existe en varios **niveles de fidelidad**:

  | Nivel | Qué es | Ejemplo con el sorter |
  |---|---|---|
  | F0 | Fórmula | La capacidad de oskon.com.tr: velocidad ÷ paso × factores |
  | F1 | Flujo por tramos | Tasa con pérdida por recirculación |
  | F2 | Cola | Servidor con tasa efectiva y fallas |
  | F3 | Mecanismo | Bandejas con paso, ventanas, rampas e inductor humano |
  | F4 | Cinemático y espacial | Posiciones, aceleraciones y cruces |

  El usuario elige el nivel por zona, y Andén **verifica la consistencia entre niveles**: el F2 tiene que reproducir el rendimiento del
  F3 dentro de la tolerancia en el rango probado, y ese rango queda escrito como dominio de validez. Además sugiere dónde el detalle
  **cambia la decisión**: si pasar de F2 a F3 mueve el KPI más que la zona de indiferencia, el detalle se queda.
- **Por qué nadie.** Los generalistas abstraen la física y Emulate3D la usa para el control (HECHO). Plant Simulation recién sumó
  frenado y curvas de AGV (2606, HECHO). Nadie **verifica** sus abstracciones ni declara su dominio de validez. INFERENCIA, confianza
  media (es el hueco 7 de `incumbentes.md`).
- **Cómo se construye.** Es el mismo esquema: el compilador elige la implementación del bloque según el nivel. Las pruebas de
  consistencia son pruebas diferenciales (D2) entre niveles, corridas con CRN.
- **Evidencia.** El ejemplo F0 publicado (8.640 → 7.338 paquetes buenos por hora) advierte que «los factores no son independientes»
  (HECHO, oskon.com.tr). El F3 calcula ese acople en vez de suponerlo, y la diferencia entre F0 y F3 se muestra como «efecto del
  acople».

### D8. Mecanismos logísticos exactos, con su control contra lo nominal

- **Qué hace.**
  - **Sorter de lazo:** bandejas con paso, huecos, ventana de desvío, rampa llena, recirculación con máximo de vueltas, NO-READ a manual
    y la persona que induce.
  - **Cintas** con y sin acumulación, con fotoceldas, uniones y desvíos.
  - **Transelevadores y shuttles** con ciclo calculado por cinemática según la lógica de los métodos FEM.
  - **Autoelevadores y AGV** con perfil trapezoidal y reserva de tramos por ventanas de tiempo («el AGV 3 esperó 12 s porque el cruce
    estaba reservado»).
  - **Pasillos** como recursos con capacidad, para que la congestión surja y no se parametrice.

  Cada mecanismo muestra su control contra lo nominal: «tu sorter rinde 7.300/h; el proveedor dice 9.000/h nominales; la diferencia
  viene de recirculación 41%, huecos de inducción 38%, rampas 21%» (porcentajes de ejemplo, no medidos).
- **Por qué nadie.** Los sorters con inducción manual rinden el 40–70% de su diseño según un proveedor (HECHO autoinformado, Plus One).
  Una tasa fija esconde justo lo que se quiere decidir. Las herramientas de BEUMER, Vanderlande, Dematic y AutoStore simulan **su**
  equipo (HECHO); no encontramos una neutral para pymes (INFERENCIA).
- **Cómo se construye.**
  - Todo en forma cerrada, sin motor de física.
  - El lazo del sorter es un anillo que gira: la bandeja k pasa por el punto de inducción en t₀ + k·paso/v. El inductor toma la próxima
    bandeja libre con una cuenta, sin un evento por bandeja.
  - La cinta con acumulación calcula a qué hora cada bulto toca la cola.
  - La vista interpola los tramos: 1,1 ms por cuadro con 100.000 bultos (MEDIDO, `tecnologia-web.md` §6.1).
- **Evidencia.** Pruebas con valor exacto ya calculado (`motor-validacion.md` §7.3), a construir en el corte 1:
  - autoelevador de 30 m: 19,0 s;
  - cinta de 42 m a 2 m/s con paso de 0,6 m: 12.000 piezas por hora;
  - cinta con acumulación: 70 piezas;
  - tanque: lleno a los 5,6667 min.

### D9. Personas con estado validado

- **Qué hace.** Cada persona es un agente con antigüedad (curva de aprendizaje), fatiga desde la última pausa, pausas programadas,
  ausentismo diario, matriz de habilidades y regla de reubicación entre puestos. Su productividad es base × aprendizaje(antigüedad) ×
  fatiga(tiempo desde la pausa) × condición (frío, peso). Para el pico, el usuario elige cuántos temporarios entran y desde cuándo, y
  ve cuánto rinden.
- **Por qué nadie.** FlexSim deja las personas al usuario (`realismo-logistico.md` §11). Calcular la dotación del Hot Sale con la
  productividad de planta subestima la gente necesaria (INFERENCIA, confianza alta), porque un evento dura 3–4 días y un ingresante
  tarda semanas en igualar al de planta.
- **Cómo se construye.**
  - Ley de Wright con cociente editable.
  - Modelo de fatiga y recuperación de Jaber, Givi y Neumann (índices λ y μ).
  - Ausentismo sorteado por persona y por día.
  - Todo como estado del agente que se actualiza en los bordes de cada tarea, sin pasos fijos.
- **Evidencia.**
  - Curva publicada: eficiencia de ingresantes 0,46 → 0,61 → 0,72 → 0,88, contra 0,80–0,95 de los experimentados, ~9 semanas para
    igualarlos (Loske y Klumpp, IFAC 2020, HECHO). Se vuelve la prueba P01: el modelo calibrado tiene que reproducirla.
  - Ausentismo: tope «aceptable» 5% (ADRHA); 12,6% de los empleados privados registrados faltó al menos un día del mes en el 3er
    trimestre de 2025 (HECHO).

### D10. Explicación calculada y cadena causal de cada demora

- **Qué hace.** Cuatro piezas deterministas y una de lenguaje:
  1. Descomposición del tiempo de ciclo por entidad y por estación: espera, proceso, bloqueo, hambre y falla.
  2. Cuello de botella dinámico por el **método del período activo**, con el porcentaje del tiempo en que cada estación fue el cuello.
  3. **Contrafactuales con CRN** («+1 persona en inducción: −22% ± 3% de tiempo de ciclo, 40 réplicas pareadas»), con atribución tipo
     Shapley cuando hay varias causas a la vez.
  4. **Cadena causal por entidad**: se toca un paquete atrasado y el motor reconstruye desde la traza a quién esperó, por qué ese
     recurso estaba ocupado, y así hacia atrás. Por ejemplo: «perdió el corte de las 22 porque esperó 14 min con la rampa 37 llena;
     la rampa se llenó porque la persona que la vacía estaba en la pausa de las 21:30».
  5. El LLM solo **narra** lo calculado, y cada frase cita el experimento que la respalda. Una frase sin experimento no se muestra.
- **Por qué nadie.** Siemens tiene el analizador de cuellos y anuncia el resumen y los cuellos automáticos como «metas futuras»
  (HECHO). Las explicaciones contrafactuales en simulación logística casi no tienen literatura 2025–2026 (HECHO, `frontera-ia.md`
  §4.1).
- **Cómo se construye.**
  - La traza guarda, para cada espera, el identificador de la entidad o el evento que tenía el recurso. Es una columna más en el
    formato columnar.
  - La cadena es un recorrido hacia atrás en ese grafo, que corre en un Worker.
  - Hay un paquete PyPI del método del período activo, que sirve de referencia para verificar el nuestro (HECHO).
- **Evidencia.** Es HIPÓTESIS de producto con prueba de respuesta conocida: un escenario construido con la causa raíz sembrada (una
  pausa programada) tiene que ser identificado por el explicador en el 100% de las réplicas (prueba E01, corte 1).

### D11. El modelo como software: unidades, invariantes, integración continua y búsqueda de contraejemplos

- **Qué hace.**
  - **Unidades:** el compilador rechaza «paquetes/h + min» y todo número sin unidad.
  - **Invariantes:** el usuario o la IA declaran propiedades («siempre: rampa ≤ capacidad»; «todo paquete con corte 22:00 sale antes o
    queda marcado tarde»; «ningún paquete se clasifica sin inducción») que se chequean **durante** la corrida.
  - **Integración continua:** cada cambio es un parche (RFC 6902) sobre el documento, cada escenario es una rama, y cada cambio corre
    las pruebas de KPI y muestra el diff en lenguaje estadístico: «+2 inductores: +11% de paquetes por hora (IC 95%: +8% a +14%)».
  - **Contraejemplos:** un buscador recorre las entradas plausibles (picos de demanda, ausencias, fallas dentro de los rangos
    declarados) buscando la que rompe una propiedad o un KPI: el **peor caso plausible**.
- **Por qué nadie.** Git llegó a AnyLogic (2024), Emulate3D (2025) y JaamSim. Solo Emulate3D tiene pruebas automáticas, y son para PLC
  (HECHO). La investigación propone validar trazas contra la especificación (DEVS, arXiv 2603.03784, HECHO), pero no encontramos un
  producto que lo haga.
- **Cómo se construye.**
  - Un lenguaje chico de propiedades temporales, compilado a monitores que leen la traza en línea.
  - El buscador de contraejemplos es el optimizador de D14 con el signo invertido.
  - Los parches son los mismos del editor y de la IA.
- **Evidencia.** Patrón probado fuera de la simulación (pruebas de propiedades, integración continua). Para Andén es HIPÓTESIS:
  10 invariantes de ejemplo en la plantilla del hub, y cada una detecta un error sembrado.

### D12. Riesgo en la cola de la distribución: eventos raros con precisión

- **Qué hace.** Estima probabilidades chicas que deciden plata: perder el último troncal, que la playa desborde, que un día no alcance
  la dotación. Usa **división de trayectorias**: se clonan las historias que se acercan al evento. Cuando no hay función de
  importancia confiable, cae al Monte Carlo crudo con la cota honesta de la «regla del tres» (0 casos en n réplicas → p < 3/n con 95%
  de confianza; fórmula estándar).
- **Por qué importa.** Para estimar p = 0,1% con ±10% hacen falta ~**384.000 réplicas** crudas (n = 1,96²(1−p)/(p·0,1²); cálculo). Con
  el hub de 24.000 paquetes, eso son 5–13 horas de cómputo en un hilo (ESTIMACIÓN con 0,05–0,12 s por día simulado, §4.4).
- **Por qué nadie.** No apareció en ninguno de los seis informes ni en la documentación leída de los incumbentes (INFERENCIA, confianza
  media).
- **Cómo se construye.** Esfuerzo fijo por niveles sobre una función de importancia, por ejemplo el atraso acumulado en relación con
  el tiempo que falta para el corte. Corre en Workers.
- **Evidencia (medición nueva, §6.9).** En una cola M/M/1, la probabilidad de llegar a 20 clientes antes de vaciarse es exactamente
  9,5368×10⁻⁷.
  - La división la estimó en **9,62×10⁻⁷ ± 0,20×10⁻⁷** (100 corridas).
  - Cada corrida tuvo 10,8% de error relativo con 518.068 pasos.
  - El Monte Carlo crudo con el mismo esfuerzo vio **0 casos en 173.270 trayectorias**; para igualar la precisión necesitaría ~2,7×10⁸
    pasos, **515 veces más**. MEDIDO.
  - **Límite honesto:** en una cola simple la función de importancia es obvia (el largo de la cola). En un hub hay que diseñarla, y que
    funcione es HIPÓTESIS del corte 3.

### D13. Calibración inversa y puntaje de validez contra tus días reales

- **Qué hace.**
  - **Calibración inversa:** cuando el usuario no sabe un tiempo pero sí un resultado («sacamos 6.000 paquetes por turno y quedan 500
    sin clasificar»), Andén estima el parámetro y su incertidumbre con **cómputo bayesiano aproximado**. Si los datos no alcanzan, lo
    dice: «con estos datos no se puede separar el tiempo de inducción del de vaciado; se compensan».
  - **Puntaje de validez:** con días reales que se apartan antes de calibrar, controla que ~90% caiga dentro del intervalo predictivo
    del 90%. Por ejemplo: «tu modelo predijo bien 27 de 30 días».
- **Por qué nadie.** No encontramos simuladores comerciales que estimen parámetros desde resultados observados (HECHO de búsqueda,
  `frontera-ia.md` §2). Sargent pide validación con datos históricos y pruebas de Turing (HECHO, WSC 2010), pero no la convierte en un
  número que un jefe entienda.
- **Cómo se construye.** El cómputo bayesiano aproximado es «simular mucho y quedarse con lo que se parece». Con 0,05–0,12 s por día
  simulado, 10.000 días son 8–20 min en un hilo, o 2–5 min con 4 (ESTIMACIÓN). La literatura ya lo probó en colas M/G/1 (HECHO,
  arXiv 1805.07226).
- **Evidencia.** HIPÓTESIS. Se valida en el corte 3 con un caso sintético: se esconde un parámetro conocido y el método tiene que
  recuperarlo dentro de su intervalo en ≥ 90% de las repeticiones.

### D14. Experimentación y optimización con garantía, en el navegador

- **Qué hace.**
  - **Diseños de experimentos:** factorial y, con muchos factores, hipercubos latinos casi ortogonales.
  - **Sensibilidad:** local con tornado en pesos; global con Morris y Sobol, validados contra SALib.
  - **Metamodelo** (proceso gaussiano) para que los deslizadores respondan al instante **con su banda de incertidumbre**, y re-simulación
    automática cuando el usuario sale de la zona confiable.
  - **Optimizador:**
    - variables tipadas (enteras, continuas, categóricas);
    - búsqueda bayesiana o evolutiva;
    - **restricciones de probabilidad** («paquetes tarde ≤ 2% con 95% de confianza»), chequeadas estadísticamente y no por la media;
    - CRN entre candidatos;
    - **cierre KN obligatorio**.
  - **Optimización robusta** entre futuros (día normal, Hot Sale, CyberMonday): la configuración buena en los tres, no la mejor en
    promedio.
  - **Evolución de reglas con LLM:** el simulador hace de juez y el resultado es una **regla legible** escrita en un lenguaje chico que
    compila, por ejemplo: «si la rampa pasa del 80% y faltan menos de 30 min para el corte, priorizar ese destino».
- **Por qué nadie lo hace con garantía.** OptQuest «no puede garantizar» el óptimo (Simio, HECHO) y en FlexSim es un complemento pago
  (HECHO). FM Logistic mejoró 10,4% su ruteo de picking con AlphaEvolve usando un evaluador (HECHO autoinformado), pero nadie lo
  empaqueta para pymes (INFERENCIA). Un optimizador o un LLM que prueba miles de reglas con pocas réplicas **sobreajusta al ruido**
  (INFERENCIA, confianza alta).
- **Cómo se construye.**
  - Todo en Workers.
  - Medidas contra el sobreajuste: semillas de entrenamiento y de prueba separadas, prueba fuera de distribución (otra curva de demanda)
    y KN al final.
  - La credibilidad pública sale de correr el optimizador sobre **SimOpt** (banco abierto, licencia MIT, HECHO) y publicar sus curvas
    de progreso.
- **Evidencia.** Cómputo: 2.000 réplicas de un día del hub de 24.000 paquetes = 100–240 s en un hilo y **25–60 s con 4** (ESTIMACIÓN
  con §4.4). `frontera-ia.md` estimó 1,5–4 min para 2.000 réplicas de una semana.

### D15. Laboratorio en vivo y depuración con rebobinado

- **Qué hace.**
  - **En vivo:** al mover un deslizador o arrastrar una estantería, re-simula un horizonte corto con los mismos números aleatorios y
    muestra la diferencia en ~150 ms. La marca como «provisoria» hasta que terminan las réplicas completas en segundo plano.
  - **Mil futuros:** dibuja fantasmas de varias réplicas superpuestas y mapas de calor de congestión por P90 de todas las réplicas, no
    de una historia elegida.
  - **Depuración:** rebobinar a cualquier minuto; avanzar evento por evento; puntos de parada con condición («pará cuando la rampa 37
    se llene»); comparar dos réplicas y ver **en qué evento se bifurcan** sus historias.
- **Por qué nadie.** No encontramos depuración con rebobinado en simuladores de eventos discretos (INFERENCIA, confianza media). El
  rebobinado exacto solo es posible con un motor determinista.
- **Cómo se construye.**
  - Fotos del estado cada N minutos (el estado de una réplica es serializable).
  - Para saltar a un minuto, se repite desde la foto más cercana.
  - El reloj de la vista está desacoplado del motor: la técnica de «Fix Your Timestep», aplicada a tramos.
  - Presupuesto «en vivo»: ≤ 150 ms equivale a ~1–1,5 millones de eventos en un hilo de la máquina de referencia (ESTIMACIÓN,
    `tecnologia-web.md` §11). Con 4 Workers alcanza para 4 réplicas pareadas de un día del hub de 24.000 paquetes.
- **Evidencia.** Interpolación de 100.000 bultos en 1,1 ms por cuadro y traza de 1 millón de eventos en 4,1 MB comprimida en columnas
  (MEDIDO, `tecnologia-web.md`). El rebobinado es INFERENCIA de diseño, con prueba en el corte 1: la huella de la réplica rebobinada es
  igual a la de la corrida continua.

### D16. Motor para agentes, con resultados verificables

- **Qué hace.** El agente del usuario (Claude, ChatGPT, Gemini, Copilot) arma, valida, corre, compara y explica modelos con
  herramientas MCP:
  - `validar_modelo`;
  - `correr_experimento`;
  - `comparar`;
  - `explicar`;
  - `optimizar`.

  Cada respuesta trae semáforo y receta, así que **lo que la IA del usuario afirma se puede comprobar**.
- **Por qué nadie así.** Simio abrió MCP el 23-09-2026 sobre un producto de escritorio caro (HECHO). Nadie entrega resultados con
  comprobante a los agentes (INFERENCIA).
- **Cómo se construye.** El motor es isomorfo, así que el servidor MCP es un paquete (`npx @anden/mcp`) que corre **el mismo motor en
  la computadora del usuario**: costo de servidor cero y la misma huella que en el navegador. WebMCP queda para cuando madure: está en
  prueba de origen en Chrome (HECHO, fuente secundaria).
- **Evidencia.** La IA que llena un esquema validado acierta mucho más que la que escribe código: Sketch2DES logró 388 de 400 (97%,
  muestra chica de 8 diagramas) contra ~30,6% de ejecución correcta en SIMCODE (HECHO).

---

## 3. El modelo de simulación

### 3.1 Un solo calendario, siete paradigmas

| Paradigma | Para qué en logística | Cómo entra al calendario | Prueba que lo valida |
|---|---|---|---|
| **Eventos discretos** (núcleo) | Todo el flujo de paquetes, pallets y camiones | Montículo por (tiempo en ticks, fase, prioridad, secuencia). Fases dentro del mismo instante: urgente (interrupciones), normal, tardía (mediciones y vista), para que medir no cambie lo medido | V01–V30, C01–C05 |
| **Procesos** (interacción de procesos) | Lógica a medida: un camión que espera muelle con paciencia, un supervisor que reasigna | Generadores de TypeScript que hacen `yield` de eventos; `request/release`, `get/put`, `anyOf/allOf`, `espera(estado, predicado)` sin sondeo, interrupciones con semántica de preempción declarada | V17–V20, C04 |
| **Agentes** | Personas, choferes, autoelevadores, robots | Diagrama de estados + reglas como procesos; consultas espaciales con grilla uniforme | P01–P05 |
| **Flujo continuo por tramos** (tasa discreta) | Granel, cupos, tanques, troncales agregados cuando el paquete individual no importa | Entre eventos las tasas son constantes: el cruce de un umbral se calcula exacto y se agenda | K04 (tanque lleno a 5,6667 min) |
| **Continuo no lineal** | Planificación de meses: crecimiento de demanda, contratación, atraso acumulado de re-entregas | Integrador con detección de cruce por cero o métodos de estados cuantizados (fase 2) | A definir con solución cerrada (crecimiento logístico) |
| **Cinemática cerrada** | Cintas con acumulación, perfiles trapezoidales, transelevadores, AGV con reservas | Tiempos exactos de fin de tramo; posición calculada solo cuando alguien mira | K01–K03 |
| **Optimizador adentro** | La operación real usa un planificador: ruteo de la última milla, asignación de muelles | La simulación llama a un solver en WebAssembly (VRP en Rust; HiGHS para programación lineal entera) como un evento más | Determinismo del solver con la misma entrada: HIPÓTESIS a verificar antes de usarlo |

Las **islas de paso fijo** (por ejemplo, tránsito fino de personas en una zona) laten solo mientras hay actividad allí. La escala de
tiempo va de segundos (el sorter) a meses (la red), con el mismo reloj (INFERENCIA de diseño, `motor-validacion.md` §2.4).

### 3.2 Objetos, niveles de fidelidad y realismo

| Familia | Objetos | Niveles | Realismo que se busca | Control contra fórmula o dato publicado |
|---|---|---|---|---|
| Flujo | Fuente, sumidero, cola, servidor, combinar y separar, lote y deslote, ruteo | F0–F2 | Exacto respecto de la teoría | Batería de colas |
| Clasificación | Sorter de lazo (bandeja basculante, banda cruzada), sorter lineal de zapatas, sorter de robots, túnel de lectura, balanza, rampa, contenedor | F0–F4 | Mecanismo: paso, huecos, ventana de desvío, lectura, recirculación, rampa llena, cierre de jaula | Capacidad teórica velocidad ÷ paso (oskon); nominales de proveedor como referencia (`realismo-logistico.md` §2.2) |
| Transporte interno | Cinta con y sin acumulación, unión, desvío, autoelevador, zorra, AGV, AMR | F1–F4 | Perfiles trapezoidales; reserva de tramos; congestión que surge | K01–K03; velocidades de fichas de fabricante (11–14,5 km/h; elevación 0,28–0,8 m/s) |
| Almacenamiento | Estantería y ubicación, pasillo, transelevador, shuttle, puerto «mercadería a la persona» | F0–F4 | Ciclo por cinemática según la lógica FEM 9.851/9.860; recorrido de picking sobre el grafo de pasillos | 20–40 ciclos dobles por hora por pasillo; ~31 por shuttle; ~300 picks por hora por puerto AutoStore (HECHO o [extracto]); momentos del tiempo de picking (Engels y otros 2022) |
| Instalación | Muelle, playa, portón, citas | F1–F3 | Turnos con adelanto o atraso; playa con capacidad; asignación por regla | Descarga paletizada contra granel: 62 contra 142 min (Supervalu, HECHO) |
| Personas | Operario, equipo, turno, pausa, habilidad, supervisor | F2–F4 | Aprendizaje, fatiga, pausas, ausentismo, reubicación | P01: curva de Loske y Klumpp; suplementos de 2–5% (HECHO) |
| Última milla | Vehículo, ruta, parada, zona, red vial con tiempos por franja | F1–F3 | Servicio por tipo de parada; fallidas y re-entregas con arrastre al día siguiente | 148 paradas, 8,1 h, 56% del tiempo en servicio (Amazon 2018; solo se citan estadísticas: licencia CC BY-NC) |
| Control | Regla, ola, corte, prioridad, plan, política escrita como proceso | — | Lo que hace el jefe de depósito, explícito y comparable | Metamórficas (cambiar la unidad de tiempo no cambia nada) |
| Medición | KPI, monitor, invariante, evento raro | — | Media, P90 y probabilidad siempre | S01–S11, X01–X02 |

**Escala de fidelidad** (definida en esta visión):

| Nivel | Qué es |
|---|---|
| F0 | Fórmula: lo que da la calculadora |
| F1 | Flujo por tramos |
| F2 | Cola con tasa efectiva |
| F3 | Mecanismo |
| F4 | Cinemático y espacial |

Las calculadoras v0 son el **F0 natural** del simulador. La calculadora 4 da «13 operarios + 1 supervisor para 8.000 paquetes por
turno» (`apps/anden/README.md`); la plantilla de hub en F3 responde «para llegar al corte con 95% de probabilidad hacen falta N».
Ese puente entre calculadora y simulación es contenido propio y una puerta de entrada (INFERENCIA).

### 3.3 Física: cinemática cerrada, sin motor de física

Los motores de física agregan no determinismo entre equipos, costo por cuadro y fenómenos que no deciden nada, como los rebotes
(INFERENCIA, `tecnologia-web.md` §6.2). Andén modela con cuentas cerradas:
- aceleración y frenado;
- velocidad máxima por eje;
- acumulación;
- separación mínima;
- uniones con prioridad o alternancia;
- fotoceldas;
- reservas de nodos y tramos para evitar choques de AGV.

Fuera de alcance: paquetes que caen, robots de seis ejes, sensores simulados. Ahí ganan NVIDIA, Siemens y Rockwell (§1.3).

### 3.4 Personas

| Componente | Modelo | Valor de referencia (fuente) | Tipo |
|---|---|---|---|
| Aprendizaje | Wright: tiempo de la unidad x = t₁·x^(log₂ b); b editable | b = 0,75–0,90 típico; picking por voz: 0,46 → 0,88 en ~9 semanas (Loske y Klumpp 2020) | HECHO |
| Fatiga | Exponencial con el tiempo trabajado (λ) y recuperación en pausa (μ) | λ = 0,0069–0,0096; μ = 0,0069–0,0096; fatiga máxima 0,906 (Kim y Jung, WSC 2022) | ESTIMACIÓN de los autores |
| Pausas | Eventos programados que bajan la capacidad de la línea | Una a media mañana y otra a media tarde, de 5 a 15 min; suplemento personal de 2–5% | HECHO (apuntes de estudio del trabajo) |
| Ausentismo | Sorteo por persona y día | Tope aceptable 5% (ADRHA vía EIL); 12,6% faltó al menos un día del mes (3er trimestre de 2025, IDESA) | HECHO |
| Inducción manual | Tasa por puesto con distribución, aprendizaje y fatiga | 1.600/h sostenible (supuesto de diseño); techo ~2.250/h | ESTIMACIÓN / HECHO autoinformado |
| Mayor ausencia lunes y después de feriados | Multiplicador opcional | Sin fuente | HIPÓTESIS (se pinta como supuesto) |

### 3.5 Demanda, tiempo y calendario

- **Dos curvas cada 15 minutos**, la de pedidos y la de llegadas físicas al hub, unidas por los horarios de corte (Flex: entre 13 y
  17 h según el vendedor [extracto]; exige más de 90% entregado en el día, HECHO).
- **Proceso de Poisson no homogéneo generado exacto** (por adelgazamiento), con multiplicadores por día y por evento (Hot Sale,
  CyberMonday) y el calendario argentino de feriados.
- La interfaz muestra la **curva de carga** junto a la de llegadas: con servicio de 1 h, el pico de carga se atrasa 59 min y se achata
  3,3% (fórmula exacta de M_t/M/∞, reproducida por simulación: MEDIDO, V28).
- Los camiones llegan **por turno** con adelanto o atraso, no al azar.
- **Multi-día:** lo que no se entregó hoy vuelve al hub mañana y compite por capacidad, y el segundo intento falla más del doble que el
  primero (HECHO, Ninja Van 2016).

### 3.6 Excepciones como flujos visibles

En 2D y 3D tienen otro color y otra ruta, con su KPI y su costo. Valores con fuente en `realismo-logistico.md` §2.5 y §5.2.

| Excepción | Rango de referencia |
|---|---|
| NO-READ | Lectura de 98,5% a 99,9% |
| Paquetes que van a respaldo | «Típicamente 5%» |
| Recirculación | Se calcula: el 3% es solo un ejemplo sin dato real |
| Mal clasificado | ≤ 0,05%, dato de proveedor |
| Dañado, no transportable, sin destino | Sin tasa con fuente |
| Entrega fallida | De 2,8% a 33% según país y fuente |
| Re-entrega | El segundo intento falla más del doble que el primero |
| Devolución | Sin tasa con fuente |

Para Argentina no hay tasa publicada de entregas fallidas. Entra como **distribución editable marcada como supuesto**.

### 3.7 Costos

El costo se asigna por actividad, evento por evento, con los mismos valores de `apps/anden/js/referencias.js`:
- convenios de Camioneros (40/89) y Comercio (130/75);
- índices FADEEAC, CEDOL y AECA-UM;
- alquiler de naves (Cushman & Wakefield);
- costo por km de la calculadora 2.

El costo por paquete sale con su intervalo y se actualiza solo cuando se actualizan los índices. Esto es lo que ningún simulador
extranjero puede tener sin una base local (INFERENCIA).

### 3.8 Datos: procedencia, importación y ajuste

- **Cada parámetro viaja con su ficha:** valor, unidad, distribución, rango válido, fuente, fecha, tipo (HECHO o ESTIMACIÓN) y nota.
  Es el formato de `realismo-logistico.md` §1 que extiende `referencias.js`.
- **Jerarquía de origen,** con insignia visible en la interfaz: dato del usuario > ajuste a sus datos > referencia con fuente >
  supuesto de la IA.
- **Importación:** CSV, XLSX (un XLSX es un zip de XML: se lee con fflate y el `DOMParser` del navegador, sin la librería `xlsx`
  congelada desde 2022, HECHO npm), exportes de WMS y registros de eventos.
- **Del registro de eventos al modelo,** con minería de procesos: pasos, frecuencias y tiempos. Simod muestra que se puede; su
  debilidad documentada son los tiempos por actividad (HECHO).
- **Ajuste de distribuciones** con bondad de ajuste (Kolmogorov-Smirnov, Anderson-Darling, criterio de información), gráfico Q-Q,
  detección de no estacionariedad (tasas que cambian en el día), autocorrelación y correlación entre atributos (peso con tamaño).
  Es el trabajo que justificó que ANDRITZ comprara Stat::Fit en enero de 2026 (HECHO).

---

## 4. Arquitectura técnica

### 4.1 Principios

1. **Una fuente única:** el documento del modelo (esquema tipado, con unidades, procedencia y versión). Todo lo demás escribe ahí con
   parches: editor, plantilla, IA, agente externo e importador.
2. **Motor isomorfo y determinista:** el mismo código en Workers, en Node (pruebas y MCP) y, si hace falta, en WebAssembly, con la
   misma huella.
3. **Orientado a datos:** arreglos tipados, sin objetos por entidad en el camino rápido; todo lo que cruza hilos viaja en bloques
   columnares **transferidos**. Transferir 1 millón de eventos tarda 8 ms, contra 5,1 s como objetos (MEDIDO).
4. **La traza es el contrato** entre el motor y todo lo demás: vista 2D, 3D, explicador, verificador, narrador.
5. **Cero servidor para calcular:** el cómputo corre en el dispositivo; el servidor solo firma licencias y, si el usuario no trae su
   clave, hace de paso a la IA.
6. **Crecer sin rehacer:** esquema y traza versionados con migraciones; contrato de bloque estable. Pasar a Rust o a WebGPU se hace
   detrás de la misma interfaz de arreglos tipados y con las mismas pruebas de huella.

### 4.2 Diagrama

```
HILO DE INTERFAZ                                        WORKERS (núcleos − 1, sin DOM)
  modelo/      documento + esquema + unidades           compilador/   esquema → tablas tipadas + chequeos estáticos
  editor/      comandos → parches (RFC 6902)            azar/         Philox por dirección + matemática propia
  ia/          entrevista y narrador → parches   ──▶    motor/        núcleo rápido + procesos + cinemática + continuo
  reproductor/ reloj, tramos, fotos, rebobinado         verificador/  invariantes en línea, conservación, Little
  vista2d/     Canvas propio (base universal)    ◀──    traza/        columnas + enlaces causales + fotos de estado
  vista3d/     three.js, carga a demanda         traza  estadistica/  salida, IC, MSER-5, KN, reducción de varianza
  resultados/  semáforo, comprobante, gráficos   en     experimentos/ réplicas, precisión objetivo, diseños
  informe/     PDF e impresión                   bloques optimizador/ bayesiano, evolutivo, robusto, reglas, cierre KN
  decision/    modo lector para el teléfono             datos/        ajuste, incertidumbre de entrada, calibración
  aula/        curso, ejercicios, corrección            explicador/   descomposición, período activo, contrafactuales, causas
                                                        raros/        división de trayectorias
TRANSVERSALES: almacen/ (IndexedDB + OPFS) · pwa/ · licencia/ (token Ed25519) · i18n/ (es, en, pt; monedas e índices por país)
FUERA DEL NAVEGADOR: mcp/ = el mismo motor en Node (npx) · ci/ = batería en Node + Chromium + Firefox + WebKit
```

### 4.3 Módulos y límites

| Módulo | Hace | Corre en | No puede |
|---|---|---|---|
| `modelo/` | Esquema, validación, migraciones, procedencia | Interfaz y Workers | Conocer la vista |
| `compilador/` | Esquema → tablas; chequeos de unidades, conectividad, estabilidad aproximada (utilización < 1 con la aproximación de redes de colas), parámetros sin uso | Worker | Usar azar |
| `azar/` | Flujos por dirección; variables con consumo fijo; matemática determinista | Worker y Node | Llamar a `Math.random`, `Math.log`, `exp`, `pow` o `sin` nativos |
| `motor/` | Calendario, bloques compilados, procesos, cinemática, continuo por tramos, fotos | Worker y Node | DOM, `Date`, tiempo real |
| `verificador/` | Invariantes en línea; balance; Little por bloque; comparación con fórmulas de colas | Worker | Mostrar resultados si algo falla |
| `traza/` | Formato columnar con tiempos en deltas enteros y enlaces causales; compresión | Worker → interfaz | Mandar objetos |
| `estadistica/` | Intervalos, percentiles, calentamiento, comparación, KN, variables de control | Worker | Calcular un intervalo con una sola corrida |
| `experimentos/` | Planificar réplicas por Worker; precisión objetivo; diseños | Workers | Agregar por orden de llegada |
| `optimizador/` | Búsqueda, restricciones de probabilidad, robustez, evolución de reglas, cierre KN | Workers | Recomendar sin cierre |
| `datos/` | Importar, ajustar, incertidumbre de entrada, calibración inversa | Workers | Inventar un valor sin marcarlo |
| `explicador/` | Descomposición, cuello dinámico, contrafactuales, cadenas causales | Workers | Redactar (eso es de `ia/`) |
| `raros/` | División de trayectorias; cotas de Monte Carlo crudo | Workers | Afirmar una probabilidad sin intervalo |
| `ia/` | Entrevista, narrador, propuestas como parches «fantasma» | Interfaz + nube o clave del usuario | Tocar el motor o escribir números |
| `vista2d/` `vista3d/` `reproductor/` | Dibujar desde tramos; rebobinar | Interfaz (u OffscreenCanvas) | Pedirle cosas al motor en cada cuadro |
| `almacen/` | Un documento por versión + cola de parches; trazas en OPFS; archivo `.anden` (zip) | Interfaz | Usar `localStorage` para modelos |

### 4.4 El motor por dentro

**Dos niveles de ejecución.**

| Nivel | Qué es | Rendimiento (MEDIDO) |
|---|---|---|
| Camino rápido | Bloques estándar (fuente, cola, servidor, cinta, muelle, sorter, rampa) compilados a tablas y callbacks, sin eventos de tiempo cero | 1,9–2,1 millones de paquetes por segundo en un hub de 3 etapas |
| Procesos | Generadores para la lógica a medida | 0,40–0,45 millones de paquetes por segundo: 4,7 veces menos |

Los dos dieron el mismo tiempo medio en sistema, 4,822 contra 4,820 min.

**ESTIMACIÓN de escala** (método: 20–30 eventos por paquete en un hub con mecanismo × 6–10 millones de eventos por segundo medidos en
el núcleo, `frontera-ia.md` y `tecnologia-web.md`):

| Hub | Tiempo por día simulado, en un hilo de la máquina de referencia |
|---|---|
| 24.000 paquetes por día | 0,05–0,12 s |
| 90.000 paquetes por día (escala del CIT de Andreani) | 0,18–0,45 s |
| 520.000 paquetes por día (capacidad de Andreani Pacheco) | 1,0–2,6 s |

En un teléfono de gama media sería entre 3 y 10 veces más, un rango supuesto que nadie midió todavía.

**Tiempo.** Ticks enteros (1 ms por defecto). Las duraciones sorteadas se redondean al tick con una regla fija. La batería verifica
que el redondeo no sesga (prueba M01: cambiar la unidad con la misma semilla multiplica todos los tiempos por el factor exacto).

**Azar.** Philox4x32-10 por dirección: clave (semilla, flujo), contador (réplica, entidad, sorteo, libre).
- Ventaja: CRN perfectos aunque cambie el modelo, sorteos con rechazo sin perder sincronía, y acceso al número n sin recorrer los
  anteriores, que sirve para rebobinar y para la GPU.
- Velocidad en JS: no medida. Regla: si rinde menos de 30 M/s, va en un módulo de WebAssembly de pocos KB.

**Preempción.** Se declara explícita para cada recurso que puede ser desalojado:
- qué pasa con el trabajo interrumpido: reanudar, reiniciar con el mismo tiempo o volver a sortear;
- adónde vuelve el desalojado: al frente de su clase o al final;
- por qué reloj cuentan las fallas: calendario o tiempo de marcha.

SimPy documenta las trampas de la preempción mezclada (HECHO); Andén no deja que sean implícitas.

**Traza.** Columnas: tipo de evento, delta de tiempo entero, entidad, lugar o recurso, estado, causa (quién tenía el recurso). Además,
fotos del estado cada N minutos para rebobinar. Pesa ~4 bytes por evento comprimida (MEDIDO: 1 millón de eventos en 4,1 MB).

**Fase 2 con regla de corte** (de `tecnologia-web.md` §10):
- Si el motor TypeScript en un teléfono de gama media no simula un día del hub modelo en menos de 1 s, el núcleo se porta a Rust
  detrás de la misma interfaz. WebAssembly rindió 1,35–1,46 veces el JS (MEDIDO).
- Las réplicas masivas en WebGPU con Philox son HIPÓTESIS: no se encontró ninguna implementación de eventos discretos en WebGPU.

### 4.5 Render 2D y 3D

- **2D propio en Canvas: es el producto.** Funciona sin GPU: ~28.000 elementos simples por cuadro a 60 fps en el modo por software de
  Chrome (MEDIDO). El plano y las estanterías se dibujan una vez; por cuadro solo se dibuja lo que se mueve.
- **3D con three.js r186, cargado a demanda.** Usa `WebGPURenderer` y cae solo a WebGL 2. Pesa 131–211 KB comprimido (MEDIDO), con
  instancias y niveles de detalle. Sin GPU no hay 3D: en software tarda 28 ms por cuadro con 1.000 cajas (MEDIDO).
- **Por qué el 3D no puede mentir:** el 3D es un **reproductor de la traza**, nunca está en el lazo del motor. Lo que se ve es lo que
  se calculó, y cualquier réplica se regenera desde su receta.
- **Video y formatos abiertos:** el video se exporta desde el navegador con WebCodecs o MediaRecorder, para compartirlo por WhatsApp.
  El 3D se exporta en glTF.

### 4.6 Workers y paralelismo

- Un Worker por núcleo menos uno: 40 réplicas de una semana tardaron 0,66 s con 4 Workers en Chromium (MEDIDO).
- Las réplicas son independientes: **no hace falta memoria compartida**. Cuando se usa, se activa con COOP/COEP solo en la ruta del
  simulador, porque esos encabezados rompen el pago embebido y el simulador insertado en otros sitios (HECHO, MDN).
- Planificación por índice de réplica; agregación ordenada.

### 4.7 Persistencia

- IndexedDB con **un documento por versión** más la cola de parches: 62 ms para 100.000 objetos, contra 23 s con una fila por objeto
  (MEDIDO).
- OPFS para las trazas grandes.
- Archivo `.anden` (zip con modelo, parches, resultados y columnas de la traza) como formato abierto de intercambio.
- Safari borra lo escrito por scripts si el sitio no se usa en 7 días (HECHO, WebKit). Por eso: pedir `persist()`, ofrecer instalar la
  app, recordar exportar y, en Pro, sincronización opcional.

### 4.8 Dónde va la IA

- La IA **nunca toca el motor**: propone parches sobre el esquema, que aparecen como fantasma en el plano. El compilador y el
  verificador son la compuerta.
- El narrador solo redacta lo que calculó `explicador/`, citando el identificador del experimento.
- La evolución de reglas genera políticas en un lenguaje chico que compila; se evalúan con semillas separadas y cierran con KN.
- Un **banco de casos con solución conocida** mide cada cambio de modelo de lenguaje y elige el más barato que pasa. Con precios en caché
  del 06-10-2026 (re-verificar), una conversión cuesta USD 0,002–0,008 con Haiku 5.5 y USD 0,03–0,17 con Sonnet 5.5 (ESTIMACIÓN,
  `frontera-ia.md`).

### 4.9 Extensibilidad

- **Nivel A, expresiones declarativas:** fórmulas con unidades, reglas en el lenguaje chico. Es seguro para modelos compartidos.
- **Nivel B, procesos en TypeScript:** corren en un Worker con dos defensas:
  - un **control de determinismo** previo, que prohíbe `Math.random`, `Date`, la iteración de objetos con claves mezcladas y la
    matemática nativa;
  - un control en tiempo de ejecución, que congela esas funciones y las hace fallar.

  Los modelos ajenos con código de nivel B se abren en un entorno aislado. Cómo aislarlos sin perder Workers (iframe con origen opaco)
  está **a verificar**; si no se puede, los modelos públicos de la galería quedan limitados al nivel A.
- **Contrato del bloque:** manifiesto con parámetros (unidades y procedencia), puertos, invariantes y al menos una prueba analítica o
  metamórfica. Sin contrato no hay «bloque verificado» en la galería.

### 4.10 Qué corre dónde y cuánto cuesta

| Pieza | Dónde | Costo para Andén |
|---|---|---|
| Motor, experimentos, optimizador, 2D, 3D | Dispositivo del usuario | 0 |
| Sitio y app | Cloudflare Pages: GitHub Pages prohíbe usos comerciales (HECHO) | 0 en el plan gratis (límites a vigilar: 500 compilaciones por mes, 20.000 archivos) |
| Licencia | Función en Cloudflare Workers que firma un token Ed25519 verificable sin conexión (plan gratis: 100.000 pedidos por día, HECHO) | 0 |
| IA | Clave del usuario, agente del usuario (MCP) o créditos incluidos en Pro | USD 0,005–0,5 por entrevista (ESTIMACIÓN) |
| Servidor MCP | La computadora del usuario (`npx`) | 0 |
| Galería pública | Almacenamiento de objetos | **A verificar** (precio no consultado) |

Meta de `mercado.md`: < USD 0,01 de servidor por usuario mensual.

---

## 5. La experiencia

### 5.1 El primer minuto (sin cuenta, en el teléfono)

Los textos y números de esta sección son de ejemplo, para mostrar la pantalla; no son resultados medidos.

1. El enlace abre un **hub de 24.000 paquetes por día** corriendo a ×60 en 2D (3D si hay GPU). Se ve:
   - la gente induciendo;
   - las bandejas girando;
   - una rampa que se pone roja y paquetes que dan otra vuelta.
2. Arriba, una sola línea: «**Costo por paquete $X (±Y) · Cuello: inducción, 62% del tiempo · Confianza: verde · Ver
   comprobante**».
3. Una pregunta con tres botones: «¿Qué querés decidir? **Gente por turno · Llegar al corte · Automatizar**».
4. El deslizador «inductores: 4 → 5» re-simula en ~150 ms con la misma aleatoriedad: «+9% de paquetes por hora (provisorio)». A los
   pocos segundos pasa a «+9% (IC 95%: +7% a +11%; 40 réplicas pareadas)».
5. Se toca un paquete rojo y aparece su historia: «perdió el corte porque…».

**Meta (HIPÓTESIS, `mercado.md` §10):** mediana de menos de 10 minutos hasta el primer resultado con datos propios.

### 5.2 La primera hora

- **Plantilla:** se elige una plantilla y se reemplazan los supuestos marcados («estos 6 valores son de referencia, no tuyos»).
- **Planilla:** se suelta una planilla de volúmenes y sale la curva de 15 minutos con su ajuste y su bondad de ajuste.
- **Escenarios:** se compara el escenario base con dos alternativas, se ve el diff en pesos con intervalo y se exporta el informe en
  PDF y el video.
- **Desde el corte 3**, se puede contar la operación (texto, audio, foto del pizarrón, PDF). La entrevista pregunta lo que falta en
  criollo y propone valores de referencia con su fuente.

### 5.3 El ingeniero experto

- **Modo ingeniero** (un interruptor):
  - editor del modelo como texto, con validación del esquema y de unidades en vivo, al lado del plano;
  - procesos en TypeScript;
  - **cuaderno de experimentos**, donde cada celda es un experimento con su receta;
  - API de Node para lotes;
  - exportación de trazas en CSV y en columnas binarias documentadas;
  - exportación a SimPy/Ciw para auditar.
- **Depuración:** puntos de parada con condición, avance evento por evento, comparación de réplicas en el punto de bifurcación.
- **Estadística a la vista:** gráfico de Welch, curva de precisión contra réplicas, tabla de KN, sensibilidad de Sobol, metamodelo
  con su banda.
- **Atajos:** paleta de comandos y teclado completo.

### 5.4 El lector (modo decisión)

Es la pantalla que más gente va a ver (`mercado.md` §3).
- Se abre en el teléfono, sin cuenta.
- Tiene de 3 a 5 deslizadores, el 2D o 3D, el costo por unidad, el cuello, el semáforo y el comprobante.
- El consultor puede ponerle su marca en el plan Equipo.

### 5.5 Plantillas iniciales

Cada plantilla trae fuentes, supuestos marcados, invariantes y su control F0. Ninguna usa datos de la empresa donde trabaja el
fundador.

| # | Plantilla | Qué decide | Calibración pública (fuente) | Control de cordura |
|---|---|---|---|---|
| 1 | **Hub de última milla con sorter de lazo** (la del corte 1) | Inductores, gente por turno, rampas, cortes | Inducción 1.600/h; capacidad por paso; sorters argentinos de 8.000–18.000/h (Andreani, prensa 2024–2026) | F0 de oskon; calculadora 4 |
| 2 | Hub de clasificación manual para Flex (pyme) | Gente y horario de corte | Reglas de Flex (Base, 15-05-2026); corte 13–17 h [extracto] | Calculadora 4 |
| 3 | Hub de robots | Robots, puestos de inducción, salidas | Correo Argentino Monte Grande: 9.000/h, 240 robots, 13 puestos, 130 salidas (HECHO, 16-12-2025) | ~690/h por puesto y 37,5/h por robot (INFERENCIA) |
| 4 | Nodo de última milla multi-día | Rutas, flota, fallidas y re-entregas | Escala de Don Torcuato: pico de 60.000 por día (HECHO); servicio por parada como referencia (Amazon 2018, solo estadísticas) | Ley de Little por día |
| 5 | Depósito pyme con picking manual | Layout, olas, lotes, reposición | ≥ 70 líneas por persona-hora como «mejor de su clase» (WERC 2025); flow rack: −4,60% de picking y +38,65% de reposición (IJPE 2023) | Momentos del tiempo de picking (Engels y otros 2022) |
| 6 | Depósito con temporarios de Hot Sale | Cuántos temporarios y desde cuándo | Curva de Loske y Klumpp; hora pico 13–14 h del Hot Sale 2026 (BAE) | P01 |
| 7 | Cross-dock con playa y turnos | Andenes, citas, granel o paletizado | 62 contra 142 min de descarga (Supervalu, HECHO) | Erlang C por andén |
| 8 | **Comparador neutral de automatización** | Manual, AMR, AutoStore o shuttle con la misma demanda | AMR 65 → 98 unidades/h (GEODIS); ~300 picks/h por puerto (AutoStore); ~31 ciclos dobles/h por shuttle (2009) | Ciclos por cinemática |
| 9 | Transelevador de pallets | Alto del rack, largo del pasillo, velocidades | 20–40 ciclos dobles/h por pasillo [extracto]; parámetro de forma 0,5–2 (UNE 58912) | Fórmula de ciclo simple y doble |
| 10 | **Laboratorio de teoría** (Aula) | Aprender colas y simulación | M/M/c, Penny Fab, la oficina y la fábrica de Law, Jackson; **el experimento de cobertura de Law reproducido en vivo** | La batería misma |
| 11 | Andén Ciudad: recolección de residuos (corte 5) | Recorridos y flota | Desafíos municipales (bitácora del 28-09-2026) | — |

---

## 6. Rigor: validación, estadística, experimentación y optimización

### 6.1 Verificación del motor (¿el código hace lo que dice?)

| Familia | Hoy (maqueta) | Meta | Ejemplos |
|---|---|---|---|
| V · teoría de colas | V01–V30: pasan todas las exigibles (V12, las aproximaciones de manual, es informativa) | ~45 | Erlang C hasta 50 servidores; insensibilidad de Erlang B; Jackson con realimentación; MVA; M_t/M/∞ |
| C · casos publicados | C01, C03 y C04 dentro de sus intervalos; C02 informativa (sin IC publicado) | ~10 | C05: taller de 5 estaciones de Law, 120,29 ± 0,63 trabajos por día (faltan datos del libro) |
| S · estadística | S01–S11 | ~20 | Cobertura de los intervalos; MSER-5; Whitt; arranque estacionario |
| R · reproducibilidad | R01–R03 | ~10 | **R04: misma huella en Chrome, Firefox, Safari y Node**; R05: agregar un muelle no cambia ni un número de las llegadas |
| K · cinemática y continuo | 0 (valores calculados) | ~15 | K01–K04 (§2, D8) |
| M · metamórficas | Parcial | ~15 | Cambio de unidad exacto; escalar tasas y tiempos; conservación por bloque |
| D · degeneradas y extremas | 0 | ~10 | ρ > 1: la cola crece con pendiente λ − cμ y el semáforo se pone rojo |
| X · eventos raros | 2 (medición nueva) | ~5 | X01: 9,5368×10⁻⁷; X02: 3,3235×10⁻⁵ |
| VR · reducción de varianza | 4 (medición nueva) | ~6 | Variables de control: factor ≥ 1,5 en M/M/5 al 90% |
| L · mecanismos logísticos | 0 | ~10 | Sorter en F3 con todos los factores en 1: llega a velocidad ÷ paso × 3.600 |
| P · personas | 0 | ~5 | P01: curva publicada de aprendizaje |
| E · explicador | 0 | ~5 | E01: encuentra la causa raíz sembrada |
| O · optimizador | 0 | ~10 problemas | Curvas de progreso en SimOpt |
| **Total** | **59 exigibles + 17 informativas** | **> 150** | ESTIMACIÓN de alcance, no compromiso |

Además, cada noche corren las pruebas diferenciales de D2: rápido contra referencia, modelos al azar y SimPy.

### 6.2 Verificación del modelo del usuario (¿el modelo hace lo que el usuario cree?)

Cada modelo, generado o editado, pasa estos controles antes de mostrar resultados. Si alguno falla, **se muestra el error, no el
número**:
- balance de flujo;
- ley de Little por bloque;
- utilización menor que 1;
- comparación con Erlang C en estaciones simples;
- calentamiento y largo de corrida;
- repetibilidad;
- sensibilidad mínima a cada parámetro, para detectar «cables sueltos»;
- invariantes declaradas.

La lista sale de `frontera-ia.md` §4.3. En pantalla se resume como «el modelo pasó 8 de 8 controles» (INFERENCIA de diseño).

### 6.3 Validación contra la realidad (¿el modelo se parece a la operación?)

Sargent (WSC 2010, HECHO) pide acordar la validación antes de construir, fijar la precisión de cada salida, hacer validez aparente
con expertos, comparar con datos reales y revisar periódicamente. Andén lo vuelve funciones:
- **modo traza** de una entidad;
- **prueba de Turing** con los datos del usuario: ¿cuál serie es la real?;
- **puntaje de calibración predictiva** con días apartados (D13);
- **reporte de validación** del modelo, que se adjunta al informe.

### 6.4 Datos de entrada

- **Ajuste y bondad de ajuste** (§3.8).
- **Llegadas no homogéneas** por tramos de 15 min, con intervalo por tramo.
- **Incertidumbre de entrada** (D6).
- **Valor de la información:** qué medir y cuántas observaciones hacen falta.
- **Procedencia** en todo.

Lo que más tiempo come en un proyecto son los datos (10–40%) y el armado (40–60%) (HECHO, Skoogh y Johansson 2009; Banks): ahí está
el ahorro de tiempo que se cobra, no en el tamaño del modelo.

### 6.5 Análisis de salida por defecto

| Decisión | Por defecto en Andén | Fundamento |
|---|---|---|
| Tipo de estudio | Terminante si hay cierre o corte; si no, estacionario. Se confirma con el usuario | Law 2023 (HECHO) |
| Réplicas | Independientes, hasta la precisión pedida (mínimo 10) | Cobertura 94,4% medida |
| Calentamiento | MSER-5 sobre el promedio entre réplicas + Welch visible + alerta si el corte pasa la mitad de la corrida; arranque en caliente desde una foto | Medición S04–S11 |
| Qué se muestra | Media, P90 y probabilidad del evento clave, con intervalo; percentiles con estadísticos de orden | Law 2023 (HECHO) |
| Varias métricas | Una métrica principal declarada, o Bonferroni | Estándar |
| Aproximaciones de manual | Como alarma al lado del resultado: «la teoría dice ~0,89 min, la simulación 0,81 ± 0,01: coherente» | Allen-Cunneen se pasó 5–9% y Kingman 3,6% (MEDIDO) |
| Costo de la precisión | Se avisa antes de correr, según la ocupación | Whitt verificado (MEDIDO) |

**Semáforo:**

| Color | Cuándo |
|---|---|
| Verde | Precisión lograda y controles pasados |
| Amarillo | Precisión no lograda, o corte de calentamiento de más de la mitad de la corrida |
| Rojo | Sistema inestable (ρ ≥ 1), o Little, conservación o un invariante violados |

### 6.6 Comparación y selección

- Dos escenarios: diferencia pareada con CRN e intervalo de t. Si cruza el cero, se dice: «no se distinguen con 40 réplicas; hacen
  falta ~160 o aceptar que la diferencia es menor que 2 min».
- De 3 a 20 escenarios: selección de subconjunto («posibles mejores» contra «rechazados»; no rechazado no quiere decir bueno).
- Para elegir el mejor: KN totalmente secuencial, con la zona de indiferencia en pesos. El cómputo crece más que linealmente al achicar
  esa zona (HECHO, Simio), así que Andén muestra el costo de pedir más fineza.

### 6.7 Diseño de experimentos y sensibilidad

- Pocos factores (≤ 5): factorial completo o 2ᵏ, con CRN.
- Muchos factores (10–100): hipercubos latinos casi ortogonales y bifurcación secuencial para descartar factores sin efecto.
- Sensibilidad local: tornado en pesos («cada punto de entrega fallida cuesta $X por paquete»).
- Sensibilidad global: Morris para filtrar y Sobol para repartir la varianza, validados contra SALib (HECHO: implementa Sobol, Morris,
  FAST, Delta, PAWN y otros).
- Metamodelos: proceso gaussiano con banda. Los metamodelos con redes de grafos dan R² ≈ 0,99 dentro del rango y se rompen fuera
  (HECHO, arXiv 2607.16769). Andén **re-simula fuera de la zona confiable**, no extrapola.

### 6.8 Optimización

El flujo de una optimización tiene seis pasos:
1. Variables tipadas.
2. Búsqueda global con presupuesto de réplicas y multi-fidelidad (horizontes cortos primero).
3. Restricciones de probabilidad.
4. CRN entre candidatos.
5. **Cierre KN** entre los mejores.
6. Prueba fuera de muestra con otra curva de demanda.

A eso se suman dos variantes: optimización **robusta** entre futuros y **evolución de reglas** con LLM, con las mismas salvaguardas
(D14). La vara pública es SimOpt. Una regla evolucionada vale si mejora ≥ 5% a la mejor regla clásica en 3 casos públicos (criterio de
`frontera-ia.md` §3.3).

### 6.9 Reducción de varianza y eventos raros: medición nueva para esta visión

**Script:** `oportunidades/proyectos/anden/visiones/rigor-medicion/varianza_y_raros.js`. Resultados en `resultados.json` de la misma
carpeta. Se corrió el 17-10-2026 en Node 22.22.0 con semillas fijas y el generador del motor de referencia; tardó 29 s. MEDIDO.

**Variables de control.**
- Modelo: tiempo medio de espera en una M/M/c terminante (N clientes desde vacío).
- Controles: las medias muestreadas de los intervalos entre llegadas y de los servicios, cuya esperanza se conoce.
- Diseño: 200 réplicas por experimento y 200 experimentos independientes, para medir la ganancia real, incluido el costo de estimar
  los coeficientes.

| Modelo | Ocupación | Clientes | Media cruda | Media controlada | Varianza |
|---|---|---|---|---|---|
| M/M/5 | 0,90 | 2.000 | 1,4289 | 1,4328 | **÷2,00** |
| M/M/5 | 0,70 | 2.000 | 0,2490 | 0,2495 | ÷1,62 |
| M/M/1 | 0,90 | 2.000 | 8,5228 | 8,5428 | ÷2,00 |
| M/M/5 | 0,90 | 500 | 1,1889 | 1,1886 | ÷2,53 |

Lectura (INFERENCIA, confianza media-alta):
- Entre 1,6 y 2,5 veces menos réplicas, gratis, en cualquier modelo donde se conozcan las medias de las entradas, que en Andén es
  siempre, porque el modelo declara sus distribuciones.
- Se suma a los CRN al comparar. Que las dos ganancias se multipliquen no está garantizado: hay que medirlo con la batería VR.

**Eventos raros por división de trayectorias.**
- Pregunta: probabilidad de que una cola M/M/1 llegue a K clientes antes de vaciarse, arrancando con 1.
- Valor exacto por la fórmula de la ruina del jugador.
- Método: esfuerzo fijo de 2.000 trayectorias por nivel.

| Caso | Exacto | División (100 corridas) | Error relativo de una corrida | Monte Carlo crudo con el mismo esfuerzo | Esfuerzo crudo para igual precisión |
|---|---|---|---|---|---|
| ρ = 0,5; K = 20 | 9,5368×10⁻⁷ | 9,62×10⁻⁷ ± 0,20×10⁻⁷ | 10,8% (518.068 pasos) | **0 casos** en 173.270 trayectorias | ~2,7×10⁸ pasos (**×515**) |
| ρ = 0,8; K = 40 | 3,3235×10⁻⁵ | 3,3250×10⁻⁵ ± 0,048×10⁻⁵ | 7,3% (2.343.189 pasos) | 10 casos en 260.868 | ~5,0×10⁷ pasos (×21) |

Lectura (INFERENCIA):
- La ventaja crece cuanto más raro es el evento.
- La maquinaria funciona y coincide con la teoría; X01 y X02 entran a la batería.
- En un hub la función de importancia hay que diseñarla. Hasta probarla (corte 3), Andén usa Monte Carlo crudo con la regla del tres
  y lo dice.

### 6.10 El contrato de honestidad: lo que Andén se niega a mostrar

1. Un intervalo calculado con una sola corrida.
2. Un resultado sin semáforo y sin comprobante.
3. «A es mejor que B» sin comparación pareada, o con un intervalo que cruza el cero.
4. Una recomendación del optimizador sin cierre KN.
5. Números cuando falla la conservación, Little o un invariante: se muestra el error.
6. Un parámetro sin procedencia visible: los supuestos se pintan distinto.
7. Una frase del narrador sin el experimento que la respalda.
8. Un promedio solo: siempre media, P90 y la probabilidad que importa.
9. Un resultado fuera del dominio de validez (nivel de fidelidad, rango de parámetros, zona del metamodelo) sin avisarlo.
10. El «85% de OEE de clase mundial» u otra cifra sin fuente (`realismo-logistico.md` §8).

---

## 7. Roadmap en cortes verticales

Cada corte se puede usar de punta a punta y es profundo en lo suyo. Las fechas encajan con P2: validación de calculadoras en
noviembre y diciembre, lanzamiento de calculadoras en enero de 2027, «Contame tu operación» y Pro en julio de 2027, y corte de
septiembre de 2027 (500 usuarios por mes o una cátedra).

**Cómo se estimó el esfuerzo (ESTIMACIÓN gruesa).** Por analogía con lo hecho el 17-10-2026: en un día salieron las 6 calculadoras v0
con 41 pruebas, el motor de referencia con su batería y las mediciones de los frentes. El rango de cada corte lo amplía 2 a 3 veces
por integración y pulido.

### Corte 0: hecho (17-10-2026)

Motor de referencia (`motor_ref.js`), batería con 59 de 59 exigibles, mediciones de rendimiento, determinismo, render, guardado y
paralelismo, y la medición de §6.9.

### Corte 1: «Hub verificado» (oct–dic 2026; ESTIMACIÓN: 10–15 sesiones largas de Claude, 3 a 6 semanas)

**Qué entrega.**
- **Motor de producción** en TypeScript borrable:
  - calendario con fases y ticks enteros;
  - Philox por dirección (o xoshiro con saltos, según la medición) y matemática propia;
  - camino rápido + procesos;
  - `Store`, `Container`, `anyOf/allOf`, preempción explícita;
  - cinta con acumulación y cinemática trapezoidal;
  - traza columnar con enlaces causales y fotos de estado.
- **Esquema v1** con unidades y procedencia, y un compilador con chequeos estáticos.
- **Plantilla 1** (hub de 24.000 paquetes por día con sorter de lazo) en F3:
  - inducción humana con aprendizaje, fatiga, pausas y ausentismo;
  - bandejas con paso, NO-READ y recirculación;
  - rampas con capacidad y vaciado;
  - jaulas, olas y cortes;
  - costos con `referencias.js`;
  - el mismo hub en F0 (calculadora 4) y en F2, con su consistencia verificada.
- **Estadística por defecto:**
  - réplicas hasta precisión con aviso de costo;
  - MSER-5 sobre el promedio;
  - CRN y variables de control;
  - comparación pareada;
  - semáforo y comprobante.
- **Explicador:** descomposición, período activo, contrafactuales con CRN y cadena causal al tocar una entidad.
- **Reproductor 2D:**
  - velocidad de ×1 a ×10.000;
  - rebobinado;
  - fantasmas de réplicas y mapas de calor por P90;
  - deslizador en vivo de ~150 ms.
- **Vista 3D** de la misma traza (three.js a demanda, instancias, niveles de detalle) y exportación de video.
- **Página «Andén Verificado»** generada por la integración continua. Se publica solo con el OK del fundador.

**Por qué ya es espectacular.** En un enlace se ve:
- un hub completo animado, con personas que se cansan y rampas que se llenan;
- un control que responde en vivo y con garantía;
- el porqué de cada atraso;
- rebobinado;
- 3D;
- una batería pública.

Ningún incumbente ofrece esa combinación en el teléfono (INFERENCIA, confianza media-alta).

**Qué construye y prueba Claude, sin nadie más.**
- La batería en Node y en Chromium, Firefox y WebKit con Playwright (si la red deja instalar los dos últimos), con R04.
- K01–K04.
- L01: el sorter en F3 con todos los factores en 1 llega a velocidad ÷ paso.
- P01, E01 y M01.
- La consistencia F2/F3.
- Las pruebas diferenciales y los modelos al azar.
- La exportación a SimPy, comparada en integración continua.
- Presupuestos de rendimiento:
  - un día del hub de 24.000 paquetes en < 0,5 s en un hilo de la máquina de referencia;
  - el deslizador en vivo en ≤ 150 ms con 4 Workers;
  - 60 fps en 2D con 10.000 entidades en el modo por software.
- Capturas automáticas en 360 px y escritorio, claro y oscuro.

**Qué necesita del fundador.**
- 1 a 2 h para revisar la plantilla del hub **con su conocimiento general**, sin nada de su empresa.
- 5 minutos para abrirla en su teléfono.
- El OK para publicar la página de verificación.

**Criterio de salida.**
- Todas las pruebas exigibles pasan en 4 motores de JavaScript con la misma huella.
- La plantilla reproduce su F0 y explica la diferencia.
- Si R04 falla en algún navegador, el núcleo numérico pasa a WebAssembly antes de seguir: se decide con la medición.

### Corte 2: «Tus datos, tu depósito» (ene–mar 2027; ESTIMACIÓN: 12–20 sesiones)

**Qué entrega.**
- **Datos:** importación de CSV, XLSX y registros de eventos; ajuste con bondad de ajuste; curvas no homogéneas; **incertidumbre de
  entrada y qué medir** (D6).
- **Plantillas:** depósito con recorridos de picking, congestión en pasillos, reposición, transelevador, cross-dock con playa y
  comparador neutral de automatización (5, 7, 8 y 9).
- **Editor 2D completo** con parches, deshacer y fantasma.
- **Escenarios** como ramas, con integración continua de KPI e invariantes.
- **Optimizador** con restricciones de probabilidad, robustez y cierre KN.
- **PWA**, archivo `.anden` y servidor MCP local (`npx`).

**Qué prueba Claude.**
- Un caso con solución analítica de incertidumbre de entrada (M/M/1 con μ estimado).
- El optimizador en 10 problemas de SimOpt, con curvas publicadas.
- Los momentos del tiempo de picking contra Engels y otros (2022).
- MCP: el modelo de referencia se arma y se corre desde Claude Code sin intervención.

**Corte de esfuerzo.** Si el motor TypeScript en un teléfono de gama media no simula un día del hub en menos de 1 s, se porta el
núcleo a Rust. La medición en teléfonos necesita al fundador o usuarios piloto.

### Corte 3: «Contame tu operación y decidí» (abr–jul 2027, junto con el v1 y el Pro de P2)

**Qué entrega.**
- **Entrevista de ingeniero:** la IA llena el esquema, detecta lo que falta y propone referencias con fuente.
- **Entrada multimodal:** foto del pizarrón y PDF del procedimiento → modelo.
- **Narrador** que cita experimentos.
- **Modo decisión** para el teléfono y galería pública.
- **Calibración inversa y puntaje de validez predictiva** (D13).
- **Eventos raros** con función de importancia para el corte y la playa (D12).
- Plantilla 6 (temporarios de Hot Sale) y plantilla 4 (nodo multi-día con re-entregas).
- **Plan Pro.**

**Qué prueba Claude.**
- Un banco de 30 o más descripciones con solución conocida: ≥ 80% llega al primer intento a un modelo que pasa la verificación
  (criterio de `frontera-ia.md`).
- Calibración: recupera un parámetro escondido dentro de su intervalo en ≥ 90% de los casos.
- Eventos raros: estimación dentro del intervalo de un Monte Carlo crudo largo, con ventaja medida.

**Qué necesita de afuera.** 10 personas reales que describan su operación (criterio de ≥ 8 en menos de 15 minutos). Requiere el OK del
fundador para cualquier contacto.

### Corte 4: «Aula y arena» (ago–dic 2027)

**Qué entrega.**
- **Curso completo en español** dentro del producto: colas, Little, Erlang, eventos discretos, estadística de salida, diseño de
  depósitos y hubs.
- **El experimento de Law reproducido en vivo**: el alumno ve con sus ojos que el intervalo ingenuo cubre 8% en vez de 95%.
- **Corrección automática por receta.**
- **Desafíos con tabla de posiciones.**
- Página de SimOpt y de la batería en inglés.
- **Decisión del fundador:** abrir el motor y la batería como código abierto (HIPÓTESIS de que la confianza y las cátedras valen más
  que lo que se puede copiar; la ventaja está en la vertical, los datos, la experiencia y la comunidad).

**Qué prueba Claude.** Los ejercicios con solución verificada y la corrección automática con trabajos sintéticos, incluidas copias
detectables.

**Hito de P2.** Una cátedra en septiembre de 2027.

### Corte 5: «Red, escala y frontera» (2028)

**Qué entrega.**
- Red multi-nodo y última milla con ruteo adentro (VRP en WebAssembly), con la capa continua para meses.
- **Gemelo que arranca del estado de hoy**: foto del WMS → «¿llegamos al corte de hoy?».
- Metamodelos para deslizadores instantáneos y evolución de reglas con LLM.
- Layouts generados y probados con los pedidos del usuario: espina de pescado a favor y en contra (`frontera-ia.md` §5).
- Inglés y portugués.
- Réplicas masivas en WebGPU **solo si** una prueba de concepto da ≥ 10 veces sobre los Workers con resultados idénticos a la
  referencia.
- Andén Ciudad.

**Qué prueba Claude.** Determinismo del solver y huellas idénticas entre el backend de Workers y el de WebGPU, o se descarta.

---

## 8. Riesgos y cómo se mitigan

| # | Riesgo | Señal temprana | Mitigación | Etiqueta |
|---|---|---|---|---|
| 1 | **Rigor que nadie valora:** el usuario quiere un número rápido, no un intervalo | Abandono antes del semáforo verde; mediana > 30 s hasta el verde | El rigor no se ve por defecto: semáforo en llano, resultado provisorio en 150 ms, precisión que llega sola en segundo plano; el detalle solo en modo ingeniero | INFERENCIA |
| 2 | **Lentitud por las réplicas** con ocupación alta | Aviso de costo > 60 s en las plantillas | Aviso antes de correr; métricas más estables; CRN + variables de control (÷1,6–2,5 medido); metamodelo | MEDIDO / INFERENCIA |
| 3 | **El determinismo entre navegadores falla** (Safari o Firefox) | R04 rojo | Matemática propia con operaciones IEEE exactas; núcleo numérico en WebAssembly sin SIMD relajado; si una plataforma falla, se avisa en el comprobante | HECHO (especificaciones) / HIPÓTESIS |
| 4 | **Teléfonos lentos** | Sin medición todavía | Regla de corte para pasar a Rust; horizonte corto en vivo; réplicas en segundo plano | HIPÓTESIS |
| 5 | **Precisión falsa con datos malos** | Supuestos sin reemplazar en modelos publicados | Incertidumbre de entrada y qué medir (D6); insignias de procedencia; contrato de honestidad | INFERENCIA, confianza alta |
| 6 | **Alcance infinito** (16 capacidades, 11 plantillas) | Cortes que se alargan más del doble de su estimación | Cortes verticales con criterio de salida; una plantilla profunda antes que diez chatas; cortes de P2 (septiembre de 2027) | INFERENCIA |
| 7 | **AnyLogic Online** baja precios o regala más | Plan gratis amplio o versión en español | La ventaja no es «el navegador» sino verificación, vertical de hubs, costos argentinos, teléfono y comprobante | HECHO (lanzamientos) / INFERENCIA |
| 8 | **La IA arma modelos plausibles pero mal** | Banco de casos < 80% | La IA solo llena el esquema; compilador, verificador e invariantes como compuerta; banco de evaluación por cada cambio de modelo de lenguaje | HECHO (Sketch2DES, SIMCODE) |
| 9 | **Sobreajuste del optimizador o de las reglas del LLM** | Mejora que desaparece fuera de muestra | Semillas separadas, prueba fuera de distribución, cierre KN obligatorio | INFERENCIA, confianza alta |
| 10 | **Código de usuario que rompe el determinismo o la seguridad** | Huellas distintas con el mismo modelo; modelos ajenos con nivel B | Control de determinismo antes y durante la corrida; entorno aislado (a verificar); la galería admite solo nivel A si no se resuelve | INFERENCIA |
| 11 | **Datos sin fuente para Argentina** (fallidas, tiempos por parada en el AMBA, patio) | Huecos de `realismo-logistico.md` §10 | Distribución marcada como supuesto; calibración inversa con datos del usuario; índice comunitario con consentimiento (largo plazo) | HECHO (huecos) |
| 12 | **Licencias de datos** | Uso del dataset de Amazon (CC BY-NC) | Solo se citan estadísticas; nada incrustado | HECHO |
| 13 | **Propiedad intelectual del empleador del fundador** | Cualquier dato, nombre o lógica de su empresa | Solo conocimiento general; consulta legal antes del módulo de última milla (ya en P2); Claude construye desde fuentes públicas | HECHO (Ley 11.723, LCT) |
| 14 | **Confianza en un fundador anónimo** | Docentes que piden «quién está detrás» | La batería pública, la exportación a SimPy y las recetas reemplazan a la cara; motor abierto (decisión del corte 4) | INFERENCIA |
| 15 | **Borrado de datos en Safari** | Usuarios de iPhone que pierden modelos | `persist()`, instalación como app, recordatorio de exportar, sincronización en Pro | HECHO (WebKit) |
| 16 | **3D que decepciona** comparado con Omniverse | Comentarios de «se ve simple» | 3D claro y fluido como comunicación, video exportable; no competir en fotorrealismo | INFERENCIA |
| 17 | **Un solo fundador + Claude para mantener un motor** | Regresiones | Batería en cada cambio, pruebas diferenciales nocturnas, esquema versionado con migraciones, TypeScript borrable sin herramientas exóticas | INFERENCIA |

---

## 9. Qué tendría que ser cierto, y qué decide el fundador

**Hipótesis que sostienen esta visión, con su prueba:**

| # | Hipótesis | Cómo se valida | Qué la refuta |
|---|---|---|---|
| H1 | La verificación pública mueve a docentes e ingenieros | Una cátedra usa la batería o el laboratorio de teoría en clase (corte 4); citas de la página «Andén Verificado» | Ninguna cátedra ni enlace entrante a los 6 meses de publicada |
| H2 | La huella es idéntica en los 4 motores de JavaScript | R04 en el corte 1 | Diferencias que no se corrigen ni con WebAssembly |
| H3 | Un teléfono de gama media simula un día del hub en < 1 s | Medición en 3 teléfonos (necesita al fundador o pilotos) | > 1 s aun con Rust |
| H4 | La precisión por defecto no se siente lenta | Mediana hasta el semáforo verde < 30 s en las plantillas | > 60 s |
| H5 | El mecanismo F3 reproduce capacidades publicadas y explica la diferencia con lo nominal | L01–L10 en los cortes 1 y 2 | Desvíos sin explicación contra F0 |
| H6 | Hay función de importancia útil para eventos raros logísticos | Corte 3 | Ventaja < 5 veces sobre el crudo en el hub |
| H7 | La IA llena el esquema de logística con ≥ 80% de modelos válidos al primer intento | Banco de 30 o más casos | < 60% con el mejor modelo de lenguaje |

**Decisiones que pide esta visión** (requieren al fundador, porque publican o comprometen):
1. Priorizar el hub de última milla con sorter como corte 1, antes que el depósito. Recomendado: es donde el fundador sabe más y donde
   no hay herramienta de mercado.
2. Publicar la página «Andén Verificado» al terminar el corte 1.
3. Abrir el motor y la batería como código abierto en el corte 4, sí o no.
4. Aceptar que la IA conversacional llega en el corte 3, no antes: el motor primero.

---

## 10. Fuentes

Consultadas el 17-10-2026 por los frentes de investigación, salvo la medición propia. Esta visión no las volvió a abrir.

**Medición propia de esta visión**
- `oportunidades/proyectos/anden/visiones/rigor-medicion/varianza_y_raros.js` y `resultados.json` (17-10-2026; Node 22.22.0).

**Informes y mediciones del repositorio**
- `conocimiento/anden-simulador-2026-10/incumbentes.md`, `frontera-ia.md`, `tecnologia-web.md`, `realismo-logistico.md`,
  `motor-validacion.md`, `mercado.md`.
- `conocimiento/anden-simulador-2026-10/medicion-motor/` (`motor_ref.js`, `validacion.js`, `resultados-validacion.json`,
  `rendimiento_generadores.js`, `des.js`, `des2.js`, `par.js`, `des_simpy.py`).
- `conocimiento/anden-simulador-2026-10/medicion-tecnologia/` (determinismo, generadores, transferencia entre hilos, render, IndexedDB,
  tamaños).
- `apps/anden/README.md` y `apps/anden/js/referencias.js` (calculadoras v0 y valores argentinos con fuente).
- `oportunidades/proyectos/P2-anden.yaml` y `perfil/fundador.md`.

**Estadística, validación y motor**
- Law (2023), WSC 2023 — https://informs-sim.org/wsc23papers/124.pdf
- Sargent (2010), WSC 2010 — https://www.informs-sim.org/wsc10papers/016.pdf
- FlexSim 2027, Experimenter — https://help.autodesk.com/view/FLEXSIMIN/2027/ENU/?guid=FlexSim_User_Manual_reference_tools_experimenter_html
- Simio, libro oficial — https://textbook.simio.com/SASMAA/
- SimPy, recursos y eventos — https://simpy.readthedocs.io/en/latest/topical_guides/resources.html
- Random123 (Salmon y otros, SC11) — https://www.thesalmons.org/john/random123/papers/random123sc11.pdf
- MDN, `Math` — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
- ECMA-262, Math — https://tc39.es/ecma262/multipage/numbers-and-dates.html
- WebAssembly, no determinismo — https://github.com/WebAssembly/design/blob/main/Nondeterminism.md
- xoshiro — https://prng.di.unimi.it/
- SimOpt — https://github.com/simopt-admin/simopt
- SALib — https://salib.readthedocs.io/en/latest/
- Método del período activo (WSC 2002) — https://informs-sim.org/wsc02papers/146.pdf
- Resimulación contrafactual (IJCAI 2018) — https://www.ijcai.org/proceedings/2018/260
- Sequential Neural Likelihood (M/G/1) — https://arxiv.org/abs/1805.07226
- Simod — https://simod.readthedocs.io
- Metamodelos con grafos — https://arxiv.org/html/2607.16769
- Skoogh y Johansson (2009) — https://www.sne-journal.org/fileadmin/user_upload_sne/SNE_Issues_OA/SNE_19_2/articles/sne.19.2.09937.tn.OA.pdf

**Incumbentes**
- AnyLogic 8.9.10 — https://www.anylogic.com/blog/anylogic-8-9-10-boost-productivity-with-the-new-ai-assistant/
- AnyLogic Online — https://www.anylogic.com/blog/welcome-to-anylogic-online-another-way-to-build-and-use-simulations/
- Simio MCP (23-09-2026) — https://www.financialcontent.com/article/bizwire-2026-9-23-aegis-software-introduces-ai-powered-interaction-for-process-simulation-and-planning-in-simio
- Siemens Copilot 2606 — https://blogs.sw.siemens.com/tecnomatix/ai-for-discrete-event-simulation-how-plant-simulation-x-copilot-accelerates-simtalk-programming/
- Plant Simulation 2606 — https://blogs.sw.siemens.com/tecnomatix/discover-whats-new-in-plant-simulation-2606/
- Emulate3D 2025 — https://www.rockwellautomation.com/content/dam/rockwell-automation/documents/pdf/events/roklive-emea-2025/digital-engineering-summit/what-is-new-in-emulate3d-2025.pdf
- FlexSim, límites por licencia — https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-feature-limitations-by-license-type/tac-p/13814419
- ExtendSim, precios — https://extendsim.com/pricing · Stat::Fit — https://extendsim.com/acquisition-statfit
- AutoMod discontinuado (fuente secundaria) — https://pmcorp.com/blog/automod-is-being-discontinued-exploring-automod-software-alternatives/
- rfp.wiki (precio de FlexSim por revendedores) — https://www.rfp.wiki/supply-chain-logistics-transportation/supply-chain-planning-solutions/supply-chain-simulation-software/flexsim/simul8

**IA y optimización**
- Sketch2DES — https://arxiv.org/abs/2607.24259
- SIMCODE — https://arxiv.org/html/2507.11014v1
- DEVS desde especificaciones — https://arxiv.org/abs/2603.03784
- FM Logistic con AlphaEvolve — https://cloud.google.com/blog/products/ai-machine-learning/how-fm-logistic-tackled-the-traveling-salesman-problem-at-warehouse-scale-with-alphaevolve
- AlphaEvolve para todos — https://cloud.google.com/blog/products/ai-machine-learning/alphaevolve-is-available-for-everyone
- ShinkaEvolve — https://arxiv.org/abs/2509.19349
- LLM y trazas de simulación (AGV) — https://arxiv.org/abs/2608.09343
- HiGHS para JavaScript — https://www.npmjs.com/package/highs · VRP en Rust — https://github.com/reinterpretcat/vrp
- Espina de pescado — https://news.uark.edu/articles/9830/fishbone-aisles-appear-to-speed-distribution
- Precios de Claude (caché del 06-10-2026; re-verificar) — https://platform.claude.com/docs/en/about-claude/pricing

**Tecnología web**
- three.js — https://www.npmjs.com/package/three
- WebGPU, estado — https://github.com/gpuweb/gpuweb/wiki/Implementation-Status
- caniuse-lite (región AR) — https://www.npmjs.com/package/caniuse-lite
- WebKit, almacenamiento — https://webkit.org/blog/14403/updates-to-storage-policy/
- Cloudflare Pages, encabezados — https://developers.cloudflare.com/pages/configuration/headers/ · límites — https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Workers, precios — https://developers.cloudflare.com/workers/platform/pricing/
- GitHub Pages, límites y usos prohibidos — https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Fiedler, «Fix Your Timestep!» — https://gafferongames.com/post/fix_your_timestep/
- DES en GPU (Kunz y otros 2012) — https://www.comsys.rwth-aachen.de/fileadmin/papers/2012/2012-kunz-pads-gpu.pdf
- WebMCP (fuente secundaria) — https://groups.google.com/a/chromium.org/g/blink-dev/c/gmYffo5WOE8/m/OJxuQRP3AAAJ

**Realismo logístico**
- Capacidad de sorters (oskon) — https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity
- Plus One Robotics — https://www.plusonerobotics.com/case-studies/pennsylvania-facility-turns-its-sorter-into-a-24-7-revenue-engine
- Andreani Pacheco — https://mercado.com.ar/protagonistas/andreani-convierte-su-planta-de-pacheco-en-el-hub-logistico-mas-automatizado-del-pais · https://www.iprofesional.com/tecnologia/453613-andreani-invierte-us30-millones-en-tecnologia-en-su-hub-pacheco-y-expande-su-operacion-a-miami
- Andreani CIT Benavídez — https://www.itsitio.com/ar/?p=180846
- Correo Argentino Monte Grande — https://mercado.com.ar/innovacion/correo-argentino-inaugura-sistema-robotico-que-triplica-la-capacidad-operativa-logistica-en-monte-grande
- Mercado Libre Don Torcuato — https://mercado.com.ar/negocios/mercado-libre-inauguro-un-centro-logistico-de-ultima-milla-en-don-torcuato
- Envíos Flex (Base) — https://base.com/es-AR/blog/envios-flex-y-same-day-en-buenos-aires-con-base/
- Hot Sale 2026 (BAE) — https://www.baenegocios.com/amp/hot-sale-2026-los-argentinos-gastan-casi-100-000-por-compra/
- Loske y Klumpp (IFAC 2020) — https://re.public.polimi.it/retrieve/584d3515-aaf1-4de0-8e95-e441327146e8/1-s2.0-S2405896320335205-main.pdf
- Kim y Jung, fatiga (WSC 2022) — https://www.informs-sim.org/wsc22papers/148.pdf
- EIL, ausentismo — https://argentina.gob.ar/sites/default/files/eil_ausentismo_ficha_metodologica.pdf
- IDESA sobre ausentismo — https://eleconomista.com.ar/politica/reforma-laboral-alerta-ausentismo-126-n92728
- Amazon Last Mile (Merchán y otros 2022) — https://cdn.amazon.science/1f/02/349d1f594f8d8f97b21ebc02c7b2/2021-amazon-last-mile-routing-research-challenge-data-set.pdf · licencia — https://registry.opendata.aws/amazon-last-mile-challenges
- Ninja Van (SUTD 2016) — https://repository.sutd.edu.sg/esploro/outputs/graduate/Impact-of-a-Delivery-Point-Network/9910595409846
- WERC 2025 (infografía Yale) — https://www.yale.com/globalassets/coms/yale/north-america/documents/white-papers/snack-drawer/YALE-1520_WERC-DC-Metrics-infographic.pdf
- Flow rack (IJPE 2023) — https://ideas.repec.org/a/eee/proeco/v261y2023ics0925527323001196.html
- Engels y otros, picking — https://arxiv.org/abs/2201.05025
- GEODIS + Locus — https://geodis.com/us-en/resources/case-studies/mini-logistics-case-study-mobile-robotics
- AutoStore en Outdoor Network — https://www.mmh.com/article/doubling_productivity_at_outdoor_network
- Multishuttle (2009) — https://www.logisticsmanager.com/12679-multishuttle-boosts-productivity-for-ferdinand-gross
- FEM 9.860 — https://vdmashop.de/en/material-handling/fem/377/fem-9.860guideline-cycle-time-calculation-for-automated-vehicle-storage-and-retrieval-systems-english?c=11
- Supervalu, paletizado contra granel — https://www.supermarketnews.com/archive/palletization-cuts-product-turnaround-times-study

**Mercado**
- Bicalho-Hoch y otros, pymes y simulación (WSC 2022) — https://informs-sim.org/wsc22papers/181.pdf
- Onshape, precios — https://www.onshape.com/en/pricing
- OpenAI, apps y MCP — https://developers.openai.com/apps-sdk
