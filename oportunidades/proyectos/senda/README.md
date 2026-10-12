# Senda · proyecto completo (P1)

Fuente del proyecto completo de la app cristiana del holding. Versión 3.2 del 12-10-2026 (DEC-2026-10-12-1: la prueba 10, amplitud,
trivia de la iglesia, misión nueva, inventario bíblico y el capítulo 35), sobre la 3.1 del 11-10-2026 (DEC-2026-10-11-2: todo enseña y edifica,
la Biblia directa, la investigación de lo que cuesta entender y el capítulo 34), sobre la 3 del mismo día (DEC-2026-10-11-1: las ocho
pruebas, el mapa de toda la app, Lani en 3D, Senda Fiesta y el capítulo 33), la 2.1 del 05-10-2026 (DEC-2026-10-05-1), la v2 del
02-10-2026 (DEC-2026-10-02-1) y la v1 del 30-09-2026 (DEC-2026-09-30-1). El PDF y el HTML se generan con
`python3 informes/construir_senda.py` → `informes/2026-10-senda-proyecto-v3-2.pdf` y `.html` (quedan la v3.1 en
`informes/2026-10-senda-proyecto-v3-1.pdf`, la v3 en
`informes/2026-10-senda-proyecto-v3.pdf`, la v2 en `informes/2026-10-senda-proyecto-v2.pdf` y la v1 en
`informes/2026-09-senda-proyecto.pdf`). El armador normaliza las listas anidadas con 2 espacios (Python-Markdown pide 4).

| Archivo | Qué tiene |
|---|---|
| `capitulos/00-como-leer.md` | Cómo leer el documento y la tabla «tu corrección → dónde se resolvió» |
| `capitulos/01…35-*.md` | Un capítulo por archivo; el número del archivo es el número del capítulo (el 32, la Consola, se sumó el 05-10-2026; el 33, el desarrollo, y el 34, lo que cuesta entender, el 11-10-2026; el 35, la prueba 10, el 12-10-2026) |
| `capitulos/90-anexo.md` | Glosario, eventos de analítica y fuentes |
| `roadmap.yaml` | Fases F0–F10 (hipótesis, entregables, condición para seguir), tareas por carril y responsable, hitos y vista 2026–2030 |
| `presupuesto.yaml` | Menú de calidad del primer año: tres niveles (básico, profesional, premium), impacto y tramo de cada gasto |
| `economia.yaml` | Vidas, comodines, monedas, ganar y gastar, planes y precios, y los supuestos de la proyección de ingresos |
| `estado.yaml` | **Estado vivo del proyecto** (avance por área, pendientes del fundador, alertas): lo actualiza Claude al cerrar cada sesión y lo muestra la Consola de Senda |
| `mapa_total.yaml` | **Toda la app en una hoja (MECE)**: las cinco pestañas y el perfil, los sistemas y la operación, con la etapa de cada función. Lo usan la hoja A3 del capítulo 6 y la pestaña «Mapa de la app» de la Consola; al cerrar cada sesión, Claude pasa a «hecho» lo que ya funciona |
| `inventario_biblico.yaml` | **Inventario bíblico** (prueba 10): personaje por personaje e historia por historia, dónde están, qué enseñan, qué crear y qué revisar. Fuente editable; se completa en cada sesión |
| `inventario_cobertura.md` | **Generado** por `python3 herramientas/inventario_senda.py`: cuánto de cada personaje e historia ya está en la app |
| `licencias.yaml` | Titulares de las versiones protestantes, camino, contacto y borrador de cada pedido (pestaña Licencias de la Consola) |

Visuales: `informes/senda_visual.py` (paleta B, íconos propios, Lani v2, piezas de la armadura, vehículos, logo),
`informes/senda_pantallas.py` (pantallas de ejemplo y bloques gráficos) e `informes/senda_mapas.py` (v3: el mapa de toda la app
en A3, el tablero de Senda Fiesta, las capturas de Lani 3D y el estado del desarrollo). Tipografías libres (SIL OFL) en `informes/tipografia/`.

Marcadores que reemplaza el generador dentro de los capítulos: `{{cap:NN}}` (número de capítulo), `{{GRAF:uso|descargas}}`,
`{{MOCK:inicio|travesia|espadeo|reunion|calendario}}` y los bloques `{{RESUMEN}}`, `{{MAPA_APP}}`, `{{BUCLES}}`, `{{RUTAS}}`,
`{{ARMADURA}}`, `{{STORYBOARD_ARMADURA}}`, `{{LIGA}}`, `{{SEMANA}}`, `{{LANI}}`, `{{LANI_REACCIONES}}`, `{{ECONOMIA_MAPA}}`,
`{{ECONOMIA}}`, `{{TU_LANI}}`, `{{PALETAS}}`, `{{PALETA}}`, `{{MOCKS_UX}}`, `{{LOGO}}`, `{{SHARE}}`, `{{PLANES}}`, `{{PROYECCION}}`,
`{{PROYECCION_CORTA}}`, `{{ARQUITECTURA}}`, `{{PRESUPUESTO}}`, `{{TRAMOS}}`, `{{FASES}}`, `{{GANTT_DETALLE}}` (hoja A3) y
`{{GANTT_GENERAL}}`, y desde la v3 `{{MAPA_TOTAL}}` (hoja A3), `{{FIESTA_TABLERO}}`, `{{LANI_3D}}` y `{{ESTADO}}`.

El código de la app está en el repositorio `juanicarlisi/senda-app`. Borradores de pedidos a terceros (requieren aprobación): `borradores/`.
La **Consola de Senda** (capítulo 32; https://claude.ai/artifact/42zkxKvQh6RD3RZXDgztmR) se arma con `python3 scripts/consola.py --holding <este repositorio>` desde el repositorio de la
app y se publica como página privada; lo que el fundador marca ahí (pendientes, licencias, propuestas, sonidos) se lee al empezar
cada sesión.

Reglas:

- Cambiar fechas o tareas en `roadmap.yaml`, montos en `presupuesto.yaml` y planes o supuestos en `economia.yaml`, no en el texto:
  las tablas, la proyección y el gantt salen de ahí.
- La ficha resumida del proyecto sigue en `../P1-senda.yaml` (la usa el modelo del holding). Si difieren, manda este proyecto; los
  precios del caso de negocio del holding se ajustan en el próximo comité.
- Los hechos llevan fuente y fecha en `conocimiento/2026-10-02-senda-v2-investigacion.md`,
  `conocimiento/2026-09-30-proyecto-senda-investigacion.md` y las bitácoras del 28-09-2026.
- Nada que mueva plata o hable con terceros se ejecuta sin aprobación del fundador (regla 8).
