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

## DEC-2026-09-30-1 — Senda: el proyecto completo de la app y el camino por fases con la app publicada

- **Contexto**: el fundador pidió (30-09-2026) el proyecto completo de la app cristiana (P1): definición (misión, visión, objetivos,
  descripción), alcance internacional (app primero, web después), todos los módulos con nombres (trivia tipo Preguntados con la
  lógica del espadeo, camino tipo Duolingo con mascota, Biblia gratis con versiones, audio y comentarios detrás de un «+», Dibujalo,
  Tutti Frutti y demás juegos), gamificación al servicio de edificar, perfil y conexión entre hermanos, UX/UI como prioridad, marca,
  merch y sorteos, contenido libre, monetización (videos opcionales, suscripción barata, plan para líderes), marco teórico,
  newsletter y eventos, tecnología y escalabilidad, benchmark, roadmap con metodología MVP y publicación por fases, y patentes.
- **Decisión** (propuesta; las 12 decisiones del capítulo 27 quedan para el fundador):
  1. **Producto**: cinco pestañas (Inicio, Biblia, Camino, Jugar, Comunidad). Espadeo con la **armadura de Dios** (6 piezas de
     Efesios 6 = 6 categorías), Camino de 13 secciones, Biblia sin publicidad con Nueva Biblia Viva (abierta) por defecto y RVR1909,
     la **Lámpara** (racha con rayitos, día de reposo, aceite) como única mecánica dentro de la Biblia, **Senda Reunión** para
     líderes, **Liga Senda** entre iglesias, **Berea** (IA que siempre cita) y la mascota **Lani** (oveja; Semi queda de alternativa).
  2. **Método**: MVP «Primera luz» publicado el **18-12-2026** (prueba cerrada de 12 testers × 14 días antes), una versión cada dos
     semanas con la app en las tiendas, lanzamientos graduales e interruptores de función; v1 «Reunión» (ene–abr 2027), v2 «Liga»
     (may–ago), v3 «Iglesia» (sep–dic); portugués, inglés y web en 2028. **Regla de corte el 30-04-2027**: 1.000 personas por semana
     con 3+ días con la Palabra y 10% que vuelve a la semana siguiente.
  3. **Plata**: Biblia y contenido gratis y sin publicidad para siempre; Plus USD 0,99, Líder USD 2,99, Iglesia USD 9,99 por mes y
     videos solo opcionales en los juegos. Presupuesto del primer año USD 524 / 3.074 / 8.544 (mínimo / recomendado / ideal); el
     recomendado se paga en 4 tramos, cada uno solo si el anterior cumplió su condición.
  4. **Propiedad intelectual**: no se patenta (Ley 24.481 art. 6 excluye el software; en EE.UU. sería caro e incierto); se protege con
     marcas en el INPI (Senda en noviembre de 2026; logo y Lani después), cesión de derechos del ilustrador, animador y diseñador de
     sonido, autoría humana de la mascota y del logo, dominios y secreto comercial. Cada comité anual pregunta si hay una invención
     técnica nueva antes de publicarla.
- **Por qué**: junta en español de origen lo que hoy está en cinco apps en inglés; el crecimiento viene de los grupos (una reunión =
  20 a 60 instalaciones) y de la liga entre iglesias, no de comprar publicidad. Proyección del escenario normal (ESTIMACIÓN): neto de
  USD 620 por mes en diciembre de 2027 y USD 7.949 en diciembre de 2030; escenario malo ~USD 3.500 en 2030. El millón de descargas es
  la meta ambiciosa para fines de 2030.
- **Descartado**: chat abierto y feed infinito, cajas de premios pagas, publicidad en la Biblia o en las lecciones, Bible Brain
  (prohíbe cobrar a los usuarios), incrustar videos de BibleProject (solo enlace).
- **Pendiente de ajustar**: el caso de negocio del holding (`P1-senda.yaml`) usa un precio del plan Iglesia más prudente; se alinea en
  el próximo comité con los datos de la validación.
- **Fuentes**: `conocimiento/2026-09-30-proyecto-senda-investigacion.md` y las bitácoras del 28-09-2026. Proyecto:
  `oportunidades/proyectos/senda/`; informe: `informes/2026-09-senda-proyecto.pdf`.
