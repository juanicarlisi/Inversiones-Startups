// escena/disposicion.ts · Andén simulador, corte 1 · P6 (escena).
// Disposición fija de la escena, en metros, calculada una vez por traza desde su GeometriaHub: dónde se dibuja cada rampa con su
// tobogán, la persona y la jaula; cada estación de inducción; cada andén con su camión; la playa; la fila de la acumulación; la mesa de
// excepción. Es solo dibujo: no cambia ningún número. Reglas:
// - Todo queda dentro de `geometria.limites` (las pruebas lo exigen para cada posición): los largos se achican al lugar disponible.
// - `lado` de una rampa: el contrato no lo define; se toma como el signo de y hacia donde sale la rampa en las rectas (así lo usan la
//   maqueta y las dos plantillas, con las rampas siempre hacia afuera). En una curva sale por la normal del lazo más cercana a ese signo.
//   Ver NOTAS-CONTRATO.md §2.
// - La geometría solo da un punto para la acumulación: la fila se dibuja como un bloque en serpentina que empieza en ese punto (lugar 0,
//   el primero en salir) y se orienta hacia donde menos choca con el lazo, las cintas y las rampas (NOTAS-CONTRATO.md §3).
import { posEnLazo, type GeometriaHub, type LazoEstadio } from '../contratos/geometria.ts';
import { normalAfuera } from './lazo.ts';
import { pasoMuestreo } from './primitivas.ts';

export type V2 = [number, number];
export interface Limites { xmin: number; ymin: number; xmax: number; ymax: number }

export interface DispRampa {
  id: string;
  s: number;
  /** Punto del lazo frente a la rampa. */
  base: V2;
  /** Hacia dónde sale (unitario) y su perpendicular (a lo ancho). */
  dir: V2;
  lat: V2;
  /** Tobogán: del borde del lazo (ini) al extremo donde la persona toma (fin). */
  ini: V2;
  fin: V2;
  persona: V2;
  jaula: V2;
  ancho: number;
  capacidad: number;
  /**
   * Distancia con signo (m) del lugar de la persona al lazo, sobre la normal hacia afuera del estadio en `s` (positiva si la rampa sale
   * hacia afuera). Es la distancia a la que corre el pasillo por el que camina la persona entre rampas (`enPasillo`).
   */
  pasillo: number;
}
export interface DispEstacion { id: string; s: number; base: V2; dir: V2; borde: V2; mano: V2; operador: V2 }
export interface DispAnden { id: string; base: V2; dirCamion: V2; lat: V2; salida: V2; camion: V2; cinta: number }
export interface DispCinta { id: string; anden: string; xy: Float64Array; acum: Float64Array; largo: number }
export interface DispFila { cabeza: V2; dirFila: V2; dirApila: V2; columnas: number; filas: number; paso: number; capacidad: number }
export interface DispPlaya { origen: V2; paso: V2 }

export interface Disposicion {
  readonly limites: Limites;
  readonly lazo: LazoEstadio;
  /** Largo disponible para las rampas hacia afuera (m): el mismo para todas, para que se vean iguales. */
  readonly alcance: number;
  readonly rampas: DispRampa[];
  readonly excepcion: DispRampa;
  /** Mesas del puesto manual (una por persona de excepción del catálogo, al menos una). */
  readonly mesas: V2[];
  readonly estaciones: DispEstacion[];
  readonly andenes: DispAnden[];
  readonly cintas: DispCinta[];
  readonly fila: DispFila;
  readonly playa: DispPlaya;
  readonly lector: V2;
  readonly camionLargo: number;
  readonly camionAncho: number;
}

const add = (a: V2, b: V2, f = 1): V2 => [a[0] + b[0] * f, a[1] + b[1] * f];
const unit = (x: number, y: number, porDefecto: V2): V2 => {
  const n = Math.sqrt(x * x + y * y);
  return n > 1e-12 ? [x / n, y / n] : porDefecto;
};

/** Distancia que se puede avanzar desde p en la dirección d sin salir de los límites (0 si p ya está afuera). */
export function alcanceHasta(lim: Limites, p: V2, d: V2): number {
  if (p[0] < lim.xmin || p[0] > lim.xmax || p[1] < lim.ymin || p[1] > lim.ymax) return 0;
  let l = Infinity;
  if (d[0] > 1e-12) l = Math.min(l, (lim.xmax - p[0]) / d[0]);
  else if (d[0] < -1e-12) l = Math.min(l, (lim.xmin - p[0]) / d[0]);
  if (d[1] > 1e-12) l = Math.min(l, (lim.ymax - p[1]) / d[1]);
  else if (d[1] < -1e-12) l = Math.min(l, (lim.ymin - p[1]) / d[1]);
  return l;
}

