// Ayudas compartidas por las pruebas de explicacion/ (no es una prueba). Todo con semilla fija; nada depende del reloj.
//  · ConstructorTraza: arma a mano una Traza válida (tramos, momentos, paquetes, catálogo y geometría) para probar cada causa.
//  · viaje(): el recorrido de un paquete paso a paso, con el reloj corriendo.
//  · simulador falso, variante falsa (parche 'replace') y un generador pseudoaleatorio propio (nada de azar nativo).
import { readFileSync } from 'node:fs';
import { Causa, ClaseEntidad, TipoTramo, refDe } from '../../contratos/traza.ts';
import type { Catalogo, Traza } from '../../contratos/traza.ts';
import type { GeometriaHub } from '../../contratos/geometria.ts';
import type { Modelo, ModeloValidado, OpParche, Variante } from '../../contratos/modelo.ts';
import type { Simulador } from '../../contratos/experimentos.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';

export const MIN = 60000;
/** 22:00, el inicio del turno de los modelos de ejemplo, en ms. */
export const H22 = 22 * 60 * MIN;
export const hm = (h: number, m = 0): number => (h * 60 + m) * MIN;

export function modeloEjemplo(): Modelo {
  return JSON.parse(readFileSync(new URL('../../contratos/ejemplos/hub-chico.json', import.meta.url), 'utf8')) as Modelo;
}
export function validadoEjemplo(m: Modelo = modeloEjemplo()): ModeloValidado {
  return validadoSinChequeos(m);
}

