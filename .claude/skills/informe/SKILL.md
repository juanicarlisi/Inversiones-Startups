---
name: informe
description: Regenera el informe estratégico en PDF con el estado actual del sistema (contexto, señales, oportunidades, cartera). Usar con /informe o trimestralmente.
---
# /informe

1. Asegurá datos frescos: `python3 herramientas/escenarios.py --todos`, `python3 herramientas/oportunidades.py`,
   `python3 herramientas/cartera.py proyectar --md cartera/proyeccion-resultados.md --png cartera/proyeccion.png`.
2. Actualizá el contenido fuente en `informes/fuente/` (markdown por capítulo) con lo que cambió desde el último informe.
3. `python3 informes/construir_informe.py` genera HTML y PDF (Chromium vía Playwright) en `informes/`.
4. Revisá el PDF (páginas, gráficos, tablas) y commit con el nombre `informes/AAAA-MM-<titulo>.pdf`.
