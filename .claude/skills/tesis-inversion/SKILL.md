---
name: tesis-inversion
description: Arma una tesis de inversión estructurada para un activo financiero o real (acción, bono, ON, CEDEAR, inmueble, activo productivo) con hechos fechados, escenarios, reglas de salida y encaje en cartera. Usar con /tesis-inversion <activo>.
---
# /tesis-inversion <activo>

1. Lanzá al `analista-inversiones` con el activo y el contexto de `radar/contexto-macro.md`.
2. Pedí hechos verificados y fechados (precio, múltiplos, deuda, flujo, guía, catalizadores) y re-verificación de precios.
3. Escenarios con la variable clave y su sensibilidad; qué mata la tesis; tamaño máximo; precio/condición de salida; horizonte.
4. Encaje: rol (cobertura, renta, opción), correlación con unidades, riesgo 2027, liquidez.
5. Guardá en `oportunidades/` (si es una tesis nueva, como ficha OP-XX con estado `inversion`) o como sección de OP-09.
6. Recordá: análisis para decisión propia, no asesoramiento financiero regulado. Nada se compra sin aprobación del fundador.
