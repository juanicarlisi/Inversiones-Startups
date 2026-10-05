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
| 11 | **Anuncio corto al terminar partidas** | Aprobado (con el tope de uno cada 3 partidas como punto de partida; se ajusta con datos) |
| 12 | **Vidas** | **3 gratis, 1 por hora**; repasar **no** devuelve vidas por ahora |
| 13 | **Revisores doctrinales** | 2 personas de tu comunidad |
| 14 | **Línea editorial** | La del capítulo {{cap:23}}, por ahora |
| 15 | **Cuentas** | Personal ahora; tiendas en noviembre o diciembre |
| 16 | **Idioma de la interfaz** | Español neutro con «tú» |

Además, sumaste el **diseño emocional** como parte del proyecto: está en el capítulo {{cap:20}} y ya se aplica en la app.

## 2. Cómo seguimos: el desarrollo

| Qué | Cómo |
|---|---|
| **Dónde vive el código** | En un repositorio propio, `senda-app`, separado del holding. Mientras lo creás, queda una copia temporal en este repositorio (`apps/senda-app/`) |
| **Cómo probás** | Cada sprint publica una **vista previa web** privada que abrís desde el celular (sin cuentas ni costo). Desde noviembre, además, una **app instalable en Android** (APK de prueba, con una cuenta gratis de Expo) |
| **Ritmo** | Un sprint cada dos semanas; vos probás 30 minutos y decidís qué sigue |
| **Gastos** | Nada hasta noviembre. Después, solo lo imprescindible y con tu aprobación: Google Play (USD 25, una vez), RVR1960 por API.Bible (~USD 39 por mes, opcional), Claude Max (desde diciembre) |

**Plan de sprints hasta el lanzamiento** (detalle en el repositorio de la app, `docs/SPRINTS.md`):

| Sprint | Fechas | Qué sale |
|---|---|---|
| 0 | 5–11 oct | Base de la app, sistema de diseño, Inicio, Biblia con 3 versiones libres, una lección, Espadeo de práctica, semana Senda. **Hecho** |
| 1 | 12–25 oct | Biblia completa (búsqueda, notas, planes, audio), racha con rayitos y Día libre, bienvenida, sonidos propios, «¡Volviste!» |
| 2 | 26 oct – 8 nov | Motor de la Travesía con las secciones 0 a 2, repaso, misiones y cofres, cuentas y sincronización (Supabase gratis) |
| 3 | 9–22 nov | Espadeo real: duelos por turnos con amigos y con Lani, 6 comodines, Armería, banco de preguntas grande; tarjetas para compartir |
| 4 | 23 nov – 6 dic | Calendario completo, Giro diario, Desafío del día, Tu Lani, pulido, accesibilidad; **prueba cerrada en Google Play** |
| Lanzamiento | 7–18 dic | Correcciones, fichas de tienda, publicación gradual el **18-12-2026** |

## 3. Lo que queda abierto

| # | Tema | Recomendación | Hasta cuándo |
|---|---|---|---|
| 1 | **Crear el repositorio de la app** | Crear `senda-app` privado en tu GitHub (2 minutos) y darle acceso a Claude | Esta semana |
| 2 | **Verificar el nombre** | Buscar «Senda» en el INPI (clases 9, 41 y 42), en las tiendas y en redes; ver dominios. Ojo con **Chile**: allí SENDA es el servicio estatal de prevención de drogas y alcohol (sección 4) | 15-10-2026 |
| 3 | **Cuenta de Expo** (gratis) y red del entorno | Crearla y permitir `expo.dev` en la configuración de red del entorno, para compilar el APK de prueba | 31-10-2026 |
| 4 | **Cuenta de Google Play** (USD 25) | Abrirla **a más tardar el 15-11**: las cuentas personales nuevas necesitan 12 testers durante 14 días antes de publicar | 15-11-2026 |
| 5 | **RVR1960** | Enviar el pedido de precio de ministerio (Claude lo redacta); decidir si se paga API.Bible para el lanzamiento o desde marzo | Pedido: oct; pago: dic o mar |
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

- [ ] Abrir la vista previa del sprint 0 en el celular y contarme qué te gusta y qué no (30 minutos).
- [ ] Crear el repositorio `senda-app` y darle acceso a Claude; después, iniciar las sesiones de desarrollo desde ese repositorio.
- [ ] Verificar el nombre con la lista de la sección 4; reservar los usuarios de redes (gratis).
- [ ] Elegir 2 revisores doctrinales y anotar 12 testers con Android (para la prueba cerrada de noviembre).
- [ ] Crear la cuenta gratis de Expo y permitir `expo.dev` en la red del entorno (para el APK de prueba).
- [ ] Revisar y decidir el envío del pedido de licencia de la RVR1960.

### Claude

- [ ] Sprint 1 y sprint 2 (tabla de la sección 2), con una vista previa nueva al final de cada uno.
- [ ] Banco de preguntas: benchmark de bancos con licencia, filtro y las primeras 1.000 preguntas revisables.
- [ ] Lecciones de las secciones 0 a 2 de Fundamentos para revisión doctrinal.
- [ ] Borrador del pedido de licencia de la RVR1960 y de los textos legales (términos, privacidad, normas).
- [ ] Sonidos propios (biblioteca libre de derechos y la firma de tres notas) y las primeras ideas del capítulo {{cap:20}}.
