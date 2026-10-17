# Andén · Visión «Experiencia»: la escena viva (17-10-2026)

> **Qué es este documento.** Una de las visiones de producto y arquitectura del simulador Andén (P2,
> `oportunidades/proyectos/P2-anden.yaml`), escrita desde un solo ángulo: **experiencia y espectáculo**. Busca el gemelo digital 3D
> más lindo y fluido que corra en cualquier navegador y en cualquier teléfono. Tiene que abrir al instante, compartirse con un enlace,
> presentarse ante un directorio y enseñarse en una cátedra, y su profundidad tiene que aparecer recién cuando hace falta. Responde
> al pedido del fundador del 17-10-2026: «el simulador logístico más espectacular, profundo, realista y avanzado que exista,
> superando incluso a FlexSim».
>
> **Sobre qué se apoya.** Los seis informes de `conocimiento/anden-simulador-2026-10/`: `incumbentes.md`, `frontera-ia.md`,
> `tecnologia-web.md`, `realismo-logistico.md`, `motor-validacion.md` y `mercado.md`. También toma las calculadoras v0
> (`apps/anden/`) y **una medición nueva hecha para esta visión**, en
> `oportunidades/proyectos/anden/visiones/experiencia-medicion/` (§2). Para la medición se construyó una maqueta de hub con el
> mecanismo completo, su traza, tres vistas (2D, 2,5D y 3D), un exportador de video y el modelo dentro de un enlace, y se midió en
> Node y en Chromium. Las otras dos visiones ya escritas (`rigor.md` e `ia-nativa.md`) comparten el núcleo. Esta pone el foco en la
> pantalla, la reunión y el aula.
>
> **Fechas y etiquetas.** Todas las fuentes se consultaron el 17-10-2026. Las URL vienen de los informes de investigación o se
> abrieron hoy, y se listan al final. Etiquetas (`doctrina/02-estandares-de-evidencia.md`):
> - **HECHO**: con fuente y fecha.
> - **MEDIDO**: medición propia reproducible; es un hecho cuya fuente es un script.
> - **ESTIMACIÓN**: con método.
> - **HIPÓTESIS**: a validar, con cómo.
> - **INFERENCIA**: razonamiento propio, con su confianza.
>
> **Límites.**
> - El cupo de búsquedas web de la sesión se agotó antes de que empezara esta visión. Lo nuevo de acá sale de mediciones propias, de
>   paquetes de datos de compatibilidad bajados de npm (MDN browser-compat-data 8.1.6 y caniuse-lite 1.0.30001816) y de tres páginas
>   abiertas directo. Lo que no pudo verificarse dice «no verificado hoy».
> - Ninguna cifra sale de la empresa donde trabaja el fundador. Las plantillas se arman solo con datos públicos y conocimiento
>   general (P2 › riesgos: Ley 11.723 art. 4 inc. d; LCT arts. 82, 85 y 88).
> - Los números de la maqueta son **supuestos de ejemplo**, no un hub real.

---

## 0. La visión en una página

1. **La categoría nueva es la escena viva.** Hoy un estudio de simulación termina en dos cosas muertas:
   - un **archivo** que solo abre el analista con su licencia;
   - un **video** o una captura que va a un PowerPoint.

   Ninguna de las dos se puede interrogar en la reunión donde se decide. Andén entrega una tercera cosa: **un enlace que abre en
   cualquier teléfono y reproduce la noche de tu operación como una película**. Esa película se calcula en el aparato de quien mira,
   es idéntica bit a bit a la del autor y se puede tocar: pausar, preguntarle a un paquete por qué llegó tarde, mover un deslizador y
   ver cambiar el futuro, ver las cien noches y no una sola.

   Es la forma visible del «gemelo de decisiones» que propone `mercado.md`: la unidad de valor deja de ser el modelo y pasa a ser
   la decisión compartida (INFERENCIA, confianza media-alta).
2. **Por qué ahora, y por qué no es un capricho visual.** Tres hechos de las últimas semanas lo hacen posible y urgente:
   - **La IA que arma modelos ya es básica.** AnyLogic 8.9.10 salió el 24-09-2026, Simio abrió MCP el 23-09-2026 y Siemens tiene
     su Copilot 2606 (HECHO, `frontera-ia.md`).
   - **El navegador ya no alcanza para diferenciarse.** AnyLogic Online salió el 15-09-2026 (HECHO).
   - **El dispositivo de quien mira ya puede calcular.** Una noche entera de un hub de 24.000 paquetes, con bandejas, rampas y
     personas, se simula en **0,18 s** y en un Worker del navegador en **0,21 s** (MEDIDO, §2.1).

   Lo que queda libre es **la última milla de la simulación: de la pantalla del analista a la cabeza de quien decide**. El 79% de las
   pymes del Delphi de la WSC 2022 no simula, por falta de recursos y de saber hacer (HECHO, `mercado.md`). A esa gente no la
   convence un modelo: la convence ver su propia noche.
3. **Lo que medimos para esta visión** (MEDIDO, §2; Chromium sin placa de video en un contenedor de 4 núcleos, que es un piso y
   no un techo):
   - **Película.** La noche entera del hub de 24.000 paquetes tarda 0,14–0,23 s con traza; la del de 90.000, 0,66–1,02 s. El
     primer cuadro desde un enlace tarda 28–42 ms sin contar la red.
   - **Enlace.** El modelo completo del hub ocupa 17 KB de JSON. Comprimido son **3.816 caracteres** en el `#` de la URL. Como
     plantilla más un parche son 264, y caben en un **QR de versión 11**.
   - **Dibujo sin GPU.** Por cuadro: plano 2D 0,8–1,3 ms; **2,5D isométrica con sprites horneados, 1,8 ms**; 3D con three.js, 33–36
     ms. Con la CPU frenada 4×, el 2,5D tarda **6,8 ms**: entra en 60 cuadros por segundo.
   - **Video.** 10 s de video 720p se codifican en 2,2–2,4 s (VP9) sin servidor y pesan 1,9 MB.
   - **Variabilidad.** En 60 noches de la maqueta, la recirculación va de 0,17% en la mediana a **15%** en la peor. La noche promedio
     no existe, y la vista tiene que mostrar la distribución.
   - **Pantalla dividida.** Comparar dos escenarios con la misma suerte achica **8,4 veces** la varianza de la diferencia de espera.
4. **Dieciocho capacidades diferenciales** (§3). Las centrales:
   - la escena en un enlace y en un QR;
   - la película de la noche, instantánea y rebobinable;
   - **el director**, una cámara que cuenta la historia sola;
   - la biografía de cualquier cosa que se toque;
   - mil noches sobre el plano;
   - el deslizador que mueve el futuro;
   - la pantalla dividida con la misma suerte;
   - el **modo directorio** (la reunión de siete minutos, en vivo y sin conexión);
   - el **modo cátedra** (la teoría viva en la escena, semilla por alumno y corrección automática);
   - tres pisos de dibujo con el mismo estilo;
   - zoom semántico;
   - personas que se ven como personas;
   - video con subtítulos que se comparte solo;
   - la escena con sello de verificada en tu dispositivo.
5. **Principios de experiencia.**
   - Lo que se ve es lo que se calculó: la traza es la única verdad visual.
   - Primero la película, después el formulario.
   - Cada píxel es una puerta.
   - Ningún número sin su incertidumbre a la vista.
   - Anda en el peor equipo de la sala.
6. **Arquitectura sin servidor de cómputo.**
   - El motor corre delante del cabezal de reproducción, en un Worker. Emite tramos (quién, dónde, desde cuándo, hasta cuándo), y
     las vistas los convierten en movimiento con fórmulas cerradas.
   - La escena viaja en el enlace: el modelo, o la plantilla con su parche, más una receta con semilla y huella.
   - El servidor es alojamiento estático, una función mínima para licencias y almacenamiento de objetos para la galería pública.
   - Costo marginal de un espectador: ~0.
7. **El primer corte ya es espectacular y profundo: «La noche del hub»** (§8, nov-2026 a feb-2027). Trae:
   - un hub de clasificación con el mecanismo completo y el motor verificado;
   - la película con director, biografías y cien noches;
   - la pantalla dividida, el enlace, el QR y el video;
   - el modo directorio básico y los tres pisos de dibujo;
   - la PWA sin conexión.

   Todo lo puede construir y probar Claude sin que el fundador lo juegue: hay pruebas de cuadro con CPU frenada, regresión visual
   por capturas, huellas en tres motores de navegador y sesiones sintéticas.
8. **Lo que concedemos.** No se pelea:
   - el fotorrealismo de Omniverse;
   - la física y la emulación de PLC;
   - los robots de seis ejes;
   - veinte años de bibliotecas;
   - el CAD corporativo.

   El 3D de Andén es **3D de comunicación**: claro, lindo y verdadero, no fotorrealista.

---

## 1. La tesis

### 1.1 Qué categoría abre: la escena viva

Una **escena viva** es un enlace que contiene un modelo de operación, o la referencia a una plantilla pública más los cambios, y una
receta. La receta dice qué noche, qué instante, qué cámara y qué escenarios mostrar. Al abrirlo, el dispositivo de quien mira:
1. reconstruye el modelo;
2. lo simula delante del cabezal de reproducción;
3. dibuja la película con el mejor piso de dibujo que su equipo soporta;
4. deja interrogar todo.

Las tres propiedades juntas son las que no tiene nadie (INFERENCIA, confianza media; «no encontramos» no prueba que no exista):

| Propiedad | Qué significa | Quién la tiene a medias (HECHO salvo indicación) |
|---|---|---|
| **Viva** | Se recalcula en el dispositivo: si movés un deslizador, cambia el futuro | AnyLogic Online corre modelos en el navegador, pero no sabemos si calcula en el navegador o en su nube (abierto en `frontera-ia.md`). La nube gratis de AnyLogic corta las corridas animadas a 5 minutos (fuente secundaria) |
| **Compartible** | Un enlace, sin cuenta, en el teléfono | Visual Components tiene visores gratuitos para teléfono, web y realidad virtual (de robótica de celdas). realvirtual WEB corre 3D en el navegador del que mira, pero sin motor de eventos discretos |
| **Verdadera** | Lo que se ve es la simulación, bit a bit, con su incertidumbre | No encontramos a nadie que muestre una huella verificable de la animación ni la distribución de noches sobre el plano |

**Diferencia con las otras dos visiones** (las tres comparten el motor, el esquema y la traza):
- `rigor.md` abre la «simulación con comprobante»: que el número sea correcto y reproducible.
- `ia-nativa.md` abre el «estudio de simulación automático»: que la IA haga el método del ingeniero.
- Esta abre **el medio**: que ese número y ese método **lleguen** a quien decide y a quien aprende, y lo convenzan sin mentirle.

Sin la escena viva, el comprobante y el estudio terminan en un PDF (INFERENCIA, confianza alta).

### 1.2 Dónde se pierde hoy el valor de una simulación

El recorrido típico de un estudio con un incumbente (INFERENCIA de oficio; la cadena no está medida en ninguna fuente que hayamos
leído):

```
analista arma el modelo (40–60% del proyecto, HECHO: Banks vía UNAM 2026)
   → carga datos (10–40%, HECHO: Skoogh y Johansson 2009)
   → corre experimentos en su PC con licencia (USD 4.995–21.800, HECHO: incumbentes.md)
   → graba un video de una corrida y saca capturas
   → arma un PowerPoint
   → reunión: el directorio ve imágenes muertas
        «¿y si ponemos una persona más en la rampa?» → «lo corro y te aviso el jueves»
        «¿esto pasa todas las noches?» → «es una corrida representativa»
        «¿cómo sé que el video es lo que calculaste?» → confianza en el analista
```

Tres pérdidas en ese recorrido. Las tres son de experiencia, no de motor:
1. **La pregunta del directorio no se puede contestar en la sala.** El modelo quedó en la PC del analista.
2. **Se muestra una corrida como si fuera la realidad.** Law (WSC 2023) documenta siete errores típicos, entre ellos usar una sola
   corrida y mirar solo promedios (HECHO, `incumbentes.md`). Nuestra maqueta muestra que una noche puede tener 0,01% de recirculación
   y otra 15% con los mismos parámetros (MEDIDO, §2.5).
3. **El video no prueba nada.** Puede ser una corrida elegida, editada o vieja.

### 1.3 Por qué le gana a FlexSim, AnyLogic y Plant Simulation en lo que importa

«Lo que importa» se define como **cuánta gente decide mejor con simulación** (`mercado.md` §5), no cuántos objetos trae la biblioteca.

