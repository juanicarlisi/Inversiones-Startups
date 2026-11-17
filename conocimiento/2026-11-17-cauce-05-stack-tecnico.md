# 05 · Stack técnico para la plataforma de flujogramas y gestión de procesos

*Investigador tecnológico · 17-11-2026 · versiones y licencias leídas del registro de npm ese día (`npm view`), páginas oficiales con
WebFetch y pruebas propias en un directorio temporal (Node 22.23.4 y Chrome sin interfaz en Linux).*

**Cómo leer este informe.** Cada dato lleva una etiqueta: **HECHO** (con fuente y fecha), **ESTIMACIÓN** (con su método) o **INFERENCIA**
(razonamiento propio). **PENDIENTE** es lo que no llegué a verificar. Limitaciones de esta sesión: la API de GitHub estaba bloqueada
(no pude leer estrellas ni actividad de los repositorios; uso como señal de actividad la fecha de la última publicación en npm) y se
agotó el cupo de búsquedas web a mitad del trabajo. Lo que dependía de esas fuentes figura como PENDIENTE.

> **ROJO** = obliga a pagar o a mostrar un logo o una marca de agua. **AMARILLO** = licencia con condiciones que se pueden cumplir
> sin pagar (copyleft débil, pedido de atribución) o con riesgo de mantenimiento. **VERDE** = MIT, Apache o similar, sin condiciones
> que molesten.

---

## 0. La decisión en una página

**Arquitectura elegida:** una aplicación web que hace casi todo en el navegador del usuario (local-first), sobre React.

- **Lienzo y edición:** React Flow (`@xyflow/react` 13).
- **Modelo del documento y colaboración:** Yjs.
- **Servidor de cada tablero:** un Durable Object de Cloudflare con `y-partyserver`.
- **Datos:** D1 para la metadata y R2 para versiones y archivos.
- **Layout:** ELK.js en un Web Worker, más libavoid-js solo para rutear localmente los conectores ortogonales.
- **Formato BPMN:** `bpmn-moddle` + `bpmn-auto-layout`, sin bpmn-js.
- **Exportación 100 % en el navegador:**
  - SVG propio a PDF vectorial con `svg2pdf.js` + `jsPDF`;
  - PPTX editable con PptxGenJS;
  - DOCX con `docx`;
  - PNG con canvas o resvg-wasm.
- **Simulación:** motor de eventos discretos propio en TypeScript, corriendo en un Web Worker.
- **IA:**
  - Claude, desde un Worker, con salida JSON validada con Zod sobre un formato intermedio propio; las coordenadas las pone ELK;
  - un servidor MCP propio, montado en Workers.
- **Distribución:** primero PWA; Tauri si hace falta escritorio.
- **Cuentas:** Better Auth en Workers + D1; WorkOS solo cuando un cliente empresarial pague el SSO.

**Por qué esta combinación:**

1. **Todo lo que viaja en el producto es MIT, Apache o ISC.** No hay que pagar licencias y el producto queda sin logos ajenos. La única
   excepción es el pedido de atribución de React Flow (AMARILLO, ver §1).
2. **Los costos fijos de servidor son casi nulos.** El costo crece de forma lineal y barata: unos USD 0,01 por usuario activo al mes en
   la escala de 100.000 (ver §9).
3. **La vista en pantalla ya es DOM/SVG, así que exportar a vector es natural.** El mismo modelo se dibuja en SVG puro y de ahí sale el
   PDF vectorial (probado: A0 en 275 ms, con texto seleccionable).
4. **La ventaja queda en código propio:**
   - el modelo de procesos con datos por bloque;
   - el motor de simulación;
   - el exportador de calidad imprenta;
   - el formato intermedio para la IA.

   Todo lo demás se usa, no se fabrica.

**Lo que se descartó como base, en una línea cada uno:**

- **tldraw SDK:** es la mejor pizarra, pero en producción exige licencia comercial de precio no publicado (ROJO) y su motor limita por
  defecto a 4.000 formas por página.
- **GoJS y yFiles:** rinden mejor con grafos enormes, pero son propietarios y caros. GoJS cuesta USD 3.995 por única vez para una
  persona física; yFiles, USD 11.000 por año.
- **bpmn-js:** su licencia obliga a mostrar el logo de bpmn.io (ROJO).

---

## 1. Motores de lienzo y diagramas

### 1.1 Tabla comparativa

