// Datos de ejemplo para ver la oficina sin el juego: una empresa de 12 días, 4 rutas, 5 aviones y 8 notas, con la forma
// exacta del «contrato de datos de la oficina» (diseno-carrera.md, §5). Los números son inventados pero coherentes entre sí.
// Si el juego deja su ejemplo real en src/oficina-datos-ejemplo.json, la demostración usa ese (ver demo/demo.js).
const mes = { es: 'nov', en: 'Nov' };
const fecha = (d, L) => (L === 'en' ? `${mes.en} ${d}, 1929` : `${d} de ${mes.es} de 1929`);

const T = {
  es: {
    r: ['Buenos Aires – Montevideo', 'Buenos Aires – Bahía Blanca', 'Buenos Aires – Rosario', 'Buenos Aires – Mar del Plata'],
    b: [
      ['encargo', 'Correo de Navidad para Bahía Blanca', 'Llevar 40 cartas de Montevideo a Bahía Blanca antes del día 15. Premio: $ 2.400. Ya podés: pasan por tu base.', [['aceptar', 'Aceptar'], ['rechazar', 'Ahora no']]],
      ['resultado', 'La ruta a Rosario deja menos de lo prometido', 'Prometía $ 3.100 por día y está dejando $ 1.200. Los aviones salen medio vacíos: probá que esperen más cartas antes de salir.', [['ir-ruta', 'Ver la ruta']]],
      ['nota', 'Parte de la mañana del día 12', 'Ayer entraron $ 31.700 y salieron $ 18.100: te quedaron $ 13.600. La mejor ruta fue Montevideo.', []],
      ['encargo', 'Repuestos urgentes para Mar del Plata', 'Llevar 12 paquetes de Buenos Aires a Mar del Plata antes del día 14. Premio: $ 1.300. Ya podés: tenés vuelo directo.', [['aceptar', 'Aceptar'], ['rechazar', 'Ahora no']]],
      ['resultado', 'Las luces de Montevideo ya se pagaron', 'Costaron $ 9.000. Desde que las pusiste, esa ruta deja $ 2.900 más por día: se pagaron en 3 días, como estaba previsto.', []],
      ['nota', 'Tormenta sobre el río', 'El día 9 los aviones de Montevideo esperaron dos horas en tierra. Llegaron 3 vuelos tarde.', []],
      ['resultado', 'El Tero rinde lo prometido', 'Prometía $ 4.400 por día en la ruta a Bahía Blanca y deja $ 4.600.', []],
      ['nota', 'Avión nuevo a la venta', 'Ya se puede comprar el Tero: más rápido que la Golondrina y llega más lejos.', []],
    ],
  },
  en: {
    r: ['Buenos Aires – Montevideo', 'Buenos Aires – Bahía Blanca', 'Buenos Aires – Rosario', 'Buenos Aires – Mar del Plata'],
    b: [
      ['encargo', 'Christmas mail for Bahía Blanca', 'Carry 40 letters from Montevideo to Bahía Blanca before day 15. Prize: $ 2,400. You can do it now: they pass through your base.', [['aceptar', 'Accept'], ['rechazar', 'Not now']]],
      ['resultado', 'The Rosario route earns less than promised', 'It promised $ 3,100 a day and is earning $ 1,200. Planes leave half empty: try letting them wait for more letters.', [['ir-ruta', 'See the route']]],
      ['nota', 'Morning report for day 12', 'Yesterday $ 31,700 came in and $ 18,100 went out: you kept $ 13,600. Your best route was Montevideo.', []],
      ['encargo', 'Urgent spare parts for Mar del Plata', 'Carry 12 parcels from Buenos Aires to Mar del Plata before day 14. Prize: $ 1,300. You can do it now: you have a direct flight.', [['aceptar', 'Accept'], ['rechazar', 'Not now']]],
      ['resultado', 'The Montevideo lights have paid for themselves', 'They cost $ 9,000. Since you set them up, that route earns $ 2,900 more a day: they paid for themselves in 3 days, as expected.', []],
      ['nota', 'Storm over the river', 'On day 9 the Montevideo planes waited two hours on the ground. 3 flights arrived late.', []],
      ['resultado', 'The Tero earns what it promised', 'It promised $ 4,400 a day on the Bahía Blanca route and earns $ 4,600.', []],
      ['nota', 'New plane for sale', 'You can now buy the Tero: faster than the Golondrina and it reaches farther.', []],
    ],
  },
};

