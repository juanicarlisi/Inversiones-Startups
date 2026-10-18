// app/falsos/maqueta.ts · Andén simulador, corte 1 · P8 (interfaz) · SOLO PARA DESARROLLO Y PRUEBAS DE LA INTERFAZ.
// La «noche» de los servicios falsos: corre la maqueta medida (contratos/fixtures/maqueta/hub.mjs, con su propio azar y Math nativo:
// NO sirve para huellas) con parámetros sacados del modelo, y convierte su traza al contrato (como contratos/fixtures/traza-maqueta.ts,
// pero con los parámetros que pida la interfaz y con momentos derivados). Así «¿y si…?» mueve algo de verdad mientras el hub de
// producción no está conectado. Con HUB_BASE da la misma traza que trazaDeMaqueta (lo prueba pruebas/falsos.test.ts).
// @ts-expect-error la maqueta es JavaScript sin tipos
import { simular, HUB_BASE, K, geometria as geometriaMaqueta } from '../../contratos/fixtures/maqueta/hub.mjs';
import { Causa, ClaseEntidad, TipoMomento, TipoTramo, refDe, type Catalogo, type Traza } from '../../contratos/traza.ts';
import type { GeometriaHub } from '../../contratos/geometria.ts';
import type { Modelo } from '../../contratos/modelo.ts';
import { KPIS, type KpiId, type ResultadoReplica } from '../../contratos/resultados.ts';
import { horaASeg } from '../../contratos/tipos-base.ts';
import { central } from './modelo.ts';

/** Parámetros de la maqueta (la forma de HUB_BASE). */
export interface ParametrosMaqueta {
  nombre: string;
  camiones: { n: number; desde: number; cada: number; desvioMin: number; desvioMax: number; paqMedio: number; papeleo: number };
  andenes: { n: number; personas: number; paqPorHoraPersona: number; cv: number; descarga: number; cintaLargo: number; cintaVel: number };
  buffer: number;
  induccion: { puestos: number; medio: number; cv: number; fatiga: number; tauFatiga: number; pausa: number; cadaPausa: number;
    escalonPausa: number; ausentismo: number; temporarios: number; eficienciaTemporario: number };
  sorter: { recta: number; radio: number; paso: number; vel: number; maxVueltas: number; noRead: number };
  rampas: { abajo: number; arriba: number; capacidad: number; zipf: number; personas: number; manejo: number; cvManejo: number;
    caminar: number; jaula: number; cierreJaula: number };
  manual: { personas: number; tiempo: number };
  turno: { inicio: number; fin: number };
  corte: number;
}
export const BASE: ParametrosMaqueta = HUB_BASE as ParametrosMaqueta;

const MAPA_K: Record<number, number> = {
  [K.DESCARGA]: TipoTramo.DESCARGA, [K.CINTA]: TipoTramo.CINTA, [K.COLA]: TipoTramo.ACUMULACION,
  [K.INDUCCION]: TipoTramo.INDUCCION, [K.BANDEJA]: TipoTramo.BANDEJA, [K.RAMPA]: TipoTramo.RAMPA,
  [K.MANO]: TipoTramo.MANO, [K.JAULA]: TipoTramo.JAULA, [K.MANUAL]: TipoTramo.MANUAL,
};

function cvDe(m: Modelo, x: unknown, porDefecto: number): number {
  const d = typeof x === 'string' && x.startsWith('@') ? m.parametros[x.slice(1)]?.valor : x;
  return d && typeof d === 'object' && 'cv' in d && typeof d.cv === 'number' ? d.cv : porDefecto;
}

