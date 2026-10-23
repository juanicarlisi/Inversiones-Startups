// explicacion/tamizado.ts · Andén simulador, corte 1, P7 · Tamizado por decisión (corte-1.md §9, P7, «Tamizado»).
//
// Ordena los supuestos por cuánto puede costar equivocarse con ellos, no por cuánto mueve un indicador: el ausentismo y el atraso de los
// troncales mueven el fin del turno parecido, pero solo uno de los dos cambia cuántos puestos hacen falta.
//   · supuestos = parámetros con `incierto` que el modelo usa de verdad (si `temporarios` es 0, `eficienciaTemporario` no aplica);
//   · para cada uno, una variante con el valor bajo y otra con el alto (el medio es el modelo), cada una evaluada con `evaluar`;
//   · decisiones d_bajo, d_medio, d_alto; pérdida esperada = Σ pesoᵢ · |costoᵢ(dᵢ) − costoᵢ(d_medio)| con el costo medio de cada
//     configuración. Si dᵢ es null hay dos casos distintos (hallazgo E-05 de la revisión del 19-10-2026):
//       - NINGUNA opción cumple con ese valor: se usa el máximo de la variable, como dice §9;
//       - alguna opción quedó EN DUDA (el tamizado mira hasta 100 noches por opción): la decisión está entre la menor opción en duda y
//         la menor que cumple (o el máximo si ninguna cumple). Se calcula la pérdida con cada candidata y se usa la MAYOR (lo más que
//         puede costar equivocarse); el rango [menor, mayor] queda en `perdidaRango` y `enDuda` marca qué extremo quedó en duda, para que
//         el formulario no diga «ninguna opción alcanza» cuando en realidad faltan noches. Antes se usaba el máximo también en la duda,
//         y eso inflaba la pérdida y hacía preguntas de más.
//     La decisión queda en null para que se vea;
//   · el corrimiento del KPI objetivo entre los extremos va como dato secundario.
// No es el valor esperado de información perfecta completo: son previas de tres puntos, un supuesto por vez (diseño maestro A10).
//
// La cancelación la maneja `evaluar` (el planificador corre las evaluaciones con prioridad TAMIZADO): si se rechaza, el tamizado se
// rechaza con el mismo error y no devuelve resultados parciales.
import type { EvaluacionDecision } from '../contratos/experimentos.ts';
import type { Modelo } from '../contratos/modelo.ts';
import type { ResultadoTamizado, SupuestosDe, SupuestoTamizable, Tamizar } from '../contratos/decision.ts';
import { escaparToken, parcheDeValor, valorCentral } from './parametros.ts';

const PESOS_POR_DEFECTO: [number, number, number] = [0.25, 0.5, 0.25];

// ----------------------------------------------------------------------------------------------------------------- supuestos

/** Dónde usa el modelo cada parámetro: nombre → rutas (JSON Pointer) de los campos que lo referencian con «@nombre». */
function usosDeParametros(m: Modelo): Map<string, string[]> {
  const usos = new Map<string, string[]>();
  const recorrer = (x: unknown, ruta: string): void => {
    if (typeof x === 'string') {
      if (x.startsWith('@')) {
        const nombre = x.slice(1);
        const l = usos.get(nombre);
        if (l) l.push(ruta); else usos.set(nombre, [ruta]);
      }
    } else if (Array.isArray(x)) {
      x.forEach((v, i) => recorrer(v, `${ruta}/${i}`));
    } else if (x !== null && typeof x === 'object') {
      for (const k of Object.keys(x)) recorrer((x as Record<string, unknown>)[k], `${ruta}/${escaparToken(k)}`);
    }
  };
  for (const k of Object.keys(m)) {
    if (k === 'parametros' || k === 'escenarios') continue;
    recorrer((m as unknown as Record<string, unknown>)[k], `/${escaparToken(k)}`);
  }
  return usos;
}

/** Probabilidad o número que dice un campo `Num`, o NaN si es una distribución sin valor central simple. */
function numeroDe(m: Modelo, x: number | string): number {
  if (typeof x === 'number') return x;
  const p = m.parametros[x.slice(1)];
  return p ? valorCentral(p.valor) : NaN;
}

