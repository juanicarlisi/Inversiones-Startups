// Datos del juego: aeropuertos, aviones, capítulos y misiones.
// Los nombres de los aviones son propios (aves del sur), no de modelos reales. Las coordenadas son las de cada ciudad.
// "peso" mide cuánta demanda genera una ciudad (valor de juego, no un dato de población).
// "abre" (opcional): la ciudad aparece recién cuando se cumple esa misión (escalona las novedades del capítulo).

export const AEROPUERTOS = [
  // Argentina
  { id: 'BUE', nombre: 'Buenos Aires', lat: -34.60, lon: -58.38, peso: 100, cap: 1 },
  { id: 'ROS', nombre: 'Rosario', lat: -32.95, lon: -60.65, peso: 30, cap: 1, etq: 'izq' },
  { id: 'MDQ', nombre: 'Mar del Plata', lat: -38.00, lon: -57.56, peso: 12, cap: 1 },
  { id: 'BHI', nombre: 'Bahía Blanca', lat: -38.72, lon: -62.27, peso: 14, cap: 1 },
  { id: 'SAO', nombre: 'San Antonio Oeste', lat: -40.73, lon: -64.95, peso: 4, cap: 1, abre: 'm1_segunda' },
  { id: 'REL', nombre: 'Trelew', lat: -43.25, lon: -65.31, peso: 5, cap: 1, abre: 'm1_segunda' },
  { id: 'CRD', nombre: 'Comodoro Rivadavia', lat: -45.86, lon: -67.48, peso: 8, cap: 1, abre: 'm1_segunda' },
  { id: 'RGL', nombre: 'Río Gallegos', lat: -51.62, lon: -69.22, peso: 6, cap: 1, abre: 'm1_noche' },
  { id: 'COR', nombre: 'Córdoba', lat: -31.42, lon: -64.18, peso: 32, cap: 1, etq: 'arr', abre: 'm1_transbordo' },
  { id: 'MDZ', nombre: 'Mendoza', lat: -32.89, lon: -68.83, peso: 22, cap: 1, abre: 'm1_sur' },
  { id: 'NQN', nombre: 'Neuquén', lat: -38.95, lon: -68.06, peso: 8, cap: 1, abre: 'm1_sur' },
  { id: 'MVD', nombre: 'Montevideo', lat: -34.90, lon: -56.16, peso: 30, cap: 1, etq: 'der' },
  { id: 'ASU', nombre: 'Asunción', lat: -25.26, lon: -57.58, peso: 18, cap: 1, abre: 'm1_gallegos' },
  { id: 'TUC', nombre: 'Tucumán', lat: -26.82, lon: -65.22, peso: 18, cap: 2 },
  { id: 'SLA', nombre: 'Salta', lat: -24.79, lon: -65.41, peso: 14, cap: 2, etq: 'arr', abre: 'm2_pax' },
  { id: 'UAQ', nombre: 'San Juan', lat: -31.54, lon: -68.53, peso: 9, cap: 2, etq: 'arr' },
  { id: 'BRC', nombre: 'Bariloche', lat: -41.13, lon: -71.31, peso: 7, cap: 2, abre: 'm2_andes' },
  { id: 'USH', nombre: 'Ushuaia', lat: -54.80, lon: -68.30, peso: 4, cap: 2, abre: 'm2_red' },
  { id: 'RES', nombre: 'Resistencia', lat: -27.45, lon: -58.99, peso: 9, cap: 2 },
  { id: 'PSS', nombre: 'Posadas', lat: -27.37, lon: -55.90, peso: 8, cap: 2, etq: 'izq', abre: 'm2_pax' },
  { id: 'IGR', nombre: 'Iguazú', lat: -25.60, lon: -54.58, peso: 5, cap: 2, etq: 'der', abre: 'm2_red' },
  // Región
  { id: 'SCL', nombre: 'Santiago', lat: -33.45, lon: -70.67, peso: 50, cap: 2, etq: 'izq' },
  { id: 'PUQ', nombre: 'Punta Arenas', lat: -53.16, lon: -70.91, peso: 4, cap: 2, etq: 'izq', abre: 'm2_red' },
  { id: 'PMC', nombre: 'Puerto Montt', lat: -41.47, lon: -72.94, peso: 5, cap: 2, abre: 'm2_andes' },
  { id: 'POA', nombre: 'Porto Alegre', lat: -30.03, lon: -51.23, peso: 28, cap: 2, etq: 'der' },
  { id: 'SPA', nombre: 'São Paulo', lat: -23.55, lon: -46.63, peso: 120, cap: 2, etq: 'izq', abre: 'm2_pax' },
  { id: 'RIO', nombre: 'Río de Janeiro', lat: -22.91, lon: -43.17, peso: 80, cap: 2, etq: 'der', abre: 'm2_andes' },
  { id: 'ANF', nombre: 'Antofagasta', lat: -23.65, lon: -70.40, peso: 8, cap: 3 },
  { id: 'LPB', nombre: 'La Paz', lat: -16.50, lon: -68.15, peso: 20, cap: 3 },
  { id: 'LIM', nombre: 'Lima', lat: -12.05, lon: -77.04, peso: 60, cap: 3 },
  { id: 'BSB', nombre: 'Brasilia', lat: -15.79, lon: -47.88, peso: 25, cap: 3 },
  { id: 'REC', nombre: 'Recife', lat: -8.05, lon: -34.88, peso: 25, cap: 3, abre: 'm3_jet' },
  { id: 'MAO', nombre: 'Manaos', lat: -3.12, lon: -60.02, peso: 12, cap: 3, abre: 'm3_carga' },
  { id: 'UIO', nombre: 'Quito', lat: -0.18, lon: -78.47, peso: 15, cap: 3, abre: 'm3_jet' },
  { id: 'BOG', nombre: 'Bogotá', lat: 4.71, lon: -74.07, peso: 55, cap: 3, abre: 'm3_jet' },
  { id: 'CCS', nombre: 'Caracas', lat: 10.48, lon: -66.90, peso: 30, cap: 3, abre: 'm3_carga' },
  { id: 'PTY', nombre: 'Panamá', lat: 8.98, lon: -79.52, peso: 15, cap: 3, abre: 'm3_continente' },
];

