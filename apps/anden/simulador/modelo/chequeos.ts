// modelo/chequeos.ts · P3 · Chequeos estáticos que cruzan campos (§9, P3): referencias, ids, geometría del lazo, plan de
// clasificación, dotación, horas, pausas, presupuesto, borrador F0 y, en modo profundo, escenarios y valores de la decisión.
// Corre sobre un modelo que ya pasó validarEsquema (los tipos están garantizados). Cada diagnóstico lleva su JSON Pointer.
import type { Diagnostico, Dist, EstimacionF0, Modelo, Num } from '../contratos/modelo.ts';
import { LIMITES_ENLACE } from '../contratos/escena.ts';
import { horaASeg, segAHoraLarga } from '../contratos/tipos-base.ts';
import { cifra, type Colector } from './esquema.ts';
import {
  bandejasLazo, calcularF0, distribucionEfectiva, largoLazo, media, paquetesNominales, parametroDe, ranuraDe, soporteMinimo, tickMs,
} from './f0.ts';
import { aplicarParcheJson, ErrorParche, escaparToken, leerPuntero } from './parches.ts';
import { estimarPresupuesto, eventosRecurrentes, lugaresDeMemoria, MAX_LUGARES_MEMORIA } from './presupuesto.ts';

/** Catálogo de controles (lo cuenta I-CONTROLES para el comprobante: controles, cuántos pasaron, avisos). */
export const CONTROLES = [
  'E-ESQUEMA', 'E-REF', 'E-RANGO', 'E-UNIDAD', 'E-ID-DUPLICADO', 'E-S-FUERA-DEL-LAZO', 'E-RANURA-REPETIDA', 'E-FRACCIONES', 'A-PESOS',
  'E-PUESTOS', 'E-TEMPORARIOS', 'E-HORAS', 'E-PAUSAS', 'E-RAMPA-SIN-PERSONA', 'E-RUTA-SIN-RAMPA', 'E-RAMPA-EN-DOS-RUTAS',
  'A-RAMPA-SIN-RUTA', 'E-PRESUPUESTO', 'A-RHO', 'A-CORTE-IMPOSIBLE', 'A-INCIERTO', 'A-PROCEDENCIA', 'E-ESCENARIO', 'E-DECISION',
] as const;

/** Máximo de valores de la variable de decisión (cada uno se evalúa con réplicas secuenciales: §7). */
export const MAX_VALORES_DECISION = 30;

export interface OpcionesChequeo {
  /** Revisa también cada escenario y cada valor de la decisión (compilando la variante sin modo profundo). */
  profundo: boolean;
  revisar?: (x: unknown) => { ok: boolean; diagnosticos: Diagnostico[] };
}

// ---- Campos Num y Dist del esquema, con sus límites propios (además del rango del parámetro) ----

interface CampoNum { ruta: string; leer: (m: Modelo) => Num; min?: number; max?: number; mayorQue?: number; probabilidad?: boolean }
const CAMPOS_NUM: readonly CampoNum[] = [
  { ruta: '/demanda/errorPronostico/cv', leer: (m) => m.demanda.errorPronostico.cv, min: 0 },
  { ruta: '/demanda/atrasoComun/probabilidad', leer: (m) => m.demanda.atrasoComun.probabilidad, min: 0, max: 1, probabilidad: true },
  { ruta: '/demanda/papeleo', leer: (m) => m.demanda.papeleo, min: 0 },
  { ruta: '/hub/jaulas/cierre', leer: (m) => m.hub.jaulas.cierre, min: 0 },
  { ruta: '/hub/sorter/lector/noLeido', leer: (m) => m.hub.sorter.lector.noLeido, min: 0, max: 1, probabilidad: true },
  { ruta: '/personas/induccion/ausentismo', leer: (m) => m.personas.induccion.ausentismo, min: 0, max: 1, probabilidad: true },
  { ruta: '/personas/induccion/eficienciaTemporario', leer: (m) => m.personas.induccion.eficienciaTemporario, mayorQue: 0 },
  { ruta: '/personas/rampa/caminar', leer: (m) => m.personas.rampa.caminar, min: 0 },
  { ruta: '/personas/rampa/ausentismo', leer: (m) => m.personas.rampa.ausentismo, min: 0, max: 1, probabilidad: true },
  { ruta: '/personas/fatiga/maximo', leer: (m) => m.personas.fatiga.maximo, min: 0 },
  { ruta: '/personas/fatiga/tau', leer: (m) => m.personas.fatiga.tau, mayorQue: 0 },
  { ruta: '/costos/horaPersona', leer: (m) => m.costos.horaPersona, min: 0 },
  { ruta: '/costos/fijoNoche', leer: (m) => m.costos.fijoNoche, min: 0 },
];

