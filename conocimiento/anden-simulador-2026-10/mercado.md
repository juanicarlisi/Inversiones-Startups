# Andén · Mercado, posicionamiento y modelo de negocio (17-10-2026)

> Frente de investigación: **mercado, posicionamiento y modelo de negocio** del simulador logístico de Andén (P2,
> `oportunidades/proyectos/P2-anden.yaml`). Complementa `incumbentes.md`, `frontera-ia.md`, `realismo-logistico.md` y
> `tecnologia-web.md` de esta misma carpeta, y la bitácora `conocimiento/2026-09-28-logistic-lab-ia-y-calculos.md`.
> **Método y límite honesto:** el presupuesto de búsquedas web de la sesión ya estaba agotado cuando empezó este frente (lo usaron
> los otros frentes). Por eso este informe se apoya en (a) **lecturas directas de fuentes primarias** (páginas de precios y de
> educación de los fabricantes, presentaciones ante la SEC, la API del Banco Mundial, artículos académicos) hechas el 17-10-2026, y
> (b) datos ya fechados y con fuente de las bitácoras previas del repositorio, que se citan como tales. Varias páginas devolvieron
> 403 o 404 (se indica). **Todo dato que decida capital se re-verifica en la fuente primaria.**
> Etiquetas: **HECHO** (fuente y fecha) · **ESTIMACIÓN** (con método) · **HIPÓTESIS** (a validar) · **INFERENCIA** (razonamiento propio).

---

## 0. Resumen (lo que más debería cambiar el diseño)

1. **El mercado grande no son los usuarios de FlexSim: son los que no simulan.** En un estudio Delphi con pymes de producción y
   logística (WSC 2022), **79% de las empresas participantes no usaba simulación de eventos discretos**; las causas que señala la
   literatura son falta de recursos y de saber hacer (HECHO). Ganarle a FlexSim en su terreno (analistas expertos, 20 años de
   objetos) es una trampa; el terreno libre es el de quien hoy decide con Excel o a ojo (INFERENCIA, confianza alta).
2. **Lo gratis de los incumbentes es diminuto; lo gratis de los que ganaron es público.** FlexSim Express tiene tope de 30 objetos;
   Arena estudiante, 150 entidades; AnyLogic PLE, 10 tipos de agente (HECHO, `incumbentes.md`). En cambio, Onshape es gratis sin
   límite de tamaño **a cambio de que los documentos sean públicos**, y SimScale hizo lo mismo en 2015 con su plan Community
   (proyectos visibles en una biblioteca pública): 600.000 usuarios registrados en sep-2024 y "más de 900.000 ingenieros" según su
   página hoy (HECHO). **Andén tiene que cobrar por la privacidad, no por el tamaño**, y cada modelo gratis tiene que ser una
   página pública que se pueda buscar, citar y duplicar (INFERENCIA).
3. **El enlace es el producto.** Figma no cobra a quien solo mira y comenta (lectores gratis en planes pagos), es 100% gratis para
   educación "sin freemium ni mejoras ocultas", y pasó de lanzamiento público en 2016 a USD 1.060 millones de ingresos en 2025 y
   +48% interanual en el segundo trimestre de 2026 (HECHO). **La experiencia de quien abre un modelo en el teléfono (sin cuenta,
   sin instalar) importa tanto como el editor**: es el motor de crecimiento (INFERENCIA).