| Motor | Versión (npm, 17-11-2026) | Licencia | Última publicación | Render | ¿Pizarra libre + diagrama riguroso? | Semáforo |
|---|---|---|---|---|---|---|
| tldraw SDK | 5.6.1 | Propia («tldraw license») | 17-11-2026 | DOM/SVG con culling | Sí, la mejor pizarra; las formas a medida sirven para diagramas | **ROJO** |
| Excalidraw | 0.18.1 | MIT | 16-11-2026 | Canvas 2D | Pizarra sí; diagrama riguroso no (no admite tipos de elemento propios) | VERDE |
| React Flow (xyflow) | 13.0.2 | MIT | 17-11-2026 | DOM + SVG, opción de dibujar solo lo visible | Diagrama riguroso sí; la pizarra libre se arma encima | **AMARILLO** (atribución) |
| Svelte Flow | 2.0.2 | MIT | 17-11-2026 | Igual a React Flow, en Svelte | Igual | AMARILLO |
| JointJS (core) | `@joint/core` 4.3.4 | MPL-2.0 | 27-10-2026 | SVG | Diagrama sí; lo avanzado está en JointJS+ | AMARILLO |
| JointJS+ | — | Comercial | — | SVG | BPMN y más, pagos | **ROJO** |
| GoJS | 4.0.5 | Propia | 02-10-2026 | Canvas | Muy bueno para diagramas | **ROJO** |
| yFiles for HTML | (no se distribuye por npm; el paquete `yfiles` de npm no es oficial) | Comercial | — | SVG/Canvas/WebGL | El mejor en layout y escala | **ROJO** |
| maxGraph | `@maxgraph/core` 0.25.1 | Apache-2.0 | 21-10-2026 | SVG | Diagrama sí (linaje mxGraph/draw.io); pre-1.0 | VERDE / riesgo de madurez |
| bpmn-js | 18.33.0 | MIT + cláusula de marca de agua | 16-11-2026 | SVG | Solo BPMN | **ROJO** (logo obligatorio) |
| Konva | 10.9.1 | MIT | 31-10-2026 | Canvas 2D | Hay que construir el editor | VERDE |
| PixiJS | 8.23.0 | MIT | 11-11-2026 | WebGL/WebGPU | Hay que construir todo el editor | VERDE |
| Fabric.js | 7.4.0 | MIT | 31-10-2026 | Canvas 2D | Pizarra sí; diagrama a mano | VERDE |
| Leafer UI / leafer-editor | 2.3.4 | MIT (hay plugins comerciales aparte) | 10-11-2026 | Canvas 2D | Trae editor; los conectores y el editor de flujo avanzados son pagos | AMARILLO (un solo mantenedor) |
| Rete.js | 2.0.6 | MIT | 30-06-2025 | DOM | Editor de nodos y programación visual, no procesos | VERDE / poco activo |
| Cytoscape.js | 3.35.0 | MIT | 10-11-2026 | Canvas | Análisis de grafos, no edición rica | VERDE |
| AntV X6 / G6 | 3.1.8 / 5.1.1 | MIT | 21-09-2026 | SVG / Canvas | X6 sirve para edición de diagramas | VERDE |
| Penpot | — | MPL-2.0 (referencia) | — | — | Herramienta de diseño, no base de producto | — |

**Fuente de versiones, licencias y fechas:** HECHO. `npm view <paquete> version license time.modified`, corrido el 17-11-2026.

### 1.2 Licencias que obligan a pagar o a mostrar logos

**tldraw — ROJO.**

- **HECHO** (LICENSE.md del paquete 5.6.1 y github.com/tldraw/tldraw/blob/main/LICENSE.md, leído el 17-11-2026):
  - sin licencia, solo se puede usar en desarrollo («Not to use the Software in Production Environments»);
  - el software verifica una clave de licencia, detecta el entorno, hace cumplir la marca de agua y «may collect and transmit usage
    data»;
  - para producción hace falta una licencia de prueba, comercial u hobby.
- **HECHO** (tldraw.dev/pricing y /get-a-license/hobby, 17-11-2026):
  - la licencia comercial tiene «value-based pricing», sin precio publicado;
  - hay una prueba de 100 días, descuento para startups y una licencia hobby gratuita;
  - la hobby muestra la marca «made with tldraw» y es para proyectos que «aren't a business yet».
- **Sin verificar:** un sitio de terceros dice USD 6.000 por año. No figura en tldraw.dev.
- **HECHO** (código de `@tldraw/editor` 5.6.1, `src/lib/options.ts`): `maxShapesPerPage: 4000` por defecto. Es configurable.

**bpmn-js — ROJO.**

- **HECHO** (archivo LICENSE de bpmn-js 18.33.0, leído del tarball de npm el 17-11-2026): es MIT con una cláusula agregada. Dice:
  «The source code responsible for displaying the bpmn.io project watermark that links back to https://bpmn.io as part of rendered
  diagrams MUST NOT be removed or changed… the watermark must stay fully visible and not visually overlapped by other elements».
- dmn-js 18.0.3 tiene la misma referencia («SEE LICENSE IN LICENSE»).
- **Conclusión:** sirve como referencia; no como editor de un SaaS con marca propia.
- **HECHO:** `bpmn-moddle` 10.3.1 (lectura y escritura de BPMN XML) y `diagram-js` 15.30.0 son MIT sin esa cláusula.

**React Flow — AMARILLO.**

- La licencia es MIT, así que legalmente se puede quitar el crédito.
- Pero la documentación oficial pide: «Only remove this attribution, if you are subscribed to React Flow Pro»
  (reactflow.dev/learn/troubleshooting/remove-attribution, 17-11-2026).
- **HECHO** (reactflow.dev/pro, 17-11-2026): Pro cuesta USD 169 por mes (Starter) o USD 289 por mes (Professional).
- **Criterio:** dejar el crédito chico en una esquina hasta tener ingresos y después pagar Pro. Es reputación, no obligación legal.

**GoJS — ROJO.**

- **HECHO** (gojs.net/latest/pricing, 17-11-2026), con un año de soporte y actualizaciones incluido:
  - Individual: USD 3.995;
  - Team (hasta 3 desarrolladores): USD 6.990;
  - Group (hasta 20): USD 11.950;
  - sin regalías: «no runtime fees or royalties».
- **PENDIENTE:** si la versión sin clave muestra marca de agua.

**yFiles for HTML — ROJO.**

- **HECHO** (yfiles.com/pricing, 17-11-2026), precios anuales: Single Developer USD 11.000, Project (3 puestos) USD 22.000, Site USD 66.000.
- El complemento para exportar VSDX se cotiza aparte.

**JointJS+ — ROJO.**

- **HECHO** (jointjs.com/pricing, 17-11-2026):
  - Standard: USD 3.490 por desarrollador, perpetua;
  - descuento de Black Friday del 50 % (USD 1.745) hasta el 29-11-2026, con el código BLACKFRIDAY26;
  - actualizaciones: USD 1.690 por año (el primer año gratis).
- La misma página muestra también USD 1.734 / 3.468. Hay que confirmar el precio al pagar.

**Leafer — AMARILLO.**

