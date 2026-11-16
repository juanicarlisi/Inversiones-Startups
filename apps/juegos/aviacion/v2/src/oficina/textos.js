// Textos de la oficina en español rioplatense y en inglés. Las mismas reglas que el resto del juego: palabras de un chico de
// 12 años, una idea por frase, lo esencial primero. Cartas y paquetes, base, ruta, luces. Nunca jerga del oficio.
// (pruebas/oficina.test.mjs comprueba los pares es/en, la jerga y los largos.)
export const TEXTOS_OFICINA = {
  es: {
    // marco
    oficina: 'Tu oficina', salir: 'Volver al mapa', relojQuieto: 'El reloj espera', cerrar: 'Cerrar', volverOficina: 'Volver a la oficina',
    pista: 'Esta es tu oficina. {Toca} lo que quieras ver.', enCajaCorto: 'En la caja',
    toca: 'tocá', Toca: 'Tocá', clic: 'hacé clic en', Clic: 'Hacé clic en',
    // los objetos y lo que hay detrás de cada uno
    o_mapa: 'Tu red', o_mapa_s: 'Rutas y ciudades',
    o_libro: 'Las cuentas', o_libro_s: 'Entró, salió y quedó',
    o_flota: 'Tus aviones', o_flota_s: 'Qué hace cada uno',
    o_bandeja: 'Bandeja', o_bandeja_s: '{n} sin leer', o_bandeja_s0: 'Nada nuevo',
    o_cuaderno: 'Cuaderno', o_cuaderno_s: 'Lo que aprendiste',
    o_placa: 'Tu empresa', o_placa_s: 'Nombre y color',
    // mapa de pared y placa (lo que va escrito en los objetos)
    mapaTitulo: 'Tu red', mapaSub: 'Rutas de correo aéreo', mapaPie: 'Buenos Aires · {epoca}', placaPie: 'Buenos Aires · {epoca}', puerta: 'Dirección',
    libroPagina1: 'Caja', libroPagina2: 'Correo', diaCorto: 'Día',
    // hoja: tu red
    redResumen1: '1 ruta', redResumenN: '{n} rutas', redDeja: 'Entre todas dejan <b>{monto}</b> por día', redPierde: 'Entre todas pierden <b>{monto}</b> por día',
    redVacia_t: 'Todavía no hay rutas', redVacia: 'Cuando abras tu primera ruta, va a aparecer acá con su hilo en el mapa.',
    dejaDia: 'Deja por día', pierdeDia: 'Pierde por día', porDia: 'por día',
    llenado: 'Los aviones salen', lleno: '{pct} llenos',
    conLuces: 'Con luces: vuela de noche', sinLuces: 'Sin luces: de noche no vuela',
    avion1: '1 avión', avionesN: '{n} aviones', sinAvion: 'Sin avión', cartasDia: '{n} cartas por día', kmRuta: '{km} km',
    prometio: 'Prometía', deja: 'Deja', cumple: 'Cumple lo prometido', cumpleMas: 'Deja más de lo prometido', cumpleMenos: 'Deja menos de lo prometido',
    rutaNueva: 'Es nueva: en {n} días vas a saber si cumple', rutaNueva1: 'Es nueva: mañana vas a saber si cumple', sinPromesa: 'Abierta el día {n}',
    laMejor: 'La que más deja', laPeor: 'La que menos deja', verRuta: 'Verla en el mapa',
    // hoja: las cuentas
    enCaja: 'En la caja', entro: 'Entró', salio: 'Salió', quedo: 'Quedó', diaN: 'Día {n}',
    ultimos: 'Lo que quedó cada día', graficoAyuda: '{Toca} una barra para ver ese día.',
    cartas: 'Cartas', cartasLlevadas: 'Cartas llevadas', enDias: 'en {n} días', en1Dia: 'en 1 día',
    vuelos: 'Vuelos', aTiempo: 'a tiempo', tarde: 'tarde', aTiempoCorto: 'A tiempo', tardeCorto: 'Tarde', deCada10: '{n} de cada 10 llegaron a tiempo', casiTodas: 'Casi todo llegó a tiempo', todasATiempo: 'Todo llegó a tiempo',
    quedoTotal: 'En {dias} te quedaron', perdioTotal: 'En {dias} perdiste',
    libroVacio_t: 'El libro está en blanco', libroVacio: 'Cada mañana se anota acá el día anterior. Volvé mañana.',
    // hoja: tus aviones
    flota1: '1 avión', flotaN: '{n} aviones', flotaVacia_t: 'El estante está vacío', flotaVacia: 'Cada avión que compres va a tener su modelo acá.',
    e_volando: 'Volando', e_tierra: 'En tierra', e_durmiendo: 'Durmiendo', enRuta: 'Ruta', sinRuta: 'Sin ruta',
    viajes: 'Viajes', cartasAvion: 'Cartas', gano: 'Ganó', perdio: 'Perdió', saleLleno: 'Sale {pct} lleno', tuyoDesde: 'Tuyo desde el día {n}',
    verAvion: 'Verlo en el mapa',
    // hoja: bandeja
    sinLeer1: '1 sin leer', sinLeerN: '{n} sin leer', todoLeido: 'Todo leído',
    bandejaVacia_t: 'La bandeja está vacía', bandejaVacia: 'Acá llegan los encargos, los resultados de lo que compraste y las notas.',
    tipo_encargo: 'Encargo', tipo_resultado: 'Resultado', tipo_nota: 'Nota', tipo_propuesta: 'Propuesta',
    yaLei: 'Ya lo leí', leido: 'Leído', leerTodo: 'Marcar todo como leído',
    // hoja: cuaderno
    cuadernoNuevo_t: 'Cuaderno nuevo', cuadernoNuevo: 'Todavía está en blanco. Acá vas a ir anotando lo que aprendas llevando el correo.',
    est_vivido: 'Lo viviste', est_usado: 'Lo usaste', est_dominado: 'Lo dominás', aprendido1: '1 cosa anotada', aprendidoN: '{n} cosas anotadas',
    // hoja: tu empresa
    nombre: 'Nombre', color: 'Color', guardar: 'Guardar', guardado: 'Guardado', fundada: 'Fundada el {fecha}', nombreAyuda: 'Va grabado en la placa de tu escritorio.',
    nombreDefecto: 'Correo Aéreo Lucero',
    tuTitulo: 'Tu título', loQueSigue: 'Lo que sigue', teFalta: 'Te falta',
    c_rojo: 'Rojo correo', c_azul: 'Azul noche', c_verde: 'Verde botella', c_naranja: 'Naranja', c_celeste: 'Celeste', c_violeta: 'Violeta', c_oro: 'Oro viejo', c_gris: 'Gris pizarra',
    notaPrometido: 'Prometido', notaPaso: 'Pasó', masViejas: 'Ver {n} más', cartasATiempo: 'Cartas a tiempo', hoyCorto: 'Hoy', hoyVa: 'Hoy, hasta ahora',
    // primera vez (dos frases, el nombre y un recorrido de tres toques)
    p_frase1: 'Tu correo ya vuela.', p_frase2: 'Una empresa de verdad tiene su oficina. Pasá: esta es la tuya.',
    p_nombre_t: '¿Cómo se llama tu empresa?', p_nombre: 'El nombre va en la placa del escritorio. Lo podés cambiar cuando quieras.', p_color: 'Elegí su color', p_listo: 'Poner la placa',
    r_mapa: '<b>El mapa.</b> Cada hilo es una ruta tuya. Acá ves cuál deja más.',
    r_libro: '<b>El libro.</b> Lo que entró, lo que salió y lo que te quedó cada día.',
    r_flota: '<b>El estante.</b> Un modelo por cada avión. Acá ves qué hace cada uno.',
    r_paso: '{n} de 3', siguiente: 'Siguiente', listo: 'Listo', saltar: 'Saltar',
  },
  en: {
    oficina: 'Your office', salir: 'Back to the map', relojQuieto: 'The clock waits', cerrar: 'Close', volverOficina: 'Back to the office',
    pista: 'This is your office. {Toca} anything you want to see.', enCajaCorto: 'In the cash box',
    toca: 'tap', Toca: 'Tap', clic: 'click', Clic: 'Click',
    o_mapa: 'Your network', o_mapa_s: 'Routes and cities',
    o_libro: 'The accounts', o_libro_s: 'In, out and kept',
    o_flota: 'Your planes', o_flota_s: 'What each one is doing',
    o_bandeja: 'In-tray', o_bandeja_s: '{n} unread', o_bandeja_s0: 'Nothing new',
    o_cuaderno: 'Notebook', o_cuaderno_s: 'What you learned',
    o_placa: 'Your company', o_placa_s: 'Name and color',
    mapaTitulo: 'Your network', mapaSub: 'Air mail routes', mapaPie: 'Buenos Aires · {epoca}', placaPie: 'Buenos Aires · {epoca}', puerta: 'Manager',
    libroPagina1: 'Cash', libroPagina2: 'Mail', diaCorto: 'Day',
    redResumen1: '1 route', redResumenN: '{n} routes', redDeja: 'Together they earn <b>{monto}</b> a day', redPierde: 'Together they lose <b>{monto}</b> a day',
    redVacia_t: 'No routes yet', redVacia: 'When you open your first route, it will show up here with its thread on the map.',
    dejaDia: 'Earns per day', pierdeDia: 'Loses per day', porDia: 'a day',
    llenado: 'Planes leave', lleno: '{pct} full',
    conLuces: 'With lights: flies at night', sinLuces: 'No lights: no night flights',
    avion1: '1 plane', avionesN: '{n} planes', sinAvion: 'No plane', cartasDia: '{n} letters a day', kmRuta: '{km} km',
    prometio: 'Promised', deja: 'Earns', cumple: 'Earns what it promised', cumpleMas: 'Earns more than promised', cumpleMenos: 'Earns less than promised',
    rutaNueva: 'It is new: in {n} days you will know if it delivers', rutaNueva1: 'It is new: tomorrow you will know if it delivers', sinPromesa: 'Opened on day {n}',
    laMejor: 'Your best earner', laPeor: 'Your lowest earner', verRuta: 'See it on the map',
    enCaja: 'In the cash box', entro: 'Came in', salio: 'Went out', quedo: 'Kept', diaN: 'Day {n}',
    ultimos: 'What you kept each day', graficoAyuda: '{Toca} a bar to see that day.',
    cartas: 'Letters', cartasLlevadas: 'Letters carried', enDias: 'in {n} days', en1Dia: 'in 1 day',
    vuelos: 'Flights', aTiempo: 'on time', tarde: 'late', aTiempoCorto: 'On time', tardeCorto: 'Late', deCada10: '{n} out of 10 arrived on time', casiTodas: 'Almost everything arrived on time', todasATiempo: 'Everything arrived on time',
    quedoTotal: 'In {dias} you kept', perdioTotal: 'In {dias} you lost',
    libroVacio_t: 'The book is blank', libroVacio: 'Each morning the day before is written down here. Come back tomorrow.',
    flota1: '1 plane', flotaN: '{n} planes', flotaVacia_t: 'The shelf is empty', flotaVacia: 'Every plane you buy will get its model here.',
    e_volando: 'Flying', e_tierra: 'On the ground', e_durmiendo: 'Sleeping', enRuta: 'Route', sinRuta: 'No route',
    viajes: 'Trips', cartasAvion: 'Letters', gano: 'Earned', perdio: 'Lost', saleLleno: 'Leaves {pct} full', tuyoDesde: 'Yours since day {n}',
    verAvion: 'See it on the map',
    sinLeer1: '1 unread', sinLeerN: '{n} unread', todoLeido: 'All read',
    bandejaVacia_t: 'The tray is empty', bandejaVacia: 'Special orders, the results of what you bought and notes all arrive here.',
    tipo_encargo: 'Special order', tipo_resultado: 'Result', tipo_nota: 'Note', tipo_propuesta: 'Offer',
    yaLei: 'I read it', leido: 'Read', leerTodo: 'Mark everything as read',
    cuadernoNuevo_t: 'A new notebook', cuadernoNuevo: 'It is still blank. This is where you will write down what you learn flying the mail.',
    est_vivido: 'You lived it', est_usado: 'You used it', est_dominado: 'You mastered it', aprendido1: '1 thing written down', aprendidoN: '{n} things written down',
    nombre: 'Name', color: 'Color', guardar: 'Save', guardado: 'Saved', fundada: 'Founded on {fecha}', nombreAyuda: 'It is engraved on the plate on your desk.',
    nombreDefecto: 'Lucero Air Mail',
    tuTitulo: 'Your title', loQueSigue: 'What comes next', teFalta: 'Still to go',
    c_rojo: 'Mail red', c_azul: 'Night blue', c_verde: 'Bottle green', c_naranja: 'Orange', c_celeste: 'Sky blue', c_violeta: 'Violet', c_oro: 'Old gold', c_gris: 'Slate grey',
    notaPrometido: 'Promised', notaPaso: 'Happened', masViejas: 'See {n} more', cartasATiempo: 'Letters on time', hoyCorto: 'Today', hoyVa: 'Today, so far',
    p_frase1: 'Your mail is flying.', p_frase2: 'A real company has its own office. Come in: this one is yours.',
    p_nombre_t: 'What is your company called?', p_nombre: 'The name goes on the plate on your desk. You can change it whenever you like.', p_color: 'Pick its color', p_listo: 'Set the plate',
    r_mapa: '<b>The map.</b> Each thread is one of your routes. See which one earns the most.',
    r_libro: '<b>The book.</b> What came in, what went out and what you kept each day.',
    r_flota: '<b>The shelf.</b> One model for every plane. See what each one is doing.',
    r_paso: '{n} of 3', siguiente: 'Next', listo: 'Done', saltar: 'Skip',
  },
};