/** Recorta un punto a los límites (red de seguridad: con la disposición de este archivo casi nunca actúa). */
export function acotar(lim: Limites, out: Float32Array | Float64Array | number[], i = 0): void {
  const x = out[i], y = out[i + 1];
  out[i] = x < lim.xmin ? lim.xmin : x > lim.xmax ? lim.xmax : x;
  out[i + 1] = y < lim.ymin ? lim.ymin : y > lim.ymax ? lim.ymax : y;
}

function enLazo(l: LazoEstadio, s: number): V2 {
  const p = [0, 0, 0];
  posEnLazo(l, s, p);
  return [p[0], p[1]];
}

/** Dirección de salida de una rampa: la normal del lazo cuyo y tiene el signo de `lado` (en las rectas, exactamente (0, lado)). */
function dirRampa(l: LazoEstadio, s: number, lado: number): V2 {
  const n = [0, 0];
  normalAfuera(l, s, n);
  return n[1] * lado >= 0 ? [n[0], n[1]] : [-n[0], -n[1]];
}

function rampaEn(l: LazoEstadio, id: string, s: number, dir: V2, A: number, ancho: number, capacidad: number): DispRampa {
  const base = enLazo(l, s);
  const lat: V2 = [-dir[1], dir[0]];
  const n = [0, 0];
  normalAfuera(l, s, n);
  return {
    id, s, base, dir, lat, ancho, capacidad,
    ini: add(base, dir, Math.max(0.6, 0.15 * A)),
    fin: add(base, dir, 0.6 * A),
    persona: add(base, dir, 0.76 * A),
    jaula: add(base, dir, 0.92 * A),
    pasillo: (dir[0] * n[0] + dir[1] * n[1]) * 0.76 * A,
  };
}

// Memoria de trabajo de enPasillo (se llama en cada cuadro por cada persona que camina: no asigna).
const pPasillo = new Float64Array(3), pDesde: V2 = [0, 0], dHacia: V2 = [0, 0];

/**
 * Punto a la fracción f (0–1) de la caminata de una persona de rampa del lugar de la rampa `a` al de la rampa `b`, por el pasillo que
 * rodea el lazo y por el lado más corto: el mismo camino con el que el hub calcula cuánto tarda (motor 1.1.0, distancia sobre el lazo
 * = min(|sa − sb|, largo − |sa − sb|) a 1,2 m/s). Sin esto la persona cruzaba el sorter en línea recta de una recta a la otra.
 * - El avance es parejo en s: el hub mide la distancia sobre el lazo, así que a mitad del tiempo va por la mitad de esa distancia.
 * - El pasillo va a la distancia del lazo a la que se para la persona de cada rampa (interpolada entre las dos, por si una sale hacia
 *   adentro), sin pasar los límites del plano.
 * En f = 0 y f = 1 da exactamente el lugar de la persona de cada rampa. Escribe [x, y, ángulo de marcha].
 */
export function enPasillo(
  l: LazoEstadio, lim: Limites, a: DispRampa, b: DispRampa, f: number, out: Float32Array | Float64Array | number[], i = 0,
): void {
  const L = l.largo;
  let ds = ((b.s - a.s) % L + L) % L;
  if (ds > L / 2) ds -= L; // por el lado más corto (con empate exacto, hacia adelante)
  const g = f < 0 ? 0 : f > 1 ? 1 : f;
  const p = pPasillo;
  posEnLazo(l, a.s + ds * g, p);
  const nx = Math.sin(p[2]), ny = -Math.cos(p[2]); // normal hacia afuera (lazo antihorario)
  let off = a.pasillo + (b.pasillo - a.pasillo) * g;
  if (g > 0 && g < 1) {
    // en el medio del camino, sin salir del plano (en las puntas el lugar de la persona ya está adentro)
    const s = off >= 0 ? 1 : -1;
    pDesde[0] = p[0]; pDesde[1] = p[1]; dHacia[0] = nx * s; dHacia[1] = ny * s;
    const cabe = alcanceHasta(lim, pDesde, dHacia) - 0.05;
    if (Math.abs(off) > cabe) off = s * Math.max(0, cabe);
  }
  out[i] = p[0] + nx * off;
  out[i + 1] = p[1] + ny * off;
  out[i + 2] = ds >= 0 ? p[2] : p[2] + Math.PI;
}

