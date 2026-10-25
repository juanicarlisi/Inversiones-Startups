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

## DEC-2026-10-05-4 — Senda: cuarta tanda (prueba 2 en el teléfono), presupuesto mínimo y dificultad de la trivia

- **Fecha:** 2026-10-05 · **Decide:** fundador (con recomendaciones de Claude)
- **Contexto:** el fundador probó el APK de la prueba 2 en un Samsung: los sonidos quedaban en bucle (hasta con la app cerrada), la
  Biblia todavía no se sentía de papel («texto pegado sobre un papel sucio»), no pudo elegir sonidos, no sabía cómo enviar los
  correos ni crear las cuentas, la trivia le pareció demasiado fácil y preguntó por qué el presupuesto incluía un diseñador de
  interfaz si la interfaz la hace Claude. Eligió la voz Samsung «es-US-SMTl01» y dio el correo del proyecto (appsenda.ok@gmail.com).
- **Decidido:** presupuesto **mínimo recomendado de USD 55** en gastos únicos del primer año (Google Play + IA de traducción); el menú
  profesional pasa a ser opcional (capítulo 29); **Android primero** e iPhone en 2027 (recomendado, a confirmar en diciembre); marcas
  del INPI después del lanzamiento (el registro es público); dificultad de la trivia que **alterna** (capítulo 9, sección 15).
- **Hecho por Claude:** arreglo del bucle de sonido en Android; lector como Biblia impresa (renglones, capitular, dos columnas, hojas
  llenas, dorso que se transparenta, papel biblia); sonidos elegidos de bancos CC0; 67 preguntas nuevas (127 en total, 5 niveles) con
  dosificador de dificultad; planes de lectura (5); protector de racha; métricas anónimas y tablas de Supabase listas para conectarse;
  Consola con correos listos para Gmail y pasos a paso; APK pruebas 3 y 4.
- **Pendiente del fundador:** probar la prueba 4; enviar los pedidos de licencia (15 minutos); crear Supabase y PostHog y cargar los
  secretos en GitHub antes del 26-10; Google Play antes del 15-11.
- **Evidencia:** `conocimiento/2026-10-05-senda-dificultad-cuentas-presupuesto.md`.

## DEC-2026-10-06-1 — Senda: quinta tanda (prueba 4 en el teléfono), firma sonora, calendario y licencias más adelante

- **Fecha:** 2026-10-06 · **Decide:** fundador (con recomendaciones de Claude)
- **Contexto:** el fundador probó la prueba 4:
  - la Biblia mejoró, pero se cortaba abajo, se trababa y desde un plan el Salmo 1 quedaba solo;
  - la ruleta sonaba fea y al ganar una pieza no había festejo;
  - pidió sonidos propios que se reconozcan, eventos propios en el calendario y, como evolutivos, grupos con roles y un juego de
    carrera con Lani;
  - creó Supabase y PostHog, envió los dos primeros correos de licencia y se trabó con los formularios.
- **Decidido:**
  - **firma sonora propia** (marimba con campanita y el motivo re–la–si–fa♯) en los momentos grandes y la ruleta; los sonidos chicos
    quedan como estaban;
  - **Mi calendario en el MVP**, con eventos y avisos reales; los grupos con roles y la agenda compartida van en febrero de 2027, con
    las cuentas;
  - **Lani corre** queda como evolutivo para el segundo trimestre de 2027: un nivel de prueba y una regla de corte;
  - **NVI y LBLA** se piden después del lanzamiento y con la empresa (recomendado);
  - el token de Supabase se cambia por uno que venza en un año (opcional, no urgente).
- **Hecho por Claude:**
  - lector sin cortes ni trabas, y plan de lectura de corrido;
  - firma sonora, ruleta nueva y festejo de pieza a pantalla entera;
  - calendario con eventos (foto, lugar o Meet, repetición, fechas tope) y avisos reales;
  - recordatorio diario real;
  - tablas aplicadas en Supabase, respuestas y Pulso reales, y región de PostHog detectada sola;
  - política de privacidad 0.2;
  - campos de los formularios listos y registro de los evolutivos;
  - APK prueba 5.
- **Pendiente del fundador:** probar la prueba 5; esperar las respuestas de ABS y Tyndale; Google Play antes del 15-11.
- **Evidencia:** `conocimiento/2026-10-06-senda-prueba4-sonido-calendario.md`.

## DEC-2026-10-06-2 · Senda: sexta tanda (después de la prueba 5)

- **Contexto:** el fundador probó la prueba 5:
  - la vuelta de hoja seguía lenta y trabada;
  - faltaban sonidos o llegaban tarde, la ruleta y la corona no sonaban, y pidió muchos más y de calidad;
  - pidió vista semanal y avisos más lindos, frases al abrir la Biblia, una Travesía exhaustiva y MECE sin inclinaciones, la app
    preparada para millones, y registrar algo tipo Kahoot y juegos futuros (de mesa y consola, tipo Mario Party, de campamento).
- **Decidido:**
  - **motor de audio nuevo** (un solo contexto de audio) y **firma con instrumentos grabados** (VCSL, CC0); los botones dejan de ser
    silenciosos: suenan muy bajito y se pueden apagar con «Sonidos de toques»;
  - **Travesía de 8 áreas MECE** (cada una responde una pregunta) con guardas doctrinales ampliadas; **Los viajes de Pablo** abierta
    como vidriera, con Pablo como personaje y el mapa real;
  - **quiz en vivo de Senda Reunión:** el líder puede subir un PDF y Senda le propone preguntas que él aprueba (**cambia** lo decidido:
    antes Senda no leía el bosquejo);
  - **escala por etapas** (docs/ESCALA.md): lo personal en el teléfono, envíos idempotentes, resúmenes al escribir; Supabase Pro al
    lanzar y un servicio de tiempo real por sala recién con miles de salas;
  - **evolutivos 2027** con regla de corte: juegos de historias (El arca primero), Senda Fiesta (tipo Mario Party) y modo campamento.
- **Hecho por Claude:** todo lo anterior en la app (APK prueba 6), migración de escala aplicada en Supabase, Consola y proyecto al día.
- **Pendiente del fundador:** probar la prueba 6; esperar las respuestas de ABS y Tyndale; Google Play antes del 15-11.
- **Evidencia:** `conocimiento/2026-10-06-senda-prueba5-audio-travesia-escala.md`.

## DEC-2026-10-06-3 · Senda: séptima tanda (después de la prueba 6) y dos reglas permanentes

- **Contexto:** el fundador probó la prueba 6.
  - La hoja y los sonidos de la Biblia, mucho mejor; el calendario, bien.
  - Marcar o seleccionar versículos, muy lento.
  - El clic de la ruleta, mejorable; y quiere «más fiesta» al ganar una pieza.
  - En la Travesía pidió ayudas que digan dónde leer y que se note lo aprendido.
  - Sumó tres pedidos de diseño: costo mínimo de servidores, escalar sin rehacer y partidas abiertas que vencen.
  - Aclaró que sus ejemplos de juegos (Jericó, el arca, Mario Party, «alimenta a Elías» tipo Flappy Bird) son semillas para evaluar, no encargos.
- **Decidido:**
  - **Dos reglas permanentes:**
    - costo mínimo y crecer sin rehacer (regla 13 de la app, `docs/COSTOS.md`);
    - las ideas del fundador son semillas: evaluar el encaje, sacar la familia y fusionar (doctrina 08, §9).
  - **Travesía:**
    - 3 Lámparas por lección, sin costo de vidas; la lección perfecta es sin Lámparas;
    - lectura recomendada;
    - repaso espaciado en el teléfono.
  - **Duelos (sprint 3):** por turnos de 72 h; si vence, gana el que jugó último. Cuentas anónimas, semilla por turno, lógica en la base y push gratis. Costo extra USD 0 hasta el Pro previsto.
  - **La palabra original con el «+»:** v1.1, con STEPBible (CC BY 4.0) y significados propios. No se usa el Strong en español de Caribe, que tiene derechos.
  - **Juegos:** la fábrica de ocho preguntas. «Los cuervos de Querit» (32/40) y «Maná» (34/40) son los primeros del Arcade de 2027, con regla de corte. Una sola biblioteca de minijuegos para el Arcade, Senda Fiesta, Reunión y los campamentos.
- **Hecho por Claude (APK prueba 7):**
  - marcar al instante;
  - el clic nuevo de la ruleta y la fiesta (música propia y Lani que baila);
  - Lámparas, lectura recomendada y repaso;
  - tres tipos de ejercicio nuevos con validación textual;
  - sección 1 de Fundamentos completa;
  - documentos de costos, duelos y palabras originales;
  - Consola y proyecto al día.
- **Pendiente del fundador:**
  - probar la prueba 7;
  - escuchar y elegir en la Consola los giros y la fiesta;
  - en noviembre, crear las cuentas gratis de Expo y Firebase (guía de Claude);
  - Google Play antes del 15-11.
- **Evidencia:** `conocimiento/2026-10-06-senda-prueba6-fiesta-lamparas-costos.md`.

## DEC-2026-10-11-1 · Senda: octava tanda (después de la prueba 7), Lani en 3D, Senda Fiesta y el proyecto v3

- **Contexto:** el fundador probó la prueba 7.
  - Las pruebas salieron prácticamente todas bien.
  - El baile de Lani le pareció un poco infantil, y preguntó si Lani podía ser 3D como en Duolingo.
  - Pidió actualizar el PDF del proyecto con todo lo conversado y sumar un diagrama MECE de toda la app, que se entienda al primer vistazo.
  - Le gustó sumar los minijuegos a campamentos y partidas, y usarlos en el modo tipo Mario Party, con impronta propia y sin réplicas.
  - Pidió avanzar con lo próximo del roadmap.
- **Decidido:**
  - **Lani en 3D hecha con código** (three.js sobre expo-gl) para las fiestas, con vuelta a la 2D si el teléfono no puede y un interruptor en Ajustes. Duolingo es 2D (Rive); la Lani final (3D con artista 3D o 2D con animador de Rive, la misma línea de USD 1.200) se decide en noviembre, después de probarla.
  - **Baile nuevo**, sin saltitos ni vueltas: groove de recital juvenil con chasquidos, señalar al cielo, aplausos en el 2 y el 4 y manos arriba.
  - **Senda Fiesta con identidad propia:** siete reglas que nacen de la Biblia, cuatro maneras de jugar (incluida por turnos con amigos, con costo de servidor casi cero) y límites legales: mecánicas de más de 20 años o propias, nada de marcas ni del aspecto de Nintendo, búsqueda de patentes antes de construir y consulta con un abogado de PI.
  - **El mapa de toda la app** (`oportunidades/proyectos/senda/mapa_total.yaml`) como fuente única para el PDF (hoja A3) y la Consola; se actualiza al cerrar cada sesión.
  - **Menores de 13:** sin anuncios, sin estadísticas, sin cuenta y sin jugar con desconocidos.
- **Hecho por Claude (APK prueba 8):**
  - Lani 3D y baile nuevo (también la 2D sin saltitos);
  - bienvenida en siete pasos (edad neutral, qué te trae, cuánto sabés, áreas de interés) que personaliza la app;
  - duelo contra Lani, sin servidor;
  - Consola con «Mapa de la app» y «Lani 3D»;
  - proyecto v3 en PDF (171 páginas): tabla de lo que cambió, hoja A3, Senda Fiesta, Lani 3D, octava tanda y el capítulo 33 (el desarrollo hasta hoy).
- **Pendiente del fundador:**
  - probar la prueba 8;
  - en noviembre, decidir la Lani final y crear las cuentas gratis de Expo y Firebase;
  - Google Play antes del 15-11.
- **Evidencia:** `conocimiento/2026-10-11-senda-prueba7-lani3d-fiesta-mece.md`.

## DEC-2026-10-11-2 · Senda: novena tanda, todo enseña y edifica, la Biblia directa y la investigación de lo que cuesta entender

- **Contexto:** después de la versión 3 del proyecto, y antes de probar la prueba 8, el fundador mandó un mensaje largo (resumen, sin
  citas textuales):
  - el propósito de la app es que, mientras se juega o se usa cualquier función, se aprenda y se crezca en la relación con Dios y en su
    Palabra; los juegos que no enseñan, afuera, empezando por «Alimenta a Elías»;
  - sacar la sugerencia de orar o de tomarse el tiempo antes de leer: ir directo a la Biblia cuando la persona quiera;
  - pasar de hoja sigue un poco lento; marcar y resaltar, bastante lentos;
  - un juego de mesa de misiones que vio en una conferencia, como dirección y no para copiar;
  - investigar sin límites lo que cuesta entender, memorizar o se da por sentado (fiestas, historia de Israel, profecías del Mesías,
    promesas, sobre qué orar, lo básico), con citas y bench;
  - un evolutivo para que las iglesias suban sus PDF y armen su propia Travesía, marcada como suya, con pedido a lo global;
  - el aviso de Supabase: el proyecto gratis se pausó por 7 días sin uso;
  - el modo tipo Mario Party, solo si edifica; calidad extraordinaria aunque lleve tiempo; va a mandar más material.
- **Decidido:**
  - **Regla «todo enseña y edifica»** en el proyecto, en la app (regla 15 de su CLAUDE.md) y en la doctrina 08 (§9, punto 6). Los juegos
    pasan una puerta de dos preguntas antes del puntaje. Salen Los cuervos de Querit, Gedeón y Zaqueo; se reconvierten Lani corre, el Giro
    diario, Jericó, Nehemías y Pedro sobre el agua; Senda Fiesta suma una vara de aprendizaje a su regla de corte.
  - **La Biblia abre directo:** fuera la invitación a orar y la frase al abrir (el umbral de la prueba 6, que también frenaba).
  - **Área nueva de la Travesía, «El plan de Dios»** (9 áreas y 62 rutas), y cuatro juegos propios: Hasta lo último (cooperativo de
    misiones), Emaús, El Tabernáculo y El calendario de Dios.
  - **Las iglesias suben su material** como evolutivo de la v2 (unos USD 0,30 por PDF, estimación).
  - **Supabase:** reactivarlo gratis cuando haga falta (lo hace el flujo del APK) y no mantenerlo despierto a la fuerza; Pro recién al
    lanzamiento, como estaba presupuestado.
