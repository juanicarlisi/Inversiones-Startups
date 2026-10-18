// experimentos/estadistica/pareada.ts · Andén simulador, corte 1, P5.
// Comparación pareada con números aleatorios comunes (misma semilla y réplica en A y en B): Zᵢ = Bᵢ − Aᵢ, IC de t sobre Z.
// Contrato de honestidad (diseno-maestro.md §7.10.3): «A es mejor que B» solo si el intervalo de la diferencia excluye el cero.
import { META_KPI } from '../../contratos/resultados.ts';
import type { KpiId, ResultadoReplica } from '../../contratos/resultados.ts';
import type { Comparacion } from '../../contratos/experimentos.ts';
import { cuantilT } from './t-student.ts';
import { ordenarPorReplica, validarKpi } from './resumen.ts';

/** ¿Tiene sentido hablar de «mejor» y «peor» para este KPI? (los neutros, como paquetes o utilización, no). */
export function tieneSentido(kpi: KpiId): boolean {
  return META_KPI[kpi].mejor !== 'neutro';
}

/**
 * Compara B contra A, pareado por (semilla, réplica). Las listas pueden venir en cualquier orden (se ordenan por réplica);
 * lanza si no son las mismas réplicas con las mismas semillas, si hay menos de 2, o si el KPI es neutro (no tiene un «mejor»:
 * dar un veredicto sería inventar un criterio; para ver la diferencia de un KPI neutro se usa `resumir` sobre las diferencias).
 */
export function comparar(a: ResultadoReplica[], b: ResultadoReplica[], kpi: KpiId, confianza: number): Comparacion {
  validarKpi(kpi);
  const sentido = META_KPI[kpi].mejor;
  if (sentido === 'neutro') {
    throw new Error(`el KPI «${kpi}» es neutro (no hay un «mejor» ni un «peor»): no se puede dar un veredicto de comparación`);
  }
  const A = ordenarPorReplica(a, 'comparar (A)');
  const B = ordenarPorReplica(b, 'comparar (B)');
  if (A.length !== B.length) {
    throw new Error(`comparar: A tiene ${A.length} réplicas y B tiene ${B.length}; la comparación pareada necesita las mismas réplicas en las dos`);
  }
  const n = A.length;
  if (n < 2) throw new Error(`comparar: hacen falta al menos 2 réplicas pareadas y llegaron ${n}`);
  const z: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    if (A[i].semilla !== B[i].semilla || A[i].replica !== B[i].replica) {
      throw new Error(
        `comparar: la pareja ${i} no coincide: A es (semilla ${A[i].semilla}, réplica ${A[i].replica}) y B es (semilla ${B[i].semilla}, ` +
        `réplica ${B[i].replica}); la comparación pareada necesita la misma semilla y réplica`);
    }
    const va = A[i].kpi?.[kpi], vb = B[i].kpi?.[kpi];
    if (typeof va !== 'number' || !Number.isFinite(va) || typeof vb !== 'number' || !Number.isFinite(vb)) {
      throw new Error(`comparar: la réplica ${A[i].replica} no trae un valor finito de «${kpi}» en A (${String(va)}) o en B (${String(vb)})`);
    }
    z[i] = vb - va;
  }
  let suma = 0;
  for (let i = 0; i < n; i++) suma += z[i];
  const media = suma / n;
  let ss = 0;
  for (let i = 0; i < n; i++) { const d = z[i] - media; ss += d * d; }
  const semiancho = (cuantilT(confianza, n - 1) * Math.sqrt(ss / (n - 1))) / Math.sqrt(n);
  const ic: [number, number] = [media - semiancho, media + semiancho];
  const bajaSeguro = ic[1] < 0;    // B − A < 0 con seguridad
  const subeSeguro = ic[0] > 0;    // B − A > 0 con seguridad
  let veredicto: Comparacion['veredicto'] = 'no-se-distingue';
  if (sentido === 'menos') { if (bajaSeguro) veredicto = 'b-mejor'; else if (subeSeguro) veredicto = 'a-mejor'; }
  else { if (subeSeguro) veredicto = 'b-mejor'; else if (bajaSeguro) veredicto = 'a-mejor'; }
  let replicasSugeridas: number | null = null;
  if (veredicto === 'no-se-distingue' && media !== 0) {
    const razon = semiancho / (Math.abs(media) / 2);
    const bruto = n * razon * razon;
    replicasSugeridas = Math.ceil(bruto - 1e-9 * Math.max(1, bruto));   // la tolerancia evita que 80,00000000001 pida 81
  }
  return { kpi, n, pareada: true, media, ic, veredicto, replicasSugeridas };
}
