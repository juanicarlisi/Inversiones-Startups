// Textos del juego en español rioplatense y en inglés. Regla: palabras de un chico de 12 años, una idea por frase, cero jerga.
// Nunca «sacas», «transbordo», «hub» ni «balizas»: son cartas y paquetes, cambiar de avión, la base y los faros.
const T = {
  es: {
    titulo: 'Hub Nocturno', lema: 'El correo que vuela de noche',
    jugar: 'Jugar', seguir: 'Seguir mi partida', nueva: 'Empezar de cero', saltar: 'Saltar',
    // entrada (dos frases)
    intro1: 'Año 1929. En el sur, una carta tarda semanas en llegar.',
    intro2: 'Vos tenés un hangar, unos ahorros y un sueño: llevar el correo volando adonde no llega nada.',
    // guía del primer minuto
    g_tocar: 'En Buenos Aires esperan <b>{n} cartas</b> para Montevideo. <b>{Toca} Montevideo.</b>',
    g_ruta: 'Primero hace falta un camino por el aire. <b>Abrí la ruta.</b>',
    g_avion: 'Ahora falta quién las lleve. <b>Comprá tu primer avión.</b>',
    g_vuela: '¡Allá va! Lleva las cartas a Montevideo.',
    g_cobro: '<b>¡Cobraste!</b> Cada carta que entregás te paga.',
    g_sigue: 'El avión va y vuelve solo. Para crecer, {toca} <b>Siguiente paso</b>.',
    // tablero
    hoy: 'hoy', dia: 'Día {n}', pausa: 'Pausa', normal: 'Normal', rapido: 'Rápido', muyRapido: 'Muy rápido',
    menu: 'Menú', centrar: 'Ver mi red', sonido: 'Sonidos', musica: 'Música', idioma: 'English', glosario: '¿Qué es cada cosa?',
    calidad: 'Gráficos', q_auto: 'Automático', q_alto: 'Altos', q_medio: 'Medios', q_bajo: 'Livianos', reiniciar: 'Empezar de cero',
    reiniciarPregunta: '¿Empezar de cero? Se borra esta partida.', si: 'Sí, empezar de cero', no: 'No, seguir jugando',
    creditos: 'Mapa: relieve de NOAA ETOPO 2022 y Natural Earth (dominio público).', cerrar: 'Cerrar', entendido: 'Entendido', volver: 'Volver',
    siguiente: 'Siguiente paso', mision: 'Misión', premio: 'Premio', misionCumplida: '¡Misión cumplida!',
    encargo: 'Encargo', encargos: 'Encargos', aceptar: 'Aceptar', quedan: 'quedan {t}', encargoCumplido: '¡Encargo cumplido!', encargoVencido: 'Un encargo venció sin cumplirse.',
    encargoTxt: 'Llevar {n} {u} de {a} a {b}', navidad: 'Correo de Navidad',
    // unidades
    carta: 'carta', cartas: 'cartas', u_correo: 'cartas', u_pasajeros: 'pasajeros', u_carga: 'toneladas',
    cartasYpaquetes: 'cartas y paquetes',
    // misiones (en palabras simples)
    m1_primera: 'Llevá el correo a Montevideo', paso_ruta: 'Abrí la ruta', paso_avion: 'Comprá un avión',
    m1_segunda: 'Llevá el correo a Bahía Blanca',
    m1_transbordo: 'Que {meta} cartas cambien de avión en tu base',
    m1_noche_espera: 'Seguí repartiendo hasta que caiga la noche',
    m1_noche: 'Lográ {meta} despegues de noche (poné faros)',
    m1_sur: 'Entregá {meta} cartas en Comodoro Rivadavia',
    m1_gallegos: 'Entregá {meta} cartas en Río Gallegos',
    m1_caja: 'Ganá {meta} en un solo día',
    m2_pax: 'Llevá {meta} pasajeros', m2_andes: 'Cruzá la cordillera: {meta} entregas en Santiago', m2_red: 'Tené {meta} ciudades con vuelos',
    m2_cauquen: 'Poné a volar un Cauquén', m2_conexiones: 'Que {meta} viajeros o cartas cambien de avión en tu base', m2_caja: 'Ganá {meta} en un solo día',
    m3_jet: 'Poné a volar un Halcón', m3_carga: 'Llevá {meta} toneladas de carga', m3_continente: 'Entregá {n} en Lima, Bogotá y São Paulo',
    m3_ronda: 'Que el {meta}% del correo de una noche llegue a primera hora', m3_hub2: 'Que {meta} cambien de avión en São Paulo',
    m3_contratos: 'Cumplí {meta} encargos', m3_caja1: 'Ganá {meta} en un solo día', m3_caja2: 'Ganá {meta} en un solo día', m3_caja3: 'Ganá {meta} en un solo día',
    // pistas
    pista_m1_transbordo: 'Las cartas de Montevideo para Bahía Blanca pasan solas por tu base. Más vuelos, más cartas.',
    pista_m1_noche: 'Elegí una ruta y ponele faros. De noche, esos aviones siguen volando.',
    pista_m1_sur: 'Comodoro queda lejos: llegá por Bahía Blanca, con una escala.',
    pista_m1_gallegos: 'Abrí la ruta de Comodoro Rivadavia a Río Gallegos y ponele un avión.',
    pista_m1_caja: 'Sumá ciudades y aviones: cada ciudad nueva le da más cartas a toda tu red.',
    pista_noche: 'Es de noche y tus aviones duermen. Con faros en la ruta, vuelan igual.',
    pista_generica: '{Toca} «Siguiente paso» y seguí el consejo.',
    // siguiente paso
    s_ruta: 'Abrí una ruta a {b}', s_avion: 'Sumá un avión a {ruta}', s_faros: 'Poné faros en {ruta}', s_base: 'Agrandá el correo de {ap}',
    s_salida: 'Que los aviones de {ruta} salgan más llenos', s_encargo: 'Aceptá un encargo', s_vender: 'Vendé un avión que pierde plata',
    s_vender2: 'Vendé un avión que sobra en {ruta}', s_ordenar: 'Tu base pregunta: ¿qué sale primero?', s_juntar: 'Juntá {falta} más para {que}',
    s_acelerar: 'Acelerá el tiempo mientras tu red trabaja', s_esperar: 'Tus aviones trabajan solos. Mirá cómo crece tu plata.',
    que_avion: 'el {avion}', que_faros: 'los faros', que_base: 'agrandar tu correo', que_ruta: 'la ruta a {ciudad}',
    rutaA: 'la ruta a {ciudad}', rutaEntre: '{a} – {b}',
    // paneles
    tuBase: 'Tu base', esperan: 'esperan viajar', nadaEspera: 'Nada espera por ahora', abrirRuta: 'Abrir ruta', desde: 'desde {ciudad}',
    kmVuelo: '{km} km de vuelo', sinConexion: 'Todavía no llega ningún avión hasta acá.', escala: 'Queda lejos. Llegá primero a {ciudad}.',
    faltaPlata: 'Te faltan {monto}', muyLejos: 'Ningún avión tuyo llega tan lejos ({km} km).', rutasDeAca: 'Rutas desde acá',
    aviones1: '1 avión', avionesN: '{n} aviones', sinAvion: 'sin avión', baseExplica: 'Acá las cartas cambian de avión para seguir viaje.',
    baseRitmo: 'Tu correo ordena hasta <b>{n}</b> por hora.', baseCola: '{n} esperando para cambiar de avión', agrandar: 'Agrandar el correo',
    baseMax: 'Tu correo ya es el más grande.', sumarAvion: 'Sumar un avión', ponerFaros: 'Poner faros', conFaros: 'Con faros: vuela de noche',
    farosExplica: 'Luces en el suelo para volar de noche.', sinFaros: 'Sin faros: de noche no despega', cuandoSale: '¿Cuándo sale el avión?',
    sale0: 'Ya', sale30: 'Con algo', sale60: 'Medio lleno', sale90: 'Lleno', salePista0: 'Sale enseguida, aunque vaya casi vacío.',
    salePista30: 'Espera hasta 2 horas para juntar más cartas.', salePista60: 'Espera hasta 4 horas. Suele ser lo mejor.',
    salePista90: 'Espera hasta llenarse. Las cartas pueden llegar tarde.', ganoRuta: 'Esta ruta ganó', perdioRuta: 'Esta ruta perdió',
    cerrarRuta: 'Cerrar esta ruta', cerrarRutaPregunta: '¿Cerrar la ruta? Sus aviones se venden.', porHora: 'por hora',
    elegiAvion: 'Elegí un avión', paraRuta: 'para {ruta}', comprar: 'Comprar', lleva: 'Lleva', velocidad: 'Velocidad', alcance: 'Llega hasta',
    noLlega: 'No llega: esta ruta mide {km} km', bloqueado: 'Todavía no está a la venta', reservaTxt: 'Guardá algo de plata para la nafta',
    volando: 'Volando a {ciudad}', conCarga: 'con {n} {u}', vacio: 'vacío', cargando: 'Cargando en {ciudad}', esperaCarga: 'Esperando más cartas en {ciudad}',
    esperaNoche: 'Duerme en {ciudad}: de noche no despega sin faros', esperaTormenta: 'Espera en {ciudad} a que pase la tormenta',
    esperaVacio: 'En {ciudad}, sin nada para llevar', gano: 'Lleva ganado', viajes: '{n} viajes', seguirCam: 'Seguirlo con la cámara', vender: 'Vender',
    // aviones
    a_golondrina: 'Chica y barata. Ideal para viajes cortos.', a_tero: 'Más rápido y llega más lejos.',
    a_chaja: 'Lleva pasajeros y vuela de noche.', a_cauquen: 'Cuatro motores para cruzar medio continente.',
    a_petrel: 'Ágil y rendidor en tramos medianos.', a_halcon: 'Un jet: rapidísimo y con muchos asientos.', a_cormoran: 'Un gigante solo para carga.',
    avionNuevo: '¡Avión nuevo a la venta!',
    // conceptos (una imagen y una frase)
    c_cartas_t: 'Cartas y paquetes', c_cartas: 'Lo que llevás. Cada entrega te paga.',
    c_ruta_t: 'Ruta', c_ruta: 'El camino entre dos ciudades. Por ahí vuelan tus aviones.',
    c_avion_t: 'Avión', c_avion: 'Va y vuelve solo por su ruta, llevando cartas.',
    c_base_t: 'Base', c_base: 'Buenos Aires. Acá las cartas cambian de avión para seguir viaje.',
    c_faros_t: 'Faros', c_faros: 'Luces en el suelo. Con faros, tus aviones vuelan también de noche.',
    c_mision_t: 'Misión', c_mision: 'Lo que te pide la historia. Al cumplirla ganás un premio.',
    c_encargo_t: 'Encargo', c_encargo: 'Un pedido especial, con fecha límite y premio extra.',
    c_ganancia_t: 'Ganancia del día', c_ganancia: 'Lo que entró menos lo que gastaste hoy.',
    // momentos
    mo_base_t: 'Tu base trabaja', mo_base: 'Las cartas de Montevideo para Bahía Blanca cambian de avión en Buenos Aires, solas.',
    mo_tarde_t: 'Se viene la noche', mo_tarde: 'Tus aviones todavía no pueden volar a oscuras.',
    mo_noche_t: 'Cayó la noche', mo_noche: 'Sin faros en la ruta, tus aviones duermen hasta que sale el sol.',
    mo_faros_t: '¡Faros encendidos!', mo_faros: 'Esta ruta ahora trabaja también de noche.',
    mo_despegueNoche_t: 'Primer vuelo nocturno', mo_despegueNoche: 'Mientras otros duermen, tu correo sigue volando.',
    mo_encargo_t: 'Llegó un encargo', mo_encargo: 'Un pedido con premio. Aceptalo si tus aviones llegan.',
    mo_tormenta_t: 'Viene una tormenta', mo_tormenta: 'Los aviones de {lista} van a esperar en tierra.',
    mo_tormentaFin: 'Pasó la tormenta. A volar.',
    mo_ciudades_t: 'Ciudades nuevas', mo_ciudades: 'Ahora podés volar a {lista}.',
    mo_venta: 'Te quedaste sin plata: se vendió un avión que perdía ({monto}).',
    mo_ordenar_t: '¿Qué sale primero?', mo_ordenar: 'Llegaron cartas para dos ciudades. Las que van más lejos tienen más apuro.',
    mo_ordenado: 'Tu base ordenó el correo: {pct} llegó a tiempo. +{monto}',
    mo_ronda: 'Esta noche tu base trabaja sola.', mo_rondaFin: 'Anoche llegó a primera hora el {pct} del correo.',
    mo_perdio: 'Ese vuelo salió casi vacío y perdió plata.',
    ausente_t: 'Mientras no estabas', ausente: 'Tu red siguió trabajando.', cobrar: 'Cobrar',
    // capítulos
    cap1: 'Capítulo 1 · El correo del sur', cap2: 'Capítulo 2 · Pasajeros', cap3: 'Capítulo 3 · Jets y carga',
    cap2Texto: 'Marzo de 1946. Los aviones ya vuelan de noche y la gente quiere viajar.',
    cap3Texto: 'Enero de 1970. Llegan los jets y la carga: se abre todo el continente.',
    finCap: '¡Capítulo terminado!', finHistoria: '¡Terminaste la historia!', finHistoriaTxt: 'Tu red cubre el continente. Podés seguir jugando con encargos.',
    st_cartas: 'cartas entregadas', st_pax: 'pasajeros', st_ton: 'toneladas', st_km: 'km volados', st_tiempo: 'llegó a tiempo',
    mejorRuta: 'Tu mejor ruta: {ruta} ({monto})', irCap: 'Ir al capítulo {n}', seguirAca: 'Quedarme un rato más',
    dato1: 'Dato real: en 1930 el correo aéreo del sur llegó hasta Río Gallegos.',
    dato2: 'Dato real: en 1946 salió el primer vuelo de una aerolínea argentina hacia Europa.',
    dato3: 'Dato real: en 1970 voló con pasajeros el primer avión de fuselaje ancho.',
    errorTitulo: 'Algo salió mal', errorTexto: 'Podés seguir desde el último guardado o empezar de cero.', errorSeguir: 'Seguir desde el guardado',
    sinGuardado: 'Este navegador no deja guardar la partida.',
    toca: 'tocá', Toca: 'Tocá', clic: 'hacé clic en', Clic: 'Hacé clic en',
  },
  en: {
    titulo: 'Hub Nocturno', lema: 'The mail that flies by night',
    jugar: 'Play', seguir: 'Continue my game', nueva: 'Start over', saltar: 'Skip',
    intro1: 'The year is 1929. Down south, a letter takes weeks to arrive.',
    intro2: 'You have a hangar, some savings and a dream: to fly the mail where nothing else gets through.',
    g_tocar: '<b>{n} letters</b> are waiting in Buenos Aires for Montevideo. <b>{Toca} Montevideo.</b>',
    g_ruta: 'First you need a path through the air. <b>Open the route.</b>',
    g_avion: 'Now someone has to carry them. <b>Buy your first plane.</b>',
    g_vuela: 'There it goes! It is taking the letters to Montevideo.',
    g_cobro: '<b>You got paid!</b> Every letter you deliver earns money.',
    g_sigue: 'The plane goes back and forth by itself. To grow, {toca} <b>Next step</b>.',
    hoy: 'today', dia: 'Day {n}', pausa: 'Pause', normal: 'Normal', rapido: 'Fast', muyRapido: 'Very fast',
    menu: 'Menu', centrar: 'See my network', sonido: 'Sounds', musica: 'Music', idioma: 'Español', glosario: 'What is each thing?',
    calidad: 'Graphics', q_auto: 'Automatic', q_alto: 'High', q_medio: 'Medium', q_bajo: 'Light', reiniciar: 'Start over',
    reiniciarPregunta: 'Start over? This game will be erased.', si: 'Yes, start over', no: 'No, keep playing',
    creditos: 'Map: terrain from NOAA ETOPO 2022 and Natural Earth (public domain).', cerrar: 'Close', entendido: 'Got it', volver: 'Back',
    siguiente: 'Next step', mision: 'Mission', premio: 'Prize', misionCumplida: 'Mission complete!',
    encargo: 'Special order', encargos: 'Special orders', aceptar: 'Accept', quedan: '{t} left', encargoCumplido: 'Order complete!', encargoVencido: 'An order ran out of time.',
    encargoTxt: 'Carry {n} {u} from {a} to {b}', navidad: 'Christmas mail',
    carta: 'letter', cartas: 'letters', u_correo: 'letters', u_pasajeros: 'passengers', u_carga: 'tons',
    cartasYpaquetes: 'letters and parcels',
    m1_primera: 'Fly the mail to Montevideo', paso_ruta: 'Open the route', paso_avion: 'Buy a plane',
    m1_segunda: 'Fly the mail to Bahía Blanca',
    m1_transbordo: 'Have {meta} letters change planes at your base',
    m1_noche_espera: 'Keep delivering until night falls',
    m1_noche: 'Make {meta} night take-offs (add beacons)',
    m1_sur: 'Deliver {meta} letters to Comodoro Rivadavia',
    m1_gallegos: 'Deliver {meta} letters to Río Gallegos',
    m1_caja: 'Earn {meta} in a single day',
    m2_pax: 'Carry {meta} passengers', m2_andes: 'Cross the Andes: {meta} deliveries to Santiago', m2_red: 'Have {meta} cities with flights',
    m2_cauquen: 'Get a Cauquén flying', m2_conexiones: 'Have {meta} travellers or letters change planes at your base', m2_caja: 'Earn {meta} in a single day',
    m3_jet: 'Get a Halcón flying', m3_carga: 'Carry {meta} tons of cargo', m3_continente: 'Deliver {n} each to Lima, Bogotá and São Paulo',
    m3_ronda: 'Get {meta}% of one night’s mail there by early morning', m3_hub2: 'Have {meta} change planes in São Paulo',
    m3_contratos: 'Complete {meta} special orders', m3_caja1: 'Earn {meta} in a single day', m3_caja2: 'Earn {meta} in a single day', m3_caja3: 'Earn {meta} in a single day',
    pista_m1_transbordo: 'Letters from Montevideo to Bahía Blanca pass through your base by themselves. More flights, more letters.',
    pista_m1_noche: 'Pick a route and add beacons. At night, those planes keep flying.',
    pista_m1_sur: 'Comodoro is far away: get there through Bahía Blanca, with one stop.',
    pista_m1_gallegos: 'Open the route from Comodoro Rivadavia to Río Gallegos and add a plane.',
    pista_m1_caja: 'Add cities and planes: every new city brings more letters to your whole network.',
    pista_noche: 'It is night and your planes are asleep. With beacons on the route, they fly anyway.',
    pista_generica: '{Toca} “Next step” and follow the tip.',
    s_ruta: 'Open a route to {b}', s_avion: 'Add a plane to {ruta}', s_faros: 'Add beacons to {ruta}', s_base: 'Make the {ap} mail centre bigger',
    s_salida: 'Make planes on {ruta} leave fuller', s_encargo: 'Accept a special order', s_vender: 'Sell a plane that is losing money',
    s_vender2: 'Sell a spare plane on {ruta}', s_ordenar: 'Your base asks: what goes first?', s_juntar: 'Save {falta} more for {que}',
    s_acelerar: 'Speed up time while your network works', s_esperar: 'Your planes work by themselves. Watch your money grow.',
    que_avion: 'the {avion}', que_faros: 'the beacons', que_base: 'a bigger mail centre', que_ruta: 'the route to {ciudad}',
    rutaA: 'the route to {ciudad}', rutaEntre: '{a} – {b}',
    tuBase: 'Your base', esperan: 'waiting to travel', nadaEspera: 'Nothing waiting right now', abrirRuta: 'Open route', desde: 'from {ciudad}',
    kmVuelo: '{km} km flight', sinConexion: 'No plane can reach this city yet.', escala: 'Too far. Reach {ciudad} first.',
    faltaPlata: 'You need {monto} more', muyLejos: 'None of your planes can fly that far ({km} km).', rutasDeAca: 'Routes from here',
    aviones1: '1 plane', avionesN: '{n} planes', sinAvion: 'no plane', baseExplica: 'Here letters change planes to continue their trip.',
    baseRitmo: 'Your mail centre sorts up to <b>{n}</b> per hour.', baseCola: '{n} waiting to change planes', agrandar: 'Make it bigger',
    baseMax: 'Your mail centre is already the biggest.', sumarAvion: 'Add a plane', ponerFaros: 'Add beacons', conFaros: 'Has beacons: flies at night',
    farosExplica: 'Lights on the ground for flying at night.', sinFaros: 'No beacons: no take-offs at night', cuandoSale: 'When does the plane leave?',
    sale0: 'Now', sale30: 'With some', sale60: 'Half full', sale90: 'Full', salePista0: 'Leaves at once, even if nearly empty.',
    salePista30: 'Waits up to 2 hours to gather more letters.', salePista60: 'Waits up to 4 hours. Usually the best.',
    salePista90: 'Waits until full. Letters may arrive late.', ganoRuta: 'This route earned', perdioRuta: 'This route lost',
    cerrarRuta: 'Close this route', cerrarRutaPregunta: 'Close the route? Its planes will be sold.', porHora: 'per hour',
    elegiAvion: 'Choose a plane', paraRuta: 'for {ruta}', comprar: 'Buy', lleva: 'Carries', velocidad: 'Speed', alcance: 'Flies up to',
    noLlega: 'Cannot reach: this route is {km} km', bloqueado: 'Not for sale yet', reservaTxt: 'Keep some money for fuel',
    volando: 'Flying to {ciudad}', conCarga: 'with {n} {u}', vacio: 'empty', cargando: 'Loading in {ciudad}', esperaCarga: 'Waiting for more letters in {ciudad}',
    esperaNoche: 'Asleep in {ciudad}: no night take-offs without beacons', esperaTormenta: 'Waiting in {ciudad} for the storm to pass',
    esperaVacio: 'In {ciudad}, nothing to carry', gano: 'Earned so far', viajes: '{n} trips', seguirCam: 'Follow it with the camera', vender: 'Sell',
    a_golondrina: 'Small and cheap. Great for short trips.', a_tero: 'Faster, and it flies farther.',
    a_chaja: 'Carries passengers and flies at night.', a_cauquen: 'Four engines to cross half the continent.',
    a_petrel: 'Nimble and thrifty on medium trips.', a_halcon: 'A jet: very fast, lots of seats.', a_cormoran: 'A giant, just for cargo.',
    avionNuevo: 'New plane for sale!',
    c_cartas_t: 'Letters and parcels', c_cartas: 'What you carry. Every delivery pays you.',
    c_ruta_t: 'Route', c_ruta: 'The path between two cities. Your planes fly along it.',
    c_avion_t: 'Plane', c_avion: 'Goes back and forth on its route by itself, carrying letters.',
    c_base_t: 'Base', c_base: 'Buenos Aires. Here letters change planes to continue their trip.',
    c_faros_t: 'Beacons', c_faros: 'Lights on the ground. With beacons, your planes fly at night too.',
    c_mision_t: 'Mission', c_mision: 'What the story asks of you. Complete it to win a prize.',
    c_encargo_t: 'Special order', c_encargo: 'A special request with a deadline and an extra prize.',
    c_ganancia_t: 'Today’s profit', c_ganancia: 'What came in minus what you spent today.',
    mo_base_t: 'Your base at work', mo_base: 'Letters from Montevideo to Bahía Blanca change planes in Buenos Aires, by themselves.',
    mo_tarde_t: 'Night is coming', mo_tarde: 'Your planes cannot fly in the dark yet.',
    mo_noche_t: 'Night has fallen', mo_noche: 'Without beacons on the route, your planes sleep until sunrise.',
    mo_faros_t: 'Beacons are on!', mo_faros: 'This route now works at night too.',
    mo_despegueNoche_t: 'First night flight', mo_despegueNoche: 'While others sleep, your mail keeps flying.',
    mo_encargo_t: 'A special order arrived', mo_encargo: 'A request with a prize. Accept it if your planes can reach.',
    mo_tormenta_t: 'A storm is coming', mo_tormenta: 'Planes in {lista} will wait on the ground.',
    mo_tormentaFin: 'The storm has passed. Back to flying.',
    mo_ciudades_t: 'New cities', mo_ciudades: 'You can now fly to {lista}.',
    mo_venta: 'You ran out of money: a losing plane was sold ({monto}).',
    mo_ordenar_t: 'What goes first?', mo_ordenar: 'Letters arrived for two cities. The ones going farther are in more of a hurry.',
    mo_ordenado: 'Your base sorted the mail: {pct} arrived on time. +{monto}',
    mo_ronda: 'Tonight your base works by itself.', mo_rondaFin: 'Last night {pct} of the mail arrived by early morning.',
    mo_perdio: 'That flight left nearly empty and lost money.',
    ausente_t: 'While you were away', ausente: 'Your network kept working.', cobrar: 'Collect',
    cap1: 'Chapter 1 · The southern mail', cap2: 'Chapter 2 · Passengers', cap3: 'Chapter 3 · Jets and cargo',
    cap2Texto: 'March 1946. Planes now fly at night and people want to travel.',
    cap3Texto: 'January 1970. Jets and cargo arrive: the whole continent opens up.',
    finCap: 'Chapter complete!', finHistoria: 'You finished the story!', finHistoriaTxt: 'Your network covers the continent. You can keep playing with special orders.',
    st_cartas: 'letters delivered', st_pax: 'passengers', st_ton: 'tons', st_km: 'km flown', st_tiempo: 'arrived on time',
    mejorRuta: 'Your best route: {ruta} ({monto})', irCap: 'Go to chapter {n}', seguirAca: 'Stay a little longer',
    dato1: 'True fact: in 1930 the southern airmail reached Río Gallegos.',
    dato2: 'True fact: in 1946 an Argentine airline flew to Europe for the first time.',
    dato3: 'True fact: in 1970 the first wide-body airliner flew with passengers.',
    errorTitulo: 'Something went wrong', errorTexto: 'You can continue from the last save or start over.', errorSeguir: 'Continue from the save',
    sinGuardado: 'This browser will not let the game be saved.',
    toca: 'tap', Toca: 'Tap', clic: 'click', Clic: 'Click',
  },
};

