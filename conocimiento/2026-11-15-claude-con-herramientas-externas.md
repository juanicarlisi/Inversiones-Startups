# Claude con herramientas externas: multiplicadores de capacidad y lo que habilitan

*Bitácora de exploración, 15-11-2026. Autor: explorador. Pedido del fundador: «exploración sin límites» de herramientas que multiplican lo
que Claude puede construir, a partir del caso del gemelo digital de una planta hecho con fotos, croquis, plano y three.js.*

> **Cómo leer este documento.** Cada afirmación lleva una marca:
> **HECHO-O** = verificado en la fuente oficial en esta sesión; **HECHO-S** = dos o más fuentes secundarias coinciden (re-verificar en la
> oficial antes de gastar o integrar); **S1** = una sola fuente secundaria, posible error; **CONOCIDO** = dato estable y ampliamente
> documentado que no se re-verificó hoy; **ESTIMACIÓN** (con método); **INFERENCIA** (razonamiento propio); **HIPÓTESIS** (a validar).
> Todas las búsquedas se hicieron el 15-11-2026.

---

## 0. En una página

- **La idea central (INFERENCIA):** el gemelo de la planta salió extraordinario porque juntó tres cosas que Claude solo no tiene:
  **ojos** (leer fotos, planos y videos), **manos** (motores que dibujan, simulan o fabrican: three.js, Blender, CAD, motores de física)
  y **un circuito de prueba** (un navegador que muestra el resultado para corregirlo). Los multiplicadores más potentes de 2026 son los que
  completan ese circuito en disciplinas nuevas: 3D fotorrealista desde fotos, CAD que se puede fabricar, video por código, voz y música
  locales, datos satelitales, y **canales de distribución nuevos** (apps dentro de Claude y ChatGPT).
- **Lo que más cambió en 2026 (HECHO-O/S):** Blender tiene servidor MCP **oficial** (v1.0.0 abril 2026) y conector oficial en Claude;
  three.js renderiza *gaussian splats* de forma nativa desde r186 (septiembre 2026); World Labs vende mundos 3D generados a **USD 1,20–2,48**
  por API; Claude in Chrome es de uso general desde el 26-08-2026; MCP Apps (interfaces interactivas dentro del chat) es estándar final;
  hay modelos libres para 3D (TRELLIS.2, MIT), música (ACE-Step 1.5, MIT) y voz (Kokoro, Apache-2.0) que corren sin servidor pago.
- **Pruebas reales (corridas el 15-11-2026, §5):** P1 voz: kokoro-js 1.2.1 **no trae voces en español** (solo inglés), pero el modelo sí
  las tiene y con Python salieron en español inteligible, aunque a 0,7x tiempo real en 4 CPU; P2 CAD: 10 de 10 variantes válidas en STL
  y STEP, 0,02–0,31 s cada una; P3 splat: Spark 2.4.0 en Chromium sin GPU **renderiza bien (captura), pero a 0,2–0,3 cuadros por segundo**.
- **Top 5 para empezar (§6c):** (1) packs de activos 3D logísticos en Fab; (2) Hub Nocturno y juegos hermanos en portales web con reparto
  de ingresos; (3) modelos imprimibles paramétricos en plataformas de impresión 3D; (4) «foto → gemelo» de naves y depósitos en
  autoservicio; (5) Andén como app dentro de Claude/ChatGPT (MCP App) como canal de distribución gratuito.

---

## 1. Método y límites

1. Se revisó qué herramientas ya usa el repositorio (búsqueda en el código): ya están **three.js/WebGPU, MapLibre, deck.gl, Phaser,
   DuckDB, Pyodide, PyVRP, OR-Tools, SimPy, Playwright y Rive**. No aparecen: Blender por código, gaussian splats, generación de 3D con
   IA, Remotion/Manim, CAD por código (CadQuery/build123d), IFC/BIM, voz o música locales, transformers.js, Docling, satélite, MCP Apps.
   Esos son los candidatos «nuevos».
2. 34 búsquedas web y 8 lecturas de páginas oficiales (dos bloqueadas con 403: blender.org/lab y npmjs.com). Muchos resultados son blogs
   secundarios que **se contradicen en números**; donde pasa, se dice.
3. El documento se escribió sin terminal; las tres pruebas se corrieron después, el mismo día, con terminal (ver §5).

---

## 2. Mapa de multiplicadores por disciplina

Columnas: **Qué desbloquea** (lo que Claude solo no puede); **Cómo lo maneja Claude** (CLI, SDK, API, MCP, navegador); **Licencia/costo**;
**Madurez** (A = producción, B = usable con cuidado, C = experimental); **Verif.** (marca de evidencia).

### 2.1 3D y mundos

| Herramienta | Qué desbloquea | Cómo la maneja Claude | Licencia / costo | Mad. | Verif. |
|---|---|---|---|---|---|
| **Blender MCP oficial** (Blender Lab) | Modelar, texturizar, iluminar y renderizar con calidad de estudio; exportar glTF para la web | MCP (requiere Blender 5.1+ y el complemento); conector oficial en Claude desde 28-04-2026 | Blender GPL (los archivos que produce son tuyos) | B | HECHO-S (v0.1.0 marzo → v1.0.0 27-04-2026 → v1.0.3 11-09-2026). El proyecto comunitario homónimo tuvo 4 CVE en 2026 (S1): usar el oficial |
| **Blender sin interfaz** (`blender -b --python`) | Lo mismo, por lotes, en un servidor sin pantalla | CLI + Python (bpy) | GPL, gratis | A | CONOCIDO |
| **Spark** (World Labs) | Mostrar escenas fotorrealistas de *gaussian splats* dentro de three.js, mezcladas con mallas; edición y animación de splats en tiempo real | npm, JS | MIT, gratis | A–B | HECHO-O (repo: MIT, formatos PLY, SPZ, SPLAT, KSPLAT, SOG; instala 2.4.0). Versiones 2.3 (30-09-2026) y 2.4 (20-10-2026) con LoD paginado: HECHO-S |
| **three.js r186** | Splats nativos en WebGPU sin librería extra | npm | MIT | B | S1 (radiancefields, 08-09-2026) |
| **Brush** | **Entrenar** un splat a partir de fotos/video, incluso en el navegador (WebGPU) | CLI, binario Rust, bindings JS | Apache-2.0 | C (un solo mantenedor) | HECHO-S |
| **World Labs Marble / World API** | Generar un **mundo 3D explorable** desde texto, una imagen, varias imágenes o video | API REST con créditos | USD 1 = 1.250 créditos; mundo estándar 1.500–1.600 créditos (**USD 1,20–1,28**), «plus» hasta USD 2,48; borrador USD 0,12–0,20; exportar splat gratis; malla GLB USD 2,80 | B | HECHO-O (docs.worldlabs.ai/api/pricing). **Términos de uso comercial: no figuran en la página de precios; leerlos antes de usar** |
| **TRELLIS.2** (Microsoft) | Imagen → objeto 3D texturizado | Python, requiere GPU (≈ alquiler por hora) | MIT | B | HECHO-S (publicado 16-12-2025, 4.000 M parámetros) |
| **Hunyuan3D** (Tencent) | Lo mismo | Python / servicio | Licencia comunitaria **no válida en UE, Reino Unido y Corea**; las versiones 3.x solo alojadas | B | HECHO-S → **descartado para productos** (licencia) |
| **Rapier / Jolt** (física) | Choques, apilado, vehículos, ragdolls deterministas en el navegador | npm (WASM) | Apache-2.0 / MIT | A | CONOCIDO; Godot 4.6 adoptó Jolt por defecto (HECHO-S) |
| **WebXR** | Ver el gemelo o un mundo en un visor VR/AR desde el navegador, sin app | API del navegador vía three.js | Estándar web | A | CONOCIDO |