interface CampoDist { ruta: string; leer: (m: Modelo) => Dist; duracion: boolean }
const CAMPOS_DIST: readonly CampoDist[] = [
  { ruta: '/demanda/desvio', leer: (m) => m.demanda.desvio, duracion: false },
  { ruta: '/demanda/atrasoComun/demora', leer: (m) => m.demanda.atrasoComun.demora, duracion: true },
  { ruta: '/hub/sorter/paradas/entre', leer: (m) => m.hub.sorter.paradas.entre, duracion: true },
  { ruta: '/hub/sorter/paradas/duracion', leer: (m) => m.hub.sorter.paradas.duracion, duracion: true },
  { ruta: '/hub/induccion/tiempo', leer: (m) => m.hub.induccion.tiempo, duracion: true },
  { ruta: '/personas/descarga/ritmo', leer: (m) => m.personas.descarga.ritmo, duracion: true },
  { ruta: '/personas/rampa/manejo', leer: (m) => m.personas.rampa.manejo, duracion: true },
  { ruta: '/personas/excepcion/tiempo', leer: (m) => m.personas.excepcion.tiempo, duracion: true },
];

function valorConRef(vars: Record<string, string | number>, x: unknown): Record<string, string | number> {
  if (typeof x === 'string') vars.ref = x;
  return vars;
}

function chequearReferencias(m: Modelo, c: Colector): void {
  for (const f of CAMPOS_NUM) {
    const x = f.leer(m);
    let v: number;
    if (typeof x === 'number') v = x;
    else {
      const p = parametroDe(m, x);
      if (!p) { c.error('E-REF', f.ruta, 'parametro', { ref: x }); continue; }
      const pv = p.valor;
      if (typeof pv === 'number') v = pv;
      else if (pv.tipo === 'fija') v = pv.valor;
      else if (pv.tipo === 'bernoulli' && f.probabilidad) v = pv.p;
      else { c.error('E-REF', f.ruta, 'tipo-parametro', { ref: x, tipo: pv.tipo }); continue; }
    }
    if (f.mayorQue !== undefined && !(v > f.mayorQue)) c.error('E-RANGO', f.ruta, 'mayor-que', valorConRef({ valor: v, min: f.mayorQue }, x));
    if (f.min !== undefined && v < f.min) c.error('E-RANGO', f.ruta, 'minimo', valorConRef({ valor: v, min: f.min }, x));
    if (f.max !== undefined && v > f.max) c.error('E-RANGO', f.ruta, 'maximo', valorConRef({ valor: v, max: f.max }, x));
  }
  for (const f of CAMPOS_DIST) {
    const x = f.leer(m);
    const d = distribucionEfectiva(m, x);
    if (!d) { c.error('E-REF', f.ruta, 'parametro', { ref: String(x) }); continue; }
    if (f.duracion) {
      const piso = soporteMinimo(d);
      if (piso < 0) c.error('E-RANGO', f.ruta, 'soporte-negativo', valorConRef({ minimo: cifra(piso) }, x));
    }
  }
  if (m.hub.sorter.paradas.activas) {
    const d = distribucionEfectiva(m, m.hub.sorter.paradas.entre);
    if (d && !(media(d) > 0)) c.error('E-RANGO', '/hub/sorter/paradas/entre', 'mayor-que', valorConRef({ valor: cifra(media(d)), min: 0 }, m.hub.sorter.paradas.entre));
  }
}

