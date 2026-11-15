# Capítulo 73 · Prueba 47: el marco de UX, Inicio y Jugar rehechos, «Antes o después» como juego y el perfil público

Fecha: 06-11-2026. Pedido del fundador, antes de descargar el APK para probar:

> «**Juegos:** ver si sumar sopa de palabras o algo similar · ver si sumar lo que es tipo pasapalabras (que no sea plagio) · el de
> antes/después: cuando aprieto uno aparece como rebotando el antes, después y lo de la referencia de tiempo, quedó muy fea la animación
> […] parece que hay mucha info en esa pantalla, no se llega a apreciar bien. NO parece un juego, parece un artefacto hecho con IA en
> 30 segundos. Hay que escapar de eso · en el de escribir el personaje de la Biblia no me tomó ningún nombre y me dio 0 puntos en la
> partida contra Lany · revisar si la pantalla de juegos está bien así, si no es mucha info, si es LA MEJOR FORMA […] ver si no es
> mejor en cuadraditos. **Inicio:** ¿está bien lo que muestra? Ver enlaces más directos. Que el usuario no se sienta exhausto al ver la
> pantalla. Y que le aparezcan a la mano las mejores funcionalidades. Estudiá A FONDO LA UX […] Si hace falta reforzar el marco teórico
> del proyecto, hagámoslo. **Otros:** que las personas puedan ver mi perfil, vean cuánto completo tengo el álbum, etc. […] Optimizá todo
> lo que se pueda dentro de la app. Y fijate que la Biblia para pasar de hoja está lentísimo. Tiene que andar o bien o nada. Avanzá con
> esto y los próximos pendientes.»

A mitad de la sesión: «Fijate lo de estos juegos que te mencioné, capaz ya estaban en backlog, y la idea no es sacarlos ahora en el
MVP. Tranqui, solo para tenerlo presente.» Y reenvió la respuesta de las Sociedades Bíblicas Unidas sobre licencias (§8).

## 0. Respuesta corta

| Pedido | Qué se hizo | § |
|---|---|---|
| Marco teórico de UX | `docs/MARCO_UX.md` en la app: 27 reglas con su fuente (atención, decisión, Fitts, Gestalt, heurísticas, revelación progresiva, tiempos de respuesta, motivación sin manipular, estética, juegos, accesibilidad) y una lista de 10 preguntas para revisar cada pantalla | §1 |
| Inicio: menos cansador, enlaces directos | «Tu día» con las tres cosas de hoy como filas que dicen qué hay detrás; una sola acción grande; «Para hoy» en 2 × 2. **2,2 → 1,5 pantallas** (con vida social, **3,5 → 1,9**) | §2 |
| Jugar: ¿cuadraditos? | Sí: el Espadeo arriba compacto y los juegos en cuadrícula. **2,9 → 1,4 pantallas** | §3 |
| «Antes o después» | Rehecho: la carta en la mano, la senda con puntos para tocar, sin rebotes, sin la época que regalaba la respuesta, «Así va la historia» al final | §4 |
| Nombres por letra, 0 puntos | Causa probable y arreglo en cuatro capas; probado: 10 nombres = 1.000 puntos sin tocar «Enviar» | §5 |
| La Biblia, lentísima al pasar de hoja | Regla de corte aplicada: sale la curva de Skia (sacaba dos fotos de la hoja por vuelta); los toques en el hilo nativo | §6 |
| Perfil visible para otros | Pantalla Perfil con el álbum, las armaduras, los duelos ganados y las copas; nada de lo que se lee; se puede ocultar | §7 |
| Sopa de letras y tipo pasapalabra | No van al MVP. El tipo pasapalabra ya estaba en el backlog como **Abecé** (con su análisis legal); la sopa se suma como **Sopa del versículo** (2027) | §9 |
| Licencias de las Sociedades Bíblicas Unidas | Recomendación: no pagar USD 500 por esas cuatro; pedir la RVR1960 (que también es de ellos). Respuesta lista para enviar | §8 |
| Pendientes | Ideas 1 a 4 de la auditoría externa hechas; la 5 (invitar con enlace) espera el sitio web | §10 |

## 1. El marco de UX

