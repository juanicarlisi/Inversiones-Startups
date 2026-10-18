// hub/bloques/sorter.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.sorter'. Fidelidad F3 (mecanismo).
// Sorter de bandejas en lazo (corte-1.md §6.7 reglas 8 a 10 y 13):
// - T = round(largo ÷ paso) bandejas; la bandeja j está en el paso k en la ranura (j + k) mod T; la estación de ranura σ ve la
//   bandeja (σ − k) mod T. El lazo marcha desde el inicio con un paso cada `tick` ms; el paso k ocurre en tRef + (k − kRef)·tick,
//   donde (tRef, kRef) es el último arranque (el inicio o el fin de una micro-parada).
// - Los eventos de paso (fase NORMAL, prioridad 9) solo se agendan mientras hay paquetes en bandejas o esperando bandeja; el contador
//   avanza igual (se recalcula al volver la actividad). Sin cancelación en el calendario: el paso agendado guarda su seq y, si una
//   parada lo invalidó, se descarta al llegar.
// - En cada paso: primero la rueda (lo que llega a su rampa en este paso: cae, da otra vuelta o va a excepción) y después las
//   estaciones en el orden del modelo (un paquete de una bandeja necesita la que ve libre; uno de dos, esa y la siguiente que
//   llegará, (σ − k − 1) mod T). Ver NOTAS-CONTRATO §6 sobre el orden.
// - Al colocar: lectura del intento (NO-READ → excepción), rampa de la ruta ('la-menos-llena': menor ocupación + en camino, empate
//   por orden; 'alternar': rotación por ruta) y agenda en la rueda para k + ((ranura destino − ranura estación) mod T) (0 → T).
// - Rampa llena: una vuelta más (tramo BANDEJA nuevo con a = vueltas, causa RAMPA_LLENA, q = la rampa); pasadas maxVueltas, a la
//   excepción. La excepción acepta siempre.
// - Micro-paradas: la n empieza entre(n) s después del fin de la anterior (la primera desde el inicio), en fase URGENTE, y dura
//   duración(n); durante la parada no hay pasos y al volver el paso kₚ + i ocurre en t′ + i·tick (todo se atrasa lo mismo).
import type { Direccion } from '../../contratos/azar.ts';
import type { EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase } from '../../contratos/tipos-base.ts';
import { Causa, ClaseEntidad, TipoMomento, TipoTramo, refDe } from '../../contratos/traza.ts';
import { Rueda } from '../estructuras/rueda.ts';
import type { ConfigHub } from '../config.ts';
import {
  ALERTA, EV, Lugar, PRIORIDAD_PASO, anidar, cargar, desanidar, divTecho, duracionMs, mod, volcar, type Hub, type Lazo,
} from './comun.ts';
import { Puesto } from './induccion.ts';

/** Lectura al colocar (regla 9): en el intento 0 se sortea bernoulli(noLeido) por (camión, índice, 0); después no falla (regla 12). */
export function leer(h: Hub, e: number, d: Direccion): number {
  const P = h.P.S;
  if (P.intento[e] !== 0) return 0;
  d.a = P.camion[e];
  d.b = P.indice[e];
  d.c = 0;
  const nl = h.cfg.pNoLeido > 0 ? h.m.azar.sortear({ tipo: 'bernoulli', p: h.cfg.pNoLeido }, d) : 0;
  P.noLeido[e] = nl;
  return nl;
}

/** Rampa de la ruta para un paquete leído (regla 9). */
export function elegirRampa(h: Hub, ruta: number, enCamino: Int32Array, alternar: Int32Array): number {
  const cfg = h.cfg, ini = cfg.rutaOff[ruta], fin = cfg.rutaOff[ruta + 1], n = fin - ini;
  if (n === 1) return cfg.rutaRampas[ini];
  if (!cfg.multiMenosLlena) {
    const i = alternar[ruta];
    alternar[ruta] = (i + 1) % n;
    return cfg.rutaRampas[ini + i];
  }
  const filas = h.rampas.filas;
  let mejor = cfg.rutaRampas[ini], carga = filas[mejor].largo + enCamino[mejor];
  for (let i = ini + 1; i < fin; i++) {
    const r = cfg.rutaRampas[i], c = filas[r].largo + enCamino[r];
    if (c < carga) { carga = c; mejor = r; }
  }
  return mejor;
}

