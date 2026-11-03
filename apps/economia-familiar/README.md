# Economía Familiar

App web (un solo `index.html`, sin dependencias salvo tipografías de Google Fonts) para llevar la economía de dos personas.
Publicada como Artifact de claude.ai con base compartida (`db`); sin esa base cae a modo local (localStorage).
**Los datos personales no viven acá**: están en la base del Artifact. Este repo es público: no subir importes reales.

## Modelo conceptual (sin doble conteo)
- **Consumo**: gastos que no vuelven. Es lo único que resta del resultado del mes.
- **Resultado** = ingresos − consumo.
- **Aporte a un fondo**: transferencia de "disponible" al fondo; no es gasto. Se cuenta una vez, en el mes del aporte.
  Los meses siguientes solo suman aportes nuevos y rendimientos.
- **Patrimonio** = disponible + saldos de fondos. Disponible = caja inicial + ingresos − consumo − aportes + retiros.
- **Compra pagada con un fondo**: baja el fondo y no entra al consumo del mes.
- **Mes de imputación**: efectivo/débito/transferencia → mes de la fecha; tarjeta → mes siguiente (o segundo mes si el día de cierre de la tarjeta está cargado). Cuotas: un movimiento por mes.
- Vistas por "mes de pago" (caja) o "fecha de compra" (devengado).

## Reparto, cierre de mes e histórico
- Cada fondo aporta un **monto fijo** o un **% de lo que sobra** (`modo`/`pct` en `cfg/main`). Con %, el aporte previsto de cada mes se recalcula con lo confirmado (`aportePlan`, `sobraEsp`).
- **Cerrar mes** (asistente en `abrirCierre`): confirma cobros/pagos reales, calcula lo que sobró, sugiere aportes y pide cuánto vale hoy cada fondo. La diferencia entre el valor real y el saldo calculado se registra como movimiento `rendimiento` (src `cierre`). Se guarda un snapshot en `cfg/cierre_YYYY-MM`.
- Histórico: rendimiento mensual = rend / (saldo inicial + aporte/2); anualizado aproximado con 3 o más meses cerrados.

## Carga de tickets
Al subir la foto, Claude (capacidad `sample` con imágenes; gasta el uso de Claude de quien la sube) devuelve comercio, fecha, medio, total y cada ítem
con su rubro. Las preferencias aprendidas de la familia (`cfg/aprendido`) pisan al rubro sugerido. Se chequea contra el total del ticket y se agrega
"Sin detallar" si falta diferencia. Alternativas sin IA: pegar texto de un ticket digital (parser determinista), escribir rápido y autocompletado con el historial.

## Datos (colecciones del Artifact)
`mov/<id>` movimientos · `cfg/main` rubros, fondos, tarjetas, parámetros · `cfg/plan` cobros y pagos mensuales · `cfg/metas` metas de compra · `cfg/aprendido` ítem → rubro.

## Camino a App Store
La capa de datos está aislada en `Store` (`src/p1_core.js`): para migrar basta reemplazarla (p. ej. Supabase) y empaquetar con Capacitor.
