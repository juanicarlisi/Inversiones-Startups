# Capítulo 76 · Prueba 51: grupos de 10.000, guardar el progreso con Google, torneos con enlace, Comunidad sin duplicados, la Consola limpia

Fecha: 07-11-2026. Pedido del fundador (resumen; el texto entero está en la conversación):

> «¿Por qué el tope de mil personas por grupo? Ver si más.» Un desafío del sermón «aunque no exista grupo: la persona manda un link y
> todos los que ingresan participan, con una fecha tope». «Sumar lo de guardar progreso.» «Sacar Senda para Latam al menos
> inicialmente… Latam sin Brasil, y tener SÍ O SÍ seteado en el roadmap incorporar esos países.» El avatar: «¿por qué los personajes
> miran para otro lado? Tendrían que mirar al frente, como una foto de perfil… que queden muy buenos». Problemas de la Consola (USD
> NaN, filas vacías, la tarjeta «Fase» larguísima); «los pendientes que están OK eliminarlos, ordenar por prioridad, dejar solo los
> abiertos; lo breve, preguntámelo por acá». Las botoneras «siempre redondeadas y de muchos botones» delatan un diseño hecho por IA.
> Durante el trabajo: al cambiar de pestaña después de jugar «se trabó y suena como cuando recibís monedas»; Comunidad con cosas
> duplicadas («no quiero 20 mil botones que lleven a lo mismo de 50 lugares distintos»; la sala en vivo, en Jugar); en Torneos que
> aparezcan todos (los de Senda a los que me anoté con su día y hora, los de mi grupo, los que me uní por link); la sala con alias
> único, «SUMARME A UNA / CREAR UNA» bien claro, código y alias, y que un link una directo; en torneos «con quién» por link; la trivia
> con las mismas preguntas para todos o en eliminatoria 1 contra 1 «con las llaves». «Avanzá con esto y todos los próximos.»

## 1. La Consola limpia

- **Causa del «USD NaN» y de las filas vacías (HECHO, código):** la plantilla pasaba todo costo por `Number()` («AAIP gratis; abogado…»
  daba NaN) y ocho notas internas estaban escritas como texto suelto en `pendientes` (sin `id` ni `que`: filas vacías con «Gratis»).
  Ahora un costo en palabras se muestra tal cual, la lista solo acepta fichas y el armado de la Consola falla si vuelve a pasar.
- **Fase:** la tarjeta mostraba la historia de 40 pruebas. Ahora dice «MVP «Primera luz» · sprint 2 · prueba 51» (tope de 80 letras
  controlado por `scripts/consola.py`); la historia queda en `historia_fase` y en la línea de tiempo.
- **Pendientes:** de 48 quedaron los abiertos, por prioridad (APK de prueba, cuenta de Play, prender Google, testers y revisores,
  lo legal, AdMob, difusión). Los 36 cerrados pasaron a `pendientes_cerrados` con el porqué (nada se borra); las notas de trabajo, a
  `notas_internas`. Se leyeron las marcas del fundador en la Consola (cobros, entorno de líderes, color de Lany y autorización del
  ministerio, marcados como hechos). Los cuatro breves se preguntan en el chat (§10).

## 2. Grupos de hasta 10.000 personas (DEC-2026-11-07-8)

El tope de 1.000 no venía de la base sino de los **avisos**: salían 200 cada 5 minutos, uno por persona, así que un evento en un grupo
de 1.000 tardaba ~25 minutos en llegarle a todos (y en uno de 10.000, más de 4 horas); y de la **lista de miembros**, que se traía y
dibujaba entera. Ahora:
- los avisos iguales salen juntos, de a 100 teléfonos por pedido a Expo (su máximo por pedido), hasta 3.000 por minuto;
- la lista viene de a 100 («Ver más») y, si el grupo pasa de 100, con buscador por alias; el contador muestra el total;
- «Invitar amigos» pregunta a la base cuáles ya están (`ya_en_grupo`), sin traer la lista;
- siguen 30 grupos por persona y 5 como líder. La prueba de la base arma un grupo de 10.000 y comprueba que la 10.001 no entra.

## 3. «Suena como cuando recibís monedas» al cambiar de pestaña

