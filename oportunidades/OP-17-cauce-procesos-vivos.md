---
id: OP-17
titulo: "Cauce: procesos con números (modelador, análisis en vivo, simulación y manual), nacido como motor de Andén"
estado: explorar
rol: plataforma
tipo: software-freemium
resumen: "Un modelo de proceso con datos por bloque que se dibuja, se calcula en vivo (carga, espera, costo por caso), se simula en el navegador y sale como diagrama y manual sin muros de exportación. Nace como el motor y el modelador de Andén (plantillas logísticas); su puerta propia («contá cualquier proceso y llevate el manual listo para ISO», en español) se abre solo si una prueba a ciegas y 30 páginas de plantillas lo justifican. Pedido del fundador del 17-11-2026."
fecha_alta: 2026-11-17
fecha_revision: 2026-11-17
ventana: "2026–2028: Miro vendida con 90 % de descuento (oct-2026), clientes incómodos por cambios de dueño y licencia (ARIS, Camunda 8.6, Bizagi, Kissflow), MCP Apps dentro de Claude y ChatGPT desde ene-2026; nadie calcula mientras se dibuja"
modelo: oportunidades/proyectos/cauce/definicion.yaml
capital:
  minimo_usd: 0
  optimo_usd: 60
  acelerado_usd: 600
  maximo_razonable_usd: 3000
  mensual_usd: 5
horas_semana: 0.5
ia_ejecutable_pct: 90
semanas_a_primer_aprendizaje: 10
meses_a_primer_ingreso: 9
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 2
  economia_unitaria: 3
  distribucion: 2
  defensibilidad: 3
  ajuste_fundador: 4
  palanca_ia: 5
  ventana: 3
  opcionalidad: 5
  sinergias: 5
  velocidad_aprendizaje: 4
  robustez: 3
gates: {problema_pagado: pendiente, distribucion: pendiente, economia: pendiente, experimento_barato: si, downside_acotado: si, legal: si}
escenarios_36m:
  fracaso: {prob: 0.70, flujo_mensual: 0, capital_perdido_usd: 60}
  base: {prob: 0.22, flujo_mensual: 3000}
  expansivo: {prob: 0.08, flujo_mensual: 20000}
multiplo_terminal_meses: 36
sinergias: [OP-16, OP-04, OP-12, OP-15]
proximo_paso: "Fundador: decidir si Cauce nace como motor de Andén y si corren las dos pruebas (ene–mar 2027). Claude: cero horas del fundador hasta el 15-01-2027; preparar la prueba a ciegas (3 procesos genéricos) y las 30 páginas en el dominio de Andén."
---

# OP-17 — Cauce: procesos con números