- **HECHO** (leaferjs.com, 17-11-2026): el núcleo es MIT y apto para uso comercial.
- La empresa PxGrow (Beijing, un fundador) vende plugins comerciales aparte: Flow Editor, Linker Editor, Viewport Lighter y otros.

### 1.3 Rendimiento medido (HECHO, prueba propia, 17-11-2026)

**Cómo se midió:** Chrome sin interfaz en Linux **sin GPU** (render por software), ventana de 1600×900.

- Cada nodo es un rectángulo redondeado con texto. Hay N−N/200 conectores.
- Se midió:
  - el tiempo de creación;
  - la mediana de 30 cuadros al desplazar el lienzo a zoom 1;
  - la mediana con todo el tablero visible a zoom 0,05.
- Cada cuadro espera dos `requestAnimationFrame`, así que el piso es de unos 33 ms.
- Scripts en el scratchpad: `t/bench.mjs`, `t/benchrf.mjs` y `t/rf.jsx`.

| Motor (20.000 nodos) | Creación | Desplazar a zoom 1 (mediana) | Todo visible a zoom 0,05 |
|---|---|---|---|
| React Flow 13 (`onlyRenderVisibleElements`) | 4.863 ms | **33 ms (el piso: fluido)** | 139 ms |
| SVG/DOM propio sin culling | 912 ms | 67 ms | 891 ms |
| PixiJS 8 (WebGL por software, `Text` por nodo, culling) | 6.281 ms | 115 ms | 2.733 ms |
| Leafer 2.3.4 (`App` con editor) | 1.243 ms | 221 ms | 9.014 ms |

React Flow con menos nodos:

- 2.000 nodos: 33 ms en ambas pruebas;
- 10.000 nodos: 33 ms a zoom 1 y 83 ms con todo visible.

**Lectura.**

- **HECHO:** en esta máquina sin GPU, React Flow desplaza 20.000 nodos sin perder cuadros, porque el desplazamiento es una
  transformación CSS.
- **HECHO:** el punto débil es ver todo el tablero de lejos (unos 7 cuadros por segundo con 20.000 nodos).
- **INFERENCIA:** se resuelve con nivel de detalle. Por debajo de cierto zoom, se ocultan los textos y los nodos se dibujan como
  rectángulos en una sola capa canvas propia. Es lo que hacen Miro y tldraw.
- **Límite de la prueba:** las cifras de Pixi y Leafer dependen de la GPU, que esta máquina no tiene. Leafer publica 60 fps arrastrando
  entre un millón de rectángulos con GPU real (dato del fabricante, no verificado acá).
- **INFERENCIA:** la elección no se apoya en que React Flow «gane» en bruto. Se apoya en tres cosas:
  1. alcanza con holgura a zoom de trabajo;
  2. sus nodos son HTML, así que tablas de datos, edición en línea, accesibilidad y texto nítido salen gratis;
  3. el mismo modelo se convierte a SVG para exportar.

### 1.4 Por qué React Flow y no las dos más cercanas

- **tldraw:**
  - mejor pizarra «tipo Miro» desde el día uno, con sincronización en Durable Objects incluida;
  - pero la licencia es ROJA y de precio desconocido, hay una clave verificada por el fabricante con telemetría, y el límite por defecto
    es de 4.000 formas;
  - con un capital de USD 400 por mes, el núcleo del producto quedaría en manos de un tercero que cobra «por valor».
- **Motor canvas o WebGL propio (Pixi o Leafer):**
  - más techo a escala extrema;
  - pero obliga a reconstruir selección, edición de texto, accesibilidad y exportación vectorial: justo lo que la doctrina 09 dice que
    no hay que reinventar;
  - y no ganó en la medición a zoom de trabajo.

---

## 2. Layout automático y ruteo de conectores

| Herramienta | Versión | Licencia | Uso recomendado | Semáforo |
|---|---|---|---|---|
| **ELK.js** | 0.12.1 (28-10-2026) | EPL-2.0 OR GPL-3.0-or-later | Layout por capas (procesos, BPMN, organigramas), con ruteo ortogonal | AMARILLO (EPL: copyleft débil por archivo; sin modificarlo no obliga a nada en un SaaS) |
| dagre (`@dagrejs/dagre`) | 3.1.3 | MIT | Grafos chicos | VERDE |
| d3-dag | 1.3.0 | MIT | Árboles y DAG | VERDE |
| WebCola | 3.4.0 (2022) | MIT | Por restricciones; sin mantenimiento | VERDE / viejo |
| **libavoid-js** | 0.5.0-beta.6 (16-11-2026) | LGPL-2.1-or-later | Ruteo ortogonal que esquiva objetos, incremental | AMARILLO (LGPL: cargar el `.wasm` como archivo aparte y reemplazable; está en beta) |
| `@antv/layout` | 2.0.0 | MIT | Alternativa | VERDE |
| yFiles layout | — | Comercial | El mejor | ROJO |

**Pruebas propias (HECHO, Node 22, 17-11-2026, `t/elk.mjs` y `t/avoid*.mjs`).**

ELK por capas con ruteo ortogonal, comparado con dagre, en árboles con aristas cruzadas:

| Nodos | Aristas | ELK | dagre |
|---|---|---|---|
| 500 | 569 | 1.131 ms | 407 ms |
| 2.000 | 2.283 | 2.085 ms | 4.704 ms |
| 5.000 | 5.712 | 8.071 ms | 31.553 ms |

- **Conclusión:** ELK escala mejor y devuelve los quiebres ortogonales de cada conector.

libavoid-js, ruteo ortogonal global:

