# Medición de la síntesis (17-10-2026)

Mediciones propias hechas para el diseño maestro de Andén (`../diseno-maestro.md` y `../corte-1.md`). Responden cuatro preguntas que
los jueces dejaron abiertas y que deciden la arquitectura del corte 1:

1. ¿Philox4x32-10 en JavaScript puro reproduce los vectores oficiales y es lo bastante rápido? (nadie lo había medido)
2. ¿Se puede tener `log`, `exp` y `cos` deterministas que den lo mismo que el `Math` de V8?
3. ¿Cuánto frena la maqueta del hub cuando se cambia la matemática nativa por la propia? (alerta del juez arquitecto)
4. ¿El 15% de recirculación de la peor noche de la maqueta es física del hub o un artefacto de la plantilla? (alerta del juez
   ingeniero)

## Archivos

| Archivo | Qué es |
|---|---|
| `philox.mjs` | Philox4x32-10 en JS puro (solo enteros de 32 bits) contra los 3 vectores conocidos de Random123, y velocidad |
| `detmath.mjs` | `exp` y `cos` deterministas (adaptación de fdlibm `e_exp.c`, `k_cos.c`, `k_sin.c`) más el `log` de `medicion-tecnologia/detlog.mjs` |
| `precision.mjs` | Compara `expDet`, `cosDet` (en [0, 2π)) y `logDet` contra `Math.*` de V8, 2 millones de valores cada una |
| `hub_diag.mjs` | Copia de `../visiones/experiencia-medicion/hub.mjs` con la matemática propia, contadores por rampa y por persona, y la opción `planBalanceado` (personas de rampa asignadas por volumen esperado y no por rampas contiguas) |
| `correr.mjs` | Corre todo lo demás y escribe `resultados.json` |
| `resultados-philox.txt`, `resultados-precision.txt`, `resultados.json` | Salidas |

Cómo se repite: `node philox.mjs && node precision.mjs && node correr.mjs` (Node 22; tarda unos 3 minutos).

## Resultados (MEDIDO, 17-10-2026, Node 22.22.0, contenedor compartido de 4 núcleos, ±15–30% entre corridas)

**1. Philox4x32-10.** Los tres vectores de prueba de Random123 dan exacto (`6627e8d5 e169c58d bc57ac4c 9b00dbd8`, etc.; fuente:
https://raw.githubusercontent.com/DEShawResearch/random123/main/tests/kat_vectors, consultada el 17-10-2026). Velocidad: 12–20 millones
de llamadas por segundo, o sea **25–41 millones de uniformes de 53 bits por segundo** en cuatro corridas. Un hub de 24.000 paquetes con
~8 uniformes por paquete pide ~200.000 uniformes por noche: 5–8 ms. No es el cuello.

**2. Matemática determinista.** `expDet`, `cosDet` y `logDet` coinciden bit a bit con `Math.exp`, `Math.cos` y `Math.log` de V8 en
**2.000.000 de valores de 2.000.000** cada una (0 ulp). Como usan solo `+ − × ÷` (exactas por IEEE 754), dan lo mismo en cualquier
motor de JavaScript. Falta medir en Firefox y Safari que la nativa difiera y la propia no (prueba R04 del corte 1).

**3. Costo en la maqueta del hub** (mediana de 10 noches):

| | Matemática nativa | Matemática propia |
|---|---|---|
| Noche de 24.000 paquetes, sin traza | 157–162 ms | 160–185 ms |
| Ídem, con traza | 155 ms | 172–196 ms |
| Noche de 90.000 paquetes, sin traza | 733–744 ms | 759–775 ms |
| KPI de las 10 noches | — | **idénticos bit a bit** a los de la nativa (10 de 10) |

Lectura (INFERENCIA, confianza alta): la matemática propia cuesta **entre 0% y 25%** en un modelo con mecanismo, porque el tiempo se va
en la lógica y no en los sorteos. La maqueta hace ~188.000 operaciones (eventos + pasos del sorter) por noche de 24.474 paquetes: ~7,7
por paquete, como midió el juez arquitecto.

**4. La recirculación de 15% es un artefacto de la plantilla, y a la vez la decisión más barata del hub.**
- En las tres peores noches de 60 (14,6–15,0% de recirculación), **el 100% de las vueltas sale del grupo de la persona que vacía la rampa
  R1**. R1 es la ruta más pesada del reparto Zipf (~2.800–2.900 paquetes por noche) y esa persona cubre además otras tres rampas: recibe
  3.700–3.900 paquetes, 2,8 veces la mediana por persona (1.270–1.340), y con la regla «la más llena primero» deja que sus rampas
  livianas se llenen.
- Si las 15 personas de rampa se asignan **por volumen esperado** (cada rampa a la persona menos cargada, de la más pesada a la más
  liviana) en lugar de por rampas contiguas, en las mismas 60 noches la recirculación pasa de mediana 0,17% · P90 7,2% · máximo 15,0% a
  **mediana 0% · P90 0,01% · máximo 0,03%**, y el P90 de espera de la mediana de noches baja de 4,2 a 3,6 min.
- Conclusión: el rango 0,17–15% **no** es física del hub; es el reparto de personas de la plantilla. Lo que sí es real y de primer
  orden es que el **plan de clasificación** (qué ruta va a qué rampa y quién vacía cada rampa) cambia el resultado sin gastar un peso.
  Va como decisión central del producto (diseño maestro §2, C6) y no como argumento de venta del 15%.

**5. Perder el corte depende de las faltas sin reemplazo** (200 noches, reparto balanceado). Con 4 puestos, 6 de 200 noches no llegan al
corte, las 6 con alguna falta; con 5 puestos, 2 de 200, las 2 con dos o más faltas (una noche, la semilla 50, tuvo 3 de 4 y 4 de 5
puestos ausentes: mala suerte real, las semillas dan 5,0% bajo 0,05 como deben). La maqueta **no repone** a quien falta: es una regla
del modelo, no un hecho. Por eso «¿cubrís al que falta?» es un parámetro explícito del corte 1 (retén de reemplazo).

## Qué NO dicen

Nada sobre teléfonos, Firefox, Safari ni GPU. Philox y la matemática propia se midieron solo en V8. Los parámetros del hub son
supuestos de ejemplo de la maqueta, no datos de ninguna empresa.
