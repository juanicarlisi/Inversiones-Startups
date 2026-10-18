// Ayudas compartidas por las pruebas de experimentos/ (no es una prueba). Todo con semilla fija; nada depende del reloj.
import { readFileSync } from 'node:fs';
import { crearFuenteAzarReferencia, matNativa } from '../../contratos/referencia/motor-referencia.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { KPIS } from '../../contratos/resultados.ts';
import type { KpiId, ResultadoReplica } from '../../contratos/resultados.ts';
import type { Modelo, ModeloValidado, Variante } from '../../contratos/modelo.ts';
import type { Planificador, Simulador, Trabajo } from '../../contratos/experimentos.ts';
import type { Traza } from '../../contratos/traza.ts';

/** Generador de uniformes en (0, 1) con la referencia (Philox por dirección): secuencia fija para una semilla. */
export function generadorUniformes(semilla: number, clave = 7): () => number {
  const fuente = crearFuenteAzarReferencia(semilla, 0);
  let k = 0;
  return () => fuente.uniforme({ clave, a: k++, b: 0, c: 0 }, 0);
}
/** Exponencial de media `media` con la matemática de la referencia (en pruebas, Math.* está permitido a través de ella). */
export function exponencial(u: () => number, media = 1): number {
  return -media * matNativa.log(u());
}
/** Normal estándar (Box-Muller) con la referencia. */
export function normalEstandar(u: () => number): number {
  return matNativa.sqrt(-2 * matNativa.log(u())) * matNativa.cos(2 * Math.PI * u());
}

export function modeloEjemplo(): Modelo {
  return JSON.parse(readFileSync(new URL('../../contratos/ejemplos/hub-chico.json', import.meta.url), 'utf8')) as Modelo;
}
export function validadoEjemplo(): ModeloValidado {
  return validadoSinChequeos(modeloEjemplo());
}

/** Un ResultadoReplica completo con todos los KPI en 0 salvo los que se pasen. */
export function resultadoFalso(o: {
  semilla?: number; replica: number; modelo?: string; huella?: string; kpi?: Partial<Record<KpiId, number>>; alertas?: string[];
}): ResultadoReplica {
  const kpi = Object.fromEntries(KPIS.map((k) => [k, 0])) as Record<KpiId, number>;
  Object.assign(kpi, o.kpi ?? {});
  return {
    modelo: o.modelo ?? '0000000000000000',
    semilla: o.semilla ?? 1,
    replica: o.replica,
    huella: o.huella ?? `h${String(o.replica).padStart(15, '0')}`,
    kpi,
    porRecurso: { rampaRecibidos: [], rampaVueltas: [], rampaMinutosLlena: [], personaOcupadaPct: [], puestoInducidos: [] },
    series: { filaInduccionMax: [], clasificados: [] },
    alertas: o.alertas ?? [],
    eventos: 0,
  };
}

/** Puntero JSON mínimo (RFC 6901) y operación 'replace' sobre una copia profunda: suficiente para las variantes de las pruebas. */
export const varianteFalsa: Variante = async (mv, parche) => {
  const m = structuredClone(mv.modelo) as unknown as Record<string, unknown>;
  for (const op of parche) {
    if (op.op !== 'replace') throw new Error(`varianteFalsa solo implementa 'replace' y llegó '${op.op}'`);
    const partes = op.path.split('/').slice(1).map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
    let cursor: Record<string, unknown> = m;
    for (const p of partes.slice(0, -1)) cursor = cursor[p] as Record<string, unknown>;
    cursor[partes[partes.length - 1]] = op.value;
  }
  return validadoSinChequeos(m as unknown as Modelo);
};

/**
 * Simulador falso para la decisión del ejemplo: la probabilidad de «no perder el corte» depende del valor de la variable
 * (`puestosActivos`). Usa el uniforme de (semilla, réplica) SIN mirar el valor: con números comunes, a más probabilidad, más éxitos.
 */
export function simuladorPorValor(probabilidades: Record<number, number>): Simulador {
  return (mv, semilla, replica) => {
    const valor = mv.modelo.personas.induccion.puestosActivos;
    const p = probabilidades[valor];
    if (p === undefined) throw new Error(`simuladorPorValor: no hay probabilidad para puestosActivos = ${valor}`);
    const u = crearFuenteAzarReferencia(semilla, replica).uniforme({ clave: 99, a: 0, b: 0, c: 0 }, 0);
    return {
      resultado: resultadoFalso({
        semilla, replica, modelo: mv.huella, huella: `v${valor}r${replica}s${semilla}`,
        kpi: { pendientesAlCorte: u < p ? 0 : 3, costoNoche: 1000 * valor + 10 * u, paquetes: 100 },
      }),
    };
  };
}

/** Planificador de prueba que corre todo en el acto y en orden: aísla la lógica de la decisión del reparto entre trabajadores. */
export function planificadorSincrono(sim: Simulador, opciones: { alEnviar?: (t: Trabajo) => void } = {}): Planificador {
  return {
    trabajadores: 1,
    async enviar(t, alResultado) {
      opciones.alEnviar?.(t);
      for (let r = t.replicas[0]; r < t.replicas[1]; r++) {
        const salida = sim(t.mv, t.semilla, r, { traza: t.traza });
        alResultado(salida.resultado, salida.traza as Traza | undefined);
      }
      return { completadas: t.replicas[1] - t.replicas[0], cancelado: false };
    },
    cancelar() {},
    cancelarDesde() {},
    cerrar() {},
  };
}

/** Espera `ms` milisegundos reales (solo para dejar pasar mensajes pendientes; ninguna aserción depende de cuánto tarde). */
export function esperar(ms: number): Promise<void> {
  return new Promise((ok) => setTimeout(ok, ms));
}

/** Baraja determinista (Fisher-Yates con la fuente de la referencia). */
export function barajar<T>(xs: readonly T[], semilla: number): T[] {
  const u = generadorUniformes(semilla, 13);
  const v = [...xs];
  for (let i = v.length - 1; i > 0; i--) {
    const j = Math.floor(u() * (i + 1));
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
}

/** Espera (sondeando cada 1 ms) a que `cond()` sea verdadera; falla con un mensaje claro si pasan `limiteMs` sin que se cumpla. */
export async function esperarHasta(cond: () => boolean, que: string, limiteMs = 5000): Promise<void> {
  const t0 = ahoraMs();
  while (!cond()) {
    if (ahoraMs() - t0 > limiteMs) throw new Error(`se esperaba que ${que} y no ocurrió en ${limiteMs} ms`);
    await esperar(1);
  }
}
// Reloj solo para no colgarse esperando una condición (ninguna aserción depende de cuánto tarde); no es el reloj de pared.
function ahoraMs(): number {
  return Number(process.hrtime.bigint() / 1_000_000n);
}
