# Andén · Gemelo de planta: de lo que se junta con el celular a una planta que se simula (15-11-2026)

> **Qué es.** El diseño de una capacidad nueva de Andén: que cualquier depósito, centro de distribución, hub o planta industrial pase
> de **fotos, un video, un croquis y un plano** a un **gemelo 3D navegable y medido, con su simulación encima**. Sale del pedido del
> fundador del 15-11-2026 (que lo hecho con la planta piloto se pueda hacer con cualquier otra planta) y generaliza el método artesanal que
> se usó en la **planta piloto** (6 al 13-11-2026).
>
> **Confidencialidad.** La planta piloto es de un tercero. Este archivo describe el **método**: ningún nombre, medida, foto, plano ni
> dato operativo de esa planta. Los números de la planta piloto que aparecen son conteos del trabajo (cuántas fotos, cuántos puntos) y
> errores relativos, nunca medidas del lugar. Las pruebas de hoy se hicieron en una carpeta temporal fuera de los repositorios y se
> borran al cerrar la sesión.
>
> **Etiquetas:** HECHO · MEDIDO · ESTIMACIÓN · HIPÓTESIS · INFERENCIA (`doctrina/02-estandares-de-evidencia.md`).

## 0. En una página

1. **El método de la planta piloto funcionó, pero fue artesanal.** El cuello no fue el 3D ni el simulador: fue **ubicar cada foto**.
   Claude anotó a mano **1.188 observaciones** (puntos, líneas y verticales de la estructura) en 43 imágenes para resolver sus poses, y
   proyectó al piso 106 puntos para medir el layout (HECHO, archivos de calibración de la planta piloto). El plano DWG **nunca se leyó**
   por falta de conversor; la estructura salió del PDF y de las fotos.
2. **Lo que hoy probamos con herramientas especializadas, en este entorno sin GPU (MEDIDO, 15-11-2026):**
   - **COLMAP 4.2 (pycolmap 4.2.1)** ubicó solo **36 de 39 cuadros** de 13 s de video en **2 min 23 s**, con error de reproyección de
     0,68 px. Escalado con 3 poses manuales, coincide con las poses que Claude había resuelto a mano a **0,23–0,30 m y 0,4–1,1°**
     (dejando una afuera: 0,28–0,61 m). Dos anotaciones manuales del mismo cuadro difieren entre sí 0,45 m: **la máquina ya está en el
     ruido del método manual**, y la altura de la cámara que deduce es estable (desvío de 1,3 cm en 36 cuadros).
   - Con las **53 fotos sueltas** (no pensadas para fotogrametría) COLMAP ubicó solo 20, con la escala mal resuelta (2 a 3 m de error
     contra las poses manuales). **Conclusión: la fotogrametría automática sirve si el relevamiento se hace para ella** (video lento
     con solape, fotos encadenadas). El protocolo del §4 existe por esto.
   - **LibreDWG 0.14 + ezdxf 1.4.5** abrieron el DWG que en la planta piloto quedó sin leer: **4,6 s** para pasarlo a DXF, **30 s** para
     leer ~280.000 entidades y ~2.000 cotas (99,8% con su valor legible). La grilla de columnas sale sola de las capas del plano y **coincide con la
     medida por fotos a 0,4% o menos**. Con el plano leído, la etapa más cara de la piloto (medir la estructura) se vuelve automática.
   - **PyMuPDF** lee los ~43.000 trazos vectoriales del PDF en 0,65 s, pero de las cotas solo 1 está como texto: **la escala de un PDF
     sigue necesitando a Claude mirando la imagen** (o el DWG).
3. **El flujo generalizado, en 8 pasos** (§3): relevar con protocolo → ingerir planos → reconstruir cámaras (SfM) → anclar a escala y
   al plano → estructura → layout y objetos paramétricos → verificar con medidas de control → enganchar al motor de Andén.
4. **Producto:** primero **servicio hecho por Claude** con un formulario de carga (USD 300–900 por planta, HIPÓTESIS); después
   **autoservicio** dentro de Andén Pro. Contra un relevamiento con escáner láser (USD 0,20–0,70 por pie² solo el escaneo, mínimo
   USD 1.000; con modelo BIM de depósito, USD 18.000–55.000; fuentes de proveedores de EE. UU., HECHO secundario) y un modelo en FlexSim
   (~USD 6.000/año la licencia), es un orden de magnitud más barato, **con precisión de decímetros, no de centímetros**: lo decimos.
5. **Plan:** una línea nueva del corte 2, **«2c Tu planta»**, de 8,5 a 12 sesiones (ESTIMACIÓN), que no toca los contratos congelados y
   reusa el 3D de C2-3 y la biblioteca de C2-4. **Primera entrega: rehacer la planta piloto con el flujo generalizado, en el
   repositorio privado, y medir horas y precisión contra la versión artesanal.**
6. **Lo que decide el fundador** (§10): sumar este método a la consulta legal ya pendiente (la piloto es de su empleador), conseguir una
   segunda planta de prueba que no sea de su empleador, y el OK para GPU alquilada si se quiere la capa fotográfica (gaussian splatting).

---

## 1. El método real en la planta piloto

### 1.1 Qué entró (HECHO, `relevamiento/` y `como_se_hizo/` del repositorio privado)

