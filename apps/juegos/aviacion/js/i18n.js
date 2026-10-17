// Textos del juego en español (rioplatense) e inglés. Los portales piden inglés; el español es la casa.
const T = {
  es: {
    titulo: 'Hub Nocturno',
    subtitulo: 'Del correo aéreo a la carga del continente',
    dinero: 'Caja', porDia: 'por día', pausa: 'Pausa', vel1: 'Normal', vel3: 'Rápido',
    menu: 'Menú', idioma: 'English', sonidoSi: 'Sonido: sí', sonidoNo: 'Sonido: no', reiniciar: 'Empezar de nuevo',
    confirmarReinicio: '¿Seguro? Se borra la partida guardada.', creditos: 'Créditos', cerrar: 'Cerrar',
    acercar: 'Acercar', alejar: 'Alejar', centrar: 'Centrar',
    noche: 'noche', dia: 'día',
    inicioTitulo: 'Capítulo 1 · El correo del sur',
    inicioTexto: 'Noviembre de 1929. El correo aéreo empieza a llegar a la Patagonia. Tenés un hangar en Buenos Aires, {dinero} y un biplano por comprar. Uní el país por aire: cada saca que llega a tiempo se cobra completa.',
    inicioSabias: '¿Sabías que…? El 1 de noviembre de 1929 salió el primer vuelo del correo aéreo de Bahía Blanca a Comodoro Rivadavia, con escalas en San Antonio Oeste y Trelew.',
    empezar: 'Empezar',
    cap2Titulo: 'Capítulo 2 · Pasajeros', cap2Texto: 'Marzo de 1946. Los aviones ya vuelan de noche con instrumentos y aparecen los pasajeros. Tu red sigue en pie: sumá ciudades, cruzá la cordillera y llená los bimotores.',
    cap3Titulo: 'Capítulo 3 · Jets y carga', cap3Texto: 'Enero de 1970. Llegan los jets y la carga aérea. El continente entero se abre: el que maneja bien su hub, gana.',
    finTitulo: '¡Terminaste los tres capítulos!', finTexto: 'Tu hub mueve el continente. Podés seguir jugando y agrandando la red.',
    seguir: 'Seguir',
    ausenteTitulo: 'Mientras no estabas', ausenteTexto: 'Pasaron {horas} horas de juego. Tu red ganó {neto}.',
    ausentePerdio: 'Pasaron {horas} horas de juego. Tu red perdió {neto}: revisá las rutas en rojo.',
    cobrar: 'Cobrar', duplicar: 'Duplicar con un video',
    videoSimulado: 'Video (simulado en la versión de prueba)',
    // panel
    ayudaInicio: 'Tocá Buenos Aires y abrí tu primera ruta.',
    tusRutas: 'Tus rutas', sinRutas: 'Todavía no tenés rutas.',
    enRed: 'En tu red', sinConectar: 'Sin conectar', bloqueadaCap: 'Se abre en el capítulo {n}',
    potencial: 'Demanda si la conectás: {n} por hora', esperan: 'Esperan salir', enTransbordoTxt: 'En transbordo',
    transbordo: 'Centro de transbordo', transbordoAyuda: 'Clasifica el correo y la carga y conecta pasajeros que siguen viaje. Si no da abasto, todo llega tarde y se cobra menos.',
    capacidad: '{u} por hora', mejorar: 'Mejorar a {u}/h · {precio}', maximo: 'Nivel máximo',
    nuevaRuta: 'Nueva ruta desde acá', elegiDestino: 'Elegí el destino en el mapa', cancelar: 'Cancelar',
    rutaA: '{a} ⇄ {b}', km: '{n} km', abrirRutaPor: 'Abrir ruta · {precio}', alcanzan: 'Aviones que llegan: {lista}',
    ninguno: 'ninguno',
    demandaIda: 'Demanda {a} → {b}', porHora: '{n}/h',
    aviones: 'Aviones', comprar: 'Comprar', sinAviones: 'Sin aviones: comprá uno para que la ruta funcione.',
    estado_vuelo: 'volando a {a}', estado_tierra: 'en {a}', estado_noche: 'espera el día (sin balizas)',
    estado_carga: 'junta carga', estado_tormenta: 'tormenta', estado_vacio: 'sin carga',
    vender: 'Vender', venderPor: 'Vender por {precio}',
    balizas: 'Balizas', balizasSi: 'Ruta iluminada: el biplano vuela de noche', balizasPoner: 'Iluminar la ruta · {precio}',
    balizasAyuda: 'Sin balizas, los aviones de esta época no despegan de noche.',
    cargaMinima: 'Sale con', cargaMinimaAyuda: 'Esperar más carga llena el avión pero demora las entregas (hasta 4 h).',
    cm0: 'lo que haya', cm30: '30%', cm60: '60%', cm90: 'lleno',
    resultado: 'Resultado', ingresos: 'Ingresos', costos: 'Costos', neto: 'Neto', ocupacion: 'Ocupación', vuelos: 'Vuelos',
    cerrarRuta: 'Cerrar ruta (vende sus aviones)',
    capacidadAvion: '{cap} · {vel} km/h · {alc} km',
    // cargas
    correo: 'correo', pasajeros: 'pasajeros', carga: 'carga',
    u_correo: 'sacas', u_pasajeros: 'pax', u_carga: 't',
    // avisos
    e_plata: 'No te alcanza la plata ({precio}).', e_alcance: 'Ningún avión tuyo llega tan lejos ({km} km).',
    e_desconectada: 'La ruta tiene que salir de tu red.', e_existe: 'Esa ruta ya existe.', e_bloqueada: 'Esa ciudad se abre más adelante.',
    e_invalida: 'No se puede.', e_bloqueado: 'Ese avión todavía no está disponible.',
    rutaAbierta: 'Ruta abierta: {a} ⇄ {b}', avionComprado: '{avion} comprado', tormentaAviso: 'Tormenta: cerrados {lista}',
    misionHecha: '¡Misión cumplida! +{premio}', nuevoAvion: 'Nuevo avión disponible: {avion}',
    capituloListo: 'Capítulo terminado', siguienteCapitulo: 'Ir al capítulo {n}',
    // misiones
    m1_primera: 'Abrí la ruta Buenos Aires ⇄ Bahía Blanca',
    m1_sur: 'Llevá el correo hasta Comodoro Rivadavia',
    m1_noche: 'Iluminá una ruta con balizas para volar de noche',
    m1_transbordo: 'Transbordá {meta} sacas en Buenos Aires',
    m1_gallegos: 'Llegá a Río Gallegos',
    m1_caja: 'Ganá {meta} por día',
    m2_pax: 'Llevá {meta} pasajeros',
    m2_andes: 'Cruzá la cordillera: Mendoza ⇄ Santiago',
    m2_red: 'Conectá {meta} ciudades',
    m2_caja: 'Ganá {meta} por día',
    m3_jet: 'Comprá tu primer jet (Halcón)',
    m3_carga: 'Llevá {meta} toneladas de carga',
    m3_continente: 'Conectá Lima, Bogotá y São Paulo',
    m3_caja: 'Ganá {meta} por día',
    mision: 'Misión', premio: 'Premio {premio}',
    creditosTexto: 'Prototipo del holding. Mapa: Natural Earth (dominio público). Aviones, nombres y arte propios. Hecho con Claude.',
  },
  en: {
    titulo: 'Night Hub',
    subtitulo: 'From airmail to a continent of cargo',
    dinero: 'Cash', porDia: 'per day', pausa: 'Pause', vel1: 'Normal', vel3: 'Fast',
    menu: 'Menu', idioma: 'Español', sonidoSi: 'Sound: on', sonidoNo: 'Sound: off', reiniciar: 'Start over',
    confirmarReinicio: 'Sure? Your saved game will be erased.', creditos: 'Credits', cerrar: 'Close',
    acercar: 'Zoom in', alejar: 'Zoom out', centrar: 'Center',
    noche: 'night', dia: 'day',
    inicioTitulo: 'Chapter 1 · The southern mail',
    inicioTexto: 'November 1929. Airmail is reaching Patagonia. You have a hangar in Buenos Aires, {dinero} and a biplane to buy. Connect the country by air: every mailbag that arrives on time is paid in full.',
    inicioSabias: 'Did you know? On 1 November 1929 the first airmail flight left Bahía Blanca for Comodoro Rivadavia, stopping at San Antonio Oeste and Trelew.',
    empezar: 'Start',
    cap2Titulo: 'Chapter 2 · Passengers', cap2Texto: 'March 1946. Planes now fly at night on instruments and passengers arrive. Your network is still standing: add cities, cross the Andes and fill your twin-engines.',
    cap3Titulo: 'Chapter 3 · Jets and cargo', cap3Texto: 'January 1970. Jets and air cargo arrive. The whole continent opens up: whoever runs the best hub wins.',
    finTitulo: 'You finished all three chapters!', finTexto: 'Your hub moves the continent. Keep playing and growing your network.',
    seguir: 'Continue',
    ausenteTitulo: 'While you were away', ausenteTexto: '{horas} game hours went by. Your network earned {neto}.',
    ausentePerdio: '{horas} game hours went by. Your network lost {neto}: check the routes in red.',
    cobrar: 'Collect', duplicar: 'Double it with a video',
    videoSimulado: 'Video (simulated in the test build)',
    ayudaInicio: 'Tap Buenos Aires and open your first route.',
    tusRutas: 'Your routes', sinRutas: 'No routes yet.',
    enRed: 'In your network', sinConectar: 'Not connected', bloqueadaCap: 'Opens in chapter {n}',
    potencial: 'Demand if connected: {n} per hour', esperan: 'Waiting to depart', enTransbordoTxt: 'In transfer',
    transbordo: 'Transfer center', transbordoAyuda: 'Sorts mail and cargo and connects passengers who fly on. If it falls behind, everything arrives late and pays less.',
    capacidad: '{u} per hour', mejorar: 'Upgrade to {u}/h · {precio}', maximo: 'Max level',
    nuevaRuta: 'New route from here', elegiDestino: 'Pick the destination on the map', cancelar: 'Cancel',
    rutaA: '{a} ⇄ {b}', km: '{n} km', abrirRutaPor: 'Open route · {precio}', alcanzan: 'Planes that reach: {lista}',
    ninguno: 'none',
    demandaIda: 'Demand {a} → {b}', porHora: '{n}/h',
    aviones: 'Planes', comprar: 'Buy', sinAviones: 'No planes: buy one so the route runs.',
    estado_vuelo: 'flying to {a}', estado_tierra: 'at {a}', estado_noche: 'waiting for daylight (no beacons)',
    estado_carga: 'loading', estado_tormenta: 'storm', estado_vacio: 'no load',
    vender: 'Sell', venderPor: 'Sell for {precio}',
    balizas: 'Beacons', balizasSi: 'Lit route: biplanes fly at night', balizasPoner: 'Light the route · {precio}',
    balizasAyuda: 'Without beacons, planes of this era do not take off at night.',
    cargaMinima: 'Departs with', cargaMinimaAyuda: 'Waiting for more load fills the plane but delays deliveries (up to 4 h).',
    cm0: 'whatever', cm30: '30%', cm60: '60%', cm90: 'full',
    resultado: 'Results', ingresos: 'Revenue', costos: 'Costs', neto: 'Net', ocupacion: 'Load factor', vuelos: 'Flights',
    cerrarRuta: 'Close route (sells its planes)',
    capacidadAvion: '{cap} · {vel} km/h · {alc} km',
    correo: 'mail', pasajeros: 'passengers', carga: 'cargo',
    u_correo: 'bags', u_pasajeros: 'pax', u_carga: 't',
    e_plata: 'Not enough cash ({precio}).', e_alcance: 'None of your planes can fly that far ({km} km).',
    e_desconectada: 'The route must start in your network.', e_existe: 'That route already exists.', e_bloqueada: 'That city opens later.',
    e_invalida: 'Not possible.', e_bloqueado: 'That plane is not available yet.',
    rutaAbierta: 'Route opened: {a} ⇄ {b}', avionComprado: '{avion} bought', tormentaAviso: 'Storm: closed {lista}',
    misionHecha: 'Mission complete! +{premio}', nuevoAvion: 'New plane available: {avion}',
    capituloListo: 'Chapter complete', siguienteCapitulo: 'Go to chapter {n}',
    m1_primera: 'Open the Buenos Aires ⇄ Bahía Blanca route',
    m1_sur: 'Take the mail to Comodoro Rivadavia',
    m1_noche: 'Light a route with beacons to fly at night',
    m1_transbordo: 'Transfer {meta} mailbags in Buenos Aires',
    m1_gallegos: 'Reach Río Gallegos',
    m1_caja: 'Earn {meta} per day',
    m2_pax: 'Carry {meta} passengers',
    m2_andes: 'Cross the Andes: Mendoza ⇄ Santiago',
    m2_red: 'Connect {meta} cities',
    m2_caja: 'Earn {meta} per day',
    m3_jet: 'Buy your first jet (Halcón)',
    m3_carga: 'Carry {meta} tonnes of cargo',
    m3_continente: 'Connect Lima, Bogotá and São Paulo',
    m3_caja: 'Earn {meta} per day',
    mision: 'Mission', premio: 'Reward {premio}',
    creditosTexto: 'Holding prototype. Map: Natural Earth (public domain). Original planes, names and art. Made with Claude.',
  },
};

