# Capítulo 75 · Prueba 49: seguridad y legal para el lanzamiento, cuentas sin correo, avatar, torneos para todos, «Historias bíblicas» y el manual de la app

Fecha: 07-11-2026. Pedido del fundador (resumen; el texto entero está en la conversación de la prueba 49):

> Créditos: «USD 8,97», sin recarga automática. «Revisá bien y dejá todo OK seteado para el inicio de la app»: ciberseguridad,
> suscripciones, anuncios; «¿se puede crear un usuario sin asociar un correo?»; «¿el alias es único e irrepetible?». Diseñar el
> avatar en lugar de la letra. Algo mejor para gastar los talentos. «Evaluá TODO lo legal». Un instructivo en HTML «como si no
> supiera NADA de Senda» (torneos «tipo yo creo uno como masterusuario, le asigno día y hora, y cómo lanzo la invitación para todo el
> mundo», sala en vivo, trivia de la iglesia, grupos, planes). Cada travesía ambientada (Éxodo con las diez plagas, las tiendas en el
> desierto) y una travesía nueva, «Historias bíblicas», donde el paisaje cambia al bajar, «extremando la optimización y la UX». Voz
> masculina y lo más parecida a México. «Tu calendario» y «Calendario comunitario» en Inicio. Las pestañas tardan al cambiar.
> «Si tardás 50 años no pasa nada… hacelo de la mejor calidad posible… vé línea por línea».

## 0. Respuesta corta

| Pedido | Qué se hizo | § |
|---|---|---|
| Créditos | HECHO: quedan USD 8,97. No se mandan más lotes; lo que queda queda para la trivia del sermón | §1 |
| Ciberseguridad | 14 ataques reproducidos contra una base igual a la real y cerrados; la prueba de la base los repite (208 pasos) | §2 |
| ¿Usuario sin correo? ¿Alias único? | Sí y sí: cuenta anónima sin correo ni contraseña; alias único en todo Senda | §3 |
| Suscripciones | El servidor ya valida bien los recibos; el cobro dentro de la app espera la cuenta de Play, la decisión de planes y el monotributo | §4 |
| Anuncios | AdMob real dentro de la app, con los ID de prueba de Google hasta que exista tu cuenta | §5 |
| Legal | Revisión completa (documento propio); hechos borrar cuenta, normas, denuncias, privacidad y términos 1.0, páginas públicas, frenos por edad | §6 |
| Avatar | Diseñable (DiceBear, estilo Open Peeps, CC0): ocho partes o «Al azar» | §7 |
| Talentos | Una lámpara más en la lección (10 Talentos); la tabla de usos posibles, con veredicto | §8 |
| Voz | De hombre y lo más parecida al español de México | §9 |
| Calendarios en Inicio | «Tu calendario» y «Calendario comunitario» | §10 |
| Pestañas lentas | Volver a una pestaña: de 1,2–2,6 s a 0,1–0,3 s (con el procesador frenado 4 veces) | §11 |
| Torneo para todos | Desde Ajustes → Senda para todos, con día, hora y duración; cualquiera se anota y le llega un aviso al empezar | §12 |
| Travesías ambientadas | 13 escenas nuevas, una por zona; al bajar, el fondo se funde en la siguiente | §13 |
| «Historias bíblicas» | Ruta nueva (22 historias en el plan); abierta Moisés y el éxodo: 5 zonas, 13 lecciones | §14 |
| Instructivo | Publicado: «Manual de Senda» | §15 |
| Revisar línea por línea | Apareció un error que bloqueaba unirse a grupos nuevos (código de 8 letras): arreglado | §16 |

## 1. Créditos de Anthropic

**HECHO (captura del fundador, 06-11-2026):** créditos de la organización USD 8,97; gasto del mes USD 24,28 con un límite de USD 200;
sin recarga automática. Lo gastado (~USD 191) coincide con la ESTIMACIÓN del capítulo 74 §5 (~196, calculada a precio de lista con la
caché): la estimación estaba un poco alta. **Decisión (DEC-2026-11-07-1):** no se mandan más lotes; los USD 8,97 quedan para la trivia
del sermón (cada PDF cuesta centavos). Los 294 campos corregidos por idioma se retraducen en una sesión de Claude Code (plan Pro), campo
por campo. «Historias bíblicas» queda en español hasta traducirla entera (una ruta se publica en un idioma solo completa).