- **Revisar**: 25-10-2026 (decisión de seguir tras la validación), 18-12-2026 (publicación), 30-04-2027 (regla de corte).

## DEC-2026-10-02-1 — Senda v2: experiencia profesional primero, liga por persona, calendario y ruta principal a junio de 2027

- **Contexto**: el fundador revisó la v1 del proyecto (02-10-2026) y mandó 30 correcciones ordenadas más sus notas originales. El eje:
  la experiencia (UX/UI, animación, sonido, entretenimiento, comunidad) es la prioridad absoluta; nada infantil ni aburrido; colores
  que no parezcan banco, sistema administrativo ni juguete; Espadeo más cercano a Preguntados; vidas y videos como en Duolingo y
  Candy Crush sin regalar todo; liga por persona y no por iglesia; calendario adelantado; Senda Reunión y Berea sin IA; sin Prode;
  la ruta principal antes de 2028; justificar el abogado y los USD 1.000; más en menos tiempo.
- **Decisión** (propuesta; las 16 decisiones del capítulo 30 quedan para el fundador):
  1. **Experiencia**: prioridad número uno del proyecto, con la «prueba de la grilla» (cada pantalla al lado de su equivalente en
     Duolingo, Preguntados, Clash Royale o Candy Crush). **Paleta B (ámbar + índigo)** recomendada, a validar contra A y C con 30
     jóvenes; tipografías Unbounded, Plus Jakarta Sans y Literata; íconos propios sin emojis; coreografía de cada momento con luz,
     sonido y vibración. **Lani v2** (oveja joven neutra, sin rasgos de bebé, 30 reacciones en Rive) y **Tu Lani** personalizable
     con atuendos y vehículos; se aprueba con un «infantilómetro».
  2. **Nombres**: regla de 6 pruebas. **Travesía** (con Rutas adentro) reemplaza a Camino; categorías Héroes, Palabra, Historia, Vida,
     Verdad y Mapa con las piezas Escudo, Espada, Casco, Coraza, Cinturón y Botas; Oveja Perdida (ex Impostor), Abecé (ex Rosco, con
     otra mecánica), ¡Prohibido!, Giro diario (ex Maná del día). «El Rosco», «Tabú», «Libertadores», «Champions» y «Copa América» no
     se usan porque tienen dueño.
  3. **Producto**: Espadeo con Carga (3 aciertos), Prueba de pieza, Armería, Cara a cara, 6 comodines y armadura visible arriba a la
     derecha; **Liga Senda por persona** (Apertura 12-04 → 11-07 y Clausura 16-08 → 14-11 de 2027; divisiones, zonas de 12, 11 fechas,
     playoffs, 3 ascensos y 3 descensos) más Copas, Supercopa y Copa Continental (2028); **semana Senda** con una cita fija por día
     (el Viernes de Espadeo como estrella); **calendario** de tres capas desde el MVP; **Senda Reunión** como armador por bloques con
     registro; **Púlpito** como Desafío del domingo; **Berea** como sección guiada por Lani, sin IA para usuarios; Pulso, Estados y
     herramientas contra el scroll. Prode eliminado.
  4. **Biblia**: Reina-Valera por defecto (RV1909 ya; RVR1960 con licencia); NTV, NVI, DHH y TLA en v1; tres caminos de licencia
     (YouVersion Platform, API.Bible, titulares) con su costo en la proyección.
  5. **Economía**: vidas 5 / 15 / ilimitadas (Gratis / Plus / Max), el repaso devuelve vidas y nunca se cobra la Biblia ni la Travesía;
     Plus USD 0,99, Max 2,49, Familia 4,99, Pase Senda 1,99 por temporada, Líder 3,49, Iglesia 12,99; videos opcionales en todos los
     planes con topes; anuncio corto como máximo cada 3 partidas solo en juegos del plan gratis; nunca ventaja pagada en lo oficial.
  6. **Plata y tiempos**: presupuesto como **menú de calidad** (básico USD 1.084, **profesional USD 5.974**, premium USD 15.244) en 4
     tramos condicionados; los «USD 1.000» de la v1 eran el tramo 1 (USD 954). MVP el **18-12-2026**; v1 «Juntos» a marzo, v2 «Liga»
     con la **ruta Fundamentos completa el 30-06-2027**, v3 «Copa» en el segundo semestre, portugués en marzo de 2028. El abogado no
     hace falta para lanzar (documentos propios; revisión puntual opcional solo para estudios con datos sensibles o sorteos
     internacionales).