/** ¿El campo que referencia a un parámetro cuenta en esta configuración del modelo? (un campo apagado no hace falta preguntarlo) */
function aplica(m: Modelo, ruta: string): boolean {
  if (ruta === '/personas/induccion/eficienciaTemporario') return m.personas.induccion.temporarios > 0;
  if (ruta.startsWith('/personas/fatiga/')) return m.personas.fatiga.activa;
  if (ruta.startsWith('/hub/sorter/paradas/')) return m.hub.sorter.paradas.activas;
  if (ruta === '/demanda/atrasoComun/demora') return !(numeroDe(m, m.demanda.atrasoComun.probabilidad) === 0);
  if (ruta.startsWith('/personas/rampa/')) return m.personas.rampa.cantidad > 0;
  if (ruta.startsWith('/personas/excepcion/')) return m.personas.excepcion.cantidad > 0;
  if (ruta === '/personas/induccion/ausentismo') return m.personas.induccion.puestosActivos > 0;
  return true;
}

function normalizarPesos(nombre: string, pesos: readonly number[]): [number, number, number] {
  if (pesos.length !== 3 || pesos.some((p) => !Number.isFinite(p) || p < 0)) {
    throw new Error(`supuestosDe: los pesos de «${nombre}» tienen que ser tres números no negativos y llegó [${pesos.join(', ')}]`);
  }
  const suma = pesos[0] + pesos[1] + pesos[2];
  if (!(suma > 0)) throw new Error(`supuestosDe: los pesos de «${nombre}» suman ${suma} y tienen que sumar algo mayor que 0`);
  return Math.abs(suma - 1) < 1e-9 ? [pesos[0], pesos[1], pesos[2]] : [pesos[0] / suma, pesos[1] / suma, pesos[2] / suma];
}

/** Los supuestos tamizables del modelo, por nombre de parámetro (orden estable). */
export const supuestosDe: SupuestosDe = (mv) => {
  const m = mv.modelo;
  const usos = usosDeParametros(m);
  const salida: SupuestoTamizable[] = [];
  for (const nombre of Object.keys(m.parametros).sort()) {
    const p = m.parametros[nombre];
    if (!p.incierto) continue;
    const rutas = usos.get(nombre);
    if (!rutas || !rutas.some((r) => aplica(m, r))) continue;
    if (parcheDeValor(nombre, p, p.incierto.bajo) === null) continue;   // sin valor central que mover
    salida.push({
      parametro: nombre,
      valores: [p.incierto.bajo, p.incierto.medio, p.incierto.alto],
      pesos: normalizarPesos(nombre, p.incierto.pesos ?? PESOS_POR_DEFECTO),
      golpeDiscreto: p.golpeDiscreto === true,
    });
  }
  return salida;
};

// ------------------------------------------------------------------------------------------------------------------ tamizado

/** Lo que el tamizado agrega a cada fila además del contrato (decision.ts): la duda de cada extremo y el rango de la pérdida. */
export interface ResultadoTamizadoConDuda extends ResultadoTamizado {
  /** [bajo, medio, alto]: true si con ese valor la decisión quedó en duda (y no «ninguna cumple»). */
  enDuda: [boolean, boolean, boolean];
  /** Pérdida esperada con la resolución más favorable y con la más desfavorable de las dudas; iguales si no hubo duda. */
  perdidaRango: [number, number];
  /**
   * Lo que cuesta equivocarse si el valor real es el extremo peor (sin ponderar): max(|Δ_bajo|, |Δ_alto|). La pérdida esperada es un
   * promedio ponderado; esto es el «hasta» (hallazgo E-12: Presentar decía «cuesta hasta» con el promedio).
   */
  peorCaso: number;
}

/**
 * Las decisiones posibles de una evaluación sin recomendación que quedó en duda: desde la menor opción en duda (las anteriores no
 * cumplen) hasta la menor que cumple después de ella, o hasta la última si ninguna cumple. null si no hay duda (ninguna cumple, o hay
 * recomendación).
 */
