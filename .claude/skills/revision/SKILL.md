---
name: revision
description: Revisión mensual de la operación - libro de capital, métricas de unidades, costo y rendimiento de la palanca IA, aprendizajes y fichas vencidas. Usar a fin de mes antes del /comite o cuando el fundador pida un estado.
---
# /revision

1. Pedí/registrá movimientos del mes en `cartera/libro-capital.csv` (fecha,tipo,balde,unidad,monto_usd,nota).
2. `python3 herramientas/cartera.py resumen`.
3. Métricas por unidad activa: clientes, ingresos, margen, CAC, churn, horas del fundador por cliente.
4. Palanca IA (`doctrina/05` §8): costo total de IA, horas ahorradas estimadas, % de tareas automatizadas, errores. ¿Se mantiene el plan?
5. Fichas vencidas (> 90 días sin revisión) según `TABLERO.md`.
6. Aprendizajes del mes (qué creíamos, qué resultó) → sección de la ficha correspondiente.
7. Informe breve en `cartera/revisiones/AAAA-MM.md` y commit.
