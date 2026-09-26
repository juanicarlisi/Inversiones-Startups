---
name: oportunidad
description: Triage de 30 minutos de una idea o señal para decidir si hay negocio; crea una ficha OP-XX con frontmatter o la manda al cementerio con la razón. Usar cuando el fundador traiga una idea ("se me ocurrió...") o una señal merezca ficha.
---
# /oportunidad <idea o señal>

1. Reformulá la idea como **problema pagado**: quién sufre qué, cuánto le cuesta, qué usa hoy.
2. Respondé las 7 preguntas de triage de `doctrina/01-marco-de-evaluacion.md` §2 con búsquedas rápidas (fuentes y fechas).
3. Evaluá sin complacencia, incluso si la idea es del fundador: ¿replica algo gratuito? ¿hay economía? ¿qué la hace posible ahora?
   Si la idea original no tiene economía pero hay una versión que sí, proponé la reformulación (ver OP-04 y OP-05 como ejemplos).
4. Decisión:
   - **Hay algo** → crear `oportunidades/OP-XX-<slug>.md` desde `_plantilla.md` con estado `explorar`, puntajes iniciales,
     gates, escenarios y próximo paso. Correr `python3 herramientas/oportunidades.py`.
   - **No hay negocio** → agregar fila a `oportunidades/descartadas.md` con la razón y qué la revive.
   - **Es una señal** → fila en `radar/senales.md`.
5. Respondé al fundador en 5–10 líneas: veredicto, por qué, y el experimento más barato si corresponde.
