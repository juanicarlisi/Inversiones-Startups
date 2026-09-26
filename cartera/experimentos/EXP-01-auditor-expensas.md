---
id: EXP-01
oportunidad: OP-01
estado: diseñado
inicio: 2026-10
fin_previsto: 2026-12
presupuesto_usd: 250
horas_fundador_total: 40
---

# EXP-01 — Imán "auditoría gratuita de expensas" + curso RPA

## Hipótesis más riesgosa que prueba
Que se pueden conseguir consorcios interesados en cambiar de administración a un costo bajo, usando un servicio gratuito hecho por
IA (auditar la liquidación de expensas) como puerta de entrada.

## Métrica principal y umbrales
| Resultado | Umbral (con ≤ USD 150 de pauta) | Decisión |
|---|---|---|
| Éxito | ≥ 10 auditorías solicitadas y ≥ 2 invitaciones a presentar propuesta (asamblea o consejo) | Liberar tramo óptimo de OP-01 |
| Zona gris | 4–9 auditorías o 1 invitación | Iterar mensaje/segmento una vez |
| Muerte | ≤ 3 auditorías | Probar solo la cuña B2B (back-office para administradores) o descartar |

## Diseño
1. Inscripción al curso inicial de administración (≥ 40 h, reconocido por el RPA). Costo ~USD 65.
2. Claude construye el **auditor de expensas**: el usuario sube el PDF de la liquidación; el sistema extrae rubros, compara con
   rangos de referencia (por tamaño de edificio y barrio), marca anomalías y genera un informe claro.
3. Landing con formulario y consentimiento de datos (Ley 25.326).
4. Pauta en Meta: propietarios 30–70 años en 3–4 barrios elegidos (densidad). Tope USD 150.
5. Cada informe se entrega con una llamada de 15 minutos; se registra dolor, administrador actual, honorario y fecha de asamblea.
6. En paralelo: 3 conversaciones con administradores mayores (venta de cartera / piloto de back-office B2B).

## Qué hace Claude / qué hace el fundador
- Claude: auditor, landing, anuncios (texto e imágenes), guion de llamada, CRM en planilla, síntesis semanal.
- Fundador: aprobar y pagar la pauta, llamadas, conversaciones con administradores, curso.

## Registro de resultados
(vacío)

## Aprendizajes y decisión
(vacío)