- **Hecho por Claude (APK prueba 9):**
  - lector: marcar en 70 ms, resaltar en el acto, vuelta de hoja en 320 ms, toques seguidos que no se pierden, cada hoja dibujada una sola vez;
  - lecciones con «¿Sabías que…?» y «Para tu vida»; 5 rutas abiertas con 21 lecciones y 128 preguntas, y 30 preguntas nuevas del
    Espadeo, todas verificadas contra la RV1909 (en revisión doctrinal);
  - Supabase reactivado (INACTIVE → ACTIVE_HEALTHY en 5 minutos, gratis, por la API desde GitHub);
  - proyecto v3.1: capítulo 34 (investigación, bench, rutas, fuentes externas, Israel sin tomar partido, iglesias), capítulo 10 con la
    puerta y los juegos nuevos, novena tanda, mapa, estado y roadmap.
- **Pendiente del fundador:**
  - probar la prueba 9;
  - elegir 1 o 2 revisores doctrinales antes del 26-10 (es lo que más frena publicar el contenido);
  - mandar el material que quiera sumar.
- **Evidencia:** `conocimiento/2026-10-11-senda-todo-ensena-investigacion.md`.

## DEC-2026-10-12-1 · Senda: décima tanda (prueba 10), amplitud, trivia de la iglesia, misión nueva y proyecto v3.2

- **Contexto:** el fundador mandó un mensaje largo después de la prueba 9 (resumen, sin citas textuales):
  - el «Empezar» quedaba tapado por el menú y el «Seguir» cortado: la experiencia es fundamental y eso no puede pasar;
  - fondos de la Travesía relacionados con cada ruta y un camino que se desplace como Duolingo;
  - el festejo de la armadura parecía un dibujito: profesionalizarlo (buscar en Rive y en todo lo posible);
  - el orden del contenido tiene que ser excelente y cada paso tiene que decir dónde está la respuesta, completo, nunca por la mitad;
  - una bienvenida con preguntas para armar la app a medida;
  - la Travesía propia desde el PDF de la iglesia pasa a evolutivo incierto; que cualquiera pueda proponer una travesía;
  - mucha amplitud de contenido «es así y ya», como las unidades de Duolingo; seguir explorando categorías;
  - un benchmark profundo de juegos bíblicos (apps, mesa, rol, consola) por historia y por público;
  - travesías sobre lo que la Biblia dice de sí misma, la formación del canon, la historia de la iglesia y datos sorprendentes;
  - una trivia para que la iglesia repase el mensaje del domingo (1 contra 1, contra Lani o torneo; gana el que acierta más);
  - fuentes protestantes confiables; la biblioteca de comentarios para entender, nunca para plagiar;
  - una misión nueva en la línea de «una generación que conoce la Palabra como ninguna antes y por ella se rinde y ama a Cristo», y una
    visión en sintonía, no atada al millón de descargas;
  - un inventario personaje por personaje e historia por historia; ir despacio pero con altísima calidad.
- **Decidido:**
  - **Misión nueva** (capítulo 2 del proyecto): que una generación conozca la Palabra de Dios como ninguna antes, y que por medio de ella
    se rinda a Cristo y lo ame. La visión se mide por lo que la gente sabe y vive (personas con tres días por semana con la Palabra,
    aciertos en el repaso, versículos guardados, iglesias que usan la trivia); las descargas, como medio.
  - **Regla de lo completo:** cada nivel muestra todas sus lecturas; cada pregunta, el capítulo de la respuesta; los datos de historia
    van como nota con su fuente. El validador lo exige en la Travesía, el Espadeo, la trivia y Antes o después.
  - **Área nueva «De memoria»** (10 áreas, 67 rutas) y tres travesías abiertas: Más que el oro, Listas de la Biblia y Cómo se formó la
    Biblia (con el canon).
  - **La Travesía desde el PDF de la iglesia, evolutivo incierto;** en su lugar, Proponer una travesía (en la app) y la Trivia de la
    iglesia (prototipo; con PDF en la v2, unos USD 0,05 por material según estimación).
  - **Fuentes:** reglas de uso de la biblioteca (142 PDF, acceso confirmado) y de las fuentes en línea: entender, nunca copiar.
  - **Inventario bíblico** permanente (94 personajes, 129 historias) con cobertura calculada por `herramientas/inventario_senda.py`.
- **Hecho por Claude (APK prueba 10):**
  - zonas seguras en toda la app; Travesía tipo Duolingo con 14 escenas de fondo; festejo de la armadura en 3D; bienvenida en 13 pasos;
  - lecturas completas en las 197 preguntas de la Travesía y en el Espadeo; 22 lecciones y 135 preguntas nuevas verificadas;
  - Proponer una travesía, Trivia de la iglesia y el juego Antes o después (41 hechos con su cita);
  - proyecto v3.2: capítulo 35, benchmark de juegos (capítulo 10 §16), misión y visión, fuentes (capítulo 23 §3b), mapa y estado.
- **Pendiente del fundador:**
  - probar la prueba 10;
  - confirmar las fuentes «Toma Tu Lugar» y «MiSión» (nombre y sitio exactos);
  - elegir los revisores doctrinales;
  - si quiere que Claude busque en la comunidad de Rive, habilitar `rive.app` en la red del entorno.
- **Evidencia:** `oportunidades/proyectos/senda/capitulos/35-amplitud.md` y las fuentes citadas en los capítulos 10 §16 y 23 §3b.


## DEC-2026-10-12-2 · Senda: undécima tanda (prueba 11), una línea clara, Lani en Rive, contenido publicado, la RVR1960 y proyecto v3.3

- **Contexto:** el fundador mandó otro mensaje largo el 12-10-2026 (resumen, sin citas textuales):
  - música de inicio moderna, divertida, tecnológica, alegre y sobria;
  - la mascota hecha en Rive, con una experiencia excelente; cambiarla si conviene;
  - revisar exhaustivamente todo el contenido pendiente contra las fuentes y publicar lo confiable;
  - cada travesía con una línea muy clara y progresiva (Pablo en orden cronológico; Israel que nace, es esclavo y es liberado);
  - que las vidas no se terminen rápido y se recuperen con anuncios sin límite;
  - travesías nuevas: los mártires y la cronología de los referentes de la Iglesia;
  - en la Biblia: notas por versículo como MyBible con fuentes confiables en el «+», lectura continua por defecto (la de papel como
    opción), temas, velocidad excelente, marcadores y paso de hoja rápidos;
  - durante la sesión: buscar hasta la última vía para tener hoy la RVR1960 en la app sin la licencia.
- **Decidido:**
  - **Lani se mantiene y pasa a Rive,** hecha con código (escritor de `.riv` con los tipos del motor oficial): 18 animaciones y máquina
    de estados con data binding. La Lani 3D queda como opción. En noviembre: animador de Rive (USD 1.200) o la hecha con código.
  - **Línea clara obligatoria:** en las rutas que cuentan una historia, cada lección trae «La historia» (antes, relato, cuándo, después)
    y cada capítulo de todas las rutas, su resumen. El validador lo exige.
  - **Contenido publicado** tras la revisión de Claude pregunta por pregunta (validador + revisión manual); 8 preguntas del Espadeo
    retiradas. Los revisores doctrinales humanos siguen recomendados, pero ya no frenan la publicación.
  - **Vidas:** 5, una cada 30 minutos, video +1 sin límite y leer un capítulo devuelve una (hasta 3 por día).
  - **Lectura continua por defecto** en la Biblia; la de papel, en Ajustes; siete temas.
  - **El «+» de estudio:** referencias cruzadas de OpenBible.info (CC BY) y notas de traducción de la PDT y la NBV; siguen STEPBible,
    un diccionario de dominio público e introducciones a los libros.
  - **RVR1960:** sin licencia no hay texto completo legal (13 vías revisadas en la fuente, bitácora del 12-10). Se hizo lo posible hoy:
    lectura vía Bible.com dentro de Senda y lugar para citar hasta 500 versículos según la política de la Sociedad Bíblica Argentina.
    Recomendado enviar ya el pedido a la SBA como uso no comercial. YouVersion Platform solo si Senda renunciara a todo ingreso: no
    recomendado. API.Bible no tiene la RVR1960 (corrige lo anotado el 05-10 en el proyecto y el presupuesto).
- **Hecho por Claude (APK prueba 11):**
  - Lani en Rive; firma de apertura nueva (vibráfono, campana FM, golpe grave, re mayor);
  - el gran relato completo (9 capítulos, 47 lecciones), Pablo en orden (11 lecciones), Testigos fieles (9) y La historia de la Iglesia
    (18), cada dato no bíblico como nota con su fuente y lo dudoso marcado: 12 rutas abiertas, 128 lecciones, 782 preguntas;
  - Biblia: lectura continua al instante, el «+» por versículo, siete temas y RVR1960 en un toque; vidas nuevas;
  - proyecto v3.3: capítulo 36, capítulo 16 §3c, estado, mapa e inventario (96 personajes, 131 historias y 27 referentes de la
    historia de la Iglesia).
- **Pendiente del fundador:**
  - probar la prueba 11;
  - enviar el pedido de la RVR1960 a la Sociedad Bíblica Argentina (y el recordatorio a ABS si no responde al 19-10), listos en la Consola;
  - elegir los revisores doctrinales.
- **Evidencia:** `oportunidades/proyectos/senda/capitulos/36-linea-clara.md`, `conocimiento/2026-10-12-senda-rvr1960-todas-las-vias.md`
  y las fuentes citadas en cada lección (repositorio de la app, `scripts/autor/martires.py` e `historia_iglesia.py`).

## DEC-2026-10-13-1 · Senda: duodécima tanda (prueba 12), Lany guía, el «+» a mano, los 66 libros y proyecto v3.4

- **Contexto:** el fundador escribió el 13-10-2026 (resumen, sin citas textuales):
  - la app le parece muy buena;
  - quiere el «+» de estudio a la vista en el versículo al leer, sin tener que tocar antes el versículo, con cuidado de la UX;
  - en la Travesía esperaba más animaciones de la mascota, parecidas a Duolingo, que se vean hechas por expertos;
  - el nombre se escribe **Lany**, no «Lani»;
  - avanzar con lo próximo del plan, a fondo.
- **Decidido:**
  - **El nombre es Lany** desde el 13-10-2026 (se pronuncia igual). Se cambió en la app, la Consola y los documentos vivos del proyecto;
    las decisiones y bitácoras anteriores quedan como se escribieron.
  - **El «+» vive en el margen derecho de cada versículo** en la lectura continua, chico y tenue; se marca más donde hay notas; se apaga
    en Ajustes. En la Biblia de papel sigue en la barra del versículo, porque sus márgenes son para pasar la hoja.
  - **Lany es la guía de la lección y del camino,** con el patrón de las apps que enseñan con un personaje (dirección, no copia):
    presenta cada pregunta con globo y voz, señala, piensa, festeja, baila en racha y da ánimo tras un error; en el camino corre,
    festeja al llegar y comenta. Una sola Lany por pantalla.
  - **Los 66 libros** se adelanta del sprint 2. Quién escribió cada libro: lo que dice el mismo libro, con su cita; si no lo dice, la
    tradición marcada como tal y con su fuente; si no se sabe, se dice.
- **Hecho por Claude (APK prueba 12):**
  - el «+» en el margen;
  - Lany guía: 22 animaciones en Rive (nuevas: señalar, ánimo, hablar y callada) y la boca que habla;
  - la travesía «Los 66 libros»: 9 lecciones y 62 preguntas, con lo que no está en la Biblia como nota con su fuente;
  - «Sobre este libro» en el «+» (66 fichas) y la lista de libros por grupos;
  - 13 rutas abiertas, 137 lecciones y 844 preguntas;
  - proyecto v3.4: capítulo 37, capítulo 16 §3d, estado, mapa e inventario (sección de los 66 libros).
- **Pendiente del fundador:**
  - probar la prueba 12;
  - enviar el pedido de la RVR1960 a la Sociedad Bíblica Argentina, si todavía no lo hizo;
  - elegir los revisores doctrinales.
- **Evidencia:**
  - `oportunidades/proyectos/senda/capitulos/37-lany-guia.md`;
  - repositorio de la app: `scripts/autor/libros.py`, `contenido/libros.json`, `src/componentes/lanyGuia.tsx`, `scripts/rive/lani.py`.

## DEC-2026-10-13-2 · Senda: decimotercera tanda (prueba 13), Lany sin voz y con volumen, Personajes, licencias y proyecto v3.5

- **Contexto:** el fundador escribió el 13-10-2026 (resumen, sin citas textuales):
  - Lany hablando se siente mal: sacarlo;
  - mejorar a Lany todo lo posible con lo que hacen Duolingo y lo que permite Rive, con un aspecto en 3D como el de Duolingo;
  - el «+» va bien y las lecciones también: seguir evolucionando y avanzar con lo planificado;
  - licencias: Tyndale respondió que la NTV se pide por API.Bible; el grupo de Lockman cuesta USD 500 por mes para 25.000 a 100.000
    usuarios y no le parece escalable. Pidió explorar a fondo y ayudarlo a decidir (sacar anuncios y suscripciones, otra
    monetización, pagar una sola versión u otras salidas).
