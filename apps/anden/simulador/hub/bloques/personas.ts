// hub/bloques/personas.ts · Andén simulador, corte 1 · P4 (el hub). Ruta del bloque: 'personas'.
// El plantel de la noche (corte-1.md §6.7 reglas 1, 2 y 6): ausencias sorteadas en el inicio (fase URGENTE) para todas las
// personas de todos los roles, el retén que cubre (primero los puestos de inducción ausentes, de menor a mayor índice, y después
// las personas de rampa), quién trabaja en cada puesto, y la contabilidad de cada persona: tramos PERSONA_*, tiempo ocupado y el
// control de que nadie trabaje en pausa (invariante:pausa). Numeración global de personas: inducción, retén, rampa, descarga y
// excepción, en ese orden (la misma del catálogo de la traza).
import type { Direccion, FuenteAzar } from '../../contratos/azar.ts';
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import { Fase } from '../../contratos/tipos-base.ts';
import { TipoMomento, TipoTramo } from '../../contratos/traza.ts';
import { ALERTA, EV, cargar, volcar, type Hub } from './comun.ts';

/** Roles con su propósito de azar ('personas.<rol>', 'ausencia') y el ordinal de la persona en su rol (§6.3). */
export const ROLES = ['induccion', 'reten', 'rampa', 'descarga', 'excepcion'] as const;
export type Rol = (typeof ROLES)[number];

/**
 * ¿Falta esta persona esta noche? Bernoulli(p) en la dirección (claveDe('personas.<rol>', 'ausencia'), ordinal, 0, 0).
 * Con p = 0 no se sortea (nadie falta). Es pública para la prueba P02 (solo el sorteo, sin correr la noche).
 */
export function sorteaAusencia(azar: FuenteAzar, clave: number, ordinal: number, p: number, d?: Direccion): boolean {
  if (!(p > 0)) return false;
  const dir = d ?? { clave, a: 0, b: 0, c: 0 };
  dir.clave = clave;
  dir.a = ordinal;
  dir.b = 0;
  dir.c = 0;
  return azar.sortear({ tipo: 'bernoulli', p }, dir) === 1;
}

function estadoInicial(nP: number, NI: number, nW: number, nRet: number) {
  return {
    presente: new Uint8Array(nP).fill(1),
    /** Quién trabaja en cada puesto de inducción y en cada lugar de persona de rampa (id global; −1 nadie). */
    trabajadorInd: new Int32Array(NI).fill(-1), trabajadorRam: new Int32Array(nW).fill(-1),
    /** A quién cubre cada retén (id global; −1 a nadie). */
    cubre: new Int32Array(nRet).fill(-1),
    ocupado: new Float64Array(nP), desde: new Float64Array(nP), trabajando: new Uint8Array(nP),
    enPausa: new Uint8Array(nP), libreDesde: new Float64Array(nP),
    ausentes: 0, iniciado: 0,
  };
}

export class BloquePersonas implements Bloque {
  readonly ruta = 'personas';
  id = -1;
  readonly h: Hub;
  S: ReturnType<typeof estadoInicial>;
  private idxTrabajo: Int32Array;
  private idxPausa: Int32Array;

  constructor(h: Hub) {
    this.h = h;
    const c = h.cfg;
    this.S = estadoInicial(c.nPersonas, c.NI, c.nW, c.nRet);
    this.idxTrabajo = new Int32Array(c.nPersonas).fill(-1);
    this.idxPausa = new Int32Array(c.nPersonas).fill(-1);
  }

  agendarInicial(): void {
    this.h.m.agendar(this.h.cfg.inicio, this.id, EV.INICIO_TURNO, 0, Fase.URGENTE, 0);
  }

  manejar(m: Motor, tipo: number, _arg: number): void {
    this.h.tUltimo = m.ahora;
    if (tipo !== EV.INICIO_TURNO) throw new Error(`personas: tipo de evento desconocido ${tipo} (se esperaba ${EV.INICIO_TURNO}).`);
    this.iniciarTurno(m.ahora);
  }

