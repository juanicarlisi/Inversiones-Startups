// escena/riesgo.ts · Andén simulador, corte 1 · P6 (escena).
// Las cien noches sobre el plano (contratos/vistas.ts, AgregarRiesgo): se arma SOLO con ResultadoReplica, nunca con trazas (las cien
// noches no retienen trazas: diseño maestro §4.6). Definiciones:
// - rampaProbLlena[r]: fracción de noches con rampaMinutosLlena[r] > 0 (la rampa se llenó al menos una vez);
// - rampaMinutosLlenaP90[r], filaP50[q], filaP90[q], finClasificacionMin: percentiles P_q = x₍min(n−1, ⌊q·n⌋)₎ con x ordenado (la misma
//   definición que experimentos/, corte-1.md §7). Una noche que terminó antes no tiene el cuarto de hora q: cuenta como fila 0 (vacía);
// - nocheMediana: la réplica en la posición ⌊n/2⌋ al ordenar las noches por kpiNoche (empate: menor réplica), la misma que el P50;
// - nochePeor: la peor según el sentido del KPI (META_KPI: 'menos' → la mayor, 'mas' → la menor; 'neutro' se toma como 'menos');
//   empate: la menor réplica.
// Sin noches devuelve un mapa vacío con réplicas −1 y percentiles NaN (la interfaz puede llamarlo mientras llegan las noches).
import { KPIS, META_KPI, type KpiId, type ResultadoReplica } from '../contratos/resultados.ts';
import type { AgregarRiesgo, MapaRiesgo } from '../contratos/vistas.ts';

/** P_q de un arreglo YA ORDENADO de menor a mayor. */
export function percentilOrdenado(x: ArrayLike<number>, q: number): number {
  const n = x.length;
  if (n === 0) return NaN;
  return x[Math.min(n - 1, Math.floor(q * n))];
}

function validar(rs: ResultadoReplica[], kpi: KpiId): void {
  if (!Array.isArray(rs)) throw new TypeError('agregarRiesgo: se esperaba una lista de ResultadoReplica.');
  if (!(KPIS as readonly string[]).includes(kpi)) throw new RangeError(`agregarRiesgo: «${kpi}» no es un KPI (se esperaba uno de ${KPIS.join(', ')}).`);
  if (rs.length === 0) return;
  const m = rs[0].modelo, nr = rs[0].porRecurso.rampaMinutosLlena.length;
  rs.forEach((r, i) => {
    if (r.modelo !== m) throw new Error(`agregarRiesgo: la noche ${i} es del modelo ${r.modelo} y la primera de ${m} (no se mezclan modelos).`);
    if (r.porRecurso.rampaMinutosLlena.length !== nr) {
      throw new Error(`agregarRiesgo: la noche ${i} trae ${r.porRecurso.rampaMinutosLlena.length} rampas y la primera ${nr}.`);
    }
    const v = r.kpi[kpi];
    if (typeof v !== 'number' || Number.isNaN(v)) throw new Error(`agregarRiesgo: la noche ${i} (réplica ${r.replica}) no tiene un número en ${kpi} (vino ${v}).`);
  });
}

/** Réplicas ordenadas por el KPI (empate: menor réplica). */
function ordenarPorKpi(rs: ResultadoReplica[], kpi: KpiId): ResultadoReplica[] {
  return rs.slice().sort((a, b) => a.kpi[kpi] - b.kpi[kpi] || a.replica - b.replica);
}

export type CualNoche = 'mediana' | 'peor' | 'mejor';

/** La réplica mediana, peor o mejor según el KPI (−1 sin noches). «Mejor» no está en MapaRiesgo: la usa el selector de la interfaz. */
export function elegirNoche(rs: ResultadoReplica[], kpi: KpiId, cual: CualNoche): number {
  validar(rs, kpi);
  if (rs.length === 0) return -1;
  const ord = ordenarPorKpi(rs, kpi);
  if (cual === 'mediana') return ord[Math.min(ord.length - 1, Math.floor(ord.length / 2))].replica;
  const masEsMejor = META_KPI[kpi].mejor === 'mas';
  const quiereMayor = cual === 'peor' ? !masEsMejor : masEsMejor;
  if (!quiereMayor) return ord[0].replica;
  // la mayor; con empate, la de menor réplica
  const max = ord[ord.length - 1].kpi[kpi];
  for (const r of ord) if (r.kpi[kpi] === max) return r.replica;
  return ord[ord.length - 1].replica;
}

export const agregarRiesgo: AgregarRiesgo = (resultados: ResultadoReplica[], kpiNoche: KpiId): MapaRiesgo => {
  validar(resultados, kpiNoche);
  const n = resultados.length;
  if (n === 0) {
    return {
      noches: 0, rampaProbLlena: new Float32Array(0), rampaMinutosLlenaP90: new Float32Array(0), filaP50: new Float32Array(0),
      filaP90: new Float32Array(0), finClasificacionMin: { p10: NaN, p50: NaN, p90: NaN }, nocheMediana: -1, nochePeor: -1,
    };
  }
  const nr = resultados[0].porRecurso.rampaMinutosLlena.length;
  const prob = new Float32Array(nr), p90 = new Float32Array(nr);
  const col = new Float64Array(n);
  for (let r = 0; r < nr; r++) {
    let llenas = 0;
    for (let i = 0; i < n; i++) {
      const m = resultados[i].porRecurso.rampaMinutosLlena[r];
      col[i] = m;
      if (m > 0) llenas++;
    }
    prob[r] = llenas / n;
    col.sort();
    p90[r] = percentilOrdenado(col, 0.9);
  }
  let nq = 0;
  for (const r of resultados) nq = Math.max(nq, r.series.filaInduccionMax.length);
  const f50 = new Float32Array(nq), f90 = new Float32Array(nq);
  for (let q = 0; q < nq; q++) {
    for (let i = 0; i < n; i++) col[i] = resultados[i].series.filaInduccionMax[q] ?? 0;
    col.sort();
    f50[q] = percentilOrdenado(col, 0.5);
    f90[q] = percentilOrdenado(col, 0.9);
  }
  for (let i = 0; i < n; i++) col[i] = resultados[i].kpi.finClasificacionMin;
  col.sort();
  return {
    noches: n, rampaProbLlena: prob, rampaMinutosLlenaP90: p90, filaP50: f50, filaP90: f90,
    finClasificacionMin: { p10: percentilOrdenado(col, 0.1), p50: percentilOrdenado(col, 0.5), p90: percentilOrdenado(col, 0.9) },
    nocheMediana: elegirNoche(resultados, kpiNoche, 'mediana'),
    nochePeor: elegirNoche(resultados, kpiNoche, 'peor'),
  };
};