| Insumo | Cantidad | Qué aportó | Qué no aportó |
|---|---|---|---|
| Fotos de celular | 61 (dos lentes: gran angular y normal) | Estado real del piso, carteles, texturas; 41 se ubicaron con su pose | Sacadas para mirar, no para medir: poco solape entre ellas |
| Video narrado | ~10 min en 14 tramos, vertical | Recorrido completo, nombres de zonas y flujo (narración transcripta con Whisper large-v3-turbo) | La rotación venía en metadatos: los primeros cuadros salieron acostados (corregido con `-noautorotate` y `transpose`) |
| Plano PDF vectorial | 1 hoja | Escala (tres cotas coinciden a < 0,5%) y estructura | Desactualizado para el layout |
| Plano DWG | 1 archivo | Nada: **no se leyó** (no había conversor DWG→DXF) | — |
| Croquis a mano fotografiado | 1 | Nombres actuales de las zonas | Medidas |
| Quien conoce la operación | Varias rondas | Glosario, correcciones de cada versión | — |

### 1.2 Qué pasos se hicieron y quién los hizo

| Paso | Cómo | Automático o criterio | Esfuerzo (ESTIMACIÓN por los archivos) |
|---|---|---|---|
| 1. Relevar | Transcripción con Whisper; cuadros con ffmpeg cada 3 s (1,5 s en tramos densos); catálogo foto por foto; glosario y preguntas | Transcripción y cuadros automáticos; **catálogo y glosario, criterio de Claude** | ~0,5 sesión |
| 2. Estructura | Escala del PDF con tres cotas leídas a ojo; portones por homografía sobre una foto frontal; grilla de columnas del plano | **Criterio de Claude** (leer cotas, elegir la foto) + SciPy | ~0,5 sesión |
| 3. Poses de cada foto | Para cada imagen, Claude miró una grilla de píxeles y anotó puntos, líneas y verticales de la estructura conocida; mínimos cuadrados con SciPy (posición, altura, rumbo, cabeceo, giro, campo visual, distorsión k1); cada pose confirmada con un «ancla única» porque la grilla de columnas se repite | **Casi todo criterio de Claude**: 1.188 observaciones anotadas a mano, en 8 lotes y 2 pasadas | **El paso más caro**: ~2 sesiones con agentes en paralelo |
| 4. Layout | Proyección al piso de puntos de la base de bines y pallets desde fotos ubicadas (106 puntos) y triangulación con dos fotos | SciPy; **qué punto anotar, criterio** | ~1 sesión |
| 5. Modelo | `modelo.json` + `fotos.json` como única fuente; HTML con 2D (SVG), 3D y modo caminar (three.js 0.160.0); texturas recortadas y enderezadas con OpenCV | Script | ~1 sesión |
| 6. Validar | Foto contra gemelo desde la misma pose (cortina y mezcla); capturas con Playwright; correcciones con quien conoce la operación | **Visual** | Continuo |
| 7. Simular | Motor de eventos discretos propio en JS (917 líneas), escenarios «hoy» y «propuesto», equipos y personas animadas hechos con Blender 4.5 | Código nuevo, **no el motor de Andén** | ~2–3 sesiones |

Calendario (HECHO): relevamiento del 05 y 06-11, gemelo v0.3 el 06-11, documento del método el 10-11, simulador hasta el 13-11. Unas
**8 jornadas** con varias sesiones; no hay registro de horas por paso, por eso la columna de esfuerzo es estimación.

### 1.3 Qué salió mal y se corrigió (HECHO)

| Problema | Corrección | Lección para el producto |
|---|---|---|
| Cuadros del video acostados | ffmpeg con `-noautorotate` y `transpose=1` | La ingestión lee la rotación de los metadatos siempre |
| La grilla de columnas se repite: una pose podía «encajar» corrida un módulo | Cada pose se confirma con un ancla única (número de portón, rincón, cartel, senda) | El anclaje automático pide al menos una referencia única por tramo; el protocolo la exige |
| El gran angular deforma | Distorsión radial k1 global para fotos de más de 90° | Modelo de lente por cámara (en COLMAP, `OPENCV`) |
| El DWG no se pudo abrir | Se trabajó con el PDF | LibreDWG + ezdxf (probado hoy, §2) |
| El layout del primer gemelo estaba mal ubicado | Se midió proyectando puntos desde fotos calibradas | Ningún objeto sin medida o sin marca «estimada» |
| Los bines se mueven durante la noche (dos fotos con horas de diferencia muestran cosas distintas) | Se anotó como hallazgo | El gemelo es una **foto del layout de un momento**: cada objeto lleva la hora de su fuente |

### 1.4 Qué precisión se logró y cómo se midió (HECHO, con su límite)

- **Poses:** error de reproyección mediano de **0,17% del ancho de la imagen** (máximo 0,50%) en 43 poses, con una mediana de 25
  observaciones por imagen.
- **Escala del plano:** tres cotas coinciden con < 0,5% de diferencia.
- **Repetibilidad del método manual:** el mismo cuadro, anotado dos veces de forma independiente, dio poses separadas **0,45 m** y
  2° de campo visual (MEDIDO hoy sobre los archivos de la piloto).
- **Layout:** el modelo declara cada zona como «medida en fotos (± 1 m)» o «estimada»: 28 medidas y 7 estimadas de 35.
- **El límite:** **no hubo medidas de control independientes** (cinta o medidor láser). La validación fue visual: superponer gemelo y
  foto. El error de reproyección mide coherencia interna, no exactitud en metros. **El producto tiene que agregar control
  independiente** (§7).

---

## 2. Lo que probamos hoy (MEDIDO, 15-11-2026, contenedor de 4 núcleos sin GPU, 15 GB de RAM)

Todo en `scratchpad` fuera de los repositorios. Herramientas instaladas en un entorno virtual: pycolmap 4.2.1, ezdxf 1.4.5,
PyMuPDF 2.1, OpenCV 5.0.0 (headless); LibreDWG 0.14 compilado desde el código fuente oficial de GNU; ffmpeg 6.1.1 del sistema.

