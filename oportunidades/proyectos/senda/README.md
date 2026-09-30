# Senda · proyecto completo (P1)

Fuente del proyecto completo de la app cristiana del holding (DEC-2026-09-30-1). El PDF y el HTML se generan con
`python3 informes/construir_senda.py` → `informes/2026-09-senda-proyecto.pdf` y `.html`.

| Archivo | Qué tiene |
|---|---|
| `capitulos/00-como-leer.md` | Cómo leer el documento y el mapa «tu pedido → capítulo» |
| `capitulos/01…27-*.md` | Un capítulo por archivo; el número del archivo es el número del capítulo |
| `capitulos/90-anexo.md` | Glosario, eventos de analítica y fuentes |
| `roadmap.yaml` | Fases F0–F10 (hipótesis, entregables, condición para seguir), tareas por carril y responsable, hitos y vista 2026–2030 |
| `presupuesto.yaml` | Gastos únicos del primer año en tres niveles (mínimo, recomendado, ideal) y el tramo en que se pagan |

Marcadores que reemplaza el generador dentro de los capítulos: `{{cap:NN}}` (número de capítulo), `{{GRAF:uso|descargas}}`,
`{{MOCK:camino|espadeo}}` y los bloques `{{RESUMEN}}`, `{{MAPA_APP}}`, `{{BUCLES}}`, `{{ARMADURA}}`, `{{LANI}}`, `{{PALETA}}`,
`{{LOGO}}`, `{{ARQUITECTURA}}`, `{{PRESUPUESTO}}`, `{{TRAMOS}}`, `{{FASES}}`, `{{GANTT_DETALLE}}` (hoja A3), `{{GANTT_GENERAL}}` y
`{{MOCKS_UX}}`.

Reglas:

- Cambiar fechas o tareas en `roadmap.yaml` y montos en `presupuesto.yaml`, no en el texto: las tablas y el gantt salen de ahí.
- La ficha resumida del proyecto sigue en `../P1-senda.yaml` (la usa el modelo del holding). Si difieren, manda este proyecto; los
  precios del caso de negocio del holding se ajustan en el próximo comité.
- Los hechos llevan fuente y fecha en `conocimiento/2026-09-30-proyecto-senda-investigacion.md` y en las bitácoras del 28-09-2026.
- Nada que mueva plata o hable con terceros se ejecuta sin aprobación del fundador (regla 8).
