# 01 — Marco de evaluación: de señal a oportunidad a unidad de cartera

## 1. El embudo

```
SEÑALES (radar/senales.md)            decenas por mes, baratas, fechadas
   │  triage de 30 min: ¿hay alguien pagando hoy por este problema?
   ▼
FICHAS  estado=explorar               ≤ 10 activas; investigación de escritorio + 5 conversaciones
   │  pasa los 6 gates
   ▼
VALIDAR                               ≤ 3 simultáneas; experimento barato con criterio de éxito/muerte
   │  el experimento confirma la hipótesis más riesgosa
   ▼
CONSTRUIR → ESCALAR                   capital por tramos, liberado por hitos
   │
   ▼
UNIDAD DE CARTERA                     genera caja / capacidades; comité mensual decide reinversión
```

Estados posibles de una ficha: `radar`, `explorar`, `validar`, `construir`, `escalar`, `pausa`, `inversion` (activo financiero o
real sin operación), `descartada`.

## 2. Triage (30 minutos, antes de abrir una ficha)

Responder en una línea cada una. Si hay 2 o más "no sé" en las primeras 4, la idea vuelve al radar como señal.

1. ¿Quién tiene el problema y **cuánto le cuesta hoy** (tiempo, dinero, riesgo, multas)?
2. ¿Qué usa hoy para resolverlo y cuánto paga? (La alternativa actual es el verdadero competidor.)
3. ¿Quién decide la compra y de qué presupuesto sale?
4. ¿Cómo llegaríamos a los primeros 10 clientes y cuánto costaría?
5. ¿Qué cambio reciente (tecnológico, regulatorio, de costos, de comportamiento) hace que esto sea posible **ahora**?
6. ¿Qué parte del trabajo puede hacer la IA?
7. Si funciona, ¿qué impide que nos copien en 6 meses? Si nada, ¿por qué igual vale la pena?

## 3. Los 6 gates (obligatorios para pasar a `validar`)

| Gate | Pregunta | Evidencia mínima |
|---|---|---|
| G1 Problema pagado | ¿Alguien paga hoy (dinero o tiempo valorizable) por resolverlo? | Precio de la alternativa actual con fuente, o 5 entrevistas |
| G2 Distribución | ¿Existe un canal identificable para los primeros 10 clientes con costo acotado? | Canal concreto + estimación de costo por cliente |
| G3 Economía | ¿El margen de contribución es positivo en el escenario base con supuestos explícitos? | Modelo en `herramientas/modelos/` |
| G4 Experimento barato | ¿Hay un experimento ≤ USD 500 y ≤ 6 semanas que pruebe la hipótesis más riesgosa? | Diseño en `cartera/experimentos/` (o excepción justificada) |
| G5 Downside acotado | ¿Lo peor que puede pasar es perder lo asignado (sin pasivos personales ilimitados)? | Análisis de riesgo en la ficha |
| G6 Legal y ético | ¿Es legal, no engañoso y no depende de evadir normas? | Normas aplicables identificadas |

Valores posibles en el frontmatter: `si`, `no`, `pendiente`. Un `no` bloquea el paso a `validar`.

## 4. Scorecard (0–5 por dimensión, ponderado a 0–100)