Se escribió como lo haría un equipo de diseño con oficio: cada regla dice de qué teoría sale y cómo se aplica en Senda, para que las
decisiones no dependan del gusto. Lo esencial:

- **Atención** (Cowan 2001; Sweller 1988): una pantalla, un trabajo; como mucho 4 grupos en la primera vista; nada dicho dos veces.
- **Decisión** (Hick 1952; Iyengar y Lepper 2000, con el matiz de Scheibehenne 2010; Johnson y Goldstein 2003): una acción primaria y
  la app propone el siguiente paso, sin tapar las otras puertas.
- **El dedo** (Fitts 1954; Hoober 2013): lo primario ancho, abajo o al medio, al menos 52 dp.
- **El ojo** (Gestalt; von Restorff 1933): un solo bloque de color lleno por vista; el color siempre significa lo mismo.
- **Reconocer** (Nielsen 1994): los rótulos dicen qué hay detrás («Leer Juan 3», no «Leer»).
- **Mostrar de a poco** (Nielsen 2006): lo de hoy a la vista, lo de la semana en una línea, lo del mes en su pantalla.
- **Responder ya** (Doherty y Thadani 1982; Nielsen 1993): todo toque responde en el mismo cuadro; lo que no anda fluido se saca.
- **Motivar sin manipular** (Deci y Ryan; Fogg 2009; Kivetz 2006; Kahneman 1993; Weiser y Brown 1995): progreso visible, lo de hoy en
  10 minutos, pico y final amable, nada de culpa ni urgencia falsa.
- **Estética** (Kurosu y Kashimura 1995; Tractinsky 2000): el pulido cambia cómo se percibe la app. Se describen las señales de lo
  «hecho con IA en 30 segundos» (todo en tarjetas iguales, arcoíris, todo rebota, rótulos que explican la mecánica, pantallas de juego
  con todo a la vez) y qué poner en su lugar.
- **Juegos** (Csikszentmihalyi 1990; Koster 2004; Swink 2009): la pantalla de juego muestra solo lo necesario para la próxima decisión.
- **Accesibilidad** (WCAG 2.2): 360 px y letra grande antes de cada APK.

Metas medibles con gente real (PostHog): tiempo hasta el primer toque útil, % que cumple las tres de hoy, % de sesiones de Jugar que
abren otro juego además del Espadeo. Son **hipótesis** hasta tener datos.

## 2. Inicio

**Medido en la vista previa (360 × 740):** 2,2 pantallas y 11 bloques (3,5 pantallas y 14 bloques con duelos, amigos y grupos); 7
bloques de color lleno; dos accesos repetidos («Leer» y «Empezar a leer», «Lección» y «Seguir tu senda»); el desafío del día y la
encuesta ocupaban unos 600 px abiertos; los atajos de abajo repetían las pestañas y «Pulso» no decía qué era.

**Ahora:**
1. **Tu día**: el saludo con el color de la hora y Lany; debajo, tres filas: la lección (con su ruta y título), leer (el día de tu plan,
   o donde quedaste, o Juan 1) y escuchar el versículo. La primera que falta es la única acción grande; al cumplir las tres, la
   invitación es una partida de Espadeo.
2. **Te esperan** (solo si hay algo): el primero grande y uno más; «Ver todo (N)».
3. La semana y el evento de hoy, como estaban.
4. El versículo del día: el sobre sigue, a la mitad de alto y en vidrio ámbar.
5. **Para hoy**: cuatro piezas en 2 × 2, elegidas por lo pendiente (copa del día, temporada, desafío, misión de la semana, encuesta,
   tu pregunta de la bienvenida, jugar con alguien, álbum; si sobra lugar, Espadeo y Buscar). El desafío, la encuesta y el juego con
   alguien se abren en una hoja que sube. La copa conserva su campana.
6. Sale lo repetido. Queda el cierre «Eso es todo por hoy».

## 3. Jugar

**Medido:** 2,9 pantallas, 10 tarjetas grandes de color lleno con 2 o 3 renglones cada una; el título decía «Espadeo».

**Formato elegido (análisis en `docs/MARCO_UX.md` §5):** cuadrícula de dos columnas con un renglón, porque se reconoce por color y
dibujo, entra todo en una pantalla y es el patrón de toda tienda de juegos; la lista larga cansa y el carrusel esconde.