  /** Ausencias, retén y arranque de puestos y rampas (regla 2). */
  private iniciarTurno(t: number): void {
    const h = this.h, c = h.cfg, m = h.m, S = this.S, tr = m.traza;
    const d: Direccion = { clave: 0, a: 0, b: 0, c: 0 };
    const sortearRol = (rol: Rol, desde: number, cuantas: number, p: number) => {
      const clave = m.claveDe(`personas.${rol}`, 'ausencia');
      for (let i = 0; i < cuantas; i++) {
        if (sorteaAusencia(m.azar, clave, i, p, d)) {
          S.presente[desde + i] = 0;
          S.ausentes++;
          tr.momento(t, TipoMomento.AUSENCIA, desde + i, 0);
        }
      }
    };
    // Retén con el ausentismo de inducción; descarga y excepción no tienen ausentismo en el esquema (NOTAS-CONTRATO §1).
    sortearRol('induccion', c.offInd, c.activos, c.ausentismoInduccion);
    sortearRol('reten', c.offRet, c.nRet, c.ausentismoInduccion);
    sortearRol('rampa', c.offRam, c.nW, c.ausentismoRampa);
    sortearRol('descarga', c.offDes, c.offExc - c.offDes, 0);
    sortearRol('excepcion', c.offExc, c.nX, 0);

    for (let i = 0; i < c.activos; i++) S.trabajadorInd[i] = S.presente[c.offInd + i] ? c.offInd + i : -1;
    for (let i = 0; i < c.nW; i++) S.trabajadorRam[i] = S.presente[c.offRam + i] ? c.offRam + i : -1;
    // El retén cubre: inducción ausente (de menor a mayor índice) y después rampa ausente.
    let ri = 0;
    const siguienteReten = (): number => {
      while (ri < c.nRet && !S.presente[c.offRet + ri]) ri++;
      return ri < c.nRet ? ri++ : -1;
    };
    for (let i = 0; i < c.activos; i++) {
      if (S.trabajadorInd[i] >= 0) continue;
      const r = siguienteReten();
      if (r < 0) break;
      S.trabajadorInd[i] = c.offRet + r;
      S.cubre[r] = c.offInd + i;
      tr.momento(t, TipoMomento.REEMPLAZO, c.offRet + r, c.offInd + i);
    }
    for (let i = 0; i < c.nW; i++) {
      if (S.trabajadorRam[i] >= 0) continue;
      const r = siguienteReten();
      if (r < 0) break;
      S.trabajadorRam[i] = c.offRet + r;
      S.cubre[r] = c.offRam + i;
      tr.momento(t, TipoMomento.REEMPLAZO, c.offRet + r, c.offRam + i);
    }
    // Las ausencias quedan como tramos PERSONA_AUSENTE de todo el turno (r = puesto para inducción, −1 para los demás).
    for (let g = 0; g < c.nPersonas; g++) {
      if (S.presente[g]) continue;
      const r = g < c.offRet ? g - c.offInd : -1;
      tr.tramo(g, TipoTramo.PERSONA_AUSENTE, r, 0, t, c.fin);
    }
    S.iniciado = 1;
    h.ind.alIniciar(t);
    h.rampas.alIniciar(t);
  }

  /** Personas presentes de todos los roles (con el retén): las que cobran la noche (regla 1). */
  presentes(): number {
    let n = 0;
    for (let g = 0; g < this.S.presente.length; g++) n += this.S.presente[g];
    return n;
  }

  // ---- Contabilidad de cada persona ----

  /** Empieza una tarea abierta (inducción, descarga de un camión): tramo `k` desde t. */
  empezar(w: number, k: TipoTramo, r: number, a: number, t: number): void {
    const S = this.S;
    if (S.enPausa[w] || S.trabajando[w]) this.h.P.alerta(ALERTA.PAUSA);
    S.trabajando[w] = 1;
    S.desde[w] = t;
    this.idxTrabajo[w] = this.h.m.traza.abrir(w, k, r, a, t);
  }

  terminar(w: number, t: number): void {
    const S = this.S;
    if (!S.trabajando[w]) return;
    S.trabajando[w] = 0;
    S.ocupado[w] += t - S.desde[w];
    S.libreDesde[w] = t;
    this.h.m.traza.cerrar(this.idxTrabajo[w], t);
    this.idxTrabajo[w] = -1;
  }

  /** Tarea de duración conocida [t0, t1] (caminar, manejar un paquete, cerrar una jaula, el puesto manual). */
  tarea(w: number, k: TipoTramo, r: number, a: number, t0: number, t1: number): void {
    const S = this.S;
    if (S.enPausa[w] || S.trabajando[w] || t0 < S.libreDesde[w]) this.h.P.alerta(ALERTA.PAUSA);
    S.ocupado[w] += t1 - t0;
    S.libreDesde[w] = t1;
    this.h.m.traza.tramo(w, k, r, a, t0, t1);
  }

  /** Empieza una pausa (r = puesto o rampa donde la toma, −1 si no aplica). */
  pausa(w: number, r: number, t: number): void {
    const S = this.S;
    if (S.trabajando[w] || t < S.libreDesde[w] || S.enPausa[w]) this.h.P.alerta(ALERTA.PAUSA);
    S.enPausa[w] = 1;
    const tr = this.h.m.traza;
    tr.momento(t, TipoMomento.PAUSA_INICIO, w, 0);
    this.idxPausa[w] = tr.abrir(w, TipoTramo.PERSONA_PAUSA, r, 0, t);
  }

  finPausa(w: number, t: number): void {
    const S = this.S;
    S.enPausa[w] = 0;
    S.libreDesde[w] = t;
    const tr = this.h.m.traza;
    tr.cerrar(this.idxPausa[w], t);
    this.idxPausa[w] = -1;
    tr.momento(t, TipoMomento.PAUSA_FIN, w, 0);
  }

  /** Tiempo ocupado de la persona hasta t (con la tarea abierta, si la hay). */
  ocupadoHasta(w: number, t: number): number {
    const S = this.S;
    return S.ocupado[w] + (S.trabajando[w] ? Math.max(0, t - S.desde[w]) : 0);
  }

  estado(): EstadoBloque {
    return volcar(this.S, '', {});
  }

  restaurar(e: EstadoBloque): void {
    cargar(this.S, e, '', this.ruta);
    this.idxTrabajo.fill(-1);
    this.idxPausa.fill(-1);
  }
}