- **Decidido:**
  - **Lany no habla.** Se sacaron la boca que habla y la voz del teléfono en el globo. Lany actúa con el cuerpo y la mirada.
  - **La Lany final es la de Rive con volumen** (cierra el pendiente «3D o 2D»): luz y sombra en dos tonos, sombras de contacto y cinco
    miradas que giran la cabeza. El animador de Rive (línea de USD 1.200) se evalúa en noviembre, sobre esta base.
  - **Personajes empieza** con Mujeres de la Biblia y Los patriarcas. No se repiten las preguntas del gran relato; lo interpretativo
    se marca.
- **Recomendado, para que decida el fundador (licencias):**
  - no sacar anuncios ni suscripciones (sin ingresos se pierden de 10 a 30 veces los ingresos posibles);
  - lanzar con las versiones libres y la RVR1960, la NVI y la NTV en un toque (costo 0), y hacer una RV1909 con ortografía actual;
  - pedir la RVR1960 como ministerio (SBA; ABS el 19-10);
  - consultar a API.Bible antes de pagar;
  - sumar la NTV cuando: licencias ≤ 10% del ingreso neto de dos meses, ≥ 5.000 usuarios por mes y la NTV es la más pedida;
    Lockman, recién con más de 25.000 usuarios y si la piden.
- **Hecho por Claude (APK prueba 13):**
  - Lany: 25 animaciones, volumen y capa de mirada (48,7 KB); la lección y el camino deciden hacia dónde mira;
  - «Cómo está armado» en los 66 libros, con validación de huecos;
  - Mujeres de la Biblia (11 lecciones, 65 preguntas) y Los patriarcas (11 lecciones, 66 preguntas);
  - 15 rutas abiertas, 159 lecciones y 975 preguntas;
  - licencias: bitácora con 16 hechos, diez caminos, recomendación y consulta a API.Bible lista; `economia.yaml` con el costo de una
    versión por tramo (ESTIMACIÓN);
  - proyecto v3.5: capítulo 38, capítulo 16 §3e, estado, mapa e inventario.
- **Pendiente del fundador:**
  - probar la prueba 13;
  - decidir el camino de las licencias;
  - mandar la consulta a API.Bible y el pedido a la SBA (regla 8: mensajes a terceros);
  - elegir los revisores doctrinales.
- **Evidencia:**
  - `oportunidades/proyectos/senda/capitulos/38-lany-volumen-licencias.md`;
  - `conocimiento/2026-10-13-senda-licencias-y-rentabilidad.md`;
  - repositorio de la app: `scripts/rive/lani.py`, `src/componentes/lanyGuia.tsx`, `scripts/autor/mujeres.py`, `scripts/autor/patriarcas.py`,
    `scripts/autor/bosquejos.py`.
- **Adenda (16-10-2026, prueba 13b):** el fundador marcó que la música de la bienvenida (cuando Lany se presenta) seguía siendo triste
  y que Lany aparecía cortada en la introducción. Se decidió: sale la cajita con «Cristo me ama» (el análisis la ubica en mi menor) y
  entra una música de bienvenida propia en re mayor con el motivo de la firma (dos variantes en la Consola); Lany se rehace cuando
  cambia de tamaño. APK prueba 13b. Evidencia: capítulo 38 §5b; repositorio de la app, `scripts/musica_bienvenida.py` y
  `src/arte/Arte.tsx`.

## DEC-2026-10-16-1 · Senda: decimocuarta tanda (prueba 14), la Travesía en estantes, el evangelio, el calendario y la vía de la RVR1960

- **Contexto:** el fundador escribió el 16-10-2026 (resumen, sin citas textuales):
  - API.Bible respondió: cualquier ingreso es uso comercial y la RVR1960 se ofrece solo a organizaciones registradas, por la Digital
    Bible Library; el ministerio aliado todavía no está registrado: ver cómo hacerlo;
  - sumar a la Travesía las áreas del evangelio (desde el estudio del ministerio, con la Gran Comisión), historia de la Iglesia,
    mártires, oración, buenas obras, personajes (todos), libros, Israel, profecías y apologética; sacar «Lo que creemos», renombrar
    «De memoria» y separar «El plan de Dios» sin tomar posición; Tierras y tiempos al máximo;
  - que toda la trivia y la Travesía tomen la RVR1960 de referencia, si se puede;
  - planes de estudio de institutos y ministerios conocidos, y libros de referencia, solo para inspirarse;
  - el calendario: más cómodo, a mano desde Inicio, el lugar con mapa, el teclado que tapaba, la semana finita y avisos elegantes;
  - calidad antes que velocidad.
- **Decidido:**
  - **La Travesía en 15 áreas y 5 estantes**, cada área con una sola pregunta; lo que falta queda a la vista como «en preparación».
  - **«El evangelio, paso a paso»** (7 capítulos, 42 niveles): temas y orden del estudio del ministerio, palabras propias, citas
    verificadas contra la RV1909 y la Gran Comisión al final. Las doctrinas secundarias del estudio no entran como enseñanza (lista en
    el capítulo 39 §3, para que el fundador confirme).
  - **RVR1960 como referencia:** los huecos de «completar» usan palabras que la RVR1960 conserva (se movieron 15) y el validador lo
    controla.
  - **Calendario:** editor nuevo, «Ubicar en el mapa» con el buscador del teléfono (sin servidor ni clave), el teclado que ya no tapa,
    vista de 3 días, «Tu calendario» en Inicio y avisos con sonido nuevo.
- **Recomendado, para que decida el fundador (licencias y figura legal):**
  - el titular de una licencia comercial tiene que ser quien cobra: una **SAS de Senda** (desde 24 horas hábiles; capital mínimo de 2
    salarios mínimos);
  - el ministerio sigue como aliado; si quiere su propia figura, asociación civil o simple asociación;
  - no crear nada antes de lanzar: crear la SAS y pedir la RVR1960 por la Digital Bible Library cuando la RVR1960 sea la más pedida y
    su licencia sea como máximo el 10 % del ingreso neto de dos meses;
  - antes, mandar el seguimiento a API.Bible (listo).
- **Hecho por Claude (APK prueba 14):**
  - estructura de la Travesía, «El evangelio, paso a paso», «Orar como Jesús enseñó», «El contexto de los versículos más conocidos»;
    Historia re-chequeada: 15 rutas abiertas, 203 lecciones y 1.240 preguntas;
  - calendario y avisos (seis puntos) y sonido nuevo con dos alternativas en la Consola;
  - licencias: bitácora, análisis de la figura legal, `licencias.yaml` corregido y seguimiento a API.Bible;
  - proyecto v3.6: capítulo 39, estado, mapa e inventario.
- **Pendiente del fundador:**
  - probar la prueba 14;
  - confirmar las doctrinas secundarias de «El evangelio»;
  - decidir licencias y figura legal;
  - mandar el seguimiento a API.Bible y el pedido a la SBA (regla 8: mensajes a terceros);
  - avisar cuando termine de subir los libros de referencia.
- **Evidencia:**
  - `oportunidades/proyectos/senda/capitulos/39-estantes-evangelio-calendario.md`;
  - `conocimiento/2026-10-16-senda-rvr1960-dbl-y-figura-legal.md`;
  - `oportunidades/proyectos/senda/borradores/2026-10-apibible-seguimiento.md`;
  - repositorio de la app: `docs/TRAVESIA_AREAS.md`, `docs/LICENCIAS_RVR1960.md`, `scripts/autor/evangelio.py`,
    `src/pantallas/Evento.tsx`, `src/util/lugares.ts`, `scripts/aviso_moderno.py`.

## DEC-2026-10-16-2 · Senda: decimoquinta tanda (prueba 15), Lany adulto, la armadura puesta, trivia que cuenta más y la Biblia con la ortografía de hoy

- **Contexto:** el fundador escribió el 16-10-2026 a la noche (resumen, sin citas textuales):
  - en El evangelio, dejar la doctrina del estudio del ministerio aliado aunque haya diferencias, porque es su doctrina;
  - «crió» es una falta inadmisible; lo viejo de 1909 tiene que leerse como la RVR1960, que es la que lee la mayoría;
  - Lany más canchero: gorra, saco o chaleco según el área; más masculino, más esbelto, más alto, con menos lana, otras posturas; que
    se note que es oveja pero más adulto; mejorar la UX con Lany;
  - trivia con preguntas creativas («qué pasó después»), curiosidades y datos muy interesantes, siempre bien chequeados;
  - al ganar una pieza, ver a Lany poniéndosela;
  - los libros ya están en el repositorio nuevo; la música de inicio sonaba infantil (que sea de juego, moderna, elegante); «Ubicar»
    no encontraba direcciones; licencias, después; el token, como está; la mejor UX del mercado; avanzar con todo.
- **Decidido:**
  - **El evangelio enseña la doctrina del estudio tal cual** (excepción a «nada de doctrinas secundarias», solo para esta área; en las
    demás la regla sigue). Donde un texto se lee de más de una manera, un «¿Sabías que…?» lo dice con su fuente. El nombre del
    ministerio y su material siguen solo en el repositorio privado de la app.
  - **La Biblia de la app con la ortografía actual** (RV1909, mismas palabras de dominio público): acentos, nombres, gentilicios,
    «creó». Los ejercicios eligen versículos y huecos que se leen igual en la RVR1960.
  - **Lany pasa a ser un personaje adulto** (unas 3,3 cabezas, torso en V, lana corta, cara alargada) con ropa por área (criterio de
    Claude: chaleco para recorrer, saco para estudiar, gorra al aire libre, boina con lo antiguo), posturas nuevas y la armadura pieza
    por pieza, con el gesto de ponerse cada una.
  - **Trivia:** 71 preguntas nuevas verificadas contra el texto, con un dato que sale del texto y se ve al responder; el validador
    controla las comillas del dato.
  - **«Ubicar en el mapa»** busca en OpenStreetMap (Nominatim) respetando su política de uso; el buscador del teléfono queda de respaldo.
  - **Música de inicio:** «Salón», composición propia; tres temas de Kevin MacLeod (CC BY 4.0) para comparar en la Consola.
- **Hecho por Claude (APK prueba 15, versión 0.15.0):** todo lo anterior; inventario de LIBROS-REFERENCIA3 solo con los nombres de los
  archivos (470 de autores protestantes reconocidos; 52 con reservas; el resto no se abre); proyecto v3.7: capítulo 40, estado, mapa e
  inventario.
- **Pendiente del fundador:**
  - probar la prueba 15 (pasos en la Consola);
  - elegir la música de inicio (o dejar «Salón»);
  - confirmar los libros con reservas y avisar si algún autor quedó mal clasificado;
  - decidir licencias y figura legal (sin cambios desde DEC-2026-10-16-1).
- **Evidencia:**
  - `oportunidades/proyectos/senda/capitulos/40-lany-adulto-armadura-trivia.md`;
  - repositorio de la app: `scripts/rive/lani.py`, `scripts/rive/poses.cjs`, `src/componentes/laniRiveComun.ts`,
    `src/componentes/festejoPieza.tsx`, `scripts/autor/trivia_creativa.py`, `scripts/ortografia.py`, `docs/ORTOGRAFIA.md`,
    `src/util/lugares.ts`, `scripts/musica_inicio.py`, `docs/LIBROS_REFERENCIA3.md`.

## DEC-2026-10-17-1 · Senda: decimosexta tanda (prueba 16), Lany v3, la marca nueva, la Biblia libro por libro, juegos que enseñan e ideas para ser la número uno

- **Contexto:** el fundador escribió el 17-10-2026 (resumen, sin citas textuales):
  - usar solo los libros de referencia que resultaron confiables;
  - música de inicio más divertida, con sintetizadores, tipo synth-pop;
  - la travesía de cada libro de la Biblia con todo (género, de qué trata, contexto histórico y geográfico, personajes, historia, cómo
    apunta a Cristo, tema, teología, autor y fecha, antecedentes y cómo se conecta con lo que sigue);
  - explorar y crear juegos de mesa y de rol con historias, para aprender y crecer en la fe (muy importante);
  - rediseñar a Lany como personaje memorable y central de la UX, con muchas expresiones y animaciones fluidas, usando Rive a fondo;
  - llevar la UX/UI a otro nivel para que no parezca una app cristiana genérica; revisar el parecido de la Travesía con Duolingo;
  - un logo nuevo, memorable y que funcione como ícono y avatar; todas las ideas para ser la app cristiana número uno; avanzar con todo.
- **Decidido:**
  - **Libros:** solo los 470 confiables, para entender; los 52 con reservas no se usan (DEC-2026-10-16-2 queda confirmado).
  - **Lany v3** en Rive por código: 16 expresiones en una capa propia, manos con gestos, reacciones que crecen con la racha, ocio (se
    estira y se duerme) y pose orando. Sigue sin hablar.
  - **Marca: «la puerta abierta»** (puerta en arco, luz y senda), con todas las piezas para la app y las redes.
  - **La Travesía deja la firma visual de Duolingo** por la senda iluminada (puertas, luz que avanza, hitos); quedan solo los patrones
    de toda la industria.
  - **Guía de los 66 libros** en el «+», con fechas aproximadas marcadas y «cómo apunta a Cristo» con base (lo dice el Nuevo Testamento
    o es lectura cristiana, marcada); las travesías de Rut y Jonás son el modelo de los otros 64.
  - **Juegos:** «Vivir la historia» en la app (5 historias) y el kit imprimible de La puerta y Crónicas de la senda, gratis; compartirlo
    con el ministerio aliado espera al fundador (envío a terceros).
  - **Ideas para ser la número uno:** doce priorizadas por valor esperado y esfuerzo, cada una con quién la lleva a la gente, costo y
    regla de corte (`ideas_numero_uno.yaml`); el fundador vota en la Consola y el voto ordena el sprint 2.
- **Hecho por Claude (APK prueba 16, versión 0.16.0):** todo lo anterior, más el desafío del día (con resultado para compartir), la
  historia en una línea, Quién es quién (capítulo 1), la prueba de nivel de 2 minutos y la primera lección al terminar la bienvenida;
  la música synth-pop «Neón» con dos variantes; proyecto v3.8 (capítulo 41, estado, mapa e inventario con 18 personajes nuevos).
