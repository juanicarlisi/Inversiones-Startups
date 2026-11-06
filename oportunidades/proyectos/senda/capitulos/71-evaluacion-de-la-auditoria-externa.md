# Capítulo 71 · Evaluación de la auditoría externa (ChatGPT, 03-11-2026)

Fecha: 06-11-2026. Pedido del fundador: «Chat GPT me dio este análisis. La verdad, no lo vi demasiado. Necesito que vos lo evalúes y veas
si tiene o no razón. No quiero que apliquemos cosas contrarias a lo clave que ya hayamos definido; pero quizás proporciona mejoras en las
interfaces, ideas, algo de UX, etc. […] Algo que sí me parece bueno: crear un grupo, agregar un amigo, o mi código para que me agreguen,
o el buscador de usuarios, etc., debería ser muy fácil y accesible.»

Documento evaluado: «Auditoría integral de Senda — 03.11.2026» (HTML, 46 capturas del APK 42, 28 hallazgos, nota 6,4/10). Se leyó
entero y cada punto se contrastó con el código de la app y con las decisiones registradas.

## 1. Veredicto general

INFERENCIA: es una mirada externa útil y honesta sobre sus límites (no usó la app: solo capturas). Sirve como lista de control de
claridad. De sus puntos, más o menos un tercio ya estaba resuelto (no se ve en una captura fija), un tercio son mejoras chicas que suman y
un tercio choca con decisiones de identidad que ya tomamos. La nota 6,4 no es comparable con nada: es un juicio sobre imágenes.

## 2. Tiene razón y ya se hizo (06-11, APK 45)

| Punto de la auditoría | Qué se hizo |
|---|---|
| Lo social depende de amigos/grupos sin salidas claras; invitar debe ser inmediato (S-07, Kahoot) | **Pedido del fundador.** Comunidad arranca con cuatro atajos: Agregar amigo, Mi código, Crear grupo, Unirme a un grupo. Buscador por alias en Amigos (solo alias, desde 3 letras, 10 resultados, sin bloqueados; el otro acepta o bloquea; cualquiera puede dejar de aparecer). Al crear un grupo se abre la lista de amigos; cualquier miembro invita a sus amigos. Migración `20261124000000_buscar_por_alias.sql`, 132/132 en `pruebas/nube`. |
| «Todo queda en tu teléfono» no cuadra con amigos y grupos (S-08) | Cierto. Ajustes dice «Lo que lees, en tu teléfono; lo que compartes, en la nube» y la política (borrador 0.3) explica qué se guarda en la nube (cuenta anónima, alias, amistades, grupos, partidas) y quién ve qué. Sigue pendiente la revisión del abogado. |
| «Lany en 3D» y «fiesta 3D» no dicen qué cambian (captura 40) | El diagnóstico del Lany 3D y su taller ya no se muestran con el 3D apagado (DEC-2026-11-01-3). La «Fiesta en 3D» (prueba 8) queda como estaba. |
| La armadura ocupa demasiado (S-03, captura 21) | En la partida ya es un marcador compacto (prueba 44). |
| Grupo: dos caminos claros (captura 16) | Crear va primero (prueba 44). |

## 3. Ya existía (la auditoría no lo pudo ver)

- **Perfil enterrado en Comunidad (S-13):** el avatar de arriba a la izquierda lleva a Perfil y ajustes desde todas las pestañas.
- **Contadores sin explicación (S-04):** al tocarlos explican qué son (vidas y cuándo vuelve la próxima, racha con su protector, talentos).
  Lo que sí falta es que se entienda sin tocarlos: ver §4.
- **Anuncios en la Biblia (S-11):** el plan gratis ya dice «La Biblia, siempre sin anuncios»; los anuncios van solo al terminar una partida.
- **Seguir leyendo:** la Biblia abre con lo de hoy y el seguir leyendo (prueba 34); Inicio también.
- **Ficha antes de cada juego:** «Cómo se juega» sale sola la primera vez y queda a mano (prueba 21).
- **Inicio finito:** «Eso es todo por hoy» (la auditoría lo elogia).
- **Álbum y azar (S-18):** sobres solo con Talentos, nunca repetidas, el primero de cada página gratis, nunca con plata (prueba 35).
- **Nombres:** la mascota es «Lany» (decisión del 13-10); «RVR1909» no aparece en la app (es «RV1909»).

## 4. Buenas ideas que propongo hacer (compatibles con lo decidido)

Orden por valor para el lanzamiento:
1. **Juegos con su «ficha» en la tarjeta**: debajo de cada juego, en chico: «1 jugador · 3 min», «con amigos», «en grupo, en vivo».
   Y el título de la pestaña «Jugar» arriba (el Espadeo sigue siendo el juego destacado, con su nombre).
2. **Después de cada juego, «lo que aprendiste» primero**: tres respuestas con su cita antes del puntaje en ¿Quién es?, Nombres por letra
   y Antes o después (en el Espadeo ya está «Leer el pasaje» en cada pregunta).
3. **Torneo sin amigos ni grupo**: en vez del botón apagado, decir qué falta y ofrecer «Agregar amigo» o «Crear grupo» ahí mismo.
4. **Unirse a un grupo con vista previa**: nombre, tipo y líder antes de confirmar.
5. **Invitar con enlace**, además del código (abre Senda en la pantalla de agregar).
6. **Travesía: lo disponible primero** y lo que viene en un apartado «En preparación», respetando el orden de áreas del fundador.
7. **Contadores con nombre** la primera vez (una etiqueta chica debajo del ícono hasta que se toca una vez).
8. **La guía de Lany que no tape**: globo que no bloquea y se cierra solo al tocar cualquier cosa.
9. **Ajustes agrupados** en cinco bloques (Lectura, Sonido y voz, Movimiento, Cuenta y plan, Privacidad).
10. **Medir contraste y tamaño de toque** en la auditoría automática de textos (`scripts/auditoria/textos.cjs`).

Requieren el OK del fundador porque cambian algo que él diseñó: un Inicio con una sola acción principal para quien recién llega (hoy
tiene varias a la par, y «Te esperan» arriba fue pedido suyo) y la Travesía con lo disponible primero (punto 6).

## 5. No conviene (choca con lo decidido)

- **Renombrar «Travesía» por «Aprender» y sacar «Espadeo», «Pulso» y «Talentos»** (S-02, heurística 2): Senda tiene lenguaje propio a
  propósito («no una app cristiana genérica», prueba 16). Lo que sí: cada nombre propio va con su línea que explica, como ya pasa en las
  tarjetas.
- **Lany menos protagonista** (§11 de la auditoría): Lany es pieza central de la UX por decisión del fundador; ya no aparece dentro del
  texto bíblico, que es lo que la auditoría cuida.
- **Biblioteca «Guardados» y recomendaciones explicables ahora**: suman, pero no antes del lanzamiento; primero lo que ya existe tiene que
  andar perfecto.
- **Rachas**: la auditoría advierte no castigar; Senda ya tiene día libre y protector, y la racha nunca bloquea la lectura.

## 6. Evidencia

- Commit 839a68a en `senda-app` (atajos, buscador, privacidad, Ajustes); migración aplicada por el flujo de Supabase al hacer push.
- Prueba de lo social en local: 132 de 132 pasos (Postgres 16, `pruebas/nube/correr.sh`).
