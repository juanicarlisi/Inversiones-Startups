// hub/bloques/paquetes.ts · Andén simulador, corte 1 · P4 (el hub).
// El almacén de paquetes de la noche: atributos sorteados al nacer por dirección semántica (corte-1.md §6.3), dónde está cada uno,
// su resumen (creado, listo, vueltas) y los tramos de su biografía. Los tramos de un paquete se encadenan SIN huecos por
// construcción: `pasar` cierra el tramo abierto en t y abre el siguiente en t; `cerrado` escribe un tramo con fin conocido.
// Si algo intenta abrir un tramo antes del fin del anterior, levanta la bandera de la invariante de tiempo (§6.7 regla 16).
// No es un Bloque: su estado viaja dentro del de 'demanda' (prefijo «p.»).
import type { Direccion } from '../../contratos/azar.ts';
import type { EstadoBloque } from '../../contratos/motor.ts';
import { TipoMomento, type Causa, type TipoTramo } from '../../contratos/traza.ts';
import { ALERTA, LUGARES, Lugar, cargar, duracionMs, volcar, type Hub } from './comun.ts';

function estadoInicial(cap: number) {
  return {
    camion: new Int32Array(cap), indice: new Int32Array(cap), ruta: new Int16Array(cap), clase: new Uint8Array(cap),
    creado: new Float64Array(cap), listo: new Float64Array(cap).fill(-1),
    /** Manejo en la rampa (ms), sorteado al nacer. */
    manejo: new Float64Array(cap),
    /** Tiempo base de inducción (s) sorteado para el intento 0 y el 1 (−1 si no se indujo): para R05a. */
    base0: new Float64Array(cap).fill(-1), base1: new Float64Array(cap).fill(-1),
    /** Lectura del intento 0: 0 leído, 1 NO-READ, 2 todavía no se leyó. Desde el intento 1 la lectura no falla (regla 12). */
    noLeido: new Uint8Array(cap).fill(2),
    intento: new Uint8Array(cap),
    /** Vueltas extra en toda la noche y en la colocación actual. */
    vueltas: new Uint8Array(cap), vueltasCol: new Uint8Array(cap),
    /** Rampa destino de la colocación actual (NR = excepción). */
    destino: new Int16Array(cap), motivo: new Uint8Array(cap),
    bandeja: new Int32Array(cap).fill(-1),
    lugar: new Uint8Array(cap), aExc: new Uint8Array(cap),
    /** Instante de la última transición (inicio del tramo abierto o fin del último cerrado) y si hay un tramo abierto. */
    tUlt: new Float64Array(cap), abierto: new Uint8Array(cap),
    cuentas: new Int32Array(LUGARES),
    nacidos: 0, enJaula: 0, maxListo: -1, aExcepcion: 0, alertas: 0,
  };
}

/** Claves con un elemento por paquete (su largo es la capacidad del almacén). */
const POR_PAQUETE: ReadonlySet<string> = (() => {
  const e0: Record<string, unknown> = estadoInicial(0);
  return new Set(Object.keys(e0).filter((k) => k !== 'cuentas' && typeof e0[k] !== 'number'));
})();

export class Paquetes {
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  /** Índice del tramo abierto de cada paquete en el escritor de la traza (no es estado: la traza no viaja en la foto). */
  private idx: Int32Array;
  private readonly dRuta: Direccion;
  private readonly dClase: Direccion;
  private readonly dManejo: Direccion;

  constructor(h: Hub, cap: number) {
    this.h = h;
    this.S = estadoInicial(cap);
    this.idx = new Int32Array(cap).fill(-1);
    const m = h.m;
    this.dRuta = { clave: m.claveDe('hub.planClasificacion', 'ruta'), a: 0, b: 0, c: 0 };
    this.dClase = { clave: m.claveDe('hub.perfilPaquete', 'clase'), a: 0, b: 0, c: 0 };
    this.dManejo = { clave: m.claveDe('personas.rampa', 'manejo'), a: 0, b: 0, c: 0 };
  }

  get capacidad(): number {
    return this.S.camion.length;
  }