- **Pendiente del fundador:** probar la prueba 16; votar las ideas; elegir la música; decidir si se comparte el kit; y lo que ya
  estaba (licencias y figura legal, API.Bible, Sociedad Bíblica Argentina, revisores, Google Play antes del 15-11).
- **Evidencia:**
  - `oportunidades/proyectos/senda/capitulos/41-lany-v3-marca-libros-juegos.md`, `oportunidades/proyectos/senda/ideas_numero_uno.yaml`;
  - repositorio de la app: `scripts/rive/lani.py`, `scripts/marca/marca.py`, `src/componentes/sendaIluminada.tsx`, `docs/UX_PRUEBA16.md`,
    `scripts/musica_synthpop.py`, `scripts/autor/guias_libros.py`, `scripts/autor/libro_a_libro.py`, `scripts/autor/quien_es_quien.py`,
    `scripts/autor/historias_rol.py`, `docs/JUEGOS_MESA_ROL.md`, `scripts/kit_mesa.py`, `src/componentes/desafioDia.tsx`,
    `src/pantallas/Linea.tsx`, `src/componentes/pruebaNivel.tsx`.

## DEC-2026-10-17-2 · Senda: decimoséptima tanda (prueba 17), claridad que no enseña errores, lecciones que entran en la pantalla, música publicitaria y las ideas votadas

- **Contexto:** el fundador escribió el 17-10-2026 (resumen, sin citas textuales):
  - una pregunta de Historia de la Iglesia daba como respuesta la frase del error de Arrio: quien solo responde podía aprenderlo; todo
    tiene que ser lógico, claro y sin prestarse a confusión (textos, preguntas, huecos);
  - en la Travesía a veces hay textos tapados y en las respuestas a veces hay que deslizar para seguir;
  - cambiar otra vez la música de inicio por algo más tipo publicitaria, libre si hace falta;
  - el kit de juegos, no por ahora; el animador de Rive (USD 1.200) no se puede pagar: que Claude pula a Lany;
  - ya votó las ideas para ser la número uno; avanzar con todo lo próximo y pendiente.
- **Decidido:**
  - **Regla de redacción para toda la app** (docs/REDACCION.md): la respuesta correcta siempre dice algo verdadero; el error se nombra
    como error; las mentiras que cita la Biblia, como mentira; en doctrina, el verdadero o falso afirma la verdad. El validador da
    error si se nombra a un hereje sin decir que era un error.
  - **La lección se compacta sola** si no entra en la pantalla; la letra del sistema, hasta 1,2 veces.
  - **Música de inicio: «Nonstop», de Kevin MacLeod** (CC BY 4.0, con el crédito en la app). FreePD (CC0) cerró (HECHO, 17-10-2026).
  - **Kit imprimible en pausa.** **Sin animador pago:** Claude pule a Lany con código.
  - **Ideas:** se hacen las votadas que no necesitan cuentas (temporadas, Tu año, el sitio, más libros); el sello de confianza, votado
    que no, sale de los planes; proyector, ligas, duelos y líderes esperan las cuentas.
  - **Voz de la Biblia narrada:** no se usa la voz Piper elegida para audio que se reparte, porque hereda una base con licencia solo
    para investigación (lessac, Blizzard 2013). Recomendación: lanzar con la voz del teléfono y pagar una voz con licencia comercial
    (ESTIMACIÓN: USD 100 a 300) solo si más del 20 % de los usuarios activos usa «Escuchar» cada semana al mes del lanzamiento.
    Espera la confirmación del fundador.
- **Hecho por Claude (APK prueba 17, versión 0.17.0):** lo anterior, más los desafíos con fecha (Adviento 2026, enero y Semana Santa
  2027), «Tu año en la Palabra», el sitio estático de las 66 guías y Quién es quién (falta publicarlo), Habacuc jugable (3 de 66
  libros), Lany más viva (reposo, parpadeo, suspiro) y el globo de Lany que ya no queda tapado; proyecto v3.9 (capítulo 42, estado,
  mapa e inventario).
- **Pendiente del fundador:** probar la prueba 17; escuchar la música (y elegir otra si quiere); decidir el camino de la voz; crear la
  cuenta de Cloudflare para publicar el sitio; y lo que ya estaba (licencias y figura legal, API.Bible, Sociedad Bíblica Argentina,
  revisores, Google Play antes del 15-11, Supabase).
- **Evidencia:**
  - `oportunidades/proyectos/senda/capitulos/42-claridad-lecciones-temporadas.md`, `oportunidades/proyectos/senda/ideas_numero_uno.yaml`;
  - repositorio de la app: `docs/REDACCION.md`, `scripts/validar_contenido.py`, `src/pantallas/Leccion.tsx`, `src/pantallas/Travesia.tsx`,
    `scripts/musica_publicitaria.py`, `assets/sonidos/CREDITOS.md`, `scripts/rive/lani.py`, `src/datos/temporadas.ts`,
    `src/pantallas/Anio.tsx`, `scripts/sitio_web.py`, `web/`, `scripts/autor/habacuc.py`;
  - licencias de voz: model cards de rhasspy/piper-voices (es_MX-ald, es_ES-davefx, en_US-lessac) y la licencia de Blizzard 2013 en
    cstr.ed.ac.uk (consultadas el 17-10-2026).

## DEC-2026-10-17-3 · Senda: decimoctava tanda (prueba 18), cobros y figura legal, el plan con Max, «¿Quién es?» y la fábrica de difusión

- **Fecha:** 17-10-2026. **Quién:** el fundador pide; Claude ejecuta y recomienda.
- **Pedido (resumen, sin citas textuales):**
  - no llega a probar el APK pero no quiere atrasar el proyecto: ir a fondo con todo lo próximo, con calidad antes que velocidad;
  - seguir puliendo a Lany (Rive, 3D, todo lo posible), mejorar la UX y avanzar con la Travesía y con la cantidad de preguntas;
  - con Claude Max de USD 100, qué aprovechar para que Senda sea un éxito (publicidad, ideas, desarrollos);
  - a qué cuenta va lo que paguen las suscripciones y lo que dejen los anuncios, cómo funciona y qué hace falta en lo legal;
  - seguir explorando juegos de mesa y de rol; recordó el Adivina quién como un juego muy bueno.
- **Decidido / recomendado:**
  - **Cobros (recomendación, decide el fundador):** Google Play y AdMob pagan en dólares, por transferencia desde EE.UU., a una cuenta
    en dólares a nombre del titular del perfil de pagos (HECHO, centros de ayuda de Google, 17-10-2026). Lanzar con cuenta personal,
    **con anuncios y sin compras dentro de la app** (solo las cuentas que venden muestran su dirección completa); antes del primer
    pago, caja de ahorro en dólares y monotributo con factura E (desde la «A» 8481 del BCRA los dólares pueden quedar en dólares, sin
    tope); **decidir la SAS en diciembre y crearla en enero de 2027**, antes de prender las suscripciones; botón de arrepentimiento y
    de baja (Disposición 954/2025) comprometido en los términos. Todo se re-verifica con un contador antes de facturar.
  - **Plan con Max (recomendación, decide el fundador):** si pasa a Max, que sea antes del lanzamiento; el uso extra va a lo que no
    necesita al fundador y acumula valor: la Biblia entera jugable (2 a 3 libros por semana), trivia hacia 2.000 con doble revisión y
    dos lotes de videos por semana; después, los juegos de grupo (con Supabase), el sitio (con Cloudflare) y el portugués. **Regla de
    corte:** si a los 60 días lo producido por semana no se duplica respecto de octubre, se vuelve a Pro.
  - **«¿Quién es?» y «En la frente»:** la mecánica de adivinar con preguntas de sí o no es de dominio común y de más de 20 años; nombre,
    aspecto y tarjetas propios. Todo enseña: cada «sí» con su versículo y un repaso al final.
  - **Difusión sin cara:** la fábrica de videos y los stickers quedan hechos; publicar es decisión del fundador (regla 8).
- **Hecho por Claude (APK prueba 18, versión 0.18.0):** trivia de 228 a 410 preguntas revisadas contra la RV1909; Abdías y Hageo
  jugables (5 de 66 libros) y Quién es quién capítulo 2 (244 lecciones); «¿Quién es?» (23 personajes verificados) y «En la frente»;
  Lany asiente y niega en Rive; 13 stickers animados; la fábrica de videos verticales y su primer lote de 7; pantallas angostas sin
  títulos cortados; la pestaña Difusión en la Consola; proyecto v3.10 (capítulo 43, estado, mapa, inventario e ideas).
- **Pendiente del fundador:** probar la prueba 18 cuando pueda; crear las cuentas de difusión y publicar; decidir Max; Google Play
  antes del 15-11; la cuenta en dólares y el monotributo antes del primer pago; la empresa en diciembre; y lo que ya estaba (licencias,
  API.Bible, Sociedad Bíblica Argentina, revisores, Supabase, Cloudflare, la voz).
- **Evidencia:**
  - `oportunidades/proyectos/senda/capitulos/43-cobros-max-quien-es-difusion.md`, `conocimiento/2026-10-17-senda-cobros-cuentas-y-figura-legal.md`,
    `oportunidades/proyectos/senda/ideas_numero_uno.yaml`;
  - repositorio de la app: `scripts/autor/trivia_banco2.py`, `scripts/autor/abdias.py`, `scripts/autor/hageo.py`,
    `scripts/autor/quien_es_quien.py`, `scripts/autor/quien_soy.py`, `src/pantallas/QuienEs.tsx`, `src/pantallas/EnLaFrente.tsx`,
    `scripts/rive/lani.py`, `scripts/difusion/`, `docs/JUEGOS_MESA_ROL.md` §6, `src/datos/legal.ts`;
  - precios de Claude: guías de precios de 2026 (noqta.tn, heyuan110.com, consultadas el 17-10-2026); verificar en claude.com/pricing.


## DEC-2026-10-18-1 · Senda: decimonovena tanda (prueba 19), Lany con volumen, «¿Quién es?» y «Vivir la historia» rediseñados, música, difusión y cobros

- **Fecha:** 18-10-2026. **Quién:** el fundador pide; Claude ejecuta y recomienda.
- **Pedido (resumen, sin citas textuales):** seguir a fondo con Lany y la UX hasta ser la mejor app de la tienda, usando Rive u otros
  programas y estudiando otras apps; repensar la mecánica de «¿Quién es?» (preguntas libres o variables, muñequitos o caras); encontrar
  el objetivo de «Vivir la historia» o sacarlo, con animación de lo que se elige; música de fondo para los juegos y una música de inicio
  muy buena; colores menos llanos; por qué «Lany en 3D» no cambiaba nada y si conviene siempre 3D; difusión concreta y barata; qué
  hacer desde ahora para cobrar; seguir con trivia y travesías.
- **Decidido / recomendado:**
  - **Lany 2D con volumen en toda la app; 3D solo en la fiesta** (recomendación): el 3D permanente perdería las 15 expresiones y gastaría
    batería; se revisa si Rive suma 3D o hay presupuesto para un animador. El ajuste pasó a llamarse «Fiesta en 3D» y muestra qué hace.
  - **«Vivir la historia» v2:** de cuatro caminos (sacarlo, relato sin decisiones, finales alternativos, encrucijadas reales), se eligió
    **encrucijadas reales con espejo**: nunca se altera lo que cuenta la Biblia, no hay puntos por coincidir, y el aprendizaje está en el
    porqué. Láminas animadas dibujadas con código; Jesús nunca se dibuja.
  - **Música (decide el fundador):** fuente nueva de compositores profesionales con licencia para apps; «Driving Ambition» por defecto y
    ocho alternativas en la Consola; cinco bucles de fondo, bajos y apagables.
  - **Difusión (decide el fundador):** once métodos sin costo salvo premios y dominio; sorteos solo con bases y autorización (en CABA,
    LOTBA, fuente secundaria), preferir concursos de habilidad; nada de «etiquetá a tres amigos» (Meta lo prohíbe); plan de 90 días.
  - **Cobros (decide el fundador):** la lista de 12 pasos del capítulo 44 §8; público 13+; sitio con política de privacidad y app-ads.txt;
    AdMob cobra desde USD 100; Hyperwallet disponible para Argentina (fuente secundaria).
- **Hecho por Claude (APK prueba 19, versión 0.19.0):** sistema de color v2; Lany con sombra y luz de dos tonos en Rive y mirada hacia la
  tarjeta; «¿Quién es?» v2 (41 rasgos, sugerencias, 41 retratos, tableros de 12/16/20); «Vivir la historia» v2 (7 historias, 23
  encrucijadas, 16 láminas, el espejo, validador ampliado); música de inicio y de fondo con ajuste; trivia 560 (+150); Joel, Sofonías,
  Filemón, 2 y 3 Juan y Judas jugables (10 de 66) y la ruta «Las cartas» (261 lecciones); proyecto v3.11 (capítulo 44, estado, mapa,
  inventario, ideas, bitácoras).
- **Pendiente del fundador:** probar la prueba 19; elegir la música de inicio en la Consola; decidir la difusión y crear las cuentas;
  Google Play antes del 15-11; lo de siempre (licencias, API.Bible, Supabase, Cloudflare, Max, SAS).
- **Evidencia:** `oportunidades/proyectos/senda/capitulos/44-lany-volumen-vivir-la-historia-musica-difusion.md`,
  `conocimiento/2026-10-17-senda-benchmark-ux-color-sonido.md`, `conocimiento/2026-10-18-senda-difusion-cobros-y-vivir-la-historia.md`;
  repositorio de la app: `scripts/rive/lani.py`, `scripts/arte/retratos.py`, `scripts/arte/laminas.py`, `scripts/autor/quien_soy.py`,
  `scripts/autor/historias_rol.py`, `scripts/autor/libros_cortos.py`, `scripts/autor/trivia_banco3.py`, `scripts/musica_fondo.py`,
  `src/componentes/lamina.tsx`, `src/pantallas/Historias.tsx`, `src/pantallas/QuienEs.tsx`, `src/tema.ts`.