### 2.2 Mapas, geoespacial, satélite y clima

| Herramienta | Qué desbloquea | Cómo la maneja Claude | Licencia / costo | Mad. | Verif. |
|---|---|---|---|---|---|
| **Overture Maps** (edificios, lugares, calles) | ~72 M de comercios y lugares del mundo, huellas de edificios, consultables por zona sin descargar todo | DuckDB (SQL remoto sobre GeoParquet), catálogo STAC | Abierto (licencias por tema: verificar cada una) | A | HECHO-O (docs: DuckDB ≥ 1.1; 72.444.739 lugares en el listado del 21-01-2026; campo `categories` reemplazado en sep-2026) |
| **Microsoft Planetary Computer / Earth Search** | Imágenes Sentinel-2 y Landsat (vegetación, agua, construcción) de cualquier lugar, gratis | STAC + Python (pystac-client) | Catálogo y API gratis | A | HECHO-S |
| **Open-Meteo** | Clima histórico y pronóstico sin clave | API REST | Gratis no comercial; comercial pago | A | CONOCIDO (verificar plan comercial) |
| MapLibre, deck.gl, PMTiles | Mapas vectoriales y capas de millones de puntos | npm | BSD/MIT | A | Ya en uso en el repo |

### 2.3 Simulación y optimización

| Herramienta | Qué desbloquea | Licencia | Verif. |
|---|---|---|---|
| SimPy, PyVRP, OR-Tools | Eventos discretos y ruteo | Abiertas | Ya en uso |
| **HiGHS** | Programación lineal/entera de primer nivel (planificación de turnos, compras, mezcla) — también en el navegador vía WASM | MIT | CONOCIDO |
| **Mesa** | Modelos de agentes (personas, vehículos, clientes que deciden) | Apache-2.0 | CONOCIDO |
| **Física de sólidos (Rapier)** aplicada a carga | Estiba realista de pallets y bultos en un camión o contenedor | Apache-2.0 | INFERENCIA de uso |

### 2.4 Visión por computadora y documentos

| Herramienta | Qué desbloquea | Cómo | Licencia | Mad. | Verif. |
|---|---|---|---|---|---|
| **SAM 3** (Meta) | Segmentar y seguir «todos los X» en fotos y video con una frase («pallets», «autoelevadores») | Python, GPU | Licencia SAM propia: comercial y sin regalías, pero Meta puede cambiarla y prohíbe ingeniería inversa | B | HECHO-S (19-11-2025) |
| **Docling** (IBM) | PDF/escaneos → texto, tablas y estructura limpios (Markdown/JSON) | Python, CLI | MIT | A | HECHO-S (licencia confirmada para 2024; no hay noticia de cambio) |
| **Raster-to-Vector / CubiCasa5k** | Plano en imagen → paredes, puertas y ambientes vectoriales → extrusión 3D | Python | Verificar licencia de cada repo | C | HECHO-S (código académico, dependencias viejas) |
| Visión de Claude | Leer croquis, fotos y planos y proponer medidas | nativo | — | A | Probado en el gemelo |

### 2.5 Video y animación por código

| Herramienta | Qué desbloquea | Cómo | Licencia / costo | Mad. | Verif. |
|---|---|---|---|---|---|
| **Remotion** | Videos hechos con React: cada dato, mapa o lección se vuelve un video renderizado en serie | npm + CLI; «Agent Skills» oficiales para Claude Code (ene-2026) | **Gratis para personas y empresas de hasta 3 personas**; pago: USD 0,01/render (mín. USD 100/mes) o USD 25/puesto/mes | A | HECHO-O |
| Motion Canvas, **Manim** | Animación vectorial y matemática explicativa | npm / Python | MIT | A | CONOCIDO |
| ffmpeg | Cortar, unir, subtitular, transcodificar | CLI | LGPL/GPL | A | CONOCIDO |
| Rive, Lottie | Animación interactiva liviana | Ya en uso (Rive) | — | A | Ya en uso |
| **Veo 3.1** (Google) | Generar clips de video realistas con audio | API Gemini | USD 0,05–0,60 por segundo según calidad (8 s a 1080p ≈ USD 0,64–3,20); sin plan gratis | A | HECHO-S (varias fuentes; un revendedor da USD 0,75/s: descartado como atípico) |

### 2.6 Audio, voz y música

| Herramienta | Qué desbloquea | Cómo | Licencia / costo | Mad. | Verif. |
|---|---|---|---|---|---|
| **Kokoro 82M / kokoro-js** | Voz sintética de buena calidad **dentro del navegador**, sin servidor | npm (WebGPU o WASM) | Apache-2.0 | B | HECHO-S. **Prueba P1 (§5): `kokoro-js` 1.2.1 lista solo 28 voces en inglés (20 en-us, 8 en-gb) y rechaza las españolas; las voces españolas existen en el modelo (`ef_dora`, `em_alex`) y funcionan por Python (`kokoro-onnx`, MIT), no en el navegador/Node con esta librería.** |
| Whisper (vía transformers.js) | Transcripción local, sin enviar audio a nadie | npm | MIT | A | CONOCIDO |
| **ACE-Step 1.5** | Canciones completas generadas localmente (< 4 GB de VRAM según autores), salida apta para uso comercial según la ficha | Python | MIT; datos de entrenamiento «licenciados o libres» según los autores (sin auditoría independiente) | B | HECHO-S (arXiv 2602.00744, ene-2026) |
| ElevenLabs Music API | Música por API con derechos comerciales en planes pagos | API | USD 0,15–0,30 por minuto (fuentes en conflicto) | A | S1 / conflicto |
| Gemini Live / OpenAI Realtime | Agentes de voz en tiempo real (hablar con una app) | API | Titular bajo (≈ USD 0,02/min audio en Gemini, S1), pero un agente real con razonamiento cuesta **USD 0,30–0,90/min** según un blog (S1) | A | S1, conflicto |