| Dimensión | FlexSim / AnyLogic / Plant Simulation | Andén, escena viva | Evidencia |
|---|---|---|---|
| Tiempo hasta ver algo | Instalar o entrar a una nube, licencia o cuenta. Plant Simulation de escritorio es para Windows | Un enlace. Cálculo del primer cuadro: 28–42 ms. Núcleo del visor: 8,2 KB brotli | HECHO (`incumbentes.md`) / MEDIDO (§2.1, §2.3) |
| Quién puede verlo | Quien tiene la herramienta o un visor | Cualquiera con un teléfono, sin cuenta | INFERENCIA |
| Qué se ve | Una corrida animada | La noche que el autor eligió, con su etiqueta («la peor de 100», «la mediana»), y las cien noches sobre el plano | MEDIDO (§2.5) / diseño |
| Qué puede hacer quien mira | Mirar un video | Tocar, preguntar, mover un deslizador, comparar A/B con la misma suerte | MEDIDO (§2.5) / diseño |
| Confianza en la imagen | La del analista | Huella de la traza recalculada en el dispositivo de quien mira | Diseño; reproducibilidad bit a bit en `tecnologia-web.md` §3 |
| Hardware para el 3D | Escritorio; el fotorrealismo pide Omniverse con placa RTX (Isaac Sim 6.0.1: RTX 4080 como mínimo) | 3D con GPU, 2,5D sin GPU a 1,8 ms por cuadro y plano 2D | HECHO (`frontera-ia.md`) / MEDIDO (§2.3) |
| Llevarlo a una reunión | Video exportado o la notebook del analista | Modo directorio en vivo y sin conexión (PWA), vista del presentador en otra ventana | Diseño (§3, E8) |
| Enseñar | FlexSim regala su libro en PDF (más de 400 universidades); AnyLogic PLE es gratis para estudiantes | La teoría vive en la escena y cada alumno tiene su semilla y su corrección automática | HECHO (`mercado.md`) / diseño (E9) |
| Costo de mostrar a mil personas | Licencias o nube por núcleo | ~0: calcula el dispositivo de cada uno | HECHO (`incumbentes.md`) / INFERENCIA |
| Idioma | No encontramos interfaz en español | Español primero | HECHO (ausencia, `incumbentes.md`) |

### 1.4 Lo que concedemos

- **Fotorrealismo y física.** El 3D de Andén no compite con Omniverse, Unreal (Emulate3D) ni la física de cintas para comisionado
  virtual. Esos productos sirven a otro cliente (`frontera-ia.md` §2).
- **Amplitud.** Veinte años de objetos de FlexSim, el multimétodo de AnyLogic, la integración CAD de Autodesk. Se gana en verticales
  (hub, cross-dock, depósito pyme, última milla), donde el fundador sabe más.
- **El navegador como novedad.** AnyLogic Online ya está. Andén no vende «en el navegador»: vende «en el teléfono de tu jefe, al
  instante, y se puede tocar».

### 1.5 Principios de experiencia

1. **Lo que se ve es lo que se calculó.** Ninguna animación «decorativa» mueve una entidad. Todo movimiento sale de un tramo de la
   traza (MEDIDO: el reproductor calcula ~1.860 entidades en 0,1–0,2 ms por cuadro, §2.3). Si algo se ve raro, es un error del modelo
   y hay que mostrarlo, no maquillarlo.
2. **Primero la película, después el formulario.** El primer contacto con Andén es ver una operación funcionando, no llenar campos.
   La profundidad aparece en capas. Primero se mira; después se toca algo y aparece su historia. Recién en la tercera capa aparecen
   los números con intervalo, y en la última el modelo, el código y los datos.
3. **Cada píxel es una puerta.** Todo lo que se dibuja se puede tocar, y todo lo que se toca lleva a su biografía, a sus números y a
   su causa.
4. **Ningún número sin su incertidumbre a la vista.** Si se muestra una noche, se dice cuál es. Si se muestra un indicador, se muestra
   su banda. El semáforo de confianza de `rigor.md` vive en la escena.
5. **Anda en el peor equipo de la sala.** El proyector de la facultad con una PC vieja, el teléfono de gama baja del supervisor, la
   notebook corporativa con la GPU bloqueada. Hay tres pisos de dibujo y se elige solo (E10).

---

## 2. Lo que medimos para esta visión

Todo está en `oportunidades/proyectos/anden/visiones/experiencia-medicion/`, con scripts, resultados en JSON, capturas y un README
para repetirlo.
- **Entorno:** contenedor compartido con Intel Xeon de 2,1 GHz y 4 núcleos virtuales, sin GPU; Node 22.22.0; Chromium 141 sin
  interfaz (Playwright 1.56.1) con gráficos por software (SwiftShader).
- **Variación:** los tiempos varían ±15–30% entre corridas, por eso se dan medianas y rangos.

**La maqueta** (`hub.mjs`) es un hub de clasificación de última milla en el turno de noche, simulado como mecanismo y no como tasas.
Tiene:
- 26 camiones con turno y desvío;
- 4 andenes con descarga a cinta;
- cintas con contrapresión (si la fila se llena, la cinta se detiene y el camión espera);
- 4 personas que inducen, con fatiga exponencial, pausas escalonadas y 5% de ausentismo;
- un sorter de 300 bandejas a 2 m/s con paso de 0,6 m;
- 1,5% de NO-READ;
- 60 rampas de 25 paquetes con destinos de peso desigual (tipo Zipf);
- recirculación de hasta 3 vueltas;
- 15 personas de rampa con la regla «la más llena primero»;
- jaulas de 60 paquetes con 90 s de cierre;
- un puesto manual de excepciones.

**El motor:**
- **Eventos discretos** con montículo, tiempo entero en milisegundos y desempate por secuencia.
- **Sorter como «isla» de paso fijo**, con una rueda de tiempos: cada paquete se agenda para el paso en que su bandeja pasa por su
  rampa, así que cuesta O(1) por vuelta.
- **Azar:** un flujo xoshiro128\*\* por fuente.

Hay una variante de 90.000 paquetes (14 inductores, 760 bandejas, 138 rampas) que funciona exigida, con 20% de recirculación. Los
parámetros salen de `realismo-logistico.md`, pero son supuestos de ejemplo.

### 2.1 La película de una noche (MEDIDO)

| | Hub 24k | Hub 90k |
|---|---|---|
| Noche entera con traza, Node (mediana de 10; rango) | **182 ms** (144–225) | **773 ms** (659–1.018) |
| Noche entera en un Worker de Chromium (mediana de 6) | **209 ms** | **827 ms** |
| Primeros 15 minutos simulados | 2,2 ms | 5,3 ms |
| Eventos + pasos del sorter por noche | ~100.000 + ~85.000 | ~391.000 + ~161.000 |
| Veces más rápido que el tiempo real | ~160.000 | ~42.000 |
| Tramos de la traza; peso crudo → en columnas con gzip | 198.000; 5,5 MB → 1,3 MB | 760.000; 21 MB → 5,2 MB |
| **Primer cuadro desde un enlace** (descomprimir el modelo + simular 10 min + dibujar 2D, sin red) | **28–42 ms** | — |

**Qué significa (INFERENCIA, confianza alta para escritorio, media para teléfonos):**
- **No hace falta guardar la película.** Recalcular la noche entera cuesta menos que bajar su traza: 0,2 s contra 1,3 MB.
- **Rebobinar puede ser volver a simular.** En escenas de menos de ~1 s no hacen falta fotos del estado.
- **El motor puede ir delante del cabezal.** A ×60, un minuto de pantalla consume una hora simulada, que el motor resuelve en
  milisegundos.

Para teléfonos, `tecnologia-web.md` supone entre 3 y 10 veces más lento que esta máquina (rango sin medir). Aun en el peor caso, la
noche del hub de 24k tardaría ~2 s en un Worker mientras la película ya corre (ESTIMACIÓN con ese rango).

### 2.2 El modelo en un enlace y en un QR (MEDIDO)

Se armó el **documento declarativo completo** del hub de la maqueta (`modelo-ejemplo.json`). Tiene layout con coordenadas, 27
personas con turnos y pausas, 26 camiones, la curva de 96 tramos de 15 minutos, 9 parámetros con su procedencia, costos, 3
escenarios y el experimento.

| Contenido | JSON | Comprimido | Caracteres en el `#` | QR (URL completa) |
|---|---|---|---|---|
| Modelo completo | 17.262 B | 2.862 B (deflate-raw) · 2.206 B (brotli) | **3.816** | No entra: el tope del QR versión 40-L es 2.953 bytes (HECHO, Wikipedia) |
| Plantilla publicada + parche de 5 cambios | 385 B | 198 B | **264** | **Versión 11** (61 × 61 módulos) con corrección L; 12 con M |
| Receta de una escena (huella del modelo, versión del motor, semilla, instante, velocidad) | 99 B | 95–98 B | 127–131 | Versión 7 (L) |

Contexto (HECHO):
- Chrome acepta URL de hasta 2 MB («Chrome limits URLs to a maximum length of 2MB», documentación de Chromium).
- `CompressionStream` con `deflate-raw` existe desde Chrome 103, Firefox 113 y Safari 16.4 (MDN BCD 8.1.6), y funcionó en la prueba.
  Con `brotli` el modelo ocuparía 23% menos, pero Chrome no lo tiene en `CompressionStream` (solo Firefox 147 y Safari 18.4, según
  MDN; MEDIDO como ausente en Chromium 141).
- Lo que va después del `#` no se manda al servidor (la v0 de calculadoras ya lo usa, `apps/anden/README.md`).

**Diseño que sale de acá (INFERENCIA, confianza alta):**
- El modelo propio viaja entero en el enlace: unos 4.000 caracteres, sin servidor.
- Lo que nace de una plantilla viaja como «plantilla + parche», cabe en un QR imprimible en un póster de congreso o en una
  diapositiva, y se escanea con la cámara del teléfono.
- Para mostrar una escena de un modelo ya compartido alcanza con la receta.
- Los modelos grandes (miles de ubicaciones) se publican en la galería y el enlace lleva solo su dirección.

### 2.3 Tres pisos de dibujo, sin placa de video (MEDIDO)

1280 × 720, en el instante con más cosas a la vista: ~330–370 entidades móviles en el hub 24k (más 300 bandejas, 61 rampas y 60
jaulas) y ~1.860 en el de 90k. El tiempo es mediana por cuadro con el percentil 95 entre paréntesis.

| Vista | Hub 24k | Hub 90k |
|---|---|---|
| Solo calcular posiciones desde la traza | < 0,1 ms | 0,1–0,2 ms |
| Plano 2D (Canvas) | 0,8–1,3 ms (1,5) | 1,9 ms (3,2) |
| **2,5D isométrica con sprites horneados (Canvas)** | **1,8 ms (2,7)** | **5,9 ms (7,3)** |
| 3D three.js r186, resolución completa | 33–36 ms (43) | 61 ms (67) |
| 3D three.js, media resolución | 19 ms (24) | 50 ms (57) |
| Plano 2D con la CPU frenada 4× / 6× | 4,1 / 5,6 ms | 8,3 / 13 ms |
| **2,5D con la CPU frenada 4× / 6×** | **6,8 / 16,8 ms** | 29 / 46 ms |

Lectura:
- **Sin GPU, el 2,5D isométrico se ve casi como 3D y cuesta lo que un plano** (MEDIDO; las capturas `captura-iso.png` y
  `captura-3d.png` muestran la misma escena). Esta medición agrega un piso a la conclusión de `tecnologia-web.md` («sin GPU el 3D no
  existe, el producto es el 2D»): el **2,5D horneado da volumen, luz y profundidad** en el equipo más pobre, y el 3D real queda para
  donde hay GPU.
- **El 3D por software a media resolución da ~50 cuadros por segundo** en el hub chico (19 ms). Sirve como respaldo, no como
  experiencia principal.
- **Con la CPU frenada como un teléfono** (aproximación: DevTools ofrece «presets calibrados» para teléfonos de gama baja y media cuyo
  multiplicador depende del equipo, HECHO, developer.chrome.com), el 2,5D del hub chico entra en 60 cuadros por segundo a 4×.
- **El hub grande a 6× pide nivel de detalle**: dibujar puntos y no cajas cuando se mira de lejos (E11).
- Limitación: el freno de CDP frena el JavaScript, no la rasterización del proceso de GPU. **No es un teléfono.**

Pesos (MEDIDO con esbuild 0.28.2):
- Motor de la maqueta + reproductor + vistas 2D y 2,5D: **21 KB minificado, 8,2 KB brotli**.
- Exportador de video (mediabunny 1.61.6, MPL-2.0, solo MP4/WebM y lienzo): 228 KB, 50 KB brotli, a demanda.
- three.js: 108–171 KB brotli según el renderizador (HECHO medido por `tecnologia-web.md`).

### 2.4 Video sin servidor (MEDIDO)

- **Velocidad.** 10 s a 30 cuadros por segundo de la vista 2,5D en 1280 × 720 tardan **2,2–2,4 s** en codificarse (4,2–4,6 veces el
  tiempo real). El archivo pesa **1,9 MB**, en VP9 dentro de WebM.
- **Formatos.** Este Chromium **no codifica H.264** ni con WebCodecs ni con MediaRecorder; sí VP8, VP9 y AV1. Es el Chromium de
  Playwright: no sabemos si Chrome y Safari reales codifican H.264, y hay que medirlo en dispositivos (HIPÓTESIS).
- **Soporte** (HECHO, MDN BCD 8.1.6): WebCodecs `VideoEncoder` está en Chrome 94, Safari 16.4 (también iOS) y Firefox 130 de
  escritorio, no en Firefox Android. Por versión de navegador lo tiene el 95,0% del uso argentino (HECHO, caniuse-lite, §2.6).
- **Para mensajería** (INFERENCIA, confianza media): conviene MP4/H.264 donde el navegador lo codifique, y WebM con VP9 como respaldo.
  Si el formato no lo acepta la aplicación de destino, el GIF corto es el último recurso.

### 2.5 La noche promedio no existe, y la pantalla dividida tiene que usar la misma suerte (MEDIDO)

**60 noches del hub 24k con los mismos parámetros** (`noches.mjs`):
- Recirculación: mediana **0,17%**, percentil 90 **7,2%**, máximo **15,0%** (la semilla 2, que es la escena del banco y la de las
  capturas).
- En 11 de 60 noches faltó un inductor.
- El percentil 90 de espera fue de 4,2 min en la mediana y de 9,2 min en la peor noche.

**Pantalla dividida A/B** (4 → 5 puestos de inducción, 40 réplicas, `ab.mjs`). Con la misma aleatoriedad en los dos lados (mismos
camiones, misma mezcla, mismas ausencias):

