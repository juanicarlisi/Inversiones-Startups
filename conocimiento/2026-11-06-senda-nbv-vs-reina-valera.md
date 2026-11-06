# Senda: ¿la NBV mantiene los términos de la Reina-Valera? (06-11-2026)

**Pregunta del fundador (06-11-2026):** «lo de NBV tenés que analizar si cambia mucho respecto de la Reina-Valera. Si mantiene mejor los
términos, usemos esa». Resumen operativo: capítulo 72 §3 del proyecto.

## Método

- Texto: las cuatro Biblias en español que Senda tiene con licencia (`assets/biblia/*.bib` de la app): RV1909 (base de la RVR1960, con
  la ortografía de hoy), PDT, NBV (Biblica® Open Nueva Biblia Viva, CC BY-SA 4.0) y BES. La RVR1960 no se usa (derechos; capítulo 50).
- **Términos clave (ESTIMACIÓN):** 60 términos (gracia, fe, justificar, justicia, santificar, redimir, arrepentirse, perdón, pecado,
  salvación, gloria, reino de los cielos, evangelio, cruz, resurrección, vida eterna, Espíritu Santo, Hijo del Hombre, Cordero, pacto,
  misericordia, iglesia, bienaventurado, amor, esperanza, paz, verdad, alma, corazón, carne, mundo, luz, tinieblas, templo, sacrificio,
  sangre, bendecir, alabar, orar, ley, mandamiento, profeta, apóstol, discípulo, señor, cielo, infierno, Satanás, ángel, gentiles,
  fariseo, sábado, bautizar, Cristo, siervo, fruto, obras, temor, afanarse, gozo). Para cada uno, en los versículos donde la RV1909 lo
  usa, se cuenta si la otra versión lo usa en el mismo versículo (raíz, sin acentos).
- **Cercanía general (ESTIMACIÓN):** por versículo, qué parte de las palabras con contenido de la RV1909 (raíz de 5 letras, sin
  palabras vacías) aparece en la otra versión.
- Guiones: `scratchpad/nbv/medir.py`, `cercania.py`, `ejemplos.py` de la sesión.

## Resultados

| | PDT | NBV | BES |
|---|---|---|---|
| Términos clave conservados (global) | 71,4 % | 57,3 % | 75,9 % |
| Palabras de cada versículo conservadas (media) | 58,7 % | 38,5 % | 49,5 % |
| Versículos con texto (de 31.102) | 31.079 | 29.102 | 31.101 |
| Largo relativo a la RV | 0,96 | 1,10 | 1,12 |

Términos donde la NBV más se aleja: gracia 22 %, justificar 16 %, redimir 29 %, misericordia 32 %, alma 11 %, obras 18 %, temor 29 %,
corazón 41 %, verdad 44 %, ley 57 %. Donde la PDT se aleja: reino de los cielos 0 % («reino celestial»), evangelio 5 % («buenas
noticias»), arrepentirse 3 % («den la vuelta»), siervo 0 %, tinieblas 5 %, bienaventurado 4 % («inmensamente felices»); además usa
«YAVÉ» por Jehová y «ʼElohim».

## Ejemplos (texto en la app, 06-11-2026)

- Efesios 2:8 · RV1909 «Porque por gracia sois salvos por la fe» · NBV «Por su misericordia y por medio de la fe, ustedes son salvos» ·
  PDT «Por gracia son salvos por medio de la fe».
- Romanos 3:24 · RV1909 «Siendo justificados gratuitamente por su gracia, por la redención que es en Cristo Jesús» · NBV «Dios, por su
  gran amor, gratuitamente nos declara inocentes, porque Jesucristo pagó todas nuestras deudas».
- Mateo 4:17 · RV1909 «Arrepentíos, que el reino de los cielos se ha acercado» · NBV «Arrepiéntanse de sus pecados porque el reino de
  los cielos se ha acercado» · PDT «Den la vuelta, porque el reino celestial se acercó».
- Filipenses 4:6 · RV1909 «Por nada estéis afanosos» · NBV «No se angustien por nada; más bien, oren».

## Conclusión

INFERENCIA: la NBV es la que más cambia los términos (es casi una paráfrasis): no cumple la condición del fundador y no pasa a
predeterminada. Sirve a un toque, para entender, y en el versículo del día. Ninguna versión libre en español conserva los términos como
la Reina-Valera; por eso Senda sigue leyendo en la RV1909 con las palabras de hoy, el glosario y la RVR1960 a un toque.
