// hub/kpi.ts · Andén simulador, corte 1 · P4 (el hub).
// Indicadores de una noche (corte-1.md §6.9, definiciones exactas), resultados por recurso y por cuarto de hora, y las invariantes
// que el simulador controla en cada noche (§6.7 regla 16). Lee el estado final de los bloques; no simula ni sortea nada.
import type { ResultadoCorrida } from '../contratos/motor.ts';
import type { KpiId, ResultadoReplica } from '../contratos/resultados.ts';
import { TipoTramo, type Traza } from '../contratos/traza.ts';
import { ALERTA, LUGARES, Lugar, type Hub } from './bloques/comun.ts';
import { costoNoche, costoPorPaquete, horasPersonaPagadas } from './costos.ts';

const MS_POR_MIN = 60_000, MS_POR_HORA = 3_600_000;

/** P_q = x₍min(n−1, ⌊q·n⌋)₎ con x ordenado ascendente (NaN si n = 0). */
export function percentil(ordenados: Float64Array, q: number): number {
  const n = ordenados.length;
  if (n === 0) return Number.NaN;
  return ordenados[Math.min(n - 1, Math.floor(q * n))];
}

/** Conservación por bloque: cada lugar cuenta lo mismo que su bloque, y todo nacido está en algún lugar. */
export function conservacionOk(h: Hub): boolean {
  const P = h.P.S, c = P.cuentas;
  let suma = 0;
  for (let l = 1; l < LUGARES; l++) suma += c[l];
  if (suma !== P.nacidos || c[Lugar.NADA] !== -P.nacidos) return false;
  const recuento = new Int32Array(LUGARES);
  for (let e = 0; e < P.nacidos; e++) recuento[P.lugar[e]]++;
  for (let l = 1; l < LUGARES; l++) if (recuento[l] !== c[l]) return false;
  if (c[Lugar.CINTA] !== h.andenes.S.enCinta) return false;
  if (c[Lugar.ACUMULACION] !== h.acum.fila.largo) return false;
  if (c[Lugar.RAMPA] !== h.rampas.enRampas()) return false;
  if (c[Lugar.BANDEJA] !== h.sorter.S.enBandejas) return false;
  if (c[Lugar.COLA_MANUAL] !== h.exc.cola.largo) return false;
  if (c[Lugar.JAULA] !== P.enJaula) return false;
  if (h.cfg.fidelidad === 'F3' && c[Lugar.ESPERA] !== h.sorter.S.esperando) return false;
  return true;
}

/** Bandejas: cada paquete en bandeja ocupa exactamente las que necesita (F3). */
export function bandejasOk(h: Hub): boolean {
  if (h.cfg.fidelidad !== 'F3') return true;
  const P = h.P.S;
  let esperadas = 0;
  for (let e = 0; e < P.nacidos; e++) if (P.lugar[e] === Lugar.BANDEJA) esperadas += h.cfg.claseBandejas[P.clase[e]];
  return esperadas === h.sorter.bandejasOcupadas();
}

/**
 * Invariante de tiempo sobre la traza terminada: todo tramo con t1 ≥ t0 y los tramos de cada paquete encadenados sin huecos
 * (en el orden en que se escribieron, que para un paquete es el cronológico).
 */
export function trazaEncadenada(t: Traza): boolean {
  const T = t.tramos, fin = new Float64Array(t.paquetes.n).fill(Number.NaN);
  const esPaquete = (k: number) => k >= TipoTramo.DESCARGA && k <= TipoTramo.MANUAL;
  for (let i = 0; i < T.n; i++) {
    if (!(T.t1[i] >= T.t0[i])) return false;
    if (!esPaquete(T.k[i])) continue;
    const e = T.e[i];
    if (e < 0 || e >= fin.length) return false;
    if (!Number.isNaN(fin[e]) && fin[e] !== T.t0[i]) return false;
    if (Number.isNaN(fin[e]) && T.t0[i] !== t.paquetes.creado[e]) return false;
    fin[e] = T.t1[i];
  }
  return true;
}

/** Orden fijo de las alertas en ResultadoReplica.alertas. */
export const ORDEN_ALERTAS = [
  'conservacion', 'invariante:rampa-capacidad', 'invariante:bandeja-unica', 'invariante:tiempo', 'invariante:pausa', 'no-termina',
  'tope-eventos', 'lazo-tiempo-cero',
] as const;

export function ordenarAlertas(a: string[]): void {
  const pos = (x: string) => { const i = (ORDEN_ALERTAS as readonly string[]).indexOf(x); return i < 0 ? ORDEN_ALERTAS.length : i; };
  a.sort((x, y) => pos(x) - pos(y));
}

/** Alertas de la noche (las invariantes del estado final y lo que levantaron los bloques mientras corría). */
export function alertasDe(h: Hub, rc: ResultadoCorrida): string[] {
  const a: string[] = [], P = h.P.S;
  if (!conservacionOk(h)) a.push('conservacion');
  if (P.alertas & ALERTA.RAMPA_CAPACIDAD) a.push('invariante:rampa-capacidad');
  if (P.alertas & ALERTA.BANDEJA_UNICA || !bandejasOk(h)) a.push('invariante:bandeja-unica');
  if (P.alertas & ALERTA.TIEMPO) a.push('invariante:tiempo');
  if (P.alertas & ALERTA.PAUSA) a.push('invariante:pausa');
  if (P.enJaula !== P.nacidos || h.demanda.S.descargados < h.cfg.nCam) a.push('no-termina');
  if (rc.estado === 'tope-eventos') a.push('tope-eventos');
  if (rc.estado === 'lazo-tiempo-cero') a.push('lazo-tiempo-cero');
  return a;
}