- **Por qué**: la v1 era correcta en la estrategia pero pobre en la experiencia, que es justamente lo que decide si los jóvenes se
  quedan. La liga por persona evita la competencia entre iglesias; el calendario y la semana Senda dan razones para volver cada día;
  la escalera de planes captura más valor sin romper la experiencia. Proyección del escenario normal (ESTIMACIÓN, `economia.yaml`):
  neto de **USD 526 por mes en diciembre de 2027** y **USD 8.722 en diciembre de 2030**; malo ~USD 2.900 y bueno ~USD 23.100 en 2030.
- **Descartado**: IA para usuarios (Berea y Senda Reunión), Prode del Mundial 2030, liga entre iglesias, botón para ir a otras apps,
  nombres con dueño.
- **Pendiente de ajustar**: el caso de negocio del holding (`P1-senda.yaml`) sigue con los supuestos prudentes de la v1; se alinea en el
  próximo comité.
- **Fuentes**: `conocimiento/2026-10-02-senda-v2-investigacion.md` (con nivel de confianza por dato) y las bitácoras anteriores.
  Proyecto: `oportunidades/proyectos/senda/` (`economia.yaml` nuevo); informe: `informes/2026-10-senda-proyecto-v2.pdf`.
- **Revisar**: 25-10-2026 (decisión de seguir, nombres, Lani, paleta y nivel del tramo 1), 18-12-2026 (publicación), 30-04-2027
  (regla de corte), 30-06-2027 (ruta Fundamentos completa).

## DEC-2026-10-05-1 — Senda: decisiones del fundador y arranque del desarrollo

- **Contexto**: el fundador respondió las 16 decisiones del proyecto v2 (05-10-2026), pidió empezar a desarrollar lo antes posible
  sin gastar más que Claude Pro (salvo gastos chicos), abrir las tiendas recién en noviembre o diciembre, y sumar el diseño emocional
  (nostalgia, ternura, alegría, sorpresa, curiosidad) como parte del proyecto.
- **Decisión**:
  1. **Nombre Senda**, con verificaciones (INPI, tiendas, dominios y redes) a cargo del fundador; riesgo detectado en Chile (SENDA es
     el servicio estatal de prevención de drogas): se mitiga con bajada en tienda y consulta en el INAPI antes de invertir allí.
  2. **Sin validación previa con jóvenes**: el proyecto es el punto de partida y se valida con la app en uso. Lani v2, paleta B,
     categorías, nombres de juegos, planes, anuncio corto, revisores, línea editorial, cuentas e idioma neutro: aprobados.
  3. **Vidas: 3 gratis, 1 por hora**; repasar no devuelve vidas por ahora. **Claude Max desde diciembre**.
  4. **Biblias**: arrancar con RV1909, BES y PDT (libres, ya en la app). La RVR1960 **no se usa sin licencia** (marca registrada,
     distribución mundial, riesgo con las tiendas); YouVersion Platform no aplica (exige app no comercial). Se pide precio de
     ministerio a la American Bible Society; si no, API.Bible (~USD 39 por mes) desde el lanzamiento o desde marzo, a decidir.
  5. **Desarrollo**: repositorio propio `senda-app` (Expo SDK 57, React Native, TypeScript, React Navigation, zustand). Sprint 0
     hecho el mismo día, con vista previa web privada para probar desde el celular. Copia temporal en `apps/senda-app/` de este
     repositorio hasta que exista el repositorio propio. Google Play (USD 25) a más tardar el 15-11-2026; Apple cuando se decida iOS.
  6. **Diseño emocional**: capítulo 20 nuevo del proyecto (diez emociones, cinco herramientas, mapa de momentos, reglas para no
     manipular) y guía práctica en el repositorio de la app.