// Tipos de carga. tarifa = base + porKm × km del origen al destino final (lo que paga el cliente por unidad).
// La promesa de puntualidad de cada tipo vive en modelo.js (PROMESA).
export const CARGAS = {
  correo: { base: 60, porKm: 0.3, unidad: 'saca' },
  pasajeros: { base: 120, porKm: 0.6, unidad: 'pax' }, // un pasajero con su equipaje pesa como 5 sacas: paga más
  carga: { base: 150, porKm: 0.9, unidad: 't' },
};

// Costos que no dependen del avión: tasa fija por despegue y tasa de aterrizaje por tonelada de peso máximo (por eso el ciclo de
// un avión grande cuesta más y no conviene en tramos cortos). reserva = vuelos de combustible que tienen que quedar en la caja
// después de comprar un avión (red de seguridad del novato); la mejor próxima acción deja el de 2.
export const ECONOMIA = { despegue: 400, tasaTon: 150, reservaVuelos: 1, reservaSugerencia: 2, horasReserva: 12, venta: 0.6 };

// Aviones. vel en km/h, alcance en km, giro = minutos en tierra entre vuelos, costoKm = combustible y mantenimiento por km,
// tripHora = tripulación por hora de vuelo, tierraHora = tripulación y propiedad por hora parado, ton = peso máximo (tasa de
// aterrizaje). nocturno: vuela de noche sin balizas. nicho: dónde rinde más (tramo corto o largo; correo o pasajeros).
// venta: capítulos en los que se ofrece. Capacidad y época (INFERENCIA salvo que el README cite otra cosa): la Golondrina es un
// biplano de correo de fines de los 20 (como el Latécoère 25), el Tero un monoplano de correo de 1929-1932 (como el Latécoère 28),
// el Chajá un bimotor de 21 asientos de 1936 (como el DC-3) y el Cauquén un cuatrimotor de posguerra (como el DC-4).
export const AVIONES = [
  { id: 'golondrina', nombre: 'Golondrina', clase: 'biplano', cap: 1, vel: 180, alcance: 700, giro: 50,
    lleva: { correo: 30 }, precio: 10000, costoKm: 5, tripHora: 40, tierraHora: 30, ton: 2.5, nocturno: false, forma: 'biplano',
    nicho: { tramo: 'corto', carga: 'correo' }, venta: { desde: 1, hasta: 2 } },
  { id: 'tero', nombre: 'Tero', clase: 'monoplano', cap: 1, desbloquea: 'm1_noche', vel: 230, alcance: 950, giro: 45,
    lleva: { correo: 45 }, precio: 13500, costoKm: 7.2, tripHora: 50, tierraHora: 45, ton: 3.6, nocturno: false, forma: 'mono',
    nicho: { tramo: 'largo', carga: 'correo' }, venta: { desde: 1, hasta: 2 } },
  { id: 'chaja', nombre: 'Chajá', clase: 'bimotor', cap: 2, vel: 290, alcance: 1600, giro: 40,
    lleva: { pasajeros: 21, correo: 30 }, precio: 50000, costoKm: 9.5, tripHora: 110, tierraHora: 60, ton: 11, nocturno: true, forma: 'bimotor',
    nicho: { tramo: 'corto', carga: 'pasajeros' } },
  { id: 'cauquen', nombre: 'Cauquén', clase: 'cuatrimotor', cap: 2, desbloquea: 'm2_pax', vel: 400, alcance: 4000, giro: 60,
    lleva: { pasajeros: 56, correo: 60 }, precio: 60000, costoKm: 25, tripHora: 160, tierraHora: 150, ton: 33, nocturno: true, forma: 'cuatrimotor',
    nicho: { tramo: 'largo', carga: 'pasajeros' } },
  { id: 'petrel', nombre: 'Petrel', clase: 'turbohélice', cap: 3, vel: 480, alcance: 2000, giro: 35,
    lleva: { pasajeros: 48, carga: 5 }, precio: 900000, costoKm: 12, tripHora: 220, tierraHora: 300, ton: 20, nocturno: true, forma: 'bimotor' },
  { id: 'halcon', nombre: 'Halcón', clase: 'jet', cap: 3, vel: 820, alcance: 4500, giro: 40,
    lleva: { pasajeros: 140, carga: 10 }, precio: 2500000, costoKm: 24, tripHora: 400, tierraHora: 700, ton: 52, nocturno: true, forma: 'jet' },
  { id: 'cormoran', nombre: 'Cormorán', clase: 'carguero', cap: 3, desbloquea: 'm3_jet', vel: 800, alcance: 6500, giro: 60,
    lleva: { carga: 90 }, precio: 2000000, costoKm: 30, tripHora: 420, tierraHora: 1100, ton: 150, nocturno: true, forma: 'carguero' },
];

