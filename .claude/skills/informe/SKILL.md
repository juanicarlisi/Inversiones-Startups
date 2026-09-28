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
7. Informe 3 v3 (`informes/fuente-plan-v3/`, `python3 informes/construir_plan_v3.py`): el holding. Las fichas de proyecto, el
   gantt grande, el plan mes a mes y las tablas de plata salen de `oportunidades/proyectos/*.yaml`, `oportunidades/backlog.yaml` y
   `herramientas/holding.py`; los capítulos en markdown solo tienen texto y marcadores (`{{v:...}}` para números, `{{cap:NN}}` o
   `{{cap:P1}}` para referencias a capítulos, que se numeran solos). La hoja A3 apaisada usa una página con nombre
   (`@page grande`) y se imprime con `node informes/imprimir_pdf.cjs ... css` (tamaño y márgenes desde el CSS). Revisar que la hoja
   A3 entre en una sola página y que ninguna tabla chica quede partida.