Visión completa, benchmark y decisiones: `oportunidades/proyectos/cauce/vision.html` (publicada en https://claude.ai/artifact/BYdduRTycrpctGqGw6ejsE; prototipo en https://claude.ai/artifact/JVSrLuiox5miFbLVtTXScT). Definición del
proyecto: `oportunidades/proyectos/cauce/definicion.yaml`. Prototipo: `oportunidades/proyectos/cauce/prototipo/`. Bitácoras:
`conocimiento/2026-11-17-cauce-0[1-7]-*.md`.

## 1. Tesis en una línea
Los procesos se dibujan en un lado, se calculan en otro, se simulan en un tercero y se documentan a mano: un solo modelo con datos
por bloque hace todo eso a la vez, en el navegador, en español y sin cobrar por exportar.

## 2. Por qué ahora
- HECHO: Bending Spoons compró Miro por USD 1.355 M (cierre 26-10-2026), ≈ 2,3 veces su ingreso anual y 90 % menos que en 2022
  (bitácora 01 y 06).
- HECHO: cambios de dueño y de licencia en dos años (ARIS a Silver Lake, MEGA a Bizzdesign, Bonita → Ofelia, ProcessMaker +
  Decisions, Camunda 8.6 paga en producción, Bizagi retiró planes, Kissflow +67 %) (bitácora 02).
- HECHO: MCP Apps estable desde el 26-01-2026; el MCP de Miro recibió 16 M de llamadas, 65 % desde Claude (bitácoras 01 y 04).
- HECHO medido: un simulador de eventos discretos en JavaScript procesa ≈ 3,6 M eventos por segundo con 3 % de error contra Erlang
  C: la simulación corre gratis en el navegador (bitácora 03).

## 3. Problema, cliente y alternativa actual
- Operaciones y logística de pymes: deciden a ojo; simular cuesta USD 2.000–19.000 por puesto y por año y pide especialista.
- Consultores de procesos, ISO y calidad: entregan manuales con Bizagi + Word + Visio; pagan su tiempo.
- Docentes y alumnos de Ingeniería Industrial y Ciencias Económicas (cursograma IRAM 34501/34502, sin soporte nativo en ninguna
  herramienta revisada).
- Alternativa gratis que ya existe: draw.io (exporta todo), Bizagi Modeler (BPMN + simulación + documentación), Claude o ChatGPT
  con Mermaid (procedimiento + diagrama).

## 4. Evidencia e hipótesis
HECHOS en las bitácoras 01–06. Hipótesis centrales, sin dato todavía: volumen de búsqueda en español de «manual de
procedimientos de X» y «cursograma de X»; disposición a pagar de consultores ISO en LatAm; que la salida de Cauce sea claramente
mejor que la de un chat genérico; que la gente cargue datos por bloque en vez de dejar los valores por defecto.

## 5. La oferta (y lo que NO hacemos)
Modelador con carriles y datos por bloque, números en vivo (capas 0–2: revisión, carga y costo, colas), simulación animada (capa
3), escenarios, IA que arma, revisa y responde, exportación completa gratis (PDF vectorial con rótulo, SVG, PNG, BPMN, Mermaid,
manual). NO: pizarra genérica para competir con Miro; motor de ejecución propio; grabación de pantalla; generación de apps;
plan Organización o portal antes de que alguien lo pida con plata; consultoría.

## 6. Economía
Caso con puerta propia (bitácora 06, ESTIMACIÓN): ingreso mensual a diciembre de cada año, base USD 310 (2027), 1.520, 4.880,
9.960 y 16.600 (2031); expansivo hasta ≈ USD 98.000; fracaso se corta. Peor caso creíble (red team): margen positivo solo con
modelo chico y tope en la IA del plan gratis; con modelo mediano ≈ USD −170 por mes. Los escenarios a 36 meses de esta ficha son
más conservadores porque la puerta propia depende de dos pruebas.

## 7. Capital por tramos
Tramo 0 (USD 0): prototipo (hecho). Tramo 1 (≤ USD 60): dominio o subdominio dentro de Andén y prueba de páginas. Tramo 2 (≤ USD
600, solo con pruebas aprobadas y OK del fundador): puerta propia (marca, dominio, MCP App). Por encima de USD 3.000 el dólar
marginal rinde menos que la tesorería.

## 8. Distribución
Dentro de Andén: SEO de calculadoras y plantillas logísticas, cátedras (red UNNOBA). Puerta propia: SEO de plantillas y manuales en
español, consultores con marca propia, app dentro de Claude y ChatGPT, cátedras con el cursograma IRAM. Nada de salir a vender.

## 9. Competencia y defensibilidad
Producto: barrera débil (copiable en meses). Lo que se acumula: biblioteca de plantillas en español con tiempos de referencia,
índices de costos de Andén, cátedras y consultores con sus manuales adentro, el motor de análisis validado.

## 10. Palanca IA
Claude construye el producto entero (≈ 90 %). En el producto: modelo intermedio validado por código (no XML directo), entrevista
guiada, revisión con números, controles faltantes, comparación de versiones, capacitación; costo ≈ USD 0,003–0,065 por diagrama.

## 11. Riesgos y pre-mortem
Red team completo en `conocimiento/2026-11-17-cauce-07-red-team.md`: dispersión (alta), IA genérica suficiente (alta), canal que
no existe (media-alta), trabajo de una vez (media-alta), IRAM como rasgo y no mercado (media).

## 12. Validación
- Prueba a ciegas (ene-2027, 1 h del fundador, USD 0): 3 procesos genéricos; Claude/ChatGPT solos, Lucid, draw.io MCP y el
  prototipo; 5 evaluadores. Pasa si 3 de 5 eligen el prototipo con diferencia clara y la salida del chat necesita más de 15
  minutos de corrección.
- Páginas (ene–mar 2027, USD 0–20): 30 páginas (20 logísticas, 10 de manuales o cursogramas). Pasa con 2.000 impresiones y 30
  anotados.
- Puerta propia: las dos pasan + 10 consultores compran una preventa de USD 79 sin llamadas (con OK) o una cátedra adopta el
  cursograma para un curso entero.

## 13. Rol en cartera
Plataforma y motor compartido: alimenta a Andén (OP-16), al laboratorio de decisiones (OP-04) y a la fábrica de herramientas para
agentes (OP-12: el conector MCP de procesos). Lo que aprende de capacitación sale de Senda (OP-15).

## 14. Qué tendría que ser cierto
Que haya búsqueda en español, que la salida le gane claramente a un chat genérico, que pague el 1 % a USD 5 y que lo recurrente no
exija vender. Hoy, las cuatro son hipótesis.

## 15. Veredicto
**Explorar, dentro de Andén.** La visión completa queda como norte y no se construye entera. La pizarra horizontal va al cementerio
(K27). Reglas: cero horas del fundador hasta el 15-01-2027; el modelador nunca más del 20 % de las horas de Andén; su destino
atado al corte de Andén (sep-2027).