/** Distancia en pasos de una ranura a otra, en el sentido de marcha (0 se toma como una vuelta entera). */
export function distancia(cfg: ConfigHub, desde: number, hasta: number): number {
  return mod(hasta - desde, cfg.T) || cfg.T;
}

function estadoInicial(cfg: ConfigHub) {
  return {
    bandeja: new Int32Array(cfg.T).fill(-1),
    kRef: 0, tRef: cfg.inicio, parado: 0, tParada: 0, kParada: 0, nParada: 0,
    seqPaso: -1, pasoAgendado: 0,
    enBandejas: 0, esperando: 0, colocaciones: 0, noLeidos: 0, vueltasExtra: 0, paradas: 0, msDetenido: 0,
    /** Paquetes en bandejas con destino a cada rampa (índice NR = excepción). */
    enCamino: new Int32Array(cfg.NR + 1),
    alternar: new Int32Array(cfg.nRutas),
    rampaVueltas: new Int32Array(cfg.NR),
  };
}

export class BloqueSorter implements Lazo {
  readonly ruta = 'hub.sorter';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  readonly rueda: Rueda;
  private idxLazo = -1;
  /** Paso en curso (transitorio: solo vale dentro del manejo de un evento de paso). */
  private kAct = 0;
  private tAct = 0;
  private readonly dLectura: Direccion;
  private readonly dEntre: Direccion;
  private readonly dDuracion: Direccion;
  private readonly alPasarFn = (e: number): void => this.alPasar(e);

  constructor(h: Hub) {
    this.h = h;
    this.S = estadoInicial(h.cfg);
    this.rueda = new Rueda(h.cfg.T, 256);
    const m = h.m;
    this.dLectura = { clave: m.claveDe('hub.sorter', 'lectura'), a: 0, b: 0, c: 0 };
    this.dEntre = { clave: m.claveDe('hub.sorter', 'paradaEntre'), a: 0, b: 0, c: 0 };
    this.dDuracion = { clave: m.claveDe('hub.sorter', 'paradaDuracion'), a: 0, b: 0, c: 0 };
  }

  agendarInicial(): void {
    const h = this.h, cfg = h.cfg;
    this.idxLazo = h.m.traza.abrir(-1, TipoTramo.LAZO_MARCHA, 0, 0, cfg.inicio);
    if (cfg.paradasActivas) this.agendarParada(0, cfg.inicio);
  }

  manejar(m: Motor, tipo: number, arg: number): void {
    const t = m.ahora;
    this.h.tUltimo = t;
    switch (tipo) {
      case EV.PASO:
        if (m.seq !== this.S.seqPaso) return; // paso invalidado por una parada
        this.paso(arg, t);
        return;
      case EV.PARADA_INICIO: this.pararLazo(arg, t); return;
      case EV.PARADA_FIN: this.arrancarLazo(arg, t); return;
      default: throw new Error(`hub.sorter: tipo de evento desconocido ${tipo}.`);
    }
  }

  bandejasOcupadas(): number {
    let n = 0;
    const b = this.S.bandeja;
    for (let j = 0; j < b.length; j++) if (b[j] >= 0) n++;
    return n;
  }

  /** El puesto s terminó de inducir: su paquete espera bandeja (tramo ESPERA_BANDEJA con a = bandejas que necesita). */
  esperar(s: number, t: number): void {
    const h = this.h, e = h.ind.S.item[s], nb = h.cfg.claseBandejas[h.P.S.clase[e]];
    h.P.pasar(e, TipoTramo.ESPERA_BANDEJA, s, nb, t, Causa.FALTA_BANDEJA);
    h.P.mover(e, Lugar.ESPERA);
    this.S.esperando++;
    this.asegurarPaso(t);
  }

