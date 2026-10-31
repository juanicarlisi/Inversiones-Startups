// experimentos/estadistica/pareada.ts · Andén simulador, corte 1, P5.
// Comparación pareada con números aleatorios comunes (misma semilla y réplica en A y en B): Zᵢ = Bᵢ − Aᵢ.
// Contrato de honestidad (diseno-maestro.md §7.10.3): «A es mejor que B» solo si la prueba lo sostiene al nivel pedido.
//
// EL VEREDICTO YA NO SALE DEL IC DE t (hallazgo EST-02 de la revisión del 30-10-2026). Las diferencias del hub tienen colas muy pesadas:
// en 700 pares reales de hub-chico (puestos 3 → 4) la espera P90 tiene asimetría 11,9, mediana −1,24 y media +0,67 (17 noches con
// diferencias de 100 a 250 min). El «intervalo del 95%» de t cubría la media el 37–62% de las veces con 40 noches y daba «B es mejor»
// con signo contrario a la media real en 1 de cada 4 confirmaciones. Con colas así la media no se puede estimar con 40 ni con 100 noches.
// Ahora el veredicto es la PRUEBA DEL SIGNO exacta (binomial, sin suponer normalidad ni simetría; los empates no cuentan): «B es mejor»
// quiere decir que B fue mejor en más noches de las que el azar explica. La diferencia que se muestra es la MEDIANA de B − A (la noche
// típica) con su IC por estadísticos de orden (exacto para cualquier distribución); la media y su IC de t quedan en `media` e `ic` (los
// campos del contrato) como dato, y las noches atípicas (Iglewicz y Hoaglin: |0,6745·(Zᵢ − mediana) ÷ MAD| > 3,5) se cuentan aparte
// para avisar cuando unas pocas noches muy malas pueden dar vuelta el promedio.
import { META_KPI } from '../../contratos/resultados.ts';
import type { KpiId, ResultadoReplica } from '../../contratos/resultados.ts';
import type { Comparacion } from '../../contratos/experimentos.ts';
import { cuantilNormal, cuantilT } from './t-student.ts';
import { ordenarPorReplica, validarKpi } from './resumen.ts';
import { icPercentil } from './percentiles.ts';
import { binomial } from './secuencial.ts';

/** Umbral de Iglewicz y Hoaglin (1993) para una noche atípica: |0,6745·(Zᵢ − mediana) ÷ MAD| > 3,5. */
export const UMBRAL_ATIPICO = 3.5;
/** Poder con el que se estiman las noches que harían falta (`replicasSugeridas`): 80%, el habitual al planificar. */
export const PODER_SUGERIDO = 0.8;

/** La comparación pareada con lo que la vuelve robusta (los campos del contrato más estos). */
export interface ComparacionRobusta extends Comparacion {
  /** Qué decide el veredicto: la prueba del signo exacta sobre las noches no empatadas. */
  base: 'signo';
  confianza: number;
  /** Mediana de B − A (la noche típica) y su IC por estadísticos de orden (null con menos de 20 noches). */
  mediana: number;
  icMediana: [number, number] | null;
  /** Noches en que B dio menos que A, más que A, y lo mismo. */
  bMenor: number;
  bMayor: number;
  empates: number;
  /** p de la prueba del signo, a dos colas (exacto). */
  pValor: number;
  /** Asimetría de las diferencias (G₁ ajustada; 0 si no hay variación). */
  asimetria: number;
  /** Noches atípicas en que B fue mucho PEOR que A y mucho MEJOR, con la diferencia más grande de cada lado (en la unidad del KPI). */
  atipicos: { peorB: number; mejorB: number; maxPeor: number; maxMejor: number };
}

/** p exacto de la prueba del signo a dos colas: 2·P(X ≤ min(menos, mas)), X ~ Binomial(menos + mas, ½), tope 1. */
export function pruebaDelSigno(menos: number, mas: number): number {
  const m = menos + mas;
  if (m === 0) return 1;
  const b = binomial(m, 0.5), x = Math.min(menos, mas);
  let cola = 0;
  for (let k = 0; k <= x; k++) cola += b[k];
  return Math.min(1, 2 * cola);
}

/** ¿Tiene sentido hablar de «mejor» y «peor» para este KPI? (los neutros, como paquetes o utilización, no). */
export function tieneSentido(kpi: KpiId): boolean {
  return META_KPI[kpi].mejor !== 'neutro';
}

/**
 * Compara B contra A, pareado por (semilla, réplica). Las listas pueden venir en cualquier orden (se ordenan por réplica);
 * lanza si no son las mismas réplicas con las mismas semillas, si hay menos de 2, o si el KPI es neutro (no tiene un «mejor»:
 * dar un veredicto sería inventar un criterio; para ver la diferencia de un KPI neutro se usa `resumir` sobre las diferencias).
 */
