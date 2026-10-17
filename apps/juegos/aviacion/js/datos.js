// Datos del juego: aeropuertos, aviones, capítulos y misiones.
// Los nombres de los aviones son propios (aves del sur), no de modelos reales. Las coordenadas son las de cada ciudad.
// "peso" mide cuánta demanda genera una ciudad (valor de juego, no un dato de población).

export const AEROPUERTOS = [
  // Argentina
  { id: 'BUE', nombre: 'Buenos Aires', lat: -34.60, lon: -58.38, peso: 100, cap: 1 },
  { id: 'ROS', nombre: 'Rosario', lat: -32.95, lon: -60.65, peso: 30, cap: 1, etq: 'izq' },
  { id: 'MDQ', nombre: 'Mar del Plata', lat: -38.00, lon: -57.56, peso: 12, cap: 1 },
  { id: 'BHI', nombre: 'Bahía Blanca', lat: -38.72, lon: -62.27, peso: 12, cap: 1 },
  { id: 'SAO', nombre: 'San Antonio Oeste', lat: -40.73, lon: -64.95, peso: 4, cap: 1 },
  { id: 'REL', nombre: 'Trelew', lat: -43.25, lon: -65.31, peso: 5, cap: 1 },
  { id: 'CRD', nombre: 'Comodoro Rivadavia', lat: -45.86, lon: -67.48, peso: 7, cap: 1 },
  { id: 'RGL', nombre: 'Río Gallegos', lat: -51.62, lon: -69.22, peso: 5, cap: 1 },
  { id: 'COR', nombre: 'Córdoba', lat: -31.42, lon: -64.18, peso: 32, cap: 1, etq: 'arr' },
  { id: 'MDZ', nombre: 'Mendoza', lat: -32.89, lon: -68.83, peso: 22, cap: 1 },
  { id: 'NQN', nombre: 'Neuquén', lat: -38.95, lon: -68.06, peso: 8, cap: 1 },
  { id: 'MVD', nombre: 'Montevideo', lat: -34.90, lon: -56.16, peso: 30, cap: 1, etq: 'der' },
  { id: 'ASU', nombre: 'Asunción', lat: -25.26, lon: -57.58, peso: 18, cap: 1 },
  { id: 'TUC', nombre: 'Tucumán', lat: -26.82, lon: -65.22, peso: 18, cap: 2 },
  { id: 'SLA', nombre: 'Salta', lat: -24.79, lon: -65.41, peso: 14, cap: 2, etq: 'arr' },
  { id: 'UAQ', nombre: 'San Juan', lat: -31.54, lon: -68.53, peso: 9, cap: 2, etq: 'arr' },
  { id: 'BRC', nombre: 'Bariloche', lat: -41.13, lon: -71.31, peso: 7, cap: 2 },
  { id: 'USH', nombre: 'Ushuaia', lat: -54.80, lon: -68.30, peso: 4, cap: 2 },
  { id: 'RES', nombre: 'Resistencia', lat: -27.45, lon: -58.99, peso: 9, cap: 2 },
  { id: 'PSS', nombre: 'Posadas', lat: -27.37, lon: -55.90, peso: 8, cap: 2, etq: 'izq' },
  { id: 'IGR', nombre: 'Iguazú', lat: -25.60, lon: -54.58, peso: 5, cap: 2, etq: 'der' },
  // Región
  { id: 'SCL', nombre: 'Santiago', lat: -33.45, lon: -70.67, peso: 50, cap: 2, etq: 'izq' },
  { id: 'PUQ', nombre: 'Punta Arenas', lat: -53.16, lon: -70.91, peso: 4, cap: 2, etq: 'izq' },
  { id: 'PMC', nombre: 'Puerto Montt', lat: -41.47, lon: -72.94, peso: 5, cap: 2 },
  { id: 'POA', nombre: 'Porto Alegre', lat: -30.03, lon: -51.23, peso: 28, cap: 2, etq: 'der' },
  { id: 'SPA', nombre: 'São Paulo', lat: -23.55, lon: -46.63, peso: 120, cap: 2, etq: 'izq' },
  { id: 'RIO', nombre: 'Río de Janeiro', lat: -22.91, lon: -43.17, peso: 80, cap: 2, etq: 'der' },
  { id: 'ANF', nombre: 'Antofagasta', lat: -23.65, lon: -70.40, peso: 8, cap: 3 },
  { id: 'LPB', nombre: 'La Paz', lat: -16.50, lon: -68.15, peso: 20, cap: 3 },
  { id: 'LIM', nombre: 'Lima', lat: -12.05, lon: -77.04, peso: 60, cap: 3 },
  { id: 'BSB', nombre: 'Brasilia', lat: -15.79, lon: -47.88, peso: 25, cap: 3 },
  { id: 'REC', nombre: 'Recife', lat: -8.05, lon: -34.88, peso: 25, cap: 3 },
  { id: 'MAO', nombre: 'Manaos', lat: -3.12, lon: -60.02, peso: 12, cap: 3 },
  { id: 'UIO', nombre: 'Quito', lat: -0.18, lon: -78.47, peso: 15, cap: 3 },
  { id: 'BOG', nombre: 'Bogotá', lat: 4.71, lon: -74.07, peso: 55, cap: 3 },
  { id: 'CCS', nombre: 'Caracas', lat: 10.48, lon: -66.90, peso: 30, cap: 3 },
  { id: 'PTY', nombre: 'Panamá', lat: 8.98, lon: -79.52, peso: 15, cap: 3 },
];