  /** Si el lazo marcha y no hay paso agendado, agenda el primer paso de la grilla en o después de t. */
  private asegurarPaso(t: number): void {
    const S = this.S, tick = this.h.cfg.tick;
    if (S.parado || S.pasoAgendado) return;
    const k = S.kRef + divTecho(t - S.tRef, tick);
    this.agendarPaso(k);
  }

  private agendarPaso(k: number): void {
    const S = this.S;
    S.seqPaso = this.h.m.agendar(S.tRef + (k - S.kRef) * this.h.cfg.tick, this.id, EV.PASO, k, Fase.NORMAL, PRIORIDAD_PASO);
    S.pasoAgendado = 1;
  }

  private paso(k: number, t: number): void {
    const h = this.h, S = this.S, cfg = h.cfg;
    S.pasoAgendado = 0;
    S.seqPaso = -1;
    this.kAct = k;
    this.tAct = t;
    this.rueda.tomar(k, this.alPasarFn);
    let coloco = false;
    if (S.esperando > 0) {
      const est = h.ind.S.estado;
      for (let s = 0; s < cfg.NI; s++) if (est[s] === Puesto.ESPERA && this.colocar(s, k, t)) coloco = true;
    }
    if (coloco) h.ind.intentar(t);
    if (!S.parado && !S.pasoAgendado && (S.enBandejas > 0 || S.esperando > 0)) this.agendarPaso(k + 1);
  }

  private colocar(s: number, k: number, t: number): boolean {
    const h = this.h, S = this.S, cfg = h.cfg, P = h.P, PS = P.S, T = cfg.T;
    const e = h.ind.S.item[s], nb = cfg.claseBandejas[PS.clase[e]], sigma = cfg.slotEstacion[s];
    const j = mod(sigma - k, T);
    if (S.bandeja[j] !== -1) return false;
    let j2 = -1;
    if (nb === 2) {
      j2 = mod(sigma - k - 1, T);
      if (S.bandeja[j2] !== -1) return false;
    }
    const nl = leer(h, e, this.dLectura);
    const dest = nl ? cfg.NR : elegirRampa(h, PS.ruta[e], S.enCamino, S.alternar);
    S.colocaciones++;
    if (nl) S.noLeidos++;
    S.bandeja[j] = e;
    if (j2 >= 0) S.bandeja[j2] = e;
    PS.bandeja[e] = j;
    PS.destino[e] = dest;
    PS.vueltasCol[e] = 0;
    PS.motivo[e] = nl ? Causa.NO_LEIDO : Causa.NINGUNA;
    S.enBandejas++;
    S.esperando--;
    S.enCamino[dest]++;
    P.pasar(e, TipoTramo.BANDEJA, j, 0, t);
    P.mover(e, Lugar.BANDEJA);
    this.rueda.agendar(k + distancia(cfg, sigma, cfg.slotRampa[dest]), e);
    h.ind.liberar(s, t);
    return true;
  }

  private soltarBandejas(e: number): void {
    const S = this.S, T = this.h.cfg.T, P = this.h.P;
    const j = P.S.bandeja[e];
    if (j < 0 || S.bandeja[j] !== e) P.alerta(ALERTA.BANDEJA_UNICA);
    else S.bandeja[j] = -1;
    if (this.h.cfg.claseBandejas[P.S.clase[e]] === 2) {
      const j2 = mod(j - 1, T);
      if (S.bandeja[j2] !== e) P.alerta(ALERTA.BANDEJA_UNICA);
      else S.bandeja[j2] = -1;
    }
    P.S.bandeja[e] = -1;
    S.enBandejas--;
  }

