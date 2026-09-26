---
id: EXP-07
oportunidad: OP-12
estado: diseñado
inicio: 2026-10
fin_previsto: 2027-06
presupuesto_usd: 450
horas_fundador_total: 50
---

# EXP-07 — Fábrica de herramientas: 15 publicadas en 90 días, corte al mes 9

## Hipótesis más riesgosa que prueba
Que herramientas con lógica de negocio argentina y logística (cálculos, validaciones, datos oficiales normalizados) consiguen
usuarios que pagan por uso en Apify Store y por agentes (MCP/x402) sin que nadie salga a venderlas.

## Métrica principal y umbrales (definidos ANTES de empezar)
| Resultado | Umbral | Decisión |
|---|---|---|
| Éxito (90 días) | ≥ 15 herramientas publicadas, ≥ 30 usuarios mensuales y ≥ USD 40/mes facturados | Seguir publicando ~1 por semana; buscar la que pegue |
| Zona gris (mes 9) | USD 40–100/mes | Mantener solo las que facturan; no publicar más |
| Muerte (mes 9) | < USD 40/mes facturados | Cerrar; lo aprendido pasa a la due diligence de OP-08 |
| Graduación | Una herramienta con usuarios recurrentes crecientes 3 meses seguidos | Diseñar su versión de suscripción (OP-14) |

## Diseño (pasos)
1. Semana 1: Claude arma la lista de 20 candidatas con evidencia de demanda (búsquedas en el Store, *issues* de herramientas vecinas,
   preguntas frecuentes de desarrolladores sobre Argentina/LatAm) y competencia débil; el fundador elige 10.
2. Semanas 2–12: Claude construye, prueba y publica ~1–2 por semana con precio por evento; cada una también como servidor MCP.
3. Mensual: tablero de usuarios, ejecuciones, ingresos y fallas; reparar o retirar.

## Qué hace Claude / qué hace el fundador
- **Claude**: investigación de demanda, código, pruebas, documentación, publicación (con el token de la cuenta del fundador),
  precios, mantenimiento y respuestas técnicas a *issues* según plantillas aprobadas.
- **Fundador**: crear la cuenta de Apify (y PayPal o cuenta bancaria para cobrar), habilitar el acceso de red del entorno a
  apify.com, aprobar la lista y cada publicación, 2 h/semana de revisión.

## Registro de resultados (fechado)
## Aprendizajes y decisión