| Diferencia B − A | Con la misma suerte | Con suertes independientes | Varianza |
|---|---|---|---|
| Percentil 90 de espera | **−0,82 min (IC 95% ± 0,09)** | −0,76 min (± 0,27) | **8,4 veces menor** |
| Hora de fin de la clasificación | −5,6 min (± 3,4) | −8,0 min (± 4,0) | 1,4 veces menor |

**Qué significa (INFERENCIA, confianza alta):**
- **Mostrar una sola noche es mentir sin querer.** La escena tiene que decir qué noche es y ofrecer siempre «ver las cien».
- **La pantalla dividida solo es honesta con la misma suerte.** Así, lo que cambia entre las dos mitades es el efecto de la decisión
  y no el azar: el mismo camión llega al mismo minuto en las dos.
- **La reducción depende del indicador.** Coincide con `motor-validacion.md`, que midió 34 veces para un cambio chico y 1,43 para un
  cambio de dotación. La interfaz tiene que decir cuántas noches hacen falta para cada comparación.

### 2.6 Compatibilidad de lo que la experiencia usa (HECHO)

Uso argentino por versión de navegador según caniuse-lite 1.0.30001816 (13-10-2026, región AR). Método: suma del uso por versión con
soporte completo; el uso de Chrome para Android viene agregado en una sola versión.

| Función | Para qué en Andén | Soporte (MDN BCD 8.1.6) | Uso en AR |
|---|---|---|---|
| Web Share (`navigator.share`) | Mandar el enlace o el video a WhatsApp desde el teléfono | Chrome Android 61, Safari iOS 12.2, Chrome escritorio 128; Firefox solo Android | 88,3% (+7,1% parcial) |
| Screen Wake Lock | Que la pantalla no se apague en la reunión o en el piso | Chrome 84, Firefox 126, Safari 16.4 (iOS 18.4) | 96,3% |
| WebCodecs | Video sin servidor | Ver §2.4 | 95,0% (+1,1%) |
| View Transitions | Pasar de la película a la biografía sin cortes | Chrome 111, Firefox 144, Safari 18 | 93,1% |
| Fullscreen | Modo directorio | Chrome 71, Firefox 64, Safari 16.4 (iOS parcial) | 93,1% (+5,3%) |
| BroadcastChannel | Vista del presentador en otra ventana, sin servidor | Chrome 54, Firefox 38, Safari 15.4 | — |
| WebXR | Realidad aumentada | Solo Chromium (79) | 0% completo; 89,7% parcial |
| `prefers-reduced-motion`, `aria-live` | Accesibilidad | Universales | — |

WebGPU (~91,6% por versión) y WebGL 2 (99,8%) ya están en `tecnologia-web.md`.

### 2.7 Lo que no medimos

- Teléfonos reales, GPU reales, Firefox y Safari.
- La calidad percibida: nadie que no sea Claude miró las capturas.
- Un depósito con miles de ubicaciones a la vista.
- H.264 en Chrome y Safari reales.
- La experiencia completa de una reunión.

El corte 1 incluye medirlo (§8).

---

## 3. Dieciocho capacidades diferenciales

Formato de cada una:
- **Qué hace.**
- **Por qué nadie la tiene, o la tiene mal.**
- **Cómo se construye en el navegador.**

Cada afirmación lleva su etiqueta.

Las primeras diez son las que hacen la categoría; el resto la completa. Los textos de pantalla entre comillas con números son
**ejemplos de diseño**, no resultados, salvo que digan MEDIDO.

### E1. La escena en un enlace, y el QR del póster

**Qué hace.** «Compartir» genera un enlace que contiene todo:
- el modelo, o la plantilla más el parche;
- la noche elegida (semilla);
- el instante;
- la cámara;
- los deslizadores habilitados.

Quien lo abre ve la película en su teléfono sin cuenta. Para un póster, una diapositiva o la cartelera de la cátedra, el mismo enlace
sale como **QR**. Escanearlo con la cámara del teléfono pone el hub a andar en la mano.

**Por qué nadie.** Los incumbentes comparten archivos o modelos alojados en su nube con límites: la nube gratis de AnyLogic corta las
corridas animadas a 5 minutos (HECHO de fuente secundaria, checkthat.ai, jul-2026, citado en `incumbentes.md`). Un modelo que
viaja en la URL y se calcula en el dispositivo no lo encontramos en ningún simulador (INFERENCIA, confianza media).

**Cómo.**
- **Codificación:** JSON canónico (claves ordenadas), luego `deflate-raw` con `CompressionStream`, luego base64url en el `#`.
- **Plantillas como parches:** JSON Patch (RFC 6902) contra una plantilla versionada e inmutable que se publica como archivo estático.
- **Receta:** huella SHA-256 truncada del modelo, versión del motor, semilla, instante y velocidad.
- **Tamaños medidos (§2.2):** 3.816 caracteres el modelo completo, 264 la plantilla con parche, 127–131 la receta.
- **Vista previa en WhatsApp y LinkedIn.** El servidor no ve el `#`, así que no puede generar una imagen por escena. Para escenas
  privadas, la vista previa es genérica (INFERENCIA). Para escenas públicas, la imagen se genera en el navegador del autor al publicar
  y se sube a la galería junto con la escena.

### E2. La película de la noche: instantánea, con línea de tiempo y rebobinable

**Qué hace.** Al abrir, la noche ya está corriendo a ×60, sin «Run» y sin esperar. Abajo hay una **línea de tiempo con marcas de
eventos**: «22:41 camión 3 llega con 25 min de atraso», «02:14 la rampa 01 se llena», «03:05 se termina el turno de la persona de
inducción 2», «05:11 último paquete clasificado». El cabezal se arrastra a cualquier minuto, va de ×1 a ×3.600 y vuelve atrás.

**Por qué nadie.** Los simuladores de escritorio animan mientras calculan. Para ver las 2 de la mañana hay que esperar o correr sin
animación y perder la película. El rebobinado exige grabar o reconstruir. No encontramos línea de tiempo con eventos marcados en
los incumbentes (no verificado hoy: la ayuda de FlexSim 2027 abrió solo su portada y la de AnyLogic devolvió 403).

**Cómo.**
- El motor corre en un Worker **delante del cabezal**: 15 minutos simulados en 2,2 ms; la noche entera en 0,18–0,21 s (MEDIDO).
- Las marcas salen de un detector de eventos sobre la traza: rampa llena, cuello que cambia según el método del período activo,
  atraso, paquete que pierde el corte.
- Rebobinar es volver a simular desde el principio en escenas de menos de ~1 s, o desde fotos del estado cada 15 minutos en escenas
  grandes.
- Todo es determinista (`tecnologia-web.md` §3), así que la película vuelve idéntica.

### E3. El director: una cámara que cuenta la historia sola

**Qué hace.** Un «director» automático elige los planos como lo haría alguien que conoce el hub:
1. **Plano general** para presentar la operación.
2. **Acercamiento a la inducción** cuando se forma la fila.
3. **Seguimiento de un paquete** que da tres vueltas porque su rampa está llena.
4. **Corte al marcador** cuando llega el horario de corte.

Cada plano trae una línea de subtítulo calculada: «la rampa 01 recibe 9% del volumen y una sola persona la vacía; se llena 8 de cada
100 noches». El usuario puede desactivarlo, fijar la cámara o guardar los planos como guion de su presentación.

**Por qué nadie.** Las herramientas de presentación de los incumbentes son recorridos de cámara armados a mano (conocimiento previo
sobre FlexSim y Emulate3D, no verificado hoy). Una cámara que decide qué mostrar porque **sabe** qué pasa en el modelo no la
encontramos (INFERENCIA, confianza media).

**Cómo.**
- Los «momentos» salen de la explicación calculada de `ia-nativa.md` y `rigor.md`: descomposición del tiempo de ciclo, período activo
  y contrafactuales con números comunes. El director los convierte en una lista de planos con prioridad y duración mínima.
- La cámara se mueve con curvas suaves (curvas de Bézier con aceleración limitada) y respeta `prefers-reduced-motion`.
- El subtítulo es una plantilla con números del experimento. El modelo de lenguaje solo lo redacta mejor cuando hay conexión y
  créditos, y cada número sigue saliendo del experimento (regla de `frontera-ia.md` §4.2).

### E4. La biografía de cualquier cosa: tocar un paquete, una rampa, una persona

**Qué hace.** Tocar un paquete abre su biografía en una tarjeta:

> «Llegó en el camión 7 a las 23:41 · esperó 6 min en la fila de inducción (había 140 adelante) · lo indujo la persona 2, que estaba a
> 1 h 40 de su última pausa (+11% de tiempo) · dio 2 vueltas porque la rampa 01 estaba llena · cayó a la jaula 12 a las 00:03 · 22 min
> en el hub: más que el 93% de los paquetes de esta noche».

Lo mismo pasa con otras cosas:
- **Una rampa:** su ocupación en el tiempo, qué la llenó, quién la vacía y el contrafactual con dos personas.
- **Una persona:** su ritmo, su fatiga y sus pausas.
- **Un camión:** cuánto esperó en la playa.

**Por qué nadie.** Simio, por MCP, contesta consultas del tipo «qué órdenes terminaron tarde y qué tienen en común» (HECHO,
`frontera-ia.md`). Es lo más cercano, pero es una consulta de experto por agente, no un toque sobre la escena. La causa narrada por
entidad no la encontramos (INFERENCIA).

**Cómo.**
- La traza ya tiene todo: cada tramo dice entidad, recurso, inicio y fin.
- El índice por entidad se arma en el Worker.
- La posición en la fila sale de su número de secuencia menos las salidas hasta ese instante. Es la misma fórmula del reproductor,
  ver `reproductor.mjs`.
- Las causas («esperó porque…») salen de clasificar la espera: fila, bloqueo, falta de bandeja, rampa llena o pausa.
- Las transiciones usan View Transitions, que tiene el 93,1% del uso en AR.

### E5. Mil noches sobre el plano: la incertidumbre se ve

**Qué hace.** Un botón, «ver las cien noches», cambia la película por un **mapa del riesgo** sobre el mismo plano:
- cada rampa pintada por la probabilidad de llenarse;
- cada fila con su banda P50–P90;
- la hora de fin como un abanico;
- un selector de noches: la mediana, la peor de 100 y la mejor.

**Por qué nadie.** Los incumbentes animan una réplica y muestran las estadísticas en otra ventana. La incertidumbre dibujada en el
plano no la encontramos (INFERENCIA; `tecnologia-web.md` §13 la propone como idea nueva).

**Cómo.**
- **Cómputo:** 100 noches del hub 24k a ~0,2 s cada una en 3 Workers dan ~7 s (ESTIMACIÓN con §2.1). Se muestran progresivamente: la
  banda se afina mientras llegan noches.
- **Agregación:** histogramas por celda y por recurso, transferidos como arreglos tipados (8 ms por millón de eventos,
  `tecnologia-web.md`).
- **Dibujo:** texturas de calor en la vista 2,5D y 3D.
- **A futuro:** con WebGPU, miles de noches de modelos chicos (fase posterior, HIPÓTESIS de `tecnologia-web.md` §4.4).

### E6. El deslizador que mueve el futuro

**Qué hace.** Quien mira mueve «personas en la rampa 01: 1 → 2» y en ~150 ms la película se rehace desde el instante actual. Aparece
la indicación «provisorio (1 noche)», y unos segundos después «−7 puntos de recirculación (IC 95% −5 a −9; 40 noches pareadas)».
El autor elige qué perillas expone, con rango y unidad.

**Por qué nadie.** Para no expertos, nadie muestra el efecto en vivo sobre la película con la misma aleatoriedad (INFERENCIA). La
nube gratis de AnyLogic limita las corridas (HECHO de fuente secundaria).

**Cómo.**
- **Vista previa:** la noche del hub chico en ~0,2 s alcanza con una sola noche (MEDIDO).
- **Confirmación:** réplicas pareadas con números comunes en los Workers libres (§2.5) y precisión objetivo de `rigor.md`.
- **Límite honesto:** en modelos grandes la vista previa simula solo las próximas horas. El presupuesto de `tecnologia-web.md` es de
  ≤ 150 ms ≈ 1–1,5 millones de eventos.

### E7. Pantalla dividida con la misma suerte

**Qué hace.**
- **Dos hubs lado a lado,** el actual y la propuesta, sincronizados al mismo minuto. El mismo camión llega a los dos al mismo tiempo
  y la misma persona falta en los dos. Lo que se ve distinto **es** el efecto de la decisión.
- **Modo «fantasma»:** en vez de dos paneles, la propuesta se dibuja transparente sobre el actual.
- **Marcador común:** «A: 05:16 · B: 05:10 · diferencia −5,6 min ± 3,4».

**Por qué nadie.** Los incumbentes comparan escenarios en tablas y gráficos. FlexSim 2027 repite flujos aleatorios al optimizar (HECHO,
`motor-validacion.md`). Pero no encontramos la comparación **visual sincronizada** con números comunes para el lector (INFERENCIA).

**Cómo.**
- Un flujo de azar por fuente con consumo fijo de números (ya en la maqueta: un `flujo` por camión, inducción, rampa y manual).
- Dos reproductores sobre dos trazas con el mismo reloj.
- Medido: 8,4 veces menos varianza en la diferencia de espera (§2.5).

### E8. Modo directorio: la reunión de siete minutos, en vivo y sin conexión

**Qué hace.** «Presentar» arma solo una presentación **viva** en tres actos, con las escenas que el autor marcó:
1. **«Así es una noche».** Plano general a ×600 con el marcador.
2. **«Dónde se traba y por qué».** El director va al cuello, aparece la biografía de la rampa y se muestra el contrafactual en pantalla
   dividida.
