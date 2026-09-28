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

## DEC-2026-09-26-6 — El plan: dos motores con tus redes, renta y una compra chica

- **Contexto**: el fundador (27 años, Ing. Industrial, empleado, 6–10 h/semana, USD 400/mes + hasta USD 2.000, anónimo, redes en
  comunidad cristiana y universidad) pidió evaluar todas las alternativas posibles, priorizando plata, pocas horas, diversión, IA y
  nada de venta cara a cara. Se armó el catálogo completo (`oportunidades/catalogo.yaml`, 60 alternativas) con puntaje y simulación.
- **Decisión**: reemplaza a DEC-2026-09-26-5 en lo que respecta a las unidades a construir.
  1. **Motor 1: OP-15 suite cristiana** (EXP-09), desde oct-2026.
  2. **Motor 2: OP-16 Logistic Lab** (EXP-10), desde dic-2026.
  3. **Base: OP-09 renta** (sin cambios) y **OP-08 compra chica de una app con AdMob verificado** entre el mes 6 y el 9 (EXP-08).
  4. **Segunda ola** (desde el mes 9, con el tiempo que liberen los cortes): radar de nichos del Play Store (A10).
  5. **Opcional**: turbo entrenando IA (H1); **palanca aparte**: empleo remoto en USD (H3).
  **En pausa**: OP-12 (fábrica de herramientas) y OP-13 (motos). Siguen en pausa OP-01, 02, 03, 04 y 07.
- **Por qué**: puntajes A1 81 y C1 75 (de 100); simulación del plan (`herramientas/catalogo.py`) con factor de fallo común: ~49% de
  chances de que funcione al menos un motor; si funciona uno, ~USD 2.450/mes al mes 36 (escenario normal); si no funciona ninguno,
  ~USD −3.500 en 3 años. Las horas planificadas quedan en 5,5–10,3 h/semana.
- **Descartado**: marca de hogar con lanzamiento agresivo (capital y horas), apps de productividad con publicidad, comparador
  universal, música IA con vistas compradas, trading, minería y encuestas (ver informe 3, capítulos 7 y 9).
- **Revisar**: hitos de los meses 3, 6, 9 y 12 (informe 3, capítulo 2) o si el fundador cambia horas, capital o preferencia.

## DEC-2026-09-26-7 — Entrenar IA pasa de "turbo" a "boleto"

- **Contexto**: el fundador aplicó a Outlier; le pidieron una evaluación de SQL para habilitar proyectos y casi todo lo que le
  aparece es de programación. Señaló, con razón, que el informe 3 presentaba la alternativa como "aplicar, rendir y trabajar
  2–3 h/semana" sin advertir lo difícil que es entrar.
- **Error reconocido**: el modelo suponía 55% de chances de tareas estables y ~USD 280/mes desde el mes 1. No incorporaba hechos
  conocidos: onboarding sin pago, "cola vacía" habitual aun después de aprobar, salida de OpenAI y Google de Scale AI (dueña de
  Outlier) tras la compra del 49% por Meta en jun-2025, y demanda sesgada a código y expertos senior.
- **Decisión**: H1 pasa a "Solo si…" como boleto opcional: p_exito 0,25, primer ingreso mes 2, ~USD 150/mes si sale
  (`oportunidades/catalogo.yaml#H1`). El peor caso del plan con H1 pasa de +USD 258 a −USD 2.856 (sin H1: −USD 3.494). No se cuenta
  esa plata en el plan hasta tener 4 semanas seguidas de tareas pagas.
- **Propuesta pendiente del fundador**: regla de costo fijo: si al mes 12 no funciona ningún motor, bajar Claude Max (USD 100) al plan
  de USD 20. Ahorra ~USD 1.900 en el peor caso, con certeza (24 meses × USD 80).
- **Fuentes**: `conocimiento/2026-09-26-entrenar-ia-realidad.md`.
- **Revisar**: a las 6 semanas de aplicar (corte de H1).