// Centro de transbordo de cada aeropuerto: unidades por hora que puede clasificar (correo, carga) o conectar (pasajeros).
// La cola del centro admite como mucho 6 horas de su capacidad: lo que no entra se pierde.
export const TRANSBORDO = [
  { u: 8, precio: 0 },
  { u: 40, precio: 8000 },
  { u: 120, precio: 30000 },
  { u: 350, precio: 250000 },
  { u: 1000, precio: 1500000 },
  { u: 3000, precio: 7000000 },
];

// Demanda por hora entre dos ciudades conectadas: k × √(pesoA × pesoB) × factor de distancia × factor de la época
// × factor de la red (escalas y rodeo, en modelo.js).
export const DEMANDA = {
  correo: { k: 0.18 },
  pasajeros: { k: 0.45 },
  carga: { k: 0.08 },
};

// Capítulos: cada uno abre ciudades, aviones y tipos de carga, con su fecha de inicio y su dato histórico verificado.
export const CAPITULOS = [
  { n: 1, inicio: { a: 1929, m: 11, d: 1 }, cargas: { correo: 1 }, dineroInicial: 40000,
    vista: { lon0: -73, lon1: -53, lat0: -53, lat1: -24 } },
  { n: 2, inicio: { a: 1946, m: 3, d: 1 }, cargas: { correo: 1.2, pasajeros: 0.5 }, premio: 120000,
    vista: { lon0: -78, lon1: -42, lat0: -56, lat1: -20 } },
  { n: 3, inicio: { a: 1970, m: 1, d: 1 }, cargas: { correo: 1, pasajeros: 1, carga: 1 }, premio: 2000000,
    vista: { lon0: -92, lon1: -30, lat0: -57, lat1: 14 } },
];