export function datosEjemplo(idioma = 'es', { primera = false, hora = 9.5 } = {}) {
  const L = idioma === 'en' ? 'en' : 'es', x = T[L];
  const entro = [3900, 9800, 12400, 13100, 17900, 19400, 22800, 24100, 21300, 27900, 29600, 31700];
  const salio = [3200, 6900, 7800, 8300, 11900, 12300, 13800, 14200, 15100, 16900, 17500, 18100];
  const cartas = [28, 74, 96, 101, 138, 149, 172, 181, 160, 204, 221, 235];
  const vuelos = [6, 12, 14, 14, 19, 20, 23, 23, 22, 27, 29, 30], tarde = [0, 1, 0, 1, 2, 1, 1, 0, 5, 2, 1, 1];
  return {
    empresa: primera ? { nombre: '', color: '', fundada: fecha(1, L) } : { nombre: L === 'en' ? 'Lucero Air Mail' : 'Correo Aéreo Lucero', color: '#cf3f2c', fundada: fecha(1, L) },
    hoy: { dia: 13, fecha: fecha(13, L), hora, caja: 86395, epoca: 1929 },
    dias: entro.map((e, i) => ({ n: i + 1, fecha: fecha(i + 1, L), entro: e, salio: salio[i], cartas: cartas[i], vuelos: vuelos[i], aTiempo: vuelos[i] - tarde[i], tarde: tarde[i] })),
    rutas: [
      { id: 'BUE-MVD', nombre: x.r[0], km: 205, abiertaDia: 1, luces: true, aviones: 2, entroDia: 14200, salioDia: 5900, dejaDia: 8300, cartasDia: 118, llenado: 0.81, prometido: { dejaDia: 7600, recuperoDias: 2 } },
      { id: 'BHI-BUE', nombre: x.r[1], km: 570, abiertaDia: 2, luces: false, aviones: 1, entroDia: 9800, salioDia: 5200, dejaDia: 4600, cartasDia: 52, llenado: 0.66, prometido: { dejaDia: 4400, recuperoDias: 4 } },
      { id: 'BUE-ROS', nombre: x.r[2], km: 278, abiertaDia: 5, luces: false, aviones: 1, entroDia: 5100, salioDia: 3900, dejaDia: 1200, cartasDia: 44, llenado: 0.47, prometido: { dejaDia: 3100, recuperoDias: 5 } },
      { id: 'BUE-MDQ', nombre: x.r[3], km: 385, abiertaDia: 11, luces: false, aviones: 1, entroDia: 2600, salioDia: 3100, dejaDia: -500, cartasDia: 21, llenado: 0.31, prometido: { dejaDia: 1400, recuperoDias: 9 } },
    ],
    flota: [
      { id: 1, nombre: 'Golondrina 1', tipo: 'golondrina', ruta: 'BUE-MVD', compradoDia: 1, viajes: 96, cartas: 1012, entro: 88200, salio: 37400, llenado: 0.83, estado: 'volando' },
      { id: 2, nombre: 'Golondrina 2', tipo: 'golondrina', ruta: 'BUE-MVD', compradoDia: 3, viajes: 71, cartas: 688, entro: 61300, salio: 29800, llenado: 0.78, estado: 'en tierra' },
      { id: 3, nombre: 'Tero 1', tipo: 'tero', ruta: 'BHI-BUE', compradoDia: 8, viajes: 22, cartas: 286, entro: 43100, salio: 22300, llenado: 0.66, estado: 'volando' },
      { id: 4, nombre: 'Golondrina 3', tipo: 'golondrina', ruta: 'BUE-ROS', compradoDia: 5, viajes: 34, cartas: 331, entro: 36900, salio: 28100, llenado: 0.47, estado: 'en tierra' },
      { id: 5, nombre: 'Golondrina 4', tipo: 'golondrina', ruta: 'BUE-MDQ', compradoDia: 11, viajes: 5, cartas: 42, entro: 5200, salio: 6300, llenado: 0.31, estado: 'durmiendo' },
    ],
    bandeja: x.b.map(([tipo, titulo, texto, acc], i) => ({ id: `n${i + 1}`, tipo, titulo, texto, dia: [13, 13, 13, 12, 12, 9, 11, 8][i], leido: i >= 5, acciones: acc.map(([id, txt]) => ({ id, texto: txt })) })),
    cuaderno: [],
    carrera: null,
  };
}

// Juego de mentira para la demostración: aplica las acciones sobre el ejemplo, como haría el juego de verdad.
export function juegoDeEjemplo(idioma = 'es', opciones = {}) {
  let d = datosEjemplo(idioma, opciones);
  const registro = [];
  return {
    datos: () => d,
    registro,
    accion(a) {
      registro.push(a);
      if (a.tipo === 'nombre') d = { ...d, empresa: { ...d.empresa, nombre: a.nombre, color: a.color } };
      if (a.tipo === 'leido') d = { ...d, bandeja: d.bandeja.map((n) => (n.id === a.id ? { ...n, leido: true } : n)) };
      if (a.tipo === 'bandeja') d = { ...d, bandeja: d.bandeja.map((n) => (n.id === a.id ? { ...n, leido: true, acciones: [] } : n)) };
    },
    fijarHora(h) { d = { ...d, hoy: { ...d.hoy, hora: h } }; },
  };
}