## DEC-2026-10-19-1 · Senda: vigésima tanda (prueba 20), textos claros y glosario, Lany graciosa, juegos en grupo, fiesta, calendario y widget

- **Fecha:** 19-10-2026. **Quién:** el fundador pide; Claude ejecuta y recomienda.
- **Pedido (resumen, sin citas textuales):** más animaciones y más gracia en Lany (que se desmaye al errar) con investigación de
  otras mascotas; arreglar el doble «Siguiente» y las áreas que no se desmarcaban en la bienvenida, con menos opciones; intros de
  lección cortas y hermosas; revisar las travesías línea por línea (los ángeles, Babel, «caridad», «potencia y divinidad», lo
  básico explicado); repaso opcional menos invasivo; globos de Lany que no se pisen; mucha más fiesta y una pantalla de pieza con
  tablero grande y menos texto; calendario en pasos y evaluar lugar, enlace y notas; widget del versículo; un juego de nombres por
  letra para grupos; «¿Quién es?» contra alguien con preguntas escritas; «Vivir la historia» interactivo y útil; verificar que
  ningún libro no confiable se usó; registrar el entorno de prueba para líderes y la idea de los kits por puntos.
- **Decidido / recomendado:**
  - **Glosario automático y redacción:** 95 palabras explicadas (RV1909 y términos básicos) inyectadas en 256 lecciones y
    resaltadas en la historia; ocho preguntas sin contexto reescritas; «caridad» siempre como amor (dentro de la licencia: las
    comillas siguen siendo texto exacto de 1909 y la explicación va afuera).
  - **Lany:** cinco gestos nuevos en Rive (patatús, mano a la cara, mareo, taparse los ojos, giro); al errar, la primera vez el
    «uff» clásico y después una reacción distinta cada vez; nunca burla. Investigación: Duolingo no tiene reacciones al error (espacio
    libre), Lily mezcla 64 variaciones de reposo, Finch genera apego por nombre y espera; la viralidad viene de años de
    personalidad coherente antes de cualquier golpe.
  - **«¿Quién es?»:** se suma «contra alguien» (recomendación: no sacar a Lany; su intérprete pasó a raíces, sinónimos, tipeo y
    desempate por especificidad, y se agregaron los rasgos «guerra» y «esposo o esposa» que pedían las preguntas naturales).
  - **«Vivir la historia» en grupo** (voto secreto, votos a la vista, un minuto de charla con pregunta escrita, espejo de cada uno)
    y copy nuevo cuando el personaje hizo otra cosa. **«Nombres por letra»** nuevo, con 255 nombres verificados.
  - **Fiesta:** confeti y globos en lección, capítulo y pieza; pantalla de pieza con tablero grande, «n de 6» y frase; versículo chico.
  - **Calendario:** evento en tres pasos; lugar, enlace y notas se quedan (sirven a los grupos) pero plegados; la tarjeta de Inicio
    solo con eventos. **Widget** «Versículo del día» con react-native-android-widget (Android 16 lo muestra en la pantalla de bloqueo).
  - **Libros:** manda la clasificación A del fundador; 76 títulos del inventario anterior quedaron afuera; ninguno se había usado.
  - **Registrado:** entorno de prueba para líderes (hito previo a la prueba cerrada, cuando existan cuentas) y «10 kits por puntos»
    como método 12 de difusión (capítulo 44 §7.1; necesita bases y, si es sorteo, autorización; concurso de habilidad si gana el
    puntaje).
- **Pendiente del fundador:** probar el APK prueba 20; la música de inicio en la Consola (sigue sin elegirse).
- **Registro:** capítulo 45 y `conocimiento/2026-10-19-senda-mascotas-widgets-y-juegos-en-grupo.md`; en la app,
  `scripts/autor/glosario.py`, `scripts/autor/nombres.py`, `src/componentes/textoRico.tsx`, `src/componentes/fiesta.tsx`,
  `src/pantallas/Letra.tsx`, `src/widget/`.


## DEC-2026-10-19-2 · Senda: vigésima primera tanda (prueba 21), la misión de la semana, «Cómo se juega» y un calendario más simple

- **Fecha:** 2026-10-19 · **Quién:** el fundador pide; Claude recomienda y construye.
- **Pedido:** explicar las instrucciones de cada juego antes de empezar, fácil y sencillo; «Vivir la historia» no le cierra (una vez
  hecha queda tildada): una historia por semana como desafío, individual, con más opciones y más difíciles, varios pasos y puntos;
  sacar el modo en grupo; al lanzar, una sola historia; textos más amigables; si se erró, que no quede completada sino para volver a
  hacerla bien. Calendario sin clasificaciones: el título y listo; el día con un calendario dinámico y lindo; la hora como en la
  alarma, deslizando o escribiendo; después si se repite; más compacto. Revisar la UX en general y avanzar con todo lo pendiente.
- **Decidido / hecho:**
  - **«Vivir la historia» v3, la misión de la semana:** una historia por lunes desde una fecha de inicio (hoy 19-10-2026 para
    probar; **antes del lanzamiento se pone el lunes en que sale la app**); 6 a 8 pasos, 4 opciones parecidas por paso con el porqué
    de cada error; se cumple solo sin errores; 50 talentos en su semana y 25 después; la misión de la semana en Inicio. Siete
    historias hasta el 30-11. Se sacó el modo en grupo (pedido del fundador). Las opciones correctas ya no se adivinan por el largo
    (regla nueva del validador).
  - **«Cómo se juega»** en los siete juegos, sola la primera vez y siempre a mano.
  - **Evento en cuatro pasos:** título (el tipo sale solo del título), día en el calendario del mes, hora con ruedas de alarma o
    escrita, y al final repetición, aviso y «Más opciones».
  - **Lo previsto:** Quién es quién capítulo 3 (poetas y profetas), trivia de 602, tableros por tema en «¿Quién es?».
  - **Corregido:** pantallas transparentes en la web por una animación que arrancaba antes de montar la vista.
- **Pendiente del fundador:** probar el APK prueba 21; siguen abiertas la música de inicio, licencias y figura legal, la voz y la
  cuenta de Google Play antes del 15-11.
- **Registro:** capítulo 46; en la app, `scripts/autor/historias_rol.py`, `src/estado/misiones.ts`, `src/pantallas/Historias.tsx`,
  `src/componentes/comoSeJuega.tsx`, `src/componentes/rueda.tsx`, `src/pantallas/Evento.tsx`, `scripts/autor/trivia_banco4.py`.

## DEC-2026-10-19-3 · Senda: vigésima segunda tanda (prueba 22), licencias pagando, visual a fondo, tiendas, contenido e idiomas

- **Fecha:** 2026-10-19 · **Quién:** el fundador pide; Claude recomienda y construye.
- **Pedido:** evaluar a fondo incluir una licencia de las Biblias (no importa pagar al empezar); en trivias, travesías y juegos,
  más diagramas, líneas de tiempo e imágenes animadas, todo lo que sume a la diversión y la UX; ver si ya vamos a Play Store y App
  Store (qué falta, cómo seguimos); a fondo con los contenidos de trivia y travesías; ver si se puede iniciar portugués e inglés.
- **Decidido / hecho:**
  - **Licencias, plan pagando (recomendación; el fundador decide):** API.Bible Pro + NTV ahora (USD 29 + 10 a 25 por mes al
    empezar; 150 por versión con 50.000 usuarios); la **SAS en noviembre** (adelantada de enero) como titular de licencias y
    cuentas; con la SAS, la RVR1960 por la Digital Bible Library y el formulario de la ABS; la NVI no se vende para apps con
    ingresos (sigue en un toque desde Bible.com). La YouVersion Platform (gratis, 1.487 Biblias, pero sin anuncios ni
    suscripciones) queda como plan B del camino «ministerio sin ingresos». La regla de corte del 13-10 (hasta el 10 % del ingreso
    neto) sigue como tope, no como condición para empezar.
  - **Sistema visual:** mapas sobre costas y ríos reales (Natural Earth; 54 lugares, 6 recorridos, 4 encuadres), seis líneas de
    tiempo, ocho diagramas por capas y las láminas, en portadas, preguntas, trivia («tipo con imagen»), prueba de nivel, desafío del
    día y el final de «Antes o después». Regla: un visual nunca regala la respuesta; la línea de tiempo en «ordenar» aparece al
    responder. El visual va antes del texto en la portada.
  - **Tiendas:** flujos de firma y AAB para Play, `eas.json` y `app.json` para iOS, textos de ficha, clasificación y seguridad de
    datos (`docs/TIENDAS.md`); falta lo que solo hace el fundador: cuentas (Play USD 25, Apple USD 99 por año, Expo gratis), sitio
    público con la política de privacidad y 12 testers.
  - **Contenido:** rutas «El mapa de la Tierra Santa» y «La gran línea de tiempo» (12 lecciones), Quién es quién capítulos 4 y 5
    (12 lecciones; la ruta completa), trivia banco 5 (42 nuevas, 8 con mapa; 644 en total). Travesía: 421 niveles, 291 lecciones.
  - **Idiomas:** selector en Ajustes (español, portugués, inglés); Biblias libres en portugués (Bíblia Livre, Nova Bíblia Viva) e
    inglés (BSB, WEB) dentro de la app; pestañas traducidas; el contenido se traduce ruta por ruta en 2027, primero portugués.
  - **Vista previa:** `?demo=leccion:ID` y `?demo=espadeo:ID` abren una lección o una pregunta directo (Consola y pruebas).
- **Pendiente del fundador:** pagar la NTV en API.Bible; crear la SAS en noviembre; cuentas de Play, Apple y Expo; publicar el
  sitio; 12 testers; opcional, consultar a YouVersion por un acuerdo comercial. Siguen abiertas la música de inicio, la voz, Claude
  Max y la cuenta de Play antes del 15-11. Probar el APK prueba 22 (incluye el 21, que no llegó a probar).
- **Registro:** capítulo 47; bitácora `conocimiento/2026-10-19-senda-licencias-pagas-tiendas-idiomas.md`; en la app,
  `scripts/arte/mapa_biblia.py`, `scripts/arte/diagramas.py`, `scripts/autor/lineas.py`, `scripts/autor/visuales.py`,
  `scripts/autor/tierras.py`, `scripts/autor/quien_es_quien_45.py`, `scripts/autor/trivia_banco5.py`, `src/componentes/visual.tsx`,
  `src/componentes/mapaBiblia.tsx`, `src/componentes/lineaTiempo.tsx`, `src/componentes/diagrama.tsx`, `src/i18n/textos.ts`,
  `eas.json`, `.github/workflows/firma.yml`, `.github/workflows/aab.yml`, `docs/TIENDAS.md`.

## DEC-2026-10-19-4 · Senda: vigésima tercera tanda (prueba 23), blindaje legal y versiones sin confusión

- **Fecha:** 2026-10-19 · **Quién:** el fundador pide; Claude investiga, recomienda y construye.
- **Pedido:** seguir con la prueba 23 sin esperar la prueba del 22; antes que nada, investigar exhaustivamente todos los riesgos
  legales (plagio, imitar apps o juegos, música, contenido, nombres, imágenes) con ley y casos, y reforzar; que el último APK traiga
  todas las modificaciones. Después: evaluar con calma cómo evitar que la gente se confunda entre la RV1909 de la app y la RVR1960,
  con una UX muy amigable, fiel, sin texto gigante, manteniendo anuncios y suscripciones y contemplando que la RVR1960 no esté al
  principio.
- **Decidido / hecho (blindaje legal, capítulo 48):**
  - **Música:** la licencia gratuita de Mixkit no permite videojuegos (página oficial, 19-10): los seis temas se retiraron; toda la
    música es de Kevin MacLeod, CC BY 4.0, con crédito tema por tema («Nonstop» en la bienvenida, la elegida en la prueba 17).
  - **Lany v4:** cara, patas y manos canela (la v3, negra con lana clara y copete, compartía los rasgos distintivos de Shaun the Sheep);
    el fundador puede comparar en la Consola y pedir volver.
  - **Espadeo:** el casillero de la corona (igual que Preguntados) pasa a ser el yunque de la Armería. La ruta «Quién es quién» pasa a
    «Quién fue quién» (Hasbro vende «¿Quién es quién?»).
  - **Créditos completos** y **docs/LEGAL.md** (inventario de activos con licencia, nombres, reglas, lista de control antes de cada
    publicación); borrador de autorización escrita del ministerio aliado.
  - **Pendiente del fundador:** INPI (Senda y Lany, clases 9, 41, 42; ≈ ARS 41.000 por clase), una hora con un abogado de PI,
    la autorización del ministerio, el dominio (sendabiblia.com o .app).
- **Decidido / hecho (versiones, capítulo 49):** regla «una sola Biblia a la vista, con nombre, y la RVR1960 a un toque»: fila de
  versión en cada pasaje («RV1909 · escritura de hoy» + «RVR1960 ↗»), hoja «Las versiones, en una pantalla» (tres ideas) desde la
  fila, la Biblia y Ajustes; los ejercicios siguen leyéndose igual en las dos versiones. Para la prueba 24: la pregunta de la
  bienvenida («¿qué Biblia usan en tu iglesia?») y el glosario de palabras en el lector.
- **Registro:** capítulos 48 y 49; bitácora `conocimiento/2026-10-19-senda-blindaje-legal.md`; en la app, `docs/LEGAL.md`,
  `docs/legal/autorizacion_ministerio.md`, `scripts/musica_macleod.py`, `scripts/rive/lani.py` (paleta v4), `src/componentes/versiones.tsx`,
  `src/datos/legal.ts`, `tienda/` (gráfico y capturas de la ficha).