/** Generador pseudoaleatorio mulberry32: la misma semilla da siempre la misma secuencia (sin azar nativo). */
export function generador(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CATALOGO_BASE: Catalogo = {
  personas: [
    { id: 'P-I1', rol: 'induccion' }, { id: 'P-I2', rol: 'induccion' },
    { id: 'P-R1', rol: 'rampa' }, { id: 'P-R2', rol: 'rampa' }, { id: 'P-R3', rol: 'rampa' },
    { id: 'P-X1', rol: 'excepcion' }, { id: 'P-T1', rol: 'reten' }, { id: 'P-D1', rol: 'descarga' },
  ],
  camiones: [{ id: 'T01', turno: H22 }, { id: 'T02', turno: H22 + 15 * MIN }, { id: 'T03', turno: H22 + 30 * MIN }],
  rutas: ['Ruta 01', 'Ruta 02', 'Ruta 03'],
  rampas: ['R01', 'R02', 'R03'],
  puestos: ['I1', 'I2'],
  andenes: ['A1', 'A2'],
};
/** Índices de personas del catálogo base, para no contar de memoria. */
export const PERSONA = { I1: 0, I2: 1, R1: 2, R2: 3, R3: 4, X1: 5, T1: 6, D1: 7 } as const;

export function geometriaFalsa(capacidad = 20): GeometriaHub {
  const rampas = CATALOGO_BASE.rampas.map((id, i) => ({
    id, s: 10 + 3 * i, lado: (i % 2 === 0 ? -1 : 1) as -1 | 1, x: 10 + 3 * i, y: 0, capacidad, ruta: CATALOGO_BASE.rutas[i],
  }));
  return {
    lazo: { forma: 'estadio', recta: 30, radio: 4, origen: [0, 0], largo: 85, paso: 0.6, bandejas: 142 },
    estaciones: CATALOGO_BASE.puestos.map((id, i) => ({ id, s: 0.5 + 1.5 * i, x: 0.5 + 1.5 * i, y: 0 })),
    lector: { s: 9, x: 9, y: 0 },
    rampas,
    excepcion: { id: 'RX', s: 66, x: 66, y: 0 },
    andenes: CATALOGO_BASE.andenes.map((id, i) => ({ id, x: -14 + 6 * i, y: -12 })),
    cintas: CATALOGO_BASE.andenes.map((a, i) => ({ id: `C${i + 1}`, anden: a, puntos: [[-14 + 6 * i, -10], [-2, -3]] as [number, number][], largo: 20 })),
    acumulacion: { x: -1, y: -2, capacidad: 120 },
    limites: { xmin: -35, ymin: -25, xmax: 80, ymax: 20 },
  };
}

export interface OpcionesTraza { inicio?: number; fin?: number; corte?: number; catalogo?: Catalogo; capacidadRampas?: number }

/** Arma una Traza a mano. Los tramos se agregan en el orden que se quiera: el explicador no depende del orden de la traza. */
export class ConstructorTraza {
  private e: number[] = []; private k: number[] = []; private r: number[] = []; private a: number[] = [];
  private t0: number[] = []; private t1: number[] = []; private c: number[] = []; private q: number[] = [];
  private mt: number[] = []; private mtipo: number[] = []; private mr: number[] = []; private mv: number[] = [];
  private pCamion: number[] = []; private pIndice: number[] = []; private pRuta: number[] = []; private pClase: number[] = [];
  private pCreado: number[] = []; private pListo: number[] = []; private pVueltas: number[] = [];

  /** Agrega un tramo y devuelve su índice. */
  tramo(e: number, k: number, r: number, a: number, t0: number, t1: number, c: number = Causa.NINGUNA, q = -1): number {
    this.e.push(e); this.k.push(k); this.r.push(r); this.a.push(a); this.t0.push(t0); this.t1.push(t1); this.c.push(c); this.q.push(q);
    return this.e.length - 1;
  }
  momento(t: number, tipo: number, r: number, v = 0): void {
    this.mt.push(t); this.mtipo.push(tipo); this.mr.push(r); this.mv.push(v);
  }
  /** Agrega un paquete (todavía sin terminar) y devuelve su id. */
  paquete(camion: number, indice: number, creado: number, ruta = 0, clase = 0): number {
    this.pCamion.push(camion); this.pIndice.push(indice); this.pRuta.push(ruta); this.pClase.push(clase);
    this.pCreado.push(creado); this.pListo.push(-1); this.pVueltas.push(0);
    return this.pCamion.length - 1;
  }
  listo(id: number, listo: number, vueltas = 0): void { this.pListo[id] = listo; this.pVueltas[id] = vueltas; }
  get cantidadPaquetes(): number { return this.pCamion.length; }

  construir(o: OpcionesTraza = {}): Traza {
    const inicio = o.inicio ?? H22;
    const fin = o.fin ?? H22 + 8 * 60 * MIN;
    const corte = o.corte ?? H22 + 3 * 60 * MIN + 30 * MIN;
    const n = this.e.length;
    const cerrar = (t: number) => (t === Infinity ? fin : t);
    const f64 = (xs: number[]) => Float64Array.from(xs);
    const nm = this.mt.length, np = this.pCamion.length;
    return {
      version: 1, modelo: 'prueba', semilla: 1, replica: 0, tickLazo: 300, bandejas: 142, inicio, fin, corte,
      tramos: {
        n, e: Int32Array.from(this.e), k: Uint8Array.from(this.k), r: Int32Array.from(this.r), a: Int32Array.from(this.a),
        t0: f64(this.t0), t1: f64(this.t1.map(cerrar)), c: Uint8Array.from(this.c), q: Int32Array.from(this.q),
      },
      momentos: { n: nm, t: f64(this.mt), tipo: Uint8Array.from(this.mtipo), r: Int32Array.from(this.mr), v: f64(this.mv) },
      paquetes: {
        n: np, camion: Int32Array.from(this.pCamion), indice: Int32Array.from(this.pIndice), ruta: Int16Array.from(this.pRuta),
        clase: Uint8Array.from(this.pClase), creado: f64(this.pCreado), listo: f64(this.pListo), vueltas: Uint8Array.from(this.pVueltas),
      },
      catalogo: o.catalogo ?? CATALOGO_BASE,
      geometria: geometriaFalsa(o.capacidadRampas),
      huella: 'huella-de-prueba',
    };
  }
}

export interface OpcionesViaje { camion?: number; indice?: number; ruta?: number; clase?: number }
export interface Viaje {
  /** El reloj del paquete: dónde terminó el último paso. */
  readonly t: number;
  readonly id: number;
  descarga(dur: number, anden?: number, bloqueo?: boolean, camion?: number): Viaje;
  cinta(dur: number, cinta?: number): Viaje;
  fila(dur: number): Viaje;
  induccion(dur: number, persona?: number, puesto?: number): Viaje;
  esperaBandeja(dur: number, bandejas?: number): Viaje;
  bandeja(dur: number, bandeja?: number): Viaje;
  /** Vuelta extra (a = número de vuelta) por rampa llena; `rampa` < 0 deja el causante en −1. */
  vuelta(dur: number, numero: number, rampa?: number): Viaje;
  rampa(dur: number, rampa: number, persona: number): Viaje;
  mano(dur: number, persona: number, rampa?: number): Viaje;
  colaManual(dur: number, causa: number, rampaCausante?: number): Viaje;
  manual(dur: number, persona?: number): Viaje;
  /** Entra a la jaula: el tramo queda abierto (se cierra al terminar la traza) y el paquete queda listo. */
  jaula(rampa: number, jaula?: number, posicion?: number): Viaje;
}

/** El recorrido de un paquete paso a paso: cada paso empieza donde terminó el anterior (sin huecos, como lo escribe el hub). */
export function viaje(c: ConstructorTraza, t0: number, o: OpcionesViaje = {}): Viaje {
  const camion = o.camion ?? 0;
  const id = c.paquete(camion, o.indice ?? c.cantidadPaquetes, t0, o.ruta ?? 0, o.clase ?? 0);
  let t = t0;
  const avanzar = (k: number, r: number, a: number, dur: number, causa: number = Causa.NINGUNA, q = -1): Viaje => {
    c.tramo(id, k, r, a, t, t + dur, causa, q);
    t += dur;
    return api;
  };
  const api: Viaje = {
    get t() { return t; },
    id,
    descarga: (dur, anden = 0, bloqueo = false, cam = camion) => avanzar(TipoTramo.DESCARGA, anden, cam, dur, bloqueo ? Causa.BLOQUEO : Causa.NINGUNA),
    cinta: (dur, cinta = 0) => avanzar(TipoTramo.CINTA, cinta, 0, dur),
    fila: (dur) => avanzar(TipoTramo.ACUMULACION, 0, 1, dur, Causa.FILA),
    induccion: (dur, persona = PERSONA.I1, puesto = 0) => avanzar(TipoTramo.INDUCCION, puesto, persona, dur),
    esperaBandeja: (dur, bandejas = 1) => avanzar(TipoTramo.ESPERA_BANDEJA, 0, bandejas, dur, Causa.FALTA_BANDEJA),
    bandeja: (dur, bandeja = 5) => avanzar(TipoTramo.BANDEJA, bandeja, 0, dur),
    vuelta: (dur, numero, rampa = 0) => avanzar(TipoTramo.BANDEJA, 5, numero, dur, Causa.RAMPA_LLENA, rampa >= 0 ? refDe(ClaseEntidad.RAMPA, rampa) : -1),
    rampa: (dur, rampa, persona) => avanzar(TipoTramo.RAMPA, rampa, 1, dur, Causa.NINGUNA, refDe(ClaseEntidad.PERSONA, persona)),
    mano: (dur, persona, rampa = 0) => avanzar(TipoTramo.MANO, persona, rampa, dur),
    colaManual: (dur, causa, rampaCausante = -1) => avanzar(TipoTramo.COLA_MANUAL, 0, 1, dur, causa, rampaCausante >= 0 ? refDe(ClaseEntidad.RAMPA, rampaCausante) : -1),
    manual: (dur, persona = PERSONA.X1) => avanzar(TipoTramo.MANUAL, persona, 0, dur),
    jaula: (rampa, jaula = 1, posicion = 1) => {
      c.tramo(id, TipoTramo.JAULA, rampa, jaula * 1000 + posicion, t, Infinity);
      c.listo(id, t);
      return api;
    },
  };
  return api;
}

/** Un paquete que recorre todo el hub sin esperar de más: base para las pruebas que cambian un solo paso. */
export function viajeNormal(c: ConstructorTraza, t0: number, o: OpcionesViaje = {}): Viaje {
  return viaje(c, t0, o).descarga(3000).cinta(40000).fila(5000).induccion(3000).bandeja(30000).rampa(8000, 0, PERSONA.R1).mano(3000, PERSONA.R1).jaula(0);
}

// ------------------------------------------------------------------------------------------------- variante y simulador falsos

/** Puntero JSON mínimo (RFC 6901) con 'replace' y 'add' sobre una copia profunda: lo que alcanza para las variantes de las pruebas. */
export function aplicarParcheFalso(m: Modelo, parche: readonly OpParche[]): Modelo {
  const copia = structuredClone(m) as unknown as Record<string, unknown>;
  for (const op of parche) {
    if (op.op !== 'replace' && op.op !== 'add') throw new Error(`variante falsa: solo implementa 'replace' y 'add' y llegó '${op.op}'`);
    const partes = op.path.split('/').slice(1).map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
    let cursor = copia as Record<string, unknown>;
    for (const p of partes.slice(0, -1)) {
      const sig = cursor[p];
      if (sig === undefined || sig === null) throw new Error(`variante falsa: «${op.path}» no existe en el modelo (falta «${p}»)`);
      cursor = sig as Record<string, unknown>;
    }
    cursor[partes[partes.length - 1]] = op.value;
  }
  return copia as unknown as Modelo;
}
export function crearVarianteFalsa(): { variante: Variante; llamadas: () => number } {
  let n = 0;
  return {
    variante: async (mv, parche) => { n++; return validadoSinChequeos(aplicarParcheFalso(mv.modelo, parche)); },
    llamadas: () => n,
  };
}

/**
 * Simulador falso: devuelve siempre la misma traza con el paquete (camión 0, índice 0) y su `listo` lo decide `listoSegun(mv)`.
 * Cuenta las llamadas. Solo sirve para el contrafactual: la traza que devuelve tiene un único paquete.
 */
export function crearSimuladorFalso(listoSegun: (mv: ModeloValidado, semilla: number, replica: number) => number, o: { corte?: number } = {}): { sim: Simulador; llamadas: () => number; log: string[] } {
  let n = 0;
  const log: string[] = [];
  const sim: Simulador = (mv, semilla, replica, opciones) => {
    n++;
    log.push(`${semilla}:${replica}:${opciones.traza}`);
    const c = new ConstructorTraza();
    const p = c.paquete(0, 0, H22);
    const listo = listoSegun(mv, semilla, replica);
    if (listo >= 0) c.listo(p, listo);
    return { resultado: undefined as never, traza: c.construir({ corte: o.corte }) };
  };
  return { sim, llamadas: () => n, log };
}
