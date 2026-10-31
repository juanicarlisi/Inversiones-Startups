// hub/bloques/acumulacion.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.acumulacion'.
// Cinta con acumulación antes de la inducción (corte-1.md §6.7 regla 5): fila FIFO con número de secuencia de entrada (tramo
// ACUMULACION con a = secuencia, causa FILA: el lugar en la fila es a − salidas hasta t). Los no transportables se desvían al llegar
// al frente, directo a la cola manual (COLA_MANUAL, causa NO_TRANSPORTABLE), sin pasar por inducción. Cada salida avisa a los
// andenes parados (contrapresión). Momentos ACUMULACION_LLENA y ACUMULACION_LIBERA con histéresis (NOTAS-CONTRATO §12).
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Causa, TipoMomento, TipoTramo } from '../../contratos/traza.ts';
import { Anillo } from '../estructuras/anillo.ts';
import { EV, Lugar, anidar, cargar, desanidar, volcar, type Hub } from './comun.ts';

/** Se avisa ACUMULACION_LIBERA cuando, sin andenes parados, lo que ocupa la acumulación baja a este fracción de sus lugares. */
export const FRACCION_LIBERA = 0.8;

function estadoInicial() {
  return { seq: 0, salidas: 0, llena: 0 };
}

export class BloqueAcumulacion implements Bloque {
  readonly ruta = 'hub.acumulacion';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  readonly fila = new Anillo(64);

  constructor(h: Hub) {
    this.h = h;
    this.S = estadoInicial();
  }

  manejar(m: Motor, tipo: number, arg: number): void {
    this.h.tUltimo = m.ahora;
    if (tipo !== EV.LLEGA_ACUMULACION) {
      throw new Error(`hub.acumulacion: tipo de evento desconocido ${tipo} (se esperaba ${EV.LLEGA_ACUMULACION}).`);
    }
    this.h.andenes.S.enCinta--;
    this.entrar(arg, m.ahora);
  }

  /** Entra un paquete al final de la fila (desde una cinta o de vuelta del puesto manual). */
  entrar(e: number, t: number): void {
    const S = this.S, h = this.h;
    h.P.pasar(e, TipoTramo.ACUMULACION, 0, S.seq++, t, Causa.FILA);
    h.P.mover(e, Lugar.ACUMULACION);
    this.fila.poner(e);
    h.medicion.observarFila(this.fila.largo);
    this.desviarCabeza(t);
    // dentro de `tomar` (la inducción está repartiendo: un paquete del puesto manual entró al liberarse un lugar) no se vuelve a llamar a
    // la inducción: el puesto que está tomando todavía figura libre y recibiría dos paquetes; el bucle de `intentar` sigue con la fila
    if (this.tomando === 0) h.ind.intentar(t);
  }

  /** > 0 mientras `tomar` reparte (para que `entrar` no llame a la inducción desde adentro de sí misma). */
  private tomando = 0;

  /** Saca el primero de la fila para un puesto de inducción (el frente nunca es un no transportable). */
  tomar(t: number): number {
    const e = this.fila.sacar();
    this.S.salidas++;
    this.tomando++;
    try {
      this.desviarCabeza(t);
      this.alSalir(t);
    } finally {
      this.tomando--;
    }
    return e;
  }

  /** Los no transportables que llegan al frente salen directo a la cola manual. */
  private desviarCabeza(t: number): void {
    const h = this.h, P = h.P.S, tr = h.cfg.claseTransportable;
    while (this.fila.largo > 0 && !tr[P.clase[this.fila.mirar(0)]]) {
      const e = this.fila.sacar();
      this.S.salidas++;
      h.exc.recibir(e, t, Causa.NO_TRANSPORTABLE);
      this.alSalir(t);
    }
  }

  private alSalir(t: number): void {
    const h = this.h;
    // primero los paquetes que vuelven del puesto manual y esperan lugar (HUB-R03), después los andenes parados
    if (h.exc.hayEspera()) h.exc.liberarLugar(t);
    h.andenes.reanudar(t);
    if (this.S.llena && !h.andenes.hayBloqueados() && h.andenes.enCamino() <= Math.floor(FRACCION_LIBERA * h.cfg.acumCap)) {
      this.S.llena = 0;
      h.m.traza.momento(t, TipoMomento.ACUMULACION_LIBERA, 0, this.fila.largo);
    }
  }

  /** Un andén paró por contrapresión. */
  marcarLlena(t: number): void {
    if (this.S.llena) return;
    this.S.llena = 1;
    this.h.m.traza.momento(t, TipoMomento.ACUMULACION_LLENA, 0, this.fila.largo);
  }

  estado(): EstadoBloque {
    return anidar(volcar(this.S, '', {}), 'fila.', this.fila.estado());
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
    this.fila.restaurar(desanidar(e, 'fila.'));
  }
}