### 2.7 CAD, arquitectura, ingeniería, impresión 3D

| Herramienta | Qué desbloquea | Cómo | Licencia | Mad. | Verif. |
|---|---|---|---|---|---|
| **build123d / CadQuery** | Piezas reales, paramétricas y fabricables (STEP, STL, DXF) escritas como código | Python; **build123d-mcp** y **agentcad** como MCP | Apache-2.0 | A (librería) / B (MCP) | HECHO-S. El autor de build123d-mcp reporta que con el MCP la validez de CAD sube de 88 % a 100 % (autodeclarado, jun-2026) |
| **web-ifc / That Open Engine** | Abrir, consultar y mostrar modelos BIM (IFC) en el navegador sobre three.js | npm (WASM) | MPL-2.0 | B | HECHO-S |
| IfcOpenShell + Bonsai (Blender) | Crear y editar BIM con código | Python | LGPL | A | HECHO-S |
| **KiCad MCP** | Diseño de placas electrónicas asistido; importa Altium/Eagle; piezas JLCPCB | MCP (comunitario) | Verificar | C | HECHO-S (varios forks; números de herramientas en conflicto) |
| OpenSCAD, FreeCAD | Alternativas CAD | CLI/Python | GPL/LGPL | A | CONOCIDO |

### 2.8 Ciencia y matemática

| Herramienta | Qué desbloquea | Licencia | Verif. |
|---|---|---|---|
| **Boltz-2** | Predicción de estructura y afinidad proteína–molécula ~1.000× más rápida que métodos físicos (autodeclarado) | MIT (código y pesos, uso comercial) | HECHO-S (jun-2025) |
| RDKit (también en JS) | Química computacional en el navegador | BSD | CONOCIDO |
| Pyodide / JupyterLite | Python científico entero en el navegador | MPL/BSD | Ya en uso (Pyodide) |
| **Typst** | Documentos tipográficos perfectos por código; **PDF etiquetado accesible por defecto** desde 0.14 (24-10-2025) | Apache-2.0 | HECHO-S |

### 2.9 Datos y aprendizaje automático en el navegador y en el dispositivo

| Herramienta | Qué desbloquea | Licencia / costo | Verif. |
|---|---|---|---|
| **transformers.js v4** | Modelos de texto, visión, audio y voz en el navegador con WebGPU (backend reescrito en C++ con ONNX Runtime) | Apache-2.0 | HECHO-S (preview 09-02-2026; v4.0 general; 4.2 y 4.3 con salida estructurada) |
| **Apple Foundation Models** | Modelo de ~3.000 M parámetros en el iPhone, **inferencia gratis**, sin red, salida tipada | Gratis (iOS 26 + dispositivo con Apple Intelligence) | HECHO-S (Apple Newsroom sep-2025). Solo Swift: para apps nativas |
| DuckDB-WASM | SQL analítico de millones de filas en el navegador | MIT | Ya en uso |

### 2.10 Automatización de navegador y de computadora

| Herramienta | Qué desbloquea | Verif. |
|---|---|---|
| **Claude in Chrome** | Claude opera sitios con las sesiones del usuario: formularios, portales sin API, varias pestañas; acciones autónomas con clasificador de seguridad | HECHO-O: uso general en todos los planes pagos desde el 26-08-2026; solo Chrome; inyección de instrucciones «sigue siendo un blanco móvil» |
| Playwright | Pruebas y capturas automáticas | Ya en uso |
| Uso de computadora (escritorio) | Operar programas de escritorio sin API | CONOCIDO (requiere la app de escritorio) |

### 2.11 Ecosistema MCP, agentes de larga duración y orquestación

| Herramienta | Qué desbloquea | Verif. |
|---|---|---|
| **MCP Apps** (SEP-1865) | Un servidor MCP entrega **interfaz interactiva** (HTML en iframe aislado) dentro de Claude, ChatGPT y otros: un simulador, un mapa o un formulario dentro de la conversación | HECHO-O (estado «Final», creada 21-11-2025; co-diseñada con el Apps SDK de OpenAI) |
| Registro oficial MCP | Descubrimiento de servidores | S1: conteos de terceros entre ~10.000 (sep-2026) y ~52.000 (28-10-2026); el registro sigue en «preview» |
| **Rutinas de Claude Code** (`/schedule`) | Agentes que corren solos en la nube de Anthropic con horario, por API o por eventos de GitHub, con repos y conectores | HECHO-S (vista previa desde 14-04-2026) |
| **Managed Agents, despliegues programados** | Lo mismo para productos, por API | HECHO-S (docs de la plataforma; beta pública ~jun-2026) |
| Directorio de apps de ChatGPT | Distribución dentro de ChatGPT | HECHO-S: a comienzos de 2026 **sin cobro dentro de la app** (solo enlaces externos y checkout de bienes físicos); estado a nov-2026 no confirmado |

### 2.12 Juegos

| Herramienta | Qué desbloquea | Verif. |
|---|---|---|
| Godot 4.5/4.6 + MCP comunitarios | Motor completo con exportación web; varios MCP exportan sin interfaz | HECHO-S; **no hay MCP oficial de Godot** (no apareció en la búsqueda) |
| Phaser, PlayCanvas | 2D/3D web | Phaser ya en uso |
| Portales web (CrazyGames, Poki) y Telegram Mini Apps | Público propio que juega en el navegador; Telegram reporta > 500 M usuarios mensuales de mini apps y cobra en Stars (el desarrollador recibe bastante menos que el precio de lista, S1) | HECHO-S para Telegram; portales: CONOCIDO, condiciones a verificar |

### 2.13 Publicación y comercio

| Canal | Qué es | Verif. |
|---|---|---|
| **Fab** (Epic) | Mercado de activos 3D, sonidos, plugins; **88 % para el vendedor** según la documentación de Epic; una fuente habla de baja a 70–80 % desde 15-09-2026 y se contradice | HECHO-S para 88 %; cambio sin confirmar. Fab tiene página de política de IA: los activos hechos con IA se declaran |
| Plataformas de impresión 3D (MakerWorld, Printables, Cults3D) | Demanda propia de modelos imprimibles | HIPÓTESIS (condiciones de pago no verificadas hoy) |
| Tiendas de apps, directorios MCP/ChatGPT | Distribución | Ver arriba |

### 2.14 Fuera de las categorías (el ~20 %)

- **Hardware simulado e IoT:** KiCad MCP + firmware + simuladores (Wokwi, CONOCIDO) permiten diseñar un aparato completo sin tocar un
  soldador. Útil más adelante para sensores de depósito (Andén). Hoy: opcionalidad, no negocio.
- **Accesibilidad como obligación:** la Ley Europea de Accesibilidad rige desde el 28-06-2025 (CONOCIDO) para comercio electrónico,
  libros electrónicos, banca, etc. Typst genera PDF etiquetado por defecto y Docling lee los viejos: hay una cadena «documento viejo →
  documento accesible» que hace Claude casi entera.

