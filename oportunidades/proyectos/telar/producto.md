# Telar · Producto: principios, funciones y roadmap

> 15-11-2026. Parte del proyecto P11 (`../P11-telar.yaml`); los datos de mercado están en `investigacion.md`. Escrito para leer sin saber de
> programación. Telar es el nombre recomendado para lo que hoy se llama «Plan Maestro» (ver el §10 y la verificación de nombres en
> `investigacion.md` §11). Los ejemplos de planes son inventados: el repositorio es público.

---

## 1. En una frase

**Telar es el cronograma de vida para una persona o una pareja.** Ves todos tus proyectos juntos, contra las horas que de verdad tenés. Te
dice «esto no te cabe» antes de que se pierda una fecha, y cuando la semana se rompe, **un toque** te propone el plan nuevo.

Es el único lugar donde queremos ser los mejores: **planificar varios proyectos de vida a escala de semanas y meses**. No competimos en
equipos, documentos, CRM ni calendario de reuniones (ahí ganan otros y lo decimos).

---

## 2. Lo que Plan Maestro ya hace bien y lo que le falta

**Ya hace bien (y se conserva):** áreas → proyectos → tareas con color; el cronograma tipo Gantt con cuatro escalas, de panorama a días; el
tablero por estado, área o proyecto; la prioridad por orden vertical; fechas clave y hábitos; foco con estrella; búsqueda; deshacer; copia de
seguridad; modo oscuro; cuidado de accesibilidad.

**Le falta para ser un producto:**

| Falta | Por qué importa |
|---|---|
| Vivir fuera del artefacto de Claude (hoy depende de su base de datos y de sus descargas) | Sin eso no se puede publicar ni instalar |
| Horas y capacidad | Es la diferencia entre «un dibujo de fechas» y «un plan que cabe» |
| Teclado y captura rápida | Un plan se mantiene en 5 segundos o no se mantiene |
| Arrastrar con el dedo | Hoy en el celular solo hay botones de subir y bajar |
| Un primer minuto que enseñe | Hoy abre en blanco |
| Plantillas, ejemplo, revisión semanal, IA | Lo que hace que alguien vuelva |
| Fuentes y datos propios (hoy carga fuentes de Google) | Sin internet y sin terceros |

---

## 3. Dónde puede ser el mejor del mundo (el hueco)

Cuatro familias de herramientas, ninguna pensada para esto (`investigacion.md` §6):

1. **Listas** (Todoist, TickTick, Things): te dicen qué hacer, no si te cabe.
2. **Planificadores de día** (Sunsama, Motion, Akiflow): mejores del mundo para *hoy*; cuestan USD 17–34 por mes y no miran meses.
3. **Gantt** (GanttPRO, TeamGantt, OmniPlan): miran meses, pero para jefes de proyecto con equipo y sin tus horas.
4. **Todo armable** (Notion, ClickUp): lo armás vos y se vuelve un trabajo.

**El hueco (INFERENCIA, a validar con entrevistas):** una persona sola, con varios proyectos y poco tiempo, que necesita ver **semanas
y meses con sus horas reales** y rehacer el plan sin sufrir.

---

## 4. Principios de la mejor experiencia

1. **Rápido de verdad.** Abrir en menos de un segundo; cada toque responde en menos de 100 ms; sin ruedas girando, porque los datos
   están en el dispositivo. Medimos el «tiempo hasta la primera tarea» y el objetivo es **menos de 30 segundos** desde la primera vez
   (metas, HIPÓTESIS a medir en la beta).
2. **Escritorio para planificar, celular para vivir el plan.** Las dos son experiencias distintas, no una pantalla achicada. La queja
   más repetida contra Sunsama, Motion y Notion es el celular (investigacion.md §7). En el escritorio: el cronograma, «¿y si…?» y la
   revisión. En el celular: **Hoy**, captura, tildar, y replanificar con un toque.