| # | Prueba | Resultado | Lectura |
|---|---|---|---|
| P1 | 45 s de video → cuadros a 2 por segundo, 720 px | 90 cuadros en 22 s | ffmpeg con rotación correcta |
| P2 | COLMAP incremental, coincidencias secuenciales, 90 cuadros de 720 px | 62 de 90 ubicados, **partidos en 2 modelos** (se pierde en un giro), 2 min 48 s | Video sin protocolo: giros rápidos cortan la cadena |
| P3 | COLMAP incremental, coincidencias exhaustivas, 39 cuadros de 1080 px (13 s, 3 por segundo) | **36 de 39 ubicados**, 12.806 puntos, reproyección **0,68 px**, 2 min 23 s | Funciona en CPU, en minutos |
| P4 | P3 anclado (rotación, escala y traslación) a 3 poses manuales del mismo tramo | Diferencia de **0,23–0,30 m** y **0,4–1,1°**; dejando una afuera, **0,28–0,61 m**; altura de cámara 1,35 m con desvío de **1,3 cm** en 36 cuadros; campo visual estimado 36,8° contra 36,2–38,4° manual | Igual que el método manual (que difiere 0,45 m consigo mismo), sin anotar nada. Ojo: el tramo mide ~6 m: la escala sale de una base corta |
| P5 | COLMAP sobre las 53 fotos sueltas (dos lentes, 4000 px) | Ver §2.1 | Fotos sin solape: la fotogrametría automática no alcanza |
| P6 | DWG real de la piloto → DXF con LibreDWG 0.14 | **4,6 s**, sin error (avisos de clases inestables) | Abre lo que en la piloto quedó cerrado |
| P7 | DXF con ezdxf 1.4.5 | 30 s de lectura; ~280.000 entidades, cientos de capas y miles de bloques, **~2.000 cotas, 99,8% con valor legible**; unidades en metros (inferidas de las cotas, porque `$INSUNITS` = 0) | Las cotas están como dato, no como dibujo |
| P8 | Columnas desde las capas del DXF (capas con «COL» en el nombre, cajas < 2 m, agrupadas) | Más de 100 columnas; separaciones más frecuentes iguales a la grilla medida por fotos, con diferencia **≤ 0,4%** | La estructura sale sola del plano |
| P9 | PDF vectorial con PyMuPDF 2.1 | ~43.000 trazos en 0,65 s; unas 300 palabras; **1 sola cota** como texto | La escala del PDF sigue siendo criterio de Claude mirando la imagen (o se toma del DWG) |

### 2.1 Fotos sueltas (P5)

- Modelo de lente `SIMPLE_RADIAL`: **20 de 53** fotos ubicadas (3 min en CPU; 0,73 px). De esas, 14 tienen pose manual: anclando con
  las 14, la diferencia mediana es **2,7 m y 4,4°**, sin un valor atípico que la explique (todas entre 0,8 y 3,6 m): el modelo sale
  deformado porque las fotos casi no se solapan y mezclan dos lentes.
- Con el modelo de lente `OPENCV` (más parámetros de distorsión): **18 de 53** ubicadas (0,87 px); mediana **2,1 m y 4,3°** contra
  las poses manuales. Mejora poco: el problema es el solape, no la lente.
- **Lectura:** con fotos «para mirar» el método manual (anclas sobre estructura conocida) sigue siendo necesario; con un relevamiento
  hecho para fotogrametría, COLMAP lo reemplaza. Por eso el flujo usa las dos cosas: COLMAP para lo que tiene solape y el solucionador
  de anclas (el de la piloto, generalizado) para las fotos sueltas que valen por su contenido.

---

## 3. El flujo generalizado: de insumos a planta simulable

```
 relevamiento con protocolo (§4)          planos (DWG / DXF / PDF / croquis)
            │                                        │
   1. ingestión de medios                  2. ingestión de planos
   (rotación, cuadros nítidos,             (DWG→DXF, capas, cotas, columnas,
    caras borroneadas, EXIF)                muros, muelles; escala del PDF)
            │                                        │
   3. cámaras: SfM (COLMAP)  ─────────────▶ 4. anclaje: escala y registro al plano
      + anclas para fotos sueltas              (puntos de control, columnas, medidas)
            │                                        │
            └──────────────▶ 5. estructura ◀─────────┘
                             (naves, columnas, muros, portones/muelles, sendas)
                                       │
                             6. layout y objetos paramétricos
                             (racks, cintas, bines, pallets, zonas; proyección al piso,
                              segmentación; criterio de Claude con la foto al lado)
                                       │
                             7. verificación con medidas de control (informe de precisión)
                                       │
                             8. enganche con el motor de Andén
                             (grafo de pasillos, puestos, recursos → familia «piso»)
```

