// explicacion/causas.ts · Andén simulador, corte 1, P7 · Causas confirmadas por contrafactual (corte-1.md §9, P7, «Causas»).
//
// Una espera larga NO es una causa hasta que el contrafactual lo confirma. El camino:
//   1. candidatas = esperas del paquete de ≥ 5 min o de ≥ 20% de su tiempo en el hub, agrupadas por causa (y por rampa, si es rampa llena);
//   2. cada causa tiene su cambio fijo (un parche del modelo):
//        PAUSA → pausas del rol con duración 0        AUSENCIA → retén + 1            RAMPA_LLENA → capacidad de esa rampa × 2
//        FALLA → sin micro-paradas                    FILA o BLOQUEO → un puesto activo más
//        NO_LEIDO → noLeido 0                         CIERRE_JAULA → cierre 0         FALTA_BANDEJA → sin causa propia (no se afirma)
//        DESCARGA (esperó dentro de su camión: andenes ocupados o cola de descarga) → una persona más de descarga en cada andén
//      (PERSONA_OCUPADA y NO_TRANSPORTABLE tampoco tienen cambio fijo: se describen en la biografía, no se afirman);
//   3. se corre el contrafactual de cada candidata con la misma semilla y réplica; solo las confirmadas se muestran como causa;
//   4. si quedaron 2 o 3 sin confirmar de a una, se prueba el cambio conjunto y, si confirma, se muestra la causa conjunta
//      (un encabezado `explicacion.causa.conjunta` y una frase `explicacion.causa.conjunta.<tipo>` por cada componente).
//
// Dos candidatas con exactamente el mismo cambio (fila y bloqueo piden «un puesto más») se prueban una sola vez y comparten veredicto.
import { Causa, ClaseEntidad, TipoTramo, claseDeRef, idDeRef, refDe } from '../contratos/traza.ts';
import type { Traza } from '../contratos/traza.ts';
import type { CausasConfirmadas, Contrafactual, Espera, Frase } from '../contratos/explicacion.ts';
import type { ModeloValidado, OpParche } from '../contratos/modelo.ts';
import { encontrarPaquete, tiempoEnHub, tramosDe } from './consulta.ts';
import { esperasDe } from './esperas.ts';
import { afirmarHora, afirmarMinutos, afirmarTramo, crearFrase, horaDe, nombreDe, tipoDeCausa } from './frases.ts';
import type { TipoDeCausa } from './frases.ts';

export const UMBRAL_ESPERA_MS = 5 * 60 * 1000;
export const UMBRAL_FRACCION_EN_HUB = 0.2;
/** Como mucho, esta cantidad de candidatas por paquete (las de más espera): cada una cuesta una noche simulada. */
export const MAX_CANDIDATAS = 6;
/** La causa conjunta se prueba solo con 2 o 3 causas sin confirmar de a una (2^k experimentos; con más, solo de un factor). */
export const MAX_CAUSAS_CONJUNTAS = 3;
/** Personas por andén que admite el esquema (modelo/esquema.ts › MAX_PERSONAS_ANDEN; este paquete no importa modelo/). */
export const TOPE_PERSONAS_ANDEN = 50;

export interface ItemDeCausa {
  tipo: TipoDeCausa;
  /** La espera más larga del grupo: de ella salen los minutos de la frase. */
  espera: Espera;
  /** Tramo de la vuelta más alta (solo para rampa llena): de él sale la cantidad de vueltas. */
  tramoVuelta: number;
  /** Suma de las esperas del grupo (ms). */
  total: number;
}
export interface Candidata { cambio: Contrafactual['cambio']; items: ItemDeCausa[]; peso: number }

// ---------------------------------------------------------------------------------------------------------- cambio de cada causa

function indiceDeRampa(mv: ModeloValidado, t: Traza, rampa: number): number {
  const id = t.catalogo.rampas[rampa];
  const rampas = mv.modelo.hub.rampas;
  const i = id === undefined ? -1 : rampas.findIndex((r) => r.id === id);
  return i >= 0 ? i : rampa < rampas.length ? rampa : -1;
}