3. **El teclado es un camino principal.** Una paleta de comandos (Ctrl o Cmd + K) hace todo lo que hace el mouse; atajos para crear,
   mover, cambiar estado y saltar entre vistas; captura en lenguaje natural en español rioplatense («llamar al contador el viernes 30 min
   #impuestos», «el finde», «pasado mañana»). Dirección tomada de Linear; nunca copia de su aspecto.
4. **Arrastrar con mouse, dedo y lápiz**, con una sola lógica (eventos de puntero), y siempre con vista previa de dónde cae.
5. **El vacío inicial enseña.** Al abrir por primera vez no hay una pantalla en blanco: hay un **plan de ejemplo vivo** («Mudarme en 90
   días y lanzar un proyecto») que ya muestra una semana pasada de carga en rojo. Una línea te invita a «borrarlo y empezar con una frase».
6. **Sin registro.** Abrís y usás; los datos quedan en tu dispositivo. La cuenta aparece solo si querés sincronizar (Pro).
7. **Tu plan es un archivo tuyo.** Formato abierto, CSV, calendario (.ics) e imagen. Copia automática a un archivo y restauración en
   un paso. Es la respuesta a las apps que cierran o suben de precio (Height, Clockwise).
8. **Nunca culpa.** «Vencida» pasa a **«Se corrió»**; las semanas rojas ofrecen una salida («replanificar»), no un reproche. Nada de rachas
   punitivas ni gamificación agresiva.
9. **Cada sugerencia explica por qué** y se puede deshacer. Nada se mueve solo: siempre vista previa y botón «aplicar».
10. **Accesible y tranquila.** Todo con teclado, contraste suficiente, respeto de «reducir movimiento», lector de pantalla; animación
    solo para explicar (por ejemplo, cómo se corre una barra).

---

## 5. Las 10 funciones diferenciales

Convenciones: **Esfuerzo** de construcción (S = hasta 1 semana de Claude con revisión; M = 2–4 semanas; L = 1–2 meses; ESTIMACIÓN) y
**costo de operación** por mes. «Por qué nadie la tiene bien» se apoya en lo que encontré hasta el 15-11-2026: es **INFERENCIA** (no pude
probar todas las herramientas) y se corrige con la revisión de pendientes (`investigacion.md` §13).

### F1. Cronograma de vida con zoom por significado
- **Qué hace:** una sola pantalla con todas tus áreas de vida como carriles. Al alejar, los proyectos se vuelven bloques con **calor de
  carga** (cuán llena está cada semana); al acercar, aparecen las tareas. El año entero se lee de un vistazo, con hoy, fechas clave y
  «temporadas» (vacaciones, finales, viaje).
- **Por qué nadie la tiene bien:** las herramientas de Gantt están pensadas para jefes de proyecto y se vuelven densas; las de listas no
  tienen línea de tiempo entre proyectos (no confirmé si TickTick tiene una); Notion tiene una vista de cronograma pero hay que armarla.
- **Cómo se construye:** parte de lo que ya hace Plan Maestro; se agrega un dibujo por capas (no repintar todo en cada cambio) y niveles
  de detalle según el zoom. Dibujo en la pantalla con una técnica que solo dibuja lo visible, para que ande con cientos de tareas.
- **Esfuerzo y costo:** M. Costo de operación: USD 0.

### F2. Capacidad real en horas («te cabe / no te cabe»)
- **Qué hace:** definís cuántas horas por semana tenés por área (por ejemplo, 8 para el proyecto propio, 6 para estudio) y cada tarea tiene una
  estimación. Cada semana muestra su carga contra su capacidad y un veredicto en palabras: «Esta semana te pasás por 5 h. La que viene te
  sobran 3».
- **Por qué nadie la tiene bien:** Motion y Reclaim lo hacen a nivel de calendario diario y para equipos; las herramientas de recursos
  (para jefes de proyecto) lo hacen por equipo; lo único cercano que encontré para una persona sola es un planificador de disponibilidad
  de freelancers que guarda en el navegador y no replanifica (investigacion.md §9.1).
- **Cómo se construye:** cada tarea reparte sus horas entre sus días; se suma por semana y área. Cuenta simple y sin IA.
- **Esfuerzo y costo:** S. USD 0.

### F3. Replanificar con un toque («se rompió la semana»)
- **Qué hace:** un botón. Decís qué pasó («perdí 8 horas», «estoy enfermo hasta el jueves», «viaje 3 días») y Telar propone el nuevo plan
  con una **vista previa**: «Muevo 4 tareas, 1 fecha clave en riesgo; si sumás 3 horas el sábado, se salva». Aceptás, ajustás o deshacés.
- **Por qué nadie la tiene bien:** Motion reacomoda solo, pero a nivel de calendario, sin que veas qué cambió y con quejas de precio y
  de imprevisibilidad en los blogs de reseñas (⚠ algunos son de competidores); los Gantt de equipo no replanifican según tu capacidad
  personal.
- **Cómo se construye:** un **motor de reglas determinista** (no IA): ordena por prioridad (la que ya marcás con el orden vertical), respeta las
  fechas duras, mete cada tarea en la primera semana con lugar y marca las que quedan en riesgo con opciones (mover la fecha, sacar algo, sumar
  horas). Es código puro, con pruebas automáticas que garantizan que dos corridas dan lo mismo.
- **Esfuerzo y costo:** M–L (es el corazón). USD 0.

### F4. «¿Y si digo que sí?» (simulador de compromisos)
- **Qué hace:** antes de aceptar algo nuevo, lo agregás en una **rama de prueba** del plan y ves qué se corre: «Si aceptás este proyecto de 40 h
  para el 30 de marzo, tu plan de la mudanza pasa del 12 al 26 de abril». Podés comparar dos ramas lado a lado y quedarte con una.
- **Por qué nadie la tiene bien:** los escenarios existen en herramientas de empresa (para costos y recursos), no para una persona que
  tiene que decirle «sí o no» a un cliente o a un amigo esta semana (INFERENCIA).
- **Cómo se construye:** copia del plan + el mismo motor de la F3. Sin IA.
- **Esfuerzo y costo:** M. USD 0.

### F5. Plan desde una frase y ajustes por conversación (IA con vista previa)
- **Qué hace:** escribís o dictás «Me mudo en marzo y quiero lanzar mi tienda en mayo; tengo 10 h por semana» y Telar arma áreas, proyectos,
  tareas, duraciones y fechas clave. Después se ajusta hablando: «pasá la reforma después de abril» devuelve una **lista de cambios** para
  aprobar.
- **Por qué nadie la tiene bien:** GanttPRO, Instagantt y Tom's Planner ya arman un Gantt desde un texto (⚠ sus propios anuncios), para jefes de
  proyecto y sin tu capacidad; **esto solo no es un diferencial**: lo es hacerlo contra tus horas, con cambios aprobables y sin romper lo
  que ya armaste.
- **Cómo se construye:** la IA **solo traduce lenguaje a cambios** («agregar proyecto», «mover tareas», «poner estimación»); un esquema
  estricto valida lo que devuelve; las **fechas las calcula el motor** de la F3, nunca la IA. Cupo mensual en Pro y opción de usar la propia
  clave de IA. Verificar en la documentación vigente qué conexiones permite cada proveedor desde un navegador o si hace falta un
  intermediario.
- **Esfuerzo y costo:** M. Cada acción de IA cuesta ≈ USD 0,01–0,03 (ESTIMACIÓN; verificar con el precio vigente de la API); entra en el
  costo de USD 0,6 por suscriptor Pro.

### F6. Fecha probable y factor de realismo
- **Qué hace:** en vez de una fecha única, «fecha probable: 14–28 de marzo (80%)». Telar aprende cuánto subestimás por tipo de tarea
  («las de escribir te llevan 1,6 veces lo que pensás») y lo aplica a las nuevas. Al tildar una tarea larga preguntás «¿cuánto llevó?» con
  un toque (media hora, 1 h, 2 h, medio día, día), optativo.
- **Por qué nadie la tiene bien:** hasta donde vi, las herramientas personales muestran fechas únicas y nunca aprenden de tu historial
  (INFERENCIA). Subestimar es un fenómeno estudiado (la «falacia de la planificación»; referencia de conocimiento general, no verificada acá).
- **Cómo se construye:** estadística simple en el dispositivo; simulación de muchas corridas, la misma idea que usa este repositorio para
  proyectar el holding (`herramientas/escenarios.py`).
- **Esfuerzo y costo:** M. USD 0. Costo de cambio suave: tu historial vive en Telar.

### F7. Revisión semanal guiada de 10 minutos
- **Qué hace:** un ritual con cinco pasos y tarjetas: (1) tildá lo hecho; (2) lo que no se hizo: **mover, dividir o soltar** (una tarjeta por
  tarea); (3) mirá la semana próxima contra tu capacidad; (4) elegí tus tres prioridades; (5) una nota de aprendizaje. Al final, un resumen
  («cerraste 9 de 12; tu semana más cargada fue la del 3»).
- **Por qué nadie la tiene bien:** Sunsama convirtió el ritual *diario* en su sello (lo más elogiado en sus reseñas); la revisión *semanal* de
  varios proyectos queda como consejo de libros y plantillas (INFERENCIA).
- **Cómo se construye:** una pantalla guiada sobre los datos existentes. Notificación opcional el día que elegís.
- **Esfuerzo y costo:** S. USD 0.

### F8. Temporadas y ritmos: la vida no es solo proyectos
- **Qué hace:** declarás **ritmos** (gimnasio tres veces por semana, domingo en familia) y **temporadas** (finales, vacaciones, un bebé en
  camino, fin de mes). Ambos **restan capacidad** automáticamente y se ven como franjas en el cronograma.
- **Por qué nadie la tiene bien:** los planificadores de día tratan los hábitos como tareas repetidas del calendario, no como horas que el
  plan de proyectos debe respetar; en Plan Maestro, el «hábito» es hoy solo una barra rayada.
- **Cómo se construye:** reglas de repetición simples que restan horas en la F2.
- **Esfuerzo y costo:** S–M. USD 0.

### F9. Plan para dos, sin cuentas y cifrado
- **Qué hace:** compartís un plan con tu pareja o socio con un **enlace o un QR**; los dos editan, cada uno ve lo suyo y lo común. Sin crear
  cuentas. Lo guardado fuera de tu dispositivo va cifrado de punta a punta.
- **Por qué nadie la tiene bien:** compartir en las herramientas de equipo exige cuentas y asientos por persona (Linear, Trello, Basecamp
  cobran por usuario); las personales (Things) no comparten.
- **Cómo se construye:** una técnica de edición simultánea sin conflictos (CRDT) —la biblioteca Yjs es la candidata, según su documentación
  oficial— y un servidor mínimo que solo reenvía datos cifrados. La clave viaja en el enlace y no pasa por el servidor. Se elige con la
  skill `/herramientas` antes de construir (regla 10).
- **Esfuerzo y costo:** L. ≈ USD 5–15 por mes de servidor al principio (ESTIMACIÓN a verificar). Es una función Pro.

### F10. Plantillas vivas y galería pública de planes
- **Qué hace:** elegís «Rendir el final de Álgebra el 12/12» y el plan se arma **hacia atrás desde tu fecha** y se acomoda a tu capacidad. Podés
  publicar tu plan (sin datos personales) y que otros lo clonen. Cada plantilla es una página pública que aparece en los buscadores.
- **Por qué nadie la tiene bien:** las galerías de plantillas existen (Notion, ClickUp, Asana) pero son estáticas: no se acomodan a tu fecha ni a tus
  horas. Y para nosotros es **el canal de distribución** (sin pagar publicidad).
- **Cómo se construye:** las plantillas guardan duraciones y distancias respecto de una fecha final; el motor de la F3 las acomoda. Las
  páginas públicas se generan de las mismas plantillas.
- **Esfuerzo y costo:** M. USD 0 (hosting estático).

### Funciones de base (no cuentan como diferenciales, pero tienen que ser excelentes)
Captura rápida en lenguaje natural y paleta de comandos; arrastrar con dedo; deshacer y rehacer sin límite de la sesión; historial de versiones (Pro);
buscar; etiquetas; subtareas y listas de comprobación; dependencias simples («esta después de aquella»); importar desde Excel, Google Sheets, Trello,
Todoist y Notion; exportar a archivo propio, CSV, .ics e imagen; avisos opcionales; varios planes; modo oscuro; teclado completo; accesibilidad.

---

## 6. Cómo se siente (descripción de las pantallas)

- **Vida** (escritorio): carriles por área, bloques por proyecto con calor de carga, línea de hoy, zoom con la rueda o con `+`/`−`.
- **Tablero:** las mismas tareas por estado, área o proyecto; ahora con la carga de horas de cada columna.
- **Hoy** (celular): lo de hoy en tres bloques (ahora, hoy, para ver); botón grande «Replanificar»; captura con un toque y con la voz.
- **Semana:** carga contra capacidad por área, con el veredicto en palabras.
- **¿Y si…?:** el plan actual y la rama de prueba lado a lado, con los cambios resaltados.
- **Revisión:** tarjetas de a una, con gestos de mover, dividir y soltar.
- **Plantillas y galería:** vidriera pública, con «Abrir en Telar».

El aspecto es propio: sin copiar el diseño de Notion, Linear, Sunsama ni Todoist; paleta tranquila y la metáfora del tejido en los carriles
(hilos) y en las transiciones.

---

## 7. Arquitectura en criollo

- **Primero, la web instalable (PWA):** se abre con un enlace, se instala con un clic, funciona sin internet. Es lo más barato y lo que
  más rápido sale; sirve en Android, iPhone y escritorio.
- **Datos en tu dispositivo:** en una base local del navegador. La documentación de MDN indica que el almacenamiento privado del origen
  (OPFS) está «ampliamente disponible» desde marzo de 2023, y permite una base SQLite de buen rendimiento. Verificar en el corte 0 qué opción
  conviene (base del navegador o SQLite en OPFS).
- **El motor de planificación es código puro:** sin pantalla ni internet; se prueba con miles de planes sintéticos y se ejecuta igual en
  la web, el celular y el escritorio. Es la pieza más valiosa.
- **IA a demanda:** traduce una frase a cambios y nada más. Un servidor mínimo (o la clave del usuario) la conecta.
- **Sincronización opcional (Pro):** edición sin conflictos, cifrada de punta a punta, con un servidor mínimo.
- **Después, las tiendas:** el mismo código dentro de un envoltorio nativo. Capacitor (su documentación muestra la versión 8 y cubre iOS y
  Android) es la candidata para celulares; Tauri 2 (según su documentación, binarios chicos para escritorio y móvil) es la candidata para el
  escritorio si hace falta algo más que la PWA.
- **Nada de esto está elegido todavía:** es una recomendación preliminar. La regla 10 pide verificar en fuente oficial, elegir una y registrar
  (herramienta, versión, fuente, licencia, por qué, regla de corte) al empezar el corte que la necesita, con la skill `/herramientas`. No se
  reemplaza nada de lo que ya funciona sin una prueba comparativa.
- **Costo de servidores mínimo (regla de diseño del 06-10-2026):** lo gratuito corre en el dispositivo; el servidor solo existe para
  sincronizar y para la IA, y se paga con el Pro.

---

## 8. Modelo de negocio (resumen; los números están en el yaml y en `investigacion.md` §8)

| Plan | Qué incluye | Precio de lista |
|---|---|---|
| **Libre** | Todo el cronograma, tablero, capacidad, replanificar, «¿y si…?», revisión, plantillas, exportar; datos en tu dispositivo; 3 planes desde una frase por mes | Gratis, sin cuenta |
| **Pro** | Sincronización entre dispositivos, IA ampliada (o la propia clave sin límite), historial de versiones, calendario en vivo, plan compartido con 1 persona, páginas públicas | USD 48 al año (USD 5,5 por mes); ≈ USD 30 en Latinoamérica |
| **Fundadores** (vitalicio) | Pro de por vida para quien apoye en el lanzamiento (con tope de 400 unidades) | USD 79 (menos en Latinoamérica) |
| **Pareja** (2028) | Un plan para dos con todo lo del Pro | USD 72 al año |

Lógica: lo que cuesta plata de verdad (sincronizar, IA) es lo que se paga; todo lo que corre en el dispositivo es gratis. Así el **costo por
usuario gratis es casi cero** y el plan gratis puede ser generoso sin quemar caja. El precio queda entre Todoist/TickTick (USD 36–60 al año) y
los planificadores (USD 204–408 al año).

---

## 9. Roadmap: de artefacto a producto, en cortes verticales

Cada corte termina con algo **usable y medible**, no con piezas sueltas. Horas del fundador entre paréntesis (tope total del holding: 10 por semana).

| Corte | Cuándo | Qué se puede hacer al terminar | Criterio de salida | Horas del fundador |
|---|---|---|---|---|
| **0. Salir del artefacto** | nov–dic 2026 | Abrir Telar en el navegador, instalarlo, usarlo sin internet, con tus datos locales y una copia en archivo; arrastrar con dedo; sin fuentes de Google | El fundador lo usa 4 semanas seguidas con sus proyectos, en su copia privada | 1,5 por semana (elegir nombre, probar) |
| **1. Capacidad y primer minuto** | dic 2026–ene 2027 | Horas por tarea, capacidad semanal y carga (F1, F2), captura rápida y paleta de comandos, ejemplo vivo, 20 plantillas (F10), importar Excel | Una persona nueva llega a «ya veo si me cabe» en menos de 3 minutos | 2 |
| **Hito: beta pública gratis** | ene–feb 2027 | «Planificá tu 2027»: web pública, gratis, sin cuenta | ≥ 150 personas crearon un plan | 2 |
| **2. El plan que se acomoda** | feb–abr 2027 | Replanificar (F3), «¿y si…?» (F4), plan desde una frase (F5), revisión semanal (F7), fecha probable (F6) | ≥ 15% vuelve en la semana 4 (control de corte de marzo) | 2 |
| **Cobros** | mar–may 2027 | Pro y vitalicio Fundadores (con la empresa del holding) | Primeros pagos | 1,5 (empresa, cuentas) |
| **3. Para dos y en todos lados** | may–ago 2027 | Sincronización cifrada, plan para dos (F9), temporadas y ritmos (F8), calendario en vivo | 30% de los suscriptores usa 2 dispositivos | 1,5 |
| **4. En las tiendas** | sep–dic 2027 | Android primero (en Argentina 82–87% de los celulares, Statcounter jul–ago 2026), después iPhone; avisos y widget «Hoy» | App aprobada en las dos tiendas | 1,5 |
| **Corte duro** | dic 2027 | — | 2.000 activos por mes y 30 pagos; si no, mantenimiento | decidir |
| **5. Más lejos** | 2028 | Inglés y portugués, plan Pareja, conexión con la IA del usuario (MCP y app dentro de ChatGPT), importadores de Trello, Todoist y Notion | 6.500 activos y 160 pagos al cierre | 1,25 |
| **6. Comunidad** | 2029–2030 | Biblioteca de plantillas de la comunidad, escritorio instalable, «Tu año en Telar» | 22.000 activos y 700 pagos | 1 |

**Reglas del roadmap:** (1) no se arranca el corte N+1 sin cumplir el criterio de salida del corte N; (2) cada corte pasa por la regla 10
(verificar herramientas especializadas antes de programar); (3) el Pro no se programa si el control de marzo (retención a la semana 4) da
menos de 15%; (4) un flujo pesado por vez.

---

## 10. Marca

- **Recomendado: Telar** (lema: «Tu año de un vistazo. Y si se rompe la semana, un toque»). Respaldo: **Trazo**. Detalle de la verificación
  y de los descartados en `investigacion.md` §11.
- Submarcas: Telar Libre, Telar Pro, Telar Pareja, Telar Plantillas.
- Registro del nombre en el INPI (clases 9, 42 y 41) a nombre de la empresa del holding; vigilar EUIPO y USPTO.
- Voz: español rioplatense, cálida, sin culpa. En inglés y portugués, la misma calma.

---

## 11. Cómo medimos (sin rastreo invasivo)

- **Métrica norte:** **semanas con plan vivo** (usuarios que abren su plan al menos 3 días de la semana).
- Analítica que respeta la privacidad: contadores agregados, sin contenido de tareas ni datos personales; los resúmenes (como «Tu año en
  Telar») se calculan en el dispositivo.
- Control de oro: retención a la semana 4 y a la 12, tasa de replanificaciones aceptadas (si el motor acierta) y entradas por búsqueda a plantillas.

---

## 12. Privacidad y repositorio público

- El repositorio es público: no hay tareas, nombres ni planes reales del fundador, solo ejemplos inventados.
- El fundador usa Telar con sus proyectos en una **copia privada** (navegador o archivo local), nunca dentro del repositorio.
- Los planes públicos de la galería son **opt-in** del usuario, con aviso de qué se publica.

---

## 13. Lo que decide el fundador

1. **El nombre:** Telar (recomendado) o Trazo, y aprobar el gasto del dominio y de la marca (regla 8).
2. **Seguir o no, con probabilidad honesta:** 20% de que despegue, corte duro en diciembre de 2027, 1,5–2 horas por semana (≈ 305 horas en 5 años).
3. **Que él sea el primer usuario** (planificar los proyectos del holding con Telar, en privado) y la prueba de 4 semanas del corte 0.
4. **Las entrevistas:** aprobar el texto de la convocatoria y dónde se publica (8–12 entrevistas asincrónicas, guion en `investigacion.md` §12).
5. **El modelo y el precio:** Libre + Pro de USD 48 al año + vitalicio Fundadores de USD 79 (tope 400).
6. **La empresa y los cobros** (febrero de 2027) y una **autorización permanente para respuestas de soporte de plantilla** (regla 8).
7. **Si Telar entra al comité** (`/comite`) comparado con las demás líneas por horas del fundador.