## DEC-2026-10-19-5 · Senda: lo legal sin romper la UX y las versiones medidas (recomendaciones que esperan decisión)

- **Fecha:** 2026-10-19 (noche) · **Quién:** el fundador pide; Claude evalúa y recomienda; decide el fundador.
- **Pedido:** que lo legal no rompa nada clave de la experiencia (evaluar el riesgo real de cada cambio y qué vale la pena), y revisar
  de verdad las diferencias entre la RV1909 y la RVR1960: cuántas, cuáles, si son significativas, cuáles peligrosas, cómo mitigar.
- **Evaluación (capítulo 48 §6):** regla «riesgo real × daño, contra lo que pierde la UX». Vale la pena: la música de MacLeod (riesgo
  cero hoy; la licencia de Mixkit excluye videojuegos), Lany v4 (la v3 era el esquema de Shaun the Sheep; la mascota es lo que primero
  mira un equipo de licencias), el yunque (la corona es la firma de Preguntados; costo mínimo) y «Quién fue quién» (gratis). A afinar:
  la fila de versión (versión repetida con la leyenda de abajo; salida de la app en medio de la lección). No se cambia nada más por
  lo legal: el camino, las reacciones de Lany, la ruleta, los juegos de mesa.
- **Medición (capítulo 49 §7 y bitácora `conocimiento/2026-10-19-senda-rv1909-vs-rvr1960.md`):** sin copiar la 1960. Se nota en uno
  de cada tres versículos (18 % con léxico viejo, 17 % con verbo y pronombre pegado, 99 nombres con grafía vieja); misma base textual
  en casi todo (25 versículos verificados: tres con lectura distinta, ninguno toca una enseñanza de la Travesía). Peligrosos: los falsos
  amigos («caridad», «salud», «conversación», «concierto», «reliquias», «pontífice», «parió») y «sepulcro»/«infierno» por «Seol»/«Hades».
  Unos 25 ejercicios usan una palabra vieja en su propio texto.
- **Espera decisión del fundador:**
  1. **Color de Lany:** elegir en la Consola entre canela (v4), gris pizarra y crema; nunca la cara negra con lana blanca y copete.
  2. **Música:** MacLeod hasta que haya ingresos; después, comprar las pistas con licencia de reproducción masiva en AudioJungle
     (ESTIMACIÓN USD 300–1.000 una vez) o una suscripción a Envato Elements registrando el proyecto. Aprobar cuando toque gastar.
  3. **Fila de versión afinada** (48 §6.3): sí o no, después de probar el APK 23.
  4. **Nombres propios como hoy** en la Biblia de Senda (grafía verificada con las Biblias modernas de la app): sí o no.
- **Lo que Claude hace en la prueba 24 salvo indicación en contra:** glosario en el lector con la lista medida; los ≈25 ejercicios y
  el validador más estricto; la lista de lecturas distintas; las fichas de «Seol», «Hades» e «infierno»; las dos variantes de color de
  Lany en la Consola.
- **Regla que queda:** antes de cualquier cambio por lo legal, la tabla de riesgo real contra costo de UX; si la experiencia pierde algo
  que se nota, se pregunta antes.

## DEC-2026-10-19-6 · Senda: vigésima cuarta tanda (prueba 24), las palabras de hoy, los nombres de hoy y los versículos clave

- **Fecha:** 2026-10-19 (noche) · **Quién:** el fundador pide y fija el criterio; Claude investiga y construye.
- **Pedido:** examinar despacio las diferencias con un ejemplar autorizado de la RVR1960 (solo para analizar; nada va a la app),
  mitigar las peligrosas, y responder: si hay un tope para citar la 1960 sin licencia, si se puede poner la mejor traducción entre
  paréntesis, y si para los versículos clave conviene una de las versiones libres de la app. Criterio del fundador: no hay que usar
  siempre la 1909; avanzar con todos los pendientes.
- **Hechos nuevos:** la Sociedad Bíblica Argentina permite citar hasta 500 versículos de la RVR1960 sin permiso escrito (menos del
  50 % de un libro y del 25 % de la obra, con la leyenda; sba.org.ar, 19-10-2026). La Palabra de Dios para ti es la versión libre
  de la app que más se parece a la 1960 en los versículos verificados (ESTIMACIÓN con método, capítulo 50 §4).
- **Decidido / hecho (capítulo 50):** glosario de la Biblia (185 palabras: falsos amigos, palabras viejas, medidas, palabras con
  carga de sentido) con tres modos en Ajustes: subrayadas y se tocan (de fábrica), la palabra de hoy entre corchetes («caridad
  [amor]»; solo las seguras), o nada; nombres propios con la grafía de hoy (987 lugares; «Líbano» corregido); 13 versículos clave
  con el mismo versículo en una versión libre y el aviso de lectura distinta en la hoja de estudio; once ejercicios y dos huecos
  reescritos; validador con la lista medida. El texto de la 1909 no cambia ninguna palabra.
- **Espera decisión del fundador:** mandar la consulta a la Sociedad Bíblica (`docs/legal/consulta_sba.md`); confirmar dónde
  quedó el ejemplar de la 1960 (no apareció en ningún repositorio visible el 19-10 a la noche); subrayado o corchetes de fábrica;
  cargar los versículos de lectura distinta en `rvr1960_citas.json` desde su ejemplar, dentro del cupo.
- **Regla que queda:** la 1909 es la Biblia de la Travesía y la trivia, no una obligación de lectura: la persona puede leer en la
  PDT, la NBV o la BES; y toda ayuda de versión se explica con palabras de Senda, nunca con texto de una versión con derechos.

## DEC-2026-10-19-7 · Senda: vigésima quinta tanda (prueba 25), Lany cae de verdad y la versión que mejor se lee en cada versículo

- **Fecha:** 2026-10-19 (noche) · **Quién:** el fundador pide y fija el criterio; Claude construye.
- **Pedido:** «cuando Lany se desmaya está muy dura; tiene que ser más fluido; andá a fondo con las animaciones, Rive, 3D, lo que
  haga falta»; y, por el ejemplo de Gálatas 5:22 («amor» en la NBV, «caridad» en la RV1909), validar versículo por versículo cuál de
  las versiones libres se lee mejor y usarla en cada trivia, travesía, versículo del día o juego.
- **Decidido / hecho (capítulo 51):** el desmayo y el patatús rehechos en Rive con los principios de animación (anticipación,
  tambaleo con las partes que llegan tarde, caída con gravedad, impacto con aplastar y rebote, asentamiento) y un estado nuevo
  «desmayada» en bucle (respira en el piso hasta que la app la levanta); verificado cuadro a cuadro y en la máquina de estados.
  Lany sigue 2D con volumen: lo que faltaba era oficio de animación, no otro motor (capítulo 44 §2 sigue en pie). Regla medible
  para la versión de cada pasaje fuera del lector: si la RV1909 trae un falso amigo, gana entre la PDT y la NBV la que tiene menos
  palabras difíciles en ese versículo (formas del glosario que las versiones modernas casi no usan; la BES solo si falta el
  versículo): 1.223 versículos (876 PDT, 342 NBV, 5 BES), chips para cambiar y el motivo a la vista; el lector, los ejercicios y la
  trivia siguen en la RV1909. Glosario con «longanimidad» y «benignidad».
- **También hecho:** mano a la cara, mareo y taparse los ojos con el mismo oficio, sin cambiar sus duraciones (capítulo 51 §6).
- **Espera decisión del fundador:** si la caída y las reacciones convencen; y lo pendiente de DEC-2026-10-19-6 (consulta a la Sociedad Bíblica, ejemplar de la 1960, subrayado o
  corchetes de fábrica, color de Lany, fila de versión afinada).
- **Regla que queda:** «se lee mejor» se mide (palabras difíciles por versículo), no se decide por gusto versículo por versículo; y
  toda mejora de Lany se busca primero en el tiempo de la animación (claves, retrasos, curvas) antes que en cambiar de tecnología.

## DEC-2026-10-20-1 · Senda: vigésima sexta tanda (prueba 26), el tachado automático, Lany con vida y más contenido

- **Fecha:** 2026-10-20 (madrugada) · **Quién:** el fundador pide y fija el criterio; Claude construye.
- **Pedido:** explicar en fácil lo de Lany 2D o 3D; que en «¿Quién es?» las tarjetas que no corresponden se tachen solas, de a una,
  con un sonido profesional sin derechos (investigar el Adivina quién del iPad); seguir mejorando la UX de Lany; avanzar con todo lo
  pendiente (trivia, travesías, juegos nuevos si corresponde, traducciones). Probará la última versión mañana.
- **Decidido / hecho (capítulo 52):** Lany es y sigue 2D (la explicación en fácil y la tabla de pros y contras quedan en el §2); el
  tachado automático con trazo de marcador y sonido propio (grabación CC0 + tock sintetizado; alternativas en la Consola; en el modo
  contra alguien, también cuando la pregunta se reconoce); dos gestos de vida en reposo (ojeada, rascar) con rutina que no repite;
  banco 6 de trivia (42 preguntas sobre versículos sin usar; 686 en total; `--repetidas` controla las repeticiones); Tito jugable (295
  lecciones); «¿qué Biblia usan en tu iglesia?» en la bienvenida; Inicio y Jugar en portugués e inglés con el plan del contenido
  (`docs/TRADUCCIONES.md`). Juegos nuevos: evaluados cinco, no se agrega ninguno hoy (capítulo 52 §7).
- **Queda para la prueba 27:** mapas y diagramas que faltan y la línea de tiempo unificada; 1 y 2 Timoteo; más interfaz traducida.
- **Espera decisión del fundador:** el sonido del tachado (si prefiere otro de la Consola) y lo pendiente de las pruebas 24 y 25.
- **Regla que queda:** toda pregunta nueva de trivia se escribe sobre un versículo que ningún banco use todavía (`--repetidas`), y
  los juegos nuevos se agregan solo cuando enseñan algo que los siete que hay no enseñan.

## DEC-2026-10-20-2 · Senda: vigésima séptima tanda (prueba 27), la espada en la mano, la armadura entera y 1 y 2 Timoteo

- **Fecha:** 2026-10-20 · **Quién:** el fundador pide y fija el criterio; Claude construye.
- **Pedido:** que Lany agarre bien la espada (parecía «agarrada de arriba») y que el festejo de cada pieza se vea mejor; que al
  ganar las seis piezas aparezca Lany con toda la armadura; volver a buscar el ejemplar de la RVR1960 (él cree haberlo subido a
  LIBROS-REFERENCIA3); sacar de la bienvenida «¿qué Biblia usan en tu iglesia?»; que la bienvenida no salte sola antes de
  «Siguiente»; avanzar a fondo con todo lo pendiente y entregar una sola APK consolidada.
- **Decidido / hecho (capítulo 53):** la espada rehecha en Rive (nace dentro del puño, la hoja sigue el antebrazo: al piso en reposo,
  al cielo en alto; el giro lo decide cada pose); el festejo de pieza con Lany grande en el centro y la pieza que vuela hasta ella;
  la armadura completa con Lany en guardia poniéndose la última pieza y festejando; la bienvenida sin ese paso y sin avance
  automático (una sola regla: «Siguiente» avanza); 1 y 2 Timoteo jugables (12 lecciones; 307), banco 7 de trivia (728), diagramas
  del templo de Salomón y de la estatua de Daniel, la línea de los imperios, 84 visuales más (144 lecciones con visual), la línea de
  tiempo unificada en «La historia en una línea», y más interfaz en portugués e inglés. El ejemplar de la 1960 no está en ningún
  repositorio al que la sesión llegue (cinco revisados con clon fresco): hay que adjuntarlo en el chat o dar el repositorio y la
  carpeta exactos.
- **Espera decisión del fundador:** dónde está el ejemplar de la 1960; el sonido del tachado (Consola); y lo pendiente de las
  pruebas 24 y 25 (consulta a la Sociedad Bíblica, subrayado o corchetes, color de Lany, fila de versión).
- **Regla que queda:** en la bienvenida nada avanza solo (las opciones marcan; «Siguiente» avanza); todo lo que Lany sostiene se
  dibuja dentro de la mano y sigue el antebrazo; cada APK de prueba trae todo lo anterior consolidado.

## DEC-2026-10-20-3 · Senda: vigésima octava tanda (prueba 28), el desmayo sin rigidez, el festejo en una pantalla y la trivia sin paréntesis

- **Fecha:** 2026-10-20 · **Quién:** el fundador pide y fija el criterio; Claude construye.
- **Pedido:** que Lany deje de desmayarse «con los brazos extendidos» (la animación seguía rígida), hecho despacio y bien; que el
  festejo de la pieza ganada entre en una sola pantalla con el botón abajo; que la trivia no muestre la palabra correcta con la forma
  de la RV1909 entre paréntesis, revisando si una versión libre trae la palabra de hoy; seguir despacio con todos los pendientes; y
  **cero plagio** (ni versiones con derechos ni los libros de referencia, que son para entender y nunca para replicar).
- **Decidido / hecho (capítulo 54):** el desmayo y el patatús rehechos de cero como un vahído de dibujo animado (mano a la sien con
  el codo afuera, mareo con el brazo que oscila por inercia, rodillas que ceden, caída con los brazos que llegan tarde, impacto con
  latigazo, antebrazo cruzado sobre la panza y el otro brazo flojo; una sola caída compartida por desmayo, desmayada y patatús); el
  festejo que mide lo fijo y le da a Lany el alto que sobra, con el tablero en una fila (probado en tres tamaños); 28 preguntas sin
  paréntesis, con el pasaje que se abre en la versión libre que trae la palabra de hoy (19 versículos forzados, con el motivo en la
  hoja) y cuatro nombres más con la grafía de hoy (Rode, Gayo, Gabaón, Malta; la reina de Sabá); Santiago y 1 Pedro jugables (12
  lecciones; 319); Ajustes y la lección por dentro en portugués e inglés (175 cadenas); APK 28 consolidada.
