---
id: OP-12
titulo: "Fábrica de herramientas para desarrolladores y agentes de IA (Apify, MCP, x402)"
estado: validar
rol: opcion
tipo: producto-en-marketplace
resumen: "Claude construye y mantiene muchas herramientas chicas (datos, cálculos y validaciones con lógica argentina y logística) que se publican en marketplaces donde desarrolladores y agentes de IA las encuentran y pagan por uso. No hay que salir a vender: la plataforma trae la demanda y cobra. Es una lotería barata con regla de corte que además entrena para operar negocios comprados (OP-08)."
fecha_alta: 2026-09-26
fecha_revision: 2026-09-26
ventana: "2026–2028: el pago por uso de agentes (x402, MCP) está en su etapa temprana; Apify retira el alquiler mensual el 01-10-2026"
modelo: herramientas/modelos/op12-fabrica-herramientas.yaml
capital:
  minimo_usd: 0
  optimo_usd: 600
  acelerado_usd: 1500
  maximo_razonable_usd: 3000
  mensual_usd: 50
horas_semana: 2
ia_ejecutable_pct: 90
semanas_a_primer_aprendizaje: 6
meses_a_primer_ingreso: 3
riesgo_politico_2027: bajo
rampa: true
puntajes:
  dolor_y_pago: 3
  economia_unitaria: 3
  distribucion: 4
  defensibilidad: 2
  ajuste_fundador: 4
  palanca_ia: 5
  ventana: 4
  opcionalidad: 4
  sinergias: 4
  velocidad_aprendizaje: 4
  robustez: 3
gates: {problema_pagado: si, distribucion: si, economia: pendiente, experimento_barato: si, downside_acotado: si, legal: pendiente}
escenarios_36m:
  fracaso: {prob: 0.45, flujo_mensual: 0, capital_perdido_usd: 450}
  base: {prob: 0.40, flujo_mensual: 150}
  expansivo: {prob: 0.15, flujo_mensual: 800}
multiplo_terminal_meses: 18
sinergias: [OP-08, OP-14, OP-07]
proximo_paso: "Fundador: crear cuenta en Apify y habilitar el acceso de red del entorno a apify.com; Claude: lista de 20 herramientas candidatas con demanda observable y competencia débil, y las primeras 5 publicadas en 30 días (EXP-07)"
---

# OP-12 — Fábrica de herramientas para desarrolladores y agentes de IA

## 1. Tesis en una línea

Los marketplaces de herramientas (Apify Store y, cada vez más, los agentes de IA que pagan por llamada vía MCP y x402) ya tienen
compradores buscando; Claude puede fabricar y mantener herramientas a costo casi cero; el fundador solo aprueba y revisa.

## 2. Por qué ahora

- Apify paga ~USD 1,4 M por mes a ~3.000 desarrolladores y retira el alquiler mensual el 01-10-2026 para quedarse con pago por uso:
  el catálogo se reacomoda (HECHO, help.apify.com 2026).
- x402: USD 24 M en los últimos 30 días a mediados de sep-2026 y 20.000+ herramientas de Apify cobrables por agentes (HECHO, x402.org
  vía DEV; blog.apify.com). Es la etapa temprana de "clientes" que no necesitan ser convencidos por un vendedor: eligen por
  especificación, precio y confiabilidad.

## 3. Evidencia y lo que la contradice

| Afirmación | Tipo | Fuente |
|---|---|---|
| El desarrollador cobra 80% de lo que pagan los usuarios, menos el costo de ejecución | HECHO | docs.apify.com |
| Promedio ~USD 470/mes por desarrollador; los mejores independientes > USD 10.000/mes | HECHO | apify.com/partners; AgentByline 2026 |
| **Mediana USD 14/mes** entre las herramientas de terceros del top-900 que ganan algo; Apify concentra 48% de usuarios | HECHO | DEV Community 2026 |
| Fábricas con IA ya compiten: ParseForge publica 13+ por semana (124 en 6 meses) | HECHO | blog.apify.com feb-2026 |
| Los nichos obvios argentinos y logísticos ya tienen herramientas (AFIP/CUIT, BCRA deudores, seguimiento de contenedores) | HECHO | apify.com |

**Lectura**: es una distribución de ley de potencias. No es un sueldo; es una cartera de intentos baratos.

## 4. La oferta (y lo que NO hacemos)

**Sí**: herramientas de **cálculo y lógica de negocio** que un agente o un desarrollador extranjero no sabe resolver: costo de
importación puerta a puerta en Argentina (arancel por posición NCM + tasas + IVA + percepciones), costo de flete terrestre por km con
índices publicados, días hábiles y feriados argentinos, conversión con el tipo de cambio oficial de una fecha, validaciones
(CUIT/CUIL por dígito verificador), normalización de series oficiales (INDEC, BCRA), lectura estructurada del Boletín Oficial por
rubro. Fuentes públicas o abiertas; poca pelea con sistemas antirrobot; mantenimiento bajo.

**No**: *scrapers* de sitios que lo prohíben en sus términos, datos personales (Ley 25.326), plataformas con antirrobot agresivo,
copias de herramientas que ya tienen líder.

## 5. Economía

Modelo `op12-fabrica-herramientas.yaml` (margen neto al mes 12): base USD 100/mes; P10 / P50 / P90 = −6 / 70 / 683; media 195;
87% cubre su costo, 39% supera USD 100/mes, 17% supera USD 400/mes. Lo que más mueve el resultado: que aparezca una herramienta
que pegue.

## 6. Capital por tramos

USD 50/mes atribuibles (parte de Claude Max, que ya se paga por DEC-2026-09-26-4) + proxies/dominios. Tope del experimento:
USD 450 en 9 meses.

## 7. Palanca IA

Claude diseña, programa, prueba, publica (con la cuenta del fundador), documenta, fija precios por evento, responde *issues* y
repara cuando cambia una fuente. El fundador: 2 h/semana para revisar la lista de candidatas, aprobar publicaciones y mirar métricas.

## 8. Riesgos y pre-mortem

- Nadie las usa (lo más probable): regla de corte.
- Plataforma cambia reglas (acaba de hacerlo): publicar también como servidor MCP propio y en x402 para no depender de un canal.
- Legal: solo fuentes públicas/abiertas; términos de uso revisados por herramienta.
- Red del entorno: hoy bloquea apify.com; el fundador debe habilitarla.

## 9. Validación (EXP-07)

- **Éxito a 90 días**: ≥ 15 herramientas publicadas, ≥ 30 usuarios mensuales y ≥ USD 40/mes facturados.
- **Muerte al mes 9**: < USD 40/mes facturados → se cierra y lo aprendido pasa a OP-08.
- **Graduación**: una herramienta con usuarios recurrentes crecientes 3 meses seguidos → versión de suscripción (OP-14).

## 10. Veredicto

**Validar ya.** No porque vaya a pagar el alquiler, sino porque arriesga casi nada, usa la IA al máximo, no requiere vender y
enseña exactamente lo que hace falta para comprar y operar negocios digitales (OP-08).