---

## 3. Los 8 multiplicadores que más sorprenden

| # | Multiplicador | Por qué sorprende |
|---|---|---|
| 1 | **Gaussian splats en three.js (Spark, r186) + Brush** | Un video de celular del depósito real se vuelve una escena **fotorrealista** navegable en el navegador, y se le pueden superponer los objetos simulados de Andén. Es el salto del gemelo «modelado» al gemelo «filmado». |
| 2 | **World Labs World API** | Por ~USD 1,20 un texto o una foto se vuelve un **mundo explorable** que se exporta gratis como splat. Lugares que no existen más (Jerusalén del siglo I) o que todavía no existen (una nave proyectada). |
| 3 | **Blender MCP oficial** | Claude maneja el programa 3D profesional por excelencia con conector oficial: calidad de estudio sin artista. |
| 4 | **MCP Apps** | Ya no hace falta que el usuario venga a tu web: tu simulador aparece **dentro** de Claude o ChatGPT cuando alguien pregunta algo relacionado. Es un canal de distribución, no solo técnica. |
| 5 | **build123d + MCP** | Del texto a una pieza **fabricable** (STEP/STL) con validez medible: Claude pasa de software a objetos físicos. |
| 6 | **Voz, transcripción y música locales** (Kokoro, Whisper, ACE-Step, todo libre) | Funciones de audio con costo de servidor **cero** y privacidad total; encaja con la directriz de «minimizar servidores». |
| 7 | **Rutinas y agentes programados en la nube** | Claude trabaja con horario aunque la computadora esté apagada: el ingreso «casi pasivo» empieza a tener un operador que no duerme. |
| 8 | **Overture + DuckDB + Sentinel** | Todo comercio, edificio y calle del planeta, más imágenes satelitales gratis, consultable con SQL sin servidor: un analista geoespacial completo. |

---

## 4. Combinaciones (18) y lo que habilita cada una

| # | Combinación | Producto que habilita |
|---|---|---|
| C1 | Video de celular + Brush + Spark + simulación de Andén | Gemelo fotorrealista de un depósito real con el flujo simulado encima |
| C2 | Plano (imagen) + Raster-to-Vector + visión de Claude + three.js | Plano → layout 3D editable en minutos («foto a gemelo» en autoservicio) |
| C3 | Blender MCP + TRELLIS.2 + Fab | Fábrica de packs de activos 3D por nicho (logística, industria, iglesia) vendidos en un mercado con demanda propia |
| C4 | World API + Spark + texto bíblico verificado | Recorridos 3D de lugares bíblicos dentro de Senda, con lo interpretativo marcado |
| C5 | MapLibre + Overture + Remotion | Videos de mapas animados producidos en serie (viajes de Pablo, rutas logísticas, historia) |
| C6 | Andén + MCP Apps | Simulador logístico que se abre dentro de Claude/ChatGPT cuando alguien pregunta por su depósito |
| C7 | build123d + plataformas de impresión 3D | Modelos paramétricos («hacé el organizador a tu medida») que se venden solos |
| C8 | build123d + kit imprimible de «Vivir la historia» | Fichas y figuras 3D imprimibles del juego de mesa de Senda |
| C9 | Rapier + Andén | Estiba física de camiones y contenedores (qué entra, qué se cae) |
| C10 | Docling + DuckDB-WASM + Nido | Resúmenes de tarjeta y extractos leídos y analizados **en el dispositivo**, sin servidor ni datos en la nube |
| C11 | Whisper local + Apple Foundation Models | Organización personal por voz, privada y con costo de inferencia cero |
| C12 | Kokoro (vía Python; kokoro-js no tiene español) + lector de Senda | Lectura en voz alta de textos propios **pregenerada** (en CPU no llega a tiempo real, P1); no es Lany: Lany no habla |
| C13 | ACE-Step + Remotion + rutinas | Canal musical o de ambientes que se produce y publica solo con calendario |
| C14 | Planetary Computer + Overture + Typst | Informe de terreno (agua, vegetación, construcción, comercios cerca) en PDF impecable |
| C15 | Docling + Typst | Conversión de documentos viejos a PDF accesible (obligación europea) |
| C16 | web-ifc + simulación de Andén | Simular la operación sobre el modelo BIM del edificio antes de construirlo |
| C17 | Open-Meteo + datos de aeropuertos + Hub Nocturno | La red aérea del juego afectada por el clima real del día |
| C18 | Claude in Chrome + rutinas + agente de alquileres/renta | Operador que entra a portales sin API (inmobiliarios, brokers) y deja informes semanales |

---

## 5. Pruebas reales (ejecutadas el 15-11-2026)

**HECHO (medido en esta sesión):** las tres pruebas diseñadas se corrieron en `/tmp/pruebas-exploracion/` (fuera del repo). Máquina:
4 CPU, 16 GB de RAM, sin GPU, Node 22, Python 3.13. Los tiempos son de una sola corrida o de pocas repeticiones, en un entorno
virtual: son órdenes de magnitud, no benchmarks.

### P1. Voz local con kokoro-js: parcial (hay español, pero no con kokoro-js)

- **Versiones y licencias (HECHO-O):** `kokoro-js` 1.2.1 (npm, Apache-2.0); modelo `onnx-community/Kokoro-82M-v1.0-ONNX` (cuantizado q8,
  92 MB; base `hexgrad/Kokoro-82M`, Apache-2.0 en su ficha de Hugging Face). Alternativa: `kokoro-onnx` 0.6.1 (PyPI; LICENSE del
  repositorio: MIT), que usa espeak-ng.
- **¿Hay voces en español? Con kokoro-js, no.** `list_voices()` devuelve 28 voces, todas en inglés (20 `en-us`, 8 `en-gb`). Pedir
  `ef_dora` falla: `Error: Voice "ef_dora" not found. Should be one of: af_heart, af_alloy, ...`. **Pero el repositorio del modelo sí
  incluye voces españolas** (`ef_dora`, `em_alex`, `em_santa`), además de francés (`ff_siwis`), italiano (`if_sara`, `im_nicola`) y
  portugués (`pf_dora`, `pm_alex`, `pm_santa`). Es decir: la afirmación anterior («voces en español: S1») queda **confirmada para el
  modelo y desmentida para la librería de navegador**.
- **Alternativa probada una vez:** `kokoro-onnx` en Python, con el mismo modelo q8 y las voces `ef_dora` y `em_alex` convertidas del `.bin`
  oficial. Texto de 144 caracteres en español. Funcionó sin errores. Para verificar inteligibilidad sin oído humano se transcribió el
  audio con faster-whisper `tiny`: ambas voces dieron «El gerente del depósito revisa cada paillet antes de que el camión salga del
  muelle por la noche y confirma que todo este listo para la entrega» (solo falló «pallet», una palabra inglesa, y un tilde). **No se
  evaluó naturalidad ni acento con oído humano.**
