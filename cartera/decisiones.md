# Registro de decisiones

> Formato: `DEC-AAAA-MM-DD-n` · decisión · por qué · alternativas descartadas · qué la revisaría. Las decisiones no se borran; se
> reemplazan con una nueva que las cite.

## DEC-2026-09-26-1 — Arquitectura del sistema

- **Decisión**: el sistema vive en este repositorio: doctrina (cómo pensamos), radar (qué cambia), fichas con frontmatter
  (qué evaluamos), modelos de escenarios (cómo cuantificamos), cartera (qué decidimos y cuánto capital), agentes y rutinas de Claude
  Code (quién hace qué), y un tablero generado.
- **Por qué**: memoria acumulativa, trazabilidad de supuestos y decisiones, y ejecución por IA sin depender de una conversación.
- **Descartado**: una base de datos o app propia (sobreingeniería para esta etapa); documentos sueltos sin estructura (no comparan).
- **Revisar si**: el volumen de señales o fichas vuelve lento el trabajo con archivos (→ base de datos o artifact con estado).

## DEC-2026-09-26-2 — Primeras validaciones

- **Decisión**: validar en paralelo OP-01 (consorcios con IA), OP-02 (oficina IA para transportistas) y OP-04 (laboratorio de
  decisiones logísticas); OP-07 (medio vertical) como infraestructura con pocas horas; OP-03 (maquinaria usada) solo ante un pedido real.
- **Por qué**: IVR ≈ 1,9–2,2 y puntajes 70–78; capital mínimo; aprendizaje en ≤ 30 días; dos de ellas explotan el conocimiento
  logístico del fundador y una su residencia en CABA; la diversificación de experimentos reduce la probabilidad de que ninguna funcione.
- **Descartado por ahora**: OP-05 (marca matera; economía fina y capital de trabajo alto), OP-06 (sin red en San Juan), OP-08/10/11
  (capital, fase 2).
- **Revisar si**: el fundador informa menos de 8 h/semana disponibles (→ priorizar OP-07 + OP-04) o una red específica que cambie el orden.

## DEC-2026-09-26-3 — Evaluación de ideas aportadas por el fundador

- **Decisión**: la campaña de 6 meses de precio regalado en mates/termos/bombillas **no se hace** (K11); la app genérica de simulación
  **no se construye** sin cliente (K12). Se reformulan en OP-05 (versión premium exportable, en espera) y OP-04 (vender decisiones).
- **Por qué**: modelo `op05b` → costo P50 ≈ USD 20.000 y valor neto base negativo; el valor depende de un supuesto (ranking) que se
  puede testear con USD 500–1.000. En simulación, el riesgo no es el costo de Claude Max sino construir sin cliente.
- **Revisar si**: aparece una ventaja específica (proveedor exclusivo, canal, cliente ancla).

## DEC-2026-09-26-4 — Plan de IA

- **Decisión**: Claude Max 5x (USD 100/mes) desde el inicio; Max 20x solo en sprints de construcción de una unidad validada.
- **Por qué**: se paga con ≥ 10 h/mes ahorradas; el sistema entero (radar, modelos, contenido, herramientas de cada experimento)
  depende de uso intensivo.
- **Revisar**: mensualmente en `/revision` (horas ahorradas vs costo).

## DEC-2026-09-26-5 — Reorientación: ingresos sin salir a vender

- **Contexto**: el fundador pidió explícitamente ingresos "pasivos o casi pasivos, sin tener que salir a vender", con horizonte de
  hasta un año para ver resultados (26-09-2026). Aclaró además que sus ejemplos (IA de trading, minería, "cosas con IA") son
  orientativos, no candidatos a analizar.
- **Decisión**: reemplaza a DEC-2026-09-26-2. La fase 0 pasa a tres motores que no dependen de vender:
  1. **OP-09 motor de renta** (tesorería en USD): opera desde el primer aporte.
  2. **OP-12 fábrica de herramientas** (validar, EXP-07): USD 50/mes atribuibles, corte al mes 9.
  3. **OP-08 compra de micro-negocios que ya venden** (validar sin capital, EXP-08): primera compra chica entre el mes 6 y el 12.
  Satélite a explorar: **OP-13** motos con operador (solo con operador verificable). Radar: **OP-14** (graduación desde OP-12).
  **En pausa**: OP-01, OP-02, OP-03, OP-04 y OP-07, porque requieren vender (o construir audiencia). No se descartan: reviven si el
  fundador decide vender o aparece un socio que venda por él.
- **Por qué**: simulación `cartera/plan-sin-venta-resultados.md` (10.000 escenarios, 60 meses, USD 400/mes): ingreso pasivo
  mediano ~USD 150/mes al mes 12, ~340 al mes 24 y ~600 al mes 60 (vs 24 / 53 / 150 con solo tesorería); el patrimonio supera al de
  solo tesorería en ~2 de cada 3 escenarios. Las alternativas "pasivas" típicas (trading con IA, minería, GPU, contenido masivo,
  rendimientos cripto altos) se descartan con números (K18–K26).
- **Descartado**: seguir con las validaciones de servicios (contradice la preferencia expresa); poner todo en tesorería (seguro
  pero lento: ~USD 150/mes de renta al año 5).
- **Revisar si**: el fundador informa ahorros disponibles (acelera la primera compra), cambia su postura sobre vender, o EXP-07 /
  EXP-08 llegan a sus umbrales.
