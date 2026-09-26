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
5. Informes temáticos: cada uno tiene su carpeta fuente y su generador. Hoy existe `informes/fuente-ingresos/` →
   `python3 informes/construir_ingresos_sin_vender.py`, que además escribe un HTML autocontenido (gráficos incrustados) junto al
   PDF. Para un informe temático nuevo, copiar ese generador (reutiliza el CSS del principal) y su carpeta de capítulos.
6. Informe 3 (`informes/fuente-informe3/`, `python3 informes/construir_informe3.py`) es la referencia de estilo que pidió el
   fundador: recomendación en la primera página, cronograma, plata en escenarios con chances, fichas con tarjetas, sin jerga. Los
   bloques visuales salen de `oportunidades/catalogo.yaml`; los números del texto usan marcadores `{{v:...}}`. Cada alternativa
   tiene `ruta` (roadmap de 26 semanas) o `gantt` (fichas con detalle) y `corte`; el capítulo de ideas sale de `ideas:`. El índice
   se pagina solo (dos pasadas de impresión). Revisar página por página: títulos huérfanos, fichas que desbordan, etiquetas del mapa.
