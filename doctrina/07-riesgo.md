# 07 — Riesgo

## Taxonomía (cada ficha evalúa las que apliquen)

| Riesgo | Pregunta | Mitigación típica |
|---|---|---|
| Mercado | ¿Existe la demanda al precio necesario? | Validar con dinero (preventa, piloto pago) antes de construir |
| Financiero | ¿Cuánto capital puede perderse? ¿Hay descalce de monedas? | Tramos, ingresos en USD, sin deuda no autoliquidable |
| Operativo | ¿Qué falla en la ejecución diaria? | Procesos escritos, IA con controles, redundancia |
| Regulatorio | ¿Una norma puede prohibirlo, encarecerlo o eliminar la ventaja? | Mapa regulatorio, no depender de una sola norma reciente |
| Tecnológico | ¿La tecnología puede fallar o volverse commodity? | La ventaja no debe ser la tecnología sola |
| Ejecución | ¿El fundador tiene las horas y capacidades? | Ajuste fundador, socios, IA |
| Liquidez | ¿Se puede salir? ¿Cuánto tarda en convertirse en caja? | Activos con mercado secundario, contratos cortos |
| Concentración | ¿Dependemos de un cliente, proveedor o canal? | Tope por cliente/canal |
| Dependencia de plataforma | ¿Meta, Mercado Libre, Amazon o WhatsApp pueden cambiar las reglas? | Canales propios (lista de clientes, email, reputación) |
| Competitivo | ¿Qué pasa si un jugador grande entra? | Nicho, densidad, relaciones, velocidad |
| País / político | ¿Qué pasa con elecciones 2027, riesgo país, tipo de cambio, reversión de desregulaciones? | Escenarios; unidades robustas; parte de la tesorería fuera de riesgo Argentina |

## Contexto de riesgo (sep-2026)

- **Político**: aprobación presidencial ~42% estancada; peor evaluación de la serie; elecciones presidenciales 2027 con escenarios
  abiertos. Varias desregulaciones recientes (importación de líneas usadas, courier, drones, fondo laboral) podrían revisarse.
  Desde ago-2026, las iniciativas de desregulación requieren visto bueno político del Jefe de Gabinete → menor velocidad.
- **Macro**: riesgo país ~580–600 pb en suba; dólar mayorista en máximo nominal (~$1.525) pero 25% debajo del techo de la banda;
  inflación mensual 1,7% (ago-2026); actividad creciendo ~2% con industria y comercio en caída.
- **Global**: guerra con Irán y Ormuz casi cerrado desde marzo 2026; Brent ~USD 105; fletes y fertilizantes caros; FMI proyecta
  ~3% de crecimiento mundial pero inflación ~4,7%.

## Diseño asimétrico (downside limitado, upside abierto)

- **Opciones baratas**: pagar poco por el derecho a seguir (piloto, curso, primera operación con comisión de éxito).
- **Capital de otros en el riesgo**: preventa, comisión de éxito, financiación del vendedor.
- **Reversibilidad**: preferir decisiones reversibles; las irreversibles (compras grandes, contratos largos) exigen más evidencia.
- **Límite de pérdida por unidad** declarado en la ficha (`capital_perdido_usd` del escenario de fracaso).

## Escenarios 2027 para testear cada tesis

| Escenario | Qué cambia | Tesis más expuestas |
|---|---|---|
| Continuidad | Desregulación sigue, más lenta | Ninguna en especial |
| Giro moderado | Algunas normas se revierten; retenciones/aranceles suben parcialmente | Importación de maquinaria usada, courier, drones |
| Crisis de transición | Salto cambiario, controles de cambio | Todo lo que depende de importar y de crédito en pesos; ingresos en USD y activos externos protegen |