- **Velocidad en CPU (4 núcleos):** carga del modelo no medida de forma limpia. Síntesis (factor = segundos de audio / segundos de
  cómputo): kokoro-js, inglés `af_heart`: 7,97 s de audio en 8,9 y 9,3 s, **0,86–0,89x**; `kokoro-onnx`, español: 8,0 s de audio en
  11,1–11,9 s, **0,67–0,72x** (tres corridas). **No se cumple el criterio «factor ≥ 1»**: en CPU no sintetiza en tiempo real.
- **Peso:** modelo q8 de 92 MB (89 MB en caché de kokoro-js), más ~0,5 MB por voz.
- **Qué cambia:** (a) Kokoro **no sirve para «leer en voz alta sin conexión dentro del navegador» en español con la librería actual**; (b)
  sirve para **audios pregenerados** (se sintetizan una vez en máquina propia, a ~1,4x el tiempo del audio, y se distribuyen como
  archivos): para textos propios de Senda el costo de servidor sigue siendo cero; (c) sin tiempo real en CPU no hay lectura interactiva
  en teléfonos modestos (el desempeño con WebGPU **no se probó**: sin GPU). Se ajustaron §0, §2.6, C12, F8 y el disparador de §7.

### P2. CAD paramétrico con build123d: éxito

- **Versión y licencia (HECHO-O, PyPI):** build123d 0.13.0, Apache-2.0 (OCP/OpenCascade `cadquery-ocp-novtk` 8.0.1.1.0 como
  dependencia). Se instaló con `pip` sin problemas.
- **Qué se corrió:** función `organizador(ancho, fondo, alto, nx, ny)` (caja con esquinas redondeadas de 3 mm y rejilla de
  compartimentos, paredes de 2 mm) y 10 variantes de 60x60x60 a 200x120x35 mm con de 1 a 15 compartimentos.
- **Resultados:** 10 de 10 generadas y exportadas a STL y STEP sin error; todas con `is_valid = True`, un solo sólido, malla STL
  estanca (`trimesh.is_watertight`) y el volumen del STL coincide con el del sólido (diferencia < 1 mm³ de 34.000 a 145.000). Los 10 STEP
  se reimportaron como sólidos válidos. Tiempo de generación 0,02–0,31 s por variante (la de 15 compartimentos fue la más lenta);
  exportación 0,02–0,05 s. Tamaños: STL 26–37 KB, STEP 44–255 KB (1,6 MB las 20 salidas).
- **Alcance real:** es una pieza simple (cajas y un redondeo). Sirve para probar el circuito (código → sólido → STL/STEP), no mide
  piezas con roscas, ajustes ni tolerancias de impresión, que dependen de la impresora. No se imprimió ninguna.
- **Qué cambia:** confirma que build123d es de **madurez A** para generar variantes paramétricas por lote; sostiene C7 y C8. La cifra
  del autor de build123d-mcp (88 % a 100 %) sigue siendo autodeclarada: no se probó el MCP.

### P3. Gaussian splat con Spark en Chromium sin GPU: éxito en render, rendimiento muy bajo

- **Versiones y licencias (HECHO-O, npm y GitHub):** `@sparkjsdev/spark` 2.4.0 (MIT), `three` 0.187.0 (MIT), `vite` 8.3.8 para servir la
  página. Renderizador de Chromium: ANGLE sobre Vulkan con **SwiftShader** (software). Splats de ejemplo oficiales de sparkjs.dev
  (`butterfly.spz`, 4,0 MB, 177.132 splats; `penguin.spz`, 2,5 MB, 128.136 splats), 800x600.
- **Resultado:** ambos se cargan y se ven correctos. Tiempo de `initialized` (descarga local ya hecha y decodificación): 0,58 s y 0,66 s.
  Cuadros por segundo: **0,20** (2 cuadros en 10 s, mariposa) y **0,29** (4 cuadros en 13,8 s, pingüino). Una sola corrida cada
  uno, tras 3 s de calentamiento; con tan pocos cuadros la medición es gruesa.
- **Captura:** `exploracion/p3-spark-splat-mariposa.png` (98 KB): la mariposa se ve nítida con color y bordes suaves. La del pingüino
  (223 KB) también salió bien, pero el encuadre quedó recortado (no se guardó).
- **Interpretación:** 0,2–0,3 cuadros por segundo con ~130–180 mil splats es una medida **de software puro, no de uso real**: no dice
  nada del rendimiento con GPU. Lo que sí queda probado es que la cadena npm → three.js → Spark → Chromium de Playwright **funciona
  sin GPU y permite pruebas automáticas por captura**, no de rendimiento (como preveía el criterio de éxito). Una escena de depósito
  real tendrá millones de splats: el rendimiento con GPU de usuario **no está medido** y debe probarse en un equipo real.
- **Qué cambia:** sube Spark de HECHO-O de licencia/instalación a **HECHO-O de funcionamiento** (con `three` 0.187; sin probar r186
  nativo); el flujo C1 sigue sin medirse de punta a punta (falta entrenar un splat con Brush y verlo con GPU).

## 6. Oportunidades

### 6a. Doce funciones extraordinarias para los proyectos actuales

Esfuerzo en sesiones de Claude (ESTIMACIÓN por analogía con prototipos ya hechos en el repo); horas del fundador casi cero salvo donde se indica.