**Causa raíz (HECHO, código):** hay un contador de Talentos en la barra de arriba de cada pestaña y, desde la prueba 49, las pestañas
quedan cargadas y congeladas al salir (`freezeOnBlur`). Al volver de un juego, cada pestaña se ponía al día contando con el sonido de
monedas (hasta seis por pestaña), que se sumaba al del cartel del premio; los disparos seguidos del motor de sonido trababan el
cambio. Ahora el contador de arriba cuenta en silencio y el premio suena una sola vez, donde se gana.

## 4. Guardar el progreso con Google (DEC-2026-11-07-7)

- **Vincular:** Ajustes → «Guardar mi progreso» → «Continuar con Google». La cuenta sigue siendo la misma (alias, amigos y grupos).
  Son los mismos pedidos que hace la librería oficial de Supabase (`@supabase/auth-js` 2.119.0, verificado en su código el 07-11):
  `GET /auth/v1/user/identities/authorize` con PKCE S256, `/auth/v1/authorize` para entrar y `POST /auth/v1/token?grant_type=pkce`;
  el navegador vuelve a `senda://auth`. El SHA-256 y el azar, con `expo-crypto` (módulo oficial de Expo).
- **La copia:** todo lo que la app guarda con claves «senda-…» menos la sesión, las colas de envío y lo que se baja de la nube; tabla
  `progreso_nube` (solo cuentas con Google, hasta 1,5 MB, se va con la cuenta). Se sube al pasar a segundo plano y cada 10 minutos si
  cambió.
- **Recuperar:** en la primera pantalla de la bienvenida, «¿Ya usabas Senda? Recupera tu progreso», y en Ajustes; antes de reemplazar
  muestra el nivel, los Talentos y la fecha de la copia. Menores de 13: no.
- **Privacidad 1.1:** la copia es lo único que sale del teléfono y la elige la persona; el correo de Google no se muestra a nadie.
- **Le toca al fundador** (pendiente `google_login` en la Consola): el cliente de Google (Google Auth Platform, tipo web, con la URI
  de Supabase) y en Supabase el proveedor Google, «Allow manual linking» y `senda://auth` en Redirect URLs. Sin eso, la app dice
  «todavía no está disponible».

## 5. Países: Latinoamérica sin Brasil al lanzar (DEC-2026-11-07-6)

El 18-12 en Argentina y el resto de Latinoamérica de habla hispana. Fuera al principio, con fecha fija en la hoja de ruta: **Brasil el
01-03-2027** (en portugués, antes de Pascua; antes, el ECA Digital y la LGPD para menores), **EE. UU. el 01-06-2027** (COPPA y las
leyes de edad de las tiendas) y **Europa, España primero, el 01-09-2027** (RGPD: dato religioso, representante en la UE, aviso de
consentimiento de AdMob). Son planes: cada país entra cuando está lo que pide su ley.

## 6. Comunidad sin duplicados

Antes: cuatro atajos (Agregar amigo, Mi código, Crear grupo, Unirme) y tres tarjetas (Amigos y duelos, Grupos, Sala en vivo) que
llevaban a lo mismo. Ahora: **dos tarjetas**, Amigos y Grupos; tocar el título abre la lista y abajo están sus dos acciones (Agregar
amigo / Mi código; Crear grupo / Unirme a un grupo). La sala en vivo salió de Comunidad y de Jugar: vive en Torneos. Inicio conserva
sus tres atajos sociales (pedido de la prueba 48).

## 7. Torneos: todo en un lugar, con enlace, y la sala clara

- **Arriba, grande:** «Sumarme a uno» (un solo campo: 8 letras es un torneo; 6, una sala en vivo; entras con tu alias) y «Crear uno».
- **La lista:** «Próximos» con su día y hora (los de Senda para todos a los que te anotaste, los de tus grupos, los que llegaron por
  enlace), «Abiertos» y «Terminados».
- **«Con un enlace»** en «¿Con quién?»: el torneo se abre a cualquiera que tenga el enlace `senda.pages.dev/u/?c=CÓDIGO` (WhatsApp
  solo vuelve tocables los enlaces https: la página abre Senda con `senda://unirme/CÓDIGO` y, si no está instalada, muestra el
  código). Es el **desafío del sermón sin grupo**: con preguntas propias o con la trivia de un sermón de un grupo que lideres; todos
  los que entran juegan hasta la fecha tope y tienen su tabla. Quien lo armó lo vuelve a compartir desde la lista. Hasta 2.000 por
  torneo; 20 códigos equivocados por hora como mucho.
