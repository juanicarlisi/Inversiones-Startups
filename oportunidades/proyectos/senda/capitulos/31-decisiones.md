# Decisiones y los próximos 30 días

<div class="enpocas" markdown="1">
**En pocas palabras.** El 05-10-2026 tomaste las 16 decisiones. La principal: **no hay validación previa**; se empieza a
desarrollar ya y se valida con la app en uso. El desarrollo arrancó el mismo día (sprint 0, con una vista previa que se abre desde
el celular). Quedan pocas cosas abiertas y casi todas son gratis; lo que cuesta plata (Google Play, la licencia de la RVR1960, Claude
Max) tiene fecha y monto, y se aprueba antes.
</div>

## 1. Lo que decidiste (05-10-2026)

| # | Decisión | Lo que quedó |
|---|---|---|
| 1 | **Nombre de la app** | **Senda**. Verificaciones en curso (sección 3) |
| 2 | **Validación con jóvenes** | **No por ahora**: el proyecto es el punto de partida; se valida y ajusta con la app en uso |
| 3 | **Lani v2** | Aprobado el diseño de dirección |
| 4 | **Paleta** | **B (ámbar + índigo)**; se ajusta más adelante con datos |
| 5 | **Las 6 categorías y piezas de Espadeo** | Aprobadas |
| 6 | **Nombres de juegos** | Aprobados |
| 7 | **Presupuesto** | Aprobado el diseño del menú de calidad; se buscará un presupuesto más ajustado antes de gastar |
| 8 | **Claude Max** | **Desde diciembre** (noviembre no). Octubre y noviembre con Pro |
| 9 | **Biblias** | Arrancar con las libres; ver a fondo la RVR1960 sin licencia (resultado en el capítulo {{cap:07}}: no conviene) |
| 10 | **Planes y precios** | Aprobados por ahora |
| 11 | **Anuncio corto al terminar partidas** | **Uno al terminar cada partida** (precisado en la segunda tanda); se ajusta con datos |
| 12 | **Vidas** | **3 gratis, 1 por hora**; repasar **no** devuelve vidas por ahora |
| 13 | **Revisores doctrinales** | 2 personas de tu comunidad |
| 14 | **Línea editorial** | La del capítulo {{cap:23}}, por ahora |
| 15 | **Cuentas** | Personal ahora; tiendas en noviembre o diciembre |
| 16 | **Idioma de la interfaz** | Español neutro con «tú» |

Además, sumaste el **diseño emocional** como parte del proyecto: está en el capítulo {{cap:20}} y ya se aplica en la app.

**Segunda tanda (05-10-2026, después de probar la vista previa del sprint 0):**

| Tema | Lo que pediste | Lo que quedó |
|---|---|---|
| Repositorio de la app | Creado | El código vive en `juanicarlisi/senda-app`; se borró la copia temporal de este repositorio |
| Expo y la red | Que Claude haga todo lo posible | **No hace falta cuenta de Expo ni tocar la red:** el APK de prueba lo arma GitHub Actions (gratis) y queda en Releases |
| Anuncios | Uno al terminar cada partida | Aplicado (simulado en la prueba; nunca en la Biblia ni en las lecciones) |
| Temas | Elegir entre los diseños del proyecto | **5 temas** (las paletas A, B y C + Clásico claro y Medianoche) y 3 papeles para la Biblia (capítulo {{cap:19}}, sección 18) |
| Ajustes | Lo que suelen tener las apps | Pantalla de **Perfil y ajustes** desde el avatar: tema, letra, sonido, vibración, animaciones, idioma, privacidad, créditos… |
| Navegación | Benchmark: ¿íconos abajo o menú arriba? | **Recomendación: la barra de abajo** (evidencia en el capítulo {{cap:19}}, sección 17). A confirmar por vos |
| Animaciones y sonidos | Todo lo del proyecto, punto por punto | Sprint 1: 36 sonidos propios y los momentos de los capítulos 19 y 20; matriz de lo hecho y lo que falta en la app (`docs/DISENO_EMOCIONAL.md`) |
| Más versiones de la Biblia | Todas las libres protestantes | Se sumó la **Nueva Biblia Viva** (Biblica). Las demás libres se descartaron con su razón (capítulo {{cap:07}}); la RVG necesita permiso (borrador listo) |
| RVR1960 más barata | Si hay algo más barato que ~USD 39 | **No hay vía legal más barata.** Mientras tanto: enlace a la RVR1960 en Bible.com y pedido de precio de ministerio (borradores listos) |
| Lectura «como papel» | Marcador, hojas que se pasan con el dedo | **Lector de papel**: hojas que giran sobre el lomo, 3 cintas de raso, resaltadores, notas, canto dorado, voz |