/** Del modelo a los parámetros de la maqueta (aproximado: la maqueta tiene menos mecanismo que el hub de producción). */
export function parametrosDeModelo(m: Modelo): ParametrosMaqueta {
  const p = structuredClone(BASE);
  const cam = m.demanda.camiones;
  if (!Array.isArray(cam)) {
    p.camiones = { ...p.camiones, n: cam.cantidad, desde: horaASeg(cam.primero), cada: cam.cada, paqMedio: cam.paquetes,
      papeleo: central(m, m.demanda.papeleo) };
  }
  const des = typeof m.demanda.desvio === 'string' ? m.parametros[m.demanda.desvio.slice(1)]?.valor : m.demanda.desvio;
  if (des && typeof des === 'object' && des.tipo === 'uniforme') { p.camiones.desvioMin = des.min; p.camiones.desvioMax = des.max; }
  const largoCinta = (c: { puntos: [number, number][] }) => c.puntos.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - c.puntos[i][0], q[1] - c.puntos[i][1]), 0);
  p.andenes = { ...p.andenes, n: m.hub.andenes.length, personas: m.hub.andenes[0]?.personas ?? 2,
    paqPorHoraPersona: 3600 / central(m, m.personas.descarga.ritmo), cv: cvDe(m, m.personas.descarga.ritmo, 0.5),
    cintaLargo: m.hub.cintas[0] ? largoCinta(m.hub.cintas[0]) : 40, cintaVel: m.hub.cintas[0]?.velocidad ?? 1 };
  p.buffer = Math.floor(m.hub.acumulacion.largo / m.hub.acumulacion.paso + 1e-9);
  const ind = m.personas.induccion;
  const ausentismo = central(m, ind.ausentismo);
  p.induccion = { ...p.induccion, puestos: Math.max(1, ind.puestosActivos), medio: central(m, m.hub.induccion.tiempo),
    cv: cvDe(m, m.hub.induccion.tiempo, 0.35), fatiga: m.personas.fatiga.activa ? central(m, m.personas.fatiga.maximo) : 0,
    pausa: ind.pausas.duracion, cadaPausa: ind.pausas.cada, escalonPausa: ind.pausas.escalon,
    // la maqueta no tiene retén: un retén baja las faltas que quedan sin cubrir (aproximación de la versión falsa)
    ausentismo: ind.reten > 0 ? ausentismo * ausentismo : ausentismo,
    temporarios: ind.temporarios, eficienciaTemporario: central(m, ind.eficienciaTemporario) };
  const s = m.hub.sorter;
  p.sorter = { ...p.sorter, recta: s.recta, radio: s.radio, paso: s.paso, vel: s.velocidad, maxVueltas: s.maxVueltas, noRead: central(m, s.lector.noLeido) };
  const pr = m.personas.rampa;
  p.rampas = { ...p.rampas, abajo: m.hub.rampas.filter((r) => r.lado === -1).length, arriba: m.hub.rampas.filter((r) => r.lado === 1).length,
    capacidad: m.hub.rampas[0]?.capacidad ?? 20, personas: Math.max(1, pr.cantidad),
    // la maqueta siempre reparte rampas contiguas; «por volumen» se aproxima con menos caminata
    manejo: central(m, pr.manejo), cvManejo: cvDe(m, pr.manejo, 0.4), caminar: pr.asignacion === 'contiguas' ? central(m, pr.caminar) : central(m, pr.caminar) * 0.5,
    jaula: m.hub.jaulas.capacidad, cierreJaula: central(m, m.hub.jaulas.cierre) };
  p.manual = { personas: Math.max(1, m.personas.excepcion.cantidad), tiempo: central(m, m.personas.excepcion.tiempo) };
  p.turno = { inicio: horaASeg(m.calendario.inicio), fin: horaASeg(m.calendario.fin) };
  p.corte = horaASeg(m.calendario.corte);
  return p;
}

/** Semilla de la maqueta para (semilla, réplica): distinta por réplica, siempre la misma para el mismo par. */
export function semillaMaqueta(semilla: number, replica: number): number {
  return (Math.imul((semilla ^ 0x5bd1e995) | 0, 0x9e3779b1) ^ Math.imul(replica + 1, 0x85ebca77)) | 0;
}

export interface NocheFalsa { traza: Traza; resultado: ResultadoReplica }

