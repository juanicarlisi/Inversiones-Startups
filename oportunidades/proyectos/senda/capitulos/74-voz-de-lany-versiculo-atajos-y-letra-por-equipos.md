# Capítulo 74 · Prueba 48: fuera la voz de Lany, el versículo legible, lo social en Inicio y Nombres por letra por equipos

Fecha: 06-11-2026. Pedido del fundador:

> «cuando apreto travesía x primera vez hay un sonido rarísimo, no sé si es lany o qué. es un espanto, suena varias veces y en varios
> momentos. por favor eliminá eso ya. Muy malo. O lo mejoras radicalmente o lo eliminamos. · en el juego de la letra, que la cantidad
> de equipos se pueda elegir, y permita elegir si o primero juega x tiempo cada uno, o si se van pasando y toca 1 vez a cada uno. creo
> q habría q poner un límite de cantidad de equipos igual para q no se trabe todo no? · el versiculo del dia aparece sin fondo y no se
> ve bien. con las letras negras. · creo que el código o para agregar amigo tienen que estar sí o sí en el inicio, para que sea fácil
> entrar rápido en comunidad · y la opción de crear un evento creo q también. TODO RECONTRA BIEN ARMADO Y CON LA MEJOR UX DEL MUNDO.
> Revisá lo q haga falta. Avancemos con estoy todos los próximos! Recordá los créditos para usar también.»

## 0. Respuesta corta

| Pedido | Qué se hizo | § |
|---|---|---|
| El sonido al entrar a la Travesía | Era la voz sintetizada de Lany (sílabas por cada gesto). Salió entera: Lany vuelve a no hablar | §1 |
| Versículo del día sin fondo y con letras negras | Causa: el texto oscuro había quedado sobre vidrio en los temas oscuros. Vuelve el sobre ámbar lleno; probado en temas claro y oscuro | §2 |
| Código y agregar amigo en Inicio; crear evento | Debajo de «Te esperan»: Agregar amigo, Mi código y Crear evento | §3 |
| Juego de la letra: cuántos equipos y cómo juegan, con tope | De 2 a 6 equipos; «Se pasan la letra» o «Cada uno su tiempo»; marcador, tabla final y ganador | §4 |
| Los créditos de la API | Medidos con los tokens de cada lote: USD ~196 de 200. No alcanzan para la retraducción con margen: se frena | §5 |
| Revisar lo que haga falta | Auditoría de textos: 84 casos, letra normal y grande, tres idiomas, 0 problemas; recorrido en la vista previa | §6 |

## 1. El sonido de la Travesía

**HECHO (código de la app):** en la prueba 42 se sumó una «voz» de Lany hecha por síntesis (`scripts/sonidos_lany.py`, doce sílabas:
hola, uy, ajá, tada…) que sonaba con cada gesto (saludar, señalar, estirarse, festejar). La primera vez que se entra a la Travesía,
Lany guía, saluda y señala: varias sílabas en pocos segundos, más dos sonidos de «aparece» cuando corre al nodo. Eso era el «espanto».

**Decisión (DEC-2026-11-06-7):** entre mejorarlo radicalmente o eliminarlo, se elimina: Lany no habla (regla del 13-10: «ni boca ni
voz»), y esas sílabas la contradecían. En la Travesía queda solo el sonido del nodo al llegar. Una voz futura, solo si es profesional,
con licencia y con el OK del fundador. El interruptor está en `src/lany/voz.ts` (`VOZ_LANY = false`).

## 2. El versículo del día

**Causa raíz:** en el rediseño de la prueba 47 el sobre del versículo pasó a vidrio, pero el texto siguió en el color oscuro pensado
para el ámbar. En los temas oscuros quedaba texto marrón oscuro sobre fondo oscuro.

**Arreglo:** vuelve el sobre ámbar lleno, con su solapa y el texto en marrón. El marco de UX (`docs/MARCO_UX.md`, R9) suma la
excepción: el versículo del día es el único bloque de color lleno además de la acción principal; y una regla nueva: **todo texto se
prueba sobre su fondo real, en un tema claro y en uno oscuro**.

## 3. Lo social a mano en Inicio

Debajo de «Te esperan» (lo urgente primero) y antes del resto, una fila de tres:

- **Agregar amigo**: abre Amigos con el buscador por alias listo.
- **Mi código**: muestra el código; con un toque se comparte la invitación. Si todavía no hay cuenta, lleva a Amigos para crearla.
- **Crear evento**: abre un evento nuevo para hoy en el calendario.