export function decisionesPosibles(ev: EvaluacionDecision): number[] | null {
  if (ev.recomendacion !== null) return null;
  const confs = [...ev.configuraciones].sort((a, b) => a.valor - b.valor);
  const i = confs.findIndex((c) => c.estado !== 'no-cumple');
  if (i < 0 || confs[i].estado !== 'en-duda') return null;
  const out: number[] = [];
  for (let j = i; j < confs.length; j++) {
    out.push(confs[j].valor);
    if (confs[j].estado === 'cumple') break;
  }
  return out;
}

function costoDe(ev: EvaluacionDecision, valor: number, que: string): number {
  const c = ev.configuraciones.find((x) => x.valor === valor);
  if (!c) {
    throw new Error(`tamizar: la evaluación ${que} no tiene la configuración ${valor} (tiene ${ev.configuraciones.map((x) => x.valor).join(', ')})`);
  }
  return c.objetivo.media;
}

export const tamizar: Tamizar = async (mv, supuestos, evaluar, variante, o) => {
  const decision = mv.modelo.decision;
  if (!decision) throw new Error('tamizar: el modelo no tiene `decision` y se esperaba una (variable, restricción y objetivo) para saber qué decisión tamizar');
  const maximo = decision.variable.max;
  const total = 1 + 2 * supuestos.length;
  let hechos = 0;
  const avisar = () => { o?.alProgreso?.(++hechos, total); };

  const medio = await evaluar(mv);
  avisar();
  const filas: ResultadoTamizadoConDuda[] = [];
  for (const s of supuestos) {
    const p = mv.modelo.parametros[s.parametro];
    if (!p) throw new Error(`tamizar: el parámetro «${s.parametro}» no está en el modelo`);
    const extremo = async (valor: number): Promise<EvaluacionDecision> => {
      if (valor === s.valores[1]) return medio;
      const parche = parcheDeValor(s.parametro, p, valor);
      if (!parche) throw new Error(`tamizar: «${s.parametro}» no tiene un valor central que mover (distribución sin media simple)`);
      return evaluar(await variante(mv, parche));
    };
    const bajo = await extremo(s.valores[0]);
    avisar();
    const alto = await extremo(s.valores[2]);
    avisar();

    const dM = medio.recomendacion, dB = bajo.recomendacion, dA = alto.recomendacion;
    const usar = (d: number | null) => d ?? maximo;
    // pérdida de un extremo: [menor, mayor] sobre sus decisiones posibles (una sola si no quedó en duda)
    const perdidaExtremo = (ev: EvaluacionDecision, d: number | null, que: string): [number, number] => {
      const base = costoDe(ev, usar(dM), que);
      const posibles = d === null ? decisionesPosibles(ev) : null;
      const candidatas = posibles ?? [usar(d)];
      let lo = Infinity, hi = -Infinity;
      for (const c of candidatas) { const x = Math.abs(costoDe(ev, c, que) - base); if (x < lo) lo = x; if (x > hi) hi = x; }
      return [lo, hi];
    };
    const pB = perdidaExtremo(bajo, dB, 'baja'), pA = perdidaExtremo(alto, dA, 'alta');
    const perdidaRango: [number, number] = [s.pesos[0] * pB[0] + s.pesos[2] * pA[0], s.pesos[0] * pB[1] + s.pesos[2] * pA[1]];
    const perdida = perdidaRango[1];
    filas.push({
      parametro: s.parametro,
      decisiones: [dB, dM, dA],
      cambiaDecision: dB !== dM || dA !== dM,
      perdidaEsperada: perdida,
      enDuda: [decisionesPosibles(bajo) !== null, decisionesPosibles(medio) !== null, decisionesPosibles(alto) !== null],
      perdidaRango,
      peorCaso: Math.max(pB[1], pA[1]),
      corrimientoObjetivo: Math.abs(costoDe(alto, usar(dM), 'alta') - costoDe(bajo, usar(dM), 'baja')),
      replicas: bajo.replicasUsadas + medio.replicasUsadas + alto.replicasUsadas,
      evaluaciones: [bajo, medio, alto],
    });
  }
  // de más a menos pérdida; a igual pérdida, el que más corre el KPI; a igual, por nombre (orden estable)
  filas.sort((a, b) => b.perdidaEsperada - a.perdidaEsperada || b.corrimientoObjetivo - a.corrimientoObjetivo || (a.parametro < b.parametro ? -1 : a.parametro > b.parametro ? 1 : 0));
  return filas;
};