## 2. Ciberseguridad

Una revisión independiente (agente aparte) atacó la app y la base como lo haría alguien malintencionado, contra una base igual a la de
Supabase (`pruebas/nube`). **HECHO:** 14 ataques reproducidos, todos cerrados, y la prueba de la base los repite y exige que fallen
(`docs/SEGURIDAD.md` de la app):

- **Críticos:** un evento de grupo ya no se puede convertir en evento de Senda para todos; la trivia del sermón se reserva en la base
  antes de llamar a Claude, con un libro de cobradas que nadie borra (antes se podía gastar la API sin techo).
- **Altos:** un recibo de Google Play vale para una sola cuenta, con producto exacto, vigente y reconocido; nadie se inventa amistades
  ni levanta un bloqueo ajeno; sin padrón público de usuarios; duelos, copas y salas con reglas de la base.
- **Medios y bajos:** funciones internas cerradas; salas y torneos sin edición directa; códigos de grupo de 8 letras con tope de
  intentos; topes de tamaño; estadísticas sin lo que se lee ni texto libre.

La prueba de la base pasó de 103 pasos (prueba 39) a **208 de 208** (borrar cuenta, moderación, interruptores, torneos para todos,
avatar).

## 3. Cuentas: sin correo, alias único

- **¿Se puede crear un usuario sin correo? Sí, y es como funciona hoy.** La primera vez que alguien usa algo con otras personas, Senda
  muestra las normas de la comunidad; al tocar «Acepto» se crea una **cuenta anónima** (Supabase), sin correo ni contraseña, ligada al
  teléfono. Leer y jugar solo no piden cuenta.
- **¿El alias es único? Sí.** Nadie puede tener el mismo, ni uno que imite a Senda o a otra persona (regla de la base).
- **Lo que falta: recuperar la cuenta en otro teléfono.** Hoy, si se cambia de teléfono, la cuenta anónima no se recupera.
  **Recomendación (DEC-2026-11-07-4, espera tu OK):** un botón opcional «Guardar mi cuenta con Google» en Ajustes, que vincula la cuenta
  anónima a una cuenta de Google (Supabase lo trae: `linkIdentity`); quien no quiera, sigue anónimo. No cuesta plata; pide crear un
  cliente de OAuth en Google Cloud (10 minutos, con tu cuenta). La alternativa sin Google (un código para pasar la cuenta) exige un
  sistema de sesiones propio en la base: más riesgo de seguridad por el mismo resultado.
- **Borrar la cuenta** (lo exige Google Play): Ajustes → «Borrar mi cuenta». Se quitan de la nube el alias, los amigos, los duelos y
  las marcas; si la persona lideraba un grupo sola, pasa al miembro más antiguo (primero un ayudante). Lo leído queda en el teléfono.

## 4. Suscripciones

**Hecho:** el servidor (`supabase/functions/compras`) valida cada recibo con Google (producto exacto, vigente, reconocido, una sola
cuenta), y la pantalla de Planes muestra los tres con sus tildes. **Falta para cobrar:** la cuenta de Google Play (pendiente del
15-11), la decisión de planes y precios (DEC-2026-10-24-4) y el monotributo antes del primer cobro (DEC-2026-10-25-2). Antes del primer
cobro también: los botones de arrepentimiento y de baja de la Disp. 954/2025, y la información completa antes de suscribirse
(chequeo legal §B). Nada de esto se cobra en la prueba: el plan se elige a mano para ver qué cambia.

## 5. Anuncios

**Hecho:** AdMob real con `react-native-google-mobile-ads` 17.4.0 (compatible con RN 0.86), con los **ID de prueba de Google** hasta
que exista tu cuenta (el armado del APK pone los reales cuando cargues tres variables en GitHub). Reglas: nunca a menores de 13; nunca
personalizados; contenido para todo público (G); el anuncio se precarga y, si no hay, la persona sigue sin esperar; el video con premio
solo da premio si se mira; se apagan a distancia con el interruptor `anuncios`. Los pasos para crear la cuenta y qué bloquear (apuestas,
citas, alcohol) están en `docs/ANUNCIOS.md` de la app.