  /** Lo que la rueda trae en el paso en curso: el paquete está frente a su rampa destino (o a la excepción). */
  private alPasar(e: number): void {
    const h = this.h, S = this.S, cfg = h.cfg, P = h.P, PS = P.S, k = this.kAct, t = this.tAct;
    const r = PS.destino[e];
    if (r === cfg.NR) {
      this.soltarBandejas(e);
      S.enCamino[r]--;
      h.exc.recibir(e, t, PS.motivo[e] === Causa.NO_LEIDO ? Causa.NO_LEIDO : Causa.RAMPA_LLENA);
      return;
    }
    if (h.rampas.filas[r].largo >= cfg.rampaCap[r]) {
      S.vueltasExtra++;
      S.rampaVueltas[r]++;
      if (PS.vueltas[e] < 255) PS.vueltas[e]++;
      const v = ++PS.vueltasCol[e];
      P.pasar(e, TipoTramo.BANDEJA, PS.bandeja[e], v, t, Causa.RAMPA_LLENA, refDe(ClaseEntidad.RAMPA, r));
      if (v > cfg.maxVueltas) {
        PS.destino[e] = cfg.NR;
        PS.motivo[e] = Causa.RAMPA_LLENA;
        S.enCamino[r]--;
        S.enCamino[cfg.NR]++;
        this.rueda.agendar(k + distancia(cfg, cfg.slotRampa[r], cfg.slotExcepcion), e);
      } else this.rueda.agendar(k + cfg.T, e);
      return;
    }
    this.soltarBandejas(e);
    S.enCamino[r]--;
    h.rampas.recibir(e, r, t);
  }

  // ---- Micro-paradas ----

  private agendarParada(n: number, desde: number): void {
    this.dEntre.a = n;
    const entre = duracionMs(this.h.m.azar.sortear(this.h.cfg.paradaEntre, this.dEntre), 'el tiempo entre micro-paradas');
    this.h.m.agendar(desde + entre, this.id, EV.PARADA_INICIO, n, Fase.URGENTE, 0);
  }

  private pararLazo(n: number, t: number): void {
    const h = this.h, S = this.S, tr = h.m.traza;
    if (h.terminado()) return; // sin trabajo no hay más paradas (NOTAS-CONTRATO §8)
    const kp = S.kRef + divTecho(t - S.tRef, h.cfg.tick);
    S.parado = 1;
    S.tParada = t;
    S.kParada = kp;
    S.nParada = n;
    S.paradas++;
    S.seqPaso = -1;
    S.pasoAgendado = 0;
    tr.cerrar(this.idxLazo, t);
    this.idxLazo = tr.abrir(-1, TipoTramo.LAZO_DETENIDO, 0, kp, t, Causa.FALLA);
    tr.momento(t, TipoMomento.LAZO_PARA, 0, n);
    this.dDuracion.a = n;
    const dur = duracionMs(h.m.azar.sortear(h.cfg.paradaDuracion, this.dDuracion), 'la duración de una micro-parada');
    h.m.agendar(t + dur, this.id, EV.PARADA_FIN, n, Fase.URGENTE, 0);
  }

  private arrancarLazo(n: number, t: number): void {
    const h = this.h, S = this.S, tr = h.m.traza;
    S.parado = 0;
    S.msDetenido += t - S.tParada;
    S.tRef = t;
    S.kRef = S.kParada;
    tr.cerrar(this.idxLazo, t);
    this.idxLazo = tr.abrir(-1, TipoTramo.LAZO_MARCHA, 0, S.kParada, t);
    tr.momento(t, TipoMomento.LAZO_ARRANCA, 0, n);
    if (S.enBandejas > 0 || S.esperando > 0) this.agendarPaso(S.kParada);
    this.agendarParada(n + 1, t);
  }

  estado(): EstadoBloque {
    return anidar(volcar(this.S, '', {}), 'rueda.', this.rueda.estado());
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
    this.rueda.restaurar(desanidar(e, 'rueda.'));
    this.idxLazo = -1;
  }
}