| # | Proyecto | Función | Herramienta | Esfuerzo | Por qué cambia la experiencia |
|---|---|---|---|---|---|
| F1 | Andén | **Depósito real filmado**: subir un video del celular y ver el gemelo fotorrealista con el flujo simulado encima | Brush (o Marble con video, USD 1,28) + Spark | 3–5 sesiones | Pasa de «maqueta» a «es mi depósito»: el diferencial que ningún simulador de escritorio ofrece en el navegador (INFERENCIA) |
| F2 | Andén | **Plano → layout**: subir el plano o el croquis y obtener muros, puertas y zonas listos para simular | Visión de Claude + Raster-to-Vector + three.js | 4–6 | Elimina la hora de dibujo inicial, que es donde se cae el usuario |
| F3 | Andén | **Estiba física** de camión y contenedor | Rapier | 2–3 | Muestra lo que un Excel no muestra: qué se aplasta o se cae |
| F4 | Andén | **Andén dentro del chat** (MCP App) | SDK ext-apps | 2–3 | El simulador aparece donde la gente ya pregunta; canal gratis |
| F5 | Senda | **Lugares bíblicos en 3D** recorribles (Jerusalén, el templo, el mar de Galilea), con notas y fuentes; lo reconstruido marcado como interpretativo | World API + Spark | 2–4 + USD 1,20–2,48 por lugar | Ver el lugar fija la historia; cumple «todo enseña» si cada recorrido lleva sus versículos y preguntas |
| F6 | Senda | **Mapas animados** de viajes (Abraham, éxodo, Pablo) generados en serie para lecciones y para difusión | MapLibre + Remotion | 2–3 | Cada lección con su video; la difusión sin cara se produce sola (Remotion gratis hasta 3 personas) |
| F7 | Senda | **Kit imprimible 3D** de «Vivir la historia» (fichas, figuras, tablero) | build123d → STL | 2–3 | Lleva el juego de mesa a lo físico; prioridad ya declarada |
| F8 | Senda | **Lectura en voz alta sin conexión** de los textos propios (guías, notas) | Kokoro vía Python, audios **pregenerados** (P1: español inteligible, pero 0,7x tiempo real en CPU y no disponible en kokoro-js) | 1–2 | Audio sin costo por usuario (se genera una vez y se sirve como archivo). La Biblia hablada depende de la licencia del texto (no asumir) |
| F9 | Hub Nocturno | **Clima real del día** que cierra aeropuertos y desvía vuelos | Open-Meteo + datos de aeropuertos | 2 | Cada partida distinta y conectada con el mundo; material de difusión («hoy nieva en Chicago») |
| F10 | Nido | **Extractos leídos en el dispositivo** (PDF del banco → gastos categorizados) sin subir nada | Docling (en servidor propio o Pyodide si entra) / transformers.js + DuckDB-WASM | 3–4 | Privacidad como argumento de venta; costo de servidor cero |
| F11 | Organización personal | **Captura por voz** privada que se convierte en tareas y agenda | Whisper (transformers.js) + Apple Foundation Models en iOS | 3–4 | Inferencia gratis en el teléfono: el costo variable por usuario desaparece |
| F12 | Alquileres / renta | **Operador semanal**: agente programado que revisa portales (con Claude in Chrome cuando no hay API) y deja un informe; para alquileres, recorrido 3D de cada propiedad desde un video | Rutinas + Claude in Chrome + Spark | 2–3 + 1 h del fundador para credenciales | Convierte dos tareas manuales en informes que llegan solos |

Música con IA: ACE-Step (MIT, local) es la base libre para el proyecto de música; queda incluido en N8 más abajo.

### 6b. Doce productos o negocios nuevos

Puntajes 1–5 (VE = valor esperado; Palanca = cuánto lo hace Claude; Riesgo: 5 = muy riesgoso). Horas del fundador por semana en régimen.
Todos los montos de mercado faltan: **no hay datos de tamaño verificados hoy**; el experimento existe para medirlos.

| # | Producto | Problema pagado / quién paga | Quién vende por el fundador | Por qué ahora | Herramienta clave | Experimento más barato | VE | h/sem | Palanca | Riesgo |
|---|---|---|---|---|---|---|---|---|---|---|
| N1 | **«Foto a gemelo»** de naves y depósitos en autoservicio | Operadores, desarrolladores de naves y brokers industriales necesitan mostrar y planificar un espacio | SEO + videos de difusión; marketplace de servicios como respaldo | Splats nativos en three.js (sep-2026) + visión de Claude | C1 + C2 | Página con 3 gemelos de ejemplo y botón «subí tu plano» con precio; medir pedidos | 4 | 2–3 | 4 | 3 |
| N2 | **Packs de activos 3D por nicho** (logística, industria, iglesia) | Estudios de juego, visualizadores y arquitectos compran activos | **Fab** (88 % al vendedor, demanda propia) | Blender MCP oficial; Andén ya necesita esos activos | C3 | Publicar 1 pack gratis y 1 pago de ~20 piezas; medir descargas y ventas a 60 días | 3 | 0,5 | 5 | 2 |
| N3 | **Juegos de gestión web** (Hub Nocturno y hermanos) en portales | Jugadores (anuncios del portal) | **Portales de juegos web** y Telegram Mini Apps | Física y WebGPU maduros; el juego ya existe | Phaser/three.js + Rapier | Subir Hub Nocturno a un portal y medir retención día 1 y día 7 | 3 | 0,5 | 5 | 3 |
| N4 | **Modelos imprimibles paramétricos** | Usuarios de impresoras 3D (organizadores, repuestos, kits educativos) | Plataformas de modelos con demanda propia | CAD por código con MCP y validez medible | build123d | 10 modelos publicados; medir descargas y pagos a 60 días (condiciones de pago a verificar) | 2 | 0,5 | 5 | 2 |
| N5 | **Andén como MCP App** (embudo gratuito) | No cobra solo: alimenta al Andén pago | Directorios de Claude y ChatGPT | MCP Apps estándar final; directorios abiertos | ext-apps | App mínima «¿cuántos muelles necesito?»; medir usos | 3 (como embudo) | 0,5 | 5 | 2 |
| N6 | **Canal sin cara de mapas animados** (historia, geografía, logística) | Anunciantes vía plataforma | YouTube y redes (plataforma) | Remotion gratis para equipos chicos + Overture | C5 | 10 videos en 4 semanas; medir retención media | 2 | 1 | 4 | 4 (políticas de «contenido no auténtico» de las plataformas, a verificar) |
| N7 | **Informe de terreno** antes de comprar un lote | Compradores de lotes y terrenos (inundabilidad, vegetación, crecimiento) | SEO programático por barrio/localidad | Sentinel gratis por STAC + Overture | C14 | 20 páginas de barrios con informe de muestra y botón de compra; medir conversión | 3 | 1 | 4 | 3 (precisión y responsabilidad: es información, no peritaje) |
| N8 | **Música funcional instrumental** (concentración, oración, ambientes) | Oyentes vía plataformas; usuarios de video que necesitan música | Plataformas de streaming y bibliotecas de stock | ACE-Step MIT con salida comercial declarada | ACE-Step + rutinas | 20 temas en una distribuidora; medir reproducciones a 90 días | 2 | 0,5 | 5 | 4 (políticas anti-IA de plataformas y saturación) |
| N9 | **PDF accesible en autoservicio** | Editores chicos y comercios con obligación europea de accesibilidad | SEO por la obligación | Typst etiqueta por defecto (oct-2025); obligación vigente desde jun-2025 | C15 | Convertidor de 1 tipo de documento (catálogo o ebook) con precio por archivo | 3 | 1 | 4 | 3 (competencia de herramientas grandes; validar calidad PDF/UA) |
| N10 | **Visor y simulador sobre BIM** | Estudios chicos que necesitan mostrar y medir modelos IFC sin licencias caras | SEO + comunidades BIM abiertas | web-ifc maduro; three.js | C16 | Visor gratuito «subí tu IFC» con función paga de simulación de flujo | 2 | 1 | 4 | 3 |
| N11 | **Mundos para escuelas y museos** (lugares históricos explorables) | Docentes y museos | Mercados de recursos educativos | World API a USD 1,20 por mundo | C4 | 5 lugares con guía didáctica en un mercado de recursos docentes | 2 | 0,5 | 4 | 3 (precisión histórica; términos de World Labs) |
| N12 | **Paquetes de servidores MCP para nichos** (logística, alquileres) | Profesionales que usan Claude y quieren herramientas listas | Directorios y mercados de MCP/skills | > 10.000 servidores registrados (S1): mercado en formación | MCP SDK | Publicar 1 MCP gratuito y medir instalaciones | 1 | 0,5 | 5 | 4 (sin cobro nativo verificado) |