- 200 formas y 199 conectores: 271 ms el ruteo completo y 311 ms el incremental.
- Con 1.000 conectores **no terminó en 15 minutos**: lo corté.
- **Regla:** usar libavoid solo para rutear de forma local los conectores cercanos a lo que se movió. El ruteo global lo hace ELK.
- La API de pines de la beta dio advertencias. El ruteo con puntos de anclaje funcionó.

**INFERENCIA.** Los conectores ortogonales «inteligentes» salen de combinar tres capas:

1. **ELK** al aplicar un layout;
2. **libavoid** al arrastrar, solo con los vecinos;
3. **un ruteo escalonado simple** (el `step` de React Flow) como respaldo instantáneo.

---

## 3. Colaboración en tiempo real y local-first

| Pieza | Versión | Licencia | Servidor | Costo de servidor | Semáforo |
|---|---|---|---|---|---|
| **Yjs** | 13.6.33 (23-09-2026) | MIT | Cualquiera; en Cloudflare con `y-partyserver` 2.2.0 (ISC) o `y-durableobjects` 1.0.5 (MIT) | Lo que cueste el Durable Object | VERDE |
| Loro | 1.18.0 (16-11-2026) | MIT | Servidor propio | Igual | VERDE (ecosistema de servidor más chico) |
| Automerge | 3.5.0; `automerge-repo` 2.6.0-alpha.3 | MIT | automerge-repo | Igual | VERDE |
| Liveblocks | client 3.25.1 | Apache-2.0 (cliente); servicio pago | Su nube | Pro USD 30 por mes; Team desde USD 600 por mes; USD 0,002 por usuario-minuto colaborativo (HECHO, liveblocks.io/pricing, 17-11-2026) | ROJO por costo a escala |
| PartyKit / PartyServer | partykit 0.0.115 (09-10-2026); partyserver 0.5.10 | MIT / ISC | Cloudflare | DO | VERDE |
| Y-Sweet | sdk 0.9.1 (16-09-2025) | MIT | Jamsocket o propio | — | AMARILLO (sin publicaciones desde sep-2025; estado de la empresa PENDIENTE) |
| Hocuspocus | 4.8.0 (28-10-2026) | MIT | Node | Un servidor siempre prendido | VERDE |
| tldraw sync | 5.6.1 | Licencia tldraw | DO (plantilla oficial) | DO | ROJO (va con la licencia) |
| Replicache | 15.3.0 | Términos propios (roci.dev/terms) | — | — | AMARILLO |
| Zero (Rocicorp) | 1.12.0 | Apache-2.0 | Postgres + zero-cache | Servidor siempre prendido | VERDE, pero no es CRDT de lienzo |
| ElectricSQL | client 1.5.28 | Apache-2.0 | Postgres + Electric | Siempre prendido | VERDE, no es para lienzo |
| Jazz | 2.0.0-alpha.66 | MIT | Jazz Cloud o propio | — | AMARILLO (alfa) |

**Prueba propia (HECHO, 17-11-2026, `t/misc.mjs`).** 20.000 formas con siete atributos cada una:

| | Tiempo | Tamaño |
|---|---|---|
| Yjs | 90 ms | 1,68 MB de update |
| Loro | 364 ms | 0,96 MB de snapshot |

**Elegida: Yjs.**

- Tiene el ecosistema más maduro:
  - proveedor para Durable Objects;
  - persistencia en IndexedDB para trabajar sin conexión;
  - awareness para cursores.
- Fue la más rápida en la escritura masiva.
- El **versionado** se hace con snapshots nombrados guardados en R2 (más un registro de cambios).

**Por qué no Loro:** su historial integrado es mejor y sus snapshots, más chicos. Pero el servidor sobre Durable Objects habría que
armarlo a mano. Queda como regla de corte (§10).

**¿Se puede correr casi gratis sobre Cloudflare? Sí.**

- **HECHO** (developers.cloudflare.com/durable-objects/platform/pricing, 17-11-2026), plan Workers Paid:
  - 1 millón de solicitudes incluidas por mes, después USD 0,15 por millón;
  - 400.000 GB-s incluidos, después USD 12,50 por millón de GB-s;
  - cada objeto factura 128 MB de duración;
  - los mensajes WebSocket entrantes se cobran 20 a 1 y los salientes no se cobran;
  - con la Hibernation API, un objeto inactivo no paga duración;
  - SQLite: 50 millones de filas escritas incluidas, después USD 1 por millón; 5 GB incluidos, después USD 0,20 por GB-mes;
  - mínimo de USD 5 por mes.
- **HECHO** (Workers pricing, 17-11-2026):
  - 10 millones de solicitudes incluidas, después USD 0,30 por millón;
  - los recursos estáticos son gratis e ilimitados.

---

## 4. Exportación profesional

### 4.1 Qué se puede hacer 100 % en el navegador

