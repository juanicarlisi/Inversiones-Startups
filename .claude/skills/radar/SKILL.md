---
name: radar
description: Barrido semanal de señales - recorre las lentes de descubrimiento, registra señales fechadas con fuente, revisa disparadores de vigilancia y propone como máximo 2 oportunidades nuevas. Usar cuando el fundador pida /radar, "qué hay de nuevo", o en la rutina semanal.
---
# /radar — barrido de señales

1. Leé `radar/vigilancia.md`, las últimas 20 filas de `radar/senales.md` y `radar/contexto-macro.md` (para no repetir).
2. Lanzá en paralelo (herramienta Agent) al `explorador` y al `analista-regulatorio`, cada uno con foco explícito:
   - explorador: lentes 2–12 de `doctrina/04-lentes-de-descubrimiento.md`, período = desde la última fecha registrada.
   - analista-regulatorio: Boletín Oficial, ARCA, CNV, BCRA, legislaturas (San Juan, Neuquén, Río Negro, CABA) y normas extranjeras
     que afectan a Argentina (UE, EE.UU.).
3. Consolidá: agregá filas a `radar/senales.md` (IDs `SEN-AAAA-MM-n`), actualizá `radar/mapa-regulatorio.md` y el estado de cada
   disparador en `radar/vigilancia.md`. Si un disparador se activó, marcá la ficha vinculada y anotalo para el próximo `/comite`.
4. Si cambió un dato macro clave (IPC, dólar, riesgo país, Brent), actualizá `radar/contexto-macro.md` con fecha.
5. Proponé como máximo 2 oportunidades nuevas (una oración cada una) y preguntá si abrir ficha con `/oportunidad`.
6. Opcional: redactá la edición semanal de OP-07 ("qué cambió y qué hacer") en `unidades/OP-07/ediciones/AAAA-MM-DD.md`.
7. Commit: `radar: barrido AAAA-MM-DD`.

Reglas: fuente y fecha en todo; contrastar resúmenes de buscador; nada de listas infladas.
