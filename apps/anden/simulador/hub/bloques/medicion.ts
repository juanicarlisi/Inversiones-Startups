// hub/bloques/medicion.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.medicion'.
// Medición cada cuarto de hora desde el inicio (fase TARDIA, corte-1.md §6.7 regla 15): máximo de la acumulación en el cuarto de
// hora y paquetes que entraron a la jaula. Mide al menos hasta el fin del turno y sigue mientras quede trabajo. También emite el
// momento CORTE (regla 14). Medir nunca cambia lo medido: va en la fase tardía y no toca a los demás bloques.
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase } from '../../contratos/tipos-base.ts';
import { TipoMomento } from '../../contratos/traza.ts';
import { MEDICION_MS, type ConfigHub } from '../config.ts';
import { EV, cargar, volcar, type Hub } from './comun.ts';

function estadoInicial(cfg: ConfigHub) {
  const n = Math.floor((cfg.horizonte - cfg.inicio) / MEDICION_MS) + 1;
  return { filaMax: new Float64Array(n), clasificados: new Float64Array(n), nQ: 0, filaActual: 0, clasifActual: 0 };
}

export class BloqueMedicion implements Bloque {
  readonly ruta = 'hub.medicion';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;

  constructor(h: Hub) {
    this.h = h;
    this.S = estadoInicial(h.cfg);
  }

  agendarInicial(): void {
    const m = this.h.m, cfg = this.h.cfg;
    m.agendar(cfg.inicio + MEDICION_MS, this.id, EV.MEDICION, 0, Fase.TARDIA, 0);
    m.agendar(cfg.corte, this.id, EV.CORTE, 0, Fase.TARDIA, 0);
  }

  manejar(m: Motor, tipo: number, _arg: number): void {
    const t = m.ahora, h = this.h, S = this.S;
    h.tUltimo = t;
    if (tipo === EV.CORTE) {
      m.traza.momento(t, TipoMomento.CORTE, 0, 0);
      return;
    }
    if (tipo !== EV.MEDICION) throw new Error(`hub.medicion: tipo de evento desconocido ${tipo}.`);
    if (S.nQ < S.filaMax.length) {
      S.filaMax[S.nQ] = S.filaActual;
      S.clasificados[S.nQ] = S.clasifActual;
      S.nQ++;
    }
    S.filaActual = h.acum.fila.largo;
    S.clasifActual = 0;
    const sig = t + MEDICION_MS;
    if ((t < h.cfg.fin || !h.terminado()) && sig <= h.cfg.horizonte) m.agendar(sig, this.id, EV.MEDICION, 0, Fase.TARDIA, 0);
  }

  observarFila(n: number): void {
    if (n > this.S.filaActual) this.S.filaActual = n;
  }

  clasificado(): void {
    this.S.clasifActual++;
  }

  estado(): EstadoBloque {
    return volcar(this.S, '', {});
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
  }
}
