# Anexo · Glosario, analítica y fuentes

## A. Glosario

| Término | Significado |
|---|---|
| **MVP** | Primera versión publicada: lo mínimo que ya sirve de verdad y permite aprender |
| **v1, v2, v3** | Versiones grandes que se suman con la app ya publicada |
| **Núcleo innegociable** | Lo que sí o sí sale en una versión; el resto sale si llega, detrás de un interruptor |
| **Prueba de la grilla** | Poner cada pantalla al lado de su equivalente en las apps de referencia; si se ve más pobre, se rehace |
| **Jugosidad** («juice») | Efectos chicos (rebotes, partículas, sonidos, sacudidas) que hacen que un juego se sienta vivo |
| **Infantilómetro** | Prueba con 30 jóvenes para medir si Lani (o una pantalla) se ve infantil |
| **Travesía / Ruta** | El módulo de aprendizaje / cada curso dentro de él (Fundamentos, Héroes, Mapas…) |
| **Repaso del día** | El nodo que aparece al terminar una Ruta y trae 6 niveles nuevos cada día |
| **Armería / Carga / Prueba de pieza / Cara a cara** | Casilla dorada de la ruleta / barra de 3 aciertos / pregunta para ganar una pieza / duelo por una pieza del rival |
| **Liga Senda, Apertura, Clausura** | La liga por persona y sus dos torneos anuales |
| **Partido de la fecha** | El duelo oficial semanal de la Liga |
| **Pase Senda** | Recorrido de premios por temporada, con carril gratis y premium |
| **Tu Lani** | Tu versión personalizada de la mascota |
| **Pulso** | Las encuestas de Senda |
| **Primero la Palabra** | Pantalla con un versículo antes de abrir una red social elegida |
| **Sprint o ciclo** | Dos semanas de trabajo que terminan en una versión probada |
| **Lanzamiento gradual** | Publicar para un porcentaje de usuarios y ampliar si no hay problemas |
| **Actualización por aire** | Cambio de código o contenido que llega sin pasar por la revisión de la tienda |
| **Interruptor de función** | Llave que prende o apaga una función para un grupo de usuarios |
| **Retención al día 7** | Porcentaje de personas que vuelven a abrir la app 7 días después de instalarla |
| **Activos por mes / por semana** | Personas distintas que usaron la app en ese período |
| **Conversión** | Porcentaje de activos que paga un plan |
| **eCPM** | Lo que paga la publicidad por cada mil vistas |
| **Rive** | Herramienta para animar personajes con estados, usada por Duolingo |
| **Supabase** | Servicio que da base de datos, cuentas, tiempo real y archivos |
| **YouVersion Platform / API.Bible** | Servicios que dan Biblias con licencia a otras apps |
| **CC BY / CC BY-SA / CC0** | Licencias libres: atribuir / atribuir y compartir igual / sin condiciones |
| **Dominio público** | Obra sin derechos de autor vigentes: uso libre |
| **Datos sensibles** | Datos que revelan, entre otros, convicciones religiosas (Ley 25.326): solo se usan para estadísticas si nadie puede ser identificado |
| **ASO** | Posicionamiento en las tiendas de apps |
| **Espadeo** | Competencia de buscar citas y responder sobre la Biblia («sword drill» en inglés) |

## B. Eventos de analítica principales

| Área | Eventos |
|---|---|
| Bienvenida | app_abierta_primera_vez, edad_elegida, objetivo_elegido, rutas_elegidas, primera_leccion_terminada, tu_lani_creado, cuenta_creada, avisos_aceptados |
| Biblia y Berea | capitulo_leido, audio_escuchado, mas_abierto (pestaña), version_usada, plan_dia_completado, desafio_unido, versiculo_memorizado |
| Racha | rayito_encendido, hito_alcanzado, protector_usado, dia_libre_usado, racha_recuperada, racha_compartida_iniciada |
| Travesía | leccion_iniciada, leccion_terminada, ejercicio_respondido (tipo, acierto), vida_perdida, vidas_recuperadas (fuente), repaso_terminado, jefe_vencido, legendario_ganado, ruta_cambiada |
| Espadeo | duelo_iniciado, turno_jugado, comodin_usado (tipo), pieza_ganada, cara_a_cara, armadura_completa, duelo_terminado (resultado, tipo de rival) |
| Liga y vivos | club_creado, partido_jugado, partido_resultado, ascenso, descenso, viernes_jugado (posición), copa_jugada |
| Calendario | evento_creado, evento_confirmado, invitacion_compartida, calendario_suscripto, asistencia_registrada, turno_asignado |
| Reunión y Púlpito | reunion_creada, bloque_agregado (tipo), sala_abierta, jugadores_en_sala, reunion_registrada, desafio_domingo_creado, desafio_domingo_jugado |
| Comunidad | amigo_solicitado, amigo_aceptado, vida_pedida, vida_regalada, estado_publicado, pulso_respondido, primero_palabra_activado, ayuno_iniciado, ayuno_terminado |
| Compartir y crecer | tarjeta_compartida (momento, red), enlace_abierto, invitacion_instalada |
| Economía | talentos_ganados (fuente), talentos_gastados (destino), perlas_compradas, cofre_abierto, video_visto (lugar), objeto_comprado (tipo) |
| Ingresos | pantalla_planes_vista, prueba_iniciada, plan_iniciado (plan), pase_comprado, plan_cancelado |
| Calidad | error_reportado (tipo), reporte_resuelto, cierre_inesperado |

## C. Fuentes

Las fuentes con fecha de cada dato están en las bitácoras del repositorio:

- `conocimiento/2026-10-05-senda-desarrollo-y-licencias.md` — RVR1960 (derechos, uso sin permiso, YouVersion Platform, API.Bible, Ley 11.723),
  Biblias libres incorporadas, verificación del nombre «Senda» y condiciones para desarrollar sin gastar.
- `conocimiento/2026-10-02-senda-v2-investigacion.md` — Duolingo por dentro, Preguntados exacto, comodines, vidas, membresías, licencias
  de las Biblias (YouVersion Platform, API.Bible, titulares), calendario e iglesias, pantallas y redes, datos sensibles, nombres con
  dueño, color y jugosidad, tarifas.
- `conocimiento/2026-09-30-proyecto-senda-investigacion.md` — Biblias y comentarios libres, audio, mecánicas, espadeo, marco teórico,
  tiendas y precios, IA, legal y menores.
- `conocimiento/2026-09-28-apps-cristianas-y-mecanicas.md` — mercado, licencias, mecánicas, ecosistema y bancos de preguntas.
- `conocimiento/2026-09-28-difusion-costo-cero.md` — las 40 formas de difusión sin pagar y sin mostrar la cara.
- `conocimiento/2026-09-28-lo-que-funciona-hoy.md` — casos que se copiaron y mejoraron.
- `conocimiento/2026-09-28-patentes-marcas-anonimato.md` — patentes, marcas, derechos de autor y anonimato.

Todo dato que decida plata se vuelve a verificar en la fuente original antes de usarlo (en esta sesión la red bloqueó la lectura directa
de varios sitios; los datos se obtuvieron vía buscador).
