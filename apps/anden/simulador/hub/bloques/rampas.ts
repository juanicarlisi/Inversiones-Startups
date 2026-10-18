// hub/bloques/rampas.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.rampas'.
// Rampas con capacidad, jaulas y personas de rampa (corte-1.md §6.7 reglas 7, 10 y 11):
// - cada rampa es una fila FIFO (tramo RAMPA con a = secuencia en la rampa y q = la persona que la atiende);
// - el plan (asignación de rampas a personas) se arma en el inicio, después de las ausencias (plan.ts);
// - una persona libre atiende primero una jaula completa pendiente de cierre y si no elige entre sus rampas con paquetes según la
//   regla ('la-mas-llena', 'la-que-se-llena-antes' o 'en-orden'); si cambia de rampa camina `caminar` s (PERSONA_CAMINA), toma el
//   primero de la rampa, lo maneja (MANO) y lo pone en la jaula (JAULA, a = jaula·1000 + posición). Al completar la jaula la cierra
//   (`cierre` s, PERSONA_CIERRA_JAULA) y empieza otra;
// - pausas como en la inducción (regla 6), con las de `personas.rampa.pausas`.
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase, aMs } from '../../contratos/tipos-base.ts';
import { ClaseEntidad, TipoMomento, TipoTramo, refDe } from '../../contratos/traza.ts';
import { Anillo } from '../estructuras/anillo.ts';
import { Regla, instantesDePausa, type ConfigHub } from '../config.ts';
import { asignarRampas } from '../plan.ts';
import { ALERTA, EV, Lugar, anidar, cargar, desanidar, mod, volcar, type Hub } from './comun.ts';

/** Estados de una persona de rampa. */
export const PersonaRampa = { AUSENTE: 0, LIBRE: 1, CAMINA: 2, MANO: 3, CIERRA: 4, PAUSA: 5 } as const;
const TOMAR = 0, CERRAR = 1;

function estadoInicial(cfg: ConfigHub) {
  const NR = cfg.NR, nW = cfg.nW;
  return {
    // rampas
    seq: new Int32Array(NR), recibidos: new Int32Array(NR), llenaDesde: new Float64Array(NR).fill(-1), msLlena: new Float64Array(NR),
    seLleno: new Uint8Array(NR), lleno: new Int32Array(NR), nroJaula: new Int32Array(NR), pendiente: new Int32Array(NR),
    /** Lugar de persona de rampa que atiende cada rampa (−1 nadie). */
    asignada: new Int32Array(NR).fill(-1),
    // personas de rampa: lista de rampas de cada una (CSR: rampas del lugar w en lista[off[w]..off[w+1]], en orden del modelo)
    lista: new Int32Array(NR), off: new Int32Array(nW + 1),
    estado: new Uint8Array(nW), ultima: new Int32Array(nW).fill(-1), objetivo: new Int32Array(nW).fill(-1),
    tarea: new Uint8Array(nW), item: new Int32Array(nW).fill(-1), pendientes: new Uint8Array(nW), posOrden: new Int32Array(nW).fill(-1),
  };
}

export class BloqueRampas implements Bloque {
  readonly ruta = 'hub.rampas';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  readonly filas: Anillo[];

  constructor(h: Hub) {
    this.h = h;
    this.S = estadoInicial(h.cfg);
    this.filas = Array.from({ length: h.cfg.NR }, (_, r) => new Anillo(Math.min(64, Math.max(8, h.cfg.rampaCap[r] + 1))));
  }

  agendarInicial(): void {
    const h = this.h, cfg = h.cfg;
    for (let w = 0; w < cfg.nW; w++) {
      for (const t of instantesDePausa(cfg, cfg.pausasRampa, w)) h.m.agendar(t, this.id, EV.PAUSA_INICIO_RAMPA, w, Fase.URGENTE, 0);
    }
  }

  manejar(m: Motor, tipo: number, w: number): void {
    const t = m.ahora;
    this.h.tUltimo = t;
    switch (tipo) {
      case EV.FIN_CAMINATA: this.finCaminata(w, t); return;
      case EV.FIN_MANEJO: this.finManejo(w, t); return;
      case EV.FIN_CIERRE: this.finCierre(w, t); return;
      case EV.PAUSA_INICIO_RAMPA: this.pedirPausa(w, t); return;
      case EV.PAUSA_FIN_RAMPA: this.terminarPausa(w, t); return;
      default: throw new Error(`hub.rampas: tipo de evento desconocido ${tipo}.`);
    }
  }

  /** Persona (id global) que trabaja en el lugar w de persona de rampa. */
  private trabajador(w: number): number {
    return this.h.personas.S.trabajadorRam[w];
  }

