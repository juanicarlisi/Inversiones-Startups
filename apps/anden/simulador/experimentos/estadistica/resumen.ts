// experimentos/estadistica/resumen.ts · Andén simulador, corte 1, P5.
// Resumen de un KPI sobre réplicas independientes (media con IC de t, P50, P90 con IC) y proporciones con IC de Wilson.
// Regla de oro (diseno-maestro.md §7.10): NUNCA un intervalo sobre una sola corrida, y NUNCA agregar por orden de llegada:
// todas las funciones ordenan por índice de réplica antes de sumar, así el resultado es idéntico bit a bit cuando las
// réplicas llegan desordenadas o las corrieron 1 o 3 trabajadores (prueba R07).
import { KPIS } from '../../contratos/resultados.ts';
import type { KpiId, ResultadoReplica } from '../../contratos/resultados.ts';
import type { EstadoConfiguracion, Proporcion, Resumen } from '../../contratos/experimentos.ts';
import { cuantilT } from './t-student.ts';
import { estadoPorWilson, wilson } from './wilson.ts';
import { icPercentilOrdenado, ordenar, percentilOrdenado } from './percentiles.ts';

export function validarKpi(kpi: string): asserts kpi is KpiId {
  if (!(KPIS as readonly string[]).includes(kpi)) throw new Error(`KPI desconocido: «${kpi}» (se esperaba uno de KPIS)`);
}

/**
 * Copia ordenada por (réplica, semilla) y controlada: sin repeticiones (una réplica contada dos veces falsea el intervalo) y todas
 * del mismo modelo (mezclar modelos distintos en un resumen sería promediar peras con manzanas).
 */
export function ordenarPorReplica(rs: readonly ResultadoReplica[], quien = 'las réplicas'): ResultadoReplica[] {
  const orden = [...rs].sort((a, b) => a.replica - b.replica || a.semilla - b.semilla);
  for (let i = 1; i < orden.length; i++) {
    const p = orden[i - 1], q = orden[i];
    if (p.replica === q.replica && p.semilla === q.semilla) {
      throw new Error(`${quien}: la réplica ${q.replica} (semilla ${q.semilla}) aparece más de una vez; cada réplica se cuenta una sola vez`);
    }
    if (p.modelo !== q.modelo) {
      throw new Error(`${quien}: mezclan modelos distintos (${p.modelo} y ${q.modelo}); un resumen es de un solo modelo`);
    }
  }
  return orden;
}

function valoresDe(orden: readonly ResultadoReplica[], kpi: KpiId): number[] {
  return orden.map((r) => {
    const v = r.kpi?.[kpi];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`la réplica ${r.replica} no trae un valor finito para «${kpi}» (llegó ${String(v)})`);
    }
    return v;
  });
}

export type ResumenNumeros = Omit<Resumen, 'kpi'>;

/** Resumen de una lista de números YA ordenada por índice de réplica (el orden de suma es parte del resultado). */
export function resumirNumeros(xs: readonly number[], confianza: number): ResumenNumeros {
  const n = xs.length;
  if (n < 2) {
    throw new Error(`un intervalo necesita al menos 2 réplicas independientes y llegaron ${n}: con una sola corrida no hay intervalo`);
  }
  const t = cuantilT(confianza, n - 1);
  let suma = 0;
  for (let i = 0; i < n; i++) suma += xs[i];
  const media = suma / n;
  let ss = 0;
  for (let i = 0; i < n; i++) { const d = xs[i] - media; ss += d * d; }
  const desvio = Math.sqrt(ss / (n - 1));
  const semiancho = (t * desvio) / Math.sqrt(n);
  const orden = ordenar(xs);
  return {
    n, media, desvio, confianza,
    ic: [media - semiancho, media + semiancho],
    semiancho,
    p50: percentilOrdenado(orden, 0.5),
    p90: percentilOrdenado(orden, 0.9),
    icP90: icPercentilOrdenado(orden, 0.9, confianza),
    min: orden[0],
    max: orden[n - 1],
  };
}

/** Media con IC de t (n − 1 grados), desvío muestral, P50, P90 con su IC por estadísticos de orden, mínimo y máximo. */
export function resumir(rs: ResultadoReplica[], kpi: KpiId, confianza: number): Resumen {
  validarKpi(kpi);
  const orden = ordenarPorReplica(rs, `resumir(${kpi})`);
  return { kpi, ...resumirNumeros(valoresDe(orden, kpi), confianza) };
}

/** Proporción de réplicas en las que `kpi comparador umbral`, con IC de Wilson. */
export function proporcion(rs: ResultadoReplica[], kpi: KpiId, comparador: '<=' | '>=', umbral: number, confianza: number): Proporcion {
  validarKpi(kpi);
  if (comparador !== '<=' && comparador !== '>=') throw new Error(`comparador no admitido: se esperaba '<=' o '>=' y llegó '${String(comparador)}'`);
  if (!Number.isFinite(umbral)) throw new Error(`el umbral tiene que ser un número finito y llegó ${umbral}`);
  if (rs.length < 1) throw new Error('proporcion: se esperaba al menos una réplica');
  const orden = ordenarPorReplica(rs, `proporcion(${kpi})`);
  const valores = valoresDe(orden, kpi);
  let exitos = 0;
  for (const v of valores) if (comparador === '<=' ? v <= umbral : v >= umbral) exitos++;
  const n = valores.length;
  return { exitos, n, p: exitos / n, ic: wilson(exitos, n, confianza), metodo: 'wilson', confianza };
}

/** Estado de una configuración frente a la meta (probabilidad mínima) según su Wilson (§7). */
export function estadoConfiguracion(prop: Pick<Proporcion, 'ic'>, meta: number): EstadoConfiguracion {
  return estadoPorWilson(prop.ic, meta);
}
