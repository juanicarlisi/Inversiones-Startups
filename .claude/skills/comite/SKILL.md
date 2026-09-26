---
name: comite
description: Comité de inversión mensual - revisa experimentos y unidades, compara todo contra todo y contra la tesorería, y decide asignación de capital y atención del mes. Usar con /comite o a fin de mes.
---
# /comite

1. Regenerá el tablero: `python3 herramientas/oportunidades.py`. Resumen de capital: `python3 herramientas/cartera.py resumen`.
2. Lanzá al agente `asignador` con: `cartera/cartera.yaml`, `cartera/decisiones.md`, `TABLERO.md`, experimentos en curso,
   disparadores activados en `radar/vigilancia.md`.
3. Para cada experimento/unidad: resultado vs umbrales → acelerar / mantener / iterar / pausar / matar.
4. Asignación del mes: presupuesto por balde (tesorería, herramientas, validación, construcción, opciones) y horas del fundador por
   unidad. Máximo 3 validaciones que consuman horas.
5. Si hubo datos reales, actualizar escenarios de las fichas y re-correr `herramientas/cartera.py proyectar`.
6. Registrar decisiones (DEC) y actualizar `cartera/cartera.yaml`. Commit `comite: AAAA-MM`.
7. Mensaje al fundador: 5 líneas con decisiones y las 3 acciones del mes que le tocan a él.