// Tipos de carga. tarifa = base + porKm × km del origen al destino final (lo que paga el cliente por unidad).
export const CARGAS = {
  correo: { base: 35, porKm: 0.35, unidad: 'saca' },
  pasajeros: { base: 40, porKm: 0.35, unidad: 'pax' },
  carga: { base: 120, porKm: 1.1, unidad: 't' },
};

// Aviones. vel en km/h, alcance en km, giro = minutos en tierra entre vuelos, costoKm = combustible y mantenimiento por km,
// tripHora = tripulación por hora de vuelo, aterrizaje = tasa por aterrizaje. nocturno: vuela de noche sin balizas.
export const AVIONES = [
  { id: 'golondrina', nombre: 'Golondrina', clase: 'biplano', cap: 1, vel: 180, alcance: 700, giro: 60,
    lleva: { correo: 30 }, precio: 22000, costoKm: 2.6, tripHora: 40, aterrizaje: 80, nocturno: false, forma: 'biplano' },
  { id: 'tero', nombre: 'Tero', clase: 'monoplano', cap: 1, desbloquea: 'm1_noche', vel: 230, alcance: 950, giro: 50,
    lleva: { correo: 45 }, precio: 46000, costoKm: 3.4, tripHora: 50, aterrizaje: 90, nocturno: false, forma: 'mono' },
  { id: 'chaja', nombre: 'Chajá', clase: 'bimotor', cap: 2, vel: 290, alcance: 1600, giro: 45,
    lleva: { pasajeros: 21, correo: 30 }, precio: 160000, costoKm: 6, tripHora: 80, aterrizaje: 200, nocturno: true, forma: 'bimotor' },
  { id: 'cauquen', nombre: 'Cauquén', clase: 'cuatrimotor', cap: 2, desbloquea: 'm2_pax', vel: 420, alcance: 4000, giro: 60,
    lleva: { pasajeros: 56, correo: 60 }, precio: 620000, costoKm: 14, tripHora: 160, aterrizaje: 400, nocturno: true, forma: 'cuatrimotor' },
  { id: 'petrel', nombre: 'Petrel', clase: 'turbohélice', cap: 3, vel: 480, alcance: 2000, giro: 35,
    lleva: { pasajeros: 48, carga: 5 }, precio: 900000, costoKm: 12, tripHora: 220, aterrizaje: 600, nocturno: true, forma: 'bimotor' },
  { id: 'halcon', nombre: 'Halcón', clase: 'jet', cap: 3, vel: 820, alcance: 4500, giro: 40,
    lleva: { pasajeros: 140, carga: 10 }, precio: 2500000, costoKm: 24, tripHora: 400, aterrizaje: 1500, nocturno: true, forma: 'jet' },
  { id: 'cormoran', nombre: 'Cormorán', clase: 'carguero', cap: 3, desbloquea: 'm3_jet', vel: 800, alcance: 6500, giro: 60,
    lleva: { carga: 90 }, precio: 4500000, costoKm: 30, tripHora: 420, aterrizaje: 2000, nocturno: true, forma: 'carguero' },
];