let idioma = 'es';
try { idioma = localStorage.getItem('hubnocturno.idioma') || ((navigator.language || 'es').startsWith('es') ? 'es' : 'en'); } catch { /* sin almacenamiento */ }

export function lengua() { return idioma; }
export function cambiarLengua() {
  idioma = idioma === 'es' ? 'en' : 'es';
  try { localStorage.setItem('hubnocturno.idioma', idioma); } catch { /* sin almacenamiento */ }
}

export function t(clave, vars = {}) {
  let s = T[idioma][clave] ?? T.es[clave] ?? clave;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

export function plata(n) {
  const v = Math.round(n);
  const abs = Math.abs(v);
  const loc = idioma === 'es' ? 'es-AR' : 'en-US';
  const txt = abs >= 1e6 ? `${(abs / 1e6).toLocaleString(loc, { maximumFractionDigits: 2 })} M` : abs.toLocaleString(loc);
  return `${v < 0 ? '−' : ''}$ ${txt}`;
}

export function numero(n, dec = 0) {
  return Number(n).toLocaleString(idioma === 'es' ? 'es-AR' : 'en-US', { maximumFractionDigits: dec, minimumFractionDigits: 0 });
}

export function fechaTexto(f) {
  return f.toLocaleDateString(idioma === 'es' ? 'es-AR' : 'en-US', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + f.toLocaleTimeString(idioma === 'es' ? 'es-AR' : 'en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false });
}