- **La sala en vivo:** «Sumarme a una» (código y tu alias) y «Crear una», separadas y grandes. El alias es único dentro de cada sala.
- La página `/u/` se publica con el sitio (pendiente `legal49` del fundador); hasta entonces, el código se escribe a mano.

## 8. El avatar de frente

- **Por qué miraban de costado:** el estilo Open Peeps (CC0) dibuja a las personas de tres cuartos.
- **Se compararon diez estilos de DiceBear 9** con la misma persona en cada uno. El elegido es **Avataaars** (`@dicebear/avataaars`
  9.4.2, de Pablo Stanley): el único de frente con calidad de ilustración profesional y con hiyab, turbante, afro, rulos, rastas,
  barba y lentes. Personas (Draftbit, CC BY 4.0) también mira de frente pero es más pobre; Micah, Lorelei y Notionists son de tres
  cuartos; Adventurer y Big Ears, infantiles.
- **Licencia (HECHO, el LICENSE del paquete y dicebear.com/licenses, 07-11):** «Free for personal and commercial use», diseño de Pablo
  Stanley; el código de DiceBear es MIT. No es una licencia CC estándar sino un permiso escrito del autor: queda en `docs/LEGAL.md` para
  la consulta con el abogado de PI. **Regla de corte:** si el autor cambia los términos o una tienda lo objeta, se pasa a Personas.
- **Qué cambió:** el avatar grande en un círculo, como foto de perfil; 34 peinados, 10 caras amables, 8 tonos de piel, 8 prendas, 5
  lentes y 5 barbas (sin gestos de enojo ni remeras con dibujos); «Ropa» y «Color de tela» (con la cabeza cubierta). Un avatar viejo
  (v1) se convierte solo, conservando piel, pelo, ropa y fondo. La base acepta los dos (migración `20261130000007`).

## 9. Las botoneras

[se completa con el resultado del trabajo en paralelo]

## 10. Preguntas cortas al fundador (en el chat, no en la Consola)

1. **Sociedades Bíblicas Unidas:** ¿mandás la respuesta lista (no pagar el paquete de USD 500 por RVR95, RVC, DHH y TLA; pedir la
   RVR1960 y pagar solo si entra; DEC-2026-11-06-4)?
2. **Planes y precios:** ¿va la propuesta (Gratis con todo el contenido; Premium sin anuncios a USD 2,49 por mes; Max con salas en vivo
   y 8 trivias del sermón por mes a USD 5,99; DEC-2026-10-24-4)?
3. **Ministerio aliado:** lo marcaste como hecho en la Consola: ¿la autorización para usar su nombre («by Nueva Generación») y su
   estudio está por escrito?
4. **iPhone:** ¿lanzamos en iPhone en 2027 (ahorra USD 99 este año)?

## 11. La eliminatoria con llaves (diseñada, va en la próxima prueba)

Pedido: en Torneos → Trivia, además de «las mismas preguntas para todos», una **eliminatoria 1 contra 1** donde se ven las llaves.
Diseño:
- modo `llaves` en el torneo; la inscripción cierra al empezar y la base arma el cuadro con los anotados (al azar, con pases libres
  hasta la potencia de 2; hasta 32);
- cada ronda dura lo que elija quien lo arma (por ejemplo, un día); cada cruce juega las mismas preguntas (una semilla por cruce): pasa
  el que más suma (empate: el más rápido; si uno no juega, pasa el otro; si ninguno, el de mejor siembra);
- un trabajo programado cierra cada ronda y arma la siguiente; aviso a cada uno con su rival y «Jugar tu cruce»;
- la pantalla muestra el cuadro por rondas (columnas), tu camino resaltado y el campeón al final. En vivo (todos en la reunión) usa la
  misma lógica con rondas de minutos.
No se hizo a medias en esta prueba: son tablas, funciones, un trabajo programado y una pantalla nueva, con su prueba de la base.

## 12. Próximos

- La eliminatoria con llaves (§11).
- «Historias bíblicas»: la siguiente historia después de Jericó (Gedeón; después David y Goliat).
- Retraducir los 294 campos corregidos por idioma, en una sesión.
- Regalar un sobre a un amigo y marcos para el avatar (Talentos).
- La ropa de Lany según la zona de la ruta (en «Historias bíblicas», ropa hebrea en el éxodo).
- Antes del primer cobro: los botones de la Disp. 954/2025 y la información previa a suscribirse.