  /** En el inicio (después de las ausencias): plan de rampas y personas listas. */
  alIniciar(t: number): void {
    const h = this.h, cfg = h.cfg, S = this.S;
    const presentes = Uint8Array.from(h.personas.S.trabajadorRam, (w) => (w >= 0 ? 1 : 0));
    asignarRampas(cfg, presentes, S.asignada);
    // lista CSR de rampas por persona, en orden del modelo
    let k = 0;
    for (let w = 0; w < cfg.nW; w++) {
      S.off[w] = k;
      for (let r = 0; r < cfg.NR; r++) if (S.asignada[r] === w) S.lista[k++] = r;
    }
    S.off[cfg.nW] = k;
    for (let w = 0; w < cfg.nW; w++) {
      S.estado[w] = presentes[w] ? PersonaRampa.LIBRE : PersonaRampa.AUSENTE;
      S.ultima[w] = S.off[w] < S.off[w + 1] ? S.lista[S.off[w]] : -1;
    }
    for (let r = 0; r < cfg.NR; r++) this.marcar(r, t); // una rampa de capacidad 0 está llena desde el inicio
  }

  /** Cae un paquete en la rampa r. */
  recibir(e: number, r: number, t: number): void {
    const h = this.h, S = this.S, cfg = h.cfg, fila = this.filas[r];
    fila.poner(e);
    if (cfg.fidelidad === 'F3' && fila.largo > cfg.rampaCap[r]) h.P.alerta(ALERTA.RAMPA_CAPACIDAD);
    const w = S.asignada[r], g = w >= 0 ? this.trabajador(w) : -1;
    h.P.pasar(e, TipoTramo.RAMPA, r, S.seq[r]++, t, 0, g >= 0 ? refDe(ClaseEntidad.PERSONA, g) : -1);
    h.P.mover(e, Lugar.RAMPA);
    S.recibidos[r]++;
    this.marcar(r, t);
    if (w >= 0 && S.estado[w] === PersonaRampa.LIBRE) this.atender(w, t);
  }

  /** Un no transportable resuelto en el puesto manual va directo a la jaula de la primera rampa de su ruta (regla 12). */
  directo(e: number, r: number, t: number): void {
    this.aJaula(e, r, t);
    const w = this.S.asignada[r];
    if (w >= 0 && this.S.estado[w] === PersonaRampa.LIBRE) this.atender(w, t);
  }

  private marcar(r: number, t: number): void {
    const S = this.S, llena = this.filas[r].largo >= this.h.cfg.rampaCap[r];
    if (llena && S.llenaDesde[r] < 0) {
      S.llenaDesde[r] = t;
      S.seLleno[r] = 1;
      this.h.m.traza.momento(t, TipoMomento.RAMPA_LLENA, r, this.filas[r].largo);
    } else if (!llena && S.llenaDesde[r] >= 0) {
      S.msLlena[r] += t - S.llenaDesde[r];
      S.llenaDesde[r] = -1;
      this.h.m.traza.momento(t, TipoMomento.RAMPA_LIBERA, r, this.filas[r].largo);
    }
  }

  /** Una persona libre elige su próxima tarea. */
  private atender(w: number, t: number): void {
    const S = this.S;
    if (S.estado[w] !== PersonaRampa.LIBRE) return;
    for (let i = S.off[w]; i < S.off[w + 1]; i++) {
      const r = S.lista[i];
      if (S.pendiente[r] > 0) { this.irA(w, r, CERRAR, t); return; }
    }
    const r = this.elegir(w);
    if (r >= 0) this.irA(w, r, TOMAR, t);
  }

  /** Rampa con paquetes según la regla de la persona (regla 11); −1 si ninguna tiene. */
  private elegir(w: number): number {
    const S = this.S, cfg = this.h.cfg, ini = S.off[w], fin = S.off[w + 1];
    if (ini === fin) return -1;
    if (cfg.regla === Regla.EN_ORDEN) {
      // La siguiente con paquetes después de la última atendida, en ronda (si nunca atendió, desde la primera).
      const n = fin - ini, ultima = S.posOrden[w] < 0 ? ini - 1 : S.posOrden[w];
      for (let j = 1; j <= n; j++) {
        const p = ini + mod(ultima - ini + j, n);
        if (this.filas[S.lista[p]].largo > 0) return S.lista[p];
      }
      return -1;
    }
    let mejor = -1, valor = 0;
    for (let i = ini; i < fin; i++) {
      const r = S.lista[i], oc = this.filas[r].largo;
      if (oc === 0) continue;
      if (cfg.regla === Regla.LA_MAS_LLENA) {
        if (mejor < 0 || oc > valor) { mejor = r; valor = oc; }
      } else {
        const peso = cfg.rampaPeso[r], v = peso > 0 ? (cfg.rampaCap[r] - oc) / peso : Infinity;
        if (mejor < 0 || v < valor) { mejor = r; valor = v; }
      }
    }
    return mejor;
  }