/** Una noche de la maqueta convertida al contrato: traza completa con momentos derivados y su ResultadoReplica. */
export function nocheDeMaqueta(p: ParametrosMaqueta, o: { semilla: number; replica: number; modelo: string; rutas?: string[] }): NocheFalsa {
  const semillaM = semillaMaqueta(o.semilla, o.replica);
  const { traza: t, geo: g, kpi } = simular(p, semillaM);
  const n: number = t.n;
  const NR: number = g.rampas.length;
  // columnas de tramos con un tramo de marcha del lazo al final (la maqueta cuenta el paso desde t = 0)
  const N = n + 1;
  const col = {
    n: N, e: new Int32Array(N), k: new Uint8Array(N), r: new Int32Array(N), a: new Int32Array(N),
    t0: new Float64Array(N), t1: new Float64Array(N), c: new Uint8Array(N), q: new Int32Array(N).fill(-1),
  };
  col.e.set(t.e); col.r.set(t.r); col.a.set(t.a); col.t0.set(t.t0); col.t1.set(t.t1);
  for (let i = 0; i < n; i++) col.k[i] = MAPA_K[t.k[i]] ?? 0;
  col.e[n] = -1; col.k[n] = TipoTramo.LAZO_MARCHA; col.t0[n] = 0; col.t1[n] = t.fin; col.a[n] = 0;
  const grupoDe = (r: number) => Math.floor(r * p.rampas.personas / NR);
  const nInd: number = p.induccion.puestos;
  for (let i = 0; i < n; i++) {
    const k = col.k[i];
    if (k === TipoTramo.ACUMULACION) col.c[i] = Causa.FILA;
    else if (k === TipoTramo.BANDEJA && col.a[i] > 0) col.c[i] = Causa.RAMPA_LLENA;
    else if (k === TipoTramo.RAMPA && col.r[i] < NR) col.q[i] = refDe(ClaseEntidad.PERSONA, nInd + grupoDe(col.r[i]));
  }
  // resumen por paquete
  const np: number = kpi.paquetes;
  const paq = {
    n: np, camion: new Int32Array(np), indice: new Int32Array(np), ruta: new Int16Array(np), clase: new Uint8Array(np),
    creado: new Float64Array(np).fill(-1), listo: new Float64Array(np).fill(-1), vueltas: new Uint8Array(np),
  };
  for (let i = 0; i < n; i++) {
    const e = col.e[i]; if (e < 0 || e >= np) continue;
    const k = col.k[i];
    // la maqueta no anota el camión: la clave estable (camión, índice) de la versión falsa es (andén, número de paquete)
    if (k === TipoTramo.DESCARGA) { paq.creado[e] = col.t0[i]; paq.indice[e] = e; paq.camion[e] = col.r[i]; }
    else if (k === TipoTramo.RAMPA && col.r[i] < NR) paq.ruta[e] = col.r[i];
    else if (k === TipoTramo.JAULA) paq.listo[e] = col.t0[i];
    else if (k === TipoTramo.BANDEJA) paq.vueltas[e] = Math.max(paq.vueltas[e], col.a[i]);
  }
  const rutas = o.rutas && o.rutas.length === NR ? o.rutas : Array.from({ length: NR }, (_, i) => `Ruta ${String(i + 1).padStart(2, '0')}`);
  const pasoCintas = (a: { x: number; y: number }) => [[a.x, a.y + 2], [a.x, -10], [2, -10], [2, -3]] as [number, number][];
  const geometria: GeometriaHub = {
    lazo: { forma: 'estadio', recta: p.sorter.recta, radio: p.sorter.radio, origen: [0, 0], largo: g.L, paso: p.sorter.paso, bandejas: g.T },
    estaciones: g.estaciones.map((x: { s: number; x: number; y: number }, i: number) => ({ id: `I${i + 1}`, s: x.s, x: x.x, y: x.y })),
    lector: { s: 12, x: 12, y: 0 },
    rampas: g.rampas.map((x: { s: number; x: number; y: number; lado: -1 | 1 }, i: number) => ({
      id: `R${String(i + 1).padStart(2, '0')}`, s: x.s, lado: x.lado, x: x.x, y: x.y, capacidad: p.rampas.capacidad, ruta: rutas[i] })),
    excepcion: { id: 'RX', s: g.excepcion.s, x: g.excepcion.x, y: g.excepcion.y },
    andenes: g.andenes.map((a: { x: number; y: number }, i: number) => ({ id: `A${i + 1}`, x: a.x, y: a.y })),
    cintas: g.andenes.map((a: { x: number; y: number }, i: number) => ({ id: `C${i + 1}`, anden: `A${i + 1}`, puntos: pasoCintas(a), largo: p.andenes.cintaLargo })),
    acumulacion: { x: 2, y: -3, capacidad: p.buffer },
    limites: {
      xmin: Math.min(-35, ...g.andenes.map((a: { x: number }) => a.x - 5)), ymin: -25,
      xmax: p.sorter.recta + 2 * p.sorter.radio + 5, ymax: 2 * p.sorter.radio + 10,
    },
  };
  const catalogo: Catalogo = {
    personas: [
      ...Array.from({ length: nInd }, (_, i) => ({ id: `P-I${i + 1}`, rol: 'induccion' as const })),
      ...Array.from({ length: p.rampas.personas }, (_, i) => ({ id: `P-R${i + 1}`, rol: 'rampa' as const })),
      ...Array.from({ length: p.manual.personas }, (_, i) => ({ id: `P-X${i + 1}`, rol: 'excepcion' as const })),
    ],
    camiones: Array.from({ length: p.camiones.n }, (_, i) => ({ id: `T${String(i + 1).padStart(2, '0')}`, turno: (p.camiones.desde + i * p.camiones.cada) * 1000 })),
    rutas, rampas: geometria.rampas.map((r) => r.id), puestos: geometria.estaciones.map((e) => e.id), andenes: geometria.andenes.map((a) => a.id),
  };
  const corte = p.corte * 1000;
  const momentos = derivarMomentos(col, paq, { NR, capacidad: p.rampas.capacidad, corte, inicio: t.inicio, buffer: p.buffer });
  const traza: Traza = {
    version: 1, modelo: o.modelo, semilla: o.semilla, replica: o.replica, tickLazo: t.tick, bandejas: t.T, inicio: t.inicio, fin: t.fin, corte,
    tramos: col, momentos, paquetes: paq, catalogo, geometria, huella: `maqueta-${(semillaM >>> 0).toString(16).padStart(8, '0')}`,
  };
  return { traza, resultado: resultadoDeTraza(traza, kpi, p) };
}

