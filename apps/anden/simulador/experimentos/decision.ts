// experimentos/decision.ts · Andén simulador, corte 1, P5.
// Evaluación de una decisión de dotación con réplicas secuenciales (corte-1.md §7, diseno-maestro.md §7.5):
//  · `replicasIniciales` noches por valor de la variable, todos con la MISMA semilla y los mismos índices de réplica
//    (números aleatorios comunes: las configuraciones se comparan con la misma suerte);
//  · después, tandas SOLO para los valores en duda que todavía pueden cambiar la recomendación, hasta que ninguno
//    queda en duda o se llega a `replicasMax` por valor;
//  · la recomendación es el menor valor que cumple si todos los menores no cumplen; si alguno sigue en duda, null.
import { Prioridad } from '../contratos/experimentos.ts';
import type { EvaluacionConfiguracion, EvaluacionDecision, Planificador } from '../contratos/experimentos.ts';
import type { ModeloValidado, Variante } from '../contratos/modelo.ts';
import type { ResultadoReplica } from '../contratos/resultados.ts';
import { estadoConfiguracion, proporcion, resumir } from './estadistica/resumen.ts';
import { nochesQueFaltan } from './estadistica/wilson.ts';
import { semaforo } from './semaforo.ts';

/** La evaluación fue cancelada (el usuario movió un deslizador, el planificador se cerró…). No es un fallo del modelo. */
export class ErrorCancelado extends Error {
  constructor(mensaje = 'la evaluación fue cancelada') {
    super(mensaje);
    this.name = 'ErrorCancelado';
  }
}
export function esCancelacion(e: unknown): boolean {
  return e instanceof Error && e.name === 'ErrorCancelado';
}

/** Opciones de `EvaluarDecision` más dos extras opcionales (el contrato congelado no las tiene; ver NOTAS-CONTRATO.md). */
export interface OpcionesEvaluacion {
  replicasIniciales: number;
  tanda: number;
  replicasMax: number;
  /** `hechas` crece de a una por noche simulada; `maximo` es la cota fija (replicasMax × configuraciones): nunca baja. */
  alProgreso?: (hechas: number, maximo: number) => void;
  /** Prioridad de los trabajos. Por defecto DECISION; el tamizado usa TAMIZADO para que pueda cancelarse aparte. */
  prioridad?: Prioridad;
  /** Prefijo de los ids de trabajo (para depurar). */
  etiqueta?: string;
}

/** Máximo de valores de la variable de decisión que se evalúan juntos (cada uno es un modelo recompilado). */
export const MAX_CONFIGURACIONES = 32;

/**
 * La recomendación de §7: el menor valor que cumple, si todos los menores no cumplen. Si el primero que no «no cumple»
 * está en duda, o si ninguno cumple, null. `configuraciones` tiene que venir ordenada por valor ascendente.
 */
export function recomendar(configuraciones: readonly Pick<EvaluacionConfiguracion, 'valor' | 'estado'>[]): number | null {
  for (const c of configuraciones) {
    if (c.estado === 'cumple') return c.valor;
    if (c.estado === 'en-duda') return null;
  }
  return null;
}

let secuencia = 0;

/** Cumple la firma `EvaluarDecision` del contrato y además acepta `prioridad` y `etiqueta` en las opciones (se comprueba en firmas.test.ts). */
export const evaluarDecision = evaluarDecisionCon;