// Misiones de historia, en orden. tipo define cómo se mide (lo resuelve modelo.js) y siempre mide servicio real desde que la
// misión se activa: rutas con avión, sacas que llegan, despegues que ocurren. meta = número a alcanzar.
//  ruta: la ruta a⇄b abierta y con al menos un avión · transbordos: unidades clasificadas en el centro de «ciudad»
//  despeguesNoche: despegues de noche por rutas iluminadas · entregasEn: unidades que llegan a destino en «ciudad»
//  entregas: unidades de «carga» entregadas · ciudadesActivas: ciudades con al menos un vuelo en el último día de juego
//  enServicio: aviones de ese tipo que ya completaron un vuelo · entregasEnTodas: «n» entregas en cada una de «ciudades»
//  mejorDia: el mejor día de ganancia alcanzado (no retrocede)
//  rondaPct: % del correo de una noche de ronda que llegó a primera hora (la mejor noche desde que se activa)
// sacas (opcional): correo que ya espera en «a» para «b» cuando la misión se activa (sale apenas la ruta tiene avión).
// avionPista (opcional): el avión que nombra la pista de la misión.
export const MISIONES = [
  { id: 'm1_primera', cap: 1, tipo: 'ruta', a: 'BUE', b: 'MVD', meta: 1, premio: 3000, sacas: 24 },
  { id: 'm1_segunda', cap: 1, tipo: 'ruta', a: 'BUE', b: 'BHI', meta: 1, premio: 5000, sacas: 24 },
  { id: 'm1_transbordo', cap: 1, tipo: 'transbordos', ciudad: 'BUE', meta: 60, premio: 8000 },
  { id: 'm1_noche', cap: 1, tipo: 'despeguesNoche', meta: 4, premio: 8000 },
  { id: 'm1_sur', cap: 1, tipo: 'entregasEn', ciudad: 'CRD', meta: 40, premio: 14000 },
  { id: 'm1_gallegos', cap: 1, tipo: 'entregasEn', ciudad: 'RGL', meta: 30, premio: 18000 },
  { id: 'm1_caja', cap: 1, tipo: 'mejorDia', meta: 115000, premio: 0, cierra: true },
  { id: 'm2_pax', cap: 2, tipo: 'entregas', carga: 'pasajeros', meta: 400, premio: 60000, avionPista: 'chaja' },
  { id: 'm2_andes', cap: 2, tipo: 'entregasEn', ciudad: 'SCL', meta: 300, premio: 60000 },
  { id: 'm2_red', cap: 2, tipo: 'ciudadesActivas', meta: 18, premio: 100000 },
  { id: 'm2_cauquen', cap: 2, tipo: 'enServicio', avion: 'cauquen', meta: 1, premio: 40000 },
  { id: 'm2_conexiones', cap: 2, tipo: 'transbordos', ciudad: 'BUE', meta: 4500, premio: 150000 },
  { id: 'm2_caja', cap: 2, tipo: 'mejorDia', meta: 1300000, premio: 0, cierra: true },
  { id: 'm3_jet', cap: 3, tipo: 'enServicio', avion: 'halcon', meta: 1, premio: 1500000 },
  { id: 'm3_carga', cap: 3, tipo: 'entregas', carga: 'carga', meta: 600, premio: 2000000, avionPista: 'cormoran' },
  { id: 'm3_continente', cap: 3, tipo: 'entregasEnTodas', ciudades: ['LIM', 'BOG', 'SPA'], n: 250, meta: 750, premio: 3000000 },
  { id: 'm3_ronda', cap: 3, tipo: 'rondaPct', meta: 75, premio: 1500000 },
  { id: 'm3_hub2', cap: 3, tipo: 'transbordos', ciudad: 'SPA', meta: 9000, premio: 2000000 },
  { id: 'm3_caja1', cap: 3, tipo: 'mejorDia', meta: 3000000, premio: 1000000 },
  { id: 'm3_caja2', cap: 3, tipo: 'mejorDia', meta: 3300000, premio: 1500000 },
  { id: 'm3_caja3', cap: 3, tipo: 'mejorDia', meta: 3600000, premio: 0, cierra: true },
];