**Ahora:** la pestaña se llama Jugar; el Espadeo compacto (Lany, la armadura con su avance, «Practicar con Lany» grande y dos chips:
«Duelo al azar» y «Con amigos»); la misión de la semana en una franja; los cuatro juegos en cuadros con su dibujo (¿Quién es?, Antes o
después, Nombres por letra, En la frente); y lo del grupo en tres cuadros chicos (Trivia de la iglesia, Torneos, Sala en vivo).

## 4. «Antes o después»

Lo que fallaba: la carta por ubicar mostraba la época («Los comienzos»), que regalaba la respuesta; cada hecho de la línea repetía época
y cita; los huecos «+ Antes / + Después» entre cada hecho; todo entraba con rebote; el resultado repetía el título.

**Ahora:** la carta está en la mano, abajo, solo con el hecho; la línea es una senda con luz entre «Génesis» y «Apocalipsis»; entre los
hechos hay un punto para tocar; nada rebota (fundidos de 200 ms, la línea se acomoda en 220 ms; con «reducir movimiento», nada se
mueve). Si acierta, brilla y sigue sola; si no, va a su lugar y abajo dice «Iba antes de …» con la explicación y la cita. Al terminar,
«Así va la historia» con los hechos en orden y sus citas (idea 2 de la auditoría externa).

## 5. «Nombres por letra» contra Lany: 0 puntos

En la vista previa los nombres valían; en el teléfono, no. Sin poder reproducirlo en Android, se endurecieron las causas plausibles
(regla de la prueba 31):
1. La comparación sin tildes dependía de `normalize("NFD")` y de un rango de marcas escrito con caracteres sueltos: ahora un mapa
   explícito de letras (`src/util/texto.ts`), también en búsquedas, glosario, citas, agenda, lecciones y ¿Quién es?.
2. El nombre se toma del texto del campo al enviar, no de un estado que pudo quedar atrás.
3. Un nombre completo que no es el comienzo de otro se acepta solo, sin tocar nada; lo escrito cuenta al pasar de letra o al terminar el
   tiempo.
4. El puntaje final lee de una referencia al día (antes podía quedar viejo).

Además: lo de Lany y «también valían» muestran un nombre por persona con la grafía de hoy (antes salía «Jesé» en la I y «Lisias» dos
veces). Probado en la vista previa: 10 nombres = 1.000 puntos, escribiendo sin tocar «Enviar».

## 6. La Biblia: pasar de hoja

Regla de corte de la prueba 41 («si en gama baja hay más del 10 % de cuadros lentos, vuelve el pliegue») aplicada: la curva de Skia
sacaba **dos fotos de la hoja entera por cada vuelta** en el hilo de la pantalla (aunque la curva no se viera) y ponía un lienzo encima
de todo. Salió (la dependencia también, unos 4–5 MB menos). Los toques en los bordes ahora se atienden en el hilo nativo: la hoja
arranca en el mismo cuadro del toque aunque JavaScript esté ocupado; la vuelta dura 270 ms con arranque rápido. En la vista previa: 0
cuadros lentos en tres vueltas seguidas. **A confirmar en el teléfono con el APK 47.**

De paso: Ajustes y la pantalla de fallo decían «prueba 36»; ahora el número lo escribe el armado del APK.

## 7. El perfil público

Qué se muestra: alias, nivel, país, desde cuándo está en Senda y una vitrina de **logros de juego**: el álbum del año (figuritas y
doradas, con su barra), las armaduras completas, los duelos ganados (los cuenta la base) y las copas jugadas. **Nada de lo que la persona
lee** (capítulos, notas, resaltados, racha de lectura). Se abre desde cada amigo, la búsqueda, los miembros de un grupo y «Ver mi
perfil» («Así te ven»). Desde el perfil: un duelo si son amigos; si no, pedir amistad. Cualquiera oculta sus logros («Mostrar mis
logros en mi perfil», en Amigos); quien bloqueó o fue bloqueado no ve el perfil del otro. Base: `20261125000000_perfil_publico.sql`
(vitrina chica que solo escribe cada uno, `ver_perfil`, `mostrar_vitrina`); `pruebas/nube` 145 de 145. La política de privacidad
(borrador 0.5) lo cuenta.