/** Ids únicos dentro de un espacio de nombres; devuelve id → índice del primero. */
function unicos(c: Colector, items: readonly { id: string; ruta: string }[]): Map<string, number> {
  const vistos = new Map<string, number>();
  items.forEach((it, i) => {
    if (vistos.has(it.id)) c.error('E-ID-DUPLICADO', it.ruta, undefined, { id: it.id });
    else vistos.set(it.id, i);
  });
  return vistos;
}

function chequearIds(m: Modelo, c: Colector): void {
  const h = m.hub;
  unicos(c, [
    { id: h.sorter.id, ruta: '/hub/sorter/id' },
    ...h.andenes.map((a, i) => ({ id: a.id, ruta: `/hub/andenes/${i}/id` })),
    ...h.cintas.map((a, i) => ({ id: a.id, ruta: `/hub/cintas/${i}/id` })),
    ...h.induccion.puestos.map((a, i) => ({ id: a.id, ruta: `/hub/induccion/puestos/${i}/id` })),
    ...h.rampas.map((a, i) => ({ id: a.id, ruta: `/hub/rampas/${i}/id` })),
    { id: h.excepcion.id, ruta: '/hub/excepcion/id' },
  ]);
  unicos(c, h.planClasificacion.rutas.map((r, i) => ({ id: r.id, ruta: `/hub/planClasificacion/rutas/${i}/id` })));
  unicos(c, h.perfilPaquete.clases.map((r, i) => ({ id: r.id, ruta: `/hub/perfilPaquete/clases/${i}/id` })));
  const cam = m.demanda.camiones;
  if (Array.isArray(cam)) unicos(c, cam.map((r, i) => ({ id: r.id, ruta: `/demanda/camiones/${i}/id` })));
  if (m.escenarios) unicos(c, m.escenarios.map((r, i) => ({ id: r.id, ruta: `/escenarios/${i}/id` })));
}

function chequearAndenesYCintas(m: Modelo, c: Colector): void {
  const h = m.hub;
  const andenes = new Map(h.andenes.map((a, i) => [a.id, i] as const));
  const cintasPorAnden = new Array<number>(h.andenes.length).fill(0);
  h.cintas.forEach((ci, i) => {
    const k = andenes.get(ci.desde);
    if (k === undefined) c.error('E-REF', `/hub/cintas/${i}/desde`, 'anden', { id: ci.desde });
    else if (++cintasPorAnden[k] > 1) c.error('E-REF', `/hub/cintas/${i}/desde`, 'anden-dos-cintas', { id: ci.desde });
    let largo = 0;
    for (let j = 1; j < ci.puntos.length; j++) {
      const dx = ci.puntos[j][0] - ci.puntos[j - 1][0], dy = ci.puntos[j][1] - ci.puntos[j - 1][1];
      largo += Math.sqrt(dx * dx + dy * dy);
    }
    if (!(largo > 0)) c.error('E-RANGO', `/hub/cintas/${i}/puntos`, 'cinta-sin-largo', { id: ci.id });
  });
  h.andenes.forEach((a, i) => { if (cintasPorAnden[i] === 0) c.error('E-REF', `/hub/andenes/${i}`, 'anden-sin-cinta', { id: a.id }); });
  const lugares = Math.floor(h.acumulacion.largo / h.acumulacion.paso + 1e-9);
  if (lugares < 1) c.error('E-RANGO', '/hub/acumulacion/largo', 'acumulacion-sin-lugar', { largo: h.acumulacion.largo, paso: h.acumulacion.paso });
}

