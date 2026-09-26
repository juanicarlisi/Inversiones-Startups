# Estrategia de cartera a 5 años (oct-2026 → sep-2031)

> Qué construimos → qué genera caja → qué reinvertimos → qué capacidades adquirimos → qué oportunidades habilitamos → dónde
> terminamos. Revisión trimestral en `/comite`. Números ilustrativos de `cartera/proyeccion.yaml` (HIPÓTESIS).

## La tesis de la cartera en tres ideas

1. **Arbitraje de costo de ejecución.** Negocios de servicio recurrentes, fragmentados y de confianza local (consorcios,
   transportistas, luego estudios contables) cuyo margen estaba limitado por trabajo administrativo: la IA crea el margen.
2. **La ventaja del fundador es la logística** en el momento en que Argentina abre su comercio (líneas usadas al 25% de arancel,
   exportación postal sin límite, UE–Mercosur) y la logística es el cuello de botella de los sectores que crecen (Vaca Muerta: arena,
   camas, rutas).
3. **Energía argentina en un mundo sin Ormuz.** La tesorería y los activos reales de la cartera se inclinan a la tesis estructural
   del período (Vaca Muerta, VMOS, GNL), con reglas de salida.

## Fases

| Fase | Período | Objetivo | Unidades | Métrica de salida |
|---|---|---|---|---|
| **0. Aprender barato** | oct–dic 2026 | 3 validaciones en paralelo + sistema funcionando | EXP-01 (consorcios), EXP-02 (transportistas), EXP-04 (lab logístico); EXP-06 (medio, casi todo IA); OP-03 solo si aparece un pedido real; tesorería activa | ≥ 1 experimento con señal fuerte de pago |
| **1. Primer motor de caja** | ene–jun 2027 | Escalar 1–2 ganadores; matar el resto | Las 2 mejores unidades según `/comite` | ≥ USD 500–1.000/mes de flujo neto; horas del fundador por cliente en baja |
| **2. Plataforma y reinversión** | jul-2027 → 2028 | Back-office IA compartido; primeras compras | Compra de cartera de edificios (pago diferido); primer activo de renta (solar en edificios administrados, OP-11); primera micro-adquisición en USD (OP-08) como cobertura de 2027 | USD 2.000–4.000/mes; ≥ 1 activo en USD |
| **3. Compounding** | 2029–2031 | Roll-up, productos y activos reales | Más carteras (consorcios; contables con socio), producto vertical de OP-04 o del back-office, inmueble en un nodo energético (OP-10), financiación de terceros (fideicomisos) | Flujo que ya no depende del aporte del fundador; patrimonio diversificado en USD |

## Cómo se refuerzan las unidades entre sí

```
                  ┌───────────────────────────── OP-07 Medio vertical / radar ─────────────────────────────┐
                  │  audiencia, leads y oportunidades                                                     │
                  ▼                                  ▼                                   ▼                 ▼
        OP-02 Oficina IA transportistas ◄──datos── OP-04 Lab. decisiones logísticas ──► OP-03 Maquinaria usada
                  │                                  ▲                                   │
                  └──────── back-office IA compartido (código, agentes, procesos) ───────┤
                                                     │                                   │
        OP-01 Consorcios con IA ──► compras agregadas, seguros ──► OP-11 Solar en edificios (activo de renta)
                  │
                  └──► carteras compradas con pago diferido ──► R11 estudios contables (con socio)

        Caja de todas las unidades ──► Tesorería USD (OP-09) ──► OP-08 micro-adquisiciones USD / OP-10 inmueble en nodo energético
```

- **Infraestructura compartida**: el mismo stack de agentes (WhatsApp + OCR + liquidaciones + reportes) sirve a OP-01 y OP-02, y
  puede venderse como producto en la fase 3.
- **Distribución compartida**: OP-07 abarata la adquisición de clientes de OP-02/03/04.
- **Datos compartidos**: costos logísticos reales (OP-02) → mejores modelos (OP-04) → mejor contenido (OP-07).
- **Capital compartido**: el comité mueve caja al mejor retorno marginal, no a la unidad que la generó.

## Proyección ilustrativa (Monte Carlo, `herramientas/cartera.py proyectar`)

Supuestos: aporte USD 400/mes, herramientas USD 120/mes, tesorería al 7%, 90% de reinversión, **máximo 2 unidades escaladas a la vez**
(capacidad del fundador), **15% de probabilidad de que el fundador no pueda dedicar las horas** (todas fallan) y un factor común de
ejecución.

| Métrica | Base (P50) | Estrés (probabilidades × 0,6, P50) | Solo tesorería |
|---|---|---|---|
| Flujo mensual de unidades, mes 24 | ~USD 2.600 | ~USD 1.200 | — |
| Flujo mensual de unidades, mes 60 | ~USD 3.300 | ~USD 1.400 | — |
| Patrimonio, mes 60 | ~USD 158.000 | ~USD 48.000 | ~USD 28.500 |
| Patrimonio P10, mes 60 | ~USD 17.800 | ~USD 17.800 | ~USD 28.500 |

Lectura: **asimetría**. En el peor decil se termina con ~USD 10.000 menos que con solo tesorería (el costo de intentar); en la
mediana, varias veces más. El determinante es que al menos una unidad de servicio funcione en el año 1 → por eso se validan tres
en paralelo y baratas.

## Reglas de la trayectoria

- No abrir la fase 2 sin un motor de caja con 3 meses de flujo positivo.
- No más de 2 unidades escaladas por el fundador; una tercera solo con un operador/socio.
- Cada compra (cartera, micro-adquisición, activo) pasa por `/evaluar` + `/matar` + comité, con due diligence documentada.
- Antes de las elecciones de 2027: revisar exposición regulatoria (OP-03) y subir cobertura en USD (OP-08, tesorería global).