| Dimensión | Peso | 1 = débil | 3 = medio | 5 = fuerte |
|---|---|---|---|---|
| `dolor_y_pago` | 15 | Molestia menor, nadie paga | Pagan algo, alternativa aceptable | Problema caro, frecuente u obligatorio; ya pagan mucho |
| `economia_unitaria` | 15 | Margen ≤ 20% o LTV/CAC < 2 | Margen 30–50%, LTV/CAC 3 | Margen > 60% o LTV/CAC > 5, payback < 6 meses |
| `distribucion` | 15 | Canal caro o inexistente | Canal pago viable con CAC incierto | Canal propio, referidos, o cliente concentrado y alcanzable |
| `defensibilidad` | 10 | Copiable en semanas sin costo | Ventaja de ejecución/relaciones | Switching costs, datos, densidad local, regulación o escala |
| `ajuste_fundador` | 10 | Exige capacidades/presencia que no tiene | Aprendible en meses o con socio | Encaja con lo que ya sabe (CABA, logística) |
| `palanca_ia` | 10 | IA marginal (< 20% del trabajo) | 40–60% | > 70% del trabajo ejecutable por IA con supervisión |
| `ventana` | 5 | Sin urgencia o ventana cerrada | Ventana de 2–3 años | Ventana abierta ahora (norma nueva, costo que cayó) |
| `opcionalidad` | 5 | Callejón sin salida | Algunas extensiones | Plataforma para varios productos o mercados |
| `sinergias` | 5 | Aislada | Comparte algo | Aporta canal, datos o infraestructura a otras unidades |
| `velocidad_aprendizaje` | 5 | > 6 meses para saber si funciona | 2–3 meses | < 4 semanas |
| `robustez` | 5 | Depende de una norma reversible o del tipo de cambio | Riesgo moderado | Funciona en varios escenarios políticos/macro |

Puntaje = Σ (peso × puntaje / 5). Referencia: < 55 no se valida; 55–70 validar si el índice económico acompaña; > 70 prioridad.

## 5. Índice de Valor por Recurso (IVR)

Hace comparables cosas heterogéneas (un servicio, una adquisición, un bono, un inmueble). Se calcula con el frontmatter:

- Escenarios al mes 36: `fracaso`, `base`, `expansivo`, cada uno con probabilidad y flujo de caja neto mensual.
- **Valor esperado bruto (VE)** = Σ p × flujo × (múltiplo_terminal + meses_acumulados) − p_fracaso × capital_perdido.
  `meses_acumulados` = 18 si la unidad arranca de cero (rampa lineal en 36 meses) o 36 si rinde desde el mes 1 (`rampa: false`:
  bonos, adquisiciones). `múltiplo_terminal` = meses de flujo que vale la unidad al mes 36 (venta, continuidad o valor del activo).
- **Valor neto** = VE − capital óptimo.
- **Recurso** = capital óptimo + horas_semana × 156 × tarifa_sombra (USD/h del tiempo del fundador, en `herramientas/config.yaml`).
- **IVR = Valor neto / Recurso.**

Lectura: la tesorería en USD (OP-09) rinde un IVR de ~0,1 y marca el piso. En **unidades operativas** exigimos IVR ≥ 1,0 en el
caso esperado; en **activos intensivos en capital** (inmuebles, adquisiciones, energía) exigimos al menos el doble que la tesorería
y lo comparamos dentro de su rol.

> El IVR no es "la verdad": es una disciplina para explicitar supuestos y compararlos. Se recalcula con datos de cada experimento.

## 6. Criterios de muerte (cualquiera alcanza)

- El experimento no alcanza el umbral mínimo definido **antes** de correrlo, y no hay una explicación que cambie el diseño.
- El margen de contribución es negativo en el escenario base con datos reales.
- LTV/CAC < 1,5 tras 3 iteraciones de canal.
- Existe una alternativa gratuita equivalente (Mercado Pago, WhatsApp, planillas, el propio Estado) y no podemos diferenciarnos.
- El fundador no quiere o no puede dedicar las horas mínimas.
- El downside deja de estar acotado.

## 7. "Difícil" vs "económicamente malo"

| Es **difícil** (seguir, con cuidado) | Es **malo** (matar) |
|---|---|
| Si las hipótesis clave se confirman, la economía es buena | Aun si todo sale bien, el margen o el mercado no alcanzan |
| Las hipótesis se pueden testear barato | Testear exige gastar casi todo el capital |
| El obstáculo es ejecución, relaciones o tiempo | El obstáculo es estructural (precio techo, costo piso, regulación prohibitiva) |

## 8. Comparar lo incomparable

Cada ficha declara su **rol en cartera**: `motor-de-caja`, `plataforma`, `canal/distribución`, `datos/inteligencia`,
`activo-de-renta`, `opcion` (apuesta chica con upside grande), `cobertura` (reduce riesgo país/tipo de cambio). El comité compara
dentro de cada rol y luego asigna entre roles según la etapa de la cartera (ver `03-asignacion-de-capital.md`).