## 6. Legal

La revisión completa está en `conocimiento/2026-11-07-senda-chequeo-legal.md` (agente `analista-regulatorio`, con fuentes; no es
asesoramiento legal). **Hecho en la app:** borrar la cuenta (app y página web), normas de la comunidad antes de la cuenta, filtro de
palabras en la base, denunciar y bloquear (perfil, grupo, pregunta de la IA) con cola para el administrador, la trivia del sermón solo
la arma un mayor de 18 y dice que la escribió una IA y la revisó el líder, el PDF se borra al archivar la trivia, menores de 13 sin
cuenta ni nada social, política de privacidad y términos 1.0 (`contenido/legal.json`), páginas públicas (`web/`: privacidad, términos,
borrar cuenta y `app-ads.txt`), las licencias de la PDT y la BES corregidas y tres interruptores remotos (direcciones, anuncios, IA).

**Lo que hace el fundador** (pasos en el mensaje final y en `estado.yaml`): poner tu nombre y domicilio en `contenido/legal.json` y
publicar el sitio; excluir en Play Console EE. UU., Brasil y la UE al principio (**recomendación**, DEC-2026-11-07-5: así no aplican
COPPA, el ECA Digital de Brasil ni el RGPD con su CMP certificado); inscribir la base en la AAIP; una hora de abogado con la lista; la
autorización firmada del ministerio; las marcas en el INPI; el contador antes del primer cobro.

## 7. Avatar

**Herramienta (regla 10):** DiceBear 9.4.2 con el estilo **Open Peeps** (diseño de Pablo Stanley, **CC0 1.0**; código MIT), elegido
frente a Lorelei y Notionists por color, tonos de piel y peinados diversos (con hiyab y turbante). Curado para Senda: solo caras amables,
sin parche ni barbijo. Ocho partes (peinado, cara, piel, pelo, ropa, lentes, barba, fondo) con las opciones dibujadas sobre tu avatar, y
«Al azar». Se guarda un objeto chico validado en la base y en la app; lo ven amigos, grupo y quien abre tu perfil. DiceBear se carga
recién al dibujar el primer avatar (no pesa en el arranque). Regla de corte: si una combinación no se dibuja, se ve la inicial.

## 8. Talentos

Hoy se gastan en sobres del álbum (40) y en el protector de racha (50); con 60 a 90 por día (ESTIMACIÓN), a mitad de año sobran.
**Hecho:** una lámpara más en la lección por 10 Talentos (lleva al pasaje, nunca regala la respuesta; la lección perfecta sigue pidiendo
cero lámparas). **Próximos, en orden:** regalar un sobre a un amigo y marcos para el avatar. **Nunca:** vender Talentos, vidas con
Talentos, nada al azar pagado. Tabla completa en `docs/ECONOMIA.md` §4 de la app.

## 9. Voz que lee

De fábrica, la voz de hombre que más se parece al español de México entre las que tiene el teléfono (es-MX primero; después
latinoamericanas); se cambia en Ajustes. A quien ya tenía una voz elegida se le vuelve a elegir una vez con la regla nueva.

## 10. «Tu calendario» y «Calendario comunitario»

En Inicio, una tarjeta con dos solapas: **Tu calendario** (tus eventos y los torneos en los que juegas) y **Comunitario** (eventos de
Senda para todos, los de tus grupos con «lo creaste» si es tuyo, y la misión de cada lunes). La semana con un punto por día, lo próximo
debajo y el mes a un toque. Cada cosa lleva a su lugar.

## 11. Pestañas rápidas

**HECHO (medido en la vista previa con el procesador frenado 4 veces):** volver a una pestaña pasó de 1,2–2,6 s de trabajo a 0,1–0,3 s
(las pestañas que no se ven se congelan); la primera vez en Travesía, Jugar o Comunidad, la tarea más larga pasó de 450–670 ms a unos
60 ms (la Travesía dibuja solo lo cercano; Inicio prepara las otras pestañas en segundo plano). La velocidad en el teléfono se confirma
con el APK 49.