export async function evaluarDecisionCon(
  mv: ModeloValidado, p: Planificador, variante: Variante, o: OpcionesEvaluacion,
): Promise<EvaluacionDecision> {
  const decision = mv.modelo.decision;
  if (!decision) throw new Error('evaluarDecision: el modelo no define una decisión (falta modelo.decision)');
  const { replicasIniciales, tanda, replicasMax } = o;
  if (!Number.isInteger(replicasIniciales) || replicasIniciales < 2) {
    throw new Error(`evaluarDecision: replicasIniciales tiene que ser un entero ≥ 2 (hace falta para un intervalo) y llegó ${replicasIniciales}`);
  }
  if (!Number.isInteger(tanda) || tanda < 1) throw new Error(`evaluarDecision: tanda tiene que ser un entero ≥ 1 y llegó ${tanda}`);
  if (!Number.isInteger(replicasMax) || replicasMax < replicasIniciales) {
    throw new Error(`evaluarDecision: replicasMax (${replicasMax}) tiene que ser un entero ≥ replicasIniciales (${replicasIniciales})`);
  }
  const { variable, restriccion, objetivo, confianza } = decision;
  if (!Number.isInteger(variable.min) || !Number.isInteger(variable.max) || variable.min > variable.max) {
    throw new Error(`evaluarDecision: la variable de decisión necesita enteros min ≤ max y trae [${variable.min}, ${variable.max}]`);
  }
  if (variable.max - variable.min + 1 > MAX_CONFIGURACIONES) {
    throw new Error(`evaluarDecision: la variable tiene ${variable.max - variable.min + 1} valores y el máximo es ${MAX_CONFIGURACIONES}`);
  }
  const meta = restriccion.probabilidadMinima;
  if (!(meta > 0 && meta <= 1)) throw new Error(`evaluarDecision: probabilidadMinima tiene que estar en (0, 1] y llegó ${meta}`);

  const prioridad = o.prioridad ?? Prioridad.DECISION;
  const etiqueta = o.etiqueta ?? 'decision';
  const semilla = mv.modelo.experimento.semilla;

  const valores: number[] = [];
  for (let v = variable.min; v <= variable.max; v++) valores.push(v);
  const modelos = await Promise.all(valores.map((valor) => variante(mv, [{ op: 'replace', path: variable.ruta, value: valor }])));
  const configs = valores.map((valor, i) => ({ valor, mv: modelos[i], rs: [] as ResultadoReplica[] }));
  type Config = (typeof configs)[number];

  const maximo = replicasMax * configs.length;
  let hechas = 0;

  /** Una ronda: lanza todos los trabajos juntos y espera. Si algo se cancela o falla, cancela el resto y relanza. */
  async function ronda(trabajos: { cfg: Config; desde: number; hasta: number }[]): Promise<void> {
    const ids = new Set<string>();
    const promesas = trabajos.map(async ({ cfg, desde, hasta }) => {
      const id = `${etiqueta}:${cfg.valor}:${desde}-${hasta}:${++secuencia}`;
      ids.add(id);
      try {
        const fin = await p.enviar(
          { id, prioridad, mv: cfg.mv, semilla, replicas: [desde, hasta], traza: 'no' },
          (r) => { cfg.rs.push(r); hechas++; o.alProgreso?.(hechas, maximo); },
        );
        if (fin.cancelado) throw new ErrorCancelado(`la evaluación de la decisión fue cancelada (valor ${cfg.valor}, réplicas ${desde} a ${hasta - 1})`);
        if (fin.completadas !== hasta - desde) {
          throw new Error(`evaluarDecision: se esperaban ${hasta - desde} noches para el valor ${cfg.valor} y se completaron ${fin.completadas}`);
        }
      } finally {
        ids.delete(id);
      }
    });
    try {
      await Promise.all(promesas);
    } catch (e) {
      for (const id of [...ids]) p.cancelar(id);
      await Promise.allSettled(promesas);
      throw e;
    }
  }

  const evaluar = (cfg: Config): EvaluacionConfiguracion => {
    const prop = proporcion(cfg.rs, restriccion.kpi, restriccion.comparador, restriccion.umbral, confianza);
    return { valor: cfg.valor, prop, estado: estadoConfiguracion(prop, meta), objetivo: resumir(cfg.rs, objetivo.minimizar, confianza) };
  };
  /** Valores en duda que pueden cambiar la recomendación: los que están por debajo del menor que ya cumple. */
  const relevantesEnDuda = (evals: EvaluacionConfiguracion[]): EvaluacionConfiguracion[] => {
    const menorCumple = evals.find((x) => x.estado === 'cumple')?.valor ?? Infinity;
    return evals.filter((x) => x.estado === 'en-duda' && x.valor < menorCumple);
  };

  await ronda(configs.map((cfg) => ({ cfg, desde: 0, hasta: replicasIniciales })));
  let evals = configs.map(evaluar);
  for (;;) {
    const pendientes = new Set(relevantesEnDuda(evals).map((x) => x.valor));
    const siguientes = configs.filter((c) => pendientes.has(c.valor) && c.rs.length < replicasMax);
    if (siguientes.length === 0) break;
    await ronda(siguientes.map((cfg) => ({ cfg, desde: cfg.rs.length, hasta: Math.min(cfg.rs.length + tanda, replicasMax) })));
    evals = configs.map(evaluar);
  }

  // Lo que quedó en duda al llegar al máximo bloquea la recomendación: se avisa en amarillo con una estimación de lo que faltaría.
  const enDuda = relevantesEnDuda(evals);
  const primero = enDuda[0];
  const faltan = primero ? nochesQueFaltan(primero.prop.exitos, primero.prop.n, meta, confianza) : null;
  const todas = configs.flatMap((c) => c.rs);
  const minimoPorConfig = Math.min(...configs.map((c) => c.rs.length));
  return {
    decision: decision.id,
    configuraciones: evals,
    recomendacion: recomendar(evals),
    semaforo: semaforo({
      // «replicas» es lo que el texto del semáforo cuenta: las noches del valor que sigue en duda; si nada está en duda, el mínimo.
      diagnosticos: mv.diagnosticos, resultados: todas, replicas: primero ? primero.prop.n : minimoPorConfig, confianza,
      decisionEnDuda: enDuda.length > 0 ? { valores: enDuda.map((x) => x.valor), faltan } : undefined,
    }),
    replicasUsadas: todas.length,
  };
}