| Paso | Entra | Sale | Automático | Criterio de Claude | Herramienta (§5) |
|---|---|---|---|---|---|
| 1. Medios | Fotos, videos, audio | Cuadros derechos y nítidos, transcripción, caras borroneadas, catálogo | Rotación, muestreo, nitidez, transcripción, borroneo | Catálogo, glosario, preguntas | ffmpeg, OpenCV, Whisper |
| 2. Planos | DWG, DXF, PDF, croquis | Estructura vectorial en metros con su fuente | DWG→DXF, capas, cotas, bloques | Qué capa es qué; escala del PDF; leer el croquis | LibreDWG, ezdxf, PyMuPDF |
| 3. Cámaras | Cuadros y fotos | Pose y lente de cada imagen, nube de puntos | SfM | Fotos sueltas: anotar anclas (como en la piloto) | COLMAP (pycolmap) |
| 4. Anclaje | Poses + plano + medidas de control | Todo en el sistema de coordenadas del plano, en metros | Similaridad por mínimos cuadrados | Elegir anclas únicas cuando la grilla se repite | Código propio chico (SciPy) |
| 5. Estructura | Plano + nube + fotos | Muros, columnas, portones, muelles, entrepisos, sendas | Del DWG; contraste con la nube | Lo que el plano no tiene o tiene viejo | ezdxf + SciPy |
| 6. Layout | Fotos ubicadas + croquis + video | Zonas, racks, cintas, bines, pallets, puestos, con medida o «estimada» | Proyección al piso; recorte de objetos | **Qué es cada cosa** y dónde termina cada zona | SAM 2.1 (recortes), biblioteca `bpy` |
| 7. Verificar | Medidas de control | Informe de precisión por zona | Residuos | — | Código propio |
| 8. Simular | `anden.planta/1` + volúmenes y tiempos | Modelo simulable | Grafo de pasillos y distancias | Proceso y supuestos con quien opera | Motor de Andén |

---

## 4. Protocolo de relevamiento (30 a 60 minutos con un celular)

Para quien releva, en una hoja. Está pensado para que COLMAP encadene las imágenes y para tener control independiente.

| # | Qué | Cómo | Tiempo | Por qué |
|---|---|---|---|---|
| 1 | **Permiso y privacidad** | Autorización escrita del dueño del lugar; avisar al personal; evitar caras y pantallas cuando se pueda | 5 min | Legal (§8.5) |
| 2 | **Plano** | Pedir el **DWG o DXF** (mejor que el PDF); si solo hay PDF, que sea el vectorial y no un escaneo; si no hay plano, croquis con 3 medidas | — | El plano da la estructura casi gratis (P6–P8) |
| 3 | **Medidas de control** | Con medidor láser (USD 30–60) o cinta: **5 distancias** entre cosas fijas (columna a columna, ancho de un portón, ancho de un pasillo, largo de un muro, altura libre bajo viga) y anotarlas en el formulario | 10 min | Escala independiente y control de precisión (lo que faltó en la piloto) |
| 4 | **Video de estructura** | Horizontal, 4K o 1080p a 30 cps, **caminando lento** (medio paso por segundo), cámara a la altura del pecho, recorrer el perímetro y después cada pasillo; **en las esquinas girar despacio** (más de 3 s por cada 90°); mostrar el piso y el techo de vez en cuando; no apuntar a superficies lisas | 10–20 min | Solape continuo: P2 se cortó en un giro; P3 encadenó 36 de 39 |
| 5 | **Video narrado** | Otra pasada (puede ser la misma) diciendo en voz alta el nombre de cada zona y el flujo de la mercadería | 10 min | Nombres y proceso (la piloto lo mostró indispensable) |
| 6 | **Fotos de anclas** | Una foto de cada referencia única (número de portón o muelle, cartel, rincón) y de cada pared de frente | 5 min | Desambiguar grillas repetidas |
| 7 | **Fotos de detalle** | Cada zona desde dos ángulos, con algo fijo en cuadro; carteles de racks y ubicaciones | 10 min | Texturas y contenido |
| 8 | **Planillas** | Si existen: lista de ubicaciones, racks, muelles, volúmenes por hora, dotación | — | Paso 8 (simulación) |
| 9 | **Croquis** | Foto del croquis con nombres de zonas | 2 min | Nombres actuales |

**Qué no hace falta:** escáner, iPhone con LiDAR, dron ni app paga. Si el celular tiene LiDAR, suma (§5, comparadores), pero el
protocolo no depende de él.

---

## 5. Herramientas elegidas (regla 10)

Cada línea: herramienta · versión · fuente oficial · licencia · por qué · regla de corte. «Sin GPU» = corre en este entorno.