## 2. Cómo seguimos: el desarrollo

| Qué | Cómo |
|---|---|
| **Dónde vive el código** | En su repositorio propio, `juanicarlisi/senda-app` (privado), separado del holding |
| **Cómo probás** | Cada sprint publica una **vista previa web** privada que abrís desde el celular, y un **APK de prueba para Android** que arma GitHub Actions y queda en la pestaña Releases del repositorio (sin cuenta de Expo, sin costo) |
| **Ritmo** | Un sprint cada dos semanas; vos probás 30 minutos y decidís qué sigue |
| **Gastos** | Nada hasta noviembre. Después, solo lo imprescindible y con tu aprobación: Google Play (USD 25, una vez), RVR1960 por API.Bible (~USD 39 por mes, opcional), Claude Max (desde diciembre) |

**Plan de sprints hasta el lanzamiento** (detalle en el repositorio de la app, `docs/SPRINTS.md`):

| Sprint | Fechas | Qué sale |
|---|---|---|
| 0 | 5–11 oct | Base de la app, sistema de diseño, Inicio, Biblia con 3 versiones libres, una lección, Espadeo de práctica, semana Senda. **Hecho** |
| 1 | 12–25 oct | **Adelantado al 5-oct (lo principal):** temas y Ajustes, lector de papel, búsqueda, notas, cintas, voz, Nueva Biblia Viva, racha con Día libre e hitos, bienvenida, «¡Volviste!», 36 sonidos, Pausa con Lani. **Falta:** planes de lectura, protector de racha, recordatorio real |
| 2 | 26 oct – 8 nov | Motor de la Travesía con las secciones 0 a 2, repaso, misiones y cofres, cuentas y sincronización (Supabase gratis) |
| 3 | 9–22 nov | Espadeo real: duelos por turnos con amigos y con Lani, 6 comodines, Armería, banco de preguntas grande; tarjetas para compartir |
| 4 | 23 nov – 6 dic | Calendario completo, Giro diario, Desafío del día, Tu Lani, pulido, accesibilidad; **prueba cerrada en Google Play** |
| Lanzamiento | 7–18 dic | Correcciones, fichas de tienda, publicación gradual el **18-12-2026** |

## 3. Lo que queda abierto