/**
 * La pila del puesto manual (la excepción no tiene tope): 8 lugares a lo largo del tobogán × 5 a lo ancho por capa, y las capas se
 * apilan hacia arriba hasta PILA_CAPAS. Antes las columnas seguían hacia los costados sin límite y, con mil paquetes en la cola (una
 * noche en que muchos agotan sus vueltas), la fila salía del edificio como una línea de 60 m (revisión de la integración, I-3,
 * 23-10-2026). Desde la última capa los lugares se repiten: los paquetes quedan amontonados en el mismo bloque, y cuántos son lo dice el
 * tablero de la interfaz («N en el puesto manual»). Es solo dibujo: ningún número sale de acá.
 */
export const PILA_FILAS = 8;
export const PILA_COLUMNAS = 5;
export const PILA_CAPAS = 4;
/** Alto de cada capa de la pila (m), para la vista 2,5D. */
export const ALTURA_CAPA_PILA = 0.3;
/** Lugares distintos de la pila: desde el lugar CAPACIDAD_PILA cada paquete cae exactamente sobre otro (queda tapado). */
export const CAPACIDAD_PILA = PILA_FILAS * PILA_COLUMNAS * PILA_CAPAS;

/**
 * El tobogán de una rampa se llena como una pila de cajas (revisión de la experiencia, I-3, 30-10-2026). Antes los lugares se repartían
 * en dos columnas a lo largo de todo el tobogán: con 25 lugares en 1,05 m quedaban a 8 cm y cada caja (0,42 × 0,34 m, sprites.ts) tapaba
 * a seis vecinas, así que en la planta acercada una rampa llena se veía como una flecha de rombos encimados. Ahora entran a lo largo las
 * cajas que caben con PASO_RAMPA_LARGO, a lo ancho las que caben con PASO_RAMPA_ANCHO (hasta 3) y las capas suben ALTURA_CAPA_RAMPA
 * cada una hasta cubrir la capacidad de la rampa. Es solo dibujo: ningún número sale de acá.
 */
export const PASO_RAMPA_LARGO = 0.44;
export const PASO_RAMPA_ANCHO = 0.4;
/** Alto de cada capa de cajas en el tobogán de una rampa (m): el alto de la caja, para que en la 2,5D se apoyen una sobre otra. */
export const ALTURA_CAPA_RAMPA = 0.28;

/** Cuántas cajas entran por capa en el tobogán de una rampa: [filas a lo largo, columnas a lo ancho]. */
export function grillaRampa(r: DispRampa): [number, number] {
  const largo = Math.hypot(r.fin[0] - r.ini[0], r.fin[1] - r.ini[1]);
  return [Math.max(1, Math.floor(largo / PASO_RAMPA_LARGO)), Math.max(1, Math.min(3, Math.floor(r.ancho / PASO_RAMPA_ANCHO)))];
}

/**
 * Lugar `l` (0 = el próximo en salir) en el tobogán de una rampa: por capa, desde el extremo de la persona hacia el lazo y de un costado
 * al otro; llena la capa, sigue la de arriba (desde la última capa que pide la capacidad, los lugares se repiten). Para la excepción (sin
 * tope) es la pila de arriba. Devuelve la capa: 0…capas − 1 en las rampas (la altura es capa · ALTURA_CAPA_RAMPA) y 0…PILA_CAPAS − 1 en
 * la pila (capa · ALTURA_CAPA_PILA).
 */
