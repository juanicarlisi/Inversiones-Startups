// hub/bloques/andenes.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'hub.andenes'.
// Playa, andenes, descarga a granel y cintas (corte-1.md §6.7 reglas 3 y 4):
// - un camión llega y toma el andén libre de menor índice; si no hay, espera en la playa (FIFO por llegada). Los que llegan antes del
//   inicio esperan hasta que abren los andenes (inicio, fase NORMAL);
// - el andén con p personas descarga el paquete i en ritmo(camión, i) ÷ p; al terminar, el paquete NACE (tramo DESCARGA desde que
//   el andén lo empezó) y entra a su cinta en max(t, última entrada + paso ÷ velocidad); viaja largo ÷ velocidad (tramo CINTA).
//   Mientras espera el hueco en la cinta, lo tienen las personas del andén: el paquete que sigue empieza cuando este entró
//   (bloqueo después del servicio; NOTAS-CONTRATO §3);
// - contrapresión: antes de empezar cada paquete, si acumulación + cintas + en descarga ≥ lugares de la acumulación, el andén para
//   y el tramo DESCARGA que sigue lleva causa BLOQUEO; vuelve cuando la acumulación saca un paquete (NOTAS-CONTRATO §3);
// - al terminar el último paquete, `papeleo` segundos y el andén queda libre.
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase } from '../../contratos/tipos-base.ts';
import { Causa, TipoTramo } from '../../contratos/traza.ts';
import { Anillo } from '../estructuras/anillo.ts';
import { EV, Lugar, anidar, cargar, desanidar, duracionMs, volcar, type Hub } from './comun.ts';

function estadoInicial(nA: number) {
  return {
    /** Camión en cada andén (−1 libre), paquetes que faltan empezar e índice del próximo paquete del camión. */
    camion: new Int32Array(nA).fill(-1), resta: new Int32Array(nA), indice: new Int32Array(nA),
    /** Desde cuándo el andén está listo para el paquete que sigue (inicio del tramo DESCARGA) y si estuvo parado. */
    tListo: new Float64Array(nA), bloqueado: new Uint8Array(nA), fueBloqueado: new Uint8Array(nA),
    /** 1 si el andén tiene un paquete en descarga. */
    descargando: new Uint8Array(nA),
    /** Última entrada a la cinta de cada andén (ms; −1 nunca). */
    ultimaEntrada: new Float64Array(nA).fill(-1),
    enDescarga: 0, enCinta: 0, abierto: 0,
  };
}

export class BloqueAndenes implements Bloque {
  readonly ruta = 'hub.andenes';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  readonly playa = new Anillo();
  private idxAnden: Int32Array;
  private readonly dRitmo = { clave: 0, a: 0, b: 0, c: 0 };

  constructor(h: Hub) {
    this.h = h;
    this.S = estadoInicial(h.cfg.nA);
    this.idxAnden = new Int32Array(h.cfg.nA).fill(-1);
    this.dRitmo.clave = h.m.claveDe('personas.descarga', 'ritmo');
  }

  agendarInicial(): void {
    this.h.m.agendar(this.h.cfg.inicio, this.id, EV.ABRIR_ANDENES, 0, Fase.NORMAL, 0);
  }

  manejar(m: Motor, tipo: number, arg: number): void {
    const t = m.ahora;
    this.h.tUltimo = t;
    switch (tipo) {
      case EV.ABRIR_ANDENES: this.abrir(t); return;
      case EV.FIN_DESCARGA: this.finDescarga(arg, t); return;
      case EV.ANDEN_LIBRE: this.liberar(arg, t); return;
      case EV.ANDEN_SIGUE: this.S.descargando[arg] = 0; this.intentar(arg, t); return;
      default: throw new Error(`hub.andenes: tipo de evento desconocido ${tipo} (se esperaba ${EV.ABRIR_ANDENES}, ${EV.FIN_DESCARGA}, ${EV.ANDEN_LIBRE} o ${EV.ANDEN_SIGUE}).`);
    }
  }

  /** Lugares ocupados que cuentan para la contrapresión. */
  enCamino(): number {
    return this.h.acum.fila.largo + this.S.enCinta + this.S.enDescarga;
  }

  hayBloqueados(): boolean {
    for (let d = 0; d < this.S.bloqueado.length; d++) if (this.S.bloqueado[d]) return true;
    return false;
  }

  llegaCamion(c: number, t: number): void {
    if (this.S.abierto) {
      const d = this.andenLibre();
      if (d >= 0) { this.asignar(d, c, t); return; }
    }
    this.playa.poner(c);
  }

  private andenLibre(): number {
    const S = this.S, p = this.h.cfg.andenPersonas;
    for (let d = 0; d < S.camion.length; d++) if (S.camion[d] < 0 && p[d] > 0) return d;
    return -1;
  }

  private abrir(t: number): void {
    this.S.abierto = 1;
    while (this.playa.largo > 0) {
      const d = this.andenLibre();
      if (d < 0) break;
      this.asignar(d, this.playa.sacar(), t);
    }
  }

