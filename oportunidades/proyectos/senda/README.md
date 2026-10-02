# Senda · proyecto completo (P1)

Fuente del proyecto completo de la app cristiana del holding. Versión 2 del 02-10-2026 (DEC-2026-10-02-1), que integra las 30
correcciones del fundador sobre la v1 del 30-09-2026 (DEC-2026-09-30-1). El PDF y el HTML se generan con
`python3 informes/construir_senda.py` → `informes/2026-10-senda-proyecto-v2.pdf` y `.html` (la v1 queda en
`informes/2026-09-senda-proyecto.pdf`).

| Archivo | Qué tiene |
|---|---|
| `capitulos/00-como-leer.md` | Cómo leer el documento y la tabla «tu corrección → dónde se resolvió» |
| `capitulos/01…30-*.md` | Un capítulo por archivo; el número del archivo es el número del capítulo |
| `capitulos/90-anexo.md` | Glosario, eventos de analítica y fuentes |
| `roadmap.yaml` | Fases F0–F10 (hipótesis, entregables, condición para seguir), tareas por carril y responsable, hitos y vista 2026–2030 |
| `presupuesto.yaml` | Menú de calidad del primer año: tres niveles (básico, profesional, premium), impacto y tramo de cada gasto |
| `economia.yaml` | Vidas, comodines, monedas, ganar y gastar, planes y precios, y los supuestos de la proyección de ingresos |

Visuales: `informes/senda_visual.py` (paleta B, íconos propios, Lani v2, piezas de la armadura, vehículos, logo) e
`informes/senda_pantallas.py` (pantallas de ejemplo y bloques gráficos). Tipografías libres (SIL OFL) en `informes/tipografia/`.

Marcadores que reemplaza el generador dentro de los capítulos: `{{cap:NN}}` (número de capítulo), `{{GRAF:uso|descargas}}`,
`{{MOCK:inicio|travesia|espadeo|reunion|calendario}}` y los bloques `{{RESUMEN}}`, `{{MAPA_APP}}`, `{{BUCLES}}`, `{{RUTAS}}`,
`{{ARMADURA}}`, `{{STORYBOARD_ARMADURA}}`, `{{LIGA}}`, `{{SEMANA}}`, `{{LANI}}`, `{{LANI_REACCIONES}}`, `{{ECONOMIA_MAPA}}`,
`{{ECONOMIA}}`, `{{TU_LANI}}`, `{{PALETAS}}`, `{{PALETA}}`, `{{MOCKS_UX}}`, `{{LOGO}}`, `{{SHARE}}`, `{{PLANES}}`, `{{PROYECCION}}`,
`{{PROYECCION_CORTA}}`, `{{ARQUITECTURA}}`, `{{PRESUPUESTO}}`, `{{TRAMOS}}`, `{{FASES}}`, `{{GANTT_DETALLE}}` (hoja A3) y
`{{GANTT_GENERAL}}`.

Reglas:

- Cambiar fechas o tareas en `roadmap.yaml`, montos en `presupuesto.yaml` y planes o supuestos en `economia.yaml`, no en el texto:
  las tablas, la proyección y el gantt salen de ahí.
- La ficha resumida del proyecto sigue en `../P1-senda.yaml` (la usa el modelo del holding). Si difieren, manda este proyecto; los
  precios del caso de negocio del holding se ajustan en el próximo comité.
- Los hechos llevan fuente y fecha en `conocimiento/2026-10-02-senda-v2-investigacion.md`,
  `conocimiento/2026-09-30-proyecto-senda-investigacion.md` y las bitácoras del 28-09-2026.
- Nada que mueva plata o hable con terceros se ejecuta sin aprobación del fundador (regla 8).