function chequearLazo(m: Modelo, c: Colector): void {
  const s = m.hub.sorter;
  const largo = largoLazo(s);
  const T = bandejasLazo(s);
  const tick = tickMs(s);
  let ok = true;
  if (T < 2) { c.error('E-RANGO', '/hub/sorter/paso', 'bandejas', { bandejas: T }); ok = false; }
  if (tick < 1) { c.error('E-RANGO', '/hub/sorter/velocidad', 'tick', { segundos: cifra(s.paso / s.velocidad, 6) }); ok = false; }
  const puntos: { id: string; s: number; ruta: string; estacion: boolean }[] = [
    ...m.hub.induccion.puestos.map((p, i) => ({ id: p.id, s: p.s, ruta: `/hub/induccion/puestos/${i}/s`, estacion: true })),
    ...m.hub.rampas.map((p, i) => ({ id: p.id, s: p.s, ruta: `/hub/rampas/${i}/s`, estacion: true })),
    { id: m.hub.excepcion.id, s: m.hub.excepcion.s, ruta: '/hub/excepcion/s', estacion: true },
    { id: 'lector', s: s.lector.s, ruta: '/hub/sorter/lector/s', estacion: false },
  ];
  const ranuras = new Map<number, string>();
  for (const p of puntos) {
    if (!(p.s < largo)) { c.error('E-S-FUERA-DEL-LAZO', p.ruta, undefined, { id: p.id, s: p.s, largo: cifra(largo, 3) }); continue; }
    if (!ok || !p.estacion) continue;
    const r = ranuraDe(s, p.s);
    const otro = ranuras.get(r);
    if (otro !== undefined) c.error('E-RANURA-REPETIDA', p.ruta, undefined, { id: p.id, otro, ranura: r });
    else ranuras.set(r, p.id);
  }
}

function chequearPerfilYPlan(m: Modelo, c: Colector): void {
  let suma = 0;
  for (const k of m.hub.perfilPaquete.clases) suma += k.fraccion;
  if (Math.abs(suma - 1) > 1e-9) c.error('E-FRACCIONES', '/hub/perfilPaquete/clases', undefined, { suma: cifra(suma, 9) });

  const rampas = new Set(m.hub.rampas.map((r) => r.id));
  const rutaDe = new Map<string, string>();
  let pesos = 0;
  m.hub.planClasificacion.rutas.forEach((ru, i) => {
    pesos += ru.peso;
    const base = `/hub/planClasificacion/rutas/${i}`;
    if (ru.rampas.length === 0) c.error('E-RUTA-SIN-RAMPA', `${base}/rampas`, undefined, { id: ru.id });
    const propias = new Set<string>();
    ru.rampas.forEach((id, j) => {
      const r = `${base}/rampas/${j}`;
      if (!rampas.has(id)) { c.error('E-REF', r, 'rampa', { id }); return; }
      if (propias.has(id)) { c.error('E-ID-DUPLICADO', r, undefined, { id }); return; }
      propias.add(id);
      const otra = rutaDe.get(id);
      if (otra !== undefined) c.error('E-RAMPA-EN-DOS-RUTAS', r, undefined, { id, ruta: ru.id, otra });
      else rutaDe.set(id, ru.id);
    });
  });
  if (!(pesos > 0)) c.error('E-RANGO', '/hub/planClasificacion/rutas', 'pesos-cero');
  m.hub.rampas.forEach((r, i) => { if (!rutaDe.has(r.id)) c.aviso('A-RAMPA-SIN-RUTA', `/hub/rampas/${i}`, undefined, { id: r.id }); });
}

function chequearPersonas(m: Modelo, c: Colector): void {
  const pi = m.personas.induccion;
  const fisicos = m.hub.induccion.puestos.length;
  if (pi.puestosActivos > fisicos) c.error('E-PUESTOS', '/personas/induccion/puestosActivos', undefined, { activos: pi.puestosActivos, fisicos });
  if (pi.temporarios > pi.puestosActivos) c.error('E-TEMPORARIOS', '/personas/induccion/temporarios', undefined, { temporarios: pi.temporarios, activos: pi.puestosActivos });
  for (const rol of ['induccion', 'rampa'] as const) {
    const p = m.personas[rol].pausas;
    if (p.duracion >= p.cada) c.error('E-PAUSAS', `/personas/${rol}/pausas/duracion`, undefined, { duracion: p.duracion, cada: p.cada });
  }
  const pr = m.personas.rampa;
  const rampas = m.hub.rampas;
  if (pr.cantidad === 0) { c.error('E-RAMPA-SIN-PERSONA', '/personas/rampa/cantidad', 'ninguna', { rampas: rampas.length }); return; }
  if (Array.isArray(pr.asignacion)) {
    if (pr.asignacion.length !== pr.cantidad) {
      c.error('E-RANGO', '/personas/rampa/asignacion', 'asignacion-largo', { largo: pr.asignacion.length, cantidad: pr.cantidad });
    }
    const ids = new Set(rampas.map((r) => r.id));
    const cubiertas = new Set<string>();
    pr.asignacion.forEach((lista, i) => lista.forEach((id, j) => {
      if (!ids.has(id)) c.error('E-REF', `/personas/rampa/asignacion/${i}/${j}`, 'rampa', { id });
      else cubiertas.add(id);
    }));
    rampas.forEach((r, k) => { if (!cubiertas.has(r.id)) c.error('E-RAMPA-SIN-PERSONA', `/hub/rampas/${k}`, 'rampa', { id: r.id }); });
  }
}