3. **«Qué proponemos, cuánto cuesta y cuánto confiar».** B contra A, el costo por paquete con su intervalo (tomado de las
   calculadoras de costo laboral y de clasificación) y la probabilidad de llegar al corte.

Al final, **preguntas en vivo** con los deslizadores habilitados.

Más detalles:
- **Avance:** con flechas o un control remoto de diapositivas, que manda teclas.
- **Vista del presentador:** en otra ventana de la misma computadora, con notas, cronómetro y la próxima escena.
- **Sin conexión:** funciona en la PWA, en una sala sin wifi.
- **Pantalla:** no se apaga.
- **Con marca:** el consultor pone la suya en el plan Equipo (`mercado.md`).

**Por qué nadie.** El resultado de un incumbente termina en un video o en capturas para PowerPoint (INFERENCIA de oficio). Una
presentación que **es** el modelo y contesta en la sala no la encontramos.

**Cómo.**
- **Pantalla completa** (93,1% del uso en AR).
- **Wake Lock** (96,3%).
- **BroadcastChannel** para sincronizar la ventana del presentador y la del proyector sin servidor (Chrome 54, Firefox 38, Safari
  15.4).
- **Service worker** para funcionar sin conexión.
- **Guion:** un JSON de escenas, cada una con receta, cámara y subtítulo.
- **Teléfono como control remoto:** pediría un canal entre dos dispositivos (WebRTC con señalización), así que queda para después.

### E9. Modo cátedra: la teoría vive en la escena

**Qué hace.**
- **Capas de teoría sobre la escena:**
  - **Little en vivo:** contadores de L, λ y W de una zona, y su producto, que se ve cumplirse.
  - **Erlang C** al lado de la fila simulada.
  - El experimento de cobertura de Law reproducido en vivo: el intervalo «ingenuo» cubre 8,4% (MEDIDO por `motor-validacion.md`).
- **«Predecí antes de correr».** El alumno estima la cola o la dotación, y la escena le muestra cuánto se equivocó y por qué.
- **Semilla por alumno.** Cada alumno recibe su propia noche, sin copia posible: la semilla sale de su número de libreta y del código
  de la clase. El docente comprueba cada entrega recalculándola desde su receta, en el navegador.
- **Ejercicios con corrección automática:** «con 4 inductores, ¿a qué hora termina tu noche?».
- **Clase proyectada:** el docente maneja la escena y los alumnos la siguen desde el QR.

**Por qué nadie.** FlexSim regala un libro en PDF y está en más de 400 universidades. Simio está en más de 500 y AnyLogic da PLE gratis a
estudiantes (HECHO, `mercado.md`). Ninguno trae la teoría corriendo sobre la escena ni corrección por receta (INFERENCIA).

**Cómo.**
- Reproducibilidad bit a bit: matemática y azar propios (`tecnologia-web.md` §3).
- La entrega es una receta de 130 caracteres (MEDIDO §2.2), así que no hace falta servidor para corregir.
- Plataforma: PWA; anda en la PC del laboratorio y en el teléfono.
- Encaja con Andén Aula del P2 y con la promoción cruzada prevista en P6 (Hub Rush en cátedras de logística).

### E10. Tres pisos de dibujo con el mismo estilo, elegidos solos

**Qué hace.** La misma escena se ve en:
- **3D** con GPU (three.js con `WebGPURenderer` y respaldo WebGL 2);
- **2,5D isométrica** sin GPU (Canvas con sprites horneados);
- **plano 2D**, para trabajar y para equipos muy pobres.

En el primer segundo, Andén mide el tiempo de cuadro y elige el piso. Si el cuadro supera el presupuesto, baja de piso sin avisar.
El estilo visual (paleta por estado, formas y luz) es el mismo en los tres, así que el cambio no se nota como «versión pobre».

**Por qué nadie.** El 3D de los incumbentes es de escritorio, y el fotorrealismo pide RTX (HECHO). realvirtual WEB tiene 3D en el
navegador sin motor de eventos discretos (HECHO).

**Cómo.**
- Medido (§2.3): 2,5D 1,8 ms; 3D por software 33–36 ms (media resolución, 19 ms); 2D 0,8–1,3 ms.
- **Lo horneado:** lo estático (lazo, rampas, andenes, piso) se dibuja una sola vez. Por cuadro solo se dibuja lo que se mueve.
- **Orden por profundidad** en el 2,5D, con sprites prerrenderizados por estado.
- **En el 3D:** instancias, niveles de detalle y resolución dinámica.
- **Sin GPU no hay 3D por defecto:** Chrome 141 avisa que el paso automático a WebGL por software quedó obsoleto (HECHO medido por
  `tecnologia-web.md`).

### E11. Zoom semántico: del flujo al paquete al evento

**Qué hace.** La profundidad aparece con el zoom:
- **De lejos:** el hub es un **diagrama de flujo sobre el plano**. Las cintas son ríos con grosor proporcional a paquetes por hora, el
  cuello pulsa y cada zona tiene su indicador.
- **A media distancia:** paquetes como puntos de color por estado.
- **De cerca:** cajas, bandejas, personas con postura y la etiqueta del destino.
- **Más cerca todavía:** el registro de eventos de esa máquina y sus fórmulas.

**Por qué nadie.** Los incumbentes separan la vista 3D de las ventanas de estadística. Siemens tiene diagramas Sankey (HECHO), pero no
sobre la animación con transiciones continuas (INFERENCIA).

**Cómo.**
- Los flujos se calculan agregando tramos por arco del grafo y por ventana de tiempo.
- El nivel de detalle se elige por píxeles por metro.
- Resuelve el hub de 90k con la CPU frenada a 6× (§2.3): de lejos, puntos y no cajas.

### E12. Personas que se ven como personas

**Qué hace.** Las personas son el cuello más común de un hub (`realismo-logistico.md` §0, punto 2), así que la escena las muestra con sus
estados: induciendo, caminando, en pausa, cubriendo un puesto ajeno, cerrando una jaula.

- **Fatiga:** se ve en el ritmo, más lento a medida que se aleja la última pausa.
- **Aprendizaje:** en picking por voz, la eficiencia de los ingresantes pasó de 0,46 a 0,88 en ~9 semanas, contra 0,80–0,95 de los
  experimentados (HECHO, Loske y Klumpp). Al temporario de Hot Sale se lo ve acelerar con los días.
- **Pausas escalonadas:** se ven como huecos en la línea.

En la biografía de una persona aparecen sus pausas y su ritmo. **Nada identifica a personas reales:** son roles.

**Por qué nadie.** FlexSim y AnyLogic tienen operarios animados, pero la fatiga y el aprendizaje visibles en el ritmo no los
encontramos (INFERENCIA, confianza media).

**Cómo.**
- Animación procedural sin esqueleto: 3 o 4 poses por estado, interpoladas.
- La velocidad de la animación sale del tiempo de servicio del tramo, así que **la fatiga se ve porque está en el modelo**, no como
  efecto.

### E13. Video, imagen y GIF con subtítulos, que se comparten solos

**Qué hace.** «Exportar el momento» genera en el navegador un clip de 10 a 30 s del plano del director:
- con subtítulos calculados («02:14 · la rampa 01 se llena · 1.300 paquetes dan otra vuelta»);
- con el marcador;
- con una marca discreta «Hecho con Andén» y el enlace a la escena.

En el teléfono se manda directo por WhatsApp con Web Share (88,3% del uso en AR). También exporta imagen para LinkedIn e informe PDF.

**Por qué nadie.** Grabar pantalla y editar es el camino de hoy (INFERENCIA). Un clip calculado, con subtítulos que son datos y
generado sin servidor, no lo encontramos.

**Cómo.**
- WebCodecs con mediabunny (MPL-2.0; 50 KB brotli, a demanda).
- Medido: 10 s en 2,2–2,4 s y 1,9 MB (§2.4).
- Es el **canal de crecimiento** de `mercado.md` (canal 10, «YouTube y videos cortos sin cara»): cada clip es un anuncio sin costo y sin
  cara.

### E14. La escena con sello: verificada en tu dispositivo

**Qué hace.** Cada escena muestra un sello chico: «**Verificada en este dispositivo**: la película que ves es la simulación del
modelo X, noche 2, motor 1.4.0». El dispositivo recalcula la traza y compara su huella con la del autor. Si no coincide (otro motor,
otro navegador con matemática distinta, o un modelo alterado), lo dice.

**Por qué nadie.** La reproducibilidad bit a bit entre dispositivos hay que construirla, porque JavaScript no fija `Math.log` ni `pow`
(HECHO medido, `tecnologia-web.md`). Ningún incumbente publica algo así sobre su animación (INFERENCIA).

**Cómo.**
- Matemática propia y azar por flujos.
- Hash de la traza en columnas.
- Es la cara visible del «comprobante» de `rigor.md`: sin cara del fundador, la confianza la da esto.

### E15. La escena incrustable

**Qué hace.** Un `<iframe>` pone la escena en un blog, un campus virtual (Moodle), Notion o una nota de prensa. Corre en el navegador
del lector.

**Por qué nadie.** Los visores de los incumbentes son aplicaciones o nubes propias (INFERENCIA).

**Cómo.**
- La ruta incrustable va **sin** aislamiento COOP/COEP. Si no, se rompe la inserción (HECHO, `tecnologia-web.md` §4.3).
- No usa memoria compartida: Workers con mensajes alcanzan para las réplicas.
- Es la táctica de «calculadoras insertables» del P2, llevada a la simulación.

### E16. El plano se levanta: de la foto, el PDF o el DXF a la escena

**Qué hace.** El usuario suelta una foto del plano, un PDF o un DXF y lo escala marcando dos puntos. Arriba de eso, la plantilla se
acomoda: la IA propone el layout como **fantasma** y el usuario lo acepta o lo descarta con un toque. Cuando acepta, **el plano se
levanta**: una transición de 2 s hace crecer el 2D a 3D, con las cintas y las rampas en su lugar.

**Por qué nadie.** Hoy, el plano de un depósito convertido en modelo validado es investigación. Hay trabajos sobre planos
residenciales, y la UNAM 2026 encontró errores de cotas superpuestas con ChatGPT y FlexSim (HECHO, `incumbentes.md`). El fantasma con
aceptar o descartar no lo encontramos (INFERENCIA).

**Cómo.**
- Parches JSON sobre el documento (`tecnologia-web.md` §7).
- La IA solo propone parches (`ia-nativa.md`).
- La transición es una interpolación de la cámara y de la altura de los objetos.

### E17. Accesible por diseño

**Qué hace.**
- **Narración por lector de pantalla:** una región `aria-live` narra los eventos del director («02:14, la rampa 01 se llenó»).
- **Paleta por estado** apta para daltonismo, con forma además de color.
- **Movimiento reducido** si el sistema lo pide.
- **Teclado completo.**
- **Sonido opcional y apagado por defecto:** un tono que sube con la ocupación del sorter y una señal cuando una rampa se llena. Ayuda
  en la reunión y a quien no ve bien la pantalla.

**Por qué nadie.** No encontramos accesibilidad documentada en el 3D de ningún incumbente (INFERENCIA; es una ausencia sin verificar).

**Cómo.** `aria-live` y `prefers-reduced-motion` son universales (HECHO, MDN BCD). El sonido sale de Web Audio. Es barato si se hace
desde el día uno, y caro si se agrega después (INFERENCIA de oficio).

### E18. Tu hub en la mesa del directorio (realidad aumentada), con regla de corte

**Qué hace.** «Ver en la mesa» pone el hub a escala sobre la mesa de la reunión, corriendo.

**Por qué nadie.** Los visores de realidad virtual de Dematic y Visual Components existen (HECHO), pero son de su equipo y para sus
clientes.

**Cómo y por qué después.**
- WebXR solo está en Chromium: 0% de soporte completo y 89,7% parcial en AR (HECHO). En iPhone haría falta exportar USDZ para AR Quick
  Look; three.js trae un exportador (conocimiento previo, a verificar).
- **Regla de corte:** se construye solo si en el corte 3 al menos 1 de cada 10 presentaciones en modo directorio se hace desde un
  teléfono o una tableta (dato de telemetría sin cookies).
- Explorar antes de descartar (`doctrina/08-formas-de-pensar.md`): es el tipo de cosa que se comparte sola en LinkedIn, pero no
  decide nada.

---

## 4. El modelo de simulación

### 4.1 Paradigmas bajo un solo calendario

| Paradigma | Para qué | Cómo (MEDIDO en la maqueta o propuesto en los informes) |
|---|---|---|
| **Eventos discretos** | Todo lo que pasa en un instante: llega un camión, termina una inducción, cae un paquete en una rampa | Montículo con desempate por secuencia y tiempo entero en ms. MEDIDO: ~100.000 eventos por noche en el hub 24k |
| **Islas de paso fijo** | Equipos con reloj propio: sorters de bandejas, carruseles | Solo laten mientras hay actividad (`motor-validacion.md`). En la maqueta, el sorter usa una **rueda de tiempos**: cada paquete se agenda para el paso en que su bandeja pasa por su rampa (O(1) por vuelta) |
| **Agentes** | Personas, autoelevadores, AMR, camiones con estado y reglas | Máquinas de estado con fatiga, pausas, ausentismo y reglas («la rampa más llena primero») |
| **Cinemática cerrada** | Cintas con acumulación, vehículos con perfil trapezoidal, reservas de tramos para no chocar | Tiempos calculados sin integrar (`tecnologia-web.md` §6). Sin motor de física |
| **Flujo agregado (tasa discreta)** | Zonas lejanas o masivas, donde el paquete individual no decide | Tasa por intervalo con cruces de umbral exactos (`motor-validacion.md` §2.4). Se ve como «río» en el zoom lejano (E11) |

