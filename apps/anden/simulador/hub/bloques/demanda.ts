// hub/bloques/demanda.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'demanda'.
// La demanda de la noche en tres niveles (diseño maestro §3.6): el día (factor de volumen por error de pronóstico y atraso común),
// el camión (turno + desvío) y el paquete (atributos al nacer, en paquetes.ts). Todos los sorteos son por dirección (§6.3), así que
// se pueden hacer al armar la noche sin depender del orden de los eventos: llegada = turno + desvío + demora común (regla 3) y
// paquetes del camión = round(nominal × factor del día). Su estado incluye el del almacén de paquetes (prefijo «p.»).
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase, aMs } from '../../contratos/tipos-base.ts';
import { TipoMomento } from '../../contratos/traza.ts';
import { EV, cargar, volcar, type Hub } from './comun.ts';

/** Atraso (min) desde el que un camión cuenta como atrasado (momento CAMION_ATRASADO, §6.8). */
export const MINUTOS_CAMION_ATRASADO = 15;

function estadoInicial(n: number) {
  return {
    /** Llegada de cada camión (ms) y paquetes reales; se guardan en el estado por si se restaura con otra réplica. */
    llegada: new Float64Array(n), paquetes: new Int32Array(n),
    /** Cuándo tomó andén cada camión (−1 si todavía no). */
    asignado: new Float64Array(n).fill(-1),
    factor: 1, atraso: 0, demora: 0,
    /** Camiones con el último paquete ya descargado. */
    descargados: 0,
  };
}

export class BloqueDemanda implements Bloque {
  readonly ruta = 'demanda';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;

  constructor(h: Hub) {
    this.h = h;
    const cfg = h.cfg, m = h.m, n = cfg.nCam;
    const S = estadoInicial(n);
    const d = { clave: 0, a: 0, b: 0, c: 0 };
    // El día: factor de volumen ~ lognormal(media 1, cv) y golpe común de atraso (las tres direcciones con a = b = c = 0).
    if (cfg.cvPronostico > 0) {
      d.clave = m.claveDe('demanda', 'errorPronostico');
      S.factor = m.azar.sortear({ tipo: 'lognormal', media: 1, cv: cfg.cvPronostico }, d);
    }
    if (cfg.probAtraso > 0) {
      d.clave = m.claveDe('demanda', 'atrasoComun');
      S.atraso = m.azar.sortear({ tipo: 'bernoulli', p: cfg.probAtraso }, d);
    }
    if (S.atraso === 1) {
      d.clave = m.claveDe('demanda', 'demoraComun');
      S.demora = m.azar.sortear(cfg.demoraAtraso, d);
    }
    // El camión: desvío por camión (a = ordinal del camión en el modelo).
    const kDesvio = m.claveDe('demanda', 'desvio');
    for (let i = 0; i < n; i++) {
      d.clave = kDesvio;
      d.a = i;
      const desvio = m.azar.sortear(cfg.desvio, d);
      // Un camión puede llegar antes del inicio (se descarga desde el inicio), pero nunca antes del instante 0 del motor.
      S.llegada[i] = Math.max(0, aMs(cfg.turnoS[i] + desvio + S.demora));
      S.paquetes[i] = Math.max(0, Math.round(cfg.nominal[i] * S.factor));
    }
    this.S = S;
  }

  /** Paquetes de toda la noche (dimensiona el almacén). */
  totalPaquetes(): number {
    let t = 0;
    for (let i = 0; i < this.S.paquetes.length; i++) t += this.S.paquetes[i];
    return t;
  }

  agendarInicial(): void {
    const m = this.h.m, S = this.S, cfg = this.h.cfg;
    if (S.atraso === 1) m.traza.momento(cfg.inicio, TipoMomento.ATRASO_COMUN, -1, S.demora / 60);
    for (let i = 0; i < cfg.nCam; i++) m.agendar(S.llegada[i], this.id, EV.LLEGADA_CAMION, i, Fase.NORMAL, 0);
  }

  manejar(m: Motor, tipo: number, arg: number): void {
    this.h.tUltimo = m.ahora;
    if (tipo !== EV.LLEGADA_CAMION) throw new Error(`demanda: tipo de evento desconocido ${tipo} (se esperaba ${EV.LLEGADA_CAMION}).`);
    const t = m.ahora, atrasoMin = (t - aMs(this.h.cfg.turnoS[arg])) / 60000;
    m.traza.momento(t, TipoMomento.CAMION_LLEGA, arg, atrasoMin);
    if (atrasoMin > MINUTOS_CAMION_ATRASADO) m.traza.momento(t, TipoMomento.CAMION_ATRASADO, arg, atrasoMin);
    this.h.andenes.llegaCamion(arg, t);
  }

  estado(): EstadoBloque {
    const out = volcar(this.S, '', {});
    return this.h.P.estado('p.', out);
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
    this.h.P.restaurar(e, 'p.');
  }
}