export function calcularResultado(h: Hub, rc: ResultadoCorrida, modelo: string, semilla: number, replica: number, alertas: string[]): ResultadoReplica {
  const cfg = h.cfg, P = h.P.S, n = P.nacidos, inicio = cfg.inicio, fin = cfg.fin;
  // clasificados, al corte y esperas
  let clasificados = 0, alCorte = 0, maxListo = -1;
  const esperas = new Float64Array(n);
  for (let e = 0; e < n; e++) {
    const L = P.listo[e];
    if (L < 0) continue;
    esperas[clasificados++] = (L - P.creado[e]) / MS_POR_MIN;
    if (L <= cfg.corte) alCorte++;
    if (L > maxListo) maxListo = L;
  }
  const esp = esperas.subarray(0, clasificados).sort();
  let suma = 0;
  for (let i = 0; i < esp.length; i++) suma += esp[i];
  const pendientesAlCorte = n - alCorte;
  const S = h.sorter.S, R = h.rampas.S, I = h.ind.S, Pe = h.personas;
  // rampas llenas (los intervalos abiertos se cierran al final de la actividad)
  const tFinal = Math.max(fin, maxListo);
  let msLlena = 0, seLlenaron = 0;
  const rampaMinutosLlena: number[] = [];
  for (let r = 0; r < cfg.NR; r++) {
    const ms = R.msLlena[r] + (R.llenaDesde[r] >= 0 ? Math.max(0, tFinal - R.llenaDesde[r]) : 0);
    msLlena += ms;
    seLlenaron += R.seLleno[r];
    rampaMinutosLlena.push(ms / MS_POR_MIN);
  }
  // playa
  let espPlaya = 0, nPlaya = 0;
  const D = h.demanda.S;
  for (let c = 0; c < cfg.nCam; c++) if (D.asignado[c] >= 0) { espPlaya += D.asignado[c] - D.llegada[c]; nPlaya++; }
  // personas
  let inductores = 0;
  for (let s = 0; s < cfg.activos; s++) if (Pe.S.trabajadorInd[s] >= 0) inductores++;
  const presentes = Pe.presentes();
  const horas = horasPersonaPagadas(presentes, inicio, fin, maxListo);
  const costo = costoNoche(horas, cfg.horaPersona, cfg.fijoNoche);
  const msDetenido = S.msDetenido + (S.parado ? Math.max(0, h.tUltimo - S.tParada) : 0);

  const kpi: Record<KpiId, number> = {
    paquetes: n,
    clasificados,
    pendientesAlCorte,
    pctAlCorte: n > 0 ? (100 * (n - pendientesAlCorte)) / n : 100,
    todoAntesDelCorte: pendientesAlCorte === 0 ? 1 : 0,
    finClasificacionMin: maxListo >= 0 ? (maxListo - inicio) / MS_POR_MIN : 0,
    recirculacionPct: (100 * S.vueltasExtra) / Math.max(1, S.colocaciones),
    vueltasExtra: S.vueltasExtra,
    noLeidosPct: (100 * S.noLeidos) / Math.max(1, S.colocaciones),
    aExcepcion: P.aExcepcion,
    esperaMediaMin: clasificados > 0 ? suma / clasificados : 0,
    esperaP50Min: clasificados > 0 ? percentil(esp, 0.5) : 0,
    esperaP90Min: clasificados > 0 ? percentil(esp, 0.9) : 0,
    utilInduccionPct: inductores > 0 ? (100 * I.msInduciendo) / (inductores * (fin - inicio)) : 0,
    inductoresPresentes: inductores,
    ausentes: Pe.S.ausentes,
    horasRampaLlena: msLlena / MS_POR_HORA,
    rampasQueSeLlenaron: seLlenaron,
    paradasLazo: S.paradas,
    minutosLazoDetenido: msDetenido / MS_POR_MIN,
    esperaPlayaMediaMin: nPlaya > 0 ? espPlaya / nPlaya / MS_POR_MIN : 0,
    horasPersonaPagadas: horas,
    costoNoche: costo,
    costoPorPaquete: costoPorPaquete(costo, clasificados),
  };
  const turno = fin - inicio;
  const Q = h.medicion.S;
  return {
    modelo, semilla, replica, huella: rc.huella, kpi,
    porRecurso: {
      rampaRecibidos: Array.from(R.recibidos),
      rampaVueltas: Array.from(S.rampaVueltas),
      rampaMinutosLlena,
      personaOcupadaPct: Array.from({ length: cfg.nPersonas }, (_, g) => (100 * Pe.ocupadoHasta(g, h.tUltimo)) / turno),
      puestoInducidos: Array.from(I.inducidos),
    },
    series: { filaInduccionMax: Array.from(Q.filaMax.subarray(0, Q.nQ)), clasificados: Array.from(Q.clasificados.subarray(0, Q.nQ)) },
    alertas,
    eventos: rc.eventos,
  };
}