### 6c. Top 5 para empezar ya

1. **N2 · Packs 3D en Fab.** Mínimas horas (0,5/sem), un mercado que ya vende y paga 88 % (HECHO-S), y cada pieza sirve también a Andén y
   Hub Nocturno (infraestructura compartida, regla 6). Riesgo principal: política de IA de Fab y calidad; por eso el primer pack se arma con
   Blender por código y modelado procedural, no solo con generación.
2. **N3 · Juegos en portales.** El activo ya existe; el portal pone la audiencia. Es el experimento con menor costo marginal del holding.
3. **N1 · Foto a gemelo.** El mayor potencial y el que nace del experimento que sorprendió al fundador, en la industria que él conoce. Pide
   más horas y algo de venta; se prueba primero con una página de demanda, sin construir el autoservicio completo.
4. **N5 · Andén como MCP App.** Cuesta 2–3 sesiones y abre un canal de distribución que casi nadie usa todavía para logística (INFERENCIA).
   No cobra: se juzga por cuántos usuarios lleva a Andén.
5. **N4 · Imprimibles paramétricos.** Casi pasivo y comparte trabajo con el kit físico de Senda (F7). Puntaje de valor bajo, pero el costo
   de probar es tan bajo que la relación capital→aprendizaje es buena.

Reglas de corte comunes: a los 60 días, si el canal no muestra tracción mínima (definir en `/experimento`: por ejemplo, N2 < 5 ventas,
N3 retención día 7 < 5 %, N1 < 3 pedidos con precio), se pausa y se reasigna el tiempo de Claude.

### 6d. Lo que se descarta y por qué

| Descartado | Razón | Qué lo revive |
|---|---|---|
| Hunyuan3D en productos | Licencia no válida en UE/Reino Unido/Corea y versiones nuevas cerradas (HECHO-S) | Licencia permisiva |
| Agentes de voz en tiempo real como producto | Costo real de USD 0,30–0,90/min (S1) y exige atención comercial | Precio < USD 0,05/min con razonamiento |
| Video generativo (Veo) como base de un negocio | USD 0,05–0,60 por segundo y difícil diferenciarse; útil solo para piezas puntuales | Costo 10× menor |
| Bioinformática y química (Boltz-2, RDKit) | Capacidad real pero sin pagador alcanzable sin vender ni credenciales | Socio del sector que venda |
| KiCad / hardware | Ciclo físico, logística de fabricación y garantía; muchas horas | Necesidad propia de Andén (sensores) |
| SAM 3 en producto | Licencia que Meta puede cambiar unilateralmente; usar solo para uso interno | Licencia estable |
| Simulador de vuelo 3D | Ya descartado (DEC del 17-10-2026); nada nuevo lo cambia | — |

---

## 7. Para el radar

### Filas nuevas para `radar/senales.md`

| ID | Fecha dato | Lente | Señal | Gana / pierde / obligado | Int. | Vinculada | Fuente |
|---|---|---|---|---|---|---|---|
| SEN-2026-11-01 | 2026-04-27 → 2026-09-11 | Costos que caen | Blender publica servidor MCP oficial (v1.0.0 → v1.0.3) y conector oficial en Claude | Gana: quien produzca 3D sin artistas. Pierde: estudios de modelado genérico | 2 | Andén, Hub, N2 | strayspark.studio; creativeainews.com |
| SEN-2026-11-02 | 2026-09-08 → 2026-10-20 | Tecnología que madura | Splats nativos en three.js r186; Spark 2.4 con LoD paginado (MIT) | Gana: gemelos y recorridos fotorrealistas en el navegador. Pierden: visores propietarios | 3 | Andén F1, N1 | radiancefields.com; github.com/sparkjsdev/spark |
| SEN-2026-11-03 | 2026-11 (precios vigentes) | Costos que caen | Mundo 3D por API a USD 1,20–2,48; exportar splat gratis | Gana: educación, inmobiliario, juegos. Pierde: modelado manual de escenarios | 2 | Senda F5, N11 | docs.worldlabs.ai/api/pricing |
| SEN-2026-11-04 | 2026-08-26 | Nuevo canal | Claude in Chrome de uso general en planes pagos, acciones autónomas | Gana: quien opere portales sin API. Obligados: portales a defenderse de agentes | 2 | Alquileres, renta | claude.com |
| SEN-2026-11-05 | 2025-11-21 → 2026 | Nuevo canal | MCP Apps es estándar final: interfaces propias dentro de Claude y ChatGPT | Gana: quien llegue primero con apps útiles por nicho | 3 | N5, Andén F4 | modelcontextprotocol.io |
| SEN-2026-11-06 | 2026-01 → 2026-02 | Costos que caen | Modelos libres de música (ACE-Step 1.5, MIT) y voz (Kokoro, Apache) corren locales | Gana: apps con audio sin costo de servidor. Pierden: APIs de audio caras | 2 | Senda F8, música, N8 | ace-step.github.io; npmjs.com/package/kokoro-js |
| SEN-2026-11-07 | 2026-04-14 | Palanca IA | Rutinas de Claude Code: agentes programados en la nube | Gana: negocios casi pasivos operados por agentes | 2 | Transversal | Docs de la plataforma Claude; blogs |
| SEN-2026-11-08 | 2025-06-28 (vigente) | Regulación | Obligación europea de accesibilidad + PDF etiquetado por defecto en Typst | Obligados: comercios y editores con productos digitales en la UE | 2 | N9 | typst.app/blog/2025/typst-0.14 (dato regulatorio: CONOCIDO, verificar) |

### Disparadores para `radar/vigilancia.md`

- **Fab cambia el reparto** (rumor de 70–80 % desde 15-09-2026, S1): si se confirma en la documentación de Epic, recalcular N2.
- **ChatGPT o Claude habilitan cobro dentro de las apps** (suscripción o bienes digitales): convierte N5 y N12 de embudo en negocio.
- **World Labs publica términos comerciales** compatibles con apps: habilita F5 y N11.
- **three.js o Spark estabilizan splats en WebGPU** (Spark Radix salió experimental el 29-10-2026, S1): mejora F1.
- **F8 (voz española):** P1 confirmó voces españolas inteligibles en Kokoro vía Python; falta evaluar calidad con oído humano y la licencia de las voces. Disparador restante: calidad aceptada por el fundador.
- **Godot publica MCP oficial**: re-evaluar Godot para Carpincho Games.