| Formato | Herramienta | Versión / licencia | ¿En el navegador? | Evidencia |
|---|---|---|---|---|
| **SVG** | Serializador propio del modelo (no capturar el DOM) | Código propio | Sí | INFERENCIA de diseño |
| **PDF vectorial (A4 a A0)** | `svg2pdf.js` + `jsPDF` | 2.9.0 MIT + 4.2.1 MIT | **Sí, probado** | Ver la prueba abajo |
| PDF de manuales | `@myriaddreamin/typst.ts` (Typst a WASM) | 0.7.0 Apache-2.0 | Sí (no probado acá) | PENDIENTE |
| Unir y estampar PDF | `pdf-lib` | 1.17.1 MIT, **última publicación 2022** | Sí | AMARILLO (sin mantenimiento) |
| PDF por programa | `pdfkit` 0.20.2 / `pdfmake` 0.3.14 | MIT | Sí | — |
| **PNG en alta resolución** | Canvas del navegador desde el SVG, o `@resvg/resvg-wasm` | 2.6.2 MPL-2.0 | Sí | `resvg-js` probado: SVG de 400 nodos ×3 en 2,55 s, 1,19 MB |
| **PPTX editable** | PptxGenJS | 4.0.1 MIT (última publicación 26-06-2025) | **Sí, probado** | Ver la prueba abajo |
| **DOCX** | `docx` | 9.15.4 MIT | Sí | — |
| **BPMN 2.0 XML** | `bpmn-moddle` + `bpmn-auto-layout` | 10.3.1 MIT + 1.3.0 MIT | Sí, probado | Parseo sin advertencias y vuelta completa; `auto-layout` generó los 5 BPMNShape del DI |
| **draw.io XML** | Mapeo propio al formato mxGraphModel | Código propio + `fast-xml-parser` 5.12.1 MIT | Sí | — |
| **Visio .vsdx (importar)** | Portar el importador de draw.io | draw.io 32.7.4, Apache-2.0 | Sí | HECHO: el archivo existe (`js/diagramly/vsdx/importer.js`, jsDelivr, 17-11-2026) y la licencia es Apache-2.0 |
| **Visio .vsdx (exportar)** | Sin herramienta libre verificada | `vsdx-js` 1.2.0 MIT sin evaluar; complemento de yFiles (pago) | PENDIENTE | Ver la propuesta abajo |
| **Mermaid** | `mermaid` 12.3.0 MIT; `@excalidraw/mermaid-to-excalidraw` 3.6.0 MIT como parser de flowchart | Sí | — |
| PlantUML | Exportar como texto generado; dibujarlo pide Java | PlantUML 1.2026.10, también en versión MIT (plantuml.com/download, 17-11-2026) | Solo texto | No hay versión de navegador verificada |
| Lucid | Exportar desde Lucid a .vsdx y entrar por el importador VSDX | — | Sí | INFERENCIA |
| Miro | API REST v2: `GET /v2/boards/{id}/items` | — | Desde un Worker, con OAuth | HECHO (developers.miro.com, 17-11-2026); la API de exportación de tableros queda PENDIENTE |

**Exportar a VSDX (propuesta).** VSDX es un paquete OPC con XML adentro. Un escritor propio con una plantilla `.vsdx` para formas y
conectores básicos es acotado. Antes de escribirlo, evaluar `vsdx-js`.

**Prueba de PDF (HECHO, 17-11-2026, `t/browser.mjs`, Chrome 1600×900).** Un SVG de 400 tareas con texto acentuado y conectores
ortogonales con flechas:

- **A0 apaisado vectorial en una sola página:**
  - 275 ms y 257 KB;
  - MediaBox de 3370×2384 pt, sin ninguna imagen embebida;
  - el texto «Tarea 0 á ñ» se puede extraer con `pdftotext`;
  - la vista previa se ve nítida.
- **Mosaico en A4 para imprimir un A0 al 100 %:** 25 páginas en 5,3 s, pero **6,35 MB**, porque cada página lleva el dibujo entero
  recortado.
- **Arreglo, en código propio:** que cada página solo lleve los elementos que caen en ella (índice espacial). Agregar marcas de
  corte, solapamiento y numeración de páginas.
- **Fuentes:** la prueba usó las 14 fuentes estándar del PDF. Para tipografía de marca y alfabetos no latinos hay que registrar TTF
  con `jsPDF.addFont`: la fuente queda embebida y como subconjunto. PENDIENTE: probar Inter o Noto.
- **Límite conocido:** svg2pdf no cubre todo el SVG (por ejemplo, ciertos filtros). El serializador propio debe emitir solo lo que
  soporta: trazos, rellenos, degradados lineales y texto.

**Prueba de PPTX (HECHO, 17-11-2026).** 30 rectángulos redondeados nativos con texto y líneas con flecha en 564 ms. El archivo trae 55
`<p:sp>` nativos: se puede editar en PowerPoint, no es una imagen.

**Respaldo en servidor.** Solo si hace falta, un navegador sin interfaz que imprima a PDF (Playwright).

- **HECHO:** draw.io depende de un «export service» para su PDF (drawio.com/doc/faq/export-diagram, 17-11-2026).
- **INFERENCIA:** nuestro camino de cliente evita ese servidor.

---

## 5. Simulación en el navegador

**HECHO** (fechas de npm, 17-11-2026): no hay un motor de eventos discretos en JavaScript con mantenimiento.

| Paquete | Versión | Licencia | Última publicación |
|---|---|---|---|
| `simjs` | 2.0.3 | MIT | 2022 |
| `simscript` | 1.0.37 | ISC | 2022 |
| `js-simulator` | 1.0.17 | MIT | 2022 |
| `nexosim` (Rust) | 1.0.0 | — | 03-02-2026 en crates.io (soporte WASM PENDIENTE) |
| Pyodide | 314.0.8 | MPL-2.0 | 13-11-2026 |

**Elegido: un motor propio en TypeScript dentro de un Web Worker.**

- **Qué incluye:**
  - una cola de eventos en un montículo binario;
  - entidades, recursos con capacidad y turnos, colas y compuertas BPMN (XOR por probabilidad, AND, OR);
  - distribuciones con generador de números aleatorios con semilla;
  - réplicas que corren en paralelo, un Worker por réplica;
  - resultados que llegan de a tramos.
- **Por qué es propio:**
  - es la ventaja del producto;
  - el dominio es chico (unas 1.500 líneas, ESTIMACIÓN);
  - ninguna librería mantenida lo resuelve.
- **Validación:** salabim o SimPy dentro de Pyodide, solo en las pruebas, como oráculo para casos M/M/c. No va en producción: pesa
  varios MB.

**Rendimiento con 100.000 entidades.** PENDIENTE de medir.

- **ESTIMACIÓN** con este método: un motor de montículo en V8 procesa del orden de 10⁶ eventos por segundo. Con 100.000 entidades por
  unos 10 eventos cada una, son alrededor de 10⁶ eventos, es decir, segundos por réplica.