// Centro de transbordo de cada aeropuerto: unidades por hora que puede clasificar (correo, carga) o conectar (pasajeros).
export const TRANSBORDO = [
  { u: 12, precio: 0 },
  { u: 40, precio: 15000 },
  { u: 120, precio: 90000 },
  { u: 350, precio: 450000 },
  { u: 1000, precio: 2200000 },
  { u: 3000, precio: 9000000 },
];

// Demanda por hora entre dos ciudades conectadas: k × √(pesoA × pesoB) × factor de distancia × factor de la época.
export const DEMANDA = {
  correo: { k: 0.12 },
  pasajeros: { k: 0.45 },
  carga: { k: 0.08 },
};

// Capítulos: cada uno abre ciudades, aviones y tipos de carga, con su fecha de inicio y su dato histórico verificado.
export const CAPITULOS = [
  { n: 1, inicio: { a: 1929, m: 11, d: 1 }, cargas: { correo: 1 }, dineroInicial: 40000,
    vista: { lon0: -73, lon1: -53, lat0: -53, lat1: -24 } },
  { n: 2, inicio: { a: 1946, m: 3, d: 1 }, cargas: { correo: 1.2, pasajeros: 0.3 }, premio: 150000,
    vista: { lon0: -78, lon1: -42, lat0: -56, lat1: -20 } },
  { n: 3, inicio: { a: 1970, m: 1, d: 1 }, cargas: { correo: 1, pasajeros: 1, carga: 1 }, premio: 2000000,
    vista: { lon0: -92, lon1: -30, lat0: -57, lat1: 14 } },
];

// Misiones. tipo define cómo se mide (lo resuelve modelo.js). meta = número a alcanzar.
export const MISIONES = [
  { id: 'm1_primera', cap: 1, tipo: 'ruta', a: 'BUE', b: 'BHI', meta: 1, premio: 8000 },
  { id: 'm1_sur', cap: 1, tipo: 'conectada', ciudad: 'CRD', meta: 1, premio: 15000 },
  { id: 'm1_noche', cap: 1, tipo: 'balizas', meta: 1, premio: 10000 },
  { id: 'm1_transbordo', cap: 1, tipo: 'transbordos', ciudad: 'BUE', meta: 300, premio: 20000 },
  { id: 'm1_gallegos', cap: 1, tipo: 'conectada', ciudad: 'RGL', meta: 1, premio: 30000 },
  { id: 'm1_caja', cap: 1, tipo: 'gananciaDia', meta: 150000, premio: 0, cierra: true },
  { id: 'm2_pax', cap: 2, tipo: 'entregas', carga: 'pasajeros', meta: 1500, premio: 120000 },
  { id: 'm2_andes', cap: 2, tipo: 'ruta', a: 'MDZ', b: 'SCL', meta: 1, premio: 150000 },
  { id: 'm2_red', cap: 2, tipo: 'ciudades', meta: 14, premio: 200000 },
  { id: 'm2_caja', cap: 2, tipo: 'gananciaDia', meta: 600000, premio: 0, cierra: true },
  { id: 'm3_jet', cap: 3, tipo: 'avion', avion: 'halcon', meta: 1, premio: 1000000 },
  { id: 'm3_carga', cap: 3, tipo: 'entregas', carga: 'carga', meta: 2000, premio: 2500000 },
  { id: 'm3_continente', cap: 3, tipo: 'conectadas', ciudades: ['LIM', 'BOG', 'SPA'], meta: 3, premio: 4000000 },
  { id: 'm3_caja', cap: 3, tipo: 'gananciaDia', meta: 6000000, premio: 0, cierra: true },
];