- **Espera decisión del fundador:** lo que revise de la Consola y «más cosas»; dónde está el ejemplar de la 1960; y lo pendiente de
  las pruebas 24 a 27 (consulta a la Sociedad Bíblica, subrayado o corchetes, color de Lany, fila de versión, sonido del tachado).
- **Regla que queda:** la trivia nunca cita la RV1909 entre paréntesis: la opción dice la palabra de hoy y el pasaje se abre en la
  versión libre que la trae (si ninguna la trae, se reescribe la pregunta); cero plagio quiere decir «no replicar ni copiar», no
  «no usar»: los libros de referencia confiables se usan para entender, ver cómo se arma un estudio y chequear doctrina, nunca se
  replica su estructura ni se copia su texto, y cuando una lección use una idea de un libro lo dirá con su fuente (aclarado por el
  fundador el 20-10 a la noche).

## DEC-2026-10-20-4 · Senda: vigésima novena tanda (prueba 29), la regla de los libros bien dicha, Hebreos y 2 Pedro, y los juegos en portugués e inglés

- **Fecha:** 2026-10-20 (noche) · **Quién:** el fundador corrige y pide; Claude construye.
- **Pedido:** probó el APK 28 («viene bien dentro de todo»); que la regla de cero plagio se cuente como es («no te pedí que *no
  uses* los libros, sino que no repliques ni copies y pegues; fijate bien todo esto»); que se explique qué es «el ejemplar de la
  1960» (no entendía la pregunta); corregir el «texto raro» del bloque de los tres desafíos del día en Inicio; y avanzar con todos
  los pendientes.
- **Decidido / hecho (capítulo 55):** la regla reescrita en todos los lugares donde estaba (capítulo 54 §7, CLAUDE.md, DEC-2026-10-20-3)
  y revisado que no quede ningún texto que diga «no usar los libros»; el ejemplar de la 1960 explicado desde el principio (es el
  archivo de la RVR1960 que dijo que cargaría en la prueba 24 para comparar versículo por versículo, solo análisis; no apareció en
  cinco repositorios; nada depende de él) y el pendiente de la Consola reescrito con esas palabras; «Misiones de hoy» traduce la
  clave al mostrarla (mostraba «mision.leerCapitulo»); Hebreos (8 lecciones) y 2 Pedro (4) jugables desde la RV1909, validados, lo
  interpretativo marcado y sin doctrinas secundarias (331 lecciones); la historia de la Iglesia en una línea (26 momentos con fuente)
  y 57 lecciones más con visual (188 de 331 en la portada); los siete juegos, «Cómo se juega» y los carteles de Lany en portugués e
  inglés (250 cadenas; 579 claves); APK 29 consolidada.
- **Espera decisión del fundador:** el archivo de la 1960 (adjuntarlo o decir que no lo tiene y se cierra); y lo pendiente de las
  pruebas 24 a 28 (consulta a la Sociedad Bíblica, subrayado o corchetes, color de Lany, fila de versión, sonido del tachado, lo de
  la Consola y «más cosas»).
- **Regla que queda:** lo que un informe diga sobre los libros de referencia tiene que decir exactamente esto: se usan para
  entender, para ver cómo se arma un estudio y para chequear doctrina; nunca se replica su estructura ni se copia su texto; una
  idea tomada de un libro va con su fuente. Y toda clave de traducción guardada en el estado se traduce al mostrarla; la vista
  previa se recorre entera, en los tres idiomas, antes de cada APK.

## DEC-2026-10-20-5 · Senda: trigésima tanda (prueba 30), Romanos y 1 Corintios, la interfaz entera traducida, tres misiones y 350 lecciones con visual

- **Fecha:** 2026-10-20 (noche) · **Quién:** el fundador pide seguir; Claude construye.
- **Pedido:** «Ok. Avanzá con los próximos siguientes! Luego reviso dónde está la versión de la RVR1960».
- **Decidido / hecho (capítulo 56):** los cuatro «próximos» del capítulo 55 §9: Romanos (11 lecciones) y 1 Corintios (10) jugables
  desde la RV1909, validados, lo interpretativo marcado (la elección, «todo Israel será salvo», el «yo» de Romanos 7, el velo, los
  dones, 1 Corintios 14:34-35, el orden de la resurrección) y sin doctrinas secundarias (352 lecciones); el resto de la interfaz en
  portugués e inglés hasta la última etiqueta de accesibilidad (1.312 claves), con los días, los meses, las fechas, el saludo y la voz
  que lee siguiendo el idioma; tres misiones más para «Vivir la historia» (Gedeón, Naamán, y Pedro y Cornelio: 19 pasos, 76 opciones,
  seis láminas nuevas; 10 misiones hasta el 21-12); visuales para 130 lecciones más (350 de 352; quedan 2 a propósito) con seis
  diagramas nuevos (el fruto del Espíritu, los «Yo soy», el Padre nuestro, un cuerpo, tres idiomas, Adán y Cristo); Éfeso y Estéfanas
  con la grafía de hoy; APK 30 consolidada.
- **Espera decisión del fundador:** el archivo de la 1960 (si aparece, se adjunta en el chat; si no, se cierra) y lo pendiente de las
  pruebas 24 a 29.
- **Regla que queda:** cuando el fundador dice «avanzá con los próximos», los próximos son los que el último capítulo dejó listados
  en «Pendientes y decisiones», en ese orden; una respuesta correcta de «Vivir la historia» no puede ser casi siempre la más larga
  (el validador lo controla); un visual se pone solo cuando dice algo verdadero del pasaje, y si no hay ninguno que no fuerce el texto,
  la lección queda sin visual.

## DEC-2026-10-21-1 · Senda: trigésima primera tanda (prueba 31), la app que se cerraba al abrir, la guardia y las 21 cartas

- **Fecha:** 2026-10-21 · **Quién:** el fundador reporta y pide; Claude investiga y construye.
- **Pedido:** «Instalé la app pero cuando la abro se cierra. No funciona. Arreglá eso y avanzá con todo lo próximo!».
- **Decidido / hecho (capítulo 57):** el cierre no se pudo reproducir (la parte nativa del APK 30 es idéntica a la del 28; el arranque
  entero corre sin error en Node con el preset de Android y un estado guardado como el del fundador; nada de Hermes nuevo; ningún id
  del contenido cambió; la compilación fue limpia), así que se endurecieron las causas plausibles (una traducción con clave inexistente
  o un tipo de evento guardado que ya no existe cerraban la app) y, sobre todo, se cambió lo que pasa cuando algo revienta: la guardia
  (primer módulo de todos) y la pantalla de fallo sin dependencias atrapan los errores al cargar, al dibujar y en segundo plano, y
  muestran el detalle para copiar y mandar, «Reintentar» y «Borrar lo guardado»; «Último fallo registrado» en Ajustes. Las 21 cartas
  jugables: 2 Corintios, Gálatas, Efesios, Filipenses, Colosenses y 1 y 2 Tesalonicenses (25 lecciones; 377 en la Travesía), desde la
  RV1909 con cada cita verificada, lo interpretativo marcado y sin doctrinas secundarias. Dos APK: 31 (solo el arreglo, publicada
  primero) y 31b (todo); se prueba la 31b.
- **No entró:** la primera ruta en portugués (una prueba entera; lo primero de la próxima).
- **Espera del fundador:** probar el APK 31b y, si se cierra o sale «Algo falló», pegar el detalle en el chat; lo pendiente de las
  pruebas 24 a 30.
- **Regla que queda:** ningún fallo de la app puede cerrarla en silencio: todo error se muestra con el detalle para copiar; ninguna
  función que traduce o que lee un dato guardado puede reventar por una clave o un id que ya no existe (devuelve la clave o cae en el
  valor por defecto); cuando un cierre no se puede reproducir, se endurecen las causas plausibles y se instrumenta la app para que la
  próxima vez el fallo se vea, en vez de apostar a una sola causa; si el arreglo urge, puede salir una APK sola con el arreglo y otra
  con todo al cerrar la prueba (se prueba la última).

## DEC-2026-10-21-2 · Senda: trigésima segunda tanda (prueba 32), «A grande história», la prueba de arranque en el repositorio y tres misiones

- **Fecha:** 2026-10-21 · **Quién:** el fundador pide («Continuemos con los próximos, luego chequeo todo lo que está en backlog»);
  Claude construye en el orden que dejó el capítulo 57 §8.
- **Decidido / hecho (capítulo 58):** la primera ruta de contenido en portugués: «El gran relato» entero como «A grande história»
  (47 lecciones con 286 preguntas, 9 capítulos, 65 niveles y las 6 líneas de tiempo que usan sus lecciones), en portugués de Brasil
  con «você», los nombres propios como los escribe la Bíblia Livre, «o SENHOR» por Jehová y cada cita textual de la Bíblia Livre;
  para eso, el motor de contenido traducido (un archivo por ruta e idioma con las claves del español; fusión clave por clave con el
  español de respaldo; lo estructural nunca se traduce; las citas se escriben solas con los nombres de los libros del idioma; entra en
  la lección, el jefe, el repaso, el camino, Inicio, el explorador y las líneas de tiempo) y el validador que exige la ruta entera y
  revisa cada lección contra la Biblia libre del idioma con las reglas de la RV1909. La prueba de arranque en Node queda dentro del
  repositorio (pruebas/arranque, «npm run prueba:arranque») y corre en GitHub Actions con el validador antes de compilar cada APK.
  Tres misiones más de «Vivir la historia» (José y sus hermanos, Elías en el Carmelo, el ciego de Juan 9; semanas 10 a 12; cinco
  láminas nuevas; 13 misiones hasta el 11-01-2027). APK 32 con todo.
- **No entró / queda en español a propósito:** los diagramas, los nombres de lugares de mapas y láminas, y los nombres de las áreas
  y rutas no traducidas (se traducen con los visuales y con cada ruta); «profetas mayores o más libros» (sin pedido del fundador) y el
  comparador de la RVR1960 (sin el archivo).
- **Espera del fundador:** probar el APK 32 (portugués en Ajustes → Idioma); el backlog que dijo que iba a chequear, ordenado en el
  capítulo 58 §7 (licencias, consulta SBA, INPI y abogado, autorización del ministerio, Google Play antes del 15-11, sitio, Claude Max,
  voz, color de Lany, entorno de líderes, el archivo de la 1960).
- **Regla que queda:** el contenido traducido se verifica contra la Biblia libre de su idioma con las mismas reglas que el español
  (huecos y frases palabra por palabra, entrecomillados en los pasajes de la lección, errores nombrados como error), y una ruta se
  publica en un idioma solo entera (lecciones, capítulos, niveles y líneas de tiempo); lo estructural (tipo, correcta, citas,
  visuales, lecturas) nunca se traduce y las citas se escriben solas en el idioma; un APK no se compila si el contenido tiene errores o
  si la app no arranca en la prueba automática.

## DEC-2026-10-23-1 · Senda: trigésima tercera tanda (prueba 33), empezar por el principio, la Travesía en tu orden, las copas y el peso

- **Fecha:** 2026-10-23 · **Quién:** el fundador pide (la serie de Personajes empezaba en los patriarcas y su primera pregunta daba
  por sabido a Abram; «comenzar por el principio, y terminar por el final» en todas las travesías y revisarlo todo «antes de seguir
  escalando»; el orden de la Travesía; la línea de tiempo en la Consola; la Pascua; el peso; y una lista de pedidos de la app).
  Claude investiga, construye y revisa.
- **Decidido / hecho (capítulo 59):** la Travesía en el orden del fundador, sin estantes (13 áreas; «Buenas obras» pasa a «Vivir la
  fe» y «Mártires» a «Historia de la Iglesia»; «Los últimos tiempos», que aparecía dos veces en su lista, queda una sola vez después de
  la Historia de la Iglesia). Personajes desde Adán: «De Adán a Noé» (13 lecciones) y «Los patriarcas» rehecha desde Génesis 11:26 (26
  lecciones); 24 fichas de personaje antes de cualquier pregunta. La regla nueva revisó las 405 lecciones (160 corregidas). La ruleta
  que se agarra, el tachado de a una en «¿Quién es?» con las preguntas revisadas, la rueda de la hora sin trabas, descansar a los 45
  minutos, la próxima copa en Inicio con campana y el puntaje por acierto y velocidad, fichas de juego, la entrada con Lany de brazos
  cruzados y la armadura, el nivel que nunca baja, la Almeida y la King James como referencia de los huecos en portugués e inglés, el
  peso medido (89,1 MB) y la carga al abrir reducida (72 módulos propios en lugar de 158), la línea de tiempo en la Consola con la
  Pascua 2027 (recorrido por Tierra Santa) como gran hito, y los sonidos elegidos el 22-10. APK 33 con todo.
- **No entró / queda a la vista:** Josué y Jueces antes de Rut y Oseas antes de Joel (libros que todavía no se escribieron; lo primero
  de contenido cuando se vuelva a escalar); R8 (va solo en el APK 34, para medir y comprobar que abre); la captura de Preguntados no
  llegó (la entrada salió de la descripción).
- **Espera del fundador:** probar el APK 33; el álbum (DEC-2026-10-23-2); reenviar la captura si quiere compararla; lo pendiente de
  antes (licencias, consulta SBA, INPI y abogado, autorización del ministerio, Google Play antes del 15-11, sitio, Claude Max, voz).