| Paso | Elegida | Versión (fecha de verificación) | Licencia | Sin GPU | Por qué | Regla de corte |
|---|---|---|---|---|---|---|
| Cuadros de video | **ffmpeg** | 6.1.1 (sistema, 15-11-2026) | LGPL/GPL (herramienta) | Sí, MEDIDO | Estándar; lee la rotación | — |
| Nitidez y borroneo de caras | **OpenCV** (Laplaciano; detector de caras YuNet del OpenCV Zoo) | 5.0.0 headless (PyPI, 15-11-2026) | Apache-2.0 (OpenCV); YuNet a verificar en su ficha antes de integrarlo | Sí | Ya usado en la piloto; sin servicio externo | Si el borroneo deja caras visibles en > 1% de una muestra de 200 cuadros revisada, se cambia de detector |
| Transcripción | **Whisper large-v3-turbo** | El usado en la piloto | MIT | Sí (lento) | Probado en la piloto | — |
| Cámaras (SfM) | **COLMAP vía pycolmap** (incremental para video; el mapeador global, que absorbió a GLOMAP desde COLMAP 4.0, para conjuntos grandes) | pycolmap 4.2.1 (PyPI, instalado 15-11-2026); COLMAP 4.2 (radiancefields.com, secundario) | BSD-3-Clause | **Sí, MEDIDO** (P3: 2 min 23 s para 39 cuadros) | Lo más maduro y abierto; coincide con el método manual (P4) | Si en la entrega 1 ubica < 80% de los cuadros de un video hecho con protocolo, se prueba VGGT (abajo) |
| Cámaras con pocas fotos (segunda línea) | **VGGT-1B-Commercial** | Checkpoint comercial del 29-07-2025 (huggingface.co/facebook/VGGT-1B-Commercial) | Licencia propia de uso comercial, sin uso militar; acceso con formulario | No en la práctica (1.000 M de parámetros) | Reconstruye con pocas imágenes y poco solape, justo donde COLMAP falló (P5) | Solo con OK (cuenta y GPU). Entra si mejora P5 a < 0,5 m de mediana |
| Anclaje y fotos sueltas | **Código propio chico** (SciPy): similaridad con anclas y el solucionador de anclas de la piloto, generalizado | SciPy 1.18.1 | BSD | Sí, MEDIDO | No existe herramienta que ancle a «estructura conocida del plano» con anclas únicas; es pegamento de ~200 líneas ya probado | — |
| DWG → DXF | **LibreDWG** (`dwg2dxf`, como programa aparte, nunca enlazado) | 0.14 (ftp.gnu.org, compilado 15-11-2026) | GPL-3.0 (la herramienta; el DXF que produce es del cliente) | **Sí, MEDIDO** (P6) | Abrió el DWG real de la piloto en 4,6 s | Si un DWG de cliente no abre, se pide DXF al cliente; ODA File Converter solo con membresía paga (abajo) |
| DXF | **ezdxf** | 1.4.5 (PyPI) | MIT | **Sí, MEDIDO** (P7–P8) | Lee entidades, bloques y cotas con su valor | — |
| PDF vectorial | **PyMuPDF** | 2.1 (PyPI) | AGPL-3.0 o comercial de Artifex | Sí, MEDIDO (P9) | Saca trazos y texto; ya usado en la piloto | Corre solo de nuestro lado y sin modificar; si alguna vez va al navegador o a un producto distribuido, se cambia por pypdfium2 o se compra la licencia |
| Escala del PDF y croquis a mano | **Claude mirando la imagen** (tres cotas que coincidan) | — | — | Sí | El PDF de la piloto tiene 1 cota como texto de muchas; un OCR no lee croquis a mano | — |
| Recortes de objetos y texturas | **SAM 2.1** (`hiera-tiny` en CPU) | Repo facebookresearch/sam2 | Apache-2.0 | Sí (lento) | Recorta bines, pallets y carteles sin hacerlo a mano; SAM 3 tiene licencia propia con más condiciones | Entra si baja a la mitad el tiempo de recortes de la entrega 1; si no, OpenCV como en la piloto |
| Objetos paramétricos | **Blender `bpy`** + glTF Transform + meshoptimizer | 5.2.3 (`radar-tecnico.md` §2.1) | GPL-3.0 la herramienta; lo producido es nuestro | Sí | La fábrica de activos de C2-4 | La de C2-4 |
| Visor | **three.js** + 2D en Canvas | 0.186.1 (`radar-tecnico.md`) | MIT | 2D y 2,5D sí; 3D con GPU | El stack de Andén | El de C2-3 |
| Capa fotográfica (opcional) | **gsplat** para entrenar; **Spark** para ver dentro de three.js | gsplat (Apache-2.0); Spark 2.4.0 (MIT, 20-10-2026, secundario) | Apache-2.0 · MIT | **No**: entrenar pide GPU con CUDA | Ver la planta «como en la foto» encima del gemelo medido | Solo con OK de gasto en GPU alquilada; entra si un sector entrena en < 30 min y se ve a ≥ 30 cps en un teléfono medio (C2-1) |

**Descartadas y por qué (HECHO, fuentes en §11):**

| Herramienta | Por qué no |
|---|---|
| DUSt3R y MASt3R | Código y pesos CC BY-NC-SA 4.0 (no comercial) |
| Depth Anything 3 | Las variantes Apache-2.0 (Small, Base, Metric-Large) dan profundidad por foto; no hace falta si hay SfM y plano. Queda para medir alturas desde una sola foto si aparece la necesidad |
| OpenMVG, Meshroom/AliceVision | MPL-2.0 y buenos, pero COLMAP ya cubre el paso con mejor resultado medido y más comunidad; Meshroom necesita CUDA para la densificación |
| nerfstudio | Útil para investigar; para producción alcanza gsplat, que es su núcleo de splatting |
| ODA File Converter | Gratis solo bajo el acuerdo comunitario, que excluye uso comercial y SaaS sin membresía paga (opendesign.com) |
| Tesseract (OCR) para cotas | Las cotas del DWG ya son dato (P7); las del PDF y del croquis las lee mejor Claude con la imagen |
| Polycam, Luma, RealityScan | **Solo para comparar** (§8.3): sacan los datos del cliente a un tercero y no dan estructura ni simulación. RealityScan 2.2 es gratis para empresas con menos de USD 1 M de facturación (USD 1.250 por puesto y año arriba); Polycam ~USD 30/mes o ~USD 400/año por usuario (fuentes secundarias). Luma: precios no verificados |

**Qué sigue siendo criterio de Claude mirando las imágenes** (y por qué no se automatiza todavía): qué es cada cosa en una foto
(un bin, una jaula, un puesto), dónde termina una zona, qué capa del plano está vieja, la escala de un PDF sin cotas como texto, el
croquis a mano, el glosario y las preguntas a quien opera, y el ancla única que desambigua una grilla repetida.

---

## 6. El formato del gemelo y el enganche con el motor

**Hoy (HECHO):** `anden.modelo/1` es de una sola familia, `hub-lazo` (hub con sorter de lazo), y está **congelado**
(`apps/anden/simulador/contratos/modelo.ts`). La planta piloto se simuló con un motor JS propio de esa sesión, no con el de Andén.