function chequearCalendarioYExperimento(m: Modelo, c: Colector): void {
  const inicio = horaASeg(m.calendario.inicio), fin = horaASeg(m.calendario.fin), corte = horaASeg(m.calendario.corte);
  if (!(inicio < fin)) c.error('E-HORAS', '/calendario/fin', 'orden', { inicio: m.calendario.inicio, fin: m.calendario.fin });
  else if (corte < inicio || corte > fin + 8 * 3600) {
    c.error('E-HORAS', '/calendario/corte', 'corte', { corte: m.calendario.corte, inicio: m.calendario.inicio, limite: segAHoraLarga(fin + 8 * 3600) });
  }
  const e = m.experimento;
  if (e.replicasMin > e.replicasMax) c.error('E-RANGO', '/experimento/replicasMax', 'orden', { a: 'replicasMin', b: 'replicasMax', valorA: e.replicasMin, valorB: e.replicasMax });
  if (typeof e.nocheMostrada === 'number' && e.nocheMostrada >= e.nochesEscena) {
    c.error('E-RANGO', '/experimento/nocheMostrada', 'noche-mostrada', { valor: e.nocheMostrada, max: e.nochesEscena - 1 });
  }
  if (paquetesNominales(m) < 1) c.error('E-RANGO', '/demanda/camiones', 'sin-paquetes');
  if (m.costos.moneda !== m.unidades.moneda) c.error('E-UNIDAD', '/costos/moneda', undefined, { moneda: m.costos.moneda, monedaModelo: m.unidades.moneda });
  if (m.procedencia) {
    for (const k of Object.keys(m.procedencia)) {
      if (!leerPuntero(m, k).ok) c.aviso('A-PROCEDENCIA', `/procedencia/${escaparToken(k)}`, undefined, { ruta: k });
    }
  }
}

function chequearDecision(m: Modelo, c: Colector): boolean {
  const d = m.decision;
  if (!d) return true;
  const antes = c.errores;
  const v = d.variable;
  const r = leerPuntero(m, v.ruta);
  if (!r.ok || typeof r.valor !== 'number' || !Number.isInteger(r.valor)) c.error('E-REF', '/decision/variable/ruta', 'decision-ruta', { ruta: v.ruta });
  if (v.min > v.max) c.error('E-DECISION', '/decision/variable', 'orden', { min: v.min, max: v.max });
  else if (v.max - v.min + 1 > MAX_VALORES_DECISION) c.error('E-DECISION', '/decision/variable', 'rango', { valores: v.max - v.min + 1, max: MAX_VALORES_DECISION });
  return c.errores === antes;
}

const ETAPAS: Record<keyof EstimacionF0['utilizacion'], string> = {
  descarga: '/personas/descarga/ritmo',
  induccion: '/personas/induccion/puestosActivos',
  sorter: '/hub/sorter/velocidad',
  rampas: '/personas/rampa/cantidad',
};

function primerError(ds: readonly Diagnostico[]): Diagnostico | undefined {
  return ds.find((d) => d.nivel === 'error');
}

