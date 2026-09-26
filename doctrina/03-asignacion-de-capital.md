# 03 — Asignación de capital

## 1. De dónde sale el capital

| Fuente | Hoy | A futuro |
|---|---|---|
| Aporte del fundador | ~USD 400/mes | Ampliable por tramos si una unidad lo justifica (USD 600 / 1.000 / 2.000) |
| Caja de las unidades | 0 | Principal fuente desde el mes 9–18 |
| Financiación de proveedores / preventa | — | Importación a pedido, preventas, anticipos de clientes |
| Financiación del vendedor (*earn-out*) | — | Compra de carteras de clientes pagada con la propia caja que generan |
| Instrumentos pyme del mercado de capitales | — | Descuento de ECHEQ / Factura de Crédito Electrónica, fideicomisos financieros (autorización automática CNV RG 1159/2026) |
| Socios / terceros | — | Solo con evidencia: co-inversión en activos, socios operativos locales |

**Deuda solo autoliquidable**: que se pague con el flujo del activo que financia (una cartera, un equipo con contrato, inventario
vendido). Nunca deuda para cubrir pérdidas operativas.

## 2. Los cinco baldes

| Balde | Para qué | Regla |
|---|---|---|
| **Tesorería** | Liquidez + renta en USD mientras el capital espera destino | Siempre ≥ 3 meses del gasto planificado de experimentos |
| **Herramientas** | IA y software que multiplican la capacidad de ejecución | Se mantiene si horas ahorradas × tarifa sombra > costo (revisión mensual) |
| **Validación** | Experimentos de fichas en estado `validar` | Máx. USD 500 y 6 semanas por experimento, salvo excepción aprobada |
| **Construcción / escala** | Unidades con evidencia | Capital por tramos liberados por hitos |
| **Opciones** | Apuestas chicas con upside grande (por ej. posición en una tesis de inversión) | Máx. 10% del patrimonio de la cartera |

## 3. Presupuesto mensual de referencia (meses 1–3)

| Concepto | USD 400/mes | USD 600/mes | USD 1.000/mes |
|---|---|---|---|
| Claude (plan Max 5x; Max 20x en sprints de construcción) | 100 | 100–200 | 200 |
| Otras herramientas (dominio, hosting, WhatsApp API, formularios) | 20 | 30 | 50 |
| Experimentos (anuncios, cursos, muestras, inspecciones) | 180 | 320 | 550 |
| Tesorería | 100 | 150 | 200 |
| **Qué compra el tramo extra** | 2 experimentos en paralelo | 3 experimentos en paralelo o 1 con más pauta | Acelera el tiempo a la primera caja ~1–2 meses; permite capital de trabajo para comex |

Lectura: con USD 400 el cuello de botella **no es el capital sino las horas del fundador y la velocidad de aprendizaje**. Pasar a
USD 600–1.000 solo se justifica cuando un experimento validó el canal y el capital extra compra clientes a un CAC conocido o capital
de trabajo con rotación conocida.

## 4. Vara mínima (*hurdle*)

- **Tesorería**: ~6–8% anual en USD (ON corporativas hard dollar, sep-2026: YPF 2031 ~7,1%, Pampa 2037 ~7,6%, Telecom 2033 ~7,9%).
- **Unidad operativa**: TIR esperada ≥ 30% anual en USD en el escenario base, o IVR ≥ 1,0 (ver `01-marco-de-evaluacion.md`).
- **Adquisición**: payback ≤ 36 meses con supuestos conservadores de retención.

## 5. Política de tesorería (no es asesoramiento regulado)

1. **Tramo liquidez** (≈ 3 meses de gasto planificado): instrumentos USD de muy corto plazo y alta liquidez.
2. **Tramo renta** (≈ 60–80% del resto): ON corporativas hard dollar diversificadas (≥ 4 emisores, máx. 25% por emisor,
   vencimientos ≤ 2031), priorizando emisores exportadores o con caja en USD.
3. **Tramo largo plazo / cobertura** (≈ 20–40% del resto): exposición global diversificada (por ejemplo, CEDEAR de índices amplios)
   como cobertura de riesgo Argentina ante 2027.
4. **Tesis satélite** (dentro del balde *Opciones*): posiciones con tesis escrita en `oportunidades/` (por ej. energía/Vaca Muerta),
   con precio de salida y tamaño máximo definidos antes de entrar.

Riesgos específicos a vigilar: riesgo país (≈ 580–600 pb a fines de sep-2026, en suba), elecciones 2027, concentración en
emisores argentinos, liquidez de las ON pequeñas.

## 6. Capital por tramos (*staged funding*)

Toda unidad declara en su ficha:

- **Mínimo**: lo imprescindible para aprender si funciona.
- **Óptimo**: lo que maximiza el valor esperado por dólar.
- **Acelerado**: lo que compra velocidad (y qué velocidad compra).
- **Máximo razonable**: por encima de esto el dólar marginal rinde menos que la tesorería.

Y los **hitos** que liberan cada tramo (por ej. "10 clientes pagando con churn < 5% mensual libera el tramo acelerado").

## 7. Reinversión (regla inicial, revisable por el comité)

Del flujo neto de cada unidad: **60%** al pozo de reinversión del comité (va a la unidad con mejor retorno marginal, no
necesariamente a la que lo generó), **30%** a tesorería, **10%** libre para el fundador. En los primeros 24 meses se recomienda
reinvertir el 90% si hay usos con retorno superior al *hurdle*.

## 8. Tamaño de apuestas

- Un experimento no validado: ≤ 30% del capital disponible del mes.
- Una unidad en construcción sin caja propia: ≤ 50% del patrimonio de la cartera.
- Una adquisición: ≤ 40% del patrimonio + financiación del vendedor, y solo con *due diligence* documentada.
- Stop: si una unidad consume 2 tramos sin cumplir hitos, pasa a `pausa` y el comité decide.
