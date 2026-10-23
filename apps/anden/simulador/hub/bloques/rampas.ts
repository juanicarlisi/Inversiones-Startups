// hub/bloques/rampas.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.rampas'.
// Rampas con capacidad, jaulas y personas de rampa (corte-1.md §6.7 reglas 7, 10 y 11, con los cambios del motor 1.1.0):
// - cada rampa es una fila FIFO (tramo RAMPA con a = secuencia en la rampa y q = la persona que la atiende en ese momento);
// - el plan (a qué persona le toca cada rampa) se arma en el inicio, después de las ausencias (plan.ts);
// - una persona libre atiende primero una jaula completa pendiente de cierre y si no elige entre sus rampas con paquetes según la
//   regla ('la-mas-llena', 'la-que-se-llena-antes' o 'en-orden'). Con 'la-mas-llena' y 'la-que-se-llena-antes' se QUEDA en la rampa
//   donde está mientras tenga paquetes y ninguna otra de las suyas esté llena, y en un empate gana la rampa donde está y después la
//   más cercana (1.1.0, hallazgo R2: en 1.0.0 iba y venía entre dos rampas por cada paquete);
// - si cambia de rampa camina la distancia por el pasillo a 1,2 m/s, con `caminar` s como mínimo (1.1.0, hallazgo R1: en 1.0.0 eran
//   `caminar` s fijos, cruzara el lazo o no; config.ts › caminataMs) (PERSONA_CAMINA), toma el primero de la rampa, lo maneja (MANO)
//   y lo pone en la jaula (JAULA, a = jaula·1000 + posición). Al completar la jaula la cierra (`cierre` s, PERSONA_CIERRA_JAULA) y
//   empieza otra;
// - pausas como en la inducción (regla 6), con las de `personas.rampa.pausas`; desde 1.1.0 (hallazgo R3) mientras una persona está en
//   pausa sus rampas las atiende la siguiente persona presente que no esté en pausa (en ronda), como con una ausencia, o, si no había
//   ninguna, la primera que vuelve de la suya; al volver las recupera; y si la noche se alarga después del fin del turno, las pausas
//   siguen con el mismo ritmo mientras quede trabajo (R4).
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase, aMs } from '../../contratos/tipos-base.ts';
import { ClaseEntidad, TipoMomento, TipoTramo, refDe } from '../../contratos/traza.ts';
import { Anillo } from '../estructuras/anillo.ts';
import { Regla, caminataMs, distanciaRampas, instantesDePausa, pausaTrasFin, type ConfigHub } from '../config.ts';
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
    /** Lugar de persona de rampa que atiende cada rampa AHORA (−1 nadie): la del plan, o quien la releva mientras está en pausa. */
    asignada: new Int32Array(NR).fill(-1),
    /** Lugar de persona de rampa a quien le toca la rampa según el plan del inicio (−1 nadie). */
    duenia: new Int32Array(NR).fill(-1),
    // personas de rampa
    estado: new Uint8Array(nW), ultima: new Int32Array(nW).fill(-1), objetivo: new Int32Array(nW).fill(-1),
    /** 'en-orden': la última rampa atendida (índice de rampa; −1 si todavía ninguna). */
    tarea: new Uint8Array(nW), item: new Int32Array(nW).fill(-1), pendientes: new Uint8Array(nW), posOrden: new Int32Array(nW).fill(-1),
    /** Número de la jaula que está cerrando cada persona (las de una rampa se cierran en el orden en que se completaron). */
    cerrando: new Int32Array(nW).fill(-1),
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
      // La primera pausa después del fin del turno (R4): si para entonces no queda trabajo, se descarta sin dejar rastro.
      const tras = pausaTrasFin(cfg, cfg.pausasRampa, w, cfg.fin - 1);
      if (tras >= 0) h.m.agendar(tras, this.id, EV.PAUSA_INICIO_RAMPA, w, Fase.URGENTE, 0);
    }
  }

  manejar(m: Motor, tipo: number, w: number): void {
    const t = m.ahora;
    // Una pausa después del fin del turno sin trabajo pendiente no pasa: ni siquiera mueve el último instante de la noche.
    if (tipo === EV.PAUSA_INICIO_RAMPA && t >= this.h.cfg.fin && this.h.terminado()) return;
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

  /** En el inicio (después de las ausencias): plan de rampas y personas listas, cada una parada en la primera de sus rampas. */
  alIniciar(t: number): void {
    const h = this.h, cfg = h.cfg, S = this.S;
    const presentes = Uint8Array.from(h.personas.S.trabajadorRam, (w) => (w >= 0 ? 1 : 0));
    asignarRampas(cfg, presentes, S.asignada);
    S.duenia.set(S.asignada);
    for (let w = 0; w < cfg.nW; w++) {
      S.estado[w] = presentes[w] ? PersonaRampa.LIBRE : PersonaRampa.AUSENTE;
      S.ultima[w] = -1;
    }
    for (let r = cfg.NR - 1; r >= 0; r--) if (S.asignada[r] >= 0) S.ultima[S.asignada[r]] = r;
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

  /** Una persona libre elige su próxima tarea: una jaula para cerrar (primero la de la rampa donde está) o un paquete. */
  private atender(w: number, t: number): void {
    const S = this.S, NR = this.h.cfg.NR;
    if (S.estado[w] !== PersonaRampa.LIBRE) return;
    const aca = S.ultima[w];
    if (aca >= 0 && S.asignada[aca] === w && S.pendiente[aca] > 0) { this.irA(w, aca, CERRAR, t); return; }
    for (let r = 0; r < NR; r++) {
      if (S.asignada[r] === w && S.pendiente[r] > 0) { this.irA(w, r, CERRAR, t); return; }
    }
    const r = this.elegir(w);
    if (r >= 0) this.irA(w, r, TOMAR, t);
  }

  /** ¿La rampa r está llena? */
  private llena(r: number): boolean {
    return this.filas[r].largo >= this.h.cfg.rampaCap[r];
  }

  /** Rampa con paquetes según la regla de la persona (regla 11, con la persistencia de 1.1.0); −1 si ninguna de las suyas tiene. */
  private elegir(w: number): number {
    const S = this.S, cfg = this.h.cfg, NR = cfg.NR;
    if (cfg.regla === Regla.EN_ORDEN) {
      // La siguiente con paquetes después de la última atendida, en ronda por el orden del modelo (si nunca atendió, desde la primera).
      const ultima = S.posOrden[w];
      for (let j = 1; j <= NR; j++) {
        const r = mod(ultima + j, NR);
        if (S.asignada[r] === w && this.filas[r].largo > 0) return r;
      }
      return -1;
    }
    // Persistencia (R2): se queda donde está mientras tenga paquetes, salvo que otra de sus rampas esté llena y esta no.
    const aca = S.ultima[w];
    let hayLlena = false;
    for (let r = 0; r < NR; r++) if (r !== aca && S.asignada[r] === w && this.llena(r)) { hayLlena = true; break; }
    if (aca >= 0 && S.asignada[aca] === w && this.filas[aca].largo > 0 && (!hayLlena || this.llena(aca))) return aca;
    // Si no, la mejor según la regla. Empate: la rampa donde está, después la más cercana, después el orden del modelo.
    let mejor = -1, valor = 0, dist = 0;
    for (let r = 0; r < NR; r++) {
      if (S.asignada[r] !== w) continue;
      const oc = this.filas[r].largo;
      if (oc === 0) continue;
      let v: number;
      if (cfg.regla === Regla.LA_MAS_LLENA) v = -oc;
      else { const peso = cfg.rampaPeso[r]; v = peso > 0 ? (cfg.rampaCap[r] - oc) / peso : Infinity; }
      const d = aca < 0 || r === aca ? -1 : distanciaRampas(cfg, aca, r);
      if (mejor < 0 || v < valor || (v === valor && d < dist)) { mejor = r; valor = v; dist = d; }
    }
    return mejor;
  }

  private irA(w: number, r: number, tarea: number, t: number): void {
    const S = this.S, cfg = this.h.cfg;
    S.objetivo[w] = r;
    S.tarea[w] = tarea;
    const camina = caminataMs(cfg, S.ultima[w], r);
    if (camina > 0) {
      S.estado[w] = PersonaRampa.CAMINA;
      this.h.personas.tarea(this.trabajador(w), TipoTramo.PERSONA_CAMINA, r, 0, t, t + camina);
      this.h.m.agendar(t + camina, this.id, EV.FIN_CAMINATA, w, Fase.NORMAL, 0);
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
      if (S.pendiente[r] <= 0) {
        // La cerró otra persona mientras esta caminaba (un relevo que llega cuando la dueña ya volvió de la pausa y la cerró en el
        // acto): no hay jaula que cerrar. Sin esta guarda se daba por cerrada una jaula que todavía no se había completado, y esa,
        // al completarse, no se cerraba nunca (NOTAS-CONTRATO §16). Busca otra tarea, como cuando la rampa quedó vacía.
        S.estado[w] = PersonaRampa.LIBRE;
        this.atender(w, t);
        return;
      }
      // Se completaron nroJaula jaulas y quedan `pendiente` sin empezar a cerrar: esta es la primera de esas.
      S.cerrando[w] = S.nroJaula[r] - S.pendiente[r];
      S.pendiente[r]--;
      S.estado[w] = PersonaRampa.CIERRA;
      h.personas.tarea(g, TipoTramo.PERSONA_CIERRA_JAULA, r, 0, t, t + cfg.cierreMs);
      h.m.agendar(t + cfg.cierreMs, this.id, EV.FIN_CIERRE, w, Fase.NORMAL, 0);
      return;
    }
    const fila = this.filas[r];
    if (fila.largo === 0) { // la vació otra persona mientras esta caminaba (un relevo que termina): busca otra tarea
      S.estado[w] = PersonaRampa.LIBRE;
      this.atender(w, t);
      return;
    }
    const e = fila.sacar();
    this.marcar(r, t);
    S.posOrden[w] = r;
    const dur = h.P.S.manejo[e];
    h.P.cerrado(e, TipoTramo.MANO, g, r, t, t + dur);
    h.P.mover(e, Lugar.MANO);
    h.personas.tarea(g, TipoTramo.PERSONA_TRABAJA, r, e, t, t + dur);
    S.item[w] = e;
    S.estado[w] = PersonaRampa.MANO;
    h.m.agendar(t + dur, this.id, EV.FIN_MANEJO, w, Fase.NORMAL, 0);
  }

  private finManejo(w: number, t: number): void {
    const S = this.S, e = S.item[w], r = S.objetivo[w];
    S.item[w] = -1;
    this.aJaula(e, r, t);
    this.finTarea(w, t);
    // Si mientras esta persona manejaba el paquete la rampa pasó a otra (la dueña volvió de la pausa y recuperó sus rampas) y el
    // paquete completó la jaula, la jaula queda pendiente para quien atiende la rampa ahora, como toda jaula pendiente: si está libre,
    // tiene que enterarse ya. Sin este aviso quedaba libre con una jaula para cerrar hasta que le cayera otro paquete (NOTAS-CONTRATO
    // §17). Si no hay jaula pendiente, quien está libre no tiene nada que hacer en sus rampas y `atender` no hace nada.
    const x = S.asignada[r];
    if (x >= 0 && x !== w && S.estado[x] === PersonaRampa.LIBRE) this.atender(x, t);
  }

  private finCierre(w: number, t: number): void {
    // v = la jaula que cerró esta persona (no la última completa: mientras cerraba se pudo completar otra, por ejemplo con un no
    // transportable que entró directo desde el puesto manual).
    this.h.m.traza.momento(t, TipoMomento.JAULA_CERRADA, this.S.objetivo[w], this.S.cerrando[w]);
    this.S.cerrando[w] = -1;
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
    const S = this.S, cfg = this.h.cfg;
    // Después del fin del turno, la pausa siguiente del mismo ritmo (se descarta en manejar() si para entonces no queda trabajo).
    if (t >= cfg.fin) {
      const otra = pausaTrasFin(cfg, cfg.pausasRampa, w, t);
      if (otra >= 0) this.h.m.agendar(otra, this.id, EV.PAUSA_INICIO_RAMPA, w, Fase.URGENTE, 0);
    }
    if (S.estado[w] === PersonaRampa.AUSENTE) return;
    if (S.estado[w] === PersonaRampa.LIBRE) this.empezarPausa(w, t);
    else S.pendientes[w]++;
  }

  private empezarPausa(w: number, t: number): void {
    const h = this.h, S = this.S, nW = h.cfg.nW;
    S.estado[w] = PersonaRampa.PAUSA;
    h.personas.pausa(this.trabajador(w), S.ultima[w], t);
    h.m.agendar(t + aMs(h.cfg.pausasRampa.duracion), this.id, EV.PAUSA_FIN_RAMPA, w, Fase.NORMAL, 0);
    // Relevo (R3): las rampas que atendía pasan a la siguiente persona presente que no está en pausa, en ronda.
    let v = -1;
    for (let j = 1; j < nW; j++) {
      const x = (w + j) % nW;
      if (S.estado[x] !== PersonaRampa.AUSENTE && S.estado[x] !== PersonaRampa.PAUSA) { v = x; break; }
    }
    if (v < 0) return;
    let paso = false;
    for (let r = 0; r < h.cfg.NR; r++) if (S.asignada[r] === w) { S.asignada[r] = v; paso = true; }
    if (paso && S.estado[v] === PersonaRampa.LIBRE) this.atender(v, t);
  }

  private terminarPausa(w: number, t: number): void {
    const S = this.S;
    this.h.personas.finPausa(this.trabajador(w), t);
    // Vuelve y recupera sus rampas, las tenga quien las tenga. Y releva las rampas que quedaron sin nadie porque cuando su persona
    // empezó la pausa no había otra disponible (todas en pausa): «durante la pausa sus rampas las atiende la siguiente persona presente
    // que no esté en pausa» (1.1.0, R3) vale también para quien vuelve durante esa pausa (NOTAS-CONTRATO §17). Con tres personas de
    // rampa o más y las pausas de las plantillas no pasa nunca (a lo sumo dos personas en pausa a la vez).
    for (let r = 0; r < this.h.cfg.NR; r++) {
      if (S.duenia[r] === w) S.asignada[r] = w;
      else if (S.asignada[r] >= 0 && S.asignada[r] !== w && S.estado[S.asignada[r]] === PersonaRampa.PAUSA) S.asignada[r] = w;
    }
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