  private irA(w: number, r: number, tarea: number, t: number): void {
    const S = this.S, cfg = this.h.cfg;
    S.objetivo[w] = r;
    S.tarea[w] = tarea;
    if (S.ultima[w] !== r && cfg.caminarMs > 0) {
      S.estado[w] = PersonaRampa.CAMINA;
      this.h.personas.tarea(this.trabajador(w), TipoTramo.PERSONA_CAMINA, r, 0, t, t + cfg.caminarMs);
      this.h.m.agendar(t + cfg.caminarMs, this.id, EV.FIN_CAMINATA, w, Fase.NORMAL, 0);
      return;
    }
    S.ultima[w] = r;
    this.ejecutar(w, t);
  }

  private finCaminata(w: number, t: number): void {
    this.S.ultima[w] = this.S.objetivo[w];
    this.ejecutar(w, t);
  }

  private ejecutar(w: number, t: number): void {
    const h = this.h, S = this.S, cfg = h.cfg, r = S.objetivo[w], g = this.trabajador(w);
    if (S.tarea[w] === CERRAR) {
      S.pendiente[r]--;
      S.estado[w] = PersonaRampa.CIERRA;
      h.personas.tarea(g, TipoTramo.PERSONA_CIERRA_JAULA, r, 0, t, t + cfg.cierreMs);
      h.m.agendar(t + cfg.cierreMs, this.id, EV.FIN_CIERRE, w, Fase.NORMAL, 0);
      return;
    }
    const fila = this.filas[r];
    if (fila.largo === 0) { // no debería pasar: solo esta persona vacía la rampa
      S.estado[w] = PersonaRampa.LIBRE;
      this.atender(w, t);
      return;
    }
    const e = fila.sacar();
    this.marcar(r, t);
    for (let i = S.off[w]; i < S.off[w + 1]; i++) if (S.lista[i] === r) S.posOrden[w] = i;
    const dur = h.P.S.manejo[e];
    h.P.cerrado(e, TipoTramo.MANO, g, r, t, t + dur);
    h.P.mover(e, Lugar.MANO);
    h.personas.tarea(g, TipoTramo.PERSONA_TRABAJA, r, e, t, t + dur);
    S.item[w] = e;
    S.estado[w] = PersonaRampa.MANO;
    h.m.agendar(t + dur, this.id, EV.FIN_MANEJO, w, Fase.NORMAL, 0);
  }

  private finManejo(w: number, t: number): void {
    const S = this.S, e = S.item[w];
    S.item[w] = -1;
    this.aJaula(e, S.objetivo[w], t);
    this.finTarea(w, t);
  }

  private finCierre(w: number, t: number): void {
    this.h.m.traza.momento(t, TipoMomento.JAULA_CERRADA, this.S.objetivo[w], this.S.nroJaula[this.S.objetivo[w]] - 1);
    this.finTarea(w, t);
  }

  /** El paquete entra a la jaula abierta de la rampa r; si la completa, queda pendiente de cierre. */
  private aJaula(e: number, r: number, t: number): void {
    const h = this.h, S = this.S;
    h.P.pasar(e, TipoTramo.JAULA, r, S.nroJaula[r] * 1000 + S.lleno[r], t);
    h.P.mover(e, Lugar.JAULA);
    h.P.listo(e, t);
    h.medicion.clasificado();
    if (++S.lleno[r] >= h.cfg.jaulaCap) {
      S.lleno[r] = 0;
      S.nroJaula[r]++;
      S.pendiente[r]++;
    }
  }

  private finTarea(w: number, t: number): void {
    const S = this.S;
    if (S.pendientes[w] > 0) {
      S.pendientes[w]--;
      this.empezarPausa(w, t);
      return;
    }
    S.estado[w] = PersonaRampa.LIBRE;
    this.atender(w, t);
  }

  private pedirPausa(w: number, t: number): void {
    const S = this.S;
    if (S.estado[w] === PersonaRampa.AUSENTE) return;
    if (S.estado[w] === PersonaRampa.LIBRE) this.empezarPausa(w, t);
    else S.pendientes[w]++;
  }

  private empezarPausa(w: number, t: number): void {
    const h = this.h;
    this.S.estado[w] = PersonaRampa.PAUSA;
    h.personas.pausa(this.trabajador(w), this.S.ultima[w], t);
    h.m.agendar(t + aMs(h.cfg.pausasRampa.duracion), this.id, EV.PAUSA_FIN_RAMPA, w, Fase.NORMAL, 0);
  }

  private terminarPausa(w: number, t: number): void {
    const S = this.S;
    this.h.personas.finPausa(this.trabajador(w), t);
    if (S.pendientes[w] > 0) {
      S.pendientes[w]--;
      this.empezarPausa(w, t);
      return;
    }
    S.estado[w] = PersonaRampa.LIBRE;
    this.atender(w, t);
  }

  /** Paquetes en todas las rampas (conservación). */
  enRampas(): number {
    let n = 0;
    for (const f of this.filas) n += f.largo;
    return n;
  }

  estado(): EstadoBloque {
    const out = volcar(this.S, '', {});
    this.filas.forEach((f, r) => anidar(out, `fila${r}.`, f.estado()));
    return out;
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
    this.filas.forEach((f, r) => f.restaurar(desanidar(e, `fila${r}.`)));
  }
}