- **Reglas que quedan:** «empezar por el principio y terminar por el final» es error del validador en todas las rutas (ningún nombre
  se pregunta antes de presentarse, ninguna pregunta va para atrás en la historia, cada personaje lleva su ficha antes de las
  preguntas) y se corrige en el texto, nunca escondiendo un nombre; entre «» va solo la Biblia, textual; el contenido de la app va en
  «tú»; en portugués e inglés cada hueco se tiene que poder llenar también leyendo la Almeida o la King James; los talentos nunca se
  venden; el nivel mide el camino en la app, no la fe, y no desbloquea contenido; al abrir, la app carga solo lo que necesita Inicio;
  cada compilación publica el peso del APK.

## DEC-2026-10-23-2 · Senda: el álbum de personajes (pendiente del fundador)

- **Fecha:** 2026-10-23 · **Quién:** el fundador propone («se puede ir completando un álbum; con monedas puedas comprar un sobre que
  trae un personaje [...] y que además ayude a conocer sobre ese personaje»); Claude evalúa y propone.
- **Recomendación (docs/ECONOMIA.md de la app; capítulo 59 §6):** sí, con este diseño: sobres pagados solo con talentos, que nunca se
  venden (ni con plata, ni con suscripción, ni con anuncios); nunca una figurita repetida (el azar solo decide el orden); la figurita
  queda dorada si se responde bien la pregunta del personaje, nunca por suerte; ningún personaje vale más que otro; Jesús no es una
  figurita (el centro del álbum es una página sin retrato con Juan 5:39); 72 personajes por año en 12 páginas; el primer sobre de
  cada página gratis y los demás a 40 talentos.
- **Por qué así (HECHO, con fuente):** la Lei 15.211 de Brasil (ECA Digital, art. 20) prohíbe las cajas de recompensa en juegos para
  niños y adolescentes o de acceso probable por ellos; el Decreto 12.880 exige impedir el acceso de verdad; la Nota Técnica 55/2026
  del Ministerio de Justicia incluye la moneda del juego comprada con plata. Google Play y Apple exigen mostrar las probabilidades de
  cualquier ítem al azar que se compre.
- **Decisión pedida:** sí o no al álbum con ese diseño y, si es sí, para cuándo (antes del lanzamiento o con la temporada de
  Adviento). Costo: 0; unas dos o tres sesiones de trabajo.

## DEC-2026-10-24-1 · Senda: la prueba 34 (la Biblia sin ruido, los textos, la trivia, la entrada, «Camino a Navidad»)

- **Fecha:** 2026-10-24 · **Quién:** el fundador pide (la Biblia con «un montón de cosas arriba, re incómodo»; textos que se pisan y se
  salen del cuadro en toda la app; silenciar la música de la trivia, volumen, que cambie cada tanto; la ruleta protagonista; una
  entrada «mucho mejor diseñada» sin replicar Preguntados y, a mitad de la prueba, no insistir con la pose de Lany y pasarle un prompt
  para otra IA; «lo del álbum, va»; qué es «Adviento»). Claude construye, audita y revisa.
- **Decidido / hecho (capítulo 60):** la Biblia abre con «Hoy en tu plan» y un solo botón «Planes y versiones» (todo lo demás vive
  ahí). Auditoría automática de textos en toda la app (scripts/auditoria/textos.cjs: 810 lecciones, 728 pantallas de trivia, todas las
  pantallas, letra normal y grande) y medidor de diagramas con la letra real (scripts/arte/medir.py): siete diagramas corregidos, los
  mapas con nombres que buscan un lugar libre (src/componentes/rotulos.ts), la línea de tiempo con más espacio, once pantallas; de
  2.139 hallazgos a 0 y el generador de diagramas se niega a escribir uno con problemas. La ruleta ocupa casi todo el ancho; control de
  música en el juego (interruptor, volumen, qué suena, «Cambiar de tema») y rotación de cuatro temas de Kevin MacLeod cada 150 s (dos
  nuevos, CC BY 4.0). La entrada rediseñada (puerta de luz, rayos, medallones en arco, barra de carga); la pose «héroe» se sacó por
  pedido del fundador y mientras llega la ilustración generada con otra IA (prompt en lany_prompt_entrada.md) va Lany con la armadura.
  «Adviento» pasa a «Camino a Navidad» y la copa a «Copa de Navidad» (los ids no cambian). El álbum queda aprobado y es lo primero
  de la prueba 35. APK 34 con todo.
- **Reglas que quedan:** la auditoría de textos se corre antes de cada APK y un diagrama con textos que se pisan no se genera; los
  nombres de los mapas nunca van a mano: los ubica el algoritmo; en la app nada se llama «Adviento»; las poses de Lany que el
  fundador rechaza se sacan sin reintentar y la ilustración de la entrada viene de otra IA con la lámina de referencia; el control de
  música es parte de la UX de cada juego (volumen de 0 a 1, 0,5 = como sonaba antes).

## DEC-2026-10-24-2 · Senda: «Juntos» sale con el lanzamiento (todas las conexiones el 18-12)

- **Fecha:** 2026-10-24 · **Quién:** el fundador pide que al salir la app ya funcionen las cuentas, los duelos contra un rival al azar
  o un contacto, las copas y eventos que él crea en el calendario de todos, los grupos e iglesias con campeonatos, la encuesta diaria
  en vivo, Senda Premium y Senda Max (salas en vivo y trivia del sermón desde un PDF) y una guía dinámica de bienvenida, «todo bien
  mapeado» y en la línea de tiempo. Claude diseña y construye la base.
- **Decidido / hecho:** lo que el plan tenía como «v1 Juntos» (enero de 2027) se adelanta al lanzamiento del 18-12-2026. Hecho hoy: la
  migración 20261101000000_juntos.sql (20 tablas con RLS, 14 funciones, dos tareas programadas; validada con el analizador de
  Postgres; se aplica sola al subirse a main), las funciones de borde «trivia-sermon» (Claude arma las preguntas con su cita; el PDF
  no se guarda) y «compras» (verifica el recibo con Google Play), el mapa completo (docs/LANZAMIENTO.md) y el camino: prueba 35
  (álbum, cuenta, amigos, duelos, guía), 36 (grupos, eventos, encuesta, tabla de copa, torneos), 37 (Premium, Max, salas en vivo), 38
  (trivia del sermón, guardar la cuenta, progreso en la nube); prueba cerrada del 16 al 30-11. La línea de tiempo de la Consola
  resume lo que sale el 18-12.
- **Principios:** sin cuenta también se juega (cuenta anónima y automática, se guarda después); lo competitivo lo decide el servidor;
  cada tabla con su regla de seguridad; nada pago da ventaja en lo oficial; idempotente y barato (docs/ESCALA.md).
- **Espera del fundador (sin apuro, cada cosa antes de su prueba; docs/LANZAMIENTO.md §7):** activar las cuentas anónimas y las
  extensiones en Supabase; marcarse administrador; Expo y Firebase; los productos de suscripción y la cuenta de servicio en Play
  Console; la clave de Anthropic para la trivia del sermón; Supabase Pro solo si la prueba cerrada lo pide.

## DEC-2026-10-24-3 · Senda: la prueba 35 (la música, la ilustración de Lany, el álbum, la cuenta, amigos, duelos y la guía)

- **Fecha:** 2026-10-24 · **Quién:** el fundador manda la ilustración de Lany generada con otra IA («MUY buena imagen, creo que es el
  camino»), pide que la música de la trivia no se corte nunca (bajar mientras se responde) y más temas del estilo del predeterminado
  («siempre que se puedan usar sin licencia ni nada»), y «avanzá con esto y todos los próximos». Claude ejecuta y decide lo técnico.
- **Decidido / hecho:** la causa del corte era el motor de sonido (al llenarse las 36 voces apagaba la más vieja, que era el fondo):
  el fondo ya no es víctima y baja al 45 % mientras se lee y responde; seis temas más de Kevin MacLeod (CC BY 4.0, con crédito). La
  ilustración del fundador va en la entrada (recortada, sin fondo) y los medallones pasan al camino. El álbum de personajes como se
  aprobó el 24-10: 9 páginas, 48 figuritas, primer sobre gratis y 40 Talentos los demás, nunca repetidas, dorada con una pregunta
  (la correcta nunca se delata por el largo), Jesús como página central y no como figurita. «Juntos» entra a la app: cuenta anónima
  sin SDK, Amigos, Duelos por turnos jugados en el Espadeo y corregidos por la base (migración generada con las 720 claves), token
  push y la guía de bienvenida de Lany (15 carteles, tres idiomas). APK 35 con todo. Capítulo 61.
- **Reglas que quedan:** la música de fondo nunca se corta sola (ni por las voces ni por el juego: solo la apaga la persona); toda
  hoja inferior entra en la pantalla (lo que no entra se desliza adentro); en el álbum nada se compra con plata, nunca sale una
  repetida y Jesús no es una figurita; en los duelos el servidor decide y el teléfono reintenta sin duplicar; la guía nunca tapa el
  lector, una lección ni un juego.
- **Espera del fundador:** probar el APK 35; decir con qué IA generó a Lany (para docs/LEGAL.md) y, si puede, una versión grande y
  otra sin armadura; activar las cuentas anónimas en Supabase y crear el proyecto de Expo para probar Amigos, Duelos y las push con
  la base viva (docs/LANZAMIENTO.md §7).

## DEC-2026-10-24-4 · Senda: la prueba 36 (En la frente, ¿Quién es?, menos texto, Lany vestida, contenido y los planes de suscripción)

- **Fecha:** 2026-10-24 · **Quién:** el fundador pide «En la frente» horizontal, con pistas más directas, letra grande, más
  personajes y un torneo con tabla y desempate; algo más breve al adivinar; menos texto («la gente hoy no lee mucho»); que los
  personajes importantes del álbum sean más difíciles; la entrada legible; la página de Jesús como «la página central»; que nada
  parezca escrito por una IA; más trivia, más Travesía, más personajes en «En la frente» y en «¿Quién es?» con más aleatoriedad;
  mejorar mucho las preguntas («están re deficientes»); Lany con ropa u objetos según el contexto; el duelo al azar en lugar del duelo
  contra Lany; evaluar planes, precios, stock de preguntas y tope de PDF; avisa que generó a Lany con Gemini y pide que le explique
  lo de Supabase; «avanzá con esto y todos los pendientes». Claude ejecuta y decide lo técnico.
- **Decidido / hecho:** En la frente acostado con 124 personajes y torneo (desempate de 30 segundos); ¿Quién es? con 71 personajes,
  tablero variado y preguntas reescritas, final con el personaje y su versículo; duelo al azar (se juega primero mientras la base busca
  rival); álbum con estrellas; Jesús «el centro» (Juan 5:39); lecciones largas con lo esencial primero y 30 frases hechas fuera; Lany
  con túnica, pañuelo, sombrero y cuatro objetos según la lección; Oseas y «Josué y Jueces» (418 lecciones); trivia: banco 8 (788),
  136 enunciados «Según…» y 129 preguntas que se delataban por el largo rehechos; el Espadeo recuerda lo visto; topes en la base (8
  trivias del sermón por mes con Max, 1 de prueba sin Max, salas de 10 sin Max) y la función de la trivia del sermón más segura;
  Gemini en los créditos; la guía de Supabase corregida (no activar el captcha). APK 36 con todo. Capítulo 62.
- **Propuesta que decide el fundador:** tres planes: Gratis (todo el contenido; anuncios fuera de la Biblia y las lecciones), Premium
  (sin anuncios y vidas ilimitadas; USD 2,49/mes o 17,99/año en Latinoamérica) y Max (salas de hasta 500 y 8 trivias del sermón por mes;
  USD 5,99/mes o 44,99/año); Familia, Líder e Iglesia fuera de 2027; Max gratis dos meses a los primeros 100 líderes; meta de 1.500
  preguntas al lanzamiento y 3.000 para Pascua. Los cobros, con la figura legal (capítulo 43 §2). Detalle: capítulo 62 §8 y
  docs/SUSCRIPCIONES.md de la app.
- **Reglas que quedan:** el contenido nunca se cobra (lo pago es comodidad o herramientas para el que guía); en la trivia, la correcta
  nunca se delata por el largo y la cita no va en el enunciado; si las opciones son frases de la Biblia, todas son textuales; cada
  costo de IA lleva tope por plan y se registra lo que gasta.
- **Espera del fundador:** probar el APK 36; decidir la propuesta de planes y precios; activar las cuentas anónimas (sin captcha) y
  crear el proyecto de Expo; si puede, la ilustración de Lany grande y sin armadura.

## DEC-2026-10-25-1 · Senda: cómo registrar la marca en el INPI (espera del fundador)

- **Fecha:** 2026-10-25 · **Quién:** el fundador comparte su búsqueda en el INPI («SENDA» y «LANY», clases 9, 41 y 42) y pregunta cómo
  seguir; avisa que ya creó la cuenta de Expo.
- **Hechos:** clase 9, SENDA PROHIBIDA (VOD Acquisition, concedida a 2033); clase 41, LA SENDA (concedida a 2033) y una docena de
  «Senda + algo» concedidas después; clase 42, SENDA (Velásquez, concedida el 29-09-2026, software científico); para Lany, PLANY (9 y
  42). Detalle y fuentes: `conocimiento/2026-10-25-senda-inpi-marca.md`.
- **Recomendación (decide el fundador):** no pedir «SENDA» sola; pedir la mixta «SENDA BIBLIA Y JUEGOS» con el logo y la mixta «LANY»
  con el dibujo, en las clases 9 y 41 (≈ ARS 165.000 las cuatro; tasa a confirmar en el portal); a nombre de la SAS si se arma en
  noviembre, o a su nombre antes del 18-12 si no; antes de pagar, ver la ficha de LA SENDA y una consulta corta con un agente.
  Guía lista: `docs/legal/marca_inpi.md` (app).
- **Expo:** paso a paso en `docs/EXPO_FIREBASE.md` (app): el ID del proyecto y el google-services.json van al chat; la clave de la
  cuenta de servicio de Firebase va solo a Expo.