## DEC-2026-09-26-8 — Fábrica de réplicas, roadmap para cada alternativa y "así no → mejor así"

- **Contexto**: el fundador pidió (26-09-2026) que sus ejemplos se usen como orientación para barrer el espectro por iniciativa
  propia (no esperar a que traiga cada idea), que se consideren como alternativas los activos de Flippa y similares que se puedan
  replicar y crecer con difusión propia, que se cubran todas sus ideas, que cada opción tenga roadmap y que no se descarte por
  descartar, teniendo en cuenta lo que Claude puede construir hoy.
- **Decisión**:
  1. **Nueva familia "Replicar lo que ya funciona"** (R1–R11) en `oportunidades/catalogo.yaml`: juegos web en portales, juego
     diario compartible, Roblox, directorio de nicho, plantillas para iglesias, libros de nicho, microaprendizaje en español, apps
     en ChatGPT y Claude, apps para Tiendanube, extensión para vendedores de MeLi y simuladores de exámenes. Total: 72 alternativas.
  2. **A10 pasa a "Fábrica de réplicas"**: radar en segundo plano (solo Claude) desde el mes 3 y un producto por trimestre desde el
     mes 9, en el canal donde la demanda ya existe (Play Store, Chrome, portales de juegos, Apify). Primer candidato natural: un juego
     web en portales (R1), que además prueba barato el tycoon de logística (A2 ahora arranca en portales web).
  3. **Multiplicadores sin horas extra**: C1 sale también como plantillas (C3), app en ChatGPT (R8) y herramienta para agentes (C4);
     A1 suma imágenes para compartir (A14), juego diario (R2) y videos sin cara (D5). No se cuentan en la simulación del plan.
  4. **Roadmap de 26 semanas y regla de corte para cada alternativa viable** (58); las trampas indican qué hacer en su lugar y las
     pausadas qué las reactivaría. El veredicto "No" pasa a mostrarse como **"Así no"** con la mejor versión y su roadmap.
  5. **Mapa de las 22 ideas del fundador** (`ideas:` en el catálogo): qué entendimos, espectro abierto y mejor versión.
- **Sin cambios**: motores A1 y C1, renta G1, compra F1; plan de horas 5,5–10,3 h/semana; simulación del plan igual (A10 ya estaba).
- **Por qué**: construir dejó de ser el cuello de botella; lo escaso es elegir nicho, la difusión y las horas del fundador. Los
  activos de Flippa que crecen sin publicidad comparten patrón (tarea concreta, demanda por búsqueda o marketplace, costo por usuario
  casi cero, llegada temprana). Se replica el tipo de producto y el canal, no una app puntual (sesgo de supervivencia).
- **Fuentes**: `conocimiento/2026-09-26-replicables-y-espectro.md`.
- **Revisar**: mes 9 (lanzamiento de la fábrica) o antes si se habilita el acceso de red a play.google.com, chromewebstore y flippa.

## DEC-2026-09-28-1 — El holding: nueve proyectos definidos, plan a 2030 y backlog viable

- **Contexto**: el fundador pidió (28-09-2026) una versión nueva del informe donde cada iniciativa que sobrevivió al filtro quede
  definida como proyecto de verdad (qué, cómo, cuándo, para qué, alcance, misión, visión, objetivos, metodología, roadmap, gantt,
  desarrollo, difusión y contenido), con nombres que peguen, difusión a costo cero y sin cara en todas sus formas, el método de
  mirar lo que ya funciona (MercadoLibre → eBay), un diferencial extraordinario por proyecto, un campo nuevo (Municipio y Estado),
  patentes, un gantt a 2030 en hoja grande, casos de negocio a 5 años por proyecto y un backlog con las ideas secundarias en su
  versión viable. Todo como aprendizaje permanente (`doctrina/08-formas-de-pensar.md`).