**Una regla que viene de la experiencia:** cada paradigma tiene que poder **emitir tramos**. Si no, no se puede dibujar ni explicar.
Por eso el flujo agregado emite tramos por lote, y las personas, tramos por tarea.

### 4.2 Objetos de la biblioteca: mecanismo, aspecto y estados visibles

| Objeto | Mecanismo (lo que se simula) | Aspecto (lo que se ve) | Estados que se pintan |
|---|---|---|---|
| Camión y playa | Turno con desvío, cola en playa, papeleo | Camión que entra, espera, se vacía | En hora, atrasado, esperando andén |
| Andén y descarga | Personas por andén, ritmo por paquete, contrapresión de la cinta | Bultos que bajan a la cinta | Descargando, bloqueado por cinta llena |
| Cinta (con y sin acumulación) | Velocidad, paso, cola acumulada, unión y desvío | Bultos que avanzan y se apilan | Fluye, acumula, detenida |
| Inducción | Persona o robot, tiempo con fatiga, sincronía con la bandeja | Persona que levanta y apoya | Inducido, esperando bandeja, en pausa |
| Sorter de bandejas, cross belt o zapatas | Bandejas con paso, lectura, ventana de desvío, recirculación (MEDIDO en la maqueta) | Bandejas que giran, paquetes que bajan | Normal, dando vuelta (naranja), excepción (violeta) |
| Sorter de robots | Flota con recorridos y reservas | Robots en grilla | Cargado, vacío, esperando cruce |
| Rampa o salida | Capacidad, vaciado por persona | Pendiente que se llena | Verde, ámbar, rojo (llena) |
| Jaula, saca o pallet | Capacidad, cierre, olas | Contenedor que se llena y se cierra | Nivel, cerrado, cargado |
| Excepciones (NO-READ, dañado, sin destino) | Flujo propio con su gente | Mesa de excepciones | Pendiente, resuelto, reinducido |
| Estantería y ubicación | Ubicaciones con SKU y reposición | Racks con niveles, horneados como estáticos | Ocupación por color |
| Preparador | Recorrido por pasillos (recursos con capacidad), tiempo por línea | Persona con carro | Caminando, tomando, bloqueado en pasillo |
| Autoelevador, reach truck, AGV | Trapezoidal por eje, reservas de tramos | Vehículo con horquilla | Viaja, eleva, espera reserva |
| AS/RS y shuttle | Ciclos por cinemática según la lógica FEM | Transelevador | Ciclo simple o doble, en falla |
| Ruta de última milla | Servicio por tipo de parada, fallidas y re-entregas | Mapa con camionetas o motos | Entregado, fallido, vuelve al hub |

**El 3D no se modela a mano: se deriva del esquema.** Cada bloque declara su «aspecto»: geometría paramétrica (largo, ancho, altura,
paso, cantidad de niveles), puntos de anclaje y estados. Así:
- la IA arma un modelo y ya tiene su 3D;
- el usuario cambia el alto de un rack y el 3D cambia;
- no hace falta un modelador 3D en el equipo.

Se puede importar glTF para marca o equipos especiales (formato abierto, `incumbentes.md` §6.12).

### 4.3 Personas

Cada persona del modelo trae estos atributos:
- rol;
- turno y pausas;
- antigüedad, con curva de aprendizaje de Wright calibrada con Loske y Klumpp;
- fatiga desde la última pausa (Jaber, Givi y Neumann);
- ausentismo diario, con ancla en la EIL y en el tope de 5% de ADRHA;
- regla de asignación.

Productividad = base × aprendizaje × fatiga × condición (`realismo-logistico.md` §6). En pantalla, cada factor se ve: ritmo, pausas,
huecos y el temporario que acelera. Son roles, nunca personas reales.

### 4.4 Datos

- **Procedencia.** Cada parámetro viaja con su procedencia: valor, unidad, distribución, rango válido, fuente, fecha y tipo (como
  `apps/anden/js/referencias.js`). La escena lo muestra con la misma insignia de la v0: HECHO, ESTIMACIÓN o TU DATO.
- **Llegadas.** Hay dos curvas cada 15 minutos (pedidos y llegadas físicas), unidas por los cortes, y multiplicadores por evento (Hot
  Sale, CyberMonday).
- **Costos.** Salen de las calculadoras v0: costo laboral por convenio, costo por paquete clasificado, alquiler. La escena dice
  «$ por paquete» con intervalo.
- **Atributos al nacer.** Cada entidad sortea sus atributos al nacer (destino, NO-READ) desde su propio flujo, para que la pantalla
  dividida sea honesta (§2.5).

### 4.5 Nivel de realismo

| Exacto (mecanismo) | Aproximado (con supuesto marcado) | Fuera de alcance (lo decimos) |
|---|---|---|
| Bandejas con paso, recirculación, rampas que se llenan, contrapresión de cintas, colas FIFO, pausas, turnos, cortes | Fatiga y aprendizaje (curvas publicadas); servicio por parada en AMBA (sin dato local); recirculación real (sin dato publicado, sale del modelo) | Física de contacto (paquetes que se traban, caídas), PLC, sensores, robots de seis ejes |
| Cinemática de vehículos con aceleración y reservas | Congestión de personas en pasillos (recurso con capacidad, no fuerzas sociales) | Fotorrealismo, iluminación física, gemelo con sensores en tiempo real |
| Costos con índices argentinos fechados | Distribuciones ajustadas a datos del usuario cuando existen | Ruteo óptimo de flotas grandes (va como producto aparte en P5) |

### 4.6 Cómo el modelo se vuelve imagen (dirección de arte sin diseñador)

- **Estilo:**
  - «maqueta limpia»: geometría simple y biselada;
  - colores de material cálidos (cartón, gris de acero);
  - el color fuerte reservado para **estados** (rojo lleno, naranja vuelta, violeta excepción);
  - luz de cielo suave y oclusión ambiental horneada en lo estático.

  No es realismo de render. Es claridad de maqueta de arquitecto (INFERENCIA de diseño).
- **Movimiento:**
  - nada se teletransporta: toda entidad se mueve desde un tramo;
  - aceleraciones suaves;
  - la cámara nunca gira más de 30° por segundo;
  - las transiciones entre capas duran 200–400 ms.
- **Tipografía y números:** cifras tabulares, separador es-AR (`apps/anden/js/formato.js`), unidades siempre.
- **Control de calidad visual sin el fundador:**
  - capturas automáticas en 3 pisos × 3 tamaños × claro y oscuro;
  - comparación contra referencias aprobadas (regresión visual);
  - una revisión de Claude con lista de verificación: legibilidad a 360 px, contraste, estados distinguibles en escala de grises.

---

## 5. Arquitectura técnica

### 5.1 Principios

1. **Costo de servidor ~0 por espectador.** Calcula el dispositivo de quien mira. El servidor solo sirve archivos estáticos, firma
   licencias con una función mínima y guarda la galería pública.
2. **La traza es el contrato.** El motor no sabe que existe una pantalla, y las vistas no saben simular. Entre los dos viajan bloques
   de tramos en columnas, transferidos entre hilos: 8 ms por millón de eventos (HECHO medido, `tecnologia-web.md`).
3. **El motor va delante del cabezal.** Se simula en un Worker por bloques de tiempo; la vista consume y nunca espera, salvo un salto
   hacia adelante más allá de lo calculado, que dura milisegundos (MEDIDO §2.1).
4. **Pisos de dibujo con degradación elegante.** 3D, 2,5D y 2D comparten escena, estilo y reproductor (E10).
5. **El enlace es el primer lugar donde vive un modelo.** IndexedDB y la nube son copias. Esto además resuelve que Safari borre los
   datos a los 7 días sin uso (HECHO, `tecnologia-web.md` §8.2): el modelo sobrevive en el enlace que se mandó por WhatsApp.
6. **Lo pesado se carga a demanda.**
   - Núcleo del visor: 8,2 KB brotli (MEDIDO).
   - three.js: 108–171 KB brotli.
   - Video: 50 KB.
   - IA: solo si se usa.

### 5.2 Diagrama

```
                         ┌──────────────── ENLACE / QR ────────────────┐
                         │ #m=<modelo> | #t=<plantilla>&p=<parche>      │
                         │ &r=<receta: huella, motor, semilla, t, cámara>│
                         └───────────────┬──────────────────────────────┘
                                         ▼
 HILO DE LA INTERFAZ                                   WORKERS (sin DOM)
 ┌─────────────────────────────────────────┐          ┌─────────────────────────────────────┐
 │ escena/     enlace ⇄ documento + receta │─modelo──▶│ compilador/ esquema → tablas        │
 │ editor/     comandos → parches; fantasma│          │ motor/      eventos + islas de paso │
 │ reproductor/ reloj, tramos → posiciones │◀─tramos──│             + agentes + cinemática  │
 │ director/   eventos → planos y subtítulos│ (bloques │ traza/      columnas, huella        │
 │ vistas/     3D (three.js, a demanda)    │ columnares│ experimentos/ noches en paralelo,  │
 │             2,5D (Canvas, sprites)      │ transfer.)│             números comunes, A/B   │
 │             2D (Canvas)                 │          │ riesgo/     agregados de 100 noches │
 │ biografia/  índice por entidad, causas  │◀─────────│ explicador/ período activo,         │
 │ presentar/  modo directorio, cátedra    │          │             contrafactuales         │
 │ exportar/   video (WebCodecs), PDF, PNG │          └─────────────────────────────────────┘
 │ ia/ (opcional) narra y propone parches  │
 └──────────────┬──────────────────────────┘
                │ almacen/ IndexedDB (documento) + OPFS (trazas) · pwa/ service worker · licencia/ token Ed25519
                ▼
   Cloudflare Pages (estático) · función mínima (licencias, proxy de IA) · almacenamiento de objetos (galería pública)
```

### 5.3 Módulos y límites

| Módulo | Hace | Corre en | No puede |
|---|---|---|---|
| `escena/` | Codifica y decodifica enlace, QR, plantilla con parche y receta; verifica la huella | Interfaz | Mandar el `#` a un servidor |
| `compilador/` | Esquema a tablas tipadas; valida unidades e invariantes | Worker | Usar azar |
| `motor/` | Eventos, islas de paso fijo con rueda de tiempos, agentes, cinemática; emite tramos | Worker (y Node en pruebas) | Tocar el DOM, usar `Math.random` o la matemática nativa |
| `traza/` | Columnas, compresión, huella, índice por entidad | Worker → interfaz | Mandar objetos entre hilos |
| `experimentos/` y `riesgo/` | Noches en paralelo, números comunes, precisión objetivo, agregados para el mapa de riesgo | Workers | Agregar en orden de llegada (se agrega por índice) |
| `explicador/` | Causas de espera, período activo, contrafactuales | Worker | Inventar: solo devuelve números con su experimento |
| `reproductor/` | Reloj, posiciones desde tramos con fórmulas cerradas, filas por secuencia | Interfaz | Pedirle algo al motor por cuadro |
| `director/` | Elige planos y subtítulos desde eventos y explicaciones | Interfaz | Mostrar un subtítulo sin número de respaldo |
| `vistas/` | 3D, 2,5D y 2D con el mismo estilo; elige piso por presupuesto | Interfaz (2D y 2,5D también en OffscreenCanvas) | Mover algo que no esté en la traza |
| `biografia/` | Tarjeta de cualquier entidad con su historia y su causa | Interfaz | Mostrar datos personales: las personas son roles |
| `presentar/` | Modo directorio, cátedra, vista del presentador por BroadcastChannel | Interfaz | Depender de la red |
| `exportar/` | Video, imagen y PDF | Interfaz y Worker | Subir nada sin que el usuario lo pida |
| `editor/` | Comandos que producen parches; fantasma para propuestas de la IA | Interfaz | Escribir el documento por fuera de los comandos |
| `ia/` | Entrevista, narración y parches (ver `ia-nativa.md`) | Interfaz y función mínima | Producir un número o mover una entidad |

### 5.4 Presupuestos de experiencia

| Presupuesto | Meta | Base |
|---|---|---|
| Primera carga del visor de una escena, sin 3D | ≤ 120 KB brotli | Núcleo medido en 8,2 KB brotli; el resto es interfaz (ESTIMACIÓN) |
| Del toque en el enlace al primer cuadro, en un teléfono de gama media con 4G | ≤ 1,5 s | Cálculo de 28–42 ms medido en escritorio (×3–10 en teléfono, sin medir) más la red (HIPÓTESIS a medir) |
| Cuadro | ≤ 16,7 ms: reproductor ≤ 1 ms, dibujo ≤ 10 ms, interfaz ≤ 4 ms | MEDIDO: posiciones 0,1–0,2 ms; 2,5D 1,8 ms (6,8 ms con CPU 4×) |
| Deslizador, vista previa | ≤ 150 ms | Noche del hub 24k en ~0,2 s (MEDIDO); en modelos grandes, horizonte corto |
| Cien noches | ≤ 10 s, con progreso visible | ~7 s en 3 Workers (ESTIMACIÓN con §2.1) |
| Video de 10 s | ≤ 5 s | 2,2–2,4 s (MEDIDO) |
| Memoria del visor | ≤ 150 MB en el teléfono | Traza del hub 90k: 21 MB cruda (MEDIDO); a vigilar en depósitos grandes |

Cada presupuesto se vuelve una **prueba automática** que falla si se pasa (§8).

### 5.5 Motor y traza

