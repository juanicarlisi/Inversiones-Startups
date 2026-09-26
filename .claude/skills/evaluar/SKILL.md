---
name: evaluar
description: Due diligence completa de una oportunidad con el equipo en paralelo (mercado, regulación, CFO, growth, red team), modelo de escenarios y veredicto. Usar antes de pasar una ficha a validar/construir o de asignar más de USD 500.
---
# /evaluar OP-XX

1. Leé la ficha, su modelo y experimentos previos.
2. Lanzá en paralelo con la herramienta Agent: `analista-mercado`, `analista-regulatorio` (si hay normas involucradas), `cfo`,
   `growth`. Cada uno recibe la ficha y la pregunta concreta que debe responder.
3. Con sus resultados, lanzá al `abogado-del-diablo` con la tesis actualizada.
4. Integrá en la ficha (secciones 3–14 de la plantilla), actualizá puntajes, gates, escenarios, capital por tramos y próximo paso.
   Todo con etiquetas HECHO/ESTIMACIÓN/HIPÓTESIS/INFERENCIA.
5. Corré `python3 herramientas/escenarios.py <modelo> --md ... --png ...` y `python3 herramientas/oportunidades.py`.
6. Veredicto en la sección 15: validar / construir / pausar / reformular / descartar, con la condición que lo cambiaría.
7. Registrá la decisión en `cartera/decisiones.md` si implica capital o cambio de estado. Commit.