export function comparar(a: ResultadoReplica[], b: ResultadoReplica[], kpi: KpiId, confianza: number): ComparacionRobusta {
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
  // la media y su IC de t (los campos del contrato: un dato, ya no el que decide)
  let suma = 0;
  for (let i = 0; i < n; i++) suma += z[i];
  const media = suma / n;
  let ss = 0, s3 = 0;
  for (let i = 0; i < n; i++) { const d = z[i] - media; ss += d * d; s3 += d * d * d; }
  const sd = Math.sqrt(ss / (n - 1));
  const semiancho = (cuantilT(confianza, n - 1) * sd) / Math.sqrt(n);
  const ic: [number, number] = [media - semiancho, media + semiancho];
  // asimetría G₁ (ajustada por el tamaño de la muestra)
  const m2 = ss / n, m3 = s3 / n;
  const asimetria = n > 2 && m2 > 0 ? ((m3 / (m2 * Math.sqrt(m2))) * Math.sqrt(n * (n - 1))) / (n - 2) : 0;
  // la noche típica: mediana con su IC por rangos (exacto para cualquier distribución)
  const orden = Float64Array.from(z).sort();
  const mediana = n % 2 === 1 ? orden[(n - 1) / 2] : 0.5 * (orden[n / 2 - 1] + orden[n / 2]);
  const icMediana = icPercentil(z, 0.5, confianza);
  // la prueba del signo: ¿en cuántas noches B dio menos y en cuántas más?
  let bMenor = 0, bMayor = 0;
  for (let i = 0; i < n; i++) { if (z[i] < 0) bMenor++; else if (z[i] > 0) bMayor++; }
  const empates = n - bMenor - bMayor;
  const pValor = pruebaDelSigno(bMenor, bMayor);
  let veredicto: Comparacion['veredicto'] = 'no-se-distingue';
  if (pValor <= 1 - confianza + 1e-12) {
    const bBaja = bMenor > bMayor;
    veredicto = (sentido === 'menos') === bBaja ? 'b-mejor' : 'a-mejor';
  }
  // noches atípicas (Iglewicz y Hoaglin), con la MAD; si la MAD es 0 (muchos empates), con la desviación media absoluta
  const desv = Float64Array.from(z, (x) => Math.abs(x - mediana)).sort();
  const mad = n % 2 === 1 ? desv[(n - 1) / 2] : 0.5 * (desv[n / 2 - 1] + desv[n / 2]);
  let escala = mad / 0.6745;
  if (!(escala > 0)) { let sa = 0; for (let i = 0; i < n; i++) sa += desv[i]; escala = (1.2533 * sa) / n; }
  const atipicos = { peorB: 0, mejorB: 0, maxPeor: 0, maxMejor: 0 };
  if (escala > 0) {
    for (let i = 0; i < n; i++) {
      if (Math.abs(z[i] - mediana) / escala <= UMBRAL_ATIPICO) continue;
      const peor = sentido === 'menos' ? z[i] > mediana : z[i] < mediana;
      if (peor) { atipicos.peorB++; if (Math.abs(z[i]) > Math.abs(atipicos.maxPeor)) atipicos.maxPeor = z[i]; }
      else { atipicos.mejorB++; if (Math.abs(z[i]) > Math.abs(atipicos.maxMejor)) atipicos.maxMejor = z[i]; }
    }
  }
  // noches que harían falta para ver con la prueba del signo un desbalance como el observado, con 80% de poder (aproximación normal)
  let replicasSugeridas: number | null = null;
  const noEmpatadas = bMenor + bMayor;
  if (veredicto === 'no-se-distingue' && noEmpatadas > 0 && bMenor !== bMayor) {
    const q = Math.max(bMenor, bMayor) / noEmpatadas, zA = cuantilNormal(confianza), zB = 0.8416212335729143; // Φ⁻¹(0,8)
    const raiz = (zA * 0.5 + zB * Math.sqrt(q * (1 - q))) / (q - 0.5), necesarias = raiz * raiz;
    const bruto = necesarias / (noEmpatadas / n);
    replicasSugeridas = Math.max(n + 1, Math.ceil(bruto - 1e-9 * Math.max(1, bruto)));
  }
  return {
    kpi, n, pareada: true, media, ic, veredicto, replicasSugeridas,
    base: 'signo', confianza, mediana, icMediana, bMenor, bMayor, empates, pValor, asimetria, atipicos,
  };
}