4. **El navegador y la IA ya no alcanzan como diferencial.** AnyLogic lanzó AnyLogic Online el 15-09-2026 ("trabajá en cualquier
   navegador"), con modelos públicos de ejemplo y suscripciones comerciales "planeadas", y su asistente de IA en la versión 8.9.10
   (HECHO). AnyLogic además da PLE y su nube **gratis a estudiantes** (HECHO). La pelea por las cátedras ya empezó (INFERENCIA).
5. **La lección de Onshape es una advertencia.** Los mismos fundadores que en 1995 le ganaron al CAD de UNIX con SolidWorks en
   Windows (vendida a Dassault en 1997 por USD 300–316 millones; 7,5 millones de usuarios estimados en 2024) hicieron el CAD en el
   navegador en 2015 y lo vendieron a PTC en 2019 por USD 470 millones (HECHO). Ser técnicamente superior y estar en el navegador
   **no desplazó** a SolidWorks entre profesionales; donde sí pegó fue en educación ("millones de estudiantes y docentes", HECHO) y
   en equipos nuevos (INFERENCIA). Andén tiene que crecer por **no consumidores y por educación**, no por migración de expertos.
6. **Canva es el modelo para el no experto:** plantillas, freemium, 100 idiomas; más de 265 millones de usuarios mensuales y más de
   31 millones de pagos a fines de 2025 (**~11,7% pagan**), ARR de USD 4.000 millones (HECHO, Wikipedia con fuentes). El mercado
   de no expertos es órdenes de magnitud más grande que el de expertos (INFERENCIA).
7. **Precio: la región paga entre un quinto y la mitad.** Con datos del Banco Mundial 2025, el nivel de precios relativo a EE.UU.
   (PIB per cápita corriente / PIB per cápita PPA) es 0,46 en Argentina y Brasil, 0,54 en México, 0,38 en Colombia y 0,48 en Chile
   (ESTIMACIÓN con datos HECHO). Spotify cobra en Argentina $4.499 + impuestos contra USD 12,99 en EE.UU.: **~22% del precio** al
   tipo de cambio de referencia (ESTIMACIÓN). Propuesta: Pro a **USD 12/mes en Latinoamérica y USD 29/mes global** (HIPÓTESIS).
8. **Cobrar desde Argentina tiene un problema práctico.** Stripe no está disponible para empresas en Argentina (en Latinoamérica,
   solo Brasil y México); Paddle y Lemon Squeezy actúan como *merchant of record* por 5% + USD 0,50 por transacción (HECHO). A USD
   12 eso es ~9,2% de comisión; con pago anual baja a ~5,4% (ESTIMACIÓN). El cobro se diseña desde el día uno (empresa del holding
   prevista para feb-2027).
9. **Un canal nuevo que casi nadie usa en simulación: los agentes de IA.** El directorio de ChatGPT publica *plugins* armados sobre
   servidores MCP, con interfaz opcional y una API de *checkout* (HECHO, documentación de OpenAI, 17-10-2026). Si Andén es el motor
   que una IA llama cuando alguien pregunta "¿cuántos operarios necesito para 8.000 paquetes por turno?", la distribución la hace la
   IA y el costo de lenguaje lo paga el usuario (INFERENCIA). **Diseñar el motor primero como API verificable, después como app.**
10. **Categoría que proponemos abrir: el "gemelo de decisiones" abierto** (en inglés, *decision twin*): un modelo que se arma
    conversando, corre en el dispositivo de quien mira, sale con estadística honesta y costo, y se comparte con un enlace. No es
    "un FlexSim barato": es otra unidad de valor (la decisión compartida, no el modelo del analista) (HIPÓTESIS de posicionamiento).

---

## 1. Quién lo usaría y quién pagaría

### 1.1 Segmentos

| Segmento | Trabajo que "contrata" a Andén | Qué usa hoy | ¿Paga? (HIPÓTESIS salvo indicación) | Rol en la cartera | Quién vende por el fundador |
|---|---|---|---|---|---|
| **Estudiantes de ingeniería industrial y logística** | Aprobar la materia, hacer el TP, armar un portfolio | Arena estudiante (150 entidades), FlexSim Express (30 objetos), AnyLogic PLE, Excel (HECHO, topes) | No. Gratis siempre | Distribución y hábito: son los jefes de 2030 | El docente |
| **Docentes y cátedras** | Enseñar colas, simulación y diseño de depósitos sin pelear con licencias ni laboratorios | Licencias académicas de incumbentes; FlexSim en "más de 400 universidades", Simio en "más de 500" (HECHO) | Poco o nada en universidades públicas argentinas (INFERENCIA); quizás un plan institucional en privadas | Canal: ~100 alumnos por cuatrimestre por cátedra (supuesto de la bitácora de difusión) | Ellos mismos, en congresos y redes docentes |
| **Ingenieros y analistas en pymes, 3PL y operadores** | Decidir dotación, layout, picos, automatización, tarifas; convencer al jefe | Excel, intuición; en las grandes, FlexSim o AnyLogic con un consultor | Sí, si el ticket entra en una tarjeta personal o de la empresa sin compra formal | Caja | El modelo compartido (el jefe lo abre) |
| **Consultores independientes e integradores** | Entregar estudios más rápido y más lindos; mostrar el antes y después al cliente | FlexSim, AnyLogic, Simio, planillas | Sí: es su herramienta de trabajo | Caja y distribución: cada cliente ve Andén | Ellos, a sus clientes |
| **Proveedores de equipos** (estanterías, autoelevadores, cintas, robots) | Mostrar el retorno de su equipo en el depósito del cliente | Estudios propios o del fabricante (BEUMER y Vanderlande simulan con herramientas propias, HECHO en `incumbentes.md`) | Tal vez, por tener sus equipos con parámetros reales en la biblioteca (HIPÓTESIS sin dato) | Datos y contenido | Su fuerza de ventas |
| **Operadores de última milla y repartidores** | Saber cuánto cobrar y si la ruta cierra | Calculadoras sueltas, WhatsApp | Poco; volumen alto | Entrada por búsquedas (las calculadoras v0) | Buscadores y grupos |
| **Municipios** | Recorridos de residuos, barrido, transporte escolar | Consultoras o nada; la UBA optimizó recorridos para varias ciudades con hasta 28,6% menos km (HECHO, bitácora del 28-09) | Vía desafíos de innovación financiados (CAF, provincia) | Opcionalidad y prestigio | La convocatoria |
| **Analistas de pymes en EE.UU., Europa y Brasil** (fase 2, en inglés y portugués) | Lo mismo que en Latinoamérica, sin pagar USD 5.000–20.000 por una licencia | Excel, SimPy, JaamSim gratis, licencias caras | Sí, a precio global | Caja en dólares | Galería pública y agentes de IA |

### 1.2 La evidencia de los no consumidores

- **HECHO.** Bicalho-Hoch y otros (WSC 2022, Universidad de Kassel): en su Delphi con pymes, "la mayoría de las empresas
  participantes (79 %) no usa simulación de eventos discretos"; las que la usan ven mejoras; la literatura atribuye la resistencia a
  "falta de recursos y falta de saber hacer". Los expertos pidieron **ejemplos concretos** porque los problemas abstractos "son
  difíciles de entender". El texto no informa el tamaño de la muestra.
- **HECHO** (`incumbentes.md`): cargar datos lleva 10–40% de un proyecto de simulación y construir el modelo, 40–60%.
- **INFERENCIA.** Las dos barreras (plata y saber hacer) son justo las que Andén puede bajar: el motor corre en el dispositivo (costo
  de servidor ~0) y la entrevista con IA más las plantillas reemplazan al experto en la etapa más cara. El diseño tiene que asumir
  un usuario que **no sabe simular** sin aburrir al que sí sabe.

### 1.3 Tamaño: lo que sabemos y lo que no

| Dato | Valor | Etiqueta |
|---|---|---|
| Mercado mundial de software de simulación (amplio: incluye CAE, defensa, automotriz) | USD 26.500 millones en 2025; USD 30.100 millones en 2026; 13,0% anual a 2033; Norteamérica 36,4% | HECHO (Grand View Research, publicado feb-2026, act. jun-2026). Sin dato para eventos discretos ni para Latinoamérica |
| Unidades académicas de ingeniería vinculadas al CONFEDI (Argentina) | ~110 (conteo aproximado de logos en su sitio) | HECHO aproximado |
| Universidades con FlexSim / Simio | más de 400 / más de 500 (mundo) | HECHO (fabricantes) |
| Empresas grandes con AnyLogic | "más del 40% de las Fortune 100" | HECHO (fabricante) |
| Matrícula de ingeniería industrial en Argentina, Brasil (engenharia de produção) y México | **No conseguida** (SPU, INEP y ANUIES no se pudieron leer en esta sesión) | Falta |
| Cantidad de pymes logísticas, transportistas y 3PL por país | **No conseguida** (FADEEAC devolvió 503; CEDOL no publica socios en su portada) | Falta |

**Cómo conseguir lo que falta (método):** matrícula por carrera en la Síntesis de Información Universitaria (SPU, Argentina), en la
Sinopse del Censo da Educação Superior (INEP, Brasil) y en los anuarios de ANUIES (México); empresas por rama de actividad
(transporte de carga y almacenamiento) en el SIPA o en el Mapa Productivo-Laboral del CEP XXI, y en el RNTRC de la ANTT en Brasil.
Para la decisión de 2027 alcanza con el orden de magnitud: **la tesis no depende del tamaño total, sino de que una fracción chica de
un universo de decenas de miles de ingenieros y estudiantes use Andén cada semana** (INFERENCIA).

---

## 2. Cuánto se paga hoy

### 2.1 Incumbentes (detalle y fuentes en `incumbentes.md`, salvo lo marcado con *)

| Producto | Entrada paga | Gratis o educativo | Etiqueta |
|---|---|---|---|
| FlexSim (Autodesk) | ~USD 6.000/año (revendedor) + soporte USD 195–595/año | Express: 30 objetos. *Libro de texto oficial (5ª ed.) **gratis** en PDF; "más de 400 universidades" | HECHO (precio, secundario) |
| AnyLogic | Professional ~USD 18.990+ por puesto (terceros); anyLogistix USD 21.800/año (oficial) | PLE: 10 tipos de agente, sin uso comercial. *PLE y *nube **gratis para estudiantes**; *University Researcher con "precio especial"; *AnyLogic Online (15-09-2026) con suscripciones "planeadas" | HECHO |
| Plant Simulation (Siemens) | X Essentials ~USD 419/usuario/mes, hasta 500 objetos | Estudiante: 80 objetos, Windows | HECHO (secundario) |
| Simio (Aegis) | Cotización | Copia académica personal USD 25; becas; más de 500 universidades | HECHO |
| Arena (Rockwell) | Cotización | Estudiante: 150 entidades | HECHO |
| ExtendSim (ANDRITZ) | Pro USD 4.995–9.995 + USD 899/año | — | HECHO (lista oficial) |
| SIMUL8 (Minitab) | Desde USD 6.049/usuario/año | Versión gratis listada | HECHO (secundario) |
| JaamSim | Gratis (código abierto) | Gratis | HECHO |

### 2.2 Referencias de herramientas que ganaron (consultadas el 17-10-2026)

| Herramienta | Precio | Gratis | Etiqueta |
|---|---|---|---|
| Figma | Professional USD 16/mes por puesto completo (USD 12 dev, USD 3 colaboración); Organization USD 55; Enterprise USD 90; cada puesto incluye créditos de IA (3.000/mes en Professional) | Starter gratis; lectores gratis en planes pagos; educación 100% gratis | HECHO (figma.com/pricing, /education) |
| Onshape (PTC) | Standard USD 1.500/usuario/año; Professional USD 2.500/año | Plan gratis sin uso comercial y **con todos los documentos públicos**; educación gratis; programa para startups gratis | HECHO (onshape.com/pricing) |
| SimScale | Planes pagos a cotización | Community gratis: 10 simulaciones, hasta 2.000 horas-núcleo; proyectos privados solo en planes pagos | HECHO (simscale.com/product/pricing) |
| Spotify (referencia de precio regional) | EE.UU.: USD 12,99/mes (estudiantes USD 6,99). Argentina: $4.499/mes + impuestos (estudiantes $2.299) | 1 mes de prueba | HECHO (spotify.com/us y /ar) |

**INFERENCIA.** Hay tres modelos de "gratis": **diminuto** (incumbentes: alcanza para aprender, no para un depósito real),
**educativo** (Figma, Onshape, AnyLogic para estudiantes) y **público** (Onshape, SimScale: gratis completo a cambio de que el
trabajo sea visible). El público es el único que además fabrica contenido, posicionamiento en buscadores y prueba social. Para
Andén, con el cálculo en el dispositivo, el costo marginal de un usuario gratis es casi cero (`tecnologia-web.md`), así que puede
ser más generoso que cualquiera.

---

## 3. Cómo crecen las herramientas producto-primero

### 3.1 Casos y mecanismos

| Herramienta | Mecanismo de crecimiento | Dato | Lección para Andén |
|---|---|---|---|
| **Figma** | Navegador + multijugador + enlace; lectores gratis; educación gratis; Community (oct-2019) con más de 3.000 plugins; acuerdo con Google for Education para Chromebooks (jun-2022) | Ingresos 2025: USD 1.060 millones; T2-2026: USD 370,1 millones (+48% interanual); 13 millones de usuarios (2025); Adobe intentó comprarla por ~USD 20.000 millones (sep-2022) y desistió por los reguladores (dic-2023), con USD 1.000 millones de compensación | HECHO (10-Q ante la SEC; Wikipedia; Adobe) |
| **Canva** | No expertos, plantillas, freemium, 100 idiomas; educación gratis desde dic-2019 | +265 M usuarios mensuales, +31 M pagos, ARR USD 4.000 M (2025); 750.000 usuarios el primer año; rentable en 2017 con 294.000 pagos | HECHO (Wikipedia con fuentes) |
| **Onshape** | CAD en el navegador; gratis con documentos públicos; educación gratis desde abr-2016; actualizaciones cada 3 semanas "sin instalar" | Fundada en 2012 por ex-CEO de SolidWorks; vendida a PTC por USD 470 M (nov-2019); "millones de estudiantes y docentes" | HECHO |
| **SolidWorks** (1995) | Cambio de plataforma (Windows contra UNIX) y precio más bajo | Dassault la compró en 1997 por USD 300–316 M; ~7,5 M de usuarios estimados (2024) | HECHO (Wikipedia) |
| **SimScale** | CAE en el navegador; plan Community gratis con proyectos públicos (dic-2015) | 600.000 registrados (sep-2024); "más de 900.000 ingenieros" (oct-2026) | HECHO |
| **Omni Calculator** | Calculadoras gratis que rankean en buscadores | "Más de 19 millones de visitas por mes"; ~40 personas | HECHO (omnicalculator.com/about-us) |
| **PhET y GeoGebra** | Simulaciones y matemática gratis para educación, traducidas | PhET: código abierto, 48 idiomas en el selector, financiado por fundaciones; GeoGebra: vendida a Byju's por ~USD 100 M (dic-2021) | HECHO |
| **Factorio** | Juego de optimizar logística | 3,5 M de copias (dic-2022); la expansión vendió 400.000 copias en su primera semana (oct-2024); equipo de 31 personas | HECHO (Wikipedia) |
| **Desafío de ruteo de última milla de Amazon + MIT** | Competencia abierta con datos reales | USD 175.000 en premios (2021); publicaciones y entrevistas a los mejores | HECHO (routingchallenge.mit.edu) |

**INFERENCIAS que salen de la tabla:**
1. **La unidad que viaja es el artefacto compartido** (un diseño de Figma, una plantilla de Canva, un documento de Onshape). En
   Andén esa unidad es **el modelo abierto en un enlace**, con video exportable del 3D: cada estudio que un consultor le manda a un
   cliente, cada TP que un alumno entrega y cada posteo en LinkedIn es un anuncio gratis.
2. **Educación gratis es necesaria pero no paga** (GeoGebra, PhET). Hace falta el escalón profesional desde el principio.
3. **La logística optimizada engancha como juego** (Factorio) y como competencia (Amazon/MIT). Hay un espacio para desafíos públicos
   con tabla de posiciones que hoy ningún simulador profesional ocupa (no encontramos ninguno; no prueba que no exista).

### 3.2 Conversión de gratis a pago

| Referencia | Valor | Etiqueta |
|---|---|---|
| Freemium autoservicio | 3–5% bueno, 6–8% muy bueno | HECHO (Poyar y Rachitsky, Lenny's Newsletter, 01-08-2023) |
| Freemium con ayuda de ventas | 5–7% bueno, 10–15% muy bueno | HECHO (ídem) |
| Prueba gratis | 8–12% bueno, 15–25% muy bueno | HECHO (ídem) |
| Apps de consumo, descarga → pago a 35 días | Freemium 2,1%; *paywall* duro 10,7% (medianas) | HECHO (RevenueCat 2026, bitácora del 26-09-2026) |
| Canva, pagos / usuarios mensuales | ~11,7% | ESTIMACIÓN (31 M / 265 M) |
| Caso de P2 (2030) | 200 pagos / 13.000 usuarios = ~1,5% | ESTIMACIÓN (supuestos del proyecto) |

**INFERENCIA.** El caso de P2 es conservador contra los benchmarks, pero el denominador correcto no son "usuarios de calculadoras"
sino **modeladores activos** (gente que arma o edita un modelo en el mes). Medir los dos por separado.

---

## 4. Qué hace que un ingeniero cambie de herramienta

| # | Motor del cambio | Evidencia | Qué implica para Andén |
|---|---|---|---|
| 1 | **La aprendió en la facultad** | FlexSim en +400 universidades con libro gratis; Simio en +500; AnyLogic gratis para estudiantes; Arena sostenida "por inercia de libros de texto" (`incumbentes.md`). HECHO | Un **curso completo en español dentro del producto** (teoría + ejercicios con solución verificada + corrección automática), mejor que el libro gratis de FlexSim |
| 2 | **Un 10x en algo que hace seguido** | El tiempo se va en datos (10–40%) y en construir el modelo (40–60%). HECHO | El 10x es **"de mis datos a un resultado en minutos"**: importar planillas y exportaciones de WMS, plantillas, entrevista |
| 3 | **Los demás pueden ver el resultado sin licencia** | Figma: lectores gratis. HECHO | Modo "decisión" para el jefe o el cliente: deslizadores, 3D, costo y confianza, en el teléfono, sin cuenta |
| 4 | **Confianza en los números** | Law (WSC 2023): un método de intervalo de una sola corrida dio 7,2% de cobertura real contra 95% prometido, y está en productos comerciales. HECHO | **Página pública de validación** (contra fórmulas de colas y casos publicados) y estadística honesta por defecto: es la "cara" de un fundador anónimo |
| 5 | **Riesgo bajo de cambiar** | La consolidación (Autodesk, Minitab, ANDRITZ, Aegis) y AutoMod discontinuado al 31-12-2026 (fuente secundaria). HECHO | Formato abierto y exportable; "tu modelo es tuyo"; convivir con FlexSim (Andén para los estudios rápidos) antes que exigir migrar |
| 6 | **No pedirle nada a sistemas** | Onshape: "sin instalaciones ni manejo de archivos"; Figma en Chromebooks. HECHO | Nada que instalar, ni servidor de licencias; anda en la PC del laboratorio y en el teléfono |
| 7 | **Precio por debajo del umbral de compra formal** | Inferencia de los planes de Figma (USD 16) y Onshape (USD 125/mes) frente a FlexSim (~USD 500/mes) | Pro pagable con tarjeta personal, mensual, sin cotización |

---

## 5. Cómo ganaron los que entraron a mercados dominados

| Entrante → incumbente | Qué cambiaron | Resultado | Patrón |
|---|---|---|---|
| SolidWorks → CAD de UNIX (1995) | Plataforma (PC con Windows) y precio | Vendida en 2 años; hoy ~7,5 M de usuarios | Nueva plataforma + precio |
| Figma → Adobe (2016–2025) | Navegador, multijugador, enlace, lectores gratis, educación gratis | USD 1.060 M de ingresos (2025); Adobe quiso comprarla | El enlace como producto |
| Canva → Adobe | No expertos, plantillas, idiomas | +265 M usuarios mensuales | Mercado nuevo (no consumidores) |
| Onshape → SolidWorks (2015–2019) | Navegador, control de versiones, sin instalar, gratis público | USD 470 M; fuerte en educación | Superioridad técnica sin desplazar al líder |
| SimScale → CAE de escritorio | Navegador, gratis con proyectos públicos | 600.000 registrados (2024) | Gratis público → biblioteca |

**INFERENCIA (la que más pesa):** los que ganaron en grande (Canva, Figma) **agrandaron el mercado** con gente que antes no usaba la
categoría o no podía colaborar; los que solo hicieron "lo mismo pero mejor y en el navegador" (Onshape) lograron una salida digna pero
no destronaron al líder. Para Andén: **la vara de "superar a FlexSim" no es tener más objetos, es que mucha más gente tome mejores
decisiones logísticas con simulación** (y, de paso, que los expertos lo usen para lo rápido y para mostrar).

---

## 6. Qué categoría nueva podría abrir Andén

| Candidata | Qué es | A favor | En contra | Etiqueta |
|---|---|---|---|---|
| **Gemelo de decisiones abierto** (*decision twin*) | Modelo armado conversando, que corre en el dispositivo, con estadística honesta, costo y "qué cambiar", compartible con un enlace | Une lo que nadie junta (entrevista, costo local, honestidad, teléfono, enlace); coincide con `frontera-ia.md` | Hay que explicar el término | **Recomendada** (HIPÓTESIS) |
| Simulación para agentes de IA ("el Wolfram de las operaciones") | El motor que llaman ChatGPT, Claude o Copilot para responder preguntas de operación | Distribución sin vender; costo de IA cero para Andén | Depende de directorios ajenos; difícil de monetizar directo | Canal más que categoría (HIPÓTESIS) |
| Arena de operaciones | Desafíos públicos con datos y tabla de posiciones (estudiantes, profesionales, patrocinadores) | Factorio y Amazon/MIT muestran el enganche; recluta talento para las empresas | Necesita patrocinadores; algo de horas del fundador | Componente (HIPÓTESIS) |
| Benchmark abierto de operaciones | Productividades y costos anónimos de quienes aceptan compartir ("¿tu depósito está en el cuartil de arriba?") | Foso de datos; contenido para prensa y para la IA | Privacidad y calidad de datos; necesita masa crítica | Componente de largo plazo (HIPÓTESIS) |
| "FlexSim barato en español" | Lo mismo, más barato | Fácil de entender | Guerra de funciones contra 20 años de objetos; AnyLogic Online ya está en el navegador | Descartada como posicionamiento (INFERENCIA) |

**Recomendación:** abrir **"gemelo de decisiones"** como categoría, con tres componentes que lo hacen difícil de copiar juntos:
galería pública de modelos, arena de desafíos y el motor disponible para agentes. Los incumbentes no lo pueden copiar sin canibalizar
licencias de USD 6.000–21.800 (INFERENCIA).

---

## 7. Posicionamiento

**Declaración (borrador, HIPÓTESIS):**
> Para quien maneja o estudia una operación logística y hoy decide con Excel o a ojo, **Andén es el gemelo de decisiones**: le contás
> tu operación (texto, audio, foto o planilla), la ves en 2D y 3D en tu teléfono y te dice el cuello de botella, cuánta gente o
> cuántos vehículos hacen falta y cuánto cuesta cada paquete, con la confianza de cada número. A diferencia de FlexSim o AnyLogic, no
> hay que instalar nada, no hay que saber simular, está en español con costos locales y cualquier persona abre el resultado con un
> enlace.

**Mensajes por segmento (HIPÓTESIS):**

| Segmento | Mensaje | Prueba que lo sostiene |
|---|---|---|
| Jefe de depósito o de hub | "Cuántas personas por turno para el Hot Sale, en 10 minutos" | Plantilla + caso resuelto con números fechados |
| Ingeniero/analista | "La simulación que no te deja mentir" | Página de validación; réplicas e intervalos por defecto |
| Consultor | "Tu estudio, en un enlace que tu cliente entiende" | Modo decisión con tu marca (pago) |
| Docente | "Tu cátedra entera, gratis, sin laboratorio ni licencias" | Curso en español con corrección automática |
| Estudiante | "Armá el depósito de tu TP y mostralo en tu CV" | Perfil público con modelos |
| Global (inglés) | "The decision twin: model it by talking, run it on any device, share it with a link" | Galería y validación en inglés |

**Lo que no hay que decir:** "el FlexSim barato", "IA que arma el modelo" (ya lo dicen AnyLogic y Siemens), "gemelo digital" a secas
(remite a sensores y robots, `frontera-ia.md`), números de ahorro sin caso publicado.

---

## 8. Precios (Latinoamérica y global)

### 8.1 Insumos

| Insumo | Valor | Etiqueta |
|---|---|---|
| Nivel de precios relativo a EE.UU., 2025 (PIB per cápita corriente / PPA) | Argentina 0,46 · Brasil 0,46 · México 0,54 · Colombia 0,38 · Chile 0,48 · Perú 0,51 · España 0,65 | ESTIMACIÓN con datos HECHO (API del Banco Mundial, act. 08-10-2026) |
| Spotify Argentina / EE.UU. | $4.499 / USD 12,99 → **~22%** (a $1.545 por dólar, sin impuestos) | ESTIMACIÓN |
| Dólar oficial minorista de referencia | ~$1.545 (25-09-2026) | HECHO (`radar/contexto-macro.md`) |
| Comisión de *merchant of record* | Paddle 5% + USD 0,50; Lemon Squeezy 5% + USD 0,50 (más cargos menores fuera de EE.UU.) | HECHO |
| Stripe para empresas | No disponible en Argentina; sí en Brasil y México | HECHO (stripe.com/global) |
| Costo de IA por entrevista | USD 0,005–0,5 según modelo | ESTIMACIÓN (`frontera-ia.md`) |
| Costo de cálculo | ~0 para Andén: corre en el dispositivo | INFERENCIA (`tecnologia-web.md`) |

### 8.2 Propuesta de planes (HIPÓTESIS a probar)

| Plan | Para | Latinoamérica | Global | Qué incluye / qué lo limita |
|---|---|---|---|---|
| **Público** | Todos | Gratis | Gratis | Motor completo, **sin tope de tamaño**; los modelos son públicos (con herramienta para anonimizar); créditos de IA chicos; marca "Hecho con Andén" |
| **Educación** | Estudiantes y docentes verificados | Gratis | Gratis | Modelos privados, aulas, curso, corrección automática, desafíos de cátedra |
| **Pro** | Ingeniero, analista, consultor individual | USD 12/mes o USD 120/año (en moneda local) | USD 29/mes o USD 290/año | Modelos privados, importar planillas y WMS, informes, comparación de escenarios, más créditos de IA, optimización, video sin marca |
| **Equipo** | Consultoras, pymes, 3PL | USD 25 por editor/mes | USD 59 por editor/mes | **Lectores gratis** (Figma), espacio compartido, versiones, marca propia en el modo decisión, enlaces privados |
| **Institución** | Facultades que quieren algo más | USD 240 por cuatrimestre (supuesto de P2) | A validar | Integración con el campus virtual, reportes de cátedra, soporte |
| **Desafíos patrocinados** | Empresas que buscan talento o ideas | A validar (sin dato de mercado) | A validar | Datos del caso, premio, tabla de posiciones, contacto con finalistas |
| **Plantillas de autor** | Consultores que venden plantillas | Comisión del 30% (HIPÓTESIS) | Ídem | Galería con calificaciones |

**Por qué así (INFERENCIA):**
- Global a USD 29/mes es **~6% de FlexSim** (USD 348/año contra ~USD 6.000) y queda debajo de Onshape Standard (USD 125/mes):
  entra en una tarjeta sin compra formal. Latinoamérica a USD 12 es ~41% del global, en línea con el nivel de precios regional
  (0,38–0,54) y por encima del ~22% de Spotify, razonable para una herramienta de trabajo.
- A USD 12 por mes la comisión del *merchant of record* es ~9,2%; con pago anual (USD 120) baja a ~5,4%. **Empujar el pago anual**
  y, para Argentina, sumar cobro local en pesos cuando exista la empresa del holding (Mercado Pago: comisiones no verificadas en esta
  sesión, la página devolvió 403).
- Como el cálculo es local, **no se cobra por tamaño ni por corridas**: se cobra por privacidad, colaboración, datos, informes y IA.
  Es lo contrario de los incumbentes y es el diferencial de precio más difícil de copiar para ellos.

### 8.3 Qué tendría que ser cierto (ESTIMACIÓN, método: aritmética sobre supuestos)

Para **USD 10.000 de ingreso mensual recurrente** (≈ el doble de los ~USD 5.280 por mes del caso de P2 en 2030), una mezcla posible: 300 Pro latinoamericanos ×
USD 12 = USD 3.600; 100 Pro globales × USD 29 = USD 2.900; 30 equipos × 3 editores × ~USD 40 promedio = USD 3.600. Son 430
cuentas y ~490 puestos pagos; con una conversión de 3% sobre modeladores activos (el piso "bueno" de los benchmarks) hacen falta **~16.000
modeladores activos por mes**. Para comparar: SimScale juntó 600.000 registrados en ~11 años con un plan gratis público y en inglés
(HECHO). La meta es exigente pero no absurda si hay inglés, galería y agentes; con solo español y calculadoras, el caso de P2 (200
pagos) es el realista.

---

## 9. Canales sin venta directa

| # | Canal | Quién vende por el fundador | Horas del fundador (ESTIMACIÓN) | Métrica | Etiqueta |
|---|---|---|---|---|---|
| 1 | **Enlaces compartidos** (modo decisión, video del 3D, inserción en blogs) | El usuario que comparte | 0 | Visitantes por enlace; % que crea cuenta | INFERENCIA (patrón Figma/Canva) |
| 2 | **Galería pública de modelos** | Buscadores y respuestas de IA | 0 | Visitas orgánicas; duplicaciones | INFERENCIA (patrón Onshape/SimScale) |
| 3 | **Calculadoras v0 como puerta** | Buscadores | 0 | Cálculos por semana; paso a simulador | HECHO de Omni (19 M visitas/mes) |
| 4 | **Cátedras**: curso en español, gratis | El docente | 2–3 presentaciones a docentes de su red, con su OK | Cátedras activas; alumnos por cátedra | HIPÓTESIS |
| 5 | **Congresos y redes académicas**: COINI (29-10-2026), plenaria del CONFEDI (05-11-2026), Rally Latinoamericano de Innovación (más de 200 sedes en 11 países) | Organizadores y docentes | Postular un desafío o un trabajo (Claude lo prepara; requiere aprobación) | Equipos inscriptos | HECHO (fechas en confedi.org.ar) / HIPÓTESIS (encaje) |
| 6 | **Desafíos abiertos patrocinados** (arena) | El patrocinador y los participantes | Bajas; contactar patrocinadores es venta, así que solo si llegan solos | Participantes; patrocinadores entrantes | HIPÓTESIS (precedente Amazon/MIT) |
| 7 | **Agentes de IA**: servidor MCP propio, directorio de ChatGPT, conectores de Claude | La IA del usuario | 0 | Llamadas externas por mes | HECHO (directorio basado en MCP con *checkout*) / HIPÓTESIS (uso) |
| 8 | **Informe mensual de costos logísticos** con los índices (CEDOL informó +2,55% en septiembre) | Prensa y respuestas de IA que lo citan | 0 | Citas y enlaces entrantes | HECHO (CEDOL) / HIPÓTESIS (citas) |
| 9 | **Consultores**: plan Equipo con marca propia, afiliados con comisión recurrente, plantillas de autor | Los consultores, a sus clientes | 0 | Cuentas Equipo; clientes que abren enlaces | HIPÓTESIS |
| 10 | **YouTube y videos cortos sin cara** con simulaciones 3D | La plataforma | 0 (Claude produce) | Vistas; visitas | INFERENCIA (el 3D animado es contenido que se comparte) |

Datos de contexto (HECHO, bitácora del 28-09-2026): las respuestas de IA refirieron 1.130 millones de visitas en jun-2025 (+357%),
~1% del tráfico web pero con conversión de 5–16%; las respuestas de IA de Google recortan ~58% los clics del primer resultado,
mientras las páginas con utilidad real (calculadoras, herramientas) siguen rankeando; las páginas de empresa en LinkedIn llegan a
~1,6–5% de sus seguidores.

---

## 10. Métricas

**Norte (propuesta, ajusta la de P2):** **decisiones compartidas por semana** = modelos con al menos un escenario comparado y abierto
por al menos una persona además de quien lo armó. Captura las tres cosas que importan: uso real, decisión y viralidad. La de P2
("cálculos y simulaciones por semana") queda como métrica de volumen.

| Etapa | Métrica | Meta inicial (HIPÓTESIS, a recalibrar con datos propios) |
|---|---|---|
| Activación | Tiempo hasta el primer resultado con datos propios | Mediana < 10 minutos |
| Activación | % de nuevos que corren un modelo en la primera sesión | Medir línea base en el lanzamiento |
| Viralidad | Enlaces compartidos por modelador activo; % de lectores que crean cuenta | Medir; el objetivo es K > 0,3 |
| Retención | Modeladores que vuelven a la 4ª semana | Medir línea base |
| Educación | Cátedras activas; alumnos por cátedra; TP entregados | 1 cátedra en sep-2027 (corte de P2) |
| Monetización | Conversión a pago sobre modeladores activos | 3–5% (benchmark freemium, 2023) |
| Confianza | % de modelos que pasan la verificación automática; casos en la página de validación | 100% de las plantillas verificadas antes de publicar |
| IA externa | Llamadas al motor desde agentes; citas en respuestas de IA | Medir |
| Galería | Modelos públicos; visitas orgánicas; duplicaciones | Medir |
| Costo | Costo de servidores por usuario mensual | < USD 0,01 (coherente con sitio estático y cálculo local) |

**Cortes:** se mantienen los de P2 (sep-2027: 500 usuarios por mes o una cátedra; Pro: menos de 10 pagos a los 6 meses → revisar
precio y valor). Se agrega uno: **si a los 6 meses del simulador menos del 10% de los modelos se comparte con otra persona, el
"enlace como producto" no está funcionando** y hay que rediseñar el modo decisión antes de invertir en más funciones (HIPÓTESIS).

---

## 11. Qué cambia en el diseño del producto (lista concreta)

1. **Cada modelo es una página pública por defecto** (URL legible, ficha con título, descripción, licencia, autor con seudónimo,
   botón "duplicar"), con una herramienta para anonimizar nombres, volúmenes y costos antes de publicar. La privacidad es el pago.
2. **Modo decisión** separado del editor: abre en el teléfono sin cuenta, con 3 a 5 deslizadores, el 3D, el costo por unidad, el
   cuello y un semáforo de confianza. Es la pantalla que más gente va a ver.
3. **Sin tope de tamaño en lo gratis.** Los topes de 30–150 objetos de los incumbentes son el contraste del mensaje.
4. **Curso completo en español dentro del producto** (colas, Little, Erlang, eventos discretos, diseño de depósitos y hubs), con
   ejercicios que se corrigen solos y que el docente arma en minutos; que supere al libro gratis de FlexSim.
5. **Página pública de validación**: cada plantilla contra la teoría y contra casos publicados, con el error medido. Sustituye la cara
   del fundador como fuente de confianza.
6. **Motor como API desde el primer día**: esquema de modelo abierto, servidor MCP, respuestas con supuestos y confianza para que
   cualquier IA lo use y lo cite.
7. **Exportables que viajan**: video del 3D, imagen para LinkedIn, inserción en blogs, informe PDF, todos con "Hecho con Andén".
8. **Importar lo que la pyme ya tiene** (Excel, CSV, exportaciones de WMS) antes que importar modelos de FlexSim.
9. **Arena**: desafíos con datos, reglas, tabla de posiciones y perfiles públicos; empieza con desafíos de cátedra.
10. **Benchmark con consentimiento**: guardar, solo si el usuario acepta, parámetros anónimos (productividades, tiempos) para un índice
    comunitario fechado.
11. **Precio por valor, no por cómputo**: nada en la interfaz dice "te quedan X corridas".
12. **Idiomas desde la arquitectura**: español primero, inglés y portugués preparados (textos, unidades, monedas, índices por país).
13. **Cobro con *merchant of record*** y precios regionales en el primer lanzamiento pago; pago anual destacado.

---

## 12. Riesgos de mercado

| Riesgo | Señal | Mitigación | Etiqueta |
|---|---|---|---|
| AnyLogic baja al navegador y a educación gratis | AnyLogic Online (15-09-2026), PLE y nube gratis para estudiantes | Español, teléfono, costos locales, hubs y última milla, estadística honesta, galería pública, curso; no competir por ser "el primero en el navegador" | HECHO / INFERENCIA |
| Autodesk mete FlexSim en su paquete educativo gratis | FlexSim ya es de Autodesk y las licencias pasan a cuentas Autodesk desde la 2027; **no pudimos verificar** si entra en el plan educativo (la página devolvió 403) | Vigilar; diferenciar por el curso en español y la experiencia en el teléfono | HECHO parcial / Falta |
| La educación no paga | GeoGebra, PhET | Escalón Pro y Equipo desde el lanzamiento del simulador | INFERENCIA |
| Baja disposición a pagar en pymes de la región | Nivel de precios 0,38–0,54 | Precios regionales, anual, valor demostrado en el gratis | ESTIMACIÓN |
| Desconfianza por ser anónimo | Ingenieros confían en nombres conocidos | Validación pública, fuentes y fechas en todo, formato abierto | INFERENCIA |
| Guerra de funciones contra FlexSim | 20 años de bibliotecas | Ganar en otra unidad de valor (decisión compartida); profundidad solo donde Andén lidera (hubs, última milla, costos) | INFERENCIA |
| Dependencia de directorios de IA y de buscadores | Cambios de reglas (Google castigó páginas finas en mar-2026, bitácora del 28-09) | Varios canales; la galería y el producto como canal propio | HECHO / INFERENCIA |

---

## 13. Lo que no pudimos verificar (y cómo conseguirlo)

- Matrícula de ingeniería industrial en Argentina, Brasil y México; cantidad de pymes logísticas y 3PL por país (§1.3).
- Usuarios mensuales de Figma y la proporción de no diseñadores (el prospecto ante la SEC supera el tamaño que podemos leer; el 10-Q
  de jun-2026 sí se leyó para los ingresos).
- Números de Canva Education, de Onshape Education y de las galerías públicas de AnyLogic Cloud.
- Si FlexSim está en el plan educativo gratis de Autodesk.
- Precios académicos de FlexSim, AnyLogic University Researcher y Arena (todos "a cotización").
- Comisiones de Mercado Pago para suscripciones; si Paddle o Lemon Squeezy pagan a cuentas de Argentina.
- Tarifas de consultores de simulación en la región (Upwork devolvió 403).
- Disposición a pagar real: se mide con una página de precios con botones de interés antes de cobrar (experimento sin vender,
  requiere OK del fundador para publicarla).

---

## 14. Fuentes (todas consultadas el 17-10-2026 salvo indicación)

**Lecturas directas de este frente**
- Bicalho-Hoch, Özkul, Wittine y Wenzel (2022), "A tool-based approach to assess simulation worthiness and specify sponsor needs for SMEs", WSC 2022: https://informs-sim.org/wsc22papers/181.pdf
- Figma, precios: https://www.figma.com/pricing/ · educación: https://www.figma.com/education/
- Figma, formulario 10-Q del trimestre al 30-06-2026 (presentado el 05-08-2026): https://www.sec.gov/Archives/edgar/data/1579878/000162828026053348/fig-20260630.htm · listado de presentaciones: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001579878&type=10-Q
- Figma (historia, Adobe, salida a bolsa, usuarios, ingresos 2025): https://en.wikipedia.org/wiki/Figma
- Adobe, fin del acuerdo con Figma (18-12-2023): https://news.adobe.com/news/news-details/2023/adobe-and-figma-mutually-agree-to-terminate-merger-agreement
- Onshape, precios: https://www.onshape.com/en/pricing · educación: https://www.onshape.com/en/education · historia: https://en.wikipedia.org/wiki/Onshape
- SolidWorks, historia: https://en.wikipedia.org/wiki/SolidWorks
- Canva, datos 2025: https://en.wikipedia.org/wiki/Canva (la página oficial https://www.canva.com/about/ devolvió 403)
- SimScale, precios: https://www.simscale.com/product/pricing/ · historia: https://en.wikipedia.org/wiki/SimScale
- Omni Calculator: https://www.omnicalculator.com/about-us
- PhET: https://phet.colorado.edu/en/about · GeoGebra: https://en.wikipedia.org/wiki/GeoGebra
- Factorio: https://en.wikipedia.org/wiki/Factorio
- Amazon Last Mile Routing Research Challenge (MIT CTL, 2021): https://routingchallenge.mit.edu/
- Lenny's Newsletter, "What is good free-to-paid conversion" (01-08-2023): https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion
- AnyLogic, inicio: https://www.anylogic.com/ · academia: https://www.anylogic.com/resources/anylogic-for-academia/ · compra: https://www.anylogic.com/purchase/ · AnyLogic Online: https://www.anylogic.com/features/online-simulation/ · nube: https://www.anylogic.com/features/cloud/ · blog de lanzamiento (15-09-2026): https://www.anylogic.com/blog/welcome-to-anylogic-online-another-way-to-build-and-use-simulations/
- FlexSim, inicio: https://www.flexsim.com/ · academia: https://www.flexsim.com/academia/ · tienda: https://www.flexsim.com/store/
- Inchainge, The Fresh Connection: https://inchainge.com/the-fresh-connection/
- Bizagi Modeler (modelador gratis con simulación de procesos): https://www.bizagi.com/en/platform/modeler
- Grand View Research, mercado de software de simulación (feb-2026, act. jun-2026): https://www.grandviewresearch.com/industry-analysis/simulation-software-market
- Banco Mundial, PIB per cápita corriente y PPA (API, act. 08-10-2026): https://api.worldbank.org/v2/country/ARG;BRA;MEX;COL;CHL;PER;USA;ESP/indicator/NY.GDP.PCAP.CD y .../NY.GDP.PCAP.PP.CD
- Spotify, precios: https://www.spotify.com/ar/premium/ · https://www.spotify.com/us/premium/
- Stripe, países: https://stripe.com/global · Paddle, precios: https://www.paddle.com/pricing · Lemon Squeezy, precios: https://www.lemonsqueezy.com/pricing
- OpenAI, documentación de plugins y directorio de ChatGPT (MCP, *checkout*): https://developers.openai.com/apps-sdk
- CONFEDI (unidades académicas, agenda de oct–nov 2026, Rally Latinoamericano de Innovación): https://confedi.org.ar/
- CEDOL (costos logísticos de septiembre, +2,55%): https://www.cedol.org.ar/
- Sin acceso (403/404/503): openai.com, canva.com/about, upwork.com, mercadopago.com.ar/costs-section, autodesk.com/education, fadeeac.org.ar, argentina.gob.ar (SPU), portal.abepro.org.br (sin datos).

**Bitácoras del repositorio usadas (con sus fuentes adentro)**
- `conocimiento/anden-simulador-2026-10/incumbentes.md` (precios, topes gratis, consolidación, Law 2023, quejas).
- `conocimiento/anden-simulador-2026-10/frontera-ia.md` (AnyLogic Online y asistente, Simio MCP, costo de IA por entrevista).
- `conocimiento/anden-simulador-2026-10/tecnologia-web.md` (cálculo en el dispositivo, exportar video).
- `conocimiento/2026-09-28-difusion-costo-cero.md` (respuestas de IA, Google, LinkedIn).
- `conocimiento/2026-09-28-municipio-y-estado.md` (desafíos de innovación, recorridos municipales).
- `conocimiento/2026-09-26-generador-imagenes-ia.md` (RevenueCat 2026).
- `radar/contexto-macro.md` (tipo de cambio de referencia).
- `oportunidades/proyectos/P2-anden.yaml` (supuestos del caso de negocio).