/** El cambio fijo de una causa, o `null` si no hay (o si el modelo ya lo tiene: el contrafactual no cambiaría nada). */
export function cambioDeCausa(mv: ModeloValidado, t: Traza, tipo: TipoDeCausa, causante: number): Contrafactual['cambio'] | null {
  const m = mv.modelo;
  const clave = `explicacion.cambio.${tipo}`;
  const reemplazo = (path: string, value: unknown): OpParche[] => [{ op: 'replace', path, value }];
  switch (tipo) {
    case 'pausa': {
      const persona = causante >= 0 && claseDeRef(causante) === ClaseEntidad.PERSONA ? t.catalogo.personas[idDeRef(causante)] : undefined;
      const rol = persona && (persona.rol === 'induccion' || persona.rol === 'reten') ? 'induccion' : 'rampa';
      if (m.personas[rol].pausas.duracion === 0) return null;
      return { clave, vars: {}, parche: reemplazo(`/personas/${rol}/pausas/duracion`, 0) };
    }
    case 'ausencia': {
      const reten = m.personas.induccion.reten + 1;
      return { clave, vars: { reten }, parche: reemplazo('/personas/induccion/reten', reten) };
    }
    case 'rampa_llena': {
      if (causante < 0 || claseDeRef(causante) !== ClaseEntidad.RAMPA) return null;
      const i = indiceDeRampa(mv, t, idDeRef(causante));
      if (i < 0) return null;
      const capacidad = Math.max(1, m.hub.rampas[i].capacidad * 2);
      if (capacidad <= m.hub.rampas[i].capacidad) return null;
      return { clave, vars: { rampa: m.hub.rampas[i].id, capacidad }, parche: reemplazo(`/hub/rampas/${i}/capacidad`, capacidad) };
    }
    case 'falla':
      if (!m.hub.sorter.paradas.activas) return null;
      return { clave, vars: {}, parche: reemplazo('/hub/sorter/paradas/activas', false) };
    case 'fila': case 'bloqueo': {
      const puestos = m.personas.induccion.puestosActivos + 1;
      if (puestos > m.hub.induccion.puestos.length) return null;
      return { clave, vars: { puestos }, parche: reemplazo('/personas/induccion/puestosActivos', puestos) };
    }
    case 'no_leido':
      if (m.hub.sorter.lector.noLeido === 0) return null;
      return { clave, vars: {}, parche: reemplazo('/hub/sorter/lector/noLeido', 0) };
    case 'cierre_jaula':
      if (m.hub.jaulas.cierre === 0) return null;
      return { clave, vars: {}, parche: reemplazo('/hub/jaulas/cierre', 0) };
    case 'descarga': {
      // una persona más en CADA andén: baja más rápido el camión del paquete y libera antes los andenes para los que esperan en la playa
      const andenes = m.hub.andenes;
      if (andenes.length === 0 || andenes.some((a) => a.personas + 1 > TOPE_PERSONAS_ANDEN)) return null;
      return { clave, vars: {}, parche: andenes.map((a, i) => ({ op: 'replace', path: `/hub/andenes/${i}/personas`, value: a.personas + 1 })) };
    }
  }
}

/**
 * La espera del paquete DENTRO de su camión (hallazgo HUB-R01 de la revisión del 30-10-2026). El paquete nace cuando empieza su
 * descarga, así que la cola del camión en la playa (andenes ocupados) y detrás de los paquetes anteriores del mismo camión no es un tramo
 * suyo, ninguna espera la contaba y un corte perdido por saturación de los andenes quedaba sin causa (con 2.000 paquetes por camión, 1.424
 * de 9.114 paquetes tarde sin ninguna candidata). Va desde la llegada del camión (o el inicio del turno, si llegó antes: antes del turno no
 * se descarga) hasta que empieza su descarga. Evidencia: el primer tramo del camión (su llegada) y el tramo DESCARGA del paquete: las dos
 * horas de la frase salen de esos tramos. `null` si la traza no trae los tramos del camión o la descarga.
 */
export function esperaEnCamion(t: Traza, paquete: number): Espera | null {
  const camion = t.paquetes.camion[paquete];
  if (!(camion >= 0)) return null;
  const delCamion = tramosDe(t, 'camion', camion);
  if (delCamion.length === 0) return null;
  let llegada = delCamion[0];
  for (const i of delCamion) if (t.tramos.t0[i] < t.tramos.t0[llegada]) llegada = i;
  let descarga = -1;
  for (const i of tramosDe(t, 'paquete', paquete)) if (t.tramos.k[i] === TipoTramo.DESCARGA) { descarga = i; break; }
  if (descarga < 0) return null;
  const desde = Math.max(t.tramos.t0[llegada], t.inicio), hasta = t.tramos.t0[descarga];
  if (!(hasta > desde)) return null;
  return {
    desde, hasta, donde: t.tramos.k[llegada] as Espera['donde'], recurso: t.tramos.r[descarga], causa: Causa.ANDEN_OCUPADO,
    causante: refDe(ClaseEntidad.CAMION, camion), evidencia: [llegada, descarga],
  };
}