- Si no alcanza, el plan B es compilar el núcleo de Rust a WASM.

---

## 6. IA

**Patrón elegido** (INFERENCIA, construida sobre herramientas verificadas):

1. **El modelo devuelve un formato intermedio propio («ProcessIR»), no coordenadas.** Contiene nodos con tipo y datos, carriles,
   flujos y anotaciones.
   - Ese formato se describe como esquema JSON generado desde Zod 4.6.7 (MIT).
   - Se pide la salida estructurada o una herramienta con ese esquema mediante `@anthropic-ai/sdk` 1.9.0 (Apache-2.0).
2. **Se valida dos veces.** Primero el esquema (Zod). Después las reglas de procesos:
   - un único inicio por proceso;
   - compuertas balanceadas;
   - nada de nodos sueltos.

   Si hay errores, se reintenta una vez con los errores como contexto.
3. **ELK pone las coordenadas**, en un Worker.
4. **El cambio entra como operación Yjs**, así que se puede deshacer y se ve en vivo.
5. **Servidor MCP propio** para que Claude o ChatGPT editen tableros.
   - Piezas: `@modelcontextprotocol/sdk` 1.32.2 (MIT), `agents` 0.33.0 de Cloudflare (MIT, `McpAgent`) y
     `@cloudflare/workers-oauth-provider` 1.2.4 (MIT).
   - Herramientas: `get_board`, `apply_ops`, `layout`, `export`, `simulate`.
6. **La clave de la API vive solo en el Worker.** Cada pedido tiene un tope por usuario y por plan.

**Costo por generación:** PENDIENTE. No pude leer la página de precios vigente de Anthropic; la redirección quedó sin seguir cuando se
cortó la sesión.

- **Método para completarlo:** unos 3.000 tokens de entrada (esquema más pedido) y unos 2.000 de salida por diagrama, multiplicados
  por el precio por millón de tokens del modelo que se use. Con caché del esquema, la entrada baja.
- **INFERENCIA:** la IA es el único costo variable que puede superar a la infraestructura. Va con cupo por plan.

---

## 7. Escritorio, sin conexión y móvil

| Opción | Versión | Licencia | Veredicto |
|---|---|---|---|
| **PWA** | — | — | **Primero.** Con Yjs + IndexedDB funciona sin conexión; no hay que instalar nada |
| **Tauri** | CLI 2.12.5 (16-11-2026) | Apache-2.0 OR MIT | Si hace falta escritorio: binarios chicos y Rust disponible para el motor pesado. Riesgo: usa el WebView del sistema (WebKitGTK o WebKit), así que hay que probar render y exportación en cada uno |
| Electron | 45.3.3 | MIT | Chromium igual en todos lados, pero pesado; solo si Tauri falla en render o exportación |
| Móvil | — | — | PWA en modo visor y comentarios. Editar en serio en un teléfono no es el caso de uso (INFERENCIA) |

---

## 8. Backend mínimo

| Opción | Lo que da | Costo de entrada (HECHO, 17-11-2026) | Veredicto |
|---|---|---|---|
| **Cloudflare** (Workers + DO + D1 + R2) | WebSockets por tablero, SQL, objetos, recursos estáticos gratis | Workers Paid USD 5 por mes. D1: 25.000 millones de lecturas y 50 millones de escrituras incluidas, 5 GB y después USD 0,75 por GB. R2: USD 0,015 por GB-mes, salida a internet gratis, 10 GB gratis | **Elegido** |
| Supabase | Postgres, auth, realtime | Free: 50.000 MAU y 200 conexiones realtime. Pro desde USD 25: 100.000 MAU, después USD 0,00325 por MAU; SSO a USD 0,015 por MAU | Buena alternativa para datos relacionales, pero el realtime por tablero con CRDT encaja mejor en DO |
| Firebase | — | Sin verificar en esta sesión | No: dependencia de Google y modelo de documentos que no encaja con CRDT |
| **Better Auth** | Auth propia en Workers + D1 | 1.7.25 MIT, USD 0 | **Elegido** para cuentas |
| **WorkOS** | SSO SAML/OIDC y SCIM | AuthKit gratis hasta 1 millón de MAU. SSO: USD 125 por conexión (1 a 15 conexiones). Directory Sync, igual. La página no dice el período | Solo cuando un cliente empresarial lo pague (se traslada al precio) |

---

## 9. Costo mensual de infraestructura por escala

**Supuestos** (ESTIMACIÓN; hay que reemplazarlos con medición real):

| Variable | Valor |
|---|---|
| Uso por usuario activo (MAU) | 8 sesiones de 30 minutos por mes = 240 minutos |
| Tiempo con el Durable Object despierto | 50 % de esos minutos (el resto hiberna) = 7.200 s × 0,125 GB = **900 GB-s por MAU** |
| Mensajes WebSocket entrantes | 5 por segundo mientras está despierto (cursores limitados a 10 por segundo más cambios) = 36.000, que a 20:1 equivalen a **1.800 solicitudes por MAU** |
| Otras solicitudes | 500 solicitudes HTTP al Worker por MAU |
| Persistencia | Lotes en SQLite cada 10 s = **720 filas escritas por MAU** |
| Snapshots | En R2 al cerrar y cada 10 minutos, unos 30 por MAU |
| Almacenamiento | 2 MB en SQLite y 10 MB de versiones en R2 por MAU |
| IA | Afuera: va con cupo y se cobra por plan |

**Precios:** los de §3 y §8 (HECHO, 17-11-2026).