Se toma lo que ya decidieron los frentes:
- núcleo en TypeScript con arreglos tipados (7–10 millones de eventos por segundo; WebAssembly solo si un teléfono no simula el día
  del hub modelo en menos de 1 s);
- matemática y azar propios (xoshiro128\*\* con saltos);
- tiempo entero y desempate fijo;
- dos niveles: bloques compilados y procesos a medida (`tecnologia-web.md`, `motor-validacion.md`).

Lo que agrega esta visión:
- **Tramos como formato de salida obligatorio.** Cada tramo trae entidad, tipo, recurso, dato auxiliar, inicio y fin. La maqueta
  emite ~8 tramos por paquete (198.000 en una noche de 24.000 paquetes) y pesa 1,3 MB comprimida (MEDIDO).
- **Tramos con fórmula.** Algunos tramos se dibujan con una fórmula en vez de una lista de posiciones:
  - **bandeja:** posición = (bandeja + t ÷ paso) mod bandejas;
  - **fila FIFO:** lugar = secuencia − salidas hasta t;
  - **cinta:** interpolación por tramo de polilínea.

  Así el reproductor calcula ~1.860 entidades en 0,1–0,2 ms por cuadro (MEDIDO).
- **Rueda de tiempos para equipos con reloj.** Evita recorrer todas las rampas en cada paso del sorter. En el hub 90k serían 139
  rampas × ~161.000 pasos ≈ 22 millones de revisiones por noche; con la rueda, cada paquete se revisa una vez por vuelta (INFERENCIA
  por cuenta).
- **Detector de momentos.** Lee la traza y marca eventos para la línea de tiempo y el director.

### 5.6 Render

- **3D (three.js r186, `WebGPURenderer` con respaldo WebGL 2):**
  - instancias para paquetes, bandejas, rampas y jaulas;
  - estáticos fusionados;
  - oclusión ambiental horneada en un Worker al cargar la escena;
  - sin sombras dinámicas por defecto;
  - resolución dinámica: baja a 0,5 si el cuadro pasa de 14 ms.
- **2,5D (Canvas):**
  - proyección ortográfica con giro de 24° y elevación de 38° (la de la maqueta);
  - fondo horneado una vez, ordenado por profundidad;
  - sprites por estado y tamaño;
  - orden por profundidad por cuadro;
  - corre en OffscreenCanvas dentro de un Worker cuando conviene (99,3% del uso en AR por versión, `tecnologia-web.md`).
- **2D:** el plano de ingeniería y el del editor. Es el piso de todo.
- **Elección del piso:**
  1. si hay GPU y el cuadro 3D medido en el primer segundo es ≤ 12 ms, va 3D;
  2. si no, 2,5D si ≤ 10 ms;
  3. si no, 2D.

  El usuario puede forzar el piso, y la elección se recuerda por dispositivo.
- **Nivel de detalle:** por píxeles por metro (E11).

### 5.7 El enlace

| Forma | Cuándo | Tamaño (MEDIDO) |
|---|---|---|
| `#m=` modelo completo | Modelo propio de tamaño pyme | ~3.800 caracteres para el hub de 60 rampas |
| `#t=plantilla@versión&p=parche` | Modelo que parte de una plantilla publicada | ~260 caracteres; entra en QR versión 11 |
| `#e=<id>` | Escena publicada en la galería (modelos grandes o con vista previa) | Corto; el modelo está en almacenamiento de objetos |
| `&r=` receta | Siempre | ~130 caracteres |

- **Privacidad.** El `#` no llega al servidor. Quien recibe el enlace recibe el modelo; por eso hay herramienta de **anonimizar**
  (nombres, volúmenes, costos escalados) antes de compartir (`mercado.md` §11). Lo privado de verdad (Pro) se comparte por la galería
  con acceso.
- **Versionado.** La receta dice la versión del motor. Las plantillas son inmutables por versión. Si el motor cambió, la escena se
  recalcula con la versión pedida si sigue publicada, o avisa: «esta escena se hizo con el motor 1.2; con el 1.4 cambia la hora de fin
  en +1 min».

### 5.8 Persistencia y uso sin conexión

- IndexedDB guarda un documento por versión más la cola de parches (62 ms para 100.000 objetos; HECHO medido, `tecnologia-web.md`).
- OPFS guarda las trazas grandes.
- El archivo `.anden` (zip abierto) sirve para exportar.
- La PWA con service worker deja el modo directorio y el aula funcionando sin red.
- Se pide `persist()` y se ofrece instalar la app.

### 5.9 Dónde entra la IA en la experiencia

Va fuera del lazo de cuadro, siempre (`ia-nativa.md`):
- **Narradora.** Mejora la redacción de los subtítulos del director y de las biografías. Cada número sale de un experimento.
- **Entrevistadora y arquitecta.** Propone el modelo y sus cambios como fantasma (E16).
- **Guionista del modo directorio.** Propone el orden de los actos.

Sin conexión o sin créditos, todo funciona con plantillas de texto.

Costo: USD 0,005–0,5 por entrevista (ESTIMACIÓN de `frontera-ia.md` con precios en caché del 06-10-2026; re-verificar). La película, el
director y el video no usan IA: el costo marginal es cero.

**Andén para agentes, con escena.** El servidor MCP propio (`ia-nativa.md` C15) devuelve, además de los números, **un enlace a la escena
viva**. Así, la respuesta de un agente («necesitás 5 inductores») llega con la película que lo muestra. Es un canal de distribución sin
costo de lenguaje para Andén (`mercado.md` §9).

### 5.10 Extensibilidad

- **Bloques con aspecto declarado.** Geometría paramétrica, estados y anclajes; glTF opcional.
- **Vistas como complemento.** Una vista nueva (mapa de última milla, diagrama de Gantt de andenes) se suscribe al reproductor y lee
  tramos.
- **Plantillas de autor.** Un consultor publica una plantilla con su guion de presentación (`mercado.md` §8, comisión).
- **Formato abierto.** JSON con esquema publicado, traza documentada y exportación glTF. «Tu modelo es tuyo» (`incumbentes.md` §6.12).

### 5.11 Qué corre dónde y cuánto cuesta

| Pieza | Dónde | Costo para Andén |
|---|---|---|
| Motor, experimentos, reproductor, vistas, video | Dispositivo del usuario | 0 |
| Sitio y plantillas publicadas | Cloudflare Pages: GitHub Pages prohíbe usos comerciales (HECHO) | 0 en el plan gratis (500 compilaciones por mes, 20.000 archivos) |
| Licencia | Función en Cloudflare Workers con token Ed25519 verificable sin conexión | 0 en el plan gratis (100.000 pedidos por día) |
| Galería pública e imágenes de vista previa | Almacenamiento de objetos | **A verificar** (precio no consultado en esta sesión) |
| IA | Clave del usuario, agente del usuario por MCP, o créditos incluidos en Pro | USD 0,005–0,5 por entrevista (ESTIMACIÓN) |

---

## 6. La experiencia

### 6.1 Minuto 0: alguien abre un enlace en el teléfono

1. Llega por WhatsApp: «Mirá cómo se traba la rampa de la Ruta 01 a las 2 de la mañana», con un clip de 10 s y el enlace.
2. Lo toca. En menos de un segundo y medio (meta, §5.4) la noche ya está corriendo en 2,5D o 3D, en el instante que eligió el autor.
   Arriba hay una sola línea: «Costo por paquete $ X (± Y) · al corte: 100% · confianza: verde». Abajo, la línea de tiempo con sus
   marcas. Un subtítulo dice qué está pasando. El sello dice «verificada en este dispositivo».
3. Toca la rampa roja y aparece su biografía.
4. Toca «¿Y si…?»: el autor dejó dos perillas. Mueve «personas en la rampa 01: 1 → 2». La película se rehace, primero provisoria y a
   los segundos confirmada con intervalo, en pantalla dividida.
5. Toca «Ver las 100 noches» y la rampa queda pintada con su probabilidad de llenarse.
6. Toca «Hacer mi copia». Si es una escena pública, la duplica y entra al editor con la plantilla. Si no tiene cuenta, la copia vive
   en su navegador y en un enlace nuevo.

**Medición de esta etapa:** porcentaje de enlaces abiertos en teléfono, porcentaje de quienes tocan algo en los primeros 30 s y
porcentaje que duplica. Todo con contador sin cookies, como en la v0.

### 6.2 Minutos 1 a 10: el autor arma su primera escena

Entrada por una de tres puertas, todas en la misma pantalla:
1. **Plantillas como películas.** No es una lista de nombres: son **miniaturas vivas** (la película chica de cada plantilla, en 2D, a
   ×600) con el nombre del problema: «¿Cuánta gente para el Hot Sale?», «¿Llego al corte de Flex?», «¿Me alcanzan los andenes?».
2. **«Contame tu operación»** (texto, voz, foto, PDF o planilla), con la entrevista de `ia-nativa.md`. Mientras pregunta, **la escena
   se va armando a la vista**: cada respuesta suma una pieza al plano. Es la forma visual de mostrar que entendió.
3. **Desde las calculadoras v0.** «Ver esto en movimiento» lleva los números de la calculadora 4 (costo por paquete clasificado) a la
   plantilla de hub.

Termina con **la película de su noche**, con los supuestos marcados («estos 6 valores son de referencia, no tuyos») y el botón
«medilo» (cronómetro en el teléfono, `ia-nativa.md` C19).

### 6.3 La primera hora: decidir

- **Escenarios.** Duplicar, cambiar, comparar en pantalla dividida con la misma suerte.
- **Riesgo.** Ver las cien noches; elegir qué noche mostrar (la mediana, la peor) y que la elección quede etiquetada.
- **Explicación.** Biografías y contrafactuales.
- **Salida.** Video de 10 a 30 s, imagen, PDF y enlace.
- **Presentación.** Guardar escenas para el modo directorio.

### 6.4 La reunión: modo directorio (guion de siete minutos)

| Minuto | Pantalla | Qué hace el presentador |
|---|---|---|
| 0:00–1:00 | «Así es una noche»: plano general a ×600, marcador, la línea de tiempo con sus marcas | Nada: la película habla |
| 1:00–3:00 | «Dónde se traba»: el director va a la rampa, biografía, la causa en una frase | Toca la rampa para mostrar que es real |
| 3:00–5:00 | «Qué proponemos»: pantalla dividida A/B con la misma suerte, costo por paquete con intervalo, probabilidad de llegar al corte | Mueve el deslizador frente a todos |
| 5:00–7:00 | «Cuánto confiar»: las cien noches, la peor noche, el sello, los supuestos que más pesan y qué medir | Contesta preguntas con las perillas |

Funciona sin red y con la pantalla siempre encendida. La vista del presentador va en la notebook y la escena, en el proyector. La
escena queda después como enlace para quien no estuvo.

### 6.5 La cátedra: una clase de 90 minutos

1. **0–15 min.** El docente proyecta la plantilla «Aula: colas»: una fila M/M/c animada con Little en vivo.
2. **15–40 min.** Los alumnos escanean el QR, cada uno con su semilla. «Predecí la espera con 3 servidores» → corren → comparan con
   Erlang C.
3. **40–70 min.** Ejercicio con la plantilla de hub: «con 4 inductores, ¿a qué hora termina tu noche? ¿cuántos hacen falta para
   terminar antes de las 05:00 en 9 de cada 10 noches?». Entregan una receta de 130 caracteres por el campus virtual o por mail.
4. **70–90 min.** El docente pega las recetas en Andén, que las recalcula y las corrige sin servidor. Se muestra el experimento de
   cobertura de Law: «por qué una sola corrida miente».

Los alumnos se llevan su escena al portafolio o al CV (`mercado.md` §7: «armá el depósito de tu TP y mostralo en tu CV»).

### 6.6 El experto

Un interruptor, **modo ingeniero**, abre todo lo que esta visión esconde:
- el documento del modelo como texto con validación en vivo, al lado de la escena;
- procesos en TypeScript;
- el cuaderno de experimentos;
- la traza exportable en CSV o en columnas;
- puntos de parada con condición: la escena se congela cuando pasa algo y se avanza evento por evento;
- la estadística a la vista (`rigor.md` §5.3).

El experto no pierde nada y gana la reunión: su estudio sale como escena viva y no como video (INFERENCIA).

### 6.7 Plantillas iniciales

Cada plantilla trae su película de presentación, su «momento» (lo que el director muestra primero), sus fuentes y su página de
validación. Las calibraciones son públicas, de `realismo-logistico.md`. Los nombres son genéricos: las empresas aparecen solo como
fuente citada, nunca como marca de la plantilla.

