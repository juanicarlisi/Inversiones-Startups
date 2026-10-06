# Líderes e iglesias: Senda Reunión y Senda Púlpito

<div class="enpocas" markdown="1">
**En pocas palabras.** **Senda Reunión** es la **caja de herramientas del líder**: él arma el esquema de su reunión (su bosquejo, un
quiz tipo Kahoot, juegos, un campeonato o una liga del grupo, algo del día), la juega en la pantalla grande con todos y después ve
registros, puntajes, en qué reforzar y un reporte mensual. **Nada lo arma una IA sin el líder:** la app da recursos y, si el líder
lo pide, le propone preguntas desde su PDF (06-10-2026); el líder revisa y decide. **Senda
Púlpito** hace lo mismo para el pastor: arma un **Desafío del domingo** con su mensaje y lo comparte con su iglesia para jugar durante
la semana.
</div>

## 1. Qué cambió desde la v1

La v1 proponía un planificador con IA que armaba la reunión entera (rompehielo, juego, mensaje, preguntas). **Se elimina.** La reunión
la arma el líder, que conoce a su grupo y tiene su propio mensaje. Senda le da lo que hoy le falta: herramientas para que sea dinámica,
para que participen todos (aunque sean 60) y para saber después cómo fue.

## 2. Grupos

- **Qué es un grupo:** jóvenes de una iglesia, una célula, una clase de escuela dominical o un grupo de amigos. Lo crea un líder (18 o
  más) y se entra con un **código o un QR**.
- **Qué comparte el grupo:** su **calendario** (capítulo {{cap:13}}), metas del grupo, plan de lectura, pedidos de oración (Oremos),
  encuestas (Pulso), su liga privada y el registro de reuniones.
- **Panel del líder:** actividad **agregada** del grupo (cuántos leyeron, cuántas lecciones, temas más fallados). El detalle por persona
  solo con consentimiento (16 o más) o de los padres (menores de 16).
- **Iglesia:** varios grupos forman una iglesia; la iglesia se verifica (datos básicos + un responsable) para usar Senda Púlpito y el
  calendario de iglesia.

## 3. Senda Reunión: el armador del líder

{{MOCK:reunion}}

**Cómo arma una reunión (todo lo elige el líder):**

1. **Nueva reunión** desde el calendario del grupo («Sábado 10-oct, 18 h») o desde cero. Título y tema, si quiere.
2. **Su bosquejo (opcional):** sube su PDF, una foto o escribe sus notas. Queda en su teléfono como guía y, si quiere, lo proyecta como
   diapositivas. Senda solo lo lee si el líder pide preguntas a partir de él (ver «El quiz en vivo, a fondo»).
3. **¿Qué querés sumar?** Elige bloques y los ordena arrastrando:

| Bloque | Qué es | Cómo se arma |
|---|---|---|
| **Quiz en vivo** | Preguntas en pantalla, todos responden desde el celular, podio | Escribe sus preguntas, elige del banco de Senda por pasaje o tema, o mezcla |
| **Juego** | Oveja Perdida, Dibujalo, Tutti Frutti, Abecé por equipos, ¿Quién soy?, ¡Prohibido!, ¡Desenvainá! con la Biblia de papel | Elige el juego y, si quiere, carga sus propias palabras |
| **Campeonato** | Un torneo entre los presentes (eliminación o grupos), en una noche o en varias reuniones | Elige formato y juego |
| **Liga del grupo** | Una temporada interna con puntos por reunión y por la semana | Elige duración y qué suma |
| **Algo del día** | Versículo, desafío para la semana, pregunta para compartir en grupos chicos, encuesta en vivo | Lo escribe o lo elige |
| **Oración** | Pedidos del grupo en pantalla (solo los que se compartieron para eso) | Desde Oremos |
| **Herramientas** | Sorteo de equipos, cronómetro, marcador, ruleta de nombres, anuncios | — |

4. **Tiempos:** le pone minutos a cada bloque; la app le muestra la duración total.
5. **Guardar como plantilla** para reusarla o **compartirla con otros líderes** (biblioteca de reuniones hechas por líderes, con su
   nombre; Senda solo la ordena y la revisa).

### El quiz en vivo, a fondo (pedido del fundador, 06-10-2026)

No es una copia de Kahoot: toma lo que funciona (todos responden desde su teléfono, ritmo y podio) y le suma lo de Senda.

- **Entrar es un toque:** un **enlace** para el grupo de WhatsApp, un **código** de 6 letras o el **QR** en la pantalla grande. El
  código vale el día entero, así el líder lo puede mandar antes (Kahoot amplió su PIN de 4 a 8 horas por lo mismo).
- **Modos:** clásico (rapidez y acierto), **por equipos**, **supervivencia con vidas** (cada uno empieza con 3; el que se queda sin
  vidas sigue jugando para su equipo y puede volver con una pregunta de rescate; estas vidas son de la reunión, **nunca** las de la
  app) y **precisión** (sin reloj, para los más chicos o preguntas de pensar).
- **Video:** un bloque puede ser un video corto (de YouTube o subido por el líder) y las preguntas siguientes son sobre lo que se vio.
- **Las preguntas las arma el líder:** las escribe, las elige del banco de Senda por pasaje o tema, o **sube un PDF** (su bosquejo, un
  estudio, una guía) y Senda **le propone** preguntas sacadas de ese texto, cada una con su cita si la tiene; el líder las revisa,
  corrige, borra o agrega antes de usarlas. **Cambio de decisión:** antes «Senda no lee el bosquejo»; ahora lo lee solo si el líder lo
  pide, y nada se usa sin su aprobación (Kahoot ofrece algo parecido desde 2024: el PDF se transforma en preguntas).