// Colores de la empresa: los mismos ocho que ofrece el juego (main.js, COLORES), para que la librea de los aviones, la barra
// y la oficina digan lo mismo. El primero es el de fábrica (COLOR_EMPRESA en mundo/aviones.js).
export const COLORES_EMPRESA = [
  ['c_rojo', '#cf3f2c'], ['c_azul', '#27457f'], ['c_verde', '#2f7d4f'], ['c_naranja', '#e2762b'],
  ['c_celeste', '#3b8fc4'], ['c_violeta', '#6a4fa3'], ['c_oro', '#c9982b'], ['c_gris', '#6d7887'],
];
export const LARGO_NOMBRE = 24;       // el juego recorta el nombre a 24 letras
export const COLOR_DEFECTO = COLORES_EMPRESA[0][1];

// Traductor y formatos para un idioma. tactil: en pantallas de dedo se dice «tocá»; con mouse, «hacé clic en».
export function crearTextos(idioma = 'es', tactil = false) {
  const L = TEXTOS_OFICINA[idioma] ? idioma : 'es', T = TEXTOS_OFICINA[L], loc = L === 'en' ? 'en-US' : 'es-AR';
  const t = (clave, vars = {}) => {
    let s = T[clave] ?? TEXTOS_OFICINA.es[clave] ?? clave;
    s = s.replace('{Toca}', tactil ? T.Toca : T.Clic).replace('{toca}', tactil ? T.toca : T.clic);
    return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  };
  const numero = (n) => Math.round(Number(n) || 0).toLocaleString(loc);
  const plata = (n) => { const v = Math.round(Number(n) || 0); return `${v < 0 ? '−' : ''}$ ${numero(Math.abs(v))}`; };
  const plataSigno = (n) => (Math.round(Number(n) || 0) > 0 ? '+' : '') + plata(n);
  const pct = (x) => `${Math.round(limitar01(x) * 100)} %`;
  const dias = (n) => (n === 1 ? t('en1Dia') : t('enDias', { n }));
  return { t, numero, plata, plataSigno, pct, dias, idioma: L };
}
const limitar01 = (x) => Math.max(0, Math.min(1, Number(x) || 0));

// La hora del contrato puede venir como número (9.5) o como texto («09:30»).
export function horaNumero(h, defecto = 9) {
  if (typeof h === 'number' && Number.isFinite(h)) return ((h % 24) + 24) % 24;
  const m = String(h ?? '').match(/(\d{1,2})[:.h](\d{2})/);
  if (m) return (+m[1] + +m[2] / 60) % 24;
  const n = parseFloat(h);
  return Number.isFinite(n) ? ((n % 24) + 24) % 24 : defecto;
}
export function horaTexto(h) { const x = horaNumero(h), hh = Math.floor(x), mm = Math.floor((x - hh) * 60 + 1e-6); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; }