Los dos primeros aparecen cuando lo social está prendido (cuentas activas).

## 4. Nombres por letra por equipos

- **Cuántos**: de 2 a 6. **INFERENCIA:** con 6 equipos y «se pasan la letra», cada equipo espera como mucho 50 segundos su turno; con
  «cada uno su tiempo», una letra dura entre 3 y 6 minutos. Más equipos traban el juego y la sala pierde la atención: por eso el tope.
- **Se pasan la letra**: un nombre por turno, 10 segundos; el que se traba queda afuera de esa letra (se ve tachado en el marcador) y
  la gana el último que queda.
- **Cada uno su tiempo**: 30, 45 o 60 segundos por equipo para decir todos los que pueda (no valen los que ya dijo otro). Entre equipo
  y equipo, una pantalla «Le toca al…» para pasarse el teléfono. La letra la gana el que dijo más; en un empate suman todos.
- Marcador de todos los equipos arriba, la lista de Senda con la letra al final de cada una (lo que se aprende antes del puntaje) y,
  al terminar, la tabla y el ganador con fiesta. «Sacar una letra» queda fijo abajo, siempre a la vista.
- **Arreglo de paso:** el reloj leía el estado del momento en que arrancaba; al acabarse el tiempo en «Todos juntos», el récord se
  guardaba en 0. Ahora lee el estado al día.
- Todo en los tres idiomas; «Cómo se juega» actualizado.

## 5. Créditos de Anthropic: medidos

**HECHO (06-11-2026, `claude_lotes.py gasto`, suma de los tokens que la API devolvió en cada lote):** 31 lotes; 44,1 millones de tokens
de entrada sin caché, 8,9 millones leídos de caché, 5,8 millones escritos en caché y 9,2 millones de salida.
**ESTIMACIÓN** con los precios de lista de Claude Opus 5.5 (USD 4 y 20 por millón; 50 % en lotes; leer de la caché, 5 %; escribir,
125 %): **USD ~196 de 200**. Antes se estimaban ~190 (sin la caché bien contada y sin los lotes del 06-11).

**Decisión (DEC-2026-11-06-8):** no se mandan más lotes. Retraducir los campos corregidos costaría USD 3 a 4 por idioma aun campo por
campo (USD ~14 por idioma con lecciones enteras): lo que queda no alcanza con margen y lo que pase de los créditos podría cobrarse a la
tarjeta. **Queda pendiente:** 294 campos por idioma (portugués e inglés) que se corrigieron en español en las pruebas 43 a 46; se hacen
en una sesión, campo por campo (`scripts/autor/rutas_lotes/retraducir.json`).

Con los USD 200 se hicieron: la trivia y la Travesía entera en portugués e inglés, una segunda lectura de la trivia y de las 458
lecciones contra la RV1909 y más de 3.000 preguntas nuevas (bancos 40 y 41).

## 6. Revisión general

- Auditoría de textos (`scripts/auditoria/textos.cjs`): 84 casos (todas las pantallas, letra normal y grande, portugués e inglés):
  **0 problemas**. La insignia del nivel junto al avatar contaba como «tapada» en cada pestaña (22 avisos); se ve entera y su número
  está en la etiqueta del botón: quedó como excepción en la auditoría.
- Recorrido en la vista previa: Nombres por letra en las dos formas, con 3 y 4 equipos, en temas oscuro y claro; Inicio en inglés.
- Comprobación de tipos, prueba de arranque (8 de 8) y validador del contenido: en orden.

## 7. Qué probar en el APK 48

1. Travesía: entrar; no tiene que sonar ninguna voz.
2. Inicio: el versículo del día en tu tema; Agregar amigo, Mi código y Crear evento.
3. Jugar → Nombres por letra → Por equipos: 3 equipos, las dos formas.
4. Lo del APK 47 que quedó por probar: la Biblia en hojas, Antes o después y tu perfil.

## 8. Próximos

- Leer lo que el fundador diga de los APK 47 y 48.
- Retraducir los 294 campos corregidos (portugués primero, después inglés), en una sesión.
- La ropa de Lany según el área (estaba para la prueba 48; pasa a la 49).
- Licencias: lo que decida con la respuesta a las Sociedades Bíblicas Unidas (DEC-2026-11-06-4).
- Prender lo social con los cuatro pasos del fundador; seguir con el roadmap del lanzamiento (18-12).