let idioma = 'es', tactil = false;
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
function inicial() {
  const pedido = q.get('lang');
  if (pedido === 'es' || pedido === 'en') return pedido;
  try { const g = localStorage.getItem('hubnocturno.v2.idioma'); if (g === 'es' || g === 'en') return g; } catch { /* sin almacenamiento */ }
  return (typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
}
idioma = inicial();
export const lengua = () => idioma;
export function cambiarLengua() {
  idioma = idioma === 'es' ? 'en' : 'es';
  try { localStorage.setItem('hubnocturno.v2.idioma', idioma); } catch { /* sin almacenamiento */ }
  if (typeof document !== 'undefined') document.documentElement.lang = idioma;
  return idioma;
}
export function fijarTactil(v) { tactil = v; }
export function t(clave, vars = {}) {
  let s = T[idioma][clave] ?? T.es[clave] ?? clave;
  const v = { toca: T[idioma][tactil ? 'toca' : 'clic'], Toca: T[idioma][tactil ? 'Toca' : 'Clic'], ...vars };
  return s.replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
}
export const hay = (clave) => T[idioma][clave] != null || T.es[clave] != null;
const loc = () => (idioma === 'es' ? 'es-AR' : 'en-US');
export function numero(n, dec = 0) { return Number(n).toLocaleString(loc(), { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
export function plata(n) { const v = Math.round(n); return `${v < 0 ? '−' : ''}$ ${numero(Math.abs(v))}`; }
export const plataSigno = (n) => (Math.round(n) > 0 ? '+' : '') + plata(n);
export function fechaTexto(f) { return f.toLocaleDateString(loc(), { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }); }
export const horaTexto = (f) => f.toLocaleTimeString(loc(), { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false });
if (typeof document !== 'undefined') document.documentElement.lang = idioma;
export const TEXTOS = T;
// Glosario del juego: no más de 8 términos, cada uno con su ícono.
export const GLOSARIO = [['cartas', 'c_cartas'], ['ruta', 'c_ruta'], ['avion', 'c_avion'], ['base', 'c_base'], ['faro', 'c_faros'], ['mision', 'c_mision'], ['encargo', 'c_encargo'], ['ganancia', 'c_ganancia']];