**Propuesta (aditiva, respeta B1):**

1. `contratos/planta.ts` → esquema **`anden.planta/1`**, la planta como dato:
   - `sistema`: origen, ejes y unidades (metros), cómo se registró al plano;
   - `estructura`: muros, columnas, portones y muelles, entrepisos, sendas, alturas;
   - `zonas`: polígono, nombre, uso, contenido;
   - `objetos`: instancias de la biblioteca paramétrica (rack de N módulos × M niveles, cinta con su recorrido, bin, pallet, jaula,
     puesto, autoelevador) con sus parámetros;
   - `pasillos`: grafo navegable con anchos y sentido;
   - `fuentes` y `precision` **por elemento** (plano, foto con su pose, medida de control, estimada) y la hora de la fuente;
   - `imagenes`: pose y lente de cada foto o cuadro, para el modo «comparar con la foto».
2. `contratos/modelo-piso.ts` → **una familia nueva, `piso`**, para operaciones con trabajo manual sobre un layout (recepción,
   palomeo o clasificación manual, picking, staging, despacho por muelles): recursos (personas, zorras, autoelevadores), puestos,
   flujos por tipo de carga y **tiempos de caminata calculados sobre el grafo de pasillos** (el Dijkstra en CSR propio de Andén). El
   compilador despacha por familia; `hub-lazo` no cambia.
3. El 3D de C2-3 dibuja la `anden.planta/1`; el reproductor mueve sobre ella lo que diga la traza. **Ninguna escena muestra algo que el
   motor no simule** (regla de C2-4).
4. Las plantillas 6 (cross-dock) y 7 (depósito pyme) de `diseno-maestro.md` §6 pasan a ser **casos de la familia `piso`**: el gemelo
   de una planta real es una plantilla con medidas propias.

---

## 7. Precisión: qué se promete y cómo se verifica

| Caso | Precisión esperable (ESTIMACIÓN) | Base |
|---|---|---|
| Estructura con DWG/DXF | Lo que diga el plano; escala ≤ 0,5% | P8 y las cotas de la piloto |
| Estructura sin plano, con 5 medidas de control | 1–2% de escala | INFERENCIA: SfM escalado por medidas de control; a medir en la entrega 1 |
| Posición de cámaras de un video con protocolo | 0,2–0,6 m | P4 |
| Layout (base de racks, bines, pallets) | ± 0,3–0,5 m donde hay fotos ubicadas; ± 1 m o «estimada» donde no | Piloto (28 de 35 zonas «± 1 m») y P4 |
| Alturas | Peor que lo horizontal: se toman del plano o de una medida | INFERENCIA |

**Cómo se verifica (nuevo, obligatorio):** las 5 medidas de control del protocolo **no se usan para ajustar**: se usan para medir. El
informe de entrega dice, por zona, de dónde salió cada cosa y el error contra el control. Sin control, el gemelo sale con la etiqueta
«sin verificar».

**Límites honestos:** sin escáner no hay centímetros; superficies lisas o repetidas confunden la fotogrametría; un layout que cambia en
horas (como el de la piloto) se congela en el momento del relevamiento; lo que no se filmó no existe en el gemelo.

---

## 8. Producto y negocio

### 8.1 Cómo se ofrece

| Etapa | Qué | Quién trabaja | Cuándo |
|---|---|---|---|
| **A. Servicio hecho por Claude** | Formulario de carga (protocolo de §4 + subida de archivos) → Claude arma el gemelo y la simulación → entrega con informe de precisión y una reunión | Claude; el fundador solo aprueba la entrega | Después de la entrega 1 y de la consulta legal |
| **B. Autoservicio asistido** | El cliente sube; el flujo automático hace pasos 1–5 y 7; Claude (IA del producto) propone el layout y el cliente corrige en un editor 2D | El cliente y el producto | Corte 3 o 4, según comité |
| **C. Dentro de Andén Pro** | «Tu planta» como plantilla propia, con escenas privadas | — | Con el Pro |

**Quién vende por él** (DEC-2026-09-26-5): el formulario y la galería de Andén; consultores de ingeniería industrial que revenden el
gemelo como parte de su estudio; cátedras que lo usan con plantas de empresas que les abren la puerta. No hace falta salir a vender en
la etapa A si se apoya en consultores (HIPÓTESIS a validar).

### 8.2 A quién

| Cliente | Qué compra | Alternativa hoy |
|---|---|---|
| Operador logístico (3PL) | Gemelo + «¿y si cambio el layout?» antes de mover un rack | Planos viejos, Excel, consultor con FlexSim |
| Pyme con depósito | Ver su depósito y saber cuánta gente necesita | Intuición |
| Consultor de ingeniería industrial | La base medida que hoy dibuja a mano antes de simular | Relevamiento propio de días |
| Cátedras de logística | Plantas reales para clase | Ejemplos de libro |

### 8.3 Cuánto vale frente a lo que cuesta hoy

| Alternativa | Costo (fuente) | Qué da |
|---|---|---|
| Escaneo láser | USD 0,20–0,70 por pie² (≈ USD 2–7,5 por m²), mínimo USD 1.000, más el modelado (USD 0,25–0,75 por pie²); depósito con BIM completo: USD 18.000–55.000 (guías de proveedores de EE. UU., 2026; HECHO secundario) | Centímetros, sin simulación |
| Modelo en FlexSim | ~USD 6.000/año la licencia (`diseno-maestro.md`) + horas de un ingeniero | Simulación; el layout se dibuja aparte |
| Polycam / RealityScan | Gratis a ~USD 400/año por usuario (secundario) | Malla o nube 3D; sin estructura, sin simulación |
| **Gemelo de planta de Andén** | **Servicio: USD 300–900 por planta**; **autoservicio: dentro del Pro o USD 49–99 por gemelo** (HIPÓTESIS, se prueban con página de interés y OK del fundador) | Decímetros, estructura del plano, simulación, comparar con cada foto |

