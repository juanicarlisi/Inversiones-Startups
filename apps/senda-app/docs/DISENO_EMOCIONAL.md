# Diseño emocional: guía práctica

Versión completa (por qué, investigación, nostalgia de la vida de iglesia, mapa de momentos): proyecto v2.1, capítulo 20.
Esta guía es la que se usa al construir cada función.

## Antes de construir una pantalla, responder

1. **¿Qué emoción busca?** Una de las diez: alegría, sorpresa, curiosidad, asombro, ternura, nostalgia, pertenencia, orgullo, calma,
   esperanza.
2. **¿Cómo se logra con cada herramienta?**
   - Animación: micro 120–200 ms (toques), transición 250–350 ms, momento 600–1.500 ms; resortes; anticipación antes de lo grande.
   - Sonido: Arena brillante, Santuario casi nada; la armonía sube con los aciertos; siempre acompañado de un cambio visual.
   - Vibración: `haptica.toque | firme | acierto | error | premio` (src/util/haptica.ts). Nunca en el lector de la Biblia.
   - Imagen: ámbar = la Palabra y el hogar; índigo = la noche y la aventura.
   - Texto: corto, cálido, humor suave, sin culpa. Español neutro con «tú».
3. **¿Cuál es el pico y cómo termina?** Cuidar el momento más intenso y el final de la sesión.
4. **¿Pasa las reglas para no manipular?** Sin culpa ni miedo; sorpresas solo cosméticas; respetar el descanso (después de las 23,
   Lani sugiere dormir); la emoción lleva a la Palabra (toda celebración muestra la cita); con menores, más suave.

## Momentos ya hechos (sprint 0)

| Momento | Dónde | Cómo |
|---|---|---|
| Lani viva | `Lani` en `src/arte/Arte.tsx` | Respira (escala 1 → 1,025 cada 1,6 s) y parpadea cada 2,6–5,2 s |
| Saludo según la hora y Lani que duerme de noche | `pantallas/Inicio.tsx` | `saludo()` y pose `dormida` después de las 23 |
| Botones físicos | `Boton` en `componentes/base.tsx` | Se hunden 3–4,5 px con resorte y vibración de toque |
| Acierto | Lección y Espadeo | Opción verde con chispas (`Chispas`), Lani festeja, vibración de éxito, «¡Imparable!» desde 3 seguidas |
| Error | Lección | Sacudida corta, Lani «uff», la respuesta correcta con su cita y «Leer el pasaje» |
| Sin vidas | Lección | Lani se desmaya; la primera opción siempre es leer la Biblia (nunca gasta vidas) |
| Celebración | `CapaCelebracion` | Cartel que baja con Lani festejando y los Talentos que se cuentan de a uno |
| Suspenso y alivio | Ruleta de Espadeo | 3,2 s con desaceleración cúbica y vibración fuerte al parar |
| Asombro | Pieza ganada | La pieza entra girando y creciendo con chispas del color de su categoría |

## Próximos (sprints 1 y 2)

Sonidos propios y armonía creciente · «¡Volviste!» · Pausa con Lani (respiración 4–6 antes de leer) · lecciones con estilo de
franelógrafo · la Biblia que amanece al terminar la lectura del día · recuerdos («Hace un año leías…»).
