// hub/bloques/excepcion.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.excepcion'.
// La rampa de excepción y sus puestos manuales (corte-1.md §6.7 regla 12): cola FIFO (tramo COLA_MANUAL con a = secuencia y causa =
// motivo: NO_LEIDO, RAMPA_LLENA por vueltas máximas o NO_TRANSPORTABLE); cada puesto libre toma el primero y tarda
// tiempoManual(camión, índice, intento) (tramo MANUAL). Después, si es transportable, vuelve al final de la acumulación con
// intento + 1 (y su lectura ya no falla); si no, va directo a la jaula de la primera rampa de su ruta y cuenta como clasificado.
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase } from '../../contratos/tipos-base.ts';
import { TipoTramo, type Causa } from '../../contratos/traza.ts';
import { Anillo } from '../estructuras/anillo.ts';
import { EV, Lugar, anidar, cargar, desanidar, duracionMs, volcar, type Hub } from './comun.ts';

function estadoInicial(nX: number) {
  return { seq: 0, ocupado: new Uint8Array(nX), item: new Int32Array(nX).fill(-1) };
}

export class BloqueExcepcion implements Bloque {
  readonly ruta = 'hub.excepcion';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  readonly cola = new Anillo(64);
  private readonly dTiempo = { clave: 0, a: 0, b: 0, c: 0 };

  constructor(h: Hub) {
    this.h = h;
    this.S = estadoInicial(h.cfg.nX);
    this.dTiempo.clave = h.m.claveDe('personas.excepcion', 'tiempo');
  }

  manejar(m: Motor, tipo: number, p: number): void {
    this.h.tUltimo = m.ahora;
    if (tipo !== EV.FIN_MANUAL) throw new Error(`hub.excepcion: tipo de evento desconocido ${tipo} (se esperaba ${EV.FIN_MANUAL}).`);
    this.finManual(p, m.ahora);
  }

  recibir(e: number, t: number, motivo: Causa): void {
    const h = this.h, P = h.P;
    P.pasar(e, TipoTramo.COLA_MANUAL, 0, this.S.seq++, t, motivo);
    P.mover(e, Lugar.COLA_MANUAL);
    if (!P.S.aExc[e]) {
      P.S.aExc[e] = 1;
      P.S.aExcepcion++;
    }
    this.cola.poner(e);
    this.atender(t);
  }

  private atender(t: number): void {
    const h = this.h, S = this.S, cfg = h.cfg, P = h.P;
    for (let p = 0; p < cfg.nX && this.cola.largo > 0; p++) {
      if (S.ocupado[p]) continue;
      const e = this.cola.sacar(), g = cfg.offExc + p;
      this.dTiempo.a = P.S.camion[e];
      this.dTiempo.b = P.S.indice[e];
      this.dTiempo.c = P.S.intento[e];
      const dur = duracionMs(h.m.azar.sortear(cfg.tiempoManual, this.dTiempo), 'el tiempo en el puesto manual');
      P.cerrado(e, TipoTramo.MANUAL, g, 0, t, t + dur);
      P.mover(e, Lugar.MANUAL);
      h.personas.tarea(g, TipoTramo.PERSONA_TRABAJA, p, e, t, t + dur);
      S.ocupado[p] = 1;
      S.item[p] = e;
      h.m.agendar(t + dur, this.id, EV.FIN_MANUAL, p, Fase.NORMAL, 0);
    }
  }

  private finManual(p: number, t: number): void {
    const h = this.h, S = this.S, cfg = h.cfg, P = h.P.S, e = S.item[p];
    S.ocupado[p] = 0;
    S.item[p] = -1;
    if (cfg.claseTransportable[P.clase[e]]) {
      if (P.intento[e] < 255) P.intento[e]++;
      h.acum.entrar(e, t);
    } else {
      h.rampas.directo(e, cfg.rutaRampas[cfg.rutaOff[P.ruta[e]]], t);
    }
    this.atender(t);
  }

  estado(): EstadoBloque {
    return anidar(volcar(this.S, '', {}), 'cola.', this.cola.estado());
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
    this.cola.restaurar(desanidar(e, 'cola.'));
  }
}