**Costo propio (ESTIMACIÓN):** 1 a 2 sesiones de Claude por planta en la etapa A (la piloto llevó ~8 jornadas con el método manual;
la meta de la entrega 1 es bajarlo a ≤ 2 sesiones); USD 0 en herramientas; la capa de splatting, si se usa, unos pocos dólares de GPU
alquilada por planta (a medir con OK).

### 8.4 Regla de corte del producto

- La entrega 1 tiene que rehacer la piloto en **≤ 2 sesiones** con precisión **≤ 0,5 m de mediana** contra el control. Si no, el
  servicio no se ofrece y el método queda como herramienta interna.
- Etapa A: si con la página de interés y el canal de consultores no hay **3 plantas pedidas en 90 días** desde que se abre (con OK), se
  pausa la etapa A y el gemelo queda solo como entrada de plantillas.

### 8.5 Riesgos legales

| Riesgo | Mitigación |
|---|---|
| **La planta piloto es del empleador del fundador** y el método se desarrolló con su material | Nada de la piloto sale del repositorio privado ni se muestra como caso; sumar a la **consulta legal ya pendiente** si el método general (sin datos) puede ofrecerse como producto propio y si los activos de equipos y personas hechos en esa sesión se pueden reusar o hay que rehacerlos en la fábrica de C2-4 (por defecto: **se rehacen**) |
| Propiedad de los planos (del cliente, del arquitecto o del dueño del inmueble) | El formulario exige declarar que tiene derecho a compartirlos; uso solo para su gemelo; borrado al cierre |
| Fotos con personas (datos personales, Ley 25.326) | Borroneo de caras automático antes de guardar; pedir no filmar caras; no guardar audio más que la transcripción |
| Confidencialidad del cliente | Acuerdo de confidencialidad; un repositorio privado por cliente; nada en la galería pública sin el anonimizador y su OK |
| Licencias de herramientas | LibreDWG (GPL) y PyMuPDF (AGPL) corren solo de nuestro lado, sin distribuir; ningún modelo no comercial (DUSt3R, MASt3R) |

---

## 9. Plan: la línea «2c Tu planta» dentro del corte 2

No rompe nada: los contratos nuevos van en archivos nuevos (B1), las huellas del corte 1 no cambian (B2), lo pesado (SfM, DWG) corre en
scripts de construcción en Python, nunca en `npm test` (B4), y nada sale a terceros (B8).

| Paquete | Qué | Aceptación (medible) | Sesiones (ESTIMACIÓN) | Depende de |
|---|---|---|---|---|
| **G-0** Contratos | `planta.ts` (`anden.planta/1`) y `modelo-piso.ts` | `tsc` en verde; B1; prueba en Node con un ejemplo sintético | 0,5 | C2-0 |
| **G-1** Planos | `planta/planos.py`: DWG→DXF (LibreDWG), capas, cotas, columnas, muros, muelles; PDF con PyMuPDF + escala asistida | En 3 DXF públicos de muestra y en la piloto (privado): ≥ 95% de las columnas detectadas, separación de la grilla a ≤ 0,5% de las cotas; tiempo ≤ 2 min para 300.000 entidades | 1–1,5 | G-0 |
| **G-2** Cámaras y anclaje | `planta/camaras.py`: cuadros (rotación, nitidez), COLMAP, anclaje por similaridad, solucionador de anclas para fotos sueltas | Con un video hecho con protocolo: ≥ 80% de los cuadros ubicados; con la piloto: mediana ≤ 0,5 m contra las poses manuales en ≥ 10 cuadros; ≤ 30 min de CPU por planta | 1,5–2 | G-1 |
| **G-3** Estructura y layout | Proyección al piso, recortes (SAM 2.1 si gana), propuesta de layout con fuente y precisión por elemento; Claude decide lo que es criterio | Cada elemento con fuente y precisión; 0 elementos sin etiqueta; error contra control informado | 1,5–2 | G-2 |
| **G-4** Biblioteca paramétrica | Rack, cinta, bin, pallet, jaula, puesto, muelle, autoelevador, zorra, en la fábrica `bpy` de C2-4 | Los criterios de C2-4 (delatores, escala ±10%, licencias) | +0,5 sobre C2-4 | C2-4 |
| **G-5** Familia `piso` en el motor | Compilador, recursos, caminatas sobre el grafo, KPI; oráculo SimPy para la familia | Batería: Little y caminata contra cálculo a mano en 10 casos; SimPy coincide en los KPI de 3 modelos; B2 y B3 intactos | 2–3 | G-0, C2-2 |
| **G-6** Verificación e informe | Informe de precisión por zona con las medidas de control | Informe generado solo; error de cada medida de control visible | 0,5 | G-3 |
| **G-7** Formulario y paquete de servicio | Formulario de carga (protocolo, consentimiento, NDA), checklist y entrega | Una persona ajena completa el formulario sin preguntar (prueba con 1 persona, con OK) | 0,5–1 | — |
| **G-I** Integración | Todo de punta a punta en una planta | Los criterios de G-0 a G-7 en verde o con su razón; revisión independiente | 0,5–1 | Todo |
| **Total** | | | **8,5–12** | |

