// hub/bloques/lazo-f2.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.sorter'. Fidelidad F2.
// El lazo como demora fija por paquete (corte-1.md §6.10): al terminar la inducción el paquete se lee y sale enseguida; llega a su
// rampa (o a la excepción) después de (distancia en ranuras de la estación a la rampa) × tick. Sin bandejas: no hay espera de
// bandeja, ni vueltas, ni rampas con tope, ni micro-paradas (no hay lazo que parar). Lo demás del hub es idéntico a F3.
// Dominio de validez: F2 reproduce a F3 con ρ de inducción ≤ 0,5 y sin rampas llenas (prueba L07).
import type { Direccion } from '../../contratos/azar.ts';
import type { EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase } from '../../contratos/tipos-base.ts';
import { Causa, TipoTramo } from '../../contratos/traza.ts';
import type { ConfigHub } from '../config.ts';
import { EV, Lugar, cargar, volcar, type Hub, type Lazo } from './comun.ts';
import { distancia, elegirRampa, leer } from './sorter.ts';

function estadoInicial(cfg: ConfigHub) {
  return {
    enBandejas: 0, esperando: 0, colocaciones: 0, noLeidos: 0, vueltasExtra: 0, paradas: 0, msDetenido: 0, parado: 0, tParada: 0,
    enCamino: new Int32Array(cfg.NR + 1), alternar: new Int32Array(cfg.nRutas), rampaVueltas: new Int32Array(cfg.NR),
  };
}

export class BloqueLazoF2 implements Lazo {
  readonly ruta = 'hub.sorter';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  private readonly dLectura: Direccion;

  constructor(h: Hub) {
    this.h = h;
    this.S = estadoInicial(h.cfg);
    this.dLectura = { clave: h.m.claveDe('hub.sorter', 'lectura'), a: 0, b: 0, c: 0 };
  }

  agendarInicial(): void {}

  manejar(m: Motor, tipo: number, e: number): void {
    const t = m.ahora, h = this.h, S = this.S, cfg = h.cfg;
    h.tUltimo = t;
    if (tipo !== EV.LLEGA_RAMPA_F2) throw new Error(`hub.sorter (F2): tipo de evento desconocido ${tipo} (se esperaba ${EV.LLEGA_RAMPA_F2}).`);
    const r = h.P.S.destino[e];
    S.enBandejas--;
    S.enCamino[r]--;
    if (r === cfg.NR) h.exc.recibir(e, t, Causa.NO_LEIDO);
    else h.rampas.recibir(e, r, t);
  }

  bandejasOcupadas(): number {
    return 0;
  }

  /** El paquete del puesto s sale ya: lectura, rampa y demora fija hasta ella. */
  esperar(s: number, t: number): void {
    const h = this.h, S = this.S, cfg = h.cfg, P = h.P, PS = P.S;
    const e = h.ind.S.item[s];
    const nl = leer(h, e, this.dLectura);
    const dest = nl ? cfg.NR : elegirRampa(h, PS.ruta[e], S.enCamino, S.alternar);
    S.colocaciones++;
    if (nl) S.noLeidos++;
    PS.destino[e] = dest;
    PS.motivo[e] = nl ? Causa.NO_LEIDO : Causa.NINGUNA;
    S.enBandejas++;
    S.enCamino[dest]++;
    P.pasar(e, TipoTramo.BANDEJA, -1, 0, t);
    P.mover(e, Lugar.BANDEJA);
    const d = distancia(cfg, cfg.slotEstacion[s], cfg.slotRampa[dest]);
    h.m.agendar(t + d * cfg.tick, this.id, EV.LLEGA_RAMPA_F2, e, Fase.NORMAL, 0);
    h.ind.liberar(s, t);
    h.ind.intentar(t);
  }

  estado(): EstadoBloque {
    return volcar(this.S, '', {});
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
  }
}