## 12. Torneos para todos

**Cómo lo lanza el administrador:** Ajustes → «Senda para todos» (solo aparece en una cuenta marcada como administrador) → «Torneo para
todos»: nombre, juego, día, hora y duración (1 h, 3 h, 1, 3 o 7 días; la base acepta hasta 14) → «Lanzar para todos». Aparece en el
Calendario comunitario de todos y en Jugar → Torneos con «Anotarme». **Decisión (DEC-2026-11-07-3):** no se manda aviso al teléfono de
todo el mundo (molesta y no escala); a quien se anota le llega un aviso a la hora en que empieza (`avisos.enviar_desde`; se borra si se
desanota y no se duplica). Para difundirlo fuera de la app: las redes y los grupos de la iglesia.

## 13. Travesías ambientadas

13 escenas nuevas dibujadas con código, en el estilo de las de antes: el huerto, el arca con el arco en las nubes, las estrellas de
Abraham, Egipto, las plagas (el Nilo en sangre, el granizo con fuego, las langostas, las ranas), el mar abierto con la columna de fuego,
el desierto con la nube, las tiendas y el maná, Jericó, el templo, Babilonia con los sauces, Galilea, Pentecostés y la ciudad nueva. Cada
zona (capítulo) de El gran relato, De Adán a Noé, Los patriarcas, los históricos, Mujeres y Quién fue quién tiene la suya. **Al bajar,
la escena nueva aparece sobre la anterior en medio segundo**; nunca hay más de dos dibujadas, la que se va no se vuelve a dibujar y cada
escena se arma una sola vez (con «reducir movimiento», el cambio es directo). Comprobado en la vista previa recorriendo El gran relato
entero.

## 14. «Historias bíblicas»

**Dónde va (DEC-2026-11-07-2):** en «La Biblia, libro por libro», después de «El gran relato». El gran relato cuenta la historia entera
en nueve capítulos; esta ruta se detiene en cada gran historia, escena por escena, y la trama manda (Personajes mira la vida de una
persona). **El plan:** 22 historias en el orden de la Biblia, de Noé y el arca a Pablo y el naufragio; cada zona tiene su paisaje,
también las que se preparan.

**Abierta: Moisés y el éxodo**, en cinco zonas y 13 lecciones: del Nilo a la zarza (Éxodo 1–4, con la ficha de Moisés), las diez plagas
(Éxodo 5–12, hasta la Pascua), el mar abierto (Éxodo 13–15), el desierto (Éxodo 15–17) y el Sinaí (Éxodo 19–20 y 32–34). Cada lección
dice qué pasó antes, qué pasa, cuándo y qué sigue; las preguntas siguen el orden del texto y cierran con la conexión del Nuevo Testamento
(Hebreos 11, 1 Corintios 5 y 10, Juan 1 y 6, Mateo 22). Todo verificado contra la RV1909 de Senda: el validador y la revisión «empezar
por el principio» pasan **sin errores ni avisos** (cada «» textual; los huecos se leen igual en la RVR1960; «salud» explicado como
salvación; «mar Bermejo» como el mar Rojo; la fecha del Éxodo, siglo XV o XIII a. C., «se discute»). Script: `scripts/autor/historias.py`.
La Travesía tiene ahora 471 lecciones.

## 15. El manual de la app

«Manual de Senda»: https://claude.ai/artifact/GjxDRXYvybeKP8YpHjs3ag (copia en `oportunidades/proyectos/senda/manual-senda.html`).
Explica cada pestaña, la Travesía, los juegos, Talentos y nivel, la cuenta, los grupos (no hacen falta para usar Senda), la trivia de la
iglesia paso a paso, la sala en vivo, los tres tipos de torneo (con el del administrador paso a paso), los planes en una tabla y las
preguntas frecuentes. Cada dato se verificó en el código de la app antes de escribirlo.

## 16. Lo que apareció al revisar

- **Unirse a un grupo nuevo era imposible escribiendo el código:** desde la revisión de seguridad los grupos nuevos tienen código de 8
  letras, pero la casilla cortaba en 6 y el texto decía «Son 6 letras». Arreglado: acepta hasta 8 (los viejos siguen con 6), el texto
  lo dice en tres idiomas y el código se achica para entrar entero con letra grande.