/** Momentos que la maqueta no emite y la interfaz necesita para la línea de tiempo: corte, primer y último paquete, rampas llenas. */
function derivarMomentos(col: Traza['tramos'], paq: Traza['paquetes'], o: { NR: number; capacidad: number; corte: number; inicio: number; buffer: number }): Traza['momentos'] {
  const t: number[] = [], tipo: number[] = [], r: number[] = [], v: number[] = [];
  const poner = (tt: number, ti: number, rr: number, vv: number) => { t.push(tt); tipo.push(ti); r.push(rr); v.push(vv); };
  let primero = Infinity, ultimo = -1, pendientes = 0;
  for (let e = 0; e < paq.n; e++) {
    if (paq.creado[e] >= 0 && paq.creado[e] < primero) primero = paq.creado[e];
    if (paq.listo[e] > ultimo) ultimo = paq.listo[e];
    if (!(paq.listo[e] >= 0 && paq.listo[e] <= o.corte)) pendientes++;
  }
  if (Number.isFinite(primero)) poner(primero, TipoMomento.PRIMER_PAQUETE, -1, 0);
  poner(o.corte, TipoMomento.CORTE, -1, pendientes);
  if (ultimo >= 0) poner(ultimo, TipoMomento.ULTIMO_CLASIFICADO, -1, 0);
  // ocupación de cada rampa: +1 al entrar (t0 del tramo RAMPA), −1 al salir (t1)
  const ev: [number, number, number][] = [];
  for (let i = 0; i < col.n; i++) if (col.k[i] === TipoTramo.RAMPA && col.r[i] < o.NR) { ev.push([col.t0[i], col.r[i], 1]); ev.push([col.t1[i], col.r[i], -1]); }
  ev.sort((a, b) => a[0] - b[0] || a[2] - b[2]);
  const occ = new Int32Array(o.NR), llena = new Uint8Array(o.NR);
  for (const [tt, rr, d] of ev) {
    occ[rr] += d;
    if (!llena[rr] && occ[rr] >= o.capacidad) { llena[rr] = 1; poner(tt, TipoMomento.RAMPA_LLENA, rr, 0); }
    else if (llena[rr] && occ[rr] < o.capacidad) { llena[rr] = 0; poner(tt, TipoMomento.RAMPA_LIBERA, rr, 0); }
  }
  const orden = t.map((_, i) => i).sort((a, b) => t[a] - t[b] || tipo[a] - tipo[b]);
  return {
    n: t.length, t: Float64Array.from(orden, (i) => t[i]), tipo: Uint8Array.from(orden, (i) => tipo[i]),
    r: Int32Array.from(orden, (i) => r[i]), v: Float64Array.from(orden, (i) => v[i]),
  };
}