| # | Plantilla | Qué decide | El momento de la película | Calibración pública | Corte |
|---|---|---|---|---|---|
| 1 | **Hub de clasificación con sorter de bandejas, turno noche** (la maqueta llevada a producto) | Inductores, gente de rampa, salidas para rutas grandes, temporarios | La rampa de la ruta más cargada se llena y los paquetes dan vueltas | Inducción ~1.600/h sostenible (oskon); capacidad por paso; sorters argentinos de 8.000–18.000/h (prensa 2024–2026) | 1 |
| 2 | **Hub con sorter de robots** | Robots, puestos de inducción, salidas | Robots esperando en un cruce mientras la inducción sobra | Correo Argentino Monte Grande: 9.000/h, 240 robots, 13 puestos, 130 salidas (HECHO) | 2 |
| 3 | **Nodo de última milla para Flex** | ¿Llego al corte? Rutas por ola, re-entregas | La ola de las 13:00 sale incompleta y lo fallido vuelve mañana | Cumplimiento en el día > 90%; cortes de 13 a 17 h [extracto]; servicio por parada (solo estadísticas de Amazon 2018, CC BY-NC) | 2 |
| 4 | **Hot Sale con temporarios que aprenden** | Cuántos temporarios y desde cuándo entrenarlos | El temporario rinde la mitad el lunes y casi como los de planta el jueves | Loske y Klumpp (0,46 → 0,88); hora pico 13–14 h (Hot Sale 2026); ×2,5 de capacidad en picos (Andreani, prensa) | 1 (como escenario de la 1) |
| 5 | **Cross-dock con playa y turnos de camiones** | Andenes, citas, granel o paletizado | La playa se llena porque un camión a granel ocupa el andén 2 horas | 62 contra 142 min de descarga (Supervalu, HECHO); falta el dato argentino | 2 |
| 6 | **Depósito pyme de e-commerce** | Picking por zona, ola o lote; slotting; reposición | Dos preparadores se traban en el mismo pasillo; la reposición llega tarde | WERC 2025 (≥ 70 líneas por persona-hora); recorrido ≈ 50%; flow rack −4,6% de picking y +38,65% de reposición | 3 |
| 7 | **Comparador neutral de automatización** | Manual, AMR, AutoStore o shuttle con la misma demanda | Cuatro depósitos en pantalla de cuatro, con la misma suerte | GEODIS/Locus 65 → 98 u/h; AutoStore ≈ 300 picks/h por puerto; ciclos FEM | 4 |
| 8 | **Aula: colas y Little** | Enseñar | La fila crece al 90% de ocupación y explota al 100% | M/M/c, Erlang C, Little; batería de `motor-validacion.md` | 1 |
| 9 | **Andén Ciudad: recolección** | Camiones y recorridos | El camión 3 vuelve lleno antes de terminar su recorrido | Bitácora del 28-09-2026 | 5 |

### 6.8 Diseño visual y de movimiento: reglas

1. El color fuerte se reserva para estados. La pantalla en reposo es tranquila, para que el problema se vea solo.
2. Todo número va con unidad y con banda: nunca «$ 336 por paquete» solo, siempre con su «± $ 18» (cifras de ejemplo).
3. La cámara del director nunca marea: velocidad angular limitada; con movimiento reducido, cortes en vez de travellings.
4. **360 px primero:** el teléfono vertical es el caso principal del lector. El horizontal y el escritorio son mejoras.
5. Claro y oscuro con la misma paleta de estados.
6. Ningún texto sobre la escena tapa el problema: los subtítulos van en una franja fija.
7. Español rioplatense, sin jerga: «da otra vuelta», no «recircula», en el modo lector. En el modo ingeniero se usa el término técnico.

---

## 7. Rigor: validación, estadística, experimentación y optimización

Esta visión no inventa rigor: toma el de `rigor.md` y `motor-validacion.md` y lo **pone en la pantalla**.

### 7.1 La película no miente

- **Toda película dice qué noche es:** «noche 2 de 100: la peor en recirculación», «la mediana», «tu noche real del 14-10».
- **Ningún indicador se muestra sin banda,** y nunca se presenta una sola corrida como resultado. Law (WSC 2023) muestra que un intervalo
  calculado con una sola corrida cubre 7,2% y no 95% (HECHO). `motor-validacion.md` lo reprodujo: 8,4%.
- **El sello de verificación** (E14) y la versión del motor van en cada escena.
- **La pantalla dividida usa siempre la misma suerte** (§2.5). Si la comparación necesita más noches, la escena lo dice antes de que el
  lector concluya.

### 7.2 Verificación del motor y de cada plantilla

- **«Andén Verificado».** Es la batería de `motor-validacion.md`: 59 verificaciones exigibles con valor analítico, más los casos
  publicados de Law. Se publica como página y corre en integración continua.
- **Cada plantilla tiene su página de validación:**
  - controles de cordura (fórmula de capacidad, Erlang C por estación, ley de Little);
  - comparación con sus calibraciones públicas.
- **Controles de cada modelo antes de mostrar la película** (`frontera-ia.md` §4.3): balance de flujo, Little, utilización < 1,
  repetibilidad. **Si uno falla, la escena no se muestra como resultado**: se muestra con una franja «modelo con errores» y el error
  señalado sobre el plano.

### 7.3 Estadística por defecto, dibujada

Lo que define `rigor.md`, dibujado:

| Qué define `rigor.md` | Cómo se ve |
|---|---|
| Réplicas hasta precisión objetivo | La banda se afina mientras llegan noches |
| Calentamiento calculado sobre el promedio de réplicas, con el gráfico de Welch | Visible en modo ingeniero |
| Números comunes | Visibles en la pantalla dividida |
| P90 y probabilidades | Se leen como «9 de cada 10 noches» |
| Selección del mejor de Kim y Nelson | Se ve como el «ganador» del torneo |
| Aviso de costo antes de correr | «Al 90% de ocupación hacen falta muchas noches para ±1%», con la ley de Whitt verificada en `motor-validacion.md` |

### 7.4 Experimentación visual

- **Torneo.** Hasta 4 candidatos en pantalla de cuatro, con la misma suerte. Los que quedan atrás se apagan a medida que la estadística
  los descarta, con Kim y Nelson y zona de indiferencia en pesos.
- **Qué perilla mueve más.** Un gráfico de tornado sobre los supuestos (sensibilidad) que dice qué conviene medir. En la escena, el
  supuesto que más pesa titila sobre su objeto.
- **Diseño de experimentos.** Factoriales y NOLH en modo ingeniero (`ia-nativa.md`, `rigor.md`).

### 7.5 Optimización

- **Reglas evolucionadas** con el simulador como evaluador (patrón FM Logistic con AlphaEvolve, +10,4% autoinformado; HECHO en
  `frontera-ia.md`). La salida es una regla legible: «la persona de rampa va primero a la rampa que se llena antes, no a la más llena».
  Se muestra en pantalla dividida contra la regla actual.
- **Dotación con riesgo:** «con 5 puestos terminás antes del corte 97 de cada 100 días; con 4, 84». Son números del modelo de
  juguete de `ia-nativa.md` §2, citados como ejemplo de formato.

### 7.6 Validación contra la realidad

Cuando el usuario sube su exportación del WMS o su planilla de la noche real, la escena superpone **su noche real** (puntos) sobre **la
banda de las cien noches simuladas**. Si la real cae afuera de la banda más de lo esperable, el modelo no está calibrado, y Andén lo dice
y propone qué medir (`rigor.md`, puntaje de validez; calibración inversa de `frontera-ia.md` §2).

---

## 8. Roadmap en cortes verticales

**Fechas y método.** Las fechas son ESTIMACIÓN. Base:
- las calculadoras v0 salieron en una sesión;
- la maqueta de esta visión (motor del hub con mecanismo, reproductor, tres vistas, video, enlace y banco) salió en otra;
- `motor-validacion.md` §9 estima el motor de producción en 3–4 semanas de trabajo de Claude.

**Acuerdo con P2.** El plan adelanta el simulador respecto del gantt de P2 («Contame tu operación» v1 en abr–jul 2027), como proponen
las otras dos visiones con Claude Max. No cambia el corte de P2 de sep-2027 (500 usuarios por mes o una cátedra). La síntesis tiene que
reconciliar las fechas de las tres visiones.

**Cómo prueba Claude sin el fundador.** El fundador pidió que Claude pruebe la experiencia solo e itere. Todo corte se prueba así:
- **Pruebas de presupuesto:** tiempo de cuadro, primer cuadro, deslizador y video, en Chromium con la CPU frenada 4× y 6× por CDP.
- **Huellas** en Chromium, Firefox y WebKit (Playwright los instala).
- **Regresión visual por capturas:** 3 pisos × 360 px y 1280 px × claro y oscuro.
- **Sesiones sintéticas:** scripts que abren un enlace, tocan, mueven perillas, presentan y exportan, y verifican que cada paso deje
  la pantalla esperada.
- **Revisión de Claude con lista de verificación:** legibilidad, jerarquía y si se entiende en 5 segundos qué está pasando.
- **La batería del motor.**

### Corte 0 · Hecho (17-10-2026)

- La maqueta medida de esta visión (`experiencia-medicion/`).
- El motor de referencia y su batería (`medicion-motor/`).
- Las calculadoras v0 (`apps/anden/`).

### Corte 1 · «La noche del hub» (nov-2026 → feb-2027)

**Qué entra, de punta a punta:**
- **Motor de producción** con traza de tramos, matemática y azar propios, «Andén Verificado» en integración continua, rueda de tiempos
  y detector de momentos.
- **Plantilla 1:** hub de clasificación con sorter de bandejas, con el escenario de temporarios de Hot Sale. Datos públicos y supuestos
  marcados.
- **La película** (E2) con línea de tiempo y marcas, y **el director v1** (E3) con 4 tipos de plano: general, fila, rampa llena,
  paquete que pierde el corte.
- **Biografías** (E4) de paquetes, rampas y personas, con la causa de cada espera.
- **Cien noches** (E5) con mapa de riesgo y selector de noche.
- **Deslizador** (E6) y **pantalla dividida con la misma suerte** (E7).
- **Enlace y QR** (E1) y **sello** (E14).
- **Tres pisos de dibujo** (E10), con 3D básico con instancias.
- **Video** (E13) y Web Share.
- **Modo directorio v1** (E8): 3 actos, pantalla completa, Wake Lock, vista del presentador.
- **Plantilla Aula de colas** (E9 v1) con Little en vivo y semilla por alumno.
- **PWA**, accesibilidad básica (E17) y español.

**Esfuerzo (ESTIMACIÓN):** 15–25 sesiones largas de Claude. Método: el motor de producción son 3–4 semanas según
`motor-validacion.md` §9, y la película, el director, las vistas, el enlace y el modo directorio parten de la maqueta de hoy, que salió
en una sesión.

**Orden de recorte si se atrasa** (lo último de la lista se cae primero):
1. motor verificado + plantilla 1 + película + biografías + enlace;
2. cien noches y pantalla dividida;
3. 2,5D y 2D;
4. modo directorio;
5. video;
6. 3D;
7. aula.

Nunca se recorta la etiqueta de qué noche es ni la banda de los números.

**Por qué ya es espectacular y profundo, y no un MVP pobre (INFERENCIA):**
- El hub tiene el mecanismo que una planilla no puede tener: bandejas, rampas que se llenan, contrapresión y personas con fatiga.
- La primera pantalla ya es una película que se puede tocar, comparar y presentar.
- Cada número sale con su banda y su sello.
- La maqueta de hoy demuestra que entra en el presupuesto: noche en 0,2 s y 2,5D en 1,8 ms.

**Cómo lo prueba Claude:**
- Todo lo de arriba.
- Además, el «examen de 5 segundos»: capturas de la primera pantalla de 10 escenas y una revisión de si se entiende qué pasa.
- El presupuesto de primera carga.
- El enlace roto o adulterado, que tiene que avisar.

**Qué necesita del fundador:**
- Aprobar la publicación con la marca (regla 8 de `CLAUDE.md`).
- **Una revisión de 1 hora de la plantilla del hub**, con conocimiento general: «¿esto se parece a un hub?». Antes conviene la consulta
  legal de 1 hora prevista en P2 si va a aportar detalle de dominio (riesgos).
- Opcional, si quiere: mandarle un enlace a un colega.

**Terminado cuando:**
- 59 de 59 en la batería y las huellas iguales en 3 motores;
- cuadro ≤ 16,7 ms con la CPU a 4× en el piso elegido;
- primer cuadro ≤ 1,5 s simulado con red 4G de DevTools;
- video de 10 s en ≤ 5 s;
- 10 escenas aprobadas en el examen de 5 segundos.

### Corte 2 · «Tu operación, en escena» (mar → may 2027)

**Qué entra:**
- Editor con imantado y parches (`tecnologia-web.md` §7).
- Plano de fondo y «el plano se levanta» (E16).
- «Contame tu operación» con la escena que se arma mientras pregunta (`ia-nativa.md`, corte 2 de esa visión).
- Plantillas 2, 3 y 5: robots, Flex y cross-dock.
- Zoom semántico con flujos (E11).
- Personas con poses (E12).
- Importar planilla.
- Galería pública con vista previa (E1).
- Escena incrustable (E15).

**Cómo lo prueba Claude:**
- Entrevistados sintéticos de `ia-nativa.md`.
- Planos de prueba (fotos y PDF sintéticos).
- Presupuestos con modelos de 3 tamaños.

**Del fundador:** nada obligatorio.

### Corte 3 · «La reunión y el aula» (jun → sep 2027; coincide con v1 y Pro de P2)

**Qué entra:**
- Modo directorio completo: guion, marca del consultor, notas.
- Modo cátedra completo: ejercicios, corrección por receta, panel del docente que abre las recetas sin servidor.
- Plantilla 6 (depósito pyme).
- Torneo (§7.4).
- Validación contra la noche real (§7.6).
- Plan Pro: privacidad, galería privada, video sin marca.
- Inglés preparado.

**Del fundador:** presentar Andén Aula a 2 o 3 docentes de su red, con su OK (P2). Puede ser solo mandar el QR de la clase de ejemplo.

**Corte de esta visión:** si a los 3 meses del lanzamiento menos del 10% de las escenas se abre en otro dispositivo que el del autor, se
rediseña la escena compartida antes de sumar funciones (criterio de `mercado.md` §10).

### Corte 4 · «La escena que avisa» (oct → dic 2027)

- **Pronóstico de la noche:** con la planilla de camiones de mañana, la escena de esta noche está lista a las 18:00. Quien la abre ve
  dónde se va a trabar.