| Concepto | 100 MAU | 1.000 MAU | 10.000 MAU | 100.000 MAU |
|---|---|---|---|---|
| Workers Paid (mínimo) | 5 | 5 | 5 | 5 |
| DO duración | 0 (90.000 GB-s, incluido) | 6,3 | 107,5 | 1.120 |
| DO solicitudes y mensajes | 0 | 0,2 | 3,3 | 34 |
| SQLite filas escritas | 0 | 0 | 6,2 | 22 |
| SQLite almacenamiento | 0 | 0 | 3 | 39 |
| Worker solicitudes y CPU | 0 | 0 | 0 | ~21 |
| R2 (almacenamiento + clase A) | 0 | 0 | ~1,5 | ~24 |
| D1 | 0 | 0 | 0 | ~1 |
| **Total aproximado (USD por mes)** | **≈ 5** | **≈ 12** | **≈ 125** | **≈ 1.270** |
| Por MAU | 0,05 | 0,012 | 0,0125 | 0,0127 |

**Sensibilidad (INFERENCIA):**

- **El 88 % del costo a escala es la duración del Durable Object.** Si se conecta al servidor solo cuando hay dos o más personas en el
  tablero (lo solo se guarda en local y se sube por lotes), la duración baja de 3 a 5 veces. Eso deja unos USD 300–500 por mes con
  100.000 MAU.
- **Si las escrituras se hacen cada segundo en vez de cada 10**, las filas escritas suben a unos USD 670 por mes con 100.000 MAU. Es un
  parámetro de diseño.
- **La misma colaboración en Liveblocks**, con un 30 % de minutos colaborativos y 100.000 MAU, serían 7,2 millones de usuario-minuto ×
  USD 0,002 ≈ **USD 14.400 por mes** más el plan. Es unas 10 veces más.
- **Costos fijos que no son servidor:**
  - React Flow Pro: USD 169 por mes, opcional;
  - dominio y correo transaccional (PENDIENTE de cotizar);
  - SSO de WorkOS por cliente, USD 125 por conexión, que se traslada.

---

## 10. Arquitectura recomendada, pieza por pieza

| Capa | Pieza | Licencia | Propio, usado o comprado | Regla de corte |
|---|---|---|---|---|
| Interfaz | React 19 + `@xyflow/react` 13.0.2 | MIT (AMARILLO: atribución) | Usado | Si un tablero de 10.000 nodos con datos no mantiene 30 fps al arrastrar en una laptop media con GPU, se agrega la capa canvas de nivel de detalle. Si aun así no alcanza, se evalúa Leafer o Pixi solo para el render |
| Nivel de detalle lejano | Capa canvas 2D propia (rectángulos sin texto con zoom menor a 0,3) | Propio | Propio | Si cuesta más de una semana, usar el modo «sin texto» de React Flow y aceptar la limitación |
| Herramientas de pizarra | Notas, marcos, trazo libre (con `perfect-freehand`, licencia PENDIENTE de verificar) y formas | Propio sobre React Flow | Propio | Si la pizarra libre no alcanza la calidad de Miro en 4 semanas, se evalúa la licencia de tldraw solo para el modo pizarra (decisión del fundador) |
| Modelo | Esquema propio del proceso (tipos BPMN, VSM, organigrama, arquitectura; datos por bloque) en Yjs 13.6.33 | MIT | **Propio (ventaja)** | Si el historial o el tamaño se vuelven un cuello de botella, migrar el documento a Loro |
| Sin conexión | `y-indexeddb` | MIT | Usado | — |
| Tiempo real | Durable Object por tablero + `y-partyserver` 2.2.0 con Hibernation | ISC | Usado | Si el DO supera USD 0,03 por MAU, conectarse solo con dos o más personas |
| Datos | D1 (metadata, permisos), R2 (versiones, archivos) | Servicio | Comprado (uso) | — |
| Cuentas | Better Auth 1.7.25 | MIT | Usado | WorkOS solo con un contrato empresarial que lo pague |
| Layout | ELK.js 0.12.1 en un Worker | EPL-2.0 (AMARILLO) | Usado | Si ELK tarda más de 3 s en el diagrama típico, layout incremental por subproceso |
| Ruteo local | libavoid-js 0.5.0-beta (`.wasm` aparte) | LGPL (AMARILLO) | Usado | Si la beta se rompe o tarda más de 50 ms por arrastre con 50 vecinos, quedarse con el ruteo escalonado más ELK |
| BPMN | `bpmn-moddle` 10.3.1, `bpmn-auto-layout` 1.3.0 | MIT | Usado | Nunca usar bpmn-js (ROJO) |
| Exportar | SVG propio, `svg2pdf.js` 2.9.0 + `jsPDF` 4.2.1, PptxGenJS 4.0.1, `docx` 9.15.4, resvg-wasm 2.6.2 | MIT / MPL-2.0 | **Mosaico, fuentes y SVG limpio: propio (ventaja)** | Si una exportación A0 sale con defectos que no se pueden corregir en el cliente, respaldo con navegador sin interfaz en servidor |
| Importar | VSDX (port de draw.io, Apache-2.0), draw.io XML y Mermaid propios; Miro por API | Apache / MIT | Mixto | Exportar a VSDX solo si lo pide un cliente que paga |
| Simulación | Motor DES propio en TypeScript dentro de Workers | Propio | **Propio (ventaja)** | Si 100.000 entidades tardan más de 30 s por réplica, pasar el núcleo de Rust a WASM |
| IA | `@anthropic-ai/sdk` 1.9.0 + Zod 4.6.7 + ProcessIR + ELK | Apache / MIT | ProcessIR y validador propios | Si la tasa de diagramas válidos al primer intento queda por debajo del 90 %, reforzar ejemplos y esquema antes de cambiar de modelo |
| MCP | `@modelcontextprotocol/sdk` 1.32.2 + `agents` 0.33.0 + `workers-oauth-provider` 1.2.4 | MIT | Usado | — |
| Escritorio | PWA, y Tauri 2.12.5 si hace falta | Apache / MIT | Usado | Si render o exportación difieren en WebKit, Electron 45 |