## 8. Licencias: la propuesta de las Sociedades Bíblicas Unidas (04-11-2026)

**HECHO (correo de Inés Galliani, Spanish IP Manager, 04-11-2026):** para RVR95, RVC, DHH y TLA, como el texto se usa también en juegos
y suscripción es uso comercial; a personas individuales se les da solo lectura en línea; si se aprueba, USD 500 por año por las cuatro,
licencia de 3 años renovable (≈ USD 1.500 en total). Preguntan si usamos una API.

**HECHO (aviso de derechos publicado en Bible Gateway, leído el 06-11-2026):** «Reina-Valera 1960 © Sociedades Bíblicas en América
Latina, 1960. Renovado © Sociedades Bíblicas Unidas, 1988». O sea: **la RVR1960 también es de ellos**, y el pedido del 14-10 no la
incluía.

**INFERENCIA:** USD 500 por cuatro versiones es barato por versión (la NTV sola por API.Bible cuesta ≈ USD 470 a 650 por año), pero
esas cuatro suman poco a lo que Senda ya da gratis: la RVR95 la usan pocas iglesias (ESTIMACIÓN, sin dato medido) y la DHH y la TLA
cubren lo mismo que la PDT y la NBV (lenguaje de hoy). La que cambia la app es la **RVR1960**: es la que lee la mayoría y con la que se
responden la trivia y la Travesía.

**Recomendación (DEC-2026-11-06-4, espera al fundador):** no aceptar el paquete como está; responder pidiendo la RVR1960 en lugar de
la RVR95, el precio de la RVR1960 sola y con la DHH, que cuente desde el lanzamiento y qué pide la lectura sin conexión. Pagar hasta
USD 500 por año **solo si entra la RVR1960**. Respuesta lista en `borradores/2026-11-sbu-respuesta.md` (la manda el fundador).

## 9. Sopa de letras y tipo pasapalabra (no van al MVP)

- **Tipo pasapalabra**: ya estaba en el backlog como **Abecé** (capítulos 4 y 10): «El Rosco» es un formato protegido y una marca
  (fallo del Tribunal Supremo de España), así que Abecé tiene otro nombre, otra rueda y otra mecánica. En el roadmap: mayo–junio de 2027.
- **Sopa de letras**: no estaba. La versión que edifica es la **Sopa del versículo**: las palabras clave de un versículo escondidas;
  cada una que se encuentra completa el versículo, que al final se lee y se escucha (familia de «De memoria»). El formato de sopa de
  letras es de dominio público. Sumada al roadmap (mayo–junio de 2027), después del MVP.

## 10. Pendientes que se hicieron

Ideas de la auditoría externa (capítulo 71 §4): 1) los juegos con su línea y la pestaña «Jugar» (§3); 2) lo aprendido antes del puntaje
(«Antes o después» y «Nombres por letra»); 3) torneo sin amigos ni grupo: «Ir a Amigos» y ahora «Crear un grupo» ahí mismo; 4) unirse
a un grupo con vista previa (nombre, tipo, quién lo lidera, cuántos son) antes de confirmar. La 5 (invitar con enlace) necesita el sitio
web público, que es del fundador.

## 11. Qué probar en el APK 47

1. Biblia en modo hojas: tocar los bordes rápido varias veces; tiene que responder al instante.
2. Jugar → Nombres por letra → contra Lany: escribir nombres; tienen que sumar aunque no se toque «Enviar».
3. Inicio y Jugar: ¿se entienden de un vistazo?
4. Antes o después: un nivel entero.
5. Comunidad → Amigos → tocar a un amigo (su perfil) y «Ver mi perfil».

## 12. Próximos

- Leer lo que el fundador diga del APK 47 (velocidad de la Biblia en su teléfono, Inicio, Jugar, Antes o después).
- Licencias: lo que decida con la respuesta a las Sociedades Bíblicas Unidas.
- Seguir con el roadmap del lanzamiento (diciembre); la Sopa del versículo y Abecé, en 2027.