export function lugarEnRampa(r: DispRampa, l: number, sinTope: boolean, out: Float32Array | Float64Array | number[], i = 0): number {
  const largo = Math.hypot(r.fin[0] - r.ini[0], r.fin[1] - r.ini[1]);
  if (!sinTope) {
    const [filas, cols] = grillaRampa(r), porCapa = filas * cols;
    const capa = Math.min(Math.ceil(Math.max(1, r.capacidad) / porCapa) - 1, Math.floor(l / porCapa));
    const m = l % porCapa, fila = Math.floor(m / cols), col = m % cols;
    const along = largo * (1 - (fila + 0.5) / filas);
    const lado = (col - (cols - 1) / 2) * (r.ancho / cols);
    out[i] = r.ini[0] + r.dir[0] * along + r.lat[0] * lado;
    out[i + 1] = r.ini[1] + r.dir[1] * along + r.lat[1] * lado;
    return capa;
  }
  // la pila del puesto manual: PILA_FILAS a lo largo × PILA_COLUMNAS a lo ancho por capa, hasta PILA_CAPAS
  const porCapa = PILA_FILAS * PILA_COLUMNAS;
  const capa = Math.min(PILA_CAPAS - 1, Math.floor(l / porCapa));
  const m = l % porCapa, fila = m % PILA_FILAS, col = Math.floor(m / PILA_FILAS);
  // cada capa corrida media celda, como una pila de cajas (en la planta 2D se ve el bloque más tupido)
  const corrido = capa % 2 === 1 ? 0.5 : 0;
  const along = largo * (1 - Math.min(PILA_FILAS - 0.5, fila + 0.5 + corrido * 0.5) / PILA_FILAS);
  // a lo ancho: 0, +1, −1, +2, −2 (en pasos de 0,4 m)
  const lado = (col === 0 ? 0 : (col % 2 === 1 ? 1 : -1) * Math.ceil(col / 2)) + corrido * (col % 2 === 1 ? -1 : 1) * 0.5;
  out[i] = r.ini[0] + r.dir[0] * along + r.lat[0] * lado * 0.4;
  out[i + 1] = r.ini[1] + r.dir[1] * along + r.lat[1] * lado * 0.4;
  return capa;
}

/** Lugar `l` de la fila de la acumulación (0 = el próximo en ir a la inducción), en serpentina. */
export function lugarEnFila(f: DispFila, l: number, out: Float32Array | Float64Array | number[], i = 0): void {
  const fila = Math.floor(l / f.columnas);
  let col = l % f.columnas;
  if (fila % 2 === 1) col = f.columnas - 1 - col;
  out[i] = f.cabeza[0] + f.dirFila[0] * col * f.paso + f.dirApila[0] * fila * f.paso;
  out[i + 1] = f.cabeza[1] + f.dirFila[1] * col * f.paso + f.dirApila[1] * fila * f.paso;
}

/** Punto a la fracción f (0–1) del largo de una cinta; escribe [x, y, ángulo]. */
export function enCinta(c: DispCinta, f: number, out: Float32Array | Float64Array | number[], i = 0): void {
  const xy = c.xy, acum = c.acum, n = acum.length;
  if (n === 1 || !(c.largo > 0)) { out[i] = xy[0]; out[i + 1] = xy[1]; out[i + 2] = 0; return; }
  const s = (f < 0 ? 0 : f > 1 ? 1 : f) * c.largo;
  let k = 1;
  while (k < n - 1 && acum[k] < s) k++;
  const seg = acum[k] - acum[k - 1];
  const g = seg > 0 ? (s - acum[k - 1]) / seg : 0;
  const x0 = xy[2 * k - 2], y0 = xy[2 * k - 1], x1 = xy[2 * k], y1 = xy[2 * k + 1];
  out[i] = x0 + (x1 - x0) * g;
  out[i + 1] = y0 + (y1 - y0) * g;
  out[i + 2] = Math.atan2(y1 - y0, x1 - x0);
}

/** Lugar `k` de la playa (camiones que esperan andén), en fila al costado de los andenes. */
export function lugarEnPlaya(p: DispPlaya, k: number, out: Float32Array | Float64Array | number[], i = 0): void {
  out[i] = p.origen[0] + p.paso[0] * k;
  out[i + 1] = p.origen[1] + p.paso[1] * k;
}

function cintaDe(c: GeometriaHub['cintas'][number]): DispCinta {
  const n = c.puntos.length;
  const xy = new Float64Array(2 * Math.max(1, n)), acum = new Float64Array(Math.max(1, n));
  for (let k = 0; k < n; k++) {
    xy[2 * k] = c.puntos[k][0];
    xy[2 * k + 1] = c.puntos[k][1];
    if (k > 0) {
      const dx = xy[2 * k] - xy[2 * k - 2], dy = xy[2 * k + 1] - xy[2 * k - 1];
      acum[k] = acum[k - 1] + Math.sqrt(dx * dx + dy * dy);
    }
  }
  return { id: c.id, anden: c.anden, xy, acum, largo: acum[Math.max(0, n - 1)] };
}

