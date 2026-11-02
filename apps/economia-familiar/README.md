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

## Carga de tickets (sin IA)
Foto como respaldo visible mientras se cargan los ítems, parser determinista de texto pegado, clasificación por reglas y por lo aprendido
de las cargas anteriores (`cfg/aprendido`), autocompletado de ítems con último precio y chequeo contra el total del ticket.

## Datos (colecciones del Artifact)
`mov/<id>` movimientos · `cfg/main` rubros, fondos, tarjetas, parámetros · `cfg/plan` cobros y pagos mensuales · `cfg/metas` metas de compra · `cfg/aprendido` ítem → rubro.

## Camino a App Store
La capa de datos está aislada en `Store` (`src/p1_core.js`): para migrar basta reemplazarla (p. ej. Supabase) y empaquetar con Capacitor.