  private asignar(d: number, c: number, t: number): void {
    const h = this.h, cfg = h.cfg, S = this.S, D = h.demanda.S, tr = h.m.traza;
    const llegada = D.llegada[c];
    D.asignado[c] = t;
    if (t > llegada) {
      const causa = t > Math.max(llegada, cfg.inicio) ? Causa.ANDEN_OCUPADO : Causa.NINGUNA;
      tr.tramo(c, TipoTramo.CAMION_PLAYA, -1, 0, llegada, t, causa);
    }
    S.camion[d] = c;
    S.resta[d] = D.paquetes[c];
    S.indice[d] = 0;
    S.tListo[d] = t;
    S.fueBloqueado[d] = 0;
    S.bloqueado[d] = 0;
    this.idxAnden[d] = tr.abrir(c, TipoTramo.CAMION_ANDEN, d, D.paquetes[c], t);
    for (let w = cfg.desOff[d]; w < cfg.desOff[d + 1]; w++) h.personas.empezar(cfg.offDes + w, TipoTramo.PERSONA_TRABAJA, d, 0, t);
    if (S.resta[d] === 0) this.ultimoPaquete(d, t);
    else this.intentar(d, t);
  }

  /** Empieza el paquete que sigue, si la contrapresión lo deja. */
  intentar(d: number, t: number): void {
    const h = this.h, cfg = h.cfg, S = this.S;
    const c = S.camion[d];
    if (c < 0 || S.resta[d] === 0 || S.descargando[d]) return;
    if (this.enCamino() >= cfg.acumCap) {
      if (!S.bloqueado[d]) {
        S.bloqueado[d] = 1;
        S.fueBloqueado[d] = 1;
        h.acum.marcarLlena(t);
      }
      return;
    }
    S.bloqueado[d] = 0;
    S.descargando[d] = 1;
    S.enDescarga++;
    this.dRitmo.a = c;
    this.dRitmo.b = S.indice[d];
    const ritmo = h.m.azar.sortear(cfg.ritmoDescarga, this.dRitmo);
    const dur = duracionMs(ritmo / cfg.andenPersonas[d], 'el ritmo de descarga');
    h.m.agendar(t + dur, this.id, EV.FIN_DESCARGA, d, Fase.NORMAL, 0);
  }

  private finDescarga(d: number, t: number): void {
    const h = this.h, cfg = h.cfg, S = this.S, P = h.P;
    const c = S.camion[d], i = S.indice[d];
    S.enDescarga--;
    const e = P.nacer(c, i, S.tListo[d], t);
    const entrada = S.ultimaEntrada[d] < 0 ? t : Math.max(t, S.ultimaEntrada[d] + cfg.espaciadoMs[d]);
    S.ultimaEntrada[d] = entrada;
    const llega = entrada + cfg.transitoMs[d];
    P.cerrado(e, TipoTramo.DESCARGA, d, c, S.tListo[d], entrada, S.fueBloqueado[d] ? Causa.BLOQUEO : Causa.NINGUNA);
    P.cerrado(e, TipoTramo.CINTA, cfg.cintaDeAnden[d], 0, entrada, llega);
    P.mover(e, Lugar.CINTA);
    S.enCinta++;
    h.m.agendar(llega, h.acum.id, EV.LLEGA_ACUMULACION, e, Fase.NORMAL, 0);
    S.fueBloqueado[d] = 0;
    S.tListo[d] = entrada;
    S.indice[d] = i + 1;
    S.resta[d]--;
    if (S.resta[d] === 0) {
      S.descargando[d] = 0;
      this.ultimoPaquete(d, entrada);
    } else if (entrada > t) {
      // las personas del andén sostienen el paquete hasta que entra a la cinta; el que sigue empieza en ese instante
      h.m.agendar(entrada, this.id, EV.ANDEN_SIGUE, d, Fase.NORMAL, 0);
    } else {
      S.descargando[d] = 0;
      this.intentar(d, t);
    }
  }

  /** Último paquete del camión: termina en `t` (cuando entró a la cinta); después, el papeleo y el andén libre. */
  private ultimoPaquete(d: number, t: number): void {
    const h = this.h, cfg = h.cfg;
    h.demanda.S.descargados++;
    for (let w = cfg.desOff[d]; w < cfg.desOff[d + 1]; w++) h.personas.terminar(cfg.offDes + w, t);
    h.m.agendar(t + cfg.papeleoMs, this.id, EV.ANDEN_LIBRE, d, Fase.NORMAL, 0);
  }

  private liberar(d: number, t: number): void {
    if (this.S.camion[d] >= 0) this.h.demanda.S.salida[this.S.camion[d]] = t;
    this.h.m.traza.cerrar(this.idxAnden[d], t);
    this.idxAnden[d] = -1;
    this.S.camion[d] = -1;
    if (this.playa.largo > 0) this.asignar(d, this.playa.sacar(), t);
  }

  /** La acumulación sacó un paquete: los andenes parados vuelven, en orden, mientras haya lugar. */
  reanudar(t: number): void {
    const S = this.S;
    for (let d = 0; d < S.bloqueado.length; d++) if (S.bloqueado[d]) this.intentar(d, t);
  }

  estado(): EstadoBloque {
    return anidar(volcar(this.S, '', {}), 'playa.', this.playa.estado());
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
    this.playa.restaurar(desanidar(e, 'playa.'));
    this.idxAnden.fill(-1);
  }
}