- Auditoría de textos: 84 casos (letra normal y grande, tres idiomas): **0 problemas**. Prueba de arranque 8 de 8. Validador del
  contenido sin errores.

## 17. Qué probar en el APK 49

1. Comunidad: crear la cuenta (normas → Acepto → alias), diseñar el avatar, crear un grupo y entrar a él desde otro teléfono con el
   código de 8 letras.
2. Inicio: «Tu calendario» y «Comunitario».
3. Travesía → La Biblia, libro por libro → «Historias bíblicas»: bajar y ver cómo cambia el paisaje; hacer «Un niño en el río».
4. Travesía → El gran relato: bajar desde «Los comienzos» hasta «La esperanza».
5. Cambiar de pestaña varias veces: tiene que ser instantáneo.
6. Escuchar un capítulo: la voz tiene que ser de hombre.
7. Ajustes → Senda para todos → lanzar un torneo de prueba para dentro de una hora, anotarte y esperar el aviso.

## 18. Próximos

- Leer lo que el fundador diga del APK 49; lo social se prueba con la base viva cuando estén activadas las cuentas anónimas.
- «Historias bíblicas»: la siguiente historia (Jericó, después Gedeón y David y Goliat), con el mismo cuidado; traducirla entera.
- Retraducir los 294 campos corregidos por idioma, en una sesión.
- Si das el OK: «Guardar mi cuenta con Google» (DEC-2026-11-07-4).
- Regalar un sobre a un amigo y marcos para el avatar (Talentos).
- La ropa de Lany según la zona de la ruta (en «Historias bíblicas», ropa hebrea en el éxodo).
- Antes del primer cobro: los botones de la Disp. 954/2025 y la información previa a suscribirse.

## 19. Después del cierre (07-11): los roles del grupo y el manual con capturas (prueba 50)

**El pedido.** «Que yo pueda crear el grupo y pasar el "rol de administrador" a otro, y que el administrador también se pueda poner un
rol en el grupo»; «lo de líder, ayudante y miembro… el que se una, por defecto aparezca como miembro, y después se le asigna lo de
ayudante, líder u otro rol»; y en el manual, «captura de TODO… en cada uno de los puntos del instructivo».

**Cómo quedó.**

- Quien crea el grupo es **líder**; quien entra (con el código o aceptando la invitación) queda como **miembro**; después el líder
  toca a alguien y elige: escribir su rol («Sonido»), **Hacer ayudante**, **También líder** (quedan dos líderes) o **Pasarle el
  liderazgo**. Esto último pide confirmación: el otro queda líder (le llega el aviso «Ahora eres líder») y quien lo pasó, ayudante.
- El líder toca **su propio nombre** para escribir su rol. El texto de la lista lo explica en tres idiomas.
- En la base: `pasar_liderazgo(grupo, usuario)` (migración `20261130000004`), solo para el líder, con el tope de 5 grupos como líder;
  la prueba de la base suma 6 pasos (214 de 214) y la migración ya se aplicó en Supabase (07-11, flujo «Base de datos» en verde).
- Se corrigió un detalle visto al capturar: la casilla del rol tapaba «Guardar».
- El **Manual de Senda** tiene ahora **45 capturas** de la vista previa (con datos de ejemplo), cada una con su epígrafe numerado y
  comparado con la imagen: Inicio, Biblia, Travesía, los juegos, Comunidad, y en Grupos el recorrido entero (crear, el código,
  invitar, unirse, la lista de miembros, dar un rol, pasar el liderazgo, escribir el propio rol). Se tocan para verlas grandes.
  Copia en `oportunidades/proyectos/senda/manual-senda.html` con la carpeta `capturas/`.
- Auditoría de textos: 84 casos sin problemas; prueba de arranque 8 de 8.

**Qué probar en el APK 50** (trae todo lo del 49): crear un grupo, entrar desde otro teléfono (queda como miembro), escribirle un rol,
pasarle el liderazgo y ver el aviso; tocar tu nombre y escribir tu rol.