**Orden:** G-0 y G-1 pueden ir con la ola 2a (no dependen del 3D). G-2, G-3 y G-6 después de G-1. G-4 con C2-4 (2b). G-5 después del
oráculo (C2-2). Como en el resto del corte, Andén cede el lugar a Senda y a Hub Nocturno; el comité decide si «2c» va antes o después
de «2b La calle».

### 9.1 Primera entrega: «la piloto, rehecha con el flujo»

- **Qué:** con los mismos insumos de la piloto, en **su repositorio privado**, correr G-1 y G-2 (y lo mínimo de G-3) y comparar contra
  la versión artesanal.
- **Mide:** horas de sesión por paso; porcentaje de imágenes ubicadas sin anotar; diferencia contra las poses manuales; columnas del
  DWG contra la estructura medida por fotos; cuántas observaciones manuales quedan necesarias (hoy 1.188).
- **Éxito:** ≤ 2 sesiones; ≤ 0,5 m de mediana; ≥ 70% menos de observaciones manuales.
- **Límite:** la piloto no tiene medidas de control; la exactitud real se mide recién en la **segunda planta** (con protocolo y control).
- **Costo:** 1–1,5 sesiones; 0 horas del fundador; USD 0.

---

## 10. Lo que tiene que decidir el fundador

| # | Decisión | Recomendación | Cuándo |
|---|---|---|---|
| 1 | Sumar el gemelo de planta a la consulta legal ya pendiente (propiedad intelectual del empleador) | Sí: preguntar si el **método** se puede ofrecer como producto y si los activos hechos en la sesión de la piloto se pueden reusar (por defecto, se rehacen) | Noviembre de 2026 |
| 2 | Segunda planta de prueba **que no sea de su empleador** (un depósito de un conocido, con permiso escrito) | Sí, para medir exactitud con el protocolo y control | Después de la entrega 1 |
| 3 | Medidor láser para el kit de relevamiento | Opcional (USD 30–60); la cinta alcanza | Con la segunda planta |
| 4 | GPU alquilada y cuenta en Hugging Face para VGGT y gaussian splatting | Esperar a la entrega 1; pedirlo solo si COLMAP no alcanza o si se quiere la capa fotográfica | Si aplica |
| 5 | Precio y página de interés del servicio | Después de la segunda planta y de la consulta legal | Comité |

---

## 11. Fuentes

- Repositorio privado de la planta piloto (leído el 15-11-2026, sin copiar datos): `calibracion/LEEME.md`, `calibrar.py`, `poses.json`,
  `anclas.json`, `anot/*.py`; `relevamiento/README.md`; `gemelo/README.md` y `modelo.json` (meta y procedencia); `simulador/README.md`
  y `fuente/motor.js`; `como_se_hizo/documento.html` (10-11-2026).
- Pruebas propias del 15-11-2026 (§2), en una carpeta temporal fuera de los repositorios.
- `apps/anden/simulador/contratos/modelo.ts` y `geometria.ts` (congelados); `oportunidades/proyectos/anden/diseno-maestro.md` §6, §11.3 y
  riesgos; `corte-2-plan.md`; `radar-tecnico.md`.
- COLMAP 4.x y GLOMAP integrado como mapeador global: [radiancefields.com, COLMAP 4.2.0](https://radiancefields.com/colmap-4.2.0-adds-multi-component-global-mapping-and-loma-learned-matching),
  [COLMAP 4.0](https://radiancefields.com/colmap-4.0-introduces-major-performance-and-infrastructure-updates) (secundarias; versión
  instalada verificada en PyPI: pycolmap 4.2.1).
- VGGT comercial: [huggingface.co/facebook/VGGT-1B-Commercial](https://huggingface.co/facebook/VGGT-1B-Commercial).
- MASt3R y DUSt3R, CC BY-NC-SA 4.0: [github.com/naver/mast3r](https://github.com/naver/mast3r), [github.com/naver/dust3r](https://github.com/naver/dust3r).
- Depth Anything 3, licencias por variante: [huggingface.co/depth-anything/DA3-BASE](https://huggingface.co/depth-anything/DA3-BASE/blob/main/README.md).
- SAM 3, licencia propia del 19-11-2025: [huggingface.co/facebook/sam3](https://huggingface.co/facebook/sam3/blob/main/LICENSE).
- Spark (MIT, World Labs): [github.com/sparkjsdev/spark](https://github.com/sparkjsdev/spark); versión 2.4.0 según [radiancefields.com](https://radiancefields.com/spark-2.4.0-reads-spz-v4-files-and-opens-paged-lod-to-custom-fetchers).
- LibreDWG 0.14: [ftp.gnu.org/gnu/libredwg](https://ftp.gnu.org/gnu/libredwg/) (descargado y compilado el 15-11-2026).
- ODA File Converter: [ODA Community User Agreement 09-2025](https://www.opendesign.com/agreements/2025/en/ODA%20Community%20User%20Agreement%2009-2025.pdf).
- RealityScan: [cgchannel.com, RealityScan 2.2 (25-06-2026)](https://www.cgchannel.com/2026/06/epic-games-releases-realityscan-2-2-with-amd-gpu-support/), [radiancefields.com](https://radiancefields.com/platforms/realityscan).
- Polycam (secundario): [skyebrowse.com, Polycam vs Matterport (03-07-2026)](https://www.skyebrowse.com/news/posts/polycam-vs-matterport).
- Costos de escaneo láser y BIM (guías de proveedores, secundario): [arrival3d.com, costos de escaneo 2026](https://arrival3d.com/3d-laser-scanning-costs/),
  [arrival3d.com, scan-to-BIM 2026](https://arrival3d.com/scan-to-bim-cost-guide/).