/** Cantidad de personas de excepción del catálogo (mesas del puesto manual). */
export function crearDisposicion(g: GeometriaHub, mesasExcepcion = 1): Disposicion {
  const lim: Limites = { ...g.limites };
  const l = g.lazo;
  const M = 0.25; // margen contra el borde

  // Alcance común de las rampas y de la excepción: el menor lugar disponible hacia afuera, entre 1,2 y 5 m.
  const dirs = g.rampas.map((r) => dirRampa(l, r.s, r.lado));
  const nE = [0, 0];
  normalAfuera(l, g.excepcion.s, nE);
  const dirExc: V2 = [nE[0], nE[1]];
  let A = 5;
  g.rampas.forEach((r, i) => { A = Math.min(A, alcanceHasta(lim, enLazo(l, r.s), dirs[i]) - M); });
  A = Math.min(A, alcanceHasta(lim, enLazo(l, g.excepcion.s), dirExc) - M);
  A = Math.max(1.2, Math.min(5, A));

  // Ancho de los toboganes: el 80% de la menor separación entre rampas vecinas sobre el lazo (tope 1,3 m).
  const ss = g.rampas.map((r) => r.s).concat([g.excepcion.s]).sort((a, b) => a - b);
  let sep = Infinity;
  for (let i = 1; i < ss.length; i++) if (ss[i] - ss[i - 1] > 1e-9) sep = Math.min(sep, ss[i] - ss[i - 1]);
  const ancho = Math.max(0.4, Math.min(1.3, 0.8 * sep));

  const rampas = g.rampas.map((r, i) => rampaEn(l, r.id, r.s, dirs[i], A, ancho, r.capacidad));
  const excepcion = rampaEn(l, g.excepcion.id, g.excepcion.s, dirExc, A, ancho, 0);
  const nMesas = Math.max(1, mesasExcepcion);
  const mesas: V2[] = [];
  for (let k = 0; k < nMesas; k++) mesas.push(add(add(excepcion.base, excepcion.dir, 0.8 * A), excepcion.lat, (k - (nMesas - 1) / 2) * 1.2));

  // Estaciones de inducción: hacia el lado de la acumulación.
  const acum: V2 = [g.acumulacion.x, g.acumulacion.y];
  const estaciones: DispEstacion[] = g.estaciones.map((e) => {
    const base = enLazo(l, e.s), n = [0, 0];
    normalAfuera(l, e.s, n);
    let dir: V2 = [n[0], n[1]];
    if ((acum[0] - base[0]) * dir[0] + (acum[1] - base[1]) * dir[1] < 0) dir = [-dir[0], -dir[1]];
    const esc = Math.min(1, alcanceHasta(lim, base, dir) / 1.9);
    return { id: e.id, s: e.s, base, dir, borde: add(base, dir, 0.55 * esc), mano: add(base, dir, 1.0 * esc), operador: add(base, dir, 1.55 * esc) };
  });

  const cintas = g.cintas.map(cintaDe);

  // Andenes y camiones: el camión se estaciona del lado opuesto a la cinta.
  const pre = g.andenes.map((a) => {
    const base: V2 = [a.x, a.y];
    const ci = cintas.findIndex((c) => c.anden === a.id);
    const salida: V2 = ci >= 0 ? [cintas[ci].xy[0], cintas[ci].xy[1]] : [a.x, a.y + 1];
    const dirCamion = unit(a.x - salida[0], a.y - salida[1], [0, -1]);
    return { id: a.id, base, salida, dirCamion, ci, lugar: alcanceHasta(lim, base, dirCamion) };
  });
  const lugarMin = pre.length ? Math.min(...pre.map((p) => p.lugar)) : 4;
  const camionLargo = Math.max(1.2, Math.min(3.4, lugarMin - 0.4));
  const camionAncho = Math.min(2.2, Math.max(1, camionLargo * 0.65));
  const andenes: DispAnden[] = pre.map((p) => ({
    id: p.id, base: p.base, dirCamion: p.dirCamion, lat: [-p.dirCamion[1], p.dirCamion[0]], salida: p.salida,
    camion: add(p.base, p.dirCamion, 0.2 + camionLargo / 2), cinta: p.ci,
  }));

  // Playa: al costado del andén extremo, del lado con más lugar.
  let playa: DispPlaya;
  if (andenes.length) {
    const lat = andenes[0].lat;
    const proy = (a: DispAnden) => a.base[0] * lat[0] + a.base[1] * lat[1];
    const masLat = andenes.reduce((m, a) => (proy(a) > proy(m) ? a : m), andenes[0]);
    const menosLat = andenes.reduce((m, a) => (proy(a) < proy(m) ? a : m), andenes[0]);
    const espacio = camionAncho + 0.9;
    const roomMas = alcanceHasta(lim, masLat.camion, lat), roomMenos = alcanceHasta(lim, menosLat.camion, [-lat[0], -lat[1]]);
    playa = roomMas >= roomMenos
      ? { origen: add(masLat.camion, lat, espacio * 1.5), paso: [lat[0] * espacio, lat[1] * espacio] }
      : { origen: add(menosLat.camion, lat, -espacio * 1.5), paso: [-lat[0] * espacio, -lat[1] * espacio] };
  } else {
    playa = { origen: [lim.xmin + 2, lim.ymin + 2], paso: [2.5, 0] };
  }

  const fila = filaDe(g, lim, cintas, rampas, excepcion, estaciones, andenes);
  const lector = enLazo(l, g.lector.s);
  return { limites: lim, lazo: l, alcance: A, rampas, excepcion, mesas, estaciones, andenes, cintas, fila, playa, lector, camionLargo, camionAncho };
}