- Recalibración semanal.
- Plantilla 7 (comparador de automatización).
- Arena de desafíos con tabla verificada por receta (`mercado.md` §6).
- AR (E18) **si pasó su regla de corte**.

### Corte 5 · «El mundo» (2028)

- Inglés y portugués.
- Mapa de última milla en 3D sobre la ciudad.
- Andén Ciudad.
- Mil noches con WebGPU si las mediciones lo justifican.
- WebAssembly para el núcleo si un teléfono de gama media no simula el día del hub en menos de 1 s (regla de `tecnologia-web.md`).

---

## 9. Riesgos y cómo se mitigan

| Riesgo | Señal temprana | Mitigación |
|---|---|---|
| **Espectáculo sin sustancia:** una película linda que convence de algo falso | Escenas con «modelo con errores» que se comparten igual; lectores que toman una noche como «la» noche | La traza es la única fuente visual (principio 1); controles del modelo antes de mostrar; etiqueta de noche obligatoria; las cien noches a un toque; sello |
| **Teléfonos de gama baja más lentos que lo supuesto** | Presupuestos rotos en los 3 teléfonos de prueba | Tres pisos y elección automática; nivel de detalle; horizonte corto en la vista previa; WebAssembly con regla de corte. Medir en dispositivos reales en el corte 1 (§2.7) |
| **3D feo o genérico:** sin diseñador en el equipo | El examen de 5 segundos falla; las capturas parecen de 2005 | Estilo «maqueta» simple y consistente, derivado del esquema; regresión visual; paleta de estados; luz y oclusión horneadas; la 2,5D como piso que ya se ve bien (captura medida) |
| **Enlaces que crecen** con modelos grandes | Enlaces de más de 8.000 caracteres | Plantilla con parche (264 caracteres medidos); galería con `#e=<id>`; QR solo para plantilla con parche o receta |
| **Privacidad:** el enlace lleva el modelo | Un usuario comparte volúmenes o costos reales sin querer | Aviso al compartir; anonimizador; Pro con galería privada; nada de datos personales (las personas son roles) |
| **H.264 no disponible** para el video en algunos navegadores | Fallas de exportación medidas por telemetría | WebM con VP9 de respaldo (MEDIDO); GIF corto; medir H.264 en Chrome y Safari reales en el corte 1 |
| **Safari borra los datos** a los 7 días sin uso | Usuarios de iPhone que pierden modelos | El enlace como primer lugar de vida del modelo; `persist()`; instalar la app; exportar `.anden` |
| **Copia de los incumbentes:** AnyLogic Online suma 3D web y compartir | Anuncios de AnyLogic, FlexSim o Autodesk | Velocidad, español, verticales argentinas, gratis sin tope público, determinismo verificable, modo directorio y cátedra; formato abierto |
| **Dispersión de alcance:** AR, sonido, ciudades… | Cortes que se atrasan por funciones de vidriera | Cada capacidad «vidriera» tiene regla de corte (E18); el corte 1 se cierra con sus criterios medibles antes de sumar |
| **Mareo y accesibilidad** | Quejas o abandono en la película | Movimiento reducido, cámara con velocidad limitada, narración `aria-live`, paleta para daltonismo |
| **Propiedad intelectual del empleador del fundador** | La plantilla de hub se parece demasiado a una operación concreta | Solo datos públicos citados y supuestos genéricos; revisión del fundador limitada a conocimiento general; consulta legal de 1 hora antes de aportar detalle de última milla (P2 › riesgos) |
| **Marcas en plantillas** | Una plantilla con nombre de empresa | Nombres genéricos («hub con sorter de robots»); las empresas solo como fuente citada |
| **Costo de la galería pública** | Factura de almacenamiento | Límite por escena; las escenas chicas viven en el enlace; verificar precios del almacenamiento antes de abrir la galería |

---

## 10. Qué tendría que ser cierto, métricas y cortes

**Qué tendría que ser cierto (HIPÓTESIS, cada una con cómo se valida):**
1. **Un teléfono de gama media muestra la noche del hub a 60 cuadros por segundo en el piso 2,5D.** Se valida con el banco de
   `experiencia-medicion/` en 3 teléfonos Android y 1 iPhone durante el corte 1.
2. **Quien recibe el enlace lo toca.** Más del 30% de los que abren una escena tocan algo en los primeros 30 s. Se mide con contador
   sin cookies.
3. **La escena viaja.** Más del 10% de las escenas se abre en otro dispositivo (criterio de `mercado.md`).
4. **El modo directorio se usa.** Al menos 1 de cada 20 modeladores activos presenta en el trimestre.
5. **Una cátedra lo adopta** (corte de P2, sep-2027).

**Métricas de experiencia** (además de la norte de `mercado.md`, «decisiones compartidas por semana»):
- tiempo hasta el primer cuadro (mediana y P90 por tipo de dispositivo);
- cuadros que superan el presupuesto;
- escenas abiertas por escena creada;
- toques por apertura;
- videos exportados;
- presentaciones iniciadas;
- recetas de alumnos corregidas.

**Cortes de esta visión:**
- Si en el corte 1 el primer cuadro en un teléfono de gama media pasa de 3 s, o el 2,5D no llega a 30 cuadros por segundo, se pospone
  el 3D por defecto y se invierte en el piso 2,5D y en WebAssembly.
- Si en el corte 3 menos del 10% de las escenas viaja, se rediseña la escena compartida antes de sumar plantillas.
- AR, sonido y mapa 3D de ciudad solo con su regla de corte cumplida.

---

## 11. Encaje con las otras visiones y con la cartera

**Las tres visiones son capas del mismo producto (INFERENCIA, confianza alta):**
- **`rigor.md`** pone el motor, la batería, el comprobante y la estadística.
- **`ia-nativa.md`** pone el ingeniero que pregunta, arma y explica.
- **Esta** pone la escena, que es donde se ve todo eso y por donde entra la gente.

**Qué agrega esta visión al núcleo común:**
- la traza de tramos como contrato obligatorio;
- el reproductor con fórmulas cerradas;
- el director;
- el enlace y el QR;
- los tres pisos de dibujo;
- el video;
- los modos directorio y cátedra.

Ninguna pieza le pide nada distinto al motor de `rigor.md`: le pide emitir tramos y que la huella sea estable.

**En la cartera:**
- **Distribución sin vender.** Cada escena compartida, cada clip y cada QR en una cátedra venden por el fundador (`CLAUDE.md`,
  DEC-2026-09-26-5).
- **Infraestructura compartida.** El reproductor de tramos y los pisos de dibujo podrían servir a la línea de juegos de P6 (INFERENCIA;
  no está decidido y los juegos tienen su propio motor). Lo que sí está previsto en P6 es la promoción cruzada de Hub Rush y de la
  campaña de última milla de Hub Nocturno con Andén en cátedras.
- **Cero servidores.** Respeta la regla del holding del 06-10-2026: costo mínimo de servidores y crecer sin rehacer.

---

## Fuentes

**Mediciones propias de esta visión (17-10-2026):** `oportunidades/proyectos/anden/visiones/experiencia-medicion/`. Ahí están `hub.mjs`,
`reproductor.mjs`, `vistas.mjs`, `pelicula.mjs`, `noches.mjs`, `ab.mjs`, `enlace.mjs`, `banco.html`, `worker-hub.mjs`, `correr.cjs`,
los resultados en JSON (`resultados-*.json`), `modelo-ejemplo.json` y las capturas `captura-2d.png`, `captura-iso.png` y
`captura-3d.png`. Instrucciones en su README.

**Informes de investigación del 17-10-2026** (con sus fuentes adentro), en `conocimiento/anden-simulador-2026-10/`: `incumbentes.md`,
`frontera-ia.md`, `tecnologia-web.md`, `realismo-logistico.md`, `motor-validacion.md` y `mercado.md`, más sus carpetas de medición.
**Visiones hermanas:** `oportunidades/proyectos/anden/visiones/rigor.md` e `ia-nativa.md`.

**Abiertas directamente en esta visión (consultadas el 17-10-2026):**
- Chromium, «URL display guidelines» (límite de 2 MB):
  https://chromium.googlesource.com/chromium/src/+/main/docs/security/url_display_guidelines/url_display_guidelines.md
- Wikipedia, «QR code» (capacidad de la versión 40-L: 2.953 bytes): https://en.wikipedia.org/wiki/QR_code
- Chrome DevTools, «Throttling» (presets calibrados de CPU; página actualizada el 16-04-2024):
  https://developer.chrome.com/docs/devtools/settings/throttling
- Ayuda de FlexSim 2027 (solo la portada; no lista herramientas de presentación): https://help.autodesk.com/view/FLEXSIMIN/2027/ENU/
- Sin acceso: https://www.qrcode.com/en/about/version.html (403). El cupo de búsquedas web de la sesión estaba agotado.

**Paquetes de datos y librerías (npm, consultados el 17-10-2026):**
- MDN browser-compat-data 8.1.6 (15-10-2026): https://www.npmjs.com/package/@mdn/browser-compat-data
- caniuse-lite 1.0.30001816 (13-10-2026), región AR: https://www.npmjs.com/package/caniuse-lite
- three 0.186.1 (MIT, 24-09-2026): https://www.npmjs.com/package/three
- mediabunny 1.61.6 (MPL-2.0, 16-10-2026): https://www.npmjs.com/package/mediabunny
- qrcode-generator 2.0.4 (MIT): https://www.npmjs.com/package/qrcode-generator
- esbuild 0.28.2: https://www.npmjs.com/package/esbuild

**Fuentes primarias citadas a través de los informes** (URL tomadas de esos informes; no se volvieron a abrir hoy):
- Law (2023), WSC: https://informs-sim.org/wsc23papers/124.pdf
- Bicalho-Hoch y otros (2022), WSC (79% de pymes sin simulación): https://informs-sim.org/wsc22papers/181.pdf
- AnyLogic 8.9.10: https://www.anylogic.com/blog/anylogic-8-9-10-boost-productivity-with-the-new-ai-assistant/
- AnyLogic Online: https://www.anylogic.com/blog/welcome-to-anylogic-online-another-way-to-build-and-use-simulations/
- AnyLogic, nube: https://www.anylogic.com/features/cloud/ · precios de terceros: https://checkthat.ai/brands/anylogic/pricing
- Simio MCP: https://www.financialcontent.com/article/bizwire-2026-9-23-aegis-software-introduces-ai-powered-interaction-for-process-simulation-and-planning-in-simio
- Siemens Copilot 2606: https://blogs.sw.siemens.com/tecnomatix/ai-for-discrete-event-simulation-how-plant-simulation-x-copilot-accelerates-simtalk-programming/
- FlexSim: https://www.flexsim.com/ · licencias por tipo: https://forums.autodesk.com/t5/flexsim-knowledge-base/flexsim-feature-limitations-by-license-type/tac-p/13814419
- realvirtual: https://realvirtual.io/es/blog/realvirtual-in-the-browser-3d-hmi/
- Visual Components: https://www.visualcomponents.com/products/
- Requisitos de Isaac Sim (citados en `frontera-ia.md`): https://docs.isaacsim.omniverse.nvidia.com
- Método del período activo (WSC 2002): https://informs-sim.org/wsc02papers/146.pdf
- FM Logistic con AlphaEvolve: https://cloud.google.com/blog/products/ai-machine-learning/how-fm-logistic-tackled-the-traveling-salesman-problem-at-warehouse-scale-with-alphaevolve
- oskon.com.tr, capacidad de sorters: https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity
- Correo Argentino Monte Grande: https://mercado.com.ar/innovacion/correo-argentino-inaugura-sistema-robotico-que-triplica-la-capacidad-operativa-logistica-en-monte-grande
- Andreani Pacheco: https://mercado.com.ar/protagonistas/andreani-convierte-su-planta-de-pacheco-en-el-hub-logistico-mas-automatizado-del-pais · https://www.iprofesional.com/tecnologia/453613-andreani-invierte-us30-millones-en-tecnologia-en-su-hub-pacheco-y-expande-su-operacion-a-miami
- Loske y Klumpp (IFAC 2020): https://re.public.polimi.it/retrieve/584d3515-aaf1-4de0-8e95-e441327146e8/1-s2.0-S2405896320335205-main.pdf
- Hot Sale 2026, primeras horas: https://www.baenegocios.com/amp/hot-sale-2026-los-argentinos-gastan-casi-100-000-por-compra/
- Envíos Flex: https://base.com/es-AR/blog/envios-flex-y-same-day-en-buenos-aires-con-base/
- Supervalu, paletizado contra granel: https://www.supermarketnews.com/archive/palletization-cuts-product-turnaround-times-study
- WERC 2025 (infografía de Yale): https://www.yale.com/globalassets/coms/yale/north-america/documents/white-papers/snack-drawer/YALE-1520_WERC-DC-Metrics-infographic.pdf
- Dataset de Amazon (CC BY-NC): https://registry.opendata.aws/amazon-last-mile-challenges
- EIL, ausentismo: https://argentina.gob.ar/sites/default/files/eil_ausentismo_ficha_metodologica.pdf
- Figma, educación: https://www.figma.com/education/ · FlexSim, academia: https://www.flexsim.com/academia/
- AnyLogic, academia: https://www.anylogic.com/resources/anylogic-for-academia/
- CONFEDI (COINI 29-10-2026, plenaria del 05-11-2026): https://confedi.org.ar/
- Cloudflare Pages y Workers: https://developers.cloudflare.com/pages/platform/limits/ · https://developers.cloudflare.com/workers/platform/pricing/
- GitHub Pages, usos prohibidos: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- WebKit, política de almacenamiento: https://webkit.org/blog/14403/updates-to-storage-policy/