/** ResultadoReplica de una noche de la maqueta (KPI de §6.9 hasta donde la maqueta los tiene; el resto, 0). */
function resultadoDeTraza(tr: Traza, kpiM: Record<string, number>, p: ParametrosMaqueta): ResultadoReplica {
  const P = tr.paquetes, NR = tr.catalogo.rampas.length;
  const espera: number[] = [];
  let maxListo = -1, antes = 0, vueltas = 0, clasificados = 0;
  for (let e = 0; e < P.n; e++) {
    const l = P.listo[e];
    if (l >= 0) { clasificados++; espera.push((l - P.creado[e]) / 60000); if (l > maxListo) maxListo = l; if (l <= tr.corte) antes++; }
    vueltas += P.vueltas[e];
  }
  espera.sort((a, b) => a - b);
  const q = (x: number) => (espera.length ? espera[Math.min(espera.length - 1, Math.floor(x * espera.length))] : 0);
  const inicioTurno = p.turno.inicio * 1000, finTurno = p.turno.fin * 1000;
  const personas = p.induccion.puestos + p.rampas.personas + p.manual.personas + p.andenes.n * p.andenes.personas;
  const horas = personas * Math.max(finTurno - inicioTurno, maxListo - inicioTurno) / 3_600_000;
  const costoNoche = horas * 7085 + 496000;
  const k: Record<KpiId, number> = Object.fromEntries(KPIS.map((x) => [x, 0])) as Record<KpiId, number>;
  Object.assign(k, {
    paquetes: P.n, clasificados, pendientesAlCorte: P.n - antes, pctAlCorte: 100 * antes / Math.max(1, P.n), todoAntesDelCorte: P.n === antes ? 1 : 0,
    finClasificacionMin: (maxListo - inicioTurno) / 60000, recirculacionPct: kpiM.recirculacionPct ?? 0, vueltasExtra: vueltas,
    noLeidosPct: 100 * p.sorter.noRead, aExcepcion: 0, esperaMediaMin: espera.reduce((a, b) => a + b, 0) / Math.max(1, espera.length),
    esperaP50Min: q(0.5), esperaP90Min: q(0.9), utilInduccionPct: kpiM.utilInduccionPct ?? 0, inductoresPresentes: kpiM.inductoresPresentes ?? 0,
    ausentes: p.induccion.puestos - (kpiM.inductoresPresentes ?? p.induccion.puestos), horasRampaLlena: kpiM.horasRampaLlena ?? 0,
    paradasLazo: 0, minutosLazoDetenido: 0, esperaPlayaMediaMin: kpiM.esperaPlayaMinProm ?? 0, horasPersonaPagadas: horas, costoNoche,
    costoPorPaquete: costoNoche / Math.max(1, clasificados),
  });
  // por rampa y por cuarto de hora, desde la traza
  const recibidos = new Array<number>(NR).fill(0), minutosLlena = new Array<number>(NR).fill(0), vueltasR = new Array<number>(NR).fill(0);
  const cuartos = Math.max(1, Math.ceil((tr.fin - inicioTurno) / 900_000));
  const fila = new Array<number>(cuartos).fill(0), clasif = new Array<number>(cuartos).fill(0);
  const cuarto = (x: number) => Math.min(cuartos - 1, Math.max(0, Math.floor((x - inicioTurno) / 900_000)));
  const T = tr.tramos;
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] === TipoTramo.RAMPA && T.r[i] < NR) recibidos[T.r[i]]++;
    else if (T.k[i] === TipoTramo.JAULA) clasif[cuarto(T.t0[i])]++;
    else if (T.k[i] === TipoTramo.BANDEJA && T.a[i] > 0 && T.e[i] >= 0) { const r = P.ruta[T.e[i]]; if (r >= 0 && r < NR) vueltasR[r]++; }
  }
  const M = tr.momentos; const desde = new Array<number>(NR).fill(-1); let rampasLlenas = 0;
  for (let i = 0; i < M.n; i++) {
    if (M.tipo[i] === TipoMomento.RAMPA_LLENA) { if (desde[M.r[i]] < 0) rampasLlenas++; desde[M.r[i]] = M.t[i]; }
    if (M.tipo[i] === TipoMomento.RAMPA_LIBERA && desde[M.r[i]] >= 0) { minutosLlena[M.r[i]] += (M.t[i] - desde[M.r[i]]) / 60000; desde[M.r[i]] = -1; }
  }
  k.rampasQueSeLlenaron = rampasLlenas;
  // fila máxima por cuarto de hora: barrido de entradas y salidas de la acumulación
  const ev: [number, number][] = [];
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.ACUMULACION) { ev.push([T.t0[i], 1]); ev.push([T.t1[i], -1]); }
  ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let occ = 0;
  for (const [tt, d] of ev) { occ += d; const c = cuarto(tt); if (occ > fila[c]) fila[c] = occ; }
  return {
    modelo: tr.modelo, semilla: tr.semilla, replica: tr.replica, huella: tr.huella, kpi: k,
    porRecurso: { rampaRecibidos: recibidos, rampaVueltas: vueltasR, rampaMinutosLlena: minutosLlena,
      personaOcupadaPct: tr.catalogo.personas.map(() => 0), puestoInducidos: tr.catalogo.puestos.map(() => 0) },
    series: { filaInduccionMax: fila, clasificados: clasif },
    alertas: [], eventos: kpiM.eventos ?? 0,
  };
}