/** Orienta el bloque de la fila donde menos choca (8 orientaciones; empate: la primera). */
function filaDe(
  g: GeometriaHub, lim: Limites, cintas: DispCinta[], rampas: DispRampa[], exc: DispRampa, est: DispEstacion[], andenes: DispAnden[],
): DispFila {
  const cap = Math.max(1, g.acumulacion.capacidad);
  const paso = 0.5;
  const filas = Math.max(1, Math.round(Math.sqrt(cap / 8)));
  const columnas = Math.ceil(cap / filas);
  const cabeza: V2 = [g.acumulacion.x, g.acumulacion.y];

  // Obstáculos: muestras del lazo, de las cintas (salvo el último metro, que llega a la fila), de las rampas y de las estaciones.
  const obs: number[] = [];
  // cada medio metro, con a lo sumo 4.000 muestras por recorrido (hallazgo SEG-R1: una cinta de 1e9 m colgaba la pestaña acá)
  for (let s = 0, d = pasoMuestreo(g.lazo.largo, 0.5, 4000); s < g.lazo.largo; s += d) { const p = enLazo(g.lazo, s); obs.push(p[0], p[1]); }
  for (const c of cintas) {
    for (let s = 0, d = pasoMuestreo(c.largo, 0.5, 4000); s < c.largo - 1; s += d) { const p = [0, 0, 0]; enCinta(c, s / c.largo, p); obs.push(p[0], p[1]); }
  }
  for (const r of [...rampas, exc]) for (let f = 0; f <= 1; f += 0.125) obs.push(r.base[0] + (r.jaula[0] - r.base[0]) * f, r.base[1] + (r.jaula[1] - r.base[1]) * f);
  for (const e of est) obs.push(e.operador[0], e.operador[1], e.mano[0], e.mano[1]);
  for (const a of andenes) obs.push(a.base[0], a.base[1], a.camion[0], a.camion[1]);

  const orient: [V2, V2][] = [
    [[1, 0], [0, -1]], [[-1, 0], [0, -1]], [[1, 0], [0, 1]], [[-1, 0], [0, 1]],
    [[0, -1], [1, 0]], [[0, -1], [-1, 0]], [[0, 1], [1, 0]], [[0, 1], [-1, 0]],
  ];
  let mejor = 0, puntaje = Infinity;
  orient.forEach(([df, da], k) => {
    const x2 = cabeza[0] + df[0] * (columnas - 1) * paso + da[0] * (filas - 1) * paso;
    const y2 = cabeza[1] + df[1] * (columnas - 1) * paso + da[1] * (filas - 1) * paso;
    const xa = Math.min(cabeza[0], x2) - 0.25, xb = Math.max(cabeza[0], x2) + 0.25;
    const ya = Math.min(cabeza[1], y2) - 0.25, yb = Math.max(cabeza[1], y2) + 0.25;
    let p = 0;
    if (xa < lim.xmin || xb > lim.xmax || ya < lim.ymin || yb > lim.ymax) p += 1000;
    for (let i = 0; i < obs.length; i += 2) if (obs[i] >= xa && obs[i] <= xb && obs[i + 1] >= ya && obs[i + 1] <= yb) p++;
    if (p < puntaje) { puntaje = p; mejor = k; }
  });
  return { cabeza, dirFila: orient[mejor][0], dirApila: orient[mejor][1], columnas, filas, paso, capacidad: cap };
}