- **Decisión**: reemplaza a DEC-2026-09-26-6 y DEC-2026-09-26-8 en lo que respecta a qué se construye y cuándo.
  1. **Nueve proyectos** (`oportunidades/proyectos/P1–P9`): **Senda** (suite cristiana, OP-15/A1, oct-2026, publicada antes del
     1 de enero), **Andén** (Logistic Lab, OP-16/C1, dic-2026), **Cimiento** (renta, OP-09/G1), **Adopción** (compra de una app o
     juego, OP-08/F1, julio de 2027, hasta USD 2.000–2.500 del ahorro), **Palanca Apps** (fábrica, A10: Todo Bien jul-2027, Rutea
     oct-2027, Me Toca mar-2028, De Turno jun-2028 y un producto por trimestre desde oct-2028), **Carpincho Games** (juegos web, R1:
     Hub Rush sep-2027, Última Milla Tycoon feb-2028, Palabras Vivas may-2028), **Posta** (alquileres con aviso anticipado, A8,
     construcción oct-2027 y temporada ene-2028), **Sobremesa** (música funcional, D9, oct-2027) y **Remanso** (música instrumental,
     D4, abr-2027).
  2. **Holding**: nombre recomendado Palanca (alternativas Brote, Nido, Ceibo); empresa (LLC o SAS) en febrero de 2027 antes de
     activar cobros; marcas en el INPI por tandas (mar-2027 y nov-2027); patentes solo si aparece una invención técnica que factura.
  3. **Claude**: Pro hasta diciembre de 2026; Max 5x desde enero de 2027 si en diciembre Senda está lista y Andén arranca; regla de
     ahorro: si a mediados de 2028 los proyectos no cubren los costos fijos, se vuelve a Pro.
  4. **Municipio y Estado** (familia nueva del catálogo, M1–M6): Todo Bien, Me Toca y De Turno van a la fábrica; Andén Ciudad (M2)
     se presenta a convocatorias de innovación desde mediados de 2027; la red vecinal (M5) solo con un municipio piloto; vender
     software a municipios (M6), no.
  5. **Fuera del plan**: entrenar IA (H1, queda un boleto opcional de 1 hora en Userlytics o UserTesting) y las horas en dólares
     (H2 en pausa; H3 palanca personal fuera del holding).
  6. **Backlog** (`oportunidades/backlog.yaml`): 38 ideas con versión viable, destino y disparador; 7 secundarias (plantillas para
     iglesias, libros de nicho, ofertas reales, simuladores de exámenes, extensión para vendedores de MeLi, academia para
     estudiantes, prode del Mundial 2030) entran de a una desde septiembre de 2028 con las horas que liberen los cortes.
- **Por qué** (`herramientas/holding.py`, 4.000 futuros, oct-2026 → sep-2031, con falla común de 18% y factor común de ejecución):
  79% de chances de que funcione al menos un proyecto principal; ingreso neto esperado del holding a fin de 2027 USD 103/mes
  (mediana −75; 2027 es de construcción), a fin de 2028 USD 1.533/mes (mediana 1.007; 50% de chances de pasar USD 1.000) y a fin de
  2030 USD 6.541/mes (mediana 4.683; rango probable −17 a 16.188). Peor caso razonable a 3 años: poner USD 8.745 de más (costos
  fijos, empresa, marcas y la app comprada). Renta: USD 55.501 de capital a fin de 2030 (mediana). Horas del plan base: 9,1 por
  semana en 2027, nunca más de 9,8. Todo es ESTIMACIÓN con supuestos escritos en cada ficha.
- **Descartado o postergado**: comprar publicidad para traer usuarios (una instalación cuesta más de lo que deja; se revisa cuando
  un producto demuestre lo contrario), vender software al Estado, entrenar IA como ingreso del plan.
- **Fuentes**: siete bitácoras `conocimiento/2026-09-28-*.md`; informe `informes/2026-09-el-holding-v3.pdf`.
- **Revisar**: diciembre de 2026 (Claude Max y empresa), abril de 2027 (corte de Senda), julio de 2027 (compra y fábrica),
  septiembre de 2027 (corte de Andén) y el comité anual de cada diciembre.