/** Geometría (sin simular) para GeometriaDe: la de la maqueta con los parámetros del modelo. */
export function geometriaDeModelo(m: Modelo): GeometriaHub {
  const p = parametrosDeModelo(m);
  const g = geometriaMaqueta(p);
  const rutas = m.hub.planClasificacion.rutas.map((r) => r.id);
  return {
    lazo: { forma: 'estadio', recta: p.sorter.recta, radio: p.sorter.radio, origen: [0, 0], largo: g.L, paso: p.sorter.paso, bandejas: g.T },
    estaciones: g.estaciones.map((x: { s: number; x: number; y: number }, i: number) => ({ id: `I${i + 1}`, s: x.s, x: x.x, y: x.y })),
    lector: { s: 12, x: 12, y: 0 },
    rampas: g.rampas.map((x: { s: number; x: number; y: number; lado: -1 | 1 }, i: number) => ({
      id: m.hub.rampas[i]?.id ?? `R${i + 1}`, s: x.s, lado: x.lado, x: x.x, y: x.y, capacidad: p.rampas.capacidad, ruta: rutas[i % Math.max(1, rutas.length)] ?? '' })),
    excepcion: { id: m.hub.excepcion.id, s: g.excepcion.s, x: g.excepcion.x, y: g.excepcion.y },
    andenes: g.andenes.map((a: { x: number; y: number }, i: number) => ({ id: m.hub.andenes[i]?.id ?? `A${i + 1}`, x: a.x, y: a.y })),
    cintas: g.andenes.map((a: { x: number; y: number }, i: number) => ({ id: `C${i + 1}`, anden: `A${i + 1}`,
      puntos: [[a.x, a.y + 2], [a.x, -10], [2, -10], [2, -3]] as [number, number][], largo: p.andenes.cintaLargo })),
    acumulacion: { x: 2, y: -3, capacidad: p.buffer },
    limites: { xmin: -35, ymin: -25, xmax: p.sorter.recta + 2 * p.sorter.radio + 5, ymax: 2 * p.sorter.radio + 10 },
  };
}
