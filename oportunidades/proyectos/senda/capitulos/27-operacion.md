# Operación, equipo y métricas

<div class="enpocas" markdown="1">
**En pocas palabras.** Un equipo chico y claro: Claude construye, produce contenido y mide; vos decidís, probás, aprobás y cuidás la
comunidad; 1–2 revisores cuidan la doctrina; especialistas freelance (interfaz, ilustración, animación, sonido) ponen el nivel
profesional; embajadores multiplican. Ciclos de dos semanas, prueba de la grilla antes de cada versión, tablero cada lunes y comité
mensual. El indicador que manda: **personas con 3 o más días con la Palabra por semana**.
</div>

## 1. El equipo y quién hace qué

| Rol | Quién | Qué hace | Horas |
|---|---|---|---|
| **Fundador** | Vos | Decide prioridades, aprueba todo lo que mueve plata o habla con terceros, prueba cada versión, consigue revisores, testers y embajadores, responde en redes | 5 h/sem hasta dic-2026; 3–4 en 2027; 2 en 2028 |
| **Desarrollo, contenido y datos** | Claude | Programa la app y el backend, produce y verifica contenido, prepara publicaciones y fichas de tienda, arma el tablero y propone mejoras | — |
| **Revisores doctrinales** | 1–2 personas de tu comunidad | Revisan lo doctrinal y un muestreo del resto | 1–2 h/sem cada uno |
| **Testers** | 12 al inicio, 30 después | Prueban versiones antes de salir | 30 min por versión |
| **Diseñador de interfaz** | Freelance | Sistema visual, pantallas clave, prueba de la grilla | Por proyecto (oct–nov 2026) y revisiones puntuales |
| **Ilustrador, animador de Rive y diseñador de sonido** | Freelancers | Lani v2, armadura, íconos, escenarios, Tu Lani, sonidos | Por proyecto |
| **Embajadores** | Líderes de jóvenes | Usan Senda Reunión, invitan, dan devoluciones | Voluntario (con beneficios) |
| **Moderadores** | El líder de cada grupo + vos + filtros automáticos | Reportes y contenido de usuarios | Minutos por día |
| **Revisión legal puntual** | Profesional externo, opcional | Solo antes del primer estudio de Pulso con terceros o de un sorteo internacional (capítulo {{cap:26}}) | Una vez |

## 2. El ritmo de trabajo

| Ritual | Cuándo | Qué | Duración para vos |
|---|---|---|---|
| **Ciclo de desarrollo** | Cada 2 semanas | Claude construye y publica una versión (primero a testers, después gradual a todos) | 30–60 min de prueba |
| **Prueba de la grilla** | Antes de cada versión | Pantallas nuevas al lado de las apps de referencia; si se ven más pobres, se rehacen | 10 min |
| **Tablero semanal** | Lunes | Métricas clave, lo que salió, lo que viene, reportes | 10 min |
| **Lote de redes** | Lunes | Aprobar las publicaciones de la semana | 20 min |
| **Comunidad** | En ratos | Responder comentarios y mensajes; seguir cuentas del nicho | 10 min por día |
| **Revisión de contenido** | Semanal | Los revisores aprueban el lote de la semana | Ellos |
| **Comité mensual** | Último viernes | Decisiones de producto, plata y cortes | 20–30 min |
| **Comité anual** | Diciembre | Estrategia del año siguiente, marcas, patentes, presupuesto | 1–2 h |

## 3. Métricas

### El indicador que manda

**Personas con 3 o más días con la Palabra en la semana** (leer, escuchar, un día de plan o una lección).

### Los indicadores que lo empujan

| Área | Indicador | Meta abr-2027 | Meta dic-2027 |
|---|---|---|---|
| Adquisición | Descargas por semana; costo por instalación (si hay publicidad paga) | 500/sem | 1.500/sem |
| Activación | % que termina la primera lección; % que crea cuenta | 60%; 40% | 70%; 50% |
| Retención | Vuelve al día 1 / 7 / 30 | 35% / 15% / 8% | 40% / 20% / 10% |
| Hábito | Lámpara promedio; % con 7+ días | 4 días; 15% | 6 días; 25% |
| Aprendizaje | Lecciones por usuario por semana; precisión | 5; 75% | 7; 78% |
| Comunidad | Grupos con Senda Reunión por semana; grupos con calendario activo; clubes que juegan la fecha | 20; 30; — | 50; 80; 3.000 |
| Experiencia | Calificación en tiendas; finalización de la primera lección; pasa la prueba de la grilla | 4,5; 60%; 100% | 4,7; 70%; 100% |
| Contagio | Invitaciones por usuario; % de instalaciones por invitación | 0,2; 20% | 0,4; 30% |
| Ingresos | Conversión a planes personales; Max dentro de ellos; grupos con Líder; iglesias con plan | —; —; —; — | 2%; 35%; 20%; 30 |
| Calidad | Calificación en tiendas; sesiones sin cierre | 4,5; 99,5% | 4,7; 99,7% |
| Contenido | Reportes por cada 1.000 preguntas; reportes resueltos en 72 h | < 3; 90% | < 2; 95% |

### Cómo se mide

Cada función sale con sus **eventos definidos** (por ejemplo: «lección_terminada», «duelo_ganado», «pieza_ganada», «partido_jugado»,
«reunión_creada», «evento_confirmado», «tarjeta_compartida», «invitación_aceptada», «rayito_encendido»), con propiedades anónimas. El tablero se arma solo en PostHog; el resumen del lunes lo escribe Claude.

## 4. Reglas de corte (escritas antes de empezar)

| Cuándo | Condición | Qué se hace |
|---|---|---|
| Abril de 2027 | Menos de 1.000 personas por semana con 3+ días con la Palabra, o menos de 10% que vuelve a la semana siguiente | Modo mantenimiento (sin desarrollo nuevo) y las horas pasan a otro proyecto del holding |
| 6 meses después de activar los planes | Menos de 1% de conversión a planes personales | Revisar la escalera de planes, la prueba gratis y los beneficios antes de seguir |
| Fin del Apertura (julio de 2027) | Menos del 40% de los clubes juega la fecha | Simplificar la Liga (zonas más chicas, fechas de 2 semanas) |
| 3 meses después de Senda Reunión | Menos de 20 grupos que la usen dos veces | Simplificar a los 2 juegos más usados |
| Cualquier momento | Calificación menor a 4,2 en tiendas por 2 meses | Frenar funciones nuevas y arreglar lo que molesta |

## 5. Soporte, tiendas y comunidad

- **Soporte:** preguntas frecuentes dentro de la app + correo del proyecto; Claude prepara las respuestas, vos las enviás. Meta: responder
  en menos de 48 horas.
- **Reseñas en tiendas:** se responden todas las de 1 a 3 estrellas (Claude propone la respuesta).
- **ASO (posicionamiento en tiendas):** título y subtítulo con palabras clave («Biblia», «trivia bíblica», «juegos cristianos»),
  capturas que muestran a Lani, la armadura y la Liga con el nivel visual del capítulo {{cap:19}}, video corto, ficha en español,
  portugués e inglés, prueba de versiones de la ficha.
- **Destacados:** nominar la app a los destacados de Google Play en los primeros 120 días y a las historias del App Store.
- **Comunidad:** cuenta de Instagram, canal de WhatsApp, grupo de embajadores y la biblioteca de plantillas de reuniones de los líderes.
