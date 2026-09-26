# 02 — Estándares de evidencia

## Las cuatro etiquetas

Toda afirmación relevante en una ficha, informe o decisión lleva una de estas etiquetas (explícita o por contexto inequívoco):

| Etiqueta | Definición | Requisito |
|---|---|---|
| **HECHO** | Dato verificable del mundo | Fuente + fecha del dato + fecha de consulta |
| **ESTIMACIÓN** | Número derivado de hechos con un método | Método explícito y rango (nunca un punto solo) |
| **HIPÓTESIS** | Supuesto necesario para la tesis, todavía no probado | Cómo se valida y qué resultado lo refuta |
| **INFERENCIA** | Conclusión propia a partir de hechos | Razonamiento visible; marcar confianza (alta/media/baja) |

## Jerarquía de fuentes

1. **Primarias**: Boletín Oficial, InfoLeg, normas de ARCA/BCRA/CNV/SSN/ANAC, INDEC, balances y 6-K/20-F, documentos de la
   Comisión Europea, contratos, datos abiertos (datos.gob.ar, SSN, GCBA).
2. **Secundarias de calidad**: medios económicos con firma (La Nación, Infobae, Cronista, Ámbito, Bloomberg Línea, Reuters),
   estudios jurídicos (Marval, Allende & Brea, O'Farrell), cámaras sectoriales (FADEEAC, CIRA, CAEM, CAPHAI), organismos (FMI, BID).
3. **Terciarias / interesadas**: blogs de proveedores, agencias, rankings, notas patrocinadas. Útiles para orientarse, nunca para
   decidir capital sin contraste.
4. **Primera mano**: entrevistas con clientes, cotizaciones reales, pruebas propias. Son las más valiosas para la economía unitaria.

## Reglas

- **Fecha siempre.** "El dólar mayorista cerró $1.525,50 (25-09-2026)". Un dato sin fecha se trata como hipótesis.
- **Rangos, no puntos.** Las estimaciones van como mínimo–más probable–máximo.
- **Datos que deciden capital se verifican en fuente primaria** antes de asignar más de USD 500.
- **Conflictos de fuente**: registrar ambas, explicar la diferencia y elegir con criterio (y decir cuál).
- **Sesgo de supervivencia**: al estudiar casos de éxito, buscar también los fracasos del mismo modelo.
- **Resúmenes de buscadores**: pueden deformar números (visto en la sesión fundacional: un resumen convirtió "$387,26 de distancia al
  techo" en "el dólar está en 387"). Contrastar siempre con un segundo resultado.
- **Actualización**: cada ficha tiene `fecha_revision`. Si pasó más de 90 días, el tablero la marca como vencida.

## Dónde vive cada cosa

- Hechos de contexto → `radar/contexto-macro.md`, `radar/mapa-regulatorio.md`.
- Hechos de investigación puntual → `conocimiento/<fecha>-<tema>.md` (bitácora con fuente por línea).
- Hechos de un cliente o experimento → `cartera/experimentos/EXP-XX.md`.