function chequearProfundo(m: Modelo, c: Colector, revisar: NonNullable<OpcionesChequeo['revisar']>): void {
  (m.escenarios ?? []).forEach((e, i) => {
    let variante: unknown;
    try {
      variante = aplicarParcheJson(m, e.parche);
    } catch (err) {
      const op = err instanceof ErrorParche ? err.operacion : 0;
      c.error('E-ESCENARIO', `/escenarios/${i}/parche/${op}`, 'parche', { id: e.id, operacion: op });
      return;
    }
    const r = revisar(variante);
    const d = primerError(r.diagnosticos);
    if (!r.ok && d) c.error('E-ESCENARIO', `/escenarios/${i}/parche`, 'invalido', { id: e.id, codigo: d.codigo, ruta: d.ruta || '/' });
  });
  const d = m.decision;
  if (!d) return;
  for (let v = d.variable.min; v <= d.variable.max; v++) {
    const variante = aplicarParcheJson(m, [{ op: 'replace', path: d.variable.ruta, value: v }]);
    const r = revisar(variante);
    const e = primerError(r.diagnosticos);
    if (!r.ok && e) { c.error('E-DECISION', '/decision/variable', 'valor', { valor: v, codigo: e.codigo, ruta: e.ruta || '/' }); return; }
  }
}

/**
 * Todos los chequeos sobre un modelo con la forma correcta (y ya normalizado). Devuelve el borrador F0 si no hubo errores
 * (o null). Los avisos (A-*) no impiden compilar.
 */
export function chequear(m: Modelo, c: Colector, o: OpcionesChequeo): EstimacionF0 | null {
  const antes = c.errores;
  chequearReferencias(m, c);
  chequearIds(m, c);
  chequearAndenesYCintas(m, c);
  chequearLazo(m, c);
  chequearPerfilYPlan(m, c);
  chequearPersonas(m, c);
  chequearCalendarioYExperimento(m, c);
  const decisionOk = chequearDecision(m, c);
  if (c.errores > antes) return null;

  const f0 = calcularF0(m);
  for (const k of Object.keys(ETAPAS) as (keyof typeof ETAPAS)[]) {
    const rho = f0.utilizacion[k];
    if (rho >= 1) c.aviso('A-RHO', ETAPAS[k], k, { rho: cifra(rho, 3) });
  }
  if (horaASeg(f0.finEstimado) > horaASeg(m.calendario.corte)) {
    c.aviso('A-CORTE-IMPOSIBLE', '/calendario/corte', undefined, { fin: f0.finEstimado, corte: m.calendario.corte });
  }
  const p = estimarPresupuesto(m);
  // Se compara con «no ≤» y no con «>»: un NaN (que no debería llegar) tiene que rechazarse, nunca pasar por debajo del tope.
  if (!(p.paquetes <= LIMITES_ENLACE.maxPaquetesEstimados)) {
    c.error('E-PRESUPUESTO', '/demanda/camiones', 'paquetes', { estimado: Number.isFinite(p.paquetes) ? p.paquetes : '∞', max: LIMITES_ENLACE.maxPaquetesEstimados });
  }
  if (!(p.eventos <= LIMITES_ENLACE.maxEventosEstimados)) {
    c.error('E-PRESUPUESTO', '', 'eventos', { estimado: Number.isFinite(p.eventos) ? p.eventos : '∞', max: LIMITES_ENLACE.maxEventosEstimados });
  }
  // Cotas de seguridad que la especificación no nombra (NOTAS-CONTRATO.md §8): memoria y eventos que no dependen de los paquetes.
  const lugares = lugaresDeMemoria(m);
  if (!(lugares <= MAX_LUGARES_MEMORIA)) {
    c.error('E-PRESUPUESTO', '', 'memoria', { estimado: Number.isFinite(lugares) ? lugares : '∞', max: MAX_LUGARES_MEMORIA });
  }
  if (p.eventos <= LIMITES_ENLACE.maxEventosEstimados) {
    const total = p.eventos + eventosRecurrentes(m);
    if (!(total <= LIMITES_ENLACE.maxEventosEstimados)) {
      c.error('E-PRESUPUESTO', '', 'recurrentes', { estimado: Number.isFinite(total) ? total : '∞', max: LIMITES_ENLACE.maxEventosEstimados });
    }
  }
  if (c.errores > antes) return null;
  if (o.profundo && o.revisar && decisionOk) chequearProfundo(m, c, o.revisar);
  return c.errores > antes ? null : f0;
}