/** ¿Una espera de `total` ms pasa el umbral de candidata, para un paquete que pasó `enHub` ms en el hub? */
function esLarga(total: number, enHub: number): boolean {
  return total >= UMBRAL_ESPERA_MS || (enHub > 0 && total >= UMBRAL_FRACCION_EN_HUB * enHub);
}

// ------------------------------------------------------------------------------------------------------------------ candidatas

/** Tramo BANDEJA de vuelta extra más alta del paquete (para contar las vueltas de una rampa llena), o −1. */
function tramoDeMayorVuelta(t: Traza, paquete: number, rampa: number | null): number {
  let mejor = -1;
  for (const i of tramosDe(t, 'paquete', paquete)) {
    if (t.tramos.k[i] !== TipoTramo.BANDEJA || t.tramos.a[i] <= 0) continue;
    const q = t.tramos.q[i];
    if (rampa !== null && !(q >= 0 && claseDeRef(q) === ClaseEntidad.RAMPA && idDeRef(q) === rampa)) continue;
    if (mejor < 0 || t.tramos.a[i] >= t.tramos.a[mejor]) mejor = i;
  }
  return mejor;
}

/** Las candidatas de un paquete, con su cambio, de mayor a menor espera (como mucho `MAX_CANDIDATAS`). No simula nada. */
export function candidatasDe(t: Traza, mv: ModeloValidado, paquete: number): Candidata[] {
  const enHub = tiempoEnHub(t, paquete);
  const grupos = new Map<string, { tipo: TipoDeCausa; esperas: Espera[] }>();
  for (const e of esperasDe(t, ClaseEntidad.PAQUETE, paquete)) {
    const tipo = tipoDeCausa(e.causa);
    if (!tipo) continue;
    const rampa = tipo === 'rampa_llena' && e.causante >= 0 && claseDeRef(e.causante) === ClaseEntidad.RAMPA ? idDeRef(e.causante) : -1;
    const clave = tipo === 'rampa_llena' ? `${tipo}:${rampa}` : tipo;
    const g = grupos.get(clave);
    if (g) g.esperas.push(e); else grupos.set(clave, { tipo, esperas: [e] });
  }
  // la espera dentro del camión (HUB-R01): su umbral se mide contra el tiempo desde que el camión llegó, no desde que el paquete nació
  const enCamion = esperaEnCamion(t, paquete);
  if (enCamion) {
    const largo = enCamion.hasta - enCamion.desde, listo = t.paquetes.listo[paquete];
    if (esLarga(largo, (listo >= 0 ? listo : t.fin) - enCamion.desde)) grupos.set('descarga', { tipo: 'descarga', esperas: [enCamion] });
  }
  const porCambio = new Map<string, Candidata>();
  for (const { tipo, esperas } of grupos.values()) {
    const total = esperas.reduce((s, e) => s + (e.hasta - e.desde), 0);
    if (tipo !== 'descarga' && !esLarga(total, enHub)) continue;
    const principal = esperas.reduce((a, b) => (b.hasta - b.desde > a.hasta - a.desde ? b : a));
    const cambio = cambioDeCausa(mv, t, tipo, principal.causante);
    if (!cambio) continue;
    let tramoVuelta = -1;
    if (tipo === 'rampa_llena') {
      const rampa = claseDeRef(principal.causante) === ClaseEntidad.RAMPA ? idDeRef(principal.causante) : null;
      tramoVuelta = tramoDeMayorVuelta(t, paquete, rampa);
      if (tramoVuelta < 0) continue;   // sin una vuelta extra en la traza no hay nada que contar
    }
    const item: ItemDeCausa = { tipo, espera: principal, tramoVuelta, total };
    const llave = JSON.stringify(cambio.parche);
    const ya = porCambio.get(llave);
    if (ya) { ya.items.push(item); ya.peso = Math.max(ya.peso, total); }
    else porCambio.set(llave, { cambio, items: [item], peso: total });
  }
  return [...porCambio.values()].sort((a, b) => b.peso - a.peso).slice(0, MAX_CANDIDATAS);
}

// ---------------------------------------------------------------------------------------------------------------------- frases