### Posibles fichas (solo dos, por regla del barrido)

- **OP nueva · «Foto a gemelo» (N1):** gemelo navegable de naves y depósitos a partir de plano, fotos y video, en autoservicio, para la
  industria que el fundador conoce.
- **OP nueva · Packs 3D en Fab (N2):** activos 3D por nicho hechos con Blender por código, vendidos en un mercado con demanda propia, que
  además abastecen a Andén y Hub Nocturno.

Las demás quedan como señales y funciones de proyectos existentes.

---

## 8. Fuentes (consultadas el 15-11-2026; entre paréntesis, fecha del dato)

**Oficiales leídas en esta sesión**
- [World Labs: precios de la API](https://docs.worldlabs.ai/api/pricing) (vigente nov-2026)
- [Remotion: licencia y precios](https://www.remotion.dev/docs/license/pricing.md) (vigente nov-2026)
- [SEP-1865 MCP Apps](https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp) (creada 21-11-2025, estado Final)
- [Claude in Chrome: disponibilidad general](https://claude.com/resources/articles/claude-in-chrome-generally-available) (26-08-2026)
- [Repositorio de Spark](https://github.com/sparkjsdev/spark) (MIT; instalación 2.4.0)
- [Overture Maps con DuckDB](https://docs.overturemaps.org/getting-data/duckdb) y [notas 22-07-2026](https://docs.overturemaps.org/blog/2026/07/22/release-notes/)
- Bloqueadas (403): blender.org/lab/mcp-server, npmjs.com/package/kokoro-js

**Secundarias (re-verificar antes de decidir)**
- [Comparación de servidores MCP de Blender](https://www.strayspark.studio/blog/official-blender-mcp-server-comparison-2026) (2026); [conector oficial](https://www.creativeainews.com/articles/claude-blender-connector-official-setup-workflow/) (abr-2026)
- [three.js r186 con splats](https://radiancefields.com/three.js-merges-a-native-gaussian-splat-renderer-for-webgpu-in-r186) (08-09-2026); [Spark 2.4](https://radiancefields.com/spark-2.4.0-reads-spz-v4-files-and-opens-paged-lod-to-custom-fetchers) (20-10-2026); [Spark Radix](https://radiancefields.com/spark-radix-brings-webgpu-splat-rendering-to-threejs) (29-10-2026)
- [Brush](https://github.com/ArthurBrussee/brush); [Brush en radiancefields](https://radiancefields.com/platforms/brush)
- [TRELLIS.2 vs Hunyuan3D](https://trellis2.app/blog/trellis-2-vs-hunyuan-3d); [cronología 3D con IA 2026](https://app.cinevva.com/zh-CN/guides/ai-3d-model-generation-timeline-2026) (sep-2026)
- [transformers.js v4](https://huggingface.co/blog/transformersjs-v4) (feb-2026); [releases](https://github.com/huggingface/transformers.js/releases)
- [kokoro-js en npm](https://npmjs.com/package/kokoro-js); [voces Kokoro (tts.ai)](https://tts.ai/voices/kokoro/)
- [ACE-Step 1.5](https://ace-step.github.io/ace-step-v1.5.github.io); [arXiv 2602.00744](https://arxiv.org/abs/2602.00744) (ene-2026)
- [Rutinas de Claude Code](https://makerkit.dev/blog/tutorials/claude-code-routines-guide); [despliegues programados](https://platform.claude.com/docs/en/managed-agents/scheduled-deployments)
- [web-ifc](https://github.com/ThatOpen/engine_web-ifc); [ISPRS 2026 sobre That Open + Bonsai](https://isprs-annals.copernicus.org/articles/XI-4-2026/385/2026/)
- [Docling, informe técnico](https://arxiv.org/abs/2408.09869v1)
- [Precios de voz en tiempo real 2026](https://tech-insider.org/openai-vs-google-vs-qwen-voice-ai-apis-2026/); [costo real de agentes de voz](https://www.forasoft.com/article/openai-realtime-api-pricing)
- [Planetary Computer, ejemplo Sentinel-2](https://nbviewer.org/github/microsoft/PlanetaryComputerExamples/blob/main/datasets/sentinel-2-l2a/sentinel-2-l2a-example.ipynb); [Earth Search](https://www.element84.com/blog/introducing-earth-search-v1-new-datasets-now-available)
- [SAM 3](https://github.com/facebookresearch/sam3); [licencia SAM 3 (Roboflow)](https://roboflow.com/model-licenses/segment-anything-3) (19-11-2025)
- [build123d-mcp](https://pypi.org/project/build123d-mcp/0.3.75/); [agentcad](https://www.everydev.ai/tools/agentcad) (jun-2026)
- [MCP de Godot, comparativa](https://www.summerengine.com/blog/best-godot-mcp-server) (sep-2026)
- [Veo 3.1, precios](https://benchlm.ai/media-pricing/veo) (11-09-2026)
- [Typst 0.14](https://typst.app/blog/2025/typst-0.14) (24-10-2025)
- [Apple Foundation Models](https://www.apple.com/newsroom/2025/09/apples-foundation-models-framework-unlocks-new-intelligent-app-experiences/) (sep-2025)
- [Boltz-2 (MIT CSAIL)](https://www.csail.mit.edu/news/mit-releases-breakthrough-protein-binding-affinity-model-expanding-role-ai-drug-discovery) (jun-2025)
- [KiCad MCP](https://mcpservers.org/servers/mixelpixx/kicad-mcp-server)
- [Registro MCP en números](https://dev.to/amareswer/the-mcp-registry-by-the-numbers-38nc) (oct-2026)
- [Fab: documentación (88 %)](https://dev.epicgames.com/documentation/fab/fab-documentation); [comparativa 2026 con dato contradictorio](https://tech-insider.org/unity-asset-store-vs-fab-vs-cgtrader-2026/); [política de IA de Fab](https://www.fab.com/o/ai-info)
- [ElevenLabs Music API](https://elevenlabs.io/de/music-api)
- [Directorio de apps de ChatGPT](https://venturebeat.com/technology/openai-now-accepting-chatgpt-app-submissions-from-third-party-devs-launches); [foro: monetización Apps SDK](https://community.openai.com/t/chatgpt-app-monetization-apps-sdk/1372343.md) (ene-2026)
- [Telegram Mini Apps y Stars](https://dev.to/ton-adoption/monetizing-telegram-mini-apps-stars-revenue-and-ton-payments-24fk)
- [Raster-to-Vector](https://awesome.ecosyste.ms/projects/github.com%2Fart-programmer%2FFloorplanTransformation)
- [Física web: Rapier y Jolt](https://app.cinevva.com/tutorials/game-physics-libraries)