**Riesgos de licencia en un cuadro:**

| Pieza | Riesgo |
|---|---|
| tldraw | **ROJO**: producción solo con licencia paga; la hobby muestra «made with tldraw» y no es para negocios |
| bpmn-js / dmn-js | **ROJO**: el logo de bpmn.io es obligatorio y visible |
| GoJS, yFiles, JointJS+ | **ROJO**: pagos |
| Liveblocks | **ROJO** por costo a escala |
| React Flow | AMARILLO: crédito pedido hasta pagar Pro (USD 169 por mes) |
| ELK.js | AMARILLO: EPL, no modificarlo o publicar los cambios |
| libavoid-js | AMARILLO: LGPL, `.wasm` aparte y reemplazable, y avisar en los créditos |
| resvg | AMARILLO: MPL-2.0, mismo criterio |
| Leafer | AMARILLO: plugins clave pagos y un solo mantenedor |

Todo lo demás es VERDE.

---

## 11. Prototipo en 2 semanas

**Semana 1, el núcleo:**

- **Días 1–2:**
  - Vite + React + React Flow 13;
  - modelo ProcessIR en Yjs con IndexedDB;
  - formas BPMN básicas (tarea, evento, compuerta), carriles y notas;
  - panel de datos por bloque (tiempo, costo, recurso).
- **Día 3:** ELK en un Worker («ordenar» con un clic) y ruteo escalonado.
- **Día 4:** colaboración con un Durable Object + `y-partyserver` en `wrangler dev` y despliegue a Workers. Cursores con awareness.
- **Día 5, medición:** generar 2.000, 10.000 y 20.000 nodos y medir fps al desplazar y al arrastrar en una laptop real. Primera regla de
  corte del lienzo.

**Semana 2, la diferencia:**

- **Día 6:**
  - serializador SVG propio;
  - PDF vectorial A4, A3 y A0 con `svg2pdf.js` y una fuente TTF embebida;
  - mosaico con índice espacial y marcas de corte.
- **Día 7:** PPTX editable, PNG ×4 e importar/exportar BPMN XML con `bpmn-moddle`, comprobado contra el Camunda Modeler.
- **Día 8:** motor DES mínimo (llegadas Poisson, tareas con distribución, recursos, XOR) en un Worker, más un tablero de resultados.
  Validar un M/M/c contra la fórmula y contra salabim en Pyodide.
- **Día 9:** IA: texto → ProcessIR → validación → ELK, con Claude, y un servidor MCP con `get_board` y `apply_ops`.
- **Día 10:** versiones nombradas en R2, más una revisión independiente de licencias, avisos de créditos y costos medidos en el panel
  de Cloudflare.

**Cómo se verifica:**

- abrir el PDF A0 en Acrobat y en `pdftotext` (vectorial, texto extraíble, sin imágenes);
- abrir el PPTX en PowerPoint (formas editables);
- abrir el BPMN en Camunda Modeler;
- medir los fps;
- leer el costo por MAU en el panel.

---

## 12. Lo que requiere decisión del fundador

1. **Ninguna licencia paga es necesaria para el prototipo.** Opcionales a futuro: React Flow Pro (USD 169 por mes) para sacar el
   crédito; tldraw solo si se quiere la pizarra «tipo Miro» comprada en vez de construida (precio a pedir).
2. **Cuenta de Cloudflare con el plan Workers Paid (USD 5 por mes)** cuando se despliegue el prototipo colaborativo.
3. **Clave de la API de Anthropic** para la función de IA. Los diagramas de clientes saldrían a un tercero: hay que avisarlo en la
   privacidad.
4. **WorkOS** solo con el primer cliente empresarial que pida SSO.

## 13. Pendiente de verificar

- Precio vigente de los modelos de Claude.
- Si GoJS muestra marca de agua en la evaluación.
- Estado de Jamsocket / Y-Sweet.
- Licencia y fecha de `perfect-freehand`.
- `vsdx-js` para exportar a VSDX.
- Typst WASM con fuentes.
- La API de exportación de tableros de Miro.
- Estrellas y actividad de los repositorios en GitHub (API bloqueada en esta sesión).
- Rendimiento con GPU real de Pixi y Leafer.
- Velocidad del motor DES con 100.000 entidades.
- Precios de Firebase.

**Fuentes principales (consultadas el 17-11-2026):**

- tldraw: https://tldraw.dev/pricing, https://tldraw.dev/get-a-license/hobby, https://tldraw.dev/faq,
  https://github.com/tldraw/tldraw/blob/main/LICENSE.md
- React Flow: https://reactflow.dev/pro, https://reactflow.dev/learn/troubleshooting/remove-attribution
- Bibliotecas comerciales: https://gojs.net/latest/pricing, https://www.yfiles.com/pricing, https://www.jointjs.com/pricing
- Leafer: https://www.leaferjs.com/
- Cloudflare: https://developers.cloudflare.com/durable-objects/platform/pricing/,
  https://developers.cloudflare.com/workers/platform/pricing/, https://developers.cloudflare.com/r2/pricing/
- Servicios: https://liveblocks.io/pricing, https://workos.com/pricing, https://supabase.com/pricing
- Exportación e importación: https://www.drawio.com/doc/faq/export-diagram, https://plantuml.com/download,
  https://developers.miro.com/docs/rest-api-reference-guide
- Paquetes: registro de npm (`npm view`)
- Pruebas propias: `/tmp/claude-0/-home-user-Inversiones-Startups/4b39a2d6-e546-5267-8f73-7e6f4cfd5e33/scratchpad/t/`