  /** Nace el paquete `indice` del camión `camion` (al terminar su descarga); `creado` es el inicio de su descarga. */
  nacer(camion: number, indice: number, creado: number, ahora: number): number {
    const S = this.S, e = S.nacidos, h = this.h, m = h.m, cfg = h.cfg;
    if (e >= this.capacidad) throw new Error(`hub: nacieron más paquetes (${e + 1}) que los previstos (${this.capacidad}).`);
    S.nacidos++;
    S.camion[e] = camion;
    S.indice[e] = indice;
    S.creado[e] = creado;
    this.dRuta.a = camion; this.dRuta.b = indice;
    S.ruta[e] = m.azar.sortear(cfg.distRuta, this.dRuta);
    this.dClase.a = camion; this.dClase.b = indice;
    S.clase[e] = m.azar.sortear(cfg.distClase, this.dClase);
    this.dManejo.a = camion; this.dManejo.b = indice;
    S.manejo[e] = duracionMs(m.azar.sortear(cfg.manejo, this.dManejo), 'el manejo en la rampa');
    S.tUlt[e] = creado;
    S.abierto[e] = 0;
    this.idx[e] = -1;
    m.traza.paquete(e, camion, indice, S.ruta[e], S.clase[e], creado);
    if (e === 0) m.traza.momento(ahora, TipoMomento.PRIMER_PAQUETE, 0, 0);
    return e;
  }

  mover(e: number, lugar: Lugar): void {
    const S = this.S;
    S.cuentas[S.lugar[e]]--;
    S.cuentas[lugar]++;
    S.lugar[e] = lugar;
  }

  alerta(bit: number): void {
    this.S.alertas |= bit;
  }

  /** Cierra el tramo abierto del paquete en t y abre uno nuevo desde t. */
  pasar(e: number, k: TipoTramo, r: number, a: number, t: number, c: Causa = 0, q = -1): void {
    const S = this.S, tr = this.h.m.traza;
    if (S.abierto[e]) {
      if (t < S.tUlt[e]) this.alerta(ALERTA.TIEMPO);
      tr.cerrar(this.idx[e], t);
    } else if (t !== S.tUlt[e]) this.alerta(ALERTA.TIEMPO);
    this.idx[e] = tr.abrir(e, k, r, a, t, c, q);
    S.abierto[e] = 1;
    S.tUlt[e] = t;
  }

  /** Escribe un tramo con fin conocido [t0, t1] (cierra antes el abierto en t0). El próximo tramo tiene que empezar en t1. */
  cerrado(e: number, k: TipoTramo, r: number, a: number, t0: number, t1: number, c: Causa = 0, q = -1): void {
    const S = this.S, tr = this.h.m.traza;
    if (S.abierto[e]) {
      if (t0 < S.tUlt[e]) this.alerta(ALERTA.TIEMPO);
      tr.cerrar(this.idx[e], t0);
    } else if (t0 !== S.tUlt[e]) this.alerta(ALERTA.TIEMPO);
    if (t1 < t0) this.alerta(ALERTA.TIEMPO);
    tr.tramo(e, k, r, a, t0, t1, c, q);
    S.abierto[e] = 0;
    S.tUlt[e] = t1;
    this.idx[e] = -1;
  }

  /** Entró a la jaula: listo y resumen del paquete. */
  listo(e: number, t: number): void {
    const S = this.S;
    S.listo[e] = t;
    S.enJaula++;
    if (t > S.maxListo) S.maxListo = t;
    this.h.m.traza.paqueteListo(e, t, S.vueltas[e]);
  }

  estado(prefijo: string, out: EstadoBloque): EstadoBloque {
    return volcar(this.S, prefijo, out);
  }

  restaurar(e: EstadoBloque, prefijo: string): void {
    // El largo de los arreglos por paquete depende de la réplica (factor del día): se acepta otro, pero todos iguales entre sí.
    cargar(this.S, e, prefijo, 'hub (paquetes)', POR_PAQUETE);
    const n = this.S.camion.length;
    for (const k of POR_PAQUETE) {
      const v = this.S[k as keyof typeof this.S];
      if (typeof v !== 'number' && v.length !== n) throw new RangeError(`hub (paquetes): «${prefijo}${k}» trae ${v.length} elementos y «${prefijo}camion» ${n}.`);
    }
    if (this.S.nacidos > n) throw new RangeError(`hub (paquetes): la foto dice ${this.S.nacidos} nacidos y hay lugar para ${n}.`);
    // La traza no viaja en la foto: los tramos abiertos antes de la foto no se pueden cerrar en el escritor nuevo.
    this.idx = new Int32Array(this.capacidad).fill(-1);
  }
}
