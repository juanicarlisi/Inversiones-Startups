# Capítulo 69 · Prueba 43: las lecciones corregidas una por una

Fecha: 06-11-2026. Pedido del fundador: «Continua» (dos veces), después de decidir el 01-11 que el MVP sale con la Lany de Rive
(DEC-2026-11-01-3) y de pedir que, con poco consumo, se avance con lo pendiente.

## 1. Qué se hizo

1. **Las 331 dudas de la segunda lectura de las lecciones** (capítulo 68 §4.2). Seis revisores las leyeron contra la RV1909 y
   decidieron, una por una, «aplicar» o «no» con su porqué: **309 cambios entraron** y **49 propuestas quedaron como estaban** porque
   el texto actual se defiende. Ejemplos de lo que cambió: Génesis 11 dice «Era entonces» y la lección decía «Al principio» (ahora
   «Después del diluvio»); Hebreos 7 cita a Melquisedec y la lección lo atribuía a Génesis 14; el saludo de 1 Corintios 16 se
   completó con el versículo 23; la familia de Abraham suma a los hijos de Cetura (Génesis 25:1-2); Lázaro va después de la confesión
   de Pedro en el gran relato (Juan 11 y 12). Nueve lecciones recibieron un mapa nuevo.
   - Herramienta: `scripts/autor/parches_dudas42.py` con las decisiones en `scripts/autor/dudas42/` (reproducible). Escribe en el
     script de autor y en el contenido; los reordenamientos usan `orden()` (mueve también las traducciones); los visuales van a
     `visuales.py`. Seis cambios solo se pudieron escribir en el contenido (el script los lista): si se regenera esa ruta, se vuelve
     a correr.
   - Un atajo que pasaba los cambios al script «por tramos» dejó un párrafo mal armado («Cas últimas palabra»): se volvió todo
     atrás y se rehízo con un solo tramo verificado por cambio. Validador y «empezar por el principio» en cero.
2. **«Jan Hus» ya no aparece como «Jan Uz».** El repaso de ortografía cambiaba «Hus» (la tierra de Job en la RV1909) también en el
   nombre del reformador. `scripts/ortografia.py` ahora protege los nombres de la historia que coinciden con una grafía vieja.
3. **La trivia corregida en portugués e inglés**: entraron las traducciones de las preguntas corregidas en la prueba 42 y el inglés
   del banco 41 (portugués 5.235 y inglés 5.201 de 5.379). El lote costó USD 4,61 estimados.
4. **UX de los juegos**: «En la frente» y «Vivir la historia» revisados en la vista previa (instrucciones al entrar, opciones claras,
   botón a la vista): sin cambios necesarios. «Antes o después» ya se había corregido el 06-11 (voseo y «Supera el anterior»).
5. **APK 43** lanzado el 06-11 con todo lo anterior (Lany como en el 42b).

## 2. Lo que no se hizo y por qué

- **Volver a traducir las lecciones corregidas** (420 lecciones-idioma, `scripts/autor/rutas_lotes/retraducir.json`). Con el flujo
  actual (la lección entera con sus pasajes) costaría ~USD 19 (ESTIMACIÓN: 0,046 por lección-idioma, lo que costó la Travesía en la
  prueba 40) y quedan ~USD 10 de los 200 (ESTIMACIÓN: ~USD 190 usados). No se manda para no pasar del crédito. Opciones: un pedido
  por campo con solo los versículos citados (más barato, hay que armarlo) o hacerlo en una sesión. El español, idioma del
  lanzamiento, ya está corregido; en portugués e inglés esas lecciones dicen lo de antes hasta entonces.

## 3. Lo que sigue

1. Probar el APK 43 (contenido; Lany igual que en el 42b).
2. Retraducir las lecciones corregidas (§2).
3. Recorrido entero con letra grande en los tres idiomas; ropa de Lany según el área.
4. Del fundador: cuenta de Play (15-11), INPI y abogado de PI, autorización del ministerio, los cuatro pasos de lo social.

## 4. Evidencia

- Commits en `senda-app`: 4acb61e (309 correcciones, Jan Hus), b567218 (traducciones de la trivia).
- Lote de recepción: run 42230398682 (`tokens: 1.386.337 de entrada, 183.382 de salida · USD 4,61`).