- **Lo que lo hace de Senda:** cada pregunta tiene su cita y al final «Leer el pasaje»; el quiz puede quedar abierto toda la semana como
  desafío del grupo; los menores juegan con apodo; Lani anima en la pantalla; el registro muestra qué reforzar.
- **Escala:** las salas en vivo usan tiempo real (docs/ESCALA.md del repositorio de la app, sección 5): hasta cientos de salas a la vez
  con Supabase Pro; para miles, un servicio de tiempo real por sala.

Fuentes: [Kahoot: del PDF a preguntas con IA (2024)](https://kahoot.com/blog/2024/01/17/ai-pdf-question-generator-for-educators/),
[novedades de Kahoot EDU, 2025 (PIN de 8 horas)](https://support.kahoot.com/hc/en-us/articles/40981626377235-Kahoot-EDU-Quarterly-Newsletter-Q2-2025).

## 4. En vivo

1. El líder abre la reunión desde su teléfono, tablet o computadora conectada al proyector o al televisor. La pantalla grande muestra el
   código de la sala y un QR.
2. Los chicos entran **desde la app** con el código (cada reunión es una ola de descargas); desde fines de 2027 también **desde el
   navegador**, sin instalar.
3. El líder maneja todo desde su teléfono: avanza bloques, pausa, muestra resultados.
4. **No gasta vidas:** en la reunión juegan todos.

## 5. Después: registros, refuerzos y reporte

- **Registro de cada reunión** («Reunión 12 · sáb 10-oct»): quiénes vinieron, puntajes de cada uno, el podio, las preguntas que más
  costaron y los juegos que más gustaron.
- **En qué reforzar:** las preguntas más falladas con su pasaje; con un toque se mandan como repaso al grupo.
- **¿Sigue en la semana?** El líder elige si el quiz queda abierto como **desafío semanal**, si el campeonato continúa la próxima reunión
  o si suma a la liga del grupo.
- **Reporte mensual** (plan Líder): asistencia, participación, avance del grupo en la Travesía, temas fuertes y débiles, los más
  constantes. Exportable en PDF.
- **Privacidad:** los puntajes con nombre los ve solo el líder y solo de quienes lo aceptaron (menores de 16, con permiso de los padres);
  en pantalla se usan apodos.

## 6. Modo campamento

Varios días, equipos con nombre y color, puntajes acumulados, cronograma en el calendario, desafíos diarios, búsqueda del tesoro con QR,
tabla en pantalla y cierre con premiación.

## 7. Límites por plan

| | Gratis | Senda Líder |
|---|---|---|
| Jugadores por sala | 20 | 200 |
| Bloques por reunión | 3 | Sin límite |
| Juegos | Quiz en vivo y Oveja Perdida | Todos |
| Preguntas y palabras propias | Hasta 10 por reunión | Sin límite, guardadas |
| Registro de reuniones | Última reunión | Historial completo |
| Reporte mensual | — | ✓ |
| Campeonatos, liga del grupo y campamento | — | ✓ |
| Calendario del grupo con turnos y asistencia | Básico | Completo |

## 8. Senda Púlpito: el Desafío del domingo (plan Iglesia)

**La idea:** que el mensaje del domingo siga vivo durante la semana, jugando.

1. **El pastor arma su desafío** desde su cuenta: escribe de 5 a 15 preguntas sobre su mensaje (con plantillas que lo hacen en 10
   minutos), o las elige del banco de Senda filtrando por el pasaje que predicó, o mezcla. También puede elegir el **versículo de la
   semana** y un **plan de lectura** con los pasajes del mensaje.
2. **Lo comparte:** un QR en la pantalla del culto, un enlace para el grupo de WhatsApp de la iglesia y un aviso para los miembros en
   Senda.
3. **Los miembros juegan** durante la semana: aparece en su Inicio y en el calendario («Desafío del domingo: hasta el sábado»). Hay
   ranking interno de la iglesia (amistoso; nunca contra otras iglesias).
4. **El pastor ve** participación y resultados agregados: cuántos jugaron, qué entendió la mayoría, qué no.
5. **Variantes:** una noche de Espadeo en vivo en la iglesia (con el motor de Senda Reunión), un Dibujalo con palabras del mensaje, una
   ruleta especial con una categoría «Del domingo» por una semana.
6. **Privacidad:** el material es de la iglesia; no se muestra afuera.

**Sin IA que arme el material:** el pastor escribe o elige. Si en el futuro los pastores pidieran ayuda para redactar preguntas, se
evaluaría como opción explícita y revisada, nunca automática.

## 9. Herramientas de la iglesia (plan Iglesia)

- Senda Púlpito (Desafío del domingo, versículo y plan de la semana).
- **Calendario de la iglesia** con varios calendarios (jóvenes, alabanza, niños), turnos y asistencia (capítulo {{cap:13}}).
- **Encuestas a la congregación** (Pulso, capítulo {{cap:14}}).
- Cinco cuentas Líder incluidas; reporte mensual de la iglesia.
- Dos eventos destacados por mes en la agenda de la ciudad.

## 10. Oremos (muro de oración del grupo)

- Pedidos **privados del grupo** (nunca públicos), con opción anónima.
- Botón **«Estoy orando por vos»** (le llega un aviso a quien pidió) y suma Pasos.
- Vencen a los 30 días o cuando se marcan como respondidos («¡Dios respondió!»).
- Moderación del líder y filtro automático; si aparece una señal de riesgo, se muestra ayuda profesional y se avisa al líder según el
  protocolo (capítulo {{cap:26}}).

## 11. Cómo se mide

Reuniones creadas por semana, jugadores por reunión, bloques más usados, plantillas compartidas, reuniones con desafío semanal,
líderes que vuelven cada semana, desafíos del domingo creados y jugados, e instalaciones que llegan desde una sala.