/** La frase de una causa confirmada. `modo`: 'corte' (perdía el corte y ahora llega) o 'adelanto' (ya llegaba y ahora llega 5 min antes). */
export function fraseDeCausa(t: Traza, item: ItemDeCausa, modo: 'corte' | 'adelanto', componente: boolean): Frase {
  const base = componente ? `explicacion.causa.conjunta.${item.tipo}` : `explicacion.causa.${item.tipo}`;
  const clave = componente || modo === 'corte' ? base : `${base}.adelanto`;
  const e = item.espera;
  switch (item.tipo) {
    case 'pausa': case 'ausencia': case 'cierre_jaula': {
      const min = afirmarMinutos(t, e.evidencia[0]);
      return crearFrase(clave, {
        espera: min.valor,
        rampa: nombreDe(t.catalogo.rampas, e.recurso, 'R'),
        persona: nombreDe(t.catalogo.personas, e.causante >= 0 ? idDeRef(e.causante) : -1, 'P'),
      }, [min]);
    }
    case 'descarga': {
      const [llegada, descarga] = e.evidencia;
      return crearFrase(clave, {
        camion: nombreDe(t.catalogo.camiones, idDeRef(e.causante), 'T'),
        llegada: horaDe(t.tramos.t0[llegada]), inicio: horaDe(t.tramos.t0[descarga]),
      }, [afirmarHora(t, llegada, 't0'), afirmarHora(t, descarga, 't0')]);
    }
    case 'rampa_llena': {
      const vueltas = afirmarTramo(t, item.tramoVuelta, 'a', 'vueltas', 0);
      return crearFrase(clave, { vueltas: vueltas.valor, rampa: nombreDe(t.catalogo.rampas, idDeRef(e.causante), 'R') }, [vueltas]);
    }
    default: {
      const min = afirmarMinutos(t, e.evidencia[0]);
      return crearFrase(clave, { espera: min.valor }, [min]);
    }
  }
}

// ----------------------------------------------------------------------------------------------------------------------- flujo

/**
 * Causas confirmadas de un paquete de la noche `t` (semilla y réplica de esa noche). `contrafactual(cambio)` repite la noche con el
 * cambio y mira este paquete (la integración lo arma con `crearContrafactual`). Devuelve las frases de las causas confirmadas y todos
 * los contrafactuales que corrió (también los que no confirmaron), en el orden de las candidatas y, al final, el conjunto si se probó.
 */
export const causasConfirmadas: CausasConfirmadas = async (t, mv, semilla, replica, camion, indice, contrafactual) => {
  void semilla; void replica;   // los usa el contrafactual (la noche de `t` ya es esa); acá solo viajan en la firma del contrato
  const paquete = encontrarPaquete(t, camion, indice);
  if (paquete < 0) {
    throw new Error(`causasConfirmadas: el paquete (camión ${camion}, índice ${indice}) no está en la traza (hay ${t.paquetes.n} paquetes en esa noche)`);
  }
  const candidatas = candidatasDe(t, mv, paquete);
  if (candidatas.length === 0) return { causas: [], contrafactuales: [] };

  const resultados = await Promise.all(candidatas.map((c) => contrafactual(c.cambio)));
  const causas: Frase[] = [];
  const contrafactuales: Contrafactual[] = [...resultados];
  const sinConfirmar: Candidata[] = [];
  candidatas.forEach((c, i) => {
    if (resultados[i].confirma) {
      const modo = resultados[i].antes.antesDelCorte ? 'adelanto' : 'corte';
      for (const item of c.items) causas.push(fraseDeCausa(t, item, modo, false));
    } else sinConfirmar.push(c);
  });

  if (sinConfirmar.length >= 2 && sinConfirmar.length <= MAX_CAUSAS_CONJUNTAS) {
    const cambio: Contrafactual['cambio'] = {
      clave: 'explicacion.cambio.conjunta', vars: {}, parche: sinConfirmar.flatMap((c) => c.cambio.parche),
    };
    const conjunto = await contrafactual(cambio);
    contrafactuales.push(conjunto);
    if (conjunto.confirma) {
      const modo = conjunto.antes.antesDelCorte ? 'adelanto' : 'corte';
      causas.push(crearFrase(modo === 'corte' ? 'explicacion.causa.conjunta' : 'explicacion.causa.conjunta.adelanto', {}, []));
      for (const c of sinConfirmar) for (const item of c.items) causas.push(fraseDeCausa(t, item, modo, true));
    }
  }
  return { causas, contrafactuales };
};
