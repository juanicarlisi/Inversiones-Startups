// hub/bloques/induccion.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.induccion'.
// Puestos de inducción (corte-1.md §6.7 regla 6): tienen persona los primeros `puestosActivos` en el orden del modelo; los últimos
// `temporarios` de esos rinden `eficienciaTemporario` (un retén que cubre rinde como planta). Un puesto libre toma el primero de la
// fila (de menor a mayor índice de puesto). Tiempo = base(camión, índice, intento) × fatiga ÷ eficiencia, con fatiga
// 1 + máximo · (1 − exp(−(t − fin de la última pausa) ÷ τ)) si está activa. Después el paquete espera bandeja (lo maneja el lazo) y
// la persona queda ocupada hasta que lo coloca. Pausas en inicio + primera + i·escalón + m·cada mientras sean < fin; si la persona
// está ocupada, la pausa espera a que termine la tarea y dura lo mismo.
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase, aMs } from '../../contratos/tipos-base.ts';
import { TipoTramo } from '../../contratos/traza.ts';
import { instantesDePausa } from '../config.ts';
import { EV, Lugar, cargar, duracionMs, volcar, type Hub } from './comun.ts';

/** Estados de un puesto. */
export const Puesto = { SIN_PERSONA: 0, LIBRE: 1, INDUCE: 2, ESPERA: 3, PAUSA: 4 } as const;

function estadoInicial(NI: number) {
  return {
    estado: new Uint8Array(NI), item: new Int32Array(NI).fill(-1), eficiencia: new Float64Array(NI).fill(1),
    finPausa: new Float64Array(NI), pendientes: new Uint8Array(NI), inducidos: new Int32Array(NI),
    msInduciendo: 0,
  };
}

export class BloqueInduccion implements Bloque {
  readonly ruta = 'hub.induccion';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  private readonly dTiempo = { clave: 0, a: 0, b: 0, c: 0 };

  constructor(h: Hub) {
    this.h = h;
    this.S = estadoInicial(h.cfg.NI);
    this.dTiempo.clave = h.m.claveDe('hub.induccion', 'tiempo');
  }

  agendarInicial(): void {
    const h = this.h, cfg = h.cfg;
    for (let s = 0; s < cfg.activos; s++) {
      for (const t of instantesDePausa(cfg, cfg.pausasInduccion, s)) h.m.agendar(t, this.id, EV.PAUSA_INICIO_INDUCCION, s, Fase.URGENTE, 0);
    }
  }

  manejar(m: Motor, tipo: number, s: number): void {
    const t = m.ahora;
    this.h.tUltimo = t;
    switch (tipo) {
      case EV.FIN_INDUCCION: this.finInduccion(s, t); return;
      case EV.PAUSA_INICIO_INDUCCION: this.pedirPausa(s, t); return;
      case EV.PAUSA_FIN_INDUCCION: this.terminarPausa(s, t); return;
      default: throw new Error(`hub.induccion: tipo de evento desconocido ${tipo}.`);
    }
  }

  /** En el inicio (después de las ausencias): qué puestos tienen persona y con qué eficiencia. */
  alIniciar(t: number): void {
    const cfg = this.h.cfg, S = this.S, P = this.h.personas.S;
    for (let s = 0; s < cfg.NI; s++) {
      const w = s < cfg.activos ? P.trabajadorInd[s] : -1;
      if (w < 0) { S.estado[s] = Puesto.SIN_PERSONA; continue; }
      S.estado[s] = Puesto.LIBRE;
      S.finPausa[s] = t;
      const propio = w === cfg.offInd + s;
      S.eficiencia[s] = propio && s >= cfg.activos - cfg.temporarios ? cfg.eficienciaTemporario : 1;
    }
    this.intentar(t);
  }

  /** Cada puesto libre toma el primero de la fila. */
  intentar(t: number): void {
    const S = this.S, fila = this.h.acum.fila;
    for (let s = 0; s < S.estado.length; s++) {
      if (fila.largo === 0) return;
      if (S.estado[s] === Puesto.LIBRE) this.inducir(s, this.h.acum.tomar(t), t);
    }
  }

  private inducir(s: number, e: number, t: number): void {
    const h = this.h, cfg = h.cfg, S = this.S, P = h.P;
    const w = h.personas.S.trabajadorInd[s], intento = P.S.intento[e];
    this.dTiempo.a = P.S.camion[e];
    this.dTiempo.b = P.S.indice[e];
    this.dTiempo.c = intento;
    const base = h.m.azar.sortear(cfg.tiempoInduccion, this.dTiempo);
    if (intento === 0) P.S.base0[e] = base;
    else if (intento === 1) P.S.base1[e] = base;
    let fatiga = 1;
    if (cfg.fatigaActiva) fatiga = 1 + cfg.fatigaMaximo * (1 - h.m.mat.exp(-(t - S.finPausa[s]) / cfg.fatigaTauMs));
    const dur = duracionMs((base * fatiga) / S.eficiencia[s], 'el tiempo de inducción');
    P.pasar(e, TipoTramo.INDUCCION, s, w, t);
    P.mover(e, Lugar.INDUCCION);
    h.personas.empezar(w, TipoTramo.PERSONA_TRABAJA, s, e, t);
    S.estado[s] = Puesto.INDUCE;
    S.item[s] = e;
    S.msInduciendo += dur;
    S.inducidos[s]++;
    h.m.agendar(t + dur, this.id, EV.FIN_INDUCCION, s, Fase.NORMAL, 0);
  }

  private finInduccion(s: number, t: number): void {
    this.S.estado[s] = Puesto.ESPERA;
    this.h.sorter.esperar(s, t);
  }

  /** El lazo colocó el paquete del puesto s: la persona queda libre (o empieza la pausa pendiente). No vuelve a tomar: eso lo hace `intentar`. */
  liberar(s: number, t: number): void {
    const S = this.S;
    this.h.personas.terminar(this.h.personas.S.trabajadorInd[s], t);
    S.item[s] = -1;
    if (S.pendientes[s] > 0) {
      S.pendientes[s]--;
      this.empezarPausa(s, t);
    } else S.estado[s] = Puesto.LIBRE;
  }

  private pedirPausa(s: number, t: number): void {
    const S = this.S;
    if (S.estado[s] === Puesto.SIN_PERSONA) return;
    if (S.estado[s] === Puesto.LIBRE) this.empezarPausa(s, t);
    else S.pendientes[s]++;
  }

  private empezarPausa(s: number, t: number): void {
    const h = this.h;
    this.S.estado[s] = Puesto.PAUSA;
    h.personas.pausa(h.personas.S.trabajadorInd[s], s, t);
    h.m.agendar(t + aMs(h.cfg.pausasInduccion.duracion), this.id, EV.PAUSA_FIN_INDUCCION, s, Fase.NORMAL, 0);
  }

  private terminarPausa(s: number, t: number): void {
    const S = this.S, h = this.h;
    h.personas.finPausa(h.personas.S.trabajadorInd[s], t);
    S.finPausa[s] = t;
    if (S.pendientes[s] > 0) {
      S.pendientes[s]--;
      this.empezarPausa(s, t);
      return;
    }
    S.estado[s] = Puesto.LIBRE;
    this.intentar(t);
  }

  estado(): EstadoBloque {
    return volcar(this.S, '', {});
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
  }
}