- **Por qué**: empezar ya acorta el camino al lanzamiento del 18-12-2026 y permite validar con algo real; las cuentas pagas se abren
  recién cuando hacen falta.
- **Fuentes**: `conocimiento/2026-10-05-senda-desarrollo-y-licencias.md`; proyecto v2.1 en `informes/2026-10-senda-proyecto-v2.pdf`.
- **Revisar**: 15-11-2026 (Google Play y prueba cerrada), 18-12-2026 (lanzamiento), 30-04-2027 (regla de corte).

## DEC-2026-10-05-2 — Senda: segunda tanda de decisiones y sprint 1

- **Fecha:** 2026-10-05 · **Decide:** fundador (con recomendaciones de Claude)
- **Contexto:** el fundador probó la vista previa del sprint 0 y pidió temas, Ajustes, más animaciones y sonidos «punto por punto»,
  un benchmark de navegación, más Biblias libres, una RVR1960 más barata y una lectura que se sienta como papel.
- **Decidido por el fundador:** el repositorio `senda-app` existe (la copia temporal sale de `apps/`); **un anuncio al terminar cada
  partida** (plan gratis); temas elegibles con los diseños del proyecto; Ajustes como en las apps de referencia; seguir sin gastar.
- **Hecho por Claude (sprint 1):** 5 temas y Ajustes; lector de papel; Nueva Biblia Viva; búsqueda; 36 sonidos propios; momentos de
  los capítulos 19 y 20; APK de prueba con GitHub Actions (sin cuenta de Expo); textos legales en borrador; pedidos de licencia en
  borrador (`oportunidades/proyectos/senda/borradores/`, no se envían sin aprobación).
- **Recomendado, a confirmar:** mantener la barra de pestañas abajo (benchmark en el capítulo 19, sección 17); mantener el enlace a la
  RVR1960 en Bible.com hasta tener la licencia.
- **Corrección registrada:** la cita libre de 500 versículos de la RVR1960 solo vale para obras no comerciales (capítulo 7).
- **Evidencia:** `conocimiento/2026-10-05-senda-navegacion-biblias-sprint1.md`.

## DEC-2026-10-05-3 — Senda: tercera tanda, la Consola y las versiones protestantes

- **Fecha:** 2026-10-05 · **Decide:** fundador (con recomendaciones de Claude)
- **Contexto:** el fundador probó el sprint 1: le gustó en general, pero el paso de hoja se veía mal, varios sonidos sonaban baratos,
  llegaban tarde o cansaban, la «Pausa con Lani» parecía meditación oriental, la voz que lee sonaba fea y con acento de España, y
  Jugar y Travesía se sentían tiesos. Además planteó un tema de fondo: desde dónde se gobierna la app y el proyecto.
- **Decidido por el fundador:** barra de pestañas abajo (confirmada); enlace a la RVR1960 en Bible.com por ahora (confirmado);
  **solo versiones protestantes**; la Pausa se va y en su lugar una invitación a orar antes de leer; se pueden usar sonidos libres
  en vez de crearlos todos.
- **Hecho por Claude:** hoja que se dobla con el dedo; marcado de varios versículos con resaltador que pinta; «Antes de leer»;
  motor de sonido sin demoras y sin sonido en botones; Jugar y Travesía con física y reacciones; selector de voz; contenido como
  datos con verificación automática (60 preguntas); **Consola de Senda v0** (capítulo 32); pedidos de licencia para SBU, Tyndale,
  Biblica y Lockman; candidatos de sonido CC0 y muestras de voces libres para elegir.
- **Recomendado:** gobernar Senda desde la Consola a medida en tres etapas (v0 hoy en claude.ai, v1 en el sprint 2 sobre Supabase y
  PostHog, v2 en 2027 con revisores y propuestas de jugadores), en lugar de un CMS o un panel genérico; enviar los pedidos desde un
  correo del proyecto.
- **Pendiente del fundador:** elegir sonidos y voz; crear el correo del proyecto y enviar los pedidos; cuentas gratis de Supabase y
  PostHog antes del 26-10; Google Play antes del 15-11.
- **Evidencia:** `conocimiento/2026-10-05-senda-consola-sonido-licencias.md`.