| # | Tema | Recomendación | Hasta cuándo |
|---|---|---|---|
| 1 | ~~Crear el repositorio de la app~~ | **Hecho** el 05-10-2026 | — |
| 2 | **Verificar el nombre** | Buscar «Senda» en el INPI (clases 9, 41 y 42), en las tiendas y en redes; ver dominios. Ojo con **Chile**: allí SENDA es el servicio estatal de prevención de drogas y alcohol (sección 4) | 15-10-2026 |
| 3 | ~~Cuenta de Expo y red del entorno~~ | **Ya no hace falta:** el APK se arma con GitHub Actions | — |
| 3b | **Navegación** | Confirmar la barra de abajo (recomendado) o pedir una variante con menú arriba para comparar | Con la próxima prueba |
| 3c | **Enlace a la RVR1960 en Bible.com** | Es la única salida de la app (el proyecto pedía que todo pase adentro). Recomendación: dejarlo hasta tener la licencia | Con la próxima prueba |
| 4 | **Cuenta de Google Play** (USD 25) | Abrirla **a más tardar el 15-11**: las cuentas personales nuevas necesitan 12 testers durante 14 días antes de publicar | 15-11-2026 |
| 5 | **RVR1960 y RVG** | Revisar y enviar los pedidos ya redactados (`borradores/`): precio de ministerio de la RVR1960 (American Bible Society y Sociedad Bíblica Argentina) y permiso de la Reina Valera Gómez. Decidir si se paga API.Bible para el lanzamiento o desde marzo | Pedido: oct; pago: dic o mar |
| 6 | **Cuenta de Apple** (USD 99 por año) | Si querés iOS el 18-12, abrirla a principios de diciembre; si no, iOS en enero o febrero | 01-12-2026 |
| 7 | **Identificador de la app en las tiendas** | Hoy es provisorio (`com.sendaapp.biblia`); no se puede cambiar después de la primera publicación | Antes de la prueba cerrada |

## 4. Verificación del nombre (lo que se pudo hacer desde acá)

- **Tiendas:** en la búsqueda del 05-10-2026 no apareció ninguna app cristiana llamada «Senda». Hay una app de transporte en EE.UU.
  («SendaRide»), de otra categoría.
- **Chile:** «SENDA» es la sigla del **Servicio Nacional para la Prevención y Rehabilitación del Consumo de Drogas y Alcohol**
  (creado por la Ley 20.502, en funciones desde 2011), muy conocido allí («SENDA Previene»). **No impide usar el nombre**, pero en
  Chile puede generar asociaciones y una oposición si se registra la marca allí. Mitigación: el nombre en tienda va siempre con su
  bajada («Senda: la Biblia jugando»), el logotipo en minúsculas con la lámpara y, antes de invertir en Chile, consulta en el INAPI.
- **INPI, dominios y redes:** la red de este entorno bloquea esas consultas. Lista para hacerlo en 15 minutos: INPI → consulta de
  marcas («SENDA», clases 9, 41 y 42); NIC Argentina (`senda.com.ar`); un registrador para `.app` o `.com` (probables alternativas:
  `sendaapp.com`, `jugasenda.com`); usuarios en Instagram, TikTok y YouTube (`@senda.app`, `@sendaapp`).

## 5. Los próximos 30 días (del 5 de octubre al 4 de noviembre de 2026)

### Vos

- [x] Abrir la vista previa del sprint 0 en el celular y contarme qué te gusta y qué no.
- [x] Crear el repositorio `senda-app` y darle acceso a Claude.
- [ ] Probar la vista previa del sprint 1 (temas, Ajustes, lector de papel, sonidos) y, si tenés Android, instalar el APK de prueba.
- [ ] Confirmar la navegación (barra de abajo) y el enlace a la RVR1960.
- [ ] Verificar el nombre con la lista de la sección 4; reservar los usuarios de redes (gratis).
- [ ] Elegir 2 revisores doctrinales y anotar 12 testers con Android (para la prueba cerrada de noviembre).
- [ ] Revisar y decidir el envío de los pedidos de licencia (RVR1960 y RVG) y desde qué correo.

### Claude

- [x] Sprint 1 (lo principal), con vista previa y APK de prueba.
- [ ] Lo que falta del sprint 1 (planes de lectura, protector de racha, recordatorio) y el sprint 2.
- [ ] Banco de preguntas: benchmark de bancos con licencia, filtro y las primeras 1.000 preguntas revisables.
- [ ] Lecciones de las secciones 0 a 2 de Fundamentos para revisión doctrinal.
- [x] Borradores de los pedidos de licencia y de los textos legales (privacidad y términos, en la app; falta normas de comunidad).
- [x] Sonidos propios (36, sintetizados, con la firma de tres notas) y las ideas del capítulo {{cap:20}}.
